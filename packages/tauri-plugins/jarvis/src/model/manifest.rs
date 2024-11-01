use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;
use std::fmt::Display;
use std::path::PathBuf;

pub const MANIFEST_FILE_NAME: &str = "package.json";

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum IconType {
    #[default]
    Iconify,
    AssetPath,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TitleBarStyle {
    #[default]
    Visible,
    Transparent,
    Overlay,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WindowTheme {
    #[default]
    Light,
    Dark,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OSPlatform {
    Windows,
    MacOS,
    Linux,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Icon {
    pub value: String,
    #[serde(rename = "type")]
    pub type_field: IconType,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Permissions {
    ClipboardRead,
    ClipboardWrite,
    FsHome,
    Shell,
}

impl Display for Permissions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Permissions::ClipboardRead => write!(f, "clipboard-read"),
            Permissions::ClipboardWrite => write!(f, "clipboard-write"),
            Permissions::FsHome => write!(f, "fs-home"),
            Permissions::Shell => write!(f, "shell"),
        }
    }
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KunkunExtManifest {
    pub name: String,
    pub short_description: String,
    pub long_description: String,
    pub identifier: String,
    pub icon: Icon,
    pub demo_images: Vec<Value>,
    pub permissions: Option<Vec<Permissions>>,
    pub ui_cmds: Vec<UiCmd>,
    #[serde(default = "Vec::new")]
    pub inline_cmds: Vec<InlineCmd>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtPackageJson {
    pub name: String,
    pub version: String,
    pub kunkun: KunkunExtManifest,
    pub files: Vec<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtPackageJsonExtra {
    pub name: String,
    pub version: String,
    pub kunkun: KunkunExtManifest,
    pub files: Vec<String>,
    // extra fields
    pub ext_path: PathBuf,
    pub ext_folder_name: String,
}

impl ExtPackageJsonExtra {
    pub fn from(manifest: ExtPackageJson, ext_path: PathBuf) -> Self {
        Self {
            name: manifest.name,
            version: manifest.version,
            kunkun: manifest.kunkun,
            files: manifest.files,
            ext_folder_name: ext_path.file_name().unwrap().to_str().unwrap().to_string(),
            ext_path,
        }
    }
}

impl ExtPackageJson {
    pub fn load(manifest_path: PathBuf) -> anyhow::Result<Self> {
        let manifest_str = std::fs::read_to_string(manifest_path).unwrap();
        Ok(serde_json::from_str(&manifest_str)?)
    }
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowConfig {
    pub center: Option<bool>,
    pub x: Option<u32>,
    pub y: Option<u32>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub min_width: Option<u32>,
    pub min_height: Option<u32>,
    pub max_width: Option<u32>,
    pub max_height: Option<u32>,
    pub resizable: Option<bool>,
    pub title: Option<String>,
    pub fullscreen: Option<bool>,
    pub focus: Option<bool>,
    pub transparent: Option<bool>,
    pub maximized: Option<bool>,
    pub visible: Option<bool>,
    pub decorations: Option<bool>,
    pub always_on_top: Option<bool>,
    pub always_on_bottom: Option<bool>,
    pub content_protected: Option<bool>,
    pub skip_taskbar: Option<bool>,
    pub shadow: Option<bool>,
    pub theme: Option<WindowTheme>,
    pub title_bar_style: Option<TitleBarStyle>,
    pub hidden_title: Option<bool>,
    pub tabbing_identifier: Option<String>,
    pub maximizable: Option<bool>,
    pub minimizable: Option<bool>,
    pub closable: Option<bool>,
    pub parent: Option<String>,
    pub visible_on_all_workspaces: Option<bool>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiCmd {
    pub main: String,
    pub name: String,
    pub description: Option<String>,
    pub dev_main: String,
    pub window: Option<WindowConfig>,
    pub cmds: Vec<Cmd>,
    pub platforms: Option<Vec<OSPlatform>>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Cmd {
    #[serde(rename = "type")]
    pub type_field: String,
    pub value: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InlineCmd {
    pub main: String,
    pub name: String,
    pub description: Option<String>,
    pub cmds: Vec<Cmd>,
    pub platforms: Option<Vec<OSPlatform>>,
}

// // generate test
// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_load_extension_manifest() {
//         // this test relies on submodule
//         let manifest_paths = vec![
//             "../../vendors/extensions/extensions/download-twitter-video/package.json",
//             "../../vendors/extensions/extensions/jwt/package.json",
//             "../../vendors/extensions/extensions/ip-info/package.json",
//             "../../vendors/extensions/extensions/qrcode/package.json",
//             "../../vendors/extensions/extensions/video-processor/package.json",
//         ];
//         for manifest_path in manifest_paths {
//             let abs_path = std::fs::canonicalize(manifest_path).unwrap();
//             println!("{:?}", abs_path);
//             let manifest_str = std::fs::read_to_string(abs_path).unwrap();
//             let pkg: ExtPackageJson = serde_json::from_str(&manifest_str).unwrap();
//             println!("{:?}", pkg.files);
//         }
//     }
// }
