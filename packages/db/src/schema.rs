pub const SCHEMA1: &str = include_str!("../sql/2024-10-23.sql");
pub struct Migration {
    pub version: u16,
    pub script: String,
    pub description: String,
}
impl Migration {
    pub fn new(version: u16, schema: &str, description: &str) -> Self {
        Self {
            version,
            script: schema.to_string(),
            description: description.to_string(),
        }
    }
}

use std::sync::LazyLock;

pub static MIGRATIONS: LazyLock<Vec<Migration>> =
    LazyLock::new(|| vec![Migration::new(1, SCHEMA1, "Initial Migration")]);
