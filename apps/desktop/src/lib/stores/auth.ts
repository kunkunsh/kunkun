import { supabase } from "@/supabase"
import type { AuthError, Session, User } from "@supabase/supabase-js"
import { get, writable, type Writable } from "svelte/store"

type State = { session: Session | null; user: User | null }

interface AuthAPI {
	get: () => State
	refresh: () => Promise<void>
	signOut: () => Promise<{ error: AuthError | null }>
	signInExchange: (code: string) => Promise<{ error: AuthError | null }>
}

function createAuth(): Writable<State> & AuthAPI {
	const store = writable<State>({ session: null, user: null })
	async function refresh() {
		const {
			data: { session },
			error
		} = await supabase.auth.getSession()
		const {
			data: { user }
		} = await supabase.auth.getUser()
		store.update((state) => ({ ...state, session, user }))
	}
	async function signOut() {
		return supabase.auth.signOut().then((res) => {
			refresh()
			return res
		})
	}
	async function signInExchange(code: string) {
		return supabase.auth.exchangeCodeForSession(code).then((res) => {
			refresh()
			return res
		})
	}
	return {
		...store,
		get: () => get(store),
		refresh,
		signOut,
		signInExchange
	}
}

export const auth = createAuth()
