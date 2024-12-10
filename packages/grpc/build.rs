fn main() {
    let out_dir = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());
    tonic_build::configure()
        .type_attribute(
            "file_transfer.FileNode",
            "#[derive(serde::Serialize, serde::Deserialize)] #[serde(rename_all = \"camelCase\")]",
        )
        .file_descriptor_set_path(out_dir.join("kk_grpc.bin"))
        .compile(
            &["./protos/file-transfer.proto", "./protos/kunkun.proto"],
            &["./protos"],
        )
        .expect("Failed to compile protos");
}
