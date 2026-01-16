# Kunkun Extension SDK Knowledge Base

**Package:** @kksh/api
**Purpose:** Core SDK for extension developers

## OVERVIEW

Extension SDK providing typed APIs, permission guards, and UI component schemas for multi-framework extensions.

## STRUCTURE

```
packages/api/src/
├── api/              # Client/server RPC (kkrpc-based)
│   ├── client.ts    # Main API interfaces (db, kv, fs, system, toast)
│   ├── server/      # Server-side implementations
│   └── shell.ts     # Shell execution (Child, Command, DenoCommand)
├── commands/        # Tauri backend (apps, fs, system, store, utils)
├── models/          # Extension manifest, ExtData, styles, icons
├── permissions/     # Schema, permission-map, description
├── ui/              # Custom UI (iframe), Template UI (worker), components
├── headless/        # Background worker APIs (HeadlessCommand)
├── dev/             # Development refresh hooks
├── runtime/deno.ts  # Deno runtime config
└── events.ts        # Extension process tracking
```

## WHERE TO LOOK

| Task                         | Location                            |
| ---------------------------- | ----------------------------------- |
| Extension APIs               | `src/api/client.ts`                 |
| Permission schemas           | `src/permissions/schema.ts`         |
| API → permission mapping     | `src/permissions/permission-map.ts` |
| UI component schemas         | `src/ui/template/schema/`           |
| Extension types              | `src/models/extension.ts`           |
| Command implementations      | `src/commands/*.ts`                 |
| Worker background extensions | `src/headless/index.ts`             |
| Full-app UI (iframe)         | `src/ui/custom/index.ts`            |
| Template UI (simplified)     | `src/ui/template/index.ts`          |
| Development refresh hooks    | `src/dev/index.ts`                  |

## CONVENTIONS

**API Design:** kkrpc/browser (WorkerChildIO/IframeChildIO); Tauri APIs from `tauri-api-adapter`; Scoped permissions `{permission, allow[], deny[]}`; Event API listen-only

**Permission System:** Valibot `v.union()` schemas; Fine-grained permissions (e.g., `system:volumn`); Every API method → permission in permission-map.ts

**UI Templates:** Three modes: Custom (full app), Template (simplified), Headless (worker-only); List/Action/Form/Markdown schemas; State via `workerUi.render()`

**Testing:** Co-located `__tests__/` or `*.test.ts`; `bun test --coverage`

## ANTI-PATTERNS (API DESIGN)

### FORBIDDEN

- **NEVER** expose `emit`/`disallow` on event API
- **NEVER** allow shell without `shell:execute`/`shell:spawn` permission
- **NEVER** bypass permission checks in server implementations
- **NEVER** mix Tauri IPC with kkrpc channels

### AVOID

- Adding API without permission-map.ts entry
- Extending Tauri interfaces directly (use wrapper types with `& { ... }`)
- Assuming all extensions run in iframe
- Permission strings not in `AllKunkunPermission` schema

### GOTCHAS

- **Dual publishing:** npm (`@kksh/api`) and jsr (`@kunkun/api`)
- **RPC isolation:** Separate IO channel per extension type
- **Process cleanup:** Tracked via `RECORD_EXTENSION_PROCESS_EVENT`
- **Hot reload:** Deep link refresh on build complete
