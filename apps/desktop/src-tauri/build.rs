fn main() {
    let db_enc_key = match std::env::var("DB_ENCRYPTION_KEY") {
        Ok(key) => key,
        Err(_) => String::from("none"),
    };
    println!("cargo:rustc-env=DB_ENCRYPTION_KEY={}", db_enc_key);
    tauri_build::build()
}
