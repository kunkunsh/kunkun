use base64::prelude::*;

/* -------------------------------------------------------------------------- */
/*                        Buildin Extension Identifiers                       */
/* -------------------------------------------------------------------------- */
pub const KUNKUN_CLIPBOARD_EXT_IDENTIFIER: &str = "sh.kunkun.ext.clipboard";
pub const KUNKUN_QUICK_LINKS_EXT_IDENTIFIER: &str = "sh.kunkun.ext.quick-links";
pub const KUNKUN_REMOTE_EXT_IDENTIFIER: &str = "sh.kunkun.ext.remote";
pub const KUNKUN_SCRIPT_CMD_EXT_IDENTIFIER: &str = "sh.kunkun.ext.script-cmd";
pub const KUNKUN_DEV_EXT_IDENTIFIER: &str = "sh.kunkun.ext.dev";

/* -------------------------------------------------------------------------- */
/*                            Kunkun Builtin Events                           */
/* -------------------------------------------------------------------------- */
pub const KUNKUN_REFRESH_WORKER_EXTENSION: &str = "kunkun://refresh-dev-extension";

pub static BASE64_SERVER_PUBLIC_KEY: &str = env!("BASE64_SERVER_PUBLIC_KEY");
pub static SERVER_PUBLIC_KEY: std::sync::LazyLock<Vec<u8>> = std::sync::LazyLock::new(|| {
    BASE64_STANDARD
        .decode(BASE64_SERVER_PUBLIC_KEY)
        .expect("Failed to decode base64 encoded server public key")
});
