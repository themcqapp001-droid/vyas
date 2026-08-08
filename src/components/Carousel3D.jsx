import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export default function Carousel3D({ items }) {
  const { isDarkMode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = items.length;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % total);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  // Calculate position and scale based on active index
  const getCardStyle = (index) => {
    let diff = index - activeIndex;
    
    // Wrap around
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;

    const absDiff = Math.abs(diff);
    
    // Center card is 1, side cards scale down
    const scale = absDiff === 0 ? 1 : Math.max(0.7, 1 - absDiff * 0.15);
    const opacity = absDiff === 0 ? 1 : Math.max(0.3, 1 - absDiff * 0.3);
    const zIndex = 100 - absDiff;
    
    // Use vw to make it responsive
    const translateX = diff * 22; // 22vw between cards

    return {
      position: "absolute",
      left: "50%",
      transform: `translateX(calc(-50% + ${translateX}vw)) scale(${scale})`,
      opacity,
      zIndex,
      transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
    };
  };

  return (
    <div style={{ position: "relative", width: "100%", padding: "40px 0", overflow: "hidden" }}>
      
      {/* 3D Container */}
      <div style={{ position: "relative", height: "340px", display: "flex", justifyContent: "center", alignItems: "center", perspective: "1000px" }}>
        {items.map((item, index) => {
          const style = getCardStyle(index);
          const isCenter = index === activeIndex;
          
          return (
            <div
              key={index}
              onClick={() => {
                if (isCenter && item.onClick) item.onClick();
                else setActiveIndex(index);
              }}
              style={{
                ...style,
                width: "300px",
                height: "280px",
                borderRadius: "24px",
                // Glassy Effect dependent on Day/Night
                background: isDarkMode 
                  ? "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))",
                backdropFilter: "blur(16px)",
                border: isDarkMode 
                  ? "1px solid rgba(255,255,255,0.15)" 
                  : "1px solid rgba(212,175,55,0.3)",
                boxShadow: isDarkMode 
                  ? "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "0 20px 40px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                padding: "30px 24px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                // Slight shadow adjustment when active
                transformOrigin: "center center",
              }}
              onMouseEnter={(e) => {
                if (isCenter) e.currentTarget.style.borderColor = "rgba(212,175,55,0.8)";
              }}
              onMouseLeave={(e) => {
                if (isCenter) e.currentTarget.style.borderColor = isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(212,175,55,0.3)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>{item.icon}</div>
              <h3 style={{ 
                margin: "0 0 12px", 
                color: isDarkMode ? "#F9FAFB" : "#3A0710", 
                fontSize: "20px", 
                fontWeight: "700",
                fontFamily: "Poppins, sans-serif"
              }}>
                {item.title}
              </h3>
              <p style={{ 
                margin: 0, 
                color: isDarkMode ? "#D1D5DB" : "#4B5563", 
                fontSize: "14px", 
                lineHeight: 1.6 
              }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "16px" }}>
        <button onClick={handlePrev} style={controlBtnStyle(isDarkMode)}>
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => setIsPaused(!isPaused)} style={controlBtnStyle(isDarkMode)}>
          {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
        </button>
        <button onClick={handleNext} style={controlBtnStyle(isDarkMode)}>
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
}

const controlBtnStyle = (isDarkMode) => ({
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(201,162,39,0.15)",
  border: isDarkMode ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(201,162,39,0.4)",
  color: isDarkMode ? "#F9FAFB" : "#3A0710",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 0.3s",
  backdropFilter: "blur(8px)",
});
