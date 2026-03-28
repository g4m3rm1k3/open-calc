export default {
  id: "ch1-limit-laws",
  slug: "limit-laws",
  chapter: 1,
  order: 1,
  title: "Limit Laws",
  subtitle: "Algebraic rules so you don't need tables every time",
  tags: [
    "limit laws",
    "sum rule",
    "product rule",
    "quotient rule",
    "squeeze theorem",
    "sandwich theorem",
    "direct substitution",
    "sin(x)/x",
  ],

  hook: {
    question:
      "Can you compute lim(x→2)(3x² − x + 5) without making a table of values?",
    realWorldContext:
      'Of course — just plug in x = 2 and get 3(4) − 2 + 5 = 15. You already knew this intuitively. The limit laws are the mathematical justification for why direct substitution works for "nice" functions. ' +
      "They also let you break complicated limits into simpler pieces, each of which is easy to compute. " +
      "And the Squeeze Theorem is the secret weapon for limits like lim(x→0) x·sin(1/x) that completely defy algebraic manipulation — the function oscillates wildly near 0, yet its limit is pinned to 0 by being sandwiched between −x and x.",
    previewVisualizationId: "LimitApproach",
  },

  intuition: {
    prose: [
      '**You already know the limit laws intuitively.** Suppose your friend tells you the temperature in Room A is approaching 20°C and the temperature in Room B is approaching 30°C. Without thinking, you know the average of the two temperatures is approaching 25°C. You just used the Sum Law for limits. The Limit Laws are not new ideas — they are the precise mathematical justification for arithmetic that already feels obvious.',

      'Here is the key insight: if two functions are each "settling down" to their own limits, then any arithmetic combination of those functions settles down to the same arithmetic combination of those limits. Addition distributes through limits. Multiplication distributes through limits. The only exceptions are when you might be dividing by zero or taking an even root of a negative number — situations that would be problematic in ordinary arithmetic too.',

      '**So what does this buy us?** It means we can break complicated limits into simpler pieces. To evaluate lim(x→2) (3x²−x+5), you do not need a table of values. You can write: limit of 3x² is 3·4 = 12, limit of x is 2, limit of 5 is 5, and then combine: 12 − 2 + 5 = 15. This is exactly what "direct substitution" means and why it works: the Limit Laws guarantee the pieces combine correctly.',

      '**But there is a catch.** Direct substitution only works when the denominator is nonzero and the function is "nice" (continuous) at the point. What happens when it gives 0/0? The function (x²−4)/(x−2) seems to equal 0/0 at x = 2. But remember: a limit cares about the journey toward 2, not the value at 2. Factor the top: (x+2)(x−2)/(x−2). For any x≠2, you can cancel (x−2)/(x−2) = 1, leaving x+2. As x approaches 2, x+2 approaches 4. The limit is 4, even though the function has a hole there. This algebraic cancellation technique — factor and cancel before substituting — is the standard first move when you get 0/0.',

      '**The Squeeze Theorem is a completely different kind of tool.** Sometimes a function is so wild that you cannot factor or simplify it. The classic example is f(x) = x·sin(1/x) near x = 0. As x approaches 0, sin(1/x) oscillates infinitely many times back and forth between −1 and +1 — it has no limit of its own. You cannot factor it. You cannot simplify it. But here is the key observation: |sin(anything)| ≤ 1 always. So −|x| ≤ x·sin(1/x) ≤ |x| for all x ≠ 0. Both −|x| and |x| approach 0. The function is sandwiched (squeezed) between two things that both go to 0, so it must go to 0 too. No algebra involved — just the logical consequence of being trapped.',

      '**The fundamental trig limits, sin(x)/x → 1 and (1−cos x)/x → 0 as x→0, are the most important applications of the Squeeze Theorem in Calculus 1.** They cannot be obtained by algebra. They require the Squeeze Theorem plus a geometric argument about areas on the unit circle. And they come back in every single derivative of a trig function. If you ever see $\\frac{\\sin(5x)}{x}$, the trick is to force the pattern: multiply and divide by 5 to get $5 \\cdot \\frac{\\sin(5x)}{5x}$, and now the piece in brackets approaches 1 as x goes to 0. So the answer is 5.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'The Squeeze in a picture',
        body: 'g(x) \\leq f(x) \\leq h(x) \\text{ near } c. \\text{ Both } g,h \\to L. \\Rightarrow f \\to L. \\text{ The middle function has no choice.}',
      },
      {
        type: 'tip',
        title: 'When to reach for the Squeeze Theorem',
        body: '\\text{Trigger: bounded oscillation} \\times \\text{something} \\to 0. \\\\ \\text{e.g. } \\sin(1/x) \\cdot x, \\; \\cos(1/x) \\cdot x^2, \\; (-1)^n / n.',
      },
      {
        type: 'strategy',
        title: 'The Trig Limit Pattern',
        body: '\\lim_{x\\to 0}\\frac{\\sin(ax)}{bx} = \\frac{a}{b} \\cdot \\underbrace{\\lim_{u\\to 0}\\frac{\\sin u}{u}}_{=1} = \\frac{a}{b}',
      },
    ],
    visualizationId: 'SqueezeTheorem',
    visualizationProps: {},
    visualizations: [
      {
        id: 'Ch3_2_GettingCloser',
        title: 'Story Viz — Getting Closer',
        mathBridge: 'This story visualization follows a character who needs to figure out what a sequence approaches. As you watch, notice that the narrative structure mirrors the Limit Law decomposition: each smaller piece of the problem is handled separately, then combined. This is exactly what the Sum and Product Laws let you do algebraically.',
        caption: 'Book 3 Chapter 2 story visualization focused on applying limit laws in context.',
      },
      {
        id: 'LimitBridgeLab',
        title: 'Limit Law Bridge Lab',
        mathBridge: 'This lab lets you test when limit laws are safe to apply and when they break down. Try a case where the denominator approaches zero — the Quotient Law fails there. Then try a well-behaved rational function and see that the law applies. The two-sided approach controls let you verify left- and right-hand limits agree before declaring the limit exists.',
        caption: 'Test limit law conditions interactively. Observe when decomposition rules are safe and when naive substitution fails.',
      },
      {
        id: 'SqueezeTheorem',
        title: 'Squeeze Theorem in Action',
        mathBridge: 'Before you interact with this, identify the wild (oscillating) function and the two bounding functions. The wild function is being sandwiched between -|x| and |x|. Watch what happens as x approaches 0 — the bounding curves close like a vice. The oscillating function has nowhere to go except 0.',
        caption: 'Watch a bounded oscillating function get pinned to zero by two tame bounding functions.',
      },
                                  ],
  },

  math: {
    prose: [
      'Assume $\\lim_{x \\to c} f(x) = L$ and $\\lim_{x \\to c} g(x) = M$. The Limit Laws tell you exactly how to compute limits of combinations built from $f$ and $g$.',

      '**The most useful consequence: the Direct Substitution Property.** If $p(x)$ is a polynomial, then $\\lim_{x \\to c} p(x) = p(c)$ — just plug in. If $r(x) = p(x)/q(x)$ is a rational function and $q(c) \\neq 0$, then again you just substitute. The same goes for trig, exponential, and log functions at points where they are defined. This is a direct consequence of the Limit Laws applied repeatedly to the building blocks of the function.',

      '**What to do when substitution gives 0/0.** Factor, cancel, then substitute. The function $\\frac{x^2-4}{x-2}$ equals $(x+2)$ for every $x \\neq 2$ and is undefined only at $x = 2$ itself. But the limit as $x \\to 2$ only cares about values near 2, not at 2. So $\\lim_{x \\to 2} \\frac{x^2-4}{x-2} = \\lim_{x \\to 2}(x+2) = 4$. The Quotient Law requires that the denominator\'s limit is nonzero — but after we cancel, the new simpler function is defined at 2.',

      '**The two fundamental trig limits** require the Squeeze Theorem and a unit-circle area argument. They cannot be obtained by algebra. They are used in every proof of a trig derivative:',
      '$\\displaystyle\\lim_{x \\to 0}\\frac{\\sin x}{x} = 1$ and $\\displaystyle\\lim_{x \\to 0}\\frac{1-\\cos x}{x} = 0$',

      'When you see $\\sin(ax)/x$, multiply and divide by $a$ to force the pattern: $\\frac{\\sin(5x)}{x} = 5 \\cdot \\frac{\\sin(5x)}{5x}$. Let $u = 5x$; as $x \\to 0$, $u \\to 0$ too, so the factor $\\sin(u)/u \\to 1$. The limit is $5$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Limit Laws',
        body: '\\begin{aligned} \\lim[f \\pm g] &= L \\pm M \\\\ \\lim[f \\cdot g] &= L \\cdot M \\\\ \\lim[f/g] &= L/M \\quad (M \\neq 0) \\\\ \\lim[f^n] &= L^n \\quad (n \\in \\mathbb{Z}^+) \\\\ \\lim[k \\cdot f] &= k \\cdot L \\\\ \\lim[\\sqrt[n]{f}] &= \\sqrt[n]{L} \\quad (\\text{if defined}) \\end{aligned}',
      },
      {
        type: 'theorem',
        title: 'Squeeze Theorem',
        body: '\\text{If } g(x) \\leq f(x) \\leq h(x) \\text{ near } c \\text{ and } \\lim_{x \\to c} g = \\lim_{x \\to c} h = L, \\text{ then } \\lim_{x \\to c} f = L.',
      },
      {
        type: 'theorem',
        title: 'Two Fundamental Trig Limits',
        body: '\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to 0} \\dfrac{1 - \\cos x}{x} = 0',
      },
    ],
    visualizationId: 'LimitApproach',
    visualizationProps: {
      fn: 'Math.sin(x)/x',
      targetX: 0,
      limitVal: 1,
      showTable: true,
    },
    visualizations: [
          ],
  },

  rigor: {
    prose: [
      "Each limit law is a provable theorem. The proofs all follow the same template: assume the limits of f and g exist, invoke the definitions to get δ₁ and δ₂ for each, then combine them (usually taking δ = min(δ₁, δ₂)).",

      "The proof of the Sum Law (given below) uses the **triangle inequality** |a + b| ≤ |a| + |b| (play with the interactive geometric proof of this below, or check the Prerequisites inequalities lesson). This is the fundamental tool in analysis — it lets you break one error estimate into the sum of two smaller ones.",

      "The Squeeze Theorem proof is especially clean: if g(x) ≤ f(x) ≤ h(x) and both g and h are within ε of L, then g(x) > L − ε and h(x) < L + ε, which forces L − ε < f(x) < L + ε, i.e., |f(x) − L| < ε.",

      'Each Limit Law is a precise theorem proven from the $\\varepsilon$-$\\delta$ definition. The strategy is always the same: start from the limits of $f$ and $g$ individually, then show that combining them gives the combined limit. Here is how it works for the Sum Law.',
      'The heart of the argument is the **Triangle Inequality**: $|a + b| \\leq |a| + |b|$. This lets us split one error into two smaller errors — one for $f$ and one for $g$. We make each piece smaller than $\\varepsilon/2$, so the total error is smaller than $\\varepsilon$.',
      '**How to read the proof**: You are given an arbitrary (possibly very tiny) $\\varepsilon > 0$. You must produce a $\\delta > 0$ that works. The choice $\\delta = \\min(\\delta_1, \\delta_2)$ ensures that being within $\\delta$ of $c$ simultaneously makes $|f - L| < \\varepsilon/2$ AND $|g - M| < \\varepsilon/2$. The Triangle Inequality then closes the argument.',
      'The proofs of the Product and Quotient Laws require a bounding argument: near $c$, $|g(x)|$ cannot be arbitrarily large (it is close to $M$), so we can control the interaction term $|f||g - M|$ as well. These are slightly more involved than the Sum Law proof but follow the same template.',
    ],
    callouts: [
      {
        type: "theorem",
        title: "Proof of the Sum Law",
        body: "\\text{Given } \\varepsilon > 0. \\text{ Choose } \\delta_1: |x-c|<\\delta_1 \\Rightarrow |f-L|<\\varepsilon/2. \\\\ \\text{Choose } \\delta_2: |x-c|<\\delta_2 \\Rightarrow |g-M|<\\varepsilon/2. \\\\ \\text{Let } \\delta = \\min(\\delta_1,\\delta_2). \\text{ Then:} \\\\ |(f+g)-(L+M)| \\leq |f-L|+|g-M| < \\tfrac{\\varepsilon}{2}+\\tfrac{\\varepsilon}{2} = \\varepsilon \\;\\blacksquare",
      },
    ],
    visualizationId: "TriangleInequalityViz",
    visualizations: [
      {
        id: 'TriangleInequalityViz',
        title: 'Triangle Inequality — The Tool Behind Every Limit Law Proof',
        mathBridge: 'The Triangle Inequality $|a + b| \\leq |a| + |b|$ says that no matter what values $a$ and $b$ take, the absolute value of their sum is at most the sum of their absolute values. In the Sum Law proof, $a = f(x) - L$ and $b = g(x) - M$. The Triangle Inequality lets us replace one combined error $|(f+g)-(L+M)|$ with two separately manageable pieces $|f-L| + |g-M|$. Drag the vectors in this visualization to see how the geometric triangle inequality corresponds to the algebraic one.',
        caption: 'Drag both vectors and observe |a + b| \u2264 |a| + |b| always holds. This is the geometric foundation of every limit law proof.',
      },
    ],
  },

  examples: [
    {
      id: "ex-direct-sub",
      title: "Using Direct Substitution and Limit Laws",
      problem:
        "Evaluate \\displaystyle\\lim_{x \\to 2} \\frac{3x^2 - x + 1}{x + 5}.",
      steps: [
        {
          expression: "\\lim_{x \\to 2} \\frac{3x^2-x+1}{x+5}",
          annotation: "Check denominator first: $x + 5 = 2 + 5 = 7 \\neq 0$ at $x = 2$. Since the denominator is nonzero, the Direct Substitution Property applies and we can simply plug in $x = 2$.",
          hints: [
            "Verify the denominator is nonzero at x = 2.",
            "Since the denominator is 7, direct substitution is allowed.",
          ],
        },
        {
          expression: "= \\frac{3(2)^2 - (2) + 1}{(2)+5}",
          annotation: "Substitute x = 2 in both numerator and denominator.",
          hints: [
            "Replace every x with 2.",
            "Evaluate numerator and denominator separately.",
          ],
        },
        {
          expression:
            "= \\frac{3 \\cdot 4 - 2 + 1}{7} = \\frac{12 - 2 + 1}{7} = \\frac{11}{7}",
          annotation: "",
          hints: [
            "Compute 2^2 = 4, then multiply by 3.",
            "Simplify the numerator to 11 and divide by 7.",
          ],
        },
      ],
      conclusion:
        "11/7. Since the denominator is nonzero, this is simply function evaluation.",
    },
    {
      id: "ex-squeeze",
      title: "The Squeeze Theorem in Action",
      problem:
        "Evaluate \\displaystyle\\lim_{x \\to 0} x^2 \\sin\\!\\left(\\frac{1}{x}\\right).",
      steps: [
        {
          expression:
            "\\text{Attempt: direct substitution gives } 0 \\cdot \\sin(1/0)",
          annotation:
            "sin(1/x) is undefined at x = 0, and oscillates infinitely rapidly near 0. We cannot substitute or factor.",
        },
        {
          expression:
            "-1 \\leq \\sin\\!\\left(\\frac{1}{x}\\right) \\leq 1 \\quad \\text{for all } x \\neq 0",
          annotation:
            "The sine function is always between −1 and 1, regardless of its argument.",
        },
        {
          expression:
            "-x^2 \\leq x^2 \\sin\\!\\left(\\frac{1}{x}\\right) \\leq x^2",
          annotation:
            "Multiply all three parts by x² ≥ 0. Multiplying by a non-negative number preserves inequalities.",
        },
        {
          expression:
            "\\lim_{x \\to 0}(-x^2) = 0 \\qquad \\lim_{x \\to 0}(x^2) = 0",
          annotation:
            "Both bounding functions approach 0 (direct substitution for polynomials).",
        },
        {
          expression:
            "\\therefore \\lim_{x \\to 0} x^2 \\sin\\!\\left(\\frac{1}{x}\\right) = 0",
          annotation:
            "By the Squeeze Theorem: our function is sandwiched between −x² and x², both → 0, so it is squeezed to 0.",
        },
      ],
      conclusion:
        "The limit is 0. The key was recognizing that the complicated oscillating part (sin(1/x)) is bounded, and the bounding function (x²) controls the overall limit.",
    },
    {
      id: "ex-sin-over-x",
      title: "Using the Fundamental Limit sin(x)/x",
      problem:
        "Evaluate (a) \\displaystyle\\lim_{x \\to 0} \\frac{\\sin 5x}{x}, \\quad (b) \\lim_{x \\to 0} \\frac{\\sin 3x}{\\sin 7x}.",
      steps: [
        {
          expression: "\\textbf{(a) } \\lim_{x \\to 0} \\frac{\\sin 5x}{x}",
          annotation:
            "Direct substitution: 0/0. The fundamental limit is sin(u)/u = 1, so we need to create the pattern sin(5x)/(5x).",
        },
        {
          expression:
            "= \\lim_{x \\to 0} \\frac{\\sin 5x}{x} \\cdot \\frac{5}{5}",
          annotation: "Multiply and divide by 5 (multiply by 1 = 5/5).",
        },
        {
          expression: "= 5 \\cdot \\lim_{x \\to 0} \\frac{\\sin 5x}{5x}",
          annotation: "Factor out 5.",
        },
        {
          expression: "= 5 \\cdot 1 = 5",
          annotation:
            "Let u = 5x. As x → 0, u → 0. So lim sin(5x)/(5x) = lim sin(u)/u = 1.",
        },
        { expression: "", annotation: "" },
        {
          expression:
            "\\textbf{(b) } \\lim_{x \\to 0} \\frac{\\sin 3x}{\\sin 7x}",
          annotation:
            "Divide top and bottom by x to create two copies of the pattern.",
        },
        {
          expression: "= \\lim_{x \\to 0} \\frac{\\sin 3x / x}{\\sin 7x / x}",
          annotation: "Divide numerator and denominator by x.",
        },
        {
          expression:
            "= \\lim_{x \\to 0} \\frac{3 \\cdot \\frac{\\sin 3x}{3x}}{7 \\cdot \\frac{\\sin 7x}{7x}}",
          annotation: "Factor to create sin(3x)/(3x) and sin(7x)/(7x).",
        },
        {
          expression: "= \\frac{3 \\cdot 1}{7 \\cdot 1} = \\frac{3}{7}",
          annotation: "Both → 1 as x → 0.",
        },
      ],
      conclusion:
        "(a) 5, (b) 3/7. General pattern: lim(x→0) sin(ax)/(bx) = a/b.",
    },
    {
      id: "ex-cos-limit",
      title: "Using the Second Fundamental Trig Limit",
      problem:
        "Evaluate \\displaystyle\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}.",
      steps: [
        {
          expression: "\\lim_{x \\to 0} \\frac{1-\\cos x}{x^2}",
          annotation:
            "0/0 form. Strategy: multiply by (1+cos x)/(1+cos x) to use the Pythagorean identity.",
        },
        {
          expression:
            "= \\lim_{x \\to 0} \\frac{(1-\\cos x)(1+\\cos x)}{x^2(1+\\cos x)}",
          annotation: "",
        },
        {
          expression:
            "= \\lim_{x \\to 0} \\frac{1 - \\cos^2 x}{x^2(1+\\cos x)}",
          annotation: "Numerator: (1−cos x)(1+cos x) = 1 − cos²x.",
        },
        {
          expression: "= \\lim_{x \\to 0} \\frac{\\sin^2 x}{x^2(1+\\cos x)}",
          annotation: "1 − cos²x = sin²x (Pythagorean identity).",
        },
        {
          expression:
            "= \\lim_{x \\to 0} \\left(\\frac{\\sin x}{x}\\right)^2 \\cdot \\frac{1}{1+\\cos x}",
          annotation: "Split into recognizable pieces.",
        },
        {
          expression: "= (1)^2 \\cdot \\frac{1}{1 + 1} = \\frac{1}{2}",
          annotation: "sin(x)/x → 1, and cos(0) = 1 by direct substitution.",
        },
      ],
      conclusion:
        "1/2. This limit appears when computing d/dx[cos x] from the definition of the derivative.",
    },
    {
      id: "ex-limit-composite",
      title: "Limit of a Composite Function",
      problem:
        "Evaluate \\displaystyle\\lim_{x \\to 0} \\cos\\!\\left(\\frac{\\sin x}{x}\\right).",
      steps: [
        {
          expression:
            "\\lim_{x \\to 0} \\cos\\!\\left(\\frac{\\sin x}{x}\\right)",
          annotation: "This is a composition: cos applied to sin(x)/x.",
          hints: [
            "Identify the inner limit first.",
            "The outer cosine can be handled after the inner limit is known.",
          ],
        },
        {
          expression: "\\text{Step 1: find the inner limit.}",
          annotation: "",
          hints: [
            "Focus on sin(x)/x before touching cosine.",
            "The inner limit is the key input to the outer function.",
          ],
        },
        {
          expression: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
          annotation: "The fundamental trig limit.",
          hints: [
            "Use the standard limit lim sin x / x = 1.",
            "As x approaches 0, the ratio approaches 1.",
          ],
        },
        {
          expression: "\\text{Step 2: apply cos to the inner limit.}",
          annotation:
            'Since cos is continuous everywhere, we can "pass the limit through" the outer function.',
          hints: [
            "Cosine is continuous at 1.",
            "Apply cos after taking the inner limit.",
          ],
        },
        {
          expression: "= \\cos(1)",
          annotation: "",
          hints: [
            "Substitute the inner limit 1 into cosine.",
            "The result is cos(1).",
          ],
        },
        {
          expression: "\\approx 0.5403",
          annotation: "Numerical value for reference.",
          hints: [
            "Compute the decimal approximation of cos(1).",
            "This is just a calculator check.",
          ],
        },
      ],
      conclusion:
        "cos(1) ≈ 0.5403. Rule: for a continuous outer function, lim f(g(x)) = f(lim g(x)) — you can pull continuous functions out of limits.",
    },
  ],

  challenges: [
    {
      id: "ch1-laws-c1",
      difficulty: "medium",
      problem: "Evaluate \\displaystyle\\lim_{x \\to 0} \\frac{\\tan x}{x}.",
      hint: "Write tan x = sin x / cos x, then separate into a product of two limits.",
      walkthrough: [
        {
          expression:
            "\\lim_{x \\to 0} \\frac{\\tan x}{x} = \\lim_{x \\to 0} \\frac{\\sin x}{x \\cos x}",
          annotation: "",
        },
        {
          expression:
            "= \\lim_{x \\to 0} \\frac{\\sin x}{x} \\cdot \\lim_{x \\to 0} \\frac{1}{\\cos x}",
          annotation: "Product Law — both limits exist.",
        },
        {
          expression: "= 1 \\cdot \\frac{1}{\\cos 0} = 1 \\cdot 1 = 1",
          annotation: "",
        },
      ],
      answer: "1",
    },
    {
      id: "ch1-laws-c2",
      difficulty: "hard",
      problem:
        "Prove the Product Law: if \\lim_{x \\to c} f(x) = L and \\lim_{x \\to c} g(x) = M, then \\lim_{x \\to c} f(x)g(x) = LM.",
      hint: "Write |f·g − LM| = |f·g − Lg + Lg − LM| and use the triangle inequality. You will need to bound |f| near c.",
      walkthrough: [
        {
          expression: "|f(x)g(x) - LM|",
          annotation: "We want to show this is < ε.",
        },
        {
          expression: "= |f(x)g(x) - Lg(x) + Lg(x) - LM|",
          annotation: 'Add and subtract Lg(x) — a standard "add zero" trick.',
        },
        {
          expression: "\\leq |f(x)-L|\\cdot|g(x)| + |L|\\cdot|g(x)-M|",
          annotation: "Triangle inequality, then factor.",
        },
        {
          expression:
            "\\text{Bound } |g(x)|: \\text{ since } g \\to M, \\exists\\,\\delta_1: |g(x)| < |M|+1.",
          annotation: "Near c, g(x) is within 1 of M, so |g| < |M|+1.",
        },
        {
          expression:
            "|f(x)g(x)-LM| < |f(x)-L|\\cdot(|M|+1) + |L|\\cdot|g(x)-M|",
          annotation: "",
        },
        {
          expression:
            "\\text{Choose } \\delta_2: |f-L|<\\frac{\\varepsilon}{2(|M|+1)}, \\quad \\delta_3: |g-M|<\\frac{\\varepsilon}{2(|L|+1)}",
          annotation:
            "Use ε/2 for each part (with +1 to avoid division by zero when L = 0).",
        },
        {
          expression:
            "\\text{Total: } < \\frac{\\varepsilon}{2}+\\frac{\\varepsilon}{2} = \\varepsilon \\;\\blacksquare",
          annotation: "Set δ = min(δ₁, δ₂, δ₃).",
        },
      ],
      answer: "Proved via ε-δ with a bounding argument",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "inequalities",
      label: "Prerequisite: Inequalities",
      context:
        "Understanding the Triangle Inequality is strictly required to prove the limit laws.",
    },
    {
      lessonSlug: "fundamental-trig-limits",
      label: "Deep Dive: Fundamental Trig Limits",
      context:
        "If sin(x)/x and (1-cos x)/x feel shaky, use the focused lesson for slower proofs and pattern drills.",
    },
    {
      lessonSlug: "introduction",
      label: "Previous: Introduction to Limits",
      context: "Informal concept and ε-δ definition.",
    },
    {
      lessonSlug: "continuity",
      label: "Next: Continuity",
      context: "A function is continuous if its limit equals its value.",
    },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "lim[fg]",
            "meaning": "the limit of a product equals the product of the limits (when both exist)"
        },
        {
            "symbol": "sin(x)/x",
            "meaning": "the fundamental trig limit — approaches 1 as x→0, not 0/0"
        },
        {
            "symbol": "Squeeze Theorem",
            "meaning": "if g≤f≤h and g,h both approach L, then f is forced to L as well"
        }
    ],
    "rulesOfThumb": [
        "Direct substitution works if the denominator is nonzero and the function is continuous at the point.",
        "When you see sin(ax)/bx, multiply and divide by a to force the pattern sin(u)/u.",
        "A composite limit can pass through a continuous outer function: lim f(g(x)) = f(lim g(x)).",
        "The Squeeze Theorem is the go-to tool whenever a bounded function is multiplied by something → 0."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch1-intro-limits",
            "label": "Previous: Introduction to Limits",
            "note": "The informal ε-δ notion you met there is what the Limit Laws formalize. Each law is a proof that the informal 'approach' behavior is preserved under arithmetic operations."
        },
        {
            "lessonId": "ch0-inequalities",
            "label": "Ch. 0: Inequalities and the Triangle Inequality",
            "note": "The proof of the Sum Law uses |a+b| ≤ |a|+|b|. If that feels unfamiliar, revisit the inequalities lesson before reading the rigor section here."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch1-continuity",
            "label": "Next: Continuity",
            "note": "A function is continuous at c iff the Limit Laws guarantee lim f(x) = f(c). Every continuous-function limit in Chapters 2–4 is justified by what you learn here."
        },
        {
            "lessonId": "ch2-trig-derivatives",
            "label": "Ch. 2: Trig Derivatives",
            "note": "The derivative of sin(x) requires lim(h→0) sin(h)/h = 1. That IS the fundamental trig limit from this lesson — you will use it directly in the derivation of d/dx[sin x] = cos x."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "ll-assess-1",
            "type": "input",
            "text": "Evaluate lim(x→0) sin(3x) / x.",
            "answer": "3",
            "hint": "Factor: sin(3x)/x = 3·[sin(3x)/(3x)]. Let u=3x; as x→0, u→0 and sin(u)/u→1."
        },
        {
            "id": "ll-assess-2",
            "type": "input",
            "text": "Evaluate lim(x→0) x²·sin(1/x).",
            "answer": "0",
            "hint": "Since |sin(1/x)| ≤ 1, we have -x² ≤ x²sin(1/x) ≤ x². Both bounds → 0. Squeeze Theorem."
        },
        {
            "id": "ll-assess-3",
            "type": "choice",
            "text": "Which technique evaluates lim(x→2) (3x²-x+1)/(x+5)?",
            "options": [
                "Factor and cancel",
                "Direct substitution (denominator is 7≠0)",
                "Squeeze Theorem",
                "Conjugate multiplication"
            ],
            "answer": "Direct substitution (denominator is 7≠0)",
            "hint": "Check the denominator first: x+5 at x=2 is 7. Nonzero means direct substitution is valid."
        },
        {
            "id": "ll-assess-4",
            "type": "input",
            "text": "What does lim(x→0) tan(x)/x equal?",
            "answer": "1",
            "hint": "tan x = sin x / cos x. Write as [sin x / x] · [1 / cos x]. First factor → 1, second → 1/cos(0) = 1."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Limit Laws = arithmetic operations distribute through limits",
    "sin(x)/x → 1 as x→0 (not 0/0 — this is a provable result)",
    "Squeeze Theorem = bound a wild function between two tame ones",
    "Direct substitution = valid iff denominator nonzero and function continuous"
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
};
