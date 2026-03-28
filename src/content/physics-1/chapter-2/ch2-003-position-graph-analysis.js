export default {
  id: "ch2-003",
  slug: "position-graph-analysis",
  chapter: 2,
  order: 3,
  title: "Position-Time Graph Analysis",
  subtitle: "Read motion directly from the shape and slope of an x–t graph.",
  tags: ["position graph", "slope", "kinematics", "velocity", "instantaneous rate of change"],
  aliases: "x t graph slope velocity position graph",

  hook: {
    question:
      "Two cars pass through the same intersection at the same moment. One is cruising at 30 mph; the other is slamming on the brakes from 60 mph. At that instant, they share the same position — but their x–t graphs look completely different. How?",
    realWorldContext:
      "GPS navigation apps, traffic analytics systems, and sports tracking all start with raw position-time data. Interpreting the shape and slope of that data tells you everything about how an object is moving — without ever measuring speed directly. Police radar guns, stadium timing systems, and autonomous vehicle sensors all convert position data into velocity by reading graph slopes in real time.",
    previewVisualizationId: "PositionGraphIntuition",
  },

  intuition: {
    prose: [
      "An x–t graph is the story of where an object is at every moment in time. The horizontal axis is time; the vertical axis is position. A single dot on the graph tells you one fact: 'at this time, the object was at this location.' The entire curve tells you the whole journey.",
      "You can read motion directly from the shape of the curve — before doing any algebra at all. A flat horizontal line means the object is stopped: position never changes. A straight diagonal line means the object is moving at constant speed: equal position changes in equal time intervals, like a car on cruise control. A curve that bends upward means the object is speeding up; a curve that flattens out means it is slowing down. The shape is the story.",
      "The slope of the x–t curve at any moment tells you velocity. Steep positive slope means fast forward motion. Gentle positive slope means slow forward motion. Zero slope (flat tangent) means momentarily stopped. Negative slope means moving backward — position is decreasing. This is the key translation: steepness of curve = speed, sign of slope = direction.",
      "Two objects can be at the same position at the same time but have completely different slopes at that point — meaning different velocities. This is why your two cars in the hook have different graphs even though they cross the same intersection simultaneously: one has a gentle, nearly constant slope; the other has a steep slope that is rapidly decreasing as the brakes take effect.",
      "Over any time interval, you can estimate velocity by drawing the secant line — the straight line connecting two points on the curve. The slope of that secant line gives the average velocity over that interval. This is pure algebra: rise over run, Δx/Δt. No calculus needed. The finer you make the interval, the better this estimate becomes.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "Slope from Algebra: Δy/Δx",
        body: "The slope of any line through two points (t₁, x₁) and (t₂, x₂) is Δx/Δt = (x₂ - x₁)/(t₂ - t₁). This is rise over run with position on the y-axis and time on the x-axis. Reading a motion graph is applying this formula to real-world data.",
      },
      {
        type: "intuition",
        title: "Three Shapes, Three Stories",
        body: "Flat line → stopped. Straight diagonal → constant velocity (uniform motion). Curve (concave up) → speeding up (acceleration is positive). Curve (concave down) → slowing down (acceleration is negative). You can identify all four situations from graph shape alone, before calculating a single number.",
      },
      {
        type: "tip",
        title: "Calculus Connection: Slope → Derivative",
        body: "The slope of the secant line (average velocity) becomes the slope of the tangent line (instantaneous velocity) as the interval Δt → 0. This limit is exactly the derivative dx/dt. The same idea is developed rigorously in Calculus Chapter 2 (The Derivative), where the speedometer paradox — how can speed exist at a single instant? — is fully resolved using the limit definition.",
      },
      {
        type: "misconception",
        title: "x–t Slope Is NOT the Shape of the Path",
        body: "A steep x–t graph does not mean the object moved steeply through space. It means the object moved quickly through space. A ball thrown horizontally has a curved path in 2D space, but its x-coordinate vs time is a straight line (constant horizontal velocity). Always remember: x–t graphs plot position against time, not trajectory through space.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-avg-velocity' },
        title: 'Average velocity — algebra only',
        caption: 'Pick any two points on the x–t curve. Divide the rise (Δx) by the run (Δt). That ratio is the average velocity over that interval. No calculus — just subtraction and division.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Secant slope → tangent slope',
        caption: 'As Δt shrinks, the secant (dashed, average) rotates onto the tangent (solid, instantaneous). The limiting slope is dx/dt = velocity.',
      },
      {
        id: "PositionGraphIntuition",
        title: "Slope on x–t gives velocity",
        mathBridge:
          "Hover points on the curve and compare secant/tangent slope with instantaneous velocity.",
        caption: "Shape describes motion; slope quantifies it.",
      },
      {
        id: "PositionGraphExplorer",
        title: "Scenario explorer",
        mathBridge:
          "Switch presets to compare rest, constant speed, reversal, and accelerating motion.",
        caption: "Different stories, different graph geometry.",
      },
    ],
  },

  math: {
    prose: [
      "The average velocity over any time interval [t₁, t₂] is the secant slope on the x–t graph: the ratio of the change in position to the change in time. You compute it algebraically — read two coordinates off the graph, subtract, divide. Units are always meters per second (m/s) if position is in meters and time in seconds.",
      "To find average velocity: locate two points (t₁, x(t₁)) and (t₂, x(t₂)) on the graph, then apply the secant formula. Notice that if position decreases (x₂ < x₁), the slope is negative and velocity is negative — the object is moving in the negative direction.",
      "Instantaneous velocity at a single moment t is the slope of the tangent line to the x–t curve at that point. You cannot compute it exactly from a graph by eye — you can only estimate it by drawing as small a secant as possible. The exact value requires taking a limit (see Rigor section below). In problems, instantaneous velocity is found analytically by differentiating the position function: v(t) = dx/dt.",
      "For a position function x(t) = x₀ + v₀t + ½at² (constant acceleration), the slope at time t is exactly v(t) = v₀ + at. The x–t graph is a parabola; its slope changes linearly with time.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Average velocity (secant slope)",
        body: "\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x(t_2) - x(t_1)}{t_2 - t_1}",
      },
      {
        type: "definition",
        title: "Instantaneous velocity (tangent slope)",
        body: "v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}",
      },
      {
        type: "technique",
        title: "Slope Signs Tell Direction",
        body: "Positive slope (x increasing) → moving in +x direction. Negative slope (x decreasing) → moving in −x direction. Zero slope → momentarily stopped. The magnitude of the slope tells you speed; the sign tells you direction.",
      },
    ],
    visualizations: [
      {
        id: "KinematicsFormRecogniser",
        title: "Kinematics formula recogniser",
        mathBridge:
          "Keep the key equations visible while translating graph features to equations.",
        caption: "Graph reading and formulas should agree.",
      },
    ],
  },

  rigor: {
    title: "Why slope equals velocity — the calculus",
    prose: [
      "The claim that 'slope of x–t equals velocity' is not just a geometric analogy — it is a theorem. Average velocity over [t, t+Δt] is exactly the secant slope Δx/Δt. Instantaneous velocity is the limit of these secant slopes as Δt shrinks to zero. That limit is the derivative dx/dt by definition. So velocity is not 'like' a derivative — it literally IS the derivative of position with respect to time.",
      "This is why calculus was invented. Newton wanted to define velocity at an instant — a quantity that Zeno's paradoxes seemed to make impossible. The answer was the limit definition of the derivative. Every speedometer, GPS, and physics simulation computes velocity as dx/dt, whether using calculus analytically or numerical differentiation computationally.",
    ],
    visualizationId: "KinematicsDerivativeProof",
    proofSteps: [
      {
        expression: "\\bar{v} = \\frac{x(t+\\Delta t) - x(t)}{\\Delta t}",
        annotation: "Average velocity = secant slope on x–t over interval [t, t+Δt].",
      },
      {
        expression: "v(t) = \\lim_{\\Delta t \\to 0} \\frac{x(t + \\Delta t) - x(t)}{\\Delta t}",
        annotation: "Shrink the interval to zero — this is the derivative limit definition.",
      },
      {
        expression: "v(t) = \\frac{dx}{dt}",
        annotation: "Instantaneous velocity is the derivative of position. Slope of tangent on x–t.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-003-ex1",
      title: "Read average velocity from two graph points",
      problem:
        "A car's x–t data shows x(2) = 4 m and x(6) = 20 m. Find its average velocity over [2, 6].",
      steps: [
        {
          expression: "\\bar{v} = \\frac{x(6) - x(2)}{6 - 2} = \\frac{20 - 4}{4} = \\frac{16}{4}",
          annotation: "Apply the secant slope formula: Δx/Δt.",
        },
        {
          expression: "\\bar{v} = 4 \\text{ m/s}",
          annotation: "The car moved 16 m in 4 s, averaging 4 m/s.",
        },
      ],
      conclusion:
        "Average velocity is 4 m/s. This is the slope of the secant line between the two graph points.",
    },
    {
      id: "ch2-003-ex2",
      title: "Identify motion from graph shape",
      problem:
        "An x–t graph shows: (A) flat line from t=0 to t=3, (B) increasing straight line from t=3 to t=7, (C) decreasing curve from t=7 to t=10. Describe the motion.",
      steps: [
        {
          expression: "v = 0 \\text{ on } [0, 3]",
          annotation: "(A) Flat line → zero slope → object is stopped.",
        },
        {
          expression: "v > 0,\\ \\text{constant on } [3, 7]",
          annotation: "(B) Straight diagonal → constant slope → constant positive velocity.",
        },
        {
          expression: "v < 0,\\ \\text{decreasing magnitude on } [7, 10]",
          annotation: "(C) Decreasing curve → negative but increasing slope → moving backward, slowing down.",
        },
      ],
      conclusion:
        "Stopped → constant forward motion → decelerating backward motion. Three shapes, three stories.",
    },
  ],

  challenges: [
    {
      id: "ch2-003-ch1",
      difficulty: "medium",
      problem: "Can velocity be zero while position is nonzero?",
      hint: "Think about a flat tangent on x–t — at what position does it occur?",
      answer:
        "Yes. v = 0 means the slope is zero at that instant (flat tangent). The object is momentarily stopped, but it can be anywhere on the x-axis — position being nonzero is unrelated to velocity being zero.",
    },
    {
      id: "ch2-003-ch2",
      difficulty: "hard",
      problem:
        "An x–t graph is a perfect parabola: x(t) = 2t². What is the instantaneous velocity at t = 3, and how does it compare to the average velocity over [2, 4]?",
      hint: "Use derivative for instantaneous; use Δx/Δt for average.",
      answer:
        "Instantaneous: v(3) = dx/dt = 4t|_{t=3} = 12 m/s. Average over [2,4]: Δx/Δt = (2·16 - 2·4)/(4-2) = (32-8)/2 = 12 m/s. They match! This is not a coincidence — for uniform acceleration (quadratic x(t)), the average velocity over a symmetric interval equals the instantaneous velocity at the midpoint (MVT).",
    },
  ],
};
