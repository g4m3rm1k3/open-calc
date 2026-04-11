export default {
  id: 'p1-ch1-008',
  slug: 'subtracting-vectors-numerically',
  chapter: 'p1',
  order: 8,
  title: 'Subtracting Vectors Numerically',
  subtitle: 'Negate, decompose, sum — the DSMD method applied to differences.',
  tags: ['vector subtraction', 'numerical', 'components', 'DSMD', 'change in velocity'],
  aliases: 'subtract numerically component method delta v difference',

  hook: {
    question: `Force A⃗ = 60 N at 20° and force B⃗ = 45 N at 110°. What is A⃗ − B⃗ exactly?`,
    realWorldContext: `Relative velocity, net force, change in momentum — all are vector differences. The graphical method gives a rough answer. The numerical method gives the exact one. DSMD with negation handles every case.`,
    previewVisualizationId: 'SVGDiagram',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (10 of 21) Subtracting Vectors Numerically',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'The numerical method for subtraction is identical to addition with one extra step: **negate B⃗ before you start**.',
      'Negating a vector in component form is trivial: flip the sign of every component. $-\\vec{B} = (-B_x, -B_y)$. Then apply DSMD exactly as for addition.',
      'The five-step recipe: (0) Compute $-\\vec{B} = (-B_x, -B_y)$. (1) Decompose $\\vec{A}$ and $-\\vec{B}$. (2) Sum: $R_x = A_x + (-B_x)$, $R_y = A_y + (-B_y)$. (3) Magnitude: $|\\vec{R}| = \\sqrt{R_x^2+R_y^2}$. (4) Direction: $\\theta = \\text{atan2}(R_y, R_x)$.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Numerical subtraction recipe',
        body: '\\vec{A}-\\vec{B} = \\vec{A}+(-\\vec{B}). \\text{Step 0: negate }\\vec{B}.\\text{ Steps 1–4: DSMD as usual.}',
      },
      {
        type: 'insight',
        title: 'In the component table, just flip signs',
        body: 'Replace every $B_x$ with $-B_x$ and $B_y$ with $-B_y$ in the table. Everything else is identical to the addition procedure.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Negate first, then DSMD',
        caption: 'To compute A⃗ − B⃗ numerically: (1) negate B⃗ by flipping signs: (−Bₓ, −By). (2) Apply DSMD to A⃗ + (−B⃗). The result is (Aₓ − Bₓ, Ay − By). Components subtract axis by axis — pure arithmetic.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Step 0→4: negate then DSMD',
        caption: `Step 0: negate $\\vec{B}$ (flip all signs). Steps 1–4: DSMD as in addition. The component table has $-B_x$ and $-B_y$ instead of $B_x$ and $B_y$.`,
      },
    ],
  },

  math: {
    prose: [
      'The component table for subtraction has one modified row: $-\\vec{B}$ instead of $\\vec{B}$. Everything else is the same structure as the addition table.',
      'A powerful identity: $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi$ where $\\phi$ is the angle **between** $\\vec{A}$ and $\\vec{B}$. This is the law of cosines applied to the triangle formed by $\\vec{A}$, $\\vec{B}$, and $\\vec{A}-\\vec{B}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Magnitude of difference (law of cosines)',
        body: '|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi',
      },
      {
        type: 'insight',
        title: 'Compare addition and subtraction magnitudes',
        body: '|\\vec{A}+\\vec{B}|^2 = |A|^2+|B|^2+2|A||B|\\cos\\phi \\text{ vs } |\\vec{A}-\\vec{B}|^2 = |A|^2+|B|^2-2|A||B|\\cos\\phi. The only change is the sign on $2|A||B|\\cos\\phi$.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Addition vs subtraction — one sign change',
        caption: `$\\vec{A}+\\vec{B}$: sum $+B_x$ and $+B_y$. $\\vec{A}-\\vec{B}$: sum $-B_x$ and $-B_y$. That single sign flip is the only difference between the two procedures.`,
      },
    ],
  },

  rigor: {
    prose: [
      'Since $\\vec{A}-\\vec{B} = \\vec{A}+(-\\vec{B})$ and we have already proved vector addition is commutative and associative, subtraction inherits all the same computational properties. Note, however, that subtraction is neither commutative nor associative in general: $\\vec{A}-\\vec{B} \\ne \\vec{B}-\\vec{A}$ and $(\\vec{A}-\\vec{B})-\\vec{C} \\ne \\vec{A}-(\\vec{B}-\\vec{C})$.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Subtraction is not commutative',
        body: '\\vec{A}-\\vec{B} = -(\\vec{B}-\\vec{A}). \\text{ The two results are antiparallel.}',
      },
      {
        type: 'warning',
        title: 'Subtraction is not associative',
        body: '(\\vec{A}-\\vec{B})-\\vec{C} = \\vec{A}-\\vec{B}-\\vec{C} \\ne \\vec{A}-(\\vec{B}-\\vec{C}) = \\vec{A}-\\vec{B}+\\vec{C}',
      },
    ],
    proofSteps: [
      {
        title: "Component subtraction",
        expression: "\\vec{A} - \\vec{B} = (A_x - B_x, A_y - B_y)",
        annotation: "This is the fundamental definition. We'll use it to derive the Law of Cosines for vectors.",
      },
      {
        title: "Square the magnitude",
        expression: "|\\vec{A} - \\vec{B}|^2 = (A_x - B_x)^2 + (A_y - B_y)^2",
        annotation: "Squaring the magnitude is applying the Pythagorean theorem to the resultant components.",
      },
      {
        title: "Expand and regroup",
        expression: "= (A_x^2 + A_y^2) + (B_x^2 + B_y^2) - 2(A_xB_x + A_yB_y)",
        annotation: "Expand the squares and collect terms. We recognize the squared magnitudes of A and B.",
      },
      {
        title: "Recognize the dot product",
        expression: "= |\\vec{A}|^2 + |\\vec{B}|^2 - 2(\\vec{A} \\cdot \\vec{B})",
        annotation: "The sum of component products is the definition of the dot product.",
      },
      {
        title: "Law of Cosines",
        expression: "= |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi",
        annotation: "Substituting the geometric dot product gives the final Law of Cosines for vector differences.",
      },
    ],
    title: 'Derivation: law of cosines for |A⃗ − B⃗|',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Law of cosines — triangle formed by A⃗, B⃗, A⃗−B⃗',
        caption: `The three vectors form a triangle with sides $|\\vec{A}|$, $|\\vec{B}|$, $|\\vec{A}-\\vec{B}|$. The law of cosines $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi$ follows from expanding the squared magnitude.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-008-ex1',
      title: 'Numerical: A⃗ − B⃗ with non-trivial angles',
      problem: '\\vec{A}=60\\,N\\text{ at }20°,\\;\\vec{B}=45\\,N\\text{ at }110°.\\text{ Find }\\vec{A}-\\vec{B}.',
      steps: [
        { expression: 'A_x=60\\cos20°=56.38,\\;A_y=60\\sin20°=20.52', annotation: 'Decompose A⃗.' },
        { expression: 'B_x=45\\cos110°=-15.39,\\;B_y=45\\sin110°=42.29', annotation: 'Decompose B⃗. cos110° is negative (Q II).' },
        { expression: '-B_x=15.39,\\;-B_y=-42.29', annotation: 'Negate B⃗ components (Step 0).' },
        { expression: 'R_x=56.38+15.39=71.77\\,N,\\;R_y=20.52+(-42.29)=-21.77\\,N', annotation: 'Sum: A⃗ + (−B⃗).' },
        { expression: '|\\vec{R}|=\\sqrt{71.77^2+21.77^2}=\\sqrt{5151.0+473.9}=\\sqrt{5624.9}\\approx74.99\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(-21.77/71.77)\\approx-16.9°\\text{ (Quadrant IV)}', annotation: 'Rₓ>0, Rᵧ<0 → Q IV. atan2 gives −16.9°.' },
      ],
      conclusion: '$\\vec{A}-\\vec{B} \\approx 75.0\\,N$ at $-16.9°$ (16.9° below the x-axis).',
    },
    {
      id: 'ch1-008-ex2',
      title: 'Relative velocity',
      problem: '\\text{Car A travels at }\\vec{v}_A=25\\,\\text{m/s east. Car B travels at }\\vec{v}_B=20\\,\\text{m/s at }30°. \\text{Find the velocity of A relative to B: }\\vec{v}_{A\\text{ rel }B}=\\vec{v}_A-\\vec{v}_B.',
      steps: [
        { expression: 'v_{Ax}=25,\\;v_{Ay}=0', annotation: 'A moves east.' },
        { expression: 'v_{Bx}=20\\cos30°=17.32,\\;v_{By}=20\\sin30°=10.00', annotation: 'Decompose B.' },
        { expression: 'R_x=25-17.32=7.68,\\;R_y=0-10.00=-10.00', annotation: 'Subtract component-wise.' },
        { expression: '|\\vec{v}_{A\\text{ rel }B}|=\\sqrt{7.68^2+10^2}=\\sqrt{59.0+100}=\\sqrt{159}\\approx12.6\\,\\text{m/s}', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(-10/7.68)\\approx-52.5°', annotation: 'Q IV (east component positive, south component negative).' },
      ],
      conclusion: 'From B\'s perspective, A appears to move at 12.6 m/s at 52.5° below the x-axis (southeast).',
    },
  ],

  challenges: [
    {
      id: 'ch1-008-ch1',
      difficulty: 'easy',
      problem: '\\vec{A}=(8,6),\\;\\vec{B}=(3,-2).\\text{ Find }|\\vec{A}-\\vec{B}|.',
      hint: 'Subtract components first, then find magnitude.',
      walkthrough: [
        { expression: '\\vec{A}-\\vec{B}=(8-3,\\;6-(-2))=(5,8)', annotation: 'Component subtraction.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{25+64}=\\sqrt{89}\\approx9.43', annotation: 'Magnitude.' },
      ],
      answer: '|\\vec{A}-\\vec{B}|=\\sqrt{89}\\approx9.43',
    },
    {
      id: 'ch1-008-ch2',
      difficulty: 'medium',
      problem: '\\text{Using the law of cosines formula, find }|\\vec{A}-\\vec{B}|\\text{ where }|\\vec{A}|=10,\\;|\\vec{B}|=8,\\;\\phi=60°.',
      hint: '$|A-B|^2 = |A|^2 + |B|^2 - 2|A||B|\\cos\\phi$',
      walkthrough: [
        { expression: '|\\vec{A}-\\vec{B}|^2=100+64-2(10)(8)(0.5)=164-80=84', annotation: '$\\cos60°=0.5$.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{84}=2\\sqrt{21}\\approx9.17', annotation: 'Take the square root.' },
      ],
      answer: `|\\vec{A}-\\vec{B}|=2\\sqrt{21}\\approx9.17`,
    },
  ],

  // ── Python Notebook ──────────────────────────────────────────────────────
  python: {
    title: 'Numerical Subtraction in Python — DSMD with negation',
    description: `NumPy handles subtraction natively. We verify the law-of-cosines formula, compute relative velocities, and confirm non-commutativity.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Subtraction Lab — exact answers every time',
        caption: 'Work through the main example, then the law-of-cosines formula.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1 · A⃗ − B⃗ numerically: 60 N at 20° minus 45 N at 110°',
              prose: `Step 0: negate $\\vec{B}$. Steps 1–4: DSMD on $\\vec{A}$ and $-\\vec{B}$.`,
              code: [
                'import numpy as np',
                '',
                'A_mag, A_ang = 60.0, 20.0',
                'B_mag, B_ang = 45.0, 110.0',
                '',
                'A = np.array([A_mag*np.cos(np.radians(A_ang)), A_mag*np.sin(np.radians(A_ang))])',
                'B = np.array([B_mag*np.cos(np.radians(B_ang)), B_mag*np.sin(np.radians(B_ang))])',
                '',
                'R = A - B   # NumPy handles the negation automatically',
                '',
                'print(f"A   = ({A[0]:.2f}, {A[1]:.2f})")',
                'print(f"B   = ({B[0]:.2f}, {B[1]:.2f})")',
                'print(f"-B  = ({-B[0]:.2f}, {-B[1]:.2f})")',
                'print(f"R   = A - B = ({R[0]:.2f}, {R[1]:.2f})")',
                'print(f"|R| = {np.linalg.norm(R):.4f} N")',
                'print(f"θ   = {np.degrees(np.arctan2(R[1], R[0])):.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '2 · Law of cosines vs direct subtraction',
              prose: `Two ways to get $|\\vec{A}-\\vec{B}|$: direct component subtraction, or the law-of-cosines formula $|\\vec{A}-\\vec{B}|^2 = |A|^2+|B|^2-2|A||B|\\cos\\phi$.`,
              code: [
                'A_mag, B_mag, phi_deg = 10.0, 8.0, 60.0',
                'phi = np.radians(phi_deg)',
                '',
                '# Law of cosines',
                'diff_cos_law = np.sqrt(A_mag**2 + B_mag**2 - 2*A_mag*B_mag*np.cos(phi))',
                '',
                '# Direct (place A along x, B at phi)',
                'A = np.array([A_mag, 0.0])',
                'B = np.array([B_mag*np.cos(phi), B_mag*np.sin(phi)])',
                'diff_direct = np.linalg.norm(A - B)',
                '',
                'print(f"Law of cosines: |A-B| = {diff_cos_law:.4f}")',
                'print(f"Direct method:  |A-B| = {diff_direct:.4f}")',
                'print(f"Match: {np.isclose(diff_cos_law, diff_direct)}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '3 · Challenge: relative velocity',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Velocity of Car A relative to Car B',
              difficulty: 'medium',
              prompt: `Car A: 25 m/s east. Car B: 20 m/s at 30°. Find $\\vec{v}_{A\\text{ rel }B} = \\vec{v}_A - \\vec{v}_B$, its magnitude, and direction.`,
              starterBlock: [
                'vA = np.array([___, ___])',
                'vB = np.array([20*np.cos(np.radians(___)), 20*np.sin(np.radians(___))])',
                'v_rel = ___ - ___',
                'speed = np.linalg.norm(___)',
                'angle = np.degrees(np.arctan2(___, ___))',
                'print(f"v_rel = {v_rel}")',
                'print(f"speed = {speed:.4f} m/s")',
                'print(f"angle = {angle:.2f}°")',
              ].join('\n'),
              code: [
                'vA = np.array([25.0, 0.0])',
                'vB = np.array([20*np.cos(np.radians(30)), 20*np.sin(np.radians(30))])',
                'v_rel = vA - vB',
                'speed = np.linalg.norm(v_rel)',
                'angle = np.degrees(np.arctan2(v_rel[1], v_rel[0]))',
                'print(f"v_rel = {v_rel.round(4)}")',
                'print(f"speed = {speed:.4f} m/s")',
                'print(f"angle = {angle:.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "v_rel" in dir(), "Define v_rel"',
                'assert "speed" in dir(), "Compute speed"',
                'expected = np.array([25, 0]) - np.array([20*np.cos(np.radians(30)), 20*np.sin(np.radians(30))])',
                'assert np.allclose(v_rel, expected, atol=0.01), f"v_rel wrong: {v_rel}"',
                '"SUCCESS: v_rel correctly computed"',
              ].join('\n'),
              hint: `vA = [25, 0]. vB = [20cos30, 20sin30] ≈ [17.32, 10.0]. v_rel = [25-17.32, 0-10] = [7.68, -10]. |v_rel| ≈ 12.6 m/s.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-008-q1',
      question: `What is "Step 0" in the five-step numerical subtraction method?`,
      options: [
        `Compute the magnitude of $\\vec{B}$`,
        `Negate $\\vec{B}$: replace $(B_x, B_y)$ with $(-B_x, -B_y)$`,
        `Draw a diagram`,
        `Find the angle between $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: 1,
      explanation: `Subtraction is addition of the negated vector. Step 0 is the negation; Steps 1–4 are the same DSMD as for addition.`,
    },
    {
      id: 'p1-ch1-008-q2',
      question: `$\\vec{A} = (8, 6)$, $\\vec{B} = (3, -2)$. What is $\\vec{A} - \\vec{B}$?`,
      options: [`$(5, 4)$`, `$(11, 4)$`, `$(5, 8)$`, `$(11, 8)$`],
      answer: 2,
      explanation: `$(8-3, 6-(-2)) = (5, 8)$.`,
    },
    {
      id: 'p1-ch1-008-q3',
      question: `$|\\vec{A}| = 10$, $|\\vec{B}| = 8$, angle between them $\\phi = 60°$. Find $|\\vec{A}-\\vec{B}|$.`,
      options: [`$\\sqrt{84}$`, `$\\sqrt{244}$`, `$\\sqrt{4}$`, `$\\sqrt{164}$`],
      answer: 0,
      explanation: `$|A-B|^2 = 100+64-2(10)(8)(0.5) = 164-80 = 84$.`,
    },
    {
      id: 'p1-ch1-008-q4',
      question: `Which property does vector subtraction NOT have?`,
      options: [`It produces a vector result`, `Commutativity`, `It is defined for any two vectors`, `The result has a magnitude`],
      answer: 1,
      explanation: `$\\vec{A}-\\vec{B} \\ne \\vec{B}-\\vec{A}$ in general — they are antiparallel. Subtraction is not commutative.`,
    },
    {
      id: 'p1-ch1-008-q5',
      question: `The law of cosines for $|\\vec{A}-\\vec{B}|^2$ differs from the one for $|\\vec{A}+\\vec{B}|^2$ by:`,
      options: [
        `The sign of $|\\vec{A}|^2$`,
        `The sign of the $2|\\vec{A}||\\vec{B}|\\cos\\phi$ term`,
        `They are identical`,
        `A factor of 2`,
      ],
      answer: 1,
      explanation: `Addition: $+2|A||B|\\cos\\phi$. Subtraction: $-2|A||B|\\cos\\phi$. The only difference is that sign.`,
    },
    {
      id: 'p1-ch1-008-q6',
      question: `Car A: 25 m/s east. Car B: 25 m/s north. What is $|\\vec{v}_A - \\vec{v}_B|$?`,
      options: [`$0$ m/s`, `$50$ m/s`, `$25\\sqrt{2}$ m/s`, `$25$ m/s`],
      answer: 2,
      explanation: `$\\vec{v}_A - \\vec{v}_B = (25, 0) - (0, 25) = (25, -25)$. $|\\vec{v}_{rel}| = \\sqrt{625+625} = 25\\sqrt{2}$ m/s.`,
    },
    {
      id: 'p1-ch1-008-q7',
      question: `$(\\vec{A} - \\vec{B}) - \\vec{C}$ equals:`,
      options: [
        `$\\vec{A} - (\\vec{B} - \\vec{C})$`,
        `$\\vec{A} - \\vec{B} - \\vec{C}$`,
        `They are equal`,
        `$\\vec{A} + \\vec{B} - \\vec{C}$`,
      ],
      answer: 1,
      explanation: `$(\\vec{A}-\\vec{B})-\\vec{C} = \\vec{A}-\\vec{B}-\\vec{C}$, but $\\vec{A}-(\\vec{B}-\\vec{C}) = \\vec{A}-\\vec{B}+\\vec{C}$. Subtraction is not associative.`,
    },
    {
      id: 'p1-ch1-008-q8',
      question: `In the numerical method, after negating $\\vec{B}$, the next step is:`,
      options: [
        `Find $|\\vec{A}-\\vec{B}|$ immediately`,
        `Decompose both $\\vec{A}$ and $-\\vec{B}$ into components`,
        `Draw the parallelogram`,
        `Apply the law of cosines`,
      ],
      answer: 1,
      explanation: `After Step 0 (negate), Step 1 is Decompose: find $A_x, A_y$ and $-B_x, -B_y$. Then Sum, Magnitude, Direction — the standard DSMD steps.`,
    },
  ],
}
