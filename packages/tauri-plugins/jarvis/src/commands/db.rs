use db::{
    models::{Cmd, CmdType, Ext, ExtData, ExtDataField, ExtDataSearchQuery, SQLSortOrder},
    JarvisDB,
};
use serde_json::{json, Value as JsonValue};
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

#[tauri::command]
pub async fn select(
    db: State<'_, DBState>,
    query: &str,
    values: Vec<JsonValue>,
) -> Result<Vec<JsonValue>, String> {
    db.db
        .lock()
        .unwrap()
        .select(query.to_string(), values)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn execute(
    db: State<'_, DBState>,
    query: &str,
    values: Vec<JsonValue>,
) -> Result<Vec<JsonValue>, String> {
    let (rows_affected, last_id) = db
        .db
        .lock()
        .unwrap()
        .execute(query, values)
        .map_err(|err| err.to_string())?;
    Ok(vec![json!([rows_affected, last_id])])
}
