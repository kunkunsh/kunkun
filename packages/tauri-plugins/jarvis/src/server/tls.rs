pub const CERT_PEM: &[u8] = include_bytes!("../../self_signed_certs/cert.pem");
pub const KEY_PEM: &[u8] = include_bytes!("../../self_signed_certs/key.pem");
// pub const CERT_PEM: &[u8] = if option_env!("CERT_PEM").is_some() {
//     env!("CERT_PEM").as_bytes()
// } else {
//     include_bytes!("../../self_signed_certs/cert.pem")
// };

// pub const KEY_PEM: &[u8] = if option_env!("KEY_PEM").is_some() {
//     env!("KEY_PEM").as_bytes()
// } else {
//     include_bytes!("../../self_signed_certs/key.pem")
// };
