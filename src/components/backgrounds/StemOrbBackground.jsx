import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const THEME = {
  dark: {
    bg: '#010818',
    vignette: '1,8,24',
    vR: 0.6, vL1: 0.25, vL2: 0.72,
    ambient: '#c0ccff',
    ambientIntensity: 0.35,
    light1: { color: '#6366f1', intensity: 1.4 },
    light2: { color: '#06b6d4', intensity: 0.9 },
    light3: { color: '#8b5cf6', intensity: 0.7 },
    starColor: '#9ba8ff',
    starOpacity: 0.55,
    lineColor: '#5b58ff',
    lineOpacity: 0.13,
    emissiveIntensity: 0.55,
    wireOpacity: 0.09,
  },
  light: {
    bg: '#f0f4ff',
    vignette: '240,244,255',
    vR: 0.04, vL1: 0, vL2: 0.06,
    ambient: '#8090d0',
    ambientIntensity: 0.9,
    light1: { color: '#6366f1', intensity: 0.4 },
    light2: { color: '#06b6d4', intensity: 0.25 },
    light3: { color: '#8b5cf6', intensity: 0.2 },
    starColor: '#4050b0',
    starOpacity: 0.18,
    lineColor: '#3333aa',
    lineOpacity: 0.07,
    emissiveIntensity: 0.12,
    wireOpacity: 0.05,
  },
}

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')))
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const NODE_COLORS = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#a855f7', // purple
  '#38bdf8', // sky
  '#4f46e5', // indigo-deep
]

// Deterministic pseudo-random — same scene every render
function rng(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// ── Single spinning icosahedron node ─────────────────────────────────────────
function SpinningNode({ pos, color, size, spinSpeed, emissiveIntensity = 0.55 }) {
  const ref = useRef(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.rotation.y = t * spinSpeed
    ref.current.rotation.x = t * spinSpeed * 0.6
    ref.current.rotation.z = t * spinSpeed * 0.3
  })
  return (
    <mesh ref={ref} position={pos}>
      <icosahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.15}
        metalness={0.88}
      />
    </mesh>
  )
}

// ── Large background wireframe polyhedra ─────────────────────────────────────
function WireframePoly({ position, color, size, spinSpeed, type, wireOpacity = 0.09 }) {
  const ref = useRef(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.rotation.x = t * spinSpeed * 0.4
    ref.current.rotation.y = t * spinSpeed
  })
  return (
    <mesh ref={ref} position={position}>
      {type === 'dodecahedron' ? (
        <dodecahedronGeometry args={[size, 0]} />
      ) : type === 'octahedron' ? (
        <octahedronGeometry args={[size, 0]} />
      ) : (
        <icosahedronGeometry args={[size, 1]} />
      )}
      <meshBasicMaterial color={color} wireframe transparent opacity={wireOpacity} />
    </mesh>
  )
}

// ── Starfield ────────────────────────────────────────────────────────────────
function Stars({ color, opacity }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      arr[i * 3]     = (rng(i * 3)     - 0.5) * 90
      arr[i * 3 + 1] = (rng(i * 3 + 1) - 0.5) * 70
      arr[i * 3 + 2] = -25 - rng(i * 3 + 2) * 25
    }
    return arr
  }, [])
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={600} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.055} transparent opacity={opacity} sizeAttenuation />
    </points>
  )
}

// ── Knowledge graph (nodes + static connections) ─────────────────────────────
function KnowledgeGraph({ mouseRef, T }) {
  const groupRef = useRef(null)

  const nodes = useMemo(() =>
    Array.from({ length: 44 }, (_, i) => ({
      pos: [
        (rng(i * 5)     - 0.5) * 22,
        (rng(i * 5 + 1) - 0.5) * 14,
        (rng(i * 5 + 2) - 0.5) * 12 - 3,
      ],
      color:     NODE_COLORS[i % NODE_COLORS.length],
      size:      0.07 + rng(i * 5 + 3) * 0.12,
      spinSpeed: 0.28 + rng(i * 5 + 4) * 0.55,
    }))
  , [])

  // Static edges computed once
  const lineData = useMemo(() => {
    const THRESH_SQ = 6.8 * 6.8
    const verts = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].pos[0] - nodes[j].pos[0]
        const dy = nodes[i].pos[1] - nodes[j].pos[1]
        const dz = nodes[i].pos[2] - nodes[j].pos[2]
        if (dx * dx + dy * dy + dz * dz < THRESH_SQ) {
          verts.push(...nodes[i].pos, ...nodes[j].pos)
        }
      }
    }
    const arr = new Float32Array(verts)
    return { arr, count: arr.length / 3 }
  }, [nodes])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRef.current.rotation.y = t * 0.05 + mouseRef.current.x * 0.16
    groupRef.current.rotation.x = mouseRef.current.y * -0.09
  })

  return (
    <group ref={groupRef}>
      {lineData.count > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={lineData.count}
              array={lineData.arr}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={T.lineColor} transparent opacity={T.lineOpacity} />
        </lineSegments>
      )}
      {nodes.map((node, i) => (
        <SpinningNode key={i} {...node} emissiveIntensity={T.emissiveIntensity} />
      ))}
    </group>
  )
}

function Scene({ mouseRef, T }) {
  return (
    <>
      <color attach="background" args={[T.bg]} />
      <ambientLight intensity={T.ambientIntensity} color={T.ambient} />
      <pointLight position={[0, 0, 2]}   intensity={T.light1.intensity} color={T.light1.color} distance={28} />
      <pointLight position={[9, -4, -6]} intensity={T.light2.intensity} color={T.light2.color} distance={22} />
      <pointLight position={[-9, 4, -8]} intensity={T.light3.intensity} color={T.light3.color} distance={20} />
      <Stars color={T.starColor} opacity={T.starOpacity} />
      <WireframePoly position={[-8,  4, -14]} color="#6366f1" size={3.2} spinSpeed={0.10} type="icosahedron"  wireOpacity={T.wireOpacity} />
      <WireframePoly position={[ 9, -3, -16]} color="#06b6d4" size={2.5} spinSpeed={0.08} type="dodecahedron" wireOpacity={T.wireOpacity} />
      <WireframePoly position={[ 2, -7, -11]} color="#8b5cf6" size={2.0} spinSpeed={0.14} type="octahedron"   wireOpacity={T.wireOpacity} />
      <WireframePoly position={[-4,  7, -18]} color="#38bdf8" size={2.8} spinSpeed={0.07} type="icosahedron"  wireOpacity={T.wireOpacity} />
      <KnowledgeGraph mouseRef={mouseRef} T={T} />
    </>
  )
}

export default function StemOrbBackground() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const isDark = useIsDark()
  const T = THEME[isDark ? 'dark' : 'light']

  useEffect(() => {
    const handle = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', handle)
    return () => window.removeEventListener('pointermove', handle)
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: T.bg }} aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 14], fov: 55, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene mouseRef={mouseRef} T={T} />
      </Canvas>
      {/* Vignette + depth fade */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, rgba(${T.vignette},${T.vR}) 100%)` }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(${T.vignette},${T.vL1}) 0%, rgba(${T.vignette},${T.vL2}) 100%)` }} />
    </div>
  )
}
