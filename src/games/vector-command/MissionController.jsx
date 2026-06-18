import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { generatePuzzle } from './MathPuzzles';
import { CAMPAIGN_MISSIONS } from './CampaignData';

function TargetMesh({ shape, color }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
      ref.current.rotation.x += delta * 0.5;
    }
  });

  const getGeometry = () => {
    switch (shape) {
      case 'box': return <boxGeometry args={[10, 10, 10]} />;
      case 'cone': return <coneGeometry args={[6, 16, 4]} />;
      case 'octahedron': return <octahedronGeometry args={[8, 0]} />;
      case 'sphere': return <sphereGeometry args={[8, 16, 16]} />;
      case 'torus': return <torusGeometry args={[8, 3, 16, 32]} />;
      case 'shield': return <planeGeometry args={[20, 20]} />;
      case 'satellite': return <cylinderGeometry args={[4, 4, 15, 8]} />;
      case 'core': return <dodecahedronGeometry args={[10, 0]} />;
      case 'prism': return <cylinderGeometry args={[0, 8, 16, 3]} />;
      case 'dreadnought': return <boxGeometry args={[30, 10, 50]} />;
      default: return <octahedronGeometry args={[8, 0]} />;
    }
  };

  return (
    <mesh ref={ref}>
      {getGeometry()}
      <meshStandardMaterial color={color} wireframe={shape !== 'shield' && shape !== 'dreadnought'} />
    </mesh>
  );
}

export function MissionController({ shipPosition, onTriggerPuzzle, missionLevel, onMissionComplete, setTargetPos }) {
  const [target, setTarget] = useState(null);
  const [puzzle, setPuzzle] = useState(null);

  const missionData = CAMPAIGN_MISSIONS.find(m => m.level === missionLevel) || CAMPAIGN_MISSIONS[0];

  useEffect(() => {
    const newPuzzle = generatePuzzle(missionLevel);
    if (!newPuzzle) {
      setTarget(null);
      setPuzzle(null);
      return;
    }
    
    let pos = new Vector3();
    if (newPuzzle.type === 'linear_combo') {
      pos.set(newPuzzle.target[0]*20, newPuzzle.target[1]*20, newPuzzle.target[2]*20);
    } else {
      pos.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 100,
        -150 - Math.random() * 300
      );
    }
    
    setTarget({ position: pos, active: true, id: missionLevel });
    setPuzzle(newPuzzle);
  }, [missionLevel]);

  useEffect(() => {
    if (puzzle && target) {
      onTriggerPuzzle(puzzle);
      if (setTargetPos) setTargetPos(target.position);
    }
  }, [puzzle, target, onTriggerPuzzle, setTargetPos]);

  useFrame((state, delta) => {
    if (target && target.active && shipPosition) {
      const dist = shipPosition.distanceTo(target.position);
      // Optional logic based on distance
    }
  });

  if (!target || !target.active) return null;

  return (
    <group position={target.position}>
      <TargetMesh 
        shape={missionData.environment.targetShape} 
        color={missionData.environment.planetColor} 
      />
      {/* Target Marker Ring */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[12, 14, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.5} side={2} />
      </mesh>
    </group>
  );
}
