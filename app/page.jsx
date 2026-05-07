'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleStart() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name to continue.'); return }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters.'); return }
    sessionStorage.setItem('studentName', trimmed)
    router.push('/learn')
  }

  return (
    <div style={styles.page}>
      <div style={styles.bg1} /><div style={styles.bg2} />
      <div style={styles.card}>
        <div style={styles.badge}>JEE MAINS &amp; ADVANCED</div>
        <h1 style={styles.title}>Stereo<span style={styles.accent}>isomerism</span></h1>
        <p style={styles.sub}>From basics to JEE Advanced level — interactive visualizations, Newman projections, R/S calculator, conformers, and 15 practice problems.</p>
        <div style={styles.topics}>
          {['🪞 Optical Isomers','⚡ Geometric','📐 4 Projections','🔄 Conformers','🔢 Counting','✏️ Quiz'].map(t => (
            <span key={t} style={styles.topicTag}>{t}</span>
          ))}
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Enter your name to begin</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. Arjun Sharma"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            autoFocus
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} onClick={handleStart} onMouseEnter={e=>e.target.style.background='#005c53'} onMouseLeave={e=>e.target.style.background='#007A6E'}>
            Start Learning →
          </button>
        </div>
        <p style={styles.footer}>Made for Aakash JEE Chemistry students · No login required</p>
      </div>
    </div>
  )
}

const styles = {
  page:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#1A1E2E',position:'relative',overflow:'hidden',fontFamily:"'Plus Jakarta Sans',sans-serif",padding:'20px'},
  bg1:{position:'absolute',top:'-10%',right:'-5%',width:'500px',height:'500px',background:'radial-gradient(circle,rgba(0,196,167,.18) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none'},
  bg2:{position:'absolute',bottom:'-10%',left:'-5%',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(26,86,176,.15) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none'},
  card:{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'20px',padding:'48px 44px',maxWidth:'520px',width:'100%',backdropFilter:'blur(12px)',position:'relative',zIndex:1},
  badge:{display:'inline-block',background:'rgba(0,196,167,.15)',color:'#00C4A7',border:'1px solid rgba(0,196,167,.3)',borderRadius:'20px',padding:'4px 14px',fontSize:'.68rem',fontFamily:"'Fira Code',monospace",letterSpacing:'2px',marginBottom:'18px'},
  title:{fontFamily:"'Playfair Display',serif",fontSize:'2.8rem',color:'#fff',lineHeight:1.2,marginBottom:'14px'},
  accent:{color:'#00C4A7'},
  sub:{color:'rgba(255,255,255,.6)',fontSize:'.9rem',lineHeight:1.7,marginBottom:'20px'},
  topics:{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'28px'},
  topicTag:{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'20px',padding:'4px 12px',fontSize:'.75rem',color:'rgba(255,255,255,.7)'},
  inputGroup:{display:'flex',flexDirection:'column',gap:'10px'},
  label:{color:'rgba(255,255,255,.5)',fontSize:'.8rem',fontFamily:"'Fira Code',monospace",letterSpacing:'1px',textTransform:'uppercase'},
  input:{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'10px',padding:'14px 18px',fontSize:'1rem',color:'#fff',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif",transition:'border .2s'},
  error:{color:'#ff6b6b',fontSize:'.82rem',margin:0},
  btn:{background:'#007A6E',color:'#fff',border:'none',borderRadius:'10px',padding:'14px 28px',fontSize:'1rem',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",transition:'background .2s',marginTop:'4px'},
  footer:{color:'rgba(255,255,255,.25)',fontSize:'.73rem',textAlign:'center',marginTop:'24px'}
}
