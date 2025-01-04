use tauri::{AppHandle, Manager};

pub fn setup_stronghold(app: &AppHandle) -> tauri::Result<()> {
    let salt_path = app
        .path()
        .app_local_data_dir()
        .expect("could not resolve app local data path")
        .join("salt.txt");
    app.plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

    Ok(())
}
