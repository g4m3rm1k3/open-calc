import { useState, Suspense, lazy } from 'react'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import { useThemeColors } from '../../hooks/useThemeColors.js'

const WhyChemistry    = lazy(() => import('./WhyChemistry.tsx'))
const PeriodicTable   = lazy(() => import('./PeriodicTable.tsx'))
const MoleculeBuilder = lazy(() => import('./MoleculeBuilder.tsx'))

type TabId = 'intro' | 'periodic' | 'molecules'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id:'intro',     label:'Why Chemistry?',    icon:'💡' },
  { id:'periodic',  label:'Periodic Table',    icon:'⚛' },
  { id:'molecules', label:'Molecule Builder',  icon:'🔬' },
]

interface ChemistryPageProps { onClose?: () => void }

export default function ChemistryPage({ onClose }: ChemistryPageProps) {
  const C = useThemeColors()
  const [tab, setTab] = useState<TabId>('intro')

  return (
    <div style={{ display:'flex', flexDirection:'column', width:'100%', height:'100%', overflow:'hidden' }}>
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
          {tab === 'intro'     && <WhyChemistry />}
          {tab === 'periodic'  && <PeriodicTable   params={{}} />}
          {tab === 'molecules' && <MoleculeBuilder params={{}} />}
        </Suspense>
      </div>
    </div>
  )
}
