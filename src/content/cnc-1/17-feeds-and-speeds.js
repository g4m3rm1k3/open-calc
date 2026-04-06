export default {
  id: 'cnc-feeds-speeds',
  slug: 'feeds-and-speeds',
  chapter: 'cnc-1',
  order: 17,
  title: 'Feeds & Speeds',
  subtitle: 'The Math That Determines Tool Life, Surface Finish, and Cycle Time',
  tags: ['feedrate', 'RPM', 'SFM', 'chip load', 'IPT', 'MMPT', 'cutting speed', 'F-word', 'S-word', 'IPM', 'mm/min'],

  semantics: {
    core: [
      { symbol: 'Cutting Speed (Vc)', meaning: 'How fast the cutting edge moves through the material. Set by material and tool coating. Metric: m/min. Imperial: SFM (surface feet per minute).' },
      { symbol: 'SFM', meaning: 'Surface Feet per Minute: the imperial unit of cutting speed. Typical values: aluminum 300–800 SFM, steel 100–400 SFM, stainless 50–150 SFM.' },
      { symbol: 'Chip Load (IPT / MMPT)', meaning: 'The thickness of each chip: feed per tooth per revolution. IPT = inches per tooth. MMPT = mm per tooth. This is the primary quality dial for milling.' },
      { symbol: 'Feedrate (F)', meaning: 'How fast the tool moves through the material: IPM (inches/min) or mm/min. F = RPM × chip load × number of flutes.' },
      { symbol: 'Flutes (Z)', meaning: 'The number of cutting edges on a milling tool. A 4-flute end mill takes 4 chips per revolution.' },
    ],
    rulesOfThumb: [
      'Cutting speed → RPM (determined by material + tool). Chip load → feedrate (determined by operation type + tool size).',
      'Too fast (RPM or feedrate): overheating, built-up edge, premature tool failure.',
      'Too slow: rubbing instead of cutting, work hardening (especially stainless), poor finish.',
      'Chip load is more important than feedrate. Calculate from chip load, not from feedrate.',
      '1 SFM ≈ 0.305 m/min. 1 m/min ≈ 3.281 SFM.',
    ]
  },

  hook: {
    question: 'Why do two machinists running the same part on the same machine get completely different tool life — one gets 50 parts per tool, the other gets 5?',
    realWorldContext:
      'Feeds and speeds are the most misunderstood aspect of CNC machining. Most beginners pick numbers by feel, by copying old programs, or by using whatever CAM defaults. ' +
      'The result: broken tools, poor surface finish, and cycle times 3× longer than necessary. ' +
      'The correct approach is mathematical. Cutting speed is a material/tool property — it tells you the RPM. ' +
      'Chip load is an operation property — it tells you the feedrate. Both are calculated, not guessed. ' +
      'Master these two formulas and you will set better parameters than 80% of machinists you will ever meet.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'Interactive Feeds & Speeds Calculator',
            cells: [
              {
                type: 'js',
                title: 'Feeds & Speeds — Live Calculator',
                html: `
<div id="app" style="padding:16px;max-width:700px;margin:0 auto">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <div class="card">
      <label>Unit System</label>
      <select id="units">
        <option value="metric">Metric (mm, m/min)</option>
        <option value="imperial">Imperial (inch, SFM)</option>
      </select>
    </div>
    <div class="card">
      <label>Material</label>
      <select id="material">
        <option value="alu">Aluminum 6061</option>
        <option value="ms">Mild Steel 1018</option>
        <option value="ss">Stainless 304</option>
        <option value="ti">Titanium 6Al-4V</option>
      </select>
    </div>
    <div class="card">
      <label>Tool Diameter</label>
      <input id="diam" type="number" value="12" step="0.1" min="0.5">
      <span id="diamUnit">mm</span>
    </div>
    <div class="card">
      <label>Number of Flutes</label>
      <input id="flutes" type="number" value="4" step="1" min="1" max="12">
    </div>
    <div class="card">
      <label>Operation</label>
      <select id="op">
        <option value="rough">Roughing (heavy chip)</option>
        <option value="finish">Finishing (light chip)</option>
      </select>
    </div>
    <div class="card" style="background:rgba(56,189,248,0.1);border-color:rgba(56,189,248,0.3)">
      <label style="color:#38bdf8">Axial Depth (DOC)</label>
      <input id="doc" type="number" value="8" step="0.5" min="0.1">
      <span id="docUnit">mm</span>
    </div>
  </div>
  <div id="results" style="background:rgba(30,41,59,0.8);border:1px solid #334155;border-radius:8px;padding:16px"></div>
</div>`,
                css: `
body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}
.card{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px}
label{color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.05em}
input,select{background:#0f172a;border:1px solid #475569;border-radius:4px;color:#e2e8f0;padding:6px 8px;font-family:monospace;font-size:13px;width:100%;box-sizing:border-box}
span{color:#64748b;font-size:11px}
.res-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1e293b}
.res-label{color:#94a3b8}.res-val{color:#38bdf8;font-size:15px;font-weight:bold}
.res-code{color:#4ade80;font-size:12px;font-style:italic}
`,
                startCode: `
const data = {
  alu:  { vcM:250, vcI:820, chipRoughMM:0.030, chipFinishMM:0.012 },
  ms:   { vcM:100, vcI:330, chipRoughMM:0.025, chipFinishMM:0.010 },
  ss:   { vcM: 60, vcI:200, chipRoughMM:0.020, chipFinishMM:0.008 },
  ti:   { vcM: 45, vcI:148, chipRoughMM:0.015, chipFinishMM:0.006 },
};

function calc() {
  const units = document.getElementById('units').value;
  const mat   = data[document.getElementById('material').value];
  const D     = parseFloat(document.getElementById('diam').value)||12;
  const Z     = parseInt(document.getElementById('flutes').value)||4;
  const op    = document.getElementById('op').value;
  const DOC   = parseFloat(document.getElementById('doc').value)||8;

  document.getElementById('diamUnit').textContent = units==='metric'?'mm':'inch';
  document.getElementById('docUnit').textContent  = units==='metric'?'mm':'inch';

  let vc, chipLoad, D_mm;
  if(units==='metric') {
    vc = mat.vcM;
    chipLoad = op==='rough' ? mat.chipRoughMM : mat.chipFinishMM;
    D_mm = D;
  } else {
    vc = mat.vcI;
    chipLoad = op==='rough' ? mat.chipRoughMM/25.4 : mat.chipFinishMM/25.4;
    D_mm = D * 25.4;
  }

  const rpm = units==='metric'
    ? Math.round(vc*1000/(Math.PI*D_mm))
    : Math.round(vc*12/(Math.PI*D));
  const feedrate = units==='metric'
    ? Math.round(rpm * chipLoad * Z)
    : parseFloat((rpm * chipLoad * Z).toFixed(2));
  const mrr = units==='metric'
    ? (feedrate * DOC * D_mm * 0.35 / 1000).toFixed(1)
    : (feedrate * DOC * D * 0.35).toFixed(3);

  const vcLabel = units==='metric' ? 'm/min' : 'SFM';
  const fUnit   = units==='metric' ? 'mm/min' : 'IPM';
  const chipUnit= units==='metric' ? 'mm/tooth' : 'in/tooth';
  const mrrUnit = units==='metric' ? 'cm³/min' : 'in³/min';

  document.getElementById('results').innerHTML = \`
<div style="color:#fbbf24;font-size:12px;margin-bottom:8px">Cutting Speed: \${vc} \${vcLabel} (from material/tool tables)</div>
<div class="res-row"><span class="res-label">Spindle Speed</span><span class="res-val">S\${rpm}</span><span class="res-code">G97 S\${rpm} M03</span></div>
<div class="res-row"><span class="res-label">Chip Load</span><span class="res-val">\${chipLoad.toFixed(4)} \${chipUnit}</span><span class="res-code">(\${op} operation)</span></div>
<div class="res-row"><span class="res-label">Feedrate</span><span class="res-val">F\${feedrate}</span><span class="res-code">G01 ... F\${feedrate}</span></div>
<div class="res-row" style="border:none"><span class="res-label">Material Removal Rate (est.)</span><span class="res-val">\${mrr} \${mrrUnit}</span></div>
<div style="margin-top:10px;background:#0f172a;padding:10px;border-radius:6px;color:#94a3b8;font-size:11px">
G97 S\${rpm} M03<br>M08<br>G01 Z-\${DOC} F\${Math.round(feedrate*0.25)}  (plunge at 25% feedrate)<br>G01 X... F\${feedrate}
</div>
\`;
}

['units','material','diam','flutes','op','doc'].forEach(id=>document.getElementById(id).addEventListener('input',calc));
calc();
`
              }
            ]
          }
        },
        title: 'Feeds & Speeds Calculator',
        caption: 'Change material, diameter, flutes, and operation type. Watch how RPM and feedrate update. Notice how the G-code S and F values are generated directly from the formulas. This is the math behind every CAM toolpath.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(FEEDS AND SPEEDS IN PRACTICE)\n' +
            '(12mm, 4-flute carbide end mill, 6061 aluminum)\n' +
            '(Cutting speed: 250 m/min  |  Chip load: 0.030 mm/tooth)\n' +
            '\n' +
            '(--- CALCULATION ---)\n' +
            '(RPM = 250000 / (pi * 12) = 6631 → use 6600)\n' +
            '(Feedrate = 6600 * 0.030 * 4 = 792 → use 800 mm/min)\n' +
            '(Plunge feedrate = 800 * 25% = 200 mm/min)\n' +
            '\n' +
            'G21 G90\n' +
            'T1 M06\n' +
            'G97 S6600 M03        (G97 = RPM mode, 6600 RPM)\n' +
            'M08\n' +
            'G43 H1\n' +
            'G00 X0 Y0 Z5.0\n' +
            'G01 Z-8.0 F200       (Plunge at 25% of cutting feedrate)\n' +
            'G01 X60.0 F800       (Cut at full feedrate)\n' +
            'G01 Y40.0\n' +
            'G01 X0\n' +
            'G01 Y0\n' +
            'G00 Z5.0\n' +
            'M09\n' +
            'M05\n' +
            'M30'
        },
        title: 'Feeds & Speeds Applied',
        caption: 'The calculated S and F values appear directly in the G-code. The plunge feedrate is 25% of the cutting feedrate — this is a universal rule for end mills entering material axially.',
      }
    ],
    prose: [
      '**Two Formulas. That\'s It.**: Everything in feeds and speeds comes down to two equations. First, the **Cutting Speed Formula** gives you RPM from material cutting speed and tool diameter. Second, the **Feedrate Formula** gives you the F-word from RPM, chip load, and number of flutes. Learn these two and you can set up any operation on any machine.',

      '**Step 1 — Find the Cutting Speed**: Every material has a recommended cutting speed for a given tool material (HSS vs carbide vs ceramic vs CBN). These values come from tooling manufacturer catalogs, machining handbooks, or Machining Data Handbooks. Typical values for carbide:\n' +
      '- Aluminum 6061: 200–300 m/min (650–1000 SFM)\n' +
      '- Mild Steel 1018: 80–130 m/min (260–425 SFM)\n' +
      '- 304 Stainless Steel: 45–80 m/min (150–260 SFM)\n' +
      '- Titanium 6Al-4V: 35–55 m/min (115–180 SFM)\n' +
      'Cutting speeds for HSS tools are typically 1/3 to 1/2 of the carbide values.',

      '**Step 2 — Find the Chip Load**: Chip load (feed per tooth) is how thick each chip should be. Thicker chips carry heat away better and produce a stronger cut — but too thick and you break the tool. Chip load is found in tool manufacturer specs by tool diameter. Typical values for a 12mm (0.5") carbide end mill:\n' +
      '- Roughing aluminum: 0.030–0.050 mm/tooth (0.0012–0.002 in/tooth)\n' +
      '- Finishing aluminum: 0.010–0.020 mm/tooth (0.0004–0.0008 in/tooth)\n' +
      '- Roughing steel: 0.020–0.030 mm/tooth (0.0008–0.0012 in/tooth)',

      '**Plunge Feedrate**: When plunging straight down (Z-axis), use 25%–33% of the cutting feedrate. End mill center cutting edges are not as efficient as the side edges. Some tools are not center-cutting at all and cannot plunge — they require a ramp or helical entry.',
    ],
  },

  math: {
    prose: [
      '**Cutting Speed → RPM**',
      'Metric:',
      '$\\text{RPM} = \\frac{V_c \\times 1000}{\\pi \\times D_{\\text{mm}}}$',
      'Imperial:',
      '$\\text{RPM} = \\frac{\\text{SFM} \\times 12}{\\pi \\times D_{\\text{in}}}$',
      '**RPM + Chip Load → Feedrate**',
      '$F = \\text{RPM} \\times f_z \\times Z$',
      'where $f_z$ is chip load per tooth (IPT or mm/tooth) and $Z$ is the number of flutes.',
      'Combining both formulas (metric):',
      '$F = \\frac{V_c \\times 1000}{\\pi \\times D} \\times f_z \\times Z$',
      'Converting between imperial and metric feedrates:',
      '$F_{\\text{mm/min}} = F_{\\text{ipm}} \\times 25.4$',
      'Material Removal Rate (MRR), useful for cycle time estimation:',
      '$\\text{MRR} = F \\times a_p \\times a_e$',
      'where $a_p$ = axial depth of cut (mm or in) and $a_e$ = radial engagement (mm or in).',
    ],
  },

  rigor: {
    prose: [
      '**Why You Scale from Chip Load, Not Feedrate**: If you copy a feedrate from a similar program and the diameter is different, the chip load changes. A feedrate of F200 means very different chip loads on a 6mm vs 25mm tool. Always recalculate from chip load for the actual tool in use.',

      '**Radial Engagement Effects**: The formulas above apply to full-slot milling (50% radial engagement). For peripheral milling with less engagement (e.g., 25% radial), you can increase feedrate by a chip thinning factor: $K_{\\text{thinning}} = \\sqrt{D / (2 \\times a_e)}$. This is why finishing passes with small radial depths can run at much higher feedrates.',

      '**Built-Up Edge (BUE)**: Running too slow creates the opposite problem from overheating. The material welds onto the cutting edge (especially aluminum), ruining surface finish and geometry. BUE is common when running aluminum at steel speeds. Always use recommended cutting speeds and appropriate coolant/lubrication.',

      '**Metric vs Imperial Tooling**: Many American shops mix metric and imperial tooling. A 1/2-inch end mill = 12.7mm. An 8mm end mill = 0.315 inch. The formulas work with either — just be consistent. Chip loads from metric catalogs are in mm/tooth; multiply by 25.4 to get in/tooth if needed.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-speed-calc-full',
      title: 'Full Feeds & Speeds Calculation — Imperial',
      problem: 'Calculate S and F for a 3/8-inch (0.375"), 2-flute HSS end mill roughing 1018 mild steel. HSS cutting speed for mild steel: 90 SFM. Chip load: 0.002 in/tooth.',
      steps: [
        { expression: 'RPM = (90 × 12) / (π × 0.375)', annotation: '= 1080 / 1.178 = 916 RPM → round to S900' },
        { expression: 'F = RPM × chip load × flutes', annotation: '= 900 × 0.002 × 2 = 3.6 IPM → use F3.6 (or F4 if modal)' },
        { expression: 'Plunge feedrate = F × 25%', annotation: '= 3.6 × 0.25 = 0.9 IPM → use F1.0 for plunging' },
        { expression: 'G-code: G97 S900 M03', annotation: 'G97 = RPM mode, S900' },
        { expression: 'G-code: G01 Z-0.250 F1.0', annotation: 'Plunge at 25% feedrate' },
        { expression: 'G-code: G01 X... F3.6', annotation: 'Cut at full chip-load feedrate' },
      ],
      conclusion: 'HSS tools run much slower than carbide (90 SFM vs 300+ for carbide in aluminum). The feedrate F3.6 IPM (91 mm/min) is slow by CNC standards but correct for HSS in steel.',
    },
    {
      id: 'ex-cnc-speed-calc-metric',
      title: 'Full Feeds & Speeds Calculation — Metric',
      problem: 'Calculate S and F for a 16mm, 4-flute carbide end mill roughing 304 stainless steel. Cutting speed: 60 m/min. Chip load: 0.022 mm/tooth.',
      steps: [
        { expression: 'RPM = (60 × 1000) / (π × 16)', annotation: '= 60000 / 50.27 = 1194 RPM → use S1200' },
        { expression: 'F = 1200 × 0.022 × 4', annotation: '= 105.6 mm/min → use F100' },
        { expression: 'Plunge feedrate = 100 × 25%', annotation: '= 25 mm/min → use F25' },
        { expression: 'G-code: G21 G97 S1200 M03', annotation: 'Metric mode, RPM mode, 1200 RPM' },
        { expression: 'G-code: G01 Z-5.0 F25', annotation: 'Plunge to 5mm depth' },
        { expression: 'G-code: G01 X... F100', annotation: 'Cut at full feedrate' },
      ],
      conclusion: 'Stainless runs at low cutting speeds due to work-hardening tendency. The feedrate must be maintained — too slow causes rubbing and work hardening, which kills the tool.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-fs-1',
        type: 'choice',
        text: 'A 10mm, 4-flute carbide end mill at 200 m/min cutting speed. RPM = ?',
        options: ['6366 RPM', '3183 RPM', '12732 RPM', '2000 RPM'],
        answer: '6366 RPM',
      },
      {
        id: 'cnc-fs-2',
        type: 'choice',
        text: 'Feedrate formula for milling is:',
        options: [
          'F = RPM / (chip load × flutes)',
          'F = RPM × chip load × flutes',
          'F = cutting speed × diameter',
          'F = chip load / flutes',
        ],
        answer: 'F = RPM × chip load × flutes',
      },
      {
        id: 'cnc-fs-3',
        type: 'choice',
        text: 'What feedrate should you use when plunging straight down with an end mill?',
        options: [
          'Same as the cutting feedrate',
          '200% of the cutting feedrate (plunging is faster)',
          '25%–33% of the cutting feedrate',
          'Always use F50 for plunging regardless of material',
        ],
        answer: '25%–33% of the cutting feedrate',
      },
      {
        id: 'cnc-fs-4',
        type: 'input',
        text: 'RPM = (cutting speed × 12) / (π × D) is the imperial formula. What is D? ',
        answer: 'tool diameter in inches',
      },
    ]
  },

  mentalModel: [
    'Cutting speed (SFM/m/min) → RPM. Look up from material/tool tables.',
    'Chip load (IPT/MMPT) → feedrate. RPM × chip load × flutes = F.',
    'Plunge rate = 25% of cutting feedrate.',
    'Too fast = overheat, broken tool. Too slow = rubbing, work hardening.',
    '1 SFM = 0.305 m/min. Multiply m/min by 3.281 to get SFM.',
  ],
}
