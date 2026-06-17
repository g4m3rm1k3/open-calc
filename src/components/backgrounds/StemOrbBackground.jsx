import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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
function SpinningNode({ pos, color, size, spinSpeed }) {
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
        emissiveIntensity={0.55}
        roughness={0.15}
        metalness={0.88}
      />
    </mesh>
  )
}

// ── Large background wireframe polyhedra ─────────────────────────────────────
function WireframePoly({ position, color, size, spinSpeed, type }) {
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
      <meshBasicMaterial color={color} wireframe transparent opacity={0.09} />
    </mesh>
  )
}

// ── Starfield ────────────────────────────────────────────────────────────────
function Stars() {
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
      <pointsMaterial color="#9ba8ff" size={0.055} transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}

// ── Knowledge graph (nodes + static connections) ─────────────────────────────
function KnowledgeGraph({ mouseRef }) {
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
          <lineBasicMaterial color="#5b58ff" transparent opacity={0.13} />
        </lineSegments>
      )}
      {nodes.map((node, i) => (
        <SpinningNode key={i} {...node} />
      ))}
    </group>
  )
}

function Scene({ mouseRef }) {
  return (
    <>
      <color attach="background" args={['#010818']} />
      <ambientLight intensity={0.35} color="#c0ccff" />
      <pointLight position={[0, 0, 2]}   intensity={1.4} color="#6366f1" distance={28} />
      <pointLight position={[9, -4, -6]} intensity={0.9} color="#06b6d4" distance={22} />
      <pointLight position={[-9, 4, -8]} intensity={0.7} color="#8b5cf6" distance={20} />
      <Stars />
      <WireframePoly position={[-8,  4, -14]} color="#6366f1" size={3.2} spinSpeed={0.10} type="icosahedron"  />
      <WireframePoly position={[ 9, -3, -16]} color="#06b6d4" size={2.5} spinSpeed={0.08} type="dodecahedron" />
      <WireframePoly position={[ 2, -7, -11]} color="#8b5cf6" size={2.0} spinSpeed={0.14} type="octahedron"   />
      <WireframePoly position={[-4,  7, -18]} color="#38bdf8" size={2.8} spinSpeed={0.07} type="icosahedron"  />
      <KnowledgeGraph mouseRef={mouseRef} />
    </>
  )
}

export default function StemOrbBackground() {
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
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#010818]" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 14], fov: 55, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene mouseRef={mouseRef} />
      </Canvas>
      {/* Vignette + depth fade */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_20%,rgba(1,8,24,0.6)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,8,24,0.25)_0%,rgba(1,8,24,0.72)_100%)]" />
    </div>
  )
}
