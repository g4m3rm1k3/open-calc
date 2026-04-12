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
    previewVisualizationId: 'SVGDiagram',
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
        id: 'VerticalThrow',
        props: {},
        title: "Free-fall motion intuition",
        mathBridge:
          "Launch from different heights/velocities and observe how velocity changes linearly while position changes quadratically.",
        caption: "Same acceleration law, many scenarios.",
      },
      {
        id: 'SVGDiagram',
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
        id: 'VerticalThrow',
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
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'free-fall-axes' },
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

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Free Fall Basics`,
    description: `Simulate free fall numerically and analytically: dropped from rest, thrown upward, and the effect of gravity on different planets.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Free fall — simulation and exploration',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Dropped from rest — analytical solution',
              prose: `An object is dropped from rest (v₀ = 0) from height h = 44.1 m. Taking up as positive and g = 9.8 m/s², find the time to hit the ground and the impact velocity.`,
              code: [
                `import numpy as np`,
                ``,
                `g  = 9.8    # m/s²`,
                `v0 = 0.0    # m/s  (dropped from rest)`,
                `y0 = 44.1   # m    (initial height above ground)`,
                ``,
                `# y(t) = y0 + v0*t - 0.5*g*t² = 0  at ground`,
                `# 0.5*g*t² = y0  →  t = sqrt(2*y0/g)`,
                `t_land = np.sqrt(2 * y0 / g)`,
                `v_land = v0 - g * t_land`,
                ``,
                `print(f"Time to ground : {t_land:.3f} s")`,
                `print(f"Impact velocity: {v_land:.3f} m/s  (negative = downward)")`,
                `print(f"|v_impact|     : {abs(v_land):.3f} m/s")`,
                `print(f"Cross-check: v² = v0²-2g*Δy → {v0**2 - 2*g*(-y0):.3f} = {v_land**2:.3f} ✓")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Plot y(t) and v(t) for a dropped object',
              prose: `Plot position and velocity versus time for an object dropped from 44.1 m. Observe the parabolic y(t) and linear v(t).`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `g = 9.8; v0 = 0.0; y0 = 44.1`,
                `t_land = np.sqrt(2 * y0 / g)`,
                `t = np.linspace(0, t_land, 300)`,
                ``,
                `y = y0 + v0*t - 0.5*g*t**2`,
                `v = v0 - g*t`,
                ``,
                `fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)`,
                `ax1.plot(t, y, lw=2, color='steelblue')`,
                `ax1.axhline(0, color='k', lw=0.8, ls='--', label='ground')`,
                `ax1.set_ylabel('Height y (m)')`,
                `ax1.set_title('Free fall from rest — dropped 44.1 m')`,
                `ax1.legend()`,
                `ax2.plot(t, v, lw=2, color='tomato')`,
                `ax2.axhline(0, color='k', lw=0.8)`,
                `ax2.set_xlabel('Time (s)')`,
                `ax2.set_ylabel('Velocity v (m/s)')`,
                `plt.tight_layout()`,
                `plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Upward throw — maximum height and flight time',
              prose: `An object is thrown upward at v₀ = 19.6 m/s from the ground. Find: peak height, time to peak, total flight time, and impact speed.`,
              code: [
                `g  = 9.8    # m/s²`,
                `v0 = 19.6   # m/s upward (positive)`,
                `y0 = 0.0    # ground level`,
                ``,
                `# At peak: v = 0`,
                `t_peak   = v0 / g`,
                `y_peak   = v0*t_peak - 0.5*g*t_peak**2`,
                ``,
                `# Total flight: y = 0 again  →  quadratic 0 = v0*t - 0.5*g*t²`,
                `t_total  = 2 * t_peak   # symmetry: rise time = fall time`,
                `v_impact = v0 - g*t_total  # negative (downward)`,
                ``,
                `print(f"Time to peak   : {t_peak:.3f} s")`,
                `print(f"Peak height    : {y_peak:.3f} m")`,
                `print(f"Total airtime  : {t_total:.3f} s")`,
                `print(f"Impact speed   : {abs(v_impact):.3f} m/s  (= launch speed ✓)")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — gravity on other planets',
              prose: `Compare free-fall times from 50 m on Earth, Mars (g = 3.72 m/s²), the Moon (g = 1.62 m/s²), and Jupiter (g = 24.8 m/s²). Plot time vs g.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `planets = {`,
                `    'Moon':    1.62,`,
                `    'Mars':    3.72,`,
                `    'Earth':   9.80,`,
                `    'Jupiter': 24.8,`,
                `}`,
                `h = 50.0  # m`,
                ``,
                `print(f"{'Planet':<10} {'g (m/s²)':>10} {'Fall time (s)':>14} {'Impact speed (m/s)':>20}")`,
                `print("-" * 58)`,
                `for name, g in planets.items():`,
                `    t = np.sqrt(2*h/g)`,
                `    v = np.sqrt(2*g*h)`,
                `    print(f"{name:<10} {g:>10.2f} {t:>14.3f} {v:>20.3f}")`,
                ``,
                `# Plot fall time vs g`,
                `g_vals = np.linspace(0.5, 30, 200)`,
                `t_vals = np.sqrt(2*h/g_vals)`,
                `fig, ax = plt.subplots(figsize=(7,4))`,
                `ax.plot(g_vals, t_vals, lw=2)`,
                `for name, g in planets.items():`,
                `    ax.scatter(g, np.sqrt(2*h/g), zorder=5, s=60)`,
                `    ax.annotate(name, (g, np.sqrt(2*h/g)), textcoords='offset points', xytext=(4,4))`,
                `ax.set_xlabel('g (m/s²)')`,
                `ax.set_ylabel('Fall time (s)')`,
                `ax.set_title(f'Time to fall {h} m from rest vs gravitational acceleration')`,
                `plt.tight_layout()`,
                `plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-012-q1',
      question: `Near Earth's surface (ignoring air resistance), what is the free-fall acceleration?`,
      options: [`9.8 m/s upward`, `9.8 m/s² downward`, `Depends on mass`, `Zero at the apex`],
      answer: 1,
      explanation: `$g \\approx 9.8$ m/s² directed downward. It is independent of mass (Galileo's insight) and is constant throughout the fall (for moderate heights).`,
    },
    {
      id: 'p1-ch2-012-q2',
      question: `With up = positive convention, what is $a$ in free fall?`,
      options: [`+9.8 m/s²`, `−9.8 m/s²`, `0`, `Depends on initial velocity`],
      answer: 1,
      explanation: `When up is positive, gravity (acting downward) gives $a = -g = -9.8$ m/s². The sign is determined by the convention, not by physics.`,
    },
    {
      id: 'p1-ch2-012-q3',
      question: `An object is dropped from rest. After 3 s, what is its velocity (up = positive, $g = 9.8$ m/s²)?`,
      options: [`+29.4 m/s`, `−29.4 m/s`, `−44.1 m/s`, `0`],
      answer: 1,
      explanation: `$v = v_0 - gt = 0 - 9.8(3) = -29.4$ m/s. Negative means downward in the up-positive convention.`,
    },
    {
      id: 'p1-ch2-012-q4',
      question: `An object dropped from rest falls for 3 s. What is its displacement (up = positive, $g = 9.8$ m/s²)?`,
      options: [`−44.1 m`, `+44.1 m`, `−29.4 m`, `−88.2 m`],
      answer: 0,
      explanation: `$\\Delta y = v_0 t - \\tfrac{1}{2}gt^2 = 0 - \\tfrac{1}{2}(9.8)(9) = -44.1$ m. Negative confirms the object moved downward.`,
    },
    {
      id: 'p1-ch2-012-q5',
      question: `A ball is thrown upward at 19.6 m/s. What is the maximum height reached above the launch point?`,
      options: [`9.8 m`, `19.6 m`, `39.2 m`, `4.9 m`],
      answer: 1,
      explanation: `At the peak, $v = 0$. Using $v^2 = v_0^2 - 2g\\Delta y$: $0 = (19.6)^2 - 2(9.8)\\Delta y \\Rightarrow \\Delta y = (19.6)^2 / (2 \\times 9.8) = 384.16 / 19.6 = 19.6$ m.`,
    },
    {
      id: 'p1-ch2-012-q6',
      question: `A ball is thrown upward at 19.6 m/s. How long does it take to reach the peak?`,
      options: [`1 s`, `2 s`, `3 s`, `4 s`],
      answer: 1,
      explanation: `At the peak, $v = 0$: $t = v_0/g = 19.6/9.8 = 2$ s.`,
    },
    {
      id: 'p1-ch2-012-q7',
      question: `A ball is thrown upward, rises, and lands back at the same height. What is the total flight time if it took 2 s to reach the peak?`,
      options: [`2 s`, `4 s`, `6 s`, `8 s`],
      answer: 1,
      explanation: `By symmetry of free fall, the fall time equals the rise time. Total airtime = $2 \\times t_{peak} = 2 \\times 2 = 4$ s. The descent is the mirror of the ascent (in the absence of air resistance).`,
    },
    {
      id: 'p1-ch2-012-q8',
      question: `A feather and a cannonball are both dropped simultaneously on the Moon (no atmosphere). Which hits the ground first?`,
      options: [
        `The cannonball — it is heavier`,
        `The feather — it has less mass to accelerate`,
        `They land at exactly the same time`,
        `Impossible to say without knowing heights`,
      ],
      answer: 2,
      explanation: `In free fall, $a = g$ regardless of mass. With no atmosphere, there is no air resistance. Both objects fall with $g_{Moon} \\approx 1.62$ m/s² and hit the ground simultaneously — Galileo's famous result confirmed on the Moon by Apollo 15.`,
    },
  ],
};
