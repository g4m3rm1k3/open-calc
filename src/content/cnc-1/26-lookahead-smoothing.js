export default {
  id: 'cnc-lookahead-smoothing',
  slug: 'lookahead-and-smoothing',
  chapter: 'cnc-1',
  order: 27,
  title: 'Lookahead and Path Smoothing',
  subtitle: 'G61, G64, and Why Corners Slow You Down',
  tags: ['G61', 'G64', 'lookahead', 'smoothing', 'corner rounding', 'exact stop', 'feed override', 'HSM', 'high-speed machining'],

  semantics: {
    core: [
      { symbol: 'G61', meaning: 'Exact stop mode: the machine fully decelerates to zero feed at the endpoint of every block before starting the next. No blending. Guarantees the programmed corner is hit exactly.' },
      { symbol: 'G64', meaning: 'Continuous mode (path mode): the machine blends adjacent blocks smoothly, maintaining feedrate through corners wherever possible. The default on most controls. May slightly deviate from exact programmed path at transitions.' },
      { symbol: 'G61.1', meaning: 'Exact stop mode for the current block only (some Fanuc variants). One-shot G61 for a single critical corner.' },
      { symbol: 'Lookahead (look-ahead buffer)', meaning: 'The controller pre-reads N upcoming blocks to compute velocity profiles in advance, preventing abrupt deceleration at sharp corners. Deeper lookahead = smoother motion at higher feedrates.' },
      { symbol: 'Corner deceleration', meaning: 'When two moves meet at a sharp angle, the machine must slow down to negotiate the direction change within servo acceleration limits. The lookahead computes how much deceleration is needed for each corner angle.' },
      { symbol: 'Tolerance band (G64 P_)', meaning: 'On some controllers (Fanuc 0i, 30i), G64 P_ sets the maximum path deviation allowed during smoothing. Larger P = smoother = more deviation from programmed path.' },
    ],
    rulesOfThumb: [
      'G64 (continuous mode) is correct for the vast majority of machining: profiling, pocketing, contouring. G61 is for specific situations — boring, tapping, probing — where you must stop exactly at a position.',
      'If your program has many short segments (as from CAM output for curved surfaces), lookahead depth matters enormously. Shallow lookahead causes the machine to slow down hundreds of times per second, drastically cutting effective feedrate.',
      'The machine cannot violate its acceleration limits regardless of G61/G64. The lookahead computes the velocity profile to stay within servo capacity while meeting mode requirements.',
    ]
  },

  hook: {
    question: 'You program G01 at F2000 mm/min, but the machine never seems to reach that speed — it feels like it\'s constantly slowing down and speeding up. What is happening, and which G-code controls it?',
    realWorldContext:
      'A CAM system generates thousands of short G01 segments to approximate a smooth curve. ' +
      'Each segment is a few tenths of a millimeter long. ' +
      'Without proper lookahead and path smoothing, the machine decelerates to (nearly) zero at each segment endpoint, ' +
      'then accelerates into the next segment. At F2000, the machine should be fast — ' +
      'but the constant stop-start reduces actual cutting feedrate to a fraction of programmed speed. ' +
      'Understanding G61 vs G64, and what the lookahead buffer does, is the key to getting full speed from modern HSM (high-speed machining) toolpaths.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          cells: [
            {
              cellTitle: 'G61 vs G64 — Velocity Profile Comparison',
              prose:
                'This animation compares the velocity (feedrate) profile along a multi-segment toolpath under G61 (exact stop) and G64 (continuous/blended). ' +
                'The horizontal axis is distance traveled along the path. The vertical axis is instantaneous feedrate. ' +
                'Notice how G61 forces the velocity to zero at every programmed corner, while G64 blends through them.',
              html: '',
              startCode: `
const canvas = document.getElementById('lookahead-canvas')
const ctx = canvas.getContext('2d')
let frame = 0
const TOTAL = 280

// Simulated path: 8 waypoints with varying corner angles
const waypoints = [
  {x: 40,  y: 160}, {x: 110, y: 160}, {x: 150, y: 120},
  {x: 200, y: 160}, {x: 240, y: 110}, {x: 290, y: 155},
  {x: 340, y: 100}, {x: 400, y: 150},
]

// Compute corner "sharpness" at each interior waypoint (0=straight, 1=90°, 2=180° reversal)
function cornerSharpness(a, b, c) {
  const d1x = b.x-a.x, d1y = b.y-a.y
  const d2x = c.x-b.x, d2y = c.y-b.y
  const len1 = Math.sqrt(d1x*d1x+d1y*d1y)
  const len2 = Math.sqrt(d2x*d2x+d2y*d2y)
  if (len1 < 0.001 || len2 < 0.001) return 0
  const dot = (d1x*d2x + d1y*d2y) / (len1*len2)
  return 1 - Math.max(-1, Math.min(1, dot))  // 0=same dir, 1=90°, 2=reversal
}

function draw() {
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, W, H)

  const t = (frame % TOTAL) / TOTAL
  const mode = frame < TOTAL ? 'G61' : 'G64'
  const isG64 = frame >= TOTAL

  // Chart area
  const chartTop = 180, chartH = 80, chartLeft = 30, chartRight = W - 20

  // --- Draw path (top half) ---
  // Waypoint connections
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.beginPath()
  waypoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
  ctx.stroke()

  // Compute total path length and segment distances
  const segLengths = []
  let totalLen = 0
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i-1].x
    const dy = waypoints[i].y - waypoints[i-1].y
    const l = Math.sqrt(dx*dx + dy*dy)
    segLengths.push(l)
    totalLen += l
  }

  // Corner sharpnesses
  const sharpness = [0]
  for (let i = 1; i < waypoints.length - 1; i++) {
    sharpness.push(cornerSharpness(waypoints[i-1], waypoints[i], waypoints[i+1]))
  }
  sharpness.push(0)

  // Velocity at each waypoint
  const maxV = 1.0
  const velocities = waypoints.map((_, i) => {
    if (i === 0 || i === waypoints.length-1) return 0
    if (isG64) {
      // G64: blend — reduce speed proportional to sharpness, but never to zero
      return maxV * Math.max(0.25, 1 - sharpness[i] * 0.6)
    } else {
      // G61: exact stop — velocity goes to 0 at every interior corner
      return 0
    }
  })

  // Cumulative distance array
  const cumDist = [0]
  for (const l of segLengths) cumDist.push(cumDist[cumDist.length-1] + l)
  const norm = d => (d / totalLen) * (chartRight - chartLeft) + chartLeft

  // --- Draw velocity chart ---
  // Background
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(chartLeft, chartTop, chartRight - chartLeft, chartH)
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 0.5
  ctx.strokeRect(chartLeft, chartTop, chartRight - chartLeft, chartH)

  // Grid lines
  ctx.strokeStyle = '#1e293b'
  ctx.setLineDash([3,3])
  ctx.beginPath(); ctx.moveTo(chartLeft, chartTop + chartH/2); ctx.lineTo(chartRight, chartTop + chartH/2); ctx.stroke()
  ctx.setLineDash([])

  // Labels
  ctx.fillStyle = '#475569'
  ctx.font = '8px monospace'
  ctx.textAlign = 'right'
  ctx.fillText('F max', chartLeft - 2, chartTop + 5)
  ctx.fillText('0', chartLeft - 2, chartTop + chartH)

  // Velocity profile curve
  const color = isG64 ? '#38bdf8' : '#f87171'
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < waypoints.length; i++) {
    const px = norm(cumDist[i])
    const vy = chartTop + chartH - velocities[i] * chartH
    i === 0 ? ctx.moveTo(px, vy) : ctx.lineTo(px, vy)
  }
  ctx.stroke()

  // Corner markers on velocity chart
  for (let i = 1; i < waypoints.length-1; i++) {
    const px = norm(cumDist[i])
    ctx.fillStyle = sharpness[i] > 0.5 ? '#fbbf24' : '#475569'
    ctx.beginPath(); ctx.arc(px, chartTop + chartH - velocities[i] * chartH, 3, 0, Math.PI*2); ctx.fill()
  }

  // Tool position on path
  const toolDist = t * totalLen
  let seg = 0, distAcc = 0
  for (let i = 0; i < segLengths.length; i++) {
    if (distAcc + segLengths[i] >= toolDist || i === segLengths.length-1) { seg = i; break }
    distAcc += segLengths[i]
  }
  const segT = segLengths[seg] > 0 ? (toolDist - distAcc) / segLengths[seg] : 0
  const tp = {
    x: waypoints[seg].x + (waypoints[seg+1].x - waypoints[seg].x) * segT,
    y: waypoints[seg].y + (waypoints[seg+1].y - waypoints[seg].y) * segT,
  }

  // Draw executed path portion
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  waypoints.slice(0, seg+1).forEach((p, i) => i===0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
  ctx.lineTo(tp.x, tp.y)
  ctx.stroke()

  // Tool dot
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(tp.x, tp.y, 5, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(tp.x, tp.y, 3, 0, Math.PI*2); ctx.fill()

  // Waypoint markers (corners)
  waypoints.slice(1, -1).forEach((p, i) => {
    ctx.fillStyle = sharpness[i+1] > 0.5 ? '#fbbf24' : '#334155'
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill()
  })

  // Mode indicator and velocity indicator on chart
  const curVelIdx = Math.min(Math.round(t * (waypoints.length-1)), waypoints.length-1)
  const curVel = velocities[curVelIdx]
  const chartX = norm(toolDist)
  ctx.strokeStyle = color + '80'
  ctx.lineWidth = 1
  ctx.setLineDash([3,3])
  ctx.beginPath(); ctx.moveTo(chartX, chartTop); ctx.lineTo(chartX, chartTop + chartH); ctx.stroke()
  ctx.setLineDash([])

  // Mode label
  ctx.fillStyle = color
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(isG64 ? 'G64 CONTINUOUS' : 'G61 EXACT STOP', 36, 25)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '9px monospace'
  ctx.fillText(isG64
    ? 'Machine blends through corners — feedrate stays high'
    : 'Machine stops completely at each corner — feedrate collapses', 36, 38)

  // Average feedrate indicator
  const avgV = velocities.reduce((a,b) => a+b, 0) / velocities.length
  ctx.fillStyle = '#94a3b8'
  ctx.font = '9px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(\`Avg feed: \${Math.round(avgV * 100)}% of F max\`, chartRight, 25)

  frame = (frame + 1) % (TOTAL * 2)
  requestAnimationFrame(draw)
}
draw()
              `,
              canvasId: 'lookahead-canvas',
              canvasWidth: 440,
              canvasHeight: 280,
            },
          ]
        },
        title: 'G61 vs G64 Velocity Profiles',
        caption: 'The animation cycles through G61 and G64 on the same toolpath. Yellow dots mark sharp corners. In G61 mode, velocity drops to zero at every corner — the feedrate profile looks like a saw wave. In G64, the machine blends through corners, maintaining significantly higher average feedrate.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(EXACT STOP vs CONTINUOUS MODE)\n' +
            '(G61 = exact stop at every corner)\n' +
            '(G64 = smooth blend through corners)\n' +
            '\n' +
            'G21 G90 G17 G40 G49 G80\n' +
            'T1 M06\n' +
            'G43 H1\n' +
            'S1500 M03\n' +
            'G54\n' +
            '\n' +
            '(TRY 1: G64 CONTINUOUS - CHANGE TO G61 AND COMPARE)\n' +
            'G64\n' +
            'G00 X0 Y0 Z5.\n' +
            'G01 Z-2. F150\n' +
            'G01 X50. F800\n' +
            'G01 X50. Y50.\n' +
            'G01 X0 Y50.\n' +
            'G01 X0 Y0\n' +
            'G00 Z50.\n' +
            'M30',
        },
        title: 'G61 vs G64 Lab',
        caption: 'Swap G64 for G61 in the editor and re-run. In a real machine the difference shows in cycle time and corner finish. In the backplot, both look identical — G61/G64 affects velocity, not the programmed path.',
      }
    ],
    prose: [
      '**The Problem with Short Segments**: Modern CAM software outputs toolpaths as sequences of tiny G01 moves — each segment might be only 0.05–0.5mm long. At F2000 mm/min, each segment takes 1.5–15 milliseconds. At each endpoint, the controller must decide: stop here, or blend into the next move? With G61, it always stops. The machine decelerates, touches zero, reaccelerates — for every single one of those thousands of segments. Actual cutting speed drops to a fraction of programmed feed.',

      '**G64 — Continuous/Blended Mode**: In G64, the controller looks ahead at upcoming blocks (the lookahead buffer) and computes a continuous velocity profile. If two consecutive moves are nearly collinear, the machine barely slows down. If they meet at 90°, it slows more — but not necessarily to zero. The result is a smooth velocity profile that maintains high average feedrate while still respecting servo acceleration limits.',

      '**G61 — Exact Stop Mode**: In G61, the machine decelerates to zero at the endpoint of every block before beginning the next one. This guarantees that the tool reaches the exact programmed XYZ coordinate. It is slow on multi-segment paths, but it is correct and predictable. Use it for: probing cycles (where the probe must trigger at rest), boring bar retract positions, tapping retract positions, and any operation where the machine absolutely must touch a specific point before continuing.',

      '**The Lookahead Buffer**: A modern Fanuc 30i or Siemens 840D controller may look ahead 200–2000 blocks. Older controls look ahead 4–16 blocks. For HSM (high-speed machining) with CAM output of 0.1mm segments, a 16-block lookahead covers only 1.6mm of path — barely enough time to plan a smooth deceleration into a tight corner. A 2000-block lookahead covers 200mm and can maintain F5000+ smoothly through complex 3D surfaces.',

      '**G64 P_ — Tolerance Band** (Fanuc 0i/30i and above): `G64 P0.01` permits the controller to deviate up to 0.01mm from the programmed path during blending. Larger tolerance = smoother at higher speeds but more path error. For finish passes on precision surfaces, use a small P value or G61. For roughing, a larger P dramatically improves cycle time. Siemens 840D has a similar parameter called SOFT (smooth interpolation) and COMPCAD.',

      '**Practical Mode Selection**:\n' +
      '- **Roughing / pocketing**: G64 (possibly with larger P tolerance). Speed matters, accuracy is secondary.\n' +
      '- **Contouring / finishing**: G64 with a tight P tolerance, or G61 on critical corners.\n' +
      '- **Drilling / boring / probing**: G61 — you must reach the exact hole bottom.\n' +
      '- **Tapping**: G61 or the tap cycle\'s built-in exact-stop behavior.',
    ],
  },

  math: {
    prose: [
      'The minimum deceleration distance before a corner of angle θ:',
      '$d_{\\text{dec}} = \\frac{v^2}{2 \\cdot a_{\\text{max}}}$',
      'Where v is the current feedrate (m/s) and a_max is the servo\'s maximum deceleration (m/s²).',
      'For a corner angle change of Δθ, the maximum blend-through speed in G64 is:',
      '$v_{\\text{corner}} = v_{\\text{max}} \\cdot \\cos\\left(\\frac{\\Delta\\theta}{2}\\right)$',
      'At Δθ = 0° (straight line): v_corner = v_max (no deceleration needed).',
      'At Δθ = 90°: v_corner ≈ 0.707 × v_max (√2/2 reduction).',
      'At Δθ = 180° (full reversal): v_corner = 0 (must stop).',
      'This formula explains why shallow-angle corners are almost free (machine barely decelerates) while sharp corners are expensive (large speed reduction required). The lookahead computes this for every upcoming corner and builds a smooth velocity ramp in advance.',
    ],
  },

  rigor: {
    prose: [
      '**Jerk limits and S-curves**: Modern high-end controllers (Fanuc 30i, Siemens 840D) apply jerk limits (rate of change of acceleration) in addition to acceleration limits. This creates S-curve velocity profiles instead of trapezoidal ones, further reducing mechanical shock on machine axes and improving surface finish at high feedrates.',

      '**CAM post-processor interaction**: Most CAM post-processors emit a G64 (or equivalent) at the start of 3D contouring toolpaths and G61 at the start of drilling cycles. If your post-processor is not setting the correct mode, you can add it manually to the program header. Always verify.',

      '**AICC / AI nano contour control**: Fanuc AICC (AI Contour Control) and similar features on high-end controls extend the lookahead to thousands of blocks and apply predictive algorithms to maintain feedrate through complex 3D surface toolpaths. These are machine parameter/option settings, not G-codes. They work alongside G64.',

      '**G61 produces better corner geometry**: On a square pocket corner that must be sharp (0° radius), G61 guarantees the tool reaches the exact corner coordinate. G64 will slightly round the corner within its tolerance band. For die/mold work where the toolpath produces the final form, G61 on corners and G64 on straight runs (or AI contour control for the entire path) is the standard approach.',
    ],
  },

  examples: [
    {
      id: 'ex-lookahead-corner-speed',
      title: 'Calculate Corner Speed at 90° in G64',
      problem: 'A machine runs at F3000 mm/min (50 mm/s). At a 90° corner (Δθ = 90°), what is the maximum blend-through speed in G64 mode?',
      steps: [
        { expression: 'v_max = 3000 mm/min = 50 mm/s', annotation: 'Convert programmed feedrate to mm/s.' },
        { expression: 'Δθ = 90°', annotation: 'A square corner — the most common case.' },
        { expression: 'v_corner = 50 × cos(90°/2) = 50 × cos(45°)', annotation: 'Apply the corner blend formula.' },
        { expression: 'v_corner = 50 × 0.7071 = 35.35 mm/s ≈ 2121 mm/min', annotation: 'Blend-through speed at a 90° corner is about 70% of programmed feedrate.' },
      ],
      conclusion: 'At a 90° corner, G64 allows blending at ~70% of feedrate. At a 45° corner it would be ~92%. At 180° (reversal), it must drop to 0. The lookahead pre-computes and schedules these decelerations in advance.',
    },
    {
      id: 'ex-lookahead-cycle-time',
      title: 'G61 vs G64 Cycle Time on a Short-Segment Toolpath',
      problem: 'A CAM path has 200 segments of 0.2mm each (40mm total). Programmed feed F2000 mm/min. Machine a_max = 500 mm/s². Compare cycle times in G61 vs G64.',
      steps: [
        { expression: 'G64: mostly at F2000 ≈ 33.3 mm/s → 40mm ÷ 33 mm/s ≈ 1.2 s', annotation: 'With G64, the machine maintains near-max feedrate through shallow corners.' },
        { expression: 'G61: each segment = decel + 0.2mm + accel', annotation: 'Every segment requires full stop and restart.' },
        { expression: 'Stop/start per segment: v²/a = (33)²/500 ≈ 2.2 mm each way', annotation: 'Deceleration distance for v=33mm/s at 500mm/s².' },
        { expression: 'But segments are only 0.2mm! Machine barely reaches 10 mm/s per segment', annotation: 'Short segments in G61 severely limit achievable speed.' },
        { expression: 'G61 cycle time ≈ 4–8× longer than G64 for this path', annotation: 'Real-world measurement on HSM toolpaths confirms this order of magnitude difference.' },
      ],
      conclusion: 'For CAM-generated paths with short segments, G61 is prohibitively slow. G64 with appropriate lookahead depth is mandatory for high-speed machining.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-la-1',
        type: 'choice',
        text: 'G61 mode causes the machine to:',
        options: [
          'Skip short segments for faster motion',
          'Decelerate to zero at the endpoint of every block before starting the next',
          'Blend motion smoothly through corners',
          'Enable high-speed machining mode',
        ],
        answer: 'Decelerate to zero at the endpoint of every block before starting the next',
      },
      {
        id: 'cnc-la-2',
        type: 'choice',
        text: 'Which mode should you use for a drilling cycle that requires exact hole positioning?',
        options: ['G64', 'G61', 'G17', 'G49'],
        answer: 'G61',
      },
      {
        id: 'cnc-la-3',
        type: 'choice',
        text: 'What does a deeper lookahead buffer enable?',
        options: [
          'Faster rapid traverse speed',
          'Higher maximum spindle RPM',
          'Smoother velocity profiles on paths with many short segments at high feedrates',
          'Larger tool diameter compensation',
        ],
        answer: 'Smoother velocity profiles on paths with many short segments at high feedrates',
      },
      {
        id: 'cnc-la-4',
        type: 'choice',
        text: 'At a 180° reversal (the tool must go back the way it came), G64 will:',
        options: [
          'Maintain full feedrate through the reversal',
          'Slow to 50% feedrate',
          'Decelerate to zero — a reversal cannot be blended',
          'Skip the reversal and go straight through',
        ],
        answer: 'Decelerate to zero — a reversal cannot be blended',
      },
      {
        id: 'cnc-la-5',
        type: 'choice',
        text: 'G64 P0.01 means:',
        options: [
          'The lookahead buffer holds 0.01 seconds of data',
          'The machine may deviate up to 0.01mm from the programmed path during blending',
          'The feedrate is limited to 0.01% of programmed feed',
          'Exact stop tolerance is 0.01mm',
        ],
        answer: 'The machine may deviate up to 0.01mm from the programmed path during blending',
      },
    ]
  },

  mentalModel: [
    'G64 = blend/continuous. Machine smooths through corners. Use for contouring, pocketing.',
    'G61 = exact stop. Machine stops at every endpoint. Use for drilling, boring, probing.',
    'Lookahead buffer: more blocks = smoother HSM toolpaths at high feed.',
    'Corner speed formula: v_corner = v_max × cos(Δθ/2). 90° corner = 70% speed, 180° = 0.',
    'Short CAM segments + G61 = catastrophically slow. Always use G64 for 3D surface machining.',
    'G64 P_ sets path deviation tolerance. Larger = faster, more deviation.',
  ],
}
