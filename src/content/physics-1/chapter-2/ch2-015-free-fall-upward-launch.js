export default {
  id: "ch2-015",
  slug: "free-fall-upward-launch",
  chapter: 'p2',
  order: 15,
  title: "Free Fall: Upward Launch",
  subtitle: "Analyze rise, apex, and descent after an upward throw.",
  tags: ["upward throw", "apex", "free fall"],
  aliases: "vertical launch upward throw",
  hook: {
    question: "How high does it go, and when does it return?",
    realWorldContext:
      "Projectile prediction in sports and safety engineering starts with this idealized vertical model.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "At the top point, velocity is zero but acceleration is still -g.",
      "Motion is one continuous trajectory with changing velocity sign.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Upward launch: v₀ > 0, a = −g',
        caption: 'v₀ is positive (upward). a = −9.8 m/s² (downward, always). The object decelerates, reaches apex where v = 0, then accelerates downward. The sign of v changes; the sign of a never does.',
      },
      {
        id: 'VerticalThrow',
        props: {},
        title: "Upward launch animation",
        mathBridge:
          "Vary launch speed and observe apex height/time and return behavior.",
        caption: "Apex is a velocity event, not an acceleration event.",
      },
      {
        id: 'VerticalThrow',
        title: "Launch solver",
        mathBridge: "Compute max height, time to apex, and round-trip time.",
        caption: "Link animation and equations.",
      },
      {
        id: 'VerticalThrow',
        title: "Angled launch decomposition",
        mathBridge:
          "Connect vertical-launch ideas to full projectile decomposition into horizontal and vertical components.",
        caption:
          "Upward-launch logic is the y-component of general projectile motion.",
      },
    ],
  },
  math: {
    prose: ["Use v=0 at peak, then solve with constant acceleration formulas."],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Equation chooser",
        mathBridge:
          "Pick unknowns (height/time/velocity) and see best-fit equation.",
        caption: "Efficient selection for launch problems.",
      },
      {
        id: 'SVGDiagram',
        title: "Projectile derivation map",
        mathBridge:
          "Follow the full two-axis derivation and identify where upward-launch equations appear as a special case.",
        caption: "Formal bridge from 1D free-fall to 2D projectile equations.",
      },
    ],
  },
  rigor: {
    prose: ["Results follow from constant acceleration under uniform gravity."],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      { expression: "v=v_0-gt", annotation: "Velocity model." },
      {
        expression: "0=v_0-gt_{up}\\Rightarrow t_{up}=v_0/g",
        annotation: "Apex condition.",
      },
      {
        expression: "h_{max}=v_0t_{up}-\\frac12gt_{up}^2=\\frac{v_0^2}{2g}",
        annotation: "Substitute apex time.",
      },
    ],
    title: "Upward-launch derivation",
  },
  examples: [
    {
      id: "ch2-015-ex1",
      title: "Max height",
      problem: "A ball is launched upward at 14 m/s. Find maximum height.",
      steps: [
        {
          expression: "h_{max}=\\frac{14^2}{2(9.8)}=10\\,\\text{m}",
          annotation: "Use apex formula.",
        },
      ],
      conclusion: "Maximum height is 10 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-015-ch1",
      difficulty: "medium",
      problem: "At apex, what are v and a?",
      hint: "Do not set a=0.",
      answer: "v=0, a=-g.",
    },
  ],
};
