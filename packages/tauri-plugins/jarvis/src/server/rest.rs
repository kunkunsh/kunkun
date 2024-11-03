use super::model::{ServerInfo, ServerState};
use crate::constants::KUNKUN_REFRESH_WORKER_EXTENSION;
use axum::extract::State;
use tauri::Emitter;

/// This file contains REST API endpoints

pub async fn web_root() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "service": "kunkun"
    }))
}

pub async fn get_server_info(State(state): State<ServerState>) -> axum::Json<ServerInfo> {
    let pkg_info = state.app_handle.package_info();
    axum::Json(ServerInfo {
        service_name: pkg_info.name.to_string(),
        service_version: pkg_info.version.to_string(),
    })
}

pub async fn refresh_worker_extension(State(state): State<ServerState>) -> &'static str {
    state
        .app_handle
        .emit(KUNKUN_REFRESH_WORKER_EXTENSION, ())
        .unwrap();
    "OK"
}
