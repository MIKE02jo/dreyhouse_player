<h1 align="center">DREYHOUSE PLAYER</h1>

<p align="center"><strong>A cross-platform IPTV player for Xtream Codes and M3U / M3U8 playlists.</strong></p>

<p align="center">
  Live TV with EPG and catch-up, movies, series, custom playlists, offline downloads, and TV-remote (D-pad) navigation.<br/>
  Targets Windows, Android phone / tablet / TV, macOS, Linux, and the web.
</p>

<p align="center">
  <a href="https://github.com/MIKE02jo/dreyhouse_player/releases/latest">
    <img src="https://img.shields.io/badge/GitHub-Releases-181717?logo=github&logoColor=white" height="50" alt="Download DREYHOUSE PLAYER from GitHub Releases"/>
  </a>
</p>

<p align="center">
  <a href="https://github.com/MIKE02jo/dreyhouse_player/releases/latest">
    <img src="https://img.shields.io/github/v/release/MIKE02jo/dreyhouse_player?label=stable&color=00B871" alt="Latest stable release"/>
  </a>
  <a href="https://github.com/MIKE02jo/dreyhouse_player/stargazers">
    <img src="https://img.shields.io/github/stars/MIKE02jo/dreyhouse_player?color=00B871" alt="GitHub stars"/>
  </a>
  <img src="https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Android-64748b?color=00B871" alt="Supported platforms: Windows, macOS, Linux, Android"/>
</p>

<p align="center">
  <a href="https://github.com/MIKE02jo/dreyhouse_player/issues">
    <img src="https://img.shields.io/github/issues/MIKE02jo/dreyhouse_player?logo=github&color=00B871" alt="Issues"/>
  </a>
  <a href="https://github.com/MIKE02jo/dreyhouse_player/discussions">
    <img src="https://img.shields.io/github/discussions/MIKE02jo/dreyhouse_player?logo=github&color=00B871" alt="Discussions"/>
  </a>
</p>

> DREYHOUSE PLAYER is a rebrand/fork of [Extreme InfiniTV](https://github.com/infinitel8p/Extreme-InfiniTV)
> (GPL-3.0-or-later) with its own name, logo, and visual identity - see
> `NOTICE.md` for what changed and `docs/BRANDING.md` for the branding
> system. Screenshots below are pending a fresh capture of the restyled UI.

## Features

- **Any source, one UI.** Sign in with Xtream Codes credentials, paste an M3U / M3U8 URL or a direct stream link, or load a playlist file from your device. The app detects the mode automatically.
- **Live TV** with category filtering, channel search, channel-number entry, a virtualised list, inline EPG (now / next / today), and automatic channel-logo fallback from iptv-org's logo collection when a provider doesn't supply one.
- **Catch-up TV and replay.** Replay programmes from your provider's archive and pause or rewind behind live, with a full-programme seekbar.
- **Custom playlists** built in a full in-app editor: pull channels from any playlist, reorder and group them, rename, renumber, find and replace, check links, and export as `.m3u`.
- **Add a stream from any website.** Paste a page URL and the app sniffs the network for playable HLS / DASH streams, with quality labels and multi-select.
- **Movies (VOD)** and **Series** library with poster grids, detail dialogs, season / episode navigation, mark watched / unwatched with a watched badge, an optional hide-watched filter, and a "Surprise me" random-title picker.
- **[TMDB metadata enrichment](https://www.themoviedb.org/).** Optional, bring-your-own free API key (Settings > Network): cast, director, and similar titles on movie and series detail pages.
- **"Because you watched" recommendations** on the home screen, plus similar-title suggestions on detail pages, both computed locally from category, cast, and director so they work even without a TMDB key.
- **Search** (`Ctrl+K`) across channels, movies, and series, with recent searches you can revisit or clear.
- **Full schedule grid** on the EPG page, with timezone-aware "all times local" rendering, custom EPG sources, and channel mapping.
- **A player for everything.** Three embedded engines (ArtPlayer, Video.js, Shaka) cover HLS, MPEG-TS, MPEG-DASH with ClearKey, and HEVC (with one-click install of the Windows HEVC extension). Picture-in-picture included.
- **Embedded subtitles** from MP4 files everywhere, plus MKV playback on desktop (remuxed on the fly through a bundled FFmpeg on macOS / Linux, and as a Windows fallback when WebView2 can't demux a file), with an option to turn captions on by default, **audio track switching**, and **automatic audio repair** for AC-3 / E-AC-3 / MP2 / DTS.
- **External players.** Hand any stream to MPV or VLC on desktop (with window reuse), or to any installed video app on Android.
- **Multiple playlists**, switchable from the sidebar without re-entering credentials, each with its own favorites, watchlist, progress, and health panel.
- **TV-first navigation.** Spatial focus (D-pad / arrow keys) is wired across the whole app via `spatial-navigation-polyfill`. Hit targets, focus rings, and reflow tested for 10-foot UI, plus a TV safe-area setting for overscan and a collapsible desktop sidebar.
- **16 languages** including RTL (Arabic, Urdu), translated before first paint so there's no flash of English.
- **Light and dark themes** with adjustable accent color; each playlist can also override the accent (and add an emoji) so you can tell them apart at a glance. Honours `prefers-color-scheme`, `prefers-reduced-motion`, and `prefers-contrast`.
- **Adjustable font scale** (Small / Default / Medium / Large / X-Large) plus a responsive root size that scales the whole UI on 4K and 8K displays.
- **Self-updating desktop builds** (Windows NSIS and Linux AppImage) via the Tauri updater, signed with minisign and served from GitHub Releases, with stable and beta channels and a "What's new" dialog after each update.
- **Backup and restore.** Export playlists, preferences, and settings as one file and import them on another device.
- **Offline-friendly persistence.** Credentials and preferences live in the OS app-data dir on Tauri builds, with a localStorage / cookie fallback on the web build; clear your viewing history from Settings at any time.
- **No tracking, no ads, no telemetry by default.** The app collects nothing about you or your viewing habits. The only outbound metadata lookup is the optional TMDB enrichment above, off by default and using your own API key when you turn it on.

## Install

No signed releases have been published yet - see [Releases](https://github.com/MIKE02jo/dreyhouse_player/releases) once they exist. Until then, build from source (below). Planned distribution once releases start:

| Platform | How | Updates |
| --- | --- | --- |
| Windows (sideload) | NSIS `.exe` (or `.msi`) from Releases | In-app auto-updater |
| macOS (Apple Silicon + Intel) | Universal `.dmg` from Releases | Update check in-app, download from Releases |
| Linux (Debian / Ubuntu / Mint) | `.deb` from Releases | Manual |
| Linux (Fedora / openSUSE / RHEL) | `.rpm` from Releases | Manual |
| Linux (any distro, portable) | `.AppImage` from Releases | In-app auto-updater |
| Raspberry Pi 4 / 5 (64-bit OS) | arm64 `.deb` / `.AppImage` from Releases | In-app (AppImage) |
| Android phone / tablet / TV | Sideload the APK from Releases | Manual |
| Web preview | Build with `pnpm build` and serve `dist/` (no auto-update, no native features) | Manual |

Microsoft Store / Google Play / Snap Store listings are not set up for this
fork - the original project's store listings belong to its own developer
account and can't be reused (see `docs/BRANDING.md`).

### macOS: "DREYHOUSE PLAYER.app" cannot be opened

Unsigned/unnotarized builds get blocked by Gatekeeper on first launch with a message like _"Apple could not verify DREYHOUSE PLAYER.app is free of malware"_. After dragging the app from the `.dmg` into `/Applications`, remove the quarantine flag from a Terminal:

```bash
xattr -dr com.apple.quarantine "/Applications/DREYHOUSE PLAYER.app"
```

Then open the app normally. You only need to do this once per install.

## Develop

Requirements: [pnpm](https://pnpm.io) (the package manager is pinned in `package.json`), Node 20+, the Rust toolchain (only for `tauri` commands), Java 21 and Android Studio for `tauri:android`. `mise.toml` pins the toolchain versions if you use [mise](https://mise.jdx.dev).

```bash
pnpm install
pnpm dev                  # Astro + Svelte at http://localhost:4321
pnpm tauri dev            # Native desktop shell (auto-spawns pnpm dev)
pnpm tauri:android        # Android dev shell
```

On Windows and Linux, `pnpm tauri dev` / `pnpm tauri build` first download and checksum-verify a trimmed FFmpeg sidecar into `src-tauri/binaries/` (run `pnpm fetch-ffmpeg` to do it manually). The first Tauri build therefore needs network access.

To test the dev server on another device on the LAN (phone, TV), set `XTREAM_HMR_HOST` to your machine's LAN IP so Vite advertises the right HMR host:

```bash
XTREAM_HMR_HOST=192.168.1.50 pnpm dev
```

Tests run with Vitest (`pnpm test`); dozens of suites in `tests/` cover the parsers, serializers, catch-up math, codec hints, custom playlists, backup, and the playback proxies. Lint with ESLint flat config (`pnpm lint` / `pnpm lint:fix`); no Prettier. TypeScript is in strict mode (`tsconfig.json` extends `astro/tsconfigs/strict`); the `@/*` alias maps to `src/*`.

### Branding

App name, colors, bundle identifiers, and URLs are centralized in
`branding/brand.json` and `branding/logo-mark.svg`. Edit those, run
`pnpm run branding:sync`, and see `docs/BRANDING.md` for what still needs a
manual touch (Cargo crate name, Android/iOS package regeneration, store
listings).

## Credits

DREYHOUSE PLAYER is built on [Extreme InfiniTV](https://github.com/infinitel8p/Extreme-InfiniTV),
copyright (c) 2025 Ludovico Ferrara, used and modified under the terms of
the GPL-3.0-or-later license. See `NOTICE.md` for details of what changed.

## License

DREYHOUSE PLAYER is released under the [GNU General Public License v3.0 or later](LICENSE). You are free to use, study, share, and modify it; any distributed fork or derivative must remain under the same license and ship its source.

The Windows and Linux desktop builds bundle a trimmed [FFmpeg](https://ffmpeg.org) binary (LGPL v2.1) for the automatic audio fix. The full notice, source pointer, and build recipe are in the app under **Settings > About > Open-source licenses**.

The optional TMDB metadata enrichment uses the [TMDB](https://www.themoviedb.org) API with your own API key. This product uses the TMDB API but is not endorsed or certified by TMDB. Channel logos not supplied by your provider fall back to [iptv-org](https://github.com/iptv-org/api)'s CC0 logo collection.
