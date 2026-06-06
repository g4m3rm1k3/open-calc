export default {
  id: 'p0-006',
  slug: 'vectors-vs-scalars',
  chapter: 'p0',
  order: 5,
  title: 'Vectors vs Scalars',
  subtitle: 'Why direction matters — and why physics cannot work without it.',
  tags: ['vector', 'scalar', 'magnitude', 'direction', 'components', 'resultant', 'arrow notation', '2D motion'],

  hook: {
    question:
      'A pilot radios: "I am 300 km from the airport."Is that enough to find the plane?No — 300 km north and 300 km east are completely different locations. The distance (300 km) is a scalar. The displacement ("300 km northeast at bearing 045°") is a vector. When you confuse the two, you get lost — literally. In physics, every time you write "velocity" or "force" or "acceleration,"you are working with a vector. What makes vectors different from plain numbers — and why does it matter for every equation?',
    realWorldContext:
      'Airplane navigation uses vectors for velocity — direction and speed both matter. Structural engineers use force vectors — the direction of a force determines whether a beam holds or buckles. GPS systems compute displacement vectors. Projectile motion, Newton\'s laws, electric fields, magnetic forces — all vectors. In Chapter 1 of this course you will add force vectors to determine net force on objects. This lesson is the foundation for all of that.',
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-components' },
  },

  intuition: {
    prose: [
      '**A scalar is a number with a unit. That\'s it. **Temperature: 72°F. Mass: 5 kg. Time: 10 s. Speed: 60 km/h. Each of these is completely described by one number plus a unit. There is no "direction" to 5 kg. No compass bearing for 72°F.Scalars can be added, subtracted, multiplied, divided — plain arithmetic.',

      '**A vector is a number with a unit AND a direction. **Displacement: "5 m north." Velocity: "60 km/h northeast." Force: "50 N downward."The direction is not extra decoration — it is physically essential."50 N downward" and "50 N upward" are completely different forces. They will produce completely different effects on an object. We draw vectors as arrows: the length encodes magnitude, the direction encodes direction.',

      '**The free-vector rule — position doesn\'t matter. **A vector has only two properties: magnitude and direction. Where you draw it on a page is irrelevant. You can slide any vector anywhere (translate it) without changing it. This is called the **free vector** rule. It means: when adding forces on a free-body diagram,you can pick up each force arrow and place them head-to-tail wherever convenient.',

      '**Adding vectors is NOT the same as adding scalars. **Two forces of 3 N and 4 N acting on the same object. What is the net force?If they act in the same direction: 3 + 4 = 7 N.If they act in opposite directions: 3 − 4 = −1 N (or 1 N in the direction of the 4 N force). If they act at right angles: \\(\\sqrt{3^2 + 4^2} = 5\\) N (at an angle between them). Same scalars, wildly different outcomes — all because of direction.',

      '**Components — decomposing a vector into x and y parts. **Any 2D vector can be expressed as two numbers: its horizontal part (x-component)and its vertical part (y-component). For a vector with magnitude \\(A\\) at angle \\(\\theta\\) above the x-axis:\\(A_x = A\\cos\\theta\\) and \\(A_y = A\\sin\\theta\\). This decomposition converts vector geometry into number algebra. To add two vectors: add their x-components and add their y-components separately. This is the power of components — direction problems become scalar arithmetic.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 6 of 8 — Chapter 0: Orientation',
        body:
          '**Previous (Lesson 5):** Graphs as physics — reading x–t and v–t graphs.\\n**This lesson:** Vectors vs scalars — direction, arrows, components, adding vectors.\\n**Next (Lesson 7):** Coordinate systems — choosing x, y, origin.\\n**Why it matters:** Newton\'s laws and all of kinematics use vectors. Chapter 1 depends on this.',
      },
      {
        type: 'definition',
        title: 'Scalar',
        body:
          '\\text{A physical quantity fully described by a } \\textit{magnitude and a unit} \\text{ only.}\\\\\\text{Examples: mass [kg], temperature [°C], speed [m/s], energy [J], time [s].}\\\\\\text{Arithmetic: ordinary addition and multiplication.}',
      },
      {
        type: 'definition',
        title: 'Vector',
        body:
          '\\text{A physical quantity with both } \\textit{magnitude} \\text{ and } \\textit{direction}\\text{.}\\\\\\text{Notation: } \\vec{A} \\text{ (arrow over letter) or } \\mathbf{A} \\text{ (bold).}\\\\\\text{Drawn as an arrow: length = magnitude, direction = direction.}\\\\\\text{Examples: displacement [m], velocity [m/s], force [N], acceleration [m/s²].}',
      },
      {
        type: 'theorem',
        title: 'Vector components',
        body:
          'A_x = |\\vec{A}|\\cos\\theta \\quad A_y = |\\vec{A}|\\sin\\theta\\\\|\\vec{A}| = \\sqrt{A_x^2 + A_y^2} \\quad \\theta = \\arctan\\!\\left(\\frac{A_y}{A_x}\\right)\\\\\\text{where } \\theta \\text{ is the angle from the positive x-axis.}',
      },
      {
        type: 'insight',
        title: 'Vector addition by components',
        body:
          '\\text{If } \\vec{C} = \\vec{A} + \\vec{B}\\text{:}\\\\C_x = A_x + B_x \\quad C_y = A_y + B_y\\\\\\text{Add x-components together. Add y-components together. Separately.}\\\\\\text{Find magnitude and direction of } \\vec{C} \\text{ from } C_x, C_y\\text{.}',
      },
      {
        type: 'warning',
        title: 'Never add magnitudes of vectors that are not parallel',
        body:
          '3\\,\\text{N at 0°} + 4\\,\\text{N at 90°} \\neq 7\\,\\text{N}\\\\\\text{Correct: resultant} = \\sqrt{3^2+4^2} = 5\\,\\text{N at } \\arctan(4/3) \\approx 53°\\\\\\text{Adding vector magnitudes directly only works when they are parallel.}',
      },
    ],
    visualizations: [
      {
        id: 'VectorBuilder',
        title: 'Drag the tip — watch vx, vy, magnitude, and angle update live',
        mathBridge:
          'Drag the blue dot (the tip of the vector) anywhere on the grid. Watch: vx is the horizontal reach, vy is the vertical reach. The magnitude |v| is the straight-line distance from origin to tip — always longer than either component alone. The angle is measured from the +x axis. Now test: drag the tip straight right → vy = 0, |v| = vx. Drag it straight up → vx = 0, |v| = vy. Drag diagonally at 45° → vx = vy, |v| = √2 × vx. These are not formulas — they are geometry you can see.',
        caption: 'Every vector is just two perpendicular scalars. The right triangle connecting them is always there.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Component decomposition — the algebra behind the triangle',
        mathBridge:
          'A vector \\(\\vec{A}\\) at angle θ above the x-axis forms a right triangle. The horizontal leg is A_x = A·cosθ. The vertical leg is A_y = A·sinθ. The hypotenuse is |A|. This is not a formula to memorize — it is just trigonometry (opposite = hyp·sinθ, adjacent = hyp·cosθ).',
        caption: 'The decomposition formulas are the component drill: A_x = A cosθ, A_y = A sinθ.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Head-to-tail vector addition',
        mathBridge:
          'To add three vectors: place the second arrow at the tip of the first, the third at the tip of the second. The resultant goes from the tail of the first to the tip of the last. Alternatively: add all x-components and all y-components separately — same answer, less drawing.',
        caption: 'Head-to-tail addition closes the polygon. The resultant is the shortcut from start to finish.',
      },
    ],
  },

  math: {
    prose: [
      '**The component method — step by step. **To add \\(\\vec{A}\\) (magnitude 5, angle 30°) and \\(\\vec{B}\\) (magnitude 8, angle 60°):(1) Find components:\\(A_x = 5\\cos30° = 5(0.866) = 4.33\\), \\(A_y = 5\\sin30° = 5(0.5) = 2.5\\).\\(B_x = 8\\cos60° = 8(0.5) = 4\\), \\(B_y = 8\\sin60° = 8(0.866) = 6.93\\).(2) Add: \\(C_x = 4.33 + 4 = 8.33\\), \\(C_y = 2.5 + 6.93 = 9.43\\).(3) Magnitude: \\(|\\vec{C}| = \\sqrt{8.33^2 + 9.43^2} = \\sqrt{69.4 + 88.9} = \\sqrt{158.3} \\approx 12.6\\).(4) Direction: \\(\\theta = \\arctan(9.43/8.33) \\approx 48.6°\\). Done.',
      '**Unit vectors — direction without magnitude. **A unit vector has magnitude 1. It encodes direction only. The standard unit vectors: \\(\\hat{i}\\) points in +x, \\(\\hat{j}\\) points in +y, \\(\\hat{k}\\) points in +z. Any vector can be written: \\(\\vec{A} = A_x\\hat{i} + A_y\\hat{j}\\). This notation makes algebra with vectors much cleaner — you can just add the coefficients of \\(\\hat{i}\\) and \\(\\hat{j}\\) separately.',
      '**Trig values to memorize for 30°, 45°, 60°. **sin30° = 0.5, cos30° = √3/2 ≈ 0.866.sin45° = cos45° = √2/2 ≈ 0.707.sin60° = √3/2 ≈ 0.866, cos60° = 0.5.These are exact values you will use in almost every vector problem.',
    ],
    callouts: [
      {
        type: 'mnemonic',
        title: 'SOH-CAH-TOA — the right-triangle decoder',
        body:
          '\\text{SOH: } \\sin\\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{A_y}{|\\vec{A}|}\\\\\\text{CAH: } \\cos\\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}} = \\frac{A_x}{|\\vec{A}|}\\\\\\text{TOA: } \\tan\\theta = \\frac{\\text{opposite}}{\\text{adjacent}} = \\frac{A_y}{A_x}',
      },
      {
        type: 'insight',
        title: 'The trig values you must know cold',
        body:
          '\\begin{array}{c|cc}\\theta & \\sin\\theta & \\cos\\theta \\\\ \\hline30° & 1/2 & \\sqrt{3}/2 \\\\45° & \\sqrt{2}/2 & \\sqrt{2}/2 \\\\60° & \\sqrt{3}/2 & 1/2 \\end{array}',
      },
      {
        type: 'definition',
        title: 'Unit vector notation',
        body:
          '\\hat{i} = \\text{unit vector in +x direction}\\\\\\hat{j} = \\text{unit vector in +y direction}\\\\\\vec{A} = A_x\\hat{i} + A_y\\hat{j} \\quad \\text{(component form)}\\\\\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|} \\quad \\text{(unit vector in direction of } \\vec{A}\\text{)}',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Vector operations in Python — components, magnitude, addition',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — Create and Decompose a Vector',
              prose: 'Given magnitude and angle, find the x and y components.',
              instructions: 'Run. Change A_mag and theta_deg to explore.',
              code:
                'import numpy as np\n\nA_mag = 10.0   # magnitude of vector A\ntheta_deg = 35  # angle above +x axis, in degrees\n\ntheta_rad = np.radians(theta_deg)\nAx = A_mag * np.cos(theta_rad)\nAy = A_mag * np.sin(theta_rad)\n\nprint(f"Vector A: magnitude = {A_mag}, angle = {theta_deg}°")\nprint(f"Components: Ax = {Ax:.4f}, Ay = {Ay:.4f}")\nprint(f"Check: |A| = √(Ax²+Ay²) = {np.sqrt(Ax**2+Ay**2):.4f} ✓")',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Add Two Vectors by Components',
              prose: 'Add vectors A and B by adding their components. Then find the resultant\'s magnitude and direction.',
              instructions: 'Run. Verify the 3-4-5 triangle: A=(3,0), B=(0,4) → C=(3,4), |C|=5.',
              code:
                'import numpy as np\n\nA = np.array([3.0, 0.0])  # 3 N in +x direction\nB = np.array([0.0, 4.0])  # 4 N in +y direction\n\nC = A + B  # component-wise addition\n\nmag_C = np.linalg.norm(C)\nangle_C = np.degrees(np.arctan2(C[1], C[0]))\n\nprint(f"A = {A}")\nprint(f"B = {B}")\nprint(f"C = A + B = {C}")\nprint(f"|C| = {mag_C:.4f} N")\nprint(f"Direction: {angle_C:.2f}° above +x axis")',
              output: '',
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Stage 3 — Scalar vs Vector: Why Direction Changes Everything',
              prose: 'Three scenarios: same force magnitudes, different directions. Watch how the resultant changes.',
              instructions: 'Run. Notice that same magnitudes + different directions = completely different results.',
              code:
                'import numpy as np\n\nF1_mag = 5.0  # N\nF2_mag = 5.0  # N\n\nscenarios = [\n    ("Parallel (0°, 0°)",   np.array([5.0, 0.0]),  np.array([5.0, 0.0])),\n    ("Anti-parallel (0°, 180°)", np.array([5.0, 0.0]),  np.array([-5.0, 0.0])),\n    ("Perpendicular (0°, 90°)", np.array([5.0, 0.0]),  np.array([0.0, 5.0])),\n    ("At 60° (0°, 60°)",    np.array([5.0, 0.0]),  np.array([2.5, 4.33])),\n]\n\nprint(f"{\'Scenario\':40} {\'|Resultant|\':12} {\'Direction\':10}")\nprint("-"*65)\nfor name, F1, F2 in scenarios:\n    R = F1 + F2\n    mag = np.linalg.norm(R)\n    ang = np.degrees(np.arctan2(R[1], R[0]))\n    print(f"{name:40} {mag:12.4f} N  {ang:8.1f}°")',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge — Three Forces in Equilibrium',
              difficulty: 'hard',
              prompt:
                'Three forces act on an object: F1 = (4, 0) N, F2 = (0, 3) N, F3 = (Fx, Fy) N.For equilibrium (net force = 0), what must F3 be?Store it as f3 = np.array([Fx, Fy]).',
              instructions:
                '1. Equilibrium: F1 + F2 + F3 = 0\n2. F3 = -(F1 + F2)\n3. Compute and store in f3.',
              code:
                'import numpy as np\n\nF1 = np.array([4.0, 0.0])\nF2 = np.array([0.0, 3.0])\n\n# Your calculation:\nf3 = \n\nprint(f"F3 = {f3}")\nprint(f"|F3| = {np.linalg.norm(f3):.4f} N")',
              output: '',
              status: 'idle',
              testCode:
                '\nimport numpy as np\nF1=np.array([4.0,0.0]); F2=np.array([0.0,3.0])\nexpected = -(F1+F2)\nif not np.allclose(f3, expected):\n    raise ValueError(f"Expected {expected}, got {f3}")\nres = f"SUCCESS: F3 = {f3}, |F3| = {np.linalg.norm(f3):.4f} N. Resultant = {F1+F2+f3}"\nres\n',
              hint: 'f3 = -(F1 + F2)',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Formal definition of a vector. **A vector in \\(\\mathbb{R}^n\\) is an element of that space — an ordered tuple of numbers. In physics, a 2D vector is \\((A_x, A_y) \\in \\mathbb{R}^2\\). Addition: \\((A_x, A_y) + (B_x, B_y) = (A_x+B_x, A_y+B_y)\\). Scalar multiplication: \\(c(A_x, A_y) = (cA_x, cA_y)\\). These obey the axioms of a vector space: commutativity, associativity,distributivity, existence of zero vector and additive inverse.',
      '**Magnitude and inner product. **The magnitude (Euclidean norm) is \\(|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}\\). The dot product is \\(\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y = |\\vec{A}||\\vec{B}|\\cos\\phi\\). This connects the algebraic definition (sum of products)to the geometric definition (magnitudes times cosine of angle). You will use both forms constantly in Chapter 1 (work, projections).',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Vector space axioms (simplified)',
        body:
          '\\text{Commutativity: } \\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}\\\\\\text{Associativity: } (\\vec{A}+\\vec{B})+\\vec{C} = \\vec{A}+(\\vec{B}+\\vec{C})\\\\\\text{Zero vector: } \\vec{A}+\\vec{0} = \\vec{A}\\\\\\text{Additive inverse: } \\vec{A}+(-\\vec{A}) = \\vec{0}\\\\\\text{Distributivity: } c(\\vec{A}+\\vec{B}) = c\\vec{A}+c\\vec{B}',
      },
      {
        type: 'insight',
        title: 'Dot product — two formulas, one quantity',
        body:
          '\\vec{A}\\cdot\\vec{B} = A_x B_x + A_y B_y \\quad \\text{(algebraic)}\\\\\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi \\quad \\text{(geometric)}\\\\\\text{They are equal. Use whichever is more convenient for the problem.}',
      },
    ],
    proofSteps: [
      {
        expression: '\\text{Claim: } |\\vec{A}|^2 = A_x^2 + A_y^2 \\text{ (Pythagorean theorem for vectors)}',
        annotation: 'We want to show the magnitude formula is just the Pythagorean theorem.',
      },
      {
        expression: '\\text{A 2D vector } \\vec{A} \\text{ forms a right triangle with legs } A_x \\text{ and } A_y',
        annotation: 'The component decomposition places Ax along the x-axis and Ay along the y-axis.',
      },
      {
        expression: '|\\vec{A}|^2 = A_x^2 + A_y^2 \\quad \\text{(Pythagorean theorem)}',
        annotation: 'The hypotenuse squared equals the sum of the squares of the legs.',
      },
      {
        expression: '\\therefore |\\vec{A}| = \\sqrt{A_x^2 + A_y^2}',
        annotation: 'Take the positive square root (magnitude is always non-negative).',
      },
    ],
    title: 'The magnitude formula is the Pythagorean theorem',
    visualizations: [],
  },

  examples: [
    {
      id: 'p0-006-ex1',
      title: 'Find components of a velocity vector',
      problem:
        '\\text{A ball is kicked at 25 m/s at 37° above the horizontal. Find the horizontal and vertical velocity components.}',
      steps: [
        {
          expression: 'v_x = v\\cos\\theta = 25\\cos37° = 25(0.799) = 19.97\\,\\text{m/s}',
          annotation: 'Horizontal component: adjacent side of the right triangle. cos37° ≈ 0.799.',
        },
        {
          expression: 'v_y = v\\sin\\theta = 25\\sin37° = 25(0.602) = 15.04\\,\\text{m/s}',
          annotation: 'Vertical component: opposite side. sin37° ≈ 0.602.',
        },
        {
          expression: '\\text{Check: } \\sqrt{19.97^2 + 15.04^2} = \\sqrt{398.8 + 226.2} = \\sqrt{625} = 25\\,\\text{m/s} \\checkmark',
          annotation: 'Magnitude of the components should equal the original magnitude.',
        },
      ],
      conclusion: 'v_x ≈ 20.0 m/s, v_y ≈ 15.0 m/s. (Note: 15-20-25 is a 3-4-5 triangle scaled by 5.)',
    },
    {
      id: 'p0-006-ex2',
      title: 'Add two force vectors by components',
      problem:
        '\\text{Force } \\vec{F}_1 = 40\\,\\text{N at 0° and } \\vec{F}_2 = 30\\,\\text{N at 90°.Find the resultant.}',
      steps: [
        {
          expression: 'F_{1x} = 40\\cos0° = 40\\,\\text{N}, \\quad F_{1y} = 40\\sin0° = 0\\,\\text{N}',
          annotation: '0° means pointing along +x.',
        },
        {
          expression: 'F_{2x} = 30\\cos90° = 0\\,\\text{N}, \\quad F_{2y} = 30\\sin90° = 30\\,\\text{N}',
          annotation: '90° means pointing along +y.',
        },
        {
          expression: 'R_x = 40 + 0 = 40\\,\\text{N}, \\quad R_y = 0 + 30 = 30\\,\\text{N}',
          annotation: 'Add components separately.',
        },
        {
          expression: '|\\vec{R}| = \\sqrt{40^2 + 30^2} = \\sqrt{1600+900} = \\sqrt{2500} = 50\\,\\text{N}',
          annotation: 'Magnitude — classic 3-4-5 (scaled by 10).',
        },
        {
          expression: '\\theta = \\arctan(30/40) = \\arctan(0.75) \\approx 36.9°',
          annotation: 'Direction — angle above the +x axis.',
        },
      ],
      conclusion: 'Resultant = 50 N at 36.9° above the horizontal.',
    },
    {
      id: 'p0-006-ex3',
      title: 'Find the vector from magnitude and direction — then write in component form',
      problem:
        '\\text{A displacement vector has magnitude 100 m at bearing 030° (from north, clockwise). Express it as \\(\\vec{d} = d_x \\hat{i} + d_y \\hat{j}\\) using standard x-east, y-north convention.}',
      steps: [
        {
          expression: '\\text{Bearing 030° = 30° east of north. Standard: 60° above +x (east).}',
          annotation: 'Convert bearing (from north) to standard angle (from east): standard = 90° − bearing.',
        },
        {
          expression: 'd_x = 100\\sin30° = 100(0.5) = 50\\,\\text{m (east)}',
          annotation: 'East component: sin of bearing angle.',
        },
        {
          expression: 'd_y = 100\\cos30° = 100(0.866) = 86.6\\,\\text{m (north)}',
          annotation: 'North component: cos of bearing angle.',
        },
        {
          expression: '\\vec{d} = 50\\hat{i} + 86.6\\hat{j}\\,\\text{m}',
          annotation: 'Component form.',
        },
      ],
      conclusion: '\\(\\vec{d} = 50\\hat{i} + 86.6\\hat{j}\\) m. Note: when working with compass bearings, be careful to convert correctly.',
    },
  ],

  challenges: [
    {
      id: 'p0-006-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A force vector has components } F_x = 6\\,\\text{N and } F_y = 8\\,\\text{N.Find its magnitude and direction.}',
      hint: 'Magnitude: √(6²+8²). Direction: arctan(8/6). Recognize the 6-8-10 right triangle.',
      walkthrough: [
        {
          expression: '|\\vec{F}| = \\sqrt{36+64} = \\sqrt{100} = 10\\,\\text{N}',
          annotation: '6-8-10 right triangle.',
        },
        {
          expression: '\\theta = \\arctan(8/6) = \\arctan(1.333) \\approx 53.1°',
          annotation: 'Above the +x axis.',
        },
      ],
      answer: '|F| = 10 N at 53.1° above the +x axis.',
    },
    {
      id: 'p0-006-ch2',
      difficulty: 'medium',
      problem:
        '\\text{Three displacement vectors: } \\vec{A} = 3\\hat{i} + 4\\hat{j}, \\vec{B} = -2\\hat{i} + 6\\hat{j}, \\vec{C} = 5\\hat{i} - 3\\hat{j}\\text{ (all in meters). Find } \\vec{A} + \\vec{B} + \\vec{C} \\text{ and its magnitude.}',
      hint: 'Add all x-components, then all y-components. Then use the Pythagorean theorem.',
      walkthrough: [
        {
          expression: 'R_x = 3 + (-2) + 5 = 6\\,\\text{m}',
          annotation: 'Sum of x-components.',
        },
        {
          expression: 'R_y = 4 + 6 + (-3) = 7\\,\\text{m}',
          annotation: 'Sum of y-components.',
        },
        {
          expression: '|\\vec{R}| = \\sqrt{6^2+7^2} = \\sqrt{36+49} = \\sqrt{85} \\approx 9.22\\,\\text{m}',
          annotation: 'Magnitude.',
        },
      ],
      answer: '\\(\\vec{R} = 6\\hat{i} + 7\\hat{j}\\) m, magnitude ≈ 9.22 m.',
    },
    {
      id: 'p0-006-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A river flows east at 3 m/s. A boat steers 60° north of east at 5 m/s relative to the water. What is the boat\'s actual velocity (magnitude and direction)?}',
      hint:
        'River velocity vector: (3, 0) m/s. Boat-relative-to-water: 5 m/s at 60° above east. Actual velocity = river + boat-relative.',
      walkthrough: [
        {
          expression: '\\vec{v}_{\\text{water}} = 3\\hat{i} + 0\\hat{j}\\,\\text{m/s}',
          annotation: 'River flows east.',
        },
        {
          expression: '\\vec{v}_{\\text{boat/water}} = 5\\cos60°\\hat{i} + 5\\sin60°\\hat{j} = 2.5\\hat{i} + 4.33\\hat{j}\\,\\text{m/s}',
          annotation: 'Boat velocity relative to water.',
        },
        {
          expression: '\\vec{v}_{\\text{actual}} = (3+2.5)\\hat{i} + (0+4.33)\\hat{j} = 5.5\\hat{i} + 4.33\\hat{j}\\,\\text{m/s}',
          annotation: 'Add both vectors.',
        },
        {
          expression: '|\\vec{v}| = \\sqrt{5.5^2+4.33^2} = \\sqrt{30.25+18.75} = \\sqrt{49} = 7\\,\\text{m/s}',
          annotation: 'Magnitude.',
        },
        {
          expression: '\\theta = \\arctan(4.33/5.5) \\approx 38.2°\\text{ north of east}',
          annotation: 'Direction.',
        },
      ],
      answer: 'Actual velocity = 7 m/s at 38.2° north of east.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\vec{A}', meaning: 'vector A — has magnitude AND direction' },
      { symbol: '|\\vec{A}|', meaning: 'magnitude of vector A — always positive, just the size' },
      { symbol: 'A_x, A_y', meaning: 'x and y components of A — can be negative (direction encoded in sign)' },
      { symbol: '\\hat{i}, \\hat{j}', meaning: 'unit vectors in +x and +y directions — magnitude 1, encode direction only' },
      { symbol: 'A_x = A\\cos\\theta', meaning: 'x-component = magnitude × cosine of angle from +x axis' },
      { symbol: 'A_y = A\\sin\\theta', meaning: 'y-component = magnitude × sine of angle from +x axis' },
      { symbol: '\\vec{A} + \\vec{B}', meaning: 'vector addition — add x-components, add y-components separately' },
    ],
    rulesOfThumb: [
      'Never add vector magnitudes directly unless the vectors are parallel.',
      'Components can be negative — negative Ax means the vector points in the −x direction.',
      'Always define your coordinate system (which way is +x) before writing components.',
      'Check your answer: recompute |C| from the components and verify it equals what you expect.',
      'For perpendicular vectors, use the Pythagorean theorem: |A+B|² = |A|² + |B|² when A⊥B.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-002',
        label: 'Lesson 2 — Units and Dimensions',
        note:
          'Vector components have units — Ax is in m, Ay is in m, not dimensionless. If units feel unclear, review Lesson 2.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'p1-ch1-001',
        label: 'Ch. 1 — Vectors in Depth',
        note:
          'Chapter 1 is entirely devoted to vectors: magnitude, direction, addition, dot product, cross product. This lesson is the preview; Chapter 1 is the full story.',
      },
      {
        lessonId: 'p1-ch3-001',
        label: 'Ch. 3 — Projectile Motion',
        note:
          'Projectile motion decomposes into x and y components, each obeying 1D kinematics independently. The component idea from this lesson is the entire foundation of Chapter 3.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-006-assess-1',
        type: 'input',
        text: 'A vector has Ax = 5 m and Ay = 12 m. What is its magnitude in meters?',
        answer: '13',
        hint: '√(5²+12²) = √(25+144) = √169 = 13. This is the 5-12-13 right triangle.',
      },
      {
        id: 'p0-006-assess-2',
        type: 'choice',
        text: 'Which of these is a vector quantity?',
        options: ['temperature', 'mass', 'velocity', 'speed'],
        answer: 'velocity',
        hint: 'Velocity has both magnitude (speed) and direction. Speed is the scalar version.',
      },
    ],
  },

  mentalModel: [
    'Scalars: magnitude + unit only. Vectors: magnitude + unit + direction.',
    'Draw vectors as arrows: length = magnitude, direction = direction',
    'Components: Ax = A·cosθ, Ay = A·sinθ — turn arrows into numbers',
    'Add vectors by adding components: Cx = Ax+Bx, Cy = Ay+By',
    'Magnitude: |A| = √(Ax²+Ay²) — the Pythagorean theorem',
    'Unit vectors î, ĵ — direction only, magnitude 1',
    'Never add magnitudes of non-parallel vectors: 3N + 4N ≠ 7N if they are perpendicular',
  ],

  notebooks: {
    python: {
      type: 'python',
      cells: [
        {
          cellTitle: 'Vectors as NumPy Arrays — Components and Magnitude',
          type: 'code',
          language: 'python',
          prose: [
            `In Python, a 2D vector is naturally represented as a NumPy array [Ax, Ay]. All vector operations (addition, scaling, magnitude) then use standard array arithmetic. This cell defines vectors, computes magnitudes, and adds them.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

# Define 2D vectors as NumPy arrays
A = np.array([3.0, 4.0])   # m/s
B = np.array([1.0, -2.0])  # m/s

# Magnitude (Pythagorean theorem)
mag_A = np.linalg.norm(A)
mag_B = np.linalg.norm(B)

# Direction (angle from +x axis)
angle_A = np.degrees(np.arctan2(A[1], A[0]))
angle_B = np.degrees(np.arctan2(B[1], B[0]))

print("=== Vector Properties ===")
print(f"A = {A}  m/s,  |A| = {mag_A:.3f} m/s,  θ_A = {angle_A:.1f}°")
print(f"B = {B}  m/s,  |B| = {mag_B:.3f} m/s,  θ_B = {angle_B:.1f}°")

# Vector addition
R = A + B
print(f"\\nA + B = {R},  |A+B| = {np.linalg.norm(R):.3f} m/s")

# Scalar multiplication
two_A = 2 * A
neg_B = -B
print(f"2A = {two_A}")
print(f"-B = {neg_B}")

# Key: |A + B| ≠ |A| + |B| in general
print(f"\\n|A| + |B| = {mag_A + mag_B:.3f}  (triangle inequality: ≥ |A+B| = {np.linalg.norm(R):.3f})")`,
        },
        {
          cellTitle: 'Visualising Vector Addition — Head to Tail',
          type: 'code',
          language: 'python',
          prose: [
            `Head-to-tail addition is the geometric rule: place the tail of B at the head of A. The resultant R = A + B runs from the tail of A to the head of B. This cell draws the arrows and confirms the algebra.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

def draw_vector(ax, origin, vec, color, label, lw=2):
    ax.annotate('', xy=origin+vec, xytext=origin,
                arrowprops=dict(arrowstyle='->', color=color, lw=lw))
    mid = origin + 0.5*vec
    ax.text(mid[0]+0.1, mid[1]+0.1, label, color=color, fontsize=11, fontweight='bold')

# Define vectors
A = np.array([3.0, 2.0])
B = np.array([-1.0, 3.0])
R = A + B

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left: head-to-tail addition
origin = np.array([0.0, 0.0])
draw_vector(axes[0], origin, A, 'blue', f'A={A}')
draw_vector(axes[0], A, B, 'green', f'B={B}')       # B starts at head of A
draw_vector(axes[0], origin, R, 'red', f'R=A+B={R}', lw=2.5)
axes[0].set_xlim(-1.5, 3.5);  axes[0].set_ylim(-0.5, 5.5)
axes[0].set_aspect('equal');  axes[0].grid(True, alpha=0.3)
axes[0].set_title('Head-to-tail: R = A + B')

# Right: component decomposition
draw_vector(axes[1], origin, R, 'red', f'R={R}', lw=2.5)
draw_vector(axes[1], origin, np.array([R[0], 0]), 'purple', f'Rx={R[0]:.1f}')
draw_vector(axes[1], np.array([R[0], 0]), np.array([0, R[1]]), 'orange', f'Ry={R[1]:.1f}')
axes[1].set_xlim(-1, 3.5);  axes[1].set_ylim(-0.5, 5.5)
axes[1].set_aspect('equal');  axes[1].grid(True, alpha=0.3)
axes[1].set_title(f'Components: |R|={np.linalg.norm(R):.2f}  θ={np.degrees(np.arctan2(R[1],R[0])):.1f}°')

plt.tight_layout()
plt.show()

print(f"R = ({R[0]:.1f}, {R[1]:.1f}),  |R| = {np.linalg.norm(R):.3f}")`,
        },
        {
          cellTitle: 'Projectile Motion — Decomposing Initial Velocity',
          type: 'code',
          language: 'python',
          prose: [
            `A projectile's initial velocity is a vector. Decomposing it into horizontal and vertical components is the core technique of 2D kinematics. Horizontal and vertical motions are independent — the vector framework makes this explicit.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

v0 = 25.0      # m/s  initial speed
theta = 37.0   # degrees  launch angle
g = 9.8        # m/s²

# Component decomposition
vx = v0 * np.cos(np.radians(theta))
vy = v0 * np.sin(np.radians(theta))
print(f"Launch: v₀={v0} m/s at θ={theta}°")
print(f"  vx = v₀cosθ = {vx:.3f} m/s  (horizontal)")
print(f"  vy = v₀sinθ = {vy:.3f} m/s  (vertical)")
print(f"  Check: √(vx²+vy²) = {np.sqrt(vx**2+vy**2):.3f} m/s ✓")

# Trajectory
t_land = 2 * vy / g
t = np.linspace(0, t_land, 300)
x = vx * t
y = vy * t - 0.5 * g * t**2

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(x, y, 'b-', linewidth=2, label='Trajectory')
ax.fill_between(x, 0, y, alpha=0.1, color='blue')

# Draw initial velocity vector and components
scale = 0.5
ax.annotate('', xy=(vx*scale, vy*scale), xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='red', lw=2))
ax.annotate('', xy=(vx*scale, 0), xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='purple', lw=2))
ax.annotate('', xy=(vx*scale, vy*scale), xytext=(vx*scale, 0),
            arrowprops=dict(arrowstyle='->', color='orange', lw=2))

ax.text(vx*scale/2, vy*scale/2+0.3, f'v₀={v0}m/s', color='red', fontsize=10)
ax.text(vx*scale/2, -0.5, f'vx={vx:.1f}m/s', color='purple', fontsize=9)
ax.text(vx*scale+0.2, vy*scale/2, f'vy={vy:.1f}m/s', color='orange', fontsize=9)

ax.set_xlabel('x [m]');  ax.set_ylabel('y [m]')
ax.set_title('Projectile trajectory — components drive the motion independently')
ax.set_xlim(-1, max(x)+2);  ax.set_ylim(-0.5, max(y)+1)
ax.grid(True, alpha=0.3);  ax.axhline(0, color='brown', linewidth=1)
plt.tight_layout()
plt.show()`,
        },
        {
          cellTitle: 'Challenge — Vector Addition and Component Extraction',
          type: 'code',
          language: 'python',
          code: `# Challenge: vector operations
# ─────────────────────────────────────────────────────────
import numpy as np

# Three displacement vectors describing a hiker's path:
A = np.array([4.0,  0.0])   # 4 m east
B = np.array([0.0,  3.0])   # 3 m north
C = np.array([-1.5, 2.0])   # 1.5 m west, 2 m north

# Task 1: Compute the resultant displacement R = A + B + C.
R = # YOUR CODE HERE

# Task 2: Compute the magnitude |R| (straight-line distance from start to end).
mag_R = # YOUR CODE HERE

# Task 3: Compute the angle (degrees from east/+x) of R.
angle_R = # YOUR CODE HERE  (hint: np.degrees(np.arctan2(R[1], R[0])))

# Task 4: If the hiker needs to return directly to start,
#         what is the return vector D = -R?
D = # YOUR CODE HERE

print(f"Resultant R = {R}")
print(f"|R| = {mag_R:.3f} m")
print(f"Direction = {angle_R:.1f}° from east")
print(f"Return vector D = {D}")`,
          prose: [],
        },
      ],
    },
    matlab: {
      type: 'matlab',
      cells: [
        {
          cellTitle: 'Vectors in MATLAB — Column Vectors and Operations',
          type: 'code',
          language: 'matlab',
          prose: [
            `In MATLAB, vectors are naturally stored as column or row arrays. The \`norm()\` function computes magnitude. \`atan2d()\` gives the angle in degrees. All arithmetic operations work element-wise.`,
          ],
          code: `%% 2D vectors in MATLAB
A = [3; 4];    % column vector [Ax; Ay]  m/s
B = [1; -2];   % column vector

% Magnitude
magA = norm(A);
magB = norm(B);

% Direction angle (degrees from +x axis)
thetaA = atan2d(A(2), A(1));
thetaB = atan2d(B(2), B(1));

fprintf('A = [%.1f, %.1f],  |A| = %.3f,  θ_A = %.1f°\\n', A(1),A(2),magA,thetaA);
fprintf('B = [%.1f, %.1f],  |B| = %.3f,  θ_B = %.1f°\\n', B(1),B(2),magB,thetaB);

% Vector addition
R = A + B;
magR = norm(R);
thetaR = atan2d(R(2), R(1));
fprintf('R = A+B = [%.1f, %.1f],  |R| = %.3f,  θ_R = %.1f°\\n', R(1),R(2),magR,thetaR);

% Scalar multiplication
fprintf('2A = [%.1f, %.1f]\\n', 2*A(1), 2*A(2));

% Triangle inequality check
fprintf('|A|+|B| = %.3f >= |A+B| = %.3f  ✓\\n', magA+magB, magR);`,
        },
        {
          cellTitle: 'Projectile Motion Trajectory in MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Decompose a launch velocity into components, then propagate each component independently. The x-component has no acceleration; the y-component has −g. Plot the resulting parabola.`,
          ],
          code: `%% Projectile motion via vector decomposition
v0    = 25;     % m/s
theta = 37;     % degrees
g     = 9.8;    % m/s²

vx = v0 * cosd(theta);   % horizontal component  [m/s]
vy = v0 * sind(theta);   % vertical component    [m/s]

t_land = 2 * vy / g;     % time of flight
t = linspace(0, t_land, 300);

x = vx .* t;                           % no horizontal acceleration
y = vy .* t - 0.5 .* g .* t.^2;       % free fall in y

figure;
plot(x, y, 'b-', 'LineWidth', 2);
hold on;
yline(0, 'k-');
xlabel('x [m]');  ylabel('y [m]');
title(sprintf('Projectile: v₀=%.0fm/s, θ=%.0f°, range=%.1fm, max height=%.1fm', ...
    v0, theta, max(x), max(y)));
grid on;

% Draw velocity components at launch
scale = 0.5;
quiver(0, 0, vx*scale, vy*scale, 0, 'r', 'LineWidth', 2, 'MaxHeadSize', 2);
quiver(0, 0, vx*scale, 0,        0, 'm', 'LineWidth', 2, 'MaxHeadSize', 2);
quiver(vx*scale, 0, 0, vy*scale, 0, Color=[1 0.5 0], 'LineWidth', 2, 'MaxHeadSize', 2);

fprintf('vx = %.2f m/s,  vy = %.2f m/s\\n', vx, vy);
fprintf('Range = %.2f m,  Max height = %.2f m\\n', max(x), max(y));`,
        },
        {
          cellTitle: 'Challenge — Find the Resultant of Multiple Vectors',
          type: 'code',
          language: 'matlab',
          code: `%% Challenge: resultant of multiple force vectors
% ─────────────────────────────────────────────────────────
% Three forces act on an object:
F1 = [10; 0];     % 10 N east
F2 = [0;  8];     % 8 N north
F3 = [-3; -5];    % N

% Task 1: Compute the net force Fnet = F1 + F2 + F3.
Fnet = % YOUR CODE HERE

% Task 2: Compute the magnitude of Fnet.
mag_Fnet = % YOUR CODE HERE

% Task 3: Compute the direction angle (degrees from east).
theta_Fnet = % YOUR CODE HERE  % hint: atan2d(Fnet(2), Fnet(1))

% Task 4: For the object to be in equilibrium (net force = 0),
%         what fourth force F4 is needed?
F4 = % YOUR CODE HERE

fprintf('Fnet = [%.2f, %.2f] N\\n', Fnet(1), Fnet(2));
fprintf('|Fnet| = %.3f N\\n', mag_Fnet);
fprintf('Direction = %.1f° from east\\n', theta_Fnet);
fprintf('Equilibrium force F4 = [%.2f, %.2f] N\\n', F4(1), F4(2));`,
          prose: [],
        },
      ],
    },
  },

  misconceptions: [
    {
      id: 'p0-006-misc1',
      misconception: `"Adding vectors is the same as adding their magnitudes: |A + B| = |A| + |B|."`,
      reality: `This is only true when both vectors point in exactly the same direction. In general, |A + B| ≤ |A| + |B| (triangle inequality). When they point at an angle, components must be added separately and the Pythagorean theorem gives the resultant's magnitude. The direction of R depends on the angle between A and B, not just their sizes.`,
      whyItHappens: `Students treat magnitudes like regular numbers. Scalars add arithmetically; vectors add geometrically (head-to-tail, or component-wise).`,
    },
    {
      id: 'p0-006-misc2',
      misconception: `"A negative velocity means the object is slowing down."`,
      reality: `A negative velocity means the object is moving in the negative direction (as defined by the coordinate system). Slowing down means the speed (magnitude of velocity) is decreasing. An object with v = −10 m/s and a = −2 m/s² is speeding up (in the negative direction). Sign indicates direction, not rate of change.`,
      whyItHappens: `"Negative" in everyday language means "bad" or "less than zero" — associated with decrease. In physics, sign encodes direction, not change.`,
    },
    {
      id: 'p0-006-misc3',
      misconception: `"The components of a vector are smaller versions of it — they describe less motion."`,
      reality: `Components completely describe the vector — nothing is lost. The component Ax = A·cos(θ) is the full horizontal projection. Together, Ax and Ay contain all the information in A. You can reconstruct A = √(Ax² + Ay²) at angle θ = arctan(Ay/Ax). Components are not approximations; they are an equivalent representation.`,
      whyItHappens: `Students see the components as "pieces" and think the vector is somehow more complete. In fact, components are a different (often more useful) way to represent the same thing.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p0-006-tp1',
      prompt: `A ship's GPS shows it moving at 15 knots due east for 2 hours, then at 10 knots at 30° north of east for 3 hours. (a) Express each leg as a displacement vector in nautical miles. (b) Find the resultant displacement (magnitude and direction). (c) If the ship needs to return directly to port, what is the return heading and distance?`,
      targetConcept: 'Vector addition applied to navigation',
      hint: `1 nautical mile per hour × hours = nautical miles. Decompose each leg into components, add, find magnitude and angle.`,
    },
    {
      id: 'p0-006-tp2',
      prompt: `A structural engineer models a pin joint where three cables meet. Cable 1 pulls with 500 N at 0°, cable 2 with 300 N at 120°, cable 3 with 400 N at 240°. (a) Find the resultant force vector. (b) Is the joint in equilibrium? (c) If not, what force would restore equilibrium?`,
      targetConcept: 'Vector addition of forces in 2D; equilibrium condition',
      hint: `Decompose each cable force into (Fx, Fy) components, sum all Fx and all Fy separately, then find |Fnet|.`,
    },
  ],

  debugging: [
    {
      id: 'p0-006-dbg1',
      title: 'Adding magnitudes instead of components',
      scenario: `A student adds two vectors with magnitudes 5 and 12 (at 90° to each other) by writing R = 5 + 12 = 17.`,
      error: `Vector addition requires adding components, not magnitudes. Two perpendicular vectors of magnitude 5 and 12 have resultant magnitude √(5² + 12²) = √(169) = 13 — not 17.`,
      fix: `Decompose: A = (5, 0), B = (0, 12). R = A + B = (5, 12). |R| = √(25 + 144) = √169 = 13. Direction: arctan(12/5) ≈ 67.4° from A.`,
      prevention: `Never add vector magnitudes arithmetically unless they point in the same direction. Always work in components.`,
    },
    {
      id: 'p0-006-dbg2',
      title: 'Forgetting that negative sign means opposite direction, not smaller magnitude',
      scenario: `A student writes v = −5 m/s and concludes "the velocity is less than v = 3 m/s because −5 < 3."`,
      error: `Comparing velocities by comparing signed numbers as pure numbers is incorrect. v = −5 m/s has magnitude 5 m/s — the object is moving faster than something with v = 3 m/s. The sign only tells direction. Speed comparison uses |v| = 5 > 3.`,
      fix: `Speed = |v| = |−5| = 5 m/s > 3 m/s. The −5 object is moving faster (in the −x direction). Don't compare velocities numerically — compare their magnitudes for speed.`,
      prevention: `Separate speed (magnitude, always positive) from velocity (signed, encodes direction). When comparing "how fast", use speed (|v|), not velocity.`,
    },
  ],

  mastery: {
    targetLevel: `You can identify any quantity as a scalar or vector, decompose a 2D vector into x- and y-components using trigonometry, add vectors using head-to-tail or component methods, and reconstruct magnitude and direction from components.`,
    checklistItems: [
      `Classify any physics quantity as scalar (magnitude only) or vector (magnitude + direction)`,
      `Decompose a vector of magnitude |A| and angle θ into components: Ax = |A|cosθ, Ay = |A|sinθ`,
      `Add two or more vectors by summing components and finding resultant magnitude and direction`,
      `Explain why vector addition uses components — NOT adding magnitudes arithmetically`,
      `Interpret a negative velocity as direction, not deceleration`,
      `Reconstruct a vector from its components: |A| = √(Ax² + Ay²), θ = arctan(Ay/Ax)`,
    ],
    commonStruggles: [
      `Adding magnitudes directly — vectors require component addition, not arithmetic addition`,
      `Confusing negative velocity (direction) with decreasing speed`,
      `Applying trig to the wrong angle — always measure θ from the axis used in the problem`,
      `Forgetting to check quadrant when using arctan — arctan(Ay/Ax) has a ±180° ambiguity`,
    ],
    nextSteps: [
      `Chapter 1 (Vectors): full 3D vectors, dot product, cross product, unit vectors`,
      `Chapter 2 (Kinematics): 2D projectile motion uses vector decomposition at every step`,
      `Chapter 4 (Forces): Newton's Second Law F = ma is a vector equation`,
    ],
  },

  quiz: [
    {
      id: 'vec-q1',
      type: 'choice',
      text: 'Which quantity is a scalar?',
      options: ['Force', 'Displacement', 'Kinetic energy', 'Acceleration'],
      answer: 'Kinetic energy',
      hints: ['Energy has magnitude but no direction — it\'s a scalar. Force, displacement, and acceleration all have direction.'],
      reviewSection: 'Intuition — scalar vs vector',
    },
    {
      id: 'vec-q2',
      type: 'input',
      text: 'A vector has Ax = 3 and Ay = 4. What is its magnitude?',
      answer: '5',
      hints: ['√(9+16) = √25 = 5. Classic 3-4-5 right triangle.'],
      reviewSection: 'Math — magnitude formula',
    },
    {
      id: 'vec-q3',
      type: 'choice',
      text: 'A 5 N force points east and a 5 N force points north. What is the magnitude of the resultant?',
      options: ['10 N', '0 N', '5√2 ≈ 7.07 N', '5 N'],
      answer: '5√2 ≈ 7.07 N',
      hints: ['Perpendicular vectors: |R| = √(5²+5²) = √50 = 5√2.'],
      reviewSection: 'Examples — adding perpendicular vectors',
    },
    {
      id: 'vec-q4',
      type: 'input',
      text: 'A vector has magnitude 10 at angle 30°. What is its x-component? (Round to 2 decimal places.)',
      answer: '8.66',
      hints: ['Ax = 10·cos(30°) = 10·(√3/2) ≈ 10·0.866 = 8.66.'],
      reviewSection: 'Math — component formula',
    },
    {
      id: 'vec-q5',
      type: 'choice',
      text: 'What does the direction of the arrow represent in a vector diagram?',
      options: ['Speed', 'Direction of the physical quantity', 'Magnitude', 'Time elapsed'],
      answer: 'Direction of the physical quantity',
      hints: ['Length of arrow = magnitude. Direction the arrow points = physical direction.'],
      reviewSection: 'Intuition — arrows as vectors',
    },
    {
      id: 'vec-q6',
      type: 'input',
      text: 'Vectors A = (2, 5) and B = (3, −2). What is the x-component of A + B?',
      answer: '5',
      hints: ['Cx = Ax + Bx = 2 + 3 = 5.'],
      reviewSection: 'Math — component addition',
    },
    {
      id: 'vec-q7',
      type: 'choice',
      text: 'A 10 N force acts at 45°. Its x-component is:',
      options: ['10 N', '10/√2 ≈ 7.07 N', '5 N', '10·√2 ≈ 14.1 N'],
      answer: '10/√2 ≈ 7.07 N',
      hints: ['cos(45°) = √2/2 ≈ 0.707. Fx = 10 × 0.707 = 7.07 N.'],
      reviewSection: 'Math — trig values',
    },
    {
      id: 'vec-q8',
      type: 'choice',
      text: 'What is a unit vector?',
      options: [
        'A vector with unit [m/s]',
        'A vector with magnitude exactly 1 (dimensionless direction indicator)',
        'A vector pointing in the +x direction',
        'A vector that represents one unit of force',
      ],
      answer: 'A vector with magnitude exactly 1 (dimensionless direction indicator)',
      hints: ['Unit vectors encode direction only. They are obtained by dividing a vector by its magnitude.'],
      reviewSection: 'Math — unit vectors',
    },
  ],
}
