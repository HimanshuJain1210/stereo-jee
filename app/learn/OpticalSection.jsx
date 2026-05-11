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
const stepRow={display:'flex',gap:'12px',marginBottom:'12px'}
const stepN=(col='teal')=>({minWidth:'26px',height:'26px',background:C[col],color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.78rem',flexShrink:0,marginTop:'2px'})

// ─── SVG PRIMITIVES ───────────────────────────────────────────────────────────
const A=({x,y,t,col=C.text,sz=11,anchor='middle'})=>{
  const w=t.length*sz*0.63+6
  return <g>
    <rect x={x-(anchor==='middle'?w/2:anchor==='start'?0:-w)} y={y-sz*0.8} width={w} height={sz*1.6} fill="white"/>
    <text x={x} y={y+sz*0.38} textAnchor={anchor} fontSize={sz} fill={col} fontWeight="700" fontFamily={F}>{t}</text>
  </g>
}
const B=({x1,y1,x2,y2,col=C.text})=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="2"/>
const WS=({x1,y1,x2,y2,col=C.text})=>{
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ox=(-dy/len)*5,oy=(dx/len)*5
  return <polygon points={`${x1},${y1} ${x2+ox},${y2+oy} ${x2-ox},${y2-oy}`} fill={col}/>
}
const WD=({x1,y1,x2,y2,col=C.text})=>{
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)
  if(len<1) return null
  const ux=dx/len,uy=dy/len,ox=-uy,oy=ux
  return <g>{Array.from({length:7},(_,i)=>{
    const t=(i+1)/8,w=t*5
    return <line key={i} x1={x1+dx*t+ox*w} y1={y1+dy*t+oy*w} x2={x1+dx*t-ox*w} y2={y1+dy*t-oy*w} stroke={col} strokeWidth="1.5"/>
  })}</g>
}
const MirrorLine=({x,y1=8,y2=195})=>(
  <g>
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.amber} strokeWidth="2.5" strokeDasharray="8,5"/>
    <text x={x} y={y1-2} textAnchor="middle" fontSize="8" fill={C.amber} fontFamily={F} fontWeight="700">mirror</text>
  </g>
)

// ─── CHIRAL MOLECULE DRAWINGS ─────────────────────────────────────────────────
// Each molecule: central C with exactly 4 bonds
// Plain bonds: in plane of paper
// WS (solid wedge): toward viewer
// WD (dashed wedge): away from viewer

// Lactic acid — (S) config: OH wedge up-left, H dash down-right
const LacticS=()=>(
  <svg viewBox="0 0 220 205" style={{width:'100%',maxHeight:'190px'}}>
    {/* Central C* at (110,100) */}
    {/* COOH — plain bond left */}
    <B x1={110} y1={100} x2={48} y2={100}/>
    <A x={32} y={100} t="COOH" col={C.red} sz={10}/>
    {/* CH3 — plain bond right */}
    <B x1={110} y1={100} x2={172} y2={100}/>
    <A x={188} y={100} t="CH₃" col={C.teal} sz={10}/>
    {/* OH — solid wedge toward viewer (up-left direction) */}
    <WS x1={110} y1={100} x2={82} y2={52} col={C.red}/>
    <A x={76} y={42} t="OH" col={C.red} sz={11}/>
    <text x={76} y={30} textAnchor="middle" fontSize="7" fill={C.teal} fontFamily={F}>toward you</text>
    {/* H — dashed wedge away from viewer (down-right direction) */}
    <WD x1={110} y1={100} x2={138} y2={150} col={C.muted}/>
    <A x={142} y={160} t="H" col={C.muted} sz={11}/>
    <text x={142} y={172} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>away from you</text>
    {/* Chiral center marker */}
    <circle cx={110} cy={100} r="5" fill={C.purple}/>
    <text x={122} y={96} fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">C*</text>
    <text x={110} y={192} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(S)-(+)-Lactic acid</text>
  </svg>
)

// Lactic acid — (R) config: mirror image, OH and H positions swapped
const LacticR=()=>(
  <svg viewBox="0 0 220 205" style={{width:'100%',maxHeight:'190px'}}>
    <B x1={110} y1={100} x2={48} y2={100}/>
    <A x={32} y={100} t="CH₃" col={C.teal} sz={10}/>
    <B x1={110} y1={100} x2={172} y2={100}/>
    <A x={188} y={100} t="COOH" col={C.red} sz={10}/>
    {/* OH now solid wedge up-RIGHT (mirror of S) */}
    <WS x1={110} y1={100} x2={138} y2={52} col={C.red}/>
    <A x={144} y={42} t="OH" col={C.red} sz={11}/>
    <text x={144} y={30} textAnchor="middle" fontSize="7" fill={C.teal} fontFamily={F}>toward you</text>
    {/* H now dashed wedge down-LEFT */}
    <WD x1={110} y1={100} x2={82} y2={150} col={C.muted}/>
    <A x={76} y={160} t="H" col={C.muted} sz={11}/>
    <text x={76} y={172} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>away from you</text>
    <circle cx={110} cy={100} r="5" fill={C.purple}/>
    <text x={122} y={96} fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">C*</text>
    <text x={110} y={192} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(R)-(−)-Lactic acid</text>
  </svg>
)

// Alanine (S) config — amino acid
const AlanineS=()=>(
  <svg viewBox="0 0 220 200" style={{width:'100%',maxHeight:'188px'}}>
    <B x1={110} y1={100} x2={48} y2={100}/>
    <A x={32} y={100} t="COOH" col={C.red} sz={10}/>
    <B x1={110} y1={100} x2={172} y2={100}/>
    <A x={188} y={100} t="CH₃" col={C.teal} sz={10}/>
    <WS x1={110} y1={100} x2={110} y2={44} col={C.blue}/>
    <A x={110} y={34} t="NH₂" col={C.blue} sz={10}/>
    <text x={110} y={22} textAnchor="middle" fontSize="7" fill={C.teal} fontFamily={F}>toward you</text>
    <WD x1={110} y1={100} x2={110} y2={156} col={C.muted}/>
    <A x={110} y={166} t="H" col={C.muted} sz={11}/>
    <text x={110} y={178} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>away</text>
    <circle cx={110} cy={100} r="5" fill={C.purple}/>
    <text x={122} y={96} fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">C*</text>
    <text x={110} y={193} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(S)-Alanine (L-Alanine)</text>
  </svg>
)

// Glyceraldehyde (R) — D-glyceraldehyde
const GlyceraldehydeR=()=>(
  <svg viewBox="0 0 220 200" style={{width:'100%',maxHeight:'188px'}}>
    <B x1={110} y1={100} x2={48} y2={100}/>
    <A x={32} y={100} t="CHO" col={C.red} sz={10}/>
    <B x1={110} y1={100} x2={172} y2={100}/>
    <A x={190} y={100} t="CH₂OH" col={C.teal} sz={10}/>
    {/* OH solid wedge toward right-up */}
    <WS x1={110} y1={100} x2={138} y2={52} col={C.red}/>
    <A x={146} y={42} t="OH" col={C.red} sz={11}/>
    <text x={146} y={30} textAnchor="middle" fontSize="7" fill={C.teal} fontFamily={F}>toward you</text>
    {/* H dashed wedge away left-down */}
    <WD x1={110} y1={100} x2={82} y2={148} col={C.muted}/>
    <A x={74} y={158} t="H" col={C.muted} sz={11}/>
    <circle cx={110} cy={100} r="5" fill={C.purple}/>
    <text x={122} y={96} fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">C*</text>
    <text x={110} y={185} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(R)-(+)-Glyceraldehyde</text>
    <text x={110} y={197} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>(D-glyceraldehyde)</text>
  </svg>
)

// 2-Bromobutane (R)
const BromobutaneR=()=>(
  <svg viewBox="0 0 230 200" style={{width:'100%',maxHeight:'188px'}}>
    <B x1={110} y1={100} x2={44} y2={100}/>
    <A x={28} y={100} t="CH₃" col={C.teal} sz={10}/>
    <B x1={110} y1={100} x2={176} y2={100}/>
    <A x={196} y={100} t="C₂H₅" col={C.teal} sz={10}/>
    <WS x1={110} y1={100} x2={110} y2={44} col={C.red}/>
    <A x={110} y={34} t="Br" col={C.red} sz={12}/>
    <WD x1={110} y1={100} x2={110} y2={156} col={C.muted}/>
    <A x={110} y={166} t="H" col={C.muted} sz={11}/>
    <circle cx={110} cy={100} r="5" fill={C.purple}/>
    <text x={122} y={96} fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">C*</text>
    <text x={110} y={188} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(R)-2-Bromobutane</text>
  </svg>
)

// Mandelic acid (R) — Ph-CH(OH)-COOH
const MandelicR=()=>(
  <svg viewBox="0 0 240 210" style={{width:'100%',maxHeight:'198px'}}>
    {/* Benzene ring on left */}
    {(()=>{
      const bx=46,by=100,br=30
      const pts=Array.from({length:6},(_,i)=>{const a=(i*60-90)*Math.PI/180;return{x:bx+br*Math.cos(a),y:by+br*Math.sin(a)}})
      return <>
        {pts.map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%6].x} y2={pts[(i+1)%6].y} stroke={C.text} strokeWidth="2"/>)}
        {[0,2,4].map(i=>{const a1=(i*60-90)*Math.PI/180,a2=((i+1)*60-90)*Math.PI/180,r2=br-7;return<line key={i} x1={bx+r2*Math.cos(a1)} y1={by+r2*Math.sin(a1)} x2={bx+r2*Math.cos(a2)} y2={by+r2*Math.sin(a2)} stroke={C.text} strokeWidth="1.5"/>})}
      </>
    })()}
    {/* Bond from ring to C* */}
    <B x1={76} y1={100} x2={110} y2={100}/>
    <B x1={110} y1={100} x2={172} y2={100}/>
    <A x={190} y={100} t="COOH" col={C.red} sz={10}/>
    <WS x1={110} y1={100} x2={110} y2={44} col={C.red}/>
    <A x={110} y={34} t="OH" col={C.red} sz={11}/>
    <WD x1={110} y1={100} x2={110} y2={156} col={C.muted}/>
    <A x={110} y={166} t="H" col={C.muted} sz={11}/>
    <circle cx={110} cy={100} r="5" fill={C.purple}/>
    <text x={122} y={96} fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">C*</text>
    <text x={46} y={148} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>Ph</text>
    <text x={120} y={192} textAnchor="middle" fontSize="10" fill={C.purple} fontFamily={F} fontWeight="700">(R)-Mandelic acid</text>
    <text x={120} y={204} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>Ph-CH*(OH)-COOH</text>
  </svg>
)

// Meso-2,3-dibromobutane with POS
const MesoDBB=()=>(
  <svg viewBox="0 0 380 215" style={{width:'100%',maxHeight:'205px'}}>
    {/* CH3 left */}
    <B x1={30} y1={108} x2={80} y2={108}/>
    <A x={16} y={108} t="CH₃" col={C.teal} sz={10}/>
    {/* C2 — R config: Br solid wedge up, H dashed wedge right-down */}
    <circle cx={80} cy={108} r="5" fill={C.blue}/>
    <text x={80} y={124} textAnchor="middle" fontSize="7" fill={C.blue} fontFamily={F}>C2(R)</text>
    <WS x1={80} y1={108} x2={80} y2={55} col={C.red}/>
    <A x={80} y={44} t="Br" col={C.red} sz={11}/>
    <text x={80} y={32} textAnchor="middle" fontSize="7" fill={C.teal} fontFamily={F}>toward</text>
    <WD x1={80} y1={108} x2={46} y2={148} col={C.muted}/>
    <A x={38} y={158} t="H" col={C.muted} sz={10}/>
    {/* C2-C3 bond */}
    <B x1={80} y1={108} x2={188} y2={108}/>
    {/* C3 — S config: Br dashed wedge up, H solid wedge left-down */}
    <circle cx={188} cy={108} r="5" fill={C.blue}/>
    <text x={188} y={124} textAnchor="middle" fontSize="7" fill={C.blue} fontFamily={F}>C3(S)</text>
    <WD x1={188} y1={108} x2={188} y2={55} col={C.red}/>
    <A x={188} y={44} t="Br" col={C.red} sz={11}/>
    <text x={188} y={32} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>away</text>
    <WS x1={188} y1={108} x2={222} y2={148} col={C.muted}/>
    <A x={230} y={158} t="H" col={C.muted} sz={10}/>
    {/* C3-CH3 */}
    <B x1={188} y1={108} x2={238} y2={108}/>
    <A x={254} y={108} t="CH₃" col={C.teal} sz={10}/>
    {/* POS vertical dashed line */}
    <line x1={134} y1={18} x2={134} y2={198} stroke={C.amber} strokeWidth="2.5" strokeDasharray="8,5"/>
    <rect x={90} y={14} width="88" height="18" rx="5" fill={C.amberL} stroke={C.amber} strokeWidth="1.5"/>
    <text x={134} y={27} textAnchor="middle" fontSize="8" fill={C.amber} fontFamily={F} fontWeight="700">Plane of Symmetry</text>
    {/* Labels for halves */}
    <rect x={16} y={170} width="106" height="30" rx="6" fill={C.blueL} stroke={C.blue} strokeWidth="1.2"/>
    <text x={69} y={184} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F} fontWeight="700">Left half: 2R</text>
    <text x={69} y={196} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>rotates light (+)</text>
    <rect x={146} y={170} width="108" height="30" rx="6" fill={C.redL} stroke={C.red} strokeWidth="1.2"/>
    <text x={200} y={184} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F} fontWeight="700">Right half: 3S</text>
    <text x={200} y={196} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F}>rotates light (−)</text>
    {/* MESO box */}
    <rect x={278} y={78} width="96" height="50" rx="8" fill={C.tealL} stroke={C.teal} strokeWidth="2"/>
    <text x={326} y={100} textAnchor="middle" fontSize="13" fill={C.teal} fontFamily={PD} fontWeight="700">MESO</text>
    <text x={326} y={115} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F}>Net [α] = 0°</text>
    <text x={326} y={125} textAnchor="middle" fontSize="8" fill={C.teal} fontFamily={F}>optically inactive</text>
  </svg>
)

// Fischer projection — L-Glyceraldehyde
const FischerGlyc=()=>(
  <svg viewBox="0 0 200 260" style={{width:'100%',maxHeight:'250px'}}>
    {/* Vertical chain */}
    <line x1={100} y1={20} x2={100} y2={240} stroke={C.text} strokeWidth="2.5"/>
    {/* Horizontal crossbar at C2 */}
    <line x1={28} y1={130} x2={172} y2={130} stroke={C.text} strokeWidth="2.5"/>
    <circle cx={100} cy={130} r="6" fill={C.text}/>
    {/* Top: CHO */}
    <A x={100} y={14} t="CHO" col={C.red} sz={11}/>
    {/* Bottom: CH2OH */}
    <A x={100} y={248} t="CH₂OH" col={C.teal} sz={11}/>
    {/* Left: OH (toward viewer) */}
    <A x={16} y={130} t="OH" col={C.red} sz={11}/>
    {/* Right: H (toward viewer) */}
    <A x={184} y={130} t="H" col={C.muted} sz={11}/>
    {/* Annotation boxes */}
    <rect x={8} y={52} width="140" height="26" rx="5" fill={C.blueL}/>
    <text x={78} y={63} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F} fontWeight="600">Vertical bonds (↑↓)</text>
    <text x={78} y={74} textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={F}>= AWAY from viewer</text>
    <rect x={8} y={166} width="140" height="26" rx="5" fill={C.redL}/>
    <text x={78} y={177} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F} fontWeight="600">Horizontal bonds (←→)</text>
    <text x={78} y={188} textAnchor="middle" fontSize="8" fill={C.red} fontFamily={F}>= TOWARD viewer</text>
    <text x={100} y={258} textAnchor="middle" fontSize="9" fill={C.purple} fontFamily={F} fontWeight="700">L-(−)-Glyceraldehyde</text>
  </svg>
)

// Fischer for D-glucose (C1-C6 with 4 chiral centers)
const FischerGlucose=()=>(
  <svg viewBox="0 0 200 360" style={{width:'100%',maxHeight:'350px'}}>
    <line x1={100} y1={20} x2={100} y2={340} stroke={C.text} strokeWidth="2.2"/>
    {[100,155,210,265].map((y,i)=>(
      <g key={i}>
        <line x1={28} y1={y} x2={172} y2={y} stroke={C.text} strokeWidth="2.2"/>
        <circle cx={100} cy={y} r="5" fill={C.text}/>
        {/* D-glucose OH positions: C2=R, C3=L, C4=R, C5=R */}
        {i===0&&<><A x={16} y={y} t="H" col={C.muted} sz={10}/><A x={184} y={y} t="OH" col={C.red} sz={10}/><text x={100} y={y+14} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C2(R)</text></>}
        {i===1&&<><A x={16} y={y} t="OH" col={C.red} sz={10}/><A x={184} y={y} t="H" col={C.muted} sz={10}/><text x={100} y={y+14} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C3(S)</text></>}
        {i===2&&<><A x={16} y={y} t="H" col={C.muted} sz={10}/><A x={184} y={y} t="OH" col={C.red} sz={10}/><text x={100} y={y+14} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C4(R)</text></>}
        {i===3&&<><A x={16} y={y} t="H" col={C.muted} sz={10}/><A x={184} y={y} t="OH" col={C.red} sz={10}/><text x={100} y={y+14} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily={F}>C5(R)</text></>}
      </g>
    ))}
    <A x={100} y={14} t="CHO" col={C.red} sz={11}/>
    <A x={100} y={348} t="CH₂OH" col={C.teal} sz={11}/>
    <text x={100} y={358} textAnchor="middle" fontSize="8" fill={C.purple} fontFamily={F} fontWeight="700">D-(+)-Glucose: 4 chiral centers</text>
  </svg>
)

// ─── ANIMATED MIRROR FLIP ─────────────────────────────────────────────────────
const MirrorFlipAnim=()=>{
  const [flipped,setFlipped]=useState(false)
  const [step,setStep]=useState(0)

  return (
    <div style={{textAlign:'center'}}>
      <p style={{fontSize:'.83rem',color:C.muted,marginBottom:'12px'}}>
        {step===0&&'Step 1: Here is (S)-lactic acid and its mirror image (R)-lactic acid.'}
        {step===1&&'Step 2: Try to superimpose — pick up the (R) isomer and bring it onto (S).'}
        {step===2&&'Step 3: Even after flipping, COOH and CH₃ overlap but OH and H do NOT. Non-superimposable → CHIRAL molecule!'}
      </p>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0',position:'relative'}}>
        <div style={{flex:1,maxWidth:'200px'}}>
          <LacticS/>
        </div>
        <div style={{width:'40px',textAlign:'center',flexShrink:0}}>
          <div style={{fontSize:'1.4rem',color:C.amber}}>|</div>
          <div style={{fontSize:'.65rem',color:C.amber,fontFamily:F,fontWeight:700,letterSpacing:'1px'}}>MIRROR</div>
          <div style={{fontSize:'1.4rem',color:C.amber}}>|</div>
        </div>
        <div style={{flex:1,maxWidth:'200px',transform:step>=1?'translateX(-80px)':'none',transition:'transform 0.6s ease',opacity:step>=2?.6:1}}>
          <LacticR/>
        </div>
      </div>
      {step>=2&&(
        <div style={{marginTop:'10px',padding:'10px',background:C.redL,borderRadius:'8px',fontSize:'.83rem',color:C.red,fontWeight:600}}>
          ❌ Cannot superimpose! OH and H end up on wrong sides. These are enantiomers — different compounds.
        </div>
      )}
      <div style={{display:'flex',gap:'8px',justifyContent:'center',marginTop:'12px'}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${C.border}`,background:'#fff',cursor:step===0?'default':'pointer',opacity:step===0?.4:1,fontFamily:P,fontWeight:600,fontSize:'.82rem'}}>← Back</button>
        <button onClick={()=>setStep(s=>Math.min(2,s+1))} disabled={step===2} style={{padding:'6px 14px',borderRadius:'8px',border:'none',background:step===2?C.muted:C.teal,color:'#fff',cursor:step===2?'default':'pointer',fontFamily:P,fontWeight:600,fontSize:'.82rem'}}>Next →</button>
        <button onClick={()=>{setStep(0);setFlipped(false)}} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontFamily:P,fontSize:'.82rem'}}>Reset</button>
      </div>
    </div>
  )
}

// ─── R/S STEP ANIMATOR ────────────────────────────────────────────────────────
const RSAnimator=({mol})=>{
  const [step,setStep]=useState(0)
  const defs=<defs><marker id={`arr_${mol.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={C.amber}/></marker></defs>

  return (
    <div>
      <svg viewBox="0 0 280 220" style={{width:'100%',maxHeight:'205px'}}>
        {defs}
        {/* Central C* */}
        <circle cx={140} cy={110} r="15" fill={C.text}/>
        <text x={140} y={115} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily={F}>C*</text>
        {/* Group 1 */}
        <WD x1={140} y1={110} x2={68} y2={110} col={mol.g1c}/>
        <A x={50} y={110} t={mol.g1} col={mol.g1c} sz={12}/>
        {step>=1&&<text x={50} y={126} textAnchor="middle" fontSize="10" fill={mol.g1c} fontFamily={F} fontWeight="700">①</text>}
        {/* Group 2 */}
        <B x1={140} y1={110} x2={212} y2={110} col={mol.g2c}/>
        <A x={230} y={110} t={mol.g2} col={mol.g2c} sz={12}/>
        {step>=1&&<text x={230} y={126} textAnchor="middle" fontSize="10" fill={mol.g2c} fontFamily={F} fontWeight="700">②</text>}
        {/* Group 3 */}
        <WS x1={140} y1={110} x2={140} y2={46} col={mol.g3c}/>
        <A x={140} y={36} t={mol.g3} col={mol.g3c} sz={12}/>
        {step>=1&&<text x={140} y={22} textAnchor="middle" fontSize="10" fill={mol.g3c} fontFamily={F} fontWeight="700">③</text>}
        {/* Group 4 — always on dashed wedge (away) */}
        <WD x1={140} y1={110} x2={140} y2={174} col={C.muted}/>
        <A x={140} y={184} t={mol.g4} col={C.muted} sz={12}/>
        {step>=1&&<text x={140} y={200} textAnchor="middle" fontSize="10" fill={C.muted} fontFamily={F} fontWeight="700">④ away ✓</text>}
        {/* CIP arrow */}
        {step>=2&&<path d={`M 58,104 Q 140,48 218,104`} stroke={C.amber} strokeWidth="2.2" fill="none" markerEnd={`url(#arr_${mol.id})`}/>}
        {/* Priority display */}
        {step>=1&&<text x={140} y={14} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>{mol.priorities}</text>}
      </svg>
      <div style={{background:
        step===0?C.blueL:
        step===1?C.amberL:
        C.tealL,
        border:`1px solid ${step===0?C.blue:step===1?C.amber:C.teal}`,
        borderRadius:'8px',padding:'10px 14px',margin:'8px 0',fontSize:'.83rem',
        color:step===0?C.blue:step===1?C.amber:C.teal,minHeight:'40px',lineHeight:1.6}}>
        {step===0&&<><strong>Step 1:</strong> Identify all 4 groups. The lowest priority group (④) must point AWAY from you. Here it is already on a dashed wedge ✓</>}
        {step===1&&<><strong>Step 2:</strong> Assign priorities using CIP rules. {mol.priorities}</>}
        {step===2&&<><strong>Step 3:</strong> Trace arrow ①→②→③. Arrow is <strong>{mol.direction}</strong> → configuration is <strong style={{fontSize:'1.1rem'}}>{mol.config}</strong></>}
      </div>
      <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${C.border}`,background:'#fff',cursor:step===0?'default':'pointer',opacity:step===0?.4:1,fontFamily:P,fontWeight:600,fontSize:'.82rem'}}>← Back</button>
        <button onClick={()=>setStep(s=>Math.min(2,s+1))} disabled={step===2} style={{padding:'6px 14px',borderRadius:'8px',border:'none',background:step===2?C.muted:C.teal,color:'#fff',cursor:step===2?'default':'pointer',fontFamily:P,fontWeight:600,fontSize:'.82rem'}}>Next →</button>
        <button onClick={()=>setStep(0)} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontFamily:P,fontSize:'.82rem'}}>Reset</button>
      </div>
    </div>
  )
}

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const QUIZ=[
  {q:'A carbon atom is chiral when it is bonded to:',opts:['Four carbon atoms','Four different atoms or groups','At least one hydrogen','Two identical groups'],ans:1,exp:'A chiral center (stereocenter) must have FOUR DIFFERENT substituents. If any two are identical, the carbon has a plane of symmetry and is achiral.'},
  {q:'(R) configuration is assigned when the sequence 1→2→3 is __, with group 4 pointing away:',opts:['Anticlockwise','Clockwise','Either direction','Depends on molecule'],ans:1,exp:'R (Rectus = Latin for right) = CLOCKWISE rotation of 1→2→3 with the lowest priority group (④) pointing away from the viewer. S (Sinister) = anticlockwise.'},
  {q:'A meso compound is optically inactive because:',opts:['It has no chiral centers','It has a plane of symmetry that internally cancels optical rotations','It is a racemic mixture','It rotates light by exactly 180°'],ans:1,exp:'Meso compounds HAVE chiral centers, but an internal Plane of Symmetry (POS) divides the molecule into two mirror-image halves. The rotation of one half exactly cancels the other. This is internal compensation, NOT a racemic mixture.'},
  {q:'In Fischer projection, horizontal bonds:',opts:['Point away from viewer','Point toward viewer','Are in the plane of paper','Point upward'],ans:1,exp:'The fundamental Fischer rule: HORIZONTAL bonds point TOWARD the viewer (like solid wedges). VERTICAL bonds point AWAY from the viewer (like dashed bonds). This is the most commonly confused rule in JEE.'},
  {q:'If a Fischer projection is rotated by 90°, the product is:',opts:['The same compound','The enantiomer','A diastereomer','A meso compound'],ans:1,exp:'Rotating a Fischer projection by 90° (or 270°) gives the ENANTIOMER — configuration at every chiral center is inverted. Rotating by 180° gives the SAME compound. Swapping any two groups once also gives the enantiomer.'},
  {q:'How many stereoisomers does tartaric acid have?',opts:['2','3','4','6'],ans:1,exp:'Tartaric acid has 2 chiral centers. 2² = 4 maximum. But (2R,3S) form has an internal POS → meso compound. So total = (R,R) + (S,S) + meso = 3 stereoisomers. Only 2 are optically active.'},
  {q:'Which of the following is NOT true about enantiomers?',opts:['They have identical boiling points','They have opposite optical rotations','They have identical melting points','They have different chemical reactivity toward all reagents'],ans:3,exp:'Enantiomers have IDENTICAL physical properties (BP, MP, density, solubility in achiral solvents) and IDENTICAL chemical reactivity toward achiral reagents. They differ only in optical rotation sign and reactivity toward chiral reagents (like enzymes).'},
  {q:'D-glyceraldehyde has the configuration:',opts:['(S)','(R)','Racemic','Meso'],ans:1,exp:'D-glyceraldehyde (OH on right in Fischer projection) corresponds to (R) configuration by CIP rules. L-glyceraldehyde (OH on left) = (S). Note: D/L is based on glyceraldehyde reference, not CIP rules — D does NOT always equal R for other compounds!'},
  {q:'Which statement about specific optical rotation is correct?',opts:['It depends on concentration','It is the same for enantiomers','It is measured in degrees and is fixed for a pure compound under defined conditions','It changes with molecular weight'],ans:2,exp:'Specific optical rotation [α] is a physical constant for a pure compound under defined conditions (temperature, solvent, wavelength). Enantiomers have equal but OPPOSITE specific rotations: [α]_D of +13.5° for one and −13.5° for the other.'},
  {q:'Thalidomide tragedy illustrates which concept?',opts:['Geometric isomerism','Enantiomers having different biological activity','Meso compounds','Conformational isomerism'],ans:1,exp:'Thalidomide was sold as a racemate. The (R) enantiomer was a safe sedative. The (S) enantiomer caused birth defects (teratogenic). This is the most famous example of enantiomers having opposite biological activities — enzymes are chiral and distinguish between them.'},
  {q:'Glucose has how many chiral centers in open chain form?',opts:['2','3','4','5'],ans:2,exp:'Open-chain D-glucose has 4 chiral centers: C2, C3, C4, and C5. With 4 chiral centers, 2⁴ = 16 possible stereoisomers exist (8 pairs of enantiomers). These are the 8 D-aldohexoses and their mirror image 8 L-aldohexoses.'},
  {q:'A racemic mixture has specific rotation of:',opts:['+α','-α','0°','2α'],ans:2,exp:'A racemic mixture is a 50:50 mix of (+) and (−) enantiomers. The rotations exactly cancel → net optical rotation = 0°. This makes it optically inactive, but unlike meso compounds, it CAN be separated (resolved) into optically active components.'},
]

export default function OpticalSection(){
  const [activeTab,setActiveTab]=useState('chirality')
  const [quizState,setQuizState]=useState(Array(QUIZ.length).fill(null))
  const [quizScore,setQuizScore]=useState(null)
  const [selectedMol,setSelectedMol]=useState(0)

  const RS_MOLECULES=[
    {id:'chfclbr',g1:'Br',g1c:'#8B4513',g2:'Cl',g2c:C.green,g3:'F',g3c:C.blue,g4:'H',priorities:'Br(35)>Cl(17)>F(9)>H(1)',direction:'Clockwise',config:'R'},
    {id:'lactic',g1:'OH',g1c:C.red,g2:'COOH',g2c:'#8B4513',g3:'CH₃',g3c:C.teal,g4:'H',priorities:'OH(O)>COOH(O phantom)>CH₃(C)>H',direction:'Anticlockwise',config:'S'},
    {id:'alanine',g1:'NH₂',g1c:C.blue,g2:'COOH',g2c:C.red,g3:'CH₃',g3c:C.teal,g4:'H',priorities:'NH₂(N)>COOH(O)>CH₃(C)>H',direction:'Anticlockwise',config:'S'},
    {id:'bromobutane',g1:'Br',g1c:C.red,g2:'C₂H₅',g2c:C.teal,g3:'CH₃',g3c:C.amber,g4:'H',priorities:'Br(35)>C₂H₅(8,deeper)>CH₃(6)>H(1)',direction:'Clockwise',config:'R'},
  ]

  function answerQuiz(qi,oi){
    if(quizState[qi]!==null) return
    const next=[...quizState]; next[qi]=oi; setQuizState(next)
    if(next.filter(x=>x!==null).length===QUIZ.length)
      setQuizScore(next.filter((x,i)=>x===QUIZ[i].ans).length)
  }

  const TABS=[
    {id:'chirality',label:'Chirality & C*'},
    {id:'mirror',label:'Enantiomers'},
    {id:'rs',label:'R/S Configuration'},
    {id:'meso',label:'Meso & POS'},
    {id:'fischer',label:'Fischer Projection'},
    {id:'examples',label:'10 Worked Examples'},
    {id:'quiz',label:'Practice Quiz (12 Qs)'},
  ]

  const tabBar=(
    <div style={{display:'flex',gap:'4px',background:'#EFEBE2',borderRadius:'10px',padding:'4px',marginBottom:'20px',flexWrap:'wrap'}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,minWidth:'70px',padding:'6px 4px',borderRadius:'8px',border:'none',background:activeTab===t.id?'#fff':'transparent',cursor:'pointer',fontFamily:P,fontSize:'.72rem',fontWeight:600,color:activeTab===t.id?C.teal:C.muted,transition:'all .18s'}}>
          {t.label}
        </button>
      ))}
    </div>
  )

  const TabChirality=()=>(
    <div>
      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:PD}}>Chirality — The Handedness of Molecules</h3>
        <p style={{color:'rgba(255,255,255,.88)',margin:0,fontSize:'.9rem'}}>A molecule is chiral if it is non-superimposable on its mirror image. A chiral center (C*) is a carbon bonded to FOUR DIFFERENT groups. The number of chiral centers determines the maximum number of stereoisomers: 2ⁿ.</p>
      </div>
      <h2 style={h2s}>What Makes a Carbon Chiral?</h2>
      <div style={g2}>
        <div style={card('teal')}>
          <div style={ct('teal')}>Chiral Carbon (C*) — 4 Different Groups</div>
          <div style={{fontFamily:F,fontSize:'.83rem',lineHeight:2.2}}>
            <div style={{color:C.teal}}>✓ CH₃-CH(OH)-COOH → C2 has OH, H, CH₃, COOH</div>
            <div style={{color:C.teal}}>✓ CH₃-CHBr-CH₂CH₃ → C2 has Br, H, CH₃, C₂H₅</div>
            <div style={{color:C.red}}>✗ CH₃-CH₂-OH → C2 has H, H, CH₃, OH (2×H same)</div>
            <div style={{color:C.red}}>✗ CH₃-CO-CH₃ → C=O carbon is sp² (not tetrahedral)</div>
            <div style={{color:C.red}}>✗ CH₃-CH₂-CH₃ → C2 has H, H, CH₃, CH₃ (2 same pairs)</div>
          </div>
        </div>
        <div style={card('blue')}>
          <div style={ct('blue')}>How to Test: Does It Have a POS?</div>
          <p style={{fontSize:'.84rem',marginBottom:'8px'}}>If a molecule has a Plane of Symmetry (POS) → it is achiral (optically inactive).</p>
          <p style={{fontSize:'.84rem',margin:0}}>Even if chiral centers exist, a POS means the molecule is meso (optically inactive). No POS + chiral center = chiral molecule = optically active.</p>
        </div>
      </div>
      <h2 style={h2s}>Necessary Conditions for Optical Activity</h2>
      {[
        {h:'Must have a chiral center (C*)',p:'At least one carbon bonded to 4 different groups. Without this, no chirality is possible (except axial chirality in allenes, biphenyls — JEE Advanced).',col:'teal'},
        {h:'Must NOT have a Plane of Symmetry',p:'If the molecule can be divided into two mirror-image halves by any plane → it is meso → optically inactive despite having C*.',col:'amber'},
        {h:'Must NOT have a Centre of Symmetry',p:'A point through which every atom has an identical atom at the same distance on the other side → achiral. Rare but JEE Advanced tests it.',col:'blue'},
        {h:'Must NOT be a racemic mixture',p:'A 50:50 mixture of (+) and (−) enantiomers has net [α] = 0°. Individual components ARE optically active but the mixture is not.',col:'red'},
      ].map((s,i)=>(
        <div key={i} style={stepRow}><div style={stepN(s.col)}>{i+1}</div><div style={{...card(s.col),marginBottom:0,flex:1}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div></div>
      ))}
      <h2 style={h2s}>Optical Rotation — What It Means</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Term</th><th style={th}>Symbol</th><th style={th}>Meaning</th></tr></thead>
          <tbody>
            {[
              ['Dextrorotatory','(+) or d','Rotates plane-polarized light clockwise'],
              ['Laevorotatory','(−) or l','Rotates plane-polarized light anticlockwise'],
              ['Specific rotation','[α]ᴅ²⁰','Physical constant: [α] = α/(l×c), measured at 589nm (Na D-line), 20°C'],
              ['Racemic mixture','(±) or dl','50:50 mix of enantiomers → [α] = 0 (externally compensated)'],
              ['Enantiomeric excess','ee%','ee% = (major − minor)/(total) × 100. Pure enantiomer = 100% ee'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===1?F:'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const TabMirror=()=>(
    <div>
      <h2 style={{...h2s,marginTop:0}}>Enantiomers — Non-Superimposable Mirror Images</h2>
      <div style={ibox}>
        <div style={iboxT}>Animated: Try to superimpose (S) and (R) lactic acid</div>
        <MirrorFlipAnim/>
      </div>
      <h2 style={h2s}>Enantiomers vs Diastereomers — The Complete Table</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Property</th><th style={{...th,background:C.purple}}>Enantiomers</th><th style={{...th,background:C.blue}}>Diastereomers</th></tr></thead>
          <tbody>
            {[
              ['Definition','Non-superimposable mirror images','Stereoisomers, NOT mirror images of each other'],
              ['Stereocenters','ALL centers inverted','SOME centers inverted (not all)'],
              ['Example (2 centers)','(R,R) ↔ (S,S)','(R,R) vs (R,S) or (S,R)'],
              ['Boiling point','Identical','Different'],
              ['Melting point','Identical','Different'],
              ['Solubility (achiral solvent)','Identical','Different'],
              ['Optical rotation','Equal magnitude, opposite sign','Different values'],
              ['Chemical reactions (achiral reagents)','Identical rates','Different rates'],
              ['Chemical reactions (chiral reagents/enzymes)','Different rates','Different rates'],
              ['Separation','Requires chiral resolving agent','Normal physical methods (distillation, crystallization)'],
              ['Geometric isomers are...','Never enantiomers','YES — always diastereomers'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontWeight:j===0?600:400}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 style={h2s}>Real-World Importance of Chirality</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
        {[
          {h:'Thalidomide',p:'(R) enantiomer: safe sedative. (S) enantiomer: caused severe birth defects. Sold as racemate in 1950s → disaster. Now all drugs must be tested as individual enantiomers.',col:'red'},
          {h:'Ibuprofen',p:'(S)-(+)-ibuprofen is the active anti-inflammatory. (R) form is inactive but slowly converts to (S) in the body. Sold as racemate for simplicity.',col:'blue'},
          {h:'Amino Acids',p:'All 20 natural amino acids are (S) configuration (L-form) except glycine (achiral). Your body uses ONLY L-amino acids. D-amino acids are found in bacterial cell walls.',col:'teal'},
          {h:'Sugars (Glucose)',p:'Only D-(+)-glucose occurs naturally and is metabolized. L-glucose tastes sweet but cannot be metabolized by human enzymes (they are chiral and specific).',col:'amber'},
        ].map((s,i)=>(
          <div key={i} style={{...card(s.col),marginBottom:0}}>
            <div style={ct(s.col)}>{s.h}</div>
            <p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const TabRS=()=>(
    <div>
      <div style={card('blue')}>
        <div style={ct('blue')}>📌 R/S — The Unambiguous Way to Describe Configuration</div>
        <p style={{fontSize:'.87rem',margin:0}}>CIP (Cahn-Ingold-Prelog) rules give every chiral center a definite R or S label. Unlike d/l or D/L notation, R/S works for ANY molecule and is always unambiguous.</p>
      </div>
      <h2 style={h2s}>Interactive R/S Assigner — Step Through Each Molecule</h2>
      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
        {['CHFClBr','(S)-Lactic acid','(S)-Alanine','(R)-2-Bromobutane'].map((name,i)=>(
          <button key={i} onClick={()=>setSelectedMol(i)} style={{padding:'6px 14px',borderRadius:'8px',border:`2px solid ${selectedMol===i?C.teal:C.border}`,background:selectedMol===i?C.teal:'#fff',color:selectedMol===i?'#fff':C.text,fontFamily:P,fontWeight:600,fontSize:'.8rem',cursor:'pointer'}}>
            {name}
          </button>
        ))}
      </div>
      <div style={ibox}>
        <div style={iboxT}>Step-by-step R/S for: {['CHFClBr','(S)-Lactic acid','(S)-Alanine','(R)-2-Bromobutane'][selectedMol]}</div>
        <RSAnimator mol={RS_MOLECULES[selectedMol]}/>
      </div>
      <h2 style={h2s}>All 4 CIP Priority Rules</h2>
      {[
        {n:1,h:'Atomic Number — Higher = Higher Priority',p:'I(53)>Br(35)>Cl(17)>S(16)>F(9)>O(8)>N(7)>C(6)>H(1). This resolves 90% of cases instantly.',col:'teal'},
        {n:2,h:'Tie at first atom? Compare substituents of that atom',p:'Go outward from the tied atoms. Compare the sets of atoms (sorted high-to-low) attached to each tied atom. First difference found = winner. Example: CH(CH₃)₂ vs CH₂CH₃ — both start C. CH(CH₃)₂ has (C,C,H) vs (C,H,H) → isopropyl > ethyl.',col:'blue'},
        {n:3,h:'Double/Triple bonds = phantom duplicate atoms',p:'C=O means C sees [O, O_phantom] and O sees [C, C_phantom]. C≡N means each gets 2 phantoms. Phantom atoms have no further substituents.',col:'amber'},
        {n:4,h:'Isotopes — heavier isotope = higher priority',p:'²H (deuterium) > ¹H (protium). ¹³C > ¹²C. Used in mechanistic studies and JEE Advanced questions.',col:'red'},
      ].map(s=>(
        <div key={s.n} style={stepRow}><div style={stepN(s.col)}>{s.n}</div><div style={{...card(s.col),marginBottom:0,flex:1}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.82rem'}}>{s.p}</p></div></div>
      ))}
      <h2 style={h2s}>The ④-Toward-You Correction</h2>
      <div style={card('amber')}>
        <div style={ct('amber')}>What if group ④ is NOT pointing away?</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginTop:'8px',fontSize:'.82rem'}}>
          <div style={{background:'#fff',borderRadius:'8px',padding:'10px',border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,color:C.teal,marginBottom:'4px'}}>④ on dashed bond ✓</div>
            <p style={{margin:0}}>Already pointing away. Read arrow directly. No correction needed.</p>
          </div>
          <div style={{background:'#fff',borderRadius:'8px',padding:'10px',border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,color:C.red,marginBottom:'4px'}}>④ on solid wedge ✗</div>
            <p style={{margin:0}}>Pointing TOWARD you. Read arrow, then INVERT. Clockwise → S. Anticlockwise → R.</p>
          </div>
          <div style={{background:'#fff',borderRadius:'8px',padding:'10px',border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,color:C.amber,marginBottom:'4px'}}>④ in plane of paper</div>
            <p style={{margin:0}}>Swap ④ with any group to put it on dash. Each swap inverts R/S. Keep track of swaps.</p>
          </div>
        </div>
      </div>
    </div>
  )

  const TabMeso=()=>(
    <div>
      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:PD}}>Meso Compounds — The #1 JEE Trap</h3>
        <p style={{color:'rgba(255,255,255,.88)',margin:'0',fontSize:'.9rem'}}>A meso compound HAS chiral centers but is optically INACTIVE because an internal Plane of Symmetry (POS) makes the two halves cancel each other. It is NOT a mixture — it is a single pure compound.</p>
      </div>
      <h2 style={h2s}>Meso-2,3-Dibromobutane — The Classic JEE Example</h2>
      <div style={ibox}>
        <div style={iboxT}>POS divides molecule into two halves with equal and opposite rotations</div>
        <MesoDBB/>
      </div>
      <h2 style={h2s}>3-Step Meso Detection</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
        {[
          {n:1,t:'Even number of chiral centers?',d:'Meso requires 2, 4, 6... centers. With odd numbers, no symmetric compensation is possible.',col:'teal'},
          {n:2,t:'Two halves identical?',d:'The molecule divided at the center must give two mirror-image halves with the same connectivity.',col:'blue'},
          {n:3,t:'Can you draw a POS?',d:'If any plane of symmetry exists in the molecule → it is meso and therefore optically inactive.',col:'amber'},
        ].map(s=>(
          <div key={s.n} style={{background:'#fff',borderRadius:'10px',padding:'14px',border:`2px solid ${C[s.col]}`,textAlign:'center'}}>
            <div style={{width:'28px',height:'28px',background:C[s.col],color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,margin:'0 auto 8px',fontSize:'.9rem'}}>{s.n}</div>
            <div style={{fontWeight:700,fontSize:'.82rem',marginBottom:'6px',color:C[s.col]}}>{s.t}</div>
            <p style={{margin:0,fontSize:'.78rem',color:C.muted,lineHeight:1.6}}>{s.d}</p>
          </div>
        ))}
      </div>
      <h2 style={h2s}>Common Meso Compounds in JEE</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Compound</th><th style={th}>Configuration</th><th style={th}>Total Stereoisomers</th><th style={th}>Optically Active Forms</th></tr></thead>
          <tbody>
            {[
              ['Meso-2,3-dibromobutane','(2R,3S)','3: (RR)+(SS)+meso','2 [(RR) and (SS)]'],
              ['Meso-tartaric acid','(2R,3S)','3: (RR)+(SS)+meso','2 [(RR) and (SS)]'],
              ['Meso-2,3-dichloropentanedioic acid','(2R,4S)','3 total','2'],
              ['cis-1,2-dimethylcyclohexane','—','3 (cis-meso + trans-pair)','2 (trans enantiomers)'],
              ['Meso-2,3,4-trichloropentane','complex','4 total','2 pairs + 2 meso? No — 2 meso forms here',''],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j===1?F:'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={card('red')}>
        <div style={ct('red')}>⚠️ Meso vs Racemic — Critical Difference</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'8px',fontSize:'.83rem'}}>
          <div style={{background:'#fff',borderRadius:'8px',padding:'12px',border:`1px solid ${C.red}`}}>
            <strong style={{color:C.red}}>Meso compound</strong>
            <ul style={{marginLeft:'14px',lineHeight:2,marginTop:'6px',marginBottom:0}}>
              <li>Single pure compound</li>
              <li>Internal compensation via POS</li>
              <li>Cannot be resolved into optically active parts</li>
              <li>Has different MP, BP from its enantiomers</li>
            </ul>
          </div>
          <div style={{background:'#fff',borderRadius:'8px',padding:'12px',border:`1px solid ${C.amber}`}}>
            <strong style={{color:C.amber}}>Racemic mixture (±)</strong>
            <ul style={{marginLeft:'14px',lineHeight:2,marginTop:'6px',marginBottom:0}}>
              <li>50:50 mixture of (+) and (−) enantiomers</li>
              <li>External compensation</li>
              <li>CAN be resolved into optically active parts</li>
              <li>Has SAME MP, BP as each individual enantiomer*</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const TabFischer=()=>(
    <div>
      <div style={card('blue')}>
        <div style={ct('blue')}>📌 Fischer Projection — Convention for Sugars & Amino Acids</div>
        <p style={{fontSize:'.87rem',margin:0}}>Fischer projection is a 2D representation of a 3D molecule. The carbon chain runs VERTICALLY. The most oxidized carbon (CHO, COOH) goes at the TOP. All horizontal bonds point TOWARD the viewer. All vertical bonds point AWAY from the viewer.</p>
      </div>
      <h2 style={h2s}>L-Glyceraldehyde — The Reference Compound</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>Fischer projection of L-glyceraldehyde</div><FischerGlyc/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[
            {h:'Horizontal = TOWARD you (like solid wedge)',p:'The OH on the LEFT and H on the RIGHT both point TOWARD the viewer. This is the most commonly confused rule in JEE.',col:'red'},
            {h:'Vertical = AWAY from you (like dashed bond)',p:'The CHO at top and CH₂OH at bottom both point AWAY from the viewer — as if going into the page.',col:'blue'},
            {h:'OH on LEFT = L configuration',p:'In Fischer notation for glyceraldehyde: OH on left = L. OH on right = D. L-glyceraldehyde is the (S) enantiomer in CIP notation.',col:'teal'},
            {h:'Top = most oxidized carbon',p:'CHO (aldehyde) is more oxidized than CH₂OH (primary alcohol). So CHO goes to top in Fischer convention.',col:'amber'},
          ].map((s,i)=>(
            <div key={i} style={{...card(s.col),marginBottom:0}}><div style={ct(s.col)}>{s.h}</div><p style={{margin:0,fontSize:'.81rem'}}>{s.p}</p></div>
          ))}
        </div>
      </div>
      <h2 style={h2s}>D-Glucose — 4 Chiral Centers in Fischer</h2>
      <div style={g2}>
        <div style={ibox}><div style={iboxT}>D-(+)-Glucose Fischer projection</div><FischerGlucose/></div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={card('teal')}><div style={ct('teal')}>Reading glucose</div><p style={{margin:0,fontSize:'.82rem'}}>4 chiral centers: C2(R), C3(S), C4(R), C5(R). The D/L designation is determined by C5 — the highest-numbered chiral center. OH on RIGHT at C5 = D. So this is D-glucose.</p></div>
          <div style={card('amber')}><div style={ct('amber')}>Why 2ⁿ gives 16, not 2?</div><p style={{margin:0,fontSize:'.82rem'}}>4 chiral centers → 2⁴ = 16 stereoisomers total. No meso forms possible here (the molecule is not symmetrical). So 16 = 8 pairs of enantiomers = 8 D-aldohexoses + 8 L-aldohexoses.</p></div>
        </div>
      </div>
      <h2 style={h2s}>Fischer Projection — Manipulation Rules</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Operation</th><th style={th}>Result</th><th style={th}>Why?</th></tr></thead>
          <tbody>
            {[
              ['Rotate 180° in plane','Same compound','Returns all groups to original relative positions'],
              ['Rotate 90° in plane','Enantiomer','Configuration at every center is inverted'],
              ['Rotate 270° in plane','Enantiomer','Same as 90° rotation'],
              ['Swap any 2 groups once','Enantiomer','One inversion of configuration'],
              ['Swap any 2 groups twice','Same compound','Two inversions cancel'],
              ['Swap any 2 groups three times','Enantiomer','Odd number of swaps = enantiomer'],
              ['Lift projection out of plane','NOT allowed!','Fischer must remain flat — lifting changes meaning'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),color:j===1?(c.includes('Enantiomer')?C.red:c.includes('NOT')?C.red:C.teal):C.text,fontWeight:j===1?700:400}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const TabExamples=()=>(
    <div>
      <h2 style={{...h2s,marginTop:0}}>10 Worked Examples — With Full Analysis</h2>
      <div style={g2}>
        <div><div style={ibox}><div style={iboxT}>Example 1: (S)-(+)-Lactic Acid</div><LacticS/></div><div style={card('teal')}><div style={ct('teal')}>Analysis</div><p style={{margin:0,fontSize:'.82rem'}}>C2: bonded to OH, H, COOH, CH₃ — all different ✓. Priorities: OH(O)&gt;COOH(O via phantom)&gt;CH₃(C)&gt;H. H on dashed bond (away). Arrow 1→2→3 anticlockwise → S. Found in muscle (exercise-induced).</p></div></div>
        <div><div style={ibox}><div style={iboxT}>Example 2: (R)-(-)-Lactic Acid (Mirror of S)</div><LacticR/></div><div style={card('red')}><div style={ct('red')}>Analysis</div><p style={{margin:0,fontSize:'.82rem'}}>All groups same as (S) but OH is now on opposite side. Arrow 1→2→3 goes clockwise → R. This is the mirror image: (R)-lactic acid = (−)-lactic acid. Found in fermented milk.</p></div></div>
      </div>
      <div style={g2}>
        <div><div style={ibox}><div style={iboxT}>Example 3: (S)-Alanine (L-Alanine)</div><AlanineS/></div><div style={card('blue')}><div style={ct('blue')}>Analysis</div><p style={{margin:0,fontSize:'.82rem'}}>C2: NH₂, H, COOH, CH₃. Priorities: NH₂(N,7)&gt;COOH(O,8)&gt;CH₃(C,6)&gt;H. Anticlockwise → S. All natural amino acids are (S) / L configuration except cysteine which is (R) due to sulfur in side chain changing priority!</p></div></div>
        <div><div style={ibox}><div style={iboxT}>Example 4: (R)-(+)-Glyceraldehyde</div><GlyceraldehydeR/></div><div style={card('amber')}><div style={ct('amber')}>Analysis</div><p style={{margin:0,fontSize:'.82rem'}}>C2: OH, H, CHO, CH₂OH. Priorities: OH(O)&gt;CH₂OH(O)&gt;CHO(C with phantom O). Wait — CH₂OH and CHO both have O. CHO: C bonded to (O double bond = 2 phantom O) → CHO ranks higher than CH₂OH (one O). So: OH&gt;CHO&gt;CH₂OH&gt;H. Clockwise → R = D-glyceraldehyde.</p></div></div>
      </div>
      <div style={g2}>
        <div><div style={ibox}><div style={iboxT}>Example 5: (R)-2-Bromobutane</div><BromobutaneR/></div><div style={card('purple')}><div style={ct('purple')}>Analysis</div><p style={{margin:0,fontSize:'.82rem'}}>C2: Br, H, CH₃, C₂H₅. Priorities: Br(35)&gt;C₂H₅(deeper C comparison)&gt;CH₃&gt;H. Why C₂H₅&gt;CH₃? Both start C. C₂H₅ next atoms: (C,H,H). CH₃ next atoms: (H,H,H). C&gt;H so C₂H₅ wins. Clockwise → R.</p></div></div>
        <div><div style={ibox}><div style={iboxT}>Example 6: (R)-Mandelic Acid</div><MandelicR/></div><div style={card('teal')}><div style={ct('teal')}>Analysis</div><p style={{margin:0,fontSize:'.82rem'}}>Ph-C*(OH)(H)-COOH. C*: Ph, OH, H, COOH. Priorities: OH(O)&gt;COOH(O)&gt;Ph(C,aromatic)&gt;H. Tie between OH and COOH: both start O. OH: O bonded to H. COOH: O bonded to C (higher than H). So COOH&gt;OH? No — recheck: OH group directly has O-H. COOH has O=C-OH. The directly attached atom is O both times. Go deeper: OH→(H). COOH→(C). C&gt;H → COOH has higher next atom → COOH&gt;OH. Priorities: COOH&gt;OH&gt;Ph&gt;H.</p></div></div>
      </div>
      <div style={ibox}>
        <div style={iboxT}>Examples 7-10: Quick Reference Table</div>
        <table style={{...tbl,margin:0}}>
          <thead><tr><th style={th}>Molecule</th><th style={th}>Chiral Center</th><th style={th}>Priority Order</th><th style={th}>Config</th><th style={th}>Optical Rotation</th></tr></thead>
          <tbody>
            {[
              ['Ibuprofen','C2 of propanoic acid part','COOH>C₆H₅>CH₃>H','S','(+)'],
              ['Cysteine (amino acid)','Cα','NH₂>COOH>CH₂SH>H... but CH₂SH has S(16)>N(7) so ranking changes','R','(−)'],
              ['(+)-Tartaric acid','C2 and C3 both chiral','At C2: OH>COOH>C3 chain>H','(R,R)','(+)'],
              ['Epinephrine (adrenaline)','Benzylic C*','OH>ArCH₂>NHCH₃>H','R','(−)'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontSize:'.8rem',fontFamily:j>=2?F:'inherit'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const TabQuiz=()=>(
    <div>
      <h3 style={{fontFamily:PD,fontSize:'1.2rem',margin:'0 0 6px'}}>Optical Isomerism — 12 JEE Questions</h3>
      <p style={{color:C.muted,fontSize:'.85rem',marginBottom:'18px'}}>Covers chirality, R/S, meso, Fischer — JEE Mains and Advanced level.</p>
      {quizScore!==null&&(
        <div style={{background:quizScore>=9?C.tealL:C.redL,border:`2px solid ${quizScore>=9?C.teal:C.red}`,borderRadius:'12px',padding:'18px',marginBottom:'18px',textAlign:'center'}}>
          <div style={{fontSize:'2rem',fontWeight:700,color:quizScore>=9?C.teal:C.red,fontFamily:PD}}>{quizScore}/12</div>
          <div style={{marginTop:'6px',fontWeight:600}}>{quizScore>=10?'Excellent!':quizScore>=7?'Good — review your mistakes.':'Study the theory sections and retry.'}</div>
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
                  {String.fromCharCode(65+oi)}. {opt}
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

  const tabContent={chirality:<TabChirality/>,mirror:<TabMirror/>,rs:<TabRS/>,meso:<TabMeso/>,fischer:<TabFischer/>,examples:<TabExamples/>,quiz:<TabQuiz/>}

  return(
    <div style={sec}>
      <span style={tag('j')}>JEE Core</span><span style={tag('i')}>Very High Weightage</span>
      <h1 style={{fontFamily:PD,fontSize:'2.2rem',color:C.text,marginBottom:'6px',lineHeight:1.2}}>Optical Isomerism</h1>
      <p style={{color:C.muted,fontSize:'.92rem',marginBottom:'22px'}}>Chirality, R/S configuration, meso compounds, Fischer projections — with animated examples and 12 JEE problems.</p>
      {tabBar}
      {tabContent[activeTab]}
    </div>
  )
}
