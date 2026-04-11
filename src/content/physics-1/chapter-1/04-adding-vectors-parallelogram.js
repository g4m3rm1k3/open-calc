export default {
  id: 'p1-ch1-004',
  slug: 'adding-vectors-graphically-parallelogram',
  chapter: 'p1',
  order: 4,
  title: 'Adding Vectors Graphically — Parallelogram Method',
  subtitle: 'Two arrows into one: the diagonal of the parallelogram they form.',
  tags: ['vector addition', 'parallelogram', 'resultant', 'graphical method'],
  aliases: 'parallelogram law resultant sum of vectors graphical',

  hook: {
    question: `Two forces pull on a boat — one northeast, one northwest. What single force replaces them both?`,
    realWorldContext: `Every time two forces act simultaneously — a kite in the wind, a ship fighting a current, a joint in a truss — you need to find their combined effect. The parallelogram method is the oldest and most visual way to do that.`,
    previewVisualizationId: 'SVGDiagram',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (5 of 21) Adding Vectors Graphically — Parallelogram Method',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'Place two vectors $\\vec{A}$ and $\\vec{B}$ so their **tails share the same point**. Draw $\\vec{A}$ and $\\vec{B}$ as two sides of a shape. Complete the parallelogram by copying each vector from the tip of the other. The **diagonal** from the shared tail to the opposite corner is the resultant $\\vec{R} = \\vec{A} + \\vec{B}$.',
      'The key insight is that this diagonal simultaneously captures both contributions. It is the single vector that has exactly the same effect as applying $\\vec{A}$ and $\\vec{B}$ together.',
      'Vector addition is **commutative**: $\\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}$. The parallelogram makes this obvious — the same diagonal results whether you call the sides $\\vec{A}$ and $\\vec{B}$ or $\\vec{B}$ and $\\vec{A}$.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Resultant vector',
        body: '\\vec{R} = \\vec{A} + \\vec{B} — the single vector with the same effect as applying both $\\vec{A}$ and $\\vec{B}$.',
      },
      {
        type: 'insight',
        title: 'Tail-to-tail placement',
        body: 'Both vectors must share a common tail before you draw the parallelogram. If tails are not at the same point, translate one arrow.',
      },
      {
        type: 'definition',
        title: 'Commutativity',
        body: '\\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}. The parallelogram diagonal is the same regardless of which vector is labelled first.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Two vectors, one resultant',
        caption: 'Place A⃗ and B⃗ tail-to-tail. Complete the parallelogram. The diagonal from the shared tail is R⃗ = A⃗ + B⃗. Components add axis-by-axis: Rₓ = Aₓ + Bₓ, Ry = Ay + By.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Two vectors, one resultant — interactive',
        caption: `Both arrows share a tail. Complete the parallelogram. The diagonal from the shared tail is $\\vec{R} = \\vec{A} + \\vec{B}$.`,
        props: { interactive: true },
      },
    ],
  },

  math: {
    prose: [
      'The parallelogram method is geometric — it does not require any calculation. But it is limited by the precision of your drawing. For exact answers we always convert to components (Lesson 6). The parallelogram tells you *what to expect* before you calculate.',
      'A useful bound: the magnitude of the resultant satisfies $\\bigl||\\vec{A}| - |\\vec{B}|\\bigr| \\le |\\vec{R}| \\le |\\vec{A}| + |\\vec{B}|$. The maximum is reached when vectors are parallel (same direction); the minimum when they are anti-parallel (opposite directions).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Magnitude bounds (triangle inequality)',
        body: '\\bigl||\\vec{A}| - |\\vec{B}|\\bigr| \\;\\le\\; |\\vec{A}+\\vec{B}| \\;\\le\\; |\\vec{A}| + |\\vec{B}|',
      },
      {
        type: 'warning',
        title: 'The resultant is usually NOT |A| + |B|',
        body:
          '|\\vec{R}| = |\\vec{A}| + |\\vec{B}| only when both vectors point in exactly the same direction. For any other angle, the resultant is shorter than this sum.',
      },
      {
        type: 'mnemonic',
        title: 'Check with extreme cases',
        body:
          'Same direction: $|\\vec{R}| = |\\vec{A}| + |\\vec{B}|$ (maximum). Opposite: $|\\vec{R}| = \\bigl||\\vec{A}| - |\\vec{B}|\\bigr|$ (minimum). Perpendicular: $|\\vec{R}| = \\sqrt{|\\vec{A}|^2 + |\\vec{B}|^2}$.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Triangle inequality — extreme cases',
        caption: `At $0°$ the resultant magnitude is $|\\vec{A}|+|\\vec{B}|$ (maximum). At $180°$ it is $\\bigl||\\vec{A}|-|\\vec{B}|\\bigr|$ (minimum). At $90°$ it is $\\sqrt{|\\vec{A}|^2+|\\vec{B}|^2}$.`,
      },
    ],
  },

  rigor: {
    prose: [
      'The parallelogram law follows directly from the definition of vector addition in $\\mathbb{R}^n$: $(A_x, A_y) + (B_x, B_y) = (A_x+B_x, A_y+B_y)$. The geometric construction is simply a way of visualising this component-wise sum.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Vector addition (formal)',
        body: '\\vec{A} + \\vec{B} = (A_x + B_x)\\,\\hat{i} + (A_y + B_y)\\,\\hat{j}',
      },
      {
        type: 'insight',
        title: 'Why the diagonal?',
        body:
          'The four vertices of the parallelogram are $\\mathbf{0}$, $\\vec{A}$, $\\vec{B}$, $\\vec{A}+\\vec{B}$. The diagonal from $\\mathbf{0}$ to $\\vec{A}+\\vec{B}$ is exactly the component sum — the geometry reflects the algebra.',
      },
    ],
    proofSteps: [
      {
        expression: '\\vec{R} = \\vec{A} + \\vec{B}',
        annotation: 'The resultant is defined as the vector sum. We want to understand why this equals the parallelogram diagonal.',
      },
      {
        expression: '\\vec{R} = (A_x\\hat{i} + A_y\\hat{j}) + (B_x\\hat{i} + B_y\\hat{j})',
        annotation: 'Replace each vector with its unit-vector expansion. Now the addition is fully explicit.',
      },
      {
        expression: '\\vec{R} = (A_x+B_x)\\hat{i} + (A_y+B_y)\\hat{j}',
        annotation: 'Collect î and ĵ terms. Addition is done axis by axis — ordinary arithmetic.',
      },
      {
        expression: 'R_x = A_x+B_x, \\qquad R_y = A_y+B_y',
        annotation: 'The resultant components are the sums of the individual components. This is the computation step.',
      },
      {
        expression: '\\text{Corners: } 0, A, B, A+B \\implies \\text{Parallelogram}',
        annotation: 'The four corners of the parallelogram are exactly those four points. The diagonal from origin to $A+B$ is $\\vec{R}$. Geometry and algebra agree.',
      },
    ],
    title: 'Proof: parallelogram diagonal equals component sum',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Parallelogram diagonal = component sum',
        caption: `Corners: $\\mathbf{0}$, $\\vec{A}$, $\\vec{B}$, $\\vec{A}+\\vec{B}$. The diagonal from origin to $\\vec{A}+\\vec{B}$ has components $R_x = A_x+B_x$ and $R_y = A_y+B_y$. Geometry and algebra are identical.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-004-ex1',
      title: 'Resultant of two perpendicular forces',
      problem:
        '\\text{Force } \\vec{A} = 30\\,N \\text{ east and } \\vec{B} = 40\\,N \\text{ north act on an object. Find } |\\vec{R}| \\text{ and its direction.}',
      steps: [
        { expression: 'R_x = A_x + B_x = 30 + 0 = 30\\,N', annotation: 'East component: A contributes 30, B contributes 0.' },
        { expression: 'R_y = A_y + B_y = 0 + 40 = 40\\,N', annotation: 'North component: A contributes 0, B contributes 40.' },
        { expression: '|\\vec{R}| = \\sqrt{30^2 + 40^2} = \\sqrt{900+1600} = \\sqrt{2500} = 50\\,N', annotation: '3-4-5 triple scaled by 10.' },
        { expression: '\\theta = \\arctan(40/30) = \\arctan(4/3) \\approx 53.1°\\text{ north of east}', annotation: 'Angle from east (+x axis). Both components positive → Quadrant I.' },
      ],
      conclusion: '$\\vec{R} = 50\\,N$ at $53.1°$ north of east. The parallelogram is a rectangle here because the vectors are perpendicular.',
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'vector-addition-chain' },
          title: `A⃗ east + B⃗ north = rectangle`,
          caption: `Perpendicular vectors form a rectangle. $R_x = 30$ N, $R_y = 40$ N, $|\\vec{R}| = 50$ N.`,
        },
      ],
    },
    {
      id: 'ch1-004-ex2',
      title: 'Two forces at 60° — using the parallelogram law of cosines',
      problem:
        '\\text{Two forces } |\\vec{A}| = 40\\,N \\text{ and } |\\vec{B}| = 30\\,N \\text{ act at } 60° \\text{ to each other. Find } |\\vec{R}|.',
      steps: [
        { expression: '|\\vec{R}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 + 2|\\vec{A}||\\vec{B}|\\cos\\phi', annotation: 'The law of cosines applied to the triangle formed inside the parallelogram. φ = 60° is the angle between the two vectors.' },
        { expression: '|\\vec{R}|^2 = 40^2 + 30^2 + 2(40)(30)\\cos60°', annotation: 'Substitute values.' },
        { expression: '|\\vec{R}|^2 = 1600 + 900 + 2400 \\times 0.5 = 2500 + 1200 = 3700', annotation: '$\\cos60° = 0.5$.' },
        { expression: '|\\vec{R}| = \\sqrt{3700} \\approx 60.8\\,N', annotation: 'Take the square root.' },
      ],
      conclusion: '$|\\vec{R}| \\approx 60.8\\,N$. Note that $40 + 30 = 70\\,N$ (max, same direction) and $|40-30| = 10\\,N$ (min, opposite). 60.8 N is between these bounds, as expected.',
    },
  ],

  challenges: [
    {
      id: 'ch1-004-ch1',
      difficulty: 'easy',
      problem: '\\text{Two vectors have magnitudes 5 and 12 and are perpendicular. Find the resultant magnitude.}',
      hint: 'Perpendicular vectors form a right triangle. Use the Pythagorean theorem.',
      walkthrough: [
        { expression: '|\\vec{R}| = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13', annotation: '5-12-13 Pythagorean triple.' },
      ],
      answer: '|\\vec{R}| = 13',
    },
    {
      id: 'ch1-004-ch2',
      difficulty: 'medium',
      problem: '\\text{Forces of 8 N and 8 N act at 120° to each other. Find the resultant magnitude.}',
      hint: 'Use the law of cosines: $|R|^2 = A^2 + B^2 + 2AB\\cos\\phi$ where $\\phi = 120°$.',
      walkthrough: [
        { expression: '|\\vec{R}|^2 = 64 + 64 + 2(8)(8)\\cos120°', annotation: 'Apply law of cosines.' },
        { expression: '= 128 + 128(-0.5) = 128 - 64 = 64', annotation: '$\\cos120° = -0.5$.' },
        { expression: '|\\vec{R}| = 8\\,N', annotation: 'Two equal forces at 120° give a resultant equal to either force.' },
      ],
      answer: '|\\vec{R}| = 8\\,N',
    },
    {
      id: 'ch1-004-ch3',
      difficulty: 'hard',
      problem: '\\text{Prove that } |\\vec{A} + \\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 \\text{ if and only if } \\vec{A} \\perp \\vec{B}.',
      hint: 'Expand $|\\vec{A}+\\vec{B}|^2$ using components. A perpendicular condition produces a specific dot-product result.',
      walkthrough: [
        { expression: '|\\vec{A}+\\vec{B}|^2 = (A_x+B_x)^2 + (A_y+B_y)^2', annotation: 'Expand the squared magnitude.' },
        { expression: '= A_x^2 + 2A_xB_x + B_x^2 + A_y^2 + 2A_yB_y + B_y^2', annotation: 'Expand each square.' },
        { expression: '= (A_x^2+A_y^2) + (B_x^2+B_y^2) + 2(A_xB_x+A_yB_y)', annotation: 'Regroup into three parts.' },
        { expression: '= |\\vec{A}|^2 + |\\vec{B}|^2 + 2(\\vec{A}\\cdot\\vec{B})', annotation: 'Recognise the dot product.' },
        { expression: '\\therefore\\;|\\vec{A}+\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2 \\iff \\vec{A}\\cdot\\vec{B}=0 \\iff \\vec{A}\\perp\\vec{B}', annotation: 'The Pythagorean theorem for vectors holds exactly when the dot product vanishes — i.e. when the vectors are perpendicular.' },
      ],
      answer: `The condition $|\\vec{A}+\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2$ is equivalent to $\\vec{A}\\cdot\\vec{B}=0$, which means $\\vec{A}\\perp\\vec{B}$.`,
    },
  ],

  // ── Python Notebook ──────────────────────────────────────────────────────
  python: {
    title: 'Vector Addition — parallelogram method in NumPy',
    description: `Add vectors with NumPy arrays, verify the triangle inequality, and visualise the parallelogram with matplotlib.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Parallelogram Addition Lab',
        caption: 'Compute resultants and explore the triangle inequality numerically.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1 · Add two vectors component-wise',
              prose: `Vector addition is just element-wise array addition. $\\vec{R} = \\vec{A} + \\vec{B}$ means $R_x = A_x+B_x$ and $R_y = A_y+B_y$.`,
              code: [
                'import numpy as np',
                '',
                'A = np.array([30.0, 0.0])    # 30 N east',
                'B = np.array([0.0, 40.0])    # 40 N north',
                '',
                'R = A + B',
                'R_mag = np.linalg.norm(R)',
                'R_angle = np.degrees(np.arctan2(R[1], R[0]))',
                '',
                'print(f"A = {A}")',
                'print(f"B = {B}")',
                'print(f"R = A + B = {R}")',
                'print(f"|R| = {R_mag:.4f} N")',
                'print(f"θ  = {R_angle:.2f}°  (north of east)")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '2 · Triangle inequality — verify numerically',
              prose: `The triangle inequality says $\\bigl||\\vec{A}|-|\\vec{B}|\\bigr| \\le |\\vec{R}| \\le |\\vec{A}|+|\\vec{B}|$. Let us check it for three angle values: 0°, 90°, 180°.`,
              code: [
                'mag_A, mag_B = 40.0, 30.0',
                '',
                'for phi_deg in [0, 60, 90, 120, 180]:',
                '    phi = np.radians(phi_deg)',
                '    A = np.array([mag_A, 0.0])',
                '    B = np.array([mag_B * np.cos(phi), mag_B * np.sin(phi)])',
                '    R_mag = np.linalg.norm(A + B)',
                '    lower = abs(mag_A - mag_B)',
                '    upper = mag_A + mag_B',
                '    print(f"φ={phi_deg:3d}°  |R|={R_mag:.2f}  [{lower:.0f}, {upper:.0f}]  in-bounds={lower <= R_mag <= upper}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '3 · Law of cosines verification',
              prose: `For forces of 40 N and 30 N at 60°, the law of cosines gives $|\\vec{R}|^2 = 40^2 + 30^2 + 2(40)(30)\\cos60°$. Verify with both the formula and direct vector addition.`,
              code: [
                'A_mag, B_mag, phi_deg = 40.0, 30.0, 60.0',
                'phi = np.radians(phi_deg)',
                '',
                '# Law of cosines formula',
                'R_cos_law = np.sqrt(A_mag**2 + B_mag**2 + 2*A_mag*B_mag*np.cos(phi))',
                '',
                '# Direct component addition',
                'A = np.array([A_mag, 0.0])',
                'B = np.array([B_mag * np.cos(phi), B_mag * np.sin(phi)])',
                'R_direct = np.linalg.norm(A + B)',
                '',
                'print(f"Law of cosines: |R| = {R_cos_law:.4f} N")',
                'print(f"Direct method:  |R| = {R_direct:.4f} N")',
                'print(f"Match: {np.isclose(R_cos_law, R_direct)}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: '4 · Challenge: boat with current',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Resultant velocity — boat in a current',
              difficulty: 'medium',
              prompt: `A boat heads east at 5 m/s. A river current pushes it north at 3 m/s. Find the resultant speed and direction.`,
              starterBlock: [
                'boat = np.array([___, ___])   # east component, north component',
                'current = np.array([___, ___])',
                'R = ___ + ___',
                'speed = np.linalg.norm(___)',
                'angle = np.degrees(np.arctan2(___, ___))',
                'print(f"Speed = {speed:.4f} m/s")',
                'print(f"Angle = {angle:.2f}° from east")',
              ].join('\n'),
              code: [
                'boat = np.array([5.0, 0.0])',
                'current = np.array([0.0, 3.0])',
                'R = boat + current',
                'speed = np.linalg.norm(R)',
                'angle = np.degrees(np.arctan2(R[1], R[0]))',
                'print(f"Speed = {speed:.4f} m/s")',
                'print(f"Angle = {angle:.2f}° from east")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "R" in dir(), "Define R"',
                'assert "speed" in dir(), "Compute speed"',
                'assert np.isclose(speed, np.sqrt(34), atol=0.01), f"speed should be sqrt(34)≈5.831, got {speed:.4f}"',
                '"SUCCESS: speed = √34 ≈ 5.831 m/s, angle ≈ 30.96° north of east"',
              ].join('\n'),
              hint: `boat = np.array([5.0, 0.0]), current = np.array([0.0, 3.0]). R = boat + current = [5, 3]. speed = sqrt(25+9) = sqrt(34) ≈ 5.831 m/s.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-004-q1',
      question: `In the parallelogram method, where must the tails of $\\vec{A}$ and $\\vec{B}$ be placed?`,
      options: [
        `Tip of $\\vec{A}$ at origin`,
        `Both tails at the same point`,
        `Tip of $\\vec{A}$ touching tail of $\\vec{B}$`,
        `Anywhere — placement does not matter`,
      ],
      answer: 1,
      explanation: `The parallelogram method requires the two vectors to share a common tail. The diagonal from that common tail is the resultant.`,
    },
    {
      id: 'p1-ch1-004-q2',
      question: `Forces 30 N east and 40 N north act on an object. What is the magnitude of the resultant?`,
      options: [`$70$ N`, `$50$ N`, `$10$ N`, `$35$ N`],
      answer: 1,
      explanation: `$|\\vec{R}| = \\sqrt{30^2+40^2} = \\sqrt{2500} = 50$ N. The 3-4-5 triple scaled by 10.`,
    },
    {
      id: 'p1-ch1-004-q3',
      question: `Which statement about $|\\vec{A}+\\vec{B}|$ is ALWAYS true?`,
      options: [
        `$|\\vec{A}+\\vec{B}| = |\\vec{A}| + |\\vec{B}|$`,
        `$|\\vec{A}+\\vec{B}| \\le |\\vec{A}| + |\\vec{B}|$`,
        `$|\\vec{A}+\\vec{B}| = \\sqrt{|\\vec{A}|^2+|\\vec{B}|^2}$`,
        `$|\\vec{A}+\\vec{B}| \\ge |\\vec{A}| + |\\vec{B}|$`,
      ],
      answer: 1,
      explanation: `The triangle inequality: $|\\vec{A}+\\vec{B}| \\le |\\vec{A}|+|\\vec{B}|$ always. Equality only when they point in the same direction.`,
    },
    {
      id: 'p1-ch1-004-q4',
      question: `Two equal forces of 10 N act in exactly opposite directions. What is the resultant magnitude?`,
      options: [`$20$ N`, `$10$ N`, `$0$ N`, `$14.1$ N`],
      answer: 2,
      explanation: `Anti-parallel equal forces cancel: $|\\vec{R}| = |10-10| = 0$ N.`,
    },
    {
      id: 'p1-ch1-004-q5',
      question: `$\\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}$. What property is this?`,
      options: [`Associativity`, `Distributivity`, `Commutativity`, `The zero-vector identity`],
      answer: 2,
      explanation: `Commutativity: the order of addition does not change the result. The parallelogram makes this geometric — the same diagonal regardless of labelling.`,
    },
    {
      id: 'p1-ch1-004-q6',
      question: `Two forces of 6 N and 8 N act at 90°. The resultant is:`,
      options: [`$14$ N`, `$2$ N`, `$10$ N`, `$7$ N`],
      answer: 2,
      explanation: `Perpendicular vectors: $|\\vec{R}| = \\sqrt{6^2+8^2} = \\sqrt{100} = 10$ N. The 6-8-10 (3-4-5) triple.`,
    },
    {
      id: 'p1-ch1-004-q7',
      question: `The law of cosines for vectors states $|\\vec{R}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 + 2|\\vec{A}||\\vec{B}|\\cos\\phi$. What is $\\phi$?`,
      options: [
        `The angle $\\vec{R}$ makes with $+x$`,
        `The angle between $\\vec{A}$ and $\\vec{B}$`,
        `Always 90°`,
        `The angle $\\vec{A}$ makes with $+x$`,
      ],
      answer: 1,
      explanation: `$\\phi$ is the angle between the two vectors being added. At $\\phi = 0°$, $\\cos\\phi = 1$ and $|\\vec{R}| = |\\vec{A}|+|\\vec{B}|$ (maximum).`,
    },
    {
      id: 'p1-ch1-004-q8',
      question: `$|\\vec{A}+\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2$ holds only when:`,
      options: [
        `$\\vec{A}$ and $\\vec{B}$ are parallel`,
        `$\\vec{A}$ and $\\vec{B}$ are perpendicular`,
        `$|\\vec{A}| = |\\vec{B}|$`,
        `One vector is zero`,
      ],
      answer: 1,
      explanation: `Expanding the left side gives $|\\vec{A}|^2+|\\vec{B}|^2+2\\vec{A}\\cdot\\vec{B}$. This equals $|\\vec{A}|^2+|\\vec{B}|^2$ only when $\\vec{A}\\cdot\\vec{B} = 0$, i.e. $\\vec{A}\\perp\\vec{B}$.`,
    },
  ],
}
