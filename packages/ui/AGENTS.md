# Kunkun UI Package

**Generated:** 2026-01-17 | **Commit:** 302a09f | **Branch:** feature/browser-extension

## OVERVIEW

Shared Svelte component library built with shadcn-svelte, Radix primitives, and Tailwind CSS.

## STRUCTURE

```
packages/ui/src/components/
├── ui/              # Radix primitives (form, label, scroll-area)
├── common/          # Reusable elements (Kbd, LoadingBar, IconSelector)
├── animation/       # Motion components (BorderBeam, Meteors, AuroraText)
├── main/            # Command palette & panels (ActionPanel, ExtCmds)
├── extension/       # Extension-specific UI
│   ├── templates/   # ListView, FormView, MarkdownView
│   ├── publish/     # NPM/JSR package version tables
│   └── metadata/    # Template metadata components
├── markdown/        # Shiki + KaTeX rendering
├── layouts/         # Layout components
└── theme/           # Mode toggle
utils/               # cn() helper, tailwind-merge
```

**Locations:**

- Radix wrappers: `components/ui/`
- Animation effects: `components/animation/`
- Command palette: `components/main/`
- Extension templates: `components/extension/templates/`

## CONVENTIONS

### Exports

- Named: `export { default as Component }` from index files
- Barrel: `export * as Category from "./index"` in root index.ts
- Sub-exports: `./animation`, `./main`, `./extension` via package.json

### Styling

- Tailwind + cn(): `class={cn("base-class", className)}`
- shadcn-svelte: "new-york" variant, neutral base color
- Animations: CSS variables for configurable params
- Radix: Wrap bits-ui, forward props via `{...restProps}`

### Design

- Svelte 5 runes: `$props()`, `$bindable()`, `$derived()`
- Type safety: WithoutChild<PrimitiveProps> for Radix type constraints

## ANTI-PATTERNS

- NEVER use direct global class names without cn()
- NEVER hardcode animation values - use CSS variables
- NEVER skip prop spreading in Radix wrappers

## TECH STACK

- UI: bits-ui (Radix for Svelte 5), shadcn-svelte
- Forms: formsnap + sveltekit-superforms
- Animation: @formkit/auto-animate, GSAP
- Markdown: shiki + rehype + remark (KaTeX)
