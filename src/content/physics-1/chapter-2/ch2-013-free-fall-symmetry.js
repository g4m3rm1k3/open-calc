export default {
  id: "ch2-013",
  slug: "free-fall-symmetry",
  chapter: 'p2',
  order: 13,
  title: "Free Fall Symmetry",
  subtitle:
    "In ideal motion, ascent and descent mirror each other about the apex.",
  tags: ["free fall", "symmetry", "projectile"],
  aliases: "time up equals time down free fall symmetry",
  hook: {
    question:
      "Why does an object thrown straight up return with the same speed magnitude?",
    realWorldContext:
      "Ballistics and sports tracking rely on this symmetry as a first-order model before adding drag.",
    previewVisualizationId: "FreeFallSymmetryIntuition",
  },
  intuition: {
    prose: [
      "Without air resistance, acceleration is constant and downward.",
      "Velocity decreases linearly to zero at top, then increases linearly in magnitude downward.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Symmetric trajectory about the apex',
        caption: 'The trajectory y(t) = v₀t − ½gt² is a downward parabola. The apex is the axis of symmetry. Time to apex equals time from apex to the same height — a direct consequence of the quadratic structure. Algebra proves it; no calculus needed.',
      },
      {
        id: "FreeFallSymmetryIntuition",
        title: "Ascent-descent mirror",
        mathBridge: "Compare equal-time slices before and after the apex.",
        caption: "Same |v| at same height in opposite directions.",
      },
      {
        id: "FreeFallIntuition",
        title: "Trajectory and kinematics",
        mathBridge:
          "Animate launch speed and observe symmetric timing around the peak.",
        caption: "Apex is the turning point where v=0.",
      },
      {
        id: "RangeIntuition",
        title: "Complementary-angle symmetry",
        mathBridge:
          "Explore how angle pairs θ and 90°−θ produce equal range under ideal projectile assumptions.",
        caption:
          "Symmetry extends from vertical motion to full projectile geometry.",
      },
    ],
  },
  math: {
    prose: ["Use v=0 at top with v^2=v0^2+2aΔx to get max height."],
    visualizations: [
      {
        id: "FreeFallExplorer",
        title: "Symmetry calculator",
        mathBridge:
          "Solve for peak height, time up, and return speed under chosen sign convention.",
        caption: "Numerical and geometric views align.",
      },
    ],
  },
  rigor: {
    prose: [
      "Symmetry follows from constant acceleration and time-reversal structure of the equations.",
    ],
    visualizationId: "FreeFallSymmetryIntuition",
    proofSteps: [
      { expression: "v(t)=v_0-gt", annotation: "Linear velocity in time." },
      { expression: "t_{up}=\\frac{v_0}{g}", annotation: "Set v=0 at apex." },
      {
        expression: "t_{down}=t_{up}",
        annotation: "Mirror timing from identical displacement under same |a|.",
      },
    ],
    title: "Formal symmetry argument",
  },
  examples: [
    {
      id: "ch2-013-ex1",
      title: "Apex time",
      problem: "A ball is thrown up at 19.6 m/s. Find time to top.",
      steps: [
        {
          expression: "t_{up}=v_0/g=19.6/9.8=2\\,\\text{s}",
          annotation: "Use v=0 at top.",
        },
      ],
      conclusion: "Time to top is 2 s.",
    },
  ],
  challenges: [
    {
      id: "ch2-013-ch1",
      difficulty: "medium",
      problem:
        "At the launch height, what is return speed magnitude ignoring drag?",
      hint: "Use symmetry/energy.",
      answer: "Equal to launch speed magnitude.",
    },
  ],
};
