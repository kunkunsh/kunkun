//! This module provides simplified cryptographic interface for Kunkun.
//!
//! Features include
//! - RSA (generation/sign/verify/encrypt/decrypt)
//! - Ed25519 (generation/sign/verify).
//! - SSL/TLS (self-signed certificate generation).

pub mod aes;
pub mod ed25519;
pub mod rsa;
pub mod ssl;
pub mod types;

pub use ed25519::Ed25519Crypto;
pub use rsa::RsaCrypto;
pub use ssl::generate_self_signed_certificate;
pub use types::Signature;
