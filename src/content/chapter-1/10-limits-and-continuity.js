export default {
  id: 'limits-and-continuity',
  slug: 'limits-and-continuity',
  chapter: 1,
  order: 10,
  title: 'Limits & Continuity — Chapter Review',
  subtitle: 'Tying together every tool from Chapter 1 before crossing into derivatives',
  tags: ['limits', 'continuity', 'epsilon-delta', 'squeeze theorem', 'one-sided limits', 'review', 'chapter 1'],
  aliases: 'limits continuity review chapter 1 synthesis epsilon delta squeeze theorem one sided limits factoring holes jumps',

  hook: {
    question: 'You have learned limits near a point, limit laws, continuity and its failures, epsilon-delta proofs, the Squeeze Theorem, trig limits, and limits at infinity. Every one of those tools solves a different piece of the same puzzle. This lesson assembles the full picture — and shows you exactly where each piece fits before you step into Chapter 2.',
    realWorldContext: 'The limit concept is the hinge between algebra and calculus. Without it, instantaneous velocity is just a phrase, not a number. Without it, the area under a curve is a picture, not a computation. This review locks in the limit intuition so that when derivatives and integrals arrive, the foundations do not wobble.',
    previewVisualizationId: 'Ch1Review',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Chapter 1 began with a deceptively simple question — what does a function approach near a point it may never actually reach? From that one question, an entire toolkit grew: limit laws for combining limits, continuity for classifying function behavior, epsilon-delta for making "approaches" rigorous, the Squeeze Theorem for limits that resist direct calculation, and limits at infinity for end behavior. This lesson is the synthesis. Its job is to show how those tools connect to each other, not just how to use each one in isolation.',

      'Start with the core idea. A limit lim(x→a) f(x) = L is a prediction, not an evaluation. It asks: if x gets arbitrarily close to a (from either side, but without equaling a), what value does f(x) get close to? The answer L is determined entirely by the behavior of f *around* a — what happens exactly *at* a is irrelevant. This is what makes limits powerful: they work even when the function has a hole, a jump, or is simply undefined at the target point.',

      'There are four complementary ways to see this, and each one builds a different part of your intuition. The **visual perspective**: a graph of f(x) = (x²−1)/(x−1) has a hole at x = 1, but zoom into either side and the function is clearly approaching y = 2. The limit is 2 even though f(1) is undefined. The **numerical perspective**: plug in x = 0.9, 0.99, 0.999 from the left and x = 1.1, 1.01, 1.001 from the right. Both sequences converge to 2. The convergence from both sides is what makes it a two-sided limit. The **algebraic perspective**: factor x²−1 = (x−1)(x+1), cancel the (x−1) factor (valid since x ≠ 1 in a limit), and get x+1, which equals 2 at x = 1. The **conceptual perspective**: a limit is a *promise*. If you covered x = 1 and asked "based on the pattern, what should f(1) be?" — the limit answers that question. Continuity means the function keeps the promise.',

      'Continuity is limit equality at the point. A function f is continuous at x = a if all three conditions hold: (1) f(a) is defined, (2) lim(x→a) f(x) exists (both one-sided limits agree), and (3) those two values are equal. Fail any one condition and you have a discontinuity — removable (a hole), jump (the two sides disagree), or infinite (a vertical asymptote). The type of failure tells you exactly what went wrong.',

      'One-sided limits are the tool for discontinuities. The left-hand limit lim(x→a⁻) f(x) asks only about x < a; the right-hand limit lim(x→a⁺) asks only about x > a. The two-sided limit exists if and only if both one-sided limits exist and are equal. Piecewise functions and absolute value expressions often require separate left and right analysis.',

      'The Squeeze Theorem handles limits where neither substitution nor algebra works — typically when a bounded oscillating factor is multiplied by a vanishing factor. If g(x) ≤ f(x) ≤ h(x) near a, and lim g = lim h = L, then lim f = L. The proof of lim(x→0) sin(x)/x = 1 is the canonical example: squeeze sin(x)/x between cos(x) and 1, and the Squeeze Theorem does the rest.',

      'Limits at infinity shift the question from "what does f approach near x = a?" to "what does f settle into as x grows without bound?" For rational functions the answer comes from comparing polynomial degrees: equal degrees give the ratio of leading coefficients, a heavier denominator gives 0, and a heavier numerator gives growth without bound (or a slant asymptote via long division). The growth hierarchy ln(x) ≪ xᵃ ≪ bˣ tells you which type of function dominates in mixed cases.',

      '**Where this is heading:** This is the last lesson of Chapter 1. The next lesson — Rate of Change — is actually the first bridge into Chapter 2. It takes the limit idea and asks: what happens to the slope of a secant line as the two points collapse toward one? The answer to that question is the derivative. Everything you have learned about limits in this chapter is exactly the machinery Chapter 2 needs.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 11 of 13 — Chapter 1: Limits & Continuity',
        body: '**Previous:** Limits at Infinity — end behavior, degree rules, and the growth hierarchy.\n**This lesson:** Chapter 1 synthesis — all limit tools connected into a unified picture.\n**Next:** Rate of Change — the difference quotient, secant lines shrinking to tangent lines, and the first step into derivatives.',
      },
      {
        type: 'insight',
        title: 'The Four Perspectives on a Limit',
        body: '\\text{Visual: approach on a graph.} \\\\ \\text{Numerical: values converging in a table.} \\\\ \\text{Algebraic: factor/cancel to remove the indeterminate form.} \\\\ \\text{Conceptual: the limit is a prediction — continuity means the function keeps its promise.}',
      },
      {
        type: 'theorem',
        title: 'Three-Condition Test for Continuity',
        body: 'f \\text{ continuous at } a \\iff \\begin{cases} (1) & f(a) \\text{ is defined} \\\\ (2) & \\lim_{x \\to a} f(x) \\text{ exists} \\\\ (3) & \\lim_{x \\to a} f(x) = f(a) \\end{cases}',
      },
      {
        type: 'strategy',
        title: 'Chapter 1 Decision Tree',
        body: '\\text{1. Try direct substitution.} \\\\ \\text{2. If 0/0: factor, rationalize, or use trig identity.} \\\\ \\text{3. If bounded × vanishing: try Squeeze Theorem.} \\\\ \\text{4. If } x \\to \\pm\\infty\\text{: compare degrees or use growth hierarchy.} \\\\ \\text{5. If piecewise or }|x|\\text{: check one-sided limits separately.}',
      },
      {
        type: 'misconception',
        title: 'The Limit Does Not Care About the Point Itself',
        body: '\\lim_{x \\to a} f(x) = L \\text{ depends only on values of } f \\text{ near } a, \\text{ never at } a. \\\\ f(a) \\text{ can be undefined, wrong, or nonexistent — the limit is unchanged.}',
      },
    ],
    visualizations: [
      {
        id: 'LimitApproachViz',
        title: 'The Limit Approach — Left and Right',
        mathBridge: 'Step 1: Set the target point to $x = 1$ and observe $f(x) = (x^2-1)/(x-1)$. Notice the hole at $x = 1$ — direct substitution fails. Step 2: Drag x toward 1 from the left. Watch the function values approach 2. Step 3: Drag from the right — same destination. Step 4: Try a function with a jump discontinuity. Now the left and right approaches land at different values and the two-sided limit does not exist. The key lesson: the two-sided limit requires both one-sided limits to agree. Agreement is continuity; disagreement is a jump.',
        caption: 'Approach from both sides. Two-sided limit exists only when both one-sided limits agree.',
      },
      {
        id: 'ContinuityViz',
        title: 'Continuity — No Holes, No Jumps, No Breaks',
        mathBridge: 'The three continuity conditions are independent — any one can fail while the others hold. Step 1: Toggle off condition (1) only (f(a) undefined). You get a removable discontinuity — a hole. Step 2: Toggle off condition (2) only (limit does not exist). You get a jump or infinite discontinuity. Step 3: Toggle off condition (3) only (limit exists and f(a) is defined but they disagree). You get a removable discontinuity with a mismatched point — a "filled hole in the wrong place." Step 4: Turn all three on — this is continuity. The key lesson: all three conditions must hold simultaneously. One failure breaks the chain.',
        caption: 'Toggle each continuity condition independently to see which failure type each one creates.',
      },
      {
        id: 'EpsilonDeltaViz',
        title: 'Epsilon-Delta — Making "Approaches" Precise',
        mathBridge: 'The epsilon-delta definition translates the intuitive idea of "approaching" into a mathematical guarantee. Step 1: Set a large epsilon (output tolerance). Notice a generous delta (input restriction) works — you do not need to be close to $a$ to stay within $\\varepsilon$ of $L$. Step 2: Shrink epsilon. Watch delta shrink with it. Step 3: Shrink epsilon to almost zero — delta must also shrink to almost zero. The key lesson: the limit exists if and only if for ANY choice of epsilon (no matter how small), you can find a delta that keeps the function within epsilon of L. The challenge is showing this works for every epsilon simultaneously, not just a few.',
        caption: 'Shrink ε to see how δ must respond. The limit exists iff this works for every ε > 0.',
      },
      {
        id: 'Ch1Review',
        title: 'Chapter 1 Concept Map',
        mathBridge: 'Before moving on, use this board to check your mental model against the full chapter structure. The core hierarchy is: limit definition → limit laws → continuity → discontinuity types → epsilon-delta → squeeze theorem → trig limits → limits at infinity. Each node feeds into the next. If any node feels shaky, identify it here and return to that lesson before Chapter 2.',
        caption: 'Full map of Chapter 1 — use this to identify any gaps before Chapter 2.',
      },
      {
        id: 'Ch1Applied',
        title: 'Chapter 1 Applied Problems',
        mathBridge: 'Real-world limit problems differ from textbook ones in one key way: you must first identify which tool applies. Step 1: Read the problem and classify the form (indeterminate 0/0? bounded oscillation? rational at infinity? piecewise?). Step 2: Select the tool from the Chapter 1 decision tree. Step 3: Apply it. These applied problems practice the classification step — the most common place students stall on exams.',
        caption: 'Practice identifying which Chapter 1 tool applies before computing.',
      },
    ],
  },

  math: {
    prose: [
      '**The formal definition.** lim(x→a) f(x) = L means: for every ε > 0, there exists δ > 0 such that 0 < |x − a| < δ implies |f(x) − L| < ε. The ε is the output tolerance you demand; the δ is the input restriction that guarantees it. The limit exists if you can always find such a δ, no matter how small ε is.',

      '**Limit laws** let you break composite limits into pieces. The sum, difference, product, quotient, and power laws all say the same thing: if the individual limits exist, you can apply the operation to the limits rather than to the functions. The quotient law requires the denominator limit to be nonzero. These laws are what makes most limit computations one-line algebra.',

      '**Algebraic techniques for indeterminate forms.** When direct substitution gives 0/0, the function has a removable singularity at that point. Three techniques remove it: (1) factor and cancel a common (x−a) factor, (2) multiply by a conjugate to clear a radical from the denominator, (3) apply a trig identity to convert to a known limit pattern.',

      '**Continuity on an interval.** A function is continuous on an open interval (a, b) if it is continuous at every point in (a, b). It is continuous on a closed interval [a, b] if it is continuous on (a, b) and the one-sided limits at the endpoints match the function values there. Polynomials, rational functions (off their vertical asymptotes), trig functions, exponentials, and logarithms are all continuous on their natural domains.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Epsilon-Delta Definition',
        body: '\\lim_{x \\to a} f(x) = L \\iff \\forall\\,\\varepsilon > 0,\\; \\exists\\,\\delta > 0 : 0 < |x-a| < \\delta \\implies |f(x)-L| < \\varepsilon',
      },
      {
        type: 'theorem',
        title: 'Limit Laws (Summary)',
        body: '\\lim[f \\pm g] = \\lim f \\pm \\lim g \\qquad \\lim[fg] = \\lim f \\cdot \\lim g \\qquad \\lim\\frac{f}{g} = \\frac{\\lim f}{\\lim g}\\;(\\lim g \\neq 0)',
      },
      {
        type: 'theorem',
        title: 'Squeeze Theorem',
        body: 'g(x) \\leq f(x) \\leq h(x) \\text{ near } a,\\quad \\lim_{x\\to a} g(x) = \\lim_{x\\to a} h(x) = L \\implies \\lim_{x\\to a} f(x) = L',
      },
      {
        type: 'theorem',
        title: 'Fundamental Trig Limits',
        body: '\\lim_{x \\to 0}\\frac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to 0}\\frac{1-\\cos x}{x} = 0',
      },
      {
        type: 'theorem',
        title: 'Rational Limits at Infinity',
        body: '\\frac{p(x)}{q(x)}:\\quad \\deg p < \\deg q \\Rightarrow 0; \\quad \\deg p = \\deg q \\Rightarrow \\frac{a_n}{b_n}; \\quad \\deg p > \\deg q \\Rightarrow \\text{no finite limit}',
      },
    ],
    visualizations: [
      {
        id: 'LimitApproachViz',
        props: { fn: '(x*x - 1)/(x - 1)', targetX: 1, limitVal: 2, showTable: true },
        title: 'Visual + Numerical: (x²−1)/(x−1) near x = 1',
        mathBridge: 'This is the canonical example of a removable discontinuity. The table shows both one-sided approaches converging to 2. Cross-check: factor $x^2-1 = (x-1)(x+1)$ and cancel to get $x+1$, which equals 2 at $x=1$. Three methods (visual, numerical, algebraic) all confirm the same limit. When they disagree, check your algebra.',
        caption: 'All three methods — graph, table, algebra — confirm lim = 2 despite the hole at x = 1.',
      },
    ],
  },

  rigor: {
    title: 'Epsilon-Delta Proof: lim(x→1) (2x + 1) = 3',
    visualizationId: 'EpsilonDeltaViz',
    prose: [
      'To prove a limit rigorously with epsilon-delta, the structure is always the same: (1) state the claim, (2) simplify |f(x) − L| to expose |x − a|, (3) choose δ in terms of ε so that |x − a| < δ forces |f(x) − L| < ε, (4) verify the choice works.',

      'The proof below shows the complete workflow for a linear function. Linear functions are the simplest case — the relationship between |x − a| and |f(x) − L| is just a constant multiple, making the δ choice exact rather than approximate.',
    ],
    proofSteps: [
      {
        expression: '\\text{Claim: } \\lim_{x \\to 1} (2x + 1) = 3',
        annotation: 'We must find, for any ε > 0, a δ > 0 such that 0 < |x − 1| < δ forces |(2x+1) − 3| < ε.',
      },
      {
        expression: '|(2x+1) - 3| = |2x - 2| = 2|x - 1|',
        annotation: 'Simplify the output distance |f(x) − L|. It factors into a constant times the input distance |x − a|. This is the key algebraic step in every linear epsilon-delta proof.',
      },
      {
        expression: '2|x-1| < \\varepsilon \\iff |x-1| < \\frac{\\varepsilon}{2}',
        annotation: 'We need the output distance < ε. That means input distance < ε/2. So choosing δ = ε/2 will work.',
      },
      {
        expression: '\\text{Choose } \\delta = \\frac{\\varepsilon}{2}',
        annotation: 'This choice is valid for every ε > 0, no matter how small. The proof is complete.',
      },
      {
        expression: '0 < |x-1| < \\delta \\implies |(2x+1)-3| = 2|x-1| < 2\\delta = 2 \\cdot \\frac{\\varepsilon}{2} = \\varepsilon',
        annotation: 'Verification: plug δ = ε/2 back in to confirm the chain of inequalities holds. This is the formal close of every epsilon-delta proof.',
      },
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Epsilon-Delta Proof Template',
        body: '\\text{1. Simplify } |f(x) - L| \\text{ to get } C|x-a|. \\\\ \\text{2. Set } C|x-a| < \\varepsilon \\Rightarrow |x-a| < \\varepsilon/C. \\\\ \\text{3. Choose } \\delta = \\varepsilon/C. \\\\ \\text{4. Verify by substituting } \\delta \\text{ back.}',
      },
      {
        type: 'warning',
        title: 'δ Must Depend on ε — Never a Fixed Number',
        body: '\\delta \\text{ is a function of } \\varepsilon\\text{. Writing } \\delta = 0.01 \\text{ proves the limit only for } \\varepsilon > 0.02\\text{, not for all } \\varepsilon. \\text{ The definition requires every } \\varepsilon > 0.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-10-ex1',
      title: 'Factoring to Remove a Hole',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$.',
      steps: [
        {
          expression: '\\frac{x^2 - 9}{x - 3}\\bigg|_{x=3} = \\frac{0}{0}',
          annotation: 'Direct substitution gives 0/0 — an indeterminate form. The function has a removable singularity at x = 3.',
          hints: [
            'Plug in x = 3: numerator = 9 − 9 = 0, denominator = 3 − 3 = 0. Indeterminate form — do not stop here.',
            '0/0 means there is a common factor of (x − 3) in both numerator and denominator. Factor the numerator next.',
          ],
        },
        {
          expression: '= \\frac{(x-3)(x+3)}{x-3}',
          annotation: 'Factor the numerator using difference of squares: $x^2 - 9 = (x-3)(x+3)$.',
          hints: [
            'Difference of squares: $a^2 - b^2 = (a-b)(a+b)$. Here $a = x$, $b = 3$.',
            '$x^2 - 9 = (x-3)(x+3)$.',
          ],
        },
        {
          expression: '= x + 3 \\quad (x \\neq 3)',
          annotation: 'Cancel the common (x − 3) factor. This cancellation is valid because in a limit, x approaches 3 but never equals 3, so (x − 3) ≠ 0.',
          hints: [
            'In a limit, x ≠ a, so cancelling a factor of (x − 3) is legally valid.',
            'After cancelling: the function equals x + 3 everywhere except x = 3.',
          ],
        },
        {
          expression: '\\lim_{x \\to 3}(x + 3) = 6',
          annotation: 'Now substitute x = 3 directly. The hole is gone.',
          hints: ['x + 3 is a polynomial — continuous everywhere. Substitute: 3 + 3 = 6.'],
        },
      ],
      conclusion: 'The limit is 6. The original function had a hole at x = 3; factoring and cancelling removed it and revealed the limit.',
    },
    {
      id: 'ch1-10-ex2',
      title: 'One-Sided Limits and a Jump',
      problem: 'Analyze $\\displaystyle\\lim_{x \\to 0} \\frac{|x|}{x}$.',
      steps: [
        {
          expression: '\\text{For } x < 0: |x| = -x',
          annotation: 'Absolute value splits into cases based on sign. For x < 0, |x| = −x by definition.',
          hints: [
            'Write out the definition: $|x| = x$ if $x \\geq 0$, $|x| = -x$ if $x < 0$.',
            'For the left-hand limit, we care about x < 0.',
          ],
        },
        {
          expression: '\\lim_{x \\to 0^-} \\frac{|x|}{x} = \\lim_{x \\to 0^-} \\frac{-x}{x} = -1',
          annotation: 'Substitute |x| = −x for x < 0. The x terms cancel, leaving −1.',
          hints: ['$-x/x = -1$ for all $x \\neq 0$.'],
        },
        {
          expression: '\\lim_{x \\to 0^+} \\frac{|x|}{x} = \\lim_{x \\to 0^+} \\frac{x}{x} = 1',
          annotation: 'For x > 0, |x| = x, so the ratio is x/x = 1.',
          hints: ['For $x > 0$: $|x| = x$, so $|x|/x = x/x = 1$.'],
        },
        {
          expression: '-1 \\neq 1 \\implies \\lim_{x \\to 0} \\frac{|x|}{x} \\text{ does not exist}',
          annotation: 'Left-hand limit (−1) ≠ right-hand limit (1). The two-sided limit does not exist. This is a jump discontinuity at x = 0.',
          hints: [
            'Two-sided limit exists iff lim from left = lim from right.',
            'Here −1 ≠ 1, so the limit DNE.',
          ],
        },
      ],
      conclusion: 'The two-sided limit does not exist because the left and right one-sided limits are −1 and +1 respectively. This is a jump discontinuity.',
    },
    {
      id: 'ch1-10-ex3',
      title: 'Squeeze Theorem: lim sin(x)/x = 1',
      problem: 'Show that $\\displaystyle\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.',
      steps: [
        {
          expression: '\\cos x \\leq \\frac{\\sin x}{x} \\leq 1 \\quad \\text{for } 0 < x < \\tfrac{\\pi}{2}',
          annotation: 'Geometric proof via area comparison on the unit circle: inner triangle ≤ sector ≤ outer tangent triangle gives this squeeze inequality.',
          hints: [
            'This inequality comes from comparing three areas on the unit circle: triangle area $\\frac{1}{2}\\sin x \\cos x$, sector area $\\frac{1}{2}x$, and outer triangle area $\\frac{1}{2}\\tan x$.',
            'Rearranging gives $\\cos x \\leq \\sin x/x \\leq 1$.',
          ],
        },
        {
          expression: '\\lim_{x \\to 0} \\cos x = 1 \\quad \\text{and} \\quad \\lim_{x \\to 0} 1 = 1',
          annotation: 'Both bounding functions approach 1 as x → 0. This is the trigger for the Squeeze Theorem.',
          hints: ['cos(0) = 1 by continuity of cosine. The upper bound is the constant 1.'],
        },
        {
          expression: '\\therefore\\; \\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
          annotation: 'By the Squeeze Theorem, since sin(x)/x is trapped between two functions both approaching 1, it must also approach 1.',
          hints: ['Squeeze Theorem: if $g \\leq f \\leq h$ and $\\lim g = \\lim h = L$, then $\\lim f = L$.'],
        },
      ],
      conclusion: '$\\lim_{x\\to 0} \\sin(x)/x = 1$. This is proved by squeezing — direct substitution gives 0/0, and no algebraic simplification works. The Squeeze Theorem is the only path.',
    },
  ],

  challenges: [
    {
      id: 'ch1-10-c1',
      difficulty: 'medium',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to 2} \\frac{x^3 - 8}{x - 2}$.',
      hint: 'Factor $x^3 - 8$ as a difference of cubes: $a^3 - b^3 = (a-b)(a^2+ab+b^2)$.',
      walkthrough: [
        {
          expression: 'x^3 - 8 = (x-2)(x^2 + 2x + 4)',
          annotation: 'Difference of cubes with $a = x$, $b = 2$: $a^3 - b^3 = (a-b)(a^2+ab+b^2) = (x-2)(x^2+2x+4)$.',
        },
        {
          expression: '\\frac{x^3-8}{x-2} = \\frac{(x-2)(x^2+2x+4)}{x-2} = x^2+2x+4 \\quad (x \\neq 2)',
          annotation: 'Cancel the common (x−2) factor. Valid since x ≠ 2 in a limit.',
        },
        {
          expression: '\\lim_{x \\to 2}(x^2+2x+4) = 4+4+4 = 12',
          annotation: 'Substitute x = 2 into the simplified expression.',
        },
      ],
      answer: '12',
    },
    {
      id: 'ch1-10-c2',
      difficulty: 'medium',
      problem: 'Is $f(x) = \\begin{cases} x^2 & x < 1 \\\\ 2x - 1 & x \\geq 1 \\end{cases}$ continuous at $x = 1$?',
      hint: 'Check all three continuity conditions: f(1) defined, limit exists, and they match.',
      walkthrough: [
        {
          expression: 'f(1) = 2(1) - 1 = 1',
          annotation: 'At x = 1, use the second piece (x ≥ 1). f(1) = 1. Condition (1) satisfied.',
        },
        {
          expression: '\\lim_{x \\to 1^-} x^2 = 1 \\qquad \\lim_{x \\to 1^+}(2x-1) = 1',
          annotation: 'Left-hand limit uses the first piece (x²): approach 1² = 1. Right-hand limit uses the second piece: approach 2(1)−1 = 1. Both equal 1, so the two-sided limit exists and equals 1. Condition (2) satisfied.',
        },
        {
          expression: '\\lim_{x \\to 1} f(x) = 1 = f(1)',
          annotation: 'The limit equals the function value. Condition (3) satisfied.',
        },
        {
          expression: '\\therefore f \\text{ is continuous at } x = 1',
          annotation: 'All three conditions hold. The two pieces connect seamlessly — no hole, no jump.',
        },
      ],
      answer: 'Yes, f is continuous at x = 1. All three conditions are satisfied.',
    },
    {
      id: 'ch1-10-c3',
      difficulty: 'hard',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to 0} x^2 \\sin\\!\\left(\\frac{1}{x}\\right)$.',
      hint: 'sin(1/x) is bounded between −1 and 1 regardless of x. What happens when you multiply a bounded function by x² → 0?',
      walkthrough: [
        {
          expression: '-1 \\leq \\sin\\!\\left(\\tfrac{1}{x}\\right) \\leq 1 \\quad \\text{for all } x \\neq 0',
          annotation: 'Sine is always bounded between −1 and 1. This is true regardless of the argument.',
        },
        {
          expression: '-x^2 \\leq x^2\\sin\\!\\left(\\tfrac{1}{x}\\right) \\leq x^2',
          annotation: 'Multiply all three parts of the inequality by x² (which is ≥ 0, so inequalities do not flip).',
        },
        {
          expression: '\\lim_{x \\to 0}(-x^2) = 0 \\quad \\text{and} \\quad \\lim_{x \\to 0} x^2 = 0',
          annotation: 'Both bounding functions approach 0. The Squeeze Theorem applies.',
        },
        {
          expression: '\\therefore\\; \\lim_{x \\to 0} x^2 \\sin\\!\\left(\\tfrac{1}{x}\\right) = 0',
          annotation: 'The wildly oscillating sin(1/x) is completely overwhelmed by the x² factor collapsing to 0.',
        },
      ],
      answer: '0',
    },
  ],

  crossRefs: [
    {
      lessonSlug: 'limits-at-infinity',
      label: 'Previous: Limits at Infinity',
      context: 'End behavior and the growth hierarchy complete the Chapter 1 toolkit.',
    },
    {
      lessonSlug: 'epsilon-delta',
      label: 'Deep Dive: Epsilon-Delta',
      context: 'The formal definition of a limit — proof technique and geometric interpretation.',
    },
    {
      lessonSlug: 'squeeze-theorem',
      label: 'Deep Dive: Squeeze Theorem',
      context: 'Full treatment of the squeeze technique and its applications.',
    },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: 'lim(x→a) f(x) = L',
        meaning: 'as x gets arbitrarily close to a (but never equals a), f(x) gets arbitrarily close to L — determined by behavior around a, not at a',
      },
      {
        symbol: 'f continuous at a',
        meaning: 'f(a) is defined, the limit exists, and they are equal — the function keeps its promise at that point',
      },
      {
        symbol: 'lim(x→a⁻) and lim(x→a⁺)',
        meaning: 'one-sided limits — approach from the left or right only; two-sided limit exists iff both agree',
      },
      {
        symbol: '0/0 (indeterminate form)',
        meaning: 'not zero, not undefined — it means the technique failed, try factoring or another method',
      },
    ],
    rulesOfThumb: [
      'Try direct substitution first — if it works, you are done.',
      'If you get 0/0: factor and cancel, rationalize, or use a trig identity.',
      'Bounded × vanishing → 0 (Squeeze Theorem trigger).',
      'For piecewise or |x|: always compute left and right limits separately.',
      'For limits at infinity: divide by the highest power in the denominator.',
    ],
  },

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'ch1-intro-limits',
        label: 'Introduction to Limits (Ch. 1)',
        note: 'If the core idea of a limit still feels unclear — what it means to "approach" a value — return to the intro lesson before working through this review. Everything here assumes that foundation.',
      },
      {
        lessonId: 'ch1-continuity',
        label: 'Continuity (Ch. 1)',
        note: 'The three-condition test for continuity and the types of discontinuities are central to this review. If classifying discontinuities still feels shaky, revisit the continuity lesson.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'ch2-tangent-problem',
        label: 'Ch. 2: The Tangent Problem',
        note: 'The derivative is defined as a limit: lim(h→0) [f(x+h)−f(x)]/h. Every limit technique from Chapter 1 is used in evaluating this expression. The transition from Chapter 1 to Chapter 2 is just applying limit tools to a specific new function.',
      },
      {
        lessonId: 'ch3-lhopital',
        label: 'Ch. 3: L\'Hôpital\'s Rule',
        note: 'L\'Hôpital handles 0/0 and ∞/∞ indeterminate forms that the Chapter 1 techniques cannot reach. It is the next upgrade to the limit toolkit.',
      },
    ],
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'lac-assess-1',
        type: 'input',
        text: 'lim(x→3) (x²−9)/(x−3) = ?',
        answer: '6',
        hint: 'Factor: x²−9 = (x−3)(x+3). Cancel (x−3), then substitute x = 3.',
      },
      {
        id: 'lac-assess-2',
        type: 'choice',
        text: 'For f to be continuous at x = a, which conditions must ALL hold?',
        options: [
          'f(a) is defined',
          'lim(x→a) f(x) exists',
          'lim(x→a) f(x) = f(a)',
          'All three above',
        ],
        answer: 'All three above',
        hint: 'Continuity requires all three conditions simultaneously.',
      },
      {
        id: 'lac-assess-3',
        type: 'input',
        text: 'lim(x→0) x²sin(1/x) = ?',
        answer: '0',
        hint: 'sin(1/x) is bounded: −1 ≤ sin(1/x) ≤ 1. Multiply by x² and squeeze.',
      },
    ],
  },

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    'Limit = prediction from around a point, never at it',
    'Continuity = function keeps its promise: f(a) = lim f(x)',
    '0/0 → factor/cancel or conjugate or trig identity',
    'Bounded × vanishing → 0 (Squeeze Theorem)',
    'Limits at infinity: divide by highest denominator power',
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
    'solved-challenge',
  ],

  quiz: [
    {
      id: 'lac-q1',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 3} \\dfrac{x^2 - 9}{x - 3}$.',
      answer: '6',
      hints: [
        'Direct substitution gives 0/0. Factor the numerator: $x^2-9 = (x-3)(x+3)$.',
        'Cancel $(x-3)$, leaving $x+3$. Substitute $x=3$: $3+3=6$.',
      ],
      reviewSection: 'Examples tab — factoring to remove a hole',
    },
    {
      id: 'lac-q2',
      type: 'choice',
      text: 'What is $\\lim_{x \\to 0^-} \\dfrac{|x|}{x}$?',
      options: ['1', '−1', '0', 'Does not exist'],
      answer: '−1',
      hints: [
        'For $x < 0$: $|x| = -x$.',
        '$|x|/x = -x/x = -1$ for $x < 0$.',
      ],
      reviewSection: 'Examples tab — one-sided limits and a jump',
    },
    {
      id: 'lac-q3',
      type: 'choice',
      text: 'The two-sided limit $\\lim_{x \\to 0} \\dfrac{|x|}{x}$:',
      options: ['equals 1', 'equals −1', 'equals 0', 'does not exist'],
      answer: 'does not exist',
      hints: [
        'Left-hand limit = −1, right-hand limit = +1.',
        'Since they disagree, the two-sided limit does not exist.',
      ],
      reviewSection: 'Examples tab — one-sided limits and a jump',
    },
    {
      id: 'lac-q4',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 2} \\dfrac{x^3 - 8}{x - 2}$.',
      answer: '12',
      hints: [
        'Factor using difference of cubes: $x^3-8 = (x-2)(x^2+2x+4)$.',
        'Cancel $(x-2)$, substitute $x=2$: $4+4+4=12$.',
      ],
      reviewSection: 'Challenges tab — Challenge 1',
    },
    {
      id: 'lac-q5',
      type: 'choice',
      text: 'A function $f$ has $f(2) = 5$ and $\\lim_{x \\to 2} f(x) = 3$. At $x = 2$, $f$ is:',
      options: ['Continuous', 'Discontinuous — removable', 'Discontinuous — jump', 'Discontinuous — infinite'],
      answer: 'Discontinuous — removable',
      hints: [
        'The limit exists (condition 2 ✓) and $f(2)$ is defined (condition 1 ✓), but $\\lim f \\neq f(2)$ (condition 3 ✗).',
        'When the limit exists but does not equal the function value, it is a removable discontinuity.',
      ],
      reviewSection: 'Intuition tab — three-condition test for continuity',
    },
    {
      id: 'lac-q6',
      type: 'input',
      text: 'What is $\\lim_{x \\to 0} \\dfrac{\\sin x}{x}$?',
      answer: '1',
      hints: [
        'This is the first fundamental trig limit — proved by the Squeeze Theorem.',
        '$\\lim_{x\\to 0} \\sin(x)/x = 1$ (with $x$ in radians).',
      ],
      reviewSection: 'Examples tab — Squeeze Theorem: sin(x)/x',
    },
    {
      id: 'lac-q7',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 0} x^2 \\sin\\!\\left(\\dfrac{1}{x}\\right)$.',
      answer: '0',
      hints: [
        '$|\\sin(1/x)| \\leq 1$ always. So $|x^2 \\sin(1/x)| \\leq x^2$.',
        'Squeeze: $-x^2 \\leq x^2\\sin(1/x) \\leq x^2$. Both bounds → 0, so the limit is 0.',
      ],
      reviewSection: 'Challenges tab — hard challenge (Squeeze Theorem)',
    },
    {
      id: 'lac-q8',
      type: 'input',
      text: 'In an epsilon-delta proof of $\\lim_{x\\to 1}(2x+1)=3$, what is the correct choice for $\\delta$ in terms of $\\varepsilon$?',
      answer: 'epsilon/2',
      hints: [
        'Simplify $|(2x+1)-3| = 2|x-1|$. We need $2|x-1| < \\varepsilon$, so $|x-1| < \\varepsilon/2$.',
        'Choose $\\delta = \\varepsilon/2$.',
      ],
      reviewSection: 'Rigor tab — epsilon-delta proof walkthrough',
    },
    {
      id: 'lac-q9',
      type: 'choice',
      text: 'The piecewise function $f(x) = \\begin{cases} x^2 & x < 1 \\\\ 2x-1 & x \\geq 1 \\end{cases}$ at $x=1$ is:',
      options: ['Continuous', 'Discontinuous — removable', 'Discontinuous — jump', 'Discontinuous — infinite'],
      answer: 'Continuous',
      hints: [
        '$f(1) = 1$. $\\lim_{x\\to 1^-} x^2 = 1$. $\\lim_{x\\to 1^+}(2x-1) = 1$. All three equal 1.',
        'All three continuity conditions hold.',
      ],
      reviewSection: 'Challenges tab — Challenge 2',
    },
    {
      id: 'lac-q10',
      type: 'choice',
      text: 'Which Chapter 1 tool handles $\\lim_{x\\to 0} \\dfrac{\\sin(5x)}{3x}$?',
      options: [
        'Direct substitution',
        'Factor and cancel',
        'Fundamental trig limit pattern scaling',
        'Squeeze Theorem',
      ],
      answer: 'Fundamental trig limit pattern scaling',
      hints: [
        'Direct substitution gives 0/0. There is nothing to factor.',
        'Rewrite as $(5/3) \\cdot \\sin(5x)/(5x)$. Apply $\\lim_{u\\to 0} \\sin(u)/u = 1$.',
      ],
      reviewSection: 'Math tab — fundamental trig limits',
    },
  ],
};
