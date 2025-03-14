#!/usr/bin/env bun

import { Glob, $ } from "bun"
import pkg from "../package.json" assert { type: "json" }

await $`rm -rf dist`
const files = new Glob("./src/**/*.{ts,tsx}").scan()
for await (const file of files) {
  await Bun.build({
    format: "esm",
    outdir: "dist/esm",
    external: [
      ...Object.keys(pkg.dependencies).filter(
        (key) => key !== "opencontrol-frontend",
      ),
    ],
    root: "src",
    entrypoints: [file],
  })
}
await $`tsc --outDir dist/types --declaration --emitDeclarationOnly --declarationMap`
