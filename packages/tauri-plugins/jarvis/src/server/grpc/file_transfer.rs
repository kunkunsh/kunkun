use file_transfer::file_transfer_server::FileTransfer;
use file_transfer::{StartTransferRequest, StartTransferResponse};
use tauri::AppHandle;
use tonic::{Request, Response, Status};

pub mod file_transfer {
    tonic::include_proto!("file_transfer"); // The string specified here must match the proto package name
    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("kk_grpc");
}

#[derive(Debug)]
pub struct MyFileTransfer {
    pub app_handle: AppHandle,
}

#[tonic::async_trait]
impl FileTransfer for MyFileTransfer {
    async fn start_transfer(
        &self,
        request: Request<StartTransferRequest>, // Accept request of type StartTransferRequest
    ) -> Result<Response<StartTransferResponse>, Status> {
        let reply = StartTransferResponse { accept: true };

        Ok(Response::new(reply)) // Send back our formatted greeting
    }
}
