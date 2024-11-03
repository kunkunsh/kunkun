use crate::{
    commands,
    constants::{
        KUNKUN_CLIPBOARD_EXT_IDENTIFIER, KUNKUN_DEV_EXT_IDENTIFIER,
        KUNKUN_QUICK_LINKS_EXT_IDENTIFIER, KUNKUN_REMOTE_EXT_IDENTIFIER,
        KUNKUN_SCRIPT_CMD_EXT_IDENTIFIER,
    },
};
use tauri::{AppHandle, Manager, Runtime};

fn create_ext_if_not_exist(identifier: &str, db: &db::JarvisDB) -> anyhow::Result<()> {
    let ext = db.get_unique_extension_by_identifier(identifier)?;
    if ext.is_none() {
        db.create_extension(identifier, "1.0.0", true, None, None)?;
        log::info!("Created extension: {}", identifier)
    }
    Ok(())
}

pub fn setup_db<R: Runtime>(app_handle: &AppHandle<R>) -> anyhow::Result<()> {
    let db = app_handle.state::<commands::db::DBState>();
    let db = db.db.lock().unwrap();
    create_ext_if_not_exist(KUNKUN_CLIPBOARD_EXT_IDENTIFIER, &db)?;
    create_ext_if_not_exist(KUNKUN_QUICK_LINKS_EXT_IDENTIFIER, &db)?;
    create_ext_if_not_exist(KUNKUN_REMOTE_EXT_IDENTIFIER, &db)?;
    create_ext_if_not_exist(KUNKUN_SCRIPT_CMD_EXT_IDENTIFIER, &db)?;
    create_ext_if_not_exist(KUNKUN_DEV_EXT_IDENTIFIER, &db)?;
    Ok(())
}
