export default {
  id: 'ch1-visual-epsilon-delta',
  slug: 'visual-epsilon-delta',
  chapter: 1,
  order: 4,
  title: 'Visualizing ε–δ: Reading from Graphs',
  subtitle: 'A systematic graphical method for finding δ given ε — geometry before algebra',
  tags: ['epsilon-delta', 'limits', 'graphical method', 'neighborhoods', 'strip method', 'visualization'],

  hook: {
    question: 'When a problem says "use the graph to find δ for the given ε," do you know the exact steps?',
    realWorldContext:
      'In engineering, you often have a graph of a physical system (temperature, pressure, speed) and need to find the input range (δ) that keeps the output within tolerance (ε). ' +
      'This lesson gives you the step-by-step graphical procedure that works every time—no algebra required at this stage, just geometric reasoning. ' +
      'This is how practitioners visualize and verify limits in real systems.',
    previewVisualizationId: 'EpsilonDelta',
  },

  intuition: {
    prose: [
      '**The Core Idea**  ' +
      'An ε–δ limit proof says: "For every y-tolerance (ε), there exists an x-tolerance (δ) such that if the input is within δ of point a, the output is guaranteed within ε of limit L."  ' +
      'Graphically, this translates to: draw a horizontal y-tolerance band, find where the curve exits it, and measure the x-distance back to point a.',

      '**The Five-Step Graphical Procedure**  ' +
      '1. Identify the limit point a, the limit value L, and the y-tolerance ε.' +
      '2. Draw horizontal lines at y = L + ε (upper bound) and y = L − ε (lower bound). This creates a horizontal band.' +
      '3. Find where the function graph intersects these lines. Solve algebraically if needed.' +
      '4. Measure the x-distance from a to each intersection point (left and right).' +
      '5. Take the smaller distance as δ. This ensures the tolerance works in both directions.',

      '**Why Take the Smaller Distance?**  ' +
      'The δ we choose must work in all directions from a: if we use too large a δ on one side, the other side might escape the ε-band. ' +
      'By taking the minimum of the left and right distances, we guarantee both sides stay trapped.',

      '**Visual Reasoning Over Algebra**  ' +
      'This method is pure geometry: draw boxes, find crossing points, measure distances. ' +
      'You can verify a limit without knowing the algebraic formula—just look at the graph. ' +
      'This is why graphical epsilon-delta is so useful for checking intuition and understanding what the definition actually says.',

      '**Behavior Near the Limit Point**  ' +
      'The procedure reveals a profound fact: close enough to a, the function stays within the band. ' +
      'The exact function form (linear, curved, wiggly) determines how close you need to be, but the method is universal.',
    ],
    callouts: [
      {
        type: 'vocabulary',
        title: 'The ε–δ Box',
        body: 'The rectangular region defined by a ± δ horizontally and L ± ε vertically. ' +
          'If a function\'s graph (except possibly at the single point a) lies inside this box, the limit definition is verified for those tolerances.',
      },
      {
        type: 'visual-rule',
        title: 'The Strip Method',
        body: 'Draw horizontal lines at L ± ε to create a y-tolerance "strip". Find where the function exits this strip. Those x-values determine δ.',
      },
      {
        type: 'technique',
        title: 'The Asymmetry Rule',
        body: 'If the distance to the left exit is 1.5 and to the right exit is 2.25, choose δ = min(1.5, 2.25) = 1.5. ' +
          'Always take the minimum so both sides satisfy the tolerance.',
      },
      {
        type: 'tip',
        title: 'For Piecewise Functions',
        body: 'If the function changes definition at a, graph each piece separately. The curve may approach the limit from different shapes on each side. ' +
          'The graphical method accounts for this automatically.',
      },
      {
        type: 'real-world',
        title: 'Quality Control Application',
        body: 'A manufacturing machine produces parts with a target dimension (L). Measurement error is ±ε (tolerance). ' +
          'The graphical method finds: what input variation (±δ) keeps the output within tolerance? Engineers use this every day.',
      },
    ],
    visualizations: [
      {
        id: 'EpsilonDelta',
        title: 'Interactive Epsilon-Delta Strip Finder',
        caption: 'Drag ε to adjust the tolerance band. Watch where the curve exits. The x-distances become δ candidates.',
      },
    ],
  },

  math: {
    prose: [
      '**Formal Setup**  ' +
      'Given: a smooth function f, a point a, a limit value L, and a y-tolerance ε > 0.  ' +
      'Find: the largest δ > 0 such that whenever 0 < |x − a| < δ, we have |f(x) − L| < ε.',

      '**The Two Boundary Equations**  ' +
      'The function graph crosses the upper tolerance line when f(x) = L + ε. Solve for x to get x = x₁.  ' +
      'The function graph crosses the lower tolerance line when f(x) = L − ε. Solve for x to get x = x₂.  ' +
      'Assuming x₂ < a < x₁, the distances are:  ' +
      'δ_left = a − x₂ and δ_right = x₁ − a.',

      '**The Minimum Selection Rule**  ' +
      'δ = min(δ_left, δ_right).  ' +
      'This ensures that for all x in the interval (a − δ, a + δ), the condition |f(x) − L| < ε holds (possibly except at x = a itself).',

      '**Comparison with Algebraic Method**  ' +
      'Graphical: Find where f(x) = L ± ε, measure distances, take the minimum.  ' +
      'Algebraic: Solve the inequality |f(x) − L| < ε backward to get |x − a| < δ.  ' +
      'Both give the same answer; graphical is more intuitive, algebraic is more general (works for functions without graphs).',

      '**Extension: When the Function Doesn\'t Have a Limit**  ' +
      'If the function oscillates or jumps near a, you cannot draw a tolerance band that traps it. ' +
      'The graphical method will show you immediately: the curve escapes every ε-band eventually. ' +
      'This is how you visually recognize non-existent limits.',
    ],
    callouts: [
      {
        type: 'key-theorem',
        title: 'Graphical Limit Verification',
        body: 'A function f has a limit L at a iff: for every ε > 0, ' +
          'there exists δ > 0 such that the graph lies (except possibly at x = a) inside the box [a − δ, a + δ] × [L − ε, L + ε]. ' +
          'The graphical method directly constructs this δ.',
      },
      {
        type: 'technique',
        title: 'Step-by-Step Summary for Any Function',
        body: '(1) Mark point a on the x-axis and value L on the y-axis. ' +
          '(2) Draw horizontal lines at y = L ± ε. ' +
          '(3) Find intersections: solve f(x) = L + ε and f(x) = L − ε. ' +
          '(4) Measure distances: |a − x_lower| and |a − x_upper|. ' +
          '(5) Set δ = min(distance left, distance right).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The graphical method assumes your graph is accurately drawn and clearly labeled. ' +
      'For textbook problems, the graph is given, so precision is built in. ' +
      'For real data, measurement error and grid resolution matter—you should get an approximate δ and validate it algebraically.',

      'The method is rigorous in the sense that finding δ from the graph correctly satisfies the ε–δ definition. ' +
      'However, the converse—proving algebraically that a specific δ works—still requires formal algebraic verification. ' +
      'The graphical method finds the δ; algebra confirms it.',

      'One subtlety: if the function is monotonic near a, the two boundary crossings are clear. ' +
      'If the function oscillates, you must find all crossings and take the minimum distance. ' +
      'Always be thorough in identifying all relevant intersection points.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch1-viz-ex1',
      title: 'Square Root Function: Graphical δ-Finding',
      problem: 'From the graph of f(x) = √(x+1), find δ such that |f(x) − 2| < 0.5 whenever |x − 3| < δ.',
      visualizationId: 'EpsilonDelta',
      params: {
        fn: 'Math.sqrt(x+1)',
        c: 3,
        L: 2,
        getDelta: 'Math.min(3 - (Math.pow(2-e, 2) - 1), (Math.pow(2+e, 2) - 1) - 3)'
      },
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Same Function, Full Curve View',
          caption: 'A global view of f(x)=sqrt(x+1) helps show why the left-side delta is tighter here.',
          props: {
            fn: 'Math.sqrt(x+1)',
            xMin: -1,
            xMax: 8,
            label: 'f(x) = sqrt(x+1)'
          }
        }
      ],
      interactive: true,
      steps: [
        { expression: 'a = 3, \\quad L = f(3) = \\sqrt{4} = 2, \\quad \\varepsilon = 0.5', annotation: 'Identify parameters.' },
        { expression: '\\text{Tolerance band: } y = 2 + 0.5 = 2.5 \\text{ and } y = 2 - 0.5 = 1.5', annotation: 'Draw horizontal lines.' },
        { expression: '\\sqrt{x+1} = 2.5 \\Rightarrow x+1 = 6.25 \\Rightarrow x = 5.25', annotation: 'Upper intersection.' },
        { expression: '\\sqrt{x+1} = 1.5 \\Rightarrow x+1 = 2.25 \\Rightarrow x = 1.25', annotation: 'Lower intersection.' },
        { expression: 'x = 1.25 < 3 < 5.25 \\text{ (good structure)}', annotation: 'Verify point a is between crossings.' },
        { expression: '\\delta_{\\text{left}} = 3 - 1.25 = 1.75', annotation: 'Distance to left boundary.' },
        { expression: '\\delta_{\\text{right}} = 5.25 - 3 = 2.25', annotation: 'Distance to right boundary.' },
        { expression: '\\delta = \\min(1.75, 2.25) = 1.75', annotation: 'Take the minimum.' },
      ],
      conclusion: 'δ = 1.75. For any x with |x − 3| < 1.75, we guarantee |f(x) − 2| < 0.5. The left side is more restrictive.',
    },

    {
      id: 'ch1-viz-ex2',
      title: 'Linear Function: Symmetric Tolerance',
      problem: 'From the graph of f(x) = 2x − 1, find δ such that |f(x) − 5| < 0.4 whenever |x − 3| < δ.',
      visualizationId: 'EpsilonDelta',
      params: {
        fn: '2*x - 1',
        c: 3,
        L: 5,
        getDelta: 'e / 2'
      },
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Linear Geometry View',
          caption: 'A straight-line graph makes the symmetric left/right delta distances visually obvious.',
          props: {
            fn: '2*x - 1',
            xMin: 0,
            xMax: 6,
            label: 'f(x) = 2x - 1'
          }
        }
      ],
      interactive: true,
      steps: [
        { expression: 'a = 3, \\quad L = 2(3) - 1 = 5, \\quad \\varepsilon = 0.4', annotation: 'Parameters.' },
        { expression: 'y = 5 \\pm 0.4 \\Rightarrow y = 5.4 \\text{ and } y = 4.6', annotation: 'Tolerance band.' },
        { expression: '2x - 1 = 5.4 \\Rightarrow x = 3.2', annotation: 'Upper boundary.' },
        { expression: '2x - 1 = 4.6 \\Rightarrow x = 2.8', annotation: 'Lower boundary.' },
        { expression: '\\delta_{\\text{left}} = 3 - 2.8 = 0.2', annotation: 'Distance to left.' },
        { expression: '\\delta_{\\text{right}} = 3.2 - 3 = 0.2', annotation: 'Distance to right.' },
        { expression: '\\delta = \\min(0.2, 0.2) = 0.2', annotation: 'Take the minimum (they\'re equal!).' },
      ],
      conclusion: 'δ = 0.2. For linear functions with nonzero slope m, δ = ε/|m|. Here δ = 0.4/2 = 0.2. The graph\'s slopes create symmetric tolerances.',
    },

    {
      id: 'ch1-viz-ex3',
      title: 'Parabola: Asymmetric Tolerance',
      problem: 'From the graph of f(x) = x², find δ such that |f(x) − 4| < 1 whenever |x − 2| < δ.',
      visualizationId: 'EpsilonDelta',
      params: {
        fn: 'x*x',
        c: 2,
        L: 4,
        getDelta: 'Math.min(2 - Math.sqrt(Math.max(0, 4 - e)), Math.sqrt(4 + e) - 2)'
      },
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Parabola Curvature View',
          caption: 'This view emphasizes curvature, which creates the left-right asymmetry in allowable delta.',
          props: {
            fn: 'x*x',
            xMin: -1,
            xMax: 4,
            label: 'f(x) = x^2'
          }
        }
      ],
      interactive: true,
      steps: [
        { expression: 'a = 2, \\quad L = 4, \\quad \\varepsilon = 1', annotation: 'Parameters.' },
        { expression: 'y = 3 \\text{ and } y = 5 \\text{ (tolerance band)}', annotation: 'Horizontal lines.' },
        { expression: 'x^2 = 5 \\Rightarrow x = \\pm\\sqrt{5} \\approx \\pm 2.236', annotation: 'Upper intersections.' },
        { expression: 'x^2 = 3 \\Rightarrow x = \\pm\\sqrt{3} \\approx \\pm 1.732', annotation: 'Lower intersections.' },
        { expression: '\\text{Relevant intersection near } a = 2: x = \\sqrt{5} \\approx 2.236 \\text{ (right) and } \\sqrt{3} \\approx 1.732 \\text{ (left)}', annotation: 'Choose crossings nearest to a.' },
        { expression: '\\delta_{\\text{left}} = 2 - 1.732 = 0.268', annotation: 'Distance to left.' },
        { expression: '\\delta_{\\text{right}} = 2.236 - 2 = 0.236', annotation: 'Distance to right.' },
        { expression: '\\delta = \\min(0.268, 0.236) \\approx 0.236', annotation: 'Take the minimum.' },
      ],
      conclusion: 'δ ≈ 0.236. The parabola\'s curvature makes the right side more restrictive. The tolerance band is asymmetric about the peak.',
    },

    {
      id: 'ch1-viz-ex4',
      title: 'Piecewise Function: Left vs. Right Behavior',
      problem: 'A piecewise function is f(x) = 2x + 1 for x < 2 and f(x) = x² − 1 for x ≥ 2. Find δ such that |f(x) − 3| < 0.5 at x = 2.',
      visualizationId: 'EpsilonDelta',
      params: {
        fn: '(x < 2 ? 2*x + 1 : x*x - 1)',
        c: 2,
        L: 3,
        getDelta: '0.12'
      },
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Piecewise Join View',
          caption: 'Graphing the joined rule makes the mismatch between left and right behavior at x=2 explicit.',
          props: {
            fn: '(x < 2 ? 2*x + 1 : x*x - 1)',
            xMin: 0,
            xMax: 4,
            label: 'f(x)=2x+1 (x<2), x^2-1 (x>=2)'
          }
        }
      ],
      interactive: true,
      steps: [
        { expression: 'a = 2, \\quad L = 3, \\quad \\varepsilon = 0.5', annotation: 'Parameters.' },
        { expression: '\\text{Check: } f(2^-) = 2(2) + 1 = 5, \\quad f(2^+) = 4 - 1 = 3', annotation: 'Left and right values.' },
        { expression: '\\text{Oops! } \\lim_{x \\to 2^-} f(x) = 5 \\neq 3 = \\lim_{x \\to 2^+} f(x)', annotation: 'Left and right limits differ; no two-sided limit exists.' },
        { expression: '\\text{But if we focus only on the right:} y = 3 \\pm 0.5', annotation: 'For the right piece (f(x) = x² − 1).' },
        { expression: 'x^2 - 1 = 3.5 \\Rightarrow x = \\sqrt{4.5} \\approx 2.121', annotation: 'Right boundary (parabola).' },
        { expression: 'x^2 - 1 = 2.5 \\Rightarrow x = \\sqrt{3.5} \\approx 1.871', annotation: 'Left boundary (parabola).' },
        { expression: '\\text{For the right side only: } \\delta_{\\text{right}} = 2.121 - 2 = 0.121', annotation: 'The two-sided limit fails, but right-sided limit exists.' },
      ],
      conclusion: 'The function has no two-sided limit at x = 2 (left ≠ right). The graphical method reveals the discontinuity: the left piece doesn\'t fit in the tolerance band.',
    },

    {
      id: 'ch1-viz-ex5',
      title: 'Oscillating Function: Why Limits Fail',
      problem: 'Consider f(x) = sin(1/x) for x ≠ 0. Can you find δ such that |f(x)| < 0.5 whenever |x − 0| < δ?',
      visualizationId: 'EpsilonDelta',
      params: {
        fn: 'Math.sin(1/x)',
        c: 0,
        L: 0,
        getDelta: '0.5'
      },
      visualizations: [
        {
          id: 'OscillationViz',
          title: 'Zoomed Oscillation Around x=0',
          caption: 'Zooming toward x=0 shows oscillation never settles, so no single delta can trap values in a narrow epsilon band.'
        }
      ],
      interactive: true,
      steps: [
        { expression: '\\lim_{x \\to 0} \\sin(1/x) \\text{ is the question.}', annotation: 'The limit at a = 0.' },
        { expression: 'f(x) = \\sin(1/x) \\text{ oscillates wildly as } x \\to 0.', annotation: 'Near x = 0, the function samples all values in [−1, 1].' },
        { expression: '\\text{Choose } \\varepsilon = 0.5.', annotation: 'y-tolerance band: [−0.5, 0.5].' },
        { expression: '\\text{For any } \\delta > 0, \\text{ there exists } x \\text{ with } |x| < \\delta \\text{ but } |\\sin(1/x)| > 0.5.', annotation: 'The oscillation never stops; it gets worse as x → 0.' },
        { expression: '\\text{Take } x_n = \\frac{1}{\\frac{\\pi}{2}+2\\pi n} \\Rightarrow \\sin(1/x_n)=1,\\ x_n \\to 0.', annotation: 'A sequence arbitrarily close to 0 stays at the top of the oscillation.' },
        { expression: '\\text{Take } y_n = \\frac{1}{\\frac{3\\pi}{2}+2\\pi n} \\Rightarrow \\sin(1/y_n)=-1,\\ y_n \\to 0.', annotation: 'Another sequence arbitrarily close to 0 stays at the bottom.' },
        { expression: '\\text{Graphically: the curve never stays inside the [−0.5, 0.5] band, no matter how small } \\delta.', annotation: 'No limit exists.' },
      ],
      conclusion: 'The graphical method reveals non-existence: for ε = 0.5, no δ works because the function oscillates across the entire band. No δ works for this function.',
    },
  ],

  challenges: [
    {
      id: 'ch1-viz-ch1',
      difficulty: 'medium',
      problem: 'For f(x) = √x, use the graph to find δ such that |f(x) − 2| < 0.3 whenever |x − 4| < δ.',
      hint: 'f(4) = 2. Draw the horizontal lines y = 1.7 and y = 2.3. Find where the square root curve intersects them.',
      walkthrough: [
        { expression: 'a = 4, \\quad L = 2, \\quad \\varepsilon = 0.3', annotation: 'Givens.' },
        { expression: '\\sqrt{x} = 2.3 \\Rightarrow x = 5.29', annotation: 'Upper boundary.' },
        { expression: '\\sqrt{x} = 1.7 \\Rightarrow x = 2.89', annotation: 'Lower boundary.' },
        { expression: '\\delta_{\\text{left}} = 4 - 2.89 = 1.11, \\quad \\delta_{\\text{right}} = 5.29 - 4 = 1.29', annotation: 'Distances.' },
        { expression: '\\delta = \\min(1.11, 1.29) = 1.11', annotation: 'Take minimum.' },
      ],
      answer: 'δ ≈ 1.11. The function\'s decreasing rate of change (as x increases, the slope √x\'s slope = 1/(2√x) decreases) makes the left side more restrictive.',
    },

    {
      id: 'ch1-viz-ch2',
      difficulty: 'hard',
      problem: 'For the cubic f(x) = x³ − 2x, find δ such that |f(x) − 5| < 0.8 whenever |x − 2| < δ. Why might the two-sided delta be small?',
      hint: 'f(2) = 8 − 4 = 4. Hmm, that\'s not 5. Try x = 2.something. Actually, solve x³ − 2x = 5 to find where the curve reaches y = 5. The curve is likely steep.',
      walkthrough: [
        { expression: '\\text{First: find where } f(x) = 5. \\quad x^3 - 2x = 5', annotation: 'Where does the curve reach y = 5?' },
        { expression: 'x^3 - 2x - 5 = 0. \\quad \\text{Testing: } x = 2 \\Rightarrow 8 - 4 - 5 = -1, \\quad x = 2.2 \\Rightarrow 10.648 - 4.4 - 5 = 1.248', annotation: 'Bisect to find root ≈ x ≈ 2.09.' },
        { expression: '\\varepsilon = 0.8 \\Rightarrow \\text{ band } [4.2, 5.8]', annotation: 'Tolerance band.' },
        { expression: 'x^3 - 2x = 5.8: \\text{ solve for } x_{upper} \\approx 2.15', annotation: 'Upper intersection.' },
        { expression: 'x^3 - 2x = 4.2: \\text{ solve for } x_{lower} \\approx 1.93', annotation: 'Lower intersection.' },
        { expression: '\\text{If we measure from } a = 2: \\delta_{left} = 2 - 1.93 = 0.07, \\quad \\delta_{right} = 2.15 - 2 = 0.15', annotation: 'Distances.' },
        { expression: '\\delta = \\min(0.07, 0.15) = 0.07', annotation: 'Left is more restrictive; cubic\'s steepness dominates.' },
      ],
      answer: 'δ ≈ 0.07 (small). The cubic function is steeper on the left side of x = 2 than the right. The tolerance band geometry reveals this asymmetry.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'epsilon-delta', label: 'ε–δ Formal Definition', context: 'After this graphical intuition, read the formal algebraic definition and proofs.' },
    { lessonSlug: 'limit-laws', label: 'Limit Laws', context: 'Once you understand what limits mean graphically, use limit laws to compute them algebraically.' },
    { lessonSlug: 'continuity', label: 'Continuity', context: 'Continuous functions satisfy the ε–δ condition at every point in their domain.' },
    { lessonSlug: 'curve-sketching', label: 'Curve Sketching', context: 'Understanding how function graphs behave near critical points draws on this visual epsilon-delta reasoning.' },
  ],

  checkpoints: ['intuition', 'graph-method', 'example-2', 'example-4', 'challenge-1'],
}
