import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// ── Scoped CSS (all selectors under .golf-wrap) ─────────────────
const CSS = `
.golf-wrap {
  --green:   #00c875;
  --lime:    #b8ff3e;
  --amber:   #ffb800;
  --red:     #ff4545;
  --blue:    #38b6ff;
  --purple:  #9b5de5;
  --bg:      #080c0f;
  --surface: #0f1923;
  --card:    #151f2b;
  --border:  #1e2d3d;
  --text:    #e8f4f8;
  --muted:   #5a7a8a;
  --mono:    'DM Mono', monospace;
  --sans:    'DM Sans', sans-serif;
  --display: 'Syne', sans-serif;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  overflow: hidden;
}
.golf-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
.golf-wrap canvas { display: block; }

.golf-wrap .g-hud { position: absolute; inset: 0; pointer-events: none; display: flex; flex-direction: column; }

.golf-wrap .g-topbar {
  pointer-events: auto;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 18px;
  background: rgba(8,12,15,0.92);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}
.golf-wrap .g-topbar .logo {
  font-family: var(--display); font-size: 17px; font-weight: 800;
  letter-spacing: -.5px; color: var(--lime);
}
.golf-wrap .level-pills { display: flex; gap: 6px; }
.golf-wrap .lpill {
  font-family: var(--display); font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 20px; cursor: pointer;
  border: 1px solid var(--border); background: var(--card); color: var(--muted);
  transition: all .18s;
}
.golf-wrap .lpill.active { background: var(--lime); color: #080c0f; border-color: var(--lime); }
.golf-wrap .lpill.completed { border-color: var(--green); color: var(--green); }
.golf-wrap .g-topbar .spacer { flex: 1; }
.golf-wrap .tb-btn {
  pointer-events: auto;
  font-family: var(--display); font-size: 12px; font-weight: 700;
  padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--card); color: var(--text); cursor: pointer; transition: all .15s;
}
.golf-wrap .tb-btn:hover { border-color: var(--lime); color: var(--lime); }
.golf-wrap .tb-btn.active { background: var(--lime); color: #080c0f; border-color: var(--lime); }
.golf-wrap .stroke-badge {
  font-family: var(--mono); font-size: 12px; color: var(--muted);
  padding: 4px 10px; background: var(--card); border-radius: 6px;
  border: 1px solid var(--border);
}

.golf-wrap .g-main { display: flex; flex: 1; overflow: hidden; }

.golf-wrap .g-left {
  pointer-events: auto;
  width: 260px; flex-shrink: 0;
  background: rgba(8,12,15,0.94);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow-y: auto;
  padding: 14px;
  gap: 14px;
}
.golf-wrap .g-left h3 { font-family: var(--display); font-size: 13px; font-weight: 700; color: var(--lime); letter-spacing: .04em; text-transform: uppercase; }

.golf-wrap .ctrl { display: flex; flex-direction: column; gap: 5px; }
.golf-wrap .ctrl-row { display: flex; justify-content: space-between; align-items: center; }
.golf-wrap .ctrl-label { font-size: 12px; color: var(--muted); font-family: var(--sans); }
.golf-wrap .ctrl-val { font-family: var(--mono); font-size: 12px; color: var(--lime); }
.golf-wrap input[type=range] { width: 100%; accent-color: var(--lime); height: 3px; cursor: pointer; }

.golf-wrap .eq-box {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; padding: 10px 12px;
  font-family: var(--mono); font-size: 11px; line-height: 1.8; color: var(--muted);
}
.golf-wrap .eq-box .eq-live { color: var(--lime); }
.golf-wrap .eq-box .eq-hl  { color: var(--amber); }
.golf-wrap .eq-box strong   { color: var(--text); }

.golf-wrap .btn-putt {
  pointer-events: auto;
  width: 100%; padding: 10px; border-radius: 10px;
  background: var(--lime); color: #080c0f;
  font-family: var(--display); font-size: 14px; font-weight: 800;
  border: none; cursor: pointer; letter-spacing: .02em;
  transition: all .15s;
}
.golf-wrap .btn-putt:hover { filter: brightness(1.1); transform: scale(1.02); }
.golf-wrap .btn-putt:disabled { background: var(--border); color: var(--muted); transform: none; filter: none; cursor: not-allowed; }

.golf-wrap .force-row { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; }
.golf-wrap .force-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.golf-wrap .force-row input { accent-color: var(--lime); cursor: pointer; }

.golf-wrap .level-desc {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 8px; padding: 10px 12px; font-size: 11px; line-height: 1.6; color: var(--muted);
}
.golf-wrap .level-desc strong { color: var(--text); }
.golf-wrap .level-desc .concept { display: inline-block; font-family: var(--mono); font-size: 10px; padding: 1px 6px; border-radius: 4px; background: var(--border); color: var(--blue); margin-top: 4px; }

.golf-wrap .g-right {
  pointer-events: auto;
  width: 240px; flex-shrink: 0;
  background: rgba(8,12,15,0.94);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow-y: auto;
  padding: 14px;
  gap: 14px;
}
.golf-wrap .g-right h3 { font-family: var(--display); font-size: 13px; font-weight: 700; color: var(--blue); letter-spacing: .04em; text-transform: uppercase; }

.golf-wrap .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.golf-wrap .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.golf-wrap .stat-card .sk { font-size: 10px; color: var(--muted); margin-bottom: 2px; }
.golf-wrap .stat-card .sv { font-family: var(--mono); font-size: 14px; font-weight: 500; color: var(--text); }
.golf-wrap .stat-card .sv.green { color: var(--green); }
.golf-wrap .stat-card .sv.amber { color: var(--amber); }
.golf-wrap .stat-card .sv.blue  { color: var(--blue); }

.golf-wrap .replay-bar { display: flex; flex-direction: column; gap: 8px; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 10px; }
.golf-wrap .replay-controls { display: flex; gap: 6px; align-items: center; }
.golf-wrap .rbc { flex: 1; padding: 5px 0; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-family: var(--display); font-size: 11px; font-weight: 700; cursor: pointer; text-align: center; transition: all .12s; }
.golf-wrap .rbc:hover { border-color: var(--blue); color: var(--blue); }
.golf-wrap .rbc.active { background: var(--blue); border-color: var(--blue); color: #080c0f; }
.golf-wrap input[type=range]#mg-replay-scrub { accent-color: var(--blue); }
.golf-wrap .replay-speed-row { display: flex; gap: 4px; justify-content: center; }
.golf-wrap .spd-btn { font-family: var(--mono); font-size: 10px; padding: 3px 7px; border-radius: 5px; border: 1px solid var(--border); background: var(--bg); color: var(--muted); cursor: pointer; transition: all .12s; }
.golf-wrap .spd-btn.active { background: var(--amber); border-color: var(--amber); color: #080c0f; }

.golf-wrap .apply-force { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.golf-wrap .af-row { display: flex; gap: 6px; align-items: center; }
.golf-wrap .af-label { font-size: 11px; color: var(--muted); width: 50px; flex-shrink: 0; }
.golf-wrap .af-val   { font-family: var(--mono); font-size: 11px; color: var(--purple); width: 36px; text-align: right; }
.golf-wrap input[type=range].purple { accent-color: var(--purple); }
.golf-wrap .btn-apply { width: 100%; padding: 7px; border-radius: 7px; background: var(--purple); color: #fff; font-family: var(--display); font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all .15s; }
.golf-wrap .btn-apply:hover { filter: brightness(1.15); }
.golf-wrap .btn-apply:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; filter: none; }

.golf-wrap .g-overlay {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: rgba(8,12,15,0.8);
  backdrop-filter: blur(6px);
  z-index: 100;
  pointer-events: auto;
}
.golf-wrap .overlay-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px 36px; max-width: 480px; width: 90%; text-align: center; box-shadow: 0 40px 80px #000a; }
.golf-wrap .overlay-card h1 { font-family: var(--display); font-size: 36px; font-weight: 800; color: var(--lime); margin-bottom: 8px; }
.golf-wrap .overlay-card p  { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 20px; }
.golf-wrap .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
.golf-wrap .result-cell { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px; }
.golf-wrap .result-cell .rk { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
.golf-wrap .result-cell .rv { font-family: var(--mono); font-size: 15px; font-weight: 500; color: var(--lime); }
.golf-wrap .overlay-btns { display: flex; gap: 10px; justify-content: center; }
.golf-wrap .ob { padding: 10px 22px; border-radius: 10px; font-family: var(--display); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; border: 1px solid var(--border); background: var(--bg); color: var(--text); }
.golf-wrap .ob.primary { background: var(--lime); color: #080c0f; border-color: var(--lime); }
.golf-wrap .ob:hover { transform: scale(1.04); }
.golf-wrap .insight-box { background: var(--bg); border: 1px solid var(--green); border-radius: 10px; padding: 12px 14px; text-align: left; font-size: 12px; line-height: 1.7; color: var(--muted); margin-bottom: 20px; }
.golf-wrap .insight-box strong { color: var(--green); }

.golf-wrap .g-canvas-wrap { flex: 1; position: relative; overflow: hidden; pointer-events: auto; }
.golf-wrap .g-canvas-wrap canvas { position: absolute; inset: 0; }

.golf-wrap .g-toast {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: var(--card); border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 16px;
  font-family: var(--mono); font-size: 12px; color: var(--lime);
  pointer-events: none; opacity: 0; transition: opacity .3s;
  white-space: nowrap; z-index: 200;
}
`;

const G_CONST = 9.81;
const BALL_R  = 0.22;
const HOLE_R  = 0.6;

export default function MiniGolfGame({ params = {}, height: rootHeight = 640, onClose }) {
  const height = rootHeight || params?.height || 640;
  const wrapRef = useRef(null);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;

    // Scoped element query — all IDs are prefixed mg- in the JSX
    const q  = id  => root.querySelector('#mg-' + id);
    const qq = cls => root.querySelectorAll('.' + cls);

    // ── Game state ─────────────────────────────────────────────
    let scene, camera, renderer, clock, controls;
    let ball3d, arrowMeshes = {}, trailPoints = [], trailLine;
    let obstacles3d = [];
    let pos, vel;
    let ballActive = false;
    let slowMo = false;
    let showForces = true;
    let rollTime = 0, rollDist = 0, initialKE = 0;
    let stroke = 1;
    let windForce = new THREE.Vector3(0, 0, 0);
    let recordedFrames = [];
    let isReplaying = false;
    let replayIdx = 0;
    let replaySpeed = 1;
    let replayPlaying = false;
    let currentLevel = 0;
    let levelStats = [];
    let windParticles = null;
    let aimArrow = null;
    let stopped = false;

    // loop-the-loop state
    let loopMode = false;
    let loopSpeed = 0;    // scalar speed along track (positive = CCW)
    let loopAngle = 0;    // angle from +X axis about loop center; -π/2 = bottom
    let loopData  = null; // { cx, cz, r } of current loop

    const FORCES = {
      velocity: { label: 'Velocity (v)',  color: '#38b6ff', on: true },
      friction: { label: 'Friction (f)',  color: '#ff4545', on: true },
      normal:   { label: 'Normal (N)',    color: '#00c875', on: true },
      net:      { label: 'Net force',     color: '#ffb800', on: true },
      wind:     { label: 'Wind / field',  color: '#9b5de5', on: true },
    };

    // ── Level definitions ──────────────────────────────────────
    const LEVELS = [
      {
        name: 'L1 — Vectors', par: 2,
        concept: 'Vector decomposition & friction',
        desc: '<strong>Concept: Linear motion, friction, energy dissipation.</strong><br>Aim the ball from the tee to the cup. Adjust power and angle. Watch kinetic energy (½mv²) drain to zero as friction converts it to heat.<br><span class="concept">F = μ·N = μ·mg</span> <span class="concept">KE = ½mv²</span>',
        tee:  new THREE.Vector3(-10, BALL_R, 0),
        hole: new THREE.Vector3( 10, BALL_R, 0),
        friction: 0.18,
        wind: new THREE.Vector3(0, 0, 0),
        obstacles: [
          { type:'sand', x:4, z:3, r:2.5 },
          { type:'sand', x:4, z:-3, r:2.5 },
        ],
        walls: [
          { type:'rect', x1:-14, z1:-4, x2:14, z2:-4 },
          { type:'rect', x1:-14, z1: 4, x2:14, z2: 4 },
        ],
        insight: 'Friction force F = μmg decelerates the ball at a = μg = ' + (0.18*9.81).toFixed(2) + ' m/s². Doubling friction halves rolling distance. This is Newton\'s second law: F = ma.',
      },
      {
        name: 'L2 — Bank Shot', par: 2,
        concept: 'Reflection, momentum, impulse',
        desc: '<strong>Concept: Elastic wall reflections, momentum transfer.</strong><br>Bounce the ball off banked walls to reach the cup. The angle of incidence equals the angle of reflection — just like light.<br><span class="concept">p = mv</span> <span class="concept">θᵢ = θᵣ (reflection)</span>',
        tee:  new THREE.Vector3(-10, BALL_R, -5),
        hole: new THREE.Vector3( 10, BALL_R,  5),
        friction: 0.14,
        wind: new THREE.Vector3(0, 0, 0),
        obstacles: [
          { type:'bank', x:-2, z:0, w:12, rot: Math.PI/4, restitution: 0.85 },
        ],
        walls: [
          { type:'rect', x1:-14, z1:-8, x2:14, z2:-8 },
          { type:'rect', x1:-14, z1: 8, x2:14, z2: 8 },
          { type:'rect', x1:-14, z1:-8, x2:-14, z2: 8 },
          { type:'rect', x1: 14, z1:-8, x2: 14, z2: 8 },
        ],
        insight: 'When a ball bounces off a wall, momentum is conserved along the wall axis, and reversed (×restitution) perpendicular to it. Restitution e=1 = perfectly elastic. Real golf: e≈0.7–0.9.',
      },
      {
        name: 'L3 — Roundabout', par: 3,
        concept: 'Centripetal force & circular paths',
        desc: '<strong>Concept: Centripetal force, circular motion.</strong><br>A rotating barrier sweeps the green. Time your putt to pass through the gap, or watch it redirect you. The barrier applies an impulsive centripetal force.<br><span class="concept">F꜀ = mv²/r</span> <span class="concept">a = v²/r</span>',
        tee:  new THREE.Vector3(-11, BALL_R, 0),
        hole: new THREE.Vector3( 11, BALL_R, 0),
        friction: 0.16,
        wind: new THREE.Vector3(0, 0, 0),
        obstacles: [
          { type:'spinner', cx:0, cz:0, r:5, armW:0.5, armLen:9, speed:0.9, phase:0 },
        ],
        walls: [
          { type:'rect', x1:-14, z1:-5, x2:14, z2:-5 },
          { type:'rect', x1:-14, z1: 5, x2:14, z2: 5 },
        ],
        insight: 'For circular motion, F꜀ = mv²/r points toward the center. At v=10, r=5: F꜀ = 20 N/kg. The spinner arm redirects the ball by applying a brief impulsive force — changing momentum without doing much work.',
      },
      {
        name: 'L4 — Tunnel', par: 2,
        concept: 'Projectile motion & blind prediction',
        desc: '<strong>Concept: Kinematic prediction — aim without seeing.</strong><br>The ball passes through a tunnel. Inside, you see nothing — predict where it exits using kinematics. Ball exits where: x = x₀ + v·t<br><span class="concept">x(t) = x₀ + v₀t - ½μgt²</span>',
        tee:  new THREE.Vector3(-12, BALL_R, 0),
        hole: new THREE.Vector3( 12, BALL_R, 0),
        friction: 0.12,
        wind: new THREE.Vector3(0, 0, 0),
        obstacles: [
          { type:'tunnel', x1:-4, x2:4, z:-1.2, z2:1.2, exitForce:0 },
        ],
        walls: [
          { type:'rect', x1:-14, z1:-4, x2:14, z2:-4 },
          { type:'rect', x1:-14, z1: 4, x2:14, z2: 4 },
        ],
        insight: 'Inside the tunnel the ball follows the exact same kinematic equations — friction still decelerates it. If you know v₀ and μ, you can compute exactly where it exits and at what speed: v = √(v₀² - 2μg·d)',
      },
      {
        name: 'L5 — Wind', par: 3,
        concept: 'Vector fields & superposition',
        desc: '<strong>Concept: Vector field superposition — wind + friction.</strong><br>A wind field applies a constant sideways force while friction decelerates. Net force is the vector SUM. Adjust angle to compensate.<br><span class="concept">F_net = F_friction + F_wind</span> <span class="concept">a = F/m</span>',
        tee:  new THREE.Vector3(-11, BALL_R, 0),
        hole: new THREE.Vector3( 11, BALL_R, 0),
        friction: 0.16,
        wind: new THREE.Vector3(0, 0, 5.5),
        obstacles: [],
        walls: [
          { type:'rect', x1:-14, z1:-6, x2:14, z2:-6 },
          { type:'rect', x1:-14, z1: 6, x2:14, z2: 6 },
        ],
        insight: 'Net acceleration a = -μg·v̂ + F_wind/m. The ball curves because wind continuously adds Z-velocity while friction reduces total speed. To compensate: aim "into" the wind — an upwind angle that lets the wind push you onto line.',
      },
      {
        name: 'Hole 6 — The Kelty Loop', par: 3,
        concept: 'Centripetal Force & Minimum Velocity',
        desc: '<strong>Concept: Centripetal force vs. Gravity.</strong><br>You must hit the ball with enough speed to stay on the loop! If velocity drops below √(gr), gravity wins and the ball falls.<br><span class="concept">v_min = √(g·r)</span>',
        tee:  new THREE.Vector3(-12, BALL_R, 0),
        hole: new THREE.Vector3( 12, BALL_R, 0),
        friction: 0.1,
        wind: new THREE.Vector3(0, 0, 0),
        obstacles: [
          { type:'loop', x:0, z:0, r:4, w:2 },
        ],
        walls: [
          { type:'rect', x1:-14, z1:-4, x2:14, z2:-4 },
          { type:'rect', x1:-14, z1: 4, x2:14, z2: 4 },
        ],
        insight: 'To go upside down, the normal force must be > 0 at the top. This happens if v² / r ≥ g.',
      },
      {
        name: 'Hole 7 — Curved Greens', par: 3,
        concept: 'Potential Energy & Slopes',
        desc: '<strong>Concept: Gravitational potential energy on sloped grass.</strong><br>The green curves upward. Hit it hard to crest the hill, or watch it roll back down.<br><span class="concept">ΔPE = mgΔh</span>',
        tee:  new THREE.Vector3(-12, BALL_R, 0),
        hole: new THREE.Vector3( 12, BALL_R, 0),
        friction: 0.1,
        wind: new THREE.Vector3(0, 0, 0),
        obstacles: [
          { type:'hill', x:0, z:0, w:8, d:10, h:2 },
        ],
        walls: [
          { type:'rect', x1:-14, z1:-6, x2:14, z2:-6 },
          { type:'rect', x1:-14, z1: 6, x2:14, z2: 6 },
        ],
        insight: 'Gravity pulls the ball down the gradient. Kinetic energy is converted to potential energy as you go up.',
      },
      {
        name: 'Hole 8 — Pulsing Green', par: 4,
        concept: 'Oscillating External Forces',
        desc: '<strong>Concept: Time-varying force fields.</strong><br>The green itself is expanding and contracting, applying a radial impulse. Time your putt to use the expansion for a boost!<br><span class="concept">F(t) = F₀ sin(ωt)</span>',
        tee:  new THREE.Vector3(-12, BALL_R, 0),
        hole: new THREE.Vector3( 12, BALL_R, 0),
        friction: 0.15,
        wind: new THREE.Vector3(0, 0, 0),
        obstacles: [],
        dynamicGreen: true,
        walls: [
          { type:'rect', x1:-14, z1:-6, x2:14, z2:-6 },
          { type:'rect', x1:-14, z1: 6, x2:14, z2: 6 },
        ],
        insight: 'Dynamic environments require spatial and temporal planning. The "force" here is a change in velocity Δv based on the distance from the center.',
      },
      {
        name: 'Hole 9 — Double Peak Valley', par: 4,
        concept: 'Potential Well',
        desc: '<strong>Concept: Navigation through a potential well.</strong><br>Two hills sandwich a deep valley. You must gain enough speed on the first descent to scale the second peak.<br><span class="concept">KE + PE = Constant</span>',
        tee:  new THREE.Vector3(-18, BALL_R, 0),
        hole: new THREE.Vector3( 18, BALL_R, 0),
        friction: 0.1,
        wind: new THREE.Vector3(0, 0, 0),
        greenSize: { w: 45, d: 25 },
        walls: [{ type:'rect', x1:-22, z1:-8, x2:22, z2:-8 }, { type:'rect', x1:-22, z1: 8, x2:22, z2: 8 }],
        obstacles: [
          { type:'hill', x:-10, z:0, w:12, d:12, h:3 },
          { type:'valley', x:0, z:0, w:15, d:15, h:4 },
          { type:'hill', x:10, z:0, w:12, d:12, h:3 },
        ],
        insight: 'Energy is conserved (minus friction). The depth of the valley provides kinetic energy boost, but you must keep enough to reach the cup on the other side.',
      },
      {
        name: 'Hole 10 — The Half-Pipe', par: 3,
        concept: 'Oscillation',
        desc: '<strong>Concept: Lateral potential energy.</strong><br>The green is curved like a half-pipe. Aim slightly up the bank to let the curve guide you to the hole.<br><span class="concept">a_curve = g·sin(θ)</span>',
        tee:  new THREE.Vector3(-18, BALL_R, 3),
        hole: new THREE.Vector3( 18, BALL_R, -3),
        friction: 0.08,
        wind: new THREE.Vector3(0, 0, 0),
        greenSize: { w: 50, d: 30 },
        walls: [],
        obstacles: [
          { type:'valley', x:0, z:0, w:60, d:15, h:5 },
        ],
        insight: 'A continuous valley creates a restoring force toward the center. Use the banks to steer!',
      },
      {
        name: 'Hole 11 — The Oasis', par: 4,
        concept: 'Discontinuous Friction',
        desc: '<strong>Concept: Different surfaces have different friction coefficients.</strong><br>Sand traps drastically increase the deceleration force μg. Water traps are out of bounds and apply a penalty!<br><span class="concept">f_k = μ_k N</span>',
        tee:  new THREE.Vector3(-15, BALL_R, 0),
        hole: new THREE.Vector3( 15, BALL_R, 0),
        friction: 0.12,
        wind: new THREE.Vector3(0, 0, 0),
        greenSize: { w: 40, d: 25 },
        walls: [{ type:'rect', x1:-20, z1:-12, x2:20, z2:-12 }, { type:'rect', x1:-20, z1: 12, x2:20, z2: 12 }],
        obstacles: [
          { type:'sand', x:-5, z:5, r:4.5 },
          { type:'sand', x:-5, z:-5, r:4.5 },
          { type:'water', x:5, z:0, r:5.5 },
        ],
        insight: 'Entering sand multiplies friction by 3, rapidly draining kinetic energy. Water terminates the ball state.',
      },
    ];

    // ── Three.js init ──────────────────────────────────────────
    function initThree() {
      const wrap = q('canvas-wrap');
      const W = wrap.clientWidth, H = wrap.clientHeight;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x080c0f);
      scene.fog = new THREE.FogExp2(0x080c0f, 0.018);

      camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 600);
      camera.position.set(0, 26, 30);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ canvas: q('canvas3d'), antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.minDistance = 5;
      controls.maxDistance = 100;

      const hemi = new THREE.HemisphereLight(0x90cfff, 0x1a8c2e, 0.6);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xfff5e0, 1.3);
      dir.position.set(10, 28, 15);
      dir.castShadow = true;
      dir.shadow.mapSize.set(1024, 1024);
      dir.shadow.camera.near = 0.5;
      dir.shadow.camera.far  = 80;
      dir.shadow.camera.left = dir.shadow.camera.bottom = -20;
      dir.shadow.camera.right = dir.shadow.camera.top   =  20;
      scene.add(dir);
      scene.add(new THREE.AmbientLight(0x223344, 0.5));

      clock = new THREE.Clock();
    }

    function onResize() {
      const wrap = q('canvas-wrap');
      if (!wrap || !camera) return;
      const W = wrap.clientWidth, H = wrap.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }

    // ── Level building ─────────────────────────────────────────
    function buildLevel(idx) {
      currentLevel = idx;
      for (let obj of obstacles3d) scene.remove(obj);
      obstacles3d = [];
      if (trailLine) { scene.remove(trailLine); trailLine = null; }
      trailPoints = [];
      for (let k in arrowMeshes) { scene.remove(arrowMeshes[k]); }
      arrowMeshes = {};

      const lv = LEVELS[idx];
      if (lv.wind) windForce.copy(lv.wind);
      else windForce.set(0, 0, 0);

      // Green (Bigger)
      const gSize = lv.greenSize || { w: 40, d: 20 };
      const groundGeo = new THREE.PlaneGeometry(gSize.w, gSize.d, 64, 64);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a7a2c, roughness: 0.9, metalness: 0.1 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      ground.isHoleAsset = true;
      scene.add(ground); obstacles3d.push(ground);

      // Deform ground based on obstacles (Hills/Valleys)
      const posAttr = groundGeo.attributes.position;
      for (const o of lv.obstacles || []) {
        if (o.type === 'hill' || o.type === 'valley') {
          for (let i = 0; i < posAttr.count; i++) {
            const px = posAttr.getX(i);
            const py = posAttr.getY(i);
            const dx = px - o.x;
            const dz = -py - o.z; // Plane is rotated
            const dist = Math.sqrt(dx*dx + dz*dz);
            const maxDist = Math.max(o.w, o.d) / 2;
            if (dist < maxDist) {
              const weight = Math.cos((dist / maxDist) * Math.PI / 2);
              const val = (o.type === 'hill' ? o.h : -o.h) * weight;
              posAttr.setZ(i, posAttr.getZ(i) + val);
            }
          }
        }
      }
      groundGeo.computeVertexNormals();

      const grid = new THREE.GridHelper(gSize.w, gSize.w * 2, 0x1e3d1e, 0x1e3d1e);
      grid.position.y = 0.02;
      grid.material.opacity = 0.2; grid.material.transparent = true;
      scene.add(grid); obstacles3d.push(grid);

      for (let w of lv.walls) buildWall(w);
      for (let o of lv.obstacles) buildObstacle(o);

      // Hole (Classic Minigolf Cup)
      const hole3d = new THREE.Mesh(
        new THREE.CylinderGeometry(HOLE_R, HOLE_R, 0.4, 32),
        new THREE.MeshLambertMaterial({ color: 0x000000 })
      );
      hole3d.position.copy(lv.hole);
      hole3d.position.y = getTerrainHeight(lv.hole.x, lv.hole.z) - 0.2;
      scene.add(hole3d); obstacles3d.push(hole3d);

      // Flag
      const hY = getTerrainHeight(lv.hole.x, lv.hole.z);
      const pole3d = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 5, 8),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      pole3d.position.set(lv.hole.x, hY + 2.5, lv.hole.z);
      scene.add(pole3d); obstacles3d.push(pole3d);

      const flag3d = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.9),
        new THREE.MeshLambertMaterial({ color: 0xff3333, side: THREE.DoubleSide })
      );
      flag3d.position.set(lv.hole.x + 0.8, hY + 4.7, lv.hole.z);
      scene.add(flag3d); obstacles3d.push(flag3d);

      // Tee
      const tee3d = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
        new THREE.MeshLambertMaterial({ color: 0xffb800 })
      );
      tee3d.position.copy(lv.tee); 
      tee3d.position.y = getTerrainHeight(lv.tee.x, lv.tee.z);
      scene.add(tee3d); obstacles3d.push(tee3d);

      // Ball (reuse across levels)
      if (!ball3d) {
        ball3d = new THREE.Mesh(
          new THREE.SphereGeometry(BALL_R, 32, 32),
          new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 80, specular: 0x999999 })
        );
        ball3d.castShadow = true;
        scene.add(ball3d);
      }

      if (idx === 4) buildWindParticles(lv.wind);

      pos = lv.tee.clone();
      pos.y = getTerrainHeight(pos.x, pos.z);
      vel = new THREE.Vector3(0, 0, 0);
      ball3d.position.copy(pos);
      ballActive = false;
      rollTime = 0; rollDist = 0; recordedFrames = [];

      buildArrows();
      updateAimArrow();
      updateUI();
    }

    function buildWall(w) {
      if (w.type === 'rect') {
        const dx = w.x2 - w.x1, dz = w.z2 - w.z1;
        const len = Math.sqrt(dx * dx + dz * dz);
        const cx = (w.x1 + w.x2) / 2, cz = (w.z1 + w.z2) / 2;
        const angle = Math.atan2(dz, dx);
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(len, 0.6, 0.22),
          new THREE.MeshLambertMaterial({ color: 0x2a4a3a })
        );
        mesh.position.set(cx, 0.3, cz);
        mesh.rotation.y = -angle;
        scene.add(mesh); obstacles3d.push(mesh);
        mesh.userData = { wallType:'edge', x1:w.x1, z1:w.z1, x2:w.x2, z2:w.z2, nx: dz/len, nz: -dx/len };
      }
    }

    function buildObstacle(o) {
      if (o.type === 'bank') {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(o.w, 0.5, 0.28),
          new THREE.MeshLambertMaterial({ color: 0x3a6a5a })
        );
        mesh.position.set(o.x, 0.25, o.z);
        mesh.rotation.y = o.rot;
        scene.add(mesh); obstacles3d.push(mesh);
        mesh.userData = { wallType:'bank', cx:o.x, cz:o.z, rot:o.rot, halfW:o.w/2, restitution: o.restitution||0.85 };
      }
      if (o.type === 'spinner') {
        const mat = new THREE.MeshLambertMaterial({ color: 0xffb800 });
        const tower = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.5), mat);
        tower.position.set(o.cx, 1.5, o.cz - 1);
        tower.castShadow = true;
        scene.add(tower); obstacles3d.push(tower);

        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(o.armLen * 2, 0.4, o.armW),
          new THREE.MeshLambertMaterial({ color: 0xff3333 })
        );
        mesh.position.set(o.cx, 0.3, o.cz);
        mesh.castShadow = true;
        scene.add(mesh); obstacles3d.push(mesh);
        mesh.userData = { wallType:'spinner', cx:o.cx, cz:o.cz, r:o.r, armLen:o.armLen, armW:o.armW, speed:o.speed, phase:o.phase||0, angle:o.phase||0 };
      }
      if (o.type === 'tunnel') {
        const tMat = new THREE.MeshLambertMaterial({ color: 0x334155, transparent: true, opacity: 0.75 });
        const len = Math.abs(o.x2 - o.x1);
        const cx  = (o.x1 + o.x2) / 2;
        const top = new THREE.Mesh(new THREE.BoxGeometry(len, 0.5, 0.2), tMat);
        top.position.set(cx, 0.25, o.z2);
        const bot = new THREE.Mesh(new THREE.BoxGeometry(len, 0.5, 0.2), tMat);
        bot.position.set(cx, 0.25, o.z);
        const roof = new THREE.Mesh(
          new THREE.BoxGeometry(len, 0.15, Math.abs(o.z2 - o.z)),
          new THREE.MeshLambertMaterial({ color: 0x1e2d3d, transparent: true, opacity: 0.8 })
        );
        roof.position.set(cx, 0.55, (o.z + o.z2) / 2);
        scene.add(top); scene.add(bot); scene.add(roof);
        obstacles3d.push(top, bot, roof);
        top.userData = { wallType:'edge', x1:o.x1, z1:o.z2, x2:o.x2, z2:o.z2, nx:0, nz:-1 };
        bot.userData = { wallType:'edge', x1:o.x1, z1:o.z,  x2:o.x2, z2:o.z,  nx:0, nz:1  };
      }
      if (o.type === 'loop') {
        // Torus in default XY plane — vertical ring the ball travels through in X direction
        const lGeo = new THREE.TorusGeometry(o.r, 0.18, 24, 80);
        const lMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.2 });
        const loop = new THREE.Mesh(lGeo, lMat);
        // Center at (x, r, z) so bottom of ring sits at ground level y=0
        loop.position.set(o.x, o.r, o.z);
        // NO rotation.y — default XY orientation is correct for X-direction travel
        loop.castShadow = true;
        loop.receiveShadow = true;
        scene.add(loop);
        obstacles3d.push(loop);
        // Ramp approach on left side
        const rampGeo = new THREE.BoxGeometry(4, 0.15, 2.4);
        const rampMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const ramp = new THREE.Mesh(rampGeo, rampMat);
        ramp.position.set(o.x - o.r - 2, 0.5, o.z);
        ramp.rotation.z = -0.12;
        scene.add(ramp); obstacles3d.push(ramp);
        // Exit ramp on right
        const ramp2 = new THREE.Mesh(rampGeo, rampMat);
        ramp2.position.set(o.x + o.r + 2, 0.5, o.z);
        ramp2.rotation.z = 0.12;
        scene.add(ramp2); obstacles3d.push(ramp2);
        loop.userData = { wallType: 'loop', r: o.r, cx: o.x, cz: o.z, tubeW: 2.4 };
      }
      if (o.type === 'sand' || o.type === 'water') {
        const isSand = o.type === 'sand';
        const geo = new THREE.CircleGeometry(o.r, 32);
        const mat = new THREE.MeshLambertMaterial({ 
          color: isSand ? 0xd2b48c : 0x1ca3ff,
          transparent: !isSand, opacity: isSand ? 1 : 0.8
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(o.x, getTerrainHeight(o.x, o.z) + 0.02, o.z);
        scene.add(mesh); obstacles3d.push(mesh);
        mesh.userData = { type: o.type, x: o.x, z: o.z, r: o.r };
      }
      if (o.type === 'hill') {
        const hGeo = new THREE.PlaneGeometry(o.w, o.d, 32, 32);
        const hMat = new THREE.MeshStandardMaterial({ color: 0x1a7a2c, roughness: 0.9 });
        const hill = new THREE.Mesh(hGeo, hMat);
        hill.rotation.x = -Math.PI / 2;
        hill.position.set(o.x, 0.01, o.z);
        
        const posAttr = hGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const px = posAttr.getX(i);
          const py = posAttr.getY(i);
          const dist = Math.sqrt(px*px + py*py);
          const maxDist = Math.max(o.w, o.d) / 2;
          if (dist < maxDist) {
            const val = o.h * Math.cos((dist / maxDist) * Math.PI / 2);
            posAttr.setZ(i, val);
          }
        }
        hGeo.computeVertexNormals();
        hill.receiveShadow = true;
        scene.add(hill);
        obstacles3d.push(hill);
        hill.userData = { wallType: 'hill', x: o.x, z: o.z, w: o.w, d: o.d, h: o.h };
      }
    }

    function buildWindParticles(wind) {
      if (windParticles) { scene.remove(windParticles); windParticles = null; }
      const count = 200;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i*3]   = (Math.random() - 0.5) * 28;
        positions[i*3+1] = Math.random() * 2 + 0.1;
        positions[i*3+2] = (Math.random() - 0.5) * 12;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      windParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x9b5de5, size: 0.12, transparent: true, opacity: 0.5 }));
      scene.add(windParticles);
    }

    // ── Force arrows ───────────────────────────────────────────
    function buildArrows() {
      for (let k in arrowMeshes) scene.remove(arrowMeshes[k]);
      arrowMeshes = {};
      const colors = { velocity:0x38b6ff, friction:0xff4545, normal:0x00c875, net:0xffb800, wind:0x9b5de5 };
      for (let k in colors) {
        const arr = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), 1, colors[k], 0.4, 0.2);
        arr.visible = false;
        scene.add(arr);
        arrowMeshes[k] = arr;
      }
    }

    function updateArrows() {
      if (!pos || !vel) return;
      const speed = vel.length();
      let mu = parseFloat(q('s-friction').value);

      for (let mesh of obstacles3d) {
        if (mesh.userData.type === 'sand') {
          const dist = new THREE.Vector2(pos.x - mesh.userData.x, pos.z - mesh.userData.z).length();
          if (dist < mesh.userData.r) mu *= 3;
        }
      }

      const groundH = getTerrainHeight(pos.x, pos.z);
      const isAirborne = pos.y > groundH + 0.12;

      let frictionMag = isAirborne ? 0 : mu * G_CONST;
      const normal = isAirborne ? new THREE.Vector3(0,1,0) : getTerrainNormal(pos.x, pos.z);
      const gravity = new THREE.Vector3(0, -G_CONST, 0);
      const gravityEffect = isAirborne ? gravity.clone() : gravity.clone().projectOnPlane(normal);
      const frictionDir = speed > 0.01 ? vel.clone().normalize().negate() : new THREE.Vector3(0,0,0);
      const netForce = frictionDir.clone().multiplyScalar(frictionMag).add(windForce).add(gravityEffect);

      // In loop mode, override with centripetal + tangential arrows
      let normalDir = normal;
      let normalLen = isAirborne ? 0 : 2.5;
      if (loopMode && loopData) {
        const N = (loopSpeed * loopSpeed / loopData.r) - G_CONST * Math.sin(loopAngle);
        const inward = new THREE.Vector3(-Math.cos(loopAngle), -Math.sin(loopAngle), 0);
        normalDir = inward.clone().negate(); // outward from track = normal reaction
        normalLen = Math.max(0, N) * 0.25;
      }

      const defs = {
        velocity: { dir: speed > 0.01 ? vel.clone().normalize() : new THREE.Vector3(1,0,0), len: Math.min(speed*0.35,6)+0.5, yOff: BALL_R + 0.2 },
        friction: { dir: frictionDir.length()>0 ? frictionDir : new THREE.Vector3(-1,0,0), len: Math.min(frictionMag*0.35,4)+0.3, yOff: BALL_R + 0.3 },
        normal:   { dir: normalDir, len: normalLen, yOff: 0 },
        net:      { dir: netForce.length() > 0.01 ? netForce.clone().normalize() : normal, len: Math.min(netForce.length()*0.4, 4), yOff: BALL_R + 0.5 },
        wind:     { dir: windForce.length()>0.1 ? windForce.clone().normalize() : new THREE.Vector3(0,0,1), len: Math.min(windForce.length()*0.4,4), yOff: BALL_R },
      };

      for (let k in arrowMeshes) {
        const arr = arrowMeshes[k];
        const def = defs[k];
        // Forces always visible at ball (not gated on ballActive) so students see forces at rest too
        const forceOn = FORCES[k]?.on && showForces && (k !== 'wind' || windForce.length() > 0.1);
        arr.visible = Boolean(forceOn && def.len > 0.1);
        if (arr.visible) {
          arr.position.set(pos.x, pos.y + def.yOff, pos.z);
          const safeDir = def.dir.clone();
          if (safeDir.length() < 0.001) safeDir.set(0,1,0);
          arr.setDirection(safeDir.normalize());
          arr.setLength(def.len, Math.min(def.len*0.25,0.5), Math.min(def.len*0.15,0.3));
        }
      }
    }

    function updateAimArrow() {
      if (aimArrow) { scene.remove(aimArrow); aimArrow = null; }
      if (ballActive) return;
      const a   = parseFloat(q('s-angle').value) * Math.PI / 180;
      const pwr = parseFloat(q('s-power').value);
      const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      aimArrow = new THREE.ArrowHelper(dir, pos.clone().add(new THREE.Vector3(0,0.3,0)), Math.max(2, pwr*0.22), 0xffee00, 0.5, 0.3);
      scene.add(aimArrow);
    }

    function updateTrail() {
      if (!ballActive) return;
      if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z)) {
        trailPoints.push(pos.clone());
      }
      if (trailLine) scene.remove(trailLine);
      if (trailPoints.length < 2) return;
      const geo = new THREE.BufferGeometry().setFromPoints(trailPoints.map(p => { const v = p.clone(); v.y = 0.05; return v; }));
      trailLine = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x38b6ff, opacity: 0.4, transparent: true }));
      scene.add(trailLine);
    }

    // ── Physics ────────────────────────────────────────────────
    function getTerrainHeight(x, z) {
      const lv = LEVELS[currentLevel];
      let h = BALL_R;
      for (const o of lv.obstacles || []) {
        if (o.type === 'hill' || o.type === 'valley') {
          const dx = x - o.x;
          const dz = z - o.z;
          const dist = Math.sqrt(dx*dx + dz*dz);
          const maxDist = Math.max(o.w, o.d) / 2;
          if (dist < maxDist) {
            const weight = Math.cos((dist / maxDist) * Math.PI / 2);
            const val = (o.type === 'hill' ? o.h : -o.h) * weight;
            h += val;
          }
        }
      }
      return h;
    }

    function getTerrainNormal(x, z) {
      const eps = 0.05;
      const h1 = getTerrainHeight(x - eps, z);
      const h2 = getTerrainHeight(x + eps, z);
      const h3 = getTerrainHeight(x, z - eps);
      const h4 = getTerrainHeight(x, z + eps);
      return new THREE.Vector3(h1 - h2, 2 * eps, h3 - h4).normalize();
    }

    // Always-running scene updates (spinners spin even before ball is putted)
    function updateSceneObjects(dt) {
      for (let mesh of obstacles3d) {
        if (mesh.userData.wallType === 'spinner') {
          mesh.userData.angle += mesh.userData.speed * dt;
          mesh.rotation.y = mesh.userData.angle;
        }
      }
    }

    function physicsStep(dt) {
      if (!ballActive) return;
      dt = Math.min(dt, 0.04);
      let mu = parseFloat(q('s-friction').value);
      const lv = LEVELS[currentLevel];

      // ── Kelty Loop constraint physics ───────────────────────────
      if (loopMode && loopData) {
        const ld = loopData;
        // Tangential gravity: -g·cos(θ)  [decelerates going up, accelerates going down]
        const gTan = -G_CONST * Math.cos(loopAngle);
        // Normal force per unit mass: v²/r - g·sin(θ)
        const N = (loopSpeed * loopSpeed / ld.r) - G_CONST * Math.sin(loopAngle);
        if (N < 0) {
          // Ball falls off — becomes airborne from current position
          loopMode = false;
          loopData = null;
          const tDir = new THREE.Vector3(-Math.sin(loopAngle), Math.cos(loopAngle), 0);
          vel.copy(tDir.multiplyScalar(loopSpeed));
          // Normal physics (airborne) will handle it next frame
        } else {
          const frictionAcc = mu * N * (loopSpeed > 0 ? -1 : 1);
          loopSpeed += (gTan + frictionAcc) * dt;
          loopAngle += (loopSpeed / ld.r) * dt;
          pos.x = ld.cx + ld.r * Math.cos(loopAngle);
          pos.y = ld.r  + ld.r * Math.sin(loopAngle);
          pos.z = ld.cz;
          const tDir = new THREE.Vector3(-Math.sin(loopAngle), Math.cos(loopAngle), 0);
          vel.copy(tDir.multiplyScalar(loopSpeed));
          ball3d.position.copy(pos);
          ball3d.rotation.x += loopSpeed * dt * 3;
          rollTime += dt;
          rollDist += Math.abs(loopSpeed) * dt;
          recordedFrames.push({ pos: pos.clone(), vel: vel.clone(), t: rollTime });
          updateTrail(); updateArrows(); updateStats();
          // Exit: completed loop (angle past -π/2 after going all the way around)
          if (loopAngle > Math.PI * 1.3) {
            loopMode = false; loopData = null;
            vel.set(loopSpeed, 0, 0);
            pos.y = BALL_R;
          }
          return; // skip normal physics
        }
      }

      const speed = vel.length();

      // ── Loop entry detection ─────────────────────────────────────
      if (!loopMode) {
        for (let mesh of obstacles3d) {
          if (mesh.userData.wallType !== 'loop') continue;
          const wd = mesh.userData;
          if (Math.abs(pos.z - wd.cz) > wd.tubeW) continue;
          const dx2 = pos.x - wd.cx, dy2 = pos.y - wd.r;
          const distToCenter = Math.sqrt(dx2*dx2 + dy2*dy2);
          // Ball near circle, approaching from left, going right
          if (Math.abs(distToCenter - wd.r) < BALL_R * 3 && pos.x < wd.cx && vel.x > 0.5) {
            loopMode  = true;
            loopData  = { cx: wd.cx, cz: wd.cz, r: wd.r };
            loopAngle = Math.atan2(dy2, dx2);
            loopSpeed = vel.length();
            const vMin = Math.sqrt(G_CONST * wd.r);
            toast(`Kelty Loop! Need v ≥ ${vMin.toFixed(1)} m/s at top. Current: ${loopSpeed.toFixed(1)}`);
            return;
          }
        }
      }

      for (let mesh of obstacles3d) {
        if (mesh.userData.type === 'water') {
          const dist = new THREE.Vector2(pos.x - mesh.userData.x, pos.z - mesh.userData.z).length();
          if (dist < mesh.userData.r) {
            toast('Splash! Water hazard. Respun with penalty.');
            ballActive = false;
            setTimeout(resetBall, 600);
            return;
          }
        }
        if (mesh.userData.type === 'sand') {
          const dist = new THREE.Vector2(pos.x - mesh.userData.x, pos.z - mesh.userData.z).length();
          if (dist < mesh.userData.r) {
            mu *= 3; // Triple friction in sand
          }
        }
      }

      if (windParticles) {
        const wpos = windParticles.geometry.attributes.position.array;
        for (let i = 0; i < wpos.length; i += 3) {
          wpos[i]   += lv.wind.x * dt * 0.8;
          wpos[i+2] += lv.wind.z * dt * 0.8;
          if (wpos[i]   >  14) wpos[i]   = -14;
          if (wpos[i+2] >   6) wpos[i+2] =  -6;
        }
        windParticles.geometry.attributes.position.needsUpdate = true;
      }

      if (speed < 0.04) {
        vel.set(0, 0, 0);
        ballActive = false;
        if (aimArrow === null) updateAimArrow();
        updateArrows();
        return;
      }

      const currentH = getTerrainHeight(pos.x, pos.z);
      // Ball is airborne if physically above terrain OR just launched upward (loft)
      const isAirborne = pos.y > currentH + 0.05 || vel.y > 0.01;

      if (isAirborne) {
        vel.y -= G_CONST * dt;
        if (lv.wind.length() > 0.01) {
          vel.add(lv.wind.clone().multiplyScalar(dt));
        }
      } else {
        // Ground physics — safe to zero y here since ball is confirmed on ground
        vel.y = 0;
        const frictionDV = mu * G_CONST * dt;
        const unitV = vel.clone();
        unitV.y = 0;
        const speedXZ = unitV.length();
        if (speedXZ > 0.01) {
          unitV.normalize();
          if (frictionDV >= speedXZ) {
            vel.x = 0; vel.z = 0;
          } else {
            vel.sub(unitV.multiplyScalar(frictionDV));
          }
        }
        
        if (lv.wind.length() > 0.01) {
          vel.add(lv.wind.clone().multiplyScalar(dt));
        }

        // Gravity on slopes
        const normal = getTerrainNormal(pos.x, pos.z);
        const gravityEffect = new THREE.Vector3(0, -G_CONST, 0).projectOnPlane(normal);
        vel.add(gravityEffect.multiplyScalar(dt));

        // Hole 8: Dynamic Pulsing Green
        if (lv.dynamicGreen) {
          const t = clock.getElapsedTime();
          const pulse = Math.sin(t * 3);
          const ground = obstacles3d.find(o => o.geometry.type === 'PlaneGeometry');
          if (ground) ground.scale.set(1 + pulse * 0.05, 1 + pulse * 0.05, 1);
          
          const distFromCenter = new THREE.Vector2(pos.x, pos.z).length();
          if (distFromCenter > 0.1) {
            const radialImpulse = new THREE.Vector3(pos.x, 0, pos.z).normalize().multiplyScalar(pulse * 2 * dt);
            vel.add(radialImpulse);
          }
        }
      }

      const newPos = pos.clone().add(vel.clone().multiplyScalar(dt));
      const collided = resolveCollisions(pos, newPos, vel, dt);
      pos.copy(collided.pos);
      vel.copy(collided.vel);
      
      const newH = getTerrainHeight(pos.x, pos.z);
      if (!isAirborne) {
        pos.y = newH;
      } else if (pos.y <= newH) {
        pos.y = newH;
        vel.y *= -0.5; // Restitution
        vel.x *= 0.8;
        vel.z *= 0.8;
      }

      ball3d.position.copy(pos);
      ball3d.rotation.x += vel.z * dt * 3;
      ball3d.rotation.z -= vel.x * dt * 3;

      rollTime += dt;
      rollDist += vel.length() * dt;
      recordedFrames.push({ pos: pos.clone(), vel: vel.clone(), t: rollTime });

      updateTrail();
      updateArrows();
      updateStats();

      const dx = pos.x - lv.hole.x, dz = pos.z - lv.hole.z;
      const distToHole = Math.sqrt(dx*dx + dz*dz);
      const spd = vel.length();

      if (!isAirborne && distToHole < HOLE_R * 2.2) {
        // Real cup physics: rim acts as a barrier — ball must be slow enough to drop in.
        // v_lip ≈ √(2g · HOLE_R) ≈ 3.4 m/s; faster than that and it lips out.
        const V_LIP = Math.sqrt(2 * G_CONST * HOLE_R); // ~3.4 m/s

        if (distToHole < HOLE_R * 0.85 && spd < V_LIP) {
          // Ball drops in — holed!
          vel.set(0, 0, 0);
          pos.x = lv.hole.x; pos.z = lv.hole.z; pos.y -= 0.12;
          winLevel();
        } else if (distToHole < HOLE_R * 1.3 && spd < V_LIP * 0.7) {
          // Slow enough — funnel pull toward center
          const pullStr = (HOLE_R * 1.3 - distToHole) * 12;
          const toHole = new THREE.Vector3(-dx, 0, -dz).normalize();
          vel.add(toHole.multiplyScalar(pullStr * dt));
        } else if (distToHole < HOLE_R && spd >= V_LIP) {
          // Too fast — lip-out: reflect velocity component away from center
          const outDir = new THREE.Vector3(dx, 0, dz).normalize();
          const vn = vel.dot(outDir);
          if (vn < 0) { // heading into hole
            vel.addScaledVector(outDir, -2 * vn * 0.6); // elastic bounce outward, lose 40%
            toast(`Lip out! Hit it softer — v_lip ≈ ${V_LIP.toFixed(1)} m/s`);
          }
        }
      }
      
      const gSize = lv.greenSize || { w: 40, d: 20 };
      if (Math.abs(pos.x) > (gSize.w / 2) + 2 || Math.abs(pos.z) > (gSize.d / 2) + 2) {
        toast('Out of bounds! Resetting…');
        setTimeout(resetBall, 600);
      }
    }

    function resolveCollisions(oldPos, newPos, vel, dt) {
      let p = newPos.clone(), v = vel.clone();

      for (let mesh of obstacles3d) {
        const wd = mesh.userData;
        if (!wd || !wd.wallType) continue;

        if (wd.wallType === 'edge') {
          const dx = wd.x2 - wd.x1, dz = wd.z2 - wd.z1, len = Math.sqrt(dx*dx + dz*dz);
          const nx = dz/len, nz = -dx/len;
          const dist = (p.x - wd.x1)*nx + (p.z - wd.z1)*nz;
          if (Math.abs(dist) < BALL_R * 1.1) {
            const t = ((p.x - wd.x1)*dx + (p.z - wd.z1)*dz) / (len*len);
            if (t >= -0.05 && t <= 1.05) {
              const pen  = BALL_R * 1.1 - Math.abs(dist);
              const sign = dist >= 0 ? 1 : -1;
              p.x += nx * pen * sign;
              p.z += nz * pen * sign;
              const vn = v.x*nx + v.z*nz;
              v.x -= (1 + 0.7) * vn * nx;
              v.z -= (1 + 0.7) * vn * nz;
            }
          }
        }

        if (wd.wallType === 'bank') {
          const cosR = Math.cos(wd.rot), sinR = Math.sin(wd.rot);
          const lx = (p.x - wd.cx)*cosR + (p.z - wd.cz)*sinR;
          const lz = -(p.x - wd.cx)*sinR + (p.z - wd.cz)*cosR;
          if (Math.abs(lx) < wd.halfW && Math.abs(lz) < BALL_R*1.1) {
            const sign = lz >= 0 ? 1 : -1;
            const pen  = BALL_R*1.1 - Math.abs(lz);
            p.x += -sinR*sign*pen; p.z += cosR*sign*pen;
            const e   = wd.restitution || 0.85;
            const vl  = v.x*cosR + v.z*sinR;
            const vn2 = -v.x*sinR + v.z*cosR;
            v.x = vl*cosR - e*(-vn2)*sinR;
            v.z = vl*sinR + e*(-vn2)*cosR;
          }
        }

        if (wd.wallType === 'spinner') {
          const ang  = mesh.rotation.y;
          const cosA = Math.cos(ang), sinA = Math.sin(ang);
          const ax1  = wd.cx + cosA*wd.armLen, az1 = wd.cz - sinA*wd.armLen;
          const ax2  = wd.cx - cosA*wd.armLen, az2 = wd.cz + sinA*wd.armLen;
          const adx  = ax2-ax1, adz = az2-az1, al = Math.sqrt(adx*adx + adz*adz);
          const t    = Math.max(0, Math.min(1, ((p.x-ax1)*adx + (p.z-az1)*adz) / (al*al)));
          const cpx  = ax1+t*adx, cpz = az1+t*adz;
          const ddx  = p.x-cpx, ddz = p.z-cpz;
          const dd   = Math.sqrt(ddx*ddx + ddz*ddz);
          if (dd < BALL_R + wd.armW/2) {
            const nn  = dd > 0.001 ? 1/dd : 1;
            const nx2 = ddx*nn, nz2 = ddz*nn;
            const pen = BALL_R + wd.armW/2 - dd;
            p.x += nx2*pen; p.z += nz2*pen;
            const vn  = v.x*nx2 + v.z*nz2;
            v.x -= (1 + 0.75)*vn*nx2;
            v.z -= (1 + 0.75)*vn*nz2;
          }
        }

        if (wd.wallType === 'loop') {
          // Snap ball to loop track if conditions met
          const dx = p.x - wd.cx, dz = p.z - wd.cz;
          const distFromPlane = Math.abs(dz);
          if (distFromPlane < wd.w && Math.abs(dx) < wd.r + BALL_R) {
             const distToCenter = Math.sqrt(dx*dx + (p.y - wd.r)**2);
             if (Math.abs(distToCenter - wd.r) < BALL_R * 2) {
               const angle = Math.atan2(p.y - wd.r, dx);
               const speed = v.length();
               // Centripetal check: v² / r must be > g at peak (angle ≈ π/2)
               const vMin = Math.sqrt(G_CONST * wd.r);
               if (speed > vMin * 0.7) { 
                 const nextAngle = angle + (v.x / wd.r) * dt;
                 p.x = wd.cx + Math.cos(nextAngle) * wd.r;
                 p.y = wd.r + Math.sin(nextAngle) * wd.r;
                 p.z = wd.cz;
                 v.x = -Math.sin(nextAngle) * speed;
                 v.y = Math.cos(nextAngle) * speed;
                 v.z = 0;
               }
             }
          }
        }
      }

      return { pos: p, vel: v };
    }

    // ── Putt / impulse ─────────────────────────────────────────
    function putt() {
      if (ballActive) return;
      if (aimArrow) { scene.remove(aimArrow); aimArrow = null; }
      trailPoints = []; if (trailLine) { scene.remove(trailLine); trailLine = null; }

      const a   = parseFloat(q('s-angle').value) * Math.PI / 180;
      const pwr = parseFloat(q('s-power').value);
      const lft = parseFloat(q('s-loft').value) * Math.PI / 180;
      const vxz = pwr * Math.cos(lft);
      vel.set(vxz * Math.cos(a), pwr * Math.sin(lft), vxz * Math.sin(a));
      initialKE  = 0.5 * vel.lengthSq();
      ballActive = true;
      rollTime   = 0; rollDist = 0; recordedFrames = [];
      stroke++;
      q('stroke-badge').textContent = `Stroke ${stroke}`;
      q('btn-apply').disabled = false;
      updateStats();
    }

    function applyImpulse() {
      if (!ballActive) return;
      const a   = parseFloat(q('af-angle').value) * Math.PI / 180;
      const mag = parseFloat(q('af-mag').value);
      vel.x += mag * Math.cos(a);
      vel.z += mag * Math.sin(a);
      toast(`Impulse applied! Δv = (${(mag*Math.cos(a)).toFixed(1)}, ${(mag*Math.sin(a)).toFixed(1)})`);
      if (arrowMeshes.net) arrowMeshes.net.visible = true;
    }

    // ── Replay ─────────────────────────────────────────────────
    function replayPlay() {
      if (recordedFrames.length < 2) { toast('Putt first to record a replay'); return; }
      isReplaying = true; replayPlaying = true; replayIdx = 0;
      ballActive = false;
      q('rbc-play').classList.add('active');
    }
    function replayPause() {
      replayPlaying = !replayPlaying;
      q('rbc-pause').textContent = replayPlaying ? '⏸' : '▶';
    }
    function replayStep() {
      if (!isReplaying) { isReplaying = true; replayIdx = 0; replayPlaying = false; }
      replayIdx = Math.min(replayIdx + 1, recordedFrames.length - 1);
      applyReplayFrame(replayIdx);
    }
    function replayScrub(v) {
      if (recordedFrames.length < 2) return;
      isReplaying = true; replayPlaying = false;
      replayIdx = Math.round((v/100) * (recordedFrames.length - 1));
      applyReplayFrame(replayIdx);
    }
    function applyReplayFrame(idx) {
      const f = recordedFrames[idx];
      pos.copy(f.pos); vel.copy(f.vel);
      ball3d.position.copy(pos);
      updateArrows();
      const pct = recordedFrames.length > 1 ? (idx / (recordedFrames.length-1))*100 : 0;
      q('replay-scrub').value = pct;
      q('sv-speed').textContent = f.vel.length().toFixed(2);
      q('sv-time').textContent  = f.t.toFixed(2) + 's';
    }
    function exitReplay() {
      isReplaying = false; replayPlaying = false;
      q('rbc-play').classList.remove('active');
      const lv = LEVELS[currentLevel];
      pos.copy(lv.tee); vel.set(0,0,0);
      ball3d.position.copy(pos); ballActive = false;
      updateAimArrow();
    }

    function buildSpeedButtons() {
      const row = q('spd-row');
      row.innerHTML = '';
      [0.1, 0.25, 0.5, 1].forEach(s => {
        const b = document.createElement('div');
        b.className = 'spd-btn' + (s === 1 ? ' active' : '');
        b.textContent = s + '×';
        b.onclick = () => {
          replaySpeed = s;
          qq('spd-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        };
        row.appendChild(b);
      });
    }

    // ── Stats & equations ──────────────────────────────────────
    function updateStats() {
      const speed = vel.length();
      const ke    = 0.5 * speed * speed;
      const mu    = parseFloat(q('s-friction').value);
      const lv    = LEVELS[currentLevel];
      const dx    = pos.x - lv.hole.x, dz = pos.z - lv.hole.z;
      const distH = Math.sqrt(dx*dx + dz*dz);

      q('sv-speed').textContent  = speed.toFixed(2);
      q('sv-ke').textContent     = ke.toFixed(2);
      q('sv-dist').textContent   = distH.toFixed(2);
      q('sv-ff').textContent     = (mu * G_CONST).toFixed(2);
      q('sv-time').textContent   = rollTime.toFixed(1) + 's';
      q('sv-rolled').textContent = rollDist.toFixed(1);
    }

    function updateEquation() {
      const a   = parseFloat(q('s-angle').value);
      const pwr = parseFloat(q('s-power').value);
      const mu  = parseFloat(q('s-friction').value);
      const aRad = a * Math.PI / 180;
      const vx  = pwr * Math.cos(aRad);
      const vz  = pwr * Math.sin(aRad);
      const ke  = 0.5 * pwr * pwr;
      const decel    = mu * G_CONST;
      const stopDist = pwr*pwr / (2*decel);
      const lv = LEVELS[currentLevel];
      let extra = '';
      if (currentLevel === 4 && lv.wind.length() > 0.1) {
        extra = `<br><span class="eq-hl">wind acc = ${lv.wind.z.toFixed(1)} m/s²</span>`;
      }
      q('eq-box').innerHTML =
        `<strong>Initial velocity decomposition</strong><br>` +
        `θ = <span class="eq-live">${a}°</span>  |v₀| = <span class="eq-live">${pwr.toFixed(1)}</span><br>` +
        `v<sub>x</sub> = ${pwr}·cos(${a}°) = <span class="eq-live">${vx.toFixed(2)}</span><br>` +
        `v<sub>z</sub> = ${pwr}·sin(${a}°) = <span class="eq-live">${vz.toFixed(2)}</span><br>` +
        `KE₀ = ½v² = <span class="eq-hl">${ke.toFixed(1)} J</span><br>` +
        `a_friction = μg = ${mu}×9.81 = <span class="eq-live">${decel.toFixed(2)}</span><br>` +
        `Max roll dist = <span class="eq-hl">${stopDist.toFixed(1)} m</span>` +
        extra;
    }

    function updateAFDisplay() {
      const a   = parseFloat(q('af-angle').value);
      const mag = parseFloat(q('af-mag').value);
      q('af-angle-v').textContent = a + '°';
      q('af-mag-v').textContent   = mag.toFixed(1);
      q('af-eq-v').textContent    = mag.toFixed(1);
    }

    // ── Force checkboxes ───────────────────────────────────────
    function buildForceCheckboxes() {
      const c = q('force-checkboxes');
      c.innerHTML = '';
      for (let k in FORCES) {
        const f   = FORCES[k];
        const row = document.createElement('label');
        row.className = 'force-row';
        row.innerHTML = `<input type="checkbox" ${f.on?'checked':''} onchange="void 0">
          <span class="force-dot" style="background:${f.color}"></span>
          <span>${f.label}</span>`;
        row.querySelector('input').addEventListener('change', e => {
          FORCES[k].on = e.target.checked;
          updateArrows();
        });
        c.appendChild(row);
      }
    }

    // ── Level management ───────────────────────────────────────
    function buildLevelPills() {
      const c = q('level-pills');
      c.innerHTML = '';
      LEVELS.forEach((lv, i) => {
        const p = document.createElement('div');
        p.className = 'lpill' + (i === currentLevel ? ' active' : '') + (levelStats[i]?.completed ? ' completed' : '');
        p.textContent = lv.name;
        p.onclick = () => goLevel(i);
        c.appendChild(p);
      });
    }

    function goLevel(idx) {
      currentLevel = idx;
      stroke = 1;
      q('stroke-badge').textContent = 'Stroke 1';
      if (!levelStats[idx]) levelStats[idx] = { attempts:0, best:Infinity, completed:false };
      levelStats[idx].attempts++;
      buildLevelPills();
      buildLevel(idx);
      q('level-desc').innerHTML = LEVELS[idx].desc;
      q('level-stats').innerHTML =
        `Best stroke: ${levelStats[idx].best===Infinity?'—':levelStats[idx].best}<br>` +
        `Attempts: ${levelStats[idx].attempts}<br>` +
        `Completed: ${levelStats[idx].completed?'✓':'No'}`;
      updateEquation();
      updateAFDisplay();
      exitReplay();
    }

    function winLevel() {
      ballActive = false;
      q('btn-apply').disabled = true;
      if (!levelStats[currentLevel]) levelStats[currentLevel] = { attempts:0, best:Infinity, completed:false };
      const st = levelStats[currentLevel];
      if (stroke < st.best) st.best = stroke;
      st.completed = true;
      buildLevelPills();

      const energyLost  = initialKE > 0 ? (1 - (0.5*vel.lengthSq()/initialKE))*100 : 100;
      const isHoleInOne = stroke === 2;
      const lv = LEVELS[currentLevel];

      q('ov-title').textContent    = isHoleInOne ? '⛳ HOLE IN ONE!' : '⛳ HOLE!';
      q('ov-subtitle').textContent = lv.concept;
      q('ov-insight').innerHTML    = `<strong>Physics insight:</strong><br>${lv.insight}`;
      q('ov-results').innerHTML    = `
        <div class="result-cell"><div class="rk">Strokes</div><div class="rv">${stroke-1}</div></div>
        <div class="result-cell"><div class="rk">Par</div><div class="rv">${lv.par}</div></div>
        <div class="result-cell"><div class="rk">Roll distance</div><div class="rv">${rollDist.toFixed(1)} m</div></div>
        <div class="result-cell"><div class="rk">Energy lost</div><div class="rv">${energyLost.toFixed(0)}%</div></div>
        <div class="result-cell"><div class="rk">Roll time</div><div class="rv">${rollTime.toFixed(1)} s</div></div>
        <div class="result-cell"><div class="rk">Final speed</div><div class="rv">${vel.length().toFixed(2)}</div></div>
      `;
      const nextBtn = q('ov-next');
      if (currentLevel < LEVELS.length - 1) { nextBtn.style.display = ''; nextBtn.textContent = 'Next Level →'; }
      else { nextBtn.style.display = 'none'; }
      q('overlay').style.display = 'flex';
    }

    function hideOverlay()  { q('overlay').style.display = 'none'; }
    function nextLevel()    { hideOverlay(); goLevel(Math.min(currentLevel+1, LEVELS.length-1)); }
    function resetHole()    { hideOverlay(); goLevel(currentLevel); }
    function resetBall() {
      const lv = LEVELS[currentLevel];
      pos.copy(lv.tee); vel.set(0,0,0);
      ball3d.position.copy(pos);
      ballActive = false;
      if (trailLine) { scene.remove(trailLine); trailLine = null; }
      trailPoints = [];
      updateAimArrow(); updateArrows();
    }

    function toggleForces() {
      showForces = !showForces;
      const b = q('btn-forces');
      b.classList.toggle('active', showForces);
      b.textContent = showForces ? 'Forces ON' : 'Show Forces';
      updateArrows();
    }
    function toggleSlowmo() {
      slowMo = !slowMo;
      const b = q('btn-slowmo');
      b.classList.toggle('active', slowMo);
      b.textContent = slowMo ? 'Slow-Mo ON' : 'Slow-Mo';
    }

    function toast(msg) {
      const t = q('toast');
      t.textContent = msg; t.style.opacity = '1';
      clearTimeout(toast._tid);
      toast._tid = setTimeout(() => { t.style.opacity = '0'; }, 2200);
    }

    function updateUI() {
      const a    = parseFloat(q('s-angle').value);
      const pwr  = parseFloat(q('s-power').value);
      const loft = parseFloat(q('s-loft').value);
      const mu   = parseFloat(q('s-friction').value);
      q('v-angle').textContent    = a + '°';
      q('v-power').textContent    = pwr.toFixed(1);
      q('v-loft').textContent     = loft + '°';
      q('v-friction').textContent = mu.toFixed(2);
      updateEquation();
      updateAimArrow();
    }

    function onKey(e) {
      if (e.key === 'Escape' && onClose)  { onClose(); return; }
      if (e.key === ' ')                  { e.preventDefault(); putt(); }
      if (e.key === 'r' || e.key === 'R') resetBall();
      if (e.key === 'f' || e.key === 'F') toggleForces();
      if (e.key === 's' || e.key === 'S') toggleSlowmo();
    }

    // ── Render loop ────────────────────────────────────────────
    function animate() {
      if (stopped) return;
      requestAnimationFrame(animate);
      const raw = clock.getDelta();
      const dt  = slowMo ? raw * 0.2 : raw;

      updateSceneObjects(dt);   // spinners always rotate, even pre-putt

      if (isReplaying && replayPlaying) {
        const step = Math.max(1, Math.round(replaySpeed * 1));
        replayIdx = Math.min(replayIdx + step, recordedFrames.length - 1);
        applyReplayFrame(replayIdx);
        if (replayIdx >= recordedFrames.length - 1) replayPlaying = false;
      } else if (!isReplaying) {
        physicsStep(dt);
      }

      if (controls) controls.update();
      renderer.render(scene, camera);
    }

    // ── Wire up event listeners ────────────────────────────────
    q('btn-putt').addEventListener('click', putt);
    q('btn-apply').addEventListener('click', applyImpulse);
    q('btn-forces').addEventListener('click', toggleForces);
    q('btn-slowmo').addEventListener('click', toggleSlowmo);
    q('btn-reset').addEventListener('click', resetHole);
    q('rbc-play').addEventListener('click', replayPlay);
    q('rbc-pause').addEventListener('click', replayPause);
    q('rbc-frame').addEventListener('click', replayStep);
    q('replay-scrub').addEventListener('input', e => replayScrub(e.target.value));
    q('af-angle').addEventListener('input', updateAFDisplay);
    q('af-mag').addEventListener('input', updateAFDisplay);
    q('s-angle').addEventListener('input', updateUI);
    q('s-power').addEventListener('input', updateUI);
    q('s-loft').addEventListener('input', updateUI);
    q('s-friction').addEventListener('input', updateUI);
    q('ov-hide').addEventListener('click', hideOverlay);
    q('ov-next').addEventListener('click', nextLevel);
    q('ov-reset').addEventListener('click', resetHole);

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);

    // ── Boot ───────────────────────────────────────────────────
    initThree();
    buildForceCheckboxes();
    buildSpeedButtons();
    LEVELS.forEach((_, i) => { levelStats[i] = { attempts:0, best:Infinity, completed:false }; });
    goLevel(0);
    animate();

    return () => {
      stopped = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      if (renderer) { renderer.dispose(); }
    };
  }, []);

  const isFullscreen = Boolean(onClose);

  return (
    <div
      ref={wrapRef}
      className="golf-wrap"
      style={isFullscreen
        ? { position: 'fixed', inset: 0, zIndex: 200, fontFamily: "'DM Sans', sans-serif" }
        : { position: 'relative', height, fontFamily: "'DM Sans', sans-serif" }
      }
    >
      <style>{CSS}</style>

      {/* HUD shell */}
      <div className="g-hud">

        {/* Top bar */}
        <div className="g-topbar">
          <div className="logo">⛳ Kelty's Championship Greens</div>
          <div className="level-pills" id="mg-level-pills"></div>
          <div className="spacer"></div>
          <div className="stroke-badge" id="mg-stroke-badge">Stroke 1</div>
          <button className="tb-btn" id="mg-btn-forces">Show Forces</button>
          <button className="tb-btn" id="mg-btn-slowmo">Slow-Mo</button>
          <button className="tb-btn" id="mg-btn-reset">↺ Reset</button>
          {isFullscreen && (
            <button
              className="tb-btn"
              onClick={onClose}
              title="Close (Esc)"
              style={{ marginLeft: 4, color: 'var(--red)', borderColor: 'var(--red)' }}
            >✕</button>
          )}
        </div>

        {/* Main area */}
        <div className="g-main">

          {/* Left panel */}
          <div className="g-left">
            <h3>Putt Controls</h3>

            <div className="ctrl">
              <div className="ctrl-row">
                <span className="ctrl-label">Aim angle θ</span>
                <span className="ctrl-val" id="mg-v-angle">45°</span>
              </div>
              <input type="range" id="mg-s-angle" min="0" max="360" defaultValue="45" step="1" />
            </div>

            <div className="ctrl">
              <div className="ctrl-row">
                <span className="ctrl-label">Power |v₀|</span>
                <span className="ctrl-val" id="mg-v-power">18.0</span>
              </div>
              <input type="range" id="mg-s-power" min="3" max="40" defaultValue="18" step="0.5" />
            </div>

            <div className="ctrl">
              <div className="ctrl-row">
                <span className="ctrl-label">Loft (Pitch)</span>
                <span className="ctrl-val" id="mg-v-loft">0°</span>
              </div>
              <input type="range" id="mg-s-loft" min="0" max="60" defaultValue="0" step="1" />
            </div>

            <div className="ctrl">
              <div className="ctrl-row">
                <span className="ctrl-label">Friction μ</span>
                <span className="ctrl-val" id="mg-v-friction">0.18</span>
              </div>
              <input type="range" id="mg-s-friction" min="0.05" max="0.45" defaultValue="0.18" step="0.01" />
            </div>

            <div className="eq-box" id="mg-eq-box">Loading…</div>

            <button className="btn-putt" id="mg-btn-putt">PUTT! &nbsp;[Space]</button>

            <div>
              <h3 style={{ marginBottom: 8 }}>Force Layers</h3>
              <div style={{ display:'flex', flexDirection:'column', gap: 6 }} id="mg-force-checkboxes"></div>
            </div>

            <div className="level-desc" id="mg-level-desc"></div>
          </div>

          {/* Canvas */}
          <div className="g-canvas-wrap" id="mg-canvas-wrap">
            <canvas id="mg-canvas3d"></canvas>
            <div className="g-toast" id="mg-toast"></div>
          </div>

          {/* Right panel */}
          <div className="g-right">
            <h3>Live Physics</h3>
            <div className="stat-grid">
              <div className="stat-card"><div className="sk">Speed</div><div className="sv blue" id="mg-sv-speed">0.00</div></div>
              <div className="stat-card"><div className="sk">KE (½mv²)</div><div className="sv amber" id="mg-sv-ke">0.00</div></div>
              <div className="stat-card"><div className="sk">Distance to hole</div><div className="sv" id="mg-sv-dist">—</div></div>
              <div className="stat-card"><div className="sk">Friction force</div><div className="sv" id="mg-sv-ff">0.00</div></div>
              <div className="stat-card"><div className="sk">Roll time</div><div className="sv" id="mg-sv-time">0.0s</div></div>
              <div className="stat-card"><div className="sk">Total rolled</div><div className="sv" id="mg-sv-rolled">0.0</div></div>
            </div>

            <div>
              <h3 style={{ marginBottom: 8 }}>Replay</h3>
              <div className="replay-bar">
                <div className="replay-controls">
                  <div className="rbc" id="mg-rbc-play">▶ Play</div>
                  <div className="rbc" id="mg-rbc-pause">⏸</div>
                  <div className="rbc" id="mg-rbc-frame">▸ Frame</div>
                </div>
                <input type="range" id="mg-replay-scrub" min="0" max="100" defaultValue="0" />
                <div className="replay-speed-row" id="mg-spd-row"></div>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: 8 }}>Apply Impulse</h3>
              <div className="apply-force">
                <div className="ctrl-row" style={{ fontSize:11, color:'var(--muted)' }}>Midshot force injection</div>
                <div className="af-row">
                  <span className="af-label">Direction</span>
                  <span className="af-val" id="mg-af-angle-v">90°</span>
                  <input type="range" className="purple" id="mg-af-angle" min="0" max="360" defaultValue="90" step="1" />
                </div>
                <div className="af-row">
                  <span className="af-label">Magnitude</span>
                  <span className="af-val" id="mg-af-mag-v">8.0</span>
                  <input type="range" className="purple" id="mg-af-mag" min="1" max="25" defaultValue="8" step="0.5" />
                </div>
                <div className="eq-box" style={{ fontSize: 10 }}>
                  Δv = F/m = <span id="mg-af-eq-v" style={{ color:'var(--purple)' }}>8.0</span>
                </div>
                <button className="btn-apply" id="mg-btn-apply" disabled>Inject Force</button>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: 8 }}>Level Stats</h3>
              <div style={{ fontSize:11, lineHeight:1.8, color:'var(--muted)', fontFamily:'monospace' }} id="mg-level-stats">
                Best stroke: —<br />Attempts: 0<br />Completed: No
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Win overlay */}
      <div className="g-overlay" id="mg-overlay">
        <div className="overlay-card">
          <h1 id="mg-ov-title">HOLE!</h1>
          <p id="mg-ov-subtitle"></p>
          <div className="insight-box" id="mg-ov-insight"></div>
          <div className="result-grid" id="mg-ov-results"></div>
          <div className="overlay-btns">
            <div className="ob" id="mg-ov-hide">Keep exploring</div>
            <div className="ob primary" id="mg-ov-next">Next Level →</div>
            <div className="ob" id="mg-ov-reset">↺ Retry</div>
          </div>
        </div>
      </div>
    </div>
  );
}
