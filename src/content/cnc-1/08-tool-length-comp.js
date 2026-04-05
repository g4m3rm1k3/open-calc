export default {
  id: 'cnc-tool-length-comp',
  slug: 'tool-length-compensation',
  chapter: 'cnc-1',
  order: 8,
  title: 'Tool Length Compensation',
  subtitle: 'G43 / G44 / G49 — Making Every Tool Tip Reach the Same Z Zero',
  tags: ['G43', 'G44', 'G49', 'H-word', 'tool length offset', 'TLO', 'Z-axis', 'tool setup'],

  semantics: {
    core: [
      { symbol: 'G43', meaning: 'Apply Positive Tool Length Offset: Adds the H-register value to all Z-axis commands. The controller compensates for the tool\'s length so the programmed Z=0 corresponds to the tool TIP at the part surface.' },
      { symbol: 'G44', meaning: 'Apply Negative Tool Length Offset: Subtracts the H-register value. Rarely used in practice. Most setups use G43.' },
      { symbol: 'G49', meaning: 'Cancel Tool Length Offset: Disables any active TLO. Z-commands go to the spindle gauge line, not the tool tip.' },
      { symbol: 'H-Word', meaning: 'Offset Register Number: Specifies which row in the tool offset table to read. H1 reads the offset stored for tool 1. H0 = no offset (same as G49).' },
      { symbol: 'Gauge Line', meaning: 'The spindle\'s reference plane — the face of the spindle nose or tool holder interface. Z coordinates without G43 reference this plane, not the tool tip.' },
      { symbol: 'Tool Touch-Off', meaning: 'The measurement process: touching each tool to a known Z surface and recording the difference (tool length) into the H-offset register.' },
    ],
    rulesOfThumb: [
      'G43 H[n] must be activated after every tool change before any Z move. Forgetting it causes Z crashes.',
      'The H number should match the T number: T1 uses G43 H1, T3 uses G43 H3. This keeps setups sane.',
      'G43 H0 = G49. Writing H0 explicitly cancels the offset.',
      'All tools in a program reference the same Z=0 datum (part surface) — G43 makes that possible regardless of tool length.',
    ]
  },

  hook: {
    question: 'If a 10mm end mill and a 50mm drill are both called with Z-5.0, how does the controller know the right depth for each — given they extend to completely different lengths from the spindle?',
    realWorldContext:
      'A machining center can hold 40 different tools. A 6mm short stub end mill might extend only 35mm below the spindle gauge line. ' +
      'A long boring bar might extend 150mm. Both are in the same spindle, same Z-axis. ' +
      'Without compensation, programming Z-5.0 for the boring bar would send the spindle to the same MACHINE position for both tools — ' +
      'the short tool wouldn\'t even touch the part, and the boring bar would crash through it. ' +
      'Tool Length Compensation (G43) is the mechanism that corrects for each tool\'s actual length, ' +
      'so that Z=0 in your program always means "the tip of this tool is at the part surface", regardless of which tool is active.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'Tool Length Offset — Visual Explanation',
            cells: [
              {
                type: 'js',
                title: 'Two Tools, Same Z Command — With and Without G43',
                html: `<canvas id="c" width="700" height="360" style="display:block;max-width:100%;border-radius:8px;background:#0f172a"></canvas>
<div style="display:flex;gap:10px;justify-content:center;margin-top:10px">
  <button id="noG43" style="padding:7px 16px;border-radius:5px;border:none;background:#f87171;color:#0f172a;font:bold 12px monospace;cursor:pointer">Without G43 (dangerous)</button>
  <button id="withG43" style="padding:7px 16px;border-radius:5px;border:none;background:#4ade80;color:#0f172a;font:bold 12px monospace;cursor:pointer">With G43 (correct)</button>
</div>`,
                css: `body{margin:0;background:#0f172a;padding:12px;font-family:monospace;display:flex;flex-direction:column;align-items:center}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');

const spindle1X = 180, spindle2X = 500;
const spindleY = 40;
const partSurface = 260;
const programmedZ = partSurface + 10; // Z=-5 means 5 below surface
const matBottom = 330;

const tool1Length = 60;   // short end mill
const tool2Length = 140;  // long drill

const T = { text:'#94a3b8', green:'#4ade80', red:'#f87171', blue:'#38bdf8', amber:'#fbbf24', mat:'#1e293b', matBorder:'#475569' };

function drawSpindle(cx, label) {
  ctx.fillStyle = '#334155'; ctx.strokeStyle='#475569'; ctx.lineWidth=2;
  ctx.fillRect(cx-20, spindleY, 40, 30);
  ctx.strokeRect(cx-20, spindleY, 40, 30);
  ctx.fillStyle = T.text; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText('Spindle', cx, spindleY-5);
  ctx.fillText('Gauge Line', cx+50, spindleY+18);
  ctx.strokeStyle='#475569'; ctx.setLineDash([4,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx+25, spindleY+15); ctx.lineTo(W-50, spindleY+15); ctx.stroke();
  ctx.setLineDash([]);
}

function drawTool(cx, tipY, length, color, label) {
  const bodyW = 12;
  ctx.fillStyle = color; ctx.strokeStyle='#fff'; ctx.lineWidth=1.5;
  ctx.fillRect(cx-bodyW/2, tipY-length, bodyW, length-8);
  ctx.beginPath(); ctx.moveTo(cx-bodyW/2, tipY-8); ctx.lineTo(cx, tipY); ctx.lineTo(cx+bodyW/2, tipY-8); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = T.text; ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillText(label, cx+10, tipY-length/2+4);
}

function drawScene(withComp) {
  ctx.clearRect(0,0,W,H);

  // Part
  ctx.fillStyle = T.mat;
  ctx.fillRect(40, partSurface, W-80, matBottom-partSurface);
  ctx.strokeStyle = T.matBorder; ctx.lineWidth=1.5;
  ctx.strokeRect(40, partSurface, W-80, matBottom-partSurface);
  ctx.fillStyle='#475569'; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText('Material (Z=0 = top surface)', W/2, partSurface + (matBottom-partSurface)/2 + 4);

  // Z=0 reference line
  ctx.strokeStyle='#38bdf8'; ctx.lineWidth=1.5; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(40, partSurface); ctx.lineTo(W-40, partSurface); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#38bdf8'; ctx.font='12px monospace'; ctx.textAlign='right';
  ctx.fillText('Z=0 (part surface)', W-44, partSurface-5);

  // Programmed target: Z-5
  const targetY = partSurface + 10;
  ctx.strokeStyle='#fbbf24'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(40, targetY); ctx.lineTo(W-40, targetY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#fbbf24'; ctx.textAlign='right'; ctx.font='11px monospace';
  ctx.fillText('Z-5.0 (programmed depth)', W-44, targetY-3);

  // Spindles
  drawSpindle(spindle1X, 'T1');
  drawSpindle(spindle2X, 'T2');

  // Title labels
  ctx.fillStyle='#94a3b8'; ctx.font='12px monospace'; ctx.textAlign='center';
  ctx.fillText('Tool 1: Short End Mill', spindle1X, spindleY-20);
  ctx.fillText('(H offset = 35mm)', spindle1X, spindleY-8);
  ctx.fillText('Tool 2: Long Drill', spindle2X, spindleY-20);
  ctx.fillText('(H offset = 115mm)', spindle2X, spindleY-8);

  if(!withComp) {
    // Without G43: both tools send Z (spindleY+30) to the SAME machine position
    // Machine Z target corresponds to targetY from gauge line
    const gaugeLine = spindleY + 15;
    const machineZ = targetY - gaugeLine; // distance from gauge line to programmed Z

    // Tool 1 tip: spindleY+30 + machineZ travel
    const tip1Y = gaugeLine + machineZ;
    // Tool 2 tip: same spindle position
    const tip2Y = gaugeLine + machineZ;

    drawTool(spindle1X, tip1Y - (tool1Length - 30), tool1Length, '#94a3b8', 'L=60mm');
    drawTool(spindle2X, tip2Y + (tool2Length - 30), tool2Length, '#94a3b8', 'L=140mm');

    // Tip markers and labels
    ctx.fillStyle = T.red; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText('⚠ Tip ABOVE surface', spindle1X+14, tip1Y-(tool1Length-30)+4);
    ctx.fillText('⚠ CRASH: 50mm too deep!', spindle2X+14, tip2Y+(tool2Length-30)+4);

    ctx.fillStyle=T.red; ctx.font='bold 13px monospace'; ctx.textAlign='center';
    ctx.fillText('WITHOUT G43: Both tools at same MACHINE position. Wrong!', W/2, H-10);

  } else {
    // With G43: each tool tip reaches the programmed Z depth correctly
    const tip1Y = targetY;  // tip at Z-5
    const tip2Y = targetY;  // tip also at Z-5

    drawTool(spindle1X, tip1Y, tool1Length, T.green, 'L=60mm');
    drawTool(spindle2X, tip2Y, tool2Length, T.amber, 'L=140mm');

    ctx.fillStyle = T.green; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText('✓ Tip at Z-5 (correct)', spindle1X+14, tip1Y+12);
    ctx.fillText('✓ Tip at Z-5 (correct)', spindle2X+14, tip2Y+12);

    ctx.fillStyle=T.green; ctx.font='bold 13px monospace'; ctx.textAlign='center';
    ctx.fillText('WITH G43: Both tool tips reach programmed Z. Correct!', W/2, H-10);
  }
}

drawScene(false);
document.getElementById('noG43').addEventListener('click', ()=>drawScene(false));
document.getElementById('withG43').addEventListener('click', ()=>drawScene(true));
`
              }
            ]
          }
        },
        title: 'G43 Tool Length Offset Visualizer',
        caption: 'Toggle between "without G43" and "with G43". Without compensation, the short tool never reaches depth while the long tool crashes. With G43, both tool tips reach the correct programmed Z depth. This is why G43 must be active for every cutting operation.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(TOOL LENGTH COMPENSATION EXAMPLE)\n' +
            '(Two different tools, both cutting at Z-5)\n' +
            '\n' +
            'G21 G90 G40 G49 G80    (Safe start — G49 cancels any previous TLO)\n' +
            '\n' +
            '(--- OPERATION 1: End Mill ---)\n' +
            'T1 M06                 (End mill)\n' +
            'S2000 M03\n' +
            'G43 H1                 (Activate offset for tool 1)\n' +
            'G00 X10.0 Y10.0 Z5.0   (Rapid to start with TLO active)\n' +
            'G01 Z-5.0 F50          (Plunge — TLO ensures tip hits Z-5)\n' +
            'G01 X50.0 F150\n' +
            'G00 Z5.0\n' +
            'M05\n' +
            '\n' +
            '(--- OPERATION 2: Drill ---)\n' +
            'T2 M06                 (Drill — different length!)\n' +
            'S1000 M03\n' +
            'G43 H2                 (New offset for tool 2 — controller adjusts Z)\n' +
            'G99 G81 Z-15.0 R2.0 F60\n' +
            'X10.0 Y30.0\n' +
            'X30.0\n' +
            'X50.0\n' +
            'G80\n' +
            'M05\n' +
            '\n' +
            'G49                    (Cancel TLO at end)\n' +
            'G91 G28 Z0\n' +
            'G90 G28 X0 Y0\n' +
            'M30'
        },
        title: 'Multi-Tool Program With G43',
        caption: 'Notice: G43 H1 for tool 1, then G43 H2 for tool 2. Each activates a different stored length offset. Despite different physical lengths, both tools produce moves referenced to the same Z=0 datum.',
      }
    ],
    prose: [
      '**The Core Problem**: A CNC spindle can hold tools of wildly different lengths. If the controller simply commands "move Z to -5.0 from work zero," it is moving the SPINDLE GAUGE LINE (the reference plane on the spindle face) to -5.0. For a 60mm tool, the tip would be at 60 - 5 = 55mm ABOVE the part. For a 120mm tool at the same spindle position, the tip would be 115mm below the gauge, which might be 110mm below the part surface. Neither is correct.',

      '**How G43 Fixes This**: When you measure each tool\'s length (using a tool presetter or by touching off to a known Z surface) and store that measurement in the H-register, the controller knows: "When tool 1 is active, I need to move the spindle Z mm higher than programmed to put the tip at the right place." G43 tells the controller to apply this adjustment to every Z move. The offset stored in H1 is added to every Z position, effectively lowering the gauge line concept to the tool tip.',

      '**Measuring Tool Length**: Two common methods:\n' +
      '1. **Tool Presetter**: A dedicated gauge instrument that measures tool length offline. Values are entered manually or transferred digitally to the controller offset table.\n' +
      '2. **Touch-Off**: With the tool mounted, jog the Z axis until the tool tip just touches a known reference surface (the part surface, a gauge block, or the machine table). Read the Z machine coordinate and store it as the H-offset.',

      '**Always Match H to T**: The convention is T1/H1, T2/H2, T3/H3, etc. When you write `G43 H3`, you are reading the offset stored for tool 3. Mixing them up — writing `G43 H5` when tool 3 is mounted — gives a wrong Z depth with no alarm. The controller cannot check that you used the right H value for the mounted tool.',
    ],
  },

  math: {
    prose: [
      'Let $H_n$ be the tool length stored in register $n$, and $Z_{\\text{prog}}$ be the programmed Z value.',
      'With G43 active, the actual machine Z movement (in machine coordinates) is:',
      '$$Z_{\\text{machine}} = Z_{\\text{prog}} + Z_{\\text{WCS offset}} + H_n$$',
      'Without G43 (or with G49), the machine moves the gauge line to the programmed Z:',
      '$$Z_{\\text{machine}} = Z_{\\text{prog}} + Z_{\\text{WCS offset}}$$',
      'The difference $H_n$ is the tool length compensation. For a tool that extends 80mm below the gauge line, $H_n = 80$. ' +
      'When G43 is active and $Z_{\\text{prog}} = 0$, the machine moves the spindle 80mm higher than it would without compensation, ' +
      'placing the tip exactly at Z=0 (the part surface).',
    ],
  },

  rigor: {
    prose: [
      '**Wear Offsets vs Geometry Offsets**: On Fanuc 0i and later, the offset table has separate columns for "geometry" (the tool length) and "wear" (small corrections for tool wear). G43 applies BOTH. The wear offset is for fine-tuning: if a part measures 0.05mm too deep, you can enter +0.05 in the wear column without changing the geometry value. This separates setup data from production fine-tuning.',

      '**Dynamic TLO (G43.1/G43.4/G43.5)**: On 5-axis machines, G43.1 activates a more complex tool length compensation that accounts for the orientation of the tool axis (when the table or head is tilted, the effective Z component changes). This is beyond the scope of basic programming but important to know exists.',

      '**Changing Tools Mid-Program**: Every time you call M06 for a tool change, you MUST follow it with G43 H[new tool]. The previous G43 remains technically active in the modal state, but it holds the previous tool\'s H value. Failing to update G43 after a tool change is a guaranteed crash for any operation where the new tool is a different length.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-tlo-calc',
      title: 'What Happens When G43 Is Missing',
      problem: 'Tool 1 offset (H1) = 75mm. Programmed: G01 Z-5.0 (part surface at machine Z=200). Compare the actual machine Z with and without G43.',
      steps: [
        { expression: 'Work offset Z: machine Z 200 = program Z 0', annotation: 'Part surface is at machine Z=200.' },
        { expression: 'Without G43: Z_machine = -5 + 200 = 195', annotation: 'Spindle gauge line at Z=195. Tool tip at 195 - 75 = 120mm machine Z. That is 80mm ABOVE the part!' },
        { expression: 'With G43 H1: Z_machine = -5 + 200 + 75 = 270', annotation: 'Spindle gauge line at Z=270. Tool tip at 270 - 75 = 195mm machine Z. That is exactly 5mm below Z=200 — correct!' },
      ],
      conclusion: 'Without G43, the tip is 80mm above the part — it never cuts anything. The offset of 75mm must be added to ALL Z moves via G43.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-tlo-1',
        type: 'choice',
        text: 'What does G43 H2 do?',
        options: [
          'Moves the tool to Z=2',
          'Activates tool length compensation using the value stored in offset register H2',
          'Sets the tool number to 2',
          'Cancels the previous tool length offset',
        ],
        answer: 'Activates tool length compensation using the value stored in offset register H2',
      },
      {
        id: 'cnc-tlo-2',
        type: 'choice',
        text: 'You change to tool T5 with M06 but forget to update G43 to H5. What happens?',
        options: [
          'The controller triggers an alarm',
          'The compensation for the previous tool remains active — Z depth is wrong for T5',
          'G43 automatically updates to the correct H value',
          'The tool change is cancelled',
        ],
        answer: 'The compensation for the previous tool remains active — Z depth is wrong for T5',
      },
      {
        id: 'cnc-tlo-3',
        type: 'choice',
        text: 'What G-code cancels tool length compensation?',
        options: ['G43', 'G44', 'G49', 'G80'],
        answer: 'G49',
      },
    ]
  },

  mentalModel: [
    'G43 H[n] = "use the stored length of tool n to correct all Z moves."',
    'Without G43: Z commands reference the spindle gauge line (wrong for most operations).',
    'Always G43 after every tool change. Always match H number to T number.',
    'G49 cancels TLO. Include it in the safe start block.',
    'H-offset = distance from spindle gauge line to tool tip (stored in offset table).',
  ],
}
