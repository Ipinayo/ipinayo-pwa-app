const CACHE_NAME = "ipinayo-v1"
const STATIC_CACHE_NAME = "ipinayo-static-v1"
const DYNAMIC_CACHE_NAME = "ipinayo-dynamic-v1"

// Assets to cache on install (only public assets)
const STATIC_ASSETS = [
  "/",
  "/signin",
  "/manifest.json",
  "/images/logo.png",
  "/offline",
  // Add other critical public assets
]

// Define auth-protected routes
const PROTECTED_ROUTES = ['/dashboard', '/create', '/edit', '/view', '/mass-selections']

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
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

// Fetch event - handle caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // Check if route is protected (for offline fallback logic)
  const isProtectedRoute = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route))

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for offline access
          if (response.ok && request.method === "GET") {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline response for API requests
            return new Response(JSON.stringify({ error: "Offline - data not available" }), {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "application/json" },
            })
          })
        }),
    )
    return
  }

  // Network-first strategy for all page requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache all successful responses (not redirects)
        if (response.ok && response.status === 200 && !response.redirected) {
          console.log("[SW] Caching page:", url.pathname)
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        } else {
          console.log("[SW] Not caching response:", response.status, response.redirected)
        }
        return response
      })
      .catch(async (error) => {
        console.log("[SW] Network failed, checking cache:", url.pathname)
        // Fallback to cache when network fails
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
          console.log("[SW] Serving cached page:", url.pathname)
          return cachedResponse
        }
        // For protected routes or navigation requests that aren't cached, show offline page
        if (isProtectedRoute || request.mode === "navigate") {
          console.log("[SW] Showing offline page for:", url.pathname)
          return caches.match("/offline")
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        })
      })
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)

  if (event.tag === "sync-mass-selections") {
    event.waitUntil(syncMassSelections())
  }
})

// Sync offline mass selections when back online
async function syncMassSelections() {
  try {
    // Get offline data from IndexedDB or localStorage
    const offlineData = await getOfflineData()

    if (offlineData && offlineData.length > 0) {
      for (const data of offlineData) {
        try {
          await fetch("/api/mass-selections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
          // Remove from offline storage after successful sync
          await removeOfflineData(data.id)
          console.log("[SW] Synced mass selection:", data.id)
        } catch (error) {
          console.error("[SW] Error syncing mass selection:", error)
        }
      }
    }
  } catch (error) {
    console.error("[SW] Error in background sync:", error)
  }
}

// Helper functions for offline data management
async function getOfflineData() {
  // Implementation would depend on your offline storage strategy
  // This is a placeholder for the actual implementation
  return []
}

async function removeOfflineData(id) {
  // Implementation would depend on your offline storage strategy
  // This is a placeholder for the actual implementation
}

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