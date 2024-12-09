use std::collections::HashMap;
use std::path::{Path, PathBuf};

use grpc::file_transfer::file_transfer_server::FileTransfer;
use grpc::file_transfer::{FileNode, FileType, StartTransferRequest, StartTransferResponse};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tonic::{Request, Response, Status};
use uuid::Uuid;

#[derive(Debug)]
pub struct MyFileTransfer {
    pub app_handle: AppHandle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileTransferPayload {
    pub port: String,
    // pub filename: String,
    pub code: String,
    // pub file_size: i64,
    pub root: FileNode,
    pub ip: String,
    pub ssl_cert: String,
}

#[tonic::async_trait]
impl FileTransfer for MyFileTransfer {
    async fn start_transfer(
        &self,
        request: Request<StartTransferRequest>, // Accept request of type StartTransferRequest
    ) -> Result<Response<StartTransferResponse>, Status> {
        let reply = StartTransferResponse {};
        // let ip = request.remote_addr().unwrap().ip();
        let ip = "localhost";
        println!("start_transfer remote addr: {:?}", request.remote_addr());
        let payload = request.into_inner();
        println!("start_transfer payload: {:?}", payload);
        // get ip from request
        self.app_handle
            .emit(
                "file-transfer-request",
                FileTransferPayload {
                    port: payload.port,
                    // filename: payload.filename,
                    code: payload.code,
                    // file_size: payload.file_size,
                    root: payload.root.unwrap(),
                    ip: ip.to_string(),
                    ssl_cert: payload.ssl_cert,
                },
            )
            .map_err(|e| Status::internal(e.to_string()))?;
        Ok(Response::new(reply)) // Send back our formatted greeting
    }
}

pub fn construct_file_node(path: &Path) -> anyhow::Result<FileNode> {
    if !path.exists() {
        return Err(anyhow::anyhow!("path not exists"));
    }
    if !path.is_file() {
        return Err(anyhow::anyhow!("path is not a file"));
    }
    Ok(FileNode {
        filename: path
            .file_name()
            .expect("Fail to get file name")
            .to_string_lossy()
            .to_string(),
        file_size: path.metadata()?.len(),
        id: Uuid::new_v4().to_string(),
        r#type: FileType::File as i32,
        children: vec![],
    })
}

pub fn construct_directory_node(path: &Path) -> anyhow::Result<FileNode> {
    if !path.exists() {
        return Err(anyhow::anyhow!("path not exists"));
    }
    if !path.is_dir() {
        return Err(anyhow::anyhow!("path is not a directory"));
    }
    // construct children
    let children = path
        .read_dir()?
        .filter_map(|entry| construct_node(&entry.ok()?.path()).ok())
        .collect();
    Ok(FileNode {
        filename: path
            .file_name()
            .expect("Fail to get file name")
            .to_string_lossy()
            .to_string(),
        file_size: path.metadata()?.len(),
        id: Uuid::new_v4().to_string(),
        r#type: FileType::Directory as i32,
        children,
    })
}

pub fn construct_node(path: &Path) -> anyhow::Result<FileNode> {
    if path.is_file() {
        construct_file_node(path)
    } else {
        construct_directory_node(path)
    }
}

pub fn compute_file_node_total_size(node: &FileNode) -> u64 {
    if node.r#type == FileType::File as i32 {
        node.file_size
    } else {
        node.children
            .iter()
            .map(|child| compute_file_node_total_size(child))
            .sum()
    }
}

/// Flatten the file node tree to a vector of (id, path), path should be absolute path
/// `root_path` should be the directory containing
pub fn get_id_path_array(node: &FileNode, root_path: &Path) -> Vec<(String, PathBuf)> {
    let mut vec: Vec<(String, PathBuf)> = Vec::new();
    let dir_path = root_path.join(&node.filename);
    if node.r#type == FileType::File as i32 {
        vec.push((node.id.clone(), dir_path));
    } else {
        for child in node.children.iter() {
            vec.extend(get_id_path_array(child, &dir_path));
        }
    }
    vec
}

/// the returned root node will have empty filename because `files` passed in are not necessarily in the same directory
/// The root dir filename is left empty to avoid confusion, once the receiver receives the root node, it can fill in a custom directory name
pub fn build_file_node_and_id_path_map(
    files: &Vec<PathBuf>,
) -> anyhow::Result<(HashMap<String, PathBuf>, FileNode)> {
    let mut id_path_array: Vec<(String, PathBuf)> = Vec::new();

    let mut children: Vec<FileNode> = vec![];
    for file in files.iter() {
        let node = construct_node(file).unwrap();
        id_path_array.extend(get_id_path_array(&node, file.parent().unwrap()));
        children.push(node);
    }
    let root = FileNode {
        filename: "".to_string(),
        file_size: 0,
        id: Uuid::new_v4().to_string(),
        r#type: FileType::Directory as i32,
        children,
    };
    let map: HashMap<String, PathBuf> = id_path_array.into_iter().collect();
    Ok((map, root))
}

pub fn count_file_nodes(node: &FileNode) -> usize {
    if node.r#type == FileType::File as i32 {
        1
    } else {
        node.children
            .iter()
            .map(|child| count_file_nodes(child))
            .sum()
    }
}

pub fn compute_total_size(node: &FileNode) -> u128 {
    if node.r#type == FileType::File as i32 {
        node.file_size as u128
    } else {
        node.children
            .iter()
            .map(|child| compute_total_size(child))
            .sum()
    }
}

mod test {
    use super::*;

    #[test]
    fn test_construct_node() {
        let manifest_path = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        let src_path = PathBuf::from(manifest_path).join("src");
        // manifest_path is pointing to grpc crate
        let node = construct_node(src_path.as_path()).unwrap();
        println!("{:#?}", node);
        // println!("total size: {}", compute_total_size(&node));
    }

    #[test]
    fn test_build_file_node_and_id_path_map() {
        let manifest_path = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        let src_path = PathBuf::from(manifest_path).join("src");
        let (map, node) = build_file_node_and_id_path_map(&vec![src_path]).unwrap();
        println!("{:#?}", node);
        // check if all paths are absolute and exists
        println!("{:#?}", map);
        for (_, path) in map.iter() {
            if !path.exists() {
                panic!("path not exists: {}", path.to_string_lossy());
            }
        }
    }

    #[test]
    fn test_get_id_path_array() {
        let manifest_path = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        let src_path = PathBuf::from(manifest_path)
            .join("src")
            .canonicalize()
            .unwrap();
        assert!(src_path.exists());
        // let src_path = PathBuf::from("/Users/hk/Dev/kunkun/packages/grpc/src");
        let node = construct_node(&src_path).unwrap();
        println!("{:#?}", node);
        let array = get_id_path_array(&node, src_path.parent().unwrap());
        println!("{:#?}", array);
        // check if all paths are absolute and exists
        for (_, path) in array.iter() {
            if !path.exists() {
                panic!("path not exists: {}", path.to_string_lossy());
            }
            // assert!(path.is_absolute());
            // assert!(path.exists());
        }
    }

    #[test]
    fn test_count_file_nodes() {
        let manifest_path = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        let src_path = PathBuf::from(manifest_path).join("src");
        let node = construct_node(&src_path).unwrap();
        println!("{:#?}", node);
        let count = count_file_nodes(&node);
        assert!(count >= 7); // there may be a hidden DS_Store file
        assert!(count <= 8); // there may be a hidden DS_Store file
    }

    #[test]
    fn test_compute_total_size() {
        let manifest_path = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        let src_path = PathBuf::from(manifest_path).join("src");
        println!("src_path: {}", src_path.to_string_lossy());
        let node = construct_node(&src_path).unwrap();
        let size = compute_total_size(&node);
        println!("size: {}", size);
    }
}
