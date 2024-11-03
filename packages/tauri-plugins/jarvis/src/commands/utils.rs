#[tauri::command]
pub async fn plist_to_json(plist_content: String) -> Result<serde_json::Value, String> {
    crate::utils::plist::plist_to_json(plist_content)
}
