<script lang="ts">
	import { onMount } from "svelte"
	import { fly } from "svelte/transition"
	import { cn } from "../../utils"

	export let words: string[] = ["Hello", "Svelte", "Coders"]
	export let duration: number = 2100

	let className: string = ""
	export { className as class }

	let index = 0
	let chnageIndex = () => {
		index = (index + 1) % words.length
	}
	onMount(() => {
		let interval = setInterval(chnageIndex, duration)
		return () => clearInterval(interval)
	})
	//  I tried with Svelte Motion but there was a slight delay in the animation
	//  so I used the built-in svelte transition
</script>

<div class="overflow-hidden py-2">
	{#key index}
		<!-- Change In, Out Animation for Rotate Effects -->
		<h1
			in:fly={{ y: -50, delay: 200 }}
			out:fly={{ y: 40, duration: 200 }}
			class={cn(className, "text-center")}
		>
			{words[index]}
		</h1>
	{/key}
</div>
