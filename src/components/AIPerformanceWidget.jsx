import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { TrendingUp, TrendingDown, CheckCircle, Sparkles } from "lucide-react";

export default function AIPerformanceWidget() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <section className="ras-section" style={{ background: isDarkMode ? "#1A1015" : "#FCFBF8", borderBottom: `1px solid ${isDarkMode ? "rgba(212,175,55,.25)" : "rgba(212,175,55,.1)"}` }}>
      <div className="ras-container">
        <div className="ras-fade in" style={{ transitionDelay: '0ms' }}>
          <div className="ras-section-title">
            <span style={{ color:"#D4AF37", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>RPSC Candidate Metrics</span>
            <h2 style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>AI Performance Indicators</h2>
            <div className="ras-gold-line"></div>
          </div>
        </div>

        <div className="ras-fade in" style={{ transitionDelay: '0ms' }}>
          <div className="ras-dashboard-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 20
          }}>
            
            {/* 1. MOCK TEST STATUS */}
            <div className="ras-dash-card" style={{ background: isDarkMode ? "#14161A" : "#fff", padding: 24, borderRadius: 16, border: `1px solid ${isDarkMode ? "#1F2228" : "#EAEAEA"}`, boxShadow: isDarkMode ? "0 8px 30px rgba(0,0,0,0.25)" : "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A227", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle size={14} /> Mock Test Status</h3>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexGrow:1, justifyContent:"center" }}>
                <div style={{
                  width: 130, height: 130, borderRadius: "50%",
                  background: isDarkMode ? "conic-gradient(#C9A227 0% 65%, rgba(212,175,55,0.08) 65% 100%)" : "conic-gradient(#3A0710 0% 65%, rgba(91,10,20,0.08) 65% 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", marginBottom: 16,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
                }}>
                  <div style={{
                    width: 106, height: 106, borderRadius: "50%",
                    background: isDarkMode ? "#1A1015" : "#fff", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: isDarkMode ? "#E8B923" : "#3A0710", lineHeight: 1 }}>65%</span>
                    <span style={{ fontSize: 9, color: isDarkMode ? "rgba(232,240,254,.6)" : "rgba(24,24,24,.5)", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>complete</span>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: isDarkMode ? "#F5E9D9" : "#3A0710", textAlign: "center" }}>Modern India – Ch. 8</span>
                <span style={{ fontSize: 11, color: isDarkMode ? "rgba(232,240,254,.6)" : "rgba(24,24,24,.5)", marginTop: 2, textAlign: "center" }}>65% complete • 52% confident</span>
              </div>
            </div>

            {/* 2. STRONG AREAS */}
            <div className="ras-dash-card" style={{ background: isDarkMode ? "#14161A" : "#fff", padding: 24, borderRadius: 16, border: `1px solid ${isDarkMode ? "#1F2228" : "#EAEAEA"}`, boxShadow: isDarkMode ? "0 8px 30px rgba(0,0,0,0.25)" : "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0FA36B", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={14} /> Strong Areas</h3>
              <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", gap: 16 }}>
                {[
                  { label: "History", val: 91 },
                  { label: "Polity", val: 88 },
                  { label: "Geography", val: 85 },
                ].map(item => (
                  <div key={item.label} className="ras-prog-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="ras-prog-lbl" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
                      <span style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>{item.label}</span>
                      <span style={{ color: isDarkMode ? "#E8B923" : "inherit" }}>{item.val}%</span>
                    </div>
                    <div className="ras-prog-bar" style={{ height: 6, borderRadius: 3, background: isDarkMode ? "rgba(232,185,35,0.06)" : "rgba(91,10,20,0.05)", overflow: "hidden" }}>
                      <div className="ras-prog-fill" style={{ width: `${item.val}%`, height: "100%", background: "#0FA36B", borderRadius: 3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. WEAK AREAS */}
            <div className="ras-dash-card" style={{ background: isDarkMode ? "#14161A" : "#fff", padding: 24, borderRadius: 16, border: `1px solid ${isDarkMode ? "#1F2228" : "#EAEAEA"}`, boxShadow: isDarkMode ? "0 8px 30px rgba(0,0,0,0.25)" : "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E0455B", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}><TrendingDown size={14} /> Weak Areas</h3>
              <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", gap: 16 }}>
                {[
                  { label: "Economy", val: 54 },
                  { label: "Environment", val: 61 },
                  { label: "Science & Tech", val: 58 },
                ].map(item => (
                  <div key={item.label} className="ras-prog-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="ras-prog-lbl" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
                      <span style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>{item.label}</span>
                      <span style={{ color: isDarkMode ? "#E8B923" : "inherit" }}>{item.val}%</span>
                    </div>
                    <div className="ras-prog-bar" style={{ height: 6, borderRadius: 3, background: isDarkMode ? "rgba(232,185,35,0.06)" : "rgba(91,10,20,0.05)", overflow: "hidden" }}>
                      <div className="ras-prog-fill" style={{ width: `${item.val}%`, height: "100%", background: "#E0455B", borderRadius: 3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. MAINS TEST SERIES & AI RECOMMENDATION */}
            <div className="ras-dash-card" style={{ background: isDarkMode ? "#14161A" : "#fff", padding: 24, borderRadius: 16, border: `1px solid ${isDarkMode ? "#1F2228" : "#EAEAEA"}`, boxShadow: isDarkMode ? "0 8px 30px rgba(0,0,0,0.25)" : "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A227", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={14} /> AI Recommendation</h3>
              <div className="ras-rec-box" style={{ background: isDarkMode ? "rgba(232,185,35,0.08)" : "rgba(255,247,232,0.4)", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <p style={{ margin:0, fontSize:12, color: isDarkMode ? "#F5E9D9" : "#3A0710", lineHeight:1.6, fontWeight:500 }}>
                  Indian Economy shows the highest frequency of wrong answers. Sync your Mains Test Series preparation and practice Indian Banking System to improve your score.
                </p>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color: isDarkMode ? "#F5E9D9" : "#3A0710" }}>Indian Banking System</div>
                    <div style={{ fontSize:10, color: isDarkMode ? "#E8B923" : "#A67C00", fontWeight:700, textTransform:"uppercase", marginTop:2 }}>Mains Recommended Module</div>
                  </div>
                </div>
                {/* Plugin Port Data (Hidden data-port attribute for external module connection) */}
                <button
                  data-plugin-port="mains-test-series-sync"
                  onClick={() => navigate("/ai-generator")}
                  style={{
                    width: "100%", padding: "10px", borderRadius: 10,
                    background: isDarkMode ? "linear-gradient(135deg,#9A2F3D,#2B0F14)" : "linear-gradient(135deg,#3A0710,#5B0A14)",
                    color: "#FFF7E8", border: "none",
                    fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 12,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  Sync & Practice →
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
