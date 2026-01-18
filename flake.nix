{
  description = "Nix Flake for Tauri development";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    rust-overlay.url = "github:oxalica/rust-overlay";
    nixgl-overlay.url = "github:nix-community/nixGL";
  };

  outputs = {
    self,
    nixpkgs,
    nixgl-overlay,
    rust-overlay,
  }: let
    allSystems = fn:
      nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ] (system:
        fn (import nixpkgs {
          inherit system;
          overlays = [nixgl-overlay.overlay rust-overlay.overlays.default];
        }));

    builder = {
      lib,
      stdenv,
      pnpm,
      darwin,
      libsoup_3,
      openssl,
      webkitgtk_4_1,
      pkg-config,
      cargo-tauri,
      nodejs-slim_22,
      glib-networking,
      rustPlatform,
      wrapGAppsHook3,
    }: let
      src = ./apps/desktop/.;
      toml = (lib.importTOML ./apps/desktop/src-tauri/Cargo.toml).package;
    in
      rustPlatform.buildRustPackage rec {
        inherit src;
        inherit (toml) version;

        pname = toml.name;

        cargoRoot = "src-tauri";
        cargoLock.lockFile = "${src}/src-tauri/Cargo.lock";
        buildAndTestSubdir = cargoRoot;

        pnpmDeps = pnpm.fetchDeps {
          inherit pname version src;
          hash = "sha256-25uQRLB9ZqAJxbOIP2RwCAL5v3XBEaDl/MSsX1z0Ucw=";
          lockFile = builtins.toFile "pnpm-lock.yaml" (builtins.readFile ./pnpm-lock.yaml);
        };

        nativeBuildInputs = [
          pkg-config
          nodejs-slim_22
          wrapGAppsHook3
          pnpm.configHook
          cargo-tauri.hook
        ];

        buildInputs =
          [openssl]
          ++ lib.optionals stdenv.isLinux [
            libsoup_3
            webkitgtk_4_1
            glib-networking
          ]
          ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
            AppKit
            WebKit
            Security
            CoreServices
          ]);

        meta = {
          description = "";
          homepage = "";
          license = lib.licenses.gpl3;
          mainProgram = "kunkun";
          platforms = ["x86_64-linux"];
        };
      };
  in {
    packages = allSystems (pkgs:
      with pkgs; {
        NameOfPkg = callPackage builder {};
        default = self.packages.${system}.NameOfPkg;
      });

    devShells = allSystems (pkgs:
      with pkgs; let
        rust = rust-bin.fromRustupToolchainFile ./Toolchain.toml;
      in {
        default = mkShell {
          packages = [
            rust
            rust-analyzer-unwrapped
            rust-bin.nightly."2024-04-07".rustfmt
            pnpm
            nodejs-slim_22
            nixgl.nixGLMesa
          ];

          buildInputs = [gtk3];

          env = {
            RUST_BACKTRACE = "full";
            RUST_SRC_PATH = "${rust}/lib/rustlib/src/rust/library/";
            GIO_MODULE_DIR = "${glib-networking}/lib/gio/modules/";
            PKG_CONFIG_PATH = "${libsoup_3.dev}/lib/pkgconfig:${webkitgtk_4_1.dev}/lib/pkgconfig";
            LOCALE_ARCHIVE =
              if system == "x86_64-linux"
              then "${glibcLocales}/lib/locale/locale-archive"
              else "";
          };
        };
      });
  };
}
