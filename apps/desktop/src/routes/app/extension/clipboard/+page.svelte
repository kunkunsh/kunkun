<script lang="ts">
	import { goBack, goHome } from "@/utils/route"
	import { listenToNewClipboardItem } from "@/utils/tauri-events"
	import Icon from "@iconify/svelte"
	import { ClipboardContentType, db } from "@kksh/api/commands"
	import { SearchModeEnum, SQLSortOrderEnum, type ExtData } from "@kksh/api/models"
	import { Button, Command, Resizable } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { CustomCommandInput, GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import { app } from "@tauri-apps/api"
	import type { UnlistenFn } from "@tauri-apps/api/event"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { platform } from "@tauri-apps/plugin-os"
	import { ArrowLeft, FileQuestionIcon, ImageIcon, LetterTextIcon } from "lucide-svelte"
	import { onDestroy, onMount, type Snippet } from "svelte"
	import { toast } from "svelte-sonner"
	import clipboard from "tauri-plugin-clipboard-api"
	import * as userInput from "tauri-plugin-user-input-api"
	import ContentPreview from "./content-preview.svelte"

	const _platform = platform()
	const curWin = getCurrentWebviewWindow()
	let searchTerm = $state("")
	let clipboardHistoryList = $state<ExtData[]>([])
	let highlightedItemValue = $state<string>("")
	let highlighted = $state<ExtData | null>(null)
	let unlistenClipboard = $state<UnlistenFn | null>(null)
	let isScrolling = $state(false)
	let page = $state(1)

	let clipboardHistoryMap = $derived(
		clipboardHistoryList.reduce(
			(acc, item) => {
				acc[item.dataId] = item
				return acc
			},
			{} as Record<string, ExtData>
		)
	)

	let clipboardHistoryIds = $derived(clipboardHistoryList.map((item) => item.dataId))
	let clipboardHistoryIdsSet = $derived(new Set(clipboardHistoryIds))

	async function initClipboardHistory() {
		const result = await db.searchExtensionData({
			extId: 1,
			searchMode: SearchModeEnum.FTS,
			limit: 50,
			offset: (page - 1) * 50,
			fields: ["search_text"],
			orderByCreatedAt: SQLSortOrderEnum.Desc
		})
		if (page === 1) {
			// clear clipboardHistoryList when page is 1, because it's simply loading the first page, using previous search result will result in duplicate key error
			clipboardHistoryList = result
		} else {
			clipboardHistoryList = [...result, ...clipboardHistoryList]
		}
	}

	onMount(async () => {
		listenToNewClipboardItem(async (evt) => {
			const result = await db.searchExtensionData({
				extId: 1,
				searchMode: SearchModeEnum.FTS,
				limit: 1,
				fields: ["search_text"],
				orderByCreatedAt: SQLSortOrderEnum.Desc
			})
			if (result.length > 0) {
				clipboardHistoryList = [result[0], ...clipboardHistoryList]
			}
		}).then((unlisten) => {
			unlistenClipboard = unlisten
		})
	})

	onDestroy(() => {
		unlistenClipboard?.()
	})

	$effect(() => {
		// search sqlite when searchTerm changes
		void searchTerm
		;(async () => {
			// console.log("searchTerm", searchTerm)
			if (searchTerm === "") {
				page = 1
				initClipboardHistory()
				return
			}
			const ftsResult = await db.searchExtensionData({
				extId: 1,
				searchMode: SearchModeEnum.FTS,
				searchText: `${searchTerm}*`,
				fields: ["search_text"],
				orderByCreatedAt: SQLSortOrderEnum.Desc
			})
			const likeResult = await db.searchExtensionData({
				extId: 1,
				searchMode: SearchModeEnum.Like,
				searchText: `%${searchTerm}%`,
				fields: ["search_text"],
				orderByCreatedAt: SQLSortOrderEnum.Desc
			})
			// merge ftsResult and likeResult, remove duplicate items
			const result = [...ftsResult, ...likeResult]
			// sort result by createdAt
			result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			// remove duplicate items from result list by dataId
			const uniqueResult = result.filter(
				(item, index, self) => index === self.findIndex((t) => t.dataId === item.dataId)
			)
			clipboardHistoryList = uniqueResult
			if (uniqueResult.length > 0) {
				highlightedItemValue = uniqueResult[0].dataId.toString()
			}
		})()
	})

	$effect(() => {
		if (!highlightedItemValue) {
			return
		}
		try {
			const dataId = parseInt(highlightedItemValue)
			highlighted = clipboardHistoryMap[dataId]
		} catch (error) {
			console.error(error)
		}
	})

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			const inputEle = event.target as HTMLInputElement
			if (inputEle.value === "") {
				goHome()
			}
			inputEle.value = ""
			searchTerm = ""
		}
	}

	async function onListScrolledToBottom() {
		page++
		await initClipboardHistory()
	}

	/**
	 * Handle scroll-to-bottom event
	 * @param e
	 */
	function onScroll(e: Event) {
		const element = e.target as HTMLElement
		if (!isScrolling && element?.scrollHeight - element?.scrollTop === element?.clientHeight) {
			isScrolling = true
			onListScrolledToBottom?.()
			setTimeout(() => {
				isScrolling = false
			}, 500)
		}
	}

	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

	async function paste() {
		await userInput.key("KeyPress", "MetaLeft")
		await sleep(20)
		await userInput.key("KeyPress", "KeyV")
		await sleep(100)
		await userInput.key("KeyRelease", "MetaLeft")
		await sleep(20)
		await userInput.key("KeyRelease", "KeyV")
	}

	function writeToClipboard(data: ExtData) {
		if (!data.data) {
			toast.warning("No data found")
			return Promise.reject(new Error("No data found"))
		}
		const dataType = data?.dataType as ClipboardContentType
		switch (dataType) {
			case "Text":
				return clipboard.writeText(data.data)
			case "Image":
				return clipboard.writeImageBase64(data.data)
			case "Html":
				return clipboard.writeHtmlAndText(data.data, data.searchText ?? data.data)
			case "Rtf":
				return clipboard.writeRtf(data.data)
			default:
				return Promise.reject(new Error("Unsupported data type: " + dataType))
		}
	}

	function onItemSelected(dataId: number) {
		db.getExtensionDataById(dataId)
			.then((data) => {
				console.log("data", data)
				if (!data) {
					toast.warning("No data found")
					return Promise.reject(new Error("No data found"))
				}
				return writeToClipboard(data).then(async () => {
					if (_platform === "macos") {
						// TODO: add support for Windows and Linux
						return app
							.hide()
							.then(() => sleep(100))
							.then(() => curWin.hide())
							.then(() => paste())
					}
				})
			})
			.then(() => toast.success("Copied to clipboard"))
			.catch((err) => {
				console.error(err)
				toast.error("Failed to fetch data from db", {
					description: err.message
				})
			})
	}
</script>

{#snippet leftSlot()}
	<Button
		variant="outline"
		size="icon"
		onclick={goHome}
		class={Constants.CLASSNAMES.BACK_BUTTON}
		data-flip-id={Constants.CLASSNAMES.BACK_BUTTON}
	>
		<ArrowLeft class="size-4" />
	</Button>
{/snippet}
{#snippet typeIcon(type: string)}
	{#if type === "Text"}
		<LetterTextIcon />
	{:else if type === "Html"}
		<Icon icon="skill-icons:html" />
	{:else if type === "Image"}
		<ImageIcon />
	{:else}
		<FileQuestionIcon />
	{/if}
{/snippet}

<Command.Root
	class="h-screen rounded-lg border shadow-md"
	loop
	bind:value={highlightedItemValue}
	shouldFilter={false}
>
	<CustomCommandInput
		onkeydown={onKeyDown}
		autofocus
		placeholder="Type a command or search..."
		leftSlot={leftSlot as Snippet}
		bind:value={searchTerm}
	/>
	<Resizable.PaneGroup direction="horizontal" class="w-full rounded-lg">
		<Resizable.Pane defaultSize={30} class="">
			<Command.List class="h-full max-h-full grow" onscroll={onScroll}>
				<Command.Empty>No results found.</Command.Empty>
				{#each clipboardHistoryIds as dataId (dataId)}
					<Command.Item value={dataId.toString()} onSelect={() => onItemSelected(dataId)}>
						{@render typeIcon(clipboardHistoryMap[dataId].dataType)}
						<span class="truncate">{clipboardHistoryMap[dataId].searchText}</span>
					</Command.Item>
				{/each}
			</Command.List>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={50}>
			{#if highlighted}
				<ContentPreview {highlighted} />
			{:else}
				<div class="text-center">No content preview available</div>
			{/if}
		</Resizable.Pane>
	</Resizable.PaneGroup>
	<GlobalCommandPaletteFooter />
</Command.Root>
