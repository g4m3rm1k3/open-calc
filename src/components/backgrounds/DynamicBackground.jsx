import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cloud } from "@react-three/drei";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// EnvironmentWrapper — FROM FILE 1 EXACTLY
// The group drifts DOWN (positive Y) as scrollY increases.
// This reveals content that starts BELOW the viewport (water, moon).
// Camera is fixed. Scene moves down into view.
// ---------------------------------------------------------------------------
function EnvironmentWrapper({ children }) {
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = window.scrollY * 0.0005;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

// ---------------------------------------------------------------------------
// Gerstner Wave ocean — FROM FILE 2
// Positioned at y=-17 (same as File 1's SimpleWater) — well off screen at load
// ---------------------------------------------------------------------------
const WAVES = [
  { A: 0.28, L: 14, Q: 0.6, D: [1, 0.4] },
  { A: 0.18, L: 8,  Q: 0.5, D: [0.6, 1] },
  { A: 0.10, L: 5,  Q: 0.4, D: [-0.3, 1] },
  { A: 0.06, L: 3,  Q: 0.3, D: [1, -0.2] },
];

function gerstnerDisplace(x, z, t) {
  let px = x, pz = z, py = 0;
  for (const w of WAVES) {
    const [dx, dz] = w.D;
    const len = Math.sqrt(dx * dx + dz * dz);
    const Dx = dx / len, Dz = dz / len;
    const k = (2 * Math.PI) / w.L;
    const c = Math.sqrt(9.81 / k);
    const f = k * (Dx * x + Dz * z) - c * t;
    px += w.Q * w.A * Dx * Math.cos(f);
    pz += w.Q * w.A * Dz * Math.cos(f);
    py += w.A * Math.sin(f);
  }
  return { px, py, pz };
}

function RealisticOcean({ color = "#1a6b8a" }) {
  const meshRef = useRef();
  const { geometry, origX, origZ } = useMemo(() => {
    const g = new THREE.PlaneGeometry(130, 45, 60, 60);
    g.rotateX(-Math.PI / 2);
    const count = g.attributes.position.count;
    const ox = new Float32Array(count);
    const oz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      ox[i] = g.attributes.position.getX(i);
      oz[i] = g.attributes.position.getZ(i);
    }
    return { geometry: g, origX: ox, origZ: oz };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const { px, py, pz } = gerstnerDisplace(origX[i], origZ[i], t);
      pos.setXYZ(i, px, py, pz);
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -17, 0]} receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.05}
        metalness={0.0}
        transmission={0.1}
        thickness={1.2}
        ior={1.34}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// DAY SKY — custom GLSL shader sphere
// Deep blue zenith → warm orange horizon, sun disc just above horizon
// No drei <Sky> — avoids white blowout entirely
// ---------------------------------------------------------------------------
const daySkyVS = `
varying vec3 vWorldDir;
void main() {
  vWorldDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const daySkyFS = `
precision highp float;
varying vec3 vWorldDir;

const vec3 SUN_DIR   = normalize(vec3(0.25, 0.07, -1.0));
const vec3 COL_TOP   = vec3(0.05, 0.18, 0.60);
const vec3 COL_MID   = vec3(0.20, 0.48, 0.85);
const vec3 COL_HORIZ = vec3(0.90, 0.55, 0.22);
const vec3 COL_HAZE  = vec3(0.95, 0.80, 0.55);

void main() {
  vec3 d = normalize(vWorldDir);
  float elev = d.y; // -1..1

  // Sky gradient: zenith -> mid -> horizon
  float t = clamp(elev, 0.0, 1.0);
  vec3 sky = mix(COL_MID, COL_TOP, pow(t, 0.6));

  // Horizon warm band
  float h = exp(-abs(elev) * 4.5);
  sky = mix(sky, COL_HORIZ, h * 0.72 * smoothstep(-0.15, 0.25, elev + 0.15));

  // Haze right at the seam
  float haze = exp(-abs(elev) * 22.0) * 0.5;
  sky += COL_HAZE * haze;

  // Below horizon: muted blue-grey (ocean reflection of sky)
  if (elev < 0.0) {
    sky = mix(sky, vec3(0.48, 0.56, 0.65), clamp(-elev * 5.0, 0.0, 1.0));
  }

  // Sun disc — small, sharp
  float sd = dot(d, SUN_DIR);
  float disc   = smoothstep(0.9984, 0.9996, sd);
  float inner  = pow(clamp(sd, 0.0, 1.0), 400.0) * 1.0;
  float outer  = pow(clamp(sd, 0.0, 1.0), 32.0)  * 0.25;
  sky += vec3(1.00, 0.95, 0.70) * disc  * 4.0;
  sky += vec3(1.00, 0.80, 0.35) * inner;
  sky += vec3(1.00, 0.65, 0.20) * outer;

  // Gentle tone map
  sky = sky / (sky + 0.55);
  sky = pow(sky, vec3(0.88));

  gl_FragColor = vec4(sky, 1.0);
}
`;

function DaySky() {
  return (
    <mesh scale={[-300, 300, 300]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={daySkyVS}
        fragmentShader={daySkyFS}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// MovingCloud — FROM FILE 1 EXACTLY
// ref on the Cloud, position set on Cloud, useFrame moves ref.current.position.x
// ---------------------------------------------------------------------------
function MovingCloud({ index }) {
  const ref = useRef();
  const [data] = useState(() => ({
    x:     (Math.random() - 0.5) * 100,
    y:     3 + Math.random() * 6,
    z:     -15 - Math.random() * 10,
    speed: 0.003 + Math.random() * 0.008,
    scale: 1 + Math.random() * 2,
  }));

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x += data.speed;
      if (ref.current.position.x > 60) {
        ref.current.position.x = -60;
        ref.current.position.y = 3 + Math.random() * 12;
      }
    }
  });

  return (
    <Cloud
      ref={ref}
      opacity={0.4}
      speed={0.05}
      width={10}
      depth={2}
      segments={20}
      position={[data.x, data.y, data.z]}
      scale={data.scale}
      color="#ffffff"
    />
  );
}

// ---------------------------------------------------------------------------
// NIGHT SKY — nebula GLSL sphere — FROM FILE 2 EXACTLY
// ---------------------------------------------------------------------------
const nebulaVS = `
varying vec3 vDir;
void main() {
  vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const nebulaFS = `
precision highp float;
varying vec3 vDir;
float hash3(vec3 p){p=fract(p*vec3(443.897,441.423,437.195));p+=dot(p,p.yzx+19.19);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise3(p);p*=2.1;a*=0.5;}return v;}
void main(){
  vec3 d=normalize(vDir); float elev=d.y;
  float t=clamp(elev*0.5+0.5,0.0,1.0);
  vec3 col=mix(vec3(0.01,0.02,0.10),mix(vec3(0.05,0.01,0.20),vec3(0.00,0.01,0.08),t),t);
  float n1=fbm(d*3.8+vec3(1.2,0.4,0.9));
  col+=vec3(0.06,0.02,0.28)*smoothstep(0.40,0.68,n1)*smoothstep(-0.2,0.7,elev)*0.7;
  float n2=fbm(d*2.9+vec3(3.1,1.7,2.3));
  col+=vec3(0.00,0.20,0.16)*smoothstep(0.43,0.68,n2)*smoothstep(0.0,0.9,elev)*clamp(-d.x*1.2+0.6,0.0,1.0)*0.55;
  float n3=fbm(d*4.5+vec3(0.5,2.8,1.1));
  col+=vec3(0.22,0.03,0.15)*smoothstep(0.45,0.67,n3)*smoothstep(0.1,0.9,elev)*clamp(d.x*1.8+0.4,0.0,1.0)*0.45;
  col+=vec3(0.01,0.04,0.22)*pow(1.0-abs(elev),7.0)*0.18;
  col=pow(col,vec3(0.82));
  gl_FragColor=vec4(col,1.0);
}
`;
function NebulaSky() {
  return (
    <mesh scale={[-200, 200, 200]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial vertexShader={nebulaVS} fragmentShader={nebulaFS} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// StarField — FROM FILE 2 EXACTLY
// ---------------------------------------------------------------------------
function StarField({ count = 7000 }) {
  const [geo, mat] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const R     = 92 + Math.random() * 8;
      positions[i*3]   = R * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = R * Math.cos(phi);
      positions[i*3+2] = R * Math.sin(phi) * Math.sin(theta);
      const type = Math.random();
      const b    = Math.pow(Math.random(), 1.6);
      if      (type < 0.05) { colors[i*3]=b*0.7;  colors[i*3+1]=b*0.85; colors[i*3+2]=b; }
      else if (type < 0.20) { colors[i*3]=b*0.95; colors[i*3+1]=b*0.97; colors[i*3+2]=b; }
      else if (type < 0.55) { colors[i*3]=b;      colors[i*3+1]=b*0.94; colors[i*3+2]=b*0.76; }
      else if (type < 0.80) { colors[i*3]=b;      colors[i*3+1]=b*0.70; colors[i*3+2]=b*0.40; }
      else                  { colors[i*3]=b;      colors[i*3+1]=b*0.42; colors[i*3+2]=b*0.25; }
      sizes[i] = 0.25 + Math.pow(Math.random(), 3) * 2.8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    g.setAttribute("size",     new THREE.BufferAttribute(sizes, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: `attribute float size;varying vec3 vCol;void main(){vCol=color;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=size*(280.0/-mv.z);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec3 vCol;void main(){float d=length(gl_PointCoord-0.5)*2.0;float a=pow(1.0-smoothstep(0.0,1.0,d),1.8);gl_FragColor=vec4(vCol,a);}`,
      vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    return [g, m];
  }, [count]);
  return <points geometry={geo} material={mat} />;
}

// ---------------------------------------------------------------------------
// MilkyWay — FROM FILE 2 EXACTLY
// ---------------------------------------------------------------------------
const mwVS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const mwFS = `
precision highp float;
varying vec2 vUv;
uniform float uSeed; uniform vec3 uColor; uniform float uOpacity;
float hash(vec2 p){p=fract(p*vec2(127.34,311.78)+uSeed*0.01);p+=dot(p,p+34.23);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5;}return v;}
void main(){
  float across=(vUv.y-0.5)*2.0; float bandMask=exp(-across*across*3.2);
  vec2 uv2=vUv*vec2(6.0,3.0)+vec2(uSeed*0.05);
  float warp=fbm(uv2*0.7)*0.5; float cloud=fbm(uv2+vec2(warp));
  float edgeFade=smoothstep(0.0,0.12,vUv.x)*smoothstep(1.0,0.88,vUv.x);
  float alpha=smoothstep(0.28,0.60,cloud)*bandMask*edgeFade*uOpacity;
  gl_FragColor=vec4(uColor,alpha);
}`;

function MilkyWayPlane({ position, rotation, color, opacity, seed, width, height }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: mwVS, fragmentShader: mwFS,
    uniforms: { uSeed:{value:seed}, uColor:{value:new THREE.Color(color[0],color[1],color[2])}, uOpacity:{value:opacity} },
    transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending,
  }), []);
  return <mesh position={position} rotation={rotation} material={mat}><planeGeometry args={[width,height,1,1]}/></mesh>;
}

function MilkyWay() {
  const planes = useMemo(() => {
    const TILT=(63*Math.PI)/180, R=78, N=32, result=[];
    for(let i=0;i<N;i++){
      const lon=(i/N)*Math.PI*2, gx=Math.cos(lon)*R, gy=Math.sin(lon)*R;
      const rx=gx, ry=gy*Math.cos(TILT), rz=gy*Math.sin(TILT);
      const yaw=Math.atan2(rx,rz), pitch=-Math.atan2(ry,Math.sqrt(rx*rx+rz*rz));
      const isCore=(lon>Math.PI*0.65&&lon<Math.PI*1.35);
      const col=isCore?[1.0,0.88,0.60]:Math.random()<0.28?[0.30,0.50,1.00]:[0.72,0.80,1.00];
      const opac=isCore?0.20+Math.random()*0.14:Math.random()<0.28?0.10+Math.random()*0.09:0.08+Math.random()*0.10;
      result.push({id:`b${i}`,position:[rx,ry,rz],rotation:[pitch,yaw,lon*0.35],color:col,opacity:opac,seed:i*37.4+Math.random()*10,width:42+Math.random()*28,height:13+Math.random()*11});
      if(Math.random()<0.30) result.push({id:`n${i}`,position:[rx*.97,ry*.97,rz*.97],rotation:[pitch+0.1,yaw,lon*0.35+0.2],color:[0.08,0.72,0.60],opacity:0.055+Math.random()*0.05,seed:i*51.2+300,width:30+Math.random()*20,height:9+Math.random()*7});
      if(Math.random()<0.22) result.push({id:`p${i}`,position:[rx*.99,ry*.99,rz*.99],rotation:[pitch-.08,yaw,lon*0.35-.15],color:[0.45,0.10,0.85],opacity:0.04+Math.random()*0.04,seed:i*23.7+600,width:25+Math.random()*15,height:8+Math.random()*6});
    }
    return result;
  },[]);
  return <>{planes.map(p=><MilkyWayPlane key={p.id} {...p}/>)}</>;
}

// ---------------------------------------------------------------------------
// Moon — GLSL shader: rocky, lit from one side, no glowing halos
// Positioned at y=-14 so it appears as you scroll down
// ---------------------------------------------------------------------------
const moonVS = `varying vec3 vNormal;varying vec3 vPos;void main(){vNormal=normalize(normalMatrix*normal);vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const moonFS = `
precision highp float;
varying vec3 vNormal; varying vec3 vPos;
const vec3 LIGHT=normalize(vec3(-0.5,0.3,0.7));
float hash(vec3 p){p=fract(p*vec3(127.1,311.7,74.7));p+=dot(p,p+19.19);return fract(p.x*p.y*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
  vec3 n=normalize(vNormal);
  float r=noise(vPos*5.2)*0.14+noise(vPos*13.8)*0.05+noise(vPos*31.0)*0.02;
  vec3 base=vec3(0.58+r,0.56+r*0.9,0.54+r*0.8);
  float diff=max(dot(n,LIGHT),0.0)*smoothstep(-0.05,0.22,dot(n,LIGHT));
  vec3 col=base*(vec3(0.025,0.03,0.048)+vec3(0.75,0.76,0.72)*diff);
  gl_FragColor=vec4(col,1.0);
}`;

function Moon() {
  return (
    <group position={[14, -14, -38]}>
      <mesh>
        <sphereGeometry args={[2.2, 48, 48]} />
        <shaderMaterial vertexShader={moonVS} fragmentShader={moonFS} />
      </mesh>
      <pointLight color="#c0ccee" intensity={0.8} distance={55} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Comet — FROM FILE 2: nucleus + ion tail + dust tail, no fat coma spheres
// ---------------------------------------------------------------------------
function CometIonTail({ count = 3500 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count*3), 3));
    g.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(count*3), 3));
    return g;
  }, [count]);
  useFrame(() => {
    const pos=geo.attributes.position.array, col=geo.attributes.color.array;
    for(let i=0;i<count;i++){
      const idx=i*3;
      pos[idx]-=0.10+Math.random()*0.05; pos[idx+1]-=0.04+Math.random()*0.02; pos[idx+2]+=(Math.random()-0.5)*0.06;
      const dist=Math.sqrt(pos[idx]**2+pos[idx+1]**2);
      if(dist>50||Math.random()<0.006){pos[idx]=(Math.random()-0.5)*0.4;pos[idx+1]=(Math.random()-0.5)*0.4;pos[idx+2]=(Math.random()-0.5)*0.4;}
      const fade=Math.max(0,1-dist/50);
      if(dist<1.5){col[idx]=1;col[idx+1]=0.98;col[idx+2]=0.95;}
      else if(dist<16){col[idx]=0.15*fade;col[idx+1]=0.65*fade;col[idx+2]=1.0*fade;}
      else{col[idx]=0.04*fade;col[idx+1]=0.20*fade;col[idx+2]=0.88*fade;}
    }
    geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true;
  });
  return <points geometry={geo}><pointsMaterial size={0.13} vertexColors transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false}/></points>;
}

function CometDustTail({ count = 1800 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count*3), 3));
    g.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(count*3), 3));
    return g;
  }, [count]);
  useFrame(() => {
    const pos=geo.attributes.position.array, col=geo.attributes.color.array;
    for(let i=0;i<count;i++){
      const idx=i*3;
      pos[idx]-=0.11+Math.random()*0.03; pos[idx+1]-=0.02+Math.random()*0.01; pos[idx+2]+=(Math.random()-0.5)*0.10;
      const dist=Math.sqrt(pos[idx]**2+pos[idx+1]**2);
      if(dist>38||Math.random()<0.009){pos[idx]=(Math.random()-0.5)*0.3;pos[idx+1]=(Math.random()-0.5)*0.3;pos[idx+2]=(Math.random()-0.5)*0.3;}
      const fade=Math.max(0,1-dist/38);
      col[idx]=0.95*fade;col[idx+1]=0.85*fade;col[idx+2]=0.50*fade;
    }
    geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true;
  });
  return <points geometry={geo}><pointsMaterial size={0.20} vertexColors transparent opacity={0.30} blending={THREE.AdditiveBlending} depthWrite={false}/></points>;
}

function Comet() {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const LOOP_MS = 2*60*60*1000;
    const progress = (Date.now() % LOOP_MS) / LOOP_MS;
    ref.current.position.set(-55 + progress*110, 10 - progress*6, -40);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#ddd5c0" roughness={0.9} emissive="#ffeecc" emissiveIntensity={0.5} />
      </mesh>
      {/* tiny coma — barely visible */}
      <mesh scale={2}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial color="#99ccff" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <CometIonTail count={3500} />
      <CometDustTail count={1800} />
      <pointLight color="#99ccff" intensity={10} distance={45} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Meteors — FROM FILE 2 EXACTLY
// ---------------------------------------------------------------------------
function Meteor({ onDone }) {
  const ref = useRef();
  const props = useMemo(() => ({
    velocity: new THREE.Vector3(
      0.65+(Math.random()-0.5)*0.12, -0.50+(Math.random()-0.5)*0.12, -0.28+(Math.random()-0.5)*0.08
    ).normalize().multiplyScalar(1.1+Math.random()*0.5),
    length: 2.5+Math.random()*4,
    width: 0.04+Math.random()*0.06,
    start: new THREE.Vector3(-50+Math.random()*15, 28+Math.random()*18, -33+Math.random()*8),
  }), []);
  useEffect(()=>{ if(ref.current) ref.current.position.copy(props.start); },[]);
  useFrame(()=>{
    if(!ref.current) return;
    ref.current.position.add(props.velocity);
    ref.current.lookAt(ref.current.position.clone().add(props.velocity));
    ref.current.rotateY(Math.PI/2);
    if(ref.current.position.x>60||ref.current.position.y<-20) onDone();
  });
  return <mesh ref={ref}><boxGeometry args={[props.length,props.width,props.width]}/><meshBasicMaterial color="#ffffff" transparent opacity={0.75}/></mesh>;
}

function MeteorSystem() {
  const [meteors,setMeteors]=useState([]);
  useFrame(()=>{
    if(Math.random()<0.0008&&meteors.length<4) setMeteors(p=>[...p,Date.now()+Math.random()]);
    if(Math.random()<0.00005&&meteors.length<2) setMeteors(p=>[...p,...Array.from({length:6},(_,i)=>Date.now()+i*50)]);
  });
  const remove=id=>setMeteors(p=>p.filter(m=>m!==id));
  return <>{meteors.map(id=><Meteor key={id} onDone={()=>remove(id)}/>)}</>;
}

// ---------------------------------------------------------------------------
// Day Scene — FROM FILE 1 structure, with better sky + Gerstner ocean
// ---------------------------------------------------------------------------
function DaySystem({ config }) {
  const clouds = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  return (
    <EnvironmentWrapper>
      <DaySky />
      {clouds.map(i => <MovingCloud key={i} index={i} />)}
      <RealisticOcean color="#1a6b8a" />
      <Comet config={config} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 4, -20]} intensity={2.5} color="#ffcc77" />
      <hemisphereLight skyColor="#88aadd" groundColor="#2a4a3a" intensity={0.5} />
    </EnvironmentWrapper>
  );
}

// ---------------------------------------------------------------------------
// Night Scene — FROM FILE 1 structure, with File 2's space content
// ---------------------------------------------------------------------------
function NightSystem({ config }) {
  return (
    <EnvironmentWrapper>
      <NebulaSky />
      <StarField count={7000} />
      <MilkyWay />
      <MeteorSystem />
      <Comet config={config} />
      <Moon />
      <RealisticOcean color="#0a1828" />
      <ambientLight intensity={0.2} />
    </EnvironmentWrapper>
  );
}

// ---------------------------------------------------------------------------
// Main export — FROM FILE 1 EXACTLY (canvas setup, bg color, config handling)
// ---------------------------------------------------------------------------
export default function DynamicBackground({ mode, config }) {
  const isDark = mode === "dark";

  if (config?.type === "image" && config.url) {
    return (
      <div data-bg className="fixed inset-0 z-[-1] bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${config.url})` }} />
    );
  }

  if (config?.type === "gradient" && config.css) {
    return (
      <div data-bg className="fixed inset-0 z-[-1] transition-opacity duration-1000"
        style={{ background: config.css }} />
    );
  }

  return (
    <div data-bg className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-slate-100 dark:bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        {isDark ? (
          <NightSystem config={config} />
        ) : (
          <DaySystem config={config} />
        )}
      </Canvas>
    </div>
  );
}