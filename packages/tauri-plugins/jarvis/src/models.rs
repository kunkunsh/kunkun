use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, Mutex},
};

// #[derive(Default, Clone, Serialize, Deserialize, Debug)]
// pub struct FileTransferInfo {
//     pub filename: String,
//     pub code: String,
//     pub ip: String,
//     pub port: u16,
// }

/// A bucket of files, share the same code
#[derive(Default, Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FilesBucket {
    pub code: String,
    pub id_path_map: HashMap<String, PathBuf>, // given id, get the path
}

#[derive(Default, Serialize, Deserialize, Debug)]
pub struct FileTransferState {
    pub buckets: Arc<Mutex<HashMap<String, FilesBucket>>>,
}
