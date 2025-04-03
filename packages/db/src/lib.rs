pub mod models;
pub mod schema;
use models::{CmdType, ExtDataField, ExtDataSearchQuery, SearchMode};
use rusqlite::{params, params_from_iter, Connection, Result, ToSql};
use serde_json::Value as JsonValue;
use serde_json::{json, Value};
use std::path::Path;

pub const DB_VERSION: u32 = 2;

pub fn get_connection<P: AsRef<Path>>(
    file_path: P,
    encryption_key: Option<String>,
) -> Result<Connection> {
    let conn = Connection::open(file_path)?;
    if let Some(encryption_key) = encryption_key {
        conn.pragma_update(None, "key", &encryption_key)?;
        conn.pragma_update(None, "foreign_keys", "ON")?;
    }
    Ok(conn)
}

#[derive(Debug)]
pub struct JarvisDB {
    pub conn: Connection,
}

impl JarvisDB {
    pub fn new<P: AsRef<Path>>(file_path: P, encryption_key: Option<String>) -> Result<Self> {
        let conn = get_connection(file_path, encryption_key)?;
        Ok(Self { conn })
    }

    /**
     * Run this when app starts everytime, to ensure the db is up to date.
     */
    pub fn init(&self) -> Result<()> {
        let schema_version_exists = self.schema_version_exists()?;
        if !schema_version_exists {
            // this means the db is not initialized at all, so we need to migrate from version 0, i.e. run all migration scripts
            self.migrate_after_version(0)?;
        } else {
            let current_version = self.get_schema_version()?;
            self.migrate_after_version(current_version.unwrap())?;
        }
        Ok(())
    }

    pub fn migrate_after_version(&self, mut version: u16) -> Result<()> {
        for migration in schema::MIGRATIONS.iter() {
            if migration.version > version {
                println!(
                    "Migrating from version {} to {}",
                    version, migration.version
                );
                version = migration.version;
                // self.conn.execute(&migration.schema, params![])?;
                match self
                    .conn
                    .execute_batch(&format!("BEGIN; {} COMMIT;", migration.script))
                {
                    Ok(_) => {
                        self.upsert_schema_version(migration.version)?;
                    }
                    Err(e) => {
                        eprintln!("Failed to execute migration script: {}", e);
                        return Err(e);
                    }
                }
            }
        }
        Ok(())
    }

    /**
     * Insert the schema version into the schema_version table if it doesn't exist yet
     */
    pub fn upsert_schema_version(&self, version: u16) -> Result<()> {
        self.conn.execute(
            "INSERT OR IGNORE INTO schema_version (version) VALUES (?1)",
            params![version],
        )?;
        Ok(())
    }

    pub fn schema_version_exists(&self) -> Result<bool> {
        match self.get_schema_version() {
            Ok(Some(_)) => Ok(true),
            _ => Ok(false),
        }
    }

    pub fn get_schema_version(&self) -> Result<Option<u16>> {
        let mut stmt = self
            .conn
            .prepare("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1;")?;
        let version_iter = stmt.query_map(params![], |row| {
            let version: u16 = row.get(0)?;
            Ok(version)
        })?;
        let mut versions: Vec<u16> = Vec::new();
        for version in version_iter {
            versions.push(version?);
        }
        Ok(versions.first().copied())
    }

    /* -------------------------------------------------------------------------- */
    /*                               Extensions CRUD                              */
    /* -------------------------------------------------------------------------- */

    pub fn create_extension(
        &self,
        identifier: &str,
        version: &str,
        enabled: bool,
        path: Option<&str>,
        data: Option<&str>,
    ) -> Result<()> {
        self.conn.execute(
            "INSERT INTO extensions (identifier, version, enabled, path, data) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![identifier, version, enabled, path, data],
        )?;
        Ok(())
    }

    pub fn select(&self, query: String, values: Vec<JsonValue>) -> Result<Vec<JsonValue>> {
        let mut stmt = self.conn.prepare(&query)?;

        // Convert JsonValue parameters to appropriate types for rusqlite
        let mut params: Vec<Box<dyn ToSql>> = Vec::new();
        for value in values {
            if value.is_null() {
                params.push(Box::new(Option::<String>::None));
            } else if value.is_string() {
                params.push(Box::new(value.as_str().unwrap().to_owned()));
            } else if let Some(number) = value.as_number() {
                if number.is_i64() {
                    params.push(Box::new(number.as_i64().unwrap()));
                } else if number.is_u64() {
                    params.push(Box::new(number.as_u64().unwrap() as i64));
                } else {
                    params.push(Box::new(number.as_f64().unwrap()));
                }
            } else {
                params.push(Box::new(value.to_string()));
            }
        }

        // Get column names from statement
        let column_names: Vec<String> = (0..stmt.column_count())
            .map(|i| stmt.column_name(i).unwrap().to_string())
            .collect();

        // Execute the query with the converted parameters and map results
        let rows = stmt.query_map(params_from_iter(params.iter().map(|p| p.as_ref())), |row| {
            let mut result = Vec::new();
            for i in 0..column_names.len() {
                let value: Value = match row.get_ref(i)? {
                    rusqlite::types::ValueRef::Null => Value::Null,
                    rusqlite::types::ValueRef::Integer(i) => Value::Number(i.into()),
                    rusqlite::types::ValueRef::Real(r) => Value::Number(
                        serde_json::Number::from_f64(r).unwrap_or(serde_json::Number::from(0)),
                    ),
                    rusqlite::types::ValueRef::Text(t) => {
                        Value::String(String::from_utf8_lossy(t).into_owned())
                    }
                    rusqlite::types::ValueRef::Blob(b) => {
                        Value::String(String::from_utf8_lossy(b).into_owned())
                    }
                };
                result.push(value);
            }
            Ok(Value::Array(result))
        })?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }

    pub fn execute(&self, query: &str, values: Vec<JsonValue>) -> Result<(u64, i64)> {
        let mut stmt = self.conn.prepare(query)?;

        // Convert JsonValue parameters to appropriate types for rusqlite
        let mut params: Vec<Box<dyn ToSql>> = Vec::new();
        for value in values {
            if value.is_null() {
                params.push(Box::new(Option::<String>::None));
            } else if value.is_string() {
                params.push(Box::new(value.as_str().unwrap().to_owned()));
            } else if let Some(number) = value.as_number() {
                if number.is_i64() {
                    params.push(Box::new(number.as_i64().unwrap()));
                } else if number.is_u64() {
                    params.push(Box::new(number.as_u64().unwrap() as i64));
                } else {
                    params.push(Box::new(number.as_f64().unwrap()));
                }
            } else {
                params.push(Box::new(value.to_string()));
            }
        }

        // Execute the query with the converted parameters
        let rows_affected = stmt.execute(params_from_iter(params.iter().map(|p| p.as_ref())))?;

        // Get the last insert rowid
        let last_insert_id = self.conn.last_insert_rowid();

        Ok((rows_affected as u64, last_insert_id))
    }

    pub fn get_all_extensions(&self) -> Result<Vec<models::Ext>> {
        let mut stmt = self.conn.prepare(
            "SELECT ext_id, identifier, path, data, version, enabled, installed_at FROM extensions",
        )?;
        let ext_iter = stmt.query_map(params![], |row| {
            Ok(models::Ext {
                ext_id: row.get(0)?,
                identifier: row.get(1)?,
                path: row.get(2)?,
                data: row.get(3)?,
                version: row.get(4)?,
                enabled: row.get(5)?,
                installed_at: row.get(6)?,
            })
        })?;
        let mut exts = Vec::new();
        for ext in ext_iter {
            exts.push(ext?);
        }
        Ok(exts)
    }

    /**
     * Get the first extension by identifier, if there are multiple, it will return an error
     */
    pub fn get_unique_extension_by_identifier(
        &self,
        identifier: &str,
    ) -> anyhow::Result<Option<models::Ext>> {
        let exts = self.get_all_extensions_by_identifier(identifier)?;
        if exts.len() > 1 {
            return Err(anyhow::anyhow!(
                "Multiple extensions with the same identifier: {}",
                identifier
            ));
        }
        Ok(exts.first().cloned())
    }

    pub fn get_all_extensions_by_identifier(&self, identifier: &str) -> Result<Vec<models::Ext>> {
        let mut stmt = self.conn.prepare(
            "SELECT ext_id, identifier, path, data, version, enabled, installed_at FROM extensions WHERE identifier = ?1",
        )?;
        let ext_iter = stmt.query_map(params![identifier], |row| {
            Ok(models::Ext {
                ext_id: row.get(0)?,
                identifier: row.get(1)?,
                path: row.get(2)?,
                data: row.get(3)?,
                version: row.get(4)?,
                enabled: row.get(5)?,
                installed_at: row.get(6)?,
            })
        })?;
        let mut exts = Vec::new();
        for ext in ext_iter {
            exts.push(ext?);
        }
        Ok(exts)
    }

    pub fn get_unique_extension_by_path(&self, path: &str) -> Result<Option<models::Ext>> {
        let mut stmt = self.conn.prepare(
            "SELECT ext_id, identifier, path, data, version, enabled, installed_at FROM extensions WHERE path = ?1",
        )?;
        let ext_iter = stmt.query_map(params![path], |row| {
            Ok(models::Ext {
                ext_id: row.get(0)?,
                identifier: row.get(1)?,
                path: row.get(2)?,
                data: row.get(3)?,
                version: row.get(4)?,
                enabled: row.get(5)?,
                installed_at: row.get(6)?,
            })
        })?;
        let mut exts = Vec::new();
        for ext in ext_iter {
            exts.push(ext?);
        }
        Ok(exts.first().cloned())
    }

    // TODO: clean this up
    // pub fn delete_extension_by_identifier(&self, identifier: &str) -> Result<()> {
    //     self.conn.execute(
    //         "DELETE FROM extensions WHERE identifier = ?1",
    //         params![identifier],
    //     )?;
    //     Ok(())
    // }

    pub fn delete_extension_by_path(&self, path: &str) -> Result<()> {
        println!("DB deleting extension by path: {}", path);
        self.conn
            .execute("DELETE FROM extensions WHERE path = ?1", params![path])?;
        Ok(())
    }

    pub fn delete_extension_by_ext_id(&self, ext_id: i32) -> Result<()> {
        self.conn
            .execute("DELETE FROM extensions WHERE ext_id = ?1", params![ext_id])?;
        Ok(())
    }

    /* -------------------------------------------------------------------------- */
    /*                                Command CRUD                                */
    /* -------------------------------------------------------------------------- */
    pub fn create_command(
        &self,
        ext_id: i32,
        name: &str,
        cmd_type: CmdType,
        data: &str,
        enabled: bool,
        alias: Option<&str>,
        hotkey: Option<&str>,
    ) -> Result<()> {
        self.conn.execute(
            "INSERT INTO commands (ext_id, name, type, data, alias, hotkey, enabled) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![ext_id, name, cmd_type.to_string(), data, alias, hotkey, enabled],
        )?;
        Ok(())
    }

    pub fn get_command_by_id(&self, cmd_id: i32) -> Result<Option<models::Cmd>> {
        let mut stmt = self
            .conn
            .prepare("SELECT cmd_id, ext_id, name, type, data, alias, hotkey, enabled, usage_count, last_used_at FROM commands WHERE cmd_id = ?1")?;
        let cmd_iter = stmt.query_map(params![cmd_id], |row| {
            Ok(models::Cmd {
                cmd_id: row.get(0)?,
                ext_id: row.get(1)?,
                name: row.get(2)?,
                type_: row.get(3)?,
                data: row.get(4)?,
                alias: row.get(5)?,
                hotkey: row.get(6)?,
                enabled: row.get(7)?,
                usage_count: row.get(8)?,
                last_used_at: row.get(9)?,
            })
        })?;
        let mut cmds = Vec::new();
        for cmd in cmd_iter {
            cmds.push(cmd?);
        }
        Ok(cmds.first().cloned())
    }

    pub fn get_commands_by_ext_id(&self, ext_id: i32) -> Result<Vec<models::Cmd>> {
        let mut stmt = self
            .conn
            .prepare("SELECT cmd_id, ext_id, name, type, data, alias, hotkey, enabled, usage_count, last_used_at FROM commands WHERE ext_id = ?1")?;
        let cmd_iter = stmt.query_map(params![ext_id], |row| {
            Ok(models::Cmd {
                cmd_id: row.get(0)?,
                ext_id: row.get(1)?,
                name: row.get(2)?,
                type_: row.get(3)?,
                data: row.get(4)?,
                alias: row.get(5)?,
                hotkey: row.get(6)?,
                enabled: row.get(7)?,
                usage_count: row.get(8)?,
                last_used_at: row.get(9)?,
            })
        })?;
        let mut cmds = Vec::new();
        for cmd in cmd_iter {
            cmds.push(cmd?);
        }
        Ok(cmds)
    }

    pub fn delete_command_by_id(&self, cmd_id: i32) -> Result<()> {
        self.conn
            .execute("DELETE FROM commands WHERE cmd_id = ?1", params![cmd_id])?;
        Ok(())
    }

    pub fn update_command_by_id(
        &self,
        cmd_id: i32,
        name: &str,
        cmd_type: CmdType,
        data: &str,
        enabled: bool,
        alias: Option<&str>,
        hotkey: Option<&str>,
    ) -> Result<()> {
        self.conn.execute(
            "UPDATE commands SET name = ?1, type = ?2, data = ?3, alias = ?4, hotkey = ?5, enabled = ?6 WHERE cmd_id = ?7",
            params![name, cmd_type.to_string(), data, alias, hotkey, enabled, cmd_id],
        )?;
        Ok(())
    }

    /* -------------------------------------------------------------------------- */
    /*                            Extension Data CRUD                            */
    /* -------------------------------------------------------------------------- */
    pub fn create_extension_data(
        &self,
        ext_id: i32,
        data_type: &str,
        data: &str,
        search_text: Option<&str>,
        metadata: Option<&str>,
    ) -> Result<()> {
        self.conn.execute(
            "INSERT INTO extension_data (ext_id, data_type, data, search_text, metadata) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![ext_id, data_type, data, search_text, metadata],
        )?;
        Ok(())
    }

    pub fn get_extension_data_by_id(
        &self,
        data_id: i32,
        mut fields: Option<Vec<ExtDataField>>,
    ) -> Result<Option<models::ExtData>> {
        if fields.is_none() {
            fields = Some(vec![ExtDataField::Data, ExtDataField::SearchText]);
        }
        let contains_data_field = fields.as_ref().map_or(false, |fields| {
            fields.iter().any(|f| f == &ExtDataField::Data)
        });
        let contains_search_text_field = fields.as_ref().map_or(false, |fields| {
            fields.iter().any(|f| f == &ExtDataField::SearchText)
        });
        let mut query = String::from("SELECT data_id, ext_id, data_type, created_at, updated_at");
        if contains_data_field {
            query.push_str(", data");
        }
        if contains_search_text_field {
            query.push_str(", search_text");
        }
        query.push_str(
            " FROM extension_data
             WHERE data_id = ?1",
        );
        let mut stmt = self.conn.prepare(&query)?;
        let ext_data_iter = stmt.query_map(params![data_id], |row| {
            Ok(models::ExtData {
                data_id: row.get(0)?,
                ext_id: row.get(1)?,
                data_type: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
                data: match contains_data_field {
                    true => Some(row.get(5)?),
                    false => None,
                },
                search_text: match contains_search_text_field {
                    true => row.get(5 + contains_data_field as usize)?, // if contains_data_field is true, search_text is at index 6, otherwise 5
                    false => None,
                },
            })
        })?;
        let mut ext_data = Vec::new();
        for data in ext_data_iter {
            ext_data.push(data?);
        }
        Ok(ext_data.first().cloned())
    }

    /// Sample Queries With Different Search Modes
    /// ## Full Text Search (FTS) Mode:
    /// ```sql
    /// SELECT extension_data.*
    /// FROM extension_data
    /// JOIN extension_data_fts ON extension_data.data_id = extension_data_fts.data_id
    /// WHERE extension_data_fts.search_text MATCH 'extension_data';
    /// ```
    /// ## Exact Match Mode:
    /// ```sql
    /// SELECT extension_data.*
    /// FROM extension_data
    /// WHERE extension_data.search_text = 'extension_data';
    /// ```
    /// ## Like Mode:
    /// ```sql
    /// SELECT extension_data.*
    /// FROM extension_data
    /// WHERE extension_data.search_text LIKE '%extension_data%';
    /// ```
    pub fn search_extension_data(
        &self,
        search_query: ExtDataSearchQuery,
    ) -> Result<Vec<models::ExtData>> {
        let mut fields = search_query.fields;
        if fields.is_none() {
            fields = Some(vec![ExtDataField::Data, ExtDataField::SearchText]);
        }
        let contains_data_field = fields.as_ref().map_or(false, |fields| {
            fields.iter().any(|f| f == &ExtDataField::Data)
        });
        let contains_search_text_field = fields.as_ref().map_or(false, |fields| {
            fields.iter().any(|f| f == &ExtDataField::SearchText)
        });
        let mut query = String::from("SELECT ed.data_id as data_id, ed.ext_id as ext_id, ed.data_type as data_type, ed.created_at as created_at, ed.updated_at as updated_at");
        if contains_data_field {
            query.push_str(", ed.data as data");
        }
        if contains_search_text_field {
            query.push_str(", ed.search_text as search_text");
        }
        query.push_str(" FROM extension_data ed");
        if search_query.search_mode == SearchMode::FTS {
            query.push_str(" JOIN extension_data_fts edf ON ed.data_id = edf.data_id");
        }
        query.push_str(" WHERE ed.ext_id = ?1");
        let mut params: Vec<Box<dyn ToSql>> = vec![Box::new(search_query.ext_id)];
        let mut param_index = 2;

        if let Some(di) = search_query.data_id {
            query.push_str(&format!(" AND data_id = ?{}", param_index));
            params.push(Box::new(di));
            param_index += 1;
        }

        if let Some(dt) = search_query.data_type {
            query.push_str(&format!(" AND data_type = ?{}", param_index));
            params.push(Box::new(dt));
            param_index += 1;
        }

        if let Some(st) = search_query.search_text {
            match search_query.search_mode {
                SearchMode::ExactMatch => {
                    query.push_str(&format!(" AND ed.search_text = ?{}", param_index));
                    params.push(Box::new(st));
                }
                SearchMode::Like => {
                    query.push_str(&format!(" AND ed.search_text LIKE ?{}", param_index));
                    params.push(Box::new(format!("{}", st)));
                }
                SearchMode::FTS => {
                    // Join with FTS table and use MATCH operator
                    query.push_str(&format!(" AND edf.search_text MATCH ?{}", param_index));
                    params.push(Box::new(st));
                }
            }
            param_index += 1;
        }

        if let Some(after) = search_query.after_created_at {
            query.push_str(&format!(" AND created_at > ?{}", param_index));
            params.push(Box::new(after));
            param_index += 1;
        }

        if let Some(before) = search_query.before_created_at {
            query.push_str(&format!(" AND created_at < ?{}", param_index));
            params.push(Box::new(before));
            param_index += 1;
        }

        if let Some(order_by_created_at) = search_query.order_by_created_at {
            query.push_str(&format!(
                " ORDER BY created_at {}",
                order_by_created_at.to_string()
            ));
        }

        if let Some(order_by_updated_at) = search_query.order_by_updated_at {
            query.push_str(&format!(
                " ORDER BY updated_at {}",
                order_by_updated_at.to_string()
            ));
        }

        if let Some(limit) = search_query.limit {
            query.push_str(&format!(" LIMIT ?{}", param_index));
            params.push(Box::new(limit));
            param_index += 1;
        }
        if let Some(offset) = search_query.offset {
            query.push_str(&format!(" OFFSET ?{}", param_index));
            params.push(Box::new(offset));
            param_index += 1;
        }
        let mut stmt = self.conn.prepare(&query)?;
        let ext_data_iter =
            stmt.query_map(params_from_iter(params.iter().map(|p| p.as_ref())), |row| {
                Ok(models::ExtData {
                    data_id: row.get(0)?,
                    ext_id: row.get(1)?,
                    data_type: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                    data: match contains_data_field {
                        true => Some(row.get(5)?),
                        false => None,
                    },
                    search_text: match contains_search_text_field {
                        true => row.get(5 + contains_data_field as usize)?, // if contains_data_field is true, search_text is at index 6, otherwise 5
                        false => None,
                    },
                })
            })?;

        let mut ext_data = Vec::new();
        for data in ext_data_iter {
            ext_data.push(data?);
        }
        Ok(ext_data)
    }

    pub fn delete_extension_data_by_id(&self, data_id: i32) -> Result<()> {
        self.conn.execute(
            "DELETE FROM extension_data WHERE data_id = ?1",
            params![data_id],
        )?;
        Ok(())
    }

    pub fn update_extension_data_by_id(
        &self,
        data_id: i32,
        data: &str,
        search_text: Option<&str>,
    ) -> Result<()> {
        self.conn.execute(
            "UPDATE extension_data SET data = ?1, search_text = ?2 WHERE data_id = ?3",
            params![data, search_text, data_id],
        )?;
        Ok(())
    }

    /* -------------------------------------------------------------------------- */
    /*                            Command Aliases CRUD                            */
    /* -------------------------------------------------------------------------- */
    pub fn create_command_alias(&self, cmd_id: i32, alias: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO command_aliases (cmd_id, alias) VALUES (?1, ?2)",
            params![cmd_id, alias],
        )?;
        Ok(())
    }

    pub fn get_command_aliases_by_cmd_id(&self, cmd_id: i32) -> Result<Vec<models::CmdAlias>> {
        let mut stmt = self.conn.prepare(
            "SELECT alias_id, cmd_id, alias, created_at, updated_at FROM command_aliases WHERE cmd_id = ?1",
        )?;
        let alias_iter = stmt.query_map(params![cmd_id], |row| {
            Ok(models::CmdAlias {
                alias_id: row.get(0)?,
                cmd_id: row.get(1)?,
                alias: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;
        let mut aliases = Vec::new();
        for alias in alias_iter {
            aliases.push(alias?);
        }
        Ok(aliases)
    }

    pub fn get_command_alias_by_id(&self, alias_id: i32) -> Result<Option<models::CmdAlias>> {
        let mut stmt = self.conn.prepare(
            "SELECT alias_id, cmd_id, alias, created_at, updated_at FROM command_aliases WHERE alias_id = ?1",
        )?;
        let alias_iter = stmt.query_map(params![alias_id], |row| {
            Ok(models::CmdAlias {
                alias_id: row.get(0)?,
                cmd_id: row.get(1)?,
                alias: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;
        let mut aliases = Vec::new();
        for alias in alias_iter {
            aliases.push(alias?);
        }
        Ok(aliases.first().cloned())
    }

    pub fn delete_command_alias_by_id(&self, alias_id: i32) -> Result<()> {
        self.conn.execute(
            "DELETE FROM command_aliases WHERE alias_id = ?1",
            params![alias_id],
        )?;
        Ok(())
    }

    pub fn search_command_aliases(&self, search_text: &str) -> Result<Vec<models::CmdAlias>> {
        let mut stmt = self.conn.prepare(
            "SELECT ca.alias_id, ca.cmd_id, ca.alias, ca.created_at, ca.updated_at 
             FROM command_aliases ca
             JOIN command_aliases_fts caf ON ca.alias_id = caf.alias_id
             WHERE caf.alias MATCH ?1",
        )?;
        let alias_iter = stmt.query_map(params![search_text], |row| {
            Ok(models::CmdAlias {
                alias_id: row.get(0)?,
                cmd_id: row.get(1)?,
                alias: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;
        let mut aliases = Vec::new();
        for alias in alias_iter {
            aliases.push(alias?);
        }
        Ok(aliases)
    }

    pub fn update_command_usage(&self, cmd_id: i32) -> Result<()> {
        self.conn.execute(
            "UPDATE commands SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE cmd_id = ?1",
            params![cmd_id],
        )?;
        Ok(())
    }

    pub fn get_command_usage(&self, cmd_id: i32) -> Result<Option<(i32, String)>> {
        let mut stmt = self
            .conn
            .prepare("SELECT usage_count, last_used_at FROM commands WHERE cmd_id = ?1")?;
        let usage_iter = stmt.query_map(params![cmd_id], |row| Ok((row.get(0)?, row.get(1)?)))?;
        let mut usages = Vec::new();
        for usage in usage_iter {
            usages.push(usage?);
        }
        Ok(usages.first().cloned())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{fs, path::PathBuf};
    use tempfile::tempdir;

    #[test]
    fn test_get_connection() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let _conn = get_connection(&db_path, None).unwrap();
        assert!(fs::metadata(&db_path).is_ok());
        fs::remove_file(&db_path).unwrap();
    }

    #[test]
    fn test_extension_crud() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        // create database and initialize
        let db = JarvisDB::new(&db_path, None).unwrap();
        assert!(fs::metadata(&db_path).is_ok());
        db.init().unwrap();
        db.create_extension("test", "0.1.0", true, Some("/abc/def"), None)
            .unwrap();
        let exts = db.get_all_extensions().unwrap();
        assert_eq!(exts.len(), 1);

        // expect error due to unique identifier constraint
        assert!(db
            .create_extension("test", "0.1.0", true, Some("/abc/def"), None)
            .is_err());

        // get ext by identifier
        let ext = db.get_unique_extension_by_identifier("test").unwrap();
        assert!(ext.is_some());
        let ext = ext.unwrap();
        assert_eq!(ext.identifier, "test");
        assert_eq!(ext.version, "0.1.0");
        assert_eq!(ext.enabled, true);
        assert_eq!(ext.installed_at.len(), 19);

        // get ext by identifier that does not exist
        let ext = db.get_unique_extension_by_identifier("test2").unwrap();
        assert!(ext.is_none());

        /* ----------------------- Delete ext by identifier ---------------------- */
        // db.delete_extension_by_identifier("test").unwrap();
        db.delete_extension_by_path("/abc/def").unwrap();
        let exts = db.get_all_extensions().unwrap();
        assert_eq!(exts.len(), 0);

        fs::remove_file(&db_path).unwrap();
    }

    #[test]
    fn test_ext_data_crud() {
        // let dir = tempdir().unwrap();
        // let db_path = dir.path().join("test.db");
        let db_path = PathBuf::from("./test.db");
        if db_path.exists() {
            fs::remove_file(&db_path).unwrap();
        }

        // create database and initialize
        let db = JarvisDB::new(&db_path, None).unwrap();
        assert!(fs::metadata(&db_path).is_ok());
        db.init().unwrap();
        db.create_extension("test", "0.1.0", true, Some("/abc/def"), None)
            .unwrap();
        let ext = db
            .get_unique_extension_by_identifier("test")
            .unwrap()
            .unwrap();

        db.create_extension_data(ext.ext_id, "test", "{}", None, None)
            .unwrap();
        db.create_extension_data(ext.ext_id, "setting", "{}", None, None)
            .unwrap();
        /* ---------------------- Search with data_type == test --------------------- */
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: Some("test".to_string()),
                search_text: None,
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();

        assert_eq!(ext_data.len(), 1); // there is only one record with data_type == test

        /* ------------------------ Search without any filter ----------------------- */
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: None,
                search_text: None,
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 2); // one test, one setting

        // /* -------------------------- Test Full Text Search ------------------------- */
        let json_data = json!({
            "name": "John Doe",
            "age": 43,
            "phones": [
                "+44 1234567",
                "+44 2345678"
            ]
        });
        db.create_extension_data(
            ext.ext_id,
            "data",
            "{}",
            Some("hello world from rust"),
            Some(json_data.to_string().as_str()),
        )
        .unwrap();
        db.create_extension_data(
            ext.ext_id,
            "data",
            "{}",
            Some("world is a mess"),
            Some(json_data.to_string().as_str()),
        )
        .unwrap();
        // Search Mode: Like
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::Like,
                data_type: Some("data".to_string()),
                search_text: Some("worl%".to_string()),
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 1);
        /* ----------------------- both record contains world ----------------------- */
        // Search Mode: FTS
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: Some("data".to_string()),
                search_text: Some("wOrLd".to_string()), // FTS is case insensitive
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 2);
        /* ------------------------ search for rust with FTS ------------------------ */
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: Some("data".to_string()),
                search_text: Some("rust".to_string()),
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 1);

        // get ext data with search text that does not exist
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: Some("test".to_string()),
                search_text: Some("test".to_string()),
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 0);

        /* ---------------- All 4 test records are created after 2021 --------------- */
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: None,
                search_text: None,
                after_created_at: Some("2021-01-01".to_string()),
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 4);

        // no filter, get all records
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: None,
                search_text: None,
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 4);

        /* --------------- All 4 test records are created before 2030 --------------- */
        // if this code still runs in 2030, I will be very happy to fix this test
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: None,
                search_text: None,
                after_created_at: None,
                before_created_at: Some("2030-01-01".to_string()),
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 4);

        // get ext data with created_at filter that does not exist
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::ExactMatch,
                data_type: None,
                search_text: None,
                after_created_at: Some("2021-01-01".to_string()),
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 4);

        /* ---------------------- Delete ext data by data_id ---------------------- */
        // there is only one record with data_type == setting
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: Some("setting".to_string()),
                search_text: None,
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        let data_id = ext_data.first().unwrap().data_id;
        db.delete_extension_data_by_id(data_id).unwrap();
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: Some("setting".to_string()),
                search_text: None,
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        assert_eq!(ext_data.len(), 0);

        /* ---------------------- Update ext data by data_id ---------------------- */
        let ext_data = db
            .search_extension_data(ExtDataSearchQuery {
                ext_id: ext.ext_id,
                fields: None,
                data_id: None,
                search_mode: SearchMode::FTS,
                data_type: Some("data".to_string()),
                search_text: None,
                after_created_at: None,
                before_created_at: None,
                order_by_created_at: None,
                order_by_updated_at: None,
                limit: None,
                offset: None,
            })
            .unwrap();
        let data_id = ext_data.first().unwrap().data_id;
        db.update_extension_data_by_id(data_id, "{\"name\": \"huakun\"}", Some("updated"))
            .unwrap();
        let ext_data = db.get_extension_data_by_id(data_id, None).unwrap();
        assert!(ext_data.is_some());
        let ext_data = ext_data.unwrap();
        assert_eq!(ext_data.data.unwrap(), "{\"name\": \"huakun\"}");

        /* ----------------------------- Optional Fields ---------------------------- */
        // let ext_data = db
        //     .search_extension_data(ext.ext_id, false, None, Some("data"), None, None, None, None, None, None, vec![])
        //     .unwrap();

        fs::remove_file(&db_path).unwrap();
    }

    #[test]
    fn test_command_crud() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        // create database and initialize
        let db = JarvisDB::new(&db_path, None).unwrap();
        assert!(fs::metadata(&db_path).is_ok());
        db.init().unwrap();
        db.create_extension("test", "0.1.0", true, None, None)
            .unwrap();
        let ext = db
            .get_unique_extension_by_identifier("test")
            .unwrap()
            .unwrap();

        db.create_command(ext.ext_id, "test", CmdType::Iframe, "{}", true, None, None)
            .unwrap();
        db.create_command(
            ext.ext_id,
            "test2",
            CmdType::UiWorker,
            "{}",
            true,
            Some("t2"),
            Some("t2"),
        )
        .unwrap();
        /* ---------------------- Get command by id ---------------------- */
        let cmd = db.get_command_by_id(1).unwrap().unwrap();
        assert_eq!(cmd.name, "test");
        assert_eq!(cmd.type_, models::CmdType::Iframe);
        assert_eq!(cmd.data, "{}");

        /* ---------------------- Get commands by ext_id ---------------------- */
        let cmds = db.get_commands_by_ext_id(ext.ext_id).unwrap();
        assert_eq!(cmds.len(), 2);

        // test command test2's alias and hotkey
        let cmd = db.get_command_by_id(cmds[1].cmd_id).unwrap().unwrap();
        assert_eq!(cmd.alias.unwrap(), "t2");
        assert_eq!(cmd.hotkey.unwrap(), "t2");

        /* ---------------------- Delete command by id ---------------------- */
        db.delete_command_by_id(1).unwrap();
        let cmds = db.get_commands_by_ext_id(ext.ext_id).unwrap();
        assert_eq!(cmds.len(), 1);

        /* ---------------------- Update command by id ---------------------- */
        db.update_command_by_id(
            cmds[0].cmd_id,
            "test3",
            CmdType::UiWorker,
            "{}",
            false,
            Some("alias"),
            Some("Command+U"),
        )
        .unwrap();
        let cmd = db.get_command_by_id(cmds[0].cmd_id).unwrap().unwrap();
        assert_eq!(cmd.name, "test3");
        assert_eq!(cmd.type_, models::CmdType::UiWorker);
        assert_eq!(cmd.data, "{}");
        assert_eq!(cmd.enabled, false);
        assert_eq!(cmd.alias.unwrap(), "alias");
        assert_eq!(cmd.hotkey.unwrap(), "Command+U");

        fs::remove_file(&db_path).unwrap();
    }

    #[test]
    fn test_select_and_execute() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let db = JarvisDB::new(&db_path, None).unwrap();
        db.init().unwrap();

        // Create a simple todo table
        db.execute(
            "CREATE TABLE todos (id INTEGER PRIMARY KEY, title TEXT, completed BOOLEAN)",
            vec![],
        )
        .unwrap();

        // Test execute with INSERT
        let (rows_affected, last_id) = db
            .execute(
                "INSERT INTO todos (title, completed) VALUES (?1, ?2)",
                vec![json!("Buy groceries"), json!(false)],
            )
            .unwrap();
        assert_eq!(rows_affected, 1);
        assert_eq!(last_id, 1);

        // Test select with basic query
        let results = db
            .select(
                "SELECT title, completed FROM todos WHERE id = ?1".to_string(),
                vec![json!(1)],
            )
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0][0], "Buy groceries");
        assert_eq!(results[0][1], "false");

        // Test execute with UPDATE
        let (rows_affected, _) = db
            .execute(
                "UPDATE todos SET completed = ?1 WHERE id = ?2",
                vec![json!(true), json!(1)],
            )
            .unwrap();
        assert_eq!(rows_affected, 1);

        // Verify the update with select
        let results = db
            .select(
                "SELECT completed FROM todos WHERE id = ?1".to_string(),
                vec![json!(1)],
            )
            .unwrap();
        assert_eq!(results[0][0], "true");

        // Test execute with DELETE
        let (rows_affected, _) = db
            .execute("DELETE FROM todos WHERE id = ?1", vec![json!(1)])
            .unwrap();
        assert_eq!(rows_affected, 1);

        // Verify the deletion
        let results = db
            .select("SELECT COUNT(*) as count FROM todos".to_string(), vec![])
            .unwrap();
        assert_eq!(results[0][0], 0);

        fs::remove_file(&db_path).unwrap();
    }
}
