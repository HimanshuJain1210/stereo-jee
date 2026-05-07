'use client'
import { useState } from 'react'

const C = {
  teal:'#007A6E', amber:'#C97A0A', red:'#B83030', blue:'#1A56B0',
  purple:'#6B35A0', text:'#1A1E2E', muted:'#6B7A99', border:'#DED8CC',
  tealL:'#E6F4F2', amberL:'#FEF3E0', redL:'#FCECEA', blueL:'#E8F0FC', purpleL:'#F0E9FB',
  green:'#1A7A3C', greenL:'#E6F4EC',
}
const F = "'Fira Code',monospace"
const P = "'Plus Jakarta Sans',sans-serif"
const PD = "'Playfair Display',serif"

const sec    = {padding:'40px 48px',maxWidth:'980px',fontFamily:P}
const h2s    = {fontFamily:PD,fontSize:'1.4rem',margin:'28px 0 12px',color:C.text}
const card   = (col) => ({background:col?C[col+'L']:'#fff',border:`1px solid ${C.border}`,borderLeft:col?`4px solid ${C[col]}`:`1px solid ${C.border}`,borderRadius:'12px',padding:'20px',marginBottom:'16px'})
const ct     = (col) => ({fontWeight:700,fontSize:'.72rem',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px',color:C[col]||C.text})
const tag    = (col) => ({display:'inline-block',padding:'2px 10px',borderRadius:'20px',fontSize:'.68rem',fontWeight:700,marginRight:'5px',marginBottom:'10px',background:C[col+'L'],color:C[col]})
const ibox   = {background:'#fff',border:`2px solid ${C.border}`,borderRadius:'12px',padding:'20px',margin:'16px 0'}
const iboxT  = {fontSize:'.7rem',color:C.muted,fontFamily:F,letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',textAlign:'center'}
const g2     = {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}
const hl     = {background:'linear-gradient(135deg,#007A6E,#00967D)',color:'#fff',borderRadius:'12px',padding:'18px 22px',margin:'18px 0'}
const stepRow= {display:'flex',gap:'12px',marginBottom:'14px'}
const stepN  = (col='teal')=>({minWidth:'26px',height:'26px',background:C[col],color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.78rem',flexShrink:0,marginTop:'2px'})
const tbl    = {width:'100%',borderCollapse:'collapse',margin:'12px 0',fontSize:'.82rem'}
const th     = {background:C.text,color:'#fff',padding:'9px 13px',textAlign:'left',fontSize:'.77rem'}
const td     = (i)=>({padding:'9px 13px',borderBottom:`1px solid ${C.border}`,background:i%2===0?'#EFEBE2':'#fff'})

// ─── SVG PRIMITIVES ──────────────────────────────────────────────────────────
// Solid wedge bond: thick triangle pointing from (x1,y1) toward (x2,y2)
const WedgeSolid = ({x1,y1,x2,y2,color='#1A1E2E'}) => {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ux=dx/len, uy=dy/len, ox=-uy*5, oy=ux*5
  return <polygon points={`${x1},${y1} ${x2+ox},${y2+oy} ${x2-ox},${y2-oy}`} fill={color}/>
}
// Dashed wedge: dashed lines from narrow to wide
const WedgeDash = ({x1,y1,x2,y2,color='#1A1E2E'}) => {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ux=dx/len, uy=dy/len, ox=-uy, oy=ux
  const n=6
  return <g>{Array.from({length:n},(_,i)=>{
    const t=(i+1)/(n+1), w=t*5
    const mx=x1+dx*t, my=y1+dy*t
    return <line key={i} x1={mx+ox*w} y1={my+oy*w} x2={mx-ox*w} y2={my-oy*w} stroke={color} strokeWidth="1.5"/>
  })}</g>
}
// Plain bond
const Bond = ({x1,y1,x2,y2,order=1,color='#1A1E2E'}) => {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ox=(-dy/len)*3.5, oy=(dx/len)*3.5
  if(order===1) return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2"/>
  if(order===2) return <g><line x1={x1+ox} y1={y1+oy} x2={x2+ox} y2={y2+oy} stroke={color} strokeWidth="2"/><line x1={x1-ox} y1={y1-oy} x2={x2-ox} y2={y2-oy} stroke={color} strokeWidth="2"/></g>
  return null
}
// Atom label with white background
const A = ({x,y,t,col=C.text,sz=12,anchor='middle'}) => {
  const w=t.length*sz*0.63+6
  return <g>
    <rect x={x-(anchor==='middle'?w/2:anchor==='start'?0:-w)} y={y-sz*0.78} width={w} height={sz*1.55} fill="white"/>
    <text x={x} y={y+sz*0.38} textAnchor={anchor} fontSize={sz} fill={col} fontWeight="700" fontFamily={F}>{t}</text>
  </g>
}
// Small carbon vertex dot
const Dot = ({x,y}) => <circle cx={x} cy={y} r="2.8" fill={C.text}/>
// Mirror line
const MirrorLine = ({x,h=200}) => (
  <g>
    <line x1={x} y1={10} x2={x} y2={h} stroke={C.amber} strokeWidth="2" strokeDasharray="8,4"/>
    <text x={x} y={6} textAnchor="middle" fontSize="9" fill={C.amber} fontFamily={F} fontWeight="700">mirror</text>
  </g>
)

// ─── MOLECULE: Lactic acid (S) — wedge-dash ───────────────────────────────
// Central C* with 4 bonds:
//   OH  → solid wedge UP
//   H   → dashed wedge DOWN
//   COOH → plain bond LEFT
//   CH3  → plain bond RIGHT
const LacticAcid = ({config='S',label=true}) => {
  const cx=110, cy=100
  // For R config, swap OH and H
  const ohLeft = config==='S'
  return (
    <svg viewBox="0 0 220 200" style={{width:'100%',maxHeight:'180px'}}>
      {/* COOH left */}
      <Bond x1={cx} y1={cy} x2={cx-55} y2={cy}/>
      <A x={cx-70} y={cy} t="COOH" col={C.red}/>
      {/* CH3 right */}
      <Bond x1={cx} y1={cy} x2={cx+55} y2={cy}/>
      <A x={cx+72} y={cy} t="CH₃" col={C.teal}/>
      {/* OH — solid wedge going up (toward viewer) */}
      <WedgeSolid x1={cx} y1={cy} x2={cx+(ohLeft?-30:30)} y2={cy-52} color={C.red}/>
      <A x={cx+(ohLeft?-30:30)} y={cy-60} t="OH" col={C.red}/>
      <text x={cx+(ohLeft?-30:30)} y={cy-72} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F}>toward you</text>
      {/* H — dashed wedge going down (away from viewer) */}
      <WedgeDash x1={cx} y1={cy} x2={cx+(ohLeft?30:-30)} y2={cy+52} color={C.muted}/>
      <A x={cx+(ohLeft?30:-30)} y={cy+66} t="H" col={C.muted}/>
      <text x={cx+(ohLeft?30:-30)} y={cy+78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>away from you</text>
      {/* Chiral center dot */}
      <circle cx={cx} cy={cy} r="5" fill={C.purple}/>
      <text x={cx+8} y={cy-8} fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">C*</text>
      {label && <text x={cx} y={185} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">({config})-Lactic acid</text>}
    </svg>
  )
}

// ─── MIRROR IMAGE PAIR: Lactic acid enantiomers ───────────────────────────
const LacticPair = () => (
  <svg viewBox="0 0 440 210" style={{width:'100%',maxHeight:'200px'}}>
    {/* (S) on left */}
    <g>
      <Bond x1={110} y1={100} x2={55} y2={100}/>
      <A x={40} y={100} t="COOH" col={C.red} sz={11}/>
      <Bond x1={110} y1={100} x2={165} y2={100}/>
      <A x={180} y={100} t="CH₃" col={C.teal} sz={11}/>
      <WedgeSolid x1={110} y1={100} x2={80} y2={52} color={C.red}/>
      <A x={75} y={44} t="OH" col={C.red} sz={11}/>
      <WedgeDash x1={110} y1={100} x2={140} y2={152} color={C.muted}/>
      <A x={143} y={162} t="H" col={C.muted} sz={11}/>
      <circle cx={110} cy={100} r="5" fill={C.purple}/>
      <text x={110} y={192} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(S)-Lactic acid</text>
      <text x={110} y={204} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>(+) rotates light right</text>
    </g>
    {/* Mirror line */}
    <MirrorLine x={220} h={195}/>
    {/* (R) on right — OH and H swapped */}
    <g>
      <Bond x1={330} y1={100} x2={275} y2={100}/>
      <A x={260} y={100} t="CH₃" col={C.teal} sz={11}/>
      <Bond x1={330} y1={100} x2={385} y2={100}/>
      <A x={402} y={100} t="COOH" col={C.red} sz={11}/>
      <WedgeSolid x1={330} y1={100} x2={360} y2={52} color={C.red}/>
      <A x={365} y={44} t="OH" col={C.red} sz={11}/>
      <WedgeDash x1={330} y1={100} x2={300} y2={152} color={C.muted}/>
      <A x={297} y={162} t="H" col={C.muted} sz={11}/>
      <circle cx={330} cy={100} r="5" fill={C.purple}/>
      <text x={330} y={192} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(R)-Lactic acid</text>
      <text x={330} y={204} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>(−) rotates light left</text>
    </g>
  </svg>
)

// ─── MESO: 2,3-dibromobutane ──────────────────────────────────────────────
const MesoDibromo = () => (
  <svg viewBox="0 0 440 230" style={{width:'100%',maxHeight:'220px'}}>
    {/* Molecule: CH3-C*(2R,Br up)-C*(3S,Br down)-CH3 */}
    {/* Left half */}
    <Bond x1={40} y1={110} x2={110} y2={110}/>
    <A x={25} y={110} t="CH₃" col={C.teal} sz={10}/>
    {/* C2 */}
    <circle cx={110} cy={110} r="5" fill={C.blue}/>
    <text x={110} y={128} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>C2(R)</text>
    <WedgeSolid x1={110} y1={110} x2={110} y2={55} color={C.red}/>
    <A x={110} y={46} t="Br" col={C.red} sz={11}/>
    <text x={128} y={80} fontSize="7" fill={C.teal} fontFamily={F}>toward</text>
    <WedgeDash x1={110} y1={110} x2={70} y2={155} color={C.muted}/>
    <A x={62} y={165} t="H" col={C.muted} sz={10}/>
    {/* C2-C3 bond */}
    <Bond x1={110} y1={110} x2={215} y2={110}/>
    {/* C3 */}
    <circle cx={215} cy={110} r="5" fill={C.blue}/>
    <text x={215} y={128} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>C3(S)</text>
    <WedgeDash x1={215} y1={110} x2={215} y2={55} color={C.red}/>
    <A x={215} y={46} t="Br" col={C.red} sz={11}/>
    <text x={235} y={80} fontSize="7" fill={C.muted} fontFamily={F}>away</text>
    <WedgeSolid x1={215} y1={110} x2={255} y2={155} color={C.muted}/>
    <A x={263} y={165} t="H" col={C.muted} sz={10}/>
    {/* Right CH3 */}
    <Bond x1={215} y1={110} x2={280} y2={110}/>
    <A x={295} y={110} t="CH₃" col={C.teal} sz={10}/>
    {/* POS line */}
    <line x1={162} y1={22} x2={162} y2={195} stroke={C.amber} strokeWidth="2.5" strokeDasharray="8,4"/>
    <rect x={118} y={18} width="88" height="18" rx="5" fill={C.amberL} stroke={C.amber} strokeWidth="1.5"/>
    <text x={162} y={31} textAnchor="middle" fontSize="8" fill={C.amber} fontFamily={F} fontWeight="700">Plane of Symmetry</text>
    {/* Left half label */}
    <rect x={20} y={175} width="120" height="36" rx="6" fill={C.blueL} stroke={C.blue} strokeWidth="1.2"/>
    <text x={80} y={190} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F} fontWeight="700">Left half: 2R</text>
    <text x={80} y={204} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>rotates light (+)</text>
    {/* Right half label */}
    <rect x={185} y={175} width="120" height="36" rx="6" fill={C.redL} stroke={C.red} strokeWidth="1.2"/>
    <text x={245} y={190} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F} fontWeight="700">Right half: 3S</text>
    <text x={245} y={204} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F}>rotates light (−)</text>
    {/* MESO label */}
    <rect x={318} y={85} width="112" height="55" rx="8" fill={C.tealL} stroke={C.teal} strokeWidth="2"/>
    <text x={374} y={108} textAnchor="middle" fontSize="13" fill={C.teal} fontFamily={PD} fontWeight="700">MESO</text>
    <text x={374} y={123} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F}>Net rotation = 0</text>
    <text x={374} y={135} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F}>Optically INACTIVE</text>
    <text x={162} y={218} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>(2R,3S)-2,3-dibromobutane — meso compound</text>
  </svg>
)

// ─── R/S: CHFClBr with arrow ──────────────────────────────────────────────
const RSExample = ({revealed}) => (
  <svg viewBox="0 0 300 220" style={{width:'100%',maxHeight:'210px'}}>
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill={C.amber}/>
      </marker>
    </defs>
    {/* Central chiral carbon */}
    <circle cx={150} cy={110} r="16" fill={C.text}/>
    <text x={150} y={115} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily={F}>C*</text>
    {/* Br — dashed (going away, into page) */}
    <WedgeDash x1={150} y1={110} x2={68} y2={110} color="#8B4513"/>
    <A x={50} y={110} t="Br" col="#8B4513" sz={13}/>
    <text x={50} y={126} textAnchor="middle" fontSize="9" fill="#8B4513" fontFamily={F} fontWeight="700">①</text>
    <text x={50} y={138} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>away</text>
    {/* Cl — plain bond right */}
    <Bond x1={150} y1={110} x2={232} y2={110}/>
    <A x={248} y={110} t="Cl" col={C.green} sz={13}/>
    <text x={248} y={126} textAnchor="middle" fontSize="9" fill={C.green} fontFamily={F} fontWeight="700">②</text>
    {/* F — solid wedge up (toward viewer) */}
    <WedgeSolid x1={150} y1={110} x2={150} y2={45} color={C.blue}/>
    <A x={150} y={36} t="F" col={C.blue} sz={13}/>
    <text x={150} y={52} textAnchor="middle" fontSize="9" fill={C.blue} fontFamily={F} fontWeight="700">③</text>
    {/* H — dashed wedge down */}
    <WedgeDash x1={150} y1={110} x2={150} y2={175} color={C.muted}/>
    <A x={150} y={185} t="H" col={C.muted} sz={13}/>
    <text x={150} y={200} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>④ pointing away ✓</text>
    {/* Priority order: Br>Cl>F>H */}
    <text x={150} y={14} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>Br(35) &gt; Cl(17) &gt; F(9) &gt; H(1)</text>
    {/* Curved arrow 1→2→3 clockwise */}
    {revealed && <path d="M 72,104 Q 150,50 226,104" stroke={C.amber} strokeWidth="2.2" fill="none" markerEnd="url(#arr)"/>}
    {revealed && <text x={150} y={210} textAnchor="middle" fontSize="10" fill={C.amber} fontFamily={F} fontWeight="700">Clockwise → R configuration</text>}
  </svg>
)

// ─── CIS-TRANS: 2-butene ─────────────────────────────────────────────────
const CisTransPair = () => (
  <svg viewBox="0 0 440 170" style={{width:'100%',maxHeight:'160px'}}>
    {/* CIS: CH3 groups same side (both up) */}
    <g>
      {/* C=C double bond */}
      <Bond x1={80} y1={85} x2={140} y2={85} order={2}/>
      {/* CH3 up-left from C2 */}
      <Bond x1={80} y1={85} x2={45} y2={48}/>
      <A x={35} y={40} t="CH₃" col={C.teal} sz={10}/>
      {/* H down-left from C2 */}
      <Bond x1={80} y1={85} x2={45} y2={122}/>
      <A x={35} y={130} t="H" col={C.muted} sz={10}/>
      {/* CH3 up-right from C3 */}
      <Bond x1={140} y1={85} x2={175} y2={48}/>
      <A x={185} y={40} t="CH₃" col={C.teal} sz={10}/>
      {/* H down-right from C3 */}
      <Bond x1={140} y1={85} x2={175} y2={122}/>
      <A x={185} y={130} t="H" col={C.muted} sz={10}/>
      <Dot x={80} y={85}/><Dot x={140} y={85}/>
      {/* Dashed arc showing same side */}
      <path d="M 45,48 Q 110,18 175,48" stroke={C.teal} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
      <text x={110} y={14} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F} fontWeight="700">same side</text>
      <rect x={55} y={145} width="110" height="20" rx="5" fill={C.tealL}/>
      <text x={110} y={158} textAnchor="middle" fontSize="9" fill={C.teal} fontFamily={F} fontWeight="700">cis-but-2-ene (Z)</text>
    </g>
    {/* Divider */}
    <line x1={220} y1={20} x2={220} y2={165} stroke={C.border} strokeWidth="1.5"/>
    {/* TRANS: CH3 groups opposite sides */}
    <g>
      {/* C=C double bond */}
      <Bond x1={260} y1={85} x2={320} y2={85} order={2}/>
      {/* CH3 up-left */}
      <Bond x1={260} y1={85} x2={225} y2={48}/>
      <A x={215} y={40} t="CH₃" col={C.red} sz={10}/>
      {/* H down-left */}
      <Bond x1={260} y1={85} x2={225} y2={122}/>
      <A x={215} y={130} t="H" col={C.muted} sz={10}/>
      {/* H up-right */}
      <Bond x1={320} y1={85} x2={355} y2={48}/>
      <A x={365} y={40} t="H" col={C.muted} sz={10}/>
      {/* CH3 down-right */}
      <Bond x1={320} y1={85} x2={355} y2={122}/>
      <A x={368} y={130} t="CH₃" col={C.red} sz={10}/>
      <Dot x={260} y={85}/><Dot x={320} y={85}/>
      {/* Arrow showing opposite sides */}
      <path d="M 225,50 Q 290,88 360,130" stroke={C.red} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
      <text x={295} y={14} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F} fontWeight="700">opposite sides</text>
      <rect x={238} y={145} width="120" height="20" rx="5" fill={C.redL}/>
      <text x={298} y={158} textAnchor="middle" fontSize="9" fill={C.red} fontFamily={F} fontWeight="700">trans-but-2-ene (E)</text>
    </g>
  </svg>
)

// ─── EZ: (E)-but-2-enedioic acid (fumaric acid) ─────────────────────────
const EZFumaric = () => (
  <svg viewBox="0 0 440 180" style={{width:'100%',maxHeight:'170px'}}>
    {/* (Z) maleic acid — COOH same side */}
    <g>
      <Bond x1={80} y1={90} x2={140} y2={90} order={2}/>
      <Bond x1={80} y1={90} x2={45} y2={52}/>
      <A x={28} y={44} t="COOH" col={C.red} sz={9}/>
      <text x={22} y={56} textAnchor="middle" fontSize="7" fill={C.red} fontFamily={F}>priority ①</text>
      <Bond x1={80} y1={90} x2={45} y2={128}/>
      <A x={28} y={136} t="H" col={C.muted} sz={9}/>
      <text x={22} y={147} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>priority ②</text>
      <Bond x1={140} y1={90} x2={175} y2={52}/>
      <A x={193} y={44} t="COOH" col={C.red} sz={9}/>
      <text x={196} y={56} textAnchor="middle" fontSize="7" fill={C.red} fontFamily={F}>priority ①</text>
      <Bond x1={140} y1={90} x2={175} y2={128}/>
      <A x={193} y={136} t="H" col={C.muted} sz={9}/>
      <Dot x={80} y={90}/><Dot x={140} y={90}/>
      <path d="M 42,46 Q 110,18 178,46" stroke={C.red} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
      <text x={110} y={14} textAnchor="middle" fontSize="7" fill={C.red} fontFamily={F}>high priority same side</text>
      <rect x={40} y={152} width="140" height="22" rx="5" fill={C.redL}/>
      <text x={110} y={165} textAnchor="middle" fontSize="9" fill={C.red} fontFamily={F} fontWeight="700">(Z)-butenedioic acid</text>
      <text x={110} y={176} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>(maleic acid)</text>
    </g>
    <line x1={220} y1={15} x2={220} y2={170} stroke={C.border} strokeWidth="1.5"/>
    {/* (E) fumaric acid — COOH opposite sides */}
    <g>
      <Bond x1={260} y1={90} x2={320} y2={90} order={2}/>
      <Bond x1={260} y1={90} x2={225} y2={52}/>
      <A x={208} y={44} t="COOH" col={C.red} sz={9}/>
      <text x={205} y={56} textAnchor="middle" fontSize="7" fill={C.red} fontFamily={F}>priority ①</text>
      <Bond x1={260} y1={90} x2={225} y2={128}/>
      <A x={208} y={136} t="H" col={C.muted} sz={9}/>
      <Bond x1={320} y1={90} x2={355} y2={52}/>
      <A x={372} y={44} t="H" col={C.muted} sz={9}/>
      <Bond x1={320} y1={90} x2={355} y2={128}/>
      <A x={372} y={136} t="COOH" col={C.red} sz={9}/>
      <text x={376} y={147} textAnchor="middle" fontSize="7" fill={C.red} fontFamily={F}>priority ①</text>
      <Dot x={260} y={90}/><Dot x={320} y={90}/>
      <path d="M 225,46 Q 290,90 358,134" stroke={C.teal} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>
      <text x={295} y={14} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F}>high priority opposite</text>
      <rect x={238} y={152} width="140" height="22" rx="5" fill={C.tealL}/>
      <text x={308} y={165} textAnchor="middle" fontSize="9" fill={C.teal} fontFamily={F} fontWeight="700">(E)-butenedioic acid</text>
      <text x={308} y={176} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>(fumaric acid)</text>
    </g>
  </svg>
)

// ─── CIS-TRANS in ring: 1,2-dimethylcyclohexane ──────────────────────────
const CycloRingPair = () => {
  const hex = (cx,cy,r,start=0) => Array.from({length:6},(_,i)=>{
    const a=(i*60+start)*Math.PI/180
    return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}
  })
  const draw = (cx,cy,r,isCis) => {
    const pts = hex(cx,cy,r,-90)
    return (
      <g>
        {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%6].x} y2={pts[(i+1)%6].y} stroke={C.text} strokeWidth="2"/>)}
        {/* C1 top vertex: CH3 up */}
        <line x1={pts[0].x} y1={pts[0].y} x2={pts[0].x} y2={pts[0].y-22} stroke={C.teal} strokeWidth="2"/>
        <A x={pts[0].x} y={pts[0].y-28} t="CH₃" col={C.teal} sz={9}/>
        {/* C2: CH3 up (cis) or down (trans) */}
        {isCis
          ? <><line x1={pts[1].x} y1={pts[1].y} x2={pts[1].x+16} y2={pts[1].y-22} stroke={C.teal} strokeWidth="2"/><A x={pts[1].x+22} y={pts[1].y-28} t="CH₃" col={C.teal} sz={9}/></>
          : <><line x1={pts[1].x} y1={pts[1].y} x2={pts[1].x+16} y2={pts[1].y+22} stroke={C.red} strokeWidth="2"/><A x={pts[1].x+22} y={pts[1].y+28} t="CH₃" col={C.red} sz={9}/></>
        }
        <text x={cx} y={cy+r+28} textAnchor="middle" fontSize="9" fill={isCis?C.teal:C.red} fontFamily={F} fontWeight="700">
          {isCis?'cis-1,2-dimethyl':'trans-1,2-dimethyl'}
        </text>
        <text x={cx} y={cy+r+40} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>
          {isCis?'(same face)':'(opposite faces)'}
        </text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 380 190" style={{width:'100%',maxHeight:'180px'}}>
      {draw(95,90,45,true)}
      <line x1={190} y1={20} x2={190} y2={175} stroke={C.border} strokeWidth="1.5"/>
      {draw(285,90,45,false)}
    </svg>
  )
}

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  {id:'geometric',label:'Geometric Isomerism'},
  {id:'optical',  label:'Optical Isomerism'},
  {id:'meso',     label:'Meso & POS'},
  {id:'rs',       label:'R/S Configuration'},
  {id:'compare',  label:'Enantiomers vs Diastereomers'},
]

export default function IsomerismSection() {
  const [tab,setTab] = useState('geometric')
  const [rsRevealed,setRsRevealed] = useState(false)
  const [viewAngle,setViewAngle] = useState(0)

  const tabBar = (
    <div style={{display:'flex',gap:'4px',background:'#EFEBE2',borderRadius:'10px',padding:'4px',marginBottom:'20px',flexWrap:'wrap'}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:'80px',padding:'7px 6px',borderRadius:'8px',border:'none',background:tab===t.id?'#fff':'transparent',cursor:'pointer',fontFamily:P,fontSize:'.77rem',fontWeight:600,color:tab===t.id?C.teal:C.muted,transition:'all .18s'}}>
          {t.label}
        </button>
      ))}
    </div>
  )

  // ── GEOMETRIC ────────────────────────────────────────────────────────────
  const TabGeometric = () => (
    <div>
      <div style={card('teal')}>
        <div style={ct('teal')}>📌 Two Conditions — BOTH must be satisfied</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'10px'}}>
          <div style={{background:'#fff',borderRadius:'8px',padding:'12px',border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,fontSize:'.85rem',marginBottom:'4px',color:C.teal}}>1. Restricted Rotation</div>
            <p style={{margin:0,fontSize:'.82rem'}}>C=C double bond, C=N bond, or a ring system. Single bonds rotate freely — no geometric isomers.</p>
          </div>
          <div style={{background:'#fff',borderRadius:'8px',padding:'12px',border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,fontSize:'.85rem',marginBottom:'4px',color:C.teal}}>2. Different Groups on Each sp² Carbon</div>
            <p style={{margin:0,fontSize:'.82rem'}}>Each doubly-bonded carbon must have 2 different substituents. If either carbon has 2 identical groups → no geometric isomerism.</p>
          </div>
        </div>
      </div>

      <h2 style={h2s}>cis / trans in Alkenes — But-2-ene</h2>
      <p style={{fontSize:'.87rem',color:C.muted,marginBottom:'12px'}}>The same molecule drawn two ways — they cannot interconvert without breaking the double bond.</p>
      <div style={ibox}><div style={iboxT}>Both structures are but-2-ene — different spatial arrangements</div><CisTransPair/></div>

      <div style={{...g2,marginTop:'16px'}}>
        <div style={card('teal')}>
          <div style={ct('teal')}>cis (Z) Properties</div>
          <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2}}>
            <li>Higher dipole moment (groups reinforce)</li>
            <li>Higher boiling point (stronger intermolecular forces)</li>
            <li>Lower melting point (asymmetric packing)</li>
            <li>Lower stability (steric strain)</li>
          </ul>
        </div>
        <div style={card('red')}>
          <div style={ct('red')}>trans (E) Properties</div>
          <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2}}>
            <li>Lower/zero dipole moment (groups cancel)</li>
            <li>Lower boiling point</li>
            <li>Higher melting point (symmetric crystal packing)</li>
            <li>Higher stability (less steric strain)</li>
          </ul>
        </div>
      </div>

      <h2 style={h2s}>E-Z Nomenclature — When cis/trans Fails</h2>
      <div style={card('amber')}>
        <div style={ct('amber')}>When to use E-Z instead of cis-trans</div>
        <p style={{fontSize:'.87rem',margin:0}}>When both doubly-bonded carbons have 4 completely different groups, cis/trans is ambiguous. Use CIP priority rules to assign E or Z. <strong>Z (Zusammen = together)</strong>: higher priority groups on same side. <strong>E (Entgegen = opposite)</strong>: higher priority groups on opposite sides.</p>
      </div>
      <div style={ibox}><div style={iboxT}>Fumaric acid (E) vs Maleic acid (Z) — COOH priority determines E or Z</div><EZFumaric/></div>

      <h2 style={h2s}>Geometric Isomerism in Rings</h2>
      <p style={{fontSize:'.87rem',color:C.muted,marginBottom:'12px'}}>In rings, rotation is always restricted. Substituents on the <strong>same face</strong> = cis. Substituents on <strong>opposite faces</strong> = trans.</p>
      <div style={ibox}><div style={iboxT}>1,2-dimethylcyclohexane — same molecule, different spatial arrangement</div><CycloRingPair/></div>

      <h2 style={h2s}>When Geometric Isomerism is NOT Possible</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Structure</th><th style={th}>Why no geometric isomers?</th><th style={th}>Example</th></tr></thead>
          <tbody>
            {[['CH₂=CHR','CH₂= has two identical H atoms','propene: CH₂=CH-CH₃'],['R₂C=CR₂','Need different groups on EACH carbon','2-methylpropene: (CH₃)₂C=CH₂'],['C=C=C (allene)','Middle carbon sp, can rotate','propa-1,2-diene'],['R-C≡C-R','Linear geometry, no restricted rotation','but-2-yne'],['R-CH=CH-R (same R)','Only one arrangement possible','but-2-ene with identical ends']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===0||j===2?F:'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card('red')}>
        <div style={ct('red')}>⚡ JEE Special Cases</div>
        <ul style={{marginLeft:'16px',fontSize:'.84rem',lineHeight:2.2}}>
          <li><strong>Oximes (R-CH=N-OH):</strong> C=N bond is rigid → syn/anti isomers. OH and R are on same (syn) or opposite (anti) sides of the double bond.</li>
          <li><strong>Azo compounds (R-N=N-R'):</strong> N=N double bond → geometric isomers. Seen in JEE Advanced problems.</li>
          <li><strong>Cyclic alkenes:</strong> Small rings (3,4,5 membered) can only exist as cis isomers — trans too strained to exist!</li>
        </ul>
      </div>
    </div>
  )

  // ── OPTICAL ──────────────────────────────────────────────────────────────
  const TabOptical = () => (
    <div>
      <div style={card('teal')}>
        <div style={ct('teal')}>🤚 Chirality — The Handedness of Molecules</div>
        <p style={{fontSize:'.88rem',marginBottom:'8px'}}>A molecule is chiral if it is non-superimposable on its mirror image — just like your hands. A molecule is achiral if it CAN be superimposed on its mirror image.</p>
        <p style={{fontSize:'.88rem',margin:0}}><strong>Chiral center (C*)</strong> = a carbon bonded to 4 completely different groups. Also called stereocenter or asymmetric carbon.</p>
      </div>

      <h2 style={h2s}>Lactic Acid — A Real Chiral Molecule</h2>
      <p style={{fontSize:'.87rem',color:C.muted,marginBottom:'8px'}}>Lactic acid has one chiral center (C2). It exists as two non-superimposable mirror images.</p>
      <div style={ibox}>
        <div style={iboxT}>Enantiomers of lactic acid — mirror images, non-superimposable</div>
        <LacticPair/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'14px'}}>
          <div style={{background:C.tealL,borderRadius:'8px',padding:'12px',border:`1px solid ${C.teal}`}}>
            <div style={{fontWeight:700,fontSize:'.83rem',color:C.teal,marginBottom:'6px'}}>(S)-Lactic acid</div>
            <ul style={{margin:0,paddingLeft:'16px',fontSize:'.8rem',lineHeight:1.9}}>
              <li>Found in muscle tissue (exercise)</li>
              <li>Rotates polarized light clockwise (+)</li>
              <li>Also called (L)-(+)-lactic acid</li>
            </ul>
          </div>
          <div style={{background:C.redL,borderRadius:'8px',padding:'12px',border:`1px solid ${C.red}`}}>
            <div style={{fontWeight:700,fontSize:'.83rem',color:C.red,marginBottom:'6px'}}>(R)-Lactic acid</div>
            <ul style={{margin:0,paddingLeft:'16px',fontSize:'.8rem',lineHeight:1.9}}>
              <li>Found in sour milk fermentation</li>
              <li>Rotates polarized light anticlockwise (−)</li>
              <li>Also called (D)-(−)-lactic acid</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 style={h2s}>How to Spot a Chiral Center</h2>
      {[
        {h:'Step 1 — Find all sp³ carbons',p:'A chiral center must be sp³ (tetrahedral). Ignore sp² (C=C, C=O) and sp (C≡C) carbons.',col:'teal'},
        {h:'Step 2 — Check all 4 groups',p:'List the 4 groups attached to each carbon. If even two are identical → NOT a chiral center.',col:'blue'},
        {h:'Step 3 — Trace each group fully',p:'Do not stop at the first atom. CH₂CH₃ and CH₂CH₂CH₃ are different groups even though both start with CH₂.',col:'amber'},
        {h:'Step 4 — Mark as C*',p:'If all 4 groups are different → chiral center. The number of chiral centers determines the maximum number of stereoisomers (2ⁿ).',col:'red'},
      ].map((s,i)=>(
        <div key={i} style={stepRow}><div style={stepN(s.col)}>{i+1}</div><div style={{...card(s.col),marginBottom:0,flex:1}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div></div>
      ))}

      <h2 style={h2s}>Conditions for a Molecule to be Chiral</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Condition</th><th style={th}>Chiral?</th><th style={th}>Example</th></tr></thead>
          <tbody>
            {[['Has at least 1 chiral center AND no plane of symmetry','YES','(R)-lactic acid'],['Has chiral centers BUT has a plane of symmetry','NO (meso)','meso-tartaric acid'],['No chiral centers at all','NO (achiral)','ethanol (1 C, symmetric)'],['N with 4 different groups (including lone pair)','NO in practice','trimethylamine (umbrella inversion)'],['Allenes with 4 different end groups','YES (axial chirality)','H₂C=C=CHClBr (JEE Advanced)']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),color:j===1?(c==='YES'?C.teal:C.red):C.text,fontWeight:j===1?700:400}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card('purple')}>
        <div style={ct('purple')}>🌂 Umbrella Inversion — Why Amines Are Not Chiral</div>
        <p style={{fontSize:'.87rem',marginBottom:'10px'}}>A nitrogen atom with 3 different groups + a lone pair should be chiral. But nitrogen undergoes rapid "umbrella inversion" — flipping the lone pair from one side to the other ~10⁸ times per second at room temperature.</p>
        <div style={{background:'rgba(107,53,160,.08)',borderRadius:'8px',padding:'12px',fontFamily:F,fontSize:'.85rem',textAlign:'center'}}>
          R₁R₂R₃N: ⇌ :NR₁R₂R₃
          <div style={{marginTop:'4px',fontSize:'.75rem',color:C.muted}}>Both "enantiomers" interconvert so fast they cannot be isolated → effectively achiral</div>
        </div>
        <p style={{fontSize:'.87rem',margin:'10px 0 0'}}>Exception: Quaternary ammonium salts R₁R₂R₃R₄N⁺ (no lone pair) CAN be chiral and isolated.</p>
      </div>
    </div>
  )

  // ── MESO ─────────────────────────────────────────────────────────────────
  const TabMeso = () => (
    <div>
      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:PD}}>Meso Compounds — The #1 JEE Trap</h3>
        <p style={{color:'rgba(255,255,255,.88)',margin:0,fontSize:'.9rem'}}>A meso compound has chiral centers but is optically INACTIVE because an internal Plane of Symmetry (POS) makes it superimposable on its own mirror image.</p>
      </div>

      <h2 style={h2s}>Meso-2,3-Dibromobutane — The Classic Example</h2>
      <div style={ibox}><div style={iboxT}>The POS cuts the molecule into two mirror-image halves that cancel each other out</div><MesoDibromo/></div>

      {[{h:'Has chiral centers (C2 and C3)',p:'C2 is R configuration, C3 is S configuration. Both are genuine chiral centers — each bonded to 4 different groups.',col:'blue'},{h:'Has a Plane of Symmetry (POS)',p:'An imaginary horizontal plane through the middle of C2-C3 bond divides the molecule into two halves. Left half = mirror image of right half.',col:'amber'},{h:'Result: Optically Inactive',p:'The (+) rotation from C2(R) is exactly cancelled by the (−) rotation from C3(S). Net optical rotation = 0°. Optically inactive despite having chiral centers.',col:'teal'},{h:'Superimposable on its mirror image',p:'Rotate the mirror image 180° around the POS — it becomes identical to the original. So the compound IS its own enantiomer.',col:'red'}].map((s,i)=>(
        <div key={i} style={stepRow}><div style={stepN(s.col)}>{i+1}</div><div style={{...card(s.col),marginBottom:0,flex:1}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div></div>
      ))}

      <h2 style={h2s}>How to Detect a Meso Compound</h2>
      <div style={card('amber')}>
        <div style={ct('amber')}>3-Step Meso Detection Checklist</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginTop:'8px'}}>
          {[{n:1,t:'Even number of chiral centers?',d:'Meso is only possible with 2, 4, 6... chiral centers. Odd number → no meso possible.'},
            {n:2,t:'Identical groups on two halves?',d:'The two halves of the molecule must be chemically identical (same groups, same connectivity).'},
            {n:3,t:'Can POS be drawn?',d:'If you can draw an imaginary plane dividing the molecule into mirror-image halves → it IS meso.'}
          ].map(s=>(
            <div key={s.n} style={{background:'#fff',borderRadius:'8px',padding:'12px',border:`1px solid ${C.border}`,textAlign:'center'}}>
              <div style={{width:'28px',height:'28px',background:C.amber,color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,margin:'0 auto 8px',fontSize:'.85rem'}}>{s.n}</div>
              <div style={{fontWeight:700,fontSize:'.8rem',marginBottom:'6px'}}>{s.t}</div>
              <p style={{margin:0,fontSize:'.76rem',color:C.muted,lineHeight:1.6}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 style={h2s}>Common Meso Compounds in JEE</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Compound</th><th style={th}>Chiral Centers</th><th style={th}>Configuration</th><th style={th}>Total Stereoisomers</th></tr></thead>
          <tbody>
            {[['Meso-2,3-dibromobutane','C2, C3','(2R,3S)','3 total: (RR)+(SS)+meso'],['Meso-tartaric acid','C2, C3','(2R,3S)','3 total: (RR)+(SS)+meso'],['Meso-2,3-dichloropentanedioic acid','C2, C4','(2R,4S)','3 total'],['Meso-2,3-dihydroxybutanedioic acid','C2, C3','same as tartaric acid','3 total']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===2?F:'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card('red')}>
        <div style={ct('red')}>⚠️ JEE Exam Traps with Meso</div>
        <ul style={{marginLeft:'16px',fontSize:'.84rem',lineHeight:2.2}}>
          <li><strong>2ⁿ counts meso separately:</strong> Don't just write 2ⁿ — subtract the meso pairs and count correctly</li>
          <li><strong>Meso is NOT a racemic mixture:</strong> Racemic = 50:50 mix of enantiomers (still optically inactive). Meso = single pure compound with internal symmetry.</li>
          <li><strong>Meso has different physical properties</strong> from its enantiomers (different MP, solubility etc.) because it IS a different compound</li>
          <li><strong>You cannot resolve meso:</strong> No technique can separate it into optically active components — internal compensation is permanent</li>
        </ul>
      </div>
    </div>
  )

  // ── R/S ──────────────────────────────────────────────────────────────────
  const TabRS = () => (
    <div>
      <div style={card('blue')}>
        <div style={ct('blue')}>📌 CIP Rules — The System That Never Fails</div>
        <p style={{fontSize:'.87rem',margin:0}}>Cahn-Ingold-Prelog rules give an unambiguous way to describe configuration at any chiral center. Used for both R/S (optical) and E/Z (geometric) assignment.</p>
      </div>

      <h2 style={h2s}>Step-by-Step R/S Assignment — CHFClBr</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>CHFClBr — one chiral center, 4 different groups</div><RSExample revealed={rsRevealed}/><div style={{textAlign:'center',marginTop:'12px'}}><button onClick={()=>setRsRevealed(true)} style={{background:C.teal,color:'#fff',border:'none',borderRadius:'8px',padding:'10px 22px',fontWeight:600,cursor:'pointer',fontFamily:P}}>Show CIP Arrow</button></div></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[{h:'Step 1: Assign priorities by atomic number',p:'Br (Z=35) = ①   Cl (Z=17) = ②   F (Z=9) = ③   H (Z=1) = ④',col:'blue'},{h:'Step 2: Orient ④ away from you',p:'H (lowest priority) is already on a dashed bond — it points AWAY from viewer. No reorientation needed. ✓',col:'teal'},{h:'Step 3: Trace ①→②→③',p:'Draw a curved arrow from Br(①) → Cl(②) → F(③). Observe: it goes CLOCKWISE.',col:'amber'},{h:'Step 4: Read the result',p:'Clockwise with ④ pointing away = R (Rectus). This is (R)-CHFClBr.',col:'red'}].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem',fontFamily:i===0?F:P}}>{s.p}</p></div>
          ))}
        </div>
      </div>

      <h2 style={h2s}>CIP Priority Rules — All 4 Rules</h2>
      {[{h:'Rule 1 — Atomic Number',p:'Higher atomic number = higher priority. I > Br > Cl > S > F > O > N > C > H. This handles most cases.',col:'teal'},{h:'Rule 2 — Same atom? Go to the next atom',p:'If two substituents start with the same atom (e.g. both C), compare the atoms bonded to those carbons. Take the highest in each set.',col:'blue'},{h:'Rule 3 — Double/Triple bonds = phantom atoms',p:'C=O means: C is bonded to (O, O_phantom, ...) and O is bonded to (C, C_phantom, ...). C≡N means each atom gets 2 phantom atoms of the other.',col:'amber'},{h:'Rule 4 — Isotopes — heavier = higher priority',p:'Deuterium (D, mass 2) has higher priority than H (mass 1). Rarely tested but appears in JEE Advanced.',col:'red'}].map((s,i)=>(
        <div key={i} style={stepRow}><div style={stepN(s.col)}>{i+1}</div><div style={{...card(s.col),marginBottom:0,flex:1}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div></div>
      ))}

      <h2 style={h2s}>The ④-Toward-You Trick</h2>
      <div style={card('amber')}>
        <div style={ct('amber')}>What if the lowest priority group is NOT on a dashed bond?</div>
        <p style={{fontSize:'.87rem',marginBottom:'10px'}}>If ④ is on a solid wedge (toward you), assign R/S normally then INVERT the answer. If ④ is in the plane of paper, you need to mentally reorient.</p>
        <div style={{background:'#fff',borderRadius:'8px',padding:'12px',fontFamily:F,fontSize:'.83rem'}}>
          <div>④ on dashed bond (away) → read arrow directly</div>
          <div style={{marginTop:'6px'}}>④ on solid wedge (toward) → read arrow, then INVERT (R becomes S, S becomes R)</div>
          <div style={{marginTop:'6px'}}>④ in plane → swap ④ with any other group (flip the answer for each swap)</div>
        </div>
      </div>

      <h2 style={h2s}>Practice: Assign R/S to These Molecules</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
        {[
          {mol:'(S)-Alanine',struct:'COOH at C2, NH₂ up (wedge), H down (dash), CH₃ right',ans:'Priorities: NH₂(N)>COOH(O)>CH₃(C)>H. H on dash ✓. Arrow N→O→C is anticlockwise → S',col:'teal'},
          {mol:'(R)-Glyceraldehyde',struct:'CHO at top (C1), OH right (wedge), H left (dash), CH₂OH at bottom',ans:'Priorities: OH(O)>CHO(O via phantom)>CH₂OH(O via phantom)>H. Detailed CIP needed → R',col:'blue'},
          {mol:'(R)-2-Bromobutane',struct:'Br at C2, H up (wedge), CH₃ right, C₂H₅ left',ans:'Priorities: Br>C₂H₅(compares deeper)>CH₃>H. H on wedge: read arrow then invert. → R',col:'amber'},
        ].map((s,i)=>(
          <div key={i} style={{...card(s.col),marginBottom:0}}>
            <div style={ct(s.col)}>{s.mol}</div>
            <p style={{margin:'0 0 8px',fontSize:'.8rem',color:C.muted}}>{s.struct}</p>
            <details>
              <summary style={{fontSize:'.8rem',cursor:'pointer',color:C[s.col],fontWeight:600}}>Show solution</summary>
              <p style={{margin:'8px 0 0',fontSize:'.8rem',fontFamily:F,lineHeight:1.7}}>{s.ans}</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  )

  // ── COMPARE ──────────────────────────────────────────────────────────────
  const TabCompare = () => (
    <div>
      <h2 style={{...h2s,marginTop:0}}>Enantiomers vs Diastereomers — Side by Side</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Property</th><th style={{...th,background:C.purple}}>Enantiomers</th><th style={{...th,background:C.blue}}>Diastereomers</th></tr></thead>
          <tbody>
            {[['Definition','Non-superimposable mirror images','Stereoisomers that are NOT mirror images'],['Stereocenters','ALL stereocenters inverted','SOME stereocenters inverted (not all)'],['Example (2 centers)','(R,R) ↔ (S,S)','(R,R) vs (R,S)'],['Physical properties','IDENTICAL (except optical rotation)','DIFFERENT (BP, MP, solubility...)'],['Optical rotation','Opposite sign, same magnitude','Different values (may or may not rotate)'],['Separation method','Chiral column, diastereomeric salt','Normal chromatography, distillation, crystallization'],['Geometric isomers are...','NOT enantiomers','YES — geometric isomers are diastereomers'],['Meso vs its enantiomer','Meso has NO enantiomer (is its own mirror image)','Meso and (R,R)/(S,S) forms are diastereomers']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j>=1?F:'inherit',fontWeight:j===0?600:400}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2s}>Tartaric Acid — All Three Stereoisomers</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'16px'}}>
        {[
          {label:'(R,R)-tartaric acid',config:'C2=R, C3=R',note:'Optically active (+)',col:'teal',detail:'Rotates polarized light clockwise. Found in grapes.'},
          {label:'(S,S)-tartaric acid',config:'C2=S, C3=S',note:'Optically active (−)',col:'red',detail:'Rotates polarized light anticlockwise. Enantiomer of (R,R).'},
          {label:'meso-tartaric acid',config:'C2=R, C3=S',note:'Optically INACTIVE',col:'amber',detail:'Has internal POS. Diastereomer of both (R,R) and (S,S). Different physical properties.'},
        ].map((s,i)=>(
          <div key={i} style={{...card(s.col),marginBottom:0}}>
            <div style={ct(s.col)}>{s.label}</div>
            <div style={{fontFamily:F,fontSize:'.8rem',marginBottom:'6px',color:C[s.col]}}>{s.config}</div>
            <div style={{fontWeight:700,fontSize:'.82rem',marginBottom:'6px'}}>{s.note}</div>
            <p style={{margin:0,fontSize:'.8rem',color:C.muted}}>{s.detail}</p>
          </div>
        ))}
      </div>

      <div style={card('blue')}>
        <div style={ct('blue')}>Relationship Map for Tartaric Acid</div>
        <svg viewBox="0 0 420 120" style={{width:'100%',maxHeight:'110px'}}>
          <rect x={20} y={30} width={110} height={55} rx="8" fill={C.tealL} stroke={C.teal} strokeWidth="1.5"/>
          <text x={75} y={52} textAnchor="middle" fontSize="10" fill={C.teal} fontFamily={F} fontWeight="700">(R,R)-tartaric</text>
          <text x={75} y={66} textAnchor="middle" fontSize="9" fill={C.teal} fontFamily={F}>optically active (+)</text>
          <text x={75} y={78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>ENANTIOMERS</text>
          <rect x={155} y={30} width={110} height={55} rx="8" fill={C.redL} stroke={C.red} strokeWidth="1.5"/>
          <text x={210} y={52} textAnchor="middle" fontSize="10" fill={C.red} fontFamily={F} fontWeight="700">(S,S)-tartaric</text>
          <text x={210} y={66} textAnchor="middle" fontSize="9" fill={C.red} fontFamily={F}>optically active (−)</text>
          <text x={210} y={78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>ENANTIOMERS</text>
          <rect x={290} y={30} width={115} height={55} rx="8" fill={C.amberL} stroke={C.amber} strokeWidth="1.5"/>
          <text x={347} y={52} textAnchor="middle" fontSize="10" fill={C.amber} fontFamily={F} fontWeight="700">meso-tartaric</text>
          <text x={347} y={66} textAnchor="middle" fontSize="9" fill={C.amber} fontFamily={F}>optically inactive</text>
          <text x={347} y={78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>has POS</text>
          <line x1={130} y1={57} x2={155} y2={57} stroke={C.purple} strokeWidth="2"/>
          <text x={142} y={50} textAnchor="middle" fontSize="7" fill={C.purple} fontFamily={F}>mirror</text>
          <line x1={265} y1={57} x2={290} y2={57} stroke={C.blue} strokeWidth="1.5" strokeDasharray="4,3"/>
          <text x={277} y={50} textAnchor="middle" fontSize="7" fill={C.blue} fontFamily={F}>diastereo</text>
          <text x={75} y={110} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>← DIASTEREOMERS with meso →</text>
          <line x1={130} y1={82} x2={290} y2={82} stroke={C.muted} strokeWidth="1" strokeDasharray="3,3"/>
        </svg>
      </div>

      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:PD}}>The One-Line Rule to Remember</h3>
        <p style={{color:'rgba(255,255,255,.9)',margin:0,fontSize:'.9rem'}}>Enantiomers = ALL stereocenters flipped. Diastereomers = SOME stereocenters flipped (or geometric isomers). Everything else with the same connectivity is a constitutional isomer.</p>
      </div>
    </div>
  )

  const tabContent = {geometric:<TabGeometric/>,optical:<TabOptical/>,meso:<TabMeso/>,rs:<TabRS/>,compare:<TabCompare/>}

  return (
    <div style={sec}>
      <span style={tag('j')}>JEE Core</span><span style={tag('i')}>Very High Weightage</span>
      <h1 style={{fontFamily:PD,fontSize:'2.2rem',color:C.text,marginBottom:'6px',lineHeight:1.2}}>Stereoisomerism — Visual Guide</h1>
      <p style={{color:C.muted,fontSize:'.92rem',marginBottom:'24px'}}>Real molecular structures drawn as they appear in 3D — wedge bonds, mirror images, and step-by-step reasoning.</p>
      {tabBar}
      {tabContent[tab]}
    </div>
  )
}
