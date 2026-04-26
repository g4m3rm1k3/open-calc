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

function CometTail({ count = 2500 }) {
  const ref = useRef()
  const [geometry] = useState(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  })

  useFrame((state) => {
    const positions = geometry.attributes.position.array
    const colors = geometry.attributes.color.array
    for (let i = 0; i < count; i++) {
      const idx = i * 3
      // Move BEHIND the motion (Motion is +X, -Y, so tail is -X, +Y)
      positions[idx] -= 0.18
      positions[idx + 1] += 0.08
      
      // Conic expansion
      const lateralShift = Math.sqrt(positions[idx]*positions[idx] + positions[idx+1]*positions[idx+1]) * 0.05
      positions[idx] += (Math.random() - 0.5) * lateralShift
      positions[idx + 1] += (Math.random() - 0.5) * lateralShift
      positions[idx + 2] += (Math.random() - 0.5) * lateralShift

      // Reset and recycle
      const distSq = positions[idx]*positions[idx] + positions[idx+1]*positions[idx+1]
      if (distSq > 3600 || Math.random() < 0.005) { // Reset at dist 60 or randomly
        positions[idx] = (Math.random() - 0.5) * 0.2
        positions[idx + 1] = (Math.random() - 0.5) * 0.2
        positions[idx + 2] = (Math.random() - 0.5) * 0.2
      }

      // Color logic: Red hot -> Blue cool down
      const dist = Math.sqrt(distSq)
      const fade = Math.max(0, 1 - dist / 60)
      if (dist < 2) {
        colors[idx] = 1; colors[idx + 1] = 1; colors[idx + 2] = 1 // Bright nucleus
      } else if (dist < 20) {
        colors[idx] = 0.98 * fade; colors[idx + 1] = 0.45 * fade; colors[idx + 2] = 0.08 * fade // Red/Orange
      } else {
        colors[idx] = 0.1 * fade; colors[idx + 1] = 0.4 * fade; colors[idx + 2] = 1.0 * fade // Blue Ion
      }
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
  })

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.14} vertexColors transparent opacity={0.5} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Comet({ config }) {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      // Synchronize with Epoch (Universal Wall Clock)
      // Duration: 2 Hours (7200 seconds)
      const duration = 7200 
      const now = Date.now() / 1000
      const progress = (now % duration) / duration
      
      ref.current.position.x = -70 + (progress * 140)
      ref.current.position.y = 12 - (progress * 8)
      ref.current.position.z = -40
      ref.current.rotation.set(0, 0, 0)
    }
  })

  return (
    <group ref={ref}>
      {/* Tiny Incandescent Heart */}
      <mesh>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Diffuse Fire Atmosphere */}
      <mesh scale={5}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
      <CometTail />
      <pointLight color="#f97316" intensity={20} distance={70} />
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

function NightSystem({ config }) {
  return (
    <EnvironmentWrapper>
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
      <MeteorSystem />
      <Comet config={config} />
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

function DaySystem({ config }) {
  const clouds = useMemo(() => Array.from({ length: 8 }).map((_, i) => i), [])
  return (
    <EnvironmentWrapper>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      {clouds.map((i) => (
        <MovingCloud key={i} index={i} />
      ))}
      <Comet config={config} />
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
        {isDark ? <NightSystem config={config} /> : <DaySystem config={config} />}
      </Canvas>
    </div>
  )
}
