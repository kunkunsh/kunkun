<script lang="ts">
	import { auth } from "@/stores"
	import { supabase } from "@/supabase"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack, goHome } from "@/utils/route"
	import Icon from "@iconify/svelte"
	import { DEEP_LINK_PATH_AUTH_CONFIRM } from "@kksh/api"
	import { Button, Card } from "@kksh/svelte5"
	import { Layouts } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import { ArrowLeft } from "lucide-svelte"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import { open } from "tauri-plugin-shellx-api"

	const redirectTo = DEEP_LINK_PATH_AUTH_CONFIRM

	const signInWithOAuth = async (provider: "github" | "google") => {
		console.log(`Login with ${provider} redirecting to ${redirectTo}`)
		const { error, data } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo,
				skipBrowserRedirect: true
			}
		})
		if (error) {
			toast.error("Failed to sign in with OAuth", { description: error.message })
		} else {
			console.log(data.url);
			
			data.url && open(data.url)
		}
	}

	onMount(() => {
		if ($auth.session) {
			toast.success("Already Signed In")
			goHome()
		}
	})
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" onclick={goBack} class="absolute left-2 top-2 z-50">
	<ArrowLeft class="size-4" />
</Button>
<div class="absolute h-10 w-full" data-tauri-drag-region></div>
<Layouts.Center class="h-screen w-screen" data-tauri-drag-region>
	<Card.Root class="w-80">
		<Card.Header class="flex flex-col items-center">
			<img src="/favicon.png" alt="Kunkun" class="h-12 w-12 invert" />
			<Card.Title class="text-xl">Sign In</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-2">
			<Button variant="outline" size="lg" class="w-full" onclick={() => signInWithOAuth("github")}>
				<Icon icon="fa6-brands:github" class="h-5 w-5" />
			</Button>
			<Button variant="outline" size="lg" class="w-full" onclick={() => signInWithOAuth("google")}>
				<Icon icon="logos:google-icon" class="h-5 w-5" />
			</Button>
		</Card.Content>
	</Card.Root>
</Layouts.Center>
