/**
 * crypto.js — Web Crypto helpers for encrypted question delivery.
 *
 * Flow:
 *   1. POST /api/start-test           -> { session_id, payload: { iv, ct } }   (AES-256-GCM)
 *   2. POST /api/session-key          -> { key }  (base64 raw key, one-shot, short TTL)
 *   3. importKey + decrypt in memory, render.
 *
 * The key is never written to localStorage/sessionStorage/IndexedDB — it lives in a
 * module-scoped Map that dies with the tab.
 */
const keyCache = new Map(); // session_id -> CryptoKey (memory only)

const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export async function importSessionKey(sessionId, rawKeyB64) {
  const key = await crypto.subtle.importKey(
    "raw", b64ToBytes(rawKeyB64), { name: "AES-GCM" }, false, ["decrypt"]
  );
  keyCache.set(sessionId, key);
  return key;
}

export async function decryptPayload(sessionId, payload) {
  const key = keyCache.get(sessionId);
  if (!key) throw new Error("No session key in memory — call importSessionKey first");
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(payload.iv) }, key, b64ToBytes(payload.ct)
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

export function dropSessionKey(sessionId) { keyCache.delete(sessionId); }
export function dropAllKeys() { keyCache.clear(); }

/**
 * loadPaper — one call that gets the whole paper decrypted.
 * After this, Q1 -> Q59 -> Q12 navigation is pure local state: no further API calls,
 * so the sequential current_index bug in /api/get-test-batch disappears entirely.
 */
export async function loadPaper(api, startOpts) {
  const started = await api.startTest(startOpts);
  if (!started.payload) return started;            // backend not yet patched -> plaintext
  const { key } = await api.sessionKey(started.session_id);
  await importSessionKey(started.session_id, key);
  const questions = await decryptPayload(started.session_id, started.payload);
  return { ...started, questions };
}
