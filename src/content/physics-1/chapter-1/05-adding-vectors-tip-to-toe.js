export default {
  id: 'p1-ch1-005',
  slug: 'adding-vectors-graphically-tip-to-toe',
  chapter: 'p1',
  order: 5,
  title: 'Adding Vectors Graphically — Tip-to-Toe Method',
  subtitle: 'Chain arrows end-to-end; the shortcut from start to finish is the sum.',
  tags: ['vector addition', 'tip-to-toe', 'head-to-tail', 'triangle method', 'polygon method'],
  aliases: 'head to tail triangle rule polygon chain of vectors',

  hook: {
    question: `You walk 3 km east, then 4 km north, then 2 km at 30°. What single displacement takes you from start to finish?`,
    realWorldContext: `Navigation, animation rigs, robot arm kinematics — any time you chain a sequence of moves, you need the tip-to-toe method. It scales to any number of vectors, unlike the parallelogram which only handles two at a time.`,
    previewVisualizationId: 'SVGDiagram',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (6 of 21) Adding Vectors Graphically — Tip-to-Toe Method',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'The **tip-to-toe** (head-to-tail) method: place the tail of $\\vec{B}$ at the tip of $\\vec{A}$. The resultant $\\vec{R}$ is the arrow from the tail of $\\vec{A}$ to the tip of $\\vec{B}$. It is the "shortcut" that replaces the whole journey.',
      'The method generalises immediately to any number of vectors: $\\vec{R} = \\vec{A} + \\vec{B} + \\vec{C} + \\cdots$ — chain them in sequence and draw the closing arrow. The order does not matter: the closing arrow is the same regardless of the sequence you chain them in.',
      'The key difference from the parallelogram method: vectors are placed **tip-to-tail** (not tail-to-tail). You lose the visual symmetry of the parallelogram but gain the ability to add three or more vectors at once.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Tip-to-toe rule',
        body:
          'Place vectors in a chain, each tail touching the previous tip. The resultant goes from the first tail to the last tip.',
      },
      {
        type: 'insight',
        title: 'Order independence',
        body:
          '$\\vec{A}+\\vec{B}+\\vec{C} = \\vec{B}+\\vec{A}+\\vec{C} = \\vec{C}+\\vec{A}+\\vec{B}$. Rearranging the chain changes the path but not the endpoint.',
      },
      {
        type: 'warning',
        title: 'Tip-to-toe ≠ tail-to-tail',
        body:
          'In the parallelogram method, tails are shared. In tip-to-toe, each tail connects to the previous tip. Mixing these up is the most common graphical error.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Chain arrows end-to-end',
        caption: 'Place the tail of B⃗ at the tip of A⃗, then the tail of C⃗ at the tip of B⃗. The shortcut from first tail to last tip is R⃗. The path shape changes with order; the endpoint never does.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Tip-to-toe chain — 3 vectors',
        caption: `Place the tail of $\\vec{B}$ at the tip of $\\vec{A}$, then $\\vec{C}$ at the tip of $\\vec{B}$. The resultant $\\vec{R}$ is the arrow from the very first tail to the very last tip — the shortcut. The path shape changes with order; the endpoint never does.`,
      },
    ],
  },

  math: {
    prose: [
      'For $n$ vectors, the resultant is found by summing each set of components independently:',
      'This is why component methods (Lesson 6) are the practical tool: the graphical method gives insight, but arithmetic gives precision.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sum of n vectors',
        body:
          '\\vec{R} = \\sum_{k=1}^{n} \\vec{v}_k \\implies R_x = \\sum_{k=1}^n v_{kx},\\quad R_y = \\sum_{k=1}^n v_{ky}',
      },
      {
        type: 'insight',
        title: 'Closing the polygon',
        body:
          'If $\\vec{R} = \\vec{0}$, the tip of the last vector lands exactly on the tail of the first. The vectors form a closed polygon — this is the condition for static equilibrium.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Reorder the chain — same resultant',
        caption: `$R_x = \\sum v_{kx}$ and $R_y = \\sum v_{ky}$ are independent of order because real-number addition is commutative. Two different chain orderings, same closing arrow.`,
      },
    ],
  },

  rigor: {
    prose: [
      'Vector addition is both **commutative** ($\\vec{A}+\\vec{B}=\\vec{B}+\\vec{A}$) and **associative** ($(\\vec{A}+\\vec{B})+\\vec{C}=\\vec{A}+(\\vec{B}+\\vec{C})$). Together these two properties mean the order and grouping of a chain of vectors is irrelevant.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Commutativity of vector addition',
        body: '\\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}',
      },
      {
        type: 'theorem',
        title: 'Associativity of vector addition',
        body: '(\\vec{A}+\\vec{B})+\\vec{C} = \\vec{A}+(\\vec{B}+\\vec{C})',
      },
    ],
    proofSteps: [
      {
        expression: '\\vec{A} + \\vec{B} = (A_x+B_x,\\;A_y+B_y)',
        annotation: 'Component addition is the fundamental definition. We will show that swapping the order results in the same vector.',
      },
      {
        expression: '\\vec{B} + \\vec{A} = (B_x+A_x,\\;B_y+A_y)',
        annotation: 'Applying the same definition with A and B exchanged. The chain on the right diagram follows the B then A path.',
      },
      {
        expression: 'A_x+B_x = B_x+A_x \\quad \\text{and} \\quad A_y+B_y = B_y+A_y',
        annotation: 'Ordinary real-number addition is commutative. Each component satisfy this property independently.',
      },
      {
        expression: '\\therefore \\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}',
        annotation: 'Vector addition is commutative because it reduces to adding real numbers component-by-component, which is itself commutative. Both paths end at the same point.',
      },
    ],
    title: 'Proof: vector addition is commutative',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Commutativity — two chains, same endpoint',
        caption: `Left chain: $\\vec{A}$ then $\\vec{B}$. Right chain: $\\vec{B}$ then $\\vec{A}$. Both arrive at the same point $\\vec{A}+\\vec{B}$.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-005-ex1',
      title: 'Three-vector chain',
      problem:
        '\\text{Displacements: } \\vec{A}=3\\,\\text{km east},\\; \\vec{B}=4\\,\\text{km north},\\; \\vec{C}=2\\,\\text{km at }30°. \\text{Find the resultant.}',
      steps: [
        { expression: 'A_x=3,\\;A_y=0', annotation: 'East → positive x.' },
        { expression: 'B_x=0,\\;B_y=4', annotation: 'North → positive y.' },
        { expression: 'C_x=2\\cos30°=\\sqrt{3}\\approx1.73,\\;C_y=2\\sin30°=1.00', annotation: 'Decompose the angled vector.' },
        { expression: 'R_x=3+0+1.73=4.73\\,\\text{km},\\;R_y=0+4+1.00=5.00\\,\\text{km}', annotation: 'Sum components.' },
        { expression: '|\\vec{R}|=\\sqrt{4.73^2+5.00^2}=\\sqrt{22.37+25.00}=\\sqrt{47.37}\\approx6.88\\,\\text{km}', annotation: 'Resultant magnitude.' },
        { expression: '\\theta=\\arctan(5.00/4.73)\\approx46.6°\\text{ north of east}', annotation: 'Direction from +x axis.' },
      ],
      conclusion: 'The resultant displacement is $\\approx 6.88$ km at $46.6°$ north of east, regardless of the order you walk the three legs.',
    },
    {
      id: 'ch1-005-ex2',
      title: 'Zero resultant — closed polygon',
      problem:
        '\\text{Vectors } \\vec{A}=(3,0),\\;\\vec{B}=(0,4),\\;\\vec{C}=(-3,-4). \\text{ Show that } \\vec{A}+\\vec{B}+\\vec{C}=\\vec{0}.',
      steps: [
        { expression: 'R_x = 3+0+(-3) = 0', annotation: 'x-components sum to zero.' },
        { expression: 'R_y = 0+4+(-4) = 0', annotation: 'y-components sum to zero.' },
        { expression: '\\vec{R}=(0,0)=\\vec{0}\\;\\checkmark', annotation: 'The three vectors form a closed triangle — the tip of C⃗ returns exactly to the tail of A⃗.' },
      ],
      conclusion: 'When vectors form a closed polygon, their sum is zero. This is the graphical condition for equilibrium.',
    },
  ],

  challenges: [
    {
      id: 'ch1-005-ch1',
      difficulty: 'easy',
      problem: '\\text{A robot moves: 5 m east, then 5 m north, then 5 m west. What is the resultant displacement?}',
      hint: 'Sum the x-components and y-components separately.',
      walkthrough: [
        { expression: 'R_x = 5 + 0 + (-5) = 0\\,\\text{m}', annotation: 'East and west cancel.' },
        { expression: 'R_y = 0 + 5 + 0 = 5\\,\\text{m}', annotation: 'Only the north leg contributes vertically.' },
        { expression: '|\\vec{R}| = 5\\,\\text{m north}', annotation: 'The three-step journey is equivalent to a single 5 m step north.' },
      ],
      answer: '\\vec{R} = 5\\,\\text{m north}',
    },
    {
      id: 'ch1-005-ch2',
      difficulty: 'medium',
      problem: '\\text{Four forces act on a pin: 10 N east, 8 N at 90°, 6 N at 180°, 4 N at 270°. Find } \\vec{R}.',
      hint: '90° = north, 180° = west, 270° = south.',
      walkthrough: [
        { expression: 'R_x = 10+0+(-6)+0 = 4\\,N', annotation: 'East=+x, west=−x.' },
        { expression: 'R_y = 0+8+0+(-4) = 4\\,N', annotation: 'North=+y, south=−y.' },
        { expression: '|\\vec{R}|=\\sqrt{16+16}=4\\sqrt{2}\\approx5.66\\,N\\text{ at }45°', annotation: 'Equal x and y → 45°.' },
      ],
      answer: `|\\vec{R}| = 4\\sqrt{2}\\,N\\text{ at }45°\\text{ (NE)}`,
    },
  ],

  // ── Python Notebook ──────────────────────────────────────────────────────
  python: {
    title: 'Tip-to-Toe Addition in Python — chains of any length',
    description: `NumPy makes multi-vector addition trivial: just sum the arrays. We build on this to verify commutativity, detect equilibrium, and solve a navigation problem.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Tip-to-Toe Chain Lab',
        caption: 'Add three vectors, verify commutativity, and check the closed-polygon condition.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1 · Three-vector chain',
              prose: `Walk 3 km east, 4 km north, 2 km at 30°. Find the single displacement $\\vec{R}$ that replaces the whole trip.`,
              code: [
                'import numpy as np',
                '',
                'A = np.array([3.0, 0.0])                              # east',
                'B = np.array([0.0, 4.0])                              # north',
                'C = np.array([2*np.cos(np.radians(30)), 2*np.sin(np.radians(30))])  # 30°',
                '',
                'R = A + B + C',
                'print(f"A = {A}")',
                'print(f"B = {B}")',
                'print(f"C = {C.round(4)}")',
                'print(f"R = {R.round(4)}")',
                'print(f"|R| = {np.linalg.norm(R):.4f} km")',
                'print(f"θ   = {np.degrees(np.arctan2(R[1], R[0])):.2f}° north of east")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '2 · Commutativity — order does not change the resultant',
              prose: `$\\vec{A}+\\vec{B}+\\vec{C} = \\vec{C}+\\vec{A}+\\vec{B}$ — any permutation gives the same result. NumPy confirms this instantly.`,
              code: [
                'import itertools',
                'vectors = [A, B, C]',
                'labels  = ["A", "B", "C"]',
                '',
                'for perm in itertools.permutations(range(3)):',
                '    order = "".join(labels[i] for i in perm)',
                '    R_perm = sum(vectors[i] for i in perm)',
                '    print(f"{order}: R = {R_perm.round(6)}  |R| = {np.linalg.norm(R_perm):.6f}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '3 · Equilibrium — closed polygon',
              prose: `When vectors form a closed polygon their sum is $\\vec{0}$ — the condition for static equilibrium. Let us verify the example from the lesson.`,
              code: [
                'P = np.array([3.0, 0.0])',
                'Q = np.array([0.0, 4.0])',
                'S = np.array([-3.0, -4.0])',
                '',
                'total = P + Q + S',
                'print(f"P + Q + S = {total}")',
                'print(f"Equilibrium: {np.allclose(total, 0)}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: '4 · Challenge: four-force pin',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Resultant of four forces',
              difficulty: 'easy',
              prompt: `Four forces act on a pin: 10 N east, 8 N north, 6 N west, 4 N south. Find $\\vec{R}$, $|\\vec{R}|$, and $\\theta$.`,
              starterBlock: [
                'F1 = np.array([___, ___])   # east',
                'F2 = np.array([___, ___])   # north',
                'F3 = np.array([___, ___])   # west',
                'F4 = np.array([___, ___])   # south',
                'R = F1 + F2 + F3 + F4',
                'print(f"R = {R}")',
                'print(f"|R| = {np.linalg.norm(R):.4f} N")',
              ].join('\n'),
              code: [
                'F1 = np.array([10.0, 0.0])',
                'F2 = np.array([0.0, 8.0])',
                'F3 = np.array([-6.0, 0.0])',
                'F4 = np.array([0.0, -4.0])',
                'R = F1 + F2 + F3 + F4',
                'print(f"R = {R}")',
                'print(f"|R| = {np.linalg.norm(R):.4f} N")',
                'print(f"θ  = {np.degrees(np.arctan2(R[1], R[0])):.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "R" in dir(), "Define R"',
                'assert np.allclose(R, [4, 4], atol=0.01), f"R should be [4, 4], got {R}"',
                '"SUCCESS: R = (4, 4) N, |R| = 4√2 ≈ 5.66 N at 45°"',
              ].join('\n'),
              hint: `F1=[10,0], F2=[0,8], F3=[-6,0], F4=[0,-4]. R = [10-6, 8-4] = [4, 4]. |R| = 4√2.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-005-q1',
      question: `In the tip-to-toe method, where does the resultant arrow start and end?`,
      options: [
        `From the tip of the last vector to the tail of the first`,
        `From the tail of the first vector to the tip of the last`,
        `From the origin to the tip of the first vector`,
        `From the midpoint of the chain`,
      ],
      answer: 1,
      explanation: `The resultant is the "shortcut" from where you started (tail of $\\vec{A}$) to where you ended (tip of the last vector).`,
    },
    {
      id: 'p1-ch1-005-q2',
      question: `Why is tip-to-toe preferred over the parallelogram method when adding three or more vectors?`,
      options: [
        `It is more accurate`,
        `The parallelogram method only works for two vectors at a time`,
        `Tip-to-toe does not require components`,
        `Parallelogram is harder to draw`,
      ],
      answer: 1,
      explanation: `The parallelogram method produces a single resultant from exactly two vectors. Tip-to-toe chains any number in sequence.`,
    },
    {
      id: 'p1-ch1-005-q3',
      question: `Three vectors are added in two different orders and the resultants are compared. What must be true?`,
      options: [
        `They are always different`,
        `They are equal — vector addition is commutative and associative`,
        `Only the magnitudes match; directions differ`,
        `Results differ unless all vectors are parallel`,
      ],
      answer: 1,
      explanation: `Commutativity ($\\vec{A}+\\vec{B}=\\vec{B}+\\vec{A}$) and associativity guarantee the same result regardless of order or grouping.`,
    },
    {
      id: 'p1-ch1-005-q4',
      question: `When does the tip-to-toe diagram form a closed polygon?`,
      options: [
        `When all vectors have equal magnitudes`,
        `When the resultant is zero — the last tip returns to the first tail`,
        `When all vectors point in the same direction`,
        `When there are exactly three vectors`,
      ],
      answer: 1,
      explanation: `$\\vec{R} = \\vec{0}$ means the chain closes on itself — the condition for static equilibrium.`,
    },
    {
      id: 'p1-ch1-005-q5',
      question: `A robot walks 5 m east, 5 m north, 5 m west. What is the resultant displacement?`,
      options: [`$5\\sqrt{2}$ m NE`, `$5$ m north`, `$15$ m`, `$0$ m`],
      answer: 1,
      explanation: `$R_x = 5+0-5 = 0$, $R_y = 0+5+0 = 5$ m. The east and west legs cancel; only the 5 m north leg remains.`,
    },
    {
      id: 'p1-ch1-005-q6',
      question: `Displacements: $\\vec{A}=(3,0)$, $\\vec{B}=(0,4)$, $\\vec{C}=(-3,-4)$. What is $\\vec{A}+\\vec{B}+\\vec{C}$?`,
      options: [`$(6, 8)$`, `$(0, 0)$`, `$(3, 4)$`, `$(-3, -4)$`],
      answer: 1,
      explanation: `$R_x = 3+0-3=0$, $R_y = 0+4-4=0$. The three vectors form a closed triangle.`,
    },
    {
      id: 'p1-ch1-005-q7',
      question: `The resultant of $n$ vectors $\\vec{v}_1, \\ldots, \\vec{v}_n$ is:`,
      options: [
        `$|\\vec{v}_1| + |\\vec{v}_2| + \\cdots + |\\vec{v}_n|$`,
        `$(\\sum v_{kx})\\hat{i} + (\\sum v_{ky})\\hat{j}$`,
        `The magnitude of the longest vector`,
        `The average of all vectors`,
      ],
      answer: 1,
      explanation: `Vector addition is component-wise. Sum all $x$-components for $R_x$, all $y$-components for $R_y$.`,
    },
    {
      id: 'p1-ch1-005-q8',
      question: `What is the key difference between the tip-to-toe and parallelogram methods?`,
      options: [
        `Tip-to-toe requires trigonometry; parallelogram does not`,
        `Parallelogram places tails together; tip-to-toe places each tail at the previous tip`,
        `They are identical methods with different names`,
        `Parallelogram works for any number of vectors`,
      ],
      answer: 1,
      explanation: `Parallelogram: tails at the same point, diagonal is the sum. Tip-to-toe: chain tails to tips, closing arrow is the sum. Mixing these up is the most common graphical error.`,
    },
  ],
}
