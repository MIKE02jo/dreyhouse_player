# DREYHOUSE PLAYER — LG webOS packaging

Starting point for an LG webOS TV app - the package itself is verified,
but **the app has never actually run on webOS**. See "What's verified" vs.
"What still needs a real device/emulator" below.

## What's verified (no webOS SDK/emulator/device needed for this part)

- `ares-package` (LG's own official CLI, installed via npm here) accepts
  the staged output and produces a real, structurally valid `.ipk` -
  `ares-package -c` reports "no problems detected".
- A smoke test serving the staged build over plain HTTP and loading it in
  headless Chromium renders the app's title and content with no fatal
  errors. (Chromium isn't webOS's actual WebKit engine, so this doesn't
  prove it runs correctly on a real TV - see below - but it does confirm
  the static build itself isn't broken.)
- Found and fixed one real packaging bug in the process: `ares-package`'s
  bundled minifier (an old uglify-js) can't parse the modern ES2020+/ESM
  syntax Vite/Rolldown already emit, and failed with "Failed to minify
  code" on some chunks. `build.sh` now passes `--no-minify` (the build is
  already minified, so nothing is lost).

## Same design, no rebuild needed

webOS TV apps are plain HTML/CSS/JS web apps under the hood. DREYHOUSE
PLAYER already builds one: `pnpm build` produces the same "Web preview"
static site described in `readme.md` (no Tauri, no native features - see
the `isTauri` fallback throughout `src/scripts/lib/`). This packaging step
does not re-design or re-implement anything - it wraps that exact same
build, so the UI is identical to the desktop/Android app.

## What's already known to work (inherited from the "Web preview" target)

- The whole UI, playback engines (hls.js/shaka/mpegts.js), settings, themes
- Credential/preference storage falls back to localStorage/cookies (see
  `readme.md`, "Offline-friendly persistence")
- D-pad-style navigation exists for Android TV already, which may carry over

## What's NOT available on webOS (Tauri/native-only features)

These already degrade gracefully in the "Web preview" build (same as any
browser), nothing new to remove:

- ffmpeg sidecar audio repair (desktop-only, needs the Rust binary)
- Auto-updater (webOS apps update through the LG Content Store instead)
- System tray, native window chrome
- The Android-native ExoPlayer opt-in path (Android-specific bridge)
- Filesystem-backed offline downloads (browser storage limits apply instead)

## What genuinely needs a real device or the SDK's emulator to verify

- **Video playback**: webOS's embedded WebKit varies a lot by TV generation
  (webOS 3.x/4.x on older/budget TVs can be several years behind current
  Chromium). hls.js and the codecs it needs may or may not work as-is -
  this is the biggest unknown and the most likely place for real work.
- **Remote control navigation**: webOS's spatial-navigation/focus model
  differs from Android TV's key events. The existing D-pad handling is a
  starting point, not a guarantee.
- **On-screen keyboard / login form UX** when typing an Xtream Codes
  server/username/password with a remote.
- **Performance** on lower-end webOS hardware.

## Building the package

```bash
./packaging/webos/build.sh
```

Runs `pnpm build`, stages the output with `appinfo.json` + icons at
`dist-webos/stage/`. If the LG webOS TV SDK's `ares-package` CLI is
installed, it also produces `dist-webos/*.ipk`. Otherwise the script tells
you the exact commands to run once you have the SDK.

## Testing without buying an LG TV

LG's webOS TV SDK ships a **free emulator** (no physical TV required) that
runs on Windows, macOS, and Linux:

1. Download the "webOS TV SDK" from **webostv.developer.lge.com** (free LG
   Developer account, see the earlier compatibility conversation - no
   company needed).
2. Install it, then launch **webOS TV Simulator** (or the older
   VirtualBox-based emulator on some SDK versions) from the SDK's IDE.
3. `ares-package packaging/webos -o dist-webos` (or run `build.sh` above
   first to get a fresh `dist-webos/stage/`), then
   `ares-install -d emulator dist-webos/*.ipk` and
   `ares-launch -d emulator com.dreyhouse.player`.
4. The app opens inside the simulator window on your PC - full remote-control
   simulation via keyboard, no LG TV needed to get started. A real TV is
   still worth testing on before publishing (chipset/codec differences).

## Publishing

Once it runs correctly in the emulator (and ideally a real TV too): see the
LG webOS publishing flow already covered in chat - developer.lge.com, LG
Content Store submission, certification review.
