<script lang="ts">
	import { base } from '$app/paths';
	import { clipboard, notification, ui, toast, dialog } from '@kksh/api/ui/iframe';
	import {
		ModeToggle,
		Button,
		Command,
		CommandFooter,
		ModeWatcher,
		Separator,
		ThemeWrapper,
		updateTheme
	} from '@kksh/svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		clipboard.readText().then((text) => {
			console.log('clipboard text', text);
		});
	});

	function showDialog() {
		dialog
			.open({ directory: false })
			.then((res: any) => console.log(res))
			.catch((err: any) => {
				console.error(err);
			});
	}
</script>

<div class="container mt-16">
	<Button onclick={showDialog}>Show Dialog</Button>
</div>
