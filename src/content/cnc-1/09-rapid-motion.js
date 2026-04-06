export default {
  id: 'cnc-rapid-motion',
  slug: 'rapid-motion',
  chapter: 'cnc-1',
  order: 9,
  title: 'Rapid Motion',
  subtitle: 'G00 — Moving at Maximum Speed (and Why That\'s Dangerous)',
  tags: ['G00', 'rapid', 'dog-leg', 'positioning', 'air moves', 'clearance plane'],

  semantics: {
    core: [
      { symbol: 'G00', meaning: 'Rapid Positioning: Move to the commanded coordinates at the machine\'s maximum speed. No feedrate control. Path is NOT guaranteed to be straight.' },
      { symbol: 'Rapid Override', meaning: 'An operator control (usually 25%, 50%, 100%) that scales rapid speed down for setup and proving. Does NOT affect G01 feedrate.' },
      { symbol: 'Dog-Leg Path', meaning: 'The non-straight path that G00 often takes. Each axis moves independently at its own max speed. The path depends on which axis finishes first.' },
      { symbol: 'Clearance Plane', meaning: 'A safe Z height (above all clamps and the part) where rapid XY moves can be made safely. Typically Z+5 to Z+50 depending on setup.' },
      { symbol: 'Air Move', meaning: 'Any rapid motion with the tool clear of the material. G00 is only safe for air moves.' },
    ],
    rulesOfThumb: [
      'G00 is NEVER used while the tool is in contact with material. Not ever.',
      'Always establish a clearance plane in Z before any XY rapid move.',
      'Rapid speed is set by machine parameters — it is not in your G-code. You have no control over it except the rapid override switch.',
      'On most VMCs, X and Y rapid together at the same speed. Z is often slower. Know your machine.',
    ]
  },

  hook: {
    question: 'G00 moves as fast as possible — but does it move in a straight line?',
    realWorldContext:
      'Imagine two sprinters in separate lanes. One needs to run 100 meters, the other 10 meters. If they start at the same time and run at their personal max speed, the short-distance runner arrives first — ' +
      'and the path between them is not diagonal. It goes sideways first. This is exactly what happens with G00 on a CNC machine. ' +
      'Each axis accelerates to its maximum rapid speed independently. ' +
      'If X needs to travel 100mm and Y only 10mm, Y finishes first and the path looks like an L-shape (a "dog-leg"), not a straight line. ' +
      'This means a G00 move can go through unexpected intermediate positions — if any clamp or fixture is in that dog-leg path, it will be hit.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'G00 Dog-Leg Path Visualizer',
            cells: [
              {
                type: 'js',
                title: 'G00 vs G01 — Path Comparison',
                html: `<canvas id="c" width="660" height="360" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>
<div id="controls" style="display:flex;gap:12px;justify-content:center;margin-top:10px">
  <button id="btnG00" style="padding:8px 18px;border-radius:6px;border:none;background:#fbbf24;color:#0f172a;font-family:monospace;font-size:13px;cursor:pointer;font-weight:bold">Run G00 (Rapid)</button>
  <button id="btnG01" style="padding:8px 18px;border-radius:6px;border:none;background:#38bdf8;color:#0f172a;font-family:monospace;font-size:13px;cursor:pointer;font-weight:bold">Run G01 (Linear)</button>
  <button id="btnReset" style="padding:8px 18px;border-radius:6px;border:none;background:#334155;color:#e2e8f0;font-family:monospace;font-size:13px;cursor:pointer">Reset</button>
</div>`,
                css: `body{margin:0;background:#0f172a;display:flex;flex-direction:column;align-items:center;padding:12px;font-family:monospace}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');
const pad = 50;
const gridW = W - pad*2, gridH = H - pad*2;

// World coords: X 0..150, Y 0..80
const worldW = 150, worldH = 80;
const sx = (x) => pad + (x/worldW)*gridW;
const sy = (y) => H - pad - (y/worldH)*gridH;

const start = {x:20, y:15};
const end = {x:140, y:65};

// Obstacle (clamp in the path)
const clamp = {x:105, y:30, w:20, h:25};

let state = 'idle'; // idle | g00 | g01 | done
let t = 0, animId;
let g00trail = [], g01trail = [];

// Rapid speeds: X=100 units/s, Y=40 units/s (asymmetric)
const rapidX = 120, rapidY = 50, feedSpeed = 30;

// G00: each axis moves at its own speed independently
function g00pos(t) {
  const dx = end.x - start.x, dy = end.y - start.y;
  const tX = Math.abs(dx)/rapidX, tY = Math.abs(dy)/rapidY;
  const x = t >= tX ? end.x : start.x + (dx/tX)*t;
  const y = t >= tY ? end.y : start.y + (dy/tY)*t;
  return {x: Math.min(Math.max(x, Math.min(start.x,end.x)), Math.max(start.x,end.x)),
          y: Math.min(Math.max(y, Math.min(start.y,end.y)), Math.max(start.y,end.y))};
}

// G01: parametric straight line at constant speed
const g01total = Math.hypot(end.x-start.x, end.y-start.y);
function g01pos(t) {
  const frac = Math.min(1, (t*feedSpeed)/g01total);
  return {x: start.x + (end.x-start.x)*frac, y: start.y + (end.y-start.y)*frac};
}

function hitTest(p) {
  return p.x > clamp.x && p.x < clamp.x+clamp.w && p.y > clamp.y && p.y < clamp.y+clamp.h;
}

function draw(toolPos, trail, color, mode) {
  ctx.clearRect(0,0,W,H);
  // Grid
  ctx.strokeStyle='#1e293b'; ctx.lineWidth=1;
  for(let x=0;x<=worldW;x+=20){ctx.beginPath();ctx.moveTo(sx(x),pad);ctx.lineTo(sx(x),H-pad);ctx.stroke();}
  for(let y=0;y<=worldH;y+=20){ctx.beginPath();ctx.moveTo(pad,sy(y));ctx.lineTo(W-pad,sy(y));ctx.stroke();}

  // Axis labels
  ctx.fillStyle='#475569'; ctx.font='11px monospace'; ctx.textAlign='center';
  for(let x=0;x<=worldW;x+=20) ctx.fillText(x, sx(x), H-10);
  for(let y=0;y<=worldH;y+=20) { ctx.textAlign='right'; ctx.fillText(y, pad-5, sy(y)+4); }
  ctx.textAlign='left';
  ctx.fillStyle='#94a3b8';
  ctx.fillText('X', W-30, H-pad+4);
  ctx.save(); ctx.translate(12, pad+30); ctx.rotate(-Math.PI/2); ctx.fillText('Y',0,0); ctx.restore();

  // Clamp (obstacle)
  ctx.fillStyle='rgba(239,68,68,0.25)'; ctx.strokeStyle='#ef4444'; ctx.lineWidth=2;
  ctx.fillRect(sx(clamp.x), sy(clamp.y+clamp.h), (clamp.w/worldW)*gridW, (clamp.h/worldH)*gridH);
  ctx.strokeRect(sx(clamp.x), sy(clamp.y+clamp.h), (clamp.w/worldW)*gridW, (clamp.h/worldH)*gridH);
  ctx.fillStyle='#ef4444'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('CLAMP', sx(clamp.x+clamp.w/2), sy(clamp.y+clamp.h/2)+4);

  // Trail
  if(trail.length > 1) {
    ctx.strokeStyle = color; ctx.lineWidth=2.5;
    ctx.setLineDash(mode==='g00'?[7,4]:[]);
    ctx.beginPath(); ctx.moveTo(sx(trail[0].x), sy(trail[0].y));
    for(let i=1;i<trail.length;i++) ctx.lineTo(sx(trail[i].x), sy(trail[i].y));
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Straight-line reference (G00 mode only)
  if(mode==='g00') {
    ctx.strokeStyle='rgba(56,189,248,0.3)'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(sx(start.x),sy(start.y)); ctx.lineTo(sx(end.x),sy(end.y)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(56,189,248,0.5)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText('Direct line (G01 would take)', sx((start.x+end.x)/2), sy((start.y+end.y)/2)-8);
  }

  // Start / End markers
  ctx.fillStyle='#34d399'; ctx.beginPath(); ctx.arc(sx(start.x),sy(start.y),8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0f172a'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('S', sx(start.x), sy(start.y));
  ctx.fillStyle='#a78bfa'; ctx.beginPath(); ctx.arc(sx(end.x),sy(end.y),8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0f172a'; ctx.fillText('E', sx(end.x), sy(end.y));
  ctx.textBaseline='alphabetic';

  // Tool
  if(toolPos) {
    const hit = hitTest(toolPos);
    ctx.fillStyle = hit ? '#ef4444' : color;
    ctx.strokeStyle='#fff'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(sx(toolPos.x), sy(toolPos.y), 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#0f172a'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('T', sx(toolPos.x), sy(toolPos.y));
    ctx.textBaseline='alphabetic';
    if(hit) {
      ctx.fillStyle='#ef4444'; ctx.font='bold 13px monospace'; ctx.textAlign='center';
      ctx.fillText('💥 CRASH — Dog-leg hit the clamp!', W/2, 30);
    }
  }

  // Legend
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.fillStyle='#94a3b8'; ctx.font='12px monospace';
  ctx.fillText(mode==='g00' ? 'G00 Rapid — dog-leg path (dashed)' : 'G01 Linear — straight path', pad, H-pad-8);
}

draw(start, [], '#fbbf24', 'idle');

document.getElementById('btnG00').addEventListener('click', () => {
  if(state==='idle'||state==='done'){state='g00';t=0;g00trail=[];cancelAnimationFrame(animId);
    function step(){t+=0.025;const p=g00pos(t);g00trail.push({...p});draw(p,g00trail,'#fbbf24','g00');
      const tX=Math.abs(end.x-start.x)/rapidX,tY=Math.abs(end.y-start.y)/rapidY;
      if(t<Math.max(tX,tY))animId=requestAnimationFrame(step);else{state='done';draw(end,g00trail,'#fbbf24','g00');}}
    step();}});

document.getElementById('btnG01').addEventListener('click', () => {
  if(state==='idle'||state==='done'){state='g01';t=0;g01trail=[];cancelAnimationFrame(animId);
    function step(){t+=0.04;const p=g01pos(t);g01trail.push({...p});draw(p,g01trail,'#38bdf8','g01');
      if(g01total>0&&(t*feedSpeed)<g01total)animId=requestAnimationFrame(step);else{state='done';draw(end,g01trail,'#38bdf8','g01');}}
    step();}});

document.getElementById('btnReset').addEventListener('click', ()=>{
  cancelAnimationFrame(animId);state='idle';g00trail=[];g01trail=[];draw(start,[],'#fbbf24','idle');});
`
              }
            ]
          }
        },
        title: 'Dog-Leg Path Visualizer',
        caption: 'Click "Run G00" to see the rapid path. The X axis is faster than Y, so Y finishes first creating an L-shaped "dog-leg" path. Notice it crashes through the clamp! Then click "Run G01" — the linear path goes safely straight through. The dashed line shows where G01 would have gone.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(G00 RAPID MOTION EXAMPLES)\n' +
            '(Safe use of G00 — only in air, never cutting)\n' +
            '\n' +
            'G21 G90\n' +
            '\n' +
            '(Step 1: Move to clearance height first)\n' +
            'G00 Z5.0               (Retract to 5mm clearance plane)\n' +
            '\n' +
            '(Step 2: Rapid XY to start of cut - safe because Z is clear)\n' +
            'G00 X50.0 Y30.0        (Rapid position - dog-leg OK at Z5.0)\n' +
            '\n' +
            '(Step 3: Plunge to depth SLOWLY with G01)\n' +
            'G01 Z-3.0 F50          (Controlled plunge - NOT G00!)\n' +
            '\n' +
            '(Cutting moves)\n' +
            'G01 X80.0 F150\n' +
            'G01 Y50.0\n' +
            '\n' +
            '(End: retract to clearance, then rapid away)\n' +
            'G00 Z5.0               (Retract to clearance first)\n' +
            'G00 X0 Y0              (Now safe to rapid home)'
        },
        title: 'Safe G00 Usage Pattern',
        caption: 'This shows the correct pattern: G00 only at clearance height, G01 for plunging. Run it and trace which moves are rapid vs feed.',
      }
    ],
    prose: [
      '**The Dog-Leg Problem**: G00 tells the controller "get to those coordinates as fast as possible." Each axis motor drives independently at its own maximum speed. If X needs to travel 120mm and Y only 30mm, Y finishes first. While X is still moving, Y is stopped at its destination. The resulting path is an L-shape, not a straight line. The exact shape depends on each axis\'s individual rapid speed and the distances involved.',

      '**When Dog-Legs Kill Tools**: If you have a fixture, a clamp, a vise jaw, or raised features on your part anywhere near the dog-leg path, the tool will hit it. This is NOT a CAM problem — CAM does not visualize G00 paths realistically. It is a programming discipline problem. The rule is absolute: NEVER use G00 while the tool is near material.',

      '**The Clearance Plane Protocol**:\n' +
      '1. Before any XY rapid: retract Z to the clearance plane first (`G00 Z5.0` or higher).\n' +
      '2. Then rapid XY to the new position (`G00 X50.0 Y30.0`).\n' +
      '3. Then plunge with a controlled G01 (`G01 Z-3.0 F50`).\n' +
      'This 3-step sequence is standard in every machine shop in the world.',

      '**Rapid Speed is Not Feedrate**: The F-word has no effect on G00. The rapid speed is set in machine parameters — often 15,000–30,000 mm/min (600–1200 ipm) on a modern VMC. Rapid override (25%/50%/100% switch on the operator panel) is the only way to slow it down during setup. When proving a new program, always reduce rapid override to 25% and keep your hand on the feed hold button.',
    ],
  },

  math: {
    prose: [
      'In G00, each axis moves at its own maximum speed $v_{\\text{max},i}$ independently. The time for axis $i$ to complete its move is:',
      '$t_i = \\frac{|\\Delta P_i|}{v_{\\text{max},i}}$',
      'The total move time is determined by the slowest axis (the one with the most distance relative to its max speed):',
      '$T_{\\text{move}} = \\max(t_x, t_y, t_z)$',
      'At any instant $t \\leq T$, the tool position is:',
      '$x(t) = x_1 + \\text{sign}(\\Delta x) \\cdot \\min(v_{\\text{max},x} \\cdot t,\\; |\\Delta x|)$',
      'This produces a non-linear path in the multi-axis sense. The actual path is a piecewise linear trajectory, not the straight Euclidean line between start and end.',
      'Contrast with G01, where all axes arrive simultaneously by design (see Linear Interpolation lesson).',
    ],
  },

  rigor: {
    prose: [
      '**Simultaneous Rapid**: Some machines (notably Fanuc with certain parameter settings) do perform a linear interpolation-style rapid where all axes arrive simultaneously. This is called "simultaneous rapid" or "linear rapid." Even so, the safe practice is to NEVER assume the path is straight — always clear Z before XY rapids.',

      '**Rapid Override at 100% During Production**: Once a program is proven, operators often run at 100% rapid to maximize throughput. This means programs with any marginal clearances will fail at production speed even if they worked fine at 25%. Always design programs with generous clearances.',

      '**Feed Hold During G00**: Feed hold stops motion immediately. The machine decelerates and stops during a G00 move. If you press feed hold in the middle of a dog-leg, you can end up in an unexpected intermediate position — which may not be safe to resume from. Always be aware of where the tool is before resuming from a mid-program stop.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-dogleg-calc',
      title: 'Predicting a Dog-Leg Path',
      problem: 'Machine rapid: X=15,000 mm/min, Y=15,000 mm/min. Current position: X=0, Y=0. Command G00 X120 Y30. What is the tool\'s position at t=0.1 second?',
      steps: [
        { expression: 'X distance = 120mm, X rapid = 15000/60 = 250 mm/s', annotation: 'Time to complete X: 120/250 = 0.48 s' },
        { expression: 'Y distance = 30mm, Y rapid = 15000/60 = 250 mm/s', annotation: 'Time to complete Y: 30/250 = 0.12 s' },
        { expression: 'At t=0.1s: X = 250×0.1 = 25mm', annotation: 'X has only traveled 25mm of its 120mm' },
        { expression: 'At t=0.1s: Y = 250×0.1 = 25mm', annotation: 'Y has traveled 25mm of its 30mm' },
        { expression: 'Position at t=0.1s: (25, 25)', annotation: 'Not on the straight line from (0,0) to (120,30)!' },
        { expression: 'Y finishes at t=0.12s, position: (30, 30)', annotation: 'After t=0.12s, Y stops at 30mm. X continues alone.' },
      ],
      conclusion: 'The path goes diagonally first (while both axes move), then purely in X (after Y finishes). Any obstacle between X=25-120, Y=25-30 is in the dog-leg danger zone.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-rapid-1',
        type: 'choice',
        text: 'You need to move from X0 Y0 to X100 Y20 at rapid speed. A clamp is at X50 Y15. Is this safe with G00?',
        options: [
          'Yes — G00 paths are straight so it avoids the clamp',
          'No — G00 takes a dog-leg path that may pass through X50 Y15',
          'Yes — G00 pauses and checks for obstacles automatically',
          'Only if the rapid override is below 50%',
        ],
        answer: 'No — G00 takes a dog-leg path that may pass through X50 Y15',
      },
      {
        id: 'cnc-rapid-2',
        type: 'choice',
        text: 'Which G-code guarantees a straight-line path between two points?',
        options: ['G00', 'G01', 'G28', 'G53'],
        answer: 'G01',
      },
      {
        id: 'cnc-rapid-3',
        type: 'choice',
        text: 'What is the correct order of moves when positioning to a new cutting location with G00?',
        options: [
          'Rapid XY first, then retract Z, then plunge with G01',
          'Retract Z to clearance plane, rapid XY, then plunge with G01',
          'G00 XYZ all at once to the cutting start position',
          'Use G01 at high feedrate instead of G00 for safety',
        ],
        answer: 'Retract Z to clearance plane, rapid XY, then plunge with G01',
      },
    ]
  },

  mentalModel: [
    'G00 = maximum speed, not straight line.',
    'Dog-leg = each axis races independently. The path is unpredictable.',
    'Clearance plane protocol: Z first, then XY, then plunge with G01.',
    'F-word is ignored by G00. Rapid speed is a machine parameter.',
    'Always prove programs at 25% rapid override with hand on Feed Hold.',
  ],
}
