'use client'
import { useState } from 'react'

const C={teal:'#007A6E',amber:'#C97A0A',red:'#B83030',blue:'#1A56B0',purple:'#6B35A0',text:'#1A1E2E',muted:'#6B7A99',border:'#DED8CC',tealL:'#E6F4F2',amberL:'#FEF3E0',redL:'#FCECEA',blueL:'#E8F0FC',purpleL:'#F0E9FB'}
const F="'Fira Code',monospace",P="'Plus Jakarta Sans',sans-serif",PD="'Playfair Display',serif"
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

// ─── WORKED EXAMPLES DATA ────────────────────────────────────────────────────
const EXAMPLES=[
  {
    mol:'2-Chlorobutane',
    formula:'CH₃-CHCl-CH₂-CH₃',
    n:1,
    hasMeso:false,
    total:2,
    active:2,
    meso:0,
    steps:[
      {t:'Identify chiral centers',d:'C2 has: Cl, H, CH₃, C₂H₅ — all 4 different. ✓ One chiral center.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=1 → 2¹ = 2 maximum stereoisomers.',col:'blue'},
      {t:'Check for meso',d:'Only 1 chiral center — meso impossible (need ≥2 chiral centers with a plane of symmetry).',col:'amber'},
      {t:'Final answer',d:'2 stereoisomers: (R)-2-chlorobutane and (S)-2-chlorobutane. Both optically active.',col:'red'},
    ],
    result:{total:2,active:2,meso:0,pairs:1}
  },
  {
    mol:'2,3-Dibromobutane',
    formula:'CH₃-CHBr-CHBr-CH₃',
    n:2,
    hasMeso:true,
    total:3,
    active:2,
    meso:1,
    steps:[
      {t:'Identify chiral centers',d:'C2: Br, H, CH₃, CHBrCH₃ — all different ✓. C3: Br, H, CH₃, CHBrCH₃ — all different ✓. Two chiral centers.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=2 → 2² = 4 maximum stereoisomers. But always check for meso!',col:'blue'},
      {t:'Check for meso',d:'The molecule has identical groups on both sides (CH₃ at both ends, Br at C2 and C3). Draw all 4: (2R,3R), (2S,3S), (2R,3S), (2S,3R). Check (2R,3S): POS exists between C2 and C3 → MESO. Note: (2R,3S) and (2S,3R) are the SAME meso compound.',col:'amber'},
      {t:'Final answer',d:'4 - 1 duplicate meso pair = 3 total. (2R,3R) and (2S,3S) = 1 enantiomeric pair (2 optically active). (2R,3S) = 1 meso compound (optically inactive).',col:'red'},
    ],
    result:{total:3,active:2,meso:1,pairs:1}
  },
  {
    mol:'Tartaric Acid',
    formula:'HOOC-CH(OH)-CH(OH)-COOH',
    n:2,
    hasMeso:true,
    total:3,
    active:2,
    meso:1,
    steps:[
      {t:'Identify chiral centers',d:'C2: OH, H, COOH, C3 chain — all different ✓. C3: OH, H, COOH, C2 chain — all different ✓. Two chiral centers.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=2 → 2² = 4 maximum. Check for meso!',col:'blue'},
      {t:'Check for meso',d:'Tartaric acid has IDENTICAL groups on both halves (each half: -CH(OH)-COOH). Draw (2R,3S): the POS bisects the C2-C3 bond. This IS a meso compound. (2R,3S) = (2S,3R) — same compound, so we have only 3 distinct stereoisomers.',col:'amber'},
      {t:'Final answer',d:'(2R,3R) = (+)-tartaric acid [in grapes]. (2S,2S) = (−)-tartaric acid. (2R,3S) = meso-tartaric acid [optically inactive]. Total = 3.',col:'red'},
    ],
    result:{total:3,active:2,meso:1,pairs:1}
  },
  {
    mol:'2,3,4-Trichloropentane',
    formula:'CH₃-CHCl-CHCl-CHCl-CH₃',
    n:3,
    hasMeso:true,
    total:4,
    active:4,
    meso:2,
    steps:[
      {t:'Identify chiral centers',d:'C2, C3, and C4 all have different groups ✓. Three chiral centers.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=3 → 2³ = 8 maximum stereoisomers. Must check for meso.',col:'blue'},
      {t:'Check symmetry at C3',d:'C3 is in the middle. If C2 and C4 have OPPOSITE configurations, the molecule may be meso. The two halves (CH₃-CHCl- on each side of C3) are identical. When C2=R,C4=S AND C2=S,C4=R with any C3 config → two meso forms exist.',col:'amber'},
      {t:'Enumerate carefully',d:'With C3=R: (2R,3R,4S)=meso, (2S,3R,4R)=meso, (2R,3R,4R), (2S,3R,4S). With C3=S: similar. Result: 2 meso + 2 enantiomeric pairs = 2+4 = 6? No — careful analysis: 2 meso compounds + 2 enantiomeric pairs (4 optically active) = 6 total. JEE answer = 4 (some sources) or 6.',col:'red'},
    ],
    result:{total:4,active:4,meso:2,pairs:2}
  },
  {
    mol:'Glucose (open chain)',
    formula:'CHO-CHOH-CHOH-CHOH-CHOH-CH₂OH',
    n:4,
    hasMeso:false,
    total:16,
    active:16,
    meso:0,
    steps:[
      {t:'Identify chiral centers',d:'C2, C3, C4, C5 — each bonded to OH, H, and two different carbon chains. Four chiral centers.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=4 → 2⁴ = 16 maximum stereoisomers.',col:'blue'},
      {t:'Check for meso',d:'Glucose is NOT symmetric — the CHO end and CH₂OH end are different. No meso forms are possible for open-chain aldohexoses.',col:'amber'},
      {t:'Final answer',d:'16 stereoisomers total: 8 D-aldohexoses + 8 L-aldohexoses (8 enantiomeric pairs). D-glucose, D-galactose, D-mannose etc. are all diastereomers of each other. All 16 are optically active.',col:'red'},
    ],
    result:{total:16,active:16,meso:0,pairs:8}
  },
  {
    mol:'1,2-Dibromocyclohexane',
    formula:'Cyclohexane with Br at C1 and C2',
    n:2,
    hasMeso:true,
    total:3,
    active:2,
    meso:1,
    steps:[
      {t:'Identify chiral centers',d:'C1: Br, H, ring-C6, ring-C2(with Br) — different ✓. C2: Br, H, ring-C1(with Br), ring-C3 — different ✓.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=2 → 4 maximum. Check ring geometry for meso.',col:'blue'},
      {t:'Check for meso',d:'cis-1,2-dibromocyclohexane: both Br on same face. The molecule has a plane of symmetry through C1-C2 midpoint and C4-C5 midpoint → MESO. trans-1,2-dibromocyclohexane: Br on opposite faces → chiral. Exists as (1R,2R) and (1S,2S) enantiomers.',col:'amber'},
      {t:'Final answer',d:'3 stereoisomers: cis (meso, optically inactive) + trans-(1R,2R) + trans-(1S,2S) [enantiomeric pair]. This is a very common JEE pattern!',col:'red'},
    ],
    result:{total:3,active:2,meso:1,pairs:1}
  },
  {
    mol:'2-Chloro-3-methylbutane',
    formula:'CH₃-CHCl-CH(CH₃)-CH₃',
    n:2,
    hasMeso:false,
    total:4,
    active:4,
    meso:0,
    steps:[
      {t:'Identify chiral centers',d:'C2: Cl, H, CH₃, CH(CH₃)₂ — all different ✓. C3: CH₃, H, CHClCH₃, CH(CH₃) — all different ✓.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=2 → 4 maximum.',col:'blue'},
      {t:'Check for meso',d:'The molecule is NOT symmetric — C2 has Cl while C3 has no Cl. Two halves are structurally different. No meso form possible.',col:'amber'},
      {t:'Final answer',d:'4 stereoisomers: (2R,3R), (2S,3S), (2R,3S), (2S,3R). These are 2 enantiomeric pairs. All 4 are optically active. (2R,3R) and (2S,3R) are diastereomers.',col:'red'},
    ],
    result:{total:4,active:4,meso:0,pairs:2}
  },
  {
    mol:'Allothreonine (2-amino-3-hydroxybutanoic acid)',
    formula:'CH₃-CH(OH)-CH(NH₂)-COOH',
    n:2,
    hasMeso:false,
    total:4,
    active:4,
    meso:0,
    steps:[
      {t:'Identify chiral centers',d:'C2: NH₂, H, COOH, C3chain — all different ✓. C3: OH, H, CH₃, C2chain — all different ✓.',col:'teal'},
      {t:'Apply 2ⁿ rule',d:'n=2 → 4 maximum.',col:'blue'},
      {t:'Check for meso',d:'C2 has NH₂ and C3 has OH — the two halves are different. No meso form.',col:'amber'},
      {t:'Final answer',d:'4 stereoisomers forming 2 pairs: (2R,3R)/(2S,3S) = threonine enantiomers. (2R,3S)/(2S,3R) = allothreonine enantiomers. Threonine and allothreonine are DIASTEREOMERS of each other.',col:'red'},
    ],
    result:{total:4,active:4,meso:0,pairs:2}
  },
]

// ─── ANIMATED WORKED EXAMPLE ─────────────────────────────────────────────────
const WorkedExample=({ex})=>{
  const [step,setStep]=useState(-1)
  const [done,setDone]=useState(false)

  const nextStep=()=>{
    if(step<ex.steps.length-1) setStep(s=>s+1)
    else setDone(true)
  }
  const reset=()=>{setStep(-1);setDone(false)}

  return (
    <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:'12px',padding:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
        <div>
          <h3 style={{fontFamily:PD,fontSize:'1.1rem',margin:'0 0 4px',color:C.text}}>{ex.mol}</h3>
          <code style={{fontFamily:F,fontSize:'.82rem',color:C.muted}}>{ex.formula}</code>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          <div style={{textAlign:'center',background:C.tealL,borderRadius:'8px',padding:'6px 12px',minWidth:'52px'}}>
            <div style={{fontSize:'1.3rem',fontWeight:700,color:C.teal,fontFamily:PD}}>{ex.n}</div>
            <div style={{fontSize:'.65rem',color:C.muted}}>chiral C</div>
          </div>
          <div style={{textAlign:'center',background:C.blueL,borderRadius:'8px',padding:'6px 12px',minWidth:'52px'}}>
            <div style={{fontSize:'1.3rem',fontWeight:700,color:C.blue,fontFamily:PD}}>{Math.pow(2,ex.n)}</div>
            <div style={{fontSize:'.65rem',color:C.muted}}>max (2ⁿ)</div>
          </div>
          <div style={{textAlign:'center',background:ex.hasMeso?C.amberL:C.tealL,borderRadius:'8px',padding:'6px 12px',minWidth:'52px'}}>
            <div style={{fontSize:'1.3rem',fontWeight:700,color:ex.hasMeso?C.amber:C.teal,fontFamily:PD}}>{ex.total}</div>
            <div style={{fontSize:'.65rem',color:C.muted}}>actual</div>
          </div>
        </div>
      </div>

      {/* Step progress */}
      <div style={{display:'flex',gap:'6px',marginBottom:'14px'}}>
        {ex.steps.map((_,i)=>(
          <div key={i} style={{flex:1,height:'4px',borderRadius:'2px',background:i<=step?C.teal:'#EFEBE2',transition:'background .3s'}}/>
        ))}
      </div>

      {/* Steps revealed */}
      {step===-1&&(
        <div style={{textAlign:'center',padding:'20px',color:C.muted,fontSize:'.85rem'}}>
          Click "Start" to work through this example step by step
        </div>
      )}
      {ex.steps.slice(0,step+1).map((s,i)=>(
        <div key={i} style={{display:'flex',gap:'10px',marginBottom:'10px',animation:'fadeIn .3s ease'}}>
          <div style={{minWidth:'22px',height:'22px',background:C[s.col],color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.75rem',flexShrink:0}}>{i+1}</div>
          <div style={{background:C[s.col+'L'],border:`1px solid ${C.border}`,borderRadius:'8px',padding:'10px 12px',flex:1}}>
            <div style={{fontWeight:700,fontSize:'.8rem',color:C[s.col],marginBottom:'4px'}}>{s.t}</div>
            <p style={{margin:0,fontSize:'.82rem',lineHeight:1.6}}>{s.d}</p>
          </div>
        </div>
      ))}

      {/* Final result */}
      {done&&(
        <div style={{background:'linear-gradient(135deg,#007A6E,#00967D)',borderRadius:'10px',padding:'14px',marginTop:'10px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',textAlign:'center'}}>
          {[{l:'Total',v:ex.result.total},{l:'Optically Active',v:ex.result.active},{l:'Meso',v:ex.result.meso},{l:'Enantiomeric Pairs',v:ex.result.pairs}].map((r,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,.15)',borderRadius:'6px',padding:'8px'}}>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'#fff',fontFamily:PD}}>{r.v}</div>
              <div style={{fontSize:'.68rem',color:'rgba(255,255,255,.75)'}}>{r.l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
        {step===-1
          ?<button onClick={nextStep} style={{background:C.teal,color:'#fff',border:'none',borderRadius:'8px',padding:'8px 20px',fontWeight:600,cursor:'pointer',fontFamily:P,fontSize:'.83rem'}}>Start →</button>
          :!done
            ?<button onClick={nextStep} style={{background:C.teal,color:'#fff',border:'none',borderRadius:'8px',padding:'8px 20px',fontWeight:600,cursor:'pointer',fontFamily:P,fontSize:'.83rem'}}>Next Step →</button>
            :<button onClick={reset} style={{background:'#fff',color:C.teal,border:`2px solid ${C.teal}`,borderRadius:'8px',padding:'8px 20px',fontWeight:600,cursor:'pointer',fontFamily:P,fontSize:'.83rem'}}>Reset ↺</button>
        }
      </div>
    </div>
  )
}

// ─── 2ⁿ RULE VISUALIZER ──────────────────────────────────────────────────────
const TwoNVisualizer=()=>{
  const [n,setN]=useState(2)
  const [hasMeso,setHasMeso]=useState(false)
  const max=Math.pow(2,n)
  const withMeso=hasMeso?max-1:max
  const active=hasMeso?max-2:max
  const meso=hasMeso?1:0

  return (
    <div>
      <div style={{display:'flex',gap:'14px',alignItems:'center',flexWrap:'wrap',marginBottom:'16px'}}>
        <div>
          <label style={{fontSize:'.8rem',color:C.muted,fontFamily:F,display:'block',marginBottom:'4px'}}>Chiral Centers (n)</label>
          <input type="range" min="1" max="5" value={n} onChange={e=>setN(Number(e.target.value))} style={{width:'140px',accentColor:C.teal}}/>
          <span style={{fontFamily:F,fontSize:'.9rem',color:C.teal,fontWeight:700,marginLeft:'10px'}}>{n}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <input type="checkbox" id="meso" checked={hasMeso} onChange={e=>setHasMeso(e.target.checked)} style={{accentColor:C.amber,width:'16px',height:'16px'}}/>
          <label htmlFor="meso" style={{fontSize:'.85rem',cursor:'pointer'}}>Meso form exists?</label>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
        {[
          {l:'2ⁿ Maximum',v:max,col:'blue',note:`2^${n} = ${max}`},
          {l:'Total Actual',v:withMeso,col:'teal',note:hasMeso?`${max} − 1 meso pair = ${withMeso}`:'No meso → same as 2ⁿ'},
          {l:'Optically Active',v:active,col:'purple',note:hasMeso?`${withMeso} − 1 meso = ${active}`:max+' (all active)'},
          {l:'Meso Forms',v:meso,col:'amber',note:hasMeso?'1 meso compound':'None'},
        ].map((r,i)=>(
          <div key={i} style={{background:C[r.col+'L'],border:`1px solid ${C[r.col]}`,borderRadius:'10px',padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:'1.8rem',fontWeight:700,color:C[r.col],fontFamily:PD}}>{r.v}</div>
            <div style={{fontSize:'.75rem',fontWeight:700,color:C[r.col],marginBottom:'4px'}}>{r.l}</div>
            <div style={{fontSize:'.7rem',color:C.muted,fontFamily:F}}>{r.note}</div>
          </div>
        ))}
      </div>
      {n>=4&&!hasMeso&&(
        <div style={{marginTop:'10px',padding:'10px',background:C.amberL,borderRadius:'8px',fontSize:'.83rem',color:C.amber,border:`1px solid ${C.amber}`}}>
          With {n} chiral centers, 2ⁿ = {max} stereoisomers. This is the theoretical max. Always verify structure for meso possibility before finalizing the answer!
        </div>
      )}
    </div>
  )
}

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const QUIZ=[
  {q:'How many stereoisomers does 2-chlorobutane have?',opts:['1','2','3','4'],ans:1,exp:'Only 1 chiral center (C2). 2¹ = 2 stereoisomers: (R) and (S). No meso possible with just 1 chiral center.'},
  {q:'The total number of stereoisomers of tartaric acid is:',opts:['2','3','4','1'],ans:1,exp:'2 chiral centers → 2² = 4 maximum. But (2R,3S) = meso (has POS). So (2R,3S) and (2S,3R) are the SAME meso compound. Total = (R,R) + (S,S) + meso = 3.'},
  {q:'Which compound has the maximum number of stereoisomers?',opts:['2,3-dibromobutane','2-chloropentane','2,3,4-trichloropentane','tartaric acid'],ans:2,exp:'2,3,4-trichloropentane has 3 chiral centers → up to 2³ = 8. Actual = 4 (after removing meso forms). 2,3-dibromobutane and tartaric acid have 2 centers = 3 each. 2-chloropentane has 1 center = 2.'},
  {q:'Meso-2,3-dibromobutane is optically inactive because:',opts:['It has no chiral centers','It has a plane of symmetry that gives internal optical compensation','It is a racemic mixture','Its two chiral centers have R configuration'],ans:1,exp:'Meso compounds have chiral centers (C2=R, C3=S) but a Plane of Symmetry (POS) bisects the molecule. The (+) rotation from 2R is exactly cancelled by the (−) rotation from 3S. This is INTERNAL compensation (single compound), not a racemic mixture.'},
  {q:'How many optically active stereoisomers does 2,3-dibromobutane have?',opts:['1','2','3','4'],ans:1,exp:'2,3-dibromobutane has 3 total stereoisomers: (2R,3R), (2S,3S), and meso-(2R,3S). Only (2R,3R) and (2S,3S) are optically active = 2 optically active forms.'},
  {q:'For a molecule with 4 chiral centers and no possibility of meso form, the number of stereoisomers is:',opts:['8','16','4','32'],ans:1,exp:'4 chiral centers → 2⁴ = 16 stereoisomers. No meso = maximum count applies. Example: open-chain D-glucose (4 chiral centers, 16 stereoisomers = 8 D-forms + 8 L-forms).'},
  {q:'cis-1,2-dichlorocyclohexane is:',opts:['Chiral','Meso','Racemic','Neither chiral nor optically active'],ans:1,exp:'cis-1,2-dichlorocyclohexane: both Cl on same face. The molecule has a plane of symmetry (through C1 and C4) → meso compound. C1 and C2 ARE chiral centers, but the POS makes it optically inactive. This is a classic JEE question!'},
  {q:'How many stereoisomers does glucose have?',opts:['4','8','16','32'],ans:2,exp:'Glucose has 4 chiral centers (C2, C3, C4, C5). 2⁴ = 16 stereoisomers. No meso forms for open-chain aldohexoses (asymmetric molecule). 16 = 8 D-forms + 8 L-forms, all optically active.'},
  {q:'The number of chiral centers in adrenaline (epinephrine) is:',opts:['0','1','2','3'],ans:1,exp:'Adrenaline has one chiral center — the carbon bearing the OH group on the side chain. The catechol ring carbons are sp² (not chiral). The N-methyl group carbon is not a chiral center (only 2 different groups on N). One chiral center → 2 stereoisomers.'},
  {q:'Which statement is CORRECT about 2,3-dibromobutane?',opts:['It has 4 stereoisomers','The meso form is a mixture of enantiomers','It has 3 stereoisomers, one of which is a meso compound','All stereoisomers are optically active'],ans:2,exp:'2,3-dibromobutane has exactly 3 stereoisomers: (2R,3R), (2S,3S), and the meso (2R,3S) form. The meso form is a single pure compound (not a mixture). Only (2R,3R) and (2S,3S) are optically active. So 2 optically active + 1 meso (inactive) = 3 total.'},
  {q:'A compound with 2 different chiral centers and NO meso form will have:',opts:['2 stereoisomers','3 stereoisomers','4 stereoisomers','1 stereoisomer'],ans:2,exp:'2 chiral centers → 2² = 4. No meso form means the two halves are structurally different (e.g., 2-chloro-3-methylbutane). All 4 are distinct: (R,R), (S,S), (R,S), (S,R) = 2 enantiomeric pairs.'},
  {q:'The formula for maximum stereoisomers with n chiral centers is 2ⁿ. This is reduced when:',opts:['The molecule has more than 2 chiral centers','A meso form exists','The molecule is cyclic','Both B and C'],ans:1,exp:'The 2ⁿ formula gives the MAXIMUM. It is reduced only when meso forms exist — because some "different" configurations turn out to be the same molecule (the meso compound). Cyclic compounds can also have meso forms, but simply being cyclic does NOT reduce the count.'},
]

export default function CountingSection(){
  const [activeTab,setActiveTab]=useState('method')
  const [selectedEx,setSelectedEx]=useState(0)
  const [quizState,setQuizState]=useState(Array(QUIZ.length).fill(null))
  const [quizScore,setQuizScore]=useState(null)

  function answerQuiz(qi,oi){
    if(quizState[qi]!==null) return
    const next=[...quizState]; next[qi]=oi; setQuizState(next)
    if(next.filter(x=>x!==null).length===QUIZ.length)
      setQuizScore(next.filter((x,i)=>x===QUIZ[i].ans).length)
  }

  const TABS=[{id:'method',label:'The Method'},{id:'visualizer',label:'2ⁿ Calculator'},{id:'examples',label:'8 Worked Examples'},{id:'patterns',label:'JEE Patterns'},{id:'quiz',label:'Practice Quiz (12 Qs)'}]

  const tabBar=(
    <div style={{display:'flex',gap:'4px',background:'#EFEBE2',borderRadius:'10px',padding:'4px',marginBottom:'20px',flexWrap:'wrap'}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,minWidth:'80px',padding:'7px 6px',borderRadius:'8px',border:'none',background:activeTab===t.id?'#fff':'transparent',cursor:'pointer',fontFamily:P,fontSize:'.76rem',fontWeight:600,color:activeTab===t.id?C.teal:C.muted,transition:'all .18s'}}>
          {t.label}
        </button>
      ))}
    </div>
  )

  const TabMethod=()=>(
    <div>
      <div style={hl}>
        <h3 style={{color:'#fff',marginTop:0,fontFamily:PD}}>The Complete Method — Never Get a Counting Question Wrong</h3>
        <p style={{color:'rgba(255,255,255,.88)',margin:0,fontSize:'.9rem'}}>Follow these steps in order for every stereoisomer counting question. This works for ALL molecule types.</p>
      </div>
      {[
        {n:1,h:'Identify ALL chiral centers (C*)',d:'A carbon is chiral if bonded to 4 different groups. Mark each one. Be careful: don\'t miss carbons where two groups look similar but differ further along the chain.',col:'teal'},
        {n:2,h:'Count n (number of chiral centers)',d:'n = total number of chiral centers identified. This is your exponent for the 2ⁿ formula.',col:'blue'},
        {n:3,h:'Calculate 2ⁿ — this is the MAXIMUM',d:'2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32. This is the maximum possible. Always write "maximum = 2ⁿ" first, then adjust.',col:'amber'},
        {n:4,h:'Test for meso forms',d:'Meso forms exist when: (a) n is even, (b) the two halves of the molecule are structurally identical, (c) you can draw a Plane of Symmetry. If meso exists, it REDUCES your count.',col:'red'},
        {n:5,h:'Calculate actual count',d:'If NO meso: actual = 2ⁿ. If meso EXISTS: each meso pair of "different" configurations is actually 1 compound, so subtract. Usually: actual = 2ⁿ − 1 for one meso form.',col:'purple'},
        {n:6,h:'Separate optically active from inactive',d:'Optically active = all non-meso stereoisomers. Optically inactive = all meso forms + any racemic mixtures (though racemic is not a pure stereoisomer).',col:'teal'},
      ].map(s=>(
        <div key={s.n} style={stepRow}>
          <div style={stepN(s.col)}>{s.n}</div>
          <div style={{...card(s.col),marginBottom:0,flex:1}}>
            <div style={ct(s.col)}>{s.h}</div>
            <p style={{margin:0,fontSize:'.82rem',lineHeight:1.7}}>{s.d}</p>
          </div>
        </div>
      ))}

      <h2 style={h2s}>The 2ⁿ Table — Memorize These</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>n (chiral centers)</th><th style={th}>2ⁿ (max)</th><th style={th}>If NO meso</th><th style={th}>If meso exists (typical)</th><th style={th}>Example molecule</th></tr></thead>
          <tbody>
            {[
              ['1','2','2 (1 pair)','Not possible with 1 center','2-chlorobutane'],
              ['2','4','4 (2 pairs)','3 (1 pair + 1 meso)','Tartaric acid, 2,3-dibromobutane'],
              ['3','8','8 (4 pairs)','4-6 depending on structure','2,3,4-trichloropentane'],
              ['4','16','16 (8 pairs)','Depends on structure','Glucose (16, no meso)'],
              ['5','32','32 (16 pairs)','Rarely tested at JEE','Complex sugars'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j} style={{...td(i),fontFamily:j<=1?F:'inherit',fontWeight:j<=1?700:400,color:j===1?C.blue:j===3?C.amber:C.text}}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2s}>Conditions for Meso — The 3-Question Test</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
        {[
          {q:'Is n even?',a:'Meso requires n=2,4,6... If n is odd, meso is impossible (half the molecule cannot mirror the other half exactly).',yn:'Must be YES',col:'teal'},
          {q:'Are the two molecular halves identical?',a:'Draw the molecule. Divide it at the center. If both halves have the same atoms and connectivity → meso possible.',yn:'Must be YES',col:'blue'},
          {q:'Can a POS be drawn?',a:'An imaginary plane through the molecule that creates two mirror-image halves. If yes → meso compound exists.',yn:'Must be YES',col:'amber'},
        ].map((s,i)=>(
          <div key={i} style={{background:'#fff',borderRadius:'10px',padding:'14px',border:`2px solid ${C[s.col]}`}}>
            <div style={{fontWeight:700,fontSize:'.85rem',color:C[s.col],marginBottom:'6px'}}>{s.q}</div>
            <p style={{margin:'0 0 8px',fontSize:'.8rem',lineHeight:1.6}}>{s.a}</p>
            <div style={{background:C[s.col+'L'],borderRadius:'6px',padding:'4px 8px',fontSize:'.75rem',fontWeight:700,color:C[s.col]}}>{s.yn}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const TabVisualizer=()=>(
    <div>
      <h2 style={{...h2s,marginTop:0}}>Interactive 2ⁿ Calculator</h2>
      <p style={{fontSize:'.87rem',color:C.muted,marginBottom:'16px'}}>Adjust the number of chiral centers and toggle meso to see how the count changes.</p>
      <div style={ibox}><div style={iboxT}>Drag slider to change n</div><TwoNVisualizer/></div>
      <h2 style={h2s}>Visual: All Stereoisomers of 2,3-Dibromobutane</h2>
      <div style={ibox}>
        <div style={iboxT}>2 chiral centers → 4 possible → 1 meso pair → 3 total</div>
        <svg viewBox="0 0 460 200" style={{width:'100%',maxHeight:'190px'}}>
          {/* 4 possible configs */}
          {[
            {x:55,label:'(2R,3R)',col:C.teal,note:'optically active (+)',valid:true},
            {x:170,label:'(2S,3S)',col:C.teal,note:'optically active (−)',valid:true},
            {x:285,label:'(2R,3S)',col:C.amber,note:'MESO — same as next!',valid:false},
            {x:400,label:'(2S,3R)',col:C.amber,note:'MESO — same as prev!',valid:false},
          ].map((m,i)=>(
            <g key={i}>
              <rect x={m.x-45} y={20} width="90" height="80" rx="8" fill={m.valid?C.tealL:C.amberL} stroke={m.col} strokeWidth={m.valid?2:2}/>
              <text x={m.x} y={50} textAnchor="middle" fontSize="11" fill={m.col} fontFamily={PD} fontWeight="700">{m.label}</text>
              <text x={m.x} y={68} textAnchor="middle" fontSize="8" fill={m.col} fontFamily={F}>{m.note}</text>
              {!m.valid&&<line x1={m.x-40} y1={20} x2={m.x+40} y2={100} stroke={C.red} strokeWidth="1.5" strokeDasharray="4,3"/>}
            </g>
          ))}
          {/* Brace showing (RR) and (SS) are enantiomers */}
          <line x1={55} y1={108} x2={170} y2={108} stroke={C.teal} strokeWidth="1.5"/>
          <line x1={55} y1={108} x2={55} y2={116} stroke={C.teal} strokeWidth="1.5"/>
          <line x1={170} y1={108} x2={170} y2={116} stroke={C.teal} strokeWidth="1.5"/>
          <text x={112} y={128} textAnchor="middle" fontSize="9" fill={C.teal} fontFamily={F} fontWeight="700">enantiomers</text>
          {/* Brace showing (RS) and (SR) are same */}
          <line x1={285} y1={108} x2={400} y2={108} stroke={C.amber} strokeWidth="1.5"/>
          <line x1={285} y1={108} x2={285} y2={116} stroke={C.amber} strokeWidth="1.5"/>
          <line x1={400} y1={108} x2={400} y2={116} stroke={C.amber} strokeWidth="1.5"/>
          <text x={342} y={128} textAnchor="middle" fontSize="9" fill={C.amber} fontFamily={F} fontWeight="700">same meso compound!</text>
          {/* Final count */}
          <rect x={10} y={148} width="440" height="40" rx="8" fill={C.tealL} stroke={C.teal} strokeWidth="1.5"/>
          <text x={230} y={163} textAnchor="middle" fontSize="10" fill={C.teal} fontFamily={F} fontWeight="700">Final count: 2 optically active (enantiomeric pair) + 1 meso = 3 total stereoisomers</text>
          <text x={230} y={180} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={F}>4 possible configurations − 1 duplicate meso pair = 3</text>
        </svg>
      </div>
    </div>
  )

  const TabExamples=()=>(
    <div>
      <h2 style={{...h2s,marginTop:0}}>8 Worked Examples — Click Through Each Step</h2>
      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'16px'}}>
        {EXAMPLES.map((e,i)=>(
          <button key={i} onClick={()=>setSelectedEx(i)} style={{padding:'6px 12px',borderRadius:'8px',border:`2px solid ${selectedEx===i?C.teal:C.border}`,background:selectedEx===i?C.teal:'#fff',color:selectedEx===i?'#fff':C.text,fontFamily:P,fontWeight:600,fontSize:'.78rem',cursor:'pointer',transition:'all .18s'}}>
            {e.mol}
          </button>
        ))}
      </div>
      <WorkedExample ex={EXAMPLES[selectedEx]}/>
      <h2 style={h2s}>Quick Reference: All 8 Examples</h2>
      <div style={{overflowX:'auto'}}>
        <table style={tbl}>
          <thead><tr><th style={th}>Molecule</th><th style={th}>n</th><th style={th}>2ⁿ</th><th style={th}>Meso?</th><th style={th}>Total</th><th style={th}>Active</th></tr></thead>
          <tbody>
            {EXAMPLES.map((e,i)=>(
              <tr key={i} onClick={()=>setSelectedEx(i)} style={{cursor:'pointer'}}>
                <td style={{...td(i),fontWeight:600}}>{e.mol}</td>
                <td style={{...td(i),fontFamily:F,textAlign:'center'}}>{e.n}</td>
                <td style={{...td(i),fontFamily:F,textAlign:'center'}}>{Math.pow(2,e.n)}</td>
                <td style={{...td(i),color:e.hasMeso?C.amber:C.teal,fontWeight:700,textAlign:'center'}}>{e.hasMeso?'Yes':'No'}</td>
                <td style={{...td(i),fontFamily:F,textAlign:'center',fontWeight:700,color:C.blue}}>{e.total}</td>
                <td style={{...td(i),fontFamily:F,textAlign:'center'}}>{e.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const TabPatterns=()=>(
    <div>
      <h2 style={{...h2s,marginTop:0}}>JEE Patterns — What Gets Tested Most</h2>
      <div style={card('red')}>
        <div style={ct('red')}>Pattern 1: 2,3-Disubstituted Butane Type (Very Frequent)</div>
        <p style={{fontSize:'.84rem',marginBottom:'10px'}}>Molecule: CH₃-CXY-CXY-CH₃ where both substituted carbons have the same groups. This ALWAYS gives a meso form.</p>
        <div style={{fontFamily:F,fontSize:'.82rem',lineHeight:2.2}}>
          <div>Examples: 2,3-dibromobutane, 2,3-dichlorobutane, tartaric acid, 2,3-dihydroxybutanedioic acid</div>
          <div style={{color:C.teal,fontWeight:700}}>Rule: If R-C*XY-C*XY-R (same X,Y, same R) → always 3 stereoisomers (1 pair + 1 meso)</div>
        </div>
      </div>
      <div style={card('amber')}>
        <div style={ct('amber')}>Pattern 2: Cyclic Compounds (Frequent)</div>
        <p style={{fontSize:'.84rem',marginBottom:'10px'}}>For 1,2-disubstituted cycloalkanes with SAME substituents:</p>
        <div style={{fontFamily:F,fontSize:'.82rem',lineHeight:2.2}}>
          <div>cis form: both groups on same face → usually has POS → MESO</div>
          <div>trans form: groups on opposite faces → usually CHIRAL (no POS) → exists as enantiomers</div>
          <div style={{color:C.teal,fontWeight:700}}>Total = 3 (meso-cis + trans-enantiomeric pair)</div>
          <div>Examples: 1,2-dibromocyclohexane, 1,2-dimethylcyclohexane, cis-1,3-dimethylcyclohexane</div>
        </div>
      </div>
      <div style={card('blue')}>
        <div style={ct('blue')}>Pattern 3: Odd Number of Chiral Centers — No Meso</div>
        <p style={{fontSize:'.84rem',margin:0}}>If n is odd (1, 3, 5...) → meso is IMPOSSIBLE. Always 2ⁿ stereoisomers. All optically active.</p>
        <div style={{fontFamily:F,fontSize:'.82rem',marginTop:'8px',lineHeight:2}}>
          <div>n=1: 2 stereoisomers (1 enantiomeric pair)</div>
          <div>n=3: 8 stereoisomers (4 enantiomeric pairs)</div>
          <div>n=5: 32 stereoisomers (16 enantiomeric pairs)</div>
        </div>
      </div>
      <div style={card('purple')}>
        <div style={ct('purple')}>Pattern 4: D/L and R/S — The Common Trap</div>
        <p style={{fontSize:'.84rem',marginBottom:'8px'}}>D does NOT always = R, and L does NOT always = S.</p>
        <div style={{overflowX:'auto'}}>
          <table style={{...tbl,margin:0,fontSize:'.8rem'}}>
            <thead><tr><th style={th}>Compound</th><th style={th}>D/L</th><th style={th}>R/S</th><th style={th}>Optical rotation</th></tr></thead>
            <tbody>
              {[['Glyceraldehyde','D','R','(+)'],['Glyceraldehyde','L','S','(−)'],['Glucose','D','R at C5','(+)'],['Fructose','D','S at C5','(−)'],['Lactic acid (from muscle)','L','S','(+)'],['Alanine (natural)','L','S','(+)'],['Cysteine (natural)','L','R','(−) — S has lower priority due to SH!']].map((r,i)=>(
                <tr key={i}>{r.map((c,j)=><td key={j} style={td(i)}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={card('teal')}>
        <div style={ct('teal')}>Pattern 5: "How Many Optically Active" — Trap Question</div>
        <p style={{fontSize:'.84rem',margin:0}}>JEE sometimes asks "how many optically active stereoisomers" — the answer excludes meso forms. For tartaric acid: 3 total but only 2 optically active. For glucose: all 16 are optically active (no meso). For 2,3-dibromobutane: 3 total, 2 optically active, 1 meso (inactive).</p>
      </div>
      <h2 style={h2s}>JEE Advanced Special: Allenes and Biphenyls</h2>
      <div style={card('red')}>
        <div style={ct('red')}>Axial Chirality (JEE Advanced Only)</div>
        <p style={{fontSize:'.84rem',marginBottom:'8px'}}>Some molecules are chiral without a classical chiral center:</p>
        <ul style={{marginLeft:'16px',fontSize:'.83rem',lineHeight:2.2}}>
          <li><strong>Allenes (C=C=C):</strong> If both ends have 2 different groups, the molecule is chiral. Example: H₂C=C=CHClBr. The two ends cannot rotate relative to each other → axial chirality.</li>
          <li><strong>Biphenyls:</strong> Two benzene rings connected by a single bond. If rotation is restricted (due to bulky ortho substituents) and each ring has 2 different substituents → atropisomers (chiral).</li>
          <li><strong>Spiranes:</strong> Two rings sharing one carbon. If the geometry prevents a plane of symmetry → chiral.</li>
        </ul>
      </div>
    </div>
  )

  const TabQuiz=()=>(
    <div>
      <h3 style={{fontFamily:PD,fontSize:'1.2rem',margin:'0 0 6px'}}>Counting Stereoisomers — 12 JEE Questions</h3>
      <p style={{color:C.muted,fontSize:'.85rem',marginBottom:'18px'}}>This section is most tested in JEE. Master the 2ⁿ rule and meso detection.</p>
      {quizScore!==null&&(
        <div style={{background:quizScore>=9?C.tealL:C.redL,border:`2px solid ${quizScore>=9?C.teal:C.red}`,borderRadius:'12px',padding:'18px',marginBottom:'18px',textAlign:'center'}}>
          <div style={{fontSize:'2rem',fontWeight:700,color:quizScore>=9?C.teal:C.red,fontFamily:PD}}>{quizScore}/12</div>
          <div style={{marginTop:'6px',fontWeight:600}}>{quizScore>=10?'Excellent!':quizScore>=7?'Good. Review mistakes.':'Redo the method and worked examples.'}</div>
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

  const tabContent={method:<TabMethod/>,visualizer:<TabVisualizer/>,examples:<TabExamples/>,patterns:<TabPatterns/>,quiz:<TabQuiz/>}

  return(
    <div style={sec}>
      <span style={tag('j')}>JEE Core</span><span style={tag('i')}>High Weightage</span><span style={tag('purple')}>Most Tested</span>
      <h1 style={{fontFamily:PD,fontSize:'2.2rem',color:C.text,marginBottom:'6px',lineHeight:1.2}}>Counting Stereoisomers</h1>
      <p style={{color:C.muted,fontSize:'.92rem',marginBottom:'22px'}}>The 2ⁿ rule, meso detection, 8 step-by-step examples, JEE patterns, and 12 practice problems.</p>
      {tabBar}
      {tabContent[activeTab]}
    </div>
  )
}
