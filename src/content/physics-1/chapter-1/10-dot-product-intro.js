export default {
  id: 'p1-ch1-010',
  slug: 'dot-product-intro',
  chapter: 'p1',
  order: 10,
  title: 'The Dot Product',
  subtitle: 'Multiply two vectors to get a number that measures how much they point in the same direction.',
  tags: ['dot product', 'scalar product', 'projection', 'work', 'alignment', 'cosine'],
  aliases: 'dot product scalar product inner product projection work energy alignment',

  hook: {
    question: 'You push a heavy box with 40 N — but at an angle. How much of that force is actually moving the box?',
    realWorldContext:
      `This is the core question behind the concept of **work** in physics. Only the component of force in the direction of motion does useful work. If you push perpendicular to the motion, you do zero work — no matter how hard you push. The dot product is the mathematical tool that extracts exactly this "component in a given direction." It appears in work ($W = \\vec{F}\\cdot\\vec{d}$), power ($P = \\vec{F}\\cdot\\vec{v}$), electric potential, magnetic flux, and almost every other "how much overlap is there?" question in physics.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'dot-product-projection' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (12 of 21) Product of Vectors: Dot Product: Scalar Product',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      // ── CORE IDEA ────────────────────────────────────────────────────────
      `The dot product answers this question: **how much of vector $\\vec{A}$ is in the direction of $\\vec{B}$?** The answer is a single number — a scalar, not a vector. That's why it's also called the **scalar product**.`,

      // ── PHYSICAL MOTIVATION ──────────────────────────────────────────────
      `Imagine you're pulling a suitcase on wheels. You grab the handle and pull at an angle $\\phi$ above the horizontal. The suitcase moves horizontally — it doesn't care about the vertical component of your pull. Only the horizontal part of your force does work. That horizontal component is $|\\vec{F}|\\cos\\phi$ — the magnitude of the force multiplied by the cosine of the angle. Multiply that by the distance moved, and you have the work done. That multiplication is the dot product: $W = \\vec{F}\\cdot\\vec{d} = |\\vec{F}||\\vec{d}|\\cos\\phi$.`,

      // ── THREE KEY CASES ──────────────────────────────────────────────────
      'Three cases to memorise:',
      '**Parallel** ($\\phi = 0°$): $\\cos0°=1$, so $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|$. Maximum overlap — the vectors point exactly the same way.',
      '**Perpendicular** ($\\phi = 90°$): $\\cos90°=0$, so $\\vec{A}\\cdot\\vec{B} = 0$. Zero overlap — the vectors are completely crosswise. A perpendicular force does zero work.',
      '**Anti-parallel** ($\\phi = 180°$): $\\cos180°=-1$, so $\\vec{A}\\cdot\\vec{B} = -|\\vec{A}||\\vec{B}|$. Maximum negative overlap — the vectors fight each other. Friction does negative work on a moving object.',

      // ── PROJECTION PICTURE ───────────────────────────────────────────────
      `The geometric picture: draw both vectors tail-to-tail. Drop a perpendicular from the tip of $\\vec{B}$ onto the line of $\\vec{A}$. The foot of that perpendicular is the **projection** of $\\vec{B}$ onto $\\vec{A}$. The dot product is: (length of that projection) × (magnitude of $\\vec{A}$). Or equivalently: (length of projection of $\\vec{A}$ onto $\\vec{B}$) × (magnitude of $\\vec{B}$). Both give the same number — the dot product is commutative.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Dot product — geometric definition',
        body:
          `\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi\\n\\nwhere $\\phi$ is the angle between the vectors measured tail-to-tail ($0 \\le \\phi \\le 180°$).`,
      },
      {
        type: 'insight',
        title: 'The result is always a scalar',
        body:
          `Two vectors go in, one number comes out. The "vector-ness" is consumed by the operation — there is no direction in the result. This is fundamentally different from multiplying a vector by a scalar (which gives a vector) and from the cross product (which gives a vector).`,
      },
      {
        type: 'definition',
        title: 'Three landmark cases',
        body:
          `\\phi = 0°:\\; \\vec{A}\\cdot\\vec{B} = |A||B| \\quad (\\text{maximum, parallel})\\n\\phi = 90°:\\; \\vec{A}\\cdot\\vec{B} = 0 \\quad\\quad (\\text{zero, perpendicular})\\n\\phi = 180°:\\; \\vec{A}\\cdot\\vec{B} = -|A||B| \\quad (\\text{minimum, anti-parallel})`,
      },
      {
        type: 'insight',
        title: 'Physics application: Work',
        body:
          `$W = \\vec{F}\\cdot\\vec{d} = |F||d|\\cos\\phi$ where $\\phi$ is the angle between force and displacement. If you push perpendicular to motion ($\\phi=90°$), you do zero work — the force transfers no energy. This is why a centripetal force (always perpendicular to motion in circular paths) does no work.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'The projection picture',
        caption:
          `Geometric meaning: $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. The dashed line is the perpendicular from $\\vec{B}$'s tip to $\\vec{A}$'s line. The foot is the projection of $\\vec{B}$ onto $\\vec{A}$. Dot product = (projection length) × |A|. When φ = 90°, projection = 0.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Dot product — projection and sign',
        caption: `Rotate one vector through 360°. The dot product is positive for acute angles ($\\phi < 90°$), zero at exactly 90°, and negative for obtuse angles ($\\phi > 90°$). The projection of $\\vec{B}$ onto $\\vec{A}$ is $|B|\\cos\\phi$.`,
      },
    ],
  },

  math: {
    prose: [
      `The geometric formula $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$ is elegant but requires knowing the angle between the vectors. There is an equivalent formula that works directly from components — no angle needed:`,
      '$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$ (in 2D)',
      '$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$ (in 3D)',
      `Multiply matching components and sum. That's the entire calculation. This works because the basis vectors $\\hat{\\imath}$, $\\hat{\\jmath}$, $\\hat{k}$ are orthonormal: $\\hat{\\imath}\\cdot\\hat{\\imath}=1$, $\\hat{\\jmath}\\cdot\\hat{\\jmath}=1$, $\\hat{k}\\cdot\\hat{k}=1$, and $\\hat{\\imath}\\cdot\\hat{\\jmath}=0$, etc. The cross-terms vanish and we're left with just the matching pairs.`,
      'Both formulas give the same number — and equating them is how we\'ll find the angle between any two vectors in the next lesson.',
      `A special case worth memorising: $\\vec{A}\\cdot\\vec{A} = |\\vec{A}|^2$. The dot product of a vector with itself equals its magnitude squared. This means $|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}}$ — another way to compute magnitude.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Dot product — component formula',
        body:
          `\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y \\;\\text{(2D)}\\n\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z \\;\\text{(3D)}`,
      },
      {
        type: 'theorem',
        title: 'Self-dot = magnitude squared',
        body: '\\vec{A}\\cdot\\vec{A} = A_x^2 + A_y^2 + A_z^2 = |\\vec{A}|^2',
      },
      {
        type: 'theorem',
        title: 'Properties (commutativity, distributivity)',
        body:
          `\\vec{A}\\cdot\\vec{B} = \\vec{B}\\cdot\\vec{A} \\quad \\text{(commutative)}\\n\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C} \\quad \\text{(distributive)}\\n(c\\vec{A})\\cdot\\vec{B} = c(\\vec{A}\\cdot\\vec{B}) \\quad \\text{(scalar associative)}`,
      },
      {
        type: 'warning',
        title: 'The dot product is NOT associative',
        body:
          `$(\\vec{A}\\cdot\\vec{B})\\cdot\\vec{C}$ is **undefined** — $\\vec{A}\\cdot\\vec{B}$ is a scalar, and you cannot dot a scalar with a vector. There is no "triple dot product" in the same way there is no "triple regular product".`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Dot Product Explorer — magnitudes and angles',
      caption: `$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y = |A||B|\\cos\\phi$. Maximum when fully aligned ($\\phi=0$); zero when perpendicular ($\\phi=90°$); minimum when anti-aligned ($\\phi=180°$).`,
    }],
  },

  rigor: {
    prose: [
      `The dot product is the unique bilinear form on $\\mathbb{R}^n$ that is symmetric and positive-definite. "Bilinear" means linear in each argument separately. "Symmetric" means $\\vec{A}\\cdot\\vec{B}=\\vec{B}\\cdot\\vec{A}$. "Positive-definite" means $\\vec{A}\\cdot\\vec{A}\\ge 0$ with equality only when $\\vec{A}=\\vec{0}$.`,
      `The dot product defines the notion of **angle** and **distance** in $\\mathbb{R}^n$. It is the inner product for the standard Euclidean space. In Linear Algebra you will generalise this to function spaces and complex vector spaces — but the physics intuition ("how much does one vector point in the direction of another?") remains exactly the same.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cauchy-Schwarz inequality',
        body:
          `|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|\\n\\nThe dot product can never exceed the product of the magnitudes. Equality holds when the vectors are parallel ($\\phi=0°$ or $\\phi=180°$). This follows directly from $|\\cos\\phi| \\le 1$.`,
      },
      {
        type: 'insight',
        title: 'The dot product is the inner product for Euclidean space',
        body:
          `All of Euclidean geometry — distances, angles, projections, perpendicularity — can be expressed using only the dot product. This is why the inner product is so central to Linear Algebra: it is the minimal structure needed to do geometry.`,
      },
    ],
    proofSteps: [
      {
        title: 'Geometric definition',
        expression: '\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi',
        annotation: 'Start from the geometric definition. We want to show this equals $A_xB_x + A_yB_y$.',
      },
      {
        title: 'Expand in unit vectors',
        expression: '\\vec{A}\\cdot\\vec{B} = (A_x\\hat{\\imath}+A_y\\hat{\\jmath})\\cdot(B_x\\hat{\\imath}+B_y\\hat{\\jmath})',
        annotation: 'Write both vectors in component form.',
      },
      {
        title: 'Distribute (FOIL)',
        expression:
          '= A_xB_x(\\hat{\\imath}\\cdot\\hat{\\imath}) + A_xB_y(\\hat{\\imath}\\cdot\\hat{\\jmath}) + A_yB_x(\\hat{\\jmath}\\cdot\\hat{\\imath}) + A_yB_y(\\hat{\\jmath}\\cdot\\hat{\\jmath})',
        annotation: 'Dot product distributes over addition — four terms.',
      },
      {
        title: 'Apply orthonormality of basis',
        expression: '\\hat{\\imath}\\cdot\\hat{\\imath}=1,\\quad \\hat{\\jmath}\\cdot\\hat{\\jmath}=1,\\quad \\hat{\\imath}\\cdot\\hat{\\jmath}=0',
        annotation: 'Basis vectors have magnitude 1 (so self-dot = 1) and are perpendicular (cross-dot = 0). Cross-terms vanish.',
      },
      {
        title: 'Result',
        expression: '\\therefore\\; \\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y',
        annotation:
          `The component formula follows. Both formulas produce the same number — use whichever is more convenient for the problem at hand.`,
      },
    ],
    title: 'Geometric = Component: The two dot product formulas agree',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Proof: geometric = component formula',
      caption: `Expanding $(A_x\\hat{i}+A_y\\hat{j})\\cdot(B_x\\hat{i}+B_y\\hat{j})$ and applying orthonormality ($\\hat{i}\\cdot\\hat{j}=0$, $\\hat{i}\\cdot\\hat{i}=1$) leaves only $A_xB_x + A_yB_y$. The two formulas are identical.`,
    }],
  },

  python: {
    title: 'Dot Product Lab — Work, Angles, and Projections in Code',
    description:
      `NumPy makes the dot product one line of code. We'll use it to compute work, check perpendicularity, and find angles — building up to a real solar panel efficiency calculator.`,
    placement: 'after_rigor',
    visualizations: [{
      id: 'PythonNotebook',
      title: 'Dot Product Lab',
      mathBridge: 'numpy.dot() implements the dot product exactly. Use it whenever you need "how much overlap."',
      caption: 'Run each cell top-to-bottom.',
      props: {
        initialCells: [

          // ── CELL 1: The two formulas ───────────────────────────────────
          {
            id: 1,
            cellTitle: '1 · Both dot product formulas in Python',
            prose:
              `There are two ways to compute the dot product. Both give the same answer:\n1. **Geometric**: \`|A| * |B| * cos(angle_between)\`\n2. **Component**: \`A[0]*B[0] + A[1]*B[1]\` or just \`np.dot(A, B)\`\n\nLet's verify they agree for two vectors at 60° apart.`,
            code: [
              'import numpy as np',
              '',
              '# Two vectors at 60° to each other',
              'A = np.array([4.0, 0.0])   # points right, magnitude 4',
              'B = np.array([3.0, 3*np.sqrt(3)])  # magnitude 6, at 60° from A',
              '',
              '# Method 1: geometric formula',
              'phi = np.radians(60)',
              'dot_geometric = np.linalg.norm(A) * np.linalg.norm(B) * np.cos(phi)',
              '',
              '# Method 2: component formula',
              'dot_component = A[0]*B[0] + A[1]*B[1]',
              '',
              '# Method 3: numpy shorthand (use this in practice)',
              'dot_numpy = np.dot(A, B)',
              '',
              'print(f"Geometric:  {dot_geometric:.4f}")',
              'print(f"Component:  {dot_component:.4f}")',
              'print(f"np.dot:     {dot_numpy:.4f}")',
              'print(f"All equal?  {np.allclose([dot_geometric, dot_component], dot_numpy)}")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },

          // ── CELL 2: Work ────────────────────────────────────────────────
          {
            id: 2,
            cellTitle: '2 · Computing work with the dot product',
            prose:
              `Work done by a force: $W = \\vec{F}\\cdot\\vec{d} = |F||d|\\cos\\phi$.\n\nA person pulls a crate with 60 N at 30° above horizontal. The crate moves 10 m horizontally. How much work is done?`,
            code: [
              '# Force vector: 60 N at 30° above horizontal',
              'F_mag = 60.0   # N',
              'F_angle = np.radians(30)',
              'F = np.array([F_mag * np.cos(F_angle), F_mag * np.sin(F_angle)])',
              '',
              '# Displacement vector: 10 m horizontal (no vertical component)',
              'd = np.array([10.0, 0.0])',
              '',
              '# Work = dot product',
              'W = np.dot(F, d)',
              '',
              'print(f"Force:       {F} N")',
              'print(f"Displacement:{d} m")',
              'print(f"Work done:   {W:.2f} J")',
              '',
              '# Sanity check: only the horizontal part of F does work',
              'F_horizontal = F[0]   # x-component',
              'W_check = F_horizontal * d[0]',
              'print(f"Check (F_x * d_x): {W_check:.2f} J  ✓")',
              '',
              '# What if force was perpendicular? (F pointing straight up)',
              'F_perp = np.array([0.0, 60.0])',
              'W_perp = np.dot(F_perp, d)',
              'print(f"\\nPerpendicular force work: {W_perp:.2f} J (zero — no work done!)")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },

          // ── CELL 3: CHALLENGE — work calculation ─────────────────────────
          {
            id: 3,
            cellTitle: '3 · Challenge: friction work',
            challengeType: 'fill-in',
            challengeNumber: 1,
            challengeTitle: 'Work done by friction',
            difficulty: 'easy',
            prompt:
              `A box slides 8 m to the right (displacement = (8, 0) m). Kinetic friction acts at 180° (opposing motion) with magnitude 25 N.\n\nCompute \`W_friction = np.dot(F_friction, d)\`. Friction should do **negative** work (it removes energy from the system).`,
            starterBlock: [
              'F_friction = np.array([___, ___])  # 25 N at 180°',
              'd_box = np.array([___, ___])        # 8 m to the right',
              'W_friction = np.dot(___, ___)',
            ].join('\n'),
            code: [
              'F_friction = np.array([-25.0, 0.0])   # 25 N at 180° = pointing left',
              'd_box = np.array([8.0, 0.0])           # 8 m to the right',
              'W_friction = np.dot(F_friction, d_box)',
              'print(f"Friction force: {F_friction} N")',
              'print(f"Displacement:  {d_box} m")',
              'print(f"Work by friction: {W_friction:.1f} J")',
              'print("Negative work = friction removes kinetic energy.")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
            testCode: [
              'import numpy as np',
              'assert "W_friction" in dir(), "Compute W_friction"',
              'assert np.isclose(W_friction, -200.0, atol=0.1), f"W_friction should be -200 J, got {W_friction:.1f} J"',
              '"SUCCESS: W_friction = -200 J. Friction does negative work — it removes 200 J of kinetic energy."',
            ].join('\n'),
            hint:
              `F_friction = np.array([-25.0, 0.0])  — friction points LEFT (at 180°), so x-component is negative.\nd_box = np.array([8.0, 0.0])  — displacement is to the right.\nW_friction = np.dot(F_friction, d_box) = (-25)(8) + (0)(0) = -200 J.`,
          },

          // ── CELL 4: Three landmark cases ─────────────────────────────────
          {
            id: 4,
            cellTitle: '4 · The three landmark cases visualised',
            prose:
              'Let\'s verify the three landmark cases: parallel, perpendicular, and anti-parallel.',
            code: [
              'A = np.array([5.0, 0.0])   # Reference vector, magnitude 5',
              '',
              '# Case 1: Parallel (angle = 0°)',
              'B_parallel = np.array([3.0, 0.0])  # same direction',
              '',
              '# Case 2: Perpendicular (angle = 90°)',
              'B_perp = np.array([0.0, 4.0])  # at right angles',
              '',
              '# Case 3: Anti-parallel (angle = 180°)',
              'B_anti = np.array([-6.0, 0.0])  # opposite direction',
              '',
              'cases = [("Parallel (0°)", B_parallel),',
              '         ("Perpendicular (90°)", B_perp),',
              '         ("Anti-parallel (180°)", B_anti)]',
              '',
              'for name, B in cases:',
              '    dot = np.dot(A, B)',
              '    expected = "|A||B|" if dot > 0 else ("0" if np.isclose(dot, 0) else "-|A||B|")',
              '    print(f"{name:25s}: A·B = {dot:6.1f}  ({expected})")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },

          // ── CELL 5: CHALLENGE — solar panel efficiency ────────────────────
          {
            id: 5,
            cellTitle: '5 · Challenge: solar panel power output',
            challengeType: 'write',
            challengeNumber: 2,
            challengeTitle: 'Optimal solar panel angle',
            difficulty: 'medium',
            prompt:
              `A solar panel has a **normal vector** (the vector pointing perpendicular to its surface). The power it generates is proportional to $\\hat{n}\\cdot\\hat{s}$ where $\\hat{n}$ is the unit normal and $\\hat{s}$ is the unit vector pointing toward the sun.\n\nThe sun is at 40° above the horizon. Compute the efficiency for three panel orientations:\n1. Flat panel: normal points straight up → $\\hat{n}_1 = (0, 1)$\n2. Tilted 40°: normal points at 40° from vertical → $\\hat{n}_2 = (\\sin40°, \\cos40°)$  (should give max = 1.0)\n3. Tilted 80°: $\\hat{n}_3 = (\\sin80°, \\cos80°)$\n\nStore results in \`efficiencies\` (a list of 3 floats). The "tilted 40°" panel should give efficiency 1.0.`,
            code: [
              '# The sun\'s direction: 40° above horizon',
              'sun_angle = np.radians(40)',
              '# sun_hat = unit vector pointing toward the sun',
              '# ...',
              '',
              '# Panel normals',
              '# n1 = flat panel: straight up',
              '# n2 = tilted 40°: normal at 40° from vertical',
              '# n3 = tilted 80°: normal at 80° from vertical',
              '',
              '# Compute efficiency = dot(n_hat, sun_hat) for each',
              '# efficiencies = [...]',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
            testCode: [
              'import numpy as np',
              'assert "efficiencies" in dir(), "Compute efficiencies list"',
              'assert len(efficiencies) == 3, "efficiencies should have 3 values"',
              '# Flat panel efficiency',
              'expected_flat = np.cos(np.radians(40))   # ~0.766',
              'assert np.isclose(efficiencies[0], expected_flat, atol=0.01), f"Flat panel: expected {expected_flat:.3f}, got {efficiencies[0]:.3f}"',
              '# Tilted 40° should give 1.0 (perfect alignment)',
              'assert np.isclose(efficiencies[1], 1.0, atol=0.01), f"40° tilt: should be 1.0, got {efficiencies[1]:.3f}"',
              '# Tilted 80°',
              'expected_80 = np.cos(np.radians(40))  # same efficiency as flat by symmetry',
              '"SUCCESS: Solar panel efficiency computed. The panel tilted to match the sun\'s elevation angle gives 100% efficiency. Dot product = power extraction!"',
            ].join('\n'),
            hint:
              `sun_hat = np.array([np.cos(sun_angle), np.sin(sun_angle)]).\nn1 = np.array([0, 1]).\nn2 = np.array([np.sin(np.radians(40)), np.cos(np.radians(40))])  — tilted 40° from vertical.\nefficiency_i = np.dot(n_i, sun_hat).\nWhen the normal exactly faces the sun, dot product = 1 (cos 0° = 1).`,
          },
        ],
      },
    }],
  },

  examples: [
    {
      id: 'ch1-010-ex1',
      title: 'Dot product from magnitudes and angle',
      problem: '|\\vec{A}|=5,\\; |\\vec{B}|=8,\\; \\phi=60°.\\text{ Find }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        {
          expression: '\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi = 5\\times8\\times\\cos60°',
          annotation: 'Apply the geometric definition. $\\cos60°=0.5$ exactly.',
        },
        {
          expression: '\\vec{A}\\cdot\\vec{B} = 40\\times0.5 = 20',
          annotation: 'The vectors are at a 60° angle — their dot product is half the product of their magnitudes.',
        },
      ],
      conclusion: '$\\vec{A}\\cdot\\vec{B} = 20$. Positive because the angle is acute (less than 90°).',
    },
    {
      id: 'ch1-010-ex2',
      title: 'Work done by a force',
      problem:
        '\\text{A force } \\vec{F}=(6,\\,-3)\\,\\text{N acts as an object moves along } \\vec{d}=(2,\\,5)\\,\\text{m. Find the work done.}',
      steps: [
        {
          expression: 'W = \\vec{F}\\cdot\\vec{d} = F_xd_x + F_yd_y',
          annotation: 'Work is the dot product of force and displacement.',
        },
        {
          expression: 'W = (6)(2) + (-3)(5) = 12 - 15 = -3\\,\\text{J}',
          annotation:
            `Negative work! The $y$-component of force $(−3\\,N)$ opposes the $y$-component of displacement $(+5\\,m)$. The force takes more energy from the $y$-direction than it adds in the $x$-direction.`,
        },
      ],
      conclusion:
        `$W=-3\\,\\text{J}$. The force does negative work — it removes kinetic energy from the object. The negative sign tells you the force and displacement are more anti-aligned than aligned.`,
    },
    {
      id: 'ch1-010-ex3',
      title: 'Checking the sign',
      problem:
        '\\text{Vectors }\\vec{A}=(3,4)\\text{ and }\\vec{B}=(-1,2).\\text{ Without computing, predict the sign of }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        {
          expression: '\\vec{A}\\text{ points into Quadrant I (northeast). }\\vec{B}\\text{ points into Quadrant II (northwest-ish).}',
          annotation: 'Sketch both vectors. $\\vec{A}$ has positive $x$ and $y$; $\\vec{B}$ has negative $x$ and positive $y$.',
        },
        {
          expression: '\\text{The angle between them is less than }90°\\text{? Let\'s check:}',
          annotation: 'Both vectors have positive $y$-components, so they\'re both in the upper half-plane. The angle between them is likely acute.',
        },
        {
          expression: '\\vec{A}\\cdot\\vec{B} = (3)(-1)+(4)(2) = -3+8 = +5',
          annotation: 'Positive result confirms: the angle is less than 90°. The $y$-term dominates and makes the dot product positive.',
        },
      ],
      conclusion:
        `$\\vec{A}\\cdot\\vec{B}=+5>0$. Acute angle. The strategy: sketch first, predict the sign, then compute to confirm.`,
    },
  ],

  challenges: [
    {
      id: 'ch1-010-ch1',
      difficulty: 'easy',
      problem: '\\text{Find }\\vec{A}\\cdot\\vec{B}\\text{ for }\\vec{A}=(3,-2)\\text{ and }\\vec{B}=(4,6).\\text{ Predict the sign first.}',
      hint: '$\\vec{A}$ points right and down; $\\vec{B}$ points right and up. The $y$-terms fight. Which component pair dominates?',
      walkthrough: [
        {
          expression: 'x\\text{-term: }3\\times4=+12,\\quad y\\text{-term: }(-2)\\times6=-12',
          annotation: 'Compute each term before summing.',
        },
        {
          expression: '\\vec{A}\\cdot\\vec{B} = 12+(-12) = 0',
          annotation: 'Zero dot product! The vectors are perpendicular — and neither is zero.',
        },
      ],
      answer: '\\vec{A}\\cdot\\vec{B}=0\\;\\Rightarrow\\;\\text{perpendicular}',
    },
    {
      id: 'ch1-010-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A rope pulls a crate at }40°\\text{ above horizontal with }80\\,\\text{N. The crate slides }5\\,\\text{m horizontally. Find the work done by the rope and by gravity.}',
      hint:
        'Rope work: $W = |F||d|\\cos40°$. Gravity acts downward, displacement is horizontal — what angle between them?',
      walkthrough: [
        {
          expression: 'W_{\\text{rope}} = 80\\times5\\times\\cos40°=400\\times0.766\\approx306\\,\\text{J}',
          annotation: 'Only the horizontal component of the rope force does work.',
        },
        {
          expression: '\\vec{F}_{\\text{gravity}}=(0,-mg)\\text{ and }\\vec{d}=(5,0)\\Rightarrow W_{\\text{gravity}}=0',
          annotation: 'Gravity is perpendicular to horizontal displacement. $\\cos90°=0$. Gravity does no work here.',
        },
      ],
      answer: 'W_{\\text{rope}}\\approx306\\,\\text{J},\\quad W_{\\text{gravity}}=0',
    },
    {
      id: 'ch1-010-ch3',
      difficulty: 'hard',
      problem:
        `\\text{A ball moves along the path }\\vec{d}=(3,4,0)\\,\\text{m while gravity acts as }\\vec{F}_g=(0,-mg,0)=(0,-49,0)\\,\\text{N } (m=5\\,\\text{kg}). \\text{Also, a horizontal force }\\vec{F}_h=(20,0,0)\\,\\text{N acts. Find the total work done.}`,
      hint: 'Total work = $W_g + W_h = \\vec{F}_g\\cdot\\vec{d} + \\vec{F}_h\\cdot\\vec{d} = (\\vec{F}_g+\\vec{F}_h)\\cdot\\vec{d}$.',
      walkthrough: [
        {
          expression: 'W_g = \\vec{F}_g\\cdot\\vec{d} = (0)(3)+(-49)(4)+(0)(0) = -196\\,\\text{J}',
          annotation: 'Gravity does negative work — the ball gains height (4 m upward component), so gravity takes away energy.',
        },
        {
          expression: 'W_h = \\vec{F}_h\\cdot\\vec{d} = (20)(3)+(0)(4)+(0)(0) = 60\\,\\text{J}',
          annotation: 'Horizontal force does positive work — it\'s partially aligned with the displacement.',
        },
        {
          expression: 'W_{\\text{total}} = -196+60 = -136\\,\\text{J}',
          annotation: 'Net work is negative — the ball loses kinetic energy (it\'s going uphill).',
        },
      ],
      answer: `W_{\\text{total}} = -136\\,\\text{J}`,
    },
  ],

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-010-q1',
      question: `The dot product $\\vec{A}\\cdot\\vec{B}$ produces:`,
      options: [`A vector perpendicular to both`, `A scalar (a number)`, `A unit vector`, `A vector in the same direction as $\\vec{A}$`],
      answer: 1,
      explanation: `The dot product (scalar product) takes two vectors and produces a single number — a scalar. This distinguishes it from the cross product.`,
    },
    {
      id: 'p1-ch1-010-q2',
      question: `$\\vec{A} = (3, 4)$ and $\\vec{B} = (4, -3)$. What is $\\vec{A}\\cdot\\vec{B}$?`,
      options: [`$25$`, `$0$`, `$7$`, `$-7$`],
      answer: 1,
      explanation: `$\\vec{A}\\cdot\\vec{B} = (3)(4) + (4)(-3) = 12 - 12 = 0$. The vectors are perpendicular!`,
    },
    {
      id: 'p1-ch1-010-q3',
      question: `Work is defined as $W = \\vec{F}\\cdot\\vec{d}$. If $\\vec{F}$ is perpendicular to $\\vec{d}$, the work done is:`,
      options: [`$|F||d|$`, `$-|F||d|$`, `$0$`, `$|F|+|d|$`],
      answer: 2,
      explanation: `$W = |F||d|\\cos90° = |F||d|(0) = 0$. A force perpendicular to motion does no work — no matter how large the force.`,
    },
    {
      id: 'p1-ch1-010-q4',
      question: `$\\vec{A}\\cdot\\vec{A} = ?$`,
      options: [`$1$`, `$|\\vec{A}|^2$`, `$0$`, `$2|\\vec{A}|$`],
      answer: 1,
      explanation: `$\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$. The angle between a vector and itself is 0°, so $\\cos0° = 1$.`,
    },
    {
      id: 'p1-ch1-010-q5',
      question: `The dot product is positive when the angle $\\phi$ between the vectors is:`,
      options: [`$\\phi > 90°$`, `$\\phi = 90°$`, `$\\phi < 90°$`, `Always`],
      answer: 2,
      explanation: `$\\cos\\phi > 0$ for $\\phi < 90°$ (acute). $\\cos\\phi = 0$ at $90°$. $\\cos\\phi < 0$ for $\\phi > 90°$ (obtuse).`,
    },
    {
      id: 'p1-ch1-010-q6',
      question: `Is $\\vec{A}\\cdot\\vec{B} = \\vec{B}\\cdot\\vec{A}$?`,
      options: [`No — order matters`, `Yes — the dot product is commutative`, `Only when vectors are parallel`, `Only in 2D`],
      answer: 1,
      explanation: `$A_xB_x + A_yB_y = B_xA_x + B_yA_y$. The dot product is commutative.`,
    },
    {
      id: 'p1-ch1-010-q7',
      question: `$(\\vec{A}\\cdot\\vec{B})\\cdot\\vec{C}$ is:`,
      options: [
        `A vector in the direction of $\\vec{C}$`,
        `Undefined — you cannot dot a scalar with a vector`,
        `Equal to $\\vec{A}\\cdot(\\vec{B}\\cdot\\vec{C})$`,
        `Always zero`,
      ],
      answer: 1,
      explanation: `$\\vec{A}\\cdot\\vec{B}$ is a scalar. Scalars cannot be dotted with vectors. The dot product is not associative in this sense.`,
    },
    {
      id: 'p1-ch1-010-q8',
      question: `The Cauchy-Schwarz inequality states $|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|$. When does equality hold?`,
      options: [
        `When $\\vec{A} = \\vec{B}$`,
        `When $\\vec{A}$ and $\\vec{B}$ are parallel (same or opposite directions)`,
        `When $\\vec{A}$ and $\\vec{B}$ are perpendicular`,
        `Always`,
      ],
      answer: 1,
      explanation: `Equality holds when $|\\cos\\phi| = 1$, i.e. $\\phi = 0°$ (same direction) or $\\phi = 180°$ (opposite). In both cases the vectors are parallel.`,
    },
  ],
}
