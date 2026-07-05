// WhyChemistry.tsx
// Short, self-contained orientation panel for the Chemistry Lab — not a
// re-embedding of the full course lesson (that lives at /course/chemistry).

import { useNavigate } from 'react-router-dom'
import { useThemeColors } from '../../hooks/useThemeColors.js'

interface GuideCardProps {
  icon: string
  title: string
  body: string
  C: ReturnType<typeof useThemeColors>
}

function GuideCard({ icon, title, body, C }: GuideCardProps) {
  return (
    <div style={{ flex:'1 1 220px', padding:'16px 18px', borderRadius:12,
      border:`1px solid ${C.border}`, background:C.surface2 }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.65 }}>{body}</div>
    </div>
  )
}

export default function WhyChemistry() {
  const C = useThemeColors()
  const navigate = useNavigate()

  return (
    <div style={{ width:'100%', height:'100%', overflowY:'auto', background:C.bg }}>
      <div style={{ maxWidth:780, margin:'0 auto', padding:'32px 24px 48px' }}>
        <div style={{ fontSize:26, fontWeight:700, color:C.text, marginBottom:8 }}>Why Chemistry?</div>
        <p style={{ fontSize:14.5, color:C.muted, lineHeight:1.75, marginBottom:14 }}>
          Chemistry explains the physical world by describing what atoms and electrons
          are doing at a scale too small to see. Why does ice float instead of sink?
          Why does wood burn but gold doesn't? Why does salt dissolve in water but oil
          doesn't? Every one of those questions has a precise, atomic-scale answer —
          and that's what this lab and the course behind it are for.
        </p>
        <p style={{ fontSize:14.5, color:C.muted, lineHeight:1.75, marginBottom:28 }}>
          This lab is the hands-on side: a periodic table you can actually explore, and
          a molecule builder you can actually build in. No memorisation required to get
          started — just click around.
        </p>

        <div style={{ display:'flex', flexWrap:'wrap', gap:14, marginBottom:28 }}>
          <GuideCard C={C} icon="⚛" title="Periodic Table"
            body="All 118 elements with real property data. Click any element for a 3D Bohr model, periodic trends, and its role in the world." />
          <GuideCard C={C} icon="🔬" title="Molecule Builder"
            body="Browse a library of real molecules in 3D, step through chemical reactions bond-by-bond, or build your own molecule from scratch." />
          <GuideCard C={C} icon="🧪" title="Build mode"
            body="Place atoms, bond them together, and get live valence hints — the fastest way to build intuition for how molecules actually go together." />
        </div>

        <div style={{ padding:'18px 20px', borderRadius:12, background:C.blueBg,
          border:`1px solid ${C.blue}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>Want the full story?</div>
            <div style={{ fontSize:12.5, color:C.muted }}>
              The Chemistry course builds these ideas up from first principles, lesson by lesson.
            </div>
          </div>
          <button onClick={() => navigate('/course/chemistry')}
            style={{ padding:'10px 18px', borderRadius:8, border:'none', cursor:'pointer',
              background:C.blue, color:'#fff', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>
            Start the full course →
          </button>
        </div>
      </div>
    </div>
  )
}
