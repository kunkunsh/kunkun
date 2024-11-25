use file_transfer::file_transfer_server::FileTransfer;
use file_transfer::{StartTransferRequest, StartTransferResponse};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tonic::{Request, Response, Status};

pub mod file_transfer {
    tonic::include_proto!("file_transfer"); // The string specified here must match the proto package name
    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("kk_grpc");
}

#[derive(Debug)]
pub struct MyFileTransfer {
    pub app_handle: AppHandle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileTransferPayload {
    pub port: String,
    pub filename: String,
    pub code: String,
    pub file_size: i64,
    pub ip: String,
    pub ssl_cert: String,
}

#[tonic::async_trait]
impl FileTransfer for MyFileTransfer {
    async fn start_transfer(
        &self,
        request: Request<StartTransferRequest>, // Accept request of type StartTransferRequest
    ) -> Result<Response<StartTransferResponse>, Status> {
        let reply = StartTransferResponse {};
        // let ip = request.remote_addr().unwrap().ip();
        let ip = "localhost";
        println!("start_transfer remote addr: {:?}", request.remote_addr());
        let payload = request.into_inner();
        println!("start_transfer payload: {:?}", payload);
        // get ip from request
        self.app_handle
            .emit(
                "file-transfer-request",
                FileTransferPayload {
                    port: payload.port,
                    filename: payload.filename,
                    code: payload.code,
                    file_size: payload.file_size,
                    ip: ip.to_string(),
                    ssl_cert: payload.ssl_cert,
                },
            )
            .map_err(|e| Status::internal(e.to_string()))?;
        Ok(Response::new(reply)) // Send back our formatted greeting
    }
}
