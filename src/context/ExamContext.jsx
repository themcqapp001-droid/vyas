/**
 * ExamContext.jsx — makes the current section (IAS / RAS / LANDING) available to
 * every page without prop-drilling. Layouts set it; pages read it.
 */
import React, { createContext, useContext, useMemo } from "react";

const ExamContext = createContext({ examType: "IAS", brand: null, menu: [] });

export function ExamProvider({ examType, brand, menu, children }) {
  const value = useMemo(() => ({ examType, brand, menu }), [examType, brand, menu]);
  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  return useContext(ExamContext);
}
