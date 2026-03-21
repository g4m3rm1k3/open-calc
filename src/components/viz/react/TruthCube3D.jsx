import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function TruthCube3D() {
  const mountRef = useRef(null);
  const [expression, setExpression] = useState('P && Q');
  const [operator, setOperator] = useState('AND');

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Setup Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Logic Space Generation (2x2x2)
    const cubes = [];
    const spacing = 1.2;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    
    // Materials
    const trueMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981, // emerald-500
      emissive: 0x059669,
      transmission: 0.2,
      roughness: 0.1,
      metalness: 0.1
    });
    
    const falseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x334155, // slate-700
      transparent: true,
      opacity: 0.2, // Ghostly disabled
      roughness: 0.9
    });

    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.5 }); // slate-800

    // Build the 8 universes
    for(let p = 0; p < 2; p++) {
      for(let q = 0; q < 2; q++) {
        for(let r = 0; r < 2; r++) {
          const valP = p === 1;
          const valQ = q === 1;
          const valR = r === 1;

          // Evaluate logic based on state
          let isTrue = false;
          if (operator === 'AND') isTrue = valP && valQ && valR;
          else if (operator === 'OR') isTrue = valP || valQ || valR;
          else if (operator === 'XOR') isTrue = (valP ^ valQ) ^ valR;
          else if (operator === 'P_AND_Q_OR_R') isTrue = (valP && valQ) || valR;

          // Mesh
          const mesh = new THREE.Mesh(geometry, isTrue ? trueMaterial : falseMaterial);
          mesh.position.set(
            (p - 0.5) * spacing,
            (q - 0.5) * spacing,
            (r - 0.5) * spacing
          );
          
          // Wireframe Edge
          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(edges, edgeMaterial);
          mesh.add(line);
          
          scene.add(mesh);
          cubes.push(mesh);
        }
      }
    }

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      scene.rotation.y += 0.005;
      scene.rotation.x += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize Automatically
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if(mountRef.current && renderer.domElement) {
         mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [operator]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-700">
      
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between z-10">
         <div>
            <h3 className="font-bold text-white mb-1">Truth Space (P, Q, R)</h3>
            <p className="text-xs text-slate-400">Green = True in that universe</p>
         </div>
         <div className="flex gap-2 bg-slate-900 p-1 border border-slate-700 rounded-md">
           <button onClick={() => setOperator('AND')} className={`px-2 py-1 text-xs font-bold rounded ${operator === 'AND' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>AND</button>
           <button onClick={() => setOperator('OR')} className={`px-2 py-1 text-xs font-bold rounded ${operator === 'OR' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>OR</button>
           <button onClick={() => setOperator('XOR')} className={`px-2 py-1 text-xs font-bold rounded ${operator === 'XOR' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>XOR</button>
           <button onClick={() => setOperator('P_AND_Q_OR_R')} className={`px-2 py-1 text-xs font-bold rounded ${operator === 'P_AND_Q_OR_R' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>(P∧Q)∨R</button>
         </div>
      </div>

      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-80 relative cursor-move"></div>
    </div>
  );
}
