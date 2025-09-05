# Kunkun Project Overview

This document provides a comprehensive overview of the Kunkun project, its architecture, and development conventions, intended to be used as instructional context for future interactions.

## Project Overview

Kunkun is a cross-platform desktop application built with [Tauri](https://tauri.app/). It features a Svelte-based frontend and a Rust backend. The project is structured as a monorepo, managed with [pnpm](https://pnpm.io/) for the frontend and [Cargo](https://doc.rust-lang.org/cargo/) for the backend.

The application appears to be an extensible tool, with a system for "extensions" that can be installed. It also includes a CLI and various other packages.

### Key Technologies

*   **Frontend:** Svelte, TypeScript
*   **Backend:** Rust, Tauri
*   **Monorepo Management:** pnpm, Cargo, Turbo
*   **Database:** The project includes a `db` package, but the specific database is not immediately clear from the file names.
*   **API:** The project includes a `grpc` package, suggesting the use of gRPC for inter-process communication.

## Building and Running

The project uses `turbo` to manage the monorepo. The main commands are defined in the root `package.json`:

*   **Development:** To run the application in development mode, use the following command:
    ```bash
    pnpm dev
    ```
    This will start the Svelte development server and the Tauri application.

*   **Building:** To build the application for production, use the following command:
    ```bash
    pnpm build
    ```
    This will build the frontend and the Tauri application.

*   **Testing:** To run the test suite, use the following command:
    ```bash
    pnpm test
    ```

*   **Linting:** To lint the codebase, use the following command:
    ```bash
    pnpm lint
    ```

*   **Formatting:** To format the codebase, use the following command:
    ```bash
    pnpm format
    ```

## Development Conventions

*   **Coding Style:** The project uses Prettier for code formatting. The configuration is defined in `.prettierrc`.
*   **Testing:** The project has a `test` script, but the specific testing framework is not immediately clear. There are `__tests__` directories in some packages, suggesting the use of a framework like Jest or Vitest.
*   **Contribution:** The `CONTRIBUTING.md` file should be consulted for contribution guidelines.
