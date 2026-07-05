import { useState, Suspense, lazy, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import { useThemeColors } from '../../hooks/useThemeColors.js'
import WelcomeModal from './WelcomeModal.tsx'
import type { BuilderMode } from './MoleculeBuilder.tsx'

const PeriodicTable   = lazy(() => import('./PeriodicTable.tsx'))
const MoleculeBuilder = lazy(() => import('./MoleculeBuilder.tsx'))
const Calculations    = lazy(() => import('./Calculations.tsx'))

type TabId = 'periodic' | BuilderMode | 'calc'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id:'periodic',  label:'Periodic Table', icon:'⚛' },
  { id:'molecules', label:'Molecules',      icon:'🔬' },
  { id:'reactions', label:'Reactions',      icon:'⚗️' },
  { id:'build',     label:'Build',          icon:'🧪' },
  { id:'calc',      label:'Calculations',   icon:'📐' },
]

const WELCOME_SEEN_KEY = 'chem-lab-seen-welcome'

interface ChemistryPageProps { onClose?: () => void }

export default function ChemistryPage({ onClose }: ChemistryPageProps) {
  const C = useThemeColors()
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('periodic')
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(WELCOME_SEEN_KEY)) setShowWelcome(true)
  }, [])

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, '1')
    setShowWelcome(false)
  }

  // The lab is normally launched as a full-screen overlay (see AppShell.jsx's
  // chemOpen), not just via the /chemistry route — navigating without also
  // closing the overlay changes the page invisibly behind it.
  const goToCourse = () => {
    dismissWelcome()
    onClose?.()
    navigate('/course/chemistry')
  }

  return (
    <div className="lg:pb-12" style={{ display:'flex', flexDirection:'column', width:'100%', height:'100%', overflow:'hidden' }}>
      {/* Tab bar */}
      <div style={{
        display:'flex', alignItems:'center', gap:4, padding:'6px 12px',
        borderBottom:`1px solid ${C.border}`, background:C.surface2, flexShrink:0,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer',
            fontSize:13, fontWeight:600, transition:'all .15s',
            background:    tab === t.id ? C.blueBg : 'transparent',
            color:         tab === t.id ? C.blue : C.muted,
            borderBottom:  tab === t.id ? `2px solid ${C.blue}` : '2px solid transparent',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
        <button onClick={() => setShowWelcome(true)} title="Why chemistry?" style={{
          marginLeft:8, width:24, height:24, borderRadius:'50%', border:`1px solid ${C.border}`,
          background:'transparent', color:C.muted, fontSize:12, fontWeight:700, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>?</button>
        {onClose && (
          <button onClick={onClose} style={{
            marginLeft:'auto', padding:'4px 10px', borderRadius:8, border:`1px solid ${C.border}`,
            cursor:'pointer', fontSize:13, fontWeight:600, background:'transparent',
            color:C.muted, transition:'all .15s',
          }} title="Close">✕</button>
        )}
      </div>

      {/* Content fills remaining height */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0 }}>
        <Suspense fallback={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
            <LoadingSpinner size="lg" />
          </div>
        }>
          {tab === 'periodic' && <PeriodicTable onGoToCourse={goToCourse} />}
          {tab === 'calc'     && <Calculations />}
          {tab !== 'periodic' && tab !== 'calc' && <MoleculeBuilder mode={tab} onGoToCourse={goToCourse} />}
        </Suspense>
      </div>

      {showWelcome && <WelcomeModal onDismiss={dismissWelcome} onGoToCourse={goToCourse} />}
    </div>
  )
}
