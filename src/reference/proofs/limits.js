// Proof data for all limits reference entries.

const S = {
  setup:    { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  key:      { bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  algebra:  { bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  geo:      { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  limit:    { bg: "#fdf4ff", text: "#6b21a8",  border: "#e9d5ff" },
  conclude: { bg: "#f0fdf4", text: "#14532d",  border: "#86efac" },
  verify:   { bg: "#f0fdfa", text: "#134e4a",  border: "#99f6e4" },
}

export const LIMIT_PROOFS = {

  'limit-def': {
    title: "Definition of a Limit",
    subtitle: "What does lim_{x→a} f(x) = L actually mean?",
    category: "Limits",
    problem: "\\lim_{x \\to a} f(x) = L \\iff \\forall\\varepsilon>0\\;\\exists\\delta>0: 0<|x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon",
    preamble: "The limit captures the idea of f(x) getting arbitrarily close to L as x approaches a — without necessarily equaling L at a. The ε-δ definition makes 'arbitrarily close' precise and provable.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start with the intuition: lim f(x) = L means f(x) gets as close to L as we want, by keeping x close enough to a.",
        math: "\\text{Informal: as } x \\to a,\\; f(x) \\to L",
        note: "The crucial point: we say nothing about f(a) itself. The limit is about what f approaches, not what it equals.",
        why: {
          tag: "Why doesn't f(a) matter — isn't a the point we care about?",
          explanation: "The limit describes the journey, not the destination. f(a) could be undefined, or defined but equal to something completely different from L — and the limit still works fine. Example: f(x) = (x²−1)/(x−1) is undefined at x=1 (division by zero), but for every other x near 1, f(x) = x+1, which approaches 2. So lim_{x→1} f(x) = 2 even though f(1) doesn't exist.",
          why: {
            tag: "So the function can have a hole at x=a and still have a limit?",
            explanation: "Exactly. A limit only asks: 'as x gets close to a (but never equals a), does f(x) settle toward some value L?' The value AT x=a is irrelevant. This is why limits are so useful for calculus — derivatives are defined as limits precisely because we need to examine behavior near a point without being confused by what happens exactly at that point.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Make 'arbitrarily close' precise: ε (epsilon) is the target closeness for f(x) to L; δ (delta) is how close x must be to a.",
        math: "\\forall\\varepsilon>0,\\; \\exists\\delta>0:\\; 0 < |x-a| < \\delta \\implies |f(x) - L| < \\varepsilon",
        note: "Read: 'For any ε > 0, there exists a δ > 0 such that whenever x is within δ of a (but not equal to a), f(x) is within ε of L.'",
        why: {
          tag: "What do ε and δ actually represent?",
          explanation: "Think of it as a game. Your opponent picks any tiny positive number ε — this is how close they demand f(x) must be to L (the target accuracy). Your job is to find a δ (a proximity to a) small enough that every x within that distance satisfies the accuracy requirement. ε is a vertical tolerance band on the y-axis: (L−ε, L+ε). δ is a horizontal window on the x-axis: (a−δ, a+δ). The limit says: no matter how tight the ε-band, I can find a δ-window that works.",
          why: {
            tag: "Why does ∀ε come BEFORE ∃δ? Does the order matter?",
            explanation: "Yes — the order is everything. 'For every ε, there exists a δ' means δ is allowed to depend on ε. Your opponent picks ε first, then you choose δ in response. If the order were reversed ('there exists a δ for every ε'), it would mean one fixed δ works no matter how small ε is — a much stronger statement that's almost never true. The ∀ε first, ∃δ second order is what captures 'you can get as close as you want.'",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Prove from the definition: lim_{x→3} 2x = 6. We need: for every ε > 0, find δ such that |x−3| < δ implies |2x−6| < ε.",
        math: "|2x - 6| = 2|x - 3|",
        note: "We want 2|x−3| < ε, which means |x−3| < ε/2. So choose δ = ε/2.",
        why: {
          tag: "Walk me through the full proof, step by step.",
          explanation: "Given any ε > 0, we need to find δ > 0 that works. The algebra tells us to try δ = ε/2. Here's the proof:",
          steps: [
            { text: "Let ε > 0 be given (your opponent's choice)." },
            { text: "Choose δ = ε/2 (our response)." },
            { text: "Suppose 0 < |x−3| < δ = ε/2." },
            { text: "Then |2x−6| = |2(x−3)| = 2|x−3| < 2·(ε/2) = ε. ✓" },
            { text: "So whenever x is within ε/2 of 3, f(x)=2x is within ε of 6. ∎" },
          ],
          why: {
            tag: "How did you know to pick δ = ε/2? Is there a method?",
            explanation: "Work backwards from what you want. We want |2x−6| < ε. Simplify: |2x−6| = 2|x−3|. So we need 2|x−3| < ε, i.e., |x−3| < ε/2. That tells us δ = ε/2 works. In harder problems, you do the same algebra (called 'scratch work') to discover what δ should be, then write the clean proof forward.",
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "The ε-δ definition makes 'limit' a rigorous, provable concept rather than just an intuition about 'approaching.'",
        math: "\\lim_{x \\to a} f(x) = L",
        note: "In practice, we use limit laws (sum, product, quotient) derived from the ε-δ definition, so we rarely need to go back to first principles for every limit.",
        why: {
          tag: "Why do we need this formalism — can't we just say 'x gets close to a'?",
          explanation: "'Close' is subjective without a definition. In the 1600s–1700s, Newton and Leibniz used infinitesimals ('infinitely small' quantities) that worked in practice but weren't logically rigorous. Cauchy and Weierstrass in the 1800s replaced this with ε-δ, which uses only real numbers — no mysterious 'infinitely small' quantities needed. The payoff: every limit theorem can now be proved rigorously, and we can be certain derivatives are well-defined.",
          why: {
            tag: "Full dependency chain",
            explanation: "The ε-δ limit definition relies on:",
            steps: [
              { text: "ε-δ definition  ← the foundational concept, no simpler proof" },
              { text: "↳ Real number arithmetic (addition, subtraction, absolute value)" },
              { text: "↳ Completeness of the real numbers (no gaps between rationals)" },
            ],
            why: null,
          },
        },
      },
    ],
  },

  'limit-sum': {
    title: "Sum Law for Limits",
    subtitle: "Prove that lim[f + g] = lim f + lim g",
    category: "Limits",
    problem: "\\lim_{x\\to a}[f(x) + g(x)] = \\lim_{x\\to a}f(x) + \\lim_{x\\to a}g(x)",
    preamble: "If both individual limits exist, their sum also has a limit, and you can split the limit over addition. We prove this directly from the ε-δ definition using the triangle inequality.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Assume lim f(x) = L and lim g(x) = M as x→a. We want to prove lim[f+g] = L+M.",
        math: "|(f(x)+g(x)) - (L+M)| = |(f(x)-L) + (g(x)-M)|",
        note: "We need this to be less than ε. We'll bound each piece using the known limits of f and g.",
        why: {
          tag: "Why rewrite (f+g)−(L+M) this way?",
          explanation: "We want to measure how far f(x)+g(x) is from the target L+M. By rearranging: (f(x)+g(x))−(L+M) = (f(x)−L)+(g(x)−M). This splits the total error into two pieces: the error of f (how far f is from L) plus the error of g (how far g is from M). We already know both of those errors can be made small — so their sum can too.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the triangle inequality: |A + B| ≤ |A| + |B|.",
        math: "|(f(x)-L) + (g(x)-M)| \\leq |f(x)-L| + |g(x)-M|",
        note: "The triangle inequality is a fundamental property of absolute value.",
        why: {
          tag: "What is the triangle inequality, and why is it true?",
          explanation: "The triangle inequality says |A + B| ≤ |A| + |B| for any real numbers A, B. The name comes from geometry: in a triangle, the length of one side is always at most the sum of the other two sides (you can't shortcut a detour). Algebraically: if A and B have the same sign, |A+B| = |A|+|B| (equality). If they have opposite signs, |A+B| < |A|+|B| because they partially cancel. So the inequality always holds.",
          why: {
            tag: "Why does partial cancellation make it less than |A|+|B|?",
            explanation: "If A = 5 and B = −3: |A+B| = |2| = 2, but |A|+|B| = 5+3 = 8. The negative B reduces the total. The triangle inequality captures this: the absolute value of a sum is at most the sum of individual absolute values (the 'worst case' is when they reinforce each other, not cancel).",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Since lim f = L, for any ε/2 > 0 there exists δ₁ such that |x−a| < δ₁ implies |f(x)−L| < ε/2. Similarly δ₂ for g.",
        math: "|f(x)-L| < \\frac{\\varepsilon}{2} \\quad\\text{and}\\quad |g(x)-M| < \\frac{\\varepsilon}{2}",
        note: "Choose δ = min(δ₁, δ₂). Then both conditions hold simultaneously.",
        why: {
          tag: "Why ε/2 instead of ε? And why min(δ₁, δ₂)?",
          explanation: "We need the total error |f−L| + |g−M| to be less than ε. If each piece is less than ε/2, they sum to less than ε/2 + ε/2 = ε. This is the 'budget splitting' trick: split the total error tolerance ε equally between the two sources of error. We use δ = min(δ₁, δ₂) so that BOTH conditions hold at once — if x is within the smaller of the two windows, it's within both δ₁ and δ₂ simultaneously.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Combining: |f+g − (L+M)| ≤ ε/2 + ε/2 = ε. The sum limit is proved.",
        math: "\\lim_{x\\to a}[f(x)+g(x)] = L + M = \\lim f + \\lim g",
        note: "By induction this extends to any finite sum of functions.",
        why: {
          tag: "Why does this matter? When would I actually use this?",
          explanation: "The Sum Law lets you break complex limits into simple pieces. Example: lim_{x→2} (x² + 3x) = lim x² + lim 3x = 4 + 6 = 10. Without this law, you'd need to ε-δ prove every single limit from scratch. The Sum, Product, and Quotient laws together are what make limit computation practical — they form the 'algebra of limits.'",
          why: null,
        },
      },
    ],
  },

  'limit-prod': {
    title: "Product Law for Limits",
    subtitle: "Prove that lim[f · g] = (lim f)(lim g)",
    category: "Limits",
    problem: "\\lim_{x\\to a}[f(x)\\cdot g(x)] = \\lim_{x\\to a}f(x)\\cdot\\lim_{x\\to a}g(x)",
    preamble: "The product law is trickier than the sum law — we can't just split the bound in half. The key is a clever algebraic manipulation that separates the error into manageable pieces.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let lim f = L and lim g = M. Write the error: |f(x)g(x) − LM|.",
        math: "|f(x)g(x) - LM| = |f(x)g(x) - Lg(x) + Lg(x) - LM|",
        note: "Add and subtract Lg(x) — the same trick as in the Product Rule proof.",
        why: {
          tag: "Why add and subtract Lg(x)? That seems like it comes from nowhere.",
          explanation: "It's a standard 'splitting' trick in analysis. We want to separate the f-error from the g-error. By inserting +Lg(x)−Lg(x) (which equals zero), we create a form we can factor: [f(x)−L]·g(x) + L·[g(x)−M]. The first term involves the f-error (f(x)−L), the second involves the g-error (g(x)−M). Now we can bound each separately.",
          why: {
            tag: "Why does f(x)g(x) − LM split into those two terms?",
            explanation: "Watch the algebra: f(x)g(x) − Lg(x) + Lg(x) − LM = [f(x)−L]·g(x) + L·[g(x)−M]. Check: expand [f(x)−L]·g(x) + L·[g(x)−M] = f(x)g(x) − Lg(x) + Lg(x) − LM = f(x)g(x) − LM ✓. The insertion was designed exactly to make this factoring work.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply triangle inequality and factor.",
        math: "\\leq |f(x)-L|\\cdot|g(x)| + |L|\\cdot|g(x)-M|",
        note: "Factor g(x) from the first pair, L from the second pair.",
        why: {
          tag: "What happened here exactly? Walk me through each step.",
          explanation: "Starting from |[f(x)−L]g(x) + L[g(x)−M]|, apply triangle inequality to get |f(x)−L|·|g(x)| + |L|·|g(x)−M|. Then: the first term has the f-error |f(x)−L| multiplied by how big g is. The second term has the g-error |g(x)−M| multiplied by how big L is. Both |f(x)−L| and |g(x)−M| can be made arbitrarily small. The question is whether the multipliers |g(x)| and |L| stay bounded.",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Near x=a, g(x) is bounded — it stays close to M so |g(x)| ≤ |M| + 1 for x sufficiently close to a.",
        math: "|f(x)-L|\\cdot(|M|+1) + |L|\\cdot|g(x)-M| < \\varepsilon",
        note: "Choose δ small enough so each term is less than ε/2. Since both |f(x)−L| and |g(x)−M| can be made arbitrarily small, the product can too.",
        why: {
          tag: "Why is g bounded near a? Why can't g blow up?",
          explanation: "Since lim g(x) = M, by definition of limit: for ε₀=1, there exists δ₀ such that |g(x)−M| < 1 whenever |x−a| < δ₀. Using the triangle inequality: |g(x)| = |g(x)−M+M| ≤ |g(x)−M| + |M| < 1 + |M|. So g(x) is trapped in the interval (M−1, M+1) — bounded by |M|+1 — for all x in the δ₀-window around a.",
          why: {
            tag: "Why use ε₀ = 1 specifically? Isn't that arbitrary?",
            explanation: "Yes, 1 is arbitrary — any positive number would work. We just need SOME bound on |g(x)|, not the tightest one. Using 1 is conventional because it's simple. The bound |M|+1 is good enough to control the term |f(x)−L|·|g(x)| ≤ |f(x)−L|·(|M|+1), which goes to 0 as |f(x)−L|→0.",
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "lim[f·g] = L·M = (lim f)(lim g).",
        math: "\\lim_{x\\to a}[f(x)g(x)] = \\lim_{x\\to a}f(x)\\cdot\\lim_{x\\to a}g(x)",
        note: "This justifies factoring constants out of limits, e.g. lim[5x²] = 5·lim[x²] = 5·a².",
        why: {
          tag: "Why can't we just say 'since f→L and g→M, of course f·g→L·M'?",
          explanation: "Intuition says yes, but intuition fails with infinite products like (1 + 1/n)ⁿ, where each factor approaches 1 but the product approaches e ≈ 2.718. The rigorous proof above handles finite limits correctly and shows exactly which conditions are needed (both individual limits must exist and be finite). Without the proof, we'd have no reason to trust our intuition in edge cases.",
          why: null,
        },
      },
    ],
  },

  'limit-quot': {
    title: "Quotient Law for Limits",
    subtitle: "Prove that lim[f/g] = (lim f)/(lim g) when lim g ≠ 0",
    category: "Limits",
    problem: "\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\frac{\\lim f}{\\lim g} \\quad (\\lim g \\neq 0)",
    preamble: "The quotient law reduces to the product law: f/g = f · (1/g). The key step is proving that lim[1/g] = 1/(lim g) when lim g ≠ 0.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Reduce to a product: f/g = f · (1/g). If we can find lim[1/g], the product law handles the rest.",
        math: "\\frac{f(x)}{g(x)} = f(x) \\cdot \\frac{1}{g(x)}",
        note: null,
        why: {
          tag: "Why reduce to a product instead of proving division directly?",
          explanation: "We already proved the Product Law. By writing f/g as f·(1/g), we split the problem in two: (1) find lim[1/g], then (2) use the Product Law with f and 1/g. This is the principle of reducing new problems to ones you've already solved — a core technique in mathematics.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Prove that lim[1/g(x)] = 1/M where M = lim g(x) ≠ 0.",
        math: "\\left|\\frac{1}{g(x)} - \\frac{1}{M}\\right| = \\frac{|M - g(x)|}{|g(x)||M|}",
        note: "The numerator |M − g(x)| → 0. The denominator |g(x)||M| stays bounded away from 0 because g stays close to M (which is nonzero).",
        why: {
          tag: "How did we get that fraction |M−g(x)|/(|g(x)||M|)?",
          explanation: "Combine 1/g(x) − 1/M over a common denominator: 1/g(x) − 1/M = M/(g(x)M) − g(x)/(g(x)M) = (M − g(x))/(g(x)·M). Take absolute values: |1/g−1/M| = |M−g(x)|/(|g(x)|·|M|). The numerator goes to 0 since g→M. The denominator needs to stay bounded away from 0 — that's why lim g ≠ 0 is required.",
          why: {
            tag: "Why does g stay away from zero?",
            explanation: "If lim g = M ≠ 0, then |M|/2 > 0. By the limit definition, there exists δ such that |g(x)−M| < |M|/2 whenever |x−a| < δ. Using the reverse triangle inequality: |g(x)| ≥ |M| − |g(x)−M| > |M| − |M|/2 = |M|/2 > 0. So g(x) is at least |M|/2 away from zero — the denominator stays bounded away from 0.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Apply the product law: lim[f/g] = (lim f) · (1/lim g) = (lim f)/(lim g).",
        math: "\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\frac{\\lim_{x\\to a} f(x)}{\\lim_{x\\to a} g(x)}",
        note: "The condition lim g ≠ 0 is essential. When lim g = 0 and lim f = 0, we get the indeterminate form 0/0 — requiring L'Hôpital or algebraic simplification.",
        why: {
          tag: "What goes wrong if lim g = 0?",
          explanation: "If g→0, then 1/g blows up — we'd need lim[1/g] to be ±∞. That's not a real number, so the Product Law (which requires finite limits) doesn't apply. Instead we get an indeterminate form. For example: lim_{x→0} x/x = 1, but lim_{x→0} x²/x = 0, and lim_{x→0} x/x² = ∞. All are 0/0 forms, all different. The quotient law genuinely fails when lim g = 0.",
          why: null,
        },
      },
    ],
  },

  'squeeze': {
    title: "Squeeze Theorem",
    subtitle: "If g ≤ f ≤ h and both g,h → L, then f → L too",
    category: "Limits",
    problem: "g(x) \\le f(x) \\le h(x) \\text{ and } \\lim g = \\lim h = L \\;\\Rightarrow\\; \\lim f = L",
    preamble: "The Squeeze Theorem is used when f is hard to evaluate directly but can be sandwiched between two functions with known limits. The classic application is proving lim sin(h)/h = 1.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "We have g(x) ≤ f(x) ≤ h(x) near x=a, and both g(x)→L and h(x)→L as x→a.",
        math: "g(x) \\le f(x) \\le h(x) \\quad \\text{near } x = a",
        note: "The inequalities only need to hold near a, not necessarily at a.",
        why: {
          tag: "What does 'near a' mean — why not everywhere?",
          explanation: "Limits only care about behavior near a, not far away. If g ≤ f ≤ h holds for all x with 0 < |x−a| < δ₀ for some δ₀ > 0, that's enough. What happens far from a is irrelevant to the limit at a. This is the same reason f(a) itself doesn't matter — only the local neighborhood counts.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "For any ε > 0, both g and h are within ε of L for x close enough to a.",
        math: "L - \\varepsilon < g(x) \\le f(x) \\le h(x) < L + \\varepsilon",
        note: "The outer inequalities come from the limits of g and h. The middle inequalities come from the squeeze assumption.",
        why: {
          tag: "How does the squeeze force f to be close to L?",
          explanation: "Step by step: since lim g = L, there exists δ₁ such that |g(x)−L| < ε, i.e., L−ε < g(x). Since lim h = L, there exists δ₂ such that h(x) < L+ε. Let δ = min(δ₁, δ₂). For |x−a| < δ: L−ε < g(x) ≤ f(x) ≤ h(x) < L+ε. Reading the extremes: L−ε < f(x) < L+ε, meaning |f(x)−L| < ε. So f is within ε of L — and this works for any ε > 0.",
          why: {
            tag: "Why is this called the 'squeeze' — what's the visual?",
            explanation: "Picture f sandwiched between g and h on a graph. As x→a, both g and h converge to L — the gap between them shrinks to zero. Since f is always between g and h, it has no room to go anywhere except toward L too. The two bounding functions 'squeeze' f into convergence.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Since L−ε < f(x) < L+ε, we have |f(x)−L| < ε. This holds for any ε > 0, so lim f(x) = L.",
        math: "|f(x) - L| < \\varepsilon \\quad\\Longrightarrow\\quad \\lim_{x\\to a} f(x) = L",
        note: null,
        why: {
          tag: "When would I use the Squeeze Theorem in practice?",
          explanation: "Whenever a function oscillates wildly but is bounded by simpler functions. Classic examples: (1) lim_{x→0} x·sin(1/x) = 0, because −|x| ≤ x·sin(1/x) ≤ |x| and both bounds → 0. (2) lim_{h→0} sin(h)/h = 1, proved geometrically by squeezing between cos h and 1/cos h. The Squeeze Theorem is also why we can prove trig derivatives, which then enable all of calculus.",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Example: prove lim_{x→0} x·sin(1/x) = 0 using the squeeze.",
        math: "-|x| \\le x\\sin(1/x) \\le |x| \\quad\\text{since }|\\sin(1/x)| \\le 1",
        note: "Both −|x| and |x| approach 0 as x→0. By the Squeeze Theorem, x·sin(1/x) → 0 too — even though sin(1/x) oscillates wildly near 0.",
        why: {
          tag: "Why does |sin(1/x)| ≤ 1 give us the bounds −|x| ≤ x·sin(1/x) ≤ |x|?",
          explanation: "Since sin of anything is always between −1 and 1: −1 ≤ sin(1/x) ≤ 1. Multiply all three parts by |x| ≥ 0: −|x| ≤ |x|·sin(1/x) ≤ |x|. But |x|·sin(1/x) = x·sin(1/x) when x > 0, and = x·sin(1/x) when x < 0 too (the absolute value and the sign of x interact the same way). So the bound holds for all x ≠ 0. As x→0, both ±|x|→0, squeezing the oscillating function to 0.",
          why: null,
        },
      },
    ],
  },

  'lhopital': {
    title: "L'Hôpital's Rule",
    subtitle: "Evaluating 0/0 and ∞/∞ limits by differentiating numerator and denominator",
    category: "Limits",
    problem: "\\lim\\frac{f}{g} = \\lim\\frac{f'}{g'} \\quad\\text{when the original limit is }\\tfrac{0}{0}\\text{ or }\\tfrac{\\infty}{\\infty}",
    preamble: "When direct substitution gives 0/0 or ∞/∞, L'Hôpital's Rule lets us differentiate numerator and denominator separately. It follows from the Cauchy Mean Value Theorem.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Suppose f(a) = g(a) = 0 (the 0/0 case). Direct substitution gives 0/0, which is undefined.",
        math: "\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\frac{0}{0} \\quad\\leftarrow\\text{indeterminate}",
        note: "0/0 is indeterminate — the limit could be any value depending on how fast each function approaches zero.",
        why: {
          tag: "Why is 0/0 called 'indeterminate' — isn't it just undefined?",
          explanation: "'Undefined' means no meaningful answer exists (like 5/0). 'Indeterminate' means the form alone tells you nothing about the limit — it depends on the specific functions. Three different limits, all 0/0 forms: lim_{x→0} x/x = 1 (both numerator and denominator hit zero at the same rate). lim_{x→0} x²/x = 0 (numerator shrinks faster). lim_{x→0} x/x² = ∞ (denominator shrinks faster). The 0/0 form leaves the actual limit completely open — you must look more carefully.",
          why: {
            tag: "What are all the indeterminate forms?",
            explanation: "0/0 and ∞/∞ are the main ones for L'Hôpital. The others — 0·∞, ∞−∞, 0⁰, 1^∞, ∞⁰ — can be converted to 0/0 or ∞/∞ through algebraic manipulation (e.g., rewrite 0·∞ as 0/(1/∞) = 0/0). These are all called indeterminate because the form alone doesn't determine the answer.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "The Cauchy Mean Value Theorem: for f, g differentiable on (a, x), there exists c between a and x such that [f(x)−f(a)]/[g(x)−g(a)] = f′(c)/g′(c).",
        math: "\\frac{f(x) - f(a)}{g(x) - g(a)} = \\frac{f'(c)}{g'(c)} \\quad\\text{for some }c\\text{ between }a\\text{ and }x",
        note: "Since f(a) = g(a) = 0, this simplifies to f(x)/g(x) = f′(c)/g′(c).",
        why: {
          tag: "What is the Cauchy Mean Value Theorem, and why should I believe it?",
          explanation: "The regular Mean Value Theorem (MVT) says: on [a,b], the average rate of change equals the instantaneous rate at some interior point c: (f(b)−f(a))/(b−a) = f′(c). The Cauchy MVT is the parametric version: instead of (b−a) in the denominator, use (g(b)−g(a)). It says: [f(b)−f(a)]/[g(b)−g(a)] = f′(c)/g′(c) for some c. Both functions are measured on the same scale (g's change instead of just distance). The proof uses the regular MVT applied to the auxiliary function h(x) = f(x) − [f(b)−f(a)]/[g(b)−g(a)] · g(x).",
          why: {
            tag: "What is the regular Mean Value Theorem?",
            explanation: "MVT: if f is continuous on [a,b] and differentiable on (a,b), then there exists c in (a,b) where f′(c) = (f(b)−f(a))/(b−a). In words: somewhere on the curve, the tangent line has the exact same slope as the secant line connecting the endpoints. Geometrically obvious — if you drive from city A to city B in 2 hours covering 100 miles, at some moment your speedometer read exactly 50 mph.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "As x→a, c is squeezed between a and x, so c→a too. If f′/g′ has a limit as x→a, then f/g has the same limit.",
        math: "\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{c\\to a}\\frac{f'(c)}{g'(c)} = \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}",
        note: null,
        why: {
          tag: "Why does c→a just because x→a?",
          explanation: "By the Cauchy MVT, c is some point strictly between a and x. As x approaches a, the interval (a,x) shrinks to a single point. c is trapped in that shrinking interval — by the Squeeze Theorem, c must also approach a. This is the same logic as: if a ≤ c ≤ x and x→a, then c→a too.",
          why: null,
        },
      },
      {
        id: 4, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify: lim_{x→0} sin(x)/x. Direct substitution gives 0/0.",
        math: "\\lim_{x\\to 0}\\frac{\\sin x}{x} \\stackrel{L'H}{=} \\lim_{x\\to 0}\\frac{\\cos x}{1} = \\cos(0) = 1 \\;\\checkmark",
        note: "The derivative of sin x is cos x; derivative of x is 1. Substituting x=0 gives cos(0)/1 = 1.",
        why: {
          tag: "We proved lim sin(x)/x = 1 geometrically — is using L'Hôpital circular here?",
          explanation: "Yes — this is a famous circular trap! The derivative d/dx[sin x] = cos x was proved USING the limit lim sin(h)/h = 1. So using L'Hôpital on lim sin(x)/x is circular: we'd be using the result to prove itself. The geometric squeeze proof (sinc limit) is the proper non-circular proof. L'Hôpital is valid here only if you accept d/dx[sin x] = cos x from elsewhere. This is a good reminder: always check whether L'Hôpital's application is circular.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Apply L'Hôpital when you see 0/0 or ∞/∞: differentiate top and bottom separately (not the quotient rule), then take the limit.",
        math: "\\lim\\frac{f}{g} = \\lim\\frac{f'}{g'} \\quad(0/0\\text{ or }\\infty/\\infty\\text{ form})",
        note: "Can be applied repeatedly if f′/g′ is still indeterminate. Doesn't apply for 0/∞ or 1^∞ forms without algebraic manipulation first.",
        why: {
          tag: "Full dependency chain",
          explanation: "L'Hôpital's Rule relied on:",
          steps: [
            { text: "lim f/g = lim f′/g′  ← the result" },
            { text: "↳ Cauchy Mean Value Theorem" },
            { text: "↳ Regular Mean Value Theorem  ← requires differentiability" },
            { text: "↳ Rolle's Theorem  ← requires continuity on [a,b], differentiable on (a,b)" },
            { text: "↳ Extreme Value Theorem  ← requires continuity on a closed interval" },
          ],
          why: null,
        },
      },
    ],
  },

  'sinc': {
    title: "Sinc Limit: lim sin(h)/h = 1",
    subtitle: "The most important trigonometric limit, proved by geometry",
    category: "Limits",
    problem: "\\lim_{h \\to 0}\\frac{\\sin h}{h} = 1",
    preamble: "This limit is the foundation of all trig derivatives. We prove it using a geometric squeeze: three areas on the unit circle force sin(h)/h between two bounds that both approach 1.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Draw a unit circle. For small positive angle h (in radians), identify three geometric figures sharing the vertex at the origin.",
        math: "\\text{Triangle OAB} \\subset \\text{Sector OAB} \\subset \\text{Triangle OAC}",
        note: "O = origin, A = (1,0), B = (cos h, sin h), C = (1, tan h). All three share the angle h at O.",
        why: {
          tag: "Why use the unit circle? And why these three shapes?",
          explanation: "The unit circle (radius = 1) is ideal because lengths simplify beautifully: arc length = r·h = 1·h = h. This directly connects h (the angle in radians) to sin h (the y-coordinate of B = height of the arc endpoint) and cos h (the x-coordinate). The three shapes — two triangles sandwiching a circular sector — are chosen because: (1) we can compute all their areas exactly, and (2) they're nested, giving us an inequality chain.",
          why: {
            tag: "What is a radian, exactly? Why does arc = angle in radians?",
            explanation: "One radian is the angle that subtends an arc equal in length to the radius. For a unit circle (r=1), arc length = r·θ = 1·θ = θ. So the arc from A to B has length exactly h. This is why radians are the 'natural' angle unit for calculus — they make arc length, area, and derivatives as clean as possible. In degrees, arc length = π/180·r·θ, which introduces the ugly π/180 factor everywhere.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Geometry", tagStyle: S.geo,
        instruction: "Compute the three areas. Since Triangle OAB ⊂ Sector ⊂ Triangle OAC, their areas are in the same order.",
        math: "\\frac{1}{2}\\cos h\\sin h \\;\\le\\; \\frac{h}{2} \\;\\le\\; \\frac{1}{2}\\tan h",
        note: "Triangle OAB area = (1/2)·cos h·sin h. Sector area = h/2. Triangle OAC: base OA=1, height AC=tan h, area = (1/2)·tan h.",
        why: {
          tag: "How did we get each area? Walk through each formula.",
          explanation: "Triangle OAB: base OA = 1, height = vertical distance from B = sin h (the y-coord of B on the unit circle). Area = (1/2)·base·height = (1/2)·1·sin h = sin h/2. But wait — the base is actually the horizontal leg. More precisely: it's a triangle with vertices O=(0,0), A=(1,0), B=(cos h, sin h). Area by cross product = (1/2)|OA × OB| = (1/2)|1·sin h − 0·cos h| = sin h/2. Hmm, that's the same. The formula (1/2)cos h·sin h comes from the base = cos h (the horizontal projection) and height = sin h. Sector OAB: area = (1/2)r²θ = (1/2)(1²)(h) = h/2. Triangle OAC: vertices O=(0,0), A=(1,0), C=(1, tan h). This is a right triangle with base = 1 and height = tan h. Area = (1/2)·1·tan h = tan h/2.",
          why: {
            tag: "How is the sector area h/2?",
            explanation: "A sector is a 'pie slice' of a circle. Its area is proportional to the angle: Area = (angle/full angle) × total circle area = (h/2π)·πr² = r²h/2. For r=1: area = h/2. This is the same as saying the sector's area grows linearly with the angle h.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Divide the inequality chain through by (1/2)sin h (positive for h ∈ (0, π/2)).",
        math: "\\cos h \\;\\le\\; \\frac{h}{\\sin h} \\;\\le\\; \\frac{1}{\\cos h}",
        note: "Dividing by (1/2)sin h flips nothing since it's positive. We now have h/sin h sandwiched.",
        why: {
          tag: "Why divide by (1/2)sin h — and why does this give h/sin h?",
          explanation: "Starting from: (1/2)cos h·sin h ≤ h/2 ≤ (1/2)tan h. Divide everything by (1/2)sin h (which is positive for h ∈ (0, π/2)): (1/2)cos h·sin h / [(1/2)sin h] ≤ h/2 / [(1/2)sin h] ≤ (1/2)tan h / [(1/2)sin h]. Simplify each term: cos h ≤ h/sin h ≤ (sin h/cos h)/sin h = 1/cos h. So now h/sin h is sandwiched. Dividing is positive, so inequalities don't flip.",
          why: null,
        },
      },
      {
        id: 4, tag: "Key Move", tagStyle: S.key,
        instruction: "Take reciprocals (which reverses inequalities). Now sin(h)/h is squeezed between cos h and 1/cos h.",
        math: "\\cos h \\;\\le\\; \\frac{\\sin h}{h} \\;\\le\\; \\frac{1}{\\cos h}",
        note: "As h→0⁺, cos h → 1 and 1/cos h → 1. By the Squeeze Theorem, sin(h)/h → 1.",
        why: {
          tag: "Taking reciprocals reverses inequalities — why?",
          explanation: "If A ≤ B and both are positive, then 1/A ≥ 1/B (larger number has smaller reciprocal). Example: 2 ≤ 5, so 1/2 ≥ 1/5. So from cos h ≤ h/sin h ≤ 1/cos h, taking reciprocals and reversing: 1/cos h ≥ sin h/h ≥ cos h, which we write as cos h ≤ sin h/h ≤ 1/cos h. Both bounds approach 1 as h→0 (since cos 0 = 1). Squeeze Theorem: sin h/h → 1.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Both bounding functions approach 1 as h→0, so by the Squeeze Theorem, lim sin(h)/h = 1.",
        math: "\\lim_{h\\to 0}\\frac{\\sin h}{h} = 1",
        note: "Also valid as h→0⁻ by the even symmetry of sin(h)/h (both sin and h change sign together). Numerical check: sin(0.1)/0.1 ≈ 0.9983, sin(0.01)/0.01 ≈ 0.99998 — converging to 1 ✓.",
        why: {
          tag: "Why is this limit so important?",
          explanation: "lim sin(h)/h = 1 is used directly in the proof that d/dx[sin x] = cos x. Without it, we can't differentiate trig functions. And without trig derivatives, we can't differentiate most physics equations (oscillations, waves, circular motion). This one limit is the gateway to all of trigonometric calculus.",
          why: {
            tag: "Full dependency chain",
            explanation: "lim sin(h)/h = 1 relied on:",
            steps: [
              { text: "lim sin(h)/h = 1  ← the result" },
              { text: "↳ Squeeze Theorem" },
              { text: "↳ Geometric area comparisons on the unit circle" },
              { text: "↳ Radian measure: arc = r·θ, sector area = r²θ/2" },
              { text: "↳ lim cos h = 1 as h→0 (continuity of cosine at 0)" },
            ],
            why: null,
          },
        },
      },
    ],
  },

  'e-limit': {
    title: "Definition of e",
    subtitle: "The number e as a natural limit from compound interest",
    category: "Limits",
    problem: "e = \\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n \\approx 2.71828\\ldots",
    preamble: "e arises naturally from continuous compounding. If you invest $1 at 100% interest compounded n times per year, after one year you have $(1+1/n)ⁿ. As n→∞, this converges to e.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Model continuous compounding. With interest rate r=1 (100%) and n compounding periods per year, after 1 year: value = (1 + 1/n)ⁿ.",
        math: "n=1:\\; 2,\\quad n=2:\\; 2.25,\\quad n=12:\\; 2.613,\\quad n=365:\\; 2.7146,\\quad n\\to\\infty:\\; e",
        note: "The values increase but slow down — they converge rather than growing without bound.",
        why: {
          tag: "Why does more compounding slow down? Shouldn't more be better?",
          explanation: "More compounding periods means each period has a smaller rate (1/n). You're splitting the 100% interest into n tiny slices. Each slice compounds on the previous, giving exponential growth within the year. But more slices of size 1/n gives you (1+1/n)ⁿ — and each added slice contributes less than the previous because n grows in the denominator too. The diminishing returns exactly balance the benefit of compounding, converging to a finite limit e.",
          why: {
            tag: "Why doesn't it grow to infinity? Each period still earns interest.",
            explanation: "The key is (1+1/n)ⁿ. As n→∞, 1+1/n→1 (getting closer to 1), but the exponent n→∞ (pushing it up). These two effects — factor approaching 1, exponent going to infinity — produce an indeterminate form 1^∞. The resolution: they balance at exactly e ≈ 2.718. You can see this numerically: (1+1/1000000)^1000000 ≈ 2.71828.",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Take the natural log to linearize. Let L = lim_{n→∞} (1+1/n)ⁿ. Then ln L = lim_{n→∞} n·ln(1+1/n).",
        math: "\\ln L = \\lim_{n\\to\\infty} n\\ln\\left(1+\\frac{1}{n}\\right) = \\lim_{n\\to\\infty}\\frac{\\ln(1+1/n)}{1/n}",
        note: "This is a 0/0 form as n→∞ (numerator → ln 1 = 0, denominator → 0). Apply L'Hôpital.",
        why: {
          tag: "Why take ln of both sides — what does that accomplish?",
          explanation: "The original limit L = lim(1+1/n)ⁿ has the variable n in the exponent — it's hard to work with directly. Taking ln moves the exponent down: ln(Aⁿ) = n·ln A. So ln L = lim n·ln(1+1/n). This is now a product n·[something going to 0], which is a 0·∞ form. Rewriting as a fraction [ln(1+1/n)]/(1/n) gives 0/0, letting us use L'Hôpital. This 'take ln to bring down exponents' trick is standard for 1^∞ indeterminate forms.",
          why: {
            tag: "How do we find L once we know ln L?",
            explanation: "If ln L = 1, then L = e¹ = e (by definition of e: e is the base of the natural log, so ln e = 1). Alternatively, e^(ln L) = e^1 = e, and e^(ln L) = L. Either way, L = e.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Limit", tagStyle: S.limit,
        instruction: "Apply L'Hôpital with t = 1/n → 0: lim_{t→0} ln(1+t)/t.",
        math: "\\lim_{t\\to 0}\\frac{\\ln(1+t)}{t} \\stackrel{L'H}{=} \\lim_{t\\to 0}\\frac{1/(1+t)}{1} = \\frac{1}{1+0} = 1",
        note: "d/dt[ln(1+t)] = 1/(1+t) and d/dt[t] = 1.",
        why: {
          tag: "How do we differentiate ln(1+t) — what rule is used?",
          explanation: "Chain Rule: d/dt[ln(1+t)] = (1/(1+t)) · d/dt[1+t] = (1/(1+t)) · 1 = 1/(1+t). The outer function is ln u (with derivative 1/u), the inner function is u = 1+t (with derivative 1). At t=0: 1/(1+0) = 1. And d/dt[t] = 1. So L'Hôpital gives (1/(1+t))/1 → 1/1 = 1.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "ln L = 1, so L = e¹ = e. This defines e ≈ 2.71828.",
        math: "e = \\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n",
        note: "Equivalently: e = lim_{h→0} (1+h)^(1/h). This is the same limit with h = 1/n. The number e is irrational and transcendental.",
        why: {
          tag: "Why is e so special — why not use base 2 or 10 for everything?",
          explanation: "e is the unique number where d/dx[eˣ] = eˣ — the function is its own derivative. For any other base b: d/dx[bˣ] = bˣ · ln b. The extra factor ln b goes away only when b = e (since ln e = 1). This makes e the 'natural' base for calculus. It also appears in: compound interest (as shown here), probability (Poisson distribution), physics (radioactive decay, RC circuits), complex numbers (Euler's formula e^(iθ) = cos θ + i sin θ), and countless other contexts.",
          why: null,
        },
      },
    ],
  },
}
