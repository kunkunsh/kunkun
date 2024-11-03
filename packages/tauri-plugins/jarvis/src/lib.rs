use commands::discovery::Peers;
use db::JarvisDB;
use model::extension::Extension;
use server::Protocol;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
pub mod commands;
pub mod constants;
pub mod model;
pub mod server;
pub mod setup;
pub mod syscmds;
pub mod utils;
pub use db;
use std::{collections::HashMap, path::PathBuf, sync::Mutex};
use tauri_plugin_store::StoreBuilder;
use utils::{
    path::{get_default_extensions_dir, get_kunkun_db_path},
    settings::AppSettings,
};

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

// mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Jarvis;
#[cfg(mobile)]
use mobile::Jarvis;

#[derive(Default)]
pub struct JarvisState {
    pub window_label_ext_map: Mutex<HashMap<String, Extension>>,
}

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the jarvis APIs.
pub trait JarvisExt<R: Runtime> {
    fn jarvis(&self) -> &Jarvis<R>;
}

impl<R: Runtime, T: Manager<R>> crate::JarvisExt<R> for T {
    fn jarvis(&self) -> &Jarvis<R> {
        self.state::<Jarvis<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("jarvis")
        .invoke_handler(tauri::generate_handler![
            /* ------------------------------ dev commands ------------------------------ */
            commands::dev::open_devtools,
            commands::dev::close_devtools,
            commands::dev::is_devtools_open,
            commands::dev::toggle_devtools,
            commands::dev::app_is_dev,
            /* ------------------------------ path commands ----------------------------- */
            commands::path::get_default_extensions_dir,
            commands::path::get_default_extensions_storage_dir,
            /* ----------------------------- system commands ---------------------------- */
            commands::system::open_trash,
            commands::system::empty_trash,
            commands::system::shutdown,
            commands::system::reboot,
            commands::system::sleep,
            commands::system::toggle_system_appearance,
            commands::system::show_desktop,
            commands::system::quit_all_apps,
            commands::system::sleep_displays,
            commands::system::set_volume,
            commands::system::turn_volume_up,
            commands::system::turn_volume_down,
            commands::system::toggle_stage_manager,
            commands::system::toggle_bluetooth,
            commands::system::toggle_hidden_files,
            commands::system::eject_all_disks,
            commands::system::logout_user,
            commands::system::toggle_mute,
            commands::system::mute,
            commands::system::unmute,
            commands::system::hide_all_apps_except_frontmost,
            commands::system::get_frontmost_app,
            commands::system::get_selected_files_in_file_explorer,
            /* ------------------------------ applications ------------------------------ */
            commands::apps::get_applications,
            commands::apps::refresh_applications_list,
            commands::apps::refresh_applications_list_in_bg,
            /* ------------------------------- extensions ------------------------------- */
            // commands::extension::load_manifest,
            // commands::extension::load_all_extensions,
            /* ---------------------------------- utils --------------------------------- */
            commands::fs::path_exists,
            /* -------------------------------- security -------------------------------- */
            #[cfg(target_os = "macos")]
            commands::security::verify_auth,
            #[cfg(target_os = "macos")]
            commands::security::request_screen_capture_access,
            #[cfg(target_os = "macos")]
            commands::security::check_screen_capture_access,
            /* --------------------------------- server --------------------------------- */
            commands::server::start_server,
            commands::server::stop_server,
            commands::server::restart_server,
            commands::server::server_is_running,
            commands::server::get_server_port,
            /* ----------------------------------- fs ----------------------------------- */
            commands::fs::decompress_tarball,
            commands::fs::compress_tarball,
            commands::fs::unzip,
            /* ------------------------------- file search ------------------------------ */
            commands::file_search::file_search,
            /* ------------------------------- extensions ------------------------------- */
            commands::extension::is_window_label_registered,
            commands::extension::register_extension_window,
            commands::extension::unregister_extension_window,
            commands::extension::register_extension_spawned_process,
            commands::extension::unregister_extension_spawned_process,
            commands::extension::get_ext_label_map,
            /* ---------------------- extension storage API wrapper --------------------- */
            // commands::storage::ext_store_wrapper_set,
            // commands::storage::ext_store_wrapper_get,
            // commands::storage::ext_store_wrapper_has,
            // commands::storage::ext_store_wrapper_delete,
            // commands::storage::ext_store_wrapper_clear,
            // commands::storage::ext_store_wrapper_reset,
            // commands::storage::ext_store_wrapper_keys,
            // commands::storage::ext_store_wrapper_values,
            // commands::storage::ext_store_wrapper_entries,
            // commands::storage::ext_store_wrapper_length,
            // commands::storage::ext_store_wrapper_load,
            // commands::storage::ext_store_wrapper_save,
            /* -------------------------------- database -------------------------------- */
            commands::db::create_extension,
            commands::db::get_all_extensions,
            commands::db::get_unique_extension_by_identifier,
            commands::db::get_unique_extension_by_path,
            commands::db::get_all_extensions_by_identifier,
            commands::db::delete_extension_by_path,
            commands::db::delete_extension_by_ext_id,
            commands::db::create_command,
            commands::db::get_command_by_id,
            commands::db::get_commands_by_ext_id,
            commands::db::delete_command_by_id,
            commands::db::update_command_by_id,
            commands::db::create_extension_data,
            commands::db::get_extension_data_by_id,
            commands::db::search_extension_data,
            commands::db::delete_extension_data_by_id,
            commands::db::update_extension_data_by_id,
            /* -------------------------------- Clipboard ------------------------------- */
            commands::clipboard::get_history,
            commands::clipboard::add_to_history,
            /* -------------------------------------------------------------------------- */
            /*                                    Utils                                   */
            /* -------------------------------------------------------------------------- */
            commands::utils::plist_to_json,
            /* -------------------------------------------------------------------------- */
            /*                                    MDNS                                    */
            /* -------------------------------------------------------------------------- */
            commands::discovery::get_peers
        ])
        .setup(|app, api| {
            // #[cfg(mobile)]
            // let jarvis = mobile::init(app, api)?;
            #[cfg(desktop)]
            let jarvis = desktop::init(app, api)?;
            app.manage(jarvis);
            utils::setup::setup_app_path(app);
            utils::setup::setup_extension_storage(app);

            // manage state so it is accessible by the commands
            app.manage(JarvisState::default());
            app.manage(commands::apps::ApplicationsState::default());
            let db_path = get_kunkun_db_path(app)?;
            let db_key: Option<String> = None;
            app.manage(commands::db::DBState::new(db_path.clone(), db_key.clone())?);
            setup::db::setup_db(app)?;
            println!("Jarvis Plugin Initialized");
            app.manage(Peers::default());
            Ok(())
        })
        .build()
}
