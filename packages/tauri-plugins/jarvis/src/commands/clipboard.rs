use super::db::DBState;
use crate::model::clipboard_history::{ClipboardContentType, ClipboardHistory, Record};
use std::time::SystemTime;

#[tauri::command]
pub async fn get_history(
    state: tauri::State<'_, ClipboardHistory>,
    db: tauri::State<'_, DBState>,
) -> Result<Vec<Record>, String> {
    state.get_all_records().map_err(|err| err.to_string())
    // let mut history = state.history.lock().unwrap().to_vec();
    // history.reverse();
    // // only return the first 100 items
    // history.truncate(100);
    // Ok(history)
}

#[tauri::command]
pub async fn add_to_history(
    state: tauri::State<'_, ClipboardHistory>,
    value: String,
    text: String,
    content_type: ClipboardContentType,
) -> Result<(), String> {
    state
        .add_record(Record {
            timestamp: SystemTime::now()
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap()
                .as_millis(),
            content_type,
            value,
            text,
        })
        .map_err(|err| err.to_string())
}
