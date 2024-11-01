pub mod grpc;
pub mod http;
pub mod model;
pub mod rest;
pub mod tls;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Protocol {
    Http,
    Https,
}

impl std::fmt::Display for Protocol {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Protocol::Http => write!(f, "http"),
            Protocol::Https => write!(f, "https"),
        }
    }
}

pub const CANDIDATE_PORTS: &[u16; 6] = &[1566, 1567, 1568, 9559, 9560, 9561];
pub const SERVICE_NAME: &str = "jarvis";
