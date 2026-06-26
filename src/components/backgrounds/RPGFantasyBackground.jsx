import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Stars, Line, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Fireball shader (noise-based lava surface) ──────────────────────────────

const FireballMaterial = shaderMaterial(
  { time: 0, color1: new THREE.Color('#200500'), color2: new THREE.Color('#ff6600') },
  `uniform float time;
   varying vec2 vUv; varying float vNoise;
   vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
   vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
   vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
   vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
   float snoise(vec3 v){
     const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
     vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
     vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
     vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
     vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
     i=mod289(i);
     vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
     float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
     vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
     vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
     vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
     vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
     vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
     vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
     vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
     p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
     vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
     return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
   }
   void main(){
     vUv=uv;
     float noise=snoise(position*3.0+time*5.);
     vNoise=noise;
     vec3 np=position+normal*noise*.4;
     gl_Position=projectionMatrix*modelViewMatrix*vec4(np,1.);
   }`,
  `uniform float time; uniform vec3 color1; uniform vec3 color2;
   varying vec2 vUv; varying float vNoise;
   void main(){
     float m=smoothstep(-0.8,0.5,vNoise);
     gl_FragColor=vec4(mix(color1,color2,m),0.92);
   }`
);
extend({ FireballMaterial });

// ─── Nebula — particle gas cloud ─────────────────────────────────────────────

function NebulaCloud({ position, color, radius, count = 500 }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.6) * radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.45;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);

  return (
    <points geometry={geo} position={position}>
      <pointsMaterial
        color={color}
        size={0.28}
        transparent
        opacity={0.18}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Single constellation with glowing star nodes ─────────────────────────────

function Constellation({ stars, connections, color, position, scale = 1 }) {
  const scaledStars = useMemo(
    () => stars.map(([x, y, z]) => new THREE.Vector3(x * scale, y * scale, z * scale)),
    [stars, scale]
  );

  return (
    <group position={position}>
      {connections.map(([a, b], i) => (
        <Line
          key={i}
          points={[scaledStars[a], scaledStars[b]]}
          color={color}
          transparent
          opacity={0.4}
          lineWidth={1}
        />
      ))}
      {scaledStars.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.24, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.13} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ConstellationField() {
  // Stars defined around [0,0,0] — spread negative and positive so constellation
  // doesn't lean in one direction. Positions spread wide: x -40 to +40.
  const constellations = useMemo(() => [
    {
      stars: [[-2,0,0],[0,2,0],[2,1.5,0],[3,-0.5,0],[1,-2,0],[-1,-1.5,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,3]],
      color: '#7dd3fc', position: [-40, 14, -46], scale: 1.4,
    },
    {
      stars: [[-2,-1,0],[-0.5,1,0],[1.5,2,0],[3,1,0],[2.5,-1,0],[0.5,-2,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,3]],
      color: '#e2e8f0', position: [-22, 16, -42], scale: 1.2,
    },
    {
      stars: [[-2.5,0.5,0],[-1,-1,0],[0.5,1.5,0],[2.5,0,0],[1.5,-2,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,1],[0,2]],
      color: '#c4b5fd', position: [-5, 18, -50], scale: 1.1,
    },
    {
      stars: [[-2,-0.5,0],[-1,1.5,0],[1,2,0],[3,1,0],[2.5,-1,0],[0,-2,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,4]],
      color: '#fbbf24', position: [16, 12, -44], scale: 1.3,
    },
    {
      stars: [[-2.5,-1,0],[-1,1,0],[0.5,2.5,0],[2.5,1.5,0],[3,-0.5,0],[1.5,-2,0],[-0.5,-1.5,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,4]],
      color: '#34d399', position: [38, 8, -40], scale: 1.0,
    },
    {
      stars: [[-1.5,2,0],[0.5,3,0],[2.5,2,0],[3,0,0],[1.5,-1.5,0],[-0.5,-0.5,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,2]],
      color: '#f472b6', position: [-38, -4, -38], scale: 1.2,
    },
    {
      stars: [[-2,1,0],[-0.5,2.5,0],[1.5,2,0],[2,-0.5,0],[0.5,-1.5,0],[-1.5,-0.5,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,2],[2,4]],
      color: '#93c5fd', position: [-14, -7, -36], scale: 0.9,
    },
    {
      stars: [[-2.5,0,0],[-1,-2,0],[1,-1.5,0],[2.5,0.5,0],[1.5,2,0],[-0.5,1.5,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3]],
      color: '#fde68a', position: [8, -5, -36], scale: 1.1,
    },
    {
      stars: [[-1.5,-1.5,0],[0,0.5,0],[2,1,0],[2.5,-1,0],[1,-2.5,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]],
      color: '#6ee7b7', position: [26, -9, -38], scale: 0.85,
    },
    {
      stars: [[-2.5,1,0],[-1.5,2.5,0],[0.5,3,0],[2,1.5,0],[2.5,-0.5,0],[1,-2,0],[-1,-1,0]],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[2,5]],
      color: '#a78bfa', position: [42, 2, -44], scale: 1.5,
    },
  ], []);

  return (
    <>
      {constellations.map((c, i) => (
        <Constellation key={i} {...c} />
      ))}
    </>
  );
}

// ─── Orbiting fireball — circles viewer in XY ellipse at fixed z ──────────────

function OrbitingFireball({ orbitRadius, orbitSpeed, yOffset, angleOffset, scale, color1, color2 }) {
  const groupRef = useRef();
  const matRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const angle = t * orbitSpeed + angleOffset;
      // Orbit in XY plane centered near viewer — stays in front of camera (z=18)
      // z stays between 3 and 9, always visible
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.y = yOffset + Math.sin(angle) * orbitRadius * 0.45;
      groupRef.current.position.z = 5 + Math.sin(angle * 2 + angleOffset) * 2;
    }
    if (matRef.current) matRef.current.time = t;
  });

  return (
    <group ref={groupRef}>
      {/* Outer glow corona */}
      <mesh scale={scale * 2.5}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color2} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Inner glow halo */}
      <mesh scale={scale * 1.5}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color2} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Fireball surface — additive blending makes dark parts transparent like real fire */}
      <mesh scale={scale}>
        <icosahedronGeometry args={[1, 16]} />
        <fireballMaterial
          ref={matRef}
          color1={color1}
          color2={color2}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight distance={28} intensity={5} color={color2} />
    </group>
  );
}

function OrbitingFireballs() {
  const config = useMemo(() => [
    // color1 = near-black dark base, color2 = bright hot color
    // dark base + additive blending = dark parts vanish, bright parts glow
    { orbitRadius: 5.5, orbitSpeed:  0.50, yOffset:  1.0, angleOffset: 0,           scale: 0.55, color1: new THREE.Color('#1a0500'), color2: new THREE.Color('#ff7700') },
    { orbitRadius: 7.0, orbitSpeed: -0.35, yOffset: -1.5, angleOffset: Math.PI/2,   scale: 0.45, color1: new THREE.Color('#130010'), color2: new THREE.Color('#cc44ff') },
    { orbitRadius: 4.5, orbitSpeed:  0.65, yOffset:  2.2, angleOffset: Math.PI,     scale: 0.38, color1: new THREE.Color('#180000'), color2: new THREE.Color('#ff3300') },
    { orbitRadius: 6.5, orbitSpeed: -0.42, yOffset:  0.2, angleOffset: Math.PI*1.3, scale: 0.50, color1: new THREE.Color('#001510'), color2: new THREE.Color('#00ddcc') },
    { orbitRadius: 3.8, orbitSpeed:  0.78, yOffset: -2.8, angleOffset: Math.PI*0.7, scale: 0.32, color1: new THREE.Color('#1a1000'), color2: new THREE.Color('#ffdd00') },
    { orbitRadius: 8.0, orbitSpeed: -0.28, yOffset:  3.5, angleOffset: Math.PI*1.7, scale: 0.60, color1: new THREE.Color('#060018'), color2: new THREE.Color('#5588ff') },
  ], []);

  return (
    <>
      {config.map((c, i) => <OrbitingFireball key={i} {...c} />)}
    </>
  );
}

// ─── Slow-rotating galaxy group ───────────────────────────────────────────────

function Scene() {
  const slowRef = useRef();

  useFrame((state) => {
    if (slowRef.current) {
      slowRef.current.rotation.y = state.clock.getElapsedTime() * 0.006;
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 20, -10]} intensity={1.5} color="#6366f1" />
      <pointLight position={[0, -5, 5]} intensity={0.8} color="#8b5cf6" />

      {/* Deep starfield */}
      <Stars radius={120} depth={60} count={5000} factor={3} saturation={0.6} fade speed={0.4} />

      {/* Fireballs orbit close to viewer */}
      <OrbitingFireballs />

      {/* Galaxy/nebula clouds — far behind */}
      <group ref={slowRef}>
        <NebulaCloud position={[-5, 8, -50]}  color="#7c3aed" radius={22} count={600} />
        <NebulaCloud position={[12, -4, -55]} color="#1d4ed8" radius={20} count={500} />
        <NebulaCloud position={[-18, -6, -45]} color="#9d174d" radius={16} count={400} />
        <NebulaCloud position={[20, 10, -48]} color="#0f766e" radius={18} count={450} />
        <NebulaCloud position={[0, 0, -60]}   color="#5b21b6" radius={28} count={700} />
        <NebulaCloud position={[-8, 12, -52]} color="#c026d3" radius={12} count={300} />
        <NebulaCloud position={[15, -10, -50]} color="#0369a1" radius={14} count={300} />

        <ConstellationField />
      </group>
    </>
  );
}

// ─── Mountain silhouette — single SVG, all layers share same coordinate space ──

function MountainSilhouette() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
      {/* Single SVG with all three mountain depth layers — no gaps possible */}
      <svg
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '260px' }}
      >
        {/* Distant range — faint slate-blue, tallest peaks, lots of variety */}
        <path
          d="M0,300 L0,155 L50,140 L100,150 L160,122 L220,135 L280,108 L340,120
             L400,95 L460,108 L520,82 L580,96 L640,72 L700,86 L760,62 L820,76
             L880,55 L940,70 L1000,50 L1060,65 L1120,52 L1180,68 L1240,58 L1300,72
             L1360,65 L1440,80 L1440,300 Z"
          fill="#0d1226"
          fillOpacity="0.65"
        />

        {/* Mid range — darker, medium height */}
        <path
          d="M0,300 L0,210 L60,196 L120,206 L180,185 L240,198 L300,172 L360,186
             L420,162 L480,176 L540,152 L600,168 L660,145 L720,160 L780,138 L840,153
             L900,130 L960,145 L1020,128 L1080,142 L1140,132 L1200,148 L1260,138 L1320,155
             L1380,145 L1440,158 L1440,300 Z"
          fill="#080d1e"
          fillOpacity="0.88"
        />

        {/* Foreground — near-black, lowest on screen, most defined peaks */}
        <path
          d="M0,300 L0,268 L80,255 L160,262 L240,245 L300,252 L360,238 L420,248
             L480,232 L540,242 L600,222 L650,232 L690,212 L730,200 L770,212 L810,195
             L850,207 L900,188 L950,200 L1000,215 L1060,228 L1120,238 L1180,248 L1240,256
             L1320,265 L1440,270 L1440,300 Z"
          fill="#050912"
        />

        {/* Snow caps on the two sharpest foreground peaks */}
        <path d="M730,200 L743,197 L756,202 L750,211 L738,206 Z" fill="#dde4f0" fillOpacity="0.28" />
        <path d="M810,195 L823,192 L836,197 L830,207 L818,201 Z" fill="#dde4f0" fillOpacity="0.22" />
        <path d="M900,188 L912,185 L924,190 L918,200 L906,194 Z" fill="#dde4f0" fillOpacity="0.2" />
      </svg>

      {/* Ground strip fills any sub-pixel gap */}
      <div style={{ height: '4px', background: '#050912' }} />
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function RPGFantasyBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0d0a2e 0%, #06040f 55%, #020209 100%)' }}
    >
      <Canvas
        camera={{ position: [0, 0, 18], fov: 65 }}
        style={{ pointerEvents: 'none' }}
        events={undefined}
      >
        <Scene />
      </Canvas>

      {/* Vignette — darkens edges so content pops */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(2,2,9,0.65) 100%)' }}
      />

      {/* Mountain silhouette */}
      <MountainSilhouette />

      {/* Subtle purple aurora tint at top */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to bottom, rgba(109,40,217,0.08) 0%, transparent 100%)' }}
      />
    </div>
  );
}
