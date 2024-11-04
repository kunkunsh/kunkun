import { extensions } from "@/stores"
import { supabaseAPI } from "@/supabase"
import { isCompatible } from "@kksh/api"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import { greaterThan } from "@std/semver"
import { relaunch } from "@tauri-apps/plugin-process"
import { check } from "@tauri-apps/plugin-updater"
import { gt } from "semver"
import { toast } from "svelte-sonner"
import { get } from "svelte/store"

export async function checkUpdateAndInstall({ beta }: { beta?: boolean } = {}) {
	const update = await check({
		headers: {
			"kk-updater-mode": beta ? "beta" : "stable"
		}
	})
	if (update?.available) {
		const confirmUpdate = await confirm(
			`A new version ${update.version} is available. Do you want to install and relaunch?`
		)
		if (confirmUpdate) {
			await update.downloadAndInstall()
			await relaunch()
		}
	} else {
		toast.info("You are on the latest version")
	}
}

export async function checkSingleExtensionUpdate(
	installedExt: ExtPackageJsonExtra,
	autoupgrade: boolean
) {
	const { data: sbExt, error } = await supabaseAPI.getLatestExtPublish(
		installedExt.kunkun.identifier
	)
	if (error) {
		return toast.error(`Failed to check update for ${installedExt.kunkun.identifier}: ${error}`)
	}

	if (!sbExt) {
		return null
	}

	if (
		gt(sbExt.version, installedExt.version) &&
		(sbExt.api_version ? isCompatible(sbExt.api_version) : true)
	) {
		if (autoupgrade) {
			await extensions
				.upgradeStoreExtension(
					sbExt.identifier,
					supabaseAPI.translateExtensionFilePathToUrl(sbExt.tarball_path)
				)
				.then(() => {
					toast.success(`${sbExt.name} upgraded`, {
						description: `From ${installedExt.version} to ${sbExt.version}`
					})
				})
				.catch((err) => {
					toast.error(`Failed to upgrade ${sbExt.name}`, { description: err })
				})
			return true
		} else {
			console.log(`new version available ${installedExt.kunkun.identifier} ${sbExt.version}`)
			toast.info(
				`Extension ${installedExt.kunkun.identifier} has a new version ${sbExt.version}, you can upgrade in Store.`,
				{ duration: 10_000 }
			)
		}
	}
	return false
}

export async function checkExtensionUpdate(autoupgrade: boolean = false) {
	let upgradedCount = 0
	for (const ext of get(extensions)) {
		const upgraded = await checkSingleExtensionUpdate(ext, autoupgrade)
		if (upgraded) {
			upgradedCount++
		}
	}

	if (upgradedCount > 0) {
		toast.info(`${upgradedCount} extensions have been upgraded`)
	}
}
