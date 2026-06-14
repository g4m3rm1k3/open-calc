export default {
  id: 'ch1-graphs-003',
  slug: 'function-behaviour',
  chapter: 'precalc-1',
  order: 3,
  title: 'Function Behaviour: Predicting the Future and Finding the Limits',
  subtitle: 'Asymptotes, end behaviour, extrema, and concavity — the full story a graph tells',
  tags: ['asymptotes', 'end behaviour', 'holes', 'limits', 'increasing decreasing', 'concavity', 'relative maxima', 'absolute maxima', 'extrema'],
  aliases: 'vertical asymptote horizontal asymptote oblique slant asymptote hole removable discontinuity end behavior dominant term local max min global extrema concavity inflection',

  hook: {
    question: 'Where is the function heading in the long run? Where are the "no-go" zones where it spikes to infinity?',
    realWorldContext: 'In **Computer Science**, Big-O notation is just a study of end behaviour: which algorithm wins as $n$ gets huge? In **Mechanical Engineering**, a vertical asymptote is a resonance spike — the frequency where a bridge or engine vibrates so hard it might break. In **Medicine**, your body reaches a steady-state drug concentration — that level is a horizontal asymptote. Understanding behaviour means you can see the destiny of a system before you run the simulation.',
    previewVisualizationId: 'FunctionBehaviourViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** The previous lesson gave you the "remote control" for functions — shift, stretch, reflect, invert. Now you use that foundation to read a function\'s destiny. A graph is not just a line; it is a topography of constraints, trends, and future limits. This lesson is about what the edges of the graph are doing.',
      '**Vertical asymptotes — the "no-go" zones**: Imagine trying to draw more current from a battery than it can provide. As you approach that theoretical limit, resistance blows up to infinity. In math this is a vertical asymptote — an $x$-value the function can never reach, where the formula explodes. It is not an approximation; it is an algebraic impossibility encoded as a wall.',
      '**Horizontal asymptotes — the long-run level**: Think of an airplane reaching cruising altitude, or a population reaching its environment\'s carrying capacity. No matter how fast things move initially, the system settles into a steady state. The horizontal asymptote is where the function *approaches but never quite reaches* as $x \\to \\pm\\infty$.',
      '**Extrema and sign changes**: A function reaches a local maximum or minimum where it switches from increasing to decreasing (or vice versa). In physics, these are points of potential energy peaks or stable equilibria. The sign chart — testing intervals between critical points — lets you map all this behaviour without drawing anything.',
      '**Concavity — the quality of the change**: Concavity is about the "bend." A concave-up curve holds its value like a cup; a concave-down curve sheds it. The inflection point — where concavity switches — is the exact moment the acceleration of the system changes direction.',
      '**Where this is heading:** The next lesson introduces specific function families (polynomials, exponentials, logs). Each family has a characteristic behaviour profile. The vocabulary you build in this lesson — asymptotes, extrema, concavity — is the language you will use to describe and compare them.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc arc — Lesson 3 of 5',
        body: '← Function Transformations | **Function Behaviour** | Function Families →',
      },
      {
        type: 'definition',
        title: 'Vertical asymptote vs hole — the deciding test',
        body: '\\text{If } \\lim_{x \\to c} f(x) = \\pm\\infty \\Rightarrow \\text{vertical asymptote at } x = c \\\\ \\text{If } \\lim_{x \\to c} f(x) = L \\text{ (finite) but } f(c) \\text{ undefined} \\Rightarrow \\text{hole at } (c, L)',
      },
      {
        type: 'theorem',
        title: 'Horizontal asymptote: the degree comparison rule',
        body: '\\frac{p(x)}{q(x)}: \\quad \\deg p < \\deg q \\Rightarrow y=0 \\quad \\deg p = \\deg q \\Rightarrow y = \\frac{\\text{leading coeff } p}{\\text{leading coeff } q} \\quad \\deg p > \\deg q \\Rightarrow \\text{no HA}',
      },
      {
        type: 'insight',
        title: 'Oblique asymptote — when the numerator wins by exactly one degree',
        body: '\\text{If } \\deg p = \\deg q + 1\\text{, perform long division: } \\frac{p(x)}{q(x)} = (mx+b) + \\frac{r(x)}{q(x)} \\\\ \\text{Oblique asymptote: } y = mx + b. \\text{ The remainder term } \\to 0.',
      },
      {
        type: 'insight',
        title: 'The hole vs the spike',
        body: '\\text{Hole (Removable): } \\frac{0}{0} \\text{ — factor cancels, leaving a missing point.} \\\\ \\text{VA (Non-Removable): } \\frac{\\text{const}}{0} \\text{ — the problem explodes to infinity.}',
      },
    ],
    visualizations: [
      {
        id: 'FunctionBehaviourViz',
        title: 'Asymptotes, Holes, and End Behaviour Live',
        mathBridge: 'Step 1: Start with the default function and identify the vertical asymptote (the vertical wall) and the horizontal asymptote (the flat line the curve approaches at the edges). Step 2: Switch to a function with a hole. Notice it looks like a gap — the limit exists there, but the function value does not. Step 3: Switch to a function with an oblique asymptote. Watch the curve approach a diagonal line at the ends — this happens when the numerator degree exceeds the denominator by exactly 1. The key lesson: asymptotes are not drawn on the graph — they are limits that the graph approaches, arising directly from the algebraic structure of the formula.',
        caption: 'Each type of asymptote corresponds to a different algebraic condition in the formula.',
      },
    ],
  },

  math: {
    prose: [
      'The long-run behaviour of a function is controlled entirely by its highest-degree terms. Everything else becomes negligible as $x \\to \\pm\\infty$.',
      '**Polynomial end behaviour**: $f(x) = a_n x^n + \\cdots$. For large $|x|$, all lower-degree terms are dwarfed by $a_n x^n$. The degree $n$ (even or odd) determines whether both ends go the same direction; the sign of $a_n$ determines which direction.',
      '**Rational function analysis**: Always factor first. Common factors signal holes (removable discontinuities). Remaining denominator zeros are vertical asymptotes. The degree comparison gives horizontal or oblique asymptotes. A sign chart on the factored form reveals where the function is positive or negative.',
      '**The difference quotient**: To measure average rate of change from $x$ to $x+h$, we compute $\\frac{f(x+h)-f(x)}{h}$. As $h \\to 0$, this becomes the instantaneous rate of change — the derivative. This is the bridge between precalculus behaviour analysis and differential calculus.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Polynomial end behaviour — the leading term rules',
        body: 'f(x) = a_n x^n + \\cdots: \\\\ n \\text{ even}, a_n>0: \\text{ both ends } \\to +\\infty \\quad (\\text{U-shape}) \\\\ n \\text{ even}, a_n<0: \\text{ both ends } \\to -\\infty \\quad (\\text{∩-shape}) \\\\ n \\text{ odd}, a_n>0: \\text{ left}\\to-\\infty,\\text{ right}\\to+\\infty \\\\ n \\text{ odd}, a_n<0: \\text{ left}\\to+\\infty,\\text{ right}\\to-\\infty',
      },
      {
        type: 'definition',
        title: 'Relative vs absolute extrema — precise definitions',
        body: '\\text{Relative max at } c: f(c) \\geq f(x) \\text{ for } x \\text{ near } c \\\\ \\text{Absolute max at } c: f(c) \\geq f(x) \\text{ for ALL } x \\in \\text{domain} \\\\ \\text{On } [a,b]: \\text{ absolute extrema occur at local extrema or endpoints}',
      },
      {
        type: 'definition',
        title: 'Concavity — without calculus',
        body: '\\text{Concave up on } I: \\text{ chord between any two points lies ABOVE the graph} \\\\ \\text{Concave down on } I: \\text{ chord lies BELOW the graph} \\\\ \\text{Inflection point: where concavity changes}',
      },
      {
        type: 'insight',
        title: 'The sign chart — your pre-calculus tool for behaviour',
        body: '\\text{Factor } f(x). \\text{ Mark zeros and undefined points on a number line.} \\\\ \\text{Test each interval: positive} \\to \\text{above axis, negative} \\to \\text{below.} \\\\ \\text{This reveals where } f > 0, f < 0 \\text{ without graphing.}',
      },
      {
        type: 'theorem',
        title: 'The secant-to-tangent bridge',
        body: '\\frac{f(x+h) - f(x)}{h} \\xrightarrow{h \\to 0} f\'(x)',
      },
    ],
    visualizations: [
      {
        id: 'SecantLineViz',
        title: 'The Anatomy of Change',
        mathBridge: 'Step 1: Observe the blue secant line connecting two points on the curve. Its slope is $\\frac{f(x+h)-f(x)}{h}$ — the average rate of change over a span $h$. Step 2: Drag the second point toward the first (shrink $h$). Watch the secant line rotate and approach a fixed position. Step 3: Set $h$ as small as possible. The line is now the tangent — the instantaneous rate of change at a single point. The key lesson: the derivative is the limit of average rates of change. Everything in differential calculus starts from this one observation.',
        caption: 'Limits turn approximate spans into exact moments.',
      },
    ],
  },

  rigor: {
    title: 'Full asymptote and hole analysis of a rational function',

    proofSteps: [
      {
        expression: 'f(x) = \\frac{x^2 - x - 6}{x^2 - 4} = \\frac{(x-3)(x+2)}{(x-2)(x+2)}',
        annotation: 'Factor numerator and denominator completely. Always do this first.',
      },
      {
        expression: '\\text{At } x = -2: \\text{ both numerator and denominator are 0} \\Rightarrow \\text{hole}',
        annotation: 'Factor $(x+2)$ cancels. The function is undefined at $x=-2$ but the limit exists.',
      },
      {
        expression: '\\lim_{x \\to -2} f(x) = \\lim_{x \\to -2} \\frac{x-3}{x-2} = \\frac{-5}{-4} = \\frac{5}{4}',
        annotation: 'After cancellation, substitute $x = -2$. Hole is at $(-2, 5/4)$.',
      },
      {
        expression: '\\text{At } x = 2: \\text{ denominator} = 0, \\text{ numerator} = \\frac{-1}{0} \\Rightarrow \\text{vertical asymptote at } x=2',
        annotation: 'Factor $(x-2)$ does not cancel. The function diverges at $x = 2$.',
      },
      {
        expression: '\\deg(\\text{num}) = \\deg(\\text{denom}) = 2 \\Rightarrow y = \\frac{1}{1} = 1',
        annotation: 'Equal degrees: horizontal asymptote is the ratio of leading coefficients. Both are 1.',
      },
      {
        expression: '\\text{Summary: VA at } x=2,\\text{ hole at }(-2,\\tfrac{5}{4}),\\text{ HA at } y=1',
        annotation: 'One function — three different types of interesting behaviour, all revealed by factoring.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-003-ex1',
      title: 'Finding the oblique asymptote',
      problem: 'Find all asymptotes of $f(x) = \\dfrac{x^2 + 3x - 2}{x - 1}$.',
      steps: [
        {
          expression: '\\deg(\\text{num})=2,\\ \\deg(\\text{denom})=1 \\Rightarrow \\text{oblique asymptote (no HA)}',
          annotation: 'Numerator degree exceeds denominator by exactly 1 — oblique asymptote exists.',
          hint: 'Check the degrees first: $\\deg(x^2+3x-2) = 2$ and $\\deg(x-1) = 1$. Difference is 1, so oblique.',
        },
        {
          expression: '\\frac{x^2+3x-2}{x-1} = x + 4 + \\frac{2}{x-1}',
          annotation: 'Polynomial long division. The remainder $\\frac{2}{x-1} \\to 0$ as $x \\to \\pm\\infty$.',
          hint: 'Divide $x^2+3x-2$ by $x-1$ using long division. $x^2 \\div x = x$; multiply back; subtract; repeat.',
        },
        {
          expression: '\\text{Oblique asymptote: } y = x + 4 \\qquad \\text{Vertical asymptote: } x = 1',
          annotation: 'The function approaches $y=x+4$ at both ends. VA where denominator is zero — numerator at $x=1$: $1+3-2=2\\neq 0$ ✓',
          hint: 'Oblique asymptote = quotient from long division (ignore the remainder). VA = denominator zeros where numerator is nonzero.',
        },
      ],
      conclusion: 'Long division always reveals the oblique asymptote. The remainder terms are what the function does differently from its asymptotic behaviour.',
    },
    {
      id: 'ch1-003-ex2',
      title: 'Identifying all extrema on a closed interval',
      problem: 'Find absolute extrema of $f(x) = x^3 - 3x$ on $[-2, 3]$.',
      steps: [
        {
          expression: 'f(-2) = -8+6 = -2 \\quad f(3) = 27-9 = 18',
          annotation: 'Always evaluate endpoints first on a closed interval.',
          hint: 'On a closed interval, absolute extrema can occur at endpoints or interior critical points. Check both.',
        },
        {
          expression: '\\text{Local extrema of } x^3-3x \\text{ occur at } x=\\pm 1',
          annotation: 'Interior critical points: by sign analysis or knowing $f\'(x) = 3x^2-3 = 0 \\Rightarrow x=\\pm 1$.',
          hint: 'Without calculus, check where the function switches from increasing to decreasing using a sign chart or by recognizing the factored derivative.',
        },
        {
          expression: 'f(-1) = -1+3 = 2 \\quad f(1) = 1-3 = -2',
          annotation: 'Evaluate at all interior critical points.',
          hint: 'Substitute $x = -1$ and $x = 1$ into $f(x) = x^3 - 3x$.',
        },
        {
          expression: '\\text{Values: } f(-2)=-2,\\ f(-1)=2,\\ f(1)=-2,\\ f(3)=18',
          annotation: 'Compare all four candidates. Absolute max: $18$ at $x=3$. Absolute min: $-2$ at $x=-2$ and $x=1$.',
          hint: 'The largest value among all candidates is the absolute max; the smallest is the absolute min.',
        },
      ],
      conclusion: 'On a closed interval, always check both interior critical points AND the endpoints. The absolute extremum is the largest (or smallest) value among all of them.',
    },
    {
      id: 'ch1-003-ex3',
      title: 'Identifying a hole versus a vertical asymptote',
      problem: 'Identify the behaviour of $f(x) = \\dfrac{x^2-4}{x-2}$ at $x = 2$.',
      steps: [
        {
          expression: 'f(2) = \\frac{4-4}{2-2} = \\frac{0}{0}',
          annotation: 'Substituting $x=2$ gives $\\frac{0}{0}$ — an indeterminate form, not infinity.',
          hint: 'First try substituting $x=2$. A $\\frac{0}{0}$ form means there may be a hole.',
        },
        {
          expression: '\\frac{x^2-4}{x-2} = \\frac{(x-2)(x+2)}{x-2} = x+2 \\quad (x\\neq 2)',
          annotation: 'Factor and cancel. The $(x-2)$ factor cancels — this is a removable discontinuity.',
          hint: 'Factor the numerator: $x^2 - 4 = (x-2)(x+2)$. The $(x-2)$ in numerator and denominator cancel.',
        },
        {
          expression: '\\lim_{x \\to 2}(x+2) = 4',
          annotation: 'The limit exists and equals 4. Since $f(2)$ is undefined, this is a hole at $(2, 4)$.',
          hint: 'After cancellation, substitute $x=2$ into the simplified expression to find the $y$-value of the hole.',
        },
      ],
      conclusion: 'When the factor causing the zero cancels, you get a hole. When it does not cancel, the function diverges to $\\pm\\infty$ — a vertical asymptote.',
    },
  ],

  challenges: [
    {
      id: 'ch1-003-ch1',
      difficulty: 'hard',
      problem: 'Completely analyse $f(x) = \\dfrac{2x^2-8}{x^2-9}$: zeros, holes, VAs, HA, and end behaviour.',
      hint: 'Factor everything first. $2x^2-8 = 2(x^2-4) = 2(x-2)(x+2)$ and $x^2-9 = (x-3)(x+3)$.',
      walkthrough: [
        {
          expression: 'f(x) = \\frac{2(x-2)(x+2)}{(x-3)(x+3)}',
          annotation: 'Fully factored. No common factors → no holes.',
        },
        {
          expression: '\\text{Zeros: } x = \\pm 2 \\quad \\text{VAs: } x = \\pm 3 \\quad \\text{HA: } y = 2',
          annotation: 'Zeros where numerator is 0. VAs where denominator is 0 (no cancellation). HA from equal degrees: $2/1 = 2$.',
        },
        {
          expression: 'x \\to \\pm\\infty: f(x) \\to \\frac{2x^2}{x^2} = 2 \\text{ (from below for large positive } x\\text{)}',
          annotation: 'End behaviour confirms the HA at $y=2$. Plugging $x=100$: $f(100) \\approx 1.998 < 2$.',
        },
      ],
      answer: '\\text{Zeros: } \\pm 2.\\text{ VAs: } \\pm 3.\\text{ No holes. HA: } y=2.',
    },
    {
      id: 'ch1-003-ch2',
      difficulty: 'medium',
      problem: 'Find the oblique asymptote of $f(x) = \\dfrac{x^2+1}{x}$.',
      hint: 'Split the fraction into two terms or perform long division.',
      walkthrough: [
        {
          expression: 'f(x) = \\frac{x^2}{x} + \\frac{1}{x} = x + \\frac{1}{x}',
          annotation: 'Split: numerator divided term by term.',
        },
        {
          expression: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
          annotation: 'The remainder vanishes at infinity. The oblique asymptote is the remaining part.',
        },
      ],
      answer: 'y = x',
    },
  ],

  crossRefs: [
    { slug: 'function-transformations', reason: 'Identifying the base family of a transformed function determines its asymptote structure' },
    { slug: 'function-families', reason: 'Each function family (exponential, logarithm, polynomial) has a characteristic behaviour profile described using this lesson\'s vocabulary' },
    { slug: '00-intro-limits', reason: 'Limits are the formal machinery for what "approaching" an asymptote means' },
    { slug: '05-limits-at-infinity', reason: 'Limits at infinity formalise horizontal asymptote analysis using the dominance hierarchy' },
  ],

  checkpoints: [
    'Can you determine whether a rational function has a hole or VA at a given point by checking whether the factor cancels?',
    'Given degrees of numerator and denominator, can you immediately state the horizontal asymptote (or say there isn\'t one)?',
    'Can you find an oblique asymptote using polynomial long division?',
    'On a closed interval, do you check both interior critical points AND endpoints when finding absolute extrema?',
    'Can you use a sign chart to identify where a function is positive/negative without graphing?',
  ],

  semantics: {
    symbols: [
      { symbol: '\\lim_{x \\to c} f(x) = \\pm\\infty', meaning: 'Vertical asymptote at $x=c$ — function grows without bound' },
      { symbol: '\\lim_{x \\to \\infty} f(x) = L', meaning: 'Horizontal asymptote $y=L$ — function settles to $L$ in the long run' },
      { symbol: 'y = mx + b', meaning: 'Oblique (slant) asymptote — occurs when numerator degree exceeds denominator degree by 1' },
      { symbol: '\\frac{f(x+h)-f(x)}{h}', meaning: 'Difference quotient — average rate of change; approaches the derivative as $h \\to 0$' },
      { symbol: 'f\'(x)', meaning: 'Derivative — instantaneous rate of change; limit of the difference quotient' },
    ],
    rulesOfThumb: [
      'Factor first, always. Common factors → holes. Leftover denominator zeros → VAs.',
      'HA rule: lower wins (HA at 0), equal wins (ratio of leading coefficients), higher wins (no HA, check oblique).',
      'Oblique asymptote = quotient from polynomial long division of numerator by denominator.',
      'On a closed interval: absolute extremum is found by comparing ALL local extrema and BOTH endpoints.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Polynomial factoring', where: 'Algebra 2', why: 'Identifying holes vs VAs requires fully factoring and canceling — fluency with factoring is prerequisite' },
      { topic: 'Polynomial long division', where: 'Algebra 2', why: 'Finding oblique asymptotes requires dividing polynomials; revisit if you cannot perform long division' },
      { topic: 'Sign analysis / number lines', where: 'Algebra 2', why: 'Sign charts require knowing how signs change across zeros and undefined points' },
    ],
    futureLinks: [
      { topic: 'Limits and continuity', where: 'Chapter 1 Calculus', why: 'The intuitive asymptote analysis here becomes rigorous using epsilon-delta and limit laws' },
      { topic: 'Limits at infinity', where: 'Chapter 1, Lesson 5', why: 'The dominance hierarchy ($\\ln x \\ll x^a \\ll b^x$) gives the algebraic engine behind HA analysis' },
      { topic: 'Critical points and extrema', where: 'Chapter 2 Calculus', why: 'The derivative test ($f\'(c) = 0$) is the calculus version of the sign-chart approach used here' },
    ],
  },

  assessment: [
    {
      question: 'Does $f(x) = \\dfrac{x^2-9}{x-3}$ have a hole or VA at $x=3$?',
      answer: 'Hole: $(x-3)$ cancels. $\\lim_{x \\to 3} f(x) = 6$. Hole at $(3, 6)$.',
      difficulty: 'quick-fire',
    },
    {
      question: 'What is the HA of $f(x) = \\dfrac{3x^2 + 1}{x^2 - 5}$?',
      answer: '$y = 3$ (equal degrees; ratio of leading coefficients $= 3/1$).',
      difficulty: 'quick-fire',
    },
    {
      question: 'A polynomial $f(x) = -2x^5 + \\cdots$. Describe its end behaviour.',
      answer: 'Odd degree, negative leading coefficient: left $\\to +\\infty$, right $\\to -\\infty$.',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Factor first. What cancels → hole. What remains in denominator → VA.',
    'HA: count degrees. Lower numerator → $y=0$. Equal → ratio. Higher → no HA (check oblique).',
    'End behaviour is controlled entirely by the leading term — everything else is negligible at infinity.',
    'Absolute extrema on $[a,b]$: evaluate at every local extremum AND both endpoints; compare all values.',
    'Difference quotient = average rate of change. As gap shrinks to zero, it becomes the derivative.',
  ],

  quiz: [
    {
      id: 'pc1-003-q1',
      type: 'choice',
      text: 'What is the end behaviour of $f(x) = -3x^4 + 5x^2 - 1$?',
      options: [
        'Left $\\to -\\infty$, right $\\to +\\infty$',
        'Both ends $\\to +\\infty$',
        'Both ends $\\to -\\infty$',
        'Left $\\to +\\infty$, right $\\to -\\infty$',
      ],
      answer: 'Both ends $\\to -\\infty$',
      hints: [
        'Check the leading term: $-3x^4$. Even degree, negative coefficient.',
        'Even degree → both ends same direction. Negative coefficient → both ends go down ($-\\infty$).',
      ],
      reviewSection: 'Math tab — polynomial end behaviour',
    },
    {
      id: 'pc1-003-q2',
      type: 'choice',
      text: 'For $f(x) = \\dfrac{(x-2)(x+3)}{(x-2)(x-5)}$, what is at $x = 2$?',
      options: ['Vertical asymptote', 'Horizontal asymptote', 'Hole', 'Zero'],
      answer: 'Hole',
      hints: [
        'Check if the factor $(x-2)$ appears in both numerator and denominator.',
        'It cancels → hole. The limit exists at $x=2$ but $f(2)$ is undefined.',
      ],
      reviewSection: 'Rigor tab — asymptote and hole analysis',
    },
    {
      id: 'pc1-003-q3',
      type: 'choice',
      text: 'What is the horizontal asymptote of $f(x) = \\dfrac{5x^3 - 2}{x^3 + 1}$?',
      options: ['$y = 0$', '$y = 5$', '$y = -2$', 'No horizontal asymptote'],
      answer: '$y = 5$',
      hints: [
        'Compare degrees: numerator and denominator both degree 3 — equal.',
        'HA = ratio of leading coefficients: $\\frac{5}{1} = 5$.',
      ],
      reviewSection: 'Intuition tab — horizontal asymptote degree rule',
    },
    {
      id: 'pc1-003-q4',
      type: 'choice',
      text: 'For $f(x) = \\dfrac{2x^2}{x - 1}$, what type of asymptote exists as $x \\to \\pm\\infty$?',
      options: ['Horizontal', 'Oblique', 'Vertical', 'None'],
      answer: 'Oblique',
      hints: [
        'Numerator degree (2) exceeds denominator degree (1) by exactly 1 → oblique asymptote.',
        'Perform long division to find it.',
      ],
      reviewSection: 'Intuition tab — oblique asymptote',
    },
    {
      id: 'pc1-003-q5',
      type: 'input',
      text: 'Find the vertical asymptotes of $f(x) = \\dfrac{x+1}{x^2 - 4}$.',
      answer: 'x = 2 and x = -2',
      hints: [
        'Factor the denominator: $x^2 - 4 = (x-2)(x+2)$.',
        'Check: does $(x+1)$ cancel with either factor? No. So both give VAs: $x = 2$ and $x = -2$.',
      ],
      reviewSection: 'Rigor tab — asymptote and hole analysis',
    },
    {
      id: 'pc1-003-q6',
      type: 'choice',
      text: 'On the closed interval $[-3, 4]$, where must you check for the absolute maximum of $f$?',
      options: [
        'Only at interior local maxima',
        'Only at the endpoints $x = -3$ and $x = 4$',
        'At all local extrema in $(-3, 4)$ AND at the endpoints',
        'At the midpoint only',
      ],
      answer: 'At all local extrema in $(-3, 4)$ AND at the endpoints',
      hints: [
        'The Extreme Value Theorem: on a closed interval, absolute extrema occur at local extrema or endpoints.',
        'You cannot skip the endpoints — the absolute max might occur there even if there is a large local max inside.',
      ],
      reviewSection: 'Math tab — relative vs absolute extrema',
    },
    {
      id: 'pc1-003-q7',
      type: 'choice',
      text: 'A curve is concave down on an interval. What does this mean visually?',
      options: [
        'The curve is decreasing',
        'The curve bends upward like a cup',
        'The chord between any two points on the curve lies below the curve',
        'The chord between any two points on the curve lies above the curve',
      ],
      answer: 'The chord between any two points on the curve lies below the curve',
      hints: [
        'Concave up = cup (chord above curve). Concave down = cap/hill (chord below curve).',
        'Concave down means the curve is "bending downward" — like the top of a hill.',
      ],
      reviewSection: 'Math tab — concavity definition',
    },
    {
      id: 'pc1-003-q8',
      type: 'input',
      text: 'What is the $y$-value of the hole in $f(x) = \\dfrac{x^2 - 9}{x - 3}$?',
      answer: '6',
      hints: [
        'Factor: $x^2-9 = (x-3)(x+3)$. Cancel $(x-3)$: simplified function is $x+3$.',
        'Hole location: substitute $x = 3$ into $x + 3$: $3 + 3 = 6$.',
      ],
      reviewSection: 'Examples tab — hole vs vertical asymptote',
    },
    {
      id: 'pc1-003-q9',
      type: 'choice',
      text: 'The difference quotient $\\frac{f(x+h)-f(x)}{h}$ represents what as $h \\to 0$?',
      options: [
        'The average rate of change over $[x, x+h]$',
        'The instantaneous rate of change (derivative) at $x$',
        'The $y$-intercept of $f$',
        'The average value of $f$ on $[x, x+h]$',
      ],
      answer: 'The instantaneous rate of change (derivative) at $x$',
      hints: [
        'For finite $h$, the difference quotient is the average rate of change.',
        'As $h \\to 0$, the interval shrinks to a point — the average becomes instantaneous.',
      ],
      reviewSection: 'Math tab — secant-to-tangent bridge',
    },
    {
      id: 'pc1-003-q10',
      type: 'choice',
      text: 'For $f(x) = \\dfrac{4x + 1}{2x^2 - 3}$, what is the horizontal asymptote?',
      options: ['$y = 2$', '$y = 0$', '$y = \\frac{1}{2}$', 'No horizontal asymptote'],
      answer: '$y = 0$',
      hints: [
        'Numerator degree: 1. Denominator degree: 2. Numerator degree is less.',
        'When numerator degree < denominator degree, the HA is $y = 0$.',
      ],
      reviewSection: 'Intuition tab — horizontal asymptote degree rule',
    },
  ],
}
