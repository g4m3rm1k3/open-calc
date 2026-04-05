// AtomViewer.jsx
// Reusable 3D Bohr-model atom viewer.
// Used by PeriodicTable and InsideTheAtom lesson.
//
// Props:
//   element — object with: n, mass, shells, cat  (from chemistry_data ELEMENTS)
//   height  — canvas height in px (default 380)

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CATEGORY_COLORS } from './chemistry_data'

export default function AtomViewer({ element, height = 380 }) {
  const mountRef = useRef(null)
  const ctrlRef  = useRef(null)

  useEffect(() => {
    if (!mountRef.current || !element) return
    const container = mountRef.current
    const W = container.offsetWidth || 360
    const H = height

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000)
    camera.position.set(0, 0, 8)

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
    const nucleusHex = parseInt(catColor.border.replace('#',''), 16)
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(nucleonR + 0.18, 20, 20),
      new THREE.MeshBasicMaterial({ color: nucleusHex, transparent: true, opacity: 0.12 })
    ))

    // Electron shells — each shell gets a Group with same rotation as its ring
    const shells       = element.shells || []
    const electronObjs = []
    const SHELL_COLORS = [0x38bdf8, 0xa78bfa, 0x4ade80, 0xfbbf24, 0xf87171, 0xfb923c, 0xe879f9]

    shells.forEach((count, si) => {
      const shellR = 1.4 + si * 1.0
      const tiltX  = Math.PI / 2 + si * 0.35
      const tiltY  = si * 0.5

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(shellR, 0.012, 8, 80),
        new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 })
      )
      ring.rotation.x = tiltX
      ring.rotation.y = tiltY
      scene.add(ring)

      const group = new THREE.Group()
      group.rotation.x = tiltX
      group.rotation.y = tiltY
      scene.add(group)

      const eColor = SHELL_COLORS[si % SHELL_COLORS.length]
      const eMat   = new THREE.MeshPhongMaterial({ color: eColor, emissive: eColor, emissiveIntensity: 0.5, shininess: 100 })
      for (let e = 0; e < count; e++) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eMat)
        group.add(mesh)
        electronObjs.push({ mesh, radius: shellR, phase: (e / count) * Math.PI * 2, speed: 0.4 / (si + 1) })
      }
    })

    // Mouse drag + scroll zoom
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
    const onWheel = e => {
      e.preventDefault()
      camera.position.z = Math.max(3, Math.min(22, camera.position.z + e.deltaY * 0.02))
    }
    renderer.domElement.addEventListener('mousedown', onDown)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)

    ctrlRef.current = {
      zoomIn:  () => { camera.position.z = Math.max(3,  camera.position.z - 1.5) },
      zoomOut: () => { camera.position.z = Math.min(22, camera.position.z + 1.5) },
      reset:   () => { rotX = 0.3; rotY = 0.2; camera.position.z = 8 },
    }

    let t = 0, animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.016
      if (!isDragging) rotY += 0.004
      scene.rotation.y = rotY
      scene.rotation.x = rotX * 0.3
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
  }, [element, height])

  return (
    <div style={{ position:'relative', userSelect:'none' }}>
      <div ref={mountRef} style={{
        width:'100%', height, cursor:'grab', borderRadius:10, overflow:'hidden',
        background:'radial-gradient(ellipse at 50% 50%, #0a1a35 0%, #050a18 100%)',
      }} />
      <div style={{ position:'absolute', bottom:10, right:10, display:'flex', flexDirection:'column', gap:4 }}>
        {[
          { s:'+', fn: () => ctrlRef.current?.zoomIn(),  t:'Zoom in'    },
          { s:'−', fn: () => ctrlRef.current?.zoomOut(), t:'Zoom out'   },
          { s:'⟲', fn: () => ctrlRef.current?.reset(),  t:'Reset view' },
        ].map(({ s, fn, t }) => (
          <button key={s} onClick={fn} title={t} style={{
            width:28, height:28, borderRadius:6, border:'1px solid #334155',
            background:'rgba(15,23,42,0.85)', color:'#94a3b8', fontSize:s==='⟲'?13:16,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
          }}>{s}</button>
        ))}
      </div>
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
