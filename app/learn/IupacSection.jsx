'use client'
import { useState } from 'react'

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
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
const mono = {fontFamily:"'Fira Code',monospace",background:'#EFEBE2',border:`1px solid ${C.border}`,padding:'1px 7px',borderRadius:'5px',fontSize:'.82rem'}

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const IUPAC_QUIZ = [
  { q:'What is the IUPAC name of CH₃-CH(CH₃)-CH₂-CH₃?', opts:['2-methylbutane','3-methylbutane','isopentane','2-methylpropane'], ans:0, exp:'Longest chain = 4C (butane). Methyl branch at C2. Numbered from end giving lower locant → 2-methylbutane.' },
  { q:'Which is the correct IUPAC name for (CH₃)₃C-Cl?', opts:['1-chloro-2-methylpropane','2-chloro-2-methylpropane','tert-butyl chloride','2-methyl-2-chloropropane'], ans:1, exp:'Principal chain = 3C with Cl at C2 and methyl at C2 → 2-chloro-2-methylpropane. Both "2-chloro-2-methylpropane" and "2-methyl-2-chloropropane" are same but alphabetical order puts chloro first.' },
  { q:'IUPAC name of benzene with -CH₃ at position 1 and -NO₂ at position 4 is:', opts:['4-nitrotoluene','1-methyl-4-nitrobenzene','para-nitrotoluene','4-methylnitrobenzene'], ans:1, exp:'Correct IUPAC name uses numbering: methyl at C1, nitro at C4. So 1-methyl-4-nitrobenzene. Common name "p-nitrotoluene" is acceptable but not IUPAC.' },
  { q:'The compound CH₂=CH-CH₂-OH is named:', opts:['prop-2-en-1-ol','prop-1-en-3-ol','allyl alcohol','2-propenol'], ans:0, exp:'Longest chain with both C=C and OH = 3C. OH gets lower locant (C1), double bond at C2-C3 → prop-2-en-1-ol. Number from OH end.' },
  { q:'IUPAC name of (CH₃CO)₂O is:', opts:['acetic anhydride','ethanoic anhydride','acetyl oxide','dimethyl ketone oxide'], ans:1, exp:'Anhydrides are named by replacing "acid" with "anhydride". Ethanoic acid anhydride = ethanoic anhydride.' },
  { q:'Correct name for 1,2-dimethylbenzene is:', opts:['o-xylene','ortho-dimethylbenzene','benzene-1,2-dimethyl','1,2-dimethylbenzene'], ans:3, exp:'IUPAC name is 1,2-dimethylbenzene. o-xylene is the common name, not IUPAC. The locants must be included in the name.' },
  { q:'Name the compound: cyclopentane with -COOH group', opts:['cyclopentanoic acid','cyclopentane carboxylic acid','cyclopentyl formate','pentanoic acid'], ans:1, exp:'When -COOH is directly attached to a ring, name it as ring + "carboxylic acid" → cyclopentanecarboxylic acid.' },
  { q:'CH₃-CH₂-C≡C-CH₃ is named:', opts:['pent-2-yne','pent-3-yne','2-pentyne','3-pentyne'], ans:0, exp:'5C chain with triple bond at C2-C3. Numbered from end closer to triple bond → pent-2-yne. IUPAC 2013 puts locant immediately before suffix.' },
  { q:'The IUPAC name of (CH₃)₂CHCHO is:', opts:['isobutyraldehyde','2-methylpropanal','3-methylpropanal','methylpropanal'], ans:1, exp:'Longest chain including CHO = 3C (propanal). Methyl branch at C2 → 2-methylpropanal. CHO carbon is always C1.' },
  { q:'Which locant set is correct for 3-ethyl-2-methylpentane?', opts:['C2-methyl C3-ethyl','C3-methyl C2-ethyl','C2-ethyl C3-methyl','C4-methyl C3-ethyl'], ans:0, exp:'Number from end giving lowest locant set. Methyl at C2, ethyl at C3 gives set {2,3}. Other end gives {3,4}. So {2,3} is correct → 3-ethyl-2-methylpentane.' },
]

// ─── SVG MOLECULE COMPONENTS ─────────────────────────────────────────────────

// Generic bond line
const Bond = ({x1,y1,x2,y2,double=false,triple=false,color='#1A1E2E',dashed=false}) => {
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)
  const ox = (-dy/len)*4, oy = (dx/len)*4
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={dashed?0:2} strokeDasharray={dashed?'5,3':'none'}/>
      {double && <line x1={x1+ox} y1={y1+oy} x2={x2+ox} y2={y2+oy} stroke={color} strokeWidth="1.8"/>}
      {triple && <>
        <line x1={x1+ox} y1={y1+oy} x2={x2+ox} y2={y2+oy} stroke={color} strokeWidth="1.8"/>
        <line x1={x1-ox} y1={y1-oy} x2={x2-ox} y2={y2-oy} stroke={color} strokeWidth="1.8"/>
      </>}
    </g>
  )
}

// Atom label
const Atom = ({x,y,label,color='#1A1E2E',size=12,sub=null}) => (
  <g>
    <rect x={x-size*label.length*0.32} y={y-size*0.7} width={size*label.length*0.64+4} height={size*1.4} fill="white"/>
    <text x={x} y={y+size*0.35} textAnchor="middle" fontSize={size} fill={color} fontWeight="700" fontFamily="'Fira Code',monospace">{label}{sub&&<tspan fontSize={size*0.75} baselineShift="-sub">{sub}</tspan>}</text>
  </g>
)

// ─── MOLECULE DRAWINGS ────────────────────────────────────────────────────────

// n-Butane: CH3-CH2-CH2-CH3
const MolButane = () => (
  <svg viewBox="0 0 340 80" style={{width:'100%',maxHeight:'80px'}}>
    <Bond x1={55} y1={40} x2={110} y2={40}/>
    <Bond x1={110} y1={40} x2={170} y2={40}/>
    <Bond x1={170} y1={40} x2={230} y2={40}/>
    <Bond x1={230} y1={40} x2={285} y2={40}/>
    <Atom x={30} y={40} label="CH₃" color={C.teal}/>
    <Atom x={110} y={40} label="CH₂" color={C.text}/>
    <Atom x={195} y={40} label="CH₂" color={C.text}/>
    <Atom x={310} y={40} label="CH₃" color={C.teal}/>
    <text x={30} y={68} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
    <text x={110} y={68} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
    <text x={195} y={68} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
    <text x={310} y={68} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C4</text>
  </svg>
)

// 2-Methylbutane
const MolIsobutane = () => (
  <svg viewBox="0 0 320 120" style={{width:'100%',maxHeight:'120px'}}>
    <Bond x1={40} y1={60} x2={110} y2={60}/>
    <Bond x1={110} y1={60} x2={180} y2={60}/>
    <Bond x1={180} y1={60} x2={250} y2={60}/>
    <Bond x1={110} y1={60} x2={110} y2={20}/>
    <Atom x={20} y={60} label="CH₃" color={C.teal}/>
    <Atom x={110} y={60} label="CH" color={C.text}/>
    <Atom x={180} y={60} label="CH₂" color={C.text}/>
    <Atom x={270} y={60} label="CH₃" color={C.teal}/>
    <Atom x={110} y={18} label="CH₃" color={C.amber}/>
    <text x={20} y={80} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
    <text x={110} y={80} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
    <text x={180} y={80} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
    <text x={270} y={80} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C4</text>
    <text x={140} y={38} fontSize="9" fill={C.amber} fontFamily="'Fira Code',monospace">methyl branch</text>
  </svg>
)

// 2-Butene (cis)
const MolButene = () => (
  <svg viewBox="0 0 340 90" style={{width:'100%',maxHeight:'90px'}}>
    <Bond x1={55} y1={45} x2={120} y2={45}/>
    <Bond x1={120} y1={45} x2={200} y2={45} double/>
    <Bond x1={200} y1={45} x2={280} y2={45}/>
    <Atom x={30} y={45} label="CH₃" color={C.teal}/>
    <Atom x={120} y={45} label="CH" color={C.text}/>
    <Atom x={200} y={45} label="CH" color={C.text}/>
    <Atom x={305} y={45} label="CH₃" color={C.teal}/>
    <text x={160} y={28} textAnchor="middle" fontSize="9" fill={C.red} fontWeight="700" fontFamily="'Fira Code',monospace">double bond</text>
    <text x={30} y={70} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
    <text x={120} y={70} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
    <text x={200} y={70} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
    <text x={305} y={70} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C4</text>
  </svg>
)

// Pent-2-yne
const MolPentyne = () => (
  <svg viewBox="0 0 380 80" style={{width:'100%',maxHeight:'80px'}}>
    <Bond x1={50} y1={40} x2={110} y2={40}/>
    <Bond x1={110} y1={40} x2={200} y2={40} triple/>
    <Bond x1={200} y1={40} x2={270} y2={40}/>
    <Bond x1={270} y1={40} x2={330} y2={40}/>
    <Atom x={28} y={40} label="CH₃" color={C.teal}/>
    <Atom x={110} y={40} label="C" color={C.text}/>
    <Atom x={200} y={40} label="C" color={C.text}/>
    <Atom x={270} y={40} label="CH₂" color={C.text}/>
    <Atom x={352} y={40} label="CH₃" color={C.teal}/>
    <text x={155} y={22} textAnchor="middle" fontSize="9" fill={C.purple} fontWeight="700" fontFamily="'Fira Code',monospace">triple bond</text>
    <text x={28} y={62} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
    <text x={110} y={62} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
    <text x={200} y={62} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
    <text x={270} y={62} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C4</text>
    <text x={352} y={62} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C5</text>
  </svg>
)

// Benzene ring (hexagon)
const BenzeneRing = ({cx=110,cy=60,r=38,substituents=[]}) => {
  const pts = Array.from({length:6},(_,i)=>{
    const a = (i*60-90)*Math.PI/180
    return {x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)}
  })
  return (
    <g>
      {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%6].x} y2={pts[(i+1)%6].y} stroke={C.text} strokeWidth="2"/>)}
      {/* Alternating double bonds inside */}
      {[0,2,4].map(i=>{
        const a1=(i*60-90)*Math.PI/180, a2=((i+1)*60-90)*Math.PI/180
        const r2=r-7
        return <line key={i} x1={cx+r2*Math.cos(a1)} y1={cy+r2*Math.sin(a1)} x2={cx+r2*Math.cos(a2)} y2={cy+r2*Math.sin(a2)} stroke={C.text} strokeWidth="1.5"/>
      })}
      {substituents.map((s,i)=>{
        const a=(s.pos*60-90)*Math.PI/180
        const x2=cx+(r+30)*Math.cos(a), y2=cy+(r+30)*Math.sin(a)
        return (
          <g key={i}>
            <line x1={cx+r*Math.cos(a)} y1={cy+r*Math.sin(a)} x2={x2} y2={y2} stroke={C.text} strokeWidth="1.8"/>
            <Atom x={x2} y={y2} label={s.label} color={s.color||C.red} size={10}/>
          </g>
        )
      })}
    </g>
  )
}

// Toluene: benzene + CH3
const MolToluene = () => (
  <svg viewBox="0 0 220 130" style={{width:'100%',maxHeight:'130px'}}>
    <BenzeneRing cx={110} cy={65} r={38} substituents={[{pos:0,label:'CH₃',color:C.teal}]}/>
    <text x={110} y={122} textAnchor="middle" fontSize="10" fill={C.muted} fontFamily="'Fira Code',monospace">methylbenzene (toluene)</text>
  </svg>
)

// 1-methyl-4-nitrobenzene (p-nitrotoluene)
const MolPNitroToluene = () => (
  <svg viewBox="0 0 220 160" style={{width:'100%',maxHeight:'160px'}}>
    <BenzeneRing cx={110} cy={80} r={38} substituents={[{pos:0,label:'CH₃',color:C.teal},{pos:3,label:'NO₂',color:C.red}]}/>
    <text x={60} y={28} fontSize="9" fill={C.teal} fontFamily="'Fira Code',monospace">C1 (methyl)</text>
    <text x={60} y={148} fontSize="9" fill={C.red} fontFamily="'Fira Code',monospace">C4 (nitro)</text>
  </svg>
)

// 1,2-dichlorobenzene (o-DCB)
const MolODCB = () => (
  <svg viewBox="0 0 220 140" style={{width:'100%',maxHeight:'140px'}}>
    <BenzeneRing cx={110} cy={70} r={38} substituents={[{pos:0,label:'Cl',color:C.blue},{pos:1,label:'Cl',color:C.blue}]}/>
    <text x={110} y={130} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">1,2-dichlorobenzene (ortho)</text>
  </svg>
)

// Cyclohexane
const MolCyclohexane = ({substituents=[]}) => {
  const cx=110, cy=65, r=40
  const pts = Array.from({length:6},(_,i)=>{
    const a=(i*60-90)*Math.PI/180
    return {x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)}
  })
  return (
    <svg viewBox="0 0 220 130" style={{width:'100%',maxHeight:'130px'}}>
      {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%6].x} y2={pts[(i+1)%6].y} stroke={C.text} strokeWidth="2.2"/>)}
      {substituents.map((s,i)=>{
        const a=(s.pos*60-90)*Math.PI/180
        const x2=cx+(r+28)*Math.cos(a), y2=cy+(r+28)*Math.sin(a)
        return (
          <g key={i}>
            <line x1={cx+r*Math.cos(a)} y1={cy+r*Math.sin(a)} x2={x2} y2={y2} stroke={C.text} strokeWidth="1.8"/>
            <Atom x={x2} y={y2} label={s.label} color={s.color||C.red} size={10}/>
          </g>
        )
      })}
      <text x={cx} y={122} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">{substituents.length===0?'cyclohexane':''}</text>
    </svg>
  )
}

// 2-methylpropanal
const MolMethylPropanal = () => (
  <svg viewBox="0 0 320 110" style={{width:'100%',maxHeight:'110px'}}>
    <Bond x1={45} y1={55} x2={115} y2={55}/>
    <Bond x1={115} y1={55} x2={185} y2={55}/>
    <Bond x1={185} y1={55} x2={255} y2={55} double/>
    <Bond x1={115} y1={55} x2={115} y2={18}/>
    <Atom x={20} y={55} label="CH₃" color={C.teal}/>
    <Atom x={115} y={55} label="CH" color={C.text}/>
    <Atom x={185} y={55} label="C" color={C.text}/>
    <Atom x={280} y={55} label="H" color={C.muted}/>
    <Atom x={115} y={15} label="CH₃" color={C.amber}/>
    <Atom x={255} y={30} label="O" color={C.red}/>
    <Bond x1={255} y1={55} x2={255} y2={40} double/>
    <text x={20} y={80} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
    <text x={115} y={80} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
    <text x={185} y={80} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
    <text x={255} y={80} textAnchor="middle" fontSize="9" fill={C.red} fontFamily="'Fira Code',monospace">CHO</text>
  </svg>
)

// Prop-2-en-1-ol (allyl alcohol)
const MolAllyAlcohol = () => (
  <svg viewBox="0 0 340 90" style={{width:'100%',maxHeight:'90px'}}>
    <Bond x1={50} y1={45} x2={120} y2={45} double/>
    <Bond x1={120} y1={45} x2={200} y2={45}/>
    <Bond x1={200} y1={45} x2={270} y2={45}/>
    <Bond x1={270} y1={45} x2={305} y2={20}/>
    <Atom x={28} y={45} label="CH₂" color={C.text}/>
    <Atom x={120} y={45} label="CH" color={C.text}/>
    <Atom x={200} y={45} label="CH₂" color={C.text}/>
    <Atom x={315} y={15} label="OH" color={C.red}/>
    <text x={28} y={68} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
    <text x={120} y={68} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
    <text x={200} y={68} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
    <text x={315} y={35} textAnchor="middle" fontSize="9" fill={C.red} fontFamily="'Fira Code',monospace">OH</text>
  </svg>
)

// Complex: 3-ethyl-2-methylpentane
const MolComplex1 = () => (
  <svg viewBox="0 0 380 130" style={{width:'100%',maxHeight:'130px'}}>
    {/* Main chain C1-C5 */}
    <Bond x1={30} y1={65} x2={100} y2={65}/>
    <Bond x1={100} y1={65} x2={175} y2={65}/>
    <Bond x1={175} y1={65} x2={250} y2={65}/>
    <Bond x1={250} y1={65} x2={325} y2={65}/>
    {/* methyl at C2 */}
    <Bond x1={100} y1={65} x2={100} y2={22}/>
    {/* ethyl at C3 */}
    <Bond x1={175} y1={65} x2={175} y2={22}/>
    <Bond x1={175} y1={22} x2={220} y2={0}/>
    <Atom x={14} y={65} label="CH₃" color={C.teal}/>
    <Atom x={100} y={65} label="CH" color={C.text}/>
    <Atom x={175} y={65} label="CH" color={C.text}/>
    <Atom x={250} y={65} label="CH₂" color={C.text}/>
    <Atom x={341} y={65} label="CH₃" color={C.teal}/>
    <Atom x={100} y={18} label="CH₃" color={C.amber} size={10}/>
    <Atom x={175} y={18} label="CH₂" color={C.purple} size={10}/>
    <Atom x={230} y={0} label="CH₃" color={C.purple} size={10}/>
    <text x={14} y={85} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
    <text x={100} y={85} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
    <text x={175} y={85} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
    <text x={250} y={85} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C4</text>
    <text x={341} y={85} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C5</text>
    <text x={100} y={115} textAnchor="middle" fontSize="8" fill={C.amber} fontFamily="'Fira Code',monospace">methyl</text>
    <text x={200} y={115} textAnchor="middle" fontSize="8" fill={C.purple} fontFamily="'Fira Code',monospace">ethyl branch</text>
  </svg>
)

// 2-chloro-2-methylpropane (t-butyl chloride)
const MolTBuCl = () => (
  <svg viewBox="0 0 240 160" style={{width:'100%',maxHeight:'160px'}}>
    {/* Central C */}
    <Bond x1={120} y1={80} x2={55} y2={80}/>
    <Bond x1={120} y1={80} x2={185} y2={80}/>
    <Bond x1={120} y1={80} x2={120} y2={22}/>
    <Bond x1={120} y1={80} x2={120} y2={138}/>
    <Atom x={120} y={80} label="C" color={C.text}/>
    <Atom x={30} y={80} label="CH₃" color={C.teal}/>
    <Atom x={210} y={80} label="CH₃" color={C.teal}/>
    <Atom x={120} y={18} label="CH₃" color={C.teal}/>
    <Atom x={120} y={152} label="Cl" color={C.blue}/>
    <text x={120} y={80} textAnchor="middle" fontSize="8" fill="white" fontFamily="'Fira Code',monospace">C2</text>
  </svg>
)

// Cyclopentanecarboxylic acid
const MolCyclopentaneAcid = () => {
  const cx=90, cy=65, r=38
  const pts = Array.from({length:5},(_,i)=>{
    const a=(i*72-90)*Math.PI/180
    return {x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)}
  })
  return (
    <svg viewBox="0 0 240 130" style={{width:'100%',maxHeight:'130px'}}>
      {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%5].x} y2={pts[(i+1)%5].y} stroke={C.text} strokeWidth="2.2"/>)}
      {/* COOH at top */}
      <Bond x1={cx} y1={cy-r} x2={cx} y2={cy-r-20}/>
      <Bond x1={cx} y1={cy-r-20} x2={cx+35} y2={cy-r-20} double/>
      <Bond x1={cx} y1={cy-r-20} x2={cx-30} y2={cy-r-32}/>
      <Atom x={cx} y={cy-r-20} label="C" color={C.text} size={10}/>
      <Atom x={cx+48} y={cy-r-20} label="O" color={C.red} size={10}/>
      <Atom x={cx-42} y={cy-r-32} label="OH" color={C.red} size={10}/>
      <text x={cx} y={cy+6} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">ring C1</text>
    </svg>
  )
}

// ─── SECTION TABS ─────────────────────────────────────────────────────────────
const TABS = [
  {id:'intro', label:'Rules'},
  {id:'alkanes', label:'Alkanes'},
  {id:'alkenes', label:'Alkenes & Alkynes'},
  {id:'fg', label:'Functional Groups'},
  {id:'cyclic', label:'Cyclic & Benzene'},
  {id:'complex', label:'JEE Advanced'},
  {id:'quiz', label:'Practice Quiz'},
]

export default function IupacSection({S}) {
  const [tab, setTab] = useState('intro')
  const [quizState, setQuizState] = useState(Array(IUPAC_QUIZ.length).fill(null))
  const [quizScore, setQuizScore] = useState(null)
  const [revealed, setRevealed] = useState({})

  function answerQuiz(qi, oi) {
    if (quizState[qi] !== null) return
    const next = [...quizState]; next[qi] = oi; setQuizState(next)
    if (next.filter(x=>x!==null).length === IUPAC_QUIZ.length)
      setQuizScore(next.filter((x,i)=>x===IUPAC_QUIZ[i].ans).length)
  }

  const tabBar = (
    <div style={{display:'flex',gap:'4px',background:'#EFEBE2',borderRadius:'10px',padding:'4px',marginBottom:'20px',flexWrap:'wrap'}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:'80px',padding:'7px 8px',borderRadius:'8px',border:'none',background:tab===t.id?'#fff':'transparent',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:'.78rem',fontWeight:600,color:tab===t.id?C.teal:C.muted,transition:'all .18s'}}>
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
        <p style={{color:'rgba(255,255,255,.85)',margin:0,fontSize:'.88rem'}}>Follow these in order every time — they never fail.</p>
      </div>
      {[
        {n:1,h:'Find the Principal Chain',p:'The longest continuous carbon chain containing the principal functional group. This decides the parent name (meth-, eth-, prop-, but-, pent-, hex-, hept-, oct-, non-, dec-).', col:'teal'},
        {n:2,h:'Find the Principal Functional Group',p:'Priority order (highest → lowest): COOH > anhydride > ester > COCl > CONH₂ > CHO > C=O > OH > SH > NH₂ > C=C > C≡C > halogens. The highest priority group gets the SUFFIX (-oic acid, -al, -one, -ol, etc.)', col:'blue'},
        {n:3,h:'Number the Chain',p:'Number from the end that gives the LOWEST locant to the principal functional group. If tied, give lowest locant to double bond, then to branch points, then alphabetical order of substituents.', col:'amber'},
        {n:4,h:'Name Substituents Alphabetically',p:'List all substituents alphabetically (ignore di-, tri- prefixes for alphabetical ordering). Put locant before each substituent name. Separate numbers with commas, numbers from letters with hyphens.', col:'red'},
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
          <thead><tr><th style={th}>Carbons</th><th style={th}>Prefix</th><th style={th}>Alkane</th><th style={th}>Alkene</th><th style={th}>Alkyne</th></tr></thead>
          <tbody>
            {[['1','meth-','methane','—','—'],['2','eth-','ethane','ethene','ethyne'],['3','prop-','propane','propene','propyne'],['4','but-','butane','butene','butyne'],['5','pent-','pentane','pentene','pentyne'],['6','hex-','hexane','hexene','hexyne'],['7','hept-','heptane','heptene','heptyne'],['8','oct-','octane','octene','octyne'],['9','non-','nonane','nonene','nonyne'],['10','dec-','decane','decene','decyne']].map((r,i)=>(
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
            {[['Carboxylic acid','-COOH','-oic acid','ethanoic acid'],['Aldehyde','-CHO','-al','ethanal'],['Ketone','-CO-','-one','propanone'],['Alcohol','-OH','-ol','ethanol'],['Amine','-NH₂','-amine','ethanamine'],['Alkene','C=C','-ene','ethene'],['Alkyne','C≡C','-yne','ethyne'],['Halide','-X','halo- (prefix)','chloroethane']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j>=1?"'Fira Code',monospace":'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{...card('amber'),marginTop:'16px'}}>
        <div style={ct('amber')}>⚠️ JEE Trap — Common Mistakes</div>
        <ul style={{marginLeft:'20px',fontSize:'.85rem',lineHeight:2.2}}>
          <li><strong>Wrong chain length:</strong> Always check ALL possible chains — students often miss the longest one</li>
          <li><strong>Wrong numbering direction:</strong> Number from the end giving LOWER locant to functional group, not just any end</li>
          <li><strong>Non-alphabetical substituents:</strong> "ethyl" comes before "methyl" (e before m), ignore multiplying prefixes (di, tri)</li>
          <li><strong>Forgetting the locant:</strong> "2-methylbutane" not "methylbutane"</li>
          <li><strong>CHO carbon counting:</strong> The CHO carbon IS C1 — it's part of the chain</li>
        </ul>
      </div>
    </div>
  )

  // ── TAB: ALKANES ─────────────────────────────────────────────────────────
  const TabAlkanes = () => (
    <div>
      <div style={card('teal')}>
        <div style={ct('teal')}>📌 Alkanes — Saturated Hydrocarbons (CₙH₂ₙ₊₂)</div>
        <p style={{fontSize:'.87rem',margin:0}}>All single bonds. Parent name = longest chain + "-ane". Branches are alkyl groups (methyl, ethyl, propyl, isopropyl, butyl, isobutyl, sec-butyl, tert-butyl).</p>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 1 — n-Butane</h3>
      <div style={g2}>
        <div style={ibox}>
          <div style={iboxT}>STRUCTURE</div>
          <MolButane/>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={card('teal')}>
            <div style={ct('teal')}>Name: butane</div>
            <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2}}>
              <li>Longest chain = 4C</li>
              <li>No branches</li>
              <li>Parent = but- + -ane</li>
            </ul>
          </div>
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 2 — 2-Methylbutane (JEE: don't call it isopentane!)</h3>
      <div style={g2}>
        <div style={ibox}>
          <div style={iboxT}>STRUCTURE</div>
          <MolIsobutane/>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {[{h:'Step 1: Find longest chain',p:'Longest = 4C (C1-C2-C3-C4). The branch methyl is NOT counted in main chain.',col:'teal'},{h:'Step 2: Number the chain',p:'Number from left: branch at C2. From right: branch at C3. Lower = C2. So number left to right.',col:'blue'},{h:'Step 3: Name',p:'4C chain = but. Branch = methyl at C2. Name = 2-methylbutane.',col:'amber'}].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}>
              <div style={ct(s.col)}>{s.h}</div>
              <p style={{margin:0,fontSize:'.83rem'}}>{s.p}</p>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Common Alkyl Groups — Memorize These</h3>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Name</th><th style={th}>Structure</th><th style={th}>Abbreviation</th><th style={th}>JEE Note</th></tr></thead>
          <tbody>
            {[['methyl','CH₃-','Me','Most common branch'],['ethyl','CH₃CH₂-','Et','Common in JEE problems'],['n-propyl','CH₃CH₂CH₂-','n-Pr','Straight chain propyl'],['isopropyl','(CH₃)₂CH-','iPr','Branched at first C'],['n-butyl','CH₃(CH₂)₂CH₂-','n-Bu','Straight chain butyl'],['isobutyl','(CH₃)₂CHCH₂-','iBu','Methyl branches at C2'],['sec-butyl','CH₃CH₂CH(CH₃)-','s-Bu','Attached at C2'],['tert-butyl','(CH₃)₃C-','t-Bu','Most branched — JEE favourite!']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===1||j===2?"'Fira Code',monospace":'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── TAB: ALKENES & ALKYNES ───────────────────────────────────────────────
  const TabUnsaturated = () => (
    <div>
      <div style={g2}>
        <div style={card('blue')}>
          <div style={ct('blue')}>Alkenes (CₙH₂ₙ) — suffix "-ene"</div>
          <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2}}>
            <li>Contains C=C double bond</li>
            <li>Locant of double bond = lower C of C=C</li>
            <li>Principal chain must INCLUDE the double bond</li>
            <li>Double bond carbon gets lowest possible number</li>
          </ul>
        </div>
        <div style={card('purple')}>
          <div style={ct('purple')}>Alkynes (CₙH₂ₙ₋₂) — suffix "-yne"</div>
          <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2}}>
            <li>Contains C≡C triple bond</li>
            <li>Same numbering rule as alkenes</li>
            <li>If both C=C and C≡C: "-en-yne" suffix</li>
            <li>C=C gets lower locant over C≡C when tied</li>
          </ul>
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 1 — But-2-ene</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>STRUCTURE</div><MolButene/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[{h:'Chain = 4C = but',p:'Double bond between C2 and C3',col:'blue'},{h:'Locant = 2 (lower C of C=C)',p:'Number from end giving lower locant to double bond → C2',col:'teal'},{h:'Name = but-2-ene',p:'IUPAC 2013 format: locant goes right before -ene',col:'amber'}].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}>
              <div style={ct(s.col)}>{s.h}</div>
              <p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 2 — Pent-2-yne</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>STRUCTURE</div><MolPentyne/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[{h:'Chain = 5C = pent',p:'Triple bond between C2 and C3',col:'purple'},{h:'Number from right end',p:'Right end gives triple bond at C2. Left gives C3. So C2 wins.',col:'teal'},{h:'Name = pent-2-yne',p:'5C chain, triple bond starting at C2',col:'amber'}].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}>
              <div style={ct(s.col)}>{s.h}</div>
              <p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 3 — Prop-2-en-1-ol (Allyl Alcohol)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>STRUCTURE — two functional groups!</div><MolAllyAlcohol/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={card('red')}>
            <div style={ct('red')}>Priority: OH beats C=C</div>
            <p style={{margin:0,fontSize:'.83rem'}}>OH is principal group → gets suffix "-ol". C=C gets locant in name. Number from OH end (OH at C1, double bond at C2-C3).</p>
          </div>
          <div style={card('teal')}>
            <div style={ct('teal')}>Name = prop-2-en-1-ol</div>
            <p style={{margin:0,fontSize:'.83rem'}}>3C (prop), double bond at C2 (-2-en-), OH at C1 (-1-ol). Common name: allyl alcohol. JEE often tests this naming.</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ── TAB: FUNCTIONAL GROUPS ───────────────────────────────────────────────
  const TabFG = () => (
    <div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'0 0 16px'}}>Aldehydes — The CHO Group (Always C1!)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>2-methylpropanal</div><MolMethylPropanal/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={card('red')}>
            <div style={ct('red')}>Key Rule: CHO = C1 always</div>
            <p style={{margin:0,fontSize:'.83rem'}}>The carbonyl carbon in aldehyde is ALWAYS C1. You never write "1-" because it's understood. Just write the locants for branches.</p>
          </div>
          <div style={card('teal')}>
            <div style={ct('teal')}>Naming: 2-methylpropanal</div>
            <p style={{margin:0,fontSize:'.83rem'}}>3C chain (propan), CHO at C1, methyl branch at C2 → 2-methylpropanal. Notice: no "1" for CHO.</p>
          </div>
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>2-chloro-2-methylpropane (t-Butyl Chloride)</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Structure</div><MolTBuCl/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={card('blue')}>
            <div style={ct('blue')}>Haloalkanes: halogen = prefix</div>
            <p style={{margin:0,fontSize:'.83rem'}}>Halogens are ALWAYS prefixes: fluoro-, chloro-, bromo-, iodo-. They are NOT the principal functional group. Number to give lowest locant to the halogen IF no other group.</p>
          </div>
          <div style={card('amber')}>
            <div style={ct('amber')}>Name: 2-chloro-2-methylpropane</div>
            <p style={{margin:0,fontSize:'.83rem'}}>3C principal chain (propane). Cl at C2, CH₃ at C2. Both at same carbon. Name: 2-chloro-2-methylpropane. Common: tert-butyl chloride (not IUPAC).</p>
          </div>
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Functional Group Priority — The Most Tested JEE Concept</h3>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Priority</th><th style={th}>Group</th><th style={th}>Suffix</th><th style={th}>As Prefix (when not principal)</th></tr></thead>
          <tbody>
            {[['1 (highest)','–COOH','-oic acid','carboxy-'],['2','–SO₃H','-sulfonic acid','sulfo-'],['3','–COOR','-oate','alkoxycarbonyl-'],['4','–COCl','-oyl chloride','chlorocarbonyl-'],['5','–CONH₂','-amide','carbamoyl-'],['6','–CHO','-al','formyl-'],['7','–C=O (ketone)','-one','oxo-'],['8','–OH','-ol','hydroxy-'],['9','–NH₂','-amine','amino-'],['10','–C=C','–ene','—'],['11','–C≡C','–yne','—'],['12 (lowest)','–X (halogens)','—','halo-']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontWeight:j===0?700:400,fontFamily:j>=1?"'Fira Code',monospace":'inherit',color:i===0?C.red:i<=2?C.amber:i<=4?C.teal:i<=6?C.blue:C.text}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── TAB: CYCLIC & BENZENE ─────────────────────────────────────────────────
  const TabCyclic = () => (
    <div>
      <div style={card('teal')}>
        <div style={ct('teal')}>📌 Cyclic Compounds — Prefix "cyclo-"</div>
        <p style={{fontSize:'.87rem',margin:0}}>Ring compounds get "cyclo-" before the parent name. Count carbons in the ring. Number ring to give lowest locant set to substituents.</p>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Cycloalkane Naming</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'16px'}}>
        {[{label:'cyclopropane (3C)',comp:<svg viewBox="0 0 120 100" style={{width:'100%',maxHeight:'80px'}}><polygon points="60,15 100,75 20,75" fill="none" stroke={C.text} strokeWidth="2.5"/><text x="60" y="95" textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C₃H₆</text></svg>},
          {label:'cyclobutane (4C)',comp:<svg viewBox="0 0 120 100" style={{width:'100%',maxHeight:'80px'}}><polygon points="25,20 95,20 95,80 25,80" fill="none" stroke={C.text} strokeWidth="2.5"/><text x="60" y="96" textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C₄H₈</text></svg>},
          {label:'cyclopentane (5C)',comp:<svg viewBox="0 0 120 110" style={{width:'100%',maxHeight:'90px'}}>
            <polygon points="60,12 102,42 86,88 34,88 18,42" fill="none" stroke={C.text} strokeWidth="2.5"/>
            <text x="60" y="105" textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'Fira Code',monospace">C₅H₁₀</text>
          </svg>}
        ].map((m,i)=>(
          <div key={i} style={ibox}>
            <div style={iboxT}>{m.label}</div>
            {m.comp}
          </div>
        ))}
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Cyclopentanecarboxylic Acid — Ring + COOH</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>STRUCTURE</div><MolCyclopentaneAcid/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={card('amber')}>
            <div style={ct('amber')}>COOH attached to ring → "carboxylic acid" suffix</div>
            <p style={{margin:0,fontSize:'.83rem'}}>When -COOH is attached directly to a ring carbon, the ring C is C1 (not numbered separately). Name = cyclopentanecarboxylic acid.</p>
          </div>
          <div style={card('red')}>
            <div style={ct('red')}>Do NOT say cyclopentanoic acid!</div>
            <p style={{margin:0,fontSize:'.83rem'}}>That would imply COOH is part of the ring. "Carboxylic acid" suffix = COOH is a substituent hanging off the ring.</p>
          </div>
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Benzene Derivatives — Most JEE Questions Come From Here!</h3>
      <div style={card('blue')}>
        <div style={ct('blue')}>Benzene Naming Rules</div>
        <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2.1}}>
          <li>Monosubstituted: just name the substituent + benzene. e.g., chlorobenzene, nitrobenzene</li>
          <li>Retained names (IUPAC accepts): toluene (methylbenzene), aniline (aminobenzene), phenol (hydroxybenzene), benzaldehyde, benzoic acid, styrene (vinylbenzene)</li>
          <li>Disubstituted: use 1,2- (ortho), 1,3- (meta), 1,4- (para) OR just the numbers</li>
          <li>Trisubstituted and more: always use numbers, give lowest locant set</li>
          <li>When benzene is a substituent: it's called phenyl- (C₆H₅-)</li>
        </ul>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'16px'}}>
        {[{label:'methylbenzene (toluene)',comp:<MolToluene/>},
          {label:'1-methyl-4-nitrobenzene',comp:<MolPNitroToluene/>},
          {label:'1,2-dichlorobenzene (o-DCB)',comp:<MolODCB/>}
        ].map((m,i)=>(
          <div key={i} style={ibox}>
            <div style={iboxT}>{m.label}</div>
            {m.comp}
          </div>
        ))}
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Common Name</th><th style={th}>IUPAC Name</th><th style={th}>Structure</th><th style={th}>JEE Status</th></tr></thead>
          <tbody>
            {[['Toluene','methylbenzene','C₆H₅-CH₃','Both names accepted'],['Aniline','aminobenzene / benzenamine','C₆H₅-NH₂','Both accepted'],['Phenol','hydroxybenzene','C₆H₅-OH','Both accepted'],['Benzaldehyde','benzene carbaldehyde','C₆H₅-CHO','Common name preferred'],['Benzoic acid','benzenecarboxylic acid','C₆H₅-COOH','Both accepted'],['Styrene','ethenylbenzene','C₆H₅-CH=CH₂','Common used in JEE'],['o-Xylene','1,2-dimethylbenzene','1,2-(CH₃)₂C₆H₄','IUPAC preferred'],['Cumene','isopropylbenzene','C₆H₅-CH(CH₃)₂','JEE: cumene hydroperoxide process']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===2?"'Fira Code',monospace":'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── TAB: JEE ADVANCED ────────────────────────────────────────────────────
  const TabComplex = () => (
    <div>
      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:"'Playfair Display',serif"}}>JEE Advanced Level — Complex Molecules</h3>
        <p style={{color:'rgba(255,255,255,.85)',margin:0,fontSize:'.88rem'}}>These are the type of structures that appear in JEE Advanced. Master these and you handle any naming question.</p>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'20px 0 12px'}}>Example 1 — 3-Ethyl-2-methylpentane</h3>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>STRUCTURE — 2 different branches</div><MolComplex1/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[
            {h:'Step 1: Longest chain = 5C (pentane)',p:'The main chain goes C1-C2-C3-C4-C5. The methyl and ethyl groups hang off it.',col:'teal'},
            {h:'Step 2: Number to give lowest set',p:'From left: methyl at C2, ethyl at C3 → set {2,3}. From right: set {3,4}. Choose {2,3} → number left to right.',col:'blue'},
            {h:'Step 3: Name alphabetically',p:'Ethyl (e) comes before methyl (m) alphabetically. Write: 3-ethyl first, then 2-methyl.',col:'amber'},
            {h:'Final: 3-ethyl-2-methylpentane',p:'NOT "2-methyl-3-ethylpentane" — alphabetical order is mandatory in IUPAC.',col:'red'},
          ].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}>
              <div style={ct(s.col)}>{s.h}</div>
              <p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Example 2 — Multiple Functional Groups</h3>
      <div style={ibox}>
        <div style={iboxT}>4-hydroxy-3-methylbutan-2-one — TWO functional groups</div>
        <svg viewBox="0 0 440 110" style={{width:'100%',maxHeight:'110px'}}>
          <Bond x1={30} y1={55} x2={90} y2={55}/>
          <Bond x1={90} y1={55} x2={165} y2={55} double/>
          <Bond x1={165} y1={55} x2={240} y2={55}/>
          <Bond x1={240} y1={55} x2={310} y2={55}/>
          <Bond x1={240} y1={55} x2={240} y2={18}/>
          <Bond x1={310} y1={55} x2={355} y2={30}/>
          <Atom x={14} y={55} label="CH₃" color={C.teal}/>
          <Atom x={90} y={55} label="C" color={C.text}/>
          <Atom x={165} y={55} label="CH" color={C.text}/>
          <Atom x={240} y={55} label="CH₂" color={C.text}/>  
          <Atom x={310} y={55} label="C" color={C.text}/>
          <Atom x={90} y={30} label="O" color={C.red}/>
          <Bond x1={90} y1={55} x2={90} y2={35} double/>
          <Atom x={240} y={14} label="OH" color={C.red}/>
          <Atom x={370} y={25} label="?" color={C.muted}/>
          <text x={14} y={78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
          <text x={90} y={78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
          <text x={165} y={78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C3</text>
          <text x={240} y={78} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C4</text>
          <text x={90} y={20} textAnchor="middle" fontSize="8" fill={C.red} fontFamily="'Fira Code',monospace">ketone (C=O)</text>
          <text x={260} y={12} fontSize="8" fill={C.red} fontFamily="'Fira Code',monospace">OH (alcohol)</text>
        </svg>
      </div>
      {[
        {h:'Ketone (C=O) beats Alcohol (OH) in priority',p:'Ketone gets suffix "-one". Alcohol becomes prefix "hydroxy-". Main chain = 4C (butane). Ketone at C2 → butan-2-one.',col:'red'},
        {h:'Number from ketone end',p:'Ketone at C2 (not C3 from other end). So C1=CH₃, C2=C=O, C3=CH(CH₃?), C4=CH₂OH.',col:'blue'},
        {h:'Name: 4-hydroxy-3-methylbutan-2-one',p:'ketone at C2 (-2-one), methyl branch at C3 (3-methyl-), OH at C4 (4-hydroxy-). Alphabetical: hydroxy before methyl.',col:'teal'},
      ].map((s,i)=>(
        <div key={i} style={stepStyle}>
          <div style={stepNum(s.col)}>{i+1}</div>
          <div style={{flex:1}}>
            <div style={{...card(s.col),marginBottom:0}}>
              <div style={ct(s.col)}>{s.h}</div>
              <p style={{margin:0,fontSize:'.83rem'}}>{s.p}</p>
            </div>
          </div>
        </div>
      ))}

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>Example 3 — Benzene + Complex Substituent</h3>
      <div style={ibox}>
        <div style={iboxT}>2-phenylpropanoic acid (ibuprofen backbone)</div>
        <svg viewBox="0 0 400 140" style={{width:'100%',maxHeight:'140px'}}>
          <BenzeneRing cx={80} cy={70} r={40}/>
          <Bond x1={80} y1={30} x2={160} y2={30}/>
          <Bond x1={160} y1={30} x2={230} y2={30}/>
          <Bond x1={230} y1={30} x2={295} y2={30} double/>
          <Bond x1={160} y1={30} x2={160} y2={0}/>
          <Atom x={160} y={30} label="CH" color={C.text}/>
          <Atom x={230} y={30} label="C" color={C.text}/>
          <Atom x={310} y={30} label="OH" color={C.red}/>
          <Atom x={160} y={0} label="CH₃" color={C.amber}/>
          <Atom x={295} y={8} label="O" color={C.red}/>
          <Bond x1={295} y1={30} x2={295} y2={12} double/>
          <text x={80} y={125} textAnchor="middle" fontSize="9" fill={C.blue} fontFamily="'Fira Code',monospace">phenyl group</text>
          <text x={230} y={50} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C1</text>
          <text x={160} y={50} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="'Fira Code',monospace">C2</text>
          <text x={160} y={130} textAnchor="middle" fontSize="9" fill={C.amber} fontFamily="'Fira Code',monospace">methyl at C2</text>
        </svg>
        <div style={{marginTop:'12px',background:'#E6F4F2',borderRadius:'8px',padding:'12px',fontSize:'.83rem',color:C.teal,borderLeft:`3px solid ${C.teal}`}}>
          <strong>Name: 2-phenylpropanoic acid</strong><br/>
          Principal chain = 3C with COOH (propanoic acid). Phenyl group at C2 → 2-phenyl. Full name = 2-phenylpropanoic acid. (Ibuprofen is a derivative of this!)
        </div>
      </div>

      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',margin:'24px 0 12px'}}>JEE Advanced Traps — The Examiner's Favourite Tricks</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
        {[
          {h:'Wrong longest chain',p:'Draw all possible chains. A chain going through a branch might be longer. Students often pick the "obvious" chain which is wrong.',col:'red'},
          {h:'Alphabetical order with di/tri',p:'"Diethyl" is alphabetized as "e" (ethyl), not "d". So diethyl comes before methyl. di/tri/sec/tert are IGNORED for alphabetizing.',col:'amber'},
          {h:'Principal chain must include FG',p:'If COOH is present, the principal chain MUST include the COOH carbon. You cannot choose a longer chain that excludes it.',col:'blue'},
          {h:'Benzene numbering direction',p:'Number the benzene ring in the direction (clockwise or anticlockwise) that gives the lowest locant set to substituents.',col:'teal'},
          {h:'Cyclic vs acyclic priority',p:'When a ring and a chain compete: choose whichever has MORE carbons as the principal chain. If equal, ring wins.',col:'purple'},
          {h:'Double bond locant in new IUPAC',p:'New IUPAC 2013: but-2-ene (locant before suffix), not 2-butene. JEE follows new IUPAC. Both may appear in options.',col:'red'},
        ].map((s,i)=>(
          <div key={i} style={{...card(s.col),marginBottom:0}}>
            <div style={ct(s.col)}>⚠️ {s.h}</div>
            <p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  )

  // ── TAB: QUIZ ─────────────────────────────────────────────────────────────
  const TabQuiz = () => (
    <div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',margin:'0 0 6px'}}>IUPAC Nomenclature — 10 JEE Questions</h3>
      <p style={{color:C.muted,fontSize:'.85rem',marginBottom:'20px'}}>Answers revealed immediately with step-by-step explanation.</p>

      {quizScore !== null && (
        <div style={{background:quizScore>=7?C.tealL:C.redL,border:`2px solid ${quizScore>=7?C.teal:C.red}`,borderRadius:'12px',padding:'20px',marginBottom:'20px',textAlign:'center'}}>
          <div style={{fontSize:'2.2rem',fontWeight:700,color:quizScore>=7?C.teal:C.red,fontFamily:"'Playfair Display',serif"}}>{quizScore}/10</div>
          <div style={{marginTop:'8px',fontWeight:600}}>{quizScore>=8?'Excellent! IUPAC mastered!':quizScore>=6?'Good! Review the mistakes.':'Keep practicing — re-read the rules tab.'}</div>
          <button onClick={()=>{setQuizState(Array(IUPAC_QUIZ.length).fill(null));setQuizScore(null)}} style={{marginTop:'12px',background:C.teal,color:'#fff',border:'none',borderRadius:'8px',padding:'10px 22px',fontWeight:600,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Retake</button>
        </div>
      )}

      {IUPAC_QUIZ.map((q,qi)=>(
        <div key={qi} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:'12px',padding:'20px',marginBottom:'16px'}}>
          <p style={{fontWeight:600,marginBottom:'12px',fontSize:'.9rem'}}>Q{qi+1}. {q.q}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {q.opts.map((opt,oi)=>{
              const answered = quizState[qi] !== null
              const isCorrect = oi === q.ans
              const isChosen = quizState[qi] === oi
              let bg='#fff',border=`2px solid ${C.border}`,color=C.text
              if(answered && isCorrect){bg=C.tealL;border=`2px solid ${C.teal}`;color=C.teal}
              if(answered && isChosen && !isCorrect){bg=C.redL;border=`2px solid ${C.red}`;color=C.red}
              return (
                <button key={oi} onClick={()=>answerQuiz(qi,oi)} disabled={answered} style={{padding:'10px 12px',border,borderRadius:'8px',cursor:answered?'default':'pointer',fontSize:'.83rem',background:bg,color,textAlign:'left',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:answered&&isCorrect?700:400,transition:'all .18s'}}>
                  {String.fromCharCode(65+oi)}. <span style={{fontFamily:"'Fira Code',monospace"}}>{opt}</span>
                </button>
              )
            })}
          </div>
          {quizState[qi] !== null && (
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
      <span style={tag('j')}>JEE Core</span><span style={tag('i')}>High Weightage</span><span style={tag('p')}>New Section</span>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:C.text,marginBottom:'6px',lineHeight:1.2}}>IUPAC Nomenclature</h1>
      <p style={{color:C.muted,fontSize:'.92rem',marginBottom:'28px'}}>From basic alkanes to JEE Advanced level — structures, names, and every rule you need.</p>
      {tabBar}
      {tabContent[tab]}
    </div>
  )
}
