use aes::cipher::{BlockDecryptMut, BlockEncryptMut, KeyIvInit};
use block_padding::Pkcs7;
use cbc::Decryptor as CbcDec;
use cbc::Encryptor as CbcEnc;
type Aes256CbcEnc = CbcEnc<aes::Aes256>;
type Aes256CbcDec = CbcDec<aes::Aes256>;

pub struct Aes256Cbc {
    encryptor: Aes256CbcEnc,
    decryptor: Aes256CbcDec,
}

impl Aes256Cbc {
    pub fn new(key: [u8; 32], iv: [u8; 16]) -> Self {
        Self {
            encryptor: Aes256CbcEnc::new(&key.into(), &iv.into()),
            decryptor: Aes256CbcDec::new(&key.into(), &iv.into()),
        }
    }

    pub fn encrypt(&self, data: &[u8]) -> Vec<u8> {
        self.encryptor.clone().encrypt_padded_vec_mut::<Pkcs7>(data)
    }

    pub fn decrypt(&self, data: &[u8]) -> Vec<u8> {
        // let mut buf = data.to_vec();
        self.decryptor
            .clone()
            .decrypt_padded_vec_mut::<Pkcs7>(data)
            .unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let aes = Aes256Cbc::new([0; 32], [0; 16]);
        let encrypted = aes.encrypt(b"kunkun");
        let decrypted = aes.decrypt(&encrypted);
        assert_eq!(decrypted, b"kunkun");
    }

    #[test]
    fn test_encrypt_huge_chunk_data() {
        let aes = Aes256Cbc::new([0; 32], [0; 16]);
        let data = vec![0; 1024 * 1024];
        let encrypted = aes.encrypt(&data);
        let decrypted = aes.decrypt(&encrypted);
        assert_eq!(decrypted, data);
    }
}
