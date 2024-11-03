use crate::utils;
use std::path::PathBuf;

#[tauri::command]
pub async fn path_exists(path: String) -> Result<bool, String> {
    let exists = PathBuf::from(path.clone()).exists();
    Ok(exists)
}

#[tauri::command]
pub async fn decompress_tarball(
    path: PathBuf,
    destination_folder: PathBuf,
    overwrite: bool,
) -> Result<PathBuf, String> {
    utils::fs::decompress_tarball(&path, &destination_folder, overwrite).map_err(|e| e.to_string())
}

/// Compress a directory into a tarball
/// Both `src_dir` and `dest_file` must be be absolute paths
#[tauri::command]
pub async fn compress_tarball(
    src_dir: PathBuf,
    dest_file: PathBuf,
    overwrite: bool,
) -> Result<PathBuf, String> {
    utils::fs::compress_tarball(&src_dir, &dest_file, overwrite).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn unzip(
    path: PathBuf,
    destination_folder: PathBuf,
    overwrite: bool,
) -> Result<(), String> {
    utils::fs::unzip(&path, &destination_folder, overwrite).map_err(|err| err.to_string())
}
