// use crypto::{Ed25519Crypto, Signature};
// use openssl::pkey::PKey;
// use openssl::rsa::{Padding, Rsa};
// use std::str;

// fn main() {
//     let (private_pem, public_pem) = Ed25519Crypto::generate_key_pair_pem().unwrap();
//     let message = b"hello world";
//     let signature = Ed25519Crypto::sign(&private_pem, message);
//     println!("Signature: {:?}", signature);
// }

use openssl::pkey::PKey;
use openssl::sign::{Signer, Verifier};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Generate an Ed25519 private key
    let private_key = PKey::generate_ed25519()?;

    // The message to sign
    let message = b"Hello, this is a test message!";

    // Create a signer using the private key
    let mut signer = Signer::new_without_digest(&private_key)?;

    // Sign the message directly (no need to call update)
    let signature = signer.sign_oneshot_to_vec(message)?;

    println!("Message: {:?}", String::from_utf8_lossy(message));
    println!("Signature: {:?}", signature);
    // verify the signature
    let mut verifier = Verifier::new_without_digest(&private_key)?;
    verifier.update(message)?;
    verifier.verify(&signature)?;
    println!("Signature verified successfully!");
    Ok(())
}
