use crate::{setup::window::WindowExt, utils::window::get_current_monitor};
use log::warn;
use tauri::{LogicalPosition, Manager, Runtime};

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

#[tauri::command]
pub async fn show_window<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    show_on_cursor_position: bool,
    window_label: Option<String>,
) -> Result<(), String> {
    let win_label = window_label.unwrap_or(window.label().to_string());
    let window = match app.get_webview_window(win_label.as_str()) {
        Some(webview_win) => webview_win,
        None => {
            warn!("Window not found");
            return Err("Window not found".to_string());
        }
    };
    if show_on_cursor_position {
        let screen = get_current_monitor(&window);
        let dpi = screen.scale_factor();
        let screen_position = screen.position().to_logical::<i32>(dpi);
        let screen_size = screen.size().to_logical::<i32>(dpi);

        let window_dpi = window.scale_factor().unwrap();
        let window_size = window.outer_size().unwrap().to_logical::<i32>(window_dpi);

        let final_pos = LogicalPosition {
            x: screen_position.x + ((screen_size.width / 2) - (window_size.width / 2)),
            y: screen_position.y + ((screen_size.height / 2) - (window_size.height / 2)),
        };

        if let Err(e) = window.set_position(final_pos) {
            warn!("Failed to set window position: {}", e);
        };
    }
    match window.show() {
        Ok(_) => Ok(()),
        Err(_) => {
            warn!("Failed to show window");
            Err("Failed to show window".to_string())
        }
    }
}
