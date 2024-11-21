use rsa::pkcs1v15::{SigningKey, VerifyingKey};
use rsa::signature::{Keypair, RandomizedSigner, SignatureEncoding, Verifier};
use rsa::{sha2::Sha256, Oaep, Pkcs1v15Encrypt, RsaPrivateKey, RsaPublicKey};

fn main() {
    let mut rng = rand::thread_rng();
    let bits = 2048;
    let priv_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
    let pub_key = RsaPublicKey::from(&priv_key);

    // print the keys as utf-8
    // save key as string to file
    // let priv_key_str = priv_key.to_string().unwrap();
    // std::fs::write("priv_key.txt", priv_key_str).expect("failed to write file");

    let padding = Oaep::new::<Sha256>();
    // Encrypt
    let data = b"hello world";
    let enc_data = pub_key
        .encrypt(&mut rng, padding, &data[..])
        .expect("failed to encrypt");
    assert_ne!(&data[..], &enc_data[..]);

    // Decrypt
    let padding = Oaep::new::<Sha256>();
    let dec_data = priv_key
        .decrypt(padding, &enc_data)
        .expect("failed to decrypt");
    assert_eq!(&data[..], &dec_data[..]);

    // Message to sign
    // Note: VerifyingKey can also be created directly from the public key:
    let signing_key = SigningKey::<Sha256>::new(priv_key);
    let verifying_key = VerifyingKey::<Sha256>::new(pub_key);
    // let verifying_key = signing_key.verifying_key();

    // Sign
    let data = b"hello world";
    let signature = signing_key.sign_with_rng(&mut rng, data);
    assert_ne!(signature.to_bytes().as_ref(), data.as_slice());

    // Verify
    verifying_key
        .verify(data, &signature)
        .expect("failed to verify");
}
