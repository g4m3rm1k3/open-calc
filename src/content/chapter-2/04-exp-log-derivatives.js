// FILE: src/content/chapter-2/04-exp-log-derivatives.js
export default {
  id: "ch2-004",
  slug: "exp-log-derivatives",
  chapter: 2,
  order: 6,
  title: "Derivatives of Exponential and Logarithmic Functions",
  subtitle:
    "The function that equals its own derivative — and the logarithm that unlocks it",
  tags: [
    "exponential derivative",
    "logarithm derivative",
    "natural log",
    "e^x",
    "ln x",
    "logarithmic differentiation",
    "a^x",
  ],
  aliases:
    "section 3.9 derivative exponential function derivative logarithmic function formal proof e^x ln x logarithmic differentiation",

  spiral: {
    recoveryPoints: [
      {
        label: "Chain Rule (previous lesson)",
        note: "Every exponential with a composite exponent — e^(g(x)) — requires chain rule for its derivative: e^(g(x))·g'(x). Without it the inner derivative is missing.",
      },
      {
        label: "What e is (natural exponential from Chapter 0 or Precalc)",
        note: "e ≈ 2.718 is introduced informally as a base of growth. This lesson provides the calculus definition: e is the unique base for which the exponential has slope exactly 1 at the origin.",
      },
    ],
    futureLinks: [
      {
        label: "Inverse Function Derivatives (next lesson)",
        note: "ln(x) is the inverse of e^x. The derivative of ln(x) = 1/x was derived here using that inverse relationship — the next lesson generalizes this argument to every invertible function.",
      },
      {
        label: "Logarithmic Differentiation (tool used in this lesson)",
        note: "Taking ln of both sides before differentiating is a technique introduced here for x^x-type functions. It reappears whenever the variable sits in both the base and the exponent.",
      },
    ],
  },

  hook: {
    question:
      "Bacteria in a culture double every hour. A radioactive isotope loses half its mass every 5,730 years. A savings account grows at 5% per year compounded continuously. Why do all three follow the same mathematical pattern, and what does calculus tell us is special about them?",
    realWorldContext:
      "Population growth, radioactive decay, cooling and heating, compound interest, the spread of disease, the absorption of drugs in the bloodstream — all of these phenomena share one defining property: the rate of change is proportional to the current value. If you have more money, you earn more interest. If you have more bacteria, more bacteria are multiplying. If you have more radioactive atoms, more are decaying. This proportionality law leads directly to exponential functions, and the magical number e = 2.71828... is the one base for which the function literally equals its own derivative. This lesson explores why that is true and how to differentiate every exponential and logarithmic function.",
    previewVisualizationId: "ExponentialSlopeAtZero",
  },

  intuition: {
    prose: [
      "**Where you are in the story:** You have derivatives for polynomials (power rule), products and quotients, compositions (chain rule), and all six trig functions. There is one more fundamental family to master: exponential and logarithmic functions. These are the functions of growth and decay — they appear everywhere quantities change proportionally to their current size.",

      "**The big question of this lesson:** Is there a base b such that b^x equals its own derivative? If such a base existed, it would mean the function's slope at every point equals its own height — a remarkable self-referential property. This lesson shows that the answer is yes, the base is e ≈ 2.718, and this is not a coincidence but the *defining property* that makes exponential calculus so clean.",

      "Let's understand e by starting from scratch. Consider the function b^x for different bases b. At x = 0, every such function equals 1 (since b\u2070 = 1). But what is the SLOPE of b^x at x = 0? For b = 2, the slope at 0 is approximately 0.693. For b = 3, the slope at 0 is approximately 1.099. As b increases from 2 to 3, the slope at x = 0 increases from 0.693 to 1.099. Somewhere between 2 and 3, the slope at x = 0 must equal exactly 1. That special base is called e. Numerically, e \u2248 2.71828...",
      "This definition — e is the base for which the slope of b^x at x = 0 is exactly 1 — has a stunning consequence. It means that for the function e^x, the derivative at x = 0 is exactly 1. But now we can use the law of exponents to compute the derivative at any other point x. We will see that d/dx[e^x] = e^x: the function e^x equals its own derivative everywhere, not just at x = 0.",
      'Why is this remarkable? It means that at every point, the slope of e^x equals its own height. The taller the curve is, the steeper it rises. The curve catches up to its own slope, then the increased slope makes it grow even faster, creating an accelerating feedback loop. This is why exponential growth "explodes" — it grows proportional to itself.',
      "Now for the natural logarithm. The natural log ln(x) is defined as the inverse of e^x: if e^y = x, then y = ln(x). Since e^x has derivative e^x, and ln(x) is its inverse function, we can find the derivative of ln(x) using implicit differentiation. Starting from e^y = x, differentiate both sides with respect to x: the right side gives 1, and the left side gives e^y \u00b7 dy/dx (by the chain rule, since y is a function of x). So e^y \u00b7 dy/dx = 1, giving dy/dx = 1/e^y = 1/x (since e^y = x). The derivative of ln(x) is 1/x.",
      "For other bases: if we want to differentiate a^x for any positive base a \u2260 1, we use the conversion a^x = e^(x ln a). This rewrites any exponential in base e, allowing us to use the chain rule: d/dx[e^(x ln a)] = e^(x ln a) \u00b7 ln(a) = a^x \u00b7 ln(a). The natural log of the base appears as a multiplicative factor.",
      "Logarithmic differentiation is a powerful technique that uses logarithms to convert hard differentiation problems into easier ones. The key idea: if y = f(x), take ln of both sides to get ln(y) = ln(f(x)), then differentiate implicitly. This works because the chain rule on the left gives (1/y)\u00b7(dy/dx), and we can solve for dy/dx = y\u00b7(d/dx)[ln(f(x))]. This technique is especially useful for (1) functions where the variable appears in both the base and exponent, like y = x^x, and (2) products of many functions, where logarithms convert multiplication into addition.",

      "**Logarithmic differentiation — how to differentiate y = x^x:** Functions like y = x^x are neither a pure power (the exponent is not a constant) nor a pure exponential (the base is not a constant), so neither the power rule nor the standard exponential rule applies directly. The technique is to take the natural log of both sides: ln(y) = ln(x^x) = x·ln(x). Now differentiate both sides with respect to x. The left side gives (1/y)·(dy/dx) by the chain rule (since y is a function of x). The right side gives d/dx[x·ln(x)] = ln(x) + x·(1/x) = ln(x) + 1 by the product rule. Solving: dy/dx = y·(ln(x)+1) = x^x·(ln(x)+1). This technique works for any function where logarithms simplify the structure — it converts hard exponent problems into tractable algebra.",

      "**Chain rule with exponentials — the most important application:** The formula d/dx[e^x] = e^x extends immediately to composites via the chain rule: d/dx[e^(g(x))] = e^(g(x))·g'(x). The outer derivative of e^(·) is just e^(·) unchanged, and then we multiply by g'(x) as the chain rule demands. Example: d/dx[e^(3x²)] — here g(x) = 3x², so g'(x) = 6x. Therefore d/dx[e^(3x²)] = e^(3x²)·6x = 6x·e^(3x²). The same pattern extends to other bases: d/dx[a^(g(x))] = a^(g(x))·ln(a)·g'(x). Forgetting the inner derivative g'(x) is the chain-trap in exponential form.",

      "**The natural logarithm: complete theory from first principles** The natural logarithm, written ln(x) (or sometimes log(x) or log_e(x)), is the logarithm with base e ≈ 2.718281828.... Yes, the property ln(a^b) = b ln a holds exactly for any a > 0 and any real number b. This is one of the core logarithm rules, derived rigorously from first principles below. The same rules apply to any base, but the natural log is special because it arises directly from the most fundamental operation in calculus: integration of 1/x.",

      "**Step 1: What is a logarithm in general?** Start with exponentiation: if b^c = a where b > 0, b ≠ 1, and a > 0, then we define the logarithm as the exponent c: log_b(a) = c means exactly b^c = a. This is the definition. It turns multiplication of powers into addition of exponents: log_b(ab) = log_b a + log_b b (because b^{c+d} = b^c · b^d), log_b(a^d) = d log_b a (because (b^c)^d = b^{c d}), log_b(1) = 0 (because b^0 = 1). These are not assumptions—they follow directly from the definition of exponents. Any base works, but different bases just rescale the numbers (change-of-base formula: log_b a = ln a / ln b for any convenient k).",

      '**Step 2: Why do we need a "natural" base?** Most early logarithms (invented by John Napier in 1614) were created purely for practical calculation: multiplying huge numbers is tedious, but adding is easy. If you have a table of log_10 values, then log_10(a · b) = log_10 a + log_10 b, so you look up two values, add them, and look up the antilog. This revolutionized astronomy and navigation. But mathematicians noticed something deeper when they studied curves whose slope is proportional to their height (exponential growth/decay) and the area under the hyperbola y = 1/x. The logarithm that makes the calculus cleanest has a special base e, and we call it ln(x) = log_e(x).',

      '**Step 3: First-principles definition of ln(x) using the integral** We define the natural logarithm directly as a definite integral. This is not circular—it is the starting point. Definition: For any x > 0, ln x ≜ ∫₁ˣ 1/t dt. Geometrically, ln(x) is exactly the signed area under the curve y = 1/t from t = 1 to t = x. If x > 1, the area is positive → ln x > 0. If 0 < x < 1, the area is negative → ln x < 0. At x = 1, ln 1 = 0. This definition is chosen because the Fundamental Theorem of Calculus immediately gives its derivative for free: d/dx[ln x] = d/dx[∫₁ˣ 1/t dt] = 1/x. No other base gives this simple derivative. That is why it is "natural."',

      "**Step 4: Prove that ln(x) really is a logarithm** We must prove it satisfies the logarithm property ln(xy) = ln x + ln y. This is not obvious from the integral, so we derive it rigorously. Let x > 0, y > 0. Then ln(xy) = ∫₁ˣʸ 1/t dt. Split the integral at t = x: ∫₁ˣʸ 1/t dt = ∫₁ˣ 1/t dt + ∫_xˣʸ 1/t dt. For the second integral, use substitution: let u = t/x, so t = x u, dt = x du. When t = x, u = 1; when t = x y, u = y. Thus ∫_xˣʸ 1/t dt = ∫₁ʸ 1/(x u) · x du = ∫₁ʸ 1/u du = ln y. Therefore ln(xy) = ln x + ln y. All other log properties follow immediately: ln(a^b) = b ln a, ln(1/x) = -ln x, ln(x/y) = ln x - ln y. So yes—by construction, ln is a genuine logarithm.",

      "**Step 5: Where does the number e come from?** e is defined as the unique number such that ln e = 1: ∫₁ᵉ 1/t dt = 1 ⇒ e ≈ 2.718281828.... (We can compute e to any precision by numerically integrating 1/t or using its series below.) The exponential function is the inverse: exp(x) ≜ the number whose natural log is x, so ln(exp(x)) = x and exp(ln x) = x. We prove exp(x) = e^x by showing both satisfy the same differential equation y' = y with y(0) = 1, but that is for later in calculus.",

      '**Step 6: Is ln(x) like a trigonometric ratio?** No—fundamentally different, though they share some similarities. Trig ratios come from geometry (right triangles or unit circle). sin(θ) is the y-coordinate after rotating by θ radians. ln(x) comes from the hyperbola y = 1/x (area), not a circle. It is not periodic; it grows to +∞ (slowly) as x → ∞ and goes to -∞ as x → 0⁺. Both are transcendental (cannot be expressed with finite algebraic operations) and have infinite series, but the series are different. Similarities are superficial: both are defined by integrals/series and appear in many differential equations. But ln is the "hyperbolic" analogue of the circular trig functions (hence "hyperbolic sine/cosine" sinh x = (e^x - e^{-x})/2, which involve ln indirectly).',

      "**Step 7: How does a calculator actually compute ln(x)?** Calculators do not store infinite tables or magically know the integral. They use a finite algorithm based on the Taylor (Maclaurin) series. First, reduce the argument to a convenient range using the property ln(x) = ln(2^k · m) = k ln 2 + ln m, where m is chosen so 1/√2 ≤ m ≤ √2 (very fast with bit shifts in binary floating-point). Then compute ln(1 + z) where |z| < 1 using the infinite series (derived by integrating the geometric series 1/(1+t) = ∑ (-1)^n t^n): ln(1 + z) = z - z²/2 + z³/3 - z⁴/4 + z⁵/5 - ⋯ (|z| < 1). How it works in practice: the CPU/FPU reduces x to ln(1+z). It sums the first 10-20 terms (enough for double-precision ~15 decimal digits). Convergence is fast near z=0; for larger z it uses argument reduction or other accelerations. Hardware often implements a fused multiply-add (FMA) instruction so each term is computed with a single rounding error. For very high precision, libraries use minimax polynomials or table-driven methods, but the core is always this series or an equivalent rational approximation. You can see it yourself: the partial sum s_n = ∑_{k=1}^n (-1)^{k+1} z^k/k gets arbitrarily close to ln(1+z).",

      "**Step 8: Usefulness of ln (why it is everywhere)** Historical computation: Before calculators, ln tables let engineers multiply/divide huge numbers by adding/subtracting logs. Exponential growth/decay: Any quantity whose rate of change is proportional to itself satisfies dy/dt = k y. The solution is y = C e^{k t}. To solve for time or rate, you take ln: t = (1/k) ln(y/C). This models population, radioactive decay, cooling, compound interest, voltage in capacitors, etc. Information theory & probability: Entropy (average surprise) is -∑ p_i ln p_i. Scaling: Many physical laws are multiplicative; logs turn them additive (e.g., decibels = 10 log_10, but natural log appears in continuous versions). Simplifies equations: a^x = b ⇒ x = ln b / ln a.",

      "**Step 9: How to use ln in calculus (core techniques)** Because d/dx[ln x] = 1/x, integration gives the reverse: ∫ 1/x dx = ln |x| + C (x ≠ 0). Derivative rules (chain rule): d/dx[ln u(x)] = u'(x)/u(x), u(x) > 0. Integration by parts or substitution often produces ln: ∫ f'(x)/f(x) dx = ln |f(x)| + C (recognize the derivative in the numerator). Limits (L'Hôpital's rule): When you get 0/0 or ∞/∞, take derivatives of numerator and denominator. Logs appear constantly because lim_{x→∞} ln x / x^p = 0 for any p > 0 (log grows slower than any positive power). Series expansions: ln(1 + x) = ∑_{n=1}^∞ (-1)^{n+1} x^n/n, |x| < 1 (derived exactly as above). At x=1 this gives the famous alternating harmonic series for ln 2. Change of base in calculus: log_b x = ln x / ln b. Example walkthrough: Solve ∫ 2x/(x² + 1) dx. Let u = x² + 1, then du = 2x dx. So the integral is exactly ∫ 1/u du = ln |u| + C = ln(x² + 1) + C. Another example: Find the derivative of f(x) = ln(sin x). f'(x) = 1/sin x · cos x = cot x. That is the complete picture. ln x is not an arbitrary function—it is the unique antiderivative of 1/x (shifted so ln 1 = 0) that satisfies the multiplicative property of logarithms. Once you have this definition, every property, every calculator algorithm, and every calculus application follows mechanically. You now have it from the ground up.",

      "**Where this is heading:** Notice that we derived the derivative of ln(x) by using the fact that it is the inverse of e^x. That same inverse-function reasoning generalizes: the next lesson turns that argument into a theorem that works for any inverse function — and uses it to derive the derivatives of arcsin, arccos, and arctan.",
    ],
    callouts: [
      {
        type: "sequencing",
        title: "Lesson 7 of 10 — Act 3: Exponential and Log",
        body: "**Previous:** Trig derivatives — sin, cos, tan and the unit circle connection.\n**This lesson:** e^x (the unique function that equals its own derivative), ln(x) = 1/x, other bases, and logarithmic differentiation.\n**Next:** Inverse function derivatives — the general rule that relates the slope of f to the slope of f⁻¹, and all inverse trig derivatives.",
      },
      {
        type: "definition",
        title: "e is Defined by This Slope Condition",
        body: "e \\text{ is the unique number such that } \\lim_{h\\to 0}\\frac{e^h-1}{h} = 1",
      },
      {
        type: "theorem",
        title: "The Self-Referential Property",
        body: "\\frac{d}{dx}[e^x] = e^x \\qquad \\text{(the function equals its own derivative)}",
      },
      {
        type: "insight",
        title: "Inverse Function Argument",
        body: "e^y = x \\xrightarrow{\\text{diff. both sides}} e^y \\frac{dy}{dx} = 1 \\implies \\frac{dy}{dx} = \\frac{1}{e^y} = \\frac{1}{x}",
      },
    ],
    visualizationId: "ExponentialSlopeAtZero",
    visualizationProps: {
      showSlopeAtZeroForVariousBases: true,
      highlightBaseE: true,
    },
    visualizations: [
      {
        id: "ExponentialSlopeAtZero",
        title: "Finding e Through the Slope Experiment",
        mathBridge:
          "Start with base b=2. Read the slope at x=0 (approximately 0.693). Move to b=3 (slope ≈ 1.099). The slope at x=0 is ln(b). Find the base where slope=exactly 1. That base is e≈2.718. This experiment DEFINES e — the unique base where the exponential has slope 1 at the origin. Now observe what happens away from x=0: because e^(x+h)=e^x·e^h, the slope at any x is exactly e^x times the slope at 0 — and since the slope at 0 is 1, the slope everywhere equals e^x itself.",
        caption:
          "Drag the base slider and watch the slope at x=0 change. Find the base that makes slope=1 exactly — that is e.",
      },
      {
        id: "ExpLogBridgeLab",
        title: "Exponential/Log Bridge Lab",
        mathBridge:
          '$e^x$ and $\\ln x$ are inverse functions — they undo each other. Their derivatives reflect this inverse relationship: $\\frac{d}{dx}[e^x]=e^x$ (slope equals value, always positive and growing), while $\\frac{d}{dx}[\\ln x]=\\frac{1}{x}$ (slope shrinks as $x$ grows, reflecting how logarithms "flatten" explosive growth). Graphically: the two functions are reflections across $y=x$, and their tangent lines at corresponding points have reciprocal slopes. Before interacting, predict: at x=1 the slope of $\\ln x$ should be 1/1=1. At x=2 it should be 1/2=0.5. At x=10 it should be 0.1. Drag the slider to verify each prediction.',
        caption:
          "Switch between eˣ and ln(x) to connect growth intuition with the derivative formulas.",
      },
      {
        id: "LogExpReciprocalViz",
        title: "Reciprocal Slopes on Inverse Curves",
        mathBridge:
          "At paired points on $e^x$ and $\\ln x$, inverse-function geometry enforces reciprocal tangent slopes. This is the visual reason both formulas are true together: $\\frac{d}{dx}[e^x]=e^x$ and $\\frac{d}{dx}[\\ln x]=1/x$.",
        caption:
          "Move along either curve and compare the mirrored point, tangent lines, and slope product.",
      },
      {
        id: "NewtonCooling",
        title: "Newton's Law of Cooling",
        caption:
          "Witness exponential decay in action. The rate at which the coffee cools is proportional to the difference between its temperature and the room temperature.",
      },
      {
        id: "NewtonCoolingDeep",
        title: "The Mechanics of Decay: Why it Never Reaches",
        caption:
          "Dive deeper into the halving-gap logic and the formal proof that objects never exactly reach equilibrium.",
      },
    ],
  },

  math: {
    prose: [
      "We state all four exponential and logarithmic derivative formulas. Each extends to compositions via the chain rule.",
      "The formula d/dx[a^x] = a^x \u00b7 ln(a) shows why e is so special: when a = e, ln(e) = 1, so the formula gives d/dx[e^x] = e^x \u00b7 1 = e^x. For any other base, there is an extra factor of ln(a).",
      "Similarly, d/dx[log_a(x)] = 1/(x ln a). When a = e, ln(e) = 1 and we recover d/dx[ln x] = 1/x.",
      "Logarithmic differentiation is the technique of applying ln to both sides of y = f(x) before differentiating. It works because (1) logarithms convert products to sums and powers to multiples, making the differentiation easier, and (2) the chain rule on ln(y) gives (1/y)(dy/dx), which we solve for dy/dx at the end.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Four Core Formulas",
        body: "\\begin{aligned} \\frac{d}{dx}[e^x] &= e^x \\\\ \\frac{d}{dx}[\\ln x] &= \\frac{1}{x} \\quad (x > 0) \\\\ \\frac{d}{dx}[a^x] &= a^x \\ln a \\\\ \\frac{d}{dx}[\\log_a x] &= \\frac{1}{x \\ln a} \\end{aligned}",
      },
      {
        type: "theorem",
        title: "All Four with Chain Rule",
        body: "\\begin{aligned} \\frac{d}{dx}[e^u] &= e^u \\cdot u' \\\\ \\frac{d}{dx}[\\ln u] &= \\frac{u'}{u} \\\\ \\frac{d}{dx}[a^u] &= a^u (\\ln a)\\, u' \\\\ \\frac{d}{dx}[\\log_a u] &= \\frac{u'}{u \\ln a} \\end{aligned}",
      },
      {
        type: "technique",
        title: "Logarithmic Differentiation Procedure",
        body: "y = f(x) \\implies \\ln y = \\ln f(x) \\implies \\frac{1}{y}\\frac{dy}{dx} = \\frac{d}{dx}[\\ln f(x)] \\implies \\frac{dy}{dx} = y \\cdot \\frac{d}{dx}[\\ln f(x)]",
      },
    ],
    visualizationId: "ExponentialSlopeAtZero",
    visualizationProps: {
      showBothFunctions: true,
      showSlopeComparison: true,
    },
    visualizations: [
      {
        id: "ExpLogBridgeLab",
        title: "Derivative Formula Bridge Lab",
        mathBridge:
          "The four formulas in one view: $\\frac{d}{dx}[e^x]=e^x$, $\\frac{d}{dx}[\\ln x]=\\frac{1}{x}$, $\\frac{d}{dx}[a^x]=a^x\\ln a$, $\\frac{d}{dx}[\\log_a x]=\\frac{1}{x\\ln a}$. At any $x$-value, the slider shows the function value and its derivative side by side. Notice: for $e^x$ they are always equal; for $\\ln x$ the derivative $\\frac{1}{x}$ is always less than the function value (for $x>1$); for $a^x$ with $a\\neq e$ there is an extra factor of $\\ln a$.",
        caption:
          "Move the slider to see function value and derivative value update together for all four formulas.",
      },
      {
        id: "LogExpReciprocalViz",
        title: "e^x vs ln(x): Inverse-Derivative Reciprocity",
        mathBridge:
          "Because $\\ln x$ is the inverse of $e^x$, derivatives at corresponding reflected points satisfy $f'(a)\\,(f^{-1})'(f(a))=1$. This visualization ties the inverse-function theorem directly to exp/log derivative rules.",
        caption:
          "Use mirrored points to verify the reciprocal slope relationship numerically.",
      },
    ],
  },

  rigor: {
    title: "Geometric Rigor: Slope & Area",
    visualizationId: "ExpLogGeometricProof",
    proofSteps: [
      {
        expression: "f(x) = e^x \\implies f'(x) = e^x",
        annotation:
          "The defining property: at every point, the slope of the tangent equals the height of the curve.",
      },
      {
        expression:
          "\\text{Slope at } 0 = \\lim_{h \\to 0} \\frac{e^h - 1}{h} = 1",
        annotation:
          "This is the geometric definition of e... the base that makes the unit cross at 45 degrees.",
      },
      {
        expression: "e^{x+h} = e^x \\cdot e^h",
        annotation:
          "Algebraic self-similarity: zooming in at any point x looks exactly like zooming in at 0, just scaled by e^x.",
      },
      {
        expression: "\\ln x = \\int_1^x \\frac{1}{t} \\, dt",
        annotation:
          "The accumulation definition: the natural log is the area under the hyperbola 1/t.",
      },
      {
        expression:
          "\\frac{d}{dx} \\left[ \\int_1^x \\frac{1}{t} \\, dt \\right] = \\frac{1}{x}",
        annotation:
          "Fundamental Theorem: the rate at which area accumulates is the height of the boundary... which is 1/x.",
      },
    ],
    prose: [
      'The derivative of e^x is the most "natural" fact in calculus. If we define e as the base such that the slope at x=0 is exactly 1, then the derivative at any other point x is just that slope scaled by the function value itself. Because e^(x+h) = e^x \u00b7 e^h, the difference quotient e^x(e^h-1)/h simply inherits the slope 1 from the origin, multiplied by e^x. Thus, the slope is always equal to the height.',
      "For the logarithm, we can view the derivative geometrically through accumulation. If we define ln(x) as the area under the curve y=1/t from t=1 to t=x, then by the Fundamental Theorem of Calculus, the rate of change of this area as we move the boundary x is simply the height of the curve at that boundary. Since the height is 1/x, the derivative of the area ln(x) must be 1/x.",
    ],
    callouts: [
      {
        type: "proof",
        title: "Proof: d/dx[e^x] = e^x",
        body: "\\frac{d}{dx}[e^x] = \\lim_{h\\to 0}\\frac{e^{x+h}-e^x}{h} = e^x \\lim_{h\\to 0}\\frac{e^h-1}{h} = e^x \\cdot 1 = e^x",
      },
      {
        type: "proof",
        title: "Proof: d/dx[ln x] = 1/x via FTC",
        body: "\\ln x = \\int_1^x \\frac{1}{t}dt \\implies \\frac{d}{dx}[\\ln x] = \\frac{d}{dx}\\int_1^x \\frac{1}{t}dt = \\frac{1}{x}",
      },
    ],

    visualizations: [],
  },

  examples: [
    {
      id: "ch2-004-ex1",
      title: "Exponential with Chain Rule",
      visualizations: [
        {
          id: "ExpLogBridgeLab",
          title: "eˣ and Its Derivative",
          caption:
            "Move the slider: at every x, the slope of eˣ equals its own height. The chain rule multiplies this self-referential slope by the inner derivative (6x here), giving 6x·e^(3x²).",
        },
      ],
      problem: "f(x) = e^{3x^2}. \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "\\text{Outer: } F(u) = e^u, \\quad \\text{Inner: } u = 3x^2",
          annotation:
            "Identify the composition: the outer function is e^u and the inner is 3x\u00b2.",
        },
        {
          expression: "F'(u) = e^u, \\quad u' = 6x",
          annotation:
            "The derivative of e^u is e^u (e^x is its own derivative). The inner derivative of 3x\u00b2 is 6x.",
        },
        {
          expression: "f'(x) = e^{3x^2} \\cdot 6x = 6x\\,e^{3x^2}",
          annotation:
            "Chain rule: e^u evaluated at u=3x\u00b2 gives e^(3x\u00b2), times the inner derivative 6x.",
        },
      ],
      conclusion:
        'f\'(x) = 6x e^(3x\u00b2). The key here is that the chain rule "brings out" the derivative of the exponent as a multiplicative factor, while e^(3x\u00b2) itself remains unchanged.',
    },
    {
      id: "ch2-004-ex2",
      title: "Product Rule with e^x",
      visualizations: [
        {
          id: "ExpLogBridgeLab",
          title: "eˣ in Product Rule",
          caption:
            "The derivative of x²eˣ requires knowing d/dx[eˣ]=eˣ. Here eˣ acts as one factor whose own derivative equals itself — the product rule then combines this with the polynomial factor.",
        },
      ],
      problem: "f(x) = x^2 e^x. \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Let } u = x^2, \\; v = e^x",
          annotation: "Identify the two factors for the product rule.",
        },
        {
          expression: "u' = 2x, \\quad v' = e^x",
          annotation:
            "Differentiate each factor. d/dx[x\u00b2] = 2x, and d/dx[e^x] = e^x (its own derivative).",
        },
        {
          expression: "f'(x) = u'v + uv' = 2x \\cdot e^x + x^2 \\cdot e^x",
          annotation: "Apply the product rule.",
        },
        {
          expression: "= e^x(2x + x^2) = x e^x(2 + x)",
          annotation:
            "Factor out e^x from both terms, then factor out x from the remaining expression.",
        },
      ],
      conclusion:
        "f'(x) = xe^x(x+2). The factored form immediately shows that f'(x) = 0 when x = 0 or x = -2, the critical points of this function.",
    },
    {
      id: "ch2-004-ex3",
      title: "Natural Log with Chain Rule",
      visualizations: [
        {
          id: "ExpLogBridgeLab",
          title: "ln(x) and Its Derivative",
          caption:
            'Switch to ln(x): its slope at any point x is exactly 1/x. The chain rule pattern g′/g for ln(g(x)) is visible here — 2x/(x²+1) is the "rate of change of the inside" divided by the inside value.',
        },
      ],
      problem: "f(x) = \\ln(x^2+1). \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "\\text{Outer: } F(u) = \\ln u, \\quad \\text{Inner: } u = x^2 + 1",
          annotation:
            "Identify the composition. The outer is the natural log; the inner is x\u00b2+1.",
        },
        {
          expression: "F'(u) = \\frac{1}{u}, \\quad u' = 2x",
          annotation:
            "The derivative of ln(u) is 1/u. The inner derivative is 2x.",
        },
        {
          expression: "f'(x) = \\frac{1}{x^2+1} \\cdot 2x = \\frac{2x}{x^2+1}",
          annotation:
            'Chain rule: (1/u) evaluated at u=x\u00b2+1 gives 1/(x\u00b2+1), times the inner derivative 2x. This is the "u-prime over u" pattern.',
        },
      ],
      conclusion:
        "f'(x) = 2x/(x\u00b2+1). The chain rule result for ln(g(x)) is always g'(x)/g(x) — this is sometimes called the \"logarithmic derivative.\"",
    },
    {
      id: "ch2-004-ex4",
      title: "Quotient Rule with e^x",
      visualizations: [
        {
          id: "ExpLogBridgeLab",
          title: "eˣ Growth vs Polynomial Decay",
          caption:
            "eˣ/x³: the exponential eventually dominates. The critical point at x=3 is where eˣ growth (slope = eˣ) exactly balances the x³ decay — setting f′=0 captures this equilibrium.",
        },
      ],
      problem: "f(x) = \\frac{e^x}{x^3}. \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "\\text{Numerator: } N = e^x, \\quad \\text{Denominator: } D = x^3",
          annotation: "Identify numerator and denominator.",
        },
        {
          expression: "N' = e^x, \\quad D' = 3x^2",
          annotation:
            "Differentiate each: d/dx[e^x] = e^x (its own derivative); d/dx[x\u00b3] = 3x\u00b2.",
        },
        {
          expression:
            "f'(x) = \\frac{N'D - ND'}{D^2} = \\frac{e^x \\cdot x^3 - e^x \\cdot 3x^2}{x^6}",
          annotation: "Apply the quotient rule.",
        },
        {
          expression: "= \\frac{e^x(x^3 - 3x^2)}{x^6}",
          annotation: "Factor e^x from the numerator.",
        },
        {
          expression:
            "= \\frac{e^x \\cdot x^2(x-3)}{x^6} = \\frac{e^x(x-3)}{x^4}",
          annotation:
            "Factor x\u00b2 from x\u00b3-3x\u00b2 = x\u00b2(x-3), then cancel x\u00b2/x\u2076 = 1/x\u2074.",
        },
      ],
      conclusion:
        "f'(x) = e^x(x-3)/x\u2074. Setting f'(x) = 0: e^x \u2260 0 always, and x\u2074 \u2260 0 for x \u2260 0, so the only critical point is x = 3.",
    },
    {
      id: "ch2-004-ex5",
      title: "Log of a Trig Function",
      visualizations: [
        {
          id: "ExpLogBridgeLab",
          title: "The Logarithmic Derivative Pattern",
          caption:
            'The chain rule on ln(u) always gives u′/u. Here u=sin(x), so the derivative is cos(x)/sin(x)=cot(x). The lab shows how the log "flattens" its input — its derivative is the relative rate of change.',
        },
      ],
      problem: "f(x) = \\ln(\\sin x). \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "\\text{Outer: } F(u) = \\ln u, \\quad \\text{Inner: } u = \\sin x",
          annotation: "Identify the composition: outer is ln, inner is sin x.",
        },
        {
          expression: "F'(u) = \\frac{1}{u}, \\quad u' = \\cos x",
          annotation:
            "Derivative of ln(u) is 1/u; derivative of sin x is cos x.",
        },
        {
          expression:
            "f'(x) = \\frac{1}{\\sin x} \\cdot \\cos x = \\frac{\\cos x}{\\sin x} = \\cot x",
          annotation: "Apply the chain rule: u'/u = cos x / sin x = cot x.",
        },
      ],
      conclusion:
        "f'(x) = cot(x). This elegant result d/dx[ln(sin x)] = cot x appears frequently in integration problems.",
    },
    {
      id: "ch2-004-ex6",
      title: "Exponential with a Different Base",
      visualizations: [
        {
          id: "ExponentialSlopeAtZero",
          title: "Slope at x=0 for Different Bases",
          caption:
            "Slide the base to 5: the slope of 5^x at x=0 is ln(5)≈1.609, not 1. For base e, ln(e)=1 exactly — this is what makes e special. For 5^(2x), the chain rule multiplies by 2.",
        },
      ],
      problem: "f(x) = 5^{2x}. \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "f(x) = 5^{2x} = (5^2)^x? \\quad \\text{No — use chain rule.}",
          annotation:
            "Do not confuse 5^(2x) with (5\u00b2)^x = 25^x. While equal in value, the chain rule approach is cleaner: treat 5^u with u = 2x.",
        },
        {
          expression:
            "\\text{Outer: } F(u) = 5^u, \\quad \\text{Inner: } u = 2x",
          annotation: "Identify the composition.",
        },
        {
          expression: "F'(u) = 5^u \\ln 5, \\quad u' = 2",
          annotation:
            "Use d/dx[a^u] = a^u \u00b7 ln(a). Here a = 5, so d/du[5^u] = 5^u ln 5. Inner derivative of 2x is 2.",
        },
        {
          expression:
            "f'(x) = 5^{2x} \\cdot \\ln 5 \\cdot 2 = 2(\\ln 5)\\,5^{2x}",
          annotation: "Apply chain rule and collect constants.",
        },
      ],
      conclusion:
        "f'(x) = 2(ln 5) 5^(2x). The factor of ln 5 \u2248 1.609 comes from the base being 5, not e. If the base were e, we would get d/dx[e^(2x)] = 2e^(2x), with no extra logarithm factor.",
    },
    {
      id: "ch2-004-ex7",
      title: "Logarithmic Differentiation: x^x",
      visualizations: [
        {
          id: "ExpLogBridgeLab",
          title: "Logarithms Convert Exponents to Products",
          caption:
            "Taking ln of both sides converts x^x into x·ln(x) — a product the product rule can handle. The lab shows how the log and exponential functions invert each other, which is the algebraic step that makes this trick work.",
        },
      ],
      problem:
        "y = x^x \\text{ for } x > 0. \\text{ Find } \\frac{dy}{dx} \\text{ using logarithmic differentiation.}",
      steps: [
        {
          expression: "y = x^x",
          annotation:
            "This function has x in both the base and the exponent. Neither the power rule (which requires a constant exponent) nor the exponential rule (which requires a constant base) applies directly.",
        },
        {
          expression: "\\ln y = \\ln(x^x) = x \\ln x",
          annotation:
            "Take ln of both sides. Use the logarithm power rule: ln(x^x) = x\u00b7ln x.",
        },
        {
          expression: "\\frac{d}{dx}[\\ln y] = \\frac{d}{dx}[x \\ln x]",
          annotation:
            "Differentiate both sides with respect to x. The left side requires the chain rule since y is a function of x.",
        },
        {
          expression:
            "\\frac{1}{y} \\cdot \\frac{dy}{dx} = \\frac{d}{dx}[x \\ln x]",
          annotation:
            "The left side: d/dx[ln y] = (1/y)\u00b7(dy/dx) by the chain rule (outer is ln, inner is y(x)).",
        },
        {
          expression:
            "\\frac{d}{dx}[x \\ln x] = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1",
          annotation:
            "Differentiate x\u00b7ln x using the product rule: (x)\u2019(ln x) + (x)(ln x)\u2019 = 1\u00b7ln x + x\u00b7(1/x) = ln x + 1.",
        },
        {
          expression: "\\frac{1}{y} \\cdot \\frac{dy}{dx} = \\ln x + 1",
          annotation: "Equate the two results.",
        },
        {
          expression: "\\frac{dy}{dx} = y(\\ln x + 1) = x^x(\\ln x + 1)",
          annotation: "Multiply both sides by y, then substitute back y = x^x.",
        },
      ],
      conclusion:
        "dy/dx = x^x(1 + ln x). At x = e, this is e^e(1 + 1) = 2e^e. At x = 1, dy/dx = 1\u00b7(0 + 1) = 1. Logarithmic differentiation converts the impossible-looking x^x into a manageable calculation.",
    },
    {
      id: "ch2-004-ex8",
      title: "Logarithmic Differentiation: Variable Base and Exponent",
      visualizations: [
        {
          id: "ExpLogBridgeLab",
          title: "ln Converts the Problem",
          caption:
            "ln((x²+1)^(sin x)) = sin(x)·ln(x²+1) by the log power rule. The lab shows this conversion: the log turns a tower of functions into a product — then the product rule and chain rule finish the job.",
        },
      ],
      problem:
        "y = (x^2+1)^{\\sin x}. \\text{ Find } \\frac{dy}{dx} \\text{ using logarithmic differentiation.}",
      steps: [
        {
          expression: "y = (x^2+1)^{\\sin x}",
          annotation:
            "Both the base x\u00b2+1 and the exponent sin x are functions of x. This requires logarithmic differentiation.",
        },
        {
          expression: "\\ln y = \\sin x \\cdot \\ln(x^2+1)",
          annotation:
            "Take ln of both sides. Use ln(a^b) = b\u00b7ln(a) to bring the exponent down.",
        },
        {
          expression:
            "\\frac{1}{y}\\frac{dy}{dx} = \\frac{d}{dx}[\\sin x \\cdot \\ln(x^2+1)]",
          annotation:
            "Differentiate both sides. Left side is (1/y)(dy/dx) by chain rule.",
        },
        {
          expression:
            "\\frac{d}{dx}[\\sin x \\cdot \\ln(x^2+1)] = \\cos x \\cdot \\ln(x^2+1) + \\sin x \\cdot \\frac{2x}{x^2+1}",
          annotation:
            "Apply the product rule to sin(x)\u00b7ln(x\u00b2+1): (sin x)\u2019\u00b7ln(x\u00b2+1) + sin(x)\u00b7(ln(x\u00b2+1))\u2019. Use d/dx[ln(x\u00b2+1)] = 2x/(x\u00b2+1).",
        },
        {
          expression:
            "\\frac{1}{y}\\frac{dy}{dx} = \\cos x\\ln(x^2+1) + \\frac{2x\\sin x}{x^2+1}",
          annotation: "Equate.",
        },
        {
          expression:
            "\\frac{dy}{dx} = y\\left[\\cos x\\ln(x^2+1) + \\frac{2x\\sin x}{x^2+1}\\right]",
          annotation: "Multiply both sides by y.",
        },
        {
          expression:
            "= (x^2+1)^{\\sin x}\\left[\\cos x\\ln(x^2+1) + \\frac{2x\\sin x}{x^2+1}\\right]",
          annotation: "Substitute y = (x\u00b2+1)^(sin x) back in.",
        },
      ],
      conclusion:
        "The derivative is (x\u00b2+1)^(sin x)\u00b7[cos(x)\u00b7ln(x\u00b2+1) + 2x sin(x)/(x\u00b2+1)]. This would have been completely intractable without logarithmic differentiation.",
    },
    {
      id: "ch2-004-ex9",
      title: "Logarithmic Differentiation: Complex Product-Quotient-Power",
      problem:
        "\\text{Find } \\dfrac{dy}{dx} \\text{ for } y = \\dfrac{x\\sqrt{2x+1}}{e^x \\sin^3 x}",
      steps: [
        {
          expression:
            "\\text{Structure: numerator} = x \\cdot (2x+1)^{1/2}, \\quad \\text{denominator} = e^x \\cdot (\\sin x)^3",
          strategyTitle: "Recognize the complexity \u2014 choose your weapon",
          annotation:
            "Direct differentiation would require the quotient rule, then the product rule (twice) in the numerator, plus chain rules throughout. That is four nested rule applications. Logarithmic differentiation is the clean escape: take ln of both sides and use log laws to convert multiplication \u2192 addition, division \u2192 subtraction, and powers \u2192 coefficients. Then differentiate the simple sum term by term.",
          checkpoint:
            "Why is this problem a candidate for logarithmic differentiation rather than the quotient rule directly?",
          hints: [
            "Level 1: Count how many differentiation rules direct differentiation would require. If it is more than 2, log diff is usually cleaner.",
            "Level 2: The three log laws are: ln(ab) = ln a + ln b, ln(a/b) = ln a \u2212 ln b, ln(a\u207f) = n ln a. Each one converts a hard operation (multiply, divide, power) into an easy one (add, subtract, coefficient).",
            "Level 3: This technique applies whenever y is a product/quotient of functions, some of which may be raised to powers. The prerequisite is implicit differentiation of ln y: d/dx[ln y] = (1/y)(dy/dx).",
          ],
        },
        {
          expression:
            "\\ln y = \\ln\\!\\left(\\frac{x\\sqrt{2x+1}}{e^x\\sin^3 x}\\right)",
          strategyTitle: "Step 1 \u2014 Take ln of both sides",
          annotation:
            "Apply the natural log to both sides. This is legal because ln is a valid function \u2014 applying the same operation to both sides preserves equality. The left side becomes ln y (we will differentiate this implicitly in Step 4). The right side is now ready for log expansion.",
          checkpoint:
            "What does taking ln of both sides accomplish? Why does this help?",
          hints: [
            "Level 1: Taking ln of both sides creates an equation that is equivalent to the original but much easier to differentiate.",
            "Level 2: We don't change the equation \u2014 we apply the same function (ln) to both sides. Since ln is strictly increasing, ln y = ln(rhs) \u27fa y = rhs.",
            "Level 3: The left side ln y will be differentiated using the chain rule: d/dx[ln y] = (1/y)(dy/dx). This implicit differentiation step unlocks solving for dy/dx at the end.",
          ],
        },
        {
          expression: "\\ln y = \\ln(x\\sqrt{2x+1}) - \\ln(e^x\\sin^3 x)",
          strategyTitle:
            "Step 2 \u2014 Log law for quotients: ln(a/b) = ln a \u2212 ln b",
          annotation:
            "Split the fraction into two logs using the quotient log law. The numerator group (x\u00b7\u221a(2x+1)) becomes one log, the denominator group (e\u02e3\u00b7sin\u00b3x) becomes another, subtracted. This is the first simplification \u2014 division becomes subtraction.",
          checkpoint:
            "Which log law justifies this step? What is a and what is b?",
          hints: [
            "Level 1: Log law: ln(a/b) = ln a \u2212 ln b. Here a = x\u221a(2x+1) and b = e^x sin\u00b3x.",
            "Level 2: The fraction bar in the original function maps to a minus sign after taking ln. This is the key simplification.",
            "Level 3: After this step, you have ln y = (log of numerator) \u2212 (log of denominator). Each group will be further expanded in the next two steps.",
          ],
        },
        {
          expression: "\\ln(x\\sqrt{2x+1}) = \\ln x + \\tfrac{1}{2}\\ln(2x+1)",
          strategyTitle:
            "Step 3a \u2014 Expand numerator using product and power log laws",
          annotation:
            "Two sub-steps: First, ln(a\u00b7b) = ln a + ln b separates x from \u221a(2x+1). Second, ln((2x+1)^{1/2}) = (1/2)ln(2x+1) by the power log law. Multiplication becomes addition; the square root exponent (1/2) comes down as a coefficient. Algebra is now linear \u2014 no products, no roots.",
          checkpoint:
            "Which two log laws are used in this step? Identify them by name.",
          hints: [
            "Level 1: Product law: ln(ab) = ln a + ln b. Power law: ln(a\u207f) = n\u00b7ln a. Apply both.",
            "Level 2: First: ln(x \u00b7 \u221a(2x+1)) = ln x + ln(\u221a(2x+1)). Then: ln(\u221a(2x+1)) = ln((2x+1)^{1/2}) = (1/2)ln(2x+1).",
            "Level 3: The power law is the key algebraic trick \u2014 it converts a square root (an exponent of 1/2) into a multiplicative coefficient. Now (2x+1) appears inside a simple ln, easy to differentiate with chain rule in Step 4.",
          ],
        },
        {
          expression: "\\ln(e^x\\sin^3 x) = x + 3\\ln(\\sin x)",
          strategyTitle:
            "Step 3b \u2014 Expand denominator: ln(e\u02e3) = x and power law",
          annotation:
            "Product law: ln(e\u02e3 \u00b7 sin\u00b3x) = ln(e\u02e3) + ln(sin\u00b3x). Then ln(e\u02e3) = x\u00b7ln(e) = x\u00b71 = x (since ln e = 1 exactly \u2014 this is why e is the natural base). And ln(sin\u00b3x) = 3\u00b7ln(sin x) by the power law. The exponential collapses beautifully to just x.",
          checkpoint:
            "Why does ln(e\u02e3) simplify to just x? What property of e is being used?",
          hints: [
            "Level 1: ln(e\u02e3) = x\u00b7ln(e) by the power law. And ln(e) = 1 by definition (since e\u00b9 = e). So ln(e\u02e3) = x.",
            "Level 2: This is the inverse function identity: ln and e are inverses. ln(e\u02e3) = x for all x, just as e^(ln x) = x for x > 0.",
            "Level 3: The reason we choose base e for logarithmic differentiation (and not base 10) is exactly this: ln(e\u02e3) = x collapses cleanly. With log\u2081\u2080, you would get x\u00b7log\u2081\u2080(e) \u2248 0.434x \u2014 messier.",
          ],
        },
        {
          expression:
            "\\ln y = \\ln x + \\tfrac{1}{2}\\ln(2x+1) - x - 3\\ln(\\sin x)",
          strategyTitle: "Step 3c \u2014 Combine all terms into a simple sum",
          annotation:
            "Substitute the expanded forms of the numerator and denominator logs. The final expression is a sum of four terms, all of the form: constant \u00d7 ln(simple function) or just a polynomial. No products, no quotients, no nested functions. Differentiation is now term-by-term \u2014 the hard part is done.",
          checkpoint:
            "Before differentiating: what is the derivative of each of the four terms at a high level?",
          hints: [
            "Level 1: Term 1: ln x \u2192 1/x. Term 2: (1/2)ln(2x+1) \u2192 chain rule gives (1/2)\u00b71/(2x+1)\u00b72. Term 3: \u2212x \u2192 \u22121. Term 4: \u22123ln(sin x) \u2192 chain rule gives \u22123\u00b7cos(x)/sin(x).",
            "Level 2: Every term is either: a constant times ln(function) \u2192 use chain rule, or a polynomial \u2192 use power rule.",
            "Level 3: The sum structure is the whole point of log diff \u2014 you turned a product/quotient/power into a sum. Sums differentiate term-by-term, with no interaction between terms. Compare to the original function where the product and quotient rules would cause every term to interact.",
          ],
        },
        {
          expression:
            "\\frac{d}{dx}[\\ln y] = \\frac{1}{y}\\frac{dy}{dx} \\quad (\\text{chain rule on left side})",
          strategyTitle:
            "Step 4a \u2014 Differentiate the left side implicitly",
          annotation:
            "The left side is ln(y(x)) \u2014 a composition. The outer function is ln(u), whose derivative is 1/u. The inner function is y(x). By the chain rule: d/dx[ln(y)] = (1/y)\u00b7(dy/dx). This is implicit differentiation in disguise \u2014 y is a function of x, so its derivative carries the dy/dx factor.",
          checkpoint:
            "Why does d/dx[ln y] give (1/y)(dy/dx) and not just 1/y? Which rule produces the dy/dx?",
          hints: [
            "Level 1: Chain rule: d/dx[F(g(x))] = F'(g(x))\u00b7g'(x). Here F(u) = ln(u), g(x) = y(x). So d/dx[ln y] = (1/y)\u00b7(dy/dx).",
            "Level 2: This is the implicit differentiation step you practiced in the implicit differentiation lesson. y is a function of x, so when you differentiate ln y with respect to x, the chain rule forces a dy/dx factor.",
            "Level 3: The entire log-differentiation technique works because this step produces (1/y)(dy/dx) on the left \u2014 and you will solve for dy/dx by multiplying both sides by y at the end.",
          ],
        },
        {
          expression:
            "\\frac{d}{dx}[\\ln x] = \\frac{1}{x}, \\quad \\frac{d}{dx}\\!\\left[\\tfrac{1}{2}\\ln(2x+1)\\right] = \\frac{1}{2x+1}",
          strategyTitle:
            "Step 4b \u2014 Differentiate terms 1 and 2 (chain rule each)",
          annotation:
            "Term 1: d/dx[ln x] = 1/x (basic formula). Term 2: d/dx[(1/2)ln(2x+1)] \u2014 use chain rule with outer ln and inner (2x+1): gives (1/2)\u00b7(1/(2x+1))\u00b72 = 1/(2x+1). The 2 from the inner derivative cancels the 1/2 coefficient. These two terms connect back to Chapter 2: d/dx[ln(u)] = u'/u.",
          checkpoint:
            "For term 2, what is the outer function and what is the inner function? What is u'?",
          hints: [
            "Level 1: Chain rule on ln(2x+1): outer F(u) = ln u, inner u = 2x+1. F'(u) = 1/u, u' = 2. Result: (1/u)\u00b7u' = 2/(2x+1). Then multiply by the coefficient 1/2: (1/2)\u00b72/(2x+1) = 1/(2x+1).",
            "Level 2: The u'/u pattern: whenever you differentiate ln(something), you get (derivative of something)/(something). Here something = 2x+1, its derivative is 2, so the result is 2/(2x+1). Times the outer coefficient 1/2 gives 1/(2x+1).",
            "Level 3: The 2 from the inner derivative exactly cancels the 1/2 from the power law \u2014 this is not a coincidence. The chain rule and power law are designed to interact this way. The (1/2) came from converting \u221a(2x+1) to (2x+1)^{1/2}, and the 2 comes from d/dx[2x+1] = 2.",
          ],
        },
        {
          expression:
            "\\frac{d}{dx}[-x] = -1, \\quad \\frac{d}{dx}[-3\\ln(\\sin x)] = -3\\cot x",
          strategyTitle: "Step 4c \u2014 Differentiate terms 3 and 4",
          annotation:
            "Term 3: d/dx[\u2212x] = \u22121. Trivial. Term 4: d/dx[\u22123\u00b7ln(sin x)] \u2014 chain rule with outer ln, inner sin x. Gives \u22123\u00b7(cos x / sin x) = \u22123\u00b7cot x. Recognize cos x / sin x = cot x \u2014 this is why knowing your trig identities speeds up calculus. The negative sign stays through.",
          checkpoint:
            "What is cos(x)/sin(x) in terms of a standard trig function?",
          hints: [
            "Level 1: Chain rule on ln(sin x): outer = ln(u), inner = sin(x). d/dx[ln(sin x)] = (1/sin x)\u00b7cos x = cos x/sin x = cot x.",
            "Level 2: The six trig functions and their ratios: cot x = cos x / sin x. This identity lets you write the derivative compactly as \u22123 cot x instead of \u22123 cos x / sin x.",
            "Level 3: Connect to trig derivatives lesson: d/dx[ln(sin x)] = cot x appears frequently in integration as well. \u222bcot x dx = ln|sin x| + C is the reverse of this step.",
          ],
        },
        {
          expression:
            "\\frac{1}{y}\\frac{dy}{dx} = \\frac{1}{x} + \\frac{1}{2x+1} - 1 - 3\\cot x",
          strategyTitle: "Step 5 \u2014 Assemble the full derivative equation",
          annotation:
            "Combine all the term-by-term derivatives from Steps 4a\u20134c. The left side is (1/y)(dy/dx). The right side is the sum of four derivative terms. This equation is linear in dy/dx \u2014 you need only one algebraic step to solve for it: multiply both sides by y.",
          checkpoint:
            "Count the four terms on the right. Verify each came from one of the four terms in Step 3c.",
          hints: [
            "Level 1: Left: (1/y)(dy/dx). Right: sum of all four term derivatives from Steps 4b and 4c.",
            "Level 2: Match each right-side term to its source: 1/x from ln x, 1/(2x+1) from (1/2)ln(2x+1), \u22121 from \u2212x, \u22123cot x from \u22123ln(sin x).",
            "Level 3: This step is where the payoff of log diff shows: you have four independent derivative computations, each simple, assembled as a sum. In the direct approach, these same four computations would have been entangled through product and quotient rule interactions.",
          ],
        },
        {
          expression:
            "\\frac{dy}{dx} = y\\!\\left(\\frac{1}{x} + \\frac{1}{2x+1} - 1 - 3\\cot x\\right)",
          strategyTitle:
            "Step 6 \u2014 Solve for dy/dx: multiply both sides by y",
          annotation:
            "Multiply both sides by y. Since (1/y)(dy/dx) \u00d7 y = dy/dx, the left side simplifies to dy/dx. The right side becomes y times the four-term bracket. This is now the derivative in terms of y \u2014 but y is just the original function, which we know explicitly.",
          checkpoint:
            "After multiplying by y, what does the left side simplify to? Why?",
          hints: [
            "Level 1: (1/y)(dy/dx) times y = dy/dx. The y cancels on the left, giving you dy/dx isolated.",
            "Level 2: This is the moment the implicit differentiation from Step 4a pays off. Because we got (1/y)(dy/dx) on the left, multiplying by y instantly isolates dy/dx with no further rearrangement needed.",
            "Level 3: Compare to implicit differentiation of a circle: 2x + 2y(dy/dx) = 0 \u2192 dy/dx = \u2212x/y. Same pattern \u2014 isolate dy/dx by algebraic manipulation after differentiating implicitly.",
          ],
        },
        {
          expression:
            "\\frac{dy}{dx} = \\frac{x\\sqrt{2x+1}}{e^x\\sin^3 x}\\!\\left(\\frac{1}{x} + \\frac{1}{2x+1} - 1 - 3\\cot x\\right)",
          strategyTitle: "Step 7 \u2014 Substitute back y: final answer",
          annotation:
            "Replace y with its original definition: y = x\u221a(2x+1)/(e\u02e3 sin\u00b3x). The derivative is the original function times a bracket of four simpler terms. This form is actually useful \u2014 each bracket term reveals something about the function's behavior. For example, the \u22121 term comes from e\u02e3 in the denominator; \u22123cot x comes from sin\u00b3x.",
          checkpoint:
            "What is the structural interpretation of the bracket? Each term in the bracket corresponds to which factor of the original y?",
          hints: [
            "Level 1: The four bracket terms (1/x), (1/(2x+1)), \u22121, \u22123cot x correspond to the four factors x, (2x+1)^{1/2}, e^x, and sin\u00b3x respectively.",
            "Level 2: The general pattern for logarithmic differentiation of y = (product of factors): dy/dx = y \u00d7 \u03a3(derivative of ln of each factor). For a factor f raised to power n: its contribution is n\u00b7f'(x)/f(x).",
            "Level 3: For the original function y = x^a \u00b7 f(x)^b / (g(x)^c \u00b7 h(x)^d), log diff always gives dy/dx = y \u00b7 [a/x + b\u00b7f'(x)/f(x) \u2212 c\u00b7g'(x)/g(x) \u2212 d\u00b7h'(x)/h(x)]. Each factor contributes an independent \"logarithmic derivative\" term.",
          ],
        },
      ],
      conclusion:
        "Final answer: dy/dx = [x\u221a(2x+1) / (e\u02e3 sin\u00b3x)] \u00b7 (1/x + 1/(2x+1) \u2212 1 \u2212 3cot x). STRUCTURAL INSIGHT: Logarithmic differentiation works by exploiting three log laws (ln(ab) = ln a + ln b; ln(a/b) = ln a \u2212 ln b; ln(a\u207f) = n ln a) to convert a product/quotient/power structure into a sum. Sums differentiate term-by-term with no interaction between terms \u2014 no product rule entanglement, no quotient rule cascade. MENTAL MODEL: Instead of 'differentiate a complicated product-quotient,' think: take log \u2192 expand into sum \u2192 differentiate linearly \u2192 multiply back by y. The original function reappears as a prefactor, and the bracket is the sum of logarithmic derivatives of each factor.",
    },
    {
      id: "ch2-004-ex10",
      title: "The Natural Logarithm: Complete Theory from First Principles",
      problem:
        "\\text{What is } \\ln x\\text{? Why does } \\ln(a^b) = b \\ln a\\text{? How does a calculator compute it?}",
      steps: [
        {
          expression:
            "\\text{Logarithm definition: if } b^c = a \\text{, then } \\log_b(a) = c",
          annotation:
            "The fundamental definition: logarithm is the exponent. This turns multiplication into addition: \\log_b(ab) = \\log_b a + \\log_b b.",
          strategyTitle: "Step 1: What is a logarithm in general?",
        },
        {
          expression:
            "\\text{Why natural base? Calculus makes } e \\text{ special: } \\frac{d}{dx} \\ln x = \\frac{1}{x}",
          annotation:
            "Other bases work for computation, but \\ln x (base e) has the simplest derivative, making calculus clean.",
          strategyTitle: 'Step 2: Why do we need a "natural" base?',
        },
        {
          expression:
            "\\ln x \\stackrel{\\text{def}}{=} \\int_1^x \\frac{1}{t} \\, dt \\quad (x > 0)",
          annotation:
            "\\ln x is defined as the signed area under y = 1/t from 1 to x. This gives \\frac{d}{dx} \\ln x = 1/x for free.",
          strategyTitle:
            "Step 3: First-principles definition using the integral",
        },
        {
          expression:
            "\\ln(xy) = \\int_1^{xy} \\frac{1}{t} \\, dt = \\int_1^x \\frac{1}{t} \\, dt + \\int_x^{xy} \\frac{1}{t} \\, dt",
          annotation:
            "Split the integral at t = x, then substitute u = t/x in the second integral.",
          strategyTitle: "Step 4: Prove ln(xy) = ln x + ln y",
        },
        {
          expression:
            "\\int_x^{xy} \\frac{1}{t} \\, dt = \\int_1^y \\frac{1}{x u} \\cdot x \\, du = \\int_1^y \\frac{1}{u} \\, du = \\ln y",
          annotation:
            "Substitution u = t/x gives the second integral as \\ln y.",
          strategyTitle: "Step 5: Complete the proof",
        },
        {
          expression:
            "e \\text{ is defined by } \\ln e = 1: \\int_1^e \\frac{1}{t} \\, dt = 1 \\implies e \\approx 2.71828",
          annotation: "e is the unique number whose natural log is 1.",
          strategyTitle: "Step 6: Where does e come from?",
        },
        {
          expression:
            "\\ln(1 + z) = z - \\frac{z^2}{2} + \\frac{z^3}{3} - \\frac{z^4}{4} + \\cdots \\quad (|z| < 1)",
          annotation:
            "Series from integrating the geometric series. Calculators use this for computation.",
          strategyTitle: "Step 7: How calculators compute ln x",
        },
        {
          expression:
            "\\int \\frac{1}{x} \\, dx = \\ln |x| + C, \\quad \\frac{d}{dx} \\ln u = \\frac{1}{u} \\cdot u'",
          annotation: "The fundamental antiderivative and derivative rules.",
          strategyTitle: "Step 8: Core calculus techniques",
        },
        {
          expression:
            "\\text{Example: } \\int \\frac{2x}{x^2 + 1} \\, dx = \\ln(x^2 + 1) + C",
          annotation: "Recognize the derivative in the numerator.",
          strategyTitle: "Step 9: Integration by substitution",
        },
        {
          expression: "\\frac{d}{dx} \\ln(\\sin x) = \\cot x",
          annotation: "Chain rule application.",
          strategyTitle: "Step 10: Derivative example",
        },
      ],
      conclusion:
        "\\ln x is the unique antiderivative of 1/x, defined as the integral from 1 to x of 1/t dt. This definition gives the multiplicative property \\ln(xy) = \\ln x + \\ln y, the special base e where \\ln e = 1, and the simple derivative d/dx[\\ln x] = 1/x. Calculators compute it using the Taylor series of \\ln(1+z). This foundation makes exponential and logarithmic functions the cornerstone of calculus.",
    },
  ],

  challenges: [
    {
      id: "ch2-004-ch1",
      difficulty: "easy",
      problem: "\\text{Differentiate } f(x) = e^{2x} \\ln(3x).",
      hint: "This is a product of two functions: e^(2x) and ln(3x). Apply the product rule. Use the chain rule on each factor.",
      walkthrough: [
        {
          expression: "\\text{Let } u = e^{2x}, \\; v = \\ln(3x)",
          annotation: "Identify the two factors.",
        },
        {
          expression: "u' = e^{2x} \\cdot 2 = 2e^{2x}",
          annotation:
            "Chain rule on e^(2x): outer is e^u, inner is 2x with derivative 2.",
        },
        {
          expression: "v' = \\frac{1}{3x} \\cdot 3 = \\frac{1}{x}",
          annotation:
            "Chain rule on ln(3x): outer is ln u with derivative 1/u, inner is 3x with derivative 3. So (1/(3x))\u00b73 = 1/x.",
        },
        {
          expression:
            "f'(x) = u'v + uv' = 2e^{2x}\\ln(3x) + e^{2x} \\cdot \\frac{1}{x}",
          annotation: "Apply product rule.",
        },
        {
          expression: "= e^{2x}\\left(2\\ln(3x) + \\frac{1}{x}\\right)",
          annotation: "Factor e^(2x) from both terms.",
        },
      ],
      answer: "f'(x) = e^{2x}\\!\\left(2\\ln(3x) + \\dfrac{1}{x}\\right)",
    },
    {
      id: "ch2-004-ch2",
      difficulty: "medium",
      problem: "\\text{Find all critical points of } f(x) = x\\,e^{-x}.",
      hint: "Differentiate using the product rule. Set f'(x) = 0. Note that e^(-x) > 0 for all real x, so you only need to find where the other factor is 0.",
      walkthrough: [
        {
          expression: "f(x) = x \\cdot e^{-x}",
          annotation: "Product of x and e^(-x).",
        },
        {
          expression: "f'(x) = 1 \\cdot e^{-x} + x \\cdot (-e^{-x})",
          annotation:
            "Product rule: (x)\u2019\u00b7e^(-x) + x\u00b7(e^(-x))\u2019. The derivative of e^(-x) is e^(-x)\u00b7(-1) = -e^(-x) by the chain rule.",
        },
        {
          expression: "= e^{-x} - xe^{-x} = e^{-x}(1-x)",
          annotation: "Factor out e^(-x) from both terms.",
        },
        {
          expression: "f'(x) = 0 \\implies e^{-x}(1-x) = 0",
          annotation: "Set f'(x) = 0.",
        },
        {
          expression:
            "e^{-x} > 0 \\text{ for all } x \\implies 1-x = 0 \\implies x = 1",
          annotation:
            "Since e^(-x) is always positive, only the factor (1-x) can be zero. So x = 1 is the only critical point.",
        },
        {
          expression: "f(1) = 1 \\cdot e^{-1} = \\frac{1}{e}",
          annotation:
            "The critical point is at (1, 1/e). Since f'(x) > 0 for x < 1 and f'(x) < 0 for x > 1, this is a global maximum.",
        },
      ],
      answer:
        "\\text{One critical point: } x = 1, \\text{ giving a maximum value of } f(1) = 1/e.",
    },
    {
      id: "ch2-004-ch3",
      difficulty: "hard",
      problem:
        "\\text{Use logarithmic differentiation to find } \\frac{d}{dx}\\left[\\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}\\right].",
      hint: "Take ln of both sides. Use ln rules to convert the product and quotient into sums and differences. Then differentiate term by term, each term being a constant times ln of something.",
      walkthrough: [
        {
          expression: "y = \\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}",
          annotation:
            "Set y equal to the expression. This has products and powers — perfect for logarithmic differentiation.",
        },
        {
          expression: "\\ln y = 2\\ln(x+1) + 3\\ln(x^2+1) - 4\\ln(x-1)",
          annotation:
            "Take ln of both sides. Use ln(AB) = ln A + ln B, ln(A/B) = ln A - ln B, and ln(A^n) = n ln A to expand.",
        },
        {
          expression:
            "\\frac{1}{y}\\frac{dy}{dx} = \\frac{d}{dx}\\left[2\\ln(x+1) + 3\\ln(x^2+1) - 4\\ln(x-1)\\right]",
          annotation: "Differentiate both sides.",
        },
        {
          expression:
            "\\frac{d}{dx}[2\\ln(x+1)] = 2 \\cdot \\frac{1}{x+1} = \\frac{2}{x+1}",
          annotation:
            "Differentiate first term: chain rule gives 2\u00b7(1/(x+1))\u00b71 = 2/(x+1).",
        },
        {
          expression:
            "\\frac{d}{dx}[3\\ln(x^2+1)] = 3 \\cdot \\frac{2x}{x^2+1} = \\frac{6x}{x^2+1}",
          annotation:
            "Differentiate second term: 3\u00b7(1/(x\u00b2+1))\u00b72x = 6x/(x\u00b2+1).",
        },
        {
          expression:
            "\\frac{d}{dx}[-4\\ln(x-1)] = -4 \\cdot \\frac{1}{x-1} = \\frac{-4}{x-1}",
          annotation:
            "Differentiate third term: -4\u00b7(1/(x-1))\u00b71 = -4/(x-1).",
        },
        {
          expression:
            "\\frac{1}{y}\\frac{dy}{dx} = \\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}",
          annotation: "Combine all three results.",
        },
        {
          expression:
            "\\frac{dy}{dx} = y \\left[\\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}\\right]",
          annotation: "Multiply both sides by y.",
        },
        {
          expression:
            "= \\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}\\left[\\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}\\right]",
          annotation: "Substitute y back in.",
        },
      ],
      answer:
        "\\frac{dy}{dx} = \\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}\\!\\left[\\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}\\right]",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "chain-rule",
      label: "The Chain Rule",
      context:
        "The chain rule is used constantly with exponential and logarithmic functions: d/dx[e^(g(x))] = e^(g(x))g'(x).",
    },
    {
      lessonSlug: "implicit-differentiation",
      label: "Implicit Differentiation",
      context:
        "Logarithmic differentiation is a special case of implicit differentiation applied to ln(y).",
    },
    {
      lessonSlug: "tangent-problem",
      label: "Limit Definition",
      context:
        "The proof of d/dx[e^x] = e^x uses the fundamental limit (e^h-1)/h \u2192 1.",
    },
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "read-rigor",
    "completed-example-1",
    "completed-example-2",
    "completed-example-3",
    "completed-example-4",
    "completed-example-5",
    "completed-example-6",
    "completed-example-7",
    "completed-example-8",
    "attempted-challenge-easy",
    "attempted-challenge-medium",
    "attempted-challenge-hard",
  ],

  quiz: [
    {
      id: "exp-log-q1",
      type: "choice",
      text: "What is $\\dfrac{d}{dx}[e^x]$?",
      options: [
        "$x \\cdot e^{x-1}$",
        "$e^x \\cdot \\ln(e)$",
        "$e^x$",
        "$1/e^x$",
      ],
      answer: "$e^x$",
      hints: ["$e^x$ is its own derivative — the defining property of $e$."],
      reviewSection: "Intuition tab — why $e^x$ is its own derivative",
    },
    {
      id: "exp-log-q2",
      type: "input",
      text: "Find $\\dfrac{d}{dx}[e^{3x}]$ using the chain rule.",
      answer: "3*e^(3*x)",
      hints: [
        "Outside: $e^u$; inside: $3x$. Multiply by the inner derivative 3.",
      ],
      reviewSection: "Math tab — chain rule with exponentials",
    },
    {
      id: "exp-log-q3",
      type: "input",
      text: "Find $\\dfrac{d}{dx}[e^{x^2}]$ using the chain rule.",
      answer: "2*x*e^(x^2)",
      hints: ["Inside: $x^2$. Derivative: $e^{x^2} \\cdot 2x$."],
      reviewSection: "Math tab — chain rule with exponentials",
    },
    {
      id: "exp-log-q4",
      type: "input",
      text: "Find $\\dfrac{d}{dx}[\\ln(x)]$.",
      answer: "1/x",
      hints: [
        "This is the standard result: $\\dfrac{d}{dx}[\\ln x] = \\dfrac{1}{x}$ for $x > 0$.",
      ],
      reviewSection: "Math tab — derivative of natural log",
    },
    {
      id: "exp-log-q5",
      type: "input",
      text: "Find $\\dfrac{d}{dx}[\\ln(x^2 + 1)]$ using the chain rule.",
      answer: "2*x / (x^2+1)",
      hints: [
        "Outside: $\\ln(u)$; inside: $x^2+1$. Derivative: $\\dfrac{1}{x^2+1} \\cdot 2x$.",
      ],
      reviewSection: "Math tab — chain rule with ln",
    },
    {
      id: "exp-log-q6",
      type: "input",
      text: "Find $\\dfrac{d}{dx}[2^x]$.",
      answer: "2^x * log(2)",
      hints: [
        "General exponential rule: $\\dfrac{d}{dx}[a^x] = a^x \\ln(a)$. Here $a = 2$.",
      ],
      reviewSection: "Math tab — derivative of general exponential $a^x$",
    },
    {
      id: "exp-log-q7",
      type: "input",
      text: "Differentiate $f(x) = x^2 e^x$ using the product rule.",
      answer: "2*x*e^x + x^2*e^x",
      hints: ["Product rule: $(x^2)'e^x + x^2(e^x)'= 2xe^x + x^2e^x$."],
      reviewSection: "Math tab — product rule with exponentials",
    },
    {
      id: "exp-log-q8",
      type: "input",
      text: "Find $\\dfrac{d}{dx}[\\ln(\\sin(x))]$ using the chain rule.",
      answer: "cos(x)/sin(x)",
      hints: [
        "Outside: $\\ln(u)$; inside: $\\sin(x)$. Derivative: $\\dfrac{1}{\\sin x} \\cdot \\cos x = \\cot x$.",
      ],
      reviewSection: "Math tab — chain rule combining ln and trig",
    },
    {
      id: "exp-log-q9",
      type: "choice",
      text: "What is $\\dfrac{d}{dx}[\\log_a(x)]$ for a base $a > 0, a \\neq 1$?",
      options: [
        "$a^x$",
        "$\\dfrac{1}{x}$",
        "$\\dfrac{1}{x \\ln(a)}$",
        "$\\dfrac{\\ln(a)}{x}$",
      ],
      answer: "$\\dfrac{1}{x \\ln(a)}$",
      hints: [
        "Use the change-of-base identity $\\log_a(x) = \\ln(x)/\\ln(a)$, then differentiate.",
      ],
      reviewSection: "Math tab — derivative of $\\log_a(x)$",
    },
    {
      id: "exp-log-q10",
      type: "input",
      text: "Find $\\dfrac{d}{dx}[e^{\\sin(x)}]$ using the chain rule.",
      answer: "e^(sin(x)) * cos(x)",
      hints: [
        "Outside: $e^u$; inside: $\\sin(x)$. Derivative: $e^{\\sin x} \\cdot \\cos x$.",
      ],
      reviewSection:
        "Math tab — chain rule with exponential and trig composition",
    },
  ],
};
