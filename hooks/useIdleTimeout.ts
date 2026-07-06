'use client'
import { useEffect, useRef } from 'react'

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

/** Signs the user out after a period of inactivity. Pass `enabled: false` to disable (e.g. logged out). */
export function useIdleTimeout(onIdle: () => void, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!enabled) return

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onIdle, IDLE_TIMEOUT_MS)
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer))
    }
  }, [enabled, onIdle])
}
