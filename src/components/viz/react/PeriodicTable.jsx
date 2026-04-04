// PeriodicTable.jsx
// Interactive periodic table — fixed 3D atom viewer, periodic trends, quick filters.
// Uses Three.js for the atom visualization.

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ELEMENTS, CATEGORY_COLORS, GRID_POSITIONS } from './chemistry_data'

// ── State at STP (298 K) ──────────────────────────────────────────────────────
function stateAtSTP(el) {
  if (el.boil != null && el.boil <= 298) return 'gas'
  if (el.melt != null && el.melt <= 298) return 'liquid'
  if (el.melt != null && el.melt > 298)  return 'solid'
  return 'unknown'
}
const STATE_DOT   = { solid:'#94a3b8', liquid:'#22d3ee', gas:'#fbbf24', unknown:'#374151' }
const STATE_LABEL = { solid:'Solid',   liquid:'Liquid',  gas:'Gas',     unknown:'Unknown'  }

// ── Periodic trend definitions ────────────────────────────────────────────────
const TRENDS = [
  { key:'radius',  label:'Atomic Radius',     unit:'pm',    color:'#818cf8', get: el => el.radius  },
  { key:'eneg',    label:'Electronegativity', unit:'',      color:'#f59e0b', get: el => el.eneg    },
  { key:'density', label:'Density',           unit:'g/cm³', color:'#10b981', get: el => el.density ? Math.log10(el.density + 0.001) : null },
  { key:'melt',    label:'Melting Point',     unit:'K',     color:'#ef4444', get: el => el.melt    },
  { key:'boil',    label:'Boiling Point',     unit:'K',     color:'#f97316', get: el => el.boil    },
]

function buildScale(trendKey) {
  const t = TRENDS.find(x => x.key === trendKey)
  if (!t) return null
  const vals = ELEMENTS.map(el => t.get(el)).filter(v => v != null)
  const min = Math.min(...vals), max = Math.max(...vals)
  const rgb = [t.color.slice(1,3), t.color.slice(3,5), t.color.slice(5,7)].map(h => parseInt(h,16))
  return { ...t, min, max, rgb, norm: v => v != null ? (v - min) / (max - min) : null }
}

// ── Dark mode colors ──────────────────────────────────────────────────────────
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
  }
}

// ── 3D Atom Viewer ────────────────────────────────────────────────────────────
// Each shell's electrons live inside a THREE.Group that shares the exact same
// rotation as its orbit ring, so Three.js keeps them perfectly on the ring —
// no manual rotation math needed.
function AtomViewer({ element }) {
  const mountRef = useRef(null)
  const ctrlRef  = useRef(null)   // exposes zoomIn / zoomOut / reset to buttons

  useEffect(() => {
    if (!mountRef.current || !element) return
    const container = mountRef.current
    const W = container.offsetWidth || 360
    const H = 380

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Scene / Camera
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000)
    camera.position.set(0, 0, 8)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const pl1 = new THREE.PointLight(0xffffff, 0.8); pl1.position.set(5, 5, 5);   scene.add(pl1)
    const pl2 = new THREE.PointLight(0x4488ff, 0.4); pl2.position.set(-5,-3,-5);  scene.add(pl2)

    // Nucleus — Fibonacci-packed protons + neutrons
    const catColor   = CATEGORY_COLORS[element.cat] || CATEGORY_COLORS.unknown
    const protons    = element.n
    const neutrons   = Math.round(element.mass - element.n)
    const nucleonN   = Math.min(protons + neutrons, 60)
    const nucleonR   = 0.12 * Math.cbrt(nucleonN) + 0.22
    const nucleonGeo = new THREE.SphereGeometry(0.18, 10, 10)
    for (let i = 0; i < nucleonN; i++) {
      const isProton = i < protons
      const mat  = new THREE.MeshPhongMaterial({ color: isProton ? 0xef4444 : 0x94a3b8, shininess: 60 })
      const mesh = new THREE.Mesh(nucleonGeo, mat)
      const phi  = Math.acos(1 - 2*(i+0.5)/nucleonN)
      const th   = Math.PI * (1 + Math.sqrt(5)) * i
      const r    = nucleonR * Math.cbrt(i / nucleonN + 0.1)
      mesh.position.set(r*Math.sin(phi)*Math.cos(th), r*Math.sin(phi)*Math.sin(th), r*Math.cos(phi))
      scene.add(mesh)
    }
    // Nucleus glow
    const nucleusHex = parseInt(catColor.border.replace('#',''), 16)
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(nucleonR + 0.18, 20, 20),
      new THREE.MeshBasicMaterial({ color: nucleusHex, transparent: true, opacity: 0.12 })
    ))

    // Electron shells
    const shells      = element.shells || []
    const electronObjs = []  // { mesh, radius, phase, speed }
    const SHELL_COLORS = [0x38bdf8, 0xa78bfa, 0x4ade80, 0xfbbf24, 0xf87171, 0xfb923c, 0xe879f9]

    shells.forEach((count, si) => {
      const shellR = 1.4 + si * 1.0
      const tiltX  = Math.PI / 2 + si * 0.35   // unique tilt per shell for 3-D look
      const tiltY  = si * 0.5

      // Orbit ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(shellR, 0.012, 8, 80),
        new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 })
      )
      ring.rotation.x = tiltX
      ring.rotation.y = tiltY
      scene.add(ring)

      // Orbit group — SAME rotation as ring so electrons are always on the ring
      const group = new THREE.Group()
      group.rotation.x = tiltX
      group.rotation.y = tiltY
      scene.add(group)

      // Electrons — colour cycles per shell for easy visual separation
      const eColor = SHELL_COLORS[si % SHELL_COLORS.length]
      const eMat   = new THREE.MeshPhongMaterial({ color: eColor, emissive: eColor, emissiveIntensity: 0.5, shininess: 100 })
      const eGeo   = new THREE.SphereGeometry(0.09, 8, 8)
      for (let e = 0; e < count; e++) {
        const mesh = new THREE.Mesh(eGeo, eMat)
        group.add(mesh)
        electronObjs.push({ mesh, radius: shellR, phase: (e / count) * Math.PI * 2, speed: 0.4 / (si + 1) })
      }
    })

    // Mouse drag to orbit
    let isDragging = false, prev = { x:0, y:0 }
    let rotX = 0.3, rotY = 0.2
    const onDown = e => { isDragging = true; prev = { x: e.clientX, y: e.clientY } }
    const onUp   = () => { isDragging = false }
    const onMove = e => {
      if (!isDragging) return
      rotY += (e.clientX - prev.x) * 0.01
      rotX += (e.clientY - prev.y) * 0.01
      prev = { x: e.clientX, y: e.clientY }
    }
    // Scroll wheel zoom
    const onWheel = e => {
      e.preventDefault()
      camera.position.z = Math.max(3, Math.min(22, camera.position.z + e.deltaY * 0.02))
    }
    renderer.domElement.addEventListener('mousedown', onDown)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)

    // Expose controls to overlay buttons
    ctrlRef.current = {
      zoomIn:  () => { camera.position.z = Math.max(3,  camera.position.z - 1.5) },
      zoomOut: () => { camera.position.z = Math.min(22, camera.position.z + 1.5) },
      reset:   () => { rotX = 0.3; rotY = 0.2; camera.position.z = 8 },
    }

    // Animation loop
    let t = 0, animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.016
      if (!isDragging) rotY += 0.004
      scene.rotation.y = rotY
      scene.rotation.x = rotX * 0.3
      // Electrons orbit in the group's local XY plane — always on the ring
      electronObjs.forEach(obj => {
        const angle = obj.phase + t * obj.speed
        obj.mesh.position.set(obj.radius * Math.cos(angle), obj.radius * Math.sin(angle), 0)
      })
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      renderer.domElement.removeEventListener('mousedown', onDown)
      renderer.domElement.removeEventListener('wheel', onWheel)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      ctrlRef.current = null
    }
  }, [element])

  return (
    <div style={{ position:'relative', userSelect:'none' }}>
      {/* Canvas */}
      <div ref={mountRef} style={{
        width:'100%', height:380, cursor:'grab', borderRadius:10, overflow:'hidden',
        background:'radial-gradient(ellipse at 50% 50%, #0a1a35 0%, #050a18 100%)',
      }} />
      {/* Zoom / reset buttons */}
      <div style={{ position:'absolute', bottom:10, right:10, display:'flex', flexDirection:'column', gap:4 }}>
        {[
          { s:'+', fn: () => ctrlRef.current?.zoomIn(),  t:'Zoom in'   },
          { s:'−', fn: () => ctrlRef.current?.zoomOut(), t:'Zoom out'  },
          { s:'⟲', fn: () => ctrlRef.current?.reset(),  t:'Reset view' },
        ].map(({ s, fn, t }) => (
          <button key={s} onClick={fn} title={t} style={{
            width:28, height:28, borderRadius:6, border:'1px solid #334155',
            background:'rgba(15,23,42,0.85)', color:'#94a3b8', fontSize:s==='⟲'?13:16,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
          }}>{s}</button>
        ))}
      </div>
      {/* Shell legend */}
      <div style={{ position:'absolute', top:8, left:8, display:'flex', flexWrap:'wrap', gap:4 }}>
        {(element?.shells || []).map((count, i) => (
          <div key={i} style={{
            fontSize:10, color:'#cbd5e1', background:'rgba(15,23,42,0.75)',
            padding:'2px 7px', borderRadius:4, border:'1px solid #1e293b',
          }}>n={i+1} · {count}e⁻</div>
        ))}
      </div>
    </div>
  )
}

// ── Element tile ──────────────────────────────────────────────────────────────
function ElementCell({ el, isSelected, onClick, scale }) {
  if (!el) return <div style={{ width:40, height:48, flexShrink:0 }} />
  const cat    = CATEGORY_COLORS[el.cat] || CATEGORY_COLORS.unknown
  const state  = stateAtSTP(el)

  // Trend colour overlay replaces category background
  let bg     = isSelected ? 'rgba(251,191,36,0.28)' : cat.bg
  let border = isSelected ? '#fbbf24' : cat.border
  if (scale) {
    const n = scale.norm(scale.get(el))
    if (n != null) {
      const [r,g,b] = scale.rgb
      bg = `rgba(${r},${g},${b},${0.12 + n * 0.78})`
    }
  }

  return (
    <div onClick={() => onClick(el)}
      title={`${el.name} (${el.n}) · ${el.mass} u · ${STATE_LABEL[state]}`}
      style={{
        width:40, height:48, borderRadius:5, border:`1px solid ${border}`,
        background: bg, cursor:'pointer', flexShrink:0,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        transition:'transform .12s, box-shadow .12s',
        transform: isSelected ? 'scale(1.14)' : 'scale(1)',
        boxShadow: isSelected ? '0 0 12px rgba(251,191,36,0.55)' : 'none',
      }}>
      <div style={{ fontSize:8,  color:cat.text, opacity:0.65, lineHeight:1 }}>{el.n}</div>
      <div style={{ fontSize:13, color:cat.text, fontWeight:700, fontFamily:'monospace', lineHeight:1.1 }}>{el.symbol}</div>
      <div style={{ fontSize:7,  color:cat.text, opacity:0.6,  lineHeight:1 }}>{el.mass.toFixed(1)}</div>
      <div style={{ width:4, height:4, borderRadius:'50%', background:STATE_DOT[state], marginTop:1 }} />
    </div>
  )
}

// Ghost placeholder at La / Ac positions in the main body
function GhostTile({ label, sub }) {
  return (
    <div style={{
      width:40, height:48, borderRadius:5, border:'1px dashed #334155',
      background:'rgba(99,102,241,0.07)', flexShrink:0,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{ fontSize:8,  color:'#6366f1', textAlign:'center' }}>{label}</div>
      <div style={{ fontSize:7,  color:'#475569', textAlign:'center' }}>{sub}</div>
    </div>
  )
}

// ── Info panel ────────────────────────────────────────────────────────────────
function InfoPanel({ element, C }) {
  if (!element) return (
    <div style={{ padding:40, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
      <div style={{ fontSize:48, opacity:0.2 }}>⚛</div>
      <div style={{ color:C.hint, fontSize:13 }}>Click any element to explore it</div>
      <div style={{ color:C.hint, fontSize:11, opacity:0.6 }}>Drag to rotate · Scroll to zoom · Trend toggles above</div>
    </div>
  )
  const cat   = CATEGORY_COLORS[element.cat] || CATEGORY_COLORS.unknown
  const state = stateAtSTP(element)
  const fmt   = v => v != null ? v : '—'
  const rows  = [
    ['Atomic number',    element.n],
    ['Atomic mass',      `${element.mass} u`],
    ['State at 25 °C',  STATE_LABEL[state]],
    ['Period / Group',  `${element.period} / ${element.group}`],
    ['Electron config', element.config],
    ['Shells',          `[${element.shells?.join(', ')}]`],
    ['Electronegativity', fmt(element.eneg)],
    ['Atomic radius',   element.radius  ? `${element.radius} pm` : '—'],
    ['Melting point',   element.melt    ? `${element.melt} K  (${(element.melt-273.15).toFixed(1)} °C)` : '—'],
    ['Boiling point',   element.boil    ? `${element.boil} K  (${(element.boil-273.15).toFixed(1)} °C)` : '—'],
    ['Density',         element.density ? `${element.density} g/cm³` : '—'],
    ['Discovered by',   fmt(element.discovered)],
    ['Year',            fmt(element.year)],
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:cat.bg, borderBottom:`1px solid ${cat.border}`, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:68, height:68, borderRadius:10, border:`2px solid ${cat.border}`, background:'rgba(0,0,0,0.28)',
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <div style={{ fontSize:10, color:cat.text, opacity:0.65 }}>{element.n}</div>
          <div style={{ fontSize:28, fontWeight:700, color:cat.text, fontFamily:'monospace', lineHeight:1 }}>{element.symbol}</div>
          <div style={{ fontSize:9,  color:cat.text, opacity:0.75 }}>{element.mass}</div>
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:18, fontWeight:600, color:cat.text }}>{element.name}</div>
          <div style={{ fontSize:11, color:cat.text, opacity:0.7, marginTop:2 }}>
            {element.cat.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
          </div>
          <div style={{ fontSize:11, color:cat.text, opacity:0.7 }}>Period {element.period} · Group {element.group}</div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:STATE_DOT[state], display:'inline-block' }} />
            <span style={{ fontSize:10, color:cat.text, opacity:0.8 }}>{STATE_LABEL[state]} at room temperature</span>
          </div>
        </div>
      </div>

      {/* 3D Atom viewer */}
      <div style={{ padding:'12px 14px', background:C.surface2 }}>
        <div style={{ fontSize:10, color:C.hint, marginBottom:8, letterSpacing:'.08em', textTransform:'uppercase' }}>
          Bohr Model — drag to rotate · scroll to zoom
        </div>
        <AtomViewer element={element} />
      </div>

      {/* Properties */}
      <div style={{ padding:'12px 18px' }}>
        <div style={{ fontSize:10, color:C.hint, marginBottom:8, letterSpacing:'.08em', textTransform:'uppercase' }}>Properties</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px 10px' }}>
          {rows.map(([label, val]) => (
            <div key={label} style={{ padding:'5px 0', borderBottom:`0.5px solid ${C.border}` }}>
              <div style={{ fontSize:9,  color:C.hint }}>{label}</div>
              <div style={{ fontSize:12, color:C.text, fontFamily:'monospace', wordBreak:'break-all' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Uses */}
      <div style={{ padding:'0 18px 12px' }}>
        <div style={{ fontSize:10, color:C.hint, marginBottom:5, letterSpacing:'.08em', textTransform:'uppercase' }}>Common Uses</div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.7 }}>{element.uses}</div>
      </div>

      {/* Fun fact */}
      <div style={{ margin:'0 18px 18px', padding:'10px 14px', background:cat.bg, borderLeft:`3px solid ${cat.border}`, borderRadius:'0 8px 8px 0' }}>
        <div style={{ fontSize:10, color:cat.text, opacity:0.65, fontWeight:600, marginBottom:4 }}>⚡ Fun fact</div>
        <div style={{ fontSize:12, color:cat.text, lineHeight:1.65 }}>{element.fact}</div>
      </div>
    </div>
  )
}

// ── Category legend (clickable filters) ──────────────────────────────────────
function Legend({ filterCat, setFilterCat, C }) {
  const cats = [
    ['alkali-metal','Alkali Metal'],        ['alkaline-earth','Alkaline Earth'],
    ['transition-metal','Transition Metal'],['post-transition','Post-Transition'],
    ['metalloid','Metalloid'],              ['nonmetal','Nonmetal'],
    ['halogen','Halogen'],                  ['noble-gas','Noble Gas'],
    ['lanthanide','Lanthanide'],            ['actinide','Actinide'],
  ]
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
      {cats.map(([key, label]) => {
        const c      = CATEGORY_COLORS[key]
        const active = filterCat === key
        return (
          <div key={key} onClick={() => setFilterCat(active ? null : key)}
            style={{
              display:'flex', alignItems:'center', gap:4, cursor:'pointer',
              padding:'2px 7px', borderRadius:4, transition:'all .13s',
              background: active ? c.bg       : 'transparent',
              border:     active ? `1px solid ${c.border}` : '1px solid transparent',
            }}>
            <div style={{ width:8, height:8, borderRadius:2, background:c.bg, border:`1px solid ${c.border}`, flexShrink:0 }} />
            <span style={{ fontSize:10, color: active ? c.text : C.muted }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── State-at-STP filter chips ─────────────────────────────────────────────────
function StateFilters({ filterState, setFilterState, C }) {
  const opts = [
    { key:'solid',  label:'Solids',  color:'#94a3b8' },
    { key:'liquid', label:'Liquids', color:'#22d3ee' },
    { key:'gas',    label:'Gases',   color:'#fbbf24' },
  ]
  return (
    <div style={{ display:'flex', gap:5 }}>
      {opts.map(({ key, label, color }) => {
        const active = filterState === key
        return (
          <button key={key} onClick={() => setFilterState(active ? null : key)} style={{
            padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:11,
            border:`1px solid ${active ? color : C.border}`,
            background: active ? `${color}22` : C.surface,
            color: active ? color : C.muted,
            display:'flex', alignItems:'center', gap:5,
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:color, display:'inline-block' }} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Trend toggle bar ──────────────────────────────────────────────────────────
function TrendBar({ active, setActive, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
      <span style={{ fontSize:11, color:C.hint, whiteSpace:'nowrap' }}>Trend:</span>
      {TRENDS.map(t => {
        const on = active === t.key
        return (
          <button key={t.key} onClick={() => setActive(on ? null : t.key)} style={{
            padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:11,
            border:`1px solid ${on ? t.color : C.border}`,
            background: on ? `${t.color}22` : C.surface,
            color: on ? t.color : C.muted,
          }}>{t.label}</button>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PeriodicTable({ params = {} }) {
  const C = useColors()
  const [selected,    setSelected]    = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState(null)
  const [filterState, setFilterState] = useState(null)
  const [activeTrend, setActiveTrend] = useState(null)

  const scale = activeTrend ? buildScale(activeTrend) : null

  // Build 9-row × 18-col grid
  const grid = Array.from({ length: 9 }, () => Array(18).fill(null))
  ELEMENTS.forEach(el => {
    const pos = GRID_POSITIONS[el.n]
    if (pos) grid[pos[0]-1][pos[1]-1] = el
  })

  const matches = el => {
    if (!el) return false
    if (filterCat   && el.cat !== filterCat) return false
    if (filterState && stateAtSTP(el) !== filterState) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      el.name.toLowerCase().includes(q)                              ||
      el.symbol.toLowerCase().includes(q)                            ||
      String(el.n).includes(q)                                       ||
      el.cat.toLowerCase().replace(/-/g,' ').includes(q)             ||
      STATE_LABEL[stateAtSTP(el)].toLowerCase().includes(q)          ||
      `period ${el.period}`.includes(q)                              ||
      `group ${el.group}`.includes(q)
    )
  }

  return (
    <div style={{ width:'100%', fontFamily:'sans-serif', background:C.bg, minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ padding:'10px 14px', borderBottom:`0.5px solid ${C.border}`, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:600, color:C.text }}>Periodic Table</div>
            <div style={{ fontSize:11, color:C.muted }}>118 elements — click to explore</div>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, symbol, number, category, state, period, group…"
            style={{ flex:1, minWidth:200, padding:'6px 12px', borderRadius:8,
                     border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:12 }}
          />
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'flex-start' }}>
          <StateFilters filterState={filterState} setFilterState={setFilterState} C={C} />
          <TrendBar active={activeTrend} setActive={setActiveTrend} C={C} />
        </div>
        <Legend filterCat={filterCat} setFilterCat={setFilterCat} C={C} />
      </div>

      <div style={{ display:'flex' }}>

        {/* Table area */}
        <div style={{ flex:1, padding:'8px 6px', overflowX:'auto' }}>

          {/* Group numbers 1–18 */}
          <div style={{ display:'flex', gap:2, marginBottom:2, paddingLeft:22 }}>
            {Array.from({ length:18 }, (_,i) => (
              <div key={i} style={{ width:40, fontSize:8, color:C.hint, textAlign:'center', flexShrink:0 }}>{i+1}</div>
            ))}
          </div>

          {/* Periods 1–7 */}
          <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:6 }}>
            {grid.slice(0,7).map((row, ri) => (
              <div key={ri} style={{ display:'flex', gap:2, alignItems:'center' }}>
                <div style={{ width:18, fontSize:9, color:C.hint, textAlign:'right', flexShrink:0 }}>{ri+1}</div>
                {row.map((el, ci) => {
                  // Ghost placeholders where lanthanide/actinide rows branch off
                  if (!el && ri === 5 && ci === 2) return <GhostTile key={ci} label="57–71" sub="La–Lu" />
                  if (!el && ri === 6 && ci === 2) return <GhostTile key={ci} label="89–103" sub="Ac–Lr" />
                  if (!el) return <div key={ci} style={{ width:40, height:48, flexShrink:0 }} />
                  return (
                    <div key={ci} style={{ opacity: matches(el) ? 1 : 0.13, transition:'opacity .18s' }}>
                      <ElementCell el={el} isSelected={selected?.n === el.n} onClick={setSelected} scale={scale} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Separator */}
          <div style={{ height:1, background:C.border, margin:'0 0 5px 22px' }} />
          <div style={{ fontSize:10, color:C.hint, marginBottom:4, paddingLeft:22 }}>
            Lanthanides (period 6) · Actinides (period 7)
          </div>

          {/* Lanthanide / actinide rows */}
          {grid.slice(7).map((row, ri) => (
            <div key={ri} style={{ display:'flex', gap:2, marginBottom:2, alignItems:'center' }}>
              <div style={{ width:18, fontSize:9, color:C.hint, textAlign:'right', flexShrink:0 }}>{ri===0?'6':'7'}</div>
              {/* Spacer to align with column 3 */}
              <div style={{ width: 2*(40+2)+2, flexShrink:0 }} />
              {row.slice(2).map((el, ci) => {
                if (!el) return <div key={ci} style={{ width:40, height:48, flexShrink:0 }} />
                return (
                  <div key={ci} style={{ opacity: matches(el) ? 1 : 0.13, transition:'opacity .18s' }}>
                    <ElementCell el={el} isSelected={selected?.n === el.n} onClick={setSelected} scale={scale} />
                  </div>
                )
              })}
            </div>
          ))}

          {/* Trend colour scale legend */}
          {scale && (
            <div style={{ marginTop:12, marginLeft:22, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:10, color:C.muted }}>{scale.label}{scale.unit ? ` (${scale.unit})` : ''} :</span>
              <div style={{ width:100, height:8, borderRadius:4,
                            background:`linear-gradient(to right, rgba(${scale.rgb.join(',')},0.12), ${scale.color})` }} />
              <span style={{ fontSize:10, color:C.muted }}>Low → High</span>
            </div>
          )}

          {/* State dot legend */}
          <div style={{ marginTop:8, marginLeft:22, display:'flex', gap:10 }}>
            {Object.entries(STATE_DOT).map(([k, col]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:col }} />
                <span style={{ fontSize:9, color:C.hint }}>{STATE_LABEL[k]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div style={{
          width:400, flexShrink:0, borderLeft:`0.5px solid ${C.border}`,
          background:C.surface, overflowY:'auto', maxHeight:'calc(100vh - 80px)',
        }}>
          <InfoPanel element={selected} C={C} />
        </div>
      </div>
    </div>
  )
}
