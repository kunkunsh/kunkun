use std::{collections::HashMap, sync::Mutex};
use tauri_plugin_network::network::mdns::ServiceInfoMod;

#[derive(Default, Debug)]
pub struct Peers {
    pub peers: Mutex<HashMap<String, ServiceInfoMod>>,
}

impl Peers {
    pub fn add_peer(&self, peer: ServiceInfoMod) {
        let mut peers = self.peers.lock().unwrap();
        peers.insert(peer.hostname.clone(), peer);
    }

    pub fn remove_peer(&self, service_type: String, fullname: String) {
        let peers = self.peers.lock().unwrap();
        // find the peer by service_type and fullname
        let peer = peers
            .iter()
            .find(|(_, peer)| peer.fullname == fullname && peer.service_type == service_type);
        if let Some((hostname, _)) = peer {
            self.peers.lock().unwrap().remove(hostname);
        }
    }

    pub fn clear(&self) {
        let mut peers = self.peers.lock().unwrap();
        peers.clear();
    }

    pub fn set_peers(&self, peers: HashMap<String, ServiceInfoMod>) {
        self.clear();
        self.peers.lock().unwrap().extend(peers);
    }
}

#[tauri::command]
pub async fn get_peers(
    state: tauri::State<'_, Peers>,
) -> Result<HashMap<String, ServiceInfoMod>, String> {
    let _peers = state.peers.lock().unwrap();
    println!("get_peers: {:?}", _peers);
    Ok(_peers.to_owned())
}
