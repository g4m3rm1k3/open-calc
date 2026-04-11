export default {
  id: "ch2-021",
  slug: "two-objects-meeting-problems",
  chapter: 'p2',
  order: 21,
  title: "Two-Object Meeting Problems",
  subtitle: "Set x1(t)=x2(t) to find meeting time and location.",
  tags: ["relative motion", "meeting point", "two objects"],
  aliases: "chase problem head on problem meeting point",
  hook: {
    question: "When do two moving objects occupy the same position?",
    realWorldContext:
      "Intercept, pursuit, and collision-avoidance systems all solve meeting-point equations continuously.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "Write separate position functions for each object in the same coordinate frame.",
      "Meeting condition is x1(t)=x2(t).",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'two-objects-line' },
        title: 'The meeting condition',
        caption: 'Two objects meet when they occupy the same position at the same time: xₐ(t) = x_b(t). Write each position as a SUVAT equation, set them equal, solve for t. Pure algebra.',
      },
      {
        id: 'SVGDiagram',
        title: "Dual-trajectory visual",
        mathBridge: "Track both x(t) curves and highlight intersection event.",
        caption: "Intersection in graph space is meeting in physical space.",
      },
      {
        id: 'SVGDiagram',
        title: "Preset scenarios",
        mathBridge:
          "Solve chase, head-on, and same-direction problems with displayed algebra.",
        caption: "One framework, many contexts.",
      },
      {
        id: 'SVGDiagram',
        title: "Trajectory-slope intersection",
        mathBridge:
          "Model landing on an incline by equating trajectory and slope equations to find their meeting point.",
        caption: "Same meeting principle, now between two curves.",
      },
    ],
  },
  math: {
    prose: ["Relative motion can reduce setup complexity: x_rel = x1 - x2."],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Meeting-point quiz",
        mathBridge:
          "Identify equation setup and solve for physically valid meeting time.",
        caption: "Reject nonphysical roots (e.g., negative time).",
      },
    ],
  },
  rigor: {
    prose: [
      "Meeting problems are root-finding tasks on the difference function f(t)=x1(t)-x2(t).",
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      { expression: "x_1(t)-x_2(t)=0", annotation: "Meeting condition." },
      {
        expression: "f(t)=0",
        annotation: "Convert to single-function root problem.",
      },
      {
        expression: "t\\ge 0",
        annotation: "Apply physical time-domain constraint.",
      },
    ],
    title: "Formal meeting condition",
  },
  examples: [
    {
      id: "ch2-021-ex1",
      title: "Catch-up case",
      problem: "x1=2t, x2=20+t. Find meeting time and position.",
      steps: [
        {
          expression: "2t=20+t\\Rightarrow t=20\\,\\text{s}",
          annotation: "Set positions equal.",
        },
        {
          expression: "x=2(20)=40\\,\\text{m}",
          annotation: "Substitute into either equation.",
        },
      ],
      conclusion: "They meet at 20 s and 40 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-021-ch1",
      difficulty: "medium",
      problem: "If x1(t)=5t and x2(t)=10+5t, do they meet?",
      hint: "Compare relative speed.",
      answer: "No. Relative speed is zero and initial separation is nonzero.",
    },
  ],
};
