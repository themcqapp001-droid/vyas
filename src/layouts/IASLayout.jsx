import React from "react";
import { Outlet } from "react-router-dom";
import { ExamProvider } from "../context/ExamContext";
import { IAS_MENU, IAS_BRAND } from "../config/iasMenu.jsx";

/**
 * NOTE: this layout does NOT wrap children in <AppLayout>.
 * Existing pages (AiGenerator, Practice, Notes...) already wrap themselves in
 * AppLayout, and AppLayout now picks its own menu from the URL prefix.
 * So this layout only injects section context — zero changes needed in pages.
 */
export default function IASLayout() {
  return (
    <ExamProvider examType="IAS" brand={IAS_BRAND} menu={IAS_MENU}>
      <Outlet />
    </ExamProvider>
  );
}
