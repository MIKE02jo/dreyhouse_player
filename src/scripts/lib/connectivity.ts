// Online/offline awareness. Mounted from Layout.astro.
// Shows a sticky toast when the WebView reports offline, dismisses it on
// reconnect, and dispatches xt:reconnected so EPG / catalog can opt to
// refresh in the background.

import { toast } from "@/scripts/lib/toast.js"
import { t } from "@/scripts/lib/i18n.js"

export const RECONNECT_EVENT = "xt:reconnected"

let dismissOfflineToast: (() => void) | null = null

function showOfflineToast() {
  if (dismissOfflineToast) return
  dismissOfflineToast = toast({
    title: t("stream.offline.title"),
    description: t("stream.offline.body"),
    variant: "warn",
    duration: 0,
  })
}

function clearOfflineToast() {
  if (!dismissOfflineToast) return
  try { dismissOfflineToast() } catch {}
  dismissOfflineToast = null
}

let initialized = false

export function initConnectivity() {
  if (initialized || typeof window === "undefined") return
  initialized = true
  if (navigator.onLine === false) showOfflineToast()
  window.addEventListener("offline", showOfflineToast)
  window.addEventListener("online", () => {
    clearOfflineToast()
    // Content only downloads when a tile is tapped (see catalog-gate.ts) -
    // this used to force a full live+vod+series re-fetch on every
    // reconnect (including a plain app resume from background, which the
    // WebView reports the same way as a real network recovery), racing
    // whatever the user was already loading and re-downloading catalogs
    // nobody asked for again. Just clear the toast and let whichever page
    // is open re-fetch on its own terms if it needs to.
    try {
      document.dispatchEvent(new CustomEvent(RECONNECT_EVENT))
    } catch {}
  })
}
