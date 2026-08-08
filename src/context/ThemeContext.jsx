import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      // Apply dark background to prevent white flash
      document.body.style.background = "#0C1220";
      document.body.style.color = "#E8F0FE";
    } else {
      root.classList.remove("dark");
      // Apply light background
      document.body.style.background = "#FCFBF8";
      document.body.style.color = "#181818";
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
