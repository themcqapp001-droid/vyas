import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import VyasUI from './App.jsx'

// Must match the API base App.jsx uses.
const API_BASE = import.meta.env.VITE_API_BASE || ''

/**
 * WHY THIS WRAPPER EXISTS
 * -----------------------
 * App.jsx renders the History button only when `token` is truthy:
 *     {token && ( <button>...History...</button> )}
 * but main.jsx never passed a `token` prop and nothing read one from
 * localStorage, so `token` was permanently "" and the button was dead code
 * that could never appear for anyone, on any device. It was not a rendering
 * glitch — auth was simply never wired up on the frontend.
 *
 * Rather than put a signup wall in front of every student, we mint a
 * per-device identity: generate a UUID once, keep it in localStorage, exchange
 * it for a normal JWT at /api/auth/device. Submissions are then recorded
 * against a real user row, so /api/submissions returns this device's past jobs
 * and the History button both appears and works.
 *
 * When you add a real login screen, store its token as "vyas_token" and this
 * wrapper will prefer it over the device identity.
 */
function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function Root() {
  const [token, setToken] = useState(() => localStorage.getItem('vyas_token') || '')

  useEffect(() => {
    if (token) return
    let cancelled = false

    let deviceId = localStorage.getItem('vyas_device_id')
    if (!deviceId) {
      deviceId = uuid()
      localStorage.setItem('vyas_device_id', deviceId)
    }

    ;(async () => {
      try {
        const body = new FormData()
        body.append('device_id', deviceId)
        const res = await fetch(`${API_BASE}/api/auth/device`, { method: 'POST', body })
        if (!res.ok) throw new Error(`device auth ${res.status}`)
        const data = await res.json()
        if (!cancelled && data.token) {
          localStorage.setItem('vyas_token', data.token)
          setToken(data.token)
        }
      } catch (err) {
        // Degrade gracefully: evaluation works fully without a token,
        // only History is unavailable.
        console.warn('[vyas] device token unavailable, history disabled:', err)
      }
    })()

    return () => { cancelled = true }
  }, [token])

  return <VyasUI token={token} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
