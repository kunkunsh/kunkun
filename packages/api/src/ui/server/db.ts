/**
 * The server-side API for the database will not be implemented in this file/package
 * It will be constructed with JarvisExtDB in the main thread and exposed to the extension
 * We don't know extension ID here, so we can't construct the API here
 */
import type { JarvisExtDB } from "../../commands"
import type { IDb, IFs, ISystem, IToast, IUiIframe, IUiWorker } from "../client"

// export function constructJarvisExtDBToServerDbAPI(db: JarvisExtDB): IDb {
// 	return {
// 		add: (data) => db.add(data),
// 		delete: (dataId) => db.delete(dataId),
// 		search: (searchParams) => db.search(searchParams),
// 		retrieveAll: (options) => db.retrieveAll(options),
// 		retrieveAllByType: (dataType) => db.retrieveAllByType(dataType),
// 		deleteAll: () => db.deleteAll(),
// 		update: (data) => db.update(data)
// 	}
// }
