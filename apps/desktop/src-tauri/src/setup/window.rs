use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_jarvis::setup::window::WindowExt;

pub fn setup_window<R: Runtime>(app: &AppHandle<R>) {
    #[cfg(target_os = "macos")]
    {
        let main_win = app.get_webview_window("main").unwrap();
        main_win.set_transparent_titlebar(true, true);
        let splashscreen_win = app.get_webview_window("splashscreen").unwrap();
        splashscreen_win.set_transparent_titlebar(true, true);
        main_win.center().unwrap();
    }
    #[cfg(not(target_os = "macos"))]
    {
        // on linux or windows, set decorations to false
        let main_win = app.get_webview_window("main").unwrap();
        main_win
            .set_decorations(false)
            .expect("Failed to set decorations");
        main_win.center().unwrap();
    }
}
