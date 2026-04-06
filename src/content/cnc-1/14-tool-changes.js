export default {
  id: 'cnc-tool-changes',
  slug: 'tool-changes',
  chapter: 'cnc-1',
  order: 14,
  title: 'Tool Changes',
  subtitle: 'T-Word, M06, and the Automatic Tool Changer',
  tags: ['T-word', 'M06', 'ATC', 'tool change', 'H-word', 'D-word', 'G43', 'tool table'],

  semantics: {
    core: [
      { symbol: 'T_', meaning: 'Tool select: loads the specified tool number into the spindle pocket (or stages it in the carousel). On most ATCs, this does NOT physically change the tool — it only stages it.' },
      { symbol: 'M06', meaning: 'Tool change execute: physically executes the staged tool change. The spindle moves to the tool change position (usually Z-axis home), the ATC swaps the tools, and the new tool is clamped in the spindle.' },
      { symbol: 'H_', meaning: 'Tool length offset number: selects which offset register to use with G43/G44. Typically matches the tool number (H1 for T1, H2 for T2, etc.).' },
      { symbol: 'D_', meaning: 'Cutter diameter offset number: selects the radius offset for cutter compensation (G41/G42). Also typically matches tool number.' },
      { symbol: 'G43 H_', meaning: 'Apply tool length offset. The Z-axis position is automatically adjusted by the stored length offset for the specified H register.' },
      { symbol: 'G49', meaning: 'Cancel tool length offset. Returns Z to uncompensated mode. Part of the safe start block.' },
      { symbol: 'M61', meaning: 'Okuma equivalent of M06 (varies by builder). Some machines use M61 or other codes.' },
    ],
    rulesOfThumb: [
      'Always home Z (G91 G28 Z0) before M06. The ATC arm needs Z at the reference position to safely swap tools — commanding M06 at a random Z position can crash the arm.',
      'T_ and M06 are almost always written on separate lines. The T-word stages the next tool during cutting; M06 fires at the end of the operation. This saves time on machines with slow carousels.',
      'Always follow M06 with G43 H[toolnumber] to activate the new tool\'s length offset. Forgetting G43 after a tool change causes a Z-height error — usually a gouge or air cut.',
    ]
  },

  hook: {
    question: 'What actually happens inside the machine between the line "T2 M06" and the first G01 cut with the new tool? And why does the machine move Z all the way up first?',
    realWorldContext:
      'A CNC program with multiple operations — rough, semi-finish, drill, tap — requires different tools. ' +
      'The **Automatic Tool Changer (ATC)** is the robot arm or carousel system that makes this possible without stopping the machine for a human to swap tools. ' +
      'Understanding the exact sequence — stage, retract, swap, clamp, compensate — is essential for writing programs that do not crash the machine or produce out-of-tolerance parts. ' +
      'A missed G43 after a tool change is one of the most common causes of scrap parts in real shops.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(TOOL CHANGE SEQUENCE)\n' +
            '(Shows the standard two-step: stage + execute)\n' +
            '\n' +
            'G21 G90 G17 G40 G49 G80\n' +
            '\n' +
            '(--- OPERATION 1: FACE MILL ---)\n' +
            'T1 M06              (STAGE T1, EXECUTE CHANGE)\n' +
            'G43 H1              (APPLY T1 LENGTH OFFSET)\n' +
            'S1200 M03\n' +
            'M08\n' +
            'G54\n' +
            'G00 X-10. Y0 Z5.\n' +
            'G01 Z-0.5 F80\n' +
            'G01 X60. F300\n' +
            'G00 Z50.\n' +
            '\n' +
            '(--- OPERATION 2: DRILL ---)\n' +
            'T2                  (STAGE T2 DURING PREVIOUS OPERATION)\n' +
            'M06                 (EXECUTE TOOL CHANGE AT SAFE Z)\n' +
            'G43 H2\n' +
            'S2500 M03\n' +
            'G00 X10. Y10.\n' +
            'G81 Z-20. R3. F100\n' +
            'G00 X30. Y10.\n' +
            'G81 Z-20. R3. F100\n' +
            'G80\n' +
            'G00 Z50.\n' +
            'M09 M05\n' +
            'M30'
        },
        title: 'Two-Step ATC Sequence',
        caption: 'Notice T2 is staged at the start of operation 2 before M06 fires. On machines with long carousel indexing times, staging T2 during the face-mill operation can save several seconds per part.',
      },
      {
        id: 'ScienceNotebook',
        props: {
          cells: [
            {
              cellTitle: 'ATC Motion Sequence — Z Retract → Swap → Reposition',
              prose:
                'This animation shows the three phases of a tool change on a vertical machining center: ' +
                '(1) Z retracts to machine home (G28 Z0), (2) the ATC arm swaps tools, (3) Z descends to the approach position above the part.',
              html: '',
              startCode: `
const canvas = document.getElementById('atc-canvas')
const ctx = canvas.getContext('2d')
let frame = 0
const TOTAL = 240

function draw() {
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, W, H)

  const isDark = true
  const t = frame / TOTAL

  // Phase boundaries: 0-0.3 = retract, 0.3-0.6 = swap, 0.6-1.0 = approach
  const phase = t < 0.3 ? 0 : t < 0.6 ? 1 : 2
  const phaseT = phase === 0 ? t / 0.3 : phase === 1 ? (t - 0.3) / 0.3 : (t - 0.6) / 0.4

  // Machine body
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(W*0.1, 20, W*0.8, H*0.7)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.strokeRect(W*0.1, 20, W*0.8, H*0.7)

  // Tool carousel (right side)
  const carX = W * 0.75, carY = 80
  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.arc(carX, carY, 38, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#64748b'
  ctx.beginPath()
  ctx.arc(carX, carY, 28, 0, Math.PI * 2)
  ctx.fill()
  // Tool pockets on carousel
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2
    const px = carX + Math.cos(angle) * 30
    const py = carY + Math.sin(angle) * 30
    ctx.fillStyle = i === 1 ? '#f59e0b' : '#1e3a5f'
    ctx.beginPath()
    ctx.arc(px, py, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#94a3b8'
  ctx.font = '9px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('ATC', carX, carY + 3)

  // Spindle column
  const colX = W * 0.4
  ctx.fillStyle = '#334155'
  ctx.fillRect(colX - 12, 20, 24, H * 0.65)

  // Z machine home line
  const zHome = 60
  ctx.strokeStyle = '#4ade80'
  ctx.lineWidth = 0.7
  ctx.setLineDash([4, 3])
  ctx.beginPath(); ctx.moveTo(W*0.1, zHome); ctx.lineTo(W*0.9, zHome); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#4ade80'
  ctx.font = '8px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('Z machine home (G28)', W*0.1 + 4, zHome - 3)

  // Part surface
  const partY = H * 0.6
  ctx.fillStyle = '#94a3b8'
  ctx.fillRect(W*0.2, partY, W*0.45, 12)
  ctx.fillStyle = '#64748b'
  ctx.font = '8px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('PART', W*0.2 + 4, partY + 9)

  // Z approach line
  const zApproach = partY - 40
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 0.7
  ctx.setLineDash([3, 4])
  ctx.beginPath(); ctx.moveTo(W*0.1, zApproach); ctx.lineTo(W*0.7, zApproach); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('Z approach (R plane)', W*0.1 + 4, zApproach - 3)

  // Spindle + tool Z position
  let spindleZ
  const cutZ = partY - 10
  if (phase === 0) {
    // Retracting: from cut depth to Z home
    spindleZ = cutZ + (zHome - cutZ) * phaseT
  } else if (phase === 1) {
    spindleZ = zHome  // at home while swapping
  } else {
    // Approaching: from Z home to approach
    spindleZ = zHome + (zApproach - zHome) * phaseT
  }

  // Draw spindle + tool
  ctx.fillStyle = '#64748b'
  ctx.fillRect(colX - 8, spindleZ - 12, 16, 20)  // spindle housing
  // Tool (yellow = new during phase 2, gray otherwise)
  ctx.fillStyle = phase === 2 ? '#f59e0b' : '#94a3b8'
  ctx.fillRect(colX - 3, spindleZ + 8, 6, 20)  // tool body
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(colX - 3, spindleZ + 26, 6, 5)   // cutting end

  // Phase labels
  const phases = ['① Z RETRACTING', '② TOOL SWAP', '③ Z APPROACHING']
  const phaseColors = ['#fbbf24', '#f59e0b', '#38bdf8']
  ctx.fillStyle = phaseColors[phase]
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(phases[phase], W / 2, H * 0.82)

  // Current tool indicator
  const toolNum = phase < 2 ? 1 : 2
  ctx.fillStyle = '#94a3b8'
  ctx.font = '9px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(\`Active tool: T\${toolNum}\`, W / 2, H * 0.89)

  // Progress bar
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(W*0.1, H*0.93, W*0.8, 8)
  ctx.fillStyle = phaseColors[phase]
  ctx.fillRect(W*0.1, H*0.93, W*0.8*t, 8)

  frame = (frame + 1) % TOTAL
  requestAnimationFrame(draw)
}
draw()
              `,
              canvasId: 'atc-canvas',
              canvasWidth: 520,
              canvasHeight: 280,
            },
          ]
        },
        title: 'ATC Motion Sequence',
        caption: 'Three phases of every tool change: retract Z to machine home, execute the physical swap, then descend to the approach position. If any phase is interrupted (wrong Z on M06, missing G43 after), the program is unsafe.',
      }
    ],
    prose: [
      '**The Two-Step Design**: `T_` and `M06` are always two separate actions by design. `T2` tells the carousel to rotate and stage tool #2 in the ready position — but the tool in the spindle does not change yet. `M06` fires the physical exchange: the spindle moves to the ATC position, the arm swoops in, pulls the current tool, inserts the staged tool, and retracts. On slow carousels, staging the next tool (`T2`) during the previous cut buys time — the carousel can rotate during machining instead of making you wait.',

      '**Why Z Must Retract First**: The ATC arm needs physical clearance to reach the spindle. On most machines, the safe exchange position is Z machine home (or a defined second reference point). When the controller sees M06, it may auto-retract Z to home internally — but best practice is to always explicitly return Z to home in your program before M06. Never rely on the controller to do this silently; explicit code is safe code.',

      '**G43 H_ — Length Compensation Activation**: Every tool is a different length. After a tool change, you must activate the new tool\'s stored length offset so that Z-axis depths are correct relative to the workpiece. `G43 H1` reads the length offset stored in offset register H1 and adds it to all subsequent Z moves. Forgetting G43 after M06 means the new tool operates as if it has zero length — almost certainly wrong, often dangerous.',

      '**H-number and T-number**: There is no automatic link between T and H in the G-code standard — you must explicitly specify `G43 H[number]`. Convention is H matches T (T1 → G43 H1, T2 → G43 H2), and most shops follow this. Some controllers have a parameter to auto-apply H on M06, but never assume this on an unfamiliar machine.',

      '**The Standard Change Block**: The industry-standard tool change sequence is:\n```\nT2 M06          (stage and execute)\nG43 H2          (activate length offset)\nS2000 M03       (start spindle)\nM08             (coolant on)\n```\nThese four lines must appear in this order. The spindle should not be started until after G43 is applied.',
    ],
  },

  math: {
    prose: [
      'Tool length compensation adjusts the Z-axis zero point:',
      '$Z_{\\text{compensated}} = Z_{\\text{programmed}} + H_{\\text{offset}}$',
      'If the tool in H1 has an offset of 75.342 mm (distance from gauge line to tip), and you command `G01 Z-5.`, the machine actually moves to:',
      '$Z_{\\text{machine}} = -5.000 + (-75.342) = -80.342 \\text{ mm}$',
      '(The H offset is negative because longer tools reach further into negative Z.)',
      'When you run a different tool (H2 = 82.015 mm), the same `G01 Z-5.` becomes:',
      '$Z_{\\text{machine}} = -5.000 + (-82.015) = -87.015 \\text{ mm}$',
      'The programmed depth stays the same. Only the machine position changes to put the tip at the right place.',
    ],
  },

  rigor: {
    prose: [
      '**M06 behavior is builder-specific**: On Fanuc, M06 executes the staged tool change immediately. On some builders, M06 auto-homes Z before swapping; on others, you must home Z manually first. Always read the machine\'s operation manual for exact M06 behavior before running on a new machine.',

      '**Manual tool changers**: Not all CNC machines have ATCs. On a manual tool change (MTC) machine, M06 generates a program stop — the spindle halts, an alarm or light prompts the operator, and the machine waits until the operator manually changes the tool and presses cycle start. G43 is still needed after a manual change.',

      '**Tool life management and T-offset relationships**: Modern controllers track tool life (edge wear, cutting time, hole count) and can automatically substitute a sister tool when the primary wears out. In these setups, T and H may diverge — the controller maps T2 to H12 (the sister tool\'s offset). This is a shop-level configuration, not a G-code feature.',

      '**Spindle orientation for ATC**: Many ATCs require the spindle to be at a specific angular orientation (usually 0°) before the arm engages, so the tool\'s key groove aligns with the arm\'s key slot. The controller handles this internally when M06 is commanded. On some machines, M19 (spindle orient) must be explicitly called before M06.',
    ],
  },

  examples: [
    {
      id: 'ex-tool-change-standard',
      title: 'Three-Operation Program with Correct Tool Changes',
      problem: 'Write the tool change header for a program using T1 (face mill), T2 (drill), and T3 (tap) — showing the staging optimization.',
      steps: [
        { expression: 'T1 M06', annotation: 'First tool change: stage and execute T1. No previous tool to pre-stage yet.' },
        { expression: 'G43 H1 / S1200 M03 / M08 / ... face mill cut ...', annotation: 'Full operation 1.' },
        { expression: 'T2  (stage BEFORE M06)', annotation: 'Pre-stage T2 during face mill cut. Carousel rotates while the spindle is still cutting.' },
        { expression: 'G00 Z50. / M05 M09 / T2 M06', annotation: 'Safe retract, spindle stop, then execute the tool change. M06 fires at safe Z.' },
        { expression: 'G43 H2 / S2500 M03 / M08 / ... drill ...', annotation: 'Operation 2 begins with correct length offset.' },
        { expression: 'T3 / ... (at end of drill op) ... / M06 / G43 H3', annotation: 'Same pattern: stage T3 early, fire M06 at safe Z, activate G43 H3.' },
      ],
      conclusion: 'Pre-staging saves carousel rotation time. The tool change itself (M06 execution) is the same cost — but the carousel can spin during cutting instead of during cycle stop.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-tc-1',
        type: 'choice',
        text: 'What does the T-word (e.g. T2) do on most ATCs?',
        options: [
          'Immediately swaps the tool in the spindle',
          'Stages the tool in the ready position without swapping yet',
          'Activates the tool length offset',
          'Sets the spindle speed for the new tool',
        ],
        answer: 'Stages the tool in the ready position without swapping yet',
      },
      {
        id: 'cnc-tc-2',
        type: 'choice',
        text: 'Which code executes the physical tool exchange?',
        options: ['T2', 'M06', 'G43', 'M05'],
        answer: 'M06',
      },
      {
        id: 'cnc-tc-3',
        type: 'choice',
        text: 'What is the correct code to activate the length offset for tool 3?',
        options: ['T3 M06', 'G43 H3', 'G49 H3', 'M06 H3'],
        answer: 'G43 H3',
      },
      {
        id: 'cnc-tc-4',
        type: 'choice',
        text: 'Why must Z be at machine home before M06 fires?',
        options: [
          'The controller requires Z home to reset the position counter',
          'The ATC arm needs physical clearance to reach the spindle',
          'G43 only works from Z home',
          'M06 homes Z automatically — it does not matter',
        ],
        answer: 'The ATC arm needs physical clearance to reach the spindle',
      },
      {
        id: 'cnc-tc-5',
        type: 'choice',
        text: 'What happens if you omit G43 H2 after a T2 M06 tool change?',
        options: [
          'The machine alarms out immediately',
          'The controller uses the previous tool\'s offset',
          'Z operates with zero length offset — the wrong tool tip depth',
          'G49 is automatically applied',
        ],
        answer: 'Z operates with zero length offset — the wrong tool tip depth',
      },
    ]
  },

  mentalModel: [
    'T_ = stage (pre-position carousel). M06 = execute swap.',
    'Always G43 H_ immediately after M06 — never skip it.',
    'Home Z explicitly before M06. Never rely on the controller to do it silently.',
    'Pre-stage the next tool (T_) during the current cut to save cycle time.',
    'Standard sequence: T_ M06 → G43 H_ → S_ M03 → M08.',
    'H-number convention: matches T-number. T1 → G43 H1.',
  ],
}
