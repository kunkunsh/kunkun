use super::CommonSystemCmds;
use std::process::Command;

struct Amixer;
impl Amixer {
    fn cmd_exists() -> bool {
        Command::new("amixer").arg("--version").output().is_ok()
    }
    fn set_volume(value: String) -> anyhow::Result<()> {
        let output = Command::new("amixer")
            .arg("set")
            .arg("Master")
            .arg(value)
            .output()?;

        if output.status.success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to set volume"))
        }
    }
    /// amixer -D pulse set Master 1+ mute
    /// cmd is mute, unmute or toggle
    fn mute_related_cmd(cmd: &str) -> anyhow::Result<()> {
        let output = Command::new("amixer")
            .arg("-D")
            .arg("pulse")
            .arg("set")
            .arg("Master")
            .arg("1+")
            .arg(cmd)
            .output()?;

        if output.status.success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to mute"))
        }
    }
}

struct Pactl;
impl Pactl {
    fn cmd_exists() -> bool {
        Command::new("pactl").arg("--version").output().is_ok()
    }
    fn set_volume(value: String) -> anyhow::Result<()> {
        let output = Command::new("pactl")
            .arg("set-sink-volume")
            .arg("@DEFAULT_SINK@")
            .arg(value)
            .output()?;

        if output.status.success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to set volume"))
        }
    }
    /// pactl set-sink-mute @DEFAULT_SINK@ true
    /// cmd is true, false or toggle
    fn mute_related_cmd(cmd: &str) -> anyhow::Result<()> {
        let output = Command::new("pactl")
            .arg("set-sink-mute")
            .arg("@DEFAULT_SINK@")
            .arg(cmd)
            .output()?;

        if output.status.success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to mute"))
        }
    }
}

pub struct SystemCmds;
impl CommonSystemCmds for SystemCmds {
    /// Run nautilus trash://
    fn open_trash() -> anyhow::Result<()> {
        let output = Command::new("nautilus").arg("trash://").output()?;
        match output.status.success() {
            true => Ok(()),
            false => Err(anyhow::anyhow!("Failed to open trash")),
        }
    }

    fn empty_trash() -> anyhow::Result<()> {
        let output = Command::new("rm")
            .arg("-rf")
            .arg("~/.local/share/Trash/files/*")
            .output()?;
        match output.status.success() {
            true => Ok(()),
            false => Err(anyhow::anyhow!("Failed to empty trash")),
        }
    }

    fn shutdown() -> anyhow::Result<()> {
        let output = Command::new("shutdown").arg("-h").arg("now").output()?;
        match output.status.success() {
            true => Ok(()),
            false => Err(anyhow::anyhow!("Failed to shutdown")),
        }
    }

    fn reboot() -> anyhow::Result<()> {
        let output = Command::new("reboot").output()?;
        match output.status.success() {
            true => Ok(()),
            false => Err(anyhow::anyhow!("Failed to reboot")),
        }
    }

    fn sleep() -> anyhow::Result<()> {
        let output = Command::new("systemctl").arg("suspend").output()?;
        match output.status.success() {
            true => Ok(()),
            false => Err(anyhow::anyhow!("Failed to sleep")),
        }
    }

    fn set_volume(percentage: u8) -> anyhow::Result<()> {
        if Pactl::cmd_exists() {
            return Pactl::set_volume(format!("{}%", percentage));
        } else if Amixer::cmd_exists() {
            return Amixer::set_volume(format!("{}%", percentage));
        } else {
            return Err(anyhow::anyhow!(
                "No volume control command found (Only Support pactl and amixer)"
            ));
        }
    }

    fn turn_volume_up() -> anyhow::Result<()> {
        if Pactl::cmd_exists() {
            return Pactl::set_volume("+10%".to_string());
        } else if Amixer::cmd_exists() {
            return Amixer::set_volume("10%+".to_string());
        } else {
            return Err(anyhow::anyhow!(
                "No volume control command found (Only Support pactl and amixer)"
            ));
        }
    }

    fn turn_volume_down() -> anyhow::Result<()> {
        if Pactl::cmd_exists() {
            return Pactl::set_volume("-10%".to_string());
        } else if Amixer::cmd_exists() {
            return Amixer::set_volume("10%-".to_string());
        } else {
            return Err(anyhow::anyhow!(
                "No volume control command found (Only Support pactl and amixer)"
            ));
        }
    }

    fn logout_user() -> anyhow::Result<()> {
        let output = Command::new("pkill").arg("Xorg").output()?;
        match output.status.success() {
            true => Ok(()),
            false => Err(anyhow::anyhow!("Failed to logout")),
        }
    }

    /// amixer -D pulse set Master 1+ toggle
    fn toggle_mute() -> anyhow::Result<()> {
        if Pactl::cmd_exists() {
            Pactl::mute_related_cmd("toggle")
        } else if Amixer::cmd_exists() {
            Amixer::mute_related_cmd("toggle")
        } else {
            Err(anyhow::anyhow!(
                "No volume control command found (Only Support pactl and amixer)"
            ))
        }
    }
    /// amixer -D pulse set Master 1+ mute
    fn mute() -> anyhow::Result<()> {
        if Pactl::cmd_exists() {
            Pactl::mute_related_cmd("true")
        } else if Amixer::cmd_exists() {
            Amixer::mute_related_cmd("mute")
        } else {
            Err(anyhow::anyhow!(
                "No volume control command found (Only Support pactl and amixer)"
            ))
        }
    }

    /// amixer -D pulse set Master 1+ unmute
    fn unmute() -> anyhow::Result<()> {
        if Pactl::cmd_exists() {
            Pactl::mute_related_cmd("false")
        } else if Amixer::cmd_exists() {
            Amixer::mute_related_cmd("unmute")
        } else {
            Err(anyhow::anyhow!(
                "No volume control command found (Only Support pactl and amixer)"
            ))
        }
    }

    fn get_selected_files() -> anyhow::Result<Vec<std::path::PathBuf>> {
        Ok(vec![])
    }
}
