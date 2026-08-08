import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "./AppLayout";
import { supabase } from "../supabase";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronRight,
  CheckCircle2, Award, Bookmark, Video, Clock, Lock, ShieldAlert,
  Sparkles, Check, RefreshCw, FolderOpen, ArrowLeft, FileText,
  ChevronDown, ZoomIn, Settings, BookOpen, ChevronLeft, Star,
  SkipBack, SkipForward, Repeat, BarChart2, Users, PlayCircle
} from "lucide-react";

/* ─── THEME COLORS ─────────────────────────────────────────────── */
function useC(dark) {
  return dark ? {
    bg: "#0B0F1A", surface: "#111827", surfaceAlt: "#1A2235",
    surfaceHover: "#1E2A40",
    border: "#1E2D45", borderAccent: "#2A3F5C",
    text: "#EDF2FF", textSec: "#8EA7C5", textMuted: "#4A5E7A",
    accent: "#6C63FF", accentSoft: "rgba(108,99,255,0.15)",
    gold: "#F59E0B", goldSoft: "rgba(245,158,11,0.12)",
    maroon: "#7C1D2E", maroonDark: "#4A1120",
    green: "#10B981", greenSoft: "rgba(16,185,129,0.12)",
    red: "#EF4444", redSoft: "rgba(239,68,68,0.12)",
    blue: "#3B82F6", blueSoft: "rgba(59,130,246,0.12)",
    playerBg: "#070B14",
    controlBg: "rgba(7,11,20,0.97)",
    cardGrad: "linear-gradient(135deg,#111827 0%,#1A2235 100%)",
  } : {
    bg: "#FBF1E1", surface: "#FFFFFF", surfaceAlt: "#F5E6D3",
    surfaceHover: "#EDE0C8",
    border: "#EDE0C8", borderAccent: "rgba(212, 175, 55, 0.3)",
    text: "#2C2C2A", textSec: "#5F5E5A", textMuted: "#8A7A6C",
    accent: "#7A1F2B", accentSoft: "rgba(122,31,43,0.1)",
    gold: "#D4AF37", goldSoft: "rgba(212,175,55,0.12)",
    maroon: "#7A1F2B", maroonDark: "#5C1A22",
    green: "#0FA36B", greenSoft: "rgba(15,163,107,0.08)",
    red: "#E0455B", redSoft: "rgba(224,69,91,0.08)",
    blue: "#2F6FED", blueSoft: "rgba(47,111,237,0.08)",
    playerBg: "#1A1F2E",
    controlBg: "rgba(0,0,0,0.92)",
    cardGrad: "linear-gradient(135deg,#FFFFFF 0%,#FBF1E1 100%)",
  };
}

/* ─── COURSES DATABASE (Base + Admin-uploaded merged) ─────────── */
const BASE_COURSES = {
  basic: {
    id: "basic",
    title: "RAS Foundation Course",
    subtitle: "RPSC Rajasthan Administrative Services",
    price: "FREE",
    isFree: true,
    color: "#10B981",
    colorSoft: "rgba(16,185,129,0.15)",
    icon: "🎯",
    students: "2,341",
    rating: 4.8,
    syllabus: [
      {
        chapterTitle: "Chapter 1: Exam Strategy & Foundation",
        chapterNo: 1,
        lectures: [
          {
            id: "ras-basic-1", no: 1,
            title: "RAS Prep Strategy & Syllabus Core",
            duration: "12 min",
            videoId: "SDl6RDJqQ0ZJMFk=",
            description: "Essential strategy for cracking RPSC RAS Prelims and Mains. Groundwork on Rajasthan history, polity, geography, and current affairs."
          }
        ],
        notes: [
          { title: "Rajasthan GK Blueprint Revision Notes", pages: 12 },
          { title: "RAS Mains Answer Writing Structure Guide", pages: 8 }
        ]
      }
    ]
  },
  anthropology: {
    id: "anthropology",
    title: "Anthropology Optional",
    subtitle: "UPSC/RPSC Optional Paper",
    price: "₹1,999",
    isFree: false,
    color: "#8B5CF6",
    colorSoft: "rgba(139,92,246,0.15)",
    icon: "🧬",
    students: "891",
    rating: 4.9,
    syllabus: [
      {
        chapterTitle: "Chapter 1: Meaning and Scope of Anthropology",
        chapterNo: 1,
        lectures: [
          {
            id: "lec-1.1", no: 1,
            title: "Scope, Branches and Core Relationships",
            duration: "42 min",
            videoId: "YjF0SmdYUTBqLTQ=",
            description: "Overview of Social-Cultural, Physical, and Archaeological branches."
          },
          {
            id: "lec-1.2", no: 2,
            title: "Research Methodology & Fieldwork Tradition",
            duration: "38 min",
            videoId: "bFYzbTJQMnlRbzQ=",
            description: "Analysis of Malinowski's participant observation and fieldwork protocols."
          }
        ],
        notes: [
          { title: "Intro to Social-Cultural Anthropology PDF", pages: 24 },
          { title: "Anthropological Fieldwork Traditions Notes", pages: 18 }
        ]
      },
      {
        chapterTitle: "Chapter 2: Human Evolution and Genetic Strata",
        chapterNo: 2,
        lectures: [
          {
            id: "lec-2.1", no: 3,
            title: "Hominid Fossil Evidences & Australopithecus",
            duration: "55 min",
            videoId: "RjFSOVA5djR4NG8=",
            description: "Morphological analysis of Australopithecines fossil layers."
          },
          {
            id: "lec-2.2", no: 4,
            title: "Neanderthal Man & Hominid Phylogeny",
            duration: "48 min",
            videoId: "WFF4UDl2NHg0bzk=",
            description: "Comparison between progressive and classic Neanderthals."
          }
        ],
        notes: [
          { title: "Hominid Evolution Fossil Analysis PDF", pages: 30 },
          { title: "Neanderthal Fossil Sites Matrix Notes", pages: 15 }
        ]
      }
    ]
  }
};

/* Merge admin-uploaded chapters/lectures from localStorage */
function buildCourseDB() {
  try {
    const adminRaw = localStorage.getItem("admin_courses");
    if (!adminRaw) return BASE_COURSES;
    const adminCourses = JSON.parse(adminRaw); // array: [{id, title, chapters:[{chapterTitle, lectures:[]}]}]
    const merged = { ...BASE_COURSES };

    adminCourses.forEach(adminCourse => {
      if (!merged[adminCourse.id]) return;
      if (!adminCourse.chapters || adminCourse.chapters.length === 0) return;

      // Add admin chapters to this course, avoiding duplicates by chapterTitle
      const existingTitles = new Set(merged[adminCourse.id].syllabus.map(s => s.chapterTitle));
      adminCourse.chapters.forEach((ch, cIdx) => {
        if (existingTitles.has(ch.chapterTitle)) {
          // Merge lectures into existing chapter
          const existingChapter = merged[adminCourse.id].syllabus.find(s => s.chapterTitle === ch.chapterTitle);
          if (existingChapter) {
            const existingLecIds = new Set(existingChapter.lectures.map(l => l.id));
            ch.lectures.forEach(lec => {
              if (!existingLecIds.has(lec.id)) {
                existingChapter.lectures.push({
                  ...lec,
                  no: existingChapter.lectures.length + 1
                });
              }
            });
          }
        } else {
          // New chapter from admin — add it
          const baseNo = merged[adminCourse.id].syllabus.length + 1;
          const totalLecsBefore = merged[adminCourse.id].syllabus.flatMap(s => s.lectures).length;
          merged[adminCourse.id].syllabus.push({
            chapterTitle: ch.chapterTitle,
            chapterNo: baseNo + cIdx,
            notes: [],
            lectures: ch.lectures.map((lec, li) => ({
              ...lec,
              no: totalLecsBefore + li + 1
            }))
          });
        }
      });
    });

    // Recompute totals
    Object.values(merged).forEach(course => {
      const totalLecs = course.syllabus.flatMap(s => s.lectures).length;
      course.totalLectures = totalLecs;
    });

    return merged;
  } catch (e) {
    return BASE_COURSES;
  }
}


/* ─── HELPERS ─────────────────────────────────────────────────── */
function fmtTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}
function fmtPct(cur, tot) {
  if (!tot) return 0;
  return Math.min(100, Math.round((cur / tot) * 100));
}
function decode(enc) {
  try { return atob(enc); } catch { return "dQw4w9WgXcQ"; }
}

/* ─── STAR RATING ─────────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10} fill={i <= Math.floor(rating) ? "#F59E0B" : "none"} color="#F59E0B"/>
      ))}
      <span style={{ fontSize: 11, color: "#F59E0B", marginLeft: 3, fontWeight: 700 }}>{rating}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Courses() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const C = useC(isDarkMode);
  const navigate = useNavigate();

  /* ── Refs ── */
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  /* ── Navigation State ── */
  const [view, setView] = useState("directory"); // "directory" | "workspace"
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [coursesDb, setCoursesDb] = useState(BASE_COURSES);

  useEffect(() => {
    const loadDbCourses = async () => {
      try {
        const { data: dbCourses, error: cErr } = await supabase.from("courses").select("*");
        if (cErr) throw cErr;

        const { data: dbChapters, error: chErr } = await supabase.from("chapters").select("*").order("chapter_no", { ascending: true });
        if (chErr) throw chErr;

        const { data: dbLectures, error: lErr } = await supabase.from("lectures").select("*").order("lecture_no", { ascending: true });
        if (lErr) throw lErr;

        const { data: dbNotes, error: nErr } = await supabase.from("notes").select("*");
        if (nErr) throw nErr;

        // Group into mapping
        const mapped = {};
        (dbCourses || []).forEach(course => {
          const chs = (dbChapters || [])
            .filter(ch => ch.course_id === course.id)
            .map(ch => {
              const lecs = (dbLectures || [])
                .filter(lec => lec.chapter_id === ch.id)
                .map(lec => ({
                  id: lec.id,
                  no: lec.lecture_no,
                  title: lec.title,
                  duration: lec.duration,
                  videoId: lec.video_id,
                  description: lec.description
                }));
              const notes = (dbNotes || [])
                .filter(note => note.chapter_id === ch.id)
                .map(note => ({
                  title: note.title,
                  pages: note.pages,
                  url: note.url
                }));
              return {
                chapterTitle: ch.chapter_title,
                chapterNo: ch.chapter_no,
                lectures: lecs,
                notes: notes
              };
            });

          mapped[course.id] = {
            id: course.id,
            title: course.title,
            subtitle: course.subtitle,
            price: course.price,
            isFree: course.is_free,
            color: course.color,
            icon: course.icon,
            students: course.students,
            rating: course.rating,
            syllabus: chs,
            totalLectures: chs.flatMap(c => c.lectures).length
          };
        });

        if (Object.keys(mapped).length > 0) {
          setCoursesDb(mapped);
        }
      } catch (err) {
        console.warn("Supabase load failed, using local storage/base fallback:", err.message);
        const buildLocal = buildCourseDB();
        setCoursesDb(buildLocal);
      }
    };

    loadDbCourses();
  }, []);

  const activeCourse = activeCourseId ? coursesDb[activeCourseId] : null;

  /* ── Course/Lecture State ── */
  const [activeLecture, setActiveLecture] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState([0]);
  const [activeTab, setActiveTab] = useState("overview");

  /* ── Enrollment ── */
  const [enrolled, setEnrolled] = useState(() => {
    const s = localStorage.getItem("pw_enrolled");
    // basic is always free
    return s ? JSON.parse(s) : { basic: true };
  });
  const [enrolling, setEnrolling] = useState(false);

  /* ── Player State ── */
  const [videoStarted, setVideoStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [screenBlocked, setScreenBlocked] = useState(false);
  const [qualityNotif, setQualityNotif] = useState("");

  /* ── Watch History (for progress tracking) ── */
  const [watchProgress, setWatchProgress] = useState(() => {
    const s = localStorage.getItem("pw_watch_progress");
    return s ? JSON.parse(s) : {};
  });

  /* ── Sync enrolled to storage ── */
  useEffect(() => {
    localStorage.setItem("pw_enrolled", JSON.stringify(enrolled));
  }, [enrolled]);

  /* ── Sync watch progress ── */
  useEffect(() => {
    if (activeLecture && currentTime > 5) {
      const key = activeLecture.id;
      const tot = activeLecture.durationSecs;
      const updated = { ...watchProgress, [key]: { time: currentTime, pct: fmtPct(currentTime, tot) } };
      setWatchProgress(updated);
      localStorage.setItem("pw_watch_progress", JSON.stringify(updated));
    }
  }, [currentTime]);

/* Helper to convert duration string (like "42 min", "12", "3 hrs") to seconds */
function parseDurationToSeconds(str) {
  if (!str) return 0;
  const s = String(str).toLowerCase().trim();
  
  if (/^\d+$/.test(s)) {
    const val = parseInt(s, 10);
    // If it's a small number like 12 or 45, it is minutes. If large, it is seconds.
    return val < 600 ? val * 60 : val;
  }
  
  const hrMatch = s.match(/(\d+)\s*(hr|hour|h)/);
  const minMatch = s.match(/(\d+)\s*(min|minute|m)/);
  const secMatch = s.match(/(\d+)\s*(sec|second|s)/);
  
  let total = 0;
  if (hrMatch) total += parseInt(hrMatch[1], 10) * 3600;
  if (minMatch) total += parseInt(minMatch[1], 10) * 60;
  if (secMatch) total += parseInt(secMatch[1], 10);
  
  return total || 0;
}

  /* ── Reset player when lecture changes ── */
  useEffect(() => {
    setVideoStarted(false);
    setIsPlaying(false);
    setCurrentTime(0);
    // Set initial duration from database parsed value so seek works immediately
    const initialDur = activeLecture ? parseDurationToSeconds(activeLecture.duration) : 0;
    setDuration(initialDur);
    setZoom(1);
    setShowSettings(false);
  }, [activeLecture]);


  /* ── Reset lecture list when course changes ── */
  useEffect(() => {
    if (activeCourse) {
      setActiveLecture(activeCourse.syllabus[0].lectures[0]);
      setExpandedChapters([0]);
    }
  }, [activeCourseId]);

  /* ── Anti-screenshot ── */
  useEffect(() => {
    const onBlur = () => setScreenBlocked(true);
    const onFocus = () => setScreenBlocked(false);
    const onVis = () => setScreenBlocked(document.hidden);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  /* ── Prevent DevTools / Print ── */
  useEffect(() => {
    const onKey = e => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i","I"].includes(e.key))
        || (e.ctrlKey && ["p","P","s","S","u","U"].includes(e.key))) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── YT postMessage listener ── */
  useEffect(() => {
    const handler = e => {
      if (e.origin !== "https://www.youtube.com") return;
      try {
        const d = JSON.parse(e.data);
        if (d.event === "infoDelivery" && d.info) {
          if (d.info.currentTime !== undefined) setCurrentTime(d.info.currentTime);
          if (d.info.duration !== undefined) setDuration(d.info.duration);
          if (d.info.playerState !== undefined) setIsPlaying(d.info.playerState === 1);
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ── Fullscreen ── */
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  /* ── Auto-hide controls ── */
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  /* ── Player Commands ── */
  const post = (func, args = []) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  };

  const togglePlay = () => {
    if (isPlaying) { post("pauseVideo"); setIsPlaying(false); }
    else { post("playVideo"); setIsPlaying(true); }
  };

  const seek = val => { setCurrentTime(val); post("seekTo", [val, true]); };

  const changeSpeed = v => { setSpeed(v); post("setPlaybackRate", [v]); };

  const toggleMute = () => {
    if (isMuted) { post("unMute"); setIsMuted(false); }
    else { post("mute"); setIsMuted(true); }
  };

  const changeVolume = v => {
    setVolume(v);
    post("setVolume", [v]);
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) playerRef.current.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  const enrollCourse = id => {
    setEnrolling(true);
    setTimeout(() => {
      setEnrolled(prev => ({ ...prev, [id]: true }));
      setEnrolling(false);
    }, 1500);
  };

  const openCourse = id => {
    setActiveCourseId(id);
    setView("workspace");
  };

  const goBack = () => {
    setView("directory");
    setActiveCourseId(null);
    setActiveLecture(null);
    setVideoStarted(false);
  };

  /* ── Zoom: scale iframe larger than container, then clip ── */
  const zoomStyle = {
    width: `${100 / zoom}%`,
    height: `${100 / zoom}%`,
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
    border: "none",
    pointerEvents: "none",
  };

  // Use real iframe-reported duration only — no hardcoded fallback
  const totalDur = duration > 0 ? duration : 0;
  const progressPct = fmtPct(currentTime, totalDur);

  const isEnrolled = id => !!enrolled[id];

  /* ── All lectures flat list for prev/next ── */
  const allLectures = activeCourse ? activeCourse.syllabus.flatMap(c => c.lectures) : [];
  const lectureIdx = allLectures.findIndex(l => l.id === activeLecture?.id);
  const hasPrev = lectureIdx > 0;
  const hasNext = lectureIdx < allLectures.length - 1;

  const goToLecture = (lecture) => {
    setActiveLecture(lecture);
    setVideoStarted(true);
    // expand the chapter that contains this lecture
    activeCourse?.syllabus.forEach((ch, cIdx) => {
      if (ch.lectures.some(l => l.id === lecture.id)) {
        setExpandedChapters(prev => prev.includes(cIdx) ? prev : [...prev, cIdx]);
      }
    });
  };

  const playPrev = () => { if (hasPrev) goToLecture(allLectures[lectureIdx - 1]); };
  const playNext = () => { if (hasNext) goToLecture(allLectures[lectureIdx + 1]); };

  /* ═══════════════ RENDER ═══════════════════════════════════ */
  return (
    <AppLayout title="RAS ACADEMY — Lecture Portal">
      <div style={{ minHeight: "100vh", background: C.bg, paddingTop: 60 }}>

        {/* ────────────────────────────────────────────────────
            VIEW 1: COURSE DIRECTORY
        ──────────────────────────────────────────────────── */}
        {view === "directory" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>

            {/* Hero Header */}
            <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: "Poppins,sans-serif", fontSize: 26, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>
                  📚 My Learning Portal
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>
                  Premium lecture series for RPSC & UPSC aspirants
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { label: "Enrolled", val: Object.keys(enrolled).length, color: C.green },
                  { label: "Lectures", val: Object.values(coursesDb).filter(c => enrolled[c.id]).reduce((a, c) => a + c.syllabus.flatMap(s=>s.lectures).length, 0), color: C.accent },
                ].map(stat => (
                  <div key={stat.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "10px 18px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, fontFamily: "Poppins" }}>{stat.val}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrolled Courses */}
            {Object.keys(enrolled).length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 4, height: 22, background: C.green, borderRadius: 4 }}/>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>
                    My Enrolled Courses
                  </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
                  {Object.values(coursesDb).filter(c => enrolled[c.id]).map(course => {
                    const lastWatched = course.syllabus[0].lectures[0];
                    const prog = watchProgress[lastWatched.id];
                    return (
                      <div key={course.id} style={{
                        background: C.surface, border: `1.5px solid ${C.border}`,
                        borderRadius: 20, overflow: "hidden",
                        boxShadow: `0 4px 20px rgba(0,0,0,0.08)`,
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.14)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
                      >
                        {/* Card Top Banner */}
                        <div style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}44)`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 36 }}>{course.icon}</div>
                          <div>
                            <div style={{ fontSize: 8, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>
                              ✓ ENROLLED
                            </div>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>{course.title}</h3>
                            <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{course.subtitle}</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {prog && (
                          <div style={{ padding: "10px 24px 0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginBottom: 5, fontWeight: 700 }}>
                              <span>Progress</span><span>{prog.pct}%</span>
                            </div>
                            <div style={{ height: 4, background: C.border, borderRadius: 4 }}>
                              <div style={{ width: `${prog.pct}%`, height: "100%", background: course.color, borderRadius: 4, transition: "width 0.5s" }}/>
                            </div>
                          </div>
                        )}

                        {/* Card Body */}
                        <div style={{ padding: "14px 24px 20px" }}>
                          <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                          {(() => {
                              const lecCount = course.syllabus.flatMap(s=>s.lectures).length;
                              return [
                                { icon: "🎥", val: `${lecCount} lecture${lecCount!==1?'s':''}` },
                                { icon: "👥", val: `${course.students} students` },
                              ];
                            })().map(s => (
                              <span key={s.val} style={{ fontSize: 11, color: C.textSec, display: "flex", alignItems: "center", gap: 4 }}>
                                {s.icon} {s.val}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => openCourse(course.id)}
                            style={{
                              width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
                              background: `linear-gradient(135deg, ${course.color}, ${course.color}CC)`,
                              color: "#fff", fontFamily: "Poppins,sans-serif", fontWeight: 700,
                              fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center",
                              justifyContent: "center", gap: 8,
                              boxShadow: `0 4px 16px ${course.color}44`
                            }}
                          >
                            <PlayCircle size={16}/>
                            {prog ? "Continue Watching" : "Start Learning"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Courses */}
            {Object.values(coursesDb).some(c => !enrolled[c.id]) && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 4, height: 22, background: C.accent, borderRadius: 4 }}/>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>
                    Explore More Courses
                  </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
                  {Object.values(coursesDb).filter(c => !enrolled[c.id]).map(course => (
                    <div key={course.id} style={{
                      background: C.surface, border: `1.5px solid ${C.border}`,
                      borderRadius: 20, overflow: "hidden",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}>
                      <div style={{ background: `linear-gradient(135deg, ${course.color}11, ${course.color}22)`, padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ fontSize: 36 }}>{course.icon}</div>
                        <div>
                          <div style={{ fontSize: 8, fontWeight: 800, color: course.isFree ? C.green : C.accent, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>
                            {course.isFree ? "FREE" : "PREMIUM"}
                          </div>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text, fontFamily: "Poppins" }}>{course.title}</h3>
                          <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{course.subtitle}</div>
                        </div>
                      </div>
                      <div style={{ padding: "14px 24px 20px" }}>
                        <div style={{ display: "flex", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
                          {[
                            { icon: "🎥", val: `${course.syllabus.flatMap(s=>s.lectures).length} lectures` },
                          ].map(s => (
                            <span key={s.val} style={{ fontSize: 11, color: C.textSec, display: "flex", alignItems: "center", gap: 4 }}>
                              {s.icon} {s.val}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginBottom: 14 }}><Stars rating={course.rating}/></div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={() => enrollCourse(course.id)}
                            disabled={enrolling}
                            style={{
                              flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
                              background: course.isFree
                                ? "linear-gradient(135deg,#10B981,#059669)"
                                : "linear-gradient(135deg,#6C63FF,#4F46E5)",
                              color: "#fff", fontFamily: "Poppins,sans-serif", fontWeight: 700,
                              fontSize: 13, cursor: enrolling ? "not-allowed" : "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                            }}
                          >
                            {enrolling
                              ? <><RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }}/> Enrolling...</>
                              : <><Sparkles size={12}/> {course.isFree ? "Enroll Free" : `Buy ${course.price}`}</>
                            }
                          </button>
                          <button
                            onClick={() => openCourse(course.id)}
                            style={{
                              padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`,
                              background: "transparent", color: C.textSec, cursor: "pointer",
                              fontSize: 12, fontWeight: 600
                            }}
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ────────────────────────────────────────────────────
            VIEW 2: WORKSPACE (Player + Chapters)
        ──────────────────────────────────────────────────── */}
        {view === "workspace" && activeCourse && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>

            {/* Top Bar */}
            <div className="ras-workspace-topbar" style={{
              background: C.surface, borderBottom: `1px solid ${C.border}`,
              padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 14, flexShrink: 0
            }}>
              <button
                onClick={goBack}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
                  borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`,
                  color: C.textSec, fontSize: 12, fontWeight: 700, cursor: "pointer"
                }}
              >
                <ArrowLeft size={13}/> Courses
              </button>
              <div className="ras-topbar-separator" style={{ width: 1, height: 20, background: C.border }}/>
              <div className="ras-topbar-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{activeCourse.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Poppins" }}>{activeCourse.title}</span>
              </div>
              {activeLecture && (
                <>
                  <span className="ras-topbar-separator" style={{ display: "flex", alignItems: "center" }}><ChevronRight size={13} color={C.textMuted}/></span>
                  <span className="ras-topbar-lecture" style={{ fontSize: 12, color: C.textSec }}>
                    L{activeLecture.no}: {activeLecture.title}
                  </span>
                </>
              )}
            </div>

            {/* Main Layout: Left = Player, Right = Chapters */}
            <div className="ras-workspace-layout" style={{ display: "flex", flex: 1, overflow: "hidden" }}>

              {/* ─── LEFT: Player Area ─── */}
              <div className="ras-player-area" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.playerBg }}>

                {/* Video Container */}
                <div
                  ref={playerRef}
                  className="ras-video-container"
                  style={{
                    flex: 1, position: "relative", background: "#000", overflow: "hidden",
                    cursor: "pointer"
                  }}
                  onMouseMove={resetControlsTimer}
                  onClick={(e) => {
                    // Only toggle play if clicking directly on the video area, not on buttons/selects
                    const tag = e.target.tagName.toLowerCase();
                    if (tag === "button" || tag === "select" || tag === "input" || tag === "a") return;
                    if (e.target.closest("button") || e.target.closest("select") || e.target.closest("input")) return;
                    if (videoStarted) togglePlay();
                  }}
                >
                  {/* ── Screen Blocked (blur) ── */}
                  {screenBlocked && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 50,
                      background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 12, padding: 24, textAlign: "center"
                    }}>
                      <ShieldAlert size={48} color="#F59E0B"/>
                      <h3 style={{ margin: 0, color: "#FFF", fontSize: 18, fontWeight: 700, fontFamily: "Poppins" }}>
                        Screen Protection Active
                      </h3>
                      <p style={{ margin: 0, color: "#8EA7C5", fontSize: 13, maxWidth: 320 }}>
                        Click to return to the video. Screen recording is monitored.
                      </p>
                    </div>
                  )}

                  {/* ── Not Enrolled Lock ── */}
                  {!enrolled[activeCourse.id] && !screenBlocked && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 40,
                      background: "linear-gradient(135deg,rgba(0,0,0,0.94),rgba(30,10,60,0.94))",
                      backdropFilter: "blur(8px)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 16, padding: 24, textAlign: "center"
                    }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: "50%",
                        background: "rgba(108,99,255,0.15)", border: "2px solid #6C63FF",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <Lock size={32} color="#6C63FF"/>
                      </div>
                      <h3 style={{ margin: 0, color: "#FFF", fontSize: 20, fontWeight: 800, fontFamily: "Poppins" }}>
                        {activeCourse.isFree ? "Claim Your Free Access" : "Premium Course"}
                      </h3>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 13, maxWidth: 340 }}>
                        {activeCourse.isFree
                          ? "This course is free. Enroll now to start watching."
                          : `Enroll at ${activeCourse.price} to unlock all lectures.`}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); enrollCourse(activeCourse.id); }}
                        disabled={enrolling}
                        style={{
                          padding: "14px 32px", borderRadius: 12, border: "none",
                          background: activeCourse.isFree
                            ? "linear-gradient(135deg,#10B981,#059669)"
                            : "linear-gradient(135deg,#6C63FF,#4F46E5)",
                          color: "#fff", fontFamily: "Poppins,sans-serif",
                          fontWeight: 700, fontSize: 14, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 8,
                          boxShadow: "0 8px 24px rgba(108,99,255,0.4)"
                        }}
                      >
                        {enrolling
                          ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }}/> Enrolling...</>
                          : <><Sparkles size={14}/> {activeCourse.isFree ? "Enroll Free Now" : `Buy Now — ${activeCourse.price}`}</>
                        }
                      </button>
                    </div>
                  )}

                  {/* ── Start Cover (play button) ── */}
                  {enrolled[activeCourse.id] && !videoStarted && !screenBlocked && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setVideoStarted(true); setIsPlaying(true); }}
                      style={{
                        position: "absolute", inset: 0, zIndex: 30,
                        background: "linear-gradient(135deg,#0B0F1A 0%,#1A1F2E 100%)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: 16, cursor: "pointer"
                      }}
                    >
                      <div style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: `${activeCourse.color}22`, border: `2.5px solid ${activeCourse.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 32px ${activeCourse.color}44`,
                        transition: "transform 0.2s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        <Play size={32} fill={activeCourse.color} color={activeCourse.color} style={{ marginLeft: 4 }}/>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: "#FFF", fontSize: 15, fontWeight: 700, fontFamily: "Poppins" }}>
                          {activeLecture?.title}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>
                          Lecture {activeLecture?.no} • {activeLecture?.duration}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Click Blocker (prevent opening YT) ── */}
                  {enrolled[activeCourse.id] && videoStarted && !screenBlocked && (
                    <div
                      style={{ position: "absolute", inset: 0, zIndex: 15, background: "transparent" }}
                      onContextMenu={e => e.preventDefault()}
                    />
                  )}

                  {/* ── iframe (hidden YT branding) ── */}
                  {enrolled[activeCourse.id] && videoStarted && !screenBlocked && activeLecture && (
                    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
                      {/* YT Logo hiders */}
                      <div style={{ position: "absolute", bottom: 0, right: 0, width: 120, height: 48, background: "#000", zIndex: 5, pointerEvents: "none" }}/>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 52, background: "transparent", zIndex: 5, pointerEvents: "none" }}/>
                      <iframe
                        ref={iframeRef}
                        title={activeLecture.title}
                        style={zoomStyle}
                        src={`https://www.youtube.com/embed/${decode(activeLecture.videoId)}?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&enablejsapi=1&playsinline=1&origin=${window.location.origin}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}

                  {/* ── Custom Controls Bar ── */}
                  {enrolled[activeCourse.id] && videoStarted && !screenBlocked && (
                    <div
                      style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
                        background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
                        padding: "40px 16px 14px",
                        transition: "opacity 0.3s",
                        opacity: showControls ? 1 : 0,
                        pointerEvents: showControls ? "auto" : "none"
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Progress Bar */}
                      <div style={{ marginBottom: 10, position: "relative" }}>
                        <input
                          type="range"
                          min={0} max={totalDur} value={currentTime} step={0.5}
                          onChange={e => seek(parseFloat(e.target.value))}
                          style={{ width: "100%", height: 4, borderRadius: 4, accentColor: activeCourse.color, cursor: "pointer" }}
                        />
                      </div>

                      {/* Control Row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                        {/* Prev */}
                        <button onClick={playPrev} disabled={!hasPrev} title="Previous lecture"
                          style={{ background: "none", border: "none", cursor: hasPrev ? "pointer" : "not-allowed", color: hasPrev ? "#fff" : "rgba(255,255,255,0.3)", display: "flex" }}>
                          <SkipBack size={18}/>
                        </button>

                        {/* Play/Pause */}
                        <button onClick={togglePlay}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}>
                          {isPlaying ? <Pause size={24} fill="#fff"/> : <Play size={24} fill="#fff"/>}
                        </button>

                        {/* Next */}
                        <button onClick={playNext} disabled={!hasNext} title="Next lecture"
                          style={{ background: "none", border: "none", cursor: hasNext ? "pointer" : "not-allowed", color: hasNext ? "#fff" : "rgba(255,255,255,0.3)", display: "flex" }}>
                          <SkipForward size={18}/>
                        </button>

                        {/* Volume */}
                        <button onClick={toggleMute}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}>
                          {isMuted || volume === 0 ? <VolumeX size={18}/> : <Volume2 size={18}/>}
                        </button>
                        <input
                          type="range" min={0} max={100} value={isMuted ? 0 : volume}
                          className="ras-control-volume-slider"
                          onChange={e => changeVolume(parseInt(e.target.value))}
                          style={{ width: 70, accentColor: "#fff", cursor: "pointer" }}
                        />

                        {/* Time */}
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "Inter,monospace", fontWeight: 600, flex: 1, marginLeft: 4 }}>
                          {fmtTime(currentTime)} / {fmtTime(totalDur)}
                        </span>

                        {/* Speed */}
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>SPEED</span>
                          <select
                            value={speed}
                            onChange={e => changeSpeed(parseFloat(e.target.value))}
                            onClick={e => e.stopPropagation()}
                            style={{
                              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                              color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 6,
                              padding: "3px 6px", outline: "none", cursor: "pointer"
                            }}
                          >
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                              <option key={s} value={s} style={{ background: "#1E293B" }}>{s}x</option>
                            ))}
                          </select>
                        </div>

                        {/* Zoom */}
                        <div className="ras-control-zoom-selector" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <ZoomIn size={14} color="rgba(255,255,255,0.5)"/>
                          <select
                            value={zoom}
                            onChange={e => setZoom(parseFloat(e.target.value))}
                            onClick={e => e.stopPropagation()}
                            style={{
                              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                              color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 6,
                              padding: "3px 6px", outline: "none", cursor: "pointer"
                            }}
                          >
                            {[
                              { val: 1, label: "100%" },
                              { val: 1.15, label: "115%" },
                              { val: 1.3, label: "130%" },
                              { val: 1.5, label: "150%" },
                            ].map(o => (
                              <option key={o.val} value={o.val} style={{ background: "#1E293B" }}>{o.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}>
                          {isFullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lecture Info (below player) */}
                {activeLecture && (
                  <div style={{
                    background: C.surface, borderTop: `1px solid ${C.border}`,
                    padding: "16px 20px", flexShrink: 0,
                  }}>
                    {/* Title + Nav row */}
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "Poppins" }}>
                          {`L${activeLecture.no}: ${activeLecture.title}`}
                        </h2>
                        <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.textMuted, alignItems: "center" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={11}/>
                            {totalDur > 0 ? fmtTime(totalDur) : (activeLecture.duration || "Loading...")}
                          </span>
                          <span>{activeCourse.subtitle}</span>
                        </div>
                        <p style={{ margin: "8px 0 0", fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>
                          {activeLecture.description}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={playPrev} disabled={!hasPrev}
                          style={{
                            padding: "9px 16px", borderRadius: 8, border: `1.5px solid ${hasPrev ? C.border : C.border}`,
                            background: hasPrev ? C.surfaceAlt : C.surfaceAlt,
                            color: hasPrev ? C.text : C.textMuted,
                            fontSize: 13, cursor: hasPrev ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", gap: 6, fontWeight: 700,
                            opacity: hasPrev ? 1 : 0.4,
                            transition: "all 0.15s"
                          }}
                        >
                          <ChevronLeft size={15}/> Prev
                        </button>
                        <button
                          onClick={playNext} disabled={!hasNext}
                          style={{
                            padding: "9px 16px", borderRadius: 8, border: "none",
                            background: hasNext
                              ? `linear-gradient(135deg,${activeCourse.color},${activeCourse.color}CC)`
                              : C.border,
                            color: "#fff",
                            fontSize: 13, cursor: hasNext ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", gap: 6, fontWeight: 700,
                            opacity: hasNext ? 1 : 0.4,
                            boxShadow: hasNext ? `0 4px 12px ${activeCourse.color}44` : "none",
                            transition: "all 0.15s"
                          }}
                        >
                          Next <ChevronRight size={15}/>
                        </button>
                      </div>
                    </div>

                    {/* Notes for this chapter */}
                    {(() => {
                      const chap = activeCourse.syllabus.find(ch => ch.lectures.some(l => l.id === activeLecture.id));
                      if (!chap || !chap.notes || chap.notes.length === 0) return null;
                      return (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                            📄 Chapter Notes & PDFs
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {chap.notes.map((note, ni) => (
                              <Link
                                key={ni}
                                to="/notes"
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 8,
                                  padding: "7px 14px", borderRadius: 20, textDecoration: "none",
                                  background: C.surfaceAlt, border: `1px solid ${C.border}`,
                                  fontSize: 12, color: C.text, fontWeight: 600,
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = `${activeCourse.color}18`; e.currentTarget.style.borderColor = activeCourse.color; }}
                                onMouseLeave={e => { e.currentTarget.style.background = C.surfaceAlt; e.currentTarget.style.borderColor = C.border; }}
                              >
                                <FileText size={12} color={activeCourse.color}/>
                                {note.title}
                                <span style={{ fontSize: 10, color: C.textMuted }}>• {note.pages}p</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* ─── RIGHT: Chapter & Lecture List ─── */}
              <div className="ras-chapters-sidebar" style={{
                width: 340, background: C.surface, borderLeft: `1px solid ${C.border}`,
                display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0
              }}>
                {/* Chapter list header */}
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                  <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 14, color: C.text }}>
                    Course Content
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    {activeCourse.totalLectures} lectures • {activeCourse.totalHours}
                  </div>
                </div>

                {/* Scrollable list */}
                <div className="ras-chapters-list" style={{ overflow: "auto", flex: 1 }}>
                  {activeCourse.syllabus.map((chapter, cIdx) => {
                    const isExpanded = expandedChapters.includes(cIdx);
                    return (
                      <div key={cIdx}>
                        {/* Chapter Header */}
                        <div
                          onClick={() => setExpandedChapters(prev =>
                            prev.includes(cIdx) ? prev.filter(i => i !== cIdx) : [...prev, cIdx]
                          )}
                          style={{
                            padding: "12px 18px", cursor: "pointer",
                            background: isExpanded ? C.surfaceAlt : C.surface,
                            borderBottom: `1px solid ${C.border}`,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            transition: "background 0.2s"
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>
                              Chapter {chapter.chapterNo}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "Poppins", lineHeight: 1.4 }}>
                              {chapter.chapterTitle}
                            </div>
                            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                              {chapter.lectures.length} lectures
                            </div>
                          </div>
                          <ChevronDown
                            size={14} color={C.textSec}
                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}
                          />
                        </div>

                        {/* Lectures */}
                        {isExpanded && chapter.lectures.map(lecture => {
                          const isActive = activeLecture?.id === lecture.id;
                          const prog = watchProgress[lecture.id];
                          return (
                            <div
                              key={lecture.id}
                              onClick={() => {
                                if (isActive) {
                                  togglePlay();
                                } else {
                                  goToLecture(lecture);
                                }
                              }}
                              style={{
                                padding: "10px 18px", cursor: "pointer", borderBottom: `1px solid ${C.border}`,
                                background: isActive ? `${activeCourse.color}14` : C.surface,
                                display: "flex", alignItems: "flex-start", gap: 10, transition: "background 0.15s"
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surfaceHover; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = C.surface; }}
                            >
                              {/* Play/Pause Icon or Lecture number */}
                              <div style={{
                                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                                background: isActive ? activeCourse.color : C.surfaceAlt,
                                border: `1.5px solid ${isActive ? activeCourse.color : C.border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                marginTop: 2,
                                transition: "all 0.2s"
                              }}>
                                {isActive
                                  ? (isPlaying ? <Pause size={11} fill="#fff" color="#fff"/> : <Play size={11} fill="#fff" color="#fff" style={{ marginLeft: 1 }}/>)
                                  : <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted }}>{lecture.no}</span>
                                }
                              </div>


                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: 12, fontWeight: isActive ? 700 : 600,
                                  color: isActive ? C.text : C.textSec,
                                  lineHeight: 1.4, marginBottom: 3
                                }}>
                                  {lecture.title}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 10, color: C.textMuted, display: "flex", alignItems: "center", gap: 3 }}>
                                    <Clock size={9}/> {lecture.duration}
                                  </span>
                                  {prog && (
                                    <span style={{ fontSize: 10, color: activeCourse.color, fontWeight: 700 }}>
                                      {prog.pct}%
                                    </span>
                                  )}
                                </div>
                                {/* Mini progress bar */}
                                {prog && (
                                  <div style={{ height: 2, background: C.border, borderRadius: 2, marginTop: 5 }}>
                                    <div style={{ width: `${prog.pct}%`, height: "100%", background: activeCourse.color, borderRadius: 2 }}/>
                                  </div>
                                )}
                              </div>

                              {prog?.pct === 100 && (
                                <CheckCircle2 size={14} color={C.green} style={{ flexShrink: 0, marginTop: 4 }}/>
                              )}
                            </div>
                          );
                        })}

                        {/* Notes in chapter */}
                        {isExpanded && chapter.notes.length > 0 && (
                          <div style={{ padding: "10px 18px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", marginBottom: 8, letterSpacing: ".06em" }}>
                              📄 Notes & PDFs
                            </div>
                            {chapter.notes.map((note, nIdx) => (
                              <Link
                                key={nIdx}
                                to="/notes"
                                style={{
                                  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                                  borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`,
                                  marginBottom: nIdx < chapter.notes.length - 1 ? 6 : 0, textDecoration: "none",
                                  transition: "background 0.15s"
                                }}
                              >
                                <FileText size={13} color={C.accent}/>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {note.title}
                                  </div>
                                  <div style={{ fontSize: 10, color: C.textMuted }}>{note.pages} pages</div>
                                </div>
                                <ChevronRight size={12} color={C.textMuted}/>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="range"]::-webkit-slider-thumb { cursor: pointer; }
        select option { background: #1E293B; color: #fff; }

        /* ─── Responsive Workspace Styles ─── */
        @media (max-width: 768px) {
          .ras-workspace-topbar {
            height: auto !important;
            padding: 10px 16px !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .ras-workspace-layout {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .ras-player-area {
            flex: none !important;
            width: 100% !important;
            overflow: visible !important;
            height: auto !important;
          }
          .ras-video-container {
            flex: none !important;
            aspect-ratio: 16/9 !important;
            width: 100% !important;
            height: auto !important;
          }
          .ras-chapters-sidebar {
            width: 100% !important;
            flex: none !important;
            border-left: none !important;
            border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
            height: auto !important;
            overflow: visible !important;
          }
          .ras-chapters-list {
            overflow: visible !important;
            flex: none !important;
            height: auto !important;
          }
        }

        .ras-topbar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        @media (max-width: 480px) {
          .ras-topbar-title {
            max-width: 120px;
          }
        }

        .ras-topbar-lecture {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        @media (max-width: 480px) {
          .ras-topbar-lecture {
            display: none !important;
          }
          .ras-topbar-separator {
            display: none !important;
          }
        }

        @media (max-width: 600px) {
          .ras-control-volume-slider {
            display: none !important;
          }
          .ras-control-zoom-selector {
            display: none !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
