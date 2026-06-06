import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';

// Orbiting fireballs
function OrbitingFireballs({ count = 12 }) {
  const groupRef = useRef();
  
  const fireballs = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      orbitRadius: Math.random() * 15 + 5, // 5 to 20
      orbitSpeed: (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
      yOffset: (Math.random() - 0.5) * 15,
      angleOffset: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.4 + 0.2,
      color: new THREE.Color().setHSL(Math.random() * 0.15 + 0.55, 0.9, 0.6) // Cyan/Blue/Purple core
    }));
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const fb = fireballs[i];
        const angle = time * fb.orbitSpeed + fb.angleOffset;
        child.position.x = Math.cos(angle) * fb.orbitRadius;
        child.position.z = Math.sin(angle) * fb.orbitRadius;
        child.position.y = fb.yOffset + Math.sin(time * 2 + fb.angleOffset) * 0.5; // slight bobbing
      });
    }
  });

  return (
    <group ref={groupRef}>
      {fireballs.map((fb, i) => (
        <group key={i}>
          <mesh scale={fb.scale}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={fb.color} />
          </mesh>
          {/* Add an inner glow / larger transparent shell */}
          <mesh scale={fb.scale * 1.5}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={fb.color} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight distance={10} intensity={0.5} color={fb.color} />
        </group>
      ))}
    </group>
  );
}

// Background constellations
function Constellations({ count = 5 }) {
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const points = [];
      const numStars = Math.floor(Math.random() * 4) + 3; // 3 to 6 stars per constellation
      let currentPoint = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        -20 - Math.random() * 20
      );
      points.push(currentPoint);
      for (let i = 1; i < numStars; i++) {
        const nextPoint = currentPoint.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5
        ));
        points.push(nextPoint);
        currentPoint = nextPoint;
      }
      return points;
    });
  }, [count]);

  return (
    <group>
      {lines.map((points, i) => (
        <Line 
          key={i}
          points={points}
          color="#64ffff"
          transparent
          opacity={0.15}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

function Scene() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#d946ef" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#10b981" />
      
      <group ref={groupRef}>
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
        <Sparkles count={100} scale={30} size={4} speed={0.2} opacity={0.5} color="#10b981" />
        <OrbitingFireballs />
        <Constellations />
      </group>
    </>
  );
}

export function RPGFantasyBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-slate-950">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Scene />
      </Canvas>
      {/* Overlay gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80" />
    </div>
  );
}
