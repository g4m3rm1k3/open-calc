import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CSS = `
.error-viz-wrap {
  --amber: #ffb800; --blue: #38b6ff; --red: #ff4545;
  background: #080c0f; color: #e8f4f8; font-family: 'DM Sans', sans-serif;
  overflow: hidden; display: flex; flex-direction: column; height: 100%;
}
.error-viz-wrap * { box-sizing: border-box; }

.error-viz-wrap .topbar {
  padding: 12px 20px;
  background: rgba(8,12,15,0.95);
  border-bottom: 1px solid #1e2d3d;
  display: flex;
  align-items: center;
  gap: 16px;
}
.error-viz-wrap .logo { font-weight: 800; font-size: 18px; color: var(--amber); }

.error-viz-wrap .main {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.error-viz-wrap .panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1e2d3d;
  background: #0f1923;
}
.error-viz-wrap .panel:last-child { border-right: none; }

.error-viz-wrap .panel-header {
  padding: 10px 16px;
  background: #151f2b;
  font-family: monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.error-viz-wrap .canvas-container {
  flex: 1;
  position: relative;
  min-height: 0;
}

.error-viz-wrap .info {
  padding: 14px;
  background: #151f2b;
  border-top: 1px solid #1e2d3d;
  font-size: 13px;
  line-height: 1.5;
}

.error-viz-wrap .controls {
  padding: 12px;
  background: #151f2b;
  border-top: 1px solid #1e2d3d;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.error-viz-wrap button {
  padding: 9px 16px;
  border-radius: 6px;
  border: 1px solid #1e2d3d;
  background: #0f1923;
  color: #e8f4f8;
  cursor: pointer;
  font-weight: 600;
}
.error-viz-wrap button:hover { border-color: var(--amber); color: var(--amber); }
.error-viz-wrap button.active { background: var(--amber); color: #080c0f; }

.error-viz-wrap .math-overlay {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(15,25,35,0.96);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #1e2d3d;
  font-family: monospace;
  font-size: 12.5px;
  pointer-events: none;
}
`;

export default function ErrorAccumulationViz({ height = 680 }) {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);

  const moves = [
    { cmd: "X10.0", abs: 10.0, inc: 10.0 },
    { cmd: "X19.9", abs: 19.9, inc: 9.9 },   // the typo
    { cmd: "X30.0", abs: 30.0, inc: 10.0 },
  ];

  // Refs for Three.js objects
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const toolAbsRef = useRef(null);
  const toolIncRef = useRef(null);
  const pathAbsRef = useRef(null);
  const pathIncRef = useRef(null);
  const positionsAbsRef = useRef([{ x: 0, y: 0.4 }]);
  const positionsIncRef = useRef([{ x: 0, y: 0.4 }]);
  const currentFrameRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isRunningRef = useRef(false);

  const updateVisuals = useCallback(() => {
    const frame = currentFrameRef.current;

    // Update paths
    if (pathAbsRef.current) {
      const points = positionsAbsRef.current.map(p => new THREE.Vector3(p.x, p.y, 0));
      pathAbsRef.current.geometry.dispose();
      pathAbsRef.current.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
    if (pathIncRef.current) {
      const points = positionsIncRef.current.map(p => new THREE.Vector3(p.x, p.y, 0));
      pathIncRef.current.geometry.dispose();
      pathIncRef.current.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }

    // Update tool positions
    if (toolAbsRef.current && frame < positionsAbsRef.current.length) {
      toolAbsRef.current.group.position.x = positionsAbsRef.current[frame].x;
    }
    if (toolIncRef.current && frame < positionsIncRef.current.length) {
      toolIncRef.current.group.position.x = positionsIncRef.current[frame].x;
    }

    setCurrentStep(frame);
  }, []);

  const runNextStep = useCallback(() => {
    if (currentFrameRef.current >= moves.length) {
      setIsPlaying(false);
      isRunningRef.current = false;
      return;
    }

    const move = moves[currentFrameRef.current];

    positionsAbsRef.current.push({ x: move.abs, y: 0.4 });
    const lastInc = positionsIncRef.current[positionsIncRef.current.length - 1];
    positionsIncRef.current.push({ x: lastInc.x + move.inc, y: 0.4 });

    currentFrameRef.current++;
    updateVisuals();
  }, [moves, updateVisuals]);

  const startPlayback = useCallback(() => {
    if (currentFrameRef.current >= moves.length) resetSimulation();
    setIsPlaying(true);
    isRunningRef.current = true;
  }, []);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    isRunningRef.current = false;
  }, []);

  const stepForward = useCallback(() => {
    pausePlayback();
    runNextStep();
  }, [pausePlayback, runNextStep]);

  const resetSimulation = useCallback(() => {
    pausePlayback();
    currentFrameRef.current = 0;
    positionsAbsRef.current = [{ x: 0, y: 0.4 }];
    positionsIncRef.current = [{ x: 0, y: 0.4 }];
    updateVisuals();
  }, [pausePlayback, updateVisuals]);

  // Initialize Three.js
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200); // aspect will be updated
    camera.position.set(18, 28, 35);
    camera.lookAt(15, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 300); // temporary
    rendererRef.current = renderer;

    // Add renderer to both canvas containers
    const canvases = container.querySelectorAll('.canvas-container');
    canvases.forEach((c, i) => {
      c.innerHTML = '';
      c.appendChild(renderer.domElement);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.target.set(15, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xaaaaaa, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(25, 40, 30);
    scene.add(dirLight);

    // Grid + Zero
    const grid = new THREE.GridHelper(60, 30, 0x223344, 0x223344);
    grid.position.y = 0.01;
    scene.add(grid);

    const zero = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.06, 32),
      new THREE.MeshLambertMaterial({ color: 0x00c875 })
    );
    zero.position.set(0, 0.03, 0);
    scene.add(zero);

    // Create tools
    const createTool = (color) => {
      const group = new THREE.Group();
      const shank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 9, 16),
        new THREE.MeshLambertMaterial({ color: 0x555555 })
      );
      shank.rotation.x = Math.PI / 2;
      shank.position.y = 4.5;

      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 32, 32),
        new THREE.MeshPhongMaterial({ color, shininess: 90 })
      );

      group.add(shank, tip);
      return { group, tip };
    };

    toolAbsRef.current = createTool(0x38b6ff);
    toolIncRef.current = createTool(0xffb800);

    scene.add(toolAbsRef.current.group);
    scene.add(toolIncRef.current.group);

    // Paths
    const createPath = (color) => {
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 6, transparent: true, opacity: 0.85 });
      return new THREE.Line(new THREE.BufferGeometry(), mat);
    };

    pathAbsRef.current = createPath(0x38b6ff);
    pathIncRef.current = createPath(0xffb800);

    scene.add(pathAbsRef.current);
    scene.add(pathIncRef.current);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();

      if (isRunningRef.current && isPlaying) {
        if (Math.random() < 0.15 * speed) runNextStep();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const resize = () => {
      const w = container.clientWidth / 2 - 2; // roughly half for each panel
      const h = container.clientHeight - 140; // leave space for headers/controls
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resize);
      if (renderer) renderer.dispose();
    };
  }, [speed, runNextStep, isPlaying]);

  return (
    <div ref={containerRef} className="error-viz-wrap" style={{ height: `${height}px` }}>
      <style>{CSS}</style>

      <div className="topbar">
        <div className="logo">G90 vs G91 — Error Accumulation</div>
        <div style={{ color: '#ff4545', fontFamily: 'monospace' }}>0.1 mm typo in move 2</div>
      </div>

      <div className="main">
        {/* Absolute */}
        <div className="panel">
          <div className="panel-header" style={{ color: '#38b6ff' }}>G90 — ABSOLUTE MODE</div>
          <div className="canvas-container" />
          <div className="info">
            Coordinates = destination from Work Zero (0,0)<br />
            Typo affects only that line.
          </div>
        </div>

        {/* Incremental */}
        <div className="panel">
          <div className="panel-header" style={{ color: '#ffb800' }}>G91 — INCREMENTAL MODE</div>
          <div className="canvas-container" />
          <div className="info">
            Coordinates = distance from current position<br />
            <span style={{ color: '#ff4545' }}>Error compounds</span> to all later moves.
          </div>
        </div>
      </div>

      <div className="controls">
        <button onClick={isPlaying ? pausePlayback : startPlayback}>
          {isPlaying ? '⏸ Pause' : '▶ Play Animation'}
        </button>
        <button onClick={stepForward}>Step →</button>
        <button onClick={resetSimulation}>Reset</button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          Speed:
          {[0.5, 1, 2].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={speed === s ? 'active' : ''}>
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="math-overlay">
        Step <strong>{currentStep}</strong>/3<br />
        Command: <span style={{ color: '#ffb800' }}>{currentStep > 0 ? moves[currentStep-1].cmd : '—'}</span><br />
        G90: X{(currentStep > 0 ? moves[currentStep-1].abs : 0).toFixed(1)} 
        G91: X{(positionsIncRef.current[currentStep] || {x:0}).x.toFixed(1)}
        {currentStep === 3 && <div style={{ color: '#ff4545', marginTop: 6 }}>← 0.1 mm error has propagated</div>}
      </div>
    </div>
  );
}