/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

const localStorageStore = new Map<string, string>()
const localStorageMock: Storage = {
  getItem: (key) => (localStorageStore.has(key) ? localStorageStore.get(key)! : null),
  setItem: (key, value) => {
    localStorageStore.set(key, String(value))
  },
  removeItem: (key) => {
    localStorageStore.delete(key)
  },
  clear: () => {
    localStorageStore.clear()
  },
  key: (index) => Array.from(localStorageStore.keys())[index] ?? null,
  get length() {
    return localStorageStore.size
  },
}

beforeEach(() => {
  vi.stubGlobal("localStorage", localStorageMock)
  localStorageStore.clear()
  document.documentElement.removeAttribute("data-accent")
})

afterEach(() => {
  vi.unstubAllGlobals()
})

let activeEntry: { accent?: string } | null = null
let globalAccent = "emerald"

vi.mock("@/scripts/lib/creds.js", () => ({
  getActiveEntry: async () => activeEntry,
}))

vi.mock("@/scripts/lib/app-settings.js", () => ({
  ACCENT_PRESETS: ["emerald", "cyan", "blue", "violet", "rose", "ember"],
  ACCENT_EVENT: "xt:accent-changed",
  getAccent: () => globalAccent,
}))

import { resolveEffectiveAccent, applyEffectiveAccent } from "@/scripts/lib/playlist-accent.ts"

describe("resolveEffectiveAccent (pure)", () => {
  it("prefers a valid per-playlist override over the global accent", () => {
    expect(resolveEffectiveAccent("cyan", "emerald")).toBe("cyan")
  })

  it("falls back to the global accent when the override isn't a known preset", () => {
    expect(resolveEffectiveAccent("not-a-real-color", "blue")).toBe("blue")
  })

  it("falls back to the global accent when there's no override at all", () => {
    expect(resolveEffectiveAccent(undefined, "blue")).toBe("blue")
    expect(resolveEffectiveAccent("", "blue")).toBe("blue")
  })
})

describe("applyEffectiveAccent", () => {
  beforeEach(() => {
    activeEntry = null
    globalAccent = "emerald"
  })

  it("applies the active playlist's override and caches it", async () => {
    activeEntry = { accent: "violet" }
    globalAccent = "blue"
    await applyEffectiveAccent()
    expect(document.documentElement.getAttribute("data-accent")).toBe("violet")
    expect(localStorage.getItem("xt_accent_active")).toBe("violet")
  })

  it("falls back to the global accent and clears the cache when there's no override", async () => {
    activeEntry = { }
    globalAccent = "blue"
    await applyEffectiveAccent()
    expect(document.documentElement.getAttribute("data-accent")).toBe("blue")
    expect(localStorage.getItem("xt_accent_active")).toBeNull()
  })

  it("ignores an invalid override and falls back to the global accent", async () => {
    activeEntry = { accent: "not-a-real-color" }
    globalAccent = "cyan"
    await applyEffectiveAccent()
    expect(document.documentElement.getAttribute("data-accent")).toBe("cyan")
    expect(localStorage.getItem("xt_accent_active")).toBeNull()
  })

  it("removes data-accent entirely when the effective accent is emerald (the default)", async () => {
    document.documentElement.setAttribute("data-accent", "blue")
    activeEntry = null
    globalAccent = "emerald"
    await applyEffectiveAccent()
    expect(document.documentElement.hasAttribute("data-accent")).toBe(false)
  })

  it("lets an explicit emerald override win over a non-default global accent", async () => {
    activeEntry = { accent: "emerald" }
    globalAccent = "blue"
    await applyEffectiveAccent()
    expect(document.documentElement.hasAttribute("data-accent")).toBe(false)
    expect(localStorage.getItem("xt_accent_active")).toBe("emerald")
  })

  it("never writes to xt_accent, only to the active-override cache", async () => {
    activeEntry = { accent: "violet" }
    globalAccent = "emerald"
    await applyEffectiveAccent()
    expect(localStorage.getItem("xt_accent")).toBeNull()
  })
})
