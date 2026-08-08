/**
 * landingMenu.js — Menu for the public marketing shell (themcqapp.com root).
 * No study features here; this is the funnel into /ias or /ras.
 */
import React from "react";
import { Home, GraduationCap, MapPin, Video, Info, LogIn } from "lucide-react";

export const LANDING_MENU = [
  { to: "/",        icon: <Home size={18} />,          label: "Home",       desc: "TheMCQApp" },
  { to: "/ias",     icon: <GraduationCap size={18} />, label: "UPSC / IAS", desc: "Enter IAS portal" },
  { to: "/ras",     icon: <MapPin size={18} />,        label: "RPSC / RAS", desc: "Enter RAS portal" },
  { to: "/gate",    icon: <Video size={18} />,         label: "GATE",       desc: "GATE CS portal" },
  { to: "/pricing", icon: <Info size={18} />,          label: "Pricing",    desc: "Plans & features" },
  { to: "/login",   icon: <LogIn size={18} />,         label: "Login",      desc: "Sign in / Sign up" },
];

export const LANDING_BRAND = { code: "LANDING", title: "TheMCQApp", short: "MCQ", logoText: "MQ" };
