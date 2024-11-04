<script lang="ts">
	import { onNavigate } from "$app/navigation"

	onNavigate((navigation) => {
		if (!document.startViewTransition) {
			console.warn("View transition not supported")
			return
		}
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
		})
	})
</script>
