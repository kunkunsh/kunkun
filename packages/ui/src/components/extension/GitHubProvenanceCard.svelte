<script lang="ts">
	import Icon from "@iconify/svelte"
	import { Badge, Card } from "@kksh/svelte5"
	import { BadgeCheckIcon } from "lucide-svelte"

	let {
		commitSha,
		rekorLogId,
		githubRepoOwner,
		githubRepoName
	}: { commitSha: string; rekorLogId: string; githubRepoOwner: string; githubRepoName: string } =
		$props()

	const sourceCommitUrl = `https://github.com/${githubRepoOwner}/${githubRepoName}/commit/${commitSha}`
</script>

<Card.Root>
	<Card.Content class="flex items-center space-x-4">
		<div class="flex items-center space-x-4">
			<BadgeCheckIcon class="h-10 w-10 text-green-500" />
			<div>
				<span class="text-gray-200">Built and signed on</span>
				<h1 class="text-2xl font-bold">GitHub Actions</h1>
				<a href="asd" class="underline">View build summary</a>
			</div>
		</div>

		<div>
			<a href={`https://github.com/${githubRepoOwner}/${githubRepoName}/tree/${commitSha}`} target="_blank">
				<Badge class="h-8 space-x-2">
					<Icon class="h-6 w-6" icon="mdi:github" />
					<span>{githubRepoOwner}/{githubRepoName}</span>
				</Badge>
			</a>
			<p>
				<strong>Source Commit</strong>
				<a href={sourceCommitUrl} target="_blank" rel="noreferrer" class="font-mono underline">
					{commitSha.slice(0, 8)}
				</a>
			</p>
			<p>
				<strong>Public Ledger</strong>
				<a
					href={`https://search.sigstore.dev/?logIndex=${rekorLogId}`}
					target="_blank"
					rel="noreferrer"
					class="underline">Transparentcy log entry</a
				>
			</p>
		</div>
	</Card.Content>
</Card.Root>
