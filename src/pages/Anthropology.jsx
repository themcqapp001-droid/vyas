import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AppLayout from "./AppLayout";
import {
  Home, BookOpen, Brain, Trophy, Settings as SettingsIcon, LogOut, Sun, Moon, LogIn,
  FileText, Shield, Sparkles, ChevronRight, Compass, Users, CheckCircle, GraduationCap, Award
} from "lucide-react";

function getColors(isDarkMode) {
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
    textPrimary: "#EAF1FB",
    textSecondary: "#8CA0C2",
    textMuted: "#5B6E8C",
    line: "rgba(242,234,217,0.12)",
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
    textPrimary: "#2C2C2A",
    textSecondary: "#5F5E5A",
    textMuted: "#8A7A6C",
    line: "rgba(122,31,43,0.06)",
  };
}

export default function Anthropology() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const COLORS = getColors(isDarkMode);
  const navigate = useNavigate();
  const isGuest = !user;

  // Floating particles simulation state
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const list = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.15 + 0.05
    }));
    setParticles(list);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <AppLayout title="Anthro Optional">
      <div style={{ minHeight: "100vh", position: "relative" }}>
        
        {/* Particle Canvas Effect Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
          {particles.map((p, idx) => (
            <div
              key={idx}
              className="absolute bg-sky-400 rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`
              }}
            />
          ))}
        </div>

        {/* Course Presentation Content */}
        <div className="flex-1 overflow-y-auto z-10">
          
          {/* Hero Section */}
          <section className="relative px-6 py-20 md:py-32 border-b" style={{ borderColor: COLORS.border }}>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: COLORS.blueSoft, color: COLORS.blue }}>
                <Sparkles size={12} /> UPSC Civil Services Optional
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif", lineHeight: "1.1" }}>
                Anthropology Optional <br />
                <span style={{ color: COLORS.gold }}>With DJ Sir</span>
              </h1>
              <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: COLORS.textSecondary }}>
                Master UPSC Anthropology Optional through structured syllabus coverage, physical anthropology illustrations, and comprehensive Paper I & II core timelines.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-black transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 cursor-pointer"
                  style={{ background: COLORS.blue }}
                >
                  Join Course Portal <ChevronRight size={16} />
                </button>
                <Link
                  to="/notes"
                  className="px-6 py-3 rounded-2xl text-sm font-bold transition-all border hover:bg-slate-800/10 flex items-center gap-1.5"
                  style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                >
                  Browse Free Notes <FileText size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Core Specimen / Highlight Statistics */}
          <section className="border-b" style={{ borderColor: COLORS.border, background: COLORS.surfaceAlt }}>
            <div className="max-w-6xl mx-auto grid grid-columns-1 grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: COLORS.border }}>
              <div className="p-8 text-center">
                <span className="block text-3xl font-extrabold" style={{ color: COLORS.blue }}>320+</span>
                <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-2">Target Marks</span>
              </div>
              <div className="p-8 text-center">
                <span className="block text-3xl font-extrabold" style={{ color: COLORS.gold }}>Paper I & II</span>
                <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-2">Full Syllabus</span>
              </div>
              <div className="p-8 text-center">
                <span className="block text-3xl font-extrabold" style={{ color: COLORS.blue }}>12+ Mocks</span>
                <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-2">Test Series</span>
              </div>
              <div className="p-8 text-center">
                <span className="block text-3xl font-extrabold" style={{ color: COLORS.gold }}>1:1 sessions</span>
                <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-2">DJ Sir Mentorship</span>
              </div>
            </div>
          </section>

          {/* Timeline / Core Evolution Strata */}
          <section className="px-6 py-20 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Course Evolution Timeline
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: COLORS.textSecondary }}>
                Our syllabus is taught chronologically like geological layers, building biological foundations before social theories.
              </p>
            </div>

            <div className="relative border-l-2 ml-4 md:ml-8 space-y-12" style={{ borderColor: COLORS.border }}>
              <div className="relative pl-8">
                <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 bg-[#08101F]" style={{ borderColor: COLORS.blue }}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Phase 01 — Depth: 1.1m</span>
                <h3 className="text-lg font-bold mt-1" style={{ color: COLORS.textPrimary }}>Foundations of Physical Anthropology</h3>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  Primates study, human evolutionary models, hominoid fossil structures (Australopithecus, Neanderthalensis), and evolutionary genetic theories.
                </p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 bg-[#08101F]" style={{ borderColor: COLORS.gold }}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Phase 02 — Depth: 2.5m</span>
                <h3 className="text-lg font-bold mt-1" style={{ color: COLORS.textPrimary }}>Archaeological & Cultural Strata</h3>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  Prehistoric cultures: Palaeolithic, Mesolithic, Neolithic, Chalcolithic, Bronze age developments, and relative/absolute geological dating systems.
                </p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 bg-[#08101F]" style={{ borderColor: COLORS.blue }}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Phase 03 — Depth: 4.8m</span>
                <h3 className="text-lg font-bold mt-1" style={{ color: COLORS.textPrimary }}>Socio-Cultural Theories</h3>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  Anthropological thought: Evolutionism (Morgan, Tylor), Historical Particularism (Boas), Functionalism (Malinowski), Structuralism (Levi-Strauss).
                </p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 bg-[#08101F]" style={{ borderColor: COLORS.gold }}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Phase 04 — Depth: 6.2m</span>
                <h3 className="text-lg font-bold mt-1" style={{ color: COLORS.textPrimary }}>Indian Social & Tribal Complex</h3>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  Paper II topics: Varna, Caste system, Joint family, Tribal distributions, problems of tribal integration, administrative policies, and tribal struggles.
                </p>
              </div>
            </div>
          </section>

          {/* Paper Curriculum Cards */}
          <section className="px-6 py-20 border-t" style={{ borderColor: COLORS.border, background: COLORS.surface }}>
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Syllabus Split & Core Units
                </h2>
                <p className="text-sm max-w-lg mx-auto" style={{ color: COLORS.textSecondary }}>
                  Structured chapters aligning directly with the UPSC mains Optional syllabus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Paper I */}
                <div className="p-6 rounded-3xl border space-y-6" style={{ background: COLORS.surfaceAlt, borderColor: COLORS.border }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Section A</span>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Paper I: Biological & Thought Foundations</h3>
                  <ul className="space-y-3 text-xs" style={{ color: COLORS.textSecondary }}>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-sky-500 shrink-0 mt-0.5" />
                      <span>Unit 1.1 - 1.3: Meaning, Scope, Branches, Relationships with sciences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-sky-500 shrink-0 mt-0.5" />
                      <span>Unit 1.4 - 1.7: Hominoid Evolution, Biological genetics and heredity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-sky-500 shrink-0 mt-0.5" />
                      <span>Unit 2 - 5: Social Marriage, Family, Kinship systems, Religion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-sky-500 shrink-0 mt-0.5" />
                      <span>Unit 6: Anthropological thought, core structural/functional models</span>
                    </li>
                  </ul>
                </div>

                {/* Paper II */}
                <div className="p-6 rounded-3xl border space-y-6" style={{ background: COLORS.surfaceAlt, borderColor: COLORS.border }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Section B</span>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Paper II: Indian Social & Tribal Complex</h3>
                  <ul className="space-y-3 text-xs" style={{ color: COLORS.textSecondary }}>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>Unit 1.1 - 1.3: Pleistocene archaeology, Soan culture, Chalcolithic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>Unit 2 - 3: Indian Civilization, Purusharthas, Varnashrama, Caste System</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>Unit 4 - 5: Fieldwork tradition in India, Tribal geographical distributions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>Unit 6 - 9: Tribal problems, land alienation, forest policies, Fifth Schedule</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Mentorship Registration CTA */}
          <section className="px-6 py-20 max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Ready to Master Anthropology?
            </h2>
            <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: COLORS.textSecondary }}>
              Register for direct access to DJ Sir's sectional mocks, complete Paper I-II notes, and dynamic video lecture recordings.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 mt-4 rounded-2xl text-sm font-bold text-black transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{ background: COLORS.blue }}
            >
              Sign Up For Course Access
            </button>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}
