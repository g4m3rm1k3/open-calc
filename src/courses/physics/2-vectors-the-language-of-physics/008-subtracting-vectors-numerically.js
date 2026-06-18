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
    previewVisualizationProps: { type: 'vector-addition-chain' },
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
      `Take $\\vec{A} = 60$ N at $20°$ and $\\vec{B} = 45$ N at $110°$. Before reading on, predict: is $|\\vec{A}-\\vec{B}|$ closer to 15 N, 75 N, or 105 N? The graphical estimate is imprecise. Running the full numerical method gives 75.0 N — and we\'ll see exactly why in this lesson.`,
      `The numerical method for subtraction is identical to addition with one extra step: **negate $\\vec{B}$ before you start**. Negating a vector in component form flips the sign of every component: $-\\vec{B} = (-B_x, -B_y)$.`,
      `The five-step recipe: **(0) Negate** $\\vec{B}$: replace $(B_x, B_y)$ with $(-B_x, -B_y)$. **(1) Decompose** $\\vec{A}$ and $-\\vec{B}$. **(2) Sum**: $R_x = A_x + (-B_x)$, $R_y = A_y + (-B_y)$. **(3) Magnitude**: $|\\vec{R}| = \\sqrt{R_x^2+R_y^2}$. **(4) Direction**: $\\theta = \\operatorname{atan2}(R_y, R_x)$.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Numerical subtraction — 5 steps',
        body: `\\text{Step 0: } -\\vec{B} = (-B_x,-B_y).\\quad\\text{Steps 1–4: DSMD on }\\vec{A}\\text{ and }-\\vec{B}.`,
      },
      {
        type: 'definition',
        title: 'Subtraction as modified DSMD',
        body: `\\vec{A}-\\vec{B} = (A_x-B_x,\\;A_y-B_y)`,
      },
      {
        type: 'insight',
        title: 'In the component table, just flip signs',
        body: `Replace every $B_x$ with $-B_x$ and $B_y$ with $-B_y$ in the table. Everything else is identical to the addition procedure.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Negate first, then DSMD',
        caption: 'To compute A⃗ − B⃗ numerically: negate B⃗ by flipping signs → (−Bₓ, −By). Apply DSMD to A⃗ + (−B⃗). The result is (Aₓ − Bₓ, Ay − By). Components subtract axis by axis.',
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
        body: `|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi`,
      },
      {
        type: 'insight',
        title: 'Compare addition and subtraction magnitudes',
        body: `$|\\vec{A}+\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2+2|\\vec{A}||\\vec{B}|\\cos\\phi$ vs $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi$. Only the sign on the last term changes.`,
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
      'Since $\\vec{A}-\\vec{B} = \\vec{A}+(-\\vec{B})$ and vector addition is commutative and associative, subtraction inherits all the same computational properties. Note, however, that subtraction is neither commutative nor associative: $\\vec{A}-\\vec{B} \\ne \\vec{B}-\\vec{A}$ and $(\\vec{A}-\\vec{B})-\\vec{C} \\ne \\vec{A}-(\\vec{B}-\\vec{C})$.',
      'The law of cosines $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2\\vec{A}\\cdot\\vec{B}$ reveals the dot product $\\vec{A}\\cdot\\vec{B} = A_xB_x+A_yB_y$ as a measure of the "overlap" between two vectors. When $\\vec{A}\\perp\\vec{B}$, $\\vec{A}\\cdot\\vec{B}=0$ and the formula reduces to the Pythagorean theorem — confirming that the components are independent. This connection will be developed fully in Lesson 10.',
      'From an invariant viewpoint, the difference $\\vec{A}-\\vec{B}$ has a coordinate-free meaning: it is the displacement from the endpoint of $\\vec{B}$ to the endpoint of $\\vec{A}$, assuming both originate from the same reference point. This is why relative velocity is defined as $\\vec{v}_{A/B} = \\vec{v}_A - \\vec{v}_B$ — it does not depend on the choice of axis orientation.',
      'The polarisation identity $\\vec{A}\\cdot\\vec{B} = \\tfrac{1}{4}(|\\vec{A}+\\vec{B}|^2 - |\\vec{A}-\\vec{B}|^2)$ shows that the dot product can be computed entirely from the magnitudes of the sum and difference. Geometrically: the two diagonals of the parallelogram completely determine the dot product of its sides. Vector subtraction is not just a computational step — it is a fundamental operation in the geometry of inner-product spaces.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Subtraction is not commutative',
        body: `\\vec{A}-\\vec{B} = -(\\vec{B}-\\vec{A})`,
      },
      {
        type: 'warning',
        title: 'Subtraction is not associative',
        body: `(\\vec{A}-\\vec{B})-\\vec{C} = \\vec{A}-\\vec{B}-\\vec{C} \\ne \\vec{A}-(\\vec{B}-\\vec{C}) = \\vec{A}-\\vec{B}+\\vec{C}`,
      },
    ],
    proofSteps: [
      {
        title: 'Component subtraction',
        expression: `\\vec{A} - \\vec{B} = (A_x - B_x,\\; A_y - B_y)`,
        annotation: 'Fundamental definition. We use it to derive the law of cosines for vectors.',
      },
      {
        title: 'Square the magnitude',
        expression: `|\\vec{A} - \\vec{B}|^2 = (A_x - B_x)^2 + (A_y - B_y)^2`,
        annotation: 'Pythagorean theorem applied to the resultant components.',
      },
      {
        title: 'Expand and regroup',
        expression: `= (A_x^2 + A_y^2) + (B_x^2 + B_y^2) - 2(A_xB_x + A_yB_y)`,
        annotation: 'Expand the squares and recognise the squared magnitudes of A and B.',
      },
      {
        title: 'Recognise the dot product',
        expression: `= |\\vec{A}|^2 + |\\vec{B}|^2 - 2(\\vec{A} \\cdot \\vec{B})`,
        annotation: 'The cross term is the dot product: $A_xB_x + A_yB_y = \\vec{A}\\cdot\\vec{B}$.',
      },
      {
        title: 'Law of cosines',
        expression: `= |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi`,
        annotation: 'Substitute $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi$. This is the classical law of cosines for the triangle formed by $\\vec{A}$, $\\vec{B}$, and $\\vec{A}-\\vec{B}$.',
      },
    ],
    title: 'Derivation: law of cosines for |A⃗ − B⃗|',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Law of cosines — triangle formed by A⃗, B⃗, A⃗−B⃗',
        caption: `Three sides: $|\\vec{A}|$, $|\\vec{B}|$, $|\\vec{A}-\\vec{B}|$. The formula $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi$ follows from expanding the squared magnitude.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-008-ex1',
      title: 'A⃗ − B⃗ at non-trivial angles — full 5-step walkthrough',
      problem: `\\vec{A}=60\\,N\\text{ at }20°,\\;\\vec{B}=45\\,N\\text{ at }110°.\\text{ Find }\\vec{A}-\\vec{B}.`,
      steps: [
        { expression: 'A_x=60\\cos20°=56.38\\,N,\\;A_y=60\\sin20°=20.52\\,N', annotation: 'Step 1: decompose A. 20° is Q-I — both positive.' },
        { expression: 'B_x=45\\cos110°=-15.39\\,N,\\;B_y=45\\sin110°=42.29\\,N', annotation: 'Step 1: decompose B. 110° is Q-II — negative x.' },
        { expression: '-B_x=15.39\\,N,\\;-B_y=-42.29\\,N', annotation: 'Step 0: negate B. Flip all signs.' },
        { expression: 'R_x=56.38+15.39=71.77\\,N,\\;R_y=20.52+(-42.29)=-21.77\\,N', annotation: 'Step 2: sum. Equivalent to $A_x - B_x$ and $A_y - B_y$.' },
        { expression: '|\\vec{R}|=\\sqrt{71.77^2+21.77^2}\\approx74.99\\,N', annotation: 'Step 3: magnitude.' },
        { expression: '\\theta=\\operatorname{atan2}(-21.77,\\;71.77)\\approx-16.9°', annotation: 'Step 4: $R_x > 0$, $R_y < 0$ → Q-IV. 16.9° below the x-axis.' },
      ],
      conclusion: '$\\vec{A}-\\vec{B} \\approx 75.0\\,N$ at $-16.9°$ (16.9° below east).',
    },
    {
      id: 'ch1-008-ex2',
      title: 'Relative velocity — Car A relative to Car B',
      problem: `\\text{Car A: }\\vec{v}_A=25\\,\\text{m/s east. Car B: }\\vec{v}_B=20\\,\\text{m/s at }30°. \\text{Find }\\vec{v}_{A/B}=\\vec{v}_A-\\vec{v}_B.`,
      steps: [
        { expression: 'v_{Ax}=25,\\;v_{Ay}=0', annotation: 'A moves purely east.' },
        { expression: 'v_{Bx}=20\\cos30°=17.32,\\;v_{By}=20\\sin30°=10.00', annotation: 'Decompose B.' },
        { expression: 'R_x=25-17.32=7.68,\\;R_y=0-10.00=-10.00', annotation: 'Subtract component-wise.' },
        { expression: '|\\vec{v}_{A/B}|=\\sqrt{7.68^2+10^2}\\approx12.6\\,\\text{m/s}', annotation: 'Magnitude.' },
        { expression: '\\theta\\approx-52.5°', annotation: 'Q-IV — southeast. From B\'s perspective, A moves southeast.' },
      ],
      conclusion: `From B's perspective, A appears to move at $12.6$ m/s at $52.5°$ below east (southeast).`,
    },
    {
      id: 'ch1-008-ex3',
      title: 'Centripetal acceleration via velocity difference',
      problem: `\\text{A particle moves at constant speed 10 m/s in a circle. At }t_1\\text{ its velocity is }\\vec{v}_1=10\\,\\text{m/s east. At }t_2\\text{ (after 90° of arc) it is }\\vec{v}_2=10\\,\\text{m/s north. Find }|\\Delta\\vec{v}|.`,
      steps: [
        { expression: '\\Delta v_x = 0 - 10 = -10\\,\\text{m/s}', annotation: 'x-component: north has no x.' },
        { expression: '\\Delta v_y = 10 - 0 = 10\\,\\text{m/s}', annotation: 'y-component: east has no y.' },
        { expression: '|\\Delta\\vec{v}| = \\sqrt{(-10)^2+10^2} = 10\\sqrt{2} \\approx 14.14\\,\\text{m/s}', annotation: 'Magnitude of velocity change — even though the speed never changed from 10 m/s.' },
        { expression: '\\theta = \\operatorname{atan2}(10,-10) = 135°\\text{ (northwest)}', annotation: 'The velocity changed toward the center of the circle.' },
      ],
      conclusion: '$|\\Delta\\vec{v}| = 10\\sqrt{2}$ m/s pointing northwest. The speed was constant, yet the velocity change is nonzero — this is what produces centripetal acceleration.',
    },
  ],

  challenges: [
    {
      id: 'ch1-008-ch1',
      difficulty: 'easy',
      problem: `\\vec{A}=(8,6),\\;\\vec{B}=(3,-2).\\text{ Find }|\\vec{A}-\\vec{B}|.`,
      hint: 'Subtract components first, then find magnitude.',
      walkthrough: [
        { expression: '\\vec{A}-\\vec{B}=(8-3,\\;6-(-2))=(5,8)', annotation: 'Component subtraction.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{25+64}=\\sqrt{89}\\approx9.43', annotation: 'Pythagorean theorem.' },
      ],
      answer: `|\\vec{A}-\\vec{B}|=\\sqrt{89}\\approx9.43`,
    },
    {
      id: 'ch1-008-ch2',
      difficulty: 'medium',
      problem: `\\text{Using the law of cosines, find }|\\vec{A}-\\vec{B}|\\text{ where }|\\vec{A}|=10,\\;|\\vec{B}|=8,\\;\\phi=60°.`,
      hint: `$|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi$`,
      walkthrough: [
        { expression: '|\\vec{A}-\\vec{B}|^2=100+64-2(10)(8)(0.5)=164-80=84', annotation: '$\\cos60°=0.5$.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{84}=2\\sqrt{21}\\approx9.17', annotation: 'Take the square root.' },
      ],
      answer: `|\\vec{A}-\\vec{B}|=2\\sqrt{21}\\approx9.17`,
    },
    {
      id: 'ch1-008-ch3',
      difficulty: 'hard',
      problem: `\\text{Two vectors have } |\\vec{A}| = |\\vec{B}| = F \\text{ and an angle } \\phi \\text{ between them. Show that } |\\vec{A}-\\vec{B}| = 2F\\sin(\\phi/2).`,
      hint: 'Apply the law of cosines for $|\\vec{A}-\\vec{B}|$, then use the half-angle identity $1 - \\cos\\phi = 2\\sin^2(\\phi/2)$.',
      walkthrough: [
        { expression: '|\\vec{A}-\\vec{B}|^2 = F^2+F^2-2F^2\\cos\\phi = 2F^2(1-\\cos\\phi)', annotation: 'Law of cosines with $|\\vec{A}|=|\\vec{B}|=F$.' },
        { expression: '1-\\cos\\phi = 2\\sin^2(\\phi/2)', annotation: 'Half-angle identity.' },
        { expression: '|\\vec{A}-\\vec{B}|^2 = 2F^2 \\cdot 2\\sin^2(\\phi/2) = 4F^2\\sin^2(\\phi/2)', annotation: 'Substitute.' },
        { expression: '|\\vec{A}-\\vec{B}| = 2F\\sin(\\phi/2)\\;\\checkmark', annotation: 'Take the square root. At $\\phi=90°$: $2F\\sin45° = F\\sqrt{2}$ — confirming the perpendicular case.' },
      ],
      answer: `|\\vec{A}-\\vec{B}| = 2F\\sin(\\phi/2)`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: '5-step numerical subtraction: 60 N at 20° minus 45 N at 110°',
          type: 'code',
          language: 'python',
          code: `import numpy as np

A_mag, A_ang = 60.0, 20.0
B_mag, B_ang = 45.0, 110.0

# Step 1 — Decompose
A = np.array([A_mag*np.cos(np.radians(A_ang)),
              A_mag*np.sin(np.radians(A_ang))])
B = np.array([B_mag*np.cos(np.radians(B_ang)),
              B_mag*np.sin(np.radians(B_ang))])

# Step 0 — Negate (or just use A - B directly)
R = A - B

print(f"A   = ({A[0]:.2f}, {A[1]:.2f})")
print(f"B   = ({B[0]:.2f}, {B[1]:.2f})")
print(f"-B  = ({-B[0]:.2f}, {-B[1]:.2f})")
print(f"R   = A - B = ({R[0]:.2f}, {R[1]:.2f})")
print(f"|R| = {np.linalg.norm(R):.4f} N")
print(f"theta = {np.degrees(np.arctan2(R[1], R[0])):.2f} degrees")`,
          prose: [
            `Steps 1–4 are identical to the DSMD addition method. Step 0 is implicit in \`R = A - B\`: NumPy's subtraction operator negates B element-wise then adds. So \`A - B\` computes $(A_x - B_x, A_y - B_y)$ in one operation.`,
            `Notice \`-B = (15.39, -42.29)\` — flipping the signs of B's components. This is $110° + 180° = 290°$ direction (Q-IV), exactly the "flip the arrow" operation from the graphical lesson.`,
            `Result: $|\\vec{R}| \\approx 75.0$ N at $-16.9°$ (Q-IV). Compare to $|\\vec{A}+\\vec{B}|$ by changing \`R = A + B\` — the sum is in a very different direction, showing how addition and subtraction diverge for non-parallel vectors.`,
          ],
        },
        {
          cellTitle: 'Law of cosines: formula vs direct subtraction',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt

# Verify: law of cosines matches direct component method
A_mag, B_mag = 10.0, 8.0
angles = np.linspace(0, 180, 181)

diff_cos_law = np.sqrt(A_mag**2 + B_mag**2
                       - 2*A_mag*B_mag*np.cos(np.radians(angles)))
diff_direct  = [np.linalg.norm(
    np.array([A_mag, 0]) -
    np.array([B_mag*np.cos(np.radians(a)), B_mag*np.sin(np.radians(a))])
) for a in angles]

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(angles, diff_cos_law, 'b-', lw=2, label='Law of cosines')
ax.plot(angles, diff_direct,  'r--', lw=2, label='Direct (component)', alpha=0.6)
ax.set_xlabel('Angle between vectors phi (degrees)')
ax.set_ylabel('|A - B|')
ax.set_title('Two methods, identical results')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()

# Spot-check at phi=60
phi = 60
R_loc = np.sqrt(A_mag**2 + B_mag**2 - 2*A_mag*B_mag*np.cos(np.radians(phi)))
print(f"phi=60: law of cosines = {R_loc:.4f}, should be sqrt(84)={np.sqrt(84):.4f}")`,
          prose: [
            `The law of cosines formula $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi$ is vectorised: \`np.cos(np.radians(angles))\` computes cosine for all 181 angles at once.`,
            `The blue (formula) and red-dashed (direct) curves overlap exactly — proving the law of cosines is just an algebraic reformulation of the component method, not an independent formula.`,
            `Notice: $|\\vec{A}-\\vec{B}|$ is smallest (= $|A-B| = 2$) when $\\phi = 0°$ (parallel, same direction) and largest (= $|A+B| = 18$) when $\\phi = 180°$ (anti-parallel). Subtraction and addition swap roles at $180°$.`,
          ],
        },
        {
          cellTitle: 'Relative velocity and non-commutativity',
          type: 'code',
          language: 'python',
          code: `vA = np.array([25.0, 0.0])   # Car A: east
vB = np.array([20*np.cos(np.radians(30)), 20*np.sin(np.radians(30))])

v_A_rel_B = vA - vB   # velocity of A as seen from B
v_B_rel_A = vB - vA   # velocity of B as seen from A

print(f"v_A = {vA}")
print(f"v_B = {vB.round(4)}")
print()
print(f"v_(A/B) = {v_A_rel_B.round(4)}  |v| = {np.linalg.norm(v_A_rel_B):.4f}")
print(f"v_(B/A) = {v_B_rel_A.round(4)}  |v| = {np.linalg.norm(v_B_rel_A):.4f}")
print()
print(f"Antiparallel (sum = 0): {np.allclose(v_A_rel_B + v_B_rel_A, 0)}")`,
          prose: [
            `\`vA - vB\` gives the velocity of A as measured by an observer moving with B. \`vB - vA\` gives the velocity of B measured by an observer moving with A. Both have the same magnitude ($12.6$ m/s) but point in opposite directions.`,
            `\`np.allclose(v_A_rel_B + v_B_rel_A, 0)\` returns True — confirming $\\vec{v}_{A/B} = -\\vec{v}_{B/A}$. This is non-commutativity of subtraction expressed as a symmetry: relative velocities are equal in magnitude, opposite in direction.`,
            `This anti-symmetry underpins the principle of relative motion: if A sees B moving at 12.6 m/s southeast, then B must see A moving at 12.6 m/s northwest. Einstein's special relativity generalises this to speeds approaching $c$.`,
          ],
        },
        {
          cellTitle: 'Challenge: centripetal velocity change',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# Particle in circular motion, speed = 10 m/s:
# v1 = 10 m/s east (0 degrees)
# v2 = 10 m/s north (90 degrees)
# Compute delta_v = v2 - v1 and its magnitude.

v1 = np.array([___, ___])   # east
v2 = np.array([___, ___])   # north
delta_v = ___ - ___
mag = np.linalg.norm(___)
ang = np.degrees(np.arctan2(___, ___))

print(f"|delta_v| = {mag:.4f} m/s")
print(f"angle = {ang:.2f} degrees")`,
          prose: [
            `\`v1 = np.array([10, 0])\` (east) and \`v2 = np.array([0, 10])\` (north). \`delta_v = v2 - v1 = [-10, 10]\`. Expected: $|\\Delta\\vec{v}| = 10\\sqrt{2} \\approx 14.14$ m/s at $135°$ (northwest).`,
            `Even though the speed stayed constant at 10 m/s, the velocity changed by $10\\sqrt{2}$ m/s. This is the centripetal velocity change — it always points toward the center of the circle (inward).`,
            `Try changing the arc to 180° (v2 = [-10, 0]) — a half-circle. What is $|\\Delta\\vec{v}|$? For anti-parallel velocities of equal speed, $|\\Delta\\vec{v}| = 2v$ (maximum possible).`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: '5-step numerical subtraction: 60 N at 20° minus 45 N at 110°',
          type: 'code',
          language: 'matlab',
          code: `A_mag = 60; A_ang = 20;
B_mag = 45; B_ang = 110;

% Step 1 — Decompose
A = [A_mag*cosd(A_ang), A_mag*sind(A_ang)];
B = [B_mag*cosd(B_ang), B_mag*sind(B_ang)];

% A - B (step 0 + steps 2-4)
R = A - B;

fprintf('A    = [%.2f, %.2f]\\n', A(1), A(2))
fprintf('B    = [%.2f, %.2f]\\n', B(1), B(2))
fprintf('-B   = [%.2f, %.2f]\\n', -B(1), -B(2))
fprintf('R    = [%.2f, %.2f]\\n', R(1), R(2))
fprintf('|R|  = %.4f N\\n', norm(R))
fprintf('theta= %.2f degrees\\n', atan2d(R(2), R(1)))`,
          prose: [
            `\`A = [A_mag*cosd(A_ang), A_mag*sind(A_ang)]\` decomposes using \`cosd\`/\`sind\` (degree input). \`R = A - B\` is element-wise subtraction: $R_x = A_x - B_x$, $R_y = A_y - B_y$. Step 0 (negate) is implicit.`,
            `Compare \`-B = [15.39, -42.29]\` — this is the negated B vector. Note it points in the direction $110° + 180° = 290°$, consistent with "flipping the arrow 180°" from the graphical lesson.`,
            `Result: $|\\vec{R}| \\approx 75.0$ N at $-16.9°$. Test: change to \`R = A + B\` — the addition gives a very different direction, confirming that subtraction is geometrically distinct from addition.`,
          ],
        },
        {
          cellTitle: 'Law of cosines: formula vs direct subtraction',
          type: 'code',
          language: 'matlab',
          code: `A_mag = 10; B_mag = 8;
phi_deg = 0:1:180;

diff_cos_law = sqrt(A_mag^2 + B_mag^2 - 2*A_mag*B_mag*cosd(phi_deg));
Bx = B_mag .* cosd(phi_deg);
By = B_mag .* sind(phi_deg);
diff_direct  = sqrt((A_mag - Bx).^2 + (0 - By).^2);

figure
plot(phi_deg, diff_cos_law, 'b-', 'LineWidth', 2); hold on
plot(phi_deg, diff_direct, 'r--', 'LineWidth', 2)
xlabel('Angle phi (degrees)'); ylabel('|A - B|')
title('Law of cosines = direct method')
legend('Law of cosines','Direct'); grid on

% Spot-check at phi=60
R60 = sqrt(A_mag^2 + B_mag^2 - 2*A_mag*B_mag*cosd(60));
fprintf('phi=60: |A-B| = %.4f, sqrt(84) = %.4f\\n', R60, sqrt(84))`,
          prose: [
            `\`cosd(phi_deg)\` takes the degree array directly. The \`.*\` operator applies element-wise to compute $B_x$ and $B_y$ for all 181 angles at once — no loop needed.`,
            `The blue (formula) and red-dashed (direct) curves overlap exactly everywhere. This visual confirmation matches the algebraic proof: the law of cosines is just the component method rearranged.`,
            `At $\\phi = 60°$: \`R60 = sqrt(84) ≈ 9.165\`. At $\\phi = 0°$: $|\\vec{A}-\\vec{B}| = |A - B| = 2$ (parallel, closest). At $\\phi = 180°$: $|\\vec{A}-\\vec{B}| = A + B = 18$ (anti-parallel, farthest).`,
          ],
        },
        {
          cellTitle: 'Relative velocity and non-commutativity',
          type: 'code',
          language: 'matlab',
          code: `vA = [25, 0];
vB = [20*cosd(30), 20*sind(30)];

v_A_rel_B = vA - vB;
v_B_rel_A = vB - vA;

fprintf('v_(A/B) = [%.4f, %.4f]  |v| = %.4f\\n', ...
        v_A_rel_B(1), v_A_rel_B(2), norm(v_A_rel_B))
fprintf('v_(B/A) = [%.4f, %.4f]  |v| = %.4f\\n', ...
        v_B_rel_A(1), v_B_rel_A(2), norm(v_B_rel_A))

antiparallel = all(abs(v_A_rel_B + v_B_rel_A) < 1e-10);
fprintf('Antiparallel (sum=0): %d\\n', antiparallel)`,
          prose: [
            `\`vA - vB\` is A's velocity from B's frame; \`vB - vA\` is B's velocity from A's frame. Both have magnitude $\\approx 12.6$ m/s but in opposite directions.`,
            `\`all(abs(v_A_rel_B + v_B_rel_A) < 1e-10)\` returns 1, confirming $\\vec{v}_{A/B} + \\vec{v}_{B/A} = \\vec{0}$, i.e. $\\vec{v}_{A/B} = -\\vec{v}_{B/A}$. This is the non-commutativity of subtraction as a physical symmetry.`,
            `In navigation and aerospace, this symmetry is used constantly: if a GPS unit on vehicle B reports A closing at 12.6 m/s, then A's GPS must show B closing at exactly the same speed from the opposite direction.`,
          ],
        },
        {
          cellTitle: 'Challenge: centripetal velocity change',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Particle in circular motion, speed = 10 m/s
% v1 = east (0 deg), v2 = north (90 deg)
% Compute delta_v = v2 - v1

v1 = [___, ___];
v2 = [___, ___];
delta_v = ___ - ___;
mag = norm(___);
ang = atan2d(___,___);

fprintf('|delta_v| = %.4f m/s\\n', mag)
fprintf('angle = %.2f degrees\\n', ang)`,
          prose: [
            `\`v1 = [10, 0]\` (east), \`v2 = [0, 10]\` (north). \`delta_v = v2 - v1 = [-10, 10]\`. \`norm(delta_v) = sqrt(200) = 10*sqrt(2) ≈ 14.14\` m/s. \`atan2d(10, -10) = 135°\` (northwest).`,
            `The result is always directed toward the center of curvature for circular motion — that's the definition of centripetal acceleration direction. The formula $|\\Delta\\vec{v}| = 2v\\sin(\\phi/2)$ from the hard challenge gives $2(10)\\sin(45°) = 10\\sqrt{2}$ — matches.`,
            `Try \`v1 = [10, 0]\`, \`v2 = [-10, 0]\` (half-circle, 180°). The result is \`delta_v = [-20, 0]\`, magnitude 20 m/s — the maximum possible velocity change for speed 10 m/s.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-008-q1',
      type: 'choice',
      question: `What is "Step 0" in the five-step numerical subtraction method?`,
      options: [
        `Compute the magnitude of $\\vec{B}$`,
        `Negate $\\vec{B}$: replace $(B_x, B_y)$ with $(-B_x, -B_y)$`,
        `Draw a diagram`,
        `Find the angle between $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: `Negate $\\vec{B}$: replace $(B_x, B_y)$ with $(-B_x, -B_y)$`,
      hints: [`Subtraction is addition of the negated vector.`, `After this step, you just run DSMD as usual.`],
      reviewSection: 'intuition',
      explanation: `Subtraction is addition of the negated vector. Step 0 is the negation; Steps 1–4 are the standard DSMD.`,
    },
    {
      id: 'p1-ch1-008-q2',
      type: 'choice',
      question: `$\\vec{A} = (8, 6)$, $\\vec{B} = (3, -2)$. What is $\\vec{A} - \\vec{B}$?`,
      options: [`$(5, 4)$`, `$(11, 4)$`, `$(5, 8)$`, `$(11, 8)$`],
      answer: `$(5, 8)$`,
      hints: [`Subtract component-by-component: $(8-3,\\; 6-(-2))$.`, `Watch the sign: subtracting a negative is adding.`],
      reviewSection: 'examples',
      explanation: `$(8-3, 6-(-2)) = (5, 8)$.`,
    },
    {
      id: 'p1-ch1-008-q3',
      type: 'choice',
      question: `$|\\vec{A}| = 10$, $|\\vec{B}| = 8$, angle between them $\\phi = 60°$. Find $|\\vec{A}-\\vec{B}|$.`,
      options: [`$\\sqrt{84}$`, `$\\sqrt{244}$`, `$\\sqrt{4}$`, `$\\sqrt{164}$`],
      answer: `$\\sqrt{84}$`,
      hints: [`Use $|\\vec{A}-\\vec{B}|^2 = |A|^2 + |B|^2 - 2|A||B|\\cos\\phi$.`, `$\\cos 60° = 0.5$`],
      reviewSection: 'math',
      explanation: `$|\\vec{A}-\\vec{B}|^2 = 100 + 64 - 2(10)(8)(0.5) = 84$.`,
    },
    {
      id: 'p1-ch1-008-q4',
      type: 'choice',
      question: `Which property does vector subtraction NOT have?`,
      options: [
        `It produces a vector result`,
        `Commutativity`,
        `It is defined for any two vectors`,
        `The result has a magnitude`,
      ],
      answer: `Commutativity`,
      hints: [`Is $\\vec{A} - \\vec{B} = \\vec{B} - \\vec{A}$?`, `What is $\\vec{B} - \\vec{A}$ in terms of $\\vec{A} - \\vec{B}$?`],
      reviewSection: 'rigor',
      explanation: `$\\vec{A}-\\vec{B} \\ne \\vec{B}-\\vec{A}$ in general — they are antiparallel. Subtraction is not commutative.`,
    },
    {
      id: 'p1-ch1-008-q5',
      type: 'choice',
      question: `The law of cosines for $|\\vec{A}-\\vec{B}|^2$ differs from the one for $|\\vec{A}+\\vec{B}|^2$ by:`,
      options: [
        `The sign of $|\\vec{A}|^2$`,
        `The sign of the $2|\\vec{A}||\\vec{B}|\\cos\\phi$ term`,
        `They are identical`,
        `A factor of 2`,
      ],
      answer: `The sign of the $2|\\vec{A}||\\vec{B}|\\cos\\phi$ term`,
      hints: [`Write both formulas side by side.`, `Addition: $+2|A||B|\\cos\\phi$. Subtraction: $-2|A||B|\\cos\\phi$.`],
      reviewSection: 'math',
      explanation: `Addition: $|\\vec{A}+\\vec{B}|^2 = |A|^2+|B|^2+2|A||B|\\cos\\phi$. Subtraction: $|\\vec{A}-\\vec{B}|^2 = |A|^2+|B|^2-2|A||B|\\cos\\phi$. Only that sign changes.`,
    },
    {
      id: 'p1-ch1-008-q6',
      type: 'choice',
      question: `Car A: 25 m/s east. Car B: 25 m/s north. What is $|\\vec{v}_{A/B}|$?`,
      options: [`$0$ m/s`, `$50$ m/s`, `$25\\sqrt{2}$ m/s`, `$25$ m/s`],
      answer: `$25\\sqrt{2}$ m/s`,
      hints: [`$\\vec{v}_{A/B} = \\vec{v}_A - \\vec{v}_B = (25, 0) - (0, 25)$.`, `What is the magnitude of $(25, -25)$?`],
      reviewSection: 'examples',
      explanation: `$\\vec{v}_{A/B} = (25-0, 0-25) = (25, -25)$. $|\\vec{v}_{A/B}| = \\sqrt{625+625} = 25\\sqrt{2}$ m/s.`,
    },
    {
      id: 'p1-ch1-008-q7',
      type: 'choice',
      question: `$(\\vec{A} - \\vec{B}) - \\vec{C}$ equals:`,
      options: [
        `$\\vec{A} - (\\vec{B} - \\vec{C})$`,
        `$\\vec{A} - \\vec{B} - \\vec{C}$`,
        `They are always equal`,
        `$\\vec{A} + \\vec{B} - \\vec{C}$`,
      ],
      answer: `$\\vec{A} - \\vec{B} - \\vec{C}$`,
      hints: [`Expand both expressions into components.`, `$(\\vec{A}-\\vec{B})-\\vec{C}$ vs $\\vec{A}-(\\vec{B}-\\vec{C}) = \\vec{A}-\\vec{B}+\\vec{C}$`],
      reviewSection: 'rigor',
      explanation: `$(\\vec{A}-\\vec{B})-\\vec{C} = \\vec{A}-\\vec{B}-\\vec{C}$, but $\\vec{A}-(\\vec{B}-\\vec{C}) = \\vec{A}-\\vec{B}+\\vec{C}$. Subtraction is not associative.`,
    },
    {
      id: 'p1-ch1-008-q8',
      type: 'choice',
      question: `In the numerical method, after negating $\\vec{B}$, the next step is:`,
      options: [
        `Find $|\\vec{A}-\\vec{B}|$ immediately`,
        `Decompose both $\\vec{A}$ and $-\\vec{B}$ into components`,
        `Draw the parallelogram`,
        `Apply the law of cosines`,
      ],
      answer: `Decompose both $\\vec{A}$ and $-\\vec{B}$ into components`,
      hints: [`After Step 0 (negate), you proceed with the standard DSMD steps.`, `Step 1 is always Decompose.`],
      reviewSection: 'intuition',
      explanation: `After Step 0 (negate), Step 1 is Decompose: find $A_x, A_y$ and $-B_x, -B_y$. Then Sum, Magnitude, Direction.`,
    },
    {
      id: 'p1-ch1-008-q9',
      type: 'choice',
      question: `A particle moves at constant speed 10 m/s in a circle. It turns 90°. What is $|\\Delta\\vec{v}|$?`,
      options: [`$0$ m/s`, `$10$ m/s`, `$10\\sqrt{2}$ m/s`, `$20$ m/s`],
      answer: `$10\\sqrt{2}$ m/s`,
      hints: [`The velocity components before and after are perpendicular — use the Pythagorean theorem.`, `$\\Delta v_x = v_{fx} - v_{ix}$, $\\Delta v_y = v_{fy} - v_{iy}$`],
      reviewSection: 'examples',
      explanation: `$\\vec{v}_1 = (10, 0)$, $\\vec{v}_2 = (0, 10)$. $\\Delta\\vec{v} = (-10, 10)$. $|\\Delta\\vec{v}| = \\sqrt{200} = 10\\sqrt{2}$ m/s.`,
    },
    {
      id: 'p1-ch1-008-q10',
      type: 'choice',
      question: `Two vectors of equal magnitude $F$ and angle $\\phi$ between them. Using $|\\vec{A}-\\vec{B}| = 2F\\sin(\\phi/2)$, what is $|\\vec{A}-\\vec{B}|$ when $\\phi = 180°$?`,
      options: [`$0$`, `$F$`, `$2F$`, `$F\\sqrt{2}$`],
      answer: `$2F$`,
      hints: [`$\\phi = 180°$ means anti-parallel.`, `$2F\\sin(90°) = ?$`],
      reviewSection: 'challenges',
      explanation: `$2F\\sin(180°/2) = 2F\\sin(90°) = 2F$. Anti-parallel vectors of equal magnitude have maximum difference: $\\vec{A} - (-\\vec{A}) = 2\\vec{A}$.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-008-m1',
      title: 'Using the addition law of cosines formula for subtraction',
      description: `Students remember $|\\vec{A}+\\vec{B}|^2 = |A|^2 + |B|^2 + 2|A||B|\\cos\\phi$ and use it for differences too, getting the wrong sign on the last term.`,
      correctionExample: `For $|A|=10$, $|B|=8$, $\\phi=60°$: addition formula gives $100+64+80(0.5) = 204$ → $|\\vec{A}+\\vec{B}| \\approx 14.3$ N. Subtraction formula uses MINUS: $100+64-80(0.5) = 124$ → $|\\vec{A}-\\vec{B}| \\approx 11.1$ N. Forgetting the sign change gives a result that's actually the sum, not the difference.`,
    },
    {
      id: 'p1-ch1-008-m2',
      title: 'Forgetting to negate before applying DSMD',
      description: `Students run DSMD on $\\vec{A}$ and $\\vec{B}$ without negating first, computing $\\vec{A} + \\vec{B}$ instead of $\\vec{A} - \\vec{B}$.`,
      correctionExample: `For $\\vec{A} = 60$ N at $20°$ and $\\vec{B} = 45$ N at $110°$: without negation, $R_x = 56.38 + (-15.39) = 40.99$ N and $R_y = 20.52 + 42.29 = 62.81$ N → this is $\\vec{A}+\\vec{B}$. With negation, $R_x = 56.38 + 15.39 = 71.77$ N and $R_y = 20.52 - 42.29 = -21.77$ N → this is $\\vec{A}-\\vec{B}$. The sign of $B_x$ flips from $-15.39$ to $+15.39$.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-008-t1',
      prompt: `A football player runs at 6 m/s east. A defender runs at 5 m/s at 30° NE. Use numerical subtraction to find the velocity of the ball carrier relative to the defender. What does this tell the defender about which way to angle his tackle?`,
    },
    {
      id: 'p1-ch1-008-t2',
      prompt: `In a GPS system, two position vectors are $\\vec{r}_1 = (400, 300)$ m and $\\vec{r}_2 = (600, 100)$ m. The displacement $\\vec{d} = \\vec{r}_2 - \\vec{r}_1$ represents how far and in what direction you moved. Compute $\\vec{d}$, $|\\vec{d}|$, and its bearing (angle east of north = $90° - \\theta$).`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-008-d1',
      title: 'Wrong sign in law of cosines for subtraction',
      buggyCode: `# Finding |A - B| where |A|=10, |B|=8, phi=60 degrees
phi = np.radians(60)
result = np.sqrt(10**2 + 8**2 + 2*10*8*np.cos(phi))   # wrong: + sign`,
      explanation: `This computes $|\\vec{A}+\\vec{B}|$, not $|\\vec{A}-\\vec{B}|$. The subtraction formula has a minus sign: $|\\vec{A}-\\vec{B}|^2 = |A|^2 + |B|^2 - 2|A||B|\\cos\\phi$.`,
      fix: `result = np.sqrt(10**2 + 8**2 - 2*10*8*np.cos(phi))   # correct: minus sign`,
    },
    {
      id: 'p1-ch1-008-d2',
      title: 'Applying DSMD without negating B first',
      buggyCode: `# Intended: A - B where B = (15.39, -42.29) — already decomposed
# Student forgot to negate B before summing
Rx = 56.38 + (-15.39)   # correct A_x + B_x (addition)
Ry = 20.52 + 42.29      # wrong: should subtract B_y`,
      explanation: `This computes $A_x + B_x$ and $A_y + B_y$ — which is addition, not subtraction. Step 0 must negate B: the correct Row is $(-B_x, -B_y) = (15.39, -42.29)$.`,
      fix: `neg_Bx = -(-15.39)   # negate: +15.39
neg_By = -42.29      # negate: -42.29 (was positive)
Rx = 56.38 + neg_Bx  # = 71.77
Ry = 20.52 + neg_By  # = -21.77`,
    },
  ],

  mastery: {
    targetLevel: `Apply the 5-step numerical subtraction method (negate + DSMD) to any pair of vectors. Use the law of cosines shortcut $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi$ when only magnitudes and angle are given. Compute relative velocities and verify non-commutativity.`,
    prerequisites: [`DSMD method for addition (Lesson 6)`, `Graphical subtraction and the negative vector (Lesson 7)`],
    enables: [`Adding force vectors in statics (Lesson 9)`, `Dot product definition (Lesson 10)`, `Kinematics: acceleration, relative velocity`],
    commonStuckPoints: [
      `Using the addition law of cosines (+ sign) when computing differences`,
      `Forgetting to negate B before running DSMD`,
      `Confusing $|\\Delta\\vec{v}|$ with the scalar speed change`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\vec{A} - \\vec{B} = (A_x - B_x,\\; A_y - B_y)`, meaning: `Vector subtraction — component-wise; same as adding the negated vector` },
      { symbol: `|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi`, meaning: `Law of cosines for differences — the minus sign distinguishes it from addition` },
      { symbol: `\\vec{v}_{A/B} = \\vec{v}_A - \\vec{v}_B`, meaning: `Velocity of A relative to B — a vector difference` },
      { symbol: `\\vec{v}_{A/B} = -\\vec{v}_{B/A}`, meaning: `Relative velocity anti-symmetry — non-commutativity of subtraction as a physical law` },
      { symbol: `|\\vec{A}-\\vec{B}| = 2F\\sin(\\phi/2)`, meaning: `Difference magnitude when both vectors have equal length F` },
    ],
    rulesOfThumb: [
      `$\\vec{A} - \\vec{B}$ = negate B's components, then add (DSMD from Step 1).`,
      `Law of cosines for differences: MINUS sign on the $2|A||B|\\cos\\phi$ term.`,
      `$\\vec{v}_{A/B} = -\\vec{v}_{B/A}$ — relative velocity is anti-symmetric.`,
      `$|\\Delta\\vec{v}|$ is the magnitude of the vector difference, not the scalar speed change.`,
      `For equal speeds turning through angle $\\phi$: $|\\Delta\\vec{v}| = 2v\\sin(\\phi/2)$.`,
    ],
  },
}
