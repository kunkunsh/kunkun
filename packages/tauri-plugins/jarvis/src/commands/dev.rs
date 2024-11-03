use tauri::{Manager, Runtime};

#[tauri::command]
pub fn open_devtools<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
    #[cfg(debug_assertions)]
    {
        let win = window.get_webview_window(window.label());
        if let Some(win) = win {
            win.open_devtools();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn close_devtools<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
    #[cfg(debug_assertions)]
    {
        let win = window.get_webview_window(window.label());
        if let Some(win) = win {
            win.close_devtools();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn is_devtools_open<R: Runtime>(window: tauri::Window<R>) -> Result<bool, String> {
    #[cfg(debug_assertions)]
    {
        let win = window.get_webview_window(window.label());
        if let Some(win) = win {
            Ok(win.is_devtools_open())
        } else {
            Err("Window not found".to_string())
        }
    }
    #[cfg(not(debug_assertions))]
    Err("Devtools is not available in release mode".to_string())
}

#[tauri::command]
pub fn toggle_devtools<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
    #[cfg(debug_assertions)]
    {
        let is_open =
            is_devtools_open(window.clone()).expect("failed to check if devtools is open");
        if is_open {
            close_devtools(window).expect("failed to close devtools");
        } else {
            open_devtools(window).expect("failed to open devtools");
        }
    }
    Ok(())
}

#[tauri::command]
pub fn app_is_dev() -> Result<bool, String> {
    Ok(tauri::is_dev())
}
