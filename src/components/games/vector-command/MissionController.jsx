import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { generatePuzzle } from './MathPuzzles';

export function MissionController({ shipPosition, onTriggerPuzzle, missionLevel, onMissionComplete, setTargetPos }) {
  const [target, setTarget] = useState(null);
  const [puzzle, setPuzzle] = useState(null);

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
  }, [puzzle, target]);

  useFrame((state, delta) => {
    if (target && target.active && shipPosition) {
      const dist = shipPosition.distanceTo(target.position);
      // Optional: logic for when you get close
    }
  });

  if (!target || !target.active) return null;

  return (
    <group>
      <mesh position={target.position}>
        <octahedronGeometry args={[8, 0]} />
        <meshStandardMaterial color={missionLevel === 1 ? '#0f8' : '#f44'} wireframe />
      </mesh>
    </group>
  );
}
