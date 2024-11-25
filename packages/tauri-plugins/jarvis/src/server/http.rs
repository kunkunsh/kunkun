use super::grpc::{
    file_transfer::file_transfer::file_transfer_server::FileTransferServer,
    server_info::server_info::server_info_server::ServerInfoServer,
};
use super::model::ServerState;
use super::Protocol;
use crate::server::grpc::file_transfer::MyFileTransfer;
use crate::server::grpc::server_info::MyServerInfo;
use crate::server::tls::{CERT_PEM, KEY_PEM};
use crate::utils::path::get_default_extensions_dir;
use axum::http::{HeaderValue, Method, StatusCode, Uri};
use axum::routing::{get, get_service, post};
use axum_server::tls_rustls::RustlsConfig;
use base64::prelude::*;
/// This module is responsible for controlling the main server
use obfstr::obfstr as s;
use std::sync::Mutex;
use std::{net::SocketAddr, path::PathBuf, sync::Arc};
use tauri::AppHandle;
use tonic::transport::Server as TonicServer;
use tower_http::{cors::CorsLayer, services::ServeDir};

struct ServerOptions {}

async fn start_server(
    protocol: Protocol,
    server_addr: SocketAddr,
    app_handle: AppHandle,
    shtdown_handle: axum_server::Handle,
    options: ServerOptions,
) -> Result<(), Box<dyn std::error::Error>> {
    let server_state = ServerState {
        app_handle: app_handle.clone(),
    };
    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(
            super::grpc::server_info::server_info::FILE_DESCRIPTOR_SET,
        )
        .register_encoded_file_descriptor_set(
            super::grpc::file_transfer::file_transfer::FILE_DESCRIPTOR_SET,
        )
        .build()
        .unwrap();
    let file_transfer = MyFileTransfer {
        app_handle: app_handle.clone(),
    };
    let server_info = MyServerInfo {
        app_handle: app_handle.clone(),
    };
    let grpc_router = TonicServer::builder()
        .add_service(reflection_service)
        .add_service(ServerInfoServer::new(server_info))
        .add_service(FileTransferServer::new(file_transfer))
        .into_router();
    let rest_router = axum::Router::new()
        .route(
            "/refresh-worker-extension",
            post(super::rest::refresh_worker_extension),
        )
        .route("/info", get(super::rest::get_server_info))
        .route("/download-file", get(super::rest::download_file))
        .layer(CorsLayer::permissive())
        .with_state(server_state);

    async fn fallback(uri: Uri) -> (StatusCode, String) {
        println!("No route for {uri}");
        (StatusCode::NOT_FOUND, format!("No route for {uri}"))
    }
    let combined_router = axum::Router::new()
        .merge(grpc_router)
        .merge(rest_router)
        .layer(CorsLayer::permissive());
    let svr = match protocol {
        Protocol::Http => {
            axum_server::bind(server_addr)
                .handle(shtdown_handle)
                .serve(combined_router.into_make_service())
                .await
        }
        Protocol::Https => {
            let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
            println!("manifest_dir: {}", manifest_dir.display());

            let (key_pem, cert_pem) = if cfg!(debug_assertions) {
                // In debug mode, use the base64 encoded certs from env
                let cert_pem = BASE64_STANDARD
                    .decode(s!(env!("BASE64_CERT_PEM")).to_string())
                    .expect("Failed to decode cert_pem");
                let key_pem = BASE64_STANDARD
                    .decode(s!(env!("BASE64_KEY_PEM")).to_string())
                    .expect("Failed to decode key_pem");
                (key_pem, cert_pem)
            } else {
                // In release mode, generate new self-signed certs every time app starts for safety
                let rsa =
                    crypto::RsaCrypto::generate_rsa().expect("Failed to generate RSA key pair");
                crypto::ssl::generate_self_signed_certificate(&rsa, 365)
                    .expect("Failed to generate self-signed certificate")
            };

            let tls_config = RustlsConfig::from_pem(cert_pem, key_pem).await?;
            axum_server::bind_rustls(server_addr, tls_config)
                .handle(shtdown_handle)
                .serve(combined_router.into_make_service())
                .await
        }
    };
    Ok(svr?)
}

pub struct Server {
    pub app_handle: AppHandle,
    pub shtdown_handle: Arc<Mutex<Option<axum_server::Handle>>>,
    pub protocol: Mutex<Protocol>,
    pub port: u16,
    pub server_handle: Arc<std::sync::Mutex<Option<tauri::async_runtime::JoinHandle<()>>>>,
}

impl Server {
    pub fn new(app_handle: AppHandle, port: u16, protocol: Protocol) -> Self {
        Self {
            app_handle,
            protocol: Mutex::new(protocol),
            port,
            server_handle: Arc::new(std::sync::Mutex::new(None)),
            shtdown_handle: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn set_server_protocol(&self, protocol: Protocol) {
        let mut p = self.protocol.lock().unwrap();
        *p = protocol;
    }

    pub fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut server_handle = self.server_handle.lock().unwrap();
        let mut shtdown_handle = self.shtdown_handle.lock().unwrap();
        if server_handle.is_some() {
            return Err("Server is already running".into());
        }
        let server_addr: SocketAddr = format!("[::]:{}", self.port).parse()?;
        let app_handle = self.app_handle.clone();
        let _shutdown_handle = axum_server::Handle::new();
        *shtdown_handle = Some(_shutdown_handle.clone());
        let protocol = self.protocol.lock().unwrap().clone();

        *server_handle = Some(tauri::async_runtime::spawn(async move {
            match start_server(
                protocol,
                server_addr,
                app_handle,
                _shutdown_handle,
                ServerOptions {},
            )
            .await
            {
                Ok(_) => {}
                Err(e) => {
                    eprintln!("Server start error: {}", e);
                }
            }
        }));
        Ok(())
    }

    pub fn stop(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut server_handle = self.server_handle.lock().unwrap();
        let mut shtdown_handle = self.shtdown_handle.lock().unwrap();
        match shtdown_handle.as_ref() {
            Some(handle) => {
                handle.shutdown();
            }
            None => {
                return Err("Server is not running".into());
            }
        }
        shtdown_handle.take();
        // self.shutdown_tx.send(())?;
        server_handle.take();
        Ok(())
    }

    pub fn is_running(&self) -> bool {
        self.server_handle.lock().unwrap().is_some()
            && self.shtdown_handle.lock().unwrap().is_some()
    }
}
