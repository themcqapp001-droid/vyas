import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { Mail, Lock, User, ArrowRight, AlertCircle, X, Sun, Moon, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

/* ── Color Palettes (matches TheMCQ App homepage) ─────────────────── */
const LIGHT = {
  pageBg:     "#FBF1E1",
  cardBg:     "#FFFFFF",
  headerBg:   "#5C1A22",
  border:     "#EDE0C8",
  borderFocus:"#D4AF37",
  text:       "#2C2C2A",
  textSec:    "#5F5E5A",
  textMuted:  "#8A7A6C",
  inputBg:    "#FBF1E1",
  inputText:  "#2C2C2A",
  maroon:     "#7A1F2B",
  maroonDark: "#5C1A22",
  maroonSoft: "#F5E6D3",
  gold:       "#D4AF37",
  goldSoft:   "#E8C158",
  btnPrimary: "#7A1F2B",
  btnText:    "#F5E9D9",
  linkColor:  "#7A1F2B",
  errBg:      "#FEF2F2",
  errBorder:  "#E0455B",
  errText:    "#C0392B",
  divider:    "#EDE0C8",
  iconColor:  "#8A7A6C",
  googleBg:   "#FFFFFF",
  googleBorder:"#EDE0C8",
  googleText: "#2C2C2A",
};
const DARK = {
  pageBg:     "#1A1015",
  cardBg:     "#1F1417",
  headerBg:   "#2B0F14",
  border:     "rgba(212,175,55,0.25)",
  borderFocus:"#E8B923",
  text:       "#F5E9D9",
  textSec:    "#C9BBA8",
  textMuted:  "#8A7A6C",
  inputBg:    "#2A1417",
  inputText:  "#F5E9D9",
  maroon:     "#9A2F3D",
  maroonDark: "#2B0F14",
  maroonSoft: "#2A1417",
  gold:       "#E8B923",
  goldSoft:   "rgba(212,175,55,0.15)",
  btnPrimary: "#7A1F2B",
  btnText:    "#F5E9D9",
  linkColor:  "#E8B923",
  errBg:      "rgba(224,69,91,0.1)",
  errBorder:  "#F87171",
  errText:    "#F87171",
  divider:    "rgba(212,175,55,0.2)",
  iconColor:  "#8A7A6C",
  googleBg:   "#2A1417",
  googleBorder:"rgba(212,175,55,0.3)",
  googleText: "#F5E9D9",
};

/* ── RAS Logo Mark ─────────────────────────────────────────────────── */
function RASMark({ size = 52 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "24%",
      background: "linear-gradient(135deg, #3A0710, #5B0A14)",
      border: "2px solid rgba(212,175,55,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 20px rgba(92,15,20,0.4)",
    }}>
      <GraduationCap size={size * 0.48} color="#D4AF37" />
    </div>
  );
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const C = isDarkMode ? DARK : LIGHT;

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  /* load fonts */
  useEffect(() => {
    const id = "auth-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const VYAS_API = import.meta.env.VITE_VYAS_API_URL || "http://localhost:8000/api/v1";
      const baseUrl = VYAS_API.replace('/api/v1', '/api'); 
      const endpoint = isSignUp ? "/auth/signup" : "/auth/login";
      
      const body = new FormData();
      body.append("email", email.trim());
      body.append("password", password);
      if (isSignUp) {
        body.append("name", name.trim() || "Student");
        body.append("exam", "UPSC"); // default or add select
      }

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        body: body,
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || "Authentication failed");
      }
      
      // Update AuthContext (the context now has a login function)
      // We will just set the token and call refreshUser
      localStorage.setItem("vyas_token", data.token);
      window.location.href = "/dashboard"; // hard reload to trigger context fetch
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };
  const inputStyle = (focused) => ({
    width: "100%",
    paddingLeft: 42, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
    borderRadius: 12,
    border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
    background: C.inputBg,
    color: C.inputText,
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    outline: "none",
    transition: "border-color .2s",
    boxSizing: "border-box",
  });

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: C.pageBg,
      display: "flex", flexDirection: "column",
      fontFamily: "Inter, sans-serif",
      transition: "background .3s, color .3s",
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        width: "100%",
        background: "linear-gradient(135deg, #3A0710, #5B0A14 50%, #7A1520)",
        borderBottom: "1.5px solid rgba(212,175,55,0.4)",
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo + Brand */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "rgba(212,175,55,0.15)",
            border: "1.5px solid rgba(212,175,55,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={17} color="#D4AF37" />
          </div>
          <div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 14, color: "#FFF7E8", lineHeight: 1 }}>
              RAS <span style={{ color: "#D4AF37" }}>ACADEMY</span>
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,247,232,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 1.5 }}>
              Premier RPSC Prep
            </div>
          </div>
        </Link>
        {/* Right: Theme + Go to Home */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={toggleTheme}
            style={{
              width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(212,175,55,0.35)",
              background: "rgba(255,255,255,0.1)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37",
            }}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link to="/" style={{
            fontSize: 12, fontWeight: 600, color: "rgba(255,247,228,0.75)",
            textDecoration: "none", fontFamily: "Inter, sans-serif",
          }}>← Back to site</Link>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Card */}
          <div style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: "36px 32px",
            boxShadow: isDarkMode
              ? "0 8px 40px rgba(0,0,0,0.5)"
              : "0 8px 40px rgba(92,15,20,0.1)",
          }}>

            {/* Card Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <RASMark size={56} />
              </div>
              <h1 style={{
                fontFamily: "Cinzel, serif",
                fontSize: 22, fontWeight: 800,
                color: C.gold, margin: 0, letterSpacing: "0.04em",
              }}>
                {isSignUp ? "Join RAS Academy" : "Welcome Back"}
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.textSec, marginTop: 6 }}>
                {isSignUp
                  ? "Create your free RPSC prep account"
                  : "Log in to continue your RAS journey"}
              </p>

              {/* Gold divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.border})` }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  RPSC · RAS · RPSC Mains
                </span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.border})` }} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                borderRadius: 10, padding: "10px 14px", marginBottom: 18,
                display: "flex", alignItems: "flex-start", gap: 8,
                background: C.errBg, border: `1px solid ${C.errBorder}`, color: C.errText,
                fontSize: 12,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Name (Sign Up) */}
              {isSignUp && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.iconColor }} />
                    <input
                      type="text" required placeholder="Enter your full name"
                      value={name} onChange={e => setName(e.target.value)}
                      style={inputStyle(false)}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.iconColor }} />
                  <input
                    type="email" required placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.iconColor }} />
                  <input
                    type={showPass ? "text" : "password"} required placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle(false), paddingRight: 42 }}
                  />
                  <button
                    type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.iconColor, padding: 2 }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Privacy checkbox */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
                <input
                  type="checkbox" id="auth-agree" checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: C.gold, cursor: "pointer", flexShrink: 0 }}
                />
                <label htmlFor="auth-agree" style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  I agree to the{" "}
                  <button type="button" onClick={() => setShowPrivacy(true)} style={{ background: "none", border: "none", color: C.linkColor, fontWeight: 700, cursor: "pointer", fontSize: 11, padding: 0, textDecoration: "underline" }}>
                    Privacy Policy
                  </button>
                  {" "}and{" "}
                  <button type="button" onClick={() => setShowTerms(true)} style={{ background: "none", border: "none", color: C.linkColor, fontWeight: 700, cursor: "pointer", fontSize: 11, padding: 0, textDecoration: "underline" }}>
                    Terms of Service
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreed}
                style={{
                  width: "100%", padding: "13px", borderRadius: 12, border: "none",
                  background: (!agreed || loading) ? C.maroonSoft : C.btnPrimary,
                  color: (!agreed || loading) ? C.textMuted : C.btnText,
                  fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 700,
                  cursor: (!agreed || loading) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all .2s", letterSpacing: "0.02em",
                }}
              >
                {loading ? "Please wait..." : isSignUp ? "Create Free Account" : "Log In"}
                {!loading && <ArrowRight size={16} />}
              </button>

            </form>

            {/* Toggle sign in / sign up */}
            <div style={{ marginTop: 22, textAlign: "center", borderTop: `1px solid ${C.divider}`, paddingTop: 18 }}>
              <p style={{ fontSize: 12, color: C.textSec, fontFamily: "Inter, sans-serif" }}>
                {isSignUp ? "Already have an account?" : "New to RAS Academy?"}{" "}
                <button
                  onClick={() => { setIsSignUp(v => !v); setError(""); }}
                  style={{ background: "none", border: "none", color: C.gold, fontWeight: 700, cursor: "pointer", fontSize: 12, textDecoration: "underline" }}
                >
                  {isSignUp ? "Log In" : "Sign Up Free"}
                </button>
              </p>
            </div>
          </div>

          {/* Bottom tagline */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 11, color: C.textMuted, fontFamily: "Inter, sans-serif" }}>
              🎯 Rajasthan's Premier AI-powered RPSC Prep Platform
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {["RAS / RPSC", "REET", "RPSC Mains", "Rajasthan GK"].map(tag => (
                <span key={tag} style={{
                  fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: isDarkMode ? "rgba(232,185,35,0.12)" : "#FCEFD1",
                  color: C.gold, border: `1px solid ${isDarkMode ? "rgba(232,185,35,0.25)" : "#EADFC8"}`,
                  letterSpacing: "0.05em",
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PRIVACY POLICY MODAL ── */}
      {showPrivacy && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <div style={{ width: "100%", maxWidth: 480, borderRadius: 20, padding: 28, position: "relative", maxHeight: "80vh", overflowY: "auto", background: C.cardBg, border: `1px solid ${C.border}`, color: C.text }}>
            <button onClick={() => setShowPrivacy(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 16 }}>Privacy Policy</h3>
            <div style={{ fontSize: 12, lineHeight: 1.8, color: C.textSec, display: "flex", flexDirection: "column", gap: 10 }}>
              <p>At The MCQ App, we prioritize your data security and privacy. This Privacy Policy details how we collect, use, and protect your information.</p>
              <p><strong style={{ color: C.text }}>1. Data We Collect:</strong> We collect basic information like email address and profile name via Firebase Authentication to create your study profile. Performance logs are stored securely in our Supabase database.</p>
              <p><strong style={{ color: C.text }}>2. Data Security:</strong> All user credentials are encrypted by Firebase Auth. Your study histories are never sold or shared with any third party.</p>
              <p><strong style={{ color: C.text }}>3. AI Policy:</strong> Our AI engines process only your requested practice topic contexts and do not store personalized student data.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ width: "100%", padding: "11px", marginTop: 20, borderRadius: 12, border: "none", background: C.maroon, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Close</button>
          </div>
        </div>
      )}

      {/* ── TERMS OF SERVICE MODAL ── */}
      {showTerms && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <div style={{ width: "100%", maxWidth: 480, borderRadius: 20, padding: 28, position: "relative", maxHeight: "80vh", overflowY: "auto", background: C.cardBg, border: `1px solid ${C.border}`, color: C.text }}>
            <button onClick={() => setShowTerms(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 16 }}>Terms of Service</h3>
            <div style={{ fontSize: 12, lineHeight: 1.8, color: C.textSec, display: "flex", flexDirection: "column", gap: 10 }}>
              <p>Welcome to RAS Academy — The MCQ App. By accessing our platform, you agree to comply with the following Terms of Service.</p>
              <p><strong style={{ color: C.text }}>1. Account Registration:</strong> Users must register a valid account to log streaks and save history. You are responsible for maintaining password confidentiality.</p>
              <p><strong style={{ color: C.text }}>2. Use of AI Tools:</strong> Custom question generation is probabilistic. We make no guarantees about the literal occurrence of generated questions in RPSC/UPSC exams.</p>
              <p><strong style={{ color: C.text }}>3. Proprietary Material:</strong> All uploaded mock tests, custom vectors, and syllabus tag trees are properties of The MCQ App. Reverse engineering or scraping the question bank is strictly prohibited.</p>
            </div>
            <button onClick={() => setShowTerms(false)} style={{ width: "100%", padding: "11px", marginTop: 20, borderRadius: 12, border: "none", background: C.maroon, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
