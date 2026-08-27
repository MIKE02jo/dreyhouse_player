# DREYHOUSE PLAYER — Brand Assets

`logo-favicon.png` is the **real, original logo file** provided by the app
owner (uploaded directly to this repo, since inline-pasted chat images
aren't recoverable as files in this environment).

`logo-mark.svg` is the vector source of truth used throughout the app
(sidebar, splash screen, favicon, docs site) — traced from
`logo-favicon.png` with `potrace` for a pixel-accurate result, colored
`#00BF63` (the exact green sampled from the source file), background
removed. `logo-mark-1024.png` is a 1024x1024 raster render of it, used as
the `tauri icon` input. All platform icons, the favicon and the splash
screen are generated from these files.

To update the logo later: replace `logo-favicon.png` with the new source,
re-trace it (or hand-edit `logo-mark.svg` directly for small tweaks), then
run `pnpm run branding:icons` (`tauri icon branding/logo-mark-1024.png`)
to regenerate every platform icon. Nothing else in the codebase needs to
change — see `src/branding.ts` for the rest of the centralized brand
configuration (name, colors, URLs, contact).
