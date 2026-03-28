export default {
  id: "ch2-006",
  slug: "linked-motion-graphs",
  chapter: 2,
  order: 6,
  title: "Linking x(t), v(t), and a(t)",
  subtitle:
    "One motion, three graphs. Differentiate downward, integrate upward — and never lose the thread.",
  tags: ["triple graph", "derivative chain", "integral chain", "kinematics", "differentiation", "integration"],
  aliases: "x v a relationship triple graphs position velocity acceleration linked",

  hook: {
    question:
      "An engineering team has three screens: one showing x(t), one showing v(t), and one showing a(t) for the same rocket launch. Suddenly, x(t) shows a brief pause in climb. What must v(t) and a(t) look like at that moment? Can you predict the shape of all three screens from just one of them?",
    realWorldContext:
      "Flight computers, robotics trajectory planners, and biomechanics labs routinely transform between these three representations. A physical therapist analyzing a patient's gait reads x(t) from motion capture, then computes v(t) and a(t) numerically to detect muscle force abnormalities. A rocket guidance system compares commanded a(t) against measured a(t) from an accelerometer, then integrates twice to estimate x(t). Understanding the three-graph chain — and how to move up and down it — is the core skill that connects physics to calculus.",
    previewVisualizationId: "TripleGraphIntuition",
  },

  intuition: {
    prose: [
      "Position, velocity, and acceleration are not three separate things — they are one motion described three different ways. Every physical trajectory generates all three graphs simultaneously. If you know any one of them completely (plus initial conditions), you can reconstruct the other two exactly. The chain is: x(t) → differentiate → v(t) → differentiate → a(t), and in reverse: a(t) → integrate → v(t) → integrate → x(t).",
      "Reading the chain downward (differentiation): the slope of x(t) at each moment is v(t) at that moment. When the x-graph climbs steeply, the v-graph is large and positive. When x peaks (flat tangent), v = 0. When x descends, v is negative. Apply the same logic one more time: the slope of v(t) is a(t). When v is increasing (v-graph climbs), a is positive. When v peaks, a = 0. When v decreases, a is negative.",
      "Reading the chain upward (integration): the area under a(t) from t₁ to t₂ gives the change in velocity Δv. The area under v(t) from t₁ to t₂ gives the displacement Δx. This is the FTC in physics clothing — and it runs in the opposite direction from differentiation. To reconstruct x(t) from a(t), you need two pieces of information that the a-graph cannot provide: the initial position x₀ and the initial velocity v₀. These are the 'constants of integration' from calculus.",
      "The key mental skill is reading features across all three graphs for the same instant: a flat spot on x (local maximum or minimum) corresponds to a zero crossing on v and a specific sign of a. An inflection point on x (where x changes concavity) corresponds to a local extremum on v and a zero crossing on a. These correspondences let you check consistency: if the graphs disagree, one of them is wrong.",
      "Why does this matter for physics? Because different measurement tools access different levels of the chain. Accelerometers measure a(t) directly. Position sensors (GPS, encoders) measure x(t) directly. Velocity sensors exist but are less common. By knowing the chain, you can always convert measured data to whatever representation you need — and detect errors when measured x doesn't match twice-integrated measured a.",
    ],
    callouts: [
      {
        type: "intuition",
        title: "Feature Translation Table",
        body: "x has a peak or trough → v = 0 at that moment. x has an inflection point → v has a peak or trough → a = 0. x has constant slope → v is constant → a = 0. x has increasing slope (curving up) → v is positive → a is positive. Memorize this table: it's the core of graph reading.",
      },
      {
        type: "tip",
        title: "Calculus Connection: This IS Differential Calculus",
        body: "The derivative chain v = dx/dt, a = dv/dt = d²x/dt² is the core application of Calculus Chapter 2. The integral chain Δx = ∫v dt, Δv = ∫a dt is the core application of Calculus Chapter 4 (Integration). Kinematics is not just 'using calculus' — it IS calculus, applied to motion. Every chain-rule, every FTC, every integration-by-parts problem you will ever see in physics begins from this three-graph structure.",
      },
      {
        type: "prior-knowledge",
        title: "Initial Conditions Are Needed for Integration",
        body: "Differentiation is unique: given x(t), there is exactly one v(t) and one a(t). Integration is not: given a(t), there are infinitely many v(t) functions (differing by a constant C₁). Given v(t), there are infinitely many x(t) functions (differing by C₂). Initial conditions x₀ and v₀ pin down these constants. Without them, you know the shape but not where the motion starts.",
      },
      {
        type: "misconception",
        title: "The Graphs Are NOT Independent",
        body: "Students sometimes draw x, v, and a graphs that are mutually inconsistent — for example, drawing a v-graph with a peak where the x-graph has no inflection point. This is mathematically impossible. The three graphs are as coupled as cause and effect: they are different representations of the same function. Always check that slope of x matches the value of v, and slope of v matches the value of a.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The x → v → a chain',
        caption: 'Each arrow is a derivative; each reverse arrow is an integral. The entire kinematics course lives in this one diagram.',
      },
      {
        id: "TripleGraphIntuition",
        title: "Derivative chain visual",
        mathBridge:
          "Move one graph and track how the linked curves must change. Peaks on x create zeros on v; zeros on v create extrema on a.",
        caption: "One motion, three synchronized views.",
      },
      {
        id: "TripleGraphExplorer",
        title: "Parameter-driven sync",
        mathBridge:
          "Adjust x₀, v₀, and a, then observe all three graph families update together. Check that slope-of-x equals v at each moment.",
        caption: "A consistency engine for the kinematic chain.",
      },
    ],
  },

  math: {
    prose: [
      "The formal chain uses derivatives and antiderivatives. Going down: v(t) = dx/dt (instantaneous velocity is the time-derivative of position); a(t) = dv/dt = d²x/dt² (acceleration is the first derivative of velocity, or equivalently the second derivative of position).",
      "Going up: given a(t) and initial conditions, find v(t) = v₀ + ∫₀ᵗ a(t') dt' by integrating once; find x(t) = x₀ + ∫₀ᵗ v(t') dt' by integrating again. The notation v₀ = v(0) and x₀ = x(0) is standard for the initial values at t = 0.",
      "For constant acceleration, the integrals close in algebra (no calculus needed for the computation, though calculus proves why the formulas are correct): v(t) = v₀ + at and x(t) = x₀ + v₀t + ½at². These are the SUVAT equations — they're what you get from integrating the constant-a graph twice and applying initial conditions.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Derivative chain (going down)",
        body: "v(t) = \\frac{dx}{dt}, \\qquad a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}",
      },
      {
        type: "theorem",
        title: "Integral chain (going up)",
        body: "v(t) = v_0 + \\int_0^t a(t')\\,dt', \\qquad x(t) = x_0 + \\int_0^t v(t')\\,dt'",
      },
      {
        type: "definition",
        title: "SUVAT (constant acceleration only)",
        body: "v = v_0 + at, \\quad x = x_0 + v_0 t + \\tfrac{1}{2}at^2, \\quad v^2 = v_0^2 + 2a\\,\\Delta x",
      },
    ],
    visualizations: [
      {
        id: "KinematicsFormRecogniser",
        title: "Chain-aware formula drill",
        mathBridge:
          "Identify which operation (differentiate/integrate) moves between each pair of quantities.",
        caption: "Direction of travel in the chain matters for choosing the right operation.",
      },
    ],
  },

  rigor: {
    title: "Why the chain works — FTC applied twice",
    prose: [
      "The chain is a direct consequence of the Fundamental Theorem of Calculus (FTC) applied twice. First application: since v = dx/dt (v is the derivative of x), the FTC says ∫_{t₁}^{t₂} v(t) dt = x(t₂) − x(t₁) = Δx. So 'area under v–t gives Δx' is the FTC.",
      "Second application: since a = dv/dt (a is the derivative of v), the FTC gives ∫_{t₁}^{t₂} a(t) dt = v(t₂) − v(t₁) = Δv. These two FTC statements are the entire mathematical foundation of kinematic graph reading.",
      "The uniqueness of the reconstruction (given initial conditions) follows from the uniqueness theorem for antiderivatives: if two functions have the same derivative everywhere, they differ by at most a constant. So there is exactly one velocity function consistent with a given acceleration function AND a given v₀.",
    ],
    visualizationId: "TripleGraphExplorer",
    proofSteps: [
      {
        expression: "v(t) = \\frac{dx}{dt}",
        annotation: "Velocity is defined as the time-derivative of position.",
      },
      {
        expression: "a(t) = \\frac{dv}{dt} = \\frac{d^2 x}{dt^2}",
        annotation: "Acceleration is the derivative of velocity — or the second derivative of position.",
      },
      {
        expression: "\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt \\quad \\text{(by FTC)}",
        annotation: "Since v = dx/dt, integrate v to recover displacement. FTC: antiderivative of v is x.",
      },
      {
        expression: "\\Delta v = \\int_{t_1}^{t_2} a(t)\\,dt \\quad \\text{(by FTC)}",
        annotation: "Since a = dv/dt, integrate a to recover velocity change.",
      },
      {
        expression: "x(t) = x_0 + \\int_0^t v\\,dt, \\quad v(t) = v_0 + \\int_0^t a\\,dt",
        annotation: "Full reconstruction using both integrals with initial conditions.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-006-ex1",
      title: "Reconstruct position from constant acceleration",
      problem:
        "An object starts at x₀ = 5 m with v₀ = 2 m/s and constant acceleration a = 3 m/s². Find v(t) and x(t), then find x and v at t = 4 s.",
      steps: [
        {
          expression: "v(t) = v_0 + at = 2 + 3t",
          annotation: "Integrate constant acceleration with initial velocity.",
        },
        {
          expression: "x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2 = 5 + 2t + 1.5t^2",
          annotation: "Integrate velocity with initial position.",
        },
        {
          expression: "v(4) = 2 + 3(4) = 14 \\text{ m/s}",
          annotation: "Evaluate v at t = 4.",
        },
        {
          expression: "x(4) = 5 + 2(4) + 1.5(16) = 5 + 8 + 24 = 37 \\text{ m}",
          annotation: "Evaluate x at t = 4.",
        },
      ],
      conclusion:
        "At t = 4 s: v = 14 m/s, x = 37 m. Both follow directly by integrating down from the given constant acceleration.",
    },
    {
      id: "ch2-006-ex2",
      title: "Read from x(t) — find v and a",
      problem:
        "An object's position is x(t) = 4t³ − 12t² + 9t. Find v(t) and a(t). When is the object stopped? When is it accelerating positively?",
      steps: [
        {
          expression: "v(t) = \\frac{dx}{dt} = 12t^2 - 24t + 9",
          annotation: "Differentiate x(t) using the power rule.",
        },
        {
          expression: "a(t) = \\frac{dv}{dt} = 24t - 24",
          annotation: "Differentiate v(t).",
        },
        {
          expression: "v = 0: \\quad 12t^2 - 24t + 9 = 0 \\Rightarrow t = \\frac{24 \\pm \\sqrt{576-432}}{24} = \\frac{24 \\pm 12}{24}",
          annotation: "Quadratic formula. Object stops at these two times.",
        },
        {
          expression: "t = \\tfrac{1}{2} \\text{ s and } t = \\tfrac{3}{2} \\text{ s}",
          annotation: "Two stops: once on the way out, once on the way back.",
        },
        {
          expression: "a > 0 \\text{ when } 24t - 24 > 0 \\Rightarrow t > 1 \\text{ s}",
          annotation: "Positively accelerating after t = 1 s.",
        },
      ],
      conclusion:
        "Object stops at t = 0.5 s and t = 1.5 s. It accelerates positively for all t > 1 s. The three graphs are fully determined by the one formula x(t) — differentiate to read everything.",
    },
  ],

  challenges: [
    {
      id: "ch2-006-ch1",
      difficulty: "medium",
      problem: "If x(t) is a straight line (linear), what must v(t) and a(t) look like?",
      hint: "Differentiate a linear function twice.",
      answer:
        "v(t) = slope of x(t) = constant. a(t) = derivative of a constant = 0. Linear x means constant velocity and zero acceleration.",
    },
    {
      id: "ch2-006-ch2",
      difficulty: "hard",
      problem:
        "You are given only a(t) = sin(t) with v(0) = 0 and x(0) = 0. Find x(t). At what times does the object return to x = 0?",
      hint: "Integrate twice. Use the initial conditions to find the constants.",
      answer:
        "v(t) = ∫sin(t)dt = −cos(t) + C₁. With v(0) = 0: −cos(0) + C₁ = 0 → C₁ = 1 → v(t) = 1 − cos(t). Then x(t) = ∫(1−cos t)dt = t − sin(t) + C₂. With x(0) = 0: C₂ = 0 → x(t) = t − sin(t). The object never returns to x = 0 for t > 0 since t − sin(t) > 0 for all t > 0 (can verify: f = t − sin t, f' = 1 − cos t ≥ 0 with equality only at t = 2πk, so f is monotonically non-decreasing).",
    },
  ],
};
