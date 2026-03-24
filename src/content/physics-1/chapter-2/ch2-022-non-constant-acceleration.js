export default {
  id: "ch2-022",
  slug: "non-constant-acceleration",
  chapter: 2,
  order: 22,
  title: "Non-Constant Acceleration",
  subtitle:
    "When acceleration varies with time, only calculus gives the exact answer.",
  tags: ["non-constant-acceleration", "kinematics", "1D motion"],
  aliases: "non-constant-acceleration",
  hook: {
    question:
      "a(t) = 6t. What is the velocity at t = 3 s if v₀ = 2 m/s? What is the displacement from t = 0 to t = 3?",
    realWorldContext:
      "The kinematic equations assume constant acceleration. When a varies, integration is the only correct approach — and it gives exact answers without memorising new formulas.",
    previewVisualizationId: "VariableAccelerationIntuition",
  },
  videos: [
    {
      title:
        "Physics 2 – Motion in One Dimension (22 of 22) Acceleration Not Constant",
      embedCode:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/ZJTtyYKKsuI" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: ["See the visualisation and key formula below."],
    callouts: [
      {
        type: "theorem",
        title: "Core formula",
        body: "v(t) = v_0 + \\int_0^t a(t')\\,dt, \\quad x(t) = x_0 + \\int_0^t v(t')\\,dt",
      },
    ],
    visualizations: [
      {
        id: "VariableAccelerationIntuition",
        title: "Non-Constant Acceleration — intuition",
        mathBridge: "Interactive exploration.",
        caption: "Drag and explore.",
      },
    ],
  },
  math: {
    prose: ["Apply the formula to solve problems systematically."],
    callouts: [
      {
        type: "insight",
        title: "Key formula",
        body: "v(t) = v_0 + \\int_0^t a(t')\\,dt, \\quad x(t) = x_0 + \\int_0^t v(t')\\,dt",
      },
    ],
    visualizations: [
      {
        id: "VariableAccelerationExplorer",
        title: "Non-Constant Acceleration — explorer",
        mathBridge: "Adjust inputs and see outputs.",
        caption: "Every case covered.",
      },
    ],
  },
  rigor: {
    prose: [
      "The result follows from the definitions of velocity and acceleration.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Formal statement",
        body: "v(t) = v_0 + \\int_0^t a(t')\\,dt, \\quad x(t) = x_0 + \\int_0^t v(t')\\,dt",
      },
    ],
    visualizationId: "KinematicProof",
    proofSteps: [
      {
        expression:
          "v(t) = v_0 + \\int_0^t a(t')\\,dt, \\quad x(t) = x_0 + \\int_0^t v(t')\\,dt",
        annotation: "Core result to be established.",
      },
    ],
    title: "Non-Constant Acceleration — derivation",
    visualizations: [
      {
        id: "KinematicProof",
        title: "Proof steps",
        mathBridge: "Each step builds on the previous.",
      },
    ],
  },
  examples: [
    {
      id: "ch2-022-ex1",
      title: "Core application",
      problem:
        "Apply the formula to a standard Non-Constant Acceleration problem.",
      steps: [
        {
          expression:
            "v(t) = v_0 + \\int_0^t a(t')\\,dt, \\quad x(t) = x_0 + \\int_0^t v(t')\\,dt",
          annotation: "Direct application.",
        },
      ],
      conclusion: "Use systematic sign discipline.",
    },
  ],
  challenges: [
    {
      id: "ch2-022-ch1",
      difficulty: "medium",
      problem: "Apply Non-Constant Acceleration to a multi-step scenario.",
      hint: "Identify known/unknown quantities first.",
      walkthrough: [
        {
          expression:
            "v(t) = v_0 + \\int_0^t a(t')\\,dt, \\quad x(t) = x_0 + \\int_0^t v(t')\\,dt",
          annotation: "Apply systematically.",
        },
      ],
      answer: "See worked solution.",
    },
  ],
};
