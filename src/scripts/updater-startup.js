// Tauri auto-updater. Runs once per browser session on Tauri desktop builds
// where the updater plugin can actually replace the binary: Windows (NSIS)
// and Linux (AppImage). On Linux the plugin gates internally on the
// `APPIMAGE` env var, so a deb / rpm install will throw a clear error and
// the catch below logs it without disrupting the page. MS Store builds are
// excluded too - an NSIS installer must not be applied over an MSIX install.
// macOS is excluded until signing + notarization are set up.
//
// Everywhere else (web, Android, macOS, MS Store) this is a no-op: there
// used to be a one-toast-per-version "update available" notice here, but
// this app ships internal fixes far more often than that was designed for,
// and its non-technical customer audience doesn't need a developer-facing
// update notice popping up on every visit. Snap/Flatpak skip this file
// entirely: their store owns updates, and Flathub flags a reachable
// self-update path.
import { log } from "@/scripts/lib/log.js"
import { isStoreBuild, resolveUpdateFeedUrl, withUpdaterRetry } from "@/scripts/lib/update-check.js"
import { sandboxRuntime } from "@/scripts/lib/sandbox.ts"
import { getUpdateChannel, getAutoUpdateEnabled } from "@/scripts/lib/app-settings.js"

const SESSION_FLAG = "xt_updater_checked"

let isTauri = false
try {
    isTauri = !!window.__TAURI_INTERNALS__ || !!window.__TAURI__
} catch {}

function isAutoUpdatePlatform() {
    if (!isTauri) return false
    const ua = navigator.userAgent || ""
    if (ua.includes("Windows")) return true
    // The Android WebView UA also contains "Linux" + "X11" markers, so gate
    // Linux on the absence of "Android" to keep the mobile build out.
    if (ua.includes("Linux") && !ua.includes("Android")) return true
    return false
}

function markSessionChecked() {
    try {
        if (sessionStorage.getItem(SESSION_FLAG)) return false
        sessionStorage.setItem(SESSION_FLAG, "1")
        return true
    } catch {
        return true
    }
}

async function runBetaAutoUpdate() {
    const { invoke } = await import("@tauri-apps/api/core")
    const { relaunch } = await import("@tauri-apps/plugin-process")
    const url = await resolveUpdateFeedUrl()
    const update = await withUpdaterRetry(() => invoke("updater_check_from", { url }))
    if (update === null) return
    await invoke("updater_install")
    // Windows exits the process mid-install (NSIS restarts it); relaunch() only matters on Linux AppImage.
    await relaunch()
}

async function runAutoUpdate() {
    if (getUpdateChannel() === "beta") {
        try {
            await runBetaAutoUpdate()
            return
        } catch (err) {
            log.error("Beta updater error, falling back to stable auto-update:", err)
        }
    }

    const { check } = await import("@tauri-apps/plugin-updater")
    const { relaunch } = await import("@tauri-apps/plugin-process")
    const update = await withUpdaterRetry(() => check())
    if (update !== null) {
        await update.downloadAndInstall()
        await relaunch()
    }
}

async function maybeRunAutoUpdate() {
    if (!markSessionChecked()) return
    if (await sandboxRuntime()) return
    if (!isAutoUpdatePlatform() || (await isStoreBuild())) return
    if (!getAutoUpdateEnabled()) return
    try {
        await runAutoUpdate()
    } catch (err) {
        log.error("Updater error:", err)
    }
}

maybeRunAutoUpdate()
