export default {
  id: 'p0-004',
  slug: 'average-vs-instantaneous',
  chapter: 'p0',
  order: 3,
  title: 'Average vs Instantaneous',
  subtitle: 'The most important distinction in all of physics — and the doorway to calculus.',
  tags: ['average velocity', 'instantaneous velocity', 'secant', 'tangent', 'limit', 'Δt', 'rate of change', 'slope'],

  hook: {
    question:
      'A car drives from Chicago to New York — 1,270 km in 13 hours. Average speed: 97.7 km/h. But was the car always moving at 97.7 km/h?Of course not. Sometimes it was stuck at 0 km/h in traffic. Sometimes it was cruising at 120 km/h on the highway. The speedometer showed a different number every second. The average speed and the instantaneous speed are completely different quantities. Why does this difference matter — and how do you calculate a speed "at a single instant"when an instant has zero duration?',
    realWorldContext:
      'Every speedometer in every car reads instantaneous speed, not average speed. Every radar speed gun measures instantaneous speed. Traffic tickets are issued based on instantaneous speed. But calculating instantaneous speed from a position-time record requires a mathematical ideathat took humanity 2,000 years to develop: the limit. This lesson is where algebra ends and calculus begins.',
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'slope-triangle' },
  },

  intuition: {
    prose: [
      '**Average velocity — the coarse view. **Average velocity over a time interval is simply total displacement divided by total time:\\(\\bar{v} = \\Delta x / \\Delta t\\). If you drive 100 km in 2 hours, your average velocity is 50 km/h. On an \\(x\\)-\\(t\\) graph, this is the **slope of the straight line** connecting the start and end points. That line is called a **secant** — it cuts across the curve from one point to another. Average velocity is easy to compute, but it throws away all the information about what happened in between.',

      '**Instantaneous velocity — the fine view. **The speedometer tells you your speed *right now* — not averaged over any interval. Mathematically, instantaneous velocity is the slope of the \\(x\\)-\\(t\\) curve *at a single point*.But a point has no width — how can you compute a slope from a single point?Here is the key idea: **shrink the time interval**.Compute the average velocity over a very small \\(\\Delta t\\). Then shrink \\(\\Delta t\\) further. And further still. As \\(\\Delta t \\to 0\\), the secant line approaches the **tangent line** at that point. The slope of the tangent is the instantaneous velocity.',

      '**The limit — shrinking Δt to zero. **Write \\(v_{\\text{inst}} = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t}\\). This is not a division by zero — it is a *limit*.We ask: as \\(\\Delta t\\) gets smaller and smaller (never reaching zero),does \\(\\Delta x / \\Delta t\\) approach a definite number?For smooth functions like \\(x(t) = \\frac{1}{2}at^2\\), the answer is always yes. That limiting value is the instantaneous velocity. This process — computing the limit of a ratio — is the derivative. You will compute it formally in Chapter 1. Here, we build the intuition.',

      '**Why the difference matters in physics. **Newton\'s Second Law says \\(F = ma\\) — where \\(a\\) is the *instantaneous* acceleration,not an average. The force at this instant determines what happens at the next instant. If you use average acceleration, you lose all the physics happening inside the interval. Every law of physics is written in terms of instantaneous rates of change. Calculus exists because physics demanded it.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 8 — Chapter 0: Orientation',
        body:
          '**Previous (Lesson 3):** Variables and functions — x(t), evaluating, kinematic triple.\\n**This lesson:** Average vs instantaneous — secants, tangents, and the limit idea.\\n**Next (Lesson 5):** Graphs as physics — reading x–t and v–t graphs.\\n**Why it matters:** This distinction is why calculus was invented — every chapter uses it.',
      },
      {
        type: 'definition',
        title: 'Average velocity',
        body:
          '\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x_f - x_i}{t_f - t_i}\\\\\\text{Geometrically: slope of the secant line on the } x\\text{-}t \\text{ graph.}\\\\\\text{Physically: total displacement ÷ total time. Ignores all variation within the interval.}',
      },
      {
        type: 'definition',
        title: 'Instantaneous velocity',
        body:
          'v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}\\\\\\text{Geometrically: slope of the tangent line at point } t\\text{ on the } x\\text{-}t \\text{ graph.}\\\\\\text{Physically: the speedometer reading — velocity at a single instant.}',
      },
      {
        type: 'insight',
        title: 'Secant → tangent as Δt → 0',
        body:
          '\\text{Secant line: connects } (t, x(t)) \\text{ and } (t + \\Delta t, x(t + \\Delta t))\\\\\\text{Slope of secant: } \\bar{v} = \\frac{x(t+\\Delta t) - x(t)}{\\Delta t}\\\\\\text{As } \\Delta t \\to 0: \\text{ secant rotates and approaches the tangent line.}\\\\\\text{The limiting slope is } v(t) = \\frac{dx}{dt}.\\\\',
      },
      {
        type: 'warning',
        title: 'Average speed ≠ |average velocity|',
        body:
          '\\text{Average velocity = } \\Delta x / \\Delta t \\text{ — displacement over time (can be zero if you return to start).}\\\\\\text{Average speed = total distance / } \\Delta t \\text{ — always ≥ 0.}\\\\\\text{A runner who completes a lap and returns to start has average velocity = 0 but average speed > 0.}',
      },
    ],
    visualizations: [
      {
        id: 'SecantToTangent',
        title: 'Drag Δt to zero — watch average velocity become instantaneous velocity',
        mathBridge: 'The purple curve is x(t). The orange line is the secant connecting x(t₀) and x(t₀ + h). Its slope is the average velocity over the interval h. Drag the "interval h" slider toward zero. Watch the secant rotate and collapse onto the tangent line. The moment h = 0, the secant IS the tangent — and its slope is the instantaneous velocity at that point. You just watched the limit happen. This is not a formula trick — it is a geometric fact about curves.',
        caption: 'Slider h = Δt. As h → 0, the secant slope (average velocity) converges to the tangent slope (instantaneous velocity). This convergence IS the derivative.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-avg-velocity' },
        title: 'Average velocity: Δx/Δt as rise over run',
        mathBridge: 'Before the limit: average velocity is just rise/run on the x–t graph. Pick any two points, read off Δx (rise) and Δt (run), divide. This diagram shows that computation explicitly with labeled values. The secant above shows what happens when you shrink this interval to zero.',
        caption: 'Average velocity = Δx/Δt = rise/run. This is the slope of the secant between two points on the x–t graph.',
      },
    ],
  },

  math: {
    prose: [
      '**Computing average velocity from a table or formula. **Given \\(x(t) = \\frac{1}{2}(9.8)t^2\\):average velocity from \\(t = 1\\) to \\(t = 3\\) is\\(\\bar{v} = \\frac{x(3) - x(1)}{3 - 1} = \\frac{44.1 - 4.9}{2} = \\frac{39.2}{2} = 19.6\\) m/s.',
      '**Watching the limit happen numerically. **To find instantaneous velocity at \\(t = 2\\) for \\(x = \\frac{1}{2}(9.8)t^2\\):compute \\(\\frac{x(2 + \\Delta t) - x(2)}{\\Delta t}\\) for shrinking \\(\\Delta t\\).',
      '\\(\\Delta t = 1.0\\): \\(\\frac{x(3) - x(2)}{1} = \\frac{44.1 - 19.6}{1} = 24.5\\) m/s',
      '\\(\\Delta t = 0.1\\): \\(\\frac{x(2.1) - x(2)}{0.1} = \\frac{21.609 - 19.6}{0.1} = 20.09\\) m/s',
      '\\(\\Delta t = 0.01\\): \\(\\frac{x(2.01) - x(2)}{0.01} \\approx 19.649\\) m/s',
      '\\(\\Delta t \\to 0\\): the ratio approaches \\(19.6\\) m/s = \\(9.8 \\times 2\\) = \\(g \\times t\\). This is the instantaneous velocity \\(v(t) = 9.8t\\) evaluated at \\(t = 2\\).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Average velocity from a formula',
        body:
          '\\bar{v}_{[t_1, t_2]} = \\frac{x(t_2) - x(t_1)}{t_2 - t_1}\\\\\\text{This is the slope of the secant between } (t_1, x(t_1)) \\text{ and } (t_2, x(t_2)).',
      },
      {
        type: 'insight',
        title: 'The pattern for x = ½gt²',
        body:
          '\\frac{x(t+\\Delta t) - x(t)}{\\Delta t} = \\frac{\\frac{1}{2}g(t+\\Delta t)^2 - \\frac{1}{2}gt^2}{\\Delta t}\\\\= \\frac{\\frac{1}{2}g(2t \\cdot \\Delta t + (\\Delta t)^2)}{\\Delta t}\\\\= gt + \\frac{1}{2}g \\Delta t\\\\\\xrightarrow{\\Delta t \\to 0} gt\\\\\\text{So } v(t) = gt \\text{ — instantaneous velocity grows linearly with time.}',
      },
      {
        type: 'mnemonic',
        title: 'Average on a graph: rise over run',
        body:
          '\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{\\text{rise}}{\\text{run}} = \\text{slope of secant on } x\\text{-}t \\text{ graph}\\\\\\text{Two points on the curve, one line connecting them. That line\'s slope is average velocity.}',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Watch the limit converge — numerically compute instantaneous velocity',
        mathBridge:
          'Stage 1 computes average velocity for shrinking Δt. Stage 2 plots how the ratio converges. You will see the number stabilize — that stable value is the instantaneous velocity.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — Average Velocity for Shrinking Δt',
              prose: 'Compute (x(t+Δt) − x(t)) / Δt for x = ½gt² at t = 2 s, with smaller and smaller Δt.',
              instructions: 'Run. Watch the ratio converge to 19.6 m/s.',
              code:
                'g = 9.8\n\ndef x(t):\n    return 0.5 * g * t**2\n\nt0 = 2.0  # fixed time\ndt_values = [1.0, 0.5, 0.1, 0.01, 0.001, 0.0001]\n\nprint(f"Instantaneous velocity at t={t0} s:")\nprint(f"{\'Δt\':>10}  {\'Δx/Δt (m/s)\':>14}")\nprint("-" * 28)\nfor dt in dt_values:\n    avg_v = (x(t0 + dt) - x(t0)) / dt\n    print(f"{dt:>10.4f}  {avg_v:>14.6f}")\n\nprint(f"\\nExact: v(t) = g*t = {g*t0} m/s")',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Visualize the Convergence',
              prose: 'Plot Δx/Δt vs Δt. As Δt → 0, the ratio converges to the instantaneous velocity.',
              instructions: 'Run. The curve approaches the horizontal line at v = g*t₀.',
              code:
                'import numpy as np\nfrom opencalc import Figure\n\ng = 9.8\nt0 = 2.0\n\ndef x(t):\n    return 0.5 * g * t**2\n\ndt_vals = np.logspace(-3, 0, 100)  # from 0.001 to 1\navg_v_vals = [(x(t0+dt) - x(t0))/dt for dt in dt_vals]\n\nfig = Figure(xmin=0, xmax=1.1, ymin=18, ymax=25)\nfig.plot(dt_vals.tolist(), avg_v_vals, color="blue", label="Δx/Δt")\nfig.hline(g*t0, color="red", label=f"v(t₀)={g*t0} m/s")\nfig.xlabel("Δt (s)").ylabel("Δx/Δt (m/s)").title("Secant slope converging to tangent slope")\nfig.show()',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge — Average velocity over an interval',
              difficulty: 'medium',
              prompt:
                'For x(t) = 4t² (m), compute average velocity from t=1 to t=3 s. Store result in avg_v.',
              instructions:
                '1. Compute x(3) and x(1).\n2. avg_v = (x(3) - x(1)) / (3 - 1).',
              code:
                'def x(t):\n    return 4 * t**2\n\nt1, t2 = 1, 3\n\n# Your calculation:\navg_v = \n\nprint(f"Average velocity: {avg_v} m/s")',
              output: '',
              status: 'idle',
              testCode:
                '\nif avg_v != 16.0:\n    raise ValueError(f"Expected 16.0, got {avg_v}")\nres = "SUCCESS: avg_v = 16.0 m/s. (x(3)=36, x(1)=4; Δx/Δt = 32/2 = 16)"\nres\n',
              hint: 'avg_v = (x(t2) - x(t1)) / (t2 - t1) = (36 - 4) / 2 = 16',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**The limit — formal definition. **We write \\(\\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = L\\)if, for every \\(\\epsilon > 0\\), there exists \\(\\delta > 0\\) such that\\(0 < |\\Delta t| < \\delta \\implies \\left|\\frac{\\Delta x}{\\Delta t} - L\\right| < \\epsilon\\). In plain English: as \\(\\Delta t\\) gets close to 0 (but never equals 0),the ratio \\(\\Delta x / \\Delta t\\) gets close to \\(L\\). You can make \\(\\Delta x / \\Delta t\\) as close to \\(L\\) as you wish by making \\(\\Delta t\\) small enough.',
      '**Computing the derivative of x = ½gt² from the limit definition. **This is the formal derivation that justifies \\(v = gt\\).',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The derivative (limit definition)',
        body:
          '\\frac{dx}{dt} \\equiv \\lim_{\\Delta t \\to 0} \\frac{x(t + \\Delta t) - x(t)}{\\Delta t}\\\\\\text{This is the instantaneous rate of change of } x \\text{ with respect to } t\\text{.}\\\\\\text{Geometrically: slope of the tangent line at } (t, x(t))\\text{.}',
      },
      {
        type: 'insight',
        title: 'Why the limit is not "0/0"',
        body:
          '\\text{When } \\Delta t = 0\\text{: both } \\Delta x = 0 \\text{ and } \\Delta t = 0\\text{ — division undefined.}\\\\\\text{But we never set } \\Delta t = 0\\text{. We ask: what does } \\Delta x/\\Delta t \\text{ } \\textit{approach}?\\\\\\text{The limit captures the tendency — not the value at the forbidden point.}',
      },
    ],
    proofSteps: [
      {
        expression: '\\frac{dx}{dt} = \\lim_{\\Delta t \\to 0} \\frac{x(t + \\Delta t) - x(t)}{\\Delta t}',
        annotation: 'Start from the limit definition of the derivative.',
      },
      {
        expression: '= \\lim_{\\Delta t \\to 0} \\frac{\\frac{1}{2}g(t + \\Delta t)^2 - \\frac{1}{2}gt^2}{\\Delta t}',
        annotation: 'Substitute x(t) = ½gt².',
      },
      {
        expression: '= \\lim_{\\Delta t \\to 0} \\frac{\\frac{1}{2}g(t^2 + 2t\\Delta t + (\\Delta t)^2) - \\frac{1}{2}gt^2}{\\Delta t}',
        annotation: 'Expand (t + Δt)² = t² + 2tΔt + (Δt)².',
      },
      {
        expression: '= \\lim_{\\Delta t \\to 0} \\frac{\\frac{1}{2}g \\cdot 2t\\Delta t + \\frac{1}{2}g(\\Delta t)^2}{\\Delta t}',
        annotation: 'The ½gt² terms cancel. Factor the numerator.',
      },
      {
        expression: '= \\lim_{\\Delta t \\to 0} \\left(gt + \\frac{1}{2}g \\Delta t\\right)',
        annotation: 'Divide every term by Δt. Now Δt appears only in the last term.',
      },
      {
        expression: '= gt + 0 = gt',
        annotation: 'As Δt → 0, the last term vanishes. The limit is gt.',
      },
      {
        expression: '\\therefore \\quad v(t) = \\frac{dx}{dt} = gt',
        annotation: 'This confirms v(t) = gt. The derivative of ½gt² is gt — exactly what we need.',
      },
    ],
    title: 'Deriving v(t) = gt from the limit definition of the derivative',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Each algebraic step has a geometric interpretation',
        mathBridge:
          'Step 3 in the proof (expanding (t+Δt)²) corresponds to adding the tiny right-hand rectangleto the slope triangle. Step 6 (Δt → 0) corresponds to that rectangle shrinking to nothing. The diagram and the algebra tell the same story.',
        caption: 'Algebra and geometry are two languages for the same idea.',
      },
    ],
  },

  examples: [
    {
      id: 'p0-004-ex1',
      title: 'Average velocity over an interval',
      problem:
        '\\text{For } x(t) = \\tfrac{1}{2}(9.8)t^2\\text{, find the average velocity from } t=1\\,\\text{s to } t=4\\,\\text{s.}',
      steps: [
        {
          expression: 'x(1) = \\tfrac{1}{2}(9.8)(1)^2 = 4.9\\,\\text{m}',
          annotation: 'Evaluate at t = 1.',
        },
        {
          expression: 'x(4) = \\tfrac{1}{2}(9.8)(16) = 78.4\\,\\text{m}',
          annotation: 'Evaluate at t = 4. (4² = 16.)',
        },
        {
          expression: '\\bar{v} = \\frac{x(4) - x(1)}{4 - 1} = \\frac{78.4 - 4.9}{3} = \\frac{73.5}{3} = 24.5\\,\\text{m/s}',
          annotation: 'Displacement ÷ time interval.',
        },
      ],
      conclusion:
        'Average velocity = 24.5 m/s. Note: this is between v(1) = 9.8 m/s and v(4) = 39.2 m/s — it is the average of those, which makes sense for linearly changing velocity.',
    },
    {
      id: 'p0-004-ex2',
      title: 'Approximating instantaneous velocity from a table',
      problem:
        '\\text{From this position table, estimate the instantaneous velocity at } t = 2\\,\\text{s:}\\\\\\begin{array}{c|c} t\\,(\\text{s}) & x\\,(\\text{m}) \\\\ \\hline 1.9 & 17.69 \\\\ 2.0 & 19.60 \\\\ 2.1 & 21.61 \\end{array}',
      steps: [
        {
          expression: '\\bar{v}_{[1.9,2.1]} = \\frac{21.61 - 17.69}{2.1 - 1.9} = \\frac{3.92}{0.2} = 19.6\\,\\text{m/s}',
          annotation: 'Use symmetric interval around t = 2: from t=1.9 to t=2.1.',
        },
        {
          expression: '\\bar{v}_{[1.9,2.0]} = \\frac{19.60 - 17.69}{0.1} = \\frac{1.91}{0.1} = 19.1\\,\\text{m/s}',
          annotation: 'Narrower interval from the left.',
        },
        {
          expression: '\\bar{v}_{[2.0,2.1]} = \\frac{21.61 - 19.60}{0.1} = \\frac{2.01}{0.1} = 20.1\\,\\text{m/s}',
          annotation: 'Narrower interval from the right.',
        },
        {
          expression: 'v(2) \\approx 19.6\\,\\text{m/s} \\quad \\text{(symmetric interval gives best estimate)}',
          annotation: 'The symmetric interval gives 19.6, which equals the exact g×t = 9.8×2 = 19.6.',
        },
      ],
      conclusion:
        'Instantaneous velocity ≈ 19.6 m/s. The symmetric interval technique gives the best numerical approximation. Exact: v(2) = gt = 9.8×2 = 19.6 m/s.',
    },
    {
      id: 'p0-004-ex3',
      title: 'Average speed vs average velocity',
      problem:
        '\\text{A ball is thrown up at 15 m/s, rises 11.5 m, falls back to start. Total time: 3.06 s. Find (a) average velocity, (b) average speed.}',
      steps: [
        {
          expression: '\\text{(a) Average velocity: } \\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{0}{3.06} = 0\\,\\text{m/s}',
          annotation: 'Displacement = 0 (returns to start). Average velocity = 0.',
        },
        {
          expression: '\\text{Total distance} = 11.5 + 11.5 = 23\\,\\text{m}',
          annotation: '11.5 m up + 11.5 m down.',
        },
        {
          expression: '\\text{(b) Average speed} = 23 / 3.06 \\approx 7.5\\,\\text{m/s}',
          annotation: 'Total distance ÷ total time.',
        },
      ],
      conclusion:
        'Average velocity = 0 (the ball returned to start). Average speed ≈ 7.5 m/s. This shows clearly why velocity ≠ speed in general.',
    },
  ],

  challenges: [
    {
      id: 'p0-004-ch1',
      difficulty: 'easy',
      problem:
        '\\text{For } x(t) = 3t^2, \\text{ find the average velocity from } t = 0 \\text{ to } t = 4\\,\\text{s.}',
      hint: 'Average velocity = (x(4) − x(0)) / (4 − 0).',
      walkthrough: [
        { expression: 'x(0) = 0, \\quad x(4) = 3(16) = 48', annotation: 'Evaluate.' },
        { expression: '\\bar{v} = 48/4 = 12\\,\\text{m/s}', annotation: 'Slope of secant.' },
      ],
      answer: '12 m/s',
    },
    {
      id: 'p0-004-ch2',
      difficulty: 'medium',
      problem:
        '\\text{For } x(t) = 5t^2, \\text{ compute the average velocity from } t \\text{ to } t + \\Delta t.\\text{Then take the limit as } \\Delta t \\to 0 \\text{ to find } v(t)\\text{.}',
      hint: 'Expand (t + Δt)², cancel the 5t² terms, divide by Δt, then let Δt → 0.',
      walkthrough: [
        {
          expression: '\\bar{v} = \\frac{5(t+\\Delta t)^2 - 5t^2}{\\Delta t} = \\frac{5(2t \\cdot \\Delta t + (\\Delta t)^2)}{\\Delta t}',
          annotation: 'Expand and cancel.',
        },
        {
          expression: '= 10t + 5\\Delta t',
          annotation: 'Divide by Δt.',
        },
        {
          expression: '\\lim_{\\Delta t \\to 0}(10t + 5\\Delta t) = 10t',
          annotation: 'Take the limit: the Δt term vanishes.',
        },
      ],
      answer: 'v(t) = 10t m/s. (For x = 5t², the instantaneous velocity is 10t.)',
    },
    {
      id: 'p0-004-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A car\'s position is } x(t) = 2t^3\\,\\text{m.(a) Find average velocity from } t=1 \\text{ to } t=3\\,\\text{s.(b) Find instantaneous velocity at } t=2\\,\\text{s using the limit definition.(c) At what time does instantaneous velocity equal the average velocity from (a)?}',
      hint:
        '(b) Expand (t+Δt)³ = t³ + 3t²Δt + 3t(Δt)² + (Δt)³.(c) Set v(t) = average velocity from (a) and solve for t.',
      walkthrough: [
        {
          expression: '\\text{(a) } \\bar{v} = \\frac{x(3)-x(1)}{2} = \\frac{54-2}{2} = 26\\,\\text{m/s}',
          annotation: 'x(3) = 2(27) = 54, x(1) = 2.',
        },
        {
          expression: '\\text{(b) } \\frac{2(t+\\Delta t)^3 - 2t^3}{\\Delta t} = 6t^2 + 6t\\Delta t + 2(\\Delta t)^2 \\to 6t^2',
          annotation: 'Expand, cancel 2t³, divide by Δt, take limit.',
        },
        {
          expression: 'v(2) = 6(2)^2 = 24\\,\\text{m/s}',
          annotation: '(b) Instantaneous velocity at t=2.',
        },
        {
          expression: '\\text{(c) } 6t^2 = 26 \\Rightarrow t^2 = 26/6 \\Rightarrow t \\approx 2.08\\,\\text{s}',
          annotation: '(c) This is the Mean Value Theorem — there is always such a point.',
        },
      ],
      answer: '(a) 26 m/s. (b) 24 m/s. (c) t ≈ 2.08 s.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\bar{v}', meaning: 'average velocity — displacement divided by time interval, slope of secant' },
      { symbol: '\\Delta x', meaning: 'displacement — change in position, x_f − x_i' },
      { symbol: '\\Delta t', meaning: 'time interval — t_f − t_i; shrinks toward 0 in the limit' },
      { symbol: 'v(t)', meaning: 'instantaneous velocity — limit of Δx/Δt as Δt → 0, slope of tangent' },
      { symbol: '\\frac{dx}{dt}', meaning: 'derivative of x with respect to t — instantaneous rate of change' },
      { symbol: '\\lim_{\\Delta t \\to 0}', meaning: 'limit — what the quantity approaches as Δt shrinks to 0' },
    ],
    rulesOfThumb: [
      'Average velocity uses two points — it is a secant slope.',
      'Instantaneous velocity uses one point — it is a tangent slope.',
      'To numerically estimate instantaneous velocity: use a symmetric interval, make Δt small.',
      'For x = kt^n, the instantaneous velocity is v = knt^{n−1} (preview of the power rule).',
      'Mean Value Theorem: there always exists a time where instantaneous velocity equals the average velocity over the interval.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-003',
        label: 'Lesson 3 — Variables and Functions',
        note:
          'Average velocity requires evaluating x(t) at two times. If evaluating functions feels uncertain, review Lesson 3 first.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'p1-ch2-007',
        label: 'Ch. 2, Lesson 7 — Definition of dx/dt',
        note:
          'This lesson is the informal preview of the derivative. Ch. 2 Lesson 7 formalizes the limit definition and applies it to every kinematic variable.',
      },
      {
        lessonId: 'p1-ch5-001',
        label: 'Ch. 5 — Work and the integral',
        note:
          'Just as instantaneous velocity requires a limit (derivative),instantaneous power requires the same. And computing work done by a variable force requires the reverse: an integral.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-004-assess-1',
        type: 'input',
        text: 'For x(t) = 5t², what is the average velocity from t = 1 to t = 3 s?',
        answer: '20',
        hint: '(x(3)−x(1))/(3−1) = (45−5)/2 = 40/2 = 20 m/s.',
      },
      {
        id: 'p0-004-assess-2',
        type: 'choice',
        text: 'Instantaneous velocity at a point on an x–t graph is:',
        options: [
          'The slope of the secant between two nearby points',
          'The slope of the tangent line at that point',
          'The area under the curve up to that point',
          'The height of the curve at that point',
        ],
        answer: 'The slope of the tangent line at that point',
        hint: 'Tangent = instantaneous. Secant = average.',
      },
    ],
  },

  mentalModel: [
    'Average velocity = Δx/Δt = secant slope on x–t graph — coarse, interval-based',
    'Instantaneous velocity = limit of Δx/Δt as Δt→0 = tangent slope — the speedometer reading',
    'The limit is not 0/0: it is what the ratio approaches as Δt shrinks (never equals 0)',
    'For x = ½gt², the limit gives v = gt — derived by expanding (t+Δt)², cancelling, dividing, limiting',
    'Average speed ≠ |average velocity|: speed uses total distance; velocity uses net displacement',
    'Preview: derivative of kt^n is knt^{n-1} (power rule — fully derived in Chapter 1)',
  ],

  quiz: [
    {
      id: 'avg-q1',
      type: 'input',
      text: 'For x(t) = 2t², what is the average velocity from t=0 to t=3 s? (Give the number.)',
      answer: '6',
      hints: ['(x(3)−x(0))/(3−0) = (18−0)/3 = 6 m/s.'],
      reviewSection: 'Examples — average velocity',
    },
    {
      id: 'avg-q2',
      type: 'choice',
      text: 'On an x–t graph, instantaneous velocity equals:',
      options: ['area under the curve', 'slope of the secant', 'slope of the tangent', 'height of the curve'],
      answer: 'slope of the tangent',
      hints: ['Tangent line at a point → instantaneous velocity. Secant between two points → average.'],
      reviewSection: 'Intuition — secant vs tangent',
    },
    {
      id: 'avg-q3',
      type: 'input',
      text: 'For x(t)=½(9.8)t², what is the average velocity from t=2 to t=4 s?',
      answer: '29.4',
      hints: ['x(4)=78.4, x(2)=19.6. Δx=58.8, Δt=2. v̄=29.4 m/s.'],
      reviewSection: 'Examples — evaluating average velocity',
    },
    {
      id: 'avg-q4',
      type: 'choice',
      text: 'Why can\'t you compute instantaneous velocity by dividing 0 by 0?',
      options: [
        'Because 0/0 is always equal to 1',
        'Because 0/0 is undefined — instead, we take the limit as Δt approaches (but never reaches) 0',
        'Because velocity is always nonzero',
        'Because you need at least three data points',
      ],
      answer: 'Because 0/0 is undefined — instead, we take the limit as Δt approaches (but never reaches) 0',
      hints: ['The limit captures the trend without dividing by zero.'],
      reviewSection: 'Rigor — why limits work',
    },
    {
      id: 'avg-q5',
      type: 'choice',
      text: 'A ball is thrown up and returns to its launch point. Its average velocity for the full trip is:',
      options: ['equal to its average speed', 'twice its average speed', 'zero', 'negative'],
      answer: 'zero',
      hints: ['Displacement = 0 when it returns. Average velocity = Δx/Δt = 0/Δt = 0.'],
      reviewSection: 'Examples — average speed vs average velocity',
    },
    {
      id: 'avg-q6',
      type: 'input',
      text: 'For x(t) = 3t², use the limit definition to find v(t). What is v(t) at t = 5 s?',
      answer: '30',
      hints: [
        'Limit gives v(t) = 6t (from expanding (t+Δt)², as in the challenge).',
        'v(5) = 6 × 5 = 30 m/s.',
      ],
      reviewSection: 'Challenges — limit definition',
    },
    {
      id: 'avg-q7',
      type: 'choice',
      text: 'Which numerical method gives the best approximation of instantaneous velocity at t=2?',
      options: [
        '(x(3)−x(2))/(3−2)',
        '(x(2.0001)−x(2))/0.0001',
        '(x(2.1)−x(1.9))/0.2',
        '(x(2)−x(1))/1',
      ],
      answer: '(x(2.1)−x(1.9))/0.2',
      hints: ['Symmetric interval around t=2 with small Δt gives the lowest error. (2.1−1.9)/2 = symmetric.'],
      reviewSection: 'Examples — approximating instantaneous velocity from a table',
    },
    {
      id: 'avg-q8',
      type: 'choice',
      text: 'The derivative dx/dt is equal to:',
      options: [
        'The average rate of change of x over any interval',
        'The slope of the secant line',
        'The instantaneous rate of change of x — the limit of Δx/Δt as Δt→0',
        'x divided by t',
      ],
      answer: 'The instantaneous rate of change of x — the limit of Δx/Δt as Δt→0',
      hints: ['dx/dt is defined as the limit — not a ratio of finite differences.'],
      reviewSection: 'Rigor — limit definition',
    },
  ],
}
