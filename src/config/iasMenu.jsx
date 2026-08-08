/**
 * iasMenu.js — Sidebar/menu config for the IAS (UPSC) section.
 * Every route is prefixed with /ias so IAS and RAS never share a page instance.
 */
import React from "react";
import {
  Home, Brain, Sparkles, FileText, Video, GraduationCap,
  History, Settings as SettingsIcon, Info, ShieldCheck
} from "lucide-react";

export const IAS_MENU = [
  { to: "/ias/dashboard",    icon: <Home size={18} />,          label: "Home",            desc: "Your UPSC dashboard" },
  { to: "/ias/ai-generator", icon: <Brain size={18} />,         label: "AI Generator",    desc: "AI question sets (UPSC syllabus)" },
  { to: "/ias/practice",     icon: <GraduationCap size={18} />, label: "Practice",        desc: "PYQ + topic practice" },
  { to: "/ias/vyas",         icon: <Sparkles size={18} />,      label: "AI Vyas",         desc: "Mains answer evaluation" },
  { to: "/ias/notes",        icon: <FileText size={18} />,      label: "Study Notes",     desc: "Protected PDF library" },
  { to: "/ias/courses",      icon: <Video size={18} />,         label: "Lecture Portal",  desc: "Video lecture streams" },
  { to: "/ias/anthropology", icon: <GraduationCap size={18} />, label: "Anthro Optional", desc: "UPSC Anthropology prep" },
  { to: "/ias/history",      icon: <History size={18} />,       label: "Log History",     desc: "Test records & analytics" },
  { to: "/ias/settings",     icon: <SettingsIcon size={18} />,  label: "Settings",        desc: "Preferences & account" },
  { to: "/ias/about",        icon: <Info size={18} />,          label: "About",           desc: "Our mission & team" },
];

export const IAS_ADMIN_ITEM = {
  to: "/ias/courses", icon: <ShieldCheck size={18} />,
  label: "Admin Panel", desc: "Course & Notes Editor",
};

export const IAS_BRAND = { code: "IAS", title: "UPSC / IAS Academy", short: "IAS", logoText: "IAS" };
