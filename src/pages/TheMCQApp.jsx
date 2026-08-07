import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  Menu, X, ArrowRight, Sparkles, Check, RefreshCw, Bookmark, RotateCcw,
  Trophy, BarChart3, FileText, Layers, TrendingUp, ChevronRight, ChevronLeft, Mail,
  Phone, Moon, Sun, GraduationCap, Presentation, Building2, HeartHandshake,
  Wand2, MessageCircleHeart, ScrollText, CalendarClock, Gavel, Target,
  Home, LayoutDashboard, BrainCircuit, BookOpen, Video, User, History,
  Settings, ShieldCheck, Info, LogIn, LogOut, ChevronDown
} from "lucide-react";

/* ---------------------------------------------------------
   THE MCQ APP — Professional Homepage (Dark Mode + Sidebar)
--------------------------------------------------------- */

const FONT_ID = "mcq-maroon-gold-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ---------- Color Palettes ---------- */
const LIGHT = {
  dark: false,
  bg: "#FBF1E1",
  bgAlt: "#FFFFFF",
  card: "#FFFFFF",
  header: "#FFFFFF",
  maroon: "#7A1F2B",
  maroonDark: "#5C1A22",
  maroonSoft: "#F5E6D3",
  gold: "#D4AF37",
  goldDeep: "#B8912A",
  goldSoft: "#E8C158",
  ink: "#2C2C2A",
  inkSoft: "#5F5E5A",
  inkMuted: "#8A7A6C",
  border: "#EDE0C8",
  announceBg: "#5C1A22",
  sidebarBg: "#FFFFFF",
  sidebarBorder: "#EDE0C8",
  navText: "#3D3D3A",
};
const DARK = {
  dark: true,
  bg: "#1A1015",
  bgAlt: "#121212",
  card: "#1F1417",
  header: "#2B0F14",
  maroon: "#9A2F3D",
  maroonDark: "#2B0F14",
  maroonSoft: "#2A1417",
  gold: "#E8B923",
  goldDeep: "#D4AF37",
  goldSoft: "rgba(212,175,55,0.15)",
  ink: "#F5E9D9",
  inkSoft: "#C9BBA8",
  inkMuted: "#8A7A6C",
  border: "rgba(212,175,55,0.25)",
  announceBg: "#1F0A0D",
  sidebarBg: "#1F1417",
  sidebarBorder: "rgba(212,175,55,0.2)",
  navText: "#B8A99A",
};

const SERIF = { fontFamily: "Cinzel, serif" };
const HEAD = { fontFamily: "Poppins, sans-serif" };

/* ---------- Logo — uses /logo.png ---------- */
function Logo({ size = 40 }) {
  return (
    <div className="rounded-[22%] flex items-center justify-center shrink-0" style={{ width: size, height: size, background: "#3D0A0D", overflow: "hidden" }}>
      <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span style="color:#C9A227;font-size:'+Math.round(size*0.32)+'px;font-weight:800;font-family:Cinzel,serif">M</span>'; }} />
    </div>
  );
}

/* ---------- Scroll reveal ---------- */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fallback: guarantee content is never stuck invisible
    const fallback = setTimeout(() => setVisible(true), 900);
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return () => clearTimeout(fallback); }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); clearTimeout(fallback); } },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return [ref, visible];
}
function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0px)" : "translateY(16px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- Data ---------- */
const EXAM_DATA = [
  { code: "RAS",     label: "RAS / RPSC",      logo: "/logos/ras.jpg",     live: true,  link: "/dashboard" },
  { code: "UPSC",   label: "UPSC IAS",         logo: "/logos/upsc.jpg",   live: false },
  { code: "UPPSC",  label: "UP Exams",         logo: "/logos/uppsc.jpg",  live: false },
  { code: "NEET",   label: "NEET Exams",       logo: "/logos/neet.jpg",   live: false },
  { code: "JEE",    label: "JEE Exams",        logo: "/logos/jee.jpg",    live: false },
  { code: "CLAT",   label: "CLAT Exam",        logo: "/logos/clat.jpg",   live: false },
  { code: "RAILWAY",label: "Railway Exams",    logo: "/logos/railway.jpg",live: false },
  { code: "BANKING",label: "Bank & Insurance", logo: "/logos/banking.jpg",live: false },
  { code: "CUET",   label: "CUET Exams",       logo: "/logos/cuet.jpg",   live: false },
  { code: "CAT",    label: "CAT / MBA",        logo: "/logos/cat.jpg",    live: false },
  { code: "SSC",    label: "SSC Exams",        logo: "/logos/banking.jpg",live: false },
  { code: "MPPSC",  label: "MP Exams",         logo: "/logos/gpsc.jpg",   live: false },
  { code: "KPSC",   label: "Karnataka",        logo: "/logos/kpsc.jpg",   live: false },
  { code: "TSPSC",  label: "Telangana",        logo: "/logos/tspsc.jpg",  live: false },
  { code: "APPSC",  label: "Andhra Pradesh",   logo: "/logos/appsc.jpg",  live: false },
  { code: "GPSC",   label: "Gujarat",          logo: "/logos/gpsc.jpg",   live: false },
];

const ROLES = [
  {
    key: "students", label: "Students", icon: GraduationCap,
    headline: "Everything you need to prepare, in one account",
    features: ["Unlimited AI-generated MCQs per exam", "AI Guruji tutor & AI Vyas answer evaluation", "Adaptive mock tests & sectional part tests", "Bookmarks, notes, and a personalized revision schedule"],
    cta: "Start practicing",
  },
  {
    key: "teachers", label: "Teachers", icon: Presentation,
    headline: "Upload once, let AI do the heavy lifting",
    features: ["Upload PDFs to auto-generate question banks", "Review & approve AI-generated MCQs", "Publish tests and track batch performance", "Manage students and assignments in one dashboard"],
    cta: "Apply as an educator",
  },
  {
    key: "institutions", label: "Institutions", icon: Building2,
    headline: "Bring your coaching institute online, fully branded",
    features: ["Bulk student licenses for your batches", "Branded portal under your institute's name", "Institution-wide analytics across teachers & batches", "Dedicated onboarding and support"],
    cta: "Partner with us",
  },
  {
    key: "parents", label: "Parents", icon: HeartHandshake,
    headline: "Stay informed without hovering",
    features: ["Weekly performance summaries for your child", "Visibility into weak topics & study streaks", "Manage subscription & billing in one place", "Set study reminders and goals together"],
    cta: "Link your child's account",
  },
];

const SUB_PLANS = [
  { key: "single", label: "Single Exam", price: "₹399", period: "/month", desc: "One exam, full AI prep.", features: ["Unlimited MCQs for 1 exam", "AI Guruji for that exam", "Basic mock tests", "Progress dashboard"] },
  { key: "holistic", label: "Exam Holistic", price: "₹799", period: "/month", desc: "Prelims, Mains & Interview — one exam, end to end.", features: ["Everything in Single Exam", "Prelims + Mains + Interview modules", "AI Vyas Mains evaluation", "AI Saransh notes", "Full-length simulators"], highlight: true },
  { key: "multi", label: "Multi-Exam Bundle", price: "₹1,299", period: "/month", desc: "Preparing for more than one exam? Cover all of them.", features: ["Every Holistic feature", "Unlimited exams, one login", "Separate analytics per exam", "AI Schedule Planner across exams", "Priority support"] },
];

/* ---------- Sidebar Nav Groups — Reference Design ---------- */
const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",          sub: "Your study dashboard",     section: "dashboard", link: "/dashboard" },
      { icon: BookOpen,        label: "Practice",           sub: "Subject-wise MCQs",        section: "practice",  link: "#" },
      { icon: FileText,        label: "Mock Tests",         sub: "Full-length tests",        section: "tests",     link: "#",  badge: "3" },
      { icon: Layers,          label: "Subjects & Syllabus",sub: "Topic-wise breakdown",     section: "syllabus",  link: "#" },
    ],
  },
  {
    label: "AI Tools",
    accent: true,
    items: [
      { icon: MessageCircleHeart, label: "AI Guruji",   sub: "Your AI mentor",         section: "ai",     link: "#ai" },
      { icon: Gavel,              label: "AI Vyas",     sub: "Mains Evaluator",        section: "vyas",   link: "#" },
      { icon: ScrollText,         label: "AI Saransh",  sub: "Notes",                 section: "saransh",link: "#" },
      { icon: CalendarClock,      label: "NITI",        sub: "Schedule Planner",      section: "niti",   link: "#" },
    ],
  },
  {
    label: "Progress",
    items: [
      { icon: BarChart3,  label: "Analytics",        sub: "Performance overview",  section: "analytics", link: "#" },
      { icon: RotateCcw,  label: "Revision",         sub: "Spaced repetition",     section: "revision",  link: "#", badge: "12" },
      { icon: Bookmark,   label: "Bookmarks & Notes",sub: "Saved questions",       section: "bookmarks", link: "#" },
    ],
  },
  {
    label: "Extras",
    items: [
      { icon: FileText,      label: "Current Affairs", sub: "Daily updates",       section: "affairs",  link: "#" },
      { icon: Trophy,        label: "Leaderboard",     sub: "Rankings",            section: "board",    link: "#" },
      { icon: GraduationCap, label: "Courses",         sub: "Structured programs", section: "courses",  link: "#" },
    ],
  },
];

/* ---------- AI Demo Components (dark-mode aware) ---------- */
function AiMcqDemo({ C }) {
  const [state, setState] = useState("idle");
  const generate = () => { setState("loading"); setTimeout(() => setState("done"), 900); };
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-3"><Wand2 size={16} style={{ color: C.gold }} /><span className="text-sm font-semibold" style={{ ...HEAD, color: C.ink }}>AI MCQ</span></div>
      <p className="text-xs mb-4" style={{ color: C.inkSoft }}>Generates fresh MCQs from your syllabus material in seconds.</p>
      {state === "idle" && <button onClick={generate} className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: C.goldSoft, color: C.dark ? C.gold : C.maroon }}>Generate a question</button>}
      {state === "loading" && <div className="flex items-center gap-2 text-xs" style={{ color: C.inkSoft }}><RefreshCw size={13} className="animate-spin" /> Reading syllabus...</div>}
      {state === "done" && (
        <div>
          <div className="rounded-xl p-3.5 mb-3" style={{ background: C.bg }}>
            <p className="text-[13px] font-semibold mb-2" style={{ color: C.ink }}>Q: Who founded the Bhakti-era devotional tradition centered on Krishna in Rajasthan?</p>
            {["Meera Bai", "Kabir", "Surdas", "Tulsidas"].map((o, i) => (
              <div key={o} className="text-xs px-2.5 py-1.5 rounded-lg mb-1.5" style={{ background: i === 0 ? C.goldSoft : C.card, border: `1px solid ${i === 0 ? C.gold : C.border}`, color: i === 0 ? (C.dark ? C.ink : C.maroonDark) : C.ink }}>
                {i === 0 && <Check size={11} className="inline mr-1" style={{ color: C.dark ? C.gold : C.maroon }} />}{o}
              </div>
            ))}
          </div>
          <button onClick={() => setState("idle")} className="text-xs font-semibold" style={{ color: C.dark ? C.gold : C.maroon }}>Generate another →</button>
        </div>
      )}
    </div>
  );
}

const GURUJI_EXAMS = [
  { code: "UPSC", msg: "Namaste! I'm your UPSC Guruji. Ask me about Polity, History, or today's editorial — I'll cite the source." },
  { code: "RAS", msg: "Namaste! I'm your RAS Guruji. Ask me about Rajasthan GK, State Polity, or the RPSC syllabus." },
  { code: "SSC", msg: "Hey! I'm your SSC Guruji. Ask me a Quant shortcut or a Reasoning trick — quick and exam-focused." },
];
function AiGurujiDemo({ C }) {
  const [active, setActive] = useState(0);
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-3"><MessageCircleHeart size={16} style={{ color: C.gold }} /><span className="text-sm font-semibold" style={{ ...HEAD, color: C.ink }}>AI Guruji</span></div>
      <p className="text-xs mb-4" style={{ color: C.inkSoft }}>A dedicated AI mentor for every exam — same platform, different knowledge base.</p>
      <div className="flex gap-2 mb-3">
        {GURUJI_EXAMS.map((g, i) => (
          <button key={g.code} onClick={() => setActive(i)} className="text-[11px] font-semibold px-3 py-1.5 rounded-full" style={{ background: active === i ? C.maroon : C.goldSoft, color: active === i ? "#fff" : (C.dark ? C.gold : C.maroon) }}>{g.code}</button>
        ))}
      </div>
      <div className="rounded-xl p-3.5 text-xs leading-relaxed" style={{ background: C.bg, color: C.ink }}>{GURUJI_EXAMS[active].msg}</div>
    </div>
  );
}

function AiVyasDemo({ C }) {
  const [state, setState] = useState("idle");
  const evaluate = () => { setState("loading"); setTimeout(() => setState("done"), 1000); };
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-3"><Gavel size={16} style={{ color: C.gold }} /><span className="text-sm font-semibold" style={{ ...HEAD, color: C.ink }}>AI Vyas — Mains Evaluator</span></div>
      <p className="text-xs mb-4" style={{ color: C.inkSoft }}>Upload a Mains answer, get scored feedback on content, structure, and presentation.</p>
      {state === "idle" && (
        <>
          <p className="text-[11px] italic p-2.5 rounded-lg mb-3" style={{ background: C.bg, color: C.inkSoft }}>"Discuss the significance of the Doctrine of Lapse in the context of the 1857 Revolt..."</p>
          <button onClick={evaluate} className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: C.goldSoft, color: C.dark ? C.gold : C.maroon }}>Evaluate with AI Vyas</button>
        </>
      )}
      {state === "loading" && <div className="flex items-center gap-2 text-xs" style={{ color: C.inkSoft }}><RefreshCw size={13} className="animate-spin" /> Evaluating answer...</div>}
      {state === "done" && (
        <div className="space-y-2">
          {[["Content accuracy", "8/10"], ["Structure & flow", "7/10"], ["Presentation", "9/10"]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs px-3 py-2 rounded-lg" style={{ background: C.bg, color: C.ink }}><span>{k}</span><span className="font-semibold" style={{ color: C.dark ? C.gold : C.maroon }}>{v}</span></div>
          ))}
          <button onClick={() => setState("idle")} className="text-xs font-semibold" style={{ color: C.dark ? C.gold : C.maroon }}>Try another answer →</button>
        </div>
      )}
    </div>
  );
}

function AiSaranshDemo({ C }) {
  const [summarized, setSummarized] = useState(false);
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-3"><ScrollText size={16} style={{ color: C.gold }} /><span className="text-sm font-semibold" style={{ ...HEAD, color: C.ink }}>AI Saransh</span></div>
      <p className="text-xs mb-4" style={{ color: C.inkSoft }}>Turns a long chapter into exam-ready notes — "saransh" means summary.</p>
      {!summarized ? (
        <>
          <p className="text-[11px] leading-relaxed mb-3 p-2.5 rounded-lg" style={{ background: C.bg, color: C.inkSoft }}>
            "The Doctrine of Lapse was formulated by Lord Dalhousie... any princely state under paramountcy of the British East India Company would have its ruling dynasty's rule ended if it lacked a natural heir..."
          </p>
          <button onClick={() => setSummarized(true)} className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: C.goldSoft, color: C.dark ? C.gold : C.maroon }}>Summarize with AI Saransh</button>
        </>
      ) : (
        <ul className="space-y-1.5">
          {["Policy by Lord Dalhousie (1848–56)", "Annexed states without a natural heir", "Adopted heirs not recognized", "Major cause of 1857 Revolt resentment"].map((f) => (
            <li key={f} className="flex items-start gap-1.5 text-[12px]" style={{ color: C.ink }}><Check size={12} className="mt-0.5 shrink-0" style={{ color: C.dark ? C.gold : C.maroon }} /> {f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AiPlannerDemo({ C }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-3"><CalendarClock size={16} style={{ color: C.gold }} /><span className="text-sm font-semibold" style={{ ...HEAD, color: C.ink }}>AI Schedule Planner</span></div>
      <p className="text-xs mb-4" style={{ color: C.inkSoft }}>Builds today's plan from your weak topics, exam date, and available hours.</p>
      <div className="space-y-2">
        {[["Revise Doctrine of Lapse", "30 min"], ["Practice 50 Economy MCQs", "45 min"], ["Read today's current affairs", "20 min"]].map(([t, m]) => (
          <div key={t} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg" style={{ background: C.bg, color: C.ink }}><span>{t}</span><span style={{ color: C.inkSoft }}>{m}</span></div>
        ))}
      </div>
    </div>
  );
}

function ExamDemoSection({ C }) {
  const [exam, setExam] = useState("UPSC");
  const guruji = GURUJI_EXAMS.find((g) => g.code === exam) || GURUJI_EXAMS[0];
  return (
    <div className="rounded-3xl p-6 md:p-8 max-w-2xl mx-auto" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-center" style={{ color: C.gold, letterSpacing: "0.1em" }}>Take a demo according to your exam</p>
      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {["UPSC", "RAS", "SSC", "BANKING", "NEET", "JEE"].map((e) => (
          <button key={e} onClick={() => setExam(e)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ background: exam === e ? C.maroon : C.goldSoft, color: exam === e ? "#fff" : C.gold }}>{e}</button>
        ))}
      </div>
      <div className="rounded-2xl p-4 mb-4" style={{ background: C.bg }}>
        <p className="text-xs font-semibold mb-1.5" style={{ color: C.gold }}>Your {exam} AI Guruji says:</p>
        <p className="text-sm leading-relaxed" style={{ color: C.ink }}>{guruji.msg}</p>
      </div>
      <button className="w-full py-3 rounded-full text-sm font-semibold" style={{ background: C.maroon, color: "#fff" }}>Book your free {exam} demo class</button>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function HomePage() {
  useFonts();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const dark = isDarkMode;
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState(0);
  // Persistent sidebar state
  const [collapsed, setCollapsed] = useState(true);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const isCollapsedView = collapsed && !hoverExpanded;
  const sidebarWidth = isCollapsedView ? 72 : 264;

  const C = dark ? DARK : LIGHT;
  const activeRole = ROLES[role];
  const RoleIcon = activeRole.icon;

  const userMenuRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  const handleNav = (item) => {
    if (item.section === "home") { navigate("/"); return; }
    if (item.section === "dashboard") { navigate("/dashboard"); return; }
    if (item.section === "ai") { document.querySelector("#ai")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (item.link && item.link.startsWith("/") && item.link !== "#") { navigate(item.link); return; }
    if (item.link && item.link.startsWith("#") && item.link.length > 1) { document.querySelector(item.link)?.scrollIntoView({ behavior: "smooth" }); return; }
  };

  const NAV_C = dark ? {
    bg: "#1F1417", border: "rgba(212,175,55,0.2)", text: "#F5E9D9", textSec: "#C9BBA8",
    textMuted: "#8A7A6C", maroon: "#9A2F3D", gold: "#C9A227", goldDeep: "#A6841A",
    goldSoft: "rgba(212,175,55,0.12)", maroonSoft: "#2A1417", surface: "#1F1417"
  } : {
    bg: "#FBF3E6", border: "#EADFC8", text: "#2A1810", textSec: "#6B5B4E",
    textMuted: "#A6957F", maroon: "#5C0F14", gold: "#C9A227", goldDeep: "#A6841A",
    goldSoft: "#FCEFD1", maroonSoft: "#F4E4E2", surface: "#FFFFFF"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif", color: C.ink, overflowX: "clip" }}>

      {/* ================= ANNOUNCEMENT BAR ================= */}
      <div className="px-5 py-3" style={{ background: C.announceBg, color: "#fff" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
            <div style={{ display: "inline-block", animation: "marquee 20s linear infinite" }}>
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                  width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(166, 149, 127, 0.3);
                  border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                  background: rgba(166, 149, 127, 0.6);
                }
              `}</style>
              <span className="text-[10px] font-bold px-2 py-1 rounded mr-2" style={{ background: C.gold, color: "#2B0F14" }}>NEW</span>
              <span className="text-xs md:text-sm font-semibold tracking-wide">
                🎯 AI MCQ Platform Live • AI Vyas Mains Evaluator Live • Free Demo Classes Available • 🎯 Practice. Perform. Achieve.
              </span>
            </div>
          </div>
          <div className="hidden sm:flex" style={{ flexShrink: 0, justifyContent: "flex-end", gap: 8 }}>
            <style>{`
              .social-icon { transition: transform 0.2s, background 0.2s, border-color 0.2s; }
              .social-icon:hover { transform: translateY(-2px); background: rgba(201,162,39,0.9) !important; border-color: rgba(201,162,39,0.9) !important; color: #3D0A0D !important; }
            `}</style>
            {[
              { key: "tw", label: "Twitter", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg> },
              { key: "ig", label: "Instagram", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
              { key: "yt", label: "YouTube", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg> },
              { key: "tg", label: "Telegram", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> },
            ].map(s => (
              <a key={s.key} href="#" aria-label={s.label} className="social-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", background: "rgba(201,162,39,0.16)", border: "1px solid rgba(201,162,39,0.5)", color: "#F1D98A", textDecoration: "none" }}>
                {s.svg}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5" style={{ background: C.header, borderBottom: `1px solid ${C.border}`, transition: "background 0.3s" }}>
        {/* Left: Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <Logo size={38} />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[14px] font-bold" style={SERIF}>THE MCQ</span>
              <span className="text-[14px] font-bold" style={{ ...SERIF, color: C.gold }}>APP</span>
            </div>
            <p className="text-[9px] font-semibold tracking-widest" style={{ color: C.inkMuted, letterSpacing: "0.15em" }}>PRACTICE · PERFORM · ACHIEVE</p>
          </div>
        </div>

        {/* Center: Nav Links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: C.navText }}>
          <a href="#contact" style={{ color: C.navText, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.navText}>About Us</a>
          <a href="#exams" style={{ color: C.navText, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.navText}>Exam</a>
          <a href="#pricing" style={{ color: C.navText, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.navText}>Subscription</a>
          <a href="#ai" style={{ color: C.navText, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.navText}>Blog</a>
          <a href="#roles" style={{ color: C.navText, textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.gold} onMouseLeave={e => e.target.style.color = C.navText}>Free Resources</a>
        </nav>

        {/* Right: Dark mode toggle + Login/User button */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle switch */}
          <button
            onClick={toggleTheme}
            title={dark ? "Switch to Light mode" : "Switch to Dark mode"}
            style={{
              width: 42, height: 24, borderRadius: 12, border: `1px solid ${C.border}`, cursor: "pointer",
              background: dark ? C.gold : C.maroonSoft, position: "relative", transition: "background 0.25s", flexShrink: 0,
              padding: 0, outline: "none",
            }}
          >
            <div style={{
              position: "absolute", top: 3, left: dark ? 21 : 3, width: 16, height: 16,
              borderRadius: "50%", background: dark ? C.maroonDark : C.maroon, transition: "left 0.25s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {dark ? <Sun size={9} color="#fff" /> : <Moon size={9} color="#fff" />}
            </div>
          </button>

          {/* Login Button — hides when logged in, shows user avatar instead with dropdown */}
          {user ? (
            <div style={{ position: "relative" }} ref={userMenuRef}>
              <div
                className="hidden md:flex items-center gap-2 cursor-pointer"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title={user.displayName || user.email}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.maroon}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff", border: `2px solid ${C.gold}` }}>
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>{user.displayName?.split(" ")[0] || "Student"}</span>
                <ChevronDown size={14} style={{ color: C.inkSoft }} />
              </div>

              {/* FLOATING DROPDOWN */}
              {userMenuOpen && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 10,
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 16, width: 180, overflow: "hidden", zIndex: 60,
                  boxShadow: dark ? "0 10px 30px rgba(0,0,0,0.5)" : "0 10px 25px rgba(92,15,20,0.08)",
                  padding: "6px 0"
                }}>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/dashboard"); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                      color: C.ink, fontSize: 13, fontWeight: 600, fontFamily: "inherit"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(212,175,55,0.08)" : C.maroonSoft}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <LayoutDashboard size={14} style={{ color: C.gold }} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/settings"); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                      color: C.ink, fontSize: 13, fontWeight: 600, fontFamily: "inherit"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(212,175,55,0.08)" : C.maroonSoft}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Settings size={14} style={{ color: C.gold }} />
                    Settings
                  </button>
                  <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
                  <button
                    onClick={async () => { setUserMenuOpen(false); await signOut(auth); navigate("/"); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                      color: dark ? "#F87171" : "#C0392B", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(248,113,113,0.08)" : "#FFF2F2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOut size={14} style={{ color: dark ? "#F87171" : "#C0392B" }} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: C.maroon, color: "#fff", border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <LogIn size={15} /> Login / Register
            </button>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ===== Mobile Slide-in Drawer (mirrors desktop sidebar) ===== */}
      {/* Backdrop */}
      <div
        className="md:hidden"
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 45,
          background: "rgba(0,0,0,0.5)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />
      {/* Drawer panel */}
      <aside
        className="md:hidden"
        aria-hidden={!menuOpen}
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 46,
          width: "min(84vw, 320px)",
          background: dark ? "#1F1417" : "#FBF3E6",
          borderRight: `1px solid ${dark ? "rgba(212,175,55,0.2)" : "#EADFC8"}`,
          transform: menuOpen ? "translateX(0)" : "translateX(-105%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column",
          boxShadow: menuOpen ? "6px 0 32px rgba(0,0,0,0.35)" : "none",
        }}
      >
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${dark ? "rgba(212,175,55,0.15)" : "#EADFC8"}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={32} />
            <div>
              <div style={{ ...SERIF, fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1 }}>THE MCQ <span style={{ color: C.gold }}>APP</span></div>
              <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.14em", color: C.inkMuted, marginTop: 3 }}>PRACTICE · PERFORM · ACHIEVE</div>
            </div>
          </div>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 4, display: "flex" }}>
            <X size={22} />
          </button>
        </div>

        {/* Exam switcher */}
        <div style={{ padding: "12px 12px 8px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px", borderRadius: 14, background: dark ? "rgba(212,175,55,0.12)" : "#FCEFD1", border: `1px solid ${dark ? "rgba(212,175,55,0.3)" : "#C9A227"}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: dark ? "#9A2F3D" : "#5C0F14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>UP</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: dark ? "#E8B923" : "#5C0F14" }}>UPSC CSE 2027</div>
              <div style={{ fontSize: 9, color: dark ? "#8A7A6C" : "#A6957F" }}>Switch exam</div>
            </div>
          </div>
        </div>

        {/* Nav groups (same as desktop) */}
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "4px 12px 12px", WebkitOverflowScrolling: "touch" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: group.accent ? "#A6841A" : (dark ? "#8A7A6C" : "#A6957F"), letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 6 }}>{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => { if (!item.soon) { handleNav(item); setMenuOpen(false); } }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 10px", borderRadius: 10, background: "none", border: "none",
                      cursor: item.soon ? "default" : "pointer",
                      color: item.soon ? (dark ? "#8A7A6C" : "#A6957F") : (dark ? "#C9BBA8" : "#6B5B4E"),
                      opacity: item.soon ? 0.6 : 1, marginBottom: 2, textAlign: "left",
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0, color: group.accent ? "#C9A227" : "inherit" }} />
                    <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1 }}>{item.label}</span>
                    {item.badge && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 8, background: dark ? "#9A2F3D" : "#5C0F14", color: "#fff" }}>{item.badge}</span>}
                    {item.soon && <span style={{ fontSize: 8, color: dark ? "#8A7A6C" : "#A6957F", fontStyle: "italic" }}>soon</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Drawer footer */}
        <div style={{ padding: "12px", borderTop: `1px solid ${dark ? "rgba(212,175,55,0.15)" : "#EADFC8"}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={toggleTheme} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 10px", borderRadius: 10, background: "none", border: `1px solid ${C.border}`, cursor: "pointer", color: dark ? "#C9BBA8" : "#6B5B4E", fontWeight: 500, fontSize: 13 }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? "Day Mode" : "Night Mode"}
          </button>
          {user ? (
            <button onClick={async () => { setMenuOpen(false); await signOut(auth); navigate("/"); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: dark ? "#9A2F3D" : "#5C0F14", border: "none", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 13 }}>
              <LogOut size={15} /> Log Out
            </button>
          ) : (
            <button onClick={() => { setMenuOpen(false); navigate("/login"); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: dark ? "#9A2F3D" : "#5C0F14", border: "none", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 13 }}>
              <LogIn size={15} /> Login / Register
            </button>
          )}
        </div>
      </aside>

      {/* ── FLEX CONTAINER FOR CONTENT & SIDEBAR ── */}
      <div style={{ display: "flex", flex: 1, minWidth: 0 }}>
      {/* ── PERSISTENT HOVER SIDEBAR (Desktop) ── */}
      <aside
        className="hidden md:flex flex-col"
        style={{
          width: sidebarWidth,
          background: dark ? "#1F1417" : "#FBF3E6",
          borderRight: `1px solid ${dark ? "rgba(212,175,55,0.2)" : "#EADFC8"}`,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          position: "sticky",
          top: 68,
          height: "calc(100vh - 68px)",
          alignSelf: "flex-start",
          flexShrink: 0,
          zIndex: 20,
          boxShadow: hoverExpanded ? "-4px 0 24px rgba(0,0,0,0.13)" : "none",
        }}
        onMouseEnter={() => { if (collapsed) setHoverExpanded(true); }}
        onMouseLeave={() => { setHoverExpanded(false); }}
      >
        {/* Sidebar Header: Collapse toggle only */}
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${dark ? "rgba(212,175,55,0.15)" : "#EADFC8"}`, display: "flex", justifyContent: isCollapsedView ? "center" : "flex-end", flexShrink: 0 }}>
          <button
            onClick={() => { setCollapsed(v => !v); setHoverExpanded(false); }}
            style={{
              background: dark ? "rgba(255,255,255,0.05)" : "#fff",
              border: `1px solid ${dark ? "rgba(212,175,55,0.2)" : "#EADFC8"}`,
              borderRadius: "50%",
              width: 28, height: 28,
              cursor: "pointer",
              color: dark ? "#C9A227" : "#5C0F14",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {isCollapsedView ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Exam Switcher */}
        <div style={{ padding: "12px 10px 8px", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px", borderRadius: 14, background: dark ? "rgba(212,175,55,0.12)" : "#FCEFD1", border: `1px solid ${dark ? "rgba(212,175,55,0.3)" : "#C9A227"}`, overflow: "hidden" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: dark ? "#9A2F3D" : "#5C0F14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>UP</div>
            {!isCollapsedView && (
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: dark ? "#E8B923" : "#5C0F14", whiteSpace: "nowrap" }}>UPSC CSE 2027</div>
                <div style={{ fontSize: 9, color: dark ? "#8A7A6C" : "#A6957F" }}>Switch exam</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav Groups */}
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 10px" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              {!isCollapsedView && (
                <div style={{ fontSize: 9.5, fontWeight: 700, color: group.accent ? (dark ? "#A6841A" : "#A6841A") : (dark ? "#8A7A6C" : "#A6957F"), letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>{group.label}</div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item)}
                    title={isCollapsedView ? item.label : undefined}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: isCollapsedView ? "9px 0" : "9px 10px",
                      justifyContent: isCollapsedView ? "center" : "flex-start",
                      borderRadius: 10, background: "none", border: "none", cursor: item.soon ? "default" : "pointer",
                      color: item.soon ? (dark ? "#8A7A6C" : "#A6957F") : (dark ? "#C9BBA8" : "#6B5B4E"),
                      opacity: item.soon ? 0.6 : 1, marginBottom: 2, transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!item.soon) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Icon size={16} style={{ flexShrink: 0, color: group.accent ? (dark ? "#C9A227" : "#C9A227") : "inherit" }} />
                    {!isCollapsedView && (
                      <>
                        <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>{item.label}</span>
                        {item.badge && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 8, background: dark ? "#9A2F3D" : "#5C0F14", color: "#fff" }}>{item.badge}</span>
                        )}
                        {item.soon && <span style={{ fontSize: 8, color: dark ? "#8A7A6C" : "#A6957F", fontStyle: "italic" }}>soon</span>}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: "10px", borderTop: `1px solid ${dark ? "rgba(212,175,55,0.15)" : "#EADFC8"}`, flexShrink: 0 }}>
          <button onClick={toggleTheme} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: isCollapsedView ? "9px 0" : "9px 10px", justifyContent: isCollapsedView ? "center" : "flex-start", borderRadius: 10, background: "none", border: "none", cursor: "pointer", color: dark ? "#C9BBA8" : "#6B5B4E", marginBottom: 4 }}>
            {dark ? <Sun size={15} style={{ flexShrink: 0 }} /> : <Moon size={15} style={{ flexShrink: 0 }} />}
            {!isCollapsedView && <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>{dark ? "Day Mode" : "Night Mode"}</span>}
          </button>
          {user ? (
            <button onClick={() => { signOut(auth); navigate("/"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: isCollapsedView ? "9px 0" : "9px 10px", justifyContent: isCollapsedView ? "center" : "flex-start", borderRadius: 10, background: dark ? "#9A2F3D" : "#5C0F14", border: "none", cursor: "pointer", color: "#fff", marginTop: 4 }}>
              <LogOut size={14} style={{ flexShrink: 0 }} />
              {!isCollapsedView && <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Log Out</span>}
            </button>
          ) : (
            <button onClick={() => navigate("/login")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: isCollapsedView ? "9px 0" : "9px 10px", justifyContent: isCollapsedView ? "center" : "flex-start", borderRadius: 10, background: dark ? "#9A2F3D" : "#5C0F14", border: "none", cursor: "pointer", color: "#fff", marginTop: 4 }}>
              <LogIn size={14} style={{ flexShrink: 0 }} />
              {!isCollapsedView && <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Log In / Register</span>}
            </button>
          )}
        </div>
      </aside>

        {/* ── MAIN CONTENT WRAPPER ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", transition: "background 0.3s, color 0.3s" }}>

      {/* ================= HERO ================= */}
      <section
        className="relative overflow-hidden px-5 pt-16 pb-20"
        style={{
          background: `radial-gradient(120% 90% at 50% -10%, #7B1520 0%, ${LIGHT.maroonDark} 45%, #35090D 100%)`,
        }}
      >
        {/* decorative gold hairline glow */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 40% at 50% 0%, rgba(201,162,39,0.18), transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.5), transparent)" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7" style={{ background: "rgba(201,162,39,0.14)", color: C.goldSoft, border: "1px solid rgba(201,162,39,0.45)", backdropFilter: "blur(4px)" }}>
              <Sparkles size={12} /> India's Most Advanced Multi-Exam AI Ecosystem
            </div>
            <h1 className="text-[32px] md:text-[52px] leading-[1.15] font-bold uppercase text-balance" style={{ ...SERIF, color: C.gold, textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}>
              India's First Truly<br />Adaptive Exam Platform
            </h1>
            <p className="text-lg md:text-2xl mt-5 italic" style={{ ...SERIF, color: "rgba(255,247,228,0.92)", textTransform: "none", letterSpacing: "0.02em" }}>
              &ldquo;Practice. Perform. Achieve.&rdquo;
            </p>
            <p className="mt-5 text-sm md:text-base max-w-2xl mx-auto leading-relaxed text-pretty" style={{ color: "rgba(255,247,228,0.72)" }}>
              AI-generated MCQs, real-time Mains evaluation with AI Vyas, a dedicated AI Guruji for every
              exam, and a personalized schedule — UPSC, RAS, SSC, Banking, NEET, JEE and more, all in one platform.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="flex items-center gap-2 text-sm font-bold px-7 py-3.5 rounded-xl transition-transform active:scale-95"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, color: "#3D0A0D", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(201,162,39,0.35)" }}
              >
                Start Free Test <ArrowRight size={16} />
              </button>
              <button
                className="flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: C.goldSoft, border: "1.5px solid rgba(201,162,39,0.55)", cursor: "pointer", backdropFilter: "blur(4px)" }}
                onClick={() => document.getElementById("exams")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Exams
              </button>
            </div>

            {/* AI tool pills — icons, not emojis */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
              {[[MessageCircleHeart, "AI Guruji"], [Gavel, "AI Vyas"], [ScrollText, "AI Saransh"], [CalendarClock, "NITI Planner"]].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{ border: "1px solid rgba(201,162,39,0.3)", color: "rgba(255,247,228,0.85)", background: "rgba(255,255,255,0.04)" }}>
                  <Icon size={14} style={{ color: C.gold }} />{label}
                </div>
              ))}
            </div>
          </Reveal>

          {/* ── Featured Academy Cards ── */}
          <Reveal delay={120}>
            <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-2xl mx-auto text-left">
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-4 rounded-2xl p-5 transition-transform active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.16), rgba(201,162,39,0.04))", border: "1.5px solid rgba(201,162,39,0.5)", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Target size={24} style={{ color: "#3D0A0D" }} />
                </div>
                <div>
                  <div style={{ ...SERIF, fontSize: 19, fontWeight: 800, color: C.gold, letterSpacing: "0.05em", lineHeight: 1.1 }}>RAS ACADEMY</div>
                  <div className="flex items-center gap-1" style={{ fontSize: 11, color: "rgba(255,247,228,0.7)", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    RPSC Civil Services Prep <ArrowRight size={11} />
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate("/gate")}
                className="group flex items-center gap-4 rounded-2xl p-5 transition-transform active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, rgba(46,204,113,0.16), rgba(46,204,113,0.04))", border: "1.5px solid rgba(46,204,113,0.5)", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #2ECC71, #1B6B35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TrendingUp size={24} style={{ color: "#fff" }} />
                </div>
                <div>
                  <div style={{ ...SERIF, fontSize: 19, fontWeight: 800, color: "#4ADE80", letterSpacing: "0.05em", lineHeight: 1.1 }}>GATE ACADEMY</div>
                  <div className="flex items-center gap-1" style={{ fontSize: 11, color: "rgba(220,255,235,0.7)", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    GATE CSE · 2485 PYQs <ArrowRight size={11} />
                  </div>
                </div>
              </button>
            </div>
          </Reveal>

          {/* ── Trust stats band ── */}
          <Reveal delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-3xl mx-auto">
              {[["50,000+", "AI Questions"], ["16+", "Exams Covered"], ["4", "AI Tools"], ["24/7", "AI Guruji"]].map(([num, label]) => (
                <div key={label} className="rounded-2xl px-3 py-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,162,39,0.22)" }}>
                  <div style={{ ...HEAD, fontSize: 22, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,247,228,0.62)", marginTop: 6, letterSpacing: "0.04em" }}>{label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FOR YOU (ROLES) ================= */}
      <section id="roles" className="px-5 py-16" style={{ background: C.maroonSoft }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: C.gold, letterSpacing: "0.12em" }}>Built For</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ ...SERIF, color: C.ink }}>Who is TheMCQ App for?</h2>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ROLES.map((r, i) => {
              const RIcon = r.icon;
              return (
                <button key={r.key} onClick={() => setRole(i)} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
                  style={{ background: role === i ? C.maroon : C.card, color: role === i ? "#fff" : C.inkSoft, border: `1px solid ${role === i ? C.maroon : C.border}`, cursor: "pointer" }}>
                  <RIcon size={15} /> {r.label}
                </button>
              );
            })}
          </div>
          <Reveal>
            <div className="rounded-3xl p-6 md:p-10 max-w-3xl mx-auto" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3 mb-5">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RoleIcon size={22} style={{ color: C.gold }} />
                </div>
                <h3 className="text-lg font-bold" style={{ ...SERIF, color: C.ink }}>{activeRole.headline}</h3>
              </div>
              <ul className="space-y-3 mb-6">
                {activeRole.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm" style={{ color: C.inkSoft }}>
                    <Check size={15} className="mt-0.5 shrink-0" style={{ color: C.gold }} /> {f}
                  </li>
                ))}
              </ul>
              <button className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full" style={{ background: C.maroon, color: "#fff", border: "none", cursor: "pointer" }}>
                {activeRole.cta} <ChevronRight size={15} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= EXAMS ================= */}
      <section id="exams" className="px-5 py-16 max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: C.gold, letterSpacing: "0.12em" }}>Exams We Cover</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center" style={{ ...SERIF, color: C.ink }}>Pick your exam. Start with AI today.</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EXAM_DATA.map((exam, i) => (
            <Reveal key={exam.code} delay={i * 40}>
              <div
                onClick={() => { if (exam.live) navigate(exam.link); }}
                style={{
                  background: C.card, border: exam.live ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                  borderRadius: 20, padding: "16px 12px", display: "flex", flexDirection: "column",
                  alignItems: "center", textAlign: "center", cursor: exam.live ? "pointer" : "default",
                  position: "relative", overflow: "hidden",
                  boxShadow: exam.live ? `0 4px 20px rgba(201,162,39,0.2)` : "none",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => { if (exam.live) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 30px rgba(201,162,39,0.35)`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = exam.live ? `0 4px 20px rgba(201,162,39,0.2)` : "none"; }}
              >
                {exam.live && (
                  <div style={{ position: "absolute", top: 10, right: 10, background: C.gold, color: "#2B0F14", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.05em" }}>LIVE</div>
                )}
                {!exam.live && (
                  <div style={{ position: "absolute", top: 10, right: 8, background: C.maroonSoft, color: C.gold, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, border: `1px solid ${C.border}` }}>Soon</div>
                )}
                <img
                  src={exam.logo} alt={exam.label}
                  onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 12, marginBottom: 10 }}
                />
                <div style={{ display: "none", width: 64, height: 64, borderRadius: 12, background: i % 2 === 0 ? C.goldSoft : C.maroonSoft, alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 22 }}>📚</div>
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: "Poppins, sans-serif", color: exam.live ? C.gold : C.inkSoft, marginBottom: 10, lineHeight: 1.3 }}>{exam.label}</p>
                <button
                  onClick={e => { e.stopPropagation(); if (exam.live) navigate(exam.link); }}
                  style={{
                    marginTop: "auto", fontSize: 10, fontWeight: 700, padding: "7px 14px", borderRadius: 30,
                    border: "none", cursor: exam.live ? "pointer" : "not-allowed",
                    background: exam.live ? C.maroon : C.maroonSoft,
                    color: exam.live ? "#fff" : C.inkMuted, width: "100%", letterSpacing: "0.02em",
                  }}
                >
                  {exam.live ? "Open RAS Academy →" : "Coming Soon"}
                </button>
              </div>
            </Reveal>
          ))}
          <Reveal delay={EXAM_DATA.length * 40}>
            <div className="rounded-2xl p-4 h-full flex flex-col items-center justify-center text-center" style={{ border: `1.5px dashed ${C.gold}`, background: "transparent", minHeight: 180 }}>
              <Sparkles size={18} style={{ color: C.gold }} className="mb-2" />
              <p className="text-xs font-semibold" style={{ color: C.gold }}>More exams<br />coming soon...</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" className="px-5 py-16" style={{ background: C.maroonSoft }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: C.gold, letterSpacing: "0.12em" }}>Subscriptions</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center" style={{ ...SERIF, color: C.ink }}>One exam or every exam — your choice.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {SUB_PLANS.map((p, i) => (
              <Reveal key={p.key} delay={i * 80}>
                <div className="rounded-3xl p-6 h-full flex flex-col" style={{
                  background: p.highlight ? C.maroon : C.card,
                  border: p.highlight ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                  boxShadow: p.highlight ? `0 8px 32px rgba(201,162,39,0.2)` : "none",
                }}>
                  {p.highlight && <div className="text-[10px] font-bold px-2.5 py-1 rounded-full self-start mb-3" style={{ background: C.gold, color: "#2B0F14" }}>MOST POPULAR</div>}
                  <p className="text-sm font-bold mb-1" style={{ ...HEAD, color: p.highlight ? C.gold : C.ink }}>{p.label}</p>
                  <p className="text-2xl font-bold mb-0.5" style={{ ...SERIF, color: p.highlight ? "#fff" : C.ink }}>{p.price}</p>
                  <p className="text-xs mb-4" style={{ color: p.highlight ? "rgba(255,255,255,0.6)" : C.inkMuted }}>{p.period} · {p.desc}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs" style={{ color: p.highlight ? "rgba(255,255,255,0.85)" : C.inkSoft }}>
                        <Check size={13} className="mt-0.5 shrink-0" style={{ color: p.highlight ? C.gold : C.gold }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-2.5 rounded-full text-sm font-semibold" style={{ background: p.highlight ? C.gold : C.maroon, color: p.highlight ? "#2B0F14" : "#fff", border: "none", cursor: "pointer" }}>
                    {p.highlight ? "Start Holistic Prep" : "Get Started"}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AI TOOLS ================= */}
      <section id="ai" className="px-5 py-16 max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: C.gold, letterSpacing: "0.12em" }}>AI Tools</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center" style={{ ...SERIF, color: C.ink }}>Four AI products. One platform.</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <Reveal><AiMcqDemo C={C} /></Reveal>
          <Reveal delay={80}><AiGurujiDemo C={C} /></Reveal>
          <Reveal delay={160}><AiVyasDemo C={C} /></Reveal>
          <Reveal delay={240}><AiSaranshDemo C={C} /></Reveal>
        </div>
        <Reveal delay={320}><ExamDemoSection C={C} /></Reveal>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="px-5 py-16" style={{ background: C.maroonSoft }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ ...SERIF, color: C.ink }}>Built for serious preparation</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              [Target, "Weak-topic detection"], [BarChart3, "Performance analytics"], [Bookmark, "Bookmarks & notes"], [RotateCcw, "Spaced revision engine"],
              [Trophy, "Leaderboard & streaks"], [FileText, "PYQ library"], [Layers, "Adaptive mock tests"], [TrendingUp, "AI confidence score"],
            ].map(([Icon, label], i) => (
              <Reveal key={label} delay={i * 40}>
                <div className="rounded-xl p-4 text-center h-full" style={{ background: i % 2 === 0 ? C.goldSoft : C.maroonSoft, border: `1px solid ${C.border}` }}>
                  <Icon size={18} className="mx-auto mb-2" style={{ color: dark ? C.gold : C.maroon }} />
                  <p className="text-[11px] font-medium" style={{ color: dark ? C.inkSoft : (i % 2 === 0 ? "#4A1B0C" : C.inkSoft) }}>{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="px-5 py-16" style={{ background: C.bg }}>
        <Reveal>
          <div className="max-w-2xl mx-auto rounded-3xl p-8 md:p-12 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ ...SERIF, color: C.ink }}>Questions? Talk to us.</h2>
            <p className="text-sm mb-8" style={{ color: C.inkSoft }}>We're a small team building this in the open — reach out directly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:themcqapp001@gmail.com" className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold" style={{ background: C.goldSoft, color: dark ? C.gold : C.maroonDark, textDecoration: "none" }}><Mail size={15} /> themcqapp001@gmail.com</a>
              <a href="tel:+919602229472" className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold" style={{ background: C.maroonSoft, color: C.maroon, textDecoration: "none" }}><Phone size={15} /> +91 96022 29472</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ background: dark ? "#1A0A0E" : "#3D0A0D", color: "#fff" }}>
        {/* Main Footer Grid */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Logo size={30} />
              <span style={{ ...SERIF, fontSize: 14, fontWeight: 700, color: "#C9A227" }}>THE MCQ APP</span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
              Rajasthan's First AI-Powered Exam Prep Platform. Practice. Perform. Achieve.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                <svg key="tw" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>,
                <svg key="ig" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                <svg key="yt" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
                <svg key="tg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
              ].map((icon, i) => (
                <a key={i} href="#" style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(201,162,39,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                >{icon}</a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A227", marginBottom: 14 }}>Company</p>
            {["About Us", "Contact Us", "Careers", "Updates"].map(link => (
              <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: 8, transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#C9A227"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              >{link}</a>
            ))}
          </div>

          {/* Account */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A227", marginBottom: 14 }}>Account</p>
            {["Account Deletion"].map(link => (
              <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: 8, transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#C9A227"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              >{link}</a>
            ))}
          </div>

          {/* Exams */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A227", marginBottom: 14 }}>Exams</p>
            {["UPSC CSE", "RAS / RTS", "SSC CGL", "Bank PO", "State PSC"].map(link => (
              <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: 8, transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#C9A227"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              >{link}</a>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A227", marginBottom: 14 }}>Legal</p>
            {["Privacy Policy", "Terms of Service", "Refund Policy", "Cookie Policy"].map(link => (
              <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: 8, transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#C9A227"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              >{link}</a>
            ))}
            <div style={{ marginTop: 16 }}>
              <a href="mailto:themcqapp001@gmail.com" style={{ fontSize: 12, color: "rgba(201,162,39,0.8)", textDecoration: "none" }}>themcqapp001@gmail.com</a><br/>
              <a href="tel:+919602229472" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginTop: 4, display: "block" }}>+91 96022 29472</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid rgba(201,162,39,0.2)", padding: "16px 24px", paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, flex: "1 1 240px" }}>Predictions are probabilistic — never guaranteed exam content.</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, flex: "1 1 240px" }}>© 2026 The MCQ App. All rights reserved.</p>
        </div>
      </footer>

      </div>{/* end main content wrapper */}


      </div>{/* end flex container for content & sidebar */}
    </div>
  );
}
