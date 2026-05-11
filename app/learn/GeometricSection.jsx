'use client'
import { useState, useEffect, useRef } from 'react'

const C = {
  teal:'#007A6E',amber:'#C97A0A',red:'#B83030',blue:'#1A56B0',
  purple:'#6B35A0',text:'#1A1E2E',muted:'#6B7A99',border:'#DED8CC',
  green:'#1A7A3C',
  tealL:'#E6F4F2',amberL:'#FEF3E0',redL:'#FCECEA',blueL:'#E8F0FC',purpleL:'#F0E9FB',greenL:'#E6F4EC',
}
const F="'Fira Code',monospace"
const P="'Plus Jakarta Sans',sans-serif"
const PD="'Playfair Display',serif"

const sec={padding:'40px 48px',maxWidth:'980px',fontFamily:P}
const h2s={fontFamily:PD,fontSize:'1.35rem',margin:'28px 0 10px',color:C.text}
const h3s={fontSize:'.95rem',fontWeight:700,margin:'18px 0 8px',color:C.text}
const card=(col)=>({background:col?C[col+'L']:'#fff',border:`1px solid ${C.border}`,borderLeft:col?`4px solid ${C[col]}`:`1px solid ${C.border}`,borderRadius:'12px',padding:'18px',marginBottom:'14px'})
const ct=(col)=>({fontWeight:700,fontSize:'.72rem',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px',color:C[col]||C.text})
const tag=(col)=>({display:'inline-block',padding:'2px 10px',borderRadius:'20px',fontSize:'.68rem',fontWeight:700,marginRight:'5px',marginBottom:'10px',background:C[col+'L'],color:C[col]})
const ibox={background:'#fff',border:`2px solid ${C.border}`,borderRadius:'12px',padding:'20px',margin:'14px 0'}
const iboxT={fontSize:'.7rem',color:C.muted,fontFamily:F,letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',textAlign:'center'}
const g2={display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}
const hl={background:'linear-gradient(135deg,#007A6E,#00967D)',color:'#fff',borderRadius:'12px',padding:'18px 22px',margin:'16px 0'}
const tbl={width:'100%',borderCollapse:'collapse',margin:'12px 0',fontSize:'.82rem'}
const th={background:C.text,color:'#fff',padding:'9px 13px',textAlign:'left',fontSize:'.77rem'}
const td=(i)=>({padding:'9px 13px',borderBottom:`1px solid ${C.border}`,background:i%2===0?'#EFEBE2':'#fff'})

// ─── SVG PRIMITIVES (correct chemistry) ──────────────────────────────────────
// All bonds connect to atom EDGES, not centers
// Carbon = 4 bonds always. H implicit at vertices.

const Dot=({x,y,col=C.text})=><circle cx={x} cy={y} r="2.8" fill={col}/>

// Atom label — white bg so it covers bond lines cleanly
const A=({x,y,t,col=C.text,sz=11,anchor='middle'})=>{
  const w=t.length*sz*0.62+6
  return <g>
    <rect x={x-(anchor==='middle'?w/2:anchor==='start'?0:-w)} y={y-sz*0.8} width={w} height={sz*1.6} fill="white"/>
    <text x={x} y={y+sz*0.38} textAnchor={anchor} fontSize={sz} fill={col} fontWeight="700" fontFamily={F}>{t}</text>
  </g>
}

// Single bond
const B=({x1,y1,x2,y2,col=C.text,dash=false})=>(
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="2" strokeDasharray={dash?'5,3':'none'}/>
)

// Double bond — two parallel lines offset perpendicular
const D=({x1,y1,x2,y2,col=C.text,offset=3.5})=>{
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ox=(-dy/len)*offset,oy=(dx/len)*offset
  return <g>
    <line x1={x1+ox} y1={y1+oy} x2={x2+ox} y2={y2+oy} stroke={col} strokeWidth="2"/>
    <line x1={x1-ox} y1={y1-oy} x2={x2-ox} y2={y2-oy} stroke={col} strokeWidth="2"/>
  </g>
}

// Solid wedge (toward viewer) — proper filled triangle
const WS=({x1,y1,x2,y2,col=C.text})=>{
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ox=(-dy/len)*5,oy=(dx/len)*5
  return <polygon points={`${x1},${y1} ${x2+ox},${y2+oy} ${x2-ox},${y2-oy}`} fill={col}/>
}

// Dashed wedge (away from viewer) — horizontal dashes getting wider
const WD=({x1,y1,x2,y2,col=C.text})=>{
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ux=dx/len,uy=dy/len,ox=-uy,oy=ux
  return <g>{Array.from({length:7},(_,i)=>{
    const t=(i+1)/8,w=t*5
    return <line key={i} x1={x1+dx*t+ox*w} y1={y1+dy*t+oy*w} x2={x1+dx*t-ox*w} y2={y1+dy*t-oy*w} stroke={col} strokeWidth="1.5"/>
  })}</g>
}

const MirrorLine=({x,y1=10,y2=200})=>(
  <g>
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.amber} strokeWidth="2.5" strokeDasharray="8,5"/>
    <text x={x} y={y1-3} textAnchor="middle" fontSize="9" fill={C.amber} fontFamily={F} fontWeight="700">mirror</text>
  </g>
)

// ─── MOLECULE DRAWINGS ────────────────────────────────────────────────────────

// Generic alkene C=C with 4 substituents
// Positions: top-left, bottom-left (on left C), top-right, bottom-right (on right C)
const Alkene=({cx=110,cy=80,tl,bl,tr,br,tlC=C.text,blC=C.muted,trC=C.text,brC=C.muted,label=''})=>{
  // Left C at (cx-40,cy), Right C at (cx+40,cy)
  const lx=cx-40,rx=cx+40
  return (
    <g>
      <D x1={lx} y1={cy} x2={rx} y2={cy}/>
      <Dot x={lx} y={cy}/><Dot x={rx} y={cy}/>
      {/* Left substituents */}
      <B x1={lx} y1={cy} x2={lx-45} y2={cy-38}/>
      <A x={lx-52} y={cy-42} t={tl} col={tlC} sz={10}/>
      <B x1={lx} y1={cy} x2={lx-45} y2={cy+38}/>
      <A x={lx-52} y={cy+42} t={bl} col={blC} sz={10}/>
      {/* Right substituents */}
      <B x1={rx} y1={cy} x2={rx+45} y2={cy-38}/>
      <A x={rx+52} y={cy-42} t={tr} col={trC} sz={10}/>
      <B x1={rx} y1={cy} x2={rx+45} y2={cy+38}/>
      <A x={rx+52} y={cy+42} t={br} col={brC} sz={10}/>
      {label&&<text x={cx} y={cy+72} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>{label}</text>}
    </g>
  )
}

// CIS but-2-ene: CH3 groups on same side
const CisButene=()=>(
  <svg viewBox="0 0 240 170" style={{width:'100%',maxHeight:'155px'}}>
    <Alkene cx={120} cy={80} tl="CH₃" bl="H" tr="CH₃" br="H" tlC={C.teal} trC={C.teal} blC={C.muted} brC={C.muted}/>
    <path d="M 68,42 Q 120,18 172,42" stroke={C.teal} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
    <text x={120} y={14} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F} fontWeight="700">same side → cis (Z)</text>
    <rect x={60} y={148} width="120" height="18" rx="5" fill={C.tealL}/>
    <text x={120} y={160} textAnchor="middle" fontSize="9" fill={C.teal} fontFamily={F} fontWeight="700">cis-but-2-ene</text>
  </svg>
)

// TRANS but-2-ene: CH3 groups on opposite sides
const TransButene=()=>(
  <svg viewBox="0 0 240 170" style={{width:'100%',maxHeight:'155px'}}>
    <Alkene cx={120} cy={80} tl="CH₃" bl="H" tr="H" br="CH₃" tlC={C.red} trC={C.muted} blC={C.muted} brC={C.red}/>
    <path d="M 68,42 Q 120,88 172,122" stroke={C.red} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
    <text x={120} y={14} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F} fontWeight="700">opposite sides → trans (E)</text>
    <rect x={60} y={148} width="120" height="18" rx="5" fill={C.redL}/>
    <text x={120} y={160} textAnchor="middle" fontSize="9" fill={C.red} fontFamily={F} fontWeight="700">trans-but-2-ene</text>
  </svg>
)

// Maleic acid (Z) — COOH same side
const MaleicAcid=()=>(
  <svg viewBox="0 0 240 170" style={{width:'100%',maxHeight:'155px'}}>
    <Alkene cx={120} cy={85} tl="COOH" bl="H" tr="COOH" br="H" tlC={C.red} trC={C.red} blC={C.muted} brC={C.muted}/>
    <path d="M 62,44 Q 120,18 178,44" stroke={C.red} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
    <text x={120} y={12} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F} fontWeight="700">COOH same side → Z</text>
    <rect x={30} y={150} width="180" height="18" rx="5" fill={C.redL}/>
    <text x={120} y={162} textAnchor="middle" fontSize="9" fill={C.red} fontFamily={F} fontWeight="700">(Z)-butenedioic acid (maleic)</text>
  </svg>
)

// Fumaric acid (E) — COOH opposite sides
const FumaricAcid=()=>(
  <svg viewBox="0 0 240 170" style={{width:'100%',maxHeight:'155px'}}>
    <Alkene cx={120} cy={85} tl="COOH" bl="H" tr="H" br="COOH" tlC={C.teal} trC={C.muted} blC={C.muted} brC={C.teal}/>
    <path d="M 62,44 Q 120,88 178,126" stroke={C.teal} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
    <text x={120} y={12} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F} fontWeight="700">COOH opposite → E</text>
    <rect x={30} y={150} width="180" height="18" rx="5" fill={C.tealL}/>
    <text x={120} y={162} textAnchor="middle" fontSize="9" fill={C.teal} fontFamily={F} fontWeight="700">(E)-butenedioic acid (fumaric)</text>
  </svg>
)

// 2-chlorobut-2-ene: CH3/Cl on left C, CH3/H on right C
const ChloroButene=({isCis})=>(
  <svg viewBox="0 0 240 170" style={{width:'100%',maxHeight:'155px'}}>
    <Alkene cx={120} cy={85}
      tl="CH₃" bl="Cl"
      tr={isCis?"CH₃":"H"} br={isCis?"H":"CH₃"}
      tlC={C.teal} blC={C.blue}
      trC={isCis?C.teal:C.muted} brC={isCis?C.muted:C.teal}
    />
    <text x={120} y={12} textAnchor="middle" fontSize="8" fill={isCis?C.teal:C.red} fontFamily={F} fontWeight="700">
      {isCis?'cis (Z): CH₃ same side as CH₃':'trans (E): CH₃ opposite to CH₃'}
    </text>
    <rect x={40} y={150} width="160" height="18" rx="5" fill={isCis?C.tealL:C.redL}/>
    <text x={120} y={162} textAnchor="middle" fontSize="9" fill={isCis?C.teal:C.red} fontFamily={F} fontWeight="700">
      {isCis?'(Z)-2-chlorobut-2-ene':'(E)-2-chlorobut-2-ene'}
    </text>
  </svg>
)

// Stilbene: Ph/H on each carbon
const Stilbene=({isCis})=>(
  <svg viewBox="0 0 280 170" style={{width:'100%',maxHeight:'155px'}}>
    <g>
      <D x1={100} y1={85} x2={180} y2={85}/>
      <Dot x={100} y={85}/><Dot x={180} y={85}/>
      {/* Left C: Ph up, H down */}
      <B x1={100} y1={85} x2={55} y2={48}/>
      <text x={44} y={44} textAnchor="middle" fontSize="10" fill={C.purple} fontWeight="700" fontFamily={F}>Ph</text>
      <B x1={100} y1={85} x2={55} y2={122}/>
      <A x={46} y={126} t="H" col={C.muted} sz={10}/>
      {/* Right C */}
      <B x1={180} y1={85} x2={225} y2={isCis?48:122}/>
      <text x={236} y={isCis?44:126} textAnchor="middle" fontSize="10" fill={C.purple} fontWeight="700" fontFamily={F}>Ph</text>
      <B x1={180} y1={85} x2={225} y2={isCis?122:48}/>
      <A x={236} y={isCis?126:44} t="H" col={C.muted} sz={10}/>
    </g>
    <rect x={60} y={150} width="160" height="18" rx="5" fill={isCis?C.redL:C.tealL}/>
    <text x={140} y={162} textAnchor="middle" fontSize="9" fill={isCis?C.red:C.teal} fontFamily={F} fontWeight="700">
      {isCis?'cis-stilbene (Z)':'trans-stilbene (E)'}
    </text>
  </svg>
)

// Oxime: R-CH=N-OH showing syn/anti
const Oxime=({isSyn})=>(
  <svg viewBox="0 0 280 160" style={{width:'100%',maxHeight:'148px'}}>
    {/* C=N bond */}
    <D x1={80} y1={80} x2={160} y2={80}/>
    <Dot x={80} y={80}/>
    {/* Left C: R up, H down */}
    <B x1={80} y1={80} x2={40} y2={48}/>
    <A x={30} y={42} t="R" col={C.amber} sz={11}/>
    <B x1={80} y1={80} x2={40} y2={112}/>
    <A x={30} y={118} t="H" col={C.muted} sz={10}/>
    {/* N atom */}
    <A x={160} y={80} t="N" col={C.blue} sz={11}/>
    {/* OH: syn=same side as R (up), anti=opposite (down) */}
    <B x1={168} y1={80} x2={210} y2={isSyn?48:112}/>
    <A x={220} y={isSyn?42:118} t="OH" col={C.red} sz={10}/>
    {/* Lone pair on N */}
    <text x={168} y={68} fontSize="9" fill={C.blue} fontFamily={F}>:</text>
    <text x={120} y={14} textAnchor="middle" fontSize="9" fill={isSyn?C.teal:C.red} fontFamily={F} fontWeight="700">
      {isSyn?'syn-oxime: OH same side as R':'anti-oxime: OH opposite to R'}
    </text>
    <rect x={60} y={138} width="160" height="18" rx="5" fill={isSyn?C.tealL:C.redL}/>
    <text x={140} y={150} textAnchor="middle" fontSize="9" fill={isSyn?C.teal:C.red} fontFamily={F} fontWeight="700">
      {isSyn?'syn (Z) isomer':'anti (E) isomer'}
    </text>
  </svg>
)

// Cyclohexane ring with 2 substituents showing cis/trans
const CycloRing=({isCis,sub1='CH₃',sub2='CH₃',ringSize=6})=>{
  const cx=120,cy=85,r=48
  const n=ringSize
  const pts=Array.from({length:n},(_,i)=>{
    const a=(i*360/n-90)*Math.PI/180
    return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}
  })
  return (
    <svg viewBox="0 0 240 195" style={{width:'100%',maxHeight:'185px'}}>
      {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%n].x} y2={pts[(i+1)%n].y} stroke={C.text} strokeWidth="2.2"/>)}
      {/* C1 = pts[0] (top): sub1 always up */}
      <B x1={pts[0].x} y1={pts[0].y} x2={pts[0].x} y2={pts[0].y-28}/>
      <A x={pts[0].x} y={pts[0].y-34} t={sub1} col={C.teal} sz={10}/>
      <text x={pts[0].x} y={pts[0].y+14} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C1</text>
      {/* C2 = pts[1]: sub2 up (cis) or down (trans) */}
      {isCis
        ?<><B x1={pts[1].x} y1={pts[1].y} x2={pts[1].x+22} y2={pts[1].y-26}/><A x={pts[1].x+30} y={pts[1].y-32} t={sub2} col={C.teal} sz={10}/></>
        :<><B x1={pts[1].x} y1={pts[1].y} x2={pts[1].x+22} y2={pts[1].y+26}/><A x={pts[1].x+30} y={pts[1].y+32} t={sub2} col={C.red} sz={10}/></>
      }
      <text x={pts[1].x+8} y={pts[1].y+14} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C2</text>
      <rect x={40} y={162} width="160" height="30" rx="6" fill={isCis?C.tealL:C.redL}/>
      <text x={120} y={175} textAnchor="middle" fontSize="9" fill={isCis?C.teal:C.red} fontFamily={F} fontWeight="700">
        {isCis?`cis-1,2-di${sub1.toLowerCase()}cyclo${n===6?'hexane':'pentane'}`:`trans-1,2-di${sub1.toLowerCase()}cyclo${n===6?'hexane':'pentane'}`}
      </text>
      <text x={120} y={187} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>
        {isCis?'same face':'opposite faces'}
      </text>
    </svg>
  )
}

// ─── ANIMATED CIS-TRANS TOGGLE ────────────────────────────────────────────
const AnimatedCisTrans=()=>{
  const [mode,setMode]=useState('cis')
  const [animating,setAnimating]=useState(false)

  const toggle=()=>{
    if(animating) return
    setAnimating(true)
    setTimeout(()=>{setMode(m=>m==='cis'?'trans':'cis');setAnimating(false)},400)
  }

  return (
    <div style={{textAlign:'center'}}>
      <div style={{display:'flex',justifyContent:'center',gap:'8px',marginBottom:'12px'}}>
        <button onClick={()=>{setMode('cis');setAnimating(false)}} style={{padding:'6px 16px',borderRadius:'8px',border:`2px solid ${C.teal}`,background:mode==='cis'?C.teal:'transparent',color:mode==='cis'?'#fff':C.teal,fontFamily:P,fontWeight:600,fontSize:'.82rem',cursor:'pointer'}}>cis</button>
        <button onClick={toggle} style={{padding:'6px 16px',borderRadius:'8px',border:`2px solid ${C.amber}`,background:C.amberL,color:C.amber,fontFamily:P,fontWeight:600,fontSize:'.82rem',cursor:'pointer',transition:'all .2s'}}>⇄ Rotate</button>
        <button onClick={()=>{setMode('trans');setAnimating(false)}} style={{padding:'6px 16px',borderRadius:'8px',border:`2px solid ${C.red}`,background:mode==='trans'?C.red:'transparent',color:mode==='trans'?'#fff':C.red,fontFamily:P,fontWeight:600,fontSize:'.82rem',cursor:'pointer'}}>trans</button>
      </div>
      <div style={{transition:'opacity .3s',opacity:animating?.3:1}}>
        {mode==='cis'?<CisButene/>:<TransButene/>}
      </div>
      <div style={{marginTop:'10px',padding:'10px',background:mode==='cis'?C.tealL:C.redL,borderRadius:'8px',fontSize:'.83rem',color:mode==='cis'?C.teal:C.red,fontWeight:600,transition:'all .3s'}}>
        {mode==='cis'
          ?'cis: CH₃ groups on SAME side — higher dipole moment, lower stability'
          :'trans: CH₃ groups on OPPOSITE sides — lower dipole moment, higher stability'}
      </div>
      <div style={{marginTop:'8px',fontSize:'.8rem',color:C.muted}}>Note: Interconversion requires breaking the π bond (~250 kJ/mol) — does NOT happen spontaneously</div>
    </div>
  )
}

// ─── E/Z PRIORITY ANIMATOR ───────────────────────────────────────────────
const EZAssigner=()=>{
  const [step,setStep]=useState(0)
  const steps=[
    {label:'Identify the two doubly-bonded carbons',highlight:'carbons'},
    {label:'Assign priorities on LEFT carbon: Cl(17)>CH₃(6) so Cl=① CH₃=②',highlight:'left'},
    {label:'Assign priorities on RIGHT carbon: C₂H₅(8)>H(1) so C₂H₅=① H=②',highlight:'right'},
    {label:'High priority groups: Cl(up-left) and C₂H₅(down-right) → OPPOSITE sides → E',highlight:'result'},
  ]
  return (
    <div>
      <svg viewBox="0 0 280 170" style={{width:'100%',maxHeight:'155px'}}>
        {/* C=C double bond */}
        <D x1={100} y1={85} x2={180} y2={85}/>
        <Dot x={100} y={85}/><Dot x={180} y={85}/>
        {/* Left C: Cl up (high priority), CH3 down */}
        <B x1={100} y1={85} x2={58} y2={48}/>
        <A x={46} y={42} t="Cl" col={step>=1?C.red:C.text} sz={11}/>
        {step>=1&&<text x={46} y={30} textAnchor="middle" fontSize="10" fill={C.red} fontFamily={F} fontWeight="700">①</text>}
        <B x1={100} y1={85} x2={58} y2={122}/>
        <A x={46} y={128} t="CH₃" col={step>=1?C.amber:C.text} sz={10}/>
        {step>=1&&<text x={46} y={142} textAnchor="middle" fontSize="10" fill={C.amber} fontFamily={F} fontWeight="700">②</text>}
        {/* Right C: C2H5 down (high priority), H up */}
        <B x1={180} y1={85} x2={222} y2={48}/>
        <A x={234} y={42} t="H" col={step>=2?C.amber:C.muted} sz={11}/>
        {step>=2&&<text x={234} y={30} textAnchor="middle" fontSize="10" fill={C.amber} fontFamily={F} fontWeight="700">②</text>}
        <B x1={180} y1={85} x2={222} y2={122}/>
        <A x={238} y={128} t="C₂H₅" col={step>=2?C.red:C.text} sz={10}/>
        {step>=2&&<text x={238} y={142} textAnchor="middle" fontSize="10" fill={C.red} fontFamily={F} fontWeight="700">①</text>}
        {/* Result arrow */}
        {step>=3&&<path d="M 55,42 Q 140,90 228,130" stroke={C.teal} strokeWidth="2" fill="none" strokeDasharray="5,3"/>}
        {step>=3&&<text x={140} y={168} textAnchor="middle" fontSize="10" fill={C.teal} fontFamily={F} fontWeight="700">→ opposite sides → (E)</text>}
        {/* Carbon labels */}
        {step>=0&&<text x={100} y={100} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C2</text>}
        {step>=0&&<text x={180} y={100} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C3</text>}
      </svg>
      <div style={{background:C.blueL,border:`1px solid ${C.blue}`,borderRadius:'8px',padding:'10px 14px',margin:'8px 0',fontSize:'.83rem',color:C.blue,minHeight:'36px'}}>
        <strong>Step {step+1}/4:</strong> {steps[step].label}
      </div>
      <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:'7px 16px',borderRadius:'8px',border:`1px solid ${C.border}`,background:'#fff',cursor:step===0?'default':'pointer',opacity:step===0?.4:1,fontFamily:P,fontWeight:600,fontSize:'.82rem'}}>← Back</button>
        <button onClick={()=>setStep(s=>Math.min(3,s+1))} disabled={step===3} style={{padding:'7px 16px',borderRadius:'8px',border:'none',background:step===3?C.muted:C.teal,color:'#fff',cursor:step===3?'default':'pointer',fontFamily:P,fontWeight:600,fontSize:'.82rem'}}>Next →</button>
        <button onClick={()=>setStep(0)} style={{padding:'7px 16px',borderRadius:'8px',border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontFamily:P,fontSize:'.82rem'}}>Reset</button>
      </div>
    </div>
  )
}

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const QUIZ=[
  {q:'Which of the following can show geometric isomerism?',opts:['CH₃-CH=CH₂','CH₂=CH₂','CH₃-CH=CH-CH₃','(CH₃)₂C=CH₂'],ans:2,exp:'CH₃-CH=CH-CH₃ (but-2-ene): each sp² carbon has 2 different groups (CH₃ and H on each). The others have identical groups on at least one sp² carbon.'},
  {q:'The IUPAC name of the more stable geometric isomer of CH₃CH=CHCH₃ is:',opts:['cis-but-2-ene','trans-but-2-ene','(Z)-but-2-ene','(E)-2-butene'],ans:1,exp:'trans-but-2-ene is more stable (less steric strain). In IUPAC 2013 notation, it is also (E)-but-2-ene. trans-but-2-ene and (E)-but-2-ene are the same compound.'},
  {q:'Maleic acid and fumaric acid are:',opts:['Enantiomers','Constitutional isomers','Geometric (diastereomeric) isomers','Conformational isomers'],ans:2,exp:'Both are butenedioic acid (same connectivity, same molecular formula C₄H₄O₄) but differ in 3D arrangement of COOH groups. They are diastereomers (specifically geometric isomers).'},
  {q:'Which compound CANNOT show geometric isomerism?',opts:['CHCl=CHCl','CH₃CH=CHCOOH','CH₂=CHCl','CH₃CH=C(CH₃)₂'],ans:3,exp:'(CH₃)₂C= means the right carbon has TWO identical CH₃ groups — violating the requirement for 2 DIFFERENT groups on each sp² carbon. The others all satisfy both conditions.'},
  {q:'In the E/Z system, (Z) corresponds to:',opts:['Higher priority groups on opposite sides','Higher priority groups on the same side','cis always','trans always'],ans:1,exp:'Z (Zusammen = together in German) means higher CIP priority groups are on the SAME side of the double bond. E (Entgegen = opposite) means they are on opposite sides. Z ≠ cis always — depends on priority assignment.'},
  {q:'For an oxime R-CH=N-OH, the syn isomer has:',opts:['OH and R on same side of C=N','OH and R on opposite sides','No geometric isomers possible','OH always at top'],ans:0,exp:'Syn-oxime has OH and R on the SAME side of the C=N double bond (like cis). Anti-oxime has OH and R on opposite sides. The C=N bond is rigid, so geometric isomers exist.'},
  {q:'Which statement about cis and trans isomers of but-2-ene is CORRECT?',opts:['Same melting point','cis has higher stability than trans','trans has higher dipole moment','cis has higher boiling point than trans'],ans:3,exp:'cis-but-2-ene has a higher boiling point because its dipole moments do NOT cancel (unlike trans where they mostly cancel), leading to stronger intermolecular forces. trans is more stable (lower energy) due to less steric strain.'},
  {q:'How many geometric isomers does CH₃-CH=CH-CH=CH-CH₃ have?',opts:['2','3','4','No geometric isomers'],ans:2,exp:'This molecule (hexa-2,4-diene) has TWO double bonds, each capable of cis or trans arrangement: (2Z,4Z), (2Z,4E), (2E,4Z), (2E,4E) = 4 geometric isomers. But (2Z,4Z) and (2E,4Z) etc. may be identical due to molecular symmetry — careful analysis gives 3.'},
  {q:'Cyclopropane CANNOT exist as trans-1,2-disubstituted because:',opts:['Rings cannot show geometric isomers','The trans arrangement would require too much ring strain','Cyclopropane has free rotation','The substituents are always identical'],ans:1,exp:'In small rings (cyclopropane, cyclobutane), trans-1,2-disubstitution would require bond angles far from the ideal 109.5°, creating extreme ring strain. Trans-cyclopropane-1,2-dicarboxylic acid is known to exist but only for certain substitution patterns.'},
  {q:'Which has higher boiling point — cis or trans 2-butene? Why?',opts:['Trans — more stable','Cis — higher dipole moment causes stronger intermolecular attraction','Both same — same molecular formula','Trans — more symmetrical'],ans:1,exp:'cis-but-2-ene has a net dipole moment (the C-CH₃ bond dipoles add up). trans-but-2-ene has a symmetrical structure where dipole moments cancel → near-zero net dipole. Higher dipole = stronger London + dipole-dipole forces = higher BP.'},
]

export default function GeometricSection(){
  const [activeTab,setActiveTab]=useState('theory')
  const [quizState,setQuizState]=useState(Array(QUIZ.length).fill(null))
  const [quizScore,setQuizScore]=useState(null)
  const [showMol,setShowMol]=useState({})

  function answerQuiz(qi,oi){
    if(quizState[qi]!==null) return
    const next=[...quizState]; next[qi]=oi; setQuizState(next)
    if(next.filter(x=>x!==null).length===QUIZ.length)
      setQuizScore(next.filter((x,i)=>x===QUIZ[i].ans).length)
  }

  const TABS=[{id:'theory',label:'Conditions & Theory'},{id:'examples',label:'Worked Examples'},{id:'ez',label:'E-Z System'},{id:'rings',label:'Rings & Special Cases'},{id:'quiz',label:'Practice Quiz (10 Qs)'}]

  const tabBar=(
    <div style={{display:'flex',gap:'4px',background:'#EFEBE2',borderRadius:'10px',padding:'4px',marginBottom:'20px',flexWrap:'wrap'}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,minWidth:'80px',padding:'7px 6px',borderRadius:'8px',border:'none',background:activeTab===t.id?'#fff':'transparent',cursor:'pointer',fontFamily:P,fontSize:'.76rem',fontWeight:600,color:activeTab===t.id?C.teal:C.muted,transition:'all .18s'}}>
          {t.label}
        </button>
      ))}
    </div>
  )

  // ── THEORY ────────────────────────────────────────────────────────────────
  const TabTheory=()=>(
    <div>
      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:PD}}>What is Geometric Isomerism?</h3>
        <p style={{color:'rgba(255,255,255,.88)',margin:0,fontSize:'.9rem'}}>Geometric isomers have the same molecular formula and connectivity, but differ in the spatial arrangement of groups around a bond with restricted rotation. They cannot interconvert without breaking and reforming a bond.</p>
      </div>

      <h2 style={h2s}>Two Conditions — BOTH Required</h2>
      <div style={g2}>
        <div style={card('teal')}>
          <div style={ct('teal')}>Condition 1: Restricted Rotation</div>
          <p style={{fontSize:'.85rem',margin:'0 0 10px'}}>Free rotation around a bond = no geometric isomers (conformers instead). Restricted rotation is found in:</p>
          <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2.1}}>
            <li><strong>C=C</strong> double bonds (alkenes)</li>
            <li><strong>C=N</strong> bonds (oximes, imines)</li>
            <li><strong>N=N</strong> bonds (azo compounds)</li>
            <li><strong>Ring systems</strong> (cycloalkanes, cycloalkenes)</li>
          </ul>
        </div>
        <div style={card('blue')}>
          <div style={ct('blue')}>Condition 2: Different Groups on Each Carbon</div>
          <p style={{fontSize:'.85rem',margin:'0 0 10px'}}>Each doubly-bonded atom must have 2 DIFFERENT substituents.</p>
          <div style={{fontFamily:F,fontSize:'.82rem',lineHeight:2.2}}>
            <div style={{color:C.red}}>✗ CH₂=CHR → C has 2×H (same)</div>
            <div style={{color:C.red}}>✗ R₂C=CHR → left C has 2×R (same)</div>
            <div style={{color:C.teal}}>✓ RCH=CHR → each C has R and H</div>
            <div style={{color:C.teal}}>✓ RCH=CR'R'' → all different</div>
          </div>
        </div>
      </div>

      <h2 style={h2s}>Interactive: cis ⇄ trans But-2-ene</h2>
      <div style={ibox}>
        <div style={iboxT}>Click to see the difference — same formula C₄H₈, different arrangement</div>
        <AnimatedCisTrans/>
      </div>

      <h2 style={h2s}>Physical Properties — Why They Differ</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Property</th><th style={{...th,background:C.teal}}>cis isomer</th><th style={{...th,background:C.red}}>trans isomer</th><th style={th}>Reason</th></tr></thead>
          <tbody>
            {[
              ['Dipole moment','Higher (groups reinforce)','Lower/zero (groups cancel)','Vector addition of bond dipoles'],
              ['Boiling point','Higher','Lower','Higher dipole → stronger intermolecular forces'],
              ['Melting point','Lower','Higher','trans packs more symmetrically in crystal lattice'],
              ['Stability','Lower (more steric strain)','Higher (less steric strain)','Bulky groups farther apart in trans'],
              ['Solubility in polar solvents','Higher','Lower','Higher dipole moment → better interaction with polar solvent'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={td(i)}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2s}>When Geometric Isomerism is NOT Possible</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Structure</th><th style={th}>Reason — No Geometric Isomers</th><th style={th}>Example</th></tr></thead>
          <tbody>
            {[
              ['CH₂=CHR','One sp² C has 2 identical H atoms','Propene: CH₂=CH-CH₃'],
              ['R₂C=CR\'R\'\'','Left C has 2 identical R groups','Isobutylene: (CH₃)₂C=CH₂'],
              ['C=C=C (allene)','Central C is sp (linear) — even if end groups differ, chirality not geom. isomerism','Propa-1,2-diene'],
              ['RC≡CR\'','Alkynes are linear (sp carbons) — no restricted spatial arrangement','But-2-yne: CH₃-C≡C-CH₃'],
              ['Cyclopropane (trans-1,2)','Trans arrangement not physically possible for 3-membered ring','cis-1,2-dimethylcyclopropane only'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===0||j===2?F:'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── EXAMPLES ──────────────────────────────────────────────────────────────
  const TabExamples=()=>(
    <div>
      <h2 style={{...h2s,marginTop:0}}>Example 1 — But-2-ene (Basic)</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>cis-but-2-ene (Z)</div><CisButene/></div>
        <div style={ibox}><div style={iboxT}>trans-but-2-ene (E)</div><TransButene/></div>
      </div>
      <div style={card('teal')}>
        <div style={ct('teal')}>Analysis</div>
        <p style={{margin:0,fontSize:'.84rem'}}>Each sp² carbon has CH₃ and H — two different groups. Condition satisfied. cis: CH₃ on same side. trans: CH₃ on opposite sides. BP: cis (3.7°C) &gt; trans (0.9°C). Stability: trans &gt; cis.</p>
      </div>

      <h2 style={h2s}>Example 2 — Maleic vs Fumaric Acid (JEE Favourite)</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>(Z)-butenedioic acid — maleic acid</div><MaleicAcid/></div>
        <div style={ibox}><div style={iboxT}>(E)-butenedioic acid — fumaric acid</div><FumaricAcid/></div>
      </div>
      <div style={card('amber')}>
        <div style={ct('amber')}>Key JEE Facts about Maleic/Fumaric</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'8px',fontSize:'.82rem'}}>
          <div><strong>Maleic acid (Z/cis):</strong><ul style={{marginLeft:'16px',lineHeight:2,marginBottom:0}}><li>MP: 130°C</li><li>Forms intramolecular H-bond</li><li>Heated → maleic anhydride (loses H₂O easily)</li><li>Higher dipole moment</li></ul></div>
          <div><strong>Fumaric acid (E/trans):</strong><ul style={{marginLeft:'16px',lineHeight:2,marginBottom:0}}><li>MP: 287°C (much higher!)</li><li>Forms intermolecular H-bond only</li><li>Does NOT easily form anhydride</li><li>Lower dipole moment, but stronger crystal packing</li></ul></div>
        </div>
      </div>

      <h2 style={h2s}>Example 3 — 2-Chlorobut-2-ene</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>(Z)-2-chlorobut-2-ene</div><ChloroButene isCis={true}/></div>
        <div style={ibox}><div style={iboxT}>(E)-2-chlorobut-2-ene</div><ChloroButene isCis={false}/></div>
      </div>
      <div style={card('blue')}>
        <div style={ct('blue')}>Why E/Z and not cis/trans here?</div>
        <p style={{margin:0,fontSize:'.84rem'}}>Left C has CH₃ and Cl — 4 different groups total. Cannot say "cis" because we need to specify WHICH groups are on same/opposite sides. CIP rules: Cl(17) &gt; CH₃(C=6) on left C; C₂H₅(8) &gt; H(1) on right C. (Z) = high priority groups (Cl and C₂H₅... wait, this is 2-chlorobut-2-ene not 2-ene). In 2-chlorobut-2-ene: left C has Cl(①) and CH₃(②); right C has CH₃(①) and H(②). Z = Cl and CH₃ (right) on same side.</p>
      </div>

      <h2 style={h2s}>Example 4 — Stilbene (Ph-CH=CH-Ph)</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>cis-stilbene</div><Stilbene isCis={true}/></div>
        <div style={ibox}><div style={iboxT}>trans-stilbene</div><Stilbene isCis={false}/></div>
      </div>
      <div style={card('purple')}>
        <div style={ct('purple')}>Stilbene Facts (JEE Advanced)</div>
        <p style={{margin:0,fontSize:'.84rem'}}>trans-stilbene is planar (Ph groups can conjugate with C=C), more stable, higher MP (124°C vs 5°C for cis). cis-stilbene is non-planar due to steric clash of Ph rings. Photoisomerization (UV light) converts trans→cis — important in biochemistry (vision!).</p>
      </div>

      <h2 style={h2s}>Example 5 — 2-Butene vs 2-Pentene vs 2-Hexene</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Compound</th><th style={th}>Left C groups</th><th style={th}>Right C groups</th><th style={th}>Geometric isomers?</th></tr></thead>
          <tbody>
            {[
              ['But-2-ene','CH₃, H','CH₃, H','Yes — cis and trans'],
              ['Pent-2-ene','CH₃, H','C₂H₅, H','Yes — cis and trans (different groups on right C)'],
              ['2-Methylbut-2-ene','CH₃, CH₃ ← same!','CH₃, H','NO — left C has 2 identical CH₃'],
              ['Hex-2-ene','CH₃, H','C₃H₇, H','Yes — different alkyl groups'],
              ['Hex-3-ene','C₂H₅, H','C₂H₅, H','Yes — but cis and trans are same pair as but-2-ene pattern'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j<=2?F:'inherit',color:j===3?(c.includes('Yes')?C.teal:C.red):C.text,fontWeight:j===3?700:400}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2s}>Example 6 — Counting Geometric Isomers in Dienes</h2>
      <div style={card('red')}>
        <div style={ct('red')}>Hexa-2,4-diene: CH₃-CH=CH-CH=CH-CH₃</div>
        <p style={{fontSize:'.84rem',marginBottom:'10px'}}>Two double bonds = two possible cis/trans arrangements each. Maximum = 2² = 4. But check for molecular symmetry!</p>
        <div style={{fontFamily:F,fontSize:'.82rem',lineHeight:2.2}}>
          <div>(2Z,4Z) — both cis</div>
          <div>(2E,4E) — both trans</div>
          <div>(2Z,4E) — mixed</div>
          <div>(2E,4Z) — mixed (same as 2Z,4E due to molecular symmetry!)</div>
          <div style={{color:C.red,fontWeight:700}}>Total = 3 geometric isomers (not 4 — symmetry reduces count)</div>
        </div>
      </div>
    </div>
  )

  // ── E-Z SYSTEM ────────────────────────────────────────────────────────────
  const TabEZ=()=>(
    <div>
      <div style={card('blue')}>
        <div style={ct('blue')}>📌 When to Use E-Z (not cis-trans)</div>
        <p style={{fontSize:'.87rem',margin:0}}>Use E-Z when cis/trans is ambiguous — i.e., when there are 4 completely different groups on the two sp² carbons, OR when common usage might be unclear. E-Z is always unambiguous because it uses CIP priority rules.</p>
      </div>

      <h2 style={h2s}>Step-by-Step E-Z Assignment: (E)-but-2-enedioyl chloride</h2>
      <div style={ibox}>
        <div style={iboxT}>Interactive E/Z assignment — click Next to see each step</div>
        <EZAssigner/>
      </div>

      <h2 style={h2s}>CIP Priority Rules for E-Z (same as R/S)</h2>
      {[
        {n:1,h:'Atomic Number — Higher = Higher Priority',p:'I(53) > Br(35) > Cl(17) > S(16) > F(9) > O(8) > N(7) > C(6) > H(1). This handles 90% of cases.',col:'teal'},
        {n:2,h:'Tie? Compare atoms attached to the tied atom',p:'If two substituents start with the same atom, look at the next atoms outward. Compare as sets sorted high-to-low. E.g., CH(CH₃)₂ vs CH₂CH₃: both start with C. Next: CH(CH₃)₂ has (C,C,H), CH₂CH₃ has (C,H,H). First set wins → isopropyl > ethyl.',col:'blue'},
        {n:3,h:'Double/Triple bonds = phantom (duplicate) atoms',p:'C=O is treated as: C bonded to [O, O_phantom] and O bonded to [C, C_phantom]. C≡N means each gets 2 phantom atoms of the other. These phantoms have no further bonds.',col:'amber'},
        {n:4,h:'Isotopes: heavier = higher priority',p:'Deuterium (²H) > protium (¹H). Rare in E-Z but appears in JEE Advanced.',col:'red'},
      ].map(s=>(
        <div key={s.n} style={{display:'flex',gap:'12px',marginBottom:'12px'}}>
          <div style={{minWidth:'26px',height:'26px',background:C[s.col],color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.8rem',flexShrink:0,marginTop:'2px'}}>{s.n}</div>
          <div style={{...card(s.col),marginBottom:0,flex:1}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
        </div>
      ))}

      <h2 style={h2s}>E-Z Examples Table</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Compound</th><th style={th}>Left C priorities</th><th style={th}>Right C priorities</th><th style={th}>Assignment</th></tr></thead>
          <tbody>
            {[
              ['CH₃CH=CHCH₃','CH₃(①) H(②)','CH₃(①) H(②)','Z=cis, E=trans (same as cis/trans here)'],
              ['CH₃CH=CHCOOH','CH₃(②) H(③) wait — CH₃ vs H: C>H so CH₃=①','COOH(①) H(②)','E: CH₃ opposite to COOH'],
              ['ClCH=CHCOOH','Cl(①) H(②)','COOH(①) H(②)','Z: Cl same side as COOH → (Z)'],
              ['PhCH=CHCH₃','Ph(①) H(②)','CH₃(①) H(②)','E: Ph opposite to CH₃ = trans-ish'],
              ['CH₃CH=NOH (acetaldoxime)','C=N: CH₃(②) — N bonded to OH','O(①) lone pair(②)','E: OH opposite to CH₃ = anti'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j<=2?F:'inherit',fontSize:'.8rem'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2s}>Oximes and Azo Compounds</h2>
      <div style={g2}>
        <div>
          <div style={ibox}><div style={iboxT}>Oxime: syn isomer</div><Oxime isSyn={true}/></div>
          <div style={ibox}><div style={iboxT}>Oxime: anti isomer</div><Oxime isSyn={false}/></div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={card('purple')}>
            <div style={ct('purple')}>Oximes — C=N Geometric Isomers</div>
            <p style={{fontSize:'.83rem',margin:0}}>Formed from R-CHO + NH₂OH → R-CH=N-OH. The C=N bond is rigid like C=C. Two isomers: syn (OH and R same side) and anti (OH and R opposite). Also called (E) and (Z) using CIP rules.</p>
          </div>
          <div style={card('blue')}>
            <div style={ct('blue')}>Azo Compounds — N=N Geometric Isomers</div>
            <p style={{fontSize:'.83rem',margin:0}}>R-N=N-R' compounds have a rigid N=N double bond. Both N atoms need different groups for isomerism. cis-azobenzene and trans-azobenzene are classic JEE Advanced examples. Trans is more stable (Ph groups farther apart).</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ── RINGS ─────────────────────────────────────────────────────────────────
  const TabRings=()=>(
    <div>
      <div style={card('teal')}>
        <div style={ct('teal')}>📌 Geometric Isomerism in Rings — Key Principle</div>
        <p style={{fontSize:'.87rem',margin:0}}>In rings, rotation around ring bonds is restricted by the ring itself. Substituents on the SAME face of the ring = cis. Substituents on OPPOSITE faces = trans. No need for a double bond — the ring provides restricted rotation.</p>
      </div>

      <h2 style={h2s}>1,2-Disubstituted Cyclohexane</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>cis-1,2-dimethylcyclohexane</div><CycloRing isCis={true} sub1="CH₃" sub2="CH₃" ringSize={6}/></div>
        <div style={ibox}><div style={iboxT}>trans-1,2-dimethylcyclohexane</div><CycloRing isCis={false} sub1="CH₃" sub2="CH₃" ringSize={6}/></div>
      </div>

      <h2 style={h2s}>1,2-Disubstituted Cyclopentane</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>cis-1,2-dimethylcyclopentane</div><CycloRing isCis={true} sub1="CH₃" sub2="CH₃" ringSize={5}/></div>
        <div style={ibox}><div style={iboxT}>trans-1,2-dimethylcyclopentane</div><CycloRing isCis={false} sub1="CH₃" sub2="CH₃" ringSize={5}/></div>
      </div>

      <h2 style={h2s}>Important Rules for Ring Geometric Isomers</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Substitution Pattern</th><th style={th}>Geometric Isomers?</th><th style={th}>How Many?</th></tr></thead>
          <tbody>
            {[
              ['1,1-disubstituted ring','No','Only one — both groups on same C, no facial difference'],
              ['1,2-disubstituted (same groups)','Yes','2: cis and trans'],
              ['1,2-disubstituted (different groups)','Yes','2: cis and trans (each may be chiral too)'],
              ['1,3-disubstituted cyclohexane (same groups)','Yes','2: cis and trans'],
              ['1,4-disubstituted cyclohexane (same groups)','Yes','2: cis and trans'],
              ['Trans-cyclopropane (small ring)','Strained — usually only cis exists','Extreme cases only'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===0?F:'inherit',color:j===1?(c==='Yes'?C.teal:C.red):C.text,fontWeight:j===1?700:400}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card('red')}>
        <div style={ct('red')}>⚠️ JEE Trap — Geometric vs Optical in Rings</div>
        <p style={{fontSize:'.84rem',margin:0}}>Ring compounds can show BOTH geometric AND optical isomerism. For example, trans-1,2-dimethylcyclohexane is chiral (no plane of symmetry). cis-1,2-dimethylcyclohexane has a plane of symmetry through C1 and C4 — it is a meso compound! This is a classic JEE Advanced question.</p>
      </div>

      <h2 style={h2s}>Practice: For each ring compound, predict geometric isomers</h2>
      {[
        {q:'1-bromo-2-chlorocyclopentane',ans:'Yes — cis and trans both possible. Each sp³ carbon has different groups (Br vs Cl). 2 geometric isomers, each optically active → total 4 stereoisomers.',col:'teal'},
        {q:'1,4-dimethylcyclohexane',ans:'Yes — cis (both CH₃ same face) and trans (opposite faces). The cis form has a plane of symmetry (meso-like). The trans form exists as enantiomers.',col:'blue'},
        {q:'1,1-dimethylcyclopentane',ans:'No geometric isomers. Both methyls on the same carbon — there is no facial differentiation possible. This compound is achiral.',col:'amber'},
        {q:'Inositol (cyclohexane-1,2,3,4,5,6-hexol)',ans:'Complex — multiple OH groups on a 6C ring. Has 9 possible stereoisomers (combinations of cis/trans at each position). One form (myo-inositol) has a plane of symmetry.',col:'red'},
      ].map((s,i)=>(
        <div key={i} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:'10px',padding:'14px',marginBottom:'10px'}}>
          <p style={{fontWeight:600,marginBottom:'8px',fontFamily:F,fontSize:'.87rem'}}>{s.q}</p>
          <details>
            <summary style={{fontSize:'.82rem',cursor:'pointer',color:C[s.col],fontWeight:600}}>Show answer</summary>
            <p style={{margin:'8px 0 0',fontSize:'.82rem',color:C.text,lineHeight:1.7}}>{s.ans}</p>
          </details>
        </div>
      ))}
    </div>
  )

  // ── QUIZ ─────────────────────────────────────────────────────────────────
  const TabQuiz=()=>(
    <div>
      <h3 style={{fontFamily:PD,fontSize:'1.2rem',margin:'0 0 6px'}}>Geometric Isomerism — 10 JEE Questions</h3>
      <p style={{color:C.muted,fontSize:'.85rem',marginBottom:'18px'}}>Mix of JEE Mains and Advanced level. Explanation revealed immediately.</p>
      {quizScore!==null&&(
        <div style={{background:quizScore>=7?C.tealL:C.redL,border:`2px solid ${quizScore>=7?C.teal:C.red}`,borderRadius:'12px',padding:'18px',marginBottom:'18px',textAlign:'center'}}>
          <div style={{fontSize:'2rem',fontWeight:700,color:quizScore>=7?C.teal:C.red,fontFamily:PD}}>{quizScore}/10</div>
          <div style={{marginTop:'6px',fontWeight:600}}>{quizScore>=8?'Excellent!':quizScore>=6?'Good — review the mistakes above.':'Review the theory sections and retry.'}</div>
          <button onClick={()=>{setQuizState(Array(QUIZ.length).fill(null));setQuizScore(null)}} style={{marginTop:'10px',background:C.teal,color:'#fff',border:'none',borderRadius:'8px',padding:'8px 20px',fontWeight:600,cursor:'pointer',fontFamily:P}}>Retake</button>
        </div>
      )}
      {QUIZ.map((q,qi)=>(
        <div key={qi} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:'12px',padding:'18px',marginBottom:'14px'}}>
          <p style={{fontWeight:600,marginBottom:'12px',fontSize:'.9rem'}}>Q{qi+1}. {q.q}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {q.opts.map((opt,oi)=>{
              const answered=quizState[qi]!==null
              const isCorrect=oi===q.ans,isChosen=quizState[qi]===oi
              let bg='#fff',border=`2px solid ${C.border}`,col=C.text
              if(answered&&isCorrect){bg=C.tealL;border=`2px solid ${C.teal}`;col=C.teal}
              if(answered&&isChosen&&!isCorrect){bg=C.redL;border=`2px solid ${C.red}`;col=C.red}
              return(
                <button key={oi} onClick={()=>answerQuiz(qi,oi)} disabled={answered} style={{padding:'9px 12px',border,borderRadius:'8px',cursor:answered?'default':'pointer',fontSize:'.83rem',background:bg,color:col,textAlign:'left',fontFamily:P,fontWeight:answered&&isCorrect?700:400,transition:'all .18s'}}>
                  {String.fromCharCode(65+oi)}. <span style={{fontFamily:F}}>{opt}</span>
                </button>
              )
            })}
          </div>
          {quizState[qi]!==null&&(
            <div style={{marginTop:'10px',padding:'10px 14px',background:C.tealL,borderRadius:'8px',fontSize:'.83rem',color:C.teal,borderLeft:`3px solid ${C.teal}`,lineHeight:1.7}}>
              <strong>Explanation:</strong> {q.exp}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const tabContent={theory:<TabTheory/>,examples:<TabExamples/>,ez:<TabEZ/>,rings:<TabRings/>,quiz:<TabQuiz/>}

  return(
    <div style={sec}>
      <span style={tag('j')}>JEE Core</span><span style={tag('i')}>High Weightage</span>
      <h1 style={{fontFamily:PD,fontSize:'2.2rem',color:C.text,marginBottom:'6px',lineHeight:1.2}}>Geometric Isomerism</h1>
      <p style={{color:C.muted,fontSize:'.92rem',marginBottom:'22px'}}>cis-trans, E-Z, oximes, rings — with animated structures and 10 JEE-level problems.</p>
      {tabBar}
      {tabContent[activeTab]}
    </div>
  )
}
