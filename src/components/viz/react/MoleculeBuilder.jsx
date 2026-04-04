// MoleculeBuilder.jsx
// Molecule builder + 3D viewer + reaction playground.
// Three modes: Build (assemble molecules), View (3D molecular geometry), React (chemical reactions).

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MOLECULES, REACTIONS, BOND_TYPES, ATOM_COLORS, CATEGORY_COLORS } from './chemistry_data'

function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg:dark?'#0f172a':'#f8fafc', surface:dark?'#1e293b':'#ffffff',
    surface2:dark?'#0f172a':'#f1f5f9', border:dark?'#334155':'#e2e8f0',
    text:dark?'#e2e8f0':'#1e293b', muted:dark?'#94a3b8':'#64748b', hint:dark?'#475569':'#94a3b8',
    blue:dark?'#38bdf8':'#0284c7', blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',
    amber:dark?'#fbbf24':'#d97706', amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',
    green:dark?'#4ade80':'#16a34a', greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',
    red:dark?'#f87171':'#dc2626', redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',
    purple:dark?'#a78bfa':'#7c3aed', purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',
  }
}

// ── 3D Molecule Viewer ────────────────────────────────────────────────────────
function MoleculeViewer({ molecule, C }) {
  const mountRef = useRef(null)
  const animRef  = useRef(null)

  useEffect(() => {
    if (!mountRef.current || !molecule) return
    const el = mountRef.current
    const W = el.offsetWidth || 440
    const canvasH = 360

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, canvasH)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / canvasH, 0.1, 200)
    camera.position.set(0, 0, 7)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const key = new THREE.DirectionalLight(0xffffff, 0.8)
    key.position.set(5, 8, 5)
    scene.add(key)
    const fill = new THREE.PointLight(0x8888ff, 0.4)
    fill.position.set(-4, -2, 3)
    scene.add(fill)
    const back = new THREE.DirectionalLight(0xffa0a0, 0.3)
    back.position.set(-3, -5, -3)
    scene.add(back)

    const group = new THREE.Group()
    scene.add(group)

    // Scale factor: Angstroms to Three.js units
    const scale = 1.6

    // Draw atoms
    molecule.atoms.forEach((atom, i) => {
      const color = ATOM_COLORS[atom.symbol] || ATOM_COLORS.default
      const radius = ((ATOM_COLORS[atom.symbol] ? 0.35 : 0.28)) + (atom.symbol === 'H' ? 0 : 0.1)
      const geo = new THREE.SphereGeometry(radius, 24, 24)
      const mat = new THREE.MeshPhongMaterial({ color, shininess: 80 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(atom.x * scale, atom.y * scale, atom.z * scale)
      group.add(mesh)

      // Atom label
      // (Labels would need canvas texture; skipping for performance)
    })

    // Draw bonds
    molecule.bonds.forEach(([i, j, type]) => {
      const a = molecule.atoms[i]
      const b = molecule.atoms[j]
      const bInfo = BOND_TYPES[type] || BOND_TYPES.single
      const color = parseInt(bInfo.color.replace('#',''), 16)
      const width = bInfo.width

      const start = new THREE.Vector3(a.x * scale, a.y * scale, a.z * scale)
      const end   = new THREE.Vector3(b.x * scale, b.y * scale, b.z * scale)
      const dir   = end.clone().sub(start)
      const len   = dir.length()
      const mid   = start.clone().add(end).multiplyScalar(0.5)

      const drawBondCylinder = (offset = 0, bondWidth = width) => {
        const geo = new THREE.CylinderGeometry(bondWidth, bondWidth, len, 12)
        const mat = new THREE.MeshPhongMaterial({ color, shininess: 60 })
        const cyl = new THREE.Mesh(geo, mat)
        cyl.position.copy(mid)
        if (offset !== 0) {
          const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(offset)
          cyl.position.add(perp)
        }
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize())
        group.add(cyl)
      }

      if (type === 'single' || type === 'ionic') {
        drawBondCylinder(0, width)
      } else if (type === 'double') {
        drawBondCylinder(-0.12, width * 0.8)
        drawBondCylinder( 0.12, width * 0.8)
      } else if (type === 'triple') {
        drawBondCylinder(0, width * 0.7)
        drawBondCylinder(-0.16, width * 0.6)
        drawBondCylinder( 0.16, width * 0.6)
      } else if (type === 'aromatic') {
        // Solid bond + dashed inner
        drawBondCylinder(0, width)
      }
    })

    // For ionic bonds, add + / - charge indicators
    if (molecule.bondType === 'ionic') {
      // Visual charge cloud around each atom
      molecule.atoms.forEach((atom, i) => {
        const isAnion = ['Cl','F','O','N','S'].includes(atom.symbol)
        const cloudGeo = new THREE.SphereGeometry(0.6, 16, 16)
        const cloudMat = new THREE.MeshBasicMaterial({
          color: isAnion ? 0x3b82f6 : 0xef4444,
          transparent: true, opacity: 0.08,
        })
        const cloud = new THREE.Mesh(cloudGeo, cloudMat)
        cloud.position.set(atom.x * scale, atom.y * scale, atom.z * scale)
        group.add(cloud)
      })
    }

    // Mouse drag orbit
    let dragging = false, prevX = 0, prevY = 0
    let rotX = 0.3, rotY = 0.2

    const onDown = e => { dragging = true; prevX = e.clientX; prevY = e.clientY }
    const onUp   = () => { dragging = false }
    const onMove = e => {
      if (!dragging) return
      rotY += (e.clientX - prevX) * 0.012
      rotX += (e.clientY - prevY) * 0.012
      prevX = e.clientX; prevY = e.clientY
    }

    // Touch support
    const onTouch = e => {
      if (e.touches.length === 1) {
        const t = e.touches[0]
        if (!dragging) { dragging = true; prevX = t.clientX; prevY = t.clientY; return }
        rotY += (t.clientX - prevX) * 0.012
        rotX += (t.clientY - prevY) * 0.012
        prevX = t.clientX; prevY = t.clientY
      }
    }
    const onTouchEnd = () => { dragging = false }

    renderer.domElement.addEventListener('mousedown', onDown)
    renderer.domElement.addEventListener('touchstart', onTouch)
    renderer.domElement.addEventListener('touchmove', onTouch)
    renderer.domElement.addEventListener('touchend', onTouchEnd)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)

    const animate = () => {
      animRef.current = requestAnimationFrame(animate)
      if (!dragging) rotY += 0.005
      group.rotation.y = rotY
      group.rotation.x = rotX * 0.4
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      renderer.domElement.removeEventListener('mousedown', onDown)
      renderer.domElement.removeEventListener('touchstart', onTouch)
      renderer.domElement.removeEventListener('touchmove', onTouch)
      renderer.domElement.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [molecule])

  return (
    <div
      ref={mountRef}
      style={{ width:'100%', height:360, borderRadius:12, cursor:'grab',
               background:'radial-gradient(ellipse at 40% 40%, #0d1f40 0%, #05080f 100%)' }}
    />
  )
}

// ── Molecule Card ─────────────────────────────────────────────────────────────
function MoleculeCard({ mol, isSelected, onClick }) {
  const bondInfo = BOND_TYPES[mol.bondType] || BOND_TYPES.single
  return (
    <div
      onClick={() => onClick(mol)}
      style={{
        padding:'10px 14px', borderRadius:10, cursor:'pointer',
        border:`1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
        background: isSelected ? 'rgba(56,189,248,0.1)' : 'transparent',
        transition:'all .15s',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <span style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', fontFamily:'monospace' }}>
            {mol.formula}
          </span>
          <span style={{ fontSize:11, color:'#64748b', marginLeft:8 }}>{mol.name}</span>
        </div>
        <span style={{
          fontSize:10, padding:'2px 7px', borderRadius:4,
          background:'rgba(255,255,255,0.05)', color: bondInfo.color, fontWeight:600,
        }}>
          {mol.geometry}
        </span>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
        <span style={{ fontSize:10, color:'#475569' }}>{mol.molarMass} g/mol</span>
        <span style={{ fontSize:10, color:'#475569' }}>·</span>
        <span style={{ fontSize:10, color: mol.polarity === 'polar' ? '#38bdf8' : mol.polarity === 'ionic' ? '#fb923c' : '#94a3b8' }}>
          {mol.polarity}
        </span>
        <span style={{ fontSize:10, color:'#475569' }}>·</span>
        <span style={{ fontSize:10, color:'#94a3b8' }}>{mol.state}</span>
      </div>
    </div>
  )
}

// ── Molecule Info Panel ───────────────────────────────────────────────────────
function MoleculeInfo({ mol, C }) {
  if (!mol) return null
  const bondInfo = BOND_TYPES[mol.bondType] || BOND_TYPES.single

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {/* Formula header */}
      <div style={{ padding:'14px 18px', borderBottom:`0.5px solid ${C.border}`, background:C.surface2 }}>
        <div style={{ fontSize:28, fontWeight:700, color:C.text, fontFamily:'monospace' }}>{mol.formula}</div>
        <div style={{ fontSize:15, color:C.muted }}>{mol.name}</div>
      </div>

      {/* 3D viewer */}
      <div style={{ padding:'12px 18px' }}>
        <div style={{ fontSize:11, color:C.hint, marginBottom:8, letterSpacing:'.08em', textTransform:'uppercase' }}>
          3D Structure · Drag to rotate
        </div>
        <MoleculeViewer molecule={mol} C={C} />
      </div>

      {/* Bond type */}
      <div style={{ padding:'0 18px 12px' }}>
        <div style={{ fontSize:11, color:C.hint, marginBottom:6, letterSpacing:'.08em', textTransform:'uppercase' }}>Bond Type</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:4, borderRadius:2, background:bondInfo.color }} />
          <span style={{ fontSize:13, color:C.text, fontWeight:500 }}>{bondInfo.label}</span>
        </div>
        <div style={{ fontSize:12, color:C.muted, marginTop:6, lineHeight:1.65 }}>{bondInfo.description}</div>
      </div>

      {/* Properties grid */}
      <div style={{ padding:'0 18px 12px' }}>
        <div style={{ fontSize:11, color:C.hint, marginBottom:8, letterSpacing:'.08em', textTransform:'uppercase' }}>Properties</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px' }}>
          {[
            ['Geometry',      mol.geometry],
            ['Polarity',      mol.polarity],
            ['Hybridization', mol.hybridization || '—'],
            ['Bond angle',    mol.bondAngle ? `${mol.bondAngle}°` : '—'],
            ['Molar mass',    `${mol.molarMass} g/mol`],
            ['State (25°C)',  mol.state],
          ].map(([label, val]) => (
            <div key={label} style={{ padding:'5px 0', borderBottom:`0.5px solid ${C.border}` }}>
              <div style={{ fontSize:10, color:C.hint }}>{label}</div>
              <div style={{ fontSize:12, color:C.text, fontFamily:'monospace' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ padding:'0 18px 12px' }}>
        <div style={{ fontSize:11, color:C.hint, marginBottom:6, letterSpacing:'.08em', textTransform:'uppercase' }}>About</div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.7 }}>{mol.description}</div>
      </div>

      {/* Fun fact */}
      <div style={{ margin:'0 18px 16px', padding:'10px 14px', background:C.blueBg, borderLeft:`3px solid ${C.blue}`, borderRadius:'0 8px 8px 0' }}>
        <div style={{ fontSize:11, color:C.blue, fontWeight:600, marginBottom:4 }}>⚡ Fun fact</div>
        <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{mol.funFact}</div>
      </div>
    </div>
  )
}

// ── Reaction Viewer ───────────────────────────────────────────────────────────
function ReactionPanel({ reaction, C }) {
  const [step, setStep] = useState(0)  // 0=reactants, 1=transition, 2=products
  const STEPS = ['Reactants', 'Bond Changes', 'Products']

  if (!reaction) return (
    <div style={{ padding:24, textAlign:'center', color:C.hint, fontSize:13 }}>
      Select a reaction to explore
    </div>
  )

  const isExo = reaction.deltaH < 0

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {/* Header */}
      <div style={{ padding:'14px 18px', borderBottom:`0.5px solid ${C.border}`, background:C.surface2 }}>
        <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{reaction.name}</div>
        <div style={{ fontSize:11, color:C.hint, marginTop:2 }}>{reaction.type.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</div>
      </div>

      {/* Equation */}
      <div style={{ padding:'14px 18px', background:C.surface }}>
        <div style={{ fontSize:16, fontFamily:'monospace', color:C.text, lineHeight:2 }}>
          {reaction.equation}
        </div>
        <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:8,
          padding:'6px 12px', borderRadius:8,
          background: isExo ? C.redBg : C.blueBg,
          border:`1px solid ${isExo ? C.red : C.blue}` }}>
          <span style={{ fontSize:12, color: isExo ? C.red : C.blue, fontWeight:500 }}>
            ΔH = {reaction.deltaH} kJ/mol
          </span>
          <span style={{ fontSize:11, color: isExo ? C.red : C.blue }}>
            {isExo ? '🔥 Exothermic — releases heat' : '❄️ Endothermic — absorbs energy'}
          </span>
        </div>
      </div>

      {/* Step navigator */}
      <div style={{ padding:'10px 18px', borderTop:`0.5px solid ${C.border}`, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ display:'flex', gap:6 }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              style={{ flex:1, padding:'7px 8px', borderRadius:8, cursor:'pointer', fontSize:12,
                border:`1px solid ${step===i ? C.blue : C.border}`,
                background: step===i ? C.blueBg : 'transparent',
                color: step===i ? C.blue : C.muted, fontWeight: step===i ? 600 : 400 }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ padding:'14px 18px' }}>
        {step === 0 && (
          <div>
            <div style={{ fontSize:11, color:C.hint, marginBottom:10, textTransform:'uppercase', letterSpacing:'.08em' }}>Reactants</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {reaction.reactants.map((id, i) => {
                const mol = MOLECULES.find(m => m.id === id)
                return mol ? (
                  <div key={i} style={{ padding:'8px 14px', borderRadius:8,
                    border:`1px solid ${C.border}`, background:C.surface2, textAlign:'center' }}>
                    <div style={{ fontSize:20, fontFamily:'monospace', color:C.text, fontWeight:700 }}>{mol.formula}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{mol.name}</div>
                  </div>
                ) : (
                  <div key={i} style={{ padding:'8px 14px', borderRadius:8,
                    border:`1px solid ${C.border}`, background:C.surface2 }}>
                    <div style={{ fontSize:13, color:C.hint }}>{id}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontSize:11, color:C.hint, marginBottom:10, textTransform:'uppercase', letterSpacing:'.08em' }}>Bond Changes</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ padding:'10px 14px', borderRadius:8, background:C.redBg, border:`1px solid ${C.red}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.red, marginBottom:8 }}>🔓 Bonds Breaking (energy input)</div>
                {reaction.bondBreaking.map((b, i) => (
                  <div key={i} style={{ fontSize:12, color:C.red, lineHeight:1.8 }}>· {b}</div>
                ))}
              </div>
              <div style={{ padding:'10px 14px', borderRadius:8, background:C.greenBg, border:`1px solid ${C.green}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.green, marginBottom:8 }}>🔒 Bonds Forming (energy released)</div>
                {reaction.bondForming.map((b, i) => (
                  <div key={i} style={{ fontSize:12, color:C.green, lineHeight:1.8 }}>· {b}</div>
                ))}
              </div>
              <div style={{ padding:'10px 14px', borderRadius:8, background:isExo ? C.redBg : C.blueBg,
                border:`1px solid ${isExo ? C.red : C.blue}` }}>
                <div style={{ fontSize:12, color: isExo ? C.red : C.blue }}>{reaction.energyNote}</div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize:11, color:C.hint, marginBottom:10, textTransform:'uppercase', letterSpacing:'.08em' }}>Products</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {reaction.products.map((id, i) => {
                const mol = MOLECULES.find(m => m.id === id)
                return mol ? (
                  <div key={i} style={{ padding:'8px 14px', borderRadius:8,
                    border:`1px solid ${C.green}`, background:C.greenBg, textAlign:'center' }}>
                    <div style={{ fontSize:20, fontFamily:'monospace', color:C.green, fontWeight:700 }}>{mol.formula}</div>
                    <div style={{ fontSize:10, color:C.green }}>{mol.name}</div>
                  </div>
                ) : (
                  <div key={i} style={{ padding:'8px 14px', borderRadius:8,
                    border:`1px solid ${C.border}`, background:C.surface2 }}>
                    <div style={{ fontSize:13, color:C.hint }}>{id}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop:14, fontSize:12, color:C.muted, lineHeight:1.7 }}>{reaction.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MoleculeBuilder({ params = {} }) {
  const C = useColors()
  const [mode, setMode] = useState('molecules')   // 'molecules' | 'reactions'
  const [selectedMol, setSelectedMol] = useState(MOLECULES[0])
  const [selectedRxn, setSelectedRxn] = useState(null)

  const TABS = [
    { key:'molecules', label:'🔬 Molecules' },
    { key:'reactions', label:'⚗️ Reactions' },
  ]

  return (
    <div style={{ width:'100%', fontFamily:'sans-serif', background:C.bg, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ padding:'14px 20px', borderBottom:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', gap:16 }}>
        <div>
          <div style={{ fontSize:17, fontWeight:600, color:C.text }}>Chemistry Explorer</div>
          <div style={{ fontSize:12, color:C.muted }}>3D molecules, bonds, and reactions</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setMode(t.key)}
              style={{ padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13,
                border:`1px solid ${mode===t.key ? C.blue : C.border}`,
                background: mode===t.key ? C.blueBg : 'transparent',
                color: mode===t.key ? C.blue : C.muted, fontWeight: mode===t.key ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flex:1 }}>
        {/* List sidebar */}
        <div style={{ width:260, flexShrink:0, borderRight:`0.5px solid ${C.border}`,
          overflowY:'auto', padding:'12px 10px', display:'flex', flexDirection:'column', gap:4 }}>
          {mode === 'molecules' && MOLECULES.map(mol => (
            <MoleculeCard key={mol.id} mol={mol}
              isSelected={selectedMol?.id === mol.id}
              onClick={setSelectedMol} />
          ))}
          {mode === 'reactions' && REACTIONS.map(rxn => (
            <div key={rxn.id}
              onClick={() => setSelectedRxn(rxn)}
              style={{ padding:'10px 14px', borderRadius:10, cursor:'pointer',
                border:`1px solid ${selectedRxn?.id === rxn.id ? C.amber : C.border}`,
                background: selectedRxn?.id === rxn.id ? C.amberBg : 'transparent',
                transition:'all .15s' }}>
              <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{rxn.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:3, fontFamily:'monospace' }}>{rxn.equation}</div>
              <div style={{ fontSize:10, color: rxn.deltaH < 0 ? C.red : C.blue, marginTop:4 }}>
                ΔH = {rxn.deltaH} kJ/mol
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ flex:1, overflowY:'auto', background:C.surface }}>
          {mode === 'molecules' && <MoleculeInfo mol={selectedMol} C={C} />}
          {mode === 'reactions' && <ReactionPanel reaction={selectedRxn} C={C} />}
        </div>
      </div>
    </div>
  )
}
