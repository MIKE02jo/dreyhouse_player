# Branding — DREYHOUSE PLAYER

How this fork's identity is wired up, what's centralized, and what still
needs your own input before a public release. See also `NOTICE.md` for
license/attribution and `branding/README.md` for the logo source.

## Centralized config

- `branding/brand.json` — name, bundle identifiers, colors, URLs, contact,
  version. Single source of truth.
- `branding/logo-mark.svg` — the logo. Swap this file and
  `branding/logo-mark-1024.png`, then run `pnpm run branding:icons`
  (`tauri icon branding/logo-mark-1024.png`) to regenerate every platform
  icon from it.
- `src/branding.ts` — re-exports `brand.json` for use in Astro/Svelte code.
- `pnpm run branding:sync` (`branding/sync-brand.mjs`) — pushes
  `brand.json` into `package.json` and `src-tauri/tauri.conf.json`.

Not covered by the sync script (by design — see file header comments):
Cargo crate name (`app`/`app_lib`, purely internal, left as-is), the
generated Android project (`src-tauri/gen/android`, regenerate via `pnpm
tauri android init` after changing `identifier` in `tauri.conf.json`), and
icons (`pnpm tauri icon <path-to-1024-png>`).

## Accent color / theme

The app's whole visual identity (surfaces, text, accent) is driven by one
CSS custom property, `--xt-tint-hue`, in `src/styles/global.css` — changing
it retints the entire app coherently, which is how the default was moved
from the upstream project's fuchsia (hue 330) to DREYHOUSE PLAYER's
emerald green (hue 160, ≈`#00B871`) without touching individual
components. The `emerald` preset is now the default/sentinel value
throughout (`app-settings.js`, the pre-paint script in `Layout.astro`,
`playlist-accent.ts`); the old default-slot "Fuchsia" swatch was removed
from the accent pickers since it would otherwise be a second button that
produces the same green as the default.

## Still needs your own input

Claude can't invent legal identities, register accounts, or generate
artwork it wasn't given — these are genuinely yours to fill in:

- **`privacy_policy.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`**: contact
  email and developer/publisher name are left as `[bracketed placeholders]`.
  Fill in before publishing anywhere a policy is legally expected (app
  stores in particular).
- **App store listings.** Microsoft Store, Google Play, and Snap Store
  listings all belong to Extreme InfiniTV's developer accounts and cannot
  be reused or transferred. To ship on those stores you need your own
  developer accounts, and then:
  - `buildfiles/msix/AppxManifest.template.xml`: replace the placeholder
    `Publisher="CN=REPLACE_WITH_YOUR_PARTNER_CENTER_PUBLISHER_ID"` with the
    identity Microsoft Partner Center issues you.
  - `.github/workflows/release.yml`: set a real `MSSTORE_PRODUCT_ID`
    secret/env (searchable as `REPLACE_WITH_YOUR_MSSTORE_PRODUCT_ID`) once
    registered.
  - `packaging/snap/snapcraft.yaml` already uses the plain name
    `dreyhouse-player` — register it with `snapcraft register
    dreyhouse-player` before first publish.
  - `packaging/flatpak/io.github.MIKE02jo.dreyhouse-player.yml` still
    points its release source at a placeholder `v1.0.0` .deb URL with a
    dummy sha256 — replace both once you've actually published a release
    (see the `TODO` comment in that file).
- **Updater signing key.** A fresh minisign keypair was generated for the
  Tauri updater (the public half is already in `tauri.conf.json`); the
  private key and its password were sent to you directly in chat (never
  committed to the repo). Store them as your CI's `TAURI_SIGNING_PRIVATE_KEY`
  / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` secrets before running
  `release.yml` — without them, release builds can't produce a validly
  signed `latest.json` and the in-app updater won't trust them.
- **Third-party binaries still fetched from upstream.** The Windows HEVC
  extension re-host (`src/scripts/lib/hevc-extension.ts`) and the ffmpeg
  sidecar (`src/scripts/ensure-ffmpeg-sidecar.mjs`) still download from
  `infinitel8p/Extreme-InfiniTV`'s GitHub releases — this project has no
  releases of its own yet to host checksummed copies from. Functional
  today, but a dependency on someone else's bandwidth/availability; host
  your own before a public/high-traffic release (both files have a comment
  marking exactly what to change).
- **Documentation site.** The in-app "Docs" page shows a "coming soon"
  placeholder (`src/pages/docs.astro`) rather than embedding the
  upstream-hosted docs site. The full docs content was carried over and
  rebranded in `docs/` (a separate Astro site) — it isn't deployed
  anywhere. Publish it (e.g. GitHub Pages) and update `docs/astro.config.mjs`'s
  `site`/`base` and `src/pages/docs.astro`'s "coming soon" block to point
  at it once it's live.
- **Marketing artwork not regenerated.** `pnpm tauri icon` regenerated
  every icon the app and OS package managers actually use (favicon, tray,
  Windows/macOS/Linux/iOS/Android app icons — all done). The large
  promotional images in `src-tauri/icons/logos/` used only for store
  listing pages (`ms-superhero-*`, `ms-poster-*`, `ms-keyart-*`,
  `ms-boxart-*`, `snap-banner-*`, `tv-banner-*`, `feature-graphic-*`,
  `readme-lockup-*`) still show the old purple mark — regenerate them from
  `branding/logo-mark.svg` if/when you set up those store listings.
- **Support / donation links.** Removed entirely per your instruction
  (`FUNDING.yml` deleted, the "Like the app?" settings card removed). Add
  your own via `branding/brand.json`'s `contact` block if you want them
  back — nothing currently reads those fields, wire them into
  `src/pages/settings.astro` if you do.
