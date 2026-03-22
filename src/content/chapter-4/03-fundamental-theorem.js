// FILE: src/content/chapter-4/03-fundamental-theorem.js
export default {
  id: 'ch4-003',
  slug: 'fundamental-theorem',
  chapter: 4,
  order: 3,
  title: 'The Fundamental Theorem of Calculus',
  subtitle: 'Differentiation and integration are inverse operations — the deepest result in elementary mathematics',
  tags: ['fundamental theorem of calculus', 'FTC Part 1', 'FTC Part 2', 'antiderivative', 'accumulation function', 'Newton-Leibniz', 'inverse operations', 'evaluation theorem'],

  hook: {
    question: 'Define A(x) = ∫₀ˣ t² dt — the area under the parabola from 0 to x. A(x) is a function of x. What is A\'(x)? Without computing anything, make a guess. Then think: if A(x) is the "accumulated area so far," what happens to A when x increases by a tiny amount dx? How much new area is added?',
    realWorldContext: 'The Fundamental Theorem of Calculus is the reason calculus is computable. Without it, every integral would require evaluating a limit of Riemann sums — a process that, for most functions, cannot be completed in closed form. With it, any function whose antiderivative can be found algebraically can be integrated in seconds. The theorem was independently discovered by Isaac Newton (who called it the "method of fluxions") and Gottfried Wilhelm Leibniz (who developed the ∫ and dx/dy notation still used today). Their parallel discovery in the 1660s–1680s, and the subsequent priority dispute, represent one of the most consequential — and contentious — episodes in the history of science. The theorem underlies every area, volume, center-of-mass, work, probability, and differential equation calculation in engineering and physics.',
    previewVisualizationId: 'FTCLink',
  },

  intuition: {
    prose: [
      'The Fundamental Theorem has two parts, and both parts are surprising. Part 1 says: if you define A(x) = ∫ₐˣ f(t) dt (the accumulated area from a to x), then A is differentiable and A\'(x) = f(x). The derivative of the accumulated area is the original function. Differentiation undoes integration. Part 2 says: if F is any antiderivative of f (meaning F\' = f), then ∫ₐᵇ f(x) dx = F(b) − F(a). To compute the area under f from a to b, find any antiderivative of f and subtract its values at the endpoints. Integration undoes differentiation (up to a constant).',
      'Part 1 can be understood physically. Imagine driving a car and tracking position A(x) at every moment. Your speedometer reads f(x) — the instantaneous rate of change of accumulated position. Part 1 says: if you know the accumulated position A(x), its derivative A\'(x) is exactly your current speed f(x). The rate at which the "area counter" advances is equal to the height of the function at that exact moment. This is compelling: adding a thin strip of width dx and height f(x) to the accumulated area increases A by approximately f(x)·dx, so ΔA/Δx ≈ f(x), and in the limit A\'(x) = f(x).',
      'Part 2 follows from Part 1 by a beautiful algebraic argument. Suppose F is any antiderivative of f, so F\' = f. We also know A\'= f where A(x) = ∫ₐˣ f(t)dt. So A\' = F\' on [a, b], which means A − F is a function with zero derivative — and by the Mean Value Theorem, A(x) − F(x) = constant. Call it C. Evaluate at x = a: A(a) − F(a) = C. But A(a) = ∫ₐᵃ f = 0. So C = −F(a), giving A(x) = F(x) − F(a) for all x. At x = b: ∫ₐᵇ f(t)dt = A(b) = F(b) − F(a). This derivation is the logical core of FTC Part 2.',
      'The notation F(b) − F(a) is so common it has its own shorthand: [F(x)]ₐᵇ, read "F of x evaluated from a to b." The calculation ∫₀³ x² dx = [x³/3]₀³ = 27/3 − 0/3 = 9 is a typical application: find the antiderivative (x³/3), evaluate at the upper limit (3³/3 = 9), subtract the value at the lower limit (0³/3 = 0). Result: 9. What would have taken a pages-long Riemann sum calculation is now three lines of algebra.',
      'Part 1 also has a chain rule version for when the upper limit of integration is a function of x rather than x itself. If g is differentiable, then d/dx[∫ₐ^(g(x)) f(t) dt] = f(g(x))·g\'(x). This is FTC Part 1 composed with the chain rule: the outer derivative is f(g(x)) (the function evaluated at the upper limit), and g\'(x) comes from the chain rule. For example, d/dx[∫₀^(x²) sin(t) dt] = sin(x²)·2x. This generalization appears constantly in differential equations and in the Leibniz integral rule.',
      'The historical importance of the FTC cannot be overstated. Before Newton and Leibniz, computing areas, volumes, and arc lengths required ad-hoc geometric arguments — brilliant but non-systematic. After the FTC, the problem of computing any definite integral was reduced to the problem of finding an antiderivative: a systematic algebraic task. The next century saw an explosion of mathematical physics, as Newton\'s laws of motion combined with the FTC to produce exact predictions for planetary orbits, projectile trajectories, wave propagation, and eventually Maxwell\'s equations of electromagnetism. Every model of physical reality that uses differential equations ultimately relies on the FTC.',
    ],
    callouts: [
      {
        type: 'history',
        title: 'Newton, Leibniz, and the Priority Dispute',
        body: 'Isaac Newton developed the FTC around 1666 but did not publish it until 1687 (in Principia Mathematica). Gottfried Leibniz independently developed the same result around 1675–1676 and published it in 1684. Leibniz\'s notation — ∫ for integral, dx for differential — was adopted universally; Newton\'s "fluxion" notation (ẋ for derivative) is used only in mechanics today. The resulting dispute over who discovered calculus first split European mathematics into British and Continental camps for a century and retarded mathematical progress in England, which loyally used Newton\'s inferior notation long after the Continent had moved on with Leibniz\'s more flexible system. The historical lesson: good notation matters enormously.',
      },
      {
        type: 'prior-knowledge',
        title: 'You Already Knew This Physically',
        body: 'Position x(t) is the antiderivative of velocity v(t): v = dx/dt means x(t) = ∫v dt + x(0). You have used this in kinematics for years. The FTC is the formal theorem behind this: integrating the rate of change (v) gives back the quantity (x). The notation ∫₀ᵀ v(t) dt = x(T) − x(0) is precisely FTC Part 2 applied to the position-velocity relationship. Every kinematics calculation you have done was an application of the Fundamental Theorem of Calculus.',
      },
      {
        type: 'warning',
        title: 'Discontinuity Invalidates the FTC',
        body: 'FTC Part 2 requires that f be continuous on [a, b] — specifically, that f has no vertical asymptotes or jump discontinuities in the interval of integration. A famous "error" is ∫₋₁¹ (1/x) dx = [ln|x|]₋₁¹ = ln(1) − ln(1) = 0. This is WRONG. The function 1/x is not defined (let alone continuous) at x = 0, and the integral does not exist as an ordinary Riemann integral. The formula is not valid. Whenever a potential singularity exists inside [a, b], you must check continuity before applying FTC Part 2.',
      },
      {
        type: 'misconception',
        title: 'd/dx[∫₀^(x²) f(t) dt] ≠ f(x²) — Don\'t Forget the Chain Rule!',
        body: "When differentiating ∫₀^(g(x)) f(t) dt, you MUST include the chain rule factor g'(x): the answer is f(g(x))·g'(x), not just f(g(x)). For d/dx[∫₀^(x²) sin(t) dt]: CORRECT = sin(x²)·2x. WRONG = sin(x²). The 2x factor from differentiating x² is essential. This is the #1 error students make with FTC Part 1.",
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Fundamental Theorem of Calculus 1  |  Geometric Idea + Chain Rule Example",
        props: { url: "https://www.youtube.com/embed/hAfpl8jLFOs" }
      },
      {
        id: 'FTCLink',
        title: 'The Accumulation Function A(x) and its Derivative',
        caption: 'The left panel shows f(t) with the accumulated area A(x) = ∫₀ˣ f(t) dt shaded. The right panel shows A(x) as a function of x. Drag the slider to change x and observe: A increases when f > 0, decreases when f < 0, and has a horizontal tangent when f = 0. The slope of A(x) at each x is exactly f(x) — FTC Part 1.',
      },
    ],
  },

  math: {
    prose: [
      'Fundamental Theorem of Calculus, Part 1: let f be continuous on [a, b], and define the accumulation function A(x) = ∫ₐˣ f(t) dt for x ∈ [a, b]. Then A is differentiable on (a, b) and A\'(x) = f(x). Proof: A\'(x) = lim_{h→0} [A(x+h) − A(x)]/h = lim_{h→0} (1/h) ∫ₓˣ⁺ʰ f(t) dt. By the MVT for integrals, (1/h) ∫ₓˣ⁺ʰ f(t) dt = f(c_h) for some c_h between x and x+h. As h → 0, c_h → x, and by continuity of f, f(c_h) → f(x). Therefore A\'(x) = f(x). ∎',
      'Fundamental Theorem of Calculus, Part 2 (Evaluation Theorem): let f be continuous on [a, b] and let F be any antiderivative of f (F\' = f). Then ∫ₐᵇ f(x) dx = F(b) − F(a). Proof: let A(x) = ∫ₐˣ f(t) dt. By Part 1, A\' = f. Also F\' = f. So (A − F)\' = 0 on (a, b). By Corollary to the MVT: A(x) − F(x) = C for some constant C. Evaluate at x = a: 0 − F(a) = C, so C = −F(a). Therefore A(x) = F(x) − F(a). At x = b: ∫ₐᵇ f = A(b) = F(b) − F(a). ∎',
      'The Chain Rule version of FTC Part 1: if g is differentiable and f is continuous, then d/dx[∫ₐ^(g(x)) f(t) dt] = f(g(x))·g\'(x). This follows from writing the integral as A(g(x)) where A(u) = ∫ₐᵘ f(t) dt, and applying the chain rule: d/dx[A(g(x))] = A\'(g(x))·g\'(x) = f(g(x))·g\'(x). The lower limit can also depend on x: d/dx[∫_{h(x)}^{g(x)} f(t) dt] = f(g(x))·g\'(x) − f(h(x))·h\'(x).',
      'The notation [F(x)]ₐᵇ = F(b) − F(a) is standard. An antiderivative F of f is sometimes called an "indefinite integral" and written ∫ f(x) dx = F(x) + C, where C is an arbitrary constant. The "+C" is essential: every antiderivative differs from every other by a constant, because if F\' = f and G\' = f, then (G − F)\' = 0 so G − F = C. When applying FTC Part 2, any choice of C works because it cancels: (F(b)+C) − (F(a)+C) = F(b) − F(a).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Fundamental Theorem of Calculus, Part 1',
        body: 'If \\(f\\) is continuous on \\([a,b]\\) and \\(A(x) = \\int_a^x f(t)\\,dt\\), then \\(A\\) is differentiable and\n\\[A\'(x) = f(x).\\]\nThe accumulation function\'s derivative is the original integrand.',
      },
      {
        type: 'theorem',
        title: 'Fundamental Theorem of Calculus, Part 2',
        body: 'If \\(f\\) is continuous on \\([a,b]\\) and \\(F\' = f\\), then\n\\[\\int_a^b f(x)\\,dx = F(b) - F(a) = \\bigl[F(x)\\bigr]_a^b.\\]\nTo integrate \\(f\\), find any antiderivative \\(F\\) and subtract endpoint values.',
      },
      {
        type: 'definition',
        title: 'Chain Rule Form of FTC Part 1',
        body: 'If \\(f\\) is continuous and \\(g\\) is differentiable:\n\\[\\frac{d}{dx}\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\cdot g\'(x).\\]\nMore generally:\n\\[\\frac{d}{dx}\\int_{h(x)}^{g(x)} f(t)\\,dt = f(g(x))\\,g\'(x) - f(h(x))\\,h\'(x).\\]',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Fundamental Theorem of Calculus II",
        props: { url: "https://www.youtube.com/embed/sRDf3WozXHc" }
      },],
  },

  rigor: {
    title: 'Formal Proof: The Moving Boundary',
    visualizationId: 'FTCGeometricProof',
    proofSteps: [
      {
        expression: 'A(x) = \\int_a^x f(t) \\, dt',
        annotation: 'Define "Area so far" as a function of its upper boundary x.',
      },
      {
        expression: '\\Delta A = A(x+h) - A(x)',
        annotation: 'The change in area when we move the boundary by a small step h.',
      },
      {
        expression: '\\Delta A = \\int_x^{x+h} f(t) \\, dt',
        annotation: 'This is the area of a vertical sliver of width h.',
      },
      {
        expression: 'm \\cdot h \\leq \\int_x^{x+h} f(t) \\, dt \\leq M \\cdot h',
        annotation: 'Squeeze Theorem: the sliver is bounded by rectangles using the min (m) and max (M) of f on [x, x+h].',
      },
      {
        expression: 'A\'(x) = \\lim_{h \\to 0} \\frac{1}{h} \\int_x^{x+h} f(t) \\, dt = f(x)',
        annotation: 'As h vanishes, the min and max both crush into f(x). The derivative of area is height.',
      }
    ],
    prose: [
      'The proof of FTC Part 1 relies critically on two ingredients: the continuity of f (used in the MVT for integrals and in the passage to the limit f(c_h) → f(x)) and the fact that A(x) = ∫ₐˣ f(t) dt is well-defined, which requires f to be integrable on [a, x] for each x ∈ [a, b]. Both conditions are guaranteed by f being continuous on [a, b]. If f is merely integrable but not continuous, A is still defined and still satisfies A(x₀)→A(x) as x₀→x (A is continuous), but A may fail to be differentiable at points where f is discontinuous. The derivative A\'(x) = f(x) holds at every point of continuity of f.',
      'The key step in the proof — that (1/h)∫ₓˣ⁺ʰ f(t) dt → f(x) — deserves a fully explicit argument. For any ε > 0, by continuity of f at x, there exists δ > 0 such that |f(t) − f(x)| < ε whenever |t − x| < δ. For |h| < δ, every t ∈ [x, x+h] satisfies |t − x| ≤ |h| < δ, so |f(t) − f(x)| < ε. Therefore |(1/h)∫ₓˣ⁺ʰ f(t) dt − f(x)| = |(1/h)∫ₓˣ⁺ʰ [f(t)−f(x)] dt| ≤ (1/|h|)∫ₓˣ⁺ʰ ε|dt| = ε. Since ε was arbitrary, the limit equals f(x). This argument works for both positive and negative h.',
      'FTC Part 2 follows immediately from Part 1 and the Mean Value Theorem. Since A\'(x) = f(x) and F\'(x) = f(x), the function (A - F) has a zero derivative and must be a constant C. By checking the boundary at x=a, where A(a) = 0, we find C = -F(a). Thus A(b) = F(b) - F(a), which is the evaluation formula we use every day.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'A Function with Zero Derivative Is Constant (Connected Domain)',
        body: 'If \\(H\'(x) = 0\\) for all \\(x \\in (a,b)\\), then \\(H(x) = C\\) (constant) on \\((a,b)\\). Proof: for any \\(x_1, x_2 \\in (a,b)\\), the MVT gives \\(H(x_2)-H(x_1) = H\'(c)(x_2-x_1) = 0\\). So \\(H(x_1)=H(x_2)\\) for all pairs — \\(H\\) is constant.',
      },
      {
        type: 'warning',
        title: 'FTC Requires Continuity on the Entire Interval',
        body: 'The integral \\(\\int_{-1}^{1} \\frac{1}{x^2}\\,dx\\) appears to equal \\([-1/x]_{-1}^{1} = -1-1=-2\\). This is wrong. \\(1/x^2\\) is not defined at \\(x=0\\), which is inside \\([-1,1]\\). The function is not continuous on the interval, FTC Part 2 does not apply, and the integral does not exist (it diverges to \\(+\\infty\\) as an improper integral). Always check for singularities before applying FTC Part 2.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-003-ex1',
      title: 'FTC Part 1: Differentiating an Integral',
      problem: '\\text{Find } \\frac{d}{dx}\\int_0^x \\sin(t^2)\\,dt.',
      visualizationId: 'FTCLink',
      steps: [
        { expression: '\\text{Let } A(x) = \\int_0^x \\sin(t^2)\\,dt', annotation: 'Identify the accumulation function. The integrand is f(t) = sin(t²), which is continuous everywhere.' },
        { expression: '\\text{By FTC Part 1: } A\'(x) = f(x) = \\sin(x^2)', annotation: 'Apply FTC Part 1 directly: the derivative of the accumulation function equals the integrand evaluated at the upper limit.' },
        { expression: '\\frac{d}{dx}\\int_0^x \\sin(t^2)\\,dt = \\sin(x^2)', annotation: 'Final answer. Note: sin(t²) has no elementary antiderivative — without FTC Part 1, we could not differentiate this integral at all.' },
      ],
      conclusion: 'd/dx[∫₀ˣ sin(t²)dt] = sin(x²). FTC Part 1 applies even when the integrand has no elementary antiderivative. The theorem differentiates any continuous function — it does not require that an antiderivative be expressible in closed form.',
    },
    {
      id: 'ch4-003-ex2',
      title: 'Chain Rule + FTC Part 1',
      problem: '\\text{Find } \\frac{d}{dx}\\int_3^{x^2} e^t\\,dt.',
      steps: [
        { expression: '\\text{Let } u = x^2. \\text{ Define } A(u) = \\int_3^u e^t\\,dt.', annotation: 'The upper limit is g(x) = x², not x itself. Use the chain rule: d/dx[A(g(x))] = A\'(g(x))·g\'(x).' },
        { expression: 'A\'(u) = e^u \\quad \\text{(FTC Part 1)}', annotation: 'The derivative of the accumulation function with respect to its upper limit is the integrand evaluated at the upper limit.' },
        { expression: '\\frac{d}{dx}\\int_3^{x^2} e^t\\,dt = A\'(x^2) \\cdot \\frac{d}{dx}[x^2] = e^{x^2} \\cdot 2x', annotation: 'Chain rule: A\'(g(x))·g\'(x) = e^(x²)·2x.' },
        { expression: '= 2x\\,e^{x^2}', annotation: 'Final answer.' },
      ],
      conclusion: 'd/dx[∫₃^(x²) eᵗ dt] = 2xe^(x²). The chain rule contribution 2x comes from the x² upper limit. Without the chain rule, you would incorrectly get just e^(x²). Always differentiate the upper limit and multiply.',
    },
    {
      id: 'ch4-003-ex3',
      title: 'FTC Part 2: Evaluating ∫₀³ (2x+1) dx',
      problem: '\\text{Compute } \\int_0^3 (2x+1)\\,dx \\text{ using FTC Part 2. Check against the geometric answer from Lesson 2.}',
      steps: [
        { expression: '\\text{Find an antiderivative: } F(x) = x^2 + x', annotation: 'F\'(x) = 2x+1 ✓. We need any antiderivative — C=0 is the simplest choice.' },
        { expression: '\\int_0^3 (2x+1)\\,dx = [x^2+x]_0^3', annotation: 'Apply FTC Part 2: ∫ₐᵇ f = F(b) − F(a).' },
        { expression: '= (3^2 + 3) - (0^2 + 0) = (9+3) - 0 = 12', annotation: 'Evaluate F at the upper limit (3) and subtract F at the lower limit (0).' },
        { expression: '\\text{Matches the geometric trapezoid calculation: } \\frac{1}{2}(1+7)(3) = 12 \\checkmark', annotation: 'Confirmed: FTC Part 2 gives the same answer as the trapezoidal area computed geometrically in Lesson 2.' },
      ],
      conclusion: '∫₀³(2x+1)dx = 12. FTC Part 2 confirms the geometric calculation. This integral is simple enough to verify geometrically, which builds confidence in the algebraic method.',
    },
    {
      id: 'ch4-003-ex4',
      title: '∫₀^π cos(x) dx = 0: Geometric and Algebraic',
      problem: '\\text{Compute } \\int_0^{\\pi} \\cos(x)\\,dx \\text{ and interpret geometrically.}',
      steps: [
        { expression: '\\int_0^{\\pi} \\cos(x)\\,dx = [\\sin(x)]_0^{\\pi}', annotation: 'Antiderivative of cos(x) is sin(x).' },
        { expression: '= \\sin(\\pi) - \\sin(0) = 0 - 0 = 0', annotation: 'sin(π) = 0 and sin(0) = 0.' },
        { expression: '\\text{Geometric interpretation: cos is positive on } [0,\\pi/2] \\text{ and negative on } [\\pi/2,\\pi].', annotation: 'The positive area above the x-axis on [0,π/2] equals the negative area below on [π/2,π]. They cancel exactly.' },
        { expression: '\\int_0^{\\pi/2}\\cos(x)\\,dx = [\\sin x]_0^{\\pi/2} = 1 \\quad \\int_{\\pi/2}^{\\pi}\\cos(x)\\,dx = [\\sin x]_{\\pi/2}^{\\pi} = -1', annotation: 'Each half contributes ±1. Total = 1+(−1) = 0.' },
      ],
      conclusion: '∫₀^π cos(x) dx = 0. The cosine function has equal positive and negative areas on [0, π], which cancel. This is a consequence of symmetry: cos(π−x) = −cos(x), so the second half mirrors the first half with opposite sign.',
    },
    {
      id: 'ch4-003-ex5',
      title: '∫₁ᵉ (1/x) dx and the Natural Logarithm',
      problem: '\\text{Compute } \\int_1^e \\frac{1}{x}\\,dx.',
      steps: [
        { expression: '\\int_1^e \\frac{1}{x}\\,dx = [\\ln|x|]_1^e', annotation: 'The antiderivative of 1/x is ln|x|. On [1,e], x > 0 so |x| = x.' },
        { expression: '= \\ln(e) - \\ln(1) = 1 - 0 = 1', annotation: 'ln(e) = 1 (by definition of e). ln(1) = 0 (since e⁰ = 1).' },
        { expression: '\\int_1^e \\frac{1}{x}\\,dx = 1', annotation: 'The area under y=1/x from x=1 to x=e is exactly 1.' },
      ],
      conclusion: '∫₁ᵉ(1/x)dx = 1. This is actually the most elegant way to define the natural logarithm: ln(x) = ∫₁ˣ (1/t) dt. The number e is then defined as the value where this integral equals 1. The logarithm defined by an integral has all the expected properties (ln(ab)=ln(a)+ln(b), etc.) which follow from properties of integrals.',
    },
    {
      id: 'ch4-003-ex6',
      title: '∫₀¹ eˣ dx',
      problem: '\\text{Compute } \\int_0^1 e^x\\,dx.',
      steps: [
        { expression: '\\int_0^1 e^x\\,dx = [e^x]_0^1', annotation: 'The antiderivative of eˣ is eˣ itself — the exponential function is its own antiderivative.' },
        { expression: '= e^1 - e^0 = e - 1 \\approx 1.718', annotation: 'Evaluate: e¹ = e ≈ 2.718, e⁰ = 1.' },
      ],
      conclusion: '∫₀¹ eˣ dx = e − 1 ≈ 1.718. The area under y = eˣ from 0 to 1 is e − 1. This exact result from FTC contrasts dramatically with what would be required from Riemann sums.',
    },
    {
      id: 'ch4-003-ex7',
      title: 'Displacement and Distance for a Velocity with Sign Change',
      problem: '\\text{A particle moves with } v(t) = 3t^2 - 6t \\text{ m/s. Find displacement and total distance over } [0, 3].',
      visualizationId: 'SignedArea',
      steps: [
        { expression: '\\text{Displacement} = \\int_0^3 (3t^2-6t)\\,dt = [t^3-3t^2]_0^3', annotation: 'Displacement = ∫v dt. Antiderivative of 3t²−6t is t³−3t².' },
        { expression: '= (27-27) - (0-0) = 0', annotation: 'F(3) = 27−27 = 0. F(0) = 0. Displacement = 0 − 0 = 0.' },
        { expression: 'v(t) = 3t^2 - 6t = 3t(t-2) = 0 \\Rightarrow t = 0 \\text{ or } t = 2', annotation: 'Find when v changes sign. v < 0 on (0,2) (particle moves backward), v > 0 on (2,3) (moves forward).' },
        { expression: '\\text{Distance} = \\int_0^2 |v|\\,dt + \\int_2^3 |v|\\,dt = \\int_0^2 (6t-3t^2)\\,dt + \\int_2^3 (3t^2-6t)\\,dt', annotation: 'On [0,2], v < 0 so |v| = −v = 6t−3t². On [2,3], v > 0 so |v| = v.' },
        { expression: '\\int_0^2(6t-3t^2)\\,dt = [3t^2-t^3]_0^2 = (12-8)-0 = 4', annotation: 'First piece: antiderivative is 3t²−t³. Evaluate from 0 to 2.' },
        { expression: '\\int_2^3(3t^2-6t)\\,dt = [t^3-3t^2]_2^3 = (27-27)-(8-12) = 0-(-4) = 4', annotation: 'Second piece. Evaluate from 2 to 3.' },
        { expression: '\\text{Total distance} = 4 + 4 = 8 \\text{ m}', annotation: 'The particle moved 4 m backward then 4 m forward, ending where it started (displacement = 0) but traveling 8 m total.' },
      ],
      conclusion: 'Displacement = 0 m; total distance = 8 m. The particle travels 4 m in the negative direction (t∈[0,2]) then 4 m in the positive direction (t∈[2,3]), returning to its start. Always split the integral at velocity sign changes when computing distance.',
    },
    {
      id: 'ch4-003-ex8',
      title: 'Spotting the FTC Error: The Discontinuous Integrand',
      problem: '\\text{What is wrong with the calculation } \\int_{-1}^{1} \\frac{1}{x^2}\\,dx = \\left[-\\frac{1}{x}\\right]_{-1}^{1} = -1 - 1 = -2?',
      steps: [
        { expression: 'f(x) = \\frac{1}{x^2} > 0 \\text{ everywhere it is defined.}', annotation: '1/x² is positive wherever it exists. A positive function cannot have a negative integral. The answer −2 is immediately suspicious.' },
        { expression: 'f(x) = \\frac{1}{x^2} \\text{ is not defined at } x = 0 \\in [-1,1].', annotation: 'The integrand has a vertical asymptote at x=0, which lies inside the integration interval [−1,1].' },
        { expression: '\\text{FTC Part 2 requires } f \\text{ to be continuous on } [a,b]. \\text{ Here } f \\text{ is discontinuous at } x=0 \\in [-1,1].', annotation: 'The hypothesis of FTC Part 2 is violated. The theorem does not apply.' },
        { expression: '\\int_0^1 \\frac{1}{x^2}\\,dx = \\lim_{t \\to 0^+}\\int_t^1 \\frac{1}{x^2}\\,dx = \\lim_{t \\to 0^+}\\left[-\\frac{1}{x}\\right]_t^1 = \\lim_{t \\to 0^+}\\left(-1+\\frac{1}{t}\\right) = +\\infty', annotation: 'The integral diverges as the lower limit approaches 0. The integral ∫₋₁¹ 1/x² dx does not exist.' },
      ],
      conclusion: 'The calculation is invalid because 1/x² has a vertical asymptote at x=0 inside the interval [−1,1]. FTC Part 2 requires continuity on the entire closed interval. The true "integral" diverges to +∞ (not −2). This is one of the most important errors to avoid in calculus.',
    },
  ],

  challenges: [
    {
      id: 'ch4-003-ch1',
      difficulty: 'easy',
      problem: 'Evaluate: (a) ∫₁⁴ (3√x − 2/x) dx. (b) ∫₀^(π/2) (sin x + cos x) dx.',
      hint: 'For (a): rewrite √x = x^(1/2), antiderivative is (2/3)x^(3/2) for x^(1/2) and ln|x| for 1/x. For (b): antiderivative of sin is −cos, of cos is sin.',
      walkthrough: [
        { expression: '\\text{(a) } \\int_1^4 \\left(3x^{1/2} - \\frac{2}{x}\\right)dx = \\left[3 \\cdot \\frac{x^{3/2}}{3/2} - 2\\ln|x|\\right]_1^4 = \\left[2x^{3/2} - 2\\ln x\\right]_1^4', annotation: 'Antiderivatives: ∫x^(1/2)dx = x^(3/2)/(3/2) = (2/3)x^(3/2); 3×(2/3)=2. ∫(1/x)dx = ln|x|; x > 0 on [1,4].' },
        { expression: '= (2(8) - 2\\ln 4) - (2(1) - 2\\ln 1) = (16 - 2\\ln 4) - (2 - 0) = 14 - 2\\ln 4 = 14 - 4\\ln 2', annotation: '4^(3/2) = (√4)³ = 8. ln(1) = 0. Simplify 2ln(4) = 2ln(2²) = 4ln(2).' },
        { expression: '\\text{(b) } \\int_0^{\\pi/2}(\\sin x + \\cos x)\\,dx = [-\\cos x + \\sin x]_0^{\\pi/2}', annotation: 'Antiderivative of sin is −cos; antiderivative of cos is sin.' },
        { expression: '= (-\\cos(\\pi/2)+\\sin(\\pi/2)) - (-\\cos(0)+\\sin(0)) = (0+1) - (-1+0) = 1+1 = 2', annotation: 'cos(π/2)=0, sin(π/2)=1, cos(0)=1, sin(0)=0.' },
      ],
      answer: '\\text{(a) } 14 - 4\\ln 2 \\approx 11.23 \\qquad \\text{(b) } 2',
    },
    {
      id: 'ch4-003-ch2',
      difficulty: 'medium',
      problem: 'Find d/dx[∫_{x}^{x²} cos(t³) dt]. Use both the chain rule version of FTC Part 1 and the interval additivity property to handle both a variable lower and upper limit.',
      hint: 'Write ∫ₓ^(x²) cos(t³)dt = ∫ₐ^(x²) cos(t³)dt − ∫ₐˣ cos(t³)dt for any constant a. Differentiate each piece using FTC Part 1 with the chain rule.',
      walkthrough: [
        { expression: '\\int_x^{x^2} \\cos(t^3)\\,dt = \\int_a^{x^2} \\cos(t^3)\\,dt - \\int_a^x \\cos(t^3)\\,dt', annotation: 'Split using additivity: ∫ₓ^(x²) = ∫ₐ^(x²) − ∫ₐˣ, for any constant a (e.g., a=0).' },
        { expression: '\\frac{d}{dx}\\int_a^{x^2}\\cos(t^3)\\,dt = \\cos((x^2)^3) \\cdot 2x = \\cos(x^6)\\cdot 2x', annotation: 'FTC Part 1 with chain rule: upper limit is g(x)=x², so derivative is cos(g(x)³)·g\'(x) = cos(x⁶)·2x.' },
        { expression: '\\frac{d}{dx}\\int_a^x \\cos(t^3)\\,dt = \\cos(x^3)', annotation: 'FTC Part 1 directly (upper limit is x).' },
        { expression: '\\frac{d}{dx}\\int_x^{x^2}\\cos(t^3)\\,dt = 2x\\cos(x^6) - \\cos(x^3)', annotation: 'Subtract the two derivatives.' },
      ],
      answer: '\\dfrac{d}{dx}\\int_x^{x^2}\\cos(t^3)\\,dt = 2x\\cos(x^6) - \\cos(x^3)',
    },
    {
      id: 'ch4-003-ch3',
      difficulty: 'hard',
      problem: 'Prove FTC Part 2 from Part 1, filling in every logical step. In particular: (a) show (A − F)\' = 0 using the MVT, (b) conclude A − F = constant, (c) determine the constant, (d) derive ∫ₐᵇ f = F(b) − F(a).',
      hint: 'A(x) = ∫ₐˣ f. Use Part 1: A\' = f. Given F\' = f. Define H = A − F. Show H\' = 0. Apply the MVT corollary. Evaluate at x=a to find the constant.',
      walkthrough: [
        { expression: 'A(x) = \\int_a^x f(t)\\,dt. \\text{ By FTC Part 1: } A\'(x) = f(x).', annotation: 'Hypothesis: f continuous. Part 1 guarantees A is differentiable and A\' = f.' },
        { expression: 'H(x) = A(x) - F(x). \\quad H\'(x) = A\'(x) - F\'(x) = f(x) - f(x) = 0', annotation: 'Define H. Differentiate: H\' = A\' − F\' = f − f = 0.' },
        { expression: '\\text{Since } H\'(x) = 0 \\text{ on } (a,b) \\text{ and } H \\text{ is continuous on } [a,b]: H \\text{ is constant.}', annotation: 'MVT corollary: if H\' = 0 on an interval, H is constant. (Proof: for any x₁,x₂, MVT gives H(x₂)−H(x₁) = H\'(c)(x₂−x₁) = 0, so H(x₁)=H(x₂).)' },
        { expression: 'H(a) = A(a) - F(a) = 0 - F(a) = -F(a)', annotation: 'Evaluate at x=a: A(a) = ∫ₐᵃ f = 0. So the constant equals −F(a).' },
        { expression: 'A(x) - F(x) = -F(a) \\Rightarrow A(x) = F(x) - F(a)', annotation: 'Rearrange: A(x) = F(x) − F(a) for all x ∈ [a,b].' },
        { expression: 'A(b) = F(b) - F(a) \\Rightarrow \\int_a^b f(x)\\,dx = F(b) - F(a). \\quad \\square', annotation: 'Set x = b. The definite integral equals the antiderivative evaluated at the endpoints. QED.' },
      ],
      answer: '\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a). \\text{ Proved from FTC Part 1 + the MVT corollary.}',
    },
    {
      id: 'ch4-003-ch4',
      difficulty: 'hard',
      problem: 'A particle has velocity v(t) = t² − 4t + 3 m/s for t ∈ [0, 4]. (a) Find all times when the particle changes direction. (b) Compute the total displacement over [0, 4]. (c) Compute the total distance traveled over [0, 4].',
      hint: 'Factor v(t): v = (t−1)(t−3). Zeros at t=1 and t=3. v > 0 on [0,1] and [3,4]; v < 0 on [1,3]. Displacement = ∫₀⁴ v. Distance = ∫₀¹ v + |∫₁³ v| + ∫₃⁴ v.',
      walkthrough: [
        { expression: 'v(t) = t^2-4t+3 = (t-1)(t-3). \\text{ Zeros at } t=1,3.', annotation: 'Factor. v > 0 on [0,1] and (3,4]; v < 0 on (1,3).' },
        { expression: '\\text{Displacement} = \\int_0^4(t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_0^4', annotation: 'Antiderivative: t³/3 − 2t² + 3t.' },
        { expression: '= \\left(\\frac{64}{3}-32+12\\right) - 0 = \\frac{64}{3} - 20 = \\frac{64-60}{3} = \\frac{4}{3} \\text{ m}', annotation: '64/3 − 32 + 12 = 64/3 − 20 = 4/3.' },
        { expression: '\\int_0^1(t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_0^1 = \\frac{1}{3}-2+3 = \\frac{4}{3}', annotation: 'Piece on [0,1]: v ≥ 0.' },
        { expression: '\\int_1^3(t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_1^3 = (9-18+9)-(\\frac{1}{3}-2+3) = 0-\\frac{4}{3} = -\\frac{4}{3}', annotation: 'Piece on [1,3]: v ≤ 0. The integral is negative.' },
        { expression: '\\int_3^4(t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_3^4 = (\\frac{64}{3}-32+12)-(9-18+9) = \\frac{4}{3}-0 = \\frac{4}{3}', annotation: 'Piece on [3,4]: v ≥ 0.' },
        { expression: '\\text{Distance} = \\frac{4}{3} + \\frac{4}{3} + \\frac{4}{3} = 4 \\text{ m}', annotation: 'Total distance = sum of |pieces| = 4/3 + 4/3 + 4/3 = 4 m.' },
      ],
      answer: '\\text{Displacement} = \\frac{4}{3} \\text{ m}; \\quad \\text{Distance} = 4 \\text{ m}.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'area-accumulation', label: 'Area and Accumulation', context: 'Lesson 0 introduced the area-accumulation idea physically. The FTC gives it algebraic form: d/dx[accumulated area] = original function.' },
    { lessonSlug: 'indefinite-integrals', label: 'Indefinite Integrals', context: 'FTC Part 2 requires an antiderivative. Lesson 4 builds the systematic table of antiderivatives used to evaluate definite integrals.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'Every application in Lesson 5 — net change, area between curves, average value — uses FTC Part 2 to compute the definite integral via antiderivatives.' },
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
    'completed-example-8',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard-1',
    'attempted-challenge-hard-2',
  ],
}
