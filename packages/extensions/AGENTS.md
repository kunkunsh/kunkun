# Extensions Package

**Generated:** 2026-01-17
**Commit:** 302a09f
**Branch:** feature/browser-extension

## OVERVIEW

Built-in and demo extensions demonstrating all Kunkun extension types.

## STRUCTURE

### Custom UI Extensions

- **ext-sveltekit-exp/**: Full SvelteKit app with routing, static output (SSG)
  - Multi-page support via meta-framework routing
  - Dev: `devMain: http://localhost:5173`
  - Prod: `main: build/` (static HTML files)

### Template UI Extensions

- **form-view/**: Form-based UI with pre-defined components
  - Single entrypoint: `dist/index.js`
  - Components: Form, List, Markdown, Action from `@kksh/api/ui/template`
  - Smaller bundles (~40KB vs 300KB+ for Custom UI)

### Worker Extensions

- **demo-worker-template-ext/**: Background tasks with optional template UI
  - `headlessCmds`: Background-only commands
  - `templateUiCmds`: Optional UI components
  - Shell/Deno integration examples

## WHERE TO LOOK

| Task                 | Location                                   | Notes                            |
| -------------------- | ------------------------------------------ | -------------------------------- |
| Custom UI manifest   | `ext-sveltekit-exp/package.json`           | `customUiCmds` config            |
| Template UI entry    | `form-view/src/index.ts`                   | `expose(new ExtensionClass())`   |
| Worker background    | `demo-worker-template-ext/src/headless.ts` | Headless command logic           |
| Build config         | `*/build.ts`                               | Bun build + watch for hot reload |
| Pre-built components | `@kksh/api/ui/template`                    | List, Form, Markdown, Action     |

## CONVENTIONS

### Manifest (package.json)

```json
"kunkun": {
  "name": "Display Name",
  "identifier": "unique-id",
  "icon": { "type": "iconify", "value": "carbon:icon" },
  "permissions": ["clipboard:read-text", "fetch:all"],
  "customUiCmds": [{ "main": "build", "devMain": "http://localhost:5173" }],
  "templateUiCmds": [{ "main": "dist/index.js" }],
  "headlessCmds": [{ "main": "dist/headless.js" }]
}
```

### Extension Class Pattern

```ts
class MyExtension extends TemplateUiCommand {
  async load() { return ui.render(new List({...})) }
  async onFormSubmit(value: Record<string, any>) {}
  async onSearchTermChange(term: string) {}
  async onListItemSelected(value: string) {}
  async onActionSelected(actionValue: string) {}
  async onBeforeGoBack() {}
}
expose(new MyExtension())
```

### Build Commands

- Custom UI: `vite build` (static output)
- Template/Worker: `bun build --minify --target=browser --outdir=./dist src/index.ts`
- Dev: `bun build.ts dev` (watches src/ for hot reload)

### Permission Format

- Simple: `"clipboard:read-text"`
- Complex: `{ "permission": "shell:spawn", "allow": [{ "cmd": {...} }] }`
- Paths: Use `$EXTENSION/src/script.ts` relative reference

### File Distribution

- Publish via `files: ["build", ".gitignore"]` (Custom UI)
- Publish via `files: ["dist", ".gitignore"]` (Template/Worker)
- Output: `.tgz` tarball via `npm pack`

### i18n Support (Optional)

- Directory: `src/i18n/` with `en.ts`, `zh.ts`
- Usage: `setupI18n(await app.language())` then `t("key")`
