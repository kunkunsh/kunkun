# Repository Guidelines

## Project Structure & Module Organization
- `apps/desktop`: SvelteKit + Tauri desktop app. Source in `src/`, Tauri Rust code in `src-tauri/`, assets in `static/`, i18n in `messages/`.
- `packages/*`: Shared libraries and tools (e.g., `api`, `ui`, `utils`, `drizzle`, `grpc`) and Rust crates (`db`, `crypto`, `tauri-plugins/*`).
- `vendors/*`: Vendored plugins/submodules used by the desktop app.
- Tests live next to code: TS tests in `__tests__` or `*.test.ts`; Rust tests via `#[test]` inside crates.

## Build, Test, and Development Commands
- Install: `pnpm install` (root workspace).
- Initialize vendors: `git submodule update --init --recursive` (if vendors look empty).
- Build all: `pnpm build` (Turbo builds packages; Tauri builds when needed).
- Dev (workspace): `pnpm dev`.
- Dev (desktop): `pnpm --filter @kksh/desktop tauri dev` or `cd apps/desktop && pnpm tauri dev`.
- Test (TS): `pnpm test` or `pnpm -F <package> test`.
- Test (Rust): `cargo test -p <crate>`.
- Lint/format/types: `pnpm lint`, `pnpm format`, `pnpm check-types`. Rust: `cargo fmt` (and `cargo clippy` if available).

## Coding Style & Naming Conventions
- TypeScript/Svelte: 2‑space indent; Prettier + ESLint enforced. Imports sorted via `@ianvs/prettier-plugin-sort-imports`.
- Components: PascalCase `.svelte`. TS files: kebab‑case file names; constants `UPPER_SNAKE_CASE`.
- Rust: rustfmt defaults; crates and modules use `snake_case`.

## Testing Guidelines
- Frameworks: Vitest (TS) and Cargo tests (Rust).
- Placement: co‑locate unit tests in `__tests__` or `*.test.ts`; use `#[test]` in Rust modules.
- Expectations: add tests with new or changed logic; mock I/O and network; keep tests deterministic and fast.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits with optional scope, mirroring history (e.g., `feat(desktop): improve app icon handling`, `fix(api): update matchPathAndScope`, `chore: upgrade applications-rs submodule`). Reference related issues/PRs like `(#230)`.
- Pull requests: include a clear description, linked issues, test plan/steps, and screenshots or GIFs for UI changes. Note platform impact (macOS/Linux/Windows). Keep diffs focused and update docs/messages when relevant.

## Security & Configuration Tips
- Never commit secrets; use local `.env` files (checked by Turbo inputs). On Windows, configure `OPENSSL_*` env vars when building Tauri (see `CONTRIBUTING.md`).
- Prefer non‑privileged APIs; audit shell/OS calls in extensions and plugins.

