import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../supabase";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AppLayout from "./AppLayout";
import { useExam } from "../context/ExamContext";
import { getTopics } from "../config/topics";
import {
  Sparkles, AlertCircle, RefreshCw, X, Trophy,
  CheckCircle2, XCircle, BrainCircuit, ChevronDown
} from "lucide-react";

/* ─── PALACE THEME ──────────────────────────────────────────────── */
function useC(dark) {
  return dark ? {
    bg: "#0C1220", surface: "#111827", surfaceAlt: "#1A2235",
    border: "#263247", text: "#E8F0FE", textSec: "#8EA7C5", textMuted: "#4A5E7A",
    gold: "#D4AF37", maroon: "#5B0A14", maroonDark: "#3A0710",
    cream: "#FFF7E8",
    input: "#1A2235", inputBorder: "#263247",
    green: "#34D399", greenBg: "#103E2F",
    red: "#F87171", redBg: "#3D1A20",
    btnBg: "linear-gradient(135deg,#3A0710,#5B0A14)",
  } : {
    bg: "#FBF1E1", surface: "#FFFFFF", surfaceAlt: "#F5E6D3",
    border: "#EDE0C8", text: "#2C2C2A", textSec: "#5F5E5A", textMuted: "#8A7A6C",
    gold: "#D4AF37", maroon: "#7A1F2B", maroonDark: "#5C1A22",
    cream: "#F5E6D3",
    input: "#FFFFFF", inputBorder: "rgba(212, 175, 55, 0.3)",
    green: "#0FA36B", greenBg: "#EAFBF3",
    red: "#E0455B", redBg: "#FDEDEF",
    btnBg: "linear-gradient(135deg,#5C1A22,#7A1F2B)",
  };
}

/* ─── TOPICS ────────────────────────────────────────────────────
   Lists now live in src/config/topics.js and are selected per exam section. */

/* ─── API KEYS ───────────────────────────────────────────────────── */
const GROQ_KEYS = [import.meta.env.VITE_GROQ_API_KEY].filter(Boolean);
const GEMINI_KEYS = [import.meta.env.VITE_GEMINI_API_KEY].filter(Boolean);

/* ─── STYLES ─────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.5 } }
  @keyframes shimmer { 0%{ background-position:-200% center } 100%{ background-position:200% center } }
  .aig-spin { animation: spin 1s linear infinite; }
  .aig-pulse { animation: pulse 2s ease-in-out infinite; }
  .aig-option-btn { transition: all .18s; }
  .aig-option-btn:hover:not(:disabled) { transform: translateX(4px); }
  .aig-generate-btn { transition: all .2s; }
  .aig-generate-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
`;

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
export default function AiGenerator({ examType }) {
  const { examType: ctxExamType } = useExam();
  const DATABASE_TOPICS = getTopics(examType || ctxExamType || "IAS");
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const C = useC(isDarkMode);
  const navigate = useNavigate();
  const isGuest = !user;

  /* Form state */
  const [topic, setTopic] = useState("");
  const [topicSearch, setTopicSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropIdx, setActiveDropIdx] = useState(-1);
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  /* Quiz state */
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  /* Modal */
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setShowDropdown(true);
      }
      return;
    }
    const filtered = DATABASE_TOPICS.filter(t => t.toLowerCase().includes(topicSearch.toLowerCase()));
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveDropIdx(prev => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveDropIdx(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetIdx = activeDropIdx >= 0 && activeDropIdx < filtered.length ? activeDropIdx : 0;
      const selected = filtered[targetIdx];
      setTopic(selected);
      setTopicSearch(selected);
      setShowDropdown(false);
      setActiveDropIdx(-1);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveDropIdx(-1);
    }
  };

  /* ── Generate ── */
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (isGuest) { setShowLoginModal(true); return; }

    const targetTopic = DATABASE_TOPICS.find(t => t.toLowerCase() === topicSearch.toLowerCase().trim());
    if (!targetTopic) { setError("Please select a valid topic from the suggestion list."); return; }

    setGenerating(true);
    setError(""); setQuizQuestions(null); setAnswers({}); setRevealed({}); setScore(0); setFinished(false);

    let success = false, rawText = "";
    const prompt = `You are an expert UPSC paper setter. Create exactly ${numQuestions} multiple choice questions on: "${topic}". Difficulty: ${difficulty}. OUTPUT FORMAT: raw JSON array only. Schema: [{"questionText":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctIndex":0,"topic":"${topic}","explanation":"..."}]`;

    for (const key of GROQ_KEYS) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method:"POST",
          headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
          body:JSON.stringify({model:"llama-3.3-70b-versatile",response_format:{type:"json_object"},messages:[{role:"system",content:"Expert UPSC paper setter. Reply with valid JSON array only."},{role:"user",content:prompt}]})
        });
        if (res.ok) { const d = await res.json(); rawText = d.choices[0].message.content; success = true; break; }
      } catch {}
    }

    if (!success) {
      for (const key of GEMINI_KEYS) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,{
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json"}})
          });
          if (res.ok) { const d = await res.json(); rawText = d.candidates[0].content.parts[0].text; success = true; break; }
        } catch {}
      }
    }

    if (!success) { setError("AI engines are rate-limited. Please retry in a few minutes."); setGenerating(false); return; }

    try {
      let parsed = JSON.parse(rawText.trim());
      if (!Array.isArray(parsed) && typeof parsed === "object") {
        const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        parsed = key ? parsed[key] : (() => { throw new Error("No array found"); })();
      }
      setQuizQuestions(parsed);
    } catch { setError("AI output was malformed. Please retry."); }
    finally { setGenerating(false); }
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (revealed[qIdx]) return;
    setAnswers(p => ({ ...p, [qIdx]: optIdx }));
    setRevealed(p => ({ ...p, [qIdx]: true }));
    if (optIdx === quizQuestions[qIdx].correctIndex) setScore(p => p + 1);
  };

  const handleFinishQuiz = async () => {
    setFinished(true);
    try {
      const wrongTopics = quizQuestions
        .filter((_, idx) => answers[idx] !== quizQuestions[idx].correctIndex)
        .map(q => q.topic || topic || "AI Generated");
      await supabase.from("test_history").insert([{
        student_id: user?.uid || "anonymous",
        score, total_questions: quizQuestions.length, wrong_answers: wrongTopics,
      }]);
    } catch {}
  };

  /* ── RENDER ── */
  return (
    <AppLayout title="AI Generator">
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:C.bg, paddingTop:60, transition:"background .3s" }}>

        {/* ── HERO BANNER ── */}
        <div style={{
          background:"linear-gradient(135deg,#3A0710 0%,#5B0A14 50%,#3A0710 100%)",
          borderBottom:"1px solid rgba(212,175,55,.3)", padding:"36px 20px",
          textAlign:"center",
        }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,175,55,.1)", border:"1px solid rgba(212,175,55,.3)", padding:"5px 14px", borderRadius:999, marginBottom:16 }}>
              <Sparkles size={12} color="#D4AF37"/>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color:"#D4AF37", fontFamily:"Inter,sans-serif" }}>Engineered Intelligence</span>
            </div>
            <h1 style={{ fontFamily:"Cinzel,serif", fontSize:"clamp(1.4rem,4vw,2rem)", fontWeight:800, color:"#FFF7E8", margin:"0 0 10px", lineHeight:1.2 }}>
              AI Custom Practice Sets
            </h1>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,247,232,.7)", margin:0, lineHeight:1.7, maxWidth:560, marginLeft:"auto", marginRight:"auto" }}>
              Generate high-order MCQs grounded in UPSC database topic indexes. Powered by Groq Llama &amp; Google Gemini AI.
            </p>
          </div>
        </div>

        <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 20px 80px" }}>

          {/* ── Error ── */}
          {error && (
            <div style={{
              display:"flex", alignItems:"flex-start", gap:10, padding:"14px 16px",
              borderRadius:12, marginBottom:24,
              background: isDarkMode ? "#3D1A20" : "#FDEDEF",
              border:`1px solid ${C.red}`, color:C.red,
              fontSize:13, fontFamily:"Inter,sans-serif",
            }}>
              <AlertCircle size={16} style={{ flexShrink:0, marginTop:1 }}/>
              {error}
            </div>
          )}

          {/* ── FORM ── */}
          {!quizQuestions && !generating && (
            <div style={{
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:20, overflow:"hidden",
              boxShadow:"0 8px 32px rgba(0,0,0,0.08)",
            }}>
              {/* Card header */}
              <div style={{
                padding:"22px 28px", borderBottom:`1px solid ${C.border}`,
                background:`linear-gradient(135deg,rgba(91,10,20,0.06),transparent)`,
                display:"flex", alignItems:"center", gap:14,
              }}>
                <div style={{
                  width:46, height:46, borderRadius:14,
                  background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                  border:"1px solid rgba(212,175,55,.3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <BrainCircuit size={22} color="#D4AF37"/>
                </div>
                <div>
                  <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:C.text, fontFamily:"Poppins,sans-serif" }}>
                    Configure AI Test Engine
                  </h2>
                  <p style={{ margin:0, fontSize:12, color:C.textSec, fontFamily:"Inter,sans-serif", marginTop:2 }}>
                    Select topic, difficulty, and question count
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerate} style={{ padding:"28px" }}>

                {/* Topic selector */}
                <div style={{ marginBottom:22, position:"relative" }}>
                  <label style={{
                    display:"block", fontSize:11, fontWeight:700, letterSpacing:".1em",
                    textTransform:"uppercase", color:C.gold, marginBottom:8,
                    fontFamily:"Inter,sans-serif",
                  }}>Target Topic</label>
                  <div style={{ position:"relative" }}>
                    <input
                      type="text"
                      placeholder="— Search or select a topic —"
                      value={topicSearch}
                      onChange={e => { setTopicSearch(e.target.value); setShowDropdown(true); setActiveDropIdx(-1); }}
                      onFocus={() => setShowDropdown(true)}
                      onKeyDown={handleKeyDown}
                      style={{
                        width:"100%", padding:"12px 40px 12px 14px",
                        background:C.input, border:`1.5px solid ${C.inputBorder}`,
                        borderRadius:12, fontSize:13, color:C.text,
                        fontFamily:"Inter,sans-serif", outline:"none",
                        transition:"border-color .2s",
                      }}
                    />
                    <ChevronDown size={15} color={C.textMuted} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                  </div>

                  {topicSearch.trim() !== "" &&
                    DATABASE_TOPICS.filter(t => t.toLowerCase().includes(topicSearch.toLowerCase())).length === 0 && (
                    <p style={{ fontSize:11, marginTop:5, color:C.red, fontFamily:"Inter,sans-serif", fontWeight:600 }}>
                      ⚠ Topic not found in database
                    </p>
                  )}

                  {showDropdown && DATABASE_TOPICS.filter(t => t.toLowerCase().includes(topicSearch.toLowerCase())).length > 0 && (
                    <div style={{
                      position:"absolute", zIndex:30, width:"100%", marginTop:4,
                      borderRadius:12, border:`1px solid ${C.border}`,
                      maxHeight:220, overflowY:"auto",
                      background:C.surface, boxShadow:"0 8px 28px rgba(0,0,0,0.18)",
                    }}>
                      {DATABASE_TOPICS
                        .filter(t => t.toLowerCase().includes(topicSearch.toLowerCase()))
                        .map((t, idx) => {
                          const isActive = idx === activeDropIdx;
                          return (
                            <div
                              key={t}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setTopic(t);
                                setTopicSearch(t);
                                setShowDropdown(false);
                                setActiveDropIdx(-1);
                              }}
                              style={{
                                padding:"11px 16px", fontSize:12, fontWeight:600,
                                color:C.textSec, cursor:"pointer", fontFamily:"Inter,sans-serif",
                                borderBottom:`1px solid ${C.border}`,
                                transition:"background .15s",
                                background: isActive ? (isDarkMode ? "rgba(212,175,55,.18)" : "rgba(91,10,20,.08)") : "transparent",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "rgba(212,175,55,.08)" : "rgba(91,10,20,.04)"}
                              onMouseLeave={e => e.currentTarget.style.background = isActive ? (isDarkMode ? "rgba(212,175,55,.18)" : "rgba(91,10,20,.08)") : "transparent"}
                            >
                              {t}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Difficulty + Questions row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
                  <div>
                    <label style={{
                      display:"block", fontSize:11, fontWeight:700, letterSpacing:".1em",
                      textTransform:"uppercase", color:C.gold, marginBottom:8,
                      fontFamily:"Inter,sans-serif",
                    }}>Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                      style={{
                        width:"100%", padding:"12px 14px",
                        background:C.input, border:`1.5px solid ${C.inputBorder}`,
                        borderRadius:12, fontSize:13, color:C.text,
                        fontFamily:"Inter,sans-serif", outline:"none", cursor:"pointer",
                        appearance:"none",
                      }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">UPSC Hard</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display:"block", fontSize:11, fontWeight:700, letterSpacing:".1em",
                      textTransform:"uppercase", color:C.gold, marginBottom:8,
                      fontFamily:"Inter,sans-serif",
                    }}>Questions</label>
                    <select
                      value={numQuestions}
                      onChange={e => setNumQuestions(parseInt(e.target.value))}
                      style={{
                        width:"100%", padding:"12px 14px",
                        background:C.input, border:`1.5px solid ${C.inputBorder}`,
                        borderRadius:12, fontSize:13, color:C.text,
                        fontFamily:"Inter,sans-serif", outline:"none", cursor:"pointer",
                        appearance:"none",
                      }}
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>
                </div>

                {/* Generate button */}
                <button
                  type="submit"
                  className="aig-generate-btn"
                  style={{
                    width:"100%", padding:"14px",
                    background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                    color:"#FFF7E8", border:"1px solid rgba(212,175,55,.4)",
                    borderRadius:12, fontSize:14, fontWeight:700,
                    fontFamily:"Poppins,sans-serif", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    boxShadow:"0 6px 20px rgba(91,10,20,.2)",
                  }}
                >
                  <Sparkles size={16} color="#D4AF37"/>
                  Generate AI MCQs
                </button>

                {/* Guest notice */}
                {isGuest && (
                  <p style={{ textAlign:"center", fontSize:11, color:C.textMuted, marginTop:14, fontFamily:"Inter,sans-serif" }}>
                    🔒 Login required to generate custom AI question sets.{" "}
                    <button onClick={() => navigate("/login")} style={{ background:"none", border:"none", color:C.gold, fontWeight:700, cursor:"pointer" }}>Sign in →</button>
                  </p>
                )}
              </form>
            </div>
          )}

          {/* ── Generating Loader ── */}
          {generating && (
            <div style={{
              textAlign:"center", padding:"64px 20px",
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:20,
            }}>
              <div style={{
                width:60, height:60, borderRadius:"50%", margin:"0 auto 20px",
                background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                border:"1px solid rgba(212,175,55,.4)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <RefreshCw size={26} color="#D4AF37" className="aig-spin"/>
              </div>
              <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700, color:C.text, fontFamily:"Poppins,sans-serif" }}>
                Consulting AI Engine
              </h3>
              <p style={{ margin:0, fontSize:13, color:C.textSec, fontFamily:"Inter,sans-serif", lineHeight:1.6, maxWidth:320, marginLeft:"auto", marginRight:"auto" }}>
                Structuring custom assertions, options and reference guidelines for <strong style={{ color:"#D4AF37" }}>{topic}</strong>...
              </p>
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:18 }}>
                {[0,1,2].map(i => (
                  <div key={i} className="aig-pulse" style={{
                    width:8, height:8, borderRadius:"50%",
                    background:"#D4AF37", animationDelay:`${i*0.3}s`,
                  }}/>
                ))}
              </div>
            </div>
          )}

          {/* ── Quiz ── */}
          {quizQuestions && (
            <div>
              {/* Quiz header */}
              <div style={{
                background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                border:"1px solid rgba(212,175,55,.3)",
                borderRadius:16, padding:"18px 24px", marginBottom:20,
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <div>
                  <div style={{ fontSize:10, letterSpacing:".15em", textTransform:"uppercase", color:"#D4AF37", fontWeight:700, fontFamily:"Inter,sans-serif" }}>Active Test</div>
                  <h3 style={{ margin:"4px 0 0", fontSize:15, fontWeight:700, color:"#FFF7E8", fontFamily:"Poppins,sans-serif" }}>{topic}</h3>
                  <span style={{ fontSize:11, color:"rgba(255,247,232,.6)", fontFamily:"Inter,sans-serif" }}>Difficulty: {difficulty}</span>
                </div>
                <div style={{
                  textAlign:"center", background:"rgba(212,175,55,.1)",
                  border:"1px solid rgba(212,175,55,.3)", borderRadius:12,
                  padding:"10px 16px",
                }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#D4AF37", fontFamily:"Inter,sans-serif", lineHeight:1 }}>{score}</div>
                  <div style={{ fontSize:10, color:"rgba(255,247,232,.6)", fontFamily:"Inter,sans-serif" }}>of {quizQuestions.length}</div>
                </div>
              </div>

              {/* Questions */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {quizQuestions.map((q, idx) => {
                  const isRev = revealed[idx];
                  const userAns = answers[idx];

                  return (
                    <div key={idx} style={{
                      background:C.surface, border:`1px solid ${C.border}`,
                      borderRadius:16, overflow:"hidden",
                      boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                    }}>
                      {/* Question */}
                      <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${C.border}` }}>
                        <div style={{
                          display:"inline-flex", alignItems:"center", justifyContent:"center",
                          width:26, height:26, borderRadius:8, marginBottom:10,
                          background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                          fontSize:11, fontWeight:800, color:"#D4AF37",
                          fontFamily:"Inter,sans-serif",
                        }}>
                          {idx + 1}
                        </div>
                        <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.text, fontFamily:"Inter,sans-serif", lineHeight:1.6 }}>
                          {q.questionText}
                        </p>
                      </div>

                      {/* Options */}
                      <div style={{ padding:"16px 24px 20px", display:"flex", flexDirection:"column", gap:8 }}>
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAns === oIdx;
                          const isCorrectOpt = oIdx === q.correctIndex;
                          let bg = C.surfaceAlt, bdr = C.border, txt = C.textSec;
                          if (isRev) {
                            if (isCorrectOpt) { bg = C.greenBg; bdr = C.green; txt = C.green; }
                            else if (isSelected) { bg = C.redBg; bdr = C.red; txt = C.red; }
                          }
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(idx, oIdx)}
                              disabled={isRev}
                              className="aig-option-btn"
                              style={{
                                width:"100%", textAlign:"left",
                                padding:"12px 16px", borderRadius:10,
                                background:bg, border:`1.5px solid ${bdr}`, color:txt,
                                fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif",
                                cursor:isRev ? "default" : "pointer",
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {isRev && (
                        <div style={{
                          margin:"0 24px 20px",
                          padding:"14px 16px", borderRadius:10,
                          background: isDarkMode ? "rgba(212,175,55,.06)" : "rgba(91,10,20,.04)",
                          border:`1px solid ${C.border}`,
                        }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, fontWeight:700, fontSize:12, fontFamily:"Inter,sans-serif" }}>
                            {userAns === q.correctIndex
                              ? <><CheckCircle2 size={14} color={C.green}/><span style={{ color:C.green }}>Correct Answer!</span></>
                              : <><XCircle size={14} color={C.red}/><span style={{ color:C.red }}>Incorrect (Correct: Option {String.fromCharCode(65 + q.correctIndex)})</span></>
                            }
                          </div>
                          <p style={{ margin:0, fontSize:12, color:C.textSec, lineHeight:1.65, fontFamily:"Inter,sans-serif" }}>
                            {q.explanation || "Detailed explanation loading..."}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Finish button */}
              {!finished && Object.keys(revealed).length === quizQuestions.length && (
                <button
                  onClick={handleFinishQuiz}
                  className="aig-generate-btn"
                  style={{
                    width:"100%", padding:"14px", marginTop:20,
                    background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                    color:"#FFF7E8", border:"1px solid rgba(212,175,55,.4)",
                    borderRadius:12, fontSize:14, fontWeight:700,
                    fontFamily:"Poppins,sans-serif", cursor:"pointer",
                    boxShadow:"0 6px 20px rgba(91,10,20,.2)",
                  }}
                >
                  🏆 Submit & Finish Test
                </button>
              )}

              {/* Result card */}
              {finished && (
                <div style={{
                  textAlign:"center", marginTop:20, padding:"36px 24px",
                  background:C.surface, border:`1px solid ${C.border}`,
                  borderRadius:20,
                }}>
                  <div style={{
                    width:64, height:64, borderRadius:"50%", margin:"0 auto 16px",
                    background:"linear-gradient(135deg,#D4AF37,#A67C00)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 8px 24px rgba(212,175,55,.3)",
                  }}>
                    <Trophy size={28} color="#fff"/>
                  </div>
                  <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:C.text, fontFamily:"Cinzel,serif" }}>
                    Test Completed!
                  </h3>
                  <p style={{ margin:"0 0 6px", fontSize:24, fontWeight:800, color:"#D4AF37", fontFamily:"Inter,sans-serif" }}>
                    {score} / {quizQuestions.length}
                  </p>
                  <p style={{ margin:"0 0 24px", fontSize:13, color:C.textSec, fontFamily:"Inter,sans-serif" }}>
                    Your attempt has been saved to your dashboard analytics.
                  </p>
                  <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                    <button
                      onClick={() => { setQuizQuestions(null); setTopicSearch(""); setTopic(""); }}
                      style={{
                        padding:"11px 22px", borderRadius:10,
                        background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                        color:"#FFF7E8", border:"1px solid rgba(212,175,55,.4)",
                        fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer",
                      }}
                    >
                      ↺ New Test
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      style={{
                        padding:"11px 22px", borderRadius:10,
                        background:C.surfaceAlt, color:C.text,
                        border:`1px solid ${C.border}`,
                        fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer",
                      }}
                    >
                      → Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Guest Modal ── */}
        {showLoginModal && (
          <div style={{
            position:"fixed", inset:0, zIndex:999,
            background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:20,
          }}>
            <div style={{
              background:C.surface, border:"1px solid rgba(212,175,55,.3)",
              borderRadius:20, padding:"36px 32px", maxWidth:400, width:"100%",
              textAlign:"center", position:"relative",
              boxShadow:"0 30px 60px rgba(0,0,0,0.4)",
            }}>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  position:"absolute", top:14, right:14, background:"none",
                  border:"none", cursor:"pointer", color:C.textMuted,
                }}
              >
                <X size={18}/>
              </button>
              <div style={{
                width:56, height:56, borderRadius:16, margin:"0 auto 18px",
                background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                border:"1px solid rgba(212,175,55,.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <BrainCircuit size={26} color="#D4AF37"/>
              </div>
              <h3 style={{ margin:"0 0 10px", fontSize:17, fontWeight:700, color:C.text, fontFamily:"Cinzel,serif" }}>
                Unlock Premium AI Features
              </h3>
              <p style={{ margin:"0 0 24px", fontSize:13, color:C.textSec, fontFamily:"Inter,sans-serif", lineHeight:1.65 }}>
                Custom AI test generation is a premium capability. Log in or create a free account to generate on any topic.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding:"13px", borderRadius:10, cursor:"pointer",
                    background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                    color:"#FFF7E8", border:"1px solid rgba(212,175,55,.4)",
                    fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13,
                  }}
                >
                  Log In / Sign Up →
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    padding:"12px", borderRadius:10, cursor:"pointer",
                    background:"transparent", color:C.textSec,
                    border:`1px solid ${C.border}`,
                    fontFamily:"Inter,sans-serif", fontWeight:600, fontSize:13,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
