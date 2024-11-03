use std::process::Command;

pub fn run_apple_script(script: &str) -> anyhow::Result<String> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .expect("failed to execute applescript");
    match output.status.success() {
        true => Ok(String::from_utf8_lossy(&output.stdout).to_string()),
        false => Err(anyhow::anyhow!(
            "failed to execute applescript: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
    }
}

pub fn run_powershell(script: &str) -> anyhow::Result<String> {
    let output = Command::new("powershell")
        .arg("-Command")
        .arg(script)
        .output()
        .expect("failed to execute powershell");
    match output.status.success() {
        true => Ok(String::from_utf8_lossy(&output.stdout).to_string()),
        false => Err(anyhow::anyhow!(
            "failed to execute powershell: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
    }
}
