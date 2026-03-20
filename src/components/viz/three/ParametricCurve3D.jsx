import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import SliderControl from '../SliderControl.jsx'

const TWO_PI = 2 * Math.PI
const FOUR_PI = 4 * Math.PI

const PRESETS = [
  {
    label: 'Helix',
    tMin: 0,
    tMax: FOUR_PI,
    point: t => new THREE.Vector3(Math.cos(t), Math.sin(t), t / 3 - FOUR_PI / 6),
    tangent: t => new THREE.Vector3(-Math.sin(t), Math.cos(t), 1 / 3).normalize(),
  },
  {
    label: 'Lissajous 3D',
    tMin: 0,
    tMax: TWO_PI,
    point: t => new THREE.Vector3(Math.sin(2 * t), Math.sin(3 * t), Math.sin(t)),
    tangent: t => new THREE.Vector3(2 * Math.cos(2 * t), 3 * Math.cos(3 * t), Math.cos(t)).normalize(),
  },
  {
    label: 'Trefoil knot',
    tMin: 0,
    tMax: FOUR_PI,
    point: t => {
      const r = 2 + Math.cos(3 * t / 2)
      return new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), Math.sin(3 * t / 2))
    },
    tangent: t => {
      const dt = 0.001
      const p0 = PRESETS[2].point(t)
      const p1 = PRESETS[2].point(t + dt)
      return new THREE.Vector3().subVectors(p1, p0).normalize()
    },
  },
]

export default function ParametricCurve3D() {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const curveGroupRef = useRef(null)
  const pointGroupRef = useRef(null)
  const rafRef = useRef(null)
  const autoRotateRef = useRef(true)

  const [preset, setPreset] = useState(0)
  const [t0, setT0] = useState(0)

  // ── Bootstrap Three.js once ─────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const width = el.clientWidth || 580
    const height = 360

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0f172a)
    el.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(5, 3, 5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controlsRef.current = controls

    // Stop auto-rotate when user interacts
    controls.addEventListener('start', () => { autoRotateRef.current = false })

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(4, 6, 4)
    scene.add(dirLight)

    // Axes
    const axisLen = 2.5
    ;[
      { dir: [axisLen, 0, 0], color: 0xef4444 },
      { dir: [0, axisLen, 0], color: 0x22c55e },
      { dir: [0, 0, axisLen], color: 0x3b82f6 },
    ].forEach(({ dir, color }) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...dir),
      ])
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color, opacity: 0.5, transparent: true })))
    })

    curveGroupRef.current = new THREE.Group()
    pointGroupRef.current = new THREE.Group()
    scene.add(curveGroupRef.current)
    scene.add(pointGroupRef.current)

    const onResize = () => {
      const w = el.clientWidth || 580
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', onResize)

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      if (autoRotateRef.current && sceneRef.current) {
        sceneRef.current.rotation.y += 0.003
      }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // ── Rebuild curve when preset changes ──────────────────────────────────
  useEffect(() => {
    const cg = curveGroupRef.current
    if (!cg) return
    while (cg.children.length) cg.remove(cg.children[0])

    const p = PRESETS[preset]
    const N = 300
    const pts = []
    for (let i = 0; i <= N; i++) {
      const t = p.tMin + (p.tMax - p.tMin) * (i / N)
      pts.push(p.point(t))
    }

    const curve = new THREE.CatmullRomCurve3(pts)
    const tubeGeo = new THREE.TubeGeometry(curve, 300, 0.04, 8, false)

    // Gradient color along tube: map vertex index to color
    const colors = []
    const nVerts = tubeGeo.attributes.position.count
    const c1 = new THREE.Color(0x6470f1)
    const c2 = new THREE.Color(0xf59e0b)
    for (let i = 0; i < nVerts; i++) {
      const t2 = i / (nVerts - 1)
      const c = new THREE.Color().lerpColors(c1, c2, t2)
      colors.push(c.r, c.g, c.b)
    }
    tubeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const tubeMat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 80,
    })
    cg.add(new THREE.Mesh(tubeGeo, tubeMat))

    // Reset t0 slider
    setT0(p.tMin)
    autoRotateRef.current = true
  }, [preset])

  // ── Update point indicator when t0 changes ─────────────────────────────
  useEffect(() => {
    const pg = pointGroupRef.current
    if (!pg) return
    while (pg.children.length) pg.remove(pg.children[0])

    const p = PRESETS[preset]
    const pos = p.point(t0)
    const tan = p.tangent(t0)

    // Sphere at point
    const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16)
    const sphere = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({ color: 0xef4444 }))
    sphere.position.copy(pos)
    pg.add(sphere)

    // Tangent arrow
    const arrowLen = 0.8
    const arrow = new THREE.ArrowHelper(tan, pos, arrowLen, 0xfbbf24, 0.2, 0.12)
    pg.add(arrow)
  }, [t0, preset])

  const p = PRESETS[preset]

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '360px' }} className="rounded overflow-hidden" />
      <div className="px-4 mt-3 space-y-2">
        <SliderControl
          label={`t₀ (parameter)`}
          min={p.tMin}
          max={p.tMax}
          step={(p.tMax - p.tMin) / 200}
          value={t0}
          onChange={setT0}
          format={v => v.toFixed(3)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2 px-4">
        {PRESETS.map((pr, i) => (
          <button
            key={i}
            onClick={() => setPreset(i)}
            className={`px-3 py-1 rounded text-sm transition ${preset === i ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
          >
            {pr.label}
          </button>
        ))}
        <button
          onClick={() => { autoRotateRef.current = true }}
          className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          ↺ Auto-rotate
        </button>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Red sphere = point on curve at t₀. Yellow arrow = tangent vector (velocity direction). Drag to orbit.
      </p>
    </div>
  )
}
