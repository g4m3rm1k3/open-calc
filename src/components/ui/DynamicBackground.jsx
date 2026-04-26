import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Cloud, Float, Sky } from '@react-three/drei'
import * as THREE from 'three'

function Meteor({ active, onDone }) {
  const ref = useRef()
  const [props] = useState(() => ({
    speed: 0.6 + Math.random() * 0.4,
    angle: (Math.random() - 1.5) * 0.2, // Shallow downward left-to-right angle
    size: 0.05 + Math.random() * 0.1,
    length: 3 + Math.random() * 5,
  }))

  useFrame(() => {
    if (active && ref.current) {
      ref.current.position.x += Math.cos(props.angle) * props.speed
      ref.current.position.y += Math.sin(props.angle) * props.speed
      ref.current.scale.x *= 0.98
      if (ref.current.scale.x < 0.01) onDone()
    }
  })

  if (!active) return null

  // Spread starting x and y to avoid group 'stuttering'
  const startX = -60 - Math.random() * 20
  const startY = (Math.random() - 0.5) * 60

  return (
    <mesh ref={ref} position={[startX, startY, -40]} rotation={[0, 0, props.angle]}>
      <boxGeometry args={[props.length, props.size, props.size]} />
      <meshBasicMaterial color="#fff" transparent opacity={0.8} />
    </mesh>
  )
}

function CometTail({ count = 20 }) {
  const points = useMemo(() => Array.from({ length: count }).map(() => ({
    x: 0, y: 0, z: 0,
    vx: -(Math.random() * 0.2 + 0.1),
    vy: (Math.random() - 0.5) * 0.05,
    life: Math.random()
  })), [])

  const ref = useRef()
  useFrame(() => {
    points.forEach((p, i) => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.01
      if (p.life <= 0) {
        p.x = 0; p.y = 0; p.life = 1
      }
      const s = 0.1 * p.life
      const matrix = new THREE.Matrix4()
        .makeTranslation(p.x, p.y, 0)
        .scale(new THREE.Vector3(s, s, s))
      ref.current.setMatrixAt(i, matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#fef08a" transparent opacity={0.6} />
    </instancedMesh>
  )
}

function Comet() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      const now = new Date()
      const secondsInDay = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()
      const progress = secondsInDay / 86400
      ref.current.position.x = -40 + (progress * 80)
      ref.current.position.y = 8
      ref.current.position.z = -25
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <CometTail />
      <pointLight color="#fef9c3" intensity={5} distance={15} />
    </group>
  )
}

function MeteorSystem() {
  const [meteors, setMeteors] = useState([])
  
  useFrame((state) => {
    const rand = Math.random()
    
    // Ghostly rare meteors - practically non-existent until needed
    if (rand < 0.001 && meteors.length < 3) {
      setMeteors(prev => [...prev, { id: Date.now(), type: 'single' }])
    }
    
    if (rand < 0.0001 && meteors.length < 2) {
      const burst = Array.from({ length: 3 }).map((_, i) => ({ id: Date.now() + i, type: 'burst' }))
      setMeteors(prev => [...prev, ...burst])
    }

    if (rand < 0.00001 && meteors.length < 1) {
      const shower = Array.from({ length: 15 }).map((_, i) => ({ id: Date.now() + i, type: 'shower' }))
      setMeteors(prev => [...prev, ...shower])
    }
  })

  const removeMeteor = (id) => setMeteors(prev => prev.filter(m => m.id !== id))

  return (
    <>
      {meteors.map(m => (
        <Meteor key={m.id} active onDone={() => removeMeteor(m.id)} />
      ))}
    </>
  )
}

function EnvironmentWrapper({ children }) {
  const groupRef = useRef()
  
  useFrame(() => {
    if (groupRef.current) {
      // Whisper parallax: scroll at 0.5% rate
      groupRef.current.position.y = window.scrollY * 0.005
    }
  })

  return <group ref={groupRef}>{children}</group>
}

function NightSystem() {
  return (
    <EnvironmentWrapper>
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
      <MeteorSystem />
      <Comet />
      <ambientLight intensity={0.2} />
    </EnvironmentWrapper>
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
        ref.current.position.y = 3 + Math.random() * 12 // Higher range to stay in view longer with parallax
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
    <EnvironmentWrapper>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      {clouds.map((i) => (
        <MovingCloud key={i} index={i} />
      ))}
      <Comet />
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={2} color="#ffffff" />
    </EnvironmentWrapper>
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
