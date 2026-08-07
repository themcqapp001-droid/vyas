import React, { useState, useEffect } from "react";
import AppLayout from "./AppLayout";
import { useTheme } from "../context/ThemeContext";
import { CheckCircle, XCircle, Brain, Target, ArrowRight, RotateCcw } from "lucide-react";

const SUBJECTS_DATA = [
  { id: "1", code: "01_Algorithms", name: "Algorithms" },
  { id: "2", code: "02_CO_and_Architecture", name: "CO & Architecture" },
  { id: "3", code: "03_Compiler_Design", name: "Compiler Design" },
  { id: "4", code: "04_Computer_Networks", name: "Computer Networks" },
  { id: "5", code: "05_Databases", name: "Databases" },
  { id: "6", code: "06_Digital_Logic", name: "Digital Logic" },
  { id: "7", code: "07_Operating_System", name: "Operating System" },
  { id: "8", code: "08_Programming_and_DS", name: "Programming & DS" },
  { id: "9", code: "09_Programming_in_C", name: "Programming in C" },
  { id: "10", code: "10_Theory_of_Computation", name: "Theory of Computation" },
];

export default function GateQuiz() {
  const { isDarkMode } = useTheme();
  
  const [subjects, setSubjects] = useState([]);
  
  // Setup State
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [difficulty, setDifficulty] = useState("Random");
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [natInput, setNatInput] = useState("");
  
  // Adaptive Engine State
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [testResults, setTestResults] = useState([]); // Stores {question_id, is_correct, time_taken}

  useEffect(() => {
    setSubjects(SUBJECTS_DATA);
  }, []);

  const toggleSubject = (subId) => {
    setSelectedSubjects(prev => 
      prev.includes(subId) ? prev.filter(s => s !== subId) : [...prev, subId]
    );
  };

  const startQuiz = async () => {
    setIsLoading(true);
    const subjectsToFetch = selectedSubjects.length > 0 
      ? selectedSubjects
      : ["1"]; // Default to Algorithms for testing if nothing selected
      
    try {
      // 1. Fetch from LOCAL ADAPTIVE ENGINE instead of R2 directly
      const response = await fetch(`${import.meta.env.VITE_EDGE_API_URL}/get_module`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: subjectsToFetch,
          total: totalQuestions
        })
      });
      
      const result = await response.json();
      
      if (!result.success || result.questions.length === 0) {
        alert("Failed to load adaptive questions. Make sure the local python engine is running.");
        setIsLoading(false);
        return;
      }
      
      setQuizQuestions(result.questions);
      setCurrentIndex(0);
      setUserAnswers({});
      setTestResults([]);
      setIsStarted(true);
      setIsFinished(false);
      setQuestionStartTime(Date.now());
    } catch (err) {
      console.error("Adaptive API Error:", err);
      alert("Cannot connect to local Adaptive Engine. Run 'python local_api_server.py' in test/backend_ai");
    }
    setIsLoading(false);
  };

  const handleSelectOption = (option) => {
    setUserAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  const recordResultAndProceed = (userAns) => {
    const q = quizQuestions[currentIndex];
    const correctAns = q.ans.toUpperCase();
    
    // Calculate correctness
    let isCorrect = false;
    if (userAns) {
        if (q.isNumerical) {
            isCorrect = userAns === correctAns; // Simplified for NAT
        } else {
            isCorrect = correctAns.includes(userAns);
        }
    }
    
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000); // in seconds
    
    // Save to batch
    const resultRecord = {
        question_id: q.id,
        is_correct: isCorrect,
        time_taken: timeTaken
    };
    
    const newResults = [...testResults, resultRecord];
    setTestResults(newResults);
    
    // Move to next
    setNatInput("");
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz(newResults);
    }
  };

  const handleNext = () => {
    recordResultAndProceed(userAnswers[currentIndex]);
  };

  const handleSkip = () => {
    setUserAnswers(prev => {
      const newAns = { ...prev };
      delete newAns[currentIndex];
      return newAns;
    });
    recordResultAndProceed(null);
  };

  const handleNatSubmit = () => {
    if (!natInput.trim()) return;
    handleSelectOption(natInput.trim());
    recordResultAndProceed(natInput.trim());
  };

  const finishQuiz = async (finalResults) => {
    setIsFinished(true);
    // 2. BATCH SUBMISSION TO SUPABASE (Via Local API)
    try {
        await fetch(`${import.meta.env.VITE_EDGE_API_URL}/submit_results`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ results: finalResults })
        });
        console.log("Successfully synced results to Supabase!");
    } catch(e) {
        console.error("Failed to sync history", e);
    }
  };

  // Theming colors
  const C = isDarkMode ? {
    bg: "#171923", card: "#2D3748", text: "#E2E8F0", muted: "#A0AEC0", border: "#4A5568",
    primary: "#38B2AC", primaryBg: "rgba(56, 178, 172, 0.15)",
    optionBg: "#1A202C", optionHover: "#2C3E50", optionActive: "#38B2AC"
  } : {
    bg: "#EDF2F7", card: "#FFFFFF", text: "#2D3748", muted: "#718096", border: "#CBD5E0",
    primary: "#319795", primaryBg: "rgba(49, 151, 149, 0.1)",
    optionBg: "#F7FAFC", optionHover: "#E2E8F0", optionActive: "#319795"
  };

  return (
    <AppLayout title="GATE Academy">
      <div style={{ padding: "30px 20px", maxWidth: 900, margin: "0 auto", color: C.text, fontFamily: "Inter, sans-serif" }}>
        
        {!isStarted ? (
          /* SETUP SCREEN */
          <div style={{ background: C.card, borderRadius: 16, padding: 30, border: `1px solid ${C.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ background: C.primaryBg, padding: 10, borderRadius: 10, color: C.primary }}>
                <Brain size={24} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>Adaptive GATE Engine</h1>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Powered by Spaced Repetition (Anki)</p>
              </div>
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Select Topics to Practice</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 30, padding: 5 }}>
              {subjects.map(sub => (
                <div 
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  style={{
                    padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: selectedSubjects.includes(sub.id) ? C.primary : C.bg,
                    color: selectedSubjects.includes(sub.id) ? "#fff" : C.text,
                    border: `1px solid ${selectedSubjects.includes(sub.id) ? C.primary : C.border}`,
                    transition: "all 0.2s"
                  }}
                >
                  {sub.name}
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Select Number of Questions</h3>
            <div style={{ marginBottom: 30 }}>
              <select 
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text, fontSize: 15, outline: "none", cursor: "pointer"
                }}
              >
                <option value={3}>3 Questions (Quick Test)</option>
                <option value={5}>5 Questions (Short Test)</option>
                <option value={10}>10 Questions (Standard Test)</option>
                <option value={20}>20 Questions (Full Mock)</option>
              </select>
            </div>

            <button 
              onClick={startQuiz}
              disabled={isLoading}
              style={{
                width: "100%", padding: 16, borderRadius: 12, border: "none", cursor: isLoading ? "not-allowed" : "pointer",
                background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 4px 14px rgba(49,151,149,0.4)",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? "Generating Module..." : "Start Adaptive Test"} <ArrowRight size={18} />
            </button>
          </div>
        ) : !isFinished ? (
          /* QUIZ SCREEN */
          <div style={{ background: C.card, borderRadius: 16, padding: "30px 20px", border: `1px solid ${C.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            
            {/* PROGRESS BAR */}
            <div style={{ width: "100%", height: 6, background: C.border, borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ 
                height: "100%", background: C.primary, 
                width: `${((currentIndex) / quizQuestions.length) * 100}%`,
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" 
              }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                Question {currentIndex + 1} <span style={{ color: C.muted, fontSize: 14, fontWeight: 500 }}>of {quizQuestions.length}</span>
              </div>
              <div style={{ fontSize: 12, background: C.primaryBg, color: C.primary, padding: "4px 12px", borderRadius: 20, fontWeight: 800 }}>
                {quizQuestions[currentIndex].difficulty?.toUpperCase() || "NORMAL"}
              </div>
            </div>

            <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "2px solid #E2E8F0", marginBottom: 24, textAlign: "center", overflow: "hidden" }}>
              <img 
                src={`https://pub-fc39930145d64fc797cab2a71d18e283.r2.dev/${SUBJECTS_DATA.find(s => s.id === quizQuestions[currentIndex].id.split(".")[0])?.code || "01_Algorithms"}/${quizQuestions[currentIndex].id}.png`} 
                alt="Question" 
                style={{ maxWidth: "100%", maxHeight: "50vh", objectFit: "contain" }}
              />
            </div>

            {quizQuestions[currentIndex].isNumerical ? (
              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginTop: 10 }}>
                <input
                  type="text"
                  value={natInput}
                  onChange={(e) => setNatInput(e.target.value)}
                  placeholder="Enter numerical answer"
                  onKeyDown={(e) => e.key === "Enter" && handleNatSubmit()}
                  style={{
                    padding: "16px 20px", borderRadius: 12, border: `2px solid ${C.border}`,
                    background: C.bg, color: C.text, fontSize: 18, fontWeight: 600, width: "100%", maxWidth: 300,
                    outline: "none"
                  }}
                />
                <button
                  onClick={handleNatSubmit}
                  style={{
                    padding: "16px 24px", borderRadius: 12, border: "none",
                    background: C.primary, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Submit
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {["A", "B", "C", "D"].map(opt => {
                  const isSelected = userAnswers[currentIndex] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      style={{
                         padding: 20, borderRadius: 12, border: `2px solid ${isSelected ? C.primary : C.border}`,
                        background: isSelected ? C.primary : C.optionBg, 
                        color: isSelected ? "#fff" : C.text, 
                        fontSize: 20, fontWeight: 800,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              <button 
                onClick={handleSkip} 
                style={{ 
                  background: "transparent", border: `1.5px solid ${C.border}`, color: C.muted, 
                  padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600
                }}
              >
                Skip Question
              </button>

              <button 
                onClick={handleNext} 
                style={{ 
                  background: C.primary, color: "#fff", border: "none",
                  padding: "12px 30px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {currentIndex < quizQuestions.length - 1 ? "Save & Next" : "Finish Quiz"} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* RESULT SCREEN */
          <div style={{ background: C.card, borderRadius: 16, padding: 30, border: `1px solid ${C.border}` }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ display: "inline-flex", background: C.primaryBg, padding: 20, borderRadius: "50%", color: C.primary, marginBottom: 16 }}>
                <Target size={40} />
              </div>
              <h2 style={{ fontSize: 28, margin: "0 0 8px" }}>Adaptive Test Completed!</h2>
              <p style={{ color: "#38A169", margin: 0, fontSize: 15, fontWeight: 600 }}>Results have been synced to your Spaced Repetition History.</p>
            </div>

            <button 
              onClick={() => setIsStarted(false)}
              style={{
                width: "100%", padding: 16, borderRadius: 12, border: "none", cursor: "pointer",
                background: C.bg, color: C.text, fontSize: 16, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                border: `2px solid ${C.border}`
              }}
            >
              <RotateCcw size={18} /> Take Another Adaptive Test
            </button>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
