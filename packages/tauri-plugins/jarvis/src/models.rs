use serde::{Deserialize, Serialize};
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

#[derive(Default, Clone, Serialize, Deserialize, Debug)]
pub struct FileTransferInfo {
    pub filename: String,
    pub code: String,
    pub ip: String,
    pub port: u16,
}

#[derive(Default, Serialize, Deserialize, Debug)]
pub struct FileTransferState {
    pub files: Arc<Mutex<Vec<FileTransferInfo>>>,
}
