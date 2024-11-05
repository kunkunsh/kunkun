<script lang="ts">
	import { auth } from "@/stores"
	import { supabase } from "@/supabase"
	import { goHomeOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Avatar, Button } from "@kksh/svelte5"
	import { goto } from "$app/navigation"
	import { ArrowLeft } from "lucide-svelte"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"

	const { data } = $props()

	async function authExchange() {
		if (data.code) {
			auth.signInExchange(data.code).then((res) => {
				if (res.error) {
					toast.error("Failed to sign in", { description: res.error.message })
				} else {
					toast.success("Signed In")
				}
			})
		} else {
			toast.error("No code found")
		}
	}

	const avatarFallback = $derived.by(() => {
		if (!$auth.session) return "?"
		const nameSplit = $auth.session.user.user_metadata.name.split(" ").filter(Boolean)
		if (nameSplit.length > 1) {
			return nameSplit[0][0] + nameSplit.at(-1)[0]
		} else if (nameSplit.length === 1) {
			return nameSplit[0][0]
		} else {
			return "?"
		}
	})

	onMount(() => {
		authExchange()
	})

	function onSignOut() {
		auth
			.signOut()
			.then(() => goto("/auth"))
			.catch((err) => toast.error("Failed to sign out", { description: err.message }))
	}
</script>

<svelte:window on:keydown={goHomeOnEscape} />
<Button
	variant="outline"
	size="icon"
	onclick={goBack}
	class="absolute left-2 top-2"
	data-tauri-drag-region
>
	<ArrowLeft class="size-4" />
</Button>
<main class="container pt-10">
	<div class="flex grow items-center justify-center pt-16">
		<div class="flex flex-col items-center gap-4">
			{#if $auth.session}
				<span class="font-mono text-4xl font-bold">Welcome, You are Logged In</span>
			{:else}
				<span class="font-mono text-4xl font-bold">You Are Not Logged In</span>
			{/if}
			<span class="flex flex-col items-center gap-5 text-xl">
				{#if $auth.session}
					<Avatar.Root class="h-32 w-32 border">
						<Avatar.Image src={$auth.session?.user.user_metadata.avatar_url} alt="avatar" />
						<Avatar.Fallback>{avatarFallback}</Avatar.Fallback>
					</Avatar.Root>
				{/if}
				<Button variant="outline" onclick={onSignOut}>Sign Out</Button>
			</span>
		</div>
	</div>
</main>
