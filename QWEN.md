# Kunkun Project Context

## Project Overview

Kunkun is a cross-platform desktop application built with Tauri (Rust + Svelte). It serves as an extensible platform, allowing users to install and run various extensions to add functionality. These extensions can provide UI components, headless commands, or template-based UIs. The project uses a monorepo structure managed by pnpm and Cargo for Node.js/Rust workspaces.

Key features include:
- Cross-platform support (MacOS, Linux, Windows)
- Extensibility via a rich extension system
- Built-in extension store
- Permissions system for extensions
- CLI tools for extension development and management

## Technologies Used

- **Frontend:** Svelte 5, SvelteKit, Tailwind CSS
- **Backend/Desktop:** Rust (Tauri framework)
- **Package Management:** pnpm (Node.js), Cargo (Rust)
- **Build System:** TurboRepo
- **Languages:** TypeScript, Rust, Svelte
- **Database:** Drizzle ORM (SQLite)
- **UI Library:** Custom internal UI library (`@kksh/ui`)
- **API Layer:** Custom API library (`@kksh/api`)

## Project Structure

```
.
├── apps
│   ├── cli              # Kunkun CLI tool
│   ├── create-kunkun    # Tool for scaffolding new extensions
│   └── desktop          # Main Tauri desktop application
├── packages
│   ├── api              # Shared API types and utilities for extensions
│   ├── extensions       # Official extensions
│   ├── schema           # JSON schemas
│   ├── templates        # Extension templates
│   ├── tauri-plugins    # Custom Tauri plugins
│   ├── ui               # Shared Svelte UI components
│   └── ...              # Other shared libraries and tools
├── vendors              # Vendored external dependencies
└── ...
```

## Building and Running

### Prerequisites

- Node.js >= 22
- pnpm
- Rust toolchain
- Platform-specific dependencies for Tauri (see Tauri docs)

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

1. Start the development server:
   ```bash
   pnpm dev
   ```
   This command uses TurboRepo to run the `dev` script in all relevant packages/apps.

### Building

1. Build the project:
   ```bash
   pnpm build
   ```
   This command uses TurboRepo to run the `build` script in all relevant packages/apps.

### Testing

1. Run tests:
   ```bash
   pnpm test
   ```
   This command uses TurboRepo to run the `test` script in all relevant packages/apps.

### Linting and Formatting

1. Lint the code:
   ```bash
   pnpm lint
   ```

2. Format the code:
   ```bash
   pnpm format
   ```

### Running the Desktop App

After building, the desktop app can be run directly or packaged for distribution using Tauri's CLI. Check `apps/desktop/src-tauri` for Tauri-specific configurations and build commands.

## Development Conventions

- **Monorepo:** The project uses a monorepo structure with pnpm workspaces for Node.js packages and Cargo workspaces for Rust crates.
- **Code Style:** Prettier is used for code formatting. ESLint is used for linting JavaScript/TypeScript/Svelte files.
- **Type Safety:** TypeScript is used extensively. Svelte 5's runes are leveraged for state management.
- **UI Components:** Reusable UI components are developed in `packages/ui` using Tailwind CSS and Svelte.
- **API:** A shared API library (`packages/api`) provides types and utilities for both the main app and extensions.
- **Extensions:** Extensions are developed as separate packages within the monorepo (e.g., `packages/extensions/*`). They define their metadata, permissions, and entry points in their `package.json` under the `kunkun` key.