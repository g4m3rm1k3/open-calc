import { useState, Suspense, lazy } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { LESSON_CHEM_1_0 } from '../content/chemistry-1/lesson1-0.js'
import { LESSON_CHEM_1_1 } from '../content/chemistry-1/lesson1-1.js'

const PeriodicTable   = lazy(() => import('../components/viz/react/PeriodicTable.jsx'))
const MoleculeBuilder = lazy(() => import('../components/viz/react/MoleculeBuilder.jsx'))
const ScienceNotebook = lazy(() => import('../components/viz/react/ScienceNotebook.jsx'))

const CHEM_LESSONS = [
  { id: 'chem-1-0', label: 'Why Chemistry?',   data: LESSON_CHEM_1_0 },
  { id: 'chem-1-1', label: 'What Is an Atom?', data: LESSON_CHEM_1_1 },
]

const TABS = [
  { id: 'lessons',   label: 'Lessons',          icon: '📖' },
  { id: 'periodic',  label: 'Periodic Table',    icon: '⚛' },
  { id: 'molecules', label: 'Molecule Builder',  icon: '🔬' },
]

export default function ChemistryPage({ onClose }) {
  const [tab, setTab]             = useState('lessons')
  const [lessonIdx, setLessonIdx] = useState(0)

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
            background:   tab === t.id ? 'rgba(163,230,53,0.12)' : 'transparent',
            color:        tab === t.id ? '#a3e635' : '#94a3b8',
            borderBottom: tab === t.id ? '2px solid #a3e635' : '2px solid transparent',
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
          {tab === 'lessons' && (
            <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
              {/* Lesson sub-tabs */}
              <div style={{
                display:'flex', gap:6, padding:'8px 16px',
                borderBottom:'1px solid #334155', background:'#0f172a', flexShrink:0,
              }}>
                {CHEM_LESSONS.map((l, i) => (
                  <button key={l.id} onClick={() => setLessonIdx(i)} style={{
                    padding:'5px 14px', borderRadius:7, border:'1px solid',
                    cursor:'pointer', fontSize:12, fontWeight:500, transition:'all .15s',
                    borderColor: lessonIdx === i ? '#38bdf8' : '#334155',
                    background:  lessonIdx === i ? 'rgba(56,189,248,0.1)' : 'transparent',
                    color:       lessonIdx === i ? '#38bdf8' : '#94a3b8',
                  }}>
                    {l.label}
                  </button>
                ))}
              </div>
              {/* Notebook scroll area */}
              <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
                <ScienceNotebook lesson={CHEM_LESSONS[lessonIdx].data} />
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
