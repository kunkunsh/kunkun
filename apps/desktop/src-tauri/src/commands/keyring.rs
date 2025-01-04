use tauri::Runtime;
use tauri_plugin_keyring::KeyringExt;

#[tauri::command]
pub async fn get_stronghold_key<R: Runtime>(app: tauri::AppHandle<R>) -> Result<String, String> {
    app.keyring()
        .get_or_set_password(
            "kunkun",
            "stronghold_key",
            uuid::Uuid::new_v4().to_string().as_str(),
        )
        .map_err(|err| err.to_string())
}
