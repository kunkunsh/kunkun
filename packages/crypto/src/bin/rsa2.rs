use rand::rngs::OsRng;
use rsa::{
    pkcs1::{EncodeRsaPrivateKey, EncodeRsaPublicKey},
    RsaPrivateKey, RsaPublicKey,
};
use std::fs::File;
use std::io::Write;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Generate the key pair
    let mut rng = OsRng;
    let bits = 2048; // Adjust as needed
    let private_key = RsaPrivateKey::new(&mut rng, bits)?;
    let public_key = RsaPublicKey::from(&private_key);

    // Convert private key to PEM format
    let private_key_pem = private_key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)?;
    let public_key_pem = public_key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)?;

    // Save private key to file
    let mut priv_file = File::create("private_key.pem")?;
    priv_file.write_all(private_key_pem.as_bytes())?;

    // Save public key to file
    let mut pub_file = File::create("public_key.pem")?;
    pub_file.write_all(public_key_pem.as_bytes())?;

    println!("Keys generated and saved to disk.");
    Ok(())
}
