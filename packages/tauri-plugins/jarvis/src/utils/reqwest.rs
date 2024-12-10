/// Build a reqwest client with SSL certificate verification.
pub fn build_ssl_reqwest_client(
    skip_ssl_cert_check: Option<bool>,
    trust_ssl_cert: Option<String>,
) -> anyhow::Result<reqwest::Client> {
    let mut client_builder = reqwest::Client::builder();
    if skip_ssl_cert_check.unwrap_or(false) {
        client_builder = client_builder.danger_accept_invalid_certs(true);
    }
    if let Some(cert) = match trust_ssl_cert {
        Some(cert) => reqwest::tls::Certificate::from_pem(cert.as_bytes()).ok(),
        None => None,
    } {
        client_builder = client_builder.add_root_certificate(cert);
    }
    client_builder.build().map_err(Into::into)
}
