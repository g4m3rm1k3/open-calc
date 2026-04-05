// InsideTheAtom.jsx
// Chemistry · Chapter 1 · Lesson 2 — Inside the Atom
//
// Three interactive sections:
//   1. Proton explorer (AtomViewer 3D) — drag through elements 1–20
//   2. Isotope explorer — carbon isotopes, stability, half-life
//   3. Electron shell builder — fill shells 1–18 electrons

import { useState, useEffect, useRef, useCallback } from 'react'
import AtomViewer from './AtomViewer.jsx'
import { ELEMENTS, CATEGORY_COLORS } from './chemistry_data'

// ── Colour helpers ─────────────────────────────────────────────────────────────
function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg:      dark ? '#0f172a' : '#f8fafc',
    surface: dark ? '#1e293b' : '#ffffff',
    surface2:dark ? '#0f172a' : '#f1f5f9',
    border:  dark ? '#334155' : '#e2e8f0',
    text:    dark ? '#e2e8f0' : '#1e293b',
    muted:   dark ? '#94a3b8' : '#64748b',
    hint:    dark ? '#475569' : '#94a3b8',
    accent:  dark ? '#38bdf8' : '#0284c7',
  }
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ text, C }) {
  return (
    <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase',
                  color:C.hint, marginBottom:8 }}>{text}</div>
  )
}

// ── Prose block ───────────────────────────────────────────────────────────────
function Prose({ children, C }) {
  return (
    <div style={{ fontSize:14, color:C.text, lineHeight:1.75, maxWidth:680 }}>{children}</div>
  )
}

// ── 1. Proton explorer ────────────────────────────────────────────────────────
// Build a lookup by atomic number from the full ELEMENTS array (first 20)
const ELEMENTS_BY_N = {}
ELEMENTS.forEach(el => { ELEMENTS_BY_N[el.n] = el })

function ProtonExplorer({ C }) {
  const [protons, setProtons] = useState(6)
  const el = ELEMENTS_BY_N[protons]
  const cat = el ? CATEGORY_COLORS[el.cat] || CATEGORY_COLORS.unknown : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SectionLabel text="Part 1 — Protons define the element" C={C} />
      <Prose C={C}>
        Every atom has a nucleus at its centre, and the nucleus contains
        <strong> protons</strong>. The number of protons is called the
        <strong> atomic number (Z)</strong>. Change Z by even one and you are
        looking at a completely different element with completely different
        chemistry.
        <br /><br />
        Drag through the first 20 elements. Watch the 3D nucleus grow as protons
        accumulate, and the electron shells fill in layers. The category badge
        updates — notice how <em>alkali metals</em> appear every 8 elements,
        always when a new shell starts with a single electron.
      </Prose>

      {/* Slider */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:13, color:C.muted, whiteSpace:'nowrap' }}>Protons (Z):</span>
        <input type="range" min={1} max={20} value={protons}
          onChange={e => setProtons(+e.target.value)}
          style={{ flex:1 }} />
        <span style={{ fontSize:22, fontWeight:700, color:C.accent, fontFamily:'monospace',
                       minWidth:32, textAlign:'right' }}>{protons}</span>
      </div>

      {/* Layout: 3D viewer + info panel */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:16, alignItems:'start' }}>
        <AtomViewer element={el} height={360} />

        {el && cat && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* Element badge */}
            <div style={{ background:cat.bg, border:`1.5px solid ${cat.border}`, borderRadius:10,
                          padding:'12px 14px', textAlign:'center' }}>
              <div style={{ fontSize:11, color:cat.text, opacity:0.65 }}>Z = {el.n}</div>
              <div style={{ fontSize:36, fontWeight:700, color:cat.text, fontFamily:'monospace',
                            lineHeight:1.1 }}>{el.symbol}</div>
              <div style={{ fontSize:14, color:cat.text, fontWeight:600 }}>{el.name}</div>
              <div style={{ fontSize:11, color:cat.text, opacity:0.7, marginTop:3 }}>
                {el.mass} u
              </div>
            </div>

            {/* Category */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
                          padding:'8px 12px' }}>
              <div style={{ fontSize:10, color:C.hint, marginBottom:4 }}>CATEGORY</div>
              <div style={{ fontSize:12, color:cat.text,
                            background:cat.bg, border:`1px solid ${cat.border}`,
                            padding:'3px 8px', borderRadius:5, display:'inline-block' }}>
                {el.cat.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
              </div>
            </div>

            {/* Shells */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
                          padding:'8px 12px' }}>
              <div style={{ fontSize:10, color:C.hint, marginBottom:6 }}>ELECTRON SHELLS</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {el.shells.map((count, i) => (
                  <div key={i} style={{
                    padding:'3px 8px', borderRadius:5, fontSize:12, fontFamily:'monospace',
                    background: i === el.shells.length - 1
                      ? 'rgba(56,189,248,0.15)' : C.surface2,
                    border: `1px solid ${i === el.shells.length - 1 ? '#38bdf8' : C.border}`,
                    color: i === el.shells.length - 1 ? '#38bdf8' : C.muted,
                  }}>n{i+1}: {count}e⁻</div>
                ))}
              </div>
              <div style={{ fontSize:11, color:C.hint, marginTop:6 }}>
                Valence (outer): <strong style={{ color:C.accent }}>
                  {el.shells[el.shells.length-1]}e⁻
                </strong>
              </div>
            </div>

            {/* Fact */}
            <div style={{ background:cat.bg, borderLeft:`3px solid ${cat.border}`,
                          borderRadius:'0 8px 8px 0', padding:'8px 12px' }}>
              <div style={{ fontSize:10, color:cat.text, opacity:0.65, fontWeight:600,
                            marginBottom:4 }}>⚡ Fact</div>
              <div style={{ fontSize:12, color:cat.text, lineHeight:1.65 }}>{el.fact}</div>
            </div>
          </div>
        )}
      </div>

      {/* Periodic pattern callout */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10,
                    padding:'12px 16px' }}>
        <div style={{ fontSize:11, color:C.hint, fontWeight:600, marginBottom:6 }}>
          The pattern behind the periodic table
        </div>
        <div style={{ fontSize:13, color:C.text, lineHeight:1.7 }}>
          Elements 1–2: shell 1 fills (2 electrons). Helium = full shell = inert noble gas.
          &nbsp;· Elements 3–10: shell 2 fills (8 electrons). Neon = full shell = inert.
          &nbsp;· Elements 11–18: shell 3. Argon = full shell = inert. Every time a shell
          fills, you get a noble gas. Every time a new shell starts with 1 electron, you
          get an alkali metal — the most reactive element class.
        </div>
      </div>
    </div>
  )
}

// ── 2. Isotope explorer (Canvas 2D, inline React) ─────────────────────────────
const ISOTOPES = [
  { name:'Carbon-10', neutrons:4,  stable:false, halflife:'19 seconds',   abundance:'Artificial',          note:'Far too few neutrons. Decays almost instantly.' },
  { name:'Carbon-11', neutrons:5,  stable:false, halflife:'20 minutes',   abundance:'Artificial',          note:'Used in PET scan imaging. Decays quickly enough to limit radiation exposure.' },
  { name:'Carbon-12', neutrons:6,  stable:true,  halflife:'Stable',       abundance:'98.89% of all carbon',note:'The reference standard. Atomic mass unit = 1/12 of C-12.' },
  { name:'Carbon-13', neutrons:7,  stable:true,  halflife:'Stable',       abundance:'1.11% of all carbon', note:'Used in NMR spectroscopy — the technique behind MRI.' },
  { name:'Carbon-14', neutrons:8,  stable:false, halflife:'5,730 years',  abundance:'Trace (1 in 10¹²)',   note:'The basis of radiocarbon dating. Produced in the upper atmosphere.' },
  { name:'Carbon-15', neutrons:9,  stable:false, halflife:'2.4 seconds',  abundance:'Artificial',          note:'Too many neutrons. Emits an electron (beta decay), becoming Nitrogen-15.' },
]

function IsotopeCanvas({ iso }) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const cx = 120, cy = 120
    const protons = 6, total = protons + iso.neutrons
    const r = Math.max(20, 8 + Math.cbrt(total) * 9)
    const gc = iso.stable ? '#4ade80' : '#f87171'

    ctx.clearRect(0, 0, 240, 240)

    // Glow halo
    const grd = ctx.createRadialGradient(cx, cy, r*0.5, cx, cy, r + 24)
    grd.addColorStop(0, gc + '44'); grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, r + 24, 0, Math.PI*2); ctx.fill()

    // Nucleons (Fibonacci packing)
    for (let i = 0; i < total; i++) {
      const isProton = i < protons
      const phi = Math.acos(1 - 2*(i+0.5)/total)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const pr = r * 0.78 * Math.cbrt(i / total + 0.1)
      const px = cx + pr * Math.sin(phi) * Math.cos(theta)
      const py = cy + pr * Math.sin(phi) * Math.sin(theta)
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2)
      ctx.fillStyle = isProton ? '#f97316' : '#60a5fa'; ctx.fill()
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.font = '500 7px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(isProton ? 'p+' : 'n°', px, py)
    }

    // Stability ring
    ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI*2)
    ctx.strokeStyle = iso.stable ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'
    ctx.lineWidth = 2; ctx.setLineDash(iso.stable ? [] : [5, 3]); ctx.stroke(); ctx.setLineDash([])

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '500 12px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(protons + ' p+', 8, 20)
    ctx.fillStyle = 'rgba(96,165,250,0.7)'
    ctx.fillText(iso.neutrons + ' n°', 8, 36)
    ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
    ctx.fillStyle = '#f97316'; ctx.fillText('● proton',  232, 220)
    ctx.fillStyle = '#60a5fa'; ctx.fillText('● neutron', 232, 234)
  }, [iso])

  return (
    <canvas ref={ref} width={240} height={240}
      style={{ borderRadius:10, display:'block',
               background:'radial-gradient(ellipse at 40% 35%, #0d1f3e 0%, #050b18 100%)' }} />
  )
}

function IsotopeExplorer({ C }) {
  const [selected, setSelected] = useState(2)  // Carbon-12 default
  const iso = ISOTOPES[selected]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SectionLabel text="Part 2 — Neutrons & isotopes" C={C} />
      <Prose C={C}>
        Every nucleus also contains <strong>neutrons</strong> — uncharged
        particles with nearly the same mass as a proton. Neutrons do not change
        the element (that is determined solely by proton count), but they do
        change the <strong>mass</strong> and <strong>stability</strong> of the
        nucleus.
        <br /><br />
        <strong>Isotopes</strong> are atoms of the same element with different
        neutron counts. Chemically identical — different masses. When a nucleus
        has the wrong neutron-to-proton ratio, the strong nuclear force cannot
        hold it indefinitely: the nucleus is <em>radioactive</em> and will
        spontaneously decay.
      </Prose>

      {/* Isotope buttons */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {ISOTOPES.map((iso, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13,
            fontFamily:'monospace', fontWeight:600, transition:'all .15s',
            border:       `1.5px solid ${selected===i ? (iso.stable ?'#4ade80':'#f87171') : C.border}`,
            background:   selected===i ? (iso.stable ?'rgba(74,222,128,0.12)':'rgba(248,113,113,0.12)') : C.surface,
            color:        selected===i ? (iso.stable ?'#4ade80':'#f87171') : C.muted,
          }}>{iso.name}</button>
        ))}
      </div>

      {/* Canvas + details */}
      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:20, alignItems:'start' }}>
        <IsotopeCanvas iso={iso} />
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:20, fontWeight:600, fontFamily:'monospace', color:C.text }}>
            {iso.name}
          </div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'monospace' }}>
            6 protons + {iso.neutrons} neutrons = mass {6 + iso.neutrons}
          </div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px',
            borderRadius:8, fontSize:13, fontWeight:600, width:'fit-content',
            background: iso.stable ? '#d1fae5' : '#fee2e2',
            color:      iso.stable ? '#065f46' : '#991b1b',
            border:     `1px solid ${iso.stable ? '#10b981' : '#ef4444'}`,
          }}>
            {iso.stable ? '✓ Stable' : '⚡ Radioactive'}
          </div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:'monospace' }}>
            Half-life: {iso.halflife}
          </div>
          <div style={{ fontSize:11, color:C.hint, fontFamily:'monospace' }}>
            Natural abundance: {iso.abundance}
          </div>
          <div style={{ fontSize:13, color:C.text, lineHeight:1.65, borderLeft:`2px solid ${C.border}`,
                        paddingLeft:12, marginTop:4 }}>
            {iso.note}
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10,
                    padding:'12px 16px' }}>
        <div style={{ fontSize:11, color:C.hint, fontWeight:600, marginBottom:4 }}>Key insight</div>
        <div style={{ fontSize:13, color:C.text, lineHeight:1.7 }}>
          Same number of protons (same element, same chemistry). Different number of
          neutrons (different mass, different stability). Neutrons affect mass but{' '}
          <em>not</em> chemical behaviour.
        </div>
      </div>
    </div>
  )
}

// ── 3. Electron shell builder ─────────────────────────────────────────────────
const SHELL_ATOMS = [
  { e:1,  sym:'H',  name:'Hydrogen',   shells:[1],     val:1, tend:'Has 1 valence electron. Usually shares it to reach a full first shell of 2. Forms 1 bond.' },
  { e:2,  sym:'He', name:'Helium',     shells:[2],     val:2, tend:'Outer shell is full (max 2 for first shell). Completely stable. Does not react.' },
  { e:3,  sym:'Li', name:'Lithium',    shells:[2,1],   val:1, tend:'1 valence electron. Very eager to give it away. Highly reactive.' },
  { e:4,  sym:'Be', name:'Beryllium',  shells:[2,2],   val:2, tend:'2 valence electrons. Tends to lose both, forming Be²⁺. Less reactive than lithium.' },
  { e:5,  sym:'B',  name:'Boron',      shells:[2,3],   val:3, tend:'3 valence electrons. Forms 3 bonds. One of the few elements happy with fewer than 8.' },
  { e:6,  sym:'C',  name:'Carbon',     shells:[2,4],   val:4, tend:'4 valence electrons, 4 empty slots. Exactly halfway. Forms 4 bonds. The basis of all organic chemistry.' },
  { e:7,  sym:'N',  name:'Nitrogen',   shells:[2,5],   val:5, tend:'5 valence electrons, 3 empty slots. N₂ has a triple bond — very stable.' },
  { e:8,  sym:'O',  name:'Oxygen',     shells:[2,6],   val:6, tend:'6 valence electrons, 2 empty slots. Very electronegative — pulls electrons toward itself.' },
  { e:9,  sym:'F',  name:'Fluorine',   shells:[2,7],   val:7, tend:'7 valence electrons, 1 empty slot. Most electronegative element. Forms exactly 1 bond.' },
  { e:10, sym:'Ne', name:'Neon',       shells:[2,8],   val:8, tend:'Full outer shell. Completely stable. This is the target state that drives all bonding.' },
  { e:11, sym:'Na', name:'Sodium',     shells:[2,8,1], val:1, tend:'1 valence electron in a new third shell. Same situation as lithium — very eager to give it away.' },
  { e:12, sym:'Mg', name:'Magnesium',  shells:[2,8,2], val:2, tend:'2 valence electrons. Tends to lose both. Reacts with water and acids.' },
  { e:13, sym:'Al', name:'Aluminium',  shells:[2,8,3], val:3, tend:'3 valence electrons. Tends to lose all 3, forming Al³⁺. Forms a protective oxide layer.' },
  { e:14, sym:'Si', name:'Silicon',    shells:[2,8,4], val:4, tend:'4 valence electrons — same as carbon. Forms 4 bonds. Basis of semiconductors and glass.' },
  { e:15, sym:'P',  name:'Phosphorus', shells:[2,8,5], val:5, tend:'5 valence electrons. Forms 3 or 5 bonds. Essential in DNA and ATP.' },
  { e:16, sym:'S',  name:'Sulfur',     shells:[2,8,6], val:6, tend:'6 valence electrons. Usually forms 2 bonds (like oxygen). Can also form 4 or 6 in special cases.' },
  { e:17, sym:'Cl', name:'Chlorine',   shells:[2,8,7], val:7, tend:'7 valence electrons — same as fluorine. Needs 1 more. Forms 1 bond. Very reactive.' },
  { e:18, sym:'Ar', name:'Argon',      shells:[2,8,8], val:8, tend:'Full outer shell. Completely stable. Noble gas. Every 8 electrons in the outer shell = inert element.' },
]

function ShellCanvas({ atom }) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const cx = 130, cy = 130
    ctx.clearRect(0, 0, 260, 260)

    // Nucleus
    const nc = atom.shells.length >= 3 ? '#f97316' : atom.shells.length === 2 ? '#fb923c' : '#fbbf24'
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI*2); ctx.fillStyle = nc; ctx.fill()
    ctx.fillStyle = 'white'; ctx.font = '500 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(atom.sym, cx, cy)

    const radii = [46, 76, 106]
    const maxPerShell = [2, 8, 18]
    atom.shells.forEach((count, si) => {
      const r = radii[si]
      const maxS = maxPerShell[si]
      const isOuter = si === atom.shells.length - 1

      // Ring
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2)
      ctx.strokeStyle = isOuter ? 'rgba(56,189,248,0.45)' : 'rgba(148,163,184,0.2)'
      ctx.lineWidth = isOuter ? 1.5 : 1; ctx.stroke()

      const displayMax = Math.min(maxS, 8)
      // Filled electrons
      for (let e = 0; e < count; e++) {
        const angle = (e / displayMax) * Math.PI * 2 - Math.PI/2
        const ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle)
        ctx.beginPath(); ctx.arc(ex, ey, isOuter ? 5.5 : 4, 0, Math.PI*2)
        ctx.fillStyle = isOuter ? '#38bdf8' : 'rgba(148,163,184,0.65)'; ctx.fill()
      }
      // Empty slots on outer shell only
      if (isOuter && count < displayMax) {
        for (let s = count; s < displayMax; s++) {
          const a2 = (s / displayMax) * Math.PI*2 - Math.PI/2
          const sx = cx + r * Math.cos(a2), sy = cy + r * Math.sin(a2)
          ctx.beginPath(); ctx.arc(sx, sy, 5.5, 0, Math.PI*2)
          ctx.strokeStyle = 'rgba(56,189,248,0.22)'; ctx.lineWidth = 1
          ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([])
        }
      }
      // Shell label
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`n=${si+1}: ${count}`, cx + r + 5, cy - si * 14)
    })
  }, [atom])

  return (
    <canvas ref={ref} width={260} height={260}
      style={{ borderRadius:12, display:'block',
               background:'radial-gradient(ellipse at 50% 50%, #0d1f3e 0%, #050b18 100%)' }} />
  )
}

function reactivityInfo(atom) {
  const val = atom.val
  const maxShell = [2, 8, 18][atom.shells.length - 1] || 8
  if (val === maxShell || (val === 2 && atom.shells.length === 1))
    return { level:0,  label:'Inert (full outer shell)', color:'#4ade80' }
  if (val === 1 || val === 7) return { level:95, label:'Highly reactive',      color:'#f87171' }
  if (val === 2 || val === 6) return { level:70, label:'Reactive',             color:'#fb923c' }
  if (val === 3 || val === 5) return { level:45, label:'Moderately reactive',  color:'#fbbf24' }
  return                             { level:30, label:'Moderate',             color:'#a3e635' }
}

function ShellBuilder({ C }) {
  const [n, setN] = useState(1)
  const atom = SHELL_ATOMS[n - 1]
  const outer = atom.shells[atom.shells.length - 1]
  const maxOuter = Math.min([2, 8, 18][atom.shells.length - 1] || 8, 8)
  const react = reactivityInfo(atom)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SectionLabel text="Part 3 — Electron shells & valence electrons" C={C} />
      <Prose C={C}>
        Electrons are the particles that interact with the outside world — they
        determine every chemical bond and every reaction. Electrons occupy
        <strong> shells</strong> (energy levels) around the nucleus, filling
        from lowest energy upward. The first shell holds 2; the second holds 8.
        <br /><br />
        The electrons in the outermost shell are called <strong>valence
        electrons</strong>. Atoms are most stable with a full outer shell.
        Every incomplete outer shell is a drive to complete it — by sharing
        electrons (covalent bond) or transferring them (ionic bond).
      </Prose>

      {/* Slider */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:13, color:C.muted, whiteSpace:'nowrap' }}>Electrons:</span>
        <input type="range" min={1} max={18} value={n}
          onChange={e => setN(+e.target.value)}
          style={{ flex:1 }} />
        <span style={{ fontSize:22, fontWeight:700, color:'#38bdf8', fontFamily:'monospace',
                       minWidth:24, textAlign:'right' }}>{n}</span>
        <span style={{ fontSize:14, color:C.muted }}>— {atom.sym} · {atom.name}</span>
      </div>

      {/* Layout: shell canvas + info */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20, alignItems:'start' }}>
        <ShellCanvas atom={atom} />

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {/* Shell config */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
                        padding:'10px 14px' }}>
            <div style={{ fontSize:10, color:C.hint, marginBottom:4 }}>SHELL CONFIGURATION</div>
            <div style={{ fontSize:22, fontFamily:'monospace', fontWeight:600, color:'#38bdf8' }}>
              [{atom.shells.join(', ')}]
            </div>
          </div>

          {/* Valence dots */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
                        padding:'10px 14px' }}>
            <div style={{ fontSize:10, color:C.hint, marginBottom:6 }}>VALENCE ELECTRONS</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:5 }}>
              {Array.from({ length: outer }, (_, i) => (
                <div key={i} style={{ width:16, height:16, borderRadius:'50%',
                                      background:'#38bdf8', border:'1.5px solid #0ea5e9' }} />
              ))}
              {Array.from({ length: maxOuter - outer }, (_, i) => (
                <div key={i} style={{ width:16, height:16, borderRadius:'50%',
                                      border:'1.5px dashed rgba(148,163,184,0.5)' }} />
              ))}
            </div>
            <div style={{ fontSize:11, color:C.hint }}>
              {outer} valence electron{outer !== 1 ? 's' : ''} · {maxOuter - outer} empty slot{maxOuter - outer !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Reactivity meter */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
                        padding:'10px 14px' }}>
            <div style={{ fontSize:10, color:C.hint, marginBottom:6 }}>REACTIVITY</div>
            <div style={{ height:10, borderRadius:5, background:C.surface2, overflow:'hidden',
                          marginBottom:4 }}>
              <div style={{ height:'100%', width:`${react.level}%`, borderRadius:5,
                            background:react.color, transition:'width .3s, background .3s' }} />
            </div>
            <div style={{ fontSize:12, color:react.color, fontWeight:600 }}>{react.label}</div>
          </div>

          {/* Tendency */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
                        padding:'10px 14px' }}>
            <div style={{ fontSize:10, color:C.hint, marginBottom:4 }}>BONDING TENDENCY</div>
            <div style={{ fontSize:12, color:C.text, lineHeight:1.7,
                          borderLeft:`2px solid ${C.border}`, paddingLeft:10 }}>
              {atom.tend}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function InsideTheAtom({ params }) {
  const C = useColors()

  const sections = [
    { id:'protons',   label:'Protons',        icon:'⚛', component: <ProtonExplorer C={C} /> },
    { id:'isotopes',  label:'Isotopes',        icon:'⚗', component: <IsotopeExplorer C={C} /> },
    { id:'electrons', label:'Electron Shells', icon:'🔵', component: <ShellBuilder C={C} /> },
  ]
  const [active, setActive] = useState('protons')

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
                  fontFamily:'sans-serif', background:C.bg, overflow:'hidden' }}>

      {/* Tab bar */}
      <div style={{ display:'flex', alignItems:'center', gap:2, padding:'6px 12px',
                    borderBottom:`1px solid ${C.border}`, background:C.surface, flexShrink:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginRight:10 }}>
          Inside the Atom
        </div>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{
            padding:'5px 14px', borderRadius:7, border:'none', cursor:'pointer',
            fontSize:12, fontWeight:600, transition:'all .13s',
            background:   active === s.id ? 'rgba(56,189,248,0.12)' : 'transparent',
            color:        active === s.id ? '#38bdf8' : C.muted,
            borderBottom: active === s.id ? '2px solid #38bdf8' : '2px solid transparent',
          }}>{s.icon} {s.label}</button>
        ))}
      </div>

      {/* Section content */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        {sections.find(s => s.id === active)?.component}
      </div>
    </div>
  )
}
