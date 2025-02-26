#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Test Script cmd
// @raycast.mode compact

// Optional parameters:
// @raycast.icon 🤖
// @raycast.argument1 { "type": "text", "placeholder": "Placeholder" }
// @raycast.packageName hahaha
// @raycast.needsConfirmation true

// Documentation:
// @raycast.description describe
// @raycast.author huakunshen
// @raycast.authorURL https://raycast.com/huakunshen

console.log("Hello World! Argument1 value: " + process.argv.slice(2)[0])

