# Kunkun Custom UI Extension Template (Vue)

[Custom UI Extension Documentation](https://docs.kunkun.sh/extensions/custom-ui-ext/)

This is a template for a custom UI extension.

This type of extension is basically a static website. You can use any frontend framework you like, this template uses [Vue](https://vuejs.org/).

It is assumed that you have some knowledge of frontend development with Vue.

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

### Multi-Command

To support multiple commands, you will need multiple `.html` files as entrypoints, and register each command in `package.json`.
It is recommended to use a meta-framework and build with SSG rendering mode, which comes with routing and will output multiple `.html` files.
Kunkun provides meta-framework templates for Nuxt, Next, SvelteKit.

## Verify Build and Publish

```bash
npx kksh@latest verify --publish # run basic verification
```

See [Documentation](https://docs.kunkun.sh/guides/extensions/publish/design/) for more details on how to publish your extension. You will need to publish your extension package to npm or jsr first with GitHub actioin, then register it on Kunkun's website.
