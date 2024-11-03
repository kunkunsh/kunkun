use std::fs::File;
use std::path::{Path, PathBuf};
use zip::ZipArchive;

/// Decompress a tarball into a destination_folder
/// destination_folder should be a empty folder to avoid being removed
/// The resulting folder is expected to have "package" as its name
/// All .tgz generated with `npm pack` should be decompressed into `package`
pub fn decompress_tarball(
    path: &Path,
    destination_folder: &Path,
    overwrite: bool,
) -> anyhow::Result<PathBuf> {
    if !path.exists() {
        return Err(anyhow::format_err!("Tarball does not exist: {:?}", path));
    }
    // if destination exists, remove it
    if destination_folder.exists() && overwrite {
        std::fs::remove_dir_all(&destination_folder)?;
    }
    std::fs::create_dir_all(&destination_folder)?;
    let tgz = std::fs::File::open(&path)?;
    let tar = flate2::read::GzDecoder::new(tgz);
    let mut archive = tar::Archive::new(tar);
    let dest = destination_folder.join("package");

    if dest.exists() && !overwrite {
        return Err(anyhow::format_err!(
            "Destination folder already exists: {:?}",
            dest
        ));
    }
    archive.unpack(&destination_folder)?;
    if !dest.exists() {
        return Err(anyhow::format_err!(
            "Failed to unpack tarball to {:?}",
            dest
        ));
    }
    Ok(dest)
}

pub fn compress_tarball(
    src_dir: &Path,
    dest_file: &Path,
    overwrite: bool,
) -> anyhow::Result<PathBuf> {
    if !src_dir.exists() {
        return Err(anyhow::format_err!(
            "Source directory does not exist: {:?}",
            src_dir
        ));
    }
    if !src_dir.is_dir() {
        return Err(anyhow::format_err!(
            "Source path is not a directory: {:?}",
            src_dir
        ));
    }
    let dest_file = std::fs::canonicalize(dest_file)?;
    if dest_file.exists() && !overwrite {
        return Err(anyhow::format_err!(
            "Destination file already exists: {:?}",
            dest_file
        ));
    }
    let tar_gz = std::fs::File::create(&dest_file)?;
    let enc = flate2::write::GzEncoder::new(tar_gz, flate2::Compression::default());
    let mut tar = tar::Builder::new(enc);
    tar.append_dir_all(src_dir.file_name().unwrap().to_str().unwrap(), &src_dir)?;
    Ok(dest_file)
}

pub fn unzip(path: &Path, destination_folder: &Path, overwrite: bool) -> anyhow::Result<()> {
    if destination_folder.exists() && overwrite {
        std::fs::remove_dir_all(&destination_folder)?;
    }
    let file = File::open(path)?;
    let mut archive = ZipArchive::new(file)?;
    archive.extract(destination_folder)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    // use super::*;
    // use std::fs::File;
    // use zip::ZipArchive;
    // #[test]
    // fn test_decompress_tarball() {
    //     // this test relies on submodule
    //     decompress_tarball(
    //         "/Users/hacker/Desktop/huakunshen-jarvis-ext-qrcode-0.0.0.tgz".into(),
    //         "/Users/hacker/Desktop/randomfolder".into(),
    //         true,
    //     )
    //     .unwrap();
    // }

    // #[test]
    // fn test_unzip() {
    //     unzip(
    //         "/Users/hacker/Downloads/bun-darwin-aarch64.zip".into(),
    //         "/Users/hacker/Downloads/runtime".into(),
    //         true,
    //     )
    //     .unwrap();
    // }

    // #[test]
    // fn test_unzip() -> Result<(), Box<dyn std::error::Error>> {
    //     unzip(
    //         &PathBuf::from("/Users/hacker/Downloads/bun-darwin-aarch64.zip"),
    //         &PathBuf::from("/Users/hacker/Downloads/runtime"),
    //         true,
    //     )?;
    //     Ok(())
    // }
}
