import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vlozweneunzfunxyuxbr.supabase.co",
  "sb_publishable_KXTz86kVA9JlXxMzt_z_vg_47Uf72aH"
);

const T = {
  bg: "#1a1a1a", surface: "#262626", border: "#383838", borderLight: "#2e2e2e",
  text: "#ececec", textMuted: "#8a8a8a", textFaint: "#555",
  accent: "#cc785c", accentBg: "rgba(204,120,92,0.12)", accentBorder: "rgba(204,120,92,0.35)",
  font: "-apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'SF Mono', 'Fira Code', monospace",
};

const TYPE_STYLES = {
  Praise:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)"  },
  Worship: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)"  },
  Anthem:  { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.35)" },
};
const TYPE_ORDER = ["Praise", "Worship", "Anthem"];
const CORRECT_PIN = "1603";
const PIN_KEY = "setlist-unlocked";
const SETLIST_KEYS_KEY = "setlist-key-overrides";
const TYPES = ["Praise","Worship","Anthem"];
const CHROMATIC = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
const KEY_TO_IDX = {C:0,Db:1,"C#":1,D:2,Eb:3,"D#":3,E:4,F:5,"F#":6,Gb:6,G:7,Ab:8,"G#":8,A:9,Bb:10,"A#":10,B:11};
const DEGREE_ST = {1:0,2:2,3:4,4:5,5:7,6:9,7:11};
const NATURAL_KEYS = ["A","B","C","D","E","F","G"];
const SHARP_MAP = { A:"A#", B:"C", C:"C#", D:"D#", E:"F", F:"F#", G:"G#" };
const FLAT_MAP  = { A:"Ab", B:"Bb", C:"Db", D:"Eb", E:"Eb", F:"Gb", G:"Ab" };
const NO_SHARP  = new Set(["E","B"]);
const NO_FLAT   = new Set(["C","F"]);

function getNatural(key) { if(!key) return "C"; return key.length===1?key:key[0]; }
function getModifier(key) {
  if(!key||key.length===1) return null;
  if(key.includes("#")) return "#";
  if(key.includes("b")||key.includes("♭")) return "b";
  return null;
}

const DEFAULT_SONGS = [{"id":3847788,"title":"Agnus Dei","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse 1\n\n| 1 |\n\nChorus\n\n| 1 |\n\n| 4 | 1 | 6m | 5 |\n\n| 4 |"},{"id":2812383,"title":"All Hail King Jesus","key":"E","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 1 | 6m | 5 | 4 |\n\nPre-Chorus\n\n| 2m | 6m | 5 |\n\n| 1 | 3m | 4 |\n\nChorus\n\n| 1 | 1sus |\n\n| 1 | 1sus | 3m | 6m |\n\n| 4 |\n\n| 1/3 | 5 | 1 |\n\nBridge\n\n| 5 | 6m | 4 | 1 | 1/3 |"},{"id":5390733,"title":"Because Of Christ","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 1/3 | 1 |\n\n| 5 | 6m |\n\n| 4 | 1 |\n\n| 6m | 5 |\n\nChorus\n\n| 4 |\n\n| 1sus | 1 |\n\n| 1/5 | 5 |\n\n| 6m | 5 |\n\nBridge\n\n| 1 | 4/1 | 1 |\n\n| 6m/1 | 5/1 |"},{"id":716362,"title":"Bless God","key":"D","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 1 | 2m | 4 | 1 | 6m | 5 |\n\nChorus\n\n| 1 | 2m | 4 |\n\n| 6m | 4 | 5 |\n\nBridge\n\n| 1/3 | 2m | 4 | 6m | 5 |"},{"id":4535294,"title":"Blood Of Jesus","key":"G","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4/1 |\n\n| 5 | 4 | 1 |\n\n| 6m | 5 | 1 |\n\nchorus\n\n| 4 | 1 | 5 |\n\n| 6m | 4 |\n\n| 1 | 5 |\n\nbridge\n\n| 1 | 5 | 6m | 4 |"},{"id":3375914,"title":"Center","key":"A","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4 | 6m | 4 |\n\nchorus\n\n| 4 | 6m | 1 | 5 |\n\n| 3m | 6m | 4 | 5 |\n\nbridge\n\n| 4 | 5 | 6m | 3m |"},{"id":8199008,"title":"FREE!","key":"A","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| Am | Dm | F | E/B |\n\nPre Chorus\n\n| Am | Dm | F | E/G# |\n\nChorus\n\n| F | Dm | C | E |\n\nBridge\n\nAm"},{"id":2724960,"title":"Fall Like Rain","key":"E","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 5/7 | 6 | 4 |\n\nChorus\n\n| 1 | 5/7 | 6 | 1/3 |\n\nBridge\n\n| 1 | 2 | 1/3 | 4 |"},{"id":2861416,"title":"Give Me Jesus","key":"F","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4/6 | 2 | 1/3 | 4 |\n\nchorus\n\n| 1 | 5 | 2 | 6 | 4 | 5 |\n\nbridge\n\n| 1/3 | 4 | 6 | 5 |"},{"id":6169345,"title":"Gratitude","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 6m | 5 | 4 |\n\nChorus\n\n| 1 | 5 |\n\n| 4 | 6m | 5 | 1 |\n\nBridge\n\n| 1 | 5 | 4 |\n\n| 6m | 5 |"},{"id":2334879,"title":"Great Are You Lord","key":"C","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 4 | 6m | 5 |\n\nchorus\n\n| 4 | 6m | 5 |\n\nbridge\n\n| 1 | 4 | 4 | 1 |"},{"id":1736063,"title":"Heart of Worship","key":"","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 5 | 2m | 5 |\n\nPre Chorus\n\n| 2m | 1/3 | 5 |\n\nChorus\n\n| 1 | 5/7 |\n\n| 2m | 4 | 5 | 1 |"},{"id":3866966,"title":"Holy Forever","key":"F","tempo":"","note":"","type":"Anthem","chart":"Verse\n\n| 1 | 4 | 1 |\n\n| 6m | 5 | 4 |\n\nChorus\n\n| 4 | 6m | 5 |\n\n| 1/3 | 6m |\n\n| 2m | 5 |\n\n| 1 | 1sus | 1 |\n\nTag\n\n| 2m | 5 |\n\n| 1 | 1sus | 1 |"},{"id":1203969,"title":"I Speak Jesus","key":"D","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 6m | 4 | 1 |\n\nchorus\n\n| 5 | 1 | 4 | 1 |\n\nbridge\n\n| 1 |\n\n| 6m |\n\n| 4 |\n\n| 1 |"},{"id":7595253,"title":"I Thank God","key":"C","tempo":"","note":"","type":"Praise","chart":"verse\n\n| 1 | 4 |\n\npre chorus\n\n| 5 | 6m | 4 | 1 |\n\n| 5 | 6m | 4 |\n\nchorus\n\n| 1 | 2m | 1 | 4 |\n\n| 6m | 4 |\n\nbridge\n\n| 1 |\n\n| 5 | 6m | 4 | 1 |"},{"id":5798964,"title":"I Will Exalt You","key":"B","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 5/7 | 1 | 1/3 | 4 |\n\n| 5sus | 1 |\n\nchorus\n\n| 5 | 2m | 5/7 | 1 |\n\n| 5 | 2m | 1 | 4 | 6m | 5 |"},{"id":4935454,"title":"Inhabit","key":"F","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4 | 6m | 5 | 4 |\n\nchorus\n\n| 1 | 4 | 5 | 4 |\n\nbridge\n\n| 1 | 1sus | 6m | 4 |"},{"id":9543310,"title":"Jesus Have It All","key":"F","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 5 | 2m | 4 | 1 |\n\nchorus\n\n| 4 | 6m | 5 | 2m |\n\n| 4 | 6m | 5 | 4 |\n\nbridge\n\n| 4 | 6m | 5 | 2m |"},{"id":9198043,"title":"Lord Send Revival","key":"D","tempo":"","note":"","type":"Anthem","chart":"Verse / Chorus / Bridge\n\n| 4 | 1 | 5 |"},{"id":5525138,"title":"Make Room","key":"F","tempo":"","note":"","type":"Worship","chart":"verse / chorus / bridge\n\n| 1 | 5 | 2m | 4 |"},{"id":4788614,"title":"Name Above All Names","key":"D","tempo":"","note":"","type":"Anthem","chart":"Verse\n\n| 4 | 1 | 5 x3 |\n\n| 6 | 6m | 5 |\n\nChorus\n\n| 1 | 4 | 6m | 5 |\n\nBridge\n\n| 4 | 6m | 1 | 3 |\n\n| 4 | 6m | 1 | 5 |"},{"id":8174699,"title":"No One Else","key":"F","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 2m | 4 | 5sus | 5 |\n\nChorus\n\n| 1/3 | 4 | 5 |\n\nBridge\n\n| 4 | 5 | 6m | 5 |"},{"id":8102927,"title":"No One Like The Lord","key":"E","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 6m | 4 | 1 | 3m |\n\n| 6m | 2m | 1 | 5 |\n\nChorus\n\n| 6m | 5/7 | 1 | 2m | 4 |\n\n| 5 | 6m |\n\nBridge\n\n| 6m |\n\n| 4 | 5 | 6m |"},{"id":3242609,"title":"O Praise the Name","key":"G","tempo":"","note":"","type":"Anthem","chart":"chorus\n\n| 1 | 4 | 1 | 6 | 5 |\n\n| 1/3 | 4 | 6 | 5 | 4 | 1 |"},{"id":3323754,"title":"Open the eyes of my heart","key":"","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 5 | 2m | 1 |\n\nChorus\n\n| 5 | 4 |\n\n| 1 | 5 |\n\n| 6m | 4 |\n\n| 1 | 5 |"},{"id":166542,"title":"Thank God I'm Free","key":"E","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 1/3 | 4 | 1 |\n\n| 6m | 5 | 4 |\n\nchorus\n\n| 1/3 | 4 | 1 |\n\n| 6m | 5 | 4 |\n\nBridge\n\n| 5/7 | 1 | 4 |"},{"id":7544044,"title":"Til The Walls Come Down","key":"D","tempo":"","note":"","type":"Anthem","chart":"Verse\n\n| 6 | 4 | 1 | 3 |\n\nBridge\n\n| 6 |\n\n| 4 | 6m | 5 | 2m | 1 |"},{"id":442544,"title":"Washed","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1/3 | 4 | 5/7 | 6m |\n\nChorus\n\n| 1 | 4 | 6m | 5 |\n\nBridge\n\n| 1 | 4 | 6m | 4 |"},{"id":634525,"title":"What A God","key":"G","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 6m | 5 |\n\n| 4 | 1/3 | 5 |\n\nChorus\n\n| 4 | 5 | 6m | 1/3 |\n\nBridge\n\n| 4 | 5 | 6m | 1/3 |"},{"id":6619951,"title":"What a beautiful name","key":"D","tempo":"","note":"","type":"Anthem","chart":"Chorus\n\n| 1 | 5 |\n\n| 6m | 5 | 4 |\n\n| 1/3 | 5 |\n\n| 6m | 5 | 4 |\n\nBridge\n\n| 4 | 5 | 6m | 1/3 |\n\n| 4 | 5 | 6m | 5 |"},{"id":5154995,"title":"Who Else","key":"G","tempo":"","note":"","type":"Praise","chart":"verse\n\n| 1 | 5 | 6m | 5 | 4 |\n\nchorus\n\n| 1 | 2m | 6m | 4 |\n\nbridge\n\n| 4 | 5 | 6m | 1 | 5 |"}];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatChart(text) {
  return (text||"").split("\n").map((line,i) => {
    const t=line.trim();
    const isHeader=t.match(/^[A-Z][A-Za-z0-9 /()]+$/)&&!t.includes("|")&&t.length<40&&!/^\d/.test(t);
    return {type:isHeader?"header":t.includes("|")?"bars":"text",content:t,id:i};
  });
}
function transposeCell(cell,key) {
  const root=KEY_TO_IDX[key]; if(root===undefined) return cell;
  return cell.replace(/\b(\d)(m|sus|maj|dim|aug|add\d*)?(\/(\d)(m|sus)?)?/g,(_,deg,mod,slash,bd,bm)=>{
    const s=DEGREE_ST[+deg]; if(s===undefined) return _;
    const ch=CHROMATIC[(root+s)%12]+(mod||"");
    if(slash&&bd){const bs=DEGREE_ST[+bd];return bs===undefined?ch+slash:ch+"/"+CHROMATIC[(root+bs)%12]+(bm||"");}
    return ch;
  });
}
function transposeLine(line,key) {
  if(!line||!line.includes("|")) return line;
  return line.split("|").map((seg,i,arr)=>i===0||i===arr.length-1?seg:" "+transposeCell(seg.trim(),key)+" ").join("|");
}
function fmtTime(iso) {
  if(!iso) return ""; const d=new Date(iso);
  return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
}

// ─── Supabase ─────────────────────────────────────────────────────────────────
async function fetchFromCloud() {
  const [{data:sd},{data:sl}]=await Promise.all([
    supabase.from("songs").select("id,data").order("id"),
    supabase.from("setlist").select("song_ids,updated_at").eq("id","main").single(),
  ]);
  return {
    songs:sd?sd.map(r=>({id:r.id,...r.data})):null,
    setlist:sl?{ids:sl.song_ids,updatedAt:sl.updated_at}:null,
  };
}
async function pushSongs(songs) {
  const rows=songs.map(s=>({id:s.id,data:{title:s.title,key:s.key,tempo:s.tempo,note:s.note,type:s.type,chart:s.chart}}));
  const {error}=await supabase.from("songs").upsert(rows,{onConflict:"id"});
  if(error){console.error("pushSongs error:",error);throw error;}
  const {data:existing}=await supabase.from("songs").select("id");
  if(existing){const ids=songs.map(s=>s.id);const del=existing.map(r=>r.id).filter(id=>!ids.includes(id));if(del.length) await supabase.from("songs").delete().in("id",del);}
}
async function pushSetlist(ids) {
  await supabase.from("setlist").upsert({id:"main",song_ids:ids,updated_at:new Date().toISOString()},{onConflict:"id"});
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle={width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.text,fontSize:"16px",fontFamily:T.font,boxSizing:"border-box",outline:"none"};

// ─── Key Picker ───────────────────────────────────────────────────────────────
function KeyPicker({value,onChange}) {
  const natural=getNatural(value), modifier=getModifier(value);
  const selectNatural=n=>{
    if(modifier==="#"&&!NO_SHARP.has(n)) onChange(SHARP_MAP[n]);
    else if(modifier==="b"&&!NO_FLAT.has(n)) onChange(FLAT_MAP[n]);
    else onChange(n);
  };
  const toggleMod=mod=>{
    if(mod==="#"){if(modifier==="#")onChange(natural);else if(!NO_SHARP.has(natural))onChange(SHARP_MAP[natural]);}
    else{if(modifier==="b")onChange(natural);else if(!NO_FLAT.has(natural))onChange(FLAT_MAP[natural]);}
  };
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:8}}>
        {NATURAL_KEYS.map(n=><button key={n} onClick={()=>selectNatural(n)} style={{padding:"9px 4px",borderRadius:8,border:`1px solid ${natural===n?T.accent:T.border}`,background:natural===n?T.accentBg:T.bg,color:natural===n?T.accent:T.text,fontSize:16,fontWeight:natural===n?700:400,cursor:"pointer",fontFamily:T.mono}}>{n}</button>)}
      </div>
      <div style={{display:"flex",gap:8}}>
        {["#","b"].map(mod=>{const dis=mod==="#"?NO_SHARP.has(natural):NO_FLAT.has(natural);const act=mod==="#"?modifier==="#":modifier==="b";return<button key={mod} onClick={()=>toggleMod(mod)} disabled={dis} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${act?T.accent:T.border}`,background:act?T.accentBg:T.bg,color:dis?T.textFaint:act?T.accent:T.textMuted,fontSize:16,cursor:dis?"default":"pointer",fontFamily:T.mono}}>{mod==="#"?"♯ Sharp":"♭ Flat"}</button>;})}
      </div>
      <div style={{textAlign:"center",marginTop:10,fontSize:13,color:T.textMuted,fontFamily:T.mono}}>Selected: <span style={{color:T.accent,fontWeight:700}}>{value||"—"}</span></div>
    </div>
  );
}

function LiveKeyPicker({value,onChange}) {
  const natural=getNatural(value),modifier=getModifier(value);
  const selectNatural=n=>{
    if(modifier==="#"&&!NO_SHARP.has(n))onChange(SHARP_MAP[n]);
    else if(modifier==="b"&&!NO_FLAT.has(n))onChange(FLAT_MAP[n]);
    else onChange(n);
  };
  const toggleMod=mod=>{
    if(mod==="#"){if(modifier==="#")onChange(natural);else if(!NO_SHARP.has(natural))onChange(SHARP_MAP[natural]);}
    else{if(modifier==="b")onChange(natural);else if(!NO_FLAT.has(natural))onChange(FLAT_MAP[natural]);}
  };
  return (
    <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:300,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:12,minWidth:260,boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:8}}>
        {NATURAL_KEYS.map(n=><button key={n} onClick={()=>selectNatural(n)} style={{padding:"7px 2px",borderRadius:7,border:`1px solid ${natural===n?T.accent:T.border}`,background:natural===n?T.accentBg:T.bg,color:natural===n?T.accent:T.text,fontSize:14,fontWeight:natural===n?700:400,cursor:"pointer",fontFamily:T.mono}}>{n}</button>)}
      </div>
      <div style={{display:"flex",gap:6}}>
        {["#","b"].map(mod=>{const dis=mod==="#"?NO_SHARP.has(natural):NO_FLAT.has(natural);const act=mod==="#"?modifier==="#":modifier==="b";return<button key={mod} onClick={()=>toggleMod(mod)} disabled={dis} style={{flex:1,padding:"6px",borderRadius:7,border:`1px solid ${act?T.accent:T.border}`,background:act?T.accentBg:T.bg,color:dis?T.textFaint:act?T.accent:T.textMuted,fontSize:14,cursor:dis?"default":"pointer",fontFamily:T.mono}}>{mod==="#"?"♯ Sharp":"♭ Flat"}</button>;})}
      </div>
      <div style={{textAlign:"center",marginTop:8,fontSize:12,color:T.accent,fontFamily:T.mono,fontWeight:700}}>{value||"—"}</div>
    </div>
  );
}

// ─── PIN ──────────────────────────────────────────────────────────────────────
function PinScreen({onUnlock}) {
  const [pin,setPin]=useState(""); const [shake,setShake]=useState(false);
  const tap=d=>{if(pin.length>=4)return;const next=pin+d;setPin(next);if(next.length===4){if(next===CORRECT_PIN){localStorage.setItem(PIN_KEY,"1");onUnlock();}else{setShake(true);setTimeout(()=>{setPin("");setShake(false);},600);}}};
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,paddingTop:"env(safe-area-inset-top)"}}>
      <div style={{marginBottom:32,textAlign:"center"}}><div style={{fontSize:22,fontWeight:600,color:T.text}}>Setlist</div><div style={{fontSize:13,color:T.textMuted,marginTop:4}}>Enter PIN to continue</div></div>
      <div style={{display:"flex",gap:16,marginBottom:40,animation:shake?"shake 0.5s ease":"none"}}>{[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<pin.length?T.accent:"transparent",border:`2px solid ${i<pin.length?T.accent:T.border}`,transition:"all 0.15s"}}/>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:12}}>{[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((d,i)=>d===null?<div key={i}/>:<button key={i} onClick={()=>d==="⌫"?setPin(p=>p.slice(0,-1)):tap(String(d))} style={{width:72,height:72,borderRadius:"50%",background:d==="⌫"?"transparent":T.surface,border:`1px solid ${d==="⌫"?"transparent":T.border}`,color:T.text,fontSize:d==="⌫"?22:24,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{d}</button>)}</div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ─── ChartLine ────────────────────────────────────────────────────────────────
function ChartLine({line}) {
  if(!line.content) return <div style={{height:6}}/>;
  if(line.type==="header") return <div style={{fontSize:10,letterSpacing:"0.12em",color:T.accent,fontFamily:T.mono,fontWeight:600,marginTop:14,marginBottom:5,textTransform:"uppercase"}}>{line.content}</div>;
  if(line.type==="bars"){
    const cells=line.content.split("|").map(c=>c.trim()).filter(Boolean);
    return <div style={{display:"flex",gap:4,marginBottom:4,flexWrap:"wrap"}}>{cells.map((cell,i)=><div key={i} style={{background:cell==="—"||cell==="-"?"transparent":T.accentBg,border:`1px solid ${cell==="—"||cell==="-"?T.borderLight:T.accentBorder}`,borderRadius:6,padding:"5px 6px",fontFamily:T.mono,fontSize:13,fontWeight:700,color:cell==="—"||cell==="-"?T.textFaint:T.accent,minWidth:28,textAlign:"center",flex:"1 1 auto",maxWidth:60}}>{cell}</div>)}</div>;
  }
  return <div style={{color:T.textMuted,fontFamily:T.mono,fontSize:13}}>{line.content}</div>;
}

// ─── SongCard — library ───────────────────────────────────────────────────────
function SongCard({song,inSetlist,onToggle,onPreview,onEdit}) {
  const ts=TYPE_STYLES[song.type]||{};
  return (
    <div style={{background:inSetlist?T.accentBg:T.surface,border:`1px solid ${inSetlist?T.accentBorder:T.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>onPreview(song)}>
        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
          <div style={{fontSize:15,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{song.title}</div>
          {song.type&&<span style={{fontSize:10,color:ts.color,background:ts.bg,border:`1px solid ${ts.border}`,borderRadius:4,padding:"1px 6px",fontFamily:T.mono,flexShrink:0}}>{song.type}</span>}
        </div>
        <div style={{fontSize:12,color:T.textMuted,fontFamily:T.mono,marginTop:2}}>{song.key?song.key:"No key"}{song.tempo?` · ${song.tempo}`:""}{song.note?` · ${song.note}`:""}</div>
      </div>
      <button onClick={()=>onEdit(song)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,color:T.textMuted,padding:"5px 9px",cursor:"pointer",fontSize:12,flexShrink:0}}>Edit</button>
      <div onClick={()=>onToggle(song.id)} style={{width:28,height:28,borderRadius:"50%",background:inSetlist?T.accent:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:inSetlist?"#fff":T.textMuted,flexShrink:0,cursor:"pointer"}}>{inSetlist?"✓":"+"}</div>
    </div>
  );
}

// ─── Drag-to-reorder setlist ──────────────────────────────────────────────────
const ITEM_HEIGHT = 70; // approximate row height in px

function DraggableSetlist({songs,setlistKeyOverrides,onSetlistKeyChange,onRemove,onReorder,onTapToPlay}) {
  const [order,setOrder]=useState(()=>songs.map((_,i)=>i));
  const [dragging,setDragging]=useState(null); // {idx, startY, currentY}
  const [dragY,setDragY]=useState(0);
  const containerRef=useRef(null);
  const longPressTimer=useRef(null);
  const scrollTimer=useRef(null);

  // Keep order in sync if songs change from outside
  useEffect(()=>{setOrder(songs.map((_,i)=>i));},[songs.length]);

  const orderedSongs=order.map(i=>songs[i]);

  const getTargetIndex=(currentY)=>{
    if(!containerRef.current) return dragging.idx;
    const rect=containerRef.current.getBoundingClientRect();
    const relY=currentY-rect.top+containerRef.current.scrollTop;
    const idx=Math.round(relY/ITEM_HEIGHT);
    return Math.max(0,Math.min(songs.length-1,idx));
  };

  const reorderPreview=(targetIdx)=>{
    if(targetIdx===dragging.idx) return;
    const newOrder=[...order];
    const [removed]=newOrder.splice(dragging.idx,1);
    newOrder.splice(targetIdx,0,removed);
    setOrder(newOrder);
    setDragging(d=>({...d,idx:targetIdx}));
  };

  const startDrag=(songIdx,clientY)=>{
    setDragging({idx:songIdx,startY:clientY,currentY:clientY});
    setDragY(0);
    if(navigator.vibrate) navigator.vibrate(30);
  };

  const onTouchStart=(songIdx,e)=>{
    const clientY=e.touches[0].clientY;
    longPressTimer.current=setTimeout(()=>startDrag(songIdx,clientY),400);
  };
  const onTouchMove=e=>{
    if(!dragging){clearTimeout(longPressTimer.current);return;}
    e.preventDefault();
    const clientY=e.touches[0].clientY;
    const dy=clientY-dragging.startY;
    setDragY(dy);
    setDragging(d=>({...d,currentY:clientY}));
    const target=getTargetIndex(clientY);
    reorderPreview(target);
    // Auto-scroll
    if(!containerRef.current) return;
    const rect=containerRef.current.getBoundingClientRect();
    if(clientY>rect.bottom-60) containerRef.current.scrollTop+=6;
    else if(clientY<rect.top+60) containerRef.current.scrollTop-=6;
  };
  const onTouchEnd=()=>{
    clearTimeout(longPressTimer.current);
    if(dragging){
      onReorder(order.map(i=>songs[i].id));
      setDragging(null);
      setDragY(0);
    }
  };
  const onMouseDown=(songIdx,e)=>{
    longPressTimer.current=setTimeout(()=>startDrag(songIdx,e.clientY),400);
  };
  const onMouseMove=useCallback(e=>{
    if(!dragging){clearTimeout(longPressTimer.current);return;}
    const dy=e.clientY-dragging.startY;
    setDragY(dy);
    setDragging(d=>({...d,currentY:e.clientY}));
    const target=getTargetIndex(e.clientY);
    reorderPreview(target);
    if(!containerRef.current) return;
    const rect=containerRef.current.getBoundingClientRect();
    if(e.clientY>rect.bottom-60) containerRef.current.scrollTop+=6;
    else if(e.clientY<rect.top+60) containerRef.current.scrollTop-=6;
  },[dragging,order]);
  const onMouseUp=useCallback(()=>{
    clearTimeout(longPressTimer.current);
    if(dragging){onReorder(order.map(i=>songs[i].id));setDragging(null);setDragY(0);}
  },[dragging,order,songs]);

  useEffect(()=>{
    window.addEventListener("mousemove",onMouseMove);
    window.addEventListener("mouseup",onMouseUp);
    return()=>{window.removeEventListener("mousemove",onMouseMove);window.removeEventListener("mouseup",onMouseUp);};
  },[onMouseMove,onMouseUp]);

  return (
    <div ref={containerRef} style={{position:"relative"}}>
      {orderedSongs.map((song,visualIdx)=>{
        const isDragged=dragging&&dragging.idx===visualIdx;
        const keyOverride=setlistKeyOverrides[song.id];
        const displayKey=keyOverride||song.key||"";
        const origKey=song.key||"";
        const hasOverride=keyOverride&&keyOverride!==origKey;
        return (
          <SetlistDragItem
            key={song.id}
            song={song}
            index={visualIdx}
            total={songs.length}
            isDragged={isDragged}
            dragY={isDragged?dragY:0}
            displayKey={displayKey}
            origKey={origKey}
            hasOverride={hasOverride}
            keyOverride={keyOverride}
            onSetlistKeyChange={onSetlistKeyChange}
            onRemove={onRemove}
            onTapToPlay={()=>onTapToPlay(visualIdx)}
            onTouchStart={e=>onTouchStart(visualIdx,e)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={e=>onMouseDown(visualIdx,e)}
            draggingActive={!!dragging}
          />
        );
      })}
    </div>
  );
}

function SetlistDragItem({song,index,total,isDragged,dragY,displayKey,origKey,hasOverride,keyOverride,onSetlistKeyChange,onRemove,onTapToPlay,onTouchStart,onTouchMove,onTouchEnd,onMouseDown,draggingActive}) {
  const [showKeyPicker,setShowKeyPicker]=useState(false);

  const handleKeyChange=k=>{onSetlistKeyChange(song.id,k);setShowKeyPicker(false);};

  return (
    <div
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      style={{
        position:"relative",
        marginBottom:7,
        transform:isDragged?`translateY(${dragY}px) scale(1.03) rotate(${dragY>0?0.5:-0.5}deg)`:"translateY(0) scale(1) rotate(0deg)",
        transition:isDragged?"none":"transform 0.25s cubic-bezier(0.25,1,0.5,1)",
        zIndex:isDragged?100:1,
        willChange:"transform",
      }}
    >
      <div style={{
        background:T.surface,
        border:`1px solid ${T.border}`,
        borderRadius:10,
        padding:"11px 13px",
        display:"flex",
        alignItems:"center",
        gap:10,
        boxShadow:isDragged?"0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)":"none",
        transition:isDragged?"none":"box-shadow 0.25s ease",
        cursor:isDragged?"grabbing":"grab",
      }}>
        {/* Drag handle */}
        <div style={{color:T.textFaint,fontSize:16,flexShrink:0,paddingRight:2,userSelect:"none",cursor:draggingActive&&isDragged?"grabbing":"grab"}}>⠿</div>
        <div style={{color:T.accent,fontFamily:T.mono,fontSize:13,width:20,textAlign:"center",flexShrink:0}}>{index+1}</div>

        {/* Song info — tap to play */}
        <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>!draggingActive&&onTapToPlay()}>
          <div style={{fontSize:14,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{song.title}</div>
          <div style={{fontSize:11,color:T.textMuted,fontFamily:T.mono,marginTop:2,display:"flex",alignItems:"center",gap:6}}>
            {song.note?song.note:""}
          </div>
        </div>

        {/* Key override picker */}
        <div style={{position:"relative",flexShrink:0}}>
          <button
            onClick={e=>{e.stopPropagation();setShowKeyPicker(p=>!p);}}
            style={{
              background:hasOverride?T.accentBg:"rgba(255,255,255,0.05)",
              border:`1px solid ${hasOverride?T.accentBorder:T.border}`,
              borderRadius:7,
              padding:"4px 10px",
              color:hasOverride?T.accent:T.textMuted,
              fontSize:13,
              fontFamily:T.mono,
              cursor:"pointer",
              fontWeight:hasOverride?700:400,
              display:"flex",
              alignItems:"center",
              gap:5,
            }}
          >
            {displayKey||"?"}
            {hasOverride&&<span style={{fontSize:10,color:T.textFaint}}>({origKey})</span>}
            <span style={{fontSize:10,opacity:0.6}}>▾</span>
          </button>
          {showKeyPicker&&(
            <>
              <div onClick={()=>setShowKeyPicker(false)} style={{position:"fixed",inset:0,zIndex:200}}/>
              <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:300,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:12,minWidth:260,boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:8}}>
                  {NATURAL_KEYS.map(n=>{
                    const nat=getNatural(displayKey),mod=getModifier(displayKey);
                    const isActive=nat===n;
                    return<button key={n} onClick={()=>{
                      const mod2=getModifier(displayKey);
                      if(mod2==="#"&&!NO_SHARP.has(n))handleKeyChange(SHARP_MAP[n]);
                      else if(mod2==="b"&&!NO_FLAT.has(n))handleKeyChange(FLAT_MAP[n]);
                      else handleKeyChange(n);
                    }} style={{padding:"7px 2px",borderRadius:7,border:`1px solid ${isActive?T.accent:T.border}`,background:isActive?T.accentBg:T.bg,color:isActive?T.accent:T.text,fontSize:14,fontWeight:isActive?700:400,cursor:"pointer",fontFamily:T.mono}}>{n}</button>;
                  })}
                </div>
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  {["#","b"].map(mod=>{
                    const nat=getNatural(displayKey),curMod=getModifier(displayKey);
                    const dis=mod==="#"?NO_SHARP.has(nat):NO_FLAT.has(nat);
                    const act=mod==="#"?curMod==="#":curMod==="b";
                    return<button key={mod} onClick={()=>{
                      const nat2=getNatural(displayKey),curMod2=getModifier(displayKey);
                      if(mod==="#"){if(curMod2==="#")handleKeyChange(nat2);else if(!NO_SHARP.has(nat2))handleKeyChange(SHARP_MAP[nat2]);}
                      else{if(curMod2==="b")handleKeyChange(nat2);else if(!NO_FLAT.has(nat2))handleKeyChange(FLAT_MAP[nat2]);}
                    }} disabled={dis} style={{flex:1,padding:"6px",borderRadius:7,border:`1px solid ${act?T.accent:T.border}`,background:act?T.accentBg:T.bg,color:dis?T.textFaint:act?T.accent:T.textMuted,fontSize:14,cursor:dis?"default":"pointer",fontFamily:T.mono}}>{mod==="#"?"♯ Sharp":"♭ Flat"}</button>;
                  })}
                </div>
                {/* Reset to original */}
                {hasOverride&&<button onClick={()=>handleKeyChange(origKey)} style={{width:"100%",background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"6px",color:T.textMuted,fontSize:12,cursor:"pointer",fontFamily:T.mono}}>Reset to {origKey}</button>}
                <div style={{textAlign:"center",marginTop:8,fontSize:12,color:T.accent,fontFamily:T.mono,fontWeight:700}}>{displayKey||"—"}</div>
              </div>
            </>
          )}
        </div>

        {/* Remove */}
        <button onClick={e=>{e.stopPropagation();onRemove(song.id);}} style={{background:"none",border:"none",color:T.textFaint,fontSize:18,cursor:"pointer",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
      </div>
    </div>
  );
}

// ─── SongModal ────────────────────────────────────────────────────────────────
function SongModal({existing,onClose,onSave,onDelete}) {
  const [title,setTitle]=useState(existing?.title||"");
  const [key,setKey]=useState(existing?.key||"D");
  const [tempo,setTempo]=useState(existing?.tempo||"");
  const [note,setNote]=useState(existing?.note||"");
  const [type,setType]=useState(existing?.type||"Worship");
  const [chart,setChart]=useState(existing?.chart||"VERSE\n| 1 | 1 | 5 | 5 |\n| 6m | 6m | 4 | 4 |\n\nCHORUS\n| 1 | 5 | 6m | 4 |");
  const isEdit=!!existing;
  const lbl={display:"block",fontSize:12,color:T.textMuted,marginBottom:5,marginTop:14};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:"16px 16px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${T.border}`,borderBottom:"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:17,fontWeight:600,color:T.text}}>{isEdit?"Edit Song":"Add Song"}</div>
          {isEdit&&<button onClick={()=>{if(confirm("Delete this song?")){onDelete(existing.id);onClose();}}} style={{background:"none",border:"none",color:"#e05252",fontSize:13,cursor:"pointer"}}>Delete</button>}
        </div>
        <label style={lbl}>Song Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. How Great Is Our God" style={inputStyle}/>
        <label style={lbl}>Key</label>
        <KeyPicker value={key} onChange={setKey}/>
        <label style={{...lbl,marginTop:14}}>Tempo</label>
        <input value={tempo} onChange={e=>setTempo(e.target.value)} placeholder="72 BPM" style={inputStyle}/>
        <label style={lbl}>Type</label>
        <div style={{display:"flex",gap:8}}>{TYPES.map(t=>{const ts=TYPE_STYLES[t];const sel=type===t;return<button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${sel?ts.border:T.border}`,background:sel?ts.bg:T.bg,color:sel?ts.color:T.textMuted,fontSize:14,cursor:"pointer",fontWeight:sel?600:400}}>{t}</button>;})}</div>
        <label style={lbl}>Note</label>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Capo 2, half step down for Sam" style={inputStyle}/>
        <label style={lbl}>Chord Chart</label>
        <textarea value={chart} onChange={e=>setChart(e.target.value)} rows={10} style={{...inputStyle,resize:"vertical",fontFamily:T.mono,lineHeight:1.75}}/>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={onClose} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px",color:T.textMuted,cursor:"pointer",fontSize:14}}>Cancel</button>
          <button onClick={()=>{if(!title.trim())return;onSave({title:title.trim(),key,tempo:tempo||"",note:note.trim(),type,chart});onClose();}} style={{flex:2,background:T.accent,border:"none",borderRadius:9,padding:"11px",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600}}>{isEdit?"Save Changes":"Add Song"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── SongPanel ────────────────────────────────────────────────────────────────
function SongPanel({song,chordMode,liveKey}) {
  const lines=formatChart(song.chart).map(l=>chordMode&&l.type==="bars"?{...l,content:transposeLine(l.content,liveKey)}:l);
  return (
    <div style={{width:"100%",height:"100%",overflowY:"auto",padding:"14px 18px 120px",WebkitOverflowScrolling:"touch",flexShrink:0}}>
      {lines.map(l=><ChartLine key={l.id} line={l}/>)}
    </div>
  );
}

// ─── Song Preview Modal ───────────────────────────────────────────────────────
function SongPreviewModal({song,onClose,onUpdateSong}) {
  const [liveKey,setLiveKey]=useState(song.key||"");
  const [chordMode,setChordMode]=useState(false);
  const [showKeyPicker,setShowKeyPicker]=useState(false);
  const [liveNote,setLiveNote]=useState(song.note||"");
  const [editingNote,setEditingNote]=useState(false);
  const handleKeyChange=k=>{setLiveKey(k);setShowKeyPicker(false);onUpdateSong(song.id,{key:k});};
  const saveNote=()=>{onUpdateSong(song.id,{note:liveNote});setEditingNote(false);};
  const pill={borderRadius:5,padding:"3px 9px",fontSize:12,fontFamily:T.mono,border:"1px solid",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,background:"none"};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:150,display:"flex",flexDirection:"column"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{flex:1,display:"flex",flexDirection:"column",background:T.bg,marginTop:"env(safe-area-inset-top, 44px)"}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.border}`,background:T.surface,flexShrink:0}}>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer"}}>✕ Close</button>
          <div style={{fontSize:13,color:T.textMuted,fontFamily:T.mono}}>Preview</div>
          <div style={{width:60}}/>
        </div>
        <div style={{padding:"12px 18px 10px",flexShrink:0,borderBottom:`1px solid ${T.borderLight}`}}>
          <div style={{fontSize:21,fontWeight:600,color:T.text}}>{song.title}</div>
          <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <div onClick={()=>setShowKeyPicker(p=>!p)} style={{...pill,background:T.accentBg,color:T.accent,borderColor:T.accentBorder,fontWeight:600}}>{liveKey||"?"} ▾</div>
              {showKeyPicker&&<LiveKeyPicker value={liveKey} onChange={handleKeyChange}/>}
            </div>
            {song.tempo&&<div style={{...pill,color:T.textMuted,borderColor:T.border,cursor:"default"}}>{song.tempo}</div>}
            <button onClick={()=>setChordMode(m=>!m)} style={{...pill,background:chordMode?"rgba(99,102,241,0.15)":T.surface,color:chordMode?"#a5b4fc":T.textMuted,borderColor:chordMode?"rgba(99,102,241,0.35)":T.border}}>{chordMode?"Chords":"Numbers"}</button>
          </div>
          <div style={{marginTop:8}}>
            {editingNote?(
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input autoFocus value={liveNote} onChange={e=>setLiveNote(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveNote();if(e.key==="Escape")setEditingNote(false);}} placeholder="Add a note…" style={{...inputStyle,padding:"5px 10px",flex:1}}/>
                <button onClick={saveNote} style={{background:T.accent,border:"none",borderRadius:7,color:"#fff",padding:"5px 12px",cursor:"pointer",fontSize:14}}>Save</button>
                <button onClick={()=>setEditingNote(false)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,color:T.textMuted,padding:"5px 10px",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
            ):(
              <div onClick={()=>setEditingNote(true)} style={{display:"inline-flex",alignItems:"center",gap:5,cursor:"pointer",padding:"3px 0"}}>
                {liveNote?<span style={{background:"rgba(99,102,241,0.1)",color:"#a5b4fc",border:"1px solid rgba(99,102,241,0.25)",borderRadius:5,padding:"2px 9px",fontSize:12,fontFamily:T.mono}}>📝 {liveNote}</span>:<span style={{color:T.textFaint,fontSize:12,fontFamily:T.mono}}>+ add note</span>}
              </div>
            )}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 18px 40px"}}>
          {formatChart(song.chart).map(l=>{const line=chordMode&&l.type==="bars"?{...l,content:transposeLine(l.content,liveKey)}:l;return<ChartLine key={l.id} line={line}/>;})}</div>
      </div>
      {showKeyPicker&&<div onClick={()=>setShowKeyPicker(false)} style={{position:"fixed",inset:0,zIndex:200}}/>}
    </div>
  );
}

// ─── Performance View ─────────────────────────────────────────────────────────
function PerformanceView({songs,currentIndex,onIndexChange,onExit,onUpdateSong,setlistKeyOverrides}) {
  const W=window.innerWidth;
  const [offsetX,setOffsetX]=useState(0);
  const [settling,setSettling]=useState(false);
  const [overlayIdx,setOverlayIdx]=useState(currentIndex);
  const [chordMode,setChordMode]=useState(false);
  const [liveNotes,setLiveNotes]=useState({});
  const [showKeyPicker,setShowKeyPicker]=useState(false);
  const [editingNote,setEditingNote]=useState(false);
  const [localKeyOverrides,setLocalKeyOverrides]=useState({...setlistKeyOverrides});
  const startX=useRef(null),startY=useRef(null),isHoriz=useRef(false);
  const lastX=useRef(0),lastT=useRef(0),vel=useRef(0);

  const song=songs[overlayIdx]||songs[currentIndex];
  const nextSong=songs[overlayIdx+1]||null;
  const liveKey=localKeyOverrides[song?.id]??song?.key??"";
  const liveNote=liveNotes[song?.id]??song?.note??"";

  useEffect(()=>{setOverlayIdx(currentIndex);setOffsetX(0);setSettling(false);},[currentIndex]);

  const commitSwipe=useCallback((targetIdx)=>{
    setSettling(true);setOffsetX(-(targetIdx-currentIndex)*W);setOverlayIdx(targetIdx);
    setTimeout(()=>{onIndexChange(targetIdx);setOffsetX(0);setSettling(false);},300);
  },[currentIndex,W,onIndexChange]);

  const handleKeyChange=k=>{setLocalKeyOverrides(p=>({...p,[song.id]:k}));setShowKeyPicker(false);};
  const saveNote=()=>{onUpdateSong(song.id,{note:liveNote});setEditingNote(false);};
  const stripX=-(currentIndex*W)+offsetX;

  const onTS=e=>{if(settling)return;startX.current=e.touches[0].clientX;startY.current=e.touches[0].clientY;isHoriz.current=false;lastX.current=e.touches[0].clientX;lastT.current=Date.now();vel.current=0;};
  const onTM=e=>{
    if(settling||startX.current===null)return;
    const dx=e.touches[0].clientX-startX.current,dy=e.touches[0].clientY-startY.current;
    if(!isHoriz.current&&Math.abs(dx)<6&&Math.abs(dy)<6)return;
    if(!isHoriz.current){isHoriz.current=Math.abs(dx)>Math.abs(dy);}
    if(!isHoriz.current)return;
    e.preventDefault();
    const now=Date.now(),dt=now-lastT.current;
    if(dt>0)vel.current=(e.touches[0].clientX-lastX.current)/dt;
    lastX.current=e.touches[0].clientX;lastT.current=now;
    const atEdge=(currentIndex===0&&dx>0)||(currentIndex===songs.length-1&&dx<0);
    setOffsetX(atEdge?dx*0.18:dx);
    const p=-(atEdge?dx*0.18:dx)/W;
    if(p>0.5&&currentIndex<songs.length-1)setOverlayIdx(currentIndex+1);
    else if(p<-0.5&&currentIndex>0)setOverlayIdx(currentIndex-1);
    else setOverlayIdx(currentIndex);
  };
  const onTE=()=>{
    if(settling||startX.current===null)return;startX.current=null;
    const eff=offsetX+vel.current*120,thr=W*0.28;
    let target=currentIndex;
    if(eff<-thr&&currentIndex<songs.length-1)target=currentIndex+1;
    else if(eff>thr&&currentIndex>0)target=currentIndex-1;
    commitSwipe(target);
  };

  const pill={borderRadius:5,padding:"3px 9px",fontSize:12,fontFamily:T.mono,border:"1px solid",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,background:"none"};
  const overlayFade=overlayIdx!==currentIndex?0.5+Math.min(Math.abs(offsetX)/(W*0.5),1)*0.5:1;

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:100,display:"flex",flexDirection:"column",overflow:"hidden"}} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
      <div style={{position:"relative",zIndex:10,flexShrink:0}}>
        <div style={{paddingTop:"env(safe-area-inset-top, 12px)",background:T.surface,borderBottom:`1px solid ${T.border}`}}>
          <div style={{padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={onExit} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",padding:"4px 0"}}>← Back</button>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>{songs.map((_,i)=><div key={i} style={{width:i===overlayIdx?18:6,height:6,borderRadius:3,background:i===overlayIdx?T.accent:T.border,transition:"width 0.25s ease,background 0.25s ease"}}/>)}</div>
            <div style={{fontFamily:T.mono,fontSize:12,color:T.textMuted}}>{overlayIdx+1}/{songs.length}</div>
          </div>
        </div>
        <div style={{padding:"12px 18px 10px",borderBottom:`1px solid ${T.borderLight}`,background:T.bg,opacity:overlayFade,transition:settling?"opacity 0.2s ease":"none"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
            <div style={{fontSize:21,fontWeight:600,color:T.text}}>{song.title}</div>
            {nextSong&&<div style={{fontSize:11,color:T.textFaint,fontFamily:T.mono}}>next: <span style={{color:T.textMuted}}>{nextSong.title}</span></div>}
          </div>
          <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <div onClick={()=>setShowKeyPicker(p=>!p)} style={{...pill,background:T.accentBg,color:T.accent,borderColor:T.accentBorder,fontWeight:600}}>
                {liveKey||"?"}{song.key&&liveKey!==song.key?<span style={{opacity:0.5,fontWeight:400,fontSize:11}}> ({song.key})</span>:null} ▾
              </div>
              {showKeyPicker&&<LiveKeyPicker value={liveKey} onChange={handleKeyChange}/>}
            </div>
            {song.tempo&&<div style={{...pill,color:T.textMuted,borderColor:T.border,cursor:"default"}}>{song.tempo}</div>}
            <button onClick={()=>setChordMode(m=>!m)} style={{...pill,background:chordMode?"rgba(99,102,241,0.15)":T.surface,color:chordMode?"#a5b4fc":T.textMuted,borderColor:chordMode?"rgba(99,102,241,0.35)":T.border}}>{chordMode?"Chords":"Numbers"}</button>
          </div>
          <div style={{marginTop:8}}>
            {editingNote?(
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input autoFocus value={liveNote} onChange={e=>setLiveNotes(p=>({...p,[song.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")saveNote();if(e.key==="Escape")setEditingNote(false);}} placeholder="Add a note…" style={{...inputStyle,padding:"5px 10px",flex:1}}/>
                <button onClick={saveNote} style={{background:T.accent,border:"none",borderRadius:7,color:"#fff",padding:"5px 12px",cursor:"pointer",fontSize:14}}>Save</button>
                <button onClick={()=>setEditingNote(false)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,color:T.textMuted,padding:"5px 10px",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
            ):(
              <div onClick={()=>setEditingNote(true)} style={{display:"inline-flex",alignItems:"center",gap:5,cursor:"pointer",padding:"3px 0"}}>
                {liveNote?<span style={{background:"rgba(99,102,241,0.1)",color:"#a5b4fc",border:"1px solid rgba(99,102,241,0.25)",borderRadius:5,padding:"2px 9px",fontSize:12,fontFamily:T.mono}}>📝 {liveNote}</span>:<span style={{color:T.textFaint,fontSize:12,fontFamily:T.mono}}>+ add note</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        <div style={{display:"flex",width:`${songs.length*100}%`,height:"100%",transform:`translateX(${stripX}px)`,transition:settling?"transform 0.3s cubic-bezier(0.25,1,0.5,1)":"none",willChange:"transform"}}>
          {songs.map(s=>{const lk=localKeyOverrides[s.id]??s.key??"";return<div key={s.id} style={{width:`${100/songs.length}%`,height:"100%",flexShrink:0}}><SongPanel song={s} chordMode={chordMode} liveKey={lk}/></div>;})}
        </div>
      </div>

      {showKeyPicker&&<div onClick={()=>setShowKeyPicker(false)} style={{position:"fixed",inset:0,zIndex:200}}/>}

      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 16px",paddingBottom:"max(28px, env(safe-area-inset-bottom))",display:"flex",justifyContent:"space-between",alignItems:"center",background:`linear-gradient(to top, ${T.bg} 65%, transparent)`,zIndex:10}}>
        <button onClick={()=>{if(overlayIdx>0)commitSwipe(overlayIdx-1);}} disabled={overlayIdx===0} style={{background:overlayIdx===0?"transparent":T.surface,border:`1px solid ${overlayIdx===0?T.borderLight:T.border}`,borderRadius:10,padding:"11px 20px",color:overlayIdx===0?T.textFaint:T.textMuted,fontSize:14,cursor:overlayIdx===0?"default":"pointer"}}>← Prev</button>
        <div style={{fontSize:11,color:T.textFaint,fontFamily:T.mono}}>swipe or tap</div>
        <button onClick={()=>{if(overlayIdx<songs.length-1)commitSwipe(overlayIdx+1);}} disabled={overlayIdx===songs.length-1} style={{background:overlayIdx===songs.length-1?"transparent":T.accentBg,border:`1px solid ${overlayIdx===songs.length-1?T.borderLight:T.accentBorder}`,borderRadius:10,padding:"11px 20px",color:overlayIdx===songs.length-1?T.textFaint:T.accent,fontSize:14,cursor:overlayIdx===songs.length-1?"default":"pointer"}}>Next →</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked,setUnlocked]=useState(()=>!!localStorage.getItem(PIN_KEY));
  const [tabIndex,setTabIndex]=useState(0); // 0=setlist, 1=library
  const [songs,setSongs]=useState(DEFAULT_SONGS);
  const [setlist,setSetlist]=useState([]);
  const [setlistKeyOverrides,setSetlistKeyOverrides]=useState(()=>{try{return JSON.parse(localStorage.getItem(SETLIST_KEYS_KEY)||"{}");}catch{return {};}});
  const [performing,setPerforming]=useState(false);
  const [perfIndex,setPerfIndex]=useState(0);
  const [modal,setModal]=useState(null);
  const [previewSong,setPreviewSong]=useState(null);
  const [search,setSearch]=useState("");
  const [syncStatus,setSyncStatus]=useState("loading");
  const [lastSync,setLastSync]=useState(null);
  const syncTimer=useRef(null);
  const firstSong=useRef(true),firstSetlist=useRef(true);

  // Tab swipe on main screen
  const tabStartX=useRef(null),tabStartY=useRef(null),tabIsHoriz=useRef(false);
  const onTabTouchStart=e=>{tabStartX.current=e.touches[0].clientX;tabStartY.current=e.touches[0].clientY;tabIsHoriz.current=false;};
  const onTabTouchMove=e=>{
    if(!tabStartX.current)return;
    const dx=e.touches[0].clientX-tabStartX.current,dy=e.touches[0].clientY-tabStartY.current;
    if(!tabIsHoriz.current&&Math.abs(dx)<8&&Math.abs(dy)<8)return;
    if(!tabIsHoriz.current){tabIsHoriz.current=Math.abs(dx)>Math.abs(dy);}
  };
  const onTabTouchEnd=e=>{
    if(!tabStartX.current)return;
    const dx=e.changedTouches[0].clientX-tabStartX.current;
    tabStartX.current=null;
    if(!tabIsHoriz.current||Math.abs(dx)<50)return;
    if(dx<0&&tabIndex===0)setTabIndex(1);
    else if(dx>0&&tabIndex===1)setTabIndex(0);
  };

  // Persist setlist key overrides locally
  useEffect(()=>{localStorage.setItem(SETLIST_KEYS_KEY,JSON.stringify(setlistKeyOverrides));},[setlistKeyOverrides]);

  useEffect(()=>{
    if(!unlocked)return;
    (async()=>{
      try{
        const {songs:cs,setlist:csl}=await fetchFromCloud();
        if(cs&&cs.length>0)setSongs(cs);
        if(csl)setSetlist(csl.ids||[]);
        setSyncStatus("synced");setLastSync(new Date().toISOString());
      }catch(e){setSyncStatus("error");}
    })();
  },[unlocked]);

  useEffect(()=>{
    if(firstSong.current){firstSong.current=false;return;}
    if(!unlocked)return;
    setSyncStatus("syncing");clearTimeout(syncTimer.current);
    syncTimer.current=setTimeout(async()=>{
      try{await pushSongs(songs);setSyncStatus("synced");setLastSync(new Date().toISOString());}
      catch{setSyncStatus("error");}
    },1200);
  },[songs]);

  useEffect(()=>{
    if(firstSetlist.current){firstSetlist.current=false;return;}
    if(!unlocked)return;
    setSyncStatus("syncing");
    (async()=>{try{await pushSetlist(setlist);setSyncStatus("synced");setLastSync(new Date().toISOString());}catch{setSyncStatus("error");}})();
  },[setlist]);

  if(!unlocked)return <PinScreen onUnlock={()=>setUnlocked(true)}/>;

  const setlistSongs=setlist.map(id=>songs.find(s=>s.id===id)).filter(Boolean);
  const filtered=songs.filter(s=>s.title.toLowerCase().includes(search.toLowerCase()));
  const grouped=TYPE_ORDER.map(type=>({type,songs:filtered.filter(s=>s.type===type).sort((a,b)=>a.title.localeCompare(b.title))})).filter(g=>g.songs.length>0);
  const ungrouped=filtered.filter(s=>!TYPE_ORDER.includes(s.type)).sort((a,b)=>a.title.localeCompare(b.title));

  const toggleSong=id=>setSetlist(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const removeSong=id=>{setSetlist(p=>p.filter(x=>x!==id));setSetlistKeyOverrides(p=>{const n={...p};delete n[id];return n;});};
  const saveSong=data=>{
    if(modal&&modal.id)setSongs(p=>p.map(s=>s.id===modal.id?{...s,...data}:s));
    else{const id=Date.now();setSongs(p=>[...p,{id,...data}]);}
  };
  const deleteSong=id=>{setSongs(p=>p.filter(s=>s.id!==id));setSetlist(p=>p.filter(x=>x!==id));};
  const updateSong=(id,changes)=>setSongs(p=>p.map(s=>s.id===id?{...s,...changes}:s));
  const setlistKeyChange=(songId,key)=>setSetlistKeyOverrides(p=>({...p,[songId]:key}));
  const reorderSetlist=newIds=>setSetlist(newIds);
  const startFromIndex=i=>{setPerfIndex(i);setPerforming(true);};

  if(performing&&setlistSongs.length>0)return(
    <PerformanceView
      songs={setlistSongs} currentIndex={perfIndex}
      onIndexChange={i=>setPerfIndex(i)} onExit={()=>setPerforming(false)}
      onUpdateSong={updateSong} setlistKeyOverrides={setlistKeyOverrides}
    />
  );

  const dot=syncStatus==="synced"?"#4ade80":syncStatus==="syncing"?"#f59e0b":syncStatus==="error"?"#f87171":T.textFaint;
  const syncLabel=syncStatus==="synced"?`Synced ${fmtTime(lastSync)}`:syncStatus==="syncing"?"Syncing…":syncStatus==="error"?"Sync failed":"Loading…";

  // Tab labels
  const TABS=["Setlist","Library"];

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font,color:T.text,display:"flex",flexDirection:"column"}}>
      <div style={{height:"env(safe-area-inset-top, 0px)",background:T.bg,flexShrink:0}}/>

      {/* Header */}
      <div style={{padding:"16px 16px 0",maxWidth:560,margin:"0 auto",width:"100%",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:20,fontWeight:600,color:T.text}}>Setlist</div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0,transition:"background 0.3s"}}/>
              <div style={{fontSize:11,color:T.textMuted,fontFamily:T.mono}}>{syncLabel}</div>
            </div>
          </div>
          {tabIndex===1&&<button onClick={()=>setModal("add")} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 13px",color:T.text,cursor:"pointer",fontSize:14}}>+ Add Song</button>}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",background:T.surface,borderRadius:9,padding:3,marginTop:14,marginBottom:14,border:`1px solid ${T.border}`}}>
          {TABS.map((t,i)=>(
            <button key={t} onClick={()=>setTabIndex(i)} style={{flex:1,background:tabIndex===i?T.bg:"transparent",border:tabIndex===i?`1px solid ${T.border}`:"1px solid transparent",borderRadius:7,padding:"8px",cursor:"pointer",color:tabIndex===i?T.text:T.textMuted,fontSize:14,transition:"all 0.15s"}}>
              {i===0?`Setlist${setlistSongs.length?` (${setlistSongs.length})`:""}`:`Library (${songs.length})`}
            </button>
          ))}
        </div>

        {tabIndex===1&&<>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search songs…" style={{...inputStyle,marginBottom:12}}/>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {TYPE_ORDER.map(t=>{const ts=TYPE_STYLES[t];return<span key={t} style={{fontSize:11,color:ts.color,background:ts.bg,border:`1px solid ${ts.border}`,borderRadius:4,padding:"2px 8px",fontFamily:T.mono}}>{t}</span>;})}
          </div>
        </>}
      </div>

      {/* Swipeable content */}
      <div
        style={{flex:1,overflow:"hidden",position:"relative"}}
        onTouchStart={onTabTouchStart}
        onTouchMove={onTabTouchMove}
        onTouchEnd={onTabTouchEnd}
      >
        <div style={{display:"flex",width:"200%",height:"100%",transform:`translateX(${tabIndex===0?"0":"-50%"})`,transition:"transform 0.3s cubic-bezier(0.25,1,0.5,1)"}}>
          {/* Setlist tab */}
          <div style={{width:"50%",height:"100%",overflowY:"auto",padding:"0 16px 140px",maxWidth:"none"}}>
            <div style={{maxWidth:560,margin:"0 auto"}}>
              {setlistSongs.length===0
                ?<div style={{textAlign:"center",padding:"60px 0",color:T.textFaint}}><div style={{fontSize:32,marginBottom:10}}>♩</div><div style={{fontSize:14}}>No songs yet.</div><div style={{fontSize:13,marginTop:4}}>Swipe right to add from Library.</div></div>
                :<DraggableSetlist
                  songs={setlistSongs}
                  setlistKeyOverrides={setlistKeyOverrides}
                  onSetlistKeyChange={setlistKeyChange}
                  onRemove={removeSong}
                  onReorder={reorderSetlist}
                  onTapToPlay={startFromIndex}
                />
              }
            </div>
          </div>

          {/* Library tab */}
          <div style={{width:"50%",height:"100%",overflowY:"auto",padding:"0 16px 140px"}}>
            <div style={{maxWidth:560,margin:"0 auto"}}>
              {filtered.length===0
                ?<div style={{textAlign:"center",padding:"40px 0",color:T.textFaint,fontSize:14}}>No songs found.</div>
                :<>
                  {grouped.map(({type,songs:gs})=>{const ts=TYPE_STYLES[type];return(
                    <div key={type} style={{marginBottom:8}}>
                      <div style={{fontSize:11,fontWeight:600,color:ts.color,fontFamily:T.mono,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 0 8px",borderBottom:`1px solid ${ts.border}`,marginBottom:10}}>{type} — {gs.length}</div>
                      {gs.map(song=><SongCard key={song.id} song={song} inSetlist={setlist.includes(song.id)} onToggle={toggleSong} onPreview={setPreviewSong} onEdit={s=>setModal(s)}/>)}
                    </div>
                  );})}
                  {ungrouped.length>0&&<div>
                    <div style={{fontSize:11,color:T.textMuted,fontFamily:T.mono,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 0 8px",borderBottom:`1px solid ${T.border}`,marginBottom:10}}>Other — {ungrouped.length}</div>
                    {ungrouped.map(song=><SongCard key={song.id} song={song} inSetlist={setlist.includes(song.id)} onToggle={toggleSong} onPreview={setPreviewSong} onEdit={s=>setModal(s)}/>)}
                  </div>}
                </>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Go Live */}
      {setlistSongs.length>0&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 16px",paddingBottom:"max(28px, env(safe-area-inset-bottom))",background:`linear-gradient(to top, ${T.bg} 70%, transparent)`,zIndex:50}}>
          <div style={{maxWidth:560,margin:"0 auto"}}>
            <button onClick={()=>startFromIndex(0)} style={{width:"100%",background:T.accent,border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer"}}>
              ▶ Go Live — {setlistSongs.length} {setlistSongs.length===1?"song":"songs"}
            </button>
          </div>
        </div>
      )}

      {modal&&<SongModal existing={modal==="add"?null:modal} onClose={()=>setModal(null)} onSave={saveSong} onDelete={deleteSong}/>}
      {previewSong&&<SongPreviewModal song={previewSong} onClose={()=>setPreviewSong(null)} onUpdateSong={updateSong}/>}
    </div>
  );
}
