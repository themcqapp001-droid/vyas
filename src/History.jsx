import React, { useEffect, useState, useMemo } from "react";
import {
  X, Download, Search, TrendingUp, FileText, Clock, AlertTriangle, RotateCcw,
} from "lucide-react";
import { api, API_BASE, authHeader, openResult } from "./lib/api";

const C = {
  maroon: "#5C0F14", maroonSoft: "#7A1B22", gold: "#C9A227", goldSoft: "#E0C766",
  cream: "#FBF3E6", creamDeep: "#F3E6CE", ink: "#3A2A22", inkSoft: "#6B5A4E",
  paper: "#FFFDF8", ok: "#2F7D4F", warn: "#B8860B", bad: "#B3261E",
};

const band = (pct) =>
  pct >= 60 ? { label: "Strong", color: C.ok }
    : pct >= 45 ? { label: "On track", color: C.gold }
      : pct >= 30 ? { label: "Needs work", color: C.warn }
        : { label: "Weak", color: C.bad };

const fmtDate = (t) => {
  if (!t) return "";
  const d = new Date(t * 1000);
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function Stat({ label, value, note, color }) {
  return (
    <div style={{
      background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 14,
      padding: "16px 18px", position: "relative", overflow: "hidden", flex: "1 1 150px",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: color || C.gold,
      }} />
      <div style={{
        fontSize: 10.5, letterSpacing: 0.9, textTransform: "uppercase",
        color: C.inkSoft, fontWeight: 700,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700,
        color: color || C.maroon, margin: "6px 0 2px", fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
      {note && <div style={{ fontSize: 12, color: C.inkSoft }}>{note}</div>}
    </div>
  );
}

/**
 * The dedicated History section.
 *
 * The old build had history as a dropdown squeezed into the header, and it
 * showed a bare list of rows with no sense of whether the student was
 * improving. This is a full screen: a trend line, the aggregate numbers that
 * actually matter to an aspirant, live jobs at the top, and a searchable list.
 */
export default function History({ onClose, onResume, onOpenResult }) {
  const [rows, setRows] = useState(null);
  const [active, setActive] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState(null);

  const load = async () => {
    setErr(null);
    try {
      const [subs, act] = await Promise.allSettled([
        api("/api/submissions"), api("/api/active"),
      ]);
      setRows(subs.status === "fulfilled" ? (subs.value.submissions || []) : []);
      setActive(act.status === "fulfilled" ? (act.value.active || []) : []);
      if (subs.status === "rejected") setErr(subs.reason?.message || "Could not load history");
    } catch (e) {
      setErr(e.message); setRows([]);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!active.length) return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [active.length]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const n = q.trim().toLowerCase();
    if (!n) return rows;
    return rows.filter(r =>
      (r.paper || "").toLowerCase().includes(n) ||
      (r.exam || "").toLowerCase().includes(n) ||
      (r.code || "").toLowerCase().includes(n) ||
      (r.summary || "").toLowerCase().includes(n));
  }, [rows, q]);

  const stats = useMemo(() => {
    if (!rows || !rows.length) return null;
    const withScore = rows.filter(r => r.out_of > 0);
    const pcts = withScore.map(r => (r.total_marks / r.out_of) * 100);
    const avg = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
    // Newest first from the API, so "recent" is the head of the list.
    const recent = pcts.slice(0, 5);
    const older = pcts.slice(5, 10);
    const rAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
    const oAvg = older.length ? older.reduce((a, b) => a + b, 0) / older.length : 0;
    return {
      count: rows.length,
      avg,
      best: pcts.length ? Math.max(...pcts) : 0,
      questions: rows.reduce((a, r) => a + (r.questions || 0), 0),
      trend: older.length >= 2 ? rAvg - oAvg : null,
    };
  }, [rows]);

  const spark = useMemo(() => {
    if (!rows) return [];
    return rows.filter(r => r.out_of > 0).slice(0, 12).reverse()
      .map(r => ({ pct: (r.total_marks / r.out_of) * 100, code: r.code, created: r.created }));
  }, [rows]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 90, background: C.cream,
      display: "flex", flexDirection: "column",
    }}>
      {/* header */}
      <div style={{
        background: `linear-gradient(120deg, ${C.maroon}, ${C.maroonSoft})`,
        color: C.cream, padding: "16px 20px", display: "flex",
        alignItems: "center", gap: 14, borderBottom: `3px solid ${C.gold}`,
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Cinzel',serif", fontSize: 19, fontWeight: 700, margin: 0,
          }}>Your copies</h2>
          <div style={{
            fontSize: 11, letterSpacing: 0.9, textTransform: "uppercase",
            color: C.goldSoft, marginTop: 3,
          }}>Every evaluation, in one place</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={load} aria-label="Refresh" style={{
          background: "rgba(251,243,230,.14)", border: "none", color: C.cream,
          width: 38, height: 38, borderRadius: 10, cursor: "pointer",
          display: "grid", placeItems: "center",
        }}><RotateCcw size={17} /></button>
        <button onClick={onClose} aria-label="Close" style={{
          background: "rgba(251,243,230,.14)", border: "none", color: C.cream,
          width: 38, height: 38, borderRadius: 10, cursor: "pointer",
          display: "grid", placeItems: "center",
        }}><X size={19} /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 40px" }}>

          {/* live jobs */}
          {active.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, letterSpacing: 0.9, textTransform: "uppercase",
                color: C.inkSoft, fontWeight: 700, marginBottom: 10,
              }}>Checking right now</div>
              {active.map(j => (
                <button key={j.job_id} onClick={() => onResume && onResume(j.job_id)}
                  style={{
                    width: "100%", textAlign: "left", background: C.paper,
                    border: `1.5px solid ${C.gold}`, borderRadius: 14,
                    padding: "14px 16px", marginBottom: 10, cursor: "pointer",
                    font: "inherit", color: "inherit",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: C.maroon }}>
                      {(j.meta?.exam || "").toUpperCase()} {j.meta?.paper || ""}
                    </span>
                    <span style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>{j.percent}%</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, margin: "5px 0 9px" }}>
                    {j.message}
                    {j.eta_seconds > 0 ? ` · about ${Math.ceil(j.eta_seconds / 60)} min left` : ""}
                  </div>
                  <div style={{ height: 6, background: C.creamDeep, borderRadius: 20, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${j.percent}%`, background: C.gold,
                      borderRadius: 20, transition: "width .6s ease",
                    }} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* stats */}
          {stats && (
            <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <Stat label="Copies checked" value={stats.count}
                  note={`${stats.questions} questions marked`} />
                <Stat label="Average" value={`${stats.avg.toFixed(0)}%`}
                  note={band(stats.avg).label} color={band(stats.avg).color} />
                <Stat label="Best" value={`${stats.best.toFixed(0)}%`} note="your ceiling so far"
                  color={C.ok} />
                {stats.trend != null && (
                  <Stat label="Recent trend"
                    value={`${stats.trend >= 0 ? "+" : ""}${stats.trend.toFixed(0)}%`}
                    note="last 5 vs the 5 before"
                    color={stats.trend >= 0 ? C.ok : C.bad} />
                )}
              </div>

              {spark.length > 2 && (
                <div style={{
                  background: C.paper, border: `1.5px solid ${C.creamDeep}`,
                  borderRadius: 14, padding: "16px 18px", marginBottom: 20,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
                  }}>
                    <TrendingUp size={16} color={C.maroon} />
                    <span style={{
                      fontFamily: "'Cinzel',serif", fontSize: 14.5, fontWeight: 700, color: C.maroon,
                    }}>How you are moving</span>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "flex-end", gap: 6, height: 90,
                  }}>
                    {spark.map((s, i) => (
                      <div key={i} title={`${s.pct.toFixed(0)}%`} style={{
                        flex: 1, height: `${Math.max(6, s.pct)}%`,
                        background: `linear-gradient(180deg, ${band(s.pct).color}, ${C.maroonSoft})`,
                        borderRadius: "4px 4px 0 0", minWidth: 8,
                      }} />
                    ))}
                  </div>
                  <div style={{
                    fontSize: 12, color: C.inkSoft, marginTop: 10, display: "flex",
                    justifyContent: "space-between",
                  }}>
                    <span>oldest</span><span>latest</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* search */}
          {rows && rows.length > 4 && (
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search size={16} color={C.inkSoft} style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              }} />
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search by paper or code"
                style={{
                  width: "100%", padding: "12px 14px 12px 40px",
                  border: `1.5px solid ${C.creamDeep}`, borderRadius: 12,
                  background: C.paper, fontSize: 14, fontFamily: "inherit", color: C.ink,
                }} />
            </div>
          )}

          {/* list */}
          {rows === null && (
            <div style={{ padding: 50, textAlign: "center", color: C.inkSoft }}>Loading…</div>
          )}

          {err && (
            <div style={{
              background: "#FBE6E4", borderLeft: `4px solid ${C.bad}`,
              borderRadius: "0 12px 12px 0", padding: "13px 16px", marginBottom: 16,
              fontSize: 13.5, color: C.ink, display: "flex", gap: 9,
            }}>
              <AlertTriangle size={16} color={C.bad} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{err}</span>
            </div>
          )}

          {rows && rows.length === 0 && !err && (
            <div style={{
              padding: "60px 24px", textAlign: "center", background: C.paper,
              border: `1.5px dashed ${C.creamDeep}`, borderRadius: 16,
            }}>
              <FileText size={34} color={C.gold} style={{ marginBottom: 14 }} />
              <div style={{
                fontFamily: "'Cinzel',serif", fontSize: 19, fontWeight: 700,
                color: C.maroon, marginBottom: 8,
              }}>No copies yet</div>
              <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
                Upload your first answer copy and it will show up here with its
                marks, the examiner's remarks and the marked PDF.
              </div>
              <button onClick={onClose} className="vyas-btn" style={{
                marginTop: 20, background: C.maroon, color: C.cream, border: "none",
                borderRadius: 12, padding: "12px 22px", fontWeight: 600, fontSize: 14,
                cursor: "pointer",
              }}>Check a copy</button>
            </div>
          )}

          {filtered.map((r) => {
            const pct = r.out_of ? (r.total_marks / r.out_of) * 100 : 0;
            const b = band(pct);
            return (
              <div key={r.code} style={{
                background: C.paper, border: `1.5px solid ${C.creamDeep}`,
                borderLeft: `5px solid ${b.color}`, borderRadius: 14,
                padding: "15px 17px", marginBottom: 11,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", gap: 12, flexWrap: "wrap",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontFamily: "'Cinzel',serif", fontSize: 15.5, fontWeight: 700, color: C.maroon,
                    }}>
                      {(r.exam || "UPSC").toUpperCase()}
                      {r.paper ? ` · ${String(r.paper).toUpperCase()}` : ""}
                    </div>
                    <div style={{
                      fontSize: 12, color: C.inkSoft, marginTop: 4,
                      display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
                    }}>
                      <Clock size={12} /> {fmtDate(r.created)}
                      <span>· {r.questions || 0} questions</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11 }}>· {r.code}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700,
                      color: b.color, fontVariantNumeric: "tabular-nums",
                    }}>
                      {r.out_of ? `${r.total_marks}/${r.out_of}` : "—"}
                    </div>
                    <div style={{ fontSize: 11.5, color: b.color, fontWeight: 600 }}>{b.label}</div>
                  </div>
                </div>

                {r.out_of > 0 && (
                  <div style={{
                    height: 7, background: C.creamDeep, borderRadius: 20,
                    overflow: "hidden", margin: "12px 0 10px",
                  }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: b.color, borderRadius: 20 }} />
                  </div>
                )}

                {r.summary && (
                  <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, marginBottom: 11 }}>
                    {r.summary}
                  </div>
                )}

                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {r.pdf_url && (
                    <button onClick={() => openResult(r.pdf_url)}
                      className="vyas-btn" style={{
                        background: C.maroon, color: C.cream, borderRadius: 10,
                        padding: "9px 16px", fontWeight: 600, fontSize: 13,
                        display: "inline-flex", alignItems: "center", gap: 7,
                        border: "none", cursor: "pointer", font: "inherit",
                      }}>
                      <Download size={14} /> Marked copy
                    </button>
                  )}
                  {onOpenResult && (
                    <button onClick={() => onOpenResult(r)} className="vyas-btn" style={{
                      background: "transparent", color: C.maroon,
                      border: `1.5px solid ${C.creamDeep}`, borderRadius: 10,
                      padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}>Details</button>
                  )}
                </div>
              </div>
            );
          })}

          {rows && rows.length > 0 && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: C.inkSoft }}>
              Nothing matches “{q}”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
