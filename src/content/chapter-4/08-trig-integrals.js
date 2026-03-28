// FILE: src/content/chapter-4/08-trig-integrals.js
export default {
  id: 'ch4-008',
  slug: 'trig-integrals',
  chapter: 4,
  order: 8,
  title: 'Trigonometric Integrals',
  subtitle: 'Systematic strategies for integrating powers and products of sine, cosine, tangent, and secant',
  tags: ['trig integrals', 'sin cos powers', 'half-angle', 'Wallis', 'reduction', 'trigonometric', 'sin squared', 'cos squared'],
  aliases: ['how to integrate sin^m cos^n', 'trig power integrals', 'half angle integration strategy'],

  hook: {
    question: 'How do you integrate sin²(x)? The power rule does not apply (sin²(x) is not x^n), and u-sub fails (the derivative of sin x is cos x, but there is no cos x factor). The key is a trig identity: sin²(x) = (1 − cos 2x)/2. This converts the integral to a basic form. Trig integrals are all about choosing the right identity to simplify the integrand — and this lesson gives you a complete decision flowchart.',
    realWorldContext: 'Trigonometric integrals arise naturally in any field involving periodic phenomena. Electrical engineers compute power dissipation in AC circuits by integrating sin²(ωt) over a period — giving the "RMS" (root mean square) values that appear on every voltmeter. Structural engineers compute bending moments in beams under sinusoidal loads. In optics, interference patterns involve integrals of cos² and sin·cos products. Fourier analysis — the mathematical backbone of audio processing, telecommunications, and image compression — requires evaluating ∫sin^m(x)cos^n(x)dx for all combinations of m and n.',
    previewVisualizationId: 'UnitCircle',
  },

  intuition: {
    prose: [
      'The fundamental challenge with trig integrals is that powers of trig functions are not in the basic antiderivative table. You know $\\int \\sin x\\,dx = -\\cos x$ and $\\int \\cos x\\,dx = \\sin x$, but $\\int \\sin^2 x\\,dx$ is not directly available. The strategy is always the same: use trigonometric identities to convert the integrand into a form you CAN integrate.',
      'For products $\\sin^m x \\cos^n x$, the strategy depends on whether $m$ or $n$ is odd. If one exponent is odd, peel off one factor and use the Pythagorean identity to convert the rest. For example, $\\int \\sin^3 x \\cos^2 x\\,dx$: peel off one $\\sin x$ to get $\\sin^2 x \\cos^2 x \\cdot \\sin x\\,dx$, replace $\\sin^2 x = 1 - \\cos^2 x$, and substitute $u = \\cos x$. The integral becomes a polynomial in $u$.',
      'If BOTH exponents are even, peeling off one factor does not help (it leaves an odd power that cannot be converted using $\\sin^2 + \\cos^2 = 1$ cleanly). Instead, use the half-angle identities: $\\sin^2 x = (1 - \\cos 2x)/2$ and $\\cos^2 x = (1 + \\cos 2x)/2$. These reduce the powers by converting $\\sin^2$ and $\\cos^2$ into first-degree trig functions of $2x$. You may need to apply half-angle identities multiple times for higher even powers.',
      'For powers of tangent and secant, the strategies are different. The key identity is $\\tan^2 x = \\sec^2 x - 1$. For $\\int \\tan^n x\\,dx$, write $\\tan^n x = \\tan^{n-2} x \\cdot \\tan^2 x = \\tan^{n-2} x(\\sec^2 x - 1)$, which splits into $\\int \\tan^{n-2} x \\sec^2 x\\,dx$ (u-sub with $u = \\tan x$) minus $\\int \\tan^{n-2} x\\,dx$ (a lower power). This is a reduction formula.',
      'For $\\int \\sec^n x\\,dx$ with even $n$, save a $\\sec^2 x$ factor and convert the rest using $\\sec^2 x = 1 + \\tan^2 x$, then substitute $u = \\tan x$. For odd powers of secant, integration by parts is needed — and $\\int \\sec^3 x\\,dx$ is a famously tricky integral that combines by-parts with the identity $\\sec^2 x = 1 + \\tan^2 x$.',
      'Here is the complete decision flowchart for $\\int \\sin^m x \\cos^n x\\,dx$: (1) If $n$ is odd: save one $\\cos x$, write the rest as $(1-\\sin^2 x)^{(n-1)/2}$, substitute $u = \\sin x$. (2) If $m$ is odd: save one $\\sin x$, write the rest as $(1-\\cos^2 x)^{(m-1)/2}$, substitute $u = \\cos x$. (3) If both are even: use half-angle identities to reduce powers. For $\\int \\tan^m x \\sec^n x\\,dx$: (1) If $n$ is even: save $\\sec^2 x$, convert remaining $\\sec$ to $\\tan$ via $\\sec^2 = 1 + \\tan^2$, substitute $u = \\tan x$. (2) If $m$ is odd: save $\\sec x \\tan x$, convert remaining $\\tan$ to $\\sec$ via $\\tan^2 = \\sec^2 - 1$, substitute $u = \\sec x$.',
      'The Wallis formulas give closed-form results for $\\int_0^{\\pi/2} \\sin^n x\\,dx$ and $\\int_0^{\\pi/2} \\cos^n x\\,dx$. By the reduction formula, $\\int_0^{\\pi/2} \\sin^n x\\,dx = \\frac{n-1}{n}\\cdot\\frac{n-3}{n-2}\\cdots$ The product ends at $\\frac{1}{2}\\cdot\\frac{\\pi}{2}$ if $n$ is even, or at $1$ if $n$ is odd. These formulas are used in physics (computing moments of inertia of spheres) and lead to the beautiful Wallis product for $\\pi$: $\\pi/2 = (2/1)(2/3)(4/3)(4/5)(6/5)(6/7)\\cdots$',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'The Decision Flowchart for sin^m · cos^n',
        body: '1. Is one exponent odd? → Save one factor of that trig function, convert the rest using sin²+cos²=1, then u-sub.\n2. Are both exponents even? → Use half-angle identities: sin²x = (1−cos 2x)/2, cos²x = (1+cos 2x)/2.\n3. Special case: both zero → ∫1 dx = x + C.\nThis flowchart handles EVERY integral of the form ∫sin^m(x)cos^n(x) dx.',
      },
      {
        type: 'prior-knowledge',
        title: 'Essential Trig Identities',
        body: 'You need these memorized:\n• sin²x + cos²x = 1\n• sin²x = (1 − cos 2x)/2\n• cos²x = (1 + cos 2x)/2\n• sin x cos x = sin(2x)/2\n• tan²x = sec²x − 1\n• 1 + tan²x = sec²x',
      },
      {
        type: 'warning',
        title: 'Do Not Mix Up the Strategies',
        body: 'Odd power? → Pythagorean identity + u-sub. Even power? → Half-angle identity. Using half-angle when you have an odd power creates unnecessary complexity. Using the Pythagorean identity when both powers are even does not reduce the powers.',
      },
      {
        type: 'real-world',
        title: 'RMS Voltage and sin²',
        body: 'The average power dissipated in a resistor carrying AC current I(t) = I₀ sin(ωt) is P_avg = (1/T)∫₀ᵀ I₀² sin²(ωt)·R dt. The integral of sin² over a full period gives T/2 (by the half-angle identity). So P_avg = I₀²R/2, and the "RMS current" is I₀/√2. Every electrical rating you see (120V, 240V) is an RMS value — computed by integrating sin².',
      },
      {
        type: 'misconception',
        title: '∫sin²x dx ≠ sin³x/3',
        body: 'The power rule ∫xⁿ dx = xⁿ⁺¹/(n+1) applies to powers of x, NOT powers of sin x. sin²x is a composition, not a simple power. You must use the half-angle identity: ∫sin²x dx = ∫(1−cos 2x)/2 dx = x/2 − sin(2x)/4 + C.',
      },
    ],
    visualizations: [
                            {
        id: 'IntegrationMethodLab',
        title: 'Method Selection Trainer',
        caption: 'Toggle trig-pattern signals to decide when to use odd/even power identities versus other major integration techniques.',
      },
      {
        id: 'UnitCircle',
        title: 'Powers of Sine and Cosine on the Unit Circle',
        caption: 'As the exponent increases, sin^n(x) and cos^n(x) become more "peaked" near their maxima and flatter near zero. This geometric view explains why ∫₀^(π/2) sin^n x dx decreases as n grows — the function spends more time near zero.',
      },
    ],
  },

  math: {
    prose: [
      'Case 1 — odd power of cosine: $\\int \\sin^m x \\cos^{2k+1} x\\,dx$. Save one $\\cos x$: $= \\int \\sin^m x (\\cos^2 x)^k \\cos x\\,dx = \\int \\sin^m x (1-\\sin^2 x)^k \\cos x\\,dx$. Substitute $u = \\sin x$, $du = \\cos x\\,dx$: $= \\int u^m(1-u^2)^k\\,du$. Expand $(1-u^2)^k$ and integrate each term by the power rule.',
      'Case 2 — odd power of sine: $\\int \\sin^{2k+1} x \\cos^n x\\,dx$. Save one $\\sin x$: $= \\int (\\sin^2 x)^k \\cos^n x \\sin x\\,dx = \\int (1-\\cos^2 x)^k \\cos^n x \\sin x\\,dx$. Substitute $u = \\cos x$, $du = -\\sin x\\,dx$: $= -\\int (1-u^2)^k u^n\\,du$.',
      'Case 3 — both even: use half-angle identities repeatedly. $\\int \\sin^{2m} x \\cos^{2n} x\\,dx$. Replace $\\sin^2 x = (1-\\cos 2x)/2$ and $\\cos^2 x = (1+\\cos 2x)/2$. Expand the product and integrate each term. For the resulting $\\cos^2(2x)$ terms, apply the half-angle identity again with argument $4x$.',
      'Tangent powers: $\\int \\tan^n x\\,dx = \\int \\tan^{n-2} x(\\sec^2 x - 1)\\,dx = \\int \\tan^{n-2} x \\sec^2 x\\,dx - \\int \\tan^{n-2} x\\,dx$. The first integral is $\\tan^{n-1} x/(n-1)$ by $u = \\tan x$. This gives the reduction formula: $\\int \\tan^n x\\,dx = \\frac{\\tan^{n-1} x}{n-1} - \\int \\tan^{n-2} x\\,dx$.',
      'Secant powers (even): $\\int \\sec^{2k} x\\,dx = \\int (\\sec^2 x)^{k-1} \\sec^2 x\\,dx = \\int (1+\\tan^2 x)^{k-1} \\sec^2 x\\,dx$. Substitute $u = \\tan x$: $= \\int (1+u^2)^{k-1}\\,du$, a polynomial integral. Secant powers (odd, $\\geq 3$): use integration by parts. The key result is $\\int \\sec^3 x\\,dx = \\frac{1}{2}[\\sec x \\tan x + \\ln|\\sec x + \\tan x|] + C$.',
      'Wallis formulas: $\\int_0^{\\pi/2} \\sin^n x\\,dx = \\int_0^{\\pi/2} \\cos^n x\\,dx = \\frac{(n-1)!!}{n!!} \\cdot \\begin{cases} \\pi/2 & n \\text{ even} \\\\ 1 & n \\text{ odd} \\end{cases}$, where $n!! = n(n-2)(n-4)\\cdots$ (double factorial). For example, $\\int_0^{\\pi/2} \\sin^6 x\\,dx = \\frac{5\\cdot3\\cdot1}{6\\cdot4\\cdot2}\\cdot\\frac{\\pi}{2} = \\frac{5\\pi}{32}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Half-Angle Identities for Integration',
        body: '\\[\\sin^2 x = \\frac{1-\\cos 2x}{2}, \\quad \\cos^2 x = \\frac{1+\\cos 2x}{2}\\]\n\\[\\sin x \\cos x = \\frac{\\sin 2x}{2}\\]\nThese convert even powers of sin and cos into first-degree trig functions.',
      },
      {
        type: 'theorem',
        title: 'Tangent Reduction Formula',
        body: '\\[\\int \\tan^n x\\,dx = \\frac{\\tan^{n-1}x}{n-1} - \\int \\tan^{n-2}x\\,dx \\quad (n \\geq 2)\\]',
      },
      {
        type: 'theorem',
        title: 'Wallis Formula',
        body: '\\[\\int_0^{\\pi/2} \\sin^n x\\,dx = \\int_0^{\\pi/2} \\cos^n x\\,dx = \\frac{(n-1)!!}{n!!} \\cdot \\begin{cases} \\pi/2 & n \\text{ even} \\\\ 1 & n \\text{ odd}\\end{cases}\\]',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The half-angle identities are derived from the double-angle formula $\\cos 2x = 1 - 2\\sin^2 x = 2\\cos^2 x - 1$. Solving for $\\sin^2 x$: $\\sin^2 x = (1 - \\cos 2x)/2$. Solving for $\\cos^2 x$: $\\cos^2 x = (1 + \\cos 2x)/2$. These are exact algebraic identities, not approximations.',
      'The reduction formula for $\\int \\sin^n x\\,dx$ is derived by integration by parts. Let $u = \\sin^{n-1} x$, $dv = \\sin x\\,dx$. Then $du = (n-1)\\sin^{n-2}x\\cos x\\,dx$ and $v = -\\cos x$. Applying by-parts: $\\int \\sin^n x\\,dx = -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\cos^2 x\\,dx$. Replace $\\cos^2 x = 1 - \\sin^2 x$: $= -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\,dx - (n-1)\\int \\sin^n x\\,dx$. Let $I_n = \\int \\sin^n x\\,dx$. Then $I_n = -\\sin^{n-1}x\\cos x + (n-1)I_{n-2} - (n-1)I_n$. Solving: $nI_n = -\\sin^{n-1}x\\cos x + (n-1)I_{n-2}$, giving $I_n = -\\frac{1}{n}\\sin^{n-1}x\\cos x + \\frac{n-1}{n}I_{n-2}$.',
      'The Wallis formula for definite integrals over $[0, \\pi/2]$ follows from the reduction formula evaluated at the endpoints. Since $\\sin(0) = 0$ and $\\sin(\\pi/2) = 1$, the boundary term $[-\\sin^{n-1}x\\cos x]_0^{\\pi/2}$ equals $-1^{n-1}\\cdot 0 + 0 = 0$ for all $n \\geq 1$. Thus $\\int_0^{\\pi/2}\\sin^n x\\,dx = \\frac{n-1}{n}\\int_0^{\\pi/2}\\sin^{n-2}x\\,dx$. Iterating: for even $n = 2k$, the chain terminates at $\\int_0^{\\pi/2}1\\,dx = \\pi/2$; for odd $n = 2k+1$, it terminates at $\\int_0^{\\pi/2}\\sin x\\,dx = 1$.',
      'The Wallis product formula for $\\pi$ follows from comparing $\\int_0^{\\pi/2}\\sin^{2n}x\\,dx$ and $\\int_0^{\\pi/2}\\sin^{2n+1}x\\,dx$. Since $0 \\leq \\sin x \\leq 1$ on $[0, \\pi/2]$, we have $\\sin^{2n+1}x \\leq \\sin^{2n}x \\leq \\sin^{2n-1}x$. Integrating and dividing by $\\int_0^{\\pi/2}\\sin^{2n+1}x\\,dx$, then taking $n \\to \\infty$ (using the squeeze theorem), yields the Wallis product: $\\pi/2 = \\prod_{k=1}^{\\infty} \\frac{4k^2}{4k^2-1}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Reduction Formula for sin^n (Proof Sketch)',
        body: 'By parts with \\(u = \\sin^{n-1}x\\), \\(dv = \\sin x\\,dx\\):\n\\[I_n = -\\frac{1}{n}\\sin^{n-1}x\\cos x + \\frac{n-1}{n}I_{n-2}\\]\nThe \\(\\cos^2 x = 1 - \\sin^2 x\\) substitution is the key algebraic step that makes the original integral reappear.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-008-ex1',
      title: 'Even Power: ∫sin²(x) dx',
      problem: '\\text{Find } \\int \\sin^2 x\\,dx.',
      steps: [
        { expression: '\\sin^2 x = \\frac{1-\\cos 2x}{2}', annotation: 'Both exponents are even (sin² = sin² · cos⁰). Use the half-angle identity.' },
        { expression: '\\int \\sin^2 x\\,dx = \\int \\frac{1-\\cos 2x}{2}\\,dx = \\frac{1}{2}\\int(1-\\cos 2x)\\,dx', annotation: 'Factor out 1/2.' },
        { expression: '= \\frac{1}{2}\\left(x - \\frac{\\sin 2x}{2}\\right) + C = \\frac{x}{2} - \\frac{\\sin 2x}{4} + C', annotation: '∫cos 2x dx = sin(2x)/2 by linear substitution.' },
        { expression: '\\text{Verify: } \\frac{d}{dx}\\left[\\frac{x}{2}-\\frac{\\sin 2x}{4}\\right] = \\frac{1}{2} - \\frac{2\\cos 2x}{4} = \\frac{1-\\cos 2x}{2} = \\sin^2 x \\checkmark', annotation: 'Differentiate and use the half-angle identity backwards.' },
      ],
      conclusion: '∫sin²x dx = x/2 − sin(2x)/4 + C. This is the most important trig integral — memorize it or be able to derive it instantly.',
    },
    {
      id: 'ch4-008-ex2',
      title: 'Odd Power: ∫sin³(x) dx',
      problem: '\\text{Find } \\int \\sin^3 x\\,dx.',
      steps: [
        { expression: '\\int \\sin^3 x\\,dx = \\int \\sin^2 x \\cdot \\sin x\\,dx', annotation: 'Odd power of sin: save one sin x.' },
        { expression: '= \\int (1-\\cos^2 x)\\sin x\\,dx', annotation: 'Replace sin²x = 1 − cos²x.' },
        { expression: '\\text{Let } u = \\cos x, \\; du = -\\sin x\\,dx', annotation: 'Now u-sub with u = cos x.' },
        { expression: '= -\\int (1-u^2)\\,du = -u + \\frac{u^3}{3} + C', annotation: 'Integrate the polynomial in u.' },
        { expression: '= -\\cos x + \\frac{\\cos^3 x}{3} + C', annotation: 'Substitute back u = cos x.' },
      ],
      conclusion: '∫sin³x dx = −cos x + cos³x/3 + C. The "save one, convert the rest" strategy makes odd powers straightforward.',
    },
    {
      id: 'ch4-008-ex3',
      title: 'Mixed: ∫sin²(x)cos³(x) dx',
      problem: '\\text{Find } \\int \\sin^2 x \\cos^3 x\\,dx.',
      steps: [
        { expression: '\\text{cos has odd power (3). Save one cos x:}', annotation: 'Decision: n = 3 is odd → use Pythagorean identity strategy.' },
        { expression: '\\int \\sin^2 x \\cos^2 x \\cdot \\cos x\\,dx = \\int \\sin^2 x(1-\\sin^2 x)\\cos x\\,dx', annotation: 'Replace cos²x = 1 − sin²x.' },
        { expression: '\\text{Let } u = \\sin x,\\; du = \\cos x\\,dx', annotation: 'Substitute u = sin x.' },
        { expression: '= \\int u^2(1-u^2)\\,du = \\int (u^2-u^4)\\,du', annotation: 'Expand.' },
        { expression: '= \\frac{u^3}{3} - \\frac{u^5}{5} + C = \\frac{\\sin^3 x}{3} - \\frac{\\sin^5 x}{5} + C', annotation: 'Power rule, then substitute back.' },
      ],
      conclusion: '∫sin²x cos³x dx = sin³x/3 − sin⁵x/5 + C. When one exponent is odd, the integral reduces to a polynomial.',
    },
    {
      id: 'ch4-008-ex4',
      title: 'Both Even: ∫sin²(x)cos²(x) dx',
      problem: '\\text{Find } \\int \\sin^2 x \\cos^2 x\\,dx.',
      steps: [
        { expression: '\\sin^2 x\\cos^2 x = \\left(\\frac{\\sin 2x}{2}\\right)^2 = \\frac{\\sin^2 2x}{4}', annotation: 'Use sin x cos x = sin(2x)/2, then square.' },
        { expression: '= \\frac{1}{4}\\cdot\\frac{1-\\cos 4x}{2} = \\frac{1-\\cos 4x}{8}', annotation: 'Apply half-angle to sin²(2x): sin²(2x) = (1 − cos 4x)/2.' },
        { expression: '\\int \\sin^2 x\\cos^2 x\\,dx = \\frac{1}{8}\\int(1-\\cos 4x)\\,dx', annotation: 'Now integrate a first-degree trig function.' },
        { expression: '= \\frac{1}{8}\\left(x - \\frac{\\sin 4x}{4}\\right) + C = \\frac{x}{8} - \\frac{\\sin 4x}{32} + C', annotation: '∫cos 4x dx = sin(4x)/4.' },
      ],
      conclusion: '∫sin²x cos²x dx = x/8 − sin(4x)/32 + C. Both even → half-angle, possibly twice.',
    },
    {
      id: 'ch4-008-ex5',
      title: 'Tangent Power: ∫tan⁴(x) dx',
      problem: '\\text{Find } \\int \\tan^4 x\\,dx.',
      steps: [
        { expression: '\\tan^4 x = \\tan^2 x \\cdot \\tan^2 x = \\tan^2 x(\\sec^2 x - 1)', annotation: 'Peel off tan²x and use tan²x = sec²x − 1.' },
        { expression: '= \\tan^2 x \\sec^2 x - \\tan^2 x', annotation: 'Distribute.' },
        { expression: '\\int \\tan^2 x\\sec^2 x\\,dx: u=\\tan x,\\; du=\\sec^2 x\\,dx \\Rightarrow \\int u^2\\,du = \\frac{\\tan^3 x}{3}', annotation: 'First integral: direct u-sub.' },
        { expression: '\\int \\tan^2 x\\,dx = \\int(\\sec^2 x-1)\\,dx = \\tan x - x + C', annotation: 'Second integral: replace tan²x = sec²x − 1 again.' },
        { expression: '\\int \\tan^4 x\\,dx = \\frac{\\tan^3 x}{3} - \\tan x + x + C', annotation: 'Combine results.' },
      ],
      conclusion: '∫tan⁴x dx = tan³x/3 − tan x + x + C. The reduction tan²x = sec²x − 1 is applied twice.',
    },
    {
      id: 'ch4-008-ex6',
      title: 'Secant Cubed: ∫sec³(x) dx',
      problem: '\\text{Find } \\int \\sec^3 x\\,dx.',
      steps: [
        { expression: '\\text{Let } I = \\int \\sec^3 x\\,dx. \\text{ By parts: } u = \\sec x,\\; dv = \\sec^2 x\\,dx', annotation: 'Odd power of sec → integration by parts.' },
        { expression: 'du = \\sec x\\tan x\\,dx, \\quad v = \\tan x', annotation: 'Differentiate and integrate.' },
        { expression: 'I = \\sec x\\tan x - \\int \\sec x\\tan^2 x\\,dx', annotation: 'Apply the by-parts formula.' },
        { expression: '= \\sec x\\tan x - \\int \\sec x(\\sec^2 x - 1)\\,dx', annotation: 'Replace tan²x = sec²x − 1.' },
        { expression: '= \\sec x\\tan x - I + \\int \\sec x\\,dx', annotation: 'Split: −∫sec³x dx = −I, and +∫sec x dx.' },
        { expression: '2I = \\sec x\\tan x + \\ln|\\sec x+\\tan x|', annotation: 'Collect I on the left. Recall ∫sec x dx = ln|sec x + tan x|.' },
        { expression: 'I = \\frac{1}{2}\\left[\\sec x\\tan x + \\ln|\\sec x + \\tan x|\\right] + C', annotation: 'Divide by 2.' },
      ],
      conclusion: '∫sec³x dx = (1/2)[sec x tan x + ln|sec x + tan x|] + C. This is one of the most important results in trig integrals — it appears frequently in applications (arc length of parabolas, etc.).',
    },
  ],

  challenges: [
    {
      id: 'ch4-008-ch1',
      difficulty: 'easy',
      problem: 'Evaluate: (a) ∫cos²(x) dx, (b) ∫sin(x)cos³(x) dx.',
      hint: '(a) Half-angle: cos²x = (1+cos 2x)/2. (b) Odd power of cos: save one cos x, let u = sin x.',
      walkthrough: [
        { expression: '\\text{(a) } \\int \\cos^2 x\\,dx = \\int\\frac{1+\\cos 2x}{2}dx = \\frac{x}{2} + \\frac{\\sin 2x}{4} + C', annotation: 'Half-angle identity, then integrate.' },
        { expression: '\\text{(b) } u = \\sin x,\\; du = \\cos x\\,dx.\\; \\int \\sin x \\cos^2 x \\cdot \\cos x\\,dx = \\int u(1-u^2)du', annotation: 'Wait — cos has odd power 3. Save one cos x. sin x · cos²x · cos x dx. But more directly: just u = sin x...' },
        { expression: '\\text{Actually: } \\int \\sin x\\cos^3 x\\,dx,\\; u=\\cos x,\\; du=-\\sin x\\,dx: -\\int u^3\\,du = -\\frac{\\cos^4 x}{4}+C', annotation: 'Simpler: let u = cos x since sin x dx = −du. Then cos³x = u³.' },
      ],
      answer: '\\text{(a) } \\frac{x}{2}+\\frac{\\sin 2x}{4}+C \\quad \\text{(b) } -\\frac{\\cos^4 x}{4}+C',
    },
    {
      id: 'ch4-008-ch2',
      difficulty: 'medium',
      problem: 'Evaluate ∫₀^(π/2) sin⁵(x) dx using the odd-power strategy, then verify using the Wallis formula.',
      hint: 'Save one sin x, convert sin⁴x = (1−cos²x)², substitute u = cos x. For Wallis: (4·2)/(5·3·1) · 1.',
      walkthrough: [
        { expression: '\\int_0^{\\pi/2}\\sin^5 x\\,dx = \\int_0^{\\pi/2}(1-\\cos^2 x)^2\\sin x\\,dx', annotation: 'Save one sin x, write sin⁴x = (1−cos²x)².' },
        { expression: 'u=\\cos x,\\; x=0\\Rightarrow u=1,\\; x=\\pi/2\\Rightarrow u=0', annotation: 'Change limits.' },
        { expression: '= -\\int_1^0 (1-u^2)^2\\,du = \\int_0^1(1-2u^2+u^4)\\,du', annotation: 'Flip limits and expand.' },
        { expression: '= \\left[u-\\frac{2u^3}{3}+\\frac{u^5}{5}\\right]_0^1 = 1-\\frac{2}{3}+\\frac{1}{5} = \\frac{15-10+3}{15} = \\frac{8}{15}', annotation: 'Evaluate.' },
        { expression: '\\text{Wallis: } \\frac{4!!}{5!!} \\cdot 1 = \\frac{4\\cdot2}{5\\cdot3\\cdot1} = \\frac{8}{15} \\checkmark', annotation: 'n=5 is odd, so multiply by 1 (not π/2). Confirmed.' },
      ],
      answer: '\\frac{8}{15}',
    },
    {
      id: 'ch4-008-ch3',
      difficulty: 'hard',
      problem: 'Find ∫tan³(x)sec³(x) dx.',
      hint: 'Save sec x tan x (so m is odd for tan). Write tan²x = sec²x − 1. Let u = sec x.',
      walkthrough: [
        { expression: '\\int \\tan^3 x\\sec^3 x\\,dx = \\int \\tan^2 x\\sec^2 x\\cdot\\sec x\\tan x\\,dx', annotation: 'Save sec x tan x factor. Remaining: tan²x · sec²x.' },
        { expression: '= \\int (\\sec^2 x-1)\\sec^2 x\\cdot\\sec x\\tan x\\,dx', annotation: 'Replace tan²x = sec²x − 1.' },
        { expression: 'u = \\sec x,\\; du = \\sec x\\tan x\\,dx', annotation: 'Substitute.' },
        { expression: '= \\int (u^2-1)u^2\\,du = \\int(u^4-u^2)\\,du', annotation: 'Everything in terms of u.' },
        { expression: '= \\frac{u^5}{5}-\\frac{u^3}{3}+C = \\frac{\\sec^5 x}{5}-\\frac{\\sec^3 x}{3}+C', annotation: 'Integrate and substitute back.' },
      ],
      answer: '\\frac{\\sec^5 x}{5}-\\frac{\\sec^3 x}{3}+C',
    },
  ],

  crossRefs: [
    { lessonSlug: 'u-substitution', label: 'U-Substitution', context: 'Most trig integral strategies end with a u-substitution after applying an identity.' },
    { lessonSlug: 'integration-by-parts', label: 'Integration by Parts', context: 'Reduction formulas and ∫sec³x dx are derived using by-parts.' },
    { lessonSlug: 'trig-substitution', label: 'Trig Substitution', context: 'Trig substitution creates trig integrals — you need the techniques from this lesson to finish those problems.' },
    { lessonSlug: 'trig-review', label: 'Trig Review', context: 'Review the unit circle and identities from Chapter 0 before tackling this lesson.' },
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
    'completed-example-6',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
