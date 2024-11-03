<script lang="ts">
	import { Carousel, Dialog } from "@kksh/svelte5"

	let {
		open = $bindable(),
		imageSrcs,
		target = $bindable()
	}: { open: boolean; imageSrcs: string[]; target?: number } = $props()

	let api = $state<Carousel.CarouselAPI>()
	let current = $state(0)
	const count = $derived(api ? api.scrollSnapList().length : 0)

	$effect(() => {
		if (open && target) {
			api?.scrollTo(target)
		}
		if (!open) {
			target = undefined
		}
	})

	$effect(() => {
		if (api) {
			current = api.selectedScrollSnap() + 1
			api.on("select", () => {
				current = api!.selectedScrollSnap() + 1
			})
		}
	})
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowRight") {
			api?.scrollNext()
		}
		if (e.key === "ArrowLeft") {
			api?.scrollPrev()
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<Dialog.Root bind:open>
	<Dialog.Content class="flex max-h-[80vh] w-10/12 max-w-full items-center justify-center">
		<Carousel.Root setApi={(emblaApi) => (api = emblaApi)} class="max-h-[80vh] w-full">
			<Carousel.Content class="flex max-h-[75vh] items-center justify-center">
				{#each imageSrcs as src}
					<Carousel.Item class="">
						<img {src} class="max-h-full max-w-full object-contain" alt="" />
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
	</Dialog.Content>
</Dialog.Root>
