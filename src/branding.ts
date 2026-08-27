// Centralized brand configuration for DREYHOUSE PLAYER.
//
// Single source of truth: ../branding/brand.json. Change the app's name,
// colors, URLs, or contact info there (and swap ../branding/logo-mark.svg
// for the artwork) - everything that imports this module picks it up
// automatically. Platform config that JSON/TS can't reach directly
// (tauri.conf.json, package.json, Cargo.toml, Android/iOS manifests) is
// kept in sync by `pnpm run branding:sync` (see branding/sync-brand.mjs),
// which reads the same brand.json.
import brand from "../branding/brand.json" with { type: "json" }

export const BRAND = brand

export const brandName = brand.name
export const brandShortName = brand.shortName
export const brandColors = brand.colors
export const brandUrls = brand.urls
