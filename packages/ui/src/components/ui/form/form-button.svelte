<script lang="ts">
	import { ButtonModule } from "@kksh/svelte5"

	let { ref = $bindable(null), ...restProps }: ButtonModule.Props = $props()
</script>

<ButtonModule.Root type="submit" bind:ref {...restProps} />
