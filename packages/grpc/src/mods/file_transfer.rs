pub mod file_transfer {
    tonic::include_proto!("file_transfer"); // The string specified here must match the proto package name
    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("kk_grpc");
}