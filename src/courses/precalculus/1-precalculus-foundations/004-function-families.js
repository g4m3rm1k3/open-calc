export default {
  id: 'ch1-graphs-004',
  slug: 'function-families',
  chapter: 'precalc-1',
  order: 4,
  title: 'Function Families: The DNA of Every Mathematical Model',
  subtitle: 'Algebraic structure and behavior of polynomials, exponentials, and logarithms',
  tags: ['polynomials', 'exponentials', 'logarithms', 'laws of logs', 'laws of exponents', 'root multiplicity'],
  aliases: 'polynomial root multiplicity bounce cross touch rational function sketch exponential log laws expansion contraction',

  hook: {
    question: 'Why does gravity follow an $x^2$ rule, while a bank account follows an $e^x$ rule? And why do your ears hear sound on a logarithmic scale?',
    realWorldContext: 'In **Physics**, the "Inverse Square Law" ($1/x^2$) governs both light and gravity. In **Biology**, populations grow exponentially. In **Human Sensation**, we perceive sound and light logarithmically — our brains compress huge ranges of energy into a manageable scale. Every function family is a different template for how the universe actually behaves. Identifying the family tells you the system\'s destiny before you write a single equation.',
    previewVisualizationId: 'RootMultiplicityViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** The previous lesson gave you the tools to read a function\'s behaviour — asymptotes, extrema, concavity. Now you meet the specific families that generate those behaviours. Each family has its own DNA: its own signature shape, growth rate, and algebraic laws.',
      '**Polynomials — the power of roots**: These are smooth, predictable curves built from powers of $x$. Their local behavior is dictated by their roots. A root with an even multiplicity causes a "bounce" (the curve touches the $x$-axis but does not cross it), while a root with an odd multiplicity causes a "cross" (the curve slices through). This single rule determines the entire qualitative shape of a polynomial from its factored form.',
      '**Exponentials — the law of proportional growth**: Unlike polynomials where $x$ is the base, in $b^x$ the variable $x$ is the exponent. This means every unit of increase in $x$ multiplies the output by $b$. This is the mathematical signature of systems where "the more you have, the faster you grow" — compound interest, viral spread, radioactive decay all follow this pattern.',
      '**Logarithms — the data compressors**: Logs are the inverse of exponential growth. They turn exponential gaps into manageable linear distances, which is exactly why our ears and eyes are logarithmic — our brains compress the enormous range of sound intensities (from a whisper to a jet engine) so we can process them.',
      '**Where this is heading:** The final precalc lesson introduces coordinate systems beyond the Cartesian plane — polar, parametric, and vectors. Those tools represent the same mathematical objects in different languages, just as exponentials and logs represent the same relationship from opposite directions.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc arc — Lesson 4 of 5',
        body: '← Function Behaviour | **Function Families** | Beyond Cartesian →',
      },
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
      {
        type: 'theorem',
        title: 'The laws of exponents',
        body: 'b^x \\cdot b^y = b^{x+y} \\qquad (b^x)^y = b^{xy} \\qquad b^{-x} = 1/b^x',
      },
      {
        type: 'theorem',
        title: 'The laws of logarithms',
        body: '\\log_b(xy) = \\log_b x + \\log_b y \\\\ \\log_b(x/y) = \\log_b x - \\log_b y \\\\ \\log_b(x^n) = n \\log_b x',
      },
    ],
    visualizations: [
      {
        id: 'RootMultiplicityViz',
        title: 'The Geometry of Roots',
        mathBridge: 'Step 1: Set a root with multiplicity 1. Watch the curve cross straight through the $x$-axis — it behaves locally like a line. Step 2: Increase to multiplicity 2. The curve touches the axis and bounces back — it behaves locally like a parabola. Step 3: Try multiplicity 3. The curve crosses but with a flat "S"-shape — locally cubic. The key lesson: each factor $(x-c)^m$ in the formula produces a predictable local shape. The degree of the factor determines whether the graph crosses, bounces, or flexes at that root.',
        caption: 'The power of a factor determines the local topography of the graph.',
      },
    ],
  },

  math: {
    prose: [
      'Every function family is governed by definitive laws that allow complex models to be manipulated into solvable forms.',
      '**Polynomial structure**: $P(x) = a_n x^n + \\dots + a_0$. The Fundamental Theorem of Algebra guarantees exactly $n$ complex roots (counting multiplicity). The Rational Root Theorem identifies potential integer zeros as ratios of factors of $a_0$ to $a_n$. The Factor/Remainder Theorem links factors to zeros: $(x-c)$ divides $P(x)$ iff $P(c) = 0$.',
      '**Rational function sketching**: Factor completely → identify zeros (numerator) and VAs (denominator, after cancellation) → determine HA or oblique asymptote → find $y$-intercept → build sign chart → sketch VA behaviour → assemble. Eight steps, zero guessing.',
      '**Exponential transformations**: $y = a \\cdot b^{x-h} + k$ has HA at $y = k$ (not $y = 0$). The vertical shift $k$ is the only parameter that moves the horizontal asymptote. The growth/decay rate is unchanged by $h$.',
      '**Logarithmic structure**: $y = a\\log_b(x - h) + k$ has VA at $x = h$ and domain $x > h$. Log laws turn multiplication into addition, division into subtraction, and powers into multiplication — essential for solving exponential equations.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Factor/Remainder bridge',
        body: 'f(c) = 0 \\iff (x-c) \\text{ is a factor} \\\\ \\text{Remainder of } f(x) \\div (x-c) = f(c)',
      },
      {
        type: 'proof-map',
        title: 'Rational function sketching checklist',
        body: '1.\\ \\text{Factor} \\to 2.\\ \\text{Zeros \\& mult.} \\to 3.\\ \\text{VAs \\& holes} \\to 4.\\ \\text{HA/oblique} \\to 5.\\ y\\text{-intercept} \\to 6.\\ \\text{Sign chart} \\to 7.\\ \\text{VA behaviour} \\to 8.\\ \\text{Sketch}',
      },
      {
        type: 'theorem',
        title: 'Sign near a vertical asymptote',
        body: '\\text{Evaluate sign of numerator and denominator separately as } x \\to c^+ \\text{ and } x \\to c^-. \\\\ \\frac{+}{+} \\to +\\infty \\quad \\frac{+}{-} \\to -\\infty \\quad \\frac{-}{+} \\to -\\infty \\quad \\frac{-}{-} \\to +\\infty',
      },
      {
        type: 'theorem',
        title: 'Exponential transformation: asymptote rule',
        body: 'y = a \\cdot b^{x-h} + k: \\text{ HA shifts to } y = k. \\\\ \\text{The vertical shift } k \\text{ is the ONLY thing that moves the HA.}',
      },
      {
        type: 'theorem',
        title: 'Logarithm transformation: asymptote rule',
        body: 'y = a\\log_b(x - h) + k: \\text{ VA shifts to } x = h. \\quad \\text{Domain: } x > h. \\\\ \\text{The horizontal shift } h \\text{ is the ONLY thing that moves the VA.}',
      },
    ],
    visualizations: [
      {
        id: 'RationalSketchViz',
        title: 'Prototyping a Rational Function',
        mathBridge: 'Step 1: Read the zeros (where the numerator is 0) and VAs (where the denominator is 0). These are the key landmarks. Step 2: Determine the HA or oblique asymptote using the degree rule. Step 3: Build the sign chart: pick one test value per interval and determine the sign of $f$. Step 4: Near each VA, check whether the function goes to $+\\infty$ or $-\\infty$ on each side. Step 5: Connect the constraints with a smooth curve. The key lesson: sketching a rational function is assembling constraints, not guessing a shape.',
        caption: 'Sketching is the process of eliminating impossible geometric states.',
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
        expression: '\\deg(\\text{num})=3,\\ \\deg(\\text{denom})=2 \\Rightarrow \\text{oblique asymptote (long division gives } y = x - 2 + \\cdots\\text{)}',
        annotation: 'Numerator degree exceeds denominator by 1 — long division gives the slant asymptote.',
      },
      {
        expression: 'y\\text{-intercept: } f(0) = \\frac{0 \\cdot 4}{1 \\cdot (-3)} = 0 \\quad (\\text{same as zero at }x=0)',
        annotation: '$f(0) = 0$ because $x = 0$ is a zero of $f$.',
      },
      {
        expression: '\\text{Sign chart: intervals } (-\\infty,-1),(-1,0),(0,2),(2,3),(3,\\infty)',
        annotation: 'Key values split the number line into 5 intervals. Test each: e.g., $x = -2$: sign is negative.',
      },
      {
        expression: '\\text{Near VA } x=-1^+: \\frac{(+)(-)^2}{(+)(-)} \\to -\\infty \\quad x=-1^-: \\to +\\infty',
        annotation: 'Evaluate sign of numerator and denominator separately on each side of VA.',
      },
      {
        expression: '\\text{Graph: crosses at 0, bounces at 2, VAs at -1 and 3, rises to oblique asymptote}',
        annotation: 'Assemble all constraints. The graph is fully determined without plotting hundreds of points.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-004-ex1',
      title: 'Reading a polynomial graph from its factored form',
      problem: 'Sketch the key features of $f(x) = -2(x+3)(x-1)^2(x-4)$.',
      steps: [
        {
          expression: '\\text{Leading term: } -2x^4 \\Rightarrow n \\text{ even}, a_n<0 \\Rightarrow \\text{both ends } \\to -\\infty',
          annotation: 'End behaviour from leading term: degree 4, negative coefficient → both ends down.',
          hint: 'Multiply the highest-degree terms: $(-2)(x)(x^2)(x) = -2x^4$. Even degree and negative → ∩-shape.',
        },
        {
          expression: 'x=-3 \\text{ (mult. 1, crosses)},\\ x=1 \\text{ (mult. 2, bounces)},\\ x=4 \\text{ (mult. 1, crosses)}',
          annotation: 'Three distinct zeros with multiplicities. Multiplicity tells the crossing behaviour.',
          hint: 'Read multiplicities from the exponents of each factor. $(x-1)^2$ has multiplicity 2 → bounce.',
        },
        {
          expression: 'y\\text{-intercept: } f(0) = -2(3)(-1)^2(-4) = -2(3)(1)(-4) = 24',
          annotation: 'Substitute $x = 0$.',
          hint: 'Plug $x=0$ into every factor: $-2(0+3)(0-1)^2(0-4) = -2(3)(1)(-4) = 24$.',
        },
      ],
      conclusion: 'With end behaviour, zeros (with multiplicities), and the $y$-intercept, you can sketch any polynomial\'s qualitative shape without a calculator.',
    },
    {
      id: 'ch1-004-ex2',
      title: 'Graphing a transformed exponential — and finding the new asymptote',
      problem: 'Graph $f(x) = 3 \\cdot 2^{x+1} - 4$. State the asymptote and key points.',
      steps: [
        {
          expression: '\\text{Base graph: } y = 2^x. \\text{ Shift LEFT 1, vertical stretch by 3, shift DOWN 4.}',
          annotation: 'Read transformations: $h = -1$ (left 1), $a = 3$ (stretch), $k = -4$ (down 4).',
          hint: 'Write in master form: $3 \\cdot 2^{x - (-1)} + (-4)$. So $h = -1$, $a = 3$, $k = -4$.',
        },
        {
          expression: '\\text{Horizontal asymptote: } y = -4 \\quad (\\text{the } k \\text{ value}).',
          annotation: 'The vertical shift moves the HA from $y = 0$ to $y = -4$.',
          hint: 'The base exponential $2^x$ has HA at $y=0$. Adding $k = -4$ shifts the HA to $y = -4$.',
        },
        {
          expression: 'f(0) = 3 \\cdot 2^1 - 4 = 6 - 4 = 2 \\quad f(-1) = 3 \\cdot 2^0 - 4 = -1',
          annotation: '$y$-intercept $(0, 2)$ and the anchor point $(-1, -1)$ (where $x+1 = 0$, so base $= 1$).',
          hint: 'Key points: plug in $x = 0$ (gives $y$-intercept) and $x = -1$ (the "reference" point where the exponent is 0).',
        },
      ],
      conclusion: 'The horizontal asymptote of a transformed exponential is always $y = k$. It is the one parameter that "relocates" where the function flattens.',
    },
    {
      id: 'ch1-004-ex3',
      title: 'Expanding and condensing logarithms',
      problem: 'Expand $\\ln\\!\\left(\\dfrac{x^3\\sqrt{y}}{z}\\right)$, then condense $3\\ln x + \\tfrac{1}{2}\\ln y - \\ln z$.',
      steps: [
        {
          expression: '\\ln\\!\\left(\\frac{x^3\\sqrt{y}}{z}\\right) = \\ln(x^3) + \\ln(y^{1/2}) - \\ln(z)',
          annotation: 'Quotient law: $\\ln(A/B) = \\ln A - \\ln B$. Product law: $\\ln(AB) = \\ln A + \\ln B$.',
          hint: 'Split using quotient law first, then product law for the numerator.',
        },
        {
          expression: '= 3\\ln x + \\tfrac{1}{2}\\ln y - \\ln z',
          annotation: 'Power law: $\\ln(A^n) = n\\ln A$. Write $\\sqrt{y} = y^{1/2}$.',
          hint: 'Apply power law to each term: $\\ln(x^3) = 3\\ln x$ and $\\ln(y^{1/2}) = \\frac{1}{2}\\ln y$.',
        },
        {
          expression: '3\\ln x + \\tfrac{1}{2}\\ln y - \\ln z = \\ln(x^3) + \\ln(\\sqrt{y}) - \\ln(z) = \\ln\\!\\left(\\frac{x^3\\sqrt{y}}{z}\\right)',
          annotation: 'Condensing is the reverse: power law first, then product/quotient laws.',
          hint: 'To condense: first use power law in reverse ($3\\ln x \\to \\ln(x^3)$), then combine with product/quotient laws.',
        },
      ],
      conclusion: 'Expansion and condensation are inverse operations. The three laws are all you need: product ↔ addition, quotient ↔ subtraction, power ↔ multiplication.',
    },
  ],

  challenges: [
    {
      id: 'ch1-004-ch1',
      difficulty: 'hard',
      problem: 'Find the domain of $f(x) = \\ln(x^2 - 5x + 6)$ and identify the VAs of the graph.',
      hint: 'Logarithm requires a positive argument. Factor $x^2 - 5x + 6$ to find where the argument is positive.',
      walkthrough: [
        {
          expression: 'x^2-5x+6 = (x-2)(x-3) > 0',
          annotation: 'Domain requires the argument $> 0$.',
        },
        {
          expression: '(x-2)(x-3)>0 \\Rightarrow x<2 \\text{ or } x>3',
          annotation: 'Sign analysis: product is positive when both factors have the same sign.',
        },
        {
          expression: '\\text{VAs at } x=2 \\text{ and } x=3 \\text{ (where argument} \\to 0^+\\text{, so } \\ln\\to-\\infty\\text{)}',
          annotation: 'At the domain boundaries, $\\ln(\\text{argument}) \\to -\\infty$. These are vertical asymptotes going downward.',
        },
      ],
      answer: '\\text{Domain: } (-\\infty, 2) \\cup (3, \\infty). \\text{ VAs at } x=2 \\text{ and } x=3.',
    },
    {
      id: 'ch1-004-ch2',
      difficulty: 'medium',
      problem: 'Simplify $\\log_2 8 + \\log_3(1/9)$.',
      hint: 'Express each as a power of the base using the definition of logarithm.',
      walkthrough: [
        { expression: '2^3 = 8 \\implies \\log_2 8 = 3', annotation: 'Definition of log: $\\log_b x = n \\iff b^n = x$.' },
        { expression: '3^{-2} = 1/9 \\implies \\log_3(1/9) = -2', annotation: '$1/9 = 3^{-2}$.' },
      ],
      answer: '3 + (-2) = 1',
    },
    {
      id: 'ch1-004-ch3',
      difficulty: 'hard',
      problem: 'Solve $2^{3x-1} = 5^{x+2}$ for $x$. Express the answer in terms of $\\ln$.',
      hint: 'Take $\\ln$ of both sides and use the power law $\\ln(a^b) = b\\ln a$. Then collect $x$ terms.',
      walkthrough: [
        {
          expression: '(3x-1)\\ln 2 = (x+2)\\ln 5',
          annotation: 'Take $\\ln$ of both sides; power law pulls exponents in front.',
        },
        {
          expression: '3x\\ln 2 - \\ln 2 = x\\ln 5 + 2\\ln 5',
          annotation: 'Distribute.',
        },
        {
          expression: 'x(3\\ln 2 - \\ln 5) = 2\\ln 5 + \\ln 2 \\Rightarrow x = \\frac{2\\ln 5 + \\ln 2}{3\\ln 2 - \\ln 5}',
          annotation: 'Collect $x$ terms on one side, factor, divide.',
        },
      ],
      answer: 'x = \\dfrac{2\\ln 5 + \\ln 2}{3\\ln 2 - \\ln 5} \\approx 4.07',
    },
  ],

  crossRefs: [
    { slug: 'function-behaviour', reason: 'Asymptote and end-behaviour vocabulary from Lesson 3 applies directly to each function family here' },
    { slug: 'function-transformations', reason: 'Transformed exponentials and logs use the master transformation formula from Lesson 2' },
    { slug: 'rate-of-change', reason: 'The derivative of $e^x$ is itself — exponential families have unique differentiation properties explored in Chapter 1' },
  ],

  checkpoints: [
    'Given a factored polynomial, can you determine zero locations, multiplicities, and end behaviour without graphing?',
    'Can you read the horizontal asymptote of a transformed exponential directly from $k$?',
    'Can you use the three log laws to expand or condense any logarithmic expression?',
    'Do you know the eight-step rational function sketching process?',
    'Can you solve an exponential equation by taking $\\ln$ of both sides?',
  ],

  semantics: {
    symbols: [
      { symbol: '(x-c)^m', meaning: 'Factor with root $c$ of multiplicity $m$: even $m$ → bounce, odd $m$ → cross' },
      { symbol: 'b^x', meaning: 'Exponential function — $x$ is the exponent; every unit increase multiplies output by $b$' },
      { symbol: '\\log_b x', meaning: 'Logarithm base $b$ — asks: "What power of $b$ gives $x$?"' },
      { symbol: 'e \\approx 2.718', meaning: 'Natural base — the unique base where $\\frac{d}{dx}e^x = e^x$' },
      { symbol: '\\ln x = \\log_e x', meaning: 'Natural logarithm — inverse of $e^x$; the default logarithm in calculus' },
    ],
    rulesOfThumb: [
      'Bounce-or-cross test: even multiplicity → bounce; odd multiplicity → cross.',
      'Log of a product = sum of logs. Log of a quotient = difference. Log of a power = multiplied coefficient.',
      'Exponential HA = $k$ (vertical shift). Log VA = $h$ (horizontal shift).',
      'To solve exponential equations: take $\\ln$ of both sides, use power law, isolate $x$.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Laws of exponents', where: 'Algebra 1 / Algebra 2', why: 'Log laws are derived from exponent laws; you need fluency with $b^x \\cdot b^y = b^{x+y}$ etc.' },
      { topic: 'Polynomial factoring', where: 'Algebra 2', why: 'Reading zeros and multiplicities requires being able to factor polynomials into $(x-c)^m$ form' },
      { topic: 'Rational expressions', where: 'Algebra 2', why: 'The eight-step rational sketch process requires polynomial long division and sign charts' },
    ],
    futureLinks: [
      { topic: 'Derivative of exponential/log', where: 'Chapter 2 Calculus', why: '$\\frac{d}{dx}e^x = e^x$ and $\\frac{d}{dx}\\ln x = \\frac{1}{x}$ — the function families from this lesson have elegant derivatives' },
      { topic: 'Integration of exponentials', where: 'Chapter 3 Calculus', why: 'Exponential integrals are the direct reverse of their derivatives; the family knowledge here is prerequisite' },
      { topic: 'Limits of exponentials and logs', where: 'Chapter 1, Lesson 5', why: 'The dominance hierarchy — $\\ln x \\ll x^a \\ll b^x$ — explains why exponentials beat polynomials at infinity' },
    ],
  },

  assessment: [
    {
      question: 'For $f(x) = (x+2)^3(x-1)^2$, describe the behaviour at each zero.',
      answer: 'At $x=-2$ (mult. 3, odd): crosses. At $x=1$ (mult. 2, even): bounces.',
      difficulty: 'quick-fire',
    },
    {
      question: 'What is the HA of $g(x) = -3 \\cdot 2^x + 7$?',
      answer: '$y = 7$ (the vertical shift $k$).',
      difficulty: 'quick-fire',
    },
    {
      question: 'Expand: $\\log_3\\!\\left(\\dfrac{x^2}{y}\\right)$.',
      answer: '$2\\log_3 x - \\log_3 y$.',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Polynomials: smooth, bounded by their degree. Root multiplicity → bounce (even) or cross (odd).',
    'Exponentials: "more you have, faster you grow." The exponent is the variable. HA at $y=k$.',
    'Logarithms: inverse of exponentials; compress big ranges. VA at $x=h$. Defined only for positive arguments.',
    'Log laws: product ↔ add, quotient ↔ subtract, power ↔ multiply. All three follow from exponent laws.',
    'Rational sketching: factor → landmarks (zeros, VAs, holes) → HA/oblique → sign chart → assemble.',
  ],

  quiz: [
    {
      id: 'pc1-004-q1',
      type: 'choice',
      text: 'For $f(x) = (x-3)^2(x+1)$, what happens at $x = 3$?',
      options: ['Crosses the $x$-axis', 'Bounces off the $x$-axis', 'Has a vertical asymptote', 'Has a hole'],
      answer: 'Bounces off the $x$-axis',
      hints: [
        'Check the multiplicity of the factor $(x-3)$: it appears as $(x-3)^2$, so multiplicity 2.',
        'Even multiplicity → bounce (graph touches axis but does not cross).',
      ],
      reviewSection: 'Intuition tab — root multiplicity and crossing behaviour',
    },
    {
      id: 'pc1-004-q2',
      type: 'choice',
      text: 'For $f(x) = -2x^5 + 3x^2 - 1$, describe the end behaviour.',
      options: [
        'Both ends $\\to +\\infty$',
        'Both ends $\\to -\\infty$',
        'Left $\\to +\\infty$, right $\\to -\\infty$',
        'Left $\\to -\\infty$, right $\\to +\\infty$',
      ],
      answer: 'Left $\\to +\\infty$, right $\\to -\\infty$',
      hints: [
        'Leading term: $-2x^5$. Degree 5 (odd), coefficient $-2$ (negative).',
        'Odd degree → opposite ends. Negative coefficient → right goes down. So left $\\to +\\infty$, right $\\to -\\infty$.',
      ],
      reviewSection: 'Math tab — polynomial end behaviour',
    },
    {
      id: 'pc1-004-q3',
      type: 'input',
      text: 'Expand: $\\log_2(8x^3)$.',
      answer: '3 + 3*log_2(x)',
      hints: [
        'Product law: $\\log_2(8x^3) = \\log_2 8 + \\log_2(x^3)$.',
        '$\\log_2 8 = 3$ (since $2^3 = 8$). Power law: $\\log_2(x^3) = 3\\log_2 x$. Total: $3 + 3\\log_2 x$.',
      ],
      reviewSection: 'Intuition tab — laws of logarithms',
    },
    {
      id: 'pc1-004-q4',
      type: 'input',
      text: 'What is the horizontal asymptote of $f(x) = 5 \\cdot 3^{x-2} + 1$?',
      answer: 'y = 1',
      hints: [
        'This is a transformed exponential: $a = 5$, $b = 3$, $h = 2$, $k = 1$.',
        'The HA is always $y = k$. Here $k = 1$, so HA: $y = 1$.',
      ],
      reviewSection: 'Math tab — exponential transformation asymptote rule',
    },
    {
      id: 'pc1-004-q5',
      type: 'choice',
      text: 'What is the domain of $f(x) = \\log_3(x - 4)$?',
      options: ['All real numbers', '$x > 4$', '$x > 0$', '$x > -4$'],
      answer: '$x > 4$',
      hints: [
        'Logarithm requires positive argument: $x - 4 > 0$.',
        'Solve: $x > 4$.',
      ],
      reviewSection: 'Math tab — logarithm transformation asymptote rule',
    },
    {
      id: 'pc1-004-q6',
      type: 'input',
      text: 'Condense into a single logarithm: $2\\ln x - \\ln y$.',
      answer: 'ln(x^2/y)',
      hints: [
        'Power law in reverse: $2\\ln x = \\ln(x^2)$.',
        'Quotient law: $\\ln(x^2) - \\ln y = \\ln(x^2/y)$.',
      ],
      reviewSection: 'Examples tab — expanding and condensing logarithms',
    },
    {
      id: 'pc1-004-q7',
      type: 'choice',
      text: 'For $f(x) = \\dfrac{(x-1)(x+3)}{(x-1)(x-5)}$, what is at $x = 1$?',
      options: ['Vertical asymptote', 'Hole', 'Zero', 'Nothing special'],
      answer: 'Hole',
      hints: [
        'Factor $(x-1)$ appears in both numerator and denominator.',
        'It cancels → removable discontinuity (hole). The function is undefined at $x=1$ but the limit exists.',
      ],
      reviewSection: 'Rigor tab — rational function sketch',
    },
    {
      id: 'pc1-004-q8',
      type: 'input',
      text: 'A population doubles every 3 years. If $P(0) = 500$, write $P(t)$.',
      answer: 'P(t) = 500 * 2^(t/3)',
      hints: [
        'Doubling model: $P(t) = P_0 \\cdot 2^{t/T}$ where $T$ is the doubling time.',
        'Here $P_0 = 500$ and $T = 3$: $P(t) = 500 \\cdot 2^{t/3}$.',
      ],
      reviewSection: 'Intuition tab — exponentials and proportional growth',
    },
    {
      id: 'pc1-004-q9',
      type: 'choice',
      text: 'Which is the correct factored form showing multiplicity for $f(x) = x^4 - 2x^3 + x^2$?',
      options: [
        '$x^2(x-1)^2$',
        '$x^2(x^2-1)$',
        '$x(x-1)^3$',
        '$(x-1)^2(x+1)^2$',
      ],
      answer: '$x^2(x-1)^2$',
      hints: [
        'Factor out $x^2$: $x^4 - 2x^3 + x^2 = x^2(x^2 - 2x + 1)$.',
        '$x^2 - 2x + 1 = (x-1)^2$. So $f(x) = x^2(x-1)^2$.',
      ],
      reviewSection: 'Examples tab — reading polynomial graphs from factored form',
    },
    {
      id: 'pc1-004-q10',
      type: 'choice',
      text: 'Which log property justifies $\\ln(e^5) = 5$?',
      options: [
        'Product law',
        'Quotient law',
        'Power law',
        'Change of base formula',
      ],
      answer: 'Power law',
      hints: [
        '$\\ln(e^5) = 5\\ln(e)$ by the power law.',
        '$\\ln e = 1$ (since $e^1 = e$), so $5 \\cdot 1 = 5$.',
      ],
      reviewSection: 'Intuition tab — laws of logarithms',
    },
  ],
}
