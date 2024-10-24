To extend the `base.json` config, use relative path

```json
"extends": "@kksh/typescript-config/base.json" // no
"extends": "../typescript-config/base.json" // yes
```

Because the path alias is resolved relative to the file that extends the config.
If you install `"@kksh/typescript-config": "workspace:*"` in the `package.json`,
`@kksh/typescript-config` actually points to `node_modules/packages/typescript-config`,
and the path alias cannot be correctly resolved. (will need to add another `../`).

```json
"paths": {
    "@kksh/ui/*": ["../../packages/ui/*"]
}
```

needs to become

```json
"paths": {
    "@kksh/ui/*": ["../../../packages/ui/*"]
}
```

to "escape" from `node_modules`.

So I'd rather use relative path to extend the config.
