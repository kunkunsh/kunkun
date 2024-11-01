use serde::Serialize;
use tauri::{AppHandle, Runtime};

#[derive(Serialize)]
pub struct ServerInfo {
    pub service_name: String,
    pub service_version: String,
}

#[derive(Clone)]
pub struct ServerState {
    // that holds some api specific state
    pub app_handle: AppHandle,
}
