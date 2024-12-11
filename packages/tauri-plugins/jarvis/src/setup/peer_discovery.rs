use crate::commands::discovery::{Peers, ServiceInfoMod};
use mdns_sd::ServiceEvent;
use std::collections::HashMap;
use sysinfo::System;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_network::network::mdns::MdnsService;
use uuid::Uuid;

pub fn setup_mdns(my_port: u16, public_rsa_key: String) -> anyhow::Result<MdnsService> {
    let mdns = MdnsService::new("kunkun")?;
    let id = Uuid::new_v4();
    let mut properties: HashMap<String, String> = HashMap::new();
    if let Some(hostname) = System::host_name() {
        properties.insert("hostname".to_string(), hostname);
    }
    // there seems to be a limit on txt properties, I can't include public key here
    mdns.register(
        &format!("desktop-{}", id),
        &MdnsService::get_default_ips_str(),
        my_port,
        None,
        Some(properties),
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
                // ServiceEvent::ServiceResolved(info) => {
                //     log::info!("Service Resolved: {:?}", info);
                // },
                ServiceEvent::ServiceResolved(info) => {
                    log::info!("Service Resolved: {:#?}", info);
                    match ServiceInfoMod::from(info).await {
                        Ok(service_info) => {
                            app_handle.state::<Peers>().add_peer(service_info).await;
                            if let Ok(peers) = app_handle.state::<Peers>().peers.lock() {
                                log::info!("Peers: {:#?}", peers.clone());
                            } else {
                                log::error!("Failed to acquire peers lock");
                            }
                        }
                        Err(e) => {
                            log::error!("Failed to create ServiceInfoMod: {}", e);
                        }
                    }
                }
                ServiceEvent::ServiceRemoved(service_type, fullname) => {
                    log::info!("Service Removed: {:?} {:?}", service_type, fullname);
                    app_handle
                        .state::<Peers>()
                        .remove_peer(service_type, fullname);
                    let peers = app_handle.state::<Peers>().peers.lock().unwrap().clone();
                    log::info!("Peers: {:?}", peers);
                }
                _ => {}
            }
        }
    });
}
