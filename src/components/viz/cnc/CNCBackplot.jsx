import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function CNCBackplot({ pathPoints = [], currentStep = 0, width = '100%', height = '400px' }) {
  const mountRef    = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef    = useRef(null)
  const cameraRef   = useRef(null)
  const controlsRef = useRef(null)
  const pathLayerRef= useRef(null)
  const toolRef     = useRef(null)  // THREE.Group with tool mesh inside
  const gridRef     = useRef(null)  // GridHelper reference so we can rescale it
  const axesRef     = useRef(null)
  const rafRef      = useRef(null)

  // ── Bootstrap Three.js (once) ─────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const w = el.clientWidth || 700
    const h = parseInt(height) || 400

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0f172a, 1)
    el.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0f172a, 0.002)
    sceneRef.current = scene

    // Camera – Z-up (CNC standard). Far plane large enough for any program.
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50000)
    camera.up.set(0, 0, 1)
    camera.position.set(150, -150, 200)
    cameraRef.current = camera

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.screenSpacePanning = false
    controls.target.set(0, 0, 0)
    controlsRef.current = controls

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(200, 200, 400)
    scene.add(dir)

    // Grid – initial default 200×200 (mm units). Rebuilt when path arrives.
    const grid = new THREE.GridHelper(200, 20, 0x334155, 0x1e293b)
    grid.rotation.x = Math.PI / 2   // XY plane
    scene.add(grid)
    gridRef.current = grid

    // Axes – initial 30 units
    const axes = new THREE.AxesHelper(30)
    scene.add(axes)
    axesRef.current = axes

    // Path group
    const pathLayer = new THREE.Group()
    scene.add(pathLayer)
    pathLayerRef.current = pathLayer

    // Tool group (rebuilt when path arrives to scale correctly)
    const toolGroup = new THREE.Group()
    scene.add(toolGroup)
    toolRef.current = toolGroup
    _buildTool(toolGroup, 3, 30)  // default: r=3mm, len=30mm

    // Render loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      const nw = el.clientWidth
      camera.aspect = nw / h
      camera.updateProjectionMatrix()
      renderer.setSize(nw, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // ── Rebuild path + auto-fit everything when pathPoints change ────────────
  useEffect(() => {
    const group  = pathLayerRef.current
    const scene  = sceneRef.current
    const camera = cameraRef.current
    const ctrl   = controlsRef.current
    if (!group || !scene || !camera || !ctrl) return

    // Clear old path lines
    while (group.children.length) group.remove(group.children[0])

    if (pathPoints.length < 2) return

    // ── Compute bounding box ────────────────────────────────────────────────
    const bbox = new THREE.Box3()
    const verts = pathPoints.map(p => new THREE.Vector3(p.machineX, p.machineY, p.machineZ))
    verts.forEach(v => bbox.expandByPoint(v))
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    const size   = new THREE.Vector3()
    bbox.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z, 10)  // minimum 10mm

    // ── Draw toolpath ───────────────────────────────────────────────────────
    // Rapid moves (G00) drawn cyan dimmer; cuts (G01/G02/G03) drawn bright
    const cutPositions   = []
    const rapidPositions = []
    let prevMotion = 'G00'

    for (let i = 0; i < verts.length; i++) {
      // We don't have motionMode per step stored; colour whole path one colour for now.
      // Future: store motionMode in snapshot array.
      cutPositions.push(verts[i])
    }

    // Blue cut path
    const geo  = new THREE.BufferGeometry().setFromPoints(cutPositions)
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x38bdf8 }))
    group.add(line)

    // Start / end markers
    const markerGeo = new THREE.SphereGeometry(maxDim * 0.012, 8, 8)
    const startM = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0x4ade80 }))
    startM.position.copy(verts[0])
    group.add(startM)
    const endM = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0xf87171 }))
    endM.position.copy(verts[verts.length - 1])
    group.add(endM)

    // ── Rebuild grid to cover the path ──────────────────────────────────────
    const old = gridRef.current
    if (old) scene.remove(old)
    const gridSize  = Math.ceil(maxDim * 1.5 / 10) * 10   // round up to nearest 10mm
    const divisions = Math.min(Math.max(Math.floor(gridSize / 5), 10), 50)
    const newGrid = new THREE.GridHelper(gridSize, divisions, 0x334155, 0x1e293b)
    newGrid.rotation.x = Math.PI / 2
    newGrid.position.set(center.x, center.y, bbox.min.z - 0.5)  // sit just below lowest Z
    scene.add(newGrid)
    gridRef.current = newGrid

    // ── Rebuild axes ────────────────────────────────────────────────────────
    const oldAx = axesRef.current
    if (oldAx) scene.remove(oldAx)
    const axLen  = maxDim * 0.3
    const newAx  = new THREE.AxesHelper(axLen)
    newAx.position.set(bbox.min.x, bbox.min.y, bbox.min.z)
    scene.add(newAx)
    axesRef.current = newAx

    // ── Rebuild tool to match scale ─────────────────────────────────────────
    const toolGroup = toolRef.current
    while (toolGroup.children.length) toolGroup.remove(toolGroup.children[0])
    const toolR   = Math.max(maxDim * 0.025, 1)   // ~2.5% of max dim, min 1mm
    const toolLen = Math.max(maxDim * 0.25,  8)   // ~25% of max dim, min 8mm
    _buildTool(toolGroup, toolR, toolLen)

    // ── Auto-fit camera ─────────────────────────────────────────────────────
    const distance = maxDim * 2.0
    ctrl.target.copy(center)
    camera.position.set(
      center.x + distance * 0.7,
      center.y - distance * 0.7,
      center.z + distance * 0.9
    )
    camera.near = maxDim * 0.001
    camera.far  = maxDim * 100
    camera.updateProjectionMatrix()
    ctrl.update()

  }, [pathPoints])

  // ── Move tool marker to current step ─────────────────────────────────────
  useEffect(() => {
    if (!toolRef.current || pathPoints.length === 0) return
    const pt = pathPoints[Math.min(currentStep, pathPoints.length - 1)]
    if (pt) toolRef.current.position.set(pt.machineX, pt.machineY, pt.machineZ)
  }, [currentStep, pathPoints])

  return (
    <div className="relative border border-slate-700 rounded-lg overflow-hidden bg-slate-900 shadow-2xl"
      style={{ height: typeof height === 'string' ? height : height + 'px' }}>
      <div ref={mountRef} className="w-full h-full" style={{ minHeight: parseInt(height) || 360 }} />
      {pathPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span style={{ color: '#475569', fontSize: 12, fontFamily: 'monospace' }}>
            NO TOOLPATH — RUN PROGRAM TO PREVIEW
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Build tool geometry inside given group ───────────────────────────────────
function _buildTool(group, radius, length) {
  // Shank (upper, grey)
  const shankLen = length * 0.6
  const shankGeo = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, shankLen, 16)
  const shankMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, shininess: 80 })
  const shank    = new THREE.Mesh(shankGeo, shankMat)
  shank.rotation.x = Math.PI / 2
  shank.position.set(0, 0, shankLen / 2 + length * 0.4)   // sits above flutes
  group.add(shank)

  // Flutes (lower cutting portion, yellow-gold)
  const fluteLen = length * 0.4
  const fluteGeo = new THREE.CylinderGeometry(radius, radius * 0.8, fluteLen, 16)
  const fluteMat = new THREE.MeshPhongMaterial({ color: 0xfbbf24, emissive: 0x332200, shininess: 120 })
  const flutes   = new THREE.Mesh(fluteGeo, fluteMat)
  flutes.rotation.x = Math.PI / 2
  flutes.position.set(0, 0, fluteLen / 2)  // tip at z=0, flutes go up
  group.add(flutes)

  // Tip indicator (tiny red disc at z=0 so you can see exact tip position)
  const tipGeo  = new THREE.CircleGeometry(radius * 0.7, 16)
  const tipMat  = new THREE.MeshBasicMaterial({ color: 0xf87171, side: THREE.DoubleSide })
  const tip     = new THREE.Mesh(tipGeo, tipMat)
  group.add(tip)  // tip sits at group origin (z=0 = tool tip)
}
