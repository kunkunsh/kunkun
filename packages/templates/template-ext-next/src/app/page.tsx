// dev url: http://localhost:5173/dev-extensions/template-ext-next/out
"use client"

import dynamic from "next/dynamic"

const Main = dynamic(() => import("@/components/main"), {
	ssr: false
})
export default function Home() {
	return <Main />
}
