use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Jarvis<R>> {
    Ok(Jarvis(app.clone()))
}

/// Access to the jarvis APIs.
pub struct Jarvis<R: Runtime>(AppHandle<R>);

impl<R: Runtime> Jarvis<R> {}
