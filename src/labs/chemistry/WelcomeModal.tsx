// WelcomeModal.tsx
// One-time (dismissible, re-openable) orientation modal for the Chemistry
// Lab — replaces what used to be a permanent "Why Chemistry?" tab. Shown
// automatically on first open (see ChemistryPage.tsx), and reachable again
// via a "?" button in the tab bar.

import { useEffect } from 'react'
import { useThemeColors } from '../../hooks/useThemeColors.js'

type ThemeColors = ReturnType<typeof useThemeColors>

interface GuideCardProps { icon: string; title: string; body: string; C: ThemeColors }

function GuideCard({ icon, title, body, C }: GuideCardProps) {
  return (
    <div style={{ flex:'1 1 160px', padding:'14px 16px', borderRadius:10,
      border:`1px solid ${C.border}`, background:C.surface2 }}>
      <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:12, color:C.muted, lineHeight:1.55 }}>{body}</div>
    </div>
  )
}

interface WelcomeModalProps {
  onDismiss: () => void
  onGoToCourse: () => void
}

export default function WelcomeModal({ onDismiss, onGoToCourse }: WelcomeModalProps) {
  const C = useThemeColors()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  return (
    <div onClick={onDismiss} style={{
      position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxWidth:640, maxHeight:'85vh', overflowY:'auto',
        borderRadius:16, background:C.bg, border:`1px solid ${C.border}`,
        boxShadow:'0 20px 60px rgba(0,0,0,0.35)', padding:'24px 28px',
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.text }}>Welcome to the Chemistry Lab</div>
          <button onClick={onDismiss} style={{
            border:'none', background:'none', cursor:'pointer', fontSize:18, color:C.muted, lineHeight:1,
          }}>✕</button>
        </div>
        <p style={{ fontSize:13.5, color:C.muted, lineHeight:1.7, marginBottom:16 }}>
          Chemistry explains the physical world by describing what atoms and electrons
          are doing at a scale too small to see. This lab is the hands-on side of that —
          no memorisation required to get started, just click around.
        </p>

        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
          <GuideCard C={C} icon="⚛" title="Periodic Table"
            body="All 118 elements with real property data, trends, and a 3D atom model." />
          <GuideCard C={C} icon="🔬" title="Molecules & Reactions"
            body="Browse real molecules in 3D and step through chemical reactions bond-by-bond." />
          <GuideCard C={C} icon="🧪" title="Build & Calculate"
            body="Build your own molecules, and work through real chemistry calculations step by step." />
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <button onClick={onDismiss} style={{
            padding:'9px 16px', borderRadius:8, border:`1px solid ${C.border}`, cursor:'pointer',
            background:'transparent', color:C.muted, fontSize:13, fontWeight:600,
          }}>Got it</button>
          <button onClick={onGoToCourse} style={{
            padding:'9px 18px', borderRadius:8, border:'none', cursor:'pointer',
            background:C.blue, color:'#fff', fontSize:13, fontWeight:600,
          }}>Start the full course →</button>
        </div>
      </div>
    </div>
  )
}
