export default {
  id: 'p1-ch1-007',
  slug: 'subtracting-vectors-graphically',
  chapter: 'p1',
  order: 7,
  title: 'Subtracting Vectors Graphically',
  subtitle: 'A − B is just A + (−B). Flip the arrow, then add.',
  tags: ['vector subtraction', 'negative vector', 'graphical method', 'difference vector'],
  aliases: 'subtract vectors flip negate difference graphical',

  hook: {
    question: `A ball moves from velocity 4 m/s east to 3 m/s north. What is the change in velocity — and why is it not simply 1 m/s?`,
    realWorldContext: `Acceleration is defined as change in velocity: $\\vec{a} = \\Delta\\vec{v}/\\Delta t = (\\vec{v}_f - \\vec{v}_i)/\\Delta t$. Every acceleration, every force diagram, every relative velocity problem uses vector subtraction. Getting the direction of $\\vec{A} - \\vec{B}$ wrong is one of the most common physics errors.`,
    previewVisualizationId: 'SVGDiagram',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (9 of 21) Subtracting Vectors Graphically',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'Subtraction is not a new operation — it is addition in disguise. $\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})$. The negative of a vector $-\\vec{B}$ has the **same magnitude** as $\\vec{B}$ but points in the **opposite direction**. Graphically, you flip the arrow 180°.',
      'The two-step recipe: (1) draw $-\\vec{B}$ by reversing $\\vec{B}$; (2) add $\\vec{A}$ and $-\\vec{B}$ using any graphical method.',
      'There is a useful shortcut: if $\\vec{A}$ and $\\vec{B}$ share a common tail, then $\\vec{A} - \\vec{B}$ is the arrow **from the tip of $\\vec{B}$ to the tip of $\\vec{A}$**. This is the "tail-to-tail shortcut" and it is especially useful for finding $\\Delta\\vec{v}$ in kinematics.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Negative vector',
        body: '-\\vec{B}\\text{ has magnitude }|\\vec{B}|\\text{ and direction opposite to }\\vec{B}. In component form: }-\\vec{B} = (-B_x,\\,-B_y).',
      },
      {
        type: 'definition',
        title: 'Vector subtraction',
        body: '\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B}).',
      },
      {
        type: 'insight',
        title: 'Tail-to-tail shortcut',
        body: 'Place $\\vec{A}$ and $\\vec{B}$ with tails at the same point. Then $\\vec{A} - \\vec{B}$ is the arrow from the **tip of $\\vec{B}$** to the **tip of $\\vec{A}$**.',
      },
      {
        type: 'warning',
        title: '$\\vec{A} - \\vec{B} \\ne \\vec{B} - \\vec{A}$',
        body: 'Subtraction is not commutative. $\\vec{B} - \\vec{A}$ points in exactly the opposite direction from $\\vec{A} - \\vec{B}$.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Subtraction is addition in disguise',
        caption: 'A⃗ − B⃗ = A⃗ + (−B⃗). Step 1: flip B⃗ to get −B⃗ (same length, opposite direction). Step 2: chain A⃗ and −B⃗ tip-to-tail. The closing arrow is A⃗ − B⃗. Components: (A−B)ₓ = Aₓ − Bₓ, (A−B)y = Ay − By.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Flip-and-add vs tail-to-tail shortcut',
        caption: `Flip $\\vec{B}$ to get $-\\vec{B}$ (same length, opposite direction), then chain with $\\vec{A}$. Or: place tails together and draw from tip of $\\vec{B}$ to tip of $\\vec{A}$. Both give $\\vec{A} - \\vec{B}$.`,
      },
    ],
  },

  math: {
    prose: [
      'The change in velocity $\\Delta\\vec{v}$ is the most important application of vector subtraction. If an object moves from velocity $\\vec{v}_i$ to $\\vec{v}_f$, then:',
      'The magnitude $|\\Delta\\vec{v}|$ is **not** $|\\vec{v}_f| - |\\vec{v}_i|$ (scalar difference). It is the magnitude of the vector difference, computed with the Pythagorean theorem or law of cosines. This distinction is the source of countless errors in kinematics problems.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Change in velocity',
        body: '\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i = \\vec{v}_f + (-\\vec{v}_i)',
      },
      {
        type: 'warning',
        title: '|Δv⃗| ≠ |v⃗_f| − |v⃗_i|',
        body: 'The magnitude of the velocity change is not the scalar difference of the speeds. Example: 3 m/s north minus 4 m/s east is not 1 m/s — it is 5 m/s at 143°.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: `Δv⃗ = v⃗_f − v⃗_i`,
        caption: `$\\Delta\\vec{v}$ points from the tip of $\\vec{v}_i$ to the tip of $\\vec{v}_f$ when tails are shared. Its magnitude is NOT $|\\vec{v}_f| - |\\vec{v}_i|$ — it is $|\\vec{v}_f - \\vec{v}_i|$.`,
      },
    ],
  },

  rigor: {
    prose: [
      'Formally, $-\\vec{B}$ is the additive inverse of $\\vec{B}$ in the vector space $\\mathbb{R}^n$: it is the unique vector such that $\\vec{B} + (-\\vec{B}) = \\vec{0}$. The existence of additive inverses is one of the eight axioms defining a vector space.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Additive inverse',
        body: '-\\vec{B} \\text{ is defined by } \\vec{B} + (-\\vec{B}) = \\vec{0}. \\text{ In components: } -(B_x, B_y) = (-B_x, -B_y).',
      },
      {
        type: 'insight',
        title: 'Why flip gives the inverse',
        body: 'Adding $\\vec{B}$ and $-\\vec{B}$ produces a zero resultant: $B_x + (-B_x) = 0$ and $B_y + (-B_y) = 0$. Geometrically: the two equal-length, opposite arrows cancel exactly.',
      },
    ],
    proofSteps: [
      {
        title: "Define subtraction",
        expression: "\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})",
        annotation: "Subtraction is not a new operation. It's addition of the additive inverse. Everything we know about addition applies.",
      },
      {
        title: "Negate B⃗ component-wise",
        expression: "-\\vec{B} = (-B_x, -B_y)",
        annotation: "Flipping all signs gives a vector of the same length pointing in the opposite direction.",
      },
      {
        title: "Apply component addition",
        expression: "\\vec{A} + (-\\vec{B}) = (A_x+(-B_x), A_y+(-B_y))",
        annotation: "Component-wise. This is the definition of addition, applied to A and -B.",
      },
      {
        title: "Simplify",
        expression: "= (A_x-B_x, A_y-B_y)",
        annotation: "Vector subtraction reduces to scalar subtraction on each component axis. Clean and exact.",
      },
      {
        title: "Tail-to-tail geometric shortcut",
        expression: "\\text{Place tails at } \\mathbf{0} \\implies \\vec{A}-\\vec{B} \\text{ goes from } \\text{tip}(B) \\text{ to } \\text{tip}(A)",
        annotation: "The geometric shortcut follows directly: the arrow from tip of B to tip of A has exactly the components $(A_x-B_x, A_y-B_y)$.",
      },
    ],
    title: 'Proof: subtraction by component and by the tail-to-tail shortcut',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Subtraction proof — flip then add',
        caption: `Step 1: $\\vec{A}-\\vec{B}=\\vec{A}+(-\\vec{B})$. Step 2: $-\\vec{B}=(-B_x,-B_y)$. Step 3: chain $\\vec{A}$ and $-\\vec{B}$. Step 4: closing arrow has components $(A_x-B_x, A_y-B_y)$.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-007-ex1',
      title: 'Graphical: A⃗ − B⃗ by flip-and-add',
      problem: '\\vec{A} = 5\\,\\text{cm east},\\;\\vec{B} = 3\\,\\text{cm north. Find }\\vec{A}-\\vec{B}\\text{ graphically.}',
      steps: [
        { expression: '-\\vec{B} = 3\\,\\text{cm south}', annotation: 'Flip B⃗ → −B⃗ points south.' },
        { expression: '\\text{Chain: } \\vec{A}\\text{ then }-\\vec{B} \\Rightarrow \\text{resultant from start to end}', annotation: 'Tip-to-toe of A⃗ and −B⃗.' },
        { expression: '|\\vec{A}-\\vec{B}| = \\sqrt{5^2+3^2} = \\sqrt{34} \\approx 5.83\\,\\text{cm}', annotation: 'Magnitude by Pythagoras (perpendicular components).' },
        { expression: '\\theta = \\arctan(-3/5) \\approx -31°\\text{ (i.e. 31° south of east)}', annotation: 'Direction: east component 5, south component 3.' },
      ],
      conclusion: '$\\vec{A}-\\vec{B} \\approx 5.83$ cm at 31° south of east.',
    },
    {
      id: 'ch1-007-ex2',
      title: 'Change in velocity',
      problem: '\\text{A car changes velocity from }\\vec{v}_i=30\\,\\text{m/s east to }\\vec{v}_f=40\\,\\text{m/s north. Find }\\Delta\\vec{v}.',
      steps: [
        { expression: '-\\vec{v}_i = 30\\,\\text{m/s west}', annotation: 'Negate the initial velocity.' },
        { expression: '\\Delta\\vec{v} = \\vec{v}_f + (-\\vec{v}_i) = 40\\,\\text{m/s north} + 30\\,\\text{m/s west}', annotation: 'Add tip-to-toe.' },
        { expression: '|\\Delta\\vec{v}| = \\sqrt{40^2+30^2} = 50\\,\\text{m/s}', annotation: '3-4-5 triple scaled by 10.' },
        { expression: '\\theta = 180° - \\arctan(40/30) \\approx 180°-53.1° = 126.9°', annotation: 'West component negative → Quadrant II. Angle from +x axis (east).' },
      ],
      conclusion: '$|\\Delta\\vec{v}| = 50$ m/s at $\\approx 127°$ (northwest direction). The speed change was $|40-30|=10$ m/s — but the velocity change was 50 m/s. Very different.',
    },
  ],

  challenges: [
    {
      id: 'ch1-007-ch1',
      difficulty: 'easy',
      problem: '\\vec{A}=(5,2),\\;\\vec{B}=(2,5).\\text{ Find }\\vec{A}-\\vec{B}\\text{ and }\\vec{B}-\\vec{A}.\\text{ What is the relationship?}',
      hint: 'Subtract component-wise. Compare the two results.',
      walkthrough: [
        { expression: '\\vec{A}-\\vec{B}=(5-2,\\;2-5)=(3,-3)', annotation: 'Component subtraction.' },
        { expression: '\\vec{B}-\\vec{A}=(2-5,\\;5-2)=(-3,3)', annotation: 'Swap order.' },
        { expression: '\\vec{B}-\\vec{A} = -(\\vec{A}-\\vec{B})', annotation: 'The two results are negatives of each other — same magnitude, opposite direction.' },
      ],
      answer: '\\vec{A}-\\vec{B}=(3,-3),\\;\\vec{B}-\\vec{A}=(-3,3).\\text{ They are antiparallel.}',
    },
    {
      id: 'ch1-007-ch2',
      difficulty: 'medium',
      problem: '\\text{A projectile has }\\vec{v}_i=20\\,\\text{m/s at }60°\\text{ and }\\vec{v}_f=20\\,\\text{m/s at }120°.\\text{ Find }|\\Delta\\vec{v}|.',
      hint: 'Both speeds are equal (20 m/s). Decompose each, subtract, find magnitude.',
      walkthrough: [
        { expression: 'v_{ix}=20\\cos60°=10,\\;v_{iy}=20\\sin60°=10\\sqrt{3}', annotation: 'Decompose v⃗_i.' },
        { expression: 'v_{fx}=20\\cos120°=-10,\\;v_{fy}=20\\sin120°=10\\sqrt{3}', annotation: 'Decompose v⃗_f.' },
        { expression: '\\Delta v_x=-10-10=-20,\\;\\Delta v_y=10\\sqrt{3}-10\\sqrt{3}=0', annotation: 'Subtract components.' },
        { expression: '|\\Delta\\vec{v}|=\\sqrt{(-20)^2+0^2}=20\\,\\text{m/s west}', annotation: 'Pure horizontal change — the y-components cancelled.' },
      ],
      answer: `|\\Delta\\vec{v}|=20\\,\\text{m/s, directed west (180°).}`,
    },
  ],

  // ── Python Notebook ──────────────────────────────────────────────────────
  python: {
    title: 'Vector Subtraction in Python — Δv⃗ and the additive inverse',
    description: `NumPy subtraction is element-wise. We use it to compute change-in-velocity, verify the non-commutativity of subtraction, and explore the additive inverse.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Subtraction Lab',
        caption: 'Compute vector differences and verify key properties.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1 · Basic subtraction and the negative vector',
              prose: `$\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})$. In NumPy: \`A - B\` is identical to \`A + (-B)\`.`,
              code: [
                'import numpy as np',
                '',
                'A = np.array([5.0, 2.0])',
                'B = np.array([2.0, 5.0])',
                '',
                'diff1 = A - B',
                'diff2 = A + (-B)',
                '',
                'print(f"A - B       = {diff1}")',
                'print(f"A + (-B)    = {diff2}")',
                'print(f"Same? {np.allclose(diff1, diff2)}")',
                '',
                'print(f"\\nB - A       = {B - A}")',
                'print(f"-(A - B)    = {-(A - B)}")',
                'print(f"Antiparallel? {np.allclose(B - A, -(A - B))}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '2 · Change in velocity — Δv⃗',
              prose: `A car changes velocity from 30 m/s east to 40 m/s north. The change $\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i$ has a magnitude of 50 m/s — NOT $|40-30| = 10$ m/s.`,
              code: [
                'v_i = np.array([30.0, 0.0])    # east',
                'v_f = np.array([0.0, 40.0])    # north',
                '',
                'delta_v = v_f - v_i',
                'delta_v_mag = np.linalg.norm(delta_v)',
                'delta_v_ang = np.degrees(np.arctan2(delta_v[1], delta_v[0]))',
                '',
                'print(f"Δv = {delta_v}")',
                'print(f"|Δv| = {delta_v_mag:.4f} m/s    (NOT |v_f|-|v_i| = {abs(40-30)} m/s)")',
                'print(f"θ   = {delta_v_ang:.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '3 · Additive inverse verification',
              prose: `The additive inverse satisfies $\\vec{B} + (-\\vec{B}) = \\vec{0}$. Let us verify and also show $|-\\vec{B}| = |\\vec{B}|$.`,
              code: [
                'B = np.array([3.0, -4.0])',
                'neg_B = -B',
                '',
                'print(f"B       = {B}")',
                'print(f"-B      = {neg_B}")',
                'print(f"B + -B  = {B + neg_B}   (zero vector)")',
                'print(f"|B|     = {np.linalg.norm(B):.4f}")',
                'print(f"|-B|    = {np.linalg.norm(neg_B):.4f}   (same magnitude)")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: '4 · Challenge: projectile Δv⃗',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Change in velocity between two angles',
              difficulty: 'medium',
              prompt: `A projectile has $\\vec{v}_i = 20$ m/s at 60° and $\\vec{v}_f = 20$ m/s at 120°. Find $|\\Delta\\vec{v}|$ and confirm its direction is west (180°).`,
              starterBlock: [
                'v_i = np.array([20*np.cos(np.radians(___)), 20*np.sin(np.radians(___))])',
                'v_f = np.array([20*np.cos(np.radians(___)), 20*np.sin(np.radians(___))])',
                'delta_v = ___ - ___',
                'mag = np.linalg.norm(___)',
                'ang = np.degrees(np.arctan2(___, ___))',
                'print(f"|Δv| = {mag:.4f} m/s")',
                'print(f"θ   = {ang:.2f}°")',
              ].join('\n'),
              code: [
                'v_i = np.array([20*np.cos(np.radians(60)), 20*np.sin(np.radians(60))])',
                'v_f = np.array([20*np.cos(np.radians(120)), 20*np.sin(np.radians(120))])',
                'delta_v = v_f - v_i',
                'mag = np.linalg.norm(delta_v)',
                'ang = np.degrees(np.arctan2(delta_v[1], delta_v[0]))',
                'print(f"|Δv| = {mag:.4f} m/s  (should be 20)")',
                'print(f"θ   = {ang:.2f}°  (should be 180°, i.e. west)")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "delta_v" in dir(), "Define delta_v"',
                'assert "mag" in dir(), "Compute mag"',
                'assert np.isclose(mag, 20.0, atol=0.01), f"|Δv| should be 20, got {mag:.4f}"',
                'assert np.isclose(abs(ang), 180.0, atol=0.5), f"Direction should be 180°, got {ang:.2f}°"',
                '"SUCCESS: |Δv| = 20 m/s directed west. The y-components cancel because both speeds are equal and the angles are symmetric about 90°."',
              ].join('\n'),
              hint: `v_i at 60°: [20cos60, 20sin60] = [10, 10√3]. v_f at 120°: [20cos120, 20sin120] = [-10, 10√3]. Δv = [-10-10, 0] = [-20, 0]. |Δv| = 20 m/s west.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-007-q1',
      question: `$-\\vec{B}$ has the same _____ as $\\vec{B}$ but points in the _____ direction.`,
      options: [
        `direction; same`,
        `magnitude; opposite`,
        `components; same`,
        `magnitude; same`,
      ],
      answer: 1,
      explanation: `The negative vector is the additive inverse: same magnitude, opposite direction. In components: $-\\vec{B} = (-B_x, -B_y)$.`,
    },
    {
      id: 'p1-ch1-007-q2',
      question: `$\\vec{A} = (5, 2)$, $\\vec{B} = (2, 5)$. What is $\\vec{A} - \\vec{B}$?`,
      options: [`$(3, -3)$`, `$(7, 7)$`, `$(-3, 3)$`, `$(3, 3)$`],
      answer: 0,
      explanation: `$(5-2, 2-5) = (3, -3)$.`,
    },
    {
      id: 'p1-ch1-007-q3',
      question: `Is $\\vec{A} - \\vec{B} = \\vec{B} - \\vec{A}$?`,
      options: [
        `Yes, subtraction is commutative`,
        `No — they are antiparallel (same magnitude, opposite direction)`,
        `Only when $|\\vec{A}| = |\\vec{B}|$`,
        `Only when the vectors are perpendicular`,
      ],
      answer: 1,
      explanation: `$\\vec{B} - \\vec{A} = -(\\vec{A} - \\vec{B})$. The two results have the same magnitude but point in opposite directions.`,
    },
    {
      id: 'p1-ch1-007-q4',
      question: `In the tail-to-tail shortcut, $\\vec{A} - \\vec{B}$ is the arrow from:`,
      options: [
        `Tip of $\\vec{A}$ to tip of $\\vec{B}$`,
        `Tip of $\\vec{B}$ to tip of $\\vec{A}$`,
        `Tail of $\\vec{A}$ to tail of $\\vec{B}$`,
        `Origin to tip of $\\vec{A}$`,
      ],
      answer: 1,
      explanation: `When tails are shared, $\\vec{A} - \\vec{B}$ points from the tip of $\\vec{B}$ to the tip of $\\vec{A}$.`,
    },
    {
      id: 'p1-ch1-007-q5',
      question: `A car's velocity changes from 30 m/s east to 40 m/s north. What is $|\\Delta\\vec{v}|$?`,
      options: [`$10$ m/s`, `$70$ m/s`, `$50$ m/s`, `$\\sqrt{7}$ m/s`],
      answer: 2,
      explanation: `$\\Delta\\vec{v} = (0-30, 40-0) = (-30, 40)$. $|\\Delta\\vec{v}| = \\sqrt{900+1600} = 50$ m/s. NOT $|40-30| = 10$ m/s.`,
    },
    {
      id: 'p1-ch1-007-q6',
      question: `Which equation correctly defines the change in velocity $\\Delta\\vec{v}$?`,
      options: [
        `$|\\vec{v}_f| - |\\vec{v}_i|$`,
        `$\\vec{v}_f - \\vec{v}_i$`,
        `$\\vec{v}_i - \\vec{v}_f$`,
        `$|\\vec{v}_f - \\vec{v}_i|$`,
      ],
      answer: 1,
      explanation: `$\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i$ — a vector equation. $|\\vec{v}_f| - |\\vec{v}_i|$ is a scalar and gives the wrong magnitude in most cases.`,
    },
    {
      id: 'p1-ch1-007-q7',
      question: `$\\vec{B} + (-\\vec{B}) = ?$`,
      options: [`$2\\vec{B}$`, `$\\vec{0}$`, `$\\vec{B}$`, `$-2\\vec{B}$`],
      answer: 1,
      explanation: `$-\\vec{B}$ is the additive inverse: $\\vec{B} + (-\\vec{B}) = (B_x-B_x, B_y-B_y) = (0, 0) = \\vec{0}$.`,
    },
    {
      id: 'p1-ch1-007-q8',
      question: `$\\vec{v}_i = 20$ m/s at 60°, $\\vec{v}_f = 20$ m/s at 120°. What is the direction of $\\Delta\\vec{v}$?`,
      options: [`$90°$ (north)`, `$180°$ (west)`, `$0°$ (east)`, `$270°$ (south)`],
      answer: 1,
      explanation: `Both speeds are equal; angles are symmetric about 90°. The $y$-components cancel. $\\Delta v_x = -10-10 = -20$, $\\Delta v_y = 0$. Direction is 180° (west).`,
    },
  ],
}
