pub trait Signature {
    fn sign_with_pem(private_pem: &[u8], message: &[u8]) -> anyhow::Result<Vec<u8>>;
    fn verify_with_pem(public_pem: &[u8], message: &[u8], signature: &[u8])
        -> anyhow::Result<bool>;
}
