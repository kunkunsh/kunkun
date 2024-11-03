use crate::{model::app_state, server::http::Server};
use std::path::PathBuf;

#[tauri::command]
pub async fn start_server(server: tauri::State<'_, Server>) -> Result<(), String> {
    server.start().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn stop_server(server: tauri::State<'_, Server>) -> Result<(), String> {
    server.stop().map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn restart_server(server: tauri::State<'_, Server>) -> Result<(), String> {
    server.stop().map_err(|err| err.to_string())?;
    server.start().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn server_is_running(server: tauri::State<'_, Server>) -> Result<bool, String> {
    Ok(server.is_running())
}

#[tauri::command]
pub async fn get_server_port(server: tauri::State<'_, Server>) -> Result<u16, String> {
    Ok(server.port)
}

// #[tauri::command]
// pub async fn set_dev_extension_folder(
//     server: tauri::State<'_, Server>,
//     app_state: tauri::State<'_, app_state::AppState>,
//     dev_ext_folder: Option<PathBuf>,
// ) -> Result<(), String> {
//     let mut dev_extension_folder = server.dev_extension_folder.lock().unwrap();
//     *dev_extension_folder = dev_ext_folder.clone();
//     let mut app_state_dev_ext_path = app_state.dev_extension_path.lock().unwrap();
//     *app_state_dev_ext_path = dev_ext_folder.clone();
//     Ok(())
// }

// #[tauri::command]
// pub async fn set_extension_folder(
//     server: tauri::State<'_, Server>,
//     app_state: tauri::State<'_, app_state::AppState>,
//     ext_folder: PathBuf,
// ) -> Result<(), String> {
//     let mut extension_folder = server.extension_folder.lock().unwrap();
//     *extension_folder = ext_folder.clone();
//     let mut extension_path = app_state.extension_path.lock().unwrap();
//     *extension_path = ext_folder;
//     Ok(())
// }

// #[tauri::command]
// pub async fn get_extension_folder(
//     app_state: tauri::State<'_, app_state::AppState>,
//     // server: tauri::State<'_, Server>,
// ) -> Result<PathBuf, String> {
//     Ok(app_state.extension_path.lock().unwrap().to_owned())
//     // Ok(server.extension_folder.lock().unwrap().to_owned())
// }

// #[tauri::command]
// pub async fn get_dev_extension_folder(
//     app_state: tauri::State<'_, app_state::AppState>,
//     // server: tauri::State<'_, Server>,
// ) -> Result<Option<PathBuf>, String> {
//     Ok(app_state.dev_extension_path.lock().unwrap().to_owned())
//     // Ok(server.dev_extension_folder.lock().unwrap().to_owned())
// }
