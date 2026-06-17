import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const THEME = {
  dark: {
    bg: '#080506',
    vignette: '8,5,6',
    vR1: 0.18, vR2: 0.86, vL1: 0.14, vL2: 0.76,
    fogColor: '#080506',
    ambient: '#ffdfb0',
    ambientIntensity: 0.36,
    dirLight: { color: '#fff0c8', intensity: 1.15 },
    spotLight1: { color: '#ffd38c', intensity: 2.4 },
    spotLight2: { color: '#8ecae6', intensity: 1.15 },
    dustColor: '#ffe9b8',
  },
  light: {
    bg: '#faf7f1',
    vignette: '250,247,241',
    vR1: 0, vR2: 0.04, vL1: 0, vL2: 0.06,
    fogColor: '#faf7f1',
    ambient: '#f0d8a8',
    ambientIntensity: 1.1,
    dirLight: { color: '#fffaee', intensity: 1.5 },
    spotLight1: { color: '#ffe8c0', intensity: 1.8 },
    spotLight2: { color: '#c8e8ff', intensity: 0.8 },
    dustColor: '#c8a060',
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

const BOOK_COLORS = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#4a4e69', '#8ecae6', '#b5838d']

function Book({ position, rotation, size, color, phase, mouseRef }) {
  const ref = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pull = Math.max(0, 1 - Math.abs(mouseRef.current.x - phase) * 2.6)
    ref.current.position.z = position[2] + pull * 0.22 + Math.sin(t * 0.7 + phase * 8) * 0.015
    ref.current.rotation.y = rotation[1] + pull * 0.055
  })

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.58} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, size[2] * 0.51]}>
        <boxGeometry args={[size[0] * 0.72, size[1] * 0.84, 0.012]} />
        <meshStandardMaterial color="#fff4d6" roughness={0.8} />
      </mesh>
      <mesh position={[0, size[1] * 0.2, size[2] * 0.525]}>
        <boxGeometry args={[size[0] * 0.08, size[1] * 0.52, 0.014]} />
        <meshBasicMaterial color="#f8d66d" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function CurvedBookshelves({ mouseRef }) {
  const books = useMemo(() => {
    const built = []
    const columns = 34
    const shelves = 4
    const radius = 9.2

    for (let col = 0; col < columns; col += 1) {
      const angle = THREE.MathUtils.lerp(-1.26, 1.26, col / (columns - 1))
      const x = Math.sin(angle) * radius
      const z = -Math.cos(angle) * radius - 1.5
      const yaw = -angle

      for (let row = 0; row < shelves; row += 1) {
        const baseY = 1.05 + row * 1.12
        const height = 0.72 + ((col * 13 + row * 7) % 9) * 0.035
        const width = 0.18 + ((col * 5 + row * 3) % 5) * 0.025
        built.push({
          key: `${col}-${row}`,
          position: [
            x + Math.cos(angle) * ((col % 3) * 0.035 - 0.035),
            baseY + height * 0.5,
            z,
          ],
          rotation: [0, yaw, 0],
          size: [width, height, 0.48],
          color: BOOK_COLORS[(col + row * 2) % BOOK_COLORS.length],
          phase: col / (columns - 1) * 2 - 1,
        })
      }
    }

    return built
  }, [])

  const shelves = useMemo(() => {
    return Array.from({ length: 4 }, (_, row) => {
      const y = 1 + row * 1.12
      return Array.from({ length: 15 }, (_, index) => {
        const angle = THREE.MathUtils.lerp(-1.32, 1.32, index / 14)
        return {
          key: `${row}-${index}`,
          position: [Math.sin(angle) * 9.2, y, -Math.cos(angle) * 9.2 - 1.56],
          rotation: [0, -angle, 0],
        }
      })
    }).flat()
  }, [])

  return (
    <>
      {shelves.map((shelf) => (
        <mesh key={shelf.key} position={shelf.position} rotation={shelf.rotation} receiveShadow>
          <boxGeometry args={[1.25, 0.08, 0.62]} />
          <meshStandardMaterial color="#4b3426" roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
      {books.map((book) => (
        <Book key={book.key} {...book} mouseRef={mouseRef} />
      ))}
    </>
  )
}

function LibraryRoom() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -1]} receiveShadow>
        <planeGeometry args={[28, 24]} />
        <meshStandardMaterial color="#19110d" roughness={0.66} />
      </mesh>
      <mesh position={[0, 2.75, -10.45]} receiveShadow>
        <boxGeometry args={[22, 5.8, 0.18]} />
        <meshStandardMaterial color="#120d13" roughness={0.78} />
      </mesh>
      <mesh position={[-10.2, 2.75, -4.4]} rotation-y={Math.PI / 3.1} receiveShadow>
        <boxGeometry args={[12, 5.8, 0.18]} />
        <meshStandardMaterial color="#161017" roughness={0.78} />
      </mesh>
      <mesh position={[10.2, 2.75, -4.4]} rotation-y={-Math.PI / 3.1} receiveShadow>
        <boxGeometry args={[12, 5.8, 0.18]} />
        <meshStandardMaterial color="#161017" roughness={0.78} />
      </mesh>
      <gridHelper args={[24, 24, '#8a6142', '#302118']} position={[0, 0.01, -1]} />
    </>
  )
}

function OpenBook({ mouseRef }) {
  const left = useRef(null)
  const right = useRef(null)
  const turning = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const influence = mouseRef.current.x * 0.18
    left.current.rotation.z = 0.17 + influence
    right.current.rotation.z = -0.17 + influence
    turning.current.rotation.y = -0.95 + Math.sin(t * 1.45) * 0.82 + mouseRef.current.x * 0.35
    turning.current.position.y = 0.43 + Math.sin(t * 1.45) * 0.05
  })

  return (
    <group position={[0, 0.38, 3.15]} rotation-x={-0.22}>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.16, 2.4]} />
        <meshStandardMaterial color="#3a2418" roughness={0.62} />
      </mesh>
      <mesh ref={left} position={[-0.92, 0.04, 0]} rotation-z={0.17} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.035, 2.18]} />
        <meshStandardMaterial color="#f2dfbd" roughness={0.82} />
      </mesh>
      <mesh ref={right} position={[0.92, 0.04, 0]} rotation-z={-0.17} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.035, 2.18]} />
        <meshStandardMaterial color="#f5e6c8" roughness={0.82} />
      </mesh>
      <mesh ref={turning} position={[0.24, 0.43, 0]} rotation-z={-0.07} castShadow>
        <boxGeometry args={[1.62, 0.018, 2.08]} />
        <meshStandardMaterial color="#fff1d4" roughness={0.78} side={THREE.DoubleSide} />
      </mesh>
      {[-0.62, -0.22, 0.28, 0.66].map((x, index) => (
        <mesh key={x} position={[x, 0.49, -0.62 + index * 0.32]}>
          <boxGeometry args={[0.55, 0.012, 0.018]} />
          <meshBasicMaterial color="#6d5135" transparent opacity={0.5} />
        </mesh>
      ))}
      <pointLight color="#ffd68a" intensity={1.5} distance={5} position={[0, 0.8, 0.2]} />
    </group>
  )
}

function FloatingDust({ mouseRef, color }) {
  const ref = useRef(null)
  const positions = useMemo(() => {
    const values = new Float32Array(330)
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * 18
      values[i + 1] = Math.random() * 5.4 + 0.4
      values[i + 2] = -Math.random() * 10 + 1.5
    }
    return values
  }, [])

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.018 + mouseRef.current.x * 0.04
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.026} transparent opacity={0.58} />
    </points>
  )
}

function CameraRig({ mouseRef }) {
  useFrame(({ camera }) => {
    const pan = mouseRef.current.x
    const lookTarget = new THREE.Vector3(pan * 4.2, 2.05 + mouseRef.current.y * 0.35, -6.7)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pan * 2.7, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.8 + mouseRef.current.y * 0.2, 0.06)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.2, 0.06)
    camera.lookAt(lookTarget)
  })
  return null
}

function Scene({ mouseRef, T }) {
  return (
    <>
      <color attach="background" args={[T.fogColor]} />
      <fog attach="fog" args={[T.fogColor, 8, 22]} />
      <ambientLight intensity={T.ambientIntensity} color={T.ambient} />
      <directionalLight position={[-4, 7, 5]} intensity={T.dirLight.intensity} color={T.dirLight.color} castShadow />
      <spotLight position={[0, 6.2, 2.5]} angle={0.56} penumbra={0.7} intensity={T.spotLight1.intensity} color={T.spotLight1.color} castShadow />
      <spotLight position={[-5, 4.4, -1]} angle={0.45} penumbra={0.8} intensity={T.spotLight2.intensity} color={T.spotLight2.color} />
      <LibraryRoom />
      <CurvedBookshelves mouseRef={mouseRef} />
      <OpenBook mouseRef={mouseRef} />
      <FloatingDust mouseRef={mouseRef} color={T.dustColor} />
      <CameraRig mouseRef={mouseRef} />
    </>
  )
}

export default function MathReferenceBackground() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const isDark = useIsDark()
  const T = THEME[isDark ? 'dark' : 'light']

  useEffect(() => {
    const handlePointer = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('pointermove', handlePointer)
    return () => window.removeEventListener('pointermove', handlePointer)
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: T.bg }} aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 2.8, 7.2], fov: 48, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene mouseRef={mouseRef} T={T} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 56%, transparent 0%, rgba(${T.vignette},${T.vR1}) 38%, rgba(${T.vignette},${T.vR2}) 100%)` }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(${T.vignette},${T.vL1}), rgba(${T.vignette},${T.vL2}))` }} />
    </div>
  )
}
