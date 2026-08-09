import re

file_path = r'C:\Users\jains\.gemini\antigravity-ide\brain\848f4182-6cc0-4dac-83fb-ac8adab8f366\scratch\App_state.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useStickyState hook at the top
sticky_hook = '''
function useStickyState(defaultValue, key) {
  const [value, setValue] = React.useState(() => {
    const stickyValue = window.sessionStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  React.useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
'''
content = content.replace('// ================= Main =================', sticky_hook + '\n// ================= Main =================')

# 2. Replace useState with useStickyState for critical vars
replacements = {
    'const [stage, setStage] = useState("mode");': 'const [stage, setStage] = useStickyState("mode", "vyas_stage");',
    'const [mode, setMode] = useState(null);': 'const [mode, setMode] = useStickyState(null, "vyas_mode");',
    'const [paperId, setPaperId] = useState(null);': 'const [paperId, setPaperId] = useStickyState(null, "vyas_paperId");',
    'const [unitId, setUnitId] = useState(null);': 'const [unitId, setUnitId] = useStickyState(null, "vyas_unitId");',
    'const [apiResult, setApiResult] = useState(null);': 'const [apiResult, setApiResult] = useStickyState(null, "vyas_apiResult");',
    'const [evalTimeTaken, setEvalTimeTaken] = useState(null);': 'const [evalTimeTaken, setEvalTimeTaken] = useStickyState(null, "vyas_evalTimeTaken");',
    'const [pdfDownloadUrl, setPdfDownloadUrl] = useState(null);': 'const [pdfDownloadUrl, setPdfDownloadUrl] = useStickyState(null, "vyas_pdfUrl");'
}
for k, v in replacements.items():
    content = content.replace(k, v)

# 3. Fix history mount logic
history_fix = '''
  useEffect(() => {
    const handlePop = (e) => {
      if (e.state && e.state.stage) setStage(e.state.stage);
      else setStage("mode");
    };
    window.addEventListener("popstate", handlePop);
    // Don't overwrite state on mount if there's already a stage in URL or session
    if (!window.history.state || !window.history.state.stage) {
      window.history.replaceState({ stage: stage }, "", ?stage=);
    }
    return () => window.removeEventListener("popstate", handlePop);
  }, [stage]); // keep it updated, but wait, if it updates it registers multiple event listeners?
'''
# A better version:
history_fix_better = '''
  useEffect(() => {
    const handlePop = (e) => {
      if (e.state && e.state.stage) setStage(e.state.stage);
      else setStage("mode");
    };
    window.addEventListener("popstate", handlePop);
    const currStage = window.sessionStorage.getItem("vyas_stage") ? JSON.parse(window.sessionStorage.getItem("vyas_stage")) : "mode";
    if (!window.history.state || !window.history.state.stage) {
      window.history.replaceState({ stage: currStage }, "", ?stage=);
    }
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
'''

# Find the old history mount and replace
old_history = '''
  useEffect(() => {
    const handlePop = (e) => {
      if (e.state && e.state.stage) setStage(e.state.stage);
      else setStage("mode");
    };
    window.addEventListener("popstate", handlePop);
    window.history.replaceState({ stage: "mode" }, "", "?stage=mode");
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
'''
content = content.replace(old_history.strip(), history_fix_better.strip())

# 4. Add a Back button inside History section
old_history_header = '''
        {/* -------- HISTORY -------- */}
        {showHistory && (
          <div className="fade-in" style={{ background: C.paper, borderRadius: 24, padding: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", marginBottom: 32, border: 1px solid 44 }}>
            <h2 style={{ color: C.maroon, marginTop: 0 }}>My Submissions</h2>
'''
new_history_header = '''
        {/* -------- HISTORY -------- */}
        {showHistory && (
          <div className="fade-in" style={{ background: C.paper, borderRadius: 24, padding: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", marginBottom: 32, border: 1px solid 44 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: C.maroon, margin: 0 }}>My Submissions</h2>
              <button onClick={() => setShowHistory(false)} className="vyas-btn" style={{ background: "transparent", border: 1.5px solid 55, color: C.maroon, borderRadius: 20, padding: "6px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Close History ✕</button>
            </div>
'''
content = content.replace(old_history_header.strip(), new_history_header.strip())

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File modified!")
