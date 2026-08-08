import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "./AppLayout";
import {
  ArrowRight, Sparkles, Shield, Award, BookOpen, Users,
  CheckCircle, Landmark, GraduationCap
} from "lucide-react";

/* ─── PALACE COLORS ──────────────────────────────────────────────── */
function useC(dark) {
  return dark ? {
    bg: "#0C1220", bgAlt: "#111827", surface: "#1A2235",
    border: "#263247", text: "#E8F0FE", textSec: "#8EA7C5",
    gold: "#D4AF37", goldSoft: "rgba(212,175,55,0.12)",
    maroon: "#5B0A14", maroonDark: "#3A0710"
  } : {
    bg: "#FBF1E1", bgAlt: "#F5E6D3", surface: "#FFFFFF",
    border: "#EDE0C8", text: "#2C2C2A", textSec: "#5F5E5A",
    gold: "#D4AF37", goldSoft: "rgba(212,175,55,0.12)",
    maroon: "#7A1F2B", maroonDark: "#5C1A22"
  };
}

const FEATURES = [
  { icon:"📝", title:"36,000+ MCQ Questions",    desc:"Chapter-wise bilingual MCQs for UPSC, GATE, RAS, SSC, NEET and more. Full explanations with every answer.",        color:"#f97316" },
  { icon:"🔒", title:"Anti-Piracy Notes Vault",   desc:"Secure PDF viewer with watermark overlay, screenshot protection, and copy-block. Your notes stay protected.",       color:"#1B4F8A" },
  { icon:"🎬", title:"Video Lecture Portal",       desc:"Chapter-wise video lectures with speed control, bookmarks, and connected study resources.",                         color:"#2A9D8F" },
  { icon:"🤖", title:"AI Question Generator",      desc:"Generate custom practice sets for any topic instantly. AI creates relevant MCQs tailored to your study plan.",      color:"#7C3AED" },
  { icon:"📊", title:"Performance Analytics",      desc:"Track accuracy across subjects. Identify weak areas and get personalized revision recommendations.",                 color:"#059669" },
  { icon:"🌍", title:"Anthropology Optional Hub",  desc:"Complete Anthropology optional prep with curated notes, MCQs, FYQs, and structured answer writing practice.",       color:"#DC2626" },
];

const TEAM = [
  { name:"DJ Sir",          role:"Founder & Lead Educator",    emoji:"👨‍🏫", bio:"Expert UPSC Anthropology educator with 10+ years of experience. Helped 500+ students crack UPSC optional." },
  { name:"Tech Team",       role:"Platform Engineering",        emoji:"💻", bio:"Passionate developers building the most secure and feature-rich exam prep platform in India." },
  { name:"Content Team",    role:"MCQ & Notes Curation",       emoji:"📚", bio:"Subject matter experts who curate and verify every MCQ and study note to ensure exam accuracy." },
];

const STATS_ABOUT = [
  { n:"36,000+", l:"MCQ Questions",   e:"📝" },
  { n:"10+",     l:"Exam Categories", e:"🎯" },
  { n:"50+",     l:"Subjects",        e:"📖" },
  { n:"100%",    l:"Secure Notes",    e:"🔒" },
];

export default function About() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const C = useC(isDarkMode);

  return (
    <AppLayout title="About Us">
      <div style={{ minHeight: "100vh", background: C.bg, paddingTop: 60, transition: "background .3s" }}>
        
        {/* HERO */}
        <section style={{
          padding: "50px 24px 40px",
          background: isDarkMode
            ? "linear-gradient(145deg,#0C1220,#161E2E,#0C1220)"
            : "linear-gradient(145deg,#FCFBF8,#FFF3E0,#FCFBF8)",
          textAlign: "center", position: "relative", overflow: "hidden"
        }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.goldSoft, border: `1px solid ${C.gold}`,
              borderRadius: 30, padding: "6px 16px", marginBottom: 20
            }}>
              <Sparkles size={14} color={C.gold}/>
              <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: ".05em" }}>
                ABOUT THEMCQAPP
              </span>
            </div>
            
            <h1 style={{ fontFamily: "Cinzel,serif", fontWeight: 900, fontSize: "clamp(1.8rem,4.5vw,2.8rem)", color: C.text, marginBottom: 16, lineHeight: 1.15 }}>
              Rajasthan's Most{" "}
              <span style={{ color: C.gold }}>
                Comprehensive
              </span>
              <br/>AI Exam Prep Platform
            </h1>
            
            <p style={{ fontFamily: "Inter,sans-serif", fontSize: 14, color: C.textSec, lineHeight: 1.7, marginBottom: 28, maxWidth: 580, margin: "0 auto 28px" }}>
              THEMCQAPP combines dynamic artificial intelligence, robust anti-piracy notes encryption, and expert video modules to create a personalized dashboard for top-tier results.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => navigate(user ? "/dashboard" : "/login")} 
                style={{
                  padding: "12px 24px", borderRadius: 30, border: "none",
                  background: "linear-gradient(135deg,#3A0710,#5B0A14)", color: "#FFF7E8",
                  border: `1.5px solid ${C.gold}`, fontFamily: "Poppins,sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(91,10,20,0.3)"
                }}
              >
                Start Learning Free <ArrowRight size={14}/>
              </button>
            </div>
          </div>
        </section>

        {/* STATS BANNER */}
        <section style={{
          background: isDarkMode ? "#162238" : "#FFF8EC",
          borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          padding: "24px 20px"
        }}>
          <div style={{
            maxWidth: 900, margin: "0 auto", display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20, textAlign: "center"
          }}>
            {STATS_ABOUT.map(s => (
              <div key={s.n} style={{ padding: 10 }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{s.e}</div>
                <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 20, color: C.text }}>{s.n}</div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: C.textSec, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MISSION & SECURE CREDENTIALS GRAPHIC */}
        <section style={{ background: C.bg, padding: "60px 24px" }}>
          <div className="about-grid-split" style={{ maxWidth: 1100, margin: "0 auto" }}>
            
            {/* Left Info */}
            <div>
              <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
                Our Mission & Values
              </div>
              <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,3.5vw,2rem)", color: C.text, marginBottom: 18, lineHeight: 1.25 }}>
                Making Quality Exam Prep Accessible to Every Candidate
              </h2>
              <p style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: C.textSec, lineHeight: 1.7, marginBottom: 16 }}>
                THEMCQAPP was born from the vision of consolidating fragmented study materials into a single, high-fidelity secure ecosystem. We believe candidates deserve safe, authentic resources to prepare without distractions.
              </p>
              <p style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: C.textSec, lineHeight: 1.7, marginBottom: 20 }}>
                Our platform combines advanced mock test simulators, dynamic watermarked reading desks, and private mentorship playlists.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "36,000+ bilingual questions with detailed syllabus matches",
                  "Anti-screenshot secure PDF viewer with live logged watermark",
                  "AI-driven performance weakness metrics dashboard"
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.text }}>
                    <CheckCircle size={14} color={C.gold} style={{ flexShrink: 0 }}/>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Graphic: Premium Crest Shield instead of plain placeholder */}
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center"
            }}>
              <div style={{
                width: "100%", maxWidth: 380, borderRadius: 24,
                background: isDarkMode ? "linear-gradient(135deg, #1D0308 0%, #111827 100%)" : "linear-gradient(135deg, #FFFDF9 0%, #FFF3DC 100%)",
                border: `2px solid ${C.gold}`, padding: 36, textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)", position: "relative"
              }}>
                <div style={{
                  position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                  width: 40, height: 40, borderRadius: "50%", background: C.maroon,
                  border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Shield size={18} color="#D4AF37"/>
                </div>
                
                {/* Custom Crest Emblem */}
                <div style={{ marginTop: 10, marginBottom: 20, display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                  <Landmark size={48} color={C.gold}/>
                  <div style={{ height: 2, width: 60, background: C.gold, marginTop: 8 }}/>
                </div>

                <h3 style={{ fontFamily: "Cinzel,serif", fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 10px" }}>
                  THEMCQAPP ACADEMY
                </h3>
                <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6, margin: "0 0 20px" }}>
                  Governed under strict anti-piracy parameters. 100% dynamic encryption ensures student reference keys remain unique and authentic.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: C.goldSoft, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 8px" }}>
                    <span style={{ display: "block", fontSize: 10, color: C.gold, fontWeight: 700 }}>VERIFIED</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>UPSC / RPSC</span>
                  </div>
                  <div style={{ background: C.goldSoft, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 8px" }}>
                    <span style={{ display: "block", fontSize: 10, color: C.gold, fontWeight: 700 }}>TRUST SCORE</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>100% SAFE</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FEATURES GRID */}
        <section style={{ background: C.bgAlt, padding: "60px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                Platform Ecosystem
              </div>
              <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,3.5vw,2rem)", color: C.text }}>
                Everything You Need to Crack Your Exam
              </h2>
            </div>
            
            <div className="about-grid-3">
              {FEATURES.map(f => (
                <div key={f.title} className="ab-card" style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: 24, transition: "transform .2s"
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: isDarkMode ? `${f.color}22` : `${f.color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, marginBottom: 14
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section style={{ background: C.bg, padding: "60px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                The Mentors
              </div>
              <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,3.5vw,2rem)", color: C.text }}>
                People Behind THEMCQAPP
              </h2>
            </div>
            
            <div className="about-grid-3">
              {TEAM.map(t => (
                <div key={t.name} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: 24, textAlign: "center"
                }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>{t.emoji}</div>
                  <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 12 }}>{t.role}</div>
                  <p style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
      
      <style>{`
        .about-grid-3 {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
        }
        @media(min-width: 640px) {
          .about-grid-3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media(min-width: 1024px) {
          .about-grid-3 { grid-template-columns: repeat(3, 1fr); }
        }

        .about-grid-split {
          display: grid;
          gap: 40px;
          grid-template-columns: 1fr;
          align-items: center;
        }
        @media(min-width: 768px) {
          .about-grid-split { grid-template-columns: 1fr 1fr; }
        }

        .ab-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
      `}</style>
    </AppLayout>
  );
}
