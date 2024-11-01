use applications::{App, AppInfo, AppInfoContext};
use std::sync::Mutex;

#[derive(Default)]
pub struct ApplicationsState {
    ctx: Mutex<AppInfoContext>,
}
#[tauri::command]
pub async fn get_applications(
    state: tauri::State<'_, ApplicationsState>,
) -> Result<Vec<App>, String> {
    Ok(state.ctx.lock().unwrap().get_all_apps())
}

#[tauri::command]
pub async fn refresh_applications_list(
    state: tauri::State<'_, ApplicationsState>,
) -> Result<(), String> {
    state
        .ctx
        .lock()
        .unwrap()
        .refresh_apps()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn refresh_applications_list_in_bg(
    state: tauri::State<'_, ApplicationsState>,
) -> Result<(), String> {
    state.ctx.lock().unwrap().refresh_apps_in_background();
    Ok(())
}
