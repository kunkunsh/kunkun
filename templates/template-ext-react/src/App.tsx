import { ui } from "@kksh/api/ui/iframe"
import {
	ActionPanel,
	Button,
	Command,
	CommandDemo,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
	ThemeCustomizer,
	ThemeProvider,
	ThemeWrapper,
	TooltipProvider,
	VertifcalSeparator
} from "@kksh/react"
import {
	CalendarIcon,
	EnvelopeClosedIcon,
	FaceIcon,
	GearIcon,
	InstagramLogoIcon,
	LinkedInLogoIcon,
	PersonIcon,
	RocketIcon,
	TwitterLogoIcon
} from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"

function App() {
	const [value, setValue] = useState("linear")
	const actionInputRef = useRef<HTMLInputElement | null>(null)
	const [input, setInput] = useState("")
	const listRef = useRef(null)
	const seachInputEle = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		ui.registerDragRegion()
		ui.showMoveButton({
			// top: 10,
			// right: 20
			bottom: 0.2,
			left: 0.2
		})
	}, [])

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Escape") {
			if (input.length === 0) {
				ui.goBack()
			} else {
				setInput("")
			}
		}
	}

	return (
		<ThemeProvider>
			<main className="h-screen">
				<Command
					onValueChange={(v) => {
						setValue(v)
					}}
				>
					<CommandInput
						autoFocus
						ref={seachInputEle}
						placeholder="Type a command or search..."
						className="h-12"
						onInput={(e) => {
							setInput((e.target as HTMLInputElement).value)
						}}
						value={input}
						onKeyDown={onKeyDown}
					>
						<div className="h-8 w-8"></div>
					</CommandInput>
					<CommandList className="h-full">
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading="Suggestions">
							<CommandItem>
								<TwitterLogoIcon className="mr-2 h-4 w-4" />
								<span>Twitter</span>
							</CommandItem>
							<CommandItem>
								<InstagramLogoIcon className="mr-2 h-4 w-4" />
								<span>Instagram</span>
							</CommandItem>
							<CommandItem>
								<LinkedInLogoIcon className="mr-2 h-4 w-4" />
								<span>LinkedIn</span>
							</CommandItem>
							<CommandItem>
								<CalendarIcon className="mr-2 h-4 w-4" />
								<span>Calendar</span>
							</CommandItem>
							<CommandItem>
								<FaceIcon className="mr-2 h-4 w-4" />
								<span>Search Emoji</span>
							</CommandItem>
							<CommandItem>
								<RocketIcon className="mr-2 h-4 w-4" />
								<span>Launch</span>
							</CommandItem>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="Settings">
							<CommandItem>
								<PersonIcon className="mr-2 h-4 w-4" />
								<span>Profile</span>
								<CommandShortcut>⌘P</CommandShortcut>
							</CommandItem>
							<CommandItem>
								<EnvelopeClosedIcon className="mr-2 h-4 w-4" />
								<span>Mail</span>
								<CommandShortcut>⌘B</CommandShortcut>
							</CommandItem>
							<CommandItem>
								<GearIcon className="mr-2 h-4 w-4" />
								<span>Settings</span>
								<CommandShortcut>⌘S</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</CommandList>
					<CommandFooter className="kunkun-drag-region">
						<GearIcon className="ml-2 h-4 w-4" />
						<div className="flex items-center space-x-2">
							<Button variant="ghost" size="sm">
								Open Application
								<kbd className="ml-1">↵</kbd>
							</Button>
							<VertifcalSeparator />
							<ActionPanel
								listRef={listRef}
								selectedValue={value}
								inputRef={actionInputRef}
								actionItems={[
									{ label: "Open Application", value: "open" },
									{ label: "Show in Finder", value: "finder" },
									{ label: "Show Info in Finder", value: "info" },
									{ label: "Add to Favorites", value: "favorites" }
								]}
							></ActionPanel>
						</div>
					</CommandFooter>
				</Command>
			</main>
		</ThemeProvider>
	)
}

export default App
