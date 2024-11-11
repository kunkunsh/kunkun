<script lang="ts">
	import { Button } from "@kksh/svelte5"
	import { type Snippet } from "svelte"
</script>

<main class="container flex flex-col space-y-2">
	<div>
		<h3 class="text-mg mb-2 ml-3 font-bold">App Updates</h3>
		<ul class="rounded-lg border">
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
		</ul>
	</div>
	<div>
		<h3 class="text-mg mb-2 ml-3 font-bold">App Updates</h3>
		<ul class="rounded-lg border">
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
		</ul>
	</div>
	<div>
		<h3 class="text-mg mb-2 ml-3 font-bold">App Updates</h3>
		<ul class="rounded-lg border">
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
		</ul>
	</div>
	<div>
		<h3 class="text-mg mb-2 ml-3 font-bold">App Updates</h3>
		<ul class="rounded-lg border">
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
			<li>
				<span>Start Up</span>
				<Button variant="outline">Edit</Button>
			</li>
		</ul>
	</div>
</main>

<style scoped>
	li {
		@apply bg-primary-foreground flex items-center justify-between border-b px-3 py-2;
	}
	ul li:last-child {
		@apply border-b-0;
	}
</style>
