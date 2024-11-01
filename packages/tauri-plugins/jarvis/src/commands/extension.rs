use crate::JarvisState;
use crate::{
    model::{
        extension::Extension,
        manifest::{ExtPackageJsonExtra, MANIFEST_FILE_NAME},
    },
    utils::manifest::load_jarvis_ext_manifest,
};
use std::collections::HashMap;
use std::{fmt::format, path::PathBuf};
use tauri::{command, AppHandle, Runtime, State, Window};

/// manifest_path can be folder of package.json
/// If it's a folder, join it with package.json
#[tauri::command]
pub async fn load_manifest<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    manifest_path: PathBuf,
) -> Result<ExtPackageJsonExtra, String> {
    Ok(ExtPackageJsonExtra::from(
        load_jarvis_ext_manifest(manifest_path.clone()).map_err(|e| e.to_string())?,
        manifest_path.parent().unwrap().to_path_buf(),
    ))
}

#[tauri::command]
pub async fn load_all_extensions<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    extensions_folder: PathBuf,
) -> Result<Vec<ExtPackageJsonExtra>, String> {
    let mut extensions_with_path: Vec<ExtPackageJsonExtra> = vec![];
    for entry in std::fs::read_dir(extensions_folder).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;

        if entry.path().join(MANIFEST_FILE_NAME).exists() {
            let ext_manifest = load_jarvis_ext_manifest(entry.path()).map_err(|e| e.to_string());
            if ext_manifest.is_err() {
                continue;
            }
            extensions_with_path.push(ExtPackageJsonExtra::from(
                ext_manifest.unwrap(),
                entry.path(),
            ));
        }
    }
    Ok(extensions_with_path)
}

#[tauri::command]
pub async fn is_window_label_registered<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, JarvisState>,
    label: String,
) -> Result<bool, String> {
    Ok(state
        .window_label_ext_map
        .lock()
        .unwrap()
        .contains_key(label.as_str()))
}

#[tauri::command]
pub async fn register_extension_window<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, JarvisState>,
    extension_path: PathBuf,
    dist: Option<String>,
    window_label: Option<String>,
) -> Result<String, String> {
    let window_label_2 = match window_label {
        Some(label) => label,
        None => format!("main:ext:{}", uuid::Uuid::new_v4()),
    };
    let mut label_ext_map = state.window_label_ext_map.lock().unwrap();
    // if label_ext_map.contains_key(window_label_2.as_str()) {
    //     return Err(format!(
    //         "Window with label {} is already registered",
    //         &window_label_2
    //     ));
    // }
    let ext = Extension {
        path: extension_path,
        processes: vec![],
        dist: dist,
        // identifier: manifest.kunkun.identifier,
    };
    label_ext_map.insert(window_label_2.clone(), ext);
    Ok(window_label_2)
}

#[tauri::command]
pub async fn register_extension_spawned_process<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, JarvisState>,
    window_label: String,
    pid: u32,
) -> Result<(), String> {
    let mut label_ext_map = state.window_label_ext_map.lock().unwrap();
    // check if window_label is registered, if not, return error
    if !label_ext_map.contains_key(window_label.as_str()) {
        return Err(format!(
            "Window with label {} is not registered",
            &window_label
        ));
    }
    let ext = label_ext_map.get_mut(window_label.as_str()).unwrap();
    ext.processes.push(pid);
    Ok(())
}

#[tauri::command]
pub async fn unregister_extension_spawned_process<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, JarvisState>,
    window_label: String,
    pid: u32,
) -> Result<(), String> {
    let mut label_ext_map = state.window_label_ext_map.lock().unwrap();
    label_ext_map
        .get_mut(window_label.as_str())
        .unwrap()
        .processes
        .retain(|p| *p != pid);
    Ok(())
}

#[tauri::command]
pub async fn get_ext_label_map<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    state: State<'_, JarvisState>,
) -> Result<HashMap<String, Extension>, String> {
    Ok(state.window_label_ext_map.lock().unwrap().clone())
}

#[tauri::command]
pub async fn unregister_extension_window<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, JarvisState>,
    label: String,
) -> Result<bool, String> {
    Ok(state
        .window_label_ext_map
        .lock()
        .unwrap()
        .remove(label.as_str())
        .is_some())
}
