use super::CommonSystemCmds;
use crate::utils::script::{run_apple_script, run_powershell};
pub struct SystemCmds;

const SET_VOLUME_PS_FUNCTION: &str = r#"
    Function Set-Speaker($Volume) { 
        $wshShell = new-object -com wscript.shell; 
        1..50 | % { $wshShell.SendKeys([char]174) };
        if ($Volume -eq 0) {
            return
        }
        1..$Volume | % { $wshShell.SendKeys([char]175) } 
    }"#;

impl CommonSystemCmds for SystemCmds {
    fn open_trash() -> anyhow::Result<()> {
        run_powershell(
            r#"
            $shell = New-Object -ComObject Shell.Application
            $recycleBin = $shell.Namespace(10)
            $recycleBin.Self.InvokeVerb("open")
        "#,
        )?;
        Ok(())
    }

    fn empty_trash() -> anyhow::Result<()> {
        run_powershell("Clear-RecycleBin -Force")?;
        Ok(())
    }

    fn shutdown() -> anyhow::Result<()> {
        run_powershell("Stop-Computer -Force")?;
        Ok(())
    }

    fn reboot() -> anyhow::Result<()> {
        run_powershell("Restart-Computer -Force")?;
        Ok(())
    }

    fn sleep() -> anyhow::Result<()> {
        run_powershell("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")?;
        Ok(())
    }

    fn set_volume(percentage: u8) -> anyhow::Result<()> {
        run_powershell(&format!(
            "{}; Set-Speaker {}",
            SET_VOLUME_PS_FUNCTION,
            percentage / 2
        ))?;
        Ok(())
    }

    fn turn_volume_up() -> anyhow::Result<()> {
        for _ in 0..5 {
            run_powershell(
                r#"
            $obj = new-object -com wscript.shell
            $obj.SendKeys([char]175)
        "#,
            )?;
        }
        Ok(())
    }

    fn turn_volume_down() -> anyhow::Result<()> {
        for _ in 0..5 {
            run_powershell(
                r#"
                $obj = new-object -com wscript.shell
                $obj.SendKeys([char]174)
            "#,
            )?;
        }
        Ok(())
    }

    fn logout_user() -> anyhow::Result<()> {
        run_powershell("shutdown -l -f")?;
        Ok(())
    }

    fn toggle_mute() -> anyhow::Result<()> {
        run_powershell(
            r#"
            $obj = new-object -com wscript.shell
            $obj.SendKeys([char]173)
        "#,
        )?;
        Ok(())
    }

    fn mute() -> anyhow::Result<()> {
        todo!()
    }

    fn unmute() -> anyhow::Result<()> {
        todo!()
    }

    /// Get the selected files in the Windows File Explorer
    fn get_selected_files() -> anyhow::Result<Vec<std::path::PathBuf>> {
        let script = r#"
            # Create a COM object for the Shell application
            $shell = New-Object -ComObject Shell.Application
            
            # Get all open Windows Explorer windows
            $windows = $shell.Windows()
            
            # Iterate through each window
            foreach ($window in $windows) {
                # Get the current selection
                $selectedItems = $window.Document.SelectedItems()
                foreach ($item in $selectedItems) {
                    # Print the path of each selected file
                    Write-Output $item.Path
                }
            }
        "#;
        let result = run_powershell(script).unwrap();
        let paths: Vec<std::path::PathBuf> = result
            .split('\n')
            .map(|path| std::path::PathBuf::from(path.trim()))
            .filter(|path| path.exists())
            .collect();
        Ok(paths)
    }
}
