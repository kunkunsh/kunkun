# drizzle

- Only use `pull` to generate the schema from existing database.
- Don't `migrate` or `push`.

```bash
export DB_FILE_NAME="~/Library/Application Support/sh.kunkun.desktop/kk.dev.sqlite"
bunx drizzle-kit pull
```

We are using sqlite with fts5, which drizzle doesn't support yet, so pushing the schema will destroy the existing schema.

We only use pulled schema to generate sql queries.
