import { getExtensionsLatestPublishByIdentifier } from "@kksh/sdk"
import { IconType } from "@kksh/api/models"

const latestPublish = await getExtensionsLatestPublishByIdentifier({
	path: {
		identifier: "RAG1"
	}
})
console.log(latestPublish)
// latestPublish

// console.log(typeof IconEnum.Iconify)
console.log(IconType.options)