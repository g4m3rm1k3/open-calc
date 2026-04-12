export default {
  id: 'p1-ch1-006',
  slug: 'adding-vectors-numerically',
  chapter: 'p1',
  order: 6,
  title: 'Adding Vectors Numerically',
  subtitle: 'The four-step method that works for any vectors, every time.',
  tags: ['vector addition', 'numerical method', 'components', 'resultant', 'systematic method'],
  aliases: 'component method vector sum adding analytically calculation',

  hook: {
    question: `Two forces: 40 N at 30° and 25 N at 145°. Graphical methods give only an estimate. How do you get the exact answer?`,
    realWorldContext: `Every real engineering calculation — bridge loads, satellite trajectories, robot forces — requires exact vector addition. The numerical (component) method is the workhorse: decompose, sum, reconstruct. Four steps, always works.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-addition-chain' },
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (7 of 21) Adding Vectors Numerically: Example 1',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (8 of 21) Adding Vectors Numerically: Example 2',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'examples',
    },
  ],

  intuition: {
    prose: [
      'The graphical method shows you *what* the answer looks like. The numerical method tells you *exactly* what it is.',
      'The four-step recipe never fails:',
      '**Step 1 — Decompose** each vector into $x$- and $y$-components. **Step 2 — Sum** all $x$-components; sum all $y$-components. **Step 3 — Magnitude**: $|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}$. **Step 4 — Direction**: $\\theta = \\text{atan2}(R_y, R_x)$, then check the quadrant.',
      'The method works because addition is done component-by-component, and components are just numbers — ordinary arithmetic applies.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The four-step method',
        body:
          '1.\\;v_{kx}=|\\vec{v}_k|\\cos\\theta_k,\\;v_{ky}=|\\vec{v}_k|\\sin\\theta_k\\quad2.\\;R_x=\\sum v_{kx},\\;R_y=\\sum v_{ky}\\quad3.\\;|\\vec{R}|=\\sqrt{R_x^2+R_y^2}\\quad4.\\;\\theta=\\operatorname{atan2}(R_y,R_x)',
      },
      {
        type: 'warning',
        title: 'Check the quadrant every time',
        body:
          'atan2 returns the correct quadrant automatically. Plain arctan does not — it only covers $(-90°, 90°)$. If $R_x < 0$, add $180°$ to the plain arctan result.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Step 1 — Decompose each vector',
        caption: 'Before you can add vectors numerically, each one becomes a right triangle: Aₓ = |A|cosθ and Ay = |A|sinθ. Then you add x-components together and y-components together. Pure arithmetic.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Two vectors — four steps live',
        caption: `Decompose each vector into components. Sum $x$-components and $y$-components separately. Apply $|\\vec{R}| = \\sqrt{R_x^2+R_y^2}$ and $\\theta = \\text{atan2}(R_y, R_x)$.`,
      },
    ],
  },

  math: {
    prose: [
      'The component table is the practical organiser for multi-vector problems. Set up one row per vector, one column per component, and sum the bottom row.',
      'A common exam trap: **sign errors in components**. Always write $v_{kx} = |\\vec{v}_k|\\cos\\theta_k$ where $\\theta_k$ is the standard angle (from $+x$, counterclockwise). If a problem gives "30° below the horizontal", convert to $\\theta = -30°$ before plugging in.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The component table',
        body:
          '\\begin{array}{c|c|c}\\text{Vector} & v_x & v_y\\\\\\hline\\vec{A} & A_x & A_y\\\\\\vec{B} & B_x & B_y\\\\\\hline\\vec{R} & R_x=A_x+B_x & R_y=A_y+B_y\\end{array}',
      },
      {
        type: 'mnemonic',
        title: 'DSMD — the four-step acronym',
        body: 'Decompose → Sum → Magnitude → Direction. Say it before every problem.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Component table — the DSMD organiser',
        caption: `One row per vector, one column per component, sum the bottom row. Every sign error becomes visible before it propagates.`,
      },
    ],
  },

  rigor: {
    prose: [
      'The numerical method is exact — not an approximation — because it is literally the definition of vector addition in $\\mathbb{R}^2$. Any error is purely arithmetic, not methodological.',
      'The only source of genuine imprecision is rounding during the trigonometric steps. Carry at least 4 significant figures through intermediate calculations and round only at the final answer.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Premature rounding',
        body:
          'Rounding $\\cos 37° = 0.8$ (instead of $0.7986$) introduces a 0.17% error that compounds through every step. Always use full calculator precision in intermediate steps.',
      },
      {
        type: 'insight',
        title: 'The method is definition, not approximation',
        body:
          '$\\vec{A}+\\vec{B} \\equiv (A_x+B_x, A_y+B_y)$. Decomposing and summing components is not an approximation of some exact geometric result — it IS the exact geometric result expressed algebraically.',
      },
    ],
    proofSteps: [
      {
        title: "Input: magnitude-angle form",
        expression: "\\vec{A} = (|\\vec{A}|, \\theta_A), \\quad \\vec{B} = (|\\vec{B}|, \\theta_B)",
        annotation: "Problems often give magnitude and angle. We need to convert to component form to perform the addition.",
      },
      {
        title: "Step 1 — Decompose A⃗",
        expression: "A_x = |\\vec{A}|\\cos\\theta_A, \\quad A_y = |\\vec{A}|\\sin\\theta_A",
        annotation: "Apply the component formulas to vector A. Watch for signs: e.g., an angle of 145° gives a negative x-component.",
      },
      {
        title: "Step 1 — Decompose B⃗",
        expression: "B_x = |\\vec{B}|\\cos\\theta_B, \\quad B_y = |\\vec{B}|\\sin\\theta_B",
        annotation: "Same formulas for vector B. Each component is an independent scalar calculation.",
      },
      {
        title: "Step 2 — Sum components",
        expression: "R_x = A_x+B_x, \\quad R_y = A_y+B_y",
        annotation: "This is vector addition by definition. The two component numbers combine to give the resultant's components.",
      },
      {
        title: "Step 3 — Magnitude",
        expression: "|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}",
        annotation: "Apply the Pythagorean theorem to the resultant components. This always gives the magnitude regardless of the quadrant.",
      },
      {
        title: "Step 4 — Direction",
        expression: "\\theta_R = \\text{atan2}(R_y, R_x)",
        annotation: "The atan2 function returns the correct quadrant. Plain arctan would require a manual quadrant check if Rx < 0.",
      },
    ],
    title: 'The four-step method — every step justified',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'DSMD proof — four steps, one diagram',
        caption: `Steps 1–2: decompose and sum → $R_x, R_y$. Steps 3–4: Pythagorean theorem and atan2 → magnitude and direction. The method is exact because it is the definition of $\\mathbb{R}^2$ addition.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-006-ex1',
      title: 'Two forces at non-right angles',
      problem: '\\vec{A}=40\\,N\\text{ at }30°,\\;\\vec{B}=25\\,N\\text{ at }145°.\\text{ Find }\\vec{R}.',
      steps: [
        { expression: 'A_x=40\\cos30°=40(0.8660)=34.64\\,N,\\;A_y=40\\sin30°=20.00\\,N', annotation: 'Decompose A⃗.' },
        { expression: 'B_x=25\\cos145°=25(-0.8192)=-20.48\\,N,\\;B_y=25\\sin145°=25(0.5736)=14.34\\,N', annotation: 'Decompose B⃗. Note: 145° is in Quadrant II → negative x-component.' },
        { expression: 'R_x=34.64+(-20.48)=14.16\\,N,\\;R_y=20.00+14.34=34.34\\,N', annotation: 'Sum components.' },
        { expression: '|\\vec{R}|=\\sqrt{14.16^2+34.34^2}=\\sqrt{200.5+1179.2}=\\sqrt{1379.7}\\approx37.1\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(34.34/14.16)=\\arctan(2.425)\\approx67.6°', annotation: 'Both components positive → Quadrant I. atan2 agrees.' },
      ],
      conclusion: '$\\vec{R} \\approx 37.1\\,N$ at $67.6°$ from the positive $x$-axis.',
      visualizations: [
        { id: 'SVGDiagram', props: { type: 'vector-addition-chain' }, title: '40 N at 30° + 25 N at 145°', caption: `$\\vec{A}$ in Quadrant I, $\\vec{B}$ in Quadrant II. Their sum $\\vec{R}$ is in Quadrant I with a positive $x$-component reduced by $\\vec{B}$'s negative contribution.` },
      ],
    },
    {
      id: 'ch1-006-ex2',
      title: 'Subtracting vectors: A⃗ − B⃗ = A⃗ + (−B⃗)',
      problem: '\\vec{A}=(5,3),\\;\\vec{B}=(2,-1).\\text{ Find }\\vec{A}-\\vec{B}.',
      steps: [
        { expression: '-\\vec{B}=(-2,1)', annotation: 'Negate B⃗ by flipping all component signs. This reverses its direction.' },
        { expression: '\\vec{A}+(-\\vec{B})=(5+(-2),\\;3+1)=(3,4)', annotation: 'Add component-wise.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{9+16}=5', annotation: 'Magnitude of the difference.' },
      ],
      conclusion: 'Vector subtraction is just addition of the negated vector. $-\\vec{B}$ is the same length as $\\vec{B}$, pointing the opposite direction.',
    },
  ],

  challenges: [
    {
      id: 'ch1-006-ch1',
      difficulty: 'easy',
      problem: '\\vec{A}=10\\,N\\text{ at }0°,\\;\\vec{B}=10\\,N\\text{ at }90°.\\text{ Find }\\vec{R}\\text{ exactly.}',
      hint: '0° is east, 90° is north. Components are trivial.',
      walkthrough: [
        { expression: 'R_x=10+0=10,\\;R_y=0+10=10', annotation: 'Direct from the angles.' },
        { expression: '|\\vec{R}|=\\sqrt{200}=10\\sqrt{2}\\approx14.1\\,N', annotation: 'Pythagorean.' },
        { expression: '\\theta=45°', annotation: 'Equal components → 45°.' },
      ],
      answer: '10\\sqrt{2}\\,N\\text{ at }45°',
    },
    {
      id: 'ch1-006-ch2',
      difficulty: 'medium',
      problem: '\\text{Three forces: }\\vec{F}_1=50\\,N\\text{ at }0°,\\;\\vec{F}_2=30\\,N\\text{ at }120°,\\;\\vec{F}_3=20\\,N\\text{ at }240°.\\text{ Find }\\vec{R}.',
      hint: 'Set up the component table. Use exact trig values: $\\cos120°=-\\frac{1}{2}$, $\\sin120°=\\frac{\\sqrt{3}}{2}$, $\\cos240°=-\\frac{1}{2}$, $\\sin240°=-\\frac{\\sqrt{3}}{2}$.',
      walkthrough: [
        { expression: 'F_{1x}=50,\\;F_{1y}=0', annotation: '0° → full magnitude in x.' },
        { expression: 'F_{2x}=30(-\\tfrac{1}{2})=-15,\\;F_{2y}=30(\\tfrac{\\sqrt{3}}{2})=15\\sqrt{3}', annotation: '120° → Quadrant II.' },
        { expression: 'F_{3x}=20(-\\tfrac{1}{2})=-10,\\;F_{3y}=20(-\\tfrac{\\sqrt{3}}{2})=-10\\sqrt{3}', annotation: '240° → Quadrant III.' },
        { expression: 'R_x=50-15-10=25\\,N,\\;R_y=0+15\\sqrt{3}-10\\sqrt{3}=5\\sqrt{3}\\approx8.66\\,N', annotation: 'Sum each column.' },
        { expression: '|\\vec{R}|=\\sqrt{625+75}=\\sqrt{700}=10\\sqrt{7}\\approx26.5\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(5\\sqrt{3}/25)=\\arctan(\\sqrt{3}/5)\\approx19.1°', annotation: 'Both positive → Quadrant I.' },
      ],
      answer: '|\\vec{R}|=10\\sqrt{7}\\approx26.5\\,N\\text{ at }19.1°',
    },
    {
      id: 'ch1-006-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Forces } \\vec{A}\\text{ at }\\alpha\\text{ and }\\vec{B}\\text{ at }-\\alpha\\text{ have equal magnitudes }F. \\text{Show that }|\\vec{R}|=2F\\cos\\alpha\\text{ and that }\\vec{R}\\text{ points along the }x\\text{-axis.}',
      hint: 'By symmetry, the y-components cancel. Compute $R_x$ and use $\\cos(-\\alpha)=\\cos\\alpha$.',
      walkthrough: [
        { expression: 'A_x=F\\cos\\alpha,\\;A_y=F\\sin\\alpha', annotation: 'Decompose A⃗.' },
        { expression: 'B_x=F\\cos(-\\alpha)=F\\cos\\alpha,\\;B_y=F\\sin(-\\alpha)=-F\\sin\\alpha', annotation: 'Decompose B⃗. Note cosine is even, sine is odd.' },
        { expression: 'R_y=F\\sin\\alpha+(-F\\sin\\alpha)=0', annotation: 'y-components cancel by symmetry.' },
        { expression: 'R_x=F\\cos\\alpha+F\\cos\\alpha=2F\\cos\\alpha', annotation: 'x-components add.' },
        { expression: '|\\vec{R}|=\\sqrt{(2F\\cos\\alpha)^2+0^2}=2F\\cos\\alpha,\\;\\theta=0°', annotation: 'Resultant is purely horizontal with magnitude $2F\\cos\\alpha$.' },
      ],
      answer: `|\\vec{R}|=2F\\cos\\alpha,\\text{ directed along }+x.`,
    },
  ],

  // ── Python Notebook ──────────────────────────────────────────────────────
  python: {
    title: 'DSMD Method in Python — exact vector addition every time',
    description: `Implement the four-step Decompose–Sum–Magnitude–Direction method in NumPy for any number of vectors.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Numerical Addition Lab',
        caption: 'Execute DSMD step by step, then run the three-force problem.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1 · DSMD: 40 N at 30° + 25 N at 145°',
              prose: `The four-step method:\n1. **Decompose** each vector into components\n2. **Sum** the components\n3. **Magnitude** from Pythagorean theorem\n4. **Direction** from atan2`,
              code: [
                'import numpy as np',
                '',
                '# Input vectors (magnitude, angle in degrees)',
                'vectors = [(40.0, 30.0), (25.0, 145.0)]',
                '',
                '# Step 1 — Decompose',
                'components = [(m*np.cos(np.radians(a)), m*np.sin(np.radians(a))) for m, a in vectors]',
                'for i, (vx, vy) in enumerate(components):',
                '    print(f"v{i+1}: x={vx:.4f}  y={vy:.4f}")',
                '',
                '# Step 2 — Sum',
                'Rx = sum(c[0] for c in components)',
                'Ry = sum(c[1] for c in components)',
                'print(f"\\nR_x = {Rx:.4f} N")',
                'print(f"R_y = {Ry:.4f} N")',
                '',
                '# Step 3 — Magnitude',
                'R_mag = np.sqrt(Rx**2 + Ry**2)',
                'print(f"|R|  = {R_mag:.4f} N")',
                '',
                '# Step 4 — Direction',
                'theta = np.degrees(np.arctan2(Ry, Rx))',
                'print(f"θ    = {theta:.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '2 · Generalised: add any list of vectors',
              prose: `Encapsulate DSMD as a reusable function that accepts a list of (magnitude, angle) tuples and returns the resultant.`,
              code: [
                'def add_vectors(mag_angle_list):',
                '    """DSMD: add any number of vectors given as (magnitude, degrees) pairs."""',
                '    xs = [m * np.cos(np.radians(a)) for m, a in mag_angle_list]',
                '    ys = [m * np.sin(np.radians(a)) for m, a in mag_angle_list]',
                '    Rx, Ry = sum(xs), sum(ys)',
                '    mag = np.sqrt(Rx**2 + Ry**2)',
                '    ang = np.degrees(np.arctan2(Ry, Rx))',
                '    return mag, ang, Rx, Ry',
                '',
                '# Three forces from the challenge problem',
                'result = add_vectors([(50, 0), (30, 120), (20, 240)])',
                'print(f"|R| = {result[0]:.4f} N")',
                'print(f"θ   = {result[1]:.2f}°")',
                'print(f"Rx  = {result[2]:.4f} N")',
                'print(f"Ry  = {result[3]:.4f} N")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '3 · Challenge: satellite thruster problem',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Satellite net force',
              difficulty: 'medium',
              prompt: `Three thrusters fire simultaneously: 120 N at 0°, 80 N at 120°, 60 N at 250°. Find the net force magnitude and direction.`,
              starterBlock: [
                'thrusters = [(___, ___), (___, ___), (___, ___)]  # (mag, angle)',
                'net_mag, net_ang, Rx, Ry = add_vectors(___)',
                'print(f"|F_net| = {net_mag:.4f} N")',
                'print(f"θ       = {net_ang:.2f}°")',
              ].join('\n'),
              code: [
                'thrusters = [(120, 0), (80, 120), (60, 250)]',
                'net_mag, net_ang, Rx, Ry = add_vectors(thrusters)',
                'print(f"|F_net| = {net_mag:.4f} N")',
                'print(f"θ       = {net_ang:.2f}°")',
                'print(f"Rx = {Rx:.4f} N,  Ry = {Ry:.4f} N")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "net_mag" in dir(), "Compute net_mag"',
                'expected_rx = 120 + 80*np.cos(np.radians(120)) + 60*np.cos(np.radians(250))',
                'expected_ry = 80*np.sin(np.radians(120)) + 60*np.sin(np.radians(250))',
                'expected_mag = np.sqrt(expected_rx**2 + expected_ry**2)',
                'assert np.isclose(net_mag, expected_mag, atol=0.1), f"|F_net| should be {expected_mag:.2f}, got {net_mag:.4f}"',
                '"SUCCESS: net force computed correctly"',
              ].join('\n'),
              hint: `Use add_vectors([(120, 0), (80, 120), (60, 250)]). The function handles DSMD automatically.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-006-q1',
      question: `What are the four steps of the DSMD method in order?`,
      options: [
        `Direction → Sum → Magnitude → Decompose`,
        `Decompose → Sum → Magnitude → Direction`,
        `Magnitude → Decompose → Direction → Sum`,
        `Sum → Decompose → Direction → Magnitude`,
      ],
      answer: 1,
      explanation: `Decompose each vector into components, Sum the components, find the Magnitude, find the Direction. DSMD.`,
    },
    {
      id: 'p1-ch1-006-q2',
      question: `A vector has magnitude 25 N at 145°. What is its $x$-component (to 2 d.p.)?`,
      options: [`$+20.48$ N`, `$-20.48$ N`, `$+14.34$ N`, `$-14.34$ N`],
      answer: 1,
      explanation: `$A_x = 25\\cos145° = 25(-0.8192) \\approx -20.48$ N. The angle is in Quadrant II — negative $x$.`,
    },
    {
      id: 'p1-ch1-006-q3',
      question: `After decomposing three vectors, you get $R_x = -4$ N and $R_y = -3$ N. What is $|\\vec{R}|$?`,
      options: [`$7$ N`, `$5$ N`, `$1$ N`, `$\\sqrt{7}$ N`],
      answer: 1,
      explanation: `$|\\vec{R}| = \\sqrt{(-4)^2+(-3)^2} = \\sqrt{25} = 5$ N. The 3-4-5 triple.`,
    },
    {
      id: 'p1-ch1-006-q4',
      question: `Why is atan2 preferred over plain arctan for finding the angle?`,
      options: [
        `atan2 gives the answer in radians`,
        `arctan returns angles only in $(-90°, 90°)$; atan2 covers all four quadrants`,
        `atan2 is more accurate for large numbers`,
        `They give the same result always`,
      ],
      answer: 1,
      explanation: `$\\arctan(R_y/R_x)$ cannot tell Quadrant I from III, or II from IV. atan2$(R_y, R_x)$ uses both signs separately to return the correct quadrant.`,
    },
    {
      id: 'p1-ch1-006-q5',
      question: `$\\vec{A} = (5, 3)$ and $\\vec{B} = (2, -1)$. What is $\\vec{A} - \\vec{B}$?`,
      options: [`$(3, 4)$`, `$(7, 2)$`, `$(3, 2)$`, `$(7, 4)$`],
      answer: 0,
      explanation: `$\\vec{A} - \\vec{B} = (5-2, 3-(-1)) = (3, 4)$.`,
    },
    {
      id: 'p1-ch1-006-q6',
      question: `The numerical method for vector addition is:`,
      options: [
        `An approximation, accurate to 3 significant figures`,
        `Exact — it is the definition of vector addition in $\\mathbb{R}^2$`,
        `Only valid for right-angle problems`,
        `Less accurate than the parallelogram method`,
      ],
      answer: 1,
      explanation: `Component-wise addition is the formal definition of vector addition. Any error is purely from arithmetic rounding, not the method itself.`,
    },
    {
      id: 'p1-ch1-006-q7',
      question: `$\\vec{F}_1 = 50$ N at $0°$ and $\\vec{F}_2 = 50$ N at $180°$. What is the resultant?`,
      options: [`$100$ N at $0°$`, `$0$ N`, `$50$ N at $90°$`, `$50\\sqrt{2}$ N`],
      answer: 1,
      explanation: `$R_x = 50\\cos0° + 50\\cos180° = 50 - 50 = 0$, $R_y = 0$. Anti-parallel equal forces cancel.`,
    },
    {
      id: 'p1-ch1-006-q8',
      question: `Two forces $\\vec{A}$ at $+\\alpha$ and $\\vec{B} = |\\vec{A}|$ at $-\\alpha$ from $+x$. What is the direction of $\\vec{A} + \\vec{B}$?`,
      options: [`$\\alpha$`, `$-\\alpha$`, `$0°$ (along $+x$)`, `$90°$`],
      answer: 2,
      explanation: `By symmetry the $y$-components cancel ($\\sin\\alpha - \\sin\\alpha = 0$) and the $x$-components add ($2|A|\\cos\\alpha$). The resultant points along $+x$.`,
    },
  ],
}
