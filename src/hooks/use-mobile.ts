import * as React from "react"

// Below this width the panels switch to the app layout (bottom tab bar + slide-in menu).
// 1024 rather than shadcn's stock 768, so tablets in portrait get the app layout too instead of
// a permanent 16rem sidebar squeezing the content. Keep in sync with the `lg:` classes in
// src/components/panel/PanelShell.jsx and the 1023px media queries in panel-theme.css.
const MOBILE_BREAKPOINT = 1024
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

export function useIsMobile() {
  // The server (and the first client render) assume desktop; the real value follows right after.
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
