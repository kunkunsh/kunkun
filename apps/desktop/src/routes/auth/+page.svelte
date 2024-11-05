<script lang="ts">
	import { supabase } from "@/supabase"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import Icon from "@iconify/svelte"
	import { DEEP_LINK_PATH_AUTH_CONFIRM } from "@kksh/api"
	import { Button, Card } from "@kksh/svelte5"
	import { Layouts } from "@kksh/ui"
	import { ArrowLeft } from "lucide-svelte"
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
			data.url && open(data.url)
		}
	}
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button
	variant="outline"
	size="icon"
	onclick={goBack}
	class="absolute left-2 top-2"
	data-tauri-drag-region
>
	<ArrowLeft class="size-4" />
</Button>

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
