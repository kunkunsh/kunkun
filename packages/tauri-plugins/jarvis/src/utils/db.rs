use std::path::PathBuf;

use db::JarvisDB;

pub fn get_db(path: PathBuf, key: Option<String>) -> anyhow::Result<JarvisDB> {
    JarvisDB::new(path, key).map_err(|e| anyhow::anyhow!("Failed to get db: {}", e))
}
