use openssl::rsa::Rsa;
use openssl::symm::Cipher;

fn main() {
    // Generate a 2048-bit RSA key pair
    let rsa = Rsa::generate(2048).unwrap();

    // Message to encrypt
    let message = b"Secret message";

    // Encrypt the message with the public key
    let mut encrypted = vec![0; rsa.size() as usize];
    rsa.public_encrypt(message, &mut encrypted, openssl::rsa::Padding::PKCS1)
        .unwrap();
    println!("Encrypted: {:?}", encrypted);

    // Decrypt the message with the private key
    let mut decrypted = vec![0; rsa.size() as usize];
    let len = rsa
        .private_decrypt(&encrypted, &mut decrypted, openssl::rsa::Padding::PKCS1)
        .unwrap();
    decrypted.truncate(len);
    println!("Decrypted: {}", String::from_utf8_lossy(&decrypted));

    // Message to sign
    let message = b"Message to sign";

    // Create signature using private key
    let mut signature = vec![0; rsa.size() as usize];
    let sig_len = rsa
        .private_encrypt(
            message,
            &mut signature,
            openssl::rsa::Padding::PKCS1,
        )
        .unwrap();
    signature.truncate(sig_len);
    println!("Signature: {:?}", signature);

    // Verify signature using public key
    let mut verified = vec![0; rsa.size() as usize];
    let verify_len = rsa
        .public_decrypt(
            &signature,
            &mut verified,
            openssl::rsa::Padding::PKCS1,
        )
        .unwrap();
    verified.truncate(verify_len);

    assert_eq!(message, &verified[..]);
    println!("Signature verified successfully!");
}
