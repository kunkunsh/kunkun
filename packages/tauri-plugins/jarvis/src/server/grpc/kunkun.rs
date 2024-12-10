// use hello_world::greeter_server::Greeter;
// use hello_world::{HelloReply, HelloRequest};
// use server_info«::server_info_server::ServerInfo;
// use server_info::{InfoRequest, InfoResponse};
use grpc::kunkun::{
    kunkun_server::Kunkun,
    Empty, ServerInfoResponse,
};

use tauri::{AppHandle, Emitter, Manager};
use tonic::{Request, Response, Status};

use crate::{constants::KUNKUN_REFRESH_WORKER_EXTENSION, server::http::Server, JarvisState};

#[derive(Debug)]
pub struct KunkunService {
    pub app_handle: AppHandle,
}

#[tonic::async_trait]
impl Kunkun for KunkunService {
    async fn server_info(
        &self,
        request: Request<Empty>,
    ) -> Result<Response<ServerInfoResponse>, Status> {
        println!("Got a request: {:?}", request);
        Ok(Response::new(ServerInfoResponse {
            service_name: self.app_handle.package_info().name.clone(),
            service_version: self.app_handle.package_info().version.to_string(),
            public_key: crypto::RsaCrypto::public_key_to_string(
                &self.app_handle.state::<JarvisState>().rsa_public_key,
            ),
            ssl_cert: String::from_utf8(self.app_handle.state::<Server>().ssl_cert.clone())
                .unwrap(),
        }))
    }

    async fn hmr(&self, request: Request<Empty>) -> Result<Response<Empty>, Status> {
        self.app_handle
            .emit(KUNKUN_REFRESH_WORKER_EXTENSION, ())
            .unwrap();
        Ok(Response::new(Empty {}))
    }
}
