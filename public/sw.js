const CACHE_NAME = "ipinayo"
const STATIC_CACHE_NAME = "ipinayo-static"
const DYNAMIC_CACHE_NAME = "ipinayo-dynamic"

// Assets to cache on install (only public assets)
const STATIC_ASSETS = [
  "/",
  "/signin",
  "/manifest.json",
  "/offline",
  "/images/logo.png",
]

// Dynamic assets that need to be cached during runtime
const CACHE_PATTERNS = {
  css: /\.(css)$/,
  js: /\.(js)$/,
  fonts: /\.(woff|woff2|ttf|eot)$/,
  images: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
}

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        // Cache assets individually to avoid failing entire install if one fails
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache ${url}:`, err)
              return null
            })
          )
        )
      })
      .then(() => {
        console.log("[SW] Static assets cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Error caching static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - simple network-first with offline fallback
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // Check if this is a CSS, JS, font, or image file
  const isStaticAsset =
    CACHE_PATTERNS.css.test(url.pathname) ||
    CACHE_PATTERNS.js.test(url.pathname) ||
    CACHE_PATTERNS.fonts.test(url.pathname) ||
    CACHE_PATTERNS.images.test(url.pathname)

  // For static assets (CSS, JS, fonts, images), use cache-first strategy
  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("[SW] Serving from cache:", url.pathname)
          return cachedResponse
        }

        // If not in cache, fetch and cache it
        return fetch(request).then((response) => {
          if (response.ok && response.status === 200) {
            const responseClone = response.clone()
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
              console.log("[SW] Cached static asset:", url.pathname)
            })
          }
          return response
        }).catch((error) => {
          console.error("[SW] Failed to fetch static asset:", url.pathname, error)
          throw error
        })
      })
    )
    return
  }

  // Skip API routes and server actions - let them fail naturally
  if (url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    request.headers.get('RSC') || // React Server Component requests
    request.headers.get('Next-Router-State-Tree')) { // Next.js router requests
    return
  }

  // Network-first strategy for navigation requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful page responses
        if (response.ok && response.status === 200 && !response.redirected) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(async (error) => {
        console.log("[SW] Network failed for:", url.pathname)

        // Try to serve from cache first
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
          console.log("[SW] Serving cached page:", url.pathname)
          return cachedResponse
        }

        // If nothing in cache, show offline page
        console.log("[SW] Showing offline page")
        return caches.match("/offline")
      })
  )
})

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event)

  const options = {
    body: event.data ? event.data.text() : "New update available",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View",
        icon: "/images/logo.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/images/logo.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Ìpínayò", options))
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received:", event)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard"))
  }
})

// Message handling from clients
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})