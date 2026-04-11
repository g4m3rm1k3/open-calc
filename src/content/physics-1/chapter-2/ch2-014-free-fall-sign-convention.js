export default {
  id: "ch2-014",
  slug: "free-fall-sign-convention",
  chapter: 'p2',
  order: 14,
  title: "Free Fall Sign Convention",
  subtitle: "Pick one positive direction and keep all quantities consistent.",
  tags: ["sign convention", "free fall", "kinematics"],
  aliases: "up positive down positive free fall signs",
  hook: {
    question:
      "Why do students get different answers from the same equation set?",
    realWorldContext:
      "Most free-fall mistakes are sign mistakes, not algebra mistakes.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "If up is positive, gravity is negative: a=-g.",
      "If down is positive, gravity is positive: a=+g.",
      "Either is valid if used consistently.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Axis orientation and sign of g',
        caption: 'The physics is axis-independent. Choosing +y upward makes a = −g (negative). Choosing +y downward makes a = +g (positive). Both give the same trajectory.',
      },
      {
        id: 'VerticalThrow',
        props: {},
        title: "Toggle sign conventions",
        mathBridge:
          "Switch conventions and verify physical outcomes remain identical when equations are applied consistently.",
        caption: "Convention changes symbols, not physics.",
      },
      {
        id: 'SVGDiagram',
        title: "Sign-consistency drill",
        mathBridge:
          "Classify scenarios by correct sign assignments for v0, a, and displacement.",
        caption: "Build reflex-level sign discipline.",
      },
    ],
  },
  math: {
    prose: ["Write your convention before substituting numbers."],
    callouts: [
      {
        type: "warning",
        title: "Common pitfall",
        body: "Mixing up-sign equations with down-sign numbers in the same line.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Equation recall with signs",
        mathBridge:
          "Practice selecting formulas and assigning signs under both conventions.",
        caption: "Form + sign = correct model.",
      },
      {
        id: 'SVGDiagram',
        title: "Projectile form recogniser",
        mathBridge:
          "Reinforce correct formula-form and sign usage across horizontal and vertical projectile components.",
        caption: "Consistent signs make multi-axis problems reliable.",
      },
    ],
  },
  rigor: {
    prose: [
      "Coordinate transforms preserve solutions if all terms transform consistently.",
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      {
        expression: "x'=-x,\\,v'=-v,\\,a'=-a",
        annotation: "Reverse axis orientation.",
      },
      {
        expression: "v'^2=v_0'^2+2a'\\Delta x'",
        annotation: "Equation form is invariant.",
      },
      {
        expression: "\\text{Physical trajectory unchanged}",
        annotation: "Only sign labels differ.",
      },
    ],
    title: "Why both conventions work",
  },
  examples: [
    {
      id: "ch2-014-ex1",
      title: "Same problem, two conventions",
      problem:
        "Drop from rest for 2 s. Compare displacement under up-positive and down-positive.",
      steps: [
        {
          expression: "\\Delta x=\\frac12(-9.8)(2^2)=-19.6\\,\\text{m}",
          annotation: "Up-positive.",
        },
        {
          expression: "\\Delta x=\\frac12(+9.8)(2^2)=+19.6\\,\\text{m}",
          annotation: "Down-positive.",
        },
      ],
      conclusion: "Same physical fall; different coordinate sign.",
    },
  ],
  challenges: [
    {
      id: "ch2-014-ch1",
      difficulty: "medium",
      problem:
        "If up is positive and an object is thrown downward, what sign is v0?",
      hint: "Direction vs axis.",
      answer: "Negative.",
    },
  ],
};
