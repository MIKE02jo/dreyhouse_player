// Keeps a device-activated playlist in sync with the site *while the app is
// open*, not just once at launch - a seller deactivating one account (or
// the whole device) in the admin/vendeur panel should take effect quickly,
// not only the next time the customer happens to fully close and reopen
// the app. Runs from Sidebar.astro (present on every content page) so it
// keeps checking no matter which page the customer is actually on, not
// just the home hub.
//
// Cheap by design: this is one small status POST per interval, nothing
// like the catalog warmup - it must never be confused with that (see
// catalog-gate.ts's own comments on why background catalog fetches were
// removed entirely).

import { getEntries, removeEntry } from "@/scripts/lib/creds.js"
import { getOrCreateDeviceId, checkDeviceActivation } from "@/scripts/lib/device-activation.ts"
import { log } from "@/scripts/lib/log.js"

const REVALIDATE_INTERVAL_MS = 30_000

let started = false

async function revalidateOnce(): Promise<void> {
  const deviceId = getOrCreateDeviceId()
  const entries = await getEntries()
  const linked = entries.filter((entry: any) => entry.deviceId === deviceId)
  if (!linked.length) return
  try {
    const result = await checkDeviceActivation(deviceId)
    const stillActiveIds = new Set((result.status === "active" ? result.playlists || [] : []).map((p) => p.id))
    for (const entry of linked) {
      const playlistId = (entry as any).devicePlaylistId
      // An entry predating multi-account support has no devicePlaylistId -
      // treat the whole device's status as its own, same as before.
      const stillActive = playlistId ? stillActiveIds.has(playlistId) : result.status === "active"
      if (!stillActive) await removeEntry((entry as any)._id)
    }
  } catch (err) {
    log.warn("[xt:activation-revalidate] check failed:", err)
  }
}

/** Idempotent - safe to call from every page that loads this module
 *  (Sidebar.astro, index.astro); only the first call actually starts the
 *  interval. */
export function startActivationRevalidationLoop(): void {
  if (started) return
  started = true
  revalidateOnce()
  setInterval(revalidateOnce, REVALIDATE_INTERVAL_MS)
}
