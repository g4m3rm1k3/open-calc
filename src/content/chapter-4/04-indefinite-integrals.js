// FILE: src/content/chapter-4/04-indefinite-integrals.js
export default {
  id: 'ch4-004',
  slug: 'indefinite-integrals',
  chapter: 4,
  order: 4,
  title: 'Indefinite Integrals',
  subtitle: 'Building the antiderivative toolkit — the power rule reversed, and the essential +C',
  tags: ['indefinite integrals', 'antiderivatives', 'power rule', 'integration rules', 'initial value problems', '+C constant', 'trig integrals', 'exponential integral', 'differential equations'],

  hook: {
    question: 'FTC Part 2 says ∫ₐᵇ f(x) dx = F(b) − F(a) where F\' = f. Great — but how do we FIND F? Given f(x) = 3x² − 4x + 7, what is F? Given f(x) = cos(x), what is F? Given f(x) = 1/x, what is F? This lesson systematizes the process of "working derivatives backward," building an integration table from the differentiation table you already know.',
    realWorldContext: 'Antiderivatives are the computational backbone of applied mathematics. Every solution to a differential equation involves finding an antiderivative. In physics, finding position from velocity (x = ∫v dt) and velocity from acceleration (v = ∫a dt) are antiderivative problems. In electrical engineering, finding charge from current (q = ∫i dt) and magnetic flux from EMF are antiderivative problems. In biology, population growth models, epidemic spread, and pharmacokinetics all require integrating rate equations. In economics, finding total cost from marginal cost (TC = ∫MC dq) and consumer surplus from demand curves are antiderivative problems. The indefinite integral is perhaps the single most-computed mathematical object in applied science.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      'An antiderivative of f(x) is any function F(x) with F\'(x) = f(x). The process is differentiation run backwards. Since d/dx[x³] = 3x², the antiderivative of 3x² is x³. Since d/dx[sin(x)] = cos(x), the antiderivative of cos(x) is sin(x). Since d/dx[eˣ] = eˣ, the antiderivative of eˣ is eˣ. Every entry in the differentiation table can be read backwards to give an antiderivative rule.',
      'The critical new feature is the constant of integration, written +C. If F(x) is one antiderivative of f(x), then F(x)+5, F(x)−π, and F(x)+C for any constant C are also antiderivatives, because d/dx[F(x)+C] = F\'(x)+0 = f(x). Conversely, any two antiderivatives of the same function differ by a constant (proved using the MVT: if G\'=F\'=f, then (G−F)\'=0, so G−F=constant). The indefinite integral ∫f(x)dx denotes the entire family of antiderivatives: ∫f(x)dx = F(x)+C. Forgetting the +C is a mathematical error — the antiderivative is a family of functions, not a single function.',
      'The power rule for integration inverts the power rule for differentiation. Since d/dx[xⁿ⁺¹/(n+1)] = xⁿ (for n ≠ −1), we have ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. The exception n = −1 is special: x⁻¹ = 1/x has antiderivative ln|x|, not x⁰/0 (which is undefined). The power rule covers polynomials, roots (fractional powers), and negative powers — a vast class of functions. Any polynomial ∫(aₙxⁿ + ··· + a₁x + a₀) dx is computed term by term.',
      'The linearity of differentiation — d/dx[cf+g] = cf\'+g\' — runs backwards to give linearity of integration: ∫[cf(x)+g(x)]dx = c∫f(x)dx + ∫g(x)dx. This means integrals split across addition and constants factor out. To integrate a sum, integrate each term separately. To integrate a constant multiple, factor it out. Combined with the power rule, this handles any polynomial. The only restriction is that the split must happen BEFORE integrating — you cannot factor or split after integration without reintroducing constants.',
      'Initial value problems (IVPs) pin down the arbitrary constant C using an extra condition — typically a value of the function at a specific point. The procedure: integrate to find F(x) = G(x)+C (the general antiderivative), substitute the given condition F(x₀) = y₀ to find C, and write the specific solution F(x) = G(x) + (y₀ − G(x₀)). IVPs are ubiquitous in physics: "a ball is thrown upward at 20 m/s from a height of 5 m" gives both the initial velocity and initial position, which together determine the height function x(t) = 5 + 20t − 4.9t² completely.',
      'The integration table is finite and exact for elementary functions, but many seemingly simple functions have no elementary antiderivative. The function eˣ² has no antiderivative expressible in terms of polynomials, trig functions, exponentials, and logarithms — despite being smooth and rapidly computable numerically. The same is true for sin(x)/x, √(1−x⁴), and many others. This is not a temporary gap in our knowledge — it was proved rigorously by Liouville in 1835 using what is now called "differential Galois theory." For functions without elementary antiderivatives, Riemann sums or Taylor series must be used. FTC Part 1 still applies: d/dx[∫₀ˣ eᵗ² dt] = eˣ² even though the antiderivative has no closed form.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Never Forget the +C',
        body: 'The indefinite integral ∫f(x)dx represents a FAMILY of functions — all antiderivatives differ by a constant. Writing ∫x² dx = x³/3 is incomplete; the correct answer is ∫x² dx = x³/3 + C. In applications, C is determined by an initial condition. In FTC Part 2, C cancels (F(b)+C − F(a) − C), so any C works — but it must be there conceptually. In differential equations, omitting C leads to a particular solution that may not satisfy the initial condition.',
      },
      {
        type: 'real-world',
        title: 'Initial Value Problems in Physics',
        body: 'Given v(t) = 3t² − 6t and x(0) = 5 (initial position), find position x(t). Integrate: x(t) = t³ − 3t² + C. Apply x(0) = 5: 5 = 0 + C, so C = 5. Answer: x(t) = t³ − 3t² + 5. The initial condition is the physical constraint that pins down the arbitrary constant. Without it, we only know the shape of the motion, not where it starts.',
      },
      {
        type: 'prior-knowledge',
        title: 'Differentiation Table Run Backwards',
        body: 'Every derivative formula gives an antiderivative formula by reading right-to-left:\nd/dx[xⁿ⁺¹/(n+1)] = xⁿ → ∫xⁿdx = xⁿ⁺¹/(n+1)+C\nd/dx[sin x] = cos x → ∫cos x dx = sin x + C\nd/dx[−cos x] = sin x → ∫sin x dx = −cos x + C\nd/dx[eˣ] = eˣ → ∫eˣ dx = eˣ + C\nd/dx[ln|x|] = 1/x → ∫(1/x)dx = ln|x| + C\nd/dx[tan x] = sec²x → ∫sec²x dx = tan x + C\nd/dx[arctan x] = 1/(1+x²) → ∫1/(1+x²) dx = arctan x + C',
      },
      {
        type: 'misconception',
        title: 'There Is No Product Rule for Integration',
        body: "∫f(x)·g(x) dx ≠ (∫f dx)·(∫g dx). There is no general product rule for integrals. The derivative product rule [fg]' = f'g + fg' does NOT reverse into a simple integration formula. Instead, it reverses into 'integration by parts': ∫f g' dx = fg − ∫f' g dx (covered in Calc 2). For now, if you see a product, expand it algebraically before integrating.",
      },
      {
        type: 'history',
        title: "Leibniz's ∫ Notation (1675)",
        body: "Gottfried Wilhelm Leibniz chose the symbol ∫ as an elongated 'S' for 'summa' (Latin for sum), recording it in his notebooks on October 29, 1675. The dx indicates 'an infinitely small piece of x.' Thus ∫f(x)dx literally reads 'the sum of all the infinitely thin rectangles f(x)·dx.' Leibniz's notation has endured for 350 years because it encodes the limit-of-Riemann-sums idea directly in the symbolism.",
      },
    ],
    visualizations: [
                                                        {
        id: 'FunctionPlotter',
        title: 'Family of Antiderivatives',
        caption: 'The graph shows f(x) = x² (bottom) and several members of the antiderivative family F(x) = x³/3 + C for various values of C. Each curve has the same slope at every x-value (equal to x²), but different vertical positions. The initial condition x(0) = k selects the unique member with F(0) = k.',
      },
    ],
  },

  math: {
    prose: [
      'The standard antiderivative table for Calc 1: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1); ∫x⁻¹ dx = ln|x| + C; ∫eˣ dx = eˣ + C; ∫aˣ dx = aˣ/ln(a) + C (a > 0, a ≠ 1); ∫sin(x) dx = −cos(x) + C; ∫cos(x) dx = sin(x) + C; ∫sec²(x) dx = tan(x) + C; ∫csc²(x) dx = −cot(x) + C; ∫sec(x)tan(x) dx = sec(x) + C; ∫1/(1+x²) dx = arctan(x) + C; ∫1/√(1−x²) dx = arcsin(x) + C. Each rule is verified by differentiating the right side.',
      'Linearity of integration: ∫[αf(x) + βg(x)] dx = α∫f(x) dx + β∫g(x) dx. This follows because differentiation is linear: d/dx[αF(x)+βG(x)] = αF\'(x)+βG\'(x) = αf(x)+βg(x) whenever F\' = f and G\' = g. Combined with the table, linearity allows integration of any linear combination of tabulated functions — which includes all polynomials, all linear combinations of trig functions, all polynomial-exponential sums.',
      'Differential equations of the form dy/dx = f(x) are solved directly by integration: y = ∫f(x) dx = F(x)+C. The general solution has one free parameter C; an initial condition y(x₀) = y₀ gives one equation for C, determining the unique particular solution. Higher-order DEs (e.g., d²y/dx² = f(x)) require two integrations, introducing two constants C₁ and C₂, determined by two conditions (typically the value and the derivative at a point). This structure — general solution = homogeneous solution + particular solution — extends throughout differential equations.',
      'A common technique is algebraic manipulation before integration: expand products, separate fractions, complete the square, or use trig identities. For example, ∫(x+1)² dx = ∫(x²+2x+1) dx = x³/3 + x² + x + C (expand before integrating). Or ∫(x³+x)/x dx = ∫(x²+1) dx = x³/3+x+C (divide through first). These algebraic pre-processing steps are not integration techniques per se — they are arithmetic that converts non-standard forms into the standard table forms.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Indefinite Integral',
        body: 'The indefinite integral of \\(f\\) is the family of all antiderivatives:\n\\[\\int f(x)\\,dx = F(x) + C\\]\nwhere \\(F\'(x) = f(x)\\) and \\(C\\) is an arbitrary constant. Any two antiderivatives of \\(f\\) differ by a constant.',
      },
      {
        type: 'theorem',
        title: 'Integration Power Rule',
        body: '\\[\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)\\]\n\\[\\int \\frac{1}{x}\\,dx = \\ln|x| + C\\]\nVerification: \\(\\frac{d}{dx}\\!\\left[\\frac{x^{n+1}}{n+1}\\right] = \\frac{(n+1)x^n}{n+1} = x^n. \\checkmark\\)',
      },
      {
        type: 'theorem',
        title: 'Key Antiderivative Table',
        body: '\\(\\int e^x\\,dx = e^x + C\\)\n\\(\\int \\sin x\\,dx = -\\cos x + C\\)\n\\(\\int \\cos x\\,dx = \\sin x + C\\)\n\\(\\int \\sec^2 x\\,dx = \\tan x + C\\)\n\\(\\int \\frac{1}{1+x^2}\\,dx = \\arctan x + C\\)\n\\(\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x + C\\)',
      },
    ],
    visualizations: [
      ],
  },

  rigor: {
    prose: [
      'The statement "all antiderivatives of f differ by a constant" is a theorem that requires proof. Suppose F\' = f and G\' = f on an interval (a, b). Define H = G − F. Then H\' = G\' − F\' = f − f = 0. By the Mean Value Theorem: for any x₁, x₂ ∈ (a, b), H(x₂) − H(x₁) = H\'(c)(x₂ − x₁) = 0 for some c between x₁ and x₂. Therefore H(x₁) = H(x₂) for all pairs, so H is constant. The proof requires that f (and hence F and G) are defined on a connected interval. On a disconnected domain, different constants can appear on different components (as discussed for ln|x| in Lesson 3).',
      'The "+C" in ∫f dx = F(x)+C is a reminder of this theorem. It encodes the complete solution set of the equation F\' = f: not a single function, but a one-parameter family. From the perspective of ordinary differential equations, the equation y\' = f(x) is a first-order ODE, and its general solution is y = F(x)+C, a one-parameter family. One initial condition y(x₀) = y₀ selects a unique solution. This is the Existence and Uniqueness Theorem for first-order linear ODEs: there is exactly one solution passing through each point (x₀, y₀), provided f is continuous.',
      'Liouville\'s theorem on non-elementary antiderivatives. A function built from constants, x, and the operations +, −, ×, ÷, n-th roots, exp, log, and trigonometric functions is called an "elementary function." Liouville proved in 1835 that many elementary functions — including eˣ², sin(x)/x, 1/ln(x), and √(1−x⁴) — have no elementary antiderivative. The proof uses the structure of differential fields (fields with a derivation satisfying the Leibniz product rule). Liouville\'s theorem implies that Risch\'s algorithm (1969) can decide in finite time whether any given elementary function has an elementary antiderivative — the theoretical basis for all computer algebra systems (Mathematica, Maple, Wolfram Alpha) that compute indefinite integrals.',
      'The distinction between "finding an antiderivative" and "evaluating a definite integral" is important. For definite integrals, FTC requires only that an antiderivative exist, not that it be expressible in closed form. Since every continuous function has an antiderivative (by FTC Part 1: A(x) = ∫ₐˣ f(t) dt is one), every continuous function is Riemann integrable and has a definite integral. But computing the definite integral as F(b) − F(a) requires finding F in explicit form, which is only possible for functions in the antiderivative table (or reducible to it by substitution, parts, partial fractions, etc.). For functions like eˣ², the definite integral must be computed numerically.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Antiderivatives Differ by a Constant',
        body: 'If \\(F\'= f\\) and \\(G\'= f\\) on an interval \\((a,b)\\), then \\(G(x) = F(x) + C\\) for some constant \\(C\\). Proof: let \\(H = G-F\\). Then \\(H\'=0\\), so by the MVT, \\(H\\) is constant.',
      },
      {
        type: 'warning',
        title: 'Some Functions Have No Elementary Antiderivative',
        body: "By Liouville's theorem, \\(\\int e^{x^2}\\,dx\\), \\(\\int \\frac{\\sin x}{x}\\,dx\\), and \\(\\int \\sqrt{1-x^4}\\,dx\\) cannot be expressed in closed form using elementary functions. This is a theorem, not a gap in technique. For such functions, definite integrals must be computed numerically. FTC Part 1 still applies: \\(\\frac{d}{dx}\\int_0^x e^{t^2}\\,dt = e^{x^2}\\), even though the left side has no closed form.",
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-004-ex1',
      title: 'Polynomial: ∫(3x² − 4x + 7) dx',
      problem: '\\text{Find } \\int(3x^2 - 4x + 7)\\,dx. \\text{ Verify by differentiating.}',
      steps: [
        { expression: '\\int(3x^2-4x+7)\\,dx = 3\\int x^2\\,dx - 4\\int x\\,dx + 7\\int dx', annotation: 'Linearity: split the integral term by term and factor out constants.' },
        { expression: '= 3\\cdot\\frac{x^3}{3} - 4\\cdot\\frac{x^2}{2} + 7x + C', annotation: 'Power rule: ∫x²dx = x³/3, ∫x dx = x²/2, ∫dx = x.' },
        { expression: '= x^3 - 2x^2 + 7x + C', annotation: 'Simplify: 3·(x³/3) = x³; 4·(x²/2) = 2x².' },
        { expression: '\\text{Verify: } \\frac{d}{dx}[x^3-2x^2+7x+C] = 3x^2-4x+7 \\checkmark', annotation: 'Differentiate the answer to confirm. The +C disappears.' },
      ],
      conclusion: '∫(3x²−4x+7) dx = x³−2x²+7x+C. Always verify an antiderivative by differentiating — it is the easiest check in calculus.',
    },
    {
      id: 'ch4-004-ex2',
      title: 'Fractional and Negative Powers: ∫(√x + 1/x²) dx',
      problem: '\\text{Find } \\int\\!\\left(\\sqrt{x} + \\frac{1}{x^2}\\right)dx.',
      steps: [
        { expression: '\\int\\!\\left(x^{1/2} + x^{-2}\\right)dx', annotation: 'Rewrite using exponent notation: √x = x^(1/2), 1/x² = x^(−2).' },
        { expression: '= \\frac{x^{1/2+1}}{1/2+1} + \\frac{x^{-2+1}}{-2+1} + C', annotation: 'Power rule for each term: ∫xⁿdx = xⁿ⁺¹/(n+1)+C.' },
        { expression: '= \\frac{x^{3/2}}{3/2} + \\frac{x^{-1}}{-1} + C', annotation: 'Simplify the exponents.' },
        { expression: '= \\frac{2}{3}x^{3/2} - x^{-1} + C = \\frac{2}{3}x\\sqrt{x} - \\frac{1}{x} + C', annotation: 'Simplify: 1/(3/2) = 2/3; 1/(−1) = −1. Rewrite x^(−1) = 1/x and x^(3/2) = x√x.' },
      ],
      conclusion: '∫(√x + 1/x²) dx = (2/3)x^(3/2) − 1/x + C. The power rule works for all real powers except n = −1. Check: d/dx[(2/3)x^(3/2)] = (2/3)·(3/2)x^(1/2) = x^(1/2) = √x ✓; d/dx[−x^(−1)] = x^(−2) = 1/x² ✓.',
    },
    {
      id: 'ch4-004-ex3',
      title: 'Initial Value Problem: Free Fall',
      problem: '\\text{A ball is thrown upward at } v_0 = 20 \\text{ m/s from height } h_0 = 5 \\text{ m. Acceleration is } a(t) = -9.8 \\text{ m/s}^2. \\text{ Find height } h(t).',
      steps: [
        { expression: 'v(t) = \\int a(t)\\,dt = \\int(-9.8)\\,dt = -9.8t + C_1', annotation: 'Integrate acceleration to find velocity. C₁ is a constant.' },
        { expression: 'v(0) = 20 \\Rightarrow -9.8(0) + C_1 = 20 \\Rightarrow C_1 = 20', annotation: 'Apply initial velocity condition v(0) = 20 to find C₁.' },
        { expression: 'v(t) = -9.8t + 20', annotation: 'Specific velocity function.' },
        { expression: 'h(t) = \\int v(t)\\,dt = \\int(-9.8t+20)\\,dt = -4.9t^2 + 20t + C_2', annotation: 'Integrate velocity to find height. C₂ is a second constant.' },
        { expression: 'h(0) = 5 \\Rightarrow -4.9(0) + 20(0) + C_2 = 5 \\Rightarrow C_2 = 5', annotation: 'Apply initial height condition h(0) = 5 to find C₂.' },
        { expression: 'h(t) = -4.9t^2 + 20t + 5', annotation: 'The complete height function. This is the familiar projectile equation.' },
      ],
      conclusion: 'h(t) = −4.9t² + 20t + 5 metres. Two initial conditions (v₀ = 20, h₀ = 5) determined two constants of integration. This is the standard free-fall equation — integrating twice from a = −g gives the quadratic height formula.',
    },
    {
      id: 'ch4-004-ex4',
      title: 'Trigonometric: ∫(sin(x) + cos(x)) dx',
      problem: '\\text{Find } \\int(\\sin(x) + \\cos(x))\\,dx \\text{ and verify.}',
      steps: [
        { expression: '\\int(\\sin x + \\cos x)\\,dx = \\int \\sin x\\,dx + \\int \\cos x\\,dx', annotation: 'Split by linearity.' },
        { expression: '= -\\cos x + \\sin x + C', annotation: '∫sin x dx = −cos x, ∫cos x dx = sin x. Combine constants into one C.' },
        { expression: '\\text{Verify: } \\frac{d}{dx}[-\\cos x + \\sin x] = \\sin x + \\cos x \\checkmark', annotation: 'd/dx[−cos x] = sin x; d/dx[sin x] = cos x. Sum = sin x + cos x. ✓' },
      ],
      conclusion: '∫(sin x + cos x) dx = sin x − cos x + C. Trigonometric antiderivatives are straightforward from the table; the key is remembering the sign: ∫sin = −cos (not +cos).',
    },
    {
      id: 'ch4-004-ex5',
      title: 'Expand Before Integrating: ∫eˣ(2 + 3eˣ) dx',
      problem: '\\text{Find } \\int e^x(2 + 3e^x)\\,dx.',
      steps: [
        { expression: '\\int e^x(2+3e^x)\\,dx = \\int (2e^x + 3e^{2x})\\,dx', annotation: 'Distribute: eˣ·2 = 2eˣ, eˣ·3eˣ = 3e^(2x). Always expand products before integrating — there is no product rule for integrals.' },
        { expression: '= 2\\int e^x\\,dx + 3\\int e^{2x}\\,dx', annotation: 'Split and factor by linearity.' },
        { expression: '= 2e^x + 3\\cdot\\frac{e^{2x}}{2} + C = 2e^x + \\frac{3}{2}e^{2x} + C', annotation: '∫eˣ dx = eˣ. For ∫e^(2x) dx: guess e^(2x)/2, check d/dx[e^(2x)/2] = e^(2x) ✓ (this is the substitution u=2x, du=2dx in action).' },
      ],
      conclusion: '∫eˣ(2+3eˣ)dx = 2eˣ + (3/2)e^(2x) + C. The key step is expanding the product first — there is no "product rule" for integration. Whenever you see a product, try expanding, simplifying, or using integration by parts (a later technique).',
    },
    {
      id: 'ch4-004-ex6',
      title: 'IVP for Projectile: Finding Position from Acceleration',
      problem: '\\text{A projectile: } a(t) = -32 \\text{ ft/s}^2, \\; v(0) = 64 \\text{ ft/s}, \\; x(0) = 0. \\text{ Find } x(t) \\text{ and the maximum height.}',
      steps: [
        { expression: 'v(t) = \\int(-32)\\,dt = -32t + C_1', annotation: 'Integrate constant acceleration.' },
        { expression: 'v(0) = 64 \\Rightarrow C_1 = 64 \\Rightarrow v(t) = -32t + 64', annotation: 'Initial velocity condition pins down C₁.' },
        { expression: 'x(t) = \\int(-32t+64)\\,dt = -16t^2 + 64t + C_2', annotation: 'Integrate velocity.' },
        { expression: 'x(0) = 0 \\Rightarrow C_2 = 0 \\Rightarrow x(t) = -16t^2 + 64t', annotation: 'Initial position = 0 gives C₂ = 0.' },
        { expression: 'v(t) = 0 \\Rightarrow -32t+64 = 0 \\Rightarrow t = 2 \\text{ s}', annotation: 'Maximum height when v = 0.' },
        { expression: 'x(2) = -16(4) + 64(2) = -64 + 128 = 64 \\text{ ft}', annotation: 'Maximum height = 64 ft, reached at t = 2 s.' },
      ],
      conclusion: 'x(t) = −16t² + 64t ft. Maximum height = 64 ft at t = 2 s. This is the classic vertical throw under gravity formula (in feet). In SI units: x(t) = −4.9t² + v₀t + x₀.',
    },
    {
      id: 'ch4-004-ex7',
      title: 'Simplify First: ∫(x+1)² dx',
      problem: '\\text{Find } \\int (x+1)^2\\,dx.',
      steps: [
        { expression: '(x+1)^2 = x^2 + 2x + 1', annotation: 'Expand the square before integrating. Do NOT try to apply a "power rule" with inner function (x+1) without accounting for the chain rule — that requires substitution.' },
        { expression: '\\int(x^2+2x+1)\\,dx = \\frac{x^3}{3} + x^2 + x + C', annotation: 'Integrate term by term: ∫x²dx = x³/3, ∫2x dx = x², ∫dx = x.' },
        { expression: '\\text{Verify: } \\frac{d}{dx}\\!\\left[\\frac{x^3}{3}+x^2+x\\right] = x^2+2x+1 = (x+1)^2 \\checkmark', annotation: 'Differentiate: x²+2x+1 = (x+1)². ✓' },
      ],
      conclusion: '∫(x+1)² dx = x³/3 + x² + x + C. Expanding before integrating is the easiest approach for polynomial expressions. Note: (x+1)³/3 + C would be WRONG — the chain rule would add a factor of 1 in this case (since (d/dx)(x+1) = 1), making it accidentally correct here, but this coincidence breaks for (ax+b)².',
    },
  ],

  challenges: [
    {
      id: 'ch4-004-ch1',
      difficulty: 'easy',
      problem: 'Find the following antiderivatives: (a) ∫(5x⁴ − 3x² + 2x − 1) dx. (b) ∫(x^(−1/2) + 4x^(3/2)) dx. (c) ∫(2sin x − 3cos x) dx.',
      hint: 'Power rule for (a) and (b). Trig table for (c). Check each answer by differentiating.',
      walkthrough: [
        { expression: '\\text{(a) } \\int(5x^4-3x^2+2x-1)\\,dx = x^5 - x^3 + x^2 - x + C', annotation: '∫5x⁴=x⁵, ∫−3x²=−x³, ∫2x=x², ∫−1=−x.' },
        { expression: '\\text{(b) } \\int(x^{-1/2}+4x^{3/2})\\,dx = 2x^{1/2} + \\frac{8}{5}x^{5/2} + C', annotation: '∫x^(−1/2)=x^(1/2)/(1/2)=2x^(1/2); ∫4x^(3/2)=4x^(5/2)/(5/2)=(8/5)x^(5/2).' },
        { expression: '\\text{(c) } \\int(2\\sin x - 3\\cos x)\\,dx = -2\\cos x - 3\\sin x + C', annotation: '∫sin x = −cos x; ∫cos x = sin x. So 2∫sin = −2cos; −3∫cos = −3sin.' },
      ],
      answer: '\\text{(a) } x^5-x^3+x^2-x+C \\quad \\text{(b) } 2\\sqrt{x}+\\tfrac{8}{5}x^{5/2}+C \\quad \\text{(c) } -2\\cos x-3\\sin x+C',
    },
    {
      id: 'ch4-004-ch2',
      difficulty: 'medium',
      problem: 'A particle moves along a line with acceleration a(t) = 6t − 4 m/s². At t = 0, the velocity is v(0) = −2 m/s and the position is x(0) = 3 m. (a) Find v(t). (b) Find x(t). (c) At what time(s) is the particle at rest? (d) What is the position when the particle first comes to rest?',
      hint: 'Integrate twice. Apply ICs to find C₁ and C₂. Set v(t)=0 for part (c). Substitute into x(t) for part (d).',
      walkthrough: [
        { expression: 'v(t) = \\int(6t-4)\\,dt = 3t^2 - 4t + C_1', annotation: 'Integrate a(t).' },
        { expression: 'v(0) = -2 \\Rightarrow C_1 = -2 \\Rightarrow v(t) = 3t^2-4t-2', annotation: 'IC: v(0) = C₁ = −2.' },
        { expression: 'x(t) = \\int(3t^2-4t-2)\\,dt = t^3-2t^2-2t+C_2', annotation: 'Integrate v(t).' },
        { expression: 'x(0) = 3 \\Rightarrow C_2 = 3 \\Rightarrow x(t) = t^3-2t^2-2t+3', annotation: 'IC: x(0) = C₂ = 3.' },
        { expression: 'v(t) = 0: \\; 3t^2-4t-2 = 0 \\Rightarrow t = \\frac{4 \\pm \\sqrt{16+24}}{6} = \\frac{4 \\pm \\sqrt{40}}{6} = \\frac{2 \\pm \\sqrt{10}}{3}', annotation: 'Quadratic formula. √40 = 2√10.' },
        { expression: 't_1 = \\frac{2-\\sqrt{10}}{3} \\approx -0.387 \\text{ (before } t=0) \\quad t_2 = \\frac{2+\\sqrt{10}}{3} \\approx 1.721', annotation: 'Only t₂ > 0 is relevant for t ≥ 0.' },
        { expression: 'x(t_2) = t_2^3 - 2t_2^2 - 2t_2 + 3 \\approx (1.721)^3 - 2(1.721)^2 - 2(1.721) + 3 \\approx 5.093 - 5.923 - 3.442 + 3 \\approx -1.272 \\text{ m}', annotation: 'Substitute t₂ ≈ 1.721 into x(t).' },
      ],
      answer: 'v(t)=3t^2-4t-2,\\; x(t)=t^3-2t^2-2t+3.\\text{ First rest at } t = (2+\\sqrt{10})/3 \\approx 1.72 \\text{ s, position} \\approx -1.27 \\text{ m}.',
    },
    {
      id: 'ch4-004-ch3',
      difficulty: 'hard',
      problem: 'Prove rigorously that the antiderivative is unique up to a constant: if F\'(x) = 0 for all x in an interval (a,b), then F(x) = C (constant) on (a,b). Use only the Mean Value Theorem. Then explain why this fails on a disconnected domain, giving a concrete example.',
      hint: 'For any two points x₁ < x₂ in (a,b), the MVT gives F(x₂)−F(x₁) = F\'(c)(x₂−x₁) for some c. For the disconnected domain, try F(x) = 0 for x < 0 and F(x) = 1 for x > 0.',
      walkthrough: [
        { expression: '\\text{Let } x_1, x_2 \\in (a,b) \\text{ with } x_1 < x_2.', annotation: 'Pick any two points in the interval.' },
        { expression: '\\text{MVT: } \\exists c \\in (x_1, x_2): F(x_2) - F(x_1) = F\'(c)(x_2-x_1)', annotation: 'F is differentiable on (a,b) (given F\' exists). MVT applies on the closed interval [x₁,x₂].' },
        { expression: 'F\'(c) = 0 \\Rightarrow F(x_2) - F(x_1) = 0 \\cdot (x_2-x_1) = 0', annotation: 'By hypothesis F\'= 0 everywhere, so F\'(c) = 0.' },
        { expression: 'F(x_2) = F(x_1) \\text{ for all } x_1, x_2 \\in (a,b) \\Rightarrow F \\text{ is constant on } (a,b). \\quad \\square', annotation: 'Any two points have the same function value. F is constant.' },
        { expression: '\\text{Disconnected domain: } D = (-1,0) \\cup (0,1). \\text{ Define } F(x) = \\begin{cases} 0 & x \\in (-1,0) \\\\ 1 & x \\in (0,1)\\end{cases}', annotation: 'F is differentiable on D with F\' = 0 everywhere on D, but F takes two different values.' },
        { expression: '\\text{The MVT requires an INTERVAL — it cannot be applied across the gap at } x=0.', annotation: 'The key: MVT requires the function to be continuous on a closed connected interval. D has a gap, so the MVT cannot connect the two components.' },
      ],
      answer: '\\text{On a connected interval: } F\'=0 \\Rightarrow F = C. \\text{ On disconnected domains, different constants on each component are possible.}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'fundamental-theorem', label: 'Fundamental Theorem of Calculus', context: 'Lesson 3 established that ∫ₐᵇ f = F(b)−F(a). This lesson builds the toolkit of antiderivatives F needed to apply that theorem.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'Every integral in Lesson 5 is computed using the antiderivative table built here.' },
    { lessonSlug: 'definite-integral', label: 'The Definite Integral', context: 'The indefinite integral (family of antiderivatives) and the definite integral (a number) are related by FTC but are conceptually distinct. Review Lesson 2 to keep the distinction clear.' },
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
    'completed-example-7',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  quiz: [
    {
      id: 'indef-q1',
      type: 'input',
      text: 'Find \\(\\int x^4\\,dx\\) (omit \\(+C\\)).',
      answer: 'x^5/5',
      hints: ['Power rule: \\(\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C\\).', 'n = 4, so exponent becomes 5.'],
      reviewSection: 'Math — Power rule for integrals',
    },
    {
      id: 'indef-q2',
      type: 'input',
      text: 'Find \\(\\int x^{-2}\\,dx\\) (omit \\(+C\\)).',
      answer: '-x^(-1)',
      hints: ['Apply the power rule with \\(n = -2\\): new exponent is \\(-1\\), coefficient is \\(\\frac{1}{-1} = -1\\).'],
      reviewSection: 'Math — Power rule for negative exponents',
    },
    {
      id: 'indef-q3',
      type: 'input',
      text: 'Find \\(\\int e^x\\,dx\\) (omit \\(+C\\)).',
      answer: 'e^x',
      hints: ['The exponential function is its own antiderivative.'],
      reviewSection: 'Math — Integral of e^x',
    },
    {
      id: 'indef-q4',
      type: 'input',
      text: 'Find \\(\\int \\frac{1}{x}\\,dx\\) (omit \\(+C\\); assume \\(x>0\\)).',
      answer: 'log(x)',
      hints: ['\\(\\int \\frac{1}{x}\\,dx = \\ln|x| + C\\).'],
      reviewSection: 'Math — Integral of 1/x',
    },
    {
      id: 'indef-q5',
      type: 'input',
      text: 'Find \\(\\int \\sin(x)\\,dx\\) (omit \\(+C\\)).',
      answer: '-cos(x)',
      hints: ['Check by differentiating: \\(\\frac{d}{dx}(-\\cos x) = \\sin x\\). ✓'],
      reviewSection: 'Math — Integral of sin(x)',
    },
    {
      id: 'indef-q6',
      type: 'input',
      text: 'Find \\(\\int \\cos(x)\\,dx\\) (omit \\(+C\\)).',
      answer: 'sin(x)',
      hints: ['Check by differentiating: \\(\\frac{d}{dx}(\\sin x) = \\cos x\\). ✓'],
      reviewSection: 'Math — Integral of cos(x)',
    },
    {
      id: 'indef-q7',
      type: 'input',
      text: 'Find \\(\\int (3x^2 + 2x)\\,dx\\) (omit \\(+C\\)).',
      answer: 'x^3 + x^2',
      hints: ['Integrate term by term using the power rule.'],
      reviewSection: 'Math — Linearity and power rule',
    },
    {
      id: 'indef-q8',
      type: 'choice',
      text: 'Why do we write \\(+C\\) in indefinite integrals?',
      options: [
        'To account for measurement error',
        'Because any constant can be added to an antiderivative and the derivative is still the same',
        'To make the integral converge',
        'It is only needed for trig functions',
      ],
      answer: 'Because any constant can be added to an antiderivative and the derivative is still the same',
      hints: ['The derivative of a constant is zero, so \\(F + C\\) and \\(F\\) have the same derivative.'],
      reviewSection: 'Math — The constant of integration',
    },
    {
      id: 'indef-q9',
      type: 'input',
      text: 'Find \\(\\int 5\\,dx\\) (omit \\(+C\\)).',
      answer: '5*x',
      hints: ['A constant integrates to the constant times \\(x\\): \\(\\int c\\,dx = cx + C\\).'],
      reviewSection: 'Math — Integral of a constant',
    },
    {
      id: 'indef-q10',
      type: 'input',
      text: 'Find \\(\\int x^{1/2}\\,dx\\) (omit \\(+C\\)).',
      answer: '(2/3)*x^(3/2)',
      hints: ['Power rule: \\(n = 1/2\\), new exponent = \\(3/2\\), coefficient = \\(\\frac{1}{3/2} = \\frac{2}{3}\\).'],
      reviewSection: 'Math — Power rule (fractional exponent)',
    },
  ],
}
