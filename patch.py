import sys
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# 1. Add showAnalysis state
content = content.replace('  // ---- Job Polling ----', '  const [showAnalysis, setShowAnalysis] = React.useState(false);\n  // ---- Job Polling ----')

# 2. Reset showAnalysis
content = content.replace('setJobId(null); setApiResult(null); setApiError(null); setApiProgress(null); setPdfDownloadUrl(null);', 'setJobId(null); setApiResult(null); setApiError(null); setApiProgress(null); setPdfDownloadUrl(null); setShowAnalysis(false);')

# 3. Replace result stage UI
res_stage_start = content.find('{/* -------- RESULT -------- */}')
if res_stage_start != -1:
    res_stage_end = content.find('</ErrorBoundary>', res_stage_start)
    
    if res_stage_end != -1:
        new_ui = '''{/* -------- RESULT -------- */}
        {stage === "result" && (
          <div className="fade-in">
            {!showAnalysis ? (
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.gold, display: "grid", placeItems: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(201,162,39,0.3)" }}>
                  <Check size={40} color={C.maroon} strokeWidth={3} />
                </div>
                <h1 style={{ fontFamily: ff.display, fontSize: 28, fontWeight: 700, color: C.maroon, margin: "0 0 12px" }}>
                  Your copy checked successfully!
                </h1>
                
                <div style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 20, padding: "30px", margin: "24px auto", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Medallion value={totalAwarded} max={totalOutOf || marks} marksLabel={t.marksLabel} ff={ff} />
                  <div style={{ fontFamily: ff.display, fontSize: 26, fontWeight: 700, color: C.maroon, marginTop: 16 }}>
                    {activeResult ? `${totalAwarded.toFixed(1)} / ${totalOutOf}` : verdict(S.dimensions.reduce((a, d) => a + d.score, 0) / S.dimensions.length, lang)}
                  </div>
                  <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>Total Score</div>
                </div>

                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
                  <button className="vyas-btn" onClick={() => setShowAnalysis(true)} style={{ ...primaryBtn, padding: "14px 24px" }}>
                    <Sparkles size={18} /> View Detailed Analysis
                  </button>
                  {pdfUrl ? (
                    <button className="vyas-btn" onClick={(e) => {
                      e.preventDefault();
                      fetch(pdfUrl).then(res => res.blob()).then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Vyas_Evaluated_${jobId || 'copy'}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      }).catch(() => window.open(pdfUrl, '_blank'));
                    }} style={{ ...outlineBtn, textDecoration: "none", padding: "14px 24px" }}>
                      <Download size={18} /> {t.downloadPdf}
                    </button>
                  ) : (
                    <button className="vyas-btn" style={{ ...outlineBtn, opacity: 0.5, cursor: "not-allowed", padding: "14px 24px" }}>
                      <Download size={18} /> {t.downloadPdf}
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 24 }}>
                  <button className="vyas-btn" onClick={reset} style={{ background: "transparent", color: C.inkSoft, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    <RotateCcw size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Evaluate Another Copy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 24, gap: 12 }}>
                  <button onClick={() => setShowAnalysis(false)} style={{ background: C.cream, border: "none", width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", color: C.maroon }}>
                    <ArrowRight size={20} style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <h2 style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: C.maroon, margin: 0 }}>Detailed Analysis</h2>
                </div>

                {/* Score Header */}
                <div style={{ background: C.maroon, borderRadius: 20, padding: "28px 24px", display: "flex", gap: 26, alignItems: "center", flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
                  <Medallion value={totalAwarded} max={totalOutOf || marks} marksLabel={t.marksLabel} ff={ff} />
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontFamily: ff.body, fontSize: 12, letterSpacing: 0.5, color: C.goldSoft, fontWeight: 600, marginBottom: 8 }}>{ctxLine}</div>
                    <div style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: C.cream, lineHeight: 1.3, marginBottom: 8 }}>
                      {activeResult ? `${totalAwarded.toFixed(1)} / ${totalOutOf} marks` : verdict(S.dimensions.reduce((a, d) => a + d.score, 0) / S.dimensions.length, lang)}
                    </div>
                    {activeResult && activeResult.booklet_verdict && (
                      <div style={{ fontFamily: ff.body, fontSize: 13.5, color: C.goldSoft }}>{activeResult.booklet_verdict}</div>
                    )}
                    {!activeResult && <div style={{ fontFamily: ff.body, fontSize: 13.5, color: C.goldSoft }}>{S.note.label} <b style={{ color: C.cream }}>{S.note.value}</b> {S.note.explain}</div>}
                  </div>
                </div>

                {/* Macro comments */}
                {activeResult && activeResult.overall_macro_comments && activeResult.overall_macro_comments.length > 0 && (
                  <div style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 16, padding: "20px 22px", marginBottom: 24 }}>
                    <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 700, color: C.maroon, marginBottom: 12 }}>Overall Feedback</div>
                    {activeResult.overall_macro_comments.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.creamDeep, display: "grid", placeItems: "center", flexShrink: 0 }}><Sparkles size={12} color={C.maroon} /></div>
                        <span style={{ fontFamily: ff.body, fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Per-question results */}
                {activeResult && activeQuestions.length > 0 && activeQuestions.map((q, qi) => {
                  const scorePercent = (parseFloat(q.awarded_marks || 0) / (parseFloat(q.max_marks) || 1)) * 100;
                  const borderCol = scorePercent >= 60 ? "#4CAF50" : scorePercent <= 40 ? "#F44336" : C.gold;
                  return (
                    <div key={qi} style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderLeft: `5px solid ${borderCol}`, borderRadius: 16, padding: "20px 22px", marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                        <div style={{ fontFamily: ff.display, fontSize: 17, fontWeight: 700, color: C.maroon }}>Q{q.q_no}</div>
                        <div style={{ fontFamily: ff.display, fontSize: 20, fontWeight: 700, color: borderCol }}>{parseFloat(q.awarded_marks || 0).toFixed(1)} / {q.max_marks}</div>
                      </div>
                      <div style={{ fontFamily: ff.body, fontSize: 13, color: C.ink, marginBottom: 12, lineHeight: 1.5 }}>{q.detected_question}</div>
                      {q.grid && Object.entries(q.grid).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, minWidth: 160, textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                          <span style={{ fontSize: 12.5, color: C.ink }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
              '''
        content = content[:res_stage_start] + new_ui + content[res_stage_end:]

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done injecting React code.')
