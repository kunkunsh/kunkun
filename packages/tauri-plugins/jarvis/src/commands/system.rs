use crate::syscmds::{CommonSystemCmds, SystemCmds};
use crate::utils::script::run_apple_script;
use applications::AppInfo;

#[tauri::command]
pub async fn open_trash() -> Result<(), String> {
    SystemCmds::open_trash().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn empty_trash() -> Result<(), String> {
    SystemCmds::empty_trash().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn shutdown() -> Result<(), String> {
    SystemCmds::shutdown().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn reboot() -> Result<(), String> {
    SystemCmds::reboot().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn sleep() -> Result<(), String> {
    SystemCmds::sleep().map_err(|err| err.to_string())
}

/// ```applescript
/// tell application "System Events" to tell appearance preferences
///   set dark_mode to dark mode
///   set dark_mode to not dark_mode
///   set dark mode to dark_mode
/// end tell
/// ```
#[tauri::command]
pub async fn toggle_system_appearance() -> Result<(), String> {
    run_apple_script(
        r#"
        tell application "System Events" to tell appearance preferences
            set dark_mode to dark mode
            set dark_mode to not dark_mode
            set dark mode to dark_mode
        end tell
    "#,
    )
    .map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn show_desktop() -> Result<(), String> {
    run_apple_script("tell application \"System Events\" to key code 103")
        .map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn quit_all_apps() -> Result<(), String> {
    todo!()
}

#[tauri::command]
pub async fn sleep_displays() -> Result<(), String> {
    run_apple_script("do shell script \"pmset displaysleepnow\"").map_err(|err| err.to_string())?;
    Ok(())
}

/// Set Volume to 0
#[tauri::command]
pub async fn set_volume(percentage: u8) -> Result<(), String> {
    SystemCmds::set_volume(percentage).map_err(|err| err.to_string())
}
/// Turn Volume Up
#[tauri::command]
pub async fn turn_volume_up() -> Result<(), String> {
    SystemCmds::turn_volume_up().map_err(|err| err.to_string())
}
/// Turn Volume Down
#[tauri::command]
pub async fn turn_volume_down() -> Result<(), String> {
    SystemCmds::turn_volume_down().map_err(|err| err.to_string())
}
/// Toggle Stage Manager
#[tauri::command]
pub async fn toggle_stage_manager() -> Result<(), String> {
    todo!()
}

/// Toggle Bluetooth
#[tauri::command]
pub async fn toggle_bluetooth() -> Result<(), String> {
    todo!()
}

/// Toggle Hidden Files
#[tauri::command]
pub async fn toggle_hidden_files() -> Result<(), String> {
    todo!()
}

/// Eject All Disks
#[tauri::command]
pub async fn eject_all_disks() -> Result<(), String> {
    run_apple_script("tell application \"Finder\" to eject (every disk whose ejectable is true)")
        .map_err(|err| err.to_string())?;
    Ok(())
}
/// Logout <User>
#[tauri::command]
pub async fn logout_user() -> Result<(), String> {
    SystemCmds::logout_user().map_err(|err| err.to_string())
}
/// Toggle Mute
#[tauri::command]
pub async fn toggle_mute() -> Result<(), String> {
    SystemCmds::toggle_mute().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn mute() -> Result<(), String> {
    SystemCmds::mute().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn unmute() -> Result<(), String> {
    SystemCmds::unmute().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_frontmost_app() -> Result<applications::App, String> {
    let ctx = applications::AppInfoContext::new();
    ctx.get_frontmost_application()
        .map_err(|err| err.to_string())
}

/// Hide All Apps Except Frontmost
#[tauri::command]
pub async fn hide_all_apps_except_frontmost() -> Result<(), String> {
    run_apple_script(
        r#"tell application "System Events"
            set frontApp to name of first application process whose frontmost is true
            set visibleApps to every process whose visible is true and name is not frontApp
            repeat with theApp in visibleApps
                set visible of theApp to false
            end repeat
        end tell"#,
    )
    .map_err(|err| err.to_string())?;
    Ok(())
}

/// For macOS, return the selected files in the finder
#[tauri::command]
pub async fn get_selected_files_in_file_explorer() -> Result<Vec<std::path::PathBuf>, String> {
    SystemCmds::get_selected_files().map_err(|err| err.to_string())
}
