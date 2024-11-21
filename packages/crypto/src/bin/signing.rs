use ring::signature::{Ed25519KeyPair, KeyPair, Signature, UnparsedPublicKey};

fn main() {
    // Generate a key pair
    let rng = ring::rand::SystemRandom::new();
    let key_pair = Ed25519KeyPair::generate_pkcs8(&rng).unwrap();
    let key_pair = Ed25519KeyPair::from_pkcs8(key_pair.as_ref()).unwrap();

    // Message to sign
    let message = b"Hello, world!";

    // Sign the message
    let signature = key_pair.sign(message);
    println!("Signature: {:?}", signature.as_ref());

    // Verify the signature
    let public_key = key_pair.public_key().as_ref();
    let verification_key = UnparsedPublicKey::new(&ring::signature::ED25519, public_key);
    verification_key
        .verify(message, signature.as_ref())
        .unwrap();

    println!("Signature is valid!");
}
