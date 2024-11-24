use openssl::{
    hash::MessageDigest,
    pkey::{PKey, Private, Public},
    rsa::Rsa,
    sign::{Signer, Verifier},
};

use crate::types::Signature;

pub struct RsaCrypto {}

impl RsaCrypto {
    pub fn generate_rsa() -> anyhow::Result<Rsa<Private>> {
        Rsa::generate(2048).map_err(anyhow::Error::from)
    }

    pub fn generate_rsa_key_pair_pem() -> anyhow::Result<(Vec<u8>, Vec<u8>)> {
        let rsa = Rsa::generate(2048)?;
        let private_pem = rsa.private_key_to_pem()?;
        let public_pem = rsa.public_key_to_pem()?;
        Ok((private_pem, public_pem))
    }

    pub fn private_key_from_pem(pem: &[u8]) -> anyhow::Result<Rsa<Private>> {
        Rsa::private_key_from_pem(pem).map_err(anyhow::Error::from)
    }

    pub fn public_key_from_pem(pem: &[u8]) -> anyhow::Result<Rsa<Public>> {
        Rsa::public_key_from_pem(pem).map_err(anyhow::Error::from)
    }

    pub fn encrypt_message(public_key: &Rsa<Public>, message: &[u8]) -> anyhow::Result<Vec<u8>> {
        let mut encrypted = vec![0; public_key.size() as usize];
        public_key.public_encrypt(message, &mut encrypted, openssl::rsa::Padding::PKCS1)?;
        Ok(encrypted)
    }

    pub fn decrypt_message(
        private_key: &Rsa<Private>,
        encrypted: &[u8],
    ) -> anyhow::Result<Vec<u8>> {
        let mut decrypted = vec![0; private_key.size() as usize];
        private_key.private_decrypt(encrypted, &mut decrypted, openssl::rsa::Padding::PKCS1)?;
        Ok(decrypted)
    }
    pub fn sign(private_key: &Rsa<Private>, message: &[u8]) -> anyhow::Result<Vec<u8>> {
        let pkey = PKey::from_rsa(private_key.clone())?;
        let mut signer = Signer::new(MessageDigest::sha256(), &pkey)?;
        signer.update(message)?;
        let signature = signer.sign_to_vec()?;
        Ok(signature)
    }

    pub fn verify(
        public_key: &Rsa<Public>,
        message: &[u8],
        signature: &[u8],
    ) -> anyhow::Result<bool> {
        let pkey = PKey::from_rsa(public_key.clone())?;
        let mut verifier = Verifier::new(MessageDigest::sha256(), &pkey)?;
        verifier.update(message)?;
        Ok(verifier.verify(&signature)?)
    }
}

impl Signature for RsaCrypto {
    fn sign_with_pem(private_pem: &[u8], message: &[u8]) -> anyhow::Result<Vec<u8>> {
        let private_key = RsaCrypto::private_key_from_pem(private_pem)?;
        RsaCrypto::sign(&private_key, message)
    }

    fn verify_with_pem(
        public_pem: &[u8],
        message: &[u8],
        signature: &[u8],
    ) -> anyhow::Result<bool> {
        let public_key = RsaCrypto::public_key_from_pem(public_pem)?;
        RsaCrypto::verify(&public_key, message, signature)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let rsa = RsaCrypto::generate_rsa().unwrap();

        let public_key = rsa.public_key_to_pem().unwrap();
        let private_key = rsa.private_key_to_pem().unwrap();
        let public_rsa = RsaCrypto::public_key_from_pem(&public_key).unwrap();
        let private_rsa = RsaCrypto::private_key_from_pem(&private_key).unwrap();

        let encrypted = RsaCrypto::encrypt_message(&public_rsa, b"hello world").unwrap();
        let decrypted = RsaCrypto::decrypt_message(&private_rsa, &encrypted).unwrap();
        assert_eq!(b"hello world", &decrypted[..11]);
    }

    #[test]
    fn test_rsa_sign_verify() {
        let (private_pem, public_pem) = RsaCrypto::generate_rsa_key_pair_pem().unwrap();
        let message = b"hello world";
        let private_key = RsaCrypto::private_key_from_pem(&private_pem).unwrap();
        let public_key = RsaCrypto::public_key_from_pem(&public_pem).unwrap();
        let signature = RsaCrypto::sign(&private_key, message).unwrap();
        let verified = RsaCrypto::verify(&public_key, message, &signature).unwrap();
        assert!(verified);
        assert!(!RsaCrypto::verify(&public_key, b"hello world2", &signature).unwrap());
    }

    #[test]
    fn test_rsa_sign_verify_with_pem() {
        let (private_pem, public_pem) = RsaCrypto::generate_rsa_key_pair_pem().unwrap();
        let message = b"hello world";
        let signature = RsaCrypto::sign_with_pem(&private_pem, message).unwrap();
        let verified = RsaCrypto::verify_with_pem(&public_pem, message, &signature).unwrap();
        assert!(verified);
    }
}
