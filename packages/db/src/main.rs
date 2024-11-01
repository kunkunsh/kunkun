use db::JarvisDB;
use rusqlite::{params, Connection, Result};

fn main() -> Result<()> {
    let db = JarvisDB::new("jarvis.db", None)?;
    db.init()?;
    db.create_extension("test", "0.1.0", true, None, None)?;
    let plugins = db.get_all_extensions()?;
    for plugin in plugins {
        println!("{:#?}", plugin);
    }
    Ok(())
}
