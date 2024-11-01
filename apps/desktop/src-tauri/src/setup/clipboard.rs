use log::error;
use std::time::SystemTime;
use tauri::{AppHandle, Emitter, Listener, Manager, Runtime};
use tauri_plugin_jarvis::model::clipboard_history;
use tokio::sync::broadcast::{Receiver, Sender};

pub fn setup_clipboard_listener<R: Runtime>(
    app: &tauri::AppHandle<R>,
    clipboard_update_tx: Sender<clipboard_history::Record>,
) {
    let app2 = app.clone();
    app.listen(
        "plugin:clipboard://clipboard-monitor/update",
        move |_event| {
            let clipboard = app2.state::<tauri_plugin_clipboard::Clipboard>();
            // let clipboard_history = app2.state::<clipboard_history::ClipboardHistory>();
            let available_types = clipboard.available_types().unwrap();
            let mut rec = clipboard_history::Record {
                timestamp: SystemTime::now()
                    .duration_since(SystemTime::UNIX_EPOCH)
                    .unwrap()
                    .as_millis(),
                content_type: clipboard_history::ClipboardContentType::Text,
                value: "test".to_string(),
                text: "test".to_string(),
            };
            if available_types.image {
                rec.content_type = clipboard_history::ClipboardContentType::Image;
                rec.value = clipboard.read_image_base64().unwrap();
                rec.text = "Image".to_string();
            } else if available_types.html {
                rec.content_type = clipboard_history::ClipboardContentType::Html;
                let html = clipboard.read_html().unwrap();
                rec.value = html.clone();
                if available_types.text {
                    rec.text = clipboard.read_text().unwrap();
                } else {
                    rec.text = html;
                }
            } else if available_types.rtf {
                rec.content_type = clipboard_history::ClipboardContentType::Rtf;
                let rtf = clipboard.read_rtf().unwrap();
                rec.value = rtf.clone();
                if available_types.text {
                    rec.text = clipboard.read_text().unwrap();
                } else {
                    rec.text = rtf;
                }
            } else if available_types.files {
                rec.content_type = clipboard_history::ClipboardContentType::Text;
                rec.value = clipboard.read_files().unwrap().join("\n");
                rec.text = "Files".to_string();
            } else if available_types.text {
                rec.content_type = clipboard_history::ClipboardContentType::Text;
                rec.value = clipboard.read_text().unwrap();
                rec.text = rec.value.clone();
            }
            match clipboard_update_tx.send(rec) {
                Ok(_) => {}
                Err(e) => {
                    error!("Error sending clipboard record: {:?}", e);
                }
            };
            // clipboard_history.add_record(rec);
            // app2.emit("new_clipboard_item_added", ()).unwrap();
        },
    );
}

pub fn setup_clipboard_update_handler<R: Runtime>(
    app_handle: &AppHandle<R>,
    mut clipboard_update_rx: Receiver<clipboard_history::Record>,
) {
    let app_handle = app_handle.clone();
    tauri::async_runtime::spawn(async move {
        loop {
            let record = clipboard_update_rx.recv().await.unwrap();
            let clipboard_history = app_handle.state::<clipboard_history::ClipboardHistory>();
            clipboard_history.add_record(record).unwrap();
            app_handle.emit("new_clipboard_item_added", ()).unwrap();
        }
    });
}
