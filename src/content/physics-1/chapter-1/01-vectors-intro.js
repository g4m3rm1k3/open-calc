export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-001',
  slug: 'what-is-a-vector',
  chapter: 'p1',
  order: 1,
  title: 'What Is a Vector?',
  subtitle: 'The first tool of physics: quantities that carry both size and direction.',
  tags: ['vector', 'scalar', 'magnitude', 'direction', 'arrow notation', 'components', 'unit vectors'],
  aliases: 'vectors intro displacement velocity force directed quantity magnitude direction components',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: 'Your GPS says you are 5 miles from home. Is that enough to get you there?',
    realWorldContext:
      `Of course not — you also need to know *which direction*. This single observation unlocks one of the most important ideas in all of physics. Some quantities — temperature, mass, time — are completely described by a single number. Others — force, velocity, acceleration — are completely *wrong* unless you also say which way. The mathematical object that carries both a size and a direction is called a **vector**, and from this lesson forward, almost everything you study in physics will be described by one.`,
    previewVisualizationId: 'VectorArrowIntuition',
  },

  // ── Videos ──────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (1 of 21) What Is A Vector?',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (2 of 21) Vector Notation',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      // ── WHY ─────────────────────────────────────────────────────────────
      `Let's start with a scenario. You tell your friend "I pushed the box with 50 newtons." Your friend asks, "Which way?" — and you shrug. That missing direction is the whole reason vectors exist. In the real world, a force that pushes a box to the right is completely different from a force that pushes it upward, even if both have the same strength. Physics cannot work without tracking direction. **Vectors are how we do it.**`,

      // ── SCALAR vs VECTOR (story) ─────────────────────────────────────────
      `Quantities that need only a number to describe them completely are called **scalars**. Temperature is $72°F$ — that's it. Mass is $5\\,kg$. Time is $10\\,s$. A scalar is just a number with a unit. No arrow needed. But now think about *velocity*. "The car was moving at 60 mph" tells us the speed. But physics needs to know: 60 mph *north* or 60 mph *east*? Those are physically different — one takes you to the airport; the other into the lake. Velocity is a **vector**: it has a magnitude (speed, 60 mph) and a direction (north). So is force, acceleration, displacement, momentum, and electric field. Almost every interesting quantity in physics is a vector.`,

      // ── THE ARROW ───────────────────────────────────────────────────────
      `We draw vectors as arrows. The **length** of the arrow represents the **magnitude** — the size of the quantity. A longer arrow means a bigger force, a faster velocity. The **direction** the arrow points represents the direction of the quantity. Two arrows that have the same length and point the same way are equal vectors, no matter where they are drawn on the page — this is called the **free vector rule**. You can pick up any vector and slide it anywhere without changing what it is.`,

      // ── COMPONENTS PREVIEW ──────────────────────────────────────────────
      `Once we move beyond simple "north" or "east" directions, we need a systematic way to describe any direction in the plane. The trick: break the vector into two parts — how much it points in the $x$-direction and how much in the $y$-direction. These parts are called **components**. Every vector in 2D is completely described by just two numbers: its $x$-component and its $y$-component. This converts the geometry of arrows into the algebra of numbers, and that's where the real power comes from.`,

      // ── BIG PICTURE ─────────────────────────────────────────────────────
      `This lesson builds the foundation for everything in Physics 1. Newton's laws, projectile motion, energy, momentum — all of it is written in the language of vectors. The students who struggle with physics later are almost always the ones who tried to skip this chapter. Take your time here. The reward is that every later topic feels like a natural extension of what you learn now.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Scalar',
        body: 'A quantity with **magnitude only**. Fully described by a single number and a unit.\\n\\nExamples: mass $m$ (kg), time $t$ (s), temperature $T$ (°C), speed $v$ (m/s), energy $E$ (J).',
      },
      {
        type: 'definition',
        title: 'Vector',
        body: 'A quantity with both **magnitude** and **direction**. Written with an arrow: $\\vec{A}$, or in bold: $\\mathbf{A}$.\\n\\nExamples: displacement $\\vec{d}$, velocity $\\vec{v}$, acceleration $\\vec{a}$, force $\\vec{F}$, momentum $\\vec{p}$.',
      },
      {
        type: 'insight',
        title: 'The free-vector rule',
        body:
          `A vector has no fixed location in space. You may slide (translate) a vector anywhere without changing it — only length and direction matter. This is why you can draw force arrows wherever they're clearest on a diagram.`,
      },
      {
        type: 'insight',
        title: 'Speed vs velocity — the classic confusion',
        body:
          `Speed is a scalar (how fast). Velocity is a vector (how fast AND which way). A car going around a circular track at constant speed is still *accelerating* because its direction changes every instant — meaning its velocity vector changes. This distinction will become critical in Chapter 3 (circular motion).`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'The anatomy of a vector',
        caption:
          `A vector has two parts: magnitude |A| (the arrow length) and direction θ (the angle from +x). The right triangle shows how magnitude and angle together determine the x- and y-components. A scalar has only the first — no arrow, no direction.`,
      },
      {
        id: 'VectorArrowIntuition',
        title: 'Drag the arrow — feel magnitude and direction',
        mathBridge:
          `The arrow length represents magnitude $|\\vec{A}|$; the angle it makes with the positive $x$-axis is the direction $\\theta$.`,
        caption:
          `Click and drag the arrowhead. Watch magnitude and angle update live. Then drag the tail — the vector does not change (free vector rule).`,
        props: { interactive: true, showComponents: false },
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      // ── Two equivalent descriptions ───────────────────────────────────
      `Any 2D vector $\\vec{A}$ can be described completely in two equivalent ways — and you need to be comfortable switching between them. Each form is the right tool for a different situation.`,

      `**Form 1 — Magnitude & angle:** Give $|\\vec{A}|$ (a non-negative number) and $\\theta$ (the angle from the positive $x$-axis, measured counterclockwise). Written as $\\vec{A} = |\\vec{A}|\\angle\\theta$. This form is natural when you have a physical picture — "10 N at 30° above horizontal."`,

      `**Form 2 — Component form:** Break $\\vec{A}$ into its horizontal and vertical parts using trigonometry. The horizontal part is $A_x = |\\vec{A}|\\cos\\theta$ and the vertical part is $A_y = |\\vec{A}|\\sin\\theta$. Then write $\\vec{A} = A_x\\,\\hat{\\imath} + A_y\\,\\hat{\\jmath}$, where $\\hat{\\imath}$ (i-hat) is a unit vector pointing in the $+x$ direction and $\\hat{\\jmath}$ (j-hat) points in $+y$. This form is natural for calculation — every operation reduces to ordinary arithmetic.`,

      'The two conversions you must memorise:',

      `**Polar → Components** (magnitude+angle to $x,y$): apply trig. Think of the right triangle: the vector is the hypotenuse, $A_x$ is the adjacent side, $A_y$ is the opposite side.`,

      `**Components → Polar** (recover magnitude+angle from $x,y$): use Pythagoras for magnitude; use $\\arctan$ for angle, then **check the quadrant manually**.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Polar → Components',
        body:
          'A_x = |\\vec{A}|\\cos\\theta \\quad\\quad A_y = |\\vec{A}|\\sin\\theta',
      },
      {
        type: 'theorem',
        title: 'Components → Polar',
        body:
          '|\\vec{A}| = \\sqrt{A_x^2 + A_y^2} \\quad\\quad \\theta = \\arctan\\!\\left(\\frac{A_y}{A_x}\\right)\\;(\\text{check quadrant!})',
      },
      {
        type: 'warning',
        title: 'The quadrant trap — the #1 mistake',
        body:
          `Your calculator's $\\arctan$ always returns an angle between $-90°$ and $+90°$ (Quadrants I and IV only). If $A_x < 0$, add $180°$ to shift into Quadrant II or III. If $A_x > 0$ and $A_y < 0$, the angle is negative — that's Quadrant IV, which is fine. The fix: **always sketch the vector first**, confirm the quadrant visually, then correct the arctan.`,
      },
      {
        type: 'definition',
        title: 'Unit vectors î and ĵ',
        body:
          `\\hat{\\imath} = (1,\\,0)$ — points in the $+x$ direction, magnitude 1. \\hat{\\jmath} = (0,\\,1)$ — points in the $+y$ direction, magnitude 1. In 3D, $\\hat{k}$ points in $+z$. Unit vectors have no units — they are pure direction indicators.`,
      },
      {
        type: 'mnemonic',
        title: 'SOH-CAH-TOA (the bridge between forms)',
        body:
          `For angle $\\theta$ and hypotenuse $r = |\\vec{A}|$:\\n$\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} = \\frac{A_y}{r}$ → $A_y = r\\sin\\theta$\\n$\\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}} = \\frac{A_x}{r}$ → $A_x = r\\cos\\theta$\\n$\\tan\\theta = \\frac{\\text{opp}}{\\text{adj}} = \\frac{A_y}{A_x}$ → $\\theta = \\arctan(A_y/A_x)$`,
      },
    ],
    visualizations: [
      {
        id: 'VectorComponentDecomposer',
        title: 'From arrow to components — and back',
        mathBridge:
          `Drag the vector. Watch $A_x$, $A_y$, $|\\vec{A}|$, and $\\theta$ update. Toggle "show trig" to see the right triangle that produces the components.`,
        caption: 'Every vector hides a right triangle. Components are just the legs of that triangle.',
        props: { showTrigOverlay: true, showUnitVectors: true },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `Formally, a vector in $\\mathbb{R}^2$ is an **ordered pair** $(A_x, A_y)$ of real numbers. The set $\\mathbb{R}^2$ with vector addition and scalar multiplication forms a **vector space** — a structure we will encounter again in Linear Algebra, where it generalises to $n$ dimensions.`,

      `Two vectors are equal if and only if every component matches: $(A_x, A_y) = (B_x, B_y)$ iff $A_x = B_x$ AND $A_y = B_y$. Position in space is completely irrelevant.`,

      `The **zero vector** $\\vec{0} = (0, 0)$ has magnitude zero. Critically, it has **no defined direction** — writing $\\theta = 0°$ for the zero vector is wrong. Direction is only meaningful for non-zero vectors.`,

      `The **magnitude** (also called the norm or Euclidean length) of $\\vec{A} = (A_x, A_y)$ is $|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}$, which is just the Pythagorean theorem applied to the right triangle formed by the components. In $\\mathbb{R}^3$: $|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2}$.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Formal equality of vectors',
        body:
          `\\vec{A} = \\vec{B} \\iff A_x = B_x \\text{ and } A_y = B_y \\quad (\\text{position in space is irrelevant})`,
      },
      {
        type: 'definition',
        title: 'Magnitude (Euclidean norm)',
        body:
          '|\\vec{A}| = \\|\\vec{A}\\|_2 = \\sqrt{A_x^2 + A_y^2} \\quad (\\text{always} \\ge 0)',
      },
      {
        type: 'warning',
        title: 'The zero vector has no direction',
        body:
          `$|\\vec{0}| = 0$ and $\\theta$ is undefined. Writing $\\theta = 0°$ for the zero vector is an error — there is no direction to point.`,
      },
      {
        type: 'insight',
        title: 'Why component form beats magnitude-angle for calculation',
        body:
          `Magnitude–angle is intuitive but algebraically awkward. Component form reduces every vector operation — addition, dot product, cross product — to ordinary arithmetic on numbers. The entire machinery of linear algebra and computer graphics is built on component form. Every physics simulation on a computer stores vectors as component arrays.`,
      },
      {
        type: 'insight',
        title: 'Connection to Linear Algebra (preview)',
        body:
          `In Linear Algebra you'll generalise: a vector can live in $\\mathbb{R}^n$ for any $n$. A 3D force vector has components $(F_x, F_y, F_z)$. The rules you learn here — addition, scalar multiplication, dot product — all extend directly to $n$ dimensions without any new ideas.`,
      },
    ],
    visualizationId: 'VectorEqualityProof',
    proofSteps: [
      {
        title: 'Define both vectors',
        expression: '\\vec{A} = (A_x, A_y), \\quad \\vec{B} = (B_x, B_y)',
        annotation: 'Write each vector as an ordered pair of components. Position on the page is irrelevant.',
      },
      {
        title: 'Assert equality',
        expression: '\\vec{A} = \\vec{B}',
        annotation: 'We want to know what "equal" means for vectors. Start by assuming it and unpacking the consequences.',
      },
      {
        title: 'Expand in basis vectors',
        expression: 'A_x\\hat{\\imath} + A_y\\hat{\\jmath} = B_x\\hat{\\imath} + B_y\\hat{\\jmath}',
        annotation: 'Replace each vector with its unit-vector expansion. î and ĵ are the basis vectors of R².',
      },
      {
        title: 'Collect to zero',
        expression: '(A_x - B_x)\\hat{\\imath} + (A_y - B_y)\\hat{\\jmath} = \\vec{0}',
        annotation: 'Subtract one side from the other. If the sum is zero, each coefficient must be zero independently.',
      },
      {
        title: 'Linear independence',
        expression: 'A_x - B_x = 0 \\quad \\text{and} \\quad A_y - B_y = 0',
        annotation: 'Because î and ĵ are linearly independent, each coefficient must vanish separately.',
      },
      {
        title: 'Conclusion',
        expression: '\\therefore A_x = B_x \\quad \\text{and} \\quad A_y = B_y',
        annotation: 'Two vectors are equal if and only if every component matches — regardless of where the arrows are drawn.',
      },
    ],
    title: 'Proof: vector equality is component-by-component',
    visualizations: [
      {
        id: 'VectorEqualityProof',
        title: 'Step through the equality proof',
        mathBridge:
          `Watch the geometric picture update as each algebraic step is applied. Step 4 highlights why linear independence of $\\hat{\\imath}$, $\\hat{\\jmath}$ forces each coefficient to zero.`,
        caption: 'Geometry and algebra tell the same story — one step at a time.',
      },
    ],
  },

  // ── Python Notebook ──────────────────────────────────────────────────────
  // Embedded as a PythonNotebook visualization in the math section
  python: {
    title: 'Vectors in Python — from first principles to real physics',
    description:
      `We will represent vectors as NumPy arrays, compute magnitudes and angles, and build up to a real-world application: tracking a plane in flight.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Vector Lab 1 — Vectors with NumPy',
        mathBridge: 'Python treats vectors exactly like physics does: as arrays of numbers. NumPy makes the arithmetic clean.',
        caption: 'Run each cell top-to-bottom. Variables carry between cells.',
        props: {
          initialCells: [

            // ── CELL 1: What is a vector in Python? ─────────────────────────
            {
              id: 1,
              cellTitle: '1 · What a vector looks like in Python',
              prose:
                `In physics we write $\\vec{v} = 3\\hat{\\imath} + 4\\hat{\\jmath}$ to mean "3 units east, 4 units north."\n\nIn Python (using NumPy) we write \`v = np.array([3, 4])\`. The first element is the x-component, the second is the y-component.\n\nThat's it — a vector is just a list of components. All the physics follows from this.`,
              code: [
                'import numpy as np',
                '',
                '# A 2D velocity vector: 3 m/s east, 4 m/s north',
                'v = np.array([3.0, 4.0])',
                '',
                'print(f"Vector v = {v}")',
                'print(f"x-component: {v[0]} m/s")',
                'print(f"y-component: {v[1]} m/s")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },

            // ── CELL 2: Magnitude ────────────────────────────────────────────
            {
              id: 2,
              cellTitle: '2 · Computing the magnitude (speed)',
              prose:
                `The magnitude $|\\vec{v}| = \\sqrt{v_x^2 + v_y^2}$ is just the Pythagorean theorem.\n\nFor our vector $\\vec{v} = (3, 4)$: magnitude $= \\sqrt{9 + 16} = \\sqrt{25} = 5$ m/s.\n\nNumPy gives us \`np.linalg.norm()\` for this — it works in 2D, 3D, or any dimension.`,
              code: [
                '# Method 1: manual Pythagorean theorem',
                'manual = np.sqrt(v[0]**2 + v[1]**2)',
                'print(f"Manual:      {manual:.4f} m/s")',
                '',
                '# Method 2: NumPy built-in (use this in practice)',
                'magnitude = np.linalg.norm(v)',
                'print(f"np.linalg.norm: {magnitude:.4f} m/s")',
                '',
                '# They should be identical',
                'print(f"Same? {np.isclose(manual, magnitude)}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },

            // ── CELL 3: Direction / angle ────────────────────────────────────
            {
              id: 3,
              cellTitle: '3 · Computing the direction (angle)',
              prose:
                `The direction is $\\theta = \\arctan(v_y / v_x)$. In Python, use \`np.arctan2(y, x)\` — this two-argument version handles all four quadrants automatically (it's the correct version; avoid \`np.arctan(y/x)\` which breaks in Quadrants II and III).\n\n\`np.arctan2\` returns radians. Multiply by \`180/π\` (or use \`np.degrees()\`) to convert to degrees.`,
              code: [
                '# arctan2 handles all 4 quadrants correctly',
                'angle_rad = np.arctan2(v[1], v[0])   # arctan2(y, x) — note the order!',
                'angle_deg = np.degrees(angle_rad)',
                '',
                'print(f"Angle: {angle_rad:.4f} radians")',
                'print(f"Angle: {angle_deg:.2f}°")',
                '',
                '# Verify: for v=(3,4), angle should be arctan(4/3) ≈ 53.13°',
                'print(f"Check: arctan(4/3) = {np.degrees(np.arctan(4/3)):.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },

            // ── CELL 4: CHALLENGE — components → magnitude (fill-in) ─────────
            {
              id: 4,
              cellTitle: '4 · Challenge: a force vector',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Magnitude and direction of a force',
              difficulty: 'easy',
              prompt:
                `A force vector has components $F_x = -6.0$ N and $F_y = 8.0$ N. Compute its magnitude and direction. The direction should be between 90° and 180° (Quadrant II — left and up).`,
              starterBlock: [
                'F = np.array([___, ___])           # fill in Fx and Fy',
                'F_mag = np.linalg.norm(___)         # compute magnitude',
                'F_angle = np.degrees(np.arctan2(___, ___))  # angle in degrees',
              ].join('\n'),
              code: [
                '# Define the force vector',
                'F = np.array([-6.0, 8.0])',
                'F_mag = np.linalg.norm(F)',
                'F_angle = np.degrees(np.arctan2(F[1], F[0]))',
                '',
                'print(f"|F| = {F_mag:.2f} N")',
                'print(f"θ   = {F_angle:.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "F" in dir(), "Define the vector F"',
                'assert "F_mag" in dir(), "Compute F_mag"',
                'assert "F_angle" in dir(), "Compute F_angle"',
                'assert np.isclose(F_mag, 10.0, atol=0.01), f"|F| should be 10.0 N, got {F_mag:.2f}"',
                'assert np.isclose(F_angle, 126.87, atol=0.1), f"θ should be ≈126.87°, got {F_angle:.2f}°"',
                '"SUCCESS: |F| = 10.0 N at 126.87° — Quadrant II as expected."',
              ].join('\n'),
              hint:
                `F = np.array([-6.0, 8.0]).\nMagnitude: np.linalg.norm(F) — should give 10.\nAngle: np.arctan2(F[1], F[0]) — arctan2 handles Quadrant II automatically.`,
            },

            // ── CELL 5: Rebuilding from polar form ───────────────────────────
            {
              id: 5,
              cellTitle: '5 · Converting magnitude+angle back to components',
              prose:
                `We just went Components → Polar. Now go the other way: Polar → Components.\n\nGiven $|\\vec{A}| = 10$ and $\\theta = 53.13°$, recover $A_x$ and $A_y$:\n$A_x = |\\vec{A}|\\cos\\theta$,  $A_y = |\\vec{A}|\\sin\\theta$.\n\nWe can verify the round-trip is exact.`,
              code: [
                'magnitude = 10.0',
                'theta_deg = 53.13',
                'theta_rad = np.radians(theta_deg)',
                '',
                'Ax = magnitude * np.cos(theta_rad)',
                'Ay = magnitude * np.sin(theta_rad)',
                '',
                'print(f"Components: Ax = {Ax:.4f},  Ay = {Ay:.4f}")',
                'print(f"Expected:   Ax ≈ 6.0,      Ay ≈ 8.0")',
                '',
                '# Round-trip check',
                'recovered = np.array([Ax, Ay])',
                'print(f"Round-trip magnitude: {np.linalg.norm(recovered):.4f}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },

            // ── CELL 6: Real-world — aircraft velocity ───────────────────────
            {
              id: 6,
              cellTitle: '6 · Real world: tracking an aircraft',
              prose:
                `A radar system picks up an aircraft and reports its velocity as:\n**speed = 250 m/s**, **heading = 310°** (measured clockwise from north, like a compass).\n\nPhysics uses angles measured counterclockwise from the +x axis (east). A compass heading of 310° = 50° west of north = 90° + 50° = 140° in physics convention. More precisely, the physics angle is: $\\theta_{physics} = 90° - \\theta_{heading}$ (or add/subtract 360° to keep in range).\n\nRun the cell to decompose the aircraft's velocity into east and north components.`,
              code: [
                '# Radar reports: speed=250 m/s, heading=310° (clockwise from north)',
                'speed = 250.0          # m/s',
                'heading_deg = 310.0    # compass heading, clockwise from north',
                '',
                '# Convert compass heading → physics angle (CCW from +x/east)',
                'physics_angle_deg = 90.0 - heading_deg   # = 90 - 310 = -220 → same as 140°',
                'physics_angle_rad = np.radians(physics_angle_deg)',
                '',
                '# Decompose into east (x) and north (y) components',
                'v_east  = speed * np.cos(physics_angle_rad)',
                'v_north = speed * np.sin(physics_angle_rad)',
                '',
                'v_aircraft = np.array([v_east, v_north])',
                'print(f"Aircraft velocity vector: {v_aircraft} m/s")',
                'print(f"East  component: {v_east:.1f} m/s")',
                'print(f"North component: {v_north:.1f} m/s")',
                'print(f"Speed check: {np.linalg.norm(v_aircraft):.1f} m/s (should be 250)")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },

            // ── CELL 7: Visualise ────────────────────────────────────────────
            {
              id: 7,
              cellTitle: '7 · Visualising vectors with matplotlib',
              prose:
                `A picture is worth a thousand equations. Let's plot both the aircraft's velocity vector and its east/north components on the same diagram.`,
              code: [
                'import matplotlib.pyplot as plt',
                '',
                'fig, ax = plt.subplots(figsize=(6, 6))',
                'ax.set_aspect("equal")',
                'ax.set_facecolor("#0a1628")',
                'fig.patch.set_facecolor("#0a1628")',
                '',
                '# Draw the full velocity vector',
                'ax.annotate("", xy=(v_east, v_north), xytext=(0, 0),',
                '            arrowprops=dict(arrowstyle="->", color="#38b6ff", lw=2.5))',
                '',
                '# Draw east component (horizontal)',
                'ax.annotate("", xy=(v_east, 0), xytext=(0, 0),',
                '            arrowprops=dict(arrowstyle="->", color="#ff4545", lw=2))',
                '',
                '# Draw north component (vertical)',
                'ax.annotate("", xy=(v_east, v_north), xytext=(v_east, 0),',
                '            arrowprops=dict(arrowstyle="->", color="#00c875", lw=2))',
                '',
                '# Labels',
                'ax.text(v_east/2, -18, f"east: {v_east:.0f} m/s", color="#ff4545", ha="center", fontsize=11)',
                'ax.text(v_east+15, v_north/2, f"north: {v_north:.0f} m/s", color="#00c875", fontsize=11)',
                'ax.text(v_east/2 + 20, v_north/2 + 20, f"|v|= {speed:.0f} m/s\\n310° heading",',
                '        color="#38b6ff", fontsize=11)',
                '',
                '# Axes',
                'ax.axhline(0, color="white", alpha=0.3, lw=0.7)',
                'ax.axvline(0, color="white", alpha=0.3, lw=0.7)',
                'ax.set_xlabel("East → (m/s)", color="white")',
                'ax.set_ylabel("North → (m/s)", color="white")',
                'ax.set_title("Aircraft velocity decomposed into components", color="white", pad=12)',
                'ax.tick_params(colors="white")',
                'for spine in ax.spines.values(): spine.set_color("#1e2d3d")',
                '',
                'plt.tight_layout()',
                'plt.savefig("/tmp/vector_aircraft.png", dpi=100, bbox_inches="tight",',
                '            facecolor="#0a1628")',
                'plt.show()',
                'print("Vector diagram saved.")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },

            // ── CELL 8: CHALLENGE — 3D vector ────────────────────────────────
            {
              id: 8,
              cellTitle: '8 · Challenge: extend to 3D',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: '3D velocity of a drone',
              difficulty: 'medium',
              prompt:
                `A drone has velocity components: $v_x = 5$ m/s (east), $v_y = 3$ m/s (north), $v_z = 2$ m/s (up).\n\n1. Create the 3D numpy array \`v_drone\`.\n2. Compute its speed \`speed_3d = np.linalg.norm(v_drone)\`.\n3. Compute the angle above the horizontal: \`phi = np.degrees(np.arctan2(v_drone[2], np.linalg.norm(v_drone[:2])))\`.\n\nExpected: speed ≈ 6.16 m/s, angle ≈ 18.9° above horizontal.`,
              code: [
                '# Write your solution here',
                '# v_drone = np.array([___, ___, ___])',
                '# speed_3d = ...',
                '# phi = ...',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "v_drone" in dir(), "Define v_drone as a 3D numpy array"',
                'assert len(v_drone) == 3, "v_drone should have 3 components"',
                'assert "speed_3d" in dir(), "Compute speed_3d"',
                'assert "phi" in dir(), "Compute phi (elevation angle)"',
                'assert np.isclose(speed_3d, np.sqrt(5**2+3**2+2**2), atol=0.01), f"speed_3d wrong: {speed_3d:.3f}"',
                'assert np.isclose(phi, np.degrees(np.arctan2(2, np.sqrt(25+9))), atol=0.1), f"phi wrong: {phi:.2f}°"',
                '"SUCCESS: 3D vector computed correctly. The XY speed is √(5²+3²)=√34≈5.83 m/s, and the drone climbs at ≈18.9° above horizontal."',
              ].join('\n'),
              hint:
                `v_drone = np.array([5.0, 3.0, 2.0]).\nspeed_3d = np.linalg.norm(v_drone)  →  √(5²+3²+2²) = √38 ≈ 6.16.\nFor phi: the "horizontal speed" is the XY magnitude = np.linalg.norm(v_drone[:2]).\nphi = arctan2(v_z, horizontal_speed).`,
            },

            // ── CELL 9: CHALLENGE — quadrant check ───────────────────────────
            {
              id: 9,
              cellTitle: '9 · Challenge: quadrant detective',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Four vectors, four quadrants',
              difficulty: 'medium',
              prompt:
                `Four vectors are given as (magnitude, angle_degrees):\n- A: (5, 30°) — Quadrant I\n- B: (5, 150°) — Quadrant II\n- C: (5, 210°) — Quadrant III\n- D: (5, 330°) — Quadrant IV\n\nFor each one, compute the component form using \`np.cos\` / \`np.sin\`. Store them as \`A\`, \`B\`, \`C\`, \`D\` (4 numpy arrays). All should have magnitude ≈ 5.`,
              code: [
                '# Convert each (mag, angle_deg) to component form',
                '# A: magnitude=5, angle=30°',
                '# ...',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'for name, arr, ang in [("A",A,30),("B",B,150),("C",C,210),("D",D,330)]:',
                '    assert isinstance(arr, np.ndarray), f"{name} must be a numpy array"',
                '    assert len(arr) == 2, f"{name} must be 2D"',
                '    assert np.isclose(np.linalg.norm(arr), 5.0, atol=0.01), f"|{name}| should be 5, got {np.linalg.norm(arr):.3f}"',
                '    expected = np.array([5*np.cos(np.radians(ang)), 5*np.sin(np.radians(ang))])',
                '    assert np.allclose(arr, expected, atol=0.01), f"{name} components wrong"',
                '"SUCCESS: All four quadrant vectors computed correctly!"',
              ].join('\n'),
              hint:
                `Pattern: A = np.array([5*np.cos(np.radians(30)), 5*np.sin(np.radians(30))]).\nRepeat for each angle. Notice how the signs of the components change with quadrant:\nQ1: (+,+)  Q2: (−,+)  Q3: (−,−)  Q4: (+,−)`,
            },
          ],
        },
      },
    ],
  },

  // ── Examples ─────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-001-ex1',
      title: 'Classifying quantities as vector or scalar',
      problem:
        `\\text{Classify each quantity: (a) } 9.8\\,m/s^2 \\text{ downward, (b) } 25\\,°C, \\text{ (c) } 60\\,km/h \\text{ northeast, (d) } 5\\,kg, (e) \\text{ kinetic energy } 200\\,J.`,
      steps: [
        {
          expression: '\\text{(a) } \\vec{g} = 9.8\\,m/s^2 \\text{ downward} \\Rightarrow \\textbf{vector}',
          annotation:
            `Has a direction (downward). Gravitational acceleration is a vector — at the surface of Earth it always points toward the centre.`,
        },
        {
          expression: '\\text{(b) } T = 25\\,°C \\Rightarrow \\textbf{scalar}',
          annotation: 'Temperature is a pure number — there is no direction associated with being 25 °C.',
        },
        {
          expression: '\\text{(c) } \\vec{v} = 60\\,km/h \\text{ northeast} \\Rightarrow \\textbf{vector}',
          annotation: '"Speed northeast" is velocity — magnitude 60 km/h plus a direction (northeast).',
        },
        {
          expression: '\\text{(d) } m = 5\\,kg \\Rightarrow \\textbf{scalar}',
          annotation:
            `Mass is a scalar. Weight (the gravitational force on that mass) is a vector — it pulls downward with magnitude $mg$.`,
        },
        {
          expression: '\\text{(e) } KE = 200\\,J \\Rightarrow \\textbf{scalar}',
          annotation:
            `Energy is always a scalar — it has a magnitude (how much energy) but no spatial direction. The velocity that created it is a vector; the energy itself is not.`,
        },
      ],
      conclusion:
        `The test: does the quantity require a direction to be fully specified? If yes → vector. If no → scalar. When in doubt, think about whether reversing a direction would change the physical situation.`,
    },
    {
      id: 'ch1-001-ex2',
      title: 'Finding components from magnitude and angle',
      problem:
        `\\text{A displacement vector has magnitude } |\\vec{d}| = 8.0\\,m \\text{ at } \\theta = 30° \\text{ above the positive } x\\text{-axis. Find } d_x \\text{ and } d_y.`,
      steps: [
        {
          expression: 'd_x = |\\vec{d}|\\cos\\theta = 8.0\\cos 30°',
          annotation:
            `The $x$-component is the adjacent side of the right triangle: magnitude × cos(angle). Think of projecting the arrow onto the horizontal axis.`,
        },
        {
          expression: 'd_x = 8.0 \\times \\frac{\\sqrt{3}}{2} = 4\\sqrt{3} \\approx 6.93\\,m',
          annotation: '$\\cos 30° = \\sqrt{3}/2 \\approx 0.866$. The arrow reaches 6.93 m in the x-direction.',
        },
        {
          expression: 'd_y = |\\vec{d}|\\sin\\theta = 8.0\\sin 30°',
          annotation:
            `The $y$-component is the opposite side: magnitude × sin(angle). Think of projecting the arrow onto the vertical axis.`,
        },
        {
          expression: 'd_y = 8.0 \\times 0.5 = 4.0\\,m',
          annotation: '$\\sin 30° = 0.5$ exactly.',
        },
        {
          expression:
            '\\text{Check: } \\sqrt{d_x^2 + d_y^2} = \\sqrt{(4\\sqrt{3})^2 + 4^2} = \\sqrt{48 + 16} = \\sqrt{64} = 8.0\\,m \\checkmark',
          annotation:
            `Always verify by recovering the magnitude from components. If it doesn't match, you've made an error somewhere.`,
        },
      ],
      conclusion:
        `$d_x \\approx 6.93\\,m$, $d_y = 4.0\\,m$. Always verify: $\\sqrt{d_x^2+d_y^2}$ should recover the original magnitude.`,
    },
    {
      id: 'ch1-001-ex3',
      title: 'Recovering magnitude and angle from components',
      problem:
        `\\text{A force vector has components } F_x = -3.0\\,N \\text{ and } F_y = 4.0\\,N. \\text{Find } |\\vec{F}| \\text{ and the direction angle } \\theta.`,
      steps: [
        {
          expression: '|\\vec{F}| = \\sqrt{F_x^2 + F_y^2} = \\sqrt{(-3.0)^2 + (4.0)^2}',
          annotation:
            `Apply the Pythagorean formula. Squaring removes the negative sign — magnitude is always non-negative.`,
        },
        {
          expression: '|\\vec{F}| = \\sqrt{9.0 + 16.0} = \\sqrt{25.0} = 5.0\\,N',
          annotation: 'Magnitude = 5.0 N. This is a 3-4-5 right triangle.',
        },
        {
          expression:
            '\\theta_{\\text{ref}} = \\arctan\\!\\left(\\frac{|F_y|}{|F_x|}\\right) = \\arctan\\!\\left(\\frac{4.0}{3.0}\\right) \\approx 53.1°',
          annotation:
            `Find the reference angle using absolute values. This is the angle from the nearest x-axis. Then use the signs of the components to determine the quadrant.`,
        },
        {
          expression:
            'F_x < 0,\\; F_y > 0 \\Rightarrow \\text{Quadrant II} \\Rightarrow \\theta = 180° - 53.1° = 126.9°',
          annotation:
            `The vector points left ($F_x < 0$) and up ($F_y > 0$) — that's Quadrant II. In Quadrant II, the true angle = 180° − reference angle.`,
        },
      ],
      conclusion:
        `$|\\vec{F}| = 5.0\\,N$ at $\\theta \\approx 127°$ from the positive $x$-axis. If you had just typed $\\arctan(4/−3)$ into your calculator, you would have gotten $-53.1°$, which is Quadrant IV — the wrong answer. Always sketch first.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-001-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Which of the following are vectors? (a) kinetic energy, (b) momentum, (c) temperature, (d) distance, (e) weight.}',
      hint: 'Ask for each: does specifying it in the opposite direction change the physical situation?',
      walkthrough: [
        {
          expression: '\\text{(a) KE} = \\tfrac{1}{2}mv^2 \\Rightarrow \\textbf{scalar}',
          annotation:
            `Energy has no direction. It's a single number (in joules). You can't have "kinetic energy pointing north."`,
        },
        {
          expression: '\\text{(b) } \\vec{p} = m\\vec{v} \\Rightarrow \\textbf{vector}',
          annotation:
            `Momentum inherits the direction of velocity. $\\vec{p} = m\\vec{v}$ — multiply a scalar (mass) by a vector (velocity) and you get a vector (momentum).`,
        },
        {
          expression: '\\text{(c) Temperature} \\Rightarrow \\textbf{scalar}',
          annotation:
            `No direction. A temperature gradient (how fast temperature changes across space) is a vector, but temperature itself is scalar.`,
        },
        {
          expression: '\\text{(d) Distance} \\Rightarrow \\textbf{scalar}',
          annotation:
            `Total path length — always positive, no direction. Displacement (the vector version) adds direction and allows negatives.`,
        },
        {
          expression: '\\text{(e) Weight } \\vec{W} = m\\vec{g} \\Rightarrow \\textbf{vector}',
          annotation:
            `Weight is the gravitational force on an object — it points downward (toward Earth's centre). Mass is the scalar; weight is the vector.`,
        },
      ],
      answer: '\\text{Vectors: (b) momentum, (e) weight. Scalars: (a) KE, (c) temperature, (d) distance.}',
    },
    {
      id: 'ch1-001-ch2',
      difficulty: 'easy',
      problem:
        `\\text{A velocity vector has } v_x = 5.0\\,m/s \\text{ and } v_y = 5.0\\,m/s. \\text{Find the speed } |\\vec{v}| \\text{ and direction } \\theta.`,
      hint:
        `Speed = $\\sqrt{v_x^2 + v_y^2}$. Both components positive → Quadrant I. The angle $\\arctan(5/5) = \\arctan(1) = 45°$ — no quadrant correction needed.`,
      walkthrough: [
        {
          expression: '|\\vec{v}| = \\sqrt{5.0^2 + 5.0^2} = \\sqrt{50} = 5\\sqrt{2} \\approx 7.07\\,m/s',
          annotation: 'Pythagorean theorem. $\\sqrt{50} = \\sqrt{25 \\times 2} = 5\\sqrt{2}$.',
        },
        {
          expression: '\\theta = \\arctan(5.0/5.0) = \\arctan(1) = 45°',
          annotation:
            'Both components are positive → Quadrant I. $\\arctan(1) = 45°$ exactly, no correction needed.',
        },
      ],
      answer: '|\\vec{v}| = 5\\sqrt{2}\\,m/s \\approx 7.07\\,m/s \\text{ at } 45°',
    },
    {
      id: 'ch1-001-ch3',
      difficulty: 'medium',
      problem:
        `\\text{Vector } \\vec{A} \\text{ has magnitude } 10 \\text{ at } 210°. \\text{Find its components. Sketch the vector and verify the quadrant.}`,
      hint:
        `$210° = 180° + 30°$, so the vector is in Quadrant III — both components negative. Use $A_x = 10\\cos210°$ and $A_y = 10\\sin210°$.`,
      walkthrough: [
        {
          expression: 'A_x = 10\\cos210° = 10\\times(-\\tfrac{\\sqrt{3}}{2}) = -5\\sqrt{3} \\approx -8.66',
          annotation:
            `$\\cos210° = -\\cos30° = -\\sqrt{3}/2$ (the cosine is negative in Quadrants II and III). Negative $A_x$ means the arrow points to the left.`,
        },
        {
          expression: 'A_y = 10\\sin210° = 10\\times(-\\tfrac{1}{2}) = -5.0',
          annotation:
            `$\\sin210° = -\\sin30° = -1/2$ (sine is negative in Quadrants III and IV). Negative $A_y$ means the arrow points downward.`,
        },
        {
          expression:
            '\\text{Check: }\\sqrt{(-8.66)^2+(-5.0)^2} = \\sqrt{75+25} = \\sqrt{100} = 10\\checkmark',
          annotation:
            `Magnitude checks out. Both components negative confirms Quadrant III. The vector points down-left, which is consistent with an angle of 210° (southwest).`,
        },
      ],
      answer: 'A_x = -5\\sqrt{3}\\approx -8.66,\\quad A_y = -5.0',
    },
    {
      id: 'ch1-001-ch4',
      difficulty: 'hard',
      problem:
        `\\text{Two vectors: } \\vec{A} = (3, 4) \\text{ and } \\vec{B} \\text{ has magnitude } 5 \\text{ at } 180°. \\text{ Are they equal? What if } \\theta = 53.13°\\text{? Explain why equal magnitudes do not guarantee equality.}`,
      hint:
        `Convert $\\vec{B}$ to component form for each angle. Apply the formal definition: vectors are equal iff every component matches.`,
      walkthrough: [
        {
          expression: '\\vec{B}_{180°}: B_x = 5\\cos180° = -5,\\quad B_y = 5\\sin180° = 0',
          annotation: '$\\cos180° = -1$, $\\sin180° = 0$. So $\\vec{B}_{180°} = (-5, 0)$.',
        },
        {
          expression: '\\vec{A} = (3,\\,4) \\neq (-5,\\,0) = \\vec{B}_{180°}',
          annotation:
            `The $x$-components alone differ (3 vs −5). One mismatch is sufficient. Note: $|\\vec{A}| = 5 = |\\vec{B}|$ — same magnitude, completely different vectors.`,
        },
        {
          expression: '\\vec{B}_{53.13°}: B_x = 5\\cos53.13° = 5(0.6) = 3.0,\\quad B_y = 5\\sin53.13° = 5(0.8) = 4.0',
          annotation:
            `$\\sin53.13° \\approx 0.8$, $\\cos53.13° \\approx 0.6$ (a 3-4-5 triangle scaled by 1). So $\\vec{B}_{53.13°} = (3, 4) = \\vec{A}$ ✓`,
        },
        {
          expression: '\\therefore\\; \\vec{A} = \\vec{B}_{53.13°}\\text{ because every component matches}',
          annotation:
            `Equal magnitude AND equal direction → equal vectors. Equal magnitude alone is not sufficient — direction must also match.`,
        },
      ],
      answer:
        `\\vec{A} \\neq \\vec{B}_{180°}$ (same magnitude, different direction). \\vec{A} = \\vec{B}_{53.13°}$ (same magnitude AND same direction).`,
    },
    {
      id: 'ch1-001-ch5',
      difficulty: 'hard',
      problem:
        `\\text{A boat crosses a river. It aims perpendicular to the bank at } 4\\,m/s. \\text{The current flows at } 3\\,m/s \\text{ along the bank. Find the boat's actual speed and the angle it drifts from its intended path.}`,
      hint:
        `Treat "intended velocity" and "current" as two vectors and add them. The boat's actual velocity is the vector sum.`,
      walkthrough: [
        {
          expression: '\\vec{v}_{\\text{intended}} = (0, 4)\\,m/s \\quad \\vec{v}_{\\text{current}} = (3, 0)\\,m/s',
          annotation:
            `Set up coordinates: x = along river, y = perpendicular to bank. The boat aims straight across: $v_y = 4$. The current pushes sideways: $v_x = 3$.`,
        },
        {
          expression: '\\vec{v}_{\\text{actual}} = (0+3,\\; 4+0) = (3,\\; 4)\\,m/s',
          annotation: 'Add the vectors component by component — this is vector addition.',
        },
        {
          expression: '|\\vec{v}_{\\text{actual}}| = \\sqrt{3^2+4^2} = \\sqrt{25} = 5\\,m/s',
          annotation: 'The boat actually moves at 5 m/s — faster than 4 m/s because the current adds to it.',
        },
        {
          expression: '\\theta = \\arctan(3/4) \\approx 36.87°\\text{ downstream}',
          annotation:
            `The drift angle from the intended direction (y-axis). The boat lands 36.87° downstream of where it aimed.`,
        },
      ],
      answer: '\\text{Actual speed } 5\\,m/s\\text{ at } \\approx37°\\text{ downstream from perpendicular.}',
    },
  ],

  // ── Pattern-recognition viz (registered in VizFrame.jsx) ─────────────────
  patternViz: {
    id: 'VectorPatternSpotter',
    placement: 'math',
    title: 'Spot the vector — 8 quick rounds',
    mathBridge:
      `Each round shows a physical quantity. Decide: vector or scalar? After you answer, the viz shows the arrow (or absence of one) and explains why.`,
    caption:
      'Build recognition before the examples so the worked solutions feel obvious.',
    props: {
      rounds: [
        { quantity: '12\\,m/s\\text{ west}', answer: 'vector', reason: 'velocity carries direction — west is the direction' },
        { quantity: '100\\,J', answer: 'scalar', reason: 'energy has no direction — it\'s a single number' },
        { quantity: '9.8\\,m/s^2\\text{ downward}', answer: 'vector', reason: 'acceleration is a vector — downward specifies direction' },
        { quantity: '273\\,K', answer: 'scalar', reason: 'temperature is scalar — no direction in "being 273 kelvin"' },
        { quantity: '50\\,N\\text{ at }30°', answer: 'vector', reason: 'force is a vector — "at 30°" is the direction' },
        { quantity: '3.0\\,kg', answer: 'scalar', reason: 'mass is scalar; weight (mg downward) is vector' },
        { quantity: '\\Delta\\vec{r} = 5\\,m\\text{ north}', answer: 'vector', reason: 'displacement is a vector by definition' },
        { quantity: '60\\,W', answer: 'scalar', reason: 'power (rate of doing work) is scalar' },
      ],
    },
  },

  // ── Recognition/exhaustive-forms viz ────────────────────────────────────
  recognitionViz: {
    id: 'VectorFormRecogniser',
    placement: 'examples_end',
    title: 'Every disguise a vector wears — recognition drill',
    mathBridge:
      'Vectors appear in many notations across textbooks, papers, and code. After this drill you should recognise them all.',
    caption:
      'Forms covered: arrow notation, bold, bracket/component, magnitude–angle, unit-vector, negative vector.',
    prerequisiteRecaps: [
      {
        concept: 'Right-triangle trigonometry (SOH-CAH-TOA)',
        summary:
          `$\\sin\\theta = \\text{opp}/\\text{hyp}$, $\\cos\\theta = \\text{adj}/\\text{hyp}$, $\\tan\\theta = \\text{opp}/\\text{adj}$. Used to convert between magnitude–angle and component forms.`,
        lessonSlug: null,
      },
      {
        concept: 'Pythagorean theorem',
        summary: '$c^2 = a^2 + b^2$. Used to find the magnitude of a vector from its components.',
        lessonSlug: null,
      },
    ],
    props: {
      forms: [
        { notation: '\\vec{A}', label: 'Arrow notation', example: '\\vec{F} = 10\\,N\\text{ east}' },
        { notation: '\\mathbf{A}', label: 'Bold notation (textbooks / linear algebra)', example: '\\mathbf{v} = 3\\,m/s\\text{ north}' },
        { notation: '(A_x,\\, A_y)', label: 'Component/bracket notation', example: '\\vec{d} = (4,\\,-3)\\,m' },
        { notation: '|\\vec{A}|\\angle\\theta', label: 'Magnitude–angle notation', example: '|\\vec{v}| = 5\\,m/s\\angle 37°' },
        { notation: 'A_x\\,\\hat{\\imath} + A_y\\,\\hat{\\jmath}', label: 'Unit-vector notation', example: '\\vec{F} = 3\\hat{\\imath} - 4\\hat{\\jmath}\\,N' },
        { notation: '-\\vec{A}', label: 'Negative vector (same magnitude, opposite direction)', example: '\\text{If }\\vec{A}=(3,4)\\text{ then }-\\vec{A}=(-3,-4)' },
      ],
    },
  },
}
