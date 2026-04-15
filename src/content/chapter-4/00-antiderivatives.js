// FILE: src/content/chapter-4/00-antiderivatives.js
export default {
  id: 'ch4-000a',
  slug: 'antiderivatives',
  chapter: 4,
  order: 0,
  title: 'Antiderivatives',
  subtitle: 'Reversing differentiation — and why this is not the same as integration',
  tags: [
    'antiderivative',
    'reverse differentiation',
    'power rule integration',
    'constant of integration',
    '+C',
    'initial value problem',
    'antiderivative table',
    'antiderivative vs integral',
    'general antiderivative',
    'particular antiderivative',
  ],

  learningObjectives: [
    'Define antiderivative precisely: $F$ is an antiderivative of $f$ on an interval if $F\'(x) = f(x)$ for every $x$ in that interval.',
    'Prove that any two antiderivatives of the same function differ by a constant, using the MVT corollary.',
    'State the general antiderivative $F(x)+C$ and explain what $C$ represents geometrically (a vertical shift of the solution curve).',
    'Explain clearly why antiderivatives and definite integrals are different objects — one is algebraic, one is analytic — and identify the theorem that connects them.',
    'Apply the power rule for antiderivatives to polynomial, fractional-exponent, and negative-exponent expressions.',
    'Use the standard antiderivative table (trig, exponential, logarithm, inverse trig) fluently, verifying each entry by differentiating.',
    'Apply linearity to antidifferentiate any linear combination of tabulated functions.',
    'Solve initial value problems by integrating and using a given condition to determine $C$.',
  ],

  warmup: {
    title: 'Warm-Up: Differentiation Fluency Check',
    instructions:
      'Antidifferentiation is differentiation read backwards. Before starting, confirm these derivatives are automatic — each one corresponds directly to an antiderivative rule you will use today.',
    problems: [
      {
        prompt: 'Compute $\\dfrac{d}{dx}\\bigl[x^6\\bigr]$.',
        answer: '$6x^5$',
        hint: 'Power rule: bring the exponent down, subtract 1.',
      },
      {
        prompt: 'Compute $\\dfrac{d}{dx}\\bigl[\\sin x\\bigr]$ and $\\dfrac{d}{dx}\\bigl[-\\cos x\\bigr]$.',
        answer: '$\\cos x$ and $\\sin x$',
        hint: 'Derivative of sin is cos; derivative of $-\\cos x$ is $-(-\\sin x) = \\sin x$.',
      },
      {
        prompt: 'True or false: if $F\'(x) = G\'(x)$ for all $x$ on an interval, then $F = G$.',
        answer:
          'False. They can differ by any constant. Example: $F(x) = x^2$, $G(x) = x^2 + 7$ — both have derivative $2x$.',
        hint: "What's the derivative of a constant?",
      },
      {
        prompt:
          "A particle's velocity is $v(t) = 3t^2$. Its position at $t = 0$ is $x(0) = 5$. What is $x(t)$?",
        answer: '$x(t) = t^3 + 5$. Integrate $v$: position is $t^3 + C$; apply $x(0) = 5$ to get $C = 5$.',
        hint: 'Position is the antiderivative of velocity. Use the initial condition to pin down $C$.',
      },
    ],
  },

  hook: {
    question:
      "You have spent all of Chapter 2 and 3 computing derivatives. You can find the derivative of almost any function you meet. Now flip the entire question: instead of being handed a function and asked 'what is its derivative?', you are handed a derivative and asked 'what function produced it?' Given that the derivative is $6x^2$, what was the original function? Given that the derivative is $\\cos x$, what was the original function? Given that the derivative is $e^x$, what was the original function? The answer to each is simple — but the question is completely new, and it opens a second branch of calculus.",
    realWorldContext:
      "Every equation in physics that says 'the rate of change of something equals something else' is an invitation to antidifferentiate. Newton's second law $F = ma = m\\,dv/dt$ says force is the derivative of momentum — finding velocity from force is antidifferentiation. The equation $dP/dt = kP$ (exponential population growth) asks: what function $P(t)$ has derivative $kP$? Antidifferentiation answers it: $P(t) = P_0 e^{kt}$. In electrical engineering, the relation $I = C\\,dV/dt$ (current equals capacitance times rate of voltage change) means finding voltage from current is antidifferentiation. In economics, given a marginal cost function $MC(q)$, total cost $TC(q)$ is its antiderivative. You are antidifferentiating whenever you go from a rate to a quantity — which is exactly the inverse of what derivatives do.",
    previewVisualizationId: 'AntiderivativeFamily',
  },

  intuition: {
    prose: [
      "**Where this lesson sits in the story.** You built differentiation from the limit definition, learned the power rule, product rule, chain rule, and implicit differentiation — a complete forward machine that takes functions to their derivatives. Now we ask: can we run the machine backward? Given the output (the derivative), can we recover the input (the original function)? This question — called *antidifferentiation* — is the first topic of integration. But right away we need to address something your book is careful about that many courses blur over: *antiderivatives and definite integrals are not the same thing*. They are connected by a deep theorem (the Fundamental Theorem of Calculus, Lesson 4), but the connection is not obvious and was not obvious historically. This lesson is about antiderivatives. Definite integrals come in Lessons 1–3.",

      "**The definition.** A function $F$ is called an *antiderivative* of $f$ on an interval $I$ if $F'(x) = f(x)$ for every $x \\in I$. That's the entire definition. It is purely algebraic: given $f$, find $F$ whose derivative is $f$. No area. No rectangles. No limits of sums. Just the question: what function differentiates to this?",

      "**Simple examples.** Since $\\dfrac{d}{dx}[x^3] = 3x^2$, the function $F(x) = x^3$ is an antiderivative of $f(x) = 3x^2$. Since $\\dfrac{d}{dx}[\\sin x] = \\cos x$, we have $F(x) = \\sin x$ is an antiderivative of $f(x) = \\cos x$. Since $\\dfrac{d}{dx}[e^x] = e^x$, the function $F(x) = e^x$ is its own antiderivative. In each case, verification is instant: *differentiate the answer and check it equals the given function*. Differentiation is easy; it is the check that makes antidifferentiation rigorous.",

      "**The +C: infinitely many antiderivatives.** If $F(x) = x^3$ is one antiderivative of $3x^2$, then so is $x^3 + 5$, and $x^3 - 17$, and $x^3 + \\pi$. Differentiating destroys constant information permanently — $\\dfrac{d}{dx}[C] = 0$ regardless of $C$. So when you reverse the process, you cannot know which constant was originally there. Every one of $x^3 + C$, for any real constant $C$, is a valid antiderivative of $3x^2$.",

      "**These are ALL the antiderivatives — proved from the MVT.** Suppose $F'(x) = f(x)$ and $G'(x) = f(x)$ on an interval. Let $H = G - F$. Then $H'(x) = G'(x) - F'(x) = f(x) - f(x) = 0$ everywhere on the interval. The Mean Value Theorem corollary states: if $H'(x) = 0$ on an interval, then $H$ is constant on that interval. (Proof: pick any two points $a < b$; MVT gives $H(b) - H(a) = H'(c)(b-a) = 0$, so $H(b) = H(a)$.) Therefore $G(x) - F(x) = C$ for some constant $C$, meaning $G(x) = F(x) + C$. **Any two antiderivatives of the same function differ by a constant — that is the complete statement.** The general antiderivative of $f$ is written $F(x) + C$, where $F$ is any one particular antiderivative.",

      "**Geometric picture.** On a graph, the family $F(x) + C$ is the single curve $F(x)$ shifted vertically by $C$ — infinitely many parallel curves, one above the other, all with the same slope at every $x$-coordinate. At each point $x$, every member of the family has the same tangent slope $f(x)$. An initial condition — a single point $(x_0, y_0)$ that the solution must pass through — picks out exactly one member of the family, pinning down $C = y_0 - F(x_0)$.",

      "**CRITICAL: antiderivatives and integrals are different objects.** An antiderivative of $f$ is a function $F$ satisfying $F' = f$. A definite integral $\\int_a^b f(x)\\,dx$ is a number defined as the limit of Riemann sums (the area under the curve). These are defined differently, computed differently, and produce different kinds of outputs (a function vs. a number). The Fundamental Theorem of Calculus (Lesson 4) will prove that $\\int_a^b f(x)\\,dx = F(b) - F(a)$ whenever $F' = f$ — a deep and non-obvious connection. Until you have that theorem, treat the two concepts as what they are: distinct. A textbook that defines 'integral' as 'antiderivative' is collapsing a theorem into a definition, which obscures the deep content of the FTC.",

      "**Building the antiderivative table.** Every differentiation rule, read right-to-left, gives an antiderivative rule. Since $\\dfrac{d}{dx}\\left[\\dfrac{x^{n+1}}{n+1}\\right] = x^n$ for $n \\neq -1$, we have: the antiderivative of $x^n$ is $\\dfrac{x^{n+1}}{n+1} + C$. Since $\\dfrac{d}{dx}[\\sin x] = \\cos x$ and $\\dfrac{d}{dx}[-\\cos x] = \\sin x$, we get antiderivatives for $\\cos x$ and $\\sin x$. The entire antiderivative table contains no new mathematics — only the derivative table read backwards. Every entry should be verified by differentiation before it is trusted.",

      "**Linearity.** Because differentiation is linear — $\\dfrac{d}{dx}[cF + G] = cF' + G'$ — antidifferentiation is linear too: if $F$ is an antiderivative of $f$ and $G$ is an antiderivative of $g$, then $cF + G$ is an antiderivative of $cf + g$. In practice: to antidifferentiate a sum, antidifferentiate term by term; to antidifferentiate a constant multiple, factor the constant out. One $+C$ at the end covers all the individual constants.",

      "**Initial value problems.** The general antiderivative $F(x) + C$ describes a whole family. An *initial value problem* (IVP) adds one constraint — typically $F(x_0) = y_0$ — that pins down $C$. Procedure: (1) find the general antiderivative $F(x) + C$; (2) substitute $x_0$ and $y_0$: $y_0 = F(x_0) + C$, so $C = y_0 - F(x_0)$; (3) write the particular solution. Example: antiderivative of $f(x) = 2x$ is $F(x) = x^2 + C$; given $F(3) = 10$: $10 = 9 + C$, so $C = 1$, particular solution $F(x) = x^2 + 1$.",
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: "You've Been Antidifferentiating in Physics for Years",
        body: "Position $x(t)$ is the antiderivative of velocity $v(t)$: if $v = dx/dt$, then $x = \\int v\\,dt$ (in physics notation). Velocity is the antiderivative of acceleration $a(t)$. Every kinematics problem that starts with $a(t)$ and asks for $x(t)$ requires two antidifferentiations. The $+C$ appears each time as an initial position or initial velocity — physically meaningful constants that must be determined from given conditions. This is not new mathematics; it is the mathematics you have been doing, now named precisely.",
      },
      {
        type: 'warning',
        title: 'Antiderivative ≠ Integral — This Distinction Matters',
        body: "An antiderivative is a FUNCTION: $F'(x) = f(x)$. A definite integral is a NUMBER: $\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum f(x_i^*)\\Delta x$. These are defined differently. The Fundamental Theorem of Calculus (Lesson 4) is the theorem that connects them: $\\int_a^b f(x)\\,dx = F(b) - F(a)$. Until you have proved the FTC, you cannot use antiderivatives to compute areas — and you should not conflate the two definitions. Many students are confused by integration because a theorem was secretly promoted to a definition. It wasn't.",
      },
      {
        type: 'theorem',
        title: 'The Antiderivative Family Theorem',
        body: "If $F'(x) = f(x)$ on an interval $I$, then every antiderivative of $f$ on $I$ has the form $F(x) + C$ for some constant $C \\in \\mathbb{R}$. Proof: if $G' = F' = f$, then $(G-F)' = 0$ on $I$, so by the MVT corollary $G - F$ is constant. $\\square$\n\nThis is why we write the general antiderivative as $F(x) + C$: the $+C$ is not sloppy bookkeeping — it is the precise statement that you have captured the entire solution family.",
      },
      {
        type: 'tip',
        title: 'Always Verify by Differentiating',
        body: "Antiderivative answers are self-verifying: differentiate your answer and check it equals the original function. If $\\int 5x^4\\,dx = x^5 + C$, confirm: $\\dfrac{d}{dx}[x^5 + C] = 5x^4$. ✓ This is the fastest way to catch errors and to build confidence. Unlike differentiation, antidifferentiation has no purely mechanical procedure that always works — but verification always works.",
      },
      {
        type: 'misconception',
        title: 'There Is No Antiderivative Product Rule',
        body: "The derivative of a product $fg$ is $f'g + fg'$ — that formula runs *forward*. It does NOT reverse into a simple antiderivative rule. $\\int f(x) g(x)\\,dx \\neq \\left(\\int f\\,dx\\right)\\left(\\int g\\,dx\\right)$ in general. Products are handled by integration by parts (Lesson 7), a more advanced technique. For now: if you see a product, try expanding it algebraically before antidifferentiating term by term.",
      },
      {
        type: 'history',
        title: 'The Naming Gap: Why We Have Two Words',
        body: "The word 'antiderivative' is modern — it became standard in 20th-century textbooks as rigor in analysis improved. Leibniz and Newton used 'integral' for both the antiderivative and the area calculation, because they developed the FTC simultaneously with the definitions. The distinction became important only after Cauchy (1820s) and Riemann (1850s) gave rigorous definitions of the definite integral via limits of sums, making it necessary to separate the algebraic antiderivative from the analytic integral. Your book's distinction follows this more careful tradition.",
      },
    ],
    visualizations: [
      {
        id: 'AntiderivativeFamily',
        title: 'The Antiderivative Family of $f(x) = \\cos x$',
        mathBridge:
          'Each curve in the family $F(x) = \\sin x + C$ has the same derivative $\\cos x$ at every $x$. At each input $x$, all curves have the same slope — but they are vertically offset by $C$. An initial condition selects exactly one member of the family. Drag the slider to change $C$ and observe that the slope field (gray arrows) always matches the tangent slopes of the current curve.',
        caption:
          'The antiderivative of $\\cos x$ is the entire family $\\sin x + C$, not a single function. Every member has the same slope at every $x$, but passes through a different $y$-intercept. Move the $C$ slider to see how initial conditions select a particular solution.',
      },
    ],
  },

  math: {
    prose: [
      'Formal definition: let $f$ be defined on an interval $I$. A function $F: I \\to \\mathbb{R}$ is called an **antiderivative** of $f$ on $I$ if $F\'(x) = f(x)$ for all $x \\in I$. The qualification "on $I$" is important: a function can have an antiderivative on $(0, \\infty)$ without having one on $(-\\infty, \\infty)$ (e.g., $\\ln x$ vs. $\\ln|x|$).',

      'Theorem (antiderivative family): if $F$ is an antiderivative of $f$ on $I$, then every antiderivative of $f$ on $I$ is of the form $F(x) + C$ for some constant $C$. Conversely, $F(x) + C$ is an antiderivative of $f$ for every constant $C$. Proof: converse is immediate ($\\frac{d}{dx}[F+C] = F\' = f$). Forward direction: suppose $G\' = f = F\'$. Then $(G-F)\' = 0$ on $I$. Corollary to the MVT: if $h\' = 0$ on an interval, then $h$ is constant. [Proof: for any $a, b \\in I$ with $a < b$, apply the MVT to $h$ on $[a,b]$: $h(b) - h(a) = h\'(c)(b-a) = 0$, so $h(b) = h(a)$.] Therefore $G - F = C$ for some $C$, giving $G = F + C$. $\\square$',

      '**Power rule for antiderivatives.** For $n \\neq -1$:\n$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$$\nDerivation: we want $F$ with $F\'(x) = x^n$. Try the guess $F(x) = x^{n+1}$. Differentiating: $F\'(x) = (n+1)x^n$ — off by a factor of $(n+1)$. Divide to correct: $F(x) = \\dfrac{x^{n+1}}{n+1}$, and now $F\'(x) = \\dfrac{(n+1)x^n}{n+1} = x^n$. $\\checkmark$ The exception $n = -1$: the formula gives $x^0 / 0$ — division by zero — so it fails. The antiderivative of $x^{-1} = 1/x$ must be found differently. Since $\\dfrac{d}{dx}[\\ln|x|] = \\dfrac{1}{x}$ for all $x \\neq 0$, we have $\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$. The absolute value is essential: $1/x$ is defined for both $x > 0$ and $x < 0$, and both branches need an antiderivative.',

      '**Standard antiderivative table.** Every entry is a derivative rule reversed — verify each by differentiating the right-hand side:\n\n| $f(x)$ | $\\int f(x)\\,dx$ | Derivative check |\n|--------|-----------------|------------------|\n| $x^n$ ($n\\neq -1$) | $\\dfrac{x^{n+1}}{n+1}+C$ | $\\dfrac{d}{dx}\\left[\\dfrac{x^{n+1}}{n+1}\\right] = x^n$ ✓ |\n| $\\dfrac{1}{x}$ | $\\ln\\lvert x\\rvert + C$ | $\\dfrac{d}{dx}[\\ln\\lvert x\\rvert] = \\dfrac{1}{x}$ ✓ |\n| $e^x$ | $e^x + C$ | $\\dfrac{d}{dx}[e^x] = e^x$ ✓ |\n| $a^x$ | $\\dfrac{a^x}{\\ln a}+C$ | $\\dfrac{d}{dx}\\left[\\dfrac{a^x}{\\ln a}\\right] = \\dfrac{a^x \\ln a}{\\ln a} = a^x$ ✓ |\n| $\\cos x$ | $\\sin x + C$ | $\\dfrac{d}{dx}[\\sin x] = \\cos x$ ✓ |\n| $\\sin x$ | $-\\cos x + C$ | $\\dfrac{d}{dx}[-\\cos x] = \\sin x$ ✓ |\n| $\\sec^2 x$ | $\\tan x + C$ | $\\dfrac{d}{dx}[\\tan x] = \\sec^2 x$ ✓ |\n| $\\csc^2 x$ | $-\\cot x + C$ | $\\dfrac{d}{dx}[-\\cot x] = \\csc^2 x$ ✓ |\n| $\\sec x\\tan x$ | $\\sec x + C$ | $\\dfrac{d}{dx}[\\sec x] = \\sec x \\tan x$ ✓ |\n| $\\csc x\\cot x$ | $-\\csc x + C$ | $\\dfrac{d}{dx}[-\\csc x] = \\csc x \\cot x$ ✓ |\n| $\\dfrac{1}{1+x^2}$ | $\\arctan x + C$ | $\\dfrac{d}{dx}[\\arctan x] = \\dfrac{1}{1+x^2}$ ✓ |\n| $\\dfrac{1}{\\sqrt{1-x^2}}$ | $\\arcsin x + C$ | $\\dfrac{d}{dx}[\\arcsin x] = \\dfrac{1}{\\sqrt{1-x^2}}$ ✓ |',

      'Linearity of antidifferentiation: if $F\' = f$ and $G\' = g$ on $I$, and $c$ is any constant, then:\n$$(cF + G)\' = cF\' + G\' = cf + g$$\nTherefore $cF + G$ is an antiderivative of $cf + g$. In practice: $\\int [cf(x) + g(x)]\\,dx = c\\int f(x)\\,dx + \\int g(x)\\,dx$. Note: you still write a single $+C$ at the end, because the sum of two arbitrary constants is still one arbitrary constant. Splitting into multiple $+C_1$ and $+C_2$ is correct but redundant.',

      "**What antidifferentiation cannot do.** The power rule, trig table, and linearity handle a large class of functions — but not all. Many elementary functions have *no* elementary antiderivative: $e^{-x^2}$, $\\sin(x^2)$, $\\dfrac{\\sin x}{x}$, $\\sqrt{1-k^2\\sin^2 x}$ (the elliptic integral), and many others. This is not a gap in the table — it was proved by Liouville in 1835 using differential Galois theory that no finite combination of polynomials, exponentials, logarithms, and trig functions can serve as antiderivatives of these. When elementary antiderivatives don't exist, numerical methods (Lesson 12) or infinite series (Chapter 5) are used. But FTC Part 1 still applies: even without a closed form, $\\dfrac{d}{dx}\\left[\\int_0^x e^{-t^2}\\,dt\\right] = e^{-x^2}$.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Antiderivative',
        body: 'A function $F$ is an **antiderivative** of $f$ on interval $I$ if\n$$F\'(x) = f(x) \\quad \\text{for all } x \\in I.$$\nThe **general antiderivative** is $F(x) + C$, which represents the entire family of antiderivatives parametrized by the real constant $C$.',
      },
      {
        type: 'theorem',
        title: 'Power Rule for Antiderivatives',
        body: 'For $n \\neq -1$:\n$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C.$$\nFor $n = -1$:\n$$\\int \\frac{1}{x}\\,dx = \\ln|x| + C.$$\nVerification in each case: differentiate the right-hand side and confirm it equals $x^n$.',
      },
      {
        type: 'theorem',
        title: 'Linearity',
        body: 'For constants $c$ and antiderivatives $F\' = f$, $G\' = g$:\n$$\\int [cf(x) + g(x)]\\,dx = c\\cdot F(x) + G(x) + C.$$\nAntidifferentiation distributes over addition and constants factor out, exactly as differentiation does.',
      },
      {
        type: 'warning',
        title: 'Power Rule Fails at $n = -1$',
        body: 'Plugging $n = -1$ into $x^{n+1}/(n+1)$ gives $x^0/0$ — undefined. The antiderivative of $1/x$ is $\\ln|x|+C$, which must be memorized (or re-derived from $\\frac{d}{dx}[\\ln|x|] = 1/x$). No algebraic manipulation will recover this from the power rule formula.',
      },
    ],
  },

  applications: {
    prose: [
      '**Recovering kinematics from rates.** In mechanics, the fundamental relationships are:\n$$a(t) = \\frac{dv}{dt} \\qquad v(t) = \\frac{dx}{dt}$$\nRunning these backwards: velocity is the antiderivative of acceleration, and position is the antiderivative of velocity. Given $a(t) = -9.8$ m/s² (constant gravity, upward positive) and initial conditions $v(0) = 20$ m/s, $x(0) = 0$:\n\n*Step 1 — antidifferentiate $a$ to get $v$:* $v(t) = -9.8t + C_1$. Apply $v(0) = 20$: $C_1 = 20$. So $v(t) = -9.8t + 20$.\n\n*Step 2 — antidifferentiate $v$ to get $x$:* $x(t) = -4.9t^2 + 20t + C_2$. Apply $x(0) = 0$: $C_2 = 0$. So $x(t) = -4.9t^2 + 20t$.\n\nThe object reaches maximum height when $v = 0$: $t = 20/9.8 \\approx 2.04$ s, at height $x(2.04) \\approx 20.4$ m. Each integration introduced one constant; each initial condition eliminated one. This is the standard pattern for multi-stage antidifferentiation.',

      "**Economics: total cost from marginal cost.** In microeconomics, the *marginal cost* $MC(q)$ is the derivative of total cost $TC(q)$ — the cost of producing one more unit. Antidifferentiation recovers total cost: $TC(q) = \\int MC(q)\\,dq + C$, where $C = TC(0)$ is the fixed cost (cost of producing zero units). Example: $MC(q) = 3q^2 - 10q + 15$. Antidifferentiate: $TC(q) = q^3 - 5q^2 + 15q + C$. If fixed cost is $TC(0) = 100$, then $C = 100$ and $TC(q) = q^3 - 5q^2 + 15q + 100$. This is the standard economic application — marginal analysis is differentiation; recovering total quantities is antidifferentiation.",

      '**Second-order initial value problems.** When the given information is a second derivative and two conditions (a typical physics setup), two antidifferentiations are required, each introducing one constant eliminated by one condition. The conditions must be given at the appropriate stage: a position condition pins down the constant from the second integration; a velocity condition pins down the constant from the first. The two conditions can both be at the same point (standard IVP) or at two different points (boundary value problem — harder, not covered here).',

      "**The IVP workflow.** Every initial value problem follows the same four steps. *Step 1*: identify the given derivative $f'(x)$ or $f''(x)$ and the initial conditions. *Step 2*: antidifferentiate once (for each order of derivative), appending $+C$ each time. *Step 3*: substitute the initial condition into the antiderivative to solve for $C$. *Step 4*: write the particular solution with $C$ replaced by its value. The only place this can fail is if the antidifferentiation in Step 2 is wrong — verify by differentiating the particular solution at the end.",
    ],
    callouts: [
      {
        type: 'tip',
        title: 'The IVP Four-Step Workflow',
        body: 'Step 1 — Identify: what is the given derivative, and what are the initial conditions?\nStep 2 — Antidifferentiate: find the general antiderivative $F(x) + C$.\nStep 3 — Substitute: plug in the initial condition $(x_0, y_0)$ and solve for $C$.\nStep 4 — Write: state the particular solution $F(x) + C_\\text{value}$, and verify by differentiating.',
      },
      {
        type: 'real-world',
        title: 'Why Two Constants in Kinematics?',
        body: 'Antidifferentiating acceleration gives velocity ($+C_1$); antidifferentiating velocity gives position ($+C_2$). These two constants have direct physical meaning: $C_1 = v(0)$ is the initial velocity (you must be told how fast the object was moving at $t=0$) and $C_2 = x(0)$ is the initial position (you must be told where it started). Without both initial conditions, you cannot uniquely determine the motion. The mathematics precisely mirrors the physics: the more derivatives you reverse, the more initial information you need.',
      },
      {
        type: 'definition',
        title: 'Particular vs. General Antiderivative',
        body: "The **general antiderivative** of $f$ is $F(x) + C$ — the entire family. A **particular antiderivative** is any single member of the family, obtained by assigning a specific value to $C$. Initial conditions produce a particular antiderivative by fixing $C$. The general antiderivative is the answer to 'antidifferentiate $f$'; the particular antiderivative is the answer to an initial value problem.",
      },
    ],
  },

  examples: [
    {
      title: 'Applying the Power Rule',
      problem: 'Find the general antiderivative of $f(x) = 5x^4 - 3x^{-2} + \\sqrt{x}$.',
      solution: [
        'Rewrite $\\sqrt{x} = x^{1/2}$ so every term is a power of $x$.',
        'Apply the power rule to each term:',
        '$\\quad \\int 5x^4\\,dx = 5 \\cdot \\dfrac{x^5}{5} = x^5$',
        '$\\quad \\int -3x^{-2}\\,dx = -3 \\cdot \\dfrac{x^{-1}}{-1} = 3x^{-1}$',
        '$\\quad \\int x^{1/2}\\,dx = \\dfrac{x^{3/2}}{3/2} = \\dfrac{2}{3}x^{3/2}$',
        'Combine and append a single $+C$: $F(x) = x^5 + 3x^{-1} + \\dfrac{2}{3}x^{3/2} + C$',
        '**Verify:** $F\'(x) = 5x^4 - 3x^{-2} + x^{1/2} = f(x)$. $\\checkmark$',
      ],
    },
    {
      title: 'Initial Value Problem (first order)',
      problem: "Given $f'(x) = 6x^2 - 4x + 1$ and $f(2) = 5$, find $f(x)$.",
      solution: [
        'Antidifferentiate: $f(x) = 2x^3 - 2x^2 + x + C$.',
        'Apply the initial condition $f(2) = 5$:',
        '$5 = 2(8) - 2(4) + 2 + C = 16 - 8 + 2 + C = 10 + C$',
        'Solve: $C = -5$.',
        'Particular solution: $f(x) = 2x^3 - 2x^2 + x - 5$.',
        '**Verify:** $f\'(x) = 6x^2 - 4x + 1$ ✓ and $f(2) = 16 - 8 + 2 - 5 = 5$ ✓.',
      ],
    },
    {
      title: 'Mixed Trig and Exponential',
      problem: 'Find $\\displaystyle\\int\\left(3\\cos x - \\frac{2}{x} + 4e^x\\right)dx$.',
      solution: [
        'Apply linearity — antidifferentiate each term:',
        '$\\int 3\\cos x\\,dx = 3\\sin x$',
        '$\\int -\\dfrac{2}{x}\\,dx = -2\\ln|x|$',
        '$\\int 4e^x\\,dx = 4e^x$',
        'Combine: $3\\sin x - 2\\ln|x| + 4e^x + C$.',
        '**Verify:** differentiate term by term: $3\\cos x - \\dfrac{2}{x} + 4e^x$. $\\checkmark$',
      ],
    },
    {
      title: 'Second-Order IVP (Kinematics)',
      problem:
        "An object moves along a line with acceleration $a(t) = 12t - 6$. At $t = 0$: velocity $v(0) = 4$ m/s and position $x(0) = -1$ m. Find $x(t)$.",
      solution: [
        '**First antidifferentiation** ($a \\to v$): $v(t) = 6t^2 - 6t + C_1$.',
        'Apply $v(0) = 4$: $4 = 0 + C_1$, so $C_1 = 4$.',
        'Particular velocity: $v(t) = 6t^2 - 6t + 4$.',
        '**Second antidifferentiation** ($v \\to x$): $x(t) = 2t^3 - 3t^2 + 4t + C_2$.',
        'Apply $x(0) = -1$: $-1 = C_2$.',
        'Particular position: $x(t) = 2t^3 - 3t^2 + 4t - 1$.',
        '**Verify:** $x\'(t) = 6t^2 - 6t + 4 = v(t)$ ✓, $v\'(t) = 12t - 6 = a(t)$ ✓, $x(0) = -1$ ✓, $v(0) = 4$ ✓.',
      ],
    },
  ],

  quiz: [
    {
      question:
        "Which statement correctly describes the relationship between an antiderivative and a definite integral?",
      options: [
        "They are the same thing — 'antiderivative' and 'integral' are two names for the same concept.",
        "An antiderivative is a function $F$ with $F' = f$. A definite integral $\\int_a^b f\\,dx$ is a number defined as a limit of Riemann sums. The Fundamental Theorem of Calculus proves that these are connected — but they are defined differently.",
        'A definite integral is what you get when you add $+C$ to an antiderivative.',
        'An antiderivative requires limits of integration; a definite integral does not.',
      ],
      answer: 1,
    },
    {
      question:
        'Two functions $F$ and $G$ both satisfy $F\'(x) = G\'(x) = 5x^4$ on $(-\\infty, \\infty)$. Which must be true?',
      options: [
        '$F(x) = G(x)$ for all $x$.',
        '$F(x) = G(x)$ only at $x = 0$.',
        '$G(x) = F(x) + C$ for some constant $C \\in \\mathbb{R}$.',
        'No relationship between $F$ and $G$ can be established without more information.',
      ],
      answer: 2,
    },
    {
      question: 'What is the general antiderivative of $f(x) = x^{-3}$?',
      options: [
        '$-3x^{-4} + C$',
        '$-\\dfrac{1}{2}x^{-2} + C$',
        '$\\ln|x^{-3}| + C$',
        '$\\dfrac{x^{-2}}{-2} + C$ (same as $-\\dfrac{1}{2x^2} + C$)',
      ],
      answer: 3,
    },
    {
      question:
        "Given $f'(x) = \\cos x$ and $f(0) = 3$, which is the correct particular antiderivative?",
      options: [
        '$\\sin x + 3$',
        '$\\sin x + C$',
        '$-\\sin x + 3$',
        '$\\cos x + 3$',
      ],
      answer: 0,
    },
    {
      question:
        'Which function does NOT have an elementary antiderivative (i.e., cannot be expressed using polynomials, exponentials, logarithms, and trig functions)?',
      options: ['$x^5 - 3x + 1$', '$e^x \\cos x$', '$e^{-x^2}$', '$\\sec^2 x$'],
      answer: 2,
    },
    {
      question:
        "Why does $\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$ require the absolute value, while $\\int e^x\\,dx = e^x + C$ does not?",
      options: [
        'Because $\\ln x$ is not defined for $x < 0$, but $\\dfrac{1}{x}$ is — the antiderivative must cover both branches.',
        'Because $e^x$ is always positive.',
        'Because $\\dfrac{1}{x}$ is not differentiable at $x = 0$.',
        'The absolute value is optional notation and does not change the answer.',
      ],
      answer: 0,
    },
  ],
};
