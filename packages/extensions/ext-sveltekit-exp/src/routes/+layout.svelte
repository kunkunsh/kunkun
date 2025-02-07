<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { ThemeWrapper, updateTheme } from '@kksh/svelte5';
	import { onMount } from 'svelte';
	import { ui } from '@kksh/api/ui/custom';

	onMount(() => {
		ui.registerDragRegion();
		ui.getTheme().then((theme) => {
			updateTheme(theme);
		});
	});
</script>

<ModeWatcher />
<ThemeWrapper>
	<slot />
</ThemeWrapper>
