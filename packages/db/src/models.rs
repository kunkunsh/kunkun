use rusqlite::types::FromSql;
use serde::{Deserialize, Serialize};
use strum_macros::Display;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Ext {
    pub ext_id: i32,
    pub identifier: String,
    pub path: Option<String>,
    pub data: Option<String>,
    pub version: String,
    pub enabled: bool,
    pub installed_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExtData {
    pub data_id: i32,
    pub ext_id: i32,
    pub data_type: String,
    pub data: Option<String>,
    pub search_text: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum CmdType {
    Iframe,
    UiWorker,
    HeadlessWorker,
    QuickLink,
    Remote,
}

impl CmdType {
    pub fn to_string(&self) -> String {
        serde_json::to_string(self)
            .map(|s| s.trim_matches('"').to_string())
            .unwrap_or_else(|_| String::from(""))
    }
}

impl FromSql for CmdType {
    fn column_result(value: rusqlite::types::ValueRef) -> rusqlite::types::FromSqlResult<Self> {
        let type_: String = value.as_str()?.to_string();
        match type_.as_str() {
            "iframe" => Ok(CmdType::Iframe),
            "ui_worker" => Ok(CmdType::UiWorker),
            "headless_worker" => Ok(CmdType::HeadlessWorker),
            "quick_link" => Ok(CmdType::QuickLink),
            "remote" => Ok(CmdType::Remote),
            _ => Err(rusqlite::types::FromSqlError::InvalidType),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Cmd {
    pub cmd_id: i32,
    pub ext_id: i32,
    pub name: String,
    #[serde(rename = "type")]
    pub type_: CmdType,
    pub data: String,
    pub alias: Option<String>,
    pub hotkey: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Display)]
#[serde(rename_all = "UPPERCASE")]
pub enum SQLSortOrder {
    Asc,
    Desc,
}

#[derive(Debug, Serialize, Deserialize, Display, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ExtDataField {
    Data,
    SearchText,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum SearchMode {
    #[serde(rename = "exact_match")]
    ExactMatch,
    #[serde(rename = "like")]
    Like,
    #[serde(rename = "fts")]
    FTS,
}

impl SearchMode {
    pub fn to_string(&self) -> String {
        serde_json::to_string(self)
            .map(|s| s.trim_matches('"').to_string())
            .unwrap_or_else(|_| String::from(""))
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtDataSearchQuery {
    pub ext_id: i32,
    // pub search_exact_match: bool,
    pub search_mode: SearchMode,
    pub data_id: Option<i32>,
    pub data_type: Option<String>,
    pub search_text: Option<String>,
    pub after_created_at: Option<String>,
    pub before_created_at: Option<String>,
    pub limit: Option<i32>,
    pub offset: Option<i32>,
    pub order_by_created_at: Option<SQLSortOrder>,
    pub order_by_updated_at: Option<SQLSortOrder>,
    pub fields: Option<Vec<ExtDataField>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cmd_type() {
        let iframe = CmdType::Iframe;
        let worker = CmdType::UiWorker;
        let headless_worker = CmdType::HeadlessWorker;
        let quick_link = CmdType::QuickLink;
        assert_eq!(iframe.to_string(), "iframe");
        assert_eq!(worker.to_string(), "ui_worker");
        assert_eq!(headless_worker.to_string(), "headless_worker");
        assert_eq!(quick_link.to_string(), "quick_link");
    }

    #[test]
    fn test_search_mode() {
        assert_eq!(SearchMode::ExactMatch.to_string(), "exact_match");
        assert_eq!(SearchMode::Like.to_string(), "like");
        assert_eq!(SearchMode::FTS.to_string(), "fts");
    }
}
