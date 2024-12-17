use db::{ExtDataSearchQuery, JarvisDB};
use serde::{Deserialize, Serialize};
use std::{str::FromStr, sync::Mutex};
use strum_macros::{Display, EnumString};

#[derive(Debug, Clone, Serialize, Deserialize, Display, EnumString)]
pub enum ClipboardContentType {
    Text,
    Html,
    Rtf,
    Image,
    // File,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Record {
    pub timestamp: u128,
    pub content_type: ClipboardContentType,
    pub value: String,
    pub text: String, // plain text representation of the value
}

pub struct ClipboardHistory {
    // pub history: Mutex<Vec<Record>>,
    pub jarvis_db: Mutex<JarvisDB>,
    pub clipboard_ext_id: i32,
}

impl ClipboardHistory {
    pub fn new(jarvis_db: JarvisDB, clipboard_ext_id: i32) -> Self {
        Self {
            jarvis_db: Mutex::new(jarvis_db),
            clipboard_ext_id,
        }
    }
}

impl ClipboardHistory {
    pub fn add_record(&self, record: Record) -> anyhow::Result<()> {
        let jdb = self.jarvis_db.lock().unwrap();
        jdb.create_extension_data(
            self.clipboard_ext_id,
            &record.content_type.to_string(),
            &record.value,
            Some(&record.text),
        )?;
        Ok(())
    }

    pub fn get_all_records(&self) -> anyhow::Result<Vec<Record>> {
        let jdb = self.jarvis_db.lock().unwrap();
        let db_records = jdb.search_extension_data(
            ExtDataSearchQuery {
                ext_id: self.clipboard_ext_id,
                fields: None,
                data_id: None,
                search_exact_match: false,
                data_type: None,
                search_text: None,
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            },
        )?;
        let mut records = vec![];
        for r in db_records {
            match crate::utils::time::sqlite_timestamp_to_unix_timestamp(&r.created_at) {
                Ok(timestamp) => match ClipboardContentType::from_str(&r.data_type) {
                    Ok(content_type) => {
                        records.push(Record {
                            timestamp: timestamp as u128,
                            content_type,
                            value: r.data.unwrap().clone(), // safe to unwrap because we are sure it's not None
                            text: r.search_text.clone().unwrap_or_default(),
                        });
                    }
                    Err(e) => {
                        log::error!("Error converting content type: {}", e);
                        continue;
                    }
                },
                Err(e) => {
                    log::error!("Error converting timestamp: {}", e);
                    continue;
                }
            }
        }
        Ok(records)
    }
}
