export default {
  id: "ch2-016",
  slug: "free-fall-downward-throw",
  chapter: 'p2',
  order: 16,
  title: "Free Fall: Downward Throw",
  subtitle:
    "When initial velocity is downward, gravity compounds the speed increase.",
  tags: ["downward throw", "free fall", "kinematics"],
  aliases: "downward launch vertical throw",
  hook: {
    question: "How does initial downward speed change impact time to ground?",
    realWorldContext:
      "Drop tests and impact estimation often include nonzero initial downward speed.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "A downward initial velocity means the object already has speed in gravity's direction.",
      "Compared with a drop from rest, impact occurs sooner and at higher speed.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Downward throw: v₀ < 0 (upward positive)',
        caption: 'When throwing downward with +y upward: v₀ is negative, a = −g is negative. Both v and a point the same direction. The object accelerates continuously with no apex. Same equations — only the sign of v₀ differs from the upward case.',
      },
      {
        id: 'VerticalThrow',
        props: {},
        title: "Downward-launch comparison",
        mathBridge: "Compare rest-drop and downward-throw from same height.",
        caption: "Initial speed shifts both timing and impact velocity.",
      },
      {
        id: 'VerticalThrow',
        title: "Impact-time explorer",
        mathBridge:
          "Set height and v0 to solve landing time and velocity with clear sign control.",
        caption: "A practical impact estimator.",
      },
      {
        id: 'VerticalThrow',
        title: "Elevated launch and landing",
        mathBridge:
          "Extend downward-throw analysis to elevated launch scenarios solved by quadratic landing-time roots.",
        caption: "Same gravity model, richer initial geometry.",
      },
    ],
  },
  math: {
    prose: [
      "Pick one axis convention and keep all signs consistent through substitution.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Solve landing state",
        mathBridge:
          "Solve unknown time or impact speed from known height and initial velocity.",
        caption: "Directly applicable to test scenarios.",
      },
    ],
  },
  rigor: {
    prose: ["The equations are identical to upward launch; only signs differ."],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      {
        expression: "\\Delta x=v_0t+\\frac12at^2",
        annotation: "General displacement relation.",
      },
      { expression: "v=v_0+at", annotation: "General velocity relation." },
      {
        expression: "\\text{Insert signs from chosen axis}",
        annotation: "Convention supplies direction information.",
      },
    ],
    title: "Downward-throw formulation",
  },
  examples: [
    {
      id: "ch2-016-ex1",
      title: "Throw from balcony",
      problem:
        "From 20 m height, v0=5 m/s downward. Find impact speed (down positive).",
      steps: [
        {
          expression: "v^2=v_0^2+2a\\Delta x=25+2(9.8)(20)=417",
          annotation: "Use no-time equation.",
        },
        {
          expression: "v=20.4\\,\\text{m/s (down)}",
          annotation: "Take positive root for downward direction.",
        },
      ],
      conclusion: "Impact speed is about 20.4 m/s downward.",
    },
  ],
  challenges: [
    {
      id: "ch2-016-ch1",
      difficulty: "medium",
      problem:
        "Compared to dropping from rest, does downward throw increase or decrease impact time?",
      hint: "Initial velocity already points toward ground.",
      answer: "Decrease.",
    },
  ],
};
