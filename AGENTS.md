# Kunkun Project Knowledge Base

**Generated:** 2026-01-17
**Commit:** 302a09f
**Branch:** feature/browser-extension

## OVERVIEW

Cross-platform desktop launcher (macOS/Linux/Windows) built with SvelteKit + Tauri. Extensible via multi-framework extensions (React/Vue/Svelte/Next/Nuxt), served through custom URI schemes with isolated permission-based APIs.

## STRUCTURE

```
./
├── apps/
│   ├── desktop/           # SvelteKit + Tauri app (main product)
│   ├── cli/               # Extension development CLI
│   ├── create-kunkun/     # Project scaffolding tool
│   └── browser-ext/       # Web browser companion
├── packages/
│   ├── api/               # Extension SDK (@kksh/api)
│   ├── ui/                # Shared Svelte components
│   ├── templates/         # 8 extension templates (by framework)
│   ├── extensions/        # Built-in/demo extensions
│   ├── tauri-plugins/     # Custom Tauri plugins (jarvis, network, etc.)
│   └── [shared libs]      # utils, types, db, crypto, grpc, drizzle
├── vendors/               # Git submodules (kkrpc, applications-rs, taur-plugins-*)
└── .github/workflows/     # Multi-runtime CI (Node+Bun+Deno)
```

## WHERE TO LOOK

| Task                | Location                  | Notes                                |
| ------------------- | ------------------------- | ------------------------------------ |
| Desktop app         | `apps/desktop/src/`       | SvelteKit frontend                   |
| Desktop backend     | `apps/desktop/src-tauri/` | Rust Tauri entry: `main.rs`          |
| Extension SDK       | `packages/api/src/`       | Core APIs for extension devs         |
| Custom plugins      | `packages/tauri-plugins/` | System APIs (clipboard, fs, network) |
| Extension templates | `packages/templates/`     | Scaffolding by framework             |
| Database            | `packages/drizzle/`       | SQLite + Drizzle ORM                 |
| CLI tool            | `apps/cli/`               | Extension verification/building      |

## CODE MAP

```
[Note: LSP codemap skipped - project too large for symbolic indexing]
```

## CONVENTIONS

### TypeScript/Svelte

- **Indent:** 2-space (Prettier enforced)
- **Components:** PascalCase `.svelte` files
- **TS files:** kebab-case naming
- **Constants:** `UPPER_SNAKE_CASE`
- **Imports:** Sorted via `@ianvs/prettier-plugin-sort-imports`
- **Line width:** 100 chars

### Rust

- **Formatting:** rustfmt defaults
- **Modules:** `snake_case` naming
- **Workspace:** 6 members in `Cargo.toml`

### Testing

- **TS:** `bun test --coverage` (preferred), Vitest (selective)
- **Rust:** `cargo test` with `#[test]` attributes
- **Placement:** `__tests__/` or `*.test.ts` (TS); inline `#[cfg(test)]` (Rust)
- **Co-location:** Tests next to source code

### Build & Dev

- **Package manager:** pnpm 10.7.0+ (workspaces)
- **Build:** `pnpm build` (Turbo orchestrates)
- **Dev:** `pnpm dev` (workspace) or `pnpm --filter @kksh/desktop tauri dev`
- **Lint:** `pnpm lint`, `pnpm check-types`, `pnpm format`

## ANTI-PATTERNS (THIS PROJECT)

### FORBIDDEN

- **NEVER** commit secrets (use local `.env`)
- **NEVER** use `#[repr(packed)]` with references (Rust)
- **NEVER** assume field order without `#[repr(C)]` (FFI only)
- **NEVER** use `as any`, `@ts-ignore`, `@ts-expect-error` (TS)

### DEPRECATED/AVOID

- Direct global store usage in components (use context/props instead)
- Mixed workspace definitions (sync `pnpm-workspace.yaml` with `package.json`)
- Duplicate entries in `Cargo.toml` workspace members

## UNIQUE STYLES

### Multi-Runtime Extension System

Extensions support multiple frameworks with isolated contexts:

- **Custom UI:** Full apps (Svelte/React/Vue/Next/Nuxt/SvelteKit)
- **Template UI:** Simplified with pre-defined components
- **Worker:** Background-only extensions

### Custom URI Schemes

Extensions served via protocols: `appicon:`, `ext:`, `cbimg:` (not traditional file serving)

### Triple Publishing

Packages publish to NPM + JSR + Crates.io simultaneously

### Vendor Submodule Strategy

Vendored plugins in `vendors/` as git submodules, not npm packages

## COMMANDS

```bash
# Setup
pnpm install
git submodule update --init --recursive

# Development
pnpm dev                    # All packages
pnpm --filter @kksh/desktop tauri dev  # Desktop app

# Build & Test
pnpm build
pnpm test
cargo test -p <crate>       # Rust tests

# Quality
pnpm lint
pnpm check-types
pnpm format
```

## NOTES

### Platform-Specific

- **Windows:** Set `OPENSSL_*` env vars for Tauri builds
- **macOS:** Requires security permissions for system access; uses private APIs via `mac-security-rs`
- **Linux:** Needs webkit2gtk (see CONTRIBUTING.md)

### Extension Development

- Use `apps/create-kunkun` for scaffolding
- Templates in `packages/templates/` (8 frameworks)
- Test via desktop app's extension manager
- Docker-based builds: `huakunshen/kunkun-ext-builder:latest`

### Gotchas

- Build tool fragmentation: Turbo (orchestration) + Bun (setup) + pnpm (packages) + Cargo (Rust)
- Deep interdependencies between packages; watch for circular deps
- Some vendors in workspace, others not (inconsistent)
- CI runs JavaScript tests only on Ubuntu, Rust tests on all platforms

### Complexity

- **Total files:** 5,073
- **Total lines:** 91,965
- **Languages:** TypeScript, Svelte, Rust, Bash, YAML
- **Max directory depth:** 12
- **Large files (>500 lines):** 7
