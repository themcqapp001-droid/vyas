import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";
import { supabase } from "../supabase";
import { signOut } from "firebase/auth";
import AppLayout from "./AppLayout";
import {
  Flame, ChevronRight, Play,
  Sparkles, TrendingUp, TrendingDown, Trophy, Clock,
  CheckCircle2, Circle, PlayCircle, BookOpen,
} from "lucide-react";

/* ── Mini course DB for dashboard widget ── */
const DASH_COURSES = {
  basic: { id:"basic", title:"RAS Foundation Course", icon:"🎯", color:"#10B981", lectures:1, hours:"12 min" },
  anthropology: { id:"anthropology", title:"Anthropology Optional", icon:"🧬", color:"#8B5CF6", lectures:4, hours:"3 hrs" },
};

function getDashboardColors(isDarkMode) {
  return isDarkMode ? {
    bg: "#0C1220", surface: "#111827", surfaceAlt: "#1A2235",
    border: "#263247", blue: "#f97316", blueSoft: "rgba(249,115,22,0.12)",
    gold: "#2DD4BF", goldSoft: "rgba(45,212,191,0.12)",
    green: "#34D399", red: "#F87171",
    textPrimary: "#E8F0FE", textSecondary: "#8EA7C5", textMuted: "#4A5E7A",
  } : {
    bg: "#FBF1E1", surface: "#FFFFFF", surfaceAlt: "#F5E6D3",
    border: "#EDE0C8", blue: "#7A1F2B", blueSoft: "rgba(122,31,43,0.08)",
    gold: "#D4AF37", goldSoft: "rgba(212,175,55,0.12)",
    green: "#0FA36B", red: "#E0455B",
    textPrimary: "#2C2C2A", textSecondary: "#5F5E5A", textMuted: "#8A7A6C",
  };
}

function ConfidenceRing({ completion = 78, confidence = 61, size = 90, COLORS }) {
  const stroke = 7;
  const r1 = size / 2 - stroke / 2;
  const r2 = r1 - stroke - 4;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke={COLORS.blueSoft} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke={COLORS.blue} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c1} strokeDashoffset={c1-(completion/100)*c1} transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <circle cx={size/2} cy={size/2} r={r2} fill="none" stroke={COLORS.goldSoft} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r2} fill="none" stroke={COLORS.gold} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c2} strokeDashoffset={c2-(confidence/100)*c2} transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x="50%" y="47%" textAnchor="middle" fill={COLORS.textPrimary} fontSize="18" fontWeight="700" fontFamily="Poppins,sans-serif">{completion}%</text>
      <text x="50%" y="64%" textAnchor="middle" fill={COLORS.textMuted} fontSize="9" fontFamily="Inter,sans-serif">complete</text>
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const COLORS = getDashboardColors(isDarkMode);
  const navigate = useNavigate();
  const isGuest = !user;

  const [goals, setGoals] = useState([
    { id:1, label:"Complete Modern History Chapter 8",               done:true  },
    { id:2, label:"Practice 50 Indian Polity MCQs",                 done:true  },
    { id:3, label:"Revise Credit Information Bureau (CIBIL) notes",  done:false },
  ]);

  const [analytics, setAnalytics] = useState({
    totalTests: 0, averageScore: 0,
    weakSubjects:   [{ name:"Economy",    accuracy:54 },{ name:"Environment",   accuracy:61 },{ name:"Science & Tech",accuracy:58 }],
    strongSubjects: [{ name:"History",    accuracy:91 },{ name:"Polity",         accuracy:88 },{ name:"Geography",    accuracy:85 }],
  });

  useEffect(() => {
    const fetch = async () => {
      if (isGuest) return;
      try {
        const { data } = await supabase.from("test_history").select("*").eq("student_id", user.uid);
        if (data?.length > 0) {
          const total = data.length;
          const avg = Math.round(data.reduce((a,c) => a+(c.score*100/c.total_questions),0)/total);
          setAnalytics(p => ({ ...p, totalTests:total, averageScore:avg }));
        }
      } catch(e){ console.error(e); }
    };
    fetch();
  }, [user, isGuest]);

  const toggleGoal = (id) => {
    if (isGuest) { alert("Sign in to update goals."); return; }
    setGoals(g => g.map(x => x.id===id ? {...x, done:!x.done} : x));
  };

  return (
    <AppLayout title="Dashboard">
      <div style={{ background:COLORS.bg, minHeight:"100vh", fontFamily:"Inter,sans-serif", color:COLORS.textPrimary }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px 80px" }}>

          {/* GUEST BANNER */}
          {isGuest && (
            <div style={{
              borderRadius:16, padding:"16px 20px",
              background:COLORS.blueSoft, border:`1px solid ${COLORS.blue}`,
              display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between",
              gap:14, marginBottom:24,
            }}>
              <div>
                <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:14, color:"#f97316", display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <Sparkles size={16}/> Guest Study Mode
                </div>
                <p style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:COLORS.textSecondary, lineHeight:1.6 }}>
                  Previewing the UPSC Prelims dashboard. Create a free account to track progress, log scores & generate AI tests.
                </p>
              </div>
              <button onClick={() => navigate("/login")} style={{
                padding:"10px 22px", borderRadius:20, border:"none",
                background:"#f97316", color:"#fff", cursor:"pointer",
                fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13, flexShrink:0,
              }}>Create Free Account</button>
            </div>
          )}

          {/* GREETING */}
          <section style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <div>
              <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:26, color:COLORS.textPrimary, lineHeight:1.2 }}>
                Hello, {isGuest ? "Guest Aspirant" : user?.displayName || "Student"} 👋
              </p>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:6, marginTop:8,
                padding:"4px 14px", borderRadius:30, fontSize:12, fontWeight:600,
                background:COLORS.goldSoft, color:COLORS.gold, fontFamily:"Inter,sans-serif",
              }}>🎯 Targeting UPSC Prelims 2027</div>
            </div>
            {!isGuest && (
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, color:COLORS.gold }}>
                  <Flame size={22} fill={COLORS.gold} strokeWidth={0}/>
                  <span style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:22 }}>142</span>
                </div>
                <span style={{ fontFamily:"Inter,sans-serif", fontSize:10, color:COLORS.textMuted }}>day streak</span>
              </div>
            )}
          </section>

          {/* QUICK ACCESS CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:28 }}>
            {[
              { icon:"🏜️", label:"RAS Academy",    to:"/",             clr:"#D4AF37" },
              { icon:"🤖", label:"AI Generator",    to:"/ai-generator", clr:"#1B4F8A" },
              { icon:"📚", label:"Study Notes",     to:"/notes",        clr:"#2A9D8F" },
              { icon:"🎬", label:"Lecture Portal",  to:"/courses",      clr:"#7C3AED" },
              { icon:"🌍", label:"Anthro Optional", to:"/anthropology", clr:"#DC2626" },
              { icon:"🏆", label:"Log History",     to:"/history",      clr:"#059669" },
            ].map(q => (
              <div key={q.to} onClick={() => navigate(q.to)} style={{
                background:COLORS.surface, border:`1px solid ${COLORS.border}`,
                borderRadius:14, padding:"16px 12px", cursor:"pointer", textAlign:"center",
                transition:"transform .18s, box-shadow .18s",
                display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 22px ${q.clr}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                <span style={{ fontSize:26 }}>{q.icon}</span>
                <div style={{ fontFamily:"Inter,sans-serif", fontWeight:700, fontSize:12, color:q.clr, lineHeight:1.3 }}>{q.label}</div>
              </div>
            ))}
          </div>

          {/* MY ENROLLED COURSES WIDGET */}
          {(() => {
            const enrolledRaw = localStorage.getItem("pw_enrolled");
            const enrolled = enrolledRaw ? JSON.parse(enrolledRaw) : { basic: true };
            const watchRaw = localStorage.getItem("pw_watch_progress");
            const watchProg = watchRaw ? JSON.parse(watchRaw) : {};
            const enrolledCourses = Object.values(DASH_COURSES).filter(c => enrolled[c.id]);
            if (enrolledCourses.length === 0) return null;
            return (
              <section style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 20, background: "#10B981", borderRadius: 4 }}/>
                    <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.textPrimary }}>My Enrolled Courses</span>
                  </div>
                  <button onClick={() => navigate("/courses")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.blue, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    View All <ChevronRight size={13}/>
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
                  {enrolledCourses.map(course => {
                    const progVal = Object.values(watchProg)[0]?.pct || 0;
                    return (
                      <div key={course.id} style={{
                        background: COLORS.surface, border: `1.5px solid ${COLORS.border}`,
                        borderRadius: 16, overflow: "hidden", cursor: "pointer",
                        transition: "transform 0.18s, box-shadow 0.18s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${course.color}22`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                        onClick={() => navigate("/courses")}
                      >
                        <div style={{ background: `linear-gradient(135deg,${course.color}18,${course.color}30)`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.border}` }}>
                          <span style={{ fontSize: 28 }}>{course.icon}</span>
                          <div>
                            <div style={{ fontSize: 8, fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>✓ ENROLLED</div>
                            <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.textPrimary }}>{course.title}</div>
                            <div style={{ fontSize: 10, color: COLORS.textSecondary }}>🎥 {course.lectures} lectures • ⏱ {course.hours}</div>
                          </div>
                        </div>
                        <div style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.textMuted, marginBottom: 5, fontWeight: 700 }}>
                            <span>Progress</span><span>{progVal}%</span>
                          </div>
                          <div style={{ height: 4, background: COLORS.border, borderRadius: 4, marginBottom: 12 }}>
                            <div style={{ width: `${progVal}%`, height: "100%", background: course.color, borderRadius: 4, transition: "width 0.5s" }}/>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); navigate("/courses"); }}
                            style={{
                              width: "100%", padding: "9px", borderRadius: 10, border: "none",
                              background: `linear-gradient(135deg,${course.color},${course.color}CC)`,
                              color: "#fff", fontFamily: "Poppins,sans-serif", fontWeight: 700,
                              fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center",
                              justifyContent: "center", gap: 6
                            }}
                          >
                            <PlayCircle size={14}/>
                            {progVal > 0 ? "Continue Watching" : "Start Learning"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {/* MAIN 3-COLUMN GRID */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 340px", gap:20, alignItems:"start" }}>

            {/* COL 1+2: GOALS + STATS */}
            <div style={{ gridColumn:"1/3", display:"flex", flexDirection:"column", gap:18 }}>

              {/* GOALS */}
              <section style={{ borderRadius:18, padding:"22px", background:COLORS.surface, border:`1px solid ${COLORS.border}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Sparkles size={15} style={{ color:"#f97316" }}/>
                    <span style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:15, color:COLORS.textPrimary }}>Today's Study Targets</span>
                  </div>
                  <span style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:COLORS.textMuted, display:"flex", alignItems:"center", gap:4 }}>
                    <Clock size={12}/> 2h 15m
                  </span>
                </div>
                <ul style={{ listStyle:"none", marginBottom:20, display:"flex", flexDirection:"column", gap:14 }}>
                  {goals.map(g => (
                    <li key={g.id} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={() => toggleGoal(g.id)}>
                      {g.done
                        ? <CheckCircle2 size={20} style={{ color:COLORS.green, flexShrink:0 }}/>
                        : <Circle size={20} style={{ color:COLORS.textMuted, flexShrink:0 }}/>}
                      <span style={{ fontFamily:"Inter,sans-serif", fontSize:14, color: g.done ? COLORS.textMuted : COLORS.textPrimary, textDecoration: g.done ? "line-through" : "none" }}>
                        {g.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate("/ai-generator")} style={{
                  width:"100%", padding:"13px", borderRadius:12, border:"none",
                  background:"linear-gradient(135deg,#3A0710,#5B0A14)",
                  color:"#FFF7E8", border:"1px solid rgba(212,175,55,.4)",
                  cursor:"pointer",
                  fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:14,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 18px rgba(91,10,20,0.2)",
                }}>
                  <Play size={14} fill="#FFF7E8"/> Start AI Generator
                </button>
              </section>

              {/* STATS */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { label:"Total Mock Tests", val: isGuest ? "0" : analytics.totalTests, unit:"tests",    sub:"logged",          icon:"📋" },
                  { label:"Avg Accuracy",     val: isGuest ? "0" : analytics.averageScore, unit:"%",      sub:"correct answers",  icon:"🏆" },
                ].map(s => (
                  <div key={s.label} style={{ borderRadius:16, padding:"20px", background:COLORS.surface, border:`1px solid ${COLORS.border}`, textAlign:"center" }}>
                    <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
                    <div style={{ fontFamily:"Inter,sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:COLORS.textMuted, marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:26, color:COLORS.textPrimary }}>
                      {s.val}<span style={{ fontSize:16, fontWeight:600 }}>{s.unit}</span>
                    </div>
                    <div style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:COLORS.textSecondary, marginTop:4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* COL 3: PROGRESS + ANALYTICS */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* PROGRESS RING */}
              <section style={{ borderRadius:18, padding:"18px", background:COLORS.surface, border:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", gap:14 }}>
                <ConfidenceRing completion={65} confidence={52} size={86} COLORS={COLORS}/>
                <div>
                  <p style={{ fontFamily:"Inter,sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:COLORS.textMuted, marginBottom:4 }}>Current Status</p>
                  <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13, color:COLORS.textPrimary, marginBottom:2 }}>Modern India — Ch. 8</p>
                  <p style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:COLORS.textSecondary }}>65% complete · 52% confident</p>
                </div>
              </section>

              {/* WEAK AREAS */}
              <section style={{ borderRadius:18, padding:"16px", background:COLORS.surface, border:`1px solid ${COLORS.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                  <TrendingDown size={13} style={{ color:COLORS.red }}/>
                  <span style={{ fontFamily:"Inter,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:COLORS.textMuted }}>Weak Areas</span>
                </div>
                {analytics.weakSubjects.map(s => (
                  <div key={s.name} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Inter,sans-serif", fontSize:12, marginBottom:4, color:COLORS.textPrimary }}>
                      <span>{s.name}</span>
                      <span style={{ color:COLORS.textMuted }}>{isGuest ? "0%" : `${s.accuracy}%`}</span>
                    </div>
                    <div style={{ height:5, borderRadius:5, background:COLORS.blueSoft }}>
                      <div style={{ height:"100%", borderRadius:5, background:COLORS.red, width:`${isGuest ? 0 : s.accuracy}%` }}/>
                    </div>
                  </div>
                ))}
              </section>

              {/* STRONG AREAS */}
              <section style={{ borderRadius:18, padding:"16px", background:COLORS.surface, border:`1px solid ${COLORS.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                  <TrendingUp size={13} style={{ color:COLORS.green }}/>
                  <span style={{ fontFamily:"Inter,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:COLORS.textMuted }}>Strong Areas</span>
                </div>
                {analytics.strongSubjects.map(s => (
                  <div key={s.name} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Inter,sans-serif", fontSize:12, marginBottom:4, color:COLORS.textPrimary }}>
                      <span>{s.name}</span>
                      <span style={{ color:COLORS.textMuted }}>{isGuest ? "0%" : `${s.accuracy}%`}</span>
                    </div>
                    <div style={{ height:5, borderRadius:5, background:COLORS.blueSoft }}>
                      <div style={{ height:"100%", borderRadius:5, background:COLORS.green, width:`${isGuest ? 0 : s.accuracy}%` }}/>
                    </div>
                  </div>
                ))}
              </section>

              {/* AI RECOMMENDATION */}
              <section style={{ borderRadius:18, padding:"16px", background:COLORS.surfaceAlt, border:`1px solid ${COLORS.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                  <Sparkles size={14} style={{ color:COLORS.gold }}/>
                  <span style={{ fontFamily:"Inter,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:COLORS.gold }}>AI Recommendation</span>
                </div>
                <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:COLORS.textSecondary, lineHeight:1.65, marginBottom:12 }}>
                  Indian Economy shows the highest frequency of wrong answers. Practice Indian Banking System to improve your score.
                </p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:`1px solid ${COLORS.border}`, paddingTop:10 }}>
                  <div>
                    <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:12, color:COLORS.textPrimary }}>Indian Banking System</div>
                    <span style={{ fontFamily:"Inter,sans-serif", fontSize:10, color:COLORS.gold, fontWeight:600 }}>Medium Level</span>
                  </div>
                  <button onClick={() => navigate("/ai-generator")} style={{
                    padding:"7px 14px", borderRadius:10, border:"none",
                    background:COLORS.gold, color: isDarkMode ? "#0C1220" : "#fff",
                    fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:12, cursor:"pointer",
                    display:"flex", alignItems:"center", gap:4,
                  }}>Practice <ChevronRight size={12}/></button>
                </div>
              </section>
            </div>
          </div>

          {/* RESPONSIVE STACKING */}
          <style>{`
            @media(max-width:900px) {
              .dash-grid { grid-template-columns: 1fr !important; }
              .dash-grid > div:first-child { grid-column: 1 !important; }
            }
            @media(max-width:600px) {
              .dash-quick { grid-template-columns: repeat(3,1fr) !important; }
            }
          `}</style>
        </div>
      </div>
    </AppLayout>
  );
}
