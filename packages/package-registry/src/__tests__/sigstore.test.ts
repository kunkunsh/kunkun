import { describe, expect, test } from "bun:test"
import * as v from "valibot"
import { RawRekorLog } from "../models"
import {
	getInfoFromRekorLog,
	getRekorLogId,
	parseAttestation,
	parseTheOnlyRecord
} from "../sigstore"

describe("sigstore", async () => {
	const log = await getRekorLogId("162240358")
	const parsed = v.safeParse(RawRekorLog, log)

	test("get rekor log", async () => {
		expect(parsed.success).toBe(true)
	})

	test("parse attestation", async () => {
		if (parsed.success) {
			const parsed2 = parseTheOnlyRecord(parsed.output)
			const attestation = parseAttestation(parsed2)
			expect(attestation).toBeDefined()
		}
	})

	test("parse all commits from rekor log", async () => {
		const git = await getInfoFromRekorLog("162240358")
		expect(git).toBeDefined()
		expect(git.commit).toBe("48b7dff528bc6a175ce9ee99e6d8de0c718e70a0")
		expect(git.githubActionInvocationId).toBe("https://github.com/kunkunsh/kunkun-ext-image-processing/actions/runs/12763976478/attempts/1")
	})
})
