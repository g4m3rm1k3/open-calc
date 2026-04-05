import { useState, Suspense, lazy } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

const PeriodicTable   = lazy(() => import('../components/viz/react/PeriodicTable.jsx'))
const MoleculeBuilder = lazy(() => import('../components/viz/react/MoleculeBuilder.jsx'))

const TABS = [
  { id:'periodic',  label:'Periodic Table',   icon:'⚛' },
  { id:'molecules', label:'Molecule Builder',  icon:'🔬' },
]

export default function ChemistryPage({ onClose }) {
  const [tab, setTab] = useState('periodic')

  return (
    <div style={{ display:'flex', flexDirection:'column', width:'100%', height:'100%', overflow:'hidden' }}>
      {/* Tab bar */}
      <div style={{
        display:'flex', alignItems:'center', gap:4, padding:'6px 12px',
        borderBottom:'1px solid #334155', background:'#0f172a', flexShrink:0,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer',
            fontSize:13, fontWeight:600, transition:'all .15s',
            background:    tab === t.id ? 'rgba(163,230,53,0.12)' : 'transparent',
            color:         tab === t.id ? '#a3e635' : '#94a3b8',
            borderBottom:  tab === t.id ? '2px solid #a3e635' : '2px solid transparent',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
        {onClose && (
          <button onClick={onClose} style={{
            marginLeft:'auto', padding:'4px 10px', borderRadius:8, border:'1px solid #334155',
            cursor:'pointer', fontSize:13, fontWeight:600, background:'transparent',
            color:'#94a3b8', transition:'all .15s',
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
          {tab === 'periodic'  && <PeriodicTable   params={{}} />}
          {tab === 'molecules' && <MoleculeBuilder params={{}} />}
        </Suspense>
      </div>
    </div>
  )
}
