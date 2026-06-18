export default {
  id: "ch1-epsilon-delta",
  slug: "epsilon-delta",
  chapter: 1,
  order: 3,
  title: "The Epsilon-Delta Definition",
  subtitle: 'Making "close to" mathematically airtight',
  tags: [
    "epsilon-delta",
    "ε-δ",
    "formal definition",
    "proof technique",
    "Cauchy",
    "Weierstrass",
    "rigor",
  ],

  hook: {
    question:
      'How do you prove something gets "infinitely close" to a value — without ever using infinity?',
    realWorldContext:
      "For 150 years after Newton and Leibniz, calculus worked. Engineers built bridges, astronomers predicted eclipses, and physicists derived the laws of motion — all using limits, derivatives, and integrals. " +
      'But nobody could explain *why* it worked. The philosopher George Berkeley mocked the foundations: Newton\'s "infinitesimals" were "the ghosts of departed quantities." ' +
      'Was calculus built on mysticism? In the 1820s, Augustin-Louis Cauchy finally gave limits a precise definition: instead of vague talk about "approaching," he described a concrete game you can play with two numbers, ε and δ. ' +
      "Karl Weierstrass later polished the idea into the form we use today. The ε-δ definition didn't change a single computation — every answer Newton got was still correct — but it gave calculus an unshakable logical foundation. " +
      "It's the mathematical equivalent of building codes: the bridge already stood, but now we can *prove* it won't collapse.",
    previewVisualizationId: "EpsilonDelta",
  },

  intuition: {
    prose: [
      "Imagine you're playing a game against a skeptic. You claim that lim(x→3) (2x+1) = 7. The skeptic doesn't believe you. So you agree on rules:",

      '**Round 1**: The skeptic says "I bet f(x) isn\'t always within 0.5 of 7." You respond: "Keep x within 0.25 of 3, and I guarantee |f(x) − 7| < 0.5." You\'re right: if |x−3| < 0.25, then |2x+1−7| = 2|x−3| < 2(0.25) = 0.5. ✓',

      '**Round 2**: The skeptic tightens: "Within 0.01 of 7." You respond: "Keep x within 0.005 of 3." Check: 2(0.005) = 0.01. ✓',

      '**Round 3**: "Within 0.0001 of 7." You: "Within 0.00005 of 3." Check: 2(0.00005) = 0.0001. ✓',

      "The skeptic can pick ANY positive number ε (the output tolerance), no matter how tiny. You must respond with a δ (the input tolerance) that guarantees every x within δ of 3 has f(x) within ε of 7. If you can ALWAYS win — for EVERY possible ε — then the limit is truly 7.",

      "For this linear function, the winning strategy is simple: set δ = ε/2. For other functions, finding δ is harder — that's where the algebra comes in. But the game is always the same.",

      'The beautiful thing about this definition: it never mentions infinity, it never mentions "approaching," and it never mentions motion or time. It replaces all of those fuzzy ideas with a single, airtight logical statement about numbers. This is what mathematician Morris Kline called "the arithmetization of analysis" — rebuilding all of calculus on nothing more than the properties of real numbers.',
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "Absolute Value as Distance",
        body: '|a − b| is the distance between a and b on the number line. So |x − 3| < 0.5 means "x is within 0.5 of 3," and |f(x) − 7| < ε means "f(x) is within ε of 7." The entire ε-δ definition is stated in the language of distances.',
      },
      {
        type: "intuition",
        title: "The ε-δ Game in One Sentence",
        body: '"No matter how tight the accuracy demand (ε), I can always find a neighborhood (δ) where the function stays within tolerance." If you can always win, the limit exists.',
      },
      {
        type: "history",
        title: "Berkeley's Challenge and Cauchy's Answer (1734 → 1821)",
        body: "In 1734, Bishop George Berkeley published \"The Analyst,\" attacking Newton's calculus. He asked: what is a fluxion? Is dx a positive quantity, or zero? If positive, the results are approximate; if zero, division by it is illegal. For nearly a century, no mathematician had a satisfying response. In 1821, Cauchy's \"Cours d'Analyse\" finally answered: limits are defined by inequalities (ε and δ), not by mystical infinitesimals. Weierstrass later removed Cauchy's remaining appeals to intuition, giving us the purely algebraic definition used today.",
      },
      {
        type: "real-world",
        title: "Engineering Tolerances Are ε-δ Problems",
        body: 'A machinist needs a bolt diameter within ±0.01 mm of 10 mm (ε = 0.01). The lathe\'s input parameter is feed rate, which must be set within some tolerance δ of the nominal value. Finding δ from ε — "how precisely must I control the input to guarantee the output tolerance?" — is exactly an ε-δ problem. Every manufacturing spec, every quality control threshold, every sensor calibration is an ε-δ argument in disguise.',
      },
    ],
    visualizations: [
      {
        id: "EpsilonDelta",
        props: { fn: "2*x + 1", c: 3, L: 7 },
        title: "The ε-δ Game — Interactive",
        mathBridge:
          "The horizontal yellow band has half-width $\\varepsilon$ (output tolerance). The vertical blue band has half-width $\\delta$ (input tolerance). The definition $\\lim_{x \\to 3}(2x+1)=7$ says: for ANY $\\varepsilon$ you choose, there EXISTS a $\\delta$ such that whenever $x$ is inside the blue band, $f(x)$ is inside the yellow band. For this linear function, $f(x)-7 = 2(x-3)$, so setting $\\delta = \\varepsilon/2$ always works.",
        caption:
          "Drag ε to set the output tolerance (horizontal band around L=7). Watch δ adjust to ensure f(x) stays within the band. For this linear function, δ = ε/2 always works.",
      },
    ],
  },

  math: {
    prose: [
      'The formal definition replaces "f(x) approaches L" with a precise inequality statement. No motion, no time, no infinity — just numbers.',

      'The key symbols: ∀ means "for all" (or "for every"), ∃ means "there exists" (at least one), and ⟹ means "implies" (if ... then ...). The definition reads:',

      "lim(x→c) f(x) = L if and only if: for every ε > 0, there exists δ > 0 such that whenever 0 < |x − c| < δ, we have |f(x) − L| < ε.",

      "The condition 0 < |x − c| means x ≠ c — we explicitly exclude the point c itself. The limit only cares about what happens NEAR c, not AT c. This is why limits can exist at holes, jumps, and even undefined points.",

      "The **order of quantifiers matters critically**: first ∀ε, then ∃δ. This means δ is allowed to depend on ε (and it usually does — smaller ε generally requires smaller δ). If the order were reversed (∃δ such that ∀ε...), a single δ would need to work for every ε simultaneously, which is almost never possible.",

      "**One-sided ε-δ definitions**: For the left-hand limit lim(x→c⁻) f(x) = L, replace 0 < |x−c| < δ with c−δ < x < c (x approaches from below only). For the right-hand limit, use c < x < c+δ.",

      "**How to construct an ε-δ proof** — the two-phase strategy:",
      "PHASE 1 (Scratch work): Start from |f(x) − L| and simplify algebraically. Express it in terms of |x − c|. Find what δ needs to be (in terms of ε).",
      'PHASE 2 (Formal proof): "Given ε > 0, let δ = [your expression]. Suppose 0 < |x−c| < δ. Then... [chain of inequalities]... < ε. ∎"',
      "The scratch work is where you figure out the answer. The formal proof is where you verify it. Students get confused because textbooks only show Phase 2 — the polished proof — hiding the discovery process.",
    ],
    callouts: [
      {
        type: "definition",
        title: "The Epsilon-Delta Definition of a Limit",
        body: "\\lim_{x \\to c} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 \\text{ such that:} \\\\ 0 < |x - c| < \\delta \\implies |f(x) - L| < \\varepsilon",
      },
      {
        type: "misconception",
        title: "δ Depends on ε — Not the Other Way Around",
        body: "The skeptic picks ε first. Then you choose δ. Your δ is allowed to be a function of ε: δ(ε) = ε/2, or δ(ε) = min(1, ε/5), etc. A common student mistake is trying to find ε from δ, or assuming δ must be independent of ε. Neither is correct. The quantifier order ∀ε ∃δ makes this clear.",
      },
      {
        type: "tip",
        title: "The min(1, ...) Trick",
        body: "For nonlinear functions, |f(x)−L| often factors into |x−c| · g(x), where g(x) varies with x. To bound g(x), restrict δ ≤ 1 first (so x stays in a small interval around c). Within that interval, find an upper bound M for |g(x)|. Then set δ = min(1, ε/M). This two-step strategy handles every polynomial and rational function limit.",
      },
      {
        type: "definition",
        title: "Absolute Value as an Interval",
        body: "|x-a| < \\delta \\iff a-\\delta < x < a+\\delta. This translation is often the fastest way to bound expressions in ε-δ proofs.",
      },
      {
        type: "technique",
        title: "Inequality Chain Checklist",
        body: "In proofs, justify each inequality step: factor, apply |uv|=|u||v|, bound variable factors on a local interval, then choose \\delta from the final bound.",
      },
      {
        type: "technique",
        title: "Reverse-Engineer Delta from Epsilon",
        body: "Start from the target |f(x)-L|<\\varepsilon and work backward to a condition of the form |x-c|<(...). Then in the forward proof, define \\delta as that expression (often with min(1,...)) and replay the chain in the correct direction.",
      },
    ],
    visualizations: [
      {
        id: "EpsilonDelta",
        props: { fn: "x*x", c: 2, L: 4 },
        title: "ε-δ for f(x) = x² at c = 2",
        mathBridge:
          "For $f(x)=x^2$ at $c=2$: $|f(x)-4| = |x^2-4| = |x-2||x+2|$. Near $c=2$, if $\\delta \\leq 1$ then $x \\in (1,3)$ so $|x+2| < 5$. Therefore $|x^2-4| < 5|x-2| < 5\\delta$. Setting $\\delta = \\min(1,\\, \\varepsilon/5)$ guarantees $|x^2-4| < \\varepsilon$. Notice: $\\delta$ is no longer simply $\\varepsilon/k$ — it uses the min-of-1 trick because the function is nonlinear.",
        caption:
          "A nonlinear function: notice that δ is no longer simply ε/k. For x², the relationship between ε and δ depends on the neighborhood around c=2. Watch how δ must shrink faster than ε.",
      },
    ],
  },

  rigor: {
    prose: [
      "Let us prove the Sum Law using ε-δ, to see how these proofs work at the foundational level.",

      "CLAIM: If lim(x→c) f(x) = L and lim(x→c) g(x) = M, then lim(x→c) [f(x)+g(x)] = L+M.",

      "PROOF: Given ε > 0. We need |(f(x)+g(x)) − (L+M)| < ε.",

      "By the triangle inequality: |(f+g) − (L+M)| = |(f−L) + (g−M)| ≤ |f−L| + |g−M|.",

      "So if we can make each term less than ε/2, the sum will be less than ε.",

      "Since lim f = L: ∃δ₁ > 0 such that 0 < |x−c| < δ₁ ⟹ |f(x)−L| < ε/2.",
      "Since lim g = M: ∃δ₂ > 0 such that 0 < |x−c| < δ₂ ⟹ |g(x)−M| < ε/2.",

      "Let δ = min(δ₁, δ₂). Then 0 < |x−c| < δ implies BOTH conditions hold simultaneously:",
      "|(f+g) − (L+M)| ≤ |f−L| + |g−M| < ε/2 + ε/2 = ε. ∎",

      "This proof illustrates several key techniques: (1) the {{algebra:triangle-inequality|triangle inequality}} |a+b| ≤ |a|+|b| to safely split error accumulation; (2) the **ε/2 trick** — budget half the absolute tolerance for each term; (3) **taking the minimum** of multiple δ values so all local conditions explicitly hold simultaneously. These three tools govern nearly every ε-δ proof.",

      'Historically, this level of rigor was developed because of actual mathematical crises. In the 1800s, mathematicians discovered continuous functions that are nowhere differentiable (Weierstrass, 1872), convergent series of continuous functions with discontinuous limits (Cauchy got this wrong!), and space-filling curves (Peano, 1890). These "pathological" examples showed that geometric intuition could not be trusted — only rigorous definitions could prevent errors.',
    ],
    callouts: [
      {
        type: "history",
        title: "Weierstrass's Monster (1872)",
        body: "Karl Weierstrass constructed a function that is continuous everywhere but differentiable nowhere — a curve so jagged it has no tangent line at any point. This shocked the mathematical world: how could something continuous be so chaotic? The example proved that rigorous definitions (not pictures) were essential. The function is f(x) = Σ aⁿ cos(bⁿπx), with 0 < a < 1 and b an odd integer with ab > 1+3π/2.",
      },
      {
        type: "definition",
        title: "ε-δ for One-Sided Limits",
        body: "\\lim_{x \\to c^+} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 \\text{ s.t. } 0 < x - c < \\delta \\implies |f(x) - L| < \\varepsilon \\\\ \\lim_{x \\to c^-} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 \\text{ s.t. } 0 < c - x < \\delta \\implies |f(x) - L| < \\varepsilon",
      },
    ],
    visualizations: [
      {
        id: "EpsilonDelta",
        props: { fn: "(x*x - 1)/(x - 1)", c: 1, L: 2 },
        title: "ε-δ at a Removable Discontinuity",
        caption:
          "f(x) = (x²−1)/(x−1) = x+1 for x ≠ 1. The function has a hole at x=1, but the ε-δ definition only checks x ≠ c. The limit is 2 — verified by the ε-δ condition.",
      },
      {
        id: "TriangleInequalityViz",
        title: "Geometric Proof: The Triangle Inequality",
        caption:
          "Play with values a and b to dynamically prove why |a + b| ≤ |a| + |b|. This simple 1D collapse is the exact mechanism preventing error accumulation in Calculus.",
      },
    ],
  },

  examples: [
    {
      id: "ex-ed-linear",
      title: "ε-δ Proof for a Linear Function (Scratchwork + Formal Proof)",
      problem:
        "Prove using the ε-δ definition that \\displaystyle\\lim_{x \\to 4} (3x - 5) = 7.",
      steps: [
        {
          expression: "\\textbf{Reminder: ε-δ Definition}",
          annotation:
            "To prove \\lim_{x \\to c} f(x) = L we must show: for every ε > 0 there exists δ > 0 such that if 0 < |x - c| < δ then |f(x) - L| < ε. Every proof follows this exact template.",
        },
        {
          expression: "\\textbf{Phase 1 — Scratch Work (Planning)}",
          annotation:
            "We first simplify |f(x) - L| algebraically and solve for the required |x - c| in terms of ε. This tells us exactly what δ must be.",
        },
        {
          expression: "|(3x - 5) - 7| = |3x - 12| = 3|x - 4|",
          annotation:
            "Prerequisite algebra: distribute and combine constants inside the absolute value. The output error factors perfectly as the constant 3 (the slope) times the input error |x - 4|. Gotcha: never drop the absolute value — it is required by the definition.",
        },
        {
          expression:
            "We need 3|x - 4| < \\varepsilon \\quad \\iff \\quad |x - 4| < \\frac{\\varepsilon}{3}",
          annotation:
            "Solve the inequality. The 3 scales the error, so to keep output error below ε we must make input error smaller than ε/3. This is why the slope |m| appears in every linear proof: δ = ε/|m|.",
        },
        {
          expression: "\\textbf{Phase 2 — Formal Proof}",
          annotation:
            "Now we write the proof using the δ we discovered. Every line must be justified.",
        },
        {
          expression:
            "\\text{Let } \\varepsilon > 0 \\text{ be given. Choose } \\delta = \\frac{\\varepsilon}{3}.",
          annotation:
            "We declare δ explicitly in terms of ε. This choice is not magic — it came directly from the scratch-work inequality.",
        },
        {
          expression: "\\text{Assume } 0 < |x - 4| < \\delta.",
          annotation:
            "This is the hypothesis: x is close to 4 (but not equal). We must now prove that this forces |f(x) - L| < ε.",
        },
        {
          expression:
            "|(3x - 5) - 7| = 3|x - 4| < 3 \\cdot \\delta = 3 \\cdot \\frac{\\varepsilon}{3} = \\varepsilon.",
          annotation:
            "Chain of equalities and inequalities: output error = 3 × input error < 3δ (by hypothesis) = ε (by our choice of δ). Every step is reversible algebra. \\blacksquare",
        },
      ],
      conclusion:
        "Aha! For any linear function the proof is always one clean line because the error scales exactly by the slope |m|. No restrictions or min tricks are needed — linearity makes life easy. This is why linear functions are continuous everywhere.",
    },
    {
      id: "ex-ed-quadratic",
      title:
        "ε-δ Proof for a Quadratic — Why We Choose δ ≤ 1 and the min Trick",
      problem:
        "Prove using the ε-δ definition that \\displaystyle\\lim_{x \\to 3} x^2 = 9.",
      steps: [
        {
          expression: "\\textbf{Reminder: ε-δ Definition}",
          annotation:
            "We must control |f(x) - L| no matter how small ε is. For nonlinear functions we need extra planning.",
        },
        {
          expression: "|x^2 - 9| = |x - 3| \\cdot |x + 3|",
          annotation:
            "Difference of squares (prerequisite algebra). We have separated the controllable factor |x-3| from the troublesome |x+3| that changes with x.",
        },
        {
          expression:
            "\\text{Problem: } |x+3| \\text{ is not constant — it grows as x moves away from 3.}",
          annotation:
            "If we tried δ = ε/|x+3| we couldn't, because |x+3| depends on the unknown x. This is the exact reason nonlinear proofs are harder.",
        },
        {
          expression:
            "\\textbf{Why we choose δ ≤ 1 (the restriction trick)}: If we force |x-3| < 1, then x is trapped in (2,4). On this tiny interval |x+3| is bounded above by 7 (a constant).",
          annotation:
            "We pick 1 arbitrarily — any positive number works, but 1 is simple and keeps the interval symmetric and easy to calculate. Without this restriction |x+3| could be arbitrarily large and we could never guarantee the product is small. Aha! The restriction 'cages' the variable factor so it behaves like a constant.",
        },
        {
          expression:
            "|x-3| < 1 \\implies 2 < x < 4 \\implies 5 < x+3 < 7 \\implies |x+3| < 7.",
          annotation:
            "Explicit interval arithmetic. Now |x+3| ≤ 7 no matter where x is inside the cage.",
        },
        {
          expression: "|x^2 - 9| < 7 |x - 3|",
          annotation:
            "Substitute the bound. The error is now controlled by a single factor |x-3| multiplied by the constant 7.",
        },
        {
          expression:
            "We need 7|x - 3| < \\varepsilon \\quad \\iff \\quad |x - 3| < \\frac{\\varepsilon}{7}.",
          annotation: "",
        },
        {
          expression:
            "\\text{Therefore choose } \\delta = \\min\\left(1, \\frac{\\varepsilon}{7}\\right).",
          annotation:
            "Aha! The min does two jobs at once: it keeps δ ≤ 1 (cage stays closed, bound |x+3| < 7 remains true) AND it keeps δ ≤ ε/7 (error stays below ε). This is the genius of the technique.",
        },
        {
          expression:
            "\\textbf{Formal Proof: } \\text{Let } \\varepsilon > 0. \\text{ Choose } \\delta = \\min\\left(1, \\frac{\\varepsilon}{7}\\right).",
          annotation: "",
        },
        {
          expression:
            "\\text{Assume } 0 < |x - 3| < \\delta.\\quad \\text{Then } |x^2 - 9| = |x-3||x+3| < \\delta \\cdot 7 \\leq \\frac{\\varepsilon}{7} \\cdot 7 = \\varepsilon.\\;\\blacksquare",
          annotation:
            "Full chain: the first inequality uses the bound we proved with the restriction; the second uses the min choice. Every step is justified algebra.",
        },
      ],
      conclusion:
        "The min(1, ε/M) trick is the universal weapon for polynomials. The '1' is just a convenient cage size — you could choose 0.5 or 2; the proof still works. Aha! Without the restriction the variable factor would ruin the inequality. This is why quadratic (and higher) functions still satisfy the ε-δ definition and are continuous.",
    },
    {
      id: "ex-ed-rational",
      title: "ε-δ Proof for 1/x — Full Algebraic Breakdown of the Difference",
      problem:
        "Prove using the ε-δ definition that \\displaystyle\\lim_{x \\to 2} \\frac{1}{x} = \\frac{1}{2}.",
      steps: [
        {
          expression: "\\textbf{Reminder: ε-δ Definition}",
          annotation:
            "We must make |f(x) - L| < ε whenever x is close to 2. Rational functions add the danger that the denominator can approach zero.",
        },
        {
          expression:
            "\\left|\\frac{1}{x} - \\frac{1}{2}\\right| = \\left|\\frac{2 - x}{2x}\\right| = \\frac{|x-2|}{2|x|}",
          annotation:
            "**Step 1 — common denominator:** $\\frac{1}{x} - \\frac{1}{2} = \\frac{2}{2x} - \\frac{x}{2x} = \\frac{2-x}{2x}$. **Step 2 — absolute value:** $\\left|\\frac{2-x}{2x}\\right| = \\frac{|2-x|}{2|x|}$ (the denominator $2|x|$ is positive so it comes straight out). **Step 3:** $|2-x| = |x-2|$ by the symmetry property of absolute values. **Gotcha:** many students drop the 2 in the denominator or forget to flip $2-x$ to $|x-2|$. This simplification is what lets us proceed.",
        },
        {
          expression:
            "\\text{Problem: the factor } \\frac{1}{|x|} \\text{ blows up as x approaches 0. We must keep x away from zero.}",
          annotation:
            "If x gets too close to 0 the error could become huge even if |x-2| is small. This is the new difficulty compared to polynomials.",
        },
        {
          expression:
            "\\textbf{Why we choose δ ≤ 1}: Force |x-2| < 1 so x is trapped in (1,3). Then |x| > 1, which means \\frac{1}{|x|} < 1 (a safe constant bound).",
          annotation:
            "Again, 1 is arbitrary but convenient — it guarantees x stays at least distance 1 from 0. Any number < 2 would work, but 1 is simplest. Without this cage, 1/|x| could be arbitrarily large and ruin the proof.",
        },
        {
          expression:
            "|x-2| < 1 \\implies 1 < x < 3 \\implies |x| > 1 \\implies \\frac{1}{|x|} < 1.",
          annotation:
            "Explicit interval check. Now the dangerous factor is bounded above by 1.",
        },
        {
          expression:
            "\\frac{|x-2|}{2|x|} < \\frac{|x-2|}{2 \\cdot 1} = \\frac{|x-2|}{2}",
          annotation:
            "Substitute the bound we just proved. The error is now controlled by |x-2|/2.",
        },
        {
          expression:
            "We need \\frac{|x-2|}{2} < \\varepsilon \\quad \\iff \\quad |x-2| < 2\\varepsilon.",
          annotation: "",
        },
        {
          expression:
            "\\text{Therefore choose } \\delta = \\min\\left(1, 2\\varepsilon\\right).",
          annotation:
            "The min keeps the cage closed (δ ≤ 1) AND makes the error < ε (δ ≤ 2ε).",
        },
        {
          expression:
            "\\textbf{Formal Proof: } \\text{Let } \\varepsilon > 0.\\text{ Choose } \\delta = \\min(1, 2\\varepsilon).",
          annotation: "",
        },
        {
          expression:
            "\\text{If } 0 < |x-2| < \\delta, \\text{ then } \\left|\\frac{1}{x}-\\frac{1}{2}\\right| = \\frac{|x-2|}{2|x|} < \\frac{\\delta}{2} \\leq \\frac{2\\varepsilon}{2} = \\varepsilon.\\;\\blacksquare",
          annotation:
            "Full chain: the middle inequality uses the bound |x| > 1 that came from the restriction. Every algebraic step above is now justified.",
        },
      ],
      conclusion:
        "Aha! The restriction δ ≤ 1 is not arbitrary — it is the only way to prevent 1/|x| from exploding. The full algebraic simplification of the difference is the key that lets us reduce the problem to controlling |x-2|. Rational functions are continuous wherever defined precisely because we can always build such a cage.",
    },
    {
      id: "ex-ed-disprove",
      title: "Using ε-δ to Prove a Limit Does NOT Exist (Oscillating Wildly)",
      problem:
        "Prove that \\displaystyle\\lim_{x \\to 0} \\sin\\left(\\frac{1}{x}\\right) does not exist.",
      steps: [
        {
          expression:
            "\\text{Assume for contradiction that the limit equals some L.}",
          annotation:
            "We will show this assumption leads to an impossible statement.",
        },
        {
          expression:
            "\\text{Let } \\varepsilon = \\frac{1}{2}. \\text{ If the limit existed, there would be a } \\delta > 0 \\text{ such that } 0 < |x| < \\delta \\implies \\left|\\sin(1/x) - L\\right| < \\frac{1}{2}.",
          annotation:
            "Pick a fixed ε = 1/2 (any positive number works; 1/2 makes the contradiction obvious).",
        },
        {
          expression:
            "\\text{Choose sequence } x_1 = \\frac{1}{2n\\pi + \\pi/2} \\text{ for large integer } n \\text{ so that } \\sin(1/x_1) = 1 \\text{ and } 0 < x_1 < \\delta.",
          annotation:
            "As n → ∞, x₁ → 0. At these points the function hits its maximum +1.",
        },
        {
          expression:
            "\\text{Choose sequence } x_2 = \\frac{1}{2n\\pi - \\pi/2} \\text{ for large integer } n \\text{ so that } \\sin(1/x_2) = -1 \\text{ and } 0 < x_2 < \\delta.",
          annotation:
            "Same n works for both; x₂ → 0 and the function hits its minimum -1.",
        },
        {
          expression:
            "\\text{Apply the supposed } \\delta \\text{ to } x_1\\text{: } |1 - L| < \\tfrac{1}{2} \\implies L > \\tfrac{1}{2}.",
          annotation: "",
        },
        {
          expression:
            "\\text{Apply the supposed } \\delta \\text{ to } x_2\\text{: } |-1 - L| < \\tfrac{1}{2} \\implies L < -\\tfrac{1}{2}.",
          annotation: "",
        },
        {
          expression:
            "L > 1/2 and L < -1/2 is impossible for any real number L. Contradiction.\\;\\blacksquare",
          annotation:
            "Aha! The function keeps jumping between values that are distance 2 apart, no matter how small the neighborhood around 0. No single L can stay within ½ of both.",
        },
      ],
      conclusion:
        "The ε-δ definition fails because we can always find points arbitrarily close to 0 where the function values differ by more than any fixed ε. This is the rigorous way to say 'the function oscillates infinitely often and never settles.'",
    },
    {
      id: "ex-ed-absolute-value",
      title: "Real-World ε-δ: How Precisely Must a Sensor Be Calibrated?",
      problem:
        "A thermometer reads T(x) = 100 + 0.3x − 0.01x² °C (x = voltage in mV). At x = 10 mV the true temperature is 102°C. To guarantee the reading stays within ±0.5°C of 102°C, how precisely must the voltage be controlled?",
      steps: [
        {
          expression:
            "|T(x) - 102| = |−0.01x² + 0.3x − 2| = 0.01 |x² - 30x + 200|",
          annotation:
            "Output error (temperature reading error). Factor the quadratic.",
        },
        {
          expression: "= 0.01 |(x-10)(x-20)| = 0.01 |x-10| \\cdot |x-20|",
          annotation:
            "Completely factored. Error is proportional to input deviation |x-10| times the variable |x-20|.",
        },
        {
          expression:
            "\\text{Restrict } |x-10| < 1 \\implies 9 < x < 11 \\implies |x-20| < 11.",
          annotation:
            "Why 1? It creates a tiny safe interval around the operating point x=10 so |x-20| cannot get larger than 11. Any positive number < 10 would work; 1 is convenient.",
        },
        {
          expression: "|T(x)-102| < 0.01 \\cdot |x-10| \\cdot 11 = 0.11 |x-10|",
          annotation: "Substitute the bound we just created.",
        },
        {
          expression: "We need 0.11 |x-10| < 0.5 \\implies |x-10| < 4.55.",
          annotation: "",
        },
        {
          expression:
            "\\text{Therefore } \\delta = \\min(1, 4.55) = 1 \\text{ mV}.",
          annotation:
            "The binding constraint is the cage δ ≤ 1. Voltage must stay within ±1 mV of 10 mV.",
        },
      ],
      conclusion:
        "Aha! This is exactly how every sensor, scale, or medical device is calibrated in the real world. Given an allowed output error ε, we solve for the required input precision δ using the same ε-δ logic. The restriction step ensures the model stays well-behaved near the operating point.",
    },
    {
      id: "ex-ed-graph-delta",
      title: "Graph-First Method — Why the min Appears Visually",
      problem:
        "For f(x) = \\sqrt{x+1} at a = 3, L = 2, ε = 0.5, use the graph-box method to discover a valid δ.",
      visualizationId: "EpsilonDelta",
      params: {
        fn: "Math.sqrt(x+1)",
        c: 3,
        L: 2,
        getDelta:
          "Math.min(3 - (Math.pow(2-e, 2) - 1), (Math.pow(2+e, 2) - 1) - 3)",
      },
      steps: [
        {
          expression:
            "Draw the horizontal ε-strip: y = 2 ± 0.5 (i.e., y = 1.5 and y = 2.5).",
          annotation:
            "These lines represent every y-value we are willing to accept as 'close enough' to L.",
        },
        {
          expression:
            "Find intersection points: \\sqrt{x+1}=2.5 \\implies x=5.25; \\quad \\sqrt{x+1}=1.5 \\implies x=1.25.",
          annotation:
            "Where the graph crosses the top and bottom of the strip.",
        },
        {
          expression:
            "Right distance: |5.25 - 3| = 2.25. Left distance: |1.25 - 3| = 1.75.",
          annotation: "",
        },
        {
          expression: "\\delta = \\min(2.25, 1.75) = 1.75.",
          annotation:
            "Aha! The graph itself forces us to take the smaller distance. This is exactly why the min appears in every algebraic proof — it guarantees the entire interval around a stays inside the ε-strip on both sides.",
        },
      ],
      conclusion:
        "The graph method and the algebraic min-trick are two views of the same idea. The smaller side always wins so both left and right approaches stay inside the tolerance band.",
    },
    {
      id: "ex-ed-proof-workflow",
      title:
        "The Universal Scratch-Then-Formal ε-δ Workflow (Template for All Nonlinear Proofs)",
      problem:
        "Prove \\displaystyle\\lim_{x \\to 2} x^2 = 4 using the complete workflow.",
      steps: [
        {
          expression: "\\textbf{Scratch Work Phase (Planning)}",
          annotation:
            "We always start here to discover δ before writing the formal proof.",
        },
        {
          expression: "|x^2 - 4| = |x-2| \\cdot |x+2|",
          annotation: "Factor to isolate the controllable piece.",
        },
        {
          expression: "|x-2| < 1 \\implies 1 < x < 3 \\implies |x+2| < 5.",
          annotation:
            "Restriction cage (δ ≤ 1) — this is the step that bounds the variable factor. Why 1? Simple symmetric interval that works.",
        },
        {
          expression: "|x^2 - 4| < 5 |x - 2|",
          annotation: "Now the error is 5 times the controllable factor.",
        },
        {
          expression:
            "\\delta = \\min\\left(1, \\frac{\\varepsilon}{5}\\right).",
          annotation: "Min keeps the cage closed AND makes error < ε.",
        },
        {
          expression: "\\textbf{Formal Proof Phase}",
          annotation:
            "Now we write the clean version using what we discovered.",
        },
        {
          expression:
            "Let ε > 0. Choose δ = min(1, ε/5). Assume 0 < |x-2| < δ.",
          annotation: "",
        },
        {
          expression:
            "Then |x^2-4| = |x-2||x+2| < δ · 5 ≤ (ε/5)·5 = ε.\\;\\blacksquare",
          annotation:
            "Full chain. Every inequality is justified by either the restriction or the min choice.",
        },
      ],
      conclusion:
        "This two-phase workflow (scratch → formal) is the reliable template you can use for any polynomial, rational, or root function. The restriction step and the min are not optional — they are what make the proof work when the function is nonlinear. Master this pattern and every ε-δ proof becomes straightforward.",
    },
  ],

  story: {
    title: "The Skeptic's Game",
    subtitle:
      'For 150 years, calculus worked but nobody could prove why. The ε-δ definition fixed that — by turning "getting close" into a game you can always win.',
    acts: [
      {
        label: "The Scene",
        title: "A Challenge That Broke Mathematics",
        content: `The year is 1734. Calculus has been around for 60 years. Newton used it to predict planetary orbits. Leibniz used it to solve curves no one had solved before. Engineers are building things with it.

And a bishop named George Berkeley publishes a pamphlet that breaks everything.

He asks: what exactly is $dx$? When you compute a derivative, you write $\\frac{dy}{dx}$ and treat $dx$ as a tiny number — small enough to ignore when convenient, but nonzero when you need to divide by it. Berkeley calls this contradictory. He writes:

> *"And what are these fluxions? The velocities of evanescent increments. And what are these same evanescent increments? They are neither finite quantities, nor quantities infinitely small, nor yet nothing. May we not call them the ghosts of departed quantities?"*

He is right. Nobody can answer him. For 90 years, the foundation of calculus is officially a mystery.

Then in 1821, a French mathematician named Augustin-Louis Cauchy publishes a textbook. He does not use infinitesimals. He does not appeal to motion or intuition. He uses only two numbers — which we now call $\\epsilon$ and $\\delta$ — and rewrites the entire definition of a limit as a game you play with a skeptic. A game you can always win, if the limit is real.

Berkeley's ghost was finally caught.`,
      },
      {
        label: "Act I",
        title: 'Translating "Close" into Numbers — Error and Tolerance',
        content: `Before the definition, we need one tool: **absolute value as distance (error)**.

The **absolute value** of a number $a$, written $|a|$, is its distance from zero on the number line.
- $|3| = 3$ — three steps from zero
- $|-3| = 3$ — also three steps from zero, in the other direction
- $|0| = 0$ — already at zero

**The distance (or error) between two numbers** $a$ and $b$ is $|a - b|$.
- Error between 5 and 3: $|5 - 3| = 2$
- Error between 3 and 5: $|3 - 5| = |-2| = 2$

Same answer either way — distance does not have a direction.

---

**Translating "close" into a checkable inequality:**

When we say "$x$ is close to 3," we mean the input error $|x - 3|$ (the distance from $x$ to 3) is small.

When we say "$f(x)$ is close to 7," we mean the output error $|f(x) - 7|$ (the distance from the output to the target) is small.

The $\\epsilon$-$\\delta$ definition replaces every fuzzy word — "close," "approaching," "nearly" — with a precise inequality:

| Fuzzy language | Precise meaning |
|---|---|
| "$x$ is close to 3" | input error $\\|x - 3\\| < \\delta$ |
| "$f(x)$ is close to 7" | output error $\\|f(x) - 7\\| < \\epsilon$ |
| "as close as you want" | for any tolerance $\\epsilon > 0$ you name |
| "I can guarantee it" | I can find a $\\delta$ that makes it true |

**The key rule for solving these inequalities:** $|A| < r$ means the same thing as $-r < A < r$.

Why? $|A|$ is the distance from $A$ to zero. Saying that distance is less than $r$ means $A$ is inside the window $(-r, r)$ — between $-r$ and $r$.

**Example:** $|x - 3| < 0.25$ means $-0.25 < x - 3 < 0.25$. Add 3 to all parts: $2.75 < x < 3.25$. So $x$ is within 0.25 of 3.`,
      },
      {
        label: "Act II",
        title: "The Game — Play It First, Understand It After",
        content: `You claim: $\\lim_{x \\to 3}(2x + 1) = 7$.

A skeptic does not believe you. They challenge you with an **output tolerance** $\\epsilon$ — how close the output must be to 7. You respond with an **input tolerance** $\\delta$ — how close you will keep $x$ to 3. If your $\\delta$ works, you win the round.

**The rules:**
- Skeptic picks $\\epsilon$ (output demand). You have no say.
- You pick $\\delta$ (input restriction). You respond to $\\epsilon$.
- You win if: restricting input to within $\\delta$ of 3 forces output within $\\epsilon$ of 7.

---

**Round 1**

> **Skeptic:** "I bet $f(x)$ won't stay within $\\pm 0.5$ of 7. Prove it does."
> **You:** "Fine. Keep $x$ within $\\pm 0.25$ of 3."
> **Check:** output error $= 2 \\times 0.25 = 0.5$. ✓ You win.

**Round 2**

> **Skeptic:** "Tighter. Stay within $\\pm 0.01$ of 7."
> **You:** "Keep $x$ within $\\pm 0.005$ of 3."
> **Check:** output error $= 2 \\times 0.005 = 0.01$. ✓ You win.

**Round 3**

> **Skeptic:** "Within $\\pm 0.000001$ of 7."
> **You:** "Keep $x$ within $\\pm 0.0000005$ of 3."
> **Check:** $2 \\times 0.0000005 = 0.000001$. ✓ You win.

---

**The pattern:** every time, you just cut the skeptic's number in half. Output moves twice as fast as input, so you need half the input room to match the output demand.

**The microscope view:** think of the skeptic handing you a more and more powerful microscope — $10\\times$, $1{,}000\\times$, $1{,}000{,}000\\times$. No matter how much they zoom in on the output, you can always zoom in twice as much on the input and the function stays right on target. That is what "$\\lim_{x \\to 3} f(x) = 7$" really means: the limit survives any level of magnification.

The skeptic can demand any precision. You can always deliver it. **The limit is real.**`,
      },
      {
        label: "Act III",
        title: "The Gear Ratio — Why δ Depends on the Machine",
        content: `You won every round by halving the skeptic's number. But don't let that trick you into thinking $\\delta$ is always $\\epsilon/2$. That fraction is the **gear ratio of your specific machine** — and it changes with every function.

---

**The machine analogy:**

Think of $f(x) = 2x + 1$ as a mechanical assembly. The coefficient $2$ tells you the gear ratio. For every $1$ unit you move the input dial ($x$), the output needle ($f(x)$) jumps $2$ units. It's a high-speed setup — the output is faster than the input.

Because the output moves **twice as fast** as your hand, you have to be **twice as steady**. If the skeptic demands the needle stay within $\\pm\\epsilon$, you must restrict your hand to $\\pm\\epsilon/2$.

---

**What changes when the machine changes:**

| Machine | Gear ratio | Strategy |
|---|---|---|
| $f(x) = 2x$ | $2:1$ (output 2× faster) | $\\delta = \\epsilon/2$ (be twice as precise) |
| $f(x) = 10x$ | $10:1$ (output 10× faster) | $\\delta = \\epsilon/10$ (be ten times as precise) |
| $f(x) = 0.1x$ | $1:10$ (reduction gear) | $\\delta = 10\\epsilon$ (you can be sloppier than the skeptic) |
| $f(x) = x^2$ near $x=3$ | roughly $6:1$ (varies!) | $\\delta$ depends on where you are on the curve |

The last row is the key insight: **for a curve, the gear ratio shifts as you move**. Near $x = 3$, the slope of $x^2$ is $2(3) = 6$, so the output moves about 6 times faster than the input near that point. The gear ratio is the derivative — that is not a coincidence.

The gear ratio is the derivative — that connection runs through all of calculus.`,
      },
      {
        label: "Act IV",
        title: "The Algebra Cheat Code — Reverse-Engineering Any Machine",
        content: `Now that you know the gear ratio is the key, here is the algebra procedure that finds it for **any** machine the skeptic throws at you.

The four steps are always the same — only the function changes.

---

**Step 1 — Start at the goal** (what the skeptic demands):
\\[|f(x) - L| < \\epsilon\\]

This is the finish line. Everything else is working backwards to find the starting condition.

**Step 2 — Open the hood** (substitute the actual formula for $f(x)$):
\\[|(2x + 1) - 7| < \\epsilon\\]

Replace the abstract $f(x)$ with the concrete machine. Now the algebra can begin.

**Step 3 — Simplify until the input error $|x - c|$ appears**:
\\[|2x - 6| < \\epsilon\\]
\\[2|x - 3| < \\epsilon\\]

First we simplified $2x + 1 - 7 = 2x - 6$ inside the absolute value. Then we factored using $|ab| = |a||b|$: $|2(x-3)| = 2|x-3|$. The gear ratio — the $2$ out front — is now visible.

**Step 4 — Isolate the input error** (divide by the gear ratio):
\\[|x - 3| < \\frac{\\epsilon}{2}\\]

The number you divide by is the gear ratio. That quotient is your $\\delta$.

---

**The result:** $\\delta = \\dfrac{\\epsilon}{2}$.

For a 10-speed machine ($f(x) = 10x$), step 3 would give $10|x - c| < \\epsilon$, so step 4 gives $\\delta = \\epsilon/10$.

For a reduction gear ($f(x) = 0.1x$), step 3 gives $0.1|x - c| < \\epsilon$, so $\\delta = 10\\epsilon$ — you can be ten times sloppier than the skeptic.

The four steps are always the same. The gear ratio is whatever coefficient falls out in step 3.`,
      },
      {
        label: "Act V",
        title: "The Formal Definition — Every Word Earns Its Place",
        content: `Now write the game as a single precise statement.

**The $\\epsilon$-$\\delta$ definition of a limit:**

$\\lim_{x \\to c} f(x) = L$ means:

> For every $\\epsilon > 0$, there exists $\\delta > 0$ such that: if $0 < |x - c| < \\delta$, then $|f(x) - L| < \\epsilon$.

Every word carries weight:

**"For every $\\epsilon > 0$"** — the skeptic moves first. They pick any positive tolerance, no matter how small. You have no say in what $\\epsilon$ is.

**"there exists $\\delta > 0$"** — you respond. You must produce a specific positive $\\delta$ that works for the $\\epsilon$ you were given. You cannot pick $\\epsilon$; you respond to it.

**"such that"** — your $\\delta$ must make the following guarantee true.

**"if $0 < |x - c| < \\delta$"** — $x$ is within $\\delta$ of $c$, AND $x \\neq c$. Translated using our absolute value rule: $c - \\delta < x < c + \\delta$ with $x \\neq c$. The strict $0 < |x - c|$ excludes the point $x = c$ itself — the limit describes approach, not arrival.

**"then $|f(x) - L| < \\epsilon$"** — the output lands within $\\epsilon$ of $L$. This is the guarantee you must deliver.

The definition says nothing about infinity, motion, or time. It is a statement about numbers and inequalities — checkable, algebraic, airtight.`,
      },
      {
        label: "Act VI",
        title: "Writing the Proof — Two Phases, Every Step Shown",
        content: `**Claim:** $\\lim_{x \\to 3}(2x + 1) = 7$.

Every $\\epsilon$-$\\delta$ proof has two phases. Phase 1 is private scratch work — you find what $\\delta$ needs to be. Phase 2 is the public proof — you use that $\\delta$ to deliver the guarantee. The audience only sees Phase 2, but Phase 1 is where the real thinking happens.

---

**Phase 1 — Scratch work (work backwards from the goal).**

Goal: make $|f(x) - 7| < \\epsilon$.

**Step 1:** Expand $|f(x) - 7|$ completely.
\\[|f(x) - 7| = |(2x + 1) - 7|\\]

**Step 2:** Simplify inside the absolute value.
\\[|(2x + 1) - 7| = |2x - 6|\\]

**Step 3:** Factor out the constant using $|ab| = |a||b|$.
\\[|2x - 6| = |2(x - 3)| = |2| \\cdot |x - 3| = 2|x - 3|\\]

**Step 4:** Now we have $|f(x) - 7| = 2|x - 3|$. We need this to be $< \\epsilon$:
\\[2|x - 3| < \\epsilon\\]

**Step 5:** Divide both sides by 2:
\\[|x - 3| < \\frac{\\epsilon}{2}\\]

This tells us: if we restrict $|x - 3| < \\dfrac{\\epsilon}{2}$, the output error will be $< \\epsilon$.

**Choose:** $\\delta = \\dfrac{\\epsilon}{2}$.

---

**Phase 2 — The formal proof (write it forward, cleanly).**

*Proof.* Let $\\epsilon > 0$ be given. Set $\\delta = \\dfrac{\\epsilon}{2}$.

Suppose $0 < |x - 3| < \\delta$. Then:

\\[|f(x) - 7| = |(2x+1) - 7| = |2x - 6| = 2|x - 3| < 2\\delta = 2 \\cdot \\frac{\\epsilon}{2} = \\epsilon\\]

Therefore $|f(x) - 7| < \\epsilon$. $\\square$

---

**The structure of Phase 2 is always the same chain:**

start from $|x - c| < \\delta$ $\\longrightarrow$ algebra $\\longrightarrow$ arrive at $|f(x) - L| < \\epsilon$.

Phase 1 is doing that chain in reverse to find $\\delta$. Phase 2 runs it forward as a clean proof.`,
      },
      {
        label: "Act VII",
        title: "Why the Definition Requires 0 < |x − c| — and What It Means",
        content: `One detail of the definition is subtle enough to deserve its own act.

The condition is $0 < |x - c| < \\delta$, not just $|x - c| < \\delta$.

The $0 < |x - c|$ part means $x \\neq c$. We explicitly exclude the point $x = c$ itself.

**Why?**

Because a limit describes what $f(x)$ approaches as $x$ gets close to $c$ — it says nothing about $f(c)$. This matters in three important cases:

**Case 1: $f(c)$ is undefined.**

$f(x) = \\dfrac{x^2 - 9}{x - 3}$ is undefined at $x = 3$ (division by zero). But:
\\[\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = \\lim_{x \\to 3} \\frac{(x-3)(x+3)}{x-3} = \\lim_{x \\to 3}(x + 3) = 6\\]

The limit is 6 even though $f(3)$ does not exist. The $\\epsilon$-$\\delta$ definition handles this correctly because it only talks about $x$ values near $c$, never $x = c$.

**Case 2: $f(c)$ exists but does not equal the limit.**

Define $f(x) = 2x + 1$ for $x \\neq 3$ and $f(3) = 100$. The limit is still 7 — the spike at $x = 3$ is irrelevant because the definition excludes it.

**Case 3: $f(c)$ exists and equals the limit.** This is the continuous case — the "nice" situation. But the definition does not require it.

This is why the limit and the function value are separate concepts. Continuity is the special case where they agree: $f$ is continuous at $c$ if and only if $\\lim_{x \\to c} f(x) = f(c)$.`,
      },
    ],
    resolution: `**The $\\epsilon$-$\\delta$ definition:**

$\\lim_{x \\to c} f(x) = L$ if and only if: for every $\\epsilon > 0$, there exists $\\delta > 0$ such that $0 < |x - c| < \\delta$ implies $|f(x) - L| < \\epsilon$.

**The two-phase proof template:**

1. **Scratch work** — work backwards from $|f(x) - L| < \\epsilon$. Use $|ab| = |a||b|$ to factor $|f(x) - L|$ into a constant times $|x - c|$. Divide $\\epsilon$ by that constant to get $\\delta$.
2. **Formal proof** — let $\\epsilon > 0$ be given. State your $\\delta$. Assume $0 < |x - c| < \\delta$. Chain forward: expand $|f(x) - L|$, simplify, substitute $\\delta$, arrive at $\\epsilon$.

**The vocabulary:**
- $\\epsilon$ (epsilon): the output tolerance — how close $f(x)$ must be to $L$
- $\\delta$ (delta): the input tolerance — how close $x$ must be to $c$
- $|A| < r$ always means $-r < A < r$ — translate every absolute value inequality this way

**Why this matters:** every theorem in calculus that says "continuous functions do X" or "differentiable functions do Y" ultimately rests on this definition. The Intermediate Value Theorem, the Extreme Value Theorem, the Mean Value Theorem — all their proofs come back to $\\epsilon$ and $\\delta$. The definition did not change a single answer Newton computed. It proved that his answers were right.`,
  },

  challenges: [
    {
      id: "ch1-ed-c1",
      difficulty: "easy",
      problem: "Use ε-δ to prove \\displaystyle\\lim_{x \\to 5} (4x + 1) = 21.",
      hint: "Compute |f(x) − 21| = |4x+1−21| = |4x−20| = 4|x−5|. Choose δ = ε/4.",
      walkthrough: [
        {
          expression: "|(4x+1) - 21| = |4x-20| = 4|x-5|",
          annotation: "Output error = 4 × input error.",
        },
        {
          expression:
            "\\text{Need: } 4|x-5| < \\varepsilon \\iff |x-5| < \\varepsilon/4",
          annotation: "",
        },
        {
          expression:
            "\\text{Let } \\delta = \\varepsilon/4. \\text{ Then } |(4x+1)-21| = 4|x-5| < 4\\delta = \\varepsilon.\\;\\blacksquare",
          annotation: "",
        },
      ],
      answer: "δ = ε/4",
    },
    {
      id: "ch1-ed-c2",
      difficulty: "medium",
      problem: "Prove \\displaystyle\\lim_{x \\to 1} (x^2 + 2x) = 3 using ε-δ.",
      hint: "|x²+2x−3| = |(x−1)(x+3)|. Restrict δ ≤ 1 so |x+3| < 5.",
      walkthrough: [
        {
          expression: "|x^2+2x-3| = |(x-1)(x+3)| = |x-1||x+3|",
          annotation: "",
        },
        {
          expression:
            "\\delta \\leq 1 \\implies 0 < x < 2 \\implies 3 < x+3 < 5 \\implies |x+3| < 5",
          annotation: "",
        },
        {
          expression:
            "|x^2+2x-3| < 5|x-1|. \\text{ Need: } 5|x-1| < \\varepsilon \\iff |x-1| < \\varepsilon/5",
          annotation: "",
        },
        {
          expression: "\\delta = \\min(1, \\varepsilon/5).\\;\\blacksquare",
          annotation: "",
        },
      ],
      answer: "δ = min(1, ε/5)",
    },
    {
      id: "ch1-ed-c3",
      difficulty: "hard",
      problem: "Prove \\displaystyle\\lim_{x \\to 4} \\sqrt{x} = 2 using ε-δ.",
      hint: "|√x − 2| = |x−4|/(√x + 2). Since √x + 2 ≥ 2, we get |√x−2| ≤ |x−4|/2. So δ = 2ε works.",
      walkthrough: [
        {
          expression:
            "|\\sqrt{x} - 2| = \\frac{|\\sqrt{x}-2||\\sqrt{x}+2|}{|\\sqrt{x}+2|} = \\frac{|x-4|}{\\sqrt{x}+2}",
          annotation:
            "Rationalize by multiplying and dividing by the conjugate √x + 2.",
        },
        {
          expression:
            "\\sqrt{x}+2 \\geq 0+2 = 2 \\quad \\text{(for } x \\geq 0\\text{)}",
          annotation:
            "The denominator is at LEAST 2, so the fraction is at MOST |x−4|/2.",
        },
        {
          expression: "|\\sqrt{x}-2| \\leq \\frac{|x-4|}{2}",
          annotation: "No min trick needed! The bound works for all x ≥ 0.",
        },
        {
          expression:
            "\\text{Need: } \\frac{|x-4|}{2} < \\varepsilon \\iff |x-4| < 2\\varepsilon",
          annotation: "",
        },
        {
          expression:
            "\\delta = 2\\varepsilon. \\text{ Then } |\\sqrt{x}-2| \\leq \\frac{|x-4|}{2} < \\frac{2\\varepsilon}{2} = \\varepsilon.\\;\\blacksquare",
          annotation: "",
        },
      ],
      answer: "δ = 2ε",
    },
    {
      id: "ch1-ed-c4",
      difficulty: "hard",
      problem:
        "Prove $\\displaystyle\\lim_{x \\to 2}(x^2 + 3x) = 10$ using ε–δ.",
      hint: "Factor: $|x^2+3x-10| = |(x-2)(x+5)|$. Restrict $\\delta \\leq 1$ so that $x \\in (1,3)$ and $|x+5| < 8$.",
      walkthrough: [
        {
          expression: "|x^2 + 3x - 10| = |(x-2)(x+5)| = |x-2|\\cdot|x+5|",
          annotation: "Factor the output error.",
        },
        {
          expression:
            "\\delta \\leq 1 \\Rightarrow 1 < x < 3 \\Rightarrow 6 < x+5 < 8 \\Rightarrow |x+5| < 8",
          annotation: "Cage x near 2 to bound the variable factor.",
        },
        {
          expression:
            "|(x^2+3x)-10| < 8|x-2|. \\text{ Need: } 8|x-2| < \\varepsilon \\Rightarrow |x-2| < \\varepsilon/8",
          annotation: "",
        },
        {
          expression:
            "\\delta = \\min(1,\\, \\varepsilon/8). \\quad |x^2+3x-10| < 8\\delta \\leq 8 \\cdot \\frac{\\varepsilon}{8} = \\varepsilon.\\;\\blacksquare",
          annotation:
            "Both the cage (δ≤1) and the bound (δ≤ε/8) are satisfied simultaneously.",
        },
      ],
      answer: "δ = min(1, ε/8)",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "inequalities",
      label: "Prerequisite: Properties of Inequalities",
      context:
        "Epsilon-Delta proofs rely entirely on chaining inequalities safely, especially utilizing the Triangle Inequality.",
    },
    {
      lessonSlug: "introduction",
      label: "Previous: Intro to Limits",
      context:
        "The informal definition of a limit — the ε-δ definition makes it rigorous.",
    },
    {
      lessonSlug: "continuity",
      label: "See Also: Continuity",
      context:
        "Continuity at c means lim f(x) = f(c) — which is an ε-δ statement.",
    },
    {
      lessonSlug: "squeeze-theorem",
      label: "Next: Squeeze Theorem",
      context:
        "The Squeeze Theorem is proved using ε-δ — it is a consequence of this definition.",
    },
  ],

  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "ε (epsilon)",
        meaning: "the output tolerance — how close f(x) must stay to L",
      },
      {
        symbol: "δ (delta)",
        meaning:
          "the input radius you choose — if x stays within δ of c, then f(x) stays within ε of L",
      },
      {
        symbol: "0 < |x-c| < δ",
        meaning: "x is close to c but not equal to c (strict inequality)",
      },
      {
        symbol: "|f(x) - L| < ε",
        meaning: "the output f(x) is within ε of L",
      },
    ],
    rulesOfThumb: [
      "The ε-δ game: your opponent picks ε (any positive number). You must respond with a δ that works.",
      "For polynomials: start by factoring |f(x)-L|. Bound the extra factor near c, then choose δ = min(1, ε/bound).",
      'The phrase "for all ε>0 there exists δ>0" is the formal structure of every limit proof.',
      "Direct substitution is the informal version of ε-δ for continuous functions.",
    ],
  },

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: "ch1-intro-limits",
        label: "Ch. 1: Introduction to Limits (informal)",
        note: "You met the intuition: the limit is what f(x) approaches. ε-δ is the same idea made mathematically rigorous. Epsilon is the output tolerance; delta is the input radius that guarantees it.",
      },
      {
        lessonId: "ch0-inequalities",
        label: "Ch. 0: Inequalities",
        note: "The triangle inequality |a+b| ≤ |a|+|b| appears in every ε-δ proof. Reviewing it now will make the proofs flow naturally.",
      },
    ],
    futureLinks: [
      {
        lessonId: "ch2-tangent-problem",
        label: "Ch. 2: Derivative Definition",
        note: "The derivative is defined as a limit. The ε-δ definition ensures that limit is unambiguously defined. If you ever need to rigorously prove a derivative, ε-δ is the foundation.",
      },
      {
        lessonId: "ch1-continuity",
        label: "Ch. 1: Continuity",
        note: "The ε-δ definition of continuity is: for every ε>0 there exists δ>0 such that |x-c|<δ implies |f(x)-f(c)|<ε. This is the same structure, applied directly at c (not just near c).",
      },
    ],
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "ed-assess-1",
        type: "choice",
        text: "In the ε-δ definition, who chooses ε first?",
        options: [
          "You (the prover)",
          "Your opponent (the challenger)",
          "Both simultaneously",
          "Neither — it is given by the problem",
        ],
        answer: "Your opponent (the challenger)",
        hint: 'The definition says "for ALL ε > 0" — meaning ε is arbitrary, chosen by a challenger. You must respond with a δ that works for that ε.',
      },
      {
        id: "ed-assess-2",
        type: "input",
        text: "To prove lim(x→2) x² = 4 via ε-δ, we need δ = min(1, ε/?). What is the missing number?",
        answer: "5",
        hint: "Near x=2, |x+2| < 5 when δ ≤ 1. So |x²-4| = |x-2||x+2| < δ·5. Set δ = min(1, ε/5).",
      },
    ],
  },

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "ε = output tolerance (any positive, chosen adversarially)",
    "δ = input radius (you choose this in response to ε)",
    "Proof structure: Given ε>0, let δ = …, then |x-c|<δ ⟹ |f(x)-L|<ε",
    "Every limit you know informally has an ε-δ proof behind it",
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "read-rigor",
    "completed-example-1",
    "completed-example-2",
    "completed-example-3",
    "solved-challenge",
  ],

  walkthroughs: [
  {
    id: 'wt-epsdelta-linear-full',
    title: 'Epsilon–Delta (Linear, Fully Narrated)',
    prereqs: ['Limit definition', 'Absolute value properties'],
    svgId: 'WalkthroughViz',
    vizProps: { type: 'limit', fn: '2*x+1', a: 3, xMin: 1, xMax: 5, label: 'f(x)=2x+1' },
    problem: 'Prove from first principles that $\\lim_{x\\to 3}(2x+1)=7$.',

    steps: [
      {
        label: 'Start with the *definition*, not the function',
        visualNote: 'A horizontal band of height $\\varepsilon$ appears around $y=7$. A vertical band of width $\\delta$ appears around $x=3$.',
        strategy: 'We do NOT start by manipulating the function randomly. We start from the epsilon–delta definition and work backward from what we must guarantee.',
        explanation: 'Before touching any algebra, pause and look at what the definition is asking. The graph shows the line $2x+1$ passing through the point $(3,7)$. The epsilon–delta definition does not ask us to compute anything — it asks us to *control behavior*. Specifically: if $x$ stays close enough to 3, then $f(x)$ must stay close to 7. The vertical band (epsilon) is fixed first — we are *given* how tight we want the output. Our job is to figure out how small the horizontal window (delta) must be to force the graph to stay inside that band.',
        math: '0 < |x-3| < \\delta \\;\\Rightarrow\\; |(2x+1)-7| < \\varepsilon',
        conceptRef: 'Formal definition of limit',
      },

      {
        label: 'Translate the problem into a single expression',
        visualNote: 'The vertical distance from the graph to $y=7$ is highlighted as a segment.',
        strategy: 'Everything reduces to controlling ONE quantity: $|f(x)-L|$. If we can rewrite it in terms of $|x-3|$, the problem is solved.',
        explanation: 'The definition tells us exactly what to study: the expression $|f(x)-7|$. This is the vertical distance from the graph to the horizontal line $y=7$. If we can make this distance small by forcing $x$ near 3, we win. So the entire proof becomes an algebra problem: take $|(2x+1)-7|$ and rewrite it until it depends directly on $|x-3|$.',
        math: '|(2x+1)-7|',
      },

      {
        label: 'Simplify — expose the hidden structure',
        visualNote: 'The vertical segment morphs into a scaled horizontal segment.',
        strategy: 'Factor aggressively. Linear functions always collapse into a constant multiple of $|x-a|$.',
        explanation: 'Now we perform the algebra — but notice what we are *looking for*. We want $|x-3|$ to appear. Subtracting 7 from $2x+1$ gives $2x-6$. That may not look helpful yet, but factor out the 2: $2(x-3)$. This is the key moment. The vertical error is not arbitrary — it is exactly twice the horizontal error. The graph confirms this: the slope is 2, so vertical change is 2× horizontal change.',
        math: '|(2x+1)-7| = |2(x-3)| = 2|x-3|',
        gotcha: 'Do not stop at $2x-6$. The factorization is what reveals the relationship to $|x-3|$.',
        conceptRef: 'Absolute value and factoring',
      },

      {
        label: 'Now solve the *inequality*, not the limit',
        visualNote: 'The vertical band is fixed; the horizontal band shrinks in response.',
        strategy: 'We now reverse-engineer $\\delta$. Ask: how small must $|x-3|$ be to force $2|x-3| < \\varepsilon$?',
        explanation: 'At this point, the problem has quietly changed. We are no longer thinking about limits — we are solving an inequality. We need $2|x-3| < \\varepsilon$. The only variable we control is $|x-3|$, so isolate it. Dividing both sides by 2 gives $|x-3| < \\varepsilon/2$. This tells us exactly how tight the horizontal window must be. There is no guesswork here — the algebra dictates the choice.',
        math: '|x-3| < \\frac{\\varepsilon}{2}',
      },

      {
        label: 'Choose $\\delta$ and close the loop',
        visualNote: 'The horizontal band locks to exactly half the vertical tolerance.',
        strategy: 'We define $\\delta$ to be the quantity that guarantees the inequality. Then explicitly verify the implication chain.',
        explanation: 'We now commit: choose $\\delta = \\varepsilon/2$. This is not arbitrary — it is the exact threshold that makes the inequality work. Now we check the logic forward, as the definition requires. Assume $0 < |x-3| < \\delta$. Then $|x-3| < \\varepsilon/2$. Multiply both sides by 2: $2|x-3| < \\varepsilon$. But we already showed $|(2x+1)-7| = 2|x-3|$, so this gives $|(2x+1)-7| < \\varepsilon$. That completes the proof. Notice the structure: we worked backward to find $\\delta$, then forward to verify it.',
        math: '\\delta = \\frac{\\varepsilon}{2}',
        sandbox: {
          value: '\\varepsilon = 0.2',
          rows: [
            { label: '$\\delta$', expr: '0.1' },
            { label: '$2|x-3|$', expr: '< 2(0.1)=0.2\\;\\checkmark' },
          ],
          conclusion: 'The forward check confirms the construction works.',
        },
        conceptRef: 'Structure of epsilon–delta proofs',
      },

      {
        label: 'Interpret what just happened (the missing intuition)',
        visualNote: 'The graph shows a fixed vertical band and a matching horizontal squeeze.',
        strategy: 'Close the abstraction gap — connect algebra back to geometry explicitly.',
        explanation: 'Step back and interpret the result. The entire proof rests on one geometric fact: the line has slope 2. That means any horizontal error is doubled vertically. So to keep the vertical error within $\\varepsilon$, we must restrict the horizontal error to half that size. That is why $\\delta = \\varepsilon/2$. The epsilon–delta definition is not mysterious — it is just a precise way of encoding how steep the graph is near the point.',
      },
    ],

    variations: [
      {
        question: 'What changes if $f(x)=5x+1$ at $x=3$?',
        hint: 'The slope becomes 5, so the vertical error is $5|x-3|$. You will get $\\delta=\\varepsilon/5$.'
      },
      {
        question: 'What if the slope were negative, like $f(x)=-3x+1$?',
        hint: 'Absolute value removes the sign. You still get $3|x-3|$, so $\\delta=\\varepsilon/3$.'
      },
    ],
  },
  {
    id: 'wt-epsdelta-linear',
    title: 'Epsilon–Delta: Linear Function',
    prereqs: ['Limit definition', 'Absolute value manipulation'],
    svgId: 'WalkthroughViz',
    vizProps: { type: 'limit', fn: '2*x+1', a: 3, xMin: 1, xMax: 5, label: 'f(x)=2x+1' },
    problem: 'Prove that $\\lim_{x\\to 3}(2x+1)=7$ using the epsilon–delta definition.',
    steps: [
      {
        label: 'State the epsilon–delta target',
        visualNote: 'A band of height $\\varepsilon$ appears around $y=7$, and a horizontal window $\\delta$ around $x=3$.',
        strategy: 'Start from the definition: we must control $|f(x)-L|$ using $|x-a|$. Everything reduces to rewriting this expression.',
        explanation: 'Look at the graph first. Near $x=3$, the line $2x+1$ passes through $y=7$. The epsilon–delta definition asks: how small must we force $x$ to stay near 3 so that the output stays within a vertical band around 7? This becomes an algebra problem: make $|f(x)-7|$ small by controlling $|x-3|$.',
        math: '|(2x+1)-7| < \\varepsilon',
      },
      {
        label: 'Simplify the expression',
        visualNote: 'The vertical distance collapses into a scaled horizontal distance.',
        strategy: 'Factor the expression to isolate $|x-3|$. Linear functions reduce cleanly with no extra bounding.',
        explanation: 'Now simplify the expression inside the absolute value. The goal is to rewrite everything in terms of $|x-3|$. Subtracting 7 from $2x+1$ gives $2x-6$, which factors cleanly as $2(x-3)$. This is the key moment: the vertical error is exactly 2 times the horizontal error.',
        math: '|(2x+1)-7| = |2(x-3)| = 2|x-3|',
      },
      {
        label: 'Choose $\\delta$ in terms of $\\varepsilon$',
        visualNote: 'The horizontal band shrinks to match the vertical tolerance.',
        strategy: 'Solve $2|x-3| < \\varepsilon$ for $|x-3|$ to determine the correct $\\delta$.',
        explanation: 'We now translate the condition $2|x-3| < \\varepsilon$ into a requirement on $|x-3|$. Dividing both sides by 2 gives $|x-3| < \\varepsilon/2$. This tells us exactly how small the horizontal window must be. So we choose $\\delta = \\varepsilon/2$. This guarantees the vertical error stays within $\\varepsilon$.',
        math: '\\delta = \\frac{\\varepsilon}{2}',
        sandbox: {
          value: '\\varepsilon = 0.1',
          rows: [
            { label: '$\\delta$', expr: '0.05' },
            { label: '$2|x-3|$', expr: '2(0.05)=0.1\\;\\checkmark' },
          ],
          conclusion: 'The bound works exactly as designed.',
        },
        conceptRef: 'Linear scaling of absolute value',
      },
    ],
    variations: [
      { question: 'What if $f(x)=5x-4$ at $x=2$?', hint: 'You will get $|f(x)-6|=5|x-2|$, so $\\delta=\\varepsilon/5$.' },
    ],
  },

  {
    id: 'wt-epsdelta-quadratic',
    title: 'Epsilon–Delta: Quadratic',
    prereqs: ['Factoring', 'Bounding techniques'],
    svgId: 'WalkthroughViz',
    vizProps: { type: 'limit', fn: 'x*x', a: 2, xMin: 0, xMax: 4, label: 'f(x)=x^2' },
    problem: 'Prove that $\\lim_{x\\to 2}x^2=4$ using the epsilon–delta definition.',
    steps: [
      {
        label: 'Rewrite the difference',
        visualNote: 'The vertical gap becomes a product involving $(x-2)$.',
        strategy: 'Factor first — quadratics do not reduce directly to a multiple of $|x-a|$.',
        explanation: 'Start by expanding the difference $|x^2-4|$. This factors as $(x-2)(x+2)$. The key observation is that only one factor matches $|x-2|$ directly — the other must be controlled separately.',
        math: '|x^2-4| = |x-2||x+2|',
      },
      {
        label: 'Bound the extra factor',
        visualNote: 'A horizontal restriction around $x=2$ limits how large $x+2$ can be.',
        strategy: 'Impose a temporary restriction like $|x-2|<1$ to bound $x$ numerically.',
        explanation: 'Here is the subtle step textbooks skip: we cannot directly control $|x+2|$, so we artificially restrict $x$ to stay near 2. If $|x-2|<1$, then $1<x<3$, which means $x+2$ lies between 3 and 5. So $|x+2|<5$. This converts the messy product into something manageable.',
        math: '|x+2| < 5',
        gotcha: 'You must impose a bound before choosing $\\delta$. Otherwise the expression is uncontrollable.',
      },
      {
        label: 'Combine bounds and choose $\\delta$',
        visualNote: 'The vertical band is controlled by shrinking the horizontal window.',
        strategy: 'Use the bound to reduce everything to a multiple of $|x-2|$.',
        explanation: 'Now combine everything: $|x^2-4| = |x-2||x+2| < 5|x-2|$. To ensure this is less than $\\varepsilon$, we need $5|x-2| < \\varepsilon$, or $|x-2| < \\varepsilon/5$. But we must also respect our earlier restriction $|x-2|<1$. So we take the minimum of both conditions.',
        math: '\\delta = \\min\\left(1, \\frac{\\varepsilon}{5}\\right)',
        sandbox: {
          value: '\\varepsilon=0.2',
          rows: [
            { label: '$\\varepsilon/5$', expr: '0.04' },
            { label: '$\\delta$', expr: '0.04' },
          ],
          conclusion: 'Both constraints are satisfied simultaneously.',
        },
        conceptRef: 'Bounding technique for nonlinear limits',
      },
    ],
    variations: [
      { question: 'What if $x^2$ were replaced with $x^2+3x$?', hint: 'Factor the difference and bound the extra term again.' },
    ],
  },

  {
    id: 'wt-epsdelta-rational',
    title: 'Epsilon–Delta: Rational Function',
    prereqs: ['Factoring', 'Inequalities'],
    svgId: 'WalkthroughViz',
    vizProps: { type: 'limit', fn: '(x*x-1)/(x-1)', a: 1, xMin: 0, xMax: 2, label: 'f(x)=(x^2-1)/(x-1)' },
    problem: 'Prove that $\\lim_{x\\to 1}\\frac{x^2-1}{x-1}=2$ using the epsilon–delta definition.',
    steps: [
      {
        label: 'Simplify the function',
        visualNote: 'The curve behaves like a line with a hole at $x=1$.',
        strategy: 'Factor first — rational expressions often simplify before applying epsilon–delta.',
        explanation: 'At first glance the function looks complicated, but factoring reveals the structure. The numerator $x^2-1$ factors as $(x-1)(x+1)$, and for $x\\ne1$ the expression simplifies to $x+1$. So the limit problem reduces to a linear function with a removable hole.',
        math: '\\frac{x^2-1}{x-1} = x+1',
      },
      {
        label: 'Rewrite the difference',
        visualNote: 'The vertical error becomes a simple shift of $|x-1|$.',
        strategy: 'Reduce to absolute value form like the linear case.',
        explanation: 'Now compute the difference from the limit value 2. Substituting gives $|(x+1)-2| = |x-1|$. This is the simplest possible structure — the vertical error equals the horizontal error exactly.',
        math: '|(x+1)-2| = |x-1|',
      },
      {
        label: 'Choose $\\delta$',
        visualNote: 'The horizontal and vertical bands match exactly.',
        strategy: 'Direct comparison — no scaling factor required.',
        explanation: 'Since $|f(x)-2| = |x-1|$, we can guarantee $|f(x)-2| < \\varepsilon$ simply by requiring $|x-1| < \\varepsilon$. No extra constants, no bounding tricks — the structure collapses perfectly.',
        math: '\\delta = \\varepsilon',
        sandbox: {
          value: '\\varepsilon=0.05',
          rows: [
            { label: '$\\delta$', expr: '0.05' },
            { label: '$|x-1|$', expr: '<0.05\\;\\checkmark' },
          ],
          conclusion: 'The function behaves exactly like a line near the hole.',
        },
        conceptRef: 'Limit of simplified rational functions',
      },
    ],
    variations: [
      { question: 'What if the function did not simplify cleanly?', hint: 'You would need bounding like in the quadratic case.' },
    ],
  },
],

  quiz: [
    {
      id: "eps-delta-q1",
      type: "choice",
      text: "In the $\\varepsilon$-$\\delta$ definition, which quantity is chosen first by the challenger?",
      options: [
        "$\\delta$",
        "$\\varepsilon$",
        "Both simultaneously",
        "Neither — the limit $L$ is chosen first",
      ],
      answer: "$\\varepsilon$",
      hints: [
        'The definition says "for every $\\varepsilon > 0$" — the challenger picks $\\varepsilon$, then you find $\\delta$.',
      ],
      reviewSection: "Intuition tab — the ε-δ game",
    },
    {
      id: "eps-delta-q2",
      type: "choice",
      text: "The formal $\\varepsilon$-$\\delta$ definition requires $0 < |x - c| < \\delta$. Why the strict inequality $0 < |x - c|$?",
      options: [
        "To ensure $x$ is greater than $c$",
        "To exclude $x = c$ — the limit only depends on what happens near $c$, not at $c$",
        "To guarantee $\\delta$ is positive",
        "To prevent division by zero",
      ],
      answer:
        "To exclude $x = c$ — the limit only depends on what happens near $c$, not at $c$",
      hints: ["Limits can exist even where the function is undefined."],
      reviewSection: "Math tab — ε-δ formal definition",
    },
    {
      id: "eps-delta-q3",
      type: "input",
      text: "For $f(x) = 2x + 1$ at $c = 3$, $L = 7$: compute $|f(x) - 7|$ in terms of $|x - 3|$. If the answer is $k|x-3|$, what is $k$?",
      answer: "2",
      hints: ["$|f(x) - 7| = |2x + 1 - 7| = |2x - 6| = 2|x - 3|$."],
      reviewSection: "Intuition tab — the ε-δ game for a linear function",
    },
    {
      id: "eps-delta-q4",
      type: "input",
      text: "For $\\lim_{x \\to 3}(2x+1) = 7$, the valid choice of $\\delta$ given $\\varepsilon$ is $\\delta = \\varepsilon / k$. What is $k$?",
      answer: "2",
      hints: [
        "From $|2x+1-7| = 2|x-3| < \\varepsilon$, you need $|x-3| < \\varepsilon/2$.",
      ],
      reviewSection: "Math tab — finding δ for a linear function",
    },
    {
      id: "eps-delta-q5",
      type: "input",
      text: "For $\\lim_{x \\to 5}(4x+1) = 21$, compute $|(4x+1) - 21|$ in terms of $|x-5|$. The answer is $k|x-5|$; what is $k$?",
      answer: "4",
      hints: ["$|(4x+1)-21| = |4x-20| = 4|x-5|$."],
      reviewSection: "Challenges tab — Challenge 1",
    },
    {
      id: "eps-delta-q6",
      type: "input",
      text: "To prove $\\lim_{x \\to 5}(4x+1) = 21$ via $\\varepsilon$-$\\delta$, the correct choice is $\\delta = \\varepsilon / k$. What is $k$?",
      answer: "4",
      hints: ["Need $4|x-5| < \\varepsilon$, so $|x-5| < \\varepsilon/4$."],
      reviewSection: "Challenges tab — Challenge 1",
    },
    {
      id: "eps-delta-q7",
      type: "input",
      text: "For $f(x) = x^2$ near $c = 2$: factor $|x^2 - 4| = |x-2| \\cdot |x+2|$. If we restrict $\\delta \\leq 1$ so $x \\in (1, 3)$, what is the maximum value of $|x + 2|$ on this interval?",
      answer: "5",
      hints: ["On $(1, 3)$: $x + 2 \\in (3, 5)$, so $|x+2| < 5$."],
      reviewSection: "Math tab — ε-δ for f(x) = x² at c = 2",
    },
    {
      id: "eps-delta-q8",
      type: "input",
      text: "Using the result that $|x^2 - 4| < 5|x-2|$ near $c=2$, what is the correct choice of $\\delta$ to prove $\\lim_{x \\to 2} x^2 = 4$? Express as $\\min(1, \\varepsilon/k)$ — what is $k$?",
      answer: "5",
      hints: [
        "Need $5|x-2| < \\varepsilon$, so $|x-2| < \\varepsilon/5$. Use $\\delta = \\min(1, \\varepsilon/5)$.",
      ],
      reviewSection: "Math tab — ε-δ for nonlinear functions (min trick)",
    },
    {
      id: "eps-delta-q9",
      type: "choice",
      text: "For $f(x) = mx + b$ (a linear function), the correct $\\delta$ to prove $\\lim_{x \\to c} f(x) = mc + b$ is:",
      options: [
        "$\\delta = \\varepsilon$",
        "$\\delta = \\varepsilon / |m|$",
        "$\\delta = |m| \\cdot \\varepsilon$",
        "$\\delta = \\varepsilon / b$",
      ],
      answer: "$\\delta = \\varepsilon / |m|$",
      hints: [
        "$|f(x) - L| = |m(x-c)| = |m||x-c| < \\varepsilon$ requires $|x-c| < \\varepsilon/|m|$.",
      ],
      reviewSection: "Math tab — two-phase ε-δ strategy",
    },
    {
      id: "eps-delta-q10",
      type: "input",
      text: "To prove $\\lim_{x \\to 1}(x^2 + 2x) = 3$, factor $|x^2+2x-3| = |x-1||x+3|$. Restricting $\\delta \\leq 1$ gives $x \\in (0, 2)$, so $|x+3| < k$. What is $k$?",
      answer: "5",
      hints: ["On $(0,2)$: $x + 3 \\in (3, 5)$, so $|x+3| < 5$."],
      reviewSection: "Challenges tab — Challenge 2",
    },
  ],
};
