use crate::model::manifest::{ExtPackageJson, ExtPackageJsonExtra, MANIFEST_FILE_NAME};
use anyhow::Result;
use std::path::{Path, PathBuf};

pub fn load_jarvis_ext_manifest(manifest_path: PathBuf) -> Result<ExtPackageJson> {
    // check if it's a folder

    let manifest_path = if manifest_path.is_file() && manifest_path.ends_with(MANIFEST_FILE_NAME) {
        manifest_path
    } else {
        manifest_path.join(MANIFEST_FILE_NAME)
    };
    // check if file exists
    if !std::path::Path::new(&manifest_path).exists() {
        return Err(anyhow::Error::msg(format!(
            "{} not found",
            manifest_path.to_string_lossy()
        )));
    }
    ExtPackageJson::load(manifest_path)
}

pub fn load_all_extensions(extensions_folder: &Path) -> anyhow::Result<Vec<ExtPackageJsonExtra>> {
    let mut extensions_with_path: Vec<ExtPackageJsonExtra> = vec![];
    for entry in std::fs::read_dir(extensions_folder)? {
        let entry = entry?;

        if entry.path().join(MANIFEST_FILE_NAME).exists() {
            let ext_manifest = load_jarvis_ext_manifest(entry.path());
            if ext_manifest.is_err() {
                continue;
            }
            extensions_with_path.push(ExtPackageJsonExtra::from(
                ext_manifest.unwrap(),
                entry.path(),
            ));
        }
    }
    Ok(extensions_with_path)
}

// ! Disable test for now as we now load manifest directly with TypeScript
// ! Keeping rust and ts manifest schema in place is troublesome.
// ! In the future, after the schema is stable, and if there is need to load manifest in Rust, we can re-enable this test.
// #[cfg(test)]
// mod test {
//     use super::*;

//     #[test]
//     fn test_load_jarvis_ext_manifest() {
//         let x = PathBuf::from(".");
//         let abs_x = x.canonicalize().unwrap();
//         println!("{:?}", abs_x);
//         let manifest =
//             load_jarvis_ext_manifest(PathBuf::from("../../extensions/hacker-news")).unwrap();
//         assert_eq!(manifest.name, "hacker-news");
//     }
// }
