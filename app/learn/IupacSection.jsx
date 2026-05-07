'use client'
import { useState } from 'react'

const C = {
  teal:'#007A6E', amber:'#C97A0A', red:'#B83030', blue:'#1A56B0',
  purple:'#6B35A0', text:'#1A1E2E', muted:'#6B7A99', border:'#DED8CC',
  tealL:'#E6F4F2', amberL:'#FEF3E0', redL:'#FCECEA', blueL:'#E8F0FC', purpleL:'#F0E9FB',
}
const sec = {padding:'40px 48px',maxWidth:'980px',fontFamily:"'Plus Jakarta Sans',sans-serif"}
const card = (col) => ({background:col?C[col+'L']:'#fff',border:`1px solid ${C.border}`,borderLeft:col?`4px solid ${C[col]}`:'1px solid #DED8CC',borderRadius:'12px',padding:'20px',marginBottom:'16px'})
const ct = (col) => ({fontWeight:700,fontSize:'.72rem',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px',color:C[col]||C.text})
const stepStyle = {display:'flex',gap:'14px',marginBottom:'14px'}
const stepNum = (col='teal') => ({minWidth:'28px',height:'28px',background:C[col],color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.8rem',flexShrink:0,marginTop:'2px'})
const tag = (col) => ({display:'inline-block',padding:'2px 10px',borderRadius:'20px',fontSize:'.68rem',fontWeight:700,marginRight:'5px',marginBottom:'10px',background:C[col+'L'],color:C[col]})
const tbl = {width:'100%',borderCollapse:'collapse',margin:'14px 0',fontSize:'.82rem'}
const th = {background:C.text,color:'#fff',padding:'9px 13px',textAlign:'left',fontSize:'.77rem'}
const td = (i) => ({padding:'9px 13px',borderBottom:`1px solid ${C.border}`,background:i%2===0?'#EFEBE2':'#fff'})
const ibox = {background:'#fff',border:`2px solid ${C.border}`,borderRadius:'12px',padding:'22px',margin:'18px 0'}
const iboxT = {fontSize:'.7rem',color:C.muted,fontFamily:"'Fira Code',monospace",letterSpacing:'2px',textTransform:'uppercase',marginBottom:'14px',textAlign:'center'}
const g2 = {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px',marginBottom:'16px'}
const hl = {background:'linear-gradient(135deg,#007A6E,#00967D)',color:'#fff',borderRadius:'12px',padding:'18px 22px',margin:'18px 0'}

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const IUPAC_QUIZ = [
  { q:'What is the IUPAC name of CH₃-CH(CH₃)-CH₂-CH₃?', opts:['2-methylbutane','3-methylbutane','isopentane','2-methylpropane'], ans:0, exp:'Longest chain = 4C (butane). Methyl branch at C2. Numbered from end giving lower locant → 2-methylbutane.' },
  { q:'Which is the correct IUPAC name for (CH₃)₃C-Cl?', opts:['1-chloro-2-methylpropane','2-chloro-2-methylpropane','tert-butyl chloride','2-methyl-2-chloropropane'], ans:1, exp:'Principal chain = propane (3C). Cl at C2, methyl at C2. Alphabetical: chloro before methyl → 2-chloro-2-methylpropane.' },
  { q:'IUPAC name of benzene with -CH₃ at C1 and -NO₂ at C4 is:', opts:['4-nitrotoluene','1-methyl-4-nitrobenzene','para-nitrotoluene','4-methylnitrobenzene'], ans:1, exp:'IUPAC uses numbers: methyl at C1, nitro at C4 → 1-methyl-4-nitrobenzene. p-nitrotoluene is common name.' },
  { q:'CH₂=CH-CH₂-OH is named:', opts:['prop-2-en-1-ol','prop-1-en-3-ol','allyl alcohol','2-propenol'], ans:0, exp:'OH gets lowest locant (C1), double bond at C2-C3 → prop-2-en-1-ol.' },
  { q:'IUPAC name of (CH₃CO)₂O is:', opts:['acetic anhydride','ethanoic anhydride','acetyl oxide','dimethyl ketone oxide'], ans:1, exp:'Anhydrides: replace "acid" with "anhydride". Ethanoic acid → ethanoic anhydride.' },
  { q:'Correct IUPAC name for 1,2-dimethylbenzene is:', opts:['o-xylene','ortho-dimethylbenzene','benzene-1,2-dimethyl','1,2-dimethylbenzene'], ans:3, exp:'IUPAC name is 1,2-dimethylbenzene. o-xylene is common name only.' },
  { q:'Cyclopentane ring with -COOH attached is named:', opts:['cyclopentanoic acid','cyclopentanecarboxylic acid','cyclopentyl formate','pentanoic acid'], ans:1, exp:'-COOH attached to ring → ring name + "carboxylic acid" = cyclopentanecarboxylic acid.' },
  { q:'CH₃-CH₂-C≡C-CH₃ is named:', opts:['pent-2-yne','pent-3-yne','2-pentyne','3-pentyne'], ans:0, exp:'5C chain, triple bond at C2. Number from end closer to triple bond → pent-2-yne.' },
  { q:'IUPAC name of (CH₃)₂CH-CHO is:', opts:['isobutyraldehyde','2-methylpropanal','3-methylpropanal','methylpropanal'], ans:1, exp:'Chain including CHO = 3C. CHO is C1. Methyl branch at C2 → 2-methylpropanal.' },
  { q:'Locant set for 3-ethyl-2-methylpentane:', opts:['C2-methyl, C3-ethyl','C3-methyl, C2-ethyl','C2-ethyl, C3-methyl','C4-methyl, C3-ethyl'], ans:0, exp:'Numbering from one end: methyl at C2, ethyl at C3 → set {2,3}. Other end gives {3,4}. {2,3} wins.' },
]

// ─── PROPER SKELETAL SVG MOLECULES ───────────────────────────────────────────
// These use line-angle/skeletal notation where C is at each vertex (implicit)
// H count is implicit. Heteroatoms (O, N, Cl) are labeled explicitly.
// Bonds are lines between vertices. NO atom label sits in the middle of bonds.

const F = "'Fira Code',monospace"

// Helper: draw a single, double, or triple bond between two points
function bondLines(x1,y1,x2,y2,order=1,color='#1A1E2E') {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)
  if(len===0) return null
  const ox=(-dy/len)*3.5, oy=(dx/len)*3.5
  const lines = []
  if(order===1) lines.push(<line key="s" x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2"/>)
  if(order===2){
    lines.push(<line key="d1" x1={x1+ox} y1={y1+oy} x2={x2+ox} y2={y2+oy} stroke={color} strokeWidth="2"/>)
    lines.push(<line key="d2" x1={x1-ox} y1={y1-oy} x2={x2-ox} y2={y2-oy} stroke={color} strokeWidth="2"/>)
  }
  if(order===3){
    lines.push(<line key="t1" x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2"/>)
    lines.push(<line key="t2" x1={x1+ox*1.5} y1={y1+oy*1.5} x2={x2+ox*1.5} y2={y2+oy*1.5} stroke={color} strokeWidth="1.5"/>)
    lines.push(<line key="t3" x1={x1-ox*1.5} y1={y1-oy*1.5} x2={x2-ox*1.5} y2={y2-oy*1.5} stroke={color} strokeWidth="1.5"/>)
  }
  return lines
}

// Label at position — covers the line beneath it with white bg
const L = ({x,y,text,color='#1A1E2E',size=11,anchor='middle'}) => {
  const w = text.length * size * 0.62 + 6
  return (
    <g>
      <rect x={x-(anchor==='middle'?w/2:anchor==='start'?0:-w)} y={y-size*0.75} width={w} height={size*1.5} fill="white"/>
      <text x={x} y={y+size*0.35} textAnchor={anchor} fontSize={size} fill={color} fontWeight="700" fontFamily={F}>{text}</text>
    </g>
  )
}

// Carbon vertex dot (small, for skeletal structures)
const Dot = ({x,y}) => <circle cx={x} cy={y} r="2.5" fill="#1A1E2E"/>

// Numbered carbon label below a vertex
const Num = ({x,y,n}) => <text x={x} y={y+16} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>C{n}</text>

// ── n-Butane: C1-C2-C3-C4 zig-zag skeletal ──────────────────────────────────
// Zigzag: C1(20,50) C2(70,30) C3(120,50) C4(170,30)
const MolButane = () => (
  <svg viewBox="0 0 200 80" style={{width:'100%',maxHeight:'80px'}}>
    {bondLines(20,50,70,30,1)}
    {bondLines(70,30,120,50,1)}
    {bondLines(120,50,170,30,1)}
    <L x={20} y={50} text="CH₃" color={C.teal} size={10}/>
    <Dot x={70} y={30}/><Num x={70} y={30} n={2}/>
    <Dot x={120} y={50}/><Num x={120} y={50} n={3}/>
    <L x={170} y={30} text="CH₃" color={C.teal} size={10}/>
    <text x={100} y={78} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>butane — C₄H₁₀</text>
  </svg>
)

// ── 2-Methylbutane ──────────────────────────────────────────────────────────
// Main: C1(20,55) C2(70,35) C3(120,55) C4(170,35)
// Branch CH3 goes UP from C2: (70,35)→(70,5)
const MolIsobutane = () => (
  <svg viewBox="0 0 210 100" style={{width:'100%',maxHeight:'100px'}}>
    {bondLines(20,60,75,38,1)}
    {bondLines(75,38,130,60,1)}
    {bondLines(130,60,185,38,1)}
    {bondLines(75,38,75,10,1)}
    <L x={20} y={60} text="CH₃" color={C.teal} size={10}/>
    <Dot x={75} y={38}/><Num x={75} y={38} n={2}/>
    <Dot x={130} y={60}/><Num x={130} y={60} n={3}/>
    <L x={185} y={38} text="CH₃" color={C.teal} size={10}/>
    <L x={75} y={8} text="CH₃" color={C.amber} size={10}/>
    <text x={75} y={58} textAnchor="middle" fontSize="7" fill={C.amber} fontFamily={F}>branch</text>
    <text x={105} y={88} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>2-methylbutane</text>
  </svg>
)

// ── But-2-ene ────────────────────────────────────────────────────────────────
// C1(15,50) - C2(70,30) == C3(125,50) - C4(180,30)  [double bond C2-C3]
const MolButene = () => (
  <svg viewBox="0 0 210 80" style={{width:'100%',maxHeight:'80px'}}>
    {bondLines(18,52,72,30,1)}
    {bondLines(72,30,128,52,2)}
    {bondLines(128,52,182,30,1)}
    <L x={18} y={52} text="CH₃" color={C.teal} size={10}/>
    <Dot x={72} y={30}/><Num x={72} y={30} n={2}/>
    <Dot x={128} y={52}/><Num x={128} y={52} n={3}/>
    <L x={182} y={30} text="CH₃" color={C.teal} size={10}/>
    <text x={100} y={18} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F}>C=C double bond</text>
    <text x={100} y={75} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>but-2-ene</text>
  </svg>
)

// ── Pent-2-yne ───────────────────────────────────────────────────────────────
// C1(15,40) - C2(65,40) ≡ C3(115,40) - C4(155,55) - C5(200,40)
const MolPentyne = () => (
  <svg viewBox="0 0 230 80" style={{width:'100%',maxHeight:'80px'}}>
    {bondLines(18,45,68,45,1)}
    {bondLines(68,45,118,45,3)}
    {bondLines(118,45,160,60,1)}
    {bondLines(160,60,205,45,1)}
    <L x={18} y={45} text="CH₃" color={C.teal} size={10}/>
    <Dot x={68} y={45}/><Num x={68} y={45} n={2}/>
    <Dot x={118} y={45}/><Num x={118} y={45} n={3}/>
    <Dot x={160} y={60}/><Num x={160} y={60} n={4}/>
    <L x={205} y={45} text="CH₃" color={C.teal} size={10}/>
    <text x={93} y={26} textAnchor="middle" fontSize="8" fill={C.purple} fontFamily={F}>C≡C triple bond</text>
    <text x={113} y={78} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>pent-2-yne</text>
  </svg>
)

// ── Prop-2-en-1-ol (Allyl alcohol) ──────────────────────────────────────────
// HO-CH2(C1)-CH(C2)=CH2(C3)
// C1(160,45) C2(110,45) C3(60,45) — number from OH end
// OH hangs off C1 to the right, C3 is =CH2
const MolAllyAlcohol = () => (
  <svg viewBox="0 0 230 80" style={{width:'100%',maxHeight:'80px'}}>
    {bondLines(178,45,138,45,1)}
    {bondLines(138,45,88,45,1)}
    {bondLines(88,45,45,45,2)}
    <L x={200} y={45} text="OH" color={C.red} size={11}/>
    <Dot x={138} y={45}/><Num x={138} y={45} n={1}/>
    <Dot x={88} y={45}/><Num x={88} y={45} n={2}/>
    <L x={35} y={45} text="CH₂" color={C.text} size={10}/>
    <text x={65} y={28} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>double bond</text>
    <text x={113} y={72} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>prop-2-en-1-ol  (OH at C1, C=C at C2)</text>
  </svg>
)

// ── 2-methylpropanal ─────────────────────────────────────────────────────────
// CHO(C1) - CH(C2) - CH3(C3) with CH3 branch at C2 going up
// Draw: CHO on right (always C1), chain goes left
const MolMethylPropanal = () => (
  <svg viewBox="0 0 240 100" style={{width:'100%',maxHeight:'100px'}}>
    {/* C1 is the CHO carbon — bond to O double, bond to H, bond to C2 */}
    {bondLines(175,52,140,52,1)}          {/* C1-C2 */}
    {bondLines(175,52,210,38,2)}          {/* C=O double bond */}
    {bondLines(175,52,208,66,1)}          {/* C-H */}
    {bondLines(140,52,100,52,1)}          {/* C2-C3 */}
    {bondLines(140,52,140,18,1)}          {/* C2-CH3 branch */}
    <L x={218} y={35} text="O" color={C.red} size={11}/>
    <L x={218} y={68} text="H" color={C.muted} size={10}/>
    <Dot x={175} y={52}/><text x={175} y={68} textAnchor="middle" fontSize="7" fill={C.red} fontFamily={F}>C1(CHO)</text>
    <Dot x={140} y={52}/><text x={140} y={68} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C2</text>
    <L x={82} y={52} text="CH₃" color={C.teal} size={10}/>
    <text x={155} y={6} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C3</text>
    <L x={140} y={15} text="CH₃" color={C.amber} size={10}/>
    <text x={120} y={88} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>2-methylpropanal</text>
  </svg>
)

// ── 2-chloro-2-methylpropane (t-BuCl) ───────────────────────────────────────
// Central C(C2) bonded to: CH3(left), CH3(right), CH3(up), Cl(down)
// 4 bonds from C2 = exactly 4 ✓ (3xCH3 + 1xCl)
const MolTBuCl = () => (
  <svg viewBox="0 0 200 170" style={{width:'100%',maxHeight:'170px'}}>
    {bondLines(100,85,45,85,1)}
    {bondLines(100,85,155,85,1)}
    {bondLines(100,85,100,30,1)}
    {bondLines(100,85,100,140,1)}
    <Dot x={100} y={85}/>
    <L x={30} y={85} text="CH₃" color={C.teal} size={10}/>
    <L x={170} y={85} text="CH₃" color={C.teal} size={10}/>
    <L x={100} y={18} text="CH₃" color={C.teal} size={10}/>
    <L x={100} y={155} text="Cl" color={C.blue} size={12}/>
    <text x={118} y={82} fontSize="7" fill={C.muted} fontFamily={F}>C2</text>
    <text x={100} y={170} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>2-chloro-2-methylpropane</text>
  </svg>
)

// ── 3-ethyl-2-methylpentane ──────────────────────────────────────────────────
// Main 5C zigzag: C1(20,65) C2(65,42) C3(110,65) C4(155,42) C5(200,65)
// methyl UP from C2: (65,42)->(65,18)
// ethyl from C3: C3(110,65)->(145,85)->(185,105)  [2 carbons]
const MolComplex1 = () => (
  <svg viewBox="0 0 230 130" style={{width:'100%',maxHeight:'130px'}}>
    {bondLines(20,68,65,45,1)}
    {bondLines(65,45,110,68,1)}
    {bondLines(110,68,155,45,1)}
    {bondLines(155,45,200,68,1)}
    {bondLines(65,45,65,18,1)}
    {bondLines(110,68,148,90,1)}
    {bondLines(148,90,186,68,1)}
    <L x={20} y={68} text="CH₃" color={C.teal} size={9}/>
    <Dot x={65} y={45}/><Num x={65} y={45} n={2}/>
    <Dot x={110} y={68}/><Num x={110} y={68} n={3}/>
    <Dot x={155} y={45}/><Num x={155} y={45} n={4}/>
    <L x={200} y={68} text="CH₃" color={C.teal} size={9}/>
    <L x={65} y={8} text="CH₃" color={C.amber} size={9}/>
    <text x={65} y={56} textAnchor="middle" fontSize="7" fill={C.amber} fontFamily={F}>methyl</text>
    <Dot x={148} y={90}/>
    <L x={190} y={66} text="CH₃" color={C.purple} size={9}/>
    <text x={155} y={108} textAnchor="middle" fontSize="7" fill={C.purple} fontFamily={F}>ethyl</text>
    <text x={105} y={120} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>3-ethyl-2-methylpentane</text>
  </svg>
)

// ── 4-hydroxy-3-methylbutan-2-one ───────────────────────────────────────────
// Chain: CH3(C1) - C=O(C2) - CH(C3) - CH2(C4) - OH
// CH3 branch at C3 going up
// Zigzag: C1(20,60) C2(65,38) C3(110,60) C4(155,38) OH(200,60)
const MolHydroxyKetone = () => (
  <svg viewBox="0 0 240 105" style={{width:'100%',maxHeight:'105px'}}>
    {bondLines(20,62,65,40,1)}
    {bondLines(65,40,110,62,2)}
    {bondLines(110,62,155,40,1)}
    {bondLines(155,40,200,62,1)}
    {bondLines(65,40,65,14,2)}
    {bondLines(110,62,110,35,1)}
    <L x={20} y={62} text="CH₃" color={C.teal} size={10}/>
    <text x={20} y={76} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C1</text>
    <Dot x={65} y={40}/>
    <text x={65} y={56} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C2</text>
    <L x={65} y={8} text="O" color={C.red} size={11}/>
    <text x={82} y={28} fontSize="7" fill={C.red} fontFamily={F}>ketone</text>
    <Dot x={110} y={62}/>
    <text x={110} y={76} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C3</text>
    <L x={110} y={28} text="CH₃" color={C.amber} size={9}/>
    <text x={128} y={42} fontSize="7" fill={C.amber} fontFamily={F}>branch</text>
    <Dot x={155} y={40}/>
    <text x={155} y={54} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C4</text>
    <L x={205} y={62} text="OH" color={C.red} size={11}/>
    <text x={210} y={76} textAnchor="middle" fontSize="7" fill={C.red} fontFamily={F}>alcohol</text>
    <text x={113} y={98} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>4-hydroxy-3-methylbutan-2-one</text>
  </svg>
)

// ── 2-phenylpropanoic acid ────────────────────────────────────────────────────
// COOH-CH(CH3)-Ph
// Draw: benzene hex on left, C2 connects to ring, CH3 up from C2, COOH right of C1
const MolPhenylPropanoic = () => {
  const bx=70, by=60, br=32
  const pts = Array.from({length:6},(_,i)=>{
    const a=(i*60-90)*Math.PI/180
    return {x:bx+br*Math.cos(a),y:by+br*Math.sin(a)}
  })
  return (
    <svg viewBox="0 0 280 130" style={{width:'100%',maxHeight:'130px'}}>
      {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%6].x} y2={pts[(i+1)%6].y} stroke={C.text} strokeWidth="2"/>)}
      {[0,2,4].map(i=>{
        const a1=(i*60-90)*Math.PI/180, a2=((i+1)*60-90)*Math.PI/180, r2=br-7
        return <line key={i} x1={bx+r2*Math.cos(a1)} y1={by+r2*Math.sin(a1)} x2={bx+r2*Math.cos(a2)} y2={by+r2*Math.sin(a2)} stroke={C.text} strokeWidth="1.5"/>
      })}
      {/* Bond from ring top vertex to C2 */}
      {bondLines(bx,by-br,140,38,1)}
      {/* C2 to C1(COOH carbon) */}
      {bondLines(140,38,190,60,1)}
      {/* CH3 up from C2 */}
      {bondLines(140,38,140,10,1)}
      {/* C1: C=O double bond up-right, C-OH right */}
      {bondLines(190,60,222,42,2)}
      {bondLines(190,60,225,72,1)}
      <Dot x={140} y={38}/>
      <text x={140} y={54} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C2</text>
      <L x={140} y={8} text="CH₃" color={C.amber} size={9}/>
      <Dot x={190} y={60}/>
      <text x={190} y={74} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C1</text>
      <L x={234} y={38} text="O" color={C.red} size={11}/>
      <L x={234} y={74} text="OH" color={C.red} size={10}/>
      <text x={70} y={112} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>phenyl group</text>
      <text x={190} y={112} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>COOH</text>
      <text x={140} y={125} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>2-phenylpropanoic acid</text>
    </svg>
  )
}

// ── Benzene ring component ────────────────────────────────────────────────────
const BenzeneRing = ({cx=100,cy=65,r=38,subs=[]}) => {
  const pts = Array.from({length:6},(_,i)=>{
    const a=(i*60-90)*Math.PI/180
    return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}
  })
  return (
    <g>
      {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%6].x} y2={pts[(i+1)%6].y} stroke={C.text} strokeWidth="2"/>)}
      {[0,2,4].map(i=>{
        const a1=(i*60-90)*Math.PI/180,a2=((i+1)*60-90)*Math.PI/180,r2=r-7
        return <line key={i} x1={cx+r2*Math.cos(a1)} y1={cy+r2*Math.sin(a1)} x2={cx+r2*Math.cos(a2)} y2={cy+r2*Math.sin(a2)} stroke={C.text} strokeWidth="1.5"/>
      })}
      {subs.map((s,i)=>{
        const a=(s.pos*60-90)*Math.PI/180
        const ex=cx+(r+28)*Math.cos(a), ey=cy+(r+28)*Math.sin(a)
        return (
          <g key={i}>
            <line x1={cx+r*Math.cos(a)} y1={cy+r*Math.sin(a)} x2={ex} y2={ey} stroke={C.text} strokeWidth="2"/>
            <L x={ex} y={ey} text={s.label} color={s.color||C.red} size={10}/>
          </g>
        )
      })}
    </g>
  )
}

// ── Cyclopentanecarboxylic acid ───────────────────────────────────────────────
const MolCyclopentaneAcid = () => {
  const cx=75, cy=70, r=36
  const pts = Array.from({length:5},(_,i)=>{
    const a=(i*72-90)*Math.PI/180
    return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}
  })
  // top vertex is pts[0]: connect COOH there
  const tx=pts[0].x, ty=pts[0].y
  return (
    <svg viewBox="0 0 240 145" style={{width:'100%',maxHeight:'145px'}}>
      {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%5].x} y2={pts[(i+1)%5].y} stroke={C.text} strokeWidth="2.2"/>)}
      {/* Bond from ring C1 to carboxyl carbon */}
      <line x1={tx} y1={ty} x2={tx} y2={ty-22} stroke={C.text} strokeWidth="2"/>
      {/* Carboxyl carbon at (tx, ty-22): double bond to O going right, single bond to OH going left */}
      <Dot x={tx} y={ty-22}/>
      {bondLines(tx,ty-22,tx+32,ty-38,2)}
      {bondLines(tx,ty-22,tx-28,ty-38,1)}
      <L x={tx+44} y={ty-40} text="O" color={C.red} size={11}/>
      <L x={tx-40} y={ty-40} text="OH" color={C.red} size={10}/>
      <text x={cx} y={cy+8} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>ring C1</text>
      <text x={130} y={100} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>cyclopentane-</text>
      <text x={130} y={114} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>carboxylic acid</text>
    </svg>
  )
}

// ─── SECTION TABS ─────────────────────────────────────────────────────────────
const TABS = [
  {id:'intro',label:'Rules'},
  {id:'alkanes',label:'Alkanes'},
  {id:'alkenes',label:'Alkenes & Alkynes'},
  {id:'fg',label:'Functional Groups'},
  {id:'cyclic',label:'Cyclic & Benzene'},
  {id:'complex',label:'JEE Advanced'},
  {id:'quiz',label:'Practice Quiz'},
]

export default function IupacSection() {
  const [tab,setTab] = useState('intro')
  const [quizState,setQuizState] = useState(Array(IUPAC_QUIZ.length).fill(null))
  const [quizScore,setQuizScore] = useState(null)

  function answerQuiz(qi,oi){
    if(quizState[qi]!==null) return
    const next=[...quizState]; next[qi]=oi; setQuizState(next)
    if(next.filter(x=>x!==null).length===IUPAC_QUIZ.length)
      setQuizScore(next.filter((x,i)=>x===IUPAC_QUIZ[i].ans).length)
  }

  const tabBar = (
    <div style={{display:'flex',gap:'4px',background:'#EFEBE2',borderRadius:'10px',padding:'4px',marginBottom:'20px',flexWrap:'wrap'}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:'76px',padding:'7px 6px',borderRadius:'8px',border:'none',background:tab===t.id?'#fff':'transparent',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:'.77rem',fontWeight:600,color:tab===t.id?C.teal:C.muted,transition:'all .18s'}}>
          {t.label}
        </button>
      ))}
    </div>
  )

  // ── TAB: RULES ────────────────────────────────────────────────────────────
  const TabRules = () => (
    <div>
      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:"'Playfair Display',serif"}}>The 4 Master Steps for ANY IUPAC Name</h3>
        <p style={{color:'rgba(255,255,255,.85)',margin:0,fontSize:'.88rem'}}>Follow these in order, every time. They never fail.</p>
      </div>
      {[
        {n:1,h:'Find the Principal Chain',p:'The longest continuous carbon chain that contains the principal functional group. This gives the parent name: meth, eth, prop, but, pent, hex, hept, oct, non, dec.',col:'teal'},
        {n:2,h:'Identify the Principal Functional Group',p:'Priority (high to low): COOH > COCl > CONH₂ > CHO > C=O (ketone) > OH > NH₂ > C=C > C≡C > halogens. Highest priority gets the suffix. All others become prefixes.',col:'blue'},
        {n:3,h:'Number the Chain',p:'Number from the end that gives the LOWEST locant to the principal functional group first. If tied, give lower number to the double bond. If still tied, go to branch points.',col:'amber'},
        {n:4,h:'Name Substituents Alphabetically',p:'Write substituents alphabetically. Ignore multiplying prefixes (di, tri, sec, tert) when alphabetizing. Ethyl before methyl. Put locant immediately before each name. Separate numbers with commas, numbers from letters with hyphens.',col:'red'},
      ].map(s=>(
        <div key={s.n} style={{...stepStyle,marginBottom:'16px'}}>
          <div style={stepNum(s.col)}>{s.n}</div>
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:'10px',padding:'14px 16px',flex:1}}>
            <h4 style={{fontSize:'.9rem',fontWeight:700,marginBottom:'6px',color:C[s.col]}}>{s.h}</h4>
            <p style={{margin:0,fontSize:'.84rem',lineHeight:1.7}}>{s.p}</p>
          </div>
        </div>
      ))}
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',margin:'24px 0 12px'}}>Parent Chain Names</h3>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>C count</th><th style={th}>Prefix</th><th style={th}>Alkane</th><th style={th}>Alkene</th><th style={th}>Alkyne</th></tr></thead>
          <tbody>
            {[['1','meth-','methane','—','—'],['2','eth-','ethane','ethene','ethyne'],['3','prop-','propane','propene','propyne'],['4','but-','butane','but-1-ene','but-1-yne'],['5','pent-','pentane','pent-1-ene','pent-1-yne'],['6','hex-','hexane','hex-1-ene','hex-1-yne'],['7','hept-','heptane','—','—'],['8','oct-','octane','—','—'],['9','non-','nonane','—','—'],['10','dec-','decane','—','—']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j>=1?"'Fira Code',monospace":'inherit',fontWeight:j===1?700:400}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',margin:'24px 0 12px'}}>Suffix for Each Functional Group</h3>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Group</th><th style={th}>Structure</th><th style={th}>Suffix</th><th style={th}>Example</th></tr></thead>
          <tbody>
            {[['Carboxylic acid','-COOH','-oic acid','ethanoic acid'],['Aldehyde','-CHO','-al','ethanal (CHO = C1)'],['Ketone','-CO-','-one','propan-2-one'],['Alcohol','-OH','-ol','propan-1-ol'],['Amine','-NH₂','-amine','ethanamine'],['Alkene','C=C','-ene','but-2-ene'],['Alkyne','C≡C','-yne','pent-2-yne'],['Halide','-X','halo- prefix','2-chlorobutane']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j>=1?"'Fira Code',monospace":'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{...card('amber'),marginTop:'16px'}}>
        <div style={ct('amber')}>⚠️ Top JEE Mistakes in IUPAC</div>
        <ul style={{marginLeft:'20px',fontSize:'.85rem',lineHeight:2.2}}>
          <li><strong>Missing the longest chain:</strong> Draw ALL possible chains before deciding</li>
          <li><strong>Wrong direction of numbering:</strong> Number from the end giving LOWER locant to the principal group</li>
          <li><strong>Alphabetical order:</strong> Ethyl (e) before methyl (m) — ignore di/tri prefixes</li>
          <li><strong>CHO = C1 always:</strong> The aldehyde carbon is always C1, never write 1-al</li>
          <li><strong>Ring + COOH:</strong> When COOH hangs off a ring, use "carboxylic acid" not "oic acid"</li>
        </ul>
      </div>
    </div>
  )

  // ── TAB: ALKANES ──────────────────────────────────────────────────────────
  const TabAlkanes = () => (
    <div>
      <div style={card('teal')}>
        <div style={ct('teal')}>📌 Alkanes — All Single Bonds, CₙH₂ₙ₊₂</div>
        <p style={{fontSize:'.87rem',margin:0}}>Parent name = longest chain + "-ane". Branches are named as alkyl groups. The skeletal structures below show carbons at each vertex — hydrogen count is implicit.</p>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 1 — Butane (no branches)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Skeletal structure</div><MolButane/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{...card('teal'),marginBottom:0}}><div style={ct('teal')}>Longest chain = 4C</div><p style={{margin:0,fontSize:'.83rem'}}>Count the vertices in the zigzag. 4 carbons = but-. No branches. Suffix = -ane. Name = butane.</p></div>
          <div style={{...card('blue'),marginBottom:0}}><div style={ct('blue')}>Reading skeletal structures</div><p style={{margin:0,fontSize:'.83rem'}}>Each vertex = 1 carbon. H atoms are implicit (fill remaining bonds to 4). Terminal CH₃ groups are shown explicitly.</p></div>
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 2 — 2-Methylbutane (one branch)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Skeletal structure — branch goes up from C2</div><MolIsobutane/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[{h:'Longest chain = 4C (not 5C!)',p:'The vertical branch is NOT part of the main chain. Main chain is the horizontal 4C zigzag.',col:'teal'},{h:'Number: branch at C2 or C3?',p:'From left: branch at C2. From right: branch at C3. Lower = C2. Number left to right.',col:'amber'},{h:'Name: 2-methylbutane',p:'4C (but) + branch methyl at C2 = 2-methylbutane. Common name "isopentane" is NOT IUPAC.',col:'red'}].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
          ))}
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Alkyl Groups — Memorize These for JEE</h3>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Alkyl Group</th><th style={th}>Structure</th><th style={th}>How to spot it</th></tr></thead>
          <tbody>
            {[['methyl','CH₃—','1C branch'],['ethyl','CH₃CH₂—','2C straight branch'],['n-propyl','CH₃CH₂CH₂—','3C straight branch'],['isopropyl','(CH₃)₂CH—','3C with fork at attachment point'],['n-butyl','CH₃(CH₂)₂CH₂—','4C straight branch'],['isobutyl','(CH₃)₂CHCH₂—','fork 1 carbon away from attachment'],['sec-butyl','CH₃CH₂CH(CH₃)—','attachment at C2 of butane'],['tert-butyl','(CH₃)₃C—','3 methyls on the attachment carbon — JEE favourite!']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===1?"'Fira Code',monospace":'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── TAB: ALKENES & ALKYNES ────────────────────────────────────────────────
  const TabUnsaturated = () => (
    <div>
      <div style={g2}>
        <div style={{...card('blue'),marginBottom:0}}><div style={ct('blue')}>Alkenes — suffix "-ene"</div><ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2}}><li>Contains C=C (shown as double line)</li><li>Locant = lower C of the double bond</li><li>Principal chain must include C=C</li></ul></div>
        <div style={{...card('purple'),marginBottom:0}}><div style={ct('purple')}>Alkynes — suffix "-yne"</div><ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2}}><li>Contains C≡C (shown as triple line)</li><li>Same numbering rule as alkenes</li><li>If both C=C and C≡C: -en-yne suffix, C=C gets lower locant</li></ul></div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 1 — But-2-ene</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Double bond between C2 and C3</div><MolButene/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[{h:'Chain = 4C → but',p:'Longest chain containing the double bond = 4 carbons',col:'blue'},{h:'Number from end closer to C=C',p:'From left: double bond starts at C2. From right: starts at C3. Lower = C2.',col:'teal'},{h:'Name = but-2-ene',p:'IUPAC 2013: locant goes right before suffix. Not "2-butene".',col:'amber'}].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
          ))}
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 2 — Pent-2-yne</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Triple bond between C2 and C3</div><MolPentyne/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[{h:'Chain = 5C → pent',p:'5 carbon chain containing the triple bond',col:'purple'},{h:'Number: triple bond at C2 or C3?',p:'From left: C2. From right: C3. Lower = C2 wins.',col:'teal'},{h:'Name = pent-2-yne',p:'Note: CH₃-CH₂-C≡C-CH₃ → C2≡C3. Name from C1 end (CH₃ end closer to triple bond).',col:'amber'}].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
          ))}
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 3 — Prop-2-en-1-ol (Allyl Alcohol)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Two functional groups — who wins?</div><MolAllyAlcohol/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{...card('red'),marginBottom:0}}><div style={ct('red')}>OH beats C=C in priority</div><p style={{margin:0,fontSize:'.83rem'}}>Alcohol (OH) is the principal group → gets suffix "-ol". Double bond gets a locant inside the name. Number from the OH end.</p></div>
          <div style={{...card('teal'),marginBottom:0}}><div style={ct('teal')}>Name = prop-2-en-1-ol</div><p style={{margin:0,fontSize:'.83rem'}}>3C chain. OH at C1 (-1-ol). Double bond at C2-C3 (-2-en-). Read as: prop-2-en-1-ol. Common name: allyl alcohol.</p></div>
        </div>
      </div>
    </div>
  )

  // ── TAB: FUNCTIONAL GROUPS ────────────────────────────────────────────────
  const TabFG = () => (
    <div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'0 0 12px'}}>Aldehydes — CHO is always C1</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>2-methylpropanal</div><MolMethylPropanal/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{...card('red'),marginBottom:0}}><div style={ct('red')}>CHO carbon = C1, always</div><p style={{margin:0,fontSize:'.83rem'}}>The aldehyde carbon (attached to H and =O) is C1 by definition. You never write "1-al" — just "-al" at the end. Count branches from C1.</p></div>
          <div style={{...card('teal'),marginBottom:0}}><div style={ct('teal')}>Name = 2-methylpropanal</div><p style={{margin:0,fontSize:'.83rem'}}>CHO is C1. Next carbon (C2) has a methyl branch. Chain = 3C (propanal). Branch at C2 = 2-methyl. Name = 2-methylpropanal.</p></div>
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Haloalkanes — Halogen is always a prefix</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>2-chloro-2-methylpropane</div><MolTBuCl/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{...card('blue'),marginBottom:0}}><div style={ct('blue')}>Halogens = prefixes only</div><p style={{margin:0,fontSize:'.83rem'}}>Fluoro-, chloro-, bromo-, iodo- are ALWAYS prefixes, never suffixes. The central carbon (C2) has exactly 4 bonds: 3 × CH₃ + 1 × Cl. That is 4 bonds. Correct!</p></div>
          <div style={{...card('amber'),marginBottom:0}}><div style={ct('amber')}>Name = 2-chloro-2-methylpropane</div><p style={{margin:0,fontSize:'.83rem'}}>3C chain (propane). Cl at C2, CH₃ at C2. Alphabetical: chloro (c) before methyl (m). Name: 2-chloro-2-methylpropane.</p></div>
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Functional Group Priority Table</h3>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Rank</th><th style={th}>Group</th><th style={th}>Suffix (as principal)</th><th style={th}>Prefix (when not principal)</th></tr></thead>
          <tbody>
            {[['1 — highest','-COOH','-oic acid','carboxy-'],['2','-SO₃H','-sulfonic acid','sulfo-'],['3','-COOR','-oate','—'],['4','-COCl','-oyl chloride','—'],['5','-CONH₂','-amide','carbamoyl-'],['6','-CHO','-al','formyl-/oxo-'],['7','-C=O (ketone)','-one','oxo-'],['8','-OH','-ol','hydroxy-'],['9','-NH₂','-amine','amino-'],['10','C=C','-ene','—'],['11','C≡C','-yne','—'],['12 — lowest','–X (halogen)','— (always prefix)','fluoro/chloro/bromo/iodo-']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j>=1?"'Fira Code',monospace":'inherit',fontWeight:j===0?700:400,color:i===0?C.red:i<=2?C.amber:i<=5?C.teal:i<=7?C.blue:C.text}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── TAB: CYCLIC & BENZENE ─────────────────────────────────────────────────
  const TabCyclic = () => (
    <div>
      <div style={{...card('teal'),marginBottom:'16px'}}><div style={ct('teal')}>📌 Cyclic = "cyclo-" prefix before parent name</div><p style={{fontSize:'.87rem',margin:0}}>Count carbons in the ring. Number the ring to give the lowest locant set to substituents. For ring + COOH: name as ringname + "carboxylic acid".</p></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
        {[
          {label:'cyclopropane (3C)',svg:<svg viewBox="0 0 100 90" style={{width:'100%',maxHeight:'80px'}}><polygon points="50,12 88,72 12,72" fill="none" stroke={C.text} strokeWidth="2.5"/><text x="50" y="87" textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>C₃H₆</text></svg>},
          {label:'cyclobutane (4C)',svg:<svg viewBox="0 0 100 90" style={{width:'100%',maxHeight:'80px'}}><polygon points="18,18 82,18 82,75 18,75" fill="none" stroke={C.text} strokeWidth="2.5"/><text x="50" y="88" textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>C₄H₈</text></svg>},
          {label:'cyclopentane (5C)',svg:<svg viewBox="0 0 100 100" style={{width:'100%',maxHeight:'90px'}}><polygon points="50,8 92,38 76,85 24,85 8,38" fill="none" stroke={C.text} strokeWidth="2.5"/><text x="50" y="98" textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>C₅H₁₀</text></svg>},
        ].map((m,i)=>(
          <div key={i} style={ibox}><div style={iboxT}>{m.label}</div>{m.svg}</div>
        ))}
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'0 0 12px'}}>Cyclopentanecarboxylic Acid</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>COOH hangs off the ring</div><MolCyclopentaneAcid/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{...card('amber'),marginBottom:0}}><div style={ct('amber')}>When COOH is a substituent on the ring</div><p style={{margin:0,fontSize:'.83rem'}}>The COOH carbon is NOT part of the ring. The ring C it attaches to is C1. Name = ring name + "carboxylic acid".</p></div>
          <div style={{...card('red'),marginBottom:0}}><div style={ct('red')}>NOT cyclopentanoic acid!</div><p style={{margin:0,fontSize:'.83rem'}}>"cyclopentanoic acid" implies COOH is part of the ring (impossible for 5C ring + COOH = 6C total, which would be cyclohexane).</p></div>
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Benzene Derivatives</h3>
      <div style={{...card('blue'),marginBottom:'16px'}}><div style={ct('blue')}>Key Benzene Naming Rules</div>
        <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2.1}}>
          <li>Monosubstituted: substituent name + benzene (e.g. chlorobenzene, nitrobenzene)</li>
          <li>Disubstituted: 1,2- (ortho), 1,3- (meta), 1,4- (para) — or use numbers</li>
          <li>Trisubstituted and above: always use numbers, give lowest locant set</li>
          <li>Benzene as substituent = phenyl- (C₆H₅-)</li>
          <li>Number in the direction (CW or CCW) that gives the lowest locant set</li>
        </ul>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'16px'}}>
        {[
          {label:'methylbenzene (toluene)',svg:<svg viewBox="0 0 180 130" style={{width:'100%',maxHeight:'120px'}}><BenzeneRing cx={90} cy={65} r={38} subs={[{pos:0,label:'CH₃',color:C.teal}]}/></svg>},
          {label:'1-methyl-4-nitrobenzene',svg:<svg viewBox="0 0 180 160" style={{width:'100%',maxHeight:'140px'}}><BenzeneRing cx={90} cy={80} r={38} subs={[{pos:0,label:'CH₃',color:C.teal},{pos:3,label:'NO₂',color:C.red}]}/><text x={90} y={150} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>C1=CH₃, C4=NO₂</text></svg>},
          {label:'1,2-dichlorobenzene (ortho)',svg:<svg viewBox="0 0 200 140" style={{width:'100%',maxHeight:'130px'}}><BenzeneRing cx={100} cy={70} r={38} subs={[{pos:0,label:'Cl',color:C.blue},{pos:1,label:'Cl',color:C.blue}]}/><text x={100} y={130} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily={F}>adjacent positions</text></svg>},
        ].map((m,i)=>(
          <div key={i} style={ibox}><div style={iboxT}>{m.label}</div>{m.svg}</div>
        ))}
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Common Name</th><th style={th}>IUPAC Name</th><th style={th}>JEE Note</th></tr></thead>
          <tbody>
            {[['Toluene','methylbenzene','Both accepted'],['Aniline','aminobenzene','Both accepted'],['Phenol','hydroxybenzene','Both accepted'],['Benzaldehyde','benzene carbaldehyde','Common preferred in JEE'],['Benzoic acid','benzenecarboxylic acid','Both accepted'],['Styrene','ethenylbenzene','Common used in JEE'],['o-Xylene','1,2-dimethylbenzene','IUPAC preferred in JEE'],['Cumene','isopropylbenzene','JEE: cumene → phenol process']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={td(i)}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── TAB: JEE ADVANCED ─────────────────────────────────────────────────────
  const TabComplex = () => (
    <div>
      <div style={hl}><h3 style={{color:'#fff',marginTop:0,fontFamily:"'Playfair Display',serif"}}>JEE Advanced Level — Two Functional Groups + Complex Branching</h3><p style={{color:'rgba(255,255,255,.85)',margin:0,fontSize:'.88rem'}}>These exact molecule types appear in JEE Advanced. Master the priority rules and numbering.</p></div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 1 — 3-Ethyl-2-methylpentane (Two Different Branches)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>5C main chain, methyl at C2, ethyl at C3</div><MolComplex1/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[
            {h:'Step 1: Count the main chain',p:'The longest chain is 5C (pentane). The methyl at C2 and the 2-carbon ethyl group at C3 are both branches.',col:'teal'},
            {h:'Step 2: Number for lowest locant set',p:'From one end: methyl at C2, ethyl at C3 → set {2,3}. From other end: {3,4}. Choose {2,3}.',col:'blue'},
            {h:'Step 3: Alphabetical order',p:'Ethyl (e) comes before methyl (m) in alphabet. Write ethyl first. Result: 3-ethyl-2-methylpentane.',col:'amber'},
            {h:'Common mistake',p:'Writing "2-methyl-3-ethylpentane" — WRONG! Alphabetical order is mandatory regardless of locant order.',col:'red'},
          ].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
          ))}
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Example 2 — 4-Hydroxy-3-methylbutan-2-one (Ketone + Alcohol)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Ketone C=O at C2, OH at C4, methyl at C3</div><MolHydroxyKetone/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[
            {h:'Step 1: Priority — ketone beats alcohol',p:'Ketone (C=O) has higher priority than alcohol (OH). Ketone gets the suffix "-one". OH becomes the prefix "hydroxy-".',col:'red'},
            {h:'Step 2: Number from ketone end',p:'Give lowest locant to ketone (the suffix group). Ketone at C2 → chain is C1(CH₃), C2(C=O), C3(CH with branch), C4(CH₂OH).',col:'blue'},
            {h:'Step 3: Name all groups',p:'4C chain = butan. Ketone at C2 = -2-one. Methyl branch at C3 = 3-methyl-. OH at C4 = 4-hydroxy-.',col:'teal'},
            {h:'Final name',p:'Alphabetical: hydroxy (h) before methyl (m). Name = 4-hydroxy-3-methylbutan-2-one. 4 bonds on every carbon. ✓',col:'amber'},
          ].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
          ))}
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Example 3 — 2-Phenylpropanoic Acid (Benzene + Chain)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>COOH at C1, phenyl group at C2, methyl at C2</div><MolPhenylPropanoic/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[
            {h:'Principal chain includes COOH',p:'COOH is the highest priority group. The chain must include the COOH carbon (C1). Chain = 3C (propanoic acid).',col:'red'},
            {h:'Phenyl is a substituent',p:'The benzene ring (C₆H₅-) hangs off C2 as a "phenyl" group. It does not extend the chain.',col:'blue'},
            {h:'Name = 2-phenylpropanoic acid',p:'3C (propan) + oic acid. Phenyl at C2. Name: 2-phenylpropanoic acid. This is the backbone structure of ibuprofen!',col:'teal'},
          ].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
          ))}
        </div>
      </div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>JEE Advanced Traps — Examiner Tricks</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
        {[
          {h:'The hidden longer chain',p:'Always trace every possible path. A chain that goes through a seemingly "branch" direction is often the actual longest chain.',col:'red'},
          {h:'Di/tri ignored for alphabetizing',p:'"Diethyl" → alphabetize as E, not D. "Trimethyl" → alphabetize as M. Multiplying prefixes are invisible in alphabetical ordering.',col:'amber'},
          {h:'Chain must include principal FG',p:'You cannot pick a longer chain that excludes the COOH or CHO carbon. The principal group carbon is always IN the chain.',col:'blue'},
          {h:'Benzene ring numbering direction',p:'Number clockwise OR anticlockwise — whichever gives the lower locant set. Draw both and compare before deciding.',col:'teal'},
          {h:'Ring vs chain: which is parent?',p:'If ring has more carbons → ring is parent. If chain has more carbons → chain is parent. Equal carbons → ring wins.',col:'purple'},
          {h:'New IUPAC 2013 locant position',p:'Locant goes immediately before the suffix it refers to: "but-2-ene" not "2-butene". JEE now follows 2013 IUPAC. Know both formats.',col:'red'},
        ].map((s,i)=>(
          <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>⚠️ {s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div>
        ))}
      </div>
    </div>
  )

  // ── TAB: QUIZ ─────────────────────────────────────────────────────────────
  const TabQuiz = () => (
    <div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',margin:'0 0 6px'}}>IUPAC Nomenclature — 10 JEE Questions</h3>
      <p style={{color:C.muted,fontSize:'.85rem',marginBottom:'20px'}}>Answers and explanations revealed immediately after each answer.</p>
      {quizScore!==null && (
        <div style={{background:quizScore>=7?C.tealL:C.redL,border:`2px solid ${quizScore>=7?C.teal:C.red}`,borderRadius:'12px',padding:'20px',marginBottom:'20px',textAlign:'center'}}>
          <div style={{fontSize:'2.2rem',fontWeight:700,color:quizScore>=7?C.teal:C.red,fontFamily:"'Playfair Display',serif"}}>{quizScore}/10</div>
          <div style={{marginTop:'8px',fontWeight:600}}>{quizScore>=8?'Excellent! IUPAC mastered!':quizScore>=6?'Good! Review the mistakes above.':'Re-read the Rules tab and retry.'}</div>
          <button onClick={()=>{setQuizState(Array(IUPAC_QUIZ.length).fill(null));setQuizScore(null)}} style={{marginTop:'12px',background:C.teal,color:'#fff',border:'none',borderRadius:'8px',padding:'10px 22px',fontWeight:600,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Retake</button>
        </div>
      )}
      {IUPAC_QUIZ.map((q,qi)=>(
        <div key={qi} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:'12px',padding:'20px',marginBottom:'16px'}}>
          <p style={{fontWeight:600,marginBottom:'12px',fontSize:'.9rem'}}>Q{qi+1}. {q.q}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {q.opts.map((opt,oi)=>{
              const answered=quizState[qi]!==null
              const isCorrect=oi===q.ans, isChosen=quizState[qi]===oi
              let bg='#fff',border=`2px solid ${C.border}`,color=C.text
              if(answered&&isCorrect){bg=C.tealL;border=`2px solid ${C.teal}`;color=C.teal}
              if(answered&&isChosen&&!isCorrect){bg=C.redL;border=`2px solid ${C.red}`;color=C.red}
              return (
                <button key={oi} onClick={()=>answerQuiz(qi,oi)} disabled={answered} style={{padding:'10px 12px',border,borderRadius:'8px',cursor:answered?'default':'pointer',fontSize:'.83rem',background:bg,color,textAlign:'left',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:answered&&isCorrect?700:400}}>
                  {String.fromCharCode(65+oi)}. <span style={{fontFamily:F}}>{opt}</span>
                </button>
              )
            })}
          </div>
          {quizState[qi]!==null && (
            <div style={{marginTop:'10px',padding:'12px',background:C.tealL,borderRadius:'8px',fontSize:'.83rem',color:C.teal,borderLeft:`3px solid ${C.teal}`}}>
              <strong>Explanation:</strong> {q.exp}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const tabContent = {intro:<TabRules/>,alkanes:<TabAlkanes/>,alkenes:<TabUnsaturated/>,fg:<TabFG/>,cyclic:<TabCyclic/>,complex:<TabComplex/>,quiz:<TabQuiz/>}

  return (
    <div style={sec}>
      <span style={tag('j')}>JEE Core</span><span style={tag('i')}>High Weightage</span>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:C.text,marginBottom:'6px',lineHeight:1.2}}>IUPAC Nomenclature</h1>
      <p style={{color:C.muted,fontSize:'.92rem',marginBottom:'28px'}}>Skeletal structures, systematic naming rules, cyclic compounds, benzene — from basics to JEE Advanced level.</p>
      {tabBar}
      {tabContent[tab]}
    </div>
  )
}
