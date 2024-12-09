use crate::{
    models::{FileTransferState, FilesBucket},
    server::grpc::file_transfer::FileTransferPayload,
    utils::reqwest::build_ssl_reqwest_client,
};
use futures_util::TryStreamExt;
use grpc::file_transfer::FileNode;
use std::path::{Path, PathBuf};
use tauri::ipc::Channel;
use tokio::{
    fs::File,
    io::{AsyncWriteExt, BufWriter},
};

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressPayload {
    pub progress_bytes: u64,
    pub total_bytes: u128,
    pub transfer_speed_bytes_per_second: u64,
    pub current_file_name: String,
    pub total_files: u32,
    pub current_file_index: u32,
}

async fn download_file(
    url: &str,
    code: &str,
    file_path: &Path,
    client: &reqwest::Client,
) -> anyhow::Result<()> {
    let response = client.get(url).header("Authorization", code).send().await?;
    let mut file = BufWriter::new(File::create(file_path).await?);
    let mut stream = response.bytes_stream();
    while let Some(chunk) = stream.try_next().await? {
        file.write_all(&chunk).await?;
    }
    file.flush().await?;
    Ok(())
}

async fn download_file_node_recursively(
    node: &FileNode,
    dir: &Path,
    config: &FileTransferPayload,
    client: &reqwest::Client,
) -> anyhow::Result<()> {
    // We'll use a stack to store nodes we need to process.
    let mut stack = vec![(node.clone(), dir.to_path_buf())];

    while let Some((current_node, current_dir)) = stack.pop() {
        let download_path = current_dir.join(&current_node.filename);

        if current_node.r#type == 0 {
            // It's a file
            let url = format!(
                "https://{ip}:{port}/download-file?id={id}",
                ip = config.ip,
                port = config.port,
                id = current_node.id
            );
            download_file(&url, &config.code, &download_path, client).await?;
        } else if current_node.r#type == 1 {
            // It's a directory
            tokio::fs::create_dir_all(&download_path).await?;
            for child in current_node.children.iter() {
                stack.push((child.clone(), download_path.clone()));
            }
        } else {
            return Err(anyhow::anyhow!(
                "Invalid file type: {}",
                current_node.r#type
            ));
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn download_files(
    mut payload: FileTransferPayload,
    save_dir: PathBuf,
    on_progress: Channel<ProgressPayload>,
    file_transfer_state: tauri::State<'_, FileTransferState>,
) -> Result<(), String> {
    if !save_dir.exists() {
        return Err(format!(
            "Save directory does not exist: {}",
            save_dir.display()
        ));
    }
    let client = build_ssl_reqwest_client(None, Some(payload.ssl_cert.clone()))
        .map_err(|e| e.to_string())?;
    if payload.root.filename.is_empty() {
        let timestamp = chrono::Utc::now().format("%Y-%m-%d_%H-%M-%S").to_string();
        payload.root.filename = timestamp;
    }
    let download_path = save_dir.join(&payload.root.filename);
    std::fs::create_dir_all(download_path).map_err(|e| e.to_string())?;

    download_file_node_recursively(&payload.root, save_dir.as_path(), &payload, &client)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
