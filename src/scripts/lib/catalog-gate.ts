// Tap-to-download gate for the three catalog-dependent destinations
// (Live TV / Movies / Series).
//
// Data is NOT pre-fetched silently in the background anymore - simply
// landing on the home page or opening the app used to kick off a warmup
// that could still be mid-flight when someone tapped into a section,
// which is exactly the "opens a half-loaded page and bugs out" complaint
// users reported. Now the first tap on a gated link fetches ONLY that
// tile's own kind (ensureLive/ensureVod/ensureSeries, not the bundled
// warmupActive() that pulls all three together) - tapping Live TV on a
// provider with a huge VOD/series catalog must not sit waiting on movies
// and series data nobody asked for yet. Each still reports real-time
// progress via the kind field on CATALOG_WARMING_BYTES_EVENT (the ensure*
// functions dispatch it directly, warmupActive() was only a wrapper
// around the same three calls). Navigation happens once the tapped
// kind's fetch resolves; a second tap on any gated link while one is
// already in flight just waits for that same one to finish - it does
// NOT queue a second kind, since the two rarely take the same time and
// stacking them reintroduces the same "waiting on data I didn't ask for"
// problem this rewrite exists to avoid.
//
// Sidebar.astro and index.astro both bind their own gated links against
// this module - the in-flight state below is shared across both (same
// module instance) so a tap in one place is reflected in the other.

import {
  ensureLive,
  ensureVod,
  ensureSeries,
  CATALOG_WARMING_BYTES_EVENT,
} from "@/scripts/lib/catalog.js"
import { getCached } from "@/scripts/lib/cache.js"
import { getActiveEntry, loadCreds } from "@/scripts/lib/creds.js"

export type CatalogKind = "live" | "vod" | "series"

const HREF_KIND: Record<string, CatalogKind> = {
  "/livetv": "live",
  "/movies": "vod",
  "/series": "series",
}

export const GATED_LINKS_SELECTOR =
  'a[href="/livetv"], a[href="/movies"], a[href="/series"]'

export interface GateHandlers {
  /** A download just started (covers all three kinds at once). */
  onStart?: () => void
  /** Progress for one kind - pct is null when the response has no known total. */
  onProgress?: (kind: CatalogKind, pct: number | null) => void
  /** The in-flight download finished (success or partial failure). */
  onDone?: () => void
  /** A gated link was tapped while a download was already in flight. */
  onBlocked?: () => void
  /** getActiveEntry()/warmupActive() itself threw - the tile is unstuck
   *  (onDone still fires) but navigation did not happen. */
  onError?: (err: unknown) => void
}

let inFlight: Promise<unknown> | null = null
let inFlightKind: CatalogKind | null = null
// Set synchronously the instant a download is decided on, before the first
// `await` - closes the race where two gated tiles are tapped back-to-back
// and both reach startOrJoinDownload() while `inFlight` is still null (it
// isn't assigned until after an async getActiveEntry() call resolves).
let starting = false
let pendingHref: string | null = null
const listeners = new Set<GateHandlers>()

function isKindWarm(playlistId: string, kind: CatalogKind): boolean {
  if (kind === "live") {
    // Xtream sources cache under "live", M3U sources under "m3u" - either
    // being warm means the Live TV tile has something to show.
    return !!getCached(playlistId, "live") || !!getCached(playlistId, "m3u")
  }
  return !!getCached(playlistId, kind)
}

function fetchKind(creds: unknown, playlistId: string, kind: CatalogKind) {
  if (kind === "live") return ensureLive(creds, playlistId)
  if (kind === "vod") return ensureVod(creds, playlistId)
  return ensureSeries(creds, playlistId)
}

function notify<K extends keyof GateHandlers>(
  key: K,
  ...args: Parameters<NonNullable<GateHandlers[K]>>
) {
  for (const handlers of listeners) {
    // @ts-expect-error - spread args match the specific handler's signature
    handlers[key]?.(...args)
  }
}

let bytesListenerBound = false
function ensureBytesListener() {
  if (bytesListenerBound) return
  bytesListenerBound = true
  document.addEventListener(CATALOG_WARMING_BYTES_EVENT, (ev) => {
    const detail = (ev as CustomEvent).detail as
      | { kind?: string; bytes?: number; total?: number }
      | undefined
    if (!detail?.kind) return
    const kind = detail.kind as CatalogKind
    const pct =
      typeof detail.total === "number" && detail.total > 0
        ? Math.max(0, Math.min(100, Math.round(((detail.bytes || 0) / detail.total) * 100)))
        : null
    notify("onProgress", kind, pct)
  })
}

async function startOrJoinDownload(href: string, kind: CatalogKind) {
  if (inFlight || starting) {
    // Only the tile whose fetch is actually running gets to move the
    // navigation target - a tap on a *different* kind while one is in
    // flight would otherwise navigate to unfetched data once the first
    // one resolves. Just let it know a download is already running.
    if (kind === inFlightKind) pendingHref = href
    notify("onBlocked")
    return
  }
  starting = true
  ensureBytesListener()
  pendingHref = href
  inFlightKind = kind
  notify("onStart")
  try {
    const active = await getActiveEntry()
    if (active) {
      const creds = await loadCreds()
      inFlight = creds?.host ? fetchKind(creds, active._id, kind) : Promise.resolve(null)
    } else {
      inFlight = Promise.resolve(null)
    }
    starting = false
    await inFlight
  } catch (err) {
    notify("onError", err)
  } finally {
    inFlight = null
    inFlightKind = null
    starting = false
  }
  notify("onDone")
  const dest = pendingHref
  pendingHref = null
  if (dest) window.location.href = dest
}

/** Wire every gated link under `root` to the tap-to-download flow. Safe to
 *  call multiple times / from multiple components on the same page. */
export function bindGatedLinks(root: ParentNode, handlers: GateHandlers = {}): void {
  listeners.add(handlers)
  const links = root.querySelectorAll<HTMLAnchorElement>(GATED_LINKS_SELECTOR)
  links.forEach((a) => {
    a.addEventListener("click", (ev) => {
      const mouseEv = ev as MouseEvent
      // Let modified clicks (open in new tab, etc.) behave normally.
      if (mouseEv.button !== 0 || mouseEv.metaKey || mouseEv.ctrlKey || mouseEv.shiftKey || mouseEv.altKey) return
      const href = a.getAttribute("href") || ""
      const kind = HREF_KIND[href]
      if (!kind) return
      ev.preventDefault()
      if (inFlight || starting) {
        startOrJoinDownload(href, kind)
        return
      }
      getActiveEntry().then((active) => {
        if (!active || isKindWarm(active._id, kind)) {
          window.location.href = href
          return
        }
        startOrJoinDownload(href, kind)
      })
    })
  })
}
