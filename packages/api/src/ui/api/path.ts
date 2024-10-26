import type { Remote } from "@huakunshen/comlink"
import { BaseDirectory } from "@tauri-apps/api/path"
import type { IPath } from "../client"

export function constructPathAPI(api: Remote<IPath>): IPath {
	return {
		BaseDirectory: BaseDirectory,
		appCacheDir: api.appCacheDir,
		appConfigDir: api.appConfigDir,
		appDataDir: api.appDataDir,
		appLocalDataDir: api.appLocalDataDir,
		appLogDir: api.appLogDir,
		audioDir: api.audioDir,
		basename: api.basename,
		cacheDir: api.cacheDir,
		configDir: api.configDir,
		dataDir: api.dataDir,
		delimiter: api.delimiter,
		desktopDir: api.desktopDir,
		dirname: api.dirname,
		documentDir: api.documentDir,
		downloadDir: api.downloadDir,
		executableDir: api.executableDir,
		extname: api.extname,
		fontDir: api.fontDir,
		homeDir: api.homeDir,
		isAbsolute: api.isAbsolute,
		join: api.join,
		localDataDir: api.localDataDir,
		normalize: api.normalize,
		pictureDir: api.pictureDir,
		publicDir: api.publicDir,
		resolve: api.resolve,
		resolveResource: api.resolveResource,
		resourceDir: api.resourceDir,
		runtimeDir: api.runtimeDir,
		sep: api.sep,
		tempDir: api.tempDir,
		templateDir: api.templateDir,
		videoDir: api.videoDir,
		/* --------------------------- Custom Directories --------------------------- */
		extensionDir: api.extensionDir,
		extensionSupportDir: api.extensionSupportDir
	}
}
