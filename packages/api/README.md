# @kksh/api

![NPM Version](https://img.shields.io/npm/v/%40kksh%2Fapi)

[Kunkun API](https://www.npmjs.com/package/@kksh/api) is an NPM package designed for developers to create extensions for Kunkun.

`@kksh/api` provides a set of APIs for extensions to interact with Kunkun and System APIs. The APIs include:

- Clipboard
- Database
- Dialog
- Event
- Fetch
- File System
- Logger
- Network
- Notification
- Open
- OS
- Path
- Shell
- System Info
- System Commands
- Toast
- UI
- etc.

Read more details in documentation at https://docs.kunkun.sh,
and generated docs at https://docs.api.kunkun.sh/

## Dev

### Dependency Graph

To detect circular dependencies

```bash
pnpm madge ./src/ui/worker/index.ts --circular # detect circular dependencies
pnpm dep-tree ./src/ui/worker/index.ts


pnpm test # this will detect circular dependencies in all files
```
