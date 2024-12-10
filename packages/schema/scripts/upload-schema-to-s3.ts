import {
	GetObjectCommand,
	ListBucketsCommand,
	PutObjectCommand,
	S3Client
} from "@aws-sdk/client-s3"
import { ExtPackageJson } from "@kksh/api/models"
import { parse, string } from "valibot"
import * as v from "valibot"
import { getJsonSchema } from "../src"

const s3Client = new S3Client({
	endpoint: parse(string(), process.env.S3_ENDPOINT),
	region: "auto",
	credentials: {
		accessKeyId: parse(string(), process.env.S3_ACCESS_KEY_ID),
		secretAccessKey: parse(string(), process.env.S3_SECRET_ACCESS_KEY)
	}
})
/* -------------------------------------------------------------------------- */
/*                                 Get Schema                                 */
/* -------------------------------------------------------------------------- */
// const { Body } = await s3Client.send(
//   new GetObjectCommand({
//     Bucket: "jarvis-extensions",
//     Key: "schema.json",
//   }),
// );
// const data = await Body?.transformToByteArray();
// if (data) {
//     fs.writeFileSync("schema.json", data);
// }

/* -------------------------------------------------------------------------- */
/*                             Upload Schema to S3                            */
/* -------------------------------------------------------------------------- */

const schemaStr = getJsonSchema(ExtPackageJson)

await s3Client.send(
	new PutObjectCommand({
		Bucket: "jarvis-extensions",
		Key: "nightly.schema.json",
		Body: schemaStr,
		ContentType: "application/json"
	})
)

s3Client
	.send(
		new PutObjectCommand({
			Bucket: "jarvis-extensions",
			Key: "schema.json",
			Body: schemaStr,
			ContentType: "application/json"
		})
	)
	.then(() => {
		console.log("Schema uploaded to S3")
	})
	.catch((err) => {
		console.error("Failed to upload schema.json")
		console.error(err)
		process.exit(1)
	})
