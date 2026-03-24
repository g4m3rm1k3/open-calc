export default {
  id: "ch2-003",
  slug: "position-graph-analysis",
  chapter: 2,
  order: 3,
  title: "Position-Time Graph Analysis",
  subtitle: "Read motion directly from the shape and slope of an x–t graph.",
  tags: ["position graph", "slope", "kinematics"],
  aliases: "x t graph slope velocity position graph",
  hook: {
    question:
      "How can two objects at the same position be moving at different speeds?",
    realWorldContext:
      "Traffic analytics and GPS traces are position-time data first. Interpreting slope correctly is how we infer motion from that data.",
    previewVisualizationId: "PositionGraphIntuition",
  },
  intuition: {
    prose: [
      "An x–t graph tells you where an object is at each time.",
      "The slope of the curve at any point is velocity: steeper positive slope means faster forward motion; negative slope means moving backward.",
    ],
    visualizations: [
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
      "Average velocity over [t1, t2] is the secant slope on x–t.",
      "Instantaneous velocity is the tangent slope: v(t)=dx/dt.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Average velocity",
        body: "\\bar{v}=\\frac{x(t_2)-x(t_1)}{t_2-t_1}",
      },
      {
        type: "definition",
        title: "Instantaneous velocity",
        body: "v(t)=\\frac{dx}{dt}",
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
    prose: ["Velocity as slope follows from the derivative limit definition."],
    visualizationId: "KinematicsDerivativeProof",
    proofSteps: [
      {
        expression: "\\bar{v}=\\frac{\\Delta x}{\\Delta t}",
        annotation: "Secant slope over a finite interval.",
      },
      {
        expression: "v(t)=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}",
        annotation: "Shrink interval to a point.",
      },
      {
        expression: "v(t)=\\frac{dx}{dt}",
        annotation: "Derivative is tangent slope on x–t.",
      },
    ],
    title: "Why slope equals velocity",
  },
  examples: [
    {
      id: "ch2-003-ex1",
      title: "Read average velocity",
      problem: "From x(2)=4 m and x(6)=20 m, find average velocity on [2,6].",
      steps: [
        {
          expression: "\\bar{v}=\\frac{20-4}{6-2}=4\\,\\text{m/s}",
          annotation: "Use secant slope.",
        },
      ],
      conclusion: "Average velocity is 4 m/s.",
    },
  ],
  challenges: [
    {
      id: "ch2-003-ch1",
      difficulty: "medium",
      problem: "Can velocity be zero while position is nonzero?",
      hint: "Think about a flat tangent on x–t.",
      answer: "Yes. v=0 means local flat slope, not x=0.",
    },
  ],
};
