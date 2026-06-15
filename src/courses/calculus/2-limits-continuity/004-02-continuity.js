export default {
  id: "ch1-continuity",
  slug: "continuity",
  chapter: 1,
  order: 2,
  title: "Continuity",
  subtitle: "Functions you can draw without lifting your pencil",
  tags: [
    "continuity",
    "continuous",
    "discontinuity",
    "removable",
    "jump",
    "infinite",
    "IVT",
    "intermediate value theorem",
  ],

  hook: {
    question:
      "When you drive from point A to point B, must your speedometer pass through every speed in between?",
    realWorldContext:
      "Yes! If you're going 0 mph and then 60 mph, your speed must have been every value between 0 and 60 at some point. " +
      "This is the **Intermediate Value Theorem** — and it only works because your speed is a continuous function of time. " +
      'Continuity is the formal way of saying "no sudden jumps" — and it\'s what makes IVT, the Mean Value Theorem, ' +
      "and the Fundamental Theorem of Calculus all work.",
    previewVisualizationId: "ContinuityViz",
  },
  intuition: {
    prose: [
      '**You have been computing limits for two lessons now. Here is the payoff.** A limit tells you what $f(x)$ is *heading toward* as $x$ approaches $c$. But every time you evaluated a limit, you checked: is the denominator zero? Can I substitute directly? The reason some functions let you substitute and others don\'t is **continuity**. Continuous functions are the "well-behaved" ones where the limit and the value agree. Everything else is a special case.',

      '**The pencil test.** Imagine drawing the graph of a function without lifting your pencil. If you can do it over an interval, the function is continuous there. The moment you have to lift your pencil — to jump to a new height, or skip over a hole, or avoid a vertical spike — you have a discontinuity. This physical test captures the essential idea, even if it is not quite rigorous enough for proofs.',

      '**Three conditions, all required.** A function $f$ is continuous at a point $c$ if and only if ALL three of these hold simultaneously: (1) $f(c)$ exists — the function is actually defined there; (2) $\\lim_{x \\to c} f(x)$ exists — both sides approach the same value; (3) $\\lim_{x \\to c} f(x) = f(c)$ — the limit and the function value match. Miss any one of them and the function is discontinuous at $c$. Each condition catches a different failure mode.',

      '**Removable discontinuity (hole).** The limit exists but the function either is not defined at $c$, or is defined but at the wrong height. Example: $f(x) = (x^2-1)/(x-1)$ simplifies to $x+1$ for $x \\neq 1$, but is undefined at $x=1$. The limit as $x \\to 1$ is $2$. There is a hole at $(1, 2)$. We say this discontinuity is "removable" because we can patch it: just define $f(1) = 2$ and the function becomes continuous. The hole is an artifact of how the function was written, not a genuine break in the graph.',

      '**Jump discontinuity.** Both one-sided limits exist but they give different values, so the two-sided limit does not exist. The function literally jumps from one level to another. The floor function $\\lfloor x \\rfloor$ is the classic example: at every integer, the left-hand limit is one number and the right-hand limit is one higher. You cannot patch a jump by redefining one point — it is a genuine break.',

      '**Infinite discontinuity.** The function grows without bound (heads toward $\\pm \\infty$) as $x \\to c$. The example everyone knows: $f(x) = 1/x$ at $x = 0$. From the right, $1/x \\to +\\infty$; from the left, $1/x \\to -\\infty$. There is a vertical asymptote at $x = 0$. No limit exists, and no amount of redefining fixes it.',

      '**Continuity on an interval.** A function is continuous on an open interval $(a, b)$ if it is continuous at every single point in that interval. For a closed interval $[a, b]$, we also require one-sided continuity at the endpoints: the right-hand limit equals $f(a)$ at $a$, and the left-hand limit equals $f(b)$ at $b$. Polynomials, trig functions, exponentials, and logarithms (on their domains) are all continuous everywhere they are defined. These are your "safe" functions for direct substitution.',

      '**Why does any of this matter?** Because continuity is the hypothesis of every major theorem in Calculus 1: the Intermediate Value Theorem, the Extreme Value Theorem, the Mean Value Theorem, and the Fundamental Theorem of Calculus. The reason those theorems work is that continuous functions do not have hidden jumps or holes that could cause the conclusion to fail.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Three Conditions for Continuity at $c$',
        body: '\\text{(1) } f(c) \\text{ exists.} \\\\ \\text{(2) } \\lim_{x \\to c} f(x) \\text{ exists.} \\\\ \\text{(3) } \\lim_{x \\to c} f(x) = f(c). \\\\ \\text{All three must hold simultaneously.}',
      },
      {
        type: 'misconception',
        title: 'Continuous Does NOT Mean Differentiable',
        body: '$f(x) = |x|$ is continuous at $x=0$: $f(0) = 0$, both one-sided limits are $0$, and they match. But it has a sharp corner there, so it is NOT differentiable at $0$. Continuity allows corners; differentiability requires smoothness.',
      },
      {
        type: 'history',
        title: "Bolzano's 1817 Breakthrough",
        body: 'Bernard Bolzano gave one of the first rigorous statements of continuity and the Intermediate Value Principle in 1817, years before Cauchy formalized it in his textbook. His motivation was purely logical: he wanted to prove that a continuous function that changes sign must cross zero, without appealing to geometric intuition.',
      },
    ],
    visualizationId: "ContinuityViz",
    visualizationProps: {},
    visualizations: [
      {
        id: "Ch3_3_InfiniteStaircase",
        title: "Story Viz — The Infinite Staircase",
        mathBridge: 'This staircase represents the floor function $\\lfloor x \\rfloor$, the classic jump-discontinuity function. At every integer $n$, the function leaps from $n-1$ up to $n$. Notice: the limit from the left is $n-1$, the limit from the right is $n$, and they disagree. So condition (2) fails — the two-sided limit does not exist at any integer. The staircase shape makes it obvious; the limit definition makes it rigorous.',
        caption:
          "Book 3 Chapter 3 story visualization for continuity breakdowns and jump discontinuities.",
      },
      {
        id: "ContinuityRepairGame",
        title: "Continuity Repair Game",
        mathBridge: 'A function $f$ is continuous at $c$ iff all three conditions hold: (1) $f(c)$ is defined, (2) $\\lim_{x\\to c}f(x)$ exists, and (3) $\\lim_{x\\to c}f(x) = f(c)$. In this game, the limit already exists (both sides agree) but $f(c)$ is placed at the wrong height — violating condition (3). Drag the point to match the limit value to restore continuity. This is a removable discontinuity: it can be “repaired” by redefining exactly one point.',
        caption:
          "Drag the broken point to match the limit and repair continuity in real time.",
      },
    ],
  },

  math: {
    prose: [
      'The formal definition packages the three intuitive conditions into one equation: $f$ is continuous at $c$ if $\\lim_{x \\to c} f(x) = f(c)$. This single equation secretly requires all three conditions: for it to make sense, $f(c)$ must be defined (condition 1); for $\\lim_{x \\to c} f(x)$ to exist, both sides must agree (condition 2); and the equation requires they agree with $f(c)$ (condition 3).',

      'Continuity is **closed under algebra**: if $f$ and $g$ are both continuous at $c$, then so are $f+g$, $f-g$, $f \\cdot g$, and $f/g$ (as long as $g(c) \\neq 0$). Composition is also preserved: if $g$ is continuous at $c$ and $f$ is continuous at $g(c)$, then $f(g(x))$ is continuous at $c$. These facts are what justify saying polynomials, rational functions (where defined), trig, exponentials, and logs are continuous on their domains without proving it from scratch every time.',

      '**The Intermediate Value Theorem (IVT)** is the first great consequence of continuity. It says that continuous functions cannot skip values. If $f(a) = -3$ and $f(b) = 7$, then somewhere in between, $f$ must equal every value from $-3$ to $7$: every integer, every irrational, $\\pi$, $\\sqrt{2}$, all of them. A function with a gap or jump could avoid a target value entirely — continuity prevents that.',

      '**How to use IVT**: to show a function has a root (solution to $f(c) = 0$), find two points $a$ and $b$ where $f$ changes sign: $f(a) < 0$ and $f(b) > 0$ (or vice versa). If $f$ is continuous on $[a,b]$, then IVT guarantees a root exists in $(a, b)$. IVT does not tell you where the root is — only that it exists. Numerical methods (like the Bisection Method in Chapter 3) can then find it.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Continuity at a Point',
        body: 'f \\text{ is continuous at } c \\iff \\lim_{x \\to c} f(x) = f(c). \\\\ \\text{(Requires: } f(c) \\text{ defined, limit exists, and they equal.)}',
      },
      {
        type: 'theorem',
        title: 'Intermediate Value Theorem (IVT)',
        body: '\\text{If } f \\text{ is continuous on } [a, b] \\text{ and } k \\text{ is any value with } f(a) \\leq k \\leq f(b), \\\\ \\text{then } \\exists\\, c \\in (a, b) \\text{ such that } f(c) = k.',
      },
    ],
    visualizationId: "ContinuityViz",
    visualizationProps: { showIVT: true },

    visualizations: [
          ],
  },

  rigor: {
    prose: [
      "A function is called **uniformly continuous** on an interval if the δ in the ε-δ definition can be chosen to work for all points simultaneously (not just near one point).",
      "The **Extreme Value Theorem**: if f is continuous on a closed interval [a,b], then f attains its maximum and minimum values somewhere on [a,b].",
      "These theorems (IVT, EVT) are consequences of the completeness of ℝ — they fail for rational numbers.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Extreme Value Theorem (EVT)",
        body: "If f is continuous on [a, b], then \\exists\\, x_{\\min}, x_{\\max} \\in [a,b] such that f(x_{\\min}) \\leq f(x) \\leq f(x_{\\max}) for all x \\in [a,b].",
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: "ex-check-continuity",
      title: "Checking Continuity at a Point",
      problem:
        "Is f(x) = \\dfrac{x^2 - 4}{x - 2} continuous at x = 2? If not, what type of discontinuity?",
      visualizationId: "ContinuityViz",
      params: { variant: "Removable (hole)", hideSelector: true },
      steps: [
        {
          expression: "\\text{Check (1): Is } f(2) \\text{ defined?}",
          annotation: "Substitute x = 2: (4−4)/(2−2) = 0/0. Undefined. ✗",
        },
        {
          expression:
            "\\text{Check (2): Does } \\lim_{x \\to 2} f(x) \\text{ exist?}",
          annotation:
            "Factor and cancel: (x²−4)/(x−2) = (x+2)(x−2)/(x−2) = x+2 for x ≠ 2.",
        },
        {
          expression: "\\lim_{x \\to 2} (x+2) = 4",
          annotation: "The limit exists and equals 4.",
        },
        {
          expression:
            "\\text{Since f(2) is undefined, f is NOT continuous at x = 2.}",
          annotation: "Condition (1) fails.",
        },
        {
          expression: "\\text{Type: removable discontinuity (hole at (2, 4)).}",
          annotation:
            "The limit exists — we just have a missing point. Fixable by defining f(2) = 4.",
        },
      ],
      conclusion:
        "Not continuous at x = 2 — removable discontinuity. Define f(2) = 4 to make it continuous.",
    },
    {
      id: "ex-ivt",
      title: "Applying the Intermediate Value Theorem",
      problem:
        "Show that the equation x^5 - x - 1 = 0 has at least one real root.",
      steps: [
        {
          expression: "f(x) = x^5 - x - 1",
          annotation:
            "Define f. It is a polynomial, hence continuous everywhere.",
        },
        {
          expression: "f(1) = 1 - 1 - 1 = -1 < 0",
          annotation: "Evaluate at x = 1.",
        },
        {
          expression: "f(2) = 32 - 2 - 1 = 29 > 0",
          annotation: "Evaluate at x = 2.",
        },
        {
          expression: "f(1) < 0 < f(2)",
          annotation:
            "f changes sign on [1, 2]. The value 0 is between f(1) and f(2).",
        },
        {
          expression:
            "\\text{By IVT: } \\exists\\, c \\in (1, 2) \\text{ s.t. } f(c) = 0",
          annotation:
            "f is continuous on [1,2] and 0 is between f(1) = −1 and f(2) = 29.",
        },
      ],
      conclusion:
        "The equation has at least one root in (1, 2). IVT guarantees existence — it doesn't find the root explicitly.",
    },
    {
      id: "ex-find-k",
      title: "Making a Piecewise Function Continuous",
      problem:
        "Find k so that f(x) = \\begin{cases} kx^2 - 3 & x \\leq 2 \\\\ x + k & x > 2 \\end{cases} is continuous at x = 2.",
      steps: [
        {
          expression: "\\lim_{x \\to 2^-} f(x) = k(2)^2 - 3 = 4k - 3",
          annotation: "Left-hand limit: use the first piece.",
        },
        {
          expression: "\\lim_{x \\to 2^+} f(x) = 2 + k",
          annotation: "Right-hand limit: use the second piece.",
        },
        {
          expression: "f(2) = k(2)^2 - 3 = 4k - 3",
          annotation: "Function value at x = 2 (use piece defined for x ≤ 2).",
        },
        {
          expression: "\\text{For continuity: } 4k - 3 = 2 + k",
          annotation: "Set left limit = right limit = f(2).",
        },
        {
          expression: "3k = 5 \\implies k = \\frac{5}{3}",
          annotation: "Solve for k.",
        },
      ],
      conclusion:
        "k = 5/3 makes the function continuous at x = 2. Check: left limit = 4(5/3)−3 = 20/3−9/3 = 11/3. Right limit = 2 + 5/3 = 11/3. ✓",
    },
    {
      id: "ex-parachute-velocity",
      title: "Physics: Is There a Jump in Velocity When a Parachute Opens?",
      problem:
        "A skydiver's vertical velocity is modeled by v(t)= -50 + 4t for t<8 (free fall before chute deployment) and v(t)= -18 - 2e^{-0.7(t-8)} for t>=8 (after deployment). Is v(t) continuous at t=8?",
      steps: [
        {
          expression: "v(8^-) = -50 + 4(8) = -18",
          annotation:
            "Compute the left-hand limit from the pre-deployment model.",
        },
        {
          expression: "v(8^+) = -18 - 2e^{-0.7(0)} = -18 - 2 = -20",
          annotation:
            "Compute the right-hand limit from the post-deployment model.",
        },
        {
          expression: "v(8^-) = -18 \neq -20 = v(8^+)",
          annotation:
            "Left and right limits disagree, so the two-sided limit does not exist.",
        },
        {
          expression: "\\therefore v(t) \\text{ is not continuous at } t=8",
          annotation: "The model predicts a jump in velocity at deployment.",
        },
      ],
      conclusion:
        "In this model the velocity has a jump discontinuity at deployment time. Real systems usually smooth this transition over a short interval, but piecewise models often include intentional jumps to represent abrupt regime changes.",
    },
    {
      id: "ex-piecewise-checklist-pass",
      title: "Piecewise Continuity Checklist — Pass Case",
      problem:
        "Check continuity at x=2 for f(x)=x^2-1 (x<2), f(2)=3, f(x)=2x-1 (x>2).",
      visualizationId: "ContinuityViz",
      params: { variant: "Continuous", hideSelector: true },
      steps: [
        { expression: "f(2)=3", annotation: "Condition 1: value exists." },
        {
          expression: "\\lim_{x\\to2^-}(x^2-1)=3",
          annotation: "Condition 2a: left limit.",
        },
        {
          expression: "\\lim_{x\\to2^+}(2x-1)=3",
          annotation: "Condition 2b: right limit.",
        },
        {
          expression: "\\lim_{x\\to2}f(x)=3=f(2)",
          annotation: "Condition 3: limit equals value.",
        },
      ],
      conclusion: "All three conditions pass, so f is continuous at x=2.",
    },
    {
      id: "ex-piecewise-checklist-fail",
      title: "Piecewise Continuity Checklist — Fail Case",
      problem: "Check continuity at x=0 for h(x)=x^2 (x<0), h(x)=x+1 (x>=0).",
      visualizationId: "ContinuityViz",
      params: { variant: "Jump", hideSelector: true },
      steps: [
        { expression: "h(0)=1", annotation: "Value exists." },
        { expression: "\\lim_{x\\to0^-}x^2=0", annotation: "Left limit." },
        { expression: "\\lim_{x\\to0^+}(x+1)=1", annotation: "Right limit." },
        {
          expression:
            "0\\neq 1 \\Rightarrow \\lim_{x\\to0}h(x)\\text{ does not exist}",
          annotation: "Left and right disagree.",
        },
      ],
      conclusion:
        "h is not continuous at x=0 because the two-sided limit fails.",
    },
    {
      id: "ex-piecewise-parameter-c",
      title: "Solve Parameter c for Continuity at a Join",
      problem:
        "Find c so f is continuous at x=2: f(x)=cx^2+1 (x<=2), f(x)=x+c (x>2).",
      visualizationId: "CompositionVisualization",
      steps: [
        {
          expression: "\\lim_{x\\to2^-}f(x)=4c+1",
          annotation: "Left-branch value at the join.",
        },
        {
          expression: "\\lim_{x\\to2^+}f(x)=2+c",
          annotation: "Right-branch value at the join.",
        },
        {
          expression: "4c+1=2+c \\Rightarrow 3c=1 \\Rightarrow c=1/3",
          annotation: "Set equal to enforce continuity.",
        },
      ],
      conclusion:
        "c=1/3 is the unique value that removes the join discontinuity.",
    },
  ],

  challenges: [
    {
      id: "ch1-cont-c1",
      difficulty: "medium",
      problem:
        "Use IVT to prove that every cubic polynomial has at least one real root.",
      hint: "Consider a cubic p(x) = x³ + bx² + cx + d. What happens to p(x) as x → +∞ and as x → −∞?",
      walkthrough: [
        {
          expression: "p(x) = x^3 + bx^2 + cx + d",
          annotation: "General cubic (leading coefficient 1, WLOG).",
        },
        {
          expression: "\\lim_{x \\to +\\infty} p(x) = +\\infty",
          annotation: "x³ dominates as x → +∞.",
        },
        {
          expression: "\\lim_{x \\to -\\infty} p(x) = -\\infty",
          annotation: "x³ dominates and is negative as x → −∞.",
        },
        {
          expression:
            "\\exists\\; M > 0 \\text{ s.t. } p(M) > 0 \\text{ and } p(-M) < 0",
          annotation: "By the limit definition, we can find large enough M.",
        },
        {
          expression:
            "p \\text{ is a polynomial, hence continuous on } [-M, M]",
          annotation: "",
        },
        {
          expression:
            "p(-M) < 0 < p(M) \\implies \\exists\\, c \\in (-M,M) \\text{ s.t. } p(c) = 0",
          annotation: "By IVT, p hits 0 somewhere between −M and M. ∎",
        },
      ],
      answer: "Proved: every cubic has a real root",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "limit-laws",
      label: "Previous: Limit Laws",
      context: "Continuity is defined using limits.",
    },
    {
      lessonSlug: "epsilon-delta",
      label: "Next: Epsilon-Delta",
      context: "Make the definition of limit rigorous.",
    },
    {
      lessonSlug: "tangent-problem",
      label: "Coming: Derivatives",
      context: "Differentiability implies continuity.",
    },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "f continuous at c",
            "meaning": "three conditions: f(c) defined, lim exists, and they are equal"
        },
        {
            "symbol": "removable discontinuity",
            "meaning": "the limit exists but f(c) is wrong or missing — fixable by redefining one point"
        },
        {
            "symbol": "jump discontinuity",
            "meaning": "left and right limits both exist but differ — a true break, not fixable by redefining a point"
        },
        {
            "symbol": "IVT",
            "meaning": "if f is continuous on [a,b] and k is between f(a) and f(b), then f hits k somewhere inside"
        }
    ],
    "rulesOfThumb": [
        "Check the three-part checklist in order: (1) defined? (2) limit exists? (3) match?",
        "Polynomials, trig, exponential, log — continuous everywhere on their domains.",
        "Piecewise functions: check continuity at every breakpoint by matching left and right limits.",
        "IVT proves existence of a root when f changes sign on a continuous interval."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch1-limit-laws",
            "label": "Previous: Limit Laws",
            "note": "Continuity is defined using limits. The limit must exist AND match f(c). The Limit Laws tell you when you can compute that limit by direct substitution — which is exactly when the function is continuous."
        },
        {
            "lessonId": "ch1-intro-limits",
            "label": "Ch. 1: Introduction to Limits",
            "note": "You learned that the limit cares about the journey (approaching c) not the destination (f(c)). Continuity is the special case where the journey and the destination agree."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch2-tangent-problem",
            "label": "Ch. 2: Differentiability",
            "note": "Differentiability implies continuity (proven there). Continuity is necessary but not sufficient for differentiability — the function |x| is continuous at 0 but not differentiable."
        },
        {
            "lessonId": "ch3-mean-value-theorem",
            "label": "Ch. 3: Mean Value Theorem",
            "note": "The MVT and its corollaries require continuity on [a,b]. Without continuity, the conclusions fail. The IVT you prove here is a precursor to the same style of argument."
        },
        {
            "lessonId": "ch4-fundamental-theorem",
            "label": "Ch. 4: Fundamental Theorem of Calculus",
            "note": "FTC Part 2 requires f to be continuous on [a,b]. Discontinuities inside the interval invalidate the evaluation formula — a critical error to avoid."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "cont-assess-1",
            "type": "choice",
            "text": "f(c) = 5 but lim(x→c) f(x) = 3. This is a:",
            "options": [
                "Removable discontinuity",
                "Jump discontinuity",
                "Infinite discontinuity",
                "No discontinuity — it is continuous"
            ],
            "answer": "Removable discontinuity",
            "hint": "The limit exists (3) but does not match f(c) = 5. Fixable by redefining f(c) = 3."
        },
        {
            "id": "cont-assess-2",
            "type": "input",
            "text": "For f(x) = (x²-4)/(x-2), what value should f(2) be set to for f to be continuous at x=2?",
            "answer": "4",
            "hint": "Factor: x²-4=(x+2)(x-2). Cancel (x-2) to get x+2. At x=2 that is 4."
        },
        {
            "id": "cont-assess-3",
            "type": "choice",
            "text": "Which theorem guarantees that x⁵ - x - 1 = 0 has a real root?",
            "options": [
                "Mean Value Theorem",
                "Intermediate Value Theorem",
                "Squeeze Theorem",
                "Extreme Value Theorem"
            ],
            "answer": "Intermediate Value Theorem",
            "hint": "f(1) = -1 < 0 and f(2) = 29 > 0. f is continuous (polynomial). By IVT, f = 0 somewhere in (1,2)."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Continuity = limit equals function value (3 conditions)",
    "Removable = limit exists, value wrong (patchable)",
    "Jump = both sides exist but differ (not patchable)",
    "IVT = sign change on continuous function → root inside"
],

  checkpoints: [
    "read-intuition",
    "read-math",
    "completed-example-1",
    "completed-example-2",
    "solved-challenge",
  ],

  quiz: [
    {
      id: 'cont-q1',
      type: 'choice',
      text: 'A function $f$ is continuous at $x = c$ if and only if which THREE conditions all hold?',
      options: [
        '$f(c)$ exists, $\\lim_{x\\to c}f(x)$ exists, and they are equal',
        '$f(c)$ exists, $f$ is differentiable at $c$, and $\\lim = f(c)$',
        'The limit exists and $f$ has no holes',
        '$f$ is defined everywhere and has no vertical asymptotes',
      ],
      answer: '$f(c)$ exists, $\\lim_{x\\to c}f(x)$ exists, and they are equal',
      reviewSection: 'Intuition tab — three conditions for continuity',
    },
    {
      id: 'cont-q2',
      type: 'choice',
      text: 'Which type of discontinuity can be "fixed" by redefining the function at one point?',
      options: ['Jump discontinuity', 'Infinite discontinuity', 'Removable discontinuity', 'Oscillatory discontinuity'],
      answer: 'Removable discontinuity',
      reviewSection: 'Math tab — types of discontinuity',
    },
    {
      id: 'cont-q3',
      type: 'input',
      text: 'Is $f(x) = \\dfrac{x^2-9}{x-3}$ continuous at $x = 3$? Answer "yes" or "no".',
      answer: 'no',
      hints: [
        'Check: is $f(3)$ defined? Substitute $x = 3$ into the denominator.',
        'The function is undefined at $x = 3$, so it fails the first continuity condition.',
      ],
      reviewSection: 'Intuition tab — this function has a removable discontinuity at x=3',
    },
    {
      id: 'cont-q4',
      type: 'choice',
      text: 'Polynomials are continuous on:',
      options: ['Their natural domain only', 'All real numbers $(-\\infty, \\infty)$', 'Only where they are positive', 'Intervals where they have no roots'],
      answer: 'All real numbers $(-\\infty, \\infty)$',
      reviewSection: 'Math tab — continuity of common functions',
    },
    {
      id: 'cont-q5',
      type: 'input',
      text: 'For $g(x) = \\begin{cases} 2x+1 & x<1 \\\\ k & x=1 \\\\ x^2+2 & x>1 \\end{cases}$, what value of $k$ makes $g$ continuous at $x=1$?',
      answer: '3',
      hints: [
        'For continuity: left limit = right limit = $g(1) = k$.',
        'Left limit: $2(1)+1=3$. Right limit: $1^2+2=3$. So $k$ must equal both.',
      ],
      reviewSection: 'Math tab — continuity at a point for piecewise functions',
    },
    {
      id: 'cont-q6',
      type: 'choice',
      text: 'At a jump discontinuity, which condition fails?',
      options: [
        'f(c) is undefined',
        'The two-sided limit exists but differs from f(c)',
        'The left- and right-hand limits both exist but are not equal to each other',
        'The function oscillates infinitely near c',
      ],
      answer: 'The left- and right-hand limits both exist but are not equal to each other',
      reviewSection: 'Math tab — jump vs removable discontinuity',
    },
    {
      id: 'cont-q7',
      type: 'choice',
      text: 'Where is $f(x) = \\tan x$ discontinuous?',
      options: [
        'At every integer multiple of $\\pi$',
        'At $x = \\pi/2 + n\\pi$ for integer $n$',
        'At $x = n\\pi$ for integer $n$',
        'It is continuous everywhere',
      ],
      answer: 'At $x = \\pi/2 + n\\pi$ for integer $n$',
      reviewSection: 'Math tab — continuity of trig functions',
    },
    {
      id: 'cont-q8',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 2} \\ln(x^2 - 3)$.',
      answer: '0',
      hints: [
        'ln is continuous on $(0, \\infty)$. Substitute directly: $\\ln(4-3) = \\ln(1)$.',
      ],
      reviewSection: 'Math tab — continuity allows direct substitution inside continuous functions',
    },
    {
      id: 'cont-q9',
      type: 'choice',
      text: 'If $f$ and $g$ are both continuous at $c$, which of the following is NOT guaranteed to be continuous at $c$?',
      options: ['$f + g$', '$f \\cdot g$', '$f / g$', 'All are guaranteed'],
      answer: '$f / g$',
      reviewSection: 'Math tab — quotient of continuous functions; fails if g(c) = 0',
    },
    {
      id: 'cont-q10',
      type: 'input',
      text: 'Composition rule: if $g$ is continuous at $c$ and $f$ is continuous at $g(c)$, then $\\lim_{x\\to c} f(g(x)) = $ ?',
      answer: 'f(g(c))',
      hints: [
        'Continuity lets you "move the limit inside" the outer function.',
        'The answer is the composition evaluated at the point c.',
      ],
      reviewSection: 'Rigor tab — continuity of compositions',
    },
  ],
};
