import React, { useState } from "react";
import { idToken } from "./firebase";
import { openResult } from "./lib/api";
import {
  Check, ArrowRight, Download, Sparkles, AlertTriangle, RotateCcw,
  ChevronDown, ChevronUp, Target, TrendingUp, BookOpen, Layers,
} from "lucide-react";

const C = {
  maroon: "#5C0F14", maroonSoft: "#7A1B22", gold: "#C9A227", goldSoft: "#E0C766",
  cream: "#FBF3E6", creamDeep: "#F3E6CE", ink: "#3A2A22", inkSoft: "#6B5A4E",
  paper: "#FFFDF8", ok: "#2F7D4F", warn: "#B8860B", bad: "#B3261E",
};

const RUBRIC_LABELS = {
  understanding_demand: "Understanding the demand",
  content_accuracy: "Content accuracy & coverage",
  analytical_depth: "Analytical depth",
  structure_flow: "Structure & flow",
  relevance: "Relevance",
  examples_ca: "Examples / case studies",
  value_addition: "Value addition",
  presentation: "Presentation",
  conclusion: "Conclusion & way forward",
  word_limit: "Word & time limit",
};

const GRID_LABELS = {
  quality_of_content: "Quality of content",
  dimensions_relevance: "Dimensions & relevance",
  structure_ibc: "Structure (intro, body, conclusion)",
  value_addition: "Value addition",
};

const band = (pct) =>
  pct >= 60 ? { label: "Strong", color: C.ok }
    : pct >= 45 ? { label: "On track", color: C.gold }
      : pct >= 30 ? { label: "Needs work", color: C.warn }
        : { label: "Weak", color: C.bad };

/* ------------------------------------------------------------------ atoms */
function Ring({ value, max, size = 148 }) {
  const pct = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const stroke = 12, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={C.maroonSoft} strokeWidth={stroke} opacity={0.28} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.gold}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(circ * pct) / 100} ${circ}`}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        textAlign: "center", lineHeight: 1.05,
      }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: size * 0.24, fontWeight: 700, color: C.cream }}>
            {Number(value || 0).toFixed(1)}
          </div>
          <div style={{ fontSize: 11, letterSpacing: 1, color: C.goldSoft, marginTop: 4 }}>
            / {max} marks
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, score, max }) {
  const pct = max ? (score / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
        <span style={{ color: C.ink }}>{label}</span>
        <span style={{ fontWeight: 600, color: C.maroon, fontVariantNumeric: "tabular-nums" }}>
          {score}/{max}
        </span>
      </div>
      <div style={{ height: 7, background: C.creamDeep, borderRadius: 20, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 20,
          background: `linear-gradient(90deg, ${C.maroon}, ${C.gold})`,
          transition: "width 800ms cubic-bezier(.2,.8,.2,1)",
        }} />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, style }) {
  return (
    <div style={{
      background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 16,
      padding: "18px 20px", marginBottom: 16, ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        {Icon && <Icon size={17} color={C.maroon} />}
        <h3 style={{
          fontFamily: "'Cinzel',serif", fontSize: 15.5, fontWeight: 700,
          color: C.maroon, margin: 0,
        }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------- question card */
function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(index === 0);
  const notEvaluated = q.status === "not_evaluated";
  const notAttempted = q.status === "not_attempted";
  const max = parseFloat(q.max_marks) || 0;
  const awarded = parseFloat(q.awarded_marks) || 0;
  const pct = max ? (awarded / max) * 100 : 0;
  const b = notEvaluated ? { label: "Not evaluated", color: C.inkSoft }
    : notAttempted ? { label: "Not attempted", color: C.inkSoft }
      : band(pct);

  const rubric = q.rubric_100 || {};
  const grid = q.grid || {};

  return (
    <div style={{
      background: C.paper, border: `1.5px solid ${C.creamDeep}`,
      borderLeft: `5px solid ${b.color}`, borderRadius: 14, marginBottom: 12,
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "16px 18px", textAlign: "left", display: "flex",
          alignItems: "flex-start", gap: 12, color: "inherit", font: "inherit",
        }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: C.maroon }}>
              Q{q.q_no}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: b.color, background: `${b.color}18`,
              padding: "2px 9px", borderRadius: 20,
            }}>{b.label}</span>
          </div>
          <div style={{
            fontSize: 13, color: C.inkSoft, marginTop: 6, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: open ? 99 : 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {q.detected_question || "Question text was not read from the copy."}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 19, fontWeight: 700, color: b.color,
            fontVariantNumeric: "tabular-nums",
          }}>
            {notEvaluated ? "—" : awarded.toFixed(1)}
            <span style={{ fontSize: 12.5, color: C.inkSoft }}> / {max}</span>
          </div>
          <div style={{ marginTop: 4, color: C.inkSoft }}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.creamDeep}` }}>
          {notEvaluated && (
            <div style={{
              background: "#FBE6E4", borderRadius: 10, padding: "12px 14px",
              margin: "14px 0 0", fontSize: 13, color: C.ink, lineHeight: 1.55,
            }}>
              This question could not be evaluated on this run, so it is
              <b> excluded from your total</b> rather than scored as zero.
              Submit the copy again to have it marked.
            </div>
          )}

          {!notEvaluated && Object.keys(grid).length > 0 && (
            <div style={{ marginTop: 16 }}>
              {Object.entries(GRID_LABELS).map(([k, label]) =>
                grid[k] ? (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <div style={{
                      fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase",
                      color: C.inkSoft, fontWeight: 700, marginBottom: 4,
                    }}>{label}</div>
                    <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{grid[k]}</div>
                  </div>
                ) : null)}
            </div>
          )}

          {!notEvaluated && rubric.total != null && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase",
                color: C.inkSoft, fontWeight: 700, marginBottom: 10,
              }}>
                Parameter breakdown — {rubric.total}/100
              </div>
              {Object.entries(RUBRIC_LABELS).map(([k, label]) =>
                rubric[k] ? (
                  <Bar key={k} label={label} score={rubric[k].score} max={rubric[k].max} />
                ) : null)}
            </div>
          )}

          {(q.strengths || []).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase",
                color: C.ok, fontWeight: 700, marginBottom: 8,
              }}>What worked</div>
              {q.strengths.map((sx, i) => (
                <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
                  <Check size={14} color={C.ok} style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.55 }}>{sx}</span>
                </div>
              ))}
            </div>
          )}

          {(q.improvements || []).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase",
                color: C.maroon, fontWeight: 700, marginBottom: 8,
              }}>Fix next time</div>
              {q.improvements.map((ix, i) => (
                <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
                  <ArrowRight size={14} color={C.maroon} style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.55 }}>{ix}</span>
                </div>
              ))}
            </div>
          )}

          {q.model_approach && (
            <div style={{
              marginTop: 14, background: C.cream, borderRadius: 10,
              padding: "13px 15px", borderLeft: `3px solid ${C.gold}`,
            }}>
              <div style={{
                fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase",
                color: C.maroon, fontWeight: 700, marginBottom: 6,
              }}>How a topper would build this</div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {q.model_approach}
              </div>
            </div>
          )}

          {(q.missing_on_page || []).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase",
                color: C.inkSoft, fontWeight: 700, marginBottom: 8,
              }}>What was missing</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {q.missing_on_page.flatMap(m => m.items || []).slice(0, 12).map((it, i) => (
                  <span key={i} style={{
                    fontSize: 12, background: C.creamDeep, color: C.maroon,
                    padding: "4px 11px", borderRadius: 20, fontWeight: 500,
                  }}>{it}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ main view */
export default function ResultView({
  questions = [], totalAwarded = 0, totalOutOf = 0, macroComments = [],
  topActions = [], bookletVerdict = "", warnings = [], unmarkedCount = 0,
  pdfUrl, contextLine = "", timeTaken = null, onReset,
}) {
  const [tab, setTab] = useState("summary");
  const pct = totalOutOf ? (totalAwarded / totalOutOf) * 100 : 0;
  const b = band(pct);

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "questions", label: `Questions (${questions.length})` },
    { id: "actions", label: "Action plan" },
  ];

  return (
    <div className="fade-in">
      {/* ---- score header ---- */}
      <div style={{
        background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonSoft})`,
        borderRadius: 20, padding: "26px 24px", marginBottom: 18,
        display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
        justifyContent: "center",
      }}>
        <Ring value={totalAwarded} max={totalOutOf || 1} />
        <div style={{ flex: 1, minWidth: 210 }}>
          <div style={{
            fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
            color: C.goldSoft, fontWeight: 600, marginBottom: 7,
          }}>{contextLine}</div>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700,
            color: C.cream, lineHeight: 1.2,
          }}>
            {pct.toFixed(0)}% · {b.label}
          </div>
          {bookletVerdict && (
            <div style={{ fontSize: 13.5, color: C.goldSoft, marginTop: 8, lineHeight: 1.55 }}>
              {bookletVerdict}
            </div>
          )}
          <div style={{ fontSize: 12, color: C.goldSoft, marginTop: 10, opacity: 0.85 }}>
            {questions.length - unmarkedCount} of {questions.length} questions marked
            {timeTaken ? ` · checked in ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s` : ""}
          </div>
        </div>
      </div>

      {/* ---- warnings ---- */}
      {warnings.length > 0 && (
        <div style={{
          background: "#FFF6E0", borderLeft: `4px solid ${C.warn}`,
          borderRadius: "0 12px 12px 0", padding: "13px 16px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
            <AlertTriangle size={16} color={C.warn} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
              {warnings.map((w, i) => <div key={i} style={{ marginBottom: 4 }}>{w}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* ---- actions ---- */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {pdfUrl && (
          <button onClick={() => openResult(pdfUrl)} className="vyas-btn"
            style={{
              background: C.maroon, color: C.cream, border: "none", borderRadius: 12,
              padding: "13px 22px", fontWeight: 600, fontSize: 14.5, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8, font: "inherit",
              boxShadow: "0 6px 18px rgba(92,15,20,0.26)",
            }}>
            <Download size={17} /> Marked copy (PDF)
          </button>
        )}
        <button className="vyas-btn" onClick={onReset} style={{
          background: C.paper, color: C.maroon, border: `1.5px solid ${C.gold}`,
          borderRadius: 12, padding: "13px 22px", fontWeight: 600, fontSize: 14.5,
          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          <RotateCcw size={16} /> Check another copy
        </button>
      </div>

      {/* ---- tabs ---- */}
      <div role="tablist" style={{
        display: "flex", gap: 4, borderBottom: `1.5px solid ${C.creamDeep}`,
        marginBottom: 18, overflowX: "auto",
      }}>
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "11px 15px",
              fontWeight: 600, fontSize: 14, whiteSpace: "nowrap",
              color: tab === t.id ? C.maroon : C.inkSoft,
              borderBottom: `3px solid ${tab === t.id ? C.gold : "transparent"}`,
              marginBottom: -1.5,
            }}>{t.label}</button>
        ))}
      </div>

      {/* ---- summary ---- */}
      {tab === "summary" && (
        <div>
          {macroComments.length > 0 ? (
            <Section icon={Sparkles} title="What the examiner noticed about you">
              {macroComments.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", background: C.creamDeep,
                    display: "grid", placeItems: "center", flexShrink: 0,
                    fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, color: C.maroon,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.65 }}>{c}</span>
                </div>
              ))}
            </Section>
          ) : (
            <Section icon={Sparkles} title="Overall feedback">
              <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>
                Booklet-level comments were not generated for this copy. Your
                per-question feedback below is complete.
              </div>
            </Section>
          )}

          <Section icon={Layers} title="Question by question">
            <div style={{ display: "grid", gap: 8 }}>
              {questions.map((q, i) => {
                const max = parseFloat(q.max_marks) || 0;
                const aw = parseFloat(q.awarded_marks) || 0;
                const notEval = q.status === "not_evaluated";
                const qb = notEval ? { color: C.inkSoft } : band(max ? (aw / max) * 100 : 0);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      minWidth: 38, fontSize: 12.5, fontWeight: 600, color: C.maroon,
                    }}>Q{q.q_no}</span>
                    <div style={{
                      flex: 1, height: 8, background: C.creamDeep, borderRadius: 20, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: notEval ? "0%" : `${max ? (aw / max) * 100 : 0}%`,
                        background: qb.color, borderRadius: 20, transition: "width 700ms ease",
                      }} />
                    </div>
                    <span style={{
                      minWidth: 62, textAlign: "right", fontSize: 12.5, fontWeight: 600,
                      color: qb.color, fontVariantNumeric: "tabular-nums",
                    }}>{notEval ? "—" : `${aw}/${max}`}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      )}

      {/* ---- questions ---- */}
      {tab === "questions" && (
        <div>
          {questions.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: C.inkSoft }}>
              No question-level detail is available for this copy.
            </div>
          )}
          {questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
        </div>
      )}

      {/* ---- actions ---- */}
      {tab === "actions" && (
        <div>
          {topActions.length > 0 && (
            <Section icon={Target} title="Do these three things before your next test">
              {topActions.map((a, i) => (
                <div key={i} style={{
                  display: "flex", gap: 13, marginBottom: 14, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, background: C.gold,
                    display: "grid", placeItems: "center", flexShrink: 0,
                    fontFamily: "'Cinzel',serif", fontWeight: 700, color: C.maroon,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, paddingTop: 4 }}>{a}</span>
                </div>
              ))}
            </Section>
          )}

          <Section icon={TrendingUp} title="Your weakest parameters across the booklet">
            {(() => {
              const totals = {};
              questions.filter(q => q.status !== "not_evaluated").forEach(q => {
                Object.entries(q.rubric_100 || {}).forEach(([k, v]) => {
                  if (k === "total" || !v || typeof v !== "object") return;
                  totals[k] = totals[k] || { score: 0, max: 0 };
                  totals[k].score += v.score || 0;
                  totals[k].max += v.max || 0;
                });
              });
              const ranked = Object.entries(totals)
                .filter(([, v]) => v.max > 0)
                .sort((a, b2) => (a[1].score / a[1].max) - (b2[1].score / b2[1].max))
                .slice(0, 5);
              if (!ranked.length) {
                return <div style={{ fontSize: 13.5, color: C.inkSoft }}>
                  Not enough marked questions to rank your parameters yet.
                </div>;
              }
              return ranked.map(([k, v]) => (
                <Bar key={k} label={RUBRIC_LABELS[k] || k}
                  score={Math.round(v.score * 10) / 10} max={v.max} />
              ));
            })()}
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 12, lineHeight: 1.6 }}>
              These are summed across every marked question, so they show the habit
              rather than one bad answer. Fix the top one first.
            </div>
          </Section>

          {pdfUrl && (
            <Section icon={BookOpen} title="The marked copy">
              <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6, marginBottom: 14 }}>
                Every margin remark is anchored to the exact line it is about, with
                worked examples underneath and a "what is missing on this page" box
                at the foot of each page.
              </div>
              <button onClick={async () => {
                const token = await idToken();
                window.open(`${pdfUrl}?t=${token}`, "_blank");
              }} className="vyas-btn"
                style={{
                  background: C.maroon, color: C.cream, borderRadius: 12,
                  padding: "12px 20px", fontWeight: 600, fontSize: 14,
                  display: "inline-flex", alignItems: "center", gap: 8,
                  border: "none", cursor: "pointer",
                }}>
                <Download size={16} /> Open the marked copy
              </button>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
