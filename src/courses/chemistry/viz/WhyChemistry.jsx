// WhyChemistry.jsx
// Compact lesson-embedded callout that bridges this lesson's "why chemistry
// matters" narrative into the hands-on Chemistry Lab (periodic table + molecule
// builder, at /chemistry). The lesson itself already carries the full prose —
// this viz just points at where to go play with the ideas.

import { useNavigate } from 'react-router-dom'
import { useThemeColors } from '../../../hooks/useThemeColors.js'

export default function WhyChemistry() {
  const C = useThemeColors()
  const navigate = useNavigate()

  return (
    <div style={{ padding:'18px 20px', borderRadius:12, background:C.blueBg,
      border:`1px solid ${C.blue}`, fontFamily:'sans-serif' }}>
      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}>
        ⚗ Prefer to explore hands-on?
      </div>
      <p style={{ fontSize:12.5, color:C.muted, lineHeight:1.7, marginBottom:12 }}>
        The Chemistry Lab has an interactive periodic table (all 118 elements,
        3D atom models, periodic trends) and a molecule builder where you can
        assemble atoms into molecules yourself and get live bonding feedback.
      </p>
      <button onClick={() => navigate('/chemistry')}
        style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.blue, color:'#fff', fontSize:12.5, fontWeight:600 }}>
        Open the Chemistry Lab →
      </button>
    </div>
  )
}
