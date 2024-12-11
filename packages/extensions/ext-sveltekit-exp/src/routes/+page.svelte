<script lang="ts">
	import { base } from '$app/paths';
	import { clipboard, notification, ui, toast, dialog, shell } from '@kksh/api/ui/iframe';
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

	async function testKkrpc() {
		const { rpcChannel, process, command } = await shell.createDenoRpcChannel<
			{},
			{
				echo: (paths: string[]) => Promise<string[]>;
			}
		>('$EXTENSION/deno-src/index.ts', [], {}, {});
		command.stderr.on('data', (data) => {
			'';
			console.log('stderr', data);
		});
		// command.stdout.on('data', (data) => {
		// 	console.log('stdout', data);
		// });
		const api = rpcChannel.getAPI();
		await api
			.echo([
				'/Users/hk/Desktop/_DSC2594.ARW',
				'/Users/hk/Desktop/_DSC2597.ARW',
				'/Users/hk/Desktop/_DSC2598.ARW',
				'/Users/hk/Desktop/DJI_20241128180028_0198_D.JPG',
				'/Users/hk/Desktop/_DSC2594.ARW',
				'/Users/hk/Desktop/_DSC2597.ARW',
				'/Users/hk/Desktop/_DSC2598.ARW',
				'/Users/hk/Desktop/DJI_20241128180028_0198_D.JPG',
				'/Users/hk/Desktop/_DSC2594.ARW',
				'/Users/hk/Desktop/_DSC2597.ARW',
				'/Users/hk/Desktop/_DSC2598.ARW',
				'/Users/hk/Desktop/DJI_20241128180028_0198_D.JPG',
				'/Users/hk/Desktop/_DSC2594.ARW',
				'/Users/hk/Desktop/_DSC2597.ARW',
				'/Users/hk/Desktop/_DSC2598.ARW',
				'/Users/hk/Desktop/DJI_20241128180028_0198_D.JPG',
				'/Users/hk/Desktop/_DSC2594.ARW',
				'/Users/hk/Desktop/_DSC2597.ARW',
				'/Users/hk/Desktop/_DSC2598.ARW',
				'/Users/hk/Desktop/DJI_20241128180028_0198_D.JPG',
				'/Users/hk/Desktop/_DSC2594.ARW',
				'/Users/hk/Desktop/_DSC2597.ARW',
				'/Users/hk/Desktop/_DSC2598.ARW',
				'/Users/hk/Desktop/DJI_20241128180028_0198_D.JPG',
				'/Users/hk/Desktop/_DSC2594.ARW',
				'/Users/hk/Desktop/_DSC2597.ARW',
				'/Users/hk/Desktop/_DSC2598.ARW',
				'/Users/hk/Desktop/DJI_20241128180028_0198_D.JPG'
			])
			.then(console.log)
			.catch(console.error);
		process.kill();
	}
</script>

<div data-kunkun-drag-region class="h-12"></div>
<div class="container">
	<Button onclick={showDialog}>Show Dialog</Button>
	<Button onclick={testKkrpc}>Test kkrpc</Button>
</div>
