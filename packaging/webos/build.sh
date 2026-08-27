#!/usr/bin/env bash
# Stages the existing static web build (see readme.md, "Web preview") into a
# webOS app package - same UI, no code changes, no new design work.
#
# What this script does:
#   1. Runs `pnpm build` (produces dist/, the same static site used for the
#      "Web preview" target - already Tauri-free, see isTauri fallbacks
#      throughout src/scripts/lib/).
#   2. Copies dist/ + appinfo.json + icon.png + largeIcon.png into a staging
#      folder ready for webOS packaging.
#   3. If the LG webOS TV SDK's `ares-package` is installed, packages it into
#      an .ipk. Otherwise it stops after staging and tells you what to run
#      once you have the SDK.
#
# What this script does NOT do (needs a real webOS device or the SDK's
# emulator, neither of which exist in this environment - see README.md):
#   - Verify the app actually launches/renders on webOS's WebKit engine
#   - Verify remote-control (D-pad) navigation and focus behavior
#   - Verify video playback (HLS via hls.js) on real webOS hardware/codecs
#   - Install or launch the app on a TV
#
# Usage:
#   ./packaging/webos/build.sh
#   ares-install -d <device-name> dist-webos/*.ipk   # once you have the SDK
#   ares-launch -d <device-name> com.dreyhouse.player

set -euo pipefail
cd "$(dirname "$0")/../.."

STAGE="dist-webos/stage"
OUT="dist-webos"

echo "==> Building the static web app (pnpm build)"
pnpm build

echo "==> Staging webOS package at $STAGE"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp -r dist/. "$STAGE/"
cp packaging/webos/appinfo.json "$STAGE/"
cp packaging/webos/icon.png "$STAGE/"
cp packaging/webos/largeIcon.png "$STAGE/"

if command -v ares-package >/dev/null 2>&1; then
  echo "==> ares-package found, building .ipk"
  ares-package "$STAGE" -o "$OUT"
  echo "==> Done. Install with: ares-install -d <device-name> $OUT/*.ipk"
else
  echo "==> ares-package not found (LG webOS TV SDK not installed here)."
  echo "    Staged files are ready at $STAGE/ - install the webOS TV SDK"
  echo "    (webostv.developer.lge.com) on a machine with a real LG TV or"
  echo "    the SDK's emulator, then run:"
  echo "      ares-package $STAGE -o $OUT"
  echo "      ares-install -d <device-name> $OUT/*.ipk"
  echo "      ares-launch -d <device-name> com.dreyhouse.player"
fi
