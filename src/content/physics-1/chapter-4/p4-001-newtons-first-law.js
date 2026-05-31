export default {
  id: 'p1-ch4-001',
  slug: 'newtons-first-law',
  chapter: 'p4',
  order: 0,
  title: "Newton's First Law: Inertia",
  subtitle: 'The natural state of an object is not rest — it is whatever it is already doing.',
  tags: ['newtons-first-law', 'inertia', 'net-force', 'equilibrium', 'dynamics'],

  hook: {
    question: 'A hockey puck sliding on ice gradually slows to a stop. Aristotle used this as proof that objects need a continuous force to keep moving. Newton showed this reasoning was exactly backwards. Who is right, and how do we know?',
    realWorldContext: "For two thousand years, the most respected answer to 'why do things move?' came from Aristotle: objects move because something pushes them, and when the pushing stops, they stop. This felt obviously true — push a book across a table, let go, it stops. Push a cart, let go, it stops. It took Galileo's experiments and Newton's genius to reveal the hidden variable Aristotle missed: friction. Strip friction away, and objects keep moving forever. That insight — the natural state of motion is constant velocity, not rest — overturned two millennia of physics and made the modern world possible.",
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'kinematic-chain' },
  },

  intuition: {
    prose: [
      "**Where you are in the story.** In Chapters 2 and 3, you built a complete toolkit for describing motion: position x(t), velocity v(t), acceleration a(t), the SUVAT equations, projectile motion, circular motion. You could answer every question of the form 'given this acceleration, where does the object end up?' But there was always a variable you accepted without explanation — the acceleration itself. You were told a = 9.8 m/s² downward or a = 5 m/s² to the right and you used it. Chapter 4 asks the deeper question: where does acceleration come from? What causes it? This is the shift from kinematics (describing motion) to dynamics (explaining motion). The answer is Newton's three laws, and this lesson is the first.",

      "**Aristotle's theory — and why it seemed bulletproof.** Push a book across a table. The moment you stop pushing, the book stops moving. Push a cart. The moment your hand leaves it, the cart slows and stops. Aristotle saw this pattern and concluded: motion requires a continuously applied force. Rest is the natural state. Objects return to rest when the force is removed. For over two thousand years this was accepted physics, and it was hard to argue with — you could test it a hundred times and it always seemed true. The problem was not with his observations. The problem was with what he was not observing.",

      "**Galileo's thought experiment: strip away the hidden variable.** Around 1600, Galileo noticed something: a ball rolling on a rough surface stops quickly, but on a smoother surface it rolls much farther before stopping. On a smoother surface still, it goes even farther. He proposed a thought experiment: what if you could make a surface perfectly smooth — perfectly frictionless? The ball would never stop. It would roll forever at constant speed. The thing Aristotle was observing — objects stopping — was not evidence of a natural tendency toward rest. It was evidence that friction is everywhere, slowing everything down. Aristotle mistook the effect of friction for the nature of matter.",

      "**Newton's First Law, precisely stated.** Newton synthesized Galileo's insight into a law: an object at rest remains at rest, and an object in motion remains in motion at constant velocity, unless acted upon by a net external force. The critical phrase is net external force — the vector sum of all forces acting on the object. If that sum is zero, the acceleration is zero, and velocity stays constant (including zero as a special case). The law does not say 'no forces.' It says 'no net force.' A book resting on a table has two forces acting on it: gravity pulling down and the table pushing up. Both are real forces. But they cancel — net force is zero — so the book doesn't accelerate.",

      "**Inertia: resistance to change, not resistance to motion.** The word inertia comes from Latin for 'laziness' or 'idleness,' but it doesn't mean what it sounds like. Inertia is not resistance to moving — it is resistance to changing. A bowling ball at rest resists being kicked into motion. That same bowling ball, once rolling toward you at 5 m/s, resists being stopped just as stubbornly. It is the exact same property — it resists any change in velocity, whether that means starting, stopping, speeding up, slowing down, or turning. Mass is the quantitative measure of inertia: the more mass, the harder it is to change the state of motion. A 200 kg boulder and a 2 kg ball at rest look the same in terms of velocity (both zero), but they have very different resistances to being accelerated.",

      "**Why this is philosophically deep.** Newton's First Law does something radical: it says rest and constant motion are the same thing. A spacecraft coasting through interstellar space — no engines, no friction, billions of kilometers from anything — is in exactly the same physical situation as a spacecraft sitting on a launch pad. Neither is accelerating. Neither requires any net force. They differ only in what velocity they happen to have. This equivalence between 'at rest' and 'moving at constant velocity' was the seed of Einstein's special relativity three centuries later, which proved that there is no experiment you can do inside a closed box to determine whether you are at rest or moving at constant velocity. Newton planted that idea here.",

      "**Where this is heading.** The First Law answers: when is acceleration zero? When net force is zero. But it raises the obvious next question: when there IS a net force, how much acceleration results? The Second Law — the most important equation in classical mechanics — answers this precisely. It is the subject of the next lesson.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 9 — The Turn from Kinematics to Dynamics',
        body: "**Chapters 0–3 (Kinematics):** How things move — position, velocity, acceleration, SUVAT, projectiles, circular motion.\n**Chapter 4 (Dynamics, this chapter):** Why things move — forces, Newton's three laws, friction, inclined planes, pulleys.\n**This lesson:** The First Law establishes the baseline — no net force means no acceleration.\n**Next lesson:** The Second Law — when net force IS present, how large is the resulting acceleration?",
      },
      {
        type: 'insight',
        title: "Newton's First Law",
        body: "An object remains at rest or moves at **constant velocity** unless acted upon by a **net external force** (\\(\\sum \\vec{F} \\neq 0\\)).\n\nEquivalently: \\(\\sum \\vec{F} = 0 \\iff \\vec{a} = 0\\)",
      },
      {
        type: 'warning',
        title: "Inertia ≠ Tendency to Stop",
        body: "Aristotle confused friction with inertia. Inertia resists **any change** in velocity — starting, stopping, or turning. A bowling ball rolling at 5 m/s has the same inertia as when it was at rest. The inertia that resisted starting is the same inertia that resists stopping.",
      },
      {
        type: 'connection',
        title: 'Calculus connection: zero net force → linear x(t)',
        body: "\\(\\sum F = 0 \\Rightarrow a = \\dfrac{d^2x}{dt^2} = 0 \\Rightarrow v = \\text{const} \\Rightarrow x(t) = x_0 + v_0 t\\)\n\nZero net force makes position a **linear** function of time. A straight line on an x-t graph is always a signature of zero net force — and therefore of Newton's First Law.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Kinematics to Dynamics: what drives acceleration?',
        mathBridge: "You have used this chain before: position → velocity → acceleration. In Chapters 2–3, you moved left-to-right — given x(t), differentiate to get v(t), differentiate again to get a(t). Chapter 4 reverses the question: what determines a(t)? Newton's First Law answers the zero-force case: if net force is zero, a = 0, and everything to the left stays constant. Look at the chain and ask: for a block sliding on a frictionless surface with no applied force, what are x(t), v(t), and a(t) doing? Position grows linearly, velocity is constant, acceleration is zero. That is the First Law expressed in kinematics language.",
        caption: "The chain x → v → a. Newton's laws explain what controls acceleration — the rightmost quantity and the root cause of all motion change.",
      },
    ],
  },

  math: {
    prose: [
      "The First Law simultaneously defines what we mean by an inertial reference frame and makes a physical claim about what happens in one. An inertial frame is a frame of reference in which a free object (no net force) moves in a straight line at constant speed. The surface of the Earth is approximately inertial for most problems — the rotation of the Earth introduces tiny fictitious forces (Coriolis, centrifugal) that are negligible for lab-scale experiments but matter for long-range projectiles and weather systems.",

      "The condition for equilibrium is ΣF = 0, a vector equation. In 2D problems it means both ΣFₓ = 0 and ΣFᵧ = 0 independently. An object is in mechanical equilibrium if and only if its acceleration is zero — which includes both objects at rest and objects moving at constant velocity. These two cases are physically indistinguishable from the perspective of forces.",

      "Mass is the measure of inertia. It tells you how hard it is to change an object's velocity. The SI unit is the kilogram (kg). Mass is a scalar, always positive, and the same everywhere in the universe — your mass is identical on Earth, on the Moon, and in deep space. This is different from weight, which is a force (W = mg) and changes with the local gravitational field strength g. On the Moon, g ≈ 1.6 m/s², so your weight is about one-sixth of what it is on Earth. Your mass is unchanged.",
    ],
    keyFormulas: [
      {
        label: 'Equilibrium condition',
        formula: '\\sum \\vec{F} = 0 \\implies \\vec{a} = 0 \\implies \\vec{v} = \\vec{v}_0 = \\text{const}',
        note: 'Both the vector sum and each component separately must be zero.',
      },
      {
        label: 'Component form',
        formula: '\\sum F_x = 0 \\quad \\text{and} \\quad \\sum F_y = 0',
        note: 'Both conditions must hold simultaneously.',
      },
    ],
  },

  rigor: {
    title: 'The First Law as a definition of inertial frames',
    content: [
      {
        type: 'paragraph',
        text: "Newton's First Law is not just a physical claim — it is the definition of the class of reference frames in which Newton's laws hold. An inertial frame is one in which a free particle (zero net force) travels in a straight line at constant velocity. Non-inertial frames — rotating platforms, accelerating cars, the inside of a rocket under thrust — are frames where objects appear to accelerate even with no real force acting. In those frames, you must introduce fictitious forces (centrifugal, Coriolis, Euler) to make Newton's equations work. All the mechanics in this course assumes an inertial frame unless stated otherwise.",
      },
      {
        type: 'derivation',
        steps: [
          { expression: "\\text{Assume: } \\sum \\vec{F} = 0 \\text{ (no net force on object)}", annotation: "Starting condition: First Law applies" },
          { expression: "\\sum \\vec{F} = m\\vec{a} = 0 \\implies \\vec{a} = 0", annotation: "Using the Second Law to formalize: zero net force → zero acceleration" },
          { expression: "\\vec{a} = \\frac{d\\vec{v}}{dt} = 0 \\implies \\vec{v} = \\vec{v}_0 = \\text{const}", annotation: "Integrate: constant acceleration of zero gives constant velocity" },
          { expression: "x(t) = x_0 + v_0 t", annotation: "Integrate again: position is a linear function of time" },
          { expression: "\\text{x-t graph: straight line with slope } v_0", annotation: "Observable prediction: any deviation from a straight line indicates net force" },
        ],
        answer: "The First Law predicts a straight-line x-t graph whenever net force is zero. Any curve on an x-t graph — any non-constant slope — signals that a net force is acting and the Second Law takes over.",
      },
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'kinematic-chain' },
  },

  python: {
    intro: `Use Python to explore Newton's First Law computationally: model objects with and without net force, visualize the x-t graph linearity condition, and simulate what Aristotle got wrong vs. what Galileo predicted.`,
    cells: [
      {
        id: 'p4-001-py1',
        type: 'code',
        cellTitle: 'First Law in kinematics: ΣF = 0 → x(t) is linear',
        prose: `If net force is zero, acceleration is zero, velocity is constant, and position is a linear function of time. Plot x(t) for three cases: at rest, moving right, and moving left — all with zero net force.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `t = np.linspace(0, 5, 200)`,
          ``,
          `cases = [`,
          `    {"label": "At rest (v0=0)", "x0": 0, "v0": 0},`,
          `    {"label": "Moving right (v0=+3 m/s)", "x0": 0, "v0": 3},`,
          `    {"label": "Moving left (v0=-2 m/s)", "x0": 10, "v0": -2},`,
          `]`,
          ``,
          `fig, ax = plt.subplots(figsize=(8, 5))`,
          `for case in cases:`,
          `    x = case["x0"] + case["v0"] * t`,
          `    ax.plot(t, x, lw=2, label=case["label"])`,
          ``,
          `ax.set_xlabel("Time t (s)")`,
          `ax.set_ylabel("Position x (m)")`,
          `ax.set_title("Newton's First Law: ΣF=0 → x(t) is a straight line")`,
          `ax.legend()`,
          `ax.grid(True, alpha=0.3)`,
          `plt.tight_layout()`,
          `plt.savefig("first_law_xt.png", dpi=120)`,
          `plt.show()`,
          `print("All three are straight lines — the signature of zero net force.")`,
          `print("Curved x(t) always signals a non-zero net force.")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-001-py2',
        type: 'code',
        cellTitle: "Aristotle vs. Galileo: friction is the hidden variable",
        prose: `Simulate two sliding blocks: one on a rough surface (friction decelerates it), one on a near-frictionless surface. Aristotle saw the rough case and concluded 'objects return to rest.' Galileo extrapolated to zero friction and saw constant motion.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `def simulate(v0, mu_k, m=1, g=10, t_end=5, dt=0.01):`,
          `    t_vals = [0]`,
          `    v_vals = [v0]`,
          `    x_vals = [0]`,
          `    t, v, x = 0, v0, 0`,
          `    while t < t_end and v > 0:`,
          `        a = -mu_k * g  # friction decelerates`,
          `        v = max(0, v + a * dt)`,
          `        x = x + v * dt`,
          `        t = t + dt`,
          `        t_vals.append(t)`,
          `        v_vals.append(v)`,
          `        x_vals.append(x)`,
          `    return np.array(t_vals), np.array(v_vals), np.array(x_vals)`,
          ``,
          `v0 = 5  # m/s`,
          `scenarios = [`,
          `    ("Aristotle's table (mu=0.50)", 0.50),`,
          `    ("Smooth floor (mu=0.10)", 0.10),`,
          `    ("Near-frictionless (mu=0.01)", 0.01),`,
          `    ("Galileo's ideal (mu=0.00)", 0.00),`,
          `]`,
          ``,
          `fig, axes = plt.subplots(1, 2, figsize=(12, 4))`,
          `for label, mu in scenarios:`,
          `    if mu == 0:`,
          `        t_arr = np.linspace(0, 5, 200)`,
          `        x_arr = v0 * t_arr`,
          `        v_arr = np.full_like(t_arr, v0)`,
          `    else:`,
          `        t_arr, v_arr, x_arr = simulate(v0, mu)`,
          `    axes[0].plot(t_arr, x_arr, lw=2, label=label)`,
          `    axes[1].plot(t_arr, v_arr, lw=2, label=label)`,
          ``,
          `axes[0].set_xlabel("t (s)"); axes[0].set_ylabel("x (m)")`,
          `axes[0].set_title("Position: straight line only at mu=0")`,
          `axes[0].legend(fontsize=8); axes[0].grid(True, alpha=0.3)`,
          `axes[1].set_xlabel("t (s)"); axes[1].set_ylabel("v (m/s)")`,
          `axes[1].set_title("Velocity: flat line only at mu=0 (First Law)")`,
          `axes[1].legend(fontsize=8); axes[1].grid(True, alpha=0.3)`,
          `plt.tight_layout()`,
          `plt.savefig("aristotle_vs_galileo.png", dpi=120)`,
          `plt.show()`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-001-py3',
        type: 'code',
        cellTitle: 'Spacecraft in deep space: constant velocity forever',
        prose: `In deep space with no forces, a spacecraft maintains its velocity indefinitely. Simulate position and velocity for 1000 hours to confirm — then contrast with a spacecraft near Earth where gravity provides a small net force.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `# Deep space: no force`,
          `v0 = 2000  # m/s`,
          `t = np.linspace(0, 3600 * 24, 500)  # 24 hours`,
          `x_free = v0 * t / 1000  # convert to km`,
          ``,
          `# Near Earth at altitude 400 km: gravity provides centripetal acceleration`,
          `# g_400km ≈ 8.7 m/s^2, acting as centripetal — in straight-line sim, object curves`,
          `# For comparison, show g decelerating a vertical throw upward`,
          `g = 9.8`,
          `v0_throw = 2000`,
          `t_fall = np.linspace(0, v0_throw / g, 300)`,
          `x_throw = v0_throw * t_fall - 0.5 * g * t_fall**2`,
          ``,
          `fig, axes = plt.subplots(1, 2, figsize=(12, 4))`,
          ``,
          `axes[0].plot(t / 3600, x_free, "b-", lw=2, label="Deep space (no force)")`,
          `axes[0].set_xlabel("Time (hours)")`,
          `axes[0].set_ylabel("Distance (km)")`,
          `axes[0].set_title("Spacecraft in deep space: perfectly linear x(t)")`,
          `axes[0].legend(); axes[0].grid(True, alpha=0.3)`,
          ``,
          `axes[1].plot(t_fall, x_throw / 1000, "r-", lw=2, label="Upward throw (g acts)")`,
          `axes[1].set_xlabel("Time (s)")`,
          `axes[1].set_ylabel("Height (km)")`,
          `axes[1].set_title("With gravity: curved x(t) = signature of net force")`,
          `axes[1].legend(); axes[1].grid(True, alpha=0.3)`,
          ``,
          `plt.tight_layout()`,
          `plt.savefig("spacecraft.png", dpi=120)`,
          `plt.show()`,
          `print("Left: linear = First Law holds (no net force)")`,
          `print("Right: curved = Second Law governs (net force present)")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-001-py4',
        type: 'code',
        cellTitle: 'Challenge: detect the hidden force from position data',
        prose: `A detector records position data from a moving object. If the motion is purely inertial (First Law), position is a linear function of time and the x-t graph is a straight line. If a net force acts, the graph curves. Write a function that fits the data and classifies the motion.`,
        challengeType: 'write',
        challengeNumber: 1,
        challengeTitle: 'Is there a hidden force?',
        difficulty: 'medium',
        prompt: `Complete the function classify_motion(t_data, x_data). It should: (1) Fit a degree-1 polynomial (linear) and a degree-2 polynomial (quadratic) to the data. (2) Compare the residuals. (3) Return "inertial" if the linear fit is good (residual < threshold), or "net force detected" with an estimated acceleration.`,
        starterBlock: [
          `import numpy as np`,
          ``,
          `def classify_motion(t_data, x_data, threshold=0.05):`,
          `    # Fit linear and quadratic polynomials`,
          `    p1 = np.polyfit(t_data, x_data, 1)   # [v, x0]`,
          `    p2 = np.polyfit(t_data, x_data, 2)   # [a/2, v0, x0]`,
          `    # Residuals (mean squared error)`,
          `    res1 = np.mean((np.polyval(p1, t_data) - x_data)**2)`,
          `    res2 = np.mean((np.polyval(p2, t_data) - x_data)**2)`,
          `    if res1 < ___:   # fill in threshold`,
          `        return "inertial", p1[0]  # (classification, velocity)`,
          `    else:`,
          `        a_estimate = ___  # from quadratic: coefficient = a/2`,
          `        return "net force detected", a_estimate`,
          ``,
          `# Test 1: inertial motion`,
          `t = np.linspace(0, 5, 50)`,
          `x_inertial = 3 * t + 1 + np.random.normal(0, 0.01, len(t))`,
          `result1 = classify_motion(t, x_inertial)`,
          `print(f"Test 1: {result1}")`,
          ``,
          `# Test 2: accelerated motion (a=2 m/s^2)`,
          `x_accel = 0.5 * 2 * t**2 + 1 * t + 0 + np.random.normal(0, 0.05, len(t))`,
          `result2 = classify_motion(t, x_accel)`,
          `print(f"Test 2: {result2}")`,
        ].join('\n'),
        testCode: [
          `t = np.linspace(0, 5, 50)`,
          `x_in = 3 * t + 1`,
          `r1, v1 = classify_motion(t, x_in)`,
          `assert r1 == "inertial", f"Expected inertial, got {r1}"`,
          `x_acc = 0.5 * 4 * t**2`,
          `r2, a2 = classify_motion(t, x_acc)`,
          `assert r2 == "net force detected", f"Expected net force, got {r2}"`,
          `assert abs(a2 - 4) < 0.5, f"Acceleration estimate off: {a2:.2f}"`,
          `print("All tests passed!")`,
        ].join('\n'),
        hint: `The quadratic polynomial $p_2$ returned by np.polyfit(t, x, 2) has the form $[c_2, c_1, c_0]$ where $x \\approx c_2 t^2 + c_1 t + c_0$. Since $x = \\frac{1}{2}at^2 + v_0 t + x_0$, the acceleration is $a = 2 c_2$.`,
        code: '',
        output: '',
        status: 'idle',
        figureJson: null,
      },
    ],
  },

  checkpoints: [
    { id: 'p4-001-cp1', question: "A box slides on a frictionless floor at 4 m/s with no applied force. What is its acceleration?", answer: "0 m/s² — zero net force, so zero acceleration (First Law)." },
    { id: 'p4-001-cp2', question: "Two forces act on a block: 10 N east and 10 N west. Is the block in equilibrium? What is its acceleration?", answer: "Yes — ΣF = 0, so a = 0 and velocity is constant." },
    { id: 'p4-001-cp3', question: "A spacecraft far from all planets has engines off and moves at 2000 m/s. What happens to its speed over the next hour?", answer: "It stays at 2000 m/s — no net force means constant velocity." },
  ],

  quiz: [
    {
      id: 'p4-001-q1',
      type: 'choice',
      text: "Aristotle believed objects in motion naturally slow down and stop. What was the key flaw in his reasoning?",
      options: [
        "He forgot that mass increases with speed",
        "He did not account for friction — friction stops objects, not their natural tendency",
        "He used the wrong units for force",
        "He only studied objects in water",
      ],
      answer: "He did not account for friction — friction stops objects, not their natural tendency",
      hints: ["Galileo's thought experiment: what happens on a perfectly frictionless surface?"],
      reviewSection: "Galileo's Thought Experiment",
    },
    {
      id: 'p4-001-q2',
      type: 'choice',
      text: "A hockey puck slides on frictionless ice at constant velocity. Which statement is correct?",
      options: [
        "A net force must be acting to keep it moving",
        "No net force acts on it — it moves at constant velocity by the First Law",
        "Gravity is the net force keeping it on the ice",
        "The puck will eventually stop because all objects return to rest",
      ],
      answer: "No net force acts on it — it moves at constant velocity by the First Law",
      hints: ["Constant velocity ↔ zero net force. That is the First Law."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q3',
      type: 'choice',
      text: "A 200 kg boulder and a 2 kg ball are both at rest. Which requires more force to accelerate at 1 m/s²?",
      options: [
        "The ball, because it is lighter",
        "The boulder, because it has more inertia",
        "Both require the same force",
        "Neither requires force — they will start moving on their own",
      ],
      answer: "The boulder, because it has more inertia",
      hints: ["Inertia = resistance to acceleration. Mass is the measure of inertia."],
      reviewSection: "Inertia: Resistance to Change",
    },
    {
      id: 'p4-001-q4',
      type: 'choice',
      text: "Two forces act on an object: 15 N north and 15 N south. What is the acceleration?",
      options: ["30 m/s² north", "15 m/s² south", "0 m/s² — the forces cancel", "Cannot be determined without the mass"],
      answer: "0 m/s² — the forces cancel",
      hints: ["Net force = vector sum. Equal and opposite forces give ΣF = 0."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q5',
      type: 'choice',
      text: "In calculus terms, if net force is zero then position x(t) is:",
      options: [
        "A constant function (object doesn't move)",
        "A linear function of t — a straight line on the x-t graph",
        "A quadratic — a parabola on the x-t graph",
        "An exponential function",
      ],
      answer: "A linear function of t — a straight line on the x-t graph",
      hints: ["a = d²x/dt² = 0. Integrate twice: v = const, x = x₀ + v₀t."],
      reviewSection: "Calculus Connection",
    },
    {
      id: 'p4-001-q6',
      type: 'input',
      text: "A 5 kg block moves at 3 m/s on a frictionless surface. Three seconds later, what is its speed? (in m/s)",
      answer: "3",
      hints: ["No friction = no net force = no acceleration = constant velocity."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q7',
      type: 'choice',
      text: "Which is NOT an example of inertia?",
      options: [
        "A passenger lurching forward when a car brakes suddenly",
        "A tablecloth pulled from under dishes (dishes stay put)",
        "A ball slowing because of air resistance",
        "A spacecraft coasting at constant speed with engines off",
      ],
      answer: "A ball slowing because of air resistance",
      hints: ["Air resistance is an external force causing change — that is the opposite of inertia."],
      reviewSection: "Inertia: Resistance to Change",
    },
    {
      id: 'p4-001-q8',
      type: 'choice',
      text: "A book rests on a table. Gravity pulls it down (10 N) and the table pushes up (10 N). Which law explains why it doesn't accelerate?",
      options: [
        "Third Law — gravity and normal force are action-reaction pairs",
        "First Law — ΣF = 0, so a = 0",
        "Second Law — since a = 0, we conclude F = 0",
        "Newton's laws don't apply to objects at rest",
      ],
      answer: "First Law — ΣF = 0, so a = 0",
      hints: ["The book is in equilibrium. ΣF = 0 → a = 0. First Law."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q9',
      type: 'choice',
      text: "An inertial reference frame is defined as:",
      options: [
        "Any frame that is at rest",
        "Any frame attached to the Earth's surface",
        "A frame in which Newton's First Law holds — a free particle moves at constant velocity",
        "A frame with no gravity",
      ],
      answer: "A frame in which Newton's First Law holds — a free particle moves at constant velocity",
      hints: ["See the Rigor section on inertial frames."],
      reviewSection: "The Rigor Section",
    },
    {
      id: 'p4-001-q10',
      type: 'choice',
      text: "You push a 10 kg box at constant velocity across a floor. What must be true about the applied force?",
      options: [
        "The applied force is greater than friction",
        "The applied force equals friction exactly — ΣF = 0",
        "No force is needed to maintain constant velocity",
        "The applied force equals mg = 98 N",
      ],
      answer: "The applied force equals friction exactly — ΣF = 0",
      hints: ["Constant velocity → a = 0 → ΣF = 0. Your push exactly cancels friction."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'kinematic-chain' }, title: 'The kinematics chain — forces drive acceleration' },
  ],

  misconceptions: [
    {
      id: 'p4-001-m1',
      misconception: 'An object moving at constant velocity must have a force pushing it forward.',
      correction: 'Constant velocity means zero acceleration, which means zero NET force. No forward force is needed to maintain constant velocity — only to overcome friction (if friction exists). In the absence of friction, zero force produces constant velocity. This is the exact content of Newton\'s First Law, and the thing Aristotle got wrong for 2000 years.',
      correctionExample: 'A hockey puck on frictionless ice: no applied force, yet it slides forever at constant speed. A spacecraft in deep space: engines off, zero net force, yet it maintains 2000 m/s indefinitely.',
    },
    {
      id: 'p4-001-m2',
      misconception: 'An object at rest has no forces acting on it.',
      correction: 'An object at rest often has multiple forces acting on it — they simply cancel. A book on a table has gravity (down) AND normal force (up). Both are real forces. The NET force is zero, which is why the acceleration is zero. "Zero net force" does not mean "zero forces."',
      correctionExample: 'Book on table: F_gravity = 10 N down, F_normal = 10 N up. ΣF = 0. Two real forces, zero net force, zero acceleration.',
    },
  ],

  transferPrompts: [
    {
      id: 'p4-001-t1',
      prompt: `In special relativity, Einstein showed there is no experiment you can do inside a sealed box to determine whether you are at rest or moving at constant velocity — only acceleration is detectable without looking outside. How does this connect to Newton\'s First Law? What does "inertial reference frame" mean in the context of both Newton\'s mechanics and Einstein\'s relativity?`,
      connection: 'Newton\'s First Law says rest and constant velocity are physically equivalent (same net force = 0). Einstein\'s principle of relativity elevates this to a fundamental symmetry of physics.',
    },
    {
      id: 'p4-001-t2',
      prompt: `A curling stone slides down an ice sheet toward the target. Sweepers brush the ice to reduce friction and steer the stone. Without sweeping, friction gradually decelerates the stone. With vigorous sweeping (near-zero friction), the stone barely decelerates. How does this real sport illustrate Newton\'s First Law? What would happen in the limit of perfectly frictionless ice?`,
      connection: 'Curling makes Galileo\'s thought experiment physical: reduce friction → stone travels farther. Zero friction → stone never stops. The First Law is the zero-friction limit.',
    },
  ],

  debugging: [
    {
      id: 'p4-001-d1',
      error: `A student writes: "A book slides across a table at 2 m/s. Since it's moving, there must be a net force of F = ma = 1 kg × 2 m/s = 2 N pushing it."`,
      fix: `The student confused velocity with acceleration. F = ma uses ACCELERATION, not velocity. Moving at constant velocity means a = 0, so F_net = m × 0 = 0 N. The book is decelerating to a stop because FRICTION provides a net force — not because of its velocity. If the table were frictionless, the book would continue at 2 m/s with zero net force forever.`,
    },
    {
      id: 'p4-001-d2',
      error: `A student testing for equilibrium: "ΣFx = 10 − 6 = 4 N. Since 4 ≠ 0, the object is not in equilibrium." The forces are: 10 N right, 6 N left, 8 N up, 8 N down.`,
      fix: `The student correctly found ΣFx = +4 N ≠ 0, so the object is NOT in equilibrium — the student's conclusion is actually correct. But the analysis is incomplete: ΣFy = 8 − 8 = 0 N. In 2D equilibrium, BOTH components must be zero. Here ΣFx ≠ 0, so the object accelerates horizontally even though it's in vertical equilibrium. Always check both components when testing for equilibrium.`,
    },
  ],

  mastery: {
    targetLevel: 'Correctly apply Newton\'s First Law: identify when net force is zero, recognize that constant velocity (including rest) requires zero net force, and explain the concept of inertia.',
    checklistItems: [
      'Can state Newton\'s First Law precisely: "an object remains at rest or moves at constant velocity unless acted upon by a non-zero net force"',
      'Can identify the conditions for equilibrium (ΣF = 0) in both rest and constant-velocity situations',
      'Can distinguish between "no force" and "no net force" — an object can have multiple forces and still be in equilibrium',
      'Can recognize that the straight-line x(t) graph is the kinematic signature of zero net force',
      'Can explain why Aristotle was wrong: friction was the hidden variable causing deceleration',
    ],
    commonStruggles: [
      'Confusing velocity and acceleration: moving objects don\'t require a net force — only accelerating objects do',
      'Assuming objects at rest have no forces — they often have multiple balanced forces',
    ],
    nextSteps: 'Lesson p4-002 (Newton\'s Second Law) answers: when net force IS non-zero, exactly how much acceleration results?',
  },

  semantics: {
    core: [
      { symbol: '\\sum \\vec{F} = 0', meaning: 'Equilibrium condition — net force is zero; object is at rest or moving at constant velocity' },
      { symbol: '\\vec{a} = 0', meaning: 'Zero acceleration — velocity is constant (not necessarily zero)' },
      { symbol: 'm', meaning: 'Mass (kg) — scalar measure of inertia; resistance to change in velocity' },
      { symbol: 'v = \\text{const}', meaning: 'Constant velocity (including v = 0) — the state when ΣF = 0' },
      { symbol: 'x(t) = x_0 + v_0 t', meaning: 'Linear position function — the kinematic consequence of ΣF = 0 (straight line on x-t graph)' },
    ],
    rulesOfThumb: [
      'Constant velocity (including rest) ↔ ΣF = 0. Moving does NOT require a net force.',
      'Curved x-t graph always signals net force. Straight x-t always signals equilibrium.',
      'At rest ≠ no forces acting. At rest means ΣF = 0, which allows many individual forces.',
      'Mass quantifies inertia: larger mass → harder to start, harder to stop, harder to turn.',
      'Friction is not inertia — it is a force that CAUSES deceleration. Inertia would maintain constant velocity without friction.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: "Newton's First Law in Python",
      cells: [
        {
          cellTitle: 'ΣF = 0 → x(t) is a straight line',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Newton's First Law: zero net force → constant velocity → linear x(t)
t = np.linspace(0, 5, 200)

cases = [
    {'label': 'At rest (v₀=0)', 'x0': 0, 'v0': 0},
    {'label': 'Moving right (v₀=+3 m/s)', 'x0': 0, 'v0': 3},
    {'label': 'Moving left (v₀=−2 m/s)', 'x0': 10, 'v0': -2},
]

fig, ax = plt.subplots(figsize=(8, 5))
for case in cases:
    x = case['x0'] + case['v0'] * t
    ax.plot(t, x, linewidth=2, label=case['label'])

ax.set_xlabel('Time t (s)')
ax.set_ylabel('Position x (m)')
ax.set_title("Newton's First Law: ΣF = 0 → x(t) is a straight line")
ax.legend(); ax.grid(True)
plt.show()

print("All three are straight lines — the signature of zero net force.")
print("A curved x(t) always signals a non-zero net force acting.")`,
          prose: [
            'x = case["x0"] + case["v0"] * t is Newton\'s First Law expressed kinematically: ΣF = 0 → a = 0 → v = constant → x = x₀ + v₀t. No acceleration term because net force is zero.',
            'Three physically different situations (at rest, moving right, moving left) produce three different lines — but all are straight lines. Straightness on the x-t graph is the universal signature of zero net force.',
            'This is what Galileo understood and Aristotle missed: on a frictionless surface, all three situations would persist forever. The moving-left line doesn\'t turn around; the moving-right line doesn\'t slow down. Friction was always causing the deceleration Aristotle observed, not some "natural tendency to stop."',
          ],
        },
        {
          cellTitle: 'Aristotle vs Galileo: friction is the hidden variable',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

def simulate_friction(v0, mu_k, g=9.8, t_end=5, dt=0.005):
    t_vals, x_vals, v_vals = [0], [0], [v0]
    t, v, x = 0, v0, 0
    while t < t_end and v > 0:
        a = -mu_k * g          # friction deceleration: a = -μₖg
        v = max(0, v + a * dt)
        x = x + v * dt
        t = t + dt
        t_vals.append(t); v_vals.append(v); x_vals.append(x)
    return np.array(t_vals), np.array(x_vals), np.array(v_vals)

v0 = 5  # initial speed (m/s)
scenarios = [
    ('Aristotle\'s rough table (μ=0.50)', 0.50),
    ('Smooth floor (μ=0.10)', 0.10),
    ('Near-frictionless (μ=0.01)', 0.01),
]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
t_frictionless = np.linspace(0, 5, 200)

for label, mu in scenarios:
    t_arr, x_arr, v_arr = simulate_friction(v0, mu)
    ax1.plot(t_arr, x_arr, linewidth=2, label=label)
    ax2.plot(t_arr, v_arr, linewidth=2, label=label)

# Galileo's ideal: zero friction
ax1.plot(t_frictionless, v0 * t_frictionless, 'k--', linewidth=2, label='Galileo (μ=0: v constant)')
ax2.plot(t_frictionless, np.full_like(t_frictionless, v0), 'k--', linewidth=2, label='Galileo (μ=0)')

for ax in [ax1, ax2]:
    ax.legend(fontsize=8); ax.grid(True)
ax1.set_xlabel('t (s)'); ax1.set_ylabel('x (m)'); ax1.set_title('Position: straight line only at μ=0')
ax2.set_xlabel('t (s)'); ax2.set_ylabel('v (m/s)'); ax2.set_title('Velocity: constant only at μ=0 (First Law)')
plt.tight_layout(); plt.show()`,
          prose: [
            'a = -mu_k * g computes the friction deceleration: F_friction = μmg, so a = F/m = μg. Each scenario has the same initial speed v0 = 5 m/s but different friction coefficients μ.',
            'The velocity plot shows the key insight: as μ decreases, the object travels farther before stopping. In the limit μ → 0 (dashed line), the object never stops. Aristotle watched the rough-table case and generalized. Galileo extrapolated to zero friction.',
            'The position plot shows straight lines only when friction is zero (Galileo\'s ideal). Every curved x-t line represents friction doing work to decelerate the object. The First Law holds exactly only when the net force is truly zero — which friction prevents in practice.',
          ],
        },
        {
          cellTitle: 'Checking equilibrium from force data',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Check equilibrium: ΣF = 0? Analyze multiple force scenarios
def check_equilibrium(forces, tol=0.01):
    """forces: list of (Fx, Fy) tuples"""
    Fx_net = sum(f[0] for f in forces)
    Fy_net = sum(f[1] for f in forces)
    F_net_mag = np.sqrt(Fx_net**2 + Fy_net**2)
    in_equilibrium = F_net_mag < tol
    return Fx_net, Fy_net, F_net_mag, in_equilibrium

# Three scenarios
scenarios = [
    ('Book on table', [(0, -9.8), (0, 9.8)]),          # gravity + normal
    ('Box being pushed (friction present)', [(20, 0), (-20, 0), (0, -49), (0, 49)]),  # ΣF=0
    ('Accelerating box', [(30, 0), (-10, 0), (0, -49), (0, 49)]),   # ΣFx ≠ 0
]

for name, forces in scenarios:
    Fx, Fy, Fmag, eq = check_equilibrium(forces)
    print(f"{name}:")
    print(f"  ΣFx = {Fx:.2f} N,  ΣFy = {Fy:.2f} N,  |ΣF| = {Fmag:.2f} N")
    print(f"  Equilibrium? {eq} ({'zero acceleration' if eq else 'non-zero acceleration — will accelerate!'})")
    print()`,
          prose: [
            'check_equilibrium(forces) computes the vector sum of all forces by summing x-components separately from y-components. This is the computational version of "ΣFx = 0 AND ΣFy = 0" — both conditions must hold for true equilibrium.',
            'The "book on table" scenario has gravity (0, −9.8) and normal force (0, +9.8): ΣF = (0, 0). Two real forces cancel — this is the classic demonstration that "at rest" does not mean "no forces."',
            'The "accelerating box" scenario has ΣFx = 20 N ≠ 0: this box will accelerate even though it\'s in vertical equilibrium. In 2D problems you must check BOTH axes independently — vertical balance doesn\'t guarantee horizontal balance.',
          ],
        },
        {
          cellTitle: 'Challenge: classify motion as inertial or accelerated',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# Position data from a sensor — is the motion inertial (ΣF=0) or accelerated?
np.random.seed(42)
t = np.linspace(0, 5, 50)

# Dataset 1: inertial (v=3 m/s, no acceleration)
x_inertial = 3*t + 1 + np.random.normal(0, 0.05, len(t))

# Dataset 2: accelerated (a=2 m/s², v0=1 m/s)
x_accel = 0.5*2*t**2 + 1*t + np.random.normal(0, 0.1, len(t))

def classify_motion(t_data, x_data, threshold=0.1):
    # TODO:
    # 1. Fit degree-1 (linear) and degree-2 (quadratic) polynomials using np.polyfit
    # 2. Compute residuals: mean squared error for each fit
    # 3. If linear residual < threshold: return ("inertial", estimated_velocity)
    # 4. Else: return ("net force detected", estimated_acceleration)
    #    Hint: quadratic coeff c2 = a/2, so a = 2*c2
    pass

for name, x_data in [("Inertial?", x_inertial), ("Accelerated?", x_accel)]:
    result = classify_motion(t, x_data)
    print(f"{name}: {result}")
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: "Newton's First Law in MATLAB/Octave",
      cells: [
        {
          cellTitle: 'ΣF = 0 → linear x(t)',
          type: 'code',
          language: 'matlab',
          code: `% Newton's First Law: ΣF = 0 → constant velocity → linear x(t)
t = linspace(0, 5, 200);

cases = {0, 0, 'At rest (v0=0)'; 0, 3, 'Moving right (v0=3 m/s)'; 10, -2, 'Moving left (v0=-2 m/s)'};

figure; hold on;
for i = 1:size(cases,1)
    x0 = cases{i,1}; v0 = cases{i,2}; label = cases{i,3};
    x = x0 + v0 * t;   % x = x0 + v0*t: linear when a=0
    plot(t, x, 'LineWidth', 2, 'DisplayName', label);
end
xlabel('Time t (s)'); ylabel('Position x (m)');
title('First Law: ΣF=0 → x(t) is a straight line');
legend; grid on;
fprintf('Straight line = zero net force. Curved line = net force present.\\n');`,
          prose: [
            'x = x0 + v0 * t is the MATLAB implementation of x(t) = x₀ + v₀t. When acceleration a = 0 (ΣF = 0), position grows linearly with time. Three different initial conditions produce three different lines — but all straight.',
            'The cell array cases stores {x0, v0, label} for each scenario. The loop plots all three on the same axes using hold on. Each case represents a different velocity (at rest, rightward, leftward), but all have the same physics: zero net force, constant velocity.',
            'The key observation: straightness on the x-t graph is the diagnostic. If you measured position over time and got a straight line, you know net force was zero. Curvature means acceleration means net force — and Newton\'s Second Law applies.',
          ],
        },
        {
          cellTitle: 'Friction simulation: Aristotle to Galileo',
          type: 'code',
          language: 'matlab',
          code: `% Simulate sliding under different friction levels
v0 = 5; g = 9.8;
mus = [0.50, 0.10, 0.01, 0.00];   % friction coefficients
labels = {'Aristotle (mu=0.50)', 'Smooth (mu=0.10)', 'Near-frictionless (mu=0.01)', 'Galileo (mu=0)'};

dt = 0.005; t_end = 5;
figure;
subplot(1,2,1); hold on;
subplot(1,2,2); hold on;

for i = 1:length(mus)
    mu = mus(i);
    if mu == 0
        t_arr = linspace(0, t_end, 500);
        x_arr = v0 * t_arr;
        v_arr = v0 * ones(size(t_arr));
    else
        t_arr = 0; x = 0; v = v0;
        x_arr = 0; v_arr = v0;
        while t_arr(end) < t_end && v > 0
            a = -mu * g;
            v = max(0, v + a*dt);
            x = x + v*dt;
            t_arr(end+1) = t_arr(end) + dt;
            x_arr(end+1) = x;
            v_arr(end+1) = v;
        end
    end
    subplot(1,2,1); plot(t_arr, x_arr, 'LineWidth', 2, 'DisplayName', labels{i});
    subplot(1,2,2); plot(t_arr, v_arr, 'LineWidth', 2, 'DisplayName', labels{i});
end

subplot(1,2,1); xlabel('t (s)'); ylabel('x (m)');
title('Position: straight only at mu=0'); legend('FontSize', 7); grid on;
subplot(1,2,2); xlabel('t (s)'); ylabel('v (m/s)');
title('Velocity: constant only at mu=0'); legend('FontSize', 7); grid on;`,
          prose: [
            'The loop varies friction coefficient mu from 0.50 (Aristotle\'s rough table) to 0.00 (Galileo\'s ideal). For each non-zero mu, the simulation integrates a = −μg step by step: MATLAB\'s loop performs Euler integration with dt = 0.005 s.',
            'max(0, v + a*dt) ensures velocity never goes negative — the block stops when it reaches v = 0, not when the simulation says v < 0. This is physically correct: friction acts opposite to motion, not in the direction that would reverse motion.',
            'The plots confirm Galileo\'s extrapolation: as mu → 0, the velocity curve approaches a flat horizontal line (constant velocity) and the position curve approaches a straight line. This is the First Law in the limit of zero friction.',
          ],
        },
        {
          cellTitle: 'Vector equilibrium check',
          type: 'code',
          language: 'matlab',
          code: `% Check equilibrium: ΣFx = 0 AND ΣFy = 0?
function [Fx_net, Fy_net, Fmag, in_eq] = check_eq(forces, tol)
    if nargin < 2, tol = 0.01; end
    Fx_net = sum(forces(:,1));
    Fy_net = sum(forces(:,2));
    Fmag = sqrt(Fx_net^2 + Fy_net^2);
    in_eq = Fmag < tol;
end

% Scenario 1: Book on table
f1 = [0, -9.8; 0, 9.8];   % gravity + normal
[Fx, Fy, Fm, eq] = check_eq(f1);
fprintf('Book on table: SigFx=%.2f N, SigFy=%.2f N, |SF|=%.2f N → eq=%d\\n', Fx, Fy, Fm, eq);

% Scenario 2: Pushed box (friction balances applied force)
f2 = [20, 0; -20, 0; 0, -49; 0, 49];   % push, friction, gravity, normal
[Fx, Fy, Fm, eq] = check_eq(f2);
fprintf('Balanced push:  SigFx=%.2f N, SigFy=%.2f N, |SF|=%.2f N → eq=%d\\n', Fx, Fy, Fm, eq);

% Scenario 3: Unbalanced — net force right
f3 = [30, 0; -10, 0; 0, -49; 0, 49];
[Fx, Fy, Fm, eq] = check_eq(f3);
fprintf('Net force right: SigFx=%.2f N, SigFy=%.2f N, |SF|=%.2f N → eq=%d\\n', Fx, Fy, Fm, eq);`,
          prose: [
            'The function check_eq takes a matrix where each row is one force [Fx, Fy] and sums the columns. sum(forces(:,1)) adds all x-components; sum(forces(:,2)) adds all y-components. This is the vector equilibrium check ΣFx = 0 AND ΣFy = 0.',
            'Scenario 1 (book on table): [0, −9.8] + [0, +9.8] = [0, 0]. Two real forces cancel perfectly — the book has zero net force and zero acceleration even though forces are acting.',
            'Scenario 3 confirms the 2D equilibrium rule: even though ΣFy = 0 (vertical balance), ΣFx = 20 N (horizontal imbalance). The box is in vertical equilibrium but NOT in horizontal equilibrium — it will accelerate rightward. Always check both components.',
          ],
        },
        {
          cellTitle: 'Challenge: classify motion from position data',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Classify motion as inertial (ΣF=0) or accelerated from sensor data
rng(42);
t = linspace(0, 5, 50)';

% Dataset 1: inertial
x_inertial = 3*t + 1 + 0.05*randn(size(t));

% Dataset 2: accelerated (a = 2 m/s²)
x_accel = 0.5*2*t.^2 + t + 0.1*randn(size(t));

function [classification, value] = classify_motion(t_data, x_data, threshold)
    if nargin < 3, threshold = 0.1; end
    % TODO:
    % 1. p1 = polyfit(t_data, x_data, 1) — linear fit [v, x0]
    % 2. p2 = polyfit(t_data, x_data, 2) — quadratic fit [a/2, v0, x0]
    % 3. res1 = mean((polyval(p1, t_data) - x_data).^2) — linear residuals
    % 4. If res1 < threshold: classification='inertial', value=p1(1) (velocity)
    % 5. Else: classification='net force', value=2*p2(1) (acceleration = 2*c2)
    classification = 'TODO'; value = 0;
end

[c1, v1] = classify_motion(t, x_inertial);
fprintf('Dataset 1: %s, value = %.2f\\n', c1, v1);
[c2, a2] = classify_motion(t, x_accel);
fprintf('Dataset 2: %s, value = %.2f\\n', c2, a2);
`,
        },
      ],
    },
  },
};
