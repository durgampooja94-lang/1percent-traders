// lib/device.ts
const DEVICE_ID_KEY = 'device_id'
const SESSION_ID_KEY = 'session_id'

/** Stable per-browser identifier, persisted in localStorage. */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SESSION_ID_KEY)
}

function setSessionId(id: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_ID_KEY, id)
}

/**
 * Registers this device/browser as the account's sole active session.
 * Call only on explicit sign-in — never on token refresh/page reload.
 */
export async function establishSession(token: string): Promise<void> {
  const deviceId = getDeviceId()
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ deviceId }),
  })
  if (res.ok) {
    const data = await res.json()
    setSessionId(data.sessionId)
  }
}
