import { useState, useEffect } from "react";

const GROUPS = {
  A: ["México",       "Sudáfrica",      "Corea del Sur",     "Chequia"],
  B: ["Canadá",       "Bosnia-Herz.", "Catar",          "Suiza"],
  C: ["Brasil",       "Marruecos",      "Haití",          "Escocia"],
  D: ["EE.UU.",       "Paraguay",       "Australia",      "Turquía"],
  E: ["Alemania",     "Curazao",        "C. de Marfil","Ecuador"],
  F: ["Países Bajos", "Japón",          "Suecia",         "Túnez"],
  G: ["Bélgica",      "Egipto",         "Irán",           "N. Zelanda"],
  H: ["España",       "Cabo Verde",     "Arabia Saudí",   "Uruguay"],
  I: ["Francia",      "Senegal",        "Irak",           "Noruega"],
  J: ["Argentina",    "Argelia",        "Austria",        "Jordania"],
  K: ["Portugal",     "RD Congo",       "Uzbekistán",     "Colombia"],
  L: ["Inglaterra",   "Croacia",        "Ghana",          "Panamá"],
};

const FLAG = {
  "México":"MX","Sudáfrica":"ZA","Corea del Sur":"KR","Chequia":"CZ",
  "Canadá":"CA","Bosnia-Herz.":"BA","Catar":"QA","Suiza":"CH",
  "Brasil":"BR","Marruecos":"MA","Haití":"HT","Escocia":"SCO",
  "EE.UU.":"US","Paraguay":"PY","Australia":"AU","Turquía":"TR",
  "Alemania":"DE","Curazao":"CW","C. de Marfil":"CI","Ecuador":"EC",
  "Países Bajos":"NL","Japón":"JP","Suecia":"SE","Túnez":"TN",
  "Bélgica":"BE","Egipto":"EG","Irán":"IR","N. Zelanda":"NZ",
  "España":"ES","Cabo Verde":"CV","Arabia Saudí":"SA","Uruguay":"UY",
  "Francia":"FR","Senegal":"SN","Irak":"IQ","Noruega":"NO",
  "Argentina":"AR","Argelia":"DZ","Austria":"AT","Jordania":"JO",
  "Portugal":"PT","RD Congo":"CD","Uzbekistán":"UZ","Colombia":"CO",
  "Inglaterra":"ENG","Croacia":"HR","Ghana":"GH","Panamá":"PA",
};

const ROUND_LABEL = {
  R32:"Dieciseisavos de Final",
  R16:"Octavos de Final",
  QF:"Cuartos de Final",
  SF:"Semifinales",
  F:"Final",
};

const EMPTY_BRACKET = {
  R32: Array(16).fill(null),
  R16: Array(8).fill(null),
  QF:  Array(4).fill(null),
  SF:  Array(2).fill(null),
  F:   Array(1).fill(null),
};

export default function PollaMundialista() {
  const [tab, setTab]             = useState("grupos");
  const [nombre, setNombre]       = useState("");
  const [inputNombre, setInputNombre] = useState("");
  const [qualified, setQualified] = useState({});
  const [terceros, setTerceros]   = useState([]);
  const [bracket, setBracket]     = useState(JSON.parse(JSON.stringify(EMPTY_BRACKET)));
  const [registros, setRegistros] = useState([]);
  const [guardado, setGuardado]   = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [cargando, setCargando]   = useState(false);
  const [guardando, setGuardando] = useState(false);

  const BIN_ID  = "6a20a04dda38895dfe834d42";
  const API_KEY = "$2a$10$bSQY/8H76jOu.3rMA4x6eedGYuWMpjKJc/ws.1FuruNn4k4r0tWR6";
  const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
  const HEADERS = {
    "Content-Type": "application/json",
    "X-Master-Key": API_KEY,
    "X-Bin-Versioning": "false",
  };

  useEffect(() => { cargarRegistros(); }, []);

  async function cargarRegistros() {
    setCargando(true);
    try {
      const res  = await fetch(BIN_URL + "/latest", { headers: HEADERS });
      const json = await res.json();
      const data = json.record || [];
      setRegistros(Array.isArray(data) ? data.filter(r => r && r.nombre) : []);
    } catch(e) { console.error(e); }
    setCargando(false);
  }

  async function guardarEnBin(nuevos) {
    await fetch(BIN_URL, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(nuevos),
    });
  }

  // ── Grupos ────────────────────────────────────────────────────────────────
  function setPosicion(group, pos, team) {
    setQualified(prev => {
      const next = { ...prev };
      [1,2,3].forEach(p => { if (next[`${group}_${p}`] === team) delete next[`${group}_${p}`]; });
      next[`${group}_${pos}`] = team;
      return next;
    });
    setGuardado(false);
  }

  function clearPosicion(group, pos) {
    setQualified(prev => { const n = {...prev}; delete n[`${group}_${pos}`]; return n; });
    setGuardado(false);
  }

  function grupoCompleto(g) {
    return !!(qualified[`${g}_1`] && qualified[`${g}_2`] && qualified[`${g}_3`]);
  }

  function allGruposDone() {
    return Object.keys(GROUPS).every(grupoCompleto);
  }

  // ── Terceros ──────────────────────────────────────────────────────────────
  function toggleTercero(team) {
    setTerceros(prev => {
      if (prev.includes(team)) return prev.filter(t => t !== team);
      if (prev.length >= 8) return prev;
      return [...prev, team];
    });
    setGuardado(false);
  }

  function tercerosDone() { return terceros.length === 8; }

  // ── R32 matchups ──────────────────────────────────────────────────────────
  function getR32Matchups() {
    const q = qualified;
    const t = terceros;
    return [
      [q["A_1"], q["B_2"]],
      [q["C_1"], q["D_2"]],
      [q["E_1"], q["F_2"]],
      [q["G_1"], q["H_2"]],
      [q["I_1"], q["J_2"]],
      [q["K_1"], q["L_2"]],
      [q["B_1"], q["A_2"]],
      [q["D_1"], q["C_2"]],
      [q["F_1"], q["E_2"]],
      [q["H_1"], q["G_2"]],
      [q["J_1"], q["I_2"]],
      [q["L_1"], q["K_2"]],
      [t[0]||null, t[1]||null],
      [t[2]||null, t[3]||null],
      [t[4]||null, t[5]||null],
      [t[6]||null, t[7]||null],
    ];
  }

  // ── Bracket ───────────────────────────────────────────────────────────────
  function pickWinner(round, idx, team) {
    setBracket(prev => {
      const next = {
        R32:[...prev.R32], R16:[...prev.R16],
        QF:[...prev.QF],   SF:[...prev.SF],
        F:[...prev.F],
      };
      if (round === "R32") {
        next.R32[idx] = team;
        next.R16[Math.floor(idx/2)] = null;
        next.QF[Math.floor(idx/4)]  = null;
        next.SF[Math.floor(idx/8)]  = null;
        next.F[0] = null;
      } else if (round === "R16") {
        next.R16[idx] = team;
        next.QF[Math.floor(idx/2)] = null;
        next.SF[Math.floor(idx/4)] = null;
        next.F[0] = null;
      } else if (round === "QF") {
        next.QF[idx] = team;
        next.SF[Math.floor(idx/2)] = null;
        next.F[0] = null;
      } else if (round === "SF") {
        next.SF[idx] = team;
        next.F[0] = null;
      } else {
        next.F[0] = team;
      }
      return next;
    });
    setGuardado(false);
  }

  function getMatchups(round) {
    if (round === "R32") return getR32Matchups();
    if (round === "R16") return Array.from({length:8}, (_,i) => [bracket.R32[i*2], bracket.R32[i*2+1]]);
    if (round === "QF")  return Array.from({length:4}, (_,i) => [bracket.R16[i*2], bracket.R16[i*2+1]]);
    if (round === "SF")  return [[bracket.QF[0],bracket.QF[1]], [bracket.QF[2],bracket.QF[3]]];
    return [[bracket.SF[0], bracket.SF[1]]];
  }

  function isEnabled(round) {
    if (round === "R32") return allGruposDone() && tercerosDone();
    if (round === "R16") return bracket.R32.every(Boolean);
    if (round === "QF")  return bracket.R16.every(Boolean);
    if (round === "SF")  return bracket.QF.every(Boolean);
    return bracket.SF.every(Boolean);
  }

  function pollaCompleta() {
    return allGruposDone() && tercerosDone() && !!bracket.F[0];
  }

  // ── Guardar ───────────────────────────────────────────────────────────────
  async function guardarPolla() {
    if (!nombre || !pollaCompleta() || guardando) return;
    setGuardando(true);
    const data = {
      nombre, campeon: bracket.F[0],
      finalistas: [bracket.SF[0], bracket.SF[1]],
      cuartos: bracket.QF.filter(Boolean),
      terceros, qualified, bracket,
      fecha: new Date().toISOString(),
    };
    const prev = [...registros];
    const idx  = prev.findIndex(r => r.nombre.toLowerCase() === nombre.toLowerCase());
    if (idx >= 0) prev[idx] = data; else prev.push(data);
    await guardarEnBin(prev);
    setRegistros(prev);
    setGuardado(true);
    setGuardando(false);
    setTab("registros");
  }

  async function eliminar(nom) {
    const next = registros.filter(r => r.nombre !== nom);
    await guardarEnBin(next);
    setRegistros(next);
  }

  // ── Estilos ───────────────────────────────────────────────────────────────
  const gold = "#f5d000";
  const C = {
    gold,
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    dim: "rgba(255,255,255,0.35)",
  };

  const tabStyle = active => ({
    padding: "8px 14px",
    background: active ? gold : "transparent",
    color: active ? "#1a1200" : "rgba(255,255,255,0.45)",
    border: "none",
    borderBottom: active ? "none" : "2px solid rgba(255,255,255,0.07)",
    fontFamily: "'Barlow Condensed',sans-serif",
    fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px",
    textTransform: "uppercase", cursor: "pointer",
    borderRadius: active ? "8px 8px 0 0" : "0",
  });

  const gruposHechos = Object.keys(GROUPS).filter(grupoCompleto).length;
  const steps = [
    { label:`Grupos ${gruposHechos}/12`,  done: allGruposDone() },
    { label:`Terceros ${terceros.length}/8`, done: tercerosDone() },
    { label:"Bracket",                    done: !!bracket.F[0] },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div translate="no" lang="es" style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#0d0d0d 0%,#0f1a0a 50%,#0a0d1a 100%)",
      fontFamily:"'Barlow Condensed',sans-serif",
      color:"#e8e8e8",
    }}>

      {/* HEADER */}
      <div style={{
        background:"linear-gradient(90deg,#1a2e0f,#0a1230)",
        borderBottom:"2px solid #c8a100",
        padding:"16px 28px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:"10px",
      }}>
        <div>
          <div style={{fontSize:"10px",letterSpacing:"4px",color:"#c8a100",marginBottom:"3px"}}>FIFA WORLD CUP 2026 · 48 SELECCIONES</div>
          <div style={{fontSize:"28px",fontWeight:"900",letterSpacing:"2px",lineHeight:1,color:"#fff"}}>🏆 POLLA MUNDIALISTA</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"8px"}}>
          {/* Steps */}
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"flex-end"}}>
            {steps.map((s,i) => (
              <span key={i} style={{
                padding:"3px 9px",
                background: s.done ? "rgba(0,200,100,0.13)" : "rgba(255,255,255,0.04)",
                border: s.done ? "1px solid rgba(0,200,100,0.28)" : "1px solid rgba(255,255,255,0.09)",
                borderRadius:"20px", fontSize:"10px", fontWeight:"700", letterSpacing:"1px",
                color: s.done ? "#00c864" : "rgba(255,255,255,0.3)",
              }}>
                {s.done ? "✓ " : ""}{s.label}
              </span>
            ))}
          </div>
          {/* Nombre */}
          {!nombre ? (
            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
              <input
                value={inputNombre}
                onChange={e => setInputNombre(e.target.value)}
                onKeyDown={e => e.key==="Enter" && inputNombre.trim() && setNombre(inputNombre.trim())}
                placeholder="Tu nombre..."
                style={{
                  background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.16)",
                  borderRadius:"6px",padding:"7px 11px",color:"#fff",
                  fontFamily:"'Barlow Condensed',sans-serif",fontSize:"13px",
                  letterSpacing:"1px",outline:"none",width:"140px",
                }}
              />
              <button onClick={() => inputNombre.trim() && setNombre(inputNombre.trim())} style={{
                padding:"7px 14px",background:gold,color:"#1a1200",border:"none",
                borderRadius:"6px",fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:"12px",fontWeight:"800",cursor:"pointer",
              }}>OK</button>
            </div>
          ) : (
            <div style={{fontSize:"13px",color:gold,fontWeight:"700",letterSpacing:"2px"}}>
              👤 {nombre.toUpperCase()}
              {bracket.F[0] && <span style={{color:"rgba(255,255,255,0.38)",fontWeight:"400",marginLeft:"8px"}}>· 🏆 {bracket.F[0]}</span>}
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{padding:"18px 28px 0",display:"flex",gap:"3px",flexWrap:"wrap",borderBottom:"2px solid rgba(255,255,255,0.07)"}}>
        {[
          {key:"grupos",    label:"⚽ Grupos"},
          {key:"terceros",  label:"3️⃣ Mejores Terceros"},
          {key:"bracket",   label:"🏆 Bracket"},
          {key:"registros", label:`📋 Registros (${registros.length})`},
        ].map(({key,label}) => (
          <button key={key} style={tabStyle(tab===key)} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      <div style={{padding:"22px 28px"}}>

        {/* ═══════════ GRUPOS ═══════════ */}
        {tab === "grupos" && (
          <div>
            {!nombre && (
              <div style={{padding:"11px 15px",marginBottom:"14px",background:"rgba(245,208,0,0.06)",border:"1px solid rgba(245,208,0,0.18)",borderRadius:"7px",fontSize:"11px",color:"rgba(245,208,0,0.6)",letterSpacing:"1px"}}>
                ⚠️ INGRESA TU NOMBRE ARRIBA ANTES DE COMENZAR
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}>
              <p style={{color:C.dim,fontSize:"11px",letterSpacing:"1px",margin:0}}>
                ELIGE 1º, 2º Y 3º DE CADA GRUPO · {gruposHechos}/12 COMPLETOS
              </p>
              {allGruposDone() && (
                <button onClick={() => setTab("terceros")} style={{
                  padding:"7px 18px",background:gold,color:"#1a1200",border:"none",
                  borderRadius:"6px",fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:"12px",fontWeight:"900",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",
                }}>ELEGIR TERCEROS →</button>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(245px,1fr))",gap:"12px"}}>
              {Object.entries(GROUPS).map(([g, teams]) => {
                const p1=qualified[`${g}_1`], p2=qualified[`${g}_2`], p3=qualified[`${g}_3`];
                const done = p1 && p2 && p3;
                return (
                  <div key={g} style={{
                    background:C.bg,
                    border: done ? "1px solid rgba(200,161,0,0.26)" : `1px solid ${C.border}`,
                    borderRadius:"10px",overflow:"hidden",
                  }}>
                    <div style={{
                      padding:"8px 13px",
                      background: done ? "linear-gradient(90deg,rgba(200,161,0,0.15),transparent)" : "rgba(255,255,255,0.02)",
                      borderBottom:`1px solid ${C.border}`,
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                    }}>
                      <span style={{fontSize:"15px",fontWeight:"900",letterSpacing:"2px",color:gold}}>GRUPO {g}</span>
                      {done && <span style={{fontSize:"12px"}}>✅</span>}
                    </div>
                    <div style={{padding:"9px"}}>
                      {/* Hint */}
                      <div style={{display:"flex",gap:"4px",marginBottom:"6px",alignItems:"center"}}>
                        {[{pos:1,label:"1°",bg:gold,fg:"#1a1200"},{pos:2,label:"2°",bg:"#555",fg:"#fff"},{pos:3,label:"3°",bg:"#333",fg:"rgba(255,255,255,0.55)"}].map(b=>(
                          <span key={b.pos} style={{padding:"2px 6px",borderRadius:"3px",background:b.bg,color:b.fg,fontSize:"8px",fontWeight:"800",letterSpacing:"1px"}}>{b.label}</span>
                        ))}
                        <span style={{fontSize:"8px",color:"rgba(255,255,255,0.2)",letterSpacing:"1px",marginLeft:"2px"}}>TOCA PARA ASIGNAR</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                        {teams.map(team => {
                          const isP1=p1===team, isP2=p2===team, isP3=p3===team;
                          const assigned = isP1||isP2||isP3;
                          const badge = isP1?"1°":isP2?"2°":isP3?"3°":null;
                          const badgeBg = isP1?gold:isP2?"#555":"#333";
                          const badgeFg = isP1?"#1a1200":"#fff";
                          return (
                            <div key={team} style={{display:"flex",alignItems:"center",gap:"5px"}}>
                              {badge
                                ? <span style={{width:"19px",height:"19px",borderRadius:"50%",background:badgeBg,color:badgeFg,fontSize:"8px",fontWeight:"900",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{badge}</span>
                                : <span style={{width:"19px",flexShrink:0}}/>
                              }
                              <button
                                onClick={() => {
                                  if (assigned) {
                                    clearPosicion(g, isP1?1:isP2?2:3);
                                  } else {
                                    if (!p1) setPosicion(g,1,team);
                                    else if (!p2) setPosicion(g,2,team);
                                    else if (!p3) setPosicion(g,3,team);
                                  }
                                }}
                                style={{
                                  flex:1, display:"flex", alignItems:"center", gap:"6px",
                                  background: isP1 ? "linear-gradient(90deg,rgba(245,208,0,0.16),rgba(245,208,0,0.03))"
                                             : isP2 ? "rgba(255,255,255,0.06)"
                                             : isP3 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
                                  border: isP1 ? "1px solid rgba(245,208,0,0.38)"
                                         : isP2 ? "1px solid rgba(255,255,255,0.12)"
                                         : isP3 ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.04)",
                                  borderRadius:"5px", padding:"6px 9px",
                                  color: assigned ? "#fff" : "rgba(255,255,255,0.45)",
                                  fontFamily:"'Barlow Condensed',sans-serif",
                                  fontSize:"11px", fontWeight:assigned?"700":"500",
                                  letterSpacing:"0.5px", textTransform:"uppercase",
                                  cursor:"pointer", transition:"all 0.12s",
                                }}
                              >
                                <span style={{fontSize:"12px"}}>{FLAG[team]||"🏳️"}</span>
                                {team}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ TERCEROS ═══════════ */}
        {tab === "terceros" && (
          <div>
            {!allGruposDone() ? (
              <div style={{padding:"18px 20px",background:"rgba(255,100,0,0.08)",border:"1px solid rgba(255,100,0,0.2)",borderRadius:"8px",color:"rgba(255,180,100,0.8)",fontSize:"12px",letterSpacing:"1px"}}>
                ⚠️ PRIMERO COMPLETA TODOS LOS GRUPOS (1º, 2º Y 3º)
              </div>
            ) : (
              <>
                <div style={{marginBottom:"18px"}}>
                  <div style={{fontSize:"18px",fontWeight:"900",letterSpacing:"2px",color:gold,marginBottom:"3px"}}>
                    3️⃣ ELIGE LOS 8 MEJORES TERCEROS
                  </div>
                  <div style={{fontSize:"11px",color:C.dim,letterSpacing:"1px",marginBottom:"8px"}}>
                    HAY 12 EQUIPOS EN 3° LUGAR · SELECCIONA LOS 8 QUE CREES QUE CLASIFICAN
                  </div>
                  {/* Barra */}
                  <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden",maxWidth:"300px"}}>
                    <div style={{height:"100%",width:`${(terceros.length/8)*100}%`,background:`linear-gradient(90deg,#c8a100,${gold})`,transition:"width 0.3s"}}/>
                  </div>
                  <div style={{fontSize:"10px",color:tercerosDone()?"#00c864":C.dim,letterSpacing:"1px",marginTop:"4px"}}>
                    {terceros.length}/8 SELECCIONADOS {tercerosDone()?"✓":""}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"9px"}}>
                  {Object.entries(GROUPS).map(([g]) => {
                    const team = qualified[`${g}_3`];
                    if (!team) return null;
                    const selected = terceros.includes(team);
                    const lleno = terceros.length >= 8 && !selected;
                    return (
                      <button key={g}
                        onClick={() => !lleno && toggleTercero(team)}
                        disabled={lleno}
                        style={{
                          display:"flex", alignItems:"center", gap:"10px",
                          background: selected ? "linear-gradient(90deg,rgba(0,200,100,0.16),rgba(0,200,100,0.04))" : lleno ? "rgba(255,255,255,0.01)" : C.bg,
                          border: selected ? "1px solid rgba(0,200,100,0.42)" : lleno ? "1px solid rgba(255,255,255,0.04)" : `1px solid ${C.border}`,
                          borderRadius:"8px", padding:"11px 13px",
                          cursor: lleno ? "not-allowed" : "pointer",
                          transition:"all 0.14s", opacity:lleno?0.38:1,
                          textAlign:"left",
                        }}
                      >
                        <div style={{
                          width:"22px",height:"22px",borderRadius:"50%",
                          background: selected ? "#00c864" : "rgba(255,255,255,0.08)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:"10px",fontWeight:"900",
                          color: selected ? "#002a14" : "rgba(255,255,255,0.35)",
                          flexShrink:0,
                        }}>
                          {selected ? `${terceros.indexOf(team)+1}` : "3°"}
                        </div>
                        <div>
                          <div style={{fontSize:"9px",color:"rgba(255,255,255,0.28)",letterSpacing:"2px",marginBottom:"1px"}}>GRUPO {g}</div>
                          <div style={{fontSize:"13px",fontWeight:"700",letterSpacing:"0.5px",textTransform:"uppercase",color:selected?"#00c864":"rgba(255,255,255,0.75)",display:"flex",alignItems:"center",gap:"5px"}}>
                            <span style={{fontSize:"9px",fontWeight:"800",background:"rgba(0,200,100,0.15)",padding:"1px 4px",borderRadius:"3px",letterSpacing:"0.5px",flexShrink:0}}>{FLAG[team]||"?"}</span>
                            {team}
                          </div>
                        </div>
                        {selected && <span style={{marginLeft:"auto",color:"#00c864",fontSize:"13px"}}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {tercerosDone() && (
                  <div style={{
                    marginTop:"18px",padding:"15px 18px",
                    background:"linear-gradient(90deg,rgba(0,200,100,0.1),rgba(0,200,100,0.02))",
                    border:"1px solid rgba(0,200,100,0.28)",borderRadius:"9px",
                    display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",
                  }}>
                    <div>
                      <div style={{fontSize:"15px",fontWeight:"900",color:"#00c864"}}>✅ 8 TERCEROS ELEGIDOS</div>
                      <div style={{fontSize:"10px",color:"rgba(255,255,255,0.38)",marginTop:"2px"}}>
                        {terceros.map(t=>`${FLAG[t]||""}${t}`).join(" · ")}
                      </div>
                    </div>
                    <button onClick={() => setTab("bracket")} style={{
                      padding:"9px 20px",background:gold,color:"#1a1200",border:"none",
                      borderRadius:"6px",fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:"13px",fontWeight:"900",letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",
                    }}>IR AL BRACKET →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════ BRACKET ═══════════ */}
        {tab === "bracket" && (
          <div>
            {(!allGruposDone() || !tercerosDone()) && (
              <div style={{padding:"13px 17px",background:"rgba(255,100,0,0.08)",border:"1px solid rgba(255,100,0,0.2)",borderRadius:"8px",marginBottom:"18px",color:"rgba(255,180,100,0.8)",fontSize:"12px",letterSpacing:"1px"}}>
                ⚠️ {!allGruposDone() ? "COMPLETA TODOS LOS GRUPOS PRIMERO" : "ELIGE LOS 8 MEJORES TERCEROS PRIMERO"}
              </div>
            )}

            {["R32","R16","QF","SF","F"].map(round => {
              const matchups = getMatchups(round);
              const winners  = bracket[round];
              const enabled  = isEnabled(round);
              const isFinal  = round === "F";
              const cols     = round==="R32"||round==="R16"||round==="QF" ? 4 : round==="SF" ? 2 : 1;

              return (
                <div key={round} style={{marginBottom:"30px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"11px"}}>
                    <div style={{
                      fontSize:isFinal?"18px":"13px",fontWeight:"900",letterSpacing:"3px",
                      textTransform:"uppercase",color:isFinal?gold:"rgba(255,255,255,0.58)",
                    }}>
                      {isFinal?"🏆 ":""}{ROUND_LABEL[round]}
                    </div>
                    <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>
                  </div>

                  <div style={{
                    display:"grid",
                    gridTemplateColumns:`repeat(${Math.min(matchups.length,cols)},1fr)`,
                    gap:"9px",
                    opacity:enabled?1:0.3,
                    pointerEvents:enabled?"auto":"none",
                  }}>
                    {matchups.map(([tA,tB],i) => {
                      const w = winners[i];
                      const esTercero = round==="R32" && i>=12;
                      return (
                        <div key={i} style={{
                          background: w?"rgba(200,161,0,0.06)":C.bg,
                          border: w?"1px solid rgba(200,161,0,0.22)":`1px solid ${C.border}`,
                          borderRadius:"8px",overflow:"hidden",
                        }}>
                          <div style={{
                            padding:"4px 9px",background:"rgba(0,0,0,0.17)",
                            fontSize:"9px",letterSpacing:"2px",
                            display:"flex",justifyContent:"space-between",alignItems:"center",
                            color:"rgba(255,255,255,0.2)",
                          }}>
                            <span>{isFinal?"GRAN FINAL":`P${i+1}`}</span>
                            {esTercero && <span style={{color:"rgba(0,200,100,0.45)"}}>3°</span>}
                          </div>
                          <div style={{padding:"7px",display:"flex",flexDirection:"column",gap:"4px"}}>
                            {[tA,tB].map((team,ti) => (
                              <button key={ti}
                                onClick={() => team && pickWinner(round,i,team)}
                                disabled={!team}
                                style={{
                                  display:"flex",alignItems:"center",gap:"7px",
                                  background: w===team ? "linear-gradient(90deg,rgba(245,208,0,0.2),rgba(245,208,0,0.04))" : "rgba(255,255,255,0.03)",
                                  border: w===team ? "1px solid rgba(245,208,0,0.52)" : "1px solid rgba(255,255,255,0.07)",
                                  borderRadius:"5px",padding:"7px 9px",
                                  color: !team?"rgba(255,255,255,0.16)":w===team?gold:"#d5d5d5",
                                  fontFamily:"'Barlow Condensed',sans-serif",
                                  fontSize:"11px",fontWeight:w===team?"800":"500",
                                  letterSpacing:"0.5px",textTransform:"uppercase",
                                  cursor:team?"pointer":"default",
                                  transition:"all 0.12s",width:"100%",
                                }}
                              >
                                <span style={{fontSize:"9px",fontWeight:"800",background:"rgba(255,255,255,0.12)",padding:"1px 4px",borderRadius:"3px",letterSpacing:"0.5px",flexShrink:0}}>{team?FLAG[team]||"?":"?"}</span>
                                <span>{team||"Por definir"}</span>
                                {w===team && <span style={{marginLeft:"auto",fontSize:"10px"}}>✓</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {pollaCompleta() && (
              <div style={{
                marginTop:"12px",padding:"22px",
                background: guardado
                  ? "linear-gradient(135deg,rgba(0,200,100,0.1),rgba(0,80,40,0.05))"
                  : "linear-gradient(135deg,rgba(200,161,0,0.12),rgba(100,80,0,0.05))",
                border: guardado?"2px solid #00c864":`2px solid ${gold}`,
                borderRadius:"13px",textAlign:"center",
              }}>
                <div style={{fontSize:"30px",marginBottom:"6px"}}>🏆</div>
                <div style={{fontSize:"22px",fontWeight:"900",color:gold,marginBottom:"14px"}}>
                  {FLAG[bracket.F[0]]} {bracket.F[0]?.toUpperCase()} CAMPEÓN
                </div>
                {!nombre ? (
                  <div style={{color:"rgba(255,200,0,0.5)",fontSize:"11px",letterSpacing:"1px"}}>⚠️ INGRESA TU NOMBRE PARA GUARDAR</div>
                ) : guardado ? (
                  <div style={{color:"#00c864",fontSize:"14px",fontWeight:"700",letterSpacing:"2px"}}>✅ POLLA GUARDADA</div>
                ) : (
                  <button onClick={guardarPolla} style={{
                    padding:"11px 28px",background:gold,color:"#1a1200",border:"none",
                    borderRadius:"7px",fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:"14px",fontWeight:"900",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",
                  }}>
                    {guardando ? "GUARDANDO..." : `💾 GUARDAR POLLA DE ${nombre.toUpperCase()}`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ REGISTROS ═══════════ */}
        {tab === "registros" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px",flexWrap:"wrap",gap:"8px"}}>
              <div>
                <div style={{fontSize:"18px",fontWeight:"900",letterSpacing:"2px",color:gold}}>📋 POLLAS REGISTRADAS</div>
                <div style={{fontSize:"10px",color:C.dim,letterSpacing:"2px",marginTop:"2px"}}>{cargando ? "CARGANDO..." : `${registros.length} PARTICIPANTE${registros.length!==1?"S":""}`}</div>
              </div>
              <button onClick={() => cargarRegistros()} style={{
                padding:"6px 13px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:"5px",
                color:C.dim,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"10px",letterSpacing:"1px",cursor:"pointer",
              }}>🔄 ACTUALIZAR</button>
            </div>

            {registros.length === 0 ? (
              <div style={{padding:"48px",textAlign:"center",background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.07)",borderRadius:"9px",color:"rgba(255,255,255,0.18)",fontSize:"12px",letterSpacing:"1px"}}>
                AÚN NO HAY POLLAS REGISTRADAS
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {registros.map((reg,idx) => (
                  <div key={idx} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"9px",overflow:"hidden"}}>
                    <div
                      style={{padding:"11px 15px",display:"flex",alignItems:"center",gap:"11px",flexWrap:"wrap",cursor:"pointer"}}
                      onClick={() => setExpandido(expandido===idx?null:idx)}
                    >
                      <div style={{width:"26px",height:"26px",borderRadius:"50%",background:`linear-gradient(135deg,#c8a100,${gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"900",color:"#1a1200",flexShrink:0}}>
                        {idx+1}
                      </div>
                      <div style={{flex:1,minWidth:"90px"}}>
                        <div style={{fontSize:"16px",fontWeight:"800",letterSpacing:"1px"}}>{reg.nombre}</div>
                        <div style={{fontSize:"9px",color:"rgba(255,255,255,0.26)",letterSpacing:"1px",marginTop:"1px"}}>
                          {new Date(reg.fecha).toLocaleString("es-EC",{dateStyle:"short",timeStyle:"short"})}
                        </div>
                      </div>
                      <div style={{padding:"6px 12px",background:"linear-gradient(90deg,rgba(245,208,0,0.11),rgba(245,208,0,0.02))",border:"1px solid rgba(245,208,0,0.2)",borderRadius:"6px",textAlign:"center",minWidth:"105px"}}>
                        <div style={{fontSize:"8px",color:"rgba(245,208,0,0.48)",letterSpacing:"2px",marginBottom:"1px"}}>CAMPEÓN</div>
                        <div style={{fontSize:"13px",fontWeight:"800",color:gold}}>{reg.campeon}</div>
                      </div>
                      <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                        {(reg.finalistas||[]).filter(Boolean).map((t,i) => (
                          <span key={i} style={{padding:"3px 7px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:"4px",fontSize:"10px",color:"rgba(255,255,255,0.55)",fontWeight:"600"}}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                        <span style={{fontSize:"10px",color:"rgba(255,255,255,0.18)"}}>{expandido===idx?"▲":"▼"}</span>
                        <button onClick={e=>{e.stopPropagation();eliminar(reg.nombre);}} style={{
                          padding:"3px 8px",background:"rgba(255,50,50,0.09)",border:"1px solid rgba(255,50,50,0.16)",
                          borderRadius:"4px",color:"rgba(255,100,100,0.6)",fontFamily:"'Barlow Condensed',sans-serif",
                          fontSize:"10px",cursor:"pointer",
                        }}>✕</button>
                      </div>
                    </div>

                    {expandido === idx && (
                      <div style={{padding:"12px 15px",borderTop:"1px solid rgba(255,255,255,0.05)",background:"rgba(0,0,0,0.18)"}}>

                        {/* BRACKET COMPLETO */}
                        {[
                          {key:"SF", label:"SEMIFINALES",        data: reg.bracket?.SF||[], color:"rgba(245,208,0,0.55)"},
                          {key:"QF", label:"CUARTOS DE FINAL",   data: reg.bracket?.QF||[], color:"rgba(255,255,255,0.35)"},
                          {key:"R16",label:"OCTAVOS DE FINAL",   data: reg.bracket?.R16||[], color:"rgba(255,255,255,0.25)"},
                          {key:"R32",label:"DIECISEISAVOS",      data: reg.bracket?.R32||[], color:"rgba(255,255,255,0.2)"},
                        ].map(({key,label,data,color}) => (
                          <div key={key} style={{marginBottom:"10px"}}>
                            <div style={{fontSize:"9px",letterSpacing:"2px",marginBottom:"5px",color}}>{label}</div>
                            <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                              {data.filter(Boolean).map((t,i) => (
                                <span key={i} style={{
                                  padding:"3px 8px",
                                  background: key==="SF"?"rgba(245,208,0,0.08)":"rgba(255,255,255,0.04)",
                                  border: key==="SF"?"1px solid rgba(245,208,0,0.2)":`1px solid ${C.border}`,
                                  borderRadius:"4px",fontSize:"10px",fontWeight:"600",
                                  color: key==="SF"?"rgba(245,208,0,0.8)":"rgba(255,255,255,0.55)",
                                }}>{t}</span>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* MEJORES TERCEROS */}
                        <div style={{marginBottom:"10px"}}>
                          <div style={{fontSize:"9px",color:"rgba(0,200,100,0.5)",letterSpacing:"2px",marginBottom:"5px"}}>MEJORES TERCEROS ELEGIDOS</div>
                          <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                            {(reg.terceros||[]).map((t,i) => (
                              <span key={i} style={{padding:"3px 8px",background:"rgba(0,200,100,0.06)",border:"1px solid rgba(0,200,100,0.18)",borderRadius:"4px",fontSize:"10px",color:"rgba(0,200,100,0.7)"}}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* GRUPOS */}
                        <div>
                          <div style={{fontSize:"9px",color:"rgba(255,255,255,0.22)",letterSpacing:"2px",marginBottom:"6px"}}>FASE DE GRUPOS</div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"6px"}}>
                            {Object.keys(GROUPS).map(g => {
                              const p1=reg.qualified?.[`${g}_1`];
                              const p2=reg.qualified?.[`${g}_2`];
                              const p3=reg.qualified?.[`${g}_3`];
                              if (!p1&&!p2&&!p3) return null;
                              return (
                                <div key={g} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:"5px",padding:"6px 8px"}}>
                                  <div style={{fontSize:"8px",color:"rgba(245,208,0,0.5)",letterSpacing:"2px",marginBottom:"4px",fontWeight:"800"}}>GRUPO {g}</div>
                                  {[[p1,"1°",gold,"#1a1200"],[p2,"2°","#555","#fff"],[p3,"3°","#333","rgba(255,255,255,0.5)"]].map(([team,badge,bg,fg],i) => (
                                    team && <div key={i} style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"2px"}}>
                                      <span style={{padding:"1px 4px",borderRadius:"3px",background:bg,color:fg,fontSize:"7px",fontWeight:"800",flexShrink:0}}>{badge}</span>
                                      <span style={{fontSize:"10px",color:"rgba(255,255,255,0.65)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.3px"}}>{team}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
