import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { useTheme } from "../context/ThemeContext";

/* ═══════════════════════════════════════════════════════════
   RAS ACADEMY – full palace-themed landing page
   Maroon #5B0A14 / Gold #D4AF37 / Cream #FFF7E8
═══════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@400;600;700;800&display=swap');

  .ras-root {
    --gold:#D4AF37;
    --gold-dark:#B8912A;
    --maroon:#7A1F2B;
    --maroon-dark:#5C1A22;
    --cream:#F5E6D3;
    --bg:#FBF1E1;
    --ink:#2C2C2A;
    --surface:#ffffff;
    --border:rgba(212,175,55,.3);
    --card-shadow:0 4px 20px rgba(0,0,0,0.03);
    --hero-grad:radial-gradient(ellipse at top, rgba(255,247,232,.5), #FBF1E1 60%);
  }

  .dark .ras-root {
    --bg:#0C1220;
    --ink:#E8F0FE;
    --surface:#111827;
    --border:#263247;
    --card-shadow:0 8px 30px rgba(0,0,0,0.25);
    --hero-grad:radial-gradient(ellipse at top, rgba(91,10,20,0.25), #0C1220 60%);
  }

  .ras-root *, .ras-root *::before, .ras-root *::after { box-sizing:border-box; }
  .ras-root { background:var(--bg); color:var(--ink); font-family:'Poppins',sans-serif; overflow-x:hidden; transition: background 0.3s, color 0.3s; }
  .ras-root h1,.ras-root h2,.ras-root h3,.ras-root h4 { font-family:'Cinzel',serif; }

  /* ── announcement ── */
  .ras-ann { background:var(--maroon); color:var(--cream); font-size:13px; padding:10px 16px; border-bottom:1px solid rgba(212,175,55,.3); }
  .ras-ann-inner { max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center; }
  .ras-badge { background:var(--gold);color:var(--maroon-dark);font-weight:700;font-size:10px;padding:2px 8px;border-radius:4px;text-transform:uppercase;margin-right:8px; }

  /* ── hero ── */
  .ras-hero { position:relative;padding:64px 20px 96px; background:var(--hero-grad); border-bottom:1px solid var(--border);overflow:hidden; }
  .ras-hero-grid { display:grid;grid-template-columns:1fr;gap:48px;align-items:center;max-width:1280px;margin:0 auto; }
  @media(min-width:1024px){.ras-hero-grid{grid-template-columns:1.4fr 1fr;}}
  .ras-eyebrow { display:inline-flex;align-items:center;gap:8px;background:var(--cream);border:1px solid rgba(212,175,55,.3);padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600;color:var(--maroon-dark);box-shadow:0 1px 4px rgba(0,0,0,.04); }
  .ras-h1 { font-size:clamp(2.1rem,5vw,3.4rem);font-weight:700;color:var(--gold);line-height:1.12;margin:20px 0; }
  .dark .ras-h1 { color:var(--cream); }
  .ras-sub { font-family:'Cinzel',serif;font-size:1.15rem;font-weight:600;color:var(--gold-dark);letter-spacing:.02em;margin-bottom:16px; }
  .ras-desc { font-size:15px;color:var(--ink);opacity:0.8;max-width:640px;line-height:1.7; }
  .ras-ctas { display:flex;flex-wrap:wrap;gap:14px;margin-top:26px; }
  .ras-cta-solid { padding:14px 26px;border-radius:12px;font-weight:600;font-size:14px;background:linear-gradient(135deg,var(--maroon-dark),var(--maroon));color:var(--cream);border:1px solid rgba(212,175,55,.4);box-shadow:0 8px 20px rgba(91,10,20,.15);cursor:pointer; }
  .ras-cta-outline { padding:14px 26px;border-radius:12px;font-weight:600;font-size:14px;background:var(--surface);color:var(--gold);border:1.5px solid var(--border);cursor:pointer; }
  .ras-cta-soft { padding:14px 26px;border-radius:12px;font-weight:700;font-size:14px;background:rgba(255,247,232,.6);color:var(--maroon-dark);border:1px solid rgba(212,175,55,.2);cursor:pointer; }

  /* ── emblem ── */
  .ras-emblem-wrap { display:flex;justify-content:center; }
  .ras-emblem { position:relative;width:320px;height:320px;border-radius:40px;padding:4px;background:linear-gradient(135deg,var(--maroon-dark),var(--maroon),var(--gold-dark));border:2px solid rgba(212,175,55,.4);box-shadow:0 30px 60px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center; }
  .ras-emblem-inner { text-align:center;color:var(--cream);display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px; }
  .ras-emblem-badge { height:110px;width:110px;border-radius:20px;background:var(--bg);display:flex;align-items:center;justify-content:center;border:2px solid var(--gold);box-shadow:0 10px 20px rgba(0,0,0,.2); }
  .ras-emblem-badge span { font-family:'Cinzel',serif;font-weight:800;font-size:2.2rem;color:var(--maroon); }
  .ras-emblem-title { font-family:'Cinzel',serif;font-size:1.6rem;font-weight:700;letter-spacing:.1em; }
  .ras-emblem-tag { font-size:10px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase;font-weight:700; }
  .ras-est-pill { background:rgba(58,7,16,.7);color:var(--gold);border:1px solid rgba(212,175,55,.3);font-size:10px;letter-spacing:.15em;text-transform:uppercase;padding:6px 14px;border-radius:999px;font-weight:600; }

  /* ── stats ── */
  .ras-stats { margin-top:64px;border:1.5px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:var(--card-shadow);display:grid;grid-template-columns:repeat(2,1fr);overflow:hidden; }
  @media(min-width:768px){.ras-stats{grid-template-columns:repeat(3,1fr);}}
  @media(min-width:1024px){.ras-stats{grid-template-columns:repeat(6,1fr);}}
  .ras-stat { padding:22px 12px;text-align:center;border-right:1.5px solid var(--border);border-bottom:1.5px solid var(--border); }
  .ras-stat-num { font-family:'Inter',sans-serif;font-weight:800;font-size:1.6rem;color:var(--gold);display:block; }
  .dark .ras-stat-num { color:var(--cream); }
  .ras-stat-lbl { font-size:11px;font-weight:600;color:var(--ink);opacity:0.6;text-transform:uppercase;letter-spacing:.05em;margin-top:4px;display:block; }

  /* ── sections ── */
  .ras-section { padding:80px 20px; }
  .ras-container { max-width:1280px;margin:0 auto; }
  .ras-section-title { text-align:center;max-width:640px;margin:0 auto 48px; }
  .ras-section-title h2 { font-size:clamp(1.5rem,3vw,2.1rem);color:var(--maroon);font-weight:700; }
  .dark .ras-section-title h2 { color:var(--cream); }
  .ras-section-title p { font-size:14px;color:var(--ink);opacity:0.7;margin-top:10px; }
  .ras-gold-line { width:64px;height:3px;background:var(--gold);margin:16px auto 0;border-radius:2px; }

  /* ── grid ── */
  .ras-grid { display:grid;gap:24px;grid-template-columns:1fr; }
  @media(min-width:640px){.ras-grid-2{grid-template-columns:1fr 1fr;}}
  @media(min-width:1024px){.ras-grid-3{grid-template-columns:1fr 1fr 1fr;}}

  /* ── card ── */
  .ras-card { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--card-shadow);transition:.25s; }
  .ras-card:hover { border-color:var(--gold);box-shadow:0 12px 28px rgba(0,0,0,.08);transform:translateY(-4px); }
  .ras-icon-box { height:44px;width:44px;border-radius:12px;background:var(--cream);color:var(--maroon);border:1px solid rgba(212,175,55,.2);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px;transition:.25s; }
  .ras-card:hover .ras-icon-box { background:var(--maroon);color:var(--cream); }
  .ras-card h3 { font-size:16px;font-weight:700;color:var(--maroon);margin:0 0 8px; }
  .dark .ras-card h3 { color:var(--cream); }
  .ras-card p { font-size:13px;color:var(--ink);opacity:0.75;line-height:1.6;margin:0; }

  /* ── dark ai section ── */
  .ras-dark { background:var(--maroon-dark);color:#fff; }
  .ras-dark .ras-section-title h2 { color:var(--cream); }
  .ras-dark .ras-section-title p { color:rgba(255,247,232,.6); }
  .ras-ai-card { background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:22px;transition:.25s; }
  .ras-ai-card:hover { background:rgba(255,255,255,.1);border-color:rgba(212,175,55,.4); }
  .ras-ai-card h3 { color:var(--cream);font-size:15px;font-weight:700;margin:14px 0 8px;font-family:'Poppins',sans-serif; }
  .ras-ai-card p { color:rgba(255,247,232,.7);font-size:13px;line-height:1.6; }
  .ras-ai-icon { height:38px;width:38px;border-radius:10px;background:rgba(212,175,55,.1);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:18px; }

  /* ── courses ── */
  .ras-course-card { background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow);transition:.25s;display:flex;flex-direction:column;justify-content:space-between; }
  .ras-course-card:hover { box-shadow:0 14px 30px rgba(0,0,0,.08); }
  .ras-course-banner { height:150px;background:linear-gradient(135deg,var(--maroon),var(--maroon-dark));padding:20px;display:flex;flex-direction:column;justify-content:space-between; }
  .ras-course-tag { background:var(--gold);color:var(--maroon-dark);font-size:10px;font-weight:800;text-transform:uppercase;padding:4px 10px;border-radius:6px; }
  .ras-course-banner h3 { color:var(--cream);font-size:19px;margin:0;font-weight:700; }
  .ras-course-body { padding:20px; }
  .ras-lbl { font-size:11px;font-weight:700;color:var(--gold-dark);text-transform:uppercase;letter-spacing:.05em; }
  .ras-course-body ul { list-style:none;padding:0;margin:10px 0 0;font-size:13px;color:var(--ink);opacity:0.85; }
  .ras-course-body ul li { display:flex;gap:8px;margin-bottom:8px;line-height:1.4; }
  .ras-course-body ul li::before { content:"✓";color:var(--gold);font-weight:700;flex-shrink:0; }
  .ras-course-footer { padding:18px 20px;border-top:1.5px solid var(--border);background:var(--surface);display:flex;justify-content:space-between;align-items:center; }
  .ras-price-lbl { font-size:10px;color:var(--ink);opacity:0.5;font-weight:700;text-transform:uppercase;display:block; }
  .ras-price { font-size:19px;font-weight:800;color:var(--gold); }
  .dark .ras-price { color:var(--cream); }
  .ras-enroll-btn { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon));color:var(--cream);font-size:12px;font-weight:700;padding:10px 16px;border-radius:12px;border:1px solid rgba(212,175,55,.3);cursor:pointer; }

  /* ── test series split ── */
  .ras-split { background:var(--surface);border:1px solid var(--border);border-radius:20px;box-shadow:var(--card-shadow);display:grid;grid-template-columns:1fr;overflow:hidden; }
  @media(min-width:1024px){.ras-split{grid-template-columns:1.4fr 1fr;}}
  .ras-split-left { padding:40px; }
  .ras-feature-grid { display:grid;grid-template-columns:1fr;gap:10px;margin-top:16px; }
  @media(min-width:640px){.ras-feature-grid{grid-template-columns:1fr 1fr;}}
  .ras-feature-pill { display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--ink);opacity:0.9; }
  .ras-feature-pill::before { content:"✓";color:var(--gold-dark);font-weight:800; }
  .ras-split-right { background:var(--maroon);color:#fff;padding:40px;display:flex;flex-direction:column;justify-content:center;gap:16px; }
  .ras-mini-prog { background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:16px; }
  .ras-bar-bg { background:rgba(255,255,255,.1);height:8px;border-radius:99px;overflow:hidden;margin:8px 0; }
  .ras-bar-fill { background:var(--gold);height:100%;width:78%; }

  /* ── video ── */
  .ras-video-card { background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:14px;box-shadow:var(--card-shadow);transition:.2s; }
  .ras-video-card:hover { border-color:rgba(212,175,55,.4); }
  .ras-video-thumb { aspect-ratio:16/9;background:rgba(58,7,16,.05);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:10px; }
  .ras-play { height:44px;width:44px;border-radius:50%;background:linear-gradient(135deg,var(--maroon-dark),var(--maroon));display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:16px;box-shadow:0 4px 10px rgba(0,0,0,.15); }
  .ras-video-card h4 { font-size:13px;font-weight:700;color:var(--maroon);margin:0; }
  .dark .ras-video-card h4 { color:var(--cream); }
  .ras-video-sub { font-size:10px;color:var(--ink);opacity:0.5;font-weight:700;text-transform:uppercase;margin-top:2px; }

  /* ── video grid responsive ── */
  .ras-video-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:16px; }
  @media(min-width:640px){.ras-video-grid{grid-template-columns:repeat(3,1fr);}}
  @media(min-width:1024px){.ras-video-grid{grid-template-columns:repeat(6,1fr);}}

  /* ── current affairs tabs ── */
  .ras-tabs-bar { display:flex;flex-wrap:wrap;justify-content:center;gap:4px;background:var(--surface);border:1.5px solid var(--border);padding:6px;border-radius:12px;max-width:fit-content;margin:0 auto 32px;box-shadow:var(--card-shadow); }
  .ras-tab-btn { padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;text-transform:capitalize;background:transparent;color:var(--ink);opacity:0.75;border:none;cursor:pointer;font-family:'Poppins',sans-serif; }
  .ras-tab-btn.active { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon));color:var(--cream);opacity:1;box-shadow:0 2px 6px rgba(0,0,0,.1); }
  .ras-ca-card { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px;box-shadow:var(--card-shadow);display:flex;flex-direction:column;justify-content:space-between; }
  .ras-ca-meta { display:flex;justify-content:space-between;font-size:11px;color:var(--gold-dark);font-weight:700;text-transform:uppercase; }
  .ras-ca-card h4 { font-size:15px;color:var(--maroon);margin:12px 0 8px;line-height:1.4;font-weight:700;font-family:'Poppins',sans-serif; }
  .dark .ras-ca-card h4 { color:var(--cream); }
  .ras-ca-card p { font-size:12px;color:var(--ink);opacity:0.8;line-height:1.6; }
  .ras-ca-actions { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;padding-top:14px;border-top:1.5px solid var(--border); }
  .ras-ca-actions button { font-size:11px;font-weight:700;padding:10px;border-radius:10px;cursor:pointer;font-family:'Poppins',sans-serif;border:none; }
  .ras-ca-btn-a { background:var(--bg);color:var(--gold-dark);border:1.5px solid var(--border) !important; }
  .ras-ca-btn-b { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon));color:var(--cream);border:1px solid rgba(212,175,55,.2) !important; }

  /* ── notes ── */
  .ras-notes-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:14px; }
  @media(min-width:768px){.ras-notes-grid{grid-template-columns:repeat(4,1fr);}}

  /* ── guruji ── */
  .ras-guruji-panel { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon),#000);border:1px solid rgba(212,175,55,.3);border-radius:24px;box-shadow:0 30px 60px rgba(0,0,0,.2);overflow:hidden;display:grid;grid-template-columns:1fr; }
  @media(min-width:1024px){.ras-guruji-panel{grid-template-columns:1.4fr 1fr;}}
  .ras-guruji-left { padding:44px;color:#fff; }
  .ras-guruji-left h2 { font-size:clamp(1.6rem,3vw,2.2rem);color:var(--cream);margin:16px 0; }
  .ras-guruji-feats { display:grid;grid-template-columns:1fr;gap:10px;margin:20px 0; }
  @media(min-width:640px){.ras-guruji-feats{grid-template-columns:1fr 1fr;}}
  .ras-feat-pill { display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 12px;font-size:12px;font-weight:600;color:var(--cream); }
  .ras-guruji-right { background:linear-gradient(135deg,var(--maroon),var(--maroon-dark),#000);padding:36px;color:#fff;border-left:1px solid rgba(212,175,55,.2); }
  .ras-chat-user { background:rgba(255,255,255,.1);border-radius:12px;padding:12px;font-size:12px;max-width:85%;margin-left:auto;color:var(--cream); }
  .ras-chat-ai { background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);border-radius:12px;padding:12px;font-size:12px;max-width:90%;color:var(--gold);margin-top:10px; }
  .ras-chat-ai p { color:rgba(255,247,232,.9);font-size:11px;margin:6px 0 0; }
  .ras-chat-input-row { display:flex;gap:10px;margin-top:20px; }
  .ras-chat-input { flex:1;padding:10px 14px;border-radius:10px;border:1px solid rgba(212,175,55,.3);background:rgba(255,255,255,.08);color:#fff;font-size:12px;font-family:'Poppins',sans-serif;outline:none; }
  .ras-chat-input::placeholder { color:rgba(255,255,255,.4); }
  .ras-chat-send { background:var(--gold);color:var(--maroon-dark);border:none;border-radius:10px;padding:10px 16px;font-weight:700;font-size:12px;cursor:pointer; }

  /* ── testimonials ── */
  .ras-testimonial-card { max-width:720px;margin:0 auto;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:40px;box-shadow:var(--card-shadow); }
  .ras-testimonial-inner { display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center; }
  @media(min-width:640px){.ras-testimonial-inner{flex-direction:row;text-align:left;}}
  .ras-avatar { height:80px;width:80px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px;flex-shrink:0;border:2px solid var(--gold); }
  .ras-stars { color:var(--gold-dark);font-size:14px; }
  .ras-review { font-size:15px;color:var(--ink);opacity:0.9;font-style:italic;line-height:1.6;margin:8px 0; }
  .ras-testimonial-name { font-size:15px;color:var(--maroon);margin:0;font-family:'Cinzel',serif; }
  .dark .ras-testimonial-name { color:var(--cream); }
  .ras-rank { font-size:11px;font-weight:700;color:var(--gold-dark);text-transform:uppercase;letter-spacing:.05em; }
  .ras-dots { display:flex;justify-content:center;gap:8px;margin-top:28px; }
  .ras-dot { height:10px;width:10px;border-radius:50%;background:rgba(212,175,55,.4);transition:.25s;border:none;cursor:pointer; }
  .ras-dot.active { background:var(--maroon);width:26px;border-radius:6px; }

  /* ── download ── */
  .ras-dl-section { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon));color:#fff;border-top:1px solid rgba(212,175,55,.3);padding:80px 20px; }
  .ras-dl-grid { display:grid;grid-template-columns:1fr;gap:36px;align-items:center;max-width:1280px;margin:0 auto; }
  @media(min-width:768px){.ras-dl-grid{grid-template-columns:1.4fr 1fr;}}
  .ras-app-btn { background:#000;color:#fff;padding:12px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;align-items:flex-start;gap:2px;cursor:pointer; }
  .ras-app-btn small { font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.05em; }
  .ras-app-btn strong { font-size:14px; }
  .ras-qr-card { background:var(--surface);border:1px solid var(--border);padding:20px;border-radius:16px;box-shadow:var(--card-shadow);display:flex;gap:20px;align-items:center;max-width:360px;color:var(--ink); }
  .ras-qr-box { height:100px;width:100px;background:var(--cream);border-radius:12px;border:1px solid rgba(212,175,55,.2);flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background-image:radial-gradient(#181818 1.5px,transparent 1.5px);background-size:6px 6px; }
  .ras-qr-mark { position:absolute;inset:22px;background:var(--maroon);border-radius:6px;border:1px solid rgba(212,175,55,.4);display:flex;align-items:center;justify-content:center;color:var(--gold);font-family:'Cinzel',serif;font-size:10px;font-weight:800; }

  /* ── contact ── */
  .ras-contact-grid { display:grid;grid-template-columns:1fr;gap:36px;max-width:1280px;margin:0 auto; }
  @media(min-width:768px){.ras-contact-grid{grid-template-columns:1fr 1.2fr;}}
  .ras-contact-row { display:flex;gap:14px;font-size:14px;font-weight:500;color:var(--ink);opacity:0.9;margin-bottom:14px;align-items:flex-start; }
  .ras-contact-icon { height:36px;width:36px;border-radius:10px;background:var(--surface);border:1.5px solid var(--border);color:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px; }
  .ras-map-box { background:var(--surface);border:1.5px solid var(--border);border-radius:20px;padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px; }
  .ras-map-btn { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon));color:var(--cream);padding:12px 22px;border-radius:12px;font-size:12px;font-weight:700;border:1px solid rgba(212,175,55,.3);text-decoration:none; }

  /* ── footer ── */
  .ras-footer { background:var(--maroon-dark);color:rgba(255,255,255,.7);padding:64px 20px 32px;border-top:1px solid rgba(212,175,55,.2); }
  .ras-footer-grid { display:grid;grid-template-columns:1fr;gap:36px;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:44px;max-width:1280px;margin:0 auto; }
  @media(min-width:768px){.ras-footer-grid{grid-template-columns:2fr 1fr 1fr 1fr;}}
  .ras-footer-grid h5 { font-family:'Poppins',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--gold);margin-bottom:14px; }
  .ras-footer-grid ul { list-style:none;padding:0;margin:0;font-size:12px; }
  .ras-footer-grid ul li { margin-bottom:10px; }
  .ras-footer-grid ul li a { color:inherit;text-decoration:none; }
  .ras-footer-grid ul li a:hover { color:#fff; }
  .ras-footer-bottom { max-width:1280px;margin:24px auto 0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:12px;color:rgba(255,255,255,.4); }
  .ras-footer-bottom a { color:inherit;text-decoration:none; }
  .ras-footer-bottom a:hover { color:#fff; }

  /* ── dashboard analytics ── */
  .ras-dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 32px; }
  @media(min-width: 768px) { .ras-dashboard-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  @media(min-width: 1024px) { .ras-dashboard-grid { grid-template-columns: repeat(4, 1fr) !important; } }
  .ras-dash-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 20px; padding: 24px; box-shadow: var(--card-shadow); display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-height: 300px; }
  .ras-dash-card h3 { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--gold-dark); margin: 0 0 16px; font-family: 'Poppins', sans-serif; }
  .ras-prog-row { margin-bottom: 14px; }
  .ras-prog-row:last-child { margin-bottom: 0; }
  .ras-prog-lbl { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
  .ras-prog-bar { background: rgba(91,10,20,0.05); height: 6px; border-radius: 99px; overflow: hidden; }
  .ras-prog-fill { height: 100%; border-radius: 99px; }
  .ras-rec-box { background: rgba(255,247,232,0.4); border: 1px solid rgba(212,175,55,0.25); border-radius: 14px; padding: 16px; margin-bottom: 18px; }


  /* ── fade-up anim ── */
  .ras-fade { opacity:0;transform:translateY(16px);transition:opacity .6s ease, transform .6s ease; }
  .ras-fade.in { opacity:1;transform:translateY(0); }

  /* ── Official PDF viewer block ── */
  .ras-pdf-block { max-width:920px; margin:0 auto; background:var(--surface); border:1.5px solid var(--border); border-radius:18px; box-shadow:var(--card-shadow); overflow:hidden; }
  .ras-pdf-toolbar { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; padding:14px 18px; background:var(--cream); border-bottom:1px solid var(--border); }
  .ras-lang-toggle { display:flex; gap:4px; background:var(--surface); border:1px solid var(--border); padding:4px; border-radius:10px; }
  .ras-lang-btn { padding:7px 16px; border-radius:7px; font-size:12px; font-weight:700; color:var(--ink); opacity:0.6; background:transparent; border:none; cursor:pointer; }
  .ras-lang-btn.active { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon)); color:var(--cream); opacity:1; box-shadow:0 2px 6px rgba(0,0,0,.12); }
  .ras-pdf-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .ras-pdf-btn { font-size:12px; font-weight:700; padding:9px 14px; border-radius:10px; background:var(--surface); color:var(--maroon-dark); border:1px solid var(--border); text-decoration:none; display:inline-block; }
  .dark .ras-pdf-btn { color: var(--cream); }
  .ras-pdf-btn:hover { background:var(--cream); }
  .ras-pdf-btn-primary { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon)); color:var(--cream) !important; border-color:transparent; }
  .ras-pdf-frame-wrap { width:100%; height:80vh; min-height:500px; max-height:850px; background:#3a3a3a; }
  .ras-pdf-frame-wrap iframe { width:100%; height:100%; border:none; display:block; }
  .ras-pdf-fallback { font-size:11px; color:var(--ink); opacity:0.6; text-align:center; padding:10px 16px; background:var(--bg); border-top:1px solid var(--border); }
`;


// ─── TESTIMONIALS DATA ───────────────────────────────────────────────────────
const TESTIMONIALS = [
  { avatar:"DS", stars:"★★★★★", review:'"The AI Answer Evaluation was a game-changer for my Paper III prep. It gave objective feedback in seconds, which I refined further with faculty advice."', name:"Devendra Sharma", rank:"RAS Rank 12" },
  { avatar:"PB", stars:"★★★★★", review:'"AI Guruji felt like having a personal mentor at 2 AM. When standard books grew vague on Rajasthan\'s tribal movements, Guruji cleared it completely."', name:"Priyanka Bishnoi", rank:"RAS Rank 45" },
];

// ─── CURRENT AFFAIRS DATA ───────────────────────────────────────────────────
const CA_DATA = {
  daily: [
    { date:"Jul 06, 2026", tag:"Daily", h:"Strategic Clean Energy Infrastructure Mandates Introduced across Western Districts", p:"Analyzing socio-economic implications of solar land-grant allotments across Jodhpur and Jaisalmer for RAS Mains GS Paper II." },
    { date:"Jul 05, 2026", tag:"Daily", h:"Rajasthan Industrial Policy Overhaul: MSME Capital Allocation Vectors", p:"New trade policy introduces stamp-duty relief and decentralized funding for manufacturing in second-tier cities." },
    { date:"Jul 04, 2026", tag:"Daily", h:"Panchayati Raj Jurisdiction Rules Updated for Peri-Urban Buffer Zones", p:"State framework resolves conflicts between Zila Parishad and municipal boards via divisional coordination panels." },
  ],
  weekly: [
    { date:"Jul W1 2026", tag:"Weekly", h:"Weekly Rajasthan Economic Ledger & Market Vector Analysis", p:"Summary of Jaipur bullion fluctuations, central subsidy disbursements, and state cooperative credit flows." },
    { date:"Jul W1 2026", tag:"Weekly", h:"RPSC Gazette Weekly Digest: Policy Updates", p:"Compendium of administrative orders, recruitment notifications, and examination schedule updates for the current week." },
  ],
  monthly: [
    { date:"Jun 2026", tag:"Monthly", h:"Monthly RPSC Core Digest: Administrative Policy", p:"Compendium of all gazette notifications, municipal board coordination, and rural employment reports." },
    { date:"Jun 2026", tag:"Monthly", h:"Rajasthan Budget Analysis: Infrastructure & Social Sector", p:"Deep analysis of state budget allocations, scheme-wise expenditure patterns relevant to GS Economics Paper III." },
  ],
  special: [
    { date:"Exclusive", tag:"Rajasthan Special", h:"Marwar Architecture & Medieval Land Reforms", p:"Exclusive historical blueprint mapping medieval Mewar and Marwar land revenue systems for Paper I History section." },
    { date:"Exclusive", tag:"Rajasthan Special", h:"Tribal Governance in Rajasthan: Constitutional Framework", p:"Comprehensive mapping of 5th Schedule provisions, PESA Act, and state-level tribal welfare policies for GS Paper II." },
  ],
};

// ─── STAT COUNTER HOOK ─────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s = null;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) s = requestAnimationFrame(tick);
    };
    s = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s);
  }, [target, duration, start]);
  return val;
}

// ─── ANIMATED STAT CELL ─────────────────────────────────────────────────────
function StatCell({ target, label, suffix = "", noBorder = false }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const val = useCountUp(target, 1800, started);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const display = target >= 1000
    ? val >= 1000000 ? (val / 1000000).toFixed(1) + "M+"
    : val >= 1000 ? (val / 1000).toFixed(0) + "K+"
    : val + suffix
    : val + suffix;

  return (
    <div className="ras-stat" ref={ref} style={{ borderRight: noBorder ? "none" : undefined }}>
      <span className="ras-stat-num">{display}</span>
      <span className="ras-stat-lbl">{label}</span>
    </div>
  );
}

// ─── FADE UP HOC ─────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div className="ras-fade" ref={ref} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RasAcademy() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [caTab, setCaTab] = useState("daily");
  const [tIdx, setTIdx] = useState(0);
  const t = TESTIMONIALS[tIdx];
  const [chatQ, setChatQ] = useState("");
  const [chatA, setChatA] = useState("Akbar's Dahsala model minimized collection friction. Across Mewar, local adaptations balanced central oversight with native chieftains, yielding a hybrid revenue mandate unique to Rajasthan's topography.");
  const [chatLoading, setChatLoading] = useState(false);

  const [prelimsLang, setPrelimsLang] = useState("en");
  const [mainsLang, setMainsLang] = useState("en");

  const handleAsk = (e) => {
    e.preventDefault();
    if (!chatQ.trim()) return;
    setChatLoading(true);
    setTimeout(() => {
      const q = chatQ.toLowerCase();
      if (q.includes("mains") || q.includes("paper")) setChatA("RAS Mains GS Paper I–IV demands structured answers with RPSC rubric adherence. Daily writing practice and previous-year answer analysis are the two pillars of top-rank preparation.");
      else if (q.includes("history") || q.includes("mewar") || q.includes("marwar")) setChatA("Marwar and Mewar were twin pillars of medieval Rajputana administration. Revenue structures under chieftains evolved distinctly from the Mughal Dahsala model introduced in 1580 CE.");
      else if (q.includes("geography") || q.includes("rajasthan")) setChatA("Rajasthan is India's largest state by area. Geographically divided into Thar Desert, Aravalli Range, Eastern Plains, and Hadoti Plateau — each zone has distinct syllabus implications for GS Paper I.");
      else setChatA("That is a high-priority academic area for RPSC preparation. AI Guruji recommends cross-referencing RPSC official syllabus documents and NCERT core texts for this topic.");
      setChatLoading(false);
    }, 700);
  };

  const handleCoreCardClick = (title) => {
    if (title === "Prelims Syllabus") {
      const el = document.getElementById("prelims-syllabus");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (title === "Mains Syllabus") {
      const el = document.getElementById("mains-syllabus");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (title === "AI MCQ Tests") {
      navigate("/ai-generator");
    } else if (title === "Current Affairs") {
      const el = document.getElementById("current-affairs");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (title === "Video Lectures") {
      const el = document.getElementById("videos");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (title === "AI Guruji") {
      const el = document.getElementById("ai-guruji");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };


  return (
    <AppLayout title="RAS Academy">
      <div className="ras-root">
        <style>{CSS}</style>

        {/* ANNOUNCEMENT BAR */}
        <div className="ras-ann">
          <div className="ras-ann-inner">
            <div><span className="ras-badge">New</span>🎯 Admissions Open • RAS Foundation Batch • AI MCQ Platform • Free Demo Class Available</div>
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              <a href="#register" style={{ textDecoration:"underline", fontWeight:600 }}>Register Now</a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" style={{ background:"rgba(255,255,255,.1)", padding:"4px 10px", borderRadius:6, fontSize:11 }}>Join Telegram</a>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className="ras-hero" id="home">
          <div className="ras-hero-grid">
            <div>
              <span className="ras-eyebrow">✨ Next-Generation Adaptive Ecosystem</span>
              <h1 className="ras-h1">
                Rajasthan's First{" "}
                <span style={{ background:"linear-gradient(135deg,#D4AF37,#A67C00)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  AI-Powered
                </span>
                {" "}RAS Preparation Platform
              </h1>
              <p className="ras-sub">"One App. Unlimited Opportunities."</p>
              <p className="ras-desc">Prepare smarter with AI-generated MCQs, real-time Mains answer evaluation, structured video lectures, direct mentorship, daily current affairs, and complete RAS preparation — all in one platform.</p>
              <div className="ras-ctas">
                <button className="ras-cta-solid" onClick={() => navigate("/ai-generator")}>Start Free Test</button>
                <button className="ras-cta-outline" onClick={() => navigate("/courses")}>Explore Courses</button>
                <button className="ras-cta-soft" onClick={() => navigate("/ai-generator")}>🧠 AI Guruji</button>
              </div>
            </div>

            <div className="ras-emblem-wrap">
              <div className="ras-emblem">
                <div className="ras-emblem-inner">
                  <div className="ras-emblem-badge"><span>RA</span></div>
                  <div>
                    <div className="ras-emblem-title">RAS ACADEMY</div>
                    <div className="ras-emblem-tag">ThemcqApp Digital Portal</div>
                  </div>
                  <span className="ras-est-pill">Est. 2026 • Premium Civil Tech</span>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{ maxWidth:1280, margin:"0 auto" }}>
            <div className="ras-stats">
              <StatCell target={50000}   label="Active Students" />
              <StatCell target={1000000} label="AI Generated Qs" />
              <StatCell target={500}     label="Video Lectures" />
              <StatCell target={25}      label="Subjects Covered" />
              <StatCell target={24}      label="×7 AI Guruji" />
              <StatCell target={98}      label="% Satisfaction" noBorder />
            </div>
          </div>
        </section>

        {/* CANDIDATE PERFORMANCE & WEAK AREAS WIDGETS */}
        {/* CANDIDATE PERFORMANCE & WEAK AREAS WIDGETS */}
        <section className="ras-section" style={{ background: isDarkMode ? "#1A1015" : "#FCFBF8", borderBottom: `1px solid ${isDarkMode ? "rgba(212,175,55,.25)" : "rgba(212,175,55,.1)"}` }}>
          <div className="ras-container">
            <FadeUp>
              <div className="ras-section-title">
                <span style={{ color:"#D4AF37", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>RPSC Candidate Metrics</span>
                <h2 style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>AI Performance Indicators</h2>
                <div className="ras-gold-line"></div>
              </div>
            </FadeUp>

            <FadeUp>
              <div className="ras-dashboard-grid">
                
                {/* 1. CURRENT STATUS */}
                <div className="ras-dash-card">
                  <h3>Current Status</h3>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexGrow:1, justifyContent:"center" }}>
                    <div style={{
                      width: 130, height: 130, borderRadius: "50%",
                      background: isDarkMode ? "conic-gradient(#9A2F3D 0% 65%, rgba(212,175,55,0.08) 65% 100%)" : "conic-gradient(#5B0A14 0% 65%, rgba(91,10,20,0.08) 65% 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", marginBottom: 16,
                      boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
                    }}>
                      <div style={{
                        width: 106, height: 106, borderRadius: "50%",
                        background: isDarkMode ? "#1F1417" : "#fff", display: "flex", flexDirection: "column",
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

                {/* 2. WEAK AREAS */}
                <div className="ras-dash-card">
                  <h3 style={{ color: "#E0455B" }}>📉 Weak Areas</h3>
                  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
                    {[
                      { label: "Economy", val: 54 },
                      { label: "Environment", val: 61 },
                      { label: "Science & Tech", val: 58 },
                    ].map(item => (
                      <div key={item.label} className="ras-prog-row">
                        <div className="ras-prog-lbl">
                          <span style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>{item.label}</span>
                          <span style={{ color: isDarkMode ? "#E8B923" : "inherit" }}>{item.val}%</span>
                        </div>
                        <div className="ras-prog-bar" style={{ background: isDarkMode ? "rgba(232,185,35,0.06)" : "rgba(91,10,20,0.05)" }}>
                          <div className="ras-prog-fill" style={{ width: `${item.val}%`, background: "#E0455B" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. STRONG AREAS */}
                <div className="ras-dash-card">
                  <h3 style={{ color: "#0FA36B" }}>📈 Strong Areas</h3>
                  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
                    {[
                      { label: "History", val: 91 },
                      { label: "Polity", val: 88 },
                      { label: "Geography", val: 85 },
                    ].map(item => (
                      <div key={item.label} className="ras-prog-row">
                        <div className="ras-prog-lbl">
                          <span style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>{item.label}</span>
                          <span style={{ color: isDarkMode ? "#E8B923" : "inherit" }}>{item.val}%</span>
                        </div>
                        <div className="ras-prog-bar" style={{ background: isDarkMode ? "rgba(232,185,35,0.06)" : "rgba(91,10,20,0.05)" }}>
                          <div className="ras-prog-fill" style={{ width: `${item.val}%`, background: "#0FA36B" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. AI RECOMMENDATION */}
                <div className="ras-dash-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <h3>✨ AI Recommendation</h3>
                  <div className="ras-rec-box" style={{ background: isDarkMode ? "rgba(232,185,35,0.08)" : "rgba(255,247,232,0.4)" }}>
                    <p style={{ margin:0, fontSize:12, color: isDarkMode ? "#F5E9D9" : "#3A0710", lineHeight:1.6, fontWeight:500 }}>
                      Indian Economy shows the highest frequency of wrong answers. Practice Indian Banking System to improve your score.
                    </p>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color: isDarkMode ? "#F5E9D9" : "#3A0710" }}>Indian Banking System</div>
                        <div style={{ fontSize:10, color: isDarkMode ? "#E8B923" : "#A67C00", fontWeight:700, textTransform:"uppercase", marginTop:2 }}>Medium Level</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/ai-generator")}
                      style={{
                        width: "100%", padding: "10px", borderRadius: 10,
                        background: isDarkMode ? "linear-gradient(135deg,#9A2F3D,#2B0F14)" : "linear-gradient(135deg,#3A0710,#5B0A14)",
                        color: "#FFF7E8", border: "1px solid rgba(212,175,55,0.3)",
                        fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 12,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      Practice →
                    </button>
                  </div>
                </div>

              </div>
            </FadeUp>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="ras-section">
          <div className="ras-container">
            <FadeUp><div className="ras-section-title"><h2>Immediate Strategic Core</h2><p>Instant portal gateways mapped to the crucial components of the RPSC examination loop.</p></div></FadeUp>
            <div className={`ras-grid ras-grid-3`} style={{ gridTemplateColumns:"1fr" }}>
              {[
                ["📘","Prelims Syllabus","Complete updated RPSC syllabus breakdown with weightage analysis."],
                ["🗂️","Mains Syllabus","Detailed GS Paper I–IV roadmap with analytical breakdown."],
                ["🧠","AI MCQ Tests","Practice dynamic, unlimited AI-generated high-yield questions."],
                ["📰","Current Affairs","Rajasthan & national daily updates refined for RAS standards."],
                ["🎥","Video Lectures","Premium HD structured content by top subject specialists."],
                ["🤖","AI Guruji","Your 24/7 dedicated personal AI tutor for instant doubt clearing."],
              ].map(([icon, title, desc], i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="ras-card" style={{ cursor: "pointer" }} onClick={() => handleCoreCardClick(title)}>
                    <div className="ras-icon-box">{icon}</div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
            <style>{`@media(min-width:640px){.ras-grid-2c{grid-template-columns:1fr 1fr}.ras-grid-3c{grid-template-columns:1fr 1fr 1fr}}`}</style>
          </div>
        </section>

        {/* PRELIMS SYLLABUS */}
        <section className="ras-section" id="prelims-syllabus" style={{ background: "rgba(255,247,232,0.25)", borderTop: "1px solid rgba(212,175,55,0.15)" }}>
          <div className="ras-container">
            <FadeUp>
              <div className="ras-section-title">
                <span style={{ color: "var(--gold-dark)", fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" }}>Official RPSC Notification • 09-01-2026</span>
                <h2>RAS Prelims Syllabus</h2>
                <div className="ras-gold-line"></div>
                <p>The exact official PDF released by RPSC, Ajmer — read inline, switch language, or download.</p>
              </div>
            </FadeUp>
            <FadeUp>
              <div className="ras-pdf-block">
                <div className="ras-pdf-toolbar">
                  <div className="ras-lang-toggle">
                    <button className={`ras-lang-btn${prelimsLang === "en" ? " active" : ""}`} onClick={() => setPrelimsLang("en")}>English</button>
                    <button className={`ras-lang-btn${prelimsLang === "hi" ? " active" : ""}`} onClick={() => setPrelimsLang("hi")}>हिंदी</button>
                  </div>
                  <div className="ras-pdf-actions">
                    <a className="ras-pdf-btn" href={`/syllabus/prelims-${prelimsLang}.pdf`} target="_blank" rel="noopener noreferrer">↗ Open in New Tab</a>
                    <a className="ras-pdf-btn ras-pdf-btn-primary" href={`/syllabus/prelims-${prelimsLang}.pdf`} download={`prelims-${prelimsLang}.pdf`}>Download PDF</a>
                  </div>
                </div>
                <div className="ras-pdf-frame-wrap">
                  <iframe src={`/syllabus/prelims-${prelimsLang}.pdf`} title="RAS Prelims Syllabus — Official PDF"></iframe>
                </div>
                <div className="ras-pdf-fallback">Can't see the PDF? Some mobile browsers block embedded PDFs — use "Open in New Tab" or "Download PDF" above instead.</div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* MAINS SYLLABUS */}
        <section className="ras-section" id="mains-syllabus" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
          <div className="ras-container">
            <FadeUp>
              <div className="ras-section-title">
                <span style={{ color: "var(--gold-dark)", fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" }}>Official RPSC Notification • 09-01-2026</span>
                <h2>RAS Mains Syllabus</h2>
                <div className="ras-gold-line"></div>
                <p>The exact official PDF released by RPSC, Ajmer — read inline, switch language, or download.</p>
              </div>
            </FadeUp>
            <FadeUp>
              <div className="ras-pdf-block">
                <div className="ras-pdf-toolbar">
                  <div className="ras-lang-toggle">
                    <button className={`ras-lang-btn${mainsLang === "en" ? " active" : ""}`} onClick={() => setMainsLang("en")}>English</button>
                    <button className={`ras-lang-btn${mainsLang === "hi" ? " active" : ""}`} onClick={() => setMainsLang("hi")}>हिंदी</button>
                  </div>
                  <div className="ras-pdf-actions">
                    <a className="ras-pdf-btn" href={`/syllabus/mains-${mainsLang}.pdf`} target="_blank" rel="noopener noreferrer">↗ Open in New Tab</a>
                    <a className="ras-pdf-btn ras-pdf-btn-primary" href={`/syllabus/mains-${mainsLang}.pdf`} download={`mains-${mainsLang}.pdf`}>Download PDF</a>
                  </div>
                </div>
                <div className="ras-pdf-frame-wrap">
                  <iframe src={`/syllabus/mains-${mainsLang}.pdf`} title="RAS Mains Syllabus — Official PDF"></iframe>
                </div>
                <div className="ras-pdf-fallback">Can't see the PDF? Some mobile browsers block embedded PDFs — use "Open in New Tab" or "Download PDF" above instead.</div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* AI FEATURES */}
        <section className="ras-section ras-dark" id="ai-tools">
          <div className="ras-container">
            <FadeUp>
              <div className="ras-section-title">
                <span style={{ color:"#D4AF37", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>Engineered Intelligence</span>
                <h2>Learn with Artificial Intelligence</h2>
                <div className="ras-gold-line"></div>
              </div>
            </FadeUp>
            <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:24 }}>
              {[
                ["🧠","AI Guruji","Real-time concept breakdown, multilingual voice support, and instant doubt clearing."],
                ["📝","AI Answer Evaluator","Submit handwritten Mains answers and get instant feedback against marking rubrics."],
                ["⚙️","AI MCQ Generator","Instantly build customized mock tests from any topic or previous year paper."],
                ["📄","AI Notes Generator","Convert sprawling reference material into high-yield, structured summaries."],
                ["🎤","AI Interview Coach","Simulate administrative board panels with adaptive, localized queries."],
                ["📅","AI Revision Planner","Algorithmic scheduling calibrated entirely to your accuracy history."],
              ].map(([icon, title, desc], i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="ras-ai-card">
                    <div className="ras-ai-icon">{icon}</div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
            <style>{`@media(min-width:640px){#ai-tools .ras-container>div:last-child{grid-template-columns:1fr 1fr}}@media(min-width:1024px){#ai-tools .ras-container>div:last-child{grid-template-columns:1fr 1fr 1fr}}`}</style>
          </div>
        </section>

        {/* COURSES */}
        <section className="ras-section" id="courses">
          <div className="ras-container">
            <FadeUp><div className="ras-section-title"><h2>Structured Curriculums</h2><p>Comprehensive classroom and digital programs built around standard RPSC guidelines.</p></div></FadeUp>
            <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:24 }}>
              {[
                { tag:"12 Months", title:"Foundation Course", items:["Integrated Prelims + Mains","Daily Answer Evaluation","Comprehensive Study Material"], price:"₹45,000" },
                { tag:"4 Months",  title:"Prelims Intensive",  items:["Targeted RPSC Pattern","10,000+ AI Practice Engine","Subject-wise Crash Modules"], price:"₹15,000" },
                { tag:"6 Months",  title:"Mains Answer Writing",items:["Dual Evaluator Matrix","Paper IV Dedicated Focus","Live Strategy Sessions"], price:"₹22,500" },
              ].map((c, i) => (
                <FadeUp key={i} delay={i * 80}>
                  <div className="ras-course-card">
                    <div className="ras-course-banner">
                      <div style={{ display:"flex", justifyContent:"space-between" }}><span className="ras-course-tag">{c.tag}</span><span>🛡️</span></div>
                      <h3>{c.title}</h3>
                    </div>
                    <div className="ras-course-body">
                      <span className="ras-lbl">Core Deliverables</span>
                      <ul>{c.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                    </div>
                    <div className="ras-course-footer">
                      <div><span className="ras-price-lbl">Tuition Fees</span><span className="ras-price">{c.price}</span></div>
                      <button className="ras-enroll-btn" onClick={() => navigate("/courses")}>Enroll Program</button>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
            <style>{`@media(min-width:1024px){#courses .ras-container>div:last-child{grid-template-columns:1fr 1fr 1fr}}`}</style>
          </div>
        </section>

        {/* TEST SERIES */}
        <section className="ras-section" id="test-series" style={{ background: isDarkMode ? "rgba(25,16,21,0.6)" : "rgba(255,247,232,.3)", borderTop: `1px solid ${isDarkMode ? "rgba(212,175,55,.25)" : "rgba(212,175,55,.15)"}`, borderBottom: `1px solid ${isDarkMode ? "rgba(212,175,55,.25)" : "rgba(212,175,55,.15)"}` }}>
          <div className="ras-container">
            <FadeUp>
              <div className="ras-split">
                <div className="ras-split-left">
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, background: isDarkMode ? "#9A2F3D" : "#5B0A14", color:"#D4AF37", padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:700 }}>🏆 Infinite Practice Loop</span>
                  <h2 style={{ fontSize:"1.7rem", color: isDarkMode ? "#E8B923" : "#3A0710", margin:"16px 0" }}>AI Unlimited Test Series</h2>
                  <p style={{ fontSize:14, color: isDarkMode ? "rgba(245,233,217,.8)" : "rgba(24,24,24,.7)", lineHeight:1.7 }}>Break out of static test booklets. Our adaptive engine constructs unique, highly targeted testing modules mapped to your individual blind spots.</p>
                  <div className="ras-feature-grid">
                    {["Unlimited Dynamic Tests","PYQ-Calibrated Matrix","Topic-Specific Practice","Full-Length Simulations","Adaptive AI Difficulty","Instant State-Wide Rankings"].map((f, i) => (
                      <span key={i} className="ras-feature-pill" style={{ background: isDarkMode ? "#1F1417" : "#FFF7E8", color: isDarkMode ? "#F5E9D9" : "#5B0A14", border: `1.5px solid ${isDarkMode ? "rgba(212,175,55,.3)" : "rgba(212,175,55,.12)"}` }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:14, marginTop:24, flexWrap:"wrap" }}>
                    <button className="ras-cta-solid" onClick={() => navigate("/ai-generator")}>Start Assessment Test</button>
                    <button className="ras-cta-outline" onClick={() => navigate("/history")}>View Analysis</button>
                  </div>
                </div>
                <div className="ras-split-right" style={{ background: isDarkMode ? "#1F1417" : "linear-gradient(135deg,#3A0710 0%,#5B0A14 100%)" }}>
                  <h4 style={{ color:"#D4AF37", fontSize:14, margin:0 }}>Simulated Live Feedback</h4>
                  <div className="ras-mini-prog">
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,247,232,.6)" }}><span>Topic: Modern History of Rajasthan</span><span>Adaptive Focus</span></div>
                    <div className="ras-bar-bg" style={{ background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.2)" }}><div className="ras-bar-fill"></div></div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                      <span style={{ color:"#D4AF37", fontWeight:700 }}>Accuracy: 78%</span>
                      <span style={{ background:"rgba(16,185,129,.2)", color:"#34d399", padding:"2px 8px", borderRadius:6 }}>Optimal</span>
                    </div>
                  </div>
                  <div className="ras-mini-prog" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ height:32, width:32, background:"rgba(212,175,55,.1)", color:"#D4AF37", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12 }}>#12</div>
                      <div>
                        <p style={{ margin:0, fontSize:12, fontWeight:700, color:"#FFF7E8" }}>State-Wide Rank</p>
                        <p style={{ margin:0, fontSize:10, color:"rgba(255,247,232,.4)" }}>Out of 14,240 candidates</p>
                      </div>
                    </div>
                    <span>📈</span>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* VIDEOS */}
        <section className="ras-section" id="videos">
          <div className="ras-container">
            <FadeUp><div className="ras-section-title"><h2>Subject Media Vault</h2><p>Expertly curated HD video classrooms broken down cleanly by structural modules.</p></div></FadeUp>
            <div className="ras-video-grid">
              {[["History","48 Lectures"],["Geography","36 Lectures"],["Economy","42 Lectures"],["Polity","50 Lectures"],["Rajasthan GK","85 Lectures"],["Current Affairs","Continuous"]].map(([title, sub], i) => (
                <FadeUp key={i} delay={i * 50}>
                  <div className="ras-video-card" style={{ cursor:"pointer" }} onClick={() => navigate("/courses")}>
                    <div className="ras-video-thumb"><div className="ras-play">▶</div></div>
                    <h4>{title}</h4>
                    <div className="ras-video-sub">{sub}</div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* CURRENT AFFAIRS */}
        <section className="ras-section" id="current-affairs" style={{ background:"rgba(255,247,232,.2)" }}>
          <div className="ras-container">
            <FadeUp><div className="ras-section-title"><h2>Dynamic Current Affairs</h2><p>Daily intelligence feeds parsed directly into actionable educational content.</p></div></FadeUp>
            <div className="ras-tabs-bar">
              {["daily","weekly","monthly","special"].map(tab => (
                <button key={tab} className={`ras-tab-btn${caTab === tab ? " active" : ""}`} onClick={() => setCaTab(tab)}>
                  {tab === "special" ? "Rajasthan Special" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:24 }}>
              {CA_DATA[caTab].map((item, i) => (
                <div key={i} className="ras-ca-card">
                  <div className="ras-ca-meta"><span>{item.date}</span><span>{item.tag}</span></div>
                  <h4>{item.h}</h4>
                  <p>{item.p}</p>
                  <div className="ras-ca-actions">
                    <button className="ras-ca-btn-a" onClick={() => navigate("/notes")}>📄 PDF Notes</button>
                    <button className="ras-ca-btn-b" onClick={() => navigate("/ai-generator")}>✅ Launch Quiz</button>
                  </div>
                </div>
              ))}
            </div>
            <style>{`@media(min-width:1024px){#current-affairs .ras-container>div:last-child{grid-template-columns:1fr 1fr 1fr}}`}</style>
          </div>
        </section>

        {/* NOTES LIBRARY */}
        <section className="ras-section" id="notes">
          <div className="ras-container">
            <FadeUp><div className="ras-section-title"><h2>Central Knowledge Vault</h2><p>Instantly look up clean revision blueprints, handwritten archives, and analytical frameworks.</p></div></FadeUp>
            <FadeUp>
              <div style={{ maxWidth:640, margin:"0 auto 40px", background:"#fff", border:"1px solid rgba(212,175,55,.2)", borderRadius:16, padding:14, boxShadow:"0 4px 14px rgba(0,0,0,.05)", display:"flex", gap:10, flexWrap:"wrap" }}>
                <input type="text" placeholder="Search notes (e.g., Marwar Architecture)..." style={{ flex:1, minWidth:180, background:"#FCFBF8", border:"1px solid rgba(212,175,55,.1)", padding:"12px 16px", borderRadius:12, fontFamily:"inherit", fontSize:13 }} />
                <button onClick={() => navigate("/notes")} style={{ background:"linear-gradient(135deg,#3A0710,#5B0A14)", color:"#FFF7E8", border:"1px solid rgba(212,175,55,.4)", padding:"12px 20px", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer" }}>Search</button>
              </div>
            </FadeUp>
            <div className="ras-notes-grid">
              {[["📝","Handwritten Notes","140 Files"],["📋","Short Revision Briefs","85 Files"],["🗺️","Mind Maps","110 Maps"],["📊","Infographics","65 Assets"]].map(([icon, title, count], i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="ras-card" style={{ textAlign:"center", cursor:"pointer" }} onClick={() => navigate("/notes")}>
                    <div className="ras-icon-box" style={{ margin:"0 auto 10px" }}>{icon}</div>
                    <h3 style={{ fontSize:13 }}>{title}</h3>
                    <p>{count}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* AI GURUJI */}
        <section className="ras-section" id="ai-guruji">
          <div className="ras-container">
            <FadeUp>
              <div className="ras-guruji-panel">
                <div className="ras-guruji-left">
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#D4AF37", color:"#3A0710", padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:800, textTransform:"uppercase" }}>✨ Immediate Response Agent</span>
                  <h2>Your 24/7 Personal Academic Ally: AI Guruji</h2>
                  <p style={{ fontSize:14, color:"rgba(255,247,232,.75)", lineHeight:1.7, maxWidth:520 }}>Stuck on historical detail or complex economic mandates late at night? AI Guruji eliminates academic blockers instantly through natural conversation.</p>
                  <div className="ras-guruji-feats">
                    {["💬 Concept Unpacking","🎤 Multilingual Voice","📄 Bullet Summaries","🌐 Answer Translation","✅ Historical PYQ Analysis","📅 Custom Timelines"].map((f, i) => (
                      <span key={i} className="ras-feat-pill">{f}</span>
                    ))}
                  </div>
                  <button className="ras-cta-solid" style={{ border:"1px solid #D4AF37" }} onClick={() => navigate("/ai-generator")}>🧠 Chat with AI Guruji</button>
                </div>
                <div className="ras-guruji-right">
                  <span style={{ fontSize:11, color:"#D4AF37", textTransform:"uppercase", letterSpacing:".2em", fontWeight:700 }}>Interactive Console</span>
                  <div className="ras-chat-user" style={{ marginTop:14 }}>
                    {chatQ ? `"${chatQ}"` : '"Explain Akbar\'s revenue land systems across medieval Mewar."'}
                  </div>
                  <div className="ras-chat-ai">
                    <strong>AI Guruji:</strong>
                    {chatLoading ? <p>⏳ Processing...</p> : <p>{chatA}</p>}
                  </div>
                  <form className="ras-chat-input-row" onSubmit={handleAsk}>
                    <input className="ras-chat-input" placeholder="Ask anything RAS-related..." value={chatQ} onChange={e => setChatQ(e.target.value)} />
                    <button type="submit" className="ras-chat-send">Ask</button>
                  </form>
                  <div style={{ textAlign:"right", fontSize:10, color:"rgba(255,247,232,.3)", marginTop:12 }}>Latency: ~240ms • Secure Protocol Verified</div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="ras-section">
          <div className="ras-container">
            <FadeUp><div className="ras-section-title"><h2>Honoured Success Stories</h2><p>Real candidates who achieved high RPSC rankings using our platform.</p></div></FadeUp>
            <FadeUp>
              <div className="ras-testimonial-card">
                <div className="ras-testimonial-inner">
                  <div className="ras-avatar">{t.avatar}</div>
                  <div>
                    <div className="ras-stars">{t.stars}</div>
                    <p className="ras-review">{t.review}</p>
                    <h4 className="ras-testimonial-name">{t.name}</h4>
                    <span className="ras-rank">{t.rank}</span>
                  </div>
                </div>
              </div>
            </FadeUp>
            <div className="ras-dots">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className={`ras-dot${tIdx === i ? " active" : ""}`} onClick={() => setTIdx(i)} />
              ))}
            </div>
          </div>
        </section>

        {/* DOWNLOAD */}
        <section className="ras-dl-section" id="download">
          <div className="ras-dl-grid">
            <div>
              <h2 style={{ color:"#FFF7E8", fontSize:"clamp(1.5rem,3vw,2rem)", margin:"0 0 16px" }}>Carry Your Complete Academy Everywhere</h2>
              <p style={{ fontSize:14, color:"rgba(255,247,232,.7)", maxWidth:560, margin:"0 0 24px", lineHeight:1.7 }}>Get seamless offline access to critical features, test modules, AI loops, and instant evaluation matrices from your phone.</p>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                <div className="ras-app-btn"><small>Get it on</small><strong>Google Play</strong></div>
                <div className="ras-app-btn" style={{ opacity:.5 }}><small>Coming soon to</small><strong>App Store</strong></div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div className="ras-qr-card">
                <div className="ras-qr-box"><div className="ras-qr-mark">RA</div></div>
                <div>
                  <h4 style={{ margin:"0 0 6px", fontSize:14, color:"#3A0710" }}>Instant Sync Matrix</h4>
                  <p style={{ margin:0, fontSize:12, color:"rgba(24,24,24,.6)" }}>Scan the QR code with your phone camera to download instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ABOUT & MENTORSHIP SECTION */}
        <section className="ras-section" id="about" style={{ background: isDarkMode ? "rgba(25,16,21,0.4)" : "rgba(255,247,232,0.15)", borderTop: `1px solid ${isDarkMode ? "rgba(212,175,55,.25)" : "rgba(212,175,55,.1)"}` }}>
          <div className="ras-container">
            <FadeUp>
              <div className="ras-section-title">
                <span style={{ color:"#D4AF37", fontSize:11, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase" }}>Academic Mentorship</span>
                <h2 style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>About the Academy</h2>
                <div className="ras-gold-line"></div>
              </div>
            </FadeUp>

            <div className="ras-contact-grid" style={{ display:"grid", gridTemplateColumns:"1fr", gap:40, alignItems:"center", marginBottom:40 }}>
              <FadeUp>
                <div>
                  <h3 style={{ fontFamily:"Cinzel,serif", color: isDarkMode ? "#E8B923" : "#3A0710", fontSize:22, margin:"0 0 16px" }}>Our Vision & Guidance</h3>
                  <p style={{ fontSize:14, color: isDarkMode ? "rgba(245,233,217,.8)" : "rgba(24,24,24,.75)", lineHeight:1.75, marginBottom:20 }}>
                    THEMCQAPP RAS Academy was established with one mission: to make premium state civil services preparation accessible, structured, and completely secure for every candidate in Rajasthan.
                  </p>
                  <p style={{ fontSize:14, color: isDarkMode ? "rgba(245,233,217,.8)" : "rgba(24,24,24,.75)", lineHeight:1.75, marginBottom:20 }}>
                    Led by <strong>DJ Sir</strong> and a panel of expert subject specialists, we combine standard classroom rigor with advanced AI-powered testing engines, daily current affairs, and secure revision notes.
                  </p>
                </div>
              </FadeUp>

              <FadeUp>
                <div style={{ background: isDarkMode ? "#1F1417" : "#fff", border: isDarkMode ? "1px solid rgba(212,175,55,0.35)" : "1px solid rgba(212,175,55,0.2)", borderRadius:24, padding:32, boxShadow: isDarkMode ? "0 8px 30px rgba(0,0,0,0.3)" : "0 8px 30px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18 }}>
                    <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#3A0710,#5B0A14)", border:"2px solid #D4AF37", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>👨‍🏫</div>
                    <div>
                      <h4 style={{ margin:0, fontSize:16, fontWeight:700, color: isDarkMode ? "#F5E9D9" : "#3A0710", fontFamily:"Poppins,sans-serif" }}>DJ Sir</h4>
                      <span style={{ fontSize:11, color: isDarkMode ? "#E8B923" : "#A67C00", fontWeight:700, textTransform:"uppercase" }}>Lead Mentor & Founder</span>
                    </div>
                  </div>
                  <p style={{ margin:0, fontSize:13, color: isDarkMode ? "rgba(245,233,217,.75)" : "rgba(24,24,24,.65)", lineHeight:1.7, fontStyle:"italic" }}>
                    "Our goal is not just to provide static books, but to give every aspirant a dynamic learning ecosystem that understands their weaknesses and helps them revise systematically."
                  </p>
                </div>
              </FadeUp>
            </div>

            <style>{`@media(min-width:768px){#about .ras-contact-grid{grid-template-columns:1.2fr 1fr}}`}</style>
          </div>
        </section>

        {/* CONTACT */}
        <section className="ras-section" id="contact">
          <div className="ras-contact-grid">
            <div>
              <span style={{ fontSize:11, fontWeight:700, color: isDarkMode ? "#E8B923" : "#A67C00", textTransform:"uppercase", letterSpacing:".2em" }}>Corporate HQ</span>
              <h2 style={{ color: isDarkMode ? "#E8B923" : "#3A0710", margin:"6px 0 2px" }}>RAS ACADEMY</h2>
              <p style={{ fontSize:11, color: isDarkMode ? "rgba(245,233,217,.6)" : "rgba(24,24,24,.4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:700, margin:"0 0 20px" }}>An initiative of THEMCQAPP</p>
              <div className="ras-contact-row"><div className="ras-contact-icon">📍</div><span style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>Near Cambridge Court, Madhyam Marg, Mansarovar, Jaipur</span></div>
              <div className="ras-contact-row"><div className="ras-contact-icon">✉️</div><span style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>rasacademy001@gmail.com</span></div>
              <div className="ras-contact-row"><div className="ras-contact-icon">📞</div><span style={{ color: isDarkMode ? "#F5E9D9" : "inherit" }}>+91 96022 29472</span></div>
            </div>
            <div className="ras-map-box">
              <div className="ras-contact-icon" style={{ height:56, width:56, fontSize:24 }}>🗺️</div>
              <h4 style={{ margin:0, color: isDarkMode ? "#E8B923" : "#3A0710" }}>Geographic Mapping Terminal</h4>
              <p style={{ margin:0, fontSize:12, color: isDarkMode ? "rgba(245,233,217,.7)" : "rgba(24,24,24,.6)", maxWidth:280 }}>Mansarovar Hub • Jaipur, Rajasthan, India</p>
              <a className="ras-map-btn" href="https://maps.google.com/?q=Mansarovar+Jaipur+Rajasthan" target="_blank" rel="noopener noreferrer">Get Directions →</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ras-footer">
          <div className="ras-footer-grid">
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ height:38, width:38, borderRadius:10, background:"linear-gradient(135deg,#3A0710,#5B0A14)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(212,175,55,.4)", color:"#D4AF37", fontWeight:700, fontSize:15 }}>RA</div>
                <span style={{ fontWeight:800, color:"#fff", letterSpacing:".05em" }}>RAS ACADEMY</span>
              </div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", maxWidth:280, lineHeight:1.6 }}>Fusing centuries-old administrative rigor with high-performance AI infrastructure to prepare Rajasthan's next generation of civil servants.</p>
            </div>
            <div>
              <h5>Programs</h5>
              <ul>
                <li><a href="#courses">Foundation Course</a></li>
                <li><a href="#courses">Prelims Intensive</a></li>
                <li><a href="#courses">Mains Writing</a></li>
                <li><a href="#courses">Paper IV Mastery</a></li>
              </ul>
            </div>
            <div>
              <h5>AI Frameworks</h5>
              <ul>
                <li><a href="#ai-guruji">AI Guruji Core</a></li>
                <li><a href="#test-series">Adaptive Test Loop</a></li>
                <li><a href="#notes">Revision Engine</a></li>
                <li><a href="#ai-tools">Answer Evaluator</a></li>
              </ul>
            </div>
            <div>
              <h5>Student Assets</h5>
              <ul>
                <li><a href="#notes">Knowledge Archive</a></li>
                <li><a href="#current-affairs">Daily Feeds</a></li>
                <li><a href="#videos">Media Vault</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="ras-footer-bottom">
            <p>© 2026 THEMCQAPP. All Rights Reserved.</p>
            <div style={{ display:"flex", gap:20 }}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Regulatory Compliance</a>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
