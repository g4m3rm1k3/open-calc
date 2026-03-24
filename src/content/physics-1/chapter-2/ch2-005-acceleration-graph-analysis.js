export default {
  id: "ch2-005",
  slug: "acceleration-graph-analysis",
  chapter: 2,
  order: 5,
  title: "Acceleration-Time Graph Analysis",
  subtitle: "Use a–t graphs to predict velocity changes over time.",
  tags: ["acceleration graph", "delta v", "kinematics"],
  aliases: "a t graph change in velocity",
  hook: {
    question:
      "If acceleration is constant at +2 m/s² for 5 s, how much does velocity change?",
    realWorldContext:
      "Engine control, launch profiles, and motion planning often start from acceleration commands.",
    previewVisualizationId: "AccelerationGraphIntuition",
  },
  intuition: {
    prose: [
      "An a–t graph tells you how quickly velocity is changing.",
      "Signed area under a–t over a time interval equals Δv.",
    ],
    visualizations: [
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
          "See the same motion represented in all three graphs simultaneously.",
        caption: "Consistency check across representations.",
      },
    ],
  },
  math: {
    prose: [
      "Velocity update from acceleration is v = v0 + ∫a dt.",
      "For constant a, this becomes v = v0 + at.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Velocity update",
        body: "v(t)=v_0+\\int_0^t a(t')\\,dt'",
      },
      {
        type: "definition",
        title: "Constant acceleration",
        body: "\\Delta v = a\\Delta t",
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
    prose: ["The area rule is a direct integral statement."],
    visualizationId: "KinematicProof",
    proofSteps: [
      { expression: "a=\\frac{dv}{dt}", annotation: "Definition." },
      { expression: "dv=a\\,dt", annotation: "Separate differentials." },
      {
        expression: "\\Delta v=\\int a\\,dt",
        annotation: "Integrate over interval.",
      },
    ],
    title: "Deriving Δv from a–t",
  },
  examples: [
    {
      id: "ch2-005-ex1",
      title: "Constant acceleration update",
      problem: "v0 = 3 m/s, a = -1.5 m/s² for 4 s. Find v.",
      steps: [
        {
          expression: "v=3+(-1.5)(4)=-3\\,\\text{m/s}",
          annotation: "Area under a–t is -6 m/s.",
        },
      ],
      conclusion: "Final velocity is -3 m/s.",
    },
  ],
  challenges: [
    {
      id: "ch2-005-ch1",
      difficulty: "medium",
      problem: "Can acceleration be zero while velocity is nonzero?",
      hint: "Think constant-velocity motion.",
      answer: "Yes. Then velocity is constant and nonzero.",
    },
  ],
};
