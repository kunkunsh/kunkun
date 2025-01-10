<script lang="ts">
	import { ThemeCustomizerButton, type ThemeConfig, updateTheme } from '@kksh/svelte5';
	import { ui } from '@kksh/api/ui/iframe';
	import { onMount } from 'svelte';

	let config: ThemeConfig = {
		radius: 0.5,
		theme: 'zinc',
		lightMode: 'auto'
	};
	onMount(() => {
		ui.getTheme().then((theme) => {
			config = theme;
		});
	});

	$: updateTheme(config);
</script>

<ThemeCustomizerButton bind:config />
