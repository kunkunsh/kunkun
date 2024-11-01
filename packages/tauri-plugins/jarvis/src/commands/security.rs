#![cfg(target_os = "macos")]
#[tauri::command]
pub async fn verify_auth() -> Result<bool, String> {
    Ok(mac_security_rs::verify_auth(
        mac_security_rs::AuthPolicy::Biometrics,
    ))
}

#[tauri::command]
pub async fn request_screen_capture_access() -> Result<bool, String> {
    Ok(mac_security_rs::request_screen_capture_access())
}

#[tauri::command]
pub async fn check_screen_capture_access() -> Result<bool, String> {
    Ok(mac_security_rs::preflight_screen_capture_access())
}
