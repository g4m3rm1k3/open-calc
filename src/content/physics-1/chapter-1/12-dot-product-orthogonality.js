export default {
  id: 'p1-ch1-012',
  slug: 'dot-product-orthogonality',
  chapter: 'p1',
  order: 12,
  title: 'Dot Product — Orthogonality',
  subtitle: 'Zero dot product = perpendicular vectors. The cleanest test in all of physics.',
  tags: ['dot product', 'orthogonality', 'perpendicular', 'zero work', 'normal vector'],
  aliases: 'orthogonal perpendicular dot product zero normal vector',

  hook: {
    question: 'Gravity pulls a block down the floor of a level table. How much work does gravity do? And why is the answer obvious once you think in vectors?',
    realWorldContext:
      `The normal force of a table always points perpendicular to the surface. The block's velocity along the surface is always perpendicular to the normal force. So the normal force does zero work — always — because perpendicular vectors have zero dot product. This is not a coincidence; it is a theorem. And the dot product test for perpendicularity is the simplest and most powerful tool for detecting it in any dimension.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'dot-product-projection' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (14 of 21) Dot Product: Orthogonality and Perpendicularity',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      // ── GEOMETRIC FACT ───────────────────────────────────────────────────
      `We know $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. When $\\phi = 90°$, $\\cos90° = 0$, so $\\vec{A}\\cdot\\vec{B} = 0$ exactly. This gives us the most important perpendicularity test in mathematics: **two non-zero vectors are perpendicular if and only if their dot product is zero**.`,

      // ── WHY THIS IS AMAZING ──────────────────────────────────────────────
      `Why is this powerful? Because you don't need to measure any angle. You don't need to sketch anything. You just compute $A_xB_x + A_yB_y + A_zB_z$ and check if it's zero. If it is: perpendicular. If it isn't: not perpendicular. This works in any dimension — even in 10-dimensional space where you can't draw a picture.`,

      // ── PHYSICS EXAMPLES ─────────────────────────────────────────────────
      'This shows up everywhere in physics:',
      '**Normal force ⊥ surface motion** → normal force does zero work on a sliding object.',
      `**Centripetal force ⊥ velocity** → centripetal force does zero work in circular motion. The speed stays constant — only the direction changes. This is exactly why.`,
      `**Magnetic force ⊥ velocity** → the magnetic force $\\vec{F} = q\\vec{v}\\times\\vec{B}$ is always perpendicular to $\\vec{v}$, so it changes direction but never speed.`,

      // ── FINDING ORTHOGONAL VECTORS ────────────────────────────────────────
      `A practical skill: **given $\\vec{A}$, find a vector perpendicular to it**. In 2D, the recipe is trivial: if $\\vec{A} = (A_x, A_y)$, then $\\vec{A}^\\perp = (-A_y, A_x)$ is always perpendicular to $\\vec{A}$. Verify: $\\vec{A}\\cdot\\vec{A}^\\perp = A_x(-A_y) + A_y(A_x) = -A_xA_y + A_xA_y = 0$. ✓ In 3D this becomes the cross product — the next chapter.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Orthogonality condition',
        body:
          '\\vec{A}\\perp\\vec{B} \\iff \\vec{A}\\cdot\\vec{B} = 0 \\quad (\\text{for non-zero }\\vec{A}, \\vec{B})',
      },
      {
        type: 'insight',
        title: 'The three regimes of the dot product',
        body:
          `$\\vec{A}\\cdot\\vec{B} > 0 \\Rightarrow$ acute angle ($\\phi < 90°$)\\n$\\vec{A}\\cdot\\vec{B} = 0 \\Rightarrow$ right angle ($\\phi = 90°$) — orthogonal\\n$\\vec{A}\\cdot\\vec{B} < 0 \\Rightarrow$ obtuse angle ($\\phi > 90°$)`,
      },
      {
        type: 'insight',
        title: 'Finding a perpendicular vector in 2D',
        body:
          `If $\\vec{A}=(A_x,A_y)$, then $(-A_y,\\,A_x)$ is perpendicular to $\\vec{A}$.\\n\\nCheck: $A_x(-A_y)+A_y(A_x)=0$ ✓. This is just a 90° rotation.`,
      },
      {
        type: 'warning',
        title: 'The zero vector is trivially orthogonal to everything',
        body:
          `$\\vec{0}\\cdot\\vec{B} = 0$ for any $\\vec{B}$. But we say vectors are orthogonal only when both are non-zero. The zero vector has no direction, so "perpendicular to zero" is meaningless geometrically.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Zero projection = zero dot product = perpendicular',
        caption:
          `When $\\phi = 90°$, the projection of $\\vec{B}$ onto $\\vec{A}$ has length zero. Dot product = (projection length) × |A| = 0. This is the exact algebraic test for perpendicularity.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Dot product crosses zero at 90°',
        caption: `Rotate one vector slowly through 360°. The dot product crosses zero at exactly 90° and 270°.`,
      },
    ],
  },

  math: {
    prose: [
      `To test if two vectors are orthogonal: compute $\\vec{A}\\cdot\\vec{B} = A_xB_x+A_yB_y+A_zB_z$. If the result is zero: orthogonal. If non-zero: not orthogonal.`,
      `To find a vector $\\vec{B}$ orthogonal to a given $\\vec{A}$: solve $\\vec{A}\\cdot\\vec{B} = 0$ as a constraint. In 2D this has a one-parameter family of solutions (all multiples of $(-A_y, A_x)$). In 3D there is a two-parameter family — a whole plane of perpendicular vectors.`,
      `The **normal vector** to a surface is the vector perpendicular to every vector lying in the surface. It points "out of" the surface. The dot product test confirms a given vector $\\vec{n}$ is normal to surface vector $\\vec{s}$: just check $\\vec{n}\\cdot\\vec{s}=0$.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Basis orthonormality',
        body:
          `\\hat{\\imath}\\cdot\\hat{\\jmath}=0,\\quad \\hat{\\jmath}\\cdot\\hat{k}=0,\\quad \\hat{k}\\cdot\\hat{\\imath}=0\\n\\hat{\\imath}\\cdot\\hat{\\imath}=1,\\quad \\hat{\\jmath}\\cdot\\hat{\\jmath}=1,\\quad \\hat{k}\\cdot\\hat{k}=1\\n\\nBasis vectors are orthonormal: mutually perpendicular (orthogonal) and each has magnitude 1 (normal).`,
      },
      {
        type: 'insight',
        title: 'Why does zero work matter so much?',
        body:
          `If $\\vec{F}\\perp\\vec{d}$, then $W = \\vec{F}\\cdot\\vec{d} = 0$ — the force does zero work, meaning it transfers no energy. This is why a satellite in circular orbit stays at constant altitude: gravity is always centripetal (toward centre), velocity is always tangential, they're perpendicular, so gravity does zero net work over one orbit.`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Orthogonality test — the zero dot product',
      caption: `$\\vec{A}\\cdot\\vec{B} = 0$ if and only if $\\vec{A}\\perp\\vec{B}$ (assuming neither is the zero vector). The projection of one onto the other is exactly zero — no overlap.`,
    }],
  },

  rigor: {
    prose: [
      `The basis $\\{\\hat{\\imath}, \\hat{\\jmath}, \\hat{k}\\}$ is called **orthonormal**: mutually orthogonal (dot products of different basis vectors = 0) and each normalised (dot product with itself = 1). This is written as $\\hat{e}_i \\cdot \\hat{e}_j = \\delta_{ij}$ where $\\delta_{ij}$ is the Kronecker delta: 1 if $i=j$, 0 otherwise.`,
      `Orthonormal bases make everything clean. When you expand a vector in an orthonormal basis, the components are extracted by taking dot products: $A_i = \\vec{A}\\cdot\\hat{e}_i$. You will use this constantly in Quantum Mechanics and Fourier Analysis.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Kronecker delta',
        body:
          `\\delta_{ij} = \\begin{cases} 1 & i=j \\\\ 0 & i\\neq j \\end{cases}\\n\\nSo $\\hat{e}_i\\cdot\\hat{e}_j = \\delta_{ij}$. This compact notation replaces all the $\\hat{\\imath}\\cdot\\hat{\\jmath}=0$ rules at once.`,
      },
      {
        type: 'insight',
        title: 'Extracting components using the dot product',
        body:
          `If $\\{\\hat{e}_i\\}$ is an orthonormal basis: $A_i = \\vec{A}\\cdot\\hat{e}_i$.\\n\\nThis is the general decomposition rule. For our standard basis: $A_x = \\vec{A}\\cdot\\hat{\\imath}$, $A_y = \\vec{A}\\cdot\\hat{\\jmath}$, etc.`,
      },
    ],
    proofSteps: [
      {
        title: 'Orthogonality means 90°',
        expression: '\\phi = 90° \\Rightarrow \\cos\\phi = 0',
        annotation: 'At 90°, the cosine is exactly zero.',
      },
      {
        title: 'Substitute into dot product formula',
        expression: '\\vec{A}\\cdot\\vec{B} = |A||B|\\cos90° = |A||B|\\times0 = 0',
        annotation: 'Zero cosine makes the entire dot product zero.',
      },
      {
        title: 'Component confirmation',
        expression: '\\vec{A}=(A_x,A_y),\\quad\\vec{A}^\\perp=(-A_y,A_x)',
        annotation: 'The 90° rotation formula gives a vector perpendicular to A.',
      },
      {
        title: 'Verify by dot product',
        expression: '\\vec{A}\\cdot\\vec{A}^\\perp = A_x(-A_y)+A_y(A_x) = -A_xA_y+A_xA_y = 0\\;\\checkmark',
        annotation: 'Dot product is exactly zero — confirmed perpendicular.',
      },
    ],
    title: 'Orthogonality: geometric fact, algebraic test',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Orthonormality of basis vectors',
      caption: `$\\hat{i}\\cdot\\hat{j} = 0$, $\\hat{i}\\cdot\\hat{k} = 0$, $\\hat{j}\\cdot\\hat{k} = 0$. The three basis vectors are mutually perpendicular — that is what "ortho-" means in orthonormal.`,
    }],
  },

  python: {
    title: 'Orthogonality Lab',
    description: 'Use the dot product to detect and construct perpendicular vectors.',
    placement: 'after_rigor',
    visualizations: [{
      id: 'PythonNotebook',
      title: 'Orthogonality Lab',
      mathBridge: 'Zero dot product = perpendicular, in any dimension.',
      caption: 'Run each cell top-to-bottom.',
      props: {
        initialCells: [
          {
            id: 1,
            cellTitle: '1 · Testing orthogonality',
            prose:
              `The test is simple: compute the dot product. If it's zero (within floating-point tolerance), the vectors are orthogonal.\n\nWe use \`np.isclose(dot, 0)\` instead of \`dot == 0\` because floating-point arithmetic introduces tiny rounding errors.`,
            code: [
              'import numpy as np',
              '',
              'def are_orthogonal(A, B, tol=1e-9):',
              '    """Return True if A and B are orthogonal."""',
              '    return np.isclose(np.dot(A, B), 0, atol=tol)',
              '',
              '# Test pairs',
              'pairs = [',
              '    (np.array([3, 4]), np.array([-4, 3]),   "(-4,3) rotated 90° from (3,4)"),',
              '    (np.array([1, 0]), np.array([0, 1]),    "i-hat and j-hat"),',
              '    (np.array([3, 4]), np.array([3, 4]),    "same vector"),',
              '    (np.array([1, 2, 3]), np.array([1, 1, -1]), "3D test"),',
              ']',
              '',
              'for A, B, label in pairs:',
              '    dot = np.dot(A, B)',
              '    print(f"{label}: dot = {dot:.4f}, orthogonal = {are_orthogonal(A, B)}")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },
          {
            id: 2,
            cellTitle: '2 · Constructing a perpendicular vector in 2D',
            prose:
              `The 90° rotation rule: if $\\vec{A} = (A_x, A_y)$, then $\\vec{A}^\\perp = (-A_y, A_x)$.\n\nLet's verify this for several vectors and plot the result.`,
            code: [
              'import matplotlib.pyplot as plt',
              '',
              'def perp_2d(A):',
              '    """Return a vector perpendicular to A in 2D."""',
              '    return np.array([-A[1], A[0]])',
              '',
              '# Test vectors',
              'test_vecs = [np.array([3, 4]), np.array([1, 0]), np.array([-2, 1])]',
              '',
              'for A in test_vecs:',
              '    Ap = perp_2d(A)',
              '    dot = np.dot(A, Ap)',
              '    print(f"A={A}, A⊥={Ap}, A·A⊥={dot:.4f}  ✓ (zero!)")',
              '',
              '# Quick plot',
              'fig, ax = plt.subplots(figsize=(5,5))',
              'ax.set_facecolor("#0a1628"); fig.patch.set_facecolor("#0a1628")',
              'ax.set_aspect("equal")',
              'colors = ["#ff4545", "#38b6ff", "#00c875"]',
              'A = np.array([3.0, 4.0])',
              'Ap = perp_2d(A)',
              'for v, c, label in [(A, "#ff4545", "A"), (Ap, "#38b6ff", "A⊥")]:',
              '    ax.annotate("", xy=(v[0], v[1]), xytext=(0,0),',
              '                arrowprops=dict(arrowstyle="->", color=c, lw=2.5))',
              '    ax.text(v[0]*1.1, v[1]*1.1, label, color=c, fontsize=13)',
              'ax.set_xlim(-6,6); ax.set_ylim(-6,6)',
              'ax.axhline(0, color="white", alpha=0.2); ax.axvline(0, color="white", alpha=0.2)',
              'ax.set_title("A and its perpendicular", color="white")',
              'ax.tick_params(colors="white")',
              'for sp in ax.spines.values(): sp.set_color("#1e2d3d")',
              'plt.tight_layout()',
              'plt.savefig("/tmp/perp.png", dpi=100, bbox_inches="tight", facecolor="#0a1628")',
              'plt.show()',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },
          {
            id: 3,
            cellTitle: '3 · Challenge: find k for orthogonality',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'Find the unknown component',
            difficulty: 'medium',
            prompt:
              `Find the value of \`k\` such that $\\vec{A} = (k, 3, -1)$ is orthogonal to $\\vec{B} = (2, -1, 4)$.\n\nSet up the equation \`np.dot(A, B) = 0\` with \`A[0] = k\` and solve for k.\n\nStore your answer as \`k_value\`.`,
            code: [
              '# Hint: np.dot([k, 3, -1], [2, -1, 4]) = 2k - 3 - 4 = 2k - 7',
              '# Set to zero and solve.',
              '# k_value = ...',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
            testCode: [
              'import numpy as np',
              'assert "k_value" in dir(), "Compute k_value"',
              'assert np.isclose(k_value, 3.5, atol=0.01), f"k_value should be 3.5, got {k_value}"',
              '# Verify: [3.5, 3, -1] · [2, -1, 4] = 7 - 3 - 4 = 0',
              'A_check = np.array([k_value, 3, -1])',
              'B_check = np.array([2, -1, 4])',
              'assert np.isclose(np.dot(A_check, B_check), 0, atol=1e-9), "dot product should be zero"',
              '"SUCCESS: k = 3.5. Verify: 2(3.5) + 3(-1) + (-1)(4) = 7 - 3 - 4 = 0 ✓"',
            ].join('\n'),
            hint:
              `np.dot([k, 3, -1], [2, -1, 4]) = 2k + 3(-1) + (-1)(4) = 2k - 3 - 4 = 2k - 7.\nSet 2k - 7 = 0, so k = 3.5.`,
          },
        ],
      },
    }],
  },

  examples: [
    {
      id: 'ch1-012-ex1',
      title: 'Check orthogonality',
      problem: '\\text{Are }\\vec{A}=(3,4)\\text{ and }\\vec{B}=(-4,3)\\text{ orthogonal?}',
      steps: [
        { expression: '\\vec{A}\\cdot\\vec{B}=(3)(-4)+(4)(3)=-12+12=0', annotation: 'Component dot product.' },
        { expression: 'Result = 0 \\Rightarrow \\vec{A}\\perp\\vec{B}', annotation: 'Zero dot product confirms perpendicularity.' },
      ],
      conclusion:
        `Yes, orthogonal. Note that $|\\vec{A}|=5$ and $|\\vec{B}|=5$ — both are 5. $(-4,3)$ is just $(3,4)$ rotated 90°.`,
    },
    {
      id: 'ch1-012-ex2',
      title: 'Normal force does zero work',
      problem:
        `\\text{A block slides along a horizontal floor with velocity }\\vec{v}=(4,0)\\,m/s. \\text{The normal force is }\\vec{N}=(0,98)\\,N. \\text{What power does the normal force deliver to the block?}`,
      steps: [
        {
          expression: 'P = \\vec{F}\\cdot\\vec{v} = \\vec{N}\\cdot\\vec{v} = (0)(4)+(98)(0) = 0\\,\\text{W}',
          annotation: 'Power = force · velocity. Normal force is perpendicular to velocity → zero power.',
        },
      ],
      conclusion:
        `$P=0\\,\\text{W}$. The normal force does zero work and delivers zero power — always, for any surface. This is why a table can hold up a block indefinitely without expending energy.`,
    },
  ],

  challenges: [
    {
      id: 'ch1-012-ch1',
      difficulty: 'easy',
      problem: '\\text{Find }k\\text{ such that }\\vec{A}=(k,2)\\text{ is orthogonal to }\\vec{B}=(3,-6).',
      hint: 'Set $\\vec{A}\\cdot\\vec{B}=0$: $3k+2(-6)=0$. Solve for $k$.',
      walkthrough: [
        { expression: '3k+2(-6)=3k-12=0', annotation: 'Dot product = 0 condition.' },
        { expression: 'k=4', annotation: 'So $(4,2)\\cdot(3,-6) = 12-12=0$ ✓.' },
      ],
      answer: 'k=4',
    },
    {
      id: 'ch1-012-ch2',
      difficulty: 'medium',
      problem:
        `\\text{A slope makes 30° with horizontal. The normal to the slope points at }120°.\\text{ A ball rolls down the slope with velocity at }210°.\\text{ Show the normal force does zero work.}`,
      hint:
        `Normal force $\\vec{N}$ is at 120°, velocity $\\vec{v}$ is at 210°. Angle between them = 210° − 120° = 90°. Check via dot product.`,
      walkthrough: [
        { expression: '\\hat{n}=(\\cos120°,\\sin120°)=(-0.5,\\;0.866)', annotation: 'Unit normal vector.' },
        { expression: '\\hat{v}=(\\cos210°,\\sin210°)=(-0.866,\\;-0.5)', annotation: 'Unit velocity vector.' },
        { expression: '\\hat{n}\\cdot\\hat{v}=(-0.5)(-0.866)+(0.866)(-0.5)=0.433-0.433=0', annotation: 'Dot product = 0 → orthogonal → zero work.' },
      ],
      answer: `\\vec{N}\\perp\\vec{v}\\Rightarrow W=0\\;\\forall\\text{ slopes}`,
    },
  ],

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-012-q1',
      question: `Two non-zero vectors are orthogonal if and only if:`,
      options: [`Their magnitudes are equal`, `Their dot product is zero`, `They point in opposite directions`, `One is a unit vector`],
      answer: 1,
      explanation: `$\\vec{A}\\perp\\vec{B} \\iff \\vec{A}\\cdot\\vec{B} = 0$. This is both necessary and sufficient for non-zero vectors.`,
    },
    {
      id: 'p1-ch1-012-q2',
      question: `$\\vec{A} = (3, -4)$ and $\\vec{B} = (4, 3)$. Are they orthogonal?`,
      options: [`No — their magnitudes are not equal`, `Yes — their dot product is zero`, `No — they are in Quadrant I`, `Yes — they are unit vectors`],
      answer: 1,
      explanation: `$\\vec{A}\\cdot\\vec{B} = (3)(4)+(-4)(3) = 12-12 = 0$. The vectors are perpendicular.`,
    },
    {
      id: 'p1-ch1-012-q3',
      question: `A table normal force $\\vec{N}$ acts perpendicular to a surface. A box slides along the surface with velocity $\\vec{v}$. How much work does $\\vec{N}$ do?`,
      options: [`$|N||v|$`, `$-|N||v|$`, `$0$`, `Depends on the speed`],
      answer: 2,
      explanation: `$W = \\vec{N}\\cdot\\vec{v} = |N||v|\\cos90° = 0$. Perpendicular vectors always have zero dot product — regardless of magnitudes or speed.`,
    },
    {
      id: 'p1-ch1-012-q4',
      question: `The basis vectors $\\hat{i}$, $\\hat{j}$, $\\hat{k}$ are "orthonormal". What does "ortho" mean?`,
      options: [`Each has magnitude 1`, `They are mutually perpendicular`, `They point along coordinate axes`, `They form a right-hand system`],
      answer: 1,
      explanation: `"Ortho" = perpendicular ($\\hat{i}\\cdot\\hat{j}=0$ etc.). "Normal" = unit magnitude ($|\\hat{i}|=1$ etc.). Both together = orthonormal.`,
    },
    {
      id: 'p1-ch1-012-q5',
      question: `For what value of $c$ is $(1, c)$ perpendicular to $(2, 3)$?`,
      options: [`$c = 3/2$`, `$c = -2/3$`, `$c = 2/3$`, `$c = -3/2$`],
      answer: 1,
      explanation: `$(1)(2)+(c)(3) = 0 \\Rightarrow 2 + 3c = 0 \\Rightarrow c = -2/3$.`,
    },
    {
      id: 'p1-ch1-012-q6',
      question: `Circular motion: an object moves in a circle at constant speed. The velocity $\\vec{v}$ and centripetal acceleration $\\vec{a}_c$ are always:`,
      options: [`Parallel`, `Antiparallel`, `Perpendicular`, `At 45°`],
      answer: 2,
      explanation: `The centripetal acceleration points toward the center (radially inward); the velocity is tangential (along the circle). They are perpendicular — so $\\vec{v}\\cdot\\vec{a}_c = 0$ and the centripetal force does zero work (speed does not change).`,
    },
    {
      id: 'p1-ch1-012-q7',
      question: `$\\vec{A}\\cdot\\vec{B} = 0$ and $\\vec{A} \\ne \\vec{0}$, $\\vec{B} \\ne \\vec{0}$. What can we conclude?`,
      options: [`$\\vec{A}$ and $\\vec{B}$ are equal`, `$\\vec{A}$ and $\\vec{B}$ are perpendicular`, `One is a scalar multiple of the other`, `Their magnitudes are equal`],
      answer: 1,
      explanation: `Zero dot product (with both vectors non-zero) means $\\cos\\phi = 0$, so $\\phi = 90°$ — perpendicular.`,
    },
    {
      id: 'p1-ch1-012-q8',
      question: `In $n$-dimensional space, how many mutually orthogonal unit vectors can you have?`,
      options: [`At most 2`, `Exactly $n$`, `At most $n$`, `Infinitely many`],
      answer: 1,
      explanation: `In $\\mathbb{R}^n$ you can have exactly $n$ mutually orthogonal unit vectors (an orthonormal basis). In $\\mathbb{R}^3$ that is exactly $\\{\\hat{i}, \\hat{j}, \\hat{k}\\}$.`,
    },
  ],
}
