import React, { useState } from "react";
import { googleSignIn, emailSignIn, emailSignUp } from "./firebase";
const C = { maroon:"#5C0F14", gold:"#C9A227", cream:"#FBF3E6", creamDeep:"#F3E6CE", ink:"#3A2A22", inkSoft:"#6B5A4E", paper:"#FFFDF8" };

export default function Login(){
  const [mode,setMode]=useState("in"); const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const go=async(fn)=>{ setErr(""); try{ await fn(); }catch(e){ setErr(e.message.replace("Firebase:","").trim()); } };
  return (
    <div style={{ minHeight:"70vh", display:"grid", placeItems:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380, background:C.paper, border:`1.5px solid ${C.creamDeep}`, borderRadius:18, padding:"28px 24px" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:24, fontWeight:700, color:C.maroon, textAlign:"center" }}>Sign in to VYAS</div>
        <div style={{ color:C.inkSoft, fontSize:14, textAlign:"center", margin:"6px 0 18px" }}>Login to evaluate your copies.</div>
        <button onClick={()=>go(googleSignIn)} style={{ width:"100%", padding:"12px", borderRadius:12, border:`1.5px solid ${C.gold}`, background:"#fff", color:C.ink, fontWeight:600, fontSize:15, cursor:"pointer", marginBottom:14 }}>Continue with Google</button>
        <div style={{ textAlign:"center", color:C.inkSoft, fontSize:12, margin:"6px 0" }}>or</div>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
        <input placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={inp}/>
        {err && <div style={{ color:"#C0392B", fontSize:13, margin:"6px 0" }}>{err}</div>}
        <button onClick={()=>go(()=> mode==="in"?emailSignIn(email,pw):emailSignUp(email,pw))}
          style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:C.maroon, color:C.cream, fontWeight:700, fontSize:15, cursor:"pointer", marginTop:8 }}>
          {mode==="in"?"Sign in":"Create account"}
        </button>
        <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:C.inkSoft }}>
          {mode==="in"?"New here? ":"Have an account? "}
          <button onClick={()=>setMode(mode==="in"?"up":"in")} style={{ background:"none", border:"none", color:C.maroon, fontWeight:600, cursor:"pointer" }}>{mode==="in"?"Create account":"Sign in"}</button>
        </div>
      </div>
    </div>
  );
}
const inp = { width:"100%", padding:"11px 13px", borderRadius:10, border:"1.5px solid #E7D9BE", marginBottom:10, fontSize:14, outline:"none", background:"#fff" };
