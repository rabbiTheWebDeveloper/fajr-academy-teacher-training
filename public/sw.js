/* Fajr Academy service worker — push notifications only (no offline caching).
   Payload (from src/service/push-service.js): { title, body, url, tag, urgent } */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    lang: "bn",
    vibrate: [120, 60, 120],
    requireInteraction: Boolean(data.urgent),
    data: { url: typeof data.url === "string" ? data.url : "/" },
  };
  if (data.tag) {
    options.tag = data.tag;
    options.renotify = true;
  }

  event.waitUntil(self.registration.showNotification(data.title || "ফজর একাডেমি", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin);
  if (target.origin !== self.location.origin) return; // only ever open this site

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin === target.origin && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target.href);
            } catch {
              /* uncontrolled tab: focusing is enough */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(target.href);
    })()
  );
});

// The browser replaced the subscription (keys expired etc.): hand the new one to the server.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const old = event.oldSubscription;
      const fresh = event.newSubscription || (old ? await self.registration.pushManager.subscribe(old.options) : null);
      if (!fresh) return;
      await fetch("/api/push", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: fresh.toJSON(), replaces: old ? old.endpoint : undefined }),
      });
    })().catch(() => {})
  );
});
