use tauri::AppHandle;
use tauri_plugin_keyring::KeyringExt;

pub fn setup_keyring(app: &AppHandle) -> anyhow::Result<Option<String>> {
    Ok(if cfg!(debug_assertions) {
        None
    } else {
        Some(app.keyring().get_or_set_password(
            "kunkun",
            "db_key",
            uuid::Uuid::new_v4().to_string().as_str(),
        )?)
    })
}
