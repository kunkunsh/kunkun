use base64::prelude::*;

const COMMANDS: &[&str] = &[
    "open_devtools",
    "close_devtools",
    "is_devtools_open",
    "toggle_devtools",
    "app_is_dev",
    "open_trash",
    "empty_trash",
    "shutdown",
    "reboot",
    "sleep",
    "toggle_system_appearance",
    "show_desktop",
    "quit_all_apps",
    "sleep_displays",
    "set_volume",
    "turn_volume_up",
    "turn_volume_down",
    "toggle_stage_manager",
    "toggle_bluetooth",
    "toggle_hidden_files",
    "eject_all_disks",
    "logout_user",
    "toggle_mute",
    "mute",
    "unmute",
    "hide_all_apps_except_frontmost",
    "get_selected_files_in_file_explorer",
    "run_apple_script",
    "run_powershell",
    "get_applications",
    "refresh_applications_list",
    "refresh_applications_list_in_bg",
    // "load_manifest",
    // "load_all_extensions",
    "path_exists",
    "start_server",
    "stop_server",
    "restart_server",
    "set_dev_extension_folder",
    "set_extension_folder",
    "get_extension_folder",
    "get_dev_extension_folder",
    "server_is_running",
    /* -------------------------------------------------------------------------- */
    /*                                     FS                                     */
    /* -------------------------------------------------------------------------- */
    "decompress_tarball",
    "compress_tarball",
    "unzip",
    /* -------------------------------------------------------------------------- */
    /*                                 File Search                                */
    /* -------------------------------------------------------------------------- */
    "file_search",
    /* -------------------------------------------------------------------------- */
    /*                                    Path                                    */
    /* -------------------------------------------------------------------------- */
    "get_default_extensions_dir",
    "get_default_extensions_storage_dir",
    "is_window_label_registered",
    "register_extension_window",
    "register_extension_spawned_process",
    "unregister_extension_spawned_process",
    "unregister_extension_window",
    "spawn_extension_file_server",
    "get_ext_label_map",
    // "ext_store_wrapper_set",
    // "ext_store_wrapper_get",
    // "ext_store_wrapper_has",
    // "ext_store_wrapper_delete",
    // "ext_store_wrapper_clear",
    // "ext_store_wrapper_reset",
    // "ext_store_wrapper_keys",
    // "ext_store_wrapper_values",
    // "ext_store_wrapper_entries",
    // "ext_store_wrapper_length",
    // "ext_store_wrapper_load",
    // "ext_store_wrapper_save",
    "get_server_port",
    /* ----------------------------- sqlite database ---------------------------- */
    "create_extension",
    "get_all_extensions",
    "get_unique_extension_by_identifier",
    "get_unique_extension_by_path",
    "get_all_extensions_by_identifier",
    "delete_extension_by_path",
    "delete_extension_by_ext_id",
    "create_command",
    "get_command_by_id",
    "get_commands_by_ext_id",
    "delete_command_by_id",
    "update_command_by_id",
    "create_extension_data",
    "get_extension_data_by_id",
    "search_extension_data",
    "delete_extension_data_by_id",
    "update_extension_data_by_id",
    /* -------------------------------- Clipboard ------------------------------- */
    "add_to_history",
    "get_history",
    /* -------------------------------------------------------------------------- */
    /*                                    Utils                                   */
    /* -------------------------------------------------------------------------- */
    "plist_to_json",
    /* -------------------------------------------------------------------------- */
    /*                                  Security                                  */
    /* -------------------------------------------------------------------------- */
    "verify_auth",
    "request_screen_capture_access",
    "check_screen_capture_access",
    /* -------------------------------------------------------------------------- */
    /*                                    MDNS                                    */
    /* -------------------------------------------------------------------------- */
    "get_peers",
];

fn main() {
    // SSL Cert
    let cert_pem = match std::env::var("CERT_PEM") {
        Ok(cert) => cert.into_bytes(),
        Err(_) => include_bytes!("./self_signed_certs/cert.pem").to_vec(),
    };
    let key_pem = match std::env::var("KEY_PEM") {
        Ok(key) => key.into_bytes(),
        Err(_) => include_bytes!("./self_signed_certs/key.pem").to_vec(),
    };

    println!(
        "cargo:rustc-env=BASE64_CERT_PEM={}",
        BASE64_STANDARD.encode(cert_pem)
    );
    println!(
        "cargo:rustc-env=BASE64_KEY_PEM={}",
        BASE64_STANDARD.encode(key_pem)
    );

    // GRPC
    let out_dir = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());
    tonic_build::configure()
        .file_descriptor_set_path(out_dir.join("kk_grpc.bin"))
        .compile(
            &["proto/file-transfer.proto", "proto/server-info.proto"],
            &["proto"],
        )
        .expect("Failed to compile protos");

    // Server Public Key
    let raw_server_public_key = include_bytes!("./keys/server_public_key.pem").to_vec();
    println!(
        "cargo:rustc-env=BASE64_SERVER_PUBLIC_KEY={}",
        BASE64_STANDARD.encode(raw_server_public_key)
    );

    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
