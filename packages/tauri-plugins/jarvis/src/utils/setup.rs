// use crate::commands::server::Server;
use tauri::{AppHandle, Manager, Runtime};

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

pub fn setup_app_path<R: Runtime>(handle: &AppHandle<R>) {
    let app_d = handle.path().app_data_dir().unwrap();
    if !app_d.exists() {
        std::fs::create_dir_all(&app_d).unwrap();
    }
    /* -------------------------------------------------------------------------- */
    /*                          Create Extensions Folder                          */
    /* -------------------------------------------------------------------------- */
    let ext_folder = app_d.join("extensions");
    if !ext_folder.exists() {
        std::fs::create_dir_all(&ext_folder).unwrap();
    }
}

// pub fn setup_server<R: Runtime>(handle: &AppHandle<R>) {
//     let server = handle.state::<Server>();
//     server.start(handle).expect("Failed to start local server");
// }

pub fn setup_mac_transparent_bg(handle: &AppHandle) {
    let window = handle.get_webview_window("main").unwrap();
    #[cfg(target_os = "macos")]
    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
        .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
}

/**
 * On MacOS
 * app_config: "/Users/<user>/Library/Application Support/sh.kunkun"
 * app_data: "/Users/<user>/Library/Application Support/sh.kunkun"
 * app_local_data: "/Users/<user>/Library/Application Support/sh.kunkun"
 * app_cache: "/Users/<user>/Library/Caches/sh.kunkun"
 * app_log: "/Users/<user>/Library/Logs/sh.kunkun"
 */
pub fn setup_extension_storage<R: Runtime>(handle: &AppHandle<R>) {
    let app_data_dir = handle.path().app_data_dir().unwrap();
    let ext_dir = app_data_dir.join("extensions_support");
    if !ext_dir.exists() {
        std::fs::create_dir_all(&ext_dir).unwrap();
    }
}
