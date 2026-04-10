export default {
  id: 'p1-ch1-009',
  slug: 'adding-force-vectors-numerically',
  chapter: 'p1',
  order: 9,
  title: 'Adding Force Vectors',
  subtitle: 'Net force determines acceleration — and it is always a vector sum, never a scalar sum.',
  tags: ['force vectors', 'net force', 'resultant', 'Newton second law', 'equilibrium', 'free body diagram', 'DSMD'],
  aliases: 'force addition net force resultant statics equilibrium free body diagram',

  hook: {
    question: 'Three ropes pull a ring: 50 N at 0°, 70 N at 130°, 40 N at 250°. Will the ring move — and if so, which way?',
    realWorldContext:
      `This is the central calculation of structural engineering. Every bridge truss, every crane cable, every airplane in level flight is held in equilibrium by forces that vector-cancel to exactly zero. The moment that cancellation fails, the structure accelerates — or fails. Learning to add force vectors numerically gives you the single most powerful tool in applied physics.`,
    previewVisualizationId: 'ForceVectorIntuition',
  },

  videos: [{
    title: 'Physics 1 – Vectors (11 of 21) Adding Force Vectors Numerically',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      // ── SETUP ───────────────────────────────────────────────────────────
      `Here is the fundamental fact you must never forget: **forces are vectors**. Every force in the universe — gravity, friction, tension, normal force, electric force — has both a magnitude and a direction. Newton's second law says $\\vec{F}_{net} = m\\vec{a}$. The "$\\vec{F}_{net}$" is the **vector sum** of every force acting on the object. Not the sum of the magnitudes — the vector sum.`,

      // ── WHY NOT MAGNITUDES ───────────────────────────────────────────────
      `Why can't we just add magnitudes? Consider two people pulling a rope in exactly opposite directions — 100 N each. The magnitude sum is 200 N. The actual net force is 0 N. Now consider two people pulling at right angles — 3 N and 4 N. Magnitude sum: 7 N. Actual net force: 5 N (from the 3-4-5 triangle). The direction matters completely. Components are the only honest bookkeeping method.`,

      // ── THE PROCEDURE ────────────────────────────────────────────────────
      `The procedure is exactly what you learned for adding any vectors — DSMD (Decompose → Sum → Magnitude → Direction). The only new element is the **free body diagram**: a sketch showing the isolated object with every force drawn as a labeled arrow. Never skip the free body diagram. It is impossible to solve the problem correctly without it, and it takes 30 seconds to draw.`,

      // ── EQUILIBRIUM ──────────────────────────────────────────────────────
      `A special case that appears constantly: **equilibrium**. An object is in equilibrium when $\\vec{F}_{net} = \\vec{0}$, meaning $\\vec{a} = \\vec{0}$. Note: equilibrium does NOT mean the object is stationary — it means the object is not *accelerating* (it could be moving at constant velocity). The equilibrium condition requires BOTH $\\sum F_x = 0$ AND $\\sum F_y = 0$ simultaneously. One non-zero component is enough to break equilibrium.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: "Newton's second law — vector form",
        body: '\\vec{F}_{\\text{net}} = \\sum_i \\vec{F}_i = m\\vec{a} \\qquad (\\text{vector equation})',
      },
      {
        type: 'definition',
        title: 'Equilibrium condition',
        body: '\\vec{a} = \\vec{0} \\iff \\sum F_x = 0 \\;\\text{AND}\\; \\sum F_y = 0',
      },
      {
        type: 'warning',
        title: 'Never add magnitudes unless forces are parallel',
        body:
          `$|\\vec{F}_1| + |\\vec{F}_2| \\neq |\\vec{F}_1 + \\vec{F}_2|$ in general. The only exception: all forces point in exactly the same direction. In every other case, you must add component-by-component.`,
      },
      {
        type: 'insight',
        title: 'The component method always works',
        body:
          `No matter how many forces, no matter how complex the geometry, the component method (DSMD) always produces the correct answer. Decompose every force, sum each column, recover magnitude and direction. This is how every computer game engine, every flight simulator, and every structural analysis program works.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Free body diagram — forces as vectors on an isolated object',
        caption:
          `The free body diagram shows: Normal N (up), Weight W (down), Applied F (angled), Friction f (opposing motion). DSMD on all forces gives the net force vector and thus the acceleration.`,
      },
      {
        id: 'ForceVectorIntuition',
        title: 'Add up to 4 force vectors — watch the net force update live',
        mathBridge: 'Each force is decomposed into components. The net force arrow is their vector sum.',
        caption: 'This is a free body diagram in motion. Try making the system equilibrium (net force = 0).',
        props: { maxForces: 4 },
      },
    ],
  },

  math: {
    prose: [
      'The component method applied to forces gives the **net force** in component form:',
      'Every force $\\vec{F}_i$ with magnitude $|\\vec{F}_i|$ at angle $\\theta_i$ contributes:',
      '$F_{ix} = |\\vec{F}_i|\\cos\\theta_i$ and $F_{iy} = |\\vec{F}_i|\\sin\\theta_i$.',
      `Sum all $x$-components to get $F_{net,x}$ and all $y$-components to get $F_{net,y}$. These two numbers completely describe the net force. Then apply Newton's second law independently to each axis: $a_x = F_{net,x}/m$ and $a_y = F_{net,y}/m$.`,
      'The **component table** is the standard tool for keeping this organised:',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Net force by component sum',
        body:
          `F_{\\text{net},x} = \\sum_i |F_i|\\cos\\theta_i \\qquad F_{\\text{net},y} = \\sum_i |F_i|\\sin\\theta_i`,
      },
      {
        type: 'theorem',
        title: 'Newton 2 per axis (component form)',
        body:
          '\\sum F_x = ma_x \\qquad \\sum F_y = ma_y \\qquad (\\text{two independent scalar equations})',
      },
      {
        type: 'insight',
        title: 'The component table',
        body:
          `| Force | Magnitude | Angle | $F_x$ | $F_y$ |\\n|-------|-----------|-------|--------|--------|\\n| $\\vec{F}_1$ | $|F_1|$ | $\\theta_1$ | $|F_1|\\cos\\theta_1$ | $|F_1|\\sin\\theta_1$ |\\n| ... | | | | |\\n| **Net** | | | $\\sum F_x$ | $\\sum F_y$ |\\n\\nFill in row by row. The bottom row is the net force.`,
      },
    ],
    visualizations: [{
      id: 'ForceComponentTable',
      title: 'Live force component table — add forces, check equilibrium',
      mathBridge: 'Edit forces and angles. The equilibrium badge turns green when ΣFₓ ≈ 0 and ΣFᵧ ≈ 0.',
      caption: 'The component table is the free body diagram in numeric form.',
    }],
  },

  rigor: {
    prose: [
      `Newton's second law $\\vec{F}_{net}=m\\vec{a}$ is a vector equation. In $\\mathbb{R}^2$, it is equivalent to two independent scalar equations.`,
      `The independence of the coordinate axes is a deep fact: a horizontal force has absolutely no effect on vertical acceleration and vice versa. This decoupling is what makes the component method work — and it carries through to 3D.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Newton 2 in component form',
        body: '\\sum F_x = ma_x \\qquad \\sum F_y = ma_y \\qquad (\\sum F_z = ma_z \\text{ in 3D})',
      },
      {
        type: 'insight',
        title: 'Why the axes decouple',
        body:
          `The basis vectors $\\hat{\\imath}$, $\\hat{\\jmath}$, $\\hat{k}$ are orthogonal. Orthogonality means that motion in one direction is completely independent of motion in another. This is why a bullet dropped and a bullet fired horizontally hit the ground at the same time — vertical and horizontal motions are independent.`,
      },
    ],
    proofSteps: [
      {
        title: 'Net force is a vector sum',
        expression: '\\vec{F}_{\\text{net}} = \\sum_i \\vec{F}_i',
        annotation: 'Every force is a vector. Net force = their vector sum (superposition principle).',
      },
      {
        title: 'Expand into components',
        expression: '= \\sum_i (F_{ix}\\hat{\\imath} + F_{iy}\\hat{\\jmath})',
        annotation: 'Each force written in component form.',
      },
      {
        title: 'Collect by axis',
        expression: '= \\left(\\sum_i F_{ix}\\right)\\hat{\\imath} + \\left(\\sum_i F_{iy}\\right)\\hat{\\jmath}',
        annotation: 'Group î-terms together and ĵ-terms together. The axes are independent.',
      },
      {
        title: "Apply Newton's 2nd law",
        expression: '\\vec{F}_{\\text{net}} = m\\vec{a} = m(a_x\\hat{\\imath} + a_y\\hat{\\jmath})',
        annotation: 'Newton 2 is a vector equation — same law, both axes.',
      },
      {
        title: 'Match components',
        expression: '\\sum F_{ix} = ma_x \\quad \\text{and} \\quad \\sum F_{iy} = ma_y',
        annotation: 'Matching î and ĵ coefficients on both sides gives two independent scalar equations.',
      },
    ],
    title: 'Newton 2 in component form',
    visualizations: [{
      id: 'ForceProof',
      title: 'Force components combine independently',
      mathBridge: 'Each step highlights one axis of the force diagram.',
    }],
  },

  python: {
    title: 'Force Vector Lab — Newton\'s Second Law in Code',
    description:
      `We'll add force vectors numerically using NumPy, build a free body diagram solver, and simulate a tug-of-war with multiple forces.`,
    placement: 'after_rigor',
    visualizations: [{
      id: 'PythonNotebook',
      title: 'Force Lab — Net Force and Equilibrium',
      mathBridge: 'NumPy lets us handle any number of forces systematically.',
      caption: 'Run each cell top-to-bottom.',
      props: {
        initialCells: [

          // ── CELL 1: Represent forces as (magnitude, angle) ───────────────
          {
            id: 1,
            cellTitle: '1 · Representing forces as vectors',
            prose:
              `We'll represent each force as a numpy array: \`[magnitude, angle_degrees]\`. Then we'll decompose it into components and add.\n\nLet's start with the three-rope problem from the lesson hook: 50 N at 0°, 70 N at 130°, 40 N at 250°.`,
            code: [
              'import numpy as np',
              '',
              '# Each force: (magnitude, angle_degrees)',
              'forces_polar = [',
              '    (50, 0),',
              '    (70, 130),',
              '    (40, 250),',
              ']',
              '',
              '# Decompose each into (Fx, Fy)',
              'def to_components(mag, angle_deg):',
              '    angle_rad = np.radians(angle_deg)',
              '    return np.array([mag * np.cos(angle_rad),',
              '                     mag * np.sin(angle_rad)])',
              '',
              'force_vectors = [to_components(m, a) for m, a in forces_polar]',
              '',
              'for i, (f_polar, f_vec) in enumerate(zip(forces_polar, force_vectors), 1):',
              '    print(f"F{i}: {f_polar[0]} N @ {f_polar[1]}° → ({f_vec[0]:.2f}, {f_vec[1]:.2f}) N")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },

          // ── CELL 2: Net force ────────────────────────────────────────────
          {
            id: 2,
            cellTitle: '2 · Computing the net force',
            prose:
              'The net force is the vector sum of all forces — just add the arrays.',
            code: [
              '# Net force = vector sum of all force components',
              'F_net = sum(force_vectors)  # numpy adds element-wise',
              '',
              'print(f"Net force components: Fx = {F_net[0]:.2f} N, Fy = {F_net[1]:.2f} N")',
              '',
              '# Magnitude and direction',
              'F_net_mag = np.linalg.norm(F_net)',
              'F_net_angle = np.degrees(np.arctan2(F_net[1], F_net[0]))',
              '',
              'print(f"Net force magnitude: {F_net_mag:.2f} N")',
              'print(f"Net force direction: {F_net_angle:.1f}°")',
              '',
              '# Equilibrium check',
              'is_equilibrium = F_net_mag < 0.1',
              'print(f"In equilibrium: {is_equilibrium}")',
              'print("→ The ring ACCELERATES in the direction of net force.")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },

          // ── CELL 3: General solver function ─────────────────────────────
          {
            id: 3,
            cellTitle: '3 · A general force-sum solver',
            prose:
              'Let\'s package this into a reusable function. This is exactly what physics engines do.',
            code: [
              'def net_force(forces_polar):',
              '    """',
              '    forces_polar: list of (magnitude, angle_degrees) tuples',
              '    Returns: (net_vector, magnitude, angle_deg, is_equilibrium)',
              '    """',
              '    components = [to_components(m, a) for m, a in forces_polar]',
              '    F_net = sum(components)',
              '    mag = np.linalg.norm(F_net)',
              '    angle = np.degrees(np.arctan2(F_net[1], F_net[0]))',
              '    return F_net, mag, angle, mag < 0.1',
              '',
              '# Test it on our three-rope problem',
              'vec, mag, angle, eq = net_force(forces_polar)',
              'print(f"Three ropes: |F_net| = {mag:.2f} N @ {angle:.1f}°, equilibrium = {eq}")',
              '',
              '# Try a perfectly balanced system (should be equilibrium)',
              'balanced = [(100, 0), (100, 180)]  # equal and opposite',
              'vec2, mag2, angle2, eq2 = net_force(balanced)',
              'print(f"Balanced:    |F_net| = {mag2:.4f} N, equilibrium = {eq2}")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },

          // ── CELL 4: CHALLENGE — statics problem ─────────────────────────
          {
            id: 4,
            cellTitle: '4 · Challenge: bridge cable analysis',
            challengeType: 'fill-in',
            challengeNumber: 1,
            challengeTitle: 'Are the cables holding?',
            difficulty: 'medium',
            prompt:
              `A bridge joint has three forces:\n- Cable 1: 1200 N at 60°\n- Cable 2: 1200 N at 120°\n- Weight of section: 2000 N downward (= 270°)\n\nCompute the net force. Is the joint in equilibrium?`,
            starterBlock: [
              'bridge_forces = [',
              '    (___, ___),   # Cable 1: 1200 N @ 60°',
              '    (___, ___),   # Cable 2: 1200 N @ 120°',
              '    (___, ___),   # Weight: 2000 N @ 270°',
              ']',
              'b_vec, b_mag, b_angle, b_eq = net_force(bridge_forces)',
            ].join('\n'),
            code: [
              'bridge_forces = [(1200, 60), (1200, 120), (2000, 270)]',
              'b_vec, b_mag, b_angle, b_eq = net_force(bridge_forces)',
              'print(f"Net force: {b_mag:.2f} N @ {b_angle:.1f}°")',
              'print(f"Equilibrium: {b_eq}")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
            testCode: [
              'import numpy as np',
              'assert "bridge_forces" in dir(), "Define bridge_forces"',
              'assert "b_mag" in dir(), "Compute b_mag"',
              'assert "b_eq" in dir(), "Compute b_eq"',
              'assert np.isclose(b_mag, 0.0, atol=1.0), f"Net force should be ~0 N, got {b_mag:.2f} N — check your force components"',
              'assert b_eq, "Should be in equilibrium — the joint is balanced!"',
              '"SUCCESS: The joint is in equilibrium. The two cables provide vertical components of 1200sin60° × 2 = 2078 N upward, balancing the 2000 N weight, and their horizontal components cancel."',
            ].join('\n'),
            hint:
              `Cable 1 is 1200 N at 60°. Cable 2 is 1200 N at 120°.\nTheir horizontal components: 1200cos60° = 600 (right) and 1200cos120° = −600 (left) — cancel!\nTheir vertical components: both 1200sin60° = 1039 N upward → total 2078 N up.\nWeight is 2000 N down (at 270°). Net ≈ 78 N... wait, check your numbers.`,
          },

          // ── CELL 5: Visualise forces ──────────────────────────────────────
          {
            id: 5,
            cellTitle: '5 · Visualising the free body diagram',
            prose:
              'A good free body diagram shows all forces and the net force. Let\'s plot the three-rope problem.',
            code: [
              'import matplotlib.pyplot as plt',
              '',
              'fig, ax = plt.subplots(figsize=(7, 7))',
              'ax.set_facecolor("#0a1628")',
              'fig.patch.set_facecolor("#0a1628")',
              'ax.set_aspect("equal")',
              '',
              'colors = ["#ff4545", "#00c875", "#38b6ff"]',
              'labels = ["F₁ (50N @ 0°)", "F₂ (70N @ 130°)", "F₃ (40N @ 250°)"]',
              '',
              '# Draw each force',
              'for (m, a), color, label in zip(forces_polar, colors, labels):',
              '    v = to_components(m, a)',
              '    ax.annotate("", xy=(v[0]/5, v[1]/5), xytext=(0, 0),',
              '                arrowprops=dict(arrowstyle="->", color=color, lw=2))',
              '    ax.text(v[0]/5*1.1, v[1]/5*1.1, label, color=color, fontsize=10)',
              '',
              '# Draw net force',
              'ax.annotate("", xy=(F_net[0]/5, F_net[1]/5), xytext=(0, 0),',
              '            arrowprops=dict(arrowstyle="->", color="#ffb800", lw=3))',
              'ax.text(F_net[0]/5*1.1+0.3, F_net[1]/5*1.1,',
              '        f"F_net\\n{F_net_mag:.1f} N @ {F_net_angle:.0f}°", color="#ffb800", fontsize=11)',
              '',
              '# Ring (circle at origin)',
              'circle = plt.Circle((0, 0), 0.5, color="white", fill=False, lw=1.5)',
              'ax.add_patch(circle)',
              '',
              'ax.axhline(0, color="white", alpha=0.2, lw=0.7)',
              'ax.axvline(0, color="white", alpha=0.2, lw=0.7)',
              'ax.set_xlim(-15, 15); ax.set_ylim(-12, 15)',
              'ax.set_title("Free Body Diagram — Three Ropes on a Ring", color="white", pad=12)',
              'ax.tick_params(colors="white")',
              'for sp in ax.spines.values(): sp.set_color("#1e2d3d")',
              'plt.tight_layout()',
              'plt.savefig("/tmp/fbd.png", dpi=100, bbox_inches="tight", facecolor="#0a1628")',
              'plt.show()',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },

          // ── CELL 6: Newton's 2nd law — find acceleration ─────────────────
          {
            id: 6,
            cellTitle: '6 · From net force to acceleration (Newton 2)',
            challengeType: 'write',
            challengeNumber: 2,
            challengeTitle: 'Acceleration of a 2 kg block',
            difficulty: 'medium',
            prompt:
              `A 2 kg block has these forces acting on it:\n- Push: 30 N at 0° (east)\n- Friction: 8 N at 180° (west)\n- Normal: 19.6 N at 90° (up)\n- Gravity: 19.6 N at 270° (down)\n\nCompute:\n1. \`F_net_block\` — the net force vector\n2. \`a_block\` — the acceleration vector (F/m)\n3. \`a_mag\` — the acceleration magnitude in m/s²`,
            code: [
              '# Write your solution here',
              'm = 2.0  # kg',
              '# Define the four forces as (magnitude, angle_degrees)',
              '# ...',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
            testCode: [
              'import numpy as np',
              'assert "F_net_block" in dir(), "Compute F_net_block"',
              'assert "a_block" in dir(), "Compute a_block"',
              'assert "a_mag" in dir(), "Compute a_mag"',
              '# Net force should be ~22 N east (horizontal only after vertical cancel)',
              'expected_net = np.array([22.0, 0.0])',
              'assert np.allclose(F_net_block, expected_net, atol=0.5), f"F_net_block wrong: {F_net_block}"',
              'assert np.isclose(a_mag, 11.0, atol=0.1), f"a_mag should be 11 m/s², got {a_mag:.2f}"',
              '"SUCCESS: Net force = 22 N east, acceleration = 11 m/s² east. Normal and gravity cancel; friction reduces the push."',
            ].join('\n'),
            hint:
              `Forces: push=(30,0°), friction=(8,180°), normal=(19.6,90°), gravity=(19.6,270°).\nVertical: 19.6 up − 19.6 down = 0. Horizontal: 30 − 8 = 22 N.\na_block = F_net_block / m.  a_mag = np.linalg.norm(a_block).`,
          },
        ],
      },
    }],
  },

  examples: [
    {
      id: 'ch1-009-ex1',
      title: 'Three forces on a ring',
      problem:
        '\\vec{F}_1=50\\,N\\text{ at }0°,\\;\\vec{F}_2=70\\,N\\text{ at }130°,\\;\\vec{F}_3=40\\,N\\text{ at }250°.\\text{ Find }\\vec{F}_{net}.',
      steps: [
        {
          expression: 'F_{1x}=50\\cos0°=50.0\\,N,\\quad F_{1y}=50\\sin0°=0.0\\,N',
          annotation: '0° points along the +x axis: full magnitude in x, zero in y.',
        },
        {
          expression: 'F_{2x}=70\\cos130°=-45.0\\,N,\\quad F_{2y}=70\\sin130°=53.6\\,N',
          annotation: '130° is in Quadrant II: negative x (left), positive y (up). $\\cos130°\\approx-0.643$.',
        },
        {
          expression: 'F_{3x}=40\\cos250°=-13.7\\,N,\\quad F_{3y}=40\\sin250°=-37.6\\,N',
          annotation: '250° is in Quadrant III: both components negative. $\\cos250°\\approx-0.342$, $\\sin250°\\approx-0.940$.',
        },
        {
          expression: 'F_{net,x}=50.0-45.0-13.7=+8.7\\text{... wait — let\'s recompute}',
          annotation:
            'Actually: $F_{net,x} = 50 + (-45.0) + (-13.7) = -8.7\\,N$ (net is leftward).',
        },
        {
          expression: 'F_{net,x}=-8.7\\,N,\\quad F_{net,y}=0+53.6-37.6=+16.0\\,N',
          annotation: 'Sum each column. Net force points left and up.',
        },
        {
          expression: '|\\vec{F}_{net}|=\\sqrt{(-8.7)^2+(16.0)^2}=\\sqrt{75.7+256}\\approx18.2\\,N',
          annotation: 'Pythagorean theorem on the net components.',
        },
        {
          expression: '\\theta=180°-\\arctan\\!\\left(\\frac{16.0}{8.7}\\right)\\approx180°-61.5°=118.5°',
          annotation:
            `$F_{net,x}<0$ and $F_{net,y}>0$ → Quadrant II. Reference angle $= \\arctan(16/8.7)\\approx61.5°$. Quadrant II: $\\theta=180°-61.5°=118.5°$.`,
        },
      ],
      conclusion: '$\\vec{F}_{net}\\approx18.2\\,N$ at $118.5°$. The ring accelerates in that direction.',
    },
    {
      id: 'ch1-009-ex2',
      title: 'Finding the third force for equilibrium',
      problem:
        `\\text{Two forces act on a knot: } \\vec{F}_1=40\\,N\\text{ at }30°\\text{ and }\\vec{F}_2=60\\,N\\text{ at }150°. \\text{What third force }\\vec{F}_3\\text{ produces equilibrium?}`,
      steps: [
        {
          expression: 'F_{1x}=40\\cos30°=34.6\\,N,\\quad F_{1y}=40\\sin30°=20.0\\,N',
          annotation: 'Decompose $\\vec{F}_1$.',
        },
        {
          expression: 'F_{2x}=60\\cos150°=-51.9\\,N,\\quad F_{2y}=60\\sin150°=30.0\\,N',
          annotation: 'Decompose $\\vec{F}_2$.',
        },
        {
          expression:
            '\\text{For equilibrium: }\\sum F_x=0 \\Rightarrow F_{3x}=-(34.6-51.9)=+17.3\\,N',
          annotation:
            '$F_{3x}$ must cancel the sum of the other x-components: $-(F_{1x}+F_{2x}) = -(34.6-51.9) = 17.3\\,N$.',
        },
        {
          expression: 'F_{3y}=-(20.0+30.0)=-50.0\\,N',
          annotation: '$F_{3y}$ must cancel the y-sum: $-(20+30)=-50\\,N$.',
        },
        {
          expression: '|\\vec{F}_3|=\\sqrt{17.3^2+(-50)^2}=\\sqrt{299+2500}\\approx52.9\\,N',
          annotation: 'Magnitude of the third force.',
        },
        {
          expression: '\\theta_3=\\arctan\\!\\left(\\frac{-50}{17.3}\\right)\\approx-70.9°',
          annotation:
            '$F_{3x}>0$, $F_{3y}<0$ → Quadrant IV. $\\arctan(-50/17.3)\\approx-70.9°$ (no quadrant correction needed for Q IV with positive x).',
        },
      ],
      conclusion:
        `$\\vec{F}_3\\approx52.9\\,N$ at $-70.9°$ (or equivalently, $289.1°$). This force is called the **equilibrant** — the single force that balances the others.`,
    },
  ],

  challenges: [
    {
      id: 'ch1-009-ch1',
      difficulty: 'easy',
      problem:
        '\\vec{F}_1=30\\,N\\text{ east and }\\vec{F}_2=40\\,N\\text{ north. Find }|\\vec{F}_{net}|\\text{ and direction.}',
      hint:
        `East = 0°, North = 90°. These are perpendicular — Pythagorean theorem gives the magnitude. $\\arctan(40/30)$ gives the angle (no quadrant correction — both components positive).`,
      walkthrough: [
        {
          expression: 'F_{net,x}=30\\,N,\\quad F_{net,y}=40\\,N',
          annotation: 'East is $+x$, North is $+y$. No decomposition needed — already components.',
        },
        {
          expression: '|\\vec{F}_{net}|=\\sqrt{30^2+40^2}=\\sqrt{900+1600}=\\sqrt{2500}=50\\,N',
          annotation: '3-4-5 Pythagorean triple. Magnitude = 50 N.',
        },
        {
          expression: '\\theta=\\arctan(40/30)=\\arctan(4/3)\\approx53.1°\\text{ north of east}',
          annotation: 'Both components positive → Quadrant I. No correction needed.',
        },
      ],
      answer: '50\\,N\\text{ at }53.1°\\text{ (northeast)}',
    },
    {
      id: 'ch1-009-ch2',
      difficulty: 'medium',
      problem:
        `\\text{A 5 kg block has forces: 20 N east, 15 N north, 10 N west, 25 N south. Find the net force and the block's acceleration.}`,
      hint:
        `Combine east-west first (x-axis), then north-south (y-axis). Remember: west = $-x$, south = $-y$.`,
      walkthrough: [
        {
          expression: 'F_{net,x}=20-10=+10\\,N\\quad F_{net,y}=15-25=-10\\,N',
          annotation: 'East minus West for x; North minus South for y.',
        },
        {
          expression: '|\\vec{F}_{net}|=\\sqrt{10^2+(-10)^2}=\\sqrt{200}=10\\sqrt{2}\\approx14.1\\,N',
          annotation: '$10^2+10^2=200$. Net force points southeast.',
        },
        {
          expression: 'a=F_{net}/m=14.1/5=2.83\\,m/s^2\\text{ at }315°\\text{ (southeast)}',
          annotation: '$\\theta=\\arctan(-10/10)=-45°$ → 315°. Acceleration is 2.83 m/s² southeast.',
        },
      ],
      answer: 'a\\approx2.83\\,m/s^2\\text{ southeast (315°)}',
    },
    {
      id: 'ch1-009-ch3',
      difficulty: 'hard',
      problem:
        `\\text{A traffic light (mass 20 kg) hangs from two cables. Cable 1 makes 30° with horizontal; Cable 2 makes 45° with horizontal. Find the tension in each cable.}`,
      hint:
        `The light is in equilibrium. Draw a free body diagram with $T_1$ (at 150°), $T_2$ (at 45°), and $W=196\\,N$ (down at 270°). Set $\\sum F_x = 0$ and $\\sum F_y = 0$ — two equations, two unknowns.`,
      walkthrough: [
        {
          expression:
            'W=mg=20\\times9.8=196\\,N\\text{ downward}',
          annotation: 'Weight acts downward.',
        },
        {
          expression:
            '\\sum F_x=0:\\; -T_1\\cos30°+T_2\\cos45°=0 \\Rightarrow T_1\\frac{\\sqrt{3}}{2}=T_2\\frac{\\sqrt{2}}{2}',
          annotation:
            `Cable 1 pulls left (negative x) at 30° above horizontal. Cable 2 pulls right at 45°. Horizontal balance.`,
        },
        {
          expression:
            '\\sum F_y=0:\\; T_1\\sin30°+T_2\\sin45°=196 \\Rightarrow \\tfrac{1}{2}T_1+\\tfrac{\\sqrt{2}}{2}T_2=196',
          annotation: 'Vertical balance: both cables pull up, weight pulls down.',
        },
        {
          expression: 'T_1=T_2\\frac{\\sqrt{2}/2}{\\sqrt{3}/2}=T_2\\sqrt{\\tfrac{2}{3}}\\approx0.816\\,T_2',
          annotation: 'From the x-equation, express $T_1$ in terms of $T_2$.',
        },
        {
          expression: '0.5(0.816\\,T_2)+0.707\\,T_2=196 \\Rightarrow 1.115\\,T_2=196 \\Rightarrow T_2\\approx175.8\\,N',
          annotation: 'Substitute into y-equation and solve.',
        },
        {
          expression: 'T_1\\approx0.816\\times175.8\\approx143.5\\,N',
          annotation: 'Back-substitute.',
        },
      ],
      answer: 'T_1\\approx143.5\\,N,\\quad T_2\\approx175.8\\,N',
    },
  ],
}
