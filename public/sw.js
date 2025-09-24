const CACHE_NAME = "ipinayo-v1"
const STATIC_CACHE_NAME = "ipinayo-static-v1"
const DYNAMIC_CACHE_NAME = "ipinayo-dynamic-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/create",
  "/auth/signin",
  "/manifest.json",
  "/images/logo.png",
  "/offline",
  // Add other critical assets
]

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

// Fetch event - serve from cache, fallback to network
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

  // Handle page requests with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache and update in background
        fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(request, response.clone())
              })
            }
          })
          .catch(() => {
            // Network failed, but we have cache
          })
        return cachedResponse
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            // Cache successful responses
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Network failed and not in cache
          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline")
          }
          // Return a generic offline response
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          })
        })
    }),
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

  event.waitUntil(self.registration.showNotification("ipinayo", options))
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received:", event)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard"))
  }
})
