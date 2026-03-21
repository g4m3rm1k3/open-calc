// FILE: src/content/chapter-3/02a-rolles-theorem.js
export default {
  id: 'ch3-025',
  slug: 'rolles-theorem',
  chapter: 3,
  order: 2.5,
  title: "Rolle's Theorem",
  subtitle: 'If you start and end at the same height, there must be a horizontal tangent somewhere in between',
  tags: ['Rolle theorem', 'horizontal tangent', 'critical point', 'existence theorem', 'mean value theorem'],

  hook: {
    question: "If you drive from your house to a friend's house and back home again, must there be a moment during the trip when your velocity is exactly zero? Why?",
    realWorldContext: "Imagine tossing a ball straight up. It leaves your hand going upward and returns to your hand going downward. At some instant in between, the ball's velocity must have been exactly zero — the peak of the trajectory. This is Rolle's Theorem in action: whenever a continuous quantity starts and ends at the same value, its rate of change must hit zero at some intermediate point. This principle underlies root-counting arguments in algebra, stability analysis in engineering, and error bounds in numerical analysis. Rolle's Theorem is also the stepping stone to the Mean Value Theorem, one of the most powerful results in all of calculus.",
    previewVisualizationId: 'MVTViz',
  },

  intuition: {
    prose: [
      "Rolle's Theorem makes a beautifully simple claim: if a function starts and ends at the same height on some interval, and if the function is smooth enough (continuous on the closed interval, differentiable on the open interval), then somewhere in between there must be a point where the tangent line is perfectly horizontal. The derivative is zero at that point.",
      "Think about it graphically. You are drawing a curve that starts at the point $(a, f(a))$ and must end at the point $(b, f(b))$ where $f(a) = f(b)$. The curve must be unbroken (continuous) and smooth (differentiable). If the curve goes up at any point, it must eventually come back down to meet the same height at $b$ — and that means there is a peak somewhere with a horizontal tangent. If it goes down first, there must be a valley. If it stays perfectly flat, then $f'(c) = 0$ everywhere. No matter what path the curve takes, a horizontal tangent is unavoidable.",
      "The ball-tossing analogy is the most natural example. Let $f(t)$ be the height of a ball at time $t$. You throw it at time $a$ and catch it at time $b$ at the same height: $f(a) = f(b)$. The height function is continuous and differentiable (we ignore air resistance). Therefore, there exists some time $c$ between $a$ and $b$ where $f'(c) = 0$ — the ball is momentarily stationary at its peak. You do not need to solve any equations to know this; Rolle's Theorem guarantees it purely from the boundary conditions.",
      "Why do we need the hypotheses? Continuity is essential: if the function can jump, it could leap from $f(a)$ up to some value and then jump back down to $f(b) = f(a)$ without ever having a horizontal tangent. Differentiability is also needed: the function $f(x) = |x|$ on $[-1, 1]$ has $f(-1) = f(1) = 1$ and is continuous, but its only candidate for a horizontal tangent is $x = 0$, where the function has a corner and is not differentiable. The minimum at $x = 0$ exists, but there is no derivative there — so Rolle's Theorem does not apply (and indeed $f'(c) = 0$ has no solution).",
      "Rolle's Theorem is actually a special case of the Mean Value Theorem. The MVT says that for any continuous, differentiable function on $[a, b]$, there exists $c$ with $f'(c) = \\frac{f(b) - f(a)}{b - a}$. When $f(a) = f(b)$, the right-hand side becomes zero, and the MVT reduces exactly to Rolle's Theorem. Historically, however, Rolle's Theorem came first, and the MVT is proved using Rolle's Theorem — so the logical order is reversed from the historical order.",
      "One of the most elegant applications of Rolle's Theorem is proving bounds on the number of roots a function can have. If a polynomial $p(x)$ of degree $n$ had $n + 1$ roots, then between each consecutive pair of roots Rolle's Theorem would give a root of $p'(x)$. That produces $n$ roots of $p'(x)$, which is a polynomial of degree $n - 1$. But a degree $n - 1$ polynomial can have at most $n - 1$ roots — contradiction. Therefore $p(x)$ has at most $n$ roots. This argument generalizes to any sufficiently smooth function.",
      "Rolle's Theorem is an existence theorem: it tells you that a point $c$ with $f'(c) = 0$ exists, but it does not tell you what $c$ is or how to find it. This is a common pattern in analysis — many of the deepest results guarantee existence without providing a formula. To actually locate $c$, you must solve $f'(x) = 0$ by other means (algebra, Newton's method, etc.).",
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Extreme Value Theorem Connection',
        body: "Rolle's Theorem relies on the Extreme Value Theorem: a continuous function on a closed interval $[a, b]$ attains its maximum and minimum. If the max or min occurs in the interior and the function is differentiable there, Fermat's Theorem says the derivative is zero.",
      },
      {
        type: 'warning',
        title: 'All Three Hypotheses Are Necessary',
        body: "Rolle's Theorem requires: (1) $f$ continuous on $[a, b]$, (2) $f$ differentiable on $(a, b)$, (3) $f(a) = f(b)$. Drop any one and the conclusion can fail. A jump discontinuity, a corner, or unequal endpoint values can each prevent the existence of a horizontal tangent.",
      },
      {
        type: 'geometric',
        title: 'The Mountain Pass Analogy',
        body: 'Imagine hiking from a trailhead at elevation $h$ to another trailhead at the same elevation $h$, following a continuous smooth path. If you go uphill at any point, you must come back down — and at the highest point of your hike, the trail is momentarily flat (horizontal tangent). If you go downhill, the lowest point is flat. Either way, a flat point exists.',
      },
      {
        type: 'tip',
        title: 'Multiple Horizontal Tangents',
        body: "Rolle's Theorem guarantees at least one $c$ with $f'(c) = 0$, but there may be many. The function $f(x) = \\sin(x)$ on $[0, 2\\pi]$ has $f(0) = f(2\\pi) = 0$ and two points where $f'(c) = \\cos(c) = 0$: $c = \\pi/2$ and $c = 3\\pi/2$.",
      },
      {
        type: 'history',
        title: 'Michel Rolle (1652-1719)',
        body: "Ironically, Michel Rolle was a vocal critic of calculus who considered infinitesimals to be logically unsound. His theorem, published in 1691, was originally stated only for polynomials. The modern version for differentiable functions came later, after the foundations of calculus were made rigorous by Cauchy and Weierstrass.",
      },
    ],
    visualizations: [
      { vizId: 'MVTViz', caption: "Rolle's Theorem: when $f(a) = f(b)$, the MVT guarantees a horizontal tangent between $a$ and $b$." },
    ],
  },

  math: {
    prose: [
      "**Rolle's Theorem (Formal Statement).** Let $f$ be a function satisfying: (i) $f$ is continuous on the closed interval $[a, b]$, (ii) $f$ is differentiable on the open interval $(a, b)$, and (iii) $f(a) = f(b)$. Then there exists at least one point $c \\in (a, b)$ such that $f'(c) = 0$.",
      "The proof uses the Extreme Value Theorem. Since $f$ is continuous on the closed interval $[a, b]$, it attains its absolute maximum value $M$ and absolute minimum value $m$ on $[a, b]$. Case 1: if $M = m$, then $f$ is constant on $[a, b]$, so $f'(c) = 0$ for every $c$ in $(a, b)$. Case 2: if $M \\neq m$, then at least one of $M, m$ differs from $f(a) = f(b)$. The extreme value that differs from the endpoint value must be attained at an interior point $c \\in (a, b)$ (since both endpoints give the same value). At an interior extremum of a differentiable function, Fermat's Theorem gives $f'(c) = 0$.",
      "The relationship between Rolle's Theorem and the Mean Value Theorem is precise. The MVT states: if $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then there exists $c \\in (a, b)$ with $f'(c) = \\frac{f(b) - f(a)}{b - a}$. To prove the MVT from Rolle's Theorem, define the auxiliary function $g(x) = f(x) - \\left[f(a) + \\frac{f(b) - f(a)}{b - a}(x - a)\\right]$. This $g$ subtracts the secant line from $f$, so $g(a) = 0$ and $g(b) = 0$. Applying Rolle's Theorem to $g$ gives a point $c$ with $g'(c) = 0$, which yields $f'(c) = \\frac{f(b) - f(a)}{b - a}$.",
      "**Root-counting application.** If $p(x)$ is a polynomial of degree $n$, then $p$ has at most $n$ real roots. Proof by contradiction: suppose $p$ has $n + 1$ distinct roots $r_1 < r_2 < \\cdots < r_{n+1}$. Between consecutive roots $r_k$ and $r_{k+1}$, we have $p(r_k) = p(r_{k+1}) = 0$, so Rolle's Theorem gives a point $c_k$ with $p'(c_k) = 0$. This produces $n$ distinct roots $c_1, c_2, \\ldots, c_n$ of $p'(x)$. But $p'(x)$ is a polynomial of degree $n - 1$, which can have at most $n - 1$ roots — a contradiction.",
      "**Generalized Rolle's Theorem.** If $f$ vanishes at $n + 1$ distinct points, then $f'$ vanishes at $n$ distinct points (between consecutive roots of $f$), $f''$ vanishes at $n - 1$ points, and by induction $f^{(n)}$ vanishes at least once. This is used to prove error bounds in polynomial interpolation and Taylor's theorem with remainder.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Rolle's Theorem",
        body: "If $f$ is continuous on $[a, b]$, differentiable on $(a, b)$, and $f(a) = f(b)$, then there exists $c \\in (a, b)$ with $f'(c) = 0$.",
      },
      {
        type: 'definition',
        title: 'From Rolle to MVT',
        body: "Define $g(x) = f(x) - f(a) - \\frac{f(b) - f(a)}{b - a}(x - a)$. Then $g(a) = g(b) = 0$, so by Rolle's Theorem there exists $c$ with $g'(c) = 0$, giving $f'(c) = \\frac{f(b) - f(a)}{b - a}$.",
      },
      {
        type: 'warning',
        title: 'Rolle Does Not Find the Point',
        body: "Rolle's Theorem is purely existential. It guarantees $c$ exists but gives no formula for it. To locate $c$, solve $f'(x) = 0$ explicitly.",
      },
    ],
    visualizations: [
      { vizId: 'MVTViz', caption: "When $f(a) = f(b)$, the secant line is horizontal, and Rolle's Theorem guarantees a parallel (horizontal) tangent." },
    ],
  },

  rigor: {
    prose: [
      "**Proof of Rolle's Theorem.** Assume $f$ is continuous on $[a, b]$, differentiable on $(a, b)$, and $f(a) = f(b)$. By the Extreme Value Theorem (which requires continuity on a closed bounded interval), $f$ attains an absolute maximum $M$ at some point $x_M \\in [a, b]$ and an absolute minimum $m$ at some point $x_m \\in [a, b]$.",
      "If $M = m$, then $f$ is constant on $[a, b]$. Every point $c \\in (a, b)$ satisfies $f'(c) = 0$, and the theorem holds trivially.",
      "If $M \\neq m$, then at least one of $M, m$ is not equal to $f(a) = f(b)$. Without loss of generality, suppose $M \\neq f(a)$. Then the maximum is not attained at $a$, and since $f(a) = f(b)$, the maximum is not attained at $b$ either. So $x_M \\in (a, b)$. Since $f$ is differentiable at $x_M$ and $x_M$ is an interior maximum, Fermat's Theorem gives $f'(x_M) = 0$. Set $c = x_M$.",
      "**Fermat's Theorem (used above).** If $f$ has a local extremum at an interior point $c$ and $f'(c)$ exists, then $f'(c) = 0$. Proof: Suppose $c$ is a local maximum. For small $h > 0$, $f(c + h) \\leq f(c)$, so $\\frac{f(c+h) - f(c)}{h} \\leq 0$. Taking $h \\to 0^+$ gives $f'(c) \\leq 0$. For small $h < 0$, $f(c + h) \\leq f(c)$, so $\\frac{f(c+h) - f(c)}{h} \\geq 0$ (the denominator is negative). Taking $h \\to 0^-$ gives $f'(c) \\geq 0$. Together: $f'(c) = 0$.",
      "**Why the hypotheses cannot be weakened.** (1) Continuity failure: define $f(x) = x$ for $x \\in [0, 1)$ and $f(1) = 0$. Then $f(0) = f(1) = 0$ but $f'(x) = 1 \\neq 0$ for all $x \\in (0, 1)$. The jump at $x = 1$ breaks the Extreme Value Theorem. (2) Differentiability failure: $f(x) = 1 - |x|$ on $[-1, 1]$ has $f(-1) = f(1) = 0$, is continuous, but has a corner at $x = 0$ (the maximum) where $f'$ does not exist. The derivative is $-1$ for $x > 0$ and $+1$ for $x < 0$, never zero.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Fermat's Theorem (Interior Extrema)",
        body: "If $f$ has a local extremum at $c$ and $f$ is differentiable at $c$, then $f'(c) = 0$. This does NOT say that $f'(c) = 0$ implies a local extremum — that is the converse, which is false.",
      },
      {
        type: 'warning',
        title: 'Counterexamples When Hypotheses Fail',
        body: "Continuity dropped: $f(x) = x$ for $x \\in [0,1)$ and $f(1) = 0$. Then $f(0) = f(1) = 0$ but $f'(x) = 1 \\neq 0$. Differentiability dropped: $f(x) = 1 - |x|$ on $[-1,1]$ has $f(-1) = f(1) = 0$ but the maximum at $x = 0$ is a corner.",
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch3-025-ex1',
      title: "Verifying Rolle's Theorem for a Quadratic",
      problem: "\\text{Verify Rolle's Theorem for } f(x) = x^2 - 4x + 3 \\text{ on } [1, 3] \\text{ and find the value of } c.",
      steps: [
        { expression: 'f(1) = 1 - 4 + 3 = 0, \\quad f(3) = 9 - 12 + 3 = 0', annotation: 'Check that $f(a) = f(b)$. Both endpoints give 0, so condition (iii) is satisfied.' },
        { expression: 'f(x) = x^2 - 4x + 3 \\text{ is a polynomial}', annotation: 'Polynomials are continuous everywhere and differentiable everywhere. Conditions (i) and (ii) hold on any interval.' },
        { expression: "f'(x) = 2x - 4", annotation: 'Differentiate $f(x) = x^2 - 4x + 3$.' },
        { expression: "2x - 4 = 0 \\Rightarrow x = 2", annotation: "Solve $f'(c) = 0$. The only solution is $c = 2$." },
        { expression: 'c = 2 \\in (1, 3) \\; \\checkmark', annotation: 'Confirm that $c = 2$ lies in the open interval $(1, 3)$.' },
      ],
      conclusion: "Rolle's Theorem is verified: $c = 2$ is the point where $f'(c) = 0$. Geometrically, $f(x) = (x-1)(x-3)$ is a parabola opening upward with roots at 1 and 3, and its vertex (minimum) is at $x = 2$ — the horizontal tangent.",
    },
    {
      id: 'ch3-025-ex2',
      title: "Rolle's Theorem with a Trigonometric Function",
      problem: "\\text{Show that } f(x) = \\sin(x) \\text{ on } [0, \\pi] \\text{ satisfies Rolle's Theorem and find all values of } c.",
      steps: [
        { expression: 'f(0) = \\sin(0) = 0, \\quad f(\\pi) = \\sin(\\pi) = 0', annotation: 'Condition (iii): $f(0) = f(\\pi) = 0$.' },
        { expression: '\\sin(x) \\text{ is continuous on } [0, \\pi] \\text{ and differentiable on } (0, \\pi)', annotation: 'Sine is infinitely differentiable everywhere. Conditions (i) and (ii) hold.' },
        { expression: "f'(x) = \\cos(x)", annotation: 'Differentiate.' },
        { expression: '\\cos(c) = 0 \\Rightarrow c = \\frac{\\pi}{2}', annotation: "Solve $f'(c) = 0$ on $(0, \\pi)$. The only solution is $c = \\pi/2$." },
        { expression: 'f(\\pi/2) = \\sin(\\pi/2) = 1 \\text{ (the maximum)}', annotation: 'At $c = \\pi/2$, the function attains its maximum on $[0, \\pi]$. The horizontal tangent occurs at the peak of the sine wave.' },
      ],
      conclusion: "The unique value is $c = \\pi/2$. This is the peak of the sine arch — exactly where the sine function changes from increasing to decreasing, with a horizontal tangent at its crest.",
    },
    {
      id: 'ch3-025-ex3',
      title: 'Why Rolle Fails Without Differentiability',
      problem: "\\text{Show that } f(x) = |x| \\text{ on } [-1, 1] \\text{ does NOT satisfy the conclusion of Rolle's Theorem, and identify which hypothesis fails.}",
      steps: [
        { expression: 'f(-1) = |-1| = 1, \\quad f(1) = |1| = 1', annotation: 'Condition (iii): $f(-1) = f(1) = 1$. This condition holds.' },
        { expression: 'f(x) = |x| \\text{ is continuous on } [-1, 1] \\; \\checkmark', annotation: 'Condition (i): The absolute value function is continuous everywhere. This holds.' },
        { expression: "f'(0) \\text{ does not exist: } \\lim_{h \\to 0^+} \\frac{|h|}{h} = 1, \\quad \\lim_{h \\to 0^-} \\frac{|h|}{h} = -1", annotation: 'At $x = 0$, the left and right derivatives differ. The function has a corner at the origin.' },
        { expression: "f'(x) = \\begin{cases} -1 & x < 0 \\\\ +1 & x > 0 \\end{cases}", annotation: "For $x \\neq 0$, $f'(x)$ is either $-1$ or $+1$. Neither value is zero." },
        { expression: "\\text{No } c \\in (-1, 1) \\text{ with } f'(c) = 0", annotation: "There is no point in $(-1, 1)$ where the derivative is zero. Rolle's conclusion fails because hypothesis (ii) fails at $x = 0$." },
      ],
      conclusion: "The absolute value function satisfies conditions (i) and (iii) but not (ii) — it is not differentiable at $x = 0$. This single point of non-differentiability is enough to break Rolle's Theorem.",
    },
    {
      id: 'ch3-025-ex4',
      title: 'Using Rolle to Prove a Polynomial Has Exactly One Real Root',
      problem: "\\text{Prove that } p(x) = x^3 + 3x + 1 \\text{ has exactly one real root.}",
      steps: [
        { expression: 'p(0) = 1 > 0, \\quad p(-1) = -1 - 3 + 1 = -3 < 0', annotation: 'By the Intermediate Value Theorem, since $p$ is continuous and changes sign on $[-1, 0]$, there is at least one root in $(-1, 0)$.' },
        { expression: "p'(x) = 3x^2 + 3 = 3(x^2 + 1)", annotation: 'Differentiate $p(x)$.' },
        { expression: "3(x^2 + 1) > 0 \\text{ for all real } x", annotation: "Since $x^2 \\geq 0$, we have $x^2 + 1 \\geq 1 > 0$. So $p'(x) > 0$ everywhere — $p$ is strictly increasing." },
        { expression: "\\text{Suppose } p \\text{ had two roots } r_1 < r_2", annotation: "Assume for contradiction that $p$ has two distinct roots." },
        { expression: "\\text{Rolle's Theorem} \\Rightarrow \\exists\\, c \\in (r_1, r_2) \\text{ with } p'(c) = 0", annotation: "Rolle's Theorem would guarantee a point $c$ between the roots where $p'(c) = 0$." },
        { expression: "\\text{But } p'(x) > 0 \\text{ for all } x. \\text{ Contradiction.}", annotation: "We showed $p'(x) = 3(x^2 + 1) > 0$ everywhere, so no such $c$ can exist. The assumption of two roots is false." },
      ],
      conclusion: "The polynomial $p(x) = x^3 + 3x + 1$ has exactly one real root (in $(-1, 0)$). The IVT gives existence, and Rolle's Theorem (via the contrapositive) gives uniqueness.",
    },
    {
      id: 'ch3-025-ex5',
      title: "Rolle's Theorem with Multiple Interior Zeros",
      problem: "\\text{Find all values of } c \\text{ satisfying Rolle's Theorem for } f(x) = \\sin(2\\pi x) \\text{ on } [0, 1].",
      steps: [
        { expression: 'f(0) = \\sin(0) = 0, \\quad f(1) = \\sin(2\\pi) = 0', annotation: 'Condition (iii): $f(0) = f(1) = 0$.' },
        { expression: "f'(x) = 2\\pi\\cos(2\\pi x)", annotation: 'Differentiate using the chain rule.' },
        { expression: "2\\pi\\cos(2\\pi c) = 0 \\Rightarrow \\cos(2\\pi c) = 0", annotation: "Set $f'(c) = 0$. Since $2\\pi \\neq 0$, we need $\\cos(2\\pi c) = 0$." },
        { expression: '2\\pi c = \\frac{\\pi}{2} + n\\pi \\Rightarrow c = \\frac{1}{4} + \\frac{n}{2}', annotation: 'Solve for $c$.' },
        { expression: 'c \\in (0, 1): \\quad c = \\frac{1}{4} \\;(n=0), \\quad c = \\frac{3}{4} \\;(n=1)', annotation: 'Keep only values in the open interval $(0, 1)$.' },
      ],
      conclusion: "There are two values: $c = 1/4$ and $c = 3/4$. Rolle's Theorem guarantees at least one, but this function — a complete period of a sine wave — has two horizontal tangents: a maximum at $x = 1/4$ and a minimum at $x = 3/4$.",
    },
  ],

  challenges: [
    {
      id: 'ch3-025-ch1',
      difficulty: 'hard',
      problem: "Use Rolle's Theorem to prove that the equation $x^5 + 10x + 3 = 0$ has at most one real root.",
      hint: "Compute $f'(x)$ and show it is always positive. Then use Rolle's Theorem by contradiction.",
      walkthrough: [
        { expression: "f(x) = x^5 + 10x + 3 \\Rightarrow f'(x) = 5x^4 + 10", annotation: 'Differentiate the polynomial.' },
        { expression: "5x^4 + 10 \\geq 10 > 0 \\text{ for all } x", annotation: "Since $x^4 \\geq 0$, we have $f'(x) \\geq 10 > 0$ everywhere." },
        { expression: "\\text{If } f \\text{ had two roots } r_1 < r_2, \\text{ Rolle's gives } c \\in (r_1, r_2) \\text{ with } f'(c) = 0", annotation: "Apply Rolle's Theorem to the interval $[r_1, r_2]$." },
        { expression: "f'(c) \\geq 10 > 0 \\text{ — contradiction}", annotation: "No such $c$ exists since $f'$ is always positive." },
      ],
      answer: "\\text{Since } f'(x) = 5x^4 + 10 > 0 \\text{ for all } x, \\text{ Rolle's Theorem precludes two or more roots.}",
    },
    {
      id: 'ch3-025-ch2',
      difficulty: 'medium',
      problem: "Verify Rolle's Theorem for $f(x) = x(x-2)e^x$ on $[0, 2]$ and find the value(s) of $c$.",
      hint: "Check $f(0) = f(2) = 0$. Use the product rule to find $f'(x)$ and solve $f'(c) = 0$.",
      walkthrough: [
        { expression: 'f(0) = 0 \\cdot (-2) \\cdot 1 = 0, \\quad f(2) = 2 \\cdot 0 \\cdot e^2 = 0', annotation: 'Verify $f(0) = f(2) = 0$.' },
        { expression: "f(x) = (x^2 - 2x)e^x \\Rightarrow f'(x) = (2x - 2)e^x + (x^2 - 2x)e^x = (x^2 - 2)e^x", annotation: "Product rule: combine $(2x-2) + (x^2 - 2x) = x^2 - 2$." },
        { expression: "(c^2 - 2)e^c = 0 \\Rightarrow c^2 = 2 \\Rightarrow c = \\pm\\sqrt{2}", annotation: "Since $e^c > 0$ always, we need $c^2 - 2 = 0$." },
        { expression: 'c = \\sqrt{2} \\approx 1.414 \\in (0, 2) \\; \\checkmark', annotation: "Only $c = \\sqrt{2}$ lies in $(0, 2)$." },
      ],
      answer: "c = \\sqrt{2} \\approx 1.414",
    },
    {
      id: 'ch3-025-ch3',
      difficulty: 'medium',
      problem: "If $f$ is a polynomial of degree 4 with 4 distinct real roots, how many real roots does $f'$ have at minimum? What about $f''$?",
      hint: "Apply Rolle's Theorem between each consecutive pair of roots, then repeat for $f'$.",
      walkthrough: [
        { expression: "\\text{Let } f \\text{ have roots } r_1 < r_2 < r_3 < r_4", annotation: 'Label the four distinct real roots in order.' },
        { expression: "\\text{Rolle's: } f' \\text{ has roots } c_1 \\in (r_1,r_2),\\; c_2 \\in (r_2,r_3),\\; c_3 \\in (r_3,r_4)", annotation: "Between each consecutive pair of roots, Rolle gives at least one root of $f'$. At least 3 roots." },
        { expression: "f' \\text{ has degree 3, so exactly 3 real roots}", annotation: "A cubic has at most 3 roots. Combined with at least 3, $f'$ has exactly 3 real roots." },
        { expression: "\\text{Apply Rolle's again: } f'' \\text{ has at least 2 real roots}", annotation: "Between consecutive roots of $f'$, Rolle gives roots of $f''$. Since $f''$ has degree 2, it has exactly 2 real roots." },
      ],
      answer: "f' \\text{ has at least 3 real roots (exactly 3). } f'' \\text{ has at least 2 real roots (exactly 2).}",
    },
  ],

  crossRefs: [
    { lessonSlug: 'mean-value-theorem', label: 'Mean Value Theorem', context: "The MVT generalizes Rolle's Theorem by dropping the requirement $f(a) = f(b)$. Rolle's Theorem is used to prove the MVT." },
    { lessonSlug: 'curve-sketching', label: 'Curve Sketching', context: "Rolle's Theorem explains why between consecutive zeros of $f$, the derivative $f'$ must vanish — a fact used when analyzing the shape of graphs." },
    { lessonSlug: 'optimization', label: 'Optimization', context: "Rolle's Theorem guarantees critical points exist under the right conditions, which is foundational for optimization problems." },
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
    'attempted-challenge-hard',
    'attempted-challenge-medium-1',
    'attempted-challenge-medium-2',
  ],
}
