/**
 * Life OS Daily — Service Worker
 *
 * Strategy:
 *  - App shell (HTML navigations): network-first, fall back to cached shell
 *  - Static assets (JS, CSS, images, fonts): stale-while-revalidate
 *  - Skip caching for non-GET requests and Chrome-extension URLs
 *
 * Data (habit completions + user name) is stored in localStorage on the client,
 * so it works offline without any network call. This SW only handles the
 * app shell + static assets.
 */

const VERSION = "lifeos-daily-v1.0.0";
const STATIC_CACHE = `lifeos-static-${VERSION}`;
const PAGE_CACHE = `lifeos-page-${VERSION}`;
const RUNTIME_CACHE = `lifeos-runtime-${VERSION}`;

// Files that make up the app shell — pre-cached on install.
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
  "/icons/favicon-16.png",
  "/icons/icon.svg",
  "/robots.txt",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // Use addAll with ignore-failures: some Next.js dev URLs (like /_next/...)
      // are only generated on demand, so don't fail the install if they 404.
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "no-store" });
            if (res && res.ok) {
              await cache.put(url, res.clone());
            }
          } catch (_) {
            // ignore — will be cached on first runtime fetch
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) =>
              k !== STATIC_CACHE &&
              k !== PAGE_CACHE &&
              k !== RUNTIME_CACHE,
          )
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

/**
 * Decide which cache strategy to use for a request.
 */
function isStaticAsset(url) {
  const u = new URL(url);
  return (
    u.pathname.startsWith("/_next/static/") ||
    u.pathname.startsWith("/icons/") ||
    u.pathname === "/manifest.json" ||
    u.pathname === "/robots.txt" ||
    /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|ico)$/.test(u.pathname)
  );
}

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept") &&
      request.headers.get("accept").includes("text/html"))
  );
}

// Stale-while-revalidate for static assets
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// Network-first for navigations, fall back to cached shell
async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fall back to cached root shell
    const rootMatch = await cache.match("/");
    if (rootMatch) return rootMatch;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip Chrome-extension and non-http(s) requests
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.hostname.includes("chrome-extension")) return;

  // Skip Next.js HMR / dev-only endpoints
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Skip cross-origin requests (e.g. fonts loaded from CDNs) — let them go
  // straight to network. We could cache them, but it adds complexity.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation: network-first
  if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static asset: stale-while-revalidate
  if (isStaticAsset(request.url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: try network, fall back to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  );
});
