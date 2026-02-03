use std::fs;

#[tauri::command]
pub fn get_gtk_css() -> Result<String, String> {
    let home = std::env::var("HOME").map_err(|_| "HOME environment variable not set")?;
    let css_path = format!("{}/.config/gtk-4.0/gtk.css", home);
    match fs::read_to_string(&css_path) {
        Ok(content) => Ok(content),
        Err(_) => Ok(String::new()), // Return empty if file doesn't exist or can't read
    }
}
