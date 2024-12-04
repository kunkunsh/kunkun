use crate::server::grpc::client::get_grpc_tls_channel;
use crate::{
    model::app_state,
    models::{FileTransferInfo, FileTransferState},
    server::http::Server,
};
use grpc::file_transfer::file_transfer_client::FileTransferClient;
use grpc::file_transfer::{StartTransferRequest, StartTransferResponse};
use reqwest::tls::Certificate;
use std::path::PathBuf;
use uuid::Uuid;

#[tauri::command]
pub async fn start_server(server: tauri::State<'_, Server>) -> Result<(), String> {
    server.start().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn stop_server(server: tauri::State<'_, Server>) -> Result<(), String> {
    server.stop().map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn restart_server(server: tauri::State<'_, Server>) -> Result<(), String> {
    server.stop().map_err(|err| err.to_string())?;
    server.start().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn server_is_running(server: tauri::State<'_, Server>) -> Result<bool, String> {
    Ok(server.is_running())
}

#[tauri::command]
pub async fn get_server_port(server: tauri::State<'_, Server>) -> Result<u16, String> {
    Ok(server.port)
}

// #[tauri::command]
// pub async fn set_dev_extension_folder(
//     server: tauri::State<'_, Server>,
//     app_state: tauri::State<'_, app_state::AppState>,
//     dev_ext_folder: Option<PathBuf>,
// ) -> Result<(), String> {
//     let mut dev_extension_folder = server.dev_extension_folder.lock().unwrap();
//     *dev_extension_folder = dev_ext_folder.clone();
//     let mut app_state_dev_ext_path = app_state.dev_extension_path.lock().unwrap();
//     *app_state_dev_ext_path = dev_ext_folder.clone();
//     Ok(())
// }

// #[tauri::command]
// pub async fn set_extension_folder(
//     server: tauri::State<'_, Server>,
//     app_state: tauri::State<'_, app_state::AppState>,
//     ext_folder: PathBuf,
// ) -> Result<(), String> {
//     let mut extension_folder = server.extension_folder.lock().unwrap();
//     *extension_folder = ext_folder.clone();
//     let mut extension_path = app_state.extension_path.lock().unwrap();
//     *extension_path = ext_folder;
//     Ok(())
// }

// #[tauri::command]
// pub async fn get_extension_folder(
//     app_state: tauri::State<'_, app_state::AppState>,
//     // server: tauri::State<'_, Server>,
// ) -> Result<PathBuf, String> {
//     Ok(app_state.extension_path.lock().unwrap().to_owned())
//     // Ok(server.extension_folder.lock().unwrap().to_owned())
// }

// #[tauri::command]
// pub async fn get_dev_extension_folder(
//     app_state: tauri::State<'_, app_state::AppState>,
//     // server: tauri::State<'_, Server>,
// ) -> Result<Option<PathBuf>, String> {
//     Ok(app_state.dev_extension_path.lock().unwrap().to_owned())
//     // Ok(server.dev_extension_folder.lock().unwrap().to_owned())
// }

#[tauri::command]
pub async fn get_files_to_send(
    file_transfer: tauri::State<'_, FileTransferState>,
) -> Result<Vec<FileTransferInfo>, String> {
    Ok(file_transfer.files.lock().unwrap().to_vec())
}

#[tauri::command]
pub async fn local_net_send_file(
    file_transfer: tauri::State<'_, FileTransferState>,
    files_to_send: Vec<PathBuf>,
    ip: String,
    port: u16,
    cert_pem: String,
) -> Result<(), String> {
    let uuid = Uuid::new_v4().to_string();

    // Create the gRPC channel and client before acquiring the mutex
    let tls_channel = get_grpc_tls_channel(&ip, port, &cert_pem)
        .await
        .map_err(|err| err.to_string())?;
    let mut client = FileTransferClient::new(tls_channel);
    println!("local_net_send_file: {:?}", files_to_send);
    // Send the transfer request
    // let response: tonic::Response<StartTransferResponse> = client
    //     .start_transfer(StartTransferRequest {
    //         port: port.to_string(),
    //         filename: files_to_send[0]
    //             .file_name()
    //             .unwrap()
    //             .to_str()
    //             .unwrap()
    //             .to_string(),
    //         code: uuid.clone(),
    //         file_size: files_to_send[0].metadata().unwrap().len() as i64,
    //         ssl_cert: cert_pem,
    //     })
    //     .await
    //     .map_err(|e| e.to_string())?;
    // println!("local_net_send_file response: {:?}", response);
    // Only acquire the mutex after all async operations are complete
    let mut files = file_transfer.files.lock().unwrap();
    for file in files_to_send {
        files.push(FileTransferInfo {
            filename: file.to_string_lossy().to_string(),
            code: uuid.clone(),
            ip: ip.clone(),
            port,
        });
    }
    Ok(())
}

#[tauri::command]
pub async fn download_file(
    url: String,
    code: String,
    file_path: String,
    ssl_cert: String,
) -> Result<(), String> {
    // Create a custom client that trusts the provided SSL certificate
    // let client = reqwest::Client::builder()
    //     .danger_accept_invalid_certs(true)
    //     .build()
    //     .map_err(|e| e.to_string())?;
    let cert = Certificate::from_pem(ssl_cert.as_bytes()).map_err(|e| e.to_string())?;
    let client = reqwest::Client::builder()
        .add_root_certificate(cert)
        .build()
        .map_err(|e| e.to_string())?;

    // Make the request with the authorization code in the header
    let response = client
        .get(&url)
        .header("Authorization", &code)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Check if the request was successful
    if !response.status().is_success() {
        return Err(format!(
            "Download failed with status: {}",
            response.status()
        ));
    }

    // Get the bytes from the response
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    // Write the file to disk
    tokio::fs::write(&file_path, bytes)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
