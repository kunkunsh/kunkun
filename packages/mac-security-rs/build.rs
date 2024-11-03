fn main() {
    #[cfg(not(target_os = "macos"))]
    {
        println!("cargo:warning=This crate is only intended for macOS systems.");
        std::process::exit(0);
    }
}
