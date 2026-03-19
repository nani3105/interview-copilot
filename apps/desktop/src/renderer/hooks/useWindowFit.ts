import { useEffect, useRef } from 'react'

type ElectronAPI = { setWindowSize?: (w: number, h: number) => void }

function getAPI(): ElectronAPI {
  return ((window as unknown as Record<string, unknown>).electronAPI as ElectronAPI) ?? {}
}

/**
 * Attaches a ResizeObserver to the returned ref element and resizes the
 * Electron window to match the element's scroll height whenever it changes.
 */
export function useWindowFit(width = 460) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const api = getAPI()

    function sync() {
      if (!el) return
      api.setWindowSize?.(width, el.scrollHeight)
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])

  return ref
}
