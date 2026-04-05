export default {
  id: 'cnc-machine-home',
  slug: 'machine-home',
  chapter: 'cnc-1',
  order: 6,
  title: 'Machine Home & Reference Return',
  subtitle: 'G28 / G30 — The Machine\'s Internal GPS Reset',
  tags: ['G28', 'G30', 'home', 'reference', 'homing', 'machine zero', 'limit switch'],

  semantics: {
    core: [
      { symbol: 'G28', meaning: 'Return to Machine Reference Point (Home): Move to the position defined by machine parameters as the primary reference (usually machine zero).' },
      { symbol: 'G30', meaning: 'Return to 2nd / 3rd / 4th Reference Point: Move to alternate reference positions (tool change position, pallet change position).' },
      { symbol: 'Machine Reference Point', meaning: 'A fixed physical position detected by reference switches (or absolute encoders). The machine\'s internal "GPS anchor" — all machine coordinates (G53) originate from here.' },
      { symbol: 'Floating Zero', meaning: 'On older machines with incremental encoders, the machine zero position is lost on power-down. Homing re-establishes it. Absolute encoders retain position without homing.' },
      { symbol: 'Intermediate Point', meaning: 'G28 and G30 move through an intermediate point (the axis values in the block) before going home. Used to clear the workpiece safely.' },
    ],
    rulesOfThumb: [
      'ALWAYS retract Z first before returning XY to home. A crash happens when XY moves home with the tool still in the part.',
      'The standard safe home return: G91 G28 Z0 → then G28 X0 Y0 (or G90 G28 X0 Y0 after switching back).',
      'On power-up, most machines with incremental encoders require homing before running any program. Skip this and coordinates will be wrong.',
      'G30 P2 is the most common tool-change position — this is where the spindle parks for a manual or automatic tool change.',
    ]
  },

  hook: {
    question: 'How does the machine know where it is when it first powers on — and what happens if it doesn\'t?',
    realWorldContext:
      'CNC machines use motors with encoders to track position. But on a power loss, many machines lose their position data. ' +
      'When you power on, the controller has no idea where the spindle is — it only knows the last saved position. ' +
      'If that is wrong (moved during power-off, e-stop, etc.), every coordinate in your next program is wrong. ' +
      'Homing sends every axis to a known physical reference switch, re-establishing the truth. ' +
      'Skipping this step on a machine that requires it and then running a part program is one of the fastest ways to crash a machine.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'How G28 Works — Animated',
            cells: [
              {
                type: 'js',
                title: 'G28 Motion: Intermediate Point → Machine Home',
                html: `<canvas id="c" width="700" height="320" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>`,
                css: `body{margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:monospace}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');

// Layout
const pad = 40;
const homeX = W - pad - 20, homeY = pad + 20;
const startX = pad + 80, startY = H - pad - 60;
const intX = pad + 80, intY = pad + 80;   // intermediate point (same X as start, near top)

const T = { bg:'#0f172a', grid:'#1e293b', axis:'#334155', text:'#94a3b8', accent:'#38bdf8', warn:'#fbbf24', green:'#34d399', red:'#f87171' };

let phase = 0; // 0=idle, 1=to-intermediate, 2=to-home
let t = 0;
let toolX = startX, toolY = startY;
let animId;

function lerp(a,b,t){ return a + (b-a)*t; }
function ease(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

function draw(tx, ty) {
  ctx.clearRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
  for(let x=pad;x<W-pad;x+=40){ ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,H-pad);ctx.stroke(); }
  for(let y=pad;y<H-pad;y+=40){ ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke(); }

  // Axes labels
  ctx.fillStyle = T.text; ctx.font='11px monospace';
  ctx.fillText('+X →', W-pad-30, H-pad+15);
  ctx.save(); ctx.translate(pad-20,pad+50); ctx.rotate(-Math.PI/2); ctx.fillText('+Y', 0, 0); ctx.restore();

  // Machine home marker
  ctx.fillStyle = T.green; ctx.strokeStyle = T.green; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(homeX, homeY, 14, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#0f172a'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('HOME', homeX, homeY);
  ctx.fillStyle=T.text; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.fillText('Machine Zero (G53)', homeX - 60, homeY + 28);

  // Start position
  ctx.fillStyle = T.warn; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(startX, startY, 8, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=T.text; ctx.fillText('Tool Start', startX+12, startY+4);

  // Intermediate point (in G28 block command)
  ctx.fillStyle = T.accent; ctx.strokeStyle = T.accent; ctx.lineWidth=2;
  ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.arc(intX, intY, 7, 0, Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=T.text; ctx.fillText('Intermediate Pt', intX+12, intY-6);
  ctx.font='10px monospace'; ctx.fillStyle=T.muted;
  ctx.fillText('(from G91 G28 Z0)', intX+12, intY+8);

  // Path line: start → intermediate (dashed blue)
  if(phase >= 1) {
    ctx.strokeStyle = T.accent; ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(startX, startY);
    const p1x = lerp(startX, intX, Math.min(1, (phase===1?ease(t):1)));
    const p1y = lerp(startY, intY, Math.min(1, (phase===1?ease(t):1)));
    ctx.lineTo(p1x, p1y); ctx.stroke(); ctx.setLineDash([]);
  }

  // Path line: intermediate → home (solid green)
  if(phase >= 2) {
    ctx.strokeStyle = T.green; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(intX, intY);
    const p2x = lerp(intX, homeX, Math.min(1, ease(t)));
    const p2y = lerp(intY, homeY, Math.min(1, ease(t)));
    ctx.lineTo(p2x, p2y); ctx.stroke();
  }

  // Tool marker
  ctx.fillStyle = T.warn; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#0f172a'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('T', tx, ty);
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';

  // Status
  ctx.fillStyle=T.text; ctx.font='13px monospace'; ctx.textAlign='center';
  const statusText = phase===0 ? 'Click to start G91 G28 Z0  →  G28 X0 Y0' :
                     phase===1 ? 'Phase 1: Move to intermediate point (Z retract)' :
                     phase===2 ? 'Phase 2: Move from intermediate to Machine Home' : 'At Machine Home — coordinates reset!';
  ctx.fillText(statusText, W/2, H - 10);
  ctx.textAlign='left';
}

function animate() {
  t += 0.016;
  if(phase === 1) {
    toolX = lerp(startX, intX, ease(Math.min(1,t)));
    toolY = lerp(startY, intY, ease(Math.min(1,t)));
    if(t >= 1) { phase = 2; t = 0; }
  } else if(phase === 2) {
    toolX = lerp(intX, homeX, ease(Math.min(1,t)));
    toolY = lerp(intY, homeY, ease(Math.min(1,t)));
    if(t >= 1) { phase = 3; }
  }
  draw(toolX, toolY);
  if(phase < 3) animId = requestAnimationFrame(animate);
}

c.addEventListener('click', () => {
  if(phase === 0 || phase === 3) {
    cancelAnimationFrame(animId);
    phase = 1; t = 0; toolX = startX; toolY = startY;
    animate();
  }
});

draw(toolX, toolY);
`
              },
              {
                type: 'challenge',
                title: 'Check: Safe Home Return Order',
                html: '<div></div>',
                css: '',
                startCode: '',
                options: [
                  { label: 'A', text: 'G91 G28 X0 Y0  then  G28 Z0' },
                  { label: 'B', text: 'G91 G28 Z0  then  G28 X0 Y0' },
                  { label: 'C', text: 'G90 G28 X0 Y0 Z0 (all at once)' },
                  { label: 'D', text: 'M30 automatically homes the machine' },
                ],
                check: (sel) => sel === 'B',
              }
            ]
          }
        },
        title: 'G28 Motion Visualization',
        caption: 'Click the canvas to see how G28 moves through an intermediate point before reaching machine home. Notice: Z retracts first (Phase 1), then XY move home (Phase 2). This prevents the tool from dragging across the part.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(SAFE HOME RETURN SEQUENCE)\n' +
            '(This is the standard end-of-program home return)\n' +
            '\n' +
            'G21 G90                (Ensure metric, absolute)\n' +
            '\n' +
            '(Simulate some cutting position)\n' +
            'G00 X25.0 Y15.0        (Tool is somewhere in the work area)\n' +
            'G01 Z-5.0 F50          (Tool is at depth)\n' +
            '\n' +
            '(--- HOME RETURN ---)\n' +
            'G91 G28 Z0             (Step 1: Retract Z to machine home)\n' +
            '                       (G91 = incremental: "from here, go home")\n' +
            '                       (Z0 = intermediate point at current Z)\n' +
            'G90                    (Back to absolute mode)\n' +
            'G28 X0 Y0              (Step 2: Return XY to machine home)\n' +
            'M30                    (End of program)'
        },
        title: 'Home Return Lab',
        caption: 'Run this program and watch the toolpath. Notice how Z retracts first (Phase 1), then XY moves home (Phase 2). This order is critical — reversing it would drag the tool across the part.',
      }
    ],
    prose: [
      '**Why the Machine Needs a Home**: CNC machines with incremental encoders lose their position reference the moment power is cut. The encoder knows how far each motor has rotated since the last reference event — but without a reference event, it has no idea where that puts it in physical space. Homing drives each axis until it hits a precision reference switch (or a Z-pulse from an absolute encoder). The controller then says: "OK — this switch position = (X-500, Y-400, Z-200) in machine coordinates." Everything else is relative to that.',

      '**G28 — The Two-Step Move**: G28 does NOT go directly to machine home. It first moves to the **intermediate point** you specify in the block, then moves from there to machine home. The reason: you need to lift the tool off the part (retract Z) before moving XY — otherwise the tool drags across your work. `G91 G28 Z0` means "move Z to a position 0 mm from here (i.e., stay in Z), then go to Z home." This is the safe retract pattern.',

      '**G30 — Alternate Reference Points**: G30 moves to a second (P2), third (P3), or fourth (P4) reference position. The most common use is G30 P2 as the **tool change position** — the specific X/Y/Z location where the spindle parks to allow a manual or automatic tool change. This position is stored in machine parameters and stays fixed.',

      '**Absolute Encoders — No Homing Required**: High-end modern machines use absolute encoders that retain position through power cycles. On these machines, homing is optional or done automatically in the background. The machine knows exactly where every axis is the moment it powers on. This is common on Fanuc 30i/31i series and Siemens 840D machines. Budget machines and older Fanuc 0i systems typically use incremental encoders and require homing.',
    ],
  },

  math: {
    prose: [
      'G28 moves through the intermediate point $(X_i, Y_i, Z_i)$ specified in the block, then to the machine reference position $(X_{ref}, Y_{ref}, Z_{ref})$:',
      '$$\\text{G28:} \\quad \\mathbf{P}_{\\text{tool}} \\xrightarrow{\\text{rapid}} (X_i, Y_i, Z_i) \\xrightarrow{\\text{rapid}} (X_{ref}, Y_{ref}, Z_{ref})$$',
      'When only some axes are specified (e.g., G28 Z0), only those axes move to the intermediate point and then home. Unspecified axes do not move.',
      'In G91 mode, the intermediate point is computed relative to current position $\\mathbf{P}_{\\text{tool}}$:',
      '$$X_i = X_{\\text{current}} + \\Delta X_{\\text{block}}, \\quad Z_i = Z_{\\text{current}} + \\Delta Z_{\\text{block}}$$',
      'So `G91 G28 Z0` gives $\\Delta Z = 0$, meaning $Z_i = Z_{\\text{current}}$ — the tool stays at its current Z, then moves to Z home. This is the key insight of the pattern.',
    ],
  },

  rigor: {
    prose: [
      '**G28 vs G53**: G53 moves to a position in machine coordinates (bypassing work offsets) but does NOT go to machine home specifically. G28 goes to the actual reference point. Both are useful: G53 is for moving to a known machine position (like a probe location), G28 is for fully homing the axis.',

      '**Which Axes Does G28 Return?**: Only the axes specified in the G28 block are returned home. `G28 Z0` only homes Z. `G28 X0 Y0` only homes X and Y. `G28 X0 Y0 Z0` homes all three. On a 5-axis machine you could specify A and B as well.',

      '**Homing Order in Machine Parameters**: The order in which axes home during the power-on reference return cycle is set by machine parameters. Typically Z homes first (for safety), then X and Y together, then rotary axes. Your operator\'s manual will specify this.',

      '**Crash Scenario**: Most CNC crashes involving homing happen when a programmer writes `G28 X0 Y0 Z0` in G90 absolute mode after cutting. In G90, the intermediate point coordinates are absolute — so G28 X0 Y0 Z0 first tries to move all axes simultaneously to (0,0,0) in work coordinates before going home. If the tool is at depth in the material, Z moves toward Z0 (the part surface) before retracting. Solution: always use G91 for the Z retract first.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-home-sequence',
      title: 'Complete Program End With Safe Home Return',
      problem: 'Write the correct blocks to end a milling program safely and return to home.',
      code:
        'N140 G00 Z5.0          (Rapid retract from cut depth)\n' +
        'N150 M05               (Stop spindle)\n' +
        'N160 G91 G28 Z0        (Incremental: home Z axis)\n' +
        'N170 G90               (Back to absolute)\n' +
        'N180 G28 X0 Y0         (Home XY axes)\n' +
        'N190 M30               (End program)',
      steps: [
        { expression: 'G00 Z5.0', annotation: 'First rapid retract to clear the part — before the spindle stops. Tool is still spinning.' },
        { expression: 'M05', annotation: 'Stop spindle. Safe to move home now.' },
        { expression: 'G91 G28 Z0', annotation: 'Incremental mode. Intermediate point = current Z. G28 then homes Z only. Safe — Z cannot move down before going home.' },
        { expression: 'G90', annotation: 'Restore absolute mode immediately.' },
        { expression: 'G28 X0 Y0', annotation: 'Home XY. Z is already home, so no risk of collision.' },
        { expression: 'M30', annotation: 'Program end. Spindle off (already), coolant off, rewind.' },
      ],
      conclusion: 'This sequence is standard. Z first, then XY. G91 for Z retract prevents the Z0 coordinate trap.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-home-1',
        type: 'choice',
        text: 'What does G28 do BEFORE moving to machine home?',
        options: [
          'Stops the spindle',
          'Moves to an intermediate point specified in the block',
          'Returns to the work offset origin',
          'Executes an automatic tool change',
        ],
        answer: 'Moves to an intermediate point specified in the block',
      },
      {
        id: 'cnc-home-2',
        type: 'choice',
        text: 'Why is G91 G28 Z0 safer than G90 G28 Z0 for a Z home return?',
        options: [
          'G91 makes the machine move faster',
          'In G90, Z0 is work zero — the tool could try to move DOWN to Z=0 before retracting',
          'G90 G28 cancels the work offset',
          'G91 is required for the G28 command to work at all',
        ],
        answer: 'In G90, Z0 is work zero — the tool could try to move DOWN to Z=0 before retracting',
      },
      {
        id: 'cnc-home-3',
        type: 'choice',
        text: 'What is G30 P2 most commonly used for?',
        options: [
          'Return to work zero',
          'Return to a second part on the table',
          'Return to the tool change position',
          'Return to the part inspection position',
        ],
        answer: 'Return to the tool change position',
      },
    ]
  },

  mentalModel: [
    'G28 = two-step home: intermediate point FIRST, then machine home.',
    'ALWAYS retract Z before XY. Crashing XY with tool at depth is instant catastrophe.',
    'G91 G28 Z0 = the safe Z retract idiom. Memorize it.',
    'G30 P2 = tool change position (alternate reference point).',
    'Homing resets the internal GPS. Without it, all coordinates are fiction.',
  ],
}
