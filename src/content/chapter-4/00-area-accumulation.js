// FILE: src/content/chapter-4/00-area-accumulation.js
export default {
  id: "ch4-000",
  slug: "area-accumulation",
  chapter: 4,
  order: 0,
  title: "Area and Accumulation",
  subtitle:
    "The area under a rate curve equals the total accumulated quantity — the founding idea of integral calculus",
  tags: [
    "accumulation",
    "area under curve",
    "rate functions",
    "signed area",
    "integral notation",
    "velocity",
    "displacement",
    "net change",
  ],

  hook: {
    question:
      "A factory pump pushes water into a tank at a rate that varies over time: r(t) = 20 − 3t litres per minute. How much total water enters the tank over the first 6 minutes? You cannot simply multiply rate × time because the rate is changing at every moment. Yet the answer is completely determined by the function r(t). How do we find it?",
    realWorldContext:
      "Accumulation from a varying rate is everywhere in science and engineering. Your electricity meter integrates power (watts) over time to give energy consumed (watt-hours) — every utility bill is an integral. GPS odometers integrate velocity to compute distance traveled. Medical devices integrate blood flow rate to compute total volume delivered. Climate scientists integrate CO₂ emission rates over decades to compute total atmospheric accumulation. A rocket's fuel consumption rate is a function of time; total fuel burned is the integral of that rate. Wherever a quantity builds up continuously from a rate that changes, the integral is the tool that computes the total.",
    previewVisualizationId: "WaterTank",
  },

  intuition: {
    prose: [
      "The simplest accumulation problem is constant rate: if water flows at a steady 5 litres per minute for 3 minutes, the total is 5 × 3 = 15 litres. On a graph of rate r versus time t, the rate is a horizontal line at r = 5. The total accumulated quantity is the area of the rectangle under that line: width 3 (time interval) times height 5 (rate) equals 15. This geometric observation — area under the rate curve equals total accumulated quantity — is the seed of integration.",
      "Now suppose the rate is not constant but changes linearly: r(t) = 3t m/s (a car accelerating from rest). In the first 4 seconds, the rate rises from 0 to 12 m/s. The velocity-time graph is a straight line through the origin. The region under the graph from t = 0 to t = 4 is a right triangle with base 4 and height 12. Its area is ½ × 4 × 12 = 24. The car travels 24 metres. This is not a coincidence — it is the same logic. Distance is area under the velocity curve, because each thin vertical strip of the graph has width dt (a tiny time interval) and height v(t) (speed at that instant), contributing v(t) dt metres to the total.",
      "For curved rate functions, the triangle and rectangle formulas no longer apply directly. But the underlying logic is unchanged. Slice the time axis into many small intervals. In each tiny interval [tᵢ, tᵢ₊₁] of width Δt, the rate barely changes — it is approximately r(tᵢ). The amount accumulated in that slice is approximately r(tᵢ) · Δt, the area of a thin rectangle. Sum all these rectangles, and you have an approximation to the total. The more slices you use, the finer the approximation and the closer you get to the true total. In the limit as the slice width approaches zero, the sum of rectangles becomes the area under the curve exactly.",
      'This limit of sums is the definite integral, written ∫ₐᵇ f(x) dx. The elongated S symbol (∫) stands for "sum" — Leibniz chose it to emphasize that the integral is a limiting summation. The symbol dx represents the infinitesimal width of each slice. The limits a and b mark the start and end of the interval. The entire expression means: "sum up f(x) · dx for every x from a to b." This is the most compact and powerful notation ever invented for an accumulation process.',
      "The connection between area and accumulation has a directional aspect: signed area. If a velocity is negative (moving backward), the contribution to displacement is negative. If a rate function dips below the t-axis, the integral subtracts that portion. The definite integral computes net accumulation — positive contributions minus negative contributions. For total accumulation (ignoring direction), you integrate the absolute value |f(x)|. This signed vs. unsigned distinction is important in applications: displacement (net change in position) uses the signed integral, while total distance traveled uses the integral of |v(t)|.",
      "The historical roots of integration go back to Archimedes, who computed the area of a parabolic segment around 250 BC by exhausting it with triangles — a method strikingly close to modern Riemann sums. Cavalieri in the 1630s summed infinitesimal slices to compute volumes. But the real leap came from Newton and Leibniz in the 1660s–1680s: they independently discovered that the process of accumulation is the inverse of the process of differentiation. This Fundamental Theorem of Calculus — which we develop in Lesson 3 — transforms integration from a geometric puzzle into an algebraic calculation.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "You Already Know Area Formulas",
        body: "You can already compute the area under many rate functions using geometry: rectangles (constant rate), triangles (linearly growing rate), trapezoids (linearly changing rate between two values), and semicircles (r(t) = √(R² − t²)). Integration generalizes this to any curve. When the rate function is a straight line or constant, you should always use the geometric formula — it's faster and more elegant than any algebraic method.",
      },
      {
        type: "geometric",
        title: "Circle Area as Unwrapped Rings",
        body: "If you cut a circle into many thin rings and unwrap them, they approximate a triangle with base 2πr and height r, giving area (1/2)(2πr)r = πr². This is integration by geometry.",
      },
      {
        type: "real-world",
        title: "Every Energy Bill Is an Integral",
        body: "Your household power consumption P(t) in watts varies minute by minute — it spikes when the kettle switches on and drops when appliances turn off. The total energy consumed in a month (measured in kilowatt-hours and billed accordingly) is ∫₀ᵀ P(t) dt / 1000, where T is the number of hours in the month. Your electricity meter is a hardware integrator, continuously summing P(t) dt and displaying the running total. The same principle underlies data usage meters (integrating bytes/second), water meters (litres/second), and gas meters (cubic feet/second).",
      },
      {
        type: "geometric",
        title: "Area Under v(t) = Distance Traveled",
        body: "For a particle moving along a line with velocity v(t), the displacement over [a, b] is ∫ₐᵇ v(t) dt = the signed area between the velocity curve and the t-axis. Positive velocity (moving right) contributes positive area; negative velocity (moving left) contributes negative area. The net area is the net displacement: final position minus initial position. The total path length (total distance without regard to direction) is ∫ₐᵇ |v(t)| dt.",
      },
      {
        type: "warning",
        title: "Area vs. Signed Area",
        body: "The integral ∫ₐᵇ f(x) dx is the SIGNED area — it subtracts regions where f < 0. If you want the total geometric area (all regions counted positively), integrate |f(x)|. For example, ∫₀^(2π) sin(x) dx = 0 (positive and negative lobes cancel), but ∫₀^(2π) |sin(x)| dx = 4 (both lobes counted positively). Always clarify which you need before computing.",
      },
      {
        type: "misconception",
        title: "∫ₐᵇ f(x) dx Is NOT Always Positive",
        body: "Many students assume integrals are always positive because they're 'areas.' But ∫₀^π cos(x) dx = 0 — the positive half exactly cancels the negative half. And ∫₀^(3π/2) sin(x) dx = 1, despite the function going negative on [π, 3π/2]. The integral measures SIGNED area. Only ∫|f(x)|dx (the total area) is always ≥ 0.",
      },
      {
        type: "history",
        title: "Archimedes and the Quadrature of the Parabola (250 BC)",
        body: "Archimedes proved that the area under a parabola from 0 to 1 is exactly 1/3 of the enclosing rectangle — the same result we get from ∫₀¹ x² dx = 1/3. He did this without calculus, using an infinite geometric series of inscribed triangles. His proof was one of the earliest uses of the 'method of exhaustion,' the ancient precursor to taking limits of Riemann sums.",
      },
    ],
    visualizations: [
      {
        id: "WaterTank",
        title: "Variable Flow Rate → Water Accumulation",
        mathBridge:
          "The accumulated volume at time $t$ is $V(t) = \\int_0^t r(s)\\,ds$ — the signed area under the rate curve from $0$ to $t$. When $r(t) > 0$ (rate is positive), $V$ increases. When $r(t) < 0$ (water flowing out), $V$ decreases. This is the integral as a running total: $V'(t) = r(t)$, which is the Fundamental Theorem of Calculus in action.",
        caption:
          "The left panel shows the flow rate r(t) over time. The right panel shows the total water volume accumulated. As the rate dips below zero (water flowing out), the total decreases. The accumulated total at any time t is the signed area under the rate curve from 0 to t.",
      },
    ],
  },

  math: {
    prose: [
      "Formally, suppose f is a rate function defined on [a, b]. We introduce the notation ∫ₐᵇ f(x) dx for the total accumulation of f over [a, b]. This is called the definite integral of f from a to b. The variable x is a dummy variable — ∫ₐᵇ f(x) dx and ∫ₐᵇ f(t) dt and ∫ₐᵇ f(u) du all denote the same number. The integral depends only on the function f and the limits a and b, not on the name of the variable of integration.",
      'Three basic properties follow immediately from the signed-area interpretation. First, ∫ₐᵃ f(x) dx = 0: integrating over a zero-width interval accumulates nothing. Second, ∫ₐᵇ f(x) dx = − ∫ᵦᵃ f(x) dx: reversing the limits of integration changes the sign, because we are now "sweeping" in the opposite direction. Third, linearity: ∫ₐᵇ [c·f(x) + g(x)] dx = c·∫ₐᵇ f(x) dx + ∫ₐᵇ g(x) dx for any constants c. These properties let us split, reverse, and scale integrals algebraically.',
      "The additive interval property is essential in applications: ∫ₐᵇ f(x) dx + ∫ᵦᶜ f(x) dx = ∫ₐᶜ f(x) dx. Total accumulation from a to c equals accumulation from a to b plus accumulation from b to c, regardless of where b falls (even outside [a, c]). This property allows us to break complex intervals into simpler pieces and reassemble the result.",
      "Two comparison properties complete the foundation. If f(x) ≥ 0 on [a, b], then ∫ₐᵇ f(x) dx ≥ 0 (the area of a non-negative function is non-negative). If f(x) ≥ g(x) on [a, b], then ∫ₐᵇ f ≥ ∫ₐᵇ g. These allow bounding integrals without computing them exactly: if m ≤ f(x) ≤ M on [a, b], then m(b−a) ≤ ∫ₐᵇ f ≤ M(b−a). This sandwich estimate is useful in numerical analysis and in proving convergence of approximation methods.",
    ],
    callouts: [
      {
        type: "definition",
        title: "The Definite Integral (Informal)",
        body: "For a function f defined on [a, b], the definite integral\n\\[\\int_a^b f(x)\\,dx\\]\nis the signed area between the graph of f and the x-axis over [a, b]. Regions above the x-axis contribute positively; regions below contribute negatively. The precise definition as a limit of Riemann sums is given in Lesson 1.",
      },
      {
        type: "theorem",
        title: "Basic Properties of the Definite Integral",
        body: "\\[\\int_a^a f(x)\\,dx = 0\\]\n\\[\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx\\]\n\\[\\int_a^b [c\\,f(x) + g(x)]\\,dx = c\\int_a^b f(x)\\,dx + \\int_a^b g(x)\\,dx\\]\n\\[\\int_a^b f(x)\\,dx + \\int_b^c f(x)\\,dx = \\int_a^c f(x)\\,dx\\]",
      },
      {
        type: "theorem",
        title: "Bounds on Integrals",
        body: "If \\(m \\leq f(x) \\leq M\\) for all \\(x \\in [a,b]\\), then\n\\[m(b-a) \\leq \\int_a^b f(x)\\,dx \\leq M(b-a).\\]",
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The signed-area interpretation of the definite integral is intuitive but not yet mathematically precise. To define ∫ₐᵇ f(x) dx rigorously, we need to specify exactly what "area under a curve" means for a general function f, including functions with corners, kinks, and even discontinuities. The rigorous definition via Riemann sums — developed in Lesson 1 — fills this gap. For now, it suffices to note that the informal definition is consistent with all the properties stated above, and that a formal proof of each property follows directly from the limit definition once it is established.',
      "The property ∫ₐᵇ f = −∫ᵦᵃ f is not merely a convention — it is required for the additive property to be consistent. If ∫ₐᵇ f + ∫ᵦᵃ f were required to equal ∫ₐᵃ f = 0, then ∫ᵦᵃ f = −∫ₐᵇ f follows by algebra. So the reversed-limits sign rule is dictated by the interval additivity property. Once we define the integral via Riemann sums for a ≤ b, we extend the definition to a > b by declaring ∫ᵦᵃ f = −∫ₐᵇ f.",
      'The linearity property — ∫(cf + g) = c∫f + ∫g — has deep consequences. It means the integral is a linear functional on the space of integrable functions. The set of Riemann-integrable functions on [a, b] forms a vector space, and the map f ↦ ∫ₐᵇ f(x) dx is a linear map from that vector space to ℝ. Linear functionals are central objects in functional analysis and underlie the theory of distributions (which extends integration to "generalized functions" like the Dirac delta). The simple linearity property of the integral is the entry point to one of the richest areas of modern mathematics.',
      "The bound m(b−a) ≤ ∫ₐᵇ f ≤ M(b−a) has a celebrated consequence: the Mean Value Theorem for Integrals. If f is continuous on [a, b], then the average value (1/(b−a))∫ₐᵇ f lies between m and M, and by the Intermediate Value Theorem applied to f, there exists a point c ∈ (a, b) where f(c) equals this average. This MVT for integrals is the integral analog of the derivative MVT and is used in the proof of the Fundamental Theorem of Calculus.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Mean Value Theorem for Integrals",
        body: "If f is continuous on [a, b], then there exists c ∈ (a, b) such that\n\\[\\int_a^b f(x)\\,dx = f(c)(b-a).\\]\nIn other words, f attains its average value at some interior point.",
      },
      {
        type: "warning",
        title: "The Integral Is a Number, Not a Function",
        body: '\\(\\int_a^b f(x)\\,dx\\) is a real number — the value depends on f, a, and b, but not on x. The x is a "dummy variable" that disappears after integration. Do not confuse the definite integral \\(\\int_a^b f(x)\\,dx\\) (a number) with the indefinite integral \\(\\int f(x)\\,dx\\) (a family of functions), or with the accumulation function \\(A(x) = \\int_a^x f(t)\\,dt\\) (a function of the upper limit).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: "ch4-000-ex1",
      title: "Distance from a Triangular Velocity Profile",
      problem:
        "\\text{A car accelerates from rest with velocity } v(t) = 3t \\text{ m/s for } t \\in [0, 4]. \\text{ Find the total distance traveled.}",
      steps: [
        {
          expression:
            "\\text{Graph: } v(t) = 3t \\text{ is a straight line through the origin, reaching } v(4) = 12 \\text{ m/s.}",
          annotation:
            "The velocity-time graph is a straight line from (0,0) to (4,12). The region under it is a right triangle.",
        },
        {
          expression:
            "\\text{Area of triangle} = \\frac{1}{2} \\times \\text{base} \\times \\text{height} = \\frac{1}{2} \\times 4 \\times 12 = 24 \\text{ m}",
          annotation:
            "Distance = area under v(t). The triangle has base 4 (time) and height 12 (speed at t=4).",
        },
        {
          expression:
            "\\int_0^4 3t\\,dt = \\left[\\frac{3t^2}{2}\\right]_0^4 = \\frac{3(16)}{2} - 0 = 24 \\text{ m}",
          annotation:
            "Verification using antiderivatives (from Lesson 3): the antiderivative of 3t is 3t²/2. Evaluating at t=4 and t=0 gives 24 − 0 = 24 m.",
        },
        {
          expression:
            "\\text{The triangle formula and the integral agree: distance} = 24 \\text{ m.}",
          annotation:
            "The geometric and algebraic approaches are two faces of the same calculation.",
        },
      ],
      conclusion:
        "The car travels 24 metres in the first 4 seconds. The velocity-time graph is a right triangle, and its area gives the displacement. This confirms the core idea: distance = area under the velocity curve.",
    },
    {
      id: "ch4-000-ex2",
      title: "Water Tank: Linear Flow Rate",
      problem:
        "\\text{Water flows into a tank at } r(t) = 10 - 2t \\text{ L/min for } t \\in [0, 5]. \\text{ How much total water enters the tank?}",
      steps: [
        {
          expression:
            "\\text{At } t=0: r = 10. \\text{ At } t=5: r = 10 - 10 = 0. \\text{ The flow rate decreases linearly to zero.}",
          annotation:
            "The rate function r(t) is a straight line from 10 (at t=0) to 0 (at t=5). The flow is always non-negative on this interval, so no water flows OUT.",
        },
        {
          expression:
            "\\text{The region under } r(t) \\text{ on } [0,5] \\text{ is a right triangle with base 5 and height 10.}",
          annotation:
            "Draw the graph: r(0)=10, r(5)=0. The region is a right triangle.",
        },
        {
          expression:
            "\\text{Total water} = \\frac{1}{2} \\times 5 \\times 10 = 25 \\text{ L}",
          annotation:
            "Area of right triangle = ½ × base × height = ½ × 5 × 10 = 25 litres.",
        },
        {
          expression:
            "\\int_0^5 (10 - 2t)\\,dt = \\left[10t - t^2\\right]_0^5 = (50 - 25) - 0 = 25 \\text{ L}",
          annotation:
            "Antiderivative confirmation: ∫(10−2t)dt = 10t−t². Evaluated at 5 minus at 0 gives 25.",
        },
      ],
      conclusion:
        "25 litres enter the tank over 5 minutes. The flow rate decreases linearly from 10 to 0, forming a right triangle in the rate-time graph. Area = ½ × 5 × 10 = 25 L.",
    },
    {
      id: "ch4-000-ex3",
      title: "Estimating Distance from a Velocity Graph (No Formula)",
      problem:
        "\\text{A runner's velocity (m/s) is read from a graph at } t = 0, 2, 4, 6, 8, 10 \\text{ s: values are } 0, 3, 5, 4, 2, 0. \\text{ Estimate the total distance.}",
      steps: [
        {
          expression:
            "\\text{No formula is given — we use the area interpretation directly.}",
          annotation:
            "When the velocity function is given as a graph or table, we estimate the area by geometric methods.",
        },
        {
          expression:
            "\\text{Approximation: connect the points with straight lines, compute area as trapezoids.}",
          annotation:
            "Trapezoidal rule: each pair of adjacent readings forms a trapezoid. Area = ½(v₁+v₂) × Δt.",
        },
        {
          expression:
            "[0,2]: \\tfrac{1}{2}(0+3)(2) = 3 \\quad [2,4]: \\tfrac{1}{2}(3+5)(2) = 8 \\quad [4,6]: \\tfrac{1}{2}(5+4)(2) = 9",
          annotation: "Trapezoid areas for the first three intervals.",
        },
        {
          expression:
            "[6,8]: \\tfrac{1}{2}(4+2)(2) = 6 \\quad [8,10]: \\tfrac{1}{2}(2+0)(2) = 2",
          annotation: "Trapezoid areas for the last two intervals.",
        },
        {
          expression:
            "\\text{Total} \\approx 3 + 8 + 9 + 6 + 2 = 28 \\text{ m}",
          annotation:
            "Sum all trapezoid areas. The runner travels approximately 28 metres.",
        },
      ],
      conclusion:
        "Without a formula, we estimate area using trapezoids — averaging adjacent velocity readings and multiplying by the time width. The runner traveled approximately 28 m. This is essentially the trapezoidal rule for numerical integration, covered more formally in Lesson 1.",
    },
    {
      id: "ch4-000-ex4",
      title: "Electricity Usage: Writing the Integral",
      problem:
        "\\text{A building's power consumption is } P(t) = 200 + 50\\cos(\\pi t / 12) \\text{ watts, where } t \\text{ is hours. Write the integral for total energy used over 24 hours, and evaluate the average power.}",
      steps: [
        {
          expression:
            "E = \\int_0^{24} P(t)\\,dt = \\int_0^{24} \\left(200 + 50\\cos\\!\\left(\\frac{\\pi t}{12}\\right)\\right) dt",
          annotation:
            "Total energy (in watt-hours) is the definite integral of power over the 24-hour period.",
        },
        {
          expression:
            "\\int_0^{24} 200\\,dt = 200 \\times 24 = 4800 \\text{ Wh}",
          annotation:
            "The constant term contributes 200 × 24 = 4800 watt-hours (using ∫constant = constant × width).",
        },
        {
          expression:
            "\\int_0^{24} 50\\cos\\!\\left(\\frac{\\pi t}{12}\\right)dt = 50 \\cdot \\frac{12}{\\pi}\\left[\\sin\\!\\left(\\frac{\\pi t}{12}\\right)\\right]_0^{24} = \\frac{600}{\\pi}(\\sin(2\\pi) - \\sin(0)) = 0",
          annotation:
            "The cosine term integrates to zero over a full period (24 hours = 2 full periods of the cosine). The oscillation contributes no net energy.",
        },
        {
          expression: "E = 4800 + 0 = 4800 \\text{ Wh} = 4.8 \\text{ kWh}",
          annotation:
            "Total energy is 4800 watt-hours = 4.8 kilowatt-hours over 24 hours.",
        },
        {
          expression:
            "P_{\\text{avg}} = \\frac{1}{24}\\int_0^{24} P(t)\\,dt = \\frac{4800}{24} = 200 \\text{ W}",
          annotation:
            "Average power = total energy / time. The oscillation averages out; the average power is just the constant term 200 W.",
        },
      ],
      conclusion:
        "Total energy = 4.8 kWh; average power = 200 W. The cosine fluctuation (daytime peaks, nighttime troughs) contributes zero net energy over a full 24-hour cycle. This illustrates the key property: ∫cos = sin, and sin(2π)−sin(0) = 0.",
    },
    {
      id: "ch4-000-ex5",
      title: "CO₂ Accumulation: Interpreting a Definite Integral",
      problem:
        "\\text{Global CO}_2 \\text{ emissions follow } R(t) = 40 + 2t \\text{ billion tonnes/year, where } t \\text{ is years since 2010. Interpret } \\int_0^{10} R(t)\\,dt \\text{ and compute it.}",
      steps: [
        {
          expression: "\\int_0^{10} R(t)\\,dt = \\int_0^{10}(40 + 2t)\\,dt",
          annotation:
            "The integral of an emission rate over time gives the total cumulative emissions over that period — in this case, from 2010 to 2020.",
        },
        {
          expression:
            "= \\left[40t + t^2\\right]_0^{10} = (400 + 100) - 0 = 500 \\text{ billion tonnes}",
          annotation:
            "Antiderivative: ∫(40+2t)dt = 40t+t². Evaluate at t=10: 400+100=500. Subtract the value at t=0 (which is 0).",
        },
        {
          expression:
            "\\text{Interpretation: 500 billion tonnes of CO}_2 \\text{ was emitted globally from 2010 to 2020.}",
          annotation:
            "The definite integral converts the time-varying emission rate into a total cumulative quantity.",
        },
        {
          expression:
            "\\text{Geometric check: trapezoid with } R(0)=40, \\; R(10)=60, \\; \\text{width}=10.",
          annotation:
            "Area = ½(40+60)×10 = ½×100×10 = 500. Confirms the calculation.",
        },
      ],
      conclusion:
        "500 billion tonnes of CO₂ were emitted over the decade. The integral converts a rate (tonnes/year) into a quantity (tonnes), just as integrating speed (m/s) gives distance (m). The units work out: [tonnes/year] × [year] = [tonnes].",
    },
    {
      id: "ch4-000-ex6",
      title: "Physics Derivation: Why Displacement = ∫v dt",
      problem:
        "\\text{Starting from Newton's second law, derive why displacement equals the integral of velocity.}",
      steps: [
        {
          expression: "v(t) = \\frac{dx}{dt}",
          annotation:
            "By definition, velocity is the derivative of position with respect to time. This is the starting point.",
        },
        {
          expression:
            "\\text{Over a tiny time interval } [t, t+dt]: \\; dx \\approx v(t)\\,dt",
          annotation:
            "Rearranging: dx = v(t) dt. The infinitesimal change in position equals velocity times the infinitesimal time step. This is just the linearisation of x(t) over dt.",
        },
        {
          expression:
            "\\text{Total displacement} = \\sum_{\\text{all intervals}} v(t_i)\\,dt",
          annotation:
            "Sum all infinitesimal displacements over the full time interval [a, b]. This is a Riemann sum for v(t).",
        },
        {
          expression:
            "x(b) - x(a) = \\lim_{dt \\to 0} \\sum v(t_i)\\,dt = \\int_a^b v(t)\\,dt",
          annotation:
            "As dt → 0, the sum converges to the definite integral. This is the Fundamental Theorem of Calculus applied to velocity and position.",
        },
        {
          expression:
            "\\text{Similarly, velocity = } \\int a\\,dt \\text{ (momentum accumulates from force: } p = \\int F\\,dt \\text{)}",
          annotation:
            "The same logic gives: velocity = integral of acceleration; momentum = integral of force (impulse-momentum theorem).",
        },
      ],
      conclusion:
        "Displacement = ∫v dt is not a formula imposed from outside — it follows directly from the definition v = dx/dt. The integral undoes the derivative. This is the Fundamental Theorem of Calculus in physical disguise, and it motivates the entire development in Lesson 3.",
    },
  ],

  challenges: [
    {
      id: "ch4-000-ch1",
      difficulty: "easy",
      problem:
        "A car moves at constant velocity v = 30 m/s for t ∈ [0, 5] s. (a) Compute the displacement using the rectangle formula. (b) Write this as a definite integral and verify using the antiderivative.",
      hint: "The velocity-time graph is a horizontal line at v = 30. Area = base × height. The antiderivative of a constant v is vt.",
      walkthrough: [
        {
          expression: "\\text{Prerequisite recall: Displacement } \\Delta x = x(5) - x(0) \\text{ equals the area under the velocity-time graph}",
          annotation: "Velocity is defined as v(t) = dx/dt. By the Fundamental Theorem of Calculus (Part 2), integrating velocity from t=0 to t=5 recovers the exact net change in position: \\Delta x = \\int_0^5 v(t)\\,dt. This holds even if you have never seen integrals before — it is the precise definition that turns 'how fast' into 'how far'."
        },
        {
          expression: "\\text{For constant velocity } v(t) = 30 \\text{ (no t dependence), the integral simplifies to multiplication}",
          annotation: "When v is constant, \\int_a^b c\\,dt = c(b - a). Why? The area is literally a rectangle, and we are about to prove it both geometrically and with calculus so you see why they agree."
        },
        {
          expression: "\\text{(a) Rectangle formula: base = time interval = 5 - 0 = 5\\,\\text{s}, height = velocity = 30\\,\\text{m/s}}",
          annotation: "Draw the v-t graph: a perfectly flat horizontal line at 30 m/s from t=0 to t=5. The region under the curve (above the t-axis) is a rectangle. Area under v-t graph = displacement when v ≥ 0."
        },
        {
          expression: "\\text{Area} = \\text{base} \\times \\text{height} = 5 \\times 30",
          annotation: "No skipping: base is the width along the time axis (Δt), height is the constant height along the velocity axis. Multiplication is allowed because every tiny vertical strip has exactly the same height."
        },
        {
          expression: "5 \\times 30 = 150\\,\\text{m}",
          annotation: "Units check: (seconds) × (meters/second) = meters. This is the physical displacement. We have now solved part (a) completely using pure geometry — no calculus yet."
        },
        {
          expression: "\\text{(b) Write the same quantity as a definite integral: } \\int_0^5 30\\,dt",
          annotation: "We are now using the exact definition of displacement. The number 30 is the constant function v(t). The dt tells us we are integrating with respect to time. This must equal the rectangle answer if calculus is consistent."
        },
        {
          expression: "\\text{Prerequisite: Find the antiderivative (indefinite integral) of the constant 30}",
          annotation: "We need a function F(t) whose derivative is exactly 30: F'(t) = 30. You already know d/dt (kt) = k, so the simplest antiderivative is 30t (the +C constant cancels in the definite integral and can be ignored here)."
        },
        {
          expression: "\\int 30\\,dt = 30t \\quad \\text{(power rule with exponent 0)}",
          annotation: "Power rule reminder: \\int t^n\\,dt = \\frac{t^{n+1}}{n+1} + C for n ≠ -1. Here n = 0 (because 30 = 30·t^0), so \\frac{t^1}{1} = t, multiplied by 30 gives 30t. This is why the antiderivative of any constant is constant × t."
        },
        {
          expression: "\\text{Definite integral by Fundamental Theorem of Calculus: } \\left[30t\\right]_0^5",
          annotation: "FTC Part 2 says \\int_a^b f(t)\\,dt = F(b) - F(a), where F is any antiderivative. We evaluate at the upper limit first, then subtract the value at the lower limit. This is the precise rule — no magic."
        },
        {
          expression: "30 \\cdot 5 - 30 \\cdot 0",
          annotation: "Plug in: at t=5 we get 150; at t=0 we get 0. Subtraction is required by the theorem."
        },
        {
          expression: "150 - 0 = 150\\,\\text{m}",
          annotation: "Both methods (rectangle geometry and antiderivative) give exactly the same 150 m. This verifies consistency and shows why the 'magic' of the integral works — it is just the area rule made rigorous."
        }
      ],
      answer: "\\text{Displacement} = 150 \\text{ m}",
    },
    {
      id: "ch4-000-ch2",
      difficulty: "medium",
      problem:
        "A cyclist's velocity profile is v(t) = 6t − t² m/s for t ∈ [0, 6]. (a) Sketch the velocity-time graph and identify when v = 0. (b) Use the geometric area of a parabolic region to estimate the distance traveled. The exact area under a parabola f(t)=6t−t² from 0 to 6 is ∫₀⁶(6t−t²)dt — compute this using antiderivatives.",
      hint: "v(0) = 0 and v(6) = 0. Maximum velocity at t = 3: v(3) = 9 m/s. The antiderivative of 6t−t² is 3t²−t³/3.",
      walkthrough: [
        {
          expression: "\\text{Prerequisite: v(t) = 6t - t^2 is a quadratic (parabola opening downward)}",
          annotation: "Standard form at² + bt + c with a = -1, b = 6, c = 0. The graph starts at (0,0), rises, then falls back to zero. Since velocity is positive throughout the interval, distance traveled equals displacement = area under the curve."
        },
        {
          expression: "\\text{(a) Find when v = 0 by solving 6t - t^2 = 0}",
          annotation: "Factor completely so we can see the roots (where the graph crosses the t-axis). Factoring is the simplest algebraic technique here."
        },
        {
          expression: "t(6 - t) = 0",
          annotation: "Factor out the common t. Set each factor to zero using the zero-product property (if ab=0 then a=0 or b=0)."
        },
        {
          expression: "t = 0 \\quad \\text{or} \\quad t = 6",
          annotation: "The cyclist starts from rest at t=0 and comes to rest again at t=6. These are the exact times v=0."
        },
        {
          expression: "\\text{Find maximum velocity (vertex of parabola)}",
          annotation: "For ax² + bx + c the vertex is at t = -b/(2a). Here a = -1, b = 6, so t = -6/(2·(-1)) = 3 s. This is where the slope of v(t) is zero (peak speed)."
        },
        {
          expression: "v(3) = 6·3 - 3^2 = 18 - 9 = 9\\,\\text{m/s}",
          annotation: "Plug t=3 into original equation. Maximum speed is 9 m/s at the midpoint — symmetric parabola."
        },
        {
          expression: "\\text{(b) Geometric estimate: approximate area under parabola as triangle with base 6 s and height 9 m/s}",
          annotation: "A quick estimate before exact calculus: inscribed triangle touching the three points (0,0), (3,9), (6,0). Area of triangle = (1/2)·base·height. This underestimates the true parabolic area because the curve bulges above the straight lines."
        },
        {
          expression: "\\frac{1}{2} \\times 6 \\times 9 = 27\\,\\text{m (estimate)}",
          annotation: "We expect the real answer to be larger than 27 m. This is the geometric estimate requested. Now we compute the exact value."
        },
        {
          expression: "\\text{Exact area = } \\int_0^6 (6t - t^2)\\,dt",
          annotation: "By definition, net displacement (and distance, since v ≥ 0) is the definite integral of v(t)."
        },
        {
          expression: "\\text{Find antiderivative term by term}",
          annotation: "Split the integral: \\int (6t - t^2)\\,dt = \\int 6t\\,dt - \\int t^2\\,dt. We integrate each power separately using the power rule."
        },
        {
          expression: "\\int 6t\\,dt = 6 \\cdot \\frac{t^2}{2} = 3t^2",
          annotation: "Power rule: \\int t^1\\,dt = t^2/2, then multiply by coefficient 6. Derivative check: d/dt(3t²) = 6t — correct."
        },
        {
          expression: "\\int t^2\\,dt = \\frac{t^3}{3}",
          annotation: "Power rule: n=2 → t^{3}/3. So the negative term becomes -t³/3. Derivative check: d/dt(-t³/3) = -t² — correct."
        },
        {
          expression: "\\text{Antiderivative F(t) = } 3t^2 - \\frac{t^3}{3}",
          annotation: "Combine both pieces. This F(t) satisfies F'(t) = 6t - t² exactly."
        },
        {
          expression: "\\left[3t^2 - \\frac{t^3}{3}\\right]_0^6",
          annotation: "Apply FTC: evaluate F at upper limit minus F at lower limit."
        },
        {
          expression: "\\text{At t=6: } 3(6)^2 - \\frac{(6)^3}{3} = 3\\cdot 36 - \\frac{216}{3} = 108 - 72",
          annotation: "Compute each part separately: 6²=36, times 3=108. 6³=216, divided by 3=72. Subtraction is exact arithmetic."
        },
        {
          expression: "\\text{At t=0: } 3(0)^2 - \\frac{0^3}{3} = 0",
          annotation: "Every term vanishes at zero — lower limit contribution is always zero here."
        },
        {
          expression: "108 - 72 - 0 = 36\\,\\text{m}",
          annotation: "Exact distance traveled is 36 m. Note that the triangle estimate (27 m) was indeed lower, as expected for a concave-down parabola."
        }
      ],
      answer: "\\displaystyle\\int_0^6 (6t-t^2)\\,dt = 36 \\text{ m}",
    },
    {
      id: "ch4-000-ch3",
      difficulty: "hard",
      problem:
        "A particle moves with velocity v(t) = e^(−t) m/s for t ∈ [0, ∞). (a) Explain why the total distance traveled in infinite time is finite. (b) Compute ∫₀^∞ e^(−t) dt as the limit lim_{b→∞} ∫₀ᵇ e^(−t) dt. (c) Interpret the result physically.",
      hint: "The antiderivative of e^(−t) is −e^(−t). As b→∞, e^(−b)→0. The velocity decays exponentially — the particle slows down so rapidly that it only ever travels a finite total distance.",
      walkthrough: [
        {
          expression: "\\text{Prerequisite: This is an improper integral because the upper limit is ∞}",
          annotation: "We cannot plug ∞ directly into the antiderivative. Instead, we replace ∞ with a finite b and take the limit as b → ∞. This is the official definition of ∫_0^∞ f(t)\\,dt = lim_{b→∞} ∫_0^b f(t)\\,dt (provided the limit exists)."
        },
        {
          expression: "\\text{(a) Why is total distance finite even though time is infinite?}",
          annotation: "Velocity v(t) = e^{-t} decays exponentially to zero. Exponential decay is faster than any polynomial growth, so the area under the curve 'tails off' quickly enough that the infinite sum of shrinking strips still adds to a finite number. Analogy: the infinite geometric series 1 + 1/2 + 1/4 + 1/8 + … = 2 (finite)."
        },
        {
          expression: "\\text{(b) First compute the proper integral from 0 to b: } \\int_0^b e^{-t}\\,dt",
          annotation: "Treat b as a large but finite number for now. We will let b grow later."
        },
        {
          expression: "\\text{Antiderivative of } e^{-t}",
          annotation: "Let u = -t, then du = -dt so dt = -du. The integral becomes -∫e^u du = -e^u = -e^{-t}. Derivative check: d/dt(-e^{-t}) = e^{-t} — correct."
        },
        {
          expression: "\\left[-e^{-t}\\right]_0^b = -e^{-b} - (-e^0)",
          annotation: "FTC: upper minus lower. At t=b: -e^{-b}. At t=0: -e^0 = -1, so we subtract (-1) which is +1."
        },
        {
          expression: "-e^{-b} + 1",
          annotation: "Simplified: 1 - e^{-b}. This is the exact displacement up to any finite time b."
        },
        {
          expression: "\\lim_{b \\to \\infty} (1 - e^{-b})",
          annotation: "Now take the limit. As b becomes arbitrarily large, what happens to e^{-b}?"
        },
        {
          expression: "e^{-b} \\to 0 \\quad \\text{(exponential decay property)}",
          annotation: "Any positive number raised to a larger and larger negative power gets smaller and smaller, approaching zero. This is a standard limit you can prove with L'Hôpital or just by knowing exponential behavior."
        },
        {
          expression: "1 - 0 = 1\\,\\text{m}",
          annotation: "The improper integral converges to exactly 1 meter. The infinite area is finite!"
        },
        {
          expression: "\\text{(c) Physical interpretation}",
          annotation: "The particle starts at v(0) = 1 m/s. Its speed decreases exponentially fast (halving roughly every 0.693 s). Even though it never quite stops and time goes on forever, the distances it covers in later and later seconds become vanishingly small. Total distance traveled is exactly 1 m; it asymptotically approaches a fixed position 1 m ahead."
        },
        {
          expression: "\\text{Analogy to geometric series: each second the distance covered is roughly half the previous}",
          annotation: "The continuous version of 1 + 1/2 + 1/4 + … sums to a finite total, just like the integral here. This shows how 'infinite time' can still produce finite displacement when deceleration is strong enough."
        }
      ],
      answer: "\\displaystyle\\int_0^\\infty e^{-t}\\,dt = 1 \\text{ m}",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "riemann-sums",
      label: "Riemann Sums",
      context:
        "This lesson introduced area informally. Lesson 1 makes it precise via Riemann sums — the rigorous limiting process that defines the definite integral.",
    },
    {
      lessonSlug: "fundamental-theorem",
      label: "Fundamental Theorem of Calculus",
      context:
        "The connection between area (integration) and antiderivatives (differentiation) is made explicit by the Fundamental Theorem in Lesson 3. Everything in this lesson anticipates that theorem.",
    },
    {
      lessonSlug: "indefinite-integrals",
      label: "Indefinite Integrals",
      context:
        "Computing definite integrals algebraically requires antiderivatives. Lesson 4 builds the antiderivative toolkit.",
    },
  ],

  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "area under a curve",
        meaning:
          "the region between the function graph and the x-axis — counted positively above, negatively below",
      },
      {
        symbol: "accumulation",
        meaning: "the running total of the area as the upper limit x increases",
      },
      {
        symbol: "signed area",
        meaning:
          "area above x-axis is positive; area below is negative — the two can cancel",
      },
    ],
    rulesOfThumb: [
      "Think physically: if f(t) is rate of flow (gallons/min), the area under f from 0 to T is total gallons accumulated.",
      "The accumulation function A(x) = ∫₀ˣ f(t) dt is a new function of x — its derivative is f(x) (this is the FTC!).",
      "Negative regions do not mean the area calculation is wrong — they represent net change, not total change.",
    ],
  },

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: "ch2-tangent-problem",
        label: "Ch. 2: The Derivative",
        note: "The derivative asks: how fast is f changing at x? The integral asks: how much of f has accumulated from a to x? These are inverse questions — and the FTC makes that inversion precise.",
      },
    ],
    futureLinks: [
      {
        lessonId: "ch4-riemann-sums",
        label: "Next: Riemann Sums",
        note: "Area accumulation is formalized through Riemann sums — approximating curved areas with rectangles. The limit of those sums defines the definite integral.",
      },
      {
        lessonId: "ch4-fundamental-theorem",
        label: "Ch. 4: Fundamental Theorem",
        note: "FTC Part 1 says: d/dx[A(x)] = f(x). The derivative of the accumulation function is f itself. This lesson introduces that idea intuitively before the formal proof.",
      },
    ],
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "aa-assess-1",
        type: "choice",
        text: "If f(t) is the rate of fuel consumption in gallons/hour, what does ∫₀³ f(t) dt represent?",
        options: [
          "The fuel consumption rate at t=3",
          "Total gallons consumed from hour 0 to hour 3",
          "Average consumption rate",
          "Instantaneous rate at some moment",
        ],
        answer: "Total gallons consumed from hour 0 to hour 3",
        hint: "Integrating a rate gives accumulated quantity. Area under a rate curve = total amount.",
      },
    ],
  },

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Integral = accumulated area (signed: positive above, negative below)",
    "Rate × time = amount (integral generalizes this)",
    "A(x) = ∫₀ˣ f(t) dt is a new function; its derivative is f(x)",
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
    "attempted-challenge-easy",
    "attempted-challenge-medium",
    "attempted-challenge-hard",
  ],

  quiz: [
    {
      id: "area-accum-q1",
      type: "input",
      text: "A car moves with velocity \\(v(t) = 4\\) m/s (constant) for \\(t \\in [0, 5]\\). The displacement equals the area of the rectangle under the velocity curve. What is the displacement (in metres)?",
      answer: "20",
      hints: [
        "Area of a rectangle = width × height.",
        "Width = 5 − 0 = 5, height = 4.",
      ],
      reviewSection: "Intuition — Area as accumulation",
    },
    {
      id: "area-accum-q2",
      type: "input",
      text: "A car accelerates from rest with velocity \\(v(t) = 6t\\) m/s. The velocity–time graph is a straight line through the origin. Use geometry (triangle area) to find the total displacement from \\(t = 0\\) to \\(t = 4\\).",
      answer: "48",
      hints: [
        "The region under \\(v(t)=6t\\) on [0,4] is a right triangle.",
        "Area = ½ × base × height. Height = v(4) = 24.",
      ],
      reviewSection: "Intuition — Triangular area for linear rate",
    },
    {
      id: "area-accum-q3",
      type: "choice",
      text: "The definite integral \\(\\int_a^b f(x)\\,dx\\) computes:",
      options: [
        "The slope of \\(f\\) at \\(x = a\\)",
        "The net signed area between \\(f\\) and the \\(x\\)-axis on \\([a,b]\\)",
        "The maximum value of \\(f\\) on \\([a,b]\\)",
        "The average rate of change of \\(f\\) on \\([a,b]\\)",
      ],
      answer:
        "The net signed area between \\(f\\) and the \\(x\\)-axis on \\([a,b]\\)",
      hints: ["Regions above the axis are positive, below are negative."],
      reviewSection: "Intuition — Signed area",
    },
    {
      id: "area-accum-q4",
      type: "input",
      text: "Using geometry, evaluate \\(\\int_0^3 2x\\,dx\\). The graph is a straight line through the origin; the region under it is a triangle.",
      answer: "9",
      hints: [
        "Area = ½ × base × height.",
        "At x = 3, f(3) = 6. So area = ½ × 3 × 6.",
      ],
      reviewSection: "Math — Geometric evaluation",
    },
    {
      id: "area-accum-q5",
      type: "input",
      text: "The accumulation function is defined as \\(A(x) = \\int_0^x f(t)\\,dt\\). If \\(f(t) = 3\\) (constant), what is \\(A(5)\\)?",
      answer: "15",
      hints: ["A(x) = 3x for a constant rate of 3.", "A(5) = 3 × 5."],
      reviewSection: "Math — Accumulation function",
    },
    {
      id: "area-accum-q6",
      type: "choice",
      text: "If \\(f(x) < 0\\) on the interval \\([a,b]\\), then \\(\\int_a^b f(x)\\,dx\\) is:",
      options: ["Positive", "Zero", "Negative", "Undefined"],
      answer: "Negative",
      hints: [
        "Area below the \\(x\\)-axis contributes negatively to the signed integral.",
      ],
      reviewSection: "Intuition — Signed area",
    },
    {
      id: "area-accum-q7",
      type: "input",
      text: "A pump runs at rate \\(r(t) = 10\\) litres/min for 3 minutes, then at \\(r(t) = 5\\) litres/min for 2 minutes. What is the total volume (litres) accumulated?",
      answer: "40",
      hints: ["Split into two constant-rate intervals.", "Total = 10×3 + 5×2."],
      reviewSection: "Intuition — Piecewise accumulation",
    },
    {
      id: "area-accum-q8",
      type: "input",
      text: "Using geometry, evaluate \\(\\int_{-2}^{2} \\sqrt{4 - x^2}\\,dx\\). The graph of \\(y = \\sqrt{4-x^2}\\) is the upper half of a circle of radius 2.",
      answer: "2*pi",
      hints: [
        "Area of a semicircle of radius \\(r\\) is \\(\\frac{1}{2}\\pi r^2\\).",
        "Here \\(r = 2\\), so area = ½π(4) = 2π.",
      ],
      reviewSection: "Math — Geometric evaluation (semicircle)",
    },
    {
      id: "area-accum-q9",
      type: "choice",
      text: "The elongated S symbol \\(\\int\\) in integral notation was chosen by Leibniz to represent:",
      options: ["Slope", "Sum", "Surface", "Secant"],
      answer: "Sum",
      hints: ["The integral is defined as a limit of sums of thin rectangles."],
      reviewSection: "Intuition — Notation",
    },
    {
      id: "area-accum-q10",
      type: "input",
      text: "A velocity function is \\(v(t) = t\\) on \\([0, 6]\\). The car travels from \\(t=0\\) to \\(t=6\\). Use the triangle area formula to find the total displacement.",
      answer: "18",
      hints: [
        "The area is a right triangle with base 6 and height v(6) = 6.",
        "Area = ½ × 6 × 6 = 18.",
      ],
      reviewSection: "Intuition — Triangle area for linear velocity",
    },
  ],
};
