"use client"

import { ui } from "@kksh/api/ui/iframe"
import { Button } from "@kksh/react"
import { useEffect } from "react"

export default function Home() {
	useEffect(() => {
		ui.showBackButton("bottom-right")
	}, [])
	return (
		<div>
			<h1 className="text-xl font-bold">Home Page</h1>
			<Button>Button</Button>
		</div>
	)
}
