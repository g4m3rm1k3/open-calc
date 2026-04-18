// FILE: src/content/chapter-4/03b-mvt-integrals.js
export default {
  id: "ch4-003b",
  slug: "mvt-integrals",
  chapter: 4,
  order: 3.5,
  title: "Mean Value Theorem for Integrals",
  subtitle:
    "Every continuous function hits its average — and the proof is just FTC plus the derivative MVT",
  tags: [
    "mean value theorem for integrals",
    "average value",
    "definite integral",
    "continuity",
    "FTC",
    "EVT",
    "IVT",
    "integral applications",
  ],

  hook: {
    question:
      "If temperature over a 12-hour period traces a smooth curve T(t), is there necessarily some exact moment when the temperature equals the daily average? Make a guess. What property of T would guarantee it? What if T had a sudden jump at noon — would the guarantee still hold?",
    realWorldContext:
      "Engineers, meteorologists, and physicists routinely need the average value of a continuously varying quantity: average power output of a turbine over a cycle, average drug concentration in the bloodstream over a dosing interval, average voltage of an AC signal. The Mean Value Theorem for Integrals guarantees this average is always achieved at some actual moment — not just as a mathematical abstraction but as a value the function genuinely attains. It also forms the logical bridge between FTC Part 1 and the concept of instantaneous rate equaling accumulated change. The theorem seems obvious, but it requires a careful assembly of the Extreme Value Theorem, the Intermediate Value Theorem, and the definition of the definite integral to make it rigorous.",
    previewVisualizationId: "MVTIntegralExplorer",
  },

  intuition: {
    prose: [
      "**The Equal-Area Rectangle:** When you integrate f over [a, b] you get a number A. Divide by (b − a) and you get the average value f_avg = A/(b − a). Geometrically, f_avg is the height of a rectangle with base (b − a) whose area equals the area under f. Draw it: if the curve dips below f_avg in some places and rises above it in others, the rectangle captures the same total signed area. The MVT for Integrals says the horizontal line at height f_avg must cross the curve at least once on (a, b) — the function actually attains its own average.",
      "**Why It Has to Work:** Because f is continuous on [a, b], the Extreme Value Theorem guarantees f attains some minimum m and some maximum M. The average f_avg is squeezed between them: m ≤ f_avg ≤ M. Now the Intermediate Value Theorem kicks in — since f is continuous and reaches both m and M, it must also reach every value between them, including f_avg. So some c ∈ (a, b) satisfies f(c) = f_avg. The proof is essentially just these two classical theorems applied in sequence.",
      "**Connection to the Derivative MVT:** There is a cleaner derivation using tools we already have. Let F be an antiderivative of f. Apply the derivative MVT to F on [a, b]: F'(c) = (F(b) − F(a))/(b − a) for some c. Since F' = f and FTC Part 2 says F(b) − F(a) = ∫ₐᵇ f(x) dx, this becomes f(c) = (1/(b−a)) ∫ₐᵇ f(x) dx. That is the MVT for integrals. The two mean value theorems are the same result stated in different languages — the integral version is the derivative version translated through FTC.",
      "**Continuity Is Not Optional:** The theorem fails without it. Define f(x) = 0 for x ∈ [0, 0.5) and f(x) = 2 for x ∈ [0.5, 1]. The average is (1/1)∫₀¹ f dx = (0·0.5 + 2·0.5) = 1. But f never equals 1 anywhere — f jumps from 0 to 2, skipping the value 1 entirely. This is the IVT failing because of the jump discontinuity. Continuity is not a formality; it is the exact hypothesis that prevents the function from skipping over its own average.",
      "**Finding c in Practice:** Given a specific f on [a, b], the procedure is: (1) compute f_avg = (1/(b−a)) ∫ₐᵇ f(x) dx, (2) solve f(c) = f_avg for c, (3) check that the solution(s) lie in (a, b). The MVT guarantees at least one solution exists, but there may be multiple — a flat function f = k has infinitely many. The theorem is an existence result, not a formula for c.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Mean Value Theorem for Integrals",
        body: "If \\(f\\) is continuous on \\([a,b]\\), then there exists \\(c \\in (a,b)\\) such that\n\\[\\int_a^b f(x)\\,dx = f(c)\\,(b-a).\\]\nEquivalently, the average value \\(f_{\\text{avg}} = \\dfrac{1}{b-a}\\int_a^b f(x)\\,dx\\) is attained at some interior point \\(c\\).",
      },
      {
        type: "prior-knowledge",
        title: "This Is EVT + IVT Working Together",
        body: "The proof uses two big theorems from Chapter 1: (1) EVT — a continuous function on a closed bounded interval attains its minimum m and maximum M. (2) IVT — a continuous function that takes values m and M somewhere must take every value between them. Both require continuity. The MVT for integrals is literally those two theorems chained together: EVT places f_avg between m and M; IVT delivers the c.",
      },
      {
        type: "real-world",
        title: "Average Voltage in AC Circuits",
        body: "AC voltage oscillates as V(t) = V₀ sin(2πft). Its average over a full cycle is zero (positive and negative halves cancel). Engineers use RMS (root mean square) instead: V_rms = sqrt((1/T) ∫₀ᵀ V² dt) = V₀/√2 ≈ 0.707 V₀. For 120 V RMS household current, V₀ ≈ 170 V peak. The MVT guarantees that V(t)² attains its average value V₀²/2 at some moment in each cycle — a concrete instance of the theorem in an everyday context.",
      },
      {
        type: "misconception",
        title: "c Is Not the Midpoint",
        body: "For f(x) = x² on [0, 2]: f_avg = (1/2)∫₀² x² dx = (1/2)(8/3) = 4/3. Solve f(c) = 4/3: c² = 4/3, so c = 2/√3 ≈ 1.155. The midpoint is 1. These differ. The location of c depends on the shape of the curve, not just the interval. For concave-up functions, c sits to the right of the midpoint; for concave-down, to the left.",
      },
      {
        type: "warning",
        title: "MVT for Integrals vs MVT for Derivatives",
        body: "Derivative MVT: the slope of the secant equals F'(c) for some c — about rates of change and tangent lines. Integral MVT: the area divided by width equals f(c) for some c — about function values and horizontal lines. Both say 'some interior c achieves the average,' but they are statements about different things. Do not mix up the formulas: f(c) = (1/(b−a))∫ₐᵇ f (integral) vs F'(c) = (F(b)−F(a))/(b−a) (derivative).",
      },
    ],
    visualizations: [
      {
        id: "MVTIntegralExplorer",
        title: "Average Value and the Equal-Area Rectangle",
        caption:
          "The blue shaded region is the area under f(x) on [a, b]. The orange rectangle has height f_avg = (1/(b−a)) ∫ₐᵇ f dx and the same base — equal area. The red dot marks c, the point where f(c) = f_avg. Drag a and b to change the interval and watch c shift.",
      },
    ],
  },

  math: {
    prose: [
      "**Average Value Formula:** The average value of a continuous function f on [a, b] is f_avg = (1/(b−a)) ∫ₐᵇ f(x) dx. This is the natural generalization of the arithmetic mean (x̄ = Σxᵢ/n) to continuously distributed data: the sum becomes an integral and the count n becomes the interval length (b − a). The average value is the unique constant function whose integral over [a, b] equals ∫ₐᵇ f(x) dx.",
      "**Formal Theorem:** If f is continuous on [a, b], there exists c ∈ (a, b) with f(c) = f_avg. Proof: EVT gives m ≤ f(x) ≤ M for all x ∈ [a, b]. Integrating: m(b−a) ≤ ∫ₐᵇ f dx ≤ M(b−a). Dividing by (b−a) > 0: m ≤ f_avg ≤ M. Since f is continuous and attains m and M on [a, b], IVT guarantees c ∈ (a, b) with f(c) = f_avg. ∎",
      "**Derivation via Derivative MVT:** Let F be any antiderivative of f on [a, b]. F is differentiable (since F' = f and f is continuous) and continuous on [a, b], so the derivative MVT applies: there exists c ∈ (a, b) with F'(c) = (F(b) − F(a))/(b − a). Substituting F' = f and applying FTC Part 2 (F(b) − F(a) = ∫ₐᵇ f dx): f(c) = ∫ₐᵇ f(x) dx / (b − a). This is the integral MVT. Both proofs yield the same conclusion; the second makes explicit that the integral and derivative MVTs are the same theorem under FTC.",
      "**Finding c Explicitly:** Set f(c) = f_avg and solve. For polynomials this reduces to a polynomial equation; for trig functions, to an inverse trig equation. The MVT guarantees at least one real solution in (a, b) but does not specify how many. For strictly monotone f, exactly one c exists. For constant f, every point in (a, b) is a valid c.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Average Value of a Function",
        body: "The **average value** of a continuous function \\(f\\) on \\([a,b]\\) is\n\\[f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx.\\]\nGeometrically: the height of the rectangle with base \\([a,b]\\) whose area equals \\(\\int_a^b f(x)\\,dx\\).",
      },
      {
        type: "theorem",
        title: "Mean Value Theorem for Integrals (Formal Statement)",
        body: "Let \\(f\\) be continuous on \\([a,b]\\). Then \\(\\exists\\, c \\in (a,b)\\) such that\n\\[f(c) = \\frac{1}{b-a}\\int_a^b f(x)\\,dx.\n\\quad \\Longleftrightarrow \\quad\n\\int_a^b f(x)\\,dx = f(c)\\,(b-a).\\]\n**Proof:** EVT \\(\\Rightarrow\\) \\(m \\leq f_{\\text{avg}} \\leq M\\); IVT \\(\\Rightarrow\\) \\(\\exists\\,c\\) with \\(f(c) = f_{\\text{avg}}\\). \\(\\square\\)",
      },
      {
        type: "definition",
        title: "Connection to the Derivative MVT",
        body: "Let \\(F\\) be an antiderivative of \\(f\\). Derivative MVT gives \\(F'(c) = (F(b)-F(a))/(b-a)\\). Since \\(F'=f\\) and \\(F(b)-F(a)=\\int_a^b f\\,dx\\) (FTC Part 2):\n\\[f(c) = \\frac{1}{b-a}\\int_a^b f(x)\\,dx.\\]\nThe MVT for integrals is the derivative MVT applied to an antiderivative, translated back by FTC.",
      },
    ],
    visualizations: [
      {
        id: "MVTIntegralProof",
        title: "Proof Walkthrough: From Extremes to Average",
        mathBridge:
          "Watching f_avg get squeezed between m and M via the integral inequality, then IVT delivering c — the full logical chain from EVT through IVT to the theorem's conclusion.",
        caption:
          "Step through the proof: EVT locates m and M, the integral inequality places f_avg between them, and IVT produces c.",
      },
    ],
  },

  rigor: {
    title: "Formal Proof: Squeezing the Average",
    visualizationId: "MVTIntegralProof",
    proofSteps: [
      {
        expression: "m \\leq f(x) \\leq M \\quad \\forall\\, x \\in [a,b]",
        annotation:
          "Extreme Value Theorem: f continuous on [a, b] attains its minimum m and maximum M at some points in the interval.",
      },
      {
        expression: "m(b-a) \\leq \\int_a^b f(x)\\,dx \\leq M(b-a)",
        annotation:
          "Integrate the pointwise inequality across [a, b]. Integration is monotone: if f ≤ g then ∫f ≤ ∫g.",
      },
      {
        expression: "m \\leq \\frac{1}{b-a}\\int_a^b f(x)\\,dx \\leq M",
        annotation:
          "Divide by (b−a) > 0. The average value f_avg is trapped between the extreme values of f.",
      },
      {
        expression: "\\exists\\; x_1, x_2 \\in [a,b]: f(x_1) = m,\\; f(x_2) = M",
        annotation:
          "EVT guarantees f actually attains m and M. So f achieves both endpoints of the interval [m, M].",
      },
      {
        expression: "\\exists\\; c \\in (a,b): f(c) = f_{\\text{avg}}",
        annotation:
          "Intermediate Value Theorem: f is continuous, f(x₁) = m ≤ f_avg ≤ M = f(x₂), so f must equal f_avg at some c between x₁ and x₂ — an interior point of [a, b].",
      },
      {
        expression: "\\int_a^b f(x)\\,dx = f(c)\\,(b-a) \\qquad \\square",
        annotation:
          "Multiply both sides of f(c) = f_avg by (b−a). The definite integral equals the function value at c times the interval width.",
      },
    ],
  },

  workedExamples: [
    {
      id: "mvti-ex1",
      title: "Average Value of a Polynomial",
      problem:
        "Find the average value of \\(f(x) = 3x^2 - 2x + 1\\) on \\([0, 3]\\), then find all \\(c \\in (0,3)\\) where \\(f(c) = f_{\\text{avg}}\\).",
      steps: [
        {
          label: "Set up the average value formula",
          work: "f_{\\text{avg}} = \\frac{1}{3-0}\\int_0^3 (3x^2 - 2x + 1)\\,dx",
          explanation:
            "Average value: (1/(b−a)) ∫ₐᵇ f(x) dx with a = 0, b = 3.",
          prereq: "Average value formula",
        },
        {
          label: "Evaluate the definite integral",
          work: "\\int_0^3 (3x^2 - 2x + 1)\\,dx = \\bigl[x^3 - x^2 + x\\bigr]_0^3 = (27 - 9 + 3) - 0 = 21",
          explanation:
            "Antiderivative term by term: 3x²→x³, −2x→−x², 1→x. Evaluate at 3: 27 − 9 + 3 = 21. Subtract value at 0: 0.",
          prereq: "Power rule antiderivatives, FTC Part 2",
        },
        {
          label: "Compute f_avg",
          work: "f_{\\text{avg}} = \\frac{21}{3} = 7",
          explanation: "Divide by interval length b − a = 3.",
          prereq: null,
        },
        {
          label: "Solve f(c) = f_avg",
          work: "3c^2 - 2c + 1 = 7 \\implies 3c^2 - 2c - 6 = 0 \\implies c = \\frac{2 \\pm \\sqrt{4 + 72}}{6} = \\frac{2 \\pm \\sqrt{76}}{6} = \\frac{1 \\pm \\sqrt{19}}{3}",
          explanation:
            "Rearrange to 3c² − 2c − 6 = 0. Quadratic formula with a=3, b=−2, c=−6. Discriminant: 4 + 72 = 76 = 4·19.",
          prereq: "Quadratic formula",
        },
        {
          label: "Select the valid root in (0, 3)",
          work: "c_1 = \\frac{1 + \\sqrt{19}}{3} \\approx \\frac{1 + 4.359}{3} \\approx 1.786 \\in (0,3) \\checkmark \\qquad c_2 = \\frac{1 - \\sqrt{19}}{3} \\approx -1.12 \\notin (0,3) \\times",
          explanation:
            "Only c₁ ≈ 1.786 lies in (0, 3). The MVT guaranteed at least one — we found exactly one.",
          prereq: null,
        },
      ],
      conclusion:
        "The average value is f_avg = 7, achieved at \\(c = (1 + \\sqrt{19})/3 \\approx 1.786\\).",
    },
    {
      id: "mvti-ex2",
      title: "Average Value of a Trig Function",
      problem:
        "Find the average value of \\(f(x) = \\sin(x)\\) on \\([0, \\pi]\\) and all \\(c \\in (0, \\pi)\\) where \\(f(c) = f_{\\text{avg}}\\).",
      steps: [
        {
          label: "Apply the average value formula",
          work: "f_{\\text{avg}} = \\frac{1}{\\pi}\\int_0^{\\pi} \\sin(x)\\,dx",
          explanation: "Interval [0, π] has length π. Denominator is π − 0 = π.",
          prereq: "Average value formula",
        },
        {
          label: "Evaluate the integral",
          work: "\\int_0^{\\pi} \\sin(x)\\,dx = \\bigl[-\\cos(x)\\bigr]_0^{\\pi} = (-\\cos\\pi) - (-\\cos 0) = 1 + 1 = 2",
          explanation:
            "Antiderivative of sin x is −cos x. At π: −cos(π) = −(−1) = 1. At 0: −cos(0) = −1. Difference: 1 − (−1) = 2.",
          prereq: "Trig antiderivatives",
        },
        {
          label: "Compute the average",
          work: "f_{\\text{avg}} = \\frac{2}{\\pi} \\approx 0.637",
          explanation:
            "Divide 2 by π. The average of sin x over one half-cycle is 2/π — a classic constant in engineering and signal processing.",
          prereq: null,
        },
        {
          label: "Solve sin(c) = 2/π",
          work: "\\sin(c) = \\frac{2}{\\pi} \\implies c = \\arcsin\\!\\left(\\frac{2}{\\pi}\\right) \\approx 0.690 \\quad \\text{or} \\quad c = \\pi - \\arcsin\\!\\left(\\frac{2}{\\pi}\\right) \\approx 2.452",
          explanation:
            "On [0, π], sin is symmetric about π/2. If sin(c) = 2/π, then c = arcsin(2/π) or c = π − arcsin(2/π). Both lie in (0, π).",
          prereq: "Inverse trig, unit circle symmetry",
        },
      ],
      conclusion:
        "Average value is \\(2/\\pi \\approx 0.637\\). Two points in \\((0,\\pi)\\) attain it: \\(c \\approx 0.69\\) and \\(c \\approx 2.45\\), symmetric about \\(\\pi/2\\).",
    },
    {
      id: "mvti-ex3",
      title: "Deriving the Integral MVT from the Derivative MVT",
      problem:
        "Using only FTC Part 2 and the MVT for derivatives, derive the MVT for integrals without invoking EVT or IVT directly.",
      steps: [
        {
          label: "Let F be an antiderivative of f",
          work: "F'(x) = f(x) \\text{ on } [a,b]",
          explanation:
            "Since f is continuous on [a, b], FTC Part 1 guarantees an antiderivative F exists and is differentiable.",
          prereq: "FTC Part 1",
        },
        {
          label: "Apply the MVT for derivatives to F",
          work: "\\exists\\; c \\in (a,b): \\quad F'(c) = \\frac{F(b) - F(a)}{b - a}",
          explanation:
            "F is differentiable on (a, b) and continuous on [a, b] — the hypotheses of the derivative MVT are satisfied.",
          prereq: "MVT for derivatives (Chapter 3)",
        },
        {
          label: "Substitute F' = f",
          work: "f(c) = \\frac{F(b) - F(a)}{b - a}",
          explanation:
            "Since F' = f everywhere on [a, b], we replace F'(c) with f(c).",
          prereq: null,
        },
        {
          label: "Apply FTC Part 2 to the numerator",
          work: "F(b) - F(a) = \\int_a^b f(x)\\,dx",
          explanation:
            "FTC Part 2: the definite integral equals the net change in any antiderivative.",
          prereq: "FTC Part 2",
        },
        {
          label: "Conclude",
          work: "f(c) = \\frac{1}{b-a}\\int_a^b f(x)\\,dx \\implies \\int_a^b f(x)\\,dx = f(c)\\,(b-a) \\quad \\square",
          explanation:
            "Multiply both sides by (b−a). This is exactly the MVT for integrals. It required no direct appeal to EVT or IVT — they are hidden inside the derivative MVT, which ultimately rests on Rolle's Theorem.",
          prereq: null,
        },
      ],
      conclusion:
        "The two Mean Value Theorems are the same theorem translated through FTC. The derivative MVT applied to an antiderivative is the integral MVT.",
    },
  ],

  challenges: [
    {
      id: "mvti-ch1",
      title: "Average Velocity and When It Is Achieved",
      difficulty: "medium",
      problem:
        "A particle moves with velocity \\(v(t) = t^2 - 4t + 3\\) m/s on \\([0, 4]\\).\n\n(a) Find the average velocity over \\([0, 4]\\).\n\n(b) Find all times \\(t \\in (0, 4)\\) when the instantaneous velocity equals the average.\n\n(c) The particle changes direction when \\(v = 0\\). Does it change direction before or after the time c found in (b)?",
      steps: [
        {
          label: "Compute the average velocity",
          work: "v_{\\text{avg}} = \\frac{1}{4}\\int_0^4 (t^2 - 4t + 3)\\,dt = \\frac{1}{4}\\left[\\frac{t^3}{3} - 2t^2 + 3t\\right]_0^4 = \\frac{1}{4}\\left(\\frac{64}{3} - 32 + 12\\right) = \\frac{1}{4}\\cdot\\frac{4}{3} = \\frac{1}{3}",
          explanation:
            "Antiderivative: t³/3 − 2t² + 3t. At t = 4: 64/3 − 32 + 12 = 64/3 − 20 = 4/3. Divide by 4: v_avg = 1/3 m/s.",
        },
        {
          label: "Solve v(t) = 1/3",
          work: "t^2 - 4t + 3 = \\frac{1}{3} \\implies 3t^2 - 12t + 8 = 0 \\implies t = \\frac{12 \\pm \\sqrt{144 - 96}}{6} = 2 \\pm \\frac{2\\sqrt{3}}{3}",
          explanation:
            "Multiply by 3, rearrange, apply quadratic formula. Discriminant: 144 − 96 = 48, √48 = 4√3.",
        },
        {
          label: "Verify both times lie in (0, 4)",
          work: "t_1 = 2 - \\tfrac{2\\sqrt{3}}{3} \\approx 0.845 \\in (0,4) \\checkmark \\qquad t_2 = 2 + \\tfrac{2\\sqrt{3}}{3} \\approx 3.155 \\in (0,4) \\checkmark",
          explanation:
            "Both roots are in (0, 4). MVT guaranteed at least one — we found two.",
        },
        {
          label: "Find when the particle changes direction",
          work: "v(t) = 0 \\implies t^2 - 4t + 3 = 0 \\implies (t-1)(t-3) = 0 \\implies t = 1 \\text{ and } t = 3",
          explanation:
            "Direction changes at t = 1 and t = 3. Comparing: t₁ ≈ 0.845 < 1 and t₂ ≈ 3.155 > 3. Both c values occur just before a direction change.",
        },
      ],
    },
    {
      id: "mvti-ch2",
      title: "Does the MVT Apply? Continuity Checks",
      difficulty: "medium",
      problem:
        "For each function on the given interval, determine whether the MVT for integrals is guaranteed to apply. If yes, find the average value and the point(s) c. If no, identify which hypothesis fails.\n\n(a) \\(f(x) = 1/x\\) on \\([1, 4]\\)\n\n(b) \\(g(x) = 1/x\\) on \\([-1, 1]\\)\n\n(c) \\(h(x) = |x|\\) on \\([-2, 2]\\)",
      steps: [
        {
          label: "Check (a): f(x) = 1/x on [1, 4]",
          work: "x > 0 \\text{ on } [1,4] \\Rightarrow f \\text{ continuous on } [1,4] \\Rightarrow \\text{MVT applies}",
          explanation:
            "The only issue with 1/x is at x = 0, which is not in [1, 4].",
        },
        {
          label: "Average value for (a)",
          work: "f_{\\text{avg}} = \\frac{1}{3}\\int_1^4 \\frac{1}{x}\\,dx = \\frac{\\ln 4}{3} \\approx 0.462",
          explanation:
            "∫₁⁴ (1/x) dx = [ln|x|]₁⁴ = ln 4 − 0 = ln 4. Divide by b − a = 3.",
        },
        {
          label: "Find c for (a)",
          work: "\\frac{1}{c} = \\frac{\\ln 4}{3} \\implies c = \\frac{3}{\\ln 4} \\approx 2.164 \\in (1,4) \\checkmark",
          explanation:
            "Solve 1/c = (ln 4)/3. Since ln 4 ≈ 1.386, c ≈ 2.164 — confirmed inside (1, 4).",
        },
        {
          label: "Check (b): g(x) = 1/x on [−1, 1]",
          work: "g \\text{ has vertical asymptote at } x = 0 \\in [-1,1] \\Rightarrow g \\text{ not continuous on } [-1,1]",
          explanation:
            "MVT does NOT apply. Moreover, ∫₋₁¹ (1/x) dx is an improper integral that diverges — the interval contains the singularity.",
        },
        {
          label: "Check (c): h(x) = |x| on [−2, 2]",
          work: "|x| \\text{ is continuous on } \\mathbb{R} \\text{ (corner at 0 is not a discontinuity)} \\Rightarrow \\text{MVT applies}",
          explanation:
            "Continuity does not require differentiability. |x| is continuous everywhere; MVT applies.",
        },
        {
          label: "Average value and c for (c)",
          work: "f_{\\text{avg}} = \\frac{1}{4}\\int_{-2}^{2}|x|\\,dx = \\frac{1}{4}\\cdot 2\\int_0^2 x\\,dx = \\frac{1}{2}\\cdot 2 = 1. \\quad |c| = 1 \\implies c = \\pm 1 \\in (-2,2) \\checkmark",
          explanation:
            "|x| is even so the integral is 2·∫₀² x dx = 2·[x²/2]₀² = 4. Divide by 4: average = 1. Solve |c| = 1: c = 1 or c = −1, both interior.",
        },
      ],
    },
    {
      id: "mvti-ch3",
      title: "Temperature Average and HVAC Runtime",
      difficulty: "hard",
      problem:
        "Temperature (°F) over a 12-hour period is \\(T(t) = 60 + 20\\sin(\\pi t/12)\\), \\(0 \\leq t \\leq 12\\).\n\n(a) Find the average temperature \\(T_{\\text{avg}}\\) over \\([0, 12]\\).\n\n(b) Find all \\(t \\in (0,12)\\) when \\(T(t) = T_{\\text{avg}}\\).\n\n(c) An HVAC system runs whenever \\(T > T_{\\text{avg}}\\). For what fraction of the 12-hour period is it running?",
      steps: [
        {
          label: "Set up the average value integral",
          work: "T_{\\text{avg}} = \\frac{1}{12}\\int_0^{12}\\!\\left(60 + 20\\sin\\frac{\\pi t}{12}\\right)dt",
          explanation:
            "Apply the average value formula over [0, 12] with b − a = 12.",
        },
        {
          label: "Antidifferentiate and evaluate",
          work: "= \\frac{1}{12}\\left[60t - \\frac{240}{\\pi}\\cos\\frac{\\pi t}{12}\\right]_0^{12} = \\frac{1}{12}\\left[720 + \\frac{240}{\\pi} - \\left(0 - \\frac{240}{\\pi}\\right)\\right] = \\frac{1}{12}\\left(720 + \\frac{480}{\\pi}\\right)",
          explanation:
            "Antiderivative of 20 sin(πt/12) is −20·(12/π) cos(πt/12) = −(240/π) cos(πt/12). At t=12: cos(π) = −1; at t=0: cos(0) = 1.",
        },
        {
          label: "Simplify T_avg",
          work: "T_{\\text{avg}} = 60 + \\frac{40}{\\pi} \\approx 72.73°\\text{F}",
          explanation:
            "720/12 = 60 and 480/(12π) = 40/π ≈ 12.73. The constant term 60 is the baseline; 40/π is the lift from the sine wave.",
        },
        {
          label: "Solve T(t) = T_avg",
          work: "60 + 20\\sin\\frac{\\pi t}{12} = 60 + \\frac{40}{\\pi} \\implies \\sin\\frac{\\pi t}{12} = \\frac{2}{\\pi}",
          explanation: "Subtract 60, divide by 20: 40/(20π) = 2/π.",
        },
        {
          label: "Find the crossing times",
          work: "\\frac{\\pi t}{12} = \\arcsin\\frac{2}{\\pi} \\approx 0.690 \\implies t_1 \\approx 2.64 \\text{ hr} \\qquad \\frac{\\pi t}{12} = \\pi - 0.690 \\approx 2.452 \\implies t_2 \\approx 9.36 \\text{ hr}",
          explanation:
            "Multiply each angle value by 12/π ≈ 3.82 to convert back to hours. Two crossings within (0, 12).",
        },
        {
          label: "Compute the fraction above T_avg",
          work: "T > T_{\\text{avg}} \\text{ when } \\sin(\\pi t/12) > 2/\\pi, \\text{ i.e., for } t \\in (2.64,\\, 9.36). \\text{ Fraction} = \\frac{9.36 - 2.64}{12} \\approx 0.56",
          explanation:
            "The HVAC runs during the central ~6.72 hours out of 12 — about 56% of the period. The sine spends more time above 2/π than below it because 2/π < 1 (the curve rises above this threshold relatively easily).",
        },
      ],
    },
  ],

  quiz: [
    {
      question:
        "The MVT for Integrals says: if f is continuous on [a, b], then there exists c ∈ (a, b) such that:",
      options: [
        "f(c) = (F(b) − F(a)) for some antiderivative F",
        "f(c) = (1/(b−a)) ∫ₐᵇ f(x) dx",
        "∫ₐᵇ f(x) dx = f'(c)(b−a)",
        "f(c) = (f(a) + f(b)) / 2",
      ],
      answer: 1,
      explanation:
        "The MVT for integrals: there exists c ∈ (a, b) with f(c) equal to the average value (1/(b−a)) ∫ₐᵇ f(x) dx.",
    },
    {
      question: "Find the average value of f(x) = 4x³ on [0, 2].",
      options: ["4", "8", "16", "2"],
      answer: 1,
      explanation:
        "f_avg = (1/2) ∫₀² 4x³ dx = (1/2) [x⁴]₀² = (1/2)(16) = 8.",
    },
    {
      question: "The average value of f(x) = cos(x) on [0, π/2] is:",
      options: ["1", "2/π", "π/2", "0"],
      answer: 1,
      explanation:
        "f_avg = (2/π) ∫₀^(π/2) cos(x) dx = (2/π)[sin x]₀^(π/2) = (2/π)(1 − 0) = 2/π.",
    },
    {
      question:
        "Which hypothesis is required for the MVT for Integrals to apply?",
      options: [
        "f must be differentiable on (a, b)",
        "f must be continuous on [a, b]",
        "f must be positive on [a, b]",
        "f must be monotone on [a, b]",
      ],
      answer: 1,
      explanation:
        "Continuity on [a, b] is sufficient — it enables EVT and IVT in the proof. Differentiability is not required.",
    },
    {
      question: "For f(x) = x² on [0, 3], find c ∈ (0, 3) where f(c) = f_avg.",
      options: ["c = √3", "c = 3/√3 = √3", "c = √6", "c = 1"],
      answer: 0,
      explanation:
        "f_avg = (1/3) ∫₀³ x² dx = (1/3)(9) = 3. Solve c² = 3: c = √3 ≈ 1.73 ∈ (0, 3). ✓",
    },
    {
      question:
        "The proof of the MVT for Integrals uses which pair of theorems?",
      options: [
        "FTC Part 1 and FTC Part 2",
        "Extreme Value Theorem and Intermediate Value Theorem",
        "MVT for derivatives and Rolle's Theorem",
        "Squeeze Theorem and L'Hôpital's Rule",
      ],
      answer: 1,
      explanation:
        "EVT gives that f attains m and M; IVT guarantees f hits every value between them, including f_avg.",
    },
    {
      question:
        "True or False: the MVT for Integrals guarantees exactly one c in (a, b) where f(c) = f_avg.",
      options: [
        "True — one c is always guaranteed",
        "False — there may be multiple; the theorem guarantees at least one",
        "False — there may be zero if f is not differentiable",
        "True — but only for strictly monotone functions",
      ],
      answer: 1,
      explanation:
        "The theorem guarantees at least one c. For example, a constant function has infinitely many. Uniqueness is not claimed.",
    },
    {
      question:
        "How is the MVT for Integrals related to the MVT for Derivatives?",
      options: [
        "They are entirely independent results",
        "The integral MVT follows from applying the derivative MVT to an antiderivative F of f, then using FTC Part 2",
        "The derivative MVT follows from the integral MVT by differentiating both sides",
        "They require the same hypotheses but otherwise differ completely",
      ],
      answer: 1,
      explanation:
        "Let F be an antiderivative of f. Derivative MVT: F'(c) = (F(b)−F(a))/(b−a). Since F' = f and F(b)−F(a) = ∫ₐᵇ f dx (FTC Part 2): f(c) = (1/(b−a)) ∫ₐᵇ f dx. That is the integral MVT.",
    },
    {
      question:
        "A function satisfies ∫ₐᵇ f(x) dx = 0. Assuming f is continuous, what does the MVT for Integrals conclude?",
      options: [
        "f = 0 everywhere on [a, b]",
        "There exists c ∈ (a, b) with f(c) = 0",
        "f must change sign on [a, b]",
        "The MVT is inconclusive since the integral is zero",
      ],
      answer: 1,
      explanation:
        "f_avg = 0/(b−a) = 0. MVT guarantees f(c) = 0 for some c ∈ (a, b). f need not be identically zero — e.g., sin x on [0, 2π] integrates to zero but isn't zero everywhere.",
    },
    {
      question:
        "The average value of f on [a, b] is geometrically the height of:",
      options: [
        "A triangle with base (b − a) and the same area as ∫ₐᵇ f dx",
        "A rectangle with base (b − a) and the same area as ∫ₐᵇ f dx",
        "The midpoint tangent line to f on [a, b]",
        "The secant line through (a, f(a)) and (b, f(b))",
      ],
      answer: 1,
      explanation:
        "f_avg = ∫ₐᵇ f(x) dx / (b−a), so f_avg · (b−a) = ∫ₐᵇ f(x) dx. This is the area of the rectangle with height f_avg and base (b−a).",
    },
  ],

    walkthroughs: [
    {
      id: 'wt-mvt-integrals',
      title: 'Mean Value Theorem for Integrals – The Average Value Theorem',
      prereqs: ['Continuity', 'Definite integral as net area', 'Intermediate Value Theorem'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'mvt-integrals', label: 'Mean Value Theorem for Integrals' },
      problem: 'State, prove, and apply the Mean Value Theorem for Integrals: If \\( f \\) is continuous on \\([a,b]\\), then there exists some \\( c \\) in \\([a,b]\\) such that \\( \\int_a^b f(x)\\,dx = f(c)(b-a) \\).',
      steps: [
        {
          label: 'REGISTRY – The Players',
          visualNote: 'A continuous curve f(x) over [a,b] with shaded area beneath it. A horizontal dashed line at height f(c) is drawn so the rectangle of height f(c) and width (b-a) exactly matches the shaded area.',
          strategy: 'Before any proof or example, name the key objects so the theorem is never abstract.',
          explanation: 'We are working with three main players: (1) a continuous function f(x) on a closed interval [a,b], (2) the definite integral ∫_a^b f(x) dx, which equals the net signed area under the curve, and (3) the number c in [a,b] where the function attains its average value. The theorem says the total area equals the average height f(c) times the width (b-a). This is the continuous version of “the average of a list of numbers equals one of the numbers in the list.”',
          math: 'f continuous on [a,b] \\quad \\Rightarrow \\quad \\exists c \\in [a,b] \\text{ s.t. } \\int_a^b f(x)\\,dx = f(c)(b-a)'
        },
        {
          label: 'Geometric intuition – the rectangle of equal area',
          visualNote: 'The shaded region under f(x) is shown next to a rectangle of the same area with height f(c) and base (b-a). The two areas are visually equal.',
          strategy: 'Think of the theorem as guaranteeing a horizontal line that “balances” the area under the curve into a rectangle of identical area.',
          explanation: 'Imagine the area under the curve as a lumpy region. The theorem promises there is some height f(c) where, if you built a rectangle of that height across the full width (b-a), it would have exactly the same area as the lumpy region. This height f(c) is the average value of f over [a,b]. The theorem is not about the highest or lowest point — it is about the average height that would give the correct total area.',
          math: '\\text{Average value} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx = f(c)'
        },
        {
          label: 'Proof – why the theorem must be true',
          visualNote: 'The graph shows the minimum value m and maximum value M of f on [a,b]. The integral is squeezed between m(b-a) and M(b-a). A horizontal line at some height between m and M must hit the curve.',
          strategy: 'Use the Extreme Value Theorem + Intermediate Value Theorem to squeeze the average.',
          explanation: 'Because f is continuous on a closed interval, it attains its minimum m and maximum M. The integral (area) must lie between the lower rectangle m(b-a) and the upper rectangle M(b-a). Dividing by (b-a) gives m ≤ (1/(b-a))∫ f ≤ M. By the Intermediate Value Theorem, since f is continuous, it must hit every value between m and M — including the average value itself. Therefore there exists some c where f(c) exactly equals that average.',
          math: 'm \\leq \\frac{1}{b-a}\\int_a^b f \\leq M \\implies \\exists c \\in [a,b] \\text{ with } f(c) = \\frac{1}{b-a}\\int_a^b f(x)\\,dx'
        },
        {
          label: 'Example 1 – Simple polynomial (easy to verify)',
          visualNote: 'f(x) = x² on [0,2]. Shaded area and the horizontal line at height 4/3.',
          strategy: 'Compute the integral, divide by length, then solve for c.',
          explanation: 'Let f(x) = x² on [0,2]. The integral is ∫_0^2 x² dx = [x³/3]_0^2 = 8/3. The length b-a = 2, so average value = (8/3)/2 = 4/3. Solve f(c) = 4/3 → c² = 4/3 → c = √(4/3) = 2/√3 ≈ 1.154, which lies nicely inside [0,2]. This shows the theorem is not abstract — we can actually find the exact c.',
          math: '\\int_0^2 x^2\\,dx = \\frac{8}{3} \\quad \\Rightarrow \\quad \\text{average} = \\frac{4}{3} \\quad \\Rightarrow \\quad c = \\sqrt{\\frac{4}{3}} \\in [0,2]'
        },
        {
          label: 'Example 2 – Trigonometric function (shows oscillation)',
          visualNote: 'f(x) = sin x on [0,π]. The average height 2/π is drawn; c = π/2 is marked.',
          strategy: 'Even with oscillation, the theorem guarantees a point where the function equals its average.',
          explanation: 'Let f(x) = sin x on [0,π]. The integral is [-cos x]_0^π = 2. Length = π, so average value = 2/π ≈ 0.637. Solve sin c = 2/π → c = arcsin(2/π) ≈ 0.690, which is inside [0,π]. Notice that sin x reaches 1 at π/2, but the average is lower because the function spends more time near zero at the ends. The theorem still finds the exact balancing point.',
          math: '\\int_0^\\pi \\sin x\\,dx = 2 \\quad \\Rightarrow \\quad \\text{average} = \\frac{2}{\\pi} \\quad \\Rightarrow \\quad c = \\arcsin\\left(\\frac{2}{\\pi}\\right)'
        },
        {
          label: 'Example 3 – Why continuity is necessary (counterexample)',
          visualNote: 'A step function (discontinuous) is shown. The average value 0.5 is never actually attained by the function.',
          strategy: 'Show that without continuity the theorem can fail.',
          explanation: 'Consider the discontinuous function that is 0 on [0,1) and 1 on [1,2]. The integral is 1, average value = 1/2. But the function never actually equals 1/2 anywhere — it jumps from 0 to 1. Continuity is essential because it guarantees the function takes on every intermediate value.',
          math: '\\text{Discontinuous case: average = 1/2 but f(x) never equals 1/2}'
        },
        {
          label: 'Connection to the Fundamental Theorem of Calculus',
          visualNote: 'A cycle: integral → average value → point c → back to f(c) via MVT for integrals.',
          strategy: 'Link this theorem to FTC Part 2.',
          explanation: 'The Mean Value Theorem for Integrals is the bridge between the definite integral (total area) and the instantaneous height f(c). It tells us the accumulation function F(x) = ∫_a^x f(t) dt has derivative exactly f(x) at some interior point in every interval — which is why FTC works so cleanly.',
          math: '\\text{MVT for Integrals} \\implies \\text{the average height exists and is attained}'
        }
      ],
      variations: [
        { question: 'Find c for f(x) = x^3 on [0,1].', hint: 'Integral = 1/4, average = 1/4, solve c^3 = 1/4 → c = (1/4)^{1/3} ≈ 0.63.' },
        { question: 'What if f is not continuous?', hint: 'The theorem can fail, as in the step-function counterexample.' }
      ]
    }
  ],

  crossRefs: [
    {
      lessonSlug: "mean-value-theorem",
      context:
        "The MVT for integrals is derived directly from the MVT for derivatives — review Chapter 3 to see the logical connection.",
    },
    {
      lessonSlug: "fundamental-theorem",
      context:
        "FTC Part 1 guarantees antiderivatives exist; FTC Part 2 appears in the derivation connecting the two MVTs.",
    },
    {
      lessonSlug: "applications",
      context:
        "Average value and area between curves are the primary applications of the MVT for integrals, developed in depth in Applications of Integration.",
    },
  ],
};
