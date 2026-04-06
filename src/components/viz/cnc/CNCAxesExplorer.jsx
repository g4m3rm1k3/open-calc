/**
 * CNCAxesExplorer
 *
 * Reusable 3D interactive machine-axes explorer.
 * Click any axis arrow or selector button to highlight it and show a full
 * info panel.  Rotary axes (A/B/C) animate the right-hand rule curl so the
 * student sees — not just reads — which direction is "positive".
 *
 * Props:
 *   height       number  canvas height in px (default 480)
 *   showRotary   bool    show A/B/C axes (default true)
 *   initialAxis  string  axis selected on mount — 'X'|'Y'|'Z'|'A'|'B'|'C'|null
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ─── Axis definitions ─────────────────────────────────────────────────────────
// curlPath(t, r) → [x, y, z]  —  right-hand rule orbit, t ∈ [0, 2π]
// Verified: each path starts on the "from" axis and moves toward "to" axis in
// the positive rotation sense (standard rotation matrix derivation).
const AXES = {
  X: {
    color: '#f87171',        // red
    dimColor: '#7f1d1d',
    dir: new THREE.Vector3(1, 0, 0),
    type: 'linear',
    rotaryPair: 'A',
    badge: 'LINEAR',
    title: 'X Axis — Left / Right',
    positive: '+X moves the tool to the right relative to the part.',
    machine:
      'On a VMC the X servo drives the table left and right. ' +
      'In G-code you always program the tool position — so X50. means ' +
      '"tool tip is 50 mm to the right of work zero", whether the table moves or the spindle does.',
    gcode: 'X_ word in G00 G01 G02 G03 G81 etc.',
    application:
      'Every horizontal profiling pass. X travel defines the working width of the machine.',
    dro: 'X axis on DRO — first coordinate in the position register.',
  },
  Y: {
    color: '#4ade80',        // green
    dimColor: '#14532d',
    dir: new THREE.Vector3(0, 1, 0),
    type: 'linear',
    rotaryPair: 'B',
    badge: 'LINEAR',
    title: 'Y Axis — Front / Back',
    positive: '+Y moves the tool away from the operator (into the machine).',
    machine:
      'On a VMC the Y servo drives the table in/out (toward and away from the operator). ' +
      'Positive Y is away from you — the back of the machine. ' +
      'G00 Y100 moves the table toward you so the tool is 100 mm further in +Y.',
    gcode: 'Y_ word in motion blocks.',
    application:
      'Side-to-side passes in a pocket, contour Y-depth steps, and diagonal moves in XY.',
    dro: 'Y axis — second coordinate.',
  },
  Z: {
    color: '#38bdf8',        // sky blue
    dimColor: '#0c4a6e',
    dir: new THREE.Vector3(0, 0, 1),
    type: 'linear',
    rotaryPair: 'C',
    badge: 'LINEAR',
    title: 'Z Axis — Spindle Axis (Up / Down)',
    positive: '+Z retracts (safe — away from part). −Z plunges into the part.',
    machine:
      'Always the spindle axis. On a VMC the Z servo raises and lowers the spindle head. ' +
      'Positive Z is the safety direction: if in doubt, command positive Z. ' +
      'G91 G28 Z0 — the most important safety move in any CNC program — retracts Z to machine home.',
    gcode: 'Z_ word in motion blocks. Also implicitly affected by G43 (TLO) and G28 (home).',
    application:
      'Depth control on every operation: plunge depth, R-plane clearance, tool length offset.',
    dro: 'Z axis — third coordinate. Always watch Z before pressing cycle start.',
  },
  A: {
    color: '#fb923c',        // orange
    dimColor: '#7c2d12',
    dir: new THREE.Vector3(1, 0, 0),  // same as X — it ROTATES AROUND X
    type: 'rotary',
    linearPair: 'X',
    badge: 'ROTARY',
    title: 'A Axis — Rotates Around X',
    positive: 'Right-hand rule: thumb in +X direction → fingers curl +Y toward +Z.',
    curlFrom: '+Y',
    curlTo: '+Z',
    curlPlane: 'Y–Z plane',
    curlPath: (t, r) => [0, r * Math.cos(t), r * Math.sin(t)],
    machine:
      'Tilts the workpiece in the Y–Z plane. A0 = flat (table horizontal). ' +
      'A90 = workpiece vertical — the spindle can now machine a side face without repositioning. ' +
      'Most common on 4th-axis rotary table setups.',
    gcode: 'A_ word in G00/G01 (degrees). Must be unlocked with M10/M11 on many controls.',
    application:
      'Indexing to machine multiple faces in one setup. 4th-axis wrapping toolpaths. ' +
      'Helical slots on round parts.',
    dro: 'A axis displayed in degrees. A180 = part flipped 180° around X.',
  },
  B: {
    color: '#a3e635',        // lime
    dimColor: '#365314',
    dir: new THREE.Vector3(0, 1, 0),  // rotates around Y
    type: 'rotary',
    linearPair: 'Y',
    badge: 'ROTARY',
    title: 'B Axis — Rotates Around Y',
    positive: 'Right-hand rule: thumb in +Y direction → fingers curl +Z toward +X.',
    curlFrom: '+Z',
    curlTo: '+X',
    curlPlane: 'X–Z plane',
    curlPath: (t, r) => [r * Math.sin(t), 0, r * Math.cos(t)],
    machine:
      'Tilts in the X–Z plane. Found on universal milling heads (the head nods forward), ' +
      '5-axis gantry machines, and horizontal boring mills. ' +
      'B90 tilts the spindle horizontal — useful for machining faces parallel to the Z-axis.',
    gcode: 'B_ word (degrees).',
    application:
      '5-axis surface machining. Tilted-spindle drilling (angled holes without a sine plate). ' +
      'Universal head orientation.',
    dro: 'B axis in degrees. Less common on standard 3-axis VMCs.',
  },
  C: {
    color: '#c084fc',        // purple
    dimColor: '#4c1d95',
    dir: new THREE.Vector3(0, 0, 1),  // rotates around Z
    type: 'rotary',
    linearPair: 'Z',
    badge: 'ROTARY',
    title: 'C Axis — Rotates Around Z',
    positive: 'Right-hand rule: thumb in +Z direction → fingers curl +X toward +Y.',
    curlFrom: '+X',
    curlTo: '+Y',
    curlPlane: 'X–Y plane',
    curlPath: (t, r) => [r * Math.cos(t), r * Math.sin(t), 0],
    machine:
      'Rotation in the horizontal (X–Y) plane. A rotary table gives C-axis motion. ' +
      'On a lathe: the main spindle IS the C-axis when in positioning mode. ' +
      'On mill-turn machines: the sub-spindle and live tooling use C for synchronized cutting.',
    gcode: 'C_ word (degrees). M19 uses C for spindle orientation before ATC.',
    application:
      'Rotary-table 4th-axis machining. Polar coordinate interpolation (G12.1/G13.1). ' +
      'Spindle positioning for tool change orientation.',
    dro: 'C axis — often shown in degrees 0–360 or continuously.',
  },
}

const AXIS_KEYS = ['X', 'Y', 'Z', 'A', 'B', 'C']
const LINEAR_KEYS = ['X', 'Y', 'Z']
const ROTARY_KEYS = ['A', 'B', 'C']

// ─── Arrow geometry helpers ───────────────────────────────────────────────────
function makeAxisArrow(dir, color, length = 1.8) {
  const group = new THREE.Group()
  const shaftLen = length * 0.82
  const headLen  = length * 0.18
  const shaftR   = 0.030
  const headR    = 0.075

  // Shaft
  const shaftGeo = new THREE.CylinderGeometry(shaftR, shaftR, shaftLen, 12)
  const mat = new THREE.MeshPhongMaterial({ color, shininess: 80 })
  const shaft = new THREE.Mesh(shaftGeo, mat)
  shaft.position.set(0, shaftLen / 2, 0)
  group.add(shaft)

  // Head (cone)
  const headGeo = new THREE.ConeGeometry(headR, headLen, 16)
  const head = new THREE.Mesh(headGeo, mat)
  head.position.set(0, shaftLen + headLen / 2, 0)
  group.add(head)

  // Rotate group to point in the given direction
  const up = new THREE.Vector3(0, 1, 0)
  const d  = dir.clone().normalize()
  const q  = new THREE.Quaternion().setFromUnitVectors(up, d)
  group.setRotationFromQuaternion(q)

  return group
}

// Build a TubeGeometry arc for the right-hand rule curl (270° of the circle)
function makeRotaryArc(curlPath, radius, color) {
  const N = 128
  const arcFrac = 0.75  // 270°
  const points = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2 * arcFrac
    const [x, y, z] = curlPath(t, radius)
    points.push(new THREE.Vector3(x, y, z))
  }
  const curve  = new THREE.CatmullRomCurve3(points)
  const tube   = new THREE.TubeGeometry(curve, N, 0.022, 8, false)
  const mat    = new THREE.MeshPhongMaterial({ color, shininess: 60, transparent: true, opacity: 0.9 })
  const mesh   = new THREE.Mesh(tube, mat)

  // Arrowhead cone at the end of the arc
  const endPt  = new THREE.Vector3(...curlPath(Math.PI * 2 * arcFrac, radius))
  const prePt  = new THREE.Vector3(...curlPath(Math.PI * 2 * arcFrac - 0.04, radius))
  const headDir = endPt.clone().sub(prePt).normalize()
  const headGeo = new THREE.ConeGeometry(0.06, 0.15, 14)
  const headMat = new THREE.MeshPhongMaterial({ color, shininess: 80 })
  const arrowHead = new THREE.Mesh(headGeo, headMat)
  arrowHead.position.copy(endPt)
  const upVec = new THREE.Vector3(0, 1, 0)
  arrowHead.setRotationFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors(upVec, headDir)
  )

  const group = new THREE.Group()
  group.add(mesh, arrowHead)
  return group
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CNCAxesExplorer({
  height = 480,
  showRotary = true,
  initialAxis = null,
}) {
  const mountRef = useRef(null)

  // Three.js refs
  const rendererRef  = useRef(null)
  const sceneRef     = useRef(null)
  const cameraRef    = useRef(null)
  const controlsRef  = useRef(null)
  const rafRef       = useRef(null)
  const arrowsRef    = useRef({})     // axisKey → THREE.Group
  const labelsRef    = useRef({})     // axisKey → DOM element
  const labelPosRef  = useRef({})     // axisKey → THREE.Vector3 (tip position in world)
  const targetsRef   = useRef({})     // axisKey → THREE.Mesh (invisible hit target)
  const rotaryRef    = useRef(null)   // { group, sphere } — rebuilt on axis change

  // React state
  const [isDark, setIsDark]         = useState(() => document.documentElement.classList.contains('dark'))
  const [selectedAxis, setSelectedAxis] = useState(initialAxis)
  const [mounted, setMounted]       = useState(false)

  const selectedAxisRef = useRef(selectedAxis)
  useEffect(() => { selectedAxisRef.current = selectedAxis }, [selectedAxis])

  // Dark/light theme tracking
  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // ── Bootstrap Three.js ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const W = el.clientWidth || 700
    const H = height

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(isDark ? 0x0f172a : 0xf1f5f9)
    el.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera  — Z is up (CNC convention)
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200)
    camera.up.set(0, 0, 1)
    camera.position.set(5.5, -4.2, 3.8)
    camera.lookAt(0, 0, 0.5)
    cameraRef.current = camera

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.target.set(0, 0, 0.5)
    controlsRef.current = controls

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const sun = new THREE.DirectionalLight(0xffffff, 0.9)
    sun.position.set(4, -3, 6)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0xffffff, 0.3)
    fill.position.set(-4, 4, 2)
    scene.add(fill)

    // ── Machine geometry ──────────────────────────────────────────────────────
    const machineMat = new THREE.MeshPhongMaterial({
      color: isDark ? 0x1e293b : 0xdde1e9,
      shininess: 30,
    })
    const partMat = new THREE.MeshPhongMaterial({
      color: isDark ? 0x475569 : 0xb0bec5,
      shininess: 60,
    })

    // Table — flat slab in XY plane, Z-up
    const tableMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 3.2, 0.12),
      machineMat
    )
    tableMesh.position.set(0, 0, -0.06)
    scene.add(tableMesh)

    // T-slot lines on table (thin planes)
    ;[[-0.8, 0], [0, 0], [0.8, 0]].forEach(([x]) => {
      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 3.0, 0.01),
        new THREE.MeshBasicMaterial({ color: isDark ? 0x334155 : 0x90a4ae })
      )
      slot.position.set(x, 0, 0.001)
      scene.add(slot)
    })

    // Workpiece — small block centered on table
    const partMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.35), partMat)
    partMesh.position.set(-0.1, 0.1, 0.175)
    scene.add(partMesh)

    // Column — left side, behind table
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 2.8), machineMat)
    col.position.set(-2.4, 0.4, 1.4)
    scene.add(col)

    // Cross-rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 0.2), machineMat)
    rail.position.set(-2.4, 0.4, 2.9)
    scene.add(rail)

    // Spindle head — small box
    const spindleHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.3), machineMat)
    spindleHead.position.set(-2.4, 0.4, 2.5)
    scene.add(spindleHead)

    // ── Origin marker ─────────────────────────────────────────────────────────
    const origin = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    origin.position.set(0, 0, 0)
    scene.add(origin)

    // ── Axis arrows + click targets ───────────────────────────────────────────
    const allKeys = showRotary ? AXIS_KEYS : LINEAR_KEYS
    allKeys.forEach(key => {
      const ax = AXES[key]
      const arrow = makeAxisArrow(ax.dir, ax.dimColor, 1.85)
      scene.add(arrow)
      arrowsRef.current[key] = arrow

      // Invisible sphere at arrow tip for raycasting (easier to click)
      const tipPos = ax.dir.clone().multiplyScalar(1.85)
      const target = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      )
      target.position.copy(tipPos)
      target.userData.axisKey = key
      scene.add(target)
      targetsRef.current[key] = target

      // Store label world position (tip + a bit further out)
      labelPosRef.current[key] = ax.dir.clone().multiplyScalar(2.1)
    })

    // ── Click handler ─────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const pointer   = new THREE.Vector2()
    const onPointerDown = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(Object.values(targetsRef.current))
      if (hits.length > 0) {
        const key = hits[0].object.userData.axisKey
        setSelectedAxis(prev => prev === key ? null : key)
      }
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    // ── Animation loop ────────────────────────────────────────────────────────
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      controls.update()

      // Animate rotary-arc sphere
      if (rotaryRef.current?.sphere) {
        const sel = selectedAxisRef.current
        if (sel && AXES[sel]?.type === 'rotary') {
          const t = (Date.now() * 0.0008) % (Math.PI * 2)
          const [x, y, z] = AXES[sel].curlPath(t, 1.55)
          rotaryRef.current.sphere.position.set(x, y, z)
        }
      }

      // Project label positions to screen and update DOM labels
      const canvasRect = renderer.domElement.getBoundingClientRect()
      const allK = showRotary ? AXIS_KEYS : LINEAR_KEYS
      allK.forEach(key => {
        const labelEl = labelsRef.current[key]
        if (!labelEl) return
        const wp = labelPosRef.current[key].clone()
        wp.project(camera)
        const sx = (wp.x * 0.5 + 0.5) * canvasRect.width
        const sy = (-wp.y * 0.5 + 0.5) * canvasRect.height
        // Check if behind camera
        if (wp.z > 1) { labelEl.style.opacity = '0'; return }
        labelEl.style.opacity = '1'
        labelEl.style.transform = `translate(calc(${sx}px - 50%), calc(${sy}px - 50%))`
      })

      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      const nw = el.clientWidth
      camera.aspect = nw / H
      camera.updateProjectionMatrix()
      renderer.setSize(nw, H)
    }
    window.addEventListener('resize', onResize)

    setMounted(true)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Update axis highlights when selectedAxis changes ───────────────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !mounted) return

    const allKeys = showRotary ? AXIS_KEYS : LINEAR_KEYS
    allKeys.forEach(key => {
      const group = arrowsRef.current[key]
      if (!group) return
      const ax = AXES[key]
      const isSelected = key === selectedAxis
      const isPair = selectedAxis && (
        (AXES[selectedAxis]?.rotaryPair === key) ||
        (AXES[selectedAxis]?.linearPair === key)
      )
      const color = isSelected ? ax.color : isPair ? ax.color : ax.dimColor
      const emissive = isSelected ? 0.18 : isPair ? 0.08 : 0
      group.traverse(child => {
        if (child.isMesh) {
          child.material.color.set(color)
          child.material.emissive = new THREE.Color(color).multiplyScalar(emissive)
        }
      })
    })

    // Remove old rotary arc
    if (rotaryRef.current?.group) {
      scene.remove(rotaryRef.current.group)
      rotaryRef.current = null
    }

    // Build new rotary arc for selected rotary axis
    if (selectedAxis && AXES[selectedAxis]?.type === 'rotary') {
      const ax = AXES[selectedAxis]
      const arcGroup = makeRotaryArc(ax.curlPath, 1.55, ax.color)

      // Animated sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 14, 14),
        new THREE.MeshPhongMaterial({ color: ax.color, emissive: ax.color, emissiveIntensity: 0.5 })
      )
      const [sx, sy, sz] = ax.curlPath(0, 1.55)
      sphere.position.set(sx, sy, sz)
      arcGroup.add(sphere)

      scene.add(arcGroup)
      rotaryRef.current = { group: arcGroup, sphere }
    }
  }, [selectedAxis, mounted, showRotary])

  // ── Renderer background color on theme change ──────────────────────────────
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(isDark ? 0x0f172a : 0xf1f5f9)
    }
  }, [isDark])

  // ── Theme colors ───────────────────────────────────────────────────────────
  const C = useMemo(() => isDark ? {
    bg: '#0f172a', surface: '#1e293b', border: '#334155',
    text: '#f1f5f9', muted: '#94a3b8', hint: '#475569',
    panel: 'rgba(15,23,42,0.94)', panelBorder: '#334155',
  } : {
    bg: '#f1f5f9', surface: '#ffffff', border: '#e2e8f0',
    text: '#0f172a', muted: '#64748b', hint: '#94a3b8',
    panel: 'rgba(255,255,255,0.97)', panelBorder: '#cbd5e1',
  }, [isDark])

  const sel = selectedAxis ? AXES[selectedAxis] : null

  return (
    <div style={{ fontFamily: 'monospace', position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.bg }}>

      {/* ── Canvas container ── */}
      <div ref={mountRef} style={{ width: '100%', height, position: 'relative' }}>

        {/* HTML labels — positioned via DOM in the animation loop */}
        {mounted && (AXIS_KEYS).map(key => {
          if (!showRotary && ROTARY_KEYS.includes(key)) return null
          const ax = AXES[key]
          const isSel = selectedAxis === key
          const isPair = selectedAxis && (
            AXES[selectedAxis]?.rotaryPair === key ||
            AXES[selectedAxis]?.linearPair === key
          )
          return (
            <div
              key={key}
              ref={el => { if (el) labelsRef.current[key] = el }}
              style={{
                position: 'absolute', top: 0, left: 0,
                pointerEvents: 'none', userSelect: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              <div style={{
                background: isSel
                  ? ax.color + 'dd'
                  : isPair
                    ? ax.color + '55'
                    : C.surface + 'cc',
                color: isSel ? '#000' : isPair ? ax.color : C.muted,
                border: `1px solid ${isSel ? ax.color : isPair ? ax.color + '80' : C.border}`,
                borderRadius: 4, padding: '2px 7px',
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                boxShadow: isSel ? `0 0 10px ${ax.color}88` : 'none',
                transition: 'all 0.2s',
              }}>
                {key}
              </div>
            </div>
          )
        })}

        {/* Orbit hint */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10,
          color: C.hint, fontSize: 8, letterSpacing: 1,
          pointerEvents: 'none',
        }}>DRAG TO ORBIT · SCROLL TO ZOOM · CLICK AXIS TO SELECT</div>
      </div>

      {/* ── Axis selector buttons ── */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 12px',
        background: C.surface, borderTop: `1px solid ${C.border}`,
        flexWrap: 'wrap',
      }}>
        {AXIS_KEYS.map(key => {
          if (!showRotary && ROTARY_KEYS.includes(key)) return null
          const ax = AXES[key]
          const isSel = selectedAxis === key
          return (
            <button
              key={key}
              onClick={() => setSelectedAxis(prev => prev === key ? null : key)}
              style={{
                background: isSel ? ax.color : C.bg,
                color: isSel ? (isDark ? '#000' : '#000') : ax.color,
                border: `1px solid ${isSel ? ax.color : ax.color + '60'}`,
                borderRadius: 5, padding: '4px 14px',
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: isSel ? `0 0 8px ${ax.color}66` : 'none',
              }}
            >
              {key}
              <span style={{
                fontSize: 8, marginLeft: 5, opacity: 0.7, fontWeight: 400,
              }}>
                {ax.type === 'rotary' ? 'ROT' : 'LIN'}
              </span>
            </button>
          )
        })}
        {selectedAxis && (
          <button
            onClick={() => setSelectedAxis(null)}
            style={{
              marginLeft: 'auto', background: 'transparent',
              color: C.hint, border: `1px solid ${C.border}`,
              borderRadius: 5, padding: '4px 10px', fontSize: 9,
              letterSpacing: 1, cursor: 'pointer',
            }}
          >✕ CLEAR</button>
        )}
      </div>

      {/* ── Info panel ── */}
      {sel && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          background: C.surface,
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: sel.type === 'rotary' ? '1fr 1fr' : '1fr',
          gap: 16,
        }}>

          {/* Left: core info */}
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                background: sel.color,
                color: '#000', borderRadius: 3,
                padding: '1px 7px', fontSize: 8, fontWeight: 800, letterSpacing: 2,
              }}>{sel.badge}</div>
              <span style={{ color: sel.color, fontWeight: 800, fontSize: 14 }}>
                {selectedAxis}
              </span>
              <span style={{ color: C.text, fontWeight: 600, fontSize: 12 }}>
                — {sel.title.split('—')[1]?.trim()}
              </span>
            </div>

            <Row label="POSITIVE" color={C} value={sel.positive} accent={sel.color} />
            <Row label="MACHINE"  color={C} value={sel.machine}  />
            <Row label="G-CODE"   color={C} value={sel.gcode}    />
            <Row label="DRO"      color={C} value={sel.dro}      />
            <Row label="APPLICATION" color={C} value={sel.application} />
          </div>

          {/* Right: right-hand rule panel (rotary only) */}
          {sel.type === 'rotary' && (
            <div style={{
              background: C.bg,
              border: `1px solid ${sel.color}40`,
              borderRadius: 8, padding: '12px 14px',
            }}>
              <div style={{ color: sel.color, fontWeight: 800, fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>
                RIGHT-HAND RULE
              </div>

              {/* Visual diagram */}
              <RightHandDiagram axis={selectedAxis} ax={sel} />

              <div style={{ marginTop: 10, fontSize: 10, lineHeight: 1.7, color: C.text }}>
                <Step n={1} color={sel.color}>
                  Point your <strong>right thumb</strong> in the{' '}
                  <span style={{ color: AXES[sel.linearPair].color, fontWeight: 700 }}>
                    +{sel.linearPair}
                  </span> direction.
                </Step>
                <Step n={2} color={sel.color}>
                  Your fingers curl naturally — that curl direction is{' '}
                  <span style={{ color: sel.color, fontWeight: 700 }}>positive +{selectedAxis}</span>.
                </Step>
                <Step n={3} color={sel.color}>
                  In the 3D view: watch the{' '}
                  <span style={{ color: sel.color }}>● moving dot</span>.
                  It travels from{' '}
                  <strong style={{ color: C.text }}>{sel.curlFrom}</strong>{' '}
                  toward{' '}
                  <strong style={{ color: C.text }}>{sel.curlTo}</strong>{' '}
                  in the{' '}
                  <strong style={{ color: C.text }}>{sel.curlPlane}</strong>.
                </Step>
              </div>

              <div style={{
                marginTop: 10, padding: '6px 8px',
                background: sel.color + '18',
                border: `1px solid ${sel.color}40`,
                borderRadius: 4, fontSize: 9, color: C.text, lineHeight: 1.6,
              }}>
                <span style={{ color: sel.color, fontWeight: 700 }}>Thumb axis: </span>
                +{sel.linearPair}{' '}
                <span style={{ color: C.hint }}>→</span>{' '}
                <span style={{ color: sel.color, fontWeight: 700 }}>Curl axis: </span>
                +{selectedAxis} rotates {sel.curlFrom} → {sel.curlTo}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!sel && (
        <div style={{
          padding: '10px 16px',
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          color: C.hint, fontSize: 10, letterSpacing: 1, textAlign: 'center',
        }}>
          CLICK AN AXIS ARROW IN THE 3D VIEW OR A BUTTON ABOVE TO EXPLORE
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({ label, value, color: C, accent }) {
  return (
    <div style={{ marginBottom: 7, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span style={{
        color: C.hint, fontSize: 8, letterSpacing: 2, minWidth: 80,
        paddingTop: 2, flexShrink: 0,
      }}>{label}</span>
      <span style={{
        color: accent ?? C.text,
        fontSize: 10, lineHeight: 1.55,
      }}>{value}</span>
    </div>
  )
}

function Step({ n, color, children }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'flex-start' }}>
      <span style={{
        background: color, color: '#000',
        borderRadius: '50%', width: 16, height: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 800, flexShrink: 0, marginTop: 1,
      }}>{n}</span>
      <span>{children}</span>
    </div>
  )
}

// SVG diagram of the right-hand rule for each rotary axis
function RightHandDiagram({ axis, ax }) {
  const cfg = {
    A: {
      thumbDir: '→', thumbLabel: '+X (thumb)', planePts: 'Y–Z plane',
      // Arrow from +Y toward +Z
      fromAngle: 0, toAngle: -90,  // in screen coords (0=right, -90=up)
      fromLabel: '+Y', toLabel: '+Z',
    },
    B: {
      thumbDir: '↑', thumbLabel: '+Y (thumb)', planePts: 'X–Z plane',
      fromAngle: -90, toAngle: 0,
      fromLabel: '+Z', toLabel: '+X',
    },
    C: {
      thumbDir: '⊙', thumbLabel: '+Z (toward you)', planePts: 'X–Y plane',
      fromAngle: 0, toAngle: -90,
      fromLabel: '+X', toLabel: '+Y',
    },
  }[axis] ?? {}

  const W = 130, H = 100
  const cx = 65, cy = 50, r = 28

  // Draw a partial arc (270° CCW) from fromAngle to fromAngle - 270
  const toRad = d => (d * Math.PI) / 180
  const fa = toRad(cfg.fromAngle)
  const ta = toRad(cfg.fromAngle - 270)
  const startX = cx + r * Math.cos(fa)
  const startY = cy + r * Math.sin(fa)
  const endX   = cx + r * Math.cos(ta)
  const endY   = cy + r * Math.sin(ta)

  // Pre-end point for arrowhead direction
  const preA  = toRad(cfg.fromAngle - 265)
  const preX  = cx + r * Math.cos(preA)
  const preY  = cy + r * Math.sin(preA)
  const dx = endX - preX, dy = endY - preY
  const dl = Math.hypot(dx, dy)
  const nx = dx / dl, ny = dy / dl
  const px = -ny, py = nx

  // From-label position
  const fromX = cx + (r + 14) * Math.cos(fa)
  const fromY = cy + (r + 14) * Math.sin(fa)

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      {/* Circle outline (plane) */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ax.color + '30'} strokeWidth={1} strokeDasharray="3 3" />

      {/* Arc */}
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 1 0 ${endX} ${endY}`}
        fill="none" stroke={ax.color} strokeWidth={2} strokeLinecap="round"
      />

      {/* Arrowhead */}
      <polygon
        points={`
          ${endX},${endY}
          ${endX - nx * 7 + px * 4},${endY - ny * 7 + py * 4}
          ${endX - nx * 7 - px * 4},${endY - ny * 7 - py * 4}
        `}
        fill={ax.color}
      />

      {/* From label */}
      <text x={fromX} y={fromY + 4} textAnchor="middle"
        fontSize={8} fill={ax.color} fontFamily="monospace" fontWeight="bold">
        {cfg.fromLabel}
      </text>

      {/* To label — near arrowhead */}
      <text x={endX + nx * 14} y={endY + ny * 14 + 4} textAnchor="middle"
        fontSize={8} fill={ax.color} fontFamily="monospace" fontWeight="bold">
        {cfg.toLabel}
      </text>

      {/* Thumb line */}
      {axis === 'A' && (
        <line x1={cx - r - 8} y1={cy} x2={cx + r + 8} y2={cy}
          stroke={AXES['X'].color} strokeWidth={2} />
      )}
      {axis === 'A' && (
        <polygon
          points={`${cx+r+8},${cy} ${cx+r+2},${cy-4} ${cx+r+2},${cy+4}`}
          fill={AXES['X'].color}
        />
      )}
      {axis === 'B' && (
        <>
          <line x1={cx} y1={cy + r + 8} x2={cx} y2={cy - r - 8} stroke={AXES['Y'].color} strokeWidth={2} />
          <polygon points={`${cx},${cy-r-8} ${cx-4},${cy-r-2} ${cx+4},${cy-r-2}`} fill={AXES['Y'].color} />
        </>
      )}
      {axis === 'C' && (
        <>
          <circle cx={cx} cy={cy} r={4} fill={AXES['Z'].color} />
          <circle cx={cx} cy={cy} r={1.5} fill="white" />
        </>
      )}

      {/* Thumb label */}
      <text
        x={axis === 'A' ? cx + r + 10 : axis === 'B' ? cx + 5 : cx + 7}
        y={axis === 'A' ? cy - 5    : axis === 'B' ? cy - r - 10 : cy - 9}
        fontSize={7} fill={AXES[ax.linearPair]?.color} fontFamily="monospace"
      >
        {cfg.thumbLabel}
      </text>
    </svg>
  )
}
