import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

function Asteroid({ id, initialPos, velocity, onDestroyed, registerAsteroid }) {
  const ref = useRef();
  const rotSpeed = useRef(new Vector3(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02));

  // Register this asteroid so lasers can find it without React state syncs
  useEffect(() => {
    registerAsteroid(id, ref);
    return () => registerAsteroid(id, null);
  }, [id, registerAsteroid]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.position.addScaledVector(velocity, delta);
    ref.current.rotation.x += rotSpeed.current.x;
    ref.current.rotation.y += rotSpeed.current.y;
    ref.current.rotation.z += rotSpeed.current.z;
    
    // Cleanup if too far from camera
    if (ref.current.position.distanceTo(state.camera.position) > 2000) {
      onDestroyed(id);
    }
  });

  return (
    <mesh ref={ref} position={initialPos}>
      <dodecahedronGeometry args={[Math.random() * 5 + 3, 0]} />
      <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function Laser({ id, pos, dir, onHit, onDestroyed, getAsteroids }) {
  const ref = useRef();
  const speed = 250;
  const life = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.position.addScaledVector(dir, speed * delta);
    life.current += delta;
    
    if (life.current > 3) {
      onDestroyed(id);
      return;
    }

    // Check collisions directly against the refs
    const astMap = getAsteroids();
    for (const astId of Object.keys(astMap)) {
      const astRef = astMap[astId];
      if (astRef && astRef.current) {
        if (ref.current.position.distanceTo(astRef.current.position) < 8) {
          onHit(astId, ref.current.position.clone());
          onDestroyed(id);
          return;
        }
      }
    }
  });

  return (
    <mesh ref={ref} position={pos}>
      <boxGeometry args={[0.5, 0.5, 6]} />
      <meshBasicMaterial color="#0ff" />
    </mesh>
  );
}

export function AsteroidField({ isGameRunning, triggerExplosion }) {
  const [asteroids, setAsteroids] = useState([]);
  const [lasers, setLasers] = useState([]);
  
  // Real-time map of asteroid refs for collision
  const asteroidRefs = useRef({});
  const spawnTimer = useRef(0);

  const registerAsteroid = (id, ref) => {
    if (ref) {
      asteroidRefs.current[id] = ref;
    } else {
      delete asteroidRefs.current[id];
    }
  };

  const getAsteroids = () => asteroidRefs.current;

  // Spawner using useFrame (avoids React state dependency issues)
  useFrame((state, delta) => {
    if (!isGameRunning) return;
    
    spawnTimer.current += delta;
    if (spawnTimer.current > 0.5) { // Spawn every 0.5s
      spawnTimer.current = 0;
      
      setAsteroids(prev => {
        if (prev.length > 60) return prev; // Max 60 asteroids
        
        // Spawn around camera
        const spawnDist = 500;
        const angle = Math.random() * Math.PI * 2;
        const yAngle = (Math.random() - 0.5) * Math.PI;
        
        const center = state.camera.position;
        
        const pos = new Vector3(
          center.x + Math.cos(angle) * spawnDist,
          center.y + Math.sin(yAngle) * spawnDist,
          center.z + Math.sin(angle) * spawnDist
        );

        const vel = new Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        );

        return [...prev, { id: Math.random().toString(), pos, vel }];
      });
    }
  });

  // Shoot listener
  useEffect(() => {
    const handleShoot = (e) => {
      setLasers(prev => [...prev, { id: Math.random().toString(), pos: e.detail.pos, dir: e.detail.dir }]);
    };
    window.addEventListener('vc_shoot', handleShoot);
    return () => window.removeEventListener('vc_shoot', handleShoot);
  }, []);

  const handleHit = (astId, hitPos) => {
    setAsteroids(prev => prev.filter(a => a.id !== astId));
    triggerExplosion(hitPos, '#a8a29e');
  };

  return (
    <group>
      {asteroids.map(ast => (
        <Asteroid 
          key={ast.id} 
          id={ast.id} 
          initialPos={ast.pos} 
          velocity={ast.vel} 
          onDestroyed={(id) => setAsteroids(prev => prev.filter(a => a.id !== id))}
          registerAsteroid={registerAsteroid}
        />
      ))}
      
      {lasers.map(lsr => (
        <Laser 
          key={lsr.id}
          id={lsr.id}
          pos={lsr.pos}
          dir={lsr.dir}
          getAsteroids={getAsteroids}
          onHit={handleHit}
          onDestroyed={(id) => setLasers(prev => prev.filter(l => l.id !== id))}
        />
      ))}
    </group>
  );
}
