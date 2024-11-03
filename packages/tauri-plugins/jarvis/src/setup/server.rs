use crate::server::http::Server;
use tauri::{AppHandle, Manager, Runtime};

pub fn setup_server<R: Runtime>(handle: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let server = handle.state::<Server>();
    server.start()?;
    Ok(())
}
