// Same-origin proxy for the "Web preview" build (see readme.md, "Web
// preview"). Only that build needs this: Windows/Linux/macOS/Android all
// go through the Tauri HTTP plugin (native Rust networking, no browser
// involved), which never hits CORS. A plain browser tab has no such
// escape hatch - IPTV/Xtream panels are built for native players, not
// browsers, and essentially never send `Access-Control-Allow-Origin`, so
// a direct `fetch()` to the user's provider gets silently blocked and the
// catalog never loads ("Impossible de charger la bibliothèque...").
//
// The fix: since this function is served from the *same* Netlify site as
// the app, the browser's request to it is same-origin (no CORS check at
// all). This function then fetches the real provider server-side (Deno's
// fetch is not subject to browser CORS) and streams the response straight
// back. See provider-fetch.js's `!useTauri` branch for the client side of
// this - it only calls here after a direct fetch has already failed.
//
// This intentionally stays a thin, read-only pass-through: GET/HEAD only,
// forwards just the handful of headers providerFetch actually sets
// (Authorization, Range), and only returns/forwards a safe response
// header subset. It does not become a general anonymizing proxy for
// arbitrary sites - the app only ever calls it with the user's own
// configured provider/media URLs.

const BLOCKED_HOSTNAME_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /^\[?fe80:/i, // link-local
  /^\[?fc[0-9a-f]{2}:/i, // unique local
  /^\[?fd[0-9a-f]{2}:/i, // unique local
  /^metadata\.google\.internal$/i,
]

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_HOSTNAME_PATTERNS.some((re) => re.test(hostname))
}

const FORWARD_REQUEST_HEADERS = ["authorization", "range"]
const FORWARD_RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "cache-control",
  "last-modified",
  "etag",
]
const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export default async (request: Request) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 })
  }

  const target = new URL(request.url).searchParams.get("url")
  if (!target) return new Response("Missing url", { status: 400 })

  let targetUrl: URL
  try {
    targetUrl = new URL(target)
  } catch {
    return new Response("Invalid url", { status: 400 })
  }
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return new Response("Unsupported protocol", { status: 400 })
  }
  if (isBlockedHost(targetUrl.hostname)) {
    return new Response("Forbidden host", { status: 403 })
  }

  const outHeaders = new Headers()
  outHeaders.set("User-Agent", DEFAULT_UA)
  for (const key of FORWARD_REQUEST_HEADERS) {
    const v = request.headers.get(key)
    if (v) outHeaders.set(key, v)
  }

  let upstream: Response
  try {
    upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: outHeaders,
      redirect: "follow",
    })
  } catch (e) {
    return new Response(`Upstream fetch failed: ${String(e)}`, { status: 502 })
  }

  const responseHeaders = new Headers()
  for (const key of FORWARD_RESPONSE_HEADERS) {
    const v = upstream.headers.get(key)
    if (v) responseHeaders.set(key, v)
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}

export const config = { path: "/__xt-proxy" }
