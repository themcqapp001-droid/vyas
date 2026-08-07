import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Menu, X, Sun, Moon, ArrowRight, Star,
  GraduationCap, Play, BookOpen, Video, FileText,
  BarChart3, Brain, Target, ChevronRight, Quote
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  .lp-fadeup   { animation: lpFadeUp   0.65s cubic-bezier(.16,1,.3,1) both; }
  .lp-slidein  { animation: lpSlideIn  0.65s cubic-bezier(.16,1,.3,1) both; }
  .lp-float    { animation: lpFloat 3.5s ease-in-out infinite; }
  .lp-float-b  { animation: lpFloat 4s   ease-in-out infinite 0.6s; }
  .lp-float-c  { animation: lpFloat 3s   ease-in-out infinite 1.2s; }

  @keyframes lpFadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
  @keyframes lpSlideIn { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:none} }
  @keyframes lpFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

  .lp-card { transition: transform .22s ease, box-shadow .22s ease; }
  .lp-card:hover { transform: translateY(-5px); }

  .lp-nav-a { position:relative; text-decoration:none; }
  .lp-nav-a::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:2px; background:#f97316; border-radius:2px; transition:width .2s; }
  .lp-nav-a:hover::after { width:100%; }

  .lp-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; border-radius: 30px; border: none; cursor: pointer;
    background: #f97316; color: #fff;
    font-family: Poppins,sans-serif; font-weight: 700; font-size: 14px;
    box-shadow: 0 4px 20px rgba(249,115,22,.35);
    transition: transform .2s, box-shadow .2s;
  }
  .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,.45); }

  .lp-btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 26px; border-radius: 30px; border: 2px solid; cursor: pointer;
    background: transparent;
    font-family: Inter,sans-serif; font-weight: 600; font-size: 14px;
    transition: all .2s;
  }
  .lp-btn-outline:hover { background: rgba(255,255,255,.08); transform: translateY(-1px); }

  /* ---- RESPONSIVE ---- */
  @media (max-width: 900px) {
    .lp-hero-grid    { grid-template-columns: 1fr !important; }
    .lp-hero-right   { display: none !important; }
    .lp-feat-grid    { grid-template-columns: 1fr !important; }
    .lp-exam-grid    { grid-template-columns: repeat(2,1fr) !important; }
    .lp-stats-grid   { grid-template-columns: repeat(2,1fr) !important; }
    .lp-why-grid     { grid-template-columns: 1fr !important; }
    .lp-awards-grid  { grid-template-columns: 1fr !important; }
    .lp-footer-grid  { grid-template-columns: 1fr !important; }
    .lp-deskonly     { display: none !important; }
  }
  @media (min-width: 901px) {
    .lp-mobonly { display: none !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════
   THEME  — Navy+Teal palette (day) / Dark (night)
═══════════════════════════════════════════════════════════════════════ */
function useC(dark) {
  return dark ? {
    /* DARK MODE — matches dashboard screenshot */
    bg:         "#0C1220",
    bgAlt:      "#111827",
    surface:    "#1A2235",
    surfaceAlt: "#1F2C42",
    border:     "#263247",
    navBg:      "rgba(12,18,32,0.95)",
    primary:    "#f97316",
    accent:     "#3B82F6",
    teal:       "#2DD4BF",
    text:       "#E8F0FE",
    textSec:    "#8EA7C5",
    textMuted:  "#4A5E7A",
    heroBg:     "linear-gradient(145deg,#0C1220 0%,#0F1E3A 55%,#0C1220 100%)",
    orangeGlow: "rgba(249,115,22,0.12)",
    blueGlow:   "rgba(59,130,246,0.1)",
    statsBg:    "#132337",
    statsText:  "#fff",
    shadow:     "0 4px 24px rgba(0,0,0,.5)",
  } : {
    /* DAY MODE — Navy + Teal + Beige/White */
    bg:         "#FFFFFF",
    bgAlt:      "#F5F7FA",
    surface:    "#FFFFFF",
    surfaceAlt: "#EEF4FF",
    border:     "#DDEAF8",
    navBg:      "rgba(255,255,255,0.97)",
    primary:    "#f97316",
    accent:     "#1B4F8A",        /* navy */
    teal:       "#2A9D8F",        /* teal */
    text:       "#0F1E2E",
    textSec:    "#3A5C7A",
    textMuted:  "#8BA3BC",
    heroBg:     "linear-gradient(145deg,#EEF6FF 0%,#FFF8F0 60%,#EEF9F7 100%)",
    orangeGlow: "rgba(249,115,22,0.08)",
    blueGlow:   "rgba(27,79,138,0.07)",
    statsBg:    "#1B4F8A",
    statsText:  "#fff",
    shadow:     "0 4px 20px rgba(27,79,138,0.12)",
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════════ */
const EXAMS = [
  { emoji:"🏛️", label:"UPSC CSE",    sub:"Civil Services",    to:"/practice?exam=upsc",  clr:"#1B4F8A" },
  { emoji:"⚙️", label:"GATE",        sub:"Engineering Entr.",  to:"/practice?exam=gate",  clr:"#2A9D8F" },
  { emoji:"🏜️", label:"RAS / RPSC",  sub:"Rajasthan State",   to:"/ras",                 clr:"#7C3AED" },
  { emoji:"📋", label:"SSC CGL",     sub:"Staff Selection",    to:"/practice?exam=ssc",   clr:"#f97316" },
  { emoji:"🩺", label:"NEET UG",     sub:"Medical Entrance",   to:"/practice?exam=neet",  clr:"#BE185D" },
  { emoji:"🗺️", label:"State PCS",   sub:"State Civil Svcs",  to:"/practice?exam=pcs",   clr:"#0369A1" },
  { emoji:"🏦", label:"Banking",     sub:"IBPS / SBI / RBI",  to:"/practice?exam=bank",  clr:"#059669" },
  { emoji:"🎖️", label:"Defence",     sub:"NDA / CDS / AFCAT", to:"/practice?exam=def",   clr:"#1D4ED8" },
  { emoji:"📚", label:"Teaching",    sub:"CTET / REET / TET", to:"/practice?exam=teach", clr:"#9333EA" },
  { emoji:"🌍", label:"Anthro Opt.", sub:"UPSC Optional",      to:"/anthropology",        clr:"#DC2626" },
];

const AWARDS = [
  { bg:"#4CAF50", text:"#fff", title:"India's Top UPSC Platform", sub:"Trusted by aspirants nationwide", icon:"🏆" },
  { bg:"#7C3AED", text:"#fff", title:"AI-Powered Exam Prep",      sub:"Smart adaptive learning engine",   icon:"🤖" },
  { bg:"#f97316", text:"#fff", title:"36,000+ MCQs",              sub:"Bilingual questions bank",         icon:"📝" },
  { bg:"#1B4F8A", text:"#fff", title:"Anti-Piracy Notes",         sub:"100% secure PDF vault",             icon:"🔒" },
];

const NEED_FEATURES = [
  {
    big: true, orange: true,
    emoji:"📓", title:"Exam-Focused Smart Notes",
    desc:"Study concise notes with relevant content to help you prepare for exams in the best way.",
    to:"/notes",
  },
  {
    big: false, orange: false,
    emoji:"🃏", title:"Flashcards",
    desc:"Flip. Recall. Repeat. Revise important concepts in minutes.",
    to:"/practice",
  },
  {
    big: false, orange: true,
    emoji:"📚", title:"Structured Courses",
    desc:"With 1000+ curated courses follow the right order. Always know what's next.",
    to:"/courses",
  },
  {
    big: false, orange: false,
    emoji:"🎬", title:"Video Lectures",
    desc:"Learn with carefully selected videos & 250K+ notes to clear all your concepts.",
    to:"/courses",
  },
  {
    big: false, orange: false,
    emoji:"📊", title:"Test Insights",
    desc:"Deep analytics on every mock test. Know exactly what to improve.",
    to:"/dashboard",
  },
  {
    big: false, orange: true,
    emoji:"🎯", title:"MCQ Practice Bank",
    desc:"36,000+ chapter-wise bilingual MCQs with detailed explanations.",
    to:"/practice",
  },
];

const TESTIMONIALS = [
  { name:"Priya Sharma",  exam:"UPSC CSE 2025",  text:"THEMCQAPP gave me MCQs for all subjects and in-depth explanations for all topics. Cleared Prelims!" },
  { name:"Rahul Verma",   exam:"RAS 2025",        text:"The RAS-specific content is excellent. Anti-copy notes work perfectly. Best platform for Rajasthan prep." },
  { name:"Anjali Singh",  exam:"GATE 2025",        text:"GATE preparation has never been this organized. Analytics showed me exactly where I was going wrong." },
];

/* ═══════════════════════════════════════════════════════════════════════
   LOGO
═══════════════════════════════════════════════════════════════════════ */
function Logo({ dark }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{
        width:38, height:38, borderRadius:10, flexShrink:0,
        background:"linear-gradient(135deg,#3A0710,#5B0A14)",
        display:"flex", alignItems:"center", justifyContent:"center",
        border:"1px solid rgba(212,175,55,.4)",
        color:"#D4AF37", fontFamily:"Cinzel,serif", fontWeight:800, fontSize:14,
      }}>
        TM
      </div>
      <div>
        <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:19, lineHeight:1,
          color: dark ? "#E8F0FE" : "#0F1E2E" }}>
          THE<span style={{ color:"#D4AF37" }}>MCQ</span>APP
        </div>
        <div style={{ fontFamily:"Inter,sans-serif", fontSize:9, fontWeight:600, letterSpacing:1.2,
          textTransform:"uppercase", color: dark ? "#8EA7C5" : "#3A5C7A", marginTop:1 }}>
          AI Exam Platform
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const C = useC(isDarkMode);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const NAV = [
    { label:"Exams",   href:"#exams"    },
    { label:"Features",href:"#features" },
    { label:"Notes",   to:"/notes"      },
    { label:"Lectures",to:"/courses"    },
    { label:"Anthro",  to:"/anthropology" },
    { label:"RAS",     to:"/ras"        },
    { label:"About",   to:"/about"      },
  ];

  const closeMenu = () => setMenuOpen(false);

  /* ─── RENDER ─────────────────────────────────────── */
  return (
    <div style={{ fontFamily:"Inter,sans-serif", background:C.bg, color:C.text, minHeight:"100vh", overflowX:"hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ══════ BOTTOM STICKY BAR (EduRev style) ══════ */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:200,
        background: isDarkMode ? "#1B4F8A" : "#1B4F8A",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 28px",
        boxShadow:"0 -2px 12px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#f97316,#fff)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:16 }}>🎓</span>
          </div>
          <span style={{ fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:600, color:"#fff" }}>
            Start learning for free today
          </span>
        </div>
        <button
          onClick={() => navigate(user ? "/dashboard" : "/login")}
          className="lp-btn-primary"
          style={{ padding:"8px 22px", fontSize:13 }}
        >
          {user ? "Dashboard →" : "Sign up →"}
        </button>
      </div>

      {/* ══════ NAVBAR ══════ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? C.navBg : "transparent",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        transition:"all .3s ease",
        boxShadow: scrolled ? C.shadow : "none",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link to="/" style={{ textDecoration:"none" }}><Logo dark={isDarkMode} /></Link>

          {/* Desktop nav links */}
          <div className="lp-deskonly" style={{ display:"flex", alignItems:"center", gap:26 }}>
            {NAV.map(n => n.href
              ? <a key={n.label} href={n.href} className="lp-nav-a"
                  style={{ fontFamily:"Inter,sans-serif", fontSize:14, fontWeight:600, color:C.textSec }}>{n.label}</a>
              : <Link key={n.label} to={n.to} className="lp-nav-a"
                  style={{ fontFamily:"Inter,sans-serif", fontSize:14, fontWeight:600, color:C.textSec, textDecoration:"none" }}>{n.label}</Link>
            )}
          </div>

          {/* Desktop actions */}
          <div className="lp-deskonly" style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={toggleTheme} style={{
              width:36, height:36, border:`1px solid ${C.border}`, borderRadius:9,
              background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.textSec,
            }}>
              {isDarkMode ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
            {user ? (
              <button onClick={() => navigate("/dashboard")} className="lp-btn-primary">Dashboard →</button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="lp-btn-outline"
                  style={{ borderColor:C.border, color:C.text, padding:"9px 20px", fontSize:13 }}>Log In</button>
                <button onClick={() => navigate("/login")} className="lp-btn-primary" style={{ padding:"10px 22px" }}>Sign Up Free</button>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={toggleTheme} className="lp-mobonly" style={{
              width:36, height:36, border:`1px solid ${C.border}`, borderRadius:9,
              background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.textSec,
            }}>
              {isDarkMode ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
            <button onClick={() => setMenuOpen(o => !o)} style={{
              width:42, height:42, border:`1px solid ${C.border}`, borderRadius:10,
              background: menuOpen ? C.surface : "transparent", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", color:C.text,
            }} aria-label="menu">
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: C.navBg, borderTop:`1px solid ${C.border}`,
            backdropFilter:"blur(14px)", padding:"16px 24px 24px",
          }}>
            {NAV.map(n => n.href
              ? <a key={n.label} href={n.href} onClick={closeMenu}
                  style={{ display:"block", padding:"13px 0", borderBottom:`1px solid ${C.border}`,
                    fontFamily:"Inter,sans-serif", fontSize:15, fontWeight:600, color:C.text, textDecoration:"none" }}>{n.label}</a>
              : <Link key={n.label} to={n.to} onClick={closeMenu}
                  style={{ display:"block", padding:"13px 0", borderBottom:`1px solid ${C.border}`,
                    fontFamily:"Inter,sans-serif", fontSize:15, fontWeight:600, color:C.text, textDecoration:"none" }}>{n.label}</Link>
            )}
            <div style={{ paddingTop:16, display:"flex", flexDirection:"column", gap:10 }}>
              {user
                ? <button onClick={() => { closeMenu(); navigate("/dashboard"); }} className="lp-btn-primary" style={{ justifyContent:"center" }}>Dashboard →</button>
                : <>
                    <button onClick={() => { closeMenu(); navigate("/login"); }} className="lp-btn-outline"
                      style={{ borderColor:C.border, color:C.text, justifyContent:"center" }}>Log In</button>
                    <button onClick={() => { closeMenu(); navigate("/login"); }} className="lp-btn-primary" style={{ justifyContent:"center" }}>Sign Up Free</button>
                  </>
              }
            </div>
          </div>
        )}
      </nav>

      {/* ══════ HERO ══════ */}
      <section style={{
        minHeight:"100vh", paddingTop:64, background:C.heroBg,
        display:"flex", alignItems:"center", position:"relative", overflow:"hidden",
        paddingBottom:60,
      }}>
        {/* Background blobs */}
        <div style={{ position:"absolute", top:-120, right:-80, width:560, height:560, borderRadius:"50%",
          background:C.orangeGlow, filter:"blur(90px)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-100, left:-80, width:480, height:480, borderRadius:"50%",
          background:C.blueGlow, filter:"blur(80px)", pointerEvents:"none" }}/>

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", width:"100%" }}>
          <div className="lp-hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>

            {/* LEFT */}
            <div>
              {/* Award pill */}
              <div className="lp-fadeup" style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background: isDarkMode ? "rgba(249,115,22,0.15)" : "#FFF7ED",
                border:"1px solid rgba(249,115,22,0.4)", borderRadius:30,
                padding:"7px 16px", marginBottom:26,
              }}>
                <span style={{ fontSize:16 }}>🏆</span>
                <span style={{ fontFamily:"Poppins,sans-serif", fontSize:12, fontWeight:700, color:"#f97316" }}>
                  India's #1 UPSC & GATE MCQ Portal
                </span>
              </div>

              <h1 className="lp-slidein" style={{
                fontFamily:"Poppins,sans-serif", fontWeight:900,
                fontSize:"clamp(2rem,5.2vw,3.5rem)", lineHeight:1.12,
                color:C.text, marginBottom:18,
              }}>
                Study{" "}
                <span style={{
                  background:`linear-gradient(135deg,#f97316,${C.accent})`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                }}>Smarter.</span>
                <br/>Score{" "}
                <span style={{ color:"#f97316" }}>Higher.</span>
              </h1>

              <p className="lp-fadeup" style={{
                animationDelay:".12s", fontSize:16, lineHeight:1.75,
                color:C.textSec, marginBottom:30, maxWidth:480,
              }}>
                The most comprehensive exam portal for <strong>UPSC, GATE, RAS</strong> &amp; 10+ competitive exams.
                Practice 36,000+ MCQs, access protected notes, and watch video lectures — all in one place.
              </p>

              <div className="lp-fadeup" style={{ animationDelay:".22s", display:"flex", flexWrap:"wrap", gap:14, marginBottom:36 }}>
                <button onClick={() => navigate(user ? "/dashboard" : "/login")} className="lp-btn-primary" style={{ fontSize:15, padding:"14px 30px" }}>
                  <Play size={16} fill="#fff"/> Start Learning Free
                </button>
                <button onClick={() => navigate("/practice")} className="lp-btn-outline"
                  style={{ borderColor:C.border, color:C.text, fontSize:15, padding:"13px 28px" }}>
                  Browse MCQs <ArrowRight size={15}/>
                </button>
              </div>

              {/* Mini stat chips */}
              <div className="lp-fadeup" style={{ animationDelay:".32s", display:"flex", flexWrap:"wrap", gap:20 }}>
                {[
                  { v:"36,000+", l:"Questions", e:"📝" },
                  { v:"50+",     l:"Subjects",  e:"📚" },
                  { v:"4.8★",    l:"Rating",    e:"⭐" },
                  { v:"100%",    l:"Secure",    e:"🔒" },
                ].map(s => (
                  <div key={s.v} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:20 }}>{s.e}</span>
                    <div>
                      <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:16, color:C.text, lineHeight:1 }}>{s.v}</div>
                      <div style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:C.textSec, marginTop:2 }}>{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — decorative */}
            <div className="lp-hero-right" style={{ position:"relative", height:480, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {/* Outer ring */}
              <div style={{
                width:340, height:340, borderRadius:"50%",
                border:`2px dashed ${isDarkMode ? "rgba(249,115,22,0.25)" : "rgba(27,79,138,0.2)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative",
              }}>
                {/* Inner circle */}
                <div style={{
                  width:190, height:190, borderRadius:"50%",
                  background: isDarkMode ? "rgba(249,115,22,0.12)" : "#FFF7ED",
                  border:`3px solid rgba(249,115,22,0.3)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:86,
                }}>🎓</div>

                {/* Orbiting bubbles */}
                {[
                  { e:"📚", t:"5%",  l:"50%", tx:"-50%", del:0 },
                  { e:"🧠", t:"50%", l:"96%", tx:"-50%", del:0.4 },
                  { e:"🏆", t:"91%", l:"50%", tx:"-50%", del:0.8 },
                  { e:"📊", t:"50%", l:"4%",  tx:"-50%", del:1.2 },
                ].map((o,i) => (
                  <div key={i} style={{
                    position:"absolute", top:o.t, left:o.l, transform:o.tx ? `translateX(${o.tx})` : undefined,
                    width:50, height:50, borderRadius:"50%",
                    background: isDarkMode ? "#1A2235" : "#fff",
                    boxShadow:"0 4px 18px rgba(0,0,0,0.12)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:22,
                    animation:`lpFloat ${3+i*0.5}s ease-in-out infinite ${o.del}s`,
                  }}>{o.e}</div>
                ))}
              </div>

              {/* Floating achievement cards */}
              {[
                { cls:"lp-float",   style:{ top:"8%",  left:"-12%"  }, e:"🏛️", l:"UPSC Ready",  s:"3,500+ MCQs" },
                { cls:"lp-float-b", style:{ bottom:"12%", left:"-8%"  }, e:"⚙️", l:"GATE Prep",   s:"Engineering" },
                { cls:"lp-float-c", style:{ top:"18%", right:"-10%" }, e:"🏜️", l:"RAS / RPSC",  s:"Rajasthan Exam" },
                { cls:"lp-float",   style:{ bottom:"6%", right:"-5%", animationDelay:"1.5s" }, e:"🔒", l:"Secure Notes", s:"Anti-copy" },
              ].map((b,i) => (
                <div key={i} className={b.cls} style={{
                  position:"absolute", ...b.style,
                  background: isDarkMode ? "#1A2235" : "#fff",
                  border:`1px solid ${C.border}`,
                  borderRadius:14, padding:"10px 16px",
                  boxShadow:"0 8px 28px rgba(0,0,0,0.13)",
                  display:"flex", alignItems:"center", gap:10, minWidth:155,
                }}>
                  <span style={{ fontSize:22 }}>{b.e}</span>
                  <div>
                    <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13, color:C.text, lineHeight:1.2 }}>{b.l}</div>
                    <div style={{ fontFamily:"Inter,sans-serif", fontSize:10, color:C.textSec, marginTop:2 }}>{b.s}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════ STATS BAR ══════ */}
      <section style={{ background:C.statsBg, padding:"30px 24px" }}>
        <div className="lp-stats-grid" style={{
          maxWidth:960, margin:"0 auto", display:"grid",
          gridTemplateColumns:"repeat(4,1fr)", gap:16, textAlign:"center",
        }}>
          {[
            { n:"36,000+", l:"MCQ Questions",   e:"📝" },
            { n:"4.8/5",   l:"Avg. Rating",     e:"⭐" },
            { n:"50+",     l:"Subjects",         e:"📖" },
            { n:"100%",    l:"Secure Notes",     e:"🔒" },
          ].map(s => (
            <div key={s.n}>
              <div style={{ fontSize:26, marginBottom:6 }}>{s.e}</div>
              <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:22, color:C.statsText }}>{s.n}</div>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CHOOSE EXAM ══════ */}
      <section id="exams" style={{ background:C.bgAlt, padding:"80px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:700, color:"#f97316", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>
              Choose Your Exam
            </div>
            <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:"clamp(1.6rem,4vw,2.5rem)", color:C.text, marginBottom:10 }}>
              Prepare for Any Competitive Exam
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:15, color:C.textSec, maxWidth:480, margin:"0 auto" }}>
              From civil services to engineering — everything in one platform
            </p>
          </div>

          <div className="lp-exam-grid" style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
            {EXAMS.map(ex => (
              <div key={ex.label} onClick={() => navigate(ex.to)}
                className="lp-card"
                style={{
                  background: isDarkMode ? C.surface : "#fff",
                  border:`1px solid ${isDarkMode ? C.border : ex.clr + "25"}`,
                  borderRadius:16, padding:"20px 14px", cursor:"pointer", textAlign:"center",
                  boxShadow: isDarkMode ? "none" : `0 2px 14px ${ex.clr}18`,
                }}>
                <div style={{ fontSize:30, marginBottom:10 }}>{ex.emoji}</div>
                <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13, color: isDarkMode ? "#E8F0FE" : ex.clr, marginBottom:4 }}>{ex.label}</div>
                <div style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:C.textSec }}>{ex.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ EVERYTHING YOU NEED (EduRev-style) ══════ */}
      <section id="features" style={{ background:C.bg, padding:"80px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:"clamp(1.6rem,4vw,2.5rem)", color:C.text, marginBottom:10 }}>
              Everything you need for your Exam at one place
            </h2>
            <div style={{ width:60, height:3, background:"#f97316", borderRadius:4, margin:"12px auto 14px" }}/>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:15, color:C.textSec, maxWidth:520, margin:"0 auto" }}>
              Designed to help you learn faster, stay confident and be 100% exam ready.
            </p>
          </div>

          {/* Bento-style grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"auto auto", gap:16 }}>

            {/* Big card — left top */}
            <div className="lp-card" onClick={() => navigate("/notes")} style={{
              background:"#f97316", borderRadius:22, padding:"32px 28px",
              cursor:"pointer", position:"relative", overflow:"hidden", gridRow:"1/2",
              boxShadow:"0 8px 30px rgba(249,115,22,0.35)",
            }}>
              <div style={{ fontSize:44, marginBottom:16 }}>📓</div>
              <h3 style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:20, color:"#fff", marginBottom:10 }}>
                Exam-Focused Smart Notes
              </h3>
              <p style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,255,255,0.85)", lineHeight:1.65 }}>
                Study concise notes with relevant content to help you prepare for exams in the best way.
              </p>
              <div style={{ marginTop:20, fontFamily:"Poppins,sans-serif", fontSize:13, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:6 }}>
                Open Notes <ChevronRight size={14}/>
              </div>
              {/* Decorative circle */}
              <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>
              <div style={{ position:"absolute", bottom:-40, right:20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
            </div>

            {/* Right column — 2 cards stacked */}
            <div style={{ display:"flex", flexDirection:"column", gap:16, gridRow:"1/2" }}>
              {/* Video Lectures */}
              <div className="lp-card" onClick={() => navigate("/courses")} style={{
                background: isDarkMode ? C.surface : "#fff",
                border:`1px solid ${C.border}`, borderRadius:18, padding:"24px 22px", cursor:"pointer",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14,
                    background: isDarkMode ? "rgba(249,115,22,0.15)" : "#FFF7ED",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🎬</div>
                  <div>
                    <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:15, color:C.text, marginBottom:5 }}>Video Lectures</div>
                    <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:C.textSec, lineHeight:1.5 }}>
                      Learn with carefully selected 100K+ videos &amp; 250K+ notes to clear all your concepts.
                    </div>
                  </div>
                </div>
              </div>

              {/* Structured Courses */}
              <div className="lp-card" onClick={() => navigate("/courses")} style={{
                background:"#f97316", borderRadius:18, padding:"24px 22px", cursor:"pointer",
                boxShadow:"0 4px 18px rgba(249,115,22,0.3)",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ fontSize:30, flexShrink:0 }}>📚</div>
                  <div>
                    <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:15, color:"#fff", marginBottom:5 }}>Structured Courses</div>
                    <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(255,255,255,0.85)", lineHeight:1.5 }}>
                      With 1000+ curated courses follow the right order. Always know what's next.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row — 3 equal cards */}
            <div style={{ gridColumn:"1/-1", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { e:"🃏", t:"Flashcards",       d:"Flip. Recall. Repeat. Revise important concepts in minutes.",     to:"/practice", orange:false },
                { e:"📊", t:"Test Insights",    d:"Deep analytics on every test. Know exactly what to improve.",     to:"/dashboard",orange:false },
                { e:"🎯", t:"MCQ Practice Bank",d:"36,000+ chapter-wise bilingual MCQs with full explanations.",    to:"/practice", orange:true  },
              ].map(f => (
                <div key={f.t} className="lp-card" onClick={() => navigate(f.to)} style={{
                  background: f.orange ? "#f97316" : (isDarkMode ? C.surface : "#fff"),
                  border: f.orange ? "none" : `1px solid ${C.border}`,
                  borderRadius:18, padding:"22px 20px", cursor:"pointer",
                  boxShadow: f.orange ? "0 4px 18px rgba(249,115,22,0.28)" : "none",
                }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>{f.e}</div>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:14,
                    color: f.orange ? "#fff" : C.text, marginBottom:8 }}>{f.t}</div>
                  <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, lineHeight:1.6,
                    color: f.orange ? "rgba(255,255,255,0.85)" : C.textSec }}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ AWARDS & MENTIONS ══════ */}
      <section style={{ background:C.bgAlt, padding:"80px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:"clamp(1.5rem,3.5vw,2.3rem)", color:C.text, marginBottom:8 }}>
              Awards &amp; Mentions
            </h2>
            <div style={{ width:50, height:3, background:"#f97316", borderRadius:4, margin:"0 auto" }}/>
          </div>

          {/* Scrolling testimonial + award cards */}
          <div style={{ display:"flex", gap:16, overflowX:"auto", paddingBottom:8 }}>
            {/* Testimonial cards */}
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="lp-card" style={{
                background: isDarkMode ? "#1B4F8A" : "#1B4F8A",
                borderRadius:18, padding:"24px 22px", minWidth:260, flexShrink:0,
                color:"#fff",
              }}>
                <Quote size={22} color="rgba(255,255,255,0.5)" style={{ marginBottom:12 }}/>
                <p style={{ fontFamily:"Inter,sans-serif", fontSize:13, lineHeight:1.65, marginBottom:16 }}>{t.text}</p>
                <div>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13 }}>{t.name}</div>
                  <div style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{t.exam}</div>
                </div>
              </div>
            ))}

            {/* Award cards */}
            {AWARDS.map(a => (
              <div key={a.title} className="lp-card" style={{
                background:a.bg, borderRadius:18, padding:"24px 22px",
                minWidth:220, flexShrink:0, display:"flex", flexDirection:"column", gap:10,
              }}>
                <span style={{ fontSize:36 }}>{a.icon}</span>
                <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:15, color:a.text }}>{a.title}</div>
                <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color: a.text === "#fff" ? "rgba(255,255,255,0.8)" : "#555" }}>{a.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WHY LEARNED (progress preview) ══════ */}
      <section style={{ background:C.bg, padding:"80px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="lp-why-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>

            {/* Left: mock progress card */}
            <div style={{
              background: isDarkMode ? C.surface : "#fff",
              borderRadius:22, padding:"28px 28px", border:`1px solid ${C.border}`,
              boxShadow:C.shadow,
            }}>
              <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:15, color:C.text, marginBottom:6 }}>
                📊 Your Progress
              </div>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:C.textSec, marginBottom:22 }}>
                Real-time subject analytics dashboard
              </div>
              {[
                { s:"Indian Polity",   p:82, c:"#1B4F8A" },
                { s:"Ancient History", p:68, c:"#f97316"  },
                { s:"Geography",       p:74, c:"#2A9D8F"  },
                { s:"Economy",         p:55, c:"#7C3AED"  },
                { s:"Environment",     p:61, c:"#DC2626"  },
              ].map(item => (
                <div key={item.s} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:600, color:C.text }}>{item.s}</span>
                    <span style={{ fontFamily:"Poppins,sans-serif", fontSize:13, fontWeight:700, color:item.c }}>{item.p}%</span>
                  </div>
                  <div style={{ height:7, borderRadius:8, background: isDarkMode ? "#263247" : "#E5EFF8", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${item.p}%`, borderRadius:8, background:item.c }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: benefit list */}
            <div>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:700, color:"#f97316", textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>
                Why LearnEd?
              </div>
              <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:"clamp(1.4rem,3vw,2rem)", color:C.text, marginBottom:20, lineHeight:1.25 }}>
                Built for Serious Aspirants Across India
              </h2>
              {[
                { e:"🎯", t:"Chapter-wise MCQ Bank",      d:"Filter by subject, chapter, difficulty. Practice exactly what you need." },
                { e:"🔒", t:"Anti-Piracy Notes Vault",    d:"Watermarked PDFs with screenshot block and copy protection." },
                { e:"📹", t:"Video Lecture Streaming",    d:"Chapter-wise lectures with speed control and bookmarks." },
                { e:"🤖", t:"AI Recommendations",         d:"Personalized revision plans based on your weak areas." },
                { e:"📱", t:"Works on All Devices",       d:"Seamless experience on desktop, tablet, and mobile." },
              ].map(b => (
                <div key={b.t} style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18 }}>
                  <span style={{ fontSize:22, flexShrink:0, marginTop:2 }}>{b.e}</span>
                  <div>
                    <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:14, color:C.text, marginBottom:4 }}>{b.t}</div>
                    <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:C.textSec, lineHeight:1.6 }}>{b.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ DARK CTA BANNER (EduRev-style) ══════ */}
      <section style={{ padding:"60px 24px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{
          maxWidth:780, width:"100%", borderRadius:28,
          background: isDarkMode ? "#0C2444" : "#102A43",
          padding:"60px 40px", textAlign:"center",
          boxShadow:"0 20px 60px rgba(16,42,67,0.35)",
        }}>
          <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:"clamp(1.6rem,4vw,2.4rem)", color:"#fff", marginBottom:12, lineHeight:1.2 }}>
            All you need for your next exam,<br/>get it right here now
          </h2>
          <p style={{ fontFamily:"Inter,sans-serif", fontSize:15, color:"rgba(255,255,255,0.7)", marginBottom:32 }}>
            Trusted by thousands of UPSC, GATE &amp; State exam aspirants across India
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center" }}>
            <button onClick={() => navigate(user ? "/dashboard" : "/login")} className="lp-btn-primary" style={{ fontSize:15, padding:"14px 32px" }}>
              Signup for Free
            </button>
            <button onClick={() => navigate("/practice")} className="lp-btn-outline"
              style={{ borderColor:"rgba(255,255,255,0.3)", color:"#fff", padding:"13px 30px", fontSize:15 }}>
              Browse MCQs
            </button>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: isDarkMode ? "#070D19" : "#0F1E2E", padding:"60px 24px 90px", color:"rgba(255,255,255,0.65)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div className="lp-footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>

            {/* Brand */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#f97316,#1B4F8A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <GraduationCap size={18} color="#fff"/>
                </div>
                <span style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:19, color:"#fff" }}>
                  Learn<span style={{ color:"#f97316" }}>Ed</span>
                </span>
              </div>
              <p style={{ fontFamily:"Inter,sans-serif", fontSize:13, lineHeight:1.7, maxWidth:260 }}>
                LearnEd stands for Education Revolution. The most comprehensive competitive exam platform in India. Made with ❤️
              </p>
            </div>

            {/* Company */}
            <div>
              <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:12, color:"#fff", letterSpacing:1.2, textTransform:"uppercase", marginBottom:18 }}>Company</div>
              {["About Us","Courses","FAQs","Blog"].map(l => (
                <div key={l} style={{ fontFamily:"Inter,sans-serif", fontSize:13, marginBottom:12, cursor:"pointer" }}
                  onClick={() => navigate("/")}>
                  {l}
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div>
              <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:12, color:"#fff", letterSpacing:1.2, textTransform:"uppercase", marginBottom:18 }}>Quick Links</div>
              {[
                { label:"Practice Bank",  to:"/practice"     },
                { label:"Study Notes",    to:"/notes"        },
                { label:"Lecture Portal", to:"/courses"      },
                { label:"Dashboard",      to:"/dashboard"    },
                { label:"Anthro Optional",to:"/anthropology" },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ display:"block", fontFamily:"Inter,sans-serif", fontSize:13, marginBottom:12, color:"rgba(255,255,255,0.65)", textDecoration:"none" }}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:12, color:"#fff", letterSpacing:1.2, textTransform:"uppercase", marginBottom:18 }}>Contact Us</div>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, marginBottom:10 }}>Help Center</div>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, marginBottom:10, color:"#f97316" }}>support@learned.in</div>
              <div style={{ marginTop:20 }}>
                <Link to="/login" style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,255,255,0.65)", textDecoration:"none", display:"block", marginBottom:10 }}>Sign In</Link>
                <Link to="/login" style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"#f97316", textDecoration:"none", display:"block", fontWeight:600 }}>Sign Up Free →</Link>
              </div>
            </div>
          </div>

          <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:22, display:"flex", flexWrap:"wrap", justifyContent:"space-between", gap:12 }}>
            <span style={{ fontFamily:"Inter,sans-serif", fontSize:12 }}>© 2026 LearnEd. All rights reserved.</span>
            <span style={{ fontFamily:"Inter,sans-serif", fontSize:12 }}>Protected with anti-piracy technology 🔒</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
