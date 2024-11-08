# Kunkun Template UI Extension

This is a template for a template UI extension. (UI follows pre-defined template)

[./src/index.ts](./src/index.ts) is the default entrypoint for the extension. You can import any other files in this file, but the build process will bundle them into a single file.

## Pros and Cons

This type of extension is suitable for simple use cases, such as a list or form. All components are pre-defined, so there is not much room for customization. If you want more flexibility on the UI, consider using [Custom UI Extension](https://docs.kunkun.sh/extensions/custom-ui-ext/), which requires some frontend knowledge but gives you full control over the UI.

Read documentation at https://docs.kunkun.sh/extensions/worker-template/

Make sure you understand what this type of extension is capable of.

### Pros

- Simple to develop, no need for any frontend knowledge.
- Small bundle size (~40KB)
  - [Custom UI Extension](https://docs.kunkun.sh/extensions/custom-ui-ext/) are usually larger than 300KB.

### Cons

- Limited UI customization. Not suitable for complex use cases.

Consider [Custom UI Extension](https://docs.kunkun.sh/extensions/custom-ui-ext/) if you need more complex UI.

## Development

```bash
pnpm install
```

Start extension in development mode. Every save will trigger a hot reload in Kunkun.

```bash
pnpm dev
```

- During development, right click in Kunkun to open the developer tools.
  - Error messages will be shown in the console.
  - If you got any permission error while calling Kunknu's APIs, make sure you've declared the permission in `package.json`. Then go back to home page and enter the extension again to re-apply the permission.
- To develop and preview the extension in Kunkun, you need to run the `Add Dev Extension` command in Kunkun, and register this extension's path.

Build the extension. Your extension source code can contain many files, but the build process will bundle them into a single file.

```bash
pnpm build
# Due to Bun's bug, if you are on windows, and install dependencies with pnpm, you may get error during build.
# Try install dependencies with bun or npm instead.
```

## i18n

[./src/i18n](./src/i18n/) contains optional internationalization support starter code.

If you want to support i18n, you can use the `t` function to translate the strings in the extension.

User's language setting is available via `app.language()`.

```ts
import { app } from "@kksh/api/ui/worker"
import { setupI18n, t } from "./src/i18n"

setupI18n("zh")
console.log(t("welcome"))

setupI18n(await app.language())
console.log(t("welcome"))
```

## Add More Commands

If you want to add more template worker extension commands, simply modify the `entrypoints` array in [./build.ts](./build.ts).

Then in `package.json`, register the new command.

## Verify Build and Publish

```bash
pnpm build # make sure the build npm script works
npx kksh@latest verify # Verify some basic settings
npx kksh@latest verify --publish # Verify some basic settings before publishing
```

It is recommended to build the extension with the same environment our CI uses.

The docker image used by our CI is `huakunshen/kunkun-ext-builder:latest`.

You can use the following command to build the extension with the same environment our CI uses.
This requires you to have docker installed, and the shell you are using has access to it via `docker` command.

```bash
npx kksh@latest build # Build the extension with
```

`pnpm` is used to install dependencies and build the extension.

The docker image environment also has `node`, `pnpm`, `npm`, `bun`, `deno` installed.
If your build failed, try debug with `huakunshen/kunkun-ext-builder:latest` image in interative mode and bind your extension volume to `/workspace`.

After build successfully, you should find a tarball file ends with `.tgz` in the root of your extension.
The tarball is packaged with `npm pack` command. You can uncompress it to see if it contains all the necessary files.

This tarball is the final product that will be published and installed in Kunkun. You can further verify your extension by installing this tarball directly in Kunkun.

After verifying the tarball, it's ready to be published.

Fork [KunkunExtensions](https://github.com/kunkunsh/KunkunExtensions) repo, add your extension to the `extensions` directory, and create a PR.

Once CI passed and PR merged, you can use your extension in Kunkun.

## Potential Error

Our CI uses `pnpm` to install dependencies. If you are on Windows, you may get error during build.

See issue https://github.com/kunkunsh/kunkun/issues/78

`bun` had problem building the extension when `pnpm` is used to install dependencies.

### Options

1. Install an older version of `bun` (1.1.27 should work)
2. Install dependencies with `bun` or `npm` instead of `pnpm`

Our CI always builds the extension with on Linux and shouldn't have this problem.
