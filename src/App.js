import { useState, useEffect, useRef } from "react";
import WorldEngine from "./WorldEngine";

const T = {
  bg:"#0b0e17", bgDeep:"#070a11", surface:"#111520",
  border:"#1e2535", borderGlow:"rgba(148,190,255,0.18)",
  text:"#d4dff7", textDim:"#6a7a9b", textFaint:"#2e3a52",
  gold:"#e8c87a", goldDim:"#8a6e2e",
  accent:"#94beff", accentDim:"#2a4070",
  magne:"#e05a3a", tunda:"#5abbe0", kateer:"#4ade8a",
  lerudio:"#c47aff", jana:"#7aaeff",
};
const rgb = h=>`${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;

// ── SAVE ──────────────────────────────────────────────────────────
const SK = "aelhollow_v2";
const saveGame = (screen,char) => { try{ localStorage.setItem(SK,JSON.stringify({screen,char,ts:Date.now()})); }catch(e){} };
const loadGame = () => { try{ const d=localStorage.getItem(SK); return d?JSON.parse(d):null; }catch(e){return null;} };
const clearGame = () => { try{ localStorage.removeItem(SK); }catch(e){} };

// ── DATA ──────────────────────────────────────────────────────────
const PLANETS = [
  { id:"aelhaven", name:"Aelhaven", subtitle:"El Planeta del Balance", color:"#e8c87a", symbol:"✦",
    race:"Humano/a", force:"Faedell & Dellmere", ability:"Doble Afinidad",
    abilityDesc:"Podés canalizar tanto majka de luz como de sombra. Adaptable — e impredecible para quienes creen que hay que elegir un lado.",
    description:"El planeta capital del sistema Faedell. Donde el fuego y el agua coexisten sin anularse. La tierra más compleja, más rica, y la que más sangra cuando el equilibrio falla.",
    houseAffinity:["jana","lerudio"] },
  { id:"jkeyll", name:"Jkeyll", subtitle:"El Planeta de las Sombras", color:"#9a7acc", symbol:"◑",
    race:"Jkeilkin", force:"Jkaill", ability:"Sombramajka",
    abilityDesc:"Podés fundirte con las sombras, proyectar ilusiones de oscuridad, y sentir lo que otros quieren ocultar. Tu presencia incomoda a quienes temen lo que no entienden.",
    description:"Un planeta donde el sol no llega. La oscuridad no es ausencia de luz sino presencia de algo más antiguo. Sus habitantes están hechos de sombra y ceniza, y veneran a Jkaill.",
    houseAffinity:["kateer","jana"] },
  { id:"clearelf", name:"Clearelf", subtitle:"El Planeta Etéreo", color:"#7adde8", symbol:"◎",
    race:"Aetherkin", force:"Dellmere", ability:"Aetherforma & Empatía Profunda",
    abilityDesc:"Podés leer las auras de quienes te rodean, manipular emociones sutilmente, y disolverte en tu forma etérea. Tu esfera de cristal nunca miente — incluso cuando vos sí.",
    description:"Un planeta casi sin tierra firme. Nubes que son ciudades. Sus habitantes tienen dos formas: una tangible y una etérea, donde solo existe una esfera de cristal que muestra el color de lo que sienten.",
    houseAffinity:["jana","tunda"] },
  { id:"lochby", name:"Lochby", subtitle:"El Planeta Acuático", color:"#4ade8a", symbol:"≋",
    race:"Lochkin", force:"Dellmere", ability:"Hidrokinesis & Cultivación",
    abilityDesc:"El agua responde a tu estado emocional antes de responder a tu voluntad. También tenés conexión natural con las plantas — las sentís crecer.",
    description:"Un planeta de océanos infinitos y costas que cambian con las mareas. Sus habitantes son mitad humanoides, mitad tritones — con una forma completamente humanoide para moverse en tierra.",
    houseAffinity:["kateer","magne"] },
  { id:"vaxan", name:"Vaxan", subtitle:"El Planeta Tecnológico", color:"#e05a3a", symbol:"⬡",
    race:"Vaxankin", force:"Ninguna", ability:"Sin Majka Innata",
    abilityDesc:"No traés habilidades planetarias. Lo que traés es una mente entrenada para la lógica. Tu majka, cuando llegue, será completamente tuya.",
    description:"Sin magia. Sin Fuerzas. Solo precisión e ingeniería. Vaxan controla los puertos estelares del sistema. Vos sos la anomalía — o el exiliado.",
    houseAffinity:["lerudio","tunda"] },
  { id:"orlea", name:"Orlea", subtitle:"El Planeta Dorado", color:"#ffd566", symbol:"✺",
    race:"Aurekin", force:"Faedell", ability:"Cognición Expandida",
    abilityDesc:"Tu mente procesa más rápido, retiene más, conecta patrones donde otros ven ruido. Podés leer el estado mental de alguien en segundos.",
    description:"El planeta más cercano a Gardgana Din'Esta. Siempre de día, siempre bañado en dorado. Sus habitantes son los más brillantes del sistema, en todos los sentidos del término.",
    houseAffinity:["lerudio","magne"] },
];

const HOUSES = [
  { id:"magne", name:"Magne", color:T.magne, symbol:"🜂",
    founder:"Fundada por Magne, el primero en domar el fuego.",
    trait:"Fuerza · Valentía · Impulso",
    desc:"Los de Magne entran primero. Piensan después, a veces. Cuando la situación exige que alguien dé un paso al frente, siempre es uno de Magne.",
    typical:"Habilidades de fuego, resistencia física aumentada, majka de alto impacto.",
    stigma:"\"Valientes o brutos, según el día.\"",
    traitAffinity:["impulsivo","ambicioso","leal"] },
  { id:"tunda", name:"Tunda", color:T.tunda, symbol:"🜁",
    founder:"Fundada por Tunda, la que llamó la primera tormenta.",
    trait:"Temperamento · Decisión · Dominio",
    desc:"Tunda no tiene estudiantes suaves. Tienen convicciones y las defienden con majka climática o sin ella.",
    typical:"Control del viento y el rayo, majka de área, habilidades de combate y dominio.",
    stigma:"\"Brillantes cuando se controlan. Devastadores cuando no.\"",
    traitAffinity:["impulsivo","ambicioso","ironico"] },
  { id:"kateer", name:"Kateer", color:T.kateer, symbol:"🜄",
    founder:"Fundada por Kateer, la primera en moverse sin ser vista.",
    trait:"Agilidad · Determinación · Precisión",
    desc:"Los de Kateer no hacen ruido innecesario. Llegan antes y ya terminaron cuando los demás empiezan.",
    typical:"Majka de agua y tierra, combate a distancia, velocidad y sigilo elemental.",
    stigma:"\"Silenciosos. A veces demasiado.\"",
    traitAffinity:["cauteloso","adaptable","obsesivo"] },
  { id:"lerudio", name:"Lerudio", color:T.lerudio, symbol:"⚗",
    founder:"Fundada por Lerudio, el que descifró el primer sigilo.",
    trait:"Conocimiento · Curiosidad · Excentricidad",
    desc:"Lerudio reúne a los raros del sistema. Los que preguntan por qué cuando todos aceptan el cómo.",
    typical:"Alquimia, sigilmajka, habilidades únicas o no clasificadas, alta afinidad rúnica.",
    stigma:"\"¿Para qué sirve eso en una batalla real?\" — hasta que sirve.",
    traitAffinity:["curioso","obsesivo","reservado"] },
  { id:"jana", name:"Jana", color:T.jana, symbol:"◈",
    founder:"Fundada por Jana, la que protegió a todos cuando nadie la protegió a ella.",
    trait:"Protección · Resiliencia · Singularidad",
    desc:"Jana elige a los que no encajan. A los que tienen traumas que no pidieron, fuerzas que no entienden. No son los más fuertes — son los más completos.",
    typical:"Habilidades mentales, escudos de majka, sigilmajka, y poderes que nadie sabe cómo clasificar.",
    stigma:"\"La casa de los que sobran.\" — y aun así, la que más graduados extraordinarios tiene en los registros.",
    traitAffinity:["empatico","leal","reservado","cauteloso"] },
];

const SAEVIK = { name:"Saevik", pronouns:"elle/les", planet:"Jkeyll", color:"#9a7acc" };
const TESSALY = { name:"Tessaly", pronouns:"ella/la", planet:"Orlea", color:"#ffd566" };

// ── HOUSE LOGIC ───────────────────────────────────────────────────
function assignHouse(char) {
  const planet = PLANETS.find(p=>p.id===char.planet);
  const scores = { magne:0, tunda:0, kateer:0, lerudio:0, jana:0 };
  planet?.houseAffinity?.forEach(h=>{ scores[h]+=2; });
  HOUSES.forEach(h=>{ [char.trait1,char.trait2].filter(Boolean).forEach(tr=>{ if(h.traitAffinity?.includes(tr)) scores[h.id]+=2; }); });
  const fearMap={abandono:"jana",fracaso:"magne",invisibilidad:"jana",verdad:"lerudio",perdida:"kateer",traicion:"tunda"};
  const bgMap={familiar:"tunda",primera_generacion:"jana",exiliado:"kateer",becado:"lerudio"};
  if(fearMap[char.fear]) scores[fearMap[char.fear]]+=1;
  if(bgMap[char.background]) scores[bgMap[char.background]]+=1;
  let best="jana",bestScore=-1;
  Object.entries(scores).forEach(([h,s])=>{ if(s>bestScore){best=h;bestScore=s;} });
  return { assigned:best, conflict:!!(char.house && char.house!==best) };
}

// ── TYPEWRITER ────────────────────────────────────────────────────
function useTypewriter(text, speed=18) {
  const [disp,setDisp]=useState(""); const [done,setDone]=useState(false);
  const idx=useRef(0); const tmr=useRef(null);
  useEffect(()=>{
    setDisp(""); setDone(false); idx.current=0; clearInterval(tmr.current);
    tmr.current=setInterval(()=>{
      idx.current++; setDisp(text.slice(0,idx.current));
      if(idx.current>=text.length){clearInterval(tmr.current);setDone(true);}
    },speed);
    return()=>clearInterval(tmr.current);
  },[text]);
  const skip=()=>{clearInterval(tmr.current);setDisp(text);setDone(true);};
  return {displayed:disp,done,skip};
}

// ── UI ────────────────────────────────────────────────────────────
function Starfield() {
  const stars=Array.from({length:55},(_,i)=>({
    x:Math.sin(i*137.5)*50+50, y:Math.cos(i*97.3)*50+50,
    s:i%5===0?2:1, delay:(i*.17)%5, dur:2.5+(i%3)
  }));
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {stars.map((s,i)=><div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
      width:`${s.s}px`,height:`${s.s}px`,borderRadius:"50%",background:T.accent,opacity:0,
      animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`}}/>)}
  </div>;
}

function Btn({children,onClick,color=T.accent,disabled=false,small=false}){
  const [h,setH]=useState(false);
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{display:"block",width:small?"auto":"100%",
      padding:small?"0.5rem 1.2rem":"0.85rem 1.5rem",
      background:h?`rgba(${rgb(color)},0.14)`:"transparent",
      border:`1px solid ${h?color:"rgba(148,190,255,0.18)"}`,borderRadius:"2px",
      color:h?color:T.textDim,fontFamily:"'Cinzel',serif",
      fontSize:small?"0.72rem":"0.8rem",letterSpacing:"0.12em",textTransform:"uppercase",
      cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",opacity:disabled?0.35:1,
      textAlign:"left",boxShadow:h?`0 0 14px rgba(${rgb(color)},0.14)`:"none"}}>
    {children}
  </button>;
}

function ChoiceBtn({children,onClick,selected,color=T.accent,sub}){
  const [h,setH]=useState(false); const on=selected||h;
  return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{display:"block",width:"100%",textAlign:"left",padding:"0.9rem 1.1rem",
      background:selected?`rgba(${rgb(color)},0.12)`:h?`rgba(${rgb(color)},0.06)`:"transparent",
      border:`1px solid ${on?color:T.border}`,borderRadius:"2px",cursor:"pointer",
      transition:"all 0.18s",boxShadow:selected?`0 0 16px rgba(${rgb(color)},0.18)`:"none",
      marginBottom:"0.5rem"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.82rem",color:on?color:T.textDim,letterSpacing:"0.06em"}}>{children}</div>
    {sub&&<div style={{fontFamily:"'Lora',serif",fontSize:"0.8rem",color:on?T.text:T.textFaint,marginTop:"0.3rem",lineHeight:1.5,transition:"color 0.18s"}}>{sub}</div>}
  </button>;
}

function Label({children,color=T.accent}){
  return <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.63rem",color,letterSpacing:"0.22em",textTransform:"uppercase",opacity:0.7,marginBottom:"0.75rem"}}>{children}</div>;
}

function Divider(){
  return <div style={{height:"1px",margin:"1.5rem 0",opacity:0.45,background:"linear-gradient(90deg,transparent,rgba(148,190,255,0.2),transparent)"}}/>;
}

function Prose({children,dim,italic,border}){
  return <p style={{fontFamily:"'Lora',serif",fontSize:"1.02rem",lineHeight:1.88,
    color:dim?T.textDim:T.text,fontStyle:italic?"italic":"normal",
    whiteSpace:"pre-line",margin:"0 0 1rem",
    borderLeft:border?`2px solid ${border}`:"none",
    paddingLeft:border?"1rem":"0"}}>{children}</p>;
}

function TW({text,speed=18,border,onDone}){
  const {displayed,done,skip}=useTypewriter(text,speed);
  return <div onClick={done?undefined:skip} style={{cursor:done?"default":"pointer",userSelect:"none"}}>
    <Prose border={border}>
      {displayed}
      {!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}
    </Prose>
    {done&&onDone&&<div style={{animation:"fadeUp 0.35s ease"}}>{onDone()}</div>}
  </div>;
}

function GameHeader({char,label}){
  const house=HOUSES.find(h=>h.id===char.house);
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2rem",paddingTop:"0.5rem"}}>
    <div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.58rem",letterSpacing:"0.25em",color:T.textDim}}>{label}</div>
      {house&&<div style={{fontFamily:"'Cinzel',serif",fontSize:"0.73rem",color:house.color,marginTop:"2px"}}>{house.symbol} Casa {house.name}</div>}
    </div>
    <div style={{textAlign:"right"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.68rem",color:T.textDim,letterSpacing:"0.08em"}}>{char.name}</div>
      <div style={{fontFamily:"'Lora',serif",fontSize:"0.65rem",color:T.textFaint,fontStyle:"italic"}}>{char.pronouns}</div>
    </div>
  </div>;
}

function PlanetCard({planet,selected,onSelect}){
  const [exp,setExp]=useState(false);
  return <div style={{border:`1px solid ${selected?planet.color:T.border}`,borderRadius:"3px",
    background:selected?`rgba(${rgb(planet.color)},0.07)`:T.surface,marginBottom:"0.6rem",
    transition:"all 0.2s",boxShadow:selected?`0 0 18px rgba(${rgb(planet.color)},0.14)`:"none",overflow:"hidden"}}>
    <button onClick={()=>{onSelect(planet.id);setExp(true);}}
      style={{width:"100%",textAlign:"left",background:"transparent",border:"none",cursor:"pointer",
        padding:"1rem 1.1rem",display:"flex",alignItems:"center",gap:"0.9rem"}}>
      <span style={{fontSize:"1.3rem",color:planet.color,flexShrink:0}}>{planet.symbol}</span>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.88rem",color:selected?planet.color:T.text}}>{planet.name}</div>
        <div style={{fontFamily:"'Lora',serif",fontSize:"0.75rem",color:T.textDim,marginTop:"1px"}}>{planet.subtitle}</div>
      </div>
      <span style={{color:T.textDim,fontSize:"0.68rem",transform:exp?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
    </button>
    {selected&&exp&&<div style={{padding:"0 1.1rem 1rem",animation:"fadeUp 0.25s ease"}}>
      <Prose dim>{planet.description}</Prose>
      <div style={{background:`rgba(${rgb(planet.color)},0.08)`,border:`1px solid rgba(${rgb(planet.color)},0.2)`,borderRadius:"2px",padding:"0.75rem 0.9rem",marginBottom:"0.6rem"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.65rem",color:planet.color,letterSpacing:"0.14em",marginBottom:"0.35rem"}}>{planet.ability}</div>
        <div style={{fontFamily:"'Lora',serif",fontSize:"0.83rem",color:T.text,lineHeight:1.65}}>{planet.abilityDesc}</div>
      </div>
      <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
        {[["Raza",planet.race],["Fuerza",planet.force]].map(([k,v])=>(
          <span key={k} style={{fontFamily:"'Cinzel',serif",fontSize:"0.63rem",color:T.textDim,letterSpacing:"0.1em"}}>{k}: <span style={{color:planet.color}}>{v}</span></span>
        ))}
      </div>
    </div>}
  </div>;
}

function HouseCard({house,selected,onSelect}){
  const [exp,setExp]=useState(false);
  return <div style={{border:`1px solid ${selected?house.color:T.border}`,borderRadius:"3px",
    background:selected?`rgba(${rgb(house.color)},0.07)`:T.surface,marginBottom:"0.6rem",
    transition:"all 0.2s",boxShadow:selected?`0 0 18px rgba(${rgb(house.color)},0.14)`:"none"}}>
    <button onClick={()=>{onSelect(house.id);setExp(true);}}
      style={{width:"100%",textAlign:"left",background:"transparent",border:"none",cursor:"pointer",
        padding:"1rem 1.1rem",display:"flex",alignItems:"center",gap:"0.9rem"}}>
      <span style={{fontSize:"1.2rem",color:house.color,flexShrink:0}}>{house.symbol}</span>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.88rem",color:selected?house.color:T.text}}>Casa {house.name}</div>
        <div style={{fontFamily:"'Lora',serif",fontSize:"0.73rem",color:T.textDim,fontStyle:"italic",marginTop:"1px"}}>{house.trait}</div>
      </div>
      <span style={{color:T.textDim,fontSize:"0.68rem",transform:exp?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
    </button>
    {selected&&exp&&<div style={{padding:"0 1.1rem 1rem",animation:"fadeUp 0.25s ease"}}>
      <p style={{fontFamily:"'Lora',serif",fontSize:"0.84rem",fontStyle:"italic",color:T.textDim,lineHeight:1.6,margin:"0 0 0.75rem",borderLeft:`2px solid ${house.color}`,paddingLeft:"0.75rem"}}>{house.founder}</p>
      <Prose dim>{house.desc}</Prose>
      <div style={{fontFamily:"'Lora',serif",fontSize:"0.79rem",color:T.textDim,lineHeight:1.55,marginBottom:"0.4rem"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",color:house.color,letterSpacing:"0.1em"}}>MAJKA TÍPICA</span><br/>{house.typical}
      </div>
      <div style={{fontFamily:"'Lora',serif",fontSize:"0.77rem",color:T.textDim,fontStyle:"italic"}}>{house.stigma}</div>
    </div>}
  </div>;
}

function SaveBtn({onSave}){
  const [saved,setSaved]=useState(false);
  return <button onClick={()=>{onSave();setSaved(true);setTimeout(()=>setSaved(false),2000);}}
    style={{position:"fixed",bottom:"1rem",right:"1rem",zIndex:50,
      fontFamily:"'Cinzel',serif",fontSize:"0.58rem",letterSpacing:"0.15em",
      color:saved?T.gold:T.textDim,background:"rgba(7,10,17,0.88)",
      border:`1px solid ${saved?T.gold:T.border}`,borderRadius:"2px",
      padding:"0.4rem 0.8rem",cursor:"pointer",transition:"all 0.2s",
      backdropFilter:"blur(4px)"}}>
    {saved?"✦ GUARDADO":"GUARDAR"}
  </button>;
}

// ── SCREENS ───────────────────────────────────────────────────────

function Title({onStart,onContinue,hasSave,saveInfo}){
  const [p,setP]=useState(0);
  useEffect(()=>{
    const ts=[800,1800,2800].map((t,i)=>setTimeout(()=>setP(i+1),t));
    return()=>ts.forEach(clearTimeout);
  },[]);
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",textAlign:"center",padding:"2rem"}}>
    <div style={{opacity:p>=1?1:0,transform:p>=1?"none":"translateY(10px)",transition:"all 1.2s ease",marginBottom:"0.4rem"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.65rem",letterSpacing:"0.4em",color:T.textDim}}>Sistema Faedell · Academia de Majka</div>
    </div>
    <div style={{opacity:p>=2?1:0,transform:p>=2?"none":"translateY(14px)",transition:"all 1.2s ease 0.3s"}}>
      <h1 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(2.4rem,8vw,4rem)",color:T.gold,margin:"0.3rem 0",letterSpacing:"0.08em",textShadow:"0 0 40px rgba(232,200,122,0.4)"}}>AELHOLLOW</h1>
      <div style={{fontFamily:"'Lora',serif",fontSize:"1rem",fontStyle:"italic",color:T.textDim,letterSpacing:"0.06em"}}>Academia de las Artes Majkas</div>
    </div>
    <div style={{opacity:p>=3?1:0,transition:"all 0.8s ease 0.2s",marginTop:"3rem",width:"100%",maxWidth:"300px"}}>
      <Btn onClick={onStart} color={T.gold}>Nueva Partida</Btn>
      {hasSave&&<div style={{marginTop:"0.6rem"}}>
        <Btn onClick={onContinue} color={T.accent}>Continuar Partida</Btn>
        {saveInfo&&<div style={{fontFamily:"'Lora',serif",fontSize:"0.7rem",fontStyle:"italic",color:T.textFaint,marginTop:"0.4rem"}}>{saveInfo}</div>}
      </div>}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.58rem",letterSpacing:"0.2em",color:T.textFaint,marginTop:"1.2rem"}}>AÑO ACADÉMICO I · PRIMER INGRESO</div>
    </div>
  </div>;
}

function Prologue({onNext}){
  const blocks=[
    `Hace trescientos años, cinco personas descubrieron algo que cambió el sistema Faedell para siempre.\n\nLo llamaron majka. Otros lo llamaron milagro. Otros, amenaza.\n\nLos cinco construyeron una academia en el valle de Aelhollow — en el único planeta donde las dos Fuerzas Supremas coexisten sin destruirse. Un lugar donde cualquiera con majka en la sangre pudiera aprender a usarla sin romperse en el intento.`,
    `Lo que los libros de historia no dicen es que los cinco sabían algo más.\n\nAlgo sobre el origen de la majka. Algo que enterraron en los cimientos del edificio más antiguo de la academia y nunca registraron en ningún archivo.\n\nEso fue hace trescientos años.\n\nEl valle guarda ese silencio todavía.`,
    `Vos llegás esta mañana.\n\nCon tu equipaje, tu historia, y la carta de admisión que tardaste en creer que era real.\n\nEl tren interestelar te dejó en el puerto de Aelhaven hace dos horas. El valle se abre frente a vos. La academia está al fondo, entre la niebla del amanecer, exactamente como la imaginaste.\n\nAntes de entrar, necesitás saber quién sos.`,
  ];
  const [idx,setIdx]=useState(0);
  const {displayed,done,skip}=useTypewriter(blocks[idx]);
  const next=()=>{ if(!done){skip();return;} if(idx<blocks.length-1)setIdx(idx+1); else onNext(); };
  return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <Label>Prólogo</Label>
    <div style={{minHeight:"14rem",marginBottom:"1.5rem"}}>
      <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
    </div>
    <Btn onClick={next} color={T.accent}>{!done?"Saltar":idx<blocks.length-1?"Continuar →":"Quién soy →"}</Btn>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",color:T.textFaint,marginTop:"0.6rem",letterSpacing:"0.1em"}}>{idx+1} / {blocks.length}</div>
  </div>;
}

function StepName({char,onNext}){
  const [name,setName]=useState(char.name||"");
  const [pronouns,setPronouns]=useState(char.pronouns||"");
  const [custom,setCustom]=useState("");
  const opts=["él / lo","ella / la","elle / le","Personalizar"];
  const finalP=pronouns==="Personalizar"?custom:pronouns;
  const ok=name.trim().length>=2&&(pronouns&&pronouns!=="Personalizar"||custom.trim().length>0);
  return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"2rem 1.5rem",maxWidth:"520px",margin:"0 auto"}}>
    <Label>Identidad · 1 de 6</Label>
    <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"1.35rem",color:T.gold,margin:"0 0 0.5rem"}}>¿Cómo te llamás?</h2>
    <Prose dim>Este nombre va a quedar en los registros de la academia. En las cartas que escribas. En la boca de la gente que te recuerde.</Prose>
    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre..." maxLength={32}
      style={{background:"transparent",border:"none",borderBottom:`1px solid ${name?T.accent:T.border}`,
        color:T.text,fontFamily:"'Lora',serif",fontSize:"1.1rem",padding:"0.7rem 0.3rem",
        outline:"none",width:"100%",transition:"border-color 0.2s",marginBottom:"2rem",caretColor:T.accent}}/>
    <Label>¿Tus pronombres?</Label>
    {opts.map(p=><ChoiceBtn key={p} selected={pronouns===p} onClick={()=>setPronouns(p)} color={T.accent}>{p}</ChoiceBtn>)}
    {pronouns==="Personalizar"&&<input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Tus pronombres..."
      style={{background:"transparent",border:"none",borderBottom:`1px solid ${custom?T.accent:T.border}`,
        color:T.text,fontFamily:"'Lora',serif",fontSize:"1rem",padding:"0.65rem 0.3rem",
        outline:"none",width:"100%",marginBottom:"1.5rem",caretColor:T.accent}}/>}
    <div style={{marginTop:"1rem"}}><Btn onClick={()=>onNext({name:name.trim(),pronouns:finalP})} color={T.gold} disabled={!ok}>Continuar →</Btn></div>
  </div>;
}

function StepPlanet({char,onNext}){
  const [sel,setSel]=useState(char.planet||null);
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"600px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <Label>Origen · 2 de 6</Label>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"1.35rem",color:T.gold,margin:"0 0 0.5rem"}}>¿De qué planeta venís?</h2>
      <Prose dim>Tu planeta define la habilidad innata que traés a la academia — la que existía antes de que aprendieras la primera letra de majka.</Prose>
      {PLANETS.map(p=><PlanetCard key={p.id} planet={p} selected={sel===p.id} onSelect={setSel}/>)}
      <div style={{marginTop:"1rem"}}><Btn onClick={()=>onNext({planet:sel})} color={T.gold} disabled={!sel}>Continuar →</Btn></div>
    </div>
  </div>;
}

function StepBackground({char,onNext}){
  const planet=PLANETS.find(p=>p.id===char.planet);
  const opts=[
    {id:"familiar",title:"Familia con Historia",desc:"Alguien en tu familia ya pasó por Aelhollow. Contactos, reputación, expectativas — y la carga de que todos tienen una opinión antes de que digas una palabra."},
    {id:"primera_generacion",title:"Primera Generación",desc:"Nadie en tu familia entiende bien qué es la academia. La carta de admisión fue la primera vez que alguien con autoridad te dijo que tenías algo que valía la pena desarrollar."},
    {id:"exiliado",title:"Exilio Voluntario",desc:"Algo pasó en tu planeta de origen. Aelhaven fue la oportunidad o la escapatoria. Todavía no estás seguro/a de cuál de las dos."},
    {id:"becado",title:"Beca de Mérito",desc:"La academia te eligió por algo específico. No sabés exactamente por qué vos, y esa pregunta te sigue."},
  ];
  const [sel,setSel]=useState(char.background||null);
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"600px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <Label>Trasfondo · 3 de 6</Label>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"1.35rem",color:T.gold,margin:"0 0 0.5rem"}}>¿Cómo llegaste hasta acá?</h2>
      {planet&&<div style={{fontFamily:"'Lora',serif",fontSize:"0.8rem",fontStyle:"italic",color:T.textDim,marginBottom:"1.25rem",borderLeft:`2px solid ${planet.color}`,paddingLeft:"0.75rem"}}>Origen: <span style={{color:planet.color}}>{planet.name}</span></div>}
      {opts.map(o=><ChoiceBtn key={o.id} selected={sel===o.id} onClick={()=>setSel(o.id)} color={T.accent} sub={o.desc}>{o.title}</ChoiceBtn>)}
      <div style={{marginTop:"1rem"}}><Btn onClick={()=>onNext({background:sel})} color={T.gold} disabled={!sel}>Continuar →</Btn></div>
    </div>
  </div>;
}

function StepTraits({char,onNext}){
  const traits=[
    {id:"curioso",label:"Curioso/a",desc:"Hacés preguntas cuando otros prefieren no hacerlas."},
    {id:"cauteloso",label:"Cauteloso/a",desc:"Pensás antes de hablar. Generalmente."},
    {id:"impulsivo",label:"Impulsivo/a",desc:"Actuás antes de que el miedo tenga tiempo de llegar."},
    {id:"empatico",label:"Empático/a",desc:"Sentís lo que sienten los demás, quieras o no."},
    {id:"ambicioso",label:"Ambicioso/a",desc:"Sabés lo que querés. A veces eso asusta a la gente."},
    {id:"reservado",label:"Reservado/a",desc:"Tus secretos son tuyos. Te ganaste ese derecho."},
    {id:"leal",label:"Leal",desc:"Una vez que alguien es tuyo, es tuyo para siempre."},
    {id:"ironico",label:"Irónico/a",desc:"El humor es una armadura. También un arma."},
    {id:"obsesivo",label:"Obsesivo/a",desc:"Cuando algo te llama, nada más existe."},
    {id:"adaptable",label:"Adaptable",desc:"Encontrás la manera. Siempre hay una manera."},
  ];
  const fears=[
    {id:"abandono",label:"El abandono",desc:"Que los que importan se vayan sin avisar."},
    {id:"fracaso",label:"El fracaso",desc:"No llegar a lo que se supone que debés ser."},
    {id:"invisibilidad",label:"La invisibilidad",desc:"Que nadie te vea aunque estés justo ahí."},
    {id:"verdad",label:"La verdad",desc:"Que lo que descubras de vos mismo/a no te guste."},
    {id:"perdida",label:"La pérdida",desc:"Que lo que amás no dure."},
    {id:"traicion",label:"La traición",desc:"Que alguien de confianza sea lo que no esperabas."},
  ];
  const [t1,setT1]=useState(char.trait1||null);
  const [t2,setT2]=useState(char.trait2||null);
  const [fear,setFear]=useState(char.fear||null);
  const toggle=id=>{
    if(t1===id){setT1(null);return;} if(t2===id){setT2(null);return;}
    if(!t1){setT1(id);return;} if(!t2){setT2(id);return;}
  };
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"600px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <Label>Carácter · 4 de 6</Label>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"1.35rem",color:T.gold,margin:"0 0 0.5rem"}}>¿Cómo sos?</h2>
      <Prose dim>Elegí dos rasgos. No los que querés tener — los que ya tenés.</Prose>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"1.75rem"}}>
        {traits.map(tr=>{const sel=t1===tr.id||t2===tr.id;const dis=!sel&&t1&&t2;
          return <button key={tr.id} onClick={()=>!dis&&toggle(tr.id)}
            style={{textAlign:"left",padding:"0.65rem 0.75rem",
              background:sel?"rgba(148,190,255,0.1)":"transparent",
              border:`1px solid ${sel?T.accent:T.border}`,borderRadius:"2px",
              cursor:dis?"default":"pointer",opacity:dis?0.3:1,transition:"all 0.15s"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.75rem",color:sel?T.accent:T.textDim}}>{tr.label}</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:"0.72rem",color:sel?T.text:T.textFaint,marginTop:"2px",lineHeight:1.4}}>{tr.desc}</div>
          </button>;
        })}
      </div>
      <Divider/>
      <Label color={T.magne}>¿Qué te da miedo?</Label>
      <Prose dim>Una sola cosa. La más honesta.</Prose>
      {fears.map(f=><ChoiceBtn key={f.id} selected={fear===f.id} onClick={()=>setFear(f.id)} color={T.magne} sub={f.desc}>{f.label}</ChoiceBtn>)}
      <div style={{marginTop:"1.5rem"}}><Btn onClick={()=>onNext({trait1:t1,trait2:t2,fear})} color={T.gold} disabled={!t1||!t2||!fear}>Continuar →</Btn></div>
    </div>
  </div>;
}

function StepHouse({char,onNext}){
  const [sel,setSel]=useState(char.house||null);
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"620px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <Label>Casa · 5 de 6</Label>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"1.35rem",color:T.gold,margin:"0 0 0.5rem"}}>¿A qué ala pertenecés?</h2>
      <Prose dim>Las cinco casas llevan el nombre de los cinco fundadores. La academia te asignará formalmente en la Ceremonia de Ingreso esta noche — pero algo en vos ya sabe.</Prose>
      {HOUSES.map(h=><HouseCard key={h.id} house={h} selected={sel===h.id} onSelect={setSel}/>)}
      <div style={{marginTop:"1rem"}}><Btn onClick={()=>onNext({house:sel})} color={T.gold} disabled={!sel}>Continuar →</Btn></div>
    </div>
  </div>;
}

function StepMotivation({char,onNext}){
  const opts=[
    {id:"pertenencia",title:"Encontrar dónde pertenecés",desc:"Siempre sentiste que el lugar donde naciste no era el tuyo. La academia es la primera vez que algo te hace señas desde lejos diciéndote que quizás acá sí."},
    {id:"poder",title:"Dominar tu majka",desc:"Tenés poder. Lo sabés. Y no lo estás usando ni al diez por ciento. Querés saber hasta dónde llega."},
    {id:"verdad",title:"Encontrar algo que se perdió",desc:"Hay una respuesta que buscás. La academia tiene archivos. La academia tiene historia. La academia sabe cosas."},
    {id:"escape",title:"Empezar de nuevo",desc:"Aelhaven no es tu planeta. Eso no siempre es una pérdida. A veces es exactamente lo que necesitabas."},
    {id:"deber",title:"Cumplir una promesa",desc:"Estás acá porque diste tu palabra y ese tipo de cosas no se rompen."},
  ];
  const [sel,setSel]=useState(char.motivation||null);
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"600px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <Label>Motivación · 6 de 6</Label>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"1.35rem",color:T.gold,margin:"0 0 0.5rem"}}>¿Por qué estás acá?</h2>
      <Prose dim>La carta de admisión no pregunta esto. Pero la academia sí, de otras maneras.</Prose>
      {opts.map(o=><ChoiceBtn key={o.id} selected={sel===o.id} onClick={()=>setSel(o.id)} color={T.accent} sub={o.desc}>{o.title}</ChoiceBtn>)}
      <div style={{marginTop:"1.5rem"}}><Btn onClick={()=>onNext({motivation:sel})} color={T.gold} disabled={!sel}>Así soy. Continuemos →</Btn></div>
    </div>
  </div>;
}

function Summary({char,onStart}){
  const planet=PLANETS.find(p=>p.id===char.planet);
  const house=HOUSES.find(h=>h.id===char.house);
  const tM={curioso:"Curioso/a",cauteloso:"Cauteloso/a",impulsivo:"Impulsivo/a",empatico:"Empático/a",ambicioso:"Ambicioso/a",reservado:"Reservado/a",leal:"Leal",ironico:"Irónico/a",obsesivo:"Obsesivo/a",adaptable:"Adaptable"};
  const fM={abandono:"El abandono",fracaso:"El fracaso",invisibilidad:"La invisibilidad",verdad:"La verdad",perdida:"La pérdida",traicion:"La traición"};
  const bM={familiar:"Familia con Historia",primera_generacion:"Primera Generación",exiliado:"Exilio Voluntario",becado:"Beca de Mérito"};
  const mM={pertenencia:"Encontrar dónde pertenecés",poder:"Dominar tu majka",verdad:"Encontrar algo que se perdió",escape:"Empezar de nuevo",deber:"Cumplir una promesa"};
  const [p,setP]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setP(1),300);return()=>clearTimeout(t);},[]);
  const rows=[
    {label:"Planeta de Origen",value:planet?.name,color:planet?.color},
    {label:"Casa",value:`Casa ${house?.name}`,color:house?.color},
    {label:"Trasfondo",value:bM[char.background]},
    {label:"Rasgos",value:`${tM[char.trait1]} · ${tM[char.trait2]}`},
    {label:"Miedo",value:fM[char.fear]},
    {label:"Motivación",value:mM[char.motivation]},
  ];
  return <div style={{minHeight:"100vh",padding:"3rem 1.5rem",maxWidth:"540px",margin:"0 auto"}}>
    <div style={{opacity:p?1:0,transition:"opacity 0.7s ease"}}>
      <div style={{textAlign:"center",marginBottom:"2rem"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.3em",color:T.textDim,marginBottom:"0.5rem"}}>EXPEDIENTE DE INGRESO</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"2rem",color:T.gold,textShadow:"0 0 28px rgba(232,200,122,0.35)"}}>{char.name}</div>
        <div style={{fontFamily:"'Lora',serif",fontSize:"0.85rem",fontStyle:"italic",color:T.textDim,marginTop:"0.2rem"}}>{char.pronouns}</div>
      </div>
      <div style={{border:`1px solid ${T.border}`,borderRadius:"3px",overflow:"hidden",marginBottom:"1.5rem"}}>
        {rows.map((r,i)=><div key={r.label} style={{display:"flex",gap:"1rem",padding:"0.75rem 1rem",
          background:i%2===0?"transparent":"rgba(255,255,255,0.02)",
          borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",color:T.textDim,letterSpacing:"0.1em",minWidth:"120px",textTransform:"uppercase",flexShrink:0}}>{r.label}</div>
          <div style={{fontFamily:"'Lora',serif",fontSize:"0.88rem",color:r.color||T.text}}>{r.value}</div>
        </div>)}
      </div>
      <div style={{fontFamily:"'Lora',serif",fontSize:"0.88rem",fontStyle:"italic",color:T.textDim,lineHeight:1.75,marginBottom:"2rem",borderLeft:`2px solid ${house?.color||T.accent}`,paddingLeft:"1rem"}}>
        El expediente está completo. La academia te espera. Lo que pase adentro depende de vos.
      </div>
      <Btn onClick={onStart} color={T.gold}>Entrar a la Academia →</Btn>
    </div>
  </div>;
}

// ── GAME SCREENS ──────────────────────────────────────────────────

function Year1({char,goTo}){
  const [scene,setScene]=useState(0);
  const [choice,setChoice]=useState(null);
  const planet=PLANETS.find(p=>p.id===char.planet);

  const blocks=[
    `El valle de Aelhollow no es lo que esperabas.\n\nEs más grande. Más silencioso. El aire tiene algo que no podés nombrar todavía — no exactamente magia, sino la posibilidad de ella.\n\nEl tren ya se fue. Sos uno/a de los doscientos y pico de estudiantes que caminan hacia la entrada principal de la academia esta mañana.`,
    `Las puertas de Aelhollow Academy son de piedra oscura con incrustaciones de símbolos majkas. Hay algo grabado arriba del arco principal, en el idioma antiguo del sistema:\n\n"Lo que entrás a aprender acá no te pertenece hasta que lo ganes."\n\n${planet?.race==="Aurekin"?"Tu mente procesa el texto antes de que termines de leerlo.":"O al menos eso te parece que dice."}`,
    `Adentro, el hall principal tiene el techo más alto que viste en tu vida. Las paredes están cubiertas de retratos — egresados y egresadas de trescientos años de historia.\n\nHay cinco estatuas en el centro, en círculo. Los cinco fundadores.\n\nTe detenés un momento frente a ellas. Algo en su disposición es extraña — están mirando hacia afuera, en direcciones distintas, como si hubieran estado observando las paredes en lugar del salón.\n\nNadie más parece notarlo.`,
  ];

  const {displayed,done,skip}=useTypewriter(blocks[scene]);
  const showChoices=scene===blocks.length-1&&done&&!choice;

  const hallChoices=[
    {id:"busco",text:"Buscás a alguien más que lo haya notado.",sub:`Hay dos estudiantes cerca. Uno/a de Jkeyll con los ojos fijos en las estatuas. Otro/a de Orlea que anota algo en un cuaderno.`},
    {id:"sigo",text:"Lo guardás para vos y seguís caminando.",sub:"Ya habrá tiempo para preguntas. Primero, sobrevivir el primer día."},
    {id:"miro",text:"Te quedás mirando un momento más.",sub:"Hay algo en la base de la estatua del centro. No es posible que sea lo que parece."},
  ];

  const results={
    busco:`Te acercás. ${SAEVIK.name} te mira antes de que llegues — como si supiera que venías antes de que te movieras.\n\n"Las estatuas miran hacia afuera," dice, sin que vos hayas dicho nada. "Lo sé desde que entré."\n\n${TESSALY.name} levanta la vista del cuaderno. "Ya lo anoté. Hay seis posiciones posibles para cinco estatuas si querés que todas miren hacia un ángulo diferente. Estas están en la configuración que maximiza la visibilidad de los cuatro puntos cardinales del edificio." Una pausa. "Es raro."\n\nTres personas que notan la misma cosa el primer día. Eso no suele ser una coincidencia.`,
    sigo:`Seguís caminando. La sala principal se ramifica en pasillos que parecen más largos adentro de lo que deberían ser desde afuera.\n\nPasás cerca de dos estudiantes que también se quedaron mirando las estatuas. Uno/a de Jkeyll — ceniza en los bordes de las manos — y otro/a de Orlea con un cuaderno abierto. No decís nada. Ellos tampoco.\n\nLo que viste puede esperar. O puede que no pueda. Eso todavía no lo sabés.`,
    miro:`Los ojos de la estatua del centro son piedra. Son piedra y nada más.\n\nPero hay una marca en la base — no en el frente donde está grabado el nombre, sino en el lado, casi oculta por el ángulo. Parece un sigilo. No uno de los que viste en los libros de referencia que te mandaron antes de empezar.\n\nAlguien a tu lado toma nota. Al darte vuelta ves a dos estudiantes — uno/a hecho/a de sombra, otro/a con ese brillo dorado característico de Orlea. Los dos vieron lo mismo.`,
  };

  if(choice&&scene===blocks.length-1){
    return <HallResult char={char} text={results[choice]} meetingType={choice} goTo={goTo}/>;
  }

  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <GameHeader char={char} label="AÑO I · PRIMER DÍA · MAÑANA"/>
      <div style={{minHeight:"13rem",marginBottom:"1.5rem"}}>
        <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
      </div>
      {!showChoices&&<Btn onClick={()=>{if(!done){skip();return;}if(scene<blocks.length-1)setScene(scene+1);}} color={T.accent}>{!done?"Saltar":"Continuar →"}</Btn>}
      {showChoices&&<div style={{animation:"fadeUp 0.4s ease"}}>
        <Label>¿Qué hacés?</Label>
        {hallChoices.map(c=><ChoiceBtn key={c.id} selected={choice===c.id} onClick={()=>setChoice(c.id)} color={T.accent} sub={c.sub}>{c.text}</ChoiceBtn>)}
      </div>}
    </div>
  </div>;
}

function HallResult({char,text,meetingType,goTo}){
  const {displayed,done,skip}=useTypewriter(text,17);
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <GameHeader char={char} label="AÑO I · PRIMER DÍA · MAÑANA"/>
      <div style={{borderLeft:`2px solid ${T.accent}`,paddingLeft:"1rem",marginBottom:"1.5rem"}}>
        <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
      </div>
      {done&&<div style={{animation:"fadeUp 0.35s ease"}}>
        <Prose dim italic>Las clases empiezan mañana. Esta noche: la Ceremonia de Asignación de Casas.</Prose>
        <Btn onClick={()=>goTo("ceremony",{meetingType})} color={T.gold}>Avanzar a la noche →</Btn>
      </div>}
      {!done&&<Btn onClick={skip} color={T.textDim} small>Saltar</Btn>}
    </div>
  </div>;
}

function Ceremony({char,meetingType,goTo}){
  const [phase,setPhase]=useState(0);
  const [playerChoice,setPlayerChoice]=useState(null); // "accept" | "override"
  const {assigned,conflict}=assignHouse(char);
  const chosenH=HOUSES.find(h=>h.id===char.house);
  const assignedH=HOUSES.find(h=>h.id===assigned);
  // finalH depends on whether conflict happened and what the player chose
  const finalH=(!conflict||playerChoice==="accept") ? (conflict?assignedH:chosenH) : chosenH;

  // NPC houses follow the player's final house
  const npcHouseName=finalH?.name||"Lerudio";

  const saevikAssignText=meetingType==="busco"||meetingType==="miro"
    ?`${SAEVIK.name} es llamado/a antes que vos. Se sienta sin apuro. La silla elige.\n\n${TESSALY.name} es siguiente. La silla decide en menos de un segundo. La misma casa.\n\nLas dos personas que notaron lo mismo que vos en el hall. Los dos en el mismo lugar.\n\nTu nombre es el siguiente.`
    :`Desde donde estás, ves a ${SAEVIK.name} caminar hacia la silla. La silla elige.\n\n${TESSALY.name} sube después. Un segundo. La misma casa que ${SAEVIK.name}.\n\nDos personas que notaron lo que vos notaste. En el mismo lugar.\n\nTu nombre es el siguiente.`;

  const blocks=[
    `El Gran Salón de la academia se transforma al caer la noche.\n\nLas lámparas de majka flotan sobre las mesas largas donde se sientan los estudiantes de años superiores. Los primero-ingresantes están de pie al frente, en una fila que intenta parecer ordenada y no lo logra del todo.\n\nHay una silla en el centro del salón. Vieja. De madera oscura con sigilos grabados en los brazos. Un/a profesor/a que todavía no conocés explica que la silla lee la majka de quien se sienta — no solo la que traen, sino la que llevan sin saber.\n\nLos nombres se llaman en orden alfabético.`,
    `Los primeros nombres caen. Algunos estudiantes se sientan y la silla brilla en el color de la casa — fuego para Magne, tormenta azul para Tunda, verde tierra para Kateer, violeta para Lerudio, azul quieto para Jana.\n\n${saevikAssignText}`,
    `Te sentás.\n\nLa madera está fría aunque el salón tiene temperatura. Los sigilos en los brazos se iluminan — y empiezan a leer.\n\nSentís algo que no tiene nombre todavía. Como si algo dentro de vos prestara atención por primera vez.`,
  ];

  // Phase 3 is the result — dynamic based on conflict + playerChoice
  const resultText=()=>{
    if(!conflict){
      return `La silla decide.\n\nEl color que llena el salón es el de Casa ${finalH?.name}.\n\nNo tardó. La silla supo lo mismo que vos ya sabías.\n\n"${char.name}," dice el/la profesor/a. "Casa ${finalH?.name}."\n\nEl sector de la casa aplaude. Vas a tu lugar.`;
    }
    if(playerChoice==="accept"){
      return `La silla duda.\n\nEl color empieza a formarse — el de Casa ${chosenH?.name}, el que esperabas — y después vacila. Cambia. Se mezcla por un momento que parece demasiado largo para ser cómodo.\n\nEl salón está en silencio.\n\nDespués la silla elige.\n\n"${char.name}," dice el/la profesor/a, con una inflexión que no podés descifrar del todo. "Casa ${assignedH?.name}."\n\nNo era lo que esperabas. Vas a tu lugar de todas formas.\n\nLa duda de la silla no se borra fácil de la cabeza.`;
    }
    // override
    return `La silla duda.\n\nEl color empieza a formarse — el de Casa ${chosenH?.name}, el que esperabas — y después vacila hacia otro. El salón está en silencio.\n\nEn ese momento algo en vos se afirma. No es exactamente voluntad — es más profundo que eso. La silla lo siente.\n\nEl color vuelve. El que querías.\n\n"${char.name}," dice el/la profesor/a, con una pausa que no sabés cómo interpretar. "Casa ${chosenH?.name}."\n\nAlguien en el salón murmura. La silla nunca había dudado así y después cambiado de parecer.\n\nVas a tu lugar. Algo acaba de quedar registrado, aunque no sabés dónde ni por quién.`;
  };

  const aftermathText=`Después de la ceremonia, los primero-ingresantes son llevados a los dormitorios de sus casas.\n\nEs tarde. Todo el mundo está procesando el día.\n\n${meetingType==="busco"
    ?`${SAEVIK.name} y ${TESSALY.name} terminaron en Casa ${finalH?.name} también. Los tres juntos.\n\n${SAEVIK.name} aparece a tu lado en el pasillo. No dice nada por un momento. Después: "Mañana tengo que ir a ver algo antes de las clases. Si querés acompañarme, no voy a decirte que no."\n\nNo especifica qué cosa.\n\n${TESSALY.name} está un poco más adelante, revisando el mapa del edificio. "El ala este tiene una sección que no aparece en este mapa," dice sin levantar la vista. "Y en los planos generales tampoco."`
    :`En el pasillo hacia el dormitorio, cruzás a ${SAEVIK.name} y a ${TESSALY.name}. Los tres en Casa ${finalH?.name}. Los tres que notaron las estatuas.\n\n${TESSALY.name} tiene el cuaderno abierto en una página con un boceto del sigilo. "${SAEVIK.name} me describió uno igual. El de la estatua del centro." Te mira. "¿Vos también lo viste?"`}\n\nEsta noche, por primera vez en la academia, te preguntás qué enterraron exactamente los fundadores en estos cimientos.`;

  // Show conflict choice before showing result
  const showConflictChoice=phase===3&&conflict&&!playerChoice;
  const showResult=phase===3&&(!conflict||!!playerChoice);
  const showAftermath=phase===4;

  const {displayed,done,skip}=useTypewriter(
    showResult ? resultText() : showAftermath ? aftermathText : phase<3 ? blocks[phase] : "",
    17
  );

  const next=()=>{
    if(!done){skip();return;}
    if(phase<2){setPhase(phase+1);return;}
    if(phase===2){setPhase(3);return;}
    if(phase===3&&showResult){setPhase(4);return;}
    if(phase===4){goTo("day2",{assignedHouse:finalH?.id});}
  };

  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <GameHeader char={{...char,house:(finalH||chosenH)?.id||char.house}} label="AÑO I · PRIMER DÍA · NOCHE"/>

      {/* House badge — show after result is read */}
      {showResult&&done&&<div style={{marginBottom:"1.25rem",padding:"0.75rem 1rem",
        border:`2px solid ${finalH?.color}`,background:`rgba(${rgb(finalH?.color||"#94beff")},0.07)`,
        borderRadius:"2px",animation:"fadeUp 0.5s ease",
        boxShadow:`0 0 24px rgba(${rgb(finalH?.color||"#94beff")},0.18)`}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.2em",color:finalH?.color,marginBottom:"0.2rem"}}>ASIGNADA A</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.3rem",color:finalH?.color}}>Casa {finalH?.name}</div>
        {conflict&&playerChoice==="override"&&<div style={{fontFamily:"'Lora',serif",fontSize:"0.75rem",color:T.textDim,fontStyle:"italic",marginTop:"0.3rem"}}>La silla dudó. Algo en vos la hizo cambiar de parecer.</div>}
        {conflict&&playerChoice==="accept"&&<div style={{fontFamily:"'Lora',serif",fontSize:"0.75rem",color:T.textDim,fontStyle:"italic",marginTop:"0.3rem"}}>La silla eligió diferente a lo que esperabas.</div>}
      </div>}

      {/* Narrative text — not shown during conflict choice screen */}
      {!showConflictChoice&&<div style={{minHeight:"13rem",marginBottom:"1.5rem"}}>
        <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
      </div>}

      {/* Conflict choice — pause before result */}
      {showConflictChoice&&<div style={{animation:"fadeUp 0.4s ease"}}>
        <div style={{marginBottom:"1.5rem",padding:"0.9rem 1rem",
          border:`1px solid ${T.border}`,borderRadius:"2px",
          background:"rgba(148,190,255,0.04)"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.2em",color:T.textDim,marginBottom:"0.5rem"}}>LA SILLA DUDA</div>
          <div style={{fontFamily:"'Lora',serif",fontSize:"0.9rem",color:T.text,lineHeight:1.75}}>
            Sentís dos colores pujar al mismo tiempo. El que la silla quiere darte — <span style={{color:assignedH?.color}}>Casa {assignedH?.name}</span> — y el que vos elegiste — <span style={{color:chosenH?.color}}>Casa {chosenH?.name}</span>.
            <br/><br/>La silla espera. En este momento, sos vos quien decide.
          </div>
        </div>
        <Label>¿Qué hacés?</Label>
        <ChoiceBtn selected={false} onClick={()=>setPlayerChoice("accept")} color={assignedH?.color}
          sub={`Dejás que la silla elija. Casa ${assignedH?.name} fue lo que leyó en tu majka.`}>
          Aceptás la asignación de la silla.
        </ChoiceBtn>
        <ChoiceBtn selected={false} onClick={()=>setPlayerChoice("override")} color={chosenH?.color}
          sub={`Algo en vos se afirma. Casa ${chosenH?.name} es donde querés estar — y la silla lo siente.`}>
          Imponés tu voluntad. Casa {chosenH?.name}.
        </ChoiceBtn>
      </div>}

      {/* Continue button — not during conflict choice, and only after text finishes for result/aftermath */}
      {!showConflictChoice&&(
        <Btn onClick={next} color={phase===4&&done?T.gold:T.accent}>
          {!done?"Saltar":phase===4?"Primera noche →":"Continuar →"}
        </Btn>
      )}
    </div>
  </div>;
}

function Day2({char,goTo}){
  const [idx,setIdx]=useState(0);
  const [choice,setChoice]=useState(null);
  const house=HOUSES.find(h=>h.id===char.house);

  const blocks=[
    `El dormitorio de Casa ${house?.name} tiene once camas. La tuya está cerca de la ventana — no elegiste esa, simplemente era la que quedaba.\n\nAfuera, el valle todavía está oscuro. Las estrellas del sistema Faedell son más densas acá que en tu planeta de origen.\n\nNo dormiste mucho. Nadie en la habitación durmió mucho.`,
    `La primera clase del día es a las ocho de la mañana.\n\nBajás al comedor antes de eso. Hay pan, algo que huele a fruta y hierba mezcladas, y té de majka — así le dicen, aunque todavía no sabés exactamente qué significa eso.\n\n${SAEVIK.name} está sentado/a solo/a en un extremo. ${TESSALY.name} tiene el cuaderno abierto al lado del desayuno.\n\nHay un asiento libre cerca de los dos.`,
  ];

  const {displayed,done,skip}=useTypewriter(blocks[idx],17);
  const showChoices=idx===blocks.length-1&&done&&!choice;

  const choices=[
    {id:"saevik",text:`Te sentás cerca de ${SAEVIK.name}.`,sub:"Querés saber más sobre lo que dijo anoche en el pasillo."},
    {id:"tessaly",text:`Te sentás cerca de ${TESSALY.name}.`,sub:"El cuaderno tiene más cosas que querés ver."},
    {id:"solo",text:"Te sentás solo/a.",sub:"Necesitás un momento antes de empezar a relacionarte con este mundo."},
  ];

  const results={
    saevik:`${SAEVIK.name} no levanta los ojos cuando te sentás. Después de un momento:\n\n"Soñé con el sigilo."\n\nNo explica qué significa eso. Toma el té. "La primera clase de Historia Mágica es hoy. El profesor Dael tiene acceso a los archivos de los fundadores." Una pausa. "Eso es todo lo que sé por ahora."\n\nEs poco. También es más de lo que esperabas que dijera.`,
    tessaly:`${TESSALY.name} gira el cuaderno para que puedas verlo. Hay tres bocetos del sigilo desde ángulos distintos, con notas en los márgenes.\n\n"Pregunté en la biblioteca anoche. Los archivos de los fundadores están en el ala restringida y necesitás nivel cuatro para entrar." Golpea el lápiz contra el papel. "Somos nivel uno. Eso es un problema."\n\n"Temporalmente," agrega, como si eso resolviera algo.`,
    solo:`Comés en silencio. Desde donde estás, podés ver a los dos — ${SAEVIK.name} quieto/a como siempre, ${TESSALY.name} escribiendo.\n\nNadie se acerca. Nadie te presiona.\n\nPor ahora, este mundo te deja a tu propio ritmo. No sabés por cuánto tiempo más.`,
  };

  if(choice){
    return <Day2Result char={char} text={results[choice]} goTo={goTo}/>;
  }

  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <GameHeader char={char} label="AÑO I · DÍA DOS · MAÑANA"/>
      <div style={{minHeight:"12rem",marginBottom:"1.5rem"}}>
        <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
      </div>
      {!showChoices&&<Btn onClick={()=>{if(!done){skip();return;}if(idx<blocks.length-1)setIdx(idx+1);}} color={T.accent}>{!done?"Saltar":"Continuar →"}</Btn>}
      {showChoices&&<div style={{animation:"fadeUp 0.4s ease"}}>
        <Label>¿Qué hacés?</Label>
        {choices.map(c=><ChoiceBtn key={c.id} selected={choice===c.id} onClick={()=>setChoice(c.id)} color={T.accent} sub={c.sub}>{c.text}</ChoiceBtn>)}
      </div>}
    </div>
  </div>;
}

function Day2Result({char,text,goTo}){
  const {displayed,done,skip}=useTypewriter(text,17);
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <GameHeader char={char} label="AÑO I · DÍA DOS · MAÑANA"/>
      <div style={{borderLeft:`2px solid ${T.accent}`,paddingLeft:"1rem",marginBottom:"1.5rem"}}>
        <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
      </div>
      {done&&<div style={{animation:"fadeUp 0.35s ease"}}>
        <Prose dim italic>La primera clase empieza en quince minutos. Historia Mágica del Sistema Faedell. Profesor Dael Orren.</Prose>
        <Btn onClick={()=>goTo("firstclass")} color={T.gold}>Ir a clase →</Btn>
      </div>}
      {!done&&<Btn onClick={skip} color={T.textDim} small>Saltar</Btn>}
    </div>
  </div>;
}

function FirstClass({char,goTo}){
  const [phase,setPhase]=useState(0);
  const [choice,setChoice]=useState(null);

  const blocks=[
    `El aula de Historia Mágica está en el ala norte del primer piso. Las paredes tienen mapas del sistema Faedell — versiones distintas a lo largo del tiempo, con bordes que cambian, planetas que aparecen y desaparecen según la época.\n\nEl profesor Dael Orren entra sin anunciarse. Mayor, con el tipo de calma que viene de haber visto demasiado para alterarse por poco. No hace llamado. No presenta la materia. Empieza a hablar.`,
    `"El sistema Faedell tiene seis planetas," dice, con la voz del que repite algo que sabe que va a contradecir en breve. "Eso es lo que dice el registro oficial. Eso es lo que va a decir cualquier mapa que encuentren en esta academia."\n\nSe para frente al mapa más grande. Lo toca con un dedo.\n\n"Lo que los registros oficiales no dicen es por qué hay seis planetas. Por qué ese número específico. Por qué los fundadores eligieron Aelhollow para construir aquí."`,
    `Nadie habla.\n\nDael deja la pregunta en el aire exactamente el tiempo suficiente para que incomode.\n\n"No les voy a dar esa respuesta hoy. No porque no la sepa." Vuelve a su escritorio. "Sino porque la respuesta que yo les dé no va a servir de nada. Tienen que llegar a ella solos."\n\nSaca un libro que parece más viejo que la academia misma y lo pone sobre el escritorio.\n\n"La primera tarea de este año es encontrar qué pregunta es la correcta. Eso siempre es más difícil que encontrar la respuesta."`,
  ];

  const {displayed,done,skip}=useTypewriter(blocks[phase],17);
  const showChoices=phase===blocks.length-1&&done&&!choice;

  const choices=[
    {id:"pregunta",text:"Le preguntás directamente qué pregunta es la correcta.",sub:"Arriesgás que te ignoren. O que te respondan algo que no estabas listo/a para escuchar."},
    {id:"libro",text:"Mirás el libro en su escritorio.",sub:"Tiene una tapa sin título. Los sigilos del lomo son distintos a los que viste en cualquier otro lado."},
    {id:"espero",text:"Esperás. Escuchás. Por ahora.",sub:"Hay cosas que se aprenden antes de hacer preguntas."},
  ];

  const results={
    pregunta:`Dael te mira.\n\nNo con sorpresa — como si hubiera estado esperando que alguien lo hiciera. Señala el mapa.\n\n"¿Cuántos planetas ven?"\n\n"Seis," decís.\n\n"¿Están seguros/as?"\n\nNadie responde. Dael no dice nada más.\n\nDespués de clase, ${SAEVIK.name} se para a tu lado frente al mapa. "Seis planetas." Pausa. "¿Por qué no cinco? ¿O siete?" Otro silencio. "Esa es la pregunta."`,
    libro:`Después de clase te acercás al escritorio. El libro sigue ahí — Dael no lo guardó.\n\nLa tapa no tiene título, pero adentro de la primera hoja hay una inscripción en el idioma antiguo. Reconocés dos palabras: "origen" y "olvidado".\n\nLevantás la vista. Dael está en la puerta, de espaldas. "Los libros sin título," dice sin girarse, "generalmente lo son por una razón."\n\nSale. El libro se queda.`,
    espero:`Escuchás.\n\nDael habla cuarenta minutos más sobre la historia del sistema — guerras, tratados, el origen de las Fuerzas Supremas como concepto político además de espiritual. Todo interesante. Nada que responda la pregunta que dejó en el aire.\n\nAl final, ${TESSALY.name} cierra el cuaderno. "Siete páginas de notas y ninguna respuesta." Una pausa. "Ese hombre sabe exactamente lo que está haciendo."`,
  };

  if(choice){
    return <FirstClassResult char={char} text={results[choice]} goTo={goTo}/>;
  }

  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <GameHeader char={char} label="AÑO I · DÍA DOS · HISTORIA MÁGICA"/>
      <div style={{marginBottom:"1.1rem"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.65rem",letterSpacing:"0.15em",color:T.textDim}}>PROF. DAEL ORREN</div>
        <div style={{fontFamily:"'Lora',serif",fontSize:"0.75rem",fontStyle:"italic",color:T.textFaint}}>Historia Mágica del Sistema Faedell · Año I</div>
      </div>
      <div style={{minHeight:"13rem",marginBottom:"1.5rem"}}>
        <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
      </div>
      {!showChoices&&<Btn onClick={()=>{if(!done){skip();return;}if(phase<blocks.length-1)setPhase(phase+1);}} color={T.accent}>{!done?"Saltar":"Continuar →"}</Btn>}
      {showChoices&&<div style={{animation:"fadeUp 0.4s ease"}}>
        <Label>¿Qué hacés?</Label>
        {choices.map(c=><ChoiceBtn key={c.id} selected={choice===c.id} onClick={()=>setChoice(c.id)} color={T.accent} sub={c.sub}>{c.text}</ChoiceBtn>)}
      </div>}
    </div>
  </div>;
}

function FirstClassResult({char,text,goTo}){
  const {displayed,done,skip}=useTypewriter(text,17);
  return <div style={{minHeight:"100vh",padding:"2rem 1.5rem",maxWidth:"640px",margin:"0 auto"}}>
    <div style={{paddingTop:"2rem"}}>
      <GameHeader char={char} label="AÑO I · DÍA DOS · HISTORIA MÁGICA"/>
      <div style={{borderLeft:`2px solid ${T.lerudio}`,paddingLeft:"1rem",marginBottom:"1.5rem"}}>
        <Prose>{displayed}{!done&&<span style={{animation:"blink 1s step-end infinite",color:T.accent}}>▌</span>}</Prose>
      </div>
      {done&&<div style={{animation:"fadeUp 0.35s ease"}}>
        <div style={{background:"rgba(232,200,122,0.05)",border:`1px solid ${T.goldDim}`,borderRadius:"2px",padding:"1rem",marginBottom:"1.25rem"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",letterSpacing:"0.2em",color:T.gold,marginBottom:"0.5rem"}}>FIN DEL CAPÍTULO I</div>
          <div style={{fontFamily:"'Lora',serif",fontSize:"0.88rem",color:T.textDim,lineHeight:1.7}}>
            El primer día terminó. Conociste a {SAEVIK.name} y {TESSALY.name}. Viste un sigilo que no debería estar ahí. Fuiste asignado/a a tu casa. El Profesor Dael Orren dejó una pregunta que todavía no sabés cómo responder.<br/><br/>
            El Capítulo II — la primera semana completa — continúa en la próxima actualización.
          </div>
        </div>
        <Btn onClick={()=>goTo("world")} color={T.textDim}>Explorar libremente →</Btn>
      </div>}
      {!done&&<Btn onClick={skip} color={T.textDim} small>Saltar</Btn>}
    </div>
  </div>;
}

// ── APP ───────────────────────────────────────────────────────────
const INIT={name:"",pronouns:"",planet:null,background:null,trait1:null,trait2:null,fear:null,house:null,motivation:null};

export default function App(){
  const [screen,setScreen]=useState("title");
  const [char,setChar]=useState(INIT);
  const [extra,setExtra]=useState({});
  const [hasSave,setHasSave]=useState(false);
  const [saveInfo,setSaveInfo]=useState(null);

  useEffect(()=>{
    const s=loadGame();
    if(s){ setHasSave(true); const d=new Date(s.ts);
      setSaveInfo(`Última sesión: ${d.toLocaleDateString()} ${d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`); }
  },[]);

  const update=(data,next)=>{
    const c={...char,...data}; setChar(c); setScreen(next); saveGame(next,c);
  };

  const goTo=(next,ex={})=>{
    let c=char;
    if(ex.assignedHouse){c={...char,house:ex.assignedHouse};setChar(c);}
    setExtra(ex); setScreen(next); saveGame(next,c);
  };

  const handleContinue=()=>{
    const s=loadGame(); if(s){setChar(s.char);setScreen(s.screen);}
  };

  const handleNew=()=>{ clearGame(); setChar(INIT); setScreen("prologue"); };
  const handleSave=()=>saveGame(screen,char);

  const gameScreens=["year1","ceremony","day2","firstclass","world"];
  const isGame=gameScreens.includes(screen);

  const meetingType=extra.meetingType||"sigo";

  const map={
    title:    <Title onStart={handleNew} onContinue={handleContinue} hasSave={hasSave} saveInfo={saveInfo}/>,
    prologue: <Prologue onNext={()=>setScreen("name")}/>,
    name:     <StepName char={char} onNext={d=>update(d,"planet")}/>,
    planet:   <StepPlanet char={char} onNext={d=>update(d,"background")}/>,
    background:<StepBackground char={char} onNext={d=>update(d,"traits")}/>,
    traits:   <StepTraits char={char} onNext={d=>update(d,"house")}/>,
    house:    <StepHouse char={char} onNext={d=>update(d,"motivation")}/>,
    motivation:<StepMotivation char={char} onNext={d=>update(d,"summary")}/>,
    summary:  <Summary char={char} onStart={()=>{setScreen("year1");saveGame("year1",char);}}/>,
    year1:    <Year1 char={char} goTo={goTo}/>,
    ceremony: <Ceremony char={char} meetingType={meetingType} goTo={goTo}/>,
    day2:     <Day2 char={char} goTo={goTo}/>,
    firstclass:<FirstClass char={char} goTo={goTo}/>,
    world:    <WorldEngine char={char} onBack={()=>goTo("firstclass")}/>,
  };

  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:${T.bgDeep};color:${T.text}}
      input::placeholder{color:${T.textFaint}}
      input{border-radius:0!important}
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-track{background:${T.bgDeep}}
      ::-webkit-scrollbar-thumb{background:${T.accentDim};border-radius:2px}
      @keyframes twinkle{0%,100%{opacity:0;transform:scale(1)}50%{opacity:0.55;transform:scale(1.3)}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
    <div style={{background:T.bgDeep,minHeight:"100vh",position:"relative"}}>
      <Starfield/>
      <div style={{position:"relative",zIndex:1,paddingBottom:"4rem"}}>
        {map[screen]||map.title}
      </div>
      {isGame&&<SaveBtn onSave={handleSave}/>}
    </div>
  </>;
}
