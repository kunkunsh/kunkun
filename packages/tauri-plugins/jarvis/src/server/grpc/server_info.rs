// use hello_world::greeter_server::Greeter;
// use hello_world::{HelloReply, HelloRequest};
use server_info::server_info_server::ServerInfo;
use server_info::{InfoRequest, InfoResponse};
use tauri::{AppHandle, Manager};
use tonic::{Request, Response, Status};

use crate::JarvisState;

pub mod server_info {
    tonic::include_proto!("server_info"); // The string specified here must match the proto package name
    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("kk_grpc");
}

#[derive(Debug)]
pub struct MyServerInfo {
    pub app_handle: AppHandle,
}

#[tonic::async_trait]
impl ServerInfo for MyServerInfo {
    async fn info(&self, request: Request<InfoRequest>) -> Result<Response<InfoResponse>, Status> {
        println!("Got a request: {:?}", request);
        Ok(Response::new(InfoResponse {
            service_name: self.app_handle.package_info().name.clone(),
            service_version: self.app_handle.package_info().version.to_string(),
            public_key: crypto::RsaCrypto::public_key_to_string(
                &self.app_handle.state::<JarvisState>().rsa_public_key,
            ),
        }))
    }
}
