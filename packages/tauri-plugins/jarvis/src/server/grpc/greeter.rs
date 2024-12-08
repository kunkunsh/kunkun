use hello_world::greeter_server::Greeter;
use hello_world::{HelloReply, HelloRequest};
use tauri::AppHandle;
use tonic::{Request, Response, Status};

pub mod hello_world {
    tonic::include_proto!("helloworld"); // The string specified here must match the proto package name
    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("kk_grpc");
}

#[derive(Debug)]
pub struct MyGreeter {
    pub app_handle: AppHandle,
    pub name: String,
}

#[tonic::async_trait]
impl Greeter for MyGreeter {
    async fn say_hello(
        &self,
        request: Request<HelloRequest>, // Accept request of type HelloRequest
    ) -> Result<Response<HelloReply>, Status> {
        println!("Got a request: {:?}", request);
        let reply = HelloReply {
            message: format!(
                "Hello {} from {} by Kunkun {}!",
                request.into_inner().name,
                self.name,
                self.app_handle.package_info().version
            ), // We must use .into_inner() as the fields of gRPC requests and responses are private
        };

        Ok(Response::new(reply)) // Send back our formatted greeting
    }
}
