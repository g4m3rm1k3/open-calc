import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Deterministic pseudo-random — same scene every render
function rng(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// ── Dense colored starfield ───────────────────────────────────────────────────
function ColoredStars() {
  const { positions, colors } = useMemo(() => {
    const N = 3200
    const positions = new Float32Array(N * 3)
    const colors    = new Float32Array(N * 3)

    // white 78%, blue-white 12%, gold 5%, red-giant 3%, cyan 2%
    const palette = [
      [1.00, 1.00, 1.00],
      [0.60, 0.75, 1.00],
      [1.00, 0.90, 0.50],
      [1.00, 0.45, 0.30],
      [0.45, 0.85, 1.00],
    ]
    const cum = [0, 0.78, 0.90, 0.95, 0.98, 1.0]

    for (let i = 0; i < N; i++) {
      const r1 = rng(i * 7)
      const r2 = rng(i * 7 + 1)
      const r3 = rng(i * 7 + 2)
      const phi   = Math.acos(2 * r1 - 1)
      const theta = r2 * Math.PI * 2
      const radius = 40 + rng(i * 7 + 3) * 30
      positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const cr = rng(i * 7 + 4)
      let ci = 0
      for (let k = 0; k < 5; k++) { if (cr >= cum[k] && cr < cum[k + 1]) { ci = k; break } }
      const [r, g, b] = palette[ci]
      colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b
    }
    return { positions, colors }
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={3200} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={3200} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} vertexColors transparent opacity={0.88} sizeAttenuation />
    </points>
  )
}

// ── Spiral galaxy ─────────────────────────────────────────────────────────────
function Galaxy() {
  const groupRef = useRef(null)

  const { positions, colors } = useMemo(() => {
    const N = 1800
    const positions = new Float32Array(N * 3)
    const colors    = new Float32Array(N * 3)
    const ARMS = 2
    const TURNS = 1.9

    for (let i = 0; i < N; i++) {
      const arm  = i % ARMS
      const t    = rng(i * 13 + 1)
      const r    = 0.3 + t * 9.8
      const angle = (arm / ARMS) * Math.PI * 2 + t * TURNS * Math.PI * 2 + (rng(i * 13 + 2) - 0.5) * 0.6
      const sc1  = (rng(i * 13 + 3) - 0.5) * 0.28 * r
      const sc2  = (rng(i * 13 + 4) - 0.5) * 0.14 * r

      positions[i * 3]     = r * Math.cos(angle) + sc1
      positions[i * 3 + 1] = sc2
      positions[i * 3 + 2] = r * Math.sin(angle) + sc1

      // white core → warm gold → cool violet at edges
      if (t < 0.12) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.96; colors[i * 3 + 2] = 0.88
      } else if (t < 0.50) {
        const b = (t - 0.12) / 0.38
        colors[i * 3] = 1.0 - b * 0.22; colors[i * 3 + 1] = 0.78 - b * 0.28; colors[i * 3 + 2] = 0.38 - b * 0.12
      } else {
        const b = (t - 0.50) / 0.50
        colors[i * 3] = 0.32 + b * 0.30; colors[i * 3 + 1] = 0.28 + b * 0.22; colors[i * 3 + 2] = 0.55 + b * 0.45
      }
    }
    return { positions, colors }
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.03
  })

  return (
    <group ref={groupRef} position={[4, -5, -10]} rotation={[0.35, 0.6, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={1800} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={1800} array={colors}    itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.065} vertexColors transparent opacity={0.82} sizeAttenuation
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </points>
    </group>
  )
}

// ── Nebula cloud (dense point cluster with additive blending) ─────────────────
function NebulaCloud({ position, color, spread, count, seed }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = spread * Math.pow(rng(seed + i * 5), 1.6)
      const phi   = Math.acos(2 * rng(seed + i * 5 + 1) - 1)
      const theta = rng(seed + i * 5 + 2) * Math.PI * 2
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [seed, count, spread])

  return (
    <points position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color} size={0.20} transparent opacity={0.16}
        sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </points>
  )
}

// ── Atom model ────────────────────────────────────────────────────────────────
function Atom() {
  const groupRef = useRef(null)
  const e1 = useRef(null)
  const e2 = useRef(null)
  const e3 = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18
      groupRef.current.rotation.x = Math.sin(t * 0.09) * 0.12
    }
    if (e1.current) { const a = t * 0.85; e1.current.position.set(Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0) }
    if (e2.current) { const a = t * 0.55 + 1.0; e2.current.position.set(Math.cos(a) * 1.45, 0, Math.sin(a) * 1.45) }
    if (e3.current) {
      const a = t * 1.10 + 2.1
      e3.current.position.set(
        Math.cos(a) * 1.45 * Math.cos(Math.PI / 3),
        Math.sin(a) * 1.45,
        Math.cos(a) * 1.45 * Math.sin(Math.PI / 3),
      )
    }
  })

  return (
    <group ref={groupRef} position={[-8, 4, -5]}>
      <mesh><sphereGeometry args={[0.22, 14, 14]} /><meshStandardMaterial color="#4ff0ff" emissive="#4ff0ff" emissiveIntensity={1.4} /></mesh>
      <mesh rotation={[0, 0, 0]}><torusGeometry args={[1.45, 0.016, 8, 64]} /><meshBasicMaterial color="#4ff0ff" transparent opacity={0.40} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.45, 0.016, 8, 64]} /><meshBasicMaterial color="#a855f7" transparent opacity={0.40} /></mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}><torusGeometry args={[1.45, 0.016, 8, 64]} /><meshBasicMaterial color="#f472b6" transparent opacity={0.40} /></mesh>
      <mesh ref={e1}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#4ff0ff" emissive="#4ff0ff" emissiveIntensity={2.2} /></mesh>
      <mesh ref={e2}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2.2} /></mesh>
      <mesh ref={e3}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={2.2} /></mesh>
    </group>
  )
}

// ── DNA double helix ──────────────────────────────────────────────────────────
function DNAHelix() {
  const groupRef = useRef(null)

  const { s1pos, s2pos, rungArr, rungCount } = useMemo(() => {
    const N = 24
    const H = 5.8
    const R = 0.52
    const TURNS = 2.4
    const s1 = []; const s2 = []; const rungs = []

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1)
      const y = t * H - H / 2
      const a1 = t * TURNS * Math.PI * 2
      const a2 = a1 + Math.PI
      s1.push([Math.cos(a1) * R, y, Math.sin(a1) * R])
      s2.push([Math.cos(a2) * R, y, Math.sin(a2) * R])
      if (i % 2 === 0) {
        rungs.push(...s1[i], ...s2[i])
      }
    }

    const s1pos = new Float32Array(s1.flat())
    const s2pos = new Float32Array(s2.flat())
    const rungArr = new Float32Array(rungs)
    return { s1pos, s2pos, rungArr, rungCount: rungs.length / 3 }
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.22
  })

  return (
    <group ref={groupRef} position={[7.5, 2.5, -6]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={s1pos.length / 3} array={s1pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#34d399" size={0.12} transparent opacity={0.9} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={s2pos.length / 3} array={s2pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#f59e0b" size={0.12} transparent opacity={0.9} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={rungCount} array={rungArr} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.45} />
      </lineSegments>
    </group>
  )
}

// ── Large background wireframe structures ─────────────────────────────────────
function BackgroundOrb({ position, color, size, speed, geo }) {
  const ref = useRef(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.rotation.x = t * speed * 0.3
    ref.current.rotation.y = t * speed
    ref.current.rotation.z = t * speed * 0.18
  })
  return (
    <mesh ref={ref} position={position}>
      {geo === 'dodecahedron' ? <dodecahedronGeometry args={[size, 0]} />
        : geo === 'octahedron'  ? <octahedronGeometry  args={[size, 0]} />
        : geo === 'torusKnot'   ? <torusKnotGeometry   args={[size, size * 0.28, 80, 8]} />
        :                         <icosahedronGeometry  args={[size, 1]} />}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.07} />
    </mesh>
  )
}

// ── Floating robot head (hexagonal arrangement of nodes) ─────────────────────
function RoboticsCluster() {
  const groupRef = useRef(null)
  const nodes = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      pos: [(rng(i * 9) - 0.5) * 3.5, (rng(i * 9 + 1) - 0.5) * 3.5, (rng(i * 9 + 2) - 0.5) * 2],
      color: ['#f97316', '#fb923c', '#fdba74'][i % 3],
      size: 0.04 + rng(i * 9 + 3) * 0.06,
    })),
  [])

  const lineData = useMemo(() => {
    const THRESH = 2.2 * 2.2
    const v = []
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].pos[0] - nodes[j].pos[0]
        const dy = nodes[i].pos[1] - nodes[j].pos[1]
        const dz = nodes[i].pos[2] - nodes[j].pos[2]
        if (dx*dx + dy*dy + dz*dz < THRESH) v.push(...nodes[i].pos, ...nodes[j].pos)
      }
    return { arr: new Float32Array(v), count: v.length / 3 }
  }, [nodes])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.28
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.15) * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[-5, -5, -7]}>
      {lineData.count > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={lineData.count} array={lineData.arr} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#f97316" transparent opacity={0.20} />
        </lineSegments>
      )}
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <icosahedronGeometry args={[n.size, 0]} />
          <meshStandardMaterial color={n.color} emissive={n.color} emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ── Full cosmic scene ─────────────────────────────────────────────────────────
function CosmicScene({ mouseRef }) {
  const worldRef = useRef(null)

  useFrame(({ clock }) => {
    if (!worldRef.current) return
    const t = clock.elapsedTime
    worldRef.current.rotation.y = mouseRef.current.x * 0.06 + t * 0.003
    worldRef.current.rotation.x = mouseRef.current.y * -0.03
  })

  return (
    <>
      <color attach="background" args={['#000308']} />
      <ambientLight intensity={0.18} color="#b0c8ff" />
      <pointLight position={[  0,  0,  3]} intensity={1.8} color="#4466ff" distance={32} />
      <pointLight position={[ 10,  6, -8]} intensity={1.1} color="#ff44aa" distance={38} />
      <pointLight position={[ -8, -4, -6]} intensity={0.9} color="#44ffcc" distance={28} />
      <pointLight position={[  0,  9,-16]} intensity={0.7} color="#ffaa44" distance={45} />
      <pointLight position={[ -6, -6, -4]} intensity={0.6} color="#ff7733" distance={25} />

      <group ref={worldRef}>
        <ColoredStars />

        {/* Nebulae */}
        <NebulaCloud position={[  9,  5, -17]} color="#ff44aa" spread={5.8} count={300} seed={100} />
        <NebulaCloud position={[ -8, -4, -20]} color="#4488ff" spread={6.2} count={260} seed={200} />
        <NebulaCloud position={[  2,  9, -22]} color="#44ffaa" spread={4.8} count={220} seed={300} />
        <NebulaCloud position={[ -4, -9, -14]} color="#ffaa33" spread={4.2} count={190} seed={400} />

        {/* Galaxy */}
        <Galaxy />

        {/* Science elements */}
        <Atom />
        <DNAHelix />
        <RoboticsCluster />

        {/* Background wireframe structures */}
        <BackgroundOrb position={[-13,  6, -22]} color="#6366f1" size={4.8} speed={0.055} geo="icosahedron"  />
        <BackgroundOrb position={[ 15, -7, -24]} color="#06b6d4" size={4.0} speed={0.045} geo="dodecahedron" />
        <BackgroundOrb position={[ -3,-11, -19]} color="#a855f7" size={3.2} speed={0.080} geo="octahedron"   />
        <BackgroundOrb position={[  7, 10, -26]} color="#f472b6" size={3.6} speed={0.038} geo="torusKnot"    />
        <BackgroundOrb position={[ 11,  3, -18]} color="#34d399" size={2.8} speed={0.065} geo="icosahedron"  />
      </group>
    </>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function UniverseBackground() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handle = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', handle)
    return () => window.removeEventListener('pointermove', handle)
  }, [])

  return (
    <div className="fixed inset-0 z-0 bg-[#000308]" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 16], fov: 60, near: 0.1, far: 110 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <CosmicScene mouseRef={mouseRef} />
      </Canvas>
      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_42%,transparent_18%,rgba(0,3,8,0.60)_100%)]" />
      {/* Bottom fade — keeps text readable */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,3,8,0.15)_0%,rgba(0,3,8,0.78)_100%)]" />
    </div>
  )
}
