use rustls::{ClientConfig, RootCertStore};
use std::sync::Arc;
use tauri_plugin_jarvis::server::grpc::kunkun::kunkun::{
    kunkun_client::KunkunClient, Empty, ServerInfoResponse,
};
use tonic::transport::{Channel, ClientTlsConfig};

#[tokio::main]
async fn main() {
    // Create custom TLS config that accepts all certificates
    // let mut roots = RootCertStore::empty();
    // let mut tls_config = ClientTlsConfig::new();
    // tls_config.
    // //     .domain_name("localhost");

    // // let tls = ClientConfig::builder()
    // //     .with_root_certificates(roots)
    // //     .with_no_client_auth();

    // let channel = Channel::from_static("https://localhost:9559")
    //     .tls_config(tls)
    //     .unwrap()
    //     .connect()
    //     .await
    //     .unwrap();

    // let mut client = KunkunClient::new(channel);
    // let response: tonic::Response<ServerInfoResponse> = client.server_info(Empty {}).await.unwrap();

    // let server_info = response.into_inner();
    // let public_key = server_info.public_key;
    // let ssl_cert = server_info.ssl_cert;
    // println!("public_key: {}", public_key);
    // println!("ssl_cert: {}", ssl_cert);
}
