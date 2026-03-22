export default {
  id: 'ch2-alg-004',
  slug: 'rational-expressions-partial-fractions',
  chapter: 'precalc-2',
  order: 4,
  title: 'Rational Expressions & Partial Fractions',
  subtitle: 'Simplifying, operating, and decomposing — the algebra calculus uses to integrate',
  tags: ['rational expressions', 'partial fractions', 'simplify', 'add fractions', 'decomposition'],
  aliases: 'rational expression simplify multiply divide add subtract partial fraction decomposition integration algebra',

  hook: {
    question: 'How do you integrate $\\dfrac{1}{x^2 - 1}$? You cannot directly. But if you split it into $\\dfrac{1/2}{x-1} - \\dfrac{1/2}{x+1}$, each piece integrates to a $\\ln$. That splitting is partial fractions — and it is pure algebra.',
    realWorldContext: 'Partial fractions are used in control systems engineering to analyse the step response of a transfer function — breaking a complex rational function into simple poles that each contribute a decaying exponential. In signals processing, every filter response is a rational function that gets decomposed this way.',
  },

  intuition: {
    prose: [
      'A rational expression is a fraction where numerator and denominator are polynomials. They behave exactly like numeric fractions — same rules for multiplying, dividing, adding, subtracting. The only new complication is that you must track which values make the denominator zero (the domain restrictions).',
      'Partial fraction decomposition is the reverse of adding fractions. When you add $\\frac{A}{x-1} + \\frac{B}{x+1}$, you get a single fraction over $(x-1)(x+1)$. Partial fractions asks: given that combined fraction, recover the $A$ and $B$. The technique: multiply both sides by the denominator, then solve for the coefficients.',
      'The key insight: a fraction with a linear factor in the denominator integrates to a logarithm. A fraction with a repeated or quadratic factor needs different forms. Decomposing into these simple pieces is exactly what makes integration possible.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Partial fraction forms — matched to denominator factors',
        body: '\\frac{\\text{numerator}}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b} \\\\ \\frac{\\text{num}}{(x-a)^2} = \\frac{A}{x-a} + \\frac{B}{(x-a)^2} \\\\ \\frac{\\text{num}}{(x^2+bx+c)} = \\frac{Ax+B}{x^2+bx+c} \\quad (\\text{irreducible quadratic})',
      },
      {
        type: 'warning',
        title: 'Must be proper first',
        body: '\\text{If } \\deg(\\text{numerator}) \\geq \\deg(\\text{denominator}): \\text{ do polynomial long division first.} \\\\ \\text{Partial fractions only work on proper fractions (top degree < bottom degree).}',
      },
      {
        type: 'insight',
        title: 'The Heaviside cover-up method (for distinct linear factors)',
        body: '\\frac{f(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b} \\\\ A = \\lim_{x\\to a}(x-a)\\cdot f(x)/\\text{denom} = f(a)/[(a-b)] \\\\ \\text{Cover the }(x-a)\\text{ factor, plug in }x=a\\text{ — that\'s }A.',
      },
    ],
    visualizations: [
      {
        id: 'PartialFractionViz',
        title: 'Decomposing a Fraction — Forward and Backward',
        mathBridge: 'See both directions: adding two simple fractions to get a combined one, and decomposing the combined one back. Adjust $A$ and $B$ to match a target.',
        caption: 'Partial fractions is fraction addition in reverse — we\'re finding the addends, not the sum.',
      },
      {
        id: 'VideoEmbed',
        title: 'Partial Fraction Decomposition Part 1',
        props: { url: 'https://www.youtube.com/embed/q9nZeNKpm3o' },
      },
      {
        id: 'VideoEmbed',
        title: 'Partial Fractions Decomposition Part 2',
        props: { url: 'https://www.youtube.com/embed/3qo527nyiaY' },
      },
    ],
  },

  math: {
    prose: [
      'The procedure for partial fractions: (1) ensure the fraction is proper; (2) factor the denominator completely; (3) set up the partial fraction template matching each factor type; (4) multiply through by the denominator to clear all fractions; (5) solve the resulting system for the unknown coefficients.',
      'Operations on rational expressions follow the same rules as numeric fractions. For multiplication: multiply numerators and denominators, then cancel common factors. For division: multiply by the reciprocal. For addition: find a common denominator, convert, then add numerators. Always state domain restrictions.',
      'A rational expression is undefined wherever the denominator is zero. After simplification (cancellation), a hole appears where the cancelled factor was zero — the domain restriction remains even though the expression looks defined there.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Operations on rational expressions',
        body: '\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd} \\qquad \\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c} \\\\ \\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd} \\quad (\\text{then simplify})',
      },
      {
        type: 'theorem',
        title: 'The cover-up method — worked',
        body: '\\frac{3x+1}{(x-2)(x+3)} = \\frac{A}{x-2} + \\frac{B}{x+3} \\\\ A = \\frac{3(2)+1}{(2+3)} = \\frac{7}{5} \\quad B = \\frac{3(-3)+1}{(-3-2)} = \\frac{-8}{-5} = \\frac{8}{5}',
      },
    ],
  },

  rigor: {
    title: 'Full partial fraction decomposition: $\\dfrac{5x-3}{x^2+x-2}$',
    proofSteps: [
      {
        expression: 'x^2+x-2 = (x+2)(x-1) \\qquad \\text{(factor denominator first)}',
        annotation: 'Always factor before anything else.',
      },
      {
        expression: '\\frac{5x-3}{(x+2)(x-1)} = \\frac{A}{x+2} + \\frac{B}{x-1}',
        annotation: 'Set up the template: one term per distinct linear factor.',
      },
      {
        expression: '5x - 3 = A(x-1) + B(x+2)',
        annotation: 'Multiply both sides by $(x+2)(x-1)$.',
      },
      {
        expression: 'x=1: \\; 2 = 3B \\Rightarrow B = \\tfrac{2}{3} \\qquad x=-2: \\; -13 = -3A \\Rightarrow A = \\tfrac{13}{3}',
        annotation: 'Substitute the roots of each factor to isolate $A$ and $B$ — the cover-up method generalised.',
      },
      {
        expression: '\\frac{5x-3}{x^2+x-2} = \\frac{13/3}{x+2} + \\frac{2/3}{x-1} \\qquad \\blacksquare',
        annotation: 'Verify by adding the two fractions back together. The calculus payoff: $\\int \\frac{5x-3}{x^2+x-2}\\,dx = \\tfrac{13}{3}\\ln|x+2| + \\tfrac{2}{3}\\ln|x-1| + C$.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-004-ex1',
      title: 'Simplifying a rational expression',
      problem: '\\text{Simplify: } \\dfrac{x^2-9}{x^2+x-6}',
      steps: [
        { expression: '= \\dfrac{(x-3)(x+3)}{(x-2)(x+3)}', annotation: 'Factor numerator (difference of squares) and denominator (trinomial).' },
        { expression: '= \\dfrac{x-3}{x-2} \\quad (x \\neq -3)', annotation: 'Cancel the common factor $(x+3)$. Domain restriction: $x \\neq -3$ and $x \\neq 2$.' },
      ],
      conclusion: 'The restriction $x \\neq -3$ remains even after cancellation — there is a hole in the graph at $x = -3$.',
    },
    {
      id: 'ch2-004-ex2',
      title: 'Adding rational expressions with different denominators',
      problem: '\\text{Simplify: } \\dfrac{3}{x-1} + \\dfrac{2x}{x^2-1}',
      steps: [
        { expression: 'x^2-1 = (x-1)(x+1)', annotation: 'Factor the second denominator. The LCD is $(x-1)(x+1)$.' },
        { expression: '= \\dfrac{3(x+1)}{(x-1)(x+1)} + \\dfrac{2x}{(x-1)(x+1)}', annotation: 'Convert first fraction to have LCD.' },
        { expression: '= \\dfrac{3x+3+2x}{(x-1)(x+1)} = \\dfrac{5x+3}{x^2-1}', annotation: 'Add numerators. Cannot simplify further (check: $5x+3$ has no common factor with $x^2-1$).' },
      ],
      conclusion: 'LCD approach: factor all denominators, identify the LCD, convert, then add numerators.',
    },
  ],

  challenges: [
    {
      id: 'ch2-004-ch1',
      difficulty: 'hard',
      problem: '\\text{Decompose: } \\dfrac{x^2+2x-1}{(x-1)(x^2+1)}',
      hint: 'The $x^2+1$ factor is an irreducible quadratic — its partial fraction form is $(Ax+B)/(x^2+1)$, not $A/(x^2+1)$.',
      walkthrough: [
        { expression: '= \\dfrac{C}{x-1} + \\dfrac{Ax+B}{x^2+1}', annotation: 'Template: linear factor gets a constant numerator; irreducible quadratic gets a linear numerator.' },
        { expression: 'x=1: \\; 2 = 2C \\Rightarrow C=1', annotation: 'Cover-up for the linear factor.' },
        { expression: 'x=0: \\; -1 = -C + B \\Rightarrow B=0. \\quad x=-1: \\; -2 = -C/2 + (-A+B)/2 \\Rightarrow A=1', annotation: 'Substitute convenient values to find $A$ and $B$.' },
        { expression: '= \\dfrac{1}{x-1} + \\dfrac{x}{x^2+1}', annotation: 'Verify by recombining. The second term integrates to $\\tfrac{1}{2}\\ln(x^2+1)$ in calculus.' },
      ],
      answer: '\\dfrac{1}{x-1} + \\dfrac{x}{x^2+1}',
    },
  ],

  calcBridge: {
    teaser: 'Every partial fraction decomposition converts an unapproachable rational integral into a sum of $\\ln$ and $\\arctan$ integrals — the two standard forms. This is literally how a computer algebra system integrates rational functions.',
    linkedLessons: ['logarithm-relationships', 'trig-identities-deep-dive'],
  },
}
