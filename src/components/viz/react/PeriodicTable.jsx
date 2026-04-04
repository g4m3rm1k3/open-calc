// PeriodicTable.jsx
// Full interactive periodic table with 3D atom viewer and info panel.
// Uses Three.js (r128) for the atom visualization.

import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { ELEMENTS, CATEGORY_COLORS, GRID_POSITIONS, ATOM_COLORS, VDW_RADII } from './chemistry_data'

// ── Colors hook ───────────────────────────────────────────────────────────────
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
    blue:    dark ? '#38bdf8' : '#0284c7',
    amber:   dark ? '#fbbf24' : '#d97706',
    green:   dark ? '#4ade80' : '#16a34a',
  }
}

// ── Element lookup map ────────────────────────────────────────────────────────
const ELEMENT_MAP = {}
ELEMENTS.forEach(el => { ELEMENT_MAP[el.symbol] = el })
const ELEMENT_BY_N = {}
ELEMENTS.forEach(el => { ELEMENT_BY_N[el.n] = el })

// ── 3D Atom Viewer ────────────────────────────────────────────────────────────
function AtomViewer({ element, C }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const animRef  = useRef(null)
  const electronsRef = useRef([])

  useEffect(() => {
    if (!mountRef.current || !element) return
    const el = mountRef.current
    const W = el.offsetWidth || 340
    const canvasH = 300

    // Scene setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, canvasH)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / canvasH, 0.1, 1000)
    camera.position.set(0, 0, 8)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)
    const point1 = new THREE.PointLight(0xffffff, 0.8)
    point1.position.set(5, 5, 5)
    scene.add(point1)
    const point2 = new THREE.PointLight(0x4488ff, 0.4)
    point2.position.set(-5, -3, -5)
    scene.add(point2)

    // Nucleus
    const catColor = CATEGORY_COLORS[element.cat] || CATEGORY_COLORS.unknown
    const nucleusColor = parseInt(catColor.border.replace('#',''), 16)
    const protonColor  = 0xef4444
    const neutronColor = 0x94a3b8
    const protons  = element.n
    const neutrons = Math.round(element.mass - element.n)

    // Build nucleus as a cluster of protons + neutrons
    const nucleonGeo = new THREE.SphereGeometry(0.18, 10, 10)
    const nucleonCount = Math.min(protons + neutrons, 60) // cap for performance
    const nucleonRadius = 0.12 * Math.cbrt(nucleonCount) + 0.2

    for (let i = 0; i < Math.min(nucleonCount, 60); i++) {
      const isProton = i < protons
      const mat = new THREE.MeshPhongMaterial({
        color: isProton ? protonColor : neutronColor,
        shininess: 60,
      })
      const sphere = new THREE.Mesh(nucleonGeo, mat)
      // Fibonacci sphere packing for nucleus positions
      const phi = Math.acos(1 - 2*(i+0.5)/nucleonCount)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const r = nucleonRadius * Math.cbrt(i / nucleonCount + 0.1)
      sphere.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
      scene.add(sphere)
    }

    // Nucleus glow
    const glowGeo = new THREE.SphereGeometry(nucleonRadius + 0.15, 20, 20)
    const glowMat = new THREE.MeshBasicMaterial({
      color: nucleusColor,
      transparent: true,
      opacity: 0.08,
    })
    scene.add(new THREE.Mesh(glowGeo, glowMat))

    // Electron shells
    const shells = element.shells || []
    const shellRadii = shells.map((_, i) => 1.4 + i * 1.0)
    const electronObjs = []

    shells.forEach((count, shellIdx) => {
      const radius = shellRadii[shellIdx]

      // Orbit ring
      const ringGeo = new THREE.TorusGeometry(radius, 0.012, 8, 80)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.5,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      // Tilt each shell slightly for 3D look
      ring.rotation.x = (Math.PI / 2) + shellIdx * 0.35
      ring.rotation.y = shellIdx * 0.5
      scene.add(ring)

      // Electrons on this shell
      const electronGeo = new THREE.SphereGeometry(0.09, 8, 8)
      const electronMat = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.6,
        shininess: 100,
      })

      for (let e = 0; e < count; e++) {
        const electron = new THREE.Mesh(electronGeo, electronMat)
        const phase = (e / count) * Math.PI * 2
        const obj = {
          mesh: electron,
          shellIdx,
          radius,
          phase,
          speed: 0.4 / (shellIdx + 1), // outer shells move slower
          tiltX: (Math.PI / 2) + shellIdx * 0.35,
          tiltY: shellIdx * 0.5,
        }
        electronObjs.push(obj)
        scene.add(electron)
      }
    })

    electronsRef.current = electronObjs

    // Mouse orbit control
    let isDragging = false
    let prevMouse = { x: 0, y: 0 }
    let rotX = 0.3, rotY = 0.2

    const onDown = e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY } }
    const onUp   = () => { isDragging = false }
    const onMove = e => {
      if (!isDragging) return
      rotY += (e.clientX - prevMouse.x) * 0.01
      rotX += (e.clientY - prevMouse.y) * 0.01
      prevMouse = { x: e.clientX, y: e.clientY }
    }

    renderer.domElement.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)

    // Animation loop
    let t = 0
    const animate = () => {
      animRef.current = requestAnimationFrame(animate)
      t += 0.016

      // Auto-rotate if not dragging
      if (!isDragging) rotY += 0.004

      // Rotate scene
      scene.rotation.y = rotY
      scene.rotation.x = rotX * 0.3

      // Animate electrons along their shell orbits
      electronsRef.current.forEach(obj => {
        const angle = obj.phase + t * obj.speed
        // Position on tilted orbit
        const x = obj.radius * Math.cos(angle)
        const y = obj.radius * Math.sin(angle)
        // Apply shell tilt
        const cosX = Math.cos(obj.tiltX), sinX = Math.sin(obj.tiltX)
        const cosY = Math.cos(obj.tiltY), sinY = Math.sin(obj.tiltY)
        const x2 = x * cosY - 0 * sinY
        const z2 = x * sinY + 0 * cosY
        const y2 = y * cosX - z2 * sinX
        const z3 = y * sinX + z2 * cosX
        obj.mesh.position.set(x2, y2, z3)
      })

      renderer.render(scene, camera)
    }
    animate()
    sceneRef.current = { renderer, scene, camera }

    return () => {
      cancelAnimationFrame(animRef.current)
      renderer.domElement.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [element])

  return (
    <div
      ref={mountRef}
      style={{ width:'100%', height:300, cursor:'grab', borderRadius:10,
               background:'radial-gradient(ellipse at 50% 50%, #0a1a35 0%, #050a18 100%)' }}
    />
  )
}

// ── Element cell in the table ─────────────────────────────────────────────────
function ElementCell({ el, isSelected, onClick }) {
  if (!el) return <div style={{ width:36, height:40 }} />
  const cat = CATEGORY_COLORS[el.cat] || CATEGORY_COLORS.unknown
  return (
    <div
      onClick={() => onClick(el)}
      title={`${el.name} (${el.n})`}
      style={{
        width: 36, height: 40, borderRadius: 5,
        border: `1px solid ${isSelected ? '#fbbf24' : cat.border}`,
        background: isSelected ? 'rgba(251,191,36,0.25)' : cat.bg,
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1,
        transition: 'all .15s ease',
        transform: isSelected ? 'scale(1.12)' : 'scale(1)',
        boxShadow: isSelected ? `0 0 10px rgba(251,191,36,0.5)` : 'none',
      }}
    >
      <div style={{ fontSize: 8, color: cat.text, opacity: 0.7 }}>{el.n}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: cat.text, fontFamily: 'monospace' }}>{el.symbol}</div>
    </div>
  )
}

// ── Info panel ────────────────────────────────────────────────────────────────
function InfoPanel({ element, C }) {
  if (!element) return (
    <div style={{ padding: 24, textAlign: 'center', color: C.hint, fontSize: 13 }}>
      Click any element to explore it
    </div>
  )
  const cat = CATEGORY_COLORS[element.cat] || CATEGORY_COLORS.unknown
  const fmt = v => v != null ? v : '—'

  const rows = [
    ['Atomic number', element.n],
    ['Atomic mass', `${element.mass} u`],
    ['Electron config', element.config],
    ['Electronegativity', fmt(element.eneg)],
    ['Atomic radius', element.radius ? `${element.radius} pm` : '—'],
    ['Melting point', element.melt ? `${element.melt} K (${(element.melt-273.15).toFixed(1)}°C)` : '—'],
    ['Boiling point', element.boil ? `${element.boil} K (${(element.boil-273.15).toFixed(1)}°C)` : '—'],
    ['Density', element.density ? `${element.density} g/cm³` : '—'],
    ['Discovered by', fmt(element.discovered)],
    ['Year', fmt(element.year)],
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {/* Header */}
      <div style={{
        background: cat.bg, borderBottom: `1px solid ${cat.border}`,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 10,
          border: `2px solid ${cat.border}`, background: 'rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 10, color: cat.text, opacity: 0.7 }}>{element.n}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: cat.text, fontFamily: 'monospace', lineHeight: 1 }}>{element.symbol}</div>
          <div style={{ fontSize: 9, color: cat.text, opacity: 0.8 }}>{element.mass}</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: cat.text }}>{element.name}</div>
          <div style={{ fontSize: 11, color: cat.text, opacity: 0.7, marginTop: 2 }}>
            {element.cat.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())} · Period {element.period}
          </div>
          <div style={{ fontSize: 11, color: cat.text, opacity: 0.7 }}>Shells: [{element.shells?.join(', ')}]</div>
        </div>
      </div>

      {/* 3D Atom viewer */}
      <div style={{ padding: '12px 18px', background: C.surface2 }}>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Bohr Model · Drag to rotate
        </div>
        <AtomViewer element={element} C={C} />
      </div>

      {/* Properties table */}
      <div style={{ padding: '12px 18px' }}>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>Properties</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
          {rows.map(([label, val]) => (
            <div key={label} style={{ padding: '5px 0', borderBottom: `0.5px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.hint }}>{label}</div>
              <div style={{ fontSize: 12, color: C.text, fontFamily: 'monospace' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Uses */}
      <div style={{ padding: '0 18px 12px' }}>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 6, letterSpacing: '.08em', textTransform: 'uppercase' }}>Uses</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{element.uses}</div>
      </div>

      {/* Fun fact */}
      <div style={{ margin: '0 18px 16px', padding: '10px 14px', background: cat.bg, borderLeft: `3px solid ${cat.border}`, borderRadius: '0 8px 8px 0' }}>
        <div style={{ fontSize: 11, color: cat.text, opacity: 0.7, fontWeight: 600, marginBottom: 4 }}>⚡ Fun fact</div>
        <div style={{ fontSize: 12, color: cat.text, lineHeight: 1.6 }}>{element.fact}</div>
      </div>
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ C }) {
  const cats = [
    ['alkali-metal',    'Alkali Metal'],
    ['alkaline-earth',  'Alkaline Earth'],
    ['transition-metal','Transition Metal'],
    ['post-transition', 'Post-Transition'],
    ['metalloid',       'Metalloid'],
    ['nonmetal',        'Nonmetal'],
    ['halogen',         'Halogen'],
    ['noble-gas',       'Noble Gas'],
    ['lanthanide',      'Lanthanide'],
    ['actinide',        'Actinide'],
  ]
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 0' }}>
      {cats.map(([key, label]) => {
        const c = CATEGORY_COLORS[key]
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c.bg, border: `1px solid ${c.border}` }} />
            <span style={{ fontSize: 10, color: C.muted }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Periodic Table component ─────────────────────────────────────────────
export default function PeriodicTable({ params = {} }) {
  const C = useColors()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState(null)

  // Build grid: 9 rows × 18 cols (rows 8,9 = lanthanides/actinides)
  const grid = Array.from({ length: 9 }, () => Array(18).fill(null))
  ELEMENTS.forEach(el => {
    const pos = GRID_POSITIONS[el.n]
    if (pos) {
      const [r, c] = pos
      grid[r-1][c-1] = el
    }
  })

  const matches = el => {
    if (!el) return false
    if (filterCat && el.cat !== filterCat) return false
    if (!search) return true
    const q = search.toLowerCase()
    return el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.n).includes(q)
  }

  return (
    <div style={{ width:'100%', fontFamily:'sans-serif', background: C.bg, minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:18, fontWeight:600, color:C.text }}>Periodic Table</div>
          <div style={{ fontSize:12, color:C.muted }}>118 elements · Click to explore</div>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search elements..."
          style={{ flex:1, minWidth:160, maxWidth:260, padding:'7px 12px', borderRadius:8,
            border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}
        />
        <Legend C={C} />
      </div>

      <div style={{ display:'flex', gap:0 }}>
        {/* Table area */}
        <div style={{ flex:1, padding:'16px 12px', overflowX:'auto' }}>
          {/* Main grid rows 1-7 */}
          <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:8 }}>
            {grid.slice(0,7).map((row, ri) => (
              <div key={ri} style={{ display:'flex', gap:2, alignItems:'center' }}>
                <div style={{ width:16, fontSize:9, color:C.hint, textAlign:'right', flexShrink:0 }}>{ri+1}</div>
                {row.map((el, ci) => (
                  <div key={ci} style={{ opacity: matches(el) ? 1 : 0.2, transition:'opacity .2s' }}>
                    <ElementCell el={el} isSelected={selected?.n === el?.n} onClick={setSelected} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Gap + Lanthanide/Actinide label */}
          <div style={{ height:12, borderTop:`1px dashed ${C.border}`, marginBottom:6 }} />
          <div style={{ fontSize:10, color:C.hint, marginBottom:4, paddingLeft:20 }}>Lanthanides (row 6) / Actinides (row 7)</div>

          {/* Rows 8-9 (lanthanides / actinides) */}
          {grid.slice(7).map((row, ri) => (
            <div key={ri} style={{ display:'flex', gap:2, marginBottom:2, alignItems:'center' }}>
              <div style={{ width:16, fontSize:9, color:C.hint, textAlign:'right', flexShrink:0 }}>{ri===0?'6':'7'}</div>
              {row.slice(2).map((el, ci) => (
                <div key={ci} style={{ opacity: matches(el) ? 1 : 0.2, transition:'opacity .2s' }}>
                  <ElementCell el={el} isSelected={selected?.n === el?.n} onClick={setSelected} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Info panel */}
        <div style={{
          width: 380, flexShrink:0, borderLeft:`0.5px solid ${C.border}`,
          background: C.surface, overflowY:'auto', maxHeight:'calc(100vh - 80px)',
        }}>
          <InfoPanel element={selected} C={C} />
        </div>
      </div>
    </div>
  )
}
