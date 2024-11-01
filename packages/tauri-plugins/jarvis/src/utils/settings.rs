use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri_plugin_store::Store;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LightMode {
    Auto,
    Light,
    Dark,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub theme: String,
    pub radius: f32,
    pub light_mode: LightMode,
    pub launch_at_login: bool,
    pub show_in_tray: bool,
    pub dev_extension_path: Option<PathBuf>,
    pub dev_ext_load_url: bool,
    pub hide_on_blur: bool,
    pub trigger_hotkey: Option<Vec<String>>,
}

impl Default for AppSettings {
    fn default() -> Self {
        AppSettings {
            theme: "neutral".to_string(),
            radius: 0.5,
            light_mode: LightMode::Auto,
            launch_at_login: true,
            show_in_tray: true,
            dev_extension_path: None,
            dev_ext_load_url: false,
            hide_on_blur: true,
            trigger_hotkey: None,
        }
    }
}

impl AppSettings {
    pub fn load_from_store<R: tauri::Runtime>(
        store: &Store<R>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let config = store.get("config");
        match config {
            Some(config) => {
                let config: AppSettings = serde_json::from_value(config.to_owned())?;
                Ok(config)
            }
            None => Ok(AppSettings::default()),
        }
    }
}
