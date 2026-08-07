import React, { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "./AppLayout";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";

/* ─────────────────────────────────────────────────────────────────
   VYAS EVALUATOR — AI Answer Sheet Evaluator
   Auth: uses the main site's Firebase login — no separate login needed.
   API:  connects to mini_vyas Flask backend (VITE_VYAS_API_URL).
───────────────────────────────────────────────────────────────── */

const VYAS_API = import.meta.env.VITE_VYAS_API_URL || "http://localhost:8000/api/v1";

/** Get a fresh Firebase ID token; returns null if not signed in. */
async function getFirebaseToken() {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken(/* forceRefresh */ false);
  } catch {
    return null;
  }
}

async function vyasRequest(path, opts = {}, token = null) {
  const headers = { ...(opts.headers || {}) };
  // Auto-attach Firebase token if no token was explicitly supplied
  const tok = token || (await getFirebaseToken());
  if (tok) headers["Authorization"] = `Bearer ${tok}`;
  if (opts.json) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.json);
    delete opts.json;
  }
  const res = await fetch(VYAS_API + path, { ...opts, headers });
  const data = res.headers.get("content-type")?.includes("application/json")
    ? await res.json()
    : null;
  if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
  return data;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Poppins:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .vyas-root {
    --gold: #D4AF37;
    --gold-dark: #B8912A;
    --gold-soft: rgba(212,175,55,0.15);
    --maroon: #7A1F2B;
    --maroon-dark: #5C1A22;
    --maroon-faint: rgba(122,31,43,0.08);
    --cream: #FFF7E8;
    --bg: #FBF1E1;
    --surface: #FFFFFF;
    --border: rgba(212,175,55,0.25);
    --border-strong: rgba(212,175,55,0.45);
    --ink: #2C2C2A;
    --ink-soft: #6B6560;
    --ink-muted: #9C9690;
    --green: #2E6B42;
    --green-bg: #EDF7F1;
    --red: #B91C1C;
    --red-bg: #FEF2F2;
    --shadow-sm: 0 2px 8px rgba(44,44,42,0.06);
    --shadow-md: 0 8px 24px rgba(44,44,42,0.10);
    --shadow-lg: 0 20px 48px rgba(44,44,42,0.14);
    --radius: 16px;
    --radius-sm: 10px;
  }
  .dark .vyas-root {
    --bg: #0C1220;
    --surface: #111827;
    --border: rgba(212,175,55,0.18);
    --border-strong: rgba(212,175,55,0.35);
    --ink: #E8F0FE;
    --ink-soft: #9AA4B8;
    --ink-muted: #5B6678;
    --cream: #1C2233;
  }
  .vyas-root *, .vyas-root *::before, .vyas-root *::after { box-sizing:border-box; margin:0; padding:0; }
  .vyas-root { font-family:'Poppins',sans-serif; background:var(--bg); color:var(--ink); min-height:100vh; transition:background 0.3s,color 0.3s; }

  .vyas-hero { background:linear-gradient(135deg,var(--maroon-dark) 0%,var(--maroon) 50%,#3A0710 100%); padding:48px 24px 56px; text-align:center; position:relative; overflow:hidden; }
  .vyas-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 30% 50%,rgba(212,175,55,0.12),transparent 60%),radial-gradient(ellipse at 70% 50%,rgba(212,175,55,0.08),transparent 60%); }
  .vyas-hero-inner { position:relative; max-width:640px; margin:0 auto; }
  .vyas-eyebrow { display:inline-flex; align-items:center; gap:8px; background:rgba(212,175,55,0.18); border:1px solid rgba(212,175,55,0.4); color:var(--gold); font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; padding:6px 16px; border-radius:999px; margin-bottom:18px; }
  .vyas-hero h1 { font-family:'Cinzel',serif; font-size:clamp(1.8rem,4vw,2.8rem); font-weight:800; color:var(--gold); line-height:1.1; margin-bottom:12px; }
  .vyas-hero p { color:rgba(255,247,232,0.75); font-size:15px; line-height:1.7; }
  .vyas-modules { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:24px; }
  .vyas-module-badge { background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); color:rgba(255,247,232,0.85); font-size:11px; font-weight:600; padding:4px 12px; border-radius:999px; }

  .vyas-body { max-width:1280px; margin:0 auto; padding:32px 24px 64px; }
  .vyas-cols { display:grid; grid-template-columns:300px 1fr; gap:24px; }
  @media(max-width:900px){.vyas-cols{grid-template-columns:1fr;}}

  .vyas-panel { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm); }
  .vyas-panel-title { font-family:'Cinzel',serif; font-size:13px; font-weight:700; color:var(--maroon); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:16px; padding-bottom:10px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }

  .vyas-auth-wrap { max-width:420px; margin:48px auto; }
  .vyas-auth-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:36px; box-shadow:var(--shadow-md); }
  .vyas-auth-title { font-family:'Cinzel',serif; font-size:1.5rem; color:var(--maroon); font-weight:700; margin-bottom:6px; }
  .vyas-auth-sub { font-size:13px; color:var(--ink-soft); margin-bottom:28px; }
  .vyas-field { margin-bottom:16px; }
  .vyas-field label { font-size:12px; font-weight:600; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:6px; }
  .vyas-input { width:100%; padding:12px 16px; border:1.5px solid var(--border); border-radius:var(--radius-sm); font-family:'Poppins',sans-serif; font-size:14px; background:var(--bg); color:var(--ink); outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .vyas-input:focus { border-color:var(--maroon); box-shadow:0 0 0 3px var(--maroon-faint); }

  .vyas-btn { display:inline-flex; align-items:center; gap:8px; justify-content:center; padding:12px 24px; border-radius:var(--radius-sm); font-family:'Poppins',sans-serif; font-size:14px; font-weight:600; cursor:pointer; border:none; outline:none; transition:all 0.2s; width:100%; }
  .vyas-btn-primary { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon)); color:var(--cream); box-shadow:0 4px 12px rgba(91,10,20,0.25); }
  .vyas-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 20px rgba(91,10,20,0.3); }
  .vyas-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
  .vyas-btn-ghost { background:transparent; color:var(--maroon); border:1.5px solid var(--border); }
  .vyas-btn-ghost:hover { background:var(--maroon-faint); border-color:var(--maroon); }
  .vyas-btn-sm { padding:8px 16px; font-size:13px; width:auto; }
  .vyas-btn-danger { background:var(--red-bg); color:var(--red); border:1px solid rgba(185,28,28,0.2); }

  .vyas-auth-toggle { text-align:center; margin-top:20px; font-size:13px; color:var(--ink-soft); }
  .vyas-auth-toggle button { background:none; border:none; color:var(--maroon); font-weight:600; cursor:pointer; font-size:13px; text-decoration:underline; }

  .vyas-drop-zone { border:2px dashed var(--border-strong); border-radius:var(--radius); padding:40px 24px; text-align:center; cursor:pointer; transition:all 0.25s; background:var(--bg); }
  .vyas-drop-zone.active,.vyas-drop-zone:hover { border-color:var(--maroon); background:var(--maroon-faint); }
  .vyas-drop-icon { font-size:2.5rem; margin-bottom:12px; display:block; }
  .vyas-drop-title { font-weight:600; color:var(--ink); font-size:15px; margin-bottom:6px; }
  .vyas-drop-sub { font-size:13px; color:var(--ink-soft); }
  .vyas-file-name { background:var(--gold-soft); border:1px solid var(--border-strong); border-radius:var(--radius-sm); padding:10px 16px; font-size:13px; font-family:'IBM Plex Mono',monospace; color:var(--maroon-dark); margin-top:14px; display:flex; align-items:center; gap:8px; }

  .vyas-pipeline { display:flex; flex-direction:column; gap:10px; margin:20px 0; }
  .vyas-step { display:flex; align-items:center; gap:14px; padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:14px; font-weight:600; transition:all 0.3s; }
  .vyas-step.waiting { background:var(--bg); color:var(--ink-muted); }
  .vyas-step.running { background:var(--gold-soft); border-color:var(--gold-dark); color:var(--ink); }
  .vyas-step.done { background:var(--green-bg); border-color:rgba(46,107,66,0.3); color:var(--green); }
  .vyas-step.error { background:var(--red-bg); border-color:rgba(185,28,28,0.2); color:var(--red); }
  .vyas-step-icon { font-size:1.1rem; flex-shrink:0; width:24px; text-align:center; }
  .vyas-spinner { width:18px; height:18px; border:2.5px solid rgba(212,175,55,0.3); border-top-color:var(--gold-dark); border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0; }
  @keyframes spin{to{transform:rotate(360deg);}}

  .vyas-history { display:flex; flex-direction:column; gap:8px; max-height:360px; overflow-y:auto; }
  .vyas-history-item { padding:12px 14px; border-radius:var(--radius-sm); border:1px solid var(--border); cursor:pointer; transition:all 0.2s; background:var(--bg); }
  .vyas-history-item:hover { border-color:var(--maroon); background:var(--maroon-faint); }
  .vyas-history-item.active { border-color:var(--gold-dark); background:var(--gold-soft); }
  .vyas-history-name { font-size:13px; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .vyas-history-meta { font-size:11px; color:var(--ink-soft); margin-top:3px; }
  .vyas-status-pill { display:inline-block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; padding:2px 8px; border-radius:999px; float:right; }
  .vyas-status-pill.completed { background:var(--green-bg); color:var(--green); }
  .vyas-status-pill.pending { background:var(--gold-soft); color:var(--gold-dark); }
  .vyas-status-pill.failed { background:var(--red-bg); color:var(--red); }

  .vyas-report { display:flex; flex-direction:column; gap:20px; }
  .vyas-score-hero { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon)); border-radius:var(--radius); padding:28px 32px; display:flex; justify-content:space-between; align-items:center; color:var(--cream); flex-wrap:wrap; gap:16px; }
  .vyas-score-label { font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,247,232,0.65); margin-bottom:6px; }
  .vyas-score-num { font-family:'Cinzel',serif; font-size:3.5rem; font-weight:800; color:var(--gold); line-height:1; }
  .vyas-score-denom { font-size:1.3rem; color:rgba(255,247,232,0.6); margin-left:4px; }
  .vyas-confidence { background:rgba(212,175,55,0.2); border:1px solid rgba(212,175,55,0.4); border-radius:var(--radius-sm); padding:12px 20px; text-align:center; }
  .vyas-conf-val { font-family:'Cinzel',serif; font-size:2rem; font-weight:700; color:var(--gold); }
  .vyas-conf-label { font-size:11px; color:rgba(255,247,232,0.6); text-transform:uppercase; letter-spacing:0.1em; }

  .vyas-qchips { display:flex; flex-wrap:wrap; gap:8px; }
  .vyas-qchip { padding:6px 14px; border-radius:999px; border:1.5px solid var(--border); font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; background:var(--bg); color:var(--ink-soft); }
  .vyas-qchip.active { background:var(--maroon); color:var(--cream); border-color:var(--maroon); }
  .vyas-qchip:hover:not(.active) { border-color:var(--maroon); color:var(--maroon); }

  .vyas-dims { display:flex; flex-direction:column; gap:14px; }
  .vyas-dim-row { display:grid; grid-template-columns:130px 1fr 48px; gap:12px; align-items:center; }
  .vyas-dim-name { font-size:13px; font-weight:700; color:var(--ink); }
  .vyas-dim-track { background:rgba(212,175,55,0.15); border-radius:999px; height:8px; overflow:hidden; }
  .vyas-dim-fill { height:100%; border-radius:999px; background:linear-gradient(90deg,var(--gold-dark),var(--gold)); transition:width 0.8s cubic-bezier(0.25,0.46,0.45,0.94); }
  .vyas-dim-val { font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:600; color:var(--gold-dark); text-align:right; }

  .vyas-comment { background:var(--gold-soft); border-left:4px solid var(--gold-dark); border-radius:0 var(--radius-sm) var(--radius-sm) 0; padding:16px 20px; font-style:italic; font-size:14px; font-weight:600; line-height:1.7; color:var(--ink); }
  .vyas-notes-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:600px){.vyas-notes-grid{grid-template-columns:1fr;}}
  .vyas-notes-col { padding:16px; border-radius:var(--radius-sm); }
  .vyas-notes-col.strengths { background:var(--green-bg); border:1px solid rgba(46,107,66,0.2); }
  .vyas-notes-col.weaknesses { background:var(--red-bg); border:1px solid rgba(185,28,28,0.15); }
  .vyas-notes-col h4 { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; }
  .vyas-notes-col.strengths h4 { color:var(--green); }
  .vyas-notes-col.weaknesses h4 { color:var(--red); }
  .vyas-note-line { font-size:13px; font-weight:600; padding:6px 0; border-bottom:1px solid rgba(0,0,0,0.06); line-height:1.5; }
  .vyas-note-line::before { content:'• '; font-weight:700; }

  .vyas-pdf-actions { display:flex; gap:12px; flex-wrap:wrap; }
  .vyas-pdf-frame { width:100%; height:600px; border:1px solid var(--border); border-radius:var(--radius-sm); margin-top:16px; display:none; }
  .vyas-pdf-frame.visible { display:block; }

  .vyas-toast { position:fixed; bottom:28px; right:28px; z-index:9999; background:var(--maroon-dark); color:var(--cream); padding:14px 22px; border-radius:var(--radius-sm); font-size:14px; font-weight:500; box-shadow:var(--shadow-lg); transform:translateY(100px); opacity:0; transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1); max-width:360px; }
  .vyas-toast.show { transform:translateY(0); opacity:1; }
  .vyas-toast.error { background:var(--red); }

  .vyas-empty { text-align:center; padding:60px 24px; color:var(--ink-muted); }
  .vyas-empty-icon { font-size:3rem; margin-bottom:16px; display:block; }
  .vyas-empty h3 { font-family:'Cinzel',serif; font-size:1.2rem; color:var(--ink-soft); margin-bottom:8px; }
  .vyas-empty p { font-size:14px; line-height:1.6; }

  .vyas-server-banner { background:var(--red-bg); border:1px solid rgba(185,28,28,0.25); border-radius:var(--radius-sm); padding:14px 20px; margin-bottom:20px; font-size:13px; color:var(--red); display:flex; gap:10px; align-items:flex-start; }
  .vyas-divider { height:1px; background:var(--border); margin:20px 0; }
  .vyas-user-chip { display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--gold-soft); border:1px solid var(--border-strong); border-radius:var(--radius-sm); margin-bottom:16px; }
  .vyas-user-avatar { width:32px; height:32px; border-radius:50%; background:var(--maroon); color:var(--gold); display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-weight:700; font-size:13px; flex-shrink:0; }
  .vyas-user-name { font-size:13px; font-weight:600; color:var(--ink); }
  .vyas-user-role { font-size:11px; color:var(--ink-soft); }
  .vyas-upload-meta { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:0; }
  .vyas-select { padding:10px 14px; border:1.5px solid var(--border); border-radius:var(--radius-sm); font-family:'Poppins',sans-serif; font-size:13px; background:var(--bg); color:var(--ink); outline:none; width:100%; }
  .vyas-select:focus { border-color:var(--maroon); }
  .vyas-hidden { display:none; }
  .vyas-meta-label { font-size:11px; font-weight:600; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:5px; }
`;

const PIPELINE_STEPS = [
  { id: "upload",   label: "Uploading PDF",             icon: "📤" },
  { id: "evaluate", label: "AI Reading & Evaluating",   icon: "🧠" },
  { id: "annotate", label: "Generating Red-Ink PDF",    icon: "✍️" },
];

export default function VyasEvaluator() {
  const { user: firebaseUser, loading: fbLoading } = useAuth();

  // view: "loading" | "need-login" | "main"
  const [view, setView]             = useState("loading");
  const [user, setUser]             = useState(null);
  const [serverOk, setServerOk]     = useState(null);

  const [uploads, setUploads]             = useState([]);
  const [activeUpload, setActiveUpload]   = useState(null);
  const [questions, setQuestions]         = useState([]);
  const [activeQId, setActiveQId]         = useState(null);
  const [report, setReport]               = useState(null);

  const [pipelineSteps, setPipelineSteps] = useState(() =>
    PIPELINE_STEPS.map(s => ({ ...s, status: "waiting" }))
  );
  const [pipelineRunning, setPipelineRunning] = useState(false);

  const [pendingFile, setPendingFile]   = useState(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [subject, setSubject]           = useState("Polity");
  const [exam, setExam]                 = useState("RAS");
  const fileInputRef                    = useRef();

  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfVisible, setPdfVisible] = useState(false);

  const [toast, setToast] = useState({ msg: "", error: false, show: false });
  const toastTimerRef     = useRef();

  // History tab
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("evaluate"); // "evaluate" | "history"

  const showToast = useCallback((msg, error = false) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, error, show: true });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  // ── Server health check ─────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${VYAS_API}/health`, { signal: AbortSignal.timeout(3000) })
      .then(r => setServerOk(r.ok))
      .catch(() => setServerOk(false));
  }, []);

  // ── Firebase auth → auto-login to mini_vyas ─────────────────────────────
  // When the user is logged in to the main site (Firebase), we get their ID
  // token and pass it to mini_vyas — no separate login needed.
  useEffect(() => {
    if (fbLoading) return;
    if (!firebaseUser) {
      setView("need-login");
      return;
    }
    // User is logged in — use their Firebase token
    firebaseUser.getIdToken().then(idToken => {
      vyasRequest("/auth/me", {}, idToken)
        .then(u => {
          setUser(u);
          setView("main");
          loadUploads();
        })
        .catch(err => {
          showToast(`Auth Error: ${err.message}`, true);
          setView("main"); // still show main UI so uploads work if server is up
        });
    }).catch(() => setView("need-login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, fbLoading]);

  const setStep = (id, status) =>
    setPipelineSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));

  async function loadUploads() {
    try {
      const data = await vyasRequest("/upload");
      setUploads(Array.isArray(data) ? data : []);
    } catch (e) { showToast(e.message, true); }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await vyasRequest("/history");
      setHistoryItems(Array.isArray(data) ? data : []);
    } catch (e) { showToast(e.message, true); }
    finally { setHistoryLoading(false); }
  }

  function handleFile(f) {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are accepted", true); return;
    }
    setPendingFile(f);
    setPdfBlobUrl(null); setPdfVisible(false);
  }

  async function runPipeline() {
    if (!pendingFile) return;
    setPipelineRunning(true);
    setPipelineSteps(PIPELINE_STEPS.map(s => ({ ...s, status: "waiting" })));
    setPdfBlobUrl(null); setPdfVisible(false);
    let uploadId;
    try {
      setStep("upload", "running");
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append("subject", subject);
      fd.append("exam", exam);
      const upData = await vyasRequest("/upload", { method: "POST", body: fd });
      uploadId = upData.upload_id;
      setStep("upload", "done");

      setStep("evaluate", "running");
      await vyasRequest(`/evaluate/upload/${uploadId}`, { method: "POST" });
      setStep("evaluate", "done");

      setStep("annotate", "running");
      await new Promise(r => setTimeout(r, 400));
      setStep("annotate", "done");

      showToast("Evaluation complete! Red ink report ready. ✅");
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadUploads();
      await handleSelectUpload(uploadId);
    } catch (err) {
      const running = pipelineSteps.find(s => s.status === "running");
      if (running) setStep(running.id, "error");
      showToast(err.message, true);
    } finally {
      setPipelineRunning(false);
    }
  }

  async function handleSelectUpload(uploadId) {
    try {
      const upData = await vyasRequest(`/upload/${uploadId}`);
      setActiveUpload(upData);
      setUploads(prev => prev.map(u => u.upload_id === uploadId ? upData : u));
      const qs = await vyasRequest(`/document/${uploadId}/questions`);
      const qArr = Array.isArray(qs) ? qs : [];
      setQuestions(qArr);
      if (qArr.length) handleSelectQuestion(qArr[0].question_id, qArr);
      else setReport(null);
    } catch (err) { showToast(err.message, true); }
  }

  async function handleSelectQuestion(qId, qs = questions) {
    setActiveQId(qId);
    try {
      const ev = await vyasRequest(`/evaluate/question/${qId}`);
      setReport({ ev, q: (qs || questions).find(x => x.question_id === qId) || {} });
    } catch (err) {
      setReport({ ev: null, q: {}, error: err.message });
    }
  }

  async function toggleAnnotatedPdf() {
    if (pdfVisible) { setPdfVisible(false); return; }
    try {
      const tok = await getFirebaseToken();
      const res = await fetch(
        `${VYAS_API}/evaluate/upload/${activeUpload.upload_id}/annotated-pdf`,
        { headers: tok ? { Authorization: `Bearer ${tok}` } : {} }
      );
      if (!res.ok) throw new Error("Could not fetch annotated PDF");
      const blob = await res.blob();
      setPdfBlobUrl(URL.createObjectURL(blob));
      setPdfVisible(true);
    } catch (err) { showToast(err.message, true); }
  }

  async function downloadPdf() {
    try {
      const res = await fetch(
        `${VYAS_API}/evaluate/upload/${activeUpload.upload_id}/annotated-pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `evaluated_${activeUpload.filename}`;
      a.click();
    } catch (err) { showToast(err.message, true); }
  }

  // ── RENDERS ────────────────────────────────────────────────────────

  /** Shown when the user is not signed in to the main site. */
  const renderNeedLogin = () => (
    <div className="vyas-auth-wrap">
      <div className="vyas-auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
        <div className="vyas-auth-title">Login Required</div>
        <div className="vyas-auth-sub" style={{ marginBottom: 28 }}>
          Please sign in to RAS Academy to use the VYAS AI Evaluator.
          Your existing account gives you instant access — no separate login needed.
        </div>
        <a href="/login"
          className="vyas-btn vyas-btn-primary"
          style={{ display: "inline-flex", textDecoration: "none" }}
        >
          Sign In to RAS Academy →
        </a>
      </div>
    </div>
  );

  /** Loading spinner while Firebase auth resolves. */
  const renderLoading = () => (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div className="vyas-spinner" style={{ width: 36, height: 36, borderWidth: 4, margin: "0 auto 16px" }} />
      <div style={{ color: "var(--ink-soft)", fontSize: 14 }}>Connecting…</div>
    </div>
  );


  const renderReport = () => {
    if (!report) return (
      <div className="vyas-empty">
        <span className="vyas-empty-icon">📋</span>
        <h3>No Upload Selected</h3>
        <p>Upload a PDF answer sheet or select one from history to view the Examiner Report.</p>
      </div>
    );
    if (report.error) return (
      <div className="vyas-empty">
        <span className="vyas-empty-icon">⚠️</span>
        <h3>Not Evaluated Yet</h3>
        <p style={{ color: "var(--red)" }}>{report.error}</p>
      </div>
    );
    const { ev, q } = report;
    const dims = [
      { label: "Content",      val: ev.content_score      || 0 },
      { label: "Analysis",     val: ev.analysis_score     || 0 },
      { label: "Presentation", val: ev.presentation_score || 0 },
      { label: "Language",     val: ev.language_score     || 0 },
    ];
    return (
      <div className="vyas-report">
        <div className="vyas-score-hero">
          <div>
            <div className="vyas-score-label">📝 Predicted Score</div>
            <div>
              <span className="vyas-score-num">{ev.predicted_marks}</span>
              <span className="vyas-score-denom">/ {q.marks || "?"}</span>
            </div>
            {q.question_text && (
              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75, maxWidth: 380, lineHeight: 1.5 }}>
                Q: {q.question_text.slice(0, 120)}{q.question_text.length > 120 ? "…" : ""}
              </div>
            )}
          </div>
          <div className="vyas-confidence">
            <div className="vyas-conf-val">{(ev.confidence || 0).toFixed(0)}%</div>
            <div className="vyas-conf-label">Confidence</div>
          </div>
        </div>

        {questions.length > 1 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Questions in this upload
            </div>
            <div className="vyas-qchips">
              {questions.map(qq => (
                <button key={qq.question_id}
                  className={`vyas-qchip${qq.question_id === activeQId ? " active" : ""}`}
                  onClick={() => handleSelectQuestion(qq.question_id)}>
                  Q{qq.question_number || "?"} · {qq.marks}m
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="vyas-panel">
          <div className="vyas-panel-title">📊 Dimension Scores</div>
          <div className="vyas-dims">
            {dims.map(d => (
              <div key={d.label} className="vyas-dim-row">
                <div className="vyas-dim-name">{d.label}</div>
                <div className="vyas-dim-track">
                  <div className="vyas-dim-fill" style={{ width: `${Math.max(d.val, 2)}%` }}></div>
                </div>
                <div className="vyas-dim-val">{d.val.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>

        {ev.overall_comment && (
          <div className="vyas-comment">"{ev.overall_comment}"</div>
        )}

        <div className="vyas-notes-grid">
          <div className="vyas-notes-col strengths">
            <h4>✅ Strengths</h4>
            {(ev.strengths || []).length > 0
              ? ev.strengths.map((s, i) => <div key={i} className="vyas-note-line">{s}</div>)
              : <div style={{ fontSize: 13, opacity: 0.6 }}>None flagged.</div>}
          </div>
          <div className="vyas-notes-col weaknesses">
            <h4>⚠️ Needs Work</h4>
            {(ev.weaknesses || []).length > 0
              ? ev.weaknesses.map((s, i) => <div key={i} className="vyas-note-line">{s}</div>)
              : <div style={{ fontSize: 13, opacity: 0.6 }}>None flagged.</div>}
          </div>
        </div>

        {activeUpload?.evaluation_status === "completed" && (
          <div>
            <div className="vyas-pdf-actions">
              <button className="vyas-btn vyas-btn-ghost vyas-btn-sm" onClick={toggleAnnotatedPdf}>
                {pdfVisible ? "🙈 Hide PDF" : "👁️ View Annotated PDF"}
              </button>
              <button className="vyas-btn vyas-btn-ghost vyas-btn-sm" onClick={downloadPdf}>
                ⬇️ Download
              </button>
            </div>
            {pdfBlobUrl && (
              <iframe className={`vyas-pdf-frame${pdfVisible ? " visible" : ""}`}
                src={pdfBlobUrl} title="Annotated Answer Sheet" />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMain = () => (
    <div className="vyas-body">
      {serverOk === false && (
        <div className="vyas-server-banner">
          <span>🔴</span>
          <span>
            <strong>mini_vyas backend not running</strong> — Open a terminal, go to the <code>mini_vyas/</code> folder and run: <code>pip install -r requirements.txt && python run.py</code>. The server must be on <strong>port 8000</strong>.
          </span>
        </div>
      )}
      <div className="vyas-cols">
        {/* LEFT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {user && (
            <div className="vyas-panel" style={{ padding: 16 }}>
              <div className="vyas-user-chip">
                <div className="vyas-user-avatar">
                  {firebaseUser?.photoURL
                    ? <img src={firebaseUser.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                    : (user.first_name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div className="vyas-user-name">{user.first_name} {user.last_name}</div>
                  <div className="vyas-user-role">{user.email}</div>
                </div>
              </div>
              <button className="vyas-btn vyas-btn-ghost vyas-btn-sm"
                style={{ width: "100%", marginTop: 4 }}
                onClick={() => { import("../firebase").then(m => m.auth.signOut()); }}
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="vyas-panel">
            <div className="vyas-panel-title">📤 Upload Answer Sheet</div>
            <div
              className={`vyas-drop-zone${isDragging ? " active" : ""}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="vyas-drop-icon">📄</span>
              <div className="vyas-drop-title">Drop PDF here</div>
              <div className="vyas-drop-sub">or click to browse</div>
              <input ref={fileInputRef} type="file" accept=".pdf" className="vyas-hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {pendingFile && (
              <div className="vyas-file-name">📎 {pendingFile.name}</div>
            )}

            <div className="vyas-divider" />

            <div className="vyas-upload-meta">
              <div>
                <span className="vyas-meta-label">Subject</span>
                <select className="vyas-select" value={subject} onChange={e => setSubject(e.target.value)}>
                  {["Polity","History","Geography","Economics","Science","Anthropology","General Studies"].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="vyas-meta-label">Exam</span>
                <select className="vyas-select" value={exam} onChange={e => setExam(e.target.value)}>
                  {["RAS","UPSC","RAS Mains","UPSC Mains","State PCS"].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="vyas-btn vyas-btn-primary"
              style={{ marginTop: 16 }}
              onClick={runPipeline}
              disabled={!pendingFile || pipelineRunning}
            >
              {pipelineRunning
                ? <><div className="vyas-spinner"></div>Processing…</>
                : "🚀 Upload & Evaluate"}
            </button>

            {pipelineSteps.some(s => s.status !== "waiting") && (
              <>
                <div className="vyas-divider" />
                <div className="vyas-pipeline">
                  {pipelineSteps.map(step => (
                    <div key={step.id} className={`vyas-step ${step.status}`}>
                      {step.status === "running"
                        ? <div className="vyas-spinner"></div>
                        : <span className="vyas-step-icon">
                            {step.status === "done" ? "✅" : step.status === "error" ? "❌" : step.icon}
                          </span>}
                      {step.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {uploads.length > 0 && (
            <div className="vyas-panel">
              <div className="vyas-panel-title">📂 Upload History ({uploads.length})</div>
              <div className="vyas-history">
                {uploads.map(u => (
                  <div
                    key={u.upload_id}
                    className={`vyas-history-item${activeUpload?.upload_id === u.upload_id ? " active" : ""}`}
                    onClick={() => handleSelectUpload(u.upload_id)}
                  >
                    <span className={`vyas-status-pill ${u.evaluation_status || "pending"}`}>
                      {u.evaluation_status || "pending"}
                    </span>
                    <div className="vyas-history-name">{u.filename}</div>
                    <div className="vyas-history-meta">{u.subject} · {u.pages} pg</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: REPORT */}
        <div className="vyas-panel">
          <div className="vyas-panel-title">🧠 Examiner Report</div>
          {renderReport()}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <style>{CSS}</style>
      <div className="vyas-root">
        <div className="vyas-hero">
          <div className="vyas-hero-inner">
            <div className="vyas-eyebrow">⚖️ VYAS AI · Examiner System</div>
            <h1>AI Answer Sheet<br />Evaluator</h1>
            <p>Upload your written answer PDF. AI reads it, detects questions, scores dimension-by-dimension, and returns a red-ink annotated PDF — like a real examiner.</p>
            <div className="vyas-modules">
              {["OCR Engine","Document Intelligence","Examiner Brain","Red Ink PDF","RBAC Auth","Decision Engine"].map(m => (
                <span key={m} className="vyas-module-badge">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {view === "loading" && renderLoading()}
        {view === "need-login" && renderNeedLogin()}
        {view === "main" && renderMain()}

        <div className={`vyas-toast${toast.show ? " show" : ""}${toast.error ? " error" : ""}`}>
          {toast.msg}
        </div>
      </div>
    </AppLayout>
  );
}
