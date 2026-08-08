/**
 * MatchTheFollowingBox.jsx — renders List-I / List-II questions as two aligned
 * columns instead of one mangled text blob.
 *
 * Expects the question object produced by scripts/clean_questions.py:
 *   {
 *     type: "match",
 *     stem: "Match List-I with List-II ...",
 *     lists: { headers: ["List-I","List-II"],
 *              rows: [ { left: "A. Davis Strait", right: "1. Greenland–Canada" }, ... ] },
 *     display_segments: [...]   // fallback for non-match questions
 *   }
 */
import React from "react";

export default function MatchTheFollowingBox({ question, colors = {} }) {
  const C = {
    text: colors.text || "#2C2C2A",
    textSec: colors.textSec || "#5F5E5A",
    border: colors.border || "#EDE0C8",
    head: colors.maroon || "#7A1F2B",
    headBg: colors.surfaceAlt || "#F5E6D3",
  };

  const q = question || {};
  const lists = q.lists;

  return (
    <div>
      {q.stem && (
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.6, color: C.text, marginBottom: 12 }}>
          {q.stem}
        </div>
      )}

      {lists?.rows?.length ? (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12, border: `1px solid ${C.border}` }}>
          <thead>
            <tr>
              {(lists.headers || ["List-I", "List-II"]).map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "8px 12px", background: C.headBg, color: C.head,
                  fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700,
                  border: `1px solid ${C.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lists.rows.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: "8px 12px", border: `1px solid ${C.border}`, fontFamily: "Inter, sans-serif", fontSize: 14, color: C.text, verticalAlign: "top" }}>{r.left}</td>
                <td style={{ padding: "8px 12px", border: `1px solid ${C.border}`, fontFamily: "Inter, sans-serif", fontSize: 14, color: C.text, verticalAlign: "top" }}>{r.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {/* statement-type questions: one line per segment */}
      {!lists && Array.isArray(q.display_segments) && q.display_segments.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {q.display_segments.map((s, i) => (
            <div key={i} style={{
              fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6,
              color: i === 0 ? C.text : C.textSec, marginBottom: 6,
              paddingLeft: i === 0 ? 0 : 14,
            }}>{s}</div>
          ))}
        </div>
      )}

      {q.tail && (
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.textSec, marginTop: 4 }}>{q.tail}</div>
      )}
    </div>
  );
}
