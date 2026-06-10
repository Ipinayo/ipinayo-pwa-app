import { useCallback, useSyncExternalStore } from "react"

/**
 * Generic media-query hook. Returns `undefined` until mounted (via the server
 * snapshot) so callers can avoid hydration mismatches — render nothing or a
 * neutral state on first paint, then the real match on the client.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = globalThis.window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(
    () => globalThis.window.matchMedia(query).matches,
    [query],
  )

  const getServerSnapshot = (): boolean | undefined => undefined

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
