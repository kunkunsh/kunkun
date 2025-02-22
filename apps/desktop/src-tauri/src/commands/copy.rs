use std::path::PathBuf;

#[tauri::command]
pub async fn copy_dir_all(from: String, to: String) -> Result<(), String> {
    let from_path = PathBuf::from(from);
    let to_path = PathBuf::from(to);

    copy_dir_recursively(&from_path, &to_path).map_err(|e| e.to_string())
}

fn copy_dir_recursively(
    from: &std::path::Path,
    to: &std::path::Path,
) -> Result<(), std::io::Error> {
    if !from.is_dir() {
        std::fs::copy(from, to)?;
        return Ok(());
    }

    std::fs::create_dir_all(to)?;

    for entry in std::fs::read_dir(from)? {
        let entry = entry?;
        let from_path = entry.path();
        let to_path = to.join(entry.file_name());

        if from_path.is_dir() {
            copy_dir_recursively(&from_path, &to_path)?;
        } else {
            std::fs::copy(&from_path, &to_path)?;
        }
    }

    Ok(())
}
