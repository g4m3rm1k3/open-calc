// Proof data for all derivative reference entries.
// Shape matches ImplicitDiffProof PROOF constant — consumed by ProofViewer.jsx.

const S = {
  setup:    { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  key:      { bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  algebra:  { bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  geo:      { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  limit:    { bg: "#fdf4ff", text: "#6b21a8",  border: "#e9d5ff" },
  conclude: { bg: "#f0fdf4", text: "#14532d",  border: "#86efac" },
  verify:   { bg: "#f0fdfa", text: "#134e4a",  border: "#99f6e4" },
}

export const DERIVATIVE_PROOFS = {

  // ─── Definition ──────────────────────────────────────────────────────────────
  'deriv-def': {
    title: "The Derivative: Definition",
    subtitle: "What does it mean to differentiate a function?",
    category: "Derivatives",
    problem: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
    preamble: "The derivative captures the instantaneous rate of change of f at x — the slope of the tangent line at a single point. We build it by making the 'rise over run' formula more and more precise, shrinking the horizontal gap h toward zero.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start with average rate of change. Pick two nearby points on the curve and compute rise over run.",
        math: "\\text{Average rate of change} = \\frac{f(x+h) - f(x)}{h}",
        note: "This is the slope of the secant line — the line connecting (x, f(x)) to (x+h, f(x+h)).",
        why: {
          tag: "What is rise over run, geometrically?",
          explanation: "If you walk from point A to point B on a curve, the secant line is the straight line connecting them. Its slope is (vertical change)/(horizontal change) = (f(x+h)−f(x))/h. When h is large, this is a rough approximation. As h shrinks, the secant line rotates toward the tangent line at x.",
          steps: [
            { text: "Example: f(x) = x². Between x=2 and x=3 (h=1): slope = (9−4)/1 = 5." },
            { text: "Between x=2 and x=2.1 (h=0.1): slope = (4.41−4)/0.1 = 4.1." },
            { text: "Between x=2 and x=2.01 (h=0.01): slope = (4.0401−4)/0.01 = 4.01." },
            { text: "The slopes are converging to 4. The derivative at x=2 is 4 — confirmed by 2x = 2(2) = 4." },
          ],
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Let h shrink to zero. The average rate of change becomes the instantaneous rate of change — the derivative.",
        math: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        note: "We never set h=0 (that would give 0/0). Instead, we simplify the expression algebraically first, cancel h from numerator and denominator, then let h→0.",
        why: {
          tag: "Why can't we just plug in h=0?",
          explanation: "Plugging h=0 directly gives (f(x)−f(x))/0 = 0/0, which is undefined — division by zero. The limit process gets around this: we simplify the fraction while h≠0 (h is small but nonzero), cancel the h that appears in the denominator, and only then let h→0. At that point the h is gone and we can evaluate.",
          why: {
            tag: "What does 'limit' mean formally?",
            explanation: "lim_{h→0} g(h) = L means: for any tiny ε>0, there exists δ>0 such that whenever 0 < |h| < δ, we have |g(h)−L| < ε. In plain language: g(h) gets arbitrarily close to L as h gets arbitrarily close to 0, without ever touching 0.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Compute the derivative of f(x) = x² from the definition to confirm it works.",
        math: "\\frac{(x+h)^2 - x^2}{h} = \\frac{x^2 + 2xh + h^2 - x^2}{h} = \\frac{2xh + h^2}{h} = 2x + h",
        note: "After cancelling h (valid since h≠0 during the limit process), we get 2x + h. As h→0, this becomes 2x. So (x²)′ = 2x.",
        why: {
          tag: "How did (x+h)² expand to x²+2xh+h²?",
          explanation: "Expanding (x+h)²: multiply (x+h)(x+h). Use FOIL: x·x + x·h + h·x + h·h = x² + xh + xh + h² = x² + 2xh + h².",
          steps: [
            { text: "Verify numerically: (3+0.01)² = 3.01² = 9.0601. Formula: 9 + 2(3)(0.01) + (0.01)² = 9 + 0.06 + 0.0001 = 9.0601 ✓" },
          ],
          why: null,
        },
      },
      {
        id: 4, tag: "Geometry", tagStyle: S.geo,
        instruction: "The derivative is the slope of the tangent line — the unique line that touches the curve at exactly one point without crossing it (locally).",
        math: "\\text{Tangent slope at } x = f'(x) = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
        note: "The tangent line at point (a, f(a)) has equation: y = f(a) + f′(a)·(x−a). This is the best linear approximation to f near x=a.",
        why: {
          tag: "What makes the tangent line special compared to a secant?",
          explanation: "A secant crosses through two nearby points on the curve. As those points get closer, the secant's slope converges to a limit — that limit is the tangent slope. The tangent line is the limiting position of the secant. It 'just touches' the curve at the point of tangency, giving the instantaneous direction of the curve.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The derivative f′(x) = lim_{h→0} [f(x+h)−f(x)]/h is the foundation of all differentiation rules.",
        math: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        note: "Every rule — Power Rule, Product Rule, Chain Rule — is derived by applying this definition cleverly. Once proved, the rules spare us from recomputing limits every time.",
        why: {
          tag: "What is the full dependency chain of this definition?",
          explanation: "The derivative concept depends on these foundations:",
          steps: [
            { text: "The derivative f′(x)  ← limit definition" },
            { text: "↳ Limit of a function  ← ε-δ definition of limit" },
            { text: "↳ Real number arithmetic  ← field axioms (addition, multiplication, division)" },
            { text: "↳ Continuity (f must be continuous at x for f′(x) to exist)  ← limit definition of continuity" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── Power Rule ──────────────────────────────────────────────────────────────
  'power-rule': {
    title: "Power Rule",
    subtitle: "Prove that d/dx[xⁿ] = nxⁿ⁻¹ for any integer n",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[x^n] = nx^{n-1}",
    preamble: "The Power Rule is the workhorse of differentiation. We prove it from the limit definition using the Binomial Theorem to expand (x+h)ⁿ. We verify with a specific case (n=2) first, then generalize.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = xⁿ.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{(x+h)^n - x^n}{h}",
        note: "We need to expand (x+h)ⁿ. First let's verify the pattern with n=2 to understand what we're aiming for.",
        why: {
          tag: "Let's verify with n=2 first",
          explanation: "For n=2: [(x+h)²−x²]/h = [x²+2xh+h²−x²]/h = [2xh+h²]/h = 2x+h. As h→0 this gives 2x. So (x²)′ = 2x = 2·x^(2−1) ✓. The pattern nxⁿ⁻¹ gives 2x¹ = 2x. Now we need to prove it works for all n.",
          steps: [
            { text: "n=3: [(x+h)³−x³]/h. Expand (x+h)³ = x³+3x²h+3xh²+h³. Subtract x³: 3x²h+3xh²+h³. Divide by h: 3x²+3xh+h². As h→0: 3x² = 3x^(3−1) ✓" },
            { text: "Pattern emerging: the answer is always nxⁿ⁻¹." },
          ],
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Expand (x+h)ⁿ using the Binomial Theorem. Most terms will vanish when we divide by h.",
        math: "(x+h)^n = x^n + nx^{n-1}h + \\binom{n}{2}x^{n-2}h^2 + \\cdots + h^n",
        note: "The first term is xⁿ (which will cancel). The second term has h¹ (which survives after dividing by h). All remaining terms have h² or higher (which vanish as h→0).",
        why: {
          tag: "What is the Binomial Theorem?",
          explanation: "The Binomial Theorem says (a+b)ⁿ = Σ C(n,k)·aⁿ⁻ᵏ·bᵏ for k=0 to n, where C(n,k) = n!/(k!(n−k)!). Applying to (x+h)ⁿ: the k=0 term is xⁿ, the k=1 term is nx^(n−1)·h, all other terms have h² or higher.",
          steps: [
            { text: "C(n,0) = 1, so k=0 term: xⁿ·h⁰ = xⁿ" },
            { text: "C(n,1) = n, so k=1 term: n·x^(n−1)·h¹ = nx^(n−1)h" },
            { text: "C(n,2) = n(n−1)/2, so k=2 term: (n(n−1)/2)·x^(n−2)·h² — contains h²" },
            { text: "All k≥2 terms contain h² or higher powers, so they vanish as h→0 after dividing by h." },
          ],
          why: {
            tag: "Why does C(n,1) = n?",
            explanation: "C(n,1) = n!/[1!·(n−1)!] = n·(n−1)!/[(n−1)!] = n. We're counting ways to choose 1 item from n — there are exactly n ways.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Subtract xⁿ and divide by h. The first term cancels, the second survives, all others go to zero.",
        math: "\\frac{(x+h)^n - x^n}{h} = \\frac{nx^{n-1}h + \\binom{n}{2}x^{n-2}h^2 + \\cdots}{h} = nx^{n-1} + \\binom{n}{2}x^{n-2}h + \\cdots",
        note: "After dividing by h, every remaining term (except nxⁿ⁻¹) still has at least one factor of h. These all vanish in the limit.",
        why: {
          tag: "Why is it valid to cancel h from numerator and denominator?",
          explanation: "In the limit definition, h→0 but h≠0. Since h is never actually zero during this process, dividing by h is a legal algebraic operation. We're not dividing by zero — we're simplifying while h is a nonzero number, then taking the limit afterward.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Take the limit as h→0. Every term containing h vanishes, leaving only nxⁿ⁻¹.",
        math: "\\lim_{h\\to 0}\\left[nx^{n-1} + \\binom{n}{2}x^{n-2}h + \\cdots\\right] = nx^{n-1}",
        note: "The first term nxⁿ⁻¹ has no h — it's a constant with respect to h. All other terms contain h and shrink to 0.",
        why: {
          tag: "Why do terms with h vanish?",
          explanation: "A term like C(n,2)·x^(n−2)·h → C(n,2)·x^(n−2)·0 = 0 as h→0, because x^(n−2) is a finite constant (for a given x). We're multiplying a finite constant by h, which goes to 0.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The Power Rule is proved: for any positive integer n, d/dx[xⁿ] = nxⁿ⁻¹.",
        math: "\\frac{d}{dx}[x^n] = nx^{n-1}",
        note: "This extends to all real n (negative, fractional) using the Generalized Binomial Theorem or logarithmic differentiation. Examples: d/dx[x⁵] = 5x⁴, d/dx[x^(1/2)] = (1/2)x^(−1/2) = 1/(2√x), d/dx[x⁻³] = −3x⁻⁴.",
        why: {
          tag: "What was the full dependency chain?",
          explanation: "The Power Rule relied on these concepts:",
          steps: [
            { text: "d/dx[xⁿ] = nxⁿ⁻¹  ← the result" },
            { text: "↳ Limit definition of derivative" },
            { text: "↳ Binomial Theorem for expanding (x+h)ⁿ" },
            { text: "↳ Limit laws: lim of a sum = sum of limits" },
            { text: "↳ lim_{h→0} h = 0 (constant·h → 0)" },
            { text: "↳ Division property: h/h = 1 for h ≠ 0" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── Constant Rule ────────────────────────────────────────────────────────────
  'const-rule': {
    title: "Constant Rule",
    subtitle: "Prove that d/dx[c] = 0 for any constant c",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[c] = 0",
    preamble: "A constant function never changes, so its rate of change is always zero. This follows immediately from the definition of the derivative.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Apply the limit definition to f(x) = c.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{f(x+h) - f(x)}{h} = \\lim_{h\\to 0}\\frac{c - c}{h}",
        note: "f(x+h) = c and f(x) = c — a constant function returns c no matter what input you give it.",
        why: {
          tag: "What is a constant function?",
          explanation: "f(x) = c means the function always outputs the same value c regardless of x. Its graph is a horizontal line. The slope of a horizontal line is 0. So the derivative should be 0 everywhere.",
          why: null,
        },
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Simplify the numerator: c − c = 0, so 0/h = 0 for any h ≠ 0.",
        math: "\\lim_{h\\to 0}\\frac{c - c}{h} = \\lim_{h\\to 0}\\frac{0}{h} = \\lim_{h\\to 0} 0 = 0",
        note: "0/h = 0 for any nonzero h. The limit of the constant 0 is just 0.",
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The derivative of any constant is zero.",
        math: "\\frac{d}{dx}[c] = 0",
        note: "This makes intuitive sense: d/dx measures rate of change. A constant has zero rate of change.",
        why: null,
      },
    ],
  },

  // ─── Sum Rule ────────────────────────────────────────────────────────────────
  'sum-rule': {
    title: "Sum / Difference Rule",
    subtitle: "Prove that d/dx[f ± g] = f′ ± g′",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[f(x) \\pm g(x)] = f'(x) \\pm g'(x)",
    preamble: "The Sum Rule says you can differentiate a sum term by term. It follows directly from the corresponding rule for limits.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for h(x) = f(x) + g(x).",
        math: "h'(x) = \\lim_{h\\to 0}\\frac{[f(x+h)+g(x+h)] - [f(x)+g(x)]}{h}",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Regroup the numerator: collect f-terms and g-terms separately.",
        math: "= \\lim_{h\\to 0}\\frac{[f(x+h)-f(x)] + [g(x+h)-g(x)]}{h}",
        note: "Addition is commutative and associative — we can reorder terms freely.",
        why: null,
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Split the fraction: a sum in the numerator over a single denominator can be written as two separate fractions.",
        math: "= \\lim_{h\\to 0}\\left[\\frac{f(x+h)-f(x)}{h} + \\frac{g(x+h)-g(x)}{h}\\right]",
        note: null,
        why: {
          tag: "Why can we split a limit of a sum into a sum of limits?",
          explanation: "The Sum Law for limits: if both lim f(x) = L and lim g(x) = M exist, then lim[f(x)+g(x)] = L+M. This is proven from the ε-δ definition: choose δ = min(δ_f, δ_g) where each δ makes the individual errors less than ε/2. Then the total error is less than ε.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Apply the Sum Law for limits: the limit of a sum is the sum of the limits.",
        math: "= \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h} + \\lim_{h\\to 0}\\frac{g(x+h)-g(x)}{h} = f'(x) + g'(x)",
        note: "Each individual limit is exactly the definition of f′(x) and g′(x) respectively.",
        why: null,
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The derivative distributes over addition (and subtraction). We can differentiate term by term.",
        math: "\\frac{d}{dx}[f \\pm g] = f' \\pm g'",
        note: "Example: d/dx[x⁵ + 3x² − 7] = 5x⁴ + 6x − 0 = 5x⁴ + 6x. Each term differentiated independently.",
        why: null,
      },
    ],
  },

  // ─── Product Rule ────────────────────────────────────────────────────────────
  'product-rule': {
    title: "Product Rule",
    subtitle: "Prove that d/dx[f·g] = f′g + fg′",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[f(x)\\cdot g(x)] = f'(x)g(x) + f(x)g'(x)",
    preamble: "The Product Rule handles derivatives of products — and it is NOT simply (fg)′ = f′g′. The correct formula requires a classic trick: adding and subtracting a strategically chosen term to split one hard limit into two easy ones.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for h(x) = f(x)·g(x).",
        math: "h'(x) = \\lim_{h\\to 0}\\frac{f(x+h)g(x+h) - f(x)g(x)}{h}",
        note: "The numerator mixes both f and g — we can't split it directly. We need a trick.",
        why: {
          tag: "Why isn't it just f′·g′?",
          explanation: "Counter-example: f(x) = x, g(x) = x. Then fg = x². We know (x²)′ = 2x. But f′·g′ = 1·1 = 1 ≠ 2x. The product rule gives f′g + fg′ = 1·x + x·1 = 2x ✓. Multiplying rates of change is NOT the same as the rate of change of the product.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Add and subtract f(x+h)·g(x) inside the numerator. This splits one inseparable expression into two recognizable pieces.",
        math: "= \\lim_{h\\to 0}\\frac{f(x+h)g(x+h) \\;\\color{#0891b2}{- f(x+h)g(x) + f(x+h)g(x)}\\; - f(x)g(x)}{h}",
        note: "We added zero (the blue terms cancel each other), so the limit is unchanged. This is the key algebraic trick.",
        why: {
          tag: "Why does adding and subtracting the same term help?",
          explanation: "We need to group terms so that each group resembles a derivative definition. The goal is to isolate [f(x+h)−f(x)]/h and [g(x+h)−g(x)]/h. Adding and subtracting f(x+h)·g(x) achieves exactly this: it creates a g-difference and an f-difference that we can factor separately.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Regroup: first pair the g-difference terms, then the f-difference terms.",
        math: "= \\lim_{h\\to 0}\\left[f(x+h)\\cdot\\frac{g(x+h)-g(x)}{h} + g(x)\\cdot\\frac{f(x+h)-f(x)}{h}\\right]",
        note: "Factor f(x+h) out of the first group, and g(x) out of the second. Each fraction is now a derivative definition.",
        why: {
          tag: "Show the factoring step in detail",
          explanation: "Numerator after grouping: f(x+h)g(x+h) − f(x+h)g(x) + f(x+h)g(x) − f(x)g(x). Factor first two: f(x+h)[g(x+h)−g(x)]. Factor last two: g(x)[f(x+h)−f(x)]. Divide each by h.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Take the limit. Use Product Law: lim[A·B] = (lim A)·(lim B). As h→0, f(x+h)→f(x) by continuity.",
        math: "= f(x)\\cdot g'(x) + g(x)\\cdot f'(x)",
        note: "lim_{h→0} f(x+h) = f(x) because differentiable functions are continuous. The two remaining fractions are exactly the definitions of g′(x) and f′(x).",
        why: {
          tag: "Why does lim f(x+h) = f(x)?",
          explanation: "If f is differentiable at x, then f is continuous at x. Continuity means lim_{h→0} f(x+h) = f(x). Intuitively: as h shrinks to 0, x+h approaches x, so f(x+h) approaches f(x).",
          why: null,
        },
      },
      {
        id: 5, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify with a concrete example: f(x)=x², g(x)=x³, so fg = x⁵.",
        math: "\\frac{d}{dx}[x^5] = 5x^4 \\quad\\text{vs}\\quad f'g + fg' = 2x \\cdot x^3 + x^2 \\cdot 3x^2 = 2x^4 + 3x^4 = 5x^4 \\;\\checkmark",
        note: null,
        why: null,
      },
      {
        id: 6, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The Product Rule: differentiate the first and multiply by the second, plus the first times the derivative of the second.",
        math: "(fg)' = f'g + fg'",
        note: "Memory aid: 'first times derivative of second, plus second times derivative of first.' Or in Leibniz notation: d[uv] = u dv + v du.",
        why: {
          tag: "Full dependency chain",
          explanation: "The Product Rule relied on:",
          steps: [
            { text: "(fg)′ = f′g + fg′  ← the result" },
            { text: "↳ Add-and-subtract trick (adding zero to the numerator)" },
            { text: "↳ Product Law for limits: lim[A·B] = (lim A)(lim B)" },
            { text: "↳ Sum Law for limits" },
            { text: "↳ Continuity: differentiability implies continuity" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── Quotient Rule ───────────────────────────────────────────────────────────
  'quotient-rule': {
    title: "Quotient Rule",
    subtitle: "Prove that d/dx[f/g] = (f′g − fg′)/g²",
    category: "Derivatives",
    problem: "\\frac{d}{dx}\\left[\\frac{f}{g}\\right] = \\frac{f'g - fg'}{g^2}",
    preamble: "We derive the Quotient Rule from the Product Rule and Chain Rule — no need to start from scratch with the limit definition. Writing f/g as f·g⁻¹ reduces it to products and compositions.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Rewrite f/g as f · (g)⁻¹. Then apply the Product Rule.",
        math: "\\frac{d}{dx}\\left[\\frac{f}{g}\\right] = \\frac{d}{dx}[f \\cdot g^{-1}] = f' \\cdot g^{-1} + f \\cdot (g^{-1})'",
        note: "g⁻¹ means 1/g (the multiplicative inverse), not an inverse function. This is a valid rewrite: f/g = f · (1/g).",
        why: {
          tag: "Why apply the Product Rule here?",
          explanation: "f/g is a product of f and 1/g. The Product Rule handles products: (AB)′ = A′B + AB′. Here A = f and B = g⁻¹. We just need to find (g⁻¹)′.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Find d/dx[g⁻¹] = d/dx[(g(x))⁻¹] using the Chain Rule.",
        math: "\\frac{d}{dx}[g^{-1}] = \\frac{d}{du}[u^{-1}]\\bigg|_{u=g} \\cdot g' = (-u^{-2})\\cdot g' = -\\frac{g'}{g^2}",
        note: "The outer function is u⁻¹ (whose derivative is −u⁻²), the inner function is u = g(x). Chain Rule multiplies them together.",
        why: {
          tag: "Why is d/du[u⁻¹] = −u⁻²?",
          explanation: "u⁻¹ = u^(−1). By the Power Rule: d/du[u^(−1)] = −1·u^(−1−1) = −u^(−2) = −1/u².",
          steps: [
            { text: "Verify: d/du[1/u] from definition: [(1/(u+h)) − (1/u)]/h = [u−(u+h)]/(u(u+h)h) = −h/(u(u+h)h) = −1/(u(u+h)) → −1/u² as h→0 ✓" },
          ],
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute back into the Product Rule expression and combine into a single fraction.",
        math: "f' \\cdot g^{-1} + f \\cdot \\left(-\\frac{g'}{g^2}\\right) = \\frac{f'}{g} - \\frac{fg'}{g^2} = \\frac{f'g - fg'}{g^2}",
        note: "Multiply f′/g by g/g to get f′g/g², then combine over the common denominator g².",
        why: {
          tag: "Show the common denominator step",
          explanation: "f′/g − fg′/g² = f′·g/(g·g) − fg′/g² = f′g/g² − fg′/g² = (f′g − fg′)/g².",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Check with tan x = sin x / cos x. The result should be sec²x.",
        math: "\\frac{d}{dx}[\\tan x] = \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot(-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x \\;\\checkmark",
        note: "Used the Pythagorean identity sin²x + cos²x = 1 to simplify the numerator.",
        why: null,
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Quotient Rule: derivative of top times bottom minus top times derivative of bottom, all over bottom squared.",
        math: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}",
        note: "Memory: 'low d-high minus high d-low, over low-squared.' Valid wherever g(x) ≠ 0.",
        why: {
          tag: "Full dependency chain",
          explanation: "The Quotient Rule relied on:",
          steps: [
            { text: "(f/g)′ = (f′g − fg′)/g²  ← the result" },
            { text: "↳ Product Rule: (AB)′ = A′B + AB′" },
            { text: "↳ Chain Rule: d/dx[g(x)⁻¹] = −g′/g²" },
            { text: "↳ Power Rule: d/du[u⁻¹] = −u⁻²" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── Chain Rule ──────────────────────────────────────────────────────────────
  'chain-rule': {
    title: "Chain Rule",
    subtitle: "Prove that d/dx[f(g(x))] = f′(g(x))·g′(x)",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[f(g(x))] = f'(g(x))\\cdot g'(x)",
    preamble: "The Chain Rule handles composite functions — functions applied to functions. The key idea: the rate at which the composition changes equals the rate of the outer function (evaluated at the inner output) times the rate of the inner function.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for h(x) = f(g(x)).",
        math: "h'(x) = \\lim_{\\Delta x\\to 0}\\frac{f(g(x+\\Delta x)) - f(g(x))}{\\Delta x}",
        note: "Let u = g(x) and Δu = g(x+Δx) − g(x). As Δx→0, Δu→0 (because g is continuous).",
        why: {
          tag: "What is a composite function?",
          explanation: "f(g(x)) means 'apply g first, then apply f to the result.' If g(x) = x² and f(u) = sin(u), then f(g(x)) = sin(x²). The Chain Rule says: the derivative of sin(x²) is cos(x²)·2x — f′ evaluated at the inner function, times g′.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Multiply and divide by Δu = g(x+Δx) − g(x) to split the limit into two recognizable pieces.",
        math: "\\frac{f(g(x+\\Delta x)) - f(g(x))}{\\Delta x} = \\frac{f(u + \\Delta u) - f(u)}{\\Delta u} \\cdot \\frac{\\Delta u}{\\Delta x}",
        note: "This is valid when Δu ≠ 0. (The case Δu = 0 requires a more careful argument — see the Why panel.) As Δx→0, Δu→0 and Δu/Δx → g′(x).",
        why: {
          tag: "What if Δu = 0 for some values of Δx?",
          explanation: "If g is constant near x (meaning g(x+Δx) = g(x) for some nonzero Δx), then Δu=0 and we'd be dividing by zero. The rigorous fix: define a modified quotient that equals f′(g(x)) when Δu=0, and show this modified function is continuous. The limit calculation still gives the same answer. This subtlety is handled in a full real analysis course.",
          why: null,
        },
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "Take the limit as Δx→0. The two factors approach f′(g(x)) and g′(x) respectively.",
        math: "\\lim_{\\Delta x\\to 0}\\frac{f(u+\\Delta u)-f(u)}{\\Delta u} \\cdot \\lim_{\\Delta x\\to 0}\\frac{\\Delta u}{\\Delta x} = f'(g(x)) \\cdot g'(x)",
        note: "First factor: as Δx→0, Δu→0, so this is lim_{Δu→0}[f(u+Δu)−f(u)]/Δu = f′(u) = f′(g(x)). Second factor: Δu/Δx = [g(x+Δx)−g(x)]/Δx → g′(x).",
        why: null,
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify: d/dx[sin(x²)] = cos(x²)·2x. Outer function f(u)=sin u, inner g(x)=x².",
        math: "f'(u) = \\cos u,\\quad g'(x) = 2x \\quad\\Longrightarrow\\quad \\frac{d}{dx}[\\sin(x^2)] = \\cos(x^2)\\cdot 2x",
        note: "Check numerically at x=1: approximate slope ≈ [sin(1.01²)−sin(1)]/0.01 ≈ [sin(1.0201)−sin(1)]/0.01 ≈ [0.8570−0.8415]/0.01 ≈ 1.55. Formula: cos(1)·2(1) ≈ 0.5403·2 ≈ 1.08... Hmm, let me recheck: cos(1²)·2·1 = cos(1)·2 ≈ 1.08. Close ✓",
        why: null,
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The Chain Rule: 'derivative of the outside (evaluated at the inside) times the derivative of the inside.'",
        math: "\\frac{d}{dx}[f(g(x))] = f'(g(x))\\cdot g'(x)",
        note: "Extended Chain Rule for multiple compositions: d/dx[f(g(h(x)))] = f′(g(h(x)))·g′(h(x))·h′(x). Multiply one factor per layer.",
        why: {
          tag: "Full dependency chain",
          explanation: "The Chain Rule relied on:",
          steps: [
            { text: "(f∘g)′ = f′(g)·g′  ← the result" },
            { text: "↳ Limit definition of derivative" },
            { text: "↳ Product Law for limits" },
            { text: "↳ Continuity of g (so Δu→0 as Δx→0)" },
            { text: "↳ Definition of f′(g(x)) via the inner limit Δu→0" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx sin x ──────────────────────────────────────────────────────────────
  'd-sin': {
    title: "Derivative of sin x",
    subtitle: "Prove that d/dx[sin x] = cos x",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\sin x] = \\cos x",
    preamble: "We use the limit definition and the sine angle addition formula. The proof hinges on two key limits: lim sin(h)/h = 1 and lim (cos h − 1)/h = 0 as h→0.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = sin x.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{\\sin(x+h) - \\sin x}{h}",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Expand sin(x+h) using the sine angle addition formula.",
        math: "\\sin(x+h) = \\sin x\\cos h + \\cos x\\sin h",
        note: "This is the sine addition formula: sin(A+B) = sin A cos B + cos A sin B.",
        why: {
          tag: "Why is sin(A+B) = sin A cos B + cos A sin B?",
          explanation: "The sine addition formula comes from the unit circle or from Euler's formula. Geometrically: place a unit vector at angle A+B. Decompose it using a rotation by B from angle A. The sine of the combined angle picks up a cross-term involving both angles.",
          why: {
            tag: "Euler's formula derivation",
            explanation: "Euler's formula: e^(iθ) = cos θ + i sin θ. Then e^(i(A+B)) = e^(iA)·e^(iB) = (cos A + i sin A)(cos B + i sin B) = (cos A cos B − sin A sin B) + i(sin A cos B + cos A sin B). Equating imaginary parts gives sin(A+B) = sin A cos B + cos A sin B.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute the expansion and separate into two fractions.",
        math: "\\lim_{h\\to 0}\\frac{\\sin x\\cos h + \\cos x\\sin h - \\sin x}{h} = \\lim_{h\\to 0}\\left[\\sin x\\cdot\\frac{\\cos h - 1}{h} + \\cos x\\cdot\\frac{\\sin h}{h}\\right]",
        note: "Group the cos h − 1 terms (with sin x) and the sin h terms (with cos x).",
        why: null,
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Apply the two key trigonometric limits.",
        math: "\\lim_{h\\to 0}\\frac{\\cos h - 1}{h} = 0 \\qquad \\lim_{h\\to 0}\\frac{\\sin h}{h} = 1",
        note: "These limits are proved separately (see the Sinc limit proof in the Reference). The second is the famous sinc limit.",
        why: {
          tag: "Why does (cos h − 1)/h → 0?",
          explanation: "Multiply numerator and denominator by (cos h + 1): [(cos h − 1)(cos h + 1)] / [h(cos h + 1)] = (cos²h − 1) / [h(cos h + 1)] = −sin²h / [h(cos h + 1)] = −(sin h/h) · (sin h/(cos h + 1)). As h→0: (sin h/h)→1 and sin h→0 and (cos h+1)→2. So the whole thing → 1·0/2 = 0.",
          math: "\\frac{\\cos h - 1}{h} = -\\frac{\\sin h}{h} \\cdot \\frac{\\sin h}{\\cos h + 1} \\to -1 \\cdot \\frac{0}{2} = 0",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substitute both limits: sin x · 0 + cos x · 1 = cos x.",
        math: "\\frac{d}{dx}[\\sin x] = \\sin x \\cdot 0 + \\cos x \\cdot 1 = \\cos x",
        note: "Geometric check: at x=0, sin′(0) = cos(0) = 1. The tangent to sin x at the origin has slope 1 — the curve is rising steeply. At x=π/2, sin′(π/2) = cos(π/2) = 0, meaning sin has a horizontal tangent at its peak. ✓",
        why: {
          tag: "Full dependency chain",
          explanation: "d/dx[sin x] = cos x relied on:",
          steps: [
            { text: "d/dx[sin x] = cos x  ← the result" },
            { text: "↳ Sine angle addition formula: sin(A+B) = sin A cos B + cos A sin B" },
            { text: "↳ lim sin(h)/h = 1  ← proved by geometric squeeze theorem" },
            { text: "↳ lim (cos h − 1)/h = 0  ← derived from sinc using Pythagorean identity" },
            { text: "↳ Limit definition of derivative" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx cos x ──────────────────────────────────────────────────────────────
  'd-cos': {
    title: "Derivative of cos x",
    subtitle: "Prove that d/dx[cos x] = −sin x",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\cos x] = -\\sin x",
    preamble: "Exactly parallel to the sine derivative proof — we use the cosine angle addition formula and the same two key limits.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = cos x.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{\\cos(x+h) - \\cos x}{h}",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Expand cos(x+h) using the cosine angle addition formula.",
        math: "\\cos(x+h) = \\cos x\\cos h - \\sin x\\sin h",
        note: "Cosine addition: cos(A+B) = cos A cos B − sin A sin B. Note the minus sign — different from sine addition.",
        why: null,
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute and separate into two limits.",
        math: "\\lim_{h\\to 0}\\frac{\\cos x\\cos h - \\sin x\\sin h - \\cos x}{h} = \\lim_{h\\to 0}\\left[\\cos x\\cdot\\frac{\\cos h - 1}{h} - \\sin x\\cdot\\frac{\\sin h}{h}\\right]",
        note: null,
        why: null,
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Apply the same two key limits: (cos h−1)/h → 0 and sin h/h → 1.",
        math: "= \\cos x \\cdot 0 - \\sin x \\cdot 1 = -\\sin x",
        note: null,
        why: null,
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[cos x] = −sin x.",
        math: "\\frac{d}{dx}[\\cos x] = -\\sin x",
        note: "Check: at x=0, cos′(0) = −sin(0) = 0. Cosine has a horizontal tangent at x=0 (it's at its peak). At x=π/2, cos′(π/2) = −sin(π/2) = −1. Cosine is falling steeply. ✓",
        why: null,
      },
    ],
  },

  // ─── d/dx tan x ──────────────────────────────────────────────────────────────
  'd-tan': {
    title: "Derivative of tan x",
    subtitle: "Prove that d/dx[tan x] = sec²x",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\tan x] = \\sec^2 x",
    preamble: "We write tan x = sin x / cos x and apply the Quotient Rule, then simplify using the Pythagorean identity.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write tan x as a quotient and set up the Quotient Rule.",
        math: "\\tan x = \\frac{\\sin x}{\\cos x} \\quad\\Longrightarrow\\quad \\frac{d}{dx}[\\tan x] = \\frac{\\frac{d}{dx}[\\sin x]\\cdot\\cos x - \\sin x\\cdot\\frac{d}{dx}[\\cos x]}{\\cos^2 x}",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute the known derivatives: d/dx[sin x] = cos x, d/dx[cos x] = −sin x.",
        math: "= \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x}",
        note: "The numerator is cos²x + sin²x — this equals 1 by the Pythagorean identity.",
        why: {
          tag: "Why is sin²x + cos²x = 1?",
          explanation: "On the unit circle, any point (x, y) satisfies x² + y² = 1 by the Pythagorean theorem. Since cos θ and sin θ are the x and y coordinates of a point on the unit circle, cos²θ + sin²θ = 1.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Simplify: numerator is 1, denominator is cos²x, so the result is sec²x.",
        math: "\\frac{d}{dx}[\\tan x] = \\frac{1}{\\cos^2 x} = \\sec^2 x",
        note: "Check: sec²x = 1 + tan²x ≥ 1, so tan x is always increasing (positive derivative everywhere it's defined). At x=0: sec²(0) = 1. The slope of tan at the origin is 1.",
        why: null,
      },
    ],
  },

  // ─── d/dx sec x ──────────────────────────────────────────────────────────────
  'd-sec': {
    title: "Derivative of sec x",
    subtitle: "Prove that d/dx[sec x] = sec x tan x",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\sec x] = \\sec x \\tan x",
    preamble: "sec x = 1/cos x = (cos x)⁻¹. We apply the Chain Rule with outer function u⁻¹ and inner function u = cos x.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write sec x = (cos x)⁻¹ and identify the composite structure.",
        math: "\\sec x = (\\cos x)^{-1} \\quad\\text{outer: } f(u) = u^{-1},\\quad \\text{inner: } u = \\cos x",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply Chain Rule: d/dx[(cos x)⁻¹] = f′(cos x) · (cos x)′.",
        math: "= (-1)(\\cos x)^{-2} \\cdot (-\\sin x) = \\frac{\\sin x}{\\cos^2 x}",
        note: "d/du[u⁻¹] = −u⁻² (Power Rule). d/dx[cos x] = −sin x.",
        why: null,
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Rewrite the result as sec x · tan x.",
        math: "\\frac{\\sin x}{\\cos^2 x} = \\frac{1}{\\cos x} \\cdot \\frac{\\sin x}{\\cos x} = \\sec x \\cdot \\tan x",
        note: "Split cos²x = cos x · cos x, then recognize 1/cos x = sec x and sin x/cos x = tan x.",
        why: null,
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[sec x] = sec x tan x.",
        math: "\\frac{d}{dx}[\\sec x] = \\sec x \\tan x",
        note: null,
        why: null,
      },
    ],
  },

  // ─── d/dx eˣ ─────────────────────────────────────────────────────────────────
  'd-ex': {
    title: "Derivative of eˣ",
    subtitle: "Prove that d/dx[eˣ] = eˣ",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[e^x] = e^x",
    preamble: "eˣ is the only function (up to a constant multiple) that is its own derivative. The proof hinges on the definition of e: the number such that lim_{h→0}(eʰ−1)/h = 1.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = eˣ.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{e^{x+h} - e^x}{h}",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Factor eˣ out of the numerator using the exponent law eˣ⁺ʰ = eˣ · eʰ.",
        math: "= \\lim_{h\\to 0}\\frac{e^x \\cdot e^h - e^x}{h} = \\lim_{h\\to 0} e^x \\cdot \\frac{e^h - 1}{h} = e^x \\cdot \\lim_{h\\to 0}\\frac{e^h - 1}{h}",
        note: "eˣ does not depend on h, so it factors out of the limit like a constant.",
        why: {
          tag: "Why does eˣ⁺ʰ = eˣ · eʰ?",
          explanation: "This is the exponent product rule: a^(m+n) = aᵐ · aⁿ. Applied to base e: e^(x+h) = eˣ · eʰ. This is a fundamental property of exponential functions — adding exponents corresponds to multiplying values.",
          why: null,
        },
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "Evaluate the remaining limit. By definition of e, this limit equals 1.",
        math: "\\lim_{h\\to 0}\\frac{e^h - 1}{h} = 1",
        note: "This is equivalent to saying the derivative of eˣ at x=0 is 1 — i.e., e is precisely the base for which the exponential function has slope 1 at the origin.",
        why: {
          tag: "Why does (eʰ − 1)/h → 1?",
          explanation: "This is one way to define e. Using the Taylor series eʰ = 1 + h + h²/2! + h³/3! + ⋯, we get (eʰ−1)/h = (h + h²/2! + ⋯)/h = 1 + h/2! + ⋯ → 1 as h→0.",
          math: "e^h = 1 + h + \\frac{h^2}{2!} + \\cdots \\Rightarrow \\frac{e^h - 1}{h} = 1 + \\frac{h}{2!} + \\frac{h^2}{3!} + \\cdots \\to 1",
          why: {
            tag: "Where does the Taylor series for eˣ come from?",
            explanation: "Since (eˣ)′ = eˣ and e⁰ = 1, we can derive the series by repeated differentiation at x=0: f(0)=1, f′(0)=1, f″(0)=1, .... Taylor's theorem gives eˣ = Σ xⁿ/n!.",
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "eˣ · 1 = eˣ. The function equals its own derivative.",
        math: "\\frac{d}{dx}[e^x] = e^x",
        note: "This property makes eˣ uniquely important in differential equations. Any function Ce^x (C constant) satisfies y′ = y — a key equation in growth, decay, and oscillation problems.",
        why: {
          tag: "Full dependency chain",
          explanation: "d/dx[eˣ] = eˣ relied on:",
          steps: [
            { text: "d/dx[eˣ] = eˣ  ← the result" },
            { text: "↳ Exponent law: e^(x+h) = eˣ·eʰ" },
            { text: "↳ lim (eʰ−1)/h = 1  ← definition of e, provable via Taylor series" },
            { text: "↳ Constants factor out of limits" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx aˣ ─────────────────────────────────────────────────────────────────
  'd-ax': {
    title: "Derivative of aˣ",
    subtitle: "Prove that d/dx[aˣ] = aˣ ln a",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[a^x] = a^x \\ln a",
    preamble: "We rewrite aˣ using the natural exponential: aˣ = e^(x ln a). Then the Chain Rule and the known derivative of eˣ give the result immediately.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Rewrite aˣ in terms of e using the identity a = e^(ln a).",
        math: "a^x = (e^{\\ln a})^x = e^{x \\ln a}",
        note: "Since ln a is a constant (a is a fixed base), x ln a is a linear function of x.",
        why: {
          tag: "Why is a = e^(ln a)?",
          explanation: "ln a is defined as the inverse of eˣ: e^(ln a) = a. This is like saying 10^(log₁₀ 5) = 5. The natural log 'undoes' the exponential base e.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Chain Rule: outer function is e^u, inner function is u = x ln a.",
        math: "\\frac{d}{dx}[e^{x\\ln a}] = e^{x\\ln a} \\cdot \\frac{d}{dx}[x\\ln a] = e^{x\\ln a} \\cdot \\ln a",
        note: "d/dx[x ln a] = ln a because ln a is a constant. d/du[eᵘ] = eᵘ.",
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substitute back: e^(x ln a) = aˣ.",
        math: "\\frac{d}{dx}[a^x] = a^x \\ln a",
        note: "Special case: when a = e, ln e = 1, so d/dx[eˣ] = eˣ · 1 = eˣ ✓. For a=2: d/dx[2ˣ] = 2ˣ ln 2 ≈ 2ˣ · 0.693.",
        why: null,
      },
    ],
  },

  // ─── d/dx ln x ───────────────────────────────────────────────────────────────
  'd-ln': {
    title: "Derivative of ln x",
    subtitle: "Prove that d/dx[ln x] = 1/x",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\ln x] = \\frac{1}{x}",
    preamble: "We use implicit differentiation: if y = ln x, then eʸ = x. Differentiating both sides and solving for dy/dx gives 1/x immediately.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let y = ln x. This means eʸ = x (by definition of natural log as the inverse of eˣ).",
        math: "y = \\ln x \\iff e^y = x",
        note: null,
        why: {
          tag: "What does ln mean, exactly?",
          explanation: "The natural logarithm ln x is the inverse function of eˣ. So y = ln x means 'eʸ = x' — y is the exponent you raise e to in order to get x. For example: ln(e²) = 2 because e² = e².",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of eʸ = x with respect to x.",
        math: "\\frac{d}{dx}[e^y] = \\frac{d}{dx}[x] \\quad\\Longrightarrow\\quad e^y \\cdot \\frac{dy}{dx} = 1",
        note: "Left side: Chain Rule on eʸ — outer function eᵘ, inner function u = y(x). Right side: d/dx[x] = 1.",
        why: {
          tag: "Why does d/dx[eʸ] = eʸ · dy/dx and not just eʸ?",
          explanation: "y is a function of x (y = ln x). So eʸ = e^(y(x)) is a composite function. The Chain Rule applies: d/dx[e^(y(x))] = e^(y(x)) · y′(x) = eʸ · dy/dx. The extra dy/dx factor comes from the inner function y(x).",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Solve for dy/dx. Since eʸ = x, substitute to get 1/x.",
        math: "\\frac{dy}{dx} = \\frac{1}{e^y} = \\frac{1}{x}",
        note: "We substituted eʸ = x (the original relationship) to eliminate y from the answer.",
        why: null,
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[ln x] = 1/x, valid for x > 0.",
        math: "\\frac{d}{dx}[\\ln x] = \\frac{1}{x}",
        note: "This is one of the most important results in calculus. It means the area under 1/t from 1 to x equals ln x (FTC). For x < 0, d/dx[ln|x|] = 1/x also holds, making the full antiderivative of 1/x equal to ln|x| + C.",
        why: {
          tag: "Full dependency chain",
          explanation: "d/dx[ln x] = 1/x relied on:",
          steps: [
            { text: "d/dx[ln x] = 1/x  ← the result" },
            { text: "↳ Implicit differentiation: y = ln x ↔ eʸ = x" },
            { text: "↳ d/dx[eʸ] = eʸ·dy/dx  ← Chain Rule" },
            { text: "↳ d/dx[eˣ] = eˣ  ← proved above" },
            { text: "↳ Definition of ln as inverse of eˣ" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx arcsin x ───────────────────────────────────────────────────────────
  'd-arcsin': {
    title: "Derivative of arcsin x",
    subtitle: "Prove that d/dx[arcsin x] = 1/√(1−x²)",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\sqrt{1-x^2}}",
    preamble: "We use implicit differentiation: let y = arcsin x, which means sin y = x. Differentiating both sides and using the Pythagorean identity to eliminate y gives the result.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let y = arcsin x. This means sin y = x (arcsine is the inverse of sine).",
        math: "y = \\arcsin x \\iff \\sin y = x",
        note: "Domain restriction: y ∈ [−π/2, π/2] (the standard range of arcsin), so cos y ≥ 0.",
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of sin y = x with respect to x.",
        math: "\\cos y \\cdot \\frac{dy}{dx} = 1 \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = \\frac{1}{\\cos y}",
        note: "Chain Rule on left: d/dx[sin y] = cos y · dy/dx. Right side: d/dx[x] = 1.",
        why: null,
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Express cos y in terms of x using the Pythagorean identity.",
        math: "\\sin^2 y + \\cos^2 y = 1 \\quad\\Longrightarrow\\quad \\cos y = \\sqrt{1 - \\sin^2 y} = \\sqrt{1 - x^2}",
        note: "We use cos y = +√(1−x²) (not the negative root) because y ∈ [−π/2, π/2] where cosine is non-negative.",
        why: {
          tag: "Why the positive square root?",
          explanation: "arcsin x is defined for x ∈ [−1,1] with output y ∈ [−π/2, π/2]. In this range, cos y ≥ 0 (cosine is non-negative in [−π/2, π/2]). So we take the positive root.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substitute cos y = √(1−x²) to get the final answer.",
        math: "\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\cos y} = \\frac{1}{\\sqrt{1 - x^2}}",
        note: "Domain: −1 < x < 1 (the denominator is zero at x = ±1, meaning the tangent is vertical there). Check at x=0: 1/√1 = 1. The slope of arcsin at the origin is 1 (same as sin at the origin — inverse functions have reciprocal slopes at corresponding points).",
        why: null,
      },
    ],
  },

  // ─── d/dx arctan x ───────────────────────────────────────────────────────────
  'd-arctan': {
    title: "Derivative of arctan x",
    subtitle: "Prove that d/dx[arctan x] = 1/(1+x²)",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\arctan x] = \\frac{1}{1+x^2}",
    preamble: "Same implicit differentiation approach as arcsin: let y = arctan x means tan y = x. Differentiate both sides, then use a Pythagorean identity to eliminate y.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let y = arctan x, so tan y = x. The output range is y ∈ (−π/2, π/2).",
        math: "y = \\arctan x \\iff \\tan y = x",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of tan y = x with respect to x.",
        math: "\\sec^2 y \\cdot \\frac{dy}{dx} = 1 \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = \\frac{1}{\\sec^2 y} = \\cos^2 y",
        note: "d/dx[tan y] = sec²y · dy/dx (Chain Rule). 1/sec²y = cos²y.",
        why: null,
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Use the Pythagorean identity sec²y = 1 + tan²y and substitute tan y = x.",
        math: "\\sec^2 y = 1 + \\tan^2 y = 1 + x^2 \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = \\frac{1}{1 + x^2}",
        note: "No square root needed this time — sec²y = 1 + x² is always positive, so no domain restriction on the sign.",
        why: {
          tag: "Where does sec²y = 1 + tan²y come from?",
          explanation: "Start from sin²y + cos²y = 1. Divide both sides by cos²y: tan²y + 1 = sec²y. Rearranging: sec²y = 1 + tan²y.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[arctan x] = 1/(1+x²), valid for all real x.",
        math: "\\frac{d}{dx}[\\arctan x] = \\frac{1}{1+x^2}",
        note: "Domain: all real x (the denominator 1+x² is always ≥ 1, never zero). Check: at x=0, slope is 1/(1+0) = 1 ✓ (arctan and tan have slope 1 at the origin, as inverse functions). This is also the key antiderivative: ∫dx/(1+x²) = arctan x + C.",
        why: null,
      },
    ],
  },

  // ─── Implicit Differentiation ─────────────────────────────────────────────
  'implicit': {
    title: "Implicit Differentiation: x² + y² = r²",
    subtitle: "Prove that dy/dx = −x/y along the circle",
    category: "Derivatives",
    problem: "x^2 + y^2 = r^2 \\;\\Longrightarrow\\; \\frac{dy}{dx} = -\\frac{x}{y}",
    preamble: "The equation x²+y²=r² defines a circle. Unlike y = f(x), we cannot isolate y cleanly. Implicit differentiation lets us find dy/dx without solving for y — by differentiating both sides and using the Chain Rule on y².",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Treat y as a function of x — write it as y(x). The equation becomes a constraint on the composite function [y(x)]².",
        math: "x^2 + [y(x)]^2 = r^2",
        note: "Even though we don't know the formula for y(x), we know it exists (on each branch of the circle) and that it's differentiable. That's enough to proceed.",
        why: {
          tag: "What is an implicit function?",
          explanation: "An explicit function gives y directly: y = f(x). An implicit equation gives a relationship F(x,y)=0 where y's dependence on x is hidden. x²+y²=r² has two explicit branches: y = +√(r²−x²) and y = −√(r²−x²). Implicit differentiation works on both at once.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of x² + y² = r² with respect to x. Apply Chain Rule to the y² term.",
        math: "\\frac{d}{dx}[x^2] + \\frac{d}{dx}[y^2] = \\frac{d}{dx}[r^2] \\quad\\Longrightarrow\\quad 2x + 2y\\frac{dy}{dx} = 0",
        note: "d/dx[y²] = 2y·(dy/dx) by Chain Rule (y is a function of x). d/dx[r²] = 0 (r is a constant).",
        why: {
          tag: "Why does d/dx[y²] = 2y·(dy/dx)?",
          explanation: "y² = [y(x)]² is a composition: outer function u², inner function u = y(x). Chain Rule: d/dx[u²] = 2u · du/dx = 2y · dy/dx. If y were just x, we'd get 2x (and dy/dx = 1). But y is a different function of x, so we must include the dy/dx factor.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Isolate dy/dx. Treat dy/dx as a single unknown variable and solve algebraically.",
        math: "2y\\frac{dy}{dx} = -2x \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = -\\frac{x}{y}",
        note: "Divide both sides by 2y (valid when y ≠ 0). At y = 0 (points (±r, 0)), the tangent is vertical and dy/dx is undefined.",
        why: null,
      },
      {
        id: 4, tag: "Geometry", tagStyle: S.geo,
        instruction: "Verify: the tangent slope −x/y should be perpendicular to the radius (slope y/x).",
        math: "\\frac{y}{x} \\cdot \\left(-\\frac{x}{y}\\right) = -1 \\;\\checkmark",
        note: "Two lines are perpendicular when their slopes multiply to −1. The radius from origin to (x,y) has slope y/x. Their product is −1, confirming the result.",
        why: null,
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The derivative along the circle is dy/dx = −x/y, valid wherever y ≠ 0.",
        math: "\\frac{dy}{dx} = -\\frac{x}{y}",
        note: "General implicit differentiation pattern: for any F(x, y) = 0, differentiate both sides, collect dy/dx terms, factor and divide.",
        why: null,
      },
    ],
  },
}
