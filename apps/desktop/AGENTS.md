# Kunkun Desktop App Knowledge Base

**Generated:** 2026-01-17
**Parent:** ../AGENTS.md

## OVERVIEW

Main SvelteKit + Tauri desktop launcher with extension management, custom URI protocols, and isolated extension sandboxes.

## STRUCTURE

```
apps/desktop/
├── src/                          # SvelteKit frontend
│   ├── routes/
│   │   ├── app/                  # Main app routes
│   │   │   ├── extension/        # Extension management (store, install, permissions)
│   │   │   ├── settings/         # App settings
│   │   │   ├── auth/             # Authentication
│   │   │   └── troubleshooters/   # Diagnostic tools
│   │   ├── splashscreen/         # Loading screen
│   │   └── dev/                  # Dev tools
│   └── lib/
│       ├── stores/               # Svelte stores (extensions, appConfig, appState, winExtMap)
│       ├── context/              # Context providers (appConfig, appState)
│       ├── components/
│       │   ├── main/             # Core app components
│       │   ├── common/           # Shared components
│       │   ├── context/          # Context wrappers
│       │   └── ui/               # UI components (from @kksh/ui)
│       ├── orm/                  # Database queries
│       ├── cmds/                 # Command runners
│       └── types/                # Type definitions
└── src-tauri/
    ├── src/
    │   ├── setup/                # Tauri setup (window, tray, clipboard, keyring)
    │   ├── commands/             # Tauri commands (keyring)
    │   └── utils/                # Utilities (log, server)
    └── Cargo.toml                # Rust dependencies
```

## WHERE TO LOOK

| Task                       | Location                                 | Notes                                  |
| -------------------------- | ---------------------------------------- | -------------------------------------- |
| Extension manager UI       | `src/routes/app/extension/`              | Store, install, permissions, inspector |
| Extension state management | `src/lib/stores/extensions.ts`           | Install, uninstall, reload, search     |
| App configuration          | `src/lib/stores/appConfig.ts`            | Settings, paths, preferences           |
| Window/extension mapping   | `src/lib/stores/winExtMap.ts`            | Track windows → extensions             |
| Extension command registry | `src/lib/stores/extensions.ts` (derived) | `storeExtCmds`, `devStoreExtCmds`      |
| Tauri setup/initialization | `src-tauri/src/lib.rs`                   | Plugin registration, protocols, setup  |
| URI protocol handlers      | `src-tauri/src/lib.rs`                   | `appicon:`, `ext:`, `cbimg:`           |
| Custom Tauri commands      | `src-tauri/src/commands/`                | Keyring integration                    |
| Clipboard monitoring       | `src-tauri/src/setup/clipboard.rs`       | Clipboard history tracking             |
| Database setup             | `src-tauri/src/setup/` (keyring, db)     | Encryption, jarvis DB                  |

## CONVENTIONS

### Component Architecture

- **Modular components**: Exportable, reusable via `@kksh/ui` or standalone
- **Context over globals**: Use context providers, avoid direct global store imports
- **Store patterns**: Custom writable stores with actions (`createExtensionsStore`)
- **Derived stores**: Use `derived()` for computed state (search, filtering)

### Tauri Integration

- **URI schemes**: Custom protocols serve extensions, not traditional file serving
- **Protocol ports**: HTTPS server on port 9559 for extension APIs
- **Window management**: Single main window (hidden on close), accessory mode on macOS
- **Plugin architecture**: Heavy use of custom tauri-plugin-\* packages

### Extension System

- **Three types**: Custom UI (full app), Template UI (pre-defined), Headless (worker)
- **Dev vs Store**: Dev extensions (unregistered), Store extensions (installed)
- **Command search**: Fuse.js fuzzy search
- **Window-ext mapping**: Track which window serves which extension

## ANTI-PATTERNS (DESKTOP-SPECIFIC)

### FORBIDDEN

- **NEVER** import global stores directly in components (use context/props)
- **NEVER** create components that can't be exported as packages
- **NEVER** modify `winExtMap` without proper cleanup (memory leaks)
- **NEVER** bypass URI scheme handlers for extension resources

### DEPRECATED/AVOID

- Hardcoded extension paths (use `appConfig.extensionsInstallDir`)
- Direct Tauri command calls without store wrappers
- Mixing dev/store extension logic (separate concerns)
- Blocking main thread during extension loading
