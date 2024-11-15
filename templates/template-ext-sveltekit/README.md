# Kunkun Custom UI Extension Template (SvelteKit)

[Custom UI Extension Documentation](https://docs.kunkun.sh/extensions/custom-ui-ext/)

This is a template for a custom UI extension.

This type of extension is basically a static website. You can use any frontend framework you like, this template uses [SvelteKit](https://svelte.dev/).

It is assumed that you have some knowledge of frontend development with SvelteKit.

## Development

Development is the same as developing a normal website.

```bash
pnpm install
pnpm dev
pnpm build
```

- To develop and preview the extension in Kunkun, you need to run the `Add Dev Extension` command in Kunkun, and register this extension's path.

In `package.json`, `"devMain"` is the url for development server, and `"main"` is the path to static `.html` file for production.

To load the extension in development mode, you have to enable it with `Toggle Dev Extension Live Load Mode` command in Kunkun. A `Live` badge will be shown on the commands. This indicates that dev extensions will be loaded from `devMain` instead of `main`.

## Advanced

### Rendering Mode

This is a Meta-Framework template, and already configured with SSG rendering mode.
Please do not enable SSR unless you know what you are doing.
There will not be a JS runtime in production, and Kunkun always load the extension as static files.

The main benefit of using a meta-framework is that it comes with routing, and will output multiple `.html` files, which makes multi-command support much easier.

## Verify Build and Publish

```bash
pnpm build # make sure the build npm script works
npx kksh@latest verify # Verify some basic settings before publishing
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
