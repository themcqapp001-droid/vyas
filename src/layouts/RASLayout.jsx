import React from "react";
import { Outlet } from "react-router-dom";
import { ExamProvider } from "../context/ExamContext";
import { RAS_MENU, RAS_BRAND } from "../config/rasMenu.jsx";

export default function RASLayout() {
  return (
    <ExamProvider examType="RAS" brand={RAS_BRAND} menu={RAS_MENU}>
      <Outlet />
    </ExamProvider>
  );
}
