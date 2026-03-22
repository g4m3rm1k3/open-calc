// FILE: src/content/chapter-4/09-trig-substitution.js
export default {
  id: 'ch4-009',
  slug: 'trig-substitution',
  chapter: 4,
  order: 9,
  title: 'Trigonometric Substitution',
  subtitle: 'Eliminating radicals by substituting x = a·sin θ, a·tan θ, or a·sec θ',
  tags: ['trig substitution', 'radical', 'square root', 'reference triangle', 'sin substitution', 'tan substitution', 'sec substitution'],
  aliases: ['radical integrals strategy', 'when to use trig substitution', 'sqrt a2 minus x2 integral'],

  hook: {
    question: 'How do you integrate √(4 − x²)? No algebraic trick or u-substitution removes the square root. But if you let x = 2 sin θ, then √(4 − x²) = √(4 − 4sin²θ) = 2cos θ — the radical vanishes! The integral becomes a trig integral, which you already know how to solve. Trigonometric substitution is a technique that uses the Pythagorean identity to eliminate radicals.',
    realWorldContext: 'Trig substitution appears whenever geometry meets calculus. Computing the area of an ellipse (∫√(a²−x²) dx) uses the sin substitution and yields πab. Gravitational and electric field calculations involve integrals with √(x²+a²) denominators. Orbital mechanics integrates √(r²−b²) terms for trajectory computations. The arc length of a parabola requires ∫√(1+4x²) dx — a tan substitution. In statistics, normalizing the t-distribution uses ∫(1+x²/n)^(−(n+1)/2) dx, simplified by trig substitution.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      'The idea behind trig substitution is beautifully geometric. Consider $\\sqrt{a^2 - x^2}$. This expression describes the height of a semicircle of radius $a$ at horizontal position $x$. On the unit circle, $\\cos^2\\theta + \\sin^2\\theta = 1$, which means $\\cos\\theta = \\sqrt{1 - \\sin^2\\theta}$. If we set $x = a\\sin\\theta$, then $\\sqrt{a^2 - x^2} = \\sqrt{a^2 - a^2\\sin^2\\theta} = a\\cos\\theta$. The radical is gone — replaced by a trig function.',
      'There are three cases, one for each Pythagorean identity. For $\\sqrt{a^2 - x^2}$: use $x = a\\sin\\theta$ (from $1 - \\sin^2\\theta = \\cos^2\\theta$). For $\\sqrt{a^2 + x^2}$: use $x = a\\tan\\theta$ (from $1 + \\tan^2\\theta = \\sec^2\\theta$). For $\\sqrt{x^2 - a^2}$: use $x = a\\sec\\theta$ (from $\\sec^2\\theta - 1 = \\tan^2\\theta$). Each substitution transforms a radical into a simple trig function.',
      'The reference triangle is your best friend for converting back to $x$. After integrating in $\\theta$, you need to express the answer in terms of $x$. Draw a right triangle where the sides are determined by the substitution. For $x = a\\sin\\theta$: opposite side $= x$, hypotenuse $= a$, so adjacent side $= \\sqrt{a^2-x^2}$. Read off any trig function of $\\theta$ directly from the triangle: $\\cos\\theta = \\sqrt{a^2-x^2}/a$, $\\tan\\theta = x/\\sqrt{a^2-x^2}$, etc.',
      'Do not forget to substitute $dx$ as well. If $x = a\\sin\\theta$, then $dx = a\\cos\\theta\\,d\\theta$. This extra factor is essential — it changes the differential and often simplifies nicely with the radical. The combination of eliminating the radical AND transforming $dx$ usually converts the integral into a standard trig integral from Lesson 8.',
      'Sometimes you need to complete the square before applying trig substitution. For $\\int dx/\\sqrt{x^2 + 6x + 13}$: complete the square to get $x^2 + 6x + 13 = (x+3)^2 + 4$. Now let $u = x + 3$, and the integral becomes $\\int du/\\sqrt{u^2+4}$, which is a standard tan substitution with $u = 2\\tan\\theta$.',
      'A common error is forgetting the domain restrictions on $\\theta$. For $x = a\\sin\\theta$, we restrict $\\theta \\in [-\\pi/2, \\pi/2]$ so that $\\cos\\theta \\geq 0$ and $\\sqrt{a^2-x^2} = a\\cos\\theta$ (not $-a\\cos\\theta$). For $x = a\\tan\\theta$, restrict $\\theta \\in (-\\pi/2, \\pi/2)$ so that $\\sec\\theta > 0$. For $x = a\\sec\\theta$, restrict to $\\theta \\in [0, \\pi/2) \\cup [\\pi, 3\\pi/2)$ depending on the sign of $x$.',
      'For definite integrals, you can either convert the limits to $\\theta$-values (often cleaner) or integrate in $\\theta$, convert back to $x$ using the reference triangle, and evaluate at the original $x$-limits. Converting limits: if $x$ goes from $0$ to $a$ and $x = a\\sin\\theta$, then $\\theta$ goes from $0$ to $\\pi/2$.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Which Substitution to Use',
        body: '• √(a² − x²) → x = a sin θ (think: Pythagorean identity sin²+cos²=1)\n• √(a² + x²) → x = a tan θ (think: 1+tan²=sec²)\n• √(x² − a²) → x = a sec θ (think: sec²−1=tan²)\nMnemonic: the sign between a² and x² determines the identity.',
      },
      {
        type: 'warning',
        title: 'Always Draw the Reference Triangle',
        body: 'After integrating in θ, you must convert back to x. Draw the right triangle: label the sides based on your substitution (e.g., for x = a sin θ: opp = x, hyp = a, adj = √(a²−x²)). Read off cos θ, tan θ, etc. from the triangle. This avoids algebraic errors in back-substitution.',
      },
      {
        type: 'misconception',
        title: 'Trig Sub Is Not Just for Radicals',
        body: 'Trig substitution also works for expressions like 1/(a²+x²)^n without a visible radical. For instance, ∫dx/(1+x²)² is solved by x = tan θ, giving ∫cos²θ dθ. Any expression involving a²±x² or x²−a² (even without a √) can potentially benefit from trig sub.',
      },
      {
        type: 'prior-knowledge',
        title: 'Completing the Square',
        body: 'If the expression under the radical is ax² + bx + c, complete the square first: a(x + b/2a)² + (c − b²/4a). Then let u = x + b/(2a) to put it in standard form (u² ± k²) before applying trig substitution.',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Calculus I - 5.8.1 Inverse Trigonometric Functions: Integration",
        props: { url: "https://www.youtube.com/embed/Fd7incsGR74" }
      },
      {
        id: 'IntegrationMethodLab',
        title: 'Method Selection Trainer',
        caption: 'Mark radical patterns like a^2-x^2 or a^2+x^2 and compare trig substitution against competing techniques.',
      },
      {
        id: 'FunctionPlotter',
        title: 'Trig Substitution Reference Triangles',
        caption: 'Three reference triangles for the three substitution types. For x = a sin θ: the triangle has hypotenuse a, opposite side x, adjacent side √(a²−x²). All trig functions of θ can be read directly from the triangle, enabling back-substitution without memorization.',
      },
    ],
  },

  math: {
    prose: [
      'Case 1: $\\sqrt{a^2 - x^2}$. Let $x = a\\sin\\theta$, $dx = a\\cos\\theta\\,d\\theta$, $\\theta \\in [-\\pi/2, \\pi/2]$. Then $\\sqrt{a^2-x^2} = a\\cos\\theta$. Reference triangle: hyp $= a$, opp $= x$, adj $= \\sqrt{a^2-x^2}$.',
      'Case 2: $\\sqrt{a^2 + x^2}$. Let $x = a\\tan\\theta$, $dx = a\\sec^2\\theta\\,d\\theta$, $\\theta \\in (-\\pi/2, \\pi/2)$. Then $\\sqrt{a^2+x^2} = a\\sec\\theta$. Reference triangle: adj $= a$, opp $= x$, hyp $= \\sqrt{a^2+x^2}$.',
      'Case 3: $\\sqrt{x^2 - a^2}$. Let $x = a\\sec\\theta$, $dx = a\\sec\\theta\\tan\\theta\\,d\\theta$, $\\theta \\in [0, \\pi/2)$ for $x > a$. Then $\\sqrt{x^2-a^2} = a\\tan\\theta$. Reference triangle: hyp $= x$, adj $= a$, opp $= \\sqrt{x^2-a^2}$.',
      'After the substitution, the integral becomes a trig integral in $\\theta$. Evaluate using the techniques of Lesson 8 (powers of sin, cos, tan, sec). Then use the reference triangle to convert the answer back to $x$.',
      'Definite integrals: either (a) convert $x$-limits to $\\theta$-limits and evaluate directly in $\\theta$, or (b) convert the antiderivative back to $x$ first, then evaluate at the original limits. Option (a) avoids back-substitution entirely and is usually preferred.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Three Trig Substitutions',
        body: '\\(\\sqrt{a^2-x^2}\\): let \\(x = a\\sin\\theta\\), get \\(a\\cos\\theta\\)\n\\(\\sqrt{a^2+x^2}\\): let \\(x = a\\tan\\theta\\), get \\(a\\sec\\theta\\)\n\\(\\sqrt{x^2-a^2}\\): let \\(x = a\\sec\\theta\\), get \\(a\\tan\\theta\\)',
      },
      {
        type: 'strategy',
        title: 'Complete the Square First',
        body: 'Before applying trig sub, put the expression in standard form. Example: \\(\\sqrt{-x^2+4x+5} = \\sqrt{9-(x-2)^2}\\). Let \\(u = x-2\\), then \\(u = 3\\sin\\theta\\).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The validity of trig substitution rests on the invertibility of the substitution on the relevant domain. For $x = a\\sin\\theta$ with $\\theta \\in [-\\pi/2, \\pi/2]$, the function $\\sin$ is a bijection from $[-\\pi/2, \\pi/2]$ to $[-a, a]$ (after scaling by $a$). This ensures that $\\theta = \\arcsin(x/a)$ is well-defined, and the back-substitution is unambiguous.',
      'For $x = a\\tan\\theta$ with $\\theta \\in (-\\pi/2, \\pi/2)$, $\\tan$ is a bijection from $(-\\pi/2, \\pi/2)$ to $(-\\infty, \\infty)$, so $\\theta = \\arctan(x/a)$ is always well-defined. For $x = a\\sec\\theta$, the situation is slightly more delicate: $\\sec$ on $[0, \\pi/2)$ maps to $[1, \\infty)$, and on $(\\pi/2, \\pi]$ maps to $(-\\infty, -1]$. We choose the branch matching the sign of $x$.',
      'The substitution theorem for definite integrals guarantees that $\\int_a^b f(x)\\,dx = \\int_{\\alpha}^{\\beta} f(g(\\theta))g\'(\\theta)\\,d\\theta$ when $x = g(\\theta)$ is $C^1$ with $g(\\alpha) = a$ and $g(\\beta) = b$. The requirement that $g$ be $C^1$ is satisfied by $a\\sin\\theta$, $a\\tan\\theta$, and $a\\sec\\theta$ on their respective domains. The theorem does NOT require $g$ to be one-to-one for definite integrals (the formula holds regardless), but one-to-one ensures the back-substitution for indefinite integrals is well-defined.',
      'Geometric verification for the semicircle: $\\int_{-a}^{a} \\sqrt{a^2-x^2}\\,dx$ should equal $\\pi a^2/2$ (area of a semicircle). With $x = a\\sin\\theta$: the integral becomes $\\int_{-\\pi/2}^{\\pi/2} a\\cos\\theta \\cdot a\\cos\\theta\\,d\\theta = a^2 \\int_{-\\pi/2}^{\\pi/2} \\cos^2\\theta\\,d\\theta = a^2 \\cdot \\pi/2 = \\pi a^2/2$. The trig substitution method correctly reproduces the geometric result.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Domain Restrictions Ensure Well-Defined Back-Substitution',
        body: 'For \\(x = a\\sin\\theta\\): restrict \\(\\theta \\in [-\\pi/2, \\pi/2]\\) so \\(\\cos\\theta \\geq 0\\) and \\(\\theta = \\arcsin(x/a)\\) is unique.\nFor \\(x = a\\tan\\theta\\): restrict \\(\\theta \\in (-\\pi/2, \\pi/2)\\) so \\(\\sec\\theta > 0\\) and \\(\\theta = \\arctan(x/a)\\).\nFor \\(x = a\\sec\\theta\\): choose the branch matching \\(\\text{sgn}(x)\\).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-009-ex1',
      title: 'Semicircle Area: ∫√(4−x²) dx',
      problem: '\\text{Find } \\int \\sqrt{4-x^2}\\,dx.',
      steps: [
        { expression: '\\sqrt{a^2-x^2} \\text{ form with } a=2. \\text{ Let } x = 2\\sin\\theta, \\; dx = 2\\cos\\theta\\,d\\theta', annotation: 'Case 1 substitution.' },
        { expression: '\\sqrt{4-x^2} = \\sqrt{4-4\\sin^2\\theta} = 2\\cos\\theta', annotation: 'The radical becomes 2cosθ.' },
        { expression: '\\int \\sqrt{4-x^2}\\,dx = \\int 2\\cos\\theta \\cdot 2\\cos\\theta\\,d\\theta = 4\\int \\cos^2\\theta\\,d\\theta', annotation: 'Substitute everything.' },
        { expression: '= 4\\cdot\\frac{1}{2}(\\theta + \\sin\\theta\\cos\\theta) + C = 2\\theta + 2\\sin\\theta\\cos\\theta + C', annotation: '∫cos²θ dθ = θ/2 + sin(2θ)/4 = (θ + sinθ cosθ)/2.' },
        { expression: '\\text{Back-sub: } \\theta = \\arcsin(x/2),\\; \\sin\\theta = x/2,\\; \\cos\\theta = \\sqrt{4-x^2}/2', annotation: 'Use the reference triangle: opp = x, hyp = 2, adj = √(4−x²).' },
        { expression: '= 2\\arcsin\\frac{x}{2} + 2\\cdot\\frac{x}{2}\\cdot\\frac{\\sqrt{4-x^2}}{2} + C = 2\\arcsin\\frac{x}{2} + \\frac{x\\sqrt{4-x^2}}{2} + C', annotation: 'Final answer in terms of x.' },
      ],
      conclusion: '∫√(4−x²) dx = 2 arcsin(x/2) + x√(4−x²)/2 + C. Evaluating from −2 to 2 gives 2π — the area of a semicircle of radius 2.',
    },
    {
      id: 'ch4-009-ex2',
      title: '∫dx/(x²+1)^(3/2)',
      problem: '\\text{Find } \\int \\frac{dx}{(x^2+1)^{3/2}}.',
      steps: [
        { expression: '\\sqrt{x^2+a^2} \\text{ with } a=1. \\text{ Let } x = \\tan\\theta, \\; dx = \\sec^2\\theta\\,d\\theta', annotation: 'Case 2 substitution.' },
        { expression: 'x^2+1 = \\tan^2\\theta+1 = \\sec^2\\theta, \\; (x^2+1)^{3/2} = \\sec^3\\theta', annotation: 'Simplify the denominator.' },
        { expression: '\\int \\frac{\\sec^2\\theta}{\\sec^3\\theta}\\,d\\theta = \\int \\frac{d\\theta}{\\sec\\theta} = \\int \\cos\\theta\\,d\\theta', annotation: 'Cancel sec²θ/sec³θ = 1/secθ = cosθ.' },
        { expression: '= \\sin\\theta + C', annotation: '∫cosθ dθ = sinθ + C.' },
        { expression: '\\text{Reference triangle: adj}=1, \\text{ opp}=x, \\text{ hyp}=\\sqrt{x^2+1}. \\; \\sin\\theta = \\frac{x}{\\sqrt{x^2+1}}', annotation: 'Read sinθ from the triangle.' },
        { expression: '= \\frac{x}{\\sqrt{x^2+1}} + C', annotation: 'Final answer.' },
      ],
      conclusion: '∫dx/(x²+1)^(3/2) = x/√(x²+1) + C. The tan substitution turned a formidable-looking integral into ∫cosθ dθ.',
    },
    {
      id: 'ch4-009-ex3',
      title: '∫x²/√(9−x²) dx',
      problem: '\\text{Find } \\int \\frac{x^2}{\\sqrt{9-x^2}}\\,dx.',
      steps: [
        { expression: '\\text{Let } x = 3\\sin\\theta, \\; dx = 3\\cos\\theta\\,d\\theta, \\; \\sqrt{9-x^2} = 3\\cos\\theta', annotation: 'Case 1 with a = 3.' },
        { expression: '\\int \\frac{9\\sin^2\\theta}{3\\cos\\theta}\\cdot 3\\cos\\theta\\,d\\theta = 9\\int \\sin^2\\theta\\,d\\theta', annotation: 'The cosθ factors cancel.' },
        { expression: '= 9\\cdot\\frac{1}{2}(\\theta - \\sin\\theta\\cos\\theta) + C', annotation: '∫sin²θ dθ = θ/2 − sin(2θ)/4 = (θ − sinθ cosθ)/2.' },
        { expression: '= \\frac{9}{2}\\arcsin\\frac{x}{3} - \\frac{9}{2}\\cdot\\frac{x}{3}\\cdot\\frac{\\sqrt{9-x^2}}{3} + C', annotation: 'Back-sub: θ = arcsin(x/3), sinθ = x/3, cosθ = √(9−x²)/3.' },
        { expression: '= \\frac{9}{2}\\arcsin\\frac{x}{3} - \\frac{x\\sqrt{9-x^2}}{2} + C', annotation: 'Simplify: 9/(2·9) = 1/2.' },
      ],
      conclusion: '∫x²/√(9−x²) dx = (9/2)arcsin(x/3) − x√(9−x²)/2 + C.',
    },
    {
      id: 'ch4-009-ex4',
      title: '∫dx/√(x²−9)',
      problem: '\\text{Find } \\int \\frac{dx}{\\sqrt{x^2-9}} \\text{ for } x > 3.',
      steps: [
        { expression: '\\text{Let } x = 3\\sec\\theta, \\; dx = 3\\sec\\theta\\tan\\theta\\,d\\theta, \\; \\sqrt{x^2-9} = 3\\tan\\theta', annotation: 'Case 3 with a = 3.' },
        { expression: '\\int \\frac{3\\sec\\theta\\tan\\theta}{3\\tan\\theta}\\,d\\theta = \\int \\sec\\theta\\,d\\theta', annotation: 'The 3tanθ factors cancel.' },
        { expression: '= \\ln|\\sec\\theta + \\tan\\theta| + C', annotation: 'Standard integral of secθ.' },
        { expression: '\\text{Reference triangle: hyp}=x,\\text{ adj}=3,\\text{ opp}=\\sqrt{x^2-9}', annotation: 'secθ = x/3, tanθ = √(x²−9)/3.' },
        { expression: '= \\ln\\left|\\frac{x}{3}+\\frac{\\sqrt{x^2-9}}{3}\\right| + C = \\ln\\left|x+\\sqrt{x^2-9}\\right| - \\ln 3 + C', annotation: 'Simplify. The −ln 3 can be absorbed into C.' },
        { expression: '= \\ln\\left|x+\\sqrt{x^2-9}\\right| + C', annotation: 'Final simplified form.' },
      ],
      conclusion: '∫dx/√(x²−9) = ln|x + √(x²−9)| + C. This is equivalent to arccosh(x/3) + C.',
    },
    {
      id: 'ch4-009-ex5',
      title: 'Completing the Square: ∫dx/√(x²+4x+8)',
      problem: '\\text{Find } \\int \\frac{dx}{\\sqrt{x^2+4x+8}}.',
      steps: [
        { expression: 'x^2+4x+8 = (x+2)^2 + 4', annotation: 'Complete the square: x²+4x+4+4 = (x+2)²+4.' },
        { expression: '\\text{Let } u = x+2,\\; du = dx. \\text{ Then } \\int\\frac{du}{\\sqrt{u^2+4}}', annotation: 'Shift to standard form.' },
        { expression: '\\text{Let } u = 2\\tan\\theta,\\; du = 2\\sec^2\\theta\\,d\\theta,\\; \\sqrt{u^2+4} = 2\\sec\\theta', annotation: 'Case 2 with a = 2.' },
        { expression: '\\int\\frac{2\\sec^2\\theta}{2\\sec\\theta}d\\theta = \\int \\sec\\theta\\,d\\theta = \\ln|\\sec\\theta+\\tan\\theta|+C', annotation: 'Simplify and integrate.' },
        { expression: '\\sec\\theta = \\frac{\\sqrt{u^2+4}}{2},\\; \\tan\\theta = \\frac{u}{2} = \\frac{x+2}{2}', annotation: 'Back-substitute using the reference triangle.' },
        { expression: '= \\ln\\left|\\frac{\\sqrt{(x+2)^2+4}}{2}+\\frac{x+2}{2}\\right|+C = \\ln|x+2+\\sqrt{x^2+4x+8}|+C', annotation: 'Simplify, absorbing −ln 2 into C.' },
      ],
      conclusion: '∫dx/√(x²+4x+8) = ln|x+2+√(x²+4x+8)| + C. Completing the square is the essential first step when the quadratic has a linear term.',
    },
  ],

  challenges: [
    {
      id: 'ch4-009-ch1',
      difficulty: 'easy',
      problem: 'Find ∫dx/√(1−x²). (You should recognize this from the antiderivative table — verify it using the sin substitution.)',
      hint: 'Let x = sinθ, dx = cosθ dθ. √(1−x²) = cosθ.',
      walkthrough: [
        { expression: 'x = \\sin\\theta,\\; dx = \\cos\\theta\\,d\\theta,\\; \\sqrt{1-x^2}=\\cos\\theta', annotation: 'Standard sin substitution with a = 1.' },
        { expression: '\\int \\frac{\\cos\\theta}{\\cos\\theta}d\\theta = \\int d\\theta = \\theta + C = \\arcsin x + C', annotation: 'The integral is trivially θ, which equals arcsin(x).' },
      ],
      answer: '\\arcsin x + C',
    },
    {
      id: 'ch4-009-ch2',
      difficulty: 'medium',
      problem: 'Evaluate ∫₀² √(4+x²) dx.',
      hint: 'Let x = 2tanθ. Change limits: x=0 → θ=0, x=2 → θ=π/4. You will need ∫sec³θ dθ from Lesson 8.',
      walkthrough: [
        { expression: 'x = 2\\tan\\theta,\\; dx = 2\\sec^2\\theta\\,d\\theta,\\; \\sqrt{4+x^2} = 2\\sec\\theta', annotation: 'Case 2 with a = 2.' },
        { expression: '\\int_0^{\\pi/4} 2\\sec\\theta\\cdot 2\\sec^2\\theta\\,d\\theta = 4\\int_0^{\\pi/4}\\sec^3\\theta\\,d\\theta', annotation: 'Limits: x=0→θ=0, x=2→θ=π/4.' },
        { expression: '\\int \\sec^3\\theta\\,d\\theta = \\frac{1}{2}[\\sec\\theta\\tan\\theta + \\ln|\\sec\\theta+\\tan\\theta|]', annotation: 'From Lesson 8.' },
        { expression: '= 4\\cdot\\frac{1}{2}[\\sec\\theta\\tan\\theta+\\ln|\\sec\\theta+\\tan\\theta|]_0^{\\pi/4}', annotation: 'Evaluate at limits.' },
        { expression: '= 2[(\\sqrt{2})(1)+\\ln(\\sqrt{2}+1) - (1)(0) - \\ln(1+0)]', annotation: 'At θ=π/4: secθ=√2, tanθ=1. At θ=0: secθ=1, tanθ=0.' },
        { expression: '= 2[\\sqrt{2}+\\ln(1+\\sqrt{2})]', annotation: 'ln 1 = 0.' },
      ],
      answer: '2\\sqrt{2}+2\\ln(1+\\sqrt{2}) \\approx 4.591',
    },
    {
      id: 'ch4-009-ch3',
      difficulty: 'hard',
      problem: 'Find ∫x³/√(x²+4) dx using trig substitution. Then verify by using the algebraic substitution u = x²+4 instead.',
      hint: 'Trig: x = 2tanθ. Algebraic: u = x²+4, then x² = u−4 and x dx = du/2.',
      walkthrough: [
        { expression: '\\text{Trig sub: } x=2\\tan\\theta,\\; x^3 = 8\\tan^3\\theta,\\; \\sqrt{x^2+4}=2\\sec\\theta,\\; dx=2\\sec^2\\theta\\,d\\theta', annotation: 'Set up.' },
        { expression: '\\int \\frac{8\\tan^3\\theta}{2\\sec\\theta}\\cdot 2\\sec^2\\theta\\,d\\theta = 8\\int \\tan^3\\theta\\sec\\theta\\,d\\theta', annotation: 'Simplify: 8·2/(2)·sec = 8 tanθ³ secθ.' },
        { expression: '= 8\\int \\tan^2\\theta\\cdot\\sec\\theta\\tan\\theta\\,d\\theta = 8\\int(\\sec^2\\theta-1)\\sec\\theta\\tan\\theta\\,d\\theta', annotation: 'Write tan²θ = sec²θ−1, save secθ tanθ for du.' },
        { expression: 'u=\\sec\\theta: 8\\int(u^2-1)du = 8(u^3/3-u)+C = \\frac{8}{3}\\sec^3\\theta - 8\\sec\\theta + C', annotation: 'Integrate.' },
        { expression: '\\sec\\theta = \\sqrt{x^2+4}/2: \\; = \\frac{8}{3}\\cdot\\frac{(x^2+4)^{3/2}}{8} - 8\\cdot\\frac{\\sqrt{x^2+4}}{2}+C', annotation: 'Back-substitute.' },
        { expression: '= \\frac{(x^2+4)^{3/2}}{3} - 4\\sqrt{x^2+4} + C = \\frac{\\sqrt{x^2+4}}{3}(x^2+4-12)+C = \\frac{(x^2-8)\\sqrt{x^2+4}}{3}+C', annotation: 'Factor and simplify.' },
      ],
      answer: '\\frac{(x^2-8)\\sqrt{x^2+4}}{3}+C',
    },
  ],

  crossRefs: [
    { lessonSlug: 'trig-integrals', label: 'Trig Integrals', context: 'After trig substitution, you always face a trig integral. Master Lesson 8 first.' },
    { lessonSlug: 'u-substitution', label: 'U-Substitution', context: 'Sometimes an algebraic u-sub is simpler than trig sub — always consider both approaches.' },
    { lessonSlug: 'trig-review', label: 'Trig Review', context: 'The three Pythagorean identities are the foundation of trig substitution.' },
    { lessonSlug: 'improper-integrals', label: 'Improper Integrals', context: 'Trig substitution often appears in improper integrals involving radicals.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
