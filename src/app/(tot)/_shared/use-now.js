"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onTick) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
// The server (and the hydration pass) has no clock — callers render a neutral state.
const getServerSnapshot = () => null;

/** Current time in ms, ticking every second; null during SSR / hydration. */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
