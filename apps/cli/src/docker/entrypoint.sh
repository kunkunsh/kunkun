#!/bin/bash
cd /workspace # source code will be mounted to /workspace
echo $PWD
source ~/.bashrc
bun --version
rm *.tgz
rm -rf node_modules
cp -r /workspace /workspace-copy
cd /workspace-copy

# Detect package manager based on lock files
if [ -f "bun.lockb" ]; then
    echo "Using bun package manager"
    bun install
    echo $?
    bun run build
elif [ -f "pnpm-lock.yaml" ]; then
    echo "Using pnpm package manager"
    corepack enable pnpm
    pnpm install
    echo $?
    ls node_modules
    pnpm build
elif [ -f "package-lock.json" ]; then
    echo "Using npm package manager"
    npm install
    echo $?
    npm run build
else
    corepack enable pnpm
    echo "No lock file found, defaulting to pnpm"
    pnpm install
    echo $?
    pnpm build
fi
echo $?
npx kksh@latest verify --publish
# if previous exit code is not 0, then exit with error
if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi
npm pack
# check number of *.tgz file in current directory
# if more than 1, then exit with error
if [ $(ls -1 *.tgz 2>/dev/null | wc -l) -gt 1 ]; then
    echo "More than one tgz file found"
    exit 1
fi
cp *.tgz /workspace
