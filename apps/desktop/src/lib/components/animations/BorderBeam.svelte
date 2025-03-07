<script lang="ts">
	import { cn } from "$lib/utils"

	let {
		class: className,
		size = 200,
		duration = 15,
		anchor = 90,
		borderWidth = 1.5,
		colorFrom = "#ffaa40",
		colorTo = "#9c40ff",
		delay = 0
	}: {
		class?: string
		size?: number
		duration?: number
		anchor?: number
		borderWidth?: number
		colorFrom?: string
		colorTo?: string
		delay?: number
	} = $props()
	let delaySec = delay + "s"
</script>

<div
	style:--border-width={borderWidth}
	style:--size={size}
	style:--color-from={colorFrom}
	style:--color-to={colorTo}
	style:--delay={delaySec}
	style:--anchor={anchor}
	style:--duration={duration}
	class={cn(
		"pointer-events-none absolute inset-[0] rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",

		// mask styles
		"![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",

		// pseudo styles
		"after:animate-border-beam after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
		className
	)}
></div>
