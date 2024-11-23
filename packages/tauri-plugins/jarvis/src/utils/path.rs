use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime};

pub fn get_default_extensions_dir<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<PathBuf> {
    Ok(app.path().app_data_dir()?.join("extensions"))
}

// pub fn get_default_dev_extensions_dir<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<PathBuf> {
//     Ok(app.path().app_data_dir()?.join("dev-extensions"))
// }

pub fn get_default_extensions_storage_dir<R: Runtime>(
    app: &AppHandle<R>,
) -> anyhow::Result<PathBuf> {
    Ok(app.path().app_data_dir()?.join("extensions_storage"))
}

pub fn get_kunkun_db_path<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<PathBuf> {
    Ok(app.path().app_data_dir()?.join(if cfg!(debug_assertions) {
        "kk.dev.db"
    } else {
        "kk.db"
    }))
}
