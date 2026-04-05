export default {
  id: 'cnc-spindle-coolant',
  slug: 'spindle-and-coolant',
  chapter: 'cnc-1',
  order: 13,
  title: 'Spindle & Coolant',
  subtitle: 'S, M03/M04/M05, G96/G97, M07/M08/M09',
  tags: ['spindle', 'S-word', 'M03', 'M04', 'M05', 'G96', 'G97', 'coolant', 'M07', 'M08', 'M09', 'RPM', 'CSS', 'SFM', 'SMM'],

  semantics: {
    core: [
      { symbol: 'S', meaning: 'Spindle Speed: Sets RPM (in G97 mode) or Surface Speed in SFM/m/min (in G96 mode). Takes effect when M03 or M04 is commanded.' },
      { symbol: 'M03', meaning: 'Spindle On — Clockwise (CW). Standard direction for right-hand tools (end mills, drills). Viewed from the spindle nose looking down.' },
      { symbol: 'M04', meaning: 'Spindle On — Counter-Clockwise (CCW). Used for left-hand tools, back-boring tools, or thread milling in some configurations.' },
      { symbol: 'M05', meaning: 'Spindle Stop. Always call M05 before a tool change and at program end. Attempting a tool change at speed destroys the machine.' },
      { symbol: 'G97', meaning: 'Constant RPM Mode: S-word = RPM directly. The default. Used for milling. "S1500" = 1500 RPM.' },
      { symbol: 'G96', meaning: 'Constant Surface Speed (CSS): S-word = surface feet per minute (SFM) in G20, or meters/minute (m/min) in G21. The controller adjusts RPM as the diameter changes. Primary on lathes.' },
      { symbol: 'M08', meaning: 'Flood Coolant On: Pumps cutting fluid to the tool/part junction. Most common coolant mode.' },
      { symbol: 'M07', meaning: 'Mist Coolant On: Light mist of coolant. Used for operations where flood would cause thermal shock (ceramics, some grinding).' },
      { symbol: 'M09', meaning: 'Coolant Off. Called before tool changes and at program end.' },
      { symbol: 'G50 (lathe)', meaning: 'Maximum Spindle Speed Clamp (on lathes): Limits RPM in G96 mode to prevent over-speed at small diameters. E.g., G50 S3000 limits to 3000 RPM max.' },
    ],
    rulesOfThumb: [
      'S-word without M03/M04 just sets the speed register — the spindle does NOT start. M03 starts it.',
      'Always start the spindle BEFORE making any cutting contact. Never plunge into material with a stopped spindle.',
      'Stop the spindle (M05) before a tool change. Always.',
      'Coolant on (M08) should come on as the tool approaches the material, not after contact.',
    ]
  },

  hook: {
    question: 'Why does the S-word alone not start the spindle — and what is the difference between RPM mode and surface speed mode?',
    realWorldContext:
      'The spindle is the heart of the machining process. Too slow: rubbing instead of cutting, built-up edge, poor surface finish. ' +
      'Too fast: tool overheats, burns the material, destroys carbide. The correct speed depends on the tool diameter, the material, and the cutting operation. ' +
      'CNC gives you two ways to specify this: fixed RPM (G97 — simple) and constant surface speed (G96 — intelligent). ' +
      'On a lathe, as the tool moves inward toward the center of a part, the diameter shrinks. ' +
      'In G96 mode, the controller automatically increases RPM to keep the chip load constant, producing consistent surface finish all the way across a face — ' +
      'something impossible to do manually.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'RPM vs CSS — Visual Comparison',
            cells: [
              {
                type: 'js',
                title: 'G97 (Fixed RPM) vs G96 (Constant Surface Speed)',
                html: `<canvas id="c" width="680" height="320" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>
<div style="display:flex;gap:10px;justify-content:center;margin-top:8px">
  <button id="btnG97" style="padding:7px 16px;border-radius:5px;border:none;background:#38bdf8;color:#0f172a;font-family:monospace;font-size:12px;cursor:pointer;font-weight:bold">G97 — Fixed RPM</button>
  <button id="btnG96" style="padding:7px 16px;border-radius:5px;border:none;background:#4ade80;color:#0f172a;font-family:monospace;font-size:12px;cursor:pointer;font-weight:bold">G96 — Const Surface Speed</button>
</div>`,
                css: `body{margin:0;background:#0f172a;padding:12px;font-family:monospace;display:flex;flex-direction:column;align-items:center}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');

// Lathe face-turning: tool moves from large diameter to center
// X = diameter 100mm down to 0mm
// Show: RPM and surface speed at each position

const diams = [];
for(let d=100; d>=5; d-=2) diams.push(d);
const CSS = 200; // target surface speed mm/s equivalent
const fixedRPM = 600;

function surfaceSpeedFromRPM(rpm, diam) {
  return Math.PI * diam * rpm / 1000; // mm/s (simplified)
}
function rpmFromCSS(css, diam) {
  if(diam < 1) return 3000; // max clamp
  return Math.min(3000, css * 1000 / (Math.PI * diam));
}

function drawChart(mode) {
  ctx.clearRect(0,0,W,H);
  const pad = {l:70,r:30,t:40,b:50};
  const cw = W-pad.l-pad.r, ch = H-pad.t-pad.b;

  ctx.fillStyle='#94a3b8'; ctx.font='12px monospace'; ctx.textAlign='center';
  ctx.fillText(mode==='g97'?'G97: Fixed 600 RPM — Surface Speed Drops as Diameter Shrinks':'G96: Constant Surface Speed — RPM Rises as Diameter Shrinks', W/2, 20);

  // Axes
  ctx.strokeStyle='#475569'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+ch); ctx.lineTo(pad.l+cw,pad.t+ch); ctx.stroke();

  // X axis labels (diameter)
  ctx.fillStyle='#64748b'; ctx.font='10px monospace'; ctx.textAlign='center';
  [100,80,60,40,20,5].forEach(d=>{
    const xi = pad.l + ((100-d)/95)*cw;
    ctx.fillText(d+'mm', xi, pad.t+ch+16);
    ctx.beginPath();ctx.moveTo(xi,pad.t+ch);ctx.lineTo(xi,pad.t+ch+4);ctx.stroke();
  });
  ctx.fillText('← Diameter (tool moving toward center)', pad.l+cw/2, pad.t+ch+32);

  // Y axis
  const maxRPM = 3200;
  [0,1000,2000,3000].forEach(r=>{
    const yi = pad.t + ch - (r/maxRPM)*ch;
    ctx.fillStyle='#64748b'; ctx.textAlign='right';
    ctx.fillText(r, pad.l-6, yi+4);
    ctx.strokeStyle='#1e293b'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(pad.l,yi);ctx.lineTo(pad.l+cw,yi);ctx.stroke();
  });
  ctx.save(); ctx.translate(16, pad.t+ch/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle='#94a3b8'; ctx.textAlign='center'; ctx.font='11px monospace';
  ctx.fillText('RPM', 0, 0); ctx.restore();

  // Plot RPM line
  ctx.strokeStyle = mode==='g97' ? '#38bdf8' : '#4ade80';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  diams.forEach((d,i)=>{
    const rpm = mode==='g97' ? fixedRPM : rpmFromCSS(CSS,d);
    const xi = pad.l + ((100-d)/95)*cw;
    const yi = pad.t + ch - (rpm/maxRPM)*ch;
    if(i===0) ctx.moveTo(xi,yi); else ctx.lineTo(xi,yi);
  });
  ctx.stroke();

  // Plot surface speed as secondary line (gray dashed)
  ctx.strokeStyle = mode==='g97' ? 'rgba(251,191,36,0.8)' : 'rgba(56,189,248,0.6)';
  ctx.lineWidth = 1.5; ctx.setLineDash([5,3]);
  ctx.beginPath();
  const maxSS = mode==='g97'?400:250;
  diams.forEach((d,i)=>{
    const ss = mode==='g97' ? surfaceSpeedFromRPM(fixedRPM,d) : CSS;
    const xi = pad.l + ((100-d)/95)*cw;
    const yi = pad.t + ch - (Math.min(ss/maxSS,1))*ch*0.8;
    if(i===0) ctx.moveTo(xi,yi); else ctx.lineTo(xi,yi);
  });
  ctx.stroke(); ctx.setLineDash([]);

  // Legend
  ctx.fillStyle = mode==='g97'?'#38bdf8':'#4ade80';
  ctx.fillRect(pad.l+10,pad.t+8,14,3);
  ctx.fillStyle='#94a3b8'; ctx.font='11px monospace'; ctx.textAlign='left';
  ctx.fillText('RPM', pad.l+28, pad.t+14);
  ctx.fillStyle = mode==='g97'?'rgba(251,191,36,0.9)':'rgba(56,189,248,0.7)';
  ctx.fillRect(pad.l+70,pad.t+8,14,3);
  ctx.fillStyle='#94a3b8';
  ctx.fillText('Surface Speed (rel.)', pad.l+88, pad.t+14);

  if(mode==='g97') {
    ctx.fillStyle='#f87171'; ctx.font='11px monospace';
    ctx.fillText('⚠ Surface speed halves as diameter halves — inconsistent finish', pad.l+10, pad.t+ch-10);
  } else {
    ctx.fillStyle='#4ade80'; ctx.font='11px monospace';
    ctx.fillText('✓ Surface speed stays constant — consistent finish & chip load', pad.l+10, pad.t+ch-10);
  }
}

drawChart('g97');
document.getElementById('btnG97').addEventListener('click',()=>drawChart('g97'));
document.getElementById('btnG96').addEventListener('click',()=>drawChart('g96'));
`
              }
            ]
          }
        },
        title: 'G97 vs G96 Chart',
        caption: 'Toggle between modes. In G97 (fixed RPM), surface speed drops linearly as the tool moves toward the center — a smaller diameter at the same RPM covers less distance per revolution. In G96 (CSS), RPM increases to compensate. This is why face-turned parts look better with G96.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(SPINDLE AND COOLANT SEQUENCE)\n' +
            '(Standard milling program with proper M-codes)\n' +
            '\n' +
            'G21 G90               (Metric, absolute)\n' +
            'G00 Z50.0             (Safe height)\n' +
            '\n' +
            '(--- START SPINDLE AND COOLANT ---)\n' +
            'T1 M06                (Tool change: End mill #1)\n' +
            'S2500 M03             (2500 RPM, CW - spindle starts)\n' +
            'M08                   (Flood coolant on)\n' +
            'G43 H1                (Tool length offset)\n' +
            '\n' +
            '(--- CUTTING ---)\n' +
            'G00 X10.0 Y10.0       (Rapid to start)\n' +
            'G01 Z-4.0 F50         (Plunge - spindle already running!)\n' +
            'G01 X60.0 F200\n' +
            'G01 Y40.0\n' +
            'G01 X10.0\n' +
            'G01 Y10.0\n' +
            '\n' +
            '(--- END SEQUENCE ---)\n' +
            'G00 Z50.0             (Retract)\n' +
            'M09                   (Coolant off)\n' +
            'M05                   (Spindle off)\n' +
            'G91 G28 Z0            (Home Z)\n' +
            'G90 G28 X0 Y0         (Home XY)\n' +
            'M30'
        },
        title: 'Full Spindle & Coolant Program',
        caption: 'Trace the M-code sequence: tool change → spindle start → coolant on → cut → coolant off → spindle stop → home → end. This is the standard professional sequence.',
      }
    ],
    prose: [
      '**S-word is a Request, Not a Command**: Writing S2500 sets the spindle speed register to 2500 RPM. But the spindle does NOT start. It only starts when M03 (CW) or M04 (CCW) is commanded. You can set S on a separate line before M03, or combine them: S2500 M03 in the same block.',

      '**M03 vs M04 — Direction Matters**: M03 = clockwise (CW), viewed from above looking down the spindle. This is the correct direction for right-hand cutting tools (standard end mills, drills, reamers). M04 = counter-clockwise (CCW). Used for left-hand thread taps, back-boring bars, or certain specialized tools. Running a standard end mill in M04 causes immediate tool breakage.',

      '**G97 — The Mill Standard**: In G97 mode, S = RPM directly. S2500 = 2500 RPM regardless of tool diameter. This is what you use for virtually all milling operations. The controller does not adjust speed based on geometry.',

      '**G96 — The Lathe Intelligence**: In G96 mode, S = surface speed (cutting speed). For G20 (inch): S = surface feet per minute (SFM). For G21 (metric): S = meters per minute (m/min). The controller continuously calculates the required RPM as `RPM = (CSS × 1000) / (π × D)` where D is the current diameter. As the tool face-turns toward the center, RPM rises automatically. **G50 is critical on lathes** to set a maximum RPM clamp — without it, as D approaches zero, the equation gives infinite RPM and the machine will over-speed.',

      '**Coolant — Why and When**:\n' +
      '- **Flood (M08)**: A stream of cutting fluid aimed at the tool/material junction. Lubricates, cools, and flushes chips. Use for most milling and turning operations.\n' +
      '- **Mist (M07)**: A fine mist. Less effective cooling, less mess. Used where flood is problematic (ceramics that crack from thermal shock, or through-spindle air blast situations).\n' +
      '- **Through-Tool (M08 on appropriate machines)**: High-pressure coolant through the tool body and out the tip. Exceptional for deep drilling.\n' +
      '- **Air Blast**: Some machines implement coolant-off as a high-pressure air blast to clear chips. Check your machine\'s documentation for M-code assignments — they vary by manufacturer.',
    ],
  },

  math: {
    prose: [
      'The relationship between spindle speed (RPM), cutting speed (SFM or m/min), and tool diameter is:',
      '**Imperial (G20, SFM):**',
      '$$\\text{RPM} = \\frac{\\text{SFM} \\times 12}{\\pi \\times D_{\\text{in}}}$$',
      '**Metric (G21, m/min):**',
      '$$\\text{RPM} = \\frac{\\text{m/min} \\times 1000}{\\pi \\times D_{\\text{mm}}}$$',
      'Example: Cutting aluminum with a 1/2-inch (12.7 mm) end mill at 600 SFM (183 m/min):',
      '$$\\text{RPM} = \\frac{600 \\times 12}{\\pi \\times 0.5} = \\frac{7200}{1.571} \\approx 4580 \\text{ RPM}$$',
      'In G96 mode on a lathe turning from diameter 100mm to 10mm at S=200 (m/min):',
      '$$\\text{RPM at } \\phi100 = \\frac{200 \\times 1000}{\\pi \\times 100} \\approx 637 \\text{ RPM}$$',
      '$$\\text{RPM at } \\phi10 = \\frac{200 \\times 1000}{\\pi \\times 10} \\approx 6366 \\text{ RPM}$$',
      'Without a G50 clamp, this could blow past the spindle\'s maximum safe speed.',
    ],
  },

  rigor: {
    prose: [
      '**Spindle Speed Ramp-Up Time**: CNC spindles do not reach target RPM instantaneously. A spindle accelerating to 10,000 RPM may take 2–5 seconds depending on the motor, the load, and the spindle brake. Most controllers insert an automatic dwell after M03 to allow the spindle to ramp up before the next move executes. On older or budget controllers, you may need an explicit G04 dwell: `M03 S3000 G04 P2.0` (2-second dwell).',

      '**Spindle Load Feedback**: High-end controllers monitor spindle motor current as a proxy for cutting load. If load exceeds a threshold, the controller can automatically reduce feedrate (adaptive feed control). System variable `#3027` (Fanuc) gives spindle load percentage. This is used in advanced macro programming for adaptive machining.',

      '**M01 (Optional Stop) and Spindle**: M01 is an optional program stop controlled by the operator\'s M01 switch. When the switch is on, M01 stops the machine exactly like M00 — but does NOT automatically stop the spindle. The spindle continues running at M01. If your optional stop procedure involves examining the part, you should add M05 and M09 before M01 in the program.',

      '**Coolant Tank and Chip Management**: Flood coolant recirculates through a tank, filters, and pump. Chips accumulate in the tank. A tank that overflows or has blocked filters causes coolant pressure loss mid-program, burning tools. Real shops check coolant level and chip load before long programs.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-speed-calc',
      title: 'Calculating RPM for an End Mill',
      problem: 'Find the spindle speed for a 12mm carbide end mill cutting 6061 aluminum at 200 m/min (metric) and at 650 SFM (imperial).',
      steps: [
        { expression: 'Metric: RPM = (200 × 1000) / (π × 12)', annotation: '= 200,000 / 37.70 ≈ 5305 RPM → use S5300' },
        { expression: 'Imperial equivalent: D = 12mm / 25.4 = 0.472 inch', annotation: 'Convert diameter to inches' },
        { expression: 'Imperial: RPM = (650 × 12) / (π × 0.472)', annotation: '= 7800 / 1.483 ≈ 5260 RPM → use S5300' },
        { expression: 'Both give ≈ S5300 (same physical speed)', annotation: '200 m/min ≈ 656 SFM — consistent result' },
      ],
      conclusion: 'The metric and imperial calculations converge to the same RPM because they represent the same physical cutting speed. Always sanity-check by converting: 1 m/min = 3.281 SFM.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-spin-1',
        type: 'choice',
        text: 'You write S3000. Does the spindle start spinning immediately?',
        options: [
          'Yes — S-word starts the spindle at that speed',
          'No — S-word only sets the speed register; M03 or M04 is required to start',
          'No — you must also write G97',
          'Yes, but only if G96 is active',
        ],
        answer: 'No — S-word only sets the speed register; M03 or M04 is required to start',
      },
      {
        id: 'cnc-spin-2',
        type: 'choice',
        text: 'In G96 (CSS) mode on a lathe, what happens to RPM as the tool moves toward the center (smaller diameter)?',
        options: [
          'RPM stays constant',
          'RPM decreases proportionally',
          'RPM increases to maintain constant surface speed',
          'RPM is unaffected by G96',
        ],
        answer: 'RPM increases to maintain constant surface speed',
      },
      {
        id: 'cnc-spin-3',
        type: 'choice',
        text: 'What is G50 used for on a CNC lathe?',
        options: [
          'Set the work offset',
          'Cancel the tool length offset',
          'Clamp the maximum spindle speed to prevent over-revving in G96 mode',
          'Start the spindle in G96 mode',
        ],
        answer: 'Clamp the maximum spindle speed to prevent over-revving in G96 mode',
      },
      {
        id: 'cnc-spin-4',
        type: 'input',
        text: 'What M-code stops the spindle? ',
        answer: 'M05',
      },
    ]
  },

  mentalModel: [
    'S = speed register. M03/M04 = actually start it.',
    'M03 = CW (standard right-hand tools). M04 = CCW (special).',
    'G97 = fixed RPM (milling). G96 = constant surface speed (turning).',
    'G50 S[max] = lathe spindle speed clamp. Critical with G96.',
    'M08 = flood on. M09 = coolant off. Always off before tool changes.',
    'RPM = (SFM × 12) / (π × D_in) or (m/min × 1000) / (π × D_mm)',
  ],
}
