# Contributing

If you are interested in contributing to the project, please read the following guidelines.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/en)
- [pnpm](https://pnpm.io/)
- [Bun](https://bun.sh/)
- [Deno](https://deno.com/)
- [Rust](https://www.rust-lang.org/)
- [protobuf](https://grpc.io/docs/protoc-installation/)
  - MacOS: `brew install protobuf`
  - Linux: `sudo apt install -y protobuf-compiler`
  - Windows:
    ```powershell
    choco install protoc
    choco install openssl
    ```
    Then configure the environment variables (yours may differ):
    - `OPENSSL_DIR`: `C:\Program Files\OpenSSL-Win64`
    - `OPENSSL_INCLUDE_DIR`: `C:\Program Files\OpenSSL-Win64\include`
    - `OPENSSL_LIB_DIR`: `C:\Program Files\OpenSSL-Win64\lib`
- [cmake](https://cmake.org/)
  - MacOS: `brew install cmake`
  - Linux: `sudo apt install -y cmake`

### Setup

```bash
git clone https://github.com/kunkunsh/kunkun.git --recursive
pnpm install
pnpm run setup
```

### Run Desktop App

```bash
pnpm --filter @kksh/desktop tauri dev
# or run it within the desktop app directory
cd apps/desktop
pnpm tauri dev
```
