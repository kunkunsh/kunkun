use super::{
    http::Server,
    model::{ServerInfo, ServerState},
};
use crate::{
    constants::{KUNKUN_REFRESH_WORKER_EXTENSION, SERVER_PUBLIC_KEY},
    models::FileTransferState,
    server::model::FileTransferProgressPayload,
    JarvisState,
};
use axum::{
    body::StreamBody,
    extract::{FromRequest, Query, State},
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
};
use rustls::lock::Mutex;
use std::path::PathBuf;
use tauri::{Emitter, Manager};
use tokio::fs::File;
use tokio_stream::StreamExt;
use tokio_util::io::ReaderStream;
/// This file contains REST API endpoints

pub async fn web_root() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "service": "kunkun"
    }))
}

pub async fn get_server_info(State(state): State<ServerState>) -> axum::Json<ServerInfo> {
    let pkg_info = state.app_handle.package_info();
    let jarvis_state = state.app_handle.state::<JarvisState>();

    let pub_key_pem = jarvis_state
        .rsa_public_key
        .public_key_to_pem()
        .expect("Failed to convert public key to pem");
    axum::Json(ServerInfo {
        service_name: pkg_info.name.to_string(),
        service_version: pkg_info.version.to_string(),
        public_key: String::from_utf8(pub_key_pem).expect("Failed to convert public key to string"),
        ssl_cert: String::from_utf8(state.app_handle.state::<Server>().ssl_cert.clone()).unwrap(),
    })
}

pub async fn refresh_worker_extension(State(state): State<ServerState>) -> &'static str {
    state
        .app_handle
        .emit(KUNKUN_REFRESH_WORKER_EXTENSION, ())
        .unwrap();
    "OK"
}

#[derive(Debug, serde::Deserialize)]
pub struct Params {
    pub id: String,
}

/// Download a file from the server
/// Sample wget command: wget --header="Authorization: TOKEN" --no-check-certificate --content-disposition https://localhost:9559/download-file
pub async fn download_file(
    Query(params): Query<Params>,
    State(state): State<ServerState>,
    headers: HeaderMap,
) -> impl IntoResponse {
    println!("download_file");
    println!("params: {:?}", params);
    // read authorization header
    let auth_header = headers.get("Authorization");
    // let file_id = headers.get("file_id");
    let auth_header_str = if let Some(auth_header) = auth_header {
        auth_header.to_str().unwrap()
    } else {
        return (StatusCode::FORBIDDEN, "Forbidden").into_response();
    };
    let file_transfer_state = state.app_handle.state::<FileTransferState>();
    // !The mutex related operations must be done in a separate scope, otherwise it will conflict with tokio::fs::File::open, not sure why
    let file_path = {
        let buckets = file_transfer_state
            .buckets
            .lock()
            .expect("Failed to get buckets mutex");
        let bucket = match buckets.get(auth_header_str) {
            Some(b) => b,
            None => return (StatusCode::NOT_FOUND, "File not found").into_response(),
        };
        let file_path = match bucket.id_path_map.get(&params.id) {
            Some(f) => f,
            None => return (StatusCode::NOT_FOUND, "File not found").into_response(),
        };
        file_path.clone()
    };
    let app_handle = state.app_handle.clone();
    let response = match File::open(&file_path).await {
        Ok(file) => {
            let total_size = file.metadata().await.map(|m| m.len()).unwrap_or(0);
            let stream = ReaderStream::new(file);
            let mut sent_bytes = 0u64;
            let mut chunk_count = 0;
            let progress_stream = stream.map(move |chunk| {
                if let Ok(ref chunk_data) = chunk {
                    sent_bytes += chunk_data.len() as u64;
                    // every chunk is 4104 bytes (4kb)
                    chunk_count += 1;
                    // Only emit progress every 10 chunks
                    if chunk_count % 10 == 0 {
                        // Emit progress to the frontend
                        let progress = (sent_bytes as f64 / total_size as f64) * 100.0;
                        println!(
                            "progress: {} ({}/{} bytes, {} chunks)",
                            progress, sent_bytes, total_size, chunk_count
                        );
                        tauri::async_runtime::spawn({
                            let app_handle = app_handle.clone();
                            async move {
                                app_handle
                                    .emit(
                                        "file-download-progress",
                                        FileTransferProgressPayload {
                                            progress,
                                            sent_bytes,
                                            total_size,
                                            chunk_count,
                                        },
                                    )
                                    .unwrap_or_else(|e| eprintln!("Error emitting event: {:?}", e));
                            }
                        });
                    }
                }
                chunk
            });
            let body = StreamBody::new(progress_stream);
            (
                [
                    (
                        header::CONTENT_TYPE,
                        mime_guess::from_path(&file_path)
                            .first_or_octet_stream()
                            .as_ref(),
                    ),
                    (
                        header::CONTENT_DISPOSITION,
                        format!(
                            "attachment; filename={}",
                            file_path.file_name().unwrap().to_str().unwrap()
                        )
                        .as_str(),
                    ),
                ],
                body,
            )
                .into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    };
    response
}
