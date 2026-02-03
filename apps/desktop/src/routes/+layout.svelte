<script lang="ts">
	import { ParaglideJS } from "@inlang/paraglide-sveltekit"
	import { i18n } from "$lib/i18n"
	import "../app.css"
	import FullScreenLoading from "@/components/common/FullScreenLoading.svelte"
	import { appState } from "@/stores/appState"
	import { appConfig } from "@/stores"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"
	import { Toaster } from "svelte-sonner"
	import { invoke } from "@tauri-apps/api/core"
	import { onMount } from "svelte"
	import { get } from "svelte/store"

	let { children } = $props()

	let colors: Record<string, string> | null = null;

	onMount(async () => {
		try {
			const css = await invoke<string>('get_gtk_css');
			if (css) {
				colors = parseGtkColors(css);
			}
		} catch (e) {
			console.error('Failed to load GTK CSS:', e);
		}

		// Subscribe to config changes to apply/remove GTK theme immediately
		appConfig.subscribe((config) => {
			if (config.useGtkTheme && colors) {
				applyGtkColors(colors);
			} else {
				resetGtkColors();
			}
		});
	})

	function resetGtkColors() {
		const varNames = ['--background', '--foreground', '--card', '--card-foreground', '--muted', '--muted-foreground'];
		varNames.forEach(varName => {
			document.documentElement.style.removeProperty(varName);
		});
		// Remove the switch thumb style
		const style = document.getElementById('gtk-switch-thumb-style');
		if (style) style.remove();
	}

	function parseGtkColors(css: string): Record<string, string> {
		const colorMap: Record<string, string> = {};
		const defineColorRegex = /@define-color\s+(\w+)\s+([^;]+);/g;
		let match;
		while ((match = defineColorRegex.exec(css)) !== null) {
			colorMap[match[1]] = match[2];
		}
		console.log('Extracted GTK colors:', colorMap);
		return colorMap;
	}

	function applyGtkColors(colors: Record<string, string>) {
		const mappings: Record<string, string> = {
			'window_bg_color': '--background',
			'window_fg_color': '--foreground',
			'view_bg_color': '--card',
			'view_fg_color': '--card-foreground',
			'headerbar_bg_color': '--muted',
			'headerbar_fg_color': '--muted-foreground',
		};
		for (const [gtkColor, cssVar] of Object.entries(mappings)) {
			if (colors[gtkColor]) {
				console.log(`Setting ${cssVar} to ${colors[gtkColor]}`);
				document.documentElement.style.setProperty(cssVar, colors[gtkColor]);
			}
		}
		// Make switch thumb black for visibility on dark GTK backgrounds
		const style = document.createElement('style');
		style.id = 'gtk-switch-thumb-style';
		style.textContent = '[data-switch-thumb] { background: black !important; }';
		document.head.appendChild(style);
	}
</script>

<ParaglideJS {i18n}>
	<ModeWatcher />
	<Toaster richColors closeButton />
	<ThemeWrapper>
		{#if $appState.fullScreenLoading}
			<FullScreenLoading class="bg-background absolute inset-0 z-50" />
		{/if}
		{@render children()}
	</ThemeWrapper>
</ParaglideJS>
