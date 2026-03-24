export default {
  id: "ch2-012",
  slug: "free-fall-basics",
  chapter: 2,
  order: 12,
  title: "Free Fall — Basics",
  subtitle:
    "Near Earth's surface, all objects fall with the same acceleration: g ≈ 9.8 m/s².",
  tags: ["free-fall-basics", "kinematics", "1D motion"],
  aliases: "free-fall-basics",
  hook: {
    question:
      "A feather and a hammer are dropped on the Moon. Which hits the ground first?",
    realWorldContext:
      "Free fall is the purest application of constant-acceleration kinematics. Galileo established that (without air resistance) all objects fall equally. This underpins every projectile calculation.",
    previewVisualizationId: "FreeFallIntuition",
  },
  videos: [
    {
      title: "Physics 2 – Motion in One Dimension (12 of 22) Free Fall: Basics",
      embedCode:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/JXphzQd_f9U" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: ["See the visualisation and key formula below."],
    callouts: [
      {
        type: "theorem",
        title: "Core formula",
        body: "a = -g = -9.8\,\text{m/s}^2 \quad (\text{taking up as positive})",
      },
    ],
    visualizations: [
      {
        id: "FreeFallIntuition",
        title: "Free Fall — Basics — intuition",
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
        body: "a = -g = -9.8\,\text{m/s}^2 \quad (\text{taking up as positive})",
      },
    ],
    visualizations: [
      {
        id: "FreeFallExplorer",
        title: "Free Fall — Basics — explorer",
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
        body: "a = -g = -9.8\,\text{m/s}^2 \quad (\text{taking up as positive})",
      },
    ],
    visualizationId: "KinematicProof",
    proofSteps: [
      {
        expression:
          "a = -g = -9.8\,\text{m/s}^2 \quad (\text{taking up as positive})",
        annotation: "Core result to be established.",
      },
    ],
    title: "Free Fall — Basics — derivation",
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
      id: "ch2-012-ex1",
      title: "Core application",
      problem: "Apply the formula to a standard Free Fall — Basics problem.",
      steps: [
        {
          expression:
            "a = -g = -9.8\,\text{m/s}^2 \quad (\text{taking up as positive})",
          annotation: "Direct application.",
        },
      ],
      conclusion: "Use systematic sign discipline.",
    },
  ],
  challenges: [
    {
      id: "ch2-012-ch1",
      difficulty: "medium",
      problem: "Apply Free Fall — Basics to a multi-step scenario.",
      hint: "Identify known/unknown quantities first.",
      walkthrough: [
        {
          expression:
            "a = -g = -9.8\,\text{m/s}^2 \quad (\text{taking up as positive})",
          annotation: "Apply systematically.",
        },
      ],
      answer: "See worked solution.",
    },
  ],
};
