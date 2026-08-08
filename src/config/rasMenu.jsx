/**
 * rasMenu.js — Sidebar/menu config for the RAS (RPSC) section.
 * Deliberately a DIFFERENT item list from IAS — Rajasthan-specific entries live here.
 */
import React from "react";
import {
  Home, Brain, Sparkles, FileText, Video, MapPin,
  History, Settings as SettingsIcon, Info, ShieldCheck, Newspaper
} from "lucide-react";

export const RAS_MENU = [
  { to: "/ras/dashboard",       icon: <Home size={18} />,         label: "Home",            desc: "Your RAS dashboard" },
  { to: "/ras/ai-generator",    icon: <Brain size={18} />,        label: "AI Generator",    desc: "AI question sets (RPSC syllabus)" },
  { to: "/ras/practice",        icon: <MapPin size={18} />,       label: "Practice",        desc: "RPSC PYQ + Rajasthan GK" },
  { to: "/ras/current-affairs", icon: <Newspaper size={18} />,    label: "Current Affairs", desc: "Rajasthan + National daily" },
  { to: "/ras/vyas",            icon: <Sparkles size={18} />,     label: "AI Vyas",         desc: "RAS Mains answer evaluation" },
  { to: "/ras/notes",           icon: <FileText size={18} />,     label: "Study Notes",     desc: "Protected PDF library" },
  { to: "/ras/courses",         icon: <Video size={18} />,        label: "Lecture Portal",  desc: "Video lecture streams" },
  { to: "/ras/history",         icon: <History size={18} />,      label: "Log History",     desc: "Test records & analytics" },
  { to: "/ras/settings",        icon: <SettingsIcon size={18} />, label: "Settings",        desc: "Preferences & account" },
  { to: "/ras/about",           icon: <Info size={18} />,         label: "About",           desc: "Our mission & team" },
];

export const RAS_ADMIN_ITEM = {
  to: "/ras/courses", icon: <ShieldCheck size={18} />,
  label: "Admin Panel", desc: "Course & Notes Editor",
};

export const RAS_BRAND = { code: "RAS", title: "RAS Academy", short: "RAS", logoText: "RA" };
