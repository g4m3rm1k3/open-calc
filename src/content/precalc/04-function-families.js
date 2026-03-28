export default {
  id: 'ch1-graphs-004',
  slug: 'function-families',
  chapter: 'precalc-1',
  order: 4,
  title: 'Function Families: The DNA of Every Mathematical Model',
  subtitle: 'Algebraic structure and behavior of our most powerful mathematical tools',
  tags: ['polynomials', 'exponentials', 'logarithms', 'laws of logs', 'laws of exponents', 'root multiplicity'],
  aliases: 'polynomial root multiplicity bounce cross touch rational function sketch exponential log laws expansion contraction',

  hook: {
    question: 'Why does gravity follow an $x^2$ rule, while a bank account follows an $e^x$ rule? And why do your ears hear sound on a Logarithmic scale?',
    realWorldContext: 'In **Physics**, the "Inverse Square Law" ($1/x^2$) governs light and gravity. In **Medicine**, Body Mass Index (BMI) is a Power Law. In **Biology**, populations grow Exponentially. In **Human Sensation**, we perceive sound and light Logarithmically — our brains "compress" huge ranges of data into a manageable scale. Every "Family" of functions is a different template for how the universe behaves.',
  },

  intuition: {
    prose: [
      'Think of Function Families as the "Species" of math. Identifying the species reveals the system\'s future, limits, and growth speed. To understand how the world scales, we must understand the DNA of these functions.',
      '**Polynomials (The Power of Roots)**: These are smooth, predictable curves built from powers of $x$. Their local behavior is dictated by their **Roots**. A root with an even multiplicity ($x^2$) causes a "Bounce" (touching the axis), while one with an odd multiplicity ($x^3$) causes a "Cross" (slicing through). This is the "DNA" that determines the shape of the path.',
      '**Exponentials (The Law of Proportional Growth)**: Unlike polynomials where $x$ is the base, here $x$ is the **Power**. This represents systems where the more you have, the faster you grow (like a bank account or a spreading virus). The constant $e \\approx 2.718$ is the universal baseline for continuous, organic growth.',
      '**Logarithms (The Data Compressors)**: Logs are the inverse of growth. They turn exponential gaps into manageable linear distances. This is why our ears hear volume and our eyes perceive light on a Logarithmic scale—our brains "compress" huge ranges of energy so we can process them.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The "Bounce or Cross" Rule',
        body: '\\text{Factor } (x-c)^m: \\\\ m \\text{ is EVEN: Bounces off axis at } c. \\\\ m \\text{ is ODD: Crosses through axis at } c.',
      },
      {
        type: 'theorem',
        title: 'The Laws of Exponents',
        body: 'b^x \\cdot b^y = b^{x+y} \\\\ (b^x)^y = b^{xy} \\\\ b^{-x} = 1/b^x',
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
    ],
    visualizations: [
      {
        id: 'RootMultiplicityViz',
        title: 'The Geometry of Roots',
        mathBridge: 'Observe how the multiplicity $m$ changes the "approach" to the $x$-axis. This is the local behavior dictated by the specific algebraic factor $(x-c)^m$.',
        caption: 'The power of a factor determines the local topography of the graph.',
      },
    ],
  },

  math: {
    prose: [
      'For the student of algebra, every function family is governed by definitive laws that allow for the manipulation of complex models into solvable forms.',
      '**Polynomial Structure**: $P(x) = a_n x^n + \\dots + a_0$. The **Fundamental Theorem of Algebra** guarantees that a polynomial of degree $n$ has exactly $n$ complex roots. We use the **Rational Roots Theorem** to identify potential integer zeros by evaluating the ratio of factors of $a_0$ to $a_n$.',
      '**The Factor & Remainder Identity**: A value $c$ is a zero of $P(x)$ if and only if $(x-c)$ is a factor. This relationship is verified by the **Remainder Theorem**, which states that the result of $P(c)$ is exactly the remainder of $P(x) / (x-c)$.',
      '**Logarithmic Identities**: Logarithms transform multiplication into addition and exponents into multipliers. The **Change of Base Formula** ($\\log_b A = \\frac{\\log_c A}{\\log_c b}$) allows us to translate any logarithmic system into a common or natural base for computation.',
      '**Exponential Foundations**: Modeled by $f(x) = ab^x$ or $Ae^{rt}$. These functions represent steady growth ($r>0$) or decay ($r<0$) where the rate of change is directly proportional to the current value.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Laws of Logs (Cheat Sheet)',
        body: '\\log_b(xy) = \\log_b x + \\log_b y \\\\ \\log_b(x/y) = \\log_b x - \\log_b y \\\\ \\log_b(x^n) = n \\log_b x',
      },
      {
        type: 'theorem',
        title: 'The Factor/Remainder Bridge',
        body: 'f(c) = 0 \\iff (x-c) \\text{ is a factor} \\\\ \\text{Remainder of } f(x)/(x-c) = f(c)',
      },
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
        title: 'Prototyping a Rational Function',
        mathBridge: 'Combine Horizontal Asymptotes (degrees), Vertical Asymptotes (denominator zeros), and $x$-intercepts (numerator zeros) to construct the curve.',
        caption: 'Sketching is the process of eliminating impossible geographic states.',
      },
    ],
  },

  rigor: {
    title: 'Anatomy of a Polynomial',
    prose: [
      'To model a system, we must find its "Anchor Points": the Intercepts.'
    ],
    proofSteps: [
      {
        section: 'Proof of End Behavior (Leading Term Wins)',
        expression: 'P(x) = x^3 - 4x^2 + 5 \\implies x^3(1 - \\frac{4}{x} + \\frac{5}{x^3})',
        annotation: 'Factor out the highest power. This reveals the dominant growth engine.'
      },
      {
        expression: '\\text{As } x \\to \\infty, \\frac{4}{x} \\to 0, \\frac{5}{x^3} \\to 0. \\implies P(x) \\approx x^3',
        annotation: 'Rule: For huge values, all other terms "evaporate" compared to the leading power.'
      },
      {
        section: 'Method: Zeros and y-intercepts',
        expression: 'P(0) = a_0, \\quad P(x) = 0 \\implies (x-c_1)(x-c_2)...',
        annotation: 'Rule: set $x=0$ for the vertical start; factor the equation for the horizontal crossings.'
      }
    ]
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
    {
      id: 'ex-log-expand',
      title: 'Algebra: Expanding Logarithms',
      problem: '\\text{Expand } \\ln(x^3 \\sqrt{y} / z).',
      steps: [
        {
          expression: '\\ln(x^3 \\sqrt{y}) - \\ln(z)',
          annotation: 'Use Quotient Law: $\ln(A/B) = \ln A - \ln B$.'
        },
        {
          expression: '\\ln(x^3) + \\ln(y^{1/2}) - \\ln(z)',
          annotation: 'Use Product Law: $\ln(AB) = \ln A + \ln B$.'
        },
        {
          expression: '3\\ln x + \\tfrac{1}{2}\\ln y - \\ln z',
          annotation: 'Use Power Law: $\ln A^n = n \ln A$.'
        }
      ],
      conclusion: 'The complex log is decomposed into basic building blocks.'
    },
    {
      id: 'ex-eng-decay',
      title: 'Applied: Radioactive Decay',
      problem: '\\text{A sample decays by } m(t) = 100(2)^{-t/10}. \\\\ \\text{Find the mass after 30 years.}',
      steps: [
        {
          expression: 'm(30) = 100(2)^{-30/10} = 100(2)^{-3}',
          annotation: 'Substitute 30 for time.'
        },
        {
          expression: 'm(30) = 100/2^3 = 100/8 = 12.5',
          annotation: 'Apply Exponent Law: $b^{-n} = 1/b^n$.'
        }
      ],
      conclusion: 'Only 12.5g of the original 100g remains.'
    }
  ],

  challenges: [
    {
      id: 'ch-04-01',
      difficulty: 'medium',
      problem: '\\text{Simplify } \log_2(8) + \log_3(1/9).',
      walkthrough: [
        { expression: '2^3 = 8 \\implies \log_2(8) = 3', annotation: 'Definition of log.' },
        { expression: '3^{-2} = 1/9 \\implies \log_3(1/9) = -2', annotation: 'Definition of log.' }
      ],
      answer: '3 - 2 = 1'
    },
    {
      id: 'ch-04-02',
      difficulty: 'hard',
      problem: '\\text{Identify the family and behavior of } f(x) = \dfrac{x-1}{(x-1)(x-2)}.',
      answer: '\\text{Family: Rational. } \\\\ \\text{Features: Hole at } x=1, \\text{ VA at } x=2, \\text{ HA at } y=0.'
    },
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
