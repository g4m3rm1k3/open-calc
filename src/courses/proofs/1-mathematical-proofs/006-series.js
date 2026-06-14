// Proof data for all series reference entries.

const S = {
  setup:    { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  key:      { bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  algebra:  { bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  geo:      { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  limit:    { bg: "#fdf4ff", text: "#6b21a8",  border: "#e9d5ff" },
  conclude: { bg: "#f0fdf4", text: "#14532d",  border: "#86efac" },
  verify:   { bg: "#f0fdfa", text: "#134e4a",  border: "#99f6e4" },
}

export const SERIES_PROOFS = {

  'geo-series': {
    title: "Geometric Series",
    subtitle: "Why Σarⁿ = a/(1−r) when |r| < 1",
    category: "Series",
    problem: "\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r} \\quad (|r|<1)",
    preamble: "A geometric series sums infinitely many terms where each term is r times the previous. When |r| < 1, each term shrinks, and the sum converges to a finite value. The proof uses a clever algebraic trick.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let Sₙ = a + ar + ar² + ... + arⁿ (partial sum of n+1 terms).",
        math: "S_n = a + ar + ar^2 + \\cdots + ar^n",
        note: "We want the limit as n→∞.",
        why: {
          tag: "What is a partial sum and why use it?",
          explanation: "An infinite series Σaₙ is defined as the limit of partial sums: S₁ = a₁, S₂ = a₁+a₂, S₃ = a₁+a₂+a₃, ..., Sₙ = Σₖ₌₁ⁿ aₖ. The series converges if lim_{n→∞} Sₙ exists. We use partial sums because infinity is defined through limits — you can't add infinitely many numbers directly, but you can take a limit of finite sums.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Multiply Sₙ by r: rSₙ = ar + ar² + ... + arⁿ⁺¹. Subtract rSₙ from Sₙ.",
        math: "S_n - rS_n = a - ar^{n+1} \\;\\Longrightarrow\\; S_n(1-r) = a(1 - r^{n+1})",
        note: "Almost everything cancels: each term in rSₙ matches a term in Sₙ. Only the first term (a) and the last term (arⁿ⁺¹) survive.",
        why: {
          tag: "Why does almost everything cancel?",
          explanation: "Sₙ = a + ar + ar² + ... + arⁿ. rSₙ = ar + ar² + ar³ + ... + arⁿ⁺¹. Subtracting: Sₙ − rSₙ = a + (ar−ar) + (ar²−ar²) + ... + (arⁿ−arⁿ) − arⁿ⁺¹ = a − arⁿ⁺¹. Every middle term appears in both Sₙ and rSₙ and cancels. This is the 'telescoping' property of geometric series.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Solve for Sₙ.",
        math: "S_n = \\frac{a(1 - r^{n+1})}{1 - r} \\quad (r \\neq 1)",
        note: "This is the exact partial sum formula.",
        why: {
          tag: "What happens when r = 1?",
          explanation: "If r=1, every term is a, so Sₙ = (n+1)a → ∞ as n→∞. The series diverges. The formula Sₙ = a(1−rⁿ⁺¹)/(1−r) requires r≠1 (we divided by 1−r). The sum a/(1−r) only applies for |r|<1.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Take n→∞. When |r| < 1: rⁿ⁺¹ → 0.",
        math: "\\lim_{n\\to\\infty} S_n = \\frac{a(1-0)}{1-r} = \\frac{a}{1-r}",
        note: "When |r| < 1, powers rⁿ → 0 as n→∞. When |r| ≥ 1, rⁿ doesn't vanish, and the series diverges.",
        why: {
          tag: "Why does rⁿ → 0 when |r| < 1?",
          explanation: "If |r| < 1, then r = 1−ε for some ε > 0. rⁿ = (1−ε)ⁿ. By Bernoulli's inequality (or geometric reasoning): (1−ε)ⁿ → 0 as n→∞. More precisely, taking logarithms: n·ln(|r|) → −∞ since ln(|r|) < 0 when |r|<1, so |r|ⁿ = e^(n·ln|r|) → 0. Each multiplication by r shrinks the value, and with infinitely many multiplications, it vanishes.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Σ arⁿ = a/(1−r) for |r| < 1.",
        math: "\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r} \\quad (|r|<1)",
        note: "Example: 1 + 1/2 + 1/4 + ... = 1/(1−1/2) = 2. (a=1, r=1/2.) Zeno's paradox resolved!",
        why: {
          tag: "Why is this called 'geometric' series?",
          explanation: "A geometric sequence is one where each term is multiplied by a constant ratio: a, ar, ar², ar³, ... The ratio between consecutive terms is always r. This is called 'geometric' because it arises from geometric growth (or decay), as opposed to arithmetic sequences (constant difference). Examples: 1, 2, 4, 8, ... (r=2, diverges); 1, 1/3, 1/9, ... (r=1/3, converges to 3/2).",
          why: null,
        },
      },
    ],
  },

  'p-series': {
    title: "p-Series Convergence",
    subtitle: "Why Σ 1/nᵖ converges iff p > 1",
    category: "Series",
    problem: "\\sum_{n=1}^{\\infty} \\frac{1}{n^p} \\text{ converges iff } p > 1",
    preamble: "The p-series is a benchmark for convergence. The harmonic series (p=1) famously diverges even though its terms → 0. The proof uses the integral test — comparing the series to an integral.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "The integral test: if f(x) = 1/xᵖ is positive, decreasing, and continuous on [1,∞), then Σ 1/nᵖ and ∫₁^∞ 1/xᵖ dx either both converge or both diverge.",
        math: "\\sum_{n=1}^{\\infty} \\frac{1}{n^p} \\text{ and } \\int_1^{\\infty} \\frac{1}{x^p}\\,dx \\text{ have the same convergence behavior}",
        note: null,
        why: {
          tag: "Why does the integral test work?",
          explanation: "Compare rectangles to area. Since f is decreasing: for n ≤ x ≤ n+1, f(n) ≥ f(x) ≥ f(n+1). So f(n) ≥ ∫ₙⁿ⁺¹ f(x)dx ≥ f(n+1). Summing from n=1: Σf(n) ≥ ∫₁^∞ f dx ≥ Σf(n+1). If the integral converges (finite), the upper bound forces the series to converge. If the integral diverges, the lower bound forces the series to diverge.",
          why: {
            tag: "What is a decreasing function?",
            explanation: "f is decreasing if larger inputs give smaller outputs: if x < y then f(x) > f(y). For 1/xᵖ (p>0): as x increases, xᵖ increases, so 1/xᵖ decreases. This monotone decrease is required for the integral test comparison to work correctly.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Evaluate ∫₁^∞ x^(−p) dx using the power rule.",
        math: "\\int_1^{\\infty} x^{-p}\\,dx = \\left[\\frac{x^{-p+1}}{-p+1}\\right]_1^{\\infty} = \\lim_{b\\to\\infty}\\frac{b^{1-p}}{1-p} - \\frac{1}{1-p}",
        note: "This requires p ≠ 1 (p=1 needs ln).",
        why: null,
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Analyze the limit: b^(1−p) as b→∞.",
        math: "\\lim_{b\\to\\infty} b^{1-p} = \\begin{cases} \\infty & \\text{if } 1-p > 0 \\text{ (i.e., } p<1\\text{)} \\\\ 0 & \\text{if } 1-p < 0 \\text{ (i.e., } p>1\\text{)} \\end{cases}",
        note: "p > 1: integral converges (b^(1−p) → 0). p < 1: integral diverges (b^(1−p) → ∞).",
        why: {
          tag: "What about p = 1 (the harmonic series)?",
          explanation: "At p=1: ∫₁^∞ 1/x dx = [ln x]₁^∞ = ∞ − 0 = ∞. Diverges. So Σ 1/n diverges — this is the harmonic series. Famous fact: it diverges very slowly. You need about 10^43 terms to exceed 100. But it does diverge — any partial sum eventually exceeds any finite value. This was proved by Nicole Oresme around 1350.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Σ 1/nᵖ converges for p > 1, diverges for p ≤ 1.",
        math: "\\sum_{n=1}^{\\infty} \\frac{1}{n^p} = \\begin{cases} \\text{converges} & p > 1 \\\\ \\text{diverges} & p \\leq 1 \\end{cases}",
        note: "For p=2: Σ 1/n² = π²/6 ≈ 1.645 (Basel problem, solved by Euler 1734). For p=4: Σ 1/n⁴ = π⁴/90.",
        why: {
          tag: "Why does Σ 1/n² = π²/6? Where does π come from?",
          explanation: "This is the Basel problem, unsolved for 90 years before Euler proved it in 1734 using the sine function's product representation. The appearance of π is surprising — the series involves only integers, but its sum involves the ratio of a circle's circumference to its diameter. It's one of the most beautiful surprises in mathematics, showing the deep connections between arithmetic and geometry.",
          why: null,
        },
      },
    ],
  },

  'taylor': {
    title: "Taylor Series",
    subtitle: "Why f(x) = Σ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ",
    category: "Series",
    problem: "f(x) = \\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n",
    preamble: "The Taylor series approximates a smooth function as a polynomial using its derivatives at a single point a. Each term captures more and more of the function's behavior.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Suppose f(x) can be written as an infinite polynomial centered at a: f(x) = c₀ + c₁(x−a) + c₂(x−a)² + ...",
        math: "f(x) = \\sum_{n=0}^{\\infty} c_n(x-a)^n",
        note: "We need to find the coefficients cₙ. Plugging in x=a gives c₀ = f(a).",
        why: {
          tag: "Why assume a polynomial form — is every function like this?",
          explanation: "Not every function has a convergent Taylor series — but 'analytic' functions do (eˣ, sin x, cos x, polynomials, ln x for x>0). For these functions, the Taylor series converges to f(x) in some neighborhood of a. Functions that are infinitely differentiable but NOT equal to their Taylor series exist (example: e^(−1/x²) has all derivatives = 0 at x=0, but isn't zero), but they're rare in practice.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate repeatedly. Each differentiation reveals one coefficient.",
        math: "f'(x) = c_1 + 2c_2(x-a) + 3c_3(x-a)^2 + \\cdots \\implies f'(a) = c_1",
        note: "At x=a, all terms with (x−a) vanish. Only the constant term (the derivative of that power) survives.",
        why: {
          tag: "Walk me through how each derivative reveals a coefficient.",
          explanation: "f(a) = c₀. Differentiate once: f′(x) = c₁ + 2c₂(x−a) + ... → f′(a) = c₁. Differentiate twice: f″(x) = 2c₂ + 3·2·c₃(x−a) + ... → f″(a) = 2c₂ → c₂ = f″(a)/2. Differentiate n times: f⁽ⁿ⁾(a) = n!·cₙ → cₙ = f⁽ⁿ⁾(a)/n!. The n! comes from differentiating xⁿ repeatedly: d/dx[xⁿ] = nxⁿ⁻¹, d²/dx²[xⁿ] = n(n−1)xⁿ⁻², ..., dⁿ/dxⁿ[xⁿ] = n!.",
          why: {
            tag: "Why does dⁿ/dxⁿ[xⁿ] = n!?",
            explanation: "Power rule: d/dx[xⁿ] = nxⁿ⁻¹. Second derivative: n(n−1)xⁿ⁻². Third: n(n−1)(n−2)xⁿ⁻³. After n derivatives: n·(n−1)·(n−2)···2·1·x⁰ = n!·1 = n!. So the n-th derivative of xⁿ is the factorial n!.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substituting cₙ = f⁽ⁿ⁾(a)/n! into the power series gives the Taylor series.",
        math: "f(x) = \\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n",
        note: "When a = 0, this is the Maclaurin series: f(x) = Σ f⁽ⁿ⁾(0)/n! · xⁿ.",
        why: {
          tag: "How accurate is a Taylor polynomial with only a few terms?",
          explanation: "The Taylor polynomial of degree N (N+1 terms) approximates f with an error bounded by the remainder term: |Rₙ(x)| ≤ M|x−a|^(N+1)/(N+1)! where M = max|f^(N+1)|. This bound shrinks as N→∞ for analytic functions. In practice: near x=a, just a few terms give excellent accuracy. Far from a, you need more terms (or the series may not even converge).",
          why: null,
        },
      },
    ],
  },

  'maclaurin-ex': {
    title: "Maclaurin Series: eˣ",
    subtitle: "Why eˣ = 1 + x + x²/2! + x³/3! + ...",
    category: "Series",
    problem: "e^x = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!} = 1+x+\\frac{x^2}{2!}+\\cdots",
    preamble: "The Taylor series of eˣ at a=0 (Maclaurin series) is especially simple because all derivatives of eˣ are eˣ, so all derivatives at 0 equal e⁰ = 1.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Compute all derivatives of f(x) = eˣ.",
        math: "f(x) = e^x,\\quad f'(x) = e^x,\\quad f''(x) = e^x,\\quad \\ldots,\\quad f^{(n)}(x) = e^x",
        note: "eˣ is its own derivative — this is what makes it special.",
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Evaluate all derivatives at a = 0.",
        math: "f^{(n)}(0) = e^0 = 1 \\quad \\text{for all } n \\geq 0",
        note: "Every coefficient is 1/n!.",
        why: {
          tag: "So the Taylor coefficients are all just 1/n!?",
          explanation: "Yes. cₙ = f⁽ⁿ⁾(0)/n! = 1/n!. This is the simplest possible case. Every derivative is the same (eˣ), so every coefficient is 1/n!. No need to compute different derivatives — they're all 1 at x=0.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substitute into the Taylor formula.",
        math: "e^x = \\sum_{n=0}^{\\infty}\\frac{1}{n!}x^n = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots",
        note: "This converges for ALL real (and complex) x. Example: e¹ = 1+1+1/2+1/6+1/24+... = e ≈ 2.71828.",
        why: {
          tag: "Why does this converge everywhere, unlike some Taylor series?",
          explanation: "The radius of convergence is determined by how fast the coefficients 1/n! shrink. Using the ratio test: |(x^(n+1)/(n+1)!)/(xⁿ/n!)| = |x|/(n+1) → 0 as n→∞ for any fixed x. Since the ratio → 0 < 1, the series converges absolutely for all x. eˣ has no singularities in the complex plane (it's an entire function), which is why the series has infinite radius of convergence.",
          why: null,
        },
      },
    ],
  },

  'maclaurin-sin': {
    title: "Maclaurin Series: sin x",
    subtitle: "Why sin x = x − x³/3! + x⁵/5! − ...",
    category: "Series",
    problem: "\\sin x = x - \\dfrac{x^3}{3!} + \\dfrac{x^5}{5!} - \\cdots",
    preamble: "The Maclaurin series for sin x contains only odd powers of x with alternating signs. This follows from the fact that sin is an odd function and its derivatives cycle through sin, cos, −sin, −cos.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Compute the first several derivatives of f(x) = sin x, evaluated at x = 0.",
        math: "f(x) = \\sin x,\\; f'=\\cos x,\\; f''=-\\sin x,\\; f'''=-\\cos x,\\; f^{(4)}=\\sin x,\\ldots",
        note: "At x=0: sin(0)=0, cos(0)=1, −sin(0)=0, −cos(0)=−1, sin(0)=0, ... Pattern: 0,1,0,−1,0,1,0,−1,...",
        why: {
          tag: "Why do the derivatives cycle with period 4?",
          explanation: "d/dx[sin x] = cos x. d/dx[cos x] = −sin x. d/dx[−sin x] = −cos x. d/dx[−cos x] = sin x. After 4 derivatives, you're back to sin x. This 4-cycle is why the series has period-4 coefficients. Even derivatives (f'', f⁴,...) involve ±sin, which is 0 at x=0. Odd derivatives (f', f'',...) involve ±cos, which is ±1 at x=0.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Taylor coefficients: cₙ = f⁽ⁿ⁾(0)/n!. Only odd n contribute (even terms are 0).",
        math: "c_1 = \\frac{1}{1!},\\; c_3 = \\frac{-1}{3!},\\; c_5 = \\frac{1}{5!},\\; c_7 = \\frac{-1}{7!},\\ldots",
        note: "Even terms vanish (sin(0)=0). Odd terms alternate ±1/n!.",
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substitute to get the Maclaurin series.",
        math: "\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{(2n+1)!}",
        note: "First few terms are very accurate near x=0. sin(0.1) ≈ 0.1 − 0.001/6 ≈ 0.09983 (actual: 0.09983... ✓).",
        why: {
          tag: "Why only odd powers — isn't that a coincidence?",
          explanation: "No coincidence — it's because sin x is an odd function: sin(−x) = −sin(x). Odd functions have only odd powers in their Taylor series. If there were an even power term like cx², substituting x → −x would give +cx², but sin(−x) = −sin(x) would require −cx². The only way both hold: c=0. So all even coefficients must be zero for odd functions like sin, tan, arctan, sinh.",
          why: null,
        },
      },
    ],
  },

  'maclaurin-cos': {
    title: "Maclaurin Series: cos x",
    subtitle: "Why cos x = 1 − x²/2! + x⁴/4! − ...",
    category: "Series",
    problem: "\\cos x = 1 - \\dfrac{x^2}{2!} + \\dfrac{x^4}{4!} - \\cdots",
    preamble: "The Maclaurin series for cos x contains only even powers with alternating signs, because cos is an even function. It's related to the sin series by differentiation.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "The derivatives of cos x at x=0 follow the same 4-cycle as sin, but shifted.",
        math: "f(x)=\\cos x:\\; f(0)=1,\\; f'(0)=0,\\; f''(0)=-1,\\; f'''(0)=0,\\; f^{(4)}(0)=1,\\ldots",
        note: "Pattern of values at 0: 1, 0, −1, 0, 1, 0, −1, ... Only even-indexed terms are nonzero.",
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Taylor coefficients: only even n contribute.",
        math: "c_0 = 1,\\; c_2 = \\frac{-1}{2!},\\; c_4 = \\frac{1}{4!},\\; c_6 = \\frac{-1}{6!},\\ldots",
        note: "Odd terms vanish (cos′(0) = −sin(0) = 0). Even terms alternate ±1/n!.",
        why: {
          tag: "Can I get the cos series by differentiating the sin series?",
          explanation: "Yes! d/dx[sin x] = cos x. Differentiating the sin series term by term: d/dx[x − x³/3! + x⁵/5! − ...] = 1 − x²/2! + x⁴/4! − ... = cos x. Differentiating a power series term by term is valid within its radius of convergence. This is a beautiful connection: the cos and sin series are derivatives of each other, just as the functions are.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "cos x = 1 − x²/2! + x⁴/4! − ...",
        math: "\\cos x = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{(2n)!} = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots",
        note: "Combined with Euler's formula e^(iθ) = cos θ + i sin θ, you can see: eˣ + e^(ix) side by side, the even-power and odd-power terms are exactly cos and sin.",
        why: {
          tag: "How do the eˣ, sin, and cos series relate?",
          explanation: "eˣ = 1 + x + x²/2! + x³/3! + x⁴/4! + ... cos x = 1 + 0 − x²/2! + 0 + x⁴/4! + ... (even terms of eˣ with alternating signs). sin x = 0 + x + 0 − x³/3! + 0 + x⁵/5! − ... (odd terms of eˣ with alternating signs). Euler's formula makes this precise: e^(ix) = Σ(ix)ⁿ/n! = Σ(-1)ⁿx^(2n)/(2n)! + i·Σ(-1)ⁿx^(2n+1)/(2n+1)! = cos x + i sin x.",
          why: null,
        },
      },
    ],
  },

  'ratio-test': {
    title: "Ratio Test",
    subtitle: "Convergence by comparing consecutive terms",
    category: "Series",
    problem: "L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|: \\; L<1 \\Rightarrow \\text{conv.},\\; L>1 \\Rightarrow \\text{div.}",
    preamble: "The ratio test compares each term to the previous. If the ratio is consistently less than 1 (terms shrink by a constant factor), the series behaves like a convergent geometric series.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Compute L = lim |a_{n+1}/aₙ| — the limiting ratio of consecutive terms.",
        math: "L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|",
        note: "If L exists, it tells us how fast the terms shrink (L < 1) or grow (L > 1).",
        why: {
          tag: "Why look at consecutive ratios instead of the terms directly?",
          explanation: "If |a_{n+1}/aₙ| → r < 1, then eventually the series behaves like a geometric series with ratio r, which converges. If r > 1, terms grow, preventing convergence. The ratio test detects this 'long-run' geometric behavior. It's especially powerful for series with factorials or exponentials, where the ratio simplifies dramatically.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Case L < 1: choose r so that L < r < 1. Eventually |a_{n+1}| < r|aₙ| for all large n.",
        math: "\\exists N: n > N \\implies |a_{n+1}| < r|a_n|",
        note: "This means |aₙ| decreases at least as fast as a geometric series with ratio r.",
        why: {
          tag: "How does this prove convergence?",
          explanation: "After index N: |a_{N+1}| < r|a_N|, |a_{N+2}| < r|a_{N+1}| < r²|aₙ|, and so on. So |a_{N+k}| < rᵏ|aₙ|. The tail Σ_{k=1}^∞ |a_{N+k}| < |aₙ|·Σrᵏ = |aₙ|·r/(1−r) (geometric series, finite). Since the tail is bounded, the series converges absolutely.",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Case L > 1: eventually |a_{n+1}| > |aₙ|, so terms grow. The series diverges.",
        math: "L > 1 \\implies |a_n| \\not\\to 0 \\implies \\sum a_n \\text{ diverges}",
        note: "A necessary condition for convergence: aₙ → 0. If terms don't shrink to 0, the series can't converge.",
        why: {
          tag: "Why must aₙ → 0 for convergence?",
          explanation: "If Σaₙ converges to S, then the partial sums Sₙ → S. Also S_{n−1} → S. So aₙ = Sₙ − S_{n−1} → S − S = 0. Therefore aₙ → 0 is necessary for convergence. Warning: the converse is false! aₙ = 1/n → 0, but Σ1/n diverges (harmonic series). The ratio test with L=1 is inconclusive.",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Apply to Σ 1/n!: ratio = 1/(n+1) → 0 = L < 1. Converges.",
        math: "\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{n!}{(n+1)!} = \\frac{1}{n+1} \\to 0 < 1 \\;\\checkmark",
        note: "This confirms that eˣ = Σ xⁿ/n! converges: ratio |x|/(n+1) → 0 for any fixed x.",
        why: null,
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "L < 1: converges. L > 1: diverges. L = 1: inconclusive.",
        math: "L = \\lim\\left|\\frac{a_{n+1}}{a_n}\\right|:\\quad L<1\\Rightarrow \\text{conv},\\quad L>1\\Rightarrow\\text{div},\\quad L=1\\Rightarrow\\text{?}",
        note: "When L=1, both convergent (Σ1/n²) and divergent (Σ1/n) series are possible. Use a different test.",
        why: {
          tag: "Full dependency chain",
          explanation: "Ratio test relied on:",
          steps: [
            { text: "Ratio test  ← the result" },
            { text: "↳ Comparison with geometric series: |aₙ| < |aₙ|·rⁿ for large n" },
            { text: "↳ Geometric series convergence: Σrⁿ = 1/(1−r) for |r|<1" },
            { text: "↳ Necessary condition: aₙ → 0 for convergence" },
          ],
          why: null,
        },
      },
    ],
  },
}
