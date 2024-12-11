use serde::{Deserialize, Serialize};
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionInfo {
    pub path: PathBuf,
    pub processes: Vec<u32>,
    pub dist: Option<String>,
    // pub identifier: String,
}

#[derive(Debug, Clone)]
pub struct Extension {
    pub info: ExtensionInfo,
    pub shutdown_handle: Arc<Mutex<Option<axum_server::Handle>>>,
    pub server_handle: Arc<std::sync::Mutex<Option<tauri::async_runtime::JoinHandle<()>>>>,
}
