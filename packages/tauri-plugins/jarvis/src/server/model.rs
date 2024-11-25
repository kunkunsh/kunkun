use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Runtime};

#[derive(Serialize, Debug, Deserialize)]
pub struct ServerInfo {
    pub service_name: String,
    pub service_version: String,
    pub public_key: String,
    pub ssl_cert: String,
}

#[derive(Clone)]
pub struct ServerState {
    // that holds some api specific state
    pub app_handle: AppHandle,
}

#[derive(Serialize, Debug, Clone)]
pub struct FileTransferProgressPayload {
    pub progress: f64,
    pub sent_bytes: u64,
    pub total_size: u64,
    pub chunk_count: u64,
}
