export default {
  id: "ch2-reading-derivatives",
  slug: "reading-derivatives",
  chapter: 2,
  order: 9,

  spiral: {
    recoveryPoints: [
      { label: 'All Differentiation Rules', note: 'You need to be able to compute derivatives to verify your visual readings algebraically — every differentiation rule you learned is a tool for confirming what you see in the graph.' },
      { label: 'Slope and Tangent Line', note: 'The derivative f\'(x) is defined as the slope of the tangent line at x. Reading f\' from a graph is reading the slope of the tangent at each point.' },
    ],
    futureLinks: [
      { label: 'Curve Sketching (Chapter 3)', note: 'This lesson is the foundation for curve sketching — the systematic process of constructing the graph of f from information about f\', f\'\', and f\'\'\'.' },
      { label: 'Optimization', note: 'Finding maxima and minima requires reading f\'=0 to locate critical point candidates, then using sign charts or the second derivative test to classify them.' },
      { label: 'Related Rates', note: 'Reading velocity from a position graph is exactly the related rates idea — the derivative of position with respect to time gives the velocity at each instant.' },
    ],
  },

  title: "Reading Derivatives from Graphs",
  subtitle:
    "The visual language of f, f', f'', and f''' — what graphs reveal about motion and change",
  tags: [
    "derivatives",
    "second derivative",
    "third derivative",
    "concavity",
    "acceleration",
    "motion",
    "graph interpretation",
    "jerk",
  ],

  hook: {
    question:
      "If you can see a graph of position over time, can you read off the velocity, acceleration, and even the rate-of-change of acceleration?",
    realWorldContext:
      "A roller coaster designer measures height h(t) as a function of time. From that single curve, engineers extract: " +
      "velocity v = dh/dt (speed and direction), acceleration a = d²h/dt² (forces the rider experiences), " +
      'and jerk j = d³h/dt³ (the "lurch"—rapid changes in acceleration that make rides thrilling or nauseating). ' +
      "Every derivative level tells a physical story. This lesson teaches you to read that story directly from a graph, " +
      "without doing any calculus—pure visual interpretation.",
    previewVisualizationId: "PositionVelocityAcceleration",
  },

  intuition: {
    prose: [
      '**Where you are in the story — and what this lesson completes:** Over the past nine lessons you have built the entire toolkit of differential calculus: limit definition, shortcut rules, chain rule, special function families (trig, exp/log, inverse), and implicit differentiation. That is the "how to compute" side. This final lesson teaches the other side: **how to read**. Given any graph, you should be able to extract everything the derivative reveals — without computing anything.',

      '**Why this matters as a capstone:** A physicist looking at a position-vs-time graph reads velocity and acceleration directly. An economist looking at a profit graph reads marginal profit. An engineer looking at a stress-strain curve reads stiffness. All of them are reading derivatives. This lesson builds that same visual fluency.',

      "Graphs tell stories. Once you learn the vocabulary, you can read the story directly from the picture.",

      "**The First Derivative f'(x): The Slope**  " +
        "f'(x) tells you the steepness and direction of f at each point. " +
        "Where f is steep, f' is large (positive or negative). Where f is flat, f' is near zero. " +
        "Where f is increasing (uphill), f' > 0. Where f is decreasing (downhill), f' < 0. " +
        "This is the most direct reading: look at the tangent line at each point to visualize f'.",

      "**Peaks and Valleys Tell You Where f' = 0**  " +
        "At the very top of a peak, the tangent line is horizontal (slope 0). " +
        "At the bottom of a valley, the tangent line is also horizontal. " +
        "These are critical points where f'(x) = 0. Between them, the sign of f' tells you monotonicity: " +
        "if f' is positive on an interval, f is increasing there; if f' is negative, f is decreasing.",

      "**The Second Derivative f''(x): The Curvature**  " +
        "f''(x) describes how the slope itself is changing. Is the curve bending upward or downward? " +
        "If f'' > 0, the curve is concave up (shaped like a bowl ∪). The slope is getting steeper (becoming more positive or less negative). " +
        "If f'' < 0, the curve is concave down (shaped like a cap ∩). The slope is getting flatter (becoming less positive or more negative). " +
        'This is the "shape" of the curve independent of whether it\'s rising or falling.',

      "**Inflection Points: Where f'' Changes Sign**  " +
        "An inflection point is where the curve transitions from one concavity to the other. " +
        "At these points, f''(x) = 0 and f'' changes sign. Geometrically, the curve goes from bowl-shaped to cap-shaped (or vice versa). " +
        'This creates a visible "flex" in the curve.',

      "**The Second Derivative Test for Extrema**  " +
        "If f'(c) = 0 (critical point) and f''(c) > 0 (concave up at that point), then c is a local minimum. " +
        "If f'(c) = 0 and f''(c) < 0 (concave down), then c is a local maximum. " +
        "This is faster than tracking sign changes: one evaluation of f'' tells the story.",

      "**The Third Derivative f'''(x): The Rate of Change of Concavity (Jerk)**  " +
        "In physics, f'''(x) is called jerk—how fast the acceleration is changing. " +
        "It is less commonly used but appears in engineering (cam design, ride comfort) and physics (smooth vs. jerky motion). " +
        "High positive jerk means acceleration is increasing rapidly (fast onset of force). " +
        "Negative jerk means acceleration is decreasing (smooth relief from force). " +
        "Recognizing f''' helps understand more complex physical systems.",

      "**Chapter 2 Complete — What You Now Know:** You have built derivative intuition from first principles, mastered all the differentiation rules, applied them to every fundamental function family, handled implicit curves, and learned to read the derivative language visually. The derivative is no longer an abstract concept — it is a tool you can wield. Chapter 3 will use these tools to answer the question calculus was originally invented to solve: optimization. Given any function, find where it reaches its maximum or minimum value.",

      "**First derivative test vs. second derivative test:** At a critical point where f'(c)=0, you can determine whether it is a local max or min in two ways. (1) First derivative test: check the sign of f' just before and after c. If f' changes from positive to negative, f goes from increasing to decreasing, so c is a local max. If f' changes from negative to positive, f goes from decreasing to increasing, so c is a local min. If f' does not change sign, c is neither (a horizontal inflection). (2) Second derivative test: if f''(c)>0, the curve is concave up at c, which means the critical point is a local min (bowl shape). If f''(c)<0, the curve is concave down at c, which means the critical point is a local max (cap shape). If f''(c)=0, the test is inconclusive — the curve could be a max, min, or inflection, and you must fall back on the first derivative test. The second derivative test is faster when f'' is easy to compute, but it fails in the inconclusive case, so knowing both tests is essential.",

      "**Reading derivatives on standard exams — given a graph of f', what can you say about f?** This is a classic AP Calculus and college exam question type. The rules are: (1) When f'>0, f is increasing. (2) When f'<0, f is decreasing. (3) When f' changes sign from positive to negative at x=c, f has a local maximum at c. (4) When f' changes sign from negative to positive at x=c, f has a local minimum at c. (5) When f' is increasing on an interval, f is concave up there (because f''=(f')'>0). (6) When f' is decreasing on an interval, f is concave down there (because f''=(f')'<0). (7) Where f' has a local maximum or local minimum, f has an inflection point — the concavity of f changes at that x-value. Internalizing these seven rules lets you reconstruct the qualitative shape of f from any graph of f' alone.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 10 of 10 — Act 4: Synthesis Capstone',
        body: '**Previous:** Implicit differentiation — the chain rule applied to equations F(x,y)=0.\n**This lesson:** The visual language of derivatives — reading f, f′, f′′, f′′′ from graphs to understand shape, motion, and change.\n**Chapter complete:** You can compute and read any derivative. Chapter 3 applies these tools to optimization.',
      },
      {
        type: "vocabulary",
        title: "Four Levels of Information in One Graph",
        body: "f = position/amount | f' = rate of change/slope | f'' = curvature/acceleration | f''' = rate of change of acceleration/jerk",
      },
      {
        type: "visual-rule",
        title: "Reading f' from a Sketch of f",
        body: "Steep rise → f' large and positive. Steep fall → f' large and negative. Flat section → f' near 0. Peak/valley → f' = 0.",
      },
      {
        type: "visual-rule",
        title: "Reading f'' from a Sketch of f",
        body: "Concave up (∪-shape) → f' > 0. Concave down (∩-shape) → f'' < 0. Inflection point (flex point) → f'' changes sign.",
      },
      {
        type: "tip",
        title: "Sign Chart Strategy",
        body: "Mark all critical points (where f' = 0) and inflection points (where f'' = 0) on a number line. In each region between these points, determine the sign of f' and f'' by testing a point. Build the full picture systematically.",
      },
      {
        type: "visual-rule",
        title: "Four-Level Reading Checklist",
        body: "\\textbf{f (orange):} Sign = above/below axis. Zero = root. Rising/falling = positive/negative f'.\\\\ \\textbf{f' (blue):} Sign = f increasing/decreasing. Zero = f has flat tangent (peak, valley, or saddle). Large positive = f steeply rising.\\\\ \\textbf{f'' (purple):} Sign = f concave up (∪)/down (∩). Zero = f has inflection point. Tells you whether a critical point of f is a max (f''<0) or min (f''>0).\\\\ \\textbf{f'''(green):} Sign = f'' increasing/decreasing. Zero = inflection in f''. Physical meaning: jerk — how fast acceleration changes.",
      },
      {
        type: "warning",
        title: "Not Every Point Has a Derivative",
        body: "Corners, cusps, vertical tangents, and fast oscillation can make f' undefined. In graph-reading problems, these are still critical structural points and must be included in sign-chart boundaries.",
      },
      {
        type: "real-world",
        title: "Applications: From Graphs to Reality",
        body: "Position graph → read velocity and acceleration. Force graph → read power (f' of work). Population graph → read growth rate and whether growth is accelerating. Stock price → read momentum and whether momentum is changing.",
      },
    ],
    visualizations: [
      {
        id: "HigherOrderDerivatives",
        title: "Higher Order Derivatives",
        caption: "Understand the visual and physical properties of second and third derivatives.",
      },
      {
        id: "MotionAlongLine",
        title: "Motion Along a Line",
        caption: "Watch displacement, velocity, and acceleration interact in real time.",
      },
      {
        id: "PositionVelocityAcceleration",
        title: "Position, Velocity, and Acceleration Graphs",
        mathBridge: "Before interacting: given the position curve, identify by eye: (a) where is the object moving fastest upward? (b) where does it stop momentarily? (c) where does it reverse direction? Your answers become verifiable — where position peaks, velocity is zero; where position has steepest positive slope, velocity is maximum. After verifying visually, check: does the velocity curve change sign exactly where you predicted? The position and velocity curves must be consistent: every zero of velocity must align with a peak or valley of position, and every zero of acceleration must align with a peak or valley of velocity.",
        caption:
          "Interactive: change the position curve and watch how f', f'', and f''' respond in real time.",
      },
      {
        id: "SignChartBuilder",
        title: "Sign Chart Builder (f' and f'')",
        mathBridge: "Build a sign chart by placing critical points (where f\'=0) and inflection points (where f\'\'=0) on the number line. In each region between these markers, pick a test point and evaluate f\' and f\'\' to determine their signs. The sign of f\' tells you whether f is increasing (+) or decreasing (\u2212). The sign of f\'\' tells you whether f is concave up (+) or concave down (\u2212). A sign change in f\' at a critical point means a local extremum. A sign change in f\'\' means an inflection point. Complete this chart before sketching any curve \u2014 the chart is the algebraic skeleton that your sketch must honor.",
        caption:
          "Use this to practice interval-sign reasoning before doing full symbolic curve sketching.",
      },
    ],
  },

  math: {
    prose: [
      "**Derivative as Slope of Tangent Line**  " +
        "f'(x) = slope of the tangent line to the graph of f at the point (x, f(x)). " +
        "Geometrically: draw the best-fit line at any point; its slope is f'(x).",

      "**Local Extrema and Critical Points**  " +
        "If f has a local extremum (max or min) at x = c and f is differentiable there, then f'(c) = 0. " +
        "The converse is not always true: f'(c) = 0 does not guarantee an extremum (saddle points exist). " +
        "But critical points are always good candidates for maxima and minima.",

      "**First Derivative Test**  " +
        "If f'(x) changes from positive to negative as x increases through c, then f has a local maximum at c. " +
        "If f'(x) changes from negative to positive, then f has a local minimum at c. " +
        "If f'(x) does not change sign (stays positive or stays negative), then c is not a local extremum.",

      "**Concavity and Second Derivative**  " +
        "If f''(x) > 0 on an interval, then f is concave up on that interval. " +
        "If f''(x) < 0 on an interval, then f is concave down. " +
        "Formally: concave up means f lies above its tangent lines; concave down means f lies below its tangent lines.",

      "**Second Derivative Test for Extrema**  " +
        "Let f be twice differentiable and f'(c) = 0. " +
        "If f''(c) > 0, then f has a local minimum at c. " +
        "If f''(c) < 0, then f has a local maximum at c. " +
        "If f''(c) = 0, the test is inconclusive; use the first derivative test or higher derivatives.",

      "**Inflection Point**  " +
        "A point (c, f(c)) where f''(c) = 0 (or f'' is undefined) AND f'' changes sign at c. " +
        "At inflection points, the curve transitions from concave up to concave down (or vice versa).",

      "**Relationship Between Graphs**  " +
        "If you have a graph of f, you can sketch f' by: marking critical points (f'(x) = 0) at peaks/valleys; " +
        "drawing f' positive where f increases, negative where f decreases, with height proportional to steepness.",

      "**Physical Interpretation (1D Motion)**  " +
        "Position x(t): how far along a path. " +
        "Velocity v(t) = dx/dt: speed and direction. " +
        "Acceleration a(t) = dv/dt = d²x/dt²: rate of velocity change (how hard you are pushed). " +
        "Jerk j(t) = da/dt = d³x/dt³: rate of acceleration change (the lurch). " +
        "From one graph of position, read all four quantities.",
    ],
    callouts: [
      {
        type: "key-theorem",
        title: "Fermat's Theorem",
        body: "If f has a local extremum at an interior point c of its domain and f is differentiable at c, then f'(c) = 0.",
      },
      {
        type: "technique",
        title: "Complete Curve Sketching Algorithm",
        body: "(1) Find critical points (f'=0). (2) Find inflection points (f''=0). (3) Determine signs of f' and f'' in each region. (4) Compute f and f' at critical/inflection points and endpoints. (5) Plot and connect, respecting concavity.",
      },
    ],
    visualizations: [
      {
        id: "SketchDerivativeGame",
        title: "Sketch f′ from f — Try It",
        mathBridge:
          "This game operationalizes the core reading rules in the math section. Peaks and valleys of $f$ (marked orange, where $f'(x) = 0$) must be zero crossings of your $f'$ sketch. Where $f$ rises steeply, your $f'$ handle must be large and positive. Where $f$ falls, $f'$ must be negative. The score measures how well your seven slope guesses match the actual $f'(x) = 3x^2 - 3$. Hitting the reveal button shows how $f'$ is a parabola — every feature of that parabola corresponds to a visible feature of the cubic $f$.",
        caption:
          'Drag the handles to build your f′ sketch, then Reveal to see how close you are and why. The orange "f′=0" markers on f tell you exactly where f′ must cross zero.',
      },
    ],
  },

  rigor: {
    prose: [
      "The rigorous foundation: all these interpretations rest on the precise definition of the derivative as a limit. " +
        'When we say "f\'(x) is the slope," we mean lim(h→0) (f(x+h)−f(x))/h. ' +
        "Translating between graphs and derivatives requires careful reasoning about which function represents which derivative level.",

      "Visual reasoning must be supplemented with algebraic verification, especially for complex functions. " +
        "A graph can be misleading if it is poorly scaled or if subtle features are hidden by the display range. " +
        "Always verify critical and inflection points algebraically.",
    ],
    callouts: [],
    visualizations: [
      {
        id: "SketchDerivativeGame",
        title: "Connect Visual Intuition to Algebra",
        mathBridge:
          "After sketching, click Reveal to compare your intuition against the algebraic truth $f'(x) = 3x^2 - 3$. The parabola $f'$ achieves its minimum $-3$ at $x = 0$ (the inflection point of $f$) and crosses zero at $x = \\pm 1$ (the critical points of $f$). These correspondences are exact: every feature of the $f'$ graph is forced by the geometry of $f$. That is Fermat's theorem made visual.",
        caption:
          "After a round, read the feedback panel: it names the algebraic rules that explain each feature of f′ you just sketched by feel.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-read-ex1",
      title: "Identifying Critical Points from a Graph",
      problem:
        "A graph of f(x) has peaks at x = 1 and x = 5, and valleys at x = 3. Identify where f'(x) = 0 and determine the sign of f' in each region.",
      visualizationId: "PositionVelocityAcceleration",
      params: {
        label: "Periodic Motion",
        tMax: 6.28,
        s: "Math.sin(t) * 2 + 5",
        v: "Math.cos(t) * 2",
        a: "-Math.sin(t) * 2",
      },
      visualizations: [
        {
          id: "DerivativeBuilder",
          title: "Trace-The-Derivative View",
          caption:
            "Use tangent slope tracing to connect where f rises/falls with the sign of f'.",
        },
      ],
      interactive: true,
      steps: [
        {
          expression: "f'(x) = 0 \\text{ at } x = 1, 3, 5",
          annotation: "Peaks and valleys: critical points.",
          strategyTitle: "Locate where f'(x) = 0: peaks and valleys are critical points",
          checkpoint: "At x = 1, the graph of f reaches a peak. What must the slope of the tangent line be at that exact point?",
          hints: [
            "At every local maximum or minimum of f, the tangent line is horizontal — slope zero — so f'(x) = 0 there. Mark x = 1, 3, 5 as critical points.",
            "This is Fermat's Theorem: if f has a local extremum at an interior point c where f is differentiable, then f'(c) = 0. The horizontal tangent is the geometric version of that theorem.",
            "These critical points are exactly the candidates you examine in curve sketching (Chapter 3, Lesson 5) and optimization (Chapter 3, Lesson 6). Every max/min search begins by solving f'(x) = 0.",
          ],
        },
        {
          expression: "x < 1: f'(x) > 0 \\text{ (f increasing towards peak)}",
          annotation: "Leading up to the first peak.",
          strategyTitle: "Read sign of f'(x): positive means f is increasing",
          checkpoint: "Before x = 1, is the graph of f going uphill or downhill? What sign does that force on f'?",
          hints: [
            "f' > 0 on an interval means f is increasing on that interval — the tangent line tilts upward. Here f climbs toward the peak at x = 1, so f' > 0 for x < 1.",
            "By the Mean Value Theorem, if f' > 0 everywhere on (a, b) then every secant line over that interval has positive slope, so f(b) > f(a) — f genuinely increases from left to right.",
            "In optimization (Chapter 3, Lesson 6), a positive f' before a critical point and negative f' after it is exactly the first-derivative test signature for a local maximum.",
          ],
        },
        {
          expression:
            "1 < x < 3: f'(x) < 0 \\text{ (f decreasing from peak to valley)}",
          annotation: "After the peak, before the valley.",
          strategyTitle: "Read sign of f'(x): negative means f is decreasing",
          checkpoint: "Between x = 1 (peak) and x = 3 (valley), the graph of f descends. What sign must f' have throughout that interval?",
          hints: [
            "f' < 0 on an interval means f is decreasing — the tangent line tilts downward. Between a peak and a valley, f always descends, so f' < 0 on (1, 3).",
            "The MVT again: if f' < 0 on (a, b) then any two points satisfy f(b) < f(a), confirming f is strictly decreasing. The negative sign is the algebraic encoding of a falling graph.",
            "The sign change of f' from positive (before x = 1) to negative (after x = 1) confirms x = 1 is a local maximum by the first-derivative test — a key concept in curve sketching.",
          ],
        },
        {
          expression:
            "3 < x < 5: f'(x) > 0 \\text{ (f increasing towards second peak)}",
          annotation: "Rising again after the valley.",
          strategyTitle: "Read sign of f'(x) after the valley: f rises again so f' > 0",
          checkpoint: "At x = 3 the graph hits a valley, then climbs to x = 5. What sign does f' have on (3, 5), and what does the sign change at x = 3 tell you about x = 3?",
          hints: [
            "f climbs from valley to peak on (3, 5), so f' > 0 there. At x = 3, f' changes sign from negative to positive — that sign change identifies x = 3 as a local minimum.",
            "First-derivative test: negative-to-positive sign change in f' at a critical point means the function switches from decreasing to increasing, so the critical point is a local minimum.",
            "In curve sketching, alternating sign changes in f' (positive → negative → positive) produce the wave pattern: rise to peak, fall to valley, rise to peak. This is the visual backbone of the final sketch.",
          ],
        },
        {
          expression:
            "x > 5: f'(x) < 0 \\text{ (f decreasing after second peak)}",
          annotation: "Falling after the second peak.",
          strategyTitle: "Read sign of f'(x) after the last peak: f descends so f' < 0",
          checkpoint: "After the peak at x = 5, the function falls. What sign does f' take, and what does the sign change at x = 5 tell you?",
          hints: [
            "f' < 0 for x > 5 because f is descending. The sign change at x = 5 from positive to negative confirms x = 5 is a local maximum by the first-derivative test.",
            "Combining all three sign changes: positive→negative at x = 1 (local max), negative→positive at x = 3 (local min), positive→negative at x = 5 (local max). This complete sign chart fully describes the monotone behavior of f.",
            "This completed sign chart is the starting point for full curve sketching in Chapter 3: once you know where f increases, decreases, and has extrema, you can sketch the qualitative shape of f without plotting individual points.",
          ],
        },
      ],
      conclusion:
        "The graph of f' is a wave: positive, crossing zero at x=1, negative, crossing zero at x=3, positive, crossing zero at x=5, then negative.",
    },

    {
      id: "ch2-read-ex2",
      title: "Concavity and Inflection Points",
      problem:
        "For f(x) = x³ − 3x, identify f'(x), f''(x), critical points, and inflection points. Where is f concave up and where concave down?",
      visualizationId: "FunctionPlotter",
      params: {
        fn: "x*x*x - 3*x",
        xMin: -3,
        xMax: 3,
        label: "f(x) = x^3 - 3x",
      },
      visualizations: [
        {
          id: "PositionVelocityAcceleration",
          title: "Rate Layers (f, f', f') View",
          caption:
            "Treat x like time to visualize how first and second derivative signals evolve together.",
          props: {
            label: "f/f'/f'' layers for x^3-3x",
            tMax: 3,
            s: "t*t*t - 3*t",
            v: "3*t*t - 3",
            a: "6*t",
          },
        },
      ],
      interactive: true,
      steps: [
        {
          expression: "f'(x) = 3x^2 - 3 = 3(x^2 - 1) = 3(x-1)(x+1)",
          annotation: "First derivative.",
          strategyTitle: "Compute f'(x): differentiate to find the slope function",
          checkpoint: "Apply the power rule to x³ − 3x. What does each term become? Can you factor the result to spot where it equals zero?",
          hints: [
            "Power rule: d/dx[x³] = 3x², d/dx[3x] = 3. So f'(x) = 3x² − 3 = 3(x²−1) = 3(x−1)(x+1).",
            "Factoring as 3(x−1)(x+1) immediately reveals the zeros at x = ±1 without solving a quadratic equation. Always factor derivatives when possible to read off critical points directly.",
            "This factored form is the most useful in curve sketching: the sign of f' is determined by the signs of (x−1) and (x+1) in each region, giving the increasing/decreasing intervals at a glance.",
          ],
        },
        {
          expression: "f''(x) = 6x",
          annotation: "Second derivative.",
          strategyTitle: "Compute f''(x): differentiate f' to find the concavity function",
          checkpoint: "Apply the power rule to 3x² − 3. What is f''(x)? Where does it equal zero?",
          hints: [
            "f'(x) = 3x² − 3, so f''(x) = 6x by the power rule. This is zero at x = 0.",
            "f'' measures how the slope itself changes. When f'' > 0, the slope is increasing (curve bends upward, concave up ∪). When f'' < 0, the slope is decreasing (curve bends downward, concave down ∩).",
            "The zero of f'' at x = 0 is the candidate inflection point. You still need to verify that f'' changes sign there — a zero of f'' alone is necessary but not sufficient for an inflection point.",
          ],
        },
        {
          expression: "f'(x) = 0 \\Rightarrow x = \\pm 1",
          annotation: "Critical points at x = −1 and x = 1.",
          strategyTitle: "Locate where f'(x) = 0: critical points are candidates for extrema",
          checkpoint: "Set 3(x−1)(x+1) = 0. What are the critical points? Are they guaranteed to be local maxima or minima?",
          hints: [
            "3(x−1)(x+1) = 0 gives x = 1 or x = −1. These are critical points — candidates for local maxima or minima.",
            "Fermat's Theorem guarantees that any differentiable local extremum is a critical point, but the converse fails: a critical point can also be a horizontal inflection (saddle). Classification requires additional work (first or second derivative test).",
            "In optimization (Chapter 3), finding critical points by solving f'(x) = 0 is always the first step. The classification step — max, min, or neither — comes next using the tests developed in this lesson.",
          ],
        },
        {
          expression: "f''(x) = 0 \\Rightarrow x = 0",
          annotation: "Inflection point at x = 0.",
          strategyTitle: "Locate where f''(x) = 0: inflection point candidate",
          checkpoint: "Set 6x = 0. What x-value results? What must you verify to confirm this is truly an inflection point?",
          hints: [
            "6x = 0 gives x = 0. This is an inflection point candidate — you must check that f'' actually changes sign at x = 0.",
            "f''(x) = 6x is negative for x < 0 and positive for x > 0. The sign does change at x = 0, confirming it is a genuine inflection point where concavity transitions from down (∩) to up (∪).",
            "Inflection points appear in curve sketching as the 'flex points' in the graph — where the bending direction switches. They are also where f' achieves its local extrema, since f'' = (f')' = 0 means f' has a critical point.",
          ],
        },
        {
          expression:
            "f''(x) < 0 \\text{ for } x < 0 \\Rightarrow \\text{concave down}",
          annotation: "Second derivative test.",
          strategyTitle: "Read sign of f''(x): negative means concave down (∩-shape)",
          checkpoint: "For x = −1 (a test point in x < 0), f''(−1) = −6. What does a negative f'' tell you about the shape of f there?",
          hints: [
            "f'' < 0 on an interval means f is concave down there — the curve bends like a cap (∩). The slope f' is decreasing: the tangent line rotates clockwise as x increases.",
            "Geometrically, concave down means f lies below its tangent lines on that interval. This is the opposite of a bowl shape — the curve arches over and falls away from the tangent.",
            "In curve sketching, labeling each region with its concavity (up or down) is the second major step after sign-charting f'. Combined, f' sign and f'' sign fully determine the qualitative shape of f in each interval.",
          ],
        },
        {
          expression:
            "f''(x) > 0 \\text{ for } x > 0 \\Rightarrow \\text{concave up}",
          annotation: "Second derivative test.",
          strategyTitle: "Read sign of f''(x): positive means concave up (∪-shape)",
          checkpoint: "For x = 1 (a test point in x > 0), f''(1) = 6. What does a positive f'' tell you about the shape of f there?",
          hints: [
            "f'' > 0 on an interval means f is concave up there — the curve bends like a bowl (∪). The slope f' is increasing: the tangent line rotates counterclockwise as x increases.",
            "Geometrically, concave up means f lies above its tangent lines. This is the bowl-shape intuition: the curve cups upward, like the bottom of a parabola.",
            "Connected to optimization: if a critical point sits inside a concave-up region, it must be a local minimum (the curve bowls upward around it). This is the core idea behind the second-derivative test.",
          ],
        },
        {
          expression:
            "f''(−1) = −6 < 0 \\Rightarrow x = −1 \\text{ is a local maximum}",
          annotation: "Second derivative test at critical point.",
          strategyTitle: "Apply second derivative test at x = −1: f''(−1) < 0 → local max",
          checkpoint: "At the critical point x = −1, f'(−1) = 0 and f''(−1) = −6. What does the negative f'' tell you about whether this is a max or min?",
          hints: [
            "Second derivative test: if f'(c) = 0 and f''(c) < 0, then c is a local maximum. The curve is concave down at that point — it caps over — so the critical point is at the top of the cap.",
            "Intuitively: at x = −1, the slope is zero and the curve is bending downward. The function was rising to reach this point and is about to fall — that is the signature of a local maximum.",
            "This is faster than the first-derivative test when f'' is easy to evaluate. In curve sketching, after finding all critical points, evaluate f'' at each to classify them efficiently before drawing the sketch.",
          ],
        },
        {
          expression:
            "f''(1) = 6 > 0 \\Rightarrow x = 1 \\text{ is a local minimum}",
          annotation: "Second derivative test at critical point.",
          strategyTitle: "Apply second derivative test at x = 1: f''(1) > 0 → local min",
          checkpoint: "At x = 1, f'(1) = 0 and f''(1) = 6. What does the positive f'' tell you about classification?",
          hints: [
            "Second derivative test: if f'(c) = 0 and f''(c) > 0, then c is a local minimum. The curve is concave up — bowl-shaped — so the critical point sits at the bottom of the bowl.",
            "Intuitively: at x = 1, the slope is zero and the curve is bending upward. The function was decreasing to reach this point and is about to rise — that is the signature of a local minimum.",
            "With x = −1 (local max) and x = 1 (local min) both classified, and the inflection point at x = 0, you now have all the structural information needed to sketch f(x) = x³ − 3x accurately.",
          ],
        },
      ],
      conclusion:
        "f has a local max at x = −1, transitions to concave up at x = 0 (inflection), and has a local min at x = 1.",
    },

    {
      id: "ch2-read-ex3",
      title: "Motion Interpretation: Reading a Position Graph",
      problem:
        "A particle's position is given by x(t) = t³ − 6t² + 9t for 0 ≤ t ≤ 5. Find velocity, acceleration, and inflection point. Describe the motion.",
      visualizationId: "PositionVelocityAcceleration",
      params: {
        label: "x(t) = t^3 - 6t^2 + 9t",
        tMax: 5,
        s: "t*t*t - 6*t*t + 9*t",
        v: "3*t*t - 12*t + 9",
        a: "6*t - 12",
      },
      visualizations: [
        {
          id: "FunctionPlotter",
          title: "Position Curve Alone",
          caption:
            "Isolate x(t) first, then compare to velocity and acceleration sign changes.",
          props: {
            fn: "x*x*x - 6*x*x + 9*x",
            xMin: 0,
            xMax: 5,
            label: "x(t) = t^3 - 6t^2 + 9t",
          },
        },
      ],
      interactive: true,
      steps: [
        {
          expression:
            "v(t) = \\frac{dx}{dt} = 3t^2 - 12t + 9 = 3(t^2 - 4t + 3) = 3(t-1)(t-3)",
          annotation: "Velocity.",
          strategyTitle: "Read f'(x) as velocity: differentiate position to get the rate of motion",
          checkpoint: "Differentiate x(t) = t³ − 6t² + 9t. What is v(t)? Where does v(t) = 0, and what does that mean physically?",
          hints: [
            "Power rule: v(t) = dx/dt = 3t² − 12t + 9 = 3(t−1)(t−3). The zeros at t = 1 and t = 3 are where the particle momentarily stops — these are critical points of the position function.",
            "v(t) > 0 means the particle moves in the positive direction (forward). v(t) < 0 means backward. v(t) = 0 means it has stopped instantaneously — the tangent to the position curve is horizontal at those moments.",
            "This is exactly the reading rule for f': wherever f (position) has a local max or min, f' (velocity) equals zero. This motion context is the original motivation for the derivative concept — instantaneous velocity as the limit of average velocity.",
          ],
        },
        {
          expression: "a(t) = \\frac{dv}{dt} = 6t - 12 = 6(t - 2)",
          annotation: "Acceleration.",
          strategyTitle: "Read f''(x) as acceleration: differentiate velocity to get the rate of velocity change",
          checkpoint: "Differentiate v(t) = 3t² − 12t + 9. What is a(t)? Where is a(t) = 0, and what does that mean physically?",
          hints: [
            "a(t) = dv/dt = 6t − 12 = 6(t − 2). Zero at t = 2: this is where the velocity reaches its minimum (most negative value) — the particle is momentarily changing from 'speeding up backward' to 'slowing down backward'.",
            "a(t) > 0 means velocity is increasing (acceleration pushes forward). a(t) < 0 means velocity is decreasing (deceleration or backward acceleration). The sign of a tells you whether v is getting larger or smaller.",
            "The zero of a(t) at t = 2 is an inflection point of the position curve x(t). This is the reading rule for f'': where f'' = 0 (and changes sign), f has an inflection point. In motion terms, t = 2 is where the 'direction of push' reverses.",
          ],
        },
        {
          expression: "v(t) = 0 \\Rightarrow t = 1, 3",
          annotation: "Particle momentarily stops at t=1 and t=3.",
          strategyTitle: "Locate where f'(x) = 0: velocity zero means the particle momentarily stops",
          checkpoint: "At t = 1 and t = 3, the velocity is zero. Does the particle actually reverse direction at both of these points?",
          hints: [
            "Setting v(t) = 3(t−1)(t−3) = 0 gives t = 1 and t = 3. At each zero, check whether v changes sign: at t = 1, v goes from positive (0 < t < 1) to negative (1 < t < 3) — the particle reverses. At t = 3, v goes from negative to positive — it reverses again.",
            "This is the first-derivative test applied to position: v changes sign at t = 1 (positive→negative) tells you x has a local maximum there. v changes sign at t = 3 (negative→positive) tells you x has a local minimum there. The particle turns around at each extremum of position.",
            "In optimization terms, t = 1 and t = 3 are critical points of x(t). Classifying them via first-derivative test (sign change in v) is exactly the same procedure used in Chapter 3 to find maxima and minima of any function.",
          ],
        },
        {
          expression: "a(t) = 0 \\Rightarrow t = 2",
          annotation:
            "Acceleration is zero at t=2 (inflection in position graph).",
          strategyTitle: "Locate where f''(x) = 0: acceleration zero marks an inflection in position",
          checkpoint: "At t = 2, a(t) = 0. Does the acceleration change sign there? What does this mean for the position curve's shape?",
          hints: [
            "a(t) = 6(t − 2) is negative for t < 2 and positive for t > 2 — the sign changes at t = 2. This confirms t = 2 is a genuine inflection point of x(t): the position curve transitions from concave down (∩) to concave up (∪).",
            "At t = 2, the velocity achieves its minimum value: v(2) = 3(4) − 12(2) + 9 = 12 − 24 + 9 = −3. This is the moment of maximum backward speed. The inflection in position corresponds to the extremum of velocity — exactly the reading rule: inflection in f ↔ extremum in f'.",
            "This relationship extends to all higher derivatives: inflection points of x correspond to extrema of v, and inflection points of v correspond to extrema of a. The entire derivative chain is linked through these correspondences, which is the deep structure behind reading derivatives from graphs.",
          ],
        },
        {
          expression:
            "0 < t < 1: v > 0, a < 0 \\Rightarrow \\text{moving forward, slowing down}",
          annotation: "First phase.",
          strategyTitle: "Combine f' and f'' signs: interpret motion phase from velocity and acceleration together",
          checkpoint: "On (0, 1): v > 0 means moving forward, a < 0 means velocity is decreasing. If you are moving forward but slowing, what happens to your speed?",
          hints: [
            "v > 0 (forward motion) and a < 0 (velocity decreasing) means the particle is moving forward but decelerating. Speed |v| is decreasing toward zero — the particle will stop at t = 1.",
            "This is the combination reading rule: the sign of f' tells you direction of motion; the sign of f'' tells you whether f' is growing or shrinking. Same sign: speeding up. Opposite signs: slowing down.",
            "In curve sketching, this phase corresponds to a region where f is increasing but concave down — the curve is rising but bending toward horizontal. Visually: a steep-then-flattening rise, ending at a peak.",
          ],
        },
        {
          expression:
            "1 < t < 2: v < 0, a < 0 \\Rightarrow \\text{moving backward, speeding up}",
          annotation: "Second phase.",
          strategyTitle: "Read motion phase: v and a both negative means speeding up in reverse",
          checkpoint: "On (1, 2): v < 0 and a < 0. The particle is moving backward AND acceleration pushes it further backward. What happens to speed?",
          hints: [
            "v < 0 (backward) and a < 0 (velocity getting more negative) means the particle is moving backward and accelerating in that direction — it is speeding up in reverse. Speed |v| is increasing.",
            "Same-sign rule: when v and a have the same sign, |v| increases (speeding up). Here both are negative, so the particle accelerates backward.",
            "In the position graph, this phase corresponds to a steep falling region that is concave down — the curve drops away and bends further downward, so the rate of fall is increasing.",
          ],
        },
        {
          expression:
            "2 < t < 3: v < 0, a > 0 \\Rightarrow \\text{moving backward, slowing down}",
          annotation: "Third phase.",
          strategyTitle: "Read motion phase: opposite signs of v and a means slowing down",
          checkpoint: "On (2, 3): v < 0 but a > 0. The particle still moves backward but acceleration now pushes forward. What happens to |v|?",
          hints: [
            "v < 0 (backward motion) and a > 0 (velocity increasing toward zero) means the particle is moving backward but decelerating — |v| is decreasing. The particle will stop at t = 3.",
            "Opposite-sign rule: when v and a have opposite signs, |v| decreases (slowing down). The forward push of a is fighting the backward motion of v.",
            "In the position graph, this phase is a falling curve that is concave up — the fall is slowing and the curve bends back upward, ending at the valley at t = 3.",
          ],
        },
        {
          expression:
            "t > 3: v > 0, a > 0 \\Rightarrow \\text{moving forward, speeding up}",
          annotation: "Fourth phase.",
          strategyTitle: "Read final motion phase: both v and a positive means forward acceleration",
          checkpoint: "For t > 3: v > 0 and a > 0. What can you say about both the direction and the trend of the particle's speed?",
          hints: [
            "v > 0 (forward) and a > 0 (velocity increasing) means the particle moves forward and speeds up. Both derivative levels confirm forward, accelerating motion.",
            "Same-sign rule again: v and a both positive means |v| is growing. After the valley at t = 3, the particle accelerates away in the positive direction without bound.",
            "Summarizing all four phases: the signs of v and a in each region are the complete reading of f' and f'' for this curve. This four-phase analysis is the prototype for full curve-sketching in Chapter 3: identify intervals, assign signs to f' and f'', and read off the shape and motion description for each interval.",
          ],
        },
      ],
      conclusion:
        "The particle moves forward, stops, reverses, stops again, then moves forward again. At t=2, the direction of acceleration flips—this marks maximum backward speed.",
    },

    {
      id: "ch2-read-ex4",
      title: "Second Derivative Test vs. First Derivative Test",
      problem:
        "For f(x) = x⁴, find critical points and classify them using both tests.",
      visualizationId: "FunctionPlotter",
      params: {
        fn: "x*x*x*x",
        xMin: -2,
        xMax: 2,
        label: "f(x) = x^4",
      },
      visualizations: [
        {
          id: "DerivativeBuilder",
          title: "Why f'(0)=0 but Test Can Be Inconclusive",
          caption:
            "Tracing slope near x=0 reinforces why first-derivative sign change is decisive here.",
        },
      ],
      interactive: true,
      steps: [
        { expression: "f'(x) = 4x^3", annotation: "First derivative." },
        { expression: "f''(x) = 12x^2", annotation: "Second derivative." },
        {
          expression: "f'(x) = 0 \\Rightarrow x = 0",
          annotation: "Only critical point at x = 0.",
        },
        {
          expression:
            "\\textbf{Second Derivative Test: } f''(0) = 0 \\Rightarrow \\text{inconclusive}",
          annotation:
            "f'' does not tell us whether x=0 is a max, min, or neither.",
        },
        {
          expression:
            "f'(x) < 0 \\text{ for } x < 0 \\quad f'(x) > 0 \\text{ for } x > 0",
          annotation:
            "First derivative test: f' changes from negative to positive.",
        },
        {
          expression:
            "\\textbf{Conclusion: } x = 0 \\text{ is a local minimum}",
          annotation: "First test succeeds where second test was inconclusive.",
        },
      ],
      conclusion:
        "When f''(c) = 0, the second test is inconclusive. Always have the first derivative test ready as backup.",
    },

    {
      id: "ch2-read-ex5",
      title: "Sketching f' from a Sketch of f",
      problem:
        "Given the shape of f (a smooth cubic starting low-left, rising to a peak, dipping to a valley, rising again to the right), sketch f'.",
      visualizationId: "FunctionPlotter",
      params: {
        fn: "x*x*x - 3*x",
        xMin: -3,
        xMax: 3,
        label: "Reference cubic for f and f'",
      },
      visualizations: [
        {
          id: "SketchDerivativeGame",
          title: "Do It Yourself: Sketch f′ for f(x) = x³ − 3x",
          mathBridge:
            "This is exactly the exercise described in the problem. The cubic $f(x) = x^3 - 3x$ has a peak at $x = -1$ and a valley at $x = 1$ (both orange marked). Your sketch should cross zero at both those x-values, be positive outside them, and be negative in between. After revealing, compare the exact parabola $f'(x) = 3x^2 - 3$ to your intuitive sketch.",
          caption:
            "Work through the steps in the example first, then use this game to verify your mental picture of what f′ should look like.",
        },
        {
          id: "DerivativeBuilder",
          title: "Tangent Slope Tracer (Continuous View)",
          caption:
            "This traces the slope continuously as you drag — complementing the game's discrete 7-point sketch.",
        },
      ],
      interactive: true,
      steps: [
        {
          expression:
            "\\text{Left section (f rising): } f'(x) > 0, \\text{ and slope increases} \\Rightarrow f'\\text{ rises}",
          annotation: "As f bends upward (concave up), f' increases.",
        },
        {
          expression:
            "\\text{Peak: } f'(x) = 0, \\text{ slope momentarily zero}",
          annotation: "f' crosses x-axis.",
        },
        {
          expression:
            "\\text{Middle section (f falling): } f'(x) < 0, \\text{ and slope magnitude increases then decreases}",
          annotation: "f' dips below x-axis.",
        },
        {
          expression:
            "\\text{Valley: } f'(x) = 0, \\text{ slope momentarily zero} \\Rightarrow f'\\text{ crosses back up}",
          annotation: "f' returns to x-axis.",
        },
        {
          expression:
            "\\text{Right section (f rising): } f'(x) > 0, \\text{ and slope increases}",
          annotation: "f' rises again as f steepens.",
        },
      ],
      conclusion:
        "f' traces a wave: positive, zero, negative, zero, positive. The shape mirrors the steepness of f at each point.",
    },

    {
      id: "ch2-read-ex6",
      title: "Mechanics Bridge: Vertical Projectile as Derivative Layers",
      problem:
        "A projectile is launched upward with height model h(t) = 20t - 4.9t^2 (meters). Read velocity and acceleration directly from derivatives, and interpret key events from the graph.",
      visualizationId: "PositionVelocityAcceleration",
      params: {
        label: "h(t) = 20t - 4.9t^2",
        tMax: 4.2,
        s: "20*t - 4.9*t*t",
        v: "20 - 9.8*t",
        a: "-9.8",
      },
      visualizations: [
        {
          id: "ProjectileMotion",
          title: "2D Trajectory View",
          caption:
            "This geometric path is the same mechanics: derivatives of height control vertical motion while horizontal motion stays constant.",
        },
      ],
      interactive: true,
      steps: [
        {
          expression: "h(t) = 20t - 4.9t^2",
          annotation:
            "Position (height) function under constant gravitational acceleration.",
        },
        {
          expression: "v(t) = h'(t) = 20 - 9.8t",
          annotation: "Velocity is the slope of the height graph.",
        },
        {
          expression: "a(t) = v'(t) = h''(t) = -9.8",
          annotation: "Acceleration is constant and negative (gravity).",
        },
        {
          expression:
            "v(t)=0 \\Rightarrow 20 - 9.8t = 0 \\Rightarrow t \\approx 2.04\\text{ s}",
          annotation:
            "Top of flight: tangent to h(t) is horizontal, so slope/velocity is zero.",
        },
        {
          expression:
            "h(2.04) \\approx 20(2.04)-4.9(2.04)^2 \\approx 20.41\\text{ m}",
          annotation:
            "Maximum height from evaluating position at the critical time.",
        },
        {
          expression:
            "h(t)=0 \\Rightarrow t(20-4.9t)=0 \\Rightarrow t=0 \\text{ or } t\\approx 4.08\\text{ s}",
          annotation:
            "Launch and landing times from the height graph intercepts.",
        },
      ],
      conclusion:
        "The same graph gives three mechanics layers: position h, velocity h', and acceleration h''. Calculus turns one curve into full motion interpretation.",
    },
  ],

  challenges: [
    {
      id: "ch2-read-ch1",
      difficulty: "medium",
      problem:
        "For f(x) = −x² + 4x − 3, compute f'(x) and f''(x), find all critical and inflection points, and sketch both f and f'.",
      hint: "This is a downward-opening parabola. Find its vertex (critical point), then note that f'' is constant (so no inflection points).",
      walkthrough: [
        {
          expression: "f'(x) = -2x + 4",
          annotation: "First derivative (linear).",
        },
        {
          expression: "f''(x) = -2",
          annotation: "Second derivative (constant, negative).",
        },
        {
          expression: "f'(x) = 0 \\Rightarrow x = 2",
          annotation: "Critical point.",
        },
        {
          expression:
            "f''(2) = -2 < 0 \\Rightarrow \\text{local maximum at } x = 2",
          annotation:
            "Second derivative is always negative: f is always concave down.",
        },
        {
          expression: "f(2) = −4 + 8 − 3 = 1",
          annotation: "Vertex at (2, 1).",
        },
      ],
      answer:
        "Critical point at x = 2 (local max). No inflection points. f is always concave down.",
    },

    {
      id: "ch2-read-ch2",
      difficulty: "hard",
      problem:
        'For f(x) = x⁴ − 2x², (a) find critical points and inflection points, (b) use the second derivative test to classify extrema, and (c) describe the "big picture" shape of f.',
      hint: "Factor to find critical points. f'' is a cubic, so it has at most three zeros. Check the sign of f'' to determine concavity.",
      walkthrough: [
        {
          expression: "f'(x) = 4x^3 - 4x = 4x(x^2 - 1) = 4x(x-1)(x+1)",
          annotation: "Critical points at x = −1, 0, 1.",
        },
        { expression: "f''(x) = 12x^2 - 4", annotation: "Second derivative." },
        {
          expression:
            "f''(x) = 0 \\Rightarrow x = \\pm \\sqrt{1/3} \\approx \\pm 0.577",
          annotation: "Two inflection points.",
        },
        {
          expression:
            "f''(−1) = 12 - 4 = 8 > 0 \\Rightarrow \\text{local min at } x = -1",
          annotation: "Second derivative test.",
        },
        {
          expression:
            "f''(0) = -4 < 0 \\Rightarrow \\text{local max at } x = 0",
          annotation: "Second derivative test.",
        },
        {
          expression:
            "f''(1) = 12 - 4 = 8 > 0 \\Rightarrow \\text{local min at } x = 1",
          annotation: "Second derivative test.",
        },
      ],
      answer:
        "Two local mins (x = ±1), one local max (x = 0). Two inflection points at x = ±√(1/3). W-shaped with bumps at x = ±1, dip at x = 0.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "rd-assess-1",
        type: "choice",
        text: "If f'(3)=0 and f''(3)>0, then f has a local ___ at x=3.",
        options: ["maximum", "minimum", "inflection point", "discontinuity"],
        answer: "minimum",
        hint: "f''(3)>0 means the curve is concave up (bowl-shaped) at x=3. A critical point at the bottom of a bowl is a local minimum.",
      },
      {
        id: "rd-assess-2",
        type: "choice",
        text: "A graph of f' shows f'(x)>0 for x<2, f'(2)=0, and f'(x)<0 for x>2. What does f have at x=2?",
        options: [
          "A local minimum",
          "An inflection point",
          "A local maximum",
          "A vertical tangent",
        ],
        answer: "A local maximum",
        hint: "f' going from positive to negative means f goes from increasing to decreasing — that is the signature of a local maximum.",
      },
      {
        id: "rd-assess-3",
        type: "choice",
        text: "On a graph of f', you see that f' has a local minimum at x=5. What does the graph of f have at x=5?",
        options: [
          "A local minimum",
          "A local maximum",
          "An inflection point",
          "A zero",
        ],
        answer: "An inflection point",
        hint: "Where f' has a local extremum, f'' changes sign (f'' goes from negative to positive at a minimum of f'). A sign change in f'' means f has an inflection point.",
      },
    ],
  },

  crossRefs: [
    {
      lessonSlug: "differentiation-rules",
      label: "Differentiation Rules",
      context: "To compute f' and f'', you use these rules.",
    },
    {
      lessonSlug: "curve-sketching",
      label: "Curve Sketching",
      context: "Synthesizes f, f', f'' into a complete sketch.",
    },
    {
      lessonSlug: "mean-value-theorem",
      label: "Mean Value Theorem",
      context: "Formalizes the connection between f' and the shape of f.",
    },
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "completed-example-2",
    "completed-example-4",
    "completed-example-6",
    "solved-challenge",
  ],

  quiz: [
    {
      id: 'reading-deriv-q1',
      type: 'choice',
      text: 'On the graph of $f$, where is $f\'(x) > 0$?',
      options: [
        'Where the graph is concave up',
        'Where the graph is increasing (rising from left to right)',
        'Where the graph is at a peak',
        'Where the graph is decreasing',
      ],
      answer: 'Where the graph is increasing (rising from left to right)',
      hints: ['$f\'(x)$ is the slope. Positive slope means the graph is rising.'],
      reviewSection: 'Intuition tab — sign of f\' and increasing/decreasing',
    },
    {
      id: 'reading-deriv-q2',
      type: 'choice',
      text: 'If $f\'(x) = 0$ at $x = c$ and $f\'$ changes from positive to negative there, what does the graph of $f$ have at $x = c$?',
      options: [
        'A local minimum',
        'An inflection point',
        'A local maximum',
        'A vertical asymptote',
      ],
      answer: 'A local maximum',
      hints: ['$f\'$ positive before $c$ means $f$ is rising; negative after $c$ means $f$ is falling. That is a peak.'],
      reviewSection: 'Math tab — first derivative test',
    },
    {
      id: 'reading-deriv-q3',
      type: 'choice',
      text: 'The graph of $f$ is concave up on an interval. What does this tell you about $f\'\'$ on that interval?',
      options: [
        "$f'' < 0$",
        "$f'' = 0$",
        "$f'' > 0$",
        "$f'$ is decreasing",
      ],
      answer: "$f'' > 0$",
      hints: ['Concave up means the slope $f\'$ is increasing. An increasing function has a positive derivative, so $f\'\' > 0$.'],
      reviewSection: 'Math tab — concavity and the second derivative',
    },
    {
      id: 'reading-deriv-q4',
      type: 'choice',
      text: 'The graph of $f\'$ crosses zero from negative to positive at $x = a$. What does $f$ have at $x = a$?',
      options: [
        'A local maximum',
        'A local minimum',
        'An inflection point',
        'A discontinuity',
      ],
      answer: 'A local minimum',
      hints: ['$f\'$ negative → $f$ decreasing; $f\'$ positive → $f$ increasing. Transition from falling to rising = valley.'],
      reviewSection: 'Math tab — reading f from f\' graph',
    },
    {
      id: 'reading-deriv-q5',
      type: 'choice',
      text: 'On a graph of $f\'$, where does $f$ have an inflection point?',
      options: [
        'Where $f\'$ has a local max or local min',
        'Where $f\'$ is positive',
        'Where $f\'$ crosses zero',
        'Where $f\'$ is at its steepest',
      ],
      answer: 'Where $f\'$ has a local max or local min',
      hints: ['An inflection point of $f$ is where $f\'\'=0$, i.e., where $f\'$ stops increasing and starts decreasing (or vice versa).'],
      reviewSection: 'Math tab — inflection points via f\' graph',
    },
    {
      id: 'reading-deriv-q6',
      type: 'choice',
      text: 'A particle\'s position graph $s(t)$ has a horizontal tangent at $t = 2$. What is the velocity at $t = 2$?',
      options: ['The maximum velocity', 'Zero', 'Negative', 'Undefined'],
      answer: 'Zero',
      hints: ['Velocity = $s\'(t)$. A horizontal tangent means slope = 0, so velocity = 0.'],
      reviewSection: 'Intuition tab — horizontal tangent means zero velocity',
    },
    {
      id: 'reading-deriv-q7',
      type: 'choice',
      text: 'A position graph $s(t)$ is concave down on an interval. What does this say about acceleration $a(t) = s\'\'(t)$?',
      options: [
        '$a(t) > 0$ (speeding up)',
        '$a(t) = 0$ (constant velocity)',
        '$a(t) < 0$ (decelerating in the positive direction)',
        'Acceleration cannot be determined from concavity',
      ],
      answer: '$a(t) < 0$ (decelerating in the positive direction)',
      hints: ['Concave down means $s\'\' < 0$, which is negative acceleration.'],
      reviewSection: 'Math tab — concavity and acceleration',
    },
    {
      id: 'reading-deriv-q8',
      type: 'choice',
      text: 'On a graph, $f\'(x) < 0$ and $f\'\'(x) < 0$. Which description best matches the behavior of $f$?',
      options: [
        'Decreasing and concave up',
        'Increasing and concave down',
        'Decreasing and concave down',
        'Increasing and concave up',
      ],
      answer: 'Decreasing and concave down',
      hints: ['$f\' < 0$ means decreasing; $f\'\' < 0$ means concave down (slope becoming more negative).'],
      reviewSection: 'Math tab — combining f\' and f\'\' signs',
    },
    {
      id: 'reading-deriv-q9',
      type: 'choice',
      text: 'Sketching $f\'$ from $f$: where $f$ has a local maximum, $f\'$ has:',
      options: [
        'A local maximum',
        'A zero (x-intercept)',
        'A vertical asymptote',
        'A local minimum',
      ],
      answer: 'A zero (x-intercept)',
      hints: ['At a local max of $f$, the tangent line is horizontal, so $f\'= 0$.'],
      reviewSection: 'Math tab — sketching f\' from f',
    },
    {
      id: 'reading-deriv-q10',
      type: 'choice',
      text: 'If $f\'\'(c) = 0$ and $f\'\'$ changes sign at $x = c$, what does $f$ have at $x = c$?',
      options: [
        'A local maximum',
        'A local minimum',
        'An inflection point',
        'A discontinuity',
      ],
      answer: 'An inflection point',
      hints: ['Inflection point = where concavity changes, i.e., $f\'\'$ changes sign.'],
      reviewSection: 'Math tab — inflection points defined',
    },
  ],
};
