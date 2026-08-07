import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { useTheme } from "../context/ThemeContext";

/* ═══════════════════════════════════════════════════════════
   GATE ACADEMY – Full GATE CSE themed landing page
   Green #1B6B35 / Light Green #27AE60 / Dark Navy #0D1B2A
═══════════════════════════════════════════════════════════ */

const SUBJECTS = [
  { id: "1", code: "01_Algorithms",           name: "Algorithms",                 icon: "⚡", count: 318 },
  { id: "2", code: "02_CO_and_Architecture",  name: "CO & Architecture",           icon: "🖥️", count: 228 },
  { id: "3", code: "03_Compiler_Design",      name: "Compiler Design",             icon: "🔧", count: 226 },
  { id: "4", code: "04_Computer_Networks",    name: "Computer Networks",           icon: "🌐", count: 205 },
  { id: "5", code: "05_Databases",            name: "Databases",                   icon: "🗄️", count: 268 },
  { id: "6", code: "06_Digital_Logic",        name: "Digital Logic",               icon: "💡", count: 292 },
  { id: "7", code: "07_Operating_System",     name: "Operating System",            icon: "⚙️", count: 326 },
  { id: "8", code: "08_Programming_and_DS",   name: "Programming & DS",            icon: "📊", count: 227 },
  { id: "9", code: "09_Programming_in_C",     name: "Programming in C",            icon: "💻", count: 120 },
  { id:"10", code: "10_Theory_of_Computation","name": "Theory of Computation",     icon: "🧮", count: 275 },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

  .gate-root {
    --green: #4A5568;         /* Primary Steel */
    --green-mid: #718096;     /* Light Steel */
    --green-light: #A0AEC0;   /* Muted Steel */
    --green-dark: #2D3748;    /* Dark Slate */
    --navy: #1A202C;          /* Very Dark Slate */
    --navy-mid: #2D3748;      
    --cream: #F7FAFC;         
    --bg: #EDF2F7;            /* Cool Gray bg */
    --ink: #1A202C;           
    --surface: #ffffff;
    --border: rgba(74,85,104,0.2);
    --card-shadow: 0 4px 20px rgba(0,0,0,0.04);
    --hero-grad: radial-gradient(ellipse at top, rgba(113,128,150,0.1), #EDF2F7 70%);
  }

  .dark .gate-root {
    --bg: #171923;
    --ink: #E2E8F0;
    --surface: #2D3748;
    --border: #4A5568;
    --card-shadow: 0 8px 30px rgba(0,0,0,0.3);
    --hero-grad: radial-gradient(ellipse at top, rgba(113,128,150,0.2), #171923 70%);
  }

  .gate-root *, .gate-root *::before, .gate-root *::after { box-sizing:border-box; }
  .gate-root { background:var(--bg); color:var(--ink); font-family:'Poppins',sans-serif; overflow-x:hidden; transition: background 0.3s, color 0.3s; }
  .gate-root h1,.gate-root h2,.gate-root h3,.gate-root h4 { font-family:'Cinzel',serif; }

  /* ── announcement ── */
  .gate-ann { background:linear-gradient(90deg,var(--green-dark),var(--green)); color:var(--cream); font-size:13px; padding:10px 16px; border-bottom:1px solid rgba(39,174,96,.3); }
  .gate-ann-inner { max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center; }
  .gate-badge { background:var(--green-light);color:var(--green-dark);font-weight:700;font-size:10px;padding:2px 8px;border-radius:4px;text-transform:uppercase;margin-right:8px; }

  /* ── hero ── */
  .gate-hero { position:relative;padding:64px 20px 96px; background:var(--hero-grad); border-bottom:1px solid var(--border);overflow:hidden; }
  .gate-hero-grid { display:grid;grid-template-columns:1fr;gap:48px;align-items:center;max-width:1280px;margin:0 auto; }
  @media(min-width:1024px){.gate-hero-grid{grid-template-columns:1.4fr 1fr;}}
  .gate-eyebrow { display:inline-flex;align-items:center;gap:8px;background:var(--cream);border:1px solid rgba(27,107,53,.2);padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600;color:var(--green-dark);box-shadow:0 1px 4px rgba(0,0,0,.04); }
  .gate-h1 { font-size:clamp(2.1rem,5vw,3.4rem);font-weight:700;color:var(--green);line-height:1.12;margin:20px 0; }
  .dark .gate-h1 { color:var(--cream); }
  .gate-sub { font-family:'Cinzel',serif;font-size:1.15rem;font-weight:600;color:var(--green-mid);letter-spacing:.02em;margin-bottom:16px; }
  .gate-desc { font-size:15px;color:var(--ink);opacity:0.8;max-width:640px;line-height:1.7; }
  .gate-ctas { display:flex;flex-wrap:wrap;gap:14px;margin-top:26px; }
  .gate-cta-solid { padding:14px 26px;border-radius:12px;font-weight:600;font-size:14px;background:linear-gradient(135deg,var(--green-dark),var(--green));color:white;border:1px solid rgba(39,174,96,.4);box-shadow:0 8px 20px rgba(15,76,35,.2);cursor:pointer;transition:.2s; }
  .gate-cta-solid:hover { transform:translateY(-2px); }
  .gate-cta-outline { padding:14px 26px;border-radius:12px;font-weight:600;font-size:14px;background:var(--surface);color:var(--green);border:1.5px solid var(--border);cursor:pointer;transition:.2s; }
  .gate-cta-outline:hover { background:var(--cream); }

  /* ── logo card ── */
  .gate-logo-card { display:flex;justify-content:center; }
  .gate-logo-box { position:relative;width:320px;height:320px;border-radius:32px;padding:4px;background:linear-gradient(135deg,var(--green-dark),var(--green),var(--green-mid));box-shadow:0 30px 60px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;overflow:hidden; }
  .gate-logo-img { width:90%;height:90%;object-fit:contain;background:white;border-radius:28px;padding:16px; }

  /* ── stats ── */
  .gate-stats { margin-top:64px;border:1.5px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:var(--card-shadow);display:grid;grid-template-columns:repeat(2,1fr);overflow:hidden; }
  @media(min-width:768px){.gate-stats{grid-template-columns:repeat(3,1fr);}}
  @media(min-width:1024px){.gate-stats{grid-template-columns:repeat(5,1fr);}}
  .gate-stat { padding:22px 12px;text-align:center;border-right:1.5px solid var(--border);border-bottom:1.5px solid var(--border); }
  .gate-stat-num { font-family:'Cinzel',serif;font-weight:800;font-size:1.6rem;color:var(--green);display:block; }
  .dark .gate-stat-num { color:var(--green-light); }
  .gate-stat-lbl { font-size:11px;font-weight:600;color:var(--ink);opacity:0.6;text-transform:uppercase;letter-spacing:.05em;margin-top:4px;display:block; }

  /* ── sections ── */
  .gate-section { padding:80px 20px; }
  .gate-container { max-width:1280px;margin:0 auto; }
  .gate-section-title { text-align:center;max-width:640px;margin:0 auto 48px; }
  .gate-section-title h2 { font-size:clamp(1.5rem,3vw,2.1rem);color:var(--green);font-weight:700; }
  .dark .gate-section-title h2 { color:var(--cream); }
  .gate-section-title p { font-size:14px;color:var(--ink);opacity:0.7;margin-top:10px; }
  .gate-green-line { width:64px;height:3px;background:var(--green-mid);margin:16px auto 0;border-radius:2px; }

  /* ── subject grid ── */
  .gate-subject-grid { display:grid;gap:16px;grid-template-columns:repeat(2,1fr); }
  @media(min-width:640px){.gate-subject-grid{grid-template-columns:repeat(3,1fr);}}
  @media(min-width:1024px){.gate-subject-grid{grid-template-columns:repeat(5,1fr);}}
  .gate-subj-card { background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:20px;box-shadow:var(--card-shadow);transition:.25s;cursor:pointer;text-align:center; }
  .gate-subj-card:hover,.gate-subj-card.active { border-color:var(--green-mid);box-shadow:0 12px 28px rgba(27,107,53,.15);transform:translateY(-4px);background:linear-gradient(135deg,rgba(39,174,96,.04),var(--surface)); }
  .gate-subj-card.active { border-color:var(--green);background:rgba(39,174,96,.06); }
  .gate-subj-icon { font-size:2rem;margin-bottom:10px;display:block; }
  .gate-subj-name { font-size:12px;font-weight:700;color:var(--green-dark);line-height:1.4; }
  .dark .gate-subj-name { color:var(--green-light); }
  .gate-subj-count { font-size:11px;color:var(--ink);opacity:0.5;margin-top:4px;font-weight:600; }

  /* ── question browser ── */
  .gate-qbrowser { background:var(--surface);border:1.5px solid var(--border);border-radius:20px;box-shadow:var(--card-shadow);overflow:hidden; }
  .gate-qbrowser-head { background:linear-gradient(135deg,var(--green-dark),var(--green));padding:20px 24px;color:white;display:flex;align-items:center;gap:12px;flex-wrap:wrap; }
  .gate-qbrowser-head h3 { margin:0;font-size:16px;color:white;font-family:'Poppins',sans-serif;font-weight:700; }
  .gate-filter-row { display:flex;gap:12px;flex-wrap:wrap;padding:16px 24px;border-bottom:1.5px solid var(--border);background:var(--bg);align-items:center; }
  .gate-select { padding:9px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface);color:var(--ink);font-size:13px;font-family:'Poppins',sans-serif;font-weight:600;outline:none;cursor:pointer; }
  .gate-select:focus { border-color:var(--green-mid); }
  .gate-question-grid { display:grid;grid-template-columns:1fr;gap:20px;padding:24px; }
  @media(min-width:768px){.gate-question-grid{grid-template-columns:repeat(2,1fr);}}
  @media(min-width:1200px){.gate-question-grid{grid-template-columns:repeat(3,1fr);}}
  .gate-q-card { background:var(--surface);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow);transition:.2s; }
  .gate-q-card:hover { border-color:var(--green-mid);box-shadow:0 12px 24px rgba(27,107,53,.1); }
  .gate-q-img { width:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;overflow:hidden;border-bottom:1px solid var(--border);max-height:280px; }
  .gate-q-img img { width:100%;height:auto;display:block;object-fit:contain; }
  .gate-q-body { padding:14px; }
  .gate-q-id { font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--green);background:rgba(39,174,96,.1);padding:3px 8px;border-radius:6px;display:inline-block; }
  .gate-q-tags { display:flex;flex-wrap:wrap;gap:4px;margin-top:8px; }
  .gate-q-tag { font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px;background:rgba(27,107,53,.07);color:var(--green-dark);border:1px solid rgba(27,107,53,.15); }
  .dark .gate-q-tag { background:rgba(39,174,96,.1);color:var(--green-light); }
  .gate-ans-row { display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--border); }
  .gate-ans-btn { font-size:11px;font-weight:700;padding:7px 14px;border-radius:8px;background:linear-gradient(135deg,var(--green-dark),var(--green));color:white;border:none;cursor:pointer;transition:.15s; }
  .gate-ans-btn:hover { transform:scale(1.03); }
  .gate-ans-reveal { font-size:13px;font-weight:800;color:white;background:linear-gradient(135deg,var(--green),var(--green-mid));padding:4px 12px;border-radius:8px;font-family:'JetBrains Mono',monospace; }
  .gate-q-pagination { display:flex;align-items:center;justify-content:center;gap:12px;padding:20px;border-top:1px solid var(--border); }
  .gate-pg-btn { padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;border:1.5px solid var(--border);background:var(--surface);color:var(--ink);cursor:pointer;transition:.15s; }
  .gate-pg-btn:hover:not(:disabled) { border-color:var(--green-mid);color:var(--green); }
  .gate-pg-btn:disabled { opacity:0.35;cursor:not-allowed; }
  .gate-pg-info { font-size:13px;font-weight:600;color:var(--ink);opacity:0.7; }
  .gate-loading { text-align:center;padding:48px;color:var(--ink);opacity:0.5;font-size:15px; }

  /* ── features ── */
  .gate-feat-grid { display:grid;gap:20px;grid-template-columns:1fr; }
  @media(min-width:640px){.gate-feat-grid{grid-template-columns:1fr 1fr;}}
  @media(min-width:1024px){.gate-feat-grid{grid-template-columns:repeat(3,1fr);}}
  .gate-feat-card { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--card-shadow);transition:.25s; }
  .gate-feat-card:hover { border-color:var(--green-mid);box-shadow:0 12px 28px rgba(27,107,53,.08);transform:translateY(-4px); }
  .gate-feat-icon { height:44px;width:44px;border-radius:12px;background:rgba(39,174,96,.08);color:var(--green);border:1px solid rgba(39,174,96,.2);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px; }
  .gate-feat-card h3 { font-size:15px;font-weight:700;color:var(--green-dark);margin:0 0 8px;font-family:'Poppins',sans-serif; }
  .dark .gate-feat-card h3 { color:var(--green-light); }
  .gate-feat-card p { font-size:13px;color:var(--ink);opacity:0.75;line-height:1.6;margin:0; }

  /* ── dark section ── */
  .gate-dark-section { background:linear-gradient(135deg,var(--green-dark),var(--navy));padding:80px 20px;color:white; }
  .gate-dark-section h2 { color:white; }

  /* ── performance widget ── */
  .gate-perf-grid { display:grid;grid-template-columns:1fr;gap:20px; }
  @media(min-width:768px){.gate-perf-grid{grid-template-columns:repeat(2,1fr);}}
  @media(min-width:1200px){.gate-perf-grid{grid-template-columns:repeat(4,1fr);}}
  .gate-perf-card { background:var(--surface);border:1.5px solid var(--border);border-radius:20px;padding:24px;box-shadow:var(--card-shadow); }
  .gate-perf-card h4 { font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--green-mid);margin:0 0 16px;font-family:'Poppins',sans-serif; }
  .gate-prog-row { margin-bottom:12px; }
  .gate-prog-lbl { display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--ink);margin-bottom:5px; }
  .gate-prog-bar { background:rgba(27,107,53,.07);height:6px;border-radius:99px;overflow:hidden; }
  .gate-prog-fill { height:100%;border-radius:99px;background:linear-gradient(90deg,var(--green-dark),var(--green-mid)); }

  /* ── syllabus ── */
  .gate-syl-grid { display:grid;grid-template-columns:1fr;gap:20px; }
  @media(min-width:768px){.gate-syl-grid{grid-template-columns:1fr 1fr;}}
  .gate-syl-card { background:var(--surface);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow); }
  .gate-syl-head { background:linear-gradient(135deg,var(--green-dark),var(--green));padding:18px 20px;color:white; }
  .gate-syl-head h3 { margin:0;font-size:16px;color:white;font-family:'Poppins',sans-serif; }
  .gate-syl-body { padding:20px; }
  .gate-syl-item { display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--ink);margin-bottom:10px;line-height:1.5; }
  .gate-syl-item::before { content:"✓";color:var(--green-mid);font-weight:800;flex-shrink:0;margin-top:1px; }

  /* ── footer ── */
  .gate-footer { background:var(--navy);color:rgba(255,255,255,.65);padding:64px 20px 32px;border-top:1px solid rgba(39,174,96,.2); }
  .gate-footer-grid { display:grid;grid-template-columns:1fr;gap:36px;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:44px;max-width:1280px;margin:0 auto; }
  @media(min-width:768px){.gate-footer-grid{grid-template-columns:2fr 1fr 1fr 1fr;}}
  .gate-footer-grid h5 { font-family:'Poppins',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--green-mid);margin-bottom:14px; }
  .gate-footer-grid ul { list-style:none;padding:0;margin:0;font-size:12px; }
  .gate-footer-grid ul li { margin-bottom:10px; }
  .gate-footer-grid ul li a { color:inherit;text-decoration:none; }
  .gate-footer-grid ul li a:hover { color:#fff; }
  .gate-footer-bottom { max-width:1280px;margin:24px auto 0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:12px;color:rgba(255,255,255,.35); }

  /* ── fade up ── */
  .gate-fade { opacity:0;transform:translateY(16px);transition:opacity .6s ease, transform .6s ease; }
  .gate-fade.in { opacity:1;transform:translateY(0); }
`;

// ── STAT COUNTER HOOK ─────────────────────────────
function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s = null;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) s = requestAnimationFrame(tick);
    };
    s = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s);
  }, [target, duration, start]);
  return val;
}

function StatCell({ target, label, suffix = "", noBorder = false }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const val = useCountUp(target, 1800, started);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const display = target >= 1000
    ? val >= 1000000 ? (val / 1000000).toFixed(1) + "M+" : val >= 1000 ? (val / 1000).toFixed(0) + "K+" : val + suffix
    : val + suffix;
  return (
    <div className="gate-stat" ref={ref} style={{ borderRight: noBorder ? "none" : undefined }}>
      <span className="gate-stat-num">{display}</span>
      <span className="gate-stat-lbl">{label}</span>
    </div>
  );
}

function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div className="gate-fade" ref={ref} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

// ── MAIN COMPONENT ─────────────────────────────────
export default function GateAcademy() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Question Browser state
  const [allQuestions, setAllQuestions] = useState([]);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("1");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [page, setPage] = useState(1);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const PER_PAGE = 9;

  // Load metadata.csv on mount
  useEffect(() => {
    fetch("/gate_metadata.csv")
      .then(r => r.text())
      .then(text => {
        const lines = text.trim().split("\n").slice(1); // skip header
        const parsed = lines.map(line => {
          const parts = line.split(",");
          const question = parts[0]?.trim().replace(/\r/g, "");
          const answer = parts[1]?.trim().replace(/\r/g, "");
          const tags = parts.slice(2).join(",").trim().replace(/\r/g, "");
          return { question, answer, tags };
        }).filter(q => q.question);
        setAllQuestions(parsed);
        setMetaLoaded(true);
      })
      .catch(err => console.error("Failed to load metadata:", err));
  }, []);

  // Filter by selected subject
  const subjectQuestions = allQuestions.filter(q => {
    const first = q.question.split(".")[0];
    return first === selectedSubject;
  });

  // Get unique topics (X.Y) for dropdown
  const topics = ["all", ...new Set(subjectQuestions.map(q => {
    const parts = q.question.split(".");
    return parts.slice(0, 2).join(".");
  }))];

  // Filter by topic
  const filteredQuestions = selectedTopic === "all"
    ? subjectQuestions
    : subjectQuestions.filter(q => q.question.startsWith(selectedTopic + "."));

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / PER_PAGE);
  const pageQuestions = filteredQuestions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSubjectChange = (id) => {
    setSelectedSubject(id);
    setSelectedTopic("all");
    setPage(1);
    setRevealedAnswers({});
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setPage(1);
    setRevealedAnswers({});
  };

  const toggleAnswer = (qId) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const getImagePath = (questionId) => {
    const subjectId = questionId.split(".")[0];
    const subject = SUBJECTS.find(s => s.id === subjectId);
    if (!subject) return null;
    return `https://pub-fc39930145d64fc797cab2a71d18e283.r2.dev/${subject.code}/${questionId}.png`;
  };

  const getTagList = (tagStr) => {
    if (!tagStr) return [];
    return tagStr.split(/\s{2,}|\s+/).filter(Boolean).slice(0, 4);
  };

  return (
    <AppLayout title="GATE Academy">
      <div className="gate-root">
        <style>{CSS}</style>

        {/* ANNOUNCEMENT BAR */}
        <div className="gate-ann">
          <div className="gate-ann-inner">
            <div><span className="gate-badge">New</span>🎯 GATE CSE 2025 • 2485 Questions • Subject-wise Practice • Year-wise PYQs</div>
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              <a href="#question-browser" style={{ textDecoration:"underline", fontWeight:600 }}>Practice Now</a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" style={{ background:"rgba(255,255,255,.1)", padding:"4px 10px", borderRadius:6, fontSize:11 }}>Join Telegram</a>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className="gate-hero" id="home">
          <div className="gate-hero-grid">
            <div>
              <span className="gate-eyebrow">⚡ India's Most Comprehensive GATE CSE PYQ Bank</span>
              <h1 className="gate-h1">
                India's{" "}
                <span style={{ background:"linear-gradient(135deg,#27AE60,#1B6B35)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  Smartest GATE
                </span>
                {" "}CSE Preparation Platform
              </h1>
              <p className="gate-sub">"Master Every Topic. Ace Every Year."</p>
              <p className="gate-desc">
                Access 2485 image-based Previous Year Questions across 10 subjects, organized topic-wise from GATE 1987 to GATE 2024. Every question has its answer and tags — the most complete GATE CSE PYQ library available.
              </p>
              <div className="gate-ctas">
                <button className="gate-cta-solid" onClick={() => { document.getElementById("question-browser")?.scrollIntoView({ behavior:"smooth" }); }}>🚀 Start Practicing</button>
                <button className="gate-cta-outline" onClick={() => navigate("/gate-quiz")}>🧠 AI MCQ Generator</button>
              </div>
            </div>

            <div className="gate-logo-card">
              <div className="gate-logo-box">
                <img src="/gate_logo.png" alt="GATE Exams Logo" className="gate-logo-img" onError={(e) => { e.target.style.display="none"; }} />
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{ maxWidth:1280, margin:"0 auto" }}>
            <div className="gate-stats">
              <StatCell target={2485}  label="PYQ Questions" />
              <StatCell target={10}    label="Subjects" />
              <StatCell target={37}    label="Years Covered" suffix="+" />
              <StatCell target={150}   label="Topics" suffix="+" />
              <StatCell target={100}   label="Free Access" suffix="%" noBorder />
            </div>
          </div>
        </section>

        {/* SUBJECT BROWSER */}
        <section className="gate-section" style={{ background: isDarkMode ? "#0C1A10" : "#F8FDF9", borderBottom:`1px solid ${isDarkMode ? "#1A4028" : "rgba(27,107,53,.1)"}` }}>
          <div className="gate-container">
            <FadeUp>
              <div className="gate-section-title">
                <span style={{ color:"#27AE60", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>10 Core Subjects</span>
                <h2>Choose Your Subject</h2>
                <p>Browse 2485 PYQs organized subject-wise. Click any subject to start practicing.</p>
                <div className="gate-green-line"></div>
              </div>
            </FadeUp>

            <FadeUp delay={100}>
              <div className="gate-subject-grid">
                {SUBJECTS.map(s => (
                  <div
                    key={s.id}
                    className={`gate-subj-card ${selectedSubject === s.id ? "active" : ""}`}
                    onClick={() => { handleSubjectChange(s.id); document.getElementById("question-browser")?.scrollIntoView({ behavior:"smooth" }); }}
                  >
                    <span className="gate-subj-icon">{s.icon}</span>
                    <div className="gate-subj-name">{s.name}</div>
                    <div className="gate-subj-count">{s.count} Questions</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* QUESTION BROWSER */}
        <section className="gate-section" id="question-browser">
          <div className="gate-container">
            <FadeUp>
              <div className="gate-section-title">
                <span style={{ color:"#27AE60", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>GATE PYQ Browser</span>
                <h2>Image-Based Question Practice</h2>
                <p>High-quality scanned questions with answers and tags. Click "Show Answer" to reveal.</p>
                <div className="gate-green-line"></div>
              </div>
            </FadeUp>

            <FadeUp delay={100}>
              <div className="gate-qbrowser">
                <div className="gate-qbrowser-head">
                  <span style={{ fontSize:"1.3rem" }}>{SUBJECTS.find(s => s.id === selectedSubject)?.icon}</span>
                  <h3>{SUBJECTS.find(s => s.id === selectedSubject)?.name} — {filteredQuestions.length} Questions</h3>
                </div>

                <div className="gate-filter-row">
                  <label style={{ fontSize:13, fontWeight:700, color:"var(--ink)", opacity:0.7 }}>Subject:</label>
                  <select className="gate-select" value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)}>
                    {SUBJECTS.map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name} ({s.count})</option>
                    ))}
                  </select>

                  <label style={{ fontSize:13, fontWeight:700, color:"var(--ink)", opacity:0.7 }}>Topic:</label>
                  <select className="gate-select" value={selectedTopic} onChange={handleTopicChange}>
                    <option value="all">All Topics ({subjectQuestions.length})</option>
                    {topics.filter(t => t !== "all").map(t => (
                      <option key={t} value={t}>Topic {t} ({subjectQuestions.filter(q => q.question.startsWith(t + ".")).length})</option>
                    ))}
                  </select>
                </div>

                {!metaLoaded ? (
                  <div className="gate-loading">⏳ Loading questions...</div>
                ) : pageQuestions.length === 0 ? (
                  <div className="gate-loading">No questions found for this filter.</div>
                ) : (
                  <div className="gate-question-grid">
                    {pageQuestions.map((q, idx) => {
                      const imgPath = getImagePath(q.question);
                      const tags = getTagList(q.tags);
                      const revealed = revealedAnswers[q.question];
                      return (
                        <div key={q.question} className="gate-q-card">
                          <div className="gate-q-img">
                            {imgPath ? (
                              <img
                                src={imgPath}
                                alt={`Question ${q.question}`}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.parentElement.innerHTML = `<div style="padding:24px;text-align:center;color:#666;font-size:12px;">📷 Image not available<br/><small>${q.question}</small></div>`;
                                }}
                              />
                            ) : (
                              <div style={{ padding:24, textAlign:"center", color:"#666", fontSize:12 }}>No image</div>
                            )}
                          </div>
                          <div className="gate-q-body">
                            <span className="gate-q-id">{q.question}</span>
                            {tags.length > 0 && (
                              <div className="gate-q-tags">
                                {tags.map((tag, ti) => (
                                  <span key={ti} className="gate-q-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                            <div className="gate-ans-row">
                              {revealed ? (
                                <span className="gate-ans-reveal">✓ {q.answer || "N/A"}</span>
                              ) : (
                                <button className="gate-ans-btn" onClick={() => toggleAnswer(q.question)}>
                                  Show Answer
                                </button>
                              )}
                              {revealed && (
                                <button
                                  onClick={() => toggleAnswer(q.question)}
                                  style={{ fontSize:11, background:"none", border:"none", color:"var(--ink)", opacity:0.5, cursor:"pointer" }}
                                >
                                  Hide
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="gate-q-pagination">
                    <button className="gate-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span className="gate-pg-info">Page {page} of {totalPages} · {filteredQuestions.length} questions</span>
                    <button className="gate-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* FEATURES */}
        <section className="gate-section" style={{ background: isDarkMode ? "#0C1A10" : "#F8FDF9" }}>
          <div className="gate-container">
            <FadeUp>
              <div className="gate-section-title">
                <span style={{ color:"#27AE60", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>Platform Features</span>
                <h2>Why GATE Academy?</h2>
                <div className="gate-green-line"></div>
              </div>
            </FadeUp>
            <div className="gate-feat-grid">
              {[
                { icon:"🖼️", title:"Image-Based PYQs", desc:"Every question as a high-quality cropped image from the original GATE paper. No typos, no OCR errors — exactly as it appeared in the exam." },
                { icon:"🏷️", title:"Rich Tags & Metadata", desc:"Each question tagged with GATE year, subject, topic, difficulty, and type (MCQ/NAT/MSQ). Filter and search with precision." },
                { icon:"✅", title:"Verified Answer Keys", desc:"Answers extracted directly from the official answer key table of volume2.pdf. 100% accurate, cross-verified." },
                { icon:"📚", title:"Year-wise Practice", desc:"Questions from GATE 1987 to GATE 2024 — 37+ years of PYQs organized in one place for comprehensive preparation." },
                { icon:"⚡", title:"Topic-wise Filtering", desc:"Deep dive into specific topics like Dijkstra's Algorithm, SQL, Process Scheduling, or Turing Machines." },
                { icon:"🧠", title:"AI MCQ Generator", desc:"Our AI can generate new practice questions similar to GATE style based on any topic you need to strengthen." },
              ].map((f, i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="gate-feat-card">
                    <div className="gate-feat-icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* PERFORMANCE DASHBOARD */}
        <section className="gate-section">
          <div className="gate-container">
            <FadeUp>
              <div className="gate-section-title">
                <span style={{ color:"#27AE60", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>Preparation Analytics</span>
                <h2>GATE CSE Coverage Map</h2>
                <p>See how well our question bank covers the official GATE CSE syllabus.</p>
                <div className="gate-green-line"></div>
              </div>
            </FadeUp>
            <FadeUp delay={100}>
              <div className="gate-perf-grid">
                <div className="gate-perf-card">
                  <h4>Core CS Subjects</h4>
                  {[["Algorithms",95],["Data Structures",92],["Operating System",97],["DBMS",90]].map(([s,p]) => (
                    <div key={s} className="gate-prog-row">
                      <div className="gate-prog-lbl"><span>{s}</span><span>{p}%</span></div>
                      <div className="gate-prog-bar"><div className="gate-prog-fill" style={{ width:`${p}%` }}></div></div>
                    </div>
                  ))}
                </div>
                <div className="gate-perf-card">
                  <h4>Theory & Math</h4>
                  {[["Theory of Computation",98],["Discrete Math",85],["Digital Logic",94],["Compiler Design",91]].map(([s,p]) => (
                    <div key={s} className="gate-prog-row">
                      <div className="gate-prog-lbl"><span>{s}</span><span>{p}%</span></div>
                      <div className="gate-prog-bar"><div className="gate-prog-fill" style={{ width:`${p}%` }}></div></div>
                    </div>
                  ))}
                </div>
                <div className="gate-perf-card">
                  <h4>Systems</h4>
                  {[["Computer Networks",93],["CO & Architecture",96],["Programming in C",88],["Programming & DS",89]].map(([s,p]) => (
                    <div key={s} className="gate-prog-row">
                      <div className="gate-prog-lbl"><span>{s}</span><span>{p}%</span></div>
                      <div className="gate-prog-bar"><div className="gate-prog-fill" style={{ width:`${p}%` }}></div></div>
                    </div>
                  ))}
                </div>
                <div className="gate-perf-card">
                  <h4>Quick Stats</h4>
                  <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:8 }}>
                    {[["📅 Years Covered","1987–2024"],["❓ Total Questions","2,485"],["📝 Subjects","10"],["🏷️ Unique Tags","200+"]].map(([k,v]) => (
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, color:"var(--ink)", paddingBottom:10, borderBottom:"1px solid var(--border)" }}>
                        <span style={{ opacity:0.7 }}>{k}</span>
                        <span style={{ color:"var(--green-dark)", fontWeight:800 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SYLLABUS */}
        <section className="gate-section" style={{ background: isDarkMode ? "#0C1A10" : "#F8FDF9" }}>
          <div className="gate-container">
            <FadeUp>
              <div className="gate-section-title">
                <h2>Official GATE CSE Syllabus</h2>
                <p>Our question bank is fully aligned with the official GATE CSE syllabus.</p>
                <div className="gate-green-line"></div>
              </div>
            </FadeUp>
            <div className="gate-syl-grid">
              <div className="gate-syl-card">
                <div className="gate-syl-head"><h3>⚡ Core Programming & Theory</h3></div>
                <div className="gate-syl-body">
                  {["Algorithms: Searching, Sorting, Dynamic Programming, Graph Algorithms","Data Structures: Arrays, Trees, Heaps, Graphs, Hashing","Theory of Computation: Automata, Grammars, Decidability","Programming in C: Pointers, Recursion, Memory Management","Compiler Design: Parsing, Code Generation, Optimization"].map(s => (
                    <div key={s} className="gate-syl-item">{s}</div>
                  ))}
                </div>
              </div>
              <div className="gate-syl-card">
                <div className="gate-syl-head"><h3>🖥️ Systems & Networks</h3></div>
                <div className="gate-syl-body">
                  {["Operating System: Scheduling, Memory Management, Deadlocks, File Systems","Computer Networks: TCP/IP, Routing, Congestion Control, Security","CO & Architecture: Pipelining, Cache, Addressing, IO","Digital Logic: Boolean Algebra, Combinational & Sequential Circuits","Databases: SQL, ER Model, Normalization, Transactions"].map(s => (
                    <div key={s} className="gate-syl-item">{s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA DARK SECTION */}
        <section className="gate-dark-section">
          <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
            <FadeUp>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,3vw,2.2rem)", marginBottom:16 }}>Ready to Crack GATE CSE?</h2>
              <p style={{ fontSize:15, opacity:0.75, lineHeight:1.7, marginBottom:28 }}>
                Start with 2485 previous year questions, practice topic by topic, and use our AI generator to fill any gaps. The most complete GATE CSE practice platform.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <button
                  onClick={() => { document.getElementById("question-browser")?.scrollIntoView({ behavior:"smooth" }); }}
                  style={{ padding:"14px 28px", borderRadius:12, fontWeight:700, fontSize:14, background:"white", color:"var(--green-dark)", border:"none", cursor:"pointer" }}
                >
                  Browse All Questions
                </button>
                <button
                  onClick={() => navigate("/gate-quiz")}
                  style={{ padding:"14px 28px", borderRadius:12, fontWeight:700, fontSize:14, background:"rgba(255,255,255,.1)", color:"white", border:"1px solid rgba(255,255,255,.2)", cursor:"pointer" }}
                >
                  Try AI Generator
                </button>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="gate-footer">
          <div className="gate-footer-grid">
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <img src="/gate_logo.png" alt="GATE" style={{ height:44, width:44, objectFit:"contain", background:"white", borderRadius:8, padding:4 }} onError={e => e.target.style.display="none"} />
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontWeight:700, color:"white", fontSize:15 }}>GATE Academy</div>
                  <div style={{ fontSize:10, letterSpacing:".1em", color:"rgba(255,255,255,.4)", textTransform:"uppercase" }}>by TheMCQApp</div>
                </div>
              </div>
              <p style={{ fontSize:13, lineHeight:1.7, margin:0 }}>India's most complete GATE CSE PYQ practice platform — 2485 questions, 10 subjects, 37+ years.</p>
            </div>
            <div>
              <h5>Quick Links</h5>
              <ul>
                <li><a href="#question-browser">Practice Questions</a></li>
                <li><a href="#home">Home</a></li>
                <li onClick={() => navigate("/gate-quiz")} style={{ cursor:"pointer" }}><a>AI Generator</a></li>
              </ul>
            </div>
            <div>
              <h5>Subjects</h5>
              <ul>
                {SUBJECTS.slice(0,5).map(s => (
                  <li key={s.id} onClick={() => handleSubjectChange(s.id)} style={{ cursor:"pointer" }}><a>{s.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5>More</h5>
              <ul>
                {SUBJECTS.slice(5).map(s => (
                  <li key={s.id} onClick={() => handleSubjectChange(s.id)} style={{ cursor:"pointer" }}><a>{s.name}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="gate-footer-bottom">
            <span>© 2026 GATE Academy by TheMCQApp. All rights reserved.</span>
            <span>Graduate Aptitude Test in Engineering</span>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
