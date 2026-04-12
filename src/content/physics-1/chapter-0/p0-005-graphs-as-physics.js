export default {
  id: 'p0-005',
  slug: 'graphs-as-physics',
  chapter: 'p0',
  order: 4,
  title: 'Graphs as Physics',
  subtitle: 'Reading position, velocity, and acceleration from curves — without solving a single equation.',
  tags: ['x-t graph', 'v-t graph', 'slope', 'area under curve', 'graph reading', 'motion analysis', 'kinematics graphs'],

  hook: {
    question:
      'A police officer shows you a position-time graph from a speed camera. The graph is a steep straight line going upward. You don\'t know the equation. You don\'t need it. Just by looking at the slope of the line, you can instantly tell:this car was moving fast and at constant speed. If the graph curves upward, it was accelerating. If it\'s flat, the car was stopped. Every physics graph is a picture of the motion — if you know how to read it. What does every feature of an x-t or v-t graph tell you?',
    realWorldContext:
      'Seismologists read earthquake waves from time-series graphs. Doctors read heart rhythms from ECGs. Engineers read stress vs. time from structural monitoring. Physicists read particle trajectories from detector readouts. In all of these: understanding what slopes and areas mean is the fundamental skill. This lesson makes you fluent in the visual language of physics.',
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'xt-vt-graphs' },
  },

  intuition: {
    prose: [
      '**The x–t graph: slope = velocity. **On a position-vs-time graph (x on the vertical axis, t on the horizontal),the slope of the curve at any point equals the instantaneous velocity at that moment. Steep positive slope → moving fast in the positive direction. Zero slope (horizontal) → momentarily stopped or at constant position. Steep negative slope → moving fast in the negative direction. Curved upward (increasing slope) → speeding up. Curved downward (decreasing slope) → slowing down.',

      '**The v–t graph: slope = acceleration, area = displacement. **On a velocity-vs-time graph, the slope at any point equals the instantaneous acceleration. But there is a second tool: the **area under the v–t graph** equals displacement. A rectangle of width Δt and height v gives displacement v·Δt. Many rectangles stacked up approximate the total displacement over any interval. As the rectangles shrink to zero width — this is the integral. No calculus notation needed yet: just "area under the curve equals displacement."',

      '**Reading motion stories from graphs. **Every x–t or v–t graph tells a story. A flat x–t line: the object is at rest. A straight x–t line with positive slope: constant positive velocity. A parabolic x–t curve opening upward: constant positive acceleration from rest. A straight v–t line with negative slope: constant deceleration. A v–t graph touching zero and bouncing: the object turned around (direction reversed). Reading these patterns is faster than solving equations — and builds intuition that equations alone cannot give.',

      '**The twin graphs — x–t and v–t together. **The x–t and v–t graphs are linked by the slope relationship. Wherever x–t has zero slope, the v–t graph crosses zero. Wherever x–t has maximum slope, v–t has its maximum value. Wherever x–t is a parabola, v–t is a straight line. Looking at both graphs simultaneously — one describes position, the other its rate of change — gives a complete picture of the motion.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 8 — Chapter 0: Orientation',
        body:
          '**Previous (Lesson 4):** Average vs instantaneous — slope of secant vs tangent.\\n**This lesson:** Graphs — reading x–t and v–t graphs for motion information.\\n**Next (Lesson 6):** Vectors vs scalars — direction matters.\\n**Why it matters:** Every kinematic problem in Ch. 1–2 has a graphical interpretation.',
      },
      {
        type: 'theorem',
        title: 'The two fundamental graph relationships',
        body:
          '\\text{On an } x\\text{-}t \\text{ graph: slope at any point} = v(t) \\\\\\text{On a } v\\text{-}t \\text{ graph: slope at any point} = a(t) \\\\\\text{On a } v\\text{-}t \\text{ graph: area under curve from } t_1 \\text{ to } t_2 = \\Delta x',
      },
      {
        type: 'insight',
        title: 'What each graph shape means',
        body:
          '\\text{x–t flat: object at rest.}\\\\\\text{x–t straight line: constant velocity.}\\\\\\text{x–t parabola opening up: constant positive acceleration.}\\\\\\text{v–t flat: constant velocity (zero acceleration).}\\\\\\text{v–t straight line: constant acceleration.}\\\\\\text{v–t crosses zero: object reversed direction.}',
      },
      {
        type: 'warning',
        title: 'Height vs slope — the most common graph-reading mistake',
        body:
          '\\text{High position on an x–t graph ≠ high velocity.}\\\\\\text{Velocity comes from SLOPE, not from how high the curve sits.}\\\\\\text{An object can be at high x with zero velocity (at rest up high).}\\\\\\text{Similarly on v–t: high velocity ≠ high acceleration.}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'x–t and v–t graphs side by side',
        mathBridge:
          'Cover the v–t panel. On the x–t graph: identify where the slope is steepest (fastest),where it is zero (stopped), where it is decreasing (slowing down). Now uncover the v–t panel. The peak of the x–t slope corresponds to the peak of v–t. The zero slope of x–t corresponds to v–t crossing zero.',
        caption: 'Slope of x–t = value of v–t. Slope of v–t = value of a. Area under v–t = Δx.',
      },
      {
        id: 'PositionVelocityAcceleration',
        title: 'Live x(t), v(t), a(t) — drag the time slider',
        mathBridge:
          'Drag the slider to move through time. Watch all three graphs update simultaneously. Pay attention to the sign of v when x is decreasing,and the sign of a when v is decreasing.',
        caption: 'The three kinematic functions are three views of the same motion.',
      },
    ],
  },

  math: {
    prose: [
      '**Reading average velocity from an x–t graph. **Draw a straight line (secant) between two points \\((t_1, x_1)\\) and \\((t_2, x_2)\\). The slope of this line = \\(\\Delta x / \\Delta t\\) = average velocity over that interval. No formula needed — pick any two points, measure the rise and the run.',
      '**Computing displacement from a v–t graph. **If the v–t graph is a rectangle (constant velocity v over time Δt):displacement = v × Δt = area of rectangle. If the v–t graph is a triangle (velocity from 0 to v_f over Δt):displacement = ½ × base × height = ½ × Δt × v_f. More complex shapes: break into triangles and rectangles, sum the areas.',
      '**The constant-acceleration case on graphs. **When acceleration is constant:a–t graph: flat horizontal line at height a.v–t graph: straight line with slope a and y-intercept v₀.x–t graph: parabola with curvature set by a. All three shapes are the "constant acceleration signature."',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Displacement from v–t graph',
        body:
          '\\Delta x = \\text{(area under v–t curve from } t_1 \\text{ to } t_2\\text{)}\\\\\\text{Rectangle: } \\Delta x = v \\cdot \\Delta t\\\\\\text{Triangle: } \\Delta x = \\tfrac{1}{2} \\cdot \\Delta t \\cdot (v_f - v_i)\\\\\\text{Trapezoid: } \\Delta x = \\tfrac{1}{2}(v_i + v_f) \\cdot \\Delta t',
      },
      {
        type: 'insight',
        title: 'Constant acceleration — the three graph signatures',
        body:
          '\\text{a–t graph: } \\text{horizontal line at } a\\\\\\text{v–t graph: } \\text{straight line, slope} = a\\\\\\text{x–t graph: } \\text{parabola, opens upward for } a > 0\\\\\\text{Memorize these three shapes — they appear in every kinematics problem.}',
      },
      {
        type: 'definition',
        title: 'Signed area under v–t graph',
        body:
          '\\text{Area above the t-axis (v > 0): positive displacement (moving in +x direction).}\\\\\\text{Area below the t-axis (v < 0): negative displacement (moving in −x direction).}\\\\\\text{Total displacement = net signed area.}\\\\\\text{Total distance = total unsigned area (both parts positive).}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'Why Δx = ½(v₀+v)t — the area of a trapezoid',
        mathBridge:
          'For constant acceleration, v(t) is a straight line. The area under a straight-line v–t graph from 0 to t is a trapezoid:width = t, left height = v₀, right height = v. Area = ½(v₀ + v)·t = displacement. This is not calculus — it is pure geometry.',
        caption: 'Δx = ½(v₀+v)t is a geometry result — area of the trapezoid under the v-t line.',
      },
      {
        id: 'PythonNotebook',
        title: 'Read and plot motion graphs — build the physics intuition',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — Plot x(t) and v(t) Side by Side',
              prose: 'For free fall: x = ½gt² and v = gt. Plot both and compare their shapes.',
              instructions: 'Run. Notice: x is a parabola, v is a straight line. Confirm slope of x = value of v.',
              code:
                'import numpy as np\nfrom opencalc import Figure\n\ng = 9.8\nt = np.linspace(0, 4, 200)\nx = 0.5 * g * t**2\nv = g * t\n\nfig1 = Figure(xmin=0, xmax=4.2, ymin=0, ymax=85)\nfig1.plot(t.tolist(), x.tolist(), color="blue", label="x(t)=½gt²")\nfig1.xlabel("t (s)").ylabel("x (m)").title("Position — x-t graph (parabola)")\nfig1.show()\n\nfig2 = Figure(xmin=0, xmax=4.2, ymin=0, ymax=42)\nfig2.plot(t.tolist(), v.tolist(), color="green", label="v(t)=gt")\nfig2.xlabel("t (s)").ylabel("v (m/s)").title("Velocity — v-t graph (straight line)")\nfig2.show()',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Verify Area = Displacement',
              prose: 'The area under the v–t graph equals displacement. For v = gt, the area from 0 to t is a triangle: ½·t·(gt) = ½gt². This should equal x(t).',
              instructions: 'Run. The numerical area (from summing rectangles) should match ½gt².',
              code:
                'import numpy as np\n\ng = 9.8\nT = 3.0  # compute displacement from t=0 to t=T\n\n# Numerical area under v(t) = g*t from 0 to T\ndt = 0.001\nt_vals = np.arange(0, T, dt)\nv_vals = g * t_vals\narea = np.sum(v_vals * dt)  # sum of v * dt rectangles\n\n# Exact displacement\nexact = 0.5 * g * T**2\n\nprint(f"Numerical area under v-t graph = {area:.4f} m")\nprint(f"Exact x(T) = ½gT² = {exact:.4f} m")\nprint(f"Error: {abs(area-exact)/exact*100:.3f}%")',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge — Read Velocity from x(t)',
              difficulty: 'medium',
              prompt:
                'For x(t) = 4t² − 2t + 1, estimate the instantaneous velocity at t = 2 sby computing (x(2.001) − x(1.999)) / 0.002. Store result in v_inst.',
              instructions: '1. Evaluate x(2.001) and x(1.999).\n2. Divide the difference by 0.002.',
              code:
                'def x(t):\n    return 4*t**2 - 2*t + 1\n\nv_inst = \n\nprint(f"v(2) ≈ {v_inst:.4f} m/s")',
              output: '',
              status: 'idle',
              testCode:
                '\ndef x(t): return 4*t**2 - 2*t + 1\nexpected = (x(2.001) - x(1.999)) / 0.002\nif abs(v_inst - expected) > 0.01:\n    raise ValueError(f"Expected ≈{expected:.4f}, got {v_inst}")\nres = f"SUCCESS: v(2) ≈ {v_inst:.4f} m/s. Exact: v = 8t−2, v(2) = 14 m/s."\nres\n',
              hint: 'v_inst = (x(2.001) - x(1.999)) / 0.002',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Why "area = displacement" is really an integral. **The displacement from \\(t_1\\) to \\(t_2\\) is \\(\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt\\). The integral is defined as the limit of a sum of rectangles:divide [t₁, t₂] into n sub-intervals of width Δt = (t₂−t₁)/n,compute v at the left endpoint of each, multiply by Δt, sum. As n → ∞ (Δt → 0), this sum converges to the area under the curve. This is exactly the Riemann integral — but the geometric intuition (area) comes first.',
      '**The Fundamental Theorem of Calculus — previewed in kinematics. **Position is the integral of velocity: \\(x(t) = x_0 + \\int_0^t v(\\tau)\\,d\\tau\\). Velocity is the derivative of position: \\(v = dx/dt\\). These are inverses of each other — differentiation and integration undo each other. This is the Fundamental Theorem of Calculus,and kinematics is its most natural physical manifestation.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The kinematic version of the Fundamental Theorem',
        body:
          '\\text{Derivative: } v(t) = \\frac{dx}{dt} \\quad \\text{(slope of x–t graph)}\\\\\\text{Integral: } x(t) = x_0 + \\int_0^t v(\\tau)\\,d\\tau \\quad \\text{(area under v–t graph)}\\\\\\text{These two operations are inverses. This IS the Fundamental Theorem of Calculus.}',
      },
      {
        type: 'insight',
        title: 'Concavity — the second derivative tells the shape',
        body:
          '\\text{If } \\frac{d^2x}{dt^2} = a > 0\\text{: x–t parabola opens upward (speeding up in + direction)}\\\\\\text{If } \\frac{d^2x}{dt^2} = a < 0\\text{: x–t parabola opens downward (slowing down or going negative)}\\\\\\text{The second derivative = acceleration = curvature of the x–t graph.}',
      },
    ],
    proofSteps: [
      {
        expression: '\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt',
        annotation: 'Displacement is the integral of velocity — area under the v–t curve.',
      },
      {
        expression: '\\approx \\sum_{i=1}^{n} v(t_i) \\cdot \\Delta t \\quad \\text{where } \\Delta t = \\frac{t_2-t_1}{n}',
        annotation: 'Approximate as a sum of rectangles, each with height v(tᵢ) and width Δt.',
      },
      {
        expression: '\\text{For } v(t) = gt: \\sum_{i} gt_i \\cdot \\Delta t = g \\cdot \\Delta t \\sum_i t_i \\approx g \\cdot \\frac{T^2}{2}',
        annotation: 'For constant acceleration, the sum evaluates to ½gT² as n → ∞.',
      },
      {
        expression: '\\therefore \\Delta x = \\frac{1}{2}gT^2 = x(T) - x(0) \\quad \\checkmark',
        annotation: 'This matches x(T) = ½gT² — confirming area = displacement.',
      },
    ],
    title: 'Area under v–t = displacement: a Riemann sum argument',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Riemann rectangles converging to the integral',
        mathBridge:
          'Each rectangle has height v(tᵢ) and width Δt. Their total area approximates displacement. As rectangles get thinner, the approximation improves. The limiting total area is the integral — exact displacement.',
        caption: 'The integral ∫v dt is the limit of the Riemann sum — exact area, exact displacement.',
      },
    ],
  },

  examples: [
    {
      id: 'p0-005-ex1',
      title: 'Reading velocity from an x–t graph',
      problem:
        '\\text{An x–t graph shows a straight line from (0, 0) to (4, 48). What is the velocity? Is it constant?}',
      steps: [
        {
          expression: 'v = \\text{slope} = \\frac{\\Delta x}{\\Delta t} = \\frac{48 - 0}{4 - 0} = 12\\,\\text{m/s}',
          annotation: 'Rise = 48 m, run = 4 s. Slope = 12 m/s.',
        },
        {
          expression: '\\text{Straight line} \\Rightarrow \\text{slope is constant} \\Rightarrow \\text{velocity is constant}',
          annotation: 'A straight x–t line means constant velocity.',
        },
      ],
      conclusion: 'Velocity = 12 m/s, constant. (Zero acceleration.)',
    },
    {
      id: 'p0-005-ex2',
      title: 'Displacement from a v–t graph (trapezoid)',
      problem:
        '\\text{A v–t graph shows velocity rising linearly from 0 to 20 m/s over 4 s. What is the displacement?}',
      steps: [
        {
          expression: '\\text{Area under v–t} = \\text{triangle} = \\tfrac{1}{2} \\times \\text{base} \\times \\text{height}',
          annotation: 'A straight v–t line from v=0 to v=20 over t=4 forms a right triangle.',
        },
        {
          expression: '\\Delta x = \\tfrac{1}{2} \\times 4\\,\\text{s} \\times 20\\,\\text{m/s} = 40\\,\\text{m}',
          annotation: '½ × 4 × 20 = 40.',
        },
      ],
      conclusion:
        'Displacement = 40 m. Confirm: x = ½at² with a = 5 m/s² (slope of v–t line): x = ½(5)(16) = 40 m. ✓',
    },
    {
      id: 'p0-005-ex3',
      title: 'Reading a two-phase motion graph',
      problem:
        '\\text{A v–t graph shows: v = 10 m/s constant for 5 s, then v decreases linearly to 0 over the next 2 s. Find total displacement.}',
      steps: [
        {
          expression: '\\text{Phase 1: rectangle, } \\Delta x_1 = 10 \\times 5 = 50\\,\\text{m}',
          annotation: 'Constant velocity phase: area = v × t.',
        },
        {
          expression: '\\text{Phase 2: triangle, } \\Delta x_2 = \\tfrac{1}{2} \\times 2 \\times 10 = 10\\,\\text{m}',
          annotation: 'Decelerating to zero: triangle area.',
        },
        {
          expression: '\\Delta x_{\\text{total}} = 50 + 10 = 60\\,\\text{m}',
          annotation: 'Sum the areas.',
        },
      ],
      conclusion: 'Total displacement = 60 m.',
    },
    {
      id: 'p0-005-ex4',
      title: 'Identifying motion from graph shape',
      problem:
        '\\text{An x–t graph is a parabola that peaks at } t = 3\\,\\text{s \\text{ and returns to zero at } t = 6\\,\\text{s. Describe the motion: direction, turning point, and sign of acceleration.}',
      steps: [
        {
          expression: '\\text{Parabola with peak: the slope goes from positive (before peak) to zero (at peak) to negative (after peak)}',
          annotation: 'Reading the slope trend: velocity is decreasing throughout.',
        },
        {
          expression: '\\text{Slope = 0 at } t=3\\,\\text{s} \\Rightarrow v=0 \\text{ at } t=3\\,\\text{s} \\Rightarrow \\text{turning point}',
          annotation: 'The object momentarily stops and reverses direction at t = 3 s.',
        },
        {
          expression: '\\text{Parabola opening downward} \\Rightarrow a < 0 \\text{ (constant negative acceleration)}',
          annotation: 'A downward parabola has negative curvature — negative second derivative — negative acceleration.',
        },
      ],
      conclusion:
        'The object moves in the +x direction (0 to 3 s), stops at t=3, then returns in the −x direction. Constant negative acceleration throughout. This is the signature of a ball thrown upward.',
    },
  ],

  challenges: [
    {
      id: 'p0-005-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A v–t graph shows a horizontal line at v = 8 m/s from t=0 to t=6 s. What is the displacement? What is the acceleration?}',
      hint: 'Area of a rectangle = base × height. Horizontal v–t line means zero slope = zero acceleration.',
      walkthrough: [
        { expression: '\\Delta x = 8 \\times 6 = 48\\,\\text{m}', annotation: 'Rectangle area.' },
        { expression: 'a = \\text{slope of v–t} = 0', annotation: 'Horizontal line → zero slope → zero acceleration.' },
      ],
      answer: 'Δx = 48 m, a = 0. (Constant velocity motion.)',
    },
    {
      id: 'p0-005-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A v–t graph shows v going from −6 m/s at t=0 to +6 m/s at t=4 s (linear).(a) What is the acceleration? (b) When is the object at rest? (c) What is the net displacement?}',
      hint:
        '(a) slope of v–t. (b) v = 0 when? (c) Net area — the triangle below the axis is negative.',
      walkthrough: [
        {
          expression: '\\text{(a) } a = \\frac{6-(-6)}{4-0} = \\frac{12}{4} = 3\\,\\text{m/s}^2',
          annotation: 'Slope of v–t line.',
        },
        {
          expression: '\\text{(b) v = 0 when: } -6 + 3t = 0 \\Rightarrow t = 2\\,\\text{s}',
          annotation: 'The line crosses zero at t = 2 s.',
        },
        {
          expression: '\\text{(c) Area below axis (t=0 to 2): } -\\tfrac{1}{2}(2)(6) = -6\\,\\text{m}',
          annotation: 'Triangle below the t-axis — negative displacement.',
        },
        {
          expression: '\\text{Area above axis (t=2 to 4): } +\\tfrac{1}{2}(2)(6) = +6\\,\\text{m}',
          annotation: 'Triangle above the t-axis — positive displacement.',
        },
        {
          expression: '\\Delta x_{\\text{net}} = -6 + 6 = 0\\,\\text{m}',
          annotation: 'Net displacement = 0. The object returned to its start.',
        },
      ],
      answer: '(a) a = 3 m/s². (b) At rest at t = 2 s. (c) Net displacement = 0 m.',
    },
    {
      id: 'p0-005-ch3',
      difficulty: 'hard',
      problem:
        '\\text{From the following v–t data, estimate displacement from t=0 to t=4 susing the trapezoid rule:}\\\\\\begin{array}{c|c}t\\,(\\text{s}) & v\\,(\\text{m/s})\\\\ \\hline 0 & 0 \\\\ 1 & 5 \\\\ 2 & 12 \\\\ 3 & 21 \\\\ 4 & 32\\end{array}',
      hint: 'Trapezoid rule: each interval contributes ½(v_i + v_{i+1}) × Δt.',
      walkthrough: [
        {
          expression: '\\Delta x_{[0,1]} = \\tfrac{1}{2}(0+5)(1) = 2.5\\,\\text{m}',
          annotation: 'First interval.',
        },
        {
          expression: '\\Delta x_{[1,2]} = \\tfrac{1}{2}(5+12)(1) = 8.5\\,\\text{m}',
          annotation: 'Second interval.',
        },
        {
          expression: '\\Delta x_{[2,3]} = \\tfrac{1}{2}(12+21)(1) = 16.5\\,\\text{m}',
          annotation: 'Third interval.',
        },
        {
          expression: '\\Delta x_{[3,4]} = \\tfrac{1}{2}(21+32)(1) = 26.5\\,\\text{m}',
          annotation: 'Fourth interval.',
        },
        {
          expression: '\\Delta x_{\\text{total}} = 2.5 + 8.5 + 16.5 + 26.5 = 54\\,\\text{m}',
          annotation: 'Sum all trapezoids.',
        },
      ],
      answer: 'Approximate displacement = 54 m.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\text{slope of x–t}', meaning: 'instantaneous velocity v — steeper slope = faster' },
      { symbol: '\\text{slope of v–t}', meaning: 'instantaneous acceleration a — steeper slope = more rapidly changing speed' },
      { symbol: '\\text{area under v–t}', meaning: 'displacement Δx — area above axis is +Δx, below axis is −Δx' },
      { symbol: '\\text{parabola on x–t}', meaning: 'constant acceleration — the classic free-fall signature' },
      { symbol: '\\text{straight line on x–t}', meaning: 'constant velocity — zero acceleration' },
      { symbol: '\\text{v–t crosses zero}', meaning: 'object momentarily at rest — reverses direction at that instant' },
    ],
    rulesOfThumb: [
      'Height ≠ velocity: velocity is slope, not the height of the x–t curve.',
      'A straight x–t line always means constant velocity (a = 0).',
      'A parabolic x–t curve always means constant acceleration.',
      'Area under v–t = displacement; area above axis = positive; below axis = negative.',
      'When v–t crosses the t-axis, the object reversed direction — mark this as a turning point.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-004',
        label: 'Lesson 4 — Average vs Instantaneous',
        note: 'Slope of x–t is instantaneous velocity. If the distinction between average and instantaneous feels unclear, review Lesson 4.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'p1-ch2-003',
        label: 'Ch. 2, Lesson 3 — Position Graph Analysis',
        note: 'Ch. 2 spends three full lessons (L3–L5) on x–t, v–t, and a–t graph reading at a deeper level.',
      },
      {
        lessonId: 'p1-ch2-009',
        label: 'Ch. 2, Lesson 9 — Displacement from Velocity Area',
        note: 'The area-under-curve idea becomes a formal integration technique in Ch. 2 L9.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-005-assess-1',
        type: 'choice',
        text: 'On an x–t graph, what does a zero slope mean?',
        options: ['Zero acceleration', 'Zero velocity', 'Maximum velocity', 'Maximum acceleration'],
        answer: 'Zero velocity',
        hint: 'Slope of x–t = velocity. Zero slope = zero velocity = object is momentarily at rest.',
      },
      {
        id: 'p0-005-assess-2',
        type: 'input',
        text: 'A v–t graph shows constant v = 5 m/s from t=0 to t=8 s. What is the displacement in meters?',
        answer: '40',
        hint: 'Area = v × t = 5 × 8 = 40 m.',
      },
    ],
  },

  mentalModel: [
    'x–t slope = velocity; v–t slope = acceleration; area under v–t = displacement',
    'Straight x–t line → constant velocity (a=0); parabola → constant acceleration',
    'v–t crossing zero = turning point — object reversed direction',
    'Height of x–t curve tells position, NOT velocity — this is the most common mistake',
    'Area above v–t axis = positive displacement; below = negative displacement; net = algebraic sum',
    'The kinematic triple: a–t is flat, v–t is straight, x–t is quadratic — for constant a',
  ],

  quiz: [
    {
      id: 'graphs-q1',
      type: 'choice',
      text: 'An x–t graph is a straight line with positive slope. This means:',
      options: [
        'The object is accelerating',
        'The object has constant positive velocity',
        'The object is at rest',
        'The object is decelerating',
      ],
      answer: 'The object has constant positive velocity',
      hints: ['Straight x–t line = constant slope = constant velocity = zero acceleration.'],
      reviewSection: 'Intuition — graph shapes',
    },
    {
      id: 'graphs-q2',
      type: 'input',
      text: 'A v–t graph shows v rising from 0 to 30 m/s over 6 s. What is the displacement (in meters)? (Triangle area.)',
      answer: '90',
      hints: ['Triangle: ½ × base × height = ½ × 6 × 30 = 90 m.'],
      reviewSection: 'Math — displacement from v–t',
    },
    {
      id: 'graphs-q3',
      type: 'choice',
      text: 'On a v–t graph, where the curve crosses zero (v = 0), what is happening physically?',
      options: [
        'The object is at its starting position',
        'The object is momentarily at rest and reversing direction',
        'The acceleration is zero',
        'The object has reached maximum velocity',
      ],
      answer: 'The object is momentarily at rest and reversing direction',
      hints: ['v = 0 means the object stopped for an instant. Before: moving one way. After: moving the other.'],
      reviewSection: 'Intuition — reading motion stories from graphs',
    },
    {
      id: 'graphs-q4',
      type: 'choice',
      text: 'What is the slope of a v–t graph equal to?',
      options: ['velocity', 'acceleration', 'displacement', 'position'],
      answer: 'acceleration',
      hints: ['Slope of v–t = Δv/Δt = acceleration. Just as slope of x–t = Δx/Δt = velocity.'],
      reviewSection: 'Intuition — the two fundamental graph relationships',
    },
    {
      id: 'graphs-q5',
      type: 'input',
      text: 'A v–t graph shows v = 10 m/s for 3 s, then drops linearly to 0 over 2 s more. Total displacement?',
      answer: '40',
      hints: [
        'Phase 1: rectangle = 10 × 3 = 30 m.',
        'Phase 2: triangle = ½ × 2 × 10 = 10 m.',
        'Total = 30 + 10 = 40 m.',
      ],
      reviewSection: 'Examples — two-phase motion',
    },
    {
      id: 'graphs-q6',
      type: 'choice',
      text: 'An x–t graph that curves upward (concave up) indicates:',
      options: [
        'Constant velocity',
        'Decreasing velocity',
        'Positive acceleration (velocity increasing)',
        'Negative acceleration',
      ],
      answer: 'Positive acceleration (velocity increasing)',
      hints: ['Concave up = slope is increasing = velocity is increasing = positive acceleration.'],
      reviewSection: 'Rigor — concavity and the second derivative',
    },
    {
      id: 'graphs-q7',
      type: 'choice',
      text: 'The AREA under a v–t graph represents:',
      options: ['acceleration', 'velocity', 'displacement', 'time'],
      answer: 'displacement',
      hints: ['v × Δt = displacement. Summing all v × Δt = total area = total displacement.'],
      reviewSection: 'Math — displacement from area',
    },
    {
      id: 'graphs-q8',
      type: 'choice',
      text: 'Which of these is the "constant acceleration signature" on an x–t graph?',
      options: [
        'Straight line with positive slope',
        'Parabola (quadratic curve)',
        'Horizontal line',
        'Straight line with negative slope',
      ],
      answer: 'Parabola (quadratic curve)',
      hints: ['x = v₀t + ½at² is a quadratic — a parabola. The t² term creates the curvature.'],
      reviewSection: 'Math — constant-acceleration case on graphs',
    },
  ],
}
