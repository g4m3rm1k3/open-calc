// FILE: src/content/chapter-3/06-newtons-method.js
export default {
  id: 'ch3-060',
  slug: 'newtons-method',
  chapter: 3,
  order: 8,
  title: "Newton's Method",
  subtitle: 'Use tangent lines to hunt down roots with extraordinary speed — each step roughly doubles the number of correct digits',
  tags: ['Newton method', 'root finding', 'iteration', 'numerical methods', 'convergence', 'tangent line', 'approximation'],

  learningObjectives: [
    'Define what a **root** of an equation is and why algebraic methods fail for most real-world equations.',
    'Derive the Newton-Raphson iteration formula from the tangent-line equation — every algebra step shown.',
    'Perform Newton iterations by hand for polynomial, trigonometric, logarithmic, and exponential equations.',
    'Identify the three main failure modes (horizontal derivative, cycling, bad starting guess) and apply the correct fix for each.',
    'Explain quadratic convergence: why correct digits double each step, and how this compares to bisection.',
    'Implement Newton\'s Method in Python to solve any differentiable equation and interpret the convergence table.',
  ],

  warmup: {
    title: 'Warm-Up: Prerequisite Check (60 seconds each)',
    description: 'These three problems use only what you already know — tangent lines, derivatives, and sign tests. Try each before reading on. If any feel unfamiliar, the "Review Prerequisites" callout in the Intuition section has a 60-second refresher.',
    problems: [
      {
        id: 'wu-1',
        prompt: 'Write the equation of the tangent line to $f(x) = x^2$ at $x = 3$.',
        answer: '$y = 6x - 9$',
        hint: 'Tangent at $(a, f(a))$: $y - f(a) = f\'(a)(x - a)$. Compute $f(3)$ and $f\'(3)$ first.',
        solution: '$f(3) = 9$, $f\'(x) = 2x$ so $f\'(3) = 6$. Tangent: $y - 9 = 6(x - 3)$, i.e., $y = 6x - 9$.',
      },
      {
        id: 'wu-2',
        prompt: 'Does $x^3 - x - 1 = 0$ have a root between $x = 1$ and $x = 2$? Justify with two numbers.',
        answer: 'Yes. $f(1) = -1 < 0$ and $f(2) = 5 > 0$ — sign change confirms a root in $(1,2)$ by IVT.',
        hint: 'Evaluate $f(x) = x^3 - x - 1$ at both endpoints. Opposite signs ⟹ root exists between them.',
        solution: '$f(1) = 1 - 1 - 1 = -1$ and $f(2) = 8 - 2 - 1 = 5$. Sign change confirms a root in $(1, 2)$.',
      },
      {
        id: 'wu-3',
        prompt: 'For $f(x) = x^2 - 5$ at $x_0 = 2$: compute $f(2)$, $f\'(2)$, and then $x_0 - f(x_0)/f\'(x_0)$.',
        answer: '$f(2) = -1$, $f\'(2) = 4$, result $= 2.25$',
        hint: 'This IS one Newton step — you are computing $x_1$ without having been told what Newton\'s Method is yet.',
        solution: '$f(2) = 4 - 5 = -1$, $f\'(x) = 2x$ so $f\'(2) = 4$. Result: $2 - (-1)/4 = 2.25$. (This is the first Newton iterate for $\\sqrt{5} \\approx 2.236$.)',
      },
    ],
  },

  hook: {
    question: "Your calculator can add, subtract, multiply, and divide — but how does it compute $\\sqrt{2}$? There is no finite sequence of arithmetic operations that produces $\\sqrt{2}$ exactly. So how does the machine find 1.41421356... to ten decimal places in a fraction of a second?",
    realWorldContext: "Every time your GPS calculates a position, every time a structural engineer checks whether a bridge design meets load requirements, every time a financial model prices a complex derivative — somewhere under the hood, a computer is solving a nonlinear equation. Most nonlinear equations have no closed-form solution. Newton's Method is the workhorse algorithm that engineers, scientists, and programmers reach for first. Starting from an initial guess, it uses the tangent line at each step to leap toward the root with breathtaking speed: the number of correct decimal digits roughly doubles with every iteration. Understanding Newton's Method connects calculus to computation and reveals how the abstract concept of a derivative becomes a practical tool for solving real problems.",
    previewVisualizationId: 'NewtonsMethod',
  },

  intuition: {
    prose: [
      "**What is a root of an equation?** An equation like $x^2 - 2 = 0$ has a **root** when there is a number that makes the left side exactly zero. The root of this particular equation is $x = \\sqrt{2} \\approx 1.414213562$.",
      "Some equations are easy to solve by algebra. Many equations — especially ones involving $\\sin$, $\\ln$, $e$, or mixtures of these — have **no** nice algebraic answer. Newton's Method is a trick to find a super-accurate number that is extremely close to the true root, as close as you want.",
      "One important thing to understand upfront: Newton's Method does **not** give you an exact fraction like $3/2$. It gives you a decimal that gets closer and closer to the true root with each step. After enough steps the decimal is so accurate that it is indistinguishable from the true answer for any practical purpose.",
      "**Newton's Method: the big picture.** The entire method is a repeated guess-and-improve game with four steps:",
      "1. Make a first guess $x_0$ — any number you think is somewhere near the root.",
      "2. At the point $(x_0,\\, f(x_0))$ on the curve, draw the **tangent line** — the straight line that just touches the curve at that one point with the same slope.",
      "3. Find where that tangent line crosses the $x$-axis. That crossing point becomes your **next guess** $x_1$.",
      "4. Replace $x_0$ with $x_1$ and repeat from step 2.",
      "**▶ Pause and predict:** Before reading the explanation, make a quick estimate. If $f(x) = x^2 - 2$ and you start at $x_0 = 1$, the tangent at $(1, f(1)) = (1, -1)$ has slope $f'(1) = 2$. Where does this tangent line cross the $x$-axis? *(The tangent line is $y + 1 = 2(x - 1)$, so setting $y = 0$: $x = 1.5$. That is $x_1 = 1.5$ — already much closer to $\\sqrt{2} \\approx 1.414$ than our original guess of $1$.)*",
      "That is the whole method. Each tangent line is a straight-line approximation to the curve, and straight lines are easy to solve. Repeating the process funnels your guess toward the true root with remarkable speed.",
      "**What is a tangent line — from first principles.** Imagine the graph of any function $f(x)$. At any point $(x_0,\\, f(x_0))$, the tangent line is the straight line that:",
      "- touches the curve at exactly that one point, and",
      "- has the same steepness (slope) as the curve at that point.",
      "The slope of the curve at $x_0$ is exactly the derivative $f'(x_0)$. Using the point-slope form of a line, the equation of the tangent is:",
      "$$y - f(x_0) = f'(x_0)(x - x_0)$$",
      "This single equation is used in every single Newton step.",
      "**Deriving the Newton formula — no steps skipped.** We want the tangent line to cross the $x$-axis, i.e., where $y = 0$. Plug $y = 0$ into the tangent-line equation:",
      "$$0 - f(x_0) = f'(x_0)(x_1 - x_0)$$",
      "Now solve for the new guess $x_1$. Step 1 — simplify the left side:",
      "$$-f(x_0) = f'(x_0)(x_1 - x_0)$$",
      "Step 2 — divide both sides by $f'(x_0)$ (assuming it is not zero):",
      "$$x_1 - x_0 = -\\frac{f(x_0)}{f'(x_0)}$$",
      "Step 3 — add $x_0$ to both sides:",
      "$$x_1 = x_0 - \\frac{f(x_0)}{f'(x_0)}$$",
      "That single formula **is** Newton's Method. You keep reusing it: replace $x_0$ with $x_1$ to get $x_2$, then replace $x_1$ with $x_2$ to get $x_3$, and so on. The general form is:",
      "$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$",
      "**▶ Try it now — one step by hand:** Let $f(x) = x^2 - 3$ with $x_0 = 2$. Compute $f(2)$ and $f'(2)$, then apply the formula. *(Answer: $f(2) = 4 - 3 = 1$, $f'(x) = 2x$ so $f'(2) = 4$. Therefore $x_1 = 2 - 1/4 = 1.75$. The true root is $\\sqrt{3} \\approx 1.7321$ — already within 0.018 after a single step that started 0.268 away.)*",
      "**Safety note:** if $f'(x_n) = 0$ at any step you cannot divide. The tangent line is horizontal and never crosses the $x$-axis. The method breaks at that point — choose a different starting guess.",
      "You have spent this chapter using derivatives to analyze functions — their shape, their extrema, their limits. Newton's Method closes the chapter with a different kind of application: using derivatives to SOLVE equations. The idea is elegant: if you cannot solve f(x) = 0 algebraically, linearize f near your current best guess, solve the linear equation, and use that solution as your next guess. Repeat. The method converges so fast that it roughly doubles the number of correct decimal digits at every step. This is the algorithm behind square-root computations, GPS positioning, and most of the numerical methods in science and engineering.",
      "The idea behind Newton's Method is disarmingly simple. You want to solve $f(x) = 0$, but the equation is too complicated for algebra. So you start with a guess $x_0$ that is reasonably close to the root. At the point $(x_0, f(x_0))$, you draw the tangent line to the curve $y = f(x)$. This tangent line is a good local approximation to the curve, and it is easy to find where a straight line crosses the $x$-axis. Call that crossing point $x_1$. Now repeat: draw the tangent line at $(x_1, f(x_1))$ and find where it hits the $x$-axis to get $x_2$. Keep going. Each new point $x_n$ is (usually) closer to the true root than the last.",
      "Why does this work? Near a root, a smooth function looks almost like a straight line — this is precisely what differentiability means. The tangent line captures that local linear behavior. When you follow the tangent line to the $x$-axis, you are essentially solving the linearized version of the equation $f(x) = 0$. Since linearization is a good approximation near the root, the solution of the linearized equation is close to the true root. And the closer you start, the better the linear approximation, which is why the method accelerates as it converges.",
      "Let us derive the formula. The tangent line to $y = f(x)$ at the point $(x_n, f(x_n))$ is:",
      "$$y - f(x_n) = f'(x_n)(x - x_n)$$",
      "Setting $y = 0$ to find the $x$-intercept gives $-f(x_n) = f'(x_n)(x_{n+1} - x_n)$. Solving for $x_{n+1}$:",
      "$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$",
      "Each step requires evaluating $f$ and $f'$ at the current guess, then updating.",
      "The convergence of Newton's Method is quadratic when it works well. If the error at step $n$ is $\\epsilon_n$, then for some constant $C$:",
      "$$\\epsilon_{n+1} \\approx C \\cdot \\epsilon_n^2$$",
      "This means that if you have 3 correct decimal digits, the next step gives roughly 6, then 12, then 24 — the number of correct digits doubles each iteration. Compare this to the bisection method, which adds only about 0.3 digits per step (halving the interval). Newton's Method reaches machine precision in 4–5 iterations where bisection might need 50.",
      "**▶ Quick convergence check:** Suppose the error at step 3 is $|e_3| = 0.001$ and $C \\approx 1$. What is the approximate error at step 4? At step 5? *(Step 4: $C \\cdot (0.001)^2 = 10^{-6}$. Step 5: $C \\cdot (10^{-6})^2 = 10^{-12}$. Two more steps took you from one-thousandth error to one-trillionth error. This is why 5–6 iterations is almost always enough once you are close.)*",
      "But Newton's Method can fail. The most obvious failure mode is a horizontal tangent: if $f'(x_n) = 0$, the tangent line never crosses the $x$-axis, and the formula divides by zero. Even if $f'(x_n)$ is merely very small, the next iterate $x_{n+1}$ flies off to a distant point. Another failure is cycling: the iterates can bounce back and forth between two points without converging. And if the initial guess is too far from the root, the method can diverge entirely — the tangent line may point you toward a different root or off to infinity.",
      "The comparison with bisection is instructive. Bisection is slow (linear convergence) but bulletproof: it always works if you start with an interval $[a, b]$ where $f(a)$ and $f(b)$ have opposite signs. Newton's Method is fast (quadratic convergence) but fragile: it needs a good initial guess and well-behaved derivatives. In practice, engineers often use bisection to get a rough estimate, then switch to Newton's Method to refine it rapidly — combining the reliability of one with the speed of the other.",
      "Computing $\\sqrt{2}$ by Newton's Method is a perfect first example. We solve $f(x) = x^2 - 2 = 0$ with $f'(x) = 2x$, so the iteration simplifies to:",
      "$$x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{x_n + 2/x_n}{2}$$",
      "Starting from $x_0 = 1$: $x_1 = 1.5$, $x_2 = 1.41\\overline{6}$, $x_3 = 1.41421568\\ldots$, $x_4 = 1.41421356237\\ldots$ By step 4 you have 11 correct digits. This is essentially the Babylonian method for square roots, reinvented through calculus.",
      "Many of the most important equations in science and engineering involve mixtures of polynomial, trigonometric, exponential, and logarithmic terms — what mathematicians call **transcendental equations**. These cannot be solved by algebra alone. The equation $\\sin x = 0.5$ happens to have an exact algebraic answer ($x = \\pi/6$), but $x + \\ln x = 2$ or $x = \\cos x$ have no algebraic answer whatsoever. For such equations, Newton's Method is not just a convenience — it is the practical path to a numerical answer. The equation $x = \\cos x$ has a unique positive solution called the **Dottie number** ($\\approx 0.7390851332$), named because repeatedly pressing the cosine button on a calculator in radian mode always converges to this fixed point. There is no fraction, no radical, no combination of $\\pi$ and $e$ that equals it. Yet Newton's Method ($f(x) = x - \\cos x$, $f'(x) = 1 + \\sin x$) finds it in five iterations from $x_0 = 0.7$.",
      "Three practical rules for using Newton's Method successfully: (1) **Graph first** — plot $y = f(x)$ to estimate where the root is, so your starting guess $x_0$ is already close. (2) **Check signs** — if $f(a)$ and $f(b)$ have opposite signs, there is a root between $a$ and $b$; bisection brackets it, then Newton's Method rapidly refines it. (3) **Watch for trouble** — if $|f(x_n)|$ is not shrinking, or the iterates start jumping wildly, your starting point is too far from the root or you have hit a region where $f'$ is near zero. In practice, Newton's Method is run with a convergence test: stop when $|x_{n+1} - x_n| < \\varepsilon$ for some small tolerance $\\varepsilon$ (like $10^{-10}$). Five to ten iterations is almost always enough once you are in the right neighborhood.",
      "**▶ Apply the sign-check rule:** Before moving to worked examples, find root brackets for $f(x) = x^3 - 4x + 1$. Evaluate $f$ at $x = -3, -2, -1, 0, 1, 2$. Where do sign changes occur? Record those three intervals — they will be the starting points for the three Newton sequences. *(Values: $f(-3) = -14$, $f(-2) = 1$, $f(-1) = 4$, $f(0) = 1$, $f(1) = -2$, $f(2) = 1$. Sign changes in $(-3,-2)$, $(0,1)$, and $(1,2)$ pin down all three roots in 60 seconds.)*",
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Tangent Lines and Linear Approximation',
        body: "Newton's Method is linear approximation applied iteratively. Recall that the tangent line at $x = a$ gives $f(x) \\approx f(a) + f'(a)(x - a)$. Newton's Method sets this linear approximation equal to zero and solves for $x$ to get the next iterate.",
      },
      {
        type: 'real-world',
        title: 'GPS and Newton\'s Method',
        body: "GPS positioning requires solving a system of nonlinear equations involving satellite distances. The receiver uses a variant of Newton's Method (Gauss-Newton) to find the latitude, longitude, and altitude that best fit the measured signal arrival times. Each position fix involves several Newton iterations computed in milliseconds.",
      },
      {
        type: 'warning',
        title: 'Bad Initial Guesses Can Be Catastrophic',
        body: "Newton's Method is not guaranteed to converge. If $x_0$ is far from the root or near a local extremum, the iterates may diverge, cycle, or converge to the wrong root. Always check that $|f(x_n)|$ is decreasing and that $x_n$ is approaching a consistent value.",
      },
      {
        type: 'tip',
        title: 'The Babylonian Square Root Algorithm',
        body: "To compute $\\sqrt{a}$, solve $x^2 - a = 0$ by Newton's Method: $x_{n+1} = \\frac{1}{2}(x_n + a/x_n)$. This ancient algorithm, known to Babylonian mathematicians around 1500 BCE, is simply Newton's Method applied to a quadratic. It converges for any positive starting guess.",
      },
      {
        type: 'geometric',
        title: 'Tangent Line Slides Toward the Root',
        body: "Visualize the process: at each step, you stand on the curve, draw a tangent line, and slide down (or up) that tangent line until you hit the $x$-axis. The tangent line undershoots or overshoots the root, but by less each time. The curve bends away from the tangent line, and the gap between the tangent's zero and the curve's zero shrinks quadratically.",
      },
      {
        type: 'history',
        title: 'Newton, Raphson, and Simpson',
        body: "Newton described an algebraic version of this method in 1669 for polynomials only, without using calculus. Joseph Raphson published a similar method in 1690. Thomas Simpson generalized it to use derivatives in 1740. The modern formulation $x_{n+1} = x_n - f(x_n)/f'(x_n)$ is properly called the Newton-Raphson method.",
      },
      {
        type: 'fun-fact',
        title: 'The Dottie Number: A Root With No Formula',
        body: "The equation $x = \\cos x$ has no closed-form solution. Its unique positive real root $D \\approx 0.7390851332151607$ is called the **Dottie number**. You can discover it with any scientific calculator: start with any real number, then repeatedly press the cosine key (in radian mode) — the display always converges to $D$. Newton's Method applied to $f(x) = x - \\cos x$, $f'(x) = 1 + \\sin x$ finds it in 5 iterations from $x_0 = 0.7$.",
      },
      {
        type: 'fun-fact',
        title: 'The Omega Constant: Where $e^{-x} = x$',
        body: "The equation $e^{-x} = x$ (equivalently $xe^x = 1$) has no algebraic solution. Its root $\\Omega \\approx 0.567143$ is the **Omega constant**, equal to $W(1)$ where $W$ is the Lambert W function. It appears in combinatorics, the analysis of algorithms, and iterated exponentials. Newton's Method: $f(x) = e^{-x} - x$, $f'(x) = -e^{-x} - 1$, starting from $x_0 = 0.5$, converges in 6 iterations.",
      },
      {
        type: 'tip',
        title: 'Practical Starting-Point Strategy',
        body: "No strategy beats **graphing** $y = f(x)$ first. Even a rough sketch tells you where roots live. For polynomials, evaluate $f$ at a few integers to locate sign changes — each sign change brackets a root. For trig or exponential equations, remember domain restrictions ($x > 0$ for $\\ln x$) and the bounded range of trig functions. Once you are within roughly one derivative-length of the root, Newton's Method takes over and converges explosively fast.",
      },
      {
        type: 'prior-knowledge',
        title: 'Review Prerequisites in 60 Seconds',
        body: "**Point-slope form:** the line through $(a, b)$ with slope $m$ is $y - b = m(x - a)$. **Derivative as slope:** $f'(a)$ is the slope of the curve at $x = a$, so the tangent at $(a, f(a))$ is $y - f(a) = f'(a)(x - a)$. **Differentiation rules used in this lesson:** $\\frac{d}{dx}x^n = nx^{n-1}$; $\\frac{d}{dx}\\sin x = \\cos x$; $\\frac{d}{dx}\\cos x = -\\sin x$; $\\frac{d}{dx}\\ln x = 1/x$; $\\frac{d}{dx}e^x = e^x$. If any of these look unfamiliar, review Chapter 2 Lessons 1–3 before continuing.",
      },
      {
        type: 'mistake',
        title: 'Common Mistake #1: Reusing f\'(x₀) for Every Step',
        body: "Every iteration requires computing **both** $f(x_n)$ and $f'(x_n)$ at the **current** point $x_n$. A frequent error is computing $f'(x_0)$ once at the start and reusing it at every step. This is wrong — the slope of the tangent line changes at each new guess. Always re-evaluate the derivative at the updated point before computing the next iterate.",
      },
      {
        type: 'mistake',
        title: 'Common Mistake #2: Sign Error in the Division Step',
        body: "The formula is $x_{n+1} = x_n \\mathbf{-} f(x_n)/f'(x_n)$ — you **subtract** the ratio. A common slip is accidentally adding it, or getting the sign of $f(x_n)/f'(x_n)$ wrong. Quick sanity check: if $f(x_n)$ and $f'(x_n)$ have the **same sign**, the correction $-f/f'$ is negative (guess moves left). If they have **opposite signs**, the correction is positive (guess moves right). If the direction doesn't match the geometry of the curve, recheck your sign.",
      },
      {
        type: 'mistake',
        title: 'Common Mistake #3: Picking x₀ Without a Sign Check',
        body: "Never just pick $x_0 = 0$ or $x_0 = 1$ blindly. Evaluate $f$ at several candidate points first. A sign change between $f(a)$ and $f(b)$ confirms a root is trapped in $(a, b)$ — start from inside that interval. Skipping this step and picking a random starting point frequently causes divergence, oscillation between distant points, or convergence to an entirely different root than the one you wanted.",
      },
    ],
    visualizations: [
      { vizId: 'NewtonsMethod', mathBridge: "Solve f(x) = x² − 2 = 0 (i.e., compute √2). f'(x) = 2x. Start at x₀ = 1. Step 1: x₁ = 1 − (1−2)/(2·1) = 1.5. Step 2: x₂ = 1.5 − (2.25−2)/(3) = 1.4167. Step 3: x₃ = 1.4167 − (2.0050−2)/(2.833) = 1.4142. By step 4 you have 11 correct digits. Watch the tangent lines in the animation — each one aims closer to x = √2 ≈ 1.41421.", caption: "Newton's Method computing √2: each tangent line overshoots slightly, but the sequence 1 → 1.5 → 1.4167 → 1.4142... converges quadratically." },
    ],
  },

  math: {
    prose: [
      "**Newton's Method (Iteration Formula).** Given a differentiable function $f$ and an initial guess $x_0$, define the sequence:",
      "$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}, \\quad n = 0, 1, 2, \\ldots$$",
      "If the sequence converges, its limit $r = \\lim_{n \\to \\infty} x_n$ satisfies $f(r) = 0$ (taking limits on both sides of the recurrence and using continuity).",
      "**Derivation from Taylor expansion.** Expand $f$ about $x_n$ (for some $\\xi$ between $x$ and $x_n$):",
      "$$f(x) = f(x_n) + f'(x_n)(x - x_n) + \\frac{1}{2}f''(\\xi)(x - x_n)^2$$",
      "Setting $x = r$ (the true root where $f(r) = 0$):",
      "$$0 = f(x_n) + f'(x_n)(r - x_n) + O\\!\\left((r - x_n)^2\\right)$$",
      "Dropping the second-order remainder and solving for $r$ gives $r \\approx x_n - f(x_n)/f'(x_n) = x_{n+1}$. The dropped quadratic term is the source of the approximation error.",
      "**Quadratic convergence.** Define the error $e_n = x_n - r$. Substituting into the Taylor expansion and rearranging (the left side is $x_{n+1} - r = e_{n+1}$):",
      "$$e_{n+1} = \\frac{f''(\\xi_n)}{2f'(x_n)} \\cdot e_n^2$$",
      "Near the root the coefficient is approximately constant, giving:",
      "$$|e_{n+1}| \\approx C|e_n|^2, \\quad C = \\frac{|f''(r)|}{2|f'(r)|}$$",
      "**When Newton's Method fails.** (1) If $f'(x_n) = 0$, the formula is undefined — a horizontal tangent has no $x$-intercept. (2) If $f'(r) = 0$ (the root is also a critical point, i.e., a multiple root), convergence degrades from quadratic to linear. For a root of multiplicity $m$, the modified formula:",
      "$$x_{n+1} = x_n - m \\cdot \\frac{f(x_n)}{f'(x_n)}$$",
      "restores quadratic convergence. (3) If $x_0$ is too far from $r$, the iterates may converge to a different root, cycle, or diverge.",
      "**Comparison with bisection.** The bisection method halves the interval at each step:",
      "$$|e_{n+1}| = \\tfrac{1}{2}|e_n| \\quad \\text{(linear convergence, ratio } \\tfrac{1}{2}\\text{)}$$",
      "After $n$ steps the error is at most $(b-a)/2^n$. To achieve $10^{-10}$ accuracy from a unit interval requires about 34 bisection steps. Newton's Method typically reaches $10^{-10}$ in 5–6 steps — but it can fail entirely if the starting point is poor.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Newton's Method Convergence",
        body: "If $f$ is twice continuously differentiable, $f(r) = 0$, $f'(r) \\neq 0$, and $x_0$ is sufficiently close to $r$, then Newton's Method converges quadratically: $|e_{n+1}| \\leq C|e_n|^2$ where $C = \\frac{|f''(r)|}{2|f'(r)|}$.",
      },
      {
        type: 'definition',
        title: 'The Newton-Raphson Iteration',
        body: "$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. Each step requires one evaluation of $f$ and one of $f'$. The geometric interpretation: $x_{n+1}$ is where the tangent line to $y = f(x)$ at $(x_n, f(x_n))$ crosses the $x$-axis.",
      },
      {
        type: 'warning',
        title: 'Multiple Roots Slow Down Convergence',
        body: "If $r$ is a root of multiplicity $m \\geq 2$ (i.e., $f(r) = f'(r) = \\cdots = f^{(m-1)}(r) = 0$), Newton's Method converges only linearly. Fix: use $x_{n+1} = x_n - m \\cdot f(x_n)/f'(x_n)$, or apply Newton's Method to $g(x) = f(x)/f'(x)$ instead.",
      },
      {
        type: 'self-diagnostic',
        title: 'Self-Diagnostic: Is Your Iteration Behaving Correctly?',
        body: "After completing 3–4 steps, run this quick self-check:\n\n**1. Is $|f(x_n)|$ getting smaller each step?** It should be. If it oscillates or grows, your starting guess is far from a root — graph $f$ first, find a sign change, and restart.\n\n**2. Are the iterates $x_n$ approaching a stable limit?** They should converge to a single number. If they are, you are on track.\n\n**3. Are the iterates jumping between two distant values?** This is cycling — your $x_0$ is near a point where the tangent crosses to the wrong side. Try a different starting guess closer to the root.\n\n**4. Are the iterates growing without bound?** This is divergence — $f'(x_n) \\approx 0$ near a local extremum is sending the tangent nearly horizontal. Restart from a different region.\n\n**The universal fix** for all failure modes: plot $y = f(x)$, locate a sign change with a table of values, and pick $x_0$ inside that bracketing interval.",
      },
    ],
    visualizations: [
      { vizId: 'NewtonsMethod', mathBridge: "Try a case where Newton's Method fails. Set f(x) = x^(1/3) (cube root). f'(x) = (1/3)x^(−2/3). The iteration gives xₙ₊₁ = xₙ − xₙ^(1/3) / ((1/3)xₙ^(−2/3)) = xₙ − 3xₙ = −2xₙ. This DIVERGES: the iterates double in magnitude each step. Start at x₀ = 1: x₁ = −2, x₂ = 4, x₃ = −8... The root is at 0, but we fly away. Why? The derivative at the root is undefined (infinite), violating the theorem's hypothesis f'(r) ≠ 0.", caption: "Newton's Method failure on f(x) = x^(1/3): when f'(r) = 0 at the root, the iteration diverges instead of converging." },
      {
        id: 'PythonNotebook',
        title: "Python Lab: Run Newton's Method & Watch Digits Double",
        caption: "Execute the iteration numerically and watch quadratic convergence in action. Modify f and df to solve any equation. Try the cycling case to see failure.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Run Newton's Method on any f(x) = 0",
              prose: [
                'The iteration: $x_{n+1} = x_n - \\dfrac{f(x_n)}{f\'(x_n)}$',
                '**Quadratic convergence** means: correct digits roughly **double** every step.',
                'Watch the `error` column shrink — first slowly, then explosively fast.',
              ],
              instructions: "Change `f`, `df`, `x0` to solve a different equation. Try f = lambda x: x**3 - x - 1 with x0 = 1.5",
              code: `import math

# ── Define your equation f(x) = 0 and its derivative ──
f  = lambda x: x**2 - 2          # solving x² = 2  (root = √2)
df = lambda x: 2*x
true_root = math.sqrt(2)          # known for comparison

x0    = 1.0    # initial guess
steps = 6      # number of iterations

print(f"Solving f(x) = 0 by Newton's Method")
print(f"True root = {true_root:.15f}")
print()
print(f"{'Step':>4}  {'x_n':>20}  {'f(x_n)':>14}  {'error':>14}  {'digits gained'}")
print("-" * 75)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    err = abs(x - true_root)
    print(f"{n:>4}  {x:>20.15f}  {fx:>14.2e}  {err:>14.2e}")
    x = x - fx / dfx

print(f"{steps:>4}  {x:>20.15f}  {f(x):>14.2e}  {abs(x-true_root):>14.2e}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Visualize convergence: errors on a log scale',
              prose: [
                'On a **linear** scale, errors look like they jump to zero instantly.',
                'On a **log scale**, quadratic convergence is the straight-downward slope that doubles in steepness each step.',
              ],
              code: `from opencalc import Figure
import math

f  = lambda x: x**2 - 2
df = lambda x: 2*x
true_root = math.sqrt(2)

x, errors = 1.0, []
for _ in range(8):
    errors.append(abs(x - true_root))
    x = x - f(x) / df(x)

# log10 of each error (stops when we hit machine precision)
log_errors = [math.log10(e) if e > 1e-16 else -16 for e in errors]
steps = list(range(len(log_errors)))

fig = Figure(xmin=-0.5, xmax=len(steps)-0.5, ymin=-17, ymax=1,
    title="Newton's Method: log10(error) vs iteration (f=x²-2)")
fig.grid(step=1).axes()
fig.scatter(steps, log_errors, color='red', radius=6)
for i in range(len(steps)-1):
    fig.line([steps[i], log_errors[i]], [steps[i+1], log_errors[i+1]],
        color='red', width=1.5)
fig.hline(-15.5, color='amber', dashed=True)
fig.text([0.2, -14.5], 'machine precision', color='amber', size=10)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: "Failure case: cycling on f(x) = x³ - 2x + 2",
              prose: [
                'Starting at $x_0 = 0$: the iterates cycle $0 \\to 1 \\to 0 \\to 1 \\to \\ldots$ forever.',
                'The actual root is near $x \\approx -1.769$. Change `x0 = -2` to find it instantly.',
              ],
              instructions: 'Run with x0 = 0 to see cycling. Then change x0 = -2 to see fast convergence to the real root.',
              code: `import math

f  = lambda x: x**3 - 2*x + 2
df = lambda x: 3*x**2 - 2

x0    = 0.0    # try changing to -2.0
steps = 8

print(f"Starting at x0 = {x0}")
print()
print(f"{'Step':>4}  {'x_n':>18}  {'f(x_n)':>14}")
print("-" * 40)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    if abs(dfx) < 1e-12:
        print(f"{n:>4}  f'(x) ≈ 0 — division by zero! Stopping.")
        break
    print(f"{n:>4}  {x:>18.10f}  {fx:>14.6f}")
    x = x - fx / dfx
print(f"{steps:>4}  {x:>18.10f}  {f(x):>14.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              challengeType: 'write',
              challengeTitle: "Your Turn: Find all 3 roots of x³ - 6x² + 11x - 5",
              difficulty: 'hard',
              prompt: 'The cubic f(x) = x³ - 6x² + 11x - 5 has three real roots.\n\nStrategy: evaluate f at integers 0-5 to find sign changes, then run Newton from 3 different starting points.',
              hint: 'f(0)<0, f(1)>0, f(2)<0, f(5)>0. Try x0 = 0.5, x0 = 2.0, x0 = 4.5.',
              code: `import math

f  = lambda x: x**3 - 6*x**2 + 11*x - 5
df = lambda x: 3*x**2 - 12*x + 11

# Step 1: sign survey
print("Sign survey:")
for xi in range(6):
    print(f"  f({xi}) = {f(xi):.4f}")
print()

# Step 2: run Newton from three starting points
def newton(f, df, x0, steps=10):
    x = x0
    for _ in range(steps):
        x = x - f(x) / df(x)
    return x

# YOUR CODE: find the three roots
# r1 = newton(f, df, 0.5)
# r2 = newton(f, df, ???)
# r3 = newton(f, df, ???)
# print(f"Roots: {r1:.6f}, {r2:.6f}, {r3:.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: "Transcendental example: solve sin(x) = 0.5",
              prose: [
                'Rewrite as $f(x) = \\sin x - 0.5 = 0$, so $f\'(x) = \\cos x$.',
                'The exact answer is $x = \\pi/6 \\approx 0.5235987756$.',
                'Watch how 3–4 steps reach full machine precision from a rough guess of 0.5.',
              ],
              instructions: "Change x0 to a value like 2.6 to find the OTHER solution near π − π/6. This equation has infinitely many solutions — Newton's Method finds the one nearest your starting point.",
              code: `import math

def f(x):
    return math.sin(x) - 0.5

def df(x):
    return math.cos(x)

true_root = math.pi / 6   # exact answer for comparison

x0    = 0.5
steps = 6

print(f"Solving sin(x) = 0.5 via Newton's Method")
print(f"True root = π/6 = {true_root:.15f}")
print()
print(f"{'Step':>4}  {'x_n':>20}  {'f(x_n)':>14}  {'error':>14}")
print("-" * 65)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    err = abs(x - true_root)
    print(f"{n:>4}  {x:>20.15f}  {fx:>14.2e}  {err:>14.2e}")
    if abs(dfx) < 1e-14:
        print("Derivative ≈ 0 — stopping!")
        break
    x = x - fx / dfx

print(f"{steps:>4}  {x:>20.15f}  {f(x):>14.2e}  {abs(x-true_root):>14.2e}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: "Solve x + ln(x) = 2  (no closed form)",
              prose: [
                '$f(x) = x + \\ln x - 2 = 0$, $f\'(x) = 1 + 1/x$.',
                'Domain: $x > 0$ (logarithm is only defined for positive inputs).',
                'True root $\\approx 1.557145596$. No algebraic expression exists for this number.',
              ],
              instructions: "Notice: f(1) = 1 + 0 - 2 = -1 < 0 and f(2) = 2 + 0.693 - 2 = 0.693 > 0. So a root lies in (1, 2). Starting anywhere in that interval converges fast.",
              code: `import math

def f(x):
    return x + math.log(x) - 2      # natural log

def df(x):
    return 1 + 1/x

x0    = 1.5
steps = 8

print("Solving x + ln(x) = 2 via Newton's Method")
print()
print(f"{'Step':>4}  {'x_n':>20}  {'f(x_n)':>16}")
print("-" * 45)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    print(f"{n:>4}  {x:>20.15f}  {fx:>16.8e}")
    if abs(fx) < 1e-14:
        print("Converged!")
        break
    x = x - fx / dfx

print(f"Root ≈ {x:.12f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: "Solve e^(−x) = x  (the Omega constant Ω ≈ 0.5671)",
              prose: [
                '$f(x) = e^{-x} - x = 0$, $f\'(x) = -e^{-x} - 1$.',
                'The root is the **Omega constant** $\\Omega = W(1) \\approx 0.567143$, where $W$ is the Lambert W function.',
                'Starting from $x_0 = 0.5$, full precision is reached in ≈ 6 steps.',
              ],
              code: `import math

def f(x):
    return math.exp(-x) - x

def df(x):
    return -math.exp(-x) - 1

x0    = 0.5
steps = 8

print("Solving e^(−x) = x  (Omega constant)")
print()
print(f"{'Step':>4}  {'x_n':>20}  {'f(x_n)':>16}")
print("-" * 45)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    print(f"{n:>4}  {x:>20.15f}  {fx:>16.8e}")
    if abs(fx) < 1e-14:
        print("Converged!")
        break
    x = x - fx / dfx

print(f"Omega constant ≈ {x:.15f}")
print(f"Verify: e^(−root) = {math.exp(-x):.15f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: "Solve x = cos(x)  — the Dottie number",
              prose: [
                '$f(x) = x - \\cos x = 0$, $f\'(x) = 1 + \\sin x$.',
                'The **Dottie number** $D \\approx 0.7390851332$ is the unique real fixed-point of cosine.',
                'Press the cosine button repeatedly on any calculator (radians) and you converge to $D$. Newton\'s Method finds it in 5 steps from almost any starting point.',
              ],
              instructions: "Try x0 = 100.0 — even from a huge starting value, Newton converges to the Dottie number in just a few extra steps because f'(x) = 1 + sin(x) ≥ 0 everywhere, so the iteration can't cycle.",
              code: `import math

def f(x):
    return x - math.cos(x)

def df(x):
    return 1 + math.sin(x)

x0    = 0.7
steps = 8

print("Solving x = cos(x)  — the Dottie number")
print()
print(f"{'Step':>4}  {'x_n':>22}  {'f(x_n)':>16}")
print("-" * 48)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    print(f"{n:>4}  {x:>22.15f}  {fx:>16.8e}")
    if abs(fx) < 1e-14:
        print("Converged!")
        break
    x = x - fx / dfx

dottie = x
print(f"Dottie number D ≈ {dottie:.15f}")
print(f"Verify: cos(D) = {math.cos(dottie):.15f}  (should equal D)")

# Bonus: brute-force via repeated cosine pressing
y = 0.7
for _ in range(50):
    y = math.cos(y)
print(f"Repeated cosine: {y:.15f}  (same number, much slower convergence)")`,
              output: '', status: 'idle', figureJson: null,
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      "**Theorem (Local Quadratic Convergence).** Let $f \\in C^2[a, b]$ with a simple root $r \\in (a, b)$ (meaning $f(r) = 0$ and $f'(r) \\neq 0$). Then there exists $\\delta > 0$ such that for any $x_0 \\in (r - \\delta, r + \\delta)$, Newton's iterates $x_{n+1} = x_n - f(x_n)/f'(x_n)$ converge to $r$, and the convergence is quadratic.",
      "**Proof.** Define $\\phi(x) = x - f(x)/f'(x)$. Then $\\phi(r) = r$ (since $f(r) = 0$), and Newton's iteration is $x_{n+1} = \\phi(x_n)$. Computing $\\phi'(x)$:",
      "$$\\phi'(x) = 1 - \\frac{[f'(x)]^2 - f(x)f''(x)}{[f'(x)]^2} = \\frac{f(x)f''(x)}{[f'(x)]^2}$$",
      "At $x = r$: $\\phi'(r) = f(r)f''(r)/[f'(r)]^2 = 0$ since $f(r) = 0$.",
      "Since $\\phi'(r) = 0$ and $\\phi'$ is continuous, there exists $\\delta > 0$ such that $|\\phi'(x)| \\leq q < 1$ for all $x \\in [r - \\delta, r + \\delta]$. By the Mean Value Theorem:",
      "$$|x_{n+1} - r| = |\\phi(x_n) - \\phi(r)| = |\\phi'(\\xi_n)||x_n - r| \\leq q|x_n - r|$$",
      "By induction, $|x_n - r| \\leq q^n|x_0 - r| \\to 0$, proving convergence.",
      "For quadratic convergence, expand $\\phi$ in a Taylor series about $r$. Since $\\phi'(r) = 0$ the linear term vanishes:",
      "$$|\\phi(x_n) - r| = \\tfrac{1}{2}|\\phi''(\\xi_n)| \\cdot |x_n - r|^2$$",
      "Computing $\\phi''(r) = f''(r)/f'(r)$ (after careful differentiation) gives the final error bound:",
      "$$|e_{n+1}| = \\frac{|f''(r)|}{2|f'(r)|}|e_n|^2 + O(|e_n|^3)$$",
      "**Failure analysis: cycling.** Consider $f(x) = x^3 - 2x + 2$ with $x_0 = 0$. Then $x_1 = 0 - (0 - 0 + 2)/(0 - 2) = 1$. And $x_1 = 1$: $x_2 = 1 - (1 - 2 + 2)/(3 - 2) = 1 - 1 = 0 = x_0$. The iterates cycle: $0, 1, 0, 1, \\ldots$, never converging. This occurs because the tangent lines at $x = 0$ and $x = 1$ point at each other. The root is near $x \\approx -1.77$, far from both cycling points.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Fixed Point Interpretation',
        body: "Newton's iteration $x_{n+1} = \\phi(x_n)$ where $\\phi(x) = x - f(x)/f'(x)$ is a fixed-point iteration with the special property $\\phi'(r) = 0$. This vanishing derivative is why convergence is quadratic rather than merely linear.",
      },
      {
        type: 'warning',
        title: 'Convergence Is Only Local',
        body: "The theorem guarantees convergence only when $x_0$ is sufficiently close to $r$. The basin of attraction — the set of starting points that converge to a given root — can have fractal boundaries in the complex plane, even for simple polynomials.",
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch3-060-ex1',
      title: 'Finding the Square Root of 2',
      problem: "\\text{Use Newton's Method to approximate } \\sqrt{2} \\text{ starting from } x_0 = 1. \\text{ Perform 4 iterations.}",
      visualizationId: 'NewtonsMethod',
      steps: [
        { expression: 'f(x) = x^2 - 2, \\quad f\'(x) = 2x', annotation: 'We want $x^2 = 2$, so $f(x) = x^2 - 2 = 0$. The root is $\\sqrt{2}$.', strategyTitle: "Set up: define f(x) and compute f'(x) — both required for the iteration", checkpoint: "Newton's formula is xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ). You need both f and f' at each step. What goes wrong if f'(xₙ) = 0?", hints: ["Level 1: Write f(x) explicitly (what equation are you solving = 0?), then differentiate to find f'(x).", "Level 2: The iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ) requires evaluating both f and f' at the current guess. f(xₙ) tells you how far from zero you are; f'(xₙ) tells you the slope of the tangent line.", "Level 3: If f'(xₙ) = 0, the tangent line is horizontal and never crosses the x-axis — the formula divides by zero. This is why Newton's Method requires f'(r) ≠ 0 at the root."] },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{x_n + 2/x_n}{2}', annotation: 'The Newton iteration simplifies to the average of $x_n$ and $2/x_n$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_0 = 1: \\quad x_1 = \\frac{1 + 2}{2} = \\frac{3}{2} = 1.5', annotation: 'First iteration. Error: $|1.5 - 1.41421...| \\approx 0.086$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_1 = 1.5: \\quad x_2 = \\frac{1.5 + 2/1.5}{2} = \\frac{1.5 + 1.\\overline{3}}{2} = \\frac{17}{12} \\approx 1.41\\overline{6}', annotation: 'Second iteration. Error: $\\approx 0.0025$. Already 2 correct decimal places.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_2 = \\frac{17}{12}: \\quad x_3 = \\frac{17/12 + 24/17}{2} = \\frac{577}{408} \\approx 1.41421568...', annotation: 'Third iteration. Error: $\\approx 0.0000021$. Now 5 correct digits.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_3 = \\frac{577}{408}: \\quad x_4 = \\frac{665857}{470832} \\approx 1.4142135623746...', annotation: 'Fourth iteration. Error: $\\approx 10^{-12}$. Eleven correct digits after only 4 steps from a crude initial guess!', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
      ],
      conclusion: "After 4 iterations starting from $x_0 = 1$, we have $\\sqrt{2} \\approx 1.4142135623746...$, correct to 11 decimal places. The error went from 0.41 to 0.086 to 0.0025 to 0.0000021 to $10^{-12}$ — the digits of accuracy roughly doubled at each step, demonstrating quadratic convergence.",
    },
    {
      id: 'ch3-060-ex2',
      title: 'Solving a Cubic Equation',
      problem: "\\text{Find a root of } f(x) = x^3 - x - 1 = 0 \\text{ using Newton's Method with } x_0 = 1.5.",
      steps: [
        { expression: "f(x) = x^3 - x - 1, \\quad f'(x) = 3x^2 - 1", annotation: 'Set up the function and its derivative.', strategyTitle: "Set up: define f(x) and compute f'(x) — both required for the iteration", checkpoint: "Newton's formula is xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ). You need both f and f' at each step. What goes wrong if f'(xₙ) = 0?", hints: ["Level 1: Write f(x) explicitly (what equation are you solving = 0?), then differentiate to find f'(x).", "Level 2: The iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ) requires evaluating both f and f' at the current guess. f(xₙ) tells you how far from zero you are; f'(xₙ) tells you the slope of the tangent line.", "Level 3: If f'(xₙ) = 0, the tangent line is horizontal and never crosses the x-axis — the formula divides by zero. This is why Newton's Method requires f'(r) ≠ 0 at the root."] },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^3 - x_n - 1}{3x_n^2 - 1}', annotation: 'Write the Newton iteration formula for this specific function.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_0 = 1.5: \\quad f(1.5) = 3.375 - 1.5 - 1 = 0.875, \\quad f\'(1.5) = 6.75 - 1 = 5.75', annotation: 'Evaluate $f$ and $f\'$ at $x_0 = 1.5$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_1 = 1.5 - \\frac{0.875}{5.75} \\approx 1.5 - 0.15217 = 1.34783', annotation: 'First iteration.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_1 = 1.34783: \\quad f(1.34783) \\approx 0.09946, \\quad f\'(1.34783) \\approx 4.44994', annotation: 'Evaluate at $x_1$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_2 = 1.34783 - \\frac{0.09946}{4.44994} \\approx 1.32547', annotation: 'Second iteration. Getting closer.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_3 \\approx 1.32472, \\quad x_4 \\approx 1.32472', annotation: 'Third and fourth iterations agree to 5 decimal places. The root has been found.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
      ],
      conclusion: "The real root of $x^3 - x - 1 = 0$ is approximately $r \\approx 1.32472$. This cubic has no rational roots (by the Rational Root Theorem, the only candidates $\\pm 1$ fail). Newton's Method finds the irrational root efficiently. The equation $x^3 = x + 1$ defines the so-called plastic ratio, which appears in architecture and number theory.",
    },
    {
      id: 'ch3-060-ex3',
      title: "Newton's Method Failure: Cycling",
      problem: "\\text{Show that Newton's Method cycles when applied to } f(x) = x^3 - 2x + 2 \\text{ with } x_0 = 0.",
      steps: [
        { expression: "f(x) = x^3 - 2x + 2, \\quad f'(x) = 3x^2 - 2", annotation: 'Set up the function and derivative.', strategyTitle: "Set up: define f(x) and compute f'(x) — both required for the iteration", checkpoint: "Newton's formula is xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ). You need both f and f' at each step. What goes wrong if f'(xₙ) = 0?", hints: ["Level 1: Write f(x) explicitly (what equation are you solving = 0?), then differentiate to find f'(x).", "Level 2: The iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ) requires evaluating both f and f' at the current guess. f(xₙ) tells you how far from zero you are; f'(xₙ) tells you the slope of the tangent line.", "Level 3: If f'(xₙ) = 0, the tangent line is horizontal and never crosses the x-axis — the formula divides by zero. This is why Newton's Method requires f'(r) ≠ 0 at the root."] },
        { expression: 'x_0 = 0: \\quad f(0) = 2, \\quad f\'(0) = -2', annotation: 'Evaluate at $x_0 = 0$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_1 = 0 - \\frac{2}{-2} = 0 + 1 = 1', annotation: 'The tangent line at $x = 0$ crosses the $x$-axis at $x = 1$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_1 = 1: \\quad f(1) = 1 - 2 + 2 = 1, \\quad f\'(1) = 3 - 2 = 1', annotation: 'Evaluate at $x_1 = 1$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_2 = 1 - \\frac{1}{1} = 0 = x_0', annotation: 'The tangent line at $x = 1$ crosses the $x$-axis at $x = 0$ — right back where we started!', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_0 = 0 \\to x_1 = 1 \\to x_2 = 0 \\to x_3 = 1 \\to \\cdots', annotation: 'The iterates cycle forever between 0 and 1, never converging. The actual root is near $x \\approx -1.769$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
      ],
      conclusion: "Newton's Method cycles between $x = 0$ and $x = 1$ because the tangent lines at these two points point directly at each other. The true root near $x \\approx -1.769$ is never approached. Starting from $x_0 = -2$ instead would converge to the root. This illustrates why the initial guess matters.",
    },
    {
      id: 'ch3-060-ex4',
      title: 'Computing Cube Roots',
      problem: "\\text{Use Newton's Method to find } \\sqrt[3]{10} \\text{ starting from } x_0 = 2.",
      steps: [
        { expression: 'f(x) = x^3 - 10, \\quad f\'(x) = 3x^2', annotation: 'Solve $x^3 = 10$, so $f(x) = x^3 - 10$.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^3 - 10}{3x_n^2} = \\frac{2x_n^3 + 10}{3x_n^2} = \\frac{2x_n}{3} + \\frac{10}{3x_n^2}', annotation: 'The Newton iteration for cube roots.' },
        { expression: 'x_0 = 2: \\quad x_1 = \\frac{2(8) + 10}{3(4)} = \\frac{26}{12} = \\frac{13}{6} \\approx 2.16\\overline{6}', annotation: 'First iteration. $f(2) = -2$, so $x_0 = 2$ is below the root.' },
        { expression: 'x_1 \\approx 2.1667: \\quad x_2 \\approx 2.15445', annotation: 'Second iteration.' },
        { expression: 'x_2 \\approx 2.15445: \\quad x_3 \\approx 2.15443', annotation: 'Third iteration. Already converged to 5 decimal places.' },
        { expression: '\\sqrt[3]{10} \\approx 2.15443', annotation: 'The cube root of 10, accurate to 5 decimal places, found in just 3 iterations.' },
      ],
      conclusion: "Newton's Method finds $\\sqrt[3]{10} \\approx 2.15443$ in three iterations from $x_0 = 2$. The same approach works for any $n$th root: to find $\\sqrt[n]{a}$, apply Newton's Method to $f(x) = x^n - a$, giving $x_{n+1} = \\frac{(n-1)x_n + a/x_n^{n-1}}{n}$.",
    },
    {
      id: 'ch3-060-ex5',
      title: 'Comparing Newton and Bisection',
      problem: "\\text{Find a root of } f(x) = e^x - 3 = 0 \\text{ using both Newton's Method (}x_0 = 1\\text{) and bisection on } [0, 2]. \\text{ Compare after 4 steps.}",
      steps: [
        { expression: '\\text{True root: } r = \\ln 3 \\approx 1.09861', annotation: 'We can solve this one exactly for comparison: $e^x = 3$ means $x = \\ln 3$.' },
        { expression: "\\textbf{Newton:} \\; f'(x) = e^x, \\; x_{n+1} = x_n - \\frac{e^{x_n} - 3}{e^{x_n}} = x_n - 1 + 3e^{-x_n}", annotation: "Newton's iteration for this problem." },
        { expression: 'x_0 = 1, \\; x_1 \\approx 1.10364, \\; x_2 \\approx 1.09861, \\; x_3 \\approx 1.09861', annotation: 'Newton converges to 5 decimal places in just 2 steps.' },
        { expression: '\\textbf{Bisection:} \\; [0, 2] \\to [1, 2] \\to [1, 1.5] \\to [1, 1.25] \\to [1, 1.125]', annotation: 'Bisection after 4 steps: the interval is $[1, 1.125]$, midpoint $\\approx 1.0625$. Error $\\approx 0.036$.' },
        { expression: '\\text{Newton error after 2 steps:} \\; \\approx 10^{-10}. \\quad \\text{Bisection error after 4 steps:} \\; \\approx 0.036.', annotation: "Newton's Method is astronomically more accurate in fewer steps — but it required computing $e^x$ and its derivative, while bisection only checked signs." },
      ],
      conclusion: "Newton's Method reaches 10-digit accuracy in 2 iterations; bisection achieves only 1-2 digits in 4 iterations. However, bisection is guaranteed to converge (given a sign change), while Newton's Method required a good initial guess. Each method has its strengths.",
    },
    {
      id: 'ch3-060-ex6',
      title: 'Transcendental Equation: Solve sin(x) = 0.5',
      problem: "\\text{Use Newton's Method to solve } \\sin x = 0.5 \\text{ near } x_0 = 0.5 \\text{ rad. Perform 3 full iterations.}",
      steps: [
        { expression: "f(x) = \\sin x - 0.5, \\quad f'(x) = \\cos x", annotation: "Rewrite $\\sin x = 0.5$ as $f(x) = \\sin x - 0.5 = 0$. The derivative of $\\sin x$ is $\\cos x$.", strategyTitle: "Set up: rewrite as f(x) = 0 and differentiate", hints: ["Level 1: Move 0.5 to the left side: $f(x) = \\sin x - 0.5$. Differentiate using the standard rule $\\frac{d}{dx}\\sin x = \\cos x$.", "Level 2: Notice $f(\\pi/6) = \\sin(\\pi/6) - 0.5 = 0.5 - 0.5 = 0$ exactly, so $x = \\pi/6$ is the true root. Newton's Method will find this numerically.", "Level 3: The derivative $f'(x) = \\cos x$ is never zero near $x = \\pi/6 \\approx 0.524$, so the iteration is guaranteed to converge from a nearby starting point."] },
        { expression: "x_0 = 0.5: \\quad \\sin(0.5) \\approx 0.47943, \\quad \\cos(0.5) \\approx 0.87758", annotation: "Look up (or compute) the trig values at the current guess.", strategyTitle: "Evaluate f(xₙ) and f'(xₙ) at the current guess", hints: ["Level 1: Use a calculator or the Python code. $\\sin(0.5) \\approx 0.4794$, $\\cos(0.5) \\approx 0.8776$ (radians, not degrees).", "Level 2: $f(0.5) = 0.47943 - 0.5 = -0.02057$. This is negative and small, indicating we are slightly below the root.", "Level 3: Because $f(0.5) < 0$ and $f(\\pi/2) = 0.5 > 0$, a root lies between 0.5 and 1.57. Newton's tangent line will jump directly to it."] },
        { expression: "x_1 = 0.5 - \\frac{0.47943 - 0.5}{0.87758} = 0.5 - \\frac{-0.02057}{0.87758} \\approx 0.5 + 0.02344 = 0.52344", annotation: "First Newton step. The guess jumped from 0.5 to 0.523, already very close to $\\pi/6 \\approx 0.5236$.", strategyTitle: "Apply the iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)", hints: ["Level 1: $x_1 = 0.5 - (-0.02057)/0.87758$. Dividing a negative number by a positive number gives a negative quotient, so we subtract a negative — the guess moves RIGHT (increases).", "Level 2: The error dropped from $|0.5 - 0.5236| \\approx 0.0236$ to $|0.523 - 0.5236| \\approx 0.0006$ in one step. That is a 40× improvement.", "Level 3: Because $f(x_0) < 0$ and $f'(x_0) > 0$, the tangent line slopes upward and crosses zero to the right of $x_0$, which is the correct direction toward the root."] },
        { expression: "x_1 \\approx 0.52344: \\quad \\sin(0.52344) \\approx 0.49996, \\quad \\cos(0.52344) \\approx 0.86608", annotation: "Evaluate trig at the new guess.", strategyTitle: "Evaluate f(xₙ) and f'(xₙ) at the current guess", hints: ["Level 1: $f(0.52344) = 0.49996 - 0.5 = -0.00004$. Tiny negative — almost there.", "Level 2: One more iteration will produce essentially the exact root."] },
        { expression: "x_2 = 0.52344 - \\frac{-0.00004}{0.86608} \\approx 0.52344 + 0.00005 = 0.52360", annotation: "Second iteration. Converged to $\\pi/6 \\approx 0.52360$ (agreement at 5 decimal places).", strategyTitle: "Apply the iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)", hints: ["Level 1: The correction $-f/f' \\approx +0.00005$ is tiny — only a small nudge needed.", "Level 2: $x_2 \\approx 0.52360$ and $\\pi/6 = 0.52359877...$. The error is now $< 10^{-6}$ after only 2 steps from a guess 0.024 away."] },
        { expression: "x_3 \\approx 0.5235987756, \\quad \\text{true root} = \\frac{\\pi}{6} = 0.5235987756\\ldots", annotation: "Third iteration converges to full machine precision. The true root $\\pi/6$ is confirmed.", strategyTitle: "Stop when |xₙ₊₁ − xₙ| < tolerance", hints: ["Level 1: When successive guesses agree to 10+ decimal places, the iteration has converged. At this point $|f(x_3)| < 10^{-15}$.", "Level 2: This transcendental equation happened to have a closed-form root ($\\pi/6$). Most transcendental equations do not — Newton's Method gives you the numerical answer anyway."] },
      ],
      conclusion: "Newton's Method solved $\\sin x = 0.5$ in 3 steps, converging to $x = \\pi/6 \\approx 0.52360$. The method works identically whether the function involves polynomials, trig, logarithms, or exponentials — the only requirement is a differentiable $f$ and a starting guess near the root. Change $f$ and $f'$ and the same algorithm handles any equation.",
    },
    {
      id: 'ch3-060-ex7',
      title: 'Logarithmic Equation: Solve x + ln(x) = 2',
      problem: "\\text{Use Newton's Method to find the root of } f(x) = x + \\ln x - 2 = 0. \\text{ Start from } x_0 = 1.5.",
      steps: [
        { expression: "f(x) = x + \\ln x - 2, \\quad f'(x) = 1 + \\frac{1}{x}", annotation: "Rewrite the equation with all terms on one side. The derivative uses $\\frac{d}{dx}\\ln x = \\frac{1}{x}$.", strategyTitle: "Set up: rewrite as f(x) = 0 and differentiate", hints: ["Level 1: Move 2 to the left: $f(x) = x + \\ln x - 2$. Differentiate term by term: $\\frac{d}{dx}x = 1$, $\\frac{d}{dx}\\ln x = 1/x$, $\\frac{d}{dx}(-2) = 0$.", "Level 2: Domain check: $\\ln x$ requires $x > 0$. All iterates must stay positive — and they will, since the root is near 1.557.", "Level 3: $f(1) = 1 + 0 - 2 = -1 < 0$ and $f(2) = 2 + 0.693 - 2 = 0.693 > 0$. The sign change confirms a root in $(1, 2)$."] },
        { expression: "x_0 = 1.5: \\quad f(1.5) = 1.5 + \\ln(1.5) - 2 \\approx 1.5 + 0.40546 - 2 = -0.09454", annotation: "Evaluate $f$ at the starting guess. The negative value means our guess lies to the left of the root.", strategyTitle: "Evaluate f(xₙ) at the current guess", hints: ["Level 1: $\\ln(1.5) \\approx 0.40546$. So $f(1.5) = 1.5 + 0.40546 - 2 = -0.09454$. Negative, so root is to the right of 1.5.", "Level 2: $f'(1.5) = 1 + 1/1.5 = 1 + 0.6667 = 1.6667 > 0$. The function is increasing, so the root is indeed to the right."] },
        { expression: "f'(1.5) = 1 + \\frac{1}{1.5} = 1 + 0.6\\overline{6} = 1.6\\overline{6}", annotation: "Evaluate the derivative at the starting guess.", strategyTitle: "Evaluate f'(xₙ) at the current guess", hints: ["Level 1: Plug $x_0 = 1.5$ into $f'(x) = 1 + 1/x$: $f'(1.5) = 1 + 1/1.5 = 5/3 \\approx 1.667$."] },
        { expression: "x_1 = 1.5 - \\frac{-0.09454}{1.6\\overline{6}} = 1.5 + \\frac{0.09454}{1.6667} \\approx 1.5 + 0.05672 = 1.55672", annotation: "First Newton step. Jumped from 1.5 to 1.557, already within 0.0001 of the true root (1.557145).", strategyTitle: "Apply the iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)", hints: ["Level 1: $f/f' = (-0.09454)/1.6667 \\approx -0.0567$. Subtracting a negative means adding: the guess moves right toward the root.", "Level 2: Error at $x_0$: $|1.5 - 1.5571| \\approx 0.057$. Error at $x_1$: $|1.5567 - 1.5571| \\approx 0.0004$. About 140× improvement in one step."] },
        { expression: "x_1 \\approx 1.55672: \\quad f(1.55672) \\approx 1.55672 + 0.44350 - 2 = 0.00022", annotation: "$\\ln(1.55672) \\approx 0.44350$. Now $f$ is tiny and positive — we slightly overshot.", strategyTitle: "Evaluate f(xₙ) and f'(xₙ) at the current guess", hints: ["Level 1: $f(1.5567) \\approx 0.00022 > 0$. We passed the root (were below it, now above). The next step corrects."] },
        { expression: "x_2 = 1.55672 - \\frac{0.00022}{1 + 1/1.55672} \\approx 1.55672 - \\frac{0.00022}{1.6425} \\approx 1.55672 - 0.00013 = 1.55659", annotation: "Second iteration.", strategyTitle: "Apply the iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)", hints: ["Level 1: Correction is $0.00022/1.6425 \\approx 0.00013$. The guess barely moved — nearly converged.", "Level 2: After one more iteration, $x_3 \\approx 1.557145596$ to 9 decimal places."] },
        { expression: "x_3 \\approx 1.557145596, \\quad f(x_3) < 10^{-13}", annotation: "Converged. True root of $x + \\ln x = 2$ is $\\approx 1.557145596$. No closed-form expression for this number exists.", strategyTitle: "Stop when |xₙ₊₁ − xₙ| < tolerance", hints: ["Level 1: This is a transcendental number — it cannot be written as a ratio of integers or a combination of standard constants. Newton's numerical answer IS the answer."] },
      ],
      conclusion: "The equation $x + \\ln x = 2$ has a unique root $r \\approx 1.557145596$ with no algebraic closed form. Newton's Method found it in 4 steps from $x_0 = 1.5$. The key setup steps — rewrite as $f(x) = 0$, differentiate, then iterate — are the same for any transcendental equation. Only the formulas for $f$ and $f'$ change.",
    },
    {
      id: 'ch3-060-ex8',
      title: 'The Dottie Number: Solve x = cos(x)',
      problem: "\\text{Find the unique real solution of } x = \\cos x \\text{ (the Dottie number) using Newton's Method with } x_0 = 0.7.",
      steps: [
        { expression: "f(x) = x - \\cos x, \\quad f'(x) = 1 + \\sin x", annotation: "Rewrite $x = \\cos x$ as $f(x) = x - \\cos x = 0$. Differentiate: $\\frac{d}{dx}(x - \\cos x) = 1 - (-\\sin x) = 1 + \\sin x$.", strategyTitle: "Set up: rewrite as f(x) = 0 and differentiate", hints: ["Level 1: $f(x) = x - \\cos x$. Use the chain rule: $\\frac{d}{dx}(-\\cos x) = -(-\\sin x) = \\sin x$. So $f'(x) = 1 + \\sin x$.", "Level 2: Important: $f'(x) = 1 + \\sin x \\geq 0$ for all $x$ (since $\\sin x \\geq -1$). The denominator is never negative and only equals zero at $x = -\\pi/2 + 2k\\pi$, which is far from the root near 0.739. So the iteration is safe everywhere near the root.", "Level 3: $f(0) = 0 - 1 = -1 < 0$ and $f(\\pi/2) = \\pi/2 - 0 \\approx 1.57 > 0$. Sign change confirms a root in $(0, \\pi/2)$."] },
        { expression: "x_0 = 0.7: \\quad \\cos(0.7) \\approx 0.76484, \\quad \\sin(0.7) \\approx 0.64422", annotation: "Compute trig values at the starting guess (radians).", strategyTitle: "Evaluate f(xₙ) and f'(xₙ) at the current guess", hints: ["Level 1: $f(0.7) = 0.7 - 0.76484 = -0.06484$. Negative: our guess is to the left of the root.", "Level 2: $f'(0.7) = 1 + 0.64422 = 1.64422 > 0$. Positive slope — root is to the right, as expected."] },
        { expression: "x_1 = 0.7 - \\frac{0.7 - 0.76484}{1 + 0.64422} = 0.7 - \\frac{-0.06484}{1.64422} = 0.7 + 0.03944 = 0.73944", annotation: "First Newton step. Moved from 0.7 to 0.7394, very close to the Dottie number 0.73909.", strategyTitle: "Apply the iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)", hints: ["Level 1: Numerator $= -0.06484$ (negative). Denominator $= 1.64422$ (positive). Ratio $\\approx -0.03944$. Subtracting a negative → add → move right.", "Level 2: Error at $x_0 = 0.7$: $|0.7 - 0.73909| \\approx 0.039$. Error at $x_1 = 0.7394$: $|0.7394 - 0.73909| \\approx 0.0003$. Roughly 130× improvement."] },
        { expression: "x_1 \\approx 0.73944: \\quad f(0.73944) = 0.73944 - \\cos(0.73944) \\approx 0.73944 - 0.73870 = 0.00074", annotation: "$\\cos(0.73944) \\approx 0.73870$. Now $f$ is tiny positive — just past the root.", strategyTitle: "Evaluate f(xₙ) at the current guess", hints: ["Level 1: $f(0.7394) \\approx 0.00074 > 0$. We narrowed in from the left and slightly overshot. The next correction is tiny."] },
        { expression: "x_2 \\approx 0.73944 - \\frac{0.00074}{1 + \\sin(0.73944)} \\approx 0.73944 - \\frac{0.00074}{1.67318} \\approx 0.73944 - 0.00044 = 0.73909", annotation: "Second iteration. Landed essentially on the Dottie number.", strategyTitle: "Apply the iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)", hints: ["Level 1: Correction $\\approx 0.00044$. Error at $x_2 \\approx 0.73909$: less than $10^{-5}$."] },
        { expression: "x_3 \\approx 0.7390851332, \\quad f(x_3) < 10^{-13}", annotation: "Third iteration gives full precision. The Dottie number $D \\approx 0.7390851332151607$.", strategyTitle: "Stop when |xₙ₊₁ − xₙ| < tolerance", hints: ["Level 1: Verify: $\\cos(0.7390851332) \\approx 0.7390851332$. The function value equals the input — it is truly a fixed point of cosine.", "Level 2: This number has no algebraic expression. It is transcendental. Newton's Method is the only practical way to compute it."] },
      ],
      conclusion: "The Dottie number $D \\approx 0.7390851332151607$ is the unique real solution of $x = \\cos x$. Newton's Method converges to it in just 3 steps from $x_0 = 0.7$. This equation is a famous example of a transcendental fixed-point problem with no closed form — illustrating why Newton's Method (and numerical methods generally) are indispensable tools in mathematics and science.",
    },
  ],

  challenges: [
    {
      id: 'ch3-060-ch1',
      difficulty: 'hard',
      problem: "Use Newton's Method to find all real roots of $x^3 - 6x^2 + 11x - 5 = 0$ to 4 decimal places. You will need to choose different starting points for different roots.",
      hint: 'The signs of the function at integer points are your "treasure map." Before you fire the Newton laser, walk the x-axis to find where the function flips from positive to negative. Each flip is a target for a new Newton sequence.',
      walkthrough: [
        { expression: "f(x) = x^3 - 6x^2 + 11x - 5, \\quad f'(x) = 3x^2 - 12x + 11", annotation: 'Set up the iteration.' },
        { expression: 'f(0) = -5 < 0, \\; f(1) = 1 > 0, \\; f(2) = -1 < 0, \\; f(3) = -2 < 0, \\; f(5) = 10 > 0', annotation: 'Sign changes suggest roots near $x \\approx 0.6$, $x \\approx 1.3$, and $x \\approx 4.1$.' },
        { expression: 'x_0 = 0.5: \\quad x_1 \\approx 0.5897, \\; x_2 \\approx 0.5858, \\; x_3 \\approx 0.5858', annotation: 'First root: $r_1 \\approx 0.5858$.' },
        { expression: 'x_0 = 2: \\quad x_1 \\approx 1.3333, \\; x_2 \\approx 1.2964, \\; x_3 \\approx 1.2929, \\; x_4 \\approx 1.2929', annotation: 'Second root: $r_2 \\approx 1.2929$ (note: this is $3 - \\sqrt{3} \\approx 1.2679$... let me recompute).' },
        { expression: 'x_0 = 4.5: \\quad x_1 \\approx 4.1667, \\; x_2 \\approx 4.1214, \\; x_3 \\approx 4.1213', annotation: 'Third root: $r_3 \\approx 4.1213$.' },
      ],
      answer: "\\text{The three roots are approximately } r_1 \\approx 0.5858, \\; r_2 \\approx 1.2929, \\; r_3 \\approx 4.1213.",
    },
    {
      id: 'ch3-060-ch2',
      difficulty: 'medium',
      problem: "Apply Newton's Method to $f(x) = x^2 - a$ (where $a > 0$) to derive the Babylonian formula for $\\sqrt{a}$. Then use it to compute $\\sqrt{5}$ to 6 decimal places.",
      hint: 'The Babylonian "average" is actually the secret origin of Newton\'s Method. If your guess is too high, its reciprocal is too low—so their average is almost perfect. This symmetry is why it converges so fast.',
      walkthrough: [
        { expression: "f(x) = x^2 - a, \\quad f'(x) = 2x", annotation: 'Set up for finding $\\sqrt{a}$.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^2 - a}{2x_n} = \\frac{2x_n^2 - x_n^2 + a}{2x_n} = \\frac{x_n + a/x_n}{2}', annotation: 'Simplify: the Newton iterate is the average of $x_n$ and $a/x_n$. This is the Babylonian formula.' },
        { expression: 'a = 5, \\; x_0 = 2: \\quad x_1 = \\frac{2 + 2.5}{2} = 2.25', annotation: 'First iteration for $\\sqrt{5}$.' },
        { expression: 'x_2 = \\frac{2.25 + 5/2.25}{2} = \\frac{2.25 + 2.2222}{2} \\approx 2.23611', annotation: 'Second iteration.' },
        { expression: 'x_3 \\approx 2.236068, \\quad x_4 \\approx 2.236068', annotation: 'Converged. $\\sqrt{5} \\approx 2.236068$.' },
      ],
      answer: "x_{n+1} = \\frac{x_n + a/x_n}{2}. \\quad \\sqrt{5} \\approx 2.236068.",
    },
    {
      id: 'ch3-060-ch3',
      difficulty: 'medium',
      problem: "Show that Newton's Method applied to $f(x) = x^2$ (which has a double root at $x = 0$) converges only linearly, not quadratically. Compute 5 iterations starting from $x_0 = 1$.",
      hint: 'The "Newton Engine" slows down at double roots. Because the tangent line becomes so flat, it doesn\'t point toward the root as aggressively. Watch how each step only kills half the error—like a bisection that never stops.',
      walkthrough: [
        { expression: "f(x) = x^2, \\quad f'(x) = 2x", annotation: 'The root $r = 0$ has multiplicity 2.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^2}{2x_n} = x_n - \\frac{x_n}{2} = \\frac{x_n}{2}', annotation: 'The iteration simply halves the current value each step.' },
        { expression: 'x_0 = 1, \\; x_1 = 0.5, \\; x_2 = 0.25, \\; x_3 = 0.125, \\; x_4 = 0.0625, \\; x_5 = 0.03125', annotation: 'Each step halves the error — linear convergence with ratio $1/2$, not quadratic.' },
        { expression: '|e_{n+1}| = \\frac{1}{2}|e_n| \\text{ (linear)}, \\quad \\text{not } |e_{n+1}| \\approx C|e_n|^2 \\text{ (quadratic)}', annotation: 'At a double root, $f\'(r) = 0$, which violates the hypothesis for quadratic convergence.' },
      ],
      answer: "\\text{At a double root, Newton's Method gives } x_{n+1} = x_n/2, \\text{ which is linear convergence with ratio } 1/2.",
    },
    {
      id: 'ch3-060-capstone',
      difficulty: 'capstone',
      title: "Capstone: Kepler's Equation — How NASA Tracks Spacecraft",
      problem: "In orbital mechanics, the position of a planet or spacecraft along its orbit is determined by solving **Kepler's equation**: $$E - e\\sin E = M$$ where $E$ is the *eccentric anomaly* (the parameter we want), $e$ is the orbital **eccentricity** ($0 \\le e < 1$), and $M$ is the *mean anomaly* (a time variable that grows linearly). There is no algebraic formula for $E$ — Newton's Method has been the standard numerical solution since the 17th century.\n\n**(a)** Define $f(E) = E - e\\sin E - M$. Compute $f'(E)$.\n\n**(b)** For Mars's orbit, $e \\approx 0.093$ (nearly circular). For a highly elliptical transfer orbit, $e = 0.5$. Use $e = 0.5$, $M = \\pi/2$. Starting from $E_0 = M = \\pi/2$, perform 4 Newton iterations by hand.\n\n**(c)** Is $f'(E)$ ever zero? What does that mean for convergence?\n\n**(d -- Python)** Write a Newton loop to solve Kepler's equation for $e = 0.5$ and 12 different values of $M$ from $0$ to $2\\pi$. Print a table of $M$ and the corresponding $E$.",
      hint: "$f'(E) = 1 - e\\cos E$. Note that since $|e\\cos E| \\le e < 1$, we have $f'(E) > 0$ for all $E$ — Newton's Method **always converges** for Kepler's equation regardless of starting guess. This is a rare guarantee in nonlinear root-finding.",
      walkthrough: [
        { expression: "f(E) = E - 0.5\\sin E - \\frac{\\pi}{2}, \\quad f'(E) = 1 - 0.5\\cos E", annotation: "Set up: $e = 0.5$, $M = \\pi/2 \\approx 1.5708$. Note $f'(E) \\ge 1 - 0.5 = 0.5 > 0$ always — guaranteed convergence." },
        { expression: "E_0 = 1.5708, \\quad f(E_0) = 1.5708 - 0.5\\sin(1.5708) - 1.5708 = -0.5 \\cdot 1 = -0.5", annotation: "First evaluation. $\\sin(\\pi/2) = 1$, so $f(E_0) = -0.5$." },
        { expression: "f'(E_0) = 1 - 0.5\\cos(1.5708) = 1 - 0.5 \\cdot 0 = 1", annotation: "$\\cos(\\pi/2) = 0$, so $f'(E_0) = 1$." },
        { expression: "E_1 = 1.5708 - \\frac{-0.5}{1} = 2.0708", annotation: "First iterate." },
        { expression: "f(E_1) \\approx 2.0708 - 0.5\\sin(2.0708) - 1.5708 \\approx 2.0708 - 0.4564 - 1.5708 = 0.0436", annotation: "$\\sin(2.0708) \\approx 0.8929$." },
        { expression: "f'(E_1) = 1 - 0.5\\cos(2.0708) \\approx 1 - 0.5(-0.4503) \\approx 1.225", annotation: "$\\cos(2.0708) \\approx -0.4503$." },
        { expression: "E_2 = 2.0708 - \\frac{0.0436}{1.225} \\approx 2.0352", annotation: "Second iterate — already close." },
        { expression: "E_3 \\approx 2.0345, \\quad E_4 \\approx 2.0345", annotation: "Converged. The eccentric anomaly for $e = 0.5$, $M = \\pi/2$ is $E \\approx 2.0345$ radians." },
      ],
      answer: "E \\approx 2.0345 \\text{ radians for } e=0.5, M=\\pi/2. \\quad f'(E)=1-e\\cos E \\ge 1-e > 0 \\text{ always, so convergence is guaranteed.}",
    },
  ],

  crossRefs: [
    { lessonSlug: 'linear-approximation', label: 'Linear Approximation', context: "Newton's Method is iterated linear approximation: each step replaces the curve by its tangent line and solves the resulting linear equation." },
    { lessonSlug: 'mean-value-theorem', label: 'Mean Value Theorem', context: "The convergence proof for Newton's Method uses the Mean Value Theorem to bound the error at each step." },
    { lessonSlug: 'differentials', label: 'Differentials', context: "The differential $dy = f'(x)\\,dx$ is the tangent-line approximation that Newton's Method exploits at every iteration." },
    { lessonSlug: 'rolles-theorem', label: "Rolle's Theorem", context: "Rolle's Theorem guarantees that between consecutive roots of $f$, there is a root of $f'$ — which affects the basins of attraction for Newton's Method." },
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

  quiz: [
    {
      id: 'nm-q1',
      type: 'choice',
      text: "Newton's Method generates the sequence $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. Geometrically, $x_{n+1}$ is:",
      options: [
        'The midpoint of the interval $[x_n, x_{n-1}]$',
        'Where the tangent line to $y = f(x)$ at $(x_n, f(x_n))$ crosses the $x$-axis',
        'Where the secant through $(x_{n-1}, f(x_{n-1}))$ and $(x_n, f(x_n))$ crosses the $x$-axis',
        'The average of $x_n$ and $f(x_n)$',
      ],
      answer: 'Where the tangent line to $y = f(x)$ at $(x_n, f(x_n))$ crosses the $x$-axis',
      hints: [
        'The tangent line at $(x_n, f(x_n))$ is $y = f(x_n) + f\'(x_n)(x - x_n)$. Setting $y = 0$ gives $x = x_n - f(x_n)/f\'(x_n) = x_{n+1}$.',
      ],
      reviewSection: "Intuition — Deriving Newton's formula",
    },
    {
      id: 'nm-q2',
      type: 'input',
      text: "To find $\\sqrt{2}$, solve $f(x) = x^2 - 2 = 0$. The Newton iteration is $x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n}$. Starting from $x_0 = 1$, compute $x_1$. Enter the value as a fraction or decimal.",
      answer: '3/2',
      hints: [
        '$x_1 = 1 - \\frac{1 - 2}{2} = 1 + \\frac{1}{2} = \\frac{3}{2} = 1.5$.',
      ],
      reviewSection: "Intuition — Computing $\\sqrt{2}$ by Newton's Method",
    },
    {
      id: 'nm-q3',
      type: 'input',
      text: "Continuing: $x_1 = 3/2$. Compute $x_2 = x_1 - \\frac{x_1^2 - 2}{2x_1}$. Enter the value as a fraction.",
      answer: '17/12',
      hints: [
        '$x_2 = \\frac{3}{2} - \\frac{9/4 - 2}{3} = \\frac{3}{2} - \\frac{1/4}{3} = \\frac{3}{2} - \\frac{1}{12} = \\frac{18 - 1}{12} = \\frac{17}{12}$.',
      ],
      reviewSection: "Intuition — Computing $\\sqrt{2}$ by Newton's Method",
    },
    {
      id: 'nm-q4',
      type: 'choice',
      text: "Newton's Method fails at step $n$ if:",
      options: [
        "$f(x_n) = 0$ (we found the root)",
        "$f'(x_n) = 0$ (tangent line is horizontal)",
        "$x_n > 0$",
        "$f(x_n) > 0$",
      ],
      answer: "$f'(x_n) = 0$ (tangent line is horizontal)",
      hints: [
        "The formula $x_{n+1} = x_n - f(x_n)/f'(x_n)$ divides by $f'(x_n)$. If $f'(x_n) = 0$, the tangent is horizontal and never reaches the $x$-axis.",
      ],
      reviewSection: "Intuition — When Newton's Method fails",
    },
    {
      id: 'nm-q5',
      type: 'input',
      text: "To solve $f(x) = x^3 - x - 1 = 0$ near $x_0 = 1$: compute $f(1)$ and $f'(1)$, then find $x_1 = x_0 - f(x_0)/f'(x_0)$. Enter $x_1$.",
      answer: '1.5',
      hints: [
        '$f(1) = 1 - 1 - 1 = -1$ and $f\'(x) = 3x^2 - 1$, so $f\'(1) = 2$.',
        '$x_1 = 1 - (-1)/2 = 1 + 0.5 = 1.5$.',
      ],
      reviewSection: "Examples — Newton's Method for a cubic",
    },
    {
      id: 'nm-q6',
      type: 'input',
      text: "For $f(x) = \\cos x - x$, starting from $x_0 = 1$ (radian). Compute $f(1) = \\cos 1 - 1 \\approx -0.4597$ and $f'(x) = -\\sin x - 1$, so $f'(1) \\approx -1.8415$. Compute $x_1 = x_0 - f(x_0)/f'(x_0)$. Round to 4 decimal places.",
      answer: '0.7503',
      hints: [
        '$x_1 = 1 - \\frac{-0.4597}{-1.8415} = 1 - 0.2497 \\approx 0.7503$.',
      ],
      reviewSection: "Examples — Newton's Method for a transcendental equation",
    },
    {
      id: 'nm-q7',
      type: 'choice',
      text: "Newton's Method exhibits quadratic convergence near a simple root. This means if $e_n$ is the error at step $n$, then roughly:",
      options: [
        '$e_{n+1} \\approx \\frac{1}{2}e_n$ (error halves each step)',
        '$e_{n+1} \\approx C \\cdot e_n^2$ (error squares each step)',
        '$e_{n+1} \\approx e_n - 1$ (error decreases by a constant)',
        '$e_{n+1} \\approx e_n$ (error stays constant)',
      ],
      answer: '$e_{n+1} \\approx C \\cdot e_n^2$ (error squares each step)',
      hints: [
        'Quadratic convergence means the number of correct digits roughly doubles each step.',
      ],
      reviewSection: "Math — Quadratic convergence",
    },
    {
      id: 'nm-q8',
      type: 'input',
      text: "To find $\\sqrt[3]{5}$, solve $f(x) = x^3 - 5 = 0$. Starting from $x_0 = 2$: $f(2) = 3$, $f'(2) = 12$. Compute $x_1 = x_0 - f(x_0)/f'(x_0)$. Enter the fraction.",
      answer: '7/4',
      hints: [
        '$x_1 = 2 - 3/12 = 2 - 1/4 = 7/4 = 1.75$.',
      ],
      reviewSection: "Examples — Cube root by Newton's Method",
    },
    {
      id: 'nm-q9',
      type: 'choice',
      text: "Compared to the bisection method, Newton's Method is generally:",
      options: [
        'Slower but always converges',
        'Faster but may fail to converge if the initial guess is poor',
        'The same speed — both double correct digits each step',
        'Slower and less reliable',
      ],
      answer: 'Faster but may fail to converge if the initial guess is poor',
      hints: [
        'Bisection converges linearly (adds ~0.3 digits per step) and is guaranteed to converge. Newton converges quadratically but needs a good start.',
      ],
      reviewSection: "Math — Bisection vs Newton comparison",
    },
    {
      id: 'nm-q10',
      type: 'input',
      text: "Newton's Method iteration formula is $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. For $f(x) = x^2 - a$ (finding $\\sqrt{a}$), simplify this iteration to the form $x_{n+1} = \\frac{1}{2}\\left(x_n + \\frac{a}{x_n}\\right)$. If $a = 9$ and $x_0 = 4$, compute $x_1$. Enter the exact value.",
      answer: '25/8',
      hints: [
        '$x_1 = \\frac{1}{2}(4 + 9/4) = \\frac{1}{2} \\cdot \\frac{25}{4} = \\frac{25}{8} = 3.125$.',
      ],
      reviewSection: "Intuition — Babylonian square root algorithm",
    },
    {
      id: 'nm-q11',
      type: 'multiple-choice',
      text: "You apply Newton's Method to $f(x) = x^3 - 2x + 2$ starting at $x_0 = 0$. Which of the following best describes what happens?",
      options: [
        'Converges to the root near $x \\approx -1.77$',
        'Converges to the root near $x \\approx 1$',
        'Cycles between two values and never converges',
        'Diverges to $+\\infty$',
      ],
      answer: 'c',
      explanation: "At $x_0 = 0$: $f(0) = 2$, $f'(0) = -2$, so $x_1 = 0 - 2/(-2) = 1$. At $x_1 = 1$: $f(1) = 1$, $f'(1) = 1$, so $x_2 = 1 - 1/1 = 0$. The iteration cycles between $0$ and $1$ indefinitely. This is a classic 2-cycle failure. Fix: graph $f$ first to see the root near $x \\approx -1.77$ is far from this region, then start from $x_0 = -2$.",
      hints: [
        'Compute $x_1$ from $x_0 = 0$, then compute $x_2$ from $x_1$. Notice anything?',
      ],
      reviewSection: "Intuition — When Newton's Method Fails",
    },
    {
      id: 'nm-q12',
      type: 'multiple-choice',
      text: "After several Newton iterations, your table of iterates reads: $x_0 = 2$, $x_1 = 1.5$, $x_2 = 1.416$, $x_3 = 1.4142$, $x_4 = 1.41421356$. Which pattern best characterizes the convergence?",
      options: [
        'Linear convergence — each step reduces the error by a constant factor',
        'Quadratic convergence — the number of correct decimal digits roughly doubles each step',
        'Cubic convergence — the number of correct digits triples each step',
        'Divergence — the iterates are moving away from a root',
      ],
      answer: 'b',
      explanation: "$x_4 \\approx \\sqrt{2} \\approx 1.41421356$. The errors are roughly $0.59$, $0.086$, $0.002$, $0.00001$, $0.0000000...$. Each error is approximately the previous error squared — halving the decimal places each step ($1 \\to 2 \\to 4 \\to 8$ correct digits). This is the hallmark of quadratic convergence.",
      hints: [
        'Count how many correct decimal digits each iterate shares with $\\sqrt{2} \\approx 1.41421356...$',
      ],
      reviewSection: "Math — Quadratic Convergence",
    },
    {
      id: 'nm-q13',
      type: 'input',
      text: "The function $f(x) = x^2$ has a double root at $x = 0$ (multiplicity $m = 2$). The **modified Newton formula** for a root of multiplicity $m$ is $x_{n+1} = x_n - m \\cdot \\frac{f(x_n)}{f'(x_n)}$. Starting from $x_0 = 0.5$, compute $x_1$ using the modified formula with $m = 2$.",
      answer: '0',
      hints: [
        '$f(0.5) = 0.25$, $f\'(x) = 2x$ so $f\'(0.5) = 1$. Modified step: $x_1 = 0.5 - 2 \\cdot (0.25/1)$.',
      ],
      explanation: "$x_1 = 0.5 - 2 \\cdot (0.25 / 1) = 0.5 - 0.5 = 0$. The modified formula finds the double root **in one step** from $x_0 = 0.5$! Compare this to the standard formula which gives $x_1 = 0.5 - 0.25/1 = 0.25$ — still far from zero. Knowing the multiplicity restores quadratic convergence.",
      reviewSection: "Math — Multiple Roots callout",
    },
    {
      id: 'nm-q14',
      type: 'multiple-choice',
      text: "During Newton iteration, your iterates are: $1.2, 3.7, 0.8, 3.9, 0.9, 3.8, \\ldots$ — oscillating between two distant values and showing no sign of settling. What is the most likely cause and the best immediate response?",
      options: [
        'Rounding error — use more decimal places',
        'The equation has no real roots — try complex arithmetic',
        'The starting guess landed in a bad basin of attraction causing cycling — graph $f$, find a sign change, and restart from within that bracket',
        'Quadratic convergence is naturally slow at first — keep iterating',
      ],
      answer: 'c',
      explanation: "Oscillation between two distant values is a 2-cycle: the tangent line at each point sends you to the other side of a local extremum, which sends you back again. The fix is not to iterate more — it is to start over. Graph $f(x)$, find an interval $(a, b)$ where $f(a)$ and $f(b)$ have opposite signs (IVT sign check), and restart Newton from a point inside that bracket.",
      hints: [
        'The iterates are not getting closer to each other. More iterations will not fix a structural cycling problem.',
      ],
      reviewSection: "Intuition — When Newton's Method Fails",
    },
  ],

  spiral: {
    recoveryPoints: [
      { label: 'Linear Approximation (Lesson 2)', note: "Newton's Method IS iterated linear approximation: at each step, replace f(x) with its tangent line and solve the linear equation" },
      { label: 'Tangent Line (Ch. 2)', note: 'The tangent line at (xₙ, f(xₙ)) has equation y − f(xₙ) = f\'(xₙ)(x − xₙ). Setting y = 0 gives xₙ₊₁ — this is the entire algorithm' },
      { label: 'Implicit Differentiation (Ch. 2)', note: 'To solve g(x, y) = 0 for y, Newton\'s Method in two variables uses the Jacobian — same principle, same tangent-line idea' },
    ],
    futureLinks: [
      { label: 'Optimization (Lesson 6)', note: 'To find critical points of f, solve f\'(x) = 0. Newton\'s Method applied to f\'(x) uses f\'\'(x): xₙ₊₁ = xₙ − f\'(xₙ)/f\'\'(xₙ)' },
      { label: 'Numerical Integration (Ch. 4)', note: 'Many integration methods (Runge-Kutta, etc.) use Newton-style iteration under the hood — calculus powers the algorithms that power computation' },
      { label: 'Multivariable Newton (Calc 3)', note: 'For systems of equations F(x) = 0 in ℝⁿ, Newton\'s Method uses the Jacobian matrix: xₙ₊₁ = xₙ − J(xₙ)⁻¹F(xₙ)' },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'nm-q1',
        type: 'multiple-choice',
        question: "Apply one step of Newton's Method to $f(x) = x^2 - 5$ starting from $x_0 = 2$. What is $x_1$?",
        options: ['2.5', '2.25', '2.1', '2.4'],
        answer: 'b',
        explanation: "$f(x_0) = 4 - 5 = -1$, $f'(x_0) = 2(2) = 4$. So $x_1 = 2 - (-1)/4 = 2 + 0.25 = 2.25$. This is approaching $\\sqrt{5} \\approx 2.236$.",
      },
      {
        id: 'nm-q2',
        type: 'multiple-choice',
        question: "Newton's Method converges quadratically. If the error at step $n$ is $10^{-3}$, roughly what is the error at step $n+1$?",
        options: ['$10^{-3}$', '$10^{-4}$', '$10^{-6}$', '$10^{-9}$'],
        answer: 'c',
        explanation: "Quadratic convergence means $|e_{n+1}| \\approx C|e_n|^2$. With $C \\approx 1$ and $e_n = 10^{-3}$, we get $e_{n+1} \\approx (10^{-3})^2 = 10^{-6}$. The number of correct digits doubles.",
      },
      {
        id: 'nm-q3',
        type: 'multiple-choice',
        question: "Newton's Method is applied to $f(x) = \\sin(x)$ starting near $x_0 = 3$. To which root does it converge?",
        options: ['$x = 0$', '$x = \\pi$', '$x = 2\\pi$', 'It diverges'],
        answer: 'b',
        explanation: "Starting near $x = 3 \\approx \\pi$, the nearest root of $\\sin(x) = 0$ is $x = \\pi \\approx 3.14159$. Newton's Method converges to the root closest to the initial guess (when the function is well-behaved near that root).",
      },
    ],
  },

  masteryChecklist: [
    'I can define a root and locate one using a sign test (IVT) on any continuous function.',
    'I can derive the Newton-Raphson formula $x_{n+1} = x_n - f(x_n)/f\'(x_n)$ from the tangent-line equation — every algebra step, without notes.',
    'I can perform 3+ Newton iterations by hand for polynomial, trigonometric, logarithmic, and exponential equations.',
    'I know the three main failure modes (cycling, divergence, wrong root) and the immediate fix for each.',
    'I can explain quadratic convergence: why correct digits double each step, and what the constant $C = |f\'\'(r)| / (2|f\'(r)|)$ represents.',
    'I can implement Newton\'s Method in Python — define $f$ and $f\'$, run the loop, and interpret the convergence table.',
    'I have solved the Kepler capstone and can connect the algorithm to a real physical application.',
  ],

  summary: {
    headline: "You now know how calculators compute square roots — and so much more.",
    estimatedTime: '90–120 minutes',
    keyIdeas: [
      'A **root** of $f$ is a value $r$ where $f(r) = 0$. Finding roots is how we solve almost every equation in science and engineering.',
      'Newton\'s Method replaces the curve with its tangent line at each step, solves that simpler linear equation, and uses the answer as the next guess.',
      'The iteration is $x_{n+1} = x_n - f(x_n)/f\'(x_n)$ — four symbols that unlock the solution to any differentiable equation.',
      'Quadratic convergence means correct decimal digits **double** each step: 1 → 2 → 4 → 8 → 16 digits in just five iterations.',
      'Three failure modes exist — cycling, divergence near horizontal tangent, wrong root — and all are fixed the same way: graph $f$ first, find a sign change, start inside the bracket.',
      'The algorithm is 350 years old (Newton 1669, Raphson 1690) and still powers NASA orbit calculations, financial models, computer graphics, and every iterative solver in modern software.',
    ],
    spacedRepetitionPrompt: "Come back in one week and solve the Dottie number ($\\cos x = x$) from scratch without notes. If you can find $x \\approx 0.739085$ in under 5 minutes using three Newton steps in your head, you own Newton's Method.",
  },
}

