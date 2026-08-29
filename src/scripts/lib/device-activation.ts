// Device-code activation (MAC-style pairing) - lets a customer skip typing
// Xtream/M3U credentials by hand. The app generates a stable, locally-random
// ID on first use, shows it, and polls the seller's activation server (see
// branding/brand.json -> urls.activationServer, and the drey_house_site's
// netlify/functions/device-activate.js) until a seller assigns a
// subscription to that ID from the /admin or /vendeur panel.
//
// The generated ID is NOT a real hardware MAC address - it's a random value
// formatted the same way (AA:BB:CC:DD:EE:FF) because that's the format
// resellers/customers already recognize from IBO Player, Duplicast, etc.
// The first octet has the "locally administered" bit set (0x02) so it can
// never collide with a real burned-in MAC, matching the IEEE 802 convention
// for software-generated addresses.

import { brandUrls } from "@/branding.ts"

const DEVICE_ID_KEY = "xt_device_activation_id"

function randomByte(): number {
  return Math.floor(Math.random() * 256)
}

function toHex(byte: number): string {
  return byte.toString(16).padStart(2, "0").toUpperCase()
}

/** Read the device code without generating one - used on app launch to
 *  decide whether there's an activation to silently re-check (see
 *  checkPendingActivationOnLaunch below). Returns null for an install that
 *  never opened /activate, so we don't invent a code just to poll a server
 *  nobody has this install's id for yet. */
export function peekDeviceId(): string | null {
  try {
    return localStorage.getItem(DEVICE_ID_KEY)
  } catch {
    return null
  }
}

/** Stable per-install device code, generated once and persisted. */
export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
  } catch {}
  const first = toHex((randomByte() & 0xfc) | 0x02)
  const rest = Array.from({ length: 5 }, () => toHex(randomByte()))
  const id = [first, ...rest].join(":")
  try {
    localStorage.setItem(DEVICE_ID_KEY, id)
  } catch {}
  return id
}

export function activationServerConfigured(): boolean {
  return !!brandUrls.activationServer
}

export type ActivationStatus = "pending" | "active" | "expired" | "error" | "not-configured"

/** One account assigned to this device. A device can carry several -
 *  device-activate.js returns every still-valid one, and the customer
 *  picks which to use from the names shown in their app (the existing
 *  entries list / PlaylistSwitcher - see buildEntryPatches below). */
export interface ActivatedPlaylist {
  id: string
  label?: string
  type: "xtream" | "m3u"
  serverUrl?: string
  username?: string
  password?: string
  m3uUrl?: string
  expiresAt?: string | null
}

export interface ActivationResult {
  status: ActivationStatus
  playlists?: ActivatedPlaylist[]
  error?: string
}

export async function checkDeviceActivation(deviceId: string): Promise<ActivationResult> {
  const base = brandUrls.activationServer
  if (!base) return { status: "not-configured" }
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/.netlify/functions/device-activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { status: "error", error: (data as any)?.error || `HTTP ${res.status}` }
    }
    const status = (data as any)?.status as ActivationStatus
    if (status === "active") {
      // Prefer the new multi-account shape (`playlists` array). A site not
      // yet redeployed with that change still answers with the old
      // single-playlist fields at the top level - fall back to wrapping
      // those in a one-item array so the app works against either.
      const rawPlaylists = Array.isArray((data as any)?.playlists) ? (data as any).playlists : null
      const playlists: ActivatedPlaylist[] = rawPlaylists
        ? rawPlaylists.map((p: any, i: number) => ({
            id: String(p?.id || `p${i}`),
            label: p?.label || "",
            type: p?.type === "m3u" ? "m3u" : "xtream",
            serverUrl: p?.serverUrl,
            username: p?.username,
            password: p?.password,
            m3uUrl: p?.m3uUrl,
            expiresAt: p?.expiresAt ?? null,
          }))
        : [
            {
              id: "legacy",
              label: "",
              type: (data as any).type === "m3u" ? "m3u" : "xtream",
              serverUrl: (data as any).serverUrl,
              username: (data as any).username,
              password: (data as any).password,
              m3uUrl: (data as any).m3uUrl,
              expiresAt: (data as any).expiresAt ?? null,
            },
          ]
      if (!playlists.length) return { status: "pending" }
      return { status, playlists }
    }
    return { status: status === "expired" ? "expired" : "pending" }
  } catch (err) {
    return { status: "error", error: String((err as Error)?.message || err) }
  }
}

/** Shape a successful ActivationResult into the `patch` array addEntry()
 *  from creds.js expects, one per activated playlist - shared between
 *  /activate's own check and the silent on-launch check below so both
 *  save playlists the same way. Each entry is stamped with the deviceId
 *  it came from and the specific devicePlaylistId within it, so a later
 *  re-check can tell exactly which local entries to drop if a seller
 *  removes one particular account (see index.astro's revalidation pass) -
 *  not the whole device. */
export function buildEntryPatches(result: ActivationResult, deviceId: string): Record<string, unknown>[] {
  return (result.playlists || []).map((playlist) => {
    const base =
      playlist.type === "m3u"
        ? { type: "m3u", url: playlist.m3uUrl || "" }
        : {
            type: "xtream",
            serverUrl: playlist.serverUrl || "",
            username: playlist.username || "",
            password: playlist.password || "",
          }
    return {
      ...base,
      deviceId,
      devicePlaylistId: playlist.id,
      ...(playlist.label ? { title: playlist.label } : {}),
    }
  })
}
