use grpc;

fn main() {
    println!(
        "file_transfer: {:?}",
        grpc::file_transfer::FILE_DESCRIPTOR_SET
    );
}
