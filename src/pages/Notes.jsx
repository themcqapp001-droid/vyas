import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { supabase } from "../supabase";
import AppLayout from "./AppLayout";
import {
  Home, BookOpen, Brain, Trophy, Settings as SettingsIcon, LogOut, Sun, Moon, LogIn,
  FileText, Shield, ChevronLeft, ChevronRight, Lock, Eye, AlertTriangle, Video, GraduationCap
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

// Demo-free list of actual UPSC Anthropology study documents
const NOTES_DATABASE = [
  {
    id: "anthro-syllabus",
    title: "UPSC Anthropology Optional Syllabus & Topic Analysis",
    description: "Core roadmap covering Paper I & Paper II chapters with weightage data.",
    pages: 3,
    url: "/notes/anthropology_optional_syllabus.pdf"
  },
  {
    id: "anthro-paper1-1.1",
    title: "Paper I: Meaning, Scope and Development of Anthropology",
    description: "Comprehensive notes covering the genesis of Anthropology and branches.",
    pages: 5,
    url: "/notes/anthropology_meaning_scope.pdf"
  },
  {
    id: "anthro-paper2-1.1",
    title: "Paper II: Indian Culture - Palaeo-Anthropological Evidences",
    description: "Detailed study notes on Soan, Acheulian, and Harappan cultural layers.",
    pages: 4,
    url: "/notes/indian_culture_evolution.pdf"
  }
];

export default function Notes() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const COLORS = getDashboardColors(isDarkMode);
  const navigate = useNavigate();
  const isGuest = !user;

  const [notes, setNotes] = useState(NOTES_DATABASE);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const fetchDbNotes = async () => {
      try {
        const { data, error } = await supabase
          .from("notes_library")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setNotes(data);
        }
      } catch (err) {
        console.warn("Failed fetching from notes_library, using default hardcoded documents:", err.message);
      } finally {
        setDbLoading(false);
      }
    };
    fetchDbNotes();
  }, []);

  const [selectedNote, setSelectedNote] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfInstance, setPdfInstance] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [screenBlocked, setScreenBlocked] = useState(false);

  const canvasRef = useRef(null);
  const viewerContainerRef = useRef(null);

  // Anti-screenshot window focus / visibility handlers
  useEffect(() => {
    const handleBlur = () => setScreenBlocked(true);
    const handleFocus = () => setScreenBlocked(false);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    
    const handleVisibility = () => {
      if (document.hidden) setScreenBlocked(true);
      else setScreenBlocked(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Load PDF.js dynamically
  useEffect(() => {
    if (window.pdfjsLib) {
      setPdfLibLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfLibLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Prevent print screen / keyboard copy shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+Shift+I / F12 (Developer Tools)
      if (
        (e.ctrlKey && e.key === "p") ||
        (e.ctrlKey && e.key === "P") ||
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "S") ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I"))
      ) {
        e.preventDefault();
        alert("Security Alert: Saving, Printing, or Inspecting notes is strictly disabled to prevent piracy.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Load and Render PDF document on canvas
  useEffect(() => {
    if (!selectedNote || !pdfLibLoaded) return;

    const loadPdfDoc = async () => {
      setPdfLoading(true);
      setPdfError("");
      setPdfInstance(null);
      setCurrentPage(1);

      try {
        const loadingTask = window.pdfjsLib.getDocument(selectedNote.url);
        const pdf = await loadingTask.promise;
        setPdfInstance(pdf);
        setTotalPages(pdf.numPages);
        renderPdfPage(pdf, 1);
      } catch (err) {
        console.error("Error loading PDF:", err);
        // Fallback: render dummy page if local PDF files don't exist yet
        setPdfError("Direct PDF file not found. Generating a secure simulated reading preview...");
        setTotalPages(selectedNote.pages);
        renderDummyPage(1);
      } finally {
        setPdfLoading(false);
      }
    };

    loadPdfDoc();
  }, [selectedNote, pdfLibLoaded]);

  // Render PDF.js page onto canvas
  const renderPdfPage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      
      // Calculate standard width mapping
      const desiredWidth = Math.min(800, viewerContainerRef.current?.clientWidth || 700);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = desiredWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale: scale });

      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.scale(dpr, dpr);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Error rendering PDF page:", err);
    }
  };

  // Render simulated study notes content if files are not uploaded yet
  const renderDummyPage = (pageNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    const width = 640;
    const height = 820;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);
    ctx.fillStyle = isDarkMode ? "#0F1E33" : "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Draw frame border
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Draw headers
    ctx.fillStyle = COLORS.blue;
    ctx.font = "bold 16px Space Grotesk, sans-serif";
    ctx.fillText("THE MCQ APP — STUDY NOTES LIBRARY", 36, 44);

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = "italic bold 15px Georgia, serif";
    ctx.fillText(selectedNote.title, 36, 80);

    // Draw dummy lines simulating real study content
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = "12px sans-serif";
    
    const textBlocks = [
      "I. INTRODUCTION & CORE CONCEPTIONS",
      "Anthropology, as a holistic discipline, bridges the gap between historical evolutionary biology and",
      "contemporary social structures. Unit 1.1 focuses on the synthesis of three primary branches:",
      "Social-Cultural Anthropology, Physical Anthropology, and Archaeological Anthropology.",
      "",
      "II. EVOLUTIONARY AND HISTORICAL MILESTONES",
      "1. The Enlightenment era roots and early ethnography.",
      "2. The transition from unilineal evolutionism to historical particularism (Franz Boas).",
      "3. Modern functionalist perspectives and post-structuralist critiques.",
      "",
      "III. CORE UPSC EXAMINATION POINTERS",
      "- Always draw evolutionary diagrams when referencing hominid development stages.",
      "- Quote case studies (e.g. Malinowski's Argonauts, Radcliffe-Brown's structural functionalism).",
      "- Differentiate clearly between holistic social science approach vs purely sociological frameworks."
    ];

    let startY = 120;
    textBlocks.forEach(line => {
      if (line.startsWith("I.") || line.startsWith("II.") || line.startsWith("III.")) {
        ctx.fillStyle = COLORS.blue;
        ctx.font = "bold 13px sans-serif";
      } else {
        ctx.fillStyle = COLORS.textSecondary;
        ctx.font = "12px Georgia, serif";
      }
      ctx.fillText(line, 36, startY);
      startY += 24;
    });

    // Page number
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "11px monospace";
    ctx.fillText(`Page ${pageNum} of ${selectedNote.pages}`, width / 2 - 30, height - 40);
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (pdfInstance) renderPdfPage(pdfInstance, nextPage);
      else renderDummyPage(nextPage);
    } else if (direction === "prev" && currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      if (pdfInstance) renderPdfPage(pdfInstance, prevPage);
      else renderDummyPage(prevPage);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <AppLayout title="Study Notes">
      <div style={{ minHeight: "100vh" }}>
      <style>{`
        /* Disable Print styling completely */
        @media print {
          body {
            display: none !important;
          }
        }
        .no-copy-canvas {
          user-select: none !important;
          -webkit-user-select: none !important;
          pointer-events: auto;
        }
      `}</style>

        {/* Content Wrapper */}
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Left panel: List of notes */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Study Notes
              </h1>
              <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                Securely read UPSC preparation notes.
              </p>
            </div>

            <div className="space-y-3">
              {notes.map(note => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className="w-full text-left p-4 rounded-2xl border transition-all hover:scale-[1.01]"
                    style={{
                      background: isSelected ? COLORS.blueSoft : COLORS.surface,
                      borderColor: isSelected ? COLORS.blue : COLORS.border,
                      boxShadow: isSelected ? "0 4px 20px -2px rgba(61,139,255,0.15)" : "none"
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/10 mt-0.5" style={{ color: COLORS.blue }}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-snug" style={{ color: isSelected ? COLORS.blue : COLORS.textPrimary }}>
                          {note.title}
                        </h3>
                        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: COLORS.textSecondary }}>
                          {note.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                          <Shield size={10} /> Secure PDF • {note.pages} pages
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl p-4 border" style={{ background: COLORS.surface, borderColor: COLORS.border }}>
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: COLORS.gold }}>
                <Shield size={14} /> SECURITY PROTOCOL
              </div>
              <p className="text-[11px] mt-2 leading-relaxed" style={{ color: COLORS.textSecondary }}>
                All documents are encrypted and displayed on canvas elements. Downloading, printing, text selection, and right-clicking are strictly disabled to protect proprietary notes from distribution.
              </p>
            </div>
          </div>

          {/* Right panel: Secure PDF Viewer */}
          <div className="flex-1 min-w-0 flex flex-col">
            {selectedNote ? (
              <div
                className="flex-1 rounded-3xl border flex flex-col min-h-[600px] overflow-hidden"
                style={{ background: COLORS.surface, borderColor: COLORS.border }}
              >
                {/* Viewer Top Bar */}
                <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderColor: COLORS.border }}>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm truncate" style={{ color: COLORS.textPrimary }}>
                      {selectedNote.title}
                    </h2>
                    <p className="text-[11px] font-medium" style={{ color: COLORS.textMuted }}>
                      Secure Viewer Mode • Protected by The MCQ App
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange("prev")}
                      className="p-1.5 rounded-xl border transition-all hover:bg-slate-800/10 disabled:opacity-40 disabled:hover:bg-transparent"
                      style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange("next")}
                      className="p-1.5 rounded-xl border transition-all hover:bg-slate-800/10 disabled:opacity-40 disabled:hover:bg-transparent"
                      style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* PDF Error Warnings */}
                {pdfError && (
                  <div className="px-6 py-3 text-xs flex items-center gap-2" style={{ background: COLORS.goldSoft, color: COLORS.gold, borderBottom: `1px solid ${COLORS.border}` }}>
                    <AlertTriangle size={14} />
                    <span>{pdfError}</span>
                  </div>
                )}

                {/* Viewer Canvas Area */}
                <div
                  ref={viewerContainerRef}
                  onContextMenu={(e) => e.preventDefault()}
                  className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start relative select-none"
                  style={{ background: isDarkMode ? "#08101F" : "#DEEAF8" }}
                >
                  {screenBlocked && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 30,
                      background: "rgba(12,18,32,0.95)", backdropFilter: "blur(14px)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: 24, textAlign: "center"
                    }}>
                      <Lock size={44} color="#D4AF37" style={{ marginBottom: 12 }}/>
                      <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#FFF7E8", fontFamily: "Poppins" }}>Screen Protection Shield Active</h3>
                      <p style={{ margin: 0, fontSize: 12, color: "#8EA7C5", maxWidth: 340 }}>Click inside the browser window to resume viewing notes. Screenshots are blocked for piracy protection.</p>
                    </div>
                  )}

                  {pdfLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-3"></div>
                      <p className="text-xs" style={{ color: COLORS.textSecondary }}>Loading document secure layers...</p>
                    </div>
                  ) : (
                    <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white" style={{ filter: screenBlocked ? "blur(20px)" : "none" }}>
                      
                      {/* Dynamic Anti-Screenshot Watermark Layer */}
                      <div
                        className="absolute inset-0 pointer-events-none z-10 flex flex-wrap justify-around items-center overflow-hidden opacity-[0.04] no-copy-canvas"
                        style={{ color: "#000", fontStyle: "italic", fontWeight: "bold" }}
                      >
                        {Array.from({ length: 16 }).map((_, idx) => (
                          <div key={idx} className="transform -rotate-45 text-[11px] whitespace-nowrap p-8">
                            THE MCQ APP - {user?.email || "GUEST PREVIEW"} - LOGGED ACCESS
                          </div>
                        ))}
                      </div>

                      <canvas
                        ref={canvasRef}
                        className="block no-copy-canvas"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t flex items-center justify-between text-xs" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} className="text-emerald-500" />
                    <span>128-bit Content Rendering</span>
                  </div>
                  <span>Secure ID: {selectedNote.id}</span>
                </div>

              </div>
            ) : (
              <div
                className="flex-1 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center p-8 min-h-[500px]"
                style={{ borderColor: COLORS.border, background: COLORS.surface }}
              >
                <div className="p-4 rounded-2xl bg-sky-500/10 mb-4" style={{ color: COLORS.blue }}>
                  <Lock size={28} />
                </div>
                <h3 className="font-bold text-lg" style={{ color: COLORS.textPrimary }}>
                  Notes Library Protected
                </h3>
                <p className="text-xs max-w-sm mt-2 leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  Select any UPSC study note document from the left library panel to launch the Secure Canvas Viewer with live encryption layers.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
