export default {
  id: "ch2-008",
  slug: "kinematics-worked-example-i",
  chapter: 2,
  order: 8,
  title: "Kinematics Worked Example I",
  subtitle: "Solve a full constant-acceleration problem from setup to check.",
  tags: ["worked example", "SUVAT", "problem solving"],
  aliases: "kinematics example suvat setup",
  hook: {
    question: "What is the fastest way to choose the right kinematic equation?",
    realWorldContext:
      "Exam and engineering workflows both reward systematic known/unknown mapping before algebra.",
    previewVisualizationId: "KinematicsExampleIntuition",
  },
  intuition: {
    prose: [
      "Start by listing knowns and unknowns with signs and units.",
      "Pick the equation that excludes the quantity you do not have.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'Choose your equation',
        caption: 'Before computing anything: identify the 3 knowns and 1 unknown. The SUVAT map shows which equation connects those 4 quantities (and omits the one you don\'t need).',
      },
      {
        id: "KinematicsExampleIntuition",
        title: "Full-solution walkthrough",
        mathBridge:
          "Track data flow from graph intuition to equation selection to numeric result.",
        caption: "Method beats memorization.",
      },
      {
        id: "KinematicsPatternSpotter",
        title: "Equation selection quiz",
        mathBridge:
          "Practice matching problem statements to the correct equation pattern.",
        caption: "Pattern recognition under pressure.",
      },
    ],
  },
  math: {
    prose: ["Use dimension checks and sign checks after solving."],
    visualizations: [
      {
        id: "KinematicEquationSelector",
        title: "Solve by knowns",
        mathBridge: "Enter any three known quantities and solve the unknowns.",
        caption: "Automates the setup discipline.",
      },
    ],
  },
  rigor: {
    prose: [
      "Every selected equation traces back to the constant-acceleration derivation.",
    ],
    visualizationId: "KinematicProof",
    proofSteps: [
      { expression: "v=v_0+at", annotation: "Primary equation." },
      {
        expression: "\\Delta x=v_0t+\\frac12at^2",
        annotation: "Integrated position form.",
      },
      {
        expression: "v^2=v_0^2+2a\\Delta x",
        annotation: "Eliminate time when needed.",
      },
    ],
    title: "Equation provenance",
  },
  examples: [
    {
      id: "ch2-008-ex1",
      title: "Accelerating bike",
      problem:
        "A bike starts at 2 m/s and accelerates at 1.5 m/s² for 6 s. Find v and Δx.",
      steps: [
        {
          expression: "v=2+1.5(6)=11\\,\\text{m/s}",
          annotation: "Use v=v0+at.",
        },
        {
          expression: "\\Delta x=2(6)+\\frac12(1.5)(36)=39\\,\\text{m}",
          annotation: "Use displacement equation.",
        },
      ],
      conclusion: "v=11 m/s and Δx=39 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-008-ch1",
      difficulty: "medium",
      problem:
        "Given v0, v, a, which equation should you use first to get displacement?",
      hint: "Choose the equation without t.",
      answer: "Use v^2=v_0^2+2a\\Delta x.",
    },
  ],
};
