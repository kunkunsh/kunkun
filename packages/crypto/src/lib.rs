use rsa::pkcs1v15::{Signature, SigningKey, VerifyingKey};
use rsa::signature::{Keypair, RandomizedSigner, SignatureEncoding, Verifier};
use rsa::{
    pkcs1::{EncodeRsaPrivateKey, EncodeRsaPublicKey},
    RsaPrivateKey, RsaPublicKey,
};
use rsa::{sha2::Sha256, Oaep, Pkcs1v15Encrypt};

struct RsaKeyPair {
    pub priv_key: RsaPrivateKey,
    pub pub_key: RsaPublicKey,
}

impl RsaKeyPair {
    pub fn new(bits: usize) -> Self {
        let mut rng = rand::thread_rng();
        let priv_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
        let pub_key = RsaPublicKey::from(&priv_key);
        Self { priv_key, pub_key }
    }

    pub fn get_key_pem(&self) -> (String, String) {
        let private_key_pem = self
            .priv_key
            .to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)
            .expect("failed to get private key pem");
        let public_key_pem = self
            .pub_key
            .to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)
            .expect("failed to get public key pem");
        (private_key_pem.to_string(), public_key_pem.to_string())
    }

    pub fn encrypt(&self, message: &[u8]) -> Vec<u8> {
        let mut rng = rand::thread_rng();
        self.pub_key
            .encrypt(&mut rng, Pkcs1v15Encrypt, message)
            .expect("failed to encrypt")
    }

    pub fn encrypt_from_str(&self, message: String) -> Vec<u8> {
        self.encrypt(message.as_bytes())
    }

    pub fn decrypt(&self, encrypted: &[u8]) -> Vec<u8> {
        self.priv_key
            .decrypt(Pkcs1v15Encrypt, encrypted)
            .expect("failed to decrypt")
    }

    pub fn decrypt_to_str(&self, encrypted: &[u8]) -> anyhow::Result<String> {
        let decrypted = self.decrypt(encrypted);
        String::from_utf8(decrypted).map_err(|_| anyhow::anyhow!("failed to decrypt to string"))
    }

    pub fn sign(&self, message: &[u8]) -> Signature {
        let mut rng = rand::thread_rng();
        let signing_key = SigningKey::<Sha256>::new(self.priv_key.clone());
        signing_key.sign_with_rng(&mut rng, message)
    }

    pub fn verify(&self, message: &[u8], signature: &Signature) -> bool {
        let verifying_key = VerifyingKey::<Sha256>::new(self.pub_key.clone());
        verifying_key.verify(message, signature).is_ok()
    }
}

#[cfg(test)]
mod tests {
    use rsa::pkcs1::EncodeRsaPrivateKey;

    use super::*;

    #[test]
    fn test_generate_rsa_key_pair() {
        let keypair = RsaKeyPair::new(2048);
        let (priv_key, pub_key) = keypair.get_key_pem();
    }

    #[test]
    fn test_encrypt_decrypt() {
        let key_pair = RsaKeyPair::new(2048);
        let message = "hello world";
        // binary
        let encrypted = key_pair.encrypt(message.as_bytes());
        let decrypted = key_pair.decrypt(&encrypted);
        assert_eq!(message.as_bytes(), decrypted);

        // string
        let encrypted = key_pair.encrypt_from_str(message.to_string());
        let decrypted = key_pair.decrypt_to_str(&encrypted).unwrap();
        assert_eq!(message, decrypted);
    }

    #[test]
    fn test_sign_verify() {
        let key_pair = RsaKeyPair::new(2048);
        let message = "hello world";
        let signature = key_pair.sign(message.as_bytes());
        assert!(key_pair.verify(message.as_bytes(), &signature));
    }
}
