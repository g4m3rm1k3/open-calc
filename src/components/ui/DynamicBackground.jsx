import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Cloud, Float, Sky } from '@react-three/drei'
import * as THREE from 'three'

function ShootingStar() {
  const ref = useRef()
  const [active, setActive] = useState(false)
  
  // Randomize shooting star timing and trajectory
  useFrame((state) => {
    if (!active && Math.random() < 0.005) {
      setActive(true)
      const x = (Math.random() - 0.5) * 100
      const y = (Math.random() - 0.5) * 100
      ref.current.position.set(x, y, -50)
      ref.current.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        0
      )
    }
    
    if (active) {
      ref.current.position.add(ref.current.velocity)
      ref.current.scale.multiplyScalar(0.98)
      if (ref.current.scale.x < 0.1) {
        setActive(false)
        ref.current.scale.set(1, 1, 1)
      }
    }
  })

  return (
    <mesh ref={ref} visible={active}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#fff" transparent opacity={0.8} />
    </mesh>
  )
}

function NightSystem() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ShootingStar />
      <ShootingStar />
      <ambientLight intensity={0.2} />
    </>
  )
}

function MovingCloud({ index }) {
  const ref = useRef()
  // Randomize initial position and speed
  const [data] = useState(() => ({
    x: (Math.random() - 0.5) * 100,
    y: 3 + Math.random() * 6,
    z: -15 - Math.random() * 10,
    speed: 0.003 + Math.random() * 0.008, // Very slow drift
    scale: 1 + Math.random() * 2,
  }))

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x += data.speed
      // Reset when it goes off screen (approx 50 units for a 75 fov at -15z)
      if (ref.current.position.x > 60) {
        ref.current.position.x = -60
        ref.current.position.y = 2 + Math.random() * 8
      }
    }
  })

  return (
    <Cloud
      ref={ref}
      opacity={0.4}
      speed={0.05} // internal rotation
      width={10}
      depth={2}
      segments={20}
      position={[data.x, data.y, data.z]}
      scale={data.scale}
      color="#ffffff"
    />
  )
}

function DaySystem() {
  const clouds = useMemo(() => Array.from({ length: 8 }).map((_, i) => i), [])
  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      {clouds.map((i) => (
        <MovingCloud key={i} index={i} />
      ))}
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={2} color="#ffffff" />
    </>
  )
}

export default function DynamicBackground({ mode, config }) {
  const isDark = mode === 'dark'
  
  // Handle custom image or gradient if not dynamic
  if (config?.type === 'image' && config.url) {
    return (
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${config.url})` }}
      />
    )
  }

  if (config?.type === 'gradient' && config.css) {
    return (
      <div 
        className="fixed inset-0 z-[-1] transition-opacity duration-1000"
        style={{ background: config.css }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-slate-100 dark:bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        {isDark ? <NightSystem /> : <DaySystem />}
      </Canvas>
    </div>
  )
}
