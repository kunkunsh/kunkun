#[tauri::command]
/// copy one dir to another (or location)
///
/// uses the [`dircpy`](https://crates.io/crates/dircpy) crate for recursive directory copying.
pub async fn copy_dir_all(from: String, to: String) -> Result<(), String> {
    dircpy::copy_dir(from, to).map_err(|e| e.to_string())
}
