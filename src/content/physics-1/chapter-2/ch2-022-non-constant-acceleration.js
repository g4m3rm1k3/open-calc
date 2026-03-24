export default {
  id: "ch2-022",
  slug: "non-constant-acceleration",
  chapter: 2,
  order: 22,
  title: "Non-Constant Acceleration",
  subtitle:
    "When acceleration varies with time, only calculus gives the exact answer.",
  tags: ["non-constant-acceleration", "kinematics", "1D motion"],
  aliases: "non-constant-acceleration",
  hook: {
    question:
      "a(t) = 6t. What is the velocity at t = 3 s if v₀ = 2 m/s? What is the displacement from t = 0 to t = 3?",
    realWorldContext:
      "The kinematic equations assume constant acceleration. When a varies, integration is the only correct approach — and it gives exact answers without memorising new formulas.",
    previewVisualizationId: "VariableAccelerationIntuition",
  },
  videos: [
    {
      title:
        "Physics 2 – Motion in One Dimension (22 of 22) Acceleration Not Constant",
      embedCode:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/ZJTtyYKKsuI" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: [
      "Constant-acceleration formulas fail when acceleration changes with time.",
      "In that case, we accumulate acceleration to get velocity, then accumulate velocity to get position.",
      "This is the calculus pipeline: a(t) → integrate → v(t) → integrate → x(t).",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Variable-acceleration backbone",
        body: "v(t)=v_0+\\int_0^t a(\\tau)\\,d\\tau,\\quad x(t)=x_0+\\int_0^t v(\\tau)\\,d\\tau",
      },
      {
        type: "warning",
        title: "Domain check",
        body: "SUVAT equations are only valid when a is constant over the interval.",
      },
    ],
    visualizations: [
      {
        id: "VariableAccelerationIntuition",
        title: "Integration chain intuition",
        mathBridge:
          "Switch acceleration presets and observe how integrating a(t) reshapes v(t), then how integrating v(t) reshapes x(t).",
        caption: "The shape of a(t) controls everything downstream.",
      },
    ],
  },
  math: {
    prose: [
      "For polynomial a(t), symbolic integration gives exact formulas for v(t) and x(t).",
      "For arbitrary sampled a(t), numerical integration (e.g., Euler/trapezoid) provides practical approximations.",
    ],
    callouts: [
      {
        type: "insight",
        title: "Two-step solve recipe",
        body: "(1)\\;v(t)=v_0+\\int a(t)dt\\quad (2)\\;x(t)=x_0+\\int v(t)dt",
      },
    ],
    visualizations: [
      {
        id: "VariableAccelerationExplorer",
        title: "Analytic vs numeric explorer",
        mathBridge:
          "Compare exact integration to Euler approximation and inspect error as timestep changes.",
        caption: "Numerics converge to analytic solution with finer steps.",
      },
    ],
  },
  rigor: {
    prose: [
      "From definitions, a(t)=dv/dt and v(t)=dx/dt. Integrating each differential equation with initial conditions gives unique state trajectories.",
      "This framework generalizes constant-acceleration kinematics and is the correct model whenever acceleration is time-varying.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Initial-value form",
        body: "\\frac{dv}{dt}=a(t),\\;v(0)=v_0;\\quad \\frac{dx}{dt}=v(t),\\;x(0)=x_0",
      },
    ],
    visualizationId: "KinematicsDerivativeProof",
    proofSteps: [
      {
        expression: "\\frac{dv}{dt}=a(t)",
        annotation: "Start from acceleration definition.",
      },
      {
        expression: "v(t)-v_0=\\int_0^t a(\\tau)\\,d\\tau",
        annotation: "Integrate with initial condition v(0)=v0.",
      },
      {
        expression:
          "\\frac{dx}{dt}=v(t)\\Rightarrow x(t)-x_0=\\int_0^t v(\\tau)\\,d\\tau",
        annotation: "Integrate velocity to obtain position.",
      },
    ],
    title: "Deriving motion with variable acceleration",
    visualizations: [
      {
        id: "KinematicsDerivativeProof",
        title: "Proof steps",
        mathBridge: "Each step builds on the previous.",
      },
    ],
  },
  examples: [
    {
      id: "ch2-022-ex1",
      title: "Polynomial acceleration example",
      problem:
        "\\text{Given }a(t)=6t,\\;v_0=2,\\;x_0=0.\\text{ Find }v(3)\\text{ and }x(3).",
      steps: [
        {
          expression: "v(t)=2+\\int_0^t6\\tau\\,d\\tau=2+3t^2",
          annotation: "Integrate acceleration once.",
        },
        {
          expression: "v(3)=2+3(9)=29\\,\\text{m/s}",
          annotation: "Evaluate at t=3 s.",
        },
        {
          expression:
            "x(t)=\\int_0^t(2+3\\tau^2)d\\tau=2t+t^3\\Rightarrow x(3)=6+27=33\\,\\text{m}",
          annotation: "Integrate velocity and evaluate.",
        },
      ],
      conclusion: "At 3 s, velocity is 29 m/s and displacement is 33 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-022-ch1",
      difficulty: "medium",
      problem: "\\text{If }a(t)=4-2t\\text{ and }v_0=1,\\text{ find }v(t).",
      hint: "Integrate a(t) from 0 to t and add v0.",
      walkthrough: [
        {
          expression: "v(t)=1+\\int_0^t(4-2\\tau)d\\tau=1+4t-t^2",
          annotation: "Single integration step with initial condition.",
        },
      ],
      answer: "v(t)=1+4t-t^2.",
    },
  ],
};
