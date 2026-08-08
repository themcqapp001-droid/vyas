import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import LandingLayout from "./layouts/LandingLayout";
import IASLayout from "./layouts/IASLayout";
import RASLayout from "./layouts/RASLayout";
import RequirePro from "./components/RequirePro";

import Auth from "./pages/Auth";
import Practice from "./pages/Practice";
import AiGenerator from "./pages/AiGenerator";
import TestHistory from "./pages/TestHistory";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import Anthropology from "./pages/Anthropology";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import RasAcademy from "./pages/RasAcademy";
import TheMCQApp from "./pages/TheMCQApp";
import VyasEvaluator from "./pages/VyasEvaluator";
import GateAcademy from "./pages/GateAcademy";
import GateQuiz from "./pages/GateQuiz";
import Pricing from "./pages/Pricing";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>

            {/* ─── PUBLIC / LANDING ─────────────────────────────── */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<TheMCQApp />} />
              <Route path="/pricing" element={<Pricing />} />
            </Route>
            <Route path="/login" element={<Auth />} />

            {/* ─── IAS (UPSC) SECTION ───────────────────────────── */}
            <Route path="/ias" element={<IASLayout />}>
              <Route index element={<Navigate to="/ias/dashboard" replace />} />
              <Route path="dashboard"    element={<Dashboard />} />
              <Route path="practice"     element={<Practice />} />
              <Route path="ai-generator" element={<RequirePro feature="ai-generator"><AiGenerator examType="IAS" /></RequirePro>} />
              <Route path="vyas"         element={<RequirePro feature="vyas"><VyasEvaluator /></RequirePro>} />
              <Route path="notes"        element={<Notes />} />
              <Route path="courses"      element={<Courses />} />
              <Route path="anthropology" element={<Anthropology />} />
              <Route path="history"      element={<TestHistory />} />
              <Route path="settings"     element={<Settings />} />
              <Route path="about"        element={<About />} />
              <Route path="*"            element={<Navigate to="/ias/dashboard" replace />} />
            </Route>

            {/* ─── RAS (RPSC) SECTION ───────────────────────────── */}
            <Route path="/ras" element={<RASLayout />}>
              <Route index element={<Navigate to="/ras/dashboard" replace />} />
              <Route path="dashboard"       element={<RasAcademy />} />
              <Route path="practice"        element={<Practice />} />
              <Route path="ai-generator"    element={<RequirePro feature="ai-generator"><AiGenerator examType="RAS" /></RequirePro>} />
              <Route path="vyas"            element={<RequirePro feature="vyas"><VyasEvaluator /></RequirePro>} />
              <Route path="current-affairs" element={<Notes />} />
              <Route path="notes"           element={<Notes />} />
              <Route path="courses"         element={<Courses />} />
              <Route path="history"         element={<TestHistory />} />
              <Route path="settings"        element={<Settings />} />
              <Route path="about"           element={<About />} />
              <Route path="*"               element={<Navigate to="/ras/dashboard" replace />} />
            </Route>

            {/* ─── GATE (unchanged) ─────────────────────────────── */}
            <Route path="/gate"      element={<GateAcademy />} />
            <Route path="/gate-quiz" element={<GateQuiz />} />

            {/* ─── LEGACY UNPREFIXED ROUTES ─────────────────────────
                Kept alive so existing links / bookmarks / in-page <Link>s
                do not 404 during migration. AppLayout falls back to the
                original NAV_ITEMS on these paths. Delete this block once
                every page's internal links are moved to /ias/* or /ras/*. */}
            <Route path="/dashboard"    element={<RasAcademy />} />
            <Route path="/practice"     element={<Practice />} />
            <Route path="/ai-generator" element={<Navigate to="/ias/ai-generator" replace />} />
            <Route path="/notes"        element={<Notes />} />
            <Route path="/anthropology" element={<Anthropology />} />
            <Route path="/courses"      element={<Courses />} />
            <Route path="/history"      element={<TestHistory />} />
            <Route path="/settings"     element={<Settings />} />
            <Route path="/about"        element={<About />} />
            <Route path="/vyas"         element={<Navigate to="/ias/vyas" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
