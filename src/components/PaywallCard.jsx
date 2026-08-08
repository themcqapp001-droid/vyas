/**
 * PaywallCard.jsx — three-tier pricing UI in the maroon/gold/cream palette.
 * Upgrade buttons call paymentProvider.startCheckout(), which currently throws
 * PAYMENTS_NOT_CONFIGURED — the UI handles that gracefully.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, Crown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { PLANS } from "../config/plans";
import { startCheckout } from "../lib/paymentProvider";

const C_LIGHT = {
  bg: "#FBF1E1", surface: "#FFFFFF", border: "#EDE0C8", text: "#2C2C2A",
  textSec: "#5F5E5A", maroon: "#7A1F2B", maroonDark: "#5C1A22", gold: "#D4AF37",
};
const C_DARK = {
  bg: "#1A1015", surface: "#1F1417", border: "rgba(212,175,55,0.25)", text: "#F5E9D9",
  textSec: "#C9BBA8", maroon: "#9A2F3D", maroonDark: "#2B0F14", gold: "#E8B923",
};

export default function PaywallCard({ featureLabel = "This feature", compact = false }) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const C = isDarkMode ? C_DARK : C_LIGHT;
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  async function onUpgrade(planId) {
    if (!user) { navigate("/login"); return; }
    setBusy(planId); setMsg("");
    try {
      await startCheckout(planId);
    } catch (e) {
      setMsg(
        e.message === "PAYMENTS_NOT_CONFIGURED"
          ? "Payments abhi live nahi hain. WhatsApp 9602229472 ya Telegram @THEMCQRPSC par message karein — manual activation ho jayega."
          : "Kuch galat ho gaya. Thodi der baad try karein."
      );
    } finally { setBusy(""); }
  }

  return (
    <div style={{ padding: compact ? "24px 16px" : "48px 20px", background: C.bg, minHeight: compact ? "auto" : "70vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
          borderRadius: 999, background: isDarkMode ? "rgba(232,185,35,0.12)" : "rgba(122,31,43,0.08)",
          color: C.maroon, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 14,
        }}>
          <Lock size={13} /> {featureLabel} is a paid feature
        </div>

        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: compact ? 26 : 34, color: C.text, margin: "0 0 8px" }}>
          Choose your plan
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.textSec, margin: "0 0 32px" }}>
          Cancel anytime. All plans include full PYQ access and test analytics.
        </p>

        <div style={{
          display: "grid", gap: 18,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          alignItems: "stretch",
        }}>
          {PLANS.map((p) => (
            <div key={p.id} style={{
              background: C.surface,
              border: `1px solid ${p.highlight ? C.gold : C.border}`,
              borderRadius: 18, padding: "26px 22px", textAlign: "left",
              boxShadow: p.highlight ? `0 10px 40px ${isDarkMode ? "rgba(0,0,0,.55)" : "rgba(122,31,43,.12)"}` : "none",
              position: "relative", display: "flex", flexDirection: "column",
            }}>
              {p.highlight && (
                <div style={{
                  position: "absolute", top: -12, right: 18, padding: "4px 12px", borderRadius: 999,
                  background: `linear-gradient(135deg, ${C.maroonDark}, ${C.maroon})`, color: C.gold,
                  fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".08em",
                  display: "flex", alignItems: "center", gap: 5,
                }}><Crown size={11} /> MOST POPULAR</div>
              )}

              <div style={{ fontFamily: "Cinzel, serif", fontSize: 20, fontWeight: 800, color: C.maroon }}>{p.name}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.textSec, marginTop: 2 }}>{p.tagline}</div>

              <div style={{ margin: "18px 0 16px", display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "Cinzel, serif", fontSize: 34, fontWeight: 800, color: C.text }}>₹{p.price}</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.textSec }}>{p.period}</span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} style={{
                    display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9,
                    fontFamily: "Inter, sans-serif", fontSize: 13, color: C.textSec, lineHeight: 1.45,
                  }}>
                    <Check size={15} style={{ color: C.gold, flexShrink: 0, marginTop: 2 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onUpgrade(p.id)}
                disabled={busy === p.id}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12, border: "none",
                  cursor: busy === p.id ? "wait" : "pointer",
                  background: p.highlight
                    ? `linear-gradient(135deg, ${C.maroonDark}, ${C.maroon})`
                    : "transparent",
                  color: p.highlight ? C.gold : C.maroon,
                  boxShadow: p.highlight ? "none" : `inset 0 0 0 1px ${C.maroon}`,
                  fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
                }}
              >
                {busy === p.id ? "Please wait…" : `Upgrade to ${p.name}`}
              </button>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{
            marginTop: 22, padding: "12px 16px", borderRadius: 12,
            background: isDarkMode ? "rgba(232,185,35,0.10)" : "rgba(212,175,55,0.14)",
            border: `1px solid ${C.gold}`, color: C.text,
            fontFamily: "Inter, sans-serif", fontSize: 13, maxWidth: 620, margin: "22px auto 0",
          }}>{msg}</div>
        )}
      </div>
    </div>
  );
}
