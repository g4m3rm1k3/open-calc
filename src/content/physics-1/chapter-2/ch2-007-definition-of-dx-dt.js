export default {
  id: "ch2-007",
  slug: "definition-of-dx-dt",
  chapter: 2,
  order: 7,
  title: "Definition of dx/dt",
  subtitle:
    "The derivative as a limit: from average velocity to instantaneous velocity.",
  tags: ["definition-of-dx-dt", "kinematics", "1D motion"],
  aliases: "definition-of-dx-dt",
  hook: {
    question:
      "How can velocity be defined at a single instant when velocity requires a time interval to measure?",
    realWorldContext:
      "The limit definition bridges the gap between physics and calculus. This is the foundation of differential calculus applied to motion.",
    previewVisualizationId: "DerivativeLimitIntuition",
  },
  videos: [
    {
      title:
        "Physics 2 – Motion in One Dimension (7 of 22) Definition of dx/dt",
      embedCode:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/R50pjSK4yZg" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: [
      "Average velocity over a time interval is easy: divide displacement by elapsed time.",
      "But many physics questions ask for velocity at a single instant. A single instant has no width, so we approximate it with smaller and smaller intervals around that time.",
      "As the interval shrinks, secant slope converges to tangent slope. That limiting value is instantaneous velocity.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Average velocity",
        body: "\\bar{v}=\\frac{\\Delta x}{\\Delta t}",
      },
      {
        type: "theorem",
        title: "Instantaneous velocity",
        body: "v(t)=\\lim_{\\Delta t\\to 0}\\frac{x(t+\\Delta t)-x(t)}{\\Delta t}=\\frac{dx}{dt}",
      },
      {
        type: "insight",
        title: "Geometry meaning",
        body: "Secant slope (two points) approaches tangent slope (one point limit).",
      },
    ],
    visualizations: [
      {
        id: "DerivativeLimitIntuition",
        title: "Secant to tangent transition",
        mathBridge:
          "Drag the second point closer to t and watch the secant slope converge to the tangent slope.",
        caption:
          "The limit process turns average rate into instantaneous rate.",
      },
    ],
  },
  math: {
    prose: [
      "Computationally, you can evaluate the derivative analytically or estimate it numerically with tiny \\Delta t.",
      "For smooth functions, numerical secant estimates converge rapidly to the exact derivative near the target time.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Difference quotient",
        body: "\\frac{x(t+h)-x(t)}{h}",
      },
      {
        type: "warning",
        title: "Numerical caution",
        body: "If h is too large, approximation error dominates. If h is too tiny in floating-point, round-off can dominate.",
      },
    ],
    visualizations: [
      {
        id: "DerivativeLimitExplorer",
        title: "Numerical convergence table",
        mathBridge:
          "Compare secant estimates for h=1,0.5,0.1,0.01 and see convergence toward dx/dt.",
        caption: "Convergence quality is the evidence for the limit.",
      },
    ],
  },
  rigor: {
    prose: [
      "Let x(t) be differentiable at t. By definition of derivative, the limit of the difference quotient exists and equals x'(t).",
      "Physics interprets x'(t) as instantaneous velocity because it is the unique value that local linear motion approaches over arbitrarily short intervals.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Formal statement",
        body: "v(t)=x'(t)=\\lim_{\\Delta t\\to 0}\\frac{x(t+\\Delta t)-x(t)}{\\Delta t}",
      },
    ],
    visualizationId: "KinematicsDerivativeProof",
    proofSteps: [
      {
        expression:
          "\\bar{v}(t,\\Delta t)=\\frac{x(t+\\Delta t)-x(t)}{\\Delta t}",
        annotation: "Average velocity over finite interval.",
      },
      {
        expression: "v(t)=\\lim_{\\Delta t\\to 0}\\bar{v}(t,\\Delta t)",
        annotation: "Define instantaneous velocity as limiting average.",
      },
      {
        expression:
          "v(t)=\\lim_{\\Delta t\\to 0}\\frac{x(t+\\Delta t)-x(t)}{\\Delta t}=\\frac{dx}{dt}",
        annotation: "Derivative definition gives final identity.",
      },
    ],
    title: "Deriving instantaneous velocity from first principles",
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
      id: "ch2-007-ex1",
      title: "Differentiate a position function",
      problem:
        "\\text{Given }x(t)=3t^2-2t+1,\\text{ find }v(t)\\text{ and }v(2).",
      steps: [
        {
          expression: "v(t)=\\frac{dx}{dt}=6t-2",
          annotation: "Differentiate term by term.",
        },
        {
          expression: "v(2)=6(2)-2=10\\,\\text{m/s}",
          annotation: "Evaluate at t=2 s.",
        },
      ],
      conclusion: "Instantaneous velocity at 2 s is 10 m/s.",
    },
  ],
  challenges: [
    {
      id: "ch2-007-ch1",
      difficulty: "medium",
      problem:
        "\\text{If }x(t)=t^3,\\text{ estimate }v(1)\\text{ using }h=0.1\\text{ and compare with exact derivative.}",
      hint: "Use [x(1+h)-x(1)]/h then compute x'(t).",
      walkthrough: [
        {
          expression: "\\frac{x(1.1)-x(1)}{0.1}=\\frac{1.331-1}{0.1}=3.31",
          annotation: "Forward-difference estimate.",
        },
        {
          expression: "x'(t)=3t^2\\Rightarrow x'(1)=3",
          annotation: "Exact instantaneous velocity.",
        },
      ],
      answer: "Estimated 3.31, exact 3.0 (estimate improves as h shrinks).",
    },
  ],
};
