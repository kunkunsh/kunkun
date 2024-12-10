use tonic::transport::{Certificate, Channel, ClientTlsConfig};

/// given a self signed cert, return a grpc channel that trusts the cert
/// The domain name trusted is hard coded to localhost
pub async fn get_grpc_tls_channel(ip: &str, port: u16, cert_pem: &str) -> anyhow::Result<Channel> {
    let ca = Certificate::from_pem(cert_pem);
    let tls = ClientTlsConfig::new()
        .ca_certificate(ca)
        .domain_name("localhost");
    let url = format!("https://{}:{}", ip, port);
    Ok(Channel::from_shared(url)
        .unwrap()
        .tls_config(tls)?
        .connect()
        .await?)
}

// this implementation is failing
// pub async fn get_grpc_tls_client<T, C>(
//     ip: &str,
//     port: u16,
//     cert_pem: &str
// ) -> anyhow::Result<T>
// where
//     T: From<tonic::transport::Channel>,
//     T: tonic::client::GrpcService<C>,
//     C: Default,
// {
//     let channel = get_grpc_tls_channel(ip, port, cert_pem).await?;
//     Ok(T::from(channel))
// }
