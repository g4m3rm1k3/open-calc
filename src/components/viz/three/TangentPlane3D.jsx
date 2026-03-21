import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import SliderControl from '../SliderControl.jsx'

const f = (x, y) => Math.sin(x) * Math.cos(y)
const dfx = (x, y) => Math.cos(x) * Math.cos(y)
const dfy = (x, y) => -Math.sin(x) * Math.sin(y)

export default function TangentPlane3D() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const [x0, setX0] = useState(1)
  const [y0, setY0] = useState(1)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const width = el.clientWidth || 580
    const height = 340

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xf8fafc)
    el.appendChild(renderer.domElement)

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.up.set(0, 0, 1)
    camera.position.set(6, 6, 5)
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    // ── Lights ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9)
    dirLight.position.set(5, 8, 5)
    scene.add(dirLight)

    // ── Surface ───────────────────────────────────────────────────────────
    const SEGS = 60
    const RANGE = 3
    const surfGeo = new THREE.PlaneGeometry(RANGE * 2, RANGE * 2, SEGS, SEGS)
    const pos = surfGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, f(x, y))
    }
    pos.needsUpdate = true
    surfGeo.computeVertexNormals()

    const surfMat = new THREE.MeshPhongMaterial({
      color: 0x6470f1,
      opacity: 0.85,
      transparent: true,
      side: THREE.DoubleSide,
    })
    const surfMesh = new THREE.Mesh(surfGeo, surfMat)
    scene.add(surfMesh)

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4a5568,
      wireframe: true,
      opacity: 0.12,
      transparent: true,
    })
    scene.add(new THREE.Mesh(surfGeo, wireMat))

    // ── Axes ──────────────────────────────────────────────────────────────
    const axisLen = 3.5
    const axisMat = (color) => new THREE.LineBasicMaterial({ color })
    ;[
      { dir: [axisLen, 0, 0], color: 0xef4444 },
      { dir: [0, axisLen, 0], color: 0x22c55e },
      { dir: [0, 0, axisLen], color: 0x3b82f6 },
    ].forEach(({ dir, color }) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...dir),
      ])
      scene.add(new THREE.Line(geo, axisMat(color)))
    })

    // ── Tangent plane (mutable) ───────────────────────────────────────────
    const tpGeo = new THREE.PlaneGeometry(1.8, 1.8, 1, 1)
    const tpMat = new THREE.MeshPhongMaterial({
      color: 0xf59e0b,
      opacity: 0.55,
      transparent: true,
      side: THREE.DoubleSide,
    })
    const tpMesh = new THREE.Mesh(tpGeo, tpMat)
    scene.add(tpMesh)

    // ── Point sphere (mutable) ────────────────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16)
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0xef4444 })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    scene.add(sphere)

    // Store refs for updating
    sceneRef.tpMesh = tpMesh
    sceneRef.sphere = sphere

    // ── Resize handler ────────────────────────────────────────────────────
    const onResize = () => {
      const w = el.clientWidth || 580
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', onResize)

    // ── Animate ───────────────────────────────────────────────────────────
    let rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // ── Update tangent plane + sphere when x0/y0 change ─────────────────────
  useEffect(() => {
    if (!sceneRef.tpMesh) return

    const z0 = f(x0, y0)
    const px = dfx(x0, y0)
    const py = dfy(x0, y0)

    // Move sphere
    sceneRef.sphere.position.set(x0, y0, z0)

    // Orient tangent plane: normal = (-px, -py, 1) normalized
    const normal = new THREE.Vector3(-px, -py, 1).normalize()
    const defaultNormal = new THREE.Vector3(0, 0, 1)
    const quat = new THREE.Quaternion().setFromUnitVectors(defaultNormal, normal)
    sceneRef.tpMesh.position.set(x0, y0, z0)
    sceneRef.tpMesh.setRotationFromQuaternion(quat)
  }, [x0, y0])

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '340px' }} className="rounded overflow-hidden" />
      <div className="px-4 mt-3 space-y-2">
        <SliderControl label="x₀" min={-3} max={3} step={0.1} value={x0} onChange={setX0} />
        <SliderControl label="y₀" min={-3} max={3} step={0.1} value={y0} onChange={setY0} />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Surface: z = sin(x)cos(y). Tangent plane (amber) at (x₀, y₀) — drag to orbit, scroll to zoom.
      </p>
      <div className="flex justify-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
        <span>∂z/∂x = cos(x₀)cos(y₀) = {dfx(x0, y0).toFixed(3)}</span>
        <span>∂z/∂y = −sin(x₀)sin(y₀) = {dfy(x0, y0).toFixed(3)}</span>
      </div>
    </div>
  )
}
