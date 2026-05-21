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
const SETLIST_KEYS_STORAGE = "setlist-key-overrides";
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

// ─── Default songs ────────────────────────────────────────────────────────────
const DEFAULT_SONGS = [{"id":3847788,"title":"Agnus Dei","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse 1\n\n| 1 |\n\nChorus\n\n| 1 |\n\n| 4 | 1 | 6m | 5 |\n\n| 4 |"},{"id":2812383,"title":"All Hail King Jesus","key":"E","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 1 | 6m | 5 | 4 |\n\nPre-Chorus\n\n| 2m | 6m | 5 |\n\n| 1 | 3m | 4 |\n\nChorus\n\n| 1 | 1sus |\n\n| 1 | 1sus | 3m | 6m |\n\n| 4 |\n\n| 1/3 | 5 | 1 |\n\nBridge\n\n| 5 | 6m | 4 | 1 | 1/3 |"},{"id":5390733,"title":"Because Of Christ","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 1/3 | 1 |\n\n| 5 | 6m |\n\n| 4 | 1 |\n\n| 6m | 5 |\n\nChorus\n\n| 4 |\n\n| 1sus | 1 |\n\n| 1/5 | 5 |\n\n| 6m | 5 |\n\nBridge\n\n| 1 | 4/1 | 1 |\n\n| 6m/1 | 5/1 |"},{"id":716362,"title":"Bless God","key":"D","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 1 | 2m | 4 | 1 | 6m | 5 |\n\nChorus\n\n| 1 | 2m | 4 |\n\n| 6m | 4 | 5 |\n\nBridge\n\n| 1/3 | 2m | 4 | 6m | 5 |"},{"id":4535294,"title":"Blood Of Jesus","key":"G","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4/1 |\n\n| 5 | 4 | 1 |\n\n| 6m | 5 | 1 |\n\nchorus\n\n| 4 | 1 | 5 |\n\n| 6m | 4 |\n\n| 1 | 5 |\n\nbridge\n\n| 1 | 5 | 6m | 4 |"},{"id":3375914,"title":"Center","key":"A","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4 | 6m | 4 |\n\nchorus\n\n| 4 | 6m | 1 | 5 |\n\n| 3m | 6m | 4 | 5 |\n\nbridge\n\n| 4 | 5 | 6m | 3m |"},{"id":8199008,"title":"FREE!","key":"A","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| Am | Dm | F | E/B |\n\nPre Chorus\n\n| Am | Dm | F | E/G# |\n\nChorus\n\n| F | Dm | C | E |\n\nBridge\n\nAm"},{"id":2724960,"title":"Fall Like Rain","key":"E","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 5/7 | 6 | 4 |\n\nChorus\n\n| 1 | 5/7 | 6 | 1/3 |\n\nBridge\n\n| 1 | 2 | 1/3 | 4 |"},{"id":2861416,"title":"Give Me Jesus","key":"F","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4/6 | 2 | 1/3 | 4 |\n\nchorus\n\n| 1 | 5 | 2 | 6 | 4 | 5 |\n\nbridge\n\n| 1/3 | 4 | 6 | 5 |"},{"id":6169345,"title":"Gratitude","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 6m | 5 | 4 |\n\nChorus\n\n| 1 | 5 |\n\n| 4 | 6m | 5 | 1 |\n\nBridge\n\n| 1 | 5 | 4 |\n\n| 6m | 5 |"},{"id":2334879,"title":"Great Are You Lord","key":"C","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 4 | 6m | 5 |\n\nchorus\n\n| 4 | 6m | 5 |\n\nbridge\n\n| 1 | 4 | 4 | 1 |"},{"id":1736063,"title":"Heart of Worship","key":"","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 5 | 2m | 5 |\n\nPre Chorus\n\n| 2m | 1/3 | 5 |\n\nChorus\n\n| 1 | 5/7 |\n\n| 2m | 4 | 5 | 1 |"},{"id":3866966,"title":"Holy Forever","key":"F","tempo":"","note":"","type":"Anthem","chart":"Verse\n\n| 1 | 4 | 1 |\n\n| 6m | 5 | 4 |\n\nChorus\n\n| 4 | 6m | 5 |\n\n| 1/3 | 6m |\n\n| 2m | 5 |\n\n| 1 | 1sus | 1 |\n\nTag\n\n| 2m | 5 |\n\n| 1 | 1sus | 1 |"},{"id":1203969,"title":"I Speak Jesus","key":"D","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 6m | 4 | 1 |\n\nchorus\n\n| 5 | 1 | 4 | 1 |\n\nbridge\n\n| 1 |\n\n| 6m |\n\n| 4 |\n\n| 1 |"},{"id":7595253,"title":"I Thank God","key":"C","tempo":"","note":"","type":"Praise","chart":"verse\n\n| 1 | 4 |\n\npre chorus\n\n| 5 | 6m | 4 | 1 |\n\n| 5 | 6m | 4 |\n\nchorus\n\n| 1 | 2m | 1 | 4 |\n\n| 6m | 4 |\n\nbridge\n\n| 1 |\n\n| 5 | 6m | 4 | 1 |"},{"id":5798964,"title":"I Will Exalt You","key":"B","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 5/7 | 1 | 1/3 | 4 |\n\n| 5sus | 1 |\n\nchorus\n\n| 5 | 2m | 5/7 | 1 |\n\n| 5 | 2m | 1 | 4 | 6m | 5 |"},{"id":4935454,"title":"Inhabit","key":"F","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 4 | 6m | 5 | 4 |\n\nchorus\n\n| 1 | 4 | 5 | 4 |\n\nbridge\n\n| 1 | 1sus | 6m | 4 |"},{"id":9543310,"title":"Jesus Have It All","key":"F","tempo":"","note":"","type":"Worship","chart":"verse\n\n| 1 | 5 | 2m | 4 | 1 |\n\nchorus\n\n| 4 | 6m | 5 | 2m |\n\n| 4 | 6m | 5 | 4 |\n\nbridge\n\n| 4 | 6m | 5 | 2m |"},{"id":9198043,"title":"Lord Send Revival","key":"D","tempo":"","note":"","type":"Anthem","chart":"Verse / Chorus / Bridge\n\n| 4 | 1 | 5 |"},{"id":5525138,"title":"Make Room","key":"F","tempo":"","note":"","type":"Worship","chart":"verse / chorus / bridge\n\n| 1 | 5 | 2m | 4 |"},{"id":4788614,"title":"Name Above All Names","key":"D","tempo":"","note":"","type":"Anthem","chart":"Verse\n\n| 4 | 1 | 5 x3 |\n\n| 6 | 6m | 5 |\n\nChorus\n\n| 1 | 4 | 6m | 5 |\n\nBridge\n\n| 4 | 6m | 1 | 3 |\n\n| 4 | 6m | 1 | 5 |"},{"id":8174699,"title":"No One Else","key":"F","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 2m | 4 | 5sus | 5 |\n\nChorus\n\n| 1/3 | 4 | 5 |\n\nBridge\n\n| 4 | 5 | 6m | 5 |"},{"id":8102927,"title":"No One Like The Lord","key":"E","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 6m | 4 | 1 | 3m |\n\n| 6m | 2m | 1 | 5 |\n\nChorus\n\n| 6m | 5/7 | 1 | 2m | 4 |\n\n| 5 | 6m |\n\nBridge\n\n| 6m |\n\n| 4 | 5 | 6m |"},{"id":3242609,"title":"O Praise the Name","key":"G","tempo":"","note":"","type":"Anthem","chart":"chorus\n\n| 1 | 4 | 1 | 6 | 5 |\n\n| 1/3 | 4 | 6 | 5 | 4 | 1 |"},{"id":3323754,"title":"Open the eyes of my heart","key":"","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1 | 5 | 2m | 1 |\n\nChorus\n\n| 5 | 4 |\n\n| 1 | 5 |\n\n| 6m | 4 |\n\n| 1 | 5 |"},{"id":166542,"title":"Thank God I'm Free","key":"E","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 1/3 | 4 | 1 |\n\n| 6m | 5 | 4 |\n\nchorus\n\n| 1/3 | 4 | 1 |\n\n| 6m | 5 | 4 |\n\nBridge\n\n| 5/7 | 1 | 4 |"},{"id":7544044,"title":"Til The Walls Come Down","key":"D","tempo":"","note":"","type":"Anthem","chart":"Verse\n\n| 6 | 4 | 1 | 3 |\n\nBridge\n\n| 6 |\n\n| 4 | 6m | 5 | 2m | 1 |"},{"id":442544,"title":"Washed","key":"D","tempo":"","note":"","type":"Worship","chart":"Verse\n\n| 1/3 | 4 | 5/7 | 6m |\n\nChorus\n\n| 1 | 4 | 6m | 5 |\n\nBridge\n\n| 1 | 4 | 6m | 4 |"},{"id":634525,"title":"What A God","key":"G","tempo":"","note":"","type":"Praise","chart":"Verse\n\n| 6m | 5 |\n\n| 4 | 1/3 | 5 |\n\nChorus\n\n| 4 | 5 | 6m | 1/3 |\n\nBridge\n\n| 4 | 5 | 6m | 1/3 |"},{"id":6619951,"title":"What a beautiful name","key":"D","tempo":"","note":"","type":"Anthem","chart":"Chorus\n\n| 1 | 5 |\n\n| 6m | 5 | 4 |\n\n| 1/3 | 5 |\n\n| 6m | 5 | 4 |\n\nBridge\n\n| 4 | 5 | 6m | 1/3 |\n\n| 4 | 5 | 6m | 5 |"},{"id":5154995,"title":"Who Else","key":"G","tempo":"","note":"","type":"Praise","chart":"verse\n\n| 1 | 5 | 6m | 5 | 4 |\n\nchorus\n\n| 1 | 2m | 6m | 4 |\n\nbridge\n\n| 4 | 5 | 6m | 1 | 5 |"}];

// ─── Utils ────────────────────────────────────────────────────────────────────
function formatChart(text) {
  return (text||"").split("\n").map((line,i)=>{
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
    setlist:sl?{ids:sl.song_ids}:null,
  };
}
async function pushSongs(songs) {
  const rows=songs.map(s=>({id:s.id,data:{title:s.title,key:s.key,tempo:s.tempo,note:s.note,type:s.type,chart:s.chart}}));
  const {error}=await supabase.from("songs").upsert(rows,{onConflict:"id"});
  if(error){console.error("pushSongs:",error);throw error;}
  const {data:existing}=await supabase.from("songs").select("id");
  if(existing){const ids=songs.map(s=>s.id);const del=existing.map(r=>r.id).filter(id=>!ids.includes(id));if(del.length) await supabase.from("songs").delete().in("id",del);}
}
async function pushSetlist(ids) {
  await supabase.from("setlist").upsert({id:"main",song_ids:ids,updated_at:new Date().toISOString()},{onConflict:"id"});
}

// ─── Shared ───────────────────────────────────────────────────────────────────
const inputStyle={width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.text,fontSize:"16px",fontFamily:T.font,boxSizing:"border-box",outline:"none"};
const noSelect={userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none"};

// ─── Key Pickers ──────────────────────────────────────────────────────────────
function buildKeyPicker(value,onChange,compact=false) {
  const natural=getNatural(value), modifier=getModifier(value);
  const selectNatural=n=>{
    if(modifier==="#"&&!NO_SHARP.has(n))onChange(SHARP_MAP[n]);
    else if(modifier==="b"&&!NO_FLAT.has(n))onChange(FLAT_MAP[n]);
    else onChange(n);
  };
  const toggleMod=mod=>{
    if(mod==="#"){if(modifier==="#")onChange(natural);else if(!NO_SHARP.has(natural))onChange(SHARP_MAP[natural]);}
    else{if(modifier==="b")onChange(natural);else if(!NO_FLAT.has(natural))onChange(FLAT_MAP[natural]);}
  };
  const gap=compact?5:6, pad=compact?"7px 2px":"9px 4px", fs=compact?14:16;
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap,marginBottom:8}}>
        {NATURAL_KEYS.map(n=><button key={n} onClick={()=>selectNatural(n)} style={{padding:pad,borderRadius:8,border:`1px solid ${natural===n?T.accent:T.border}`,background:natural===n?T.accentBg:T.bg,color:natural===n?T.accent:T.text,fontSize:fs,fontWeight:natural===n?700:400,cursor:"pointer",fontFamily:T.mono}}>{n}</button>)}
      </div>
      <div style={{display:"flex",gap:compact?6:8}}>
        {["#","b"].map(mod=>{const dis=mod==="#"?NO_SHARP.has(natural):NO_FLAT.has(natural);const act=mod==="#"?modifier==="#":modifier==="b";return<button key={mod} onClick={()=>toggleMod(mod)} disabled={dis} style={{flex:1,padding:compact?"6px":"7px",borderRadius:8,border:`1px solid ${act?T.accent:T.border}`,background:act?T.accentBg:T.bg,color:dis?T.textFaint:act?T.accent:T.textMuted,fontSize:fs,cursor:dis?"default":"pointer",fontFamily:T.mono}}>{mod==="#"?"♯ Sharp":"♭ Flat"}</button>;})}
      </div>
      <div style={{textAlign:"center",marginTop:compact?8:10,fontSize:12,color:T.textMuted,fontFamily:T.mono}}>
        Selected: <span style={{color:T.accent,fontWeight:700}}>{value||"—"}</span>
      </div>
    </div>
  );
}

function KeyPicker({value,onChange}){return buildKeyPicker(value,onChange,false);}
function LiveKeyPicker({value,onChange}){
  return(
    <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:300,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:12,minWidth:260,boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
      {buildKeyPicker(value,onChange,true)}
    </div>
  );
}

// ─── PIN ──────────────────────────────────────────────────────────────────────
function PinScreen({onUnlock}) {
  const [pin,setPin]=useState(""); const [shake,setShake]=useState(false);
  const tap=d=>{if(pin.length>=4)return;const next=pin+d;setPin(next);if(next.length===4){if(next===CORRECT_PIN){localStorage.setItem(PIN_KEY,"1");onUnlock();}else{setShake(true);setTimeout(()=>{setPin("");setShake(false);},600);}}};
  return(
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
  if(!line.content)return<div style={{height:6}}/>;
  if(line.type==="header")return<div style={{fontSize:10,letterSpacing:"0.12em",color:T.accent,fontFamily:T.mono,fontWeight:600,marginTop:14,marginBottom:5,textTransform:"uppercase"}}>{line.content}</div>;
  if(line.type==="bars"){
    const cells=line.content.split("|").map(c=>c.trim()).filter(Boolean);
    return<div style={{display:"flex",gap:4,marginBottom:4,flexWrap:"wrap"}}>{cells.map((cell,i)=><div key={i} style={{background:cell==="—"||cell==="-"?"transparent":T.accentBg,border:`1px solid ${cell==="—"||cell==="-"?T.borderLight:T.accentBorder}`,borderRadius:6,padding:"5px 6px",fontFamily:T.mono,fontSize:13,fontWeight:700,color:cell==="—"||cell==="-"?T.textFaint:T.accent,minWidth:28,textAlign:"center",flex:"1 1 auto",maxWidth:60}}>{cell}</div>)}</div>;
  }
  return<div style={{color:T.textMuted,fontFamily:T.mono,fontSize:13}}>{line.content}</div>;
}

// ─── SongCard (library) ───────────────────────────────────────────────────────
function SongCard({song,inSetlist,onToggle,onPreview,onEdit}) {
  const ts=TYPE_STYLES[song.type]||{};
  return(
    <div style={{background:inSetlist?T.accentBg:T.surface,border:`1px solid ${inSetlist?T.accentBorder:T.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>onPreview(song)}>
        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
          <div style={{fontSize:15,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{song.title}</div>
          {song.type&&<span style={{fontSize:10,color:ts.color,background:ts.bg,border:`1px solid ${ts.border}`,borderRadius:4,padding:"1px 6px",fontFamily:T.mono,flexShrink:0}}>{song.type}</span>}
        </div>
        <div style={{fontSize:12,color:T.textMuted,fontFamily:T.mono,marginTop:2}}>{song.key||"No key"}{song.tempo?` · ${song.tempo}`:""}{song.note?` · ${song.note}`:""}</div>
      </div>
      <button onClick={()=>onEdit(song)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,color:T.textMuted,padding:"5px 9px",cursor:"pointer",fontSize:12,flexShrink:0}}>Edit</button>
      <div onClick={()=>onToggle(song.id)} style={{width:28,height:28,borderRadius:"50%",background:inSetlist?T.accent:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:inSetlist?"#fff":T.textMuted,flexShrink:0,cursor:"pointer"}}>{inSetlist?"✓":"+"}</div>
    </div>
  );
}

// ─── Drag-to-Reorder Setlist ──────────────────────────────────────────────────
// Uses a fixed-position ghost clone locked to finger; placeholder stays in list.
// No transform on non-dragged items — they shift via order change with CSS transition.
const ROW_H = 72; // item height + gap in px

function DraggableSetlist({songs,keyOverrides,onKeyChange,onRemove,onReorder,onTapToPlay}) {
  // orderedIds tracks current visual order
  const [orderedIds,setOrderedIds]=useState(()=>songs.map(s=>s.id));
  const [draggingId,setDraggingId]=useState(null);
  const [ghostY,setGhostY]=useState(0);       // fixed Y for ghost (tracks raw clientY)
  const [ghostX,setGhostX]=useState(0);       // fixed X for ghost
  const [placeholderIdx,setPlaceholderIdx]=useState(null);
  const containerRef=useRef(null);
  const longPressRef=useRef(null);
  const startClientY=useRef(0);
  const isDragging=useRef(false);
  const activeId=useRef(null);
  // How far from the top of the item the finger was when long-press fired
  const touchOffsetInItem=useRef(0);

  // Sync if songs list changes externally
  useEffect(()=>{
    setOrderedIds(prev=>{
      const newIds=songs.map(s=>s.id);
      const kept=prev.filter(id=>newIds.includes(id));
      const added=newIds.filter(id=>!kept.includes(id));
      return [...kept,...added];
    });
  },[songs.map(s=>s.id).join(",")]);

  const orderedSongs=orderedIds.map(id=>songs.find(s=>s.id===id)).filter(Boolean);

  const getIdxFromY=(clientY)=>{
    if(!containerRef.current)return 0;
    const rect=containerRef.current.getBoundingClientRect();
    const relY=clientY-rect.top;
    return Math.max(0,Math.min(orderedSongs.length-1,Math.floor(relY/ROW_H)));
  };

  const startDrag=(id,clientY,clientX,offsetInItem)=>{
    isDragging.current=true;
    activeId.current=id;
    touchOffsetInItem.current=offsetInItem;
    setDraggingId(id);
    setGhostY(clientY);
    setGhostX(clientX);
    const idx=orderedIds.indexOf(id);
    setPlaceholderIdx(idx);
    if(navigator.vibrate)navigator.vibrate(30);
  };

  const moveDrag=(clientY,clientX)=>{
    if(!isDragging.current||!activeId.current)return;
    setGhostY(clientY);
    setGhostX(clientX);
    const targetIdx=getIdxFromY(clientY);
    setPlaceholderIdx(targetIdx);
    // Reorder preview: move dragged item to targetIdx
    const curIds=[...orderedIds];
    const fromIdx=curIds.indexOf(activeId.current);
    if(fromIdx!==targetIdx){
      curIds.splice(fromIdx,1);
      curIds.splice(targetIdx,0,activeId.current);
      setOrderedIds(curIds);
    }
  };

  const endDrag=()=>{
    if(!isDragging.current)return;
    isDragging.current=false;
    const id=activeId.current;
    activeId.current=null;
    setDraggingId(null);
    setPlaceholderIdx(null);
    // Commit
    const newOrder=orderedIds.filter(oid=>songs.find(s=>s.id===oid));
    onReorder(newOrder);
  };

  // Touch handlers
  const onTouchStart=(id,e)=>{
    const t=e.touches[0];
    startClientY.current=t.clientY;
    // Calculate finger offset within the item element
    const itemEl=e.currentTarget;
    const itemRect=itemEl.getBoundingClientRect();
    const offsetInItem=t.clientY-itemRect.top;
    longPressRef.current=setTimeout(()=>startDrag(id,t.clientY,t.clientX,offsetInItem),400);
  };
  const onTouchMove=useCallback(e=>{
    if(!isDragging.current){clearTimeout(longPressRef.current);return;}
    e.preventDefault();
    const t=e.touches[0];
    moveDrag(t.clientY,t.clientX);
    // Auto-scroll
    if(containerRef.current){
      const rect=containerRef.current.getBoundingClientRect();
      const parent=containerRef.current.closest("[data-scroll]");
      if(parent){
        if(t.clientY>rect.bottom-60)parent.scrollTop+=8;
        else if(t.clientY<rect.top+60)parent.scrollTop-=8;
      }
    }
  },[orderedIds]);
  const onTouchEnd=()=>{clearTimeout(longPressRef.current);endDrag();};

  // Mouse handlers
  const onMouseDown=(id,e)=>{
    startClientY.current=e.clientY;
    const itemEl=e.currentTarget;
    const itemRect=itemEl.getBoundingClientRect();
    const offsetInItem=e.clientY-itemRect.top;
    longPressRef.current=setTimeout(()=>startDrag(id,e.clientY,e.clientX,offsetInItem),400);
  };
  const onMouseMoveGlobal=useCallback(e=>{
    if(!isDragging.current){return;}
    moveDrag(e.clientY,e.clientX);
  },[orderedIds]);
  const onMouseUpGlobal=useCallback(()=>{
    clearTimeout(longPressRef.current);
    endDrag();
  },[orderedIds]);

  useEffect(()=>{
    window.addEventListener("mousemove",onMouseMoveGlobal);
    window.addEventListener("mouseup",onMouseUpGlobal);
    return()=>{window.removeEventListener("mousemove",onMouseMoveGlobal);window.removeEventListener("mouseup",onMouseUpGlobal);};
  },[onMouseMoveGlobal,onMouseUpGlobal]);

  const draggingSong=draggingId?orderedSongs.find(s=>s.id===draggingId):null;
  const draggingKeyDisplay=draggingId?(keyOverrides[draggingId]||orderedSongs.find(s=>s.id===draggingId)?.key||""):null;

  return(
    <div ref={containerRef} style={{...noSelect,position:"relative",touchAction:draggingId?"none":"auto"}}>
      {/* Global no-select style while dragging */}
      {draggingId&&<style>{`*{user-select:none!important;-webkit-user-select:none!important;}`}</style>}

      {orderedSongs.map((song,visualIdx)=>{
        const isBeingDragged=song.id===draggingId;
        const displayKey=keyOverrides[song.id]||song.key||"";
        const hasOverride=keyOverrides[song.id]&&keyOverrides[song.id]!==song.key;
        return(
          <div key={song.id} style={{
            opacity:isBeingDragged?0:1,      // hide in-list item while dragging (ghost shows instead)
            transition:"opacity 0.15s ease",
            marginBottom:7,
          }}>
            <SetlistRow
              song={song}
              displayIdx={visualIdx}
              displayKey={displayKey}
              hasOverride={hasOverride}
              origKey={song.key||""}
              onKeyChange={onKeyChange}
              onRemove={onRemove}
              onTapToPlay={()=>!draggingId&&onTapToPlay(visualIdx)}
              onTouchStart={e=>onTouchStart(song.id,e)}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={e=>onMouseDown(song.id,e)}
              draggingActive={!!draggingId}
            />
          </div>
        );
      })}

      {/* Fixed-position ghost — locked to finger */}
      {draggingId&&draggingSong&&(()=>{
        const W=containerRef.current?.getBoundingClientRect().width||340;
        const left=containerRef.current?.getBoundingClientRect().left||0;
        return(
          <div style={{
            position:"fixed",
            top:ghostY-28,
            left,
            width:W,
            zIndex:999,
            pointerEvents:"none",
            transform:"scale(1.04) rotate(0.8deg)",
            boxShadow:"0 12px 40px rgba(0,0,0,0.6)",
            borderRadius:10,
            transition:"none",
          }}>
            <div style={{background:T.surface,border:`1.5px solid ${T.accent}`,borderRadius:10,padding:"11px 13px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{color:T.textFaint,fontSize:16,flexShrink:0}}>⠿</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{draggingSong.title}</div>
                <div style={{fontSize:11,color:T.accent,fontFamily:T.mono,marginTop:1}}>{draggingKeyDisplay}</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function SetlistRow({song,displayIdx,displayKey,hasOverride,origKey,onKeyChange,onRemove,onTapToPlay,onTouchStart,onTouchMove,onTouchEnd,onMouseDown,draggingActive}) {
  const [showKeyPicker,setShowKeyPicker]=useState(false);
  const handleKey=k=>{onKeyChange(song.id,k);setShowKeyPicker(false);};

  return(
    <div
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",display:"flex",alignItems:"center",gap:10,cursor:"grab",touchAction:"none"}}
    >
      <div style={{color:T.textFaint,fontSize:16,flexShrink:0}}>⠿</div>
      <div style={{color:T.accent,fontFamily:T.mono,fontSize:13,width:18,textAlign:"center",flexShrink:0}}>{displayIdx+1}</div>
      <div style={{flex:1,minWidth:0,cursor:draggingActive?"grabbing":"pointer"}} onClick={()=>!draggingActive&&onTapToPlay()}>
        <div style={{fontSize:14,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{song.title}</div>
        <div style={{fontSize:11,color:T.textMuted,fontFamily:T.mono,marginTop:1}}>
          <span style={{color:hasOverride?T.accent:T.textMuted}}>{displayKey||"No key"}</span>
          {hasOverride&&<span style={{color:T.textFaint}}> (orig: {origKey})</span>}
          {song.note?<span style={{color:T.textFaint}}> · {song.note}</span>:""}
        </div>
      </div>
      {/* Remove */}
      <button onClick={e=>{e.stopPropagation();onRemove(song.id);}} style={{background:"none",border:"none",color:T.textFaint,fontSize:20,cursor:"pointer",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
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

  // Prevent scroll bleed-through on backdrop
  const onBackdropTouch=e=>{e.preventDefault();e.stopPropagation();};

  return(
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",touchAction:"none"}}
      onTouchMove={onBackdropTouch}
      onClick={onClose}
    >
      <div
        onClick={e=>e.stopPropagation()}
        onTouchMove={e=>e.stopPropagation()}
        style={{background:T.surface,borderRadius:"16px 16px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",WebkitOverflowScrolling:"touch",border:`1px solid ${T.border}`,borderBottom:"none",touchAction:"pan-y"}}
      >
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
  return(
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
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:150,display:"flex",flexDirection:"column",touchAction:"none"}} onClick={onClose} onTouchMove={e=>{e.preventDefault();e.stopPropagation();}}>
      <div onClick={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} style={{flex:1,display:"flex",flexDirection:"column",background:T.bg,marginTop:"env(safe-area-inset-top, 44px)",touchAction:"pan-y"}}>
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
function PerformanceView({songs,currentIndex,onIndexChange,onExit,onUpdateSong,keyOverrides,onKeyOverrideChange}) {
  const W=window.innerWidth;
  const [offsetX,setOffsetX]=useState(0);
  const [settling,setSettling]=useState(false);
  const [overlayIdx,setOverlayIdx]=useState(currentIndex);
  const [chordMode,setChordMode]=useState(false);
  const [liveNotes,setLiveNotes]=useState({});
  const [showKeyPicker,setShowKeyPicker]=useState(false);
  const [editingNote,setEditingNote]=useState(false);
  // Local key overrides seeded from setlist overrides
  const [localKeys,setLocalKeys]=useState({...keyOverrides});
  const startX=useRef(null),startY=useRef(null),isHoriz=useRef(false);
  const lastX=useRef(0),lastT=useRef(0),vel=useRef(0);

  const song=songs[overlayIdx]||songs[currentIndex];
  const nextSong=songs[overlayIdx+1]||null;
  const liveKey=localKeys[song?.id]??song?.key??"";
  const liveNote=liveNotes[song?.id]??song?.note??"";

  useEffect(()=>{setOverlayIdx(currentIndex);setOffsetX(0);setSettling(false);},[currentIndex]);

  const commitSwipe=useCallback((targetIdx)=>{
    setSettling(true);setOffsetX(-(targetIdx-currentIndex)*W);setOverlayIdx(targetIdx);
    setTimeout(()=>{onIndexChange(targetIdx);setOffsetX(0);setSettling(false);},300);
  },[currentIndex,W,onIndexChange]);

  const handleKeyChange=k=>{setLocalKeys(p=>({...p,[song.id]:k}));setShowKeyPicker(false);onKeyOverrideChange(song.id,k);};
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

  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:100,display:"flex",flexDirection:"column",overflow:"hidden",...noSelect}} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
      {/* Header */}
      <div style={{paddingTop:"env(safe-area-inset-top, 12px)",background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={onExit} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",padding:"4px 0"}}>← Back</button>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>{songs.map((_,i)=><div key={i} style={{width:i===overlayIdx?18:6,height:6,borderRadius:3,background:i===overlayIdx?T.accent:T.border,transition:"width 0.25s,background 0.25s"}}/>)}</div>
          <div style={{fontFamily:T.mono,fontSize:12,color:T.textMuted}}>{overlayIdx+1}/{songs.length}</div>
        </div>
      </div>

      {/* Song info — fades on swipe */}
      <div style={{padding:"12px 18px 10px",borderBottom:`1px solid ${T.borderLight}`,background:T.bg,opacity:overlayFade,transition:settling?"opacity 0.2s ease":"none",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
          <div style={{fontSize:21,fontWeight:600,color:T.text}}>{song.title}</div>
          {nextSong&&<div style={{fontSize:11,color:T.textFaint,fontFamily:T.mono}}>next: <span style={{color:T.textMuted}}>{nextSong.title}</span></div>}
        </div>
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative"}}>
            <div onClick={()=>setShowKeyPicker(p=>!p)} style={{...pill,background:T.accentBg,color:T.accent,borderColor:T.accentBorder,fontWeight:600}}>
              {liveKey||"?"}{song.key&&liveKey!==song.key?<span style={{opacity:0.5,fontSize:11}}> ({song.key})</span>:null} ▾
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

      {/* Sliding strip */}
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        <div style={{display:"flex",width:`${songs.length*100}%`,height:"100%",transform:`translateX(${stripX}px)`,transition:settling?"transform 0.3s cubic-bezier(0.25,1,0.5,1)":"none",willChange:"transform"}}>
          {songs.map(s=>{const lk=localKeys[s.id]??s.key??"";return<div key={s.id} style={{width:`${100/songs.length}%`,height:"100%",flexShrink:0}}><SongPanel song={s} chordMode={chordMode} liveKey={lk}/></div>;})}
        </div>
      </div>

      {showKeyPicker&&<div onClick={()=>setShowKeyPicker(false)} style={{position:"fixed",inset:0,zIndex:200}}/>}

      {/* Bottom nav */}
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
  const [tabIndex,setTabIndex]=useState(0);
  const [songs,setSongs]=useState(DEFAULT_SONGS);
  const [setlist,setSetlist]=useState([]);
  const [keyOverrides,setKeyOverrides]=useState(()=>{try{return JSON.parse(localStorage.getItem(SETLIST_KEYS_STORAGE)||"{}");}catch{return {};}});
  const [performing,setPerforming]=useState(false);
  const [perfIndex,setPerfIndex]=useState(0);
  const [modal,setModal]=useState(null);
  const [previewSong,setPreviewSong]=useState(null);
  const [search,setSearch]=useState("");
  const [syncStatus,setSyncStatus]=useState("loading");
  const [lastSync,setLastSync]=useState(null);
  const syncTimer=useRef(null);
  const firstSong=useRef(true),firstSetlist=useRef(true);

  // ── Tab swipe — finger-tracked like song swipe ──
  const W=window.innerWidth;
  const [tabOffsetX,setTabOffsetX]=useState(0);
  const [tabSettling,setTabSettling]=useState(false);
  const tabStartX=useRef(null),tabStartY=useRef(null),tabIsHoriz=useRef(false);
  const tabLastX=useRef(0),tabLastT=useRef(0),tabVel=useRef(0);

  const onTabTS=e=>{
    if(modal||previewSong)return;
    tabStartX.current=e.touches[0].clientX;tabStartY.current=e.touches[0].clientY;
    tabIsHoriz.current=false;tabLastX.current=e.touches[0].clientX;tabLastT.current=Date.now();tabVel.current=0;
  };
  const onTabTM=e=>{
    if(!tabStartX.current||tabSettling)return;
    const dx=e.touches[0].clientX-tabStartX.current,dy=e.touches[0].clientY-tabStartY.current;
    if(!tabIsHoriz.current&&Math.abs(dx)<8&&Math.abs(dy)<8)return;
    if(!tabIsHoriz.current){tabIsHoriz.current=Math.abs(dx)>Math.abs(dy);}
    if(!tabIsHoriz.current)return;
    e.preventDefault();
    const now=Date.now(),dt=now-tabLastT.current;
    if(dt>0)tabVel.current=(e.touches[0].clientX-tabLastX.current)/dt;
    tabLastX.current=e.touches[0].clientX;tabLastT.current=now;
    const atLeft=tabIndex===0&&dx>0, atRight=tabIndex===1&&dx<0;
    setTabOffsetX(atLeft||atRight?dx*0.15:dx);
  };
  const onTabTE=()=>{
    if(!tabStartX.current)return;tabStartX.current=null;
    const eff=tabOffsetX+tabVel.current*100,thr=W*0.3;
    let target=tabIndex;
    if(eff<-thr&&tabIndex===0)target=1;
    else if(eff>thr&&tabIndex===1)target=0;
    // Settle
    setTabSettling(true);
    setTabOffsetX(target===tabIndex?0:target===1?-W:W);
    setTimeout(()=>{setTabIndex(target);setTabOffsetX(0);setTabSettling(false);},280);
  };

  // Persist key overrides
  useEffect(()=>{localStorage.setItem(SETLIST_KEYS_STORAGE,JSON.stringify(keyOverrides));},[keyOverrides]);

  // Cloud sync
  useEffect(()=>{
    if(!unlocked)return;
    (async()=>{
      try{
        const {songs:cs,setlist:csl}=await fetchFromCloud();
        if(cs&&cs.length>0)setSongs(cs);
        if(csl)setSetlist(csl.ids||[]);
        setSyncStatus("synced");setLastSync(new Date().toISOString());
      }catch{setSyncStatus("error");}
    })();
  },[unlocked]);
  useEffect(()=>{
    if(firstSong.current){firstSong.current=false;return;}
    if(!unlocked)return;
    setSyncStatus("syncing");clearTimeout(syncTimer.current);
    syncTimer.current=setTimeout(async()=>{try{await pushSongs(songs);setSyncStatus("synced");setLastSync(new Date().toISOString());}catch{setSyncStatus("error");}},1200);
  },[songs]);
  useEffect(()=>{
    if(firstSetlist.current){firstSetlist.current=false;return;}
    if(!unlocked)return;
    setSyncStatus("syncing");
    (async()=>{try{await pushSetlist(setlist);setSyncStatus("synced");setLastSync(new Date().toISOString());}catch{setSyncStatus("error");}})();
  },[setlist]);

  if(!unlocked)return<PinScreen onUnlock={()=>setUnlocked(true)}/>;

  const setlistSongs=setlist.map(id=>songs.find(s=>s.id===id)).filter(Boolean);
  const filtered=songs.filter(s=>s.title.toLowerCase().includes(search.toLowerCase()));
  const grouped=TYPE_ORDER.map(type=>({type,songs:filtered.filter(s=>s.type===type).sort((a,b)=>a.title.localeCompare(b.title))})).filter(g=>g.songs.length>0);
  const ungrouped=filtered.filter(s=>!TYPE_ORDER.includes(s.type)).sort((a,b)=>a.title.localeCompare(b.title));

  const toggleSong=id=>{setSetlist(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);};
  const removeSong=id=>{setSetlist(p=>p.filter(x=>x!==id));setKeyOverrides(p=>{const n={...p};delete n[id];return n;});};
  const saveSong=data=>{if(modal&&modal.id)setSongs(p=>p.map(s=>s.id===modal.id?{...s,...data}:s));else{const id=Date.now();setSongs(p=>[...p,{id,...data}]);}};
  const deleteSong=id=>{setSongs(p=>p.filter(s=>s.id!==id));setSetlist(p=>p.filter(x=>x!==id));};
  const updateSong=(id,changes)=>setSongs(p=>p.map(s=>s.id===id?{...s,...changes}:s));
  const setKeyOverride=(songId,key)=>setKeyOverrides(p=>({...p,[songId]:key}));
  const reorderSetlist=newIds=>setSetlist(newIds);
  const startFromIndex=i=>{setPerfIndex(i);setPerforming(true);};

  if(performing&&setlistSongs.length>0)return(
    <PerformanceView songs={setlistSongs} currentIndex={perfIndex} onIndexChange={i=>setPerfIndex(i)} onExit={()=>setPerforming(false)} onUpdateSong={updateSong} keyOverrides={keyOverrides} onKeyOverrideChange={setKeyOverride}/>
  );

  const dot=syncStatus==="synced"?"#4ade80":syncStatus==="syncing"?"#f59e0b":syncStatus==="error"?"#f87171":T.textFaint;
  const syncLabel=syncStatus==="synced"?`Synced ${fmtTime(lastSync)}`:syncStatus==="syncing"?"Syncing…":syncStatus==="error"?"Sync failed":"Loading…";

  // Tab strip translateX
  const tabStripX=tabIndex===0?tabOffsetX:(-W+tabOffsetX);

  return(
    <div style={{height:"100vh",background:T.bg,fontFamily:T.font,color:T.text,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{height:"env(safe-area-inset-top,0px)",background:T.bg,flexShrink:0}}/>

      {/* Header */}
      <div style={{padding:"16px 16px 0",maxWidth:560,margin:"0 auto",width:"100%",flexShrink:0,boxSizing:"border-box"}}>
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
          {["Setlist","Library"].map((t,i)=>(
            <button key={t} onClick={()=>setTabIndex(i)} style={{flex:1,background:tabIndex===i?T.bg:"transparent",border:tabIndex===i?`1px solid ${T.border}`:"1px solid transparent",borderRadius:7,padding:"8px",cursor:"pointer",color:tabIndex===i?T.text:T.textMuted,fontSize:14,transition:"all 0.15s"}}>
              {i===0?`Setlist${setlistSongs.length?` (${setlistSongs.length})`:""}`:`Library (${songs.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Swipeable tab content — finger tracked */}
      <div
        style={{flex:1,overflow:"hidden",position:"relative"}}
        onTouchStart={onTabTS}
        onTouchMove={onTabTM}
        onTouchEnd={onTabTE}
      >
        <div style={{
          display:"flex",
          width:"200%",
          height:"100%",
          transform:`translateX(${tabStripX}px)`,
          transition:tabSettling?"transform 0.28s cubic-bezier(0.25,1,0.5,1)":"none",
          willChange:"transform",
        }}>
          {/* Setlist pane — fixed height, no extra scroll space */}
          <div data-scroll="true" style={{width:"50%",height:"100%",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
            <div style={{maxWidth:560,margin:"0 auto",padding:"0 16px 140px",boxSizing:"border-box"}}>
              {setlistSongs.length===0
                ?<div style={{textAlign:"center",padding:"60px 0",color:T.textFaint}}><div style={{fontSize:32,marginBottom:10}}>♩</div><div style={{fontSize:14}}>No songs yet.</div><div style={{fontSize:13,marginTop:4}}>Swipe left to add from Library.</div></div>
                :<DraggableSetlist
                  songs={setlistSongs}
                  keyOverrides={keyOverrides}
                  onKeyChange={setKeyOverride}
                  onRemove={removeSong}
                  onReorder={reorderSetlist}
                  onTapToPlay={startFromIndex}
                />
              }
            </div>
          </div>

          {/* Library pane */}
          <div style={{width:"50%",height:"100%",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
            <div style={{maxWidth:560,margin:"0 auto",padding:"0 16px 140px",boxSizing:"border-box"}}>
              {/* Search + type pills — slides with the library */}
              <div style={{paddingTop:4,paddingBottom:4}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search songs…" style={{...inputStyle,marginBottom:10}}/>
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                  {TYPE_ORDER.map(t=>{const ts=TYPE_STYLES[t];return<span key={t} style={{fontSize:11,color:ts.color,background:ts.bg,border:`1px solid ${ts.border}`,borderRadius:4,padding:"2px 8px",fontFamily:T.mono}}>{t}</span>;})}
                </div>
              </div>
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
