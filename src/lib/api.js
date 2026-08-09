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
