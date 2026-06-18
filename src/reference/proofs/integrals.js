// Proof data for all integral reference entries.

const S = {
  setup:    { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  key:      { bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  algebra:  { bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  geo:      { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  limit:    { bg: "#fdf4ff", text: "#6b21a8",  border: "#e9d5ff" },
  conclude: { bg: "#f0fdf4", text: "#14532d",  border: "#86efac" },
  verify:   { bg: "#f0fdfa", text: "#134e4a",  border: "#99f6e4" },
}

export const INTEGRAL_PROOFS = {

  'ftc-1': {
    title: "Fundamental Theorem of Calculus, Part 1",
    subtitle: "The derivative of an accumulation function is the integrand",
    category: "Integrals",
    problem: "\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)",
    preamble: "FTC Part 1 is the bridge between differentiation and integration. It says: if you accumulate area under f from a to x, and then ask how fast that area is growing at x, the answer is f(x) — the height of the curve right there.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Define the accumulation function F(x) = ∫_a^x f(t) dt — the area under f from a up to x.",
        math: "F(x) = \\int_a^x f(t)\\,dt",
        note: "F(x) is a function of the upper limit x. As x increases, F(x) gains more area. We want to find F′(x).",
        why: {
          tag: "What exactly is F(x) — what does the integral mean?",
          explanation: "∫_a^x f(t) dt is the signed area under the curve y=f(t) between t=a and t=x. 'Signed' means: area above the x-axis counts positive, area below counts negative. As x increases, you're sweeping a vertical line rightward, accumulating more area. F(x) is literally a running total of that area. The variable in the integrand is t (a dummy variable) so that x can be the upper limit.",
          why: {
            tag: "Why use t as the variable inside instead of x?",
            explanation: "Because x is already taken — it's the upper limit of integration. If you wrote ∫_a^x f(x) dx, you'd have x meaning two different things (both the running variable and the upper limit), which is mathematically ambiguous. Using t inside keeps x free to be the boundary. After integration, t disappears and only x remains. The choice of letter t is arbitrary — ∫_a^x f(s) ds or ∫_a^x f(u) du are equally valid.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Write F(x+h) − F(x) as an integral over the small interval [x, x+h].",
        math: "F(x+h) - F(x) = \\int_a^{x+h} f(t)\\,dt - \\int_a^x f(t)\\,dt = \\int_x^{x+h} f(t)\\,dt",
        note: "The part from a to x cancels; we're left with just the thin strip from x to x+h.",
        why: {
          tag: "Why does the subtraction give exactly ∫_x^{x+h}?",
          explanation: "Additive property of integrals: ∫_a^{x+h} = ∫_a^x + ∫_x^{x+h}. So ∫_a^{x+h} − ∫_a^x = ∫_x^{x+h}. Think of it physically: total area from a to x+h, minus total area from a to x, leaves just the thin vertical strip between x and x+h. This strip is what F gained when x grew by h.",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "By the Mean Value Theorem for Integrals: ∫_x^{x+h} f(t) dt = f(c)·h for some c between x and x+h.",
        math: "\\int_x^{x+h} f(t)\\,dt = f(c) \\cdot h \\quad\\text{for some } c \\in [x, x+h]",
        note: "The thin strip has some average height f(c). Its area is exactly f(c)·h for some c in the interval.",
        why: {
          tag: "What is the Mean Value Theorem for Integrals?",
          explanation: "If f is continuous on [a,b], then ∫_a^b f(t) dt = f(c)·(b−a) for some c in [a,b]. Geometrically: the area under a continuous curve over any interval equals the area of some rectangle with the same base, where the rectangle height f(c) is a value f actually achieves. This is guaranteed because a continuous function must hit its average value somewhere (Intermediate Value Theorem). It cannot avoid its own average.",
          why: {
            tag: "Why must a continuous function hit its average? Can't it always be above or below?",
            explanation: "If f is always above its average A, then the average would be higher than A — contradiction. If f is always below A, same contradiction. So f must be equal to A somewhere. More formally: if f(t) > A everywhere on [a,b], then ∫f dt > A·(b−a), meaning the average > A — contradiction. The Intermediate Value Theorem then guarantees f(c) = A for some c in [a,b].",
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Divide by h and take the limit as h→0.",
        math: "F'(x) = \\lim_{h\\to 0}\\frac{F(x+h)-F(x)}{h} = \\lim_{h\\to 0}\\frac{f(c)\\cdot h}{h} = \\lim_{h\\to 0} f(c)",
        note: "As h→0, c is squeezed between x and x+h, so c→x. By continuity of f: f(c)→f(x).",
        why: {
          tag: "Why does f(c)→f(x) as h→0?",
          explanation: "c is trapped between x and x+h. As h→0, that interval shrinks to a point: both endpoints approach x. By the Squeeze Theorem, c→x too. Then by continuity of f (f has no jumps), f(c)→f(x) as c→x. This is why FTC Part 1 requires f to be continuous — without continuity, f(c) might not approach f(x) even as c→x.",
          why: {
            tag: "What does 'continuous' mean precisely?",
            explanation: "f is continuous at x if lim_{c→x} f(c) = f(x). In plain English: no jumps, no holes, no vertical asymptotes at x. The function's value at x equals its limit at x. Continuous functions are the 'nice' functions where squeeze-based arguments work — if c approaches x, then f(c) approaches f(x) automatically.",
            why: null,
          },
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "F′(x) = f(x). The derivative of the area function is the integrand itself.",
        math: "\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)",
        note: "This means differentiation and integration are inverse operations. Integration 'undoes' differentiation and vice versa — the fundamental insight of calculus.",
        why: {
          tag: "Why is this called the 'fundamental' theorem?",
          explanation: "Before FTC, differentiation and integration appeared to be completely different operations — one about slopes and rates, the other about areas and accumulation. FTC revealed they are inverse operations, two sides of the same coin. This is as fundamental as the relationship between multiplication and division. It unified two entire branches of mathematics and transformed calculus from a collection of ad hoc techniques into a coherent theory.",
          why: {
            tag: "Full dependency chain",
            explanation: "FTC Part 1 relied on:",
            steps: [
              { text: "d/dx[∫_a^x f] = f(x)  ← the result" },
              { text: "↳ Additive property of definite integrals" },
              { text: "↳ Mean Value Theorem for Integrals  ← requires f continuous" },
              { text: "↳ Intermediate Value Theorem  ← requires continuity" },
              { text: "↳ Squeeze theorem: c→x as h→0" },
              { text: "↳ Continuity of f: f(c)→f(x)" },
            ],
            why: null,
          },
        },
      },
    ],
  },

  'ftc-2': {
    title: "Fundamental Theorem of Calculus, Part 2",
    subtitle: "Evaluating a definite integral using an antiderivative",
    category: "Integrals",
    problem: "\\int_a^b f(x)\\,dx = F(b) - F(a) \\quad\\text{where }F'=f",
    preamble: "FTC Part 2 is the computation engine of calculus. It says: to find the exact area under f from a to b, just evaluate any antiderivative F at the endpoints and subtract. No Riemann sums needed.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let G(x) = ∫_a^x f(t) dt (the accumulation function from FTC Part 1). We know G′(x) = f(x).",
        math: "G(x) = \\int_a^x f(t)\\,dt,\\quad G'(x) = f(x)",
        note: null,
        why: {
          tag: "Why introduce G(x) — what role does it play?",
          explanation: "G(x) is a specific antiderivative of f — the one that starts at zero when x=a (since G(a) = ∫_a^a f = 0). FTC Part 1 guarantees G′(x) = f(x). The goal of Part 2 is to evaluate G(b) = ∫_a^b f. We introduce G so we can connect ANY antiderivative F to G through the fact that functions with the same derivative differ only by a constant.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Let F be any antiderivative of f (F′ = f). Then F and G have the same derivative, so F − G is constant.",
        math: "(F - G)' = F' - G' = f - f = 0 \\quad\\Longrightarrow\\quad F(x) - G(x) = C",
        note: "A function with derivative 0 everywhere must be constant — this follows from the Mean Value Theorem.",
        why: {
          tag: "Why does zero derivative imply constant? That seems obvious but how do we prove it?",
          explanation: "By the Mean Value Theorem: if (F−G)′ = 0 on [a,b], then for any two points x₁ < x₂ in [a,b], there exists c in (x₁,x₂) where (F−G)(x₂) − (F−G)(x₁) = (F−G)′(c)·(x₂−x₁) = 0·(x₂−x₁) = 0. So (F−G)(x₁) = (F−G)(x₂) for any two points — the function takes the same value everywhere. That's what 'constant' means.",
          why: {
            tag: "What is the Mean Value Theorem again?",
            explanation: "MVT: if h is continuous on [a,b] and differentiable on (a,b), then there exists c in (a,b) where h′(c) = (h(b)−h(a))/(b−a). In words: the instantaneous rate equals the average rate somewhere. Here we use it in the form: if h′=0 everywhere, then (h(b)−h(a))/(b−a) = h′(c) = 0, so h(b) = h(a) for any a,b — h is constant.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Evaluate G(a): since the integral from a to a is zero, G(a) = 0. So C = F(a) − G(a) = F(a).",
        math: "G(a) = \\int_a^a f(t)\\,dt = 0 \\quad\\Longrightarrow\\quad F(a) - G(a) = F(a) \\quad\\Longrightarrow\\quad C = F(a)",
        note: null,
        why: {
          tag: "Why is ∫_a^a f = 0? Is that obvious?",
          explanation: "∫_a^a f(t) dt is the area under f over an interval of length zero — from a to a. There's no width, so there's no area. Formally: ∫_a^a f = ∫_a^a f (trivially). By the additive property: ∫_a^a + ∫_a^a = ∫_a^a, which means ∫_a^a = 0. Alternatively, in the Riemann sum definition: all subintervals have width 0, so the sum is 0.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Evaluate at x = b: F(b) − G(b) = C = F(a), so G(b) = F(b) − F(a).",
        math: "\\int_a^b f(x)\\,dx = G(b) = F(b) - F(a)",
        note: "Example: ∫₀³ x² dx = [x³/3]₀³ = 27/3 − 0 = 9. (Area under x² from 0 to 3 is exactly 9.)",
        why: {
          tag: "Why can we use ANY antiderivative F — don't different antiderivatives give different answers?",
          explanation: "Different antiderivatives F differ only by a constant C: F₁ = F₂ + C. But [F₁(b) − F₁(a)] = [(F₂(b)+C) − (F₂(a)+C)] = F₂(b) − F₂(a). The constant cancels in the subtraction. So it doesn't matter which antiderivative you pick — they all give the same definite integral value. This is also why +C drops out when you evaluate definite integrals.",
          why: {
            tag: "Full dependency chain",
            explanation: "FTC Part 2 relied on:",
            steps: [
              { text: "∫_a^b f = F(b)−F(a)  ← the result" },
              { text: "↳ FTC Part 1: G′(x) = f(x)" },
              { text: "↳ Zero derivative implies constant  ← from MVT" },
              { text: "↳ G(a) = ∫_a^a f = 0  ← trivial interval" },
            ],
            why: null,
          },
        },
      },
    ],
  },

  'int-power': {
    title: "Power Rule for Integration",
    subtitle: "Prove that ∫xⁿ dx = xⁿ⁺¹/(n+1) + C",
    category: "Integrals",
    problem: "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)",
    preamble: "The integration power rule is the reverse of the differentiation power rule. We find the antiderivative by asking: what function, when differentiated, gives xⁿ?",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "We need F(x) such that F′(x) = xⁿ. Guess: try F(x) = xⁿ⁺¹/(n+1).",
        math: "\\text{Guess: } F(x) = \\frac{x^{n+1}}{n+1}",
        note: "Strategy: reverse the power rule. Power rule differentiation drops the exponent and reduces it by 1. Antidifferentiation raises the exponent by 1 and divides by the new exponent.",
        why: {
          tag: "How do we know to try this guess? Is there a systematic method?",
          explanation: "Work backwards from the differentiation power rule: d/dx[xᵐ] = m·xᵐ⁻¹. We want the derivative to be xⁿ = xᵐ⁻¹, so m−1=n, meaning m=n+1. So try x^(n+1). But d/dx[x^(n+1)] = (n+1)xⁿ — that's (n+1) times too large. Fix it by dividing by (n+1): d/dx[x^(n+1)/(n+1)] = (n+1)xⁿ/(n+1) = xⁿ. The guess was built by reversing the derivative rule step by step.",
          why: {
            tag: "Is the antiderivative always found by 'guessing and checking'?",
            explanation: "For polynomials, yes — the pattern is systematic (reverse power rule). But for other functions, integration is genuinely harder than differentiation. Most functions don't have antiderivatives expressible in elementary form (e.g., ∫e^(x²)dx has no closed form). Guessing-then-verifying is actually the standard method: propose a candidate, differentiate it, and check if you get the original integrand.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify by differentiation: d/dx[xⁿ⁺¹/(n+1)] = xⁿ.",
        math: "\\frac{d}{dx}\\left[\\frac{x^{n+1}}{n+1}\\right] = \\frac{(n+1)x^n}{n+1} = x^n \\;\\checkmark",
        note: "The (n+1) factors cancel perfectly. This confirms the guess is correct.",
        why: {
          tag: "Walk through the differentiation step by step.",
          explanation: "1. Factor out the constant 1/(n+1): d/dx[x^(n+1)/(n+1)] = (1/(n+1)) · d/dx[x^(n+1)]. 2. Apply power rule: d/dx[x^(n+1)] = (n+1)·x^(n+1−1) = (n+1)xⁿ. 3. Multiply: (1/(n+1))·(n+1)xⁿ = xⁿ. The (n+1) in the denominator was placed there precisely to cancel the (n+1) that the power rule produces. This is why the formula divides by (n+1).",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Any constant added to F is also an antiderivative, since d/dx[C] = 0. So the general antiderivative includes +C.",
        math: "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C",
        note: "The +C represents infinitely many antiderivatives — one for each constant C. They all differ only by a vertical shift.",
        why: {
          tag: "Why do we need +C? Can't we just write xⁿ⁺¹/(n+1)?",
          explanation: "Both xⁿ⁺¹/3 and xⁿ⁺¹/3 + 7 and xⁿ⁺¹/3 − 100 all have derivative xⁿ. Saying the antiderivative is just xⁿ⁺¹/(n+1) would falsely imply it's unique. The +C captures this entire family of functions. Practically: for a definite integral F(b)−F(a), the C always cancels (F(b)+C)−(F(a)+C) = F(b)−F(a). For indefinite integrals (finding a general antiderivative), +C is essential — especially when using initial conditions to find a specific solution.",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Check n=2: ∫x² dx = x³/3 + C. Verify via FTC: ∫₀² x² dx = [x³/3]₀² = 8/3 − 0 = 8/3.",
        math: "\\int_0^2 x^2\\,dx = \\frac{2^3}{3} - \\frac{0^3}{3} = \\frac{8}{3} \\approx 2.667",
        note: null,
        why: {
          tag: "Does this match what we'd expect from the geometry?",
          explanation: "The area under y=x² from x=0 to x=2 should be roughly: the parabola starts at 0, ends at height 4. A rough estimate is a triangle with base 2, height 4: area ≈ (1/2)(2)(4) = 4. But the parabola curves inward (slower growth at the start), so the actual area is less than 4. Our answer 8/3 ≈ 2.67 is indeed less than 4 — this sanity check confirms the answer is reasonable.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C. The exponent increases by 1, divide by the new exponent.",
        math: "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad(n \\neq -1)",
        note: "Why n ≠ −1? With n=−1: formula gives x⁰/0 = 1/0, undefined. The case ∫(1/x)dx = ln|x|+C requires a separate proof (see ∫1/x).",
        why: {
          tag: "Why does the formula break at n = −1? What's special about 1/x?",
          explanation: "1/x = x^(−1). The formula says ∫x^(−1) dx = x^0/0 = 1/0 — division by zero. This isn't just a formula glitch; it reflects something real: no power of x can differentiate to give 1/x. All power functions xᵐ have derivatives that are also power functions. The function whose derivative is 1/x is the natural logarithm ln x — a fundamentally different kind of function. This is why 1/x needs its own special rule.",
          why: null,
        },
      },
    ],
  },

  'int-1x': {
    title: "Integral of 1/x",
    subtitle: "Prove that ∫(1/x) dx = ln|x| + C",
    category: "Integrals",
    problem: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C",
    preamble: "The Power Rule fails for n=−1 (gives 1/0). We need a separate antiderivative. Since d/dx[ln x] = 1/x (proved via implicit differentiation), the antiderivative is the natural log — extended to negative x using absolute value.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "For x > 0: we proved d/dx[ln x] = 1/x. So ln x is the antiderivative of 1/x when x > 0.",
        math: "\\frac{d}{dx}[\\ln x] = \\frac{1}{x} \\quad(x > 0)",
        note: null,
        why: {
          tag: "How was d/dx[ln x] = 1/x proved?",
          explanation: "Let y = ln x, so eʸ = x. Differentiate both sides implicitly: d/dx[eʸ] = d/dx[x]. Using Chain Rule on left: eʸ · dy/dx = 1. Solve: dy/dx = 1/eʸ = 1/x. (Since eʸ = x.) So d/dx[ln x] = 1/x. This is in the derivatives section — specifically the 'd-ln' proof. The key insight: we differentiate the inverse relationship (eʸ = x) rather than ln x directly, because we know how to differentiate eˣ.",
          why: {
            tag: "Why can we differentiate eʸ = x with respect to x, even though y is a function of x?",
            explanation: "That's exactly what implicit differentiation is. eʸ = x is an equation relating y and x. By the Chain Rule: d/dx[eʸ] = eʸ · (dy/dx). We treat y as a function of x even though it's not explicitly solved. This gives eʸ · dy/dx = 1, then divide: dy/dx = 1/eʸ = 1/x. It works because the equation eʸ = x implicitly defines y = ln x.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "For x < 0: write ln|x| = ln(−x). Differentiate using the Chain Rule.",
        math: "\\frac{d}{dx}[\\ln(-x)] = \\frac{1}{-x}\\cdot(-1) = \\frac{1}{x} \\quad(x < 0)",
        note: "When x < 0, −x > 0 so ln(−x) is defined. Chain Rule: outer = ln u, inner = u = −x, giving (1/u)·(−1) = 1/(−x)·(−1) = 1/x.",
        why: {
          tag: "Why do we need to handle x < 0 separately? What's different?",
          explanation: "ln x is only defined for x > 0. If x is negative, ln x doesn't exist. But 1/x is defined for all x ≠ 0, including negative x. We need an antiderivative that works for negative x too. The trick: for x < 0, use ln(−x) instead, since −x is positive when x is negative. Then verify that d/dx[ln(−x)] = 1/x. The absolute value in ln|x| unifies both cases: ln|x| = ln x (when x>0) and ln(−x) (when x<0).",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Both cases are captured by ln|x|. The antiderivative of 1/x is ln|x| + C.",
        math: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C",
        note: "The absolute value handles both x > 0 and x < 0. Note: 1/x is not defined at x = 0, so the domain is split: x > 0 or x < 0 (the constant C can differ on each piece).",
        why: {
          tag: "Can C be different on the two pieces x>0 and x<0?",
          explanation: "Yes! Since 1/x is undefined at x=0, the two regions x>0 and x<0 are completely disconnected. An antiderivative on x>0 doesn't have to match an antiderivative on x<0. So the most general antiderivative is: ln|x|+C₁ for x>0, and ln|x|+C₂ for x<0, where C₁ and C₂ can be different constants. In most calculus courses you just write +C and let context determine which region you're in.",
          why: {
            tag: "Full dependency chain",
            explanation: "∫(1/x)dx = ln|x|+C relied on:",
            steps: [
              { text: "∫(1/x)dx = ln|x|+C  ← the result" },
              { text: "↳ d/dx[ln x] = 1/x  ← proved by implicit differentiation on eʸ = x" },
              { text: "↳ Chain Rule for d/dx[ln(−x)]" },
              { text: "↳ FTC: antiderivative verified by differentiating" },
            ],
            why: null,
          },
        },
      },
    ],
  },

  'int-ex': {
    title: "Integral of eˣ",
    subtitle: "Prove that ∫eˣ dx = eˣ + C",
    category: "Integrals",
    problem: "\\int e^x\\,dx = e^x + C",
    preamble: "Since eˣ is its own derivative, it is also its own antiderivative — the only function with this property (up to a constant multiple). This makes eˣ uniquely simple in both differential and integral calculus.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "We need F(x) such that F′(x) = eˣ. Since d/dx[eˣ] = eˣ, the function eˣ itself satisfies this.",
        math: "\\frac{d}{dx}[e^x] = e^x \\;\\checkmark",
        note: null,
        why: {
          tag: "Why is d/dx[eˣ] = eˣ — what makes e special?",
          explanation: "e is defined so that eˣ is its own derivative. More precisely: e ≈ 2.71828 is the unique base where the exponential function eˣ satisfies d/dx[eˣ] = eˣ. For any other base b: d/dx[bˣ] = bˣ · ln b. The factor ln b equals 1 only when b = e (since ln e = 1 by definition). So eˣ is the unique exponential function that is exactly its own derivative — no extra factor.",
          why: {
            tag: "How was d/dx[eˣ] = eˣ actually proved?",
            explanation: "Using the limit definition of derivative: d/dx[eˣ] = lim_{h→0} (e^(x+h) − eˣ)/h = lim_{h→0} eˣ·(eʰ−1)/h = eˣ · lim_{h→0} (eʰ−1)/h. The key limit is lim_{h→0} (eʰ−1)/h = 1. This equals 1 because: using eʰ = 1 + h + h²/2 + ... (Taylor series), (eʰ−1)/h = (h + h²/2 + ...)/h = 1 + h/2 + ... → 1 as h→0. Alternatively, this limit is the definition of d/dx[eˣ] at x=0, which equals e⁰ = 1.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "eˣ is its own antiderivative. Adding the constant of integration: ∫eˣ dx = eˣ + C.",
        math: "\\int e^x\\,dx = e^x + C",
        note: "Verification: d/dx[eˣ + C] = eˣ + 0 = eˣ ✓. Example: ∫₀¹ eˣ dx = [eˣ]₀¹ = e¹ − e⁰ = e − 1 ≈ 1.718.",
        why: {
          tag: "Is eˣ truly the only function equal to its own derivative?",
          explanation: "Up to a constant multiple, yes. Suppose f′ = f. Consider d/dx[f(x)/eˣ]: using the Quotient Rule, = (f′eˣ − feˣ)/e²ˣ = eˣ(f′−f)/e²ˣ = (f′−f)/eˣ = 0/eˣ = 0 (since f′=f). So f(x)/eˣ has zero derivative everywhere, meaning f(x)/eˣ = C (constant), so f(x) = Ceˣ. Every solution is a multiple of eˣ. The only function equaling its own derivative is eˣ up to scaling.",
          why: null,
        },
      },
    ],
  },

  'int-sin': {
    title: "Integral of sin x",
    subtitle: "Prove that ∫sin x dx = −cos x + C",
    category: "Integrals",
    problem: "\\int \\sin x\\,dx = -\\cos x + C",
    preamble: "We need the antiderivative of sin x. Since d/dx[cos x] = −sin x, the antiderivative of sin x is −cos x.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "We need F(x) such that F′(x) = sin x. We know d/dx[cos x] = −sin x.",
        math: "\\frac{d}{dx}[\\cos x] = -\\sin x",
        note: null,
        why: {
          tag: "How was d/dx[cos x] = −sin x proved?",
          explanation: "Using the limit definition: d/dx[cos x] = lim_{h→0} (cos(x+h) − cos x)/h. Apply the sum-to-product identity: cos(x+h) = cos x·cos h − sin x·sin h. Substituting: = lim_{h→0} [cos x·cos h − sin x·sin h − cos x]/h = lim_{h→0} [cos x·(cos h−1)/h − sin x·(sin h/h)]. As h→0: (cos h−1)/h → 0 and sin h/h → 1. So = cos x·0 − sin x·1 = −sin x.",
          why: {
            tag: "Why does (cos h−1)/h → 0 as h→0?",
            explanation: "Using the identity cos h − 1 = −2sin²(h/2): (cos h−1)/h = −2sin²(h/2)/h = −sin(h/2)·(sin(h/2)/(h/2)). As h→0: sin(h/2)→0 and sin(h/2)/(h/2)→1. So the product → 0·1 = 0. This uses the fundamental limit lim_{θ→0} sin θ/θ = 1 (the sinc limit).",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Multiply by −1: d/dx[−cos x] = sin x. So F(x) = −cos x.",
        math: "\\frac{d}{dx}[-\\cos x] = -(-\\sin x) = \\sin x \\;\\checkmark",
        note: null,
        why: {
          tag: "Why does multiplying by −1 fix the sign?",
          explanation: "d/dx[cos x] = −sin x — the wrong sign. We want +sin x. We can flip the sign by negating the function: d/dx[−cos x] = −d/dx[cos x] = −(−sin x) = +sin x. This uses the rule that constants factor out of derivatives: d/dx[c·f(x)] = c·f′(x). Here c = −1.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "∫sin x dx = −cos x + C.",
        math: "\\int \\sin x\\,dx = -\\cos x + C",
        note: "Verify with FTC: ∫₀^π sin x dx = [−cos x]₀^π = −cos(π) − (−cos 0) = −(−1) − (−1) = 1 + 1 = 2. This is the area under one arch of the sine curve — exactly 2.",
        why: {
          tag: "Why is the area under one arch of sin exactly 2? Is that a coincidence?",
          explanation: "∫₀^π sin x dx = −cos(π) − (−cos 0) = −(−1) + 1 = 2. The sine curve goes from 0 to 1 back to 0 over [0,π], a half-wave. The maximum height is 1, the base is π ≈ 3.14. A rough rectangular estimate gives area ≈ 1 × π ≈ 3.14. The actual answer 2 is less (the arch is curved in, not rectangular). The fact that it's exactly 2 — a clean integer — is a beautiful consequence of cos(0) = 1 and cos(π) = −1. Not a coincidence: it's directly from the antiderivative.",
          why: null,
        },
      },
    ],
  },

  'int-cos': {
    title: "Integral of cos x",
    subtitle: "Prove that ∫cos x dx = sin x + C",
    category: "Integrals",
    problem: "\\int \\cos x\\,dx = \\sin x + C",
    preamble: "Since d/dx[sin x] = cos x, sin x is the antiderivative of cos x.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "We need F(x) such that F′(x) = cos x. We know d/dx[sin x] = cos x.",
        math: "\\frac{d}{dx}[\\sin x] = \\cos x \\;\\checkmark",
        note: null,
        why: {
          tag: "How was d/dx[sin x] = cos x proved?",
          explanation: "Using the limit definition: d/dx[sin x] = lim_{h→0} (sin(x+h) − sin x)/h. Apply the addition formula: sin(x+h) = sin x·cos h + cos x·sin h. Substituting: = lim_{h→0} [sin x·cos h + cos x·sin h − sin x]/h = lim_{h→0} [sin x·(cos h−1)/h + cos x·(sin h/h)]. As h→0: (cos h−1)/h → 0 and sin h/h → 1. So = sin x·0 + cos x·1 = cos x.",
          why: null,
        },
      },
      {
        id: 2, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "∫cos x dx = sin x + C.",
        math: "\\int \\cos x\\,dx = \\sin x + C",
        note: "Verify: ∫₀^(π/2) cos x dx = [sin x]₀^(π/2) = sin(π/2) − sin(0) = 1 − 0 = 1. This is the area under the first quarter-arch of cosine.",
        why: {
          tag: "Why is the area under cos from 0 to π/2 exactly 1?",
          explanation: "The cosine curve on [0, π/2] starts at height 1 and descends to 0. The antiderivative sin gives: sin(π/2) − sin(0) = 1 − 0 = 1. Intuitively: the quarter-arch of cosine is the mirror of the quarter-arch of sine (reflected). Both enclose area exactly 1 above the x-axis. This is also why ∫_{-π/2}^{π/2} cos x dx = [sin x]_{-π/2}^{π/2} = 1 − (−1) = 2 — the same as the full sine arch, by symmetry.",
          why: null,
        },
      },
    ],
  },

  'int-sec2': {
    title: "Integral of sec²x",
    subtitle: "Prove that ∫sec²x dx = tan x + C",
    category: "Integrals",
    problem: "\\int \\sec^2 x\\,dx = \\tan x + C",
    preamble: "Since d/dx[tan x] = sec²x (proved by Quotient Rule), tan x is the antiderivative of sec²x.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "We proved d/dx[tan x] = sec²x by the Quotient Rule on sin/cos.",
        math: "\\frac{d}{dx}[\\tan x] = \\sec^2 x \\;\\checkmark",
        note: null,
        why: {
          tag: "How was d/dx[tan x] = sec²x proved?",
          explanation: "Write tan x = sin x / cos x. Apply the Quotient Rule: d/dx[sin/cos] = (cos·cos − sin·(−sin))/cos² = (cos²x + sin²x)/cos²x. Use the Pythagorean identity sin²x + cos²x = 1: = 1/cos²x = sec²x. The Pythagorean identity is the key step — it collapses cos²+sin² into 1.",
          why: {
            tag: "Why is sec x defined as 1/cos x?",
            explanation: "Secant is the reciprocal of cosine: sec x = 1/cos x. This is useful because sec²x appears naturally as the derivative of tan x, and in integration by trig substitution. The 'sec' prefix comes from 'secant line' in trigonometry — in a right triangle with hypotenuse r and adjacent side adj, sec θ = r/adj = hypotenuse/adjacent. On the unit circle (r=1), sec θ = 1/cos θ.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "∫sec²x dx = tan x + C.",
        math: "\\int \\sec^2 x\\,dx = \\tan x + C",
        note: "Useful in trigonometric substitution: when integrating over expressions with √(1+x²), substituting x = tan θ turns sec²θ dθ back into an elementary integral.",
        why: {
          tag: "When does ∫sec²x show up in practice?",
          explanation: "Three main situations: (1) Directly integrating sec²x in a problem. (2) Trig substitution: if the integrand has √(1+x²), substitute x = tan θ, dx = sec²θ dθ. The sec² cancels with the √(1+tan²θ) = sec θ from the square root. (3) After differentiating: if you differentiate tan x and then want to 'undo' it (e.g., in a differential equation), you integrate sec²x back to tan x.",
          why: null,
        },
      },
    ],
  },

  'u-sub': {
    title: "U-Substitution",
    subtitle: "The reverse of the Chain Rule",
    category: "Integrals",
    problem: "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du \\quad u = g(x)",
    preamble: "U-substitution reverses the Chain Rule. When an integrand looks like f(g(x))·g′(x), we recognize it as the derivative of a composition, and substitute u = g(x) to simplify.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Recognize the pattern: if the integrand contains both a composed function f(g(x)) and the derivative g′(x), u-sub applies.",
        math: "\\int f(g(x))\\,g'(x)\\,dx",
        note: "The key: g′(x) must already be present in the integrand (possibly multiplied by a constant). Example: ∫2x·cos(x²)dx — here g(x)=x², g′(x)=2x.",
        why: {
          tag: "Why does recognizing g′(x) matter so much?",
          explanation: "Chain Rule: d/dx[F(g(x))] = F′(g(x))·g′(x). This says: the derivative of a composition always involves an 'outer' piece and an 'inner derivative' multiplied together. U-substitution works in reverse: if the integrand looks like 'something of g(x)' times 'g′(x)', then it's the derivative of some composition. The g′(x) must be there — if it's missing, u-sub forces you to put it there artificially (which often doesn't work).",
          why: {
            tag: "What if g′(x) is missing from the integrand?",
            explanation: "Sometimes you can force it: if g(x) = x², g′(x) = 2x. For ∫cos(x²)dx (no 2x present), you'd need to introduce 2x artificially: ∫cos(x²)dx = (1/2)∫cos(x²)·2x dx — but this changes the integral. Unless 2x is already there (or you're multiplying by a constant only), u-sub doesn't apply and other techniques are needed. In fact, ∫cos(x²)dx has no elementary antiderivative — it requires the Fresnel function from advanced math.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Set u = g(x). Then du = g′(x) dx. Substitute to replace the entire integrand in terms of u.",
        math: "u = g(x),\\quad du = g'(x)\\,dx \\quad\\Longrightarrow\\quad \\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du",
        note: "The g′(x)dx piece becomes du — it's absorbed into the new variable.",
        why: {
          tag: "What does du = g′(x) dx mean? How does 'dx' become 'du'?",
          explanation: "du is the differential of u. If u = g(x), then by the definition of differentials: du = g′(x) dx. Think of it as an infinitesimal change: when x changes by dx, u = g(x) changes by approximately g′(x)·dx = du. Substituting: g(x) → u, and g′(x)dx → du. The entire expression f(g(x))·g′(x)·dx turns into f(u)·du. The substitution literally replaces a complicated expression in x with a simpler one in u.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Example: ∫2x·cos(x²)dx. Let u = x², du = 2x dx.",
        math: "\\int 2x\\cos(x^2)\\,dx = \\int \\cos(u)\\,du = \\sin(u) + C = \\sin(x^2) + C",
        note: "Verify: d/dx[sin(x²)] = cos(x²)·2x ✓. The u-sub correctly reverse-engineered the Chain Rule.",
        why: {
          tag: "Walk through the substitution step by step.",
          explanation: "1. Identify g(x) = x², so u = x². 2. Compute du: du = d(x²)/dx · dx = 2x dx. 3. The integrand is 2x·cos(x²)·dx = cos(x²)·(2x dx) = cos(u)·du. 4. Integrate: ∫cos(u) du = sin(u) + C. 5. Back-substitute u = x²: sin(x²) + C. 6. Verify by Chain Rule: d/dx[sin(x²)] = cos(x²)·2x ✓.",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Example with limits: ∫₀¹ 2x·cos(x²)dx. Change limits: when x=0, u=0; when x=1, u=1.",
        math: "\\int_0^1 2x\\cos(x^2)\\,dx = \\int_0^1 \\cos(u)\\,du = [\\sin u]_0^1 = \\sin(1) - 0 \\approx 0.841",
        note: "For definite integrals, either change the limits to u-values (no need to back-substitute), or back-substitute and then use original limits.",
        why: {
          tag: "Why do the x-limits become u-limits? What's the logic?",
          explanation: "u = x². When x=0: u = 0² = 0. When x=1: u = 1² = 1. The integral ∫_{x=0}^{x=1} becomes ∫_{u=0}^{u=1}. This works because we're changing variables: every x in [0,1] maps to a u in [0,1] (via u=x²). The limits transform accordingly. Advantage: we don't need to back-substitute to x — we can evaluate directly in u.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "U-substitution: spot f(g(x))·g′(x), set u=g(x), write in u, integrate, substitute back.",
        math: "\\int f(g(x))\\,g'(x)\\,dx = F(g(x)) + C \\quad\\text{where }F' = f",
        note: null,
        why: {
          tag: "Full dependency chain",
          explanation: "U-substitution relied on:",
          steps: [
            { text: "u-sub formula  ← the result" },
            { text: "↳ Chain Rule: d/dx[F(g(x))] = F′(g(x))·g′(x)" },
            { text: "↳ FTC: integrating a derivative returns the function" },
            { text: "↳ Differential notation: du = g′(x) dx" },
          ],
          why: null,
        },
      },
    ],
  },

  'by-parts': {
    title: "Integration by Parts",
    subtitle: "Prove ∫u dv = uv − ∫v du",
    category: "Integrals",
    problem: "\\int u\\,dv = uv - \\int v\\,du",
    preamble: "Integration by parts is the reverse of the Product Rule. It transforms one integral into another — ideally a simpler one. It's essential for integrating products like x·eˣ, x·ln x, or xⁿ·sin x.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start from the Product Rule: d/dx[u(x)·v(x)] = u′v + uv′.",
        math: "\\frac{d}{dx}[uv] = u'v + uv'",
        note: null,
        why: {
          tag: "Why start from the Product Rule?",
          explanation: "Integration by Parts is the anti-Product Rule, just like u-substitution is the anti-Chain Rule. The Product Rule differentiates a product; integration by parts integrates a product. By starting from d/dx[uv] = u′v + uv′ and integrating both sides, we can rearrange to turn ∫uv′ dx into something involving uv and ∫u′v dx. The strategy: transform the integral we can't do (∫uv′) into one we can (∫u′v).",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Integrate both sides with respect to x.",
        math: "\\int \\frac{d}{dx}[uv]\\,dx = \\int u'v\\,dx + \\int uv'\\,dx",
        note: "The left side simplifies: ∫d[uv] = uv (by FTC — integrating a derivative returns the function).",
        why: {
          tag: "Why does ∫d/dx[uv] dx = uv? That seems circular.",
          explanation: "By FTC Part 2: integrating a derivative returns the original function (plus C). d/dx[uv] = (uv)′, so ∫(uv)′ dx = uv + C. We can ignore the C here since it will be absorbed into the +C at the end. The formula ∫d[uv] = uv is just FTC applied to the product function uv — it undoes the differentiation.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Rearrange to isolate ∫uv′ dx. Writing v′dx = dv and u′dx = du:",
        math: "uv = \\int v\\,du + \\int u\\,dv \\quad\\Longrightarrow\\quad \\int u\\,dv = uv - \\int v\\,du",
        note: "Solving for ∫u dv by subtracting ∫v du from both sides.",
        why: {
          tag: "What does 'dv = v′dx' mean — are these the same differentials as in u-sub?",
          explanation: "Yes, same concept. If v = v(x), then dv = v′(x) dx — the differential of v. Similarly du = u′(x) dx. Rewriting ∫uv′ dx as ∫u dv and ∫u′v dx as ∫v du is just notation using differentials. This is why the formula is written ∫u dv = uv − ∫v du instead of ∫u·v′·dx = u·v − ∫v·u′·dx — the differential notation is more compact and easier to work with.",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Example: ∫x·eˣ dx. Choose u = x (easy to differentiate), dv = eˣ dx (easy to integrate).",
        math: "u = x,\\; dv = e^x\\,dx \\implies du = dx,\\; v = e^x",
        note: null,
        why: {
          tag: "How to choose u and dv? Is there a strategy?",
          explanation: "LIATE is a priority guide for choosing u: L=Logarithms, I=Inverse trig, A=Algebraic (polynomials), T=Trig, E=Exponentials. Choose u as the type that appears earliest in LIATE. Why? Because u gets differentiated (du), and you want du to be simpler than u. Polynomials become lower degree; logs become 1/x; inverse trig becomes algebraic. Here x is algebraic and eˣ is exponential. Algebraic comes before Exponential in LIATE, so u=x (and dv=eˣ dx).",
          why: {
            tag: "Why does LIATE work — what's the logic?",
            explanation: "LIATE prioritizes functions that simplify when differentiated (become 'smaller' or 'simpler'). Logs: d/dx[ln x] = 1/x — simpler. Polynomials: d/dx[xⁿ] = nxⁿ⁻¹ — lower degree. Exponentials: d/dx[eˣ] = eˣ — doesn't simplify. Trig: d/dx[sin] = cos — doesn't simplify either. So we put the 'simplifying' functions as u (they'll be differentiated to du) and leave the 'non-simplifying' ones as dv (they'll be integrated to v).",
            why: null,
          },
        },
      },
      {
        id: 5, tag: "Verification", tagStyle: S.verify,
        instruction: "Apply the formula: ∫x eˣ dx = x·eˣ − ∫eˣ dx = xeˣ − eˣ + C = eˣ(x−1) + C.",
        math: "\\int x\\,e^x\\,dx = xe^x - \\int e^x\\,dx = xe^x - e^x + C = e^x(x-1) + C",
        note: "Verify: d/dx[eˣ(x−1)] = eˣ(x−1) + eˣ·1 = eˣ(x−1+1) = xeˣ ✓",
        why: {
          tag: "Why did integration by parts turn ∫xeˣ into something easier?",
          explanation: "The original integrand xeˣ is a product of a polynomial (x) and an exponential (eˣ). After parts: we differentiated x (getting du=dx, simpler) and integrated eˣ (getting v=eˣ, same type). The new integral ∫eˣ dx is just eˣ — much simpler than ∫xeˣ dx. The key is that differentiating x reduced the polynomial degree from 1 to 0. For ∫x²eˣ dx, you'd apply parts twice, reducing x² to x to 1.",
          why: null,
        },
      },
      {
        id: 6, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Integration by parts: ∫u dv = uv − ∫v du. Choose u and dv so the remaining integral ∫v du is simpler.",
        math: "\\int u\\,dv = uv - \\int v\\,du",
        note: "Sometimes requires applying twice (for ∫x²eˣ). Sometimes the same integral reappears on the right — collect it to solve algebraically (trick for ∫eˣ sin x).",
        why: {
          tag: "Full dependency chain",
          explanation: "Integration by Parts relied on:",
          steps: [
            { text: "∫u dv = uv − ∫v du  ← the result" },
            { text: "↳ Product Rule: d[uv] = u dv + v du" },
            { text: "↳ FTC: ∫d[uv] = uv (integrating a derivative gives back the function)" },
            { text: "↳ Linearity of integration (splitting into two integrals)" },
          ],
          why: null,
        },
      },
    ],
  },

  'int-linearity': {
    title: "Linearity of Integration",
    subtitle: "Prove that ∫[af ± bg] dx = a∫f dx ± b∫g dx",
    category: "Integrals",
    problem: "\\int [af(x) \\pm bg(x)]\\,dx = a\\int f\\,dx \\pm b\\int g\\,dx",
    preamble: "Integration is a linear operation: constants factor out and integrals of sums split into sums of integrals. This follows from the corresponding properties of limits (Riemann sums).",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "The definite integral is defined as a limit of Riemann sums.",
        math: "\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum_{i=1}^n f(x_i)\\Delta x",
        note: null,
        why: {
          tag: "What is a Riemann sum? What does this mean geometrically?",
          explanation: "A Riemann sum approximates the area under a curve by slicing it into n thin rectangles. Each rectangle has width Δx = (b−a)/n and height f(xᵢ) (the function value at some point in the slice). Adding all rectangle areas: ∑f(xᵢ)·Δx ≈ total area. As n→∞ (thinner and thinner rectangles), the approximation becomes exact: that limit is the integral. The integral is literally defined as this limit — it's not just a 'fancy area formula', it's the precise definition of what area means for a curved shape.",
          why: {
            tag: "What exactly is xᵢ — how do you pick the sample point?",
            explanation: "xᵢ is any point in the i-th subinterval. You can use the left endpoint, right endpoint, midpoint, or any other point — the Riemann sum converges to the same limit regardless (for continuous functions). This is a theorem: for nice enough functions, all choices of sample point give the same limit. In practice, we usually pick the right endpoint for simplicity.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Distribute in the Riemann sum: ∑[af(xᵢ) + bg(xᵢ)]Δx = a∑f(xᵢ)Δx + b∑g(xᵢ)Δx.",
        math: "\\sum_{i=1}^n [af(x_i)+bg(x_i)]\\Delta x = a\\sum_{i=1}^n f(x_i)\\Delta x + b\\sum_{i=1}^n g(x_i)\\Delta x",
        note: "Summation distributes over addition and constants factor out of sums — these are arithmetic properties.",
        why: {
          tag: "Why can we factor out the constants and split the sum?",
          explanation: "These are basic properties of addition: (1) Constants factor out of sums: ∑c·aᵢ = c·∑aᵢ. This follows because each term has c as a factor, so it can be factored from the entire sum. (2) Sums split over addition: ∑(aᵢ+bᵢ) = ∑aᵢ + ∑bᵢ. This is just rearranging the order of addition (commutative/associative laws). Both are true for any finite sum — no limits needed yet.",
          why: null,
        },
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "Take the limit n→∞. Each sum converges to its respective integral.",
        math: "\\lim_{n\\to\\infty}\\left[a\\sum f\\Delta x + b\\sum g\\Delta x\\right] = a\\int_a^b f\\,dx + b\\int_a^b g\\,dx",
        note: "Uses sum law and constant multiple law for limits.",
        why: {
          tag: "Why can we pull the constants a and b outside the limit?",
          explanation: "Constant Multiple Law for limits: lim[c·f(n)] = c·lim[f(n)]. This is a special case of the Product Law (one factor is a constant, so its limit is itself). And the Sum Law: lim[A(n) + B(n)] = lim A(n) + lim B(n) (when both limits exist). Applying both: lim[a·∑f·Δx + b·∑g·Δx] = a·lim[∑f·Δx] + b·lim[∑g·Δx] = a·∫f + b·∫g.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Integration is linear: constants factor out, and sums/differences split term by term.",
        math: "\\int [af \\pm bg]\\,dx = a\\int f\\,dx \\pm b\\int g\\,dx",
        note: "Example: ∫(3x² − 5cos x)dx = 3∫x²dx − 5∫cos x dx = 3·x³/3 − 5·sin x + C = x³ − 5 sin x + C.",
        why: {
          tag: "Why does linearity of integration matter so much?",
          explanation: "It lets us break complicated integrals into simple pieces. ∫(3x⁴ − 7x² + 2cos x − eˣ)dx is intimidating as one integral, but trivial as four: 3·∫x⁴ − 7·∫x² + 2·∫cos x − ∫eˣ. Each piece uses a basic formula. Linearity is also what allows Fourier series, transforms, and quantum mechanics — many advanced techniques rely on decomposing signals or functions into simpler parts and integrating each separately.",
          why: null,
        },
      },
    ],
  },
}
