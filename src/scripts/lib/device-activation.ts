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

export interface ActivationResult {
  status: ActivationStatus
  type?: "xtream" | "m3u"
  serverUrl?: string
  username?: string
  password?: string
  m3uUrl?: string
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
      return {
        status,
        type: (data as any).type === "m3u" ? "m3u" : "xtream",
        serverUrl: (data as any).serverUrl,
        username: (data as any).username,
        password: (data as any).password,
        m3uUrl: (data as any).m3uUrl,
      }
    }
    return { status: status === "expired" ? "expired" : "pending" }
  } catch (err) {
    return { status: "error", error: String((err as Error)?.message || err) }
  }
}
