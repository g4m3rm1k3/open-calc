export default {
  id: "ch2-017",
  slug: "free-fall-from-rest",
  chapter: 2,
  order: 17,
  title: "Free Fall from Rest",
  subtitle: "The simplest gravity model: v0=0 and constant acceleration.",
  tags: ["free fall", "drop", "from rest"],
  aliases: "dropped object from rest",
  hook: {
    question:
      "How far does an object fall in a given time if released from rest?",
    realWorldContext:
      "Drop-time estimates appear in safety checks, sports analysis, and instrument calibration.",
    previewVisualizationId: "FreeFallExplorer",
  },
  intuition: {
    prose: [
      "With v0=0, displacement scales like t² under constant gravity.",
      "Doubling time quadruples fall distance in this ideal model.",
    ],
    visualizations: [
      {
        id: "FreeFallExplorer",
        title: "Drop from rest calculator",
        mathBridge: "Slide time and observe quadratic growth in displacement.",
        caption: "A classic t² law in action.",
      },
      {
        id: "FreeFallPatternSpotter",
        title: "Free-fall pattern quiz",
        mathBridge:
          "Identify which graph/equation matches drop-from-rest behavior.",
        caption: "Reinforce qualitative recognition.",
      },
      {
        id: "HorizontalLaunchIntuition",
        title: "Horizontal launch from rest vertically",
        mathBridge:
          "Compare pure drop and horizontal launch to isolate unchanged vertical free-fall dynamics.",
        caption:
          "Horizontal speed changes range, not fall-time under ideal assumptions.",
      },
    ],
  },
  math: {
    prose: ["For up-positive convention, use Δx = -1/2 g t² and v = -gt."],
    visualizations: [
      {
        id: "KinematicsFormRecogniser",
        title: "Equation recall",
        mathBridge: "Spot the v0=0 special-case forms quickly.",
        caption: "Special cases reduce cognitive load.",
      },
    ],
  },
  rigor: {
    prose: ["Set v0=0 in the constant-acceleration formulas."],
    visualizationId: "FreeFallExplorer",
    proofSteps: [
      {
        expression: "\\Delta x=v_0t+\\frac12at^2",
        annotation: "General form.",
      },
      {
        expression: "v_0=0,\\,a=-g",
        annotation: "Drop-from-rest substitutions.",
      },
      {
        expression: "\\Delta x=-\\frac12gt^2",
        annotation: "Result under up-positive axis.",
      },
    ],
    title: "Derivation for v0=0",
  },
  examples: [
    {
      id: "ch2-017-ex1",
      title: "3-second drop",
      problem: "Find displacement after 3 s from rest (up-positive).",
      steps: [
        {
          expression: "\\Delta x=-\\frac12(9.8)(3^2)=-44.1\\,\\text{m}",
          annotation: "Direct substitution.",
        },
      ],
      conclusion: "Object is 44.1 m below release point.",
    },
  ],
  challenges: [
    {
      id: "ch2-017-ch1",
      difficulty: "easy",
      problem: "If drop time doubles, by what factor does distance change?",
      hint: "Distance is proportional to t².",
      answer: "By a factor of 4.",
    },
  ],
};
