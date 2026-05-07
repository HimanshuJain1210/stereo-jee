'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─── QUIZ DATA ───────────────────────────────────────────────────────────────
const QUIZ = [
  { q:'Which compound shows geometric isomerism?', opts:['CH₂=CH₂','CHCl=CHCl','CH₂=CCl₂','CH₃-CH₃'], ans:1, exp:'CHCl=CHCl has two different groups on each doubly-bonded carbon. CH₂=CH₂ and CH₂=CCl₂ have identical groups on one carbon.' },
  { q:'How many stereocenters does glucose (open chain) have?', opts:['2','3','4','5'], ans:2, exp:'Glucose has 4 stereocenters (C2, C3, C4, C5), giving 2⁴ = 16 possible stereoisomers (8 pairs of enantiomers).' },
  { q:'A meso compound is optically inactive because:', opts:['It has no chiral centers','Its chiral centers have R configuration only','It has an internal plane of symmetry','It is a racemic mixture'], ans:2, exp:'Meso compounds have chiral centers but an internal plane of symmetry (POS) makes the molecule superimposable on its mirror image, causing optical inactivity.' },
  { q:'In Fischer projection, horizontal bonds point:', opts:['Away from viewer','Toward the viewer','In the plane of paper','Downward'], ans:1, exp:'This is the fundamental Fischer rule: horizontal bonds always come TOWARD you (like solid wedges). Vertical bonds go AWAY from you (like dashed bonds).' },
  { q:'The most stable conformer of n-butane is:', opts:['Gauche (60°)','Eclipsed (0°)','Anti (180°)','Partially eclipsed (120°)'], ans:2, exp:'Anti conformer (180°) has the two CH₃ groups maximally apart, minimizing steric strain. This is the global energy minimum for n-butane.' },
  { q:'Which cannot show geometric isomerism?', opts:['2-butene','2-pentene','Propene','2-butene dichloride'], ans:2, exp:'Propene (CH₃-CH=CH₂) has a CH₂= group where one carbon bears two H atoms — identical substituents. This violates the condition for geometric isomerism.' },
  { q:'(R) configuration means the sequence 1→2→3 is:', opts:['Anticlockwise with group 4 toward you','Clockwise with group 4 away from you','Anticlockwise with group 4 away from you','Clockwise with group 4 toward you'], ans:1, exp:'R (Rectus) = clockwise rotation of 1→2→3 when the lowest priority group (4) points AWAY from you. If 4 is toward you, the actual assignment is reversed.' },
  { q:'How many optical isomers does tartaric acid have?', opts:['2','3','4','1'], ans:1, exp:'Tartaric acid has 2 chiral centers but one form is meso (has POS). So: (R,R) + (S,S) = 1 enantiomeric pair, plus 1 meso = 3 total stereoisomers, but only 2 optically active forms.' },
  { q:'Rotating a Fischer projection by 90° gives:', opts:['Same compound','Enantiomer','Diastereomer','Meso compound'], ans:1, exp:'90° rotation of Fischer projection gives the enantiomer (configuration inverts). Only 180° rotation preserves the same compound. This is one of the most tested Fischer rules in JEE.' },
  { q:'Enantiomers differ in:', opts:['Boiling point','Melting point','Direction of optical rotation','Solubility in water'], ans:2, exp:'Enantiomers have identical physical properties (BP, MP, solubility, density) but differ only in the direction they rotate plane-polarized light: one is (+) and the other is (−).' },
  { q:'Which condition is NOT required for geometric isomerism?', opts:['Restricted rotation','Two different groups on each sp² carbon','Presence of a chiral center','C=C or ring system'], ans:2, exp:'Geometric isomerism requires restricted rotation and different groups on each doubly-bonded atom — it does NOT require chirality. Geometric isomers are diastereomers, not enantiomers.' },
  { q:'Amines with 4 different groups on nitrogen are NOT chiral because:', opts:['Nitrogen has no lone pair','Umbrella inversion rapidly interconverts enantiomers','The lone pair counts as an identical group','Nitrogen cannot be a stereocenter'], ans:1, exp:'Nitrogen undergoes rapid "umbrella inversion" (like an umbrella flipping in wind), rapidly interconverting the two enantiomers at room temperature. This makes isolation of chiral amines impossible under normal conditions.' },
  { q:'The E isomer of but-2-enedioic acid (fumaric acid) has which configuration?', opts:['Both COOH on same side','Both COOH on opposite sides','One COOH and one H on same side','Cannot be determined'], ans:1, exp:'Fumaric acid is (E)-butenedioic acid. COOH has higher priority than H on both carbons. E = higher priority groups on OPPOSITE sides → both COOH groups are on opposite sides.' },
  { q:'How many stereoisomers does 2,3-dichlorobutane have?', opts:['2','3','4','6'], ans:1, exp:'2,3-dichlorobutane has 2 chiral centers. 2² = 4 expected, but one pair is meso. So: (2R,3R) + (2S,3S) = enantiomers, and (2R,3S) = meso. Total = 3 stereoisomers.' },
  { q:'In Newman projection of ethane at 60° dihedral angle:', opts:['Eclipsed, least stable','Staggered, most stable','Gauche, intermediate','Anti, most stable'], ans:1, exp:'At 60° dihedral angle, back bonds bisect front bonds perfectly — this is the staggered conformation, which is the most stable due to minimal torsional strain.' },
]

// ─── COUNTING STEPS DATA ─────────────────────────────────────────────────────
const COUNTING_EXAMPLES = [
  { mol:'2,3-Dibromobutane', centers:2, hasMeso:true, total:3, enantiomers:2, meso:1, steps:['Identify chiral centers: C2 and C3 both have 4 different groups','Apply 2ⁿ rule: 2² = 4 maximum possible','Check for meso: (2R,3S) has an internal POS → meso compound exists','Subtract meso pair (counts as 1): 4 - 1 = 3 total stereoisomers','Final count: (2R,3R), (2S,2S) = 1 enantiomeric pair + 1 meso = 3 total'] },
  { mol:'Tartaric Acid', centers:2, hasMeso:true, total:3, enantiomers:2, meso:1, steps:['Identify chiral centers: C2 and C3 (each bonded to OH, H, COOH, and the other chiral carbon)','2² = 4 maximum possible stereoisomers','Check symmetry: (2R,3S) tartaric acid has POS → meso form exists','Count: (R,R) + (S,S) = enantiomeric pair (2 optically active) + 1 meso = 3 total','Optically active forms = 2, optically inactive = 1 (meso)'] },
  { mol:'2-Chlorobutane', centers:1, hasMeso:false, total:2, enantiomers:2, meso:0, steps:['Identify chiral center: C2 has CH₃, H, Cl, and C₂H₅ — all different','2¹ = 2 stereoisomers','No possibility of meso with just 1 chiral center','Final: (R)-2-chlorobutane and (S)-2-chlorobutane = 1 enantiomeric pair'] },
  { mol:'2,3,4-Trichloropentane', centers:3, hasMeso:true, total:4, enantiomers:4, meso:2, steps:['Identify chiral centers: C2, C3, and C4','2³ = 8 maximum possible stereoisomers','C3 is the middle center — check for internal symmetry','Two meso forms exist (internal compensation possible)','Final count: 8 - 4 = 4 stereoisomers (2 enantiomeric pairs + 2 meso compounds)'] },
]

export default function LearnPage() {
  const router = useRouter()
  const [studentName, setStudentName] = useState('')
  const [section, setSection] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [quizState, setQuizState] = useState(Array(QUIZ.length).fill(null))
  const [quizScore, setQuizScore] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [newmanAngle, setNewmanAngle] = useState(60)
  const [butaneAngle, setButaneAngle] = useState(180)
  const [activeProjection, setActiveProjection] = useState('wedge')
  const [countingExample, setCountingExample] = useState(0)
  const [rsRevealed, setRsRevealed] = useState(false)
  const [ezMode, setEzMode] = useState('Z')
  const canvasRef = useRef(null)
  const butaneRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    const name = sessionStorage.getItem('studentName')
    if (!name) { router.push('/'); return }
    setStudentName(name)
    setChatMessages([{ role:'assistant', content:`Hi ${name}! 👋 I'm your JEE Chemistry tutor. Ask me anything about stereoisomerism or any other JEE chemistry topic!` }])
  }, [router])

  useEffect(() => { drawNewman(canvasRef, newmanAngle, false) }, [newmanAngle])
  useEffect(() => { drawNewman(butaneRef, butaneAngle, true) }, [butaneAngle])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  // ─── NEWMAN CANVAS ────────────────────────────────────────────────────────
  function drawNewman(ref, angle, isButane) {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2, R = 55
    ctx.clearRect(0,0,W,H)
    ctx.fillStyle = '#F7F4EE'; ctx.fillRect(0,0,W,H)

    // back circle
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI)
    ctx.strokeStyle='#1A1E2E'; ctx.lineWidth=2.5; ctx.stroke()

    const toRad = d => d * Math.PI/180
    const frontAngles = [-90, 30, 150]
    const backAngles = frontAngles.map(a => a + angle)

    // back bonds
    backAngles.forEach((a,i) => {
      const x1 = cx + (R+2)*Math.cos(toRad(a)), y1 = cy + (R+2)*Math.sin(toRad(a))
      const x2 = cx + (R+32)*Math.cos(toRad(a)), y2 = cy + (R+32)*Math.sin(toRad(a))
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
      ctx.strokeStyle = '#B83030'; ctx.lineWidth = 2; ctx.stroke()
      const label = isButane ? (i===0?'CH₃':'H') : 'H'
      ctx.fillStyle='#B83030'; ctx.font='bold 11px Plus Jakarta Sans'; ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText(label, cx+(R+46)*Math.cos(toRad(a)), cy+(R+46)*Math.sin(toRad(a)))
    })

    // front dot
    ctx.beginPath(); ctx.arc(cx,cy,8,0,2*Math.PI); ctx.fillStyle='#1A1E2E'; ctx.fill()

    // front bonds
    frontAngles.forEach((a,i) => {
      const x2 = cx + (R-10)*Math.cos(toRad(a)), y2 = cy + (R-10)*Math.sin(toRad(a))
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x2,y2)
      ctx.strokeStyle='#1A1E2E'; ctx.lineWidth=2.5; ctx.stroke()
      const label = isButane ? (i===0?'CH₃':'H') : 'H'
      ctx.fillStyle='#1A1E2E'; ctx.font='bold 11px Plus Jakarta Sans'; ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText(label, cx+(R+8)*Math.cos(toRad(a)), cy+(R+8)*Math.sin(toRad(a)))
    })
  }

  function getNewmanLabel(angle, isButane) {
    const a = ((angle % 360) + 360) % 360
    if (!isButane) {
      if (a === 0 || a === 360) return { t:'Eclipsed — Least Stable', c:'#B83030' }
      if (a === 60 || a === 300) return { t:'Staggered — Most Stable', c:'#007A6E' }
      if (a === 180) return { t:'Staggered (Anti) — Most Stable', c:'#007A6E' }
      if (a % 60 === 0) return { t:'Staggered', c:'#007A6E' }
      return { t:'Partially Eclipsed', c:'#C97A0A' }
    }
    if (a === 180) return { t:'Anti (180°) — Most Stable ⭐', c:'#007A6E' }
    if (a === 0 || a === 360) return { t:'Fully Eclipsed (0°) — Least Stable ⚠️', c:'#B83030' }
    if (a === 60 || a === 300) return { t:'Gauche (60°) — Moderate Strain', c:'#C97A0A' }
    if (a === 120 || a === 240) return { t:'Partially Eclipsed (120°) — High Strain', c:'#B83030' }
    return { t:'Intermediate Conformer', c:'#6B7A99' }
  }

  // ─── CHAT ──────────────────────────────────────────────────────────────────
  async function sendChat() {
    const msg = chatInput.trim(); if (!msg || chatLoading) return
    const newMsgs = [...chatMessages, { role:'user', content:msg }]
    setChatMessages(newMsgs); setChatInput(''); setChatLoading(true)
    try {
      const res = await fetch('/api/doubt', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: newMsgs.filter(m=>m.role!=='assistant'||newMsgs.indexOf(m)>0), studentName })
      })
      const data = await res.json()
      setChatMessages([...newMsgs, { role:'assistant', content: data.reply || data.error || 'Sorry, something went wrong.' }])
    } catch(e) {
      setChatMessages([...newMsgs, { role:'assistant', content:'Network error. Please try again.' }])
    }
    setChatLoading(false)
  }

  // ─── QUIZ ──────────────────────────────────────────────────────────────────
  function answerQuiz(qi, oi) {
    if (quizState[qi] !== null) return
    const next = [...quizState]; next[qi] = oi; setQuizState(next)
    const answered = next.filter(x=>x!==null).length
    if (answered === QUIZ.length) setQuizScore(next.filter((x,i)=>x===QUIZ[i].ans).length)
  }

  // ─── NAV ───────────────────────────────────────────────────────────────────
  const navItems = [
    { id:'home', icon:'🏠', label:'Home' },
    { id:'basics', icon:'🌳', label:'Isomers Overview' },
    { id:'geometric', icon:'⚡', label:'Geometric Isomerism' },
    { id:'optical', icon:'🪞', label:'Optical Isomerism' },
    { id:'projections', icon:'📐', label:'Projections & 3D' },
    { id:'conformational', icon:'🔄', label:'Conformational' },
    { id:'counting', icon:'🔢', label:'Counting Isomers' },
    { id:'quiz', icon:'✏️', label:'Practice Quiz', badge:'15 Qs' },
    { id:'doubt', icon:'🤖', label:'Ask AI Tutor', badge:'AI' },
  ]

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    wrap:{display:'flex',minHeight:'100vh',fontFamily:"'Plus Jakarta Sans',sans-serif",background:'#F7F4EE',color:'#1A1E2E'},
    sidebar:{width:'255px',background:'#1A1E2E',position:'fixed',top:0,left:0,bottom:0,overflowY:'auto',zIndex:100,display:'flex',flexDirection:'column',transition:'transform .3s',transform: sidebarOpen || window?.innerWidth>768 ? 'translateX(0)':'translateX(-100%)'},
    logo:{padding:'26px 20px 18px',borderBottom:'1px solid rgba(255,255,255,.07)'},
    logoH:{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.1rem',lineHeight:1.3},
    logoSub:{color:'#00C4A7',fontSize:'.62rem',fontFamily:"'Fira Code',monospace",letterSpacing:'2px',textTransform:'uppercase',marginTop:'4px'},
    navSec:{color:'rgba(168,180,204,.35)',fontSize:'.62rem',letterSpacing:'3px',textTransform:'uppercase',padding:'14px 20px 5px',fontFamily:"'Fira Code',monospace"},
    navItem:(id)=>({display:'flex',alignItems:'center',gap:'10px',padding:'9px 20px',cursor:'pointer',color:section===id?'#00C4A7':'#A8B4CC',fontSize:'.83rem',fontWeight:500,background:section===id?'rgba(0,196,167,.1)':'transparent',borderLeft:`3px solid ${section===id?'#00C4A7':'transparent'}`,transition:'all .18s'}),
    navBadge:{marginLeft:'auto',fontSize:'.6rem',background:'#C97A0A',color:'#fff',padding:'2px 7px',borderRadius:'20px'},
    main:{marginLeft:'255px',flex:1,minHeight:'100vh'},
    section:{padding:'40px 48px',maxWidth:'980px'},
    pageTitle:{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:'#1A1E2E',marginBottom:'6px',lineHeight:1.2},
    pageSub:{color:'#6B7A99',fontSize:'.92rem',marginBottom:'28px'},
    h2:{fontFamily:"'Playfair Display',serif",fontSize:'1.45rem',margin:'28px 0 12px',color:'#1A1E2E'},
    card:(color)=>({background:color==='none'?'#fff':'',border:'1px solid #DED8CC',borderRadius:'12px',padding:'20px',marginBottom:'16px',borderLeft:color&&color!=='none'?`4px solid ${color}`:'',background:color==='teal'?'#E6F4F2':color==='amber'?'#FEF3E0':color==='red'?'#FCECEA':color==='blue'?'#E8F0FC':color==='purple'?'#F0E9FB':'#fff'}),
    ct:(color)=>({fontWeight:700,fontSize:'.73rem',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px',color:color==='teal'?'#007A6E':color==='amber'?'#C97A0A':color==='red'?'#B83030':color==='blue'?'#1A56B0':color==='purple'?'#6B35A0':'#1A1E2E'}),
    g2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px',marginBottom:'15px'},
    ibox:{background:'#fff',border:'2px solid #DED8CC',borderRadius:'12px',padding:'22px',margin:'18px 0',textAlign:'center'},
    iboxTitle:{fontSize:'.72rem',color:'#6B7A99',fontFamily:"'Fira Code',monospace",letterSpacing:'2px',textTransform:'uppercase',marginBottom:'14px'},
    btn:(color)=>({display:'inline-flex',alignItems:'center',gap:'6px',padding:'8px 18px',borderRadius:'8px',border:color==='outline'?'2px solid #DED8CC':'none',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:'.83rem',fontWeight:600,background:color==='teal'?'#007A6E':color==='outline'?'transparent':'#C97A0A',color:color==='outline'?'#1A1E2E':'#fff',transition:'all .18s'}),
    tag:(color)=>({display:'inline-block',padding:'2px 9px',borderRadius:'20px',fontSize:'.68rem',fontWeight:700,marginRight:'5px',marginBottom:'10px',background:color==='j'?'#FEF3E0':color==='i'?'#FCECEA':'#F0E9FB',color:color==='j'?'#C97A0A':color==='i'?'#B83030':'#6B35A0'}),
    step:{display:'flex',gap:'14px',marginBottom:'14px'},
    stepNum:{minWidth:'28px',height:'28px',background:'#007A6E',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.8rem',flexShrink:0,marginTop:'2px'},
    table:{width:'100%',borderCollapse:'collapse',margin:'14px 0',fontSize:'.82rem'},
    th:{background:'#1A1E2E',color:'#fff',padding:'9px 13px',textAlign:'left',fontSize:'.77rem'},
    td:{padding:'9px 13px',borderBottom:'1px solid #DED8CC'},
    hl:{background:'linear-gradient(135deg,#007A6E,#00967D)',color:'#fff',borderRadius:'12px',padding:'18px 22px',margin:'18px 0'},
    menuBtn:{display:'none',position:'fixed',top:'14px',left:'14px',zIndex:200,background:'#1A1E2E',color:'#fff',border:'none',padding:'8px 13px',borderRadius:'8px',cursor:'pointer',fontSize:'1.1rem'},
    slGroup:{display:'flex',alignItems:'center',gap:'14px',justifyContent:'center',margin:'12px 0'},
    tabBar:{display:'flex',gap:'4px',background:'#EFEBE2',borderRadius:'10px',padding:'4px',marginBottom:'18px',flexWrap:'wrap'},
    tab:(active)=>({flex:1,minWidth:'80px',padding:'8px 10px',borderRadius:'8px',border:'none',background:active?'#fff':'transparent',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:'.8rem',fontWeight:600,color:active?'#007A6E':'#6B7A99',transition:'all .18s'}),
    clabel:(c)=>({fontFamily:"'Fira Code',monospace",fontSize:'.88rem',fontWeight:600,textAlign:'center',padding:'8px',borderRadius:'8px',marginTop:'8px',background:c==='s'?'#E6F4F2':c==='e'?'#FCECEA':c==='a'?'#E8F0FC':'#FEF3E0',color:c==='s'?'#007A6E':c==='e'?'#B83030':c==='a'?'#1A56B0':'#C97A0A'}),
  }

  // ─── SECTION: HOME ────────────────────────────────────────────────────────
  const SectionHome = () => (
    <div style={S.section}>
      <div style={{background:'linear-gradient(135deg,#1A1E2E 0%,#252C48 100%)',borderRadius:'18px',padding:'44px',marginBottom:'28px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 75% 50%,rgba(0,196,167,.14) 0%,transparent 60%)',pointerEvents:'none'}}/>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.4rem',color:'#fff',lineHeight:1.2,position:'relative'}}>Welcome, <span style={{color:'#00C4A7'}}>{studentName}</span>!<br/>Master Stereoisomerism</h1>
        <p style={{color:'rgba(255,255,255,.65)',fontSize:'.92rem',maxWidth:'480px',position:'relative',margin:'14px 0 22px'}}>Interactive 3D visualizations, Newman projection rotator, Fischer projections, R/S calculator, and 15 JEE-level problems — all in one place.</p>
        <button style={S.btn('teal')} onClick={()=>setSection('basics')}>Start Learning →</button>
      </div>

      <h2 style={{...S.h2,marginTop:0}}>What You'll Learn</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'13px',marginBottom:'22px'}}>
        {[{id:'basics',icon:'🌳',name:'Classification',desc:'Every type of isomer'},{id:'geometric',icon:'⚡',name:'Geometric',desc:'cis-trans, E-Z, cyclic'},{id:'optical',icon:'🪞',name:'Optical',desc:'R/S, chirality, meso'},{id:'projections',icon:'📐',name:'4 Projections',desc:'Fischer, Newman, Sawhorse'},{id:'conformational',icon:'🔄',name:'Conformational',desc:'Chair, boat & rotation'},{id:'counting',icon:'🔢',name:'Counting',desc:'2ⁿ rule, meso detection'}].map(t=>(
          <div key={t.id} onClick={()=>setSection(t.id)} style={{background:'#fff',border:'1px solid #DED8CC',borderRadius:'12px',padding:'18px',cursor:'pointer',transition:'all .22s',textAlign:'center'}}>
            <div style={{fontSize:'1.8rem',marginBottom:'8px'}}>{t.icon}</div>
            <div style={{fontWeight:700,fontSize:'.85rem',marginBottom:'3px'}}>{t.name}</div>
            <div style={{fontSize:'.73rem',color:'#6B7A99'}}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div style={{...S.card('amber'),borderLeft:'4px solid #C97A0A'}}>
        <div style={S.ct('amber')}>⚠️ JEE Most Common Mistakes — Read This First!</div>
        <ul style={{marginLeft:'20px',fontSize:'.87rem',lineHeight:2.1}}>
          <li>Forgetting that <strong>horizontal bonds in Fischer projection come TOWARD you</strong></li>
          <li>Missing meso compounds while counting → wrong answer for 2ⁿ questions</li>
          <li>Wrong priority assignment in CIP rules → incorrect R/S</li>
          <li>Thinking amines with 4 different groups on nitrogen are chiral (umbrella inversion!)</li>
          <li>Confusing <strong>enantiomers</strong> (mirror images) with <strong>diastereomers</strong> (non-mirror stereoisomers)</li>
          <li>Rotating Fischer projection by 90° and calling it the same compound (it's the enantiomer!)</li>
        </ul>
      </div>
    </div>
  )

  // ─── SECTION: BASICS ──────────────────────────────────────────────────────
  const SectionBasics = () => (
    <div style={S.section}>
      <span style={S.tag('j')}>JEE Fundamentals</span>
      <h1 style={S.pageTitle}>Isomers: The Big Picture</h1>
      <p style={S.pageSub}>Same molecular formula — different arrangements. Here is the complete map.</p>
      <div style={{...S.card('blue'),borderLeft:'4px solid #1A56B0'}}>
        <div style={S.ct('blue')}>📌 Core Definition</div>
        <p style={{margin:0,fontSize:'.9rem'}}><strong>Isomers</strong> = same molecular formula, different structural or spatial arrangements. They are distinct compounds with different properties.</p>
      </div>
      <h2 style={S.h2}>The Complete Classification Tree</h2>
      <div style={{background:'#fff',border:'2px solid #DED8CC',borderRadius:'12px',padding:'22px',overflowX:'auto'}}>
        <svg viewBox="0 0 780 420" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',minWidth:'500px',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#6B7A99"/></marker></defs>
          <rect x="290" y="8" width="180" height="42" rx="8" fill="#1A1E2E"/><text x="380" y="33" fill="#fff" textAnchor="middle" fontSize="13" fontWeight="700">ISOMERS</text>
          <line x1="310" y1="50" x2="175" y2="98" stroke="#6B7A99" strokeWidth="1.5" markerEnd="url(#ah)"/>
          <line x1="450" y1="50" x2="585" y2="98" stroke="#6B7A99" strokeWidth="1.5" markerEnd="url(#ah)"/>
          <rect x="68" y="100" width="215" height="48" rx="8" fill="#1A56B0"/><text x="175" y="120" fill="#fff" textAnchor="middle" fontSize="11" fontWeight="700">Constitutional Isomers</text><text x="175" y="138" fill="rgba(255,255,255,.75)" textAnchor="middle" fontSize="9">Same formula, different connectivity</text>
          <line x1="120" y1="148" x2="70" y2="192" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <line x1="175" y1="148" x2="175" y2="192" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <line x1="230" y1="148" x2="280" y2="192" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <rect x="28" y="194" width="88" height="32" rx="6" fill="#E8F0FC" stroke="#1A56B0" strokeWidth="1.5"/><text x="72" y="214" fill="#1A56B0" textAnchor="middle" fontSize="9" fontWeight="600">Chain</text>
          <rect x="130" y="194" width="92" height="32" rx="6" fill="#E8F0FC" stroke="#1A56B0" strokeWidth="1.5"/><text x="176" y="214" fill="#1A56B0" textAnchor="middle" fontSize="9" fontWeight="600">Position</text>
          <rect x="240" y="194" width="92" height="32" rx="6" fill="#E8F0FC" stroke="#1A56B0" strokeWidth="1.5"/><text x="286" y="209" fill="#1A56B0" textAnchor="middle" fontSize="9" fontWeight="600">Functional</text><text x="286" y="221" fill="#1A56B0" textAnchor="middle" fontSize="9" fontWeight="600">Group</text>
          <rect x="480" y="100" width="215" height="48" rx="8" fill="#007A6E"/><text x="587" y="120" fill="#fff" textAnchor="middle" fontSize="11" fontWeight="700">Stereoisomers</text><text x="587" y="138" fill="rgba(255,255,255,.75)" textAnchor="middle" fontSize="9">Same connectivity, different 3D arrangement</text>
          <line x1="535" y1="148" x2="500" y2="192" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <line x1="640" y1="148" x2="675" y2="192" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <rect x="408" y="194" width="150" height="42" rx="7" fill="#E6F4F2" stroke="#007A6E" strokeWidth="2"/><text x="483" y="212" fill="#007A6E" textAnchor="middle" fontSize="10" fontWeight="700">Geometric Isomers</text><text x="483" y="228" fill="#007A6E" textAnchor="middle" fontSize="8">cis-trans, E-Z</text>
          <rect x="574" y="194" width="150" height="42" rx="7" fill="#E6F4F2" stroke="#007A6E" strokeWidth="2"/><text x="649" y="212" fill="#007A6E" textAnchor="middle" fontSize="10" fontWeight="700">Optical Isomers</text><text x="649" y="228" fill="#007A6E" textAnchor="middle" fontSize="8">enantiomers, diastereomers</text>
          <line x1="620" y1="236" x2="595" y2="280" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <line x1="678" y1="236" x2="703" y2="280" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <rect x="528" y="282" width="128" height="36" rx="6" fill="#F0E9FB" stroke="#6B35A0" strokeWidth="1.5"/><text x="592" y="299" fill="#6B35A0" textAnchor="middle" fontSize="9" fontWeight="600">Enantiomers</text><text x="592" y="312" fill="#6B35A0" textAnchor="middle" fontSize="7">Non-superimposable mirror images</text>
          <rect x="664" y="282" width="110" height="36" rx="6" fill="#F0E9FB" stroke="#6B35A0" strokeWidth="1.5"/><text x="719" y="299" fill="#6B35A0" textAnchor="middle" fontSize="9" fontWeight="600">Diastereomers</text><text x="719" y="312" fill="#6B35A0" textAnchor="middle" fontSize="7">Non-mirror stereoisomers</text>
          <line x1="719" y1="318" x2="719" y2="362" stroke="#6B7A99" strokeWidth="1.2" markerEnd="url(#ah)"/>
          <rect x="660" y="364" width="120" height="32" rx="6" fill="#FCECEA" stroke="#B83030" strokeWidth="1.5"/><text x="720" y="377" fill="#B83030" textAnchor="middle" fontSize="9" fontWeight="600">includes Meso</text><text x="720" y="389" fill="#B83030" textAnchor="middle" fontSize="7">compounds (has POS)</text>
          <line x1="380" y1="50" x2="380" y2="364" stroke="#C97A0A" strokeWidth="1.5" strokeDasharray="5,4"/>
          <rect x="316" y="364" width="130" height="32" rx="6" fill="#FEF3E0" stroke="#C97A0A" strokeWidth="1.5"/><text x="381" y="377" fill="#C97A0A" textAnchor="middle" fontSize="9" fontWeight="600">Conformational Isomers</text><text x="381" y="389" fill="#C97A0A" textAnchor="middle" fontSize="7">(conformers — not true isomers)</text>
        </svg>
      </div>
      <h2 style={S.h2}>Key Definitions at a Glance</h2>
      <div style={{overflowX:'auto'}}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Type</th><th style={S.th}>Mirror Images?</th><th style={S.th}>Superimposable?</th><th style={S.th}>Physical Props</th><th style={S.th}>Optically Active?</th></tr></thead>
          <tbody>
            {[['Enantiomers','✅ Yes','❌ No','Identical (except [α])','Yes (opposite sign)'],['Diastereomers','❌ No','❌ No','Different (BP, MP…)','Usually yes'],['Meso Compounds','✅ (superimposable!)','✅ Yes','Same as mirror','❌ No (POS cancels)'],['Geometric Isomers','❌ No','❌ No','Different','May or may not be']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...S.td,background:i%2===0?'#EFEBE2':'#fff'}}>{j===0?<strong>{c}</strong>:c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ─── SECTION: GEOMETRIC ──────────────────────────────────────────────────
  const SectionGeometric = () => (
    <div style={S.section}>
      <span style={S.tag('j')}>JEE Core</span><span style={S.tag('i')}>High Weightage</span>
      <h1 style={S.pageTitle}>Geometric Isomerism</h1>
      <p style={S.pageSub}>Restricted rotation creates two different spatial arrangements of substituents.</p>
      <div style={{...S.card('teal'),borderLeft:'4px solid #007A6E'}}>
        <div style={S.ct('teal')}>📌 Two Conditions Required (BOTH must be satisfied)</div>
        <div style={{marginTop:'8px'}}>
          {[{h:'Restricted Rotation',p:'Must have a C=C double bond, C=N bond, or a ring. These prevent free rotation.'},{h:'Two Different Groups on EACH Doubly-bonded Carbon',p:"If either carbon has two identical substituents (like CH₂=), geometric isomerism is impossible. Example: CH₂=CH₂ ✗, CHBr=CHBr ✓"}].map((s,i)=>(
            <div key={i} style={S.step}><div style={S.stepNum}>{i+1}</div><div><h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'3px'}}>{s.h}</h4><p style={{margin:0,fontSize:'.83rem'}}>{s.p}</p></div></div>
          ))}
        </div>
      </div>

      <h2 style={S.h2}>cis / trans Comparison</h2>
      <div style={S.g2}>
        {[{label:'CIS — Same Side',color:'#007A6E',desc:'Both priority groups (or both similar groups) are on the SAME side of the double bond.'},{label:'TRANS — Opposite Sides',color:'#B83030',desc:'Groups are on OPPOSITE sides. Trans isomers are generally more stable (less steric strain).'}].map((it,i)=>(
          <div key={i} style={S.ibox}>
            <div style={S.iboxTitle}>{it.label}</div>
            <svg viewBox="0 0 220 130" style={{width:'100%',maxHeight:'130px'}}>
              <line x1="85" y1="65" x2="135" y2="65" stroke="#1A1E2E" strokeWidth="3"/>
              <line x1="85" y1="73" x2="135" y2="73" stroke="#1A1E2E" strokeWidth="3"/>
              <circle cx="80" cy="69" r="7" fill="#1A1E2E"/><circle cx="140" cy="69" r="7" fill="#1A1E2E"/>
              <line x1="73" y1="63" x2="48" y2="32" stroke="#1A1E2E" strokeWidth="2.5"/>
              <text x="38" y="27" textAnchor="middle" fontSize="14" fill="#27AE60" fontWeight="700">Cl</text>
              <line x1="73" y1="75" x2="48" y2="108" stroke="#1A1E2E" strokeWidth="2"/>
              <text x="38" y="118" textAnchor="middle" fontSize="14" fill="#888">H</text>
              <line x1="147" y1={i===0?63:75} x2="172" y2={i===0?32:108} stroke="#1A1E2E" strokeWidth={i===0?2.5:2}/>
              <text x="182" y={i===0?27:118} textAnchor="middle" fontSize="14" fill={i===0?'#27AE60':'#888'} fontWeight={i===0?'700':'400'}>{i===0?'Cl':'H'}</text>
              <line x1="147" y1={i===0?75:63} x2="172" y2={i===0?108:32} stroke="#1A1E2E" strokeWidth={i===0?2:2.5}/>
              <text x="182" y={i===0?118:27} textAnchor="middle" fontSize="14" fill={i===0?'#888':'#27AE60'} fontWeight={i===0?'400':'700'}>{i===0?'H':'Cl'}</text>
            </svg>
            <p style={{fontSize:'.8rem',color:'#6B7A99',marginTop:'8px'}}>{it.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={S.h2}>E-Z Nomenclature (CIP System)</h2>
      <div style={{...S.card('amber'),borderLeft:'4px solid #C97A0A'}}>
        <div style={S.ct('amber')}>🔑 When to Use E-Z Instead of cis-trans</div>
        <p style={{fontSize:'.87rem',margin:0}}>When neither doubly-bonded carbon carries a hydrogen — four different groups — cis/trans is ambiguous. Use E-Z based on CIP priority rules.</p>
      </div>
      <div style={{marginTop:'14px'}}>
        {[{h:'Rule 1 — Atomic Number',p:'Higher atomic number = higher priority. Quick list: I > Br > Cl > S > F > O > N > C > H'},{h:'Rule 2 — Tie? Go Deeper',p:'If first atoms tie, look at atoms attached to them. Compare substituents as sorted sets.'},{h:'Rule 3 — Double/Triple Bond = Phantom Atoms',p:'C=O means C has a phantom O and O has a phantom C. C≡N means two phantom atoms each.'},{h:'Rule 4 — Assign E or Z',p:'Z (Zusammen = together): higher-priority groups on SAME side. E (Entgegen = opposite): higher-priority groups on OPPOSITE sides.'}].map((s,i)=>(
          <div key={i} style={S.step}><div style={S.stepNum}>{i+1}</div><div><h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'3px'}}>{s.h}</h4><p style={{margin:0,fontSize:'.83rem'}}>{s.p}</p></div></div>
        ))}
      </div>

      <div style={{...S.card('red'),borderLeft:'4px solid #B83030',marginTop:'18px'}}>
        <div style={S.ct('red')}>⚡ JEE Special: Oximes & Azo Compounds</div>
        <p style={{fontSize:'.86rem',margin:0}}><strong>Oximes (R-CH=N-OH):</strong> The C=N bond is rigid → syn and anti isomers exist.</p>
        <p style={{fontSize:'.86rem',marginTop:'8px',marginBottom:0}}><strong>Azo compounds (R-N=N-R'):</strong> N=N double bond → geometric isomers. Seen in JEE Advanced papers.</p>
      </div>
    </div>
  )

  // ─── SECTION: OPTICAL ────────────────────────────────────────────────────
  const SectionOptical = () => (
    <div style={S.section}>
      <span style={S.tag('j')}>JEE Core</span><span style={S.tag('i')}>Very High Weightage</span>
      <h1 style={S.pageTitle}>Optical Isomerism</h1>
      <p style={S.pageSub}>Chirality, plane of symmetry, R/S configuration, meso compounds.</p>
      <div style={{...S.card('teal'),borderLeft:'4px solid #007A6E'}}>
        <div style={S.ct('teal')}>🤚 The Hand Analogy</div>
        <p style={{fontSize:'.88rem',margin:0}}>Your left and right hands are mirror images — but they cannot be superimposed. This is <strong>chirality</strong>. A molecule is chiral if it is non-superimposable on its mirror image.</p>
      </div>

      <h2 style={S.h2}>Plane of Symmetry (POS) — The Key to Meso!</h2>
      <div style={{...S.card('amber'),borderLeft:'4px solid #C97A0A'}}>
        <div style={S.ct('amber')}>🔍 What is POS?</div>
        <p style={{fontSize:'.87rem',marginBottom:'8px'}}>An imaginary plane that divides a molecule into two halves that are exact mirror images of each other. If POS exists → molecule is <strong>achiral</strong>.</p>
        <p style={{fontSize:'.87rem',margin:0}}>A <strong>meso compound</strong> has chiral centers BUT has a POS → the optical rotations of the two halves cancel → optically inactive!</p>
      </div>

      <div style={S.ibox}>
        <div style={S.iboxTitle}>Meso compound: POS cuts the molecule in half</div>
        <svg viewBox="0 0 440 200" style={{width:'100%',maxHeight:'200px'}}>
          <text x="80" y="35" textAnchor="middle" fontSize="11" fill="#888">CH₃</text>
          <line x1="80" y1="39" x2="80" y2="55" stroke="#1A1E2E" strokeWidth="2"/>
          <circle cx="80" cy="69" r="14" fill="#1A1E2E"/>
          <text x="80" y="73" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">C*</text>
          <text x="80" y="87" textAnchor="middle" fontSize="7" fill="#7B4CF5" fontWeight="700">2R</text>
          <line x1="80" y1="55" x2="64" y2="33" stroke="#8B5E3C" strokeWidth="1.5"/>
          <text x="55" y="28" textAnchor="middle" fontSize="10" fill="#8B5E3C" fontWeight="700">Br</text>
          <line x1="66" y1="69" x2="36" y2="69" stroke="#888" strokeWidth="1.5" strokeDasharray="4,3"/>
          <text x="24" y="73" textAnchor="middle" fontSize="11" fill="#888">H</text>
          <line x1="94" y1="69" x2="166" y2="69" stroke="#1A1E2E" strokeWidth="2.5"/>
          <circle cx="180" cy="69" r="14" fill="#1A1E2E"/>
          <text x="180" y="73" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">C*</text>
          <text x="180" y="87" textAnchor="middle" fontSize="7" fill="#7B4CF5" fontWeight="700">3S</text>
          <line x1="180" y1="55" x2="180" y2="31" stroke="#8B5E3C" strokeWidth="1.5" strokeDasharray="4,3"/>
          <text x="180" y="25" textAnchor="middle" fontSize="10" fill="#8B5E3C" fontWeight="700">Br</text>
          <line x1="194" y1="69" x2="220" y2="69" stroke="#888" strokeWidth="1.5"/>
          <text x="230" y="73" textAnchor="middle" fontSize="11" fill="#888">H</text>
          <line x1="180" y1="83" x2="180" y2="103" stroke="#1A1E2E" strokeWidth="2"/>
          <text x="180" y="115" textAnchor="middle" fontSize="11" fill="#888">CH₃</text>
          <line x1="130" y1="12" x2="130" y2="185" stroke="#C97A0A" strokeWidth="2.5" strokeDasharray="7,5"/>
          <rect x="82" y="8" width="96" height="18" rx="5" fill="#FEF3E0" stroke="#C97A0A" strokeWidth="1.5"/>
          <text x="130" y="21" textAnchor="middle" fontSize="9" fill="#C97A0A" fontWeight="700">Plane of Symmetry</text>
          <rect x="260" y="45" width="160" height="80" rx="8" fill="#E6F4F2" stroke="#007A6E" strokeWidth="2"/>
          <text x="340" y="73" textAnchor="middle" fontSize="13" fill="#007A6E" fontWeight="700">MESO</text>
          <text x="340" y="90" textAnchor="middle" fontSize="9" fill="#007A6E">Has chiral centers (2R, 3S)</text>
          <text x="340" y="104" textAnchor="middle" fontSize="9" fill="#007A6E">but optically INACTIVE</text>
          <text x="340" y="118" textAnchor="middle" fontSize="9" fill="#007A6E">(+) and (−) cancel via POS</text>
          <line x1="244" y1="69" x2="260" y2="69" stroke="#007A6E" strokeWidth="1.5" strokeDasharray="4,3"/>
        </svg>
      </div>

      <h2 style={S.h2}>R/S Configuration — Step-by-Step</h2>
      {[{h:'Assign Priorities 1–4 (CIP Rules)',p:'Group with highest atomic number = 1, lowest = 4. For ties, proceed to next atom.'},{h:'Put Group #4 Away from You',p:'Orient so the lowest-priority group (4) points directly away (into the page). Dashed bond = already pointing away ✓'},{h:'Trace Arrow: 1 → 2 → 3',p:'Draw a curved arrow from group 1 to 2 to 3 and observe direction.'},{h:'Read Configuration',p:'Clockwise = R (Rectus = Latin for right). Counter-clockwise = S (Sinister = Latin for left).'}].map((s,i)=>(
        <div key={i} style={S.step}><div style={S.stepNum}>{i+1}</div><div><h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'3px'}}>{s.h}</h4><p style={{margin:0,fontSize:'.83rem'}}>{s.p}</p></div></div>
      ))}

      <div style={S.ibox}>
        <div style={S.iboxTitle}>Practice: Assign R or S to CHFClBr</div>
        <p style={{fontSize:'.82rem',color:'#6B7A99',marginBottom:'14px'}}>Priorities: Br(35) > Cl(17) > F(9) > H(1) — H (④) is on a dash bond (pointing away ✓)</p>
        <svg viewBox="0 0 280 180" style={{width:'100%',maxHeight:'180px'}}>
          <defs><marker id="ra" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#C97A0A"/></marker></defs>
          <circle cx="140" cy="90" r="18" fill="#1A1E2E"/>
          <text x="140" y="94" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">C*</text>
          <line x1="122" y1="90" x2="68" y2="90" stroke="#8B5E3C" strokeWidth="2.5" strokeDasharray="5,3"/>
          <text x="52" y="94" textAnchor="middle" fontSize="13" fill="#8B5E3C" fontWeight="700">Br</text>
          <text x="52" y="108" textAnchor="middle" fontSize="9" fill="#8B5E3C" fontWeight="700">①</text>
          <line x1="158" y1="90" x2="212" y2="90" stroke="#27AE60" strokeWidth="2.5"/>
          <text x="226" y="94" textAnchor="middle" fontSize="13" fill="#27AE60" fontWeight="700">Cl</text>
          <text x="226" y="108" textAnchor="middle" fontSize="9" fill="#27AE60" fontWeight="700">②</text>
          <polygon points="140,72 129,45 151,45" fill="#1A56B0" opacity=".85"/>
          <text x="140" y="39" textAnchor="middle" fontSize="13" fill="#1A56B0" fontWeight="700">F</text>
          <text x="140" y="53" textAnchor="middle" fontSize="9" fill="#1A56B0" fontWeight="700">③</text>
          <line x1="140" y1="108" x2="140" y2="148" stroke="#888" strokeWidth="2" strokeDasharray="5,3"/>
          <text x="140" y="160" textAnchor="middle" fontSize="13" fill="#888">H</text>
          <text x="140" y="173" textAnchor="middle" fontSize="9" fill="#888">④ (going away ✓)</text>
          <path d="M 72,84 Q 140,38 208,84" stroke="#C97A0A" strokeWidth="2.2" fill="none" markerEnd="url(#ra)"/>
        </svg>
        {rsRevealed && <div style={{...S.clabel('a'),display:'block',marginTop:'10px'}}>Clockwise (①→②→③) with ④ pointing away → <strong>R configuration</strong></div>}
        <button style={{...S.btn('teal'),marginTop:'10px'}} onClick={()=>setRsRevealed(true)}>Reveal Answer</button>
      </div>

      <div style={{...S.hl}}>
        <h3 style={{color:'#fff',marginTop:0}}>🎯 Meso Compound — The #1 JEE Trap</h3>
        <p style={{color:'rgba(255,255,255,.9)',margin:0,fontSize:'.88rem'}}>A meso compound has chiral centers but is optically inactive because an internal Plane of Symmetry makes the molecule superimposable on its mirror image. The optical rotations of the two halves cancel internally. Key examples: meso-tartaric acid, meso-2,3-dibromobutane.</p>
      </div>

      <h2 style={S.h2}>Umbrella Inversion — Why Amines Aren't Chiral</h2>
      <div style={{...S.card('purple'),borderLeft:'4px solid #6B35A0'}}>
        <div style={S.ct('purple')}>🌂 Nitrogen Inversion</div>
        <p style={{fontSize:'.87rem',marginBottom:'8px'}}>Nitrogen with 4 different groups (including lone pair) should be chiral. BUT nitrogen undergoes rapid "umbrella inversion" — the lone pair flips from one side to the other, interconverting the two enantiomers millions of times per second at room temperature.</p>
        <p style={{fontSize:'.87rem',margin:0}}>Result: You cannot isolate either enantiomer → amines are effectively <strong>achiral in practice</strong>.</p>
        <div style={{background:'rgba(107,53,160,.1)',borderRadius:'8px',padding:'10px',marginTop:'10px',fontFamily:"'Fira Code',monospace",fontSize:'.8rem'}}>
          R₁R₂R₃N: ⇌ :NR₁R₂R₃ (rapid interconversion, ~10⁸/sec at RT)
        </div>
      </div>
    </div>
  )

  // ─── SECTION: PROJECTIONS ────────────────────────────────────────────────
  const projTabs = ['wedge','fischer','newman','sawhorse','convert']
  const projLabels = ['Wedge-Dash','Fischer','Newman','Sawhorse','Interconversion']

  const SectionProjections = () => (
    <div style={S.section}>
      <span style={S.tag('j')}>JEE Core</span>
      <h1 style={S.pageTitle}>Projections & 3D Representations</h1>
      <p style={S.pageSub}>Four ways to draw 3D molecules on 2D paper — and the critical rules for each.</p>

      <div style={S.tabBar}>
        {projTabs.map((t,i)=>(
          <button key={t} style={S.tab(activeProjection===t)} onClick={()=>setActiveProjection(t)}>{projLabels[i]}</button>
        ))}
      </div>

      {activeProjection==='wedge' && (
        <div>
          <div style={{...S.card('teal'),borderLeft:'4px solid #007A6E'}}>
            <div style={S.ct('teal')}>📌 Wedge-Dash — The Most Intuitive Representation</div>
            <p style={{margin:0,fontSize:'.87rem'}}>The standard way to show 3D structure. Directly shows spatial arrangement around any atom.</p>
          </div>
          <div style={S.g2}>
            <div>
              <h3 style={{fontSize:'1rem',fontWeight:700,margin:'16px 0 10px'}}>The Three Bond Types:</h3>
              {[{icon:'▶',label:'Solid Wedge',desc:'Bond coming toward you (out of page)',color:'#1A1E2E'},{icon:'- - -',label:'Dashed Wedge',desc:'Bond going away from you (into page)',color:'#888'},{icon:'———',label:'Plain Line',desc:'Bond in the plane of paper',color:'#1A1E2E'}].map((b,i)=>(
                <div key={i} style={{...S.card('none'),padding:'14px',display:'flex',alignItems:'center',gap:'14px',marginBottom:'10px'}}>
                  <span style={{fontFamily:"'Fira Code',monospace",color:b.color,minWidth:'40px',fontSize:'.9rem'}}>{b.icon}</span>
                  <div><strong>{b.label}</strong><br/><span style={{fontSize:'.82rem',color:'#6B7A99'}}>{b.desc}</span></div>
                </div>
              ))}
              <div style={{...S.card('amber'),borderLeft:'4px solid #C97A0A'}}>
                <div style={S.ct('amber')}>Memory Trick</div>
                <p style={{margin:0,fontSize:'.83rem'}}>Thick wedge = coming AT you (like a speeding car 🚗)<br/>Dashed = disappearing INTO the distance 🛣️</p>
              </div>
            </div>
            <div style={S.ibox}>
              <div style={S.iboxTitle}>Example: L-Alanine</div>
              <svg viewBox="0 0 200 180" style={{width:'100%',maxHeight:'180px'}}>
                <circle cx="100" cy="90" r="18" fill="#1A1E2E"/>
                <text x="100" y="95" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">C*</text>
                <polygon points="100,72 88,44 112,44" fill="#B83030" opacity=".9"/>
                <text x="100" y="38" textAnchor="middle" fontSize="12" fill="#B83030" fontWeight="700">NH₂</text>
                <line x1="82" y1="90" x2="38" y2="90" stroke="#1A1E2E" strokeWidth="2"/>
                <text x="24" y="94" textAnchor="middle" fontSize="11" fill="#C97A0A">COOH</text>
                <line x1="118" y1="90" x2="162" y2="90" stroke="#1A1E2E" strokeWidth="2"/>
                <text x="174" y="94" textAnchor="middle" fontSize="11" fill="#888">CH₃</text>
                <line x1="100" y1="108" x2="100" y2="148" stroke="#1A1E2E" strokeWidth="2" strokeDasharray="5,3"/>
                <text x="100" y="160" textAnchor="middle" fontSize="12" fill="#888">H</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {activeProjection==='fischer' && (
        <div>
          <div style={{...S.card('blue'),borderLeft:'4px solid #1A56B0'}}>
            <div style={S.ct('blue')}>📌 Fischer Projection — Used for Sugars & Amino Acids</div>
            <p style={{margin:0,fontSize:'.87rem'}}>Chain runs vertically; the most commonly misread projection in JEE!</p>
          </div>
          <div style={S.g2}>
            <div>
              <h3 style={{fontSize:'1rem',fontWeight:700,margin:'16px 0 10px'}}>The Golden Rules (Memorize These!):</h3>
              {[{h:'Vertical = Away from You',p:'Bonds going UP and DOWN point AWAY from the viewer (like dashes).'},{h:'Horizontal = Toward You',p:'Bonds going LEFT and RIGHT point TOWARD the viewer (like solid wedges).'},{h:'Convention: CHO/COOH at Top',p:'Most oxidized carbon placed at the top.'},{h:'Rotation Rules',p:'90° rotation → enantiomer. 180° rotation → same compound. Exchange of any 2 groups → enantiomer.'}].map((s,i)=>(
                <div key={i} style={S.step}><div style={S.stepNum}>{i+1}</div><div><h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'3px'}}>{s.h}</h4><p style={{margin:0,fontSize:'.83rem'}}>{s.p}</p></div></div>
              ))}
            </div>
            <div style={S.ibox}>
              <div style={S.iboxTitle}>L-Glyceraldehyde (Fischer)</div>
              <svg viewBox="0 0 200 260" style={{width:'100%',maxHeight:'260px'}}>
                <line x1="100" y1="24" x2="100" y2="236" stroke="#1A1E2E" strokeWidth="2.5"/>
                <line x1="32" y1="130" x2="168" y2="130" stroke="#1A1E2E" strokeWidth="2.5"/>
                <circle cx="100" cy="130" r="7" fill="#1A1E2E"/>
                <text x="100" y="18" textAnchor="middle" fontSize="13" fill="#B83030" fontWeight="700">CHO</text>
                <text x="100" y="248" textAnchor="middle" fontSize="12" fill="#27AE60" fontWeight="700">CH₂OH</text>
                <text x="22" y="134" textAnchor="middle" fontSize="14" fill="#C0392B" fontWeight="700">HO</text>
                <text x="178" y="134" textAnchor="middle" fontSize="14" fill="#888">H</text>
                <rect x="14" y="54" width="134" height="30" rx="5" fill="#E8F0FC"/>
                <text x="81" y="66" textAnchor="middle" fontSize="9" fill="#1A56B0" fontWeight="600">VERTICAL bonds (↑↓)</text>
                <text x="81" y="79" textAnchor="middle" fontSize="9" fill="#1A56B0">→ point AWAY from you</text>
                <rect x="14" y="165" width="134" height="30" rx="5" fill="#FCECEA"/>
                <text x="81" y="177" textAnchor="middle" fontSize="9" fill="#B83030" fontWeight="600">HORIZONTAL bonds (←→)</text>
                <text x="81" y="190" textAnchor="middle" fontSize="9" fill="#B83030">→ come TOWARD you</text>
              </svg>
              <p style={{fontSize:'.8rem',color:'#6B7A99',marginTop:'6px'}}>OH on LEFT → L-configuration</p>
            </div>
          </div>
          <div style={{...S.card('red'),borderLeft:'4px solid #B83030'}}>
            <div style={S.ct('red')}>⚠️ Top 3 Fischer Mistakes</div>
            <ul style={{marginLeft:'20px',fontSize:'.85rem',lineHeight:2.1}}>
              <li><strong>Reversing horizontal/vertical direction</strong> — horizontal bonds come TOWARD you!</li>
              <li><strong>90° rotation = same compound</strong> — WRONG! 90° rotation = enantiomer!</li>
              <li><strong>D = R always</strong> — WRONG! D refers to glyceraldehyde configuration, not CIP rules.</li>
            </ul>
          </div>
        </div>
      )}

      {activeProjection==='newman' && (
        <div>
          <div style={{...S.card('purple'),borderLeft:'4px solid #6B35A0'}}>
            <div style={S.ct('purple')}>📌 Newman Projection — Essential for Conformational Analysis</div>
            <p style={{margin:0,fontSize:'.87rem'}}>View the molecule along a C–C bond. Front carbon = dot; back carbon = large circle.</p>
          </div>
          <div style={S.g2}>
            <div>
              <h3 style={{fontSize:'1rem',fontWeight:700,margin:'16px 0 10px'}}>Reading a Newman:</h3>
              <ul style={{marginLeft:'18px',fontSize:'.85rem',lineHeight:2.1}}>
                <li><strong>Front carbon:</strong> Central dot. Its 3 bonds radiate at 120° each.</li>
                <li><strong>Back carbon:</strong> Large circle. Its 3 bonds emerge from the circle edge.</li>
                <li><strong>Dihedral angle:</strong> Angle between a front bond and the nearest back bond.</li>
                <li><strong>Staggered:</strong> Back bonds bisect front bonds = most stable</li>
                <li><strong>Eclipsed:</strong> Back bonds align with front bonds = least stable</li>
              </ul>
            </div>
            <div style={S.ibox}>
              <div style={S.iboxTitle}>Interactive Newman — Ethane</div>
              <div style={S.slGroup}>
                <label style={{fontSize:'.82rem',fontWeight:600,color:'#6B7A99'}}>Dihedral Angle</label>
                <input type="range" min="0" max="360" value={newmanAngle} onChange={e=>setNewmanAngle(Number(e.target.value))} style={{width:'120px',accentColor:'#007A6E'}}/>
                <span style={{fontFamily:"'Fira Code',monospace",fontSize:'.83rem',color:'#007A6E',fontWeight:600}}>{newmanAngle}°</span>
              </div>
              <canvas ref={canvasRef} width="200" height="200" style={{display:'block',margin:'0 auto',borderRadius:'8px',background:'#F7F4EE'}}/>
              <div style={S.clabel('s')}>{getNewmanLabel(newmanAngle,false).t}</div>
            </div>
          </div>

          <h3 style={{fontSize:'1rem',fontWeight:700,margin:'24px 0 12px'}}>n-Butane Newman Projector (JEE Favourite!)</h3>
          <div style={S.ibox}>
            <div style={S.iboxTitle}>n-Butane: C2–C3 Bond Rotation</div>
            <div style={S.slGroup}>
              <label style={{fontSize:'.82rem',fontWeight:600,color:'#6B7A99'}}>Dihedral Angle</label>
              <input type="range" min="0" max="360" value={butaneAngle} onChange={e=>setButaneAngle(Number(e.target.value))} style={{width:'120px',accentColor:'#007A6E'}}/>
              <span style={{fontFamily:"'Fira Code',monospace",fontSize:'.83rem',color:'#007A6E',fontWeight:600}}>{butaneAngle}°</span>
            </div>
            <canvas ref={butaneRef} width="280" height="200" style={{display:'block',margin:'0 auto',borderRadius:'8px',background:'#F7F4EE'}}/>
            <div style={{...S.clabel(butaneAngle===180?'s':butaneAngle===0||butaneAngle===360?'e':'g'),marginTop:'8px'}}>{getNewmanLabel(butaneAngle,true).t}</div>
          </div>

          <h3 style={{fontSize:'1rem',fontWeight:700,margin:'20px 0 10px'}}>Stability Order for n-Butane:</h3>
          <div style={S.card('none')}>
            <div style={{fontSize:'.8rem',color:'#6B7A99',fontWeight:700,marginBottom:'10px'}}>MOST STABLE → LEAST STABLE</div>
            {[{w:'85%',bg:'#007A6E',t:'Anti (180°) — CH₃ groups maximally apart'},{w:'62%',bg:'#1A56B0',t:'Gauche (60° / 300°)'},{w:'38%',bg:'#C97A0A',t:'Partially Eclipsed (120°) — CH₃ eclipses H'},{w:'18%',bg:'#B83030',t:'Fully Eclipsed (0°) — CH₃ eclipses CH₃ (worst!)'}].map((b,i)=>(
              <div key={i} style={{height:'26px',borderRadius:'5px',marginBottom:'7px',display:'flex',alignItems:'center',padding:'0 12px',fontSize:'.74rem',fontWeight:600,color:'#fff',background:b.bg,width:b.w,minWidth:'120px'}}>{b.t}</div>
            ))}
          </div>
        </div>
      )}

      {activeProjection==='sawhorse' && (
        <div>
          <div style={{...S.card('amber'),borderLeft:'4px solid #C97A0A'}}>
            <div style={S.ct('amber')}>📌 Sawhorse Projection — Perspective View</div>
            <p style={{margin:0,fontSize:'.87rem'}}>A 3D perspective drawing. The C–C bond is drawn as a diagonal line. Lower-left = front carbon, upper-right = back carbon.</p>
          </div>
          <div style={S.g2}>
            <div>
              <h3 style={{fontSize:'1rem',fontWeight:700,margin:'16px 0 10px'}}>Key Features:</h3>
              <ul style={{marginLeft:'18px',fontSize:'.85rem',lineHeight:2.1}}>
                <li>Diagonal bond: <strong>lower-left = front C</strong>, upper-right = back C</li>
                <li>Each carbon shows all 3 substituents</li>
                <li>Easier to draw conformers than Newman</li>
                <li>Shows staggered/eclipsed arrangement visually</li>
              </ul>
              <div style={{...S.card('teal'),borderLeft:'4px solid #007A6E',marginTop:'14px'}}>
                <div style={S.ct('teal')}>Sawhorse → Newman Conversion</div>
                <p style={{fontSize:'.83rem',margin:0}}>Just "look along" the diagonal C–C bond from the lower-left end. The front C becomes the dot, back C becomes the circle.</p>
              </div>
            </div>
            <div style={S.ibox}>
              <div style={S.iboxTitle}>Staggered Ethane (Sawhorse)</div>
              <svg viewBox="0 0 230 190" style={{width:'100%',maxHeight:'190px'}}>
                <line x1="80" y1="140" x2="150" y2="75" stroke="#1A1E2E" strokeWidth="3"/>
                <circle cx="80" cy="140" r="8" fill="#1A1E2E"/>
                <circle cx="150" cy="75" r="8" fill="#1A1E2E"/>
                <line x1="80" y1="140" x2="38" y2="110" stroke="#888" strokeWidth="2"/>
                <text x="26" y="108" fontSize="11" fill="#888">H</text>
                <line x1="80" y1="140" x2="40" y2="162" stroke="#888" strokeWidth="2"/>
                <text x="25" y="166" fontSize="11" fill="#888">H</text>
                <line x1="80" y1="140" x2="80" y2="178" stroke="#888" strokeWidth="2"/>
                <text x="74" y="188" fontSize="11" fill="#888">H</text>
                <line x1="150" y1="75" x2="192" y2="45" stroke="#888" strokeWidth="2"/>
                <text x="200" y="42" fontSize="11" fill="#888">H</text>
                <line x1="150" y1="75" x2="192" y2="95" stroke="#888" strokeWidth="2"/>
                <text x="200" y="99" fontSize="11" fill="#888">H</text>
                <line x1="150" y1="75" x2="150" y2="36" stroke="#888" strokeWidth="2"/>
                <text x="143" y="28" fontSize="11" fill="#888">H</text>
                <text x="58" y="172" fontSize="9" fill="#1A56B0" fontWeight="600">Front C</text>
                <text x="152" y="32" fontSize="9" fill="#1A56B0" fontWeight="600">Back C</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {activeProjection==='convert' && (
        <div>
          <h3 style={{fontSize:'1rem',fontWeight:700,margin:'0 0 14px'}}>How to Interconvert Projections</h3>
          <div style={{overflowX:'auto'}}>
            <table style={S.table}>
              <thead><tr><th style={S.th}>From → To</th><th style={S.th}>Method</th></tr></thead>
              <tbody>
                {[['Wedge-Dash → Fischer','Orient main chain vertically. Horizontal substituents (toward you) become horizontal in Fischer. Wedge bonds → horizontal lines; dash bonds → vertical.'],['Fischer → Wedge-Dash','Horizontal bonds → solid wedges (toward you). Vertical bonds → dashed wedges (away from you).'],['Fischer → Newman','Pick the C–C bond to view along. Horizontal (toward you) = front bonds; vertical chain = away. Rotate to align.'],['Newman → Sawhorse','Draw C–C bond as diagonal. Front dot = lower-left; back circle = upper-right. Place substituents.'],['Sawhorse → Newman','Position eye at lower-left end, look along the diagonal bond.']].map((r,i)=>(
                  <tr key={i}><td style={{...S.td,background:i%2===0?'#EFEBE2':'#fff',fontWeight:600,whiteSpace:'nowrap'}}>{r[0]}</td><td style={{...S.td,background:i%2===0?'#EFEBE2':'#fff',fontSize:'.82rem'}}>{r[1]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{...S.card('red'),borderLeft:'4px solid #B83030',marginTop:'14px'}}>
            <div style={S.ct('red')}>🔑 Critical: Fischer Rotation Rules</div>
            <ul style={{marginLeft:'18px',fontSize:'.85rem',lineHeight:2.2}}>
              <li><strong>Rotate 180°</strong> → same compound ✓</li>
              <li><strong>Rotate 90°</strong> → enantiomer ⚠️</li>
              <li><strong>Swap any 2 groups once</strong> → enantiomer</li>
              <li><strong>Swap any 2 groups twice</strong> → same compound</li>
              <li>Do NOT lift the Fischer projection out of the plane of paper!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )

  // ─── SECTION: CONFORMATIONAL ─────────────────────────────────────────────
  const SectionConformational = () => (
    <div style={S.section}>
      <span style={S.tag('j')}>JEE Advanced</span>
      <h1 style={S.pageTitle}>Conformational Isomers</h1>
      <p style={S.pageSub}>Same compound, different shapes — arising from rotation around single bonds.</p>
      <div style={{...S.card('teal'),borderLeft:'4px solid #007A6E'}}>
        <div style={S.ct('teal')}>📌 What Are Conformers?</div>
        <p style={{fontSize:'.88rem',margin:0}}>Conformers arise from rotation about σ (single) bonds. They are the <strong>same compound</strong> — not true isomers — and interconvert rapidly at room temperature. They cannot be isolated separately (unlike stereoisomers).</p>
      </div>

      <div style={S.g2}>
        <div style={{...S.card('blue'),borderLeft:'4px solid #1A56B0'}}>
          <div style={S.ct('blue')}>Staggered Conformer</div>
          <ul style={{marginLeft:'18px',fontSize:'.83rem',lineHeight:2.1}}>
            <li>Back bonds are 60° offset from front bonds</li>
            <li>Minimum torsional strain → <strong>most stable</strong></li>
            <li>Anti (180°) is more stable than Gauche (60°)</li>
          </ul>
        </div>
        <div style={{...S.card('red'),borderLeft:'4px solid #B83030'}}>
          <div style={S.ct('red')}>Eclipsed Conformer</div>
          <ul style={{marginLeft:'18px',fontSize:'.83rem',lineHeight:2.1}}>
            <li>Back bonds align behind front bonds (0°)</li>
            <li>Maximum torsional strain → <strong>least stable</strong></li>
            <li>Fully eclipsed (0°) = worst for n-butane</li>
          </ul>
        </div>
      </div>

      <h2 style={S.h2}>Types of Strain</h2>
      <div style={{overflowX:'auto'}}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Strain Type</th><th style={S.th}>Cause</th><th style={S.th}>Found In</th><th style={S.th}>Effect</th></tr></thead>
          <tbody>
            {[['Torsional (Pitzer)','Repulsion between bond electron pairs','Eclipsed conformers','Destabilizes eclipsed'],['Steric (van der Waals)','Repulsion between bulky groups too close','Gauche, eclipsed','Larger groups worse'],['Angle Strain','Bond angle deviation from ideal','Small rings (cyclopropane)','Weakens bonds'],['Ring Strain','Combined angle + torsional + steric','Cyclic compounds','Determines ring stability']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...S.td,background:i%2===0?'#EFEBE2':'#fff'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={S.h2}>Cyclohexane Chair Conformations</h2>
      <div style={{...S.card('amber'),borderLeft:'4px solid #C97A0A'}}>
        <div style={S.ct('amber')}>⭐ JEE Favourite — Chair Conformation</div>
        <ul style={{marginLeft:'18px',fontSize:'.85rem',lineHeight:2.2}}>
          <li><strong>Chair = most stable</strong> for cyclohexane (no angle strain, all staggered)</li>
          <li><strong>Axial bonds:</strong> Alternately up/down, parallel to ring axis</li>
          <li><strong>Equatorial bonds:</strong> Slightly tilted, around the "equator" of the ring</li>
          <li><strong>Ring flip:</strong> All axial bonds become equatorial and vice versa</li>
          <li><strong>Bulky groups prefer equatorial</strong> position (less 1,3-diaxial strain)</li>
          <li>1,3-diaxial strain ≈ 3.8 kJ/mol for each CH₃ axial vs equatorial</li>
        </ul>
      </div>

      <div style={S.ibox}>
        <div style={S.iboxTitle}>Cyclohexane Chair — Key Positions</div>
        <svg viewBox="0 0 420 180" style={{width:'100%',maxHeight:'180px'}}>
          {/* Chair outline */}
          <polyline points="60,100 120,130 180,100 240,130 300,100 240,70 180,100 120,70 60,100" fill="none" stroke="#1A1E2E" strokeWidth="3" strokeLinejoin="round"/>
          {/* Axial bonds */}
          <line x1="120" y1="130" x2="120" y2="160" stroke="#B83030" strokeWidth="2"/>
          <line x1="180" y1="100" x2="180" y2="70" stroke="#B83030" strokeWidth="2"/>
          <line x1="240" y1="130" x2="240" y2="160" stroke="#B83030" strokeWidth="2"/>
          <line x1="120" y1="70" x2="120" y2="40" stroke="#B83030" strokeWidth="2"/>
          <line x1="240" y1="70" x2="240" y2="40" stroke="#B83030" strokeWidth="2"/>
          <line x1="300" y1="100" x2="300" y2="70" stroke="#B83030" strokeWidth="2"/>
          <text x="340" y="55" fontSize="10" fill="#B83030" fontWeight="700">Axial (a)</text>
          <text x="340" y="68" fontSize="9" fill="#B83030">up or down</text>
          {/* Equatorial bonds */}
          <line x1="120" y1="130" x2="90" y2="148" stroke="#1A56B0" strokeWidth="2"/>
          <line x1="240" y1="130" x2="270" y2="148" stroke="#1A56B0" strokeWidth="2"/>
          <line x1="180" y1="100" x2="150" y2="88" stroke="#1A56B0" strokeWidth="2"/>
          <text x="340" y="100" fontSize="10" fill="#1A56B0" fontWeight="700">Equatorial (e)</text>
          <text x="340" y="113" fontSize="9" fill="#1A56B0">slightly tilted out</text>
          <text x="180" y="175" textAnchor="middle" fontSize="10" fill="#007A6E" fontWeight="700">Bulky groups prefer EQUATORIAL (less 1,3-diaxial strain)</text>
        </svg>
      </div>
    </div>
  )

  // ─── SECTION: COUNTING ───────────────────────────────────────────────────
  const ex = COUNTING_EXAMPLES[countingExample]
  const SectionCounting = () => (
    <div style={S.section}>
      <span style={S.tag('j')}>JEE Core</span><span style={S.tag('i')}>High Weightage</span>
      <h1 style={S.pageTitle}>Counting Stereoisomers</h1>
      <p style={S.pageSub}>The 2ⁿ rule, meso detection, and step-by-step method for any molecule.</p>

      <div style={S.hl}>
        <h3 style={{color:'#fff',marginTop:0}}>📐 The Master Formula</h3>
        <p style={{color:'rgba(255,255,255,.9)',margin:'8px 0',fontSize:'.9rem'}}>Maximum stereoisomers = <strong>2ⁿ</strong> where n = number of chiral centers</p>
        <p style={{color:'rgba(255,255,255,.75)',margin:0,fontSize:'.85rem'}}>But ALWAYS check for meso compounds! Meso compounds reduce the count.</p>
      </div>

      <h2 style={S.h2}>When Meso Compounds Exist</h2>
      <div style={{...S.card('amber'),borderLeft:'4px solid #C97A0A'}}>
        <div style={S.ct('amber')}>🔍 Meso Detection Checklist</div>
        <ul style={{marginLeft:'18px',fontSize:'.85rem',lineHeight:2.1}}>
          <li>The molecule has an <strong>even number of chiral centers</strong></li>
          <li>The two halves of the molecule are <strong>identical</strong> (same groups)</li>
          <li>A plane of symmetry (POS) can be drawn through the middle</li>
          <li>When POS exists → that stereoisomer is meso → subtract from 2ⁿ count</li>
        </ul>
      </div>

      <h2 style={S.h2}>Step-by-Step Examples</h2>
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'18px'}}>
        {COUNTING_EXAMPLES.map((e,i)=>(
          <button key={i} onClick={()=>setCountingExample(i)} style={{...S.btn(countingExample===i?'teal':'outline'),fontSize:'.78rem',padding:'6px 14px'}}>{e.mol}</button>
        ))}
      </div>

      <div style={{background:'#fff',border:'2px solid #DED8CC',borderRadius:'12px',padding:'24px'}}>
        <h3 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:'16px',color:'#1A1E2E'}}>{ex.mol}</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
          {[{l:'Chiral Centers',v:ex.centers},{l:'2ⁿ Maximum',v:Math.pow(2,ex.centers)},{l:'Total Stereoisomers',v:ex.total},{l:'Optically Active',v:ex.enantiomers},{l:'Meso Forms',v:ex.meso},{l:'Meso Exists?',v:ex.hasMeso?'✅ Yes':'❌ No'}].map((stat,i)=>(
            <div key={i} style={{background:'#F7F4EE',borderRadius:'8px',padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'.7rem',color:'#6B7A99',fontFamily:"'Fira Code',monospace",textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{stat.l}</div>
              <div style={{fontSize:'1.6rem',fontWeight:700,color:'#1A1E2E',fontFamily:"'Playfair Display',serif"}}>{stat.v}</div>
            </div>
          ))}
        </div>
        <h4 style={{fontSize:'.9rem',fontWeight:700,marginBottom:'12px',color:'#007A6E'}}>Step-by-Step Solution:</h4>
        {ex.steps.map((step,i)=>(
          <div key={i} style={S.step}>
            <div style={S.stepNum}>{i+1}</div>
            <div style={{fontSize:'.85rem',paddingTop:'4px'}}>{step}</div>
          </div>
        ))}
      </div>

      <h2 style={S.h2}>Quick Reference Table</h2>
      <div style={{overflowX:'auto'}}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Chiral Centers (n)</th><th style={S.th}>2ⁿ (max)</th><th style={S.th}>Meso possible?</th><th style={S.th}>Actual count if meso exists</th></tr></thead>
          <tbody>
            {[[1,2,'No','2 (1 enantiomeric pair)'],[2,4,'Yes (if identical groups)','3 (1 pair + 1 meso)'],[3,8,'Yes','4 to 6 depending on symmetry'],[4,16,'Yes','depends on structure']].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...S.td,background:i%2===0?'#EFEBE2':'#fff'}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ─── SECTION: QUIZ ───────────────────────────────────────────────────────
  const SectionQuiz = () => (
    <div style={S.section}>
      <h1 style={S.pageTitle}>Practice Quiz</h1>
      <p style={S.pageSub}>15 JEE-level questions. Answers revealed immediately with detailed explanations.</p>

      {quizScore !== null && (
        <div style={{background:quizScore>=10?'#E6F4F2':'#FCECEA',border:`2px solid ${quizScore>=10?'#007A6E':'#B83030'}`,borderRadius:'12px',padding:'22px',marginBottom:'24px',textAlign:'center'}}>
          <div style={{fontSize:'2.5rem',fontWeight:700,color:quizScore>=10?'#007A6E':'#B83030',fontFamily:"'Playfair Display',serif"}}>{quizScore}/15</div>
          <div style={{fontSize:'1rem',marginTop:'8px',fontWeight:600}}>{quizScore>=12?'🎉 Excellent! JEE ready!':quizScore>=8?'👍 Good! Review the mistakes above.':'📚 Keep practicing — review the weak areas.'}</div>
          <button style={{...S.btn('teal'),marginTop:'14px'}} onClick={()=>{setQuizState(Array(QUIZ.length).fill(null));setQuizScore(null)}}>Retake Quiz</button>
        </div>
      )}

      {QUIZ.map((q,qi)=>(
        <div key={qi} style={{background:'#fff',border:'1px solid #DED8CC',borderRadius:'12px',padding:'22px',marginBottom:'18px'}}>
          <p style={{fontWeight:600,marginBottom:'14px',fontSize:'.92rem'}}>Q{qi+1}. {q.q}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'9px'}}>
            {q.opts.map((opt,oi)=>{
              const answered = quizState[qi] !== null
              const isCorrect = oi === q.ans
              const isChosen = quizState[qi] === oi
              let bg='#fff', border='2px solid #DED8CC', color='#1A1E2E'
              if (answered && isCorrect) { bg='#E6F4F2'; border='2px solid #007A6E'; color='#007A6E' }
              if (answered && isChosen && !isCorrect) { bg='#FCECEA'; border='2px solid #B83030'; color='#B83030' }
              return (
                <button key={oi} onClick={()=>answerQuiz(qi,oi)} disabled={answered} style={{padding:'10px 13px',border,borderRadius:'8px',cursor:answered?'default':'pointer',fontSize:'.83rem',transition:'all .18s',background:bg,color,textAlign:'left',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:answered&&isCorrect?700:400}}>
                  {String.fromCharCode(65+oi)}. {opt}
                </button>
              )
            })}
          </div>
          {quizState[qi] !== null && (
            <div style={{marginTop:'12px',padding:'12px',background:'#E6F4F2',borderRadius:'8px',fontSize:'.83rem',color:'#007A6E',borderLeft:'3px solid #007A6E'}}>
              <strong>Explanation:</strong> {q.exp}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  // ─── SECTION: DOUBT ──────────────────────────────────────────────────────
  const SectionDoubt = () => (
    <div style={S.section}>
      <h1 style={S.pageTitle}>Ask AI Tutor</h1>
      <p style={S.pageSub}>Ask anything about JEE Chemistry — stereoisomerism, reactions, mechanisms, or any topic.</p>
      <div style={{background:'#fff',border:'1px solid #DED8CC',borderRadius:'12px',display:'flex',flexDirection:'column',height:'520px'}}>
        <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'14px'}}>
          {chatMessages.map((m,i)=>(
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
              <div style={{maxWidth:'80%',padding:'12px 16px',borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',background:m.role==='user'?'#007A6E':'#F7F4EE',color:m.role==='user'?'#fff':'#1A1E2E',fontSize:'.87rem',lineHeight:1.6,whiteSpace:'pre-wrap'}}>
                {m.role==='assistant' && <span style={{fontSize:'.7rem',color:'#6B7A99',display:'block',marginBottom:'4px',fontFamily:"'Fira Code',monospace"}}>AI TUTOR</span>}
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{display:'flex',justifyContent:'flex-start'}}>
              <div style={{padding:'12px 16px',borderRadius:'18px 18px 18px 4px',background:'#F7F4EE',fontSize:'.87rem',color:'#6B7A99'}}>Thinking...</div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>
        <div style={{padding:'16px',borderTop:'1px solid #DED8CC',display:'flex',gap:'10px'}}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendChat()} placeholder="Ask a chemistry question..." style={{flex:1,background:'#F7F4EE',border:'1px solid #DED8CC',borderRadius:'10px',padding:'12px 16px',fontSize:'.87rem',fontFamily:"'Plus Jakarta Sans',sans-serif",outline:'none',color:'#1A1E2E'}}/>
          <button onClick={sendChat} disabled={chatLoading} style={{...S.btn('teal'),padding:'12px 20px',opacity:chatLoading?.5:1}}>Send →</button>
        </div>
      </div>
      <div style={{marginTop:'14px',display:'flex',flexWrap:'wrap',gap:'8px'}}>
        {['What is a meso compound?','How do I assign R/S configuration?','Explain umbrella inversion in amines','What is the difference between enantiomers and diastereomers?','How do I draw a Newman projection?'].map(q=>(
          <button key={q} onClick={()=>{setChatInput(q)}} style={{...S.btn('outline'),fontSize:'.76rem',padding:'6px 12px'}}>{q}</button>
        ))}
      </div>
    </div>
  )

  const sections = { home:<SectionHome/>, basics:<SectionBasics/>, geometric:<SectionGeometric/>, optical:<SectionOptical/>, projections:<SectionProjections/>, conformational:<SectionConformational/>, counting:<SectionCounting/>, quiz:<SectionQuiz/>, doubt:<SectionDoubt/> }

  if (!studentName) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Loading...</div>

  return (
    <div style={S.wrap}>
      {/* Mobile menu button */}
      <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{display:'none',position:'fixed',top:'14px',left:'14px',zIndex:200,background:'#1A1E2E',color:'#fff',border:'none',padding:'8px 13px',borderRadius:'8px',cursor:'pointer',fontSize:'1.1rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>☰</button>

      {/* Sidebar */}
      <nav style={{width:'255px',background:'#1A1E2E',position:'fixed',top:0,left:0,bottom:0,overflowY:'auto',zIndex:100,display:'flex',flexDirection:'column'}}>
        <div style={S.logo}>
          <h1 style={S.logoH}>Stereo<br/>isomerism</h1>
          <p style={S.logoSub}>JEE Complete Guide</p>
          <p style={{color:'rgba(255,255,255,.4)',fontSize:'.7rem',marginTop:'8px'}}>Hi, {studentName}! 👋</p>
        </div>
        <div style={{padding:'14px 0',flex:1}}>
          <div style={{color:'rgba(168,180,204,.35)',fontSize:'.62rem',letterSpacing:'3px',textTransform:'uppercase',padding:'14px 20px 5px',fontFamily:"'Fira Code',monospace"}}>Getting Started</div>
          {navItems.slice(0,2).map(n=>(
            <div key={n.id} onClick={()=>{setSection(n.id);setSidebarOpen(false)}} style={S.navItem(n.id)}>
              <span style={{width:'20px',textAlign:'center',fontSize:'.95rem'}}>{n.icon}</span>
              {n.label}
              {n.badge && <span style={S.navBadge}>{n.badge}</span>}
            </div>
          ))}
          <div style={{color:'rgba(168,180,204,.35)',fontSize:'.62rem',letterSpacing:'3px',textTransform:'uppercase',padding:'14px 20px 5px',fontFamily:"'Fira Code',monospace"}}>Core Chapters</div>
          {navItems.slice(2,6).map(n=>(
            <div key={n.id} onClick={()=>{setSection(n.id);setSidebarOpen(false)}} style={S.navItem(n.id)}>
              <span style={{width:'20px',textAlign:'center',fontSize:'.95rem'}}>{n.icon}</span>
              {n.label}
              {n.badge && <span style={S.navBadge}>{n.badge}</span>}
            </div>
          ))}
          <div style={{color:'rgba(168,180,204,.35)',fontSize:'.62rem',letterSpacing:'3px',textTransform:'uppercase',padding:'14px 20px 5px',fontFamily:"'Fira Code',monospace"}}>Problem Solving</div>
          {navItems.slice(6).map(n=>(
            <div key={n.id} onClick={()=>{setSection(n.id);setSidebarOpen(false)}} style={S.navItem(n.id)}>
              <span style={{width:'20px',textAlign:'center',fontSize:'.95rem'}}>{n.icon}</span>
              {n.label}
              {n.badge && <span style={{marginLeft:'auto',fontSize:'.6rem',background:n.id==='doubt'?'#007A6E':'#C97A0A',color:'#fff',padding:'2px 7px',borderRadius:'20px'}}>{n.badge}</span>}
            </div>
          ))}
        </div>
        <div style={{padding:'16px 20px',borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <p style={{color:'rgba(255,255,255,.25)',fontSize:'.68rem',margin:0}}>Made for Aakash JEE · Chemistry Division</p>
        </div>
      </nav>

      {/* Main content */}
      <main style={S.main}>
        {sections[section]}
      </main>
    </div>
  )
}
