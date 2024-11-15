<script>
	import { base } from '$app/paths';
	import { Alert, Button, ThemeWrapper } from '@kksh/svelte';
</script>

<ThemeWrapper>
	<Alert.Root>
		<Alert.Title class="text-3xl font-bold">About Page</Alert.Title>
		<Alert.Description>
			<a href="{base}/">
				<Button>Home Page</Button>
			</a>
		</Alert.Description>
	</Alert.Root>
</ThemeWrapper>
