import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../supabase";
import AppLayout from "./AppLayout";
import {
  Trophy, Calendar, AlertCircle, Award, RefreshCw, AlertTriangle,
  TrendingUp, CheckCircle, BarChart3, CheckSquare, XSquare, BookOpen
} from "lucide-react";

/* ─── PALACE COLORS ──────────────────────────────────────────────── */
function useC(dark) {
  return dark ? {
    bg: "#0C1220", surface: "#111827", surfaceAlt: "#1A2235",
    border: "#263247", text: "#E8F0FE", textSec: "#8EA7C5", textMuted: "#4A5E7A",
    gold: "#D4AF37", goldSoft: "rgba(212,175,55,0.12)",
    maroon: "#5B0A14", maroonDark: "#3A0710",
    cream: "#FFF7E8",
    green: "#34D399", greenSoft: "rgba(52,211,153,0.12)",
    red: "#F87171", redSoft: "rgba(248,113,113,0.12)"
  } : {
    bg: "#FBF1E1", surface: "#FFFFFF", surfaceAlt: "#F5E6D3",
    border: "#EDE0C8", text: "#2C2C2A", textSec: "#5F5E5A", textMuted: "#8A7A6C",
    gold: "#D4AF37", goldSoft: "rgba(212,175,55,0.12)",
    maroon: "#7A1F2B", maroonDark: "#5C1A22",
    cream: "#F5E6D3",
    green: "#0FA36B", greenSoft: "#EAFBF3",
    red: "#E0455B", redSoft: "#FDEDEF"
  };
}

export default function TestHistory() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const C = useC(isDarkMode);
  const navigate = useNavigate();
  const isGuest = !user;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (isGuest) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("test_history")
          .select("*")
          .eq("student_id", user.uid)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error("Error loading test history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user, isGuest]);

  /* Calculate Performance Metrics */
  const totalTests = history.length;
  
  const avgAccuracy = totalTests > 0
    ? Math.round(
        history.reduce((acc, curr) => acc + (curr.score * 100 / curr.total_questions), 0) / totalTests
      )
    : 0;

  const allMistakes = history.reduce((acc, curr) => {
    if (curr.wrong_answers) {
      curr.wrong_answers.forEach(topic => acc.add(topic));
    }
    return acc;
  }, new Set());

  const totalWrongCount = history.reduce((acc, curr) => {
    return acc + (curr.total_questions - curr.score);
  }, 0);

  const totalCorrectCount = history.reduce((acc, curr) => {
    return acc + curr.score;
  }, 0);

  /* SVG line chart plotter coordinates generator */
  const getSvgCoordinates = () => {
    if (totalTests === 0) return "";
    // Display last 6 test attempts (oldest to newest)
    const recentAttempts = [...history].slice(0, 6).reverse();
    const width = 450;
    const height = 120;
    const padding = 20;

    const points = recentAttempts.map((item, idx) => {
      const percentage = (item.score * 100) / item.total_questions;
      // X distributes evenly
      const x = padding + (idx * (width - 2 * padding)) / Math.max(recentAttempts.length - 1, 1);
      // Y scales inverted (accuracy 100% is Y=padding, 0% is Y=height-padding)
      const y = height - padding - (percentage * (height - 2 * padding)) / 100;
      return { x, y, percentage, date: new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) };
    });

    return points;
  };

  const chartPoints = getSvgCoordinates();

  return (
    <AppLayout title="Performance Logs">
      <div style={{ minHeight: "100vh", background: C.bg, paddingTop: 60, transition: "background .3s" }}>
        
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 80px" }}>
          
          {/* GUEST MODE LOCK */}
          {isGuest ? (
            <div style={{
              maxWidth: 420, margin: "60px auto 0", textAlign: "center",
              background: C.surface, border: `1.5px solid ${C.border}`,
              borderRadius: 24, padding: 36, boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: C.goldSoft,
                color: C.gold, display: "inline-flex", alignItems: "center",
                justifyContent: "center", marginBottom: 20
              }}>
                <Lock size={26} />
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>
                Performance Logs Locked
              </h2>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>
                Only registered students can access detailed test history logs, accuracy progress charts, and revision recommendations.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "12px 20px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#3A0710,#5B0A14)", color: "#FFF7E8",
                    fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", border: `1.5px solid ${C.gold}`
                  }}
                >
                  Log In or Register
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Header Title */}
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "Cinzel,serif" }}>
                  Your Performance Analytics
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textSec, fontFamily: "Inter" }}>
                  Real-time mock test records and weak syllabus highlights
                </p>
              </div>

              {/* METRICS TILES GRID */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16
              }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: ".05em" }}>TOTAL ATTEMPTS</span>
                    <Trophy size={16} color={C.gold}/>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>
                    {totalTests} <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>Tests</span>
                  </div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: ".05em" }}>AVERAGE ACCURACY</span>
                    <CheckCircle size={16} color={C.green}/>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>
                    {avgAccuracy}%
                  </div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: ".05em" }}>WEAK SUBJECTS</span>
                    <AlertCircle size={16} color={C.red}/>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>
                    {allMistakes.size} <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>Topics</span>
                  </div>
                </div>
              </div>

              {/* CHART & STATS DETAIL BLOCK */}
              {totalTests > 0 && (
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr", gap: 20
                }} className="history-grid-split">
                  
                  {/* Performance Chart Card */}
                  <div style={{
                    background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 20,
                    padding: 24, display: "flex", flexDirection: "column", gap: 14
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <TrendingUp size={16} color={C.gold}/>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Poppins" }}>Accuracy Trend Graph</span>
                    </div>

                    {/* SVG GRAPH PLOTTER */}
                    <div style={{ width: "100%", overflowX: "auto" }}>
                      <svg viewBox="0 0 450 120" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                        {/* Grid lines */}
                        <line x1="20" y1="20" x2="430" y2="20" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="3"/>
                        <line x1="20" y1="60" x2="430" y2="60" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="3"/>
                        <line x1="20" y1="100" x2="430" y2="100" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="3"/>

                        {/* Chart Curve Polyline */}
                        {chartPoints.length > 1 && (
                          <path
                            d={`M ${chartPoints.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                            fill="none"
                            stroke={C.gold}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Chart Data points circles */}
                        {chartPoints.map((p, idx) => (
                          <g key={idx}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4.5"
                              fill={C.bg}
                              stroke={C.gold}
                              strokeWidth="2.5"
                            />
                            {/* Text accuracy tooltip */}
                            <text
                              x={p.x}
                              y={p.y - 9}
                              textAnchor="middle"
                              style={{ fontSize: 8, fill: C.text, fontWeight: 700, fontFamily: "Inter" }}
                            >
                              {Math.round(p.percentage)}%
                            </text>
                            {/* Bottom Dates labels */}
                            <text
                              x={p.x}
                              y="114"
                              textAnchor="middle"
                              style={{ fontSize: 7, fill: C.textMuted, fontWeight: 500, fontFamily: "Inter" }}
                            >
                              {p.date}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Summary Breakdown Card */}
                  <div style={{
                    background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 20,
                    padding: 24, display: "flex", flexDirection: "column", gap: 14
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BarChart3 size={16} color={C.gold}/>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.gold, fontFamily: "Poppins" }}>Revision Checklist</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                        <span style={{ color: C.textSec }}>Total Questions Attempted:</span>
                        <strong style={{ color: C.text }}>{totalCorrectCount + totalWrongCount}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                        <span style={{ color: C.textSec }}>Correct Answers:</span>
                        <strong style={{ color: C.green }}>{totalCorrectCount}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                        <span style={{ color: C.textSec }}>Incorrect Mistakes:</span>
                        <strong style={{ color: C.red }}>{totalWrongCount}</strong>
                      </div>
                      <div style={{ height: 1, background: C.border, margin: "4px 0" }}/>
                      <div>
                        <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.gold, marginBottom: 6, textTransform: "uppercase" }}>
                          AI Recommendation:
                        </span>
                        <p style={{ margin: 0, fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>
                          Based on mistakes, prioritize review of **{allMistakes.size > 0 ? Array.from(allMistakes)[0] : "general strategy"}**. Attempt more targeted sets in the AI Generator.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* LOGS LIST */}
              <div>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Poppins" }}>
                  Completed Test Sheets
                </h3>

                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <RefreshCw size={24} className="spin" style={{ color: C.gold, display: "inline-block", animation: "spin 1s linear infinite" }}/>
                    <p style={{ fontSize: 12, color: C.textSec, marginTop: 8 }}>Loading attempts...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: 40, background: C.surface,
                    border: `1.5px solid ${C.border}`, borderRadius: 20
                  }}>
                    <AlertTriangle size={32} color={C.gold} style={{ marginBottom: 12 }}/>
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: C.text }}>No Completed Mock Tests Found</h4>
                    <p style={{ margin: "0 0 16px", fontSize: 12, color: C.textSec }}>Generate customized question sets to review your performance insights.</p>
                    <Link
                      to="/ai-generator"
                      style={{
                        padding: "8px 16px", borderRadius: 8, background: C.btnBg, color: C.btnText,
                        border: "none", fontFamily: "Poppins", fontWeight: 700, fontSize: 11,
                        textDecoration: "none", display: "inline-block"
                      }}
                    >
                      Start Mock Test
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    {history.map((item) => {
                      const date = new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      });
                      const percentage = Math.round((item.score * 100) / item.total_questions);
                      const wrong = item.wrong_answers || [];

                      return (
                        <div
                          key={item.id}
                          style={{
                            background: C.surface, border: `1.5px solid ${C.border}`,
                            borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textMuted }}>
                                <Calendar size={12}/>
                                <span>{date}</span>
                              </div>
                              <h4 style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 700, color: C.text }}>
                                Mock Test: Score {item.score} / {item.total_questions}
                              </h4>
                            </div>

                            <span style={{
                              fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                              background: percentage >= 70 ? C.greenSoft : percentage >= 45 ? C.goldSoft : C.redSoft,
                              color: percentage >= 70 ? C.green : percentage >= 45 ? C.gold : C.red
                            }}>
                              {percentage}% Correct
                            </span>
                          </div>

                          {wrong.length > 0 && (
                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                              <span style={{ display: "block", fontSize: 9, fontWeight: 700, color: C.red, textTransform: "uppercase", marginBottom: 6 }}>
                                Mistakes Revision Subjects:
                              </span>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {Array.from(new Set(wrong)).map((topic, tIdx) => (
                                  <span
                                    key={tIdx}
                                    style={{
                                      fontSize: 10, background: C.surfaceAlt, color: C.textSec,
                                      padding: "3px 8px", borderRadius: 6, fontWeight: 600, border: `1px solid ${C.border}`
                                    }}
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(min-width: 768px) {
          .history-grid-split { grid-template-columns: 1.5fr 1fr !important; }
        }
      `}</style>
    </AppLayout>
  );
}
