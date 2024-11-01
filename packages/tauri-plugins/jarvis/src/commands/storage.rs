// /// This file contains a wrapper around the tauri_plugin_store plugin. Instead of using path provided by user, we set a path for each store.
// /// This store is used by extensions, so I don't want them to access store files randomly.
// pub use serde_json::Value as JsonValue;
// use std::path::{Path, PathBuf};
// use tauri::{AppHandle, Manager, Runtime, State, Window};
// // use tauri_plugin_store::{Result, Error};
// type Result<T> = std::result::Result<T, String>;
// use tauri_plugin_store::{with_store, Store, StoreCollection};

// use crate::{utils::path::get_default_extensions_storage_dir, JarvisState};

// fn setup_ext_storage_folder<R: Runtime>(
//     handle: &AppHandle<R>,
//     identifier: String,
// ) -> anyhow::Result<PathBuf> {
//     let path = get_default_extensions_storage_dir(handle)?;
//     let path = path.join(identifier);
//     if !path.exists() {
//         std::fs::create_dir_all(&path)?;
//     }
//     Ok(path)
// }

// fn preprocess<R: Runtime>(
//     app: &AppHandle<R>,
//     window: &Window<R>,
//     jarvis_state: &State<'_, JarvisState>,
//     path: &PathBuf,
// ) -> Result<PathBuf> {
//     let window_label = window.label().to_string();
//     let map = jarvis_state.window_label_ext_map.lock().unwrap();
//     // if window_label doesn't start with ext, return error
//     if !window_label.starts_with("ext") {
//         return Err(format!("Invalid extension window label: {}", window_label));
//     }
//     match map.get(window_label.as_str()) {
//         Some(ext) => {
//             let ext_folder = setup_ext_storage_folder(&app, ext.identifier.clone())
//                 .map_err(|e| e.to_string())?;
//             let store_path = ext_folder.join(path.file_name().unwrap());
//             Ok(store_path)
//         }
//         None => {
//             return Err(format!("Extension not found for window {}", window_label));
//         }
//     }
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_set<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
//     key: String,
//     value: JsonValue,
// ) -> Result<()> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| store.insert(key, value)).map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_get<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
//     key: String,
// ) -> Result<Option<JsonValue>> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| Ok(store.get(key).cloned()))
//         .map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_has<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
//     key: String,
// ) -> Result<bool> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| Ok(store.has(key))).map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_delete<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
//     key: String,
// ) -> Result<bool> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| store.delete(key)).map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_clear<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
// ) -> Result<()> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| store.clear()).map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_reset<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     jarvis_state: State<'_, JarvisState>,
//     collection: State<'_, StoreCollection<R>>,
//     path: PathBuf,
// ) -> Result<()> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, collection, store_path, |store| store.reset()).map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_keys<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
// ) -> Result<Vec<String>> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| {
//         Ok(store.keys().cloned().collect())
//     })
//     .map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_values<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
// ) -> Result<Vec<JsonValue>> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| {
//         Ok(store.values().cloned().collect())
//     })
//     .map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_entries<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
// ) -> Result<Vec<(String, JsonValue)>> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| {
//         Ok(store
//             .entries()
//             .map(|(k, v)| (k.to_owned(), v.to_owned()))
//             .collect())
//     })
//     .map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_length<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
// ) -> Result<usize> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| Ok(store.len())).map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_load<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
// ) -> Result<()> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| store.load()).map_err(|e| e.to_string())
// }

// #[tauri::command]
// pub async fn ext_store_wrapper_save<R: Runtime>(
//     app: AppHandle<R>,
//     window: Window<R>,
//     stores: State<'_, StoreCollection<R>>,
//     jarvis_state: State<'_, JarvisState>,
//     path: PathBuf,
// ) -> Result<()> {
//     let store_path = preprocess(&app, &window, &jarvis_state, &path).map_err(|e| e.to_string())?;
//     with_store(app, stores, store_path, |store| store.save()).map_err(|e| e.to_string())
// }
