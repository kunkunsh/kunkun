# Kunkun Templates Knowledge Base

**Generated:** 2026-01-17
**Commit:** 302a09f
**Branch:** feature/browser-extension

## OVERVIEW

8 extension scaffolding templates: Custom UI (6 frameworks), Template UI (2), Worker/Headless.

## STRUCTURE

### Custom UI (Full Control)

- **react/**: Vite + React 18 + Tailwind + shadcn/ui
- **vue/**: Vite + Vue 3 + Tailwind + Radix Vue
- **svelte/**: Vite + Svelte 5 + Tailwind + lucide-svelte
- **next/**: Next.js 14 SSG + React + Tailwind (SSR forbidden)
- **nuxt/**: Nuxt 3 SSG + Vue + Tailwind (SSR forbidden)
- **sveltekit/**: SvelteKit 2 SSG + Svelte 5 + Tailwind (SSR forbidden)

### Template UI (Pre-defined)

- **worker/**: Bun-bundled single file (~40KB), i18n via i18next
- **headless/**: Bun-bundled, no UI, headless commands only

```
template-ext-*/
├── src/                    # App.tsx/.svelte/.vue, main.tsx, lib/utils
├── public/                 # Static assets
├── components.json         # shadcn config
├── tailwind.config.*       # Tailwind + PostCSS
├── vite.config.ts          # Vite bundler
├── build.ts                # Bun build (worker/headless)
└── package.json            # kunkun manifest
```

## WHERE TO LOOK

| Task                   | Location                                                  |
| ---------------------- | --------------------------------------------------------- |
| Template scaffolding   | `apps/create-kunkun/src/index.ts`                         |
| Build bundlers         | `build.ts`, `vite.config.ts`                              |
| Dev server ports       | `package.json` → `devMain`: `localhost:5173`              |
| Multi-command setup    | `package.json` → `kunkun.customUiCmds[]`                  |
| Static output dirs     | React/Svelte/Vue: `dist`, Next: `out`, SvelteKit: `build` |
| Permission declaration | `package.json` → `kunkun.permissions[]`                   |

## CONVENTIONS

**Template Design**: Custom UI uses SSG mode only (meta-frameworks); SSR disabled. Template UI uses `bun build --minify --target=browser` single-file bundle. Dev server: port 5173 (configurable). Entry points: Custom UI: `index.html`; Template UI: `dist/index.js`.

**package.json Manifest**:

```json
"kunkun": {
  "name": "Display Name", "identifier": "unique-id",
  "icon": { "type": "iconify", "value": "logos:react" },
  "permissions": ["clipboard:read-text"],
  "customUiCmds": [{ "main": "/", "devMain": "http://localhost:5173", "dist": "dist", "cmds": [] }]
}
```

**Multi-Framework Patterns**: React: `@kksh/react` + Radix UI + ESLint (react-hooks, react-refresh); Vue: `@kksh/vue` + Radix Vue + vue-tsc + tailwind-variants; Svelte: `@kksh/svelte5` + lucide-svelte + svelte-check + tailwind-merge; Tailwind: PostCSS + `baseColor: neutral` (shadcn new-york); Icons: iconify (logos:\*), Radix Icons, lucide-svelte.

**Build & Publish**: Custom UI: `vite build`/`next build`/`nuxt generate`; Template UI: `bun build.ts` (watch with `dev` flag); Verify: `npx kksh@latest verify --publish`; Publish: `["dist", ".gitignore"]` or `["out", ".gitignore"]` (Next).
