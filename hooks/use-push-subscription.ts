"use client";

import { useCallback, useEffect, useState } from "react";
import {
    deletePushSubscriptionAction,
    savePushSubscriptionAction,
} from "@/lib/actions/push-subscription";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replaceAll("-", "+")
        .replaceAll("_", "/");
    const rawData = atob(base64);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        output[i] = rawData.codePointAt(i) ?? 0;
    }
    return output;
}

export type PushSubscriptionState =
    | "unsupported"
    | "denied"
    | "subscribed"
    | "unsubscribed"
    | "loading";

export function usePushSubscription() {
    const [state, setState] = useState<PushSubscriptionState>("loading");

    useEffect(() => {
        if (
            globalThis.window === undefined ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in globalThis)
        ) {
            setState("unsupported");
            return;
        }

        if (Notification.permission === "denied") {
            setState("denied");
            return;
        }

        navigator.serviceWorker.ready.then((registration) => {
            registration.pushManager.getSubscription().then((sub) => {
                setState(sub ? "subscribed" : "unsubscribed");
            });
        });
    }, []);

    const subscribe = useCallback(async (): Promise<"subscribed" | "denied" | "error"> => {
        if (
            globalThis.window === undefined ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in globalThis)
        ) {
            return "error";
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setState("denied");
                return "denied";
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
                return "error";
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            const json = subscription.toJSON();
            if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
                console.error("Invalid push subscription keys");
                return "error";
            }

            await savePushSubscriptionAction({
                endpoint: json.endpoint,
                p256dh: json.keys.p256dh,
                auth: json.keys.auth,
                userAgent: navigator.userAgent,
            });

            setState("subscribed");
            return "subscribed";
        } catch (error) {
            console.error("Failed to subscribe to push notifications:", error);
            return "error";
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;

        await subscription.unsubscribe();
        await deletePushSubscriptionAction(subscription.endpoint);
        setState("unsubscribed");
    }, []);

    return { state, subscribe, unsubscribe };
}
