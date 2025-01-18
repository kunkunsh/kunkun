/**
 * Initialize .env files for packages
 * All env variables here are public
 */
import { writeFileSync } from "fs"
import { join } from "path"
import { REPO_ROOT } from "@/path"
import * as v from "valibot"

console.log("Init Env")

const defaultEnvUrl = `https://storage.kunkun.sh/env.json`
const res = await fetch(defaultEnvUrl)
const env = v.parse(
	v.object({
		SUPABASE_URL: v.string(),
		SUPABASE_ANON_KEY: v.string()
	}),
	await res.json()
)

let envContent = ""

if (!process.env.SUPABASE_ANON_KEY) {
	process.env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY
}
if (!process.env.SUPABASE_URL) {
	process.env.SUPABASE_URL = env.SUPABASE_URL
}

if (process.env.SUPABASE_ANON_KEY) {
	envContent += `SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY}\n`
}
if (process.env.SUPABASE_URL) {
	const supabaseUrl = process.env.SUPABASE_URL
	const supabaseGraphqlEndpoint = `${supabaseUrl}/graphql/v1`
	envContent += `
SUPABASE_GRAPHQL_ENDPOINT=${supabaseGraphqlEndpoint}
SUPABASE_URL=${supabaseUrl}
`
}
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
	envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}\n`
}
if (process.env.POSTHOG_PUBLIC_KEY && process.env.POSTHOG_HOST) {
	envContent += `
POSTHOG_PUBLIC_KEY=${process.env.POSTHOG_PUBLIC_KEY}
POSTHOG_HOST=${process.env.POSTHOG_HOST}
`
}

// writeFileSync(join(__dirname, "../apps/desktop/.env"), envContent)
writeFileSync(
	join(REPO_ROOT, "apps/desktop/.env"),
	`
PUBLIC_SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY}
PUBLIC_SUPABASE_URL=${process.env.SUPABASE_URL}
`
)
// writeFileSync(join(__dirname, "../packages/gql/.env"), envContent)
writeFileSync(join(REPO_ROOT, "packages/schema/.env"), envContent)

writeFileSync(join(REPO_ROOT, "packages/tauri-plugins/jarvis/.env"), envContent)
