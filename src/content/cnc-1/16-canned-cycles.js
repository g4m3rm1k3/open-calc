export default {
  id: 'cnc-canned-cycles',
  slug: 'canned-cycles',
  chapter: 'cnc-1',
  order: 16,
  title: 'Canned Cycles',
  subtitle: 'G81–G89 — One Line to Replace Ten: The CNC Automation Layer',
  tags: ['G81', 'G82', 'G83', 'G84', 'G80', 'G98', 'G99', 'drilling', 'R-plane', 'peck', 'tapping', 'canned cycle'],

  semantics: {
    core: [
      { symbol: 'Canned Cycle', meaning: 'A predefined macro sequence stored in the controller that performs a complete multi-step operation (drill, peck drill, tap, bore) with a single G-code call.' },
      { symbol: 'G81', meaning: 'Simple Drilling Cycle: Rapid to R-plane, feed to Z depth, rapid retract. Basic through-hole drilling.' },
      { symbol: 'G82', meaning: 'Counterbore Drilling: Like G81 but adds a dwell at the bottom (P parameter). Used for flat-bottomed holes and counterbores.' },
      { symbol: 'G83', meaning: 'Peck Drilling (Deep Hole): Drills in incremental "pecks" (Q parameter), retracting fully each time to clear chips. For holes deeper than 3× diameter.' },
      { symbol: 'G84', meaning: 'Right-Hand Tapping Cycle: Synchronized spindle reversal for thread cutting. Requires rigid tapping spindle or floating tap holder.' },
      { symbol: 'G80', meaning: 'Cancel Canned Cycle: Cancels any active canned cycle. Modal — canned cycles stay active until G80 (or a Group 1 motion code) cancels them.' },
      { symbol: 'R-plane', meaning: 'The rapid approach plane above the material. The cycle feeds from R down to Z depth, then retracts back to R (or initial plane).' },
      { symbol: 'G98', meaning: 'Return to Initial Plane: After the hole cycle, retract Z to the position BEFORE the G81 cycle call. Safe when there are raised features between holes.' },
      { symbol: 'G99', meaning: 'Return to R-plane: After the hole cycle, retract only to the R-plane (not full retract). Faster — minimizes Z travel between holes.' },
      { symbol: 'Q', meaning: 'Peck increment in G83: the depth of each peck before retracting.' },
      { symbol: 'P', meaning: 'Dwell time at bottom of hole (in G82, G84, G89). In G82: milliseconds on Fanuc.' },
      { symbol: 'L', meaning: 'Repeat count: how many times to repeat the cycle at consecutive XY positions (Fanuc-specific).' },
    ],
    rulesOfThumb: [
      'G80 after every canned cycle group. Forgetting G80 is a classic crash — the next XY move triggers another cycle.',
      'R-plane must be ABOVE the material surface. Standard clearance: 2mm (metric) or 0.1 inch (imperial) above the top of the part.',
      'Peck drill (G83) whenever hole depth > 3× tool diameter. Chip packing in deep holes breaks drills.',
      'G98 when moving between holes over raised features. G99 when the table is clear between holes (faster).',
    ]
  },

  hook: {
    question: 'You need to drill 100 holes to 25mm depth. Would you rather write 300 lines of G-code or 10?',
    realWorldContext:
      'Without canned cycles, drilling a single hole requires: Rapid to XY position, rapid to R-plane, slow feed to depth, rapid retract. ' +
      'Four blocks per hole × 100 holes = 400 blocks. ' +
      'A G81 canned cycle collapses this to: one setup line (G81 Z-25 R2 F50) and then just one XY coordinate per hole. ' +
      '100 holes = 101 lines. This is the "abstraction layer" principle in CNC: one G-code represents a stored multi-step routine. ' +
      'Canned cycles are the most commonly used CNC automation — virtually every part with holes uses them.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'Canned Cycle Animation',
            cells: [
              {
                type: 'js',
                title: 'G81 vs G83 — Drill Cycle Motion Visualizer',
                html: `<canvas id="c" width="680" height="380" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>
<div style="display:flex;gap:10px;justify-content:center;margin-top:10px">
  <button id="btnG81" style="padding:7px 16px;border-radius:5px;border:none;background:#38bdf8;color:#0f172a;font:bold 12px monospace;cursor:pointer">G81 — Simple Drill</button>
  <button id="btnG83" style="padding:7px 16px;border-radius:5px;border:none;background:#fbbf24;color:#0f172a;font:bold 12px monospace;cursor:pointer">G83 — Peck Drill</button>
  <button id="btnReset" style="padding:7px 16px;border-radius:5px;border:none;background:#334155;color:#e2e8f0;font:12px monospace;cursor:pointer">Reset</button>
</div>`,
                css: `body{margin:0;background:#0f172a;padding:12px;font-family:monospace;display:flex;flex-direction:column;align-items:center}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');

const toolX = W/2;
const initZ = 60;       // Y position for "initial plane"
const rPlane = 110;     // Y position for R-plane
const surface = 140;    // Y position for material surface
const depth = 310;      // Y position for full depth
const matH = depth - surface;

const PECK = 56;        // peck depth in pixels
const T = { text:'#94a3b8', green:'#34d399', blue:'#38bdf8', amber:'#fbbf24', red:'#f87171', mat:'#1e293b', matBorder:'#475569' };

let animId, steps, stepIdx, toolY = initZ, phase = 'idle', mode = null;

function labelLine(y, text, color='#475569', dash=false) {
  ctx.strokeStyle = color; ctx.lineWidth=1;
  if(dash) ctx.setLineDash([5,4]); else ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W-60, y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = color; ctx.font='11px monospace'; ctx.textAlign='left';
  ctx.fillText(text, 62, y-3);
}

function drawScene(ty) {
  ctx.clearRect(0,0,W,H);

  // Material block
  ctx.fillStyle = T.mat;
  ctx.fillRect(W/2-70, surface, 140, matH);
  ctx.strokeStyle = T.matBorder; ctx.lineWidth=1.5;
  ctx.strokeRect(W/2-70, surface, 140, matH);
  ctx.fillStyle = '#475569'; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText('Material', W/2, surface + matH/2 + 4);

  // Reference lines
  labelLine(initZ, 'Initial Plane (G98 return)', '#64748b', true);
  labelLine(rPlane, 'R-Plane (R2 = 2mm above surface)', '#38bdf8', true);
  labelLine(surface, 'Material Surface', '#475569');
  labelLine(depth, 'Z Depth (Z-25)', T.amber, true);

  // Tool (drill)
  const toolH = 40, toolW = 12;
  ctx.fillStyle = ty > surface ? T.amber : '#94a3b8';
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
  // Body
  ctx.beginPath();
  ctx.rect(toolX - toolW/2, ty - toolH, toolW, toolH);
  ctx.fill(); ctx.stroke();
  // Tip
  ctx.beginPath();
  ctx.moveTo(toolX - toolW/2, ty);
  ctx.lineTo(toolX, ty + 8);
  ctx.lineTo(toolX + toolW/2, ty);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Status
  ctx.fillStyle = T.text; ctx.font='12px monospace'; ctx.textAlign='center';
  const labels = {idle:'Click a button to start', g81:'G81 Simple Drill', g83:'G83 Peck Drill'};
  ctx.fillText(labels[mode||'idle'] || '', W/2, H-8);
}

function buildG81() {
  // Steps: init→rapid to R → feed to depth → rapid to G98 (init)
  const fps = 60, sec = fps;
  const steps = [];
  const addLerp = (from, to, frames, color) => {
    for(let i=0;i<=frames;i++) steps.push({y: from + (to-from)*(i/frames), color});
  };
  addLerp(initZ, rPlane, sec*0.4, T.blue);    // rapid to R
  addLerp(rPlane, depth, sec*1.5, T.green);    // feed to depth
  addLerp(depth, initZ, sec*0.5, T.blue);      // rapid back to initial
  return steps;
}

function buildG83() {
  const fps = 60, sec = fps;
  const steps = [];
  const addLerp = (from, to, frames, color) => {
    for(let i=0;i<=frames;i++) steps.push({y: from + (to-from)*(i/frames), color});
  };
  addLerp(initZ, rPlane, sec*0.3, T.blue);     // rapid to R
  let currentDepth = rPlane;
  for(let p=0; p<4; p++) {
    const peckEnd = Math.min(currentDepth + PECK, depth);
    addLerp(currentDepth, peckEnd, sec*0.6, T.green);   // peck down
    addLerp(peckEnd, rPlane, sec*0.4, T.blue);           // retract to R
    if(peckEnd < depth) addLerp(rPlane, peckEnd, sec*0.2, T.blue); // rapid to just above last depth
    currentDepth = peckEnd;
    if(currentDepth >= depth) break;
  }
  addLerp(depth, initZ, sec*0.5, T.blue);       // final retract
  return steps;
}

let trailPoints = [];
function animate() {
  if(stepIdx < steps.length) {
    toolY = steps[stepIdx].y;
    trailPoints.push({y:toolY, x:toolX});
    stepIdx++;
    drawScene(toolY);
    // Draw trail
    if(trailPoints.length > 1) {
      ctx.strokeStyle = mode==='g81'? T.green : T.amber;
      ctx.lineWidth=1.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(trailPoints[0].x, trailPoints[0].y + 8);
      for(let i=1;i<trailPoints.length;i++) ctx.lineTo(trailPoints[i].x, trailPoints[i].y + 8);
      ctx.stroke();
    }
    animId = requestAnimationFrame(animate);
  }
}

document.getElementById('btnG81').addEventListener('click',()=>{
  cancelAnimationFrame(animId); mode='g81'; steps=buildG81(); stepIdx=0; trailPoints=[]; animate();});
document.getElementById('btnG83').addEventListener('click',()=>{
  cancelAnimationFrame(animId); mode='g83'; steps=buildG83(); stepIdx=0; trailPoints=[]; animate();});
document.getElementById('btnReset').addEventListener('click',()=>{
  cancelAnimationFrame(animId); mode='idle'; toolY=initZ; trailPoints=[]; drawScene(initZ);});

drawScene(initZ);
`
              }
            ]
          }
        },
        title: 'Canned Cycle Motion Visualizer',
        caption: 'Click G81 to see the simple drill cycle: rapid to R, feed to depth, rapid out. Click G83 to see peck drilling: multiple pecks with full retracts between each. Watch how pecking clears chips after each pass.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(CANNED CYCLE EXAMPLES)\n' +
            '(G81: Simple drilling — 5 holes in a row)\n' +
            '\n' +
            'G21 G90 G17 G40 G49 G80\n' +
            'T2 M06                     (Drill tool)\n' +
            'G43 H2\n' +
            'S1200 M03\n' +
            'M08\n' +
            '\n' +
            '(G81 cycle definition: Z depth, R-plane, feedrate)\n' +
            '(G98 = return to initial plane between holes)\n' +
            'G99 G81 Z-15.0 R2.0 F80   (Activate drill cycle, G99 = R-plane return)\n' +
            '\n' +
            '(Now just X/Y moves — each triggers a drill cycle)\n' +
            'X10.0 Y20.0\n' +
            'X30.0\n' +
            'X50.0\n' +
            'X70.0\n' +
            'G98 X90.0                  (Last hole: use G98 to retract fully)\n' +
            '\n' +
            'G80                        (CANCEL CANNED CYCLE — critical!)\n' +
            'M09\n' +
            'M05\n' +
            'G91 G28 Z0\n' +
            'G90 G28 X0 Y0\n' +
            'M30'
        },
        title: 'G81 Drill Cycle Lab',
        caption: 'Watch how the single G81 line sets up the cycle, and then each XY coordinate triggers a complete drill cycle automatically. The G80 at the end cancels the cycle — without it, the next XY rapid move would trigger a drill cycle at that position!',
      }
    ],
    prose: [
      '**What a Canned Cycle Is**: A canned cycle is a stored subroutine inside the controller firmware. When you activate G81, you are telling the controller: "At every XY position I give you, execute this sequence: (1) rapid to R-plane, (2) feed to Z depth, (3) rapid retract." You define the parameters once; the cycle executes them automatically at each position.',

      '**The R-Plane**: R is the rapid approach height above the material. The controller rapids from wherever the tool is down to R, then switches to feedrate for the plunge to Z. R should be just above the material surface — typically R2.0 (2mm) or R0.1 (0.1 inch). Too high: wastes time on every hole. Too low: the controller might not fully decelerate before starting the feed.',

      '**G98 vs G99 — Return Plane Strategy**:\n' +
      '- `G99`: After each hole, retract only to the R-plane. This is fast. Use when the table between holes is clear.\n' +
      '- `G98`: After each hole, retract to the position the tool was at before the G81 call. Use when there are clamps, raised bosses, or stepped features between holes — the full retract clears them.',

      '**G83 — Peck Drilling**: In G83, the `Q` parameter defines the peck depth (how far to drill before retracting). After each peck, the tool retracts to the R-plane to clear chips, then re-enters to just above the previous peck depth, and feeds another Q-distance. Use whenever hole depth > 3× drill diameter. Deep holes without pecking = broken drill.',

      '**G84 — Rigid Tapping**: G84 is the tapping cycle. The spindle reverses at the bottom to retract the tap. Two modes: (1) Rigid tapping — spindle is synchronized with Z axis, requires a rigid tapping-capable spindle and controller. (2) Floating tap holder — the tap holder has a float to allow for speed differences. Most modern machines support rigid tapping (faster, more accurate). The feedrate F for tapping = RPM × thread pitch.',

      '**ALWAYS End With G80**: Canned cycles are modal (Group 9). They stay active until cancelled. A G00 or G01 code cancels them too (modal Group 1 overrides Group 9), but the safest practice is always an explicit G80. Without G80, the next XY move in the program — perhaps a G00 rapid to the tool change position — will trigger a drill cycle at that position.',
    ],
  },

  math: {
    prose: [
      'The G81 cycle performs the following motion at each called XY position:',
      '$\\text{Rapid to } (X_i, Y_i), \\quad \\text{Rapid to Z} = R$',
      '$\\text{Feed to Z} = Z_{\\text{depth}} \\text{ at rate } F$',
      '$\\text{Rapid to } Z_{\\text{return}} = \\begin{cases} Z_{\\text{initial}} & \\text{(G98)} \\\\ R & \\text{(G99)} \\end{cases}$',
      'For G83 peck drilling with peck depth $Q$, the tool advances in increments:',
      '$Z_1 = R - Q, \\quad Z_2 = R - 2Q, \\quad \\ldots \\quad Z_n = Z_{\\text{depth}}$',
      'Each peck retracts to $R$ before the next peck. The number of pecks is $\\lceil |Z_{\\text{depth}} - R| / Q \\rceil$.',
      'For G84 tapping, the feedrate is derived from the thread pitch $p$:',
      '$F = \\text{RPM} \\times p$',
      'Example: M10×1.5 tap at 500 RPM: $F = 500 \\times 1.5 = 750$ mm/min.',
    ],
  },

  rigor: {
    prose: [
      '**Canned Cycle Modal Memory**: All parameters of a canned cycle (Z, R, F, Q, P) are modal within the cycle. You only need to specify a parameter when it changes. If drilling 20 holes at the same Z and R, only the first line needs Z and R — subsequent lines only need X and Y.',

      '**G91 Inside Canned Cycles**: Be careful when switching to G91 while a canned cycle is active. In G91 mode, the R and Z parameters in the cycle become incremental — R becomes distance from initial plane to R-plane, Z becomes distance from R-plane to full depth. This is useful for step drilling but easy to confuse.',

      '**High-Speed Peck (G73)**: G73 is similar to G83 but only retracts a small distance (parameter d in machine parameters) rather than fully retracting to R. It is faster and good for short-chipping materials (cast iron, brass), but not suitable for long-chipping materials (aluminum, steel) where full chip clearance is needed.',

      '**Interrupted Drilling**: G82 (counterbore cycle) adds a dwell P at the bottom of the hole before retracting. The dwell allows the spindle to clean up the bottom of the hole. Specify P in milliseconds on Fanuc: P500 = 0.5 second dwell.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-g83-calc',
      title: 'G83 Peck Drill — Calculating Pecks',
      problem: 'Drill a 25mm deep hole with G83. R-plane = R2.0 (2mm above surface). Peck depth Q = 8mm. How many pecks?',
      steps: [
        { expression: 'Z depth = -25mm, R = 2mm', annotation: 'Total depth to drill = 25mm + 2mm from R-plane = 27mm below R' },
        { expression: 'Actually: from R to depth = 25mm (R is 2 above surface, depth is 25 below surface)', annotation: 'Z-25 is 25mm below the surface. R2 is 2mm above the surface. Distance = 27mm.' },
        { expression: 'Pecks = ceil(27 / 8)', annotation: '= ceil(3.375) = 4 pecks' },
        { expression: 'Peck 1: Z = R - 8 = 2 - 8 = -6mm', annotation: 'First peck to 6mm below surface' },
        { expression: 'Peck 2: Z = -6 - 8 = -14mm', annotation: 'Second peck' },
        { expression: 'Peck 3: Z = -14 - 8 = -22mm', annotation: 'Third peck' },
        { expression: 'Peck 4: Z = -25mm (final depth)', annotation: 'Last peck — reaches programmed Z depth' },
      ],
      conclusion: 'G83 Z-25.0 R2.0 Q8.0 F60 will drill the hole in 4 pecks. The Q value controls chip control.',
    },
    {
      id: 'ex-cnc-tap-feed',
      title: 'Calculating G84 Tapping Feedrate',
      problem: 'Tap M8×1.25 (pitch = 1.25mm) at 400 RPM. What feedrate (F)?',
      steps: [
        { expression: 'F = RPM × pitch', annotation: 'Tapping feedrate formula' },
        { expression: 'F = 400 × 1.25 = 500 mm/min', annotation: 'G-code: G84 Z-15.0 R2.0 F500' },
        { expression: 'Equivalent: S400 M03, G84 Z-15 R2 F500', annotation: 'Complete tapping cycle setup' },
      ],
      conclusion: 'For tapping, always calculate F from pitch and RPM. Using any other feedrate will break the tap or strip the thread.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-canned-1',
        type: 'choice',
        text: 'What is the purpose of G80?',
        options: [
          'Start a drilling cycle',
          'Cancel any active canned cycle',
          'Set the R-plane height',
          'Return to machine home',
        ],
        answer: 'Cancel any active canned cycle',
      },
      {
        id: 'cnc-canned-2',
        type: 'choice',
        text: 'In G83, what does the Q parameter define?',
        options: [
          'The dwell time at the bottom of the hole',
          'The peck depth — how far to drill before retracting',
          'The number of holes to drill',
          'The rapid speed override',
        ],
        answer: 'The peck depth — how far to drill before retracting',
      },
      {
        id: 'cnc-canned-3',
        type: 'choice',
        text: 'G99 and G98 control what in a canned cycle?',
        options: [
          'The drilling speed',
          'Whether to use peck drilling or simple drilling',
          'The Z-axis return plane after each hole (R-plane vs initial plane)',
          'The coolant state during drilling',
        ],
        answer: 'The Z-axis return plane after each hole (R-plane vs initial plane)',
      },
      {
        id: 'cnc-canned-4',
        type: 'input',
        text: 'An M10×1.5 tap runs at 600 RPM. What feedrate (mm/min)? ',
        answer: '900',
      },
    ]
  },

  mentalModel: [
    'Canned cycle = one G-code replaces a 4-step sequence. G80 cancels it.',
    'R-plane = rapid approach height above material surface (typically 2mm).',
    'G98 = return to initial plane (safe over obstacles). G99 = return to R (fast).',
    'G83 = peck drill. Q = peck depth. Use when depth > 3× diameter.',
    'G84 tapping feedrate: F = RPM × thread pitch. No exceptions.',
    'ALWAYS G80 after canned cycles. Forgetting = next move triggers a drill.',
  ],
}
