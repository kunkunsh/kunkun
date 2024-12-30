use tauri::AppHandle;
use tauri_plugin_keyring::KeyringExt;

pub fn setup_keyring(app: &AppHandle) -> anyhow::Result<Option<String>> {
    let db_key = if cfg!(debug_assertions) {
        None
    } else {
        let db_key = app.keyring().get_password("kunkun", "db_key")?;
        match db_key {
            Some(key) => Some(key),
            None => {
                // generate a new key
                let new_key = uuid::Uuid::new_v4().to_string();
                app.keyring().set_password("kunkun", "db_key", &new_key)?;
                Some(new_key)
            }
        }
    };
    // let db_key = if cfg!(debug_assertions) {
    //     None
    // } else {
    //     let db_enc_key_env = obfstr::obfstr!(env!("DB_ENCRYPTION_KEY")).to_string();
    //     match db_enc_key_env == "none" {
    //         true => None,
    //         false => Some(db_enc_key_env),
    //     }
    // };

    Ok(db_key)
}
