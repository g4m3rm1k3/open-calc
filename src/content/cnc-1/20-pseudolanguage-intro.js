export default {
  id: 'cnc-pseudolanguage',
  slug: 'programming-pseudolanguage',
  chapter: 'cnc-1',
  order: 20,
  title: 'Programming Logic: A Pseudolanguage Primer',
  subtitle: 'Using Python to Understand CNC Macro Logic Before the # Symbol',
  tags: ['pseudocode', 'pseudolanguage', 'Python', 'variables', 'logic', 'if', 'while', 'programming concepts', 'Okuma VC', 'Fanuc macro'],

  semantics: {
    core: [
      { symbol: 'Pseudolanguage', meaning: 'A programming language used solely for teaching concepts — not tied to any real machine. Focuses on the idea, not the syntax. We use Python because it runs in the browser and reads like plain English.' },
      { symbol: 'Variable', meaning: 'A named storage box that holds a number. The name is for humans to read; the machine only sees the value inside. diameter = 25.4 → the box "diameter" holds the value 25.4.' },
      { symbol: 'Assignment (=)', meaning: 'Putting a value into a variable box. x = 5 means "store 5 in the box named x." It is NOT a mathematical equality — it is an action.' },
      { symbol: 'Expression', meaning: 'Any calculation that produces a single value. x + 2 is an expression. RPM * flutes * chip_load is an expression. Expressions always reduce to one number.' },
      { symbol: 'Condition', meaning: 'A comparison that is either True or False. x > 0, depth == 5.0, count != 10 are all conditions. They drive decisions and loops.' },
      { symbol: 'IF / ELSE', meaning: 'A decision structure: "If the condition is True, execute Block A. Otherwise, execute Block B." The program takes one of two paths.' },
      { symbol: 'WHILE loop', meaning: 'A repetition structure: "Check the condition. If True, execute the body, then go back and check again. If False, skip the body and continue." Repeats until condition is False.' },
      { symbol: 'Fanuc #variable', meaning: 'Fanuc Macro B syntax for a variable. #100 = 25.4 stores 25.4 in slot 100. X#100 uses slot 100 as an X-axis coordinate.' },
      { symbol: 'Okuma VC variable', meaning: 'Okuma OSP syntax for a variable. VC100 = 25.4 is identical in concept to #100 = 25.4 in Fanuc. VC = Variable Common.' },
      { symbol: 'Siemens R variable', meaning: 'Siemens 840D syntax. R100 = 25.4. Same concept, different letter. R = Register.' },
    ],
    rulesOfThumb: [
      'Every programming language ever built has: variables, arithmetic, IF, and WHILE. The syntax differs — the ideas are universal.',
      'Assignment (=) is an action, not equality. x = x + 1 is valid: "add 1 to x and store the result back in x."',
      'A condition is always True or False — nothing in between.',
      'An infinite loop (WHILE True with no exit) hangs a CNC program permanently. The machine must be E-stopped.',
      'Fanuc trig (SIN/COS) takes DEGREES. Python math.sin() takes RADIANS. This is the single most common translation error.',
    ]
  },

  hook: {
    question: 'What does it mean to "program" something — and why does a CNC controller need a programming language at all?',
    realWorldContext:
      'When you write `G01 X50.0 F200`, you are giving one explicit instruction: move to X=50 at 200mm/min. ' +
      'That works fine for simple parts. But what if you need to drill 48 holes on a bolt circle? ' +
      'Writing 48 individual lines works — but what if the customer then asks for 36 holes, or 60? ' +
      'You would rewrite the whole program. \n\n' +
      'A Fanuc Macro B program solves this differently. You store the number of holes in a variable (`#100 = 48`). ' +
      'A loop computes each hole position from the angle (`#103 = 360 / #100 * counter`). ' +
      'Change one number and the program adapts. That is **parametric programming** — and it requires understanding three things: variables, conditions, and loops. ' +
      'We learn all three using Python first, then translate to Fanuc, Okuma, and Siemens syntax.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'Control Flow — Visual Walkthroughs',
            cells: [
              {
                type: 'js',
                title: 'IF / ELSE — Decision Flowchart',
                html: `
<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px">
  <div style="display:flex;gap:24px;align-items:center;margin-bottom:8px">
    <label style="color:#94a3b8;font-size:12px;font-family:monospace">depth_of_cut = </label>
    <input id="depthInput" type="number" value="8" min="0" max="20" step="0.5"
      style="background:#0f172a;border:1px solid #475569;border-radius:4px;color:#38bdf8;
             padding:5px 10px;font-family:monospace;font-size:14px;width:80px">
    <label style="color:#94a3b8;font-size:12px;font-family:monospace">mm&nbsp;&nbsp;|&nbsp;&nbsp;max_depth = 6.0 mm</label>
  </div>
  <canvas id="c" width="660" height="380" style="border-radius:8px;max-width:100%;display:block"></canvas>
  <div id="verdict" style="font-family:monospace;font-size:13px;padding:10px 20px;border-radius:6px;min-width:400px;text-align:center"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');
const inp = document.getElementById('depthInput');
const verdict = document.getElementById('verdict');

function box(x, y, w, h, bg, border, text, textColor='#e2e8f0', fontSize=12) {
  ctx.fillStyle = bg; ctx.strokeStyle = border; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x,y,w,h,6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = textColor; ctx.font = fontSize + 'px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  const lines = text.split('\\n');
  lines.forEach((l,i) => ctx.fillText(l, x+w/2, y+h/2 + (i-(lines.length-1)/2)*16));
}

function diamond(x, y, w, h, bg, border, text, textColor='#e2e8f0') {
  ctx.fillStyle = bg; ctx.strokeStyle = border; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x+w/2, y); ctx.lineTo(x+w, y+h/2); ctx.lineTo(x+w/2, y+h); ctx.lineTo(x, y+h/2);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = textColor; ctx.font = '12px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  const lines = text.split('\\n');
  lines.forEach((l,i) => ctx.fillText(l, x+w/2, y+h/2 + (i-(lines.length-1)/2)*16));
}

function arrow(x1,y1,x2,y2,label='',color='#475569') {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  // arrowhead
  const ang = Math.atan2(y2-y1, x2-x1);
  ctx.beginPath(); ctx.moveTo(x2,y2);
  ctx.lineTo(x2-10*Math.cos(ang-0.4), y2-10*Math.sin(ang-0.4));
  ctx.lineTo(x2-10*Math.cos(ang+0.4), y2-10*Math.sin(ang+0.4));
  ctx.closePath(); ctx.fill();
  if(label) {
    ctx.fillStyle='#94a3b8'; ctx.font='11px monospace'; ctx.textAlign='center';
    ctx.fillText(label, (x1+x2)/2+8, (y1+y2)/2-6);
  }
}

function draw() {
  const depth = parseFloat(inp.value) || 8;
  const MAX = 6.0;
  const cond = depth > MAX;

  ctx.clearRect(0,0,W,H);

  // ── Layout constants ──
  const CX = W/2;
  const startY=30, condY=100, bodyYes=210, bodyNo=210, mergeY=310;
  const BW=180, BH=50, DW=220, DH=70;

  // START box
  box(CX-BW/2, startY, BW, BH, '#1e293b', '#475569', 'START\\ndepth = ' + depth.toFixed(1) + ' mm', '#e2e8f0', 11);
  arrow(CX, startY+BH, CX, condY);

  // CONDITION diamond — highlight based on value
  const dColor = cond ? '#fbbf24' : '#38bdf8';
  diamond(CX-DW/2, condY, DW, DH, cond?'rgba(251,191,36,0.15)':'rgba(56,189,248,0.15)',
    dColor, 'depth > MAX_DEPTH?\\n(' + depth.toFixed(1) + ' > 6.0)');

  // YES branch (left, red)
  const yesX = CX - 160;
  const yesColor = cond ? '#f87171' : '#475569';
  arrow(CX-DW/2, condY+DH/2, yesX+BW, bodyYes+BH/2, 'YES', yesColor);
  box(yesX-BW/2+10, bodyYes, BW+10, BH+10,
    cond?'rgba(248,113,113,0.2)':'#1e293b', cond?'#f87171':'#334155',
    'ERROR: Too Deep\\n#3000 = 1 (ALARM)', cond?'#f87171':'#475569', 11);
  if(cond) {
    ctx.fillStyle='#f87171'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.fillText('← Active path', yesX, bodyYes-10);
  }

  // NO branch (right, green)
  const noX = CX + 160;
  const noColor = !cond ? '#34d399' : '#475569';
  arrow(CX+DW/2, condY+DH/2, noX-BW/2-10, bodyNo+BH/2, 'NO', noColor);
  box(noX-BW/2-10, bodyNo, BW+10, BH+10,
    !cond?'rgba(52,211,153,0.2)':'#1e293b', !cond?'#34d399':'#334155',
    'OK: Execute Cut\\nG01 Z-' + depth.toFixed(1) + ' F50', !cond?'#34d399':'#475569', 11);
  if(!cond) {
    ctx.fillStyle='#34d399'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.fillText('Active path →', noX, bodyNo-10);
  }

  // Merge arrows to bottom
  const leftBx  = yesX - BW/2 + 10;
  const rightBx = noX  - BW/2 - 10;
  const botY = bodyYes + BH + 10;
  arrow(leftBx  + (BW+10)/2, botY, CX-40, mergeY, '', cond?'#f87171':'#334155');
  arrow(rightBx + (BW+10)/2, botY, CX+40, mergeY, '', !cond?'#34d399':'#334155');

  // Continue box
  box(CX-BW/2, mergeY, BW, BH, '#1e293b', '#475569', 'CONTINUE\\nprogram...', '#94a3b8', 11);

  // Code sidebar
  ctx.fillStyle='#334155'; ctx.lineWidth=1;
  ctx.fillRect(W-200, 0, 200, H);
  ctx.fillStyle='#94a3b8'; ctx.font='11px monospace'; ctx.textAlign='left';
  const codeLines = [
    'Python pseudocode:','',
    'MAX_DEPTH = 6.0',
    'depth = ' + depth.toFixed(1),
    '',
    'if depth > MAX_DEPTH:',
    '    ALARM()',
    'else:',
    '    G01_Z(-depth)',
    '    # cut ...',
    '',
    '─────────────────',
    'Fanuc Macro B:','',
    '#100 = ' + depth.toFixed(1),
    '#101 = 6.0',
    'IF [#100 GT #101]',
    '  GOTO 100',
    'G01 Z-#100 F50',
    'GOTO 200',
    'N100 #3000=1',
    'N200 M30',
  ];
  codeLines.forEach((l,i) => {
    const active = (i===3 && true) || (cond && (i>=15&&i<=17)) || (!cond && i===17);
    ctx.fillStyle = active ? '#fbbf24' : (l.startsWith('#')||l.startsWith('N') ? '#a78bfa' : '#94a3b8');
    ctx.fillText(l, W-196, 18 + i*16);
  });

  // verdict
  verdict.style.background = cond ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)';
  verdict.style.border = '1px solid ' + (cond ? '#f87171' : '#34d399');
  verdict.style.color = cond ? '#f87171' : '#34d399';
  verdict.textContent = cond
    ? '⚠  depth (' + depth.toFixed(1) + ') > MAX_DEPTH (6.0) → condition is TRUE → take the YES branch → ALARM'
    : '✓  depth (' + depth.toFixed(1) + ') ≤ MAX_DEPTH (6.0) → condition is FALSE → take the NO branch → CUT';
}

inp.addEventListener('input', draw);
draw();
`
              },
              {
                type: 'js',
                title: 'WHILE Loop — Step-by-Step Execution Tracer',
                html: `
<div style="padding:12px;display:flex;flex-direction:column;align-items:center;gap:12px">
  <div style="display:flex;gap:10px;align-items:center">
    <button id="btnStep" style="padding:8px 20px;border-radius:5px;border:none;background:#38bdf8;color:#0f172a;font:bold 13px monospace;cursor:pointer">▶ Step</button>
    <button id="btnReset" style="padding:8px 16px;border-radius:5px;border:none;background:#334155;color:#e2e8f0;font:13px monospace;cursor:pointer">↺ Reset</button>
    <span id="status" style="font-family:monospace;font-size:12px;color:#94a3b8"></span>
  </div>
  <canvas id="c" width="700" height="400" style="border-radius:8px;max-width:100%;display:block"></canvas>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace}`,
                startCode: `
const c = document.getElementById('c');
const W = c.width, H = c.height;
const ctx = c.getContext('2d');
const statusEl = document.getElementById('status');

// Loop: drill holes at x = 10, 30, 50, 70, 90 (step 20, while x <= 90)
// State machine: 0=init 1=check 2=body 3=increment 4=done
let state = 0;
let x_pos = 10.0;
let holes = [];
const X_START=10, X_STEP=20, X_END=90;

const PHASES = ['Initialize', 'Check Condition', 'Execute Body', 'Increment', 'Loop Done'];
const PHASE_COLORS = ['#a78bfa','#fbbf24','#34d399','#38bdf8','#94a3b8'];

function codeLines() {
  return [
    { text: '#100 = 10.0        (x_pos)',     phase: 0 },
    { text: '#101 = 20.0        (x_step)',    phase: 0 },
    { text: '#102 = 90.0        (x_end)',     phase: 0 },
    { text: '',                               phase: -1 },
    { text: 'WHILE [#100 LE #102] DO 1',      phase: 1 },
    { text: '  G00 X#100 Y0',                 phase: 2 },
    { text: '  G81 Z-10 R2 F60',             phase: 2 },
    { text: '  #100 = [#100 + #101]',         phase: 3 },
    { text: 'END 1',                          phase: [1,3] },
    { text: '',                               phase: -1 },
    { text: 'G80',                            phase: 4 },
  ];
}

function draw() {
  ctx.clearRect(0,0,W,H);

  // ── Code panel (left) ──
  const CPW = 320, lines = codeLines();
  ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.roundRect(12,12,CPW,H-24,8); ctx.fill();
  ctx.fillStyle='#475569'; ctx.font='11px monospace'; ctx.textAlign='left';
  ctx.fillText('Fanuc Macro B:', 24, 34);
  ctx.fillStyle='#94a3b8'; ctx.fillText('(Python equivalent below each line)', 24, 48);

  lines.forEach((l,i) => {
    if(l.text==='') return;
    const phases = Array.isArray(l.phase) ? l.phase : [l.phase];
    const active = phases.includes(state);
    const y = 65 + i*22;
    if(active) {
      ctx.fillStyle='rgba(251,191,36,0.2)';
      ctx.fillRect(18, y-13, CPW-12, 20);
      ctx.strokeStyle='#fbbf24'; ctx.lineWidth=1;
      ctx.strokeRect(18, y-13, CPW-12, 20);
      ctx.fillStyle='#fbbf24';
    } else {
      ctx.fillStyle = l.phase === -1 ? '#334155' : '#64748b';
    }
    ctx.font=(active?'bold ':'')+'12px monospace';
    ctx.fillText(l.text, 26, y);
  });

  // Python equiv (below code panel)
  const pyY = 65 + lines.length*22 + 10;
  ctx.fillStyle='#334155';
  ctx.fillRect(12, pyY, CPW, 80);
  ctx.fillStyle='#94a3b8'; ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillText('Python equiv:', 24, pyY+14);
  const pyLines = ['x_pos = 10.0','while x_pos <= 90.0:','    G81(x_pos)','    x_pos += 20.0'];
  pyLines.forEach((l,i)=>{
    const a=(i===0&&state===0)||(i===1&&(state===1||state===4))||(i===2&&state===2)||(i===3&&state===3);
    ctx.fillStyle=a?'#4ade80':'#475569';
    ctx.font=(a?'bold ':'')+'11px monospace';
    ctx.fillText(l, 24, pyY+28+i*14);
  });

  // ── Variable state panel (right) ──
  const VX = CPW + 28;
  ctx.fillStyle='#1e293b';
  ctx.beginPath(); ctx.roundRect(VX, 12, 200, 160, 8); ctx.fill();
  ctx.fillStyle='#475569'; ctx.font='11px monospace'; ctx.textAlign='left';
  ctx.fillText('Variable State:', VX+12, 34);
  const vars = [
    { name:'x_pos  / #100', val: x_pos.toFixed(1), changed: state===0||state===3 },
    { name:'x_step / #101', val: '20.0', changed: state===0 },
    { name:'x_end  / #102', val: '90.0', changed: state===0 },
  ];
  vars.forEach((v,i)=>{
    const y2 = 52 + i*36;
    ctx.fillStyle = v.changed ? 'rgba(56,189,248,0.15)' : '#0f172a';
    ctx.beginPath(); ctx.roundRect(VX+10,y2-13,180,28,4); ctx.fill();
    ctx.strokeStyle = v.changed ? '#38bdf8' : '#334155'; ctx.lineWidth=1;
    ctx.strokeRect(VX+10,y2-13,180,28);
    ctx.fillStyle=v.changed?'#38bdf8':'#94a3b8'; ctx.font='11px monospace';
    ctx.fillText(v.name+' =', VX+16, y2+1);
    ctx.fillStyle=v.changed?'#4ade80':'#fbbf24'; ctx.font='bold 13px monospace'; ctx.textAlign='right';
    ctx.fillText(v.val, VX+185, y2+1);
    ctx.textAlign='left';
  });

  // ── Condition evaluation ──
  ctx.fillStyle='#1e293b';
  ctx.beginPath(); ctx.roundRect(VX, 185, 200, 70, 8); ctx.fill();
  ctx.fillStyle='#475569'; ctx.font='11px monospace';
  ctx.fillText('Condition:', VX+12, 205);
  if(state >= 1) {
    const cond = x_pos <= X_END;
    ctx.fillStyle='#64748b'; ctx.font='12px monospace';
    ctx.fillText(x_pos.toFixed(1) + ' ≤ 90.0', VX+16, 222);
    ctx.fillStyle = cond ? '#34d399' : '#f87171';
    ctx.font='bold 13px monospace';
    ctx.fillText(cond ? '→ TRUE → enter loop' : '→ FALSE → exit loop', VX+16, 242);
  }

  // ── Toolpath visualization ──
  const TX = VX, TY = 270, TW = 355, TH = 110;
  ctx.fillStyle='#1e293b';
  ctx.beginPath(); ctx.roundRect(TX, TY, TW, TH, 8); ctx.fill();
  ctx.fillStyle='#475569'; ctx.font='11px monospace'; ctx.textAlign='left';
  ctx.fillText('Toolpath (top view):', TX+12, TY+18);

  // Draw material
  ctx.fillStyle='rgba(51,65,85,0.5)';
  ctx.fillRect(TX+12, TY+28, TW-24, 50);
  ctx.strokeStyle='#475569'; ctx.lineWidth=1;
  ctx.strokeRect(TX+12, TY+28, TW-24, 50);

  // Draw X axis positions
  const xPositions = [10,30,50,70,90];
  xPositions.forEach((xp,i) => {
    const px = TX+12 + (i/(xPositions.length-1)) * (TW-28);
    const isHole = holes.includes(xp);
    const isCurrent = xp === x_pos && state===2;

    if(isHole || isCurrent) {
      ctx.fillStyle = isCurrent ? '#fbbf24' : '#34d399';
      ctx.beginPath(); ctx.arc(px, TY+53, isHole?8:5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('●', px, TY+53);
      ctx.textBaseline='alphabetic';
    }

    ctx.fillStyle='#64748b'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText('X'+xp, px, TY+92);
  });
  ctx.textAlign='left';

  // ── Phase indicator ──
  const PY = H-45;
  PHASES.forEach((p,i)=>{
    const active = i===state;
    ctx.fillStyle = active ? PHASE_COLORS[i] : '#1e293b';
    ctx.strokeStyle = active ? PHASE_COLORS[i] : '#334155'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(12 + i*130, PY, 118, 28, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = active ? '#0f172a' : '#475569';
    ctx.font=(active?'bold ':'')+'10px monospace'; ctx.textAlign='center';
    ctx.fillText(p, 12+i*130+59, PY+18);
  });

  statusEl.textContent = state===4 ? 'Loop finished \u2014 5 holes drilled' : \`Phase: \${PHASES[state]} (step \${state+1})\`;
}

document.getElementById('btnStep').addEventListener('click', () => {
  if(state === 0) { state = 1; }
  else if(state === 1) {
    if(x_pos <= X_END) state = 2;
    else state = 4;
  }
  else if(state === 2) { holes.push(x_pos); state = 3; }
  else if(state === 3) { x_pos += X_STEP; state = 1; }
  draw();
});
document.getElementById('btnReset').addEventListener('click', ()=>{
  state=0; x_pos=X_START; holes=[]; draw();
});
draw();
`
              },
            ]
          }
        },
        title: 'Control Flow — Interactive Visuals',
        caption: 'Left: drag the depth slider on the IF/ELSE flowchart to see which branch the program takes. Right: click Step on the WHILE loop tracer to execute one step at a time — watch the variable state change and the holes appear in the toolpath.',
      },
      {
        id: 'PythonNotebook',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1.1 — What Does "Programming" Actually Mean?',
              prose:
                'Before we touch a single line of G-code macro syntax, we need to answer a simpler question: what is a program?\n\n' +
                'A **program** is a list of instructions that a machine executes one at a time, in order, from top to bottom. ' +
                'That is literally all it is. When the machine finishes the last instruction, the program is done.\n\n' +
                'You already know this from G-code. The controller reads N10, executes it, reads N20, executes it, continues to M30. ' +
                'That IS programming — sequential execution of instructions.\n\n' +
                'What makes a *macro* different is three additional powers:\n' +
                '1. **Variables** — store a value and use it later (instead of writing the number every time)\n' +
                '2. **Conditions** — choose which instruction to execute next based on a test (IF)\n' +
                '3. **Loops** — go back and repeat a section (WHILE)\n\n' +
                'These three ideas — variables, conditions, loops — are the complete foundation of ALL programming. ' +
                'Every programming language ever invented is built from these three building blocks. ' +
                'Run the cell below. It is a program. Notice the three building blocks in it.',
              code:
                '# This is a complete program demonstrating all three building blocks\n' +
                '# ──────────────────────────────────────────────────────────────────\n' +
                '\n' +
                '# 1. VARIABLE — store a value with a name\n' +
                'n_holes = 6\n' +
                'radius  = 50.0\n' +
                '\n' +
                '# 2. LOOP — repeat something n_holes times\n' +
                'counter = 0\n' +
                'while counter < n_holes:\n' +
                '\n' +
                '    # 3. CONDITION — make a decision inside the loop\n' +
                '    if counter == 0:\n' +
                '        print(f"Hole {counter+1}: Starting position (12 o\'clock)")\n' +
                '    else:\n' +
                '        print(f"Hole {counter+1}: Rotated {360/n_holes * counter:.1f}° around the circle")\n' +
                '\n' +
                '    counter = counter + 1   # increment — move to next hole\n' +
                '\n' +
                'print(f"\\nDone. Drilled {n_holes} holes on a R{radius}mm circle.")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '1.2 — Variables: The Named Box',
              prose:
                'A **variable** is a named storage box. You give it a name, put a value inside, and can read or change that value at any time.\n\n' +
                'The `=` sign in programming does NOT mean "equals" as in math. It means **"store this value in this box."** ' +
                'This is called **assignment**. The action happens from right to left: evaluate the right side, store the result in the left side.\n\n' +
                '`x = 5` — evaluate `5` → store in box named `x`\n' +
                '`x = x + 1` — evaluate `x + 1` (which is `5 + 1 = 6`) → store 6 back in `x`\n\n' +
                'The box can hold different values at different times. It only holds one value at a time — the last thing stored in it.\n\n' +
                '**In CNC systems:**\n' +
                '- Fanuc: `#100 = 50.0` — box number 100 holds 50.0\n' +
                '- Okuma: `VC100 = 50.0` — VC = Variable Common, box 100 holds 50.0\n' +
                '- Siemens: `R100 = 50.0` — R = Register, box 100 holds 50.0\n' +
                '- Python: `radius = 50.0` — box named "radius" holds 50.0\n\n' +
                'Same concept. Different spellings.',
              code:
                '# Assignment: putting values into named boxes\n' +
                '\n' +
                'radius = 50.0        # Fanuc:  #100 = 50.0\n' +
                'depth  = 15.0        # Fanuc:  #101 = 15.0\n' +
                'n_holes = 6          # Fanuc:  #102 = 6.0\n' +
                '\n' +
                'print(f"radius  = {radius}")    # Reading from the box\n' +
                'print(f"depth   = {depth}")\n' +
                'print(f"n_holes = {n_holes}")\n' +
                '\n' +
                '# Changing a value: = is an action, not equality\n' +
                'print(f"\\nBefore: radius = {radius}")\n' +
                'radius = radius * 2   # Fanuc: #100 = [#100 * 2]\n' +
                'print(f"After:  radius = {radius}   (was doubled)")\n' +
                '\n' +
                '# The box holds only the CURRENT value\n' +
                'radius = 50.0         # Reset\n' +
                'radius = 75.0         # New value replaces old\n' +
                'print(f"\\nFinal:  radius = {radius}   (only keeps last assignment)")\n' +
                '\n' +
                '# Using a variable in an expression (same as G-code X#100)\n' +
                'circumference = 3.14159 * 2 * radius   # Fanuc: #103 = [3.14159 * 2 * #100]\n' +
                'print(f"\\nCircumference of R{radius} circle = {circumference:.2f} mm")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '1.3 — Conditions: True or False, Nothing Else',
              prose:
                'A **condition** is a comparison between two values that produces exactly one of two results: **True** or **False**. There is no maybe. No partial. No 0.7.\n\n' +
                'Common comparison operators — note the CNC equivalent on the right:\n\n' +
                '| Python | Fanuc | Meaning | Example | Result |\n' +
                '|--------|-------|---------|---------|--------|\n' +
                '| `>` | `GT` | greater than | `8 > 6` | True |\n' +
                '| `<` | `LT` | less than | `3 < 1` | False |\n' +
                '| `>=` | `GE` | greater or equal | `5 >= 5` | True |\n' +
                '| `<=` | `LE` | less or equal | `4 <= 4` | True |\n' +
                '| `==` | `EQ` | equal to | `3 == 4` | False |\n' +
                '| `!=` | `NE` | not equal to | `3 != 4` | True |\n\n' +
                'In Fanuc Macro B, these operators live inside the IF condition: `IF [#100 GT 6.0] GOTO 10`.\n' +
                'In Python: `if x > 6.0:`\n\n' +
                'The comparison `#100 GT 6.0` is evaluated first. If the result is True, the GOTO executes. If False, the next line runs.',
              code:
                '# Conditions evaluate to True or False\n' +
                'depth    = 8.0\n' +
                'MAX_DEPTH = 6.0\n' +
                '\n' +
                '# Print the actual True/False value of each condition\n' +
                'print(f"depth > MAX_DEPTH  : {depth > MAX_DEPTH}")   # Fanuc: #100 GT #101\n' +
                'print(f"depth < MAX_DEPTH  : {depth < MAX_DEPTH}")   # Fanuc: #100 LT #101\n' +
                'print(f"depth == MAX_DEPTH : {depth == MAX_DEPTH}")  # Fanuc: #100 EQ #101\n' +
                'print(f"depth != MAX_DEPTH : {depth != MAX_DEPTH}")  # Fanuc: #100 NE #101\n' +
                '\n' +
                '# Conditions combined with AND / OR\n' +
                'tool_diam = 12.0\n' +
                'ok_to_cut = (depth <= MAX_DEPTH) and (tool_diam > 0)\n' +
                'print(f"\\nOK to cut? depth≤6 AND diam>0: {ok_to_cut}")\n' +
                '\n' +
                '# Try different depths\n' +
                'print("\\nDepth check table:")\n' +
                'for d in [3.0, 6.0, 6.1, 10.0]:\n' +
                '    over = d > MAX_DEPTH\n' +
                '    print(f"  depth={d:4.1f}  →  too deep? {str(over):5}  →  ",\n' +
                '          "ALARM" if over else f"G01 Z-{d:.1f} F50")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: '1.4 — IF / ELSE: Taking Different Paths',
              prose:
                'An **IF statement** uses a condition to decide which block of code to execute. Only one path executes — the program takes a fork in the road.\n\n' +
                '```\n' +
                'if condition:\n' +
                '    # This block runs only if condition is True\n' +
                'else:\n' +
                '    # This block runs only if condition is False\n' +
                '```\n\n' +
                '**In Fanuc Macro B**, there is no direct "if-then-else" — only "if-then-goto":\n\n' +
                '```\n' +
                'IF [condition] GOTO label\n' +
                '  (code for False case)\n' +
                'GOTO skip_label\n' +
                'N[label] (code for True case)\n' +
                'N[skip_label] (continue)\n' +
                '```\n\n' +
                'The concept is identical — a condition routes execution to one of two places. ' +
                'Fanuc just uses GOTO (a jump instruction) rather than indented blocks. ' +
                'In **Okuma OSP**, the IF syntax is much closer to Python:\n' +
                '`IF VC100 GT 6.0 THEN ALARM ELSE G01 Z-VC100 ENDIF`\n\n' +
                'Run the cell. Change `depth` to 3.0 and re-run to see the other branch.',
              code:
                '# IF / ELSE decision — Python pseudocode\n' +
                '# ─────────────────────────────────────────────────────────────\n' +
                '# Fanuc Macro B equivalent:\n' +
                '#   #100 = 8.0           (depth)\n' +
                '#   #101 = 6.0           (MAX_DEPTH)\n' +
                '#   IF [#100 GT #101] GOTO 100     (if depth > max, jump to alarm)\n' +
                '#   G01 Z-#100 F50                 (safe: cut to depth)\n' +
                '#   GOTO 200\n' +
                '#   N100 #3000 = 1                 (alarm: DEPTH TOO LARGE)\n' +
                '#   N200 (continue)\n' +
                '#\n' +
                '# Okuma equivalent:\n' +
                '#   IF VC100 GT VC101 THEN\n' +
                '#     ALARM(1, "DEPTH TOO LARGE")\n' +
                '#   ELSE\n' +
                '#     G01 Z-VC100 F50\n' +
                '#   ENDIF\n' +
                '\n' +
                'depth     = 8.0    # Try changing to 3.0 and re-running\n' +
                'MAX_DEPTH = 6.0\n' +
                '\n' +
                'if depth > MAX_DEPTH:                      # IF [#100 GT #101] GOTO 100\n' +
                '    print(f"ERROR: depth {depth}mm > max {MAX_DEPTH}mm")\n' +
                '    print("Fanuc: #3000 = 1  triggers a controller alarm")\n' +
                'else:                                      # (else: fall through)\n' +
                '    print(f"OK: depth {depth}mm is within limit")\n' +
                '    print(f"Executing: G01 Z-{depth:.1f} F50")\n' +
                '\n' +
                'print("\\n→ Program continues here regardless of which branch ran")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: '1.5 — WHILE Loops: Repeat Until False',
              prose:
                'A **WHILE loop** keeps executing a block of code as long as a condition remains True. ' +
                'As soon as the condition becomes False, execution jumps past the loop and continues.\n\n' +
                '```\n' +
                'while condition:\n' +
                '    # body — runs repeatedly while condition is True\n' +
                '    # CRITICAL: the body must eventually make the condition False\n' +
                '    # If it never does → infinite loop → machine hangs forever\n' +
                '```\n\n' +
                'The loop has three parts that work together:\n' +
                '1. **Initialize** — set the starting value before the loop (`x = 10`)\n' +
                '2. **Condition** — checked at the TOP of every iteration (`while x <= 90`)\n' +
                '3. **Increment** — change the value inside the body so the condition eventually becomes False (`x = x + 20`)\n\n' +
                '**In Fanuc Macro B:**\n' +
                '```\n' +
                'WHILE [condition] DO 1\n' +
                '  (body)\n' +
                'END 1\n' +
                '```\n' +
                'The DO 1 / END 1 pairs mark the loop boundary. You can nest loops: DO 1 / DO 2 / END 2 / END 1.\n\n' +
                '**In Okuma OSP:** `WHILE condition ... ENDWHILE` — nearly identical to Python.\n\n' +
                'Run the cell. It drills a row of 5 holes and prints each step explicitly.',
              code:
                '# WHILE loop: drill 5 holes in a row\n' +
                '# ─────────────────────────────────────────────────────────────\n' +
                '# Fanuc Macro B:\n' +
                '#   #100 = 10.0     (x_pos start)\n' +
                '#   #101 = 20.0     (x_step)\n' +
                '#   #102 = 90.0     (x_end)\n' +
                '#   #103 = 0        (hole counter for logging)\n' +
                '#\n' +
                '#   WHILE [#100 LE #102] DO 1\n' +
                '#     G00 X#100 Y0\n' +
                '#     G81 Z-10 R2.0 F60\n' +
                '#     #103 = [#103 + 1]\n' +
                '#     #100 = [#100 + #101]\n' +
                '#   END 1\n' +
                '#   G80\n' +
                '\n' +
                'x_pos   = 10.0   # #100 = 10.0\n' +
                'x_step  = 20.0   # #101 = 20.0\n' +
                'x_end   = 90.0   # #102 = 90.0\n' +
                'hole_no = 0\n' +
                '\n' +
                'print("Drilling sequence:")\n' +
                'print(f"{\'Hole\':>5}  {\'x_pos\':>8}  {\'x_pos<=90\':>10}  {\'Action\':>25}")\n' +
                'print("─" * 58)\n' +
                '\n' +
                'while x_pos <= x_end:          # WHILE [#100 LE #102] DO 1\n' +
                '    hole_no += 1\n' +
                '    cond_str = f"{x_pos:.1f} <= {x_end:.1f} = True"\n' +
                '    action   = f"G00 X{x_pos:.1f} Y0 → G81 Z-10"\n' +
                '    print(f"{hole_no:>5}  {x_pos:>8.1f}  {cond_str:>10}  {action:>25}")\n' +
                '    x_pos += x_step            # #100 = [#100 + #101]\n' +
                '\n' +
                '# After the loop: show why it stopped\n' +
                'print(f"\\nLoop check: x_pos={x_pos:.1f} <= {x_end:.1f}? → False → exit loop")\n' +
                'print("G80  (cancel drill cycle)")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 6,
              cellTitle: '1.6 — Counting Loops: FOR as a WHILE',
              prose:
                'Python has a `for` loop that handles the counting pattern automatically. ' +
                'CNC macro systems do NOT have a native FOR loop — they only have WHILE. ' +
                'But the two are interchangeable: a FOR loop is just a WHILE loop with a counter.\n\n' +
                '```python\n' +
                '# Python FOR:\n' +
                'for i in range(6):\n' +
                '    do_something(i)\n' +
                '\n' +
                '# Exactly equivalent WHILE:\n' +
                'i = 0\n' +
                'while i < 6:\n' +
                '    do_something(i)\n' +
                '    i = i + 1\n' +
                '```\n\n' +
                'The Fanuc Macro B version of this counter pattern:\n' +
                '```\n' +
                '#1 = 0\n' +
                'WHILE [#1 LT 6] DO 1\n' +
                '  ...\n' +
                '  #1 = [#1 + 1]\n' +
                'END 1\n' +
                '```\n\n' +
                'The counter (`i` in Python, `#1` in Fanuc) starts at 0, increments by 1 each iteration, ' +
                'and the loop runs while the counter is less than the total count. ' +
                'This counter pattern is so common in CNC macros that you should be able to write it without thinking.',
              code:
                '# Counting loop — Python FOR vs Fanuc WHILE\n' +
                'import math\n' +
                '\n' +
                '# --- Python style (convenient) ---\n' +
                'print("Python FOR loop (convenient):") \n' +
                'for i in range(6):\n' +
                '    angle = 360.0 / 6 * i\n' +
                '    x = 50.0 * math.cos(math.radians(angle))\n' +
                '    y = 50.0 * math.sin(math.radians(angle))\n' +
                '    print(f"  i={i}  angle={angle:5.1f}°  X={x:7.3f}  Y={y:7.3f}")\n' +
                '\n' +
                '# --- CNC-style WHILE (what actually runs on the machine) ---\n' +
                'print("\\nCNC-style WHILE loop (translates directly to Fanuc):")\n' +
                'print("  #100 = 6    (n_holes)")\n' +
                'print("  #101 = 50.0 (radius)")\n' +
                'print("  #102 = 0    (counter)")\n' +
                'print("  WHILE [#102 LT #100] DO 1")\n' +
                '\n' +
                'n  = 6\n' +
                'R  = 50.0\n' +
                'i  = 0          # #102 = 0\n' +
                'while i < n:    # WHILE [#102 LT #100] DO 1\n' +
                '    angle = 360.0 / n * i        # #103 = [360.0 / #100 * #102]\n' +
                '    x = R * math.cos(math.radians(angle))  # #104 = [#101 * COS[#103]]\n' +
                '    y = R * math.sin(math.radians(angle))  # #105 = [#101 * SIN[#103]]\n' +
                '    print(f"  #102={i}  #103={angle:5.1f}  G81 X{x:7.3f} Y{y:7.3f} Z-12 R2 F60")\n' +
                '    i = i + 1   # #102 = [#102 + 1]\n' +
                'print("  END 1")\n' +
                'print("  G80")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 7,
              cellTitle: '1.7 — Trig in CNC: The Degrees vs Radians Problem',
              prose:
                'This is the **single most common translation error** when moving from Python pseudocode to Fanuc Macro B.\n\n' +
                '- Python\'s `math.sin()` and `math.cos()` take angles in **RADIANS**\n' +
                '- Fanuc\'s `SIN[]` and `COS[]` take angles in **DEGREES**\n' +
                '- Okuma\'s `SIN()` and `COS()` also take **DEGREES**\n' +
                '- Siemens\' `SIN()` and `COS()` take **DEGREES**\n\n' +
                'When writing Python as pseudocode for CNC, you MUST add `math.radians()` to every angle before passing it to Python trig. ' +
                'The Fanuc code does NOT need this conversion — you pass degrees directly.\n\n' +
                '`SIN[30]` in Fanuc = 0.5 (sin of 30 degrees)\n' +
                '`math.sin(30)` in Python = -0.988 (sin of 30 RADIANS — a huge mistake)\n' +
                '`math.sin(math.radians(30))` in Python = 0.5 (correct)\n\n' +
                'The cell below prints a comparison table so you can see exactly how they correspond.',
              code:
                'import math\n' +
                '\n' +
                '# ─────────────────────────────────────────────────────────────\n' +
                '# WARNING: math.sin(30) is WRONG for CNC translation\n' +
                '#          math.sin(math.radians(30)) is CORRECT\n' +
                '# ─────────────────────────────────────────────────────────────\n' +
                '\n' +
                'print("Angle | math.sin(angle)    | math.sin(radians) | Fanuc SIN[angle]")\n' +
                'print("      | (WRONG for CNC)    | (Python equiv.)   | (on the machine)")\n' +
                'print("─" * 70)\n' +
                '\n' +
                'angles = [0, 30, 45, 60, 90, 180]\n' +
                'for deg in angles:\n' +
                '    wrong   = math.sin(deg)                    # DO NOT do this\n' +
                '    correct = math.sin(math.radians(deg))      # Python pseudocode form\n' +
                '    fanuc   = correct                          # Same as Fanuc SIN[deg]\n' +
                '    print(f"{deg:5}° | {wrong:18.4f} | {correct:17.4f} | {fanuc:.4f}")\n' +
                '\n' +
                'print("\\n✓ For Python pseudocode: always wrap degrees with math.radians()")\n' +
                'print("✓ For actual Fanuc code: SIN[angle_in_degrees] — no conversion needed")\n' +
                '\n' +
                '# Practical: bolt circle X positions at 6 angles\n' +
                'print("\\nBolt circle check (R=50, 6 holes):")\n' +
                'for i in range(6):\n' +
                '    deg = 60 * i\n' +
                '    x_correct = 50 * math.cos(math.radians(deg))\n' +
                '    print(f"  SIN[{deg:3}] = {math.sin(math.radians(deg)):+.4f}  COS[{deg:3}] = {math.cos(math.radians(deg)):+.4f}  → X{x_correct:+7.3f}")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 8,
              cellTitle: '1.8 — Full Example: Bolt Circle Program in All Three Dialects',
              prose:
                'Now we put it all together. A 6-hole bolt circle on a 50mm radius, 15mm deep, G-code output.\n\n' +
                'Notice three things as you read through this cell:\n' +
                '1. The Python version is the "master logic" — everything else is a translation\n' +
                '2. Fanuc uses `#variables` and `WHILE/DO/END`\n' +
                '3. Okuma reads almost like Python — `WHILE ... ENDWHILE`, `VC` variables\n' +
                '4. The math (angle, X, Y) is identical in all three\n\n' +
                'This is the key insight: **learn the logic once, translate the syntax as needed.** ' +
                'The machine does not care what dialect you use — it executes the same tool motions.',
              code:
                'import math\n' +
                '\n' +
                '# ════════════════════════════════════════════════════\n' +
                '# PARAMETERS (change these to change the entire program)\n' +
                'N      = 6       # number of holes\n' +
                'R      = 50.0    # bolt circle radius (mm)\n' +
                'DEPTH  = -15.0   # drill depth\n' +
                'FEED   = 80.0    # feedrate mm/min\n' +
                'RPM    = 1200    # spindle speed\n' +
                '# ════════════════════════════════════════════════════\n' +
                '\n' +
                'def gen_fanuc():\n' +
                '    lines = [\n' +
                '        "O1000",\n' +
                '        "G21 G90 G17 G40 G49 G80",\n' +
                '        f"#100 = {N}    (N_HOLES)",\n' +
                '        f"#101 = {R}  (RADIUS MM)",\n' +
                '        f"#102 = {DEPTH} (DEPTH)",\n' +
                '        f"#103 = {FEED}  (FEED)",\n' +
                '        f"#104 = 0    (COUNTER)",\n' +
                '        f"T1 M06",\n' +
                '        f"G43 H1  S{RPM} M03  M08",\n' +
                '        "WHILE [#104 LT #100] DO 1",\n' +
                '        "  #105 = [360.0 / #100 * #104]         (ANGLE)",\n' +
                '        "  #106 = [#101 * COS[#105]]            (X)",\n' +
                '        "  #107 = [#101 * SIN[#105]]            (Y)",\n' +
                '        "  G99 G81 X#106 Y#107 Z#102 R2.0 F#103",\n' +
                '        "  #104 = [#104 + 1]",\n' +
                '        "END 1",\n' +
                '        "G80  M09  M05",\n' +
                '        "G91 G28 Z0  G90 G28 X0 Y0",\n' +
                '        "M30"\n' +
                '    ]\n' +
                '    return lines\n' +
                '\n' +
                'def gen_okuma():\n' +
                '    lines = [\n' +
                '        "O1000",\n' +
                '        f"VC100 = {N}     ; N_HOLES",\n' +
                '        f"VC101 = {R}   ; RADIUS MM",\n' +
                '        f"VC102 = {DEPTH}  ; DEPTH",\n' +
                '        f"VC103 = {FEED}   ; FEED",\n' +
                '        f"VC104 = 0     ; COUNTER",\n' +
                '        f"T1 M06  S{RPM} M03  M08",\n' +
                '        "WHILE VC104 < VC100",\n' +
                '        "  VC105 = 360.0 / VC100 * VC104",\n' +
                '        "  VC106 = VC101 * COS(VC105)",\n' +
                '        "  VC107 = VC101 * SIN(VC105)",\n' +
                '        "  G99 G81 XVC106 YVC107 ZVC102 R2.0 FVC103",\n' +
                '        "  VC104 = VC104 + 1",\n' +
                '        "ENDWHILE",\n' +
                '        "G80  M09  M05  G28  M30"\n' +
                '    ]\n' +
                '    return lines\n' +
                '\n' +
                'print("══════ FANUC MACRO B ══════")\n' +
                'for l in gen_fanuc(): print(l)\n' +
                '\n' +
                'print("\\n══════ OKUMA OSP ══════")\n' +
                'for l in gen_okuma(): print(l)\n' +
                '\n' +
                '# Verify the math\n' +
                'print("\\n══════ HOLE POSITIONS (verify) ══════")\n' +
                'for i in range(N):\n' +
                '    a = 360.0/N*i\n' +
                '    x = R * math.cos(math.radians(a))\n' +
                '    y = R * math.sin(math.radians(a))\n' +
                '    print(f"  Hole {i+1}: angle={a:5.1f}°  X={x:+8.3f}  Y={y:+8.3f}")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 9,
              cellTitle: '1.9 — The Infinite Loop Problem (and How to Avoid It)',
              prose:
                'An **infinite loop** is a loop whose condition never becomes False — so it runs forever. ' +
                'On a computer, you can press Ctrl+C to escape. On a CNC machine, the program stalls permanently ' +
                'and the only way out is an Emergency Stop or power cycle.\n\n' +
                'The three causes of infinite loops:\n' +
                '1. **Missing increment**: you check `while counter < 10` but never change `counter`\n' +
                '2. **Wrong increment direction**: you intended `counter += 1` but wrote `counter -= 1`\n' +
                '3. **Wrong condition**: the condition is always True because of a logic error\n\n' +
                'In Fanuc Macro B, infinite loops also occur from GOTO jumping backward:\n' +
                '```\n' +
                'N10 G01 X#100 F200\n' +
                '#100 = #100 + 10\n' +
                'GOTO 10        ← always jumps back to N10 — never exits\n' +
                '```\n\n' +
                'The cell below demonstrates safe vs unsafe loops. ' +
                'The unsafe version has a hard-coded iteration limit to prevent hanging the browser.',
              code:
                '# Safe loop vs infinite loop patterns\n' +
                '\n' +
                '# ── SAFE: counter reaches the exit condition ──\n' +
                'print("Safe WHILE loop:")\n' +
                'x = 0\n' +
                'iteration = 0\n' +
                'while x < 50:          # WHILE [#100 LT 50] DO 1\n' +
                '    print(f"  x={x:4.1f}  → cut at X{x:.1f}")\n' +
                '    x += 10            # #100 = [#100 + 10]  ← increment moves us toward exit\n' +
                '    iteration += 1\n' +
                'print(f"  Exited after {iteration} iterations. x={x:.1f} is no longer < 50\\n")\n' +
                '\n' +
                '# ── UNSAFE patterns (with limit to prevent hanging) ──\n' +
                'SAFETY_LIMIT = 8   # Prevents infinite loop in browser\n' +
                '\n' +
                'print("UNSAFE pattern 1 — missing increment:")\n' +
                'x = 0\n' +
                'count = 0\n' +
                'while x < 50 and count < SAFETY_LIMIT:  # should be: while x < 50\n' +
                '    print(f"  x={x:.1f} (never changes! — would loop forever)")\n' +
                '    # MISSING: x += 10\n' +
                '    count += 1\n' +
                'print(f"  ⚠ Stopped after {count} iterations — WOULD BE INFINITE on machine\\n")\n' +
                '\n' +
                'print("UNSAFE pattern 2 — wrong direction:")\n' +
                'x = 100\n' +
                'count = 0\n' +
                'while x < 50 and count < SAFETY_LIMIT:  # starts False immediately — never runs!\n' +
                '    print("  This never prints")\n' +
                '    count += 1\n' +
                'print(f"  x={x} < 50? False — loop body never executed (different bug)")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
          ]
        },
        title: 'Programming Logic — Interactive Python Cells',
        caption: 'Run every cell in order. Each builds on the last. Cell 1.1 introduces the three building blocks. By Cell 1.8, you are generating real G-code for both Fanuc and Okuma controllers. Cell 1.9 shows how infinite loops happen — and how to prevent them.',
      },
    ],
    prose: [
      '**Why This Lesson Exists**: Fanuc Macro B syntax looks intimidating: `#100 = [#101 * COS[#103]]`, `WHILE [#100 LT 6] DO 1`, `IF [#1 GT 0] GOTO 100`. A machinist who has never programmed before sees this and panics. But the underlying logic is not complex — it is the same three ideas that every programming language in the world uses. This lesson teaches those ideas in Python first, then shows the CNC translation.',

      '**The Three Building Blocks of All Programming**: Variables, conditions, and loops are not features of CNC macros. They are features of computation itself. A calculator on your desk has them. Excel has them. JavaScript, Python, Fanuc, Okuma, Siemens — all have them. Once you understand these three things, reading any programming language becomes pattern recognition, not memorization.',

      '**Why Python Specifically?**: Python was chosen as the pseudolanguage for this course for three reasons. First, it runs directly in the browser — you can execute every cell and see the output immediately. Second, Python\'s syntax is the closest to plain English of any widely-used language: `while count < 6:` reads almost as a sentence. Third, the translation to Fanuc Macro B or Okuma OSP is mechanical — the same logic, different punctuation. The Python-to-Fanuc dictionary is a reference you can use forever.',

      '**Okuma VC Variables as a Learning Aid**: Okuma\'s VC variable system deserves special attention as a learning bridge. While Fanuc uses `#100 = 5.0`, Okuma uses `VC100 = 5.0`. The VC prefix makes it look more like a variable name. More importantly, Okuma\'s loop syntax — `WHILE VC100 LT 6 ... ENDWHILE` — reads almost exactly like Python\'s `while x < 6:`. If you find Fanuc syntax difficult at first, reading an Okuma program can help you see the structure, then translate back.',
    ],
  },

  math: {
    prose: [
      'Every CNC macro is computing a mathematical function. The bolt circle computes hole positions via polar-to-Cartesian conversion:',
      '$$x_i = R \\cdot \\cos\\!\\left(\\frac{2\\pi i}{n}\\right), \\qquad y_i = R \\cdot \\sin\\!\\left(\\frac{2\\pi i}{n}\\right)$$',
      'In degrees (as Fanuc requires): $\\theta_i = \\frac{360°}{n} \\cdot i$, so:',
      '$$x_i = R \\cdot \\text{COS}[\\theta_i], \\qquad y_i = R \\cdot \\text{SIN}[\\theta_i]$$',
      'This is why the trig unit matters. Radians and degrees give the same answer only for $0°$ and multiples of $90°$. For any other angle, they diverge:',
      '$$\\sin(30_{\\text{radians}}) \\approx -0.988, \\qquad \\sin(30°) = 0.5$$',
      'The two-argument arctangent gives the full four-quadrant angle and is critical for reversing this:',
      '$$\\theta = \\text{ATAN}[y]/[x] \\in [0°, 360°]$$',
      'Fanuc\'s ATAN takes the $y$ and $x$ components in two separate bracket groups with `/` between them — a unique but powerful syntax.',
    ],
  },

  rigor: {
    prose: [
      '**The Real Differences Between Python and Fanuc Macro B**: Python is a general-purpose language with lists, strings, dictionaries, functions, classes, and garbage collection. Fanuc Macro B has: numbered numeric variables, basic arithmetic, IF/GOTO, WHILE/DO/END, and a small set of math functions. That is the complete feature set. This is not a limitation — it is sufficient for every parametric machining problem. The constraint forces elegant, efficient code.',

      '**Variable Persistence Between Programs**: In Python, all variables are destroyed when the script ends. In Fanuc: local variables (#1–#33) are destroyed when the subprogram returns; common variables (#100–#199) survive between programs but reset on power-down; permanent variables (#500–#999) survive power cycles. In Okuma: VC1–VC499 are common (reset on power), VC500–VC999 are permanent. This persistence is what allows a macro to "remember" a previous setting — a powerful tool for production automation.',

      '**Okuma vs Fanuc — a Closer Look**: Okuma OSP (Open System Platform) was designed with programmability in mind from the start. Its macro language (called User Task 2) uses named keywords, WHILE/ENDWHILE/IF/ENDIF constructs, and even allows subroutine-like structures. Fanuc Macro B was designed to be backward-compatible with legacy systems, hence the older GOTO-based conditional syntax. If you learn on Okuma, Fanuc will seem old-fashioned. If you learn on Fanuc, Okuma will seem cleaner.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-pseudo-translate-1',
      title: 'Translate Python to Fanuc: Count-down from 10 to 1',
      problem: 'Translate this Python loop to Fanuc Macro B exactly.',
      code: 'i = 10\nwhile i >= 1:\n    print(i)\n    i = i - 1',
      steps: [
        { expression: '#100 = 10', annotation: 'Initialize counter. Python: i = 10' },
        { expression: 'WHILE [#100 GE 1] DO 1', annotation: 'Condition: #100 >= 1. Python uses >=, Fanuc uses GE (greater-or-equal).' },
        { expression: '(#100 would be used in G-code here)', annotation: 'Python "print(i)" → in Fanuc you would use #100 in an axis command, e.g., G01 X#100' },
        { expression: '#100 = [#100 - 1]', annotation: 'Decrement. Python: i = i - 1. Fanuc requires [ ] around the expression.' },
        { expression: 'END 1', annotation: 'Close the loop body. Python: end of indented block.' },
      ],
      conclusion: 'The structure is a direct one-to-one translation. The only syntax changes: [ ] around expressions, GE instead of >=, DO 1 / END 1 instead of indentation.',
    },
    {
      id: 'ex-cnc-pseudo-translate-2',
      title: 'Translate Fanuc Macro B to Python: Read and understand',
      problem: 'Read this Fanuc program and write the Python equivalent. What does it do?',
      code: '#100 = 0\n#101 = 10.0\nWHILE [#100 LT 5] DO 1\n  #102 = [#101 * #100]\n  G00 X#102 Y0\n  G81 Z-8 R2 F60\n  #100 = [#100 + 1]\nEND 1\nG80',
      steps: [
        { expression: '#100 = 0 → counter = 0', annotation: 'A counter starting at 0' },
        { expression: '#101 = 10.0 → spacing = 10.0', annotation: 'A spacing value of 10mm' },
        { expression: 'WHILE [#100 LT 5] → while counter < 5:', annotation: 'Runs 5 times (counter = 0,1,2,3,4)' },
        { expression: '#102 = [#101 * #100] → x_pos = spacing * counter', annotation: 'X positions: 0, 10, 20, 30, 40mm' },
        { expression: 'G00 X#102 G81 Z-8 → drill at x_pos', annotation: 'Drill at each calculated X position' },
        { expression: '#100 = [#100 + 1] → counter += 1', annotation: 'Increment counter' },
      ],
      conclusion: 'This program drills 5 holes at X=0, X=10, X=20, X=30, X=40mm (all at Y=0, Z-8mm depth). It is a hole-row macro where spacing is controlled by a single variable.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-pseudo-1',
        type: 'choice',
        text: 'In Fanuc Macro B, x = x + 1 becomes:',
        options: [
          'X = X + 1',
          '#100 = [#100 + 1]',
          'G01 X1.0',
          'ADD #100 1',
        ],
        answer: '#100 = [#100 + 1]',
      },
      {
        id: 'cnc-pseudo-2',
        type: 'choice',
        text: 'In Python pseudocode, you write math.sin(math.radians(45)) to match Fanuc\'s SIN[45]. If you accidentally write math.sin(45) instead, what is the output?',
        options: [
          '0.7071 — correct (same result)',
          '1.0 — it clips to 1',
          '0.8509 — sin of 45 radians (wrong angle unit)',
          '0 — invalid input',
        ],
        answer: '0.8509 — sin of 45 radians (wrong angle unit)',
      },
      {
        id: 'cnc-pseudo-3',
        type: 'choice',
        text: 'What causes an infinite loop in a Fanuc WHILE loop?',
        options: [
          'Using a large number of iterations',
          'The variable inside the condition never changes to make the condition False',
          'Using DO 1 instead of DO 2',
          'Having more than one variable',
        ],
        answer: 'The variable inside the condition never changes to make the condition False',
      },
      {
        id: 'cnc-pseudo-4',
        type: 'choice',
        text: 'Okuma uses VC100, Fanuc uses #100, Siemens uses R100. What do all three represent?',
        options: [
          'Different hardware registers with different capabilities',
          'The same concept — a numbered variable slot — in different controller syntaxes',
          'Okuma is metric, Fanuc is imperial, Siemens is both',
          'They store different types of data',
        ],
        answer: 'The same concept — a numbered variable slot — in different controller syntaxes',
      },
      {
        id: 'cnc-pseudo-5',
        type: 'choice',
        text: 'The Python loop "for i in range(6):" has a direct Fanuc equivalent. What is the correct WHILE form?',
        options: [
          '#100 = 6\nWHILE [#100 GT 0] DO 1\n  #100 = [#100 - 1]\nEND 1',
          '#100 = 0\nWHILE [#100 LT 6] DO 1\n  ...\n  #100 = [#100 + 1]\nEND 1',
          'REPEAT 6 TIMES\n  ...\nENDREPEAT',
          '#100 = 1\nWHILE [#100 NE 7] DO 1\n  #100 = [#100 + 1]\nEND 1',
        ],
        answer: '#100 = 0\nWHILE [#100 LT 6] DO 1\n  ...\n  #100 = [#100 + 1]\nEND 1',
      },
      {
        id: 'cnc-pseudo-6',
        type: 'input',
        text: 'Fanuc: IF [#100 GT #101] GOTO 100. Python pseudocode: if ___ > ___: goto_100(). Fill in both blanks (write as Python variable names like "a, b"): ',
        answer: '#100, #101',
      },
    ]
  },

  mentalModel: [
    'Every language has: variables, conditions, loops. Learn the concept once, translate the syntax.',
    'Assignment (=) is an action: "store this value." Not math equality.',
    'Condition = True or False only. GT, LT, EQ, NE, GE, LE are the Fanuc comparison operators.',
    'WHILE loop = check condition → body → increment → repeat. All three parts are required.',
    'math.sin(degrees) is WRONG. math.sin(math.radians(degrees)) = Fanuc SIN[degrees].',
    'Fanuc #100 = Okuma VC100 = Siemens R100. Same concept, different controller brand.',
    'Infinite loop on a CNC = machine hangs. Requires E-stop. Always ensure the loop can exit.',
  ],
}
