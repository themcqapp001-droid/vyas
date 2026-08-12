const API = import.meta.env.VITE_API_BASE || "";
export const API_BASE = API;
export function setToken(t){ window.__VYAS_TOKEN__ = t || ""; }
export function authHeader(){
  const t = window.__VYAS_TOKEN__ || localStorage.getItem("vyas_token") || "";
  return t ? { Authorization: `Bearer ${t}` } : {};
}
export async function api(path, opts = {}){
  const r = await fetch(API + path, { ...opts, headers: { ...(opts.headers || {}), ...authHeader() } });
  if (!r.ok){ let m; try { m = (await r.json()).detail; } catch(e){} throw new Error(m || `HTTP ${r.status}`); }
  return r.json();
}

/**
 * Turn a stored pdf_url ("/results/VY-xxxx_evaluated.pdf") into a link the
 * browser can actually open.
 *
 * THE BUG THIS FIXES
 * ------------------
 * The UI used to link straight at `${API_BASE}${pdf_url}`. That endpoint
 * requires authentication, and a link opened in a new tab cannot carry an
 * Authorization header — so every student who clicked "Marked copy" got
 * {"error":"Sign in to view this copy."} while being perfectly signed in.
 *
 * The backend now issues a short-lived signature scoped to one file and one
 * account. This asks for it. If the call fails for any reason we still return
 * a usable URL rather than nothing, so the worst case is the old behaviour
 * instead of a dead button.
 */
export async function resultLink(pdfUrl) {
  if (!pdfUrl) return null;
  const name = String(pdfUrl).split("/").pop().split("?")[0];
  try {
    const { url } = await api(`/api/results/${encodeURIComponent(name)}/link`);
    return `${API_BASE}${url}`;
  } catch (e) {
    return `${API_BASE}${pdfUrl}`;
  }
}

/** Open a marked copy in a new tab, fetching a fresh signature first. */
export async function openResult(pdfUrl) {
  // The tab is opened synchronously, before the await, or Safari and most
  // mobile browsers block it as a popup not tied to the user's tap.
  const tab = window.open("", "_blank");
  const url = await resultLink(pdfUrl);
  if (!url) { if (tab) tab.close(); return; }
  if (tab) tab.location.href = url;
  else window.location.href = url;
}
