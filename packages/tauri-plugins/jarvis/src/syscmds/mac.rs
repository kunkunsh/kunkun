use super::CommonSystemCmds;
use crate::utils::script::run_apple_script;
use std::path::PathBuf;

pub struct SystemCmds;

impl CommonSystemCmds for SystemCmds {
    fn open_trash() -> anyhow::Result<()> {
        run_apple_script("tell application \"Finder\" to open trash")?;
        Ok(())
    }

    fn empty_trash() -> anyhow::Result<()> {
        run_apple_script("tell application \"Finder\" to empty the trash")?;
        Ok(())
    }

    fn shutdown() -> anyhow::Result<()> {
        run_apple_script("tell application \"System Events\" to shut down")?;
        Ok(())
    }

    fn reboot() -> anyhow::Result<()> {
        run_apple_script("tell application \"System Events\" to restart")?;
        Ok(())
    }

    fn sleep() -> anyhow::Result<()> {
        run_apple_script("tell application \"System Events\" to sleep")?;
        Ok(())
    }

    fn set_volume(percentage: u8) -> anyhow::Result<()> {
        run_apple_script(&format!("set volume output volume {}", percentage))?;
        Ok(())
    }

    fn turn_volume_up() -> anyhow::Result<()> {
        run_apple_script("set volume output volume (output volume of (get volume settings) + 10)")?;
        Ok(())
    }

    fn turn_volume_down() -> anyhow::Result<()> {
        run_apple_script("set volume output volume (output volume of (get volume settings) - 10)")?;
        Ok(())
    }

    fn logout_user() -> anyhow::Result<()> {
        run_apple_script("tell application \"System Events\" to log out")?;
        Ok(())
    }

    fn toggle_mute() -> anyhow::Result<()> {
        run_apple_script(
            r#"
            -- set volume output muted not (output muted of (get volume settings))
            set curVolume to get volume settings
            if output muted of curVolume is false then
                set volume with output muted
            else
                set volume without output muted
            end if
        "#,
        )?;
        Ok(())
    }

    fn mute() -> anyhow::Result<()> {
        run_apple_script("set volume with output muted")?;
        Ok(())
    }

    fn unmute() -> anyhow::Result<()> {
        run_apple_script("set volume without output muted")?;
        Ok(())
    }

    fn get_selected_files() -> anyhow::Result<Vec<PathBuf>> {
        let stdout = run_apple_script(
            r#"use framework "Foundation"
            use scripting additions
            
            tell application "Finder"
                set selectedFiles to selection
                if (count of selectedFiles) is 0 then
                    do shell script "echo No files are selected."
                else
                    set filePathList to {}
                    repeat with i from 1 to count of selectedFiles
                        set thisFile to item i of selectedFiles
                        set end of filePathList to (POSIX path of (thisFile as alias))
                    end repeat
                    
                    -- Convert the list to a JSON string
                    set jsonArray to current application's NSJSONSerialization's dataWithJSONObject:filePathList options:0 |error|:(missing value)
                    set jsonString to (current application's NSString's alloc()'s initWithData:jsonArray encoding:(current application's NSUTF8StringEncoding))
                    
                    -- Print the JSON string to stdout
                    do shell script "echo " & quoted form of (jsonString as text)
                end if
            end tell
            "#,
        )?;
        let paths: Vec<PathBuf> = serde_json::from_str(&stdout)?;
        Ok(paths)
    }
}
