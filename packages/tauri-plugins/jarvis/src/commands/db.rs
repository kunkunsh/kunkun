use db::{
    models::{Cmd, CmdType, Ext, ExtData},
    ExtDataField, JarvisDB, SQLSortOrder,
};
use std::{path::PathBuf, sync::Mutex};
use tauri::State;

use crate::utils::db::get_db;

#[derive(Debug)]
pub struct DBState {
    pub db: Mutex<JarvisDB>,
    // pub peers: Mutex<HashMap<String, ServiceInfoMod>>,
}

impl DBState {
    pub fn new(path: PathBuf, key: Option<String>) -> anyhow::Result<Self> {
        let db = get_db(path, key)?;
        db.init()?;
        Ok(Self { db: Mutex::new(db) })
    }
}

/* -------------------------------------------------------------------------- */
/*                               Extension CRUD                               */
/* -------------------------------------------------------------------------- */
#[tauri::command]
pub async fn create_extension(
    db: State<'_, DBState>,
    identifier: &str,
    version: &str,
    enabled: Option<bool>,
    path: Option<&str>,
    data: Option<&str>,
) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .create_extension(identifier, version, enabled.unwrap_or(true), path, data)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_all_extensions(db: State<'_, DBState>) -> Result<Vec<Ext>, String> {
    db.db
        .lock()
        .unwrap()
        .get_all_extensions()
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_all_extensions_by_identifier(
    identifier: &str,
    db: State<'_, DBState>,
) -> Result<Vec<Ext>, String> {
    db.db
        .lock()
        .unwrap()
        .get_all_extensions_by_identifier(identifier)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_unique_extension_by_identifier(
    identifier: &str,
    db: State<'_, DBState>,
) -> Result<Option<Ext>, String> {
    let ext = db
        .db
        .lock()
        .unwrap()
        .get_unique_extension_by_identifier(identifier)
        .map_err(|err| err.to_string())?;
    Ok(ext)
}

#[tauri::command]
pub async fn get_unique_extension_by_path(
    path: &str,
    db: State<'_, DBState>,
) -> Result<Option<Ext>, String> {
    let ext = db
        .db
        .lock()
        .unwrap()
        .get_unique_extension_by_path(path)
        .map_err(|err| err.to_string())?;
    Ok(ext)
}

#[tauri::command]
pub async fn delete_extension_by_path(path: &str, db: State<'_, DBState>) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .delete_extension_by_path(path)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn delete_extension_by_ext_id(ext_id: i32, db: State<'_, DBState>) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .delete_extension_by_ext_id(ext_id)
        .map_err(|err| err.to_string())
}

/* -------------------------------------------------------------------------- */
/*                           Extension Command CRUD                           */
/* -------------------------------------------------------------------------- */

#[tauri::command]
pub async fn create_command(
    db: State<'_, DBState>,
    ext_id: i32,
    name: &str,
    cmd_type: CmdType,
    data: &str,
    enabled: bool,
    alias: Option<&str>,
    hotkey: Option<&str>,
) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .create_command(ext_id, name, cmd_type, data, enabled, alias, hotkey)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_command_by_id(db: State<'_, DBState>, cmd_id: i32) -> Result<Option<Cmd>, String> {
    db.db
        .lock()
        .unwrap()
        .get_command_by_id(cmd_id)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_commands_by_ext_id(
    db: State<'_, DBState>,
    ext_id: i32,
) -> Result<Vec<Cmd>, String> {
    db.db
        .lock()
        .unwrap()
        .get_commands_by_ext_id(ext_id)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn delete_command_by_id(db: State<'_, DBState>, cmd_id: i32) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .delete_command_by_id(cmd_id)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn update_command_by_id(
    db: State<'_, DBState>,
    cmd_id: i32,
    name: &str,
    cmd_type: CmdType,
    data: &str,
    enabled: bool,
    alias: Option<&str>,
    hotkey: Option<&str>,
) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .update_command_by_id(cmd_id, name, cmd_type, data, enabled, alias, hotkey)
        .map_err(|err| err.to_string())
}

/* -------------------------------------------------------------------------- */
/*                             Extension Data CRUD                            */
/* -------------------------------------------------------------------------- */
#[tauri::command]
pub async fn create_extension_data(
    ext_id: i32,
    data_type: &str,
    data: &str,
    search_text: Option<&str>,
    db: State<'_, DBState>,
) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .create_extension_data(ext_id, data_type, data, search_text)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_extension_data_by_id(
    data_id: i32,
    db: State<'_, DBState>,
) -> Result<Option<ExtData>, String> {
    db.db
        .lock()
        .unwrap()
        .get_extension_data_by_id(data_id)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn search_extension_data(
    ext_id: i32,
    search_exact_match: bool,
    data_id: Option<i32>,
    data_type: Option<&str>,
    search_text: Option<&str>,
    after_created_at: Option<&str>,
    before_created_at: Option<&str>,
    db: State<'_, DBState>,
    limit: Option<i32>,
    order_by_created_at: Option<SQLSortOrder>,
    order_by_updated_at: Option<SQLSortOrder>,
    fields: Option<Vec<ExtDataField>>,
) -> Result<Vec<ExtData>, String> {
    db.db
        .lock()
        .unwrap()
        .search_extension_data(
            ext_id,
            search_exact_match,
            data_id,
            data_type,
            search_text,
            after_created_at,
            before_created_at,
            limit,
            order_by_created_at,
            order_by_updated_at,
            fields,
        )
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn delete_extension_data_by_id(
    data_id: i32,
    db: State<'_, DBState>,
) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .delete_extension_data_by_id(data_id)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn update_extension_data_by_id(
    data_id: i32,
    data: &str,
    search_text: Option<&str>,
    db: State<'_, DBState>,
) -> Result<(), String> {
    db.db
        .lock()
        .unwrap()
        .update_extension_data_by_id(data_id, data, search_text)
        .map_err(|err| err.to_string())
}
