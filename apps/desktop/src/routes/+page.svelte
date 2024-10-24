<script lang="ts">
	import { Alert, Avatar, Button } from "@kksh/svelte5"
</script>

<Button>Click me</Button>
<button class="bg-red-500">hi</button>
<Alert.Root>
	<Alert.Title>Heads up!</Alert.Title>
	<Alert.Description>You can add components to your app using the cli.</Alert.Description>
</Alert.Root>
<Avatar.Root>
	<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
	<Avatar.Fallback>CN</Avatar.Fallback>
</Avatar.Root>
