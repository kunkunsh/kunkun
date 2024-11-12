use std::{path::PathBuf, sync::Mutex};
mod setup;
pub mod utils;
use log;
#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;
use tauri::Manager;
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_jarvis::{
    db::JarvisDB,
    server::Protocol,
    utils::{
        path::{get_default_extensions_dir, get_kunkun_db_path},
        settings::AppSettings,
    },
};
pub use tauri_plugin_log::fern::colors::ColoredLevelConfig;
use tauri_plugin_store::{StoreBuilder, StoreExt};
use utils::server::tauri_file_server;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = tauri::generate_context!();
    let mut builder = tauri::Builder::default();

    #[cfg(debug_assertions)]
    {
        println!("Install crabnebula devtools");
        // let devtools = tauri_plugin_devtools::init(); // initialize the plugin as early as possible
        // builder = builder.plugin(devtools);
    }
    // #[cfg(not(debug_assertions))]
    // {
    //     builder = builder.plugin(
    //         tauri_plugin_log::Builder::new()
    //             .targets(utils::log::get_log_targets())
    //             .level(utils::log::get_log_level())
    //             .filter(|metadata| !metadata.target().starts_with("mdns_sd"))
    //             .with_colors(ColoredLevelConfig::default())
    //             .max_file_size(10_000_000) // max 10MB
    //             .format(|out, message, record| {
    //                 out.finish(format_args!(
    //                     "{}[{}] {}",
    //                     chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
    //                     // record.target(),
    //                     record.level(),
    //                     message
    //                 ))
    //             })
    //             .build(),
    //     );
    // }

    let shell_unlocked = true;
    builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets(utils::log::get_log_targets())
                .level(utils::log::get_log_level())
                .filter(|metadata| !metadata.target().starts_with("mdns_sd"))
                .with_colors(ColoredLevelConfig::default())
                .max_file_size(10_000_000) // max 10MB
                .format(|out, message, record| {
                    out.finish(format_args!(
                        "{}[{}] {}",
                        chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
                        // record.target(),
                        record.level(),
                        message
                    ))
                })
                .build(),
        )
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shellx::init(shell_unlocked))
        .plugin(tauri_plugin_jarvis::init())
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_network::init())
        .plugin(tauri_plugin_system_info::init());

    let app = builder
        .register_uri_scheme_protocol("appicon", |_app, request| {
            let url = &request.uri().path()[1..];
            let url = urlencoding::decode(url).unwrap().to_string();
            let path = PathBuf::from(url);
            return tauri_plugin_jarvis::utils::icns::load_icon(path);
        })
        .register_uri_scheme_protocol("ext", |app, request| {
            let app_handle = app.app_handle();
            // app_handle.
            let win_label = app.webview_label();
            let jarvis_state = app_handle.state::<tauri_plugin_jarvis::JarvisState>();
            let window_ext_map = jarvis_state.window_label_ext_map.lock().unwrap();
            match window_ext_map.get(win_label) {
                Some(ext) => {
                    // let app_state = app_handle.state::<tauri_plugin_jarvis::model::app_state::AppState>();
                    // let extension_path = app_state.extension_path.lock().unwrap().clone();
                    tauri_file_server(
                        app_handle,
                        request,
                        ext.info.path.clone(),
                        ext.info.dist.clone(),
                    )
                }
                None => tauri::http::Response::builder()
                    .status(tauri::http::StatusCode::NOT_FOUND)
                    .header("Access-Control-Allow-Origin", "*")
                    .body("Extension Not Found".as_bytes().to_vec())
                    .unwrap(),
            }
        })
        .setup(|app| {
            setup::window::setup_window(app.handle());
            setup::tray::create_tray(app.handle())?;
            #[cfg(all(not(target_os = "macos"), debug_assertions))]
            {
                app.deep_link().register("kunkun")?;
            }
            // setup::deeplink::setup_deeplink(app);
            // #[cfg(all(target_os = "macos", debug_assertions))]
            // app.set_activation_policy(ActivationPolicy::Accessory);
            // let mut store = StoreBuilder::new("appConfig.bin").build(app.handle().clone());
            // let store = app.handle().store_builder("appConfig.json").build()?;

            // let app_settings = match AppSettings::load_from_store(&store) {
            //     Ok(settings) => settings,
            //     Err(_) => AppSettings::default(),
            // };
            // let dev_extension_path: Option<PathBuf> = app_settings.dev_extension_path.clone();
            let my_port = tauri_plugin_network::network::scan::find_available_port_from_list(
                tauri_plugin_jarvis::server::CANDIDATE_PORTS.to_vec(),
            )
            .unwrap();
            log::info!("Jarvis Server Port: {}", my_port);
            // log::info!(
            //     "App Settings Dev Extension Path: {:?}",
            //     app_settings.dev_extension_path.clone(),
            // );
            app.manage(tauri_plugin_jarvis::server::http::Server::new(
                app.handle().clone(),
                my_port,
                Protocol::Http,
                // Protocol::Https,
            ));
            app.manage(tauri_plugin_jarvis::model::app_state::AppState {});
            tauri_plugin_jarvis::setup::server::setup_server(app.handle())?; // start the server

            let mdns = tauri_plugin_jarvis::setup::peer_discovery::setup_mdns(my_port)?;
            tauri_plugin_jarvis::setup::peer_discovery::handle_mdns_service_evt(
                app.handle(),
                mdns.browse()?,
            );

            /* ----------------------------- Database Setup ----------------------------- */
            // setup::db::setup_db(app)?;
            /* ------------------------- Clipboard History Setup ------------------------ */
            let db_path = get_kunkun_db_path(app.app_handle())?;
            let db_key: Option<String> = None;
            let jarvis_db = JarvisDB::new(db_path.clone(), db_key.clone())?;
            // The clipboard extension should be created in setup_db, ext is guaranteed to be Some
            let ext = jarvis_db.get_unique_extension_by_identifier(
                tauri_plugin_jarvis::constants::KUNKUN_CLIPBOARD_EXT_IDENTIFIER,
            )?;

            app.manage(
                tauri_plugin_jarvis::model::clipboard_history::ClipboardHistory::new(
                    jarvis_db,
                    ext.unwrap().ext_id,
                ),
            );
            let (clipboard_update_tx, clipboard_update_rx) = tokio::sync::broadcast::channel::<
                tauri_plugin_jarvis::model::clipboard_history::Record,
            >(10);
            /* --------------------------- Cliipboard Listener -------------------------- */
            setup::clipboard::setup_clipboard_listener(
                &app.app_handle(),
                clipboard_update_tx.clone(),
            );
            app.state::<tauri_plugin_clipboard::Clipboard>()
                .start_monitor(app.app_handle().clone())?;
            setup::clipboard::setup_clipboard_update_handler(app.app_handle(), clipboard_update_rx);

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                // window.close_devtools();
            }

            let main_window = app.get_webview_window("main").unwrap();
            std::thread::spawn(move || {
                // this is a backup plan, if frontend is not properly loaded, show() will not be called, then we need to call it manually from rust after a long delay
                std::thread::sleep(std::time::Duration::from_secs(1));
                main_window.show().unwrap();
            });
            Ok(())
        })
        .build(context)
        .expect("error while running tauri application");
    app.run(|_app_handle, event| match event {
        // tauri::RunEvent::Exit => todo!(),
        // tauri::RunEvent::ExitRequested { code, api, .. } => todo!(),
        // tauri::RunEvent::WindowEvent { label, event, .. } => todo!(),
        // tauri::RunEvent::WebviewEvent { label, event, .. } => todo!(),
        // tauri::RunEvent::Ready => todo!(),
        // tauri::RunEvent::Resumed => todo!(),
        // tauri::RunEvent::MainEventsCleared => todo!(),
        // tauri::RunEvent::Opened { urls } => todo!(),
        // tauri::RunEvent::MenuEvent(_) => todo!(),
        // tauri::RunEvent::TrayIconEvent(_) => todo!(),
        #[cfg(target_os = "macos")]
        tauri::RunEvent::Reopen {
            has_visible_windows,
            ..
        } => {
            _app_handle
                .webview_windows()
                .iter()
                .for_each(|(label, window)| {
                    window.show().unwrap();
                });
            // let main_window = _app_handle.get_webview_window("main").unwrap();
            // main_window.show().unwrap();
        }
        _ => {}
    });
}
