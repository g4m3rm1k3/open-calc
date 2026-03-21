import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import SliderControl from '../SliderControl.jsx'

function makeEdges(type, n, threshold) {
  const edges = []
  if (type === 'cycle') {
    for (let i = 0; i < n; i += 1) edges.push([i, (i + 1) % n])
    return edges
  }
  if (type === 'complete') {
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) edges.push([i, j])
    }
    return edges
  }
  const t = Math.max(0.05, threshold)
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const seed = (i * 97 + j * 193) % 1000
      const p = (seed / 1000)
      if (p < t) edges.push([i, j])
    }
  }
  return edges
}

function nodePos(i, n, radius = 2.4) {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
  const theta = Math.PI * (1 + Math.sqrt(5)) * i
  return new THREE.Vector3(
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(phi)
  )
}

export default function GraphNetwork3D() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const rafRef = useRef(null)
  const graphGroupRef = useRef(null)

  const [type, setType] = useState('random')
  const [n, setN] = useState(18)
  const [threshold, setThreshold] = useState(0.2)

  const stats = useMemo(() => {
    const e = makeEdges(type, n, threshold).length
    const avgDegree = n > 0 ? (2 * e) / n : 0
    return { edges: e, avgDegree }
  }, [type, n, threshold])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const width = el.clientWidth || 620
    const height = 360

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0f172a)
    el.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100)
    camera.position.set(0, 0, 7)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controlsRef.current = controls

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const dir = new THREE.DirectionalLight(0xffffff, 0.85)
    dir.position.set(4, 5, 6)
    scene.add(dir)

    graphGroupRef.current = new THREE.Group()
    scene.add(graphGroupRef.current)

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      graphGroupRef.current.rotation.y += 0.0025
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const group = graphGroupRef.current
    if (!group) return
    while (group.children.length) group.remove(group.children[0])

    const pts = Array.from({ length: n }, (_, i) => nodePos(i, n))
    const edges = makeEdges(type, n, threshold)

    const edgePositions = []
    edges.forEach(([a, b]) => {
      edgePositions.push(pts[a].x, pts[a].y, pts[a].z)
      edgePositions.push(pts[b].x, pts[b].y, pts[b].z)
    })

    if (edgePositions.length > 0) {
      const edgeGeo = new THREE.BufferGeometry()
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3))
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.75 })
      group.add(new THREE.LineSegments(edgeGeo, edgeMat))
    }

    const nodeGeo = new THREE.SphereGeometry(0.09, 14, 14)
    const nodeMat = new THREE.MeshPhongMaterial({ color: 0x6366f1 })
    pts.forEach((p) => {
      const m = new THREE.Mesh(nodeGeo, nodeMat)
      m.position.copy(p)
      group.add(m)
    })
  }, [type, n, threshold])

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '360px' }} className="rounded overflow-hidden" />
      <div className="px-4 mt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          {['random', 'cycle', 'complete'].map((k) => (
            <button key={k} onClick={() => setType(k)} className={`px-3 py-1 rounded text-sm ${type === k ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
              {k}
            </button>
          ))}
        </div>
        <SliderControl label={`Vertices n = ${n}`} min={6} max={40} step={1} value={n} onChange={setN} />
        {type === 'random' && <SliderControl label={`Random edge density = ${threshold.toFixed(2)}`} min={0.05} max={0.5} step={0.01} value={threshold} onChange={setThreshold} />}
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
        Edges: {stats.edges} | Average degree: {stats.avgDegree.toFixed(2)} | Drag to orbit.
      </p>
    </div>
  )
}
