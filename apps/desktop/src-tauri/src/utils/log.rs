use log::info;
use tauri::{AppHandle, Manager};
use tauri_plugin_log::{Target as LogTarget, TargetKind};

pub fn get_log_targets() -> Vec<LogTarget> {
    #[cfg(debug_assertions)]
    let log_targets = vec![
        LogTarget::new(TargetKind::Stdout),
        LogTarget::new(TargetKind::LogDir {
            file_name: Some(format!(
                "dev:kunkun-{}",
                chrono::Local::now().format("%Y-%m-%d")
            )),
        }),
        LogTarget::new(TargetKind::Webview),
    ];
    #[cfg(not(debug_assertions))]
    let log_targets = vec![
        LogTarget::new(TargetKind::Stdout),
        LogTarget::new(TargetKind::LogDir {
            file_name: Some(format!(
                "kunkun-{}",
                chrono::Local::now().format("%Y-%m-%d")
            )),
        }),
    ];
    log_targets
}

pub fn get_log_level() -> log::LevelFilter {
    #[cfg(debug_assertions)]
    return log::LevelFilter::Debug;
    #[cfg(not(debug_assertions))]
    return log::LevelFilter::Info;
}

/// Remove log files that are older than 3 days
pub fn clear_old_log_files(app_handle: &AppHandle) -> Result<(), tauri::Error> {
    let log_dir = app_handle.path().app_log_dir()?;
    let files = std::fs::read_dir(log_dir)?;
    for file in files {
        let file = file?;
        let path = file.path();
        let metadata = std::fs::metadata(&path)?;
        let modified_datetime: chrono::DateTime<chrono::Local> = metadata.modified()?.into();
        let now = chrono::Local::now();
        let duration = now.signed_duration_since(modified_datetime);
        if duration.num_days() > 3 {
            info!("Removing old log file: {:?}", path);
            std::fs::remove_file(&path)?;
        }
    }
    Ok(())
}
