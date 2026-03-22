export default {
  id: 'ch2-reading-derivatives',
  slug: 'reading-derivatives',
  chapter: 2,
  order: 6,
  title: 'Reading Derivatives from Graphs',
  subtitle: 'The visual language of f, f\', f\'\', and f\'\'\' — what graphs reveal about motion and change',
  tags: ['derivatives', 'second derivative', 'third derivative', 'concavity', 'acceleration', 'motion', 'graph interpretation', 'jerk'],

  hook: {
    question: 'If you can see a graph of position over time, can you read off the velocity, acceleration, and even the rate-of-change of acceleration?',
    realWorldContext:
      'A roller coaster designer measures height h(t) as a function of time. From that single curve, engineers extract: ' +
      'velocity v = dh/dt (speed and direction), acceleration a = d²h/dt² (forces the rider experiences), ' +
      'and jerk j = d³h/dt³ (the "lurch"—rapid changes in acceleration that make rides thrilling or nauseating). ' +
      'Every derivative level tells a physical story. This lesson teaches you to read that story directly from a graph, ' +
      'without doing any calculus—pure visual interpretation.',
    previewVisualizationId: 'PositionVelocityAcceleration',
  },

  intuition: {
    prose: [
      'Graphs tell stories. Once you learn the vocabulary, you can read the story directly from the picture.',

      '**The First Derivative f\'(x): The Slope**  ' +
      'f\'(x) tells you the steepness and direction of f at each point. ' +
      'Where f is steep, f\' is large (positive or negative). Where f is flat, f\' is near zero. ' +
      'Where f is increasing (uphill), f\' > 0. Where f is decreasing (downhill), f\' < 0. ' +
      'This is the most direct reading: look at the tangent line at each point to visualize f\'.',

      '**Peaks and Valleys Tell You Where f\' = 0**  ' +
      'At the very top of a peak, the tangent line is horizontal (slope 0). ' +
      'At the bottom of a valley, the tangent line is also horizontal. ' +
      'These are critical points where f\'(x) = 0. Between them, the sign of f\' tells you monotonicity: ' +
      'if f\' is positive on an interval, f is increasing there; if f\' is negative, f is decreasing.',

      '**The Second Derivative f\'\'(x): The Curvature**  ' +
      'f\'\'(x) describes how the slope itself is changing. Is the curve bending upward or downward? ' +
      'If f\'\' > 0, the curve is concave up (shaped like a bowl ∪). The slope is getting steeper (becoming more positive or less negative). ' +
      'If f\'\' < 0, the curve is concave down (shaped like a cap ∩). The slope is getting flatter (becoming less positive or more negative). ' +
      'This is the "shape" of the curve independent of whether it\'s rising or falling.',

      '**Inflection Points: Where f\'\' Changes Sign**  ' +
      'An inflection point is where the curve transitions from one concavity to the other. ' +
      'At these points, f\'\'(x) = 0 and f\'\' changes sign. Geometrically, the curve goes from bowl-shaped to cap-shaped (or vice versa). ' +
      'This creates a visible "flex" in the curve.',

      '**The Second Derivative Test for Extrema**  ' +
      'If f\'(c) = 0 (critical point) and f\'\'(c) > 0 (concave up at that point), then c is a local minimum. ' +
      'If f\'(c) = 0 and f\'\'(c) < 0 (concave down), then c is a local maximum. ' +
      'This is faster than tracking sign changes: one evaluation of f\'\' tells the story.',

      '**The Third Derivative f\'\'\'(x): The Rate of Change of Concavity (Jerk)**  ' +
      'In physics, f\'\'\'(x) is called jerk—how fast the acceleration is changing. ' +
      'It is less commonly used but appears in engineering (cam design, ride comfort) and physics (smooth vs. jerky motion). ' +
      'High positive jerk means acceleration is increasing rapidly (fast onset of force). ' +
      'Negative jerk means acceleration is decreasing (smooth relief from force). ' +
      'Recognizing f\'\'\' helps understand more complex physical systems.',
    ],
    callouts: [
      {
        type: 'vocabulary',
        title: 'Four Levels of Information in One Graph',
        body: 'f = position/amount | f\' = rate of change/slope | f\'\' = curvature/acceleration | f\'\'\' = rate of change of acceleration/jerk',
      },
      {
        type: 'visual-rule',
        title: 'Reading f\' from a Sketch of f',
        body: 'Steep rise → f\' large and positive. Steep fall → f\' large and negative. Flat section → f\' near 0. Peak/valley → f\' = 0.',
      },
      {
        type: 'visual-rule',
        title: 'Reading f\'\' from a Sketch of f',
        body: 'Concave up (∪-shape) → f\' > 0. Concave down (∩-shape) → f\'\' < 0. Inflection point (flex point) → f\'\' changes sign.',
      },
      {
        type: 'tip',
        title: 'Sign Chart Strategy',
        body: 'Mark all critical points (where f\' = 0) and inflection points (where f\'\' = 0) on a number line. In each region between these points, determine the sign of f\' and f\'\' by testing a point. Build the full picture systematically.',
      },
      {
        type: 'warning',
        title: 'Not Every Point Has a Derivative',
        body: 'Corners, cusps, vertical tangents, and fast oscillation can make f\' undefined. In graph-reading problems, these are still critical structural points and must be included in sign-chart boundaries.',
      },
      {
        type: 'real-world',
        title: 'Applications: From Graphs to Reality',
        body: 'Position graph → read velocity and acceleration. Force graph → read power (f\' of work). Population graph → read growth rate and whether growth is accelerating. Stock price → read momentum and whether momentum is changing.',
      },
    ],
    visualizations: [
      {
        id: 'PositionVelocityAcceleration',
        title: 'Position, Velocity, and Acceleration Graphs',
        caption: 'Interactive: change the position curve and watch how f\', f\'\', and f\'\'\' respond in real time.',
      },
      {
        id: 'SignChartBuilder',
        title: 'Sign Chart Builder (f\' and f\'\')',
        caption: 'Use this to practice interval-sign reasoning before doing full symbolic curve sketching.',
      },
    ],
  },

  math: {
    prose: [
      '**Derivative as Slope of Tangent Line**  ' +
      'f\'(x) = slope of the tangent line to the graph of f at the point (x, f(x)). ' +
      'Geometrically: draw the best-fit line at any point; its slope is f\'(x).',

      '**Local Extrema and Critical Points**  ' +
      'If f has a local extremum (max or min) at x = c and f is differentiable there, then f\'(c) = 0. ' +
      'The converse is not always true: f\'(c) = 0 does not guarantee an extremum (saddle points exist). ' +
      'But critical points are always good candidates for maxima and minima.',

      '**First Derivative Test**  ' +
      'If f\'(x) changes from positive to negative as x increases through c, then f has a local maximum at c. ' +
      'If f\'(x) changes from negative to positive, then f has a local minimum at c. ' +
      'If f\'(x) does not change sign (stays positive or stays negative), then c is not a local extremum.',

      '**Concavity and Second Derivative**  ' +
      'If f\'\'(x) > 0 on an interval, then f is concave up on that interval. ' +
      'If f\'\'(x) < 0 on an interval, then f is concave down. ' +
      'Formally: concave up means f lies above its tangent lines; concave down means f lies below its tangent lines.',

      '**Second Derivative Test for Extrema**  ' +
      'Let f be twice differentiable and f\'(c) = 0. ' +
      'If f\'\'(c) > 0, then f has a local minimum at c. ' +
      'If f\'\'(c) < 0, then f has a local maximum at c. ' +
      'If f\'\'(c) = 0, the test is inconclusive; use the first derivative test or higher derivatives.',

      '**Inflection Point**  ' +
      'A point (c, f(c)) where f\'\'(c) = 0 (or f\'\' is undefined) AND f\'\' changes sign at c. ' +
      'At inflection points, the curve transitions from concave up to concave down (or vice versa).',

      '**Relationship Between Graphs**  ' +
      'If you have a graph of f, you can sketch f\' by: marking critical points (f\'(x) = 0) at peaks/valleys; ' +
      'drawing f\' positive where f increases, negative where f decreases, with height proportional to steepness.',

      '**Physical Interpretation (1D Motion)**  ' +
      'Position x(t): how far along a path. ' +
      'Velocity v(t) = dx/dt: speed and direction. ' +
      'Acceleration a(t) = dv/dt = d²x/dt²: rate of velocity change (how hard you are pushed). ' +
      'Jerk j(t) = da/dt = d³x/dt³: rate of acceleration change (the lurch). ' +
      'From one graph of position, read all four quantities.',
    ],
    callouts: [
      {
        type: 'key-theorem',
        title: 'Fermat\'s Theorem',
        body: 'If f has a local extremum at an interior point c of its domain and f is differentiable at c, then f\'(c) = 0.',
      },
      {
        type: 'technique',
        title: 'Complete Curve Sketching Algorithm',
        body: '(1) Find critical points (f\'=0). (2) Find inflection points (f\'\'=0). (3) Determine signs of f\' and f\'\' in each region. (4) Compute f and f\' at critical/inflection points and endpoints. (5) Plot and connect, respecting concavity.',
      },
    ],
    visualizations: [
      {
        id: 'SketchDerivativeGame',
        title: 'Sketch f′ from f — Try It',
        mathBridge: 'This game operationalizes the core reading rules in the math section. Peaks and valleys of $f$ (marked orange, where $f\'(x) = 0$) must be zero crossings of your $f\'$ sketch. Where $f$ rises steeply, your $f\'$ handle must be large and positive. Where $f$ falls, $f\'$ must be negative. The score measures how well your seven slope guesses match the actual $f\'(x) = 3x^2 - 3$. Hitting the reveal button shows how $f\'$ is a parabola — every feature of that parabola corresponds to a visible feature of the cubic $f$.',
        caption: 'Drag the handles to build your f′ sketch, then Reveal to see how close you are and why. The orange "f′=0" markers on f tell you exactly where f′ must cross zero.',
      },
    ],
  },

  rigor: {
    prose: [
      'The rigorous foundation: all these interpretations rest on the precise definition of the derivative as a limit. ' +
      'When we say "f\'(x) is the slope," we mean lim(h→0) (f(x+h)−f(x))/h. ' +
      'Translating between graphs and derivatives requires careful reasoning about which function represents which derivative level.',

      'Visual reasoning must be supplemented with algebraic verification, especially for complex functions. ' +
      'A graph can be misleading if it is poorly scaled or if subtle features are hidden by the display range. ' +
      'Always verify critical and inflection points algebraically.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'SketchDerivativeGame',
        title: 'Connect Visual Intuition to Algebra',
        mathBridge: 'After sketching, click Reveal to compare your intuition against the algebraic truth $f\'(x) = 3x^2 - 3$. The parabola $f\'$ achieves its minimum $-3$ at $x = 0$ (the inflection point of $f$) and crosses zero at $x = \\pm 1$ (the critical points of $f$). These correspondences are exact: every feature of the $f\'$ graph is forced by the geometry of $f$. That is Fermat\'s theorem made visual.',
        caption: 'After a round, read the feedback panel: it names the algebraic rules that explain each feature of f′ you just sketched by feel.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-read-ex1',
      title: 'Identifying Critical Points from a Graph',
      problem: 'A graph of f(x) has peaks at x = 1 and x = 5, and valleys at x = 3. Identify where f\'(x) = 0 and determine the sign of f\' in each region.',
      visualizationId: 'PositionVelocityAcceleration',
      params: {
        label: 'Periodic Motion',
        tMax: 6.28,
        s: 'Math.sin(t) * 2 + 5',
        v: 'Math.cos(t) * 2',
        a: '-Math.sin(t) * 2'
      },
      visualizations: [
        {
          id: 'DerivativeBuilder',
          title: 'Trace-The-Derivative View',
          caption: 'Use tangent slope tracing to connect where f rises/falls with the sign of f\'.'
        }
      ],
      interactive: true,
      steps: [
        { expression: 'f\'(x) = 0 \\text{ at } x = 1, 3, 5', annotation: 'Peaks and valleys: critical points.' },
        { expression: 'x < 1: f\'(x) > 0 \\text{ (f increasing towards peak)}', annotation: 'Leading up to the first peak.' },
        { expression: '1 < x < 3: f\'(x) < 0 \\text{ (f decreasing from peak to valley)}', annotation: 'After the peak, before the valley.' },
        { expression: '3 < x < 5: f\'(x) > 0 \\text{ (f increasing towards second peak)}', annotation: 'Rising again after the valley.' },
        { expression: 'x > 5: f\'(x) < 0 \\text{ (f decreasing after second peak)}', annotation: 'Falling after the second peak.' },
      ],
      conclusion: 'The graph of f\' is a wave: positive, crossing zero at x=1, negative, crossing zero at x=3, positive, crossing zero at x=5, then negative.',
    },

    {
      id: 'ch2-read-ex2',
      title: 'Concavity and Inflection Points',
      problem: 'For f(x) = x³ − 3x, identify f\'(x), f\'\'(x), critical points, and inflection points. Where is f concave up and where concave down?',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: 'x*x*x - 3*x',
        xMin: -3,
        xMax: 3,
        label: 'f(x) = x^3 - 3x'
      },
      visualizations: [
        {
          id: 'PositionVelocityAcceleration',
          title: 'Rate Layers (f, f\', f\') View',
          caption: 'Treat x like time to visualize how first and second derivative signals evolve together.',
          props: {
            label: 'f/f\'/f\'\' layers for x^3-3x',
            tMax: 3,
            s: 't*t*t - 3*t',
            v: '3*t*t - 3',
            a: '6*t'
          }
        }
      ],
      interactive: true,
      steps: [
        { expression: 'f\'(x) = 3x^2 - 3 = 3(x^2 - 1) = 3(x-1)(x+1)', annotation: 'First derivative.' },
        { expression: 'f\'\'(x) = 6x', annotation: 'Second derivative.' },
        { expression: 'f\'(x) = 0 \\Rightarrow x = \\pm 1', annotation: 'Critical points at x = −1 and x = 1.' },
        { expression: 'f\'\'(x) = 0 \\Rightarrow x = 0', annotation: 'Inflection point at x = 0.' },
        { expression: 'f\'\'(x) < 0 \\text{ for } x < 0 \\Rightarrow \\text{concave down}', annotation: 'Second derivative test.' },
        { expression: 'f\'\'(x) > 0 \\text{ for } x > 0 \\Rightarrow \\text{concave up}', annotation: 'Second derivative test.' },
        { expression: 'f\'\'(−1) = −6 < 0 \\Rightarrow x = −1 \\text{ is a local maximum}', annotation: 'Second derivative test at critical point.' },
        { expression: 'f\'\'(1) = 6 > 0 \\Rightarrow x = 1 \\text{ is a local minimum}', annotation: 'Second derivative test at critical point.' },
      ],
      conclusion: 'f has a local max at x = −1, transitions to concave up at x = 0 (inflection), and has a local min at x = 1.',

    },

    {
      id: 'ch2-read-ex3',
      title: 'Motion Interpretation: Reading a Position Graph',
      problem: 'A particle\'s position is given by x(t) = t³ − 6t² + 9t for 0 ≤ t ≤ 5. Find velocity, acceleration, and inflection point. Describe the motion.',
      visualizationId: 'PositionVelocityAcceleration',
      params: {
        label: 'x(t) = t^3 - 6t^2 + 9t',
        tMax: 5,
        s: 't*t*t - 6*t*t + 9*t',
        v: '3*t*t - 12*t + 9',
        a: '6*t - 12'
      },
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Position Curve Alone',
          caption: 'Isolate x(t) first, then compare to velocity and acceleration sign changes.',
          props: {
            fn: 'x*x*x - 6*x*x + 9*x',
            xMin: 0,
            xMax: 5,
            label: 'x(t) = t^3 - 6t^2 + 9t'
          }
        }
      ],
      interactive: true,
      steps: [
        { expression: 'v(t) = \\frac{dx}{dt} = 3t^2 - 12t + 9 = 3(t^2 - 4t + 3) = 3(t-1)(t-3)', annotation: 'Velocity.' },
        { expression: 'a(t) = \\frac{dv}{dt} = 6t - 12 = 6(t - 2)', annotation: 'Acceleration.' },
        { expression: 'v(t) = 0 \\Rightarrow t = 1, 3', annotation: 'Particle momentarily stops at t=1 and t=3.' },
        { expression: 'a(t) = 0 \\Rightarrow t = 2', annotation: 'Acceleration is zero at t=2 (inflection in position graph).' },
        { expression: '0 < t < 1: v > 0, a < 0 \\Rightarrow \\text{moving forward, slowing down}', annotation: 'First phase.' },
        { expression: '1 < t < 2: v < 0, a < 0 \\Rightarrow \\text{moving backward, speeding up}', annotation: 'Second phase.' },
        { expression: '2 < t < 3: v < 0, a > 0 \\Rightarrow \\text{moving backward, slowing down}', annotation: 'Third phase.' },
        { expression: 't > 3: v > 0, a > 0 \\Rightarrow \\text{moving forward, speeding up}', annotation: 'Fourth phase.' },
      ],
      conclusion: 'The particle moves forward, stops, reverses, stops again, then moves forward again. At t=2, the direction of acceleration flips—this marks maximum backward speed.',
    },

    {
      id: 'ch2-read-ex4',
      title: 'Second Derivative Test vs. First Derivative Test',
      problem: 'For f(x) = x⁴, find critical points and classify them using both tests.',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: 'x*x*x*x',
        xMin: -2,
        xMax: 2,
        label: 'f(x) = x^4'
      },
      visualizations: [
        {
          id: 'DerivativeBuilder',
          title: 'Why f\'(0)=0 but Test Can Be Inconclusive',
          caption: 'Tracing slope near x=0 reinforces why first-derivative sign change is decisive here.'
        }
      ],
      interactive: true,
      steps: [
        { expression: 'f\'(x) = 4x^3', annotation: 'First derivative.' },
        { expression: 'f\'\'(x) = 12x^2', annotation: 'Second derivative.' },
        { expression: 'f\'(x) = 0 \\Rightarrow x = 0', annotation: 'Only critical point at x = 0.' },
        { expression: '\\textbf{Second Derivative Test: } f\'\'(0) = 0 \\Rightarrow \\text{inconclusive}', annotation: 'f\'\' does not tell us whether x=0 is a max, min, or neither.' },
        { expression: 'f\'(x) < 0 \\text{ for } x < 0 \\quad f\'(x) > 0 \\text{ for } x > 0', annotation: 'First derivative test: f\' changes from negative to positive.' },
        { expression: '\\textbf{Conclusion: } x = 0 \\text{ is a local minimum}', annotation: 'First test succeeds where second test was inconclusive.' },
      ],
      conclusion: 'When f\'\'(c) = 0, the second test is inconclusive. Always have the first derivative test ready as backup.',

    },

    {
      id: 'ch2-read-ex5',
      title: 'Sketching f\' from a Sketch of f',
      problem: 'Given the shape of f (a smooth cubic starting low-left, rising to a peak, dipping to a valley, rising again to the right), sketch f\'.',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: 'x*x*x - 3*x',
        xMin: -3,
        xMax: 3,
        label: 'Reference cubic for f and f\''
      },
      visualizations: [
        {
          id: 'SketchDerivativeGame',
          title: 'Do It Yourself: Sketch f′ for f(x) = x³ − 3x',
          mathBridge: 'This is exactly the exercise described in the problem. The cubic $f(x) = x^3 - 3x$ has a peak at $x = -1$ and a valley at $x = 1$ (both orange marked). Your sketch should cross zero at both those x-values, be positive outside them, and be negative in between. After revealing, compare the exact parabola $f\'(x) = 3x^2 - 3$ to your intuitive sketch.',
          caption: 'Work through the steps in the example first, then use this game to verify your mental picture of what f′ should look like.',
        },
        {
          id: 'DerivativeBuilder',
          title: 'Tangent Slope Tracer (Continuous View)',
          caption: 'This traces the slope continuously as you drag — complementing the game\'s discrete 7-point sketch.',
        },
      ],
      interactive: true,
      steps: [
        { expression: '\\text{Left section (f rising): } f\'(x) > 0, \\text{ and slope increases} \\Rightarrow f\'\\text{ rises}', annotation: 'As f bends upward (concave up), f\' increases.' },
        { expression: '\\text{Peak: } f\'(x) = 0, \\text{ slope momentarily zero}', annotation: 'f\' crosses x-axis.' },
        { expression: '\\text{Middle section (f falling): } f\'(x) < 0, \\text{ and slope magnitude increases then decreases}', annotation: 'f\' dips below x-axis.' },
        { expression: '\\text{Valley: } f\'(x) = 0, \\text{ slope momentarily zero} \\Rightarrow f\'\\text{ crosses back up}', annotation: 'f\' returns to x-axis.' },
        { expression: '\\text{Right section (f rising): } f\'(x) > 0, \\text{ and slope increases}', annotation: 'f\' rises again as f steepens.' },
      ],
      conclusion: 'f\' traces a wave: positive, zero, negative, zero, positive. The shape mirrors the steepness of f at each point.',
    },

    {
      id: 'ch2-read-ex6',
      title: 'Mechanics Bridge: Vertical Projectile as Derivative Layers',
      problem: 'A projectile is launched upward with height model h(t) = 20t - 4.9t^2 (meters). Read velocity and acceleration directly from derivatives, and interpret key events from the graph.',
      visualizationId: 'PositionVelocityAcceleration',
      params: {
        label: 'h(t) = 20t - 4.9t^2',
        tMax: 4.2,
        s: '20*t - 4.9*t*t',
        v: '20 - 9.8*t',
        a: '-9.8'
      },
      visualizations: [
        {
          id: 'ProjectileMotion',
          title: '2D Trajectory View',
          caption: 'This geometric path is the same mechanics: derivatives of height control vertical motion while horizontal motion stays constant.'
        }
      ],
      interactive: true,
      steps: [
        { expression: 'h(t) = 20t - 4.9t^2', annotation: 'Position (height) function under constant gravitational acceleration.' },
        { expression: 'v(t) = h\'(t) = 20 - 9.8t', annotation: 'Velocity is the slope of the height graph.' },
        { expression: "a(t) = v'(t) = h''(t) = -9.8", annotation: 'Acceleration is constant and negative (gravity).' },
        { expression: 'v(t)=0 \Rightarrow 20 - 9.8t = 0 \Rightarrow t \approx 2.04\text{ s}', annotation: 'Top of flight: tangent to h(t) is horizontal, so slope/velocity is zero.' },
        { expression: 'h(2.04) \approx 20(2.04)-4.9(2.04)^2 \approx 20.41\text{ m}', annotation: 'Maximum height from evaluating position at the critical time.' },
        { expression: 'h(t)=0 \Rightarrow t(20-4.9t)=0 \Rightarrow t=0 \text{ or } t\approx 4.08\text{ s}', annotation: 'Launch and landing times from the height graph intercepts.' },
      ],
      conclusion: "The same graph gives three mechanics layers: position h, velocity h', and acceleration h''. Calculus turns one curve into full motion interpretation.",
    },
  ],

  challenges: [
    {
      id: 'ch2-read-ch1',
      difficulty: 'medium',
      problem: 'For f(x) = −x² + 4x − 3, compute f\'(x) and f\'\'(x), find all critical and inflection points, and sketch both f and f\'.',
      hint: 'This is a downward-opening parabola. Find its vertex (critical point), then note that f\'\' is constant (so no inflection points).',
      walkthrough: [
        { expression: 'f\'(x) = -2x + 4', annotation: 'First derivative (linear).' },
        { expression: 'f\'\'(x) = -2', annotation: 'Second derivative (constant, negative).' },
        { expression: 'f\'(x) = 0 \\Rightarrow x = 2', annotation: 'Critical point.' },
        { expression: 'f\'\'(2) = -2 < 0 \\Rightarrow \\text{local maximum at } x = 2', annotation: 'Second derivative is always negative: f is always concave down.' },
        { expression: 'f(2) = −4 + 8 − 3 = 1', annotation: 'Vertex at (2, 1).' },
      ],
      answer: 'Critical point at x = 2 (local max). No inflection points. f is always concave down.',
    },

    {
      id: 'ch2-read-ch2',
      difficulty: 'hard',
      problem: 'For f(x) = x⁴ − 2x², (a) find critical points and inflection points, (b) use the second derivative test to classify extrema, and (c) describe the "big picture" shape of f.',
      hint: 'Factor to find critical points. f\'\' is a cubic, so it has at most three zeros. Check the sign of f\'\' to determine concavity.',
      walkthrough: [
        { expression: 'f\'(x) = 4x^3 - 4x = 4x(x^2 - 1) = 4x(x-1)(x+1)', annotation: 'Critical points at x = −1, 0, 1.' },
        { expression: 'f\'\'(x) = 12x^2 - 4', annotation: 'Second derivative.' },
        { expression: 'f\'\'(x) = 0 \\Rightarrow x = \\pm \\sqrt{1/3} \\approx \\pm 0.577', annotation: 'Two inflection points.' },
        { expression: 'f\'\'(−1) = 12 - 4 = 8 > 0 \\Rightarrow \\text{local min at } x = -1', annotation: 'Second derivative test.' },
        { expression: 'f\'\'(0) = -4 < 0 \\Rightarrow \\text{local max at } x = 0', annotation: 'Second derivative test.' },
        { expression: 'f\'\'(1) = 12 - 4 = 8 > 0 \\Rightarrow \\text{local min at } x = 1', annotation: 'Second derivative test.' },
      ],
      answer: 'Two local mins (x = ±1), one local max (x = 0). Two inflection points at x = ±√(1/3). W-shaped with bumps at x = ±1, dip at x = 0.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'differentiation-rules', label: 'Differentiation Rules', context: 'To compute f\' and f\'\', you use these rules.' },
    { lessonSlug: 'curve-sketching', label: 'Curve Sketching', context: 'Synthesizes f, f\', f\'\' into a complete sketch.' },
    { lessonSlug: 'mean-value-theorem', label: 'Mean Value Theorem', context: 'Formalizes the connection between f\' and the shape of f.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-2', 'completed-example-4', 'completed-example-6', 'solved-challenge'],
}
