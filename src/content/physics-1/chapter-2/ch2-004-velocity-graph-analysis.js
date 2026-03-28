export default {
  id: "ch2-004",
  slug: "velocity-graph-analysis",
  chapter: 2,
  order: 4,
  title: "Velocity-Time Graph Analysis",
  subtitle:
    "On a v–t graph, slope gives acceleration and signed area gives displacement.",
  tags: ["velocity graph", "area", "acceleration", "displacement", "integration", "fundamental theorem"],
  aliases: "v t graph area displacement acceleration",

  hook: {
    question:
      "A car is moving at 20 m/s and braking hard. Its velocity decreases steadily to zero over 4 seconds. How far does it travel while braking? You have a v–t graph — but no position data at all. Can you find the distance from velocity alone?",
    realWorldContext:
      "Brake testing, landing distance calculations, and elevator control all rely on computing displacement from velocity profiles. Crash reconstructionists use v–t graphs — not x–t graphs — because velocity data is easier to measure from impact sensors and black boxes. The area under the v–t curve tells you exactly how far the object moved, without ever knowing where it started.",
    previewVisualizationId: "VelocityGraphIntuition",
  },

  intuition: {
    prose: [
      "A v–t graph tells you how fast an object is moving at every moment in time. The height of the curve at any time gives the instantaneous velocity at that moment: up means moving in the positive direction, down means moving in the negative direction, crossing zero means reversing direction.",
      "The most powerful thing you can read from a v–t graph is displacement — not by looking at height, but by looking at area. The signed area between the curve and the time-axis, over any interval, equals the displacement during that interval. This is the fundamental bridge between velocity and position: area under v–t gives Δx, just as slope on x–t gave velocity.",
      "Why area? Think about what happens when velocity is constant. If you travel at 10 m/s for 4 seconds, your displacement is 10 × 4 = 40 m. On a v–t graph, this is a horizontal line at height 10 over a width of 4 — a rectangle with area 10 × 4 = 40. Displacement IS area when velocity is constant. For varying velocity, the area rule still holds, but the 'area' is under a curve — this is exactly what an integral measures.",
      "The slope of the v–t curve tells you acceleration. Just as velocity was the slope of x–t, acceleration is the slope of v–t. Positive slope (velocity increasing) means positive acceleration. Negative slope (velocity decreasing) means the object is decelerating — it could still be moving forward, but slowing down. Flat slope (constant velocity) means zero acceleration.",
      "An important distinction: speed is the magnitude of velocity, not velocity itself. If a car moves backward at 15 m/s, its velocity is −15 m/s but its speed is 15 m/s. The signed area under v–t gives displacement (which can be negative); the unsigned area (treating all area as positive) gives total distance traveled. These are different things when the object reverses direction.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "Area of Simple Shapes",
        body: "For a v–t graph made of straight-line segments, area is always a sum of rectangles and triangles: area of rectangle = base × height; area of triangle = ½ × base × height. You can compute displacement exactly from piece-wise linear v–t graphs using just this algebra — no calculus required.",
      },
      {
        type: "intuition",
        title: "Two Ways to Read a v–t Graph",
        body: "SLOPE of v–t → acceleration (how fast velocity is changing). AREA under v–t → displacement (how far the object moved). These are opposite operations: slope is differentiation, area is integration. The v–t graph is where the entire story of kinematics lives.",
      },
      {
        type: "tip",
        title: "Calculus Connection: Area → Integral",
        body: "The area under a v–t curve is a definite integral: Δx = ∫v(t) dt. When velocity is not constant, you cannot compute this area exactly without calculus. Riemann sums (from Calculus Chapter 4) formalize this: divide time into tiny intervals, approximate velocity as constant on each, sum the rectangles, take the limit. The exact area is the integral. The Fundamental Theorem of Calculus is what guarantees that anti-differentiation gives the exact area — so ∫v dt = x(t) + C.",
      },
      {
        type: "warning",
        title: "Displacement ≠ Distance",
        body: "If an object goes forward 20 m then backward 8 m, its displacement is +12 m but its total distance traveled is 28 m. On a v–t graph: positive area (v > 0) adds to displacement; negative area (v < 0) subtracts from displacement. To find total distance, take the absolute value of each signed area and sum them. This distinction matters in problems about 'how far did the object travel' vs 'where did it end up'.",
      },
    ],
    visualizations: [
      {
        id: "VelocityGraphIntuition",
        title: "Area under v–t is displacement",
        mathBridge:
          "Adjust segments and see positive/negative area accumulate into net displacement.",
        caption: "Area tracks where you end up.",
      },
      {
        id: "VelocityGraphExplorer",
        title: "Signed-area explorer",
        mathBridge:
          "Compare total distance and net displacement from the same v–t plot.",
        caption: "Direction lives in the sign.",
      },
    ],
  },

  math: {
    prose: [
      "For a piece-wise linear v–t graph, compute displacement as a sum of triangle and rectangle areas. Each segment is a trapezoid (or special case: rectangle if velocity is constant, triangle if it starts or ends at zero). Sum the signed areas, taking areas above the time-axis as positive and areas below as negative.",
      "For constant acceleration, v(t) = v₀ + at is a straight line on the v–t graph. The area under this line over [0, t] is the area of a trapezoid: Δx = ½(v₀ + v)t. This is one of the SUVAT equations derived purely geometrically, no calculus needed. Substituting v = v₀ + at gives Δx = v₀t + ½at², the quadratic kinematic formula.",
      "For non-constant acceleration, you cannot compute the area exactly by geometry alone. You must integrate: Δx = ∫v(t) dt. In calculus terms, position is the anti-derivative of velocity: if you know v(t), integrate to get x(t). Acceleration is the derivative of velocity: a(t) = dv/dt. These three quantities — x, v, a — are linked by differentiation and integration in an unbroken chain.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Displacement from velocity",
        body: "\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt",
      },
      {
        type: "definition",
        title: "Acceleration from velocity",
        body: "a(t) = \\frac{dv}{dt}",
      },
      {
        type: "definition",
        title: "SUVAT from area (constant a)",
        body: "\\Delta x = \\frac{1}{2}(v_0 + v)\\,t = v_0 t + \\frac{1}{2}at^2",
      },
      {
        type: "technique",
        title: "Algebra-Only Area Method",
        body: "Step 1: Identify linear segments on the v–t graph. Step 2: For each segment, find area = ½(v₁ + v₂)(t₂ − t₁) (trapezoid rule). Step 3: Assign sign: + if above t-axis (forward motion), − if below (backward motion). Step 4: Sum all signed areas → displacement.",
      },
    ],
    visualizations: [
      {
        id: "KinematicEquationSelector",
        title: "Pick equation from knowns",
        mathBridge: "Connect graph-derived knowns to the right SUVAT equation.",
        caption: "Graph interpretation feeds algebraic solving.",
      },
    ],
  },

  rigor: {
    title: "Why area gives displacement — the Fundamental Theorem of Calculus",
    prose: [
      "The area-under-v-gives-Δx rule is not a coincidence or a useful trick — it is a consequence of the Fundamental Theorem of Calculus (FTC). The FTC states: if F is an antiderivative of f (meaning F'(t) = f(t)), then ∫_{a}^{b} f(t) dt = F(b) − F(a).",
      "In kinematics: velocity v(t) is the derivative of position x(t). So x(t) is an antiderivative of v(t). By the FTC, ∫_{t_1}^{t_2} v(t) dt = x(t₂) − x(t₁) = Δx. The area under v–t is displacement because position is the antiderivative of velocity — and the FTC converts antiderivatives into definite integrals (areas). This is why differentiation and integration are inverse operations.",
      "For a formal derivation, Riemann sums make the connection explicit: divide [t₁, t₂] into n equal subintervals of width Δt. On each subinterval, approximate velocity as constant at v(tₖ). Displacement contribution from each piece ≈ v(tₖ)·Δt. Total displacement ≈ Σ v(tₖ)Δt. As n → ∞ (Δt → 0), this Riemann sum converges to the definite integral ∫v dt. This is exactly how integrals are defined in Calculus Chapter 4.",
    ],
    visualizationId: "KinematicProof",
    proofSteps: [
      {
        expression: "a(t) = \\frac{dv}{dt}",
        annotation: "Acceleration is the derivative of velocity (slope of v–t).",
      },
      {
        expression: "v(t) = \\frac{dx}{dt}",
        annotation: "Velocity is the derivative of position (slope of x–t).",
      },
      {
        expression: "\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt",
        annotation: "By FTC: since v = dx/dt, the antiderivative of v is x, so the definite integral gives Δx.",
      },
      {
        expression: "\\Delta v = \\int_{t_1}^{t_2} a(t)\\,dt",
        annotation: "Applying the same logic one level up: area under a–t gives Δv.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-004-ex1",
      title: "Triangular area — braking car",
      problem:
        "A car decelerates uniformly from v = 20 m/s to v = 0 over 4 seconds. Find displacement during braking.",
      steps: [
        {
          expression:
            "\\text{Shape: right triangle with base } \\Delta t = 4\\text{ s, height } v_0 = 20\\text{ m/s}",
          annotation: "Velocity decreases linearly: straight line from 20 to 0 on v–t.",
        },
        {
          expression: "\\Delta x = \\frac{1}{2}(4)(20) = 40\\text{ m}",
          annotation: "Area of triangle = ½ × base × height.",
        },
      ],
      conclusion:
        "The car travels 40 m while braking. You can verify: v = 0, v₀ = 20, t = 4 → Δx = ½(v₀+v)t = ½(20)(4) = 40 m. ✓",
    },
    {
      id: "ch2-004-ex2",
      title: "Displacement with direction reversal",
      problem:
        "v–t graph shows: v = +6 m/s for 3 s (forward), then v = −4 m/s for 2 s (backward). Find (a) net displacement and (b) total distance.",
      steps: [
        {
          expression: "\\text{Area}_1 = (+6)(3) = +18\\text{ m}",
          annotation: "Forward phase: rectangle above the time-axis.",
        },
        {
          expression: "\\text{Area}_2 = (-4)(2) = -8\\text{ m}",
          annotation: "Backward phase: rectangle below the time-axis.",
        },
        {
          expression: "\\Delta x = +18 + (-8) = +10\\text{ m (net displacement)}",
          annotation: "Signed areas sum to net displacement.",
        },
        {
          expression: "d = 18 + 8 = 26\\text{ m (total distance)}",
          annotation: "Unsigned areas sum to total distance traveled.",
        },
      ],
      conclusion:
        "Net displacement = +10 m (10 m in the positive direction from start). Total distance = 26 m.",
    },
  ],

  challenges: [
    {
      id: "ch2-004-ch1",
      difficulty: "medium",
      problem: "If v is positive but decreasing, what is the sign of a, and is the object speeding up or slowing down?",
      hint: "Look at the slope of v–t.",
      answer:
        "a is negative (slope of v–t is negative: velocity decreasing). The object is moving in the positive direction (v > 0) but slowing down — velocity and acceleration have opposite signs, so speed decreases.",
    },
    {
      id: "ch2-004-ch2",
      difficulty: "hard",
      problem:
        "A v–t graph shows a quarter-circle of radius 10: v(t) = √(100 - t²) for t ∈ [0, 10]. Find the exact displacement. (Hint: area of a quarter circle.)",
      hint: "The area under this curve is the area of a quarter-disk of radius 10.",
      answer:
        "Δx = ∫₀¹⁰ √(100 - t²) dt = ¼ π(10)² = 25π ≈ 78.5 m. This requires calculus (trigonometric substitution or geometry: area of a quarter circle).",
    },
  ],
};
