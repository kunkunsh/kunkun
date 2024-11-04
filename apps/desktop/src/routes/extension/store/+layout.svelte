<script lang="ts">
	import { Constants } from "@kksh/ui"
	import { afterNavigate, beforeNavigate } from "$app/navigation"
	import { gsap } from "gsap"
	import { Flip } from "gsap/Flip"

	gsap.registerPlugin(Flip)
	let flipState: Flip.FlipState

	beforeNavigate(() => {
		flipState = Flip.getState(`.${Constants.CLASSNAMES.EXT_LOGO}`)
	})

	afterNavigate(() => {
		if (!flipState) {
			return
		}

		Flip.from(flipState, {
			targets: ".kk-ext-logo",
			duration: 0.5,
			absolute: true,
			scale: true,
			ease: "ease-out"
		})
	})

	const { children } = $props()
</script>

{@render children?.()}
