# DREYHOUSE PLAYER — Brand Assets

`logo-mark.svg` is the single source of truth for the app's logo/icon. It is
a vector reproduction, hand-redrawn by Claude from the logo image supplied
by the app owner in chat (received as pasted image content, not as an
uploaded file, so pixel-exact source data was not available) — hexagonal
"S" monogram, brand green `#00B871`. All platform icons, the favicon and
the splash screen are generated from this one file (`logo-mark-1024.png`
is a pre-rendered 1024x1024 raster of it, used as the `tauri icon` input).

To replace it with your exact original artwork later: drop a square
(ideally 1024x1024, transparent background) PNG or SVG over
`logo-mark.svg` and `logo-mark-1024.png`, then run
`pnpm run branding:icons` (`tauri icon branding/logo-mark-1024.png`).
Nothing else in the codebase needs to change — see `src/branding.ts` for
the rest of the centralized brand configuration (name, colors, URLs,
contact).
