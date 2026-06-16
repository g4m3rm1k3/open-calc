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

    // cup-sink animation state
    let sinkMode    = false;
    let sinkTimer   = 0;
    let sinkStartY  = 0;

    // loop-the-loop state
    let loopMode       = false;
    let loopSpeed      = 0;      // scalar speed along track (positive = CCW)
    let loopAngle      = 0;      // current angle from loop center (+X axis)
    let loopAngleEntry = 0;      // angle at entry — exit after exactly 2π of travel
    let loopEntryDir   = new THREE.Vector3(1, 0, 0); // XZ heading when entering loop
    let loopData       = null;   // { cx, cz, r, travel }
    let loopCooldown   = 0;      // seconds before ball can re-enter loop after exit

    const FORCES = {
      velocity: { label: 'Velocity (v)',  color: '#38b6ff', on: true },
      friction: { label: 'Friction (f)',  color: '#ff4545', on: true },
      normal:   { label: 'Normal (N)',    color: '#00c875', on: true },
      net:      { label: 'Net force',     color: '#ffb800', on: true },
      wind:     { label: 'Wind / field',  color: '#9b5de5', on: true },
    };

    // ── Kelty's Championship Greens — 9 holes ─────────────────
    const LEVELS = [
      // ── Hole 1: The Straight ──────────────────────────────────
      {
        name: 'H1 — The Straight', par: 2,
        concept: 'F = μmg  ·  KE = ½mv²',
        greenSize: { w: 32, d: 10 },
        tee:  new THREE.Vector3(-12, BALL_R, 0),
        hole: new THREE.Vector3( 12, BALL_R, 0),
        friction: 0.18, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-16, z1:-5, x2:16, z2:-5 },
          { type:'rect', x1:-16, z1: 5, x2:16, z2: 5 },
          { type:'rect', x1:-16, z1:-5, x2:-16, z2: 5 },
          { type:'rect', x1: 16, z1:-5, x2: 16, z2: 5 },
        ],
        obstacles: [
          { type:'sand', x: 0, z: 2.5, r: 2 },
          { type:'sand', x: 0, z:-2.5, r: 2 },
        ],
        desc: '<strong>Hole 1: Linear motion & friction.</strong><br>Aim straight for the cup. Sand traps slow the ball — μ_sand ≈ 3× normal. Watch kinetic energy drain as friction converts it to heat.<br><span class="concept">F_friction = μ·mg</span>',
        insight: 'a = μg = ' + (0.18*9.81).toFixed(2) + ' m/s². Max roll = v₀²/(2μg). Doubling μ halves rolling distance.',
      },
      // ── Hole 2: Dog-leg & Bank Shot ───────────────────────────
      {
        name: 'H2 — Dog-Leg', par: 3,
        concept: 'p = mv  ·  θᵢ = θᵣ',
        greenSize: { w: 40, d: 22 },
        tee:  new THREE.Vector3(-16, BALL_R, -6),
        hole: new THREE.Vector3( 14, BALL_R,  6),
        friction: 0.14, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-18, z1:-9, x2:18, z2:-9 },
          { type:'rect', x1:-18, z1: 9, x2:18, z2: 9 },
          { type:'rect', x1:-18, z1:-9, x2:-18, z2: 9 },
          { type:'rect', x1: 18, z1:-9, x2: 18, z2: 9 },
          // dog-leg wall forcing a turn
          { type:'rect', x1: -2, z1:-9, x2: -2, z2: 0 },
        ],
        obstacles: [
          { type:'bank', x: 4, z: 0, w: 10, rot: -Math.PI/4, restitution: 0.82 },
        ],
        desc: '<strong>Hole 2: Reflection & momentum.</strong><br>The wall forces a dog-leg. Use the angled bank to redirect momentum into the cup. θ_incidence = θ_reflection.<br><span class="concept">p = mv</span>',
        insight: 'Momentum along the wall is conserved. Only the normal component flips. e = 0.82 means 18% energy loss per bounce.',
      },

      // ── Hole 3: The Windmill ──────────────────────────────────
      {
        name: 'H3 — Windmill', par: 3,
        concept: 'Timing & angular velocity',
        greenSize: { w: 36, d: 12 },
        tee:  new THREE.Vector3(-14, BALL_R, 0),
        hole: new THREE.Vector3( 14, BALL_R, 0),
        friction: 0.15, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-16, z1:-6, x2:16, z2:-6 },
          { type:'rect', x1:-16, z1: 6, x2:16, z2: 6 },
          { type:'rect', x1:-16, z1:-6, x2:-16, z2: 6 },
          { type:'rect', x1: 16, z1:-6, x2: 16, z2: 6 },
        ],
        obstacles: [
          { type:'windmill', x: 0, z: 0, bladeLen: 4, speed: 1.8, gap: 0.8 },
          { type:'sand', x: 8, z: 3, r: 2 },
        ],
        desc: '<strong>Hole 3: Timing & angular velocity.</strong><br>The windmill rotates at ω rad/s. Time your putt to pass through when the gap is open. ω = v / r.<br><span class="concept">ω = 2π / T</span>',
        insight: 'The blade tip moves at v_tip = ω·r. At ω=1.8 and r=4: v_tip = 7.2 m/s. The period T = 2π/ω ≈ 3.5 s — that\'s your window.',
      },

      // ── Hole 4: The Barn & Tires ─────────────────────────────
      {
        name: 'H4 — Barn Run', par: 3,
        concept: 'x(t) = x₀ + v₀t − ½at²',
        greenSize: { w: 36, d: 14 },
        tee:  new THREE.Vector3(-14, BALL_R, 0),
        hole: new THREE.Vector3( 13, BALL_R, 4),
        friction: 0.12, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-16, z1:-7, x2:16, z2:-7 },
          { type:'rect', x1:-16, z1: 7, x2:16, z2: 7 },
          { type:'rect', x1:-16, z1:-7, x2:-16, z2: 7 },
          { type:'rect', x1: 16, z1:-7, x2: 16, z2: 7 },
        ],
        obstacles: [
          { type:'barn', x: 0, z: 0, len: 7, w: 3.2 },
          { type:'tires', positions: [[-8, 4], [-8, -4], [6, -5], [9, 2]] },
        ],
        desc: '<strong>Hole 4: Kinematics through a tunnel.</strong><br>The ball passes through the barn. Inside, only friction acts — predict exit speed using v² = v₀² − 2μg·d.<br><span class="concept">v = √(v₀² − 2μgd)</span>',
        insight: 'Tunnel length d = 7 m, μ = 0.12. Exit speed: v = √(v₀² − 2×0.12×9.81×7). Tires are solid obstacles — bounce angle tells you the reflection normal.',
      },

      // ── Hole 5: Roundabout ────────────────────────────────────
      {
        name: 'H5 — Roundabout', par: 3,
        concept: 'F_c = mv²/r',
        greenSize: { w: 34, d: 14 },
        tee:  new THREE.Vector3(-13, BALL_R, 0),
        hole: new THREE.Vector3( 13, BALL_R, 0),
        friction: 0.16, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-15, z1:-7, x2:15, z2:-7 },
          { type:'rect', x1:-15, z1: 7, x2:15, z2: 7 },
        ],
        obstacles: [
          { type:'spinner', cx:0, cz:0, r:5, armW:0.55, armLen:8, speed:1.1, phase:0 },
          { type:'sand', x: 8, z: 4, r: 1.8 },
          { type:'sand', x:-8, z:-4, r: 1.8 },
        ],
        desc: '<strong>Hole 5: Centripetal force & timing.</strong><br>The arm always rotates — even when your ball is still. Time your putt. If the arm hits you, it transfers angular momentum!<br><span class="concept">F_c = mv²/r</span>',
        insight: 'Arm speed at tip: v_tip = ω·r = 1.1×8 = 8.8 m/s. The arm imparts an impulsive force — Δp = F·Δt — changing ball direction instantly.',
      },

      // ── Hole 6: The Kelty Loop ────────────────────────────────
      {
        name: 'H6 — Kelty Loop', par: 3,
        concept: 'v_min = √(g·r)  ·  N = mv²/r − mg',
        greenSize: { w: 36, d: 10 },
        tee:  new THREE.Vector3(-14, BALL_R, 0),
        hole: new THREE.Vector3( 14, BALL_R, 0),
        friction: 0.09, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-16, z1:-5, x2:16, z2:-5 },
          { type:'rect', x1:-16, z1: 5, x2:16, z2: 5 },
          { type:'rect', x1:-16, z1:-5, x2:-16, z2: 5 },
          { type:'rect', x1: 16, z1:-5, x2: 16, z2: 5 },
        ],
        obstacles: [
          { type:'loop', x: 0, z: 0, r: 3.5, w: 1.8 },
        ],
        desc: '<strong>Hole 6 — The Kelty Loop.</strong><br>Hit fast enough to complete the loop. At the top, centripetal acceleration must exceed g or the ball falls off.<br><span class="concept">v_top ≥ √(g·r) = ' + Math.sqrt(9.81*3.5).toFixed(1) + ' m/s</span>',
        insight: 'Normal force N = mv²/r − mg·sin(θ). At the top (θ=90°): N = mv²/r − mg. N < 0 means the ball leaves the track. You need v_entry ≥ √(5gr) ≈ ' + Math.sqrt(5*9.81*3.5).toFixed(1) + ' m/s.',
      },

      // ── Hole 7: Ramp & Bridge ─────────────────────────────────
      {
        name: 'H7 — Bridge Jump', par: 4,
        concept: 'Projectile motion over a gap',
        greenSize: { w: 40, d: 16 },
        tee:  new THREE.Vector3(-16, BALL_R, 0),
        hole: new THREE.Vector3( 15, BALL_R, 4),
        friction: 0.13, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-18, z1:-8, x2:18, z2:-8 },
          { type:'rect', x1:-18, z1: 8, x2:18, z2: 8 },
          { type:'rect', x1:-18, z1:-8, x2:-18, z2: 8 },
          { type:'rect', x1: 18, z1:-8, x2: 18, z2: 8 },
        ],
        obstacles: [
          { type:'bridge', x: 0, z:-2, len: 9, w: 2.8, h: 1.6 },
          { type:'ramp',   x:-6, z:-2, w: 3,   d: 4,   h: 1.6, dir:'x' },
          { type:'sand',   x: 10, z: 0, r: 2 },
          { type:'water',  x: 0,  z: 3, r: 3 },
        ],
        desc: '<strong>Hole 7: Ramp & projectile motion.</strong><br>Hit the ramp to launch over the water onto the bridge. Use loft to give vertical velocity — then gravity takes over.<br><span class="concept">y = v_y·t − ½g·t²</span>',
        insight: 'Launch angle θ and speed v₀ set the trajectory. Range R = v₀²·sin(2θ)/g. Bridge height h = 1.6 m — you need v_y = √(2gh) ≈ ' + Math.sqrt(2*9.81*1.6).toFixed(1) + ' m/s minimum.',
      },

      // ── Hole 8: Volcano ───────────────────────────────────────
      {
        name: 'H8 — Volcano', par: 4,
        concept: 'Impulse J = F·Δt = Δp',
        greenSize: { w: 38, d: 20 },
        tee:  new THREE.Vector3(-14, BALL_R, 0),
        hole: new THREE.Vector3( 12, BALL_R, -6),
        friction: 0.14, wind: new THREE.Vector3(0,0,0),
        walls: [
          { type:'rect', x1:-17, z1:-10, x2:17, z2:-10 },
          { type:'rect', x1:-17, z1: 10, x2:17, z2: 10 },
          { type:'rect', x1:-17, z1:-10, x2:-17, z2: 10 },
          { type:'rect', x1: 17, z1:-10, x2: 17, z2: 10 },
        ],
        obstacles: [
          { type:'volcano', x: 0, z: 3, launchSpeed: 14 },
          { type:'chains',  x: 6, z: 0, gapAt: -5, gapW: 1.2, spacing: 1.4 },
          { type:'sand',    x:-6, z:-5, r: 2.2 },
          { type:'sand',    x: 8, z: 5, r: 1.8 },
        ],
        desc: '<strong>Hole 8: Impulse & momentum.</strong><br>The volcano launches the ball with a sudden impulse J = F·Δt. Navigate through the chain wall gap to reach the cup.<br><span class="concept">J = Δp = m·Δv</span>',
        insight: 'The volcano applies a large force over a tiny Δt — an impulse. The ball gains Δv = J/m regardless of direction. After launch, only gravity and friction control it.',
      },

      // ── Hole 9: Wind + Hills ─────────────────────────────────
      {
        name: 'H9 — Crosswind Valley', par: 4,
        concept: 'F_net = F_friction + F_wind + F_gravity',
        greenSize: { w: 44, d: 22 },
        tee:  new THREE.Vector3(-18, BALL_R, 0),
        hole: new THREE.Vector3( 18, BALL_R, 0),
        friction: 0.13, wind: new THREE.Vector3(0,0,4.5),
        walls: [
          { type:'rect', x1:-20, z1:-11, x2:20, z2:-11 },
          { type:'rect', x1:-20, z1: 11, x2:20, z2: 11 },
        ],
        obstacles: [
          { type:'hill',  x:-8, z: 0, w:10, d:14, h: 2.5 },
          { type:'valley',x: 4, z: 0, w:10, d:14, h: 2.0 },
          { type:'sand',  x: 0, z: 6, r: 2.5 },
          { type:'water', x: 0, z:-5, r: 2.5 },
        ],
        desc: '<strong>Hole 9: Superposition of forces.</strong><br>Crosswind pushes sideways. Hills convert KE to PE. Net force = vector sum of all forces. Aim into the wind.<br><span class="concept">a = (F_friction + F_wind + F_slope) / m</span>',
        insight: 'On the hill slope, gravity\'s tangential component a_t = g·sin(θ) decelerates you. Wind continuously adds lateral velocity. The net trajectory is a curve — plan ahead.',
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

      // Hole — deep cylinder so ball visually drops in
      const holeTerrY = getTerrainHeight(lv.hole.x, lv.hole.z);
      const hole3d = new THREE.Mesh(
        new THREE.CylinderGeometry(HOLE_R, HOLE_R, 0.7, 32),
        new THREE.MeshLambertMaterial({ color: 0x050505 })
      );
      hole3d.position.set(lv.hole.x, holeTerrY - 0.35, lv.hole.z); // top flush with terrain
      scene.add(hole3d); obstacles3d.push(hole3d);
      // Metal cup rim
      const rimRing = new THREE.Mesh(
        new THREE.TorusGeometry(HOLE_R, 0.04, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 })
      );
      rimRing.rotation.x = Math.PI / 2;
      rimRing.position.set(lv.hole.x, holeTerrY + 0.01, lv.hole.z);
      scene.add(rimRing); obstacles3d.push(rimRing);

      // Flag
      const hY = holeTerrY;
      const pole3d = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 5, 8),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      pole3d.position.set(lv.hole.x, hY + 2.5, lv.hole.z);
      // Flag pole is a solid obstacle — ball bounces off it (guarded in resolveCollisions so it can't block scoring)
      pole3d.userData = { wallType: 'cylinderObstacle', cx: lv.hole.x, cz: lv.hole.z, r: 0.06, isFlagPole: true };
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
        // Red stripe so spin is visible when ball rotates
        const stripe = new THREE.Mesh(
          new THREE.TorusGeometry(BALL_R * 0.72, BALL_R * 0.18, 6, 24),
          new THREE.MeshPhongMaterial({ color: 0xff3333 })
        );
        ball3d.add(stripe);
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

      // ── Windmill ──────────────────────────────────────────────────
      if (o.type === 'windmill') {
        // Tower
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 4, 1.2),
          new THREE.MeshLambertMaterial({ color: 0xd4a574 })
        );
        tower.position.set(o.x, 2, o.z);
        tower.castShadow = true;
        scene.add(tower); obstacles3d.push(tower);
        // Rotor hub
        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 0.5, 12),
          new THREE.MeshLambertMaterial({ color: 0x888888 })
        );
        hub.rotation.x = Math.PI / 2;
        hub.position.set(o.x, 2.5, o.z - 0.8);
        scene.add(hub); obstacles3d.push(hub);
        // 4 blades as a rotating group — all centered at group origin so the group
        // rotates correctly about its own hub point
        const bladeGroup = new THREE.Group();
        for (let b = 0; b < 4; b++) {
          const bladeM = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, o.bladeLen || 3.5, 0.1),
            new THREE.MeshLambertMaterial({ color: 0xf5e6c8 })
          );
          // Center each blade at (0,0,0) in group space — BoxGeometry extends ±half-len
          // in Y before rotation, rotation.z staggers them 90° apart
          bladeM.position.set(0, 0, 0);
          bladeM.rotation.z = (b / 4) * Math.PI * 2;
          bladeGroup.add(bladeM);
        }
        // Position blades at ball-path Z so rotation actually blocks the ball
        bladeGroup.position.set(o.x, 2.5, o.z);
        scene.add(bladeGroup); obstacles3d.push(bladeGroup);
        bladeGroup.userData = {
          wallType: 'windmill',
          cx: o.x, cz: o.z, bladeLen: o.bladeLen || 3.5,
          speed: o.speed || 1.5, angle: 0,
          gapZ: o.z, passY: 2.5
        };
        // Wall segments either side of gap
        const gapHalf = o.gap || 0.7;
        const wallH = 0.8;
        [-1, 1].forEach(side => {
          const ww = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, wallH * 2, 0.22),
            new THREE.MeshLambertMaterial({ color: 0x2a4a3a })
          );
          ww.position.set(o.x, wallH, o.z + side * (gapHalf + 1.2));
          scene.add(ww); obstacles3d.push(ww);
          ww.userData = { wallType: 'edge', x1: o.x - 0.2, z1: o.z + side*(gapHalf+0.1), x2: o.x + 0.2, z2: o.z + side*(gapHalf+2.4), nx: 1, nz: 0 };
        });
      }

      // ── Bridge ────────────────────────────────────────────────────
      if (o.type === 'bridge') {
        const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        const deck = new THREE.Mesh(new THREE.BoxGeometry(o.len||8, 0.2, o.w||2.6), bridgeMat);
        deck.position.set(o.x, o.h||1.5, o.z);
        deck.castShadow = true; deck.receiveShadow = true;
        scene.add(deck); obstacles3d.push(deck);
        deck.userData = { wallType: 'bridge', x: o.x, z: o.z, len: o.len||8, w: o.w||2.6, h: o.h||1.5 };
        // Water below
        const water = new THREE.Mesh(
          new THREE.PlaneGeometry(o.len||8, o.w||2.6),
          new THREE.MeshLambertMaterial({ color: 0x1ca3ff, transparent: true, opacity: 0.75 })
        );
        water.rotation.x = -Math.PI/2;
        water.position.set(o.x, 0.05, o.z);
        scene.add(water); obstacles3d.push(water);
        water.userData = { type: 'water', x: o.x, z: o.z, lenX: o.len||8, lenZ: o.w||2.6, isRect: true };
        // Railings
        [-1,1].forEach(side => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(o.len||8, 0.5, 0.1), bridgeMat);
          rail.position.set(o.x, (o.h||1.5)+0.35, o.z + side*((o.w||2.6)/2));
          scene.add(rail); obstacles3d.push(rail);
          rail.userData = { wallType:'edge', x1:o.x-(o.len||8)/2, z1:o.z+side*((o.w||2.6)/2), x2:o.x+(o.len||8)/2, z2:o.z+side*((o.w||2.6)/2), nx:0, nz:side };
        });
        // Support posts
        [-1,1].forEach(ex => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, o.h||1.5, 0.3), bridgeMat);
          post.position.set(o.x + ex*((o.len||8)/2 - 0.15), (o.h||1.5)/2, o.z);
          scene.add(post); obstacles3d.push(post);
        });
      }

      // ── Ramp jump ─────────────────────────────────────────────────
      if (o.type === 'ramp') {
        const rampMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const ramp = new THREE.Mesh(new THREE.BoxGeometry(o.w||3, 0.2, o.d||5), rampMat);
        ramp.position.set(o.x, (o.h||1.5)/2, o.z);
        ramp.rotation.x = -(o.h||1.5) / (o.d||5) * 1.2; // slope angle
        ramp.castShadow = true;
        scene.add(ramp); obstacles3d.push(ramp);
        ramp.userData = { wallType:'ramp', x:o.x, z:o.z, w:o.w||3, d:o.d||5, h:o.h||1.5, dir: o.dir||'x' };
      }

      // ── Volcano / pipe launcher ───────────────────────────────────
      if (o.type === 'volcano') {
        const vMat = new THREE.MeshLambertMaterial({ color: 0x8B3A1A });
        const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2.5, 3, 16), vMat);
        cone.position.set(o.x, 1.5, o.z);
        scene.add(cone); obstacles3d.push(cone);
        cone.userData = { wallType:'volcano', x:o.x, z:o.z, r:2.5, launchSpeed: o.launchSpeed||12 };
        // Lava glow ring
        const glow = new THREE.Mesh(
          new THREE.TorusGeometry(0.6, 0.15, 8, 24),
          new THREE.MeshLambertMaterial({ color: 0xff4500, emissive: 0xff2200, emissiveIntensity:0.8 })
        );
        glow.position.set(o.x, 3.05, o.z);
        scene.add(glow); obstacles3d.push(glow);
      }

      // ── Wall of chains (posts with narrow gaps) ───────────────────
      if (o.type === 'chains') {
        const postMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const gapCenter = o.gapAt || 0;
        for (let i = -3; i <= 3; i++) {
          const zPos = o.z + i * (o.spacing||1.4);
          if (Math.abs(zPos - gapCenter) < (o.gapW||0.9)) continue;
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.5, 8), postMat);
          post.position.set(o.x, 0.75, zPos);
          scene.add(post); obstacles3d.push(post);
          post.userData = { wallType:'cylinderObstacle', cx:o.x, cz:zPos, r:0.18 };
        }
        // Chain links between posts (visual)
        for (let i = -2; i <= 2; i++) {
          const zPos = o.z + i * (o.spacing||1.4) + (o.spacing||1.4)/2;
          if (Math.abs(zPos - gapCenter) < (o.gapW||0.9)) continue;
          const chain = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 12), postMat);
          chain.position.set(o.x, 0.8, zPos);
          chain.rotation.y = Math.PI/2;
          scene.add(chain);
        }
      }

      // ── Tires ─────────────────────────────────────────────────────
      if (o.type === 'tires') {
        const tireMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        (o.positions || [[o.x, o.z]]).forEach(([tx, tz]) => {
          const tire = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.28, 8, 20), tireMat);
          tire.rotation.x = Math.PI/2;
          tire.position.set(tx, 0.28, tz);
          scene.add(tire); obstacles3d.push(tire);
          tire.userData = { wallType:'cylinderObstacle', cx:tx, cz:tz, r:0.98 };
        });
      }

      // ── Log cabin / barn tunnel ───────────────────────────────────
      if (o.type === 'barn') {
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0xcc3300 });
        const len = o.len || 6;
        // Floor (just visual)
        const floor = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, o.w||3), woodMat);
        floor.position.set(o.x, 0.05, o.z);
        scene.add(floor); obstacles3d.push(floor);
        // Side walls (with gap for ball)
        [-1,1].forEach(side => {
          const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 1.6, 0.25), woodMat);
          wall.position.set(o.x, 0.8, o.z + side*((o.w||3)/2));
          wall.castShadow = true;
          scene.add(wall); obstacles3d.push(wall);
          wall.userData = { wallType:'edge', x1:o.x-len/2, z1:o.z+side*(o.w||3)/2, x2:o.x+len/2, z2:o.z+side*(o.w||3)/2, nx:0, nz:side };
        });
        // Peaked roof — pushed to obstacles3d so they are removed on level change
        const roofL = new THREE.Mesh(new THREE.BoxGeometry(len, 0.15, (o.w||3)/2+0.4), roofMat);
        roofL.position.set(o.x, 1.8, o.z - (o.w||3)/4);
        roofL.rotation.x = -0.4; // slopes DOWN toward the ridge at z = o.z
        scene.add(roofL); obstacles3d.push(roofL);
        const roofR = new THREE.Mesh(new THREE.BoxGeometry(len, 0.15, (o.w||3)/2+0.4), roofMat);
        roofR.position.set(o.x, 1.8, o.z + (o.w||3)/4);
        roofR.rotation.x = 0.4;  // slopes DOWN toward the ridge at z = o.z
        scene.add(roofR); obstacles3d.push(roofR);
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

    // Always-running scene updates (spinners + windmill spin every frame)
    function updateSceneObjects(dt) {
      if (!pos) return;

      // Windmill blade rotation (around Z axis)
      for (let mesh of obstacles3d) {
        if (mesh.userData.wallType !== 'windmill') continue;
        const wd = mesh.userData;
        wd.angle += wd.speed * dt;
        mesh.rotation.z = wd.angle;
      }

      for (let mesh of obstacles3d) {
        if (mesh.userData.wallType !== 'spinner') continue;
        const wd = mesh.userData;
        wd.angle += wd.speed * dt;
        mesh.rotation.y = wd.angle;

        // Collision runs every frame — arm hits ball whether rolling or stopped
        const ang  = wd.angle;
        const cosA = Math.cos(ang), sinA = Math.sin(ang);
        const ax1 = wd.cx + cosA * wd.armLen, az1 = wd.cz - sinA * wd.armLen;
        const ax2 = wd.cx - cosA * wd.armLen, az2 = wd.cz + sinA * wd.armLen;
        const adx = ax2 - ax1, adz = az2 - az1;
        const al  = Math.sqrt(adx*adx + adz*adz);
        const t   = Math.max(0, Math.min(1, ((pos.x - ax1)*adx + (pos.z - az1)*adz) / (al*al)));
        const cpx = ax1 + t*adx, cpz = az1 + t*adz;
        const ddx = pos.x - cpx, ddz = pos.z - cpz;
        const dd  = Math.sqrt(ddx*ddx + ddz*ddz);
        if (dd < BALL_R + wd.armW / 2) {
          const nn  = dd > 0.001 ? 1/dd : 1;
          const nx2 = ddx * nn, nz2 = ddz * nn;
          const pen = BALL_R + wd.armW / 2 - dd;
          pos.x += nx2 * pen;
          pos.z += nz2 * pen;
          // Transfer arm's surface velocity to ball
          const armTipSpeed = wd.speed * wd.armLen;
          const armVx = -sinA * armTipSpeed, armVz = -cosA * armTipSpeed;
          vel.x = vel.x * 0.3 + armVx * 0.7;
          vel.z = vel.z * 0.3 + armVz * 0.7;
          if (ball3d) ball3d.position.copy(pos);
          if (!ballActive && vel.length() > 0.2) {
            ballActive = true; // arm knocks a resting ball
            trailPoints = [];
          }
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
          // Ball falls off top — tangential direction at that angle, blended with entry dir
          loopMode = false; loopData = null; loopCooldown = 1.5;
          const tDir = new THREE.Vector3(-Math.sin(loopAngle), Math.cos(loopAngle), 0);
          // Preserve Z heading from entry so ball doesn't fly into the wall
          tDir.z = loopEntryDir.z * Math.abs(Math.sin(loopAngle));
          vel.copy(tDir.normalize().multiplyScalar(Math.abs(loopSpeed)));
          // Normal physics (airborne) will handle it next frame
        } else {
          const frictionAcc = mu * N * (loopSpeed > 0 ? -1 : 1);
          loopSpeed += (gTan + frictionAcc) * dt;
          const dAngle = (loopSpeed / ld.r) * dt;
          loopAngle    += dAngle;
          ld.travel    += Math.abs(dAngle);
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
          // Exit after exactly one revolution
          if (ld.travel >= Math.PI * 2) {
            loopMode = false; loopData = null;
            loopCooldown = 1.2; // prevent immediate re-entry
            // Exit in the same direction the ball entered, preserving speed
            vel.copy(loopEntryDir.clone().multiplyScalar(Math.abs(loopSpeed)));
            pos.y = BALL_R;
          }
          return; // skip normal physics
        }
      }

      if (loopCooldown > 0) loopCooldown -= dt;

      const speed = vel.length();

      // ── Loop entry detection ─────────────────────────────────────
      if (!loopMode && loopCooldown <= 0) {
        for (let mesh of obstacles3d) {
          if (mesh.userData.wallType !== 'loop') continue;
          const wd = mesh.userData;
          if (Math.abs(pos.z - wd.cz) > wd.tubeW) continue;
          const dx2 = pos.x - wd.cx, dy2 = pos.y - wd.r;
          const distToCenter = Math.sqrt(dx2*dx2 + dy2*dy2);
          // Ball near circle, approaching from left, going right
          if (Math.abs(distToCenter - wd.r) < BALL_R * 3 && pos.x < wd.cx && vel.x > 0.5) {
            loopMode       = true;
            loopData       = { cx: wd.cx, cz: wd.cz, r: wd.r, travel: 0 };
            loopAngle      = Math.atan2(dy2, dx2);
            loopAngleEntry = loopAngle;
            loopSpeed      = vel.length();
            // Save XZ heading so exit preserves direction
            loopEntryDir   = new THREE.Vector3(vel.x, 0, vel.z).normalize();
            const vMin = Math.sqrt(G_CONST * wd.r);
            toast(`Kelty Loop! Need v ≥ ${vMin.toFixed(1)} m/s at top. Current: ${loopSpeed.toFixed(1)}`);
            return;
          }
        }
      }

      const groundHazard = getTerrainHeight(pos.x, pos.z);
      const isAirborneHazard = pos.y > groundHazard + BALL_R * 1.5;
      for (let mesh of obstacles3d) {
        if (mesh.userData.type === 'water') {
          const dist = new THREE.Vector2(pos.x - mesh.userData.x, pos.z - mesh.userData.z).length();
          // Only trigger if ball is on or below ground level — not flying over
          if (dist < mesh.userData.r && !isAirborneHazard) {
            toast('Splash! Water hazard. Respun with penalty.');
            ballActive = false;
            setTimeout(resetBall, 600);
            return;
          }
        }
        if (mesh.userData.type === 'sand') {
          const dist = new THREE.Vector2(pos.x - mesh.userData.x, pos.z - mesh.userData.z).length();
          if (dist < mesh.userData.r && !isAirborneHazard) {
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

      const prevPos = pos.clone(); // capture pre-integration position for swept cup test
      const newPos = pos.clone().add(vel.clone().multiplyScalar(dt));
      const collided = resolveCollisions(pos, newPos, vel);
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
      // Rolling without slipping: ω = v / r
      ball3d.rotation.x += vel.z / BALL_R * dt;
      ball3d.rotation.z -= vel.x / BALL_R * dt;

      rollTime += dt;
      rollDist += vel.length() * dt;
      recordedFrames.push({ pos: pos.clone(), vel: vel.clone(), t: rollTime });

      updateTrail();
      updateArrows();
      updateStats();

      // Cup check — swept segment prevents tunneling at high speed
      // Ball enters hole at ANY speed (no lip-out mechanic — just like a real cup cut in the green)
      {
        const hx = lv.hole.x, hz = lv.hole.z;
        const sx = pos.x - prevPos.x, sz = pos.z - prevPos.z;
        const segLen2 = sx*sx + sz*sz;
        let closestDist;
        if (segLen2 < 0.0001) {
          const ddx = pos.x - hx, ddz = pos.z - hz;
          closestDist = Math.sqrt(ddx*ddx + ddz*ddz);
        } else {
          const t = Math.max(0, Math.min(1, ((hx - prevPos.x)*sx + (hz - prevPos.z)*sz) / segLen2));
          const cx2 = prevPos.x + t*sx, cz2 = prevPos.z + t*sz;
          closestDist = Math.sqrt((cx2-hx)*(cx2-hx) + (cz2-hz)*(cz2-hz));
        }
        if (!isAirborne && closestDist < HOLE_R) {
          // Start sink animation instead of instant win
          sinkMode   = true;
          sinkTimer  = 0;
          sinkStartY = pos.y;
          pos.x = hx; pos.z = hz;
          vel.set(0, 0, 0);
          ballActive = false;
          return;
        } else if (!isAirborne && closestDist < HOLE_R * 1.5) {
          // Gentle funnel pull near rim so ball rolls in naturally
          const pullDx = pos.x - hx, pullDz = pos.z - hz;
          const pullDist = Math.sqrt(pullDx*pullDx + pullDz*pullDz);
          if (pullDist > 0.01) {
            const pullStr = (HOLE_R * 1.5 - pullDist) * 7;
            vel.x -= (pullDx / pullDist) * pullStr * dt;
            vel.z -= (pullDz / pullDist) * pullStr * dt;
          }
        }
      }
      
      const gSize = lv.greenSize || { w: 40, d: 20 };
      if (Math.abs(pos.x) > (gSize.w / 2) + 2 || Math.abs(pos.z) > (gSize.d / 2) + 2) {
        toast('Out of bounds! Resetting…');
        setTimeout(resetBall, 600);
      }
    }

    function resolveCollisions(oldPos, newPos, vel) {
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

        // Cylinder obstacles (tires, chains, flag pole)
        if (wd.wallType === 'cylinderObstacle') {
          // Flag pole: skip collision when ball is already inside the cup radius
          // so it can never block a legitimate hole-out
          if (wd.isFlagPole) {
            const fpLv = LEVELS[currentLevel];
            const fpDx2 = p.x - fpLv.hole.x, fpDz2 = p.z - fpLv.hole.z;
            if (Math.sqrt(fpDx2*fpDx2 + fpDz2*fpDz2) < HOLE_R) continue;
          }
          const ddx = p.x - wd.cx, ddz = p.z - wd.cz;
          const dd = Math.sqrt(ddx*ddx + ddz*ddz);
          if (dd < BALL_R + wd.r && dd > 0.001) {
            const pen = BALL_R + wd.r - dd;
            const nx2 = ddx/dd, nz2 = ddz/dd;
            p.x += nx2 * pen; p.z += nz2 * pen;
            const vn = v.x*nx2 + v.z*nz2;
            if (vn < 0) { v.x -= 1.6*vn*nx2; v.z -= 1.6*vn*nz2; }
          }
        }

        // Windmill blade collision (treated as spinning bar)
        if (wd.wallType === 'windmill') {
          const ang = wd.angle;
          for (let b = 0; b < 4; b++) {
            const bAng = ang + (b/4)*Math.PI*2;
            const bLen = wd.bladeLen;
            const bx1 = wd.cx;
            const bx2 = wd.cx + Math.sin(bAng) * bLen;
            const by2 = wd.passY + Math.cos(bAng) * bLen;
            // Only check when ball is within blade-plane thickness in Z
            if (Math.abs(p.z - wd.cz) > BALL_R + 0.08) continue;
            const adx = bx2-bx1, ady = by2-wd.passY;
            const al2 = Math.sqrt(adx*adx + ady*ady);
            const t2 = Math.max(0,Math.min(1,((p.x-bx1)*adx + (p.y-wd.passY)*ady)/(al2*al2)));
            const cpx2 = bx1+t2*adx, cpy2 = wd.passY+t2*ady;
            const dxx = p.x-cpx2, dyy = p.y-cpy2;
            const dd2 = Math.sqrt(dxx*dxx + dyy*dyy);
            if (dd2 < BALL_R + 0.14) {
              const nn2 = dd2 > 0.001 ? 1/dd2 : 1;
              const nx3 = dxx*nn2, ny3 = dyy*nn2;
              const pen = BALL_R + 0.14 - dd2;
              p.x += nx3*pen; p.y += ny3*pen;
              const bladeSpd = wd.speed * bLen;
              v.x += Math.sin(bAng)*bladeSpd*0.4;
              v.y += Math.cos(bAng)*bladeSpd*0.4;
            }
          }
        }

        // Ramp — slope that launches the ball into the air
        if (wd.wallType === 'ramp') {
          const halfW = (wd.w || 3) / 2, halfD = (wd.d || 5) / 2;
          const inX = Math.abs(p.x - wd.x) < halfW;
          const inZ = Math.abs(p.z - wd.z) < halfD;
          if (inX && inZ) {
            // Slope rises from z = wd.z + halfD (bottom, y=0) to z = wd.z - halfD (top, y=wd.h)
            const tRamp = ((wd.z + halfD) - p.z) / (halfD * 2); // 0 at bottom, 1 at top
            const rampY = Math.max(0, tRamp * wd.h);
            if (p.y < rampY + BALL_R) {
              p.y = rampY + BALL_R;
              // Convert some horizontal speed to vertical (launch component)
              const slope = wd.h / (wd.d || 5);
              if (v.z < 0 && rampY > 0) { // moving up the ramp
                v.y = Math.max(v.y, Math.abs(v.z) * slope * 0.9);
              }
            }
          }
        }

        // Volcano — teleport/launch ball
        if (wd.wallType === 'volcano') {
          const ddx = p.x - wd.x, ddz = p.z - wd.z;
          if (Math.sqrt(ddx*ddx + ddz*ddz) < wd.r * 0.6) {
            // Launch ball up and slightly forward
            v.y = wd.launchSpeed;
            v.x = (Math.random()-0.5)*4;
            v.z = (Math.random()-0.5)*4;
            toast(`Volcano! Launched at ${wd.launchSpeed} m/s`);
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
      // Angular velocity: rolling without slipping ω = v / r
      q('sv-omega').textContent  = (speed / BALL_R).toFixed(1);
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

      // Cup-sink animation: ball visually drops into cup, then win fires
      if (sinkMode) {
        const SINK_DUR = 0.55;
        sinkTimer += dt;
        const t = Math.min(sinkTimer / SINK_DUR, 1.0);
        // Ease-in: accelerate downward, shrink slightly
        ball3d.position.y = sinkStartY - BALL_R * 5 * t * t;
        ball3d.scale.setScalar(1 - t * 0.5);
        if (t >= 1.0) {
          sinkMode = false;
          ball3d.scale.setScalar(1);
          winLevel();
        }
        if (controls) controls.update();
        renderer.render(scene, camera);
        return;
      }

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
              <div className="stat-card"><div className="sk">ω = v/r (rad/s)</div><div className="sv" style={{color:'#b8ff3e'}} id="mg-sv-omega">0.0</div></div>
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
