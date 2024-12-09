use crate::{
    models::{FileTransferState, FilesBucket},
    server::grpc::file_transfer::{compute_total_size, count_file_nodes, FileTransferPayload},
    utils::{reqwest::build_ssl_reqwest_client, transfer_stats::TransferStats},
};
use futures_util::TryStreamExt;
use grpc::file_transfer::{FileNode, FileType};
use rustls::ticketer;
use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    time::Instant,
};
use tauri::ipc::Channel;
use tokio::{
    fs::File,
    io::{AsyncWriteExt, BufWriter},
    sync::mpsc,
};

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressPayload {
    pub progress_bytes: u128,
    pub total_bytes: u128,
    pub transfer_speed_bytes_per_second: f64,
    pub current_file_name: String,
    pub total_files: usize,
    pub current_file_index: usize,
}

#[derive(Debug)]
struct FileDownloadProgress {
    file_name: String,
    bytes_transferred: u128,
}

async fn download_file(
    url: &str,
    code: &str,
    file_path: &Path,
    client: &reqwest::Client,
    stats: &mut TransferStats,
    progress_tx: mpsc::Sender<FileDownloadProgress>,
) -> anyhow::Result<()> {
    let response = client.get(url).header("Authorization", code).send().await?;
    let mut file = BufWriter::new(File::create(file_path).await?);
    let mut stream = response.bytes_stream();

    let file_name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    while let Some(chunk) = stream.try_next().await? {
        file.write_all(&chunk).await?;
        stats.record_chunk_transfer(chunk.len());

        progress_tx
            .send(FileDownloadProgress {
                file_name: file_name.clone(),
                bytes_transferred: chunk.len() as u128,
            })
            .await
            .ok();

        println!("downloading: {:#?}", stats);
    }
    file.flush().await?;
    Ok(())
}

async fn download_file_node_recursively(
    node: &FileNode,
    dir: &Path,
    config: &FileTransferPayload,
    client: &reqwest::Client,
    stats: &mut TransferStats,
    progress_tx: mpsc::Sender<FileDownloadProgress>,
) -> anyhow::Result<()> {
    let mut stack = vec![(node.clone(), dir.to_path_buf())];

    while let Some((current_node, current_dir)) = stack.pop() {
        let download_path = current_dir.join(&current_node.filename);

        if current_node.r#type == FileType::File as i32 {
            let url = format!(
                "https://{ip}:{port}/download-file?id={id}",
                ip = config.ip,
                port = config.port,
                id = current_node.id
            );
            download_file(
                &url,
                &config.code,
                &download_path,
                client,
                stats,
                progress_tx.clone(),
            )
            .await?;
        } else if current_node.r#type == FileType::Directory as i32 {
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

    let (progress_tx, mut progress_rx) = mpsc::channel::<FileDownloadProgress>(100);

    let total_bytes = compute_total_size(&payload.root);
    let total_files = count_file_nodes(&payload.root);
    let client = build_ssl_reqwest_client(None, Some(payload.ssl_cert.clone()))
        .map_err(|e| e.to_string())?;

    if payload.root.filename.is_empty() {
        let timestamp = chrono::Utc::now().format("%Y-%m-%d_%H-%M-%S").to_string();
        payload.root.filename = timestamp;
    }
    let mut stats = TransferStats::default();
    let start_time = Instant::now();
    let on_progress_clone = on_progress.clone();
    let mut files_received: HashSet<String> = HashSet::new();
    tokio::spawn(async move {
        let mut total_transferred = 0u128;
        let mut counter = 0;
        while let Some(progress) = progress_rx.recv().await {
            total_transferred += progress.bytes_transferred as u128;
            counter += 1;
            files_received.insert(progress.file_name.clone());
            if counter >= 100 || total_transferred == total_bytes {
                let bytes_per_second =
                    total_transferred as f64 / start_time.elapsed().as_secs_f64();
                let payload = ProgressPayload {
                    progress_bytes: total_transferred,
                    total_bytes: total_bytes,
                    transfer_speed_bytes_per_second: bytes_per_second,
                    current_file_name: progress.file_name,
                    total_files: total_files,
                    current_file_index: files_received.len(),
                };

                on_progress_clone.send(payload).ok();
                counter = 0;
            }
        }
    });

    let download_path = save_dir.join(&payload.root.filename);
    std::fs::create_dir_all(&download_path).map_err(|e| e.to_string())?;

    download_file_node_recursively(
        &payload.root,
        save_dir.as_path(),
        &payload,
        &client,
        &mut stats,
        progress_tx,
    )
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
