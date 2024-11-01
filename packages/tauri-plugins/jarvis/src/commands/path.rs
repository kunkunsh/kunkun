use crate::utils::path;
use tauri::Runtime;

#[tauri::command]
pub async fn get_default_extensions_dir<R: Runtime>(
    app: tauri::AppHandle<R>,
) -> Result<(), String> {
    path::get_default_extensions_dir(&app).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_default_extensions_storage_dir<R: Runtime>(
    app: tauri::AppHandle<R>,
) -> Result<(), String> {
    path::get_default_extensions_storage_dir(&app).map_err(|e| e.to_string())?;
    Ok(())
}
