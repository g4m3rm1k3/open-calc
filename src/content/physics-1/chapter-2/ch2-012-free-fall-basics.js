export default {
  id: "ch2-012",
  slug: "free-fall-basics",
  chapter: 'p2',
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
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: [
      "Free fall means gravity is the only significant force (air resistance neglected).",
      "Near Earth's surface, acceleration is approximately constant and downward with magnitude g≈9.8 m/s².",
      "Mass does not appear in the kinematic equations for ideal free fall, so all objects share the same acceleration in this model.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Free-fall acceleration",
        body: "a=-g\approx-9.8\,\\text{m/s}^2\quad(\\text{up-positive convention})",
      },
      {
        type: "warning",
        title: "Convention first",
        body: "If you choose down-positive, then use a=+g consistently everywhere.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Sign convention: upward positive',
        caption: 'g = 9.8 m/s² always points downward. When +y is upward, acceleration a = −g = −9.8 m/s². The trajectory y(t) curves downward because a is negative.',
      },
      {
        id: "FreeFallIntuition",
        title: "Free-fall motion intuition",
        mathBridge:
          "Launch from different heights/velocities and observe how velocity changes linearly while position changes quadratically.",
        caption: "Same acceleration law, many scenarios.",
      },
      {
        id: "IndependentMotionIntuition",
        title: "Horizontal vs vertical independence",
        mathBridge:
          "Compare a dropped object with a horizontally launched object to see identical fall-time under the same vertical conditions.",
        caption:
          "Vertical gravity dynamics are independent of horizontal motion.",
      },
    ],
  },
  math: {
    prose: [
      "Use the standard constant-acceleration equations with a replaced by ±g according to your axis choice.",
      "A reliable workflow is: choose convention, write knowns with sign, choose equation by unknowns, then check physical reasonableness.",
    ],
    callouts: [
      {
        type: "insight",
        title: "Core free-fall set (up-positive)",
        body: "v=v_0-gt,\\quad y=y_0+v_0t-\\frac12gt^2,\\quad v^2=v_0^2-2g(y-y_0)",
      },
    ],
    visualizations: [
      {
        id: "FreeFallExplorer",
        title: "Sign-convention explorer",
        mathBridge:
          "Toggle up-positive/down-positive and verify that physical predictions are identical when signs are applied consistently.",
        caption: "Notation changes, physics does not.",
      },
    ],
  },
  rigor: {
    prose: [
      "From Newtonian mechanics near Earth, gravitational force gives approximately constant acceleration over moderate height changes.",
      "With a(t)=constant, free-fall kinematics is a direct specialization of the constant-acceleration calculus derivation.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Model statement",
        body: "a(t)=\\text{constant}=-g\;(\\text{or }+g\\text{ by axis choice})",
      },
    ],
    visualizationId: "FreeFallExplorer",
    proofSteps: [
      {
        expression: "a=-g",
        annotation:
          "Assume constant acceleration due to gravity in chosen axis.",
      },
      {
        expression: "v=v_0+at\\Rightarrow v=v_0-gt",
        annotation: "Integrate acceleration once.",
      },
      {
        expression:
          "y=y_0+v_0t+\\frac12at^2\\Rightarrow y=y_0+v_0t-\\frac12gt^2",
        annotation: "Integrate velocity to position.",
      },
    ],
    title: "Deriving the basic free-fall equations",
    visualizations: [],
  },
  examples: [
    {
      id: "ch2-012-ex1",
      title: "Dropped from rest",
      problem:
        "\\text{An object is dropped from rest. Find }v\\text{ and }\\Delta y\\text{ after }3\\text{ s (up-positive).}",
      steps: [
        {
          expression: "v=v_0-gt=0-9.8(3)=-29.4\\,\\text{m/s}",
          annotation: "Velocity is downward (negative in up-positive axis).",
        },
        {
          expression:
            "\\Delta y=v_0t-\\frac12gt^2=0-\\frac12(9.8)(9)=-44.1\\,\\text{m}",
          annotation: "Object is 44.1 m below release point.",
        },
      ],
      conclusion: "After 3 s: v=-29.4 m/s and Δy=-44.1 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-012-ch1",
      difficulty: "medium",
      problem:
        "\\text{Thrown upward at }19.6\\,\\text{m/s},\\text{ find max height (up-positive).}",
      hint: "At max height, v=0.",
      walkthrough: [
        {
          expression:
            "0=v_0^2-2g\\Delta y\\Rightarrow \\Delta y=\\frac{v_0^2}{2g}=\\frac{(19.6)^2}{19.6}=19.6\\,\\text{m}",
          annotation: "Use no-time equation with apex condition.",
        },
      ],
      answer: "Maximum height is 19.6 m above launch point.",
    },
  ],
};
