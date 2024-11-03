#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "linux")]
pub use linux::SystemCmds;
#[cfg(target_os = "macos")]
mod mac;
#[cfg(target_os = "macos")]
pub use mac::SystemCmds;
#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::SystemCmds;

use anyhow::Result;

pub trait CommonSystemCmds {
    fn open_trash() -> Result<()>;
    fn empty_trash() -> Result<()>;
    fn shutdown() -> Result<()>;
    fn reboot() -> Result<()>;
    fn sleep() -> Result<()>;
    fn set_volume(percentage: u8) -> Result<()>;
    fn turn_volume_up() -> Result<()>;
    fn turn_volume_down() -> Result<()>;
    fn logout_user() -> Result<()>;
    fn toggle_mute() -> Result<()>;
    fn mute() -> Result<()>;
    fn unmute() -> Result<()>;
    fn get_selected_files() -> Result<Vec<std::path::PathBuf>>;
}
