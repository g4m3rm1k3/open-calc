// Proof data for all derivative reference entries.
// Every non-trivial step has nested WhyPanels so any beginner can drill down.

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
        instruction: "Start with average rate of change between two points on the curve.",
        math: "\\text{Average rate of change} = \\frac{f(x+h) - f(x)}{h}",
        note: "This is the slope of the secant line — the straight line connecting the two points (x, f(x)) and (x+h, f(x+h)).",
        why: {
          tag: "What is rise over run?",
          explanation: "Slope = (vertical change) / (horizontal change). Between x and x+h: vertical change = f(x+h)−f(x), horizontal change = h. This gives the average rate — how fast f changed over that interval.",
          steps: [
            { text: "Example with f(x) = x²: between x=2 and x=3, average rate = (9−4)/(3−2) = 5." },
            { text: "Between x=2 and x=2.1: average rate = (4.41−4)/0.1 = 4.1." },
            { text: "Between x=2 and x=2.01: average rate = (4.0401−4)/0.01 = 4.01." },
            { text: "These are converging toward 4. The instantaneous rate at x=2 is 4." },
          ],
          why: {
            tag: "Why does the average rate matter?",
            explanation: "The average rate is what we can compute exactly (no limits needed). We use it as a starting point, then let the interval shrink. As h→0, the average rate becomes a better and better approximation of the instantaneous rate — which is the derivative.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Let h shrink to zero. The average rate of change becomes the instantaneous rate — the derivative.",
        math: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        note: "We never set h=0 directly — that gives 0/0. Instead, we simplify the fraction algebraically while h≠0, then let h approach zero.",
        why: {
          tag: "Why can't we just plug in h=0?",
          explanation: "Substituting h=0 gives (f(x)−f(x))/(0) = 0/0, which is undefined — not zero, not infinity, just meaningless. The limit sidesteps this: h is nonzero but shrinking, so we simplify the expression (canceling h from numerator and denominator) while it's still nonzero, then evaluate the simplified form at h=0.",
          why: {
            tag: "What is 0/0, really?",
            explanation: "0/0 is called an indeterminate form. It doesn't mean the limit doesn't exist — it just means direct substitution fails. The ratio could approach any number depending on the functions. Example: (2h)/h → 2 as h→0, and (h²)/h → 0, and (h)/h² → ∞. All are 0/0 forms but they give different limits.",
            steps: [
              { text: "lim_{h→0} (2h)/h = lim_{h→0} 2 = 2.  (Cancel h first, then substitute.)" },
              { text: "lim_{h→0} h²/h = lim_{h→0} h = 0." },
              { text: "The key: simplify algebraically BEFORE substituting." },
            ],
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Compute d/dx[x²] from the definition to see how it works.",
        math: "\\frac{(x+h)^2 - x^2}{h} = \\frac{x^2+2xh+h^2-x^2}{h} = \\frac{2xh+h^2}{h} = 2x+h",
        note: "After cancelling h (valid since h≠0 during the limit), we get 2x+h. As h→0 this is 2x. So (x²)′ = 2x.",
        why: {
          tag: "How does (x+h)² expand?",
          explanation: "Multiply (x+h)(x+h) using FOIL: first × first + first × last + last × first + last × last = x·x + x·h + h·x + h·h = x² + 2xh + h².",
          steps: [
            { text: "Numerical check: (3+0.01)² = 3.01² = 9.0601." },
            { text: "Using the formula: 9 + 2(3)(0.01) + (0.01)² = 9 + 0.06 + 0.0001 = 9.0601. ✓" },
          ],
          why: null,
        },
      },
      {
        id: 4, tag: "Geometry", tagStyle: S.geo,
        instruction: "Geometrically: the derivative is the slope of the tangent line — the line that just touches the curve at one point.",
        math: "\\text{tangent slope at }x = f'(x)",
        note: "The tangent line equation at point (a, f(a)): y = f(a) + f′(a)·(x−a). This is the best linear approximation to f near x=a.",
        why: {
          tag: "What makes a tangent line different from a secant?",
          explanation: "A secant connects two points on the curve. As those two points get closer together, the secant rotates, and in the limit it becomes the tangent — a line that touches the curve at exactly one point (locally) without crossing it. The tangent's slope is the derivative.",
          why: {
            tag: "Why do we care about the tangent line?",
            explanation: "The tangent line is the best straight-line approximation to f near a point. In physics, velocity is the derivative of position — the instantaneous rate of change. In economics, marginal cost is a derivative. In geometry, the tangent gives the direction the curve is heading. Derivatives appear everywhere rates of change matter.",
            why: null,
          },
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "f′(x) = lim_{h→0} [f(x+h)−f(x)]/h is the foundation of all calculus. Every rule is derived from it.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
        note: "Once we prove the Power Rule, Product Rule, Chain Rule etc. from this definition, we can use them as shortcuts and rarely need to go back to the limit.",
        why: {
          tag: "Dependency chain",
          explanation: "The derivative definition depends on:",
          steps: [
            { text: "f′(x) = limit definition  ← the foundation" },
            { text: "↳ Limit: lim_{h→0} means 'as h approaches 0'" },
            { text: "↳ Real number arithmetic: subtraction, division" },
            { text: "↳ Continuity: f must be continuous at x for f′(x) to exist" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── Power Rule ──────────────────────────────────────────────────────────────
  'power-rule': {
    title: "Power Rule",
    subtitle: "Prove that d/dx[xⁿ] = nxⁿ⁻¹",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[x^n] = nx^{n-1}",
    preamble: "The Power Rule is the most-used tool in differentiation. We prove it from the limit definition using the Binomial Theorem. We always verify the pattern with a concrete case (n=2) before generalizing.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = xⁿ.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{(x+h)^n - x^n}{h}",
        note: "We need to expand (x+h)ⁿ. Let's first do n=2 to see the pattern before tackling the general case.",
        why: {
          tag: "Check n=2 first",
          explanation: "For n=2: [(x+h)²−x²]/h = [x²+2xh+h²−x²]/h = [2xh+h²]/h = 2x+h → 2x as h→0. Formula predicts: 2·x^(2−1) = 2x. ✓ Now let's see why this works for every n.",
          steps: [
            { text: "n=3: (x+h)³ = x³+3x²h+3xh²+h³. Subtract x³ and divide by h: 3x²+3xh+h² → 3x² as h→0. Formula: 3x² ✓" },
            { text: "Pattern: after cancelling x^n and dividing by h, only the term with h¹ survives as h→0. That term is nxⁿ⁻¹." },
          ],
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Expand (x+h)ⁿ using the Binomial Theorem.",
        math: "(x+h)^n = x^n + nx^{n-1}h + \\binom{n}{2}x^{n-2}h^2 + \\cdots + h^n",
        note: "The first term is xⁿ (which cancels). The second term has exactly one factor of h (which survives). All remaining terms have h² or higher (which vanish in the limit).",
        why: {
          tag: "What is the Binomial Theorem?",
          explanation: "The Binomial Theorem: (a+b)ⁿ = Σ C(n,k)·aⁿ⁻ᵏ·bᵏ for k=0 to n. It tells us exactly how to expand a sum raised to a power. C(n,k) is 'n choose k' — the number of ways to pick k items from n.",
          steps: [
            { text: "k=0 term: C(n,0)·xⁿ·h⁰ = 1·xⁿ·1 = xⁿ" },
            { text: "k=1 term: C(n,1)·xⁿ⁻¹·h = n·xⁿ⁻¹·h  (because C(n,1) = n)" },
            { text: "k=2 term: C(n,2)·xⁿ⁻²·h²  — contains h², vanishes after dividing by h and taking limit" },
          ],
          why: {
            tag: "Why does C(n,1) = n?",
            explanation: "C(n,1) = n!/(1!·(n−1)!) = n·(n−1)!/(n−1)! = n. We're counting ways to choose 1 item from n — there are exactly n choices. So in (x+h)ⁿ, there are exactly n terms where h appears exactly once (pick h from one of the n factors, x from all the rest).",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Subtract xⁿ and divide by h. The xⁿ terms cancel; after dividing by h every term except nxⁿ⁻¹ still has a factor of h.",
        math: "\\frac{(x+h)^n - x^n}{h} = nx^{n-1} + \\binom{n}{2}x^{n-2}h + \\cdots + h^{n-1}",
        note: "We divided every term by h. The first term lost its h (giving nxⁿ⁻¹). All other terms still have at least h¹.",
        why: {
          tag: "Why is dividing by h valid?",
          explanation: "In the limit definition h approaches 0 but is never equal to 0. Since h≠0 during the entire limit process, dividing by h is a legal algebraic step. We are not dividing by zero — we're simplifying the expression for small-but-nonzero h, then taking the limit afterward.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Take the limit as h→0. Every term that still contains h becomes zero. Only nxⁿ⁻¹ remains.",
        math: "\\lim_{h\\to 0}\\left[nx^{n-1} + \\binom{n}{2}x^{n-2}h + \\cdots\\right] = nx^{n-1}",
        note: "Any term of the form (constant)·hᵏ with k≥1 goes to zero as h→0 because we're multiplying a finite constant by something shrinking to zero.",
        why: {
          tag: "Why do those terms go to zero?",
          explanation: "A term like C(n,2)·xⁿ⁻²·h: as h→0, C(n,2)·xⁿ⁻² is a fixed number (no h in it), and h→0. A fixed number times something approaching zero approaches zero. Formally: if |A| < M for some constant M, then |A·h| < M·|h| → 0.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "For any integer n ≥ 1: d/dx[xⁿ] = nxⁿ⁻¹.",
        math: "\\frac{d}{dx}[x^n] = nx^{n-1}",
        note: "Extends to all real n (negative, fractional) using the same idea or logarithmic differentiation. Examples: d/dx[x⁵]=5x⁴, d/dx[√x]=d/dx[x^(1/2)]=(1/2)x^(-1/2)=1/(2√x), d/dx[1/x]=d/dx[x⁻¹]=−x⁻²=−1/x².",
        why: {
          tag: "Dependency chain",
          explanation: "Power Rule relied on:",
          steps: [
            { text: "d/dx[xⁿ] = nxⁿ⁻¹  ← result" },
            { text: "↳ Limit definition of derivative" },
            { text: "↳ Binomial Theorem for (x+h)ⁿ" },
            { text: "↳ Limit law: lim[A + Bh + Ch² + …] = A (only constant term survives)" },
            { text: "↳ Division: h/h = 1 for h≠0" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── Constant Rule ───────────────────────────────────────────────────────────
  'const-rule': {
    title: "Constant Rule",
    subtitle: "Prove that d/dx[c] = 0",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[c] = 0",
    preamble: "A constant never changes, so its rate of change is zero. This is immediate from the definition.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let f(x) = c (a constant). Write the limit definition.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{f(x+h) - f(x)}{h} = \\lim_{h\\to 0}\\frac{c - c}{h}",
        note: "f(x+h) = c because a constant function always returns c, no matter what you plug in.",
        why: {
          tag: "What is a constant function?",
          explanation: "f(x) = c means the output is always c regardless of the input x. Its graph is a perfectly horizontal line. A horizontal line has slope 0 everywhere — so we expect the derivative to be 0.",
          why: {
            tag: "But what if c is large, like c = 1,000,000?",
            explanation: "The size of c doesn't matter. A function could be f(x) = 1,000,000 for all x — it never changes. Rate of change measures how much the output changes per unit of input. If the output never changes, the rate is 0 regardless of the output's value.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Simplify: c − c = 0, so the expression becomes 0/h = 0 for any nonzero h.",
        math: "\\lim_{h\\to 0}\\frac{c - c}{h} = \\lim_{h\\to 0}\\frac{0}{h} = \\lim_{h\\to 0} 0 = 0",
        note: "0 divided by any nonzero h is just 0. The limit of the constant 0 is 0.",
        why: {
          tag: "Is 0/h = 0 valid? Isn't division tricky?",
          explanation: "0 divided by any nonzero number is 0. For example, 0/5 = 0, 0/0.001 = 0. Since h≠0 in the limit (h approaches 0 but never equals it), 0/h = 0 for every h in the limit process. The limit of the constant function 0 is just 0.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[c] = 0. Constants have zero rate of change.",
        math: "\\frac{d}{dx}[c] = 0",
        note: "This is why constants disappear when you differentiate: d/dx[x² + 7] = 2x + 0 = 2x. The +7 has no effect on the slope.",
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
    preamble: "You can differentiate a sum term by term. This follows from the corresponding rule for limits: the limit of a sum equals the sum of the limits.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for h(x) = f(x) + g(x).",
        math: "h'(x) = \\lim_{h\\to 0}\\frac{[f(x+h)+g(x+h)] - [f(x)+g(x)]}{h}",
        note: null,
        why: {
          tag: "Why write h(x) = f(x) + g(x)?",
          explanation: "We want to find the derivative of the combined function. Since the derivative is defined as a limit for any function, we apply that definition to h(x) = f(x)+g(x). The goal is to show the answer equals f′(x)+g′(x).",
          why: null,
        },
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Regroup the numerator: separate the f-terms and g-terms.",
        math: "= \\lim_{h\\to 0}\\frac{[f(x+h)-f(x)] + [g(x+h)-g(x)]}{h} = \\lim_{h\\to 0}\\left[\\frac{f(x+h)-f(x)}{h} + \\frac{g(x+h)-g(x)}{h}\\right]",
        note: "Addition is commutative — we can reorder terms. A fraction with a sum in the numerator can be split into two fractions with the same denominator.",
        why: {
          tag: "Why is splitting the fraction valid?",
          explanation: "(A+B)/C = A/C + B/C — this is just basic fraction arithmetic. It holds as long as C≠0. Since h≠0 in our limit, we can always split this way.",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Sum Law for limits: the limit of a sum equals the sum of the limits (when both limits exist).",
        math: "= \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h} + \\lim_{h\\to 0}\\frac{g(x+h)-g(x)}{h} = f'(x) + g'(x)",
        note: "Each limit is exactly the definition of f′(x) and g′(x) respectively.",
        why: {
          tag: "Why can we split a limit over addition?",
          explanation: "Sum Law for limits: if lim A(h) = L and lim B(h) = M (both existing), then lim[A(h)+B(h)] = L+M. The proof: for any ε>0, choose δ₁ so |A−L| < ε/2 and δ₂ so |B−M| < ε/2. Then with δ = min(δ₁,δ₂): |A+B−(L+M)| ≤ |A−L| + |B−M| < ε/2 + ε/2 = ε.",
          why: {
            tag: "Why does this require both limits to exist?",
            explanation: "If f is not differentiable at x (no limit exists), we can't apply the Sum Law — the Sum Law only applies when both pieces converge to finite values. If f is not differentiable, neither is f+g necessarily.",
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Differentiate sums and differences term by term.",
        math: "\\frac{d}{dx}[f \\pm g] = f' \\pm g'",
        note: "Example: d/dx[x⁵ + 3x² − 7] = 5x⁴ + 6x − 0 = 5x⁴ + 6x. Combined with the Power Rule, this handles any polynomial.",
        why: null,
      },
    ],
  },

  // ─── Product Rule ────────────────────────────────────────────────────────────
  'product-rule': {
    title: "Product Rule",
    subtitle: "Prove that d/dx[fg] = f′g + fg′",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[f(x)\\cdot g(x)] = f'(x)g(x) + f(x)g'(x)",
    preamble: "The derivative of a product is NOT f′·g′. This is a common mistake. The correct formula requires a clever algebraic trick: adding and subtracting a carefully chosen term to split one unsolvable limit into two solvable ones.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for h(x) = f(x)·g(x).",
        math: "h'(x) = \\lim_{h\\to 0}\\frac{f(x+h)g(x+h) - f(x)g(x)}{h}",
        note: "The numerator mixes changes in f and changes in g together. We can't split this directly — we need a trick.",
        why: {
          tag: "Why isn't it just f′·g′?",
          explanation: "Counter-example: let f(x) = x and g(x) = x. Then f(x)·g(x) = x². We know (x²)′ = 2x. But f′·g′ = 1·1 = 1 ≠ 2x. The product rule gives f′g + fg′ = 1·x + x·1 = 2x ✓. Multiplying rates of change is NOT the same as the rate of change of the product — you have to account for both functions changing simultaneously.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Add and subtract f(x+h)·g(x) in the numerator. This adds zero (the terms cancel) but creates a structure we can factor.",
        math: "= \\lim_{h\\to 0}\\frac{f(x+h)g(x+h) - f(x+h)g(x) + f(x+h)g(x) - f(x)g(x)}{h}",
        note: "We added zero: [−f(x+h)g(x) + f(x+h)g(x)] = 0. The limit is unchanged, but we can now group differently.",
        why: {
          tag: "Why add zero? That seems pointless.",
          explanation: "Adding zero doesn't change the value, but it changes the algebraic structure. The goal is to create two separate pieces — one that isolates how g changes (while f is fixed at x+h) and one that isolates how f changes (while g is fixed at x). Adding and subtracting f(x+h)·g(x) achieves exactly this split.",
          why: {
            tag: "What are we trying to produce?",
            explanation: "We want to end up with [f(x+h)−f(x)]/h (which → f′) and [g(x+h)−g(x)]/h (which → g′). By grouping, we'll get f(x+h)·[g(x+h)−g(x)]/h + g(x)·[f(x+h)−f(x)]/h. In the limit, f(x+h) → f(x), giving f·g′ + g·f′.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Group: factor f(x+h) from the first two terms, g(x) from the last two.",
        math: "= \\lim_{h\\to 0}\\left[f(x+h)\\cdot\\frac{g(x+h)-g(x)}{h} + g(x)\\cdot\\frac{f(x+h)-f(x)}{h}\\right]",
        note: "Each fraction now looks like a derivative definition.",
        why: {
          tag: "Show the factoring step by step",
          explanation: "First pair: f(x+h)g(x+h) − f(x+h)g(x) = f(x+h)·[g(x+h)−g(x)]. Second pair: f(x+h)g(x) − f(x)g(x) = g(x)·[f(x+h)−f(x)]. Divide each by h.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Take the limit. The fractions become g′ and f′. The coefficient f(x+h) approaches f(x) as h→0.",
        math: "= f(x)\\cdot g'(x) + g(x)\\cdot f'(x)",
        note: "We used: lim[f(x+h)] = f(x) (differentiable functions are continuous), and lim[g(x+h)−g(x)]/h = g′(x) by definition.",
        why: {
          tag: "Why does lim f(x+h) = f(x)?",
          explanation: "If f is differentiable at x, then f is continuous at x. Continuity means: as h→0, x+h approaches x, so f(x+h) approaches f(x). Without continuity, the limit might not exist at all. Differentiability is actually a stronger condition than continuity — it implies it.",
          why: {
            tag: "Does differentiable always imply continuous?",
            explanation: "Yes. Proof: f(x+h)−f(x) = [f(x+h)−f(x)]/h · h. As h→0: the first factor → f′(x) (finite), and h → 0. So f(x+h)−f(x) → f′(x)·0 = 0, meaning f(x+h) → f(x). Continuity follows.",
            why: null,
          },
        },
      },
      {
        id: 5, tag: "Verification", tagStyle: S.verify,
        instruction: "Check with f(x) = x², g(x) = x³: product is x⁵.",
        math: "\\frac{d}{dx}[x^5] = 5x^4 \\qquad f'g + fg' = 2x \\cdot x^3 + x^2 \\cdot 3x^2 = 2x^4 + 3x^4 = 5x^4 \\;\\checkmark",
        note: null,
        why: null,
      },
      {
        id: 6, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Product Rule: (fg)′ = f′g + fg′.",
        math: "(fg)' = f'g + fg'",
        note: "Memory aid: 'derivative of first times second, PLUS first times derivative of second.' Each function gets differentiated exactly once.",
        why: {
          tag: "Dependency chain",
          explanation: "Product Rule relied on:",
          steps: [
            { text: "(fg)′ = f′g + fg′  ← result" },
            { text: "↳ Add-and-subtract trick (adding zero)" },
            { text: "↳ Product Law for limits" },
            { text: "↳ Sum Law for limits" },
            { text: "↳ Differentiability implies continuity: f(x+h) → f(x)" },
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
    preamble: "We derive the Quotient Rule from the Product Rule and Chain Rule — rewriting f/g as a product f · g⁻¹.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Rewrite f/g as f · (g)⁻¹. A quotient is just a product with the denominator raised to the power −1.",
        math: "\\frac{f}{g} = f \\cdot g^{-1}",
        note: "g⁻¹ means 1/g (the multiplicative reciprocal), NOT an inverse function. This rewrite lets us use the Product Rule.",
        why: {
          tag: "What does g⁻¹ mean here?",
          explanation: "g⁻¹(x) = 1/g(x). For example, if g(x) = x², then g⁻¹(x) = 1/x² = x⁻². This is the multiplicative inverse — the number you multiply by g to get 1. It's different from the inverse function g⁻¹(x) = √x (the function that undoes squaring). Here we mean reciprocal, not functional inverse.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Product Rule to f · g⁻¹.",
        math: "\\frac{d}{dx}[f \\cdot g^{-1}] = f' \\cdot g^{-1} + f \\cdot (g^{-1})'",
        note: "Product Rule: (AB)′ = A′B + AB′. Here A = f, B = g⁻¹. We still need to find (g⁻¹)′.",
        why: {
          tag: "Why can we use the Product Rule here?",
          explanation: "f/g = f · g⁻¹ is literally a product of two functions. The Product Rule applies to any two differentiable functions — it doesn't matter that one of them is 1/g. We just need to know the derivative of each factor.",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Find d/dx[g⁻¹] = d/dx[(g(x))⁻¹] using the Chain Rule. Outer function: u⁻¹. Inner function: u = g(x).",
        math: "\\frac{d}{dx}[g^{-1}] = (-1)\\cdot g^{-2} \\cdot g' = -\\frac{g'}{g^2}",
        note: "Chain Rule: d/dx[f(g(x))] = f′(g(x))·g′(x). Here the outer function is f(u) = u⁻¹, whose derivative is −u⁻². The inner function is u = g(x), whose derivative is g′(x).",
        why: {
          tag: "Why is d/du[u⁻¹] = −u⁻²?",
          explanation: "Power Rule: d/du[uⁿ] = nuⁿ⁻¹. With n = −1: d/du[u⁻¹] = −1·u⁻¹⁻¹ = −u⁻².",
          steps: [
            { text: "Verify from definition: [(1/(u+h)) − (1/u)]/h = [u−(u+h)]/[u(u+h)h] = −h/[u(u+h)h] = −1/[u(u+h)] → −1/u² as h→0. ✓" },
          ],
          why: {
            tag: "What is the Chain Rule?",
            explanation: "Chain Rule: d/dx[f(g(x))] = f′(g(x))·g′(x). It handles composite functions — functions applied to other functions. Step 1: differentiate the outer function f (but leave the inner function g unchanged inside). Step 2: multiply by the derivative of the inner function g′(x).",
            steps: [
              { text: "Example: d/dx[(x²+1)³]. Outer: f(u) = u³, f′(u) = 3u². Inner: g(x) = x²+1, g′(x) = 2x." },
              { text: "Result: 3(x²+1)² · 2x = 6x(x²+1)²." },
            ],
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute (g⁻¹)′ = −g′/g² into the Product Rule expression and simplify over a common denominator.",
        math: "f' \\cdot \\frac{1}{g} + f \\cdot \\left(-\\frac{g'}{g^2}\\right) = \\frac{f'}{g} - \\frac{fg'}{g^2} = \\frac{f'g - fg'}{g^2}",
        note: "To combine f′/g and fg′/g², multiply f′/g by g/g to get f′g/g², then subtract.",
        why: {
          tag: "Show the common denominator step",
          explanation: "f′/g = f′·g/(g·g) = f′g/g². Now: f′g/g² − fg′/g² = (f′g − fg′)/g².",
          why: null,
        },
      },
      {
        id: 5, tag: "Verification", tagStyle: S.verify,
        instruction: "Check with tan x = sin x / cos x. Should give sec²x.",
        math: "\\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x \\;\\checkmark",
        note: "Used: sin²x + cos²x = 1 in the numerator.",
        why: null,
      },
      {
        id: 6, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Quotient Rule: (f/g)′ = (f′g − fg′)/g².",
        math: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}",
        note: "Memory: 'low d-high minus high d-low, over low squared.' Valid wherever g(x) ≠ 0.",
        why: {
          tag: "Dependency chain",
          explanation: "Quotient Rule relied on:",
          steps: [
            { text: "(f/g)′ = (f′g − fg′)/g²  ← result" },
            { text: "↳ Product Rule: (fg)′ = f′g + fg′" },
            { text: "↳ Chain Rule: d/dx[g⁻¹] = −g′/g²" },
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
    preamble: "The Chain Rule differentiates composite functions — when one function is plugged into another. The rate of change of the composition equals: how fast the outer function changes at the inner value, times how fast the inner function itself changes.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Understand the composition. f(g(x)) means 'first apply g to x, then apply f to that result.'",
        math: "\\text{Example: } h(x) = \\sin(x^2) \\quad \\text{outer } f(u)=\\sin u,\\quad \\text{inner } g(x)=x^2",
        note: "The key question: how fast does h change? The answer involves both how fast x² changes (g′) AND how fast sin changes at that value (f′).",
        why: {
          tag: "What is a composite function?",
          explanation: "f(g(x)) applies two transformations in sequence. For f(g(x)) = sin(x²): first square x to get x², then take the sine of that result. If x changes a tiny bit, x² changes at rate 2x, and then sin(x²) responds to THAT change at rate cos(x²). The Chain Rule multiplies these rates.",
          why: {
            tag: "Why multiply the rates?",
            explanation: "Think of unit conversion. If speed is 60 miles/hour and 1 mile = 1.6 km, then speed in km/hour = 60 · 1.6 = 96. You multiply rates when chaining through different units. The Chain Rule is the calculus version: d(f)/d(g) · d(g)/d(x) = d(f)/d(x). The g in the denominator and numerator 'cancel' conceptually.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Write the limit definition and multiply top and bottom by Δu = g(x+Δx) − g(x).",
        math: "\\frac{f(g(x+\\Delta x))-f(g(x))}{\\Delta x} = \\underbrace{\\frac{f(g(x+\\Delta x))-f(g(x))}{g(x+\\Delta x)-g(x)}}_{\\to f'(g(x))} \\cdot \\underbrace{\\frac{g(x+\\Delta x)-g(x)}{\\Delta x}}_{\\to g'(x)}",
        note: "This split is valid when Δu = g(x+Δx)−g(x) ≠ 0. (The case Δu=0 needs a technical fix but gives the same result.)",
        why: {
          tag: "Why does multiplying by Δu/Δu work?",
          explanation: "Δu/Δu = 1 (as long as Δu≠0), so we're multiplying by 1 — the value doesn't change. But the algebraic structure does: we now have two separate ratios, each resembling a derivative definition. The first is [f(u+Δu)−f(u)]/Δu with u = g(x), and the second is [g(x+Δx)−g(x)]/Δx.",
          why: null,
        },
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "Take the limit as Δx→0. Since g is continuous, Δu→0 too. Each factor converges to the corresponding derivative.",
        math: "\\lim_{\\Delta x\\to 0}\\frac{f(u+\\Delta u)-f(u)}{\\Delta u} = f'(g(x)) \\qquad \\lim_{\\Delta x\\to 0}\\frac{\\Delta u}{\\Delta x} = g'(x)",
        note: "The first limit is lim_{Δu→0} since Δu→0 as Δx→0. By continuity of g, this substitution is valid.",
        why: {
          tag: "Why does Δu→0 as Δx→0?",
          explanation: "Δu = g(x+Δx)−g(x). If g is continuous at x (which it is, since differentiability implies continuity), then as Δx→0, g(x+Δx)→g(x), so Δu = g(x+Δx)−g(x) → 0. Continuity of g is what makes the chain work.",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify: d/dx[sin(x²)] = cos(x²)·2x. Check numerically at x=1.",
        math: "f'(g(x))\\cdot g'(x) = \\cos(x^2)\\cdot 2x",
        note: "At x=1: formula gives cos(1)·2 ≈ 0.540·2 ≈ 1.08. Numerical check: [sin(1.01²)−sin(1)]/0.01 = [sin(1.0201)−sin(1)]/0.01 ≈ 1.08. ✓",
        why: null,
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Chain Rule: d/dx[f(g(x))] = f′(g(x))·g′(x).",
        math: "\\frac{d}{dx}[f(g(x))] = f'(g(x))\\cdot g'(x)",
        note: "Extended Chain: d/dx[f(g(h(x)))] = f′(g(h(x)))·g′(h(x))·h′(x). One factor per layer.",
        why: {
          tag: "Dependency chain",
          explanation: "Chain Rule relied on:",
          steps: [
            { text: "(f∘g)′ = f′(g)·g′  ← result" },
            { text: "↳ Limit definition of derivative" },
            { text: "↳ Product Law for limits" },
            { text: "↳ Continuity of g: Δu→0 as Δx→0" },
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
    preamble: "This is a foundational result that requires the limit definition plus the sine angle addition formula and two key trig limits. Every step is essential — there are no shortcuts here.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = sin x.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{\\sin(x+h) - \\sin x}{h}",
        note: "We can't simplify sin(x+h) directly — it's not sin(x) + sin(h). We need the angle addition formula.",
        why: {
          tag: "Why can't we just say sin(x+h) = sin(x) + sin(h)?",
          explanation: "Sine is NOT linear — you can't distribute it over addition. Counter-example: sin(30°+60°) = sin(90°) = 1, but sin(30°)+sin(60°) = 0.5+0.866 = 1.366 ≠ 1. Instead, sin(A+B) = sin A cos B + cos A sin B (the angle addition formula — proved geometrically).",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Expand sin(x+h) using the angle addition formula: sin(A+B) = sin A cos B + cos A sin B.",
        math: "\\sin(x+h) = \\sin x \\cos h + \\cos x \\sin h",
        note: "This formula is proved geometrically from the unit circle. It's a fact we use here, not re-prove.",
        why: {
          tag: "Where does sin(A+B) = sin A cos B + cos A sin B come from?",
          explanation: "Place two unit vectors at angles A and A+B on the unit circle. Using rotation matrices: rotating the vector (cos A, sin A) by angle B gives (cos(A+B), sin(A+B)). The rotation matrix multiplied out gives exactly sin(A+B) = sin A cos B + cos A sin B.",
          why: {
            tag: "Why use the rotation matrix?",
            explanation: "Rotating a vector (x,y) by angle B in the plane sends it to (x cos B − y sin B, x sin B + y cos B). Apply this to (cos A, sin A): new y-coordinate is cos A · sin B + sin A · cos B = sin(A+B). That's the formula.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute the expansion. Group terms: pull out the sin x terms and the cos x terms.",
        math: "\\lim_{h\\to 0}\\frac{\\sin x\\cos h + \\cos x\\sin h - \\sin x}{h} = \\lim_{h\\to 0}\\left[\\sin x\\cdot\\frac{\\cos h - 1}{h} + \\cos x\\cdot\\frac{\\sin h}{h}\\right]",
        note: "Factor sin x from the first and third terms, cos x from the second. Split the fraction over addition.",
        why: {
          tag: "Why group it this way?",
          explanation: "We're aiming for two separate limits: lim[(cos h−1)/h] and lim[sin h/h]. Both are known trig limits. By separating the sin x and cos x factors (which don't depend on h) out front, we're set up to evaluate those two limits independently.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Apply the two key trig limits: lim sin(h)/h = 1 and lim (cos h − 1)/h = 0.",
        math: "\\lim_{h\\to 0}\\frac{\\sin h}{h} = 1 \\qquad \\lim_{h\\to 0}\\frac{\\cos h - 1}{h} = 0",
        note: "The first is the 'sinc limit' — proved geometrically by squeezing. The second is derived from it.",
        why: {
          tag: "Why does (cos h − 1)/h → 0?",
          explanation: "Multiply top and bottom by (cos h + 1): [(cos h−1)(cos h+1)] / [h(cos h+1)] = (cos²h−1) / [h(cos h+1)] = −sin²h / [h(cos h+1)] = −(sin h/h)·sin h/(cos h+1). As h→0: (sin h/h)→1, sin h→0, (cos h+1)→2. Result: −1·(0/2) = 0.",
          math: "\\frac{\\cos h - 1}{h} = -\\frac{\\sin h}{h} \\cdot \\frac{\\sin h}{\\cos h + 1} \\to -1 \\cdot \\frac{0}{2} = 0",
          why: {
            tag: "Why does sin(h)/h → 1?",
            explanation: "This is proved by the Squeeze Theorem using unit circle geometry. Three areas on the unit circle: (½ cos h sin h) ≤ (h/2) ≤ (½ tan h). Divide by ½ sin h and invert: cos h ≤ (sin h)/h ≤ 1/cos h. Both bounds → 1, so (sin h)/h → 1.",
            why: null,
          },
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substitute both limits: sin x · 0 + cos x · 1 = cos x.",
        math: "\\frac{d}{dx}[\\sin x] = \\sin x \\cdot 0 + \\cos x \\cdot 1 = \\cos x",
        note: "Geometric checks: at x=0, slope of sin is 1 (it's rising steeply) — cos(0)=1 ✓. At x=π/2, sin has a peak (horizontal tangent) — cos(π/2)=0 ✓. At x=π, sin is falling steeply — cos(π)=−1 ✓.",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[sin x] = cos x relied on:",
          steps: [
            { text: "d/dx[sin x] = cos x  ← result" },
            { text: "↳ Sine angle addition formula (geometric proof)" },
            { text: "↳ lim sin(h)/h = 1  ← Squeeze Theorem + unit circle areas" },
            { text: "↳ lim (cos h−1)/h = 0  ← derived from sinc using sin²+cos²=1" },
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
    preamble: "The proof is exactly parallel to d/dx[sin x] = cos x — same structure, same two key limits, but using the cosine angle addition formula.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = cos x.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{\\cos(x+h) - \\cos x}{h}",
        note: null,
        why: {
          tag: "Same approach as d/dx[sin x]?",
          explanation: "Yes — the exact same technique. We can't evaluate cos(x+h) directly; we need the angle addition formula for cosine. Then we'll group terms to isolate the same two key limits: sin(h)/h and (cos h−1)/h.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Expand cos(x+h) using the cosine addition formula: cos(A+B) = cos A cos B − sin A sin B.",
        math: "\\cos(x+h) = \\cos x\\cos h - \\sin x\\sin h",
        note: "Note the minus sign — cosine addition has a minus where sine addition has a plus.",
        why: {
          tag: "Where does cos(A+B) = cos A cos B − sin A sin B come from?",
          explanation: "Same geometric/rotation derivation as sin(A+B). Rotating (cos A, sin A) by angle B gives x-coordinate: cos A · cos B − sin A · sin B = cos(A+B). The minus sign comes from how the x-coordinate transforms under rotation.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute and separate into the two familiar limit forms.",
        math: "\\lim_{h\\to 0}\\frac{\\cos x\\cos h - \\sin x\\sin h - \\cos x}{h} = \\lim_{h\\to 0}\\left[\\cos x\\cdot\\frac{\\cos h-1}{h} - \\sin x\\cdot\\frac{\\sin h}{h}\\right]",
        note: "Factor cos x from the first and third terms (with a minus for the difference), and −sin x from the second term.",
        why: {
          tag: "Show the grouping step",
          explanation: "cos x·cos h − cos x = cos x·(cos h − 1). The −sin x·sin h term stays. Divide both by h to get the two limit forms.",
          why: null,
        },
      },
      {
        id: 4, tag: "Limit", tagStyle: S.limit,
        instruction: "Apply the same two limits: (cos h−1)/h → 0 and sin h/h → 1.",
        math: "= \\cos x \\cdot 0 - \\sin x \\cdot 1 = -\\sin x",
        note: "The structure is identical to the sin x proof, except the minus sign from the cosine addition formula propagates through.",
        why: {
          tag: "Why is there a minus sign in the result?",
          explanation: "The cosine addition formula has a minus: cos(x+h) = cos x cos h − sin x sin h. When we group, the sin x term picks up a minus. The sin x proof had a plus. This is why d/dx[sin x] = +cos x but d/dx[cos x] = −sin x — the sign comes from the addition formula.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[cos x] = −sin x.",
        math: "\\frac{d}{dx}[\\cos x] = -\\sin x",
        note: "Checks: at x=0, cos has a peak (zero slope) — −sin(0)=0 ✓. At x=π/2, cos is falling — −sin(π/2)=−1 ✓. The derivative of cosine is negative sine.",
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
    preamble: "We write tan x = sin x / cos x and apply the Quotient Rule. The simplification uses the Pythagorean identity sin²x + cos²x = 1.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write tan x as a fraction: tan x = sin x / cos x.",
        math: "\\tan x = \\frac{\\sin x}{\\cos x}",
        note: "This is the definition of tangent in terms of sine and cosine. Since we know derivatives of both sin and cos, we can apply the Quotient Rule.",
        why: {
          tag: "Why is tan x = sin x / cos x?",
          explanation: "On the unit circle, sin θ = y-coordinate and cos θ = x-coordinate. Tangent is defined as the ratio: tan θ = (opposite)/(adjacent) = y/x = sin θ / cos θ. This definition makes tangent undefined when cos θ = 0 (at θ = π/2, 3π/2, etc.) — which is why tan x has vertical asymptotes there.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Quotient Rule: (f/g)′ = (f′g − fg′)/g².",
        math: "\\frac{d}{dx}[\\tan x] = \\frac{\\frac{d}{dx}[\\sin x]\\cdot\\cos x \\;-\\; \\sin x\\cdot\\frac{d}{dx}[\\cos x]}{\\cos^2 x}",
        note: "Here f = sin x (numerator) and g = cos x (denominator). We need f′ = cos x and g′ = −sin x.",
        why: {
          tag: "What does the Quotient Rule say?",
          explanation: "For h(x) = f(x)/g(x): h′(x) = [f′(x)·g(x) − f(x)·g′(x)] / [g(x)]². Memory: 'low d-high minus high d-low over low squared.' Here: low = cos x, high = sin x, d-high = cos x, d-low = −sin x.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute f′ = cos x and g′ = −sin x. Simplify the numerator.",
        math: "= \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x}",
        note: "The minus times minus gives a plus: −sin x · (−sin x) = +sin²x.",
        why: {
          tag: "Why does a minus times a minus give a plus?",
          explanation: "g′ = d/dx[cos x] = −sin x (the derivative of cos is negative sin). We're computing −sin x · g′ = −sin x · (−sin x). Multiplying two negatives gives a positive: (−a)(−b) = ab. So we get +sin²x.",
          why: null,
        },
      },
      {
        id: 4, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Pythagorean identity: sin²x + cos²x = 1.",
        math: "\\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x}",
        note: "The numerator is exactly the Pythagorean identity = 1.",
        why: {
          tag: "Where does sin²x + cos²x = 1 come from?",
          explanation: "On the unit circle, any point (x,y) satisfies x²+y² = 1 (Pythagorean theorem — the radius is 1). Since cos θ is the x-coordinate and sin θ is the y-coordinate: cos²θ + sin²θ = 1². This is always true regardless of θ.",
          why: {
            tag: "And why is sec²x = 1/cos²x?",
            explanation: "sec x is defined as 1/cos x (the reciprocal of cosine). So sec²x = (1/cos x)² = 1/cos²x. The secant function is just the reciprocal of cosine — nothing more mysterious than that.",
            why: null,
          },
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "1/cos²x = sec²x. The derivative of tan x is sec²x.",
        math: "\\frac{d}{dx}[\\tan x] = \\sec^2 x",
        note: "Key insight: sec²x = 1 + tan²x ≥ 1 always. So tan x always has a positive derivative — it's always increasing wherever it's defined. At x=0: sec²(0) = 1, so the slope of tan at the origin equals 1.",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[tan x] = sec²x relied on:",
          steps: [
            { text: "d/dx[tan x] = sec²x  ← result" },
            { text: "↳ tan x = sin x / cos x  ← definition of tangent" },
            { text: "↳ Quotient Rule: (f/g)′ = (f′g − fg′)/g²" },
            { text: "↳ d/dx[sin x] = cos x  ← proved from definition" },
            { text: "↳ d/dx[cos x] = −sin x  ← proved from definition" },
            { text: "↳ sin²x + cos²x = 1  ← Pythagorean identity" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx sec x ──────────────────────────────────────────────────────────────
  'd-sec': {
    title: "Derivative of sec x",
    subtitle: "Prove that d/dx[sec x] = sec x tan x",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\sec x] = \\sec x \\tan x",
    preamble: "sec x = 1/cos x. We write this as (cos x)⁻¹ — a composition of two functions — and apply the Chain Rule.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Rewrite sec x as (cos x)⁻¹. This reveals the composite structure: an outer function u⁻¹ applied to an inner function cos x.",
        math: "\\sec x = \\frac{1}{\\cos x} = (\\cos x)^{-1}",
        note: "We haven't done anything yet — just rewritten sec x. But now the shape 'outer function applied to inner function' is visible, which means Chain Rule applies.",
        why: {
          tag: "What is sec x, and why write it as (cos x)⁻¹?",
          explanation: "sec x (read: 'secant of x') is defined as the reciprocal of cosine: sec x = 1/cos x. Writing it as (cos x)⁻¹ uses exponent notation (−1 means reciprocal). This form is clearer for applying the Chain Rule because it explicitly shows: outer function = u⁻¹, inner function = cos x.",
          why: {
            tag: "What is a composite function again?",
            explanation: "A composite function applies one function to the result of another. Here: first compute cos x (inner), then take the reciprocal of that (outer). Written as f(g(x)) where g(x) = cos x and f(u) = u⁻¹. The Chain Rule is designed exactly for this situation.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Chain Rule: d/dx[f(g(x))] = f′(g(x)) · g′(x). Here f(u) = u⁻¹ and g(x) = cos x.",
        math: "\\frac{d}{dx}[(\\cos x)^{-1}] = \\underbrace{(-1)(\\cos x)^{-2}}_{f'(g(x))} \\cdot \\underbrace{(-\\sin x)}_{g'(x)}",
        note: "Step 1 (outer derivative): d/du[u⁻¹] = −u⁻², evaluated at u = cos x → gives −(cos x)⁻² = −1/cos²x. Step 2 (inner derivative): d/dx[cos x] = −sin x. Multiply them.",
        why: {
          tag: "Breaking down the Chain Rule application",
          explanation: "Chain Rule says: differentiate the outer function (treating the inner as a single variable u), then multiply by the derivative of the inner function. Here: outer f(u) = u⁻¹, so f′(u) = −u⁻². Inner g(x) = cos x, so g′(x) = −sin x. Chain Rule: f′(g(x))·g′(x) = −(cos x)⁻² · (−sin x).",
          steps: [
            { text: "Outer derivative: d/du[u⁻¹] = −1·u⁻¹⁻¹ = −u⁻². (Power Rule with n=−1.)" },
            { text: "Evaluated at inner: −(cos x)⁻² = −1/cos²x." },
            { text: "Inner derivative: d/dx[cos x] = −sin x." },
            { text: "Multiply: (−1/cos²x) · (−sin x) = sin x / cos²x." },
          ],
          why: {
            tag: "Why is d/du[u⁻¹] = −u⁻²?",
            explanation: "Power Rule: d/du[uⁿ] = nuⁿ⁻¹. With n = −1: d/du[u⁻¹] = (−1)·u⁻¹⁻¹ = −u⁻²= −1/u². You can verify from the limit definition: [(1/(u+h) − 1/u)]/h = [u−(u+h)]/[u(u+h)h] = −1/[u(u+h)] → −1/u².",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Simplify: the two negatives cancel. Then split cos²x = cos x · cos x to recognize sec x and tan x.",
        math: "(-1)(\\cos x)^{-2}\\cdot(-\\sin x) = \\frac{\\sin x}{\\cos^2 x} = \\frac{1}{\\cos x}\\cdot\\frac{\\sin x}{\\cos x} = \\sec x\\cdot\\tan x",
        note: "Split cos²x into two factors: (cos²x) = (cos x)(cos x). Then 1/cos x = sec x and sin x/cos x = tan x.",
        why: {
          tag: "How exactly does sin x / cos²x become sec x · tan x?",
          explanation: "sin x / cos²x = sin x / (cos x · cos x). Separate into two fractions: (1/cos x) · (sin x/cos x). Now use definitions: 1/cos x = sec x and sin x / cos x = tan x. So sin x / cos²x = sec x · tan x.",
          steps: [
            { text: "sin x / cos²x" },
            { text: "= sin x / (cos x · cos x)" },
            { text: "= (1/cos x) · (sin x/cos x)" },
            { text: "= sec x · tan x ✓" },
          ],
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[sec x] = sec x tan x.",
        math: "\\frac{d}{dx}[\\sec x] = \\sec x\\tan x",
        note: "Note: sec x · tan x can be positive or negative depending on x. When both sec and tan have the same sign, the derivative is positive (sec x is increasing). When they have opposite signs, sec x is decreasing.",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[sec x] = sec x tan x relied on:",
          steps: [
            { text: "d/dx[sec x] = sec x tan x  ← result" },
            { text: "↳ sec x = (cos x)⁻¹  ← definition of secant" },
            { text: "↳ Chain Rule: d/dx[f(g(x))] = f′(g(x))·g′(x)" },
            { text: "↳ Power Rule: d/du[u⁻¹] = −u⁻²" },
            { text: "↳ d/dx[cos x] = −sin x  ← proved from limit definition" },
            { text: "↳ Definitions: sec x = 1/cos x, tan x = sin x/cos x" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx eˣ ─────────────────────────────────────────────────────────────────
  'd-ex': {
    title: "Derivative of eˣ",
    subtitle: "Prove that d/dx[eˣ] = eˣ",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[e^x] = e^x",
    preamble: "eˣ is the only function (up to scalar multiples) that is its own derivative. This remarkable property is what makes e the natural base for exponentials throughout calculus.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write the limit definition for f(x) = eˣ.",
        math: "f'(x) = \\lim_{h\\to 0}\\frac{e^{x+h} - e^x}{h}",
        note: null,
        why: {
          tag: "What makes eˣ special before we start?",
          explanation: "Most functions change at a rate different from their current value — for example, x² changes at rate 2x, which is different from x². But eˣ changes at rate equal to its own value. This is the definition of e: the base for which this self-referential property holds.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Use the exponent law e^(x+h) = eˣ · eʰ to factor eˣ out of the numerator.",
        math: "= \\lim_{h\\to 0}\\frac{e^x \\cdot e^h - e^x}{h} = \\lim_{h\\to 0} e^x \\cdot \\frac{e^h - 1}{h} = e^x \\cdot \\lim_{h\\to 0}\\frac{e^h - 1}{h}",
        note: "eˣ doesn't depend on h, so it factors out of the limit like a constant.",
        why: {
          tag: "Why does e^(x+h) = eˣ · eʰ?",
          explanation: "Exponent product rule: aᵐ⁺ⁿ = aᵐ · aⁿ. This is a fundamental property of exponential functions: adding exponents corresponds to multiplying the function values. Example: e²⁺³ = e⁵ = e² · e³ = 7.389 · 20.086 ≈ 148.41 ✓.",
          why: null,
        },
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "The remaining limit (eʰ − 1)/h → 1 as h→0. This is one of the defining properties of e.",
        math: "\\lim_{h\\to 0}\\frac{e^h - 1}{h} = 1",
        note: "Numerically: (e^0.1 − 1)/0.1 ≈ (1.1052 − 1)/0.1 = 1.052. At h=0.01: (e^0.01 − 1)/0.01 ≈ 1.005. Converging to 1 ✓.",
        why: {
          tag: "Why does (eʰ − 1)/h → 1?",
          explanation: "Using the Taylor series: eʰ = 1 + h + h²/2! + h³/3! + ⋯. So eʰ − 1 = h + h²/2 + ⋯. Dividing by h: (eʰ−1)/h = 1 + h/2 + h²/6 + ⋯. As h→0, every term with h vanishes, leaving 1.",
          math: "e^h = 1 + h + \\frac{h^2}{2!} + \\cdots \\Rightarrow \\frac{e^h-1}{h} = 1 + \\frac{h}{2!} + \\cdots \\to 1",
          why: {
            tag: "Where does the Taylor series eˣ = 1 + x + x²/2! + … come from?",
            explanation: "A Taylor series represents a function as an infinite polynomial. For eˣ at x=0: since (eˣ)′ = eˣ and e⁰ = 1, every derivative of eˣ at 0 equals 1. The Taylor formula gives: eˣ = Σ xⁿ/n! = 1 + x + x²/2! + x³/3! + ⋯. This series converges for all real x.",
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "eˣ · 1 = eˣ. The function equals its own derivative everywhere.",
        math: "\\frac{d}{dx}[e^x] = e^x",
        note: "This property makes eˣ the natural choice for modeling exponential growth and decay, differential equations, and compound interest. Any solution to y′ = ky has the form y = Ce^(kx).",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[eˣ] = eˣ relied on:",
          steps: [
            { text: "d/dx[eˣ] = eˣ  ← result" },
            { text: "↳ Exponent law: e^(x+h) = eˣ · eʰ" },
            { text: "↳ lim (eʰ−1)/h = 1  ← definition/property of e, verifiable via Taylor series" },
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
    preamble: "We convert any exponential aˣ into base e using the identity a = e^(ln a), then apply the Chain Rule and the known derivative of eˣ.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Rewrite aˣ using base e: since a = e^(ln a), we have aˣ = e^(x ln a).",
        math: "a^x = (e^{\\ln a})^x = e^{x \\ln a}",
        note: "ln a is a constant (a is a fixed base, like 2 or 10). So x ln a is just a constant times x.",
        why: {
          tag: "Why is a = e^(ln a)?",
          explanation: "The natural log ln is the inverse function of eˣ. By definition: e^(ln a) = a. It's the same as saying 10^(log₁₀ 5) = 5 — the base raised to the log gives back the original number.",
          why: {
            tag: "Why convert to base e at all?",
            explanation: "We know d/dx[eˣ] = eˣ, but we don't yet have a formula for d/dx[aˣ] for arbitrary a. By converting to base e, we can use the known derivative of eˣ plus the Chain Rule. This is a standard technique: convert to base e, differentiate, convert back.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Chain Rule to d/dx[e^(x ln a)]. Outer: eᵘ. Inner: u = x ln a.",
        math: "\\frac{d}{dx}[e^{x\\ln a}] = e^{x\\ln a} \\cdot \\frac{d}{dx}[x\\ln a] = e^{x\\ln a} \\cdot \\ln a",
        note: "d/dx[x ln a] = ln a because ln a is a constant. d/du[eᵘ] = eᵘ.",
        why: {
          tag: "Why is d/dx[x ln a] = ln a?",
          explanation: "ln a is a fixed number (a constant). The derivative of a constant times x is just that constant: d/dx[cx] = c. Example: d/dx[5x] = 5. Here c = ln a, so d/dx[x ln a] = ln a.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Substitute back: e^(x ln a) = aˣ (reversing the rewrite from Step 1).",
        math: "e^{x\\ln a} \\cdot \\ln a = a^x \\cdot \\ln a",
        note: null,
        why: {
          tag: "Why does e^(x ln a) = aˣ?",
          explanation: "Using exponent rules: e^(x ln a) = (e^(ln a))ˣ = aˣ. We used e^(ln a) = a, then applied the power rule (bᵐ)ⁿ = bᵐⁿ.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[aˣ] = aˣ ln a.",
        math: "\\frac{d}{dx}[a^x] = a^x \\ln a",
        note: "Special cases: a=e gives ln e = 1, so d/dx[eˣ] = eˣ·1 = eˣ ✓. For a=2: d/dx[2ˣ] = 2ˣ ln 2 ≈ 2ˣ · 0.693. For a=10: d/dx[10ˣ] = 10ˣ ln 10 ≈ 10ˣ · 2.303.",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[aˣ] = aˣ ln a relied on:",
          steps: [
            { text: "d/dx[aˣ] = aˣ ln a  ← result" },
            { text: "↳ Rewrite aˣ = e^(x ln a)" },
            { text: "↳ Chain Rule: d/dx[eᵘ] = eᵘ·u′" },
            { text: "↳ d/dx[eˣ] = eˣ  ← proved above" },
            { text: "↳ ln is the inverse of eˣ: e^(ln a) = a" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx ln x ───────────────────────────────────────────────────────────────
  'd-ln': {
    title: "Derivative of ln x",
    subtitle: "Prove that d/dx[ln x] = 1/x",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\ln x] = \\frac{1}{x}",
    preamble: "We use implicit differentiation: instead of differentiating ln x directly, we use the fact that y = ln x is the same as eʸ = x, differentiate that, and solve for dy/dx.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let y = ln x. Rewrite using the definition of natural log: y = ln x means eʸ = x.",
        math: "y = \\ln x \\iff e^y = x",
        note: "We're converting to a form where the differentiation is easier — we know how to differentiate eʸ.",
        why: {
          tag: "What does ln mean?",
          explanation: "The natural logarithm ln x is the inverse function of eˣ. So y = ln x means 'eʸ = x'. In other words: y is the exponent you raise e to in order to get x. Examples: ln(e) = 1 because e¹ = e. ln(e²) = 2 because e² = e². ln(1) = 0 because e⁰ = 1.",
          why: {
            tag: "Why use implicit differentiation?",
            explanation: "We could try differentiating ln x directly from the limit definition, which works but requires a tricky limit involving ln. Instead, the implicit approach uses something we already know — d/dx[eˣ] = eˣ — to find d/dx[ln x] without any new limit computations.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of eʸ = x with respect to x.",
        math: "\\frac{d}{dx}[e^y] = \\frac{d}{dx}[x] \\quad\\Longrightarrow\\quad e^y \\cdot \\frac{dy}{dx} = 1",
        note: "Left side uses Chain Rule: y is a function of x, so d/dx[eʸ] = eʸ · dy/dx. Right side: d/dx[x] = 1.",
        why: {
          tag: "Why does d/dx[eʸ] = eʸ · dy/dx?",
          explanation: "y is a function of x (since y = ln x). So eʸ = e^(y(x)) is a composite function — outer: eᵘ, inner: u = y(x). Chain Rule: d/dx[e^(y(x))] = e^(y(x)) · dy/dx = eʸ · dy/dx. If y were just x, this would give eˣ · 1 = eˣ. But y is a function of x, so the extra dy/dx factor appears.",
          why: {
            tag: "Why differentiate both sides of an equation?",
            explanation: "If A = B (two equal expressions), then d/dx[A] = d/dx[B] — differentiating preserves equality. This is the same principle as 'if 2x = 10, divide both sides by 2 to get x = 5.' Here we differentiate both sides to introduce dy/dx (the thing we want to find), then solve for it.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Solve for dy/dx. Since eʸ = x (from Step 1), substitute to eliminate y.",
        math: "\\frac{dy}{dx} = \\frac{1}{e^y} = \\frac{1}{x}",
        note: "We substituted eʸ = x — using the original relationship between x and y to express the answer purely in terms of x.",
        why: {
          tag: "Why does this answer make sense?",
          explanation: "At x=1: d/dx[ln x] = 1/1 = 1. The function ln x is rising at rate 1 when x=1. At x=2: rate = 1/2. At x=10: rate = 1/10. As x grows large, ln x grows more and more slowly — consistent with its graph being a very flat curve for large x.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[ln x] = 1/x, valid for x > 0.",
        math: "\\frac{d}{dx}[\\ln x] = \\frac{1}{x}",
        note: "This is why the antiderivative of 1/x is ln|x|: ∫(1/x)dx = ln|x| + C. The absolute value extends the formula to x < 0.",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[ln x] = 1/x relied on:",
          steps: [
            { text: "d/dx[ln x] = 1/x  ← result" },
            { text: "↳ Implicit differentiation of eʸ = x" },
            { text: "↳ Chain Rule: d/dx[eʸ] = eʸ·dy/dx" },
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
    preamble: "Same implicit differentiation strategy as ln x. We rewrite y = arcsin x as sin y = x, differentiate both sides, and use the Pythagorean identity to eliminate y.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let y = arcsin x. Rewrite: y = arcsin x means sin y = x.",
        math: "y = \\arcsin x \\iff \\sin y = x, \\quad y \\in [-\\tfrac{\\pi}{2},\\, \\tfrac{\\pi}{2}]",
        note: "The domain restriction y ∈ [−π/2, π/2] is the standard range of arcsin. In this range, cos y ≥ 0 — important for the sign later.",
        why: {
          tag: "What is arcsin?",
          explanation: "arcsin is the inverse function of sin. sin(y) = x means 'what angle y has a sine of x?' arcsin(x) gives that angle. Example: arcsin(0.5) = π/6 = 30° because sin(30°) = 0.5. Because sin is periodic (many angles have the same sine), arcsin is restricted to y ∈ [−π/2, π/2] to be a proper function.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of sin y = x with respect to x.",
        math: "\\frac{d}{dx}[\\sin y] = \\frac{d}{dx}[x] \\quad\\Longrightarrow\\quad \\cos y \\cdot \\frac{dy}{dx} = 1",
        note: "Left side: Chain Rule on sin y (since y is a function of x). Right side: d/dx[x] = 1.",
        why: {
          tag: "Why does d/dx[sin y] = cos y · dy/dx?",
          explanation: "y is a function of x (y = arcsin x). So sin y = sin(y(x)) is a composite function. Chain Rule: d/dx[sin(y(x))] = cos(y(x)) · y′(x) = cos y · dy/dx. The cos y is the outer derivative, and dy/dx is the inner derivative.",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Solve for dy/dx: divide both sides by cos y.",
        math: "\\frac{dy}{dx} = \\frac{1}{\\cos y}",
        note: "Now we need to express cos y in terms of x (not y), so the answer is only in terms of x.",
        why: {
          tag: "Why do we need to eliminate y?",
          explanation: "The derivative dy/dx = 1/cos y is still expressed in terms of y, but y is an implicit variable. The final answer should be in terms of x only (since x is the input variable). We use the Pythagorean identity and the original relationship sin y = x to convert cos y into an expression involving x.",
          why: null,
        },
      },
      {
        id: 4, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Use the Pythagorean identity sin²y + cos²y = 1 and sin y = x to find cos y.",
        math: "\\cos^2 y = 1 - \\sin^2 y = 1 - x^2 \\quad\\Longrightarrow\\quad \\cos y = \\sqrt{1-x^2}",
        note: "We take the positive root because y ∈ [−π/2, π/2] where cos y ≥ 0.",
        why: {
          tag: "Why the positive square root?",
          explanation: "√(cos²y) = |cos y|. Since y ∈ [−π/2, π/2], cosine is non-negative in this range (cos(−π/2)=0, cos(0)=1, cos(π/2)=0 — all ≥ 0). So |cos y| = cos y and we take the positive root.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Substitute cos y = √(1−x²).",
        math: "\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\cos y} = \\frac{1}{\\sqrt{1-x^2}}",
        note: "Domain: −1 < x < 1. At x = ±1 the denominator is 0 (vertical tangent). At x=0: slope = 1/√1 = 1 — arcsin and sin have the same slope at the origin, as inverse functions must.",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[arcsin x] relied on:",
          steps: [
            { text: "d/dx[arcsin x] = 1/√(1−x²)  ← result" },
            { text: "↳ Implicit differentiation: sin y = x → cos y · dy/dx = 1" },
            { text: "↳ Chain Rule: d/dx[sin y] = cos y · dy/dx" },
            { text: "↳ d/dx[sin x] = cos x  ← proved above" },
            { text: "↳ Pythagorean identity: cos²y = 1 − sin²y = 1 − x²" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── d/dx arctan x ───────────────────────────────────────────────────────────
  'd-arctan': {
    title: "Derivative of arctan x",
    subtitle: "Prove that d/dx[arctan x] = 1/(1+x²)",
    category: "Derivatives",
    problem: "\\frac{d}{dx}[\\arctan x] = \\frac{1}{1+x^2}",
    preamble: "Same approach: y = arctan x means tan y = x. Differentiate both sides implicitly, then eliminate y using a trig identity.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let y = arctan x. Rewrite: y = arctan x means tan y = x.",
        math: "y = \\arctan x \\iff \\tan y = x, \\quad y \\in (-\\tfrac{\\pi}{2},\\, \\tfrac{\\pi}{2})",
        note: null,
        why: {
          tag: "What is arctan?",
          explanation: "arctan is the inverse of tan. arctan(x) answers: 'what angle has a tangent value of x?' Since tan is periodic, we restrict arctan to output y ∈ (−π/2, π/2). Examples: arctan(1) = π/4 because tan(45°) = 1. arctan(0) = 0. arctan can take any real input (unlike arcsin which requires −1 ≤ x ≤ 1).",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of tan y = x with respect to x.",
        math: "\\sec^2 y \\cdot \\frac{dy}{dx} = 1 \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = \\frac{1}{\\sec^2 y} = \\cos^2 y",
        note: "d/dx[tan y] = sec²y · dy/dx by Chain Rule. d/dx[x] = 1.",
        why: {
          tag: "Why does d/dx[tan y] = sec²y · dy/dx?",
          explanation: "tan y = tan(y(x)) is a composite function. Chain Rule: d/dx[tan(y(x))] = (d/dy[tan y]) · dy/dx = sec²y · dy/dx. We're applying the Chain Rule with outer function tan and inner function y(x).",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Use the identity sec²y = 1 + tan²y and substitute tan y = x.",
        math: "\\sec^2 y = 1 + \\tan^2 y = 1 + x^2 \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = \\frac{1}{1+x^2}",
        note: "No square root needed — sec²y = 1+x² is always positive, so no sign ambiguity.",
        why: {
          tag: "Where does sec²y = 1 + tan²y come from?",
          explanation: "Start from sin²y + cos²y = 1. Divide every term by cos²y: (sin²y/cos²y) + 1 = (1/cos²y), which gives tan²y + 1 = sec²y. Rearranging: sec²y = 1 + tan²y.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "d/dx[arctan x] = 1/(1+x²), valid for all real x.",
        math: "\\frac{d}{dx}[\\arctan x] = \\frac{1}{1+x^2}",
        note: "The denominator 1+x² is always ≥ 1, never zero. So arctan is defined and differentiable for all x ∈ ℝ. This is also the key antiderivative: ∫dx/(1+x²) = arctan x + C.",
        why: {
          tag: "Dependency chain",
          explanation: "d/dx[arctan x] relied on:",
          steps: [
            { text: "d/dx[arctan x] = 1/(1+x²)  ← result" },
            { text: "↳ Implicit differentiation: tan y = x" },
            { text: "↳ Chain Rule: d/dx[tan y] = sec²y · dy/dx" },
            { text: "↳ d/dx[tan x] = sec²x  ← Quotient Rule on sin/cos" },
            { text: "↳ Identity: sec²y = 1 + tan²y  ← derived from sin²+cos²=1" },
          ],
          why: null,
        },
      },
    ],
  },

  // ─── Implicit Differentiation ─────────────────────────────────────────────
  'implicit': {
    title: "Implicit Differentiation: x² + y² = r²",
    subtitle: "Prove that dy/dx = −x/y along the circle",
    category: "Derivatives",
    problem: "x^2 + y^2 = r^2 \\;\\Longrightarrow\\; \\frac{dy}{dx} = -\\frac{x}{y}",
    preamble: "The circle x²+y²=r² doesn't define y as a single function of x — it defines two functions (top half and bottom half). Implicit differentiation finds dy/dx without ever solving for y.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Recognize that this equation implicitly defines y as a function of x. Write y as y(x) to make that explicit.",
        math: "x^2 + [y(x)]^2 = r^2",
        note: "Even though we can't isolate y cleanly (it gives y = ±√(r²−x²), two values), y still depends on x. On the top half of the circle, y = +√(r²−x²); on the bottom half, y = −√(r²−x²). Implicit differentiation works for both simultaneously.",
        why: {
          tag: "What is an implicit function?",
          explanation: "An explicit function gives y directly: y = f(x). An implicit equation gives a relationship F(x,y) = 0 that y must satisfy. x²+y²=r² is implicit — we can't write a clean formula for y because y appears inside a square root with a ± sign. But y still changes with x, and we can find dy/dx without solving for y.",
          why: {
            tag: "Why can't we just solve for y first?",
            explanation: "We can — but it gives two branches: y = +√(r²−x²) and y = −√(r²−x²). Differentiating each separately works, but requires knowing which branch you're on. Implicit differentiation handles both in one calculation. It also works for curves where solving for y is genuinely impossible, like x⁵ + y⁵ = 5xy.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Differentiate both sides of x² + y² = r² with respect to x.",
        math: "\\frac{d}{dx}[x^2] + \\frac{d}{dx}[y^2] = \\frac{d}{dx}[r^2]",
        note: "We differentiate every term. r is a constant (the radius), so d/dx[r²] = 0.",
        why: {
          tag: "Why can we differentiate both sides of an equation?",
          explanation: "If A = B then d/dx[A] = d/dx[B] — applying the same operation to both sides of an equality preserves it. This is the same principle as: if 2x = 10, subtract 5 from both sides to get 2x−5 = 5. Differentiation is an operation, and we apply it to both sides.",
          why: null,
        },
      },
      {
        id: 3, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the Chain Rule to d/dx[y²]. Since y is a function of x, this is a composite function.",
        math: "2x + 2y\\frac{dy}{dx} = 0",
        note: "d/dx[x²] = 2x (Power Rule, x is the variable). d/dx[y²] = 2y·dy/dx (Chain Rule — y is a function of x). d/dx[r²] = 0.",
        why: {
          tag: "Why does d/dx[y²] = 2y·dy/dx and not just 2y?",
          explanation: "Compare: d/dx[x²] = 2x because the variable IS x. But d/dx[y²] where y = y(x): y² is (y(x))², a composite function. Outer: u². Inner: u = y(x). Chain Rule: d/dx[u²] = 2u · du/dx = 2y · dy/dx. The dy/dx appears because y is changing with x — it's not a constant.",
          steps: [
            { text: "If y were constant (e.g. y=5), d/dx[y²] = d/dx[25] = 0. No dy/dx." },
            { text: "If y = x², then y² = x⁴. d/dx[x⁴] = 4x³. Also: 2y·dy/dx = 2(x²)·2x = 4x³ ✓." },
            { text: "The dy/dx factor is obligatory whenever you differentiate any expression containing y with respect to x." },
          ],
          why: null,
        },
      },
      {
        id: 4, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Solve for dy/dx. Treat dy/dx as an unknown variable and isolate it.",
        math: "2y\\frac{dy}{dx} = -2x \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = -\\frac{x}{y}",
        note: "Treat dy/dx exactly like any unknown: subtract 2x from both sides, then divide by 2y.",
        why: {
          tag: "How do we 'solve for dy/dx'? It's a derivative, not a number.",
          explanation: "In this equation, dy/dx appears as a coefficient being multiplied by 2y. We treat it exactly like any unknown variable — call it m if that helps. 2x + 2y·m = 0 → 2y·m = −2x → m = −x/y. The algebra is identical. dy/dx is just the slope we're solving for.",
          why: null,
        },
      },
      {
        id: 5, tag: "Geometry", tagStyle: S.geo,
        instruction: "Geometric check: the tangent slope −x/y should be perpendicular to the radius (slope y/x).",
        math: "\\frac{y}{x} \\cdot \\left(-\\frac{x}{y}\\right) = -1 \\;\\checkmark",
        note: "Two lines are perpendicular when their slopes multiply to −1. The radius from origin to (x,y) has slope y/x. Their product is −1, confirming our algebra is correct.",
        why: {
          tag: "Why must the tangent be perpendicular to the radius?",
          explanation: "This is a classical geometry theorem: a tangent to a circle is perpendicular to the radius drawn to the point of tangency. It can be proved by contradiction: if the tangent weren't perpendicular, it would intersect the circle at two points (not just touch it), contradicting the definition of tangent.",
          why: null,
        },
      },
      {
        id: 6, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "dy/dx = −x/y everywhere on the circle except at y = 0 (where the slope is infinite — vertical tangent).",
        math: "\\frac{dy}{dx} = -\\frac{x}{y}",
        note: "General implicit differentiation recipe: (1) differentiate both sides, (2) tag every y-term with dy/dx via Chain Rule, (3) collect all dy/dx terms, (4) factor out and divide.",
        why: null,
      },
    ],
  },
}
