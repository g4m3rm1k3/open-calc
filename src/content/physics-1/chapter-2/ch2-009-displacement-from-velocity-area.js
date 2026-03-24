export default {
  id: "ch2-009",
  slug: "displacement-from-velocity-area",
  chapter: 2,
  order: 9,
  title: "Displacement from Velocity Area",
  subtitle:
    "Integrate velocity to get net displacement, even with changing speed.",
  tags: ["integration", "velocity", "area"],
  aliases: "area under velocity graph integration displacement",
  hook: {
    question:
      "Why is area under the v–t graph the physically correct displacement?",
    realWorldContext:
      "Sensors return sampled velocities; integrating those samples is how systems estimate position in practice.",
    previewVisualizationId: "IntegrationIntuition",
  },
  intuition: {
    prose: [
      "Small rectangles under v–t approximate displacement over short intervals.",
      "As interval width shrinks, the sum converges to the exact integral.",
    ],
    visualizations: [
      {
        id: "IntegrationIntuition",
        title: "Riemann sum to exact area",
        mathBridge:
          "Increase partition count and watch numerical displacement converge to exact value.",
        caption: "Integral as limit of accumulated motion slices.",
      },
    ],
  },
  math: {
    prose: [
      "Signed area below axis reduces net displacement, matching directional motion.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Displacement integral",
        body: "\\Delta x=\\int_{t_1}^{t_2}v(t)\\,dt",
      },
    ],
    visualizations: [
      {
        id: "VelocityGraphExplorer",
        title: "Signed area sandbox",
        mathBridge:
          "See positive and negative area regions combine into net displacement.",
        caption: "Direction-aware accumulation.",
      },
    ],
  },
  rigor: {
    prose: [
      "This is a direct application of the fundamental theorem of calculus.",
    ],
    visualizationId: "KinematicsDerivativeProof",
    proofSteps: [
      {
        expression: "v=\\frac{dx}{dt}",
        annotation: "Velocity is derivative of position.",
      },
      { expression: "dx=v\\,dt", annotation: "Rearrange differential form." },
      {
        expression: "x(t_2)-x(t_1)=\\int_{t_1}^{t_2}v(t)\\,dt",
        annotation: "Integrate both sides.",
      },
    ],
    title: "Formal area-displacement link",
  },
  examples: [
    {
      id: "ch2-009-ex1",
      title: "Piecewise velocity",
      problem: "v=4 m/s for 3 s, then v=-2 m/s for 2 s. Find net displacement.",
      steps: [
        {
          expression: "\\Delta x_1=4(3)=12\\,\\text{m}",
          annotation: "Positive area.",
        },
        {
          expression: "\\Delta x_2=-2(2)=-4\\,\\text{m}",
          annotation: "Negative area.",
        },
        {
          expression: "\\Delta x_{net}=8\\,\\text{m}",
          annotation: "Add signed areas.",
        },
      ],
      conclusion: "Net displacement is 8 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-009-ch1",
      difficulty: "medium",
      problem:
        "Can total distance exceed |net displacement| on the same v–t graph?",
      hint: "Compare signed area vs absolute area.",
      answer:
        "Yes. Distance sums absolute area; displacement sums signed area.",
    },
  ],
};
