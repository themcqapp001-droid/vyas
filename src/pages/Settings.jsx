import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";
import { updateProfile, updatePassword, signOut, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import AppLayout from "./AppLayout";
import {
  User, Lock, Shield, Eye, EyeOff, Sun, Moon, LogOut,
  CheckCircle, AlertCircle, Save, RefreshCw
} from "lucide-react";

/* ─── THEME ─────────────────────────────────────────────────────── */
function useC(dark) {
  return dark ? {
    bg: "#0C1220", surface: "#111827", border: "#263247",
    text: "#E8F0FE", textSec: "#8EA7C5", textMuted: "#4A5E7A",
    input: "#1A2235", inputBorder: "#263247", inputFocus: "#D4AF37",
    gold: "#D4AF37", maroon: "#5B0A14",
    btnBg: "linear-gradient(135deg,#3A0710,#5B0A14)",
    btnText: "#FFF7E8",
    badge: "rgba(212,175,55,0.12)", badgeText: "#D4AF37",
    danger: "#F87171", dangerBg: "rgba(248,113,113,0.1)",
    success: "#34D399", successBg: "rgba(52,211,153,0.1)",
    card: "#111827", cardBorder: "#1E3355",
  } : {
    bg: "#FBF1E1", surface: "#FFFFFF", border: "#EDE0C8",
    text: "#2C2C2A", textSec: "#5F5E5A", textMuted: "#8A7A6C",
    input: "#FFFFFF", inputBorder: "rgba(212, 175, 55, 0.3)", inputFocus: "#7A1F2B",
    gold: "#D4AF37", maroon: "#7A1F2B",
    btnBg: "linear-gradient(135deg,#5C1A22,#7A1F2B)",
    btnText: "#F5E9D9",
    badge: "rgba(122,31,43,0.08)", badgeText: "#7A1F2B",
    danger: "#E0455B", dangerBg: "rgba(224,69,91,0.08)",
    success: "#0FA36B", successBg: "rgba(15,163,107,0.08)",
    card: "#FFFFFF", cardBorder: "#EDE0C8",
  };
}

/* ─── SECTION CARD ──────────────────────────────────────────────── */
function SectionCard({ title, icon, children, C }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`,
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20,
    }}>
      <div style={{
        padding: "18px 24px", borderBottom: `1px solid ${C.cardBorder}`,
        display: "flex", alignItems: "center", gap: 12,
        background: `linear-gradient(135deg,rgba(91,10,20,0.04),transparent)`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: C.badge, color: C.badgeText,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "Poppins,sans-serif" }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

/* ─── INPUT ─────────────────────────────────────────────────────── */
function Input({ label, type = "text", value, onChange, placeholder, disabled, suffix, C }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
          textTransform: "uppercase", color: C.gold, marginBottom: 7,
          fontFamily: "Inter,sans-serif",
        }}>{label}</label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: suffix ? "12px 44px 12px 14px" : "12px 14px",
            background: C.input, border: `1.5px solid ${focused ? C.inputFocus : C.inputBorder}`,
            borderRadius: 10, fontSize: 13, color: C.text, fontFamily: "Inter,sans-serif",
            outline: "none", transition: "border-color .2s",
            opacity: disabled ? 0.5 : 1,
          }}
        />
        {suffix && (
          <div style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            color: C.textMuted, cursor: "pointer",
          }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── STATUS BANNER ─────────────────────────────────────────────── */
function StatusBanner({ msg, C }) {
  if (!msg.text) return null;
  const isErr = msg.type === "error";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
      borderRadius: 10, marginBottom: 18,
      background: isErr ? C.dangerBg : C.successBg,
      border: `1px solid ${isErr ? C.danger : C.success}`,
      fontSize: 13, color: isErr ? C.danger : C.success,
    }}>
      {isErr ? <AlertCircle size={15}/> : <CheckCircle size={15}/>}
      <span style={{ fontFamily: "Inter,sans-serif" }}>{msg.text}</span>
    </div>
  );
}

/* ─── SAVE BUTTON ───────────────────────────────────────────────── */
function SaveBtn({ loading, children, onClick, C }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: C.btnBg, color: C.btnText,
        border: "1px solid rgba(212,175,55,0.4)",
        padding: "11px 22px", borderRadius: 10,
        fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 13,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", gap: 8,
        opacity: loading ? 0.7 : 1, transition: "opacity .2s",
      }}
    >
      {loading ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }}/> : <Save size={14}/>}
      {loading ? "Saving..." : children}
    </button>
  );
}

/* ─── MAIN ──────────────────────────────────────────────────────── */
export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const C = useC(isDarkMode);
  const navigate = useNavigate();
  const isGuest = !user;
  const isGoogleUser = user?.providerData?.some(p => p.providerId === "google.com");

  const [name, setName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState({ profile: false, password: false });
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const flash = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  /* Update display name */
  const handleUpdateProfile = async () => {
    if (isGuest) return flash("error", "Please log in to update your profile.");
    if (!name.trim()) return flash("error", "Display name cannot be empty.");
    setLoading(l => ({ ...l, profile: true }));
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      flash("success", "Display name updated successfully!");
    } catch (err) {
      flash("error", err.message.replace("Firebase:", "").trim());
    } finally {
      setLoading(l => ({ ...l, profile: false }));
    }
  };

  /* Update password */
  const handleUpdatePassword = async () => {
    if (isGuest) return flash("error", "Please log in to change your password.");
    if (newPassword.length < 6) return flash("error", "Password must be at least 6 characters.");
    setLoading(l => ({ ...l, password: true }));
    try {
      await updatePassword(auth.currentUser, newPassword);
      flash("success", "Password changed successfully!");
      setNewPassword("");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        flash("error", "Session expired. Please log out and sign in again, then retry.");
      } else {
        flash("error", err.message.replace("Firebase:", "").trim());
      }
    } finally {
      setLoading(l => ({ ...l, password: false }));
    }
  };

  /* Logout */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <AppLayout title="Settings">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .settings-input:focus { outline: none; }
      `}</style>
      <div style={{
        minHeight: "100vh", background: C.bg, paddingTop: 60,
        transition: "background .3s, color .3s",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 60px" }}>

          {/* ── Page header ── */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 700,
              color: C.text, fontFamily: "Cinzel,serif",
            }}>
              Configuration Settings
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: C.textSec, fontFamily: "Inter,sans-serif" }}>
              Manage credentials, UI mode, and platform preferences
            </p>
            <div style={{ width: 56, height: 3, background: "linear-gradient(90deg,#5B0A14,#D4AF37)", borderRadius: 2, marginTop: 12 }}/>
          </div>

          {/* ── Status Banner ── */}
          <StatusBanner msg={statusMsg} C={C} />

          {/* ── Guest Notice ── */}
          {isGuest && (
            <div style={{
              padding: "14px 18px", borderRadius: 12, marginBottom: 20,
              background: C.badge, border: `1px solid ${C.cardBorder}`,
              display: "flex", alignItems: "center", gap: 12,
              fontSize: 13, color: C.badgeText, fontFamily: "Inter,sans-serif",
            }}>
              <AlertCircle size={16}/>
              <span>You are browsing as a guest. <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: C.gold, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Sign in</button> to access all settings.</span>
            </div>
          )}

          {/* ── Display Profile ── */}
          <SectionCard title="Display Profile" icon={<User size={16}/>} C={C}>
            <Input
              label="Display Name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your display name"
              disabled={isGuest}
              C={C}
            />
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", color: C.gold, marginBottom: 7,
                fontFamily: "Inter,sans-serif",
              }}>Registered Email</label>
              <div style={{
                padding: "12px 14px", background: C.input, border: `1.5px solid ${C.inputBorder}`,
                borderRadius: 10, fontSize: 13, color: C.textSec,
                fontFamily: "Inter,sans-serif", opacity: 0.7,
              }}>
                {user?.email || "—"}
              </div>
            </div>
            <SaveBtn loading={loading.profile} onClick={handleUpdateProfile} C={C}>
              Save Display Name
            </SaveBtn>
          </SectionCard>

          {/* ── Reset Password ── */}
          <SectionCard title="Reset Password" icon={<Lock size={16}/>} C={C}>
            {isGoogleUser ? (
              <div style={{
                padding: "14px 18px", borderRadius: 12,
                background: C.badge, border: `1px solid ${C.cardBorder}`,
                fontSize: 13, color: C.textSec, fontFamily: "Inter,sans-serif",
                lineHeight: 1.5
              }}>
                ℹ️ You are signed in with Google. Passwords for Google accounts are managed directly via your Google Account settings.
              </div>
            ) : (
              <>
                <Input
                  label="New Password"
                  type={showPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter minimum 6 characters"
                  disabled={isGuest}
                  suffix={
                    <div onClick={() => setShowPwd(v => !v)} style={{ cursor: "pointer" }}>
                      {showPwd ? <EyeOff size={15} color={C.textMuted}/> : <Eye size={15} color={C.textMuted}/>}
                    </div>
                  }
                  C={C}
                />
                <SaveBtn loading={loading.password} onClick={handleUpdatePassword} C={C}>
                  Change Account Password
                </SaveBtn>
              </>
            )}
          </SectionCard>

          {/* ── Platform Security Status ── */}
          <SectionCard title="Platform Security Status" icon={<Shield size={16}/>} C={C}>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { label: "Email Verified", value: user?.emailVerified ? "Verified ✓" : "Not Verified", ok: user?.emailVerified },
                { label: "Account Type", value: user ? "Registered User" : "Guest", ok: !!user },
                { label: "Auth Provider", value: user?.providerData?.[0]?.providerId || "—", ok: true },
                { label: "Session Status", value: user ? "Active & Secure" : "Not authenticated", ok: !!user },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 14px", borderRadius: 10,
                  background: C.badge, border: `1px solid ${C.cardBorder}`,
                }}>
                  <span style={{ fontSize: 13, color: C.textSec, fontFamily: "Inter,sans-serif" }}>{row.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, fontFamily: "Inter,sans-serif",
                    color: row.ok ? C.success : C.danger,
                  }}>{row.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── UI Preferences ── */}
          <SectionCard title="UI Preferences" icon={isDarkMode ? <Moon size={16}/> : <Sun size={16}/>} C={C}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 12,
              background: C.badge, border: `1px solid ${C.cardBorder}`,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "Poppins,sans-serif" }}>
                  {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
                </div>
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 3, fontFamily: "Inter,sans-serif" }}>
                  {isDarkMode ? "Switch to light theme for day study sessions" : "Switch to dark theme for night study"}
                </div>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
                  background: isDarkMode ? "linear-gradient(135deg,#3A0710,#5B0A14)" : "#D4AF37",
                  position: "relative", transition: "background .3s",
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute", top: 3, width: 22, height: 22, borderRadius: "50%",
                  background: "#fff", transition: "left .3s",
                  left: isDarkMode ? 4 : 26,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isDarkMode ? <Moon size={11} color="#5B0A14"/> : <Sun size={11} color="#D4AF37"/>}
                </div>
              </button>
            </div>
          </SectionCard>

          {/* ── Logout ── */}
          {user && (
            <SectionCard title="Account Actions" icon={<LogOut size={16}/>} C={C}>
              <p style={{ fontSize: 13, color: C.textSec, marginBottom: 16, fontFamily: "Inter,sans-serif", lineHeight: 1.6 }}>
                You are signed in as <strong style={{ color: C.text }}>{user.email}</strong>. Signing out will clear your session.
              </p>
              <button
                onClick={handleLogout}
                style={{
                  background: C.dangerBg, color: C.danger,
                  border: `1px solid ${C.danger}`, padding: "10px 20px",
                  borderRadius: 10, fontFamily: "Poppins,sans-serif", fontWeight: 700,
                  fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <LogOut size={14}/> Sign Out
              </button>
            </SectionCard>
          )}

          {/* Footer watermark */}
          <div style={{ textAlign: "center", paddingTop: 8 }}>
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "Inter,sans-serif" }}>
              © 2026 THEMCQAPP • Configuration Console v2.0
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
