<script lang="ts">
	import { Card } from "@kksh/svelte5"
	import { BadgeCheckIcon } from "lucide-svelte"

	let {
		repoOwner,
		repoName,
		githubActionInvocationId,
		commit,
		rekorLogIndex,
		workflowPath
	}: {
		repoOwner: string
		repoName: string
		githubActionInvocationId: string
		commit: string
		rekorLogIndex: string
		workflowPath: string
	} = $props()
	const workflowRunId = githubActionInvocationId.split("/").at(-3)
	const workflowRunUrl = `https://github.com/${repoOwner}/${repoName}/actions/runs/${workflowRunId}/workflow`
</script>

<Card.Root>
	<Card.Content class="flex flex-col items-center justify-between space-x-4 md:flex-row">
		<div class="flex w-60 items-center space-x-4">
			<BadgeCheckIcon class="h-8 w-8 text-green-500" />
			<div>
				<span class="text-sm text-gray-200">Built and signed on</span>
				<h1 class="text-xl font-bold">GitHub Actions</h1>
				<a href={githubActionInvocationId} class="text-sm underline" target="_blank">
					View build summary
				</a>
			</div>
		</div>
		<div>
			<p class="flex flex-col text-sm sm:flex-row">
				<strong class="mt-2 inline-block w-28 md:mt-0">Source Commit</strong>
				<a
					href={`https://github.com/${repoOwner}/${repoName}/tree/${commit}`}
					target="_blank"
					rel="noreferrer"
					class="font-mono underline"
				>
					github.com/{repoOwner}/{repoName}/{commit.slice(0, 8)}
				</a>
			</p>
			<p class="flex flex-col text-sm sm:flex-row">
				<strong class="mt-2 inline-block w-28 md:mt-0">Build File</strong>
				<a href={workflowRunUrl} target="_blank" rel="noreferrer" class="font-mono underline">
					{workflowPath}
				</a>
			</p>
			<p class="flex flex-col text-sm sm:flex-row">
				<strong class="mt-2 inline-block w-28 md:mt-0">Public Ledger</strong>
				<a
					href={`https://search.sigstore.dev/?logIndex=${rekorLogIndex}`}
					target="_blank"
					rel="noreferrer"
					class="underline">Transparentcy log entry</a
				>
			</p>
		</div>
	</Card.Content>
</Card.Root>
