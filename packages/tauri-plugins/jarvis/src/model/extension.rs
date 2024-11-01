use super::manifest::Permissions;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Extension {
    pub path: PathBuf,
    pub processes: Vec<u32>,
    pub dist: Option<String>,
    // pub identifier: String,
}
