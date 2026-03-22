// FILE: src/content/chapter-4/06-u-substitution.js
export default {
  id: 'ch4-006',
  slug: 'u-substitution',
  chapter: 4,
  order: 6,
  title: 'U-Substitution',
  subtitle: 'The chain rule in reverse — the most important integration technique',
  tags: ['u-substitution', 'substitution', 'chain rule', 'antiderivative', 'change of variable', 'definite integral', 'technique'],
  aliases: ['integration method choice', 'when to use u substitution', 'reverse chain rule integral'],

  hook: {
    question: 'How do you integrate ∫ 2x·cos(x²) dx? Direct formulas fail — but if you let u = x², something magical happens.',
    realWorldContext:
      'U-substitution is the workhorse of integration. It undoes the chain rule, which is by far the most commonly used differentiation rule. ' +
      'In physics, computing the work done by a nonlinear spring, the energy stored in a capacitor, or the displacement of a particle under variable force all require integrals that need substitution. ' +
      'In engineering, signal processing involves convolution integrals that are solved by substitution. ' +
      'In probability, transforming random variables under a nonlinear function uses the substitution theorem. ' +
      'Nearly every integral you will ever compute — by hand or by computer algebra system — uses substitution at some stage.',
    previewVisualizationId: 'AreaAccumulator',
  },

  intuition: {
    prose: [
      'Recall the chain rule for derivatives: if F(u) is an antiderivative of f(u), then d/dx [F(g(x))] = f(g(x)) · g\'(x). Rearranging: ∫ f(g(x)) · g\'(x) dx = F(g(x)) + C. This is u-substitution in one equation.',

      'The substitution u = g(x) transforms the integral. Here is the key mechanic: if u = g(x), then du/dx = g\'(x), which we write as du = g\'(x) dx. This lets us replace the original integral:',
      '∫ f(g(x)) · g\'(x) dx  →  ∫ f(u) du',
      'The new integral ∫ f(u) du is in a simpler variable. If we can antidifferentiate it (getting F(u) + C), we substitute back: F(g(x)) + C.',

      'How do you choose u? Look for a composite expression (something inside another function) whose derivative also appears (perhaps with a constant factor) in the integrand. The most common patterns:',
      '• Power of a function: ∫ (x²+1)⁵ · 2x dx → let u = x²+1 (derivative 2x is present)',
      '• Exponential of a function: ∫ e^(3x) dx → let u = 3x',
      '• Trig of a function: ∫ cos(5x) dx → let u = 5x',
      '• Log or fraction: ∫ x/(x²+1) dx → let u = x²+1 (derivative 2x is present up to a constant)',

      'For **definite integrals**, you have two options: (1) change the limits with u to avoid back-substituting, or (2) integrate in u, back-substitute, then evaluate. Changing limits is cleaner for exam work.',

      'A critical subtlety: u-substitution requires the ENTIRE integrand (except du) to transform cleanly. If there is a leftover factor that does not simplify, the substitution is the wrong choice. Sometimes you need to solve for x in terms of u to replace leftovers — this is common when u = ax + b (linear substitutions always work).',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'The Chain Rule, Reversed',
        body: 'Differentiation: d/dx[F(g(x))] = F\'(g(x))·g\'(x). Integration: ∫ F\'(g(x))·g\'(x) dx = F(g(x)) + C. U-substitution is EXACTLY this reversal. If you can spot the composite function and its derivative in the integrand, you can undo any chain rule.',
      },
      {
        type: 'technique',
        title: 'The 4-Step Method',
        body: '1. Choose u = g(x) (the inner function of the composition)\n2. Compute du = g\'(x) dx\n3. Rewrite the integral entirely in terms of u and du\n4. Integrate, then back-substitute u = g(x)\nFor definite integrals, also convert limits: if x = a, limits become u = g(a).',
      },
      {
        type: 'misconception',
        title: 'dx ≠ du in General',
        body: 'When you substitute u = g(x), you MUST also replace dx. Since du = g\'(x) dx, you get dx = du/g\'(x). Forgetting to transform dx is the #1 error in substitution. Every dx in the original integral must be accounted for in the new integral in u.',
      },
      {
        type: 'warning',
        title: 'Not Everything Substitutes Cleanly',
        body: 'If the derivative of your chosen u is not present in the integrand (even up to a constant), substitution will not simplify the integral. For example, ∫ x·cos(x) dx cannot be solved by substitution — this requires integration by parts (next lesson). Know when to change strategy.',
      },
      {
        type: 'real-world',
        title: 'Physics: Electric Potential Energy',
        body: 'The energy stored in a capacitor is U = ∫ q/C dq = q²/(2C). The integral ∫ q/C dq has u = q (trivial), giving U·C = q²/2. More interestingly, the force on a charge in a nonuniform electric field E(x) requires W = ∫ qE(x) dx, which often needs substitution when E depends on x in a nonlinear way.',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Intro to Substitution - Undoing the Chain Rule",
        props: { url: "https://www.youtube.com/embed/QcgacM1LSpA" }
      },
      {
        id: 'IntegrationMethodLab',
        title: 'Method Selection Trainer',
        caption: 'Use the checklist to decide whether this integrand family is a substitution, by-parts, trig-sub, trig-identity, or partial-fractions problem.',
      },
      {
        id: 'AreaAccumulator',
        title: 'Area Under a Composite Function',
        caption: 'The substitution change-of-variable stretches and compresses the x-axis. The area under the original function equals the area under the substituted function when limits and du are correctly transformed.',
      },
    ],
  },

  math: {
    prose: [
      'Theorem (Substitution Rule): If g is differentiable on [a,b] and f is continuous on the range of g, then ∫ₐᵇ f(g(x))·g\'(x) dx = ∫_{g(a)}^{g(b)} f(u) du. For indefinite integrals: ∫ f(g(x))·g\'(x) dx = F(g(x)) + C where F is any antiderivative of f.',

      'The rule for definite integrals with substitution: when you substitute u = g(x), the limits transform as:\n• Lower limit: x = a becomes u = g(a)\n• Upper limit: x = b becomes u = g(b)\nDo NOT forget to convert both limits. You may integrate in u directly without ever going back to x.',

      'Adjusting for missing constants: if the integrand is ∫ f(g(x)) · k·g\'(x) dx, you can pull the constant k out: k∫ f(g(x))·g\'(x) dx. If the integrand has g\'(x)/c (a scaled version), you adjust: ∫ f(g(x)) · g\'(x)/c dx = (1/c) ∫ f(g(x)) g\'(x) dx. This lets you insert a missing constant by multiplying and compensating. For example, ∫ x·e^(x²) dx: u = x², du = 2x dx, so x dx = du/2. Then ∫ e^u · (du/2) = (1/2)eᵘ + C = (1/2)e^(x²) + C.',

      'Substitution with trig and exponential functions: these are especially common in calculus. Key patterns:\n• ∫ sin(ax+b) dx: u = ax+b, du = a·dx, → (1/a)∫ sin(u) du = −(1/a)cos(u) + C = −(1/a)cos(ax+b) + C\n• ∫ e^(ax) dx: u = ax, du = a·dx, → (1/a)eᵃˣ + C\n• ∫ (ax+b)ⁿ dx: u = ax+b → (ax+b)^(n+1)/((n+1)·a) + C\n• ∫ f\'(x)/f(x) dx: u = f(x), du = f\'(x) dx, → ln|u| + C = ln|f(x)| + C',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Substitution Rule',
        body: '\\text{Indefinite: } \\int f(g(x))g\'(x)\\,dx = F(g(x)) + C\\\\\n\\text{Definite: } \\int_a^b f(g(x))g\'(x)\\,dx = \\int_{g(a)}^{g(b)} f(u)\\,du',
      },
      {
        type: 'definition',
        title: 'Log Integral Rule (via Substitution)',
        body: '\\int \\frac{f\'(x)}{f(x)}\\,dx = \\ln|f(x)| + C\\\\ \\text{Special case: } \\int \\frac{1}{x}\\,dx = \\ln|x| + C',
      },
      {
        type: 'strategy',
        title: 'Choosing u — The Hierarchy',
        body: '1st choice: the argument of the outermost composite (e.g., the exponent in eᵘ, the argument of sin)\n2nd choice: a factor whose derivative cancels the remaining integrand\n3rd choice (linear sub): u = ax + b always works — every polynomial linear composite integrates by substitution',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Adjusting the Constant in Integration by Substitution",
        props: { url: "https://www.youtube.com/embed/RdeTrQKz3fk" }
      },
      {
        id: 'FunctionPlotter',
        props: { fn: 'x * Math.exp(x * x)', xMin: -2, xMax: 2 },
        title: 'Integrand: x·e^(x²)',
        caption: 'This function has no elementary antiderivative via direct formulas — but u = x² makes it instantly integrable as (1/2)e^(x²).',
      },
    ],
  },

  rigor: {
    prose: [
      'The substitution rule follows from the chain rule by FTC. Let F be an antiderivative of f. Then d/dx[F(g(x))] = F\'(g(x))·g\'(x) = f(g(x))·g\'(x). Integrating both sides from a to b: ∫ₐᵇ f(g(x))·g\'(x) dx = [F(g(x))]ₐᵇ = F(g(b)) − F(g(a)).',

      'Alternatively, using the definite integral directly: since u = g(x) and du = g\'(x)dx, and since g maps [a,b] to [g(a), g(b)], we have ∫ₐᵇ f(g(x))g\'(x) dx = ∫_{g(a)}^{g(b)} f(u) du = [F(u)]_{g(a)}^{g(b)} = F(g(b)) − F(g(a)). This argument requires g to be differentiable on (a,b) and continuous on [a,b], and f to be continuous on [g(a),g(b)] (or more precisely, on the range of g).',

      'A subtlety for non-monotone g: if g is not monotone (e.g., g goes up then down), the integral ∫_a^b can be split into pieces where g is monotone, and the substitution applied separately. The formula ∫ₐᵇ f(g(x))g\'(x)dx = ∫_{g(a)}^{g(b)} f(u) du still holds, but the path of integration in u may retrace itself. The equality holds because the chain rule works regardless of monotonicity.',

      'The log formula ∫ f\'(x)/f(x) dx = ln|f(x)| + C: The absolute value is necessary when f(x) can be negative. If f(x) > 0, then d/dx[ln(f(x))] = f\'(x)/f(x) by the chain rule. If f(x) < 0, write |f(x)| = −f(x) (positive), then d/dx[ln(−f(x))] = (−f\'(x))/(−f(x)) = f\'(x)/f(x). So the derivative of ln|f(x)| equals f\'(x)/f(x) in both cases, justifying the absolute value.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Proof: Substitution Rule from FTC + Chain Rule',
        body: '\\text{Let } F\'=f. \\text{ By the chain rule: } \\frac{d}{dx}[F(g(x))] = f(g(x))g\'(x)\\\\\n\\text{By FTC Part 2: } \\int_a^b f(g(x))g\'(x)\\,dx = F(g(b)) - F(g(a))\\\\\n= \\left[F(u)\\right]_{g(a)}^{g(b)} = \\int_{g(a)}^{g(b)} f(u)\\,du \\quad \\blacksquare',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Back Substitution - When a u-sub doesn't match cleanly!",
        props: { url: "https://www.youtube.com/embed/k08ce4fEA3k" }
      },
      {
        id: 'VideoEmbed',
        title: "Substitution Method for Definite Integrals **careful!**",
        props: { url: "https://www.youtube.com/embed/iLh6cYGCogk" }
      },],
  },

  examples: [
    {
      id: 'ch4-006-ex1',
      title: 'Basic Power Substitution',
      problem: '\\text{Evaluate } \\displaystyle\\int (x^2+1)^5 \\cdot 2x\\,dx.',
      steps: [
        { expression: 'u = x^2 + 1', annotation: 'Choose u = the expression raised to the power 5. Its derivative 2x is already present in the integrand.' },
        { expression: 'du = 2x\\,dx', annotation: 'Differentiate u with respect to x.' },
        { expression: '\\int (x^2+1)^5 \\cdot 2x\\,dx = \\int u^5\\,du', annotation: 'Substitute: (x²+1)⁵ = u⁵, and 2x dx = du. The entire integrand converts cleanly.' },
        { expression: '= \\frac{u^6}{6} + C', annotation: 'Power rule in u: ∫uⁿ du = uⁿ⁺¹/(n+1) + C, with n=5.' },
        { expression: '= \\frac{(x^2+1)^6}{6} + C', annotation: 'Back-substitute u = x²+1.' },
      ],
      conclusion: 'Answer: (x²+1)⁶/6 + C. Verify by differentiating: d/dx[(x²+1)⁶/6] = (x²+1)⁵ · 2x ✓ (chain rule).',
    },
    {
      id: 'ch4-006-ex2',
      title: 'Inserting a Missing Constant',
      problem: '\\text{Evaluate } \\displaystyle\\int x \\cdot e^{x^2}\\,dx.',
      steps: [
        { expression: 'u = x^2', annotation: 'The exponent is the natural choice for u.' },
        { expression: 'du = 2x\\,dx \\implies x\\,dx = \\frac{du}{2}', annotation: 'We have x dx in the integrand, but du = 2x dx. Solve for x dx.' },
        { expression: '\\int x \\cdot e^{x^2}\\,dx = \\int e^u \\cdot \\frac{du}{2} = \\frac{1}{2}\\int e^u\\,du', annotation: 'Substitute: e^(x²) = eᵘ and x dx = du/2. Pull the constant 1/2 out front.' },
        { expression: '= \\frac{1}{2}e^u + C', annotation: '∫eᵘ du = eᵘ + C.' },
        { expression: '= \\frac{1}{2}e^{x^2} + C', annotation: 'Back-substitute u = x².' },
      ],
      conclusion: 'Answer: (1/2)e^(x²) + C. The "missing" factor of 2 in du = 2x dx is handled by dividing, which introduces the compensating factor 1/2.',
    },
    {
      id: 'ch4-006-ex3',
      title: 'Definite Integral — Changing Limits',
      problem: '\\text{Evaluate } \\displaystyle\\int_0^2 3x^2(x^3+1)^4\\,dx.',
      steps: [
        { expression: 'u = x^3 + 1, \\quad du = 3x^2\\,dx', annotation: 'u is the expression raised to the 4th power; 3x² dx = du is present exactly.' },
        { expression: '\\text{Change limits: } x=0 \\Rightarrow u=0^3+1=1; \\quad x=2 \\Rightarrow u=2^3+1=9', annotation: 'Convert both limits using u = x³+1.' },
        { expression: '\\int_0^2 3x^2(x^3+1)^4\\,dx = \\int_1^9 u^4\\,du', annotation: 'Substitute. Notice the limits changed from [0,2] to [1,9].' },
        { expression: '= \\left[\\frac{u^5}{5}\\right]_1^9 = \\frac{9^5}{5} - \\frac{1^5}{5}', annotation: 'Evaluate the antiderivative at the new limits.' },
        { expression: '= \\frac{59049}{5} - \\frac{1}{5} = \\frac{59048}{5} = 11809.6', annotation: '9⁵ = 59049. No back-substitution needed because we changed the limits.' },
      ],
      conclusion: 'Answer: 59048/5 = 11809.6. Changing limits is the cleanest method for definite integrals — no back-substitution step at the end.',
    },
    {
      id: 'ch4-006-ex4',
      title: 'U-Sub with Trig — ∫sin(3x+2) dx',
      problem: '\\text{Evaluate } \\displaystyle\\int \\sin(3x+2)\\,dx.',
      steps: [
        { expression: 'u = 3x+2, \\quad du = 3\\,dx \\implies dx = \\frac{du}{3}', annotation: 'The argument of sine is the natural u. Its derivative is 3 (a constant).' },
        { expression: '\\int \\sin(3x+2)\\,dx = \\int \\sin(u) \\cdot \\frac{du}{3} = \\frac{1}{3}\\int \\sin(u)\\,du', annotation: 'Substitute and pull the constant 1/3 out.' },
        { expression: '= \\frac{1}{3}(-\\cos u) + C = -\\frac{1}{3}\\cos(3x+2) + C', annotation: '∫sin(u)du = −cos(u). Back-substitute.' },
      ],
      conclusion: 'Answer: −(1/3)cos(3x+2) + C. General rule: ∫sin(ax+b) dx = −(1/a)cos(ax+b) + C.',
    },
    {
      id: 'ch4-006-ex5',
      title: 'Log Integral — ∫ f\'/f dx',
      problem: '\\text{Evaluate } \\displaystyle\\int \\frac{2x+3}{x^2+3x+7}\\,dx.',
      steps: [
        { expression: 'u = x^2 + 3x + 7', annotation: 'The denominator is u. Check: is the numerator a multiple of u\'?' },
        { expression: 'du = (2x+3)\\,dx', annotation: 'The derivative of x²+3x+7 is 2x+3 — exactly the numerator! Perfect.' },
        { expression: '\\int \\frac{2x+3}{x^2+3x+7}\\,dx = \\int \\frac{du}{u} = \\ln|u| + C', annotation: 'The integrand is exactly du/u after substitution.' },
        { expression: '= \\ln|x^2+3x+7| + C', annotation: 'Back-substitute. Since x²+3x+7 = (x+3/2)²+19/4 > 0 always, the absolute value is not needed here.' },
      ],
      conclusion: 'Answer: ln(x²+3x+7) + C. The pattern ∫ f\'(x)/f(x) dx = ln|f(x)| + C is one of the most important in integration — recognize the numerator as the derivative of the denominator.',
    },
    {
      id: 'ch4-006-ex6',
      title: 'Substitution with Algebra — ∫ x√(x+1) dx',
      problem: '\\text{Evaluate } \\displaystyle\\int x\\sqrt{x+1}\\,dx.',
      steps: [
        { expression: 'u = x+1 \\implies x = u-1, \\quad du = dx', annotation: 'Let u = x+1 (the radicand). Crucially, solve for x: x = u−1. This lets us replace the remaining factor x.' },
        { expression: '\\int x\\sqrt{x+1}\\,dx = \\int (u-1)\\sqrt{u}\\,du', annotation: 'x = u−1, √(x+1) = √u, dx = du. All substituted.' },
        { expression: '= \\int (u-1)u^{1/2}\\,du = \\int (u^{3/2} - u^{1/2})\\,du', annotation: 'Distribute: (u−1)u^(1/2) = u^(3/2) − u^(1/2).' },
        { expression: '= \\frac{u^{5/2}}{5/2} - \\frac{u^{3/2}}{3/2} + C = \\frac{2}{5}u^{5/2} - \\frac{2}{3}u^{3/2} + C', annotation: 'Power rule: ∫uⁿ du = uⁿ⁺¹/(n+1). Here n=3/2 and n=1/2.' },
        { expression: '= \\frac{2}{5}(x+1)^{5/2} - \\frac{2}{3}(x+1)^{3/2} + C', annotation: 'Back-substitute u = x+1.' },
      ],
      conclusion: 'Answer: (2/5)(x+1)^(5/2) − (2/3)(x+1)^(3/2) + C. When x appears separately from the composite, algebraically solve for x in terms of u to replace it.',
    },
    {
      id: 'ch4-006-ex7',
      title: 'Integral with Exponential — Area Under a Bell Curve Piece',
      problem: '\\text{Evaluate } \\displaystyle\\int_0^1 2x e^{-x^2}\\,dx. \\text{ (Part of the error function — core to probability and statistics.)}',
      steps: [
        { expression: 'u = -x^2, \\quad du = -2x\\,dx \\implies 2x\\,dx = -du', annotation: 'Let u = −x². Its derivative −2x is almost the factor 2x present (off by a sign).' },
        { expression: '\\text{Limits: } x=0 \\Rightarrow u=0; \\quad x=1 \\Rightarrow u=-1', annotation: 'Convert limits using u = −x².' },
        { expression: '\\int_0^1 2x e^{-x^2}\\,dx = \\int_0^{-1} e^u \\cdot (-du) = \\int_{-1}^0 e^u\\,du', annotation: 'Substitute: e^(−x²) = eᵘ, 2x dx = −du. Flip limits (negating the integral) to get ∫_{−1}^{0}.' },
        { expression: '= [e^u]_{-1}^0 = e^0 - e^{-1} = 1 - \\frac{1}{e}', annotation: 'Evaluate. e⁰ = 1, e⁻¹ = 1/e.' },
      ],
      conclusion: 'Answer: 1 − 1/e ≈ 0.6321. Note: the integrand 2xe^(−x²) is the Rayleigh distribution\'s PDF — it gives the probability that a Rayleigh-distributed distance (arising in 2D random walks and wireless signal strength) falls in [0,1]. The related error function erf(x) = (2/√π)∫₀ˣ e^(−t²) dt generalizes the idea to Gaussian integrals; both require substitution as their first step.',
    },
  ],

  challenges: [
    {
      id: 'ch4-006-ch1',
      difficulty: 'easy',
      problem: 'Evaluate ∫ cos(x)·sin²(x) dx.',
      hint: 'Let u = sin(x). What is du?',
      walkthrough: [
        { expression: 'u = \\sin x, \\quad du = \\cos x\\,dx', annotation: 'The derivative of sin is cos, which is already present.' },
        { expression: '\\int \\cos x \\cdot \\sin^2 x\\,dx = \\int u^2\\,du = \\frac{u^3}{3} + C', annotation: 'Substitute. cos(x) dx = du, sin²(x) = u².' },
        { expression: '= \\frac{\\sin^3 x}{3} + C', annotation: 'Back-substitute.' },
      ],
      answer: '\\dfrac{\\sin^3 x}{3} + C',
    },
    {
      id: 'ch4-006-ch2',
      difficulty: 'medium',
      problem: 'Evaluate \\displaystyle\\int_0^{\\pi/4} \\tan x\\,dx. (Recall \\tan x = \\sin x / \\cos x.)',
      hint: 'Write tan x = sin(x)/cos(x). Let u = cos(x).',
      walkthrough: [
        { expression: '\\int_0^{\\pi/4} \\frac{\\sin x}{\\cos x}\\,dx', annotation: 'Rewrite tan x.' },
        { expression: 'u = \\cos x, \\quad du = -\\sin x\\,dx \\implies \\sin x\\,dx = -du', annotation: 'The numerator sin x is (−1) times the derivative of cos x.' },
        { expression: '\\text{Limits: } x=0 \\Rightarrow u=1; \\quad x=\\pi/4 \\Rightarrow u=1/\\sqrt{2}', annotation: 'cos(0)=1, cos(π/4)=1/√2.' },
        { expression: '\\int_0^{\\pi/4}\\frac{\\sin x}{\\cos x}\\,dx = \\int_1^{1/\\sqrt{2}}\\frac{-du}{u} = -[\\ln|u|]_1^{1/\\sqrt{2}}', annotation: 'Substitute.' },
        { expression: '= -(\\ln(1/\\sqrt{2}) - \\ln 1) = -(-\\tfrac{1}{2}\\ln 2 - 0) = \\frac{\\ln 2}{2}', annotation: 'ln(1/√2) = ln(2^(−1/2)) = −(1/2)ln 2. And ln(1) = 0.' },
      ],
      answer: '\\dfrac{\\ln 2}{2} \\approx 0.347',
    },
    {
      id: 'ch4-006-ch3',
      difficulty: 'hard',
      problem: 'Evaluate \\displaystyle\\int \\frac{e^x}{e^{2x}+1}\\,dx.',
      hint: 'Let u = eˣ. What does the integrand become? You\'ll get ∫ 1/(u²+1) du.',
      walkthrough: [
        { expression: 'u = e^x, \\quad du = e^x\\,dx', annotation: 'Let u = eˣ. Then eˣ dx = du.' },
        { expression: '\\int \\frac{e^x}{e^{2x}+1}\\,dx = \\int \\frac{du}{u^2+1}', annotation: 'Substitute: eˣ = u, e²ˣ = u², eˣ dx = du.' },
        { expression: '= \\arctan(u) + C = \\arctan(e^x) + C', annotation: 'Standard integral: ∫ 1/(u²+1) du = arctan(u) + C.' },
      ],
      answer: '\\arctan(e^x) + C',
    },
  ],

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'Chain Rule (Prerequisite)', context: 'U-substitution reverses the chain rule. If you can differentiate with the chain rule, you can integrate by substitution.' },
    { lessonSlug: 'indefinite-integrals', label: 'Antiderivative Formulas', context: 'The basic antiderivative table (∫xⁿ dx, ∫sin dx, etc.) provides f(u) once you make the substitution.' },
    { lessonSlug: 'integration-by-parts', label: 'Next: Integration by Parts', context: 'When substitution fails (e.g., ∫x·sin(x) dx), integration by parts is the next technique to try.' },
    { lessonSlug: 'fundamental-theorem', label: 'FTC Part 2', context: 'For definite integrals, the fundamental theorem allows evaluation once the antiderivative is found via substitution.' },
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
}
