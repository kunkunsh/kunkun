import { getExtensionsLatestPublishByIdentifier } from "@kksh/sdk"

const latestPublish = await getExtensionsLatestPublishByIdentifier({
	path: {
		identifier: "RAG1"
	}
})
console.log(latestPublish)
