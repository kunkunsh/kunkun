//! ed25519 is a cryptographic signature algorithm.
//! It cannot be used for encryption, only for signing and verifying.
//!
//! For example, ed25519 is commonly used as SSH key.
//! When ssh login starts, the private key is used to sign a challenge message.
//! The server verifies the signature of the public key.

use openssl::{
    pkey::{PKey, Private, Public},
    sign::{Signer, Verifier},
};

use crate::types::Signature;

pub struct Ed25519Crypto {}

impl Ed25519Crypto {
    pub fn generate_key() -> anyhow::Result<PKey<Private>> {
        PKey::generate_ed25519().map_err(anyhow::Error::from)
    }

    pub fn generate_key_pair_pem() -> anyhow::Result<(Vec<u8>, Vec<u8>)> {
        let private_key = PKey::generate_ed25519()?;
        let private_pem = private_key.private_key_to_pem_pkcs8()?;
        let public_pem = private_key.public_key_to_pem()?;
        Ok((private_pem, public_pem))
    }

    pub fn private_key_from_pem(pem: &[u8]) -> anyhow::Result<PKey<Private>> {
        PKey::private_key_from_pem(pem).map_err(anyhow::Error::from)
    }

    pub fn public_key_from_pem(pem: &[u8]) -> anyhow::Result<PKey<Public>> {
        PKey::public_key_from_pem(pem).map_err(anyhow::Error::from)
    }

    pub fn sign(private_key: &PKey<Private>, message: &[u8]) -> anyhow::Result<Vec<u8>> {
        let mut signer = Signer::new_without_digest(&private_key)?;
        Ok(signer.sign_oneshot_to_vec(message)?)
    }

    pub fn verify(
        public_key: &PKey<Public>,
        message: &[u8],
        signature: &[u8],
    ) -> anyhow::Result<bool> {
        let mut verifier = Verifier::new_without_digest(public_key)?;
        Ok(verifier.verify_oneshot(&signature, message)?)
    }
}

impl Signature for Ed25519Crypto {
    fn sign_with_pem(private_pem: &[u8], message: &[u8]) -> anyhow::Result<Vec<u8>> {
        let private_key = Ed25519Crypto::private_key_from_pem(private_pem)?;
        Ed25519Crypto::sign(&private_key, message)
    }

    fn verify_with_pem(
        public_pem: &[u8],
        message: &[u8],
        signature: &[u8],
    ) -> anyhow::Result<bool> {
        let public_key = Ed25519Crypto::public_key_from_pem(public_pem)?;
        Ed25519Crypto::verify(&public_key, message, signature)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ed25519_sign_verify() {
        let (private_pem, public_pem) = Ed25519Crypto::generate_key_pair_pem().unwrap();
        let message = b"hello world";
        let private_key = Ed25519Crypto::private_key_from_pem(&private_pem).unwrap();
        let public_key = Ed25519Crypto::public_key_from_pem(&public_pem).unwrap();
        let signature = Ed25519Crypto::sign(&private_key, message).unwrap();
        let verified = Ed25519Crypto::verify(&public_key, message, &signature).unwrap();
        assert!(verified);
        assert!(!Ed25519Crypto::verify(&public_key, b"hello world2", &signature).unwrap());
    }

    #[test]
    fn test_ed25519_sign_verify_with_pem() {
        let (private_pem, public_pem) = Ed25519Crypto::generate_key_pair_pem().unwrap();
        let message = b"hello world";
        let signature = Ed25519Crypto::sign_with_pem(&private_pem, message).unwrap();
        let verified = Ed25519Crypto::verify_with_pem(&public_pem, message, &signature).unwrap();
        assert!(verified);
    }
}
