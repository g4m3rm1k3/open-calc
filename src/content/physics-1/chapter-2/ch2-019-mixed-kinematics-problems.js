export default {
  id: "ch2-019",
  slug: "mixed-kinematics-problems",
  chapter: 'p2',
  order: 19,
  title: "Mixed Kinematics Problems",
  subtitle:
    "Combine graph-reading, equation selection, and sign discipline in one workflow.",
  tags: ["mixed practice", "kinematics", "problem solving"],
  aliases: "mixed suvat problems kinematics review",
  hook: {
    question:
      "How do you decide quickly whether to start from a graph, equation, or known-value table?",
    realWorldContext:
      "Real tasks rarely announce a method; they require method selection under uncertainty.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "Translate the statement into knowns/unknowns first.",
      "If data is graphical, extract slope/area quantities before algebra.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'Your decision tree starts here',
        caption: 'Mixed problems have many paths. The SUVAT map shows all valid paths given your knowns. Start by listing what you know and don\'t know — the equation that links exactly those variables is your first move.',
      },
      {
        id: 'SVGDiagram',
        title: "Mixed-method selector quiz",
        mathBridge:
          "Practice deciding the best first move: derivative, integral, or SUVAT substitution.",
        caption: "Decision quality drives solution speed.",
      },
      {
        id: 'SVGDiagram',
        title: "Knowns-to-unknowns solver",
        mathBridge:
          "After selecting method, execute with consistent variables and signs.",
        caption: "Convert strategy to answer.",
      },
      {
        id: 'VerticalThrow',
        props: {},
        title: "Projectile case solver",
        mathBridge:
          "Blend kinematics method selection with horizontal, level-ground, and elevated projectile solve modes.",
        caption: "A unified solver workflow across motion families.",
      },
      {
        id: 'SVGDiagram',
        title: "Range step-through",
        mathBridge:
          "Walk through decomposition, flight-time, and range formulas in an explicit multi-step chain.",
        caption: "Method transparency reduces setup errors.",
      },
    ],
  },
  math: {
    prose: [
      "Use this hierarchy: conventions → knowns → equation/domain check → solve → sanity check.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Formula fit and recall",
        mathBridge:
          "Instantly verify which formulas are admissible for a given variable set.",
        caption: "A robust anti-error checklist.",
      },
    ],
  },
  rigor: {
    prose: [
      "All constant-acceleration mixed problems reduce to a small, closed equation set plus calculus links.",
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      { expression: "v=v_0+at", annotation: "Rate update backbone." },
      {
        expression: "\\Delta x=v_0t+\\frac12at^2",
        annotation: "Position update backbone.",
      },
      {
        expression: "\\Delta x=\\int v\\,dt",
        annotation: "Graph/integration route for variable representations.",
      },
    ],
    title: "Unified solving backbone",
  },
  examples: [
    {
      id: "ch2-019-ex1",
      title: "Graph + equation hybrid",
      problem: "From v–t graph, find Δx on [0,4], then use v=v0+at to find a.",
      steps: [
        {
          expression: "\\Delta x=\\text{area under }v\\text{-}t",
          annotation: "Extract displacement first.",
        },
        { expression: "a=(v-v_0)/t", annotation: "Then infer acceleration." },
      ],
      conclusion: "A mixed route can be shortest and safest.",
    },
  ],
  challenges: [
    {
      id: "ch2-019-ch1",
      difficulty: "hard",
      problem: "Name one diagnostic that tells you SUVAT is invalid.",
      hint: "Check acceleration assumptions.",
      answer: "Acceleration is not constant over the interval.",
    },
  ],
};
