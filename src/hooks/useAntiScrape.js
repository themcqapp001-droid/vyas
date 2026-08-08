/**
 * useAntiScrape.js — best-effort content-protection layer for quiz screens.
 *
 * HONEST SCOPE: this does NOT make content unstealable. A phone camera, the OS
 * PrintScreen key, and a determined user with DevTools will always win. What this
 * does is stop casual copy-paste, right-click save, print-to-PDF dumping and
 * naive scripted scraping — which is 95% of real-world question theft.
 *
 * Usage:  useAntiScrape({ enabled: isTestRunning, onViolation: (kind) => ... })
 */
import { useEffect, useState } from "react";

const BLOCKED_COMBOS = [
  (e) => e.key === "F12",
  (e) => e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase()),
  (e) => e.ctrlKey && ["u", "s", "p"].includes(e.key.toLowerCase()),
  (e) => e.metaKey && e.altKey && ["i", "j", "c"].includes(e.key.toLowerCase()), // mac
  (e) => e.metaKey && ["s", "p"].includes(e.key.toLowerCase()),
];

export function useAntiScrape({ enabled = true, onViolation } = {}) {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const warn = (kind) => { onViolation?.(kind); };

    const onKeyDown = (e) => {
      if (e.key === "PrintScreen") {
        // The key itself cannot be cancelled. Best we can do: blank the content
        // for a moment so a screenshot taken right now captures nothing useful.
        setBlurred(true);
        setTimeout(() => setBlurred(false), 1200);
        try { navigator.clipboard?.writeText(""); } catch (_) {}
        warn("printscreen");
        return;
      }
      if (BLOCKED_COMBOS.some((fn) => { try { return fn(e); } catch { return false; } })) {
        e.preventDefault();
        e.stopPropagation();
        warn("devtools-shortcut");
      }
    };

    const onContextMenu = (e) => { e.preventDefault(); warn("right-click"); };
    const onCopy = (e) => { e.preventDefault(); warn("copy"); };
    const onVisibility = () => { if (document.hidden) setBlurred(true); else setBlurred(false); };

    // DevTools-open heuristic: the debugger statement stalls only when DevTools
    // is open. Cheap, imperfect, and easily defeated — treat as a signal, not a lock.
    const devtoolsTimer = setInterval(() => {
      const t0 = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      if (performance.now() - t0 > 120) { setBlurred(true); warn("devtools-open"); }
    }, 4000);

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("visibilitychange", onVisibility);

    const style = document.createElement("style");
    style.setAttribute("data-anti-scrape", "1");
    style.textContent = `
      .protected-content, .protected-content * {
        -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;
        -webkit-touch-callout: none;
      }
      .protected-content img { pointer-events: none; -webkit-user-drag: none; }
      @media print {
        body { visibility: hidden !important; }
        body::after {
          content: "Printing is disabled — TheMCQApp";
          visibility: visible; position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: Inter, sans-serif; font-size: 20px; color: #7A1F2B;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      clearInterval(devtoolsTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("visibilitychange", onVisibility);
      style.remove();
    };
  }, [enabled, onViolation]);

  /** Spread onto the wrapper around question content. */
  const protectedProps = {
    className: "protected-content",
    style: blurred
      ? { filter: "blur(14px)", transition: "filter .12s", pointerEvents: "none" }
      : { transition: "filter .12s" },
  };

  return { blurred, protectedProps };
}

export default useAntiScrape;
