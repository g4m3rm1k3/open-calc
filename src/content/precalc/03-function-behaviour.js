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
    realWorldContext: 'In **Computer Science**, "Big-O Notation" is just a study of end behavior: which algorithm wins as $x$ gets huge? In **Mechanical Engineering**, a vertical asymptote is a "Resonance Spike"—the point where a bridge or engine vibrates so hard it might break. In **Medicine**, your body reaches a "Steady State" concentration of a drug—that level is a horizontal asymptote. Understanding behaviour means you can see the destiny of a system before you even start the simulation.',
  },

  intuition: {
    prose: [
      'A graph is more than a simple set of points; it is a **Topography** of constraints, trends, and future destinies. To understand a system, we must look at its edges and its most extreme states.',
      '**Vertical Asymptotes (The "No-Go" Zone)**: Imagine trying to draw more current from a battery than it can physically provide. As you approach that theoretical limit, the heat and resistance "blow up" to infinity. In math, this is a Vertical Asymptote—a value of $x$ the universe cannot satisfy, where the formula "explodes" into a local singularity.',
      '**Horizontal Asymptotes (The Cruise Level)**: Think of an airplane reaching its cruising altitude, or a population in a forest reaching its "Carrying Capacity." No matter how fast things move initially, the system eventually settles into a steady state. This "settling point" is the Horizontal Asymptote—the value the function approaches as time ($x$) moves toward infinity.',
      '**Inc/Dec and Extreme States**: A function reaches **Extrema** at its local maxima and minima. In physics, these are points of **Potential Energy** peaks or stable/unstable **Equilibria**. Identifying where the system switches between growth (Increasing) and decay (Decreasing) is the key to optimizing any process.',
      '**Concavity (The Quality of Change)**: Concavity is about the "bend." A path that is **Concave Up** is "holding" its value (like a cup), while one that is **Concave Down** is "shedding" its value. The point where the bend switches—an **Inflection Point**—is the exact moment the system undergoes a fundamental change in acceleration or momentum.',
    ],
    callouts: [
          {
        type: 'definition',
        title: 'Vertical asymptote vs hole — the deciding test',
        body: '\\text{If } \\lim_{x \\to c} f(x) = \\pm\\infty \\Rightarrow \\text{vertical asymptote at } x = c \\\\ \\text{If } \\lim_{x \\to c} f(x) = L \\text{ (finite) but } f(c) \\text{ undefined} \\Rightarrow \\text{hole at } (c, L)',
      },
      {
        type: 'theorem',
        title: 'Horizontal asymptote: the degree comparison rule',
        body: '\\frac{p(x)}{q(x)}: \\quad \\deg p < \\deg q \\Rightarrow y=0 \\quad \\deg p = \\deg q \\Rightarrow y = \\frac{\\text{leading coeff of }p}{\\text{leading coeff of }q} \\quad \\deg p > \\deg q \\Rightarrow \\text{no HA (check for oblique)}',
      },
      {
        type: 'insight',
        title: 'Oblique (slant) asymptote — when the numerator wins by exactly one degree',
        body: '\\text{If } \\deg p = \\deg q + 1\\text{, perform polynomial long division: } \\frac{p(x)}{q(x)} = (mx+b) + \\frac{r(x)}{q(x)} \\\\ \\text{The oblique asymptote is } y = mx + b. \\text{ The remainder term } \\to 0.',
      },
      {
        type: 'insight',
        title: 'Cognitive Framing: The Two Limits',
        body: '\\text{Local (VA): "Where can we never go?"} \\\\ \\text{Global (HA): "Where are we settling in the end?"}',
      },
      {
        type: 'definition',
        title: 'The Hole vs. The Spike',
        body: '\\text{Hole (Removable): } \\frac{0}{0} \\text{ (The problem cancels, leaving a missing point).} \\\\ \\text{VA (Non-Removable): } \\frac{const}{0} \\text{ (The problem explodes to infinity).}',
      },
      {
        type: 'insight',
        title: 'Points of Equilibrium',
        body: '\\text{Local Max: Stable outcome peak.} \\\\ \\text{Local Min: Stable outcome valley.}',
      },
    ],
    visualizations: [
      {
        id: 'FunctionBehaviourViz',
        title: 'The Topography of Change',
        mathBridge: 'Observe how the Horizontal Asymptote represents the "Long Term" destiny while the Vertical Asymptotes represent "Instant Catastrophe." Switching between types shows how algebraic constraints manifest as physical boundaries.',
        caption: 'Geometry is the manifestation of algebraic constraints.',
      },
            {
        id: 'FunctionBehaviourViz',
        title: 'Asymptotes, Holes, and End Behaviour Live',
        mathBridge: 'Switch between functions and see vertical asymptotes (walls), holes (missing points), horizontal asymptotes (long-run levels), and oblique asymptotes (diagonal approach).',
        caption: 'Each type of asymptote corresponds to a different algebraic condition in the formula.',
      },
    ],
  },

  math: {
    prose: [
      'The "personality" of a function is defined by its boundary behavior and its rate of change. We use the language of **Limits** to describe these boundaries with infinite precision.',
      '**The Limit at Infinity (End Behaviour)**: $\\lim_{x \\to \\pm\\infty} f(x) = L$. This tells us where the system settles in the long run. If the leading terms of the numerator and denominator have equal degree, the system converges to a **Horizontal Asymptote**.',
      '**Local Infinite Limits (Vertical Asymptotes)**: $\\lim_{x \\to c} f(x) = \\pm\\infty$. This occurs when the denominator hits zero but the numerator is non-zero. The system "explodes" at this coordinate.',
      '**Rate of Change (The Difference Quotient)**: To measure the "Flow" between two points $(x, f(x))$ and $(x+h, f(x+h))$, we use the slope $\\frac{f(x+h) - f(x)}{h}$. This is the average change over a span $h$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Asymptotic Rule of Dominance',
        body: 'f(x) = \\frac{a_x^n}{b_x^m} \\\\ n < m \\implies y=0 \\\\ n = m \\implies y = a/b \\\\ n > m \\implies \\text{Diverges (Slant/Oblique)}',
      },
      {
        type: 'definition',
        title: 'Formal Limit Definitions',
        body: '\\text{VA at } c \\iff \\lim_{x \\to c} f(x) = \\infty \\\\ \\text{HA at } L \\iff \\lim_{x \\to \\infty} f(x) = L',
      },
      {
        type: 'theorem',
        title: 'The Secant-to-Tangent Bridge',
        body: '\\frac{f(x+h) - f(x)}{h} \\xrightarrow{h \\to 0} f\'(x)',
      },
            {
        type: 'theorem',
        title: 'Polynomial end behaviour — the leading term rules',
        body: 'f(x) = a_n x^n + \\cdots: \\\\ n \\text{ even}, a_n>0: \\text{ both ends } \\to +\\infty \\quad (\\text{U-shape}) \\\\ n \\text{ even}, a_n<0: \\text{ both ends } \\to -\\infty \\quad (\\text{∩-shape}) \\\\ n \\text{ odd}, a_n>0: \\text{ left}\\to-\\infty,\\text{ right}\\to+\\infty \\\\ n \\text{ odd}, a_n<0: \\text{ left}\\to+\\infty,\\text{ right}\\to-\\infty',
      },
      {
        type: 'definition',
        title: 'Relative vs absolute extrema — precise definitions',
        body: '\\text{Relative max at } c: f(c) \\geq f(x) \\text{ for } x \\text{ near } c \\\\ \\text{Absolute max at } c: f(c) \\geq f(x) \\text{ for ALL } x \\in \\text{domain} \\\\ \\text{On } [a,b]: \\text{ absolute extrema occur at local extrema or at endpoints } a, b',
      },
      {
        type: 'definition',
        title: 'Concavity — without calculus',
        body: '\\text{Concave up on } I: \\text{ the chord between any two points on the graph lies ABOVE the graph} \\\\ \\text{Concave down on } I: \\text{ the chord lies BELOW the graph} \\\\ \\text{Inflection point: where concavity changes}',
      },
      {
        type: 'insight',
        title: 'The sign chart — your pre-calculus tool for behaviour',
        body: '\\text{Factor } f(x). \\text{ Mark zeros and undefined points on a number line.} \\\\ \\text{Test each interval: positive} \\to \\text{above axis, negative} \\to \\text{below.} \\\\ \\text{This reveals where } f > 0, f < 0 \\text{ without graphing.}',
      },
    ],
    visualizations: [
          {
        type: 'theorem',
        title: 'Polynomial end behaviour — the leading term rules',
        body: 'f(x) = a_n x^n + \\cdots: \\\\ n \\text{ even}, a_n>0: \\text{ both ends } \\to +\\infty \\quad (\\text{U-shape}) \\\\ n \\text{ even}, a_n<0: \\text{ both ends } \\to -\\infty \\quad (\\text{∩-shape}) \\\\ n \\text{ odd}, a_n>0: \\text{ left}\\to-\\infty,\\text{ right}\\to+\\infty \\\\ n \\text{ odd}, a_n<0: \\text{ left}\\to+\\infty,\\text{ right}\\to-\\infty',
      },
      {
        type: 'definition',
        title: 'Relative vs absolute extrema — precise definitions',
        body: '\\text{Relative max at } c: f(c) \\geq f(x) \\text{ for } x \\text{ near } c \\\\ \\text{Absolute max at } c: f(c) \\geq f(x) \\text{ for ALL } x \\in \\text{domain} \\\\ \\text{On } [a,b]: \\text{ absolute extrema occur at local extrema or at endpoints } a, b',
      },
      {
        type: 'definition',
        title: 'Concavity — without calculus',
        body: '\\text{Concave up on } I: \\text{ the chord between any two points on the graph lies ABOVE the graph} \\\\ \\text{Concave down on } I: \\text{ the chord lies BELOW the graph} \\\\ \\text{Inflection point: where concavity changes}',
      },
      {
        type: 'insight',
        title: 'The sign chart — your pre-calculus tool for behaviour',
        body: '\\text{Factor } f(x). \\text{ Mark zeros and undefined points on a number line.} \\\\ \\text{Test each interval: positive} \\to \\text{above axis, negative} \\to \\text{below.} \\\\ \\text{This reveals where } f > 0, f < 0 \\text{ without graphing.}',
      },
      {
        id: 'SecantLineViz',
        title: 'The Anatomy of Change',
        mathBridge: 'Observe how the blue Secant line (Average Change) collapses into the red Tangent line (Instantaneous Change) as $h$ shrinks. This limit is the foundation of all modern physics.',
        caption: 'Limits turn approximate spans into exact moments.',
      },
    ],
  },

  rigor: {
    title: 'The Calculus of Change',
    prose: [
      'The Difference Quotient is the "seed" of the derivative. We simplify it until the $h$ in the denominator—the "span"—is removed, allowing us to find the change at a single point.'
    ],
    proofSteps: [
      {
        expression: '\\frac{f(x+h) - f(x)}{h} = \\frac{(x+h)^2 + 3(x+h) - (x^2 + 3x)}{h}',
        annotation: 'Step 1: Evaluate the function at $(x+h)$ for $f(x)=x^2+3x$.'
      },
      {
        expression: '\\frac{x^2 + 2xh + h^2 + 3x + 3h - x^2 - 3x}{h}',
        annotation: 'Step 2: Expand and distribute. This reveals the "Net Change" in the numerator.'
      },
      {
        expression: '\\frac{2xh + h^2 + 3h}{h} = \\frac{h(2x + h + 3)}{h}',
        annotation: 'Step 3: Factor out the common $h$.'
      },
      {
        expression: '2x + 3 + h \\xrightarrow{h \\to 0} 2x + 3',
        annotation: 'Step 4: Cancel $h$. As the span vanishes, the instantaneous growth rate is revealed.'
      }
    ]
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
        annotation: 'After cancellation, substitute $x=-2$. Hole is at $(-2, 5/4)$.',
      },
      {
        expression: '\\text{At } x = 2: \\text{ denominator } = 0, \\text{ numerator } = \\frac{-1}{0} \\Rightarrow \\text{vertical asymptote at } x=2',
        annotation: 'Factor $(x-2)$ does not cancel. The function diverges at $x=2$.',
      },
      {
        expression: '\\deg(\\text{num}) = \\deg(\\text{denom}) = 2 \\Rightarrow y = \\frac{1}{1} = 1',
        annotation: 'Equal degrees: horizontal asymptote is ratio of leading coefficients. Both lead with 1.',
      },
      {
        expression: '\\text{Summary: VA at } x=2,\\text{ hole at }(-2,\\tfrac{5}{4}),\\text{ HA at } y=1',
        annotation: 'One function — three different types of interesting behaviour, all from factoring.',
      },
    ],
  },


  examples: [
    {
      id: 'ex-lim-hole',
      title: 'Algebra: The Hole vs. The Spike',
      problem: '\\text{Identify the behavior of } f(x) = \\frac{x^2 - 4}{x - 2} \\text{ at } x=2.',
      steps: [
        {
          expression: 'f(2) = \\frac{2^2 - 4}{2 - 2} = \\frac{0}{0}',
          annotation: 'Step 1: Evaluation results in an indeterminate form.'
        },
        {
          expression: '\\frac{(x-2)(x+2)}{x-2} = x + 2',
          annotation: 'Step 2: Factor the numerator. The $(x-2)$ term cancels.'
        },
        {
          expression: '\\lim_{x \\to 2} (x+2) = 4',
          annotation: 'Step 3: Evaluation of the simplified limit.'
        }
      ],
      conclusion: 'Since the limit exists but the function is undefined at $x=2$, the graph has a **Hole** (Removable Discontinuity) at (2, 4).'
    },
    {
      id: 'ex-bio-capacity',
      title: 'Applied: Population Carrying Capacity',
      problem: '\\text{A bacteria colony grows by } P(t) = \\frac{5000t}{t + 2}. \\text{ Find the long-term stable population.}',
      steps: [
        {
          expression: '\\lim_{t \\to \\infty} \\frac{5000t}{t+2}',
          annotation: 'Examine the behavior as time grows without bound.'
        },
        {
          expression: '\\frac{5000t}{t} = 5000',
          annotation: 'The $+2$ becomes insignificant compared to $t$.'
        }
      ],
      conclusion: 'The system settles at a **Horizontal Asymptote** of 5000 organisms.'
    },
        {
      id: 'ch1-003-ex1',
      title: 'Finding the oblique asymptote',
      problem: '\\text{Find all asymptotes of } f(x) = \\dfrac{x^2 + 3x - 2}{x - 1}.',
      steps: [
        {
          expression: '\\deg(\\text{num})=2,\\ \\deg(\\text{denom})=1 \\Rightarrow \\text{oblique asymptote (no HA)}',
          annotation: 'Numerator degree exceeds denominator by exactly 1 — oblique asymptote exists.',
        },
        {
          expression: '\\frac{x^2+3x-2}{x-1} = x + 4 + \\frac{2}{x-1}',
          annotation: 'Polynomial long division. The remainder $\\frac{2}{x-1} \\to 0$ as $x \\to \\pm\\infty$.',
        },
        {
          expression: '\\text{Oblique asymptote: } y = x + 4 \\qquad \\text{Vertical asymptote: } x = 1',
          annotation: 'The function approaches the line $y = x+4$ at both ends. Vertical asymptote where denominator is zero (check numerator: $1+3-2=2 \\neq 0$ ✓).',
        },
      ],
      conclusion: 'Long division always reveals the oblique asymptote. The remainder terms are what the function does *differently* from its asymptotic behaviour.',
    },
    {
      id: 'ch1-003-ex2',
      title: 'Identifying all extrema on a closed interval',
      problem: '\\text{Find absolute extrema of } f(x) = x^3 - 3x \\text{ on } [-2, 3].',
      steps: [
        {
          expression: 'f(-2) = -8+6 = -2 \\quad f(3) = 27-9 = 18',
          annotation: 'Always evaluate endpoints first on a closed interval.',
        },
        {
          expression: '\\text{Local extrema of } x^3-3x \\text{ occur at } x=\\pm 1 \\text{ (by sign analysis or factoring)}',
          annotation: 'Between the endpoints, local extrema occur at $x=-1$ (local max) and $x=1$ (local min).',
        },
        {
          expression: 'f(-1) = -1+3 = 2 \\quad f(1) = 1-3 = -2',
          annotation: 'Evaluate at candidate interior points.',
        },
        {
          expression: '\\text{Values: } f(-2)=-2,\\ f(-1)=2,\\ f(1)=-2,\\ f(3)=18',
          annotation: 'Compare all candidates. Absolute max is $18$ at $x=3$; absolute min is $-2$ (at both $x=-2$ and $x=1$).',
        },
      ],
      conclusion: 'On a closed interval, always check both interior critical points AND the endpoints. The largest value is the absolute max, the smallest is the absolute min.',
    },
  ],

  challenges: [
    {
      id: 'ch-03-01',
      difficulty: 'medium',
      problem: '\\text{Find the Oblique Asymptote of } f(x) = \\frac{x^2 + 1}{x}.',
      walkthrough: [
        { expression: 'f(x) = x + \\frac{1}{x}', annotation: 'Split the fraction.' },
        { expression: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0', annotation: 'The remainder vanishes at infinity.' }
      ],
      answer: 'y = x'
    },
    {
      id: 'ch-03-02',
      difficulty: 'hard',
      problem: '\\text{Prove that a function can have at most two Horizontal Asymptotes.}',
      answer: '\\text{A function is a mapping where each input has one output. Thus, there are only two directions to "infinity": positive and negative. Each direction can approach only one unique limit.}'
    },
        {
      id: 'ch1-003-ch1',
      difficulty: 'hard',
      problem: '\\text{Completely analyse } f(x) = \\dfrac{2x^2-8}{x^2-9}: \\text{ zeros, holes, VAs, HA, and end behaviour.}',
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
          expression: 'x \\to \\pm\\infty: f(x) \\to \\frac{2x^2}{x^2} = 2 \\text{ from below (test large } x\\text{)}',
          annotation: 'End behaviour confirms the HA at $y=2$. Plugging in $x=100$ gives $f(100) \\approx 1.998 < 2$.',
        },
      ],
      answer: '\\text{Zeros: } \\pm 2.\\text{ VAs: } \\pm 3.\\text{ No holes. HA: } y=2.',
    },
  ],
}
