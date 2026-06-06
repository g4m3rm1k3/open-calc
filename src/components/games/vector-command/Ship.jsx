import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Euler } from 'three';

const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false, ' ': false, shift: false };

export function Ship({ position, onPositionUpdate, isGameRunning }) {
  const shipRef = useRef();
  
  // Physics state
  const velocity = useRef(new Vector3(0, 0, 0));
  const rotation = useRef(new Euler(0, 0, 0, 'YXZ'));
  
  const speed = 40;
  const drag = 0.95;

  // Mouse look
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastMouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const isMouseDown = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keys.hasOwnProperty(key)) {
        keys[key] = true;
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
          e.preventDefault();
        }
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keys.hasOwnProperty(key)) keys[key] = false;
    };

    const handleMouseDown = (e) => {
      isMouseDown.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isMouseDown.current = false; };
    const handleMouseMove = (e) => {
      if (!isMouseDown.current || !isGameRunning) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotation.current.y -= dx * 0.003;
      rotation.current.x -= dy * 0.003;
      // Clamp pitch
      rotation.current.x = Math.max(-1.2, Math.min(1.2, rotation.current.x));
      
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isGameRunning]);

  useFrame((state, delta) => {
    if (!shipRef.current || !isGameRunning) return;
    
    shipRef.current.rotation.copy(rotation.current);

    // Thrust directions relative to camera/ship rotation
    const fwd = new Vector3(0, 0, -1).applyEuler(rotation.current);
    const right = new Vector3(1, 0, 0).applyEuler(rotation.current);
    const up = new Vector3(0, 1, 0);

    const move = new Vector3(0, 0, 0);
    if (keys.w || keys.arrowup) move.add(fwd);
    if (keys.s || keys.arrowdown) move.sub(fwd);
    if (keys.d || keys.arrowright) move.add(right);
    if (keys.a || keys.arrowleft) move.sub(right);
    if (keys[' ']) move.add(up);
    if (keys.shift) move.sub(up);

    if (move.length() > 0) move.normalize();
    
    // Apply acceleration
    velocity.current.lerp(move.multiplyScalar(speed * delta), 0.15);
    
    // Apply velocity
    shipRef.current.position.add(velocity.current);
    
    // Update camera to follow ship precisely (FPS or slightly behind)
    // The prototype uses FPS style. Let's position camera right at the cockpit
    const cameraOffset = new Vector3(0, 2, 5).applyEuler(rotation.current);
    const targetCameraPos = shipRef.current.position.clone().add(cameraOffset);
    state.camera.position.lerp(targetCameraPos, 0.3);
    
    // Look slightly ahead
    const lookTarget = shipRef.current.position.clone().add(new Vector3(0, 0, -100).applyEuler(rotation.current));
    state.camera.lookAt(lookTarget);
    
    // Send position to parent (e.g. for collision/HUD)
    if (onPositionUpdate) {
      onPositionUpdate(shipRef.current.position.clone(), rotation.current.clone(), velocity.current.clone());
    }
  });

  return (
    <group ref={shipRef} position={position}>
      {/* Ship Model - sleek fighter */}
      <mesh castShadow>
        <coneGeometry args={[1, 4, 3]} />
        <meshStandardMaterial color="#0ff" roughness={0.2} metalness={0.9} wireframe />
      </mesh>
    </group>
  );
}
