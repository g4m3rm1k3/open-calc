import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WorkbenchGrid() {
  const scanRef = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    scanRef.current.position.z = ((Math.sin(t * 0.55) + 1) * 0.5 - 0.5) * 15
    scanRef.current.material.opacity = 0.12 + Math.sin(t * 2) * 0.035
  })

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[32, 24, 80, 80]} />
        <meshStandardMaterial color="#061814" roughness={0.58} metalness={0.18} />
      </mesh>
      <gridHelper args={[30, 48, '#5fffe0', '#174c45']} position={[0, 0.018, 0]} />
      <mesh ref={scanRef} position={[0, 0.04, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[30, 1.2]} />
        <meshBasicMaterial color="#72ffe7" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function Molecule({ position, scale = 1, speed = 1, mouseRef }) {
  const group = useRef(null)
  const atoms = useMemo(
    () => [
      { p: [0, 0, 0], r: 0.34, color: '#55ffe0' },
      { p: [0.8, 0.32, 0.15], r: 0.2, color: '#fff5b0' },
      { p: [-0.78, -0.26, -0.08], r: 0.2, color: '#ff8fb8' },
      { p: [0.1, 0.72, -0.7], r: 0.24, color: '#9fd1ff' },
    ],
    []
  )
  const bonds = useMemo(
    () => [
      { p: [0.38, 0.16, 0.07], rot: [1.24, 0.16, -1.18], length: 0.9 },
      { p: [-0.38, -0.13, -0.04], rot: [1.42, -0.1, 1.24], length: 0.86 },
      { p: [0.05, 0.36, -0.35], rot: [0.72, 0.04, -0.12], length: 1.02 },
    ],
    []
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    group.current.rotation.y = t * 0.52 + mouseRef.current.x * 0.3
    group.current.rotation.x = Math.sin(t * 0.8) * 0.25 + mouseRef.current.y * 0.15
    group.current.position.y = position[1] + Math.sin(t * 1.7) * 0.18
  })

  return (
    <group ref={group} position={position} scale={scale}>
      {bonds.map((bond, index) => (
        <mesh key={index} position={bond.p} rotation={bond.rot}>
          <cylinderGeometry args={[0.045, 0.045, bond.length, 14]} />
          <meshStandardMaterial color="#dffcf7" emissive="#7fffe8" emissiveIntensity={0.2} roughness={0.22} />
        </mesh>
      ))}
      {atoms.map((atom, index) => (
        <mesh key={index} position={atom.p} castShadow>
          <sphereGeometry args={[atom.r, 28, 18]} />
          <meshStandardMaterial
            color={atom.color}
            emissive={atom.color}
            emissiveIntensity={0.45}
            roughness={0.18}
            metalness={0.08}
          />
        </mesh>
      ))}
      <pointLight color="#69ffe2" intensity={0.9} distance={5} />
    </group>
  )
}

function ReactorCore({ mouseRef }) {
  const group = useRef(null)
  const ringA = useRef(null)
  const ringB = useRef(null)
  const liquid = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current.rotation.y = mouseRef.current.x * 0.28
    group.current.rotation.x = mouseRef.current.y * 0.12
    ringA.current.rotation.z = t * 0.75
    ringB.current.rotation.x = t * 0.58
    ringB.current.rotation.y = t * 0.42
    liquid.current.position.y = -0.42 + Math.sin(t * 1.7) * 0.035
    liquid.current.scale.x = 1 + Math.sin(t * 1.4) * 0.025
  })

  return (
    <group ref={group} position={[2.8, 1.15, -1.1]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.82, 0.82, 1.85, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#bffdf6"
          roughness={0.05}
          metalness={0}
          transmission={0.55}
          transparent
          opacity={0.34}
        />
      </mesh>
      <mesh ref={liquid} position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.65, 48]} />
        <meshStandardMaterial
          color="#29ffd2"
          emissive="#14f7bf"
          emissiveIntensity={0.72}
          transparent
          opacity={0.72}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={ringA} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.12, 0.026, 10, 72]} />
        <meshBasicMaterial color="#64ffe4" transparent opacity={0.72} />
      </mesh>
      <mesh ref={ringB} rotation-y={Math.PI / 2}>
        <torusGeometry args={[1.38, 0.018, 10, 72]} />
        <meshBasicMaterial color="#faff9a" transparent opacity={0.46} />
      </mesh>
      <pointLight color="#2dffd3" intensity={2.3} distance={7} />
    </group>
  )
}

function DataPanels() {
  const panels = useMemo(
    () => [
      { position: [-4.8, 1.15, -2.5], rotation: [0, 0.42, 0], color: '#60ffe3' },
      { position: [-3.4, 2.4, -3.9], rotation: [0.08, 0.25, 0], color: '#ffd36a' },
      { position: [4.8, 2.2, -3.2], rotation: [0.05, -0.38, 0], color: '#9cc7ff' },
    ],
    []
  )

  return (
    <>
      {panels.map((panel, index) => (
        <mesh key={index} position={panel.position} rotation={panel.rotation}>
          <planeGeometry args={[2.1, 1.08]} />
          <meshBasicMaterial color={panel.color} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

function Particles({ mouseRef }) {
  const ref = useRef(null)
  const positions = useMemo(() => {
    const values = new Float32Array(360)
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * 20
      values[i + 1] = Math.random() * 6 + 0.4
      values[i + 2] = (Math.random() - 0.5) * 15
    }
    return values
  }, [])

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.035 + mouseRef.current.x * 0.04
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#cffff7" size={0.035} transparent opacity={0.65} />
    </points>
  )
}

function CameraRig({ mouseRef }) {
  useFrame(({ camera, scene }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 1.45, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5.3 + mouseRef.current.y * 0.55, 0.06)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8.8, 0.06)
    camera.lookAt(mouseRef.current.x * 0.8, 0.8, mouseRef.current.y * 0.55)
    scene.rotation.z = THREE.MathUtils.lerp(scene.rotation.z, mouseRef.current.x * 0.01, 0.06)
  })
  return null
}

function Scene({ mouseRef }) {
  return (
    <>
      <color attach="background" args={['#04110f']} />
      <fog attach="fog" args={['#04110f', 7, 22]} />
      <ambientLight intensity={0.34} color="#aafff0" />
      <directionalLight position={[-4, 8, 5]} intensity={1.2} color="#eafffb" castShadow />
      <spotLight position={[4, 7, 6]} angle={0.52} penumbra={0.6} intensity={1.9} color="#7fffe8" />
      <WorkbenchGrid />
      <DataPanels />
      <ReactorCore mouseRef={mouseRef} />
      <Molecule position={[-2.4, 1.45, -0.6]} scale={0.9} speed={0.95} mouseRef={mouseRef} />
      <Molecule position={[0.6, 2.35, -3.2]} scale={0.62} speed={1.25} mouseRef={mouseRef} />
      <Molecule position={[-5.1, 2.1, 1.6]} scale={0.52} speed={0.78} mouseRef={mouseRef} />
      <Particles mouseRef={mouseRef} />
      <CameraRig mouseRef={mouseRef} />
    </>
  )
}

export default function LabWorkbenchBackground() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointer = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('pointermove', handlePointer)
    return () => window.removeEventListener('pointermove', handlePointer)
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#04110f]" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 5.3, 8.8], fov: 46, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene mouseRef={mouseRef} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_62%_44%,transparent_0%,rgba(4,17,15,0.1)_35%,rgba(4,17,15,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,17,15,0.1),rgba(4,17,15,0.72))]" />
    </div>
  )
}
