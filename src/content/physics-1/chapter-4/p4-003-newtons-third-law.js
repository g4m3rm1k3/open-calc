export default {
  id: 'p1-ch4-003',
  slug: 'newtons-third-law',
  chapter: 'p4',
  order: 2,
  title: "Newton's Third Law: Action & Reaction",
  subtitle: 'Every force has an equal and opposite partner — but the two forces act on different objects.',
  tags: ['newtons-laws', 'action-reaction', 'force-pairs', 'momentum', 'dynamics'],

  hook: {
    question: `A rocket engine fires in the vacuum of deep space — no air, no ground, nothing to push against. The rocket accelerates forward. A rifle fires a bullet and the gun kicks backward into your shoulder. You jump off a boat and the boat glides backward. In every case, something is being pushed in the opposite direction of the thing you care about. Is this coincidence, or is there a law?`,
    realWorldContext: `Newton's Third Law — "for every action there is an equal and opposite reaction" — is simultaneously the most quoted and most misunderstood law in all of physics. The misunderstanding almost always comes from one word: "opposite." Students hear "opposite forces" and immediately think "they cancel out." They don't — because they act on DIFFERENT objects. That single distinction is the key that unlocks rocket propulsion, walking, swimming, sailing, and every collision in the universe.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'action-reaction' },
  },

  intuition: {
    prose: [
      `**The law that took two thousand years to discover.** For most of human history, force was thought of as something a "mover" does to a "moved." The hand pushes the cart; the cart is pushed. There is an actor and a passive recipient. Newton's Third Law completely overturns this picture: forces never exist in isolation. Every force is one half of a partnership. When you push the cart, the cart pushes you back — with the same magnitude, in the opposite direction. You cannot exert a force on something without it exerting an equal and opposite force on you. There are no one-sided forces anywhere in the universe.`,

      `**The rocket paradox — resolved.** How does a rocket accelerate in empty space with nothing to push against? This is the question that confuses people who think you need something to "push off of" like when you walk on the ground. But you don't need a surface to push against — you need to push SOMETHING. A rocket pushes exhaust gases backward with enormous force. By the Third Law, those exhaust gases push the rocket forward with the same enormous force. The rocket doesn't need ground, air, or anything else. It creates its own reaction partner by expelling mass. This is the operating principle of every space vehicle ever launched.`,

      `**The critical distinction: different objects, different equations.** The Third Law says the forces are equal and opposite — but these two forces always act on DIFFERENT objects. Your foot pushes on the ground (action on the ground). The ground pushes on your foot (reaction on you). When you analyze YOUR motion, you draw a free body diagram of YOU, and the only force that appears is the ground's push on your foot — forward. The force your foot exerts on the ground does not appear in YOUR equation of motion; it appears in the ground's equation of motion (which, for Earth, results in acceleration of 10⁻²³ m/s² — utterly imperceptible). This is why equal and opposite forces don't cancel: they are in different equations.`,

      `**The jump example: same forces, wildly different accelerations.** When you jump, you push down on Earth with about 700 N. Earth pushes you up with 700 N. You and Earth experience the SAME force magnitude. But you have mass ~70 kg; Earth has mass ~6×10²⁴ kg. By F = ma: your acceleration = 700/70 = 10 m/s² upward. Earth's acceleration = 700/(6×10²⁴) ≈ 10⁻²³ m/s² downward. You jump; the Earth "jumps" by less than the radius of a proton. Same force, same law, wildly different outcomes due to mass. This is why Newton's Second Law (F = ma) and Third Law work together: Third Law gives you force magnitudes; Second Law tells you what each object does with those forces.`,

      `**The most common misconception: confusing Newton's Third Law pairs with balanced forces.** Consider a book resting on a table. The book does not accelerate vertically. Many students incorrectly identify the weight (Earth pulling book down) and the normal force (table pushing book up) as a Third Law pair. They are NOT. They act on the SAME object (the book), they are different types of forces (gravitational vs contact), and they cancel only because the book is in equilibrium — not because of the Third Law. The actual Third Law pairs are: Earth pulls book down ↔ book pulls Earth up (gravitational pair between Earth and book); table pushes book up ↔ book pushes table down (contact pair between table and book). Learning to identify true Third Law pairs is a skill that takes practice.`,

      `**Walking, swimming, and propulsion — all Third Law.** You walk by pushing your foot backward on the ground. The ground pushes your foot forward (Third Law). You swim by pushing water backward with your hands. The water pushes you forward (Third Law). A propeller pushes air backward; the air pushes the plane forward (Third Law). A fan pushes air; the air pushes the fan and its housing backward (this is why you should anchor a fan). Every propulsion system in history works by pushing something backward and using the Third Law reaction to move forward. Understanding this makes the mechanics of every vehicle, animal, and machine immediately clear.`,

      `**Momentum and the Third Law: why the universe conserves momentum.** The Third Law has a profound mathematical consequence. In a system of two interacting objects, the forces they exert on each other are equal and opposite: F₁₂ = −F₂₁. By Newton's Second Law, F₁₂ = dp₁/dt and F₂₁ = dp₂/dt. Adding: dp₁/dt + dp₂/dt = 0, which means d(p₁ + p₂)/dt = 0 — the total momentum is constant. Conservation of momentum is not a separate law; it is a direct consequence of Newton's Third Law. Every collision, every explosion, every rocket burn conserves the total momentum of the system for the same reason: internal forces always come in equal-and-opposite pairs.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 9 — Where forces come from',
        body: `**Lesson 1 (First Law):** When net force = 0, acceleration = 0. The baseline.
**Lesson 2 (Second Law):** When net force ≠ 0, a = F/m. The master equation.
**This lesson (Third Law):** Forces never come alone — every force has an equal and opposite partner on a different object. This completes Newton's mechanical framework.
**Next:** Free body diagrams — the systematic tool for applying all three laws together.`,
      },
      {
        type: 'definition',
        title: "Newton's Third Law",
        body: `\\vec{F}_{A\\text{ on }B} = -\\vec{F}_{B\\text{ on }A} \\qquad \\text{(equal magnitude, opposite direction, on DIFFERENT objects)}`,
      },
      {
        type: 'warning',
        title: 'Third Law pairs vs. balanced forces — they look similar but are completely different',
        body: `Balanced forces: two forces acting on the SAME object that happen to cancel (a book in equilibrium has weight and normal force balanced — these are NOT a Third Law pair).
Third Law pair: the action and reaction forces always act on DIFFERENT objects. They can NEVER cancel each other because they are in different free body diagrams.`,
      },
      {
        type: 'connection',
        title: 'Third Law → Conservation of Momentum',
        body: `$F_{12} = -F_{21}$ means $dp_1/dt = -dp_2/dt$, so $d(p_1+p_2)/dt = 0$. Total momentum is conserved in any isolated system. Conservation of momentum is not a new law — it is Newton's Third Law applied to the rates of change of momentum.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'action-reaction' },
        title: 'Rocket propulsion: action-reaction pair',
        caption: "The rocket pushes exhaust gas backward (action). The exhaust gas pushes the rocket forward (reaction). The rocket accelerates forward; the exhaust accelerates backward. No external surface is needed — Newton's Third Law works in the vacuum of space.",
      },
      {
        id: 'SVGDiagram',
        props: { type: 'action-reaction' },
        title: 'Walking: pushing back, moving forward',
        mathBridge: `Your foot pushes backward on the ground (action). The ground pushes your foot forward (reaction). The forward reaction force accelerates you. Without that reaction, you could not walk — ice skaters on frictionless ice cannot push backward effectively.`,
        caption: `You don't walk by pulling yourself forward — you walk by pushing backward on the ground.`,
      },
    ],
  },

  math: {
    prose: [
      'The Third Law pair has a simple algebraic statement: F_{A on B} = −F_{B on A}. The magnitudes are equal; the signs are opposite.',
      "When analyzing systems with multiple objects, you apply Newton's Second Law to each object separately. The Third Law tells you the forces that connect them are equal and opposite.",
      "For two objects m₁ and m₂ in contact, the contact force that m₁ exerts on m₂ is equal and opposite to the contact force m₂ exerts on m₁. This is how you 'chain' the equations of motion for connected objects.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Third Law statement',
        body: '|\\vec{F}_{A\\text{ on }B}| = |\\vec{F}_{B\\text{ on }A}|, \\quad \\vec{F}_{A\\text{ on }B} + \\vec{F}_{B\\text{ on }A} = 0',
      },
      {
        type: 'insight',
        title: 'Momentum and the Third Law',
        body: "The Third Law is the reason momentum is conserved in a closed system. Internal forces (Third Law pairs within the system) always cancel: Σ(internal forces) = 0. Only external forces change the system's total momentum.",
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "Newton's Third Law is deeply connected to conservation of momentum. Consider an isolated system of two particles. The internal forces F₁₂ and F₂₁ obey the Third Law: F₁₂ = −F₂₁.",
      "By the Second Law: F₁₂ = m₁a₁ = m₁(dv₁/dt) and F₂₁ = m₂a₂ = m₂(dv₂/dt). Adding: F₁₂ + F₂₁ = d(m₁v₁)/dt + d(m₂v₂)/dt = d(p_total)/dt = 0.",
      "Therefore d(p_total)/dt = 0 → p_total = constant. The Third Law directly implies conservation of momentum — without it, momentum conservation would not follow from the laws of motion.",
      "Impulse-momentum preview: integrating F·dt = Δp over a collision, the Third Law guarantees that the impulse on object 1 is equal and opposite to the impulse on object 2. Total momentum change = 0.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Third Law → momentum conservation',
        body: 'F_{12} = -F_{21} \\quad\\Rightarrow\\quad \\frac{d}{dt}(\\vec{p}_1 + \\vec{p}_2) = \\vec{F}_{12} + \\vec{F}_{21} = 0 \\quad\\Rightarrow\\quad \\vec{p}_{\\text{total}} = \\text{const}',
      },
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'action-reaction' },
    proofSteps: [
      {
        title: 'State the Third Law',
        expression: '\\vec{F}_{1\\text{ on }2} = -\\vec{F}_{2\\text{ on }1}',
        annotation: 'Forces are equal in magnitude, opposite in direction.',
      },
      {
        title: "Apply Newton's Second Law to each object",
        expression: '\\vec{F}_{1\\text{ on }2} = m_2 \\vec{a}_2 = m_2 \\frac{d\\vec{v}_2}{dt}, \\quad \\vec{F}_{2\\text{ on }1} = m_1 \\frac{d\\vec{v}_1}{dt}',
        annotation: 'Each object responds to its own net force.',
      },
      {
        title: 'Sum the two force equations',
        expression: 'm_1 \\frac{d\\vec{v}_1}{dt} + m_2 \\frac{d\\vec{v}_2}{dt} = \\vec{F}_{2\\text{ on }1} + \\vec{F}_{1\\text{ on }2} = 0',
        annotation: 'The internal forces cancel because of the Third Law.',
      },
      {
        title: 'Recognize this as total momentum derivative',
        expression: '\\frac{d}{dt}(m_1 \\vec{v}_1 + m_2 \\vec{v}_2) = \\frac{d\\vec{p}_{\\text{total}}}{dt} = 0',
        annotation: 'Total momentum is the quantity whose derivative is zero.',
      },
      {
        title: 'Conclusion: momentum is conserved',
        expression: '\\vec{p}_{\\text{total}} = m_1 \\vec{v}_1 + m_2 \\vec{v}_2 = \\text{constant}',
        annotation: "Conservation of momentum is a direct consequence of Newton's Third Law applied to an isolated system.",
      },
    ],
    title: "Derivation: Conservation of Momentum from Newton's Third Law",
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'action-reaction' },
        title: 'Third Law pairs and momentum conservation',
        mathBridge: `When internal force pairs cancel (Third Law), $dp_{total}/dt = 0$. This is the calculus statement of momentum conservation — it follows directly from the Third Law.`,
        caption: 'Third Law → internal forces cancel → total momentum is constant.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-003-ex1',
      title: 'Identifying Third Law pairs for a book on a table',
      problem: "A 1 kg book rests on a table. List all Third Law force pairs. Identify which forces are balanced forces on a single object and which are Third Law pairs.",
      steps: [
        {
          expression: '\\text{Forces on the book: } W_{\\text{Earth on book}} = 10\\,\\text{N (down)}, \\quad N_{\\text{table on book}} = 10\\,\\text{N (up)}',
          annotation: 'These two forces act on the SAME object (book) and happen to cancel. They are NOT a Third Law pair — gravity and normal force are different types.',
        },
        {
          expression: '\\text{Third Law pair 1: } W_{\\text{Earth on book}} \\leftrightarrow W_{\\text{book on Earth}} \\;(10\\,\\text{N up on Earth})',
          annotation: "Both gravitational forces. Earth pulls book down; book pulls Earth up — same magnitude, opposite direction, on different objects.",
        },
        {
          expression: '\\text{Third Law pair 2: } N_{\\text{table on book}} \\leftrightarrow N_{\\text{book on table}} \\;(10\\,\\text{N down on table})',
          annotation: 'Both contact/normal forces. Table pushes book up; book pushes table down.',
        },
      ],
      conclusion: "There are 2 Third Law pairs. The balanced forces on the book (gravity + normal) are NOT a Third Law pair — they are different types of forces on the same object. Always distinguish 'balanced forces on one object' from 'Third Law pairs on different objects.'",
    },
    {
      id: 'ch4-003-ex2',
      title: 'Rocket propulsion in space',
      problem: 'A 500 kg rocket in deep space ejects exhaust gas at 800 m/s backward. The thrust (reaction force on rocket) is 4000 N. Find the rocket\'s acceleration. Then explain using the Third Law.',
      steps: [
        {
          expression: 'F_{\\text{thrust}} = 4000\\,\\text{N \\;(forward, reaction force on rocket)}',
          annotation: 'The reaction force from the ejected gas pushes the rocket forward.',
        },
        {
          expression: 'a = \\frac{F}{m} = \\frac{4000}{500} = 8\\,\\text{m/s}^2 \\;(\\text{forward})',
          annotation: "Apply Newton's Second Law to the rocket alone.",
        },
        {
          expression: '\\text{Third Law: } F_{\\text{rocket on gas}} = 4000\\,\\text{N backward}; \\quad F_{\\text{gas on rocket}} = 4000\\,\\text{N forward}',
          annotation: 'Equal in magnitude, opposite in direction, on different objects.',
        },
      ],
      conclusion: "The rocket accelerates at 8 m/s² forward. No ground or air is needed — the reaction force of the ejected gas IS the thrust. This works in vacuum because Newton's Third Law doesn't require a medium.",
    },
  ],

  challenges: [
    {
      id: 'ch4-003-ch1',
      difficulty: 'easy',
      problem: 'A 70 kg person stands on a scale in an elevator at rest. (a) What does the scale read? (b) The elevator accelerates upward at 2 m/s². What does the scale read now? Use g = 10 m/s².',
      hint: 'The scale reads the Normal force, not the weight. Use ΣF = ma on the person for part (b).',
      walkthrough: [
        {
          expression: '\\text{(a) At rest: } N = mg = 70 \\times 10 = 700\\,\\text{N}',
          annotation: 'Equilibrium: N = mg. The scale reads 700 N (≈70 kg).',
        },
        {
          expression: '\\text{(b) } \\sum F_y = N - mg = ma \\quad\\Rightarrow\\quad N = m(g+a) = 70(10+2) = 840\\,\\text{N}',
          annotation: 'Net upward force accelerates the person upward. N must exceed mg.',
        },
      ],
      answer: '(a) 700 N; (b) 840 N. The person feels "heavier" when accelerating upward.',
    },
    {
      id: 'ch4-003-ch2',
      difficulty: 'medium',
      problem: "Two skaters on frictionless ice: skater A (60 kg) pushes skater B (40 kg) with 120 N for 0.5 s. Find: (a) the force on A from B, (b) acceleration of each, (c) velocity of each after 0.5 s, (d) confirm momentum is conserved.",
      hint: 'Third Law: force on A from B = −120 N. Apply F = ma to each separately. Then check total momentum before and after.',
      walkthrough: [
        {
          expression: 'F_{\\text{B on A}} = -120\\,\\text{N} \\;(\\text{opposite to push})',
          annotation: "Third Law: reaction force on A equals 120 N in the opposite direction.",
        },
        {
          expression: 'a_A = \\frac{-120}{60} = -2\\,\\text{m/s}^2, \\quad a_B = \\frac{+120}{40} = +3\\,\\text{m/s}^2',
          annotation: 'Apply F = ma to each skater.',
        },
        {
          expression: 'v_A = 0 + (-2)(0.5) = -1\\,\\text{m/s}, \\quad v_B = 0 + 3(0.5) = 1.5\\,\\text{m/s}',
          annotation: 'Use v = v₀ + at with v₀ = 0 for both (started at rest).',
        },
        {
          expression: 'p_{\\text{before}} = 0, \\quad p_{\\text{after}} = 60(-1) + 40(1.5) = -60 + 60 = 0\\,\\checkmark',
          annotation: 'Total momentum is conserved: 0 before and 0 after. Third Law ensures this.',
        },
      ],
      answer: 'Force on A = 120 N (backward); aₐ = −2 m/s², a_B = 3 m/s²; vₐ = −1 m/s, v_B = 1.5 m/s; momentum is conserved (both equal zero).',
    },
  ],

  python: {
    intro: `Use Python to simulate Newton's Third Law pairs: rocket thrust, skater pushes, and two-object collisions. Verify momentum conservation numerically and visualize action-reaction dynamics.`,
    cells: [
      {
        id: 'p4-003-py1',
        type: 'code',
        cellTitle: 'Skater push: Third Law and momentum conservation',
        prose: `Two skaters start at rest. Skater A (60 kg) pushes skater B (40 kg) with 120 N for 0.5 s. By the Third Law, B pushes A with 120 N backward. Simulate both trajectories and verify total momentum stays zero.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `m1, m2 = 60, 40`,
          `F = 120  # N (A pushes B forward, B pushes A backward)`,
          `push_duration = 0.5`,
          `dt = 0.001`,
          ``,
          `t_vals = np.arange(0, 2, dt)`,
          `v1, v2 = 0.0, 0.0`,
          `v1_hist, v2_hist, p_total = [], [], []`,
          ``,
          `for t in t_vals:`,
          `    if t < push_duration:`,
          `        a1 = -F / m1  # Third Law: force on A is backward`,
          `        a2 = F / m2   # force on B is forward`,
          `    else:`,
          `        a1 = a2 = 0`,
          `    v1 += a1 * dt`,
          `    v2 += a2 * dt`,
          `    v1_hist.append(v1)`,
          `    v2_hist.append(v2)`,
          `    p_total.append(m1 * v1 + m2 * v2)`,
          ``,
          `fig, axes = plt.subplots(1, 2, figsize=(11, 4))`,
          `axes[0].plot(t_vals, v1_hist, "b-", lw=2, label=f"Skater A ({m1} kg)")`,
          `axes[0].plot(t_vals, v2_hist, "r-", lw=2, label=f"Skater B ({m2} kg)")`,
          `axes[0].axvline(push_duration, color="gray", ls="--", label="Push ends")`,
          `axes[0].set_xlabel("t (s)"); axes[0].set_ylabel("v (m/s)")`,
          `axes[0].set_title("Velocities during and after push")`,
          `axes[0].legend(); axes[0].grid(True, alpha=0.3)`,
          ``,
          `axes[1].plot(t_vals, p_total, "g-", lw=2)`,
          `axes[1].set_xlabel("t (s)"); axes[1].set_ylabel("Total momentum (kg·m/s)")`,
          `axes[1].set_title("Total momentum: conserved (stays near 0)")`,
          `axes[1].grid(True, alpha=0.3)`,
          ``,
          `plt.tight_layout()`,
          `plt.savefig("skater_push.png", dpi=120)`,
          `plt.show()`,
          `print(f"Final v_A = {v1_hist[-1]:.2f} m/s, v_B = {v2_hist[-1]:.2f} m/s")`,
          `print(f"Final p_total = {p_total[-1]:.4f} kg·m/s  (should be ~0)")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-003-py2',
        type: 'code',
        cellTitle: 'Rocket thrust: action-reaction in vacuum',
        prose: `A rocket ejects exhaust at speed $v_{ex}$ backward (in the rocket frame). By the Third Law, the exhaust pushes the rocket forward. Simulate the rocket's acceleration with decreasing mass (Tsiolkovsky rocket equation preview).`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `# Simplified rocket: constant thrust, decreasing mass`,
          `m0 = 500   # initial mass (kg)`,
          `thrust = 4000  # N`,
          `burn_rate = 2  # kg/s (mass loss rate)`,
          `t_burn = 100   # seconds of burn`,
          ``,
          `dt = 0.1`,
          `t_vals = np.arange(0, t_burn, dt)`,
          `v_vals, a_vals, m_vals = [], [], []`,
          `v, m = 0, m0`,
          ``,
          `for t in t_vals:`,
          `    if m > 0.1 * m0:  # stop when 90% propellant is used`,
          `        a = thrust / m`,
          `        v += a * dt`,
          `        m -= burn_rate * dt`,
          `    else:`,
          `        a = 0`,
          `    v_vals.append(v)`,
          `    a_vals.append(a)`,
          `    m_vals.append(m)`,
          ``,
          `fig, axes = plt.subplots(1, 2, figsize=(11, 4))`,
          `axes[0].plot(t_vals, v_vals, "b-", lw=2, label="Rocket velocity")`,
          `axes[0].set_xlabel("t (s)"); axes[0].set_ylabel("v (m/s)")`,
          `axes[0].set_title("Rocket speed increases as mass decreases")`,
          `axes[0].grid(True, alpha=0.3)`,
          ``,
          `ax2 = axes[0].twinx()`,
          `ax2.plot(t_vals, m_vals, "r--", lw=1.5, label="Mass")`,
          `ax2.set_ylabel("Mass (kg)", color="r")`,
          ``,
          `axes[1].plot(t_vals, a_vals, "g-", lw=2)`,
          `axes[1].set_xlabel("t (s)"); axes[1].set_ylabel("a (m/s²)")`,
          `axes[1].set_title("Acceleration increases (same F, less mass)")`,
          `axes[1].grid(True, alpha=0.3)`,
          ``,
          `plt.tight_layout()`,
          `plt.savefig("rocket_thrust.png", dpi=120)`,
          `plt.show()`,
          `print(f"Final speed: {v_vals[-1]:.1f} m/s, Final mass: {m_vals[-1]:.1f} kg")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-003-py3',
        type: 'code',
        cellTitle: 'Earth-jump: why you move and Earth does not',
        prose: `When you jump, you push Earth down with ~700 N; Earth pushes you up with 700 N. Both get the same impulse. But Earth has mass $6 \\times 10^{24}$ kg — so its acceleration is negligible. Compute and compare.`,
        code: [
          `# Jumping: Third Law with wildly different masses`,
          `F = 700       # N (force during jump push, ~1 extra body weight)`,
          `t_push = 0.2  # s (push duration)`,
          ``,
          `m_person = 70    # kg`,
          `m_earth = 6e24   # kg`,
          ``,
          `a_person = F / m_person`,
          `a_earth  = F / m_earth`,
          ``,
          `v_person = a_person * t_push`,
          `v_earth  = a_earth  * t_push`,
          ``,
          `print("=== Third Law: jumping off Earth ===")`,
          `print(f"Force on person (up): {F} N")`,
          `print(f"Force on Earth (down): {F} N  (equal magnitude, Third Law)")`,
          `print()`,
          `print(f"Person acceleration: {a_person:.2f} m/s^2")`,
          `print(f"Earth acceleration:  {a_earth:.2e} m/s^2  (undetectable)")`,
          `print()`,
          `print(f"Person velocity after push: {v_person:.2f} m/s  (you jump!)")`,
          `print(f"Earth velocity after push:  {v_earth:.2e} m/s  (essentially 0)")`,
          `print()`,
          `print(f"Momentum of person: {m_person * v_person:.1f} kg·m/s")`,
          `print(f"Momentum of Earth:  {m_earth * v_earth:.1f} kg·m/s  (equal & opposite)")`,
          `print(f"Total momentum:     {m_person*v_person + m_earth*v_earth:.6f} kg·m/s  (conserved = 0)")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-003-py4',
        type: 'code',
        cellTitle: 'Challenge: identify valid Third Law pairs',
        prose: `A valid Third Law pair satisfies four criteria: equal magnitude, opposite direction, same force type, and on different objects. Complete the validator below.`,
        challengeType: 'write',
        challengeNumber: 1,
        challengeTitle: 'Third Law pair validator',
        difficulty: 'easy',
        prompt: `Complete is_third_law_pair(force_a, force_b) where each force is a dict with keys 'magnitude', 'direction', 'type', 'object'. Return True if it's a valid Third Law pair, False otherwise.`,
        starterBlock: [
          `def is_third_law_pair(force_a, force_b):`,
          `    # Check 1: equal magnitude`,
          `    if abs(force_a["magnitude"] - force_b["magnitude"]) > 0.001:`,
          `        return False`,
          `    # Check 2: opposite directions (directions sum to zero)`,
          `    if force_a["direction"] + force_b["direction"] != 0:`,
          `        return ___`,
          `    # Check 3: same force type`,
          `    if force_a["type"] != force_b["type"]:`,
          `        return ___`,
          `    # Check 4: different objects`,
          `    if force_a["object"] == force_b["object"]:`,
          `        return ___`,
          `    return True`,
          ``,
          `# Test cases`,
          `pair1 = ({"magnitude":10,"direction":+1,"type":"gravity","object":"book"},`,
          `         {"magnitude":10,"direction":-1,"type":"gravity","object":"earth"})`,
          `pair2 = ({"magnitude":10,"direction":+1,"type":"normal","object":"book"},`,
          `         {"magnitude":10,"direction":-1,"type":"gravity","object":"book"})  # SAME object!`,
          `pair3 = ({"magnitude":10,"direction":+1,"type":"contact","object":"book"},`,
          `         {"magnitude":10,"direction":-1,"type":"gravity","object":"table"})  # different types!`,
          ``,
          `print(f"Pair 1 (valid): {is_third_law_pair(*pair1)}")`,
          `print(f"Pair 2 (same object): {is_third_law_pair(*pair2)}")`,
          `print(f"Pair 3 (different types): {is_third_law_pair(*pair3)}")`,
        ].join('\n'),
        testCode: [
          `assert is_third_law_pair(*pair1) == True`,
          `assert is_third_law_pair(*pair2) == False`,
          `assert is_third_law_pair(*pair3) == False`,
          `print("All tests passed!")`,
        ].join('\n'),
        hint: `Return False for each failing condition. All four conditions must be true for a valid Third Law pair.`,
        code: '',
        output: '',
        status: 'idle',
        figureJson: null,
      },
    ],
  },

  quiz: [
    {
      id: 'p1-ch4-003-q1',
      question: `Newton's Third Law states that action and reaction forces are equal and opposite. Where do they act?`,
      options: [
        `On the same object, canceling each other out`,
        `On different objects — they cannot cancel`,
        `At the same point in space`,
        `Only when objects are in contact`,
      ],
      answer: 1,
      explanation: `Third Law pairs always act on different objects. A book on a table: gravity (Earth on book) and its reaction (book on Earth) act on Earth and the book respectively — different objects. They never cancel because they act on separate systems.`,
    },
    {
      id: 'p1-ch4-003-q2',
      question: `A 500 kg rocket in space receives 4000 N of thrust from its exhaust. What is the force the rocket exerts on the exhaust?`,
      options: [
        `Zero — the exhaust is already moving`,
        `4000 N in the same direction as thrust`,
        `4000 N in the opposite direction (backward on exhaust)`,
        `Depends on the exhaust velocity`,
      ],
      answer: 2,
      explanation: `By the Third Law: the rocket pushes the exhaust backward with 4000 N; the exhaust pushes the rocket forward with 4000 N. Equal magnitude, opposite direction, on different objects.`,
    },
    {
      id: 'p1-ch4-003-q3',
      question: `You push a wall with 50 N. The wall pushes back on you with:`,
      options: [
        `More than 50 N (the wall is stronger)`,
        `Less than 50 N (walls can't push people)`,
        `Exactly 50 N (Third Law)`,
        `0 N (walls don't move)`,
      ],
      answer: 2,
      explanation: `By the Third Law, the wall exerts exactly 50 N on you — equal in magnitude, opposite in direction. Whether the wall moves is irrelevant to the force pair.`,
    },
    {
      id: 'p1-ch4-003-q4',
      question: `Two skaters (60 kg and 40 kg) push off each other from rest. The 60 kg skater ends up moving at 1 m/s. How fast is the 40 kg skater moving?`,
      options: [
        `$1\\,\\text{m/s}$ (same speed)`,
        `$1.5\\,\\text{m/s}$ (faster, less mass)`,
        `$2.4\\,\\text{m/s}$`,
        `$0.67\\,\\text{m/s}$`,
      ],
      answer: 1,
      explanation: `Momentum conservation: $0 = m_1 v_1 + m_2 v_2 \\Rightarrow 60(1) + 40 v_2 = 0 \\Rightarrow v_2 = -1.5\\,\\text{m/s}$. The lighter skater moves faster in the opposite direction.`,
    },
    {
      id: 'p1-ch4-003-q5',
      question: `A book rests on a table. Gravity (Earth pulls book down, 10 N) and the normal force (table pushes book up, 10 N) are NOT a Third Law pair because:`,
      options: [
        `They are not equal in magnitude`,
        `They are different types of force and act on the same object`,
        `The book is not accelerating`,
        `Third Law doesn't apply to objects at rest`,
      ],
      answer: 1,
      explanation: `Gravity is a gravitational force; normal force is a contact force — different types. Also, both act on the book (same object). A Third Law pair requires the same force type on different objects. These are instead two forces in equilibrium on the same object.`,
    },
    {
      id: 'p1-ch4-003-q6',
      question: `Why does jumping off Earth not visibly move the Earth?`,
      options: [
        `The Earth exerts a much larger force on you than you on it`,
        `The Third Law doesn't apply to the Earth`,
        `The Earth's mass is so large that its acceleration from the same force is negligible`,
        `Earth is fixed in space by gravity`,
      ],
      answer: 2,
      explanation: `The force is equal (Third Law), but $a = F/m$. Earth's mass ($6 \\times 10^{24}\\,\\text{kg}$) is enormous, so its acceleration ($\\approx 10^{-23}\\,\\text{m/s}^2$) is undetectable. You accelerate noticeably; Earth barely moves.`,
    },
    {
      id: 'p1-ch4-003-q7',
      question: `The Third Law implies conservation of momentum because:`,
      options: [
        `Equal forces mean equal accelerations`,
        `Internal force pairs cancel, making $d\\vec{p}_{total}/dt = 0$`,
        `External forces always cancel in closed systems`,
        `Newton's Second Law says so directly`,
      ],
      answer: 1,
      explanation: `In an isolated two-body system: $\\vec{F}_{12} + \\vec{F}_{21} = 0$ (Third Law). Therefore $m_1\\vec{a}_1 + m_2\\vec{a}_2 = d(m_1\\vec{v}_1 + m_2\\vec{v}_2)/dt = 0$, so total momentum is constant.`,
    },
    {
      id: 'p1-ch4-003-q8',
      question: `A horse pulls a cart forward. The cart pulls the horse backward with equal force (Third Law). How does the horse move forward at all?`,
      options: [
        `The horse is stronger than the cart`,
        `The Third Law doesn't apply here`,
        `The ground pushes the horse forward with a friction force — which is not balanced by an equal backward force on the horse`,
        `The horse generates more force over time`,
      ],
      answer: 2,
      explanation: `The Third Law pair is horse-on-cart and cart-on-horse — these cancel as internal forces of the horse-cart system. But the ground pushes the horse forward via friction. That external force on the system is not canceled, so the system accelerates forward.`,
    },
    {
      id: 'p1-ch4-003-q9',
      question: `In a rocket's exhaust, the rocket exerts 10,000 N on the gas. What is the thrust on the rocket?`,
      options: [
        `0 N (the gas isn't touching anything)`,
        `5,000 N (half the force)`,
        `10,000 N (Third Law)`,
        `More than 10,000 N (rocket engines amplify force)`,
      ],
      answer: 2,
      explanation: `Third Law: the force the rocket exerts on the gas equals the force the gas exerts on the rocket — 10,000 N in opposite directions. No amplification; no loss.`,
    },
    {
      id: 'p1-ch4-003-q10',
      question: `A 70 kg person stands in an elevator accelerating downward at $3\\,\\text{m/s}^2$. ($g = 10\\,\\text{m/s}^2$) What does a scale under them read?`,
      options: [
        `$700\\,\\text{N}$`,
        `$910\\,\\text{N}$`,
        `$490\\,\\text{N}$`,
        `$0\\,\\text{N}$`,
      ],
      answer: 2,
      explanation: `$\\sum F_y = N - mg = m(-a) \\Rightarrow N = m(g-a) = 70(10-3) = 490\\,\\text{N}$. The person feels lighter when accelerating downward.`,
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'action-reaction' }, title: 'Action-reaction force pairs' },
  ],

  misconceptions: [
    {
      id: 'p4-003-m1',
      misconception: 'Action-reaction pairs cancel each other, so they always result in zero net force and no motion.',
      correction: 'Action-reaction forces act on DIFFERENT objects and can NEVER be on the same free-body diagram. They cannot cancel because they don\'t act on the same object. A horse pulling a cart: the horse pulls the cart forward (on the cart); the cart pulls the horse backward (on the horse). These are on different FBDs. Whether the horse accelerates forward depends on the forces on the HORSE only (ground friction forward beats cart tension backward).',
      correctionExample: 'Book on table: gravity pulls book down (on book); book pulls Earth up (on Earth). Table pushes book up (on book); book pushes table down (on table). The two forces on the BOOK — gravity and normal — are NOT a 3rd law pair; they just happen to be equal. The 3rd law pairs involve the Earth and the table.',
    },
    {
      id: 'p4-003-m2',
      misconception: 'A stronger, heavier object exerts a larger force on a lighter object than the lighter object exerts back.',
      correction: 'Newton\'s Third Law is absolute: the forces are EQUAL in magnitude regardless of mass or strength. A truck hitting a mosquito: the truck exerts exactly the same force on the mosquito as the mosquito exerts on the truck. The truck barely decelerates (huge mass); the mosquito is destroyed (tiny mass). Same force, very different accelerations because a = F/m and m differs enormously.',
      correctionExample: 'Earth pulling you down: F = mg ≈ 700 N. You pull Earth upward with the same 700 N. Earth\'s acceleration = 700/(6×10²⁴) ≈ 10⁻²² m/s² — immeasurably small. Equal forces, wildly different outcomes.',
    },
  ],

  transferPrompts: [
    {
      id: 'p4-003-t1',
      prompt: `A rocket in space fires its engines, expelling hot gas backward. There is no air to "push against." How does Newton\'s Third Law explain how the rocket accelerates? Specifically, identify the action-reaction pair and explain why ejecting more mass at higher speed produces more thrust.`,
      connection: 'Rocket on exhaust gas (action) → exhaust gas on rocket (reaction). Thrust = rate of momentum transfer: F = Δ(mv)/Δt. Newton\'s 3rd law enables propulsion without anything to push against.',
    },
    {
      id: 'p4-003-t2',
      prompt: `During a head-on car collision between a 2000 kg SUV and a 1000 kg compact car, both come to rest. The SUV driver claims "we hit them harder — our car weighs more." The compact car driver claims "they hit us with a bigger force." Who is right? Use Newton\'s Third Law and then F = ma to explain why the compact car occupants experience more dangerous accelerations.`,
      connection: 'Same force (3rd law), but a = F/m: smaller car mass → larger acceleration → more dangerous deceleration for occupants. The 3rd law gives equal forces; physics determines unequal consequences.',
    },
  ],

  debugging: [
    {
      id: 'p4-003-d1',
      error: `A student draws a free-body diagram for a horse pulling a cart. They include: (1) tension from the rope on the horse, (2) ground friction on the horse, AND (3) the horse's pull on the cart (reaction force). The student says "the horse can't accelerate because forces 1 and 3 cancel."`,
      fix: `Force (3) — the horse's pull on the cart — belongs on the CART's free-body diagram, not the horse's. You never put action-reaction pairs on the same FBD. The horse's FBD has: ground friction (forward) and rope tension (backward). If friction > tension: net force forward → horse accelerates. The cart's FBD separately has: rope tension (forward) and maybe friction (backward).`,
    },
    {
      id: 'p4-003-d2',
      error: `A student identifies the 3rd law pair for a book resting on a table as: "gravity pulls the book down (action) and the table pushes the book up (reaction)."`,
      fix: `These are NOT a Newton's Third Law pair. A 3rd law pair must be: the same type of force, between the same two objects, equal and opposite.
The actual 3rd law pairs are:
1. Earth pulls book down (gravity) ↔ book pulls Earth up (gravity)
2. Table pushes book up (normal) ↔ book pushes table down (normal)

The gravity (Earth) and normal force (table) are different types of forces from different sources — they are NOT a 3rd law pair, even though they happen to be equal (because the book is in equilibrium).`,
    },
  ],

  mastery: {
    targetLevel: 'Correctly identify Newton\'s Third Law pairs; recognize that action-reaction forces act on different objects; explain why 3rd law pairs never appear on the same FBD.',
    checklistItems: [
      'Can identify the exact 3rd law pair for any given force: same magnitude, opposite direction, same type of force, different objects',
      'Can explain why action-reaction forces do NOT cancel: they act on different objects',
      'Can draw separate FBDs for interacting objects and correctly include only forces acting ON that object',
      'Can explain rocket propulsion, walking, and swimming using Newton\'s Third Law',
    ],
    commonStruggles: [
      'Putting action-reaction forces on the same FBD — they always belong on different diagrams',
      'Identifying "gravity + normal force on book" as a 3rd law pair — they are two different kinds of force from two different sources',
      'Thinking heavier objects exert more force in collisions — 3rd law forces are always equal regardless of mass',
    ],
    nextSteps: 'Lesson p4-004 (Free Body Diagrams) systematizes the process of identifying all forces on an object correctly.',
  },

  semantics: {
    core: [
      { symbol: 'F_{AB} = -F_{BA}', meaning: 'Newton\'s 3rd Law: force of A on B equals and opposes force of B on A — always equal magnitude, opposite direction' },
      { symbol: '\\text{same type, different objects}', meaning: 'Rule for 3rd law pairs: gravity↔gravity, normal↔normal, tension↔tension — and ALWAYS on separate objects' },
      { symbol: 'F_{\\text{on cart}}', meaning: 'Subscript notation: force acting ON the cart — always specify which object the force acts on when using 3rd law' },
    ],
    rulesOfThumb: [
      '3rd law pairs: same type of force, same magnitude, opposite direction, on DIFFERENT objects.',
      'Action-reaction pairs never appear on the same free-body diagram — they act on different objects.',
      'Mass doesn\'t affect the force magnitude in a 3rd law pair. A bug and a truck exchange equal forces.',
      'To find the 3rd law partner of "Earth pulls book down (gravity)": "book pulls Earth up (gravity)." Swap the names.',
      'Walking works because the floor pushes you forward (reaction) when you push backward on the floor (action).',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: "Newton's Third Law in Python",
      cells: [
        {
          cellTitle: 'Action-reaction: equal forces, unequal accelerations',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Collision: truck (2000 kg) hits compact car (1000 kg)
# Newton's 3rd Law: both experience the same magnitude force during collision
m_truck = 2000   # kg
m_compact = 1000 # kg

# Impulse = F*Δt = Δp. Both experience the same impulse magnitude.
# If both start at v_truck=20 m/s, v_compact=0 (compact at rest), find velocities after
# Using momentum conservation: m1*v1 + m2*v2 = (m1+m2)*v_final (perfectly inelastic)
v_truck_i = 20   # m/s (initial)
v_compact_i = 0

v_final = (m_truck * v_truck_i + m_compact * v_compact_i) / (m_truck + m_compact)

# Impulse on each car (from momentum change): J = Δp = m*Δv
J_truck   = m_truck   * (v_final - v_truck_i)     # negative (slowed)
J_compact = m_compact * (v_final - v_compact_i)   # positive (sped up)

# 3rd Law: same force magnitude during collision
delta_t = 0.05  # s (collision duration)
F_on_compact = J_compact / delta_t
F_on_truck   = J_truck   / delta_t

print("Newton's Third Law: action-reaction in a collision")
print(f"Compact car mass: {m_compact} kg,  Truck mass: {m_truck} kg")
print(f"Before: v_truck = {v_truck_i} m/s,  v_compact = {v_compact_i} m/s")
print(f"After:  both at v_final = {v_final:.2f} m/s")
print()
print(f"Impulse on compact: {J_compact:.0f} N·s  →  Force = {F_on_compact:.0f} N")
print(f"Impulse on truck:   {J_truck:.0f} N·s  →  Force = {F_on_truck:.0f} N")
print(f"Force ratio: {abs(F_on_compact/F_on_truck):.3f}  (should be exactly 1.0 — 3rd Law!)")
print()
# Accelerations differ because masses differ!
a_compact = F_on_compact / m_compact
a_truck   = F_on_truck   / m_truck
print(f"Acceleration of compact: {abs(a_compact):.2f} m/s²")
print(f"Acceleration of truck:   {abs(a_truck):.2f} m/s²")
print(f"Ratio: {abs(a_compact/a_truck):.1f}x — compact experiences {abs(a_compact/a_truck):.0f}× more acceleration!")`,
          prose: [
            'v_final = (m_truck*v_i + m_compact*0) / (m_truck + m_compact) is the perfectly inelastic collision formula from momentum conservation. Both objects end up at the same velocity when they stick together.',
            'J_truck = m_truck*(v_final - v_truck_i) and J_compact = m_compact*(v_final - v_compact_i) compute the impulse on each vehicle. The 3rd Law says |J_truck| = |J_compact| — the impulses are equal in magnitude (opposite sign because they point in opposite directions).',
            'The key result: same force (same impulse), but a = F/m gives different accelerations. The compact car is half the mass, so it experiences twice the acceleration. This is why smaller cars are more dangerous in collisions — same force, more violent deceleration.',
          ],
        },
        {
          cellTitle: 'Rocket propulsion: no air needed',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Rocket: ejects mass at exhaust velocity v_e, gaining speed via 3rd Law
# Tsiolkovsky rocket equation: Δv = v_e * ln(m_0/m_f)
v_exhaust = 3000  # m/s (typical chemical rocket)
m_0 = 1000        # kg (initial: rocket + fuel)
m_propellant = np.linspace(0, 900, 300)  # kg of propellant burned
m_current = m_0 - m_propellant
delta_v = v_exhaust * np.log(m_0 / m_current)

plt.figure(figsize=(8, 5))
plt.plot(m_propellant / m_0 * 100, delta_v / 1000, 'b-', linewidth=2)
plt.xlabel('Propellant burned (% of initial mass)')
plt.ylabel('Δv (km/s)')
plt.title(f'Tsiolkovsky rocket equation: Δv = v_e × ln(m₀/m_f)  [v_e = {v_exhaust/1000:.0f} km/s]')
plt.grid(True)
plt.axhline(7.8, color='r', linestyle='--', label='Orbital velocity ≈ 7.8 km/s')
plt.legend()
plt.show()

# Find propellant fraction needed for orbit
frac_needed = 1 - np.exp(-7800 / v_exhaust)
print(f"To reach orbit (Δv=7.8 km/s): burn {frac_needed*100:.0f}% of initial mass as propellant")
print(f"For m0=1000 kg: only {(1-frac_needed)*1000:.0f} kg makes it to orbit")`,
          prose: [
            'delta_v = v_exhaust * np.log(m_0 / m_current) implements the Tsiolkovsky rocket equation: Δv = v_e ln(m₀/m_f). This is derived from Newton\'s 3rd Law applied to continuous propellant ejection — each bit of exhaust pushes the rocket forward.',
            'The logarithm means diminishing returns: burning the first 50% of your mass gives much more Δv than burning the next 50%. This is why rockets are mostly fuel — you need to carry fuel to burn later, which costs more fuel to lift now.',
            'The red dashed line shows orbital velocity (~7.8 km/s). With v_exhaust = 3000 m/s, you need to burn about 92% of your initial mass as propellant. This is why multi-stage rockets exist — drop empty tanks to reduce mass and improve the ratio.',
          ],
        },
        {
          cellTitle: 'Identifying 3rd Law pairs in a scene',
          type: 'code',
          language: 'python',
          code: `# Newton's 3rd Law pair identifier
# Given a force, find its 3rd law partner

def find_3rd_law_pair(force_description):
    """
    A 3rd Law pair has: same type, same magnitude, opposite direction, different objects.
    Input format: "Object A exerts [type] force on Object B"
    """
    # Examples of 3rd law pairs
    pairs = [
        ("Earth pulls book down (gravity)",   "Book pulls Earth up (gravity)"),
        ("Table pushes book up (normal)",     "Book pushes table down (normal)"),
        ("Person pushes floor backward",       "Floor pushes person forward (reaction)"),
        ("Rocket pushes exhaust backward",    "Exhaust pushes rocket forward"),
        ("Truck pushes compact car forward",  "Compact car pushes truck backward"),
        ("Horse pulls cart forward (tension)", "Cart pulls horse backward (tension)"),
    ]

    print("Common 3rd Law Pairs:")
    print("="*65)
    for action, reaction in pairs:
        print(f"  ACTION:   {action}")
        print(f"  REACTION: {reaction}")
        print(f"  → Same type, equal magnitude, opposite direction, different objects")
        print()

    print("Key rule: swap the two object names in the force description.")
    print("The reaction is: [Object B] exerts the SAME TYPE of force on [Object A]")
    print("              in the OPPOSITE direction.")

find_3rd_law_pair(None)`,
          prose: [
            'The pairs dictionary captures the essential pattern: each 3rd law pair involves the same type of force (gravity↔gravity, normal↔normal, tension↔tension) between the same two objects. The only thing that changes is direction.',
            'The "swap the names" rule is the practical algorithm: to find the 3rd law partner of "Earth pulls book down (gravity)", swap Earth and book: "book pulls Earth up (gravity)." This always works.',
            'The "Floor pushes person forward" example explains walking: you push backward on the floor (action), the floor pushes you forward (reaction). Without a surface to push against, you cannot accelerate forward — this is why you can\'t walk on perfectly frictionless ice.',
          ],
        },
        {
          cellTitle: 'Challenge: system of two connected blocks',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# Two blocks connected by a string on a frictionless surface
# Block A (m_A = 3 kg) is pulled right by F = 12 N
# Block B (m_B = 2 kg) is connected behind A by string tension T
# Newton's 3rd Law: A pulls B forward via T; B pulls A backward via T

m_A = 3.0  # kg
m_B = 2.0  # kg
F = 12.0   # N applied to A

# TODO:
# 1. Treat system as one object: a = F / (m_A + m_B)
# 2. Find tension T from FBD of block B alone: T = m_B * a
# 3. Verify from FBD of block A: F - T = m_A * a (should be consistent)
# 4. Print a and T
# 5. Identify the 3rd law pair involving the string tension
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: "Newton's Third Law in MATLAB/Octave",
      cells: [
        {
          cellTitle: 'Collision: equal forces, unequal accelerations',
          type: 'code',
          language: 'matlab',
          code: `% Newton's 3rd Law: same collision force on truck and compact car
m_truck = 2000; m_compact = 1000;  % kg
v_truck_i = 20; v_compact_i = 0;   % m/s

% Perfectly inelastic collision (they stick)
v_final = (m_truck*v_truck_i + m_compact*v_compact_i) / (m_truck + m_compact);

dt = 0.05;  % collision duration (s)
J_compact = m_compact * (v_final - v_compact_i);  % impulse on compact
J_truck   = m_truck   * (v_final - v_truck_i);    % impulse on truck

F_compact = J_compact / dt;
F_truck   = J_truck   / dt;

a_compact = abs(F_compact) / m_compact;
a_truck   = abs(F_truck)   / m_truck;

fprintf("Force on compact:  %.0f N\\n", F_compact);
fprintf("Force on truck:    %.0f N\\n", F_truck);
fprintf("Force ratio: %.3f (should be 1.0 — 3rd Law!)\\n", abs(F_compact/F_truck));
fprintf("Accel compact: %.2f m/s^2  vs  truck: %.2f m/s^2\\n", a_compact, a_truck);
fprintf("Compact sees %.1fx more acceleration!\\n", a_compact/a_truck);`,
          prose: [
            'The impulse on each vehicle is computed from momentum change: J = mΔv. The 3rd Law says these impulses are equal in magnitude — abs(F_compact/F_truck) prints exactly 1.000.',
            'a_compact = abs(F_compact)/m_compact and a_truck = abs(F_truck)/m_truck apply F = ma to each vehicle separately. Same force, but m_compact = m_truck/2 means a_compact = 2×a_truck.',
            'The factor-of-2 difference in acceleration is why the compact car is more dangerous: same energy of collision, same force, but occupants of the lighter car experience twice the deceleration. This is physics, not just engineering.',
          ],
        },
        {
          cellTitle: 'Rocket equation: Tsiolkovsky',
          type: 'code',
          language: 'matlab',
          code: `% Rocket equation: Δv = v_e * ln(m0/mf) — from Newton's 3rd Law
v_e = 3000;  % m/s exhaust velocity
m_0 = 1000;  % kg initial mass
prop_pct = linspace(0, 90, 300);  % % propellant burned
m_f = m_0 * (1 - prop_pct/100);
delta_v = v_e * log(m_0 ./ m_f);   % log = natural log in MATLAB

figure;
plot(prop_pct, delta_v/1000, 'b-', 'LineWidth', 2);
hold on;
yline(7.8, 'r--', 'Orbital velocity 7.8 km/s', 'LineWidth', 1.5);
xlabel('Propellant burned (% initial mass)');
ylabel('\Deltav (km/s)');
title(sprintf('Tsiolkovsky rocket equation (v_e = %d m/s)', v_e));
grid on;

frac_needed = 1 - exp(-7800/v_e);
fprintf('To reach orbit: burn %.0f%% of initial mass\\n', frac_needed*100);
fprintf('Payload fraction: %.0f%%\\n', (1-frac_needed)*100);`,
          prose: [
            'delta_v = v_e * log(m_0 ./ m_f) applies the Tsiolkovsky equation. Note: log in MATLAB is the natural logarithm (ln), not log base 10. The ./ divides m_0 by each element of the vector m_f.',
            'The logarithmic growth means each additional unit of Δv costs exponentially more propellant. Reaching orbital velocity (7.8 km/s) requires burning ~92% of the initial mass — leaving only ~8% as payload.',
            'yline() marks the orbital velocity target. The intersection of the curve with the dashed line shows exactly what propellant fraction is needed. This is why rockets have multiple stages — drop empty tanks and launch a lighter second stage.',
          ],
        },
        {
          cellTitle: '3rd Law pair analysis',
          type: 'code',
          language: 'matlab',
          code: `% Analyze forces in a book-on-table scenario
m_book = 0.5;  % kg
g = 9.8;

% All forces and their 3rd law partners
fprintf('Book-on-Table: Force Pairs Analysis\\n');
fprintf('=====================================\\n');
fprintf('Object: BOOK\\n');
fprintf('  F1 = Earth pulls book down: F = %.2f N (downward)\\n', m_book*g);
fprintf('  F2 = Table pushes book up:  F = %.2f N (upward)\\n', m_book*g);
fprintf('  Net force on book: %.2f N -> equilibrium\\n\\n', 0);

fprintf('3rd Law PARTNERS (NOT on same FBD):\\n');
fprintf('  Partner of F1: Book pulls Earth up: %.2f N (gravity, upward)\\n', m_book*g);
fprintf('  Partner of F2: Book pushes table down: %.2f N (normal, downward)\\n\\n', m_book*g);

fprintf('COMMON ERROR: F1 and F2 (gravity and normal on book)\\n');
fprintf('are NOT a 3rd law pair!\\n');
fprintf('  - They are different types of force (gravity vs contact)\\n');
fprintf('  - They involve different second objects (Earth vs table)\\n');
fprintf('  - They ARE equal because book is in equilibrium, not because 3rd law\\n');`,
          prose: [
            'The fprintf statements spell out all force relationships explicitly. The book has TWO forces on its FBD (gravity down, normal up) — they are equal because the book is in equilibrium (ΣF = 0), NOT because they are a 3rd law pair.',
            'The 3rd law partners are on DIFFERENT objects: "Earth pulls book" pairs with "book pulls Earth" (both gravitational); "Table pushes book" pairs with "book pushes table" (both normal force).',
            'The common error section explicitly names the confusion students make. F1 and F2 are NOT a 3rd law pair even though they are equal in magnitude: they are different force types from different sources. They happen to be equal because equilibrium forces balance, not because of the 3rd law.',
          ],
        },
        {
          cellTitle: 'Challenge: two-block system',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Two blocks connected by a string on frictionless surface
% Block A (m_A=3 kg) pulled by F=12 N; Block B (m_B=2 kg) behind A
m_A = 3; m_B = 2; F = 12;

% TODO:
% 1. Compute system acceleration: a = F/(m_A + m_B)
% 2. FBD of block B: only T acts → T = m_B * a
% 3. FBD of block A: F - T = m_A * a (verify consistency)
% 4. Print a and T
% 5. Identify the 3rd law pair: A pulls B forward (T) → B pulls A backward (-T)
`,
        },
      ],
    },
  },
};
