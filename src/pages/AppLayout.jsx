/**
 * AppLayout.jsx
 * Shared layout for all inner app pages — RAS Academy.
 * Colors: TheMCQ App maroon-gold-cream palette (matches homepage).
 * Has a top header + slide-in sidebar drawer.
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { IAS_MENU, IAS_ADMIN_ITEM, IAS_BRAND } from "../config/iasMenu.jsx";
import { RAS_MENU, RAS_ADMIN_ITEM, RAS_BRAND } from "../config/rasMenu.jsx";
import { LANDING_MENU, LANDING_BRAND } from "../config/landingMenu.jsx";
import {
  Menu, X, Home, Brain, FileText, Video,
  GraduationCap, History, Settings as SettingsIcon, Sparkles,
  Sun, Moon, LogOut, LogIn, ChevronRight, ShieldCheck, Info,
  BookOpen
} from "lucide-react";

/* ─── NAV ITEMS ─────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to:"/dashboard",    icon:<Home size={18}/>,           label:"Home",            desc:"Your study dashboard"     },
  { to:"/ai-generator", icon:<Brain size={18}/>,           label:"AI Generator",    desc:"AI-powered question sets" },
  { to:"/vyas",         icon:<Sparkles size={18}/>,        label:"AI Evaluator",   desc:"Answer sheet evaluation"  },
  { to:"/notes",        icon:<FileText size={18}/>,        label:"Study Notes",     desc:"Protected PDF library"    },
  { to:"/courses",      icon:<Video size={18}/>,           label:"Lecture Portal",  desc:"Video lecture streams"    },
  { to:"/anthropology", icon:<GraduationCap size={18}/>,  label:"Anthro Optional", desc:"UPSC Anthropology prep"   },
  { to:"/history",      icon:<History size={18}/>,         label:"Log History",     desc:"Test records & analytics" },
  { to:"/settings",     icon:<SettingsIcon size={18}/>,    label:"Settings",        desc:"Preferences & account"    },
  { to:"/about",        icon:<Info size={18}/>,            label:"About",           desc:"Our mission & team"       },
];

const ADMIN_ITEM = { to:"/courses", icon:<ShieldCheck size={18}/>, label:"Admin Panel", desc:"Course & Notes Editor" };

/* ─── SECTION RESOLVER ──────────────────────────────────────────────
   /ras/*  -> RAS menu   |   /ias/*  -> IAS menu
   anything else (legacy unprefixed routes) -> the original NAV_ITEMS,
   so the site as it exists today keeps working unchanged.            */
function resolveSection(pathname) {
  if (pathname.startsWith("/ras")) return { code: "RAS", items: RAS_MENU, admin: RAS_ADMIN_ITEM, brand: RAS_BRAND };
  if (pathname.startsWith("/ias")) return { code: "IAS", items: IAS_MENU, admin: IAS_ADMIN_ITEM, brand: IAS_BRAND };
  if (pathname === "/" || pathname.startsWith("/pricing")) return { code: "LANDING", items: LANDING_MENU, admin: null, brand: LANDING_BRAND };
  return { code: "LEGACY", items: NAV_ITEMS, admin: ADMIN_ITEM, brand: { logoText: "RA", title: "RAS Academy" } };
}

/* ─── COLOR PALETTES (TheMCQ App maroon-gold-cream theme) ──────────── */
const LIGHT_C = {
  bg:           "#FBF1E1",
  surface:      "#FFFFFF",
  drawer:       "#FFFFFF",
  header:       "#FFFFFF",
  border:       "#EDE0C8",
  text:         "#2C2C2A",
  textSec:      "#5F5E5A",
  textMuted:    "#8A7A6C",
  maroon:       "#7A1F2B",
  maroonDark:   "#5C1A22",
  maroonSoft:   "#F5E6D3",
  gold:         "#D4AF37",
  goldDeep:     "#B8912A",
  goldSoft:     "#E8C158",
  activeText:   "#7A1F2B",
  activeBg:     "rgba(122,31,43,0.08)",
  activeBorder: "#7A1F2B",
  hoverBg:      "rgba(122,31,43,0.04)",
  shadow:       "0 4px 30px rgba(0,0,0,0.08)",
  red:          "#C0392B",
  announceBg:   "#5C1A22",
};
const DARK_C = {
  bg:           "#1A1015",
  surface:      "#1F1417",
  drawer:       "#1F1417",
  header:       "#2B0F14",
  border:       "rgba(212,175,55,0.25)",
  text:         "#F5E9D9",
  textSec:      "#C9BBA8",
  textMuted:    "#8A7A6C",
  maroon:       "#9A2F3D",
  maroonDark:   "#2B0F14",
  maroonSoft:   "#2A1417",
  gold:         "#E8B923",
  goldDeep:     "#D4AF37",
  goldSoft:     "rgba(212,175,55,0.15)",
  activeText:   "#E8B923",
  activeBg:     "rgba(232,185,35,0.12)",
  activeBorder: "#E8B923",
  hoverBg:      "rgba(232,185,35,0.06)",
  shadow:       "0 4px 30px rgba(0,0,0,0.6)",
  red:          "#F87171",
  announceBg:   "#1F0A0D",
};

/* ─── LOGO MARK (matches homepage) ──────────────────────────────────── */
function RASLogo({ size = 34, text = "RA" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "22%", flexShrink: 0,
      background: "linear-gradient(135deg, #3A0710, #5B0A14)",
      border: "1px solid rgba(212,175,55,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Cinzel, serif", fontWeight: 800, fontSize: size * 0.28, color: "#D4AF37",
    }}>
      {text}
    </div>
  );
}

/* ─── COMPONENT ──────────────────────────────────────────────────────── */
export default function AppLayout({ children, title = "Dashboard", navItems, adminItem, brand }) {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const C = isDarkMode ? DARK_C : LIGHT_C;
  const [open, setOpen] = useState(false);

  /* menu comes from the URL section unless the caller overrides it */
  const SECTION = resolveSection(location.pathname);
  const ITEMS   = navItems  || SECTION.items;
  const ADMIN   = adminItem !== undefined ? adminItem : SECTION.admin;
  const BRAND   = brand     || SECTION.brand;

  /* close on route change */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  /* close on ESC */
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      const drawer = document.getElementById("ras-drawer");
      if (drawer && !drawer.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    navigate("/");
  }, [navigate]);

  const ACTIVE = location.pathname;
  const isGate = location.pathname.startsWith('/gate');

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>
      {/* ── FONT + ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Poppins:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        .ras-navlink { transition: background .15s, color .15s, border-color .15s; }
        .ras-navlink:hover { background: ${C.hoverBg} !important; }
        .ras-hdrbtn:hover { opacity: 0.8; }
        .ras-navlink-icon { transition: color .15s; }
      `}</style>

      {/* ── OVERLAY ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 399,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ── SLIDE-IN SIDEBAR DRAWER ── */}
      <nav
        id="ras-drawer"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 285, zIndex: 400,
          background: C.drawer,
          borderRight: `1px solid ${C.border}`,
          boxShadow: open ? C.shadow : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .28s cubic-bezier(.4,0,.2,1)",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* ── Drawer Header (maroon gradient like homepage) ── */}
        <div style={{
          padding: "16px 18px",
          background: "linear-gradient(135deg, #3A0710 0%, #5B0A14 60%, #7A1520 100%)",
          borderBottom: "1.5px solid rgba(212,175,55,0.45)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: isGate ? "rgba(39,174,96,0.15)" : "rgba(212,175,55,0.15)",
              border: isGate ? "1.5px solid rgba(39,174,96,0.5)" : "1.5px solid rgba(212,175,55,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isGate ? <img src="/gate_logo.png" alt="GATE" style={{ width: 24, height: 24, objectFit: "contain", background: "white", borderRadius: 4 }} /> : <GraduationCap size={20} color="#D4AF37" />}
            </div>
            <div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 15, color: "#FFF7E8", lineHeight: 1.1 }}>
                {isGate ? "GATE " : "RAS "} 
                <span style={{ color: isGate ? "#2ECC71" : "#D4AF37" }}>ACADEMY</span>
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,247,232,0.6)", marginTop: 2 }}>
                {isGate ? "GATE CSE PYQs" : "Premier RPSC Prep"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none",
              background: "rgba(255,255,255,0.15)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── TheMCQ App quick-link strip ── */}
        <Link
          to="/"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            margin: "12px 14px 4px",
            padding: "10px 12px",
            borderRadius: 12,
            background: C.goldSoft,
            border: `1px solid ${C.border}`,
            textDecoration: "none",
            transition: "opacity .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "#3D0A0D",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Cinzel, serif", fontWeight: 800, fontSize: 10, color: "#D4AF37", flexShrink: 0,
          }}>M</div>
          <div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 700, color: C.text }}>
              THE MCQ <span style={{ color: C.gold }}>APP</span>
            </div>
            <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Inter, sans-serif" }}>Back to homepage →</div>
          </div>
        </Link>

        {/* ── User info strip ── */}
        {user && (
          <div style={{
            padding: "12px 16px", margin: "8px 14px",
            borderRadius: 12,
            background: isDarkMode ? "rgba(232,185,35,0.08)" : "#FBF3E6",
            border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.maroon}, ${C.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0,
            }}>
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 13, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.displayName || "Student"}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: C.gold, fontWeight: 600, marginTop: 1 }}>
                RAS Aspirant 🎯
              </div>
            </div>
          </div>
        )}

        {/* ── NAV SECTION ── */}
        <div style={{ padding: "4px 10px 0", flex: 1 }}>
          <div style={{
            fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700,
            color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase",
            padding: "8px 10px 6px",
          }}>Navigation</div>

          {ITEMS.map(item => {
            // Dynamic check for GATE context
            let actualTo = item.to;
            let actualLabel = item.label;
            let actualDesc = item.desc;
            let actualIcon = item.icon;
            
            if (isGate && item.to === "/ai-generator") {
              actualTo = "/gate-quiz";
              actualLabel = "GATE Quiz Test";
              actualDesc = "Interactive GATE PYQs";
            }
            
            const isActive = ACTIVE === actualTo;
            
            // Special styling for GATE Quiz when active
            const isGateQuizActive = isActive && actualTo === "/gate-quiz";
            
            return (
              <Link
                key={item.to}
                to={actualTo}
                className="ras-navlink"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 12, marginBottom: 2,
                  textDecoration: "none",
                  background: isGateQuizActive ? (isDarkMode ? "rgba(39,174,96,0.12)" : "rgba(39,174,96,0.08)") : (isActive ? C.activeBg : "transparent"),
                  color: isGateQuizActive ? "#2ECC71" : (isActive ? C.activeText : C.textSec),
                  borderLeft: isGateQuizActive ? "3px solid #2ECC71" : (isActive ? `3px solid ${C.activeBorder}` : "3px solid transparent"),
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isGateQuizActive 
                    ? "rgba(39,174,96,0.15)"
                    : (isActive ? (isDarkMode ? "rgba(232,185,35,0.2)" : C.goldSoft) : (isDarkMode ? "rgba(255,255,255,0.05)" : C.maroonSoft)),
                  color: isGateQuizActive ? "#27AE60" : (isActive ? C.gold : C.textMuted),
                }}>
                  {actualIcon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "Inter, sans-serif", fontWeight: isActive ? 700 : 600,
                    fontSize: 13, lineHeight: 1.2, color: isGateQuizActive ? "#27AE60" : (isActive ? C.activeText : C.text),
                  }}>
                    {actualLabel}
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: C.textMuted, marginTop: 1.5, lineHeight: 1 }}>
                    {actualDesc}
                  </div>
                </div>
                {isActive && <ChevronRight size={13} style={{ color: isGateQuizActive ? "#27AE60" : C.gold, flexShrink: 0 }} />}
              </Link>
            );
          })}

          {ADMIN && (<>
            {/* ── ADMIN PANEL (special style) ── */}
            <div style={{ height: 1, background: C.border, margin: "8px 4px" }} />
            <a
              href={window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5173" : "https://admin.themcqapp.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="ras-navlink"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12, marginBottom: 2,
                textDecoration: "none",
                background: "transparent",
                color: C.textSec,
                borderLeft: "3px solid transparent",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isDarkMode ? "rgba(154,47,61,0.25)" : C.maroonSoft,
                color: C.maroon,
              }}>
                {ADMIN?.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, lineHeight: 1.2, color: C.text }}>
                  {ADMIN?.label}
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: C.textMuted, marginTop: 1.5 }}>
                  {ADMIN?.desc}
                </div>
              </div>
            </a>
          </>)}
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div style={{ padding: "10px 10px 8px", borderTop: `1px solid ${C.border}`, marginTop: 8, flexShrink: 0 }}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="ras-navlink"
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 12, border: "none",
              background: "transparent", cursor: "pointer", marginBottom: 4,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isDarkMode ? "rgba(232,185,35,0.12)" : C.goldSoft,
              color: C.gold,
            }}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>
                {isDarkMode ? "Day Mode" : "Night Mode"}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: C.textMuted, marginTop: 1.5 }}>Toggle theme</div>
            </div>
            {/* Toggle pill */}
            <div style={{
              width: 36, height: 20, borderRadius: 10,
              background: isDarkMode ? C.gold : C.border,
              position: "relative", transition: "background .2s", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 2, left: isDarkMode ? 18 : 2, width: 16, height: 16,
                borderRadius: "50%", background: isDarkMode ? C.maroonDark : "#fff",
                transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }} />
            </div>
          </button>

          <div style={{ height: 1, background: C.border, margin: "4px 0 8px" }} />

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={handleLogout}
              className="ras-navlink"
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12, border: "none",
                background: "transparent", cursor: "pointer",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isDarkMode ? "rgba(248,113,113,0.15)" : "#FEF2F2",
                color: C.red,
              }}>
                <LogOut size={16} />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: C.red, lineHeight: 1.2 }}>Log Out</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: C.textMuted, marginTop: 1.5 }}>Sign out of account</div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12, border: "none",
                background: C.maroon, cursor: "pointer",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.15)", color: "#fff",
              }}>
                <LogIn size={16} />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Log In / Sign Up</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,247,228,0.65)", marginTop: 1.5 }}>Free account</div>
              </div>
            </button>
          )}
        </div>
      </nav>

      {/* ── TOP HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
        height: 60,
        background: isDarkMode ? "rgba(43,15,20,0.97)" : "rgba(255,255,255,0.97)",
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center",
        padding: "0 18px",
        boxShadow: isDarkMode ? "0 1px 16px rgba(0,0,0,0.4)" : "0 1px 12px rgba(0,0,0,0.06)",
        transition: "background .3s",
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="ras-hdrbtn"
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: open ? C.activeBg : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: open ? C.gold : C.textSec,
            flexShrink: 0, marginRight: 12,
            transition: "all .2s",
          }}
          aria-label="Toggle menu"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>

        {/* Logo */}
        <Link to={isGate ? "/gate" : "/dashboard"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9, marginRight: "auto" }}>
          {isGate ? (
            <img src="/gate_logo.png" alt="GATE" style={{ height: 34, width: 34, objectFit: "contain", background: "white", borderRadius: 8, padding: 3, border: "1px solid rgba(27,107,53,0.3)" }} />
          ) : (
            <RASLogo size={34} text={BRAND?.logoText || "RA"} />
          )}
          <div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 14, lineHeight: 1, color: C.text }}>
              {isGate ? "GATE " : "RAS "}
              <span style={{ color: isGate ? "#27AE60" : C.gold }}>ACADEMY</span>
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginTop: 1.5 }}>
              {isGate ? "GATE CSE PYQs" : "Premier RPSC Prep"}
            </div>
          </div>
        </Link>

        {/* Right: theme + user */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle — pill switch */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light" : "Switch to Dark"}
            style={{
              width: 46, height: 26, borderRadius: 13, border: "none",
              background: isDarkMode ? "#E8B923" : "#EADFC8",
              position: "relative", cursor: "pointer",
              transition: "background 0.25s", flexShrink: 0, padding: 0, outline: "none",
            }}
          >
            <div style={{
              position: "absolute", top: 3, left: isDarkMode ? 23 : 3, width: 20, height: 20,
              borderRadius: "50%",
              background: isDarkMode ? "#2B0F14" : "#5C0F14",
              transition: "left 0.25s",
              boxShadow: "0 1px 5px rgba(0,0,0,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isDarkMode ? <Sun size={10} color="#E8B923" /> : <Moon size={10} color="#fff" />}
            </div>
          </button>

          {/* Auth */}
          {user ? (
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.maroon}, ${C.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 13, color: "#fff",
              flexShrink: 0, cursor: "pointer",
              border: `2px solid ${C.gold}`,
              title: user.displayName || user.email,
            }}>
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "7px 16px", borderRadius: 20, border: "none",
                background: C.maroon, color: "#fff", cursor: "pointer",
                fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 12,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <LogIn size={13} /> Login
            </button>
          )}
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main style={{ paddingTop: 60, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
