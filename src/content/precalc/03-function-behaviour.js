export default {
  id: 'ch1-graphs-003',
  slug: 'function-behaviour',
  chapter: 'precalc-1',
  order: 3,
  title: 'Function Behaviour: Reading a Graph Before You Draw It',
  subtitle: 'Asymptotes, end behaviour, extrema, and concavity — the full story a graph tells',
  tags: ['asymptotes', 'end behaviour', 'holes', 'increasing decreasing', 'concavity', 'relative maxima', 'absolute maxima', 'extrema'],
  aliases: 'vertical asymptote horizontal asymptote oblique slant asymptote hole removable discontinuity end behavior dominant term local max min global extrema concavity inflection',

  hook: {
    question: 'What can you say about a function\'s graph before plotting a single point? More than you think.',
    realWorldContext: 'A structural engineer reading a stress-displacement curve looks for where the function flattens (approaching a limit), where it spikes (local maxima — dangerous), and whether it eventually comes back down (end behaviour). These are asymptote, extrema, and end behaviour questions. In control systems, asymptotic behaviour determines whether a system stabilizes or diverges. Reading these features directly from the formula is a core engineering skill.',
  },

  intuition: {
    prose: [
      'A **vertical asymptote** is a value of $x$ the function can\'t cross — the output escapes to $\\pm\\infty$. It happens when the denominator approaches zero while the numerator doesn\'t. Think of it as a wall the graph runs alongside but never touches.',
      'A **horizontal asymptote** describes where the function settles as $x \\to \\pm\\infty$. It\'s determined by which term in the function dominates for large $|x|$. The function gets arbitrarily close to the asymptote but may cross it at finite values (unlike vertical asymptotes, which are never crossed).',
      'A **hole** (removable discontinuity) looks like a vertical asymptote algebraically — the denominator is zero — but the numerator is *also* zero at the same point, and the factors cancel. What remains after cancellation is the actual behaviour. The original function has a missing point; the simplified version fills it in.',
      '**Relative (local) extrema** are peaks and valleys — points where the function changes from increasing to decreasing or vice versa. **Absolute (global) extrema** are the highest and lowest values over the entire domain or a closed interval. A relative maximum is not necessarily the absolute maximum.',
      '**Concavity** describes whether the graph curves upward (concave up, holds water) or downward (concave down, spills water). This is about whether the *rate of change* itself is increasing or decreasing — a second-order property that becomes formally defined via the second derivative in calculus.',
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
    ],
    visualizations: [
      {
        id: 'FunctionBehaviourViz',
        title: 'Asymptotes, Holes, and End Behaviour Live',
        mathBridge: 'Switch between functions and see vertical asymptotes (walls), holes (missing points), horizontal asymptotes (long-run levels), and oblique asymptotes (diagonal approach).',
        caption: 'Each type of asymptote corresponds to a different algebraic condition in the formula.',
      },
      {
        id: 'VideoEmbed',
        title: 'Even Odd Polynomial Functions & Symmetry',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Even and Odd Functions Many Examples',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Horizontal Asymptotes of Rational Equations',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Graphing Rational Functions with Slant Asymptotes',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Finding vertical asymptotes and holes of rational equations',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Determining Domain of Functions',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Domain of Rational Functions & Decomposing Functions',
        props: { url: "" },
      },
    ],
  },

  math: {
    prose: [
      'Finding asymptotes algebraically is systematic. **Vertical**: factor denominator, find zeros, check if numerator is also zero there (hole) or not (asymptote). **Horizontal**: compare leading degrees as above. **Oblique**: polynomial long division when numerator degree exceeds denominator degree by exactly 1.',
      '**End behaviour** for polynomials is determined entirely by the leading term. For $f(x) = a_n x^n + \\cdots$: if $n$ is even, both ends go the same direction (up if $a_n > 0$, down if $a_n < 0$). If $n$ is odd, the ends go opposite directions.',
      '**Increasing and decreasing** without calculus: a function is increasing where higher $x$ gives higher $f(x)$. Graphically, the function rises left-to-right. These intervals are often identifiable from factored forms and sign analysis.',
      '**Extrema vocabulary precision**: A *relative (local) maximum* at $c$ means $f(c) \\geq f(x)$ for all $x$ near $c$. An *absolute (global) maximum* means $f(c) \\geq f(x)$ for all $x$ in the domain. Every absolute max is also a local max, but not vice versa. On a closed interval $[a,b]$, the absolute extrema occur either at local extrema *or* at the endpoints — never forget the endpoints.',
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
        id: 'AsymptoteTypesViz',
        title: 'Three Asymptote Types Side by Side',
        mathBridge: 'Vertical: denominator $\\to 0$, numerator $\\not\\to 0$. Horizontal: degree comparison. Oblique: long division remainder.',
        caption: 'Each asymptote type has a different geometric meaning and a different algebraic detection method.',
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
