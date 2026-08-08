import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../supabase";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AppLayout from "./AppLayout";
import {
  Home, BookOpen, Brain, Trophy, ArrowLeft, RefreshCw, Search,
  CheckCircle, XCircle, HelpCircle, Sun, Moon, LogIn, LogOut, Sparkles, X, Settings as SettingsIcon, FileText,
  Video, GraduationCap
} from "lucide-react";

function getDashboardColors(isDarkMode) {
  return isDarkMode ? {
    bg: "#08101F",
    surface: "#0F1E33",
    surfaceAlt: "#132842",
    border: "#1E3355",
    blue: "#3D8BFF",
    blueSoft: "#1B3A63",
    gold: "#D4AF57",
    goldSoft: "#3A3421",
    green: "#34D399",
    red: "#F87171",
    textPrimary: "#EAF1FB",
    textSecondary: "#8CA0C2",
    textMuted: "#5B6E8C",
  } : {
    bg: "#FBF1E1",
    surface: "#FFFFFF",
    surfaceAlt: "#F5E6D3",
    border: "#EDE0C8",
    blue: "#7A1F2B",
    blueSoft: "rgba(122,31,43,0.08)",
    gold: "#D4AF37",
    goldSoft: "rgba(212,175,55,0.12)",
    green: "#0FA36B",
    red: "#E0455B",
    textPrimary: "#2C2C2A",
    textSecondary: "#5F5E5A",
    textMuted: "#8A7A6C",
  };
}

const SUBJECTS = [
  "All Subjects",
  "INDIAN POLITY",
  "PHYSICAL GEOGRAPHY",
  "INDIAN CULTURE",
  "ETHICS INTEGRITY AND APTITUDE",
  "AGRICULTURE IN INDIA",
  "ANCIENT HISTORY"
];

export default function Practice() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const COLORS = getDashboardColors(isDarkMode);
  const navigate = useNavigate();
  const isGuest = !user;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [submittingStats, setSubmittingStats] = useState(false);

  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  // Guest interaction warning modal
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchQuestions = async (reset = false) => {
    setLoading(true);
    try {
      let query = supabase
        .from("questions")
        .select("*")
        .eq("language", "English");

      if (selectedSubject !== "All Subjects") {
        query = query.ilike("subject", selectedSubject);
      }

      if (searchQuery.trim()) {
        query = query.or(`question_text.ilike.%${searchQuery}%,explanation.ilike.%${searchQuery}%`);
      }

      const fromIndex = reset ? 0 : page * 10;
      const toIndex = fromIndex + 9;

      const { data, error } = await query
        .range(fromIndex, toIndex);

      if (error) throw error;

      if (reset) {
        setQuestions(data || []);
        setPage(1);
        setHasMore((data || []).length === 10);
      } else {
        setQuestions(prev => [...prev, ...(data || [])]);
        setPage(p => p + 1);
        setHasMore((data || []).length === 10);
      }
    } catch (err) {
      console.error("Error loading questions from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(true);
    setAnswers({});
    setRevealed({});
    setScore(0);
    setTotalAttempted(0);
  }, [selectedSubject, searchQuery]);

  const handleSelectOption = (q, optIdx) => {
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }
    if (revealed[q.id]) return;

    setAnswers(prev => ({ ...prev, [q.id]: optIdx }));
    setRevealed(prev => ({ ...prev, [q.id]: true }));
    setTotalAttempted(prev => prev + 1);

    const correctLetter = q.correct_answer ? q.correct_answer.toUpperCase().trim() : "";
    const correctIdx = correctLetter.charCodeAt(0) - 65;

    if (optIdx === correctIdx) {
      setScore(prev => prev + 1);
    }
  };

  const handleSaveProgress = async () => {
    if (isGuest || totalAttempted === 0 || submittingStats) {
      navigate("/dashboard");
      return;
    }

    setSubmittingStats(true);
    try {
      const wrongSubjects = [];
      questions.forEach(q => {
        if (revealed[q.id]) {
          const correctLetter = q.correct_answer ? q.correct_answer.toUpperCase().trim() : "";
          const correctIdx = correctLetter.charCodeAt(0) - 65;
          const userAns = answers[q.id];
          if (userAns !== correctIdx) {
            wrongSubjects.push(q.subject || "General");
          }
        }
      });

      await supabase.from("test_history").insert([
        {
          student_id: user?.uid || "anonymous",
          score: score,
          total_questions: totalAttempted,
          wrong_answers: wrongSubjects
        }
      ]);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving history:", err);
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <AppLayout title="Practice Bank">
      <div
        style={{ background: COLORS.bg, fontFamily: "Inter, sans-serif", color: COLORS.textPrimary, minHeight:"100vh" }}
      >
        {/* ---------- MAIN CONTENT ---------- */}
        <div className="flex flex-col items-center w-full">
        <main className="w-full max-w-4xl px-4 md:px-8 pt-6 space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Topic Practice</h2>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Browse and practice UPSC syllabus questions live.</p>
            </div>
            {totalAttempted > 0 && !isGuest && (
              <span className="self-start md:self-auto text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: COLORS.blueSoft, color: COLORS.blue }}>
                Session Score: {score}/{totalAttempted}
              </span>
            )}
          </div>

          {/* Search Panel */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: COLORS.textMuted }} />
            <input
              type="text"
              placeholder="Search statements, chapters, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs transition-all"
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textPrimary,
                outline: "none"
              }}
            />
          </div>

          {/* Subjects Horizontal Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SUBJECTS.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: selectedSubject === subj ? COLORS.blue : COLORS.surface,
                  color: selectedSubject === subj ? (isDarkMode ? "#08101F" : "#fff") : COLORS.textSecondary,
                  border: `1px solid ${selectedSubject === subj ? COLORS.blue : COLORS.border}`
                }}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Questions Grid */}
          <div className="space-y-4 pt-2">
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isRev = revealed[q.id];
              const correctLetter = q.correct_answer ? q.correct_answer.toUpperCase().trim() : "";
              const correctIdx = correctLetter.charCodeAt(0) - 65;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl p-5 space-y-4"
                  style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="px-2.5 py-1 rounded-full uppercase" style={{ background: COLORS.blueSoft, color: COLORS.blue }}>
                      {q.subject || "General"}
                    </span>
                    {q.chapter && <span style={{ color: COLORS.textSecondary }}>{q.chapter}</span>}
                  </div>

                  <p className="text-sm font-semibold leading-relaxed">
                    {idx + 1}. {q.question_text}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAns === oIdx;
                      const isCorrectOpt = oIdx === correctIdx;

                      let optBg = COLORS.surfaceAlt;
                      let optBorder = COLORS.border;
                      let optText = COLORS.textPrimary;

                      if (isRev) {
                        if (isCorrectOpt) {
                          optBg = isDarkMode ? "#103E2F" : "#EAFBF3";
                          optBorder = COLORS.green;
                          optText = COLORS.green;
                        } else if (isSelected) {
                          optBg = isDarkMode ? "#3D1A20" : "#FDEDEF";
                          optBorder = COLORS.red;
                          optText = COLORS.red;
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q, oIdx)}
                          disabled={isRev && !isGuest}
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-colors"
                          style={{
                            background: optBg,
                            border: `1px solid ${optBorder}`,
                            color: optText,
                            cursor: isRev && !isGuest ? "default" : "pointer"
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isRev && !isGuest && (
                    <div className="rounded-xl p-3.5 text-xs space-y-2" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}` }}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {userAns === correctIdx ? (
                          <>
                            <CheckCircle size={14} style={{ color: COLORS.green }} />
                            <span style={{ color: COLORS.green }}>Correct Answer!</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} style={{ color: COLORS.red }} />
                            <span style={{ color: COLORS.red }}>Incorrect (Correct choice is Option {correctLetter})</span>
                          </>
                        )}
                      </div>
                      <p className="leading-relaxed font-normal" style={{ color: COLORS.textSecondary }}>
                        {q.explanation || "No explanation available for this question."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="text-center py-8">
                <RefreshCw size={24} className="animate-spin mx-auto text-blue-400" style={{ color: COLORS.blue }} />
                <p className="text-xs mt-2 text-muted" style={{ color: COLORS.textMuted }}>Fetching questions...</p>
              </div>
            )}

            {!loading && questions.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <HelpCircle size={32} className="mx-auto" style={{ color: COLORS.textMuted }} />
                <p className="text-xs font-semibold" style={{ color: COLORS.textSecondary }}>No questions found matching the query.</p>
              </div>
            )}

            {hasMore && !loading && (
              <button
                onClick={() => fetchQuestions(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
                style={{ border: `1px solid ${COLORS.border}`, color: COLORS.blue }}
              >
                Load More Questions
              </button>
            )}
          </div>
        </main>

        {/* ---------- MOBILE BOTTOM NAV ---------- */}
        <nav
          className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex items-center justify-around py-2.5 z-20"
          style={{ background: isDarkMode ? "rgba(15,30,51,0.95)" : "rgba(255,255,255,0.95)", borderTop: `1px solid ${COLORS.border}`, backdropFilter: "blur(8px)" }}
        >
          {[
            { icon: Home, label: "Home", path: "/dashboard" },
            { icon: BookOpen, label: "Practice", path: "/practice", active: true },
            { icon: Brain, label: "AI Generator", path: "/ai-generator" },
            { icon: Trophy, label: "History", path: "/history" },
          ].map(({ icon: Icon, label, path, active }) => (
            <button key={label} onClick={() => { handleSaveProgress(); navigate(path); }} className="flex flex-col items-center gap-1 px-2">
              <Icon size={20} style={{ color: active ? COLORS.blue : COLORS.textMuted }} />
              <span className="text-[10px] font-medium" style={{ color: active ? COLORS.blue : COLORS.textMuted }}>
                {label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* ---------- GUEST LOGIN WARNING MODAL ---------- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl p-6 relative text-center space-y-4"
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4"
              style={{ color: COLORS.textMuted }}
            >
              <X size={18} />
            </button>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: COLORS.blueSoft, color: COLORS.blue }}>
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-base font-bold">Unlocking Premium Practice</h3>
            <p className="text-xs leading-relaxed" style={{ color: COLORS.textSecondary }}>
              Answering questions and accessing step-by-step explanations requires an account. Signup is free and takes less than 10 seconds!
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-black"
                style={{ background: COLORS.blue }}
              >
                Log In / Sign Up
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border"
                style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
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
