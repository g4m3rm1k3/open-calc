export default {
  id: "ch2-005",
  slug: "acceleration-graph-analysis",
  chapter: 2,
  order: 5,
  title: "Acceleration-Time Graph Analysis",
  subtitle: "Use a–t graphs to predict how velocity — and therefore position — evolves over time.",
  tags: ["acceleration graph", "delta v", "kinematics", "integration chain", "jerk"],
  aliases: "a t graph change in velocity acceleration kinematics",

  hook: {
    question:
      "An elevator's control system receives an acceleration command: +2 m/s² for 3 s, then 0 m/s² for 4 s, then −3 m/s² until it stops. You have the a–t graph. Can you figure out the complete velocity and position history — and how long the whole ride takes?",
    realWorldContext:
      "Rocket guidance, aircraft autopilots, and prosthetic limb controllers all operate on acceleration commands rather than position targets. The controller specifies an a–t profile; integrating it gives the velocity profile; integrating again gives position. This is how GPS receivers and inertial navigation systems reconstruct position from accelerometer data — a process called dead reckoning. The accuracy of navigation depends directly on how well you can integrate an a–t signal.",
    previewVisualizationId: "AccelerationGraphIntuition",
  },

  intuition: {
    prose: [
      "An a–t graph tells you how rapidly velocity is changing at every moment. Just as a v–t graph told you about position changes, the a–t graph tells you about velocity changes. The height of the curve gives acceleration at that instant: positive means velocity is increasing, negative means velocity is decreasing, zero means constant velocity.",
      "The area under an a–t graph gives the change in velocity. This is the same 'area gives change' rule as in the v–t lesson — applied one level up the differentiation chain. If acceleration is +2 m/s² for 3 seconds, the area is 2 × 3 = 6, so velocity increases by 6 m/s. The shape of the curve tells you the story of how quickly velocity is changing; the area tells you by how much.",
      "You can read the three-level kinematic chain directly from a–t graphs: differentiation goes downhill (slope of x–t gives v; slope of v–t gives a), and integration goes uphill (area under a–t gives Δv; area under v–t gives Δx). The a–t graph is at the top of the chain — it contains all the information needed to reconstruct the entire motion, as long as you know where the object started (initial position and velocity).",
      "Constant acceleration is the special case where a–t is a flat horizontal line. In this case, the area is just a rectangle (a × Δt = Δv), and the resulting v–t graph is a straight line. This is the world of SUVAT: all five kinematic equations come from integrating constant-acceleration a–t graphs twice. Once acceleration varies, SUVAT breaks down and you need calculus.",
      "Jerk is the rate of change of acceleration — the slope of the a–t graph. It matters more than you might expect: elevator designers minimize jerk (not just acceleration) because humans feel sudden changes in acceleration as discomfort. Smooth rides have gentle a–t slopes. An a–t graph with sudden jumps (high jerk) causes the lurching feeling in old elevators.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "The Kinematic Chain",
        body: "position x(t) → differentiate → velocity v(t) → differentiate → acceleration a(t). Going the other way: integrate a(t) → velocity change Δv; integrate v(t) → displacement Δx. The a–t graph sits at the top of this chain. Calculus is what makes the chain exact; geometry (area of shapes) gives you the algebra-level approximation.",
      },
      {
        type: "intuition",
        title: "Piece-by-Piece Reconstruction",
        body: "Starting from an a–t graph, reconstruct velocity step by step: pick a starting velocity v₀, add each area segment to get the running velocity. Then reconstruct position from the resulting v–t graph. This is dead reckoning — used in navigation, robotics, and spaceflight. The only inputs needed are the initial conditions (x₀, v₀) and the a–t profile.",
      },
      {
        type: "tip",
        title: "Calculus Connection: Double Integration",
        body: "If you know a(t) as a function, you can recover v(t) and x(t) by integrating twice: v(t) = v₀ + ∫a(t) dt, then x(t) = x₀ + ∫v(t) dt. This is exactly what solving an ordinary differential equation means: a = d²x/dt² is a second-order ODE, and finding x(t) is solving it. Calculus Chapter 4 (Integration) develops the tools; for simple cases, SUVAT equations are already the solution.",
      },
      {
        type: "misconception",
        title: "Constant a ≠ Constant v",
        body: "A flat (constant) a–t graph does NOT mean constant velocity — it means velocity changes at a constant rate. If a = −9.8 m/s², velocity decreases by 9.8 m/s every second. Only if a = 0 is velocity constant. This is the most common confusion in reading a–t graphs.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-rectangle' },
        title: 'Algebra: Δv = a·Δt (constant acceleration)',
        caption: 'For constant acceleration, Δv = a·Δt — exactly the same rectangle-area logic as Δx = v·Δt. Integrate a once to get v, integrate v once to get x. Two steps, both with the same algebraic idea.',
      },
      {
        id: "AccelerationGraphIntuition",
        title: "Area under a–t is Δv",
        mathBridge:
          "Move the interval and watch velocity update from accumulated acceleration.",
        caption: "Acceleration accumulates into velocity.",
      },
      {
        id: "TripleGraphExplorer",
        title: "x-v-a linked explorer",
        mathBridge:
          "See the same motion represented in all three graphs simultaneously — change one and watch the others update.",
        caption: "Consistency check across all three representations.",
      },
    ],
  },

  math: {
    prose: [
      "For any a–t graph, the change in velocity over [t₁, t₂] equals the signed area under the curve over that interval: Δv = ∫_{t₁}^{t₂} a(t) dt. For piece-wise constant or linear acceleration, this area is computed geometrically (rectangles and triangles). If you know v₀ and the area, you know the final velocity: v(t₂) = v₀ + Δv.",
      "For constant acceleration a, the area is simply a·Δt, giving v = v₀ + aΔt. This is the first SUVAT equation. Substituting this into the v–t area formula (Δx = ∫v dt) and integrating gives the second SUVAT equation: x = x₀ + v₀t + ½at². Both equations follow by integrating the constant-a a–t graph twice.",
      "For variable acceleration a(t), you must integrate analytically: first to get v(t) = v₀ + ∫a(t)dt, then to get x(t) = x₀ + ∫v(t)dt. In general physics problems, a(t) might be sinusoidal (oscillating systems), exponential (drag-limited motion), or defined piecewise (engine thrust profiles).",
    ],
    callouts: [
      {
        type: "definition",
        title: "Velocity update from acceleration",
        body: "v(t) = v_0 + \\int_0^t a(t')\\,dt'",
      },
      {
        type: "definition",
        title: "Constant acceleration: area rule",
        body: "\\Delta v = a\\,\\Delta t \\quad \\Longrightarrow \\quad v = v_0 + a\\,t",
      },
      {
        type: "definition",
        title: "SUVAT via double integration",
        body: "x(t) = x_0 + v_0 t + \\tfrac{1}{2}a t^2",
      },
      {
        type: "technique",
        title: "Step-by-Step Reconstruction from a–t",
        body: "1. Identify a–t segments (constant or linear pieces). 2. For each segment, compute area (rectangle or triangle) → get Δv. 3. Add Δv to running v to get final velocity for that segment. 4. Use the resulting v–t to compute Δx (area under v–t). 5. Add Δx to running x. Repeat for each segment.",
      },
    ],
    visualizations: [
      {
        id: "KinematicsFormRecogniser",
        title: "Equation recall",
        mathBridge:
          "Reinforce which formulas come directly from integrating acceleration.",
        caption: "Area and formulas should match numerically.",
      },
    ],
  },

  rigor: {
    title: "Deriving Δv from a–t — and SUVAT from double integration",
    prose: [
      "The area-under-a-gives-Δv rule is the FTC applied to the (v, a) pair: since a = dv/dt, by the FTC, ∫_{t₁}^{t₂} a(t)dt = v(t₂) − v(t₁) = Δv. Applying the same argument one level down: since v = dx/dt, ∫_{t₁}^{t₂} v(t)dt = x(t₂) − x(t₁) = Δx.",
      "For constant acceleration a, the double integration produces SUVAT exactly: v(t) = v₀ + at (integrate a), then x(t) = x₀ + ∫(v₀ + at)dt = x₀ + v₀t + ½at² (integrate v). The kinematic equations are not empirical rules — they are antiderivatives of the constant-acceleration definition. Every SUVAT equation is a theorem in calculus.",
    ],
    visualizationId: "TripleGraphExplorer",
    proofSteps: [
      {
        expression: "a(t) = \\frac{dv}{dt}",
        annotation: "Definition: acceleration is the derivative of velocity.",
      },
      {
        expression: "\\int_{t_1}^{t_2} a(t)\\,dt = v(t_2) - v(t_1) = \\Delta v",
        annotation: "FTC applied: area under a–t gives Δv.",
      },
      {
        expression: "v(t) = v_0 + \\int_0^t a\\,dt' = v_0 + at \\quad (\\text{constant }a)",
        annotation: "First integration: gives the v–t equation.",
      },
      {
        expression: "x(t) = x_0 + \\int_0^t v\\,dt' = x_0 + v_0 t + \\tfrac{1}{2}at^2",
        annotation: "Second integration: gives the x–t equation (SUVAT).",
      },
    ],
  },

  examples: [
    {
      id: "ch2-005-ex1",
      title: "Constant acceleration — velocity update",
      problem:
        "An object starts at v₀ = 3 m/s. It experiences a constant acceleration of a = −1.5 m/s² for 4 seconds. Find its final velocity.",
      steps: [
        {
          expression: "\\Delta v = a \\cdot \\Delta t = (-1.5)(4) = -6 \\text{ m/s}",
          annotation: "Area under the constant a–t graph is a rectangle.",
        },
        {
          expression: "v = v_0 + \\Delta v = 3 + (-6) = -3 \\text{ m/s}",
          annotation: "Final velocity: started positive, ended negative (reversed direction).",
        },
      ],
      conclusion:
        "Final velocity is −3 m/s. The object slowed, stopped, and reversed. You can confirm: v crosses zero at t = 3/1.5 = 2 s.",
    },
    {
      id: "ch2-005-ex2",
      title: "Piece-wise acceleration — reconstruct v(t)",
      problem:
        "An object starts at rest. a–t graph: a = +4 m/s² for t ∈ [0, 3], then a = 0 for t ∈ [3, 5], then a = −2 m/s² for t ∈ [5, 9]. Find v at t = 9.",
      steps: [
        {
          expression: "\\Delta v_1 = (4)(3) = +12 \\text{ m/s} \\Rightarrow v(3) = 12 \\text{ m/s}",
          annotation: "Phase 1: accelerating. Rectangle area = 12.",
        },
        {
          expression: "\\Delta v_2 = (0)(2) = 0 \\Rightarrow v(5) = 12 \\text{ m/s}",
          annotation: "Phase 2: constant velocity. No area, velocity unchanged.",
        },
        {
          expression: "\\Delta v_3 = (-2)(4) = -8 \\text{ m/s} \\Rightarrow v(9) = 12 - 8 = 4 \\text{ m/s}",
          annotation: "Phase 3: decelerating. Rectangle area = −8.",
        },
      ],
      conclusion:
        "Final velocity at t = 9 is 4 m/s. The object is still moving forward, but slower than its peak speed.",
    },
  ],

  challenges: [
    {
      id: "ch2-005-ch1",
      difficulty: "medium",
      problem: "Can acceleration be zero while velocity is nonzero?",
      hint: "Think about what zero acceleration means on a v–t graph.",
      answer:
        "Yes — zero acceleration means the slope of v–t is zero, i.e., velocity is constant and nonzero. Cruise control: constant 60 mph, zero acceleration. Acceleration measures change in velocity, not velocity itself.",
    },
    {
      id: "ch2-005-ch2",
      difficulty: "hard",
      problem:
        "An object starts from rest at x = 0. Its acceleration is a(t) = 6t m/s² (increasing linearly). Find v(t) and x(t) analytically, then find x at t = 4 s.",
      hint: "Integrate a(t) to get v(t), then integrate again to get x(t).",
      answer:
        "v(t) = ∫6t dt = 3t² + C₁. With v(0) = 0: v(t) = 3t². Then x(t) = ∫3t² dt = t³ + C₂. With x(0) = 0: x(t) = t³. At t = 4: x = 64 m. Note: this is NOT solvable with SUVAT because a is not constant.",
    },
  ],
};
