import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Stars, Sparkles, Line, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const FireballMaterial = shaderMaterial(
  {
    time: 0,
    color1: new THREE.Color("#ffaa00"),
    color2: new THREE.Color("#ff0000"),
  },
  // Vertex Shader
  `
  uniform float time;
  varying vec2 vUv;
  varying float vNoise;

  // Simple 3D Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857; 
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    float noise = snoise(position * 2.5 + time * 4.0);
    vNoise = noise;
    vec3 newPosition = position + normal * noise * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  varying float vNoise;

  void main() {
    float mixRatio = smoothstep(-0.6, 0.8, vNoise);
    vec3 finalColor = mix(color1, color2, mixRatio);
    gl_FragColor = vec4(finalColor, 0.95);
  }
  `
);

extend({ FireballMaterial });

// Single Orbiting Fireball
function OrbitingFireball({ orbitRadius, orbitSpeed, yOffset, angleOffset, scale, color1, color2 }) {
  const groupRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      const angle = time * orbitSpeed + angleOffset;
      
      const targetX = Math.cos(angle) * orbitRadius;
      const targetZ = Math.sin(angle) * orbitRadius;
      const targetY = yOffset + Math.sin(time * 2 + angleOffset) * 0.5;

      // Mouse interaction: slightly pull fireballs towards mouse cursor
      const mouseInfluenceX = state.mouse.x * 8;
      const mouseInfluenceY = state.mouse.y * 8;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX + mouseInfluenceX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + mouseInfluenceY, 0.05);
      groupRef.current.position.z = targetZ;
    }
    if (materialRef.current) {
      materialRef.current.time = time * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={scale}>
        <icosahedronGeometry args={[1, 16]} />
        <fireballMaterial ref={materialRef} color1={color1} color2={color2} transparent />
      </mesh>
      <pointLight distance={15} intensity={2} color={color2} />
    </group>
  );
}

// Group of Fireballs
function OrbitingFireballs({ count = 5 }) {
  const fireballs = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const hue = Math.random();
      return {
        orbitRadius: Math.random() * 15 + 5, // 5 to 20
        orbitSpeed: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        yOffset: (Math.random() - 0.5) * 15,
        angleOffset: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.4 + 0.3,
        // color1 is the dark core (e.g. deep crimson/purple)
        color1: new THREE.Color().setHSL(hue, 1.0, 0.2),
        // color2 is the bright flame edge
        color2: new THREE.Color().setHSL((hue + 0.1) % 1.0, 1.0, 0.6)
      };
    });
  }, [count]);

  return (
    <group>
      {fireballs.map((fb, i) => (
        <OrbitingFireball key={i} {...fb} />
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

function Portal() {
  const materialRef = useRef();
  const groupRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.time = time * 0.3; 
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.05;
      // Portal reacts slightly inversely to mouse for parallax
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.mouse.y * -0.1, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.1, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -25]}>
      <mesh>
        <torusGeometry args={[18, 1.5, 32, 100]} />
        <fireballMaterial 
          ref={materialRef} 
          color1={new THREE.Color("#4c1d95")} // Deep Purple Void
          color2={new THREE.Color("#10b981")} // Emerald Magic
          transparent 
        />
      </mesh>
      <pointLight distance={40} intensity={2} color="#10b981" position={[0, 0, 5]} />
    </group>
  );
}

function Scene() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#d946ef" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#10b981" />
      
      <Portal />

      <group ref={groupRef}>
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
        <Sparkles count={150} scale={30} size={4} speed={0.2} opacity={0.5} color="#10b981" />
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
