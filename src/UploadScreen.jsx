import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload, FileText, X, Check, ChevronRight, ChevronLeft, Camera, AlertCircle,
  Zap, Cpu, UserCheck, Sparkles,
} from "lucide-react";

/**
 * The screen where a student hands over their copy.
 *
 * Built phone-first, because that is where ~90% of the traffic is. The
 * specifics that matter on a phone and are easy to get wrong:
 *
 *  - The primary action sits in a sticky bar at the bottom, inside the
 *    thumb's natural arc, not at the end of a scroll.
 *  - Every tappable thing is at least 48px tall, and inputs are 16px so iOS
 *    does not zoom the viewport when one is focused.
 *  - The file picker accepts `capture` so "take a photo of my copy" is one
 *    tap rather than a trip through the gallery.
 *  - Nothing animates on a slow device except opacity and transform, both of
 *    which the compositor handles without repainting.
 *  - `env(safe-area-inset-bottom)` keeps the action bar clear of the iPhone
 *    home indicator.
 *
 * Props:
 *   exam, paper            current selection
 *   onSubmit(file, qpFile) called when the student confirms
 *   onChangeExam(v), onChangePaper(v)
 *   credits                number remaining, or null while unknown
 *   busy                   disables the action while a submit is in flight
 */

const C = {
  maroon: "#5C0F14", maroonSoft: "#7A1B22", maroonInk: "#3F0A0E",
  gold: "#C9A227", goldSoft: "#E0C766", goldWash: "#F6EDD3",
  cream: "#FBF3E6", creamDeep: "#F3E6CE", paper: "#FFFDF8",
  ink: "#3A2A22", inkSoft: "#6B5A4E", inkFaint: "#9A8A7E",
  ok: "#2F7D4F", bad: "#B3261E",
};

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,image/*,application/pdf";
const MAX_MB = 60;

const EXAMS = [
  { id: "UPSC", label: "UPSC" },
  { id: "RAS", label: "RAS / RPSC" },
];

const PAPERS = {
  UPSC: [
    { id: "auto", label: "Detect for me", hint: "recommended" },
    { id: "gs1", label: "GS Paper 1" },
    { id: "gs2", label: "GS Paper 2" },
    { id: "gs3", label: "GS Paper 3" },
    { id: "gs4", label: "GS Paper 4" },
    { id: "essay", label: "Essay" },
  ],
  RAS: [
    { id: "auto", label: "Detect for me", hint: "recommended" },
    { id: "gs1", label: "GS Paper 1" },
    { id: "gs2", label: "GS Paper 2" },
    { id: "gs3", label: "GS Paper 3" },
    { id: "p4", label: "Paper 4" },
  ],
};

/**
 * The first decision, before anything else.
 *
 * This used to sit after the upload, which had it backwards: who checks the
 * copy changes what the student is buying, how long it takes and what it
 * costs, so it belongs at the top. Asking it first also means the rest of the
 * screen can adapt — a mentor check needs no paper detection, for instance.
 */
const MODES = [
  {
    id: "ai",
    icon: Cpu,
    title: "AI evaluation",
    tag: "About 10 minutes",
    blurb: "Marks per question, remarks in the margin exactly where they belong, and the marked PDF to download.",
    uses: "1 check",
  },
  {
    id: "mentor",
    icon: UserCheck,
    title: "Mentor evaluation",
    tag: "24 to 48 hours",
    blurb: "A senior faculty member reads the copy and marks it by hand, the way it is done in the real exam.",
    uses: "Mentor credit",
  },
  {
    id: "both",
    icon: Sparkles,
    title: "AI first, then mentor",
    tag: "AI now, mentor in 24-48 hrs",
    blurb: "The AI result reaches you straight away; a mentor reviews the same copy afterwards and adds their own remarks.",
    uses: "1 check + mentor credit",
    recommended: true,
  },
];

const fmtSize = (b) =>
  b < 1024 * 1024 ? `${Math.round(b / 1024)} KB`
    : `${(b / 1024 / 1024).toFixed(1)} MB`;

/* ------------------------------------------------------------------ atoms */
function Chip({ active, children, hint, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        minHeight: 48, padding: "11px 16px", borderRadius: 12, cursor: "pointer",
        border: `1.5px solid ${active ? C.gold : C.creamDeep}`,
        background: active ? C.maroon : C.paper,
        color: active ? C.cream : C.ink,
        fontWeight: 600, fontSize: 14.5, font: "inherit",
        display: "inline-flex", alignItems: "center", gap: 7,
        transition: "transform .12s ease, background .12s ease",
        WebkitTapHighlightColor: "transparent",
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(.97)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
    >
      {active && <Check size={15} />}
      <span>{children}</span>
      {hint && !active && (
        <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{hint}</span>
      )}
    </button>
  );
}

function Field({ label, children, note }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
        color: C.inkFaint, fontWeight: 700, marginBottom: 10,
      }}>{label}</div>
      {children}
      {note && (
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 8, lineHeight: 1.55 }}>
          {note}
        </div>
      )}
    </div>
  );
}

function ModeCard({ mode, active, onClick }) {
  const Icon = mode.icon;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer", font: "inherit",
        display: "flex", gap: 14, alignItems: "flex-start",
        padding: "16px 16px", marginBottom: 10, borderRadius: 16,
        border: `1.5px solid ${active ? C.gold : C.creamDeep}`,
        background: active ? C.goldWash : C.paper,
        boxShadow: active ? "0 4px 16px rgba(201,162,39,.18)" : "none",
        transition: "transform .12s ease, border-color .12s ease, background .12s ease",
        WebkitTapHighlightColor: "transparent",
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(.985)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: "grid", placeItems: "center",
        background: active
          ? `linear-gradient(145deg, ${C.maroon}, ${C.maroonSoft})`
          : C.cream,
      }}>
        <Icon size={21} color={active ? C.goldSoft : C.maroon} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "'Cinzel',Georgia,serif", fontSize: 16, fontWeight: 700,
            color: C.maroon,
          }}>{mode.title}</span>
          {mode.recommended && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: .5,
              textTransform: "uppercase", color: C.gold,
              background: C.paper, border: `1px solid ${C.gold}`,
              padding: "2px 7px", borderRadius: 20,
            }}>Best value</span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: C.inkFaint, fontWeight: 600, marginTop: 3 }}>
          {mode.tag} · {mode.uses}
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55, marginTop: 6 }}>
          {mode.blurb}
        </div>
      </div>

      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        border: `2px solid ${active ? C.gold : C.creamDeep}`,
        background: active ? C.gold : "transparent",
        display: "grid", placeItems: "center",
      }}>
        {active && <Check size={13} color={C.maroon} strokeWidth={3} />}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------- drop zone */
function DropZone({ file, onPick, onClear, error, label, sub, optional }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const handle = useCallback((f) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      onPick(null, `That file is ${fmtSize(f.size)}. The limit is ${MAX_MB} MB — try exporting the PDF at a smaller size.`);
      return;
    }
    onPick(f, null);
  }, [onPick]);

  if (file) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 13, padding: "16px 16px",
        background: C.paper, border: `1.5px solid ${C.ok}`, borderRadius: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "#E4F2E9", display: "grid", placeItems: "center",
        }}>
          <FileText size={21} color={C.ok} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 14.5, color: C.ink,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{file.name}</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>
            {fmtSize(file.size)} · ready
          </div>
        </div>
        <button onClick={onClear} aria-label="Remove file" style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          border: "none", background: C.cream, color: C.inkSoft,
          cursor: "pointer", display: "grid", placeItems: "center",
        }}><X size={18} /></button>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setOver(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        style={{
          border: `2px dashed ${error ? C.bad : over ? C.gold : C.creamDeep}`,
          borderRadius: 18, padding: "30px 20px", textAlign: "center",
          background: over ? C.goldWash : C.paper, cursor: "pointer",
          transition: "border-color .15s ease, background .15s ease",
        }}
      >
        <div style={{
          width: 56, height: 56, margin: "0 auto 14px", borderRadius: 16,
          background: `linear-gradient(145deg, ${C.maroon}, ${C.maroonSoft})`,
          display: "grid", placeItems: "center",
          boxShadow: "0 6px 18px rgba(92,15,20,.22)",
        }}>
          <Upload size={24} color={C.goldSoft} />
        </div>
        <div style={{
          fontFamily: "'Cinzel',Georgia,serif", fontSize: 17, fontWeight: 700,
          color: C.maroon, marginBottom: 6,
        }}>{label}</div>
        <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.55 }}>{sub}</div>
        {optional && (
          <div style={{ fontSize: 12, color: C.inkFaint, marginTop: 8 }}>Optional</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={() => inputRef.current?.click()} style={{
          flex: 1, minHeight: 48, borderRadius: 12, border: `1.5px solid ${C.creamDeep}`,
          background: C.paper, color: C.maroon, fontWeight: 600, fontSize: 14,
          cursor: "pointer", display: "inline-flex", alignItems: "center",
          justifyContent: "center", gap: 8, font: "inherit",
        }}>
          <FileText size={17} /> Choose file
        </button>
        <button onClick={() => document.getElementById(`cam-${label}`)?.click()} style={{
          flex: 1, minHeight: 48, borderRadius: 12, border: `1.5px solid ${C.creamDeep}`,
          background: C.paper, color: C.maroon, fontWeight: 600, fontSize: 14,
          cursor: "pointer", display: "inline-flex", alignItems: "center",
          justifyContent: "center", gap: 8, font: "inherit",
        }}>
          <Camera size={17} /> Camera
        </button>
      </div>

      <input ref={inputRef} type="file" accept={ACCEPT} hidden
        onChange={(e) => handle(e.target.files?.[0])} />
      {/* `capture` opens the rear camera straight away instead of the gallery. */}
      <input id={`cam-${label}`} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => handle(e.target.files?.[0])} />
    </>
  );
}

/* ------------------------------------------------------------------ main */
export default function UploadScreen({
  exam = "UPSC", paper = "auto", credits = null, mentorCredits = null,
  busy = false, onChangeExam, onChangePaper, onSubmit,
}) {
  // Step 0 is the evaluation mode. It comes FIRST because it decides what the
  // student is buying, how long they wait and what it costs — asking it after
  // the upload had that backwards.
  const [step, setStep] = useState(0);
  const [evalMode, setEvalMode] = useState("ai");
  const [file, setFile] = useState(null);
  const [qpFile, setQpFile] = useState(null);
  const [error, setError] = useState(null);
  const [showQp, setShowQp] = useState(false);

  const papers = PAPERS[exam] || PAPERS.UPSC;

  useEffect(() => {
    // If the paper list changed with the exam, keep the selection valid.
    if (!papers.some(p => p.id === paper)) onChangePaper?.("auto");
  }, [exam]); // eslint-disable-line

  const ready = !!file && !busy;
  const needsAi = evalMode === "ai" || evalMode === "both";
  const needsMentor = evalMode === "mentor" || evalMode === "both";
  const noCredits = (needsAi && credits === 0)
    || (needsMentor && mentorCredits === 0);
  const chosen = MODES.find(m => m.id === evalMode) || MODES[0];

  /* ------------------------------- step 0: how do you want it checked? */
  if (step === 0) {
    return (
      <div style={{ paddingBottom: 104 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Cinzel',Georgia,serif", fontSize: "clamp(22px, 6vw, 30px)",
            fontWeight: 700, color: C.maroon, margin: 0, lineHeight: 1.2,
          }}>How should your copy be checked?</h1>
          <p style={{
            fontSize: 14.5, color: C.inkSoft, margin: "10px auto 0",
            maxWidth: 400, lineHeight: 1.6,
          }}>
            Pick one. You can choose differently for every copy you send.
          </p>
        </div>

        {MODES.map(m => (
          <ModeCard key={m.id} mode={m} active={evalMode === m.id}
            onClick={() => setEvalMode(m.id)} />
        ))}

        {credits != null && (
          <div style={{
            fontSize: 12.5, color: C.inkSoft, textAlign: "center", marginTop: 14,
          }}>
            You have {credits} AI {credits === 1 ? "check" : "checks"}
            {mentorCredits != null && ` and ${mentorCredits} mentor ${mentorCredits === 1 ? "check" : "checks"}`} left.
          </div>
        )}

        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
          background: "rgba(251,243,230,.94)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderTop: `1px solid ${C.creamDeep}`,
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <button onClick={() => setStep(1)} style={{
              width: "100%", minHeight: 54, borderRadius: 14, border: "none",
              font: "inherit", fontWeight: 700, fontSize: 16, color: C.cream,
              cursor: "pointer",
              background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonSoft})`,
              boxShadow: "0 8px 22px rgba(92,15,20,.28)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            }}>
              Continue <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------- step 1: the copy itself */
  return (
    <div style={{ paddingBottom: 104 }}>
      {/* ---- chosen mode, with a way back ---- */}
      <button onClick={() => setStep(0)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px", marginBottom: 18, borderRadius: 12,
        border: `1.5px solid ${C.creamDeep}`, background: C.paper,
        cursor: "pointer", font: "inherit", textAlign: "left", minHeight: 48,
      }}>
        <ChevronLeft size={18} color={C.inkSoft} />
        <chosen.icon size={18} color={C.maroon} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.maroon }}>
            {chosen.title}
          </span>
          <span style={{ fontSize: 12, color: C.inkFaint, display: "block" }}>
            {chosen.tag} — tap to change
          </span>
        </span>
      </button>

      {/* ---- header ---- */}
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: C.goldWash, color: C.maroon, padding: "6px 14px",
          borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 14,
        }}>
          <Zap size={13} /> Checked in about 10 minutes
        </div>
        <h1 style={{
          fontFamily: "'Cinzel',Georgia,serif", fontSize: "clamp(22px, 6vw, 30px)",
          fontWeight: 700, color: C.maroon, margin: 0, lineHeight: 1.2,
        }}>Get your copy checked</h1>
        <p style={{
          fontSize: 14.5, color: C.inkSoft, margin: "10px auto 0",
          maxWidth: 380, lineHeight: 1.6,
        }}>
          Upload your answer copy. You get marks per question, remarks in the
          margin exactly where they belong, and the marked PDF to download.
        </p>
      </div>

      {/* ---- exam ---- */}
      <Field label="Which exam">
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {EXAMS.map(e => (
            <Chip key={e.id} active={exam === e.id} onClick={() => onChangeExam?.(e.id)}>
              {e.label}
            </Chip>
          ))}
        </div>
      </Field>

      {/* ---- paper ---- */}
      <Field label="Which paper"
        note={paper === "auto"
          ? "Vyas will read the printed questions and work out the paper itself. Pick one manually only if it gets it wrong."
          : null}>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {papers.map(p => (
            <Chip key={p.id} active={paper === p.id} hint={p.hint}
              onClick={() => onChangePaper?.(p.id)}>
              {p.label}
            </Chip>
          ))}
        </div>
      </Field>

      {/* ---- answer copy ---- */}
      <Field label="Your answer copy">
        <DropZone
          file={file}
          onPick={(f, err) => { setFile(f); setError(err); }}
          onClear={() => { setFile(null); setError(null); }}
          error={!!error}
          label="Upload your copy"
          sub="PDF or photos · up to 60 MB"
        />
      </Field>

      {/* ---- question paper (optional) ---- */}
      {!showQp ? (
        <button onClick={() => setShowQp(true)} style={{
          width: "100%", minHeight: 48, background: "none", border: "none",
          color: C.maroon, fontWeight: 600, fontSize: 13.5, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, font: "inherit", marginBottom: 8,
        }}>
          My questions are on a separate paper <ChevronRight size={16} />
        </button>
      ) : (
        <Field label="Question paper"
          note="Only needed when your copy has answers but no printed questions.">
          <DropZone
            file={qpFile}
            onPick={(f, err) => { setQpFile(f); setError(err); }}
            onClear={() => setQpFile(null)}
            label="Upload the question paper"
            sub="PDF or photos"
            optional
          />
        </Field>
      )}

      {/* ---- tip ---- */}
      <div style={{
        background: C.goldWash, borderLeft: `4px solid ${C.gold}`,
        borderRadius: "0 12px 12px 0", padding: "13px 15px", marginTop: 6,
        fontSize: 13, color: C.ink, lineHeight: 1.6,
      }}>
        <b style={{ color: C.maroon }}>For the best marking:</b> scan straight,
        in good light, with the whole page in frame. A clear copy is read more
        accurately — and costs less to check.
      </div>

      {/* ---- error ---- */}
      {error && (
        <div style={{
          display: "flex", gap: 9, alignItems: "flex-start", marginTop: 14,
          background: "#FBE6E4", borderRadius: 12, padding: "13px 15px",
        }}>
          <AlertCircle size={17} color={C.bad} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>{error}</span>
        </div>
      )}

      {/* ---- sticky action bar ---- */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
        background: "rgba(251,243,230,.94)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.creamDeep}`,
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {credits != null && (
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12.5, color: C.inkSoft, marginBottom: 9,
            }}>
              <span>{file ? file.name.slice(0, 26) : "No file selected yet"}</span>
              <span style={{ color: noCredits ? C.bad : C.inkSoft, fontWeight: 600 }}>
                {credits} {credits === 1 ? "check" : "checks"} left
              </span>
            </div>
          )}
          <button
            disabled={!ready || noCredits}
            onClick={() => onSubmit?.(file, qpFile, evalMode)}
            style={{
              width: "100%", minHeight: 54, borderRadius: 14, border: "none",
              font: "inherit", fontWeight: 700, fontSize: 16,
              cursor: ready && !noCredits ? "pointer" : "not-allowed",
              color: ready && !noCredits ? C.cream : C.inkFaint,
              background: ready && !noCredits
                ? `linear-gradient(135deg, ${C.maroon}, ${C.maroonSoft})`
                : C.creamDeep,
              boxShadow: ready && !noCredits ? "0 8px 22px rgba(92,15,20,.28)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              transition: "transform .12s ease, box-shadow .12s ease",
            }}
            onPointerDown={(e) => { if (ready) e.currentTarget.style.transform = "scale(.985)"; }}
            onPointerUp={(e) => (e.currentTarget.style.transform = "")}
          >
            {busy ? "Sending…"
              : noCredits ? "Buy checks to continue"
                : !file ? "Upload a copy first"
                  : <>Check my copy <ChevronRight size={19} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
