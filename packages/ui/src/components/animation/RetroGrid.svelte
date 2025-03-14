<script lang="ts">
	import { cn } from "../../utils"

	let { class: className }: { class?: string } = $props()
</script>

<div
	class={cn(
		"pointer-events-none absolute h-full w-full overflow-hidden opacity-50 [perspective:200px]",
		className
	)}
>
	<!-- Grid  -->
	<div class="absolute inset-0 [transform:rotateX(35deg)]">
		<div
			class={cn(
				"animate-grid",

				"[background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]",

				// Light Styles
				"[background-image:linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_0)]",

				// Dark styles
				"dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)]"
			)}
		></div>
	</div>

	<!-- Background Gradient -->
	<div
		class={cn(
			"dark:from-background absolute inset-0 bg-gradient-to-t from-white to-transparent to-90%"
		)}
	></div>
</div>
