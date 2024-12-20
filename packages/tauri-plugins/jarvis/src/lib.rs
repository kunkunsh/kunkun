use commands::discovery::Peers;
use model::extension::Extension;
use models::FileTransferState;
use openssl::{
    pkey::{Private, Public},
    rsa::Rsa,
};
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
use std::{collections::HashMap, sync::Mutex};
use utils::path::get_kunkun_db_path;

#[cfg(mobile)]
mod mobile;

// mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(mobile)]
use mobile::Jarvis;

pub struct JarvisState {
    pub window_label_ext_map: Mutex<HashMap<String, Extension>>,
    // the pair of RSA keys are newly generated everytime the app is started and store only in memory, used for encryption and signing
    pub rsa_private_key: Rsa<Private>,
    pub rsa_public_key: Rsa<Public>,
}

impl JarvisState {
    pub fn new() -> Self {
        let private_key =
            crypto::RsaCrypto::generate_rsa().expect("Failed to generate RSA key pair");
        let public_key: Rsa<Public> = crypto::RsaCrypto::private_key_to_public_key(&private_key);
        Self {
            window_label_ext_map: Mutex::new(HashMap::new()),
            rsa_private_key: private_key,
            rsa_public_key: public_key,
        }
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>(db_key: Option<String>) -> TauriPlugin<R> {
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
            commands::extension::spawn_extension_file_server,
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
            commands::discovery::get_peers,
            /* -------------------------------------------------------------------------- */
            /*                                File Transfer                               */
            /* -------------------------------------------------------------------------- */
            // commands::server::get_files_to_send,
            commands::file_transfer::get_file_transfer_bucket_keys,
            commands::file_transfer::get_file_transfer_bucket_by_key,
            commands::file_transfer::local_net_send_file,
            commands::file_transfer::download_files,
            commands::file_transfer::file_transfer_preview_bucket,
        ])
        .setup(move |app, api| {
            utils::setup::setup_app_path(app);
            utils::setup::setup_extension_storage(app);

            // manage state so it is accessible by the commands
            app.manage(JarvisState::new());
            app.manage(FileTransferState::default());
            app.manage(commands::apps::ApplicationsState::default());
            let db_path = get_kunkun_db_path(app)?;
            app.manage(commands::db::DBState::new(db_path.clone(), db_key.clone())?);
            setup::db::setup_db(app)?;
            println!("Jarvis Plugin Initialized");
            app.manage(Peers::default());

            // let jarvis_db = utils::db::get_db(db_path, db_key)?;
            // let ext = jarvis_db
            //     .get_unique_extension_by_identifier(constants::KUNKUN_CLIPBOARD_EXT_IDENTIFIER)?;
            // app.manage(model::clipboard_history::ClipboardHistory::new(
            //     jarvis_db,
            //     ext.unwrap().ext_id,
            // ));
            Ok(())
        })
        .build()
}
