use applications::utils::image::{RustImage, RustImageData};
use std::{
    ffi::OsStr,
    fs::File,
    io::{BufReader, Cursor},
    path::PathBuf,
};
#[cfg(target_os = "macos")]
use tauri_icns::{IconFamily, IconType};

#[cfg(target_os = "macos")]
/// Load Apple icns
pub fn load_icns(icns_path: &PathBuf) -> anyhow::Result<RustImageData> {
    if icns_path
        .extension()
        .unwrap_or(OsStr::new(""))
        .to_str()
        .unwrap()
        != "icns"
    {
        return Err(anyhow::anyhow!("file is not an icns file"));
    }
    let file = BufReader::new(File::open(icns_path).unwrap());
    let icon_family = IconFamily::read(file).unwrap();
    let mut largest_icon_type = IconType::RGBA32_16x16;
    let mut largest_width = 0;
    for icon_type in icon_family.available_icons() {
        let icon_type_width = icon_type.pixel_width();
        if icon_type_width > largest_width {
            largest_width = icon_type_width;
            largest_icon_type = icon_type;
            if largest_width >= 64 {
                // width 64 is large enough
                break;
            }
        }
    }
    let largest_icon = icon_family.get_icon_with_type(largest_icon_type)?;
    let mut buffer: Vec<u8> = Vec::new();
    let cursor = Cursor::new(&mut buffer);
    largest_icon.write_png(cursor).unwrap();
    let bytes: &[u8] = &buffer;
    match RustImageData::from_bytes(bytes) {
        Ok(image) => Ok(image),
        Err(error) => Err(anyhow::anyhow!(error)),
    }
}

#[cfg(target_os = "linux")]
pub fn load_icon(path: PathBuf) -> tauri::http::Response<Vec<u8>> {
    match path.exists() {
        true => {
            let bytes = std::fs::read(&path).expect("Error reading file");
            tauri::http::Response::builder().body(bytes).unwrap()
        }
        false => {
            let res = tauri::http::Response::builder()
                .status(tauri::http::StatusCode::NOT_FOUND)
                .body("file not found".as_bytes().to_vec())
                .unwrap();
            return res;
        }
    }
}

#[cfg(target_os = "macos")]
pub fn load_icon(path: PathBuf) -> tauri::http::Response<Vec<u8>> {
    if !path.exists() {
        return tauri::http::Response::builder()
            .status(tauri::http::StatusCode::NOT_FOUND)
            .body("file not found".as_bytes().to_vec())
            .unwrap();
    }
    let icns = load_icns(&path);
    match icns {
        Ok(icns) => {
            let png = icns.to_png().unwrap();
            tauri::http::Response::builder()
                .body(png.get_bytes().to_vec())
                .unwrap()
        }
        Err(error) => tauri::http::Response::builder()
            .status(tauri::http::StatusCode::INTERNAL_SERVER_ERROR)
            .body(error.to_string().as_bytes().to_vec())
            .unwrap(),
    }
}

#[cfg(target_os = "windows")]
pub fn load_icon(path: PathBuf) -> tauri::http::Response<Vec<u8>> {
    // tauri::http::Response::builder().body(vec![]).unwrap()
    match path.exists() {
        true => {
            let ico_loaded = load_ico(&path);
            if ico_loaded.is_err() {
                let res = tauri::http::Response::builder()
                    .status(tauri::http::StatusCode::INTERNAL_SERVER_ERROR)
                    .body("Error loading icon".as_bytes().to_vec())
                    .unwrap();
                return res;
            } else {
                let ico = ico_loaded.unwrap();
                // write ico to random file name.png, read it and return
                // Generate a random file name
                let id = Uuid::new_v4();
                let file_name = format!("{}.png", id);
                // get temp folder
                let temp_dir = std::env::temp_dir();
                let file_path = temp_dir.join(file_name);
                // Write the ico to the random file name.png
                let file = File::create(&file_path).unwrap();
                ico.write_png(file).unwrap();
                // Read the file and return the bytes
                let bytes = std::fs::read(&file_path).expect("Error reading file");
                // Delete the file
                std::fs::remove_file(&file_path).unwrap();
                tauri::http::Response::builder()
                    .header("Content-Type", "image/png")
                    .body(bytes)
                    .unwrap()
            }
        }
        false => {
            let res = tauri::http::Response::builder()
                .status(tauri::http::StatusCode::NOT_FOUND)
                .body("file not found".as_bytes().to_vec())
                .unwrap();
            return res;
        }
    }
}

/// Load .ico image
#[cfg(target_os = "windows")]
pub fn load_ico(path: &Path) -> anyhow::Result<ico::IconImage> {
    let file = std::fs::File::open(path)?;
    let icon_dir = ico::IconDir::read(file)?;
    let image = icon_dir.entries().first();
    if let Some(image) = image {
        Ok(image.decode()?)
    } else {
        Err(anyhow::anyhow!("No image found"))
    }
}

#[cfg(all(test, target_os = "windows"))]
mod tests {
    use super::*;
    use std::io::Write;
    use std::path::PathBuf;

    // #[test]
    // fn test_load_icon() {
    //     let path = PathBuf::from(
    //         "C:\\Windows\\Installer\\{89C3B1AD-04F9-4A43-940D-51E26BC47942}\\ProductIcon",
    //     );
    //     let icon = load_ico(path).unwrap();
    //     icon.write_png(std::fs::File::create("icon.png").unwrap()).unwrap();
    // }
}

#[cfg(all(test, target_os = "macos"))]
mod tests {
    use applications::{utils::mac::MacAppPath, AppTrait};

    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_load_icns() {
        let icns_path =
            PathBuf::from("/System/Applications/Launchpad.app/Contents/Resources/AppIcon.icns");
        let image = load_icns(&icns_path).unwrap();
        println!("image: {:?}", image.get_size());
        // assert_eq!(image.get_size(), (512, 512));
        // image.save_to_path("icns.png").unwrap();
    }

    #[test]
    fn test_app_load_icns() {
        let app = MacAppPath::new(PathBuf::from("/Applications/Google Chrome.app"))
            .to_app()
            .unwrap();
        let icns = app.load_icon().unwrap();
    }

    #[test]
    fn debug() {
        // let icns_path =
        //     PathBuf::from("/Applications/Google Chrome.app/Contents/Resources/app.icns");
        // let file = BufReader::new(File::open(icns_path).unwrap());
        // let icon_family = IconFamily::read(file).unwrap();
        // for icon_type in icon_family.available_icons() {
        //     println!("icon_type: {:?}", icon_type);
        //     println!("icon_type: {:?}", icon_type.pixel_width());
        //     let icon = icon_family.get_icon_with_type(icon_type).unwrap();
        // }
        // println!("{:?}", IconType::RGBA32_16x16.fmt());
        // println!("{:?}", IconType::RGB24_16x16.pixel_density());
    }
}
