import React, { useEffect, useState } from "react";
import { api } from "./lib/api";
import { pay } from "./razorpay";

const C = { maroon:"#5C0F14", maroonSoft:"#7A1B22", gold:"#C9A227", goldSoft:"#E0C766",
  cream:"#FBF3E6", creamDeep:"#F3E6CE", ink:"#3A2A22", inkSoft:"#6B5A4E", paper:"#FFFDF8", silver:"#8A9099" };

const TIER = {
  silver:   { accent:"#8A9099", ring:"#C9CDD3", tag:"", bg:"#FFFFFF" },
  gold:     { accent:C.gold, ring:C.goldSoft, tag:"MOST POPULAR", bg:"#FFFDF4" },
  platinum: { accent:C.maroon, ring:C.maroonSoft, tag:"BEST VALUE", bg:"#2A0A0D", dark:true },
};
const FEATURES = {
  silver:   ["Full 100-point rubric + grid", "Red-ink annotated PDF", "Topper-answer benchmarking"],
  gold:     ["Everything in Silver", "Best for weekly practice", "Priority processing"],
  platinum: ["Everything in Gold", "Best value per copy", "Fastest turnaround"],
};

export default function Pricing({ user, onCredited, onClose }) {
  const [packs, setPacks] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/pay/packs").then(d => setPacks(d.packs || [])).catch(e => setErr(e.message));
  }, []);

  const buy = async (p) => {
    setErr(""); setBusy(p.id);
    try {
      const order = await api("/api/pay/order", { method:"POST", body:new URLSearchParams({ pack:p.id }) });
      await pay(order, user,
        async (resp) => {
          try {
            const v = await api("/api/pay/verify", { method:"POST", body:new URLSearchParams({
              order_id: resp.razorpay_order_id, payment_id: resp.razorpay_payment_id, signature: resp.razorpay_signature }) });
            onCredited && onCredited(v.credits);
          } catch(e){ setErr("Verification failed: " + e.message); }
          finally { setBusy(""); }
        },
        (m) => { setErr(m); setBusy(""); });
    } catch(e){ setErr(e.message); setBusy(""); }
  };

  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"28px 20px" }}>
      <div style={{ textAlign:"center", marginBottom:8 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:28, fontWeight:700, color:C.maroon }}>Choose your pack</div>
        <div style={{ color:C.inkSoft, fontSize:15, marginTop:6 }}>Pay once, evaluate that many answer copies. No subscription.</div>
      </div>
      {err && <div style={{ background:"#FCEFE9", color:C.maroon, borderRadius:10, padding:"10px 14px", margin:"14px auto", maxWidth:520, textAlign:"center", fontSize:14 }}>{err}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:20, marginTop:22, alignItems:"stretch" }}>
        {packs.map(p => {
          const t = TIER[p.id] || TIER.silver;
          const per = Math.round(p.price_inr / p.checks);
          const dark = t.dark;
          const popular = p.id === "gold";
          return (
            <div key={p.id} style={{ position:"relative", background:t.bg, border:`2px solid ${t.ring}`,
              borderRadius:20, padding:"26px 22px", display:"flex", flexDirection:"column",
              boxShadow: popular ? "0 18px 44px rgba(201,162,39,0.30)" : "0 8px 24px rgba(92,15,20,0.10)",
              transform: popular ? "translateY(-8px)" : "none", color: dark ? C.cream : C.ink }}>
              {t.tag && <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
                background:t.accent, color: p.id==="platinum"?C.cream:C.maroon, fontWeight:700, fontSize:11,
                letterSpacing:1, padding:"5px 14px", borderRadius:20, whiteSpace:"nowrap" }}>{t.tag}</div>}
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, color: dark?C.goldSoft:t.accent }}>{p.name}</div>
              <div style={{ marginTop:12, display:"flex", alignItems:"baseline", gap:6 }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:40, fontWeight:700 }}>₹{p.price_inr}</span>
                <span style={{ fontSize:14, color: dark?C.goldSoft:C.inkSoft }}>one-time</span>
              </div>
              <div style={{ fontSize:15, fontWeight:600, marginTop:4, color: dark?C.cream:C.ink }}>{p.checks} answer copies</div>
              <div style={{ fontSize:12.5, color: dark?C.goldSoft:C.inkSoft, marginBottom:16 }}>just ₹{per} per copy</div>
              <div style={{ flex:1 }}>
                {(FEATURES[p.id]||[]).map((f,i)=>(
                  <div key={i} style={{ display:"flex", gap:9, marginBottom:10, fontSize:13.5 }}>
                    <span style={{ width:18, height:18, borderRadius:"50%", background:t.accent, color:dark?C.cream:C.maroon, display:"grid", placeItems:"center", flexShrink:0, fontSize:12, fontWeight:800 }}>✓</span>
                    <span style={{ color: dark?"#F0E6D2":C.ink }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>buy(p)} disabled={busy===p.id}
                style={{ marginTop:18, width:"100%", padding:"13px", borderRadius:12, border:"none", cursor:"pointer",
                  fontWeight:700, fontSize:15, background: dark?C.gold:t.accent, color: dark?C.maroon:(p.id==="silver"?"#fff":C.maroon),
                  opacity: busy===p.id?0.7:1 }}>
                {busy===p.id ? "Opening…" : `Buy ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>
      {onClose && <div style={{ textAlign:"center", marginTop:22 }}>
        <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.maroon, fontWeight:600, fontSize:14, cursor:"pointer", textDecoration:"underline" }}>Maybe later</button>
      </div>}
    </div>
  );
}
