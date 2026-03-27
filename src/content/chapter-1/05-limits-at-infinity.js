export default {
  id: 'ch1-limits-at-infinity',
  slug: 'limits-at-infinity',
  chapter: 1,
  order: 6,
  title: 'Limits at Infinity',
  subtitle: 'End behavior, asymptotes, and growth-rate dominance',
  tags: ['limits at infinity', 'horizontal asymptote', 'oblique asymptote', 'end behavior', 'epsilon-N', 'growth rates'],

  hook: {
    question: 'As x gets huge, what does the function actually settle into?',
    realWorldContext:
      'When engineers model drag, population growth, signal filters, or long-term costs, they care about end behavior: what happens as time or input becomes very large. ' +
      'A function can spike, dip, and oscillate locally while still having a predictable long-run trend. Limits at infinity capture that long-run trend exactly and lead to horizontal or slant asymptotes.',
    previewVisualizationId: 'LimitApproach',
  },

  intuition: {
    prose: [
      'A limit at infinity asks what f(x) does as x grows without bound. It does NOT mean plugging in x = infinity; infinity is not a real number you can substitute. Instead, it asks for long-run behavior.',
      'For rational functions, the highest powers dominate for large |x|. Lower powers become negligible. This gives the three core cases: numerator degree smaller than denominator degree gives 0; equal degrees gives ratio of leading coefficients; larger numerator degree gives growth without bound or an oblique asymptote after division.',
      'A horizontal asymptote y = L means f(x) gets arbitrarily close to L for large positive or negative x. The graph can cross a horizontal asymptote; asymptote means end behavior, not a barrier.',
      'An oblique (slant) asymptote appears when deg(numerator) = deg(denominator) + 1. Polynomial long division gives f(x) = mx + b + remainder/denominator, and the remainder term vanishes at infinity, so the graph hugs y = mx + b.',
    ],
    callouts: [
      {
        type: 'misconception',
        title: 'Infinity Is Not a Number',
        body: 'The notation x -> infinity means x grows without bound. It does not mean x equals a special numeric value. Limits at infinity are about trends, not substitution.',
      },
      {
        type: 'intuition',
        title: 'Dominance Hierarchy',
        body: 'For large x: logarithms grow slowest, then powers of x, then exponentials. Symbolically: ln(x) << x^a << b^x (a > 0, b > 1).',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Calculus I - 3.5.2 Horizontal Asymptotes and Computational Techniques",
        props: { url: "" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 3.5.1 Limits at Infinity",
        props: { url: "" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 1.5.2 Vertical Asymptotes",
        props: { url: "" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 1.5.1 Infinite Limits and Their Properties",
        props: { url: "" }
      },
      {
        id: 'VideoEmbed',
        title: "Limits \"at\" infinity",
        props: { url: "" }
      },
      {
        id: 'LimitApproach',
        props: { fn: '(3*x*x - 2*x + 1)/(5*x*x + 4*x - 7)', targetX: 200, limitVal: 0.6 },
        title: 'Rational End Behavior',
        caption: 'As x grows, lower-order terms fade. The function approaches 3/5.',
      },
    ],
  },

  math: {
    prose: [
      'Formal definition (epsilon-N): lim(x->infinity) f(x) = L means for every epsilon > 0, there exists N such that x > N implies |f(x) - L| < epsilon.',
      'For rational functions p(x)/q(x), divide numerator and denominator by the highest power of x in q(x). Terms like 1/x and 1/x^2 vanish as x -> infinity.',
      'Degree rules for rational functions:',
      '1) deg(p) < deg(q): limit is 0.',
      '2) deg(p) = deg(q): limit is ratio of leading coefficients.',
      '3) deg(p) > deg(q): no finite horizontal asymptote; use long division to identify polynomial asymptote behavior.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Epsilon-N Definition',
        body: '\\lim_{x \\to \\infty} f(x) = L \\iff \\forall \\varepsilon > 0, \\exists N > 0 \\text{ such that } x > N \\implies |f(x)-L| < \\varepsilon',
      },
      {
        type: 'definition',
        title: 'Horizontal Asymptote',
        body: 'If \\lim_{x \\to \\infty} f(x) = L or \\lim_{x \\to -\\infty} f(x) = L, then y = L is a horizontal asymptote.',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Computing Limits at Infinity for Rational Functions",
        props: { url: "" }
      },
      {
        id: 'LimitApproach',
        props: { fn: '(2*x*x + 3)/(x*x - 1)', targetX: 120, limitVal: 2, showTable: true },
        title: 'Equal-Degree Ratio Rule',
        caption: 'For equal degrees, the limit at infinity is the ratio of leading coefficients.',
      },
    ],
  },

  rigor: {
    prose: [
      'The degree rules come from factoring out the dominant power of x and applying limit laws. For example, if deg(p)=deg(q)=n, then p(x)/q(x) = (a_n + lower terms/x)/(b_n + lower terms/x) -> a_n/b_n.',
      'Growth-rate comparisons can be proved with lHopital, series, or inequalities: ln(x)/x^a -> 0 for a>0, and x^a/b^x -> 0 for b>1. These results justify why exponentials dominate polynomials and why polynomials dominate logarithms.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Division First, Then Limit',
        body: 'When degrees suggest a slant asymptote, perform polynomial long division before taking the limit. The remainder term is what vanishes at infinity.',
      },
    ],
    visualizationId: null,
  
      visualizations: [
      {
        id: 'VideoEmbed',
        title: "Infinite Limit vs Limits at Infinity of a Composite Function",
        props: { url: "" }
      },
      ],
    },

  examples: [
    {
      id: 'ex-inf-rational-equal',
      title: 'Equal Degrees',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to \\infty} \\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}.',
      steps: [
        { expression: '\\lim_{x \\to \\infty} \\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}', annotation: 'Equal degrees (2 and 2), so expect ratio of leading coefficients.' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{3 - 2/x + 1/x^2}{5 + 4/x - 7/x^2}', annotation: 'Divide top and bottom by x^2.' },
        { expression: '= \\frac{3}{5}', annotation: 'All 1/x terms vanish.' },
      ],
      conclusion: 'The limit is 3/5, so y = 3/5 is a horizontal asymptote (as x -> infinity).',
    },
    {
      id: 'ex-inf-rational-unequal',
      title: 'Numerator Degree Smaller',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to \\infty} \\frac{7x + 1}{x^2 - 9}.',
      steps: [
        { expression: '\\lim_{x \\to \\infty} \\frac{7x + 1}{x^2 - 9}', annotation: 'Degree 1 over degree 2.' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{7/x + 1/x^2}{1 - 9/x^2}', annotation: 'Divide by x^2.' },
        { expression: '= 0', annotation: 'Numerator vanishes, denominator approaches 1.' },
      ],
      conclusion: 'When denominator degree is larger, the limit is 0.',
    },
    {
      id: 'ex-inf-oblique',
      title: 'Slant Asymptote by Long Division',
      problem: 'Find the end behavior of \\displaystyle f(x)=\\frac{x^2+3x+1}{x-1}.',
      steps: [
        { expression: '\\frac{x^2+3x+1}{x-1} = x + 4 + \\frac{5}{x-1}', annotation: 'Polynomial long division.' },
        { expression: '\\lim_{x \\to \\infty} \\frac{5}{x-1} = 0', annotation: 'Remainder term vanishes.' },
        { expression: 'f(x) \\sim x + 4', annotation: 'The graph approaches the line y = x + 4 for large |x|.' },
      ],
      conclusion: 'The oblique asymptote is y = x + 4.',
    },
    {
      id: 'ex-inf-growth',
      title: 'Exponential vs Polynomial Growth',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to \\infty} \\frac{x^3}{e^x}.',
      steps: [
        { expression: '\\lim_{x \\to \\infty} \\frac{x^3}{e^x}', annotation: 'Exponential eventually dominates polynomial growth.' },
        { expression: '= 0', annotation: 'Can be shown by repeated lHopital in later chapters.' },
      ],
      conclusion: 'Exponentials outgrow every power of x.',
    },
  ],

  challenges: [
    {
      id: 'ch1-inf-c1',
      difficulty: 'medium',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to -\\infty} \\frac{4x^3-1}{2x^3+7x}.',
      hint: 'Equal degrees. Divide by x^3.',
      walkthrough: [
        { expression: '\\lim_{x \\to -\\infty} \\frac{4-1/x^3}{2+7/x^2} = \\frac{4}{2}', annotation: 'All inverse-power terms vanish.' },
      ],
      answer: '2',
    },
    {
      id: 'ch1-inf-c2',
      difficulty: 'hard',
      problem: 'Find the horizontal or slant asymptote of f(x)=\\frac{2x^2-5x+3}{x+1}.',
      hint: 'Use long division.',
      walkthrough: [
        { expression: '\\frac{2x^2-5x+3}{x+1} = 2x - 7 + \\frac{10}{x+1}', annotation: 'Divide polynomial terms.' },
        { expression: '\\lim_{x \\to \\pm\\infty} \\frac{10}{x+1} = 0', annotation: 'Remainder term vanishes at both ends.' },
      ],
      answer: 'Slant asymptote y = 2x - 7',
    },
  ],

  crossRefs: [
    { lessonSlug: 'squeeze-theorem', label: 'Previous: Squeeze Theorem', context: 'Bounding arguments also work for end behavior.' },
    { lessonSlug: 'continuity', label: 'Review: Continuity', context: 'Asymptotes describe long-run behavior, not local continuity at a point.' },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "lim(x→∞) f(x) = L",
            "meaning": "as x grows without bound, f(x) gets arbitrarily close to L — L is a horizontal asymptote"
        },
        {
            "symbol": "leading term",
            "meaning": "the highest-degree term in a polynomial — it dominates all others for large x"
        },
        {
            "symbol": "horizontal asymptote",
            "meaning": "the line y = L that the function approaches as x → ±∞"
        }
    ],
    "rulesOfThumb": [
        "For rational functions: compare degrees. Same degree → ratio of leading coefficients. Numerator higher → ±∞. Denominator higher → 0.",
        "Divide numerator and denominator by the highest power of x in the denominator.",
        "1/xⁿ → 0 as x→∞ for any n > 0. This is the anchor for all limit-at-infinity computations."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch1-intro-limits",
            "label": "Ch. 1: Introduction to Limits",
            "note": "Limits at infinity follow the same logic as finite limits — the function is approaching a value — but the \"approach\" is along the x-axis toward ±∞ rather than toward a finite point."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch3-lhopital",
            "label": "Ch. 3: L'Hôpital's Rule",
            "note": "∞/∞ is an indeterminate form handled by L'Hôpital. Many limits at infinity reduce to this form and require that rule."
        },
        {
            "lessonId": "ch3-curve-sketching",
            "label": "Ch. 3: Curve Sketching",
            "note": "Horizontal asymptotes are one of the key features to determine when sketching a curve. Limits at infinity give you the end-behavior of the graph directly."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "linf-assess-1",
            "type": "input",
            "text": "lim(x→∞) (3x²+5) / (x²-2). What is the answer?",
            "answer": "3",
            "hint": "Same degree top and bottom. Divide both by x²: (3 + 5/x²)/(1 - 2/x²). As x→∞, those fractions → 0. Left with 3/1 = 3."
        },
        {
            "id": "linf-assess-2",
            "type": "choice",
            "text": "lim(x→∞) (x³+1)/(x²+x). The answer is:",
            "options": [
                "1",
                "0",
                "+∞",
                "-∞"
            ],
            "answer": "+∞",
            "hint": "Numerator degree (3) > denominator degree (2). The rational function grows without bound."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Large x → 1/xⁿ → 0 (this is the anchor)",
    "Rational: compare leading degrees (same, higher top, higher bottom)",
    "Horizontal asymptote y=L ⟺ lim(x→±∞) f(x) = L"
],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}