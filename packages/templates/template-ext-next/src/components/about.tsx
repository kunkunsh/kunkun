"use client"

import { ui } from "@kksh/api/ui/iframe"
import { useEffect } from "react"

export default function About() {
	useEffect(() => {
		ui.showBackButton("bottom-right")
	}, [])
	return (
		<div>
			<h1 className="text-xl font-bold">About Page</h1>
			<a href="./">Go To Home Page</a>
		</div>
	)
}
