export default {
  id: "ch2-004",
  slug: "velocity-graph-analysis",
  chapter: 2,
  order: 4,
  title: "Velocity-Time Graph Analysis",
  subtitle:
    "On v–t graphs, slope gives acceleration and area gives displacement.",
  tags: ["velocity graph", "area", "acceleration"],
  aliases: "v t graph area displacement acceleration",
  hook: {
    question:
      "Why can an object have positive velocity but negative acceleration?",
    realWorldContext:
      "Braking systems, elevators, and landing maneuvers are usually analyzed in v–t form because area and slope are physically meaningful.",
    previewVisualizationId: "VelocityGraphIntuition",
  },
  intuition: {
    prose: [
      "A point on v–t shows current velocity.",
      "The signed area under v–t between two times equals displacement.",
      "The slope of v–t gives acceleration.",
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
      "Displacement from v(t) is integral: Δx = ∫ v dt.",
      "Acceleration is derivative: a(t)=dv/dt.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Displacement from velocity",
        body: "\\Delta x=\\int_{t_1}^{t_2} v(t)\\,dt",
      },
      {
        type: "definition",
        title: "Acceleration",
        body: "a(t)=\\frac{dv}{dt}",
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
    prose: [
      "The fundamental theorem of calculus links area accumulation to derivatives.",
    ],
    visualizationId: "KinematicProof",
    proofSteps: [
      { expression: "a=\\frac{dv}{dt}", annotation: "Slope of v–t." },
      {
        expression: "v=v_0+\\int a\\,dt",
        annotation: "Integrate acceleration.",
      },
      {
        expression: "\\Delta x=\\int v\\,dt",
        annotation: "Integrate velocity to get displacement.",
      },
    ],
    title: "Why area and slope rules work",
  },
  examples: [
    {
      id: "ch2-004-ex1",
      title: "Triangular area",
      problem: "v rises linearly 0→12 m/s over 4 s. Find displacement.",
      steps: [
        {
          expression: "\\Delta x=\\frac12(4)(12)=24\\,\\text{m}",
          annotation: "Area of triangle under v–t.",
        },
      ],
      conclusion: "Displacement is 24 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-004-ch1",
      difficulty: "medium",
      problem: "If v is positive but decreasing, what is sign of a?",
      hint: "Look at slope of v–t.",
      answer: "Negative acceleration.",
    },
  ],
};
