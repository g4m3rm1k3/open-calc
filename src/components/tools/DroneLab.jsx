import { useState, useRef, useEffect, useCallback } from 'react'
import { getPyodide } from '../../utils/pyodideRuntime.js'
import { executeScript } from '../../utils/openmatEngine.js'

// ── Math utilities ──────────────────────────────────────────────────
const vadd = (a,b) => [a[0]+b[0], a[1]+b[1]]
const vsub = (a,b) => [a[0]-b[0], a[1]-b[1]]
const vscale = (v,s) => [v[0]*s, v[1]*s]
const vmag = v => Math.sqrt(v[0]*v[0]+v[1]*v[1])
const vnorm = v => { const m=vmag(v)||1; return [v[0]/m, v[1]/m] }
const vdot = (a,b) => a[0]*b[0]+a[1]*b[1]
const vrot = (v,t) => [Math.cos(t)*v[0]-Math.sin(t)*v[1], Math.sin(t)*v[0]+Math.cos(t)*v[1]]
const vproj = (a,b) => { const s=vdot(a,b)/(vdot(b,b)||1); return vscale(b,s) }
const lerp = (a,b,t) => a+(b-a)*t

// ── Student MATH API ─────────────────────────────────────────────────
const MATH = {
  dot:(a,b) => { if(!Array.isArray(a)||!Array.isArray(b)) throw new Error('dot() expects arrays'); return vdot(a,b) },
  matMul:(M,v) => { if(!Array.isArray(M)||!Array.isArray(M[0])) throw new Error('matMul() expects 2D array + vector'); return [M[0][0]*v[0]+M[0][1]*v[1], M[1][0]*v[0]+M[1][1]*v[1]] },
  normalize:(v) => { if(!Array.isArray(v)) throw new Error('normalize() expects [x,y]'); return vnorm(v) },
  magnitude:(v) => { if(!Array.isArray(v)) throw new Error('magnitude() expects [x,y]'); return vmag(v) },
  project:(a,b) => { if(!Array.isArray(a)||!Array.isArray(b)) throw new Error('project() expects two arrays'); return vproj(a,b) },
  rotationMatrix:(t) => [[Math.cos(t),-Math.sin(t)],[Math.sin(t),Math.cos(t)]],
  identity:() => [[1,0],[0,1]],
  cross2d:(a,b) => a[0]*b[1]-a[1]*b[0],
  add:(a,b) => vadd(a,b),
  sub:(a,b) => vsub(a,b),
  scale:(v,s) => vscale(v,s),
}

// ── Flight interpreter ───────────────────────────────────────────────
function buildFlight(code) {
  const steps = []
  const drone = {
    move:(dx,dy) => {
      if(typeof dx!=='number'||typeof dy!=='number') throw new Error(`drone.move(dx,dy) needs numbers. Got ${typeof dx}, ${typeof dy}`)
      steps.push({type:'move',dx,dy})
    },
    moveTo:(x,y) => {
      if(typeof x!=='number'||typeof y!=='number') throw new Error('drone.moveTo(x,y) needs numbers.')
      steps.push({type:'moveTo',x,y})
    },
    rotate:(t) => {
      if(typeof t!=='number') throw new Error(`drone.rotate(theta) needs radians. Got: ${typeof t}`)
      steps.push({type:'rotate',theta:t})
    },
    rotateDeg:(d) => {
      if(typeof d!=='number') throw new Error('drone.rotateDeg(deg) needs a number.')
      steps.push({type:'rotate',theta:(d*Math.PI)/180})
    },
    setHeading:(t) => steps.push({type:'setHeading',theta:t}),
    wait:(f) => steps.push({type:'wait',frames:Math.min(f,300)}),
    hover:() => steps.push({type:'wait',frames:60}),
  }
  let syntaxError = null
  try {
    const fn = new Function('drone','math',code)
    fn(drone, MATH)
  } catch(e) {
    syntaxError = e.message
  }
  return { steps, syntaxError }
}

function simulate(steps, startPos, startTheta=0) {
  const frames = []
  let pos=[...startPos], theta=startTheta, t=0
  frames.push({pos:[...pos],theta,t})
  for(const s of steps) {
    if(s.type==='move') {
      const tgt=[pos[0]+s.dx, pos[1]+s.dy]
      const n=Math.max(1,Math.round(vmag(vsub(tgt,pos))/3))
      for(let i=1;i<=n;i++) frames.push({pos:[lerp(pos[0],tgt[0],i/n),lerp(pos[1],tgt[1],i/n)],theta,t:t+i})
      pos=tgt; t+=n
    } else if(s.type==='moveTo') {
      const tgt=[s.x,s.y]
      const n=Math.max(1,Math.round(vmag(vsub(tgt,pos))/3))
      for(let i=1;i<=n;i++) frames.push({pos:[lerp(pos[0],tgt[0],i/n),lerp(pos[1],tgt[1],i/n)],theta,t:t+i})
      pos=tgt; t+=n
    } else if(s.type==='rotate') {
      const tgt=theta+s.theta
      const n=Math.max(1,Math.round(Math.abs(s.theta)/0.05))
      for(let i=1;i<=n;i++) frames.push({pos:[...pos],theta:lerp(theta,tgt,i/n),t:t+i})
      theta=tgt; t+=n
    } else if(s.type==='setHeading') {
      const tgt=s.theta, n=Math.max(1,Math.round(Math.abs(tgt-theta)/0.05))
      for(let i=1;i<=n;i++) frames.push({pos:[...pos],theta:lerp(theta,tgt,i/n),t:t+i})
      theta=tgt; t+=n
    } else if(s.type==='wait') {
      for(let i=1;i<=s.frames;i++) frames.push({pos:[...pos],theta,t:t+i})
      t+=s.frames
    }
  }
  return frames
}

function validate(frames, goals) {
  return goals.map(g => {
    if(g.type==='reach') {
      const ok=frames.some(f=>vmag(vsub(f.pos,g.pos))<g.tol)
      return {label:g.label,pass:ok,hint:g.hint}
    } else if(g.type==='sequence') {
      let si=0
      for(const f of frames) {
        if(si<g.wps.length && vmag(vsub(f.pos,g.wps[si]))<g.tol) si++
      }
      return {label:g.label,pass:si===g.wps.length,hint:g.hint}
    }
    return {label:g.label,pass:false,hint:g.hint}
  })
}

// ── Python execution ─────────────────────────────────────────────────
async function runPythonDrone(userCode) {
  const output = []
  try {
    const pyodide = await getPyodide()
    pyodide.setStdout({batched:(msg)=>output.push(msg)})
    pyodide.setStderr({batched:(msg)=>output.push('⚠ '+msg)})
    const wrapper = `
import math as _math
import json as _json

class _Drone:
    def __init__(self):
        self._steps = []
    def move(self, dx, dy):
        self._steps.append({'type':'move','dx':float(dx),'dy':float(dy)})
    def move_to(self, x, y):
        self._steps.append({'type':'moveTo','x':float(x),'y':float(y)})
    def moveTo(self, x, y):
        self._steps.append({'type':'moveTo','x':float(x),'y':float(y)})
    def rotate(self, theta):
        self._steps.append({'type':'rotate','theta':float(theta)})
    def rotate_deg(self, deg):
        self._steps.append({'type':'rotate','theta':float(deg)*_math.pi/180})
    def rotateDeg(self, deg):
        self._steps.append({'type':'rotate','theta':float(deg)*_math.pi/180})
    def set_heading(self, theta):
        self._steps.append({'type':'setHeading','theta':float(theta)})
    def wait(self, frames):
        self._steps.append({'type':'wait','frames':min(int(frames),300)})
    def hover(self):
        self._steps.append({'type':'wait','frames':60})

class _Math:
    def dot(self, a, b): return sum(x*y for x,y in zip(a,b))
    def matMul(self, M, v): return [M[r][0]*v[0]+M[r][1]*v[1] for r in range(2)]
    def mat_mul(self, M, v): return self.matMul(M, v)
    def normalize(self, v):
        m = (v[0]**2+v[1]**2)**0.5 or 1
        return [v[0]/m, v[1]/m]
    def magnitude(self, v): return (v[0]**2+v[1]**2)**0.5
    def project(self, a, b):
        s = self.dot(a,b)/(self.dot(b,b) or 1)
        return [b[0]*s, b[1]*s]
    def rotation_matrix(self, theta):
        return [[_math.cos(theta),-_math.sin(theta)],[_math.sin(theta),_math.cos(theta)]]
    def rotationMatrix(self, theta): return self.rotation_matrix(theta)
    def identity(self): return [[1,0],[0,1]]
    def cross2d(self, a, b): return a[0]*b[1]-a[1]*b[0]
    def add(self, a, b): return [a[0]+b[0],a[1]+b[1]]
    def sub(self, a, b): return [a[0]-b[0],a[1]-b[1]]
    def scale(self, v, s): return [v[0]*s,v[1]*s]

drone = _Drone()
math = _Math()

${userCode}

_drone_steps = _json.dumps(drone._steps)
`
    await pyodide.runPythonAsync(wrapper)
    const proxy = pyodide.globals.get('_drone_steps')
    const stepsJson = proxy && typeof proxy === 'string' ? proxy : (proxy?.toString?.() ?? '[]')
    if(typeof proxy?.destroy === 'function') proxy.destroy()
    const steps = JSON.parse(stepsJson)
    return { steps, output, error: null }
  } catch(e) {
    return { steps: [], output, error: e.message }
  }
}

// ── MATLAB execution ─────────────────────────────────────────────────
function runMatlabDrone(userCode) {
  const output = []
  const stepsCollected = []
  const droneFuncs = {
    drone_move: (dx,dy) => stepsCollected.push({type:'move',dx:Number(dx),dy:Number(dy)}),
    drone_move_to: (x,y) => stepsCollected.push({type:'moveTo',x:Number(x),y:Number(y)}),
    drone_rotate: (t) => stepsCollected.push({type:'rotate',theta:Number(t)}),
    drone_rotate_deg: (d) => stepsCollected.push({type:'rotate',theta:Number(d)*Math.PI/180}),
    drone_wait: (f) => stepsCollected.push({type:'wait',frames:Math.min(Number(f),300)}),
    drone_hover: () => stepsCollected.push({type:'wait',frames:60}),
  }
  try {
    const preamble = `
% Drone API helper functions
% drone.move(dx,dy) → drone_move(dx,dy)
% drone.moveTo(x,y) → drone_move_to(x,y)
% drone.rotate(t)   → drone_rotate(t)
% math.normalize(v) → built-in normalize
% math.dot(a,b)     → dot(a,b)
% math.magnitude(v) → norm(v)
`
    const result = executeScript(preamble + '\n' + userCode, droneFuncs)
    if(result.output) output.push(...result.output.split('\n').filter(Boolean))
    return { steps: stepsCollected, output, error: result.error || null }
  } catch(e) {
    return { steps: stepsCollected, output, error: e.message }
  }
}

// ── LESSONS ──────────────────────────────────────────────────────────
const LESSONS = [
  {
    id:1,
    unit:'Unit 1 — Vectors',
    title:'Displacement Vectors',
    subtitle:'Moving a drone from point A to B using vector arithmetic',
    accent:'#4dd0ff',
    book:[
      {h:'Vector Definition',tex:'v ∈ ℝ²  →  v = [vₓ, v_y]\nAn ordered pair of real numbers.',note:'Vectors encode both magnitude and direction. Scalars have only magnitude.'},
      {h:'Displacement',tex:'d = p₂ − p₁\n  = [p₂ₓ−p₁ₓ,  p₂_y−p₁_y]',note:'The displacement vector points from A to B. Its length equals the distance.'},
      {h:'Magnitude (Euclidean norm)',tex:'‖v‖ = √(vₓ² + v_y²)',note:'Use this to check how far the drone will travel before sending the command.'},
    ],
    codeRef:[
      {l:'vector in JS',c:'const v = [3, -2];   // [x, y]'},
      {l:'displacement',c:'const d = [target[0]-start[0], target[1]-start[1]];'},
      {l:'magnitude',c:'const mag = math.magnitude(v);\n// = Math.sqrt(v[0]**2 + v[1]**2)'},
      {l:'drone API',c:'drone.move(dx, dy);   // relative displacement\ndrone.moveTo(x, y);  // absolute position'},
    ],
    realWorld:'When a DJI drone flies to GPS coordinate B from A, the flight controller computes the displacement vector, normalizes it for direction, scales by airspeed, and integrates position every 10 ms.',
    starter:`// MISSION: Visit 3 waypoints in sequence.
// Drone starts at [100, 240].
// For each waypoint: compute displacement d = wp − currentPos, then drone.move(d[0], d[1]).

const start = [100, 240];
const waypoints = [
  [300, 140],
  [500, 240],
  [300, 340],
];

let currentPos = start;

for (const wp of waypoints) {
  // TODO: compute displacement vector d = wp - currentPos
  const d = [/* wp[0] - currentPos[0] */ null, null];

  // TODO: command the drone to move by d
  // drone.move(d[0], d[1]);

  // TODO: update currentPos
  currentPos = currentPos; // fix this
}`,
    pyStarter:`# MISSION: Visit 3 waypoints in sequence.
start = [100, 240]
waypoints = [[300, 140], [500, 240], [300, 340]]

current_pos = start[:]

for wp in waypoints:
    # TODO: compute displacement d = wp - current_pos
    d = [None, None]

    # TODO: command the drone
    # drone.move(d[0], d[1])

    # TODO: update current_pos
    pass`,
    matStarter:`% MISSION: Visit 3 waypoints in sequence.
start = [100, 240];
waypoints = {[300,140], [500,240], [300,340]};
current_pos = start;

for i = 1:3
  wp = waypoints{i};
  % TODO: d = wp - current_pos
  d = [0, 0];
  % drone_move(d(1), d(2));
  current_pos = wp;
end`,
    solution:`const start=[100,240],waypoints=[[300,140],[500,240],[300,340]];
let currentPos=start;
for(const wp of waypoints){
  const d=[wp[0]-currentPos[0],wp[1]-currentPos[1]];
  drone.move(d[0],d[1]);
  currentPos=wp;
}`,
    mission:{
      startPos:[100,240], startTheta:-Math.PI/2,
      goals:[{type:'sequence',label:'Visit all 3 waypoints in order',wps:[[300,140],[500,240],[300,340]],tol:35,hint:'d=[wp[0]-currentPos[0], wp[1]-currentPos[1]], then drone.move(d[0],d[1]). Update currentPos=wp each loop.'}],
      wps:[[300,140],[500,240],[300,340]],obs:[],
    },
    errGuide:{'null':'d contains null — replace null with actual displacement components. Also uncomment drone.move(d[0],d[1]) and set currentPos=wp.'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      return {type:'vector',lines:[
        {label:'position',value:`[${f.pos[0].toFixed(1)}, ${f.pos[1].toFixed(1)}]`,color:'#4dd0ff'},
        {label:'frame',value:`${Math.min(ph,frames.length-1)} / ${frames.length-1}`,color:'#7a9ab8'},
      ]}
    },
  },

  {
    id:2,
    unit:'Unit 1 — Vectors',
    title:'Unit Vectors & Scaling',
    subtitle:'Direction without magnitude — normalizing for constant-speed flight',
    accent:'#4dd0ff',
    book:[
      {h:'Unit Vector',tex:'û = v / ‖v‖\nû = [vₓ/‖v‖,  v_y/‖v‖]',note:'A unit vector has magnitude exactly 1. It encodes direction only.'},
      {h:'Scaling',tex:'w = s · v,   s ∈ ℝ\nw = [s·vₓ,  s·v_y]',note:'Scaling stretches a vector. Direction unchanged when s > 0.'},
      {h:'Constant-speed flight',tex:'velocity = speed · û_direction',note:'Normalize direction, then scale by airspeed for constant-speed flight.'},
    ],
    codeRef:[
      {l:'normalize',c:'const u = math.normalize(v);\n// = [v[0]/mag, v[1]/mag]'},
      {l:'scale',c:'const w = [s * v[0], s * v[1]];'},
      {l:'fly 200px toward target',c:'const dir = math.normalize(displacement);\nconst step = [dir[0]*200, dir[1]*200];\ndrone.move(step[0], step[1]);'},
    ],
    realWorld:'ArduPilot normalizes the target vector then multiplies by max_airspeed (e.g. 15 m/s) to get the velocity command. Without normalization, longer distances would command faster speeds — the drone would overshoot.',
    starter:`// MISSION: Fly exactly 200 units toward the target — not all the way there.
// Normalize to get direction, then scale by SPEED.

const start  = [100, 240];
const target = [480, 380];
const SPEED  = 200;

const displacement = [target[0]-start[0], target[1]-start[1]];

// TODO: normalize to get direction (unit vector)
const direction = /* math.normalize(displacement) */ null;

// TODO: scale by SPEED
const move_vec = /* [direction[0]*SPEED, direction[1]*SPEED] */ null;

// TODO: command the drone
// drone.move(move_vec[0], move_vec[1]);`,
    pyStarter:`# MISSION: Fly exactly 200 units toward the target.
start  = [100, 240]
target = [480, 380]
SPEED  = 200

displacement = [target[0]-start[0], target[1]-start[1]]

# TODO: normalize
direction = None  # math.normalize(displacement)

# TODO: scale
move_vec = None  # [direction[0]*SPEED, direction[1]*SPEED]

# TODO: command drone
# drone.move(move_vec[0], move_vec[1])`,
    matStarter:`% MISSION: Fly exactly 200 units toward target.
start  = [100, 240];
target = [480, 380];
SPEED  = 200;

displacement = target - start;
mag = norm(displacement);
direction = displacement / mag;   % normalize
move_vec = direction * SPEED;
% drone_move(move_vec(1), move_vec(2));`,
    solution:`const start=[100,240],target=[480,380],SPEED=200;
const displacement=[target[0]-start[0],target[1]-start[1]];
const direction=math.normalize(displacement);
const move_vec=[direction[0]*SPEED,direction[1]*SPEED];
drone.move(move_vec[0],move_vec[1]);`,
    mission:{
      startPos:[100,240], startTheta:-Math.PI/2,
      goals:[{type:'reach',label:'Land within 40px of the 200-unit mark',pos:[329,316],tol:50,hint:'math.normalize(displacement) gives direction. Multiply each component by SPEED=200.'}],
      wps:[[329,316]],obs:[],speedRing:{c:[100,240],r:200},
    },
    errGuide:{'null':'direction or move_vec is null. Use math.normalize(displacement) for direction, then [direction[0]*SPEED, direction[1]*SPEED] for move_vec.'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const startP=[100,240]
      const dist=vmag(vsub(f.pos,startP))
      return {type:'vector',lines:[
        {label:'dist travelled',value:`${dist.toFixed(1)} px`,color:'#4dd0ff'},
        {label:'target dist',value:'200 px',color:'#7a9ab8'},
        {label:'error',value:`${Math.abs(dist-200).toFixed(1)} px`,color:Math.abs(dist-200)<50?'#44ff88':'#ff6644'},
      ]}
    },
  },

  {
    id:3,
    unit:'Unit 2 — Dot Product',
    title:'Dot Product & Alignment',
    subtitle:'Measuring alignment — approach angle verification for landing',
    accent:'#44ff88',
    book:[
      {h:'Dot Product',tex:'a · b = aₓbₓ + a_yb_y\na · b = ‖a‖‖b‖ cos θ',note:'The dot product is a scalar measuring how much two vectors point in the same direction.'},
      {h:'Angle between vectors',tex:'cos θ = (a · b) / (‖a‖ ‖b‖)\nθ = arccos(a·b / ‖a‖‖b‖)',note:'If a,b are unit vectors: a·b = cos θ directly. Range: [−1, 1].'},
      {h:'Interpretation',tex:'a·b > 0  →  θ < 90°  same direction\na·b = 0  →  θ = 90°  perpendicular\na·b < 0  →  θ > 90°  opposing',note:'Alignment check: dot(normalize(a), normalize(b)) > 0.95 means < 18° off-axis.'},
    ],
    codeRef:[
      {l:'dot product',c:'const d = math.dot(a, b);\n// = a[0]*b[0] + a[1]*b[1]'},
      {l:'angle between vectors',c:'const cosT = math.dot(math.normalize(a), math.normalize(b));\nconst theta = Math.acos(cosT);'},
      {l:'alignment check',c:'const aligned = math.dot(\n  math.normalize(heading),\n  math.normalize(toTarget)\n) > 0.95;'},
    ],
    realWorld:"Drone landing systems check dot product between current velocity vector and landing pad approach vector. If misaligned, the drone circles and re-approaches. This prevents dangerous cross-wind landings.",
    starter:`// MISSION: Land on two pads — each with a required approach direction.
// PAD-A: approach from the left  (required heading: [1, 0])
// PAD-B: approach from below     (required heading: [0, -1])

const padA = { pos: [320, 160], reqHeading: [1, 0]  };
const padB = { pos: [500, 340], reqHeading: [0, -1] };

// Approach PAD-A from the left
drone.moveTo(100, 160);
const toA    = [padA.pos[0]-100, padA.pos[1]-160];
const unitToA = math.normalize(toA);

// TODO: measure alignment with dot product
const alignmentA = null; // math.dot(unitToA, padA.reqHeading)

drone.moveTo(padA.pos[0], padA.pos[1]);

// Approach PAD-B from below
drone.moveTo(500, 440);
const toB    = [padB.pos[0]-500, padB.pos[1]-440];
const unitToB = math.normalize(toB);

// TODO: measure alignment with dot product
const alignmentB = null; // math.dot(unitToB, padB.reqHeading)

drone.moveTo(padB.pos[0], padB.pos[1]);`,
    pyStarter:`# MISSION: Land on two pads with correct approach angle.
pad_a = {'pos': [320, 160], 'req_heading': [1, 0]}
pad_b = {'pos': [500, 340], 'req_heading': [0, -1]}

drone.moveTo(100, 160)
to_a = [pad_a['pos'][0]-100, pad_a['pos'][1]-160]
unit_to_a = math.normalize(to_a)
alignment_a = math.dot(unit_to_a, pad_a['req_heading'])  # should be ≈1.0
drone.moveTo(pad_a['pos'][0], pad_a['pos'][1])

drone.moveTo(500, 440)
to_b = [pad_b['pos'][0]-500, pad_b['pos'][1]-440]
unit_to_b = math.normalize(to_b)
alignment_b = math.dot(unit_to_b, pad_b['req_heading'])
drone.moveTo(pad_b['pos'][0], pad_b['pos'][1])`,
    matStarter:`% MISSION: Land on two pads with correct approach angle.
drone_move_to(100, 160);
to_a = [320-100, 160-160]; mag_a = norm(to_a); unit_a = to_a/mag_a;
req_a = [1, 0];
alignment_a = dot(unit_a, req_a)
drone_move_to(320, 160);

drone_move_to(500, 440);
to_b = [500-500, 340-440]; mag_b = norm(to_b); unit_b = to_b/mag_b;
req_b = [0, -1];
alignment_b = dot(unit_b, req_b)
drone_move_to(500, 340);`,
    solution:`const padA={pos:[320,160],reqHeading:[1,0]};
const padB={pos:[500,340],reqHeading:[0,-1]};
drone.moveTo(100,160);
const toA=[padA.pos[0]-100,padA.pos[1]-160];
const unitToA=math.normalize(toA);
const alignmentA=math.dot(unitToA,padA.reqHeading);
drone.moveTo(padA.pos[0],padA.pos[1]);
drone.moveTo(500,440);
const toB=[padB.pos[0]-500,padB.pos[1]-440];
const unitToB=math.normalize(toB);
const alignmentB=math.dot(unitToB,padB.reqHeading);
drone.moveTo(padB.pos[0],padB.pos[1]);`,
    mission:{
      startPos:[100,300], startTheta:-Math.PI/2,
      goals:[
        {type:'reach',label:'Land on Pad A',pos:[320,160],tol:35,hint:'Stage at [100,160] → normalize toA → dot with [1,0] → moveTo pad'},
        {type:'reach',label:'Land on Pad B',pos:[500,340],tol:35,hint:'Stage at [500,440] → normalize toB → dot with [0,-1] → moveTo pad'},
      ],
      wps:[[320,160],[500,340]],
      obs:[{x:240,y:100,w:16,h:160},{x:400,y:260,w:16,h:160}],
    },
    errGuide:{'null':'alignmentA or alignmentB is null. Use math.dot(unitVector, requiredHeading). Result ≈1.0 = perfectly aligned.'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const padA=[320,160], padB=[500,340]
      const dA=vmag(vsub(f.pos,padA)), dB=vmag(vsub(f.pos,padB))
      return {type:'vector',lines:[
        {label:'dist to Pad A',value:`${dA.toFixed(0)} px`,color:dA<35?'#44ff88':'#4dd0ff'},
        {label:'dist to Pad B',value:`${dB.toFixed(0)} px`,color:dB<35?'#44ff88':'#4dd0ff'},
      ]}
    },
  },

  {
    id:4,
    unit:'Unit 2 — Dot Product',
    title:'Cross Product & Turn Direction',
    subtitle:'2D cross product — which way to rotate?',
    accent:'#44ff88',
    book:[
      {h:'2D Cross Product',tex:'a × b = aₓb_y − a_yb_x\nResult is a scalar (z-component only)',note:'In 2D the cross product gives a signed scalar. Positive = CCW turn, negative = CW turn.'},
      {h:'Signed angle from cross product',tex:'sign(a × b) = sign(sin θ)\nIf a × b > 0: b is CCW from a\nIf a × b < 0: b is CW from a',note:'Combined with dot product, cross product fully determines the angle (magnitude + sign).'},
      {h:'atan2 for full angle',tex:'θ = atan2(a × b,  a · b)\n  = angle from a to b',note:'atan2 gives the correct signed angle in (−π, π] without ambiguity.'},
    ],
    codeRef:[
      {l:'2D cross product',c:'const cross = math.cross2d(a, b);\n// = a[0]*b[1] - a[1]*b[0]'},
      {l:'turn direction check',c:'const turnDir = math.cross2d(heading, toTarget);\n// > 0 → turn CCW (left)\n// < 0 → turn CW  (right)'},
      {l:'signed angle',c:'const angle = Math.atan2(\n  math.cross2d(a, b),\n  math.dot(a, b)\n);'},
    ],
    realWorld:'Autopilots use atan2(cross, dot) to compute the shortest rotation to align with a new bearing — critical for efficient multi-waypoint missions without overshooting turns.',
    starter:`// MISSION: Fly to 4 targets using ONLY rotate + forward movement.
// Use cross2d to determine turn direction, atan2 for the exact angle.

let heading = [0, -1]; // pointing up (north)
let pos     = [330, 380];
const targets = [[200, 200], [480, 140], [540, 360], [160, 360]];

for (const tgt of targets) {
  const toTgt = math.normalize([tgt[0]-pos[0], tgt[1]-pos[1]]);
  const dist  = math.magnitude([tgt[0]-pos[0], tgt[1]-pos[1]]);

  // TODO: compute signed angle from heading → toTgt
  // const angle = Math.atan2(math.cross2d(heading, toTgt), math.dot(heading, toTgt));
  const angle = null;

  // TODO: rotate and move
  // drone.rotate(angle);
  // drone.move(toTgt[0]*dist, toTgt[1]*dist);

  heading = toTgt;
  pos     = tgt;
}`,
    pyStarter:`# MISSION: Navigate 4 targets using rotate + forward.
import math as m
heading = [0, -1]
pos     = [330, 380]
targets = [[200, 200], [480, 140], [540, 360], [160, 360]]

for tgt in targets:
    to_tgt = math.normalize([tgt[0]-pos[0], tgt[1]-pos[1]])
    dist   = math.magnitude([tgt[0]-pos[0], tgt[1]-pos[1]])
    cross  = math.cross2d(heading, to_tgt)
    dot    = math.dot(heading, to_tgt)
    angle  = m.atan2(cross, dot)
    drone.rotate(angle)
    drone.move(to_tgt[0]*dist, to_tgt[1]*dist)
    heading = to_tgt
    pos     = tgt`,
    matStarter:`% MISSION: Navigate 4 targets using rotate + forward.
heading = [0, -1];
pos = [330, 380];
targets = {[200,200],[480,140],[540,360],[160,360]};
for i = 1:4
  tgt = targets{i};
  diff = [tgt(1)-pos(1), tgt(2)-pos(2)];
  dist = norm(diff);
  to_tgt = diff / dist;
  cross = heading(1)*to_tgt(2) - heading(2)*to_tgt(1);
  d = dot(heading, to_tgt);
  angle = atan2(cross, d);
  drone_rotate(angle);
  drone_move(to_tgt(1)*dist, to_tgt(2)*dist);
  heading = to_tgt;
  pos = tgt;
end`,
    solution:`let heading=[0,-1],pos=[330,380];
const targets=[[200,200],[480,140],[540,360],[160,360]];
for(const tgt of targets){
  const diff=[tgt[0]-pos[0],tgt[1]-pos[1]];
  const dist=math.magnitude(diff);
  const toTgt=math.normalize(diff);
  const angle=Math.atan2(math.cross2d(heading,toTgt),math.dot(heading,toTgt));
  drone.rotate(angle);
  drone.move(toTgt[0]*dist,toTgt[1]*dist);
  heading=toTgt; pos=tgt;
}`,
    mission:{
      startPos:[330,380], startTheta:-Math.PI/2,
      goals:[{type:'sequence',label:'Visit all 4 targets using rotate + forward',wps:[[200,200],[480,140],[540,360],[160,360]],tol:40,hint:'angle=atan2(cross2d(heading,toTgt), dot(heading,toTgt)). Then rotate(angle) + move(toTgt[0]*dist, toTgt[1]*dist).'}],
      wps:[[200,200],[480,140],[540,360],[160,360]],obs:[],
    },
    errGuide:{'null':'angle is null. Use Math.atan2(math.cross2d(heading, toTgt), math.dot(heading, toTgt)).'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const degH=(f.theta*180/Math.PI).toFixed(1)
      return {type:'vector',lines:[
        {label:'heading (rad)',value:f.theta.toFixed(3),color:'#44ff88'},
        {label:'heading (deg)',value:`${degH}°`,color:'#44ff88'},
        {label:'position',value:`[${f.pos[0].toFixed(0)}, ${f.pos[1].toFixed(0)}]`,color:'#7a9ab8'},
      ]}
    },
  },

  {
    id:5,
    unit:'Unit 3 — Matrices',
    title:'Rotation Matrices',
    subtitle:'Rotating a vector using a 2×2 matrix',
    accent:'#cc44ff',
    book:[
      {h:'2×2 Rotation Matrix',tex:'R(θ) = ⎡ cos θ  −sin θ ⎤\n        ⎣ sin θ   cos θ ⎦',note:'R(θ) rotates any vector counterclockwise by θ. Orthogonal: Rᵀ = R⁻¹.'},
      {h:'Matrix × vector',tex:"v' = R(θ) · v\nv'ₓ = cos(θ)·vₓ − sin(θ)·v_y\nv'_y = sin(θ)·vₓ + cos(θ)·v_y",note:'Each output component is a dot product of a matrix row with the input vector.'},
      {h:'Composing rotations',tex:'R(α+β) = R(α) · R(β)',note:'Rotating by α then β = rotating by α+β. Matrix multiply composes transforms.'},
    ],
    codeRef:[
      {l:'build R(θ)',c:'const R = [\n  [Math.cos(theta), -Math.sin(theta)],\n  [Math.sin(theta),  Math.cos(theta)]\n];'},
      {l:'apply R(θ)·v',c:'const vPrime = math.matMul(R, v);\n// = [R[0][0]*v[0]+R[0][1]*v[1],\n//    R[1][0]*v[0]+R[1][1]*v[1]]'},
      {l:'drone rotation',c:'drone.rotate(Math.PI/2);   // 90° CCW\ndrone.rotateDeg(45);       // 45° CCW'},
    ],
    realWorld:'Every drone with a non-north heading must rotate its body-frame velocity into world-frame using R(θ) before sending to GPS. The flight controller applies this at 400 Hz to convert [forward, right] → [north, east].',
    starter:`// MISSION: Navigate 4 waypoints using rotate + forward movement.
// You MUST build R(θ) and apply it to your heading vector.

const waypoints = [[340,120],[540,240],[340,360],[140,240]];
let currentPos  = [140, 240];
let heading     = [0, -1]; // pointing north

for (const wp of waypoints) {
  const toWp = [wp[0]-currentPos[0], wp[1]-currentPos[1]];
  const dist  = math.magnitude(toWp);
  const dir   = math.normalize(toWp);

  const targetAngle  = Math.atan2(dir[1], dir[0]);
  const currentAngle = Math.atan2(heading[1], heading[0]);

  // TODO: compute dTheta = how much to rotate
  const dTheta = null; // targetAngle - currentAngle

  // TODO: build 2×2 rotation matrix R(dTheta)
  const R = [
    [null, null], // [ cos(dTheta), -sin(dTheta) ]
    [null, null], // [ sin(dTheta),  cos(dTheta) ]
  ];

  // TODO: newHeading = math.matMul(R, heading)
  const newHeading = null;

  drone.rotate(dTheta);        // turn
  drone.move(0, -dist);        // move forward
  heading    = dir;
  currentPos = wp;
}`,
    pyStarter:`# MISSION: Navigate 4 waypoints via rotate + forward.
import math as m
waypoints = [[340,120],[540,240],[340,360],[140,240]]
current_pos = [140, 240]
heading = [0, -1]

for wp in waypoints:
    to_wp = [wp[0]-current_pos[0], wp[1]-current_pos[1]]
    dist  = math.magnitude(to_wp)
    direction = math.normalize(to_wp)
    target_angle  = m.atan2(direction[1], direction[0])
    current_angle = m.atan2(heading[1], heading[0])
    d_theta = target_angle - current_angle
    R = math.rotation_matrix(d_theta)
    new_heading = math.mat_mul(R, heading)
    drone.rotate(d_theta)
    drone.move(0, -dist)
    heading     = direction
    current_pos = wp`,
    matStarter:`% MISSION: Navigate 4 waypoints via rotate + forward.
waypoints = {[340,120],[540,240],[340,360],[140,240]};
current_pos = [140, 240];
heading = [0, -1];
for i = 1:4
  wp = waypoints{i};
  to_wp = [wp(1)-current_pos(1), wp(2)-current_pos(2)];
  dist  = norm(to_wp);
  dir   = to_wp / dist;
  d_theta = atan2(dir(2),dir(1)) - atan2(heading(2),heading(1));
  R = [cos(d_theta) -sin(d_theta); sin(d_theta) cos(d_theta)];
  new_heading = R * heading';
  drone_rotate(d_theta);
  drone_move(0, -dist);
  heading = dir;
  current_pos = wp;
end`,
    solution:`const waypoints=[[340,120],[540,240],[340,360],[140,240]];
let currentPos=[140,240],heading=[0,-1];
for(const wp of waypoints){
  const toWp=[wp[0]-currentPos[0],wp[1]-currentPos[1]];
  const dist=math.magnitude(toWp);
  const dir=math.normalize(toWp);
  const dTheta=Math.atan2(dir[1],dir[0])-Math.atan2(heading[1],heading[0]);
  const R=[[Math.cos(dTheta),-Math.sin(dTheta)],[Math.sin(dTheta),Math.cos(dTheta)]];
  const newHeading=math.matMul(R,heading);
  drone.rotate(dTheta);
  drone.move(0,-dist);
  heading=dir; currentPos=wp;
}`,
    mission:{
      startPos:[140,240], startTheta:-Math.PI/2,
      goals:[{type:'sequence',label:'Visit all 4 waypoints via rotate + forward',wps:[[340,120],[540,240],[340,360],[140,240]],tol:45,hint:'dTheta=targetAngle-currentAngle. R=[[cos,-sin],[sin,cos]]. matMul(R,heading) rotates it.'}],
      wps:[[340,120],[540,240],[340,360],[140,240]],obs:[],
    },
    errGuide:{'null':'dTheta, R, or newHeading is null. dTheta=targetAngle-currentAngle. R=[[Math.cos(dTheta),-Math.sin(dTheta)],[Math.sin(dTheta),Math.cos(dTheta)]]. newHeading=math.matMul(R,heading).'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const c=Math.cos(f.theta), s=Math.sin(f.theta)
      return {type:'matrix',label:'R(θ) — body frame',rows:[
        [`cos(${(f.theta).toFixed(2)})=${c.toFixed(3)}`,`-sin=${(-s).toFixed(3)}`],
        [`sin=${s.toFixed(3)}`,`cos=${c.toFixed(3)}`],
      ],note:`θ = ${(f.theta*180/Math.PI).toFixed(1)}°`}
    },
  },

  {
    id:6,
    unit:'Unit 3 — Matrices',
    title:'Composing Transforms',
    subtitle:'Chaining rotations and translations with 3×3 homogeneous matrices',
    accent:'#cc44ff',
    book:[
      {h:'Homogeneous 2D Transform',tex:'T = ⎡ R₂ₓ₂  t₂ₓ₁ ⎤\n    ⎣ 0  0   1   ⎦\nT ∈ ℝ³ˣ³',note:'Packing rotation and translation into one matrix allows composition with a single multiply.'},
      {h:'Applying T to a point',tex:"p' = T · [x, y, 1]ᵀ",note:'Append 1 to the point (homogeneous coord), multiply, read first two rows.'},
      {h:'Composing transforms',tex:'T_total = T₁ · T₂\nApply T₂ first, then T₁.',note:'Order matters! T₁T₂ ≠ T₂T₁ in general.'},
    ],
    codeRef:[
      {l:'build T(θ, tx, ty)',c:"function makeT(theta, tx, ty) {\n  const c=Math.cos(theta), s=Math.sin(theta);\n  return [[c,-s,tx],[s,c,ty],[0,0,1]];\n}"},
      {l:'apply T to point',c:'function applyT(T, p) {\n  return [\n    T[0][0]*p[0]+T[0][1]*p[1]+T[0][2],\n    T[1][0]*p[0]+T[1][1]*p[1]+T[1][2],\n  ];\n}'},
      {l:'compose T₁ · T₂',c:'function mulT(A, B) {\n  const C=[[0,0,0],[0,0,0],[0,0,1]];\n  for(let i=0;i<3;i++) for(let j=0;j<3;j++)\n    C[i][j]=A[i].reduce((s,v,k)=>s+v*B[k][j],0);\n  return C;\n}'},
    ],
    realWorld:'GPS-denied indoor drones chain a sequence of transforms (rotate, translate, rotate, translate...) to track position in a global frame — critical for warehouse drones flying in tight aisles.',
    starter:`// MISSION: Fly a 3-step path using homogeneous transforms.
// Each step: rotate by some angle, then translate forward.
// Compute where you end up by composing T matrices.

function makeT(theta, tx, ty) {
  const c=Math.cos(theta), s=Math.sin(theta);
  return [[c,-s,tx],[s,c,ty],[0,0,1]];
}
function applyT(T, p) {
  return [T[0][0]*p[0]+T[0][1]*p[1]+T[0][2], T[1][0]*p[0]+T[1][1]*p[1]+T[1][2]];
}
function mulT(A, B) {
  const C=[[0,0,0],[0,0,0],[0,0,1]];
  for(let i=0;i<3;i++) for(let j=0;j<3;j++)
    C[i][j]=A[i].reduce((s,v,k)=>s+v*B[k][j],0);
  return C;
}

// Chain: start at [100,300], go right 180, turn -90°, go up 160, turn -90°, go right 180
drone.moveTo(100, 300);
drone.move(180, 0);
drone.rotate(-Math.PI/2);
drone.move(0, -160);
drone.rotate(-Math.PI/2);
drone.move(180, 0);

// TODO: compute final position using T composition
// T1 = makeT(0, 180, 0)         // translate right
// T2 = makeT(-Math.PI/2, 0, 0)  // rotate
// T3 = makeT(0, 0, -160)        // translate up
// T4 = makeT(-Math.PI/2, 0, 0)  // rotate
// T5 = makeT(0, 180, 0)         // translate right
// total = mulT(T5, mulT(T4, mulT(T3, mulT(T2, T1))))
// const finalPos = applyT(total, [100, 300]);
// console.log(finalPos); // should be close to target`,
    pyStarter:`# MISSION: Compose transforms to predict final drone position.
import math as m
import math

def make_T(theta, tx, ty):
    c, s = m.cos(theta), m.sin(theta)
    return [[c,-s,tx],[s,c,ty],[0,0,1]]

def apply_T(T, p):
    return [T[0][0]*p[0]+T[0][1]*p[1]+T[0][2], T[1][0]*p[0]+T[1][1]*p[1]+T[1][2]]

def mul_T(A, B):
    C = [[0,0,0],[0,0,0],[0,0,1]]
    for i in range(3):
        for j in range(3):
            C[i][j] = sum(A[i][k]*B[k][j] for k in range(3))
    return C

drone.moveTo(100, 300)
drone.move(180, 0)
drone.rotate(-m.pi/2)
drone.move(0, -160)
drone.rotate(-m.pi/2)
drone.move(180, 0)`,
    matStarter:`% MISSION: Compose transforms to predict final position.
drone_move_to(100, 300);
drone_move(180, 0);
drone_rotate(-pi/2);
drone_move(0, -160);
drone_rotate(-pi/2);
drone_move(180, 0);`,
    solution:`function makeT(t,tx,ty){const c=Math.cos(t),s=Math.sin(t);return[[c,-s,tx],[s,c,ty],[0,0,1]]}
function applyT(T,p){return[T[0][0]*p[0]+T[0][1]*p[1]+T[0][2],T[1][0]*p[0]+T[1][1]*p[1]+T[1][2]]}
function mulT(A,B){const C=[[0,0,0],[0,0,0],[0,0,1]];for(let i=0;i<3;i++)for(let j=0;j<3;j++)C[i][j]=A[i].reduce((s,v,k)=>s+v*B[k][j],0);return C}
drone.moveTo(100,300);drone.move(180,0);drone.rotate(-Math.PI/2);drone.move(0,-160);drone.rotate(-Math.PI/2);drone.move(180,0);`,
    mission:{
      startPos:[100,300], startTheta:0,
      goals:[{type:'reach',label:'Reach destination [460, 140]',pos:[460,140],tol:50,hint:'Chain drone.moveTo + move + rotate + move + rotate + move to form the L-shaped path.'}],
      wps:[[460,140]],obs:[],
    },
    errGuide:{},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const c=Math.cos(f.theta), s=Math.sin(f.theta)
      return {type:'matrix',label:'Current Transform T',rows:[
        [`${c.toFixed(3)}`,`${(-s).toFixed(3)}`,`${f.pos[0].toFixed(1)}`],
        [`${s.toFixed(3)}`,`${c.toFixed(3)}`,`${f.pos[1].toFixed(1)}`],
        ['0','0','1'],
      ],note:`Homogeneous 3×3 — encodes rotation + position`}
    },
  },

  {
    id:7,
    unit:'Unit 4 — Projections',
    title:'Orthogonal Projection',
    subtitle:'Decomposing vectors — forward progress vs cross-track drift',
    accent:'#ffe040',
    book:[
      {h:'Projection of a onto b',tex:'proj_b(a) = (a·b / b·b) · b\nscalar comp: comp_b(a) = a·b / ‖b‖',note:'The projection of a onto b is the component of a that lies along b.'},
      {h:'Orthogonal decomposition',tex:'a = proj_b(a) + (a − proj_b(a))\n    ↑ parallel     ↑ perpendicular',note:'Any vector splits into one along b, and one perpendicular to b (they add back to a).'},
      {h:'Drift correction',tex:'drift = error − proj_path(error)',note:'The perpendicular component of your error IS the off-path drift. Subtract it to correct.'},
    ],
    codeRef:[
      {l:'project a onto b',c:'const p = math.project(a, b);\n// = (dot(a,b)/dot(b,b)) * b'},
      {l:'perpendicular component',c:'const parallel = math.project(a, b);\nconst perp = [a[0]-parallel[0], a[1]-parallel[1]];'},
      {l:'drift correction',c:'// parallel = along path (fine)\n// perp = drift (correct this)\nconst corrected = [pos[0]-perp[0], pos[1]-perp[1]];'},
    ],
    realWorld:'GPS drift makes drones wander off straight-line paths. Real flight controllers project the position error onto the intended path vector each cycle, extract the perpendicular (cross-track error), and apply a proportional correction.',
    starter:`// MISSION: Fly a straight line A→B despite wind drift.
// Each step: correct perpendicular drift using projection.

const pathStart = [80, 380];
const pathEnd   = [580, 120];
const pathVec   = [pathEnd[0]-pathStart[0], pathEnd[1]-pathStart[1]];

let currentPos = [...pathStart];
const STEPS = 5;
const stepVec = [pathVec[0]/STEPS, pathVec[1]/STEPS];

for (let i = 0; i < STEPS; i++) {
  const wind = [10*(Math.random()-0.35), -5*(Math.random()-0.35)];
  const blown = [currentPos[0]+stepVec[0]+wind[0], currentPos[1]+stepVec[1]+wind[1]];
  const ideal = [pathStart[0]+((i+1)/STEPS)*pathVec[0], pathStart[1]+((i+1)/STEPS)*pathVec[1]];
  const error = [blown[0]-ideal[0], blown[1]-ideal[1]];

  // TODO: project error onto pathVec to get along-path component
  const parallelError = null; // math.project(error, pathVec)

  // TODO: drift = error - parallelError
  const drift = null; // [error[0]-parallelError[0], error[1]-parallelError[1]]

  const corrected = [blown[0]-(drift?drift[0]:0), blown[1]-(drift?drift[1]:0)];
  drone.moveTo(corrected[0], corrected[1]);
  currentPos = corrected;
}`,
    pyStarter:`# MISSION: Fly A→B correcting wind drift via projection.
import random
path_start = [80, 380]
path_end   = [580, 120]
path_vec   = [path_end[0]-path_start[0], path_end[1]-path_start[1]]
current_pos = path_start[:]
STEPS = 5
step_vec = [path_vec[0]/STEPS, path_vec[1]/STEPS]

for i in range(STEPS):
    wind = [10*(random.random()-0.35), -5*(random.random()-0.35)]
    blown = [current_pos[0]+step_vec[0]+wind[0], current_pos[1]+step_vec[1]+wind[1]]
    ideal = [path_start[0]+((i+1)/STEPS)*path_vec[0], path_start[1]+((i+1)/STEPS)*path_vec[1]]
    error = [blown[0]-ideal[0], blown[1]-ideal[1]]
    parallel = math.project(error, path_vec)
    drift = [error[0]-parallel[0], error[1]-parallel[1]]
    corrected = [blown[0]-drift[0], blown[1]-drift[1]]
    drone.moveTo(corrected[0], corrected[1])
    current_pos = corrected`,
    matStarter:`% MISSION: Fly A→B correcting wind drift via projection.
path_start = [80, 380];
path_end   = [580, 120];
path_vec   = path_end - path_start;
current_pos = path_start;
STEPS = 5;
step_vec = path_vec / STEPS;
for i = 1:STEPS
  wind = [10*(rand-0.35), -5*(rand-0.35)];
  blown = current_pos + step_vec + wind;
  ideal = path_start + (i/STEPS)*path_vec;
  error = blown - ideal;
  p_error = (dot(error,path_vec)/dot(path_vec,path_vec))*path_vec;
  drift = error - p_error;
  corrected = blown - drift;
  drone_move_to(corrected(1), corrected(2));
  current_pos = corrected;
end`,
    solution:`const ps=[80,380],pe=[580,120],pv=[pe[0]-ps[0],pe[1]-ps[1]];
let cp=[...ps]; const S=5,sv=[pv[0]/S,pv[1]/S];
for(let i=0;i<S;i++){
  const w=[10*(Math.random()-0.35),-5*(Math.random()-0.35)];
  const bl=[cp[0]+sv[0]+w[0],cp[1]+sv[1]+w[1]];
  const id=[ps[0]+((i+1)/S)*pv[0],ps[1]+((i+1)/S)*pv[1]];
  const er=[bl[0]-id[0],bl[1]-id[1]];
  const par=math.project(er,pv);
  const dr=[er[0]-par[0],er[1]-par[1]];
  const cor=[bl[0]-dr[0],bl[1]-dr[1]];
  drone.moveTo(cor[0],cor[1]); cp=cor;
}`,
    mission:{
      startPos:[80,380], startTheta:-0.5,
      goals:[{type:'reach',label:'Reach destination [580,120]',pos:[580,120],tol:55,hint:'parallelError=math.project(error,pathVec). drift=error-parallelError. corrected=blown-drift.'}],
      wps:[[580,120]],obs:[],pathLine:{from:[80,380],to:[580,120]},
    },
    errGuide:{'null':'parallelError or drift is null. Use math.project(error, pathVec) for parallel part. drift=[error[0]-parallelError[0], error[1]-parallelError[1]].'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const ps=[80,380],pe=[580,120]
      const pv=[pe[0]-ps[0],pe[1]-ps[1]]
      const err=vsub(f.pos,vadd(ps,vscale(vnorm(pv),vdot(vsub(f.pos,ps),vnorm(pv)))))
      const crossTrack=vmag(err)
      return {type:'vector',lines:[
        {label:'cross-track error',value:`${crossTrack.toFixed(1)} px`,color:crossTrack<20?'#44ff88':'#ffe040'},
        {label:'position',value:`[${f.pos[0].toFixed(0)}, ${f.pos[1].toFixed(0)}]`,color:'#7a9ab8'},
      ]}
    },
  },

  {
    id:8,
    unit:'Unit 4 — Projections',
    title:'Bézier Path Planning',
    subtitle:'Smooth curves via parametric interpolation',
    accent:'#ffe040',
    book:[
      {h:'Quadratic Bézier',tex:'B(t) = (1−t)²P₀ + 2(1−t)tP₁ + t²P₂\nt ∈ [0, 1]',note:'P₀ = start, P₁ = control point, P₂ = end. The curve is pulled toward P₁ without touching it.'},
      {h:'Cubic Bézier',tex:'B(t) = (1-t)³P₀+3(1-t)²tP₁+3(1-t)t²P₂+t³P₃',note:'Two control points give smooth, differentiable paths — used in DJI waypoint missions.'},
      {h:'Parametric arc length',tex:'s ≈ Σ ‖B(tᵢ) − B(tᵢ₋₁)‖\n(numerical integration)',note:'True arc length requires integration. Sample the curve densely and sum segment lengths.'},
    ],
    codeRef:[
      {l:'quadratic Bézier',c:'function bezier2(P0, P1, P2, t) {\n  const u=1-t;\n  return [\n    u*u*P0[0]+2*u*t*P1[0]+t*t*P2[0],\n    u*u*P0[1]+2*u*t*P1[1]+t*t*P2[1],\n  ];\n}'},
      {l:'sample curve',c:'for(let t=0; t<=1; t+=0.05) {\n  const pt = bezier2(P0, P1, P2, t);\n  drone.moveTo(pt[0], pt[1]);\n}'},
    ],
    realWorld:'DJI SDK\'s "curved turns" feature uses cubic Bézier splines between waypoints, letting operators trade off path smoothness vs. positional accuracy through control point offsets.',
    starter:`// MISSION: Fly a smooth curve through the obstacle gap using a quadratic Bézier.

function bezier2(P0, P1, P2, t) {
  const u = 1 - t;
  return [
    u*u*P0[0] + 2*u*t*P1[0] + t*t*P2[0],
    u*u*P0[1] + 2*u*t*P1[1] + t*t*P2[1],
  ];
}

const P0 = [100, 400];  // start
const P2 = [560, 120];  // end (target)

// TODO: choose a control point P1 that pulls the curve through the gap
// The gap is around [200, 200] — try P1 = [100, 80] to curve through
const P1 = [null, null]; // pick your control point!

const STEPS = 30;
for (let i = 1; i <= STEPS; i++) {
  const t  = i / STEPS;
  const pt = bezier2(P0, P1, P2, t);
  drone.moveTo(pt[0], pt[1]);
}`,
    pyStarter:`# MISSION: Fly a smooth Bézier curve through the gap.
def bezier2(P0, P1, P2, t):
    u = 1 - t
    return [
        u*u*P0[0] + 2*u*t*P1[0] + t*t*P2[0],
        u*u*P0[1] + 2*u*t*P1[1] + t*t*P2[1],
    ]

P0 = [100, 400]
P1 = [100, 80]   # control point — pulls curve toward top-left
P2 = [560, 120]

STEPS = 30
for i in range(1, STEPS+1):
    t  = i / STEPS
    pt = bezier2(P0, P1, P2, t)
    drone.moveTo(pt[0], pt[1])`,
    matStarter:`% MISSION: Fly a Bézier curve through the gap.
P0 = [100, 400]; P1 = [100, 80]; P2 = [560, 120];
STEPS = 30;
for i = 1:STEPS
  t = i/STEPS; u = 1-t;
  x = u^2*P0(1) + 2*u*t*P1(1) + t^2*P2(1);
  y = u^2*P0(2) + 2*u*t*P1(2) + t^2*P2(2);
  drone_move_to(x, y);
end`,
    solution:`function bezier2(P0,P1,P2,t){const u=1-t;return[u*u*P0[0]+2*u*t*P1[0]+t*t*P2[0],u*u*P0[1]+2*u*t*P1[1]+t*t*P2[1]]}
const P0=[100,400],P1=[100,80],P2=[560,120],STEPS=30;
for(let i=1;i<=STEPS;i++){const t=i/STEPS;const pt=bezier2(P0,P1,P2,t);drone.moveTo(pt[0],pt[1])}`,
    mission:{
      startPos:[100,400], startTheta:-Math.PI/2,
      goals:[{type:'reach',label:'Reach target [560,120] via smooth curve',pos:[560,120],tol:50,hint:'bezier2(P0,P1,P2,t): u=1-t, x=u²P0x+2utP1x+t²P2x. Choose P1 to route through the gap.'}],
      wps:[[560,120]],
      obs:[{x:240,y:140,w:220,h:18},{x:240,y:300,w:220,h:18}],
    },
    errGuide:{'null':'P1 contains null. Set P1 to a concrete point like [100, 80] to pull the curve up through the gap between the obstacles.'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const progress=frames.length>1?Math.min(ph,frames.length-1)/(frames.length-1):0
      const f=frames[Math.min(ph,frames.length-1)]
      return {type:'vector',lines:[
        {label:'t (progress)',value:`${progress.toFixed(3)}`,color:'#ffe040'},
        {label:'position',value:`[${f.pos[0].toFixed(0)}, ${f.pos[1].toFixed(0)}]`,color:'#7a9ab8'},
      ]}
    },
  },

  {
    id:9,
    unit:'Unit 5 — Control',
    title:'PID Hover Control',
    subtitle:'Proportional–Integral–Derivative altitude control loop',
    accent:'#ff8844',
    book:[
      {h:'PID Controller',tex:'u(t) = Kp·e + Ki·∫e dt + Kd·(de/dt)\ne = setpoint − measured',note:'PID is the most common feedback controller in robotics. Kp reacts to current error, Ki corrects steady-state offset, Kd damps oscillation.'},
      {h:'Discrete PID',tex:'u[n] = Kp·e[n] + Ki·eᵢ + Kd·(e[n]−e[n-1])',note:'eᵢ += e[n] each step (running sum). de ≈ e[n]−e[n-1]. Avoid integral windup.'},
      {h:'Tuning rules of thumb',tex:'Start: Kd=0, Ki=0, increase Kp until oscillation\nThen: Kd≈0.1Kp, Ki≈0.02Kp',note:'Over-tuned Kp causes oscillation. Under-tuned Ki causes drift. Too-high Kd causes noise amplification.'},
    ],
    codeRef:[
      {l:'discrete PID',c:'let eI=0, ePrev=0;\nfunction pidStep(setpoint, measured) {\n  const e = setpoint - measured;\n  eI += e;\n  const u = Kp*e + Ki*eI + Kd*(e-ePrev);\n  ePrev = e;\n  return u;\n}'},
    ],
    realWorld:'Every quadrotor uses 4 PID loops simultaneously: altitude (Z), yaw, roll, and pitch. The cascade architecture runs inner loops at 1000 Hz (attitude) and outer at 50 Hz (position) — mismatched gains cause the famous "toilet bowl" spin.',
    starter:`// MISSION: Hold the drone at target altitude Y=200 for 60 frames.
// Implement a PID controller to correct for gravity drift.

const TARGET_Y = 200;

// PID gains — tune these!
const Kp = 0.5;
const Ki = 0.01;
const Kd = 0.1;

let measured = 380; // drone starts at Y=380, needs to go to Y=200
let eI    = 0;
let ePrev = 0;

// Starting position
drone.moveTo(300, measured);

for (let step = 0; step < 60; step++) {
  // TODO: compute error
  const e = null; // TARGET_Y - measured

  // TODO: integral (accumulate)
  // eI += e;

  // TODO: PID output
  const u = null; // Kp*e + Ki*eI + Kd*(e - ePrev)

  // Move drone
  const newY = measured + (u ? u : 0);
  drone.moveTo(300, newY);
  measured = newY;

  // TODO: update prev error
  // ePrev = e;
}`,
    pyStarter:`# MISSION: PID hover control — hold Y=200 for 60 frames.
TARGET_Y = 200
Kp, Ki, Kd = 0.5, 0.01, 0.1
measured = 380
e_I = 0
e_prev = 0

drone.moveTo(300, measured)
for step in range(60):
    e = TARGET_Y - measured
    e_I += e
    u = Kp*e + Ki*e_I + Kd*(e - e_prev)
    new_y = measured + u
    drone.moveTo(300, new_y)
    measured = new_y
    e_prev = e`,
    matStarter:`% MISSION: PID hover control — hold Y=200 for 60 frames.
TARGET_Y = 200;
Kp=0.5; Ki=0.01; Kd=0.1;
measured = 380;
e_I = 0; e_prev = 0;
drone_move_to(300, measured);
for step = 1:60
  e = TARGET_Y - measured;
  e_I = e_I + e;
  u = Kp*e + Ki*e_I + Kd*(e - e_prev);
  new_y = measured + u;
  drone_move_to(300, new_y);
  measured = new_y;
  e_prev = e;
end`,
    solution:`const TY=200,Kp=0.5,Ki=0.01,Kd=0.1;
let m=380,eI=0,eP=0;
drone.moveTo(300,m);
for(let s=0;s<60;s++){
  const e=TY-m; eI+=e;
  const u=Kp*e+Ki*eI+Kd*(e-eP);
  const ny=m+u; drone.moveTo(300,ny); m=ny; eP=e;
}`,
    mission:{
      startPos:[300,380], startTheta:-Math.PI/2,
      goals:[{type:'reach',label:'Hold Y≈200 (within 30px for 10+ frames)',pos:[300,200],tol:50,hint:'e=TARGET_Y-measured. eI+=e. u=Kp*e+Ki*eI+Kd*(e-ePrev). newY=measured+u.'}],
      wps:[[300,200]],obs:[],pathLine:{from:[300,380],to:[300,200]},
    },
    errGuide:{'null':'e or u is null. e=TARGET_Y-measured. u=Kp*e + Ki*eI + Kd*(e-ePrev).'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const e=200-f.pos[1]
      return {type:'vector',lines:[
        {label:'Y position',value:`${f.pos[1].toFixed(1)}`,color:'#ff8844'},
        {label:'error (e)',value:`${e.toFixed(1)} px`,color:Math.abs(e)<30?'#44ff88':'#ff8844'},
        {label:'setpoint',value:'200',color:'#7a9ab8'},
      ]}
    },
  },

  {
    id:10,
    unit:'Unit 5 — Control',
    title:'Capstone: Autonomous Delivery',
    subtitle:'Combine all skills: plan, navigate, correct, and land',
    accent:'#ff4488',
    book:[
      {h:'Full navigation pipeline',tex:'1. Plan: Bézier path to avoid obstacles\n2. Navigate: rotation matrix heading\n3. Correct: project drift, apply PID\n4. Land: dot product approach check',note:'Real autopilots run these layers simultaneously. The outer loop sets targets; inner loops correct in real time.'},
      {h:'State machine',tex:'STATES: takeoff → cruise → correct → land\nTransitions driven by goal proximity',note:'Most drone firmware is a state machine. Each state has entry/exit conditions and allowed commands.'},
      {h:'Mission success criteria',tex:'✓ Visit checkpoint A (pass through)\n✓ Avoid obstacles\n✓ Land on pad B with approach check',note:'Real missions often have spatial + temporal + alignment constraints simultaneously.'},
    ],
    codeRef:[
      {l:'full pipeline sketch',c:'// 1. Compute path\nconst dir = math.normalize(vsub(target, pos));\n// 2. Correct drift\nconst par = math.project(error, pathVec);\nconst drift = vsub(error, par);\n// 3. Approach check\nconst aligned = math.dot(dir, reqHeading) > 0.9;\n// 4. Rotate + move\ndrone.rotate(angle); drone.move(...);'},
    ],
    realWorld:'A DJI Matrice 300 autonomous package delivery mission runs exactly this pipeline: path plan (RRT*), body-frame nav with rotation matrices, cross-track PID correction, and dot-product landing alignment verification.',
    starter:`// CAPSTONE MISSION
// Drone starts at [80, 400].
// 1. Navigate to Checkpoint A at [300, 160] (approach from below, heading [0,-1])
// 2. Avoid the wall obstacle
// 3. Navigate to Landing Pad B at [520, 360]
// 4. Approach Pad B from the left (heading [1, 0])
//
// Use any combination of drone.move, moveTo, rotate, rotateDeg.
// The math API is fully available.

const checkpointA = [300, 160];
const landingPadB = [520, 360];

// --- Phase 1: Fly to Checkpoint A ---
// Stage below it, then fly up
drone.moveTo(300, 360);
drone.moveTo(checkpointA[0], checkpointA[1]);

// --- Phase 2: Navigate to approach position for Pad B ---
// Stage to the left of Pad B, then fly right
// TODO: complete this
drone.moveTo(/* approach position */ null, null);
drone.moveTo(landingPadB[0], landingPadB[1]);`,
    pyStarter:`# CAPSTONE MISSION
# Drone starts at [80, 400].
# 1. Navigate to Checkpoint A at [300, 160] (approach from below)
# 2. Navigate to Landing Pad B at [520, 360] (approach from left)

checkpoint_a = [300, 160]
landing_pad_b = [520, 360]

# Phase 1: approach Checkpoint A from below
drone.moveTo(300, 360)
drone.moveTo(checkpoint_a[0], checkpoint_a[1])

# Phase 2: approach Pad B from the left
drone.moveTo(280, 360)   # stage to the left
drone.moveTo(landing_pad_b[0], landing_pad_b[1])`,
    matStarter:`% CAPSTONE MISSION
checkpoint_a = [300, 160];
landing_pad_b = [520, 360];
% Phase 1: approach A from below
drone_move_to(300, 360);
drone_move_to(checkpoint_a(1), checkpoint_a(2));
% Phase 2: approach B from left
drone_move_to(280, 360);
drone_move_to(landing_pad_b(1), landing_pad_b(2));`,
    solution:`const ca=[300,160],lpb=[520,360];
drone.moveTo(300,360); drone.moveTo(ca[0],ca[1]);
drone.moveTo(280,360); drone.moveTo(lpb[0],lpb[1]);`,
    mission:{
      startPos:[80,400], startTheta:-Math.PI/2,
      goals:[
        {type:'reach',label:'Reach Checkpoint A [300,160]',pos:[300,160],tol:40,hint:'Stage at [300,360] then moveTo(300,160). Approach from below.'},
        {type:'reach',label:'Land on Pad B [520,360]',pos:[520,360],tol:40,hint:'Stage at [280,360] then moveTo(520,360). Approach from left.'},
      ],
      wps:[[300,160],[520,360]],
      obs:[{x:380,y:80,w:18,h:200}],
    },
    errGuide:{'null':'Replace null with concrete coordinates. For Pad B approach: moveTo(280, 360) stages to the left, then moveTo(520, 360) flies right onto the pad.'},
    mathViz:(frames,ph)=>{
      if(!frames||frames.length===0) return null
      const f=frames[Math.min(ph,frames.length-1)]
      const ca=[300,160],lpb=[520,360]
      const dA=vmag(vsub(f.pos,ca)), dB=vmag(vsub(f.pos,lpb))
      return {type:'vector',lines:[
        {label:'dist to Checkpoint A',value:`${dA.toFixed(0)} px`,color:dA<40?'#44ff88':'#ff4488'},
        {label:'dist to Landing B',value:`${dB.toFixed(0)} px`,color:dB<40?'#44ff88':'#ff4488'},
      ]}
    },
  },
]

// ── Canvas renderer ──────────────────────────────────────────────────
function drawScene(canvas, lesson, frames, playhead) {
  if(!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const m = lesson.mission
  const accent = lesson.accent

  ctx.fillStyle = '#03080f'
  ctx.fillRect(0,0,W,H)
  ctx.strokeStyle = '#0a1525'
  ctx.lineWidth = 1
  for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

  if(m.pathLine){
    const {from,to}=m.pathLine
    ctx.strokeStyle=accent+'28'; ctx.lineWidth=2; ctx.setLineDash([6,6])
    ctx.beginPath(); ctx.moveTo(from[0],from[1]); ctx.lineTo(to[0],to[1]); ctx.stroke()
    ctx.setLineDash([])
    ctx.font='9px monospace'; ctx.fillStyle=accent+'44'
    ctx.fillText('ideal path',from[0]+4,from[1]-6)
  }
  if(m.speedRing){
    const {c,r}=m.speedRing
    ctx.strokeStyle=accent+'33'; ctx.lineWidth=1; ctx.setLineDash([4,4])
    ctx.beginPath(); ctx.arc(c[0],c[1],r,0,Math.PI*2); ctx.stroke()
    ctx.setLineDash([])
    ctx.font='9px monospace'; ctx.fillStyle=accent+'44'
    ctx.fillText('200-unit ring',c[0]+r+4,c[1])
  }

  ;(m.obs||[]).forEach(ob=>{
    ctx.fillStyle='#0d1820'
    ctx.fillRect(ob.x,ob.y,ob.w,ob.h)
    ctx.strokeStyle='#2a4a5a'; ctx.lineWidth=1
    ctx.strokeRect(ob.x,ob.y,ob.w,ob.h)
    ctx.fillStyle='#ff445512'
    for(let i=-ob.h;i<ob.w+ob.h;i+=14){
      ctx.beginPath()
      ctx.moveTo(ob.x+i,ob.y); ctx.lineTo(ob.x+i+10,ob.y)
      ctx.lineTo(ob.x+i+10+ob.h,ob.y+ob.h); ctx.lineTo(ob.x+i+ob.h,ob.y+ob.h)
      ctx.closePath(); ctx.fill()
    }
  })

  ;(m.wps||[]).forEach((wp,i)=>{
    const reached=frames.length>0&&frames.slice(0,playhead+1).some(f=>vmag(vsub(f.pos,wp))<45)
    ctx.strokeStyle=reached?'#44ff8866':accent; ctx.lineWidth=1.5
    ctx.fillStyle=reached?'#44ff8522':accent+'33'
    ctx.beginPath(); ctx.arc(wp[0],wp[1],22,0,Math.PI*2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.arc(wp[0],wp[1],8,0,Math.PI*2); ctx.stroke()
    ctx.font='bold 10px monospace'; ctx.fillStyle=reached?'#44ff88':accent
    ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText(reached?'✓':`WP${i+1}`,wp[0],wp[1])
    ctx.textAlign='left'; ctx.textBaseline='alphabetic'
  })

  if(frames.length>1){
    const trail=frames.slice(0,playhead+1)
    ctx.strokeStyle=accent+'55'; ctx.lineWidth=1.5
    ctx.beginPath()
    trail.forEach((f,i)=>i===0?ctx.moveTo(f.pos[0],f.pos[1]):ctx.lineTo(f.pos[0],f.pos[1]))
    ctx.stroke()
  }

  const frame=frames[Math.min(playhead,frames.length-1)]||{pos:m.startPos,theta:m.startTheta||0}
  const [px,py]=frame.pos
  const th=frame.theta

  if(playhead>3&&playhead<frames.length){
    const pf=frames[Math.max(0,playhead-3)]
    const vel=vsub(frame.pos,pf.pos)
    if(vmag(vel)>0.5){
      ctx.strokeStyle='#cc44ff'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+vel[0]*4,py+vel[1]*4); ctx.stroke()
      ctx.font='8px monospace'; ctx.fillStyle='#cc44ff'
      ctx.fillText('v',px+vel[0]*4+3,py+vel[1]*4)
    }
  }

  ctx.save()
  ctx.translate(px,py)
  ctx.rotate(th+Math.PI/2)
  ;[[-10,-10],[10,-10],[-10,10],[10,10]].forEach(([rx,ry])=>{
    const g=ctx.createRadialGradient(rx,ry,0,rx,ry,9)
    g.addColorStop(0,accent+'44'); g.addColorStop(1,'transparent')
    ctx.fillStyle=g
    ctx.beginPath(); ctx.arc(rx,ry,9,0,Math.PI*2); ctx.fill()
  })
  ctx.strokeStyle='#1a4050'; ctx.lineWidth=2
  ;[[-10,-10],[10,-10],[-10,10],[10,10]].forEach(([rx,ry])=>{
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(rx,ry); ctx.stroke()
    ctx.strokeStyle='#1a5060'; ctx.lineWidth=1
    ctx.beginPath(); ctx.arc(rx,ry,6,0,Math.PI*2); ctx.stroke()
    ctx.strokeStyle='#1a4050'; ctx.lineWidth=2
  })
  ctx.fillStyle='#152535'; ctx.strokeStyle=accent; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(8,6); ctx.lineTo(0,2); ctx.lineTo(-8,6)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle='#ffe040'
  ctx.beginPath(); ctx.arc(0,-10,3,0,Math.PI*2); ctx.fill()
  ctx.restore()

  ctx.strokeStyle='#4dd0ff44'; ctx.lineWidth=1
  ctx.beginPath(); ctx.arc(m.startPos[0],m.startPos[1],5,0,Math.PI*2); ctx.stroke()
  ctx.font='9px monospace'; ctx.fillStyle='#4dd0ff44'
  ctx.fillText('START',m.startPos[0]+8,m.startPos[1]+4)
}

// ── Main Component ───────────────────────────────────────────────────
export default function DroneLab({ onBack }) {
  const [lessonIdx, setLessonIdx] = useState(0)
  const [lang, setLang] = useState('js')
  const [rightTab, setRightTab] = useState('editor')
  const [code, setCode] = useState(LESSONS[0].starter)
  const [frames, setFrames] = useState([])
  const [playhead, setPlayhead] = useState(0)
  const [results, setResults] = useState([])
  const [syntaxErr, setSyntaxErr] = useState(null)
  const [runtimeErr, setRuntimeErr] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [consoleLines, setConsoleLines] = useState([])

  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  const lesson = LESSONS[lessonIdx]

  // Redraw canvas whenever frames/playhead/lesson change
  useEffect(()=>{
    drawScene(canvasRef.current, lesson, frames, playhead)
  },[lesson,frames,playhead])

  // Init code when lesson or lang changes
  useEffect(()=>{
    setShowSolution(false)
    setResults([]); setSyntaxErr(null); setRuntimeErr(null); setFrames([]); setPlayhead(0)
    cancelAnimationFrame(rafRef.current)
    setIsRunning(false); setConsoleLines([])
    const c = lang==='python' ? lesson.pyStarter : lang==='matlab' ? lesson.matStarter : lesson.starter
    setCode(c)
  },[lessonIdx, lang])

  const switchLesson = useCallback((idx)=>{
    cancelAnimationFrame(rafRef.current)
    setLessonIdx(idx)
  },[])

  function animateFrames(frs) {
    let ph = 0
    cancelAnimationFrame(rafRef.current)
    setIsRunning(true)
    const tick = () => {
      ph++
      setPlayhead(ph)
      if(ph < frs.length-1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setIsRunning(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  async function runCode() {
    cancelAnimationFrame(rafRef.current)
    setSyntaxErr(null); setRuntimeErr(null); setResults([]); setFrames([]); setPlayhead(0)
    setIsRunning(false)

    let steps = []
    let syntaxError = null
    let output = []

    if(lang === 'js') {
      const r = buildFlight(code)
      steps = r.steps; syntaxError = r.syntaxError
    } else if(lang === 'python') {
      const r = await runPythonDrone(code)
      steps = r.steps; syntaxError = r.error; output = r.output
    } else {
      const r = runMatlabDrone(code)
      steps = r.steps; syntaxError = r.error; output = r.output
    }

    if(output.length) setConsoleLines(output)

    if(syntaxError) {
      setSyntaxErr(syntaxError); return
    }
    if(steps.length===0) {
      setRuntimeErr('No drone commands generated. Check for null values and make sure drone.move() or drone.moveTo() is called.')
      return
    }

    const frs = simulate(steps, lesson.mission.startPos, lesson.mission.startTheta||0)
    const res = validate(frs, lesson.mission.goals)
    const allPass = res.every(r=>r.pass)

    if(!allPass) {
      const fail = res.find(r=>!r.pass)
      let msg = fail?.hint || 'Check your code.'
      const eg = lesson.errGuide
      if(eg) {
        for(const [k,v] of Object.entries(eg)) {
          if(code.includes('null')||code.toLowerCase().includes(k.toLowerCase())) { msg=v; break }
        }
      }
      setRuntimeErr(msg)
    }

    setResults(res)
    setFrames(frs)
    animateFrames(frs)
  }

  const mathVizData = lesson.mathViz ? lesson.mathViz(frames, playhead) : null
  const allPass = results.length>0 && results.every(r=>r.pass)

  const langColors = {js:'#f7df1e', python:'#7dd3fc', matlab:'#818cf8'}
  const currentCode = code

  return (
    <div style={{
      height:'100vh', background:'rgba(3,8,15,0.96)',
      fontFamily:"'JetBrains Mono',Consolas,monospace",
      color:'#c8e8ff', display:'flex', flexDirection:'column',
      overflow:'hidden', position:'relative',
    }}>

      {/* ── Header ── */}
      <div style={{
        background:'#07101e', borderBottom:'1px solid #1a2e4a',
        padding:'10px 20px', display:'flex', alignItems:'center', gap:14, flexShrink:0,
      }}>
        <button onClick={onBack} style={{
          background:'none', border:'none', color:'#3a6080',
          cursor:'pointer', fontSize:11, letterSpacing:'2px', fontFamily:'inherit', padding:0,
        }}>← LABS</button>
        <div style={{width:1, height:22, background:'#1a2e4a'}}/>
        <div style={{
          width:36, height:36, borderRadius:8, background:lesson.accent+'33',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0,
        }}>🚁</div>
        <div>
          <div style={{fontSize:15, fontWeight:700, color:'#e8f4ff', letterSpacing:0.3}}>Drone Lab</div>
          <div style={{fontSize:9, color:'#3a5870', letterSpacing:1.2}}>
            VECTORS · DOT PRODUCT · ROTATION MATRICES · PID CONTROL
          </div>
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap:4, flexWrap:'wrap', alignItems:'center'}}>
          {LESSONS.map((l,i)=>(
            <button key={l.id} onClick={()=>switchLesson(i)}
              title={`M${l.id}: ${l.title}`}
              style={{
                background:i===lessonIdx?l.accent+'22':'transparent',
                border:`1px solid ${i===lessonIdx?l.accent:'#1a2e4a'}`,
                borderRadius:4, padding:'2px 8px', fontSize:9, fontFamily:'inherit',
                color:i===lessonIdx?l.accent:'#3a6080',
                cursor:'pointer', transition:'all .15s', minWidth:0,
              }}>
              M{l.id}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mission banner ── */}
      <div style={{
        background:'#07101e', borderBottom:`2px solid ${lesson.accent}33`,
        padding:'8px 20px', display:'flex', alignItems:'center', gap:16, flexShrink:0,
      }}>
        <span style={{
          fontSize:9, fontWeight:700, letterSpacing:1.2,
          background:lesson.accent+'22', color:lesson.accent,
          border:`1px solid ${lesson.accent}44`, borderRadius:3, padding:'2px 8px', flexShrink:0,
        }}>{lesson.unit.toUpperCase()}</span>
        <span style={{fontSize:13, fontWeight:700, color:'#e8f4ff'}}>{lesson.title}</span>
        <span style={{fontSize:11, color:'#3a6080'}}>{lesson.subtitle}</span>
        {allPass&&(
          <span style={{
            fontSize:11, color:'#44ff88', background:'rgba(68,255,136,0.1)',
            border:'1px solid #44ff8844', borderRadius:4, padding:'2px 9px', marginLeft:'auto',
          }}>✓ Mission complete!</span>
        )}
      </div>

      {/* ── Main body: canvas + editor ── */}
      <div style={{display:'flex',flex:1,minHeight:0,overflow:'hidden'}}>

        {/* Canvas panel */}
        <div style={{flex:'0 0 55%',display:'flex',flexDirection:'column',borderRight:'1px solid #1a3040'}}>
          <div style={{
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'4px 12px',background:'#050d18',borderBottom:'1px solid #1a3040',flexShrink:0,
          }}>
            <div style={{fontSize:8,letterSpacing:3,color:'#2a5570'}}>FLIGHT SIMULATION</div>
            <div style={{fontSize:9,color:'#2a5070',fontFamily:'monospace'}}>
              {frames.length>0?`FRAME ${Math.min(playhead,frames.length-1)}/${frames.length-1}`:'AWAITING FLIGHT PROGRAM'}
            </div>
          </div>
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'#03080f',overflow:'hidden'}}>
            <canvas ref={canvasRef} width={640} height={420} style={{display:'block',maxWidth:'100%',maxHeight:'100%'}}/>
          </div>
          <div style={{
            padding:'4px 12px',borderTop:'1px solid #1a3040',background:'#050d18',
            display:'flex',gap:16,fontSize:8,color:'#1a4050',flexShrink:0,
          }}>
            <span style={{color:lesson.accent+'66'}}>● trail</span>
            <span style={{color:'#4dd0ff66'}}>◎ waypoints</span>
            <span style={{color:'#cc44ff66'}}>→ velocity</span>
            <span style={{color:'#ffe04044'}}>— ideal path</span>
            <div style={{flex:1}}/>
            <span>mission {lesson.id}/10</span>
          </div>

          {/* Math viz */}
          {mathVizData && (
            <div style={{
              padding:'8px 12px',borderTop:`1px solid ${lesson.accent}22`,
              background:'#04080f',flexShrink:0,
            }}>
              <div style={{fontSize:8,letterSpacing:2,color:lesson.accent,marginBottom:6}}>
                {mathVizData.label||'LIVE MATH'}
              </div>
              {mathVizData.type==='vector'&&mathVizData.lines.map((ln,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:3,fontSize:11,fontFamily:'monospace'}}>
                  <span style={{color:'#2a4870',minWidth:140}}>{ln.label}</span>
                  <span style={{color:ln.color}}>{ln.value}</span>
                </div>
              ))}
              {mathVizData.type==='matrix'&&(
                <>
                  <div style={{fontSize:10,color:'#7a9ab8',marginBottom:4}}>{mathVizData.note}</div>
                  <div style={{fontFamily:'monospace',fontSize:11,color:'#c8e8ff',lineHeight:2}}>
                    {mathVizData.rows.map((row,i)=>(
                      <div key={i} style={{display:'flex',gap:0}}>
                        <span style={{color:'#4a6880',marginRight:4}}>⎢</span>
                        {row.map((cell,j)=>(
                          <span key={j} style={{minWidth:90,color:lesson.accent,textAlign:'right',paddingRight:12}}>{cell}</span>
                        ))}
                        <span style={{color:'#4a6880'}}>⎥</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}}>

          {/* Tab bar */}
          <div style={{
            display:'flex',alignItems:'center',gap:0,
            background:'#050d18',borderBottom:'1px solid #1a3040',flexShrink:0,
          }}>
            {[['editor','FLIGHT PROGRAM'],['theory','THEORY'],['console','CONSOLE']].map(([tab,label])=>(
              <button key={tab} onClick={()=>setRightTab(tab)} style={{
                background:rightTab===tab?'#0a1622':'transparent',
                border:'none',borderBottom:rightTab===tab?`2px solid ${lesson.accent}`:'2px solid transparent',
                color:rightTab===tab?lesson.accent:'#2a5070',
                padding:'8px 14px',fontSize:9,fontFamily:'inherit',cursor:'pointer',letterSpacing:2,
              }}>{label}</button>
            ))}
            <div style={{flex:1}}/>
            {/* Language selector */}
            <div style={{display:'flex',gap:4,paddingRight:10}}>
              {['js','python','matlab'].map(l=>(
                <button key={l} onClick={()=>setLang(l)} style={{
                  background:lang===l?langColors[l]+'22':'transparent',
                  border:`1px solid ${lang===l?langColors[l]+'88':'#1a3040'}`,
                  color:lang===l?langColors[l]:'#2a5070',
                  padding:'3px 8px',fontSize:9,borderRadius:3,fontFamily:'inherit',cursor:'pointer',
                  transition:'all 0.15s',
                }}>{l==='js'?'JS':l==='python'?'Python':'MATLAB'}</button>
              ))}
            </div>
          </div>

          {/* Editor tab */}
          {rightTab==='editor'&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
              <div style={{
                display:'flex',alignItems:'center',gap:8,padding:'6px 12px',
                background:'#0a1622',borderBottom:'1px solid #1a3040',flexShrink:0,
              }}>
                <div style={{fontSize:8,letterSpacing:2,color:'#2a5570',flex:1}}>
                  {lang==='js'?'drone.move(dx,dy) · drone.moveTo(x,y) · math.dot/normalize/matMul/project'
                   :lang==='python'?'drone.move(dx,dy) · drone.moveTo(x,y) · math.dot/normalize/mat_mul/project'
                   :'drone_move(dx,dy) · drone_move_to(x,y) · dot/norm/atan2'}
                </div>
                <button onClick={()=>{
                  setShowSolution(false)
                  const c=lang==='python'?lesson.pyStarter:lang==='matlab'?lesson.matStarter:lesson.starter
                  setCode(c)
                  setResults([]); setSyntaxErr(null); setRuntimeErr(null)
                }} style={{
                  background:'transparent',border:'1px solid #1a3040',color:'#3a6070',
                  padding:'2px 8px',fontSize:9,cursor:'pointer',fontFamily:'inherit',borderRadius:3,
                }}>↺ Reset</button>
                <button onClick={()=>{
                  const next=!showSolution
                  setShowSolution(next)
                  if(next) setCode(lang==='js'?lesson.solution:lang==='python'?lesson.pyStarter:lesson.matStarter)
                  else {
                    const c=lang==='python'?lesson.pyStarter:lang==='matlab'?lesson.matStarter:lesson.starter
                    setCode(c)
                  }
                }} style={{
                  background:showSolution?'#0a2a10':'transparent',
                  border:`1px solid ${showSolution?'#44ff88':'#1a3040'}`,
                  color:showSolution?'#44ff88':'#3a6070',
                  padding:'2px 8px',fontSize:9,cursor:'pointer',fontFamily:'inherit',borderRadius:3,
                }}>Solution</button>
                <button onClick={runCode} disabled={isRunning} style={{
                  background:allPass?'#0a2a10':isRunning?'#0a1020':'#0a1628',
                  border:`1px solid ${allPass?'#44ff88':lesson.accent}`,
                  color:allPass?'#44ff88':lesson.accent,
                  padding:'4px 18px',fontSize:11,cursor:isRunning?'wait':'pointer',
                  letterSpacing:2,fontFamily:'inherit',borderRadius:3,
                  opacity:isRunning?0.7:1,
                }}>
                  {isRunning?'▶ FLYING…':allPass?'✓ COMPLETE':'▶ RUN'}
                </button>
              </div>

              <textarea
                value={currentCode}
                onChange={e=>setCode(e.target.value)}
                readOnly={showSolution}
                spellCheck={false}
                onKeyDown={e=>{
                  if(e.key==='Tab'){
                    e.preventDefault()
                    const s=e.target.selectionStart, end=e.target.selectionEnd
                    const v=e.target.value
                    setCode(v.substring(0,s)+'  '+v.substring(end))
                    setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+2},0)
                  }
                }}
                style={{
                  flex:1,background:'#060e1a',color:'#c8e8ff',
                  border:'none',borderBottom:'1px solid #1a3040',
                  padding:'14px 16px',fontFamily:'inherit',fontSize:12,lineHeight:1.8,
                  resize:'none',outline:'none',tabSize:2,minHeight:0,
                  opacity:showSolution?0.75:1,
                }}
              />

              {/* Results panel */}
              {(syntaxErr||runtimeErr||results.length>0)&&(
                <div style={{
                  borderTop:'1px solid #1a3040',background:'#04080f',
                  padding:'10px 14px',overflowY:'auto',maxHeight:180,flexShrink:0,
                }}>
                  {syntaxErr&&(
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:8,color:'#ff4455',letterSpacing:2,marginBottom:4}}>SYNTAX ERROR</div>
                      <div style={{fontFamily:'monospace',fontSize:11,color:'#ff6670',padding:'4px 8px',background:'#1a0508',border:'1px solid #ff445533'}}>{syntaxErr}</div>
                    </div>
                  )}
                  {runtimeErr&&(
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:8,color:'#ff8844',letterSpacing:2,marginBottom:4}}>WHAT WENT WRONG</div>
                      <div style={{fontFamily:'monospace',fontSize:11,color:'#ff9955',padding:'4px 8px',background:'#1a0a04',border:'1px solid #ff884433',lineHeight:1.6}}>{runtimeErr}</div>
                    </div>
                  )}
                  {results.length>0&&(
                    <>
                      <div style={{fontSize:8,color:'#2a5570',letterSpacing:2,marginBottom:6}}>MISSION OBJECTIVES</div>
                      {results.map((r,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:6}}>
                          <span style={{color:r.pass?'#44ff88':'#ff4455',fontSize:12,flexShrink:0}}>{r.pass?'✓':'✗'}</span>
                          <div>
                            <div style={{fontSize:11,color:r.pass?'#44ff88':'#ff6670',fontFamily:'monospace'}}>{r.label}</div>
                            {!r.pass&&r.hint&&<div style={{fontSize:10,color:'#4a7060',marginTop:2,lineHeight:1.5}}>Hint: {r.hint}</div>}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Theory tab */}
          {rightTab==='theory'&&(
            <div style={{flex:1,overflowY:'auto',padding:'16px 18px'}}>
              <div style={{fontSize:14,color:lesson.accent,fontWeight:700,marginBottom:4}}>{lesson.title}</div>
              <div style={{fontSize:11,color:'#4a7090',marginBottom:16}}>{lesson.subtitle}</div>
              {lesson.book.map((b,i)=>(
                <div key={i} style={{marginBottom:18}}>
                  <div style={{fontSize:10,color:lesson.accent,letterSpacing:1,marginBottom:4,fontWeight:700}}>▸ {b.h}</div>
                  <pre style={{
                    margin:0,padding:'8px 12px',background:'#050d16',borderLeft:`2px solid ${lesson.accent}66`,
                    fontSize:12,color:'#c8e8ff',lineHeight:1.9,whiteSpace:'pre',fontFamily:'inherit',
                    overflowX:'auto',marginBottom:6,
                  }}>{b.tex}</pre>
                  {b.note&&<div style={{fontSize:11,color:'#4a7090',lineHeight:1.6,paddingLeft:4}}>{b.note}</div>}
                </div>
              ))}
              <div style={{marginTop:16,padding:'10px 12px',background:'#050d16',borderLeft:`2px solid ${lesson.accent}33`}}>
                <div style={{fontSize:8,color:lesson.accent,letterSpacing:2,marginBottom:4}}>⬡ REAL DRONE APPLICATION</div>
                <div style={{fontSize:11,color:'#4a8090',lineHeight:1.7}}>{lesson.realWorld}</div>
              </div>
              {lesson.codeRef&&(
                <div style={{marginTop:16}}>
                  <div style={{fontSize:8,letterSpacing:2,color:'#44ff88',marginBottom:8}}>CODE REFERENCE</div>
                  {lesson.codeRef.map((c,i)=>(
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:'#44ff88aa',marginBottom:3}}>▸ {c.l}</div>
                      <pre style={{
                        margin:0,padding:'6px 10px',background:'#050d16',border:'1px solid #0d2a1a',
                        fontSize:11,color:'#c8e8ff',lineHeight:1.7,fontFamily:'inherit',
                        whiteSpace:'pre',overflowX:'auto',
                      }}>{c.c}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Console tab */}
          {rightTab==='console'&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
              <div style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'6px 12px',background:'#0a1622',borderBottom:'1px solid #1a3040',flexShrink:0,
              }}>
                <span style={{fontSize:8,color:'#2a4870',letterSpacing:2}}>OUTPUT / CONSOLE</span>
                <button onClick={()=>setConsoleLines([])} style={{
                  background:'transparent',border:'1px solid #1a3040',color:'#3a6070',
                  padding:'2px 8px',fontSize:9,cursor:'pointer',fontFamily:'inherit',borderRadius:3,
                }}>Clear</button>
              </div>
              <pre style={{
                flex:1,margin:0,padding:'12px 16px',background:'#050c18',
                color:'#7dd3fc',fontFamily:'inherit',fontSize:11,lineHeight:1.8,
                overflowY:'auto',whiteSpace:'pre-wrap',minHeight:0,
              }}>
                {consoleLines.length===0
                  ? <span style={{color:'#1a3050'}}>{'// Output from print() / console.log() will appear here after ▶ RUN'}</span>
                  : consoleLines.join('\n')}
              </pre>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
