```bash
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > supabase/types/supabase.ts

```

Add the following to `.env`:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```
