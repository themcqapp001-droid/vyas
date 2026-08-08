import React from "react";
import { Outlet } from "react-router-dom";
import { ExamProvider } from "../context/ExamContext";
import { LANDING_MENU, LANDING_BRAND } from "../config/landingMenu.jsx";

export default function LandingLayout() {
  return (
    <ExamProvider examType="LANDING" brand={LANDING_BRAND} menu={LANDING_MENU}>
      <Outlet />
    </ExamProvider>
  );
}
