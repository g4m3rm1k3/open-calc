import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function CNCBackplot({ pathPoints = [], currentStep = 0, width = '100%', height = '400px' }) {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const pathLayerRef = useRef(null)
  const toolRef = useRef(null)
  const rafRef = useRef(null)

  // ── Bootstrap Three.js ──────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const w = el.clientWidth || 600
    const h = (typeof height === 'string' && height.includes('%')) ? 400 : parseInt(height) || 400

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0f172a, 1)
    el.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(5, 5, 8)
    camera.up.set(0, 0, 1) // CNC standard: Z is UP
    cameraRef.current = camera

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controlsRef.current = controls

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(10, 10, 20)
    scene.add(dirLight)

    // Grid (The Machine Bed)
    const grid = new THREE.GridHelper(20, 20, 0x475569, 0x1e293b)
    grid.rotation.x = Math.PI / 2 // Rotate to XY plane
    scene.add(grid)

    // Axes
    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    // Path Group
    pathLayerRef.current = new THREE.Group()
    scene.add(pathLayerRef.current)

    // Tool Mesh (A cylinder representing an endmill)
    const toolGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 12)
    const toolMat = new THREE.MeshPhongMaterial({ color: 0xeed202, emissive: 0x443300, shininess: 100 })
    const toolMesh = new THREE.Mesh(toolGeo, toolMat)
    toolMesh.rotation.x = Math.PI / 2 // Align with Z axis
    // Offset so bottom of tool is at (0,0,0)
    toolMesh.position.set(0, 0, 0.5) 
    
    // Wrapper for tool pivot
    const toolGroup = new THREE.Group()
    toolGroup.add(toolMesh)
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
      camera.aspect = nw / h
      camera.updateProjectionMatrix()
      renderer.setSize(nw, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // ── Render Toolpath ──────────────────────────────────────────────────
  useEffect(() => {
    const group = pathLayerRef.current
    if (!group) return
    while (group.children.length) group.remove(group.children[0])

    if (pathPoints.length < 2) return

    const positions = []
    pathPoints.forEach(p => {
      positions.push(new THREE.Vector3(p.machineX, p.machineY, p.machineZ))
    })

    const geometry = new THREE.BufferGeometry().setFromPoints(positions)
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }))
    group.add(line)

    // Highlight segments? (Optional)
  }, [pathPoints])

  // ── Update Tool Position ──────────────────────────────────────────────
  useEffect(() => {
    if (!toolRef.current || pathPoints.length === 0) return
    const point = pathPoints[Math.min(currentStep, pathPoints.length - 1)]
    if (point) {
      toolRef.current.position.set(point.machineX, point.machineY, point.machineZ)
    }
  }, [currentStep, pathPoints])

  return (
    <div className="relative border border-slate-700 rounded-lg overflow-hidden bg-slate-900 shadow-2xl h-full">
      <div ref={mountRef} className="w-full h-full min-h-[400px]" />
    </div>
  )
}
