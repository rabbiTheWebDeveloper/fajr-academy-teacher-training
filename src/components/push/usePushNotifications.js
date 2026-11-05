'use client';

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * This device's push-notification state for the signed-in account (server side: /api/push,
 * src/service/push-service.js; the notifications themselves are shown by public/sw.js).
 *
 * status:
 *   "loading"      still checking
 *   "on"           this device receives this account's notifications
 *   "off"          supported, not enabled (or enabled for a different account → reset)
 *   "denied"       the user blocked notifications in the browser
 *   "ios-install"  iPhone/iPad Safari tab — push only works in the app added to the Home Screen
 *   "unsupported"  this browser has no Web Push
 *   "unconfigured" the server has no VAPID keys yet
 */

const SW_URL = "/sw.js";

function base64UrlToBytes(value) {
  const padded = (value + "=".repeat((4 - (value.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function sameKey(buffer, key) {
  if (!buffer) return true; // browser doesn't expose it → assume it matches
  const a = new Uint8Array(buffer);
  const b = base64UrlToBytes(key);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

async function api(method, body, path = "/api/push") {
  const res = await fetch(path, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.success !== false, data };
}

async function detect() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return { status: isIOS() && !isStandalone() ? "ios-install" : "unsupported" };
  }
  const { ok, data } = await api("GET");
  if (!ok || !data.enabled || !data.publicKey) return { status: "unconfigured" };

  const reg = await navigator.serviceWorker.register(SW_URL, { scope: "/", updateViaCache: "none" });
  if (Notification.permission === "denied") return { status: "denied", key: data.publicKey };

  const sub = await reg.pushManager.getSubscription();
  if (!sub) return { status: "off", key: data.publicKey };

  const check = await api("PUT", { endpoint: sub.endpoint });
  if (check.ok && check.data.subscribed && sameKey(sub.options?.applicationServerKey, data.publicKey)) {
    return { status: "on", key: data.publicKey };
  }
  // Enabled earlier for another account on this device (or with an old key): start clean.
  if (check.ok) await sub.unsubscribe().catch(() => {});
  return { status: "off", key: data.publicKey };
}

export function usePushNotifications() {
  const [status, setStatus] = useState("loading");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "ok" | "error", text }
  const keyRef = useRef("");

  useEffect(() => {
    let alive = true;
    detect()
      .then((r) => {
        if (!alive) return;
        keyRef.current = r.key || "";
        setStatus(r.status);
      })
      .catch(() => alive && setStatus("unsupported"));
    return () => {
      alive = false;
    };
  }, []);

  const enable = useCallback(async () => {
    setNotice(null);
    // requestPermission must run straight from the tap (Safari ignores it otherwise).
    let permission = Notification.permission;
    try {
      if (permission === "default") permission = await Notification.requestPermission();
    } catch {
      permission = Notification.permission;
    }
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "off");
      if (permission !== "denied") setNotice({ type: "error", text: "অনুমতি দেওয়া হয়নি। আবার চেষ্টা করে “Allow” চাপুন।" });
      return;
    }

    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (sub && !sameKey(sub.options?.applicationServerKey, keyRef.current)) {
        await sub.unsubscribe().catch(() => {});
        sub = null;
      }
      if (!sub) {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(keyRef.current) });
      }
      const res = await api("POST", { subscription: sub.toJSON() });
      if (!res.ok) {
        await sub.unsubscribe().catch(() => {});
        throw new Error(res.data.message || "সার্ভারে সংরক্ষণ করা যায়নি।");
      }
      setStatus("on");
      setNotice({ type: "ok", text: "নোটিফিকেশন চালু হয়েছে। চাইলে একটি টেস্ট পাঠিয়ে দেখুন।" });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "নোটিফিকেশন চালু করা যায়নি। আবার চেষ্টা করুন।" });
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setNotice(null);
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api("DELETE", { endpoint: sub.endpoint });
        await sub.unsubscribe().catch(() => {});
      }
      setStatus("off");
      setNotice({ type: "ok", text: "এই ডিভাইসে নোটিফিকেশন বন্ধ করা হয়েছে।" });
    } catch {
      setNotice({ type: "error", text: "বন্ধ করা যায়নি। আবার চেষ্টা করুন।" });
    } finally {
      setBusy(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    setNotice(null);
    setBusy(true);
    try {
      const res = await api("POST", null, "/api/push/test");
      setNotice({ type: res.ok ? "ok" : "error", text: res.data.message || (res.ok ? "পাঠানো হয়েছে।" : "পাঠানো যায়নি।") });
    } catch {
      setNotice({ type: "error", text: "টেস্ট পাঠানো যায়নি। ইন্টারনেট সংযোগ দেখুন।" });
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, notice, enable, disable, sendTest };
}

/**
 * Call before logging out: this device stops receiving the account's notifications.
 * Never throws and never blocks the logout for long.
 */
export async function forgetPushOnThisDevice() {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager?.getSubscription();
    if (!sub) return;
    await Promise.race([
      fetch("/api/push", {
        method: "DELETE",
        cache: "no-store",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  } catch {
    /* logging out matters more */
  }
}
