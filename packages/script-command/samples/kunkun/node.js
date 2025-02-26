#!/usr/bin/env node

// Required parameters:
// @kunkun.schemaVersion 1
// @kunkun.title Test Script cmd
// @kunkun.mode compact

// Optional parameters:
// @kunkun.icon 🤖
// @kunkun.argument1 { "type": "text", "placeholder": "Placeholder" }
// @kunkun.packageName hahaha
// @kunkun.needsConfirmation true

// Documentation:
// @kunkun.description describe
// @kunkun.author huakunshen
// @kunkun.authorURL https://raycast.com/huakunshen

console.log("Hello World! Argument1 value: " + process.argv.slice(2)[0])

