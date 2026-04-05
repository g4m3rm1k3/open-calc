import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function CNCBackplot({ pathPoints = [], currentStep = 0, isDark = true, width = '100%', height = '400px' }) {
  const mountRef    = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef    = useRef(null)
  const cameraRef   = useRef(null)
  const controlsRef = useRef(null)
  const pathLayerRef= useRef(null)
  const toolRef     = useRef(null)
  const gridRef     = useRef(null)
  const rafRef      = useRef(null)

  // Colors based on theme
  const colors = {
    bg: isDark ? 0x0f172a : 0xf1f5f9,
    grid: isDark ? 0x334155 : 0x94a3b8,
    gridAlt: isDark ? 0x1e293b : 0xcbd5e1,
    rapid: isDark ? 0xfacc15 : 0xd97706, // G00
    feed:  isDark ? 0x38bdf8 : 0x2563eb, // G01/02/03
  }

  // ── Bootstrap Three.js (once) ─────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const w = el.clientWidth || 700
    const h = height.endsWith('%') ? (el.clientHeight || 400) : (parseInt(height) || 400)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(colors.bg, 1)
    el.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(colors.bg, 0.0015)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000)
    camera.up.set(0, 0, 1)
    camera.position.set(200, -200, 250)
    cameraRef.current = camera

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.set(0, 0, 0)
    controlsRef.current = controls

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(100, 100, 300)
    scene.add(dir)

    const grid = new THREE.GridHelper(500, 50, colors.grid, colors.gridAlt)
    grid.rotation.x = Math.PI / 2
    scene.add(grid)
    gridRef.current = grid

    const pathLayer = new THREE.Group()
    scene.add(pathLayer)
    pathLayerRef.current = pathLayer

    const toolGroup = new THREE.Group()
    scene.add(toolGroup)
    toolRef.current = toolGroup

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const nw = el.clientWidth
      const nh = height.endsWith('%') ? (el.clientHeight || 400) : (parseInt(height) || 400)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // Update background/fog when theme changes
  useEffect(() => {
    if (rendererRef.current) rendererRef.current.setClearColor(colors.bg)
    if (sceneRef.current) sceneRef.current.fog.color.setHex(colors.bg)
    if (gridRef.current) {
      sceneRef.current.remove(gridRef.current)
      const newGrid = new THREE.GridHelper(500, 50, colors.grid, colors.gridAlt)
      newGrid.rotation.x = Math.PI / 2
      sceneRef.current.add(newGrid)
      gridRef.current = newGrid
    }
  }, [isDark])

  // ── Rebuild path ──────────────────────────────────────────────────────────
  useEffect(() => {
    const group = pathLayerRef.current
    const scene = sceneRef.current
    if (!group || !scene) return

    while (group.children.length) group.remove(group.children[0])

    if (pathPoints.length < 2) return

    // Group segments by motion mode to draw with different colors
    const segments = []
    let currentSegment = { points: [new THREE.Vector3(pathPoints[0].machineX, pathPoints[0].machineY, pathPoints[0].machineZ)], mode: pathPoints[0].motionMode || 'G00' }

    for (let i = 1; i < pathPoints.length; i++) {
      const pt = pathPoints[i]
      const v = new THREE.Vector3(pt.machineX, pt.machineY, pt.machineZ)
      const mode = pt.motionMode || 'G00'

      if (mode !== currentSegment.mode) {
        segments.push(currentSegment)
        currentSegment = { points: [currentSegment.points[currentSegment.points.length - 1], v], mode }
      } else {
        currentSegment.points.push(v)
      }
    }
    segments.push(currentSegment)

    segments.forEach(seg => {
      const geo = new THREE.BufferGeometry().setFromPoints(seg.points)
      const color = seg.mode === 'G00' ? colors.rapid : colors.feed
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 })
      const line = new THREE.Line(geo, mat)
      group.add(line)
    })

    // Markers
    const startPt = pathPoints[0]
    const startGeo = new THREE.SphereGeometry(1.5, 8, 8)
    const startM = new THREE.Mesh(startGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }))
    startM.position.set(startPt.machineX, startPt.machineY, startPt.machineZ)
    group.add(startM)

    // Fit camera
    const bbox = new THREE.Box3().setFromObject(group)
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 20)
    
    _buildTool(toolRef.current, Math.max(maxDim*0.015, 1), Math.max(maxDim*0.2, 10))

  }, [pathPoints, isDark])

  // Move tool
  useEffect(() => {
    if (!toolRef.current || pathPoints.length === 0) return
    const pt = pathPoints[Math.min(currentStep, pathPoints.length - 1)]
    if (pt) toolRef.current.position.set(pt.machineX, pt.machineY, pt.machineZ)
  }, [currentStep, pathPoints])

  return (
    <div className="relative border border-slate-700/30 rounded-xl overflow-hidden bg-slate-900 shadow-inner"
      style={{ width, height, minHeight: typeof height === 'number' ? height : (parseInt(height) || 400) }}>
      <div ref={mountRef} className="w-full h-full" />
      {pathPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-800/80 px-4 py-2 rounded-lg backdrop-blur-sm">
            Ready for Program Input
          </span>
        </div>
      )}
    </div>
  )
}

function _buildTool(group, radius, length) {
  while (group.children.length) group.remove(group.children[0])
  
  const shankLen = length * 0.7
  const shank = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, shankLen, 16),
    new THREE.MeshPhongMaterial({ color: 0x64748b, shininess: 100 })
  )
  shank.rotation.x = Math.PI/2
  shank.position.z = shankLen/2 + length * 0.3
  group.add(shank)

  const flutes = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.9, length * 0.3, 16),
    new THREE.MeshPhongMaterial({ color: 0xf59e0b, emissive: 0x332200, shininess: 120 })
  )
  flutes.rotation.x = Math.PI/2
  flutes.position.z = (length * 0.3) / 2
  group.add(flutes)

  const tip = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 16),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
  )
  group.add(tip)
}
