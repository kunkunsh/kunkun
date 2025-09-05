# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Kunkun is a cross-platform desktop application built with Tauri (Rust backend) and SvelteKit (frontend). It's an extensible launcher/utility app that supports custom extensions developed in various web frameworks.

## Development Commands

### Essential Commands
- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages and submodules
- `pnpm dev` - Start development servers for all packages
- `pnpm lint` - Run linting across all packages
- `pnpm test` - Run tests across all packages
- `pnpm check-types` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier

### Desktop App Specific
- `pnpm --filter @kksh/desktop tauri dev` - Run desktop app in development mode
- `cd apps/desktop && pnpm tauri dev` - Alternative way to run desktop app
- `cd apps/desktop && pnpm tauri build` - Build desktop app for production

### Prerequisites for Development
- Node.js ≥22
- pnpm 10.7.0+ (package manager)
- Rust (for Tauri backend)
- Bun, Deno (for various tools)
- protobuf (`brew install protobuf` on macOS)
- cmake (`brew install cmake` on macOS)

## Architecture

### Monorepo Structure
- **apps/**: Main applications
  - `desktop/`: Primary Tauri desktop app (SvelteKit frontend + Rust backend)
  - `cli/`: Command-line interface
  - `create-kunkun/`: Scaffolding tool for extensions
- **packages/**: Shared libraries and utilities
  - `ui/`: Shared UI components
  - `types/`: TypeScript type definitions
  - `extension/`: Extension development framework
  - `drizzle/`: Database ORM setup
  - `tauri-plugins/`: Custom Tauri plugins
  - `templates/`: Extension templates
  - `extensions/`: Sample/demo extensions
- **vendors/**: Third-party dependencies and custom plugins

### Key Technologies
- **Frontend**: SvelteKit 2 with TypeScript, TailwindCSS, Vite
- **Backend**: Rust with Tauri 2.x framework
- **Database**: SQLite with Drizzle ORM
- **Build System**: Turbo (monorepo orchestration) + pnpm workspaces
- **UI Framework**: Custom component library built on Tailwind + Radix

### Extension System
- Extensions can be built with React, Vue, Svelte, SvelteKit, Nuxt, or vanilla JS
- Templates available in `packages/templates/` for each framework
- Extensions run in isolated contexts with permission-based APIs
- Custom Tauri plugins provide system access (clipboard, fs, network, etc.)

### Rust Backend Architecture
- Custom Tauri plugins for extended functionality:
  - `tauri-plugin-jarvis`: Core extension runtime
  - `tauri-plugin-network`: Network operations
  - `tauri-plugin-system-info`: System information
  - `tauri-plugin-user-input`: Input handling
  - `tauri-plugin-keyring`: Secure credential storage
- gRPC communication for some internal services
- Cross-platform support with platform-specific dependencies

## Development Workflow

### Setting Up Development Environment
```bash
git clone https://github.com/kunkunsh/kunkun.git --recursive
pnpm install
pnpm build  # Build submodules first
```

### Working with Extensions
- Use `apps/create-kunkun` to scaffold new extensions
- Extension templates are in `packages/templates/`
- Test extensions in the desktop app's extension manager

### Database Development
- Uses Drizzle ORM with SQLite backend
- Database package located in `packages/drizzle/`
- Migrations and schema definitions managed through Drizzle

## Testing and Quality

### Linting and Type Checking
- ESLint configuration in `packages/config-eslint/`
- TypeScript config in `packages/typescript-config/`
- Prettier for code formatting
- `turbo lint` and `turbo check-types` run across all packages

### Build Process
- Turbo orchestrates builds across the monorepo
- Each package defines its own build scripts
- Dependencies built in topological order via `dependsOn` in turbo.json

## Platform-Specific Notes

### macOS
- Requires additional security permissions for system access
- `mac-security-rs` package handles platform-specific APIs
- Uses private macOS APIs for enhanced functionality

### Dependencies
- Most packages use workspace dependencies for internal packages
- External dependencies centrally managed in root package.json
- Rust dependencies managed via workspace Cargo.toml

## Extension Development Framework

Extensions have access to:
- File system APIs (through Tauri plugins)
- Network requests
- Clipboard operations
- System information
- Secure storage (keyring)
- UI components from shared library

The extension system supports both headless (worker) extensions and full UI extensions with multiple framework options.