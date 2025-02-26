<script lang="ts">
	import { base } from '$app/paths';
	import { clipboard, notification, ui, toast, dialog, shell } from '@kksh/api/ui/custom';
	import {
		ModeToggle,
		Button,
		Command,
		ModeWatcher,
		Separator,
		ThemeWrapper,
		updateTheme
	} from '@kksh/svelte5';
	import { onMount } from 'svelte';

	async function paste() {
		await clipboard
			.paste()
			.then(() => {
				console.log('pasted');
			})
			.catch((err) => {
				console.error(err);
			});
	}
</script>

<div data-kunkun-drag-region class="h-12"></div>
<div class="container">
	<Button onclick={paste}>Paste</Button>
</div>
