import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Vector3, Color } from 'three';
import { Ship } from './Ship';
import { MissionController } from './MissionController';
import { HUD } from './HUD';
import { StoryOverlay } from './StoryOverlay';
import { CAMPAIGN_MISSIONS } from './CampaignData';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function Explosion({ position, color = '#f84', onComplete }) {
  const ref = useRef();
  const [life, setLife] = useState(1);
  
  useFrame((state, delta) => {
    setLife(l => l - delta * 2);
    if (life <= 0 && onComplete) onComplete();
    if (ref.current) {
      ref.current.scale.setScalar(1 + (1 - life) * 8);
      ref.current.material.opacity = life;
    }
  });

  if (life <= 0) return null;

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
    </mesh>
  );
}

function Planet({ position, radius, color, wireframe }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function Galaxy({ position, color1, color2 }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.z -= delta * 0.02;
    }
  });
  
  return (
    <group ref={ref} position={position} rotation={[Math.PI / 4, 0, 0]}>
      <mesh>
        <ringGeometry args={[100, 300, 64]} />
        <meshBasicMaterial color={color1} transparent opacity={0.1} side={2} />
      </mesh>
      <mesh>
        <ringGeometry args={[150, 250, 64]} />
        <meshBasicMaterial color={color2} transparent opacity={0.15} side={2} />
      </mesh>
    </group>
  );
}

function Scene({ phase, missionLevel, onMissionComplete, setPuzzle, setTargetPos, setShipPos }) {
  const [explosions, setExplosions] = useState([]);
  
  const missionData = CAMPAIGN_MISSIONS.find(m => m.level === missionLevel) || CAMPAIGN_MISSIONS[0];
  const env = missionData.environment;

  const handleShipUpdate = useCallback((pos, rot, vel) => {
    setShipPos(pos);
  }, [setShipPos]);

  const handleTriggerPuzzle = useCallback((puzzle) => {
    setPuzzle(puzzle);
  }, [setPuzzle]);

  const triggerExplosion = (pos) => {
    setExplosions(prev => [...prev, { id: Math.random(), pos }]);
  };

  useEffect(() => {
    const handleSolveEvent = (e) => {
      triggerExplosion(e.detail.pos);
      setTimeout(() => {
        onMissionComplete();
      }, 1500);
    };
    window.addEventListener('vc_solve', handleSolveEvent);
    return () => window.removeEventListener('vc_solve', handleSolveEvent);
  }, [onMissionComplete]);

  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 5]} intensity={1} color="#e0f2fe" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Dynamic Background based on Mission */}
      <Planet position={[-200, 50, -400]} radius={80} color={env.planetColor} wireframe={env.wireframePlanet} />
      {env.galaxyColor1 !== "#000000" && (
        <Galaxy position={[0, -200, -800]} color1={env.galaxyColor1} color2={env.galaxyColor2} />
      )}
      
      <gridHelper args={[2000, 200, '#0ea5e9', '#0284c7']} position={[0, -100, 0]} rotation={[0, 0, 0]} material-opacity={0.15} material-transparent />

      {phase === 'gameplay' && (
        <Ship isGameRunning={true} position={[0, 0, 0]} onPositionUpdate={handleShipUpdate} />
      )}
      
      {phase === 'gameplay' && (
        <MissionController 
          missionLevel={missionLevel} 
          onTriggerPuzzle={handleTriggerPuzzle}
          setTargetPos={setTargetPos}
          shipPosition={null}
        />
      )}

      {explosions.map(ex => (
        <Explosion key={ex.id} position={ex.pos} onComplete={() => setExplosions(prev => prev.filter(e => e.id !== ex.id))} />
      ))}
    </>
  );
}

export default function VectorCommandGame() {
  const [phase, setPhase] = useState('splash'); // 'splash', 'story', 'gameplay'
  const [missionLevel, setMissionLevel] = useState(1);
  const [puzzle, setPuzzle] = useState(null);
  const [targetPos, setTargetPos] = useState(null);
  const [shipPos, setShipPos] = useState(null);
  const [passcodeInput, setPasscodeInput] = useState('');

  const startGame = (level) => {
    setMissionLevel(level);
    setPhase('story');
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    const mission = CAMPAIGN_MISSIONS.find(m => m.passcode === passcodeInput.toUpperCase());
    if (mission) {
      startGame(mission.level);
    } else {
      alert("Invalid SYS_CODE");
    }
  };

  const handleStoryComplete = () => {
    setPhase('gameplay');
  };

  const handleSolve = () => {
    if (targetPos) {
      window.dispatchEvent(new CustomEvent('vc_solve', { detail: { pos: targetPos } }));
    } else {
      handleMissionComplete();
    }
  };

  const handleMissionComplete = () => {
    if (missionLevel < CAMPAIGN_MISSIONS.length) {
      // Go to next mission
      setMissionLevel(prev => prev + 1);
      setPhase('story');
    } else {
      // Game won entirely
      setPhase('splash');
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-mono text-cyan-400">
      <Link 
        to="/games" 
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-cyan-500/30 text-cyan-500 rounded hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors text-xs font-bold"
      >
        <ArrowLeft size={14} /> ABORT MISSION
      </Link>

      {(phase === 'gameplay' || phase === 'story') && (
        <div className="absolute top-4 right-4 z-50 flex gap-4 px-4 py-2 bg-slate-900/80 border border-cyan-500/30 rounded text-xs font-bold">
          <div>HULL <span className="text-cyan-100">100%</span></div>
          <div className="text-cyan-700">|</div>
          <div className="text-emerald-400">MISSION {missionLevel}/5</div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 2, 5], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene 
            phase={phase} 
            missionLevel={missionLevel}
            onMissionComplete={handleMissionComplete}
            setPuzzle={setPuzzle}
            setTargetPos={setTargetPos}
            setShipPos={setShipPos}
          />
        </Suspense>
      </Canvas>

      {phase === 'story' && (
        <StoryOverlay missionId={missionLevel} onComplete={handleStoryComplete} />
      )}

      {phase === 'gameplay' && (
        <HUD 
          puzzle={puzzle} 
          targetPos={targetPos} 
          shipPos={shipPos} 
          onSolve={handleSolve} 
        />
      )}

      {phase === 'gameplay' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-20">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="14" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4"/>
            <line x1="20" y1="2" x2="20" y2="10" stroke="#22d3ee" strokeWidth="1"/>
            <line x1="20" y1="30" x2="20" y2="38" stroke="#22d3ee" strokeWidth="1"/>
            <line x1="2" y1="20" x2="10" y2="20" stroke="#22d3ee" strokeWidth="1"/>
            <line x1="30" y1="20" x2="38" y2="20" stroke="#22d3ee" strokeWidth="1"/>
            <circle cx="20" cy="20" r="2" fill="#22d3ee" fillOpacity="0.7"/>
          </svg>
        </div>
      )}

      {phase === 'splash' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="text-xs tracking-[0.2em] text-emerald-500 mb-2">// LINEAR ALGEBRA COMBAT SYSTEM //</div>
          <h1 className="text-5xl md:text-7xl font-black text-cyan-400 tracking-widest mb-6" style={{ textShadow: '0 0 30px rgba(34,211,238,1)' }}>
            VECTOR COMMAND
          </h1>
          <p className="max-w-xl text-center text-cyan-200/80 leading-relaxed text-sm mb-10">
            You are the navigator of a deep-space interceptor. Your weapons and navigation systems are locked behind <strong className="text-cyan-400">linear algebra</strong>.
            Solve the problems. Fire the cannons. Survive.
          </p>
          
          <button 
            onClick={() => startGame(1)}
            className="px-10 py-4 mb-10 border border-cyan-400 text-cyan-400 font-bold tracking-[0.2em] hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all uppercase"
          >
            START NEW CAMPAIGN →
          </button>

          <div className="w-full max-w-sm p-6 bg-slate-900 border border-cyan-500/20 rounded">
            <div className="text-cyan-500 text-xs tracking-widest mb-4">RESTORE PROGRESS (SYS_CODE)</div>
            <form onSubmit={handlePasscodeSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="ENTER CODE..."
                className="flex-1 bg-slate-950 border border-cyan-500/50 px-3 py-2 text-cyan-300 font-bold tracking-widest outline-none focus:border-cyan-400"
              />
              <button type="submit" className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/40">
                DECODE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
