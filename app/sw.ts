/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

const urlsToCache = ["/", "/liturgical-selections", "/offline"] as const

// cache on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(Array.from(urlsToCache));
    }),
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/pwa-192x192.png",
      data: {
        url: data.url,
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";
  const targetPath = new URL(url, self.location.origin).pathname;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clientsArr: readonly WindowClient[]) => {
        // A window is already on the target page → just focus it.
        const onTarget = clientsArr.find(
          (client) => new URL(client.url).pathname === targetPath
        );
        if (onTarget) {
          await onTarget.focus();
          return;
        }

        // An app window is open elsewhere → navigate it to the target.
        const openClient = clientsArr[0];
        if (openClient) {
          try {
            const navigated = await openClient.navigate(url);
            if (navigated) {
              await navigated.focus();
              return;
            }
          } catch {
            // navigate() isn't permitted for this client — fall through.
          }
        }

        // No usable window → open a fresh one.
        await self.clients.openWindow(url);
      })
  );
});

serwist.addEventListeners()