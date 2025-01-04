use crate::setup::window::WindowExt;
use tauri::{Manager, Runtime};

#[tauri::command]
pub async fn set_transparent_titlebar<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    window_label: Option<String>,
) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let win_label = window_label.unwrap_or(window.label().to_string());
        match app.get_webview_window(win_label.as_str()) {
            Some(webview_win) => webview_win.set_transparent_titlebar(true, true),
            None => return Err("Window not found".to_string()),
        }
    }
    Ok(())
}
