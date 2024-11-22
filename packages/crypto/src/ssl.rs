use openssl::{
    hash::MessageDigest,
    pkey::{PKey, Private},
    rsa::Rsa,
    x509::{extension::SubjectAlternativeName, X509NameBuilder, X509},
};

pub fn generate_self_signed_certificate(
    rsa: &Rsa<Private>,
    days: u32,
) -> anyhow::Result<(Vec<u8>, Vec<u8>)> {
    let private_key = PKey::from_rsa(rsa.to_owned())?;
    let mut x509_name_builder = X509NameBuilder::new()?;
    x509_name_builder.append_entry_by_text("C", "US")?; // Country
    x509_name_builder.append_entry_by_text("ST", "Localhost")?; // State/Province
    x509_name_builder.append_entry_by_text("L", "Localhost")?; // Locality
    x509_name_builder.append_entry_by_text("O", "Localhost Development")?; // Organization
    x509_name_builder.append_entry_by_text("CN", "localhost")?; // Common Name
    let x509_name = x509_name_builder.build();
    let mut builder = X509::builder()?;
    builder.set_version(2)?; // X.509 v3
    builder.set_subject_name(&x509_name)?;
    builder.set_issuer_name(&x509_name)?; // Self-signed
    builder.set_pubkey(&private_key)?;

    // Set certificate validity
    let not_before = openssl::asn1::Asn1Time::days_from_now(0)?; // Start now
    let not_after = openssl::asn1::Asn1Time::days_from_now(days)?; // Valid for 1 year
    builder.set_not_before(&not_before)?;
    builder.set_not_after(&not_after)?;

    // Add Subject Alternative Name (SAN) for localhost
    let subject_alt_name = SubjectAlternativeName::new()
        .dns("localhost") // Ensures the certificate is valid for "localhost"
        .build(&builder.x509v3_context(None, None))?;
    builder.append_extension(subject_alt_name)?;
    builder.sign(&private_key, MessageDigest::sha256())?;
    let x509 = builder.build();
    let private_key_pem = private_key.private_key_to_pem_pkcs8()?;
    let certificate_pem = x509.to_pem()?;
    Ok((private_key_pem, certificate_pem))
}

#[cfg(test)]
mod tests {
    use axum::{routing::get, Router};
    use axum_server::tls_rustls::RustlsConfig;
    use reqwest;
    use std::{net::SocketAddr, time::Duration};

    use super::*;

    #[tokio::test]
    async fn test_generate_self_signed_certificate() -> anyhow::Result<()> {
        let rsa = Rsa::generate(2048)?;
        let (private_key_pem, certificate_pem) = generate_self_signed_certificate(&rsa, 365)?;
        let config = RustlsConfig::from_pem(certificate_pem, private_key_pem)
            .await
            .unwrap();
        async fn handler() -> &'static str {
            "Hello, World!"
        }

        let handle = axum_server::Handle::new();
        let app = Router::new().route("/", get(handler));

        // run https server
        let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
        let server = axum_server::bind_rustls(addr, config)
            .handle(handle.clone())
            .serve(app.into_make_service());

        let server_handle = tokio::spawn(server);
        // send a request to server, trust the certificate
        let client = reqwest::Client::builder()
            .danger_accept_invalid_certs(true)
            .build()?;
        let response = client.get("https://localhost:8080").send().await?;
        assert_eq!(response.status().is_success(), true);
        // read the response body
        let body = response.text().await?;
        assert_eq!(body, "Hello, World!");
        println!("shutting down server");
        handle.graceful_shutdown(Some(Duration::from_secs(10)));
        println!("server shutdown");
        server_handle.abort();
        Ok(())
    }
}
