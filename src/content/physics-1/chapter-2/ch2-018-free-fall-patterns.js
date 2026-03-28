export default {
  id: "ch2-018",
  slug: "free-fall-patterns",
  chapter: 2,
  order: 18,
  title: "Free Fall Pattern Recognition",
  subtitle: "Classify scenarios quickly from equations, signs, and graphs.",
  tags: ["pattern recognition", "free fall", "graphs"],
  aliases: "free fall quiz pattern spotting",
  hook: {
    question: "Can you identify a free-fall scenario in under 10 seconds?",
    realWorldContext:
      "Fast classification is crucial in timed assessments and rapid model selection workflows.",
    previewVisualizationId: "FreeFallPatternSpotter",
  },
  intuition: {
    prose: [
      "Pattern fluency means recognizing structure before computing numbers.",
      "Look for sign of acceleration, velocity trend, and turning-point cues.",
    ],
    visualizations: [
      {
        id: "FreeFallPatternSpotter",
        title: "Scenario quiz",
        mathBridge:
          "Classify upward launch, downward throw, and drop-from-rest signatures.",
        caption: "Recognition speeds solving.",
      },
      {
        id: "FreeFallExplorer",
        title: "Verification sandbox",
        mathBridge:
          "Test your classification by running the corresponding simulation case.",
        caption: "Instant feedback loop.",
      },
      {
        id: "ProjectilePatternSpotter",
        title: "Projectile pattern spotter",
        mathBridge:
          "Generalize free-fall pattern recognition to full 2D projectile scenarios.",
        caption: "Pattern literacy transfers directly to projectile questions.",
      },
      {
        id: "RangePatternSpotter",
        title: "Range-pattern spotter",
        mathBridge:
          "Practice identifying symmetric-angle and range-scaling patterns quickly.",
        caption: "Fast pattern recognition improves setup speed.",
      },
    ],
  },
  math: {
    prose: ["Use pattern checks before equation substitution."],
    callouts: [
      {
        type: "mnemonic",
        title: "Three quick checks",
        body: "(1) Axis convention, (2) sign of a, (3) expected velocity trend.",
      },
    ],
    visualizations: [
      {
        id: "KinematicsPatternSpotter",
        title: "General kinematics pattern drill",
        mathBridge:
          "Cross-train beyond free-fall to improve equation selection speed.",
        caption: "Transferable solving reflex.",
      },
    ],
  },
  rigor: {
    prose: [
      "Classification criteria come from the qualitative behavior of the governing equations.",
    ],
    visualizationId: "FreeFallPatternSpotter",
    proofSteps: [
      {
        expression: "a=-g\\text{ (up-positive)}",
        annotation: "Always fixed sign in ideal free fall.",
      },
      {
        expression: "v=v_0-gt",
        annotation: "Linear trend determines launch/drop pattern.",
      },
      {
        expression: "x=x_0+v_0t-\\frac12gt^2",
        annotation: "Concave-down position curve identifies gravity model.",
      },
    ],
    title: "Pattern criteria from equations",
  },
  examples: [
    {
      id: "ch2-018-ex1",
      title: "Identify scenario",
      problem:
        "Given v(0)>0 and v later crosses zero then becomes negative (up-positive), classify motion.",
      steps: [
        {
          expression: "\\text{Upward launch then descent}",
          annotation: "Velocity sign change indicates turning point.",
        },
      ],
      conclusion: "This is an upward launch case.",
    },
  ],
  challenges: [
    {
      id: "ch2-018-ch1",
      difficulty: "medium",
      problem:
        "Which single feature on x–t best indicates constant downward acceleration?",
      hint: "Think curvature.",
      answer: "Consistent concave-down curvature (up-positive convention).",
    },
  ],
};
