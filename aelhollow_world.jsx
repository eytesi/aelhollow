import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────
const T = {
  bg:"#0b0e17", bgDeep:"#070a11", surface:"#111520", surfaceHigh:"#161c2c",
  border:"#1e2535", borderGlow:"rgba(148,190,255,0.15)",
  text:"#d4dff7", textDim:"#6a7a9b", textFaint:"#2e3a52",
  gold:"#e8c87a", goldDim:"#8a6e2e",
  accent:"#94beff", accentDim:"#2a4070",
  magne:"#e05a3a", tunda:"#5abbe0", kateer:"#4ade8a",
  lerudio:"#c47aff", jana:"#7aaeff",
};
const rgb = h=>`${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;

// ─── CONSTANTS ────────────────────────────────────────────────────
const SAVE_KEY = "aelhollow_world_v1";
const TICK_MS  = 8000; // real ms per in-game 10 minutes
const ENERGY_COST = { class:20, study:15, explore:12, socialize:8, craft:18, sleep:-60, eat:-5, shower:-3, fun:-10 };

// ─── NPC DATA ─────────────────────────────────────────────────────
const NPCS = [
  { id:"saevik",    name:"Saevik",     pronouns:"elle/les", planet:"Jkeyll",    house:"player", year:1, role:"student",
    color:"#9a7acc", desc:"Frío/a, observador/a. Dice muy poco — pero lo que dice pesa.", relation:20 },
  { id:"tessaly",   name:"Tessaly",    pronouns:"ella/la",  planet:"Orlea",     house:"player", year:1, role:"student",
    color:"#ffd566", desc:"Habla rápido, anota todo. Cambia de opinión si le das un argumento mejor.", relation:20 },
  { id:"roen",      name:"Roen",       pronouns:"él/lo",    planet:"Lochby",    house:"magne",  year:1, role:"student",
    color:"#4ade8a", desc:"Cálido, físico, se ríe fuerte. Parece simple hasta que no lo es.", relation:0 },
  { id:"vaeldrin",  name:"Vael Drin",  pronouns:"elle/les", planet:"Aelhaven",  house:"tunda",  year:1, role:"student",
    color:"#e8c87a", desc:"Político/a nato/a. Sabe exactamente qué decir y cuándo.", relation:0 },
  { id:"suri",      name:"Suri",       pronouns:"ella/la",  planet:"Clearelf",  house:"jana",   year:1, role:"student",
    color:"#7adde8", desc:"Siempre en forma etérea cuando cree que nadie la mira. Su esfera es casi siempre violeta.", relation:0 },
  { id:"kael",      name:"Kael",       pronouns:"él/lo",    planet:"Vaxan",     house:"lerudio",year:1, role:"student",
    color:"#e05a3a", desc:"Sin majka innata pero obsesionado con entenderla. Toma notas de todo.", relation:0 },
  { id:"miraoss",   name:"Mira Oss",   pronouns:"ella/la",  planet:"Orlea",     house:"kateer", year:1, role:"student",
    color:"#ffd566", desc:"Velocísima en movimiento y pensamiento. Competitiva sin disimulo.", relation:0 },
  { id:"theron",    name:"Theron",     pronouns:"él/lo",    planet:"Aelhaven",  house:"magne",  year:1, role:"student",
    color:"#e8c87a", desc:"Carismático, líder natural de su casa. Tiene un secreto que guarda hace años.", relation:0 },
  { id:"lys",       name:"Lys",        pronouns:"elle/les", planet:"Jkeyll",    house:"tunda",  year:1, role:"student",
    color:"#9a7acc", desc:"Ceniza más oscura que la mayoría. Temperamental. Leal hasta el extremo con quien se lo gana.", relation:0 },
  { id:"davo",      name:"Davo",       pronouns:"él/lo",    planet:"Lochby",    house:"kateer", year:1, role:"student",
    color:"#4ade8a", desc:"Tranquilo como el agua profunda. Habla poco, actúa mucho.", relation:0 },
  { id:"neri",      name:"Neri",       pronouns:"ella/la",  planet:"Clearelf",  house:"lerudio",year:1, role:"student",
    color:"#7adde8", desc:"Su esfera cambia de color tan rápido que es difícil leerla. Especialista en alquimia emocional.", relation:0 },
  { id:"caiusvel",  name:"Caius Vel",  pronouns:"él/lo",    planet:"Aelhaven",  house:"jana",   year:1, role:"student",
    color:"#e8c87a", desc:"Llegó con una historia que nadie conoce del todo. Protege a los más débiles sin que se lo pidan.", relation:0 },
  { id:"fen",       name:"Fen",        pronouns:"elle/les", planet:"Vaxan",     house:"lerudio",year:1, role:"student",
    color:"#e05a3a", desc:"Rebelde de Vaxan, desterrado/a por mostrar afinidad con majka. Furioso/a por dentro.", relation:0 },
  { id:"isolde",    name:"Isolde",     pronouns:"ella/la",  planet:"Orlea",     house:"tunda",  year:1, role:"student",
    color:"#ffd566", desc:"Brillante e impulsiva. Siempre tiene la teoría correcta un paso antes que todos.", relation:0 },
  { id:"bryn",      name:"Bryn",       pronouns:"elle/les", planet:"Aelhaven",  house:"jana",   year:4, role:"student",
    color:"#7aaeff", desc:"Año 4. Conoce todos los pasajes secretos del edificio. Ayuda a los más nuevos sin explicar por qué.", relation:0 },
  { id:"calder",    name:"Calder",     pronouns:"él/lo",    planet:"Jkeyll",    house:"magne",  year:3, role:"student",
    color:"#9a7acc", desc:"Año 3. El Jkeilkin más respetado de Magne en décadas. Tiene algo que demostrar.", relation:0 },
  { id:"dael",      name:"Prof. Dael Orren",  pronouns:"él/lo", planet:"Aelhaven", house:null, year:null, role:"professor",
    color:"#e8c87a", desc:"Historia Mágica. Sabe más de lo que dice — y dice exactamente lo suficiente para que no puedas ignorarlo.", relation:5 },
  { id:"marensuul", name:"Prof. Maren Suul", pronouns:"ella/la", planet:"Clearelf", house:null, year:null, role:"professor",
    color:"#7adde8", desc:"Alquimia & Botánica. Estricta, justa, fascinada por las plantas que nadie más puede cultivar.", relation:0 },
  { id:"voss",      name:"Prof. Voss", pronouns:"él/lo",    planet:"Vaxan",     house:null, year:null, role:"professor",
    color:"#e05a3a", desc:"Estudios de Artefactos. El único profesor sin majka innata. Eso lo hace el mejor en entender cómo funcionan desde afuera.", relation:0 },
  { id:"eryn",      name:"Eryn",       pronouns:"elle/les", planet:"Orlea",     house:null, year:null, role:"staff",
    color:"#ffd566", desc:"Bibliotecario/a jefe. Sabe exactamente qué hay en el ala restringida. No lo dice. Tampoco miente.", relation:0 },
];

// ─── MAP ZONES ────────────────────────────────────────────────────
const ZONES = [
  { id:"dormitory",   name:"Dormitorio",          icon:"🛏",  x:72, y:18, unlocked:true,
    desc:"Tu habitación y la de tus compañeros/as de casa. Podés descansar, estudiar o hablar con quienes viven acá.",
    actions:["sleep","study","socialize"] },
  { id:"dining",      name:"Comedor",             icon:"🍽",  x:50, y:30, unlocked:true,
    desc:"Centro social de la academia. La comida cambia con las estaciones. Siempre hay alguien acá.",
    actions:["eat","socialize","fun"] },
  { id:"courtyard",   name:"Patio Central",       icon:"◈",   x:50, y:50, unlocked:true,
    desc:"El corazón del campus. Cruce de caminos. Siempre hay algo pasando.",
    actions:["socialize","explore","fun"] },
  { id:"library",     name:"Biblioteca",          icon:"📚",  x:28, y:28, unlocked:true,
    desc:"Cinco pisos de conocimiento. El sótano está cerrado hasta que tengas acceso de nivel 4.",
    actions:["study","research"] },
  { id:"alchemy_lab", name:"Lab. de Alquimia",    icon:"⚗",   x:72, y:55, unlocked:true,
    desc:"Huele a azufre y lavanda. Siempre hay algo burbujeando.",
    actions:["craft","study","class"] },
  { id:"botanical",   name:"Conservatorio",       icon:"🌿",  x:20, y:62, unlocked:true,
    desc:"Invernadero con plantas que escuchan conversaciones. Tranquilo en las mañanas.",
    actions:["study","craft","fun"] },
  { id:"rune_archive",name:"Archivos Rúnicos",    icon:"ᚠ",   x:80, y:38, unlocked:true,
    desc:"Sala circular. Las runas en las paredes son activables con el nivel correcto.",
    actions:["study","craft","research"] },
  { id:"great_hall",  name:"Gran Salón",          icon:"🏛",  x:50, y:72, unlocked:true,
    desc:"El salón de ceremonias y eventos. Vacío la mayoría del tiempo. Imponente cuando está lleno.",
    actions:["socialize","explore"] },
  { id:"bathrooms",   name:"Baños",               icon:"🚿",  x:85, y:22, unlocked:true,
    desc:"Básico pero necesario.",
    actions:["shower"] },
  { id:"town",        name:"Pueblo de Aelhollow", icon:"🏘",  x:15, y:80, unlocked:true,
    desc:"Más allá de los muros. Comercio, festivales, gente con vidas propias.",
    actions:["fun","socialize","explore"] },
  { id:"forest",      name:"El Bosque",           icon:"🌲",  x:82, y:75, unlocked:false,
    desc:"Desbloqueo progresivo. Criaturas, ruinas, secretos. Cerrado para primer año hasta otoño.",
    unlockReq:"Año 1 · Temporada Otoño", actions:["explore","research"] },
  { id:"lake",        name:"El Lago",             icon:"◌",   x:35, y:85, unlocked:false,
    desc:"Tranquilo en verano. Inquieto en invierno. Algo vive ahí.",
    unlockReq:"Nivel de Majka 15", actions:["explore","fun","research"] },
  { id:"ruins",       name:"Las Ruinas",          icon:"◫",   x:65, y:88, unlocked:false,
    desc:"Estructura pre-academia. Clave para el misterio central.",
    unlockReq:"Año 2 · Historia Mágica nivel 20", actions:["explore","research"] },
  { id:"library_b",   name:"Sótano de la Biblioteca", icon:"🔐", x:28, y:42, unlocked:false,
    desc:"Acceso restringido. Nivel 4 de acceso académico.",
    unlockReq:"Nivel Académico 4", actions:["research","study"] },
  { id:"staff_area",  name:"Área del Staff",      icon:"⚙",   x:10, y:40, unlocked:false,
    desc:"Restringida. Accesible bajo ciertas condiciones.",
    unlockReq:"Condición especial", actions:["socialize","research"] },
];

// ─── ACADEMIC SUBJECTS ────────────────────────────────────────────
const SUBJECTS = [
  { id:"historia",    name:"Historia Mágica",         icon:"📜", color:"#e8c87a", professor:"dael" },
  { id:"alquimia",    name:"Alquimia",                icon:"⚗",  color:"#c47aff", professor:"marensuul" },
  { id:"botanica",    name:"Botánica Arcana",         icon:"🌿", color:"#4ade8a", professor:"marensuul" },
  { id:"sigilcraft",  name:"Sigilcraft & Runas",      icon:"ᚠ",  color:"#7adde8", professor:"voss" },
  { id:"invocacion",  name:"Invocación",              icon:"◉",  color:"#9a7acc", professor:null },
  { id:"astromancia", name:"Astromancia",             icon:"✧",  color:"#ffd566", professor:null },
  { id:"encantamiento",name:"Tejido de Encantamientos",icon:"❋", color:"#5abbe0", professor:null },
  { id:"bestiologia", name:"Bestiología",             icon:"🦎", color:"#4ade8a", professor:null },
  { id:"artefactos",  name:"Estudios de Artefactos",  icon:"⚙",  color:"#e05a3a", professor:"voss" },
];

// ─── MAJKA TYPES ──────────────────────────────────────────────────
const MAJKA_TYPES = [
  { id:"hechizos",  name:"Hechizos",   icon:"✦", color:"#94beff" },
  { id:"pociones",  name:"Pociones",   icon:"⚗", color:"#c47aff" },
  { id:"sigilos",   name:"Sigilos",    icon:"ᚠ", color:"#7adde8" },
  { id:"rituales",  name:"Rituales",   icon:"◉", color:"#9a7acc" },
  { id:"artefactos",name:"Artefactos", icon:"⚙", color:"#e05a3a" },
];

// ─── INITIAL GRIMOIRE ENTRIES ─────────────────────────────────────
const INIT_GRIMOIRE = {
  hechizos: [
    { id:"luz_menor", name:"Luz Menor", desc:"Una pequeña luz que dura mientras la concentración se mantenga. El primer hechizo que casi todos aprenden.", level:1, discovered:true },
    { id:"???_1", name:"???", desc:"Desconocido", level:2, discovered:false },
    { id:"???_2", name:"???", desc:"Desconocido", level:3, discovered:false },
  ],
  pociones: [
    { id:"???_p1", name:"???", desc:"Desconocido", level:1, discovered:false },
    { id:"???_p2", name:"???", desc:"Desconocido", level:2, discovered:false },
  ],
  sigilos: [
    { id:"sigilo_fundadores", name:"Sigilo de los Fundadores", desc:"Lo viste en la base de la estatua. No está en ningún libro que hayas encontrado.", level:"?", discovered:true, special:true },
    { id:"???_s1", name:"???", desc:"Desconocido", level:1, discovered:false },
  ],
  rituales: [
    { id:"???_r1", name:"???", desc:"Desconocido", level:1, discovered:false },
  ],
  artefactos: [
    { id:"???_a1", name:"???", desc:"Desconocido", level:1, discovered:false },
  ],
};

// ─── INITIAL WORLD STATE ──────────────────────────────────────────
function initWorld(char) {
  return {
    // Time
    day: 3, // Day 3 of year 1 (after the narrative intro)
    hour: 7,
    minute: 0,
    season: "verano",
    year: 1,
    // Needs (0-100)
    energy: 80,
    hunger: 70,
    hygiene: 85,
    fun: 60,
    // Majka
    majkaLevel: 2,
    subjects: Object.fromEntries(SUBJECTS.map(s=>[s.id, s.id==="historia"?5:0])),
    // Grimoire
    grimoire: INIT_GRIMOIRE,
    // NPCs — resolve "player" house
    npcs: NPCS.map(n=>({
      ...n,
      house: n.house==="player" ? char.house : n.house,
      relation: n.id==="saevik"||n.id==="tessaly" ? 20 : n.id==="dael" ? 8 : 0,
    })),
    // Map
    zones: ZONES,
    // Active location
    location: "dormitory",
    // Schedule — classes on certain days
    schedule: buildSchedule(),
    // Log
    log: ["Día 3. Primera semana en Aelhollow Academy."],
    // Pending event
    pendingEvent: null,
  };
}

function buildSchedule() {
  // Days 1-7 of each week. Format: { day, hour, subjectId, zoneId }
  return [
    { day:"lunes",    hour:8,  subjectId:"historia",     zoneId:"great_hall",   name:"Historia Mágica" },
    { day:"lunes",    hour:14, subjectId:"alquimia",     zoneId:"alchemy_lab",  name:"Alquimia" },
    { day:"martes",   hour:9,  subjectId:"botanica",     zoneId:"botanical",    name:"Botánica Arcana" },
    { day:"martes",   hour:15, subjectId:"sigilcraft",   zoneId:"rune_archive", name:"Sigilcraft & Runas" },
    { day:"miercoles",hour:8,  subjectId:"artefactos",   zoneId:"alchemy_lab",  name:"Estudios de Artefactos" },
    { day:"miercoles",hour:14, subjectId:"encantamiento",zoneId:"great_hall",   name:"Tejido de Encantamientos" },
    { day:"jueves",   hour:9,  subjectId:"invocacion",   zoneId:"great_hall",   name:"Invocación" },
    { day:"jueves",   hour:15, subjectId:"astromancia",  zoneId:"rune_archive", name:"Astromancia" },
    { day:"viernes",  hour:10, subjectId:"bestiologia",  zoneId:"botanical",    name:"Bestiología" },
  ];
}

const DAY_NAMES = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];

function getDayName(dayNum) {
  return DAY_NAMES[((dayNum - 1) % 7)];
}

function formatTime(h, m) {
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// ─── SAVE/LOAD ────────────────────────────────────────────────────
const saveWorld = (world) => { try { localStorage.setItem(SAVE_KEY, JSON.stringify({world, ts:Date.now()})); } catch(e){} };
const loadWorld = () => { try { const d = localStorage.getItem(SAVE_KEY); return d ? JSON.parse(d).world : null; } catch(e){ return null; } };

// ─── UI HELPERS ───────────────────────────────────────────────────
function NeedBar({ label, icon, value, color, warn }) {
  const pct = Math.max(0, Math.min(100, value));
  const low = pct < 25;
  return (
    <div style={{ marginBottom:"0.35rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2px" }}>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", color: low ? "#e05a3a" : T.textDim,
          letterSpacing:"0.1em" }}>{icon} {label}</span>
        <span style={{ fontFamily:"'Lora',serif", fontSize:"0.6rem", color: low ? "#e05a3a" : T.textFaint }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`,
          background: low ? `linear-gradient(90deg,#8b2020,#e05a3a)` : `linear-gradient(90deg,${color},${color}aa)`,
          transition:"width 0.5s ease" }} />
      </div>
    </div>
  );
}

function SubjectBar({ subject, value }) {
  const pct = Math.min(100, value);
  return (
    <div style={{ marginBottom:"0.4rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2px" }}>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color: T.textDim,
          letterSpacing:"0.06em" }}>{subject.icon} {subject.name}</span>
        <span style={{ fontFamily:"'Lora',serif", fontSize:"0.6rem", color: value > 0 ? subject.color : T.textFaint }}>
          {value}/100
        </span>
      </div>
      <div style={{ height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`,
          background:`linear-gradient(90deg,${subject.color}88,${subject.color})`,
          transition:"width 0.6s ease" }} />
      </div>
    </div>
  );
}

function IconBtn({ icon, label, active, onClick, color=T.accent, disabled=false }) {
  const [h, setH] = useState(false);
  const on = active || h;
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px",
        padding:"0.5rem 0.6rem", background: active ? `rgba(${rgb(color)},0.14)` : "transparent",
        border:`1px solid ${on ? color : T.border}`, borderRadius:"3px",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
        transition:"all 0.18s", minWidth:"52px" }}>
      <span style={{ fontSize:"1.1rem" }}>{icon}</span>
      <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", color: on ? color : T.textDim,
        letterSpacing:"0.08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>
    </button>
  );
}

function Panel({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(7,10,17,0.92)",
      display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"1rem 1.25rem", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.75rem", color:T.gold,
          letterSpacing:"0.2em", textTransform:"uppercase" }}>{title}</div>
        <button onClick={onClose} style={{ background:"transparent", border:"none",
          color:T.textDim, cursor:"pointer", fontSize:"1.1rem", padding:"0.2rem 0.5rem" }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"1.25rem" }}>
        {children}
      </div>
    </div>
  );
}

function RelationBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 60 ? T.kateer : pct >= 30 ? T.gold : T.textDim;
  const label = pct >= 80 ? "Vínculo profundo" : pct >= 60 ? "Amigo/a" : pct >= 40 ? "Conocido/a" : pct >= 20 ? "Conocido/a reciente" : "Desconocido/a";
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
        <span style={{ fontFamily:"'Lora',serif", fontSize:"0.72rem", fontStyle:"italic", color }}>{label}</span>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color:T.textFaint }}>{Math.round(pct)}</span>
      </div>
      <div style={{ height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color}66,${color})` }} />
      </div>
    </div>
  );
}

// ─── MAP COMPONENT ────────────────────────────────────────────────
function WorldMap({ world, onZoneClick }) {
  const [hovered, setHovered] = useState(null);
  const hoverZone = world.zones.find(z=>z.id===hovered);

  return (
    <div style={{ position:"relative", width:"100%", paddingBottom:"75%",
      background:`radial-gradient(ellipse at 50% 40%, rgba(148,190,255,0.04) 0%, transparent 70%), #0d1120`,
      border:`1px solid ${T.border}`, borderRadius:"4px", overflow:"hidden" }}>

      {/* Grid lines */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.08 }}>
        {[10,20,30,40,50,60,70,80,90].map(v=>(
          <g key={v}>
            <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke={T.accent} strokeWidth="0.5"/>
            <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke={T.accent} strokeWidth="0.5"/>
          </g>
        ))}
      </svg>

      {/* Academy boundary */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.15 }}>
        <ellipse cx="50%" cy="50%" rx="42%" ry="38%" fill="none" stroke={T.gold} strokeWidth="1" strokeDasharray="4 4"/>
      </svg>

      {/* Zone nodes */}
      {world.zones.map(zone => {
        const active = world.location === zone.id;
        const locked = !zone.unlocked;
        const hov = hovered === zone.id;
        return (
          <button key={zone.id}
            onClick={() => !locked && onZoneClick(zone.id)}
            onMouseEnter={() => setHovered(zone.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position:"absolute",
              left:`${zone.x}%`, top:`${zone.y}%`,
              transform:"translate(-50%,-50%)",
              background: active ? `rgba(${rgb(T.gold)},0.2)` : locked ? "rgba(0,0,0,0.5)" : hov ? `rgba(${rgb(T.accent)},0.12)` : "rgba(17,21,32,0.85)",
              border:`1.5px solid ${active ? T.gold : locked ? T.textFaint : hov ? T.accent : T.border}`,
              borderRadius:"4px", padding:"0.3rem 0.4rem",
              cursor: locked ? "not-allowed" : "pointer",
              opacity: locked ? 0.45 : 1,
              transition:"all 0.18s", zIndex: hov ? 5 : 1,
              display:"flex", flexDirection:"column", alignItems:"center", gap:"1px",
            }}>
            <span style={{ fontSize:"0.9rem", filter: locked ? "grayscale(1)" : "none" }}>{zone.icon}</span>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.45rem",
              color: active ? T.gold : locked ? T.textFaint : hov ? T.accent : T.textDim,
              letterSpacing:"0.06em", whiteSpace:"nowrap",
              maxWidth:"60px", textAlign:"center", lineHeight:1.2 }}>
              {zone.name}
            </span>
            {active && <div style={{ width:"4px", height:"4px", borderRadius:"50%",
              background:T.gold, marginTop:"1px", animation:"pulse 2s ease-in-out infinite" }}/>}
          </button>
        );
      })}

      {/* Hover tooltip */}
      {hoverZone && (
        <div style={{ position:"absolute", bottom:"8px", left:"8px", right:"8px",
          background:"rgba(7,10,17,0.95)", border:`1px solid ${T.border}`,
          borderRadius:"3px", padding:"0.6rem 0.75rem", pointerEvents:"none",
          animation:"fadeUp 0.15s ease" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem",
            color: hoverZone.unlocked ? T.accent : T.textDim,
            letterSpacing:"0.1em", marginBottom:"0.2rem" }}>
            {hoverZone.icon} {hoverZone.name}
            {!hoverZone.unlocked && <span style={{ color:T.magne, marginLeft:"0.5rem", fontSize:"0.55rem" }}>BLOQUEADO</span>}
          </div>
          <div style={{ fontFamily:"'Lora',serif", fontSize:"0.75rem", color:T.textDim, lineHeight:1.5 }}>
            {hoverZone.unlocked ? hoverZone.desc : `Se desbloquea: ${hoverZone.unlockReq}`}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GRIMOIRE PANEL ───────────────────────────────────────────────
function GrimoirePanel({ world, onClose }) {
  const [tab, setTab] = useState("materias");
  const [majkaTab, setMajkaTab] = useState("hechizos");

  return (
    <Panel title="✦ Grimorio Personal" onClose={onClose}>
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem" }}>
        {["materias","majka"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"0.12em",
              textTransform:"uppercase", padding:"0.5rem 1rem",
              background: tab===t ? `rgba(${rgb(T.gold)},0.12)` : "transparent",
              border:`1px solid ${tab===t ? T.gold : T.border}`,
              color: tab===t ? T.gold : T.textDim, cursor:"pointer", borderRadius:"2px" }}>
            {t==="materias" ? "Materias" : "Tipos de Majka"}
          </button>
        ))}
      </div>

      {tab === "materias" && (
        <div>
          <div style={{ fontFamily:"'Lora',serif", fontSize:"0.82rem", color:T.textDim,
            fontStyle:"italic", marginBottom:"1.25rem", lineHeight:1.6 }}>
            Tu progreso académico en cada disciplina. Sube asistiendo a clases, estudiando, y practicando.
          </div>
          {SUBJECTS.map(s => (
            <div key={s.id} style={{ marginBottom:"1.1rem",
              background:T.surfaceHigh, border:`1px solid ${T.border}`,
              borderLeft:`3px solid ${world.subjects[s.id]>0 ? s.color : T.textFaint}`,
              borderRadius:"2px", padding:"0.85rem 1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem",
                  color: world.subjects[s.id]>0 ? s.color : T.textDim, letterSpacing:"0.08em" }}>
                  {s.icon} {s.name}
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem",
                  color: T.textDim }}>
                  {world.subjects[s.id] < 20 ? "Principiante" :
                   world.subjects[s.id] < 40 ? "Básico" :
                   world.subjects[s.id] < 60 ? "Intermedio" :
                   world.subjects[s.id] < 80 ? "Avanzado" : "Maestría"}
                </div>
              </div>
              <SubjectBar subject={s} value={world.subjects[s.id]} />
              {world.subjects[s.id] === 0 && (
                <div style={{ fontFamily:"'Lora',serif", fontSize:"0.72rem",
                  color:T.textFaint, fontStyle:"italic", marginTop:"0.35rem" }}>
                  Sin progreso todavía. Asistí a clase o estudiá para empezar.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "majka" && (
        <div>
          <div style={{ fontFamily:"'Lora',serif", fontSize:"0.82rem", color:T.textDim,
            fontStyle:"italic", marginBottom:"1.25rem", lineHeight:1.6 }}>
            Lo que descubriste sobre los tipos de majka. Cada entrada se desbloquea explorando, practicando o encontrando algo nuevo.
          </div>
          <div style={{ display:"flex", gap:"0.4rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
            {MAJKA_TYPES.map(m=>(
              <button key={m.id} onClick={()=>setMajkaTab(m.id)}
                style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em",
                  padding:"0.35rem 0.75rem",
                  background: majkaTab===m.id ? `rgba(${rgb(m.color)},0.15)` : "transparent",
                  border:`1px solid ${majkaTab===m.id ? m.color : T.border}`,
                  color: majkaTab===m.id ? m.color : T.textDim, cursor:"pointer", borderRadius:"2px" }}>
                {m.icon} {m.name}
              </button>
            ))}
          </div>
          {MAJKA_TYPES.filter(m=>m.id===majkaTab).map(mtype=>(
            <div key={mtype.id}>
              {(world.grimoire[mtype.id]||[]).map(entry=>(
                <div key={entry.id} style={{ marginBottom:"0.75rem",
                  background: entry.discovered ? T.surfaceHigh : "rgba(0,0,0,0.3)",
                  border:`1px solid ${entry.discovered ? (entry.special ? T.gold : mtype.color+"44") : T.border}`,
                  borderRadius:"2px", padding:"0.85rem 1rem",
                  opacity: entry.discovered ? 1 : 0.5 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: entry.discovered?"0.35rem":"0" }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem",
                      color: entry.discovered ? (entry.special ? T.gold : mtype.color) : T.textFaint,
                      letterSpacing:"0.06em" }}>
                      {entry.discovered ? `${mtype.icon} ${entry.name}` : "░░░░░░░░░░░"}
                    </div>
                    {entry.discovered && <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem",
                      color: T.textFaint, letterSpacing:"0.1em" }}>
                      Nivel {entry.level}
                    </div>}
                  </div>
                  {entry.discovered && (
                    <div style={{ fontFamily:"'Lora',serif", fontSize:"0.8rem",
                      color: entry.special ? T.text : T.textDim, fontStyle: entry.special ? "italic" : "normal",
                      lineHeight:1.6 }}>{entry.desc}</div>
                  )}
                  {!entry.discovered && (
                    <div style={{ fontFamily:"'Lora',serif", fontSize:"0.72rem",
                      color:T.textFaint, fontStyle:"italic" }}>Aún sin descubrir.</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── NPC PANEL ────────────────────────────────────────────────────
function NPCPanel({ world, onClose }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const filters = [
    { id:"all", label:"Todos" },
    { id:"student", label:"Estudiantes" },
    { id:"professor", label:"Profesores" },
    { id:"staff", label:"Staff" },
  ];
  const filtered = filter === "all"
    ? world.npcs
    : world.npcs.filter(n=>n.role===filter);
  const sel = selected ? world.npcs.find(n=>n.id===selected) : null;
  const house = sel?.house ? ["magne","tunda","kateer","lerudio","jana"].includes(sel.house) ? sel.house : null : null;
  const houseData = house ? { magne:{name:"Magne",color:T.magne}, tunda:{name:"Tunda",color:T.tunda}, kateer:{name:"Kateer",color:T.kateer}, lerudio:{name:"Lerudio",color:T.lerudio}, jana:{name:"Jana",color:T.jana} }[house] : null;

  return (
    <Panel title="◉ Personas Conocidas" onClose={onClose}>
      {!sel ? (
        <>
          <div style={{ display:"flex", gap:"0.4rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
            {filters.map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id)}
                style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.1em",
                  padding:"0.35rem 0.75rem",
                  background: filter===f.id ? `rgba(${rgb(T.accent)},0.12)` : "transparent",
                  border:`1px solid ${filter===f.id ? T.accent : T.border}`,
                  color: filter===f.id ? T.accent : T.textDim, cursor:"pointer", borderRadius:"2px" }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
            {filtered.map(npc=>(
              <button key={npc.id} onClick={()=>setSelected(npc.id)}
                style={{ textAlign:"left", background:T.surfaceHigh,
                  border:`1px solid ${npc.relation>0 ? npc.color+"44" : T.border}`,
                  borderRadius:"3px", padding:"0.75rem 0.85rem", cursor:"pointer",
                  transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.35rem" }}>
                  <div style={{ width:"8px", height:"8px", borderRadius:"50%",
                    background: npc.relation>0 ? npc.color : T.textFaint, flexShrink:0 }}/>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem",
                    color: npc.relation>0 ? T.text : T.textDim, letterSpacing:"0.04em" }}>{npc.name}</div>
                </div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:"0.68rem",
                  color:T.textFaint, fontStyle:"italic" }}>{npc.pronouns} · {npc.planet}</div>
                {npc.relation > 0 && <RelationBar value={npc.relation} />}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={()=>setSelected(null)} style={{ fontFamily:"'Cinzel',serif",
            fontSize:"0.6rem", color:T.textDim, background:"transparent", border:"none",
            cursor:"pointer", marginBottom:"1.25rem", letterSpacing:"0.1em",
            display:"flex", alignItems:"center", gap:"0.4rem" }}>
            ← Volver
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1rem" }}>
            <div style={{ width:"12px", height:"12px", borderRadius:"50%", background:sel.color }}/>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1rem", color:T.text }}>{sel.name}</div>
              <div style={{ fontFamily:"'Lora',serif", fontSize:"0.75rem", color:T.textDim, fontStyle:"italic" }}>
                {sel.pronouns} · {sel.planet} · {sel.role==="professor"?"Profesor/a":sel.role==="staff"?"Staff":`Año ${sel.year}`}
              </div>
            </div>
          </div>
          {houseData && (
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.62rem",
              color:houseData.color, letterSpacing:"0.12em",
              marginBottom:"0.75rem" }}>Casa {houseData.name}</div>
          )}
          <div style={{ fontFamily:"'Lora',serif", fontSize:"0.9rem", color:T.text,
            lineHeight:1.75, marginBottom:"1.25rem" }}>{sel.desc}</div>
          <div style={{ background:T.surfaceHigh, border:`1px solid ${T.border}`,
            borderRadius:"2px", padding:"0.85rem 1rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color:T.textDim,
              letterSpacing:"0.15em", marginBottom:"0.6rem" }}>RELACIÓN</div>
            <RelationBar value={sel.relation} />
            {sel.relation === 0 && (
              <div style={{ fontFamily:"'Lora',serif", fontSize:"0.78rem",
                color:T.textFaint, fontStyle:"italic", marginTop:"0.5rem" }}>
                Todavía no se conocen bien. Hablá con esta persona para construir una relación.
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

// ─── ACTION MENU ──────────────────────────────────────────────────
function ActionMenu({ zone, world, onAction, onClose }) {
  const ACTION_DATA = {
    sleep:     { label:"Descansar",   icon:"🌙", energy:-60, desc:"Recuperás energía. Avanza el tiempo varias horas." },
    eat:       { label:"Comer",       icon:"🍽",  hunger:30,  energy:-5,  desc:"Reducís el hambre. Cuesta un poco de energía." },
    study:     { label:"Estudiar",    icon:"📖", energy:-15, desc:"Subís el progreso en la materia más relevante de esta zona." },
    research:  { label:"Investigar",  icon:"🔍", energy:-18, desc:"Explorás el conocimiento disponible. Podés descubrir algo nuevo." },
    explore:   { label:"Explorar",    icon:"🗺",  energy:-12, desc:"Recorrés la zona. Podés encontrar personas, objetos o eventos." },
    socialize: { label:"Socializar",  icon:"◈",  energy:-8,  fun:10,     desc:"Charlás con alguien. Subís la relación con un NPC cercano." },
    craft:     { label:"Crear",       icon:"⚗",  energy:-18, desc:"Trabajás en pociones, sigilos o artefactos. Requiere materiales." },
    fun:       { label:"Descansar",   icon:"✦",  fun:20,     energy:-10, desc:"Hacés algo que disfrutás. Subís tu diversión." },
    shower:    { label:"Ducharte",    icon:"🚿", hygiene:30, energy:-3,  desc:"Te aseás. Simple y necesario." },
    class:     { label:"Ir a clase",  icon:"⟁",  energy:-20, desc:"Asistís a la clase correspondiente a esta aula. Sube la materia." },
  };

  const actions = (zone?.actions || []).filter(a => ACTION_DATA[a]);
  const canDo = (a) => world.energy >= Math.abs(ACTION_DATA[a]?.energy || 0);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:90, background:"rgba(7,10,17,0.8)",
      display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", background:T.surface,
        border:`1px solid ${T.border}`, borderTopLeftRadius:"8px", borderTopRightRadius:"8px",
        padding:"1.25rem", maxHeight:"70vh", overflowY:"auto",
        animation:"slideUp 0.25s ease" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.7rem", color:T.gold,
          letterSpacing:"0.2em", marginBottom:"0.25rem" }}>{zone?.icon} {zone?.name}</div>
        <div style={{ fontFamily:"'Lora',serif", fontSize:"0.8rem", color:T.textDim,
          fontStyle:"italic", marginBottom:"1.25rem", lineHeight:1.55 }}>{zone?.desc}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
          {actions.map(a => {
            const d = ACTION_DATA[a];
            const ok = canDo(a);
            return (
              <button key={a} onClick={() => ok && onAction(a, zone)}
                style={{ textAlign:"left", padding:"0.75rem 0.85rem",
                  background: ok ? T.surfaceHigh : "rgba(0,0,0,0.3)",
                  border:`1px solid ${ok ? T.border : T.textFaint+"33"}`,
                  borderRadius:"3px", cursor: ok ? "pointer" : "not-allowed",
                  opacity: ok ? 1 : 0.4, transition:"all 0.15s" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem",
                  color:ok?T.text:T.textDim, marginBottom:"0.25rem" }}>
                  {d.icon} {d.label}
                </div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:"0.7rem",
                  color:T.textFaint, lineHeight:1.4 }}>{d.desc}</div>
                {!ok && <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem",
                  color:T.magne, marginTop:"0.25rem", letterSpacing:"0.08em" }}>ENERGÍA INSUFICIENTE</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── EVENT TOAST ──────────────────────────────────────────────────
function EventToast({ event, onDismiss }) {
  useEffect(()=>{ const t=setTimeout(onDismiss, 4500); return()=>clearTimeout(t); },[]);
  return (
    <div style={{ position:"fixed", top:"1rem", left:"50%", transform:"translateX(-50%)",
      zIndex:200, maxWidth:"340px", width:"calc(100% - 2rem)",
      background:T.surface, border:`1px solid ${T.gold}`,
      borderRadius:"3px", padding:"0.85rem 1rem",
      boxShadow:`0 0 24px rgba(${rgb(T.gold)},0.2)`,
      animation:"fadeUp 0.3s ease" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color:T.gold,
        letterSpacing:"0.2em", marginBottom:"0.35rem" }}>{event.title}</div>
      <div style={{ fontFamily:"'Lora',serif", fontSize:"0.85rem", color:T.text, lineHeight:1.65 }}>{event.text}</div>
    </div>
  );
}

// ─── LOG PANEL ────────────────────────────────────────────────────
function LogPanel({ world, onClose }) {
  return (
    <Panel title="↺ Diario" onClose={onClose}>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
        {[...world.log].reverse().map((entry, i) => (
          <div key={i} style={{ fontFamily:"'Lora',serif", fontSize:"0.85rem",
            color: i===0 ? T.text : T.textDim, lineHeight:1.65,
            padding:"0.6rem 0.75rem",
            background: i===0 ? T.surfaceHigh : "transparent",
            border:`1px solid ${i===0 ? T.border : "transparent"}`,
            borderRadius:"2px" }}>{entry}</div>
        ))}
      </div>
    </Panel>
  );
}

// ─── MAIN WORLD ENGINE ────────────────────────────────────────────
export default function WorldEngine({ char, onBack }) {
  const [world, setWorld] = useState(() => {
    const saved = loadWorld();
    if (saved && saved.npcs) {
      // Re-resolve player house for Saevik/Tessaly on load
      return saved;
    }
    return initWorld(char);
  });

  const [panel, setPanel] = useState(null); // "map"|"grimoire"|"npcs"|"log"
  const [actionZone, setActionZone] = useState(null);
  const [toast, setToast] = useState(null);

  const currentZone = world.zones.find(z=>z.id===world.location);
  const currentHouse = ["magne","tunda","kateer","lerudio","jana"].includes(char.house)
    ? { magne:{name:"Magne",color:T.magne}, tunda:{name:"Tunda",color:T.tunda},
        kateer:{name:"Kateer",color:T.kateer}, lerudio:{name:"Lerudio",color:T.lerudio},
        jana:{name:"Jana",color:T.jana} }[char.house]
    : { name:"Academia", color:T.accent };

  const dayName = getDayName(world.day);
  const formattedTime = formatTime(world.hour, world.minute);

  // ── TIME TICK ───────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      setWorld(w => {
        let min = w.minute + 10;
        let hr = w.hour;
        let day = w.day;
        if (min >= 60) { min = 0; hr++; }
        if (hr >= 24) { hr = 0; day++; }
        // Slow need decay per 10 min
        const energy  = Math.max(0, w.energy  - 0.3);
        const hunger  = Math.max(0, w.hunger  - 0.5);
        const hygiene = Math.max(0, w.hygiene - 0.2);
        const fun     = Math.max(0, w.fun     - 0.25);
        return { ...w, minute:min, hour:hr, day, energy, hunger, hygiene, fun };
      });
    }, TICK_MS);
    return () => clearInterval(tick);
  }, []);

  // ── AUTO-SAVE ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => saveWorld(world), 2000);
    return () => clearTimeout(t);
  }, [world]);

  // ── ACTION HANDLER ──────────────────────────────────────────────
  const doAction = useCallback((actionId, zone) => {
    setActionZone(null);
    setWorld(w => {
      let updated = { ...w };

      const addLog = (msg) => { updated.log = [...updated.log, msg]; };
      const advanceTime = (mins) => {
        let m = updated.minute + mins;
        let h = updated.hour;
        let d = updated.day;
        while (m >= 60) { m -= 60; h++; }
        while (h >= 24) { h -= 24; d++; }
        updated = { ...updated, minute:m, hour:h, day:d };
      };

      switch(actionId) {
        case "sleep":
          updated.energy = Math.min(100, updated.energy + 60);
          advanceTime(480); // 8 hours
          addLog(`${formattedTime} — Dormiste. Te despertás renovado/a.`);
          setToast({ title:"DESCANSO", text:"Energía restaurada. Amanece un nuevo día en Aelhollow." });
          break;

        case "eat":
          if (updated.hunger < 95) {
            updated.hunger = Math.min(100, updated.hunger + 30);
            updated.energy = Math.max(0, updated.energy - 5);
            advanceTime(20);
            addLog(`${formattedTime} — Comiste en el comedor.`);
          }
          break;

        case "shower":
          updated.hygiene = Math.min(100, updated.hygiene + 30);
          updated.energy = Math.max(0, updated.energy - 3);
          advanceTime(15);
          addLog(`${formattedTime} — Higiene personal completada.`);
          break;

        case "fun":
          updated.fun = Math.min(100, updated.fun + 20);
          updated.energy = Math.max(0, updated.energy - 10);
          advanceTime(60);
          addLog(`${formattedTime} — Tomaste un rato para vos en ${zone?.name}.`);
          setToast({ title:"DESCANSO MENTAL", text:"Algo de tiempo libre nunca viene mal." });
          break;

        case "study": {
          updated.energy = Math.max(0, updated.energy - 15);
          advanceTime(90);
          // Find relevant subject for zone
          const zoneSubjectMap = {
            library:["historia","alquimia","invocacion","astromancia","bestiologia"],
            alchemy_lab:["alquimia","artefactos"],
            botanical:["botanica","bestiologia"],
            rune_archive:["sigilcraft","encantamiento","astromancia"],
            dormitory:["historia"],
          };
          const relevantSubjects = zoneSubjectMap[zone?.id] || ["historia"];
          const subjectId = relevantSubjects[0];
          const gain = Math.floor(Math.random() * 4) + 3;
          updated.subjects = { ...updated.subjects, [subjectId]: Math.min(100, (updated.subjects[subjectId]||0) + gain) };
          updated.majkaLevel = Math.min(100, updated.majkaLevel + 0.5);
          addLog(`${formattedTime} — Estudiaste. +${gain} en ${SUBJECTS.find(s=>s.id===subjectId)?.name}.`);
          setToast({ title:"ESTUDIO", text:`Progreso en ${SUBJECTS.find(s=>s.id===subjectId)?.name}. +${gain} puntos.` });
          break;
        }

        case "research": {
          updated.energy = Math.max(0, updated.energy - 18);
          advanceTime(120);
          // Small chance to discover something
          const roll = Math.random();
          if (roll > 0.75) {
            // Discover a locked entry in grimoire
            let discovered = false;
            const types = Object.keys(updated.grimoire);
            for (const t of types) {
              const undiscovered = updated.grimoire[t].find(e=>!e.discovered);
              if (undiscovered) {
                updated.grimoire = {
                  ...updated.grimoire,
                  [t]: updated.grimoire[t].map(e=>e.id===undiscovered.id ? {...e, discovered:true, name: getDiscoveryName(t, undiscovered.id), desc: getDiscoveryDesc(t, undiscovered.id)} : e)
                };
                discovered = true;
                setToast({ title:"✦ DESCUBRIMIENTO", text:`Encontraste algo nuevo en tu grimorio: ${getDiscoveryName(t, undiscovered.id)}.` });
                addLog(`${formattedTime} — Descubriste algo nuevo investigando en ${zone?.name}.`);
                break;
              }
            }
            if (!discovered) {
              addLog(`${formattedTime} — Investigaste en ${zone?.name}. Nada nuevo por ahora.`);
            }
          } else {
            addLog(`${formattedTime} — Investigaste en ${zone?.name}. Nada nuevo por ahora.`);
          }
          updated.majkaLevel = Math.min(100, updated.majkaLevel + 0.3);
          break;
        }

        case "socialize": {
          updated.energy = Math.max(0, updated.energy - 8);
          updated.fun = Math.min(100, updated.fun + 10);
          advanceTime(45);
          // Find an NPC in the zone or nearby
          const hereNPCs = updated.npcs.filter(n =>
            (zone?.id === "dining" && (n.id==="saevik"||n.id==="tessaly"||n.id==="roen"||n.id==="vaeldrin")) ||
            (zone?.id === "courtyard" && n.role==="student") ||
            (zone?.id === "dormitory" && n.house===char.house)
          );
          if (hereNPCs.length > 0) {
            const npc = hereNPCs[Math.floor(Math.random() * hereNPCs.length)];
            const gain = Math.floor(Math.random() * 5) + 3;
            updated.npcs = updated.npcs.map(n=>n.id===npc.id ? {...n, relation:Math.min(100,n.relation+gain)} : n);
            addLog(`${formattedTime} — Hablaste con ${npc.name}. +${gain} relación.`);
            setToast({ title:"SOCIALIZACIÓN", text:`Pasaste tiempo con ${npc.name}. La relación crece.` });
          } else {
            addLog(`${formattedTime} — Socializaste en ${zone?.name}.`);
          }
          break;
        }

        case "explore": {
          updated.energy = Math.max(0, updated.energy - 12);
          advanceTime(60);
          updated.location = zone?.id || updated.location;
          addLog(`${formattedTime} — Exploraste ${zone?.name}.`);
          setToast({ title:"EXPLORACIÓN", text:`Recorriste ${zone?.name}. Puede que hayas notado algo.` });
          break;
        }

        case "craft": {
          updated.energy = Math.max(0, updated.energy - 18);
          advanceTime(90);
          const craftGain = Math.floor(Math.random() * 3) + 2;
          updated.subjects = { ...updated.subjects, alquimia: Math.min(100, (updated.subjects.alquimia||0) + craftGain) };
          updated.majkaLevel = Math.min(100, updated.majkaLevel + 0.4);
          addLog(`${formattedTime} — Trabajaste en el laboratorio. +${craftGain} en Alquimia.`);
          break;
        }

        case "class": {
          updated.energy = Math.max(0, updated.energy - 20);
          advanceTime(120);
          const classSubjectMap = { alchemy_lab:"alquimia", botanical:"botanica", rune_archive:"sigilcraft", great_hall:"historia" };
          const cSubId = classSubjectMap[zone?.id] || "historia";
          const cGain = Math.floor(Math.random() * 6) + 5;
          updated.subjects = { ...updated.subjects, [cSubId]: Math.min(100, (updated.subjects[cSubId]||0) + cGain) };
          updated.majkaLevel = Math.min(100, updated.majkaLevel + 1);
          addLog(`${formattedTime} — Fuiste a clase de ${SUBJECTS.find(s=>s.id===cSubId)?.name}. +${cGain} puntos.`);
          setToast({ title:"CLASE COMPLETADA", text:`+${cGain} en ${SUBJECTS.find(s=>s.id===cSubId)?.name}. Tu majka crece.` });
          break;
        }
      }
      return updated;
    });
  }, [char.house, formattedTime]);

  function getDiscoveryName(type, id) {
    const names = {
      "???_1":"Escudo de Luz","???_2":"Viento Menor","???_p1":"Poción de Enfoque",
      "???_p2":"Elixir de Claridad","???_s1":"Sigilo de Silencio",
      "???_r1":"Ritual del Alba","???_a1":"Piedra de Resonancia",
    };
    return names[id] || "Algo desconocido";
  }
  function getDiscoveryDesc(type, id) {
    const descs = {
      "???_1":"Un escudo de luz suave que desvía ataques menores. El segundo hechizo más enseñado en la academia.",
      "???_2":"Un viento controlado, suave como un susurro o cortante como una hoja, según la intención.",
      "???_p1":"Aclara la mente y mejora la concentración por varias horas. Sabe a menta y algo más difícil de nombrar.",
      "???_p2":"Elimina la fatiga mental temporalmente. Tiene un costo que no se ve hasta el día siguiente.",
      "???_s1":"Graba silencio alrededor de un área. Lo que se dice dentro no sale.",
      "???_r1":"Un ritual corto al amanecer que recarga levemente la energía majka. Hay que hacerlo en exterior.",
      "???_a1":"Una piedra que vibra cuando está cerca de majka activa. Útil para detectar encantamientos ocultos.",
    };
    return descs[id] || "Aún no está claro qué hace exactamente.";
  }

  // ── RENDER ──────────────────────────────────────────────────────
  const majkaLevelLabel = world.majkaLevel < 10 ? "Despertar" : world.majkaLevel < 25 ? "Iniciado/a" :
    world.majkaLevel < 50 ? "Aprendiz" : world.majkaLevel < 75 ? "Practicante" : "Avanzado/a";

  const lowNeeds = [];
  if (world.energy < 25) lowNeeds.push("energía");
  if (world.hunger < 25) lowNeeds.push("hambre");
  if (world.hygiene < 25) lowNeeds.push("higiene");
  if (world.fun < 25) lowNeeds.push("diversión");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bgDeep};color:${T.text};overflow:hidden}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:${T.bgDeep}}
        ::-webkit-scrollbar-thumb{background:${T.accentDim};border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}
        @keyframes twinkle{0%,100%{opacity:0}50%{opacity:0.5}}
      `}</style>

      <div style={{ height:"100vh", display:"flex", flexDirection:"column",
        background:T.bgDeep, overflow:"hidden" }}>

        {/* ── TOP HUD ─────────────────────────────────────────── */}
        <div style={{ flexShrink:0, background:T.surface, borderBottom:`1px solid ${T.border}`,
          padding:"0.6rem 1rem", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:"0.75rem" }}>

          {/* Left: char info */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", minWidth:0 }}>
            <div style={{ width:"6px", height:"24px", borderRadius:"3px",
              background:currentHouse.color, flexShrink:0 }}/>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem",
                color:T.text, letterSpacing:"0.04em", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{char.name}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem",
                color:currentHouse.color, letterSpacing:"0.1em" }}>
                Casa {currentHouse.name} · Año {world.year}
              </div>
            </div>
          </div>

          {/* Center: time */}
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"0.9rem",
              color:T.gold, letterSpacing:"0.06em" }}>{formattedTime}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem",
              color:T.textDim, letterSpacing:"0.12em", textTransform:"capitalize" }}>
              {dayName} · Día {world.day}
            </div>
          </div>

          {/* Right: majka level */}
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem",
              color:T.accent, letterSpacing:"0.08em" }}>{majkaLevelLabel}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem",
              color:T.textDim, letterSpacing:"0.1em" }}>
              Majka {Math.round(world.majkaLevel)}/100
            </div>
          </div>
        </div>

        {/* ── NEEDS BAR ───────────────────────────────────────── */}
        <div style={{ flexShrink:0, background:"rgba(7,10,17,0.6)", padding:"0.5rem 1rem",
          borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"0.6rem" }}>
            <NeedBar label="Energía" icon="⚡" value={world.energy} color={T.accent} />
            <NeedBar label="Hambre"  icon="🍎" value={world.hunger}  color={T.kateer} />
            <NeedBar label="Higiene" icon="✧" value={world.hygiene} color={T.tunda}  />
            <NeedBar label="Diversión" icon="◈" value={world.fun}   color={T.lerudio}/>
          </div>
          {lowNeeds.length > 0 && (
            <div style={{ fontFamily:"'Lora',serif", fontSize:"0.7rem",
              color:T.magne, fontStyle:"italic", marginTop:"0.3rem", textAlign:"center" }}>
              ⚠ Necesitás atender: {lowNeeds.join(", ")}
            </div>
          )}
        </div>

        {/* ── MAIN AREA ───────────────────────────────────────── */}
        <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>

          {/* Location header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:"0.75rem" }}>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem",
                color:T.textDim, letterSpacing:"0.2em" }}>UBICACIÓN ACTUAL</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.9rem",
                color:T.accent, marginTop:"2px" }}>
                {currentZone?.icon} {currentZone?.name}
              </div>
            </div>
            <button onClick={()=>setActionZone(currentZone)}
              style={{ fontFamily:"'Cinzel',serif", fontSize:"0.62rem",
                letterSpacing:"0.12em", color:T.gold, background:`rgba(${rgb(T.gold)},0.1)`,
                border:`1px solid ${T.gold}`, borderRadius:"2px",
                padding:"0.45rem 0.85rem", cursor:"pointer", transition:"all 0.18s" }}>
              ACCIONES
            </button>
          </div>

          {/* Map */}
          <WorldMap world={world} onZoneClick={(zoneId)=>{
            const z = world.zones.find(z=>z.id===zoneId);
            setWorld(w=>({...w, location:zoneId}));
            setActionZone(z);
          }} />

          {/* Recent log */}
          <div style={{ marginTop:"1rem", background:T.surface,
            border:`1px solid ${T.border}`, borderRadius:"3px", padding:"0.85rem 1rem" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem",
              color:T.textDim, letterSpacing:"0.18em", marginBottom:"0.6rem" }}>REGISTRO RECIENTE</div>
            {[...world.log].reverse().slice(0,3).map((entry,i)=>(
              <div key={i} style={{ fontFamily:"'Lora',serif", fontSize:"0.8rem",
                color:i===0?T.text:T.textFaint, lineHeight:1.6,
                marginBottom: i<2?"0.3rem":"0" }}>{entry}</div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM NAV ──────────────────────────────────────── */}
        <div style={{ flexShrink:0, background:T.surface, borderTop:`1px solid ${T.border}`,
          padding:"0.6rem 0.75rem", display:"flex", justifyContent:"space-around", alignItems:"center" }}>
          <IconBtn icon="🗺" label="Mapa" active={panel==="map"} onClick={()=>setPanel(panel==="map"?null:"map")} color={T.accent}/>
          <IconBtn icon="✦" label="Grimorio" active={panel==="grimoire"} onClick={()=>setPanel(panel==="grimoire"?null:"grimoire")} color={T.gold}/>
          <IconBtn icon="◉" label="Personas" active={panel==="npcs"} onClick={()=>setPanel(panel==="npcs"?null:"npcs")} color={T.lerudio}/>
          <IconBtn icon="↺" label="Diario" active={panel==="log"} onClick={()=>setPanel(panel==="log"?null:"log")} color={T.tunda}/>
          <IconBtn icon="←" label="Volver" onClick={onBack} color={T.textDim}/>
        </div>
      </div>

      {/* ── PANELS ──────────────────────────────────────────────── */}
      {panel==="map" && (
        <Panel title="◈ Mapa de Aelhollow" onClose={()=>setPanel(null)}>
          <WorldMap world={world} onZoneClick={(zoneId)=>{
            const z = world.zones.find(z=>z.id===zoneId);
            setWorld(w=>({...w,location:zoneId}));
            setPanel(null);
            setActionZone(z);
          }}/>
        </Panel>
      )}
      {panel==="grimoire" && <GrimoirePanel world={world} onClose={()=>setPanel(null)}/>}
      {panel==="npcs"     && <NPCPanel world={world} onClose={()=>setPanel(null)}/>}
      {panel==="log"      && <LogPanel world={world} onClose={()=>setPanel(null)}/>}

      {/* ── ACTION MENU ─────────────────────────────────────────── */}
      {actionZone && (
        <ActionMenu zone={actionZone} world={world}
          onAction={doAction} onClose={()=>setActionZone(null)}/>
      )}

      {/* ── TOAST ───────────────────────────────────────────────── */}
      {toast && <EventToast event={toast} onDismiss={()=>setToast(null)}/>}
    </>
  );
}
