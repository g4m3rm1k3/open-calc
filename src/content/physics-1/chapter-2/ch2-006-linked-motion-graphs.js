export default {
  id: "ch2-006",
  slug: "linked-motion-graphs",
  chapter: 2,
  order: 6,
  title: "Linking x(t), v(t), and a(t)",
  subtitle: "Differentiate downward, integrate upward: the three-graph chain.",
  tags: ["triple graph", "derivative", "integral"],
  aliases: "x v a relationship triple graphs",
  hook: {
    question:
      "How do you move instantly between position, velocity, and acceleration views of the same motion?",
    realWorldContext:
      "Robotics and controls routinely switch between these representations to plan and verify trajectories.",
    previewVisualizationId: "TripleGraphIntuition",
  },
  intuition: {
    prose: [
      "The three graphs represent one motion state from three mathematical perspectives.",
      "Slope links x→v and v→a; area links a→v and v→x.",
    ],
    visualizations: [
      {
        id: "TripleGraphIntuition",
        title: "Derivative chain visual",
        mathBridge: "Move one graph and track how linked curves must change.",
        caption: "One motion, three synchronized views.",
      },
      {
        id: "TripleGraphExplorer",
        title: "Parameter-driven sync",
        mathBridge:
          "Adjust x0, v0, a and observe all graph families update together.",
        caption: "A consistency engine for kinematics intuition.",
      },
    ],
  },
  math: {
    prose: [
      "Core chain: v = dx/dt and a = dv/dt.",
      "Inverse chain: Δx = ∫v dt and Δv = ∫a dt.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Derivative chain",
        body: "a(t)=\\frac{dv}{dt}=\\frac{d^2x}{dt^2}",
      },
      {
        type: "theorem",
        title: "Integral chain",
        body: "v(t)=v_0+\\int a\\,dt,\\quad x(t)=x_0+\\int v\\,dt",
      },
    ],
    visualizations: [
      {
        id: "KinematicsFormRecogniser",
        title: "Chain-aware formula drill",
        mathBridge:
          "Identify which operation (differentiate/integrate) moves between quantities.",
        caption: "Direction of travel in the chain matters.",
      },
    ],
  },
  rigor: {
    prose: [
      "These relationships are equivalent statements from calculus definitions.",
    ],
    visualizationId: "KinematicsDerivativeProof",
    proofSteps: [
      { expression: "v=\\frac{dx}{dt}", annotation: "Velocity from position." },
      {
        expression: "a=\\frac{dv}{dt}=\\frac{d^2x}{dt^2}",
        annotation: "Acceleration from velocity and position.",
      },
      {
        expression: "x=x_0+\\int v\\,dt",
        annotation: "Recover position by integration.",
      },
    ],
    title: "Formal x-v-a equivalence",
  },
  examples: [
    {
      id: "ch2-006-ex1",
      title: "From acceleration to position",
      problem: "Given a=2, v0=1, x0=0, find v(t), x(t).",
      steps: [
        { expression: "v(t)=1+2t", annotation: "Integrate acceleration." },
        {
          expression: "x(t)=\\int (1+2t)dt=t+t^2",
          annotation: "Integrate velocity and apply x0=0.",
        },
      ],
      conclusion: "v and x follow directly from the chain.",
    },
  ],
  challenges: [
    {
      id: "ch2-006-ch1",
      difficulty: "hard",
      problem: "If x(t) is linear, what must a(t) be?",
      hint: "Differentiate twice.",
      answer: "a(t)=0 for all t.",
    },
  ],
};
