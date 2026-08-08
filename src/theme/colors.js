import { useTheme } from "../context/ThemeContext";

export const LIGHT_C = {
  bg: "#FAFAFA",
  text: "#1F2937",
  textSec: "#4B5563",
  textMuted: "#6B7280",
  drawer: "#FFFFFF",
  border: "#E5E7EB",
  shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  hoverBg: "#F3F4F6",
  activeBg: "#FEF3C7", // goldSoft
  activeText: "#92400E",
  activeBorder: "#F59E0B",
  gold: "#D4AF37",
  goldSoft: "#FEF3C7",
  maroon: "#5B0A14",
  maroonSoft: "#FCE7F3",
  maroonDark: "#3A0710",
  red: "#EF4444",
};

export const DARK_C = {
  bg: "#111827",
  text: "#F9FAFB",
  textSec: "#D1D5DB",
  textMuted: "#9CA3AF",
  drawer: "#1F2937",
  border: "#374151",
  shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
  hoverBg: "#374151",
  activeBg: "rgba(212,175,55,0.15)", // goldSoft dark
  activeText: "#FCD34D",
  activeBorder: "#D4AF37",
  gold: "#D4AF37",
  goldSoft: "rgba(212,175,55,0.15)",
  maroon: "#EF4444", // adjusted for dark mode visibility if needed, or keep #5B0A14
  maroonSoft: "rgba(91,10,20,0.3)",
  maroonDark: "#3A0710",
  red: "#F87171",
};

export function useC() {
  const { isDarkMode } = useTheme();
  return isDarkMode ? DARK_C : LIGHT_C;
}
