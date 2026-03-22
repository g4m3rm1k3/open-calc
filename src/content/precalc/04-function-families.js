export default {
  id: 'ch1-graphs-004',
  slug: 'function-families',
  chapter: 'precalc-1',
  order: 4,
  title: 'Function Families: Polynomials, Rationals, and Exponentials',
  subtitle: 'Root multiplicity, full rational graph sketching, and how log/exp transformations shift and stretch',
  tags: ['polynomials', 'root multiplicity', 'rational functions', 'exponential', 'logarithm', 'graph sketching', 'touch vs cross'],
  aliases: 'polynomial root multiplicity bounce cross touch rational function sketch exponential log transformation a^x e^x ln',

  hook: {
    question: 'Why does a polynomial sometimes bounce off the $x$-axis instead of crossing through it — and how can you tell which will happen just from the equation?',
    realWorldContext: 'Root multiplicity tells you how a curve meets the $x$-axis — a fact that directly determines whether a product changes sign there. In signal processing, this controls whether a filter gain crosses zero or merely touches it. In structural analysis, double roots in a characteristic equation indicate critically damped behaviour. In calculus, multiplicity determines whether the function changes sign at a zero (odd multiplicity) or not (even multiplicity), which is essential for integration over signed areas.',
  },

  intuition: {
    prose: [
      'A polynomial root has a **multiplicity** — how many times that factor appears. A simple root (multiplicity 1) is where the graph crosses straight through the $x$-axis. A double root (multiplicity 2) is where the graph touches the axis and bounces back — because the factor squared is always $\\geq 0$ nearby. A triple root crosses, but with a flattened S-shape — the graph lingers near the axis before moving on.',
      'The rule is clean: **odd multiplicity → crosses** (graph changes sign). **Even multiplicity → touches and bounces** (graph keeps same sign). This is because near a root $c$ of multiplicity $m$, the function behaves like $(x-c)^m$, and sign of $(x-c)^m$ depends on whether $m$ is odd or even.',
      'Sketching a rational function is a step-by-step procedure, not guesswork. Find zeros, asymptotes, and a few test points — the graph assembles itself between those constraints. The key insight is that a rational function can only change sign at its zeros and its vertical asymptotes. Everywhere else, the sign is constant within each interval.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Root multiplicity and crossing behaviour',
        body: '\\text{Root } c \\text{ of multiplicity } m: \\\\ m \\text{ odd} \\Rightarrow \\text{graph CROSSES the } x\\text{-axis at } c \\\\ m \\text{ even} \\Rightarrow \\text{graph TOUCHES (bounces off) the } x\\text{-axis at } c',
      },
      {
        type: 'insight',
        title: 'Why even multiplicity bounces',
        body: '(x-c)^2 \\geq 0 \\text{ for all } x. \\text{ So } f(x) = (x-c)^2 g(x) \\text{ has the same sign as } g(x) \\text{ on both sides of } c.',
      },
    ],
    visualizations: [
      {
        id: 'RootMultiplicityViz',
        title: 'Root Multiplicity — Cross, Touch, or Flatten',
        mathBridge: 'See multiplicity 1, 2, and 3 roots side by side. Change the multiplicity and watch the crossing behaviour change.',
        caption: 'Odd multiplicity: sign change (crossing). Even multiplicity: no sign change (bounce).',
      },
    ],
  },

  math: {
    prose: [
      'The **full rational function sketching procedure** is a checklist. Follow it in order and the graph emerges from the constraints: (1) factor completely, (2) find and classify zeros, (3) find VAs and holes, (4) determine HA or oblique asymptote, (5) find the $y$-intercept, (6) sign analysis between key points, (7) check behaviour near VAs (does it go to $+\\infty$ or $-\\infty$ on each side?)',
      '**Exponential functions** $f(x) = a^x$ always have the same shape: always positive, always passing through $(0,1)$, with horizontal asymptote $y=0$ as $x \\to -\\infty$ (for $a>1$). Transformations shift and stretch this base shape predictably. $f(x) = 2^{x-3}$ is a right shift of 3; the horizontal asymptote stays at $y=0$. $f(x) = 2^x + 5$ shifts the asymptote up to $y=5$.',
      '**Logarithmic functions** $f(x) = \\log_b x$ are inverses of exponentials — their graph is the reflection of $y = b^x$ over $y=x$. They have a vertical asymptote at $x=0$, pass through $(1,0)$, and are defined only for $x>0$. Transformations: $\\log(x-h)$ shifts right by $h$ and moves the VA to $x=h$. $a\\log(x)$ stretches vertically. $\\log(-x)$ reflects over the $y$-axis.',
    ],
    callouts: [
      {
        type: 'proof-map',
        title: 'Rational function sketching checklist',
        body: '1.\\ \\text{Factor} \\to 2.\\ \\text{Zeros \\& mult.} \\to 3.\\ \\text{VAs \\& holes} \\to 4.\\ \\text{HA/oblique} \\to 5.\\ y\\text{-intercept} \\to 6.\\ \\text{Sign chart} \\to 7.\\ \\text{VA behaviour} \\to 8.\\ \\text{Sketch}',
      },
      {
        type: 'theorem',
        title: 'Sign near a vertical asymptote',
        body: '\\text{Evaluate the sign of the numerator and denominator separately as } x \\to c^+ \\text{ and } x \\to c^-. \\\\ \\frac{+}{+} \\to +\\infty \\quad \\frac{+}{-} \\to -\\infty \\quad \\frac{-}{+} \\to -\\infty \\quad \\frac{-}{-} \\to +\\infty',
      },
      {
        type: 'theorem',
        title: 'Exponential transformation effects on the asymptote',
        body: 'y = a \\cdot b^{x-h} + k: \\text{ HA shifts to } y = k. \\\\ y = a \\cdot b^{x-h}: \\text{ HA stays at } y = 0. \\\\ \\text{The vertical shift } k \\text{ is the ONLY thing that moves the horizontal asymptote.}',
      },
      {
        type: 'theorem',
        title: 'Logarithm transformation effects on the asymptote',
        body: 'y = a\\log_b(x - h) + k: \\text{ VA shifts to } x = h. \\\\ \\text{Domain: } x > h. \\quad y\\text{-intercept: set } x=0 \\text{ (only if } 0 > h\\text{)}. \\\\ \\text{The horizontal shift } h \\text{ is the ONLY thing that moves the vertical asymptote.}',
      },
    ],
    visualizations: [
      {
        id: 'RationalSketchViz',
        title: 'Full Rational Sketch — Step by Step',
        mathBridge: 'Step through the sketching checklist for a rational function. Each step adds one layer of information to the graph.',
        caption: 'Rational function graphs are completely determined by zeros, asymptotes, and sign analysis.',
      },
    ],
  },

  rigor: {
    title: 'Complete sketch of $f(x) = \\dfrac{x(x-2)^2}{(x+1)(x-3)}$',

    proofSteps: [
      {
        expression: '\\text{Already factored. Zeros: } x=0 \\text{ (mult. 1, crosses)}, x=2 \\text{ (mult. 2, bounces)}',
        annotation: 'Identify zeros and multiplicities from the factored numerator.',
      },
      {
        expression: '\\text{VAs: } x=-1 \\text{ and } x=3. \\text{ No holes (no common factors).}',
        annotation: 'Denominator zeros where numerator is nonzero.',
      },
      {
        expression: '\\deg(\\text{num})=3,\\ \\deg(\\text{denom})=2 \\Rightarrow \\text{oblique asymptote}',
        annotation: 'Numerator degree exceeds denominator by 1 — long division gives the slant asymptote.',
      },
      {
        expression: 'y\\text{-intercept: } f(0) = \\frac{0 \\cdot 4}{1 \\cdot (-3)} = 0 \\quad (\\text{same as zero at }x=0)',
        annotation: '$f(0)=0$ because $x=0$ is a zero of $f$.',
      },
      {
        expression: '\\text{Sign chart: intervals } (-\\infty,-1),(-1,0),(0,2),(2,3),(3,\\infty)',
        annotation: 'Key values split the number line into 5 intervals. Test each: e.g., $x=-2$: $\\frac{-(-4)^2}{(-1)(-5)}<0$.',
      },
      {
        expression: '\\text{Near VA } x=-1^+: \\frac{(+)(-)^2}{(+)(-)} = \\frac{(+)}{(-)} \\to -\\infty \\quad x=-1^-: \\to +\\infty',
        annotation: 'Evaluate sign of numerator and denominator separately on each side of VA.',
      },
      {
        expression: '\\text{Graph: crosses at 0, bounces at 2, VAs at -1 and 3, rises to oblique asymptote}',
        annotation: 'Assemble all constraints. The graph is now fully determined without plotting hundreds of points.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-004-ex1',
      title: 'Reading a polynomial graph from its factored form',
      problem: '\\text{Sketch the key features of } f(x) = -2(x+3)(x-1)^2(x-4).',
      steps: [
        {
          expression: '\\text{Leading term: } -2x^4 \\Rightarrow n \\text{ even}, a_n<0 \\Rightarrow \\text{both ends } \\to -\\infty',
          annotation: 'End behaviour from leading term: degree 4, negative coefficient → both ends down.',
        },
        {
          expression: 'x=-3 \\text{ (mult. 1, crosses)},\\ x=1 \\text{ (mult. 2, bounces)},\\ x=4 \\text{ (mult. 1, crosses)}',
          annotation: 'Three distinct zeros with multiplicities. The multiplicity tells the crossing behaviour.',
        },
        {
          expression: 'y\\text{-intercept: } f(0) = -2(3)(-1)^2(-4) = -2(3)(1)(-4) = 24',
          annotation: 'Substitute $x=0$.',
        },
      ],
      conclusion: 'With end behaviour, zeros (including multiplicities), and the $y$-intercept, you can sketch the qualitative shape of any polynomial without a calculator.',
    },
    {
      id: 'ch1-004-ex2',
      title: 'Graphing a transformed exponential — and finding the new asymptote',
      problem: '\\text{Graph } f(x) = 3 \\cdot 2^{x+1} - 4. \\text{ State the asymptote and key points.}',
      steps: [
        {
          expression: '\\text{Base graph: } y = 2^x. \\text{ Shift LEFT 1, vertical stretch by 3, shift DOWN 4.}',
          annotation: 'Read the transformations: $h=-1$ (left 1), $a=3$ (stretch), $k=-4$ (down 4).',
        },
        {
          expression: '\\text{Horizontal asymptote: } y = -4 \\quad (\\text{the } k \\text{ value}).',
          annotation: 'The vertical shift moves the HA from $y=0$ to $y=-4$. The base asymptote moves with $k$.',
        },
        {
          expression: 'f(0) = 3 \\cdot 2^1 - 4 = 6 - 4 = 2 \\quad f(-1) = 3 \\cdot 2^0 - 4 = -1',
          annotation: 'Key points: $y$-intercept $(0,2)$ and the inflection reference point $(-1,-1)$.',
        },
      ],
      conclusion: 'The horizontal asymptote of a transformed exponential is always the vertical shift $k$. It\'s the one parameter that "relocates" where the function flattens out.',
    },
  ],

  challenges: [
    {
      id: 'ch1-004-ch1',
      difficulty: 'hard',
      problem: '\\text{Find the domain of } f(x) = \\ln(x^2 - 5x + 6) \\text{ and identify the VAs of the graph.}',
      hint: 'Logarithm requires a positive argument. Factor $x^2 - 5x + 6$ to find where the argument is positive.',
      walkthrough: [
        {
          expression: 'x^2-5x+6 = (x-2)(x-3) > 0',
          annotation: 'Domain requires the argument $> 0$.',
        },
        {
          expression: '(x-2)(x-3)>0 \\Rightarrow x<2 \\text{ or } x>3',
          annotation: 'Sign analysis: product of two factors is positive when both positive or both negative.',
        },
        {
          expression: '\\text{VAs at } x=2 \\text{ and } x=3 \\text{ (where argument} \\to 0^+\\text{, so } \\ln\\to-\\infty\\text{)}',
          annotation: 'At the boundary of the domain, $\\ln \\to -\\infty$. These are vertical asymptotes going downward.',
        },
      ],
      answer: '\\text{Domain: } (-\\infty, 2) \\cup (3, \\infty). \\text{ VAs at } x=2 \\text{ and } x=3.',
    },
  ],
}
