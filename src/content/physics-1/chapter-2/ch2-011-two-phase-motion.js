export default {
  id: "ch2-011",
  slug: "two-phase-motion",
  chapter: 2,
  order: 11,
  title: "Two-Phase Motion Problems",
  subtitle: "Carry final state of phase 1 into initial state of phase 2.",
  tags: ["piecewise motion", "state handoff", "kinematics"],
  aliases: "two phase motion piecewise kinematics",
  hook: {
    question:
      "How do you solve motion with acceleration changes between intervals?",
    realWorldContext:
      "Vehicles commonly have acceleration, cruise, and braking phases; each phase has different equations but shared state continuity.",
    previewVisualizationId: "TwoPhaseMotionIntuition",
  },
  intuition: {
    prose: [
      "Split the timeline into phases with constant acceleration in each.",
      "Use x and v continuity at the boundary: x1(tf)=x2(t0), v1(tf)=v2(t0).",
    ],
    visualizations: [
      {
        id: "TwoPhaseMotionIntuition",
        title: "Phase handoff visual",
        mathBridge:
          "Watch phase-1 final conditions auto-feed into phase-2 initial conditions.",
        caption: "State continuity is the glue.",
      },
      {
        id: "KinematicEquationSelector",
        title: "Solve each phase",
        mathBridge:
          "Compute unknowns phase-by-phase with consistent carried values.",
        caption: "One timeline, two local solves.",
      },
    ],
  },
  math: {
    prose: ["Treat each phase as a local constant-acceleration model."],
    callouts: [
      {
        type: "definition",
        title: "Phase boundary conditions",
        body: "x_{1,f}=x_{2,0},\\quad v_{1,f}=v_{2,0}",
      },
    ],
    visualizations: [
      {
        id: "KinematicsPatternSpotter",
        title: "Phase-by-phase pattern quiz",
        mathBridge: "Choose the correct equation sequence for each phase.",
        caption: "Order of operations matters.",
      },
    ],
  },
  rigor: {
    prose: [
      "Piecewise integration yields continuous state trajectories when boundary conditions are enforced.",
    ],
    visualizationId: "TwoPhaseMotionIntuition",
    proofSteps: [
      {
        expression: "x_1(t),v_1(t)\\text{ on phase 1}",
        annotation: "Solve first interval.",
      },
      {
        expression: "x_2(0)=x_1(T),\\,v_2(0)=v_1(T)",
        annotation: "Apply continuity at handoff.",
      },
      {
        expression: "x_2(t),v_2(t)\\text{ on phase 2}",
        annotation: "Solve second interval with handed-off initial state.",
      },
    ],
    title: "Formal phase continuity",
  },
  examples: [
    {
      id: "ch2-011-ex1",
      title: "Accelerate then brake",
      problem:
        "Phase 1: v0=0, a=2 for 4 s. Phase 2: a=-1 until stop. Find total displacement.",
      steps: [
        { expression: "v_1=8,\\,x_1=16", annotation: "End phase 1." },
        {
          expression: "t_2=8,\\,x_2=8(8)+\\frac12(-1)(64)=32",
          annotation: "Phase 2 to stop.",
        },
        {
          expression: "x_{total}=48\\,\\text{m}",
          annotation: "Add phase displacements.",
        },
      ],
      conclusion: "Total displacement is 48 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-011-ch1",
      difficulty: "hard",
      problem:
        "In two-phase motion, which quantities must be continuous at the boundary?",
      hint: "Think state variables.",
      answer:
        "Position and velocity (for idealized instantaneous acceleration change models).",
    },
  ],
};
