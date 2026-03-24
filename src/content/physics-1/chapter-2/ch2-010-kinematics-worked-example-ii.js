export default {
  id: "ch2-010",
  slug: "kinematics-worked-example-ii",
  chapter: 2,
  order: 10,
  title: "Kinematics Worked Example II",
  subtitle: "Multi-step solving with equation choice and sign discipline.",
  tags: ["worked example", "sign convention", "suvat"],
  aliases: "kinematics example 2 sign convention",
  hook: {
    question:
      "Why do correct numbers still give wrong answers when signs are inconsistent?",
    realWorldContext:
      "Direction errors are the most common failure mode in motion analysis and simulation code.",
    previewVisualizationId: "KinematicsPatternSpotter",
  },
  intuition: {
    prose: [
      "Choose a positive direction first and keep it fixed.",
      "Each quantity inherits sign from that convention.",
    ],
    visualizations: [
      {
        id: "KinematicsPatternSpotter",
        title: "Sign-aware equation pattern drill",
        mathBridge:
          "Solve short prompts where only one equation/sign combination is consistent.",
        caption: "Consistency first, arithmetic second.",
      },
      {
        id: "KinematicEquationSelector",
        title: "Interactive solver",
        mathBridge: "Use signed inputs to verify physically sensible outputs.",
        caption: "A fast mistake detector.",
      },
    ],
  },
  math: {
    prose: ["Cross-check units and limiting behavior before finalizing."],
    visualizations: [
      {
        id: "KinematicsFormRecogniser",
        title: "Formula fit check",
        mathBridge:
          "Confirm that your selected formula matches known variables and unknown target.",
        caption: "Prevent wrong-formula starts.",
      },
    ],
  },
  rigor: {
    prose: [
      "Correct solving is constrained by equation domain assumptions (constant acceleration).",
    ],
    visualizationId: "KinematicProof",
    proofSteps: [
      { expression: "a=\\text{const}", annotation: "Required precondition." },
      { expression: "v=v_0+at", annotation: "Linear velocity evolution." },
      {
        expression: "\\Delta x=v_0t+\\frac12at^2",
        annotation: "Position follows by integration.",
      },
    ],
    title: "Why setup assumptions matter",
  },
  examples: [
    {
      id: "ch2-010-ex1",
      title: "Braking car",
      problem: "v0=18 m/s, a=-3 m/s², find stop time and stopping distance.",
      steps: [
        {
          expression: "0=18-3t\\Rightarrow t=6\\,\\text{s}",
          annotation: "Solve for stop time.",
        },
        {
          expression: "\\Delta x=18(6)+\\frac12(-3)(36)=54\\,\\text{m}",
          annotation: "Compute displacement.",
        },
      ],
      conclusion: "Stops in 6 s over 54 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-010-ch1",
      difficulty: "medium",
      problem: "If up is positive in free fall, what sign is acceleration?",
      hint: "Gravity points down.",
      answer: "Negative: a=-g.",
    },
  ],
};
