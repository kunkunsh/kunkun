use std::{collections::HashMap, net::IpAddr, sync::Mutex};

use crate::server::{
    grpc::{
        client::get_grpc_tls_channel,
        // kunkun::kunkun::{kunkun_client::KunkunClient, Empty, ServerInfoResponse},
    },
    model::ServerInfo,
};
use grpc::kunkun::{kunkun_client::KunkunClient, Empty, ServerInfoResponse};
// use crate::server::grpc::kunkun::kunkun::Empty
use mdns_sd::ServiceInfo;
use serde::{Deserialize, Serialize};
// use tonic::transport::{Certificate, Channel, ClientTlsConfig};

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceInfoMod {
    pub addresses: Vec<IpAddr>,
    pub fullname: String, // <instance>.<service>.<domain>
    pub hostname: String,
    pub port: u16,
    pub service_type: String, // Returns the service type including the domain label. For example: "_my-service._udp.local.".
    pub sub_type: Option<String>, // Returns the service subtype including the domain label, if subtype has been defined. For example: "_printer._sub._http._tcp.local.".
    pub properties: HashMap<String, String>,
    pub public_key: String,
    pub ssl_cert: String,
}

impl ServiceInfoMod {
    pub async fn from(info: ServiceInfo) -> anyhow::Result<Self> {
        let properties = info
            .get_properties()
            .iter()
            .map(|property| (property.key().to_string(), property.val_str().to_string()))
            .collect::<HashMap<_, _>>();
        // Send ServerInfo gRPC request to get public_key and ssl_cert
        let addresses: Vec<IpAddr> = info.get_addresses().iter().cloned().collect();
        if addresses.len() == 0 {
            return Err(anyhow::anyhow!("No addresses found"));
        }

        /* -------------------------------------------------------------------------- */
        /*                    TODO: Remove this rest API workaround                   */
        /* -------------------------------------------------------------------------- */
        // send a rest request to get public_key and ssl_cert with reqwest, trust the cert
        let client = reqwest::Client::builder()
            .danger_accept_invalid_certs(true)
            .build()
            .unwrap();
        let server_info = client
            .get(format!("https://{}:9559/info", addresses[0]))
            .send()
            .await?
            .json::<ServerInfo>()
            .await?;
        /* -------------------------------------------------------------------------- */
        /*                    TODO: Remove this rest API workaround                   */
        /* -------------------------------------------------------------------------- */
        // I was not able to find a way to disable certificate check with tonic client, so I had to first get ssl cert from rest api with reqwest
        // then use it to create a grpc channel that trusts the known cert
        let grpc_tls_channel =
            get_grpc_tls_channel(&addresses[0].to_string(), 9559, &server_info.ssl_cert).await?;
        let mut client = KunkunClient::new(grpc_tls_channel.clone());
        let response: tonic::Response<ServerInfoResponse> = client.server_info(Empty {}).await?;
        let server_info = response.into_inner();
        let public_key = server_info.public_key;
        let ssl_cert = server_info.ssl_cert;
        Ok(Self {
            addresses: info.get_addresses().iter().cloned().collect(),
            fullname: info.get_fullname().to_string(),
            hostname: info.get_hostname().to_string(),
            port: info.get_port(),
            service_type: info.get_type().to_string(),
            sub_type: info.get_subtype().clone(),
            properties,
            public_key,
            ssl_cert,
        })
    }
}

#[derive(Default, Debug)]
pub struct Peers {
    pub peers: Mutex<HashMap<String, ServiceInfoMod>>,
}

impl Peers {
    pub async fn add_peer(&self, peer: ServiceInfoMod) {
        let mut peers = self.peers.lock().unwrap();
        peers.insert(peer.hostname.clone(), peer);
    }

    pub fn remove_peer(&self, service_type: String, fullname: String) {
        let peer = self
            .peers
            .lock()
            .unwrap()
            .iter()
            .find(|(_, peer)| peer.fullname == fullname && peer.service_type == service_type)
            .map(|(hostname, _)| hostname.clone());
        if let Some(hostname) = peer {
            self.peers.lock().unwrap().remove(&hostname);
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
    Ok(_peers.to_owned())
}
