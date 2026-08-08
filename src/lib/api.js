/**
 * api.js — single client for the FastAPI engine (themcqapp-fastapi.service, :8000).
 *
 * Auth: sends the Firebase ID token as Bearer. The backend currently validates
 * against .valid_beta_tokens.json, so until backend/firebase_auth.py is wired in,
 * set VITE_BETA_TOKEN in .env and it will be used as a fallback.
 */
import { auth } from "../firebase";

const BASE = import.meta.env.VITE_ENGINE_API_URL || "http://localhost:8000/api";
const FALLBACK_TOKEN = import.meta.env.VITE_BETA_TOKEN || "";

async function authHeader() {
  const u = auth.currentUser;
  if (u) {
    try {
      const idToken = await u.getIdToken();
      return { Authorization: `Bearer ${idToken}` };
    } catch (_) { /* fall through */ }
  }
  return FALLBACK_TOKEN ? { Authorization: `Bearer ${FALLBACK_TOKEN}` } : {};
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body || {}),
  });
  if (res.status === 401) throw new Error("AUTH_EXPIRED");
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  /** Starts a test. Returns { test_id, session_id, total_questions, payload } —
   *  payload is AES-GCM encrypted when the backend runs secure_delivery.py. */
  startTest: (opts) => post("/start-test", opts),

  /** Handshake: fetch the per-session AES key. Keep the result in memory only. */
  sessionKey: (session_id) => post("/session-key", { session_id }),

  submitTest:   (body) => post("/submit-test", body),
  saveState:    (body) => post("/save-state", body),
  getHistory:   (user_id) => post("/get-history", { user_id }),
  getRank:      (body) => post("/get-rank", body),
  getTestResult:(body) => post("/get-test-result", body),
  reportQuestion:(body) => post("/report-question", body),
};

export default api;
