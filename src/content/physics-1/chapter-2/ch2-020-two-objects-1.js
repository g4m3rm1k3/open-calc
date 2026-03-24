export default {
  id: "ch2-020",
  slug: "two-objects-1",
  chapter: 2,
  order: 20,
  title: "Two Objects — Meeting Problems (Part 1)",
  subtitle:
    "When do two objects at different positions with different velocities meet?",
  tags: ["two-objects-1", "kinematics", "1D motion"],
  aliases: "two-objects-1",
  hook: {
    question:
      "Car A is at x = 0 moving at 20 m/s. Car B is 100 m ahead moving at 15 m/s. When does A catch B?",
    realWorldContext:
      "Two-object problems appear in every physics exam. The trick: write x(t) for each object and set them equal.",
    previewVisualizationId: "TwoObjectsIntuition",
  },
  videos: [
    {
      title: "Physics 2 – Motion in One Dimension (20 of 22) Two Objects",
      embedCode:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/NgVoFl4G6IE" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: [
      "Meeting problems are about position equality, not velocity equality.",
      "Write one position model for each object in the same coordinate system and same time origin.",
      "Then set the two position functions equal and solve for physically valid time (t≥0).",
    ],
    callouts: [
      { type: "definition", title: "Meeting condition", body: "x_A(t)=x_B(t)" },
      {
        type: "warning",
        title: "Common mistake",
        body: "Using different time origins for each object without converting them first.",
      },
    ],
    visualizations: [
      {
        id: "TwoObjectsIntuition",
        title: "Dual-position meeting view",
        mathBridge:
          "Observe both x(t) curves and identify the intersection as the meeting event.",
        caption: "Intersection in x–t space equals same place at same time.",
      },
    ],
  },
  math: {
    prose: [
      "For constant velocity motion, use linear models: x_A=x_{A0}+v_A t and x_B=x_{B0}+v_B t.",
      "Equivalent relative-motion form: x_{rel}(t)=x_A-x_B=(x_{A0}-x_{B0})+(v_A-v_B)t. Meeting occurs when x_{rel}=0.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Catch-up time (constant velocities)",
        body: "t=\\frac{x_{B0}-x_{A0}}{v_A-v_B}\\quad (v_A>v_B)",
      },
      {
        type: "insight",
        title: "No meeting case",
        body: "If relative velocity is zero and initial separation is nonzero, they never meet.",
      },
    ],
    visualizations: [
      {
        id: "TwoObjectsExplorer",
        title: "Chase/head-on scenario explorer",
        mathBridge:
          "Test chase, head-on, and opposite-direction cases with algebra shown beside graphs.",
        caption: "One equation frame handles many story problems.",
      },
    ],
  },
  rigor: {
    prose: [
      "Define f(t)=x_A(t)-x_B(t). A meeting occurs exactly when f(t)=0.",
      "For linear x_A and x_B, f(t) is linear, so there is at most one meeting time unless the functions are identical.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Root-finding view",
        body: "f(t)=x_A(t)-x_B(t);\\;\\text{meeting}\\iff f(t)=0",
      },
    ],
    visualizationId: "KinematicProof",
    proofSteps: [
      {
        expression: "x_A(t)=x_{A0}+v_A t,\\quad x_B(t)=x_{B0}+v_B t",
        annotation: "Model each trajectory.",
      },
      { expression: "x_A(t)=x_B(t)", annotation: "Impose meeting condition." },
      {
        expression: "t=\\frac{x_{B0}-x_{A0}}{v_A-v_B}",
        annotation: "Solve and enforce t\\ge 0 for physical validity.",
      },
    ],
    title: "Deriving the two-object meeting equation",
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
      id: "ch2-020-ex1",
      title: "Catch-up example",
      problem:
        "\\text{A starts at }x=0\\text{ with }v_A=20\\,\\text{m/s}.\\text{ B starts at }x=100\\text{ with }v_B=15\\,\\text{m/s}.\\text{ Find meeting time and position.}",
      steps: [
        {
          expression: "x_A=20t,\\quad x_B=100+15t",
          annotation: "Write position models.",
        },
        {
          expression:
            "20t=100+15t\\Rightarrow 5t=100\\Rightarrow t=20\\,\\text{s}",
          annotation: "Apply meeting condition.",
        },
        {
          expression: "x=20(20)=400\\,\\text{m}",
          annotation: "Substitute back to get location.",
        },
      ],
      conclusion: "They meet after 20 s at x=400 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-020-ch1",
      difficulty: "medium",
      problem:
        "\\text{A starts at }x=0\\text{ with }v_A=12\\,\\text{m/s},\\text{ B at }x=30\\text{ with }v_B=12\\,\\text{m/s}.\\text{ Do they meet?}",
      hint: "Check relative velocity first.",
      walkthrough: [
        { expression: "v_A-v_B=0", annotation: "No relative closing speed." },
        {
          expression: "x_{B0}-x_{A0}=30\\neq 0",
          annotation: "Initial separation persists forever.",
        },
      ],
      answer: "No, they never meet.",
    },
  ],
};
