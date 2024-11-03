use crate::commands::discovery::Peers;
use mdns_sd::ServiceEvent;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_network::network::mdns::MdnsService;

pub fn setup_mdns(my_port: u16) -> anyhow::Result<MdnsService> {
    let mdns = MdnsService::new("tauri")?;
    mdns.register(
        "tauridesktop",
        &MdnsService::get_default_ips_str(),
        my_port,
        None,
        None,
    )?;
    Ok(mdns)
}

pub fn handle_mdns_service_evt<R: Runtime>(
    app_handle: &AppHandle<R>,
    rx: mdns_sd::Receiver<ServiceEvent>,
) {
    let app_handle = app_handle.clone();
    tauri::async_runtime::spawn(async move {
        while let Ok(event) = rx.recv() {
            match event {
                ServiceEvent::ServiceResolved(info) => {
                    app_handle.state::<Peers>().add_peer(info.into());
                }
                ServiceEvent::ServiceRemoved(service_type, fullname) => {
                    app_handle
                        .state::<Peers>()
                        .remove_peer(service_type, fullname);
                }
                _ => {}
            }
        }
    });
}
