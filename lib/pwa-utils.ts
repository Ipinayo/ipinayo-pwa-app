// PWA utility functions for offline support and background sync

export interface OfflineMassSelection {
  id: string
  title: string
  date: string
  templateType: string
  liturgicalYear?: string
  season?: string
  themes?: string
  pastoralFocus?: string
  isPublic: boolean
  parts: {
    partName: string
    keySignature?: string
    notes?: string
  }[]
  createdAt: string
  synced: boolean
}

// IndexedDB setup for offline storage
export class OfflineStorage {
  private dbName = "ipinayo-offline"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("mass-selections")) {
          const store = db.createObjectStore("mass-selections", { keyPath: "id" })
          store.createIndex("synced", "synced", { unique: false })
          store.createIndex("createdAt", "createdAt", { unique: false })
        }
      }
    })
  }

  async saveMassSelection(selection: OfflineMassSelection): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mass-selections"], "readwrite")
      const store = transaction.objectStore("mass-selections")
      const request = store.put(selection)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getMassSelections(): Promise<OfflineMassSelection[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mass-selections"], "readonly")
      const store = transaction.objectStore("mass-selections")
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getUnsyncedSelections(): Promise<OfflineMassSelection[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mass-selections"], "readonly")
      const store = transaction.objectStore("mass-selections")
      const index = store.index("synced")
      const request = index.getAll(IDBKeyRange.only(false))

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mass-selections"], "readwrite")
      const store = transaction.objectStore("mass-selections")
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const selection = getRequest.result
        if (selection) {
          selection.synced = true
          const putRequest = store.put(selection)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deleteMassSelection(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mass-selections"], "readwrite")
      const store = transaction.objectStore("mass-selections")
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// Service Worker registration and management
export function registerServiceWorker(): void {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("SW registered: ", registration)

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available, prompt user to refresh
                if (confirm("New version available! Refresh to update?")) {
                  window.location.reload()
                }
              }
            })
          }
        })
      } catch (error) {
        console.log("SW registration failed: ", error)
      }
    })
  }
}

// Background sync for offline actions
export function requestBackgroundSync(tag: string): void {
  if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.sync.register(tag)
      })
      .catch((error) => {
        console.log("Background sync registration failed:", error)
      })
  }
}

// Check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

// Get network status
export function getNetworkStatus(): { online: boolean; effectiveType?: string } {
  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
  }
}

// Cache management
export async function clearAppCache(): Promise<void> {
  if ("caches" in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  }
}

// Notification permissions and setup
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ("Notification" in window) {
    return await Notification.requestPermission()
  }
  return "denied"
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      icon: "/images/logo.png",
      badge: "/images/logo.png",
      ...options,
    })
  }
}
