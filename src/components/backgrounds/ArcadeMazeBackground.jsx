import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const THEME = {
  dark: {
    bg: '#020710',
    vignette: '2,7,16',
    vR1: 0.08, vR2: 0.76, vL1: 0.18, vL2: 0.68,
    fogColor: '#020710',
    ambient: '#7be4ff',
    ambientIntensity: 0.38,
    dirLight: { color: '#e5fff8', intensity: 1.65 },
    spotLight: { color: '#36ffcf', intensity: 2.2 },
    floorColor: '#030b1a',
    wallColor: '#0a1f3c',
    wallEmissive: '#001428',
    accentA: '#00f0ff',
    accentB: '#ffcf4a',
  },
  light: {
    bg: '#e8f4ff',
    vignette: '232,244,255',
    vR1: 0, vR2: 0.04, vL1: 0, vL2: 0.06,
    fogColor: '#e8f4ff',
    ambient: '#a0d8f0',
    ambientIntensity: 0.85,
    dirLight: { color: '#f0f8ff', intensity: 1.2 },
    spotLight: { color: '#60d8c0', intensity: 1.4 },
    floorColor: '#c8e8f8',
    wallColor: '#90bcd8',
    wallEmissive: '#6090b0',
    accentA: '#0090c8',
    accentB: '#e8a000',
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

const MAZE = [
  '#################',
  '#.....#.........#',
  '#.###.#.#####.#.#',
  '#.#...#.....#.#.#',
  '#.#.#####.#.#.#.#',
  '#...#.....#...#.#',
  '###.#.#######.#.#',
  '#...#...#.....#.#',
  '#.#####.#.#####.#',
  '#.....#...#.....#',
  '#.###.#####.###.#',
  '#...#.......#...#',
  '#################',
]

const CELL = 1.25
const ROWS = MAZE.length
const COLS = MAZE[0].length
const HALF_W = (COLS - 1) * CELL * 0.5
const HALF_H = (ROWS - 1) * CELL * 0.5
const START_CELL = { row: 1, col: 1 }
const DIRECTIONS = {
  ArrowUp: { row: -1, col: 0, angle: Math.PI },
  ArrowDown: { row: 1, col: 0, angle: 0 },
  ArrowLeft: { row: 0, col: -1, angle: -Math.PI / 2 },
  ArrowRight: { row: 0, col: 1, angle: Math.PI / 2 },
}

function cellToWorld(row, col) {
  return {
    x: col * CELL - HALF_W,
    z: row * CELL - HALF_H,
  }
}

function canMove(row, col) {
  return MAZE[row]?.[col] === '.'
}

function MazeWalls({ T }) {
  const cells = useMemo(() => {
    const wallCells = []
    const pelletCells = []

    MAZE.forEach((line, row) => {
      Array.from(line).forEach((cell, col) => {
        const world = cellToWorld(row, col)
        if (cell === '#') wallCells.push(world)
        else if ((row + col) % 2 === 0) pelletCells.push(world)
      })
    })

    return { wallCells, pelletCells }
  }, [])

  const wallRef = useRef(null)
  const pelletRef = useRef(null)
  const wallDummy = useMemo(() => new THREE.Object3D(), [])
  const pelletDummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    cells.wallCells.forEach((cell, index) => {
      wallDummy.position.set(cell.x, 0.42, cell.z)
      wallDummy.scale.set(1, 1, 1)
      wallDummy.updateMatrix()
      wallRef.current.setMatrixAt(index, wallDummy.matrix)
    })
    wallRef.current.instanceMatrix.needsUpdate = true

    cells.pelletCells.forEach((cell, index) => {
      pelletDummy.position.set(cell.x, 0.11, cell.z)
      pelletDummy.scale.set(1, 1, 1)
      pelletDummy.updateMatrix()
      pelletRef.current.setMatrixAt(index, pelletDummy.matrix)
    })
    pelletRef.current.instanceMatrix.needsUpdate = true
  }, [cells, pelletDummy, wallDummy])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (wallRef.current) {
      wallRef.current.rotation.y = Math.sin(t * 0.18) * 0.006
    }
    if (pelletRef.current) {
      pelletRef.current.rotation.y = t * 0.02
    }
  })

  return (
    <>
      <instancedMesh ref={wallRef} args={[null, null, cells.wallCells.length]} castShadow receiveShadow>
        <boxGeometry args={[CELL * 0.88, 0.84, CELL * 0.88]} />
        <meshStandardMaterial
          color={T.wallColor}
          emissive={T.wallEmissive}
          emissiveIntensity={0.22}
          roughness={0.38}
          metalness={0.25}
        />
      </instancedMesh>
      <instancedMesh ref={pelletRef} args={[null, null, cells.pelletCells.length]}>
        <sphereGeometry args={[0.095, 14, 10]} />
        <meshStandardMaterial
          color="#fff3a1"
          emissive={T.accentB}
          emissiveIntensity={1.2}
          roughness={0.18}
        />
      </instancedMesh>
    </>
  )
}

function MazeFloor({ T }) {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[COLS * CELL + 7, ROWS * CELL + 7, 64, 64]} />
        <meshStandardMaterial color={T.floorColor} roughness={0.65} metalness={0.18} />
      </mesh>
      <gridHelper
        args={[Math.max(COLS, ROWS) * CELL + 7, 42, '#18f2d0', '#164762']}
        position={[0, 0.015, 0]}
      />
      <mesh position={[0, -0.025, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[4.6, 10.8, 96]} />
        <meshBasicMaterial color="#123cff" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function Player({ gameRef, mouseRef }) {
  const group = useRef(null)
  const mouth = useRef(null)

  useFrame(({ clock }, delta) => {
    const state = gameRef.current
    const activeDirection = state.queuedDirection ?? state.direction
    const nextRow = state.cell.row + activeDirection.row
    const nextCol = state.cell.col + activeDirection.col

    if (canMove(nextRow, nextCol)) {
      state.direction = activeDirection
    } else {
      const options = Object.values(DIRECTIONS).filter((dir) =>
        canMove(state.cell.row + dir.row, state.cell.col + dir.col)
      )
      state.direction = options[Math.floor(clock.elapsedTime * 0.85) % options.length] ?? state.direction
    }

    state.progress += delta * 2.25
    if (state.progress >= 1) {
      state.cell = {
        row: state.cell.row + state.direction.row,
        col: state.cell.col + state.direction.col,
      }
      state.progress = 0
      state.queuedDirection = null
    }

    const from = cellToWorld(state.cell.row, state.cell.col)
    const to = cellToWorld(
      state.cell.row + state.direction.row,
      state.cell.col + state.direction.col
    )
    const eased = THREE.MathUtils.smoothstep(state.progress, 0, 1)
    const bob = Math.sin(clock.elapsedTime * 9) * 0.08

    group.current.position.set(
      THREE.MathUtils.lerp(from.x, to.x, eased),
      0.48 + bob,
      THREE.MathUtils.lerp(from.z, to.z, eased)
    )
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      state.direction.angle + mouseRef.current.x * 0.16,
      0.16
    )
    group.current.rotation.z = -mouseRef.current.x * 0.12

    mouth.current.scale.setScalar(0.85 + Math.abs(Math.sin(clock.elapsedTime * 10)) * 0.24)
  })

  return (
    <group ref={group} castShadow>
      <mesh castShadow>
        <sphereGeometry args={[0.45, 36, 24]} />
        <meshStandardMaterial
          color="#9eff4f"
          emissive="#4cff8c"
          emissiveIntensity={0.85}
          roughness={0.22}
          metalness={0.12}
        />
      </mesh>
      <mesh ref={mouth} position={[0, 0.04, 0.37]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.2, 0.42, 3]} />
        <meshStandardMaterial color="#03101d" emissive="#03101d" roughness={0.4} />
      </mesh>
      <pointLight color="#a7ff65" intensity={1.8} distance={5} />
    </group>
  )
}

function SentryDrones({ mouseRef }) {
  const drones = useMemo(
    () => [
      { color: '#ff3974', radius: 5.8, speed: 0.58, offset: 0 },
      { color: '#00c2ff', radius: 6.9, speed: -0.42, offset: 2.1 },
      { color: '#ffb11b', radius: 4.2, speed: 0.72, offset: 4.0 },
    ],
    []
  )

  return (
    <>
      {drones.map((drone) => (
        <Drone key={drone.color} drone={drone} mouseRef={mouseRef} />
      ))}
    </>
  )
}

function Drone({ drone, mouseRef }) {
  const ref = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * drone.speed + drone.offset
    ref.current.position.set(
      Math.cos(t) * drone.radius + mouseRef.current.x * 0.7,
      0.78 + Math.sin(t * 2.2) * 0.2,
      Math.sin(t) * drone.radius + mouseRef.current.y * 0.7
    )
    ref.current.rotation.y = -t * 1.6
    ref.current.rotation.x = Math.sin(t) * 0.25
  })

  return (
    <group ref={ref}>
      <mesh castShadow>
        <octahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial
          color={drone.color}
          emissive={drone.color}
          emissiveIntensity={0.75}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.48, 0.025, 8, 36]} />
        <meshBasicMaterial color={drone.color} transparent opacity={0.7} />
      </mesh>
      <pointLight color={drone.color} intensity={1.2} distance={4.5} />
    </group>
  )
}

function CameraRig({ mouseRef }) {
  useFrame(({ camera, scene, clock }) => {
    const t = clock.elapsedTime
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 2.2, 0.055)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 10.4 + mouseRef.current.y * 0.8, 0.055)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10.8 + Math.sin(t * 0.3) * 0.6, 0.04)
    camera.lookAt(mouseRef.current.x * 1.5, 0, mouseRef.current.y * 1.2)
    scene.rotation.z = THREE.MathUtils.lerp(scene.rotation.z, mouseRef.current.x * 0.018, 0.06)
  })
  return null
}

function EnergyTrails({ T }) {
  const rings = useMemo(() => Array.from({ length: 7 }, (_, i) => i), [])

  return (
    <>
      {rings.map((index) => (
        <TrailRing key={index} index={index} T={T} />
      ))}
    </>
  )
}

function TrailRing({ index, T }) {
  const ref = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (0.35 + index * 0.025)
    const radius = 2.8 + index * 0.72
    ref.current.position.set(Math.cos(t + index) * radius, 0.035, Math.sin(t + index) * radius)
    ref.current.rotation.z = t
    ref.current.scale.setScalar(0.8 + Math.sin(t * 2) * 0.12)
  })

  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2}>
      <torusGeometry args={[0.24, 0.018, 8, 28]} />
      <meshBasicMaterial color={index % 2 ? T.accentA : T.accentB} transparent opacity={0.65} />
    </mesh>
  )
}

function Scene({ gameRef, mouseRef, T }) {
  return (
    <>
      <color attach="background" args={[T.fogColor]} />
      <fog attach="fog" args={[T.fogColor, 8, 24]} />
      <ambientLight intensity={T.ambientIntensity} color={T.ambient} />
      <directionalLight
        position={[-4, 9, 6]}
        intensity={T.dirLight.intensity}
        color={T.dirLight.color}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight position={[5, 8, 6]} angle={0.55} penumbra={0.65} intensity={T.spotLight.intensity} color={T.spotLight.color} />
      <MazeFloor T={T} />
      <MazeWalls T={T} />
      <EnergyTrails T={T} />
      <Player gameRef={gameRef} mouseRef={mouseRef} />
      <SentryDrones mouseRef={mouseRef} />
      <CameraRig mouseRef={mouseRef} />
    </>
  )
}

export default function ArcadeMazeBackground() {
  const isDark = useIsDark()
  const T = THEME[isDark ? 'dark' : 'light']

  const mouseRef = useRef({ x: 0, y: 0 })
  const gameRef = useRef({
    cell: START_CELL,
    direction: DIRECTIONS.ArrowRight,
    queuedDirection: null,
    progress: 0,
  })

  useEffect(() => {
    const handlePointer = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }

    const handleKey = (event) => {
      const next = DIRECTIONS[event.key]
      if (!next) return
      event.preventDefault()
      gameRef.current.queuedDirection = next
    }

    window.addEventListener('pointermove', handlePointer)
    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: T.bg }} aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 10.4, 10.8], fov: 45, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene gameRef={gameRef} mouseRef={mouseRef} T={T} />
      </Canvas>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 52% 42%, transparent 0%, rgba(${T.vignette},${T.vR1}) 35%, rgba(${T.vignette},${T.vR2}) 100%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(180deg, rgba(${T.vignette},${T.vL1}), rgba(${T.vignette},${T.vL2}))` }}
      />
    </div>
  )
}
