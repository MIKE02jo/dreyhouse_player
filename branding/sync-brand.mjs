#!/usr/bin/env node
// Pushes branding/brand.json into the platform config files that can't
// import JSON directly (package.json, Tauri's tauri.conf.json). Run this
// after editing branding/brand.json instead of hand-editing those files.
//
//   pnpm run branding:sync
//
// Files intentionally NOT touched here (see branding/README.md):
//  - src-tauri/Cargo.toml: the Rust crate name ("app"/"app_lib") is an
//    internal technical identifier, not brand-facing - left alone.
//  - src-tauri/gen/android, src-tauri/icons/**, public/favicon*: generated
//    from the app identifier / logo by `pnpm tauri android init` and
//    `pnpm tauri icon branding/logo-mark-1024.png` respectively, not by
//    this script.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.resolve(fileURLToPath(import.meta.url), "../..")
const brand = JSON.parse(readFileSync(path.join(root, "branding/brand.json"), "utf8"))

function readJson(relPath) {
  return JSON.parse(readFileSync(path.join(root, relPath), "utf8"))
}
function writeJson(relPath, data) {
  writeFileSync(path.join(root, relPath), `${JSON.stringify(data, null, 2)}\n`)
  console.log(`updated ${relPath}`)
}

// package.json
{
  const pkg = readJson("package.json")
  pkg.name = brand.id.npmName
  pkg.version = brand.version
  writeJson("package.json", pkg)
}

// src-tauri/tauri.conf.json
{
  const conf = readJson("src-tauri/tauri.conf.json")
  conf.productName = brand.name
  conf.mainBinaryName = brand.id.mainBinaryName
  conf.version = brand.version
  conf.identifier = brand.id.reverseDomain
  if (conf.app?.windows?.[0]) {
    conf.app.windows[0].title = brand.name
  }
  if (conf.bundle) {
    conf.bundle.publisher = brand.publisher
    conf.bundle.copyright = brand.copyright
  }
  if (conf.plugins?.updater) {
    conf.plugins.updater.endpoints = [brand.urls.updaterFeed]
  }
  writeJson("src-tauri/tauri.conf.json", conf)
}

console.log(`\nDone. Brand: "${brand.name}" (${brand.id.reverseDomain})`)
console.log(
  "Reminder: Cargo.toml crate name, Android package (src-tauri/gen/android) and generated icons are not touched by this script."
)
