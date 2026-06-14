export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-015',
  slug: 'cross-product-calculator',
  chapter: 'p1',
  order: 15,
  title: 'Cross Product — Numerical Calculation',
  subtitle: 'Expand the determinant component by component. Every step has a pattern — learn it once, use it forever.',
  tags: ['cross product', 'determinant', 'component calculation', '3D vectors', 'normal vector', 'torque', 'surface normal'],
  aliases: 'cross product numerical calculation determinant component form expansion minor cofactor',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: `Your drone's navigation computer has three vectors describing its orientation. How does it compute the axis perpendicular to its nose direction and wing direction — in milliseconds, automatically?`,
    realWorldContext:
      `Every 3D rendering engine, robotics controller, and physics simulation that deals with rotation, surface orientation, or magnetic forces needs to compute cross products from raw components. The determinant expansion is the formula those systems use. It looks intimidating at first — a 3×3 grid of numbers with alternating signs — but there is a completely regular pattern that you can learn to execute flawlessly in under a minute once you've practiced it a few times. This lesson is dedicated to mastering that calculation: reading components in, applying the pattern, and reading the perpendicular vector out.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'cross-product-rhr' },
  },

  // ── Videos ──────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (17 of 21) Cross Product: Determinant Form',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      `Before reading on, predict: if $\\vec{A} = (1, 2, 0)$ and $\\vec{B} = (0, 1, 3)$, which component of $\\vec{A}\\times\\vec{B}$ do you expect will be non-zero? Take 30 seconds — look at the components and think about what the cross product means geometrically. Then scroll down to see the answer emerge from the formula.`,

      `You know what the cross product means geometrically: magnitude = parallelogram area, direction = right-hand rule perpendicular. Now we need to compute it from raw components. The tool is the **3×3 determinant**. Think of it as a recipe: you lay out your two vectors in a specific grid, and the recipe tells you exactly which numbers to multiply and add to get each component of the result.`,

      `The setup: draw a 3-row by 3-column grid. The **first row** always holds the three unit vectors $\\hat{i},\\hat{j},\\hat{k}$. The **second row** holds the components of $\\vec{A}$ (the first vector). The **third row** holds the components of $\\vec{B}$ (the second vector). Never swap rows 2 and 3 — that flips the sign of everything.`,

      `To find each component of the result, you **cover one column at a time** and multiply the two remaining entries in an X-pattern. Cover the column of $\\hat{i}$: you get a 2×2 grid — multiply the main diagonal and subtract the anti-diagonal. That gives $R_x$. Cover $\\hat{j}$, same process, gives $R_y$ — but **with a minus sign**. Cover $\\hat{k}$, gives $R_z$ with a plus sign. The sign pattern is always $+,-,+$. This is the cofactor expansion and it never changes.`,

      `The minus sign on $R_y$ is the number-one source of errors. Write it explicitly every time until it's automatic: write "$R_y = -($" before you compute the minor, so the minus sign is already on the page.`,

      `After computing three components, do the **perpendicularity check**: compute $\\vec{A}\\cdot\\vec{R}$ and $\\vec{B}\\cdot\\vec{R}$. Both must be zero. If either is non-zero, you made an arithmetic error. This check takes 10 seconds and gives you complete confidence in your answer.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Three steps to any cross product',
        steps: [
          `Write the 3×3 determinant: row 1 = $\\hat{i},\\hat{j},\\hat{k}$; row 2 = components of $\\vec{A}$; row 3 = components of $\\vec{B}$.`,
          `Cover each column in turn. Compute the 2×2 minor ($ad - bc$). Apply sign $+,-,+$ for $R_x, R_y, R_z$ — the minus on $R_y$ never changes.`,
          `Verify perpendicularity: compute $\\vec{A}\\cdot\\vec{R}$ and $\\vec{B}\\cdot\\vec{R}$. Both must equal zero. If not, recheck $R_y$'s sign first.`,
        ],
      },
      {
        type: 'definition',
        title: 'The component formula — full expansion',
        body: `\\vec{A}\\times\\vec{B} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\A_x&A_y&A_z\\\\B_x&B_y&B_z\\end{vmatrix} = (A_yB_z - A_zB_y)\\hat{i} - (A_xB_z - A_zB_x)\\hat{j} + (A_xB_y - A_yB_x)\\hat{k}`,
      },
      {
        type: 'mnemonic',
        title: 'The sign pattern: +, −, +',
        body: `$\\hat{i}$ component: $+(A_yB_z - A_zB_y)$\\n$\\hat{j}$ component: $-(A_xB_z - A_zB_x)$\\n$\\hat{k}$ component: $+(A_xB_y - A_yB_x)$\\n\\nAlternating plus-minus-plus. This is the cofactor expansion pattern for the first row of any 3×3 determinant.`,
      },
      {
        type: 'warning',
        title: 'The minus on R_y — the most common error',
        body: `The $\\hat{j}$ (y) component always has a negative sign in front of its minor. Write it EXPLICITLY before computing:\\n\\n$R_y = -(A_xB_z - A_zB_x)$\\n\\nDon't compute the minor first and then forget to negate it.`,
      },
      {
        type: 'insight',
        title: 'The "cover-column" technique',
        body: `For each component, mentally cover the corresponding column in the 3×3 grid and compute the 2×2 determinant of what remains:\\n\\n$\\begin{vmatrix}a & b \\\\\\\\ c & d\\end{vmatrix} = ad - bc$\\n\\nCover column 1 → get $R_x$. Cover column 2 → get $R_y$ (then negate). Cover column 3 → get $R_z$.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Always check direction first — before computing',
        caption: `Use the right-hand rule to predict the direction of the result BEFORE doing arithmetic. This gives you a sanity check: if your computed result points the wrong way, you made a sign error.`,
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      `Let's build the full derivation of each component so you can reproduce the formula from scratch without memorising it. Starting from the determinant definition and expanding along the first row:`,

      `The $\\hat{i}$ component comes from the 2×2 minor obtained by crossing out row 1 and column 1: $\\begin{vmatrix}A_y&A_z\\\\B_y&B_z\\end{vmatrix} = A_yB_z - A_zB_y$. Sign: $+1$ (cofactor position (1,1)).`,

      `The $\\hat{j}$ component comes from crossing out row 1 and column 2: $\\begin{vmatrix}A_x&A_z\\\\B_x&B_z\\end{vmatrix} = A_xB_z - A_zB_x$. Sign: $-1$ (cofactor position (1,2) — checkerboard alternation). So the $\\hat{j}$ term is $-(A_xB_z - A_zB_x)$.`,

      `The $\\hat{k}$ component comes from crossing out row 1 and column 3: $\\begin{vmatrix}A_x&A_y\\\\B_x&B_y\\end{vmatrix} = A_xB_y - A_yB_x$. Sign: $+1$ (cofactor position (1,3)).`,

      `Properties that follow from the formula: (1) **Anti-commutativity** — swapping rows 2 and 3 negates the result. (2) **Parallel vectors give zero** — if $\\vec{B} = k\\vec{A}$, rows 2 and 3 are proportional, and a determinant with proportional rows is always zero. (3) **Distributive** — $\\vec{A}\\times(\\vec{B}+\\vec{C}) = \\vec{A}\\times\\vec{B} + \\vec{A}\\times\\vec{C}$ — follows from linearity of the determinant in each row.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Full component derivation',
        body: `$R_x = A_yB_z - A_zB_y$ (minor of column 1, sign $+1$)\\n$R_y = -(A_xB_z - A_zB_x)$ (minor of column 2, sign $-1$)\\n$R_z = A_xB_y - A_yB_x$ (minor of column 3, sign $+1$)`,
      },
      {
        type: 'insight',
        title: 'Parallel vectors → zero cross product',
        body: `If $\\vec{B} = k\\vec{A}$, then rows 2 and 3 of the determinant are proportional, so $\\vec{A}\\times\\vec{B} = \\vec{0}$. Geometrically: a parallelogram with parallel sides has zero area.`,
      },
      {
        type: 'insight',
        title: 'Distributive law',
        body: `$\\vec{A}\\times(\\vec{B}+\\vec{C}) = \\vec{A}\\times\\vec{B} + \\vec{A}\\times\\vec{C}$. The cross product distributes over addition — just keep track of order since anti-commutativity still applies.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Recognising component patterns in the expansion',
        caption: `Each result component is a 2×2 minor: R_x = A_yB_z − A_zB_y, R_y = −(A_xB_z − A_zB_x), R_z = A_xB_y − A_yB_x. Practice reading the sign pattern (+−+) until it is automatic.`,
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The cross product arises from the need to find a vector perpendicular to two given vectors in $\\mathbb{R}^3$. Formally, for $\\vec{A}, \\vec{B} \\in \\mathbb{R}^3$, $\\vec{A}\\times\\vec{B}$ is the unique vector that is orthogonal to both inputs, has magnitude $|\\vec{A}||\\vec{B}|\\sin\\phi$, and whose direction follows the right-hand rule. The determinant formula provides a concrete way to compute this unique vector from components.`,

      `The distributive property $\\vec{A}\\times(\\vec{B}+\\vec{C}) = \\vec{A}\\times\\vec{B} + \\vec{A}\\times\\vec{C}$ follows from linearity of the determinant in each row — when one row is held fixed and another is varied, the determinant changes linearly. This is a deep algebraic property that makes the cross product well-behaved in calculations.`,

      `The **scalar triple product** $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})$ equals the determinant of the 3×3 matrix whose rows are $\\vec{A}$, $\\vec{B}$, $\\vec{C}$. It gives the **signed volume** of the parallelepiped spanned by the three vectors. If all three lie in a plane (are coplanar), this volume is zero — a useful coplanarity test in computational geometry and graphics.`,

      `The Lagrange identity $|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$ is $\\sin^2\\phi + \\cos^2\\phi = 1$ in disguise — substituting $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$ and $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi$ makes both sides equal. This identity shows that the dot and cross products together capture ALL geometric information about the relationship between two vectors. Looking further ahead: the cross product generalises to the **exterior product** (wedge product) in differential geometry, where $\\vec{A}\\wedge\\vec{B}$ represents the oriented area element — the cross product is the dual of this in 3D.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Lagrange identity',
        body: `|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2`,
      },
      {
        type: 'theorem',
        title: 'Scalar triple product = signed volume',
        body: `\\vec{A}\\cdot(\\vec{B}\\times\\vec{C}) = \\det\\begin{vmatrix}A_x&A_y&A_z\\\\B_x&B_y&B_z\\\\C_x&C_y&C_z\\end{vmatrix}`,
      },
    ],
    proofSteps: [
      {
        title: 'Cofactor expansion along row 1',
        expression: `\\vec{A}\\times\\vec{B} = \\hat{i}(A_yB_z-A_zB_y) - \\hat{j}(A_xB_z-A_zB_x) + \\hat{k}(A_xB_y-A_yB_x)`,
        annotation: 'Signs follow the cofactor checkerboard: (+)(−)(+) for the first row.',
      },
      {
        title: 'Perpendicularity — verify A⃗ · R⃗ = 0',
        expression: `A_x(A_yB_z-A_zB_y) - A_y(A_xB_z-A_zB_x) + A_z(A_xB_y-A_yB_x) = 0`,
        annotation: 'Expand: all six cross-term pairs cancel. Q.E.D.',
      },
      {
        title: 'Lagrange identity',
        expression: `|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2\\sin^2\\phi + |\\vec{A}|^2|\\vec{B}|^2\\cos^2\\phi = |\\vec{A}|^2|\\vec{B}|^2`,
        annotation: 'Substituting the magnitude formulas and using the Pythagorean identity.',
      },
    ],
    title: 'Cross product — distributive property, scalar triple product, Lagrange identity',
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-015-ex1',
      title: 'Full component calculation with check',
      problem: `\\text{Find }\\vec{A}\\times\\vec{B}\\text{ for }\\vec{A}=(1,3,-2)\\text{ and }\\vec{B}=(4,0,5).`,
      steps: [
        {
          expression: `R_x = A_yB_z - A_zB_y = (3)(5) - (-2)(0) = 15 - 0 = 15`,
          annotation: 'Cover column 1. Minor is the 2×2 grid of rows 2,3 and columns 2,3.',
        },
        {
          expression: `R_y = -(A_xB_z - A_zB_x) = -[(1)(5) - (-2)(4)] = -(5+8) = -13`,
          annotation: `Cover column 2. Write the minus sign before computing the minor — don't forget it.`,
        },
        {
          expression: `R_z = A_xB_y - A_yB_x = (1)(0) - (3)(4) = 0 - 12 = -12`,
          annotation: 'Cover column 3.',
        },
        {
          expression: `\\vec{R} = (15, -13, -12)`,
          annotation: 'Collect the three components.',
        },
        {
          expression: `\\vec{A}\\cdot\\vec{R} = (1)(15)+(3)(-13)+(-2)(-12) = 15-39+24 = 0\\;\\checkmark`,
          annotation: 'Perpendicularity check with A⃗.',
        },
        {
          expression: `\\vec{B}\\cdot\\vec{R} = (4)(15)+(0)(-13)+(5)(-12) = 60+0-60 = 0\\;\\checkmark`,
          annotation: 'Perpendicularity check with B⃗. Both zero — calculation is correct.',
        },
      ],
      conclusion: `$\\vec{A}\\times\\vec{B}=(15,-13,-12)$. Always perform the perpendicularity check — it catches all arithmetic errors in seconds.`,
    },
    {
      id: 'ch1-015-ex2',
      title: 'Finding the unit normal to a triangle (computer graphics)',
      problem: `Two edge vectors of a triangle are $\\vec{u}=(2,0,0)$ and $\\vec{v}=(1,2,0)$. Find the unit normal to the triangle's surface.`,
      steps: [
        {
          expression: `\\vec{n} = \\vec{u}\\times\\vec{v} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\2&0&0\\\\1&2&0\\end{vmatrix}`,
          annotation: `The cross product gives a vector perpendicular to both edge vectors — perpendicular to the triangle's surface.`,
        },
        {
          expression: `R_x = (0)(0)-(0)(2)=0,\\quad R_y = -[(2)(0)-(0)(1)]=0,\\quad R_z = (2)(2)-(0)(1)=4`,
          annotation: 'Both edge vectors lie in the xy-plane (z-components are zero), so R_x = R_y = 0 and only R_z survives.',
        },
        {
          expression: `\\vec{n} = (0,0,4)\\implies|\\vec{n}|=4`,
          annotation: 'The normal vector points in +z. The triangle lies in the xy-plane.',
        },
        {
          expression: `\\hat{n} = \\frac{\\vec{n}}{|\\vec{n}|} = (0,0,1) = \\hat{k}`,
          annotation: 'Divide by magnitude to get the unit normal. This is what a 3D graphics engine stores as the face normal.',
        },
      ],
      conclusion: `The unit normal is $\\hat{n}=(0,0,1)=\\hat{k}$, pointing straight up out of the xy-plane.`,
    },
    {
      id: 'ch1-015-ex3',
      title: 'Parallelogram area from two side vectors',
      problem: `Vectors $\\vec{A}=(3,1,0)$ and $\\vec{B}=(1,4,0)$ define two sides of a parallelogram. Find the area and the unit normal to the parallelogram's surface.`,
      steps: [
        {
          expression: `\\vec{A}\\times\\vec{B} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\3&1&0\\\\1&4&0\\end{vmatrix}`,
          annotation: 'Both vectors are in the xy-plane (z = 0), so predict the result points in ±z.',
        },
        {
          expression: `R_x = (1)(0)-(0)(4)=0,\\quad R_y=-[(3)(0)-(0)(1)]=0,\\quad R_z=(3)(4)-(1)(1)=12-1=11`,
          annotation: 'Since all z-components are zero, only R_z is non-zero.',
        },
        {
          expression: `\\vec{A}\\times\\vec{B}=(0,0,11),\\quad \\text{Area} = |\\vec{A}\\times\\vec{B}| = 11`,
          annotation: 'Magnitude of the cross product equals the area of the parallelogram.',
        },
        {
          expression: `\\hat{n} = \\frac{(0,0,11)}{11} = (0,0,1) = \\hat{k}`,
          annotation: 'Unit normal points in +z — confirmed by the right-hand rule (curl from A⃗ to B⃗).',
        },
      ],
      conclusion: `The parallelogram has area $11$ square units and unit normal $\\hat{n}=\\hat{k}$.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-015-ch1',
      difficulty: 'easy',
      problem: `Compute $\\vec{A}\\times\\vec{B}$ for $\\vec{A}=(2,0,0)$ and $\\vec{B}=(0,3,0)$.`,
      hint: 'Both vectors lie in the xy-plane. Use the right-hand rule to predict the direction before computing.',
      walkthrough: [
        {
          expression: `R_x=(0)(0)-(0)(3)=0,\\quad R_y=-[(2)(0)-(0)(0)]=0,\\quad R_z=(2)(3)-(0)(0)=6`,
          annotation: 'Apply the formula component by component.',
        },
        {
          expression: `\\vec{A}\\times\\vec{B}=(0,0,6)`,
          annotation: 'Result points in +z — confirmed by right-hand rule: curl from +x to +y gives +z.',
        },
      ],
      answer: `(0,0,6)`,
    },
    {
      id: 'ch1-015-ch2',
      difficulty: 'medium',
      problem: `Find $\\vec{A}\\times\\vec{B}$ for $\\vec{A}=(1,-1,2)$ and $\\vec{B}=(3,1,-1)$. Verify perpendicularity.`,
      hint: 'Be especially careful with minus signs from negative components — write each minor explicitly before applying the sign.',
      walkthrough: [
        {
          expression: `R_x=(-1)(-1)-(2)(1)=1-2=-1`,
          annotation: 'Cover column 1.',
        },
        {
          expression: `R_y=-[(1)(-1)-(2)(3)]=-[-1-6]=-(-7)=7`,
          annotation: 'Cover column 2. Two negatives make a plus.',
        },
        {
          expression: `R_z=(1)(1)-(-1)(3)=1+3=4`,
          annotation: 'Cover column 3.',
        },
        {
          expression: `\\vec{A}\\cdot(-1,7,4)=(1)(-1)+(-1)(7)+(2)(4)=-1-7+8=0\\;\\checkmark`,
          annotation: 'Check A⃗ · R⃗ = 0.',
        },
        {
          expression: `\\vec{B}\\cdot(-1,7,4)=(3)(-1)+(1)(7)+(-1)(4)=-3+7-4=0\\;\\checkmark`,
          annotation: 'Check B⃗ · R⃗ = 0.',
        },
      ],
      answer: `(-1, 7, 4)`,
    },
    {
      id: 'ch1-015-ch3',
      difficulty: 'hard',
      problem: `Verify the Lagrange identity for $\\vec{A}=(2,1,0)$ and $\\vec{B}=(1,2,1)$: show $|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$.`,
      hint: 'Compute A×B, then compute all four quantities and plug into both sides of the identity.',
      walkthrough: [
        {
          expression: `\\vec{A}\\times\\vec{B}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\2&1&0\\\\1&2&1\\end{vmatrix}=(1-0)\\hat{i}-(2-0)\\hat{j}+(4-1)\\hat{k}=(1,-2,3)`,
          annotation: 'Compute the cross product.',
        },
        {
          expression: `|\\vec{A}\\times\\vec{B}|^2=1+4+9=14`,
          annotation: 'Square each component and sum.',
        },
        {
          expression: `\\vec{A}\\cdot\\vec{B}=(2)(1)+(1)(2)+(0)(1)=4\\implies(\\vec{A}\\cdot\\vec{B})^2=16`,
          annotation: 'Dot product and its square.',
        },
        {
          expression: `|\\vec{A}|^2=5,\\quad|\\vec{B}|^2=6\\implies|\\vec{A}|^2|\\vec{B}|^2=30`,
          annotation: 'Product of squared magnitudes.',
        },
        {
          expression: `14+16=30\\;\\checkmark`,
          annotation: 'Lagrange identity holds: LHS = RHS = 30.',
        },
      ],
      answer: `Both sides equal $30$. The Lagrange identity is verified.`,
    },
  ],

  // ── Notebooks ─────────────────────────────────────────────────────────────
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Implementing the cross product from the determinant formula',
          type: 'code',
          language: 'python',
          code:
`import numpy as np

def cross_product(A, B):
    Ax, Ay, Az = A[0], A[1], A[2]
    Bx, By, Bz = B[0], B[1], B[2]
    Rx = Ay*Bz - Az*By        # cover column 1, sign +
    Ry = -(Ax*Bz - Az*Bx)     # cover column 2, sign - (the critical minus!)
    Rz = Ax*By - Ay*Bx        # cover column 3, sign +
    return np.array([Rx, Ry, Rz])

A = np.array([1, 3, -2])
B = np.array([4, 0,  5])

result = cross_product(A, B)
print("My formula:  ", result)
print("NumPy cross: ", np.cross(A, B))
print("Match?", np.allclose(result, np.cross(A, B)))
print("A · (A×B) =", np.dot(A, result))
print("B · (A×B) =", np.dot(B, result))`,
          prose: [
            `Each line maps directly to the determinant expansion. \`Rx = Ay*Bz - Az*By\` is the 2×2 minor from covering column 1 — main diagonal minus anti-diagonal. \`Ry\` covers column 2 but the entire result is negated: the cofactor sign at position (1,2) is $(-1)^{1+2} = -1$. \`Rz\` covers column 3, positive again.`,
            `\`np.allclose\` proves our manual formula matches NumPy's built-in. The two dot products verify perpendicularity — both print 0. This is the standard sanity check: if either is non-zero, the error is almost certainly the missing minus on \`Ry\`.`,
            `The minus sign on \`Ry\` is written structurally into the code (\`Ry = -(…)\`), not left as an afterthought. Apply the same discipline on paper: write "$R_y = -($" before you compute the minor.`,
          ],
        },
        {
          cellTitle: 'Visualising anti-commutativity and the sign pattern',
          type: 'code',
          language: 'python',
          code:
`import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(12, 4))

cases = [
    (np.array([1,0,0]), np.array([0,1,0]), 'i x j = +k'),
    (np.array([0,1,0]), np.array([1,0,0]), 'j x i = -k (anti-commutative)'),
    (np.array([1,2,0]), np.array([0,1,3]), 'tilted: A=(1,2,0), B=(0,1,3)'),
]

for i, (A, B, title) in enumerate(cases):
    ax = fig.add_subplot(1, 3, i+1, projection='3d')
    R = np.cross(A, B)
    o = [0,0,0]
    ax.quiver(*o, *A, color='blue',  label=f'A', arrow_length_ratio=0.2)
    ax.quiver(*o, *B, color='red',   label=f'B', arrow_length_ratio=0.2)
    ax.quiver(*o, *R, color='green', label=f'AxB={R}', arrow_length_ratio=0.2)
    ax.set_xlim(-2,2); ax.set_ylim(-2,2); ax.set_zlim(-2,2)
    ax.set_title(title, fontsize=8)
    ax.legend(fontsize=7)

plt.tight_layout()
plt.show()`,
          prose: [
            `Case 1 ($\\hat{i}\\times\\hat{j}$): green arrow points $+z$. Case 2 ($\\hat{j}\\times\\hat{i}$): green arrow flips to $-z$. Same magnitudes, opposite directions — this is anti-commutativity made visible: $\\vec{A}\\times\\vec{B} = -(\\vec{B}\\times\\vec{A})$.`,
            `Case 3 ($\\vec{A}=(1,2,0)$, $\\vec{B}=(0,1,3)$) is the prediction challenge from the lesson opening. The result $(6,-3,1)$ has ALL three components non-zero — all three coordinate planes contribute because both vectors have components in multiple directions.`,
            `Each green arrow is perpendicular to both the blue and red arrows — you can verify visually. The plot is a geometric proof of the perpendicularity property that our dot product checks confirm numerically.`,
          ],
        },
        {
          cellTitle: 'Surface normals, parallelogram area, and the scalar triple product',
          type: 'code',
          language: 'python',
          code:
`import numpy as np

# 1. Surface normal for a triangle (graphics)
def surface_normal(p1, p2, p3):
    u = np.array(p2) - np.array(p1)
    v = np.array(p3) - np.array(p1)
    n = np.cross(u, v)
    return n / np.linalg.norm(n)

n_hat = surface_normal([0,0,0], [3,0,0], [1,2,0])
print(f"Triangle normal: {n_hat}")  # should be [0,0,1]

# 2. Parallelogram area
A = np.array([3, 1, 0])
B = np.array([1, 4, 0])
area = np.linalg.norm(np.cross(A, B))
print(f"Parallelogram area = {area:.4f}")  # should be 11

# 3. Scalar triple product = parallelepiped volume
def triple_product(A, B, C):
    return np.dot(A, np.cross(B, C))

vol = abs(triple_product([3,0,0], [0,4,0], [0,0,2]))
print(f"Box 3x4x2 volume = {vol}")  # should be 24

# 4. Coplanarity test (triple product = 0)
tp = triple_product([1,0,0], [0,1,0], [2,3,0])
print(f"Coplanar vectors triple product = {tp}")  # should be 0`,
          prose: [
            `The surface normal formula $\\hat{n} = (\\vec{p_2}-\\vec{p_1})\\times(\\vec{p_3}-\\vec{p_1}) / |...|$ is exactly what 3D renderers compute for every triangle face. The cross product of two edge vectors is perpendicular to the triangle's plane; dividing by its magnitude gives the unit normal used for lighting.`,
            `Parallelogram area = $|\\vec{A}\\times\\vec{B}|$. For $(3,1,0)\\times(1,4,0)=(0,0,11)$, area = 11 square units. This is the geometric meaning of cross product magnitude — area of the parallelogram spanned by the two vectors.`,
            `The scalar triple product $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})$ equals the volume of the parallelepiped spanned by the three vectors. Zero means the three vectors are coplanar (all lie in one plane). The last test prints 0 because all three vectors have $z=0$ — they cannot span a 3D volume.`,
          ],
        },
        {
          cellTitle: 'Challenge: find k such that |A × B| = 7',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode:
`import numpy as np

# A = (2, 1, 0) and B = (1, k, 2).
# Find all integer k in [-10, 10] such that |A × B| = 7.
# Then verify the Lagrange identity for each solution.

solutions = []
for k in range(-10, 11):
    A = np.array([2, 1, 0])
    B = np.array([1, k, 2])
    # TODO: compute |A × B| and add k to solutions when magnitude ≈ 7

print("Solutions:", solutions)

# For each solution, verify: |A×B|² + (A·B)² = |A|²|B|²
for k in solutions:
    A = np.array([2, 1, 0])
    B = np.array([1, k, 2])
    # TODO: check Lagrange identity and print result`,
          prose: [
            `Inside the loop: \`cross = np.cross(A, B)\`, \`mag = np.linalg.norm(cross)\`. Append \`k\` to \`solutions\` when \`abs(mag - 7) < 0.01\`. There are two integer solutions — find both.`,
            `For the Lagrange check: \`lhs = np.linalg.norm(np.cross(A,B))**2 + np.dot(A,B)**2\` and \`rhs = np.dot(A,A) * np.dot(B,B)\`. Use \`np.isclose(lhs, rhs)\` to verify. The identity holds for ALL values of k, not just the solutions.`,
            `This challenge combines the two big results from the lesson: the determinant formula (needed to compute the cross product) and the Lagrange identity (a consistency check). A failed identity check means your cross product has an error.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Implementing the cross product from the determinant formula',
          type: 'code',
          language: 'matlab',
          code:
`function R = cross_prod(A, B)
    Rx = A(2)*B(3) - A(3)*B(2);      % cover column 1, sign +
    Ry = -(A(1)*B(3) - A(3)*B(1));   % cover column 2, sign - (critical!)
    Rz = A(1)*B(2) - A(2)*B(1);      % cover column 3, sign +
    R = [Rx, Ry, Rz];
end

A = [1, 3, -2];
B = [4, 0,  5];

my_result = cross_prod(A, B);
fprintf('My formula:   [%d %d %d]\\n', my_result)
fprintf('MATLAB cross: [%d %d %d]\\n', cross(A, B))
fprintf('Match: %d\\n', isequal(my_result, cross(A, B)))
fprintf('A.(AxB) = %g\\n', dot(A, my_result))
fprintf('B.(AxB) = %g\\n', dot(B, my_result))`,
          prose: [
            `MATLAB uses 1-based indexing: \`A(2)\` is the y-component (Python's \`A[1]\`). The formula maps identically to the determinant expansion — three lines, each computing one minor, with the minus sign explicitly on the y-component.`,
            `MATLAB's built-in \`cross(A, B)\` matches our manual implementation — a useful check when learning. The \`isequal\` call prints 1 (true). In production, use \`cross\`; writing it from scratch once is how you internalize the formula.`,
            `Both dot products print 0, confirming perpendicularity. If they don't, the error is almost certainly a missing or misplaced minus sign on \`Ry\`.`,
          ],
        },
        {
          cellTitle: 'Visualising anti-commutativity in 3D',
          type: 'code',
          language: 'matlab',
          code:
`figure;
cases = {
    [1,0,0], [0,1,0], 'i x j = +k';
    [0,1,0], [1,0,0], 'j x i = -k';
    [1,2,0], [0,1,3], 'tilted';
};

for i = 1:3
    A = cases{i,1};  B = cases{i,2};
    R = cross(A, B);
    subplot(1,3,i); hold on; grid on;
    quiver3(0,0,0, A(1),A(2),A(3), 'b', 'LineWidth',2, 'DisplayName','A');
    quiver3(0,0,0, B(1),B(2),B(3), 'r', 'LineWidth',2, 'DisplayName','B');
    quiver3(0,0,0, R(1),R(2),R(3), 'g', 'LineWidth',2, 'DisplayName','AxB');
    axis([-2 2 -2 2 -2 2]);
    legend; title(cases{i,3});
end`,
          prose: [
            `Subplot 1 ($\\hat{i}\\times\\hat{j}$): green arrow points $+z$. Subplot 2 ($\\hat{j}\\times\\hat{i}$): green arrow flips to $-z$. Swapping A and B negates the result — anti-commutativity shown as a direction flip with no magnitude change.`,
            `Subplot 3 shows the tilted case ($\\vec{A}=(1,2,0)$, $\\vec{B}=(0,1,3)$). The result is not aligned with any coordinate axis. All three components are non-zero because both vectors have multi-axis components.`,
            `MATLAB's \`quiver3\` draws a 3D arrow: the first three arguments are the tail position $(0,0,0)$, the next three are the vector components. \`'LineWidth'\` and \`'DisplayName'\` control appearance.`,
          ],
        },
        {
          cellTitle: 'Surface normals, area, and scalar triple product',
          type: 'code',
          language: 'matlab',
          code:
`% 1. Surface normal for a triangle
function n_hat = surface_normal(p1, p2, p3)
    u = p2 - p1;
    v = p3 - p1;
    n = cross(u, v);
    n_hat = n / norm(n);
end

n = surface_normal([0,0,0], [3,0,0], [1,2,0]);
fprintf('Triangle normal: [%.4f %.4f %.4f]\\n', n)  % [0 0 1]

% 2. Parallelogram area
A = [3, 1, 0];  B = [1, 4, 0];
area = norm(cross(A, B));
fprintf('Parallelogram area = %.4f\\n', area)  % 11

% 3. Scalar triple product = volume
vol = abs(dot([3,0,0], cross([0,4,0], [0,0,2])));
fprintf('Box 3x4x2 volume = %g\\n', vol)  % 24

% 4. Coplanarity test
tp = dot([1,0,0], cross([0,1,0], [2,3,0]));
fprintf('Coplanar triple product = %g\\n', tp)  % 0`,
          prose: [
            `The \`surface_normal\` function subtracts vertex \`p1\` to get two edge vectors, takes their cross product, then divides by the norm. The same computation runs millions of times per frame in a 3D renderer. For a triangle in the xy-plane, the result is always $\\pm\\hat{k}$.`,
            `Parallelogram area = $\\|\\vec{A}\\times\\vec{B}\\|$. For $(3,1,0)$ and $(1,4,0)$: the cross product is $(0,0,11)$, so area = 11. This is the geometric meaning of cross product magnitude — the area swept out when you "multiply" two vectors.`,
            `The scalar triple product tests coplanarity: if all three vectors lie in the same plane, their parallelepiped has zero height and thus zero volume. The last line prints 0 because all three vectors are in the xy-plane.`,
          ],
        },
        {
          cellTitle: 'Challenge: verify the Lagrange identity for random vectors',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode:
`% The Lagrange identity: |A × B|² + (A · B)² = |A|² * |B|²
% Verify for 5 random pairs of 3D vectors.

rng(42);
all_passed = true;

for i = 1:5
    A = randn(1, 3) * 5;
    B = randn(1, 3) * 5;

    % TODO: compute LHS = norm(cross(A,B))^2 + dot(A,B)^2
    % TODO: compute RHS = norm(A)^2 * norm(B)^2
    % TODO: check abs(LHS - RHS) < 1e-10, print result, set all_passed=false if fails
end

if all_passed
    disp('All 5 pairs satisfy the Lagrange identity')
end`,
          prose: [
            `For LHS: \`lhs = norm(cross(A,B))^2 + dot(A,B)^2\`. For RHS: \`rhs = norm(A)^2 * norm(B)^2\`. Check with \`abs(lhs - rhs) < 1e-10\` to account for floating-point rounding.`,
            `The identity $|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$ is $\\sin^2\\phi + \\cos^2\\phi = 1$ multiplied by $|\\vec{A}|^2|\\vec{B}|^2$. Testing it numerically on random vectors proves it holds generally — floating-point arithmetic is accurate enough for the check to pass to 10 decimal places.`,
            `Set \`all_passed = false\` and print the index whenever a check fails. For correct code, all 5 should pass. This challenge reinforces that the Lagrange identity is an algebraic identity, not a special-case coincidence.`,
          ],
        },
      ],
    },
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-015-q1',
      type: 'choice',
      question: `In the cross-product determinant, which row goes FIRST?`,
      options: [
        `Components of $\\vec{A}$`,
        `Components of $\\vec{B}$`,
        `The unit vectors $\\hat{i}, \\hat{j}, \\hat{k}$`,
        `The zero vector`,
      ],
      answer: `The unit vectors $\\hat{i}, \\hat{j}, \\hat{k}$`,
      hints: [
        `You are solving for the components of $\\vec{R}$ — those components are coefficients of $\\hat{i}, \\hat{j}, \\hat{k}$, so those unit vectors must appear in the setup.`,
        `The result of cofactor expansion along the first row is $R_x\\hat{i} + R_y\\hat{j} + R_z\\hat{k}$ — which requires $\\hat{i}, \\hat{j}, \\hat{k}$ in row 1.`,
      ],
      reviewSection: 'intuition',
      explanation: `The first row always holds the unit vectors $\\hat{i}, \\hat{j}, \\hat{k}$. Row 2 is $\\vec{A}$'s components, row 3 is $\\vec{B}$'s. Swapping rows 2 and 3 negates the entire result.`,
    },
    {
      id: 'p1-ch1-015-q2',
      type: 'choice',
      question: `The sign pattern for the three components $R_x, R_y, R_z$ when expanding the first row is:`,
      options: [
        `$+, +, +$`,
        `$+, -, +$`,
        `$-, +, -$`,
        `$+, -, -$`,
      ],
      answer: `$+, -, +$`,
      hints: [
        `The cofactor sign at position (row, col) is $(-1)^{\\text{row}+\\text{col}}$.`,
        `For row 1: (1,1) → $(-1)^2=+$, (1,2) → $(-1)^3=-$, (1,3) → $(-1)^4=+$.`,
      ],
      reviewSection: 'intuition',
      explanation: `The cofactor expansion gives $+,-,+$ for $R_x, R_y, R_z$. The minus on $R_y$ is the most common source of arithmetic errors.`,
    },
    {
      id: 'p1-ch1-015-q3',
      type: 'choice',
      question: `Given $\\vec{A} = (1, 0, 0)$ and $\\vec{B} = (0, 1, 0)$, what is $\\vec{A} \\times \\vec{B}$?`,
      options: [
        `$(1, 0, 0)$`,
        `$(0, 0, 1)$`,
        `$(0, 0, -1)$`,
        `$(0, 1, 0)$`,
      ],
      answer: `$(0, 0, 1)$`,
      hints: [
        `Apply the right-hand rule: point along $+x$, curl toward $+y$ — thumb points $+z$.`,
        `Use the formula: $R_z = A_xB_y - A_yB_x = (1)(1)-(0)(0) = 1$.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\hat{i}\\times\\hat{j}=\\hat{k}=(0,0,1)$. Computing: $R_x=0, R_y=-(0-0)=0, R_z=1-0=1$.`,
    },
    {
      id: 'p1-ch1-015-q4',
      type: 'choice',
      question: `What formula gives the $\\hat{j}$ component of $\\vec{A} \\times \\vec{B}$?`,
      options: [
        `$A_yB_z - A_zB_y$`,
        `$A_xB_z - A_zB_x$`,
        `$-(A_xB_z - A_zB_x)$`,
        `$A_xB_y - A_yB_x$`,
      ],
      answer: `$-(A_xB_z - A_zB_x)$`,
      hints: [
        `Cover column 2 of the determinant and compute the 2×2 minor — then apply the cofactor sign.`,
        `Cofactor sign at (1,2) is $(-1)^3 = -1$.`,
      ],
      reviewSection: 'intuition',
      explanation: `The $\\hat{j}$ component is $-(A_xB_z - A_zB_x)$. The minor from covering column 2, negated. Forgetting the negative is the single most common cross product error.`,
    },
    {
      id: 'p1-ch1-015-q5',
      type: 'choice',
      question: `How do you verify that a computed cross product $\\vec{R} = \\vec{A} \\times \\vec{B}$ is correct?`,
      options: [
        `Check $|\\vec{R}| = |\\vec{A}| + |\\vec{B}|$`,
        `Check $\\vec{A} \\cdot \\vec{R} = 0$ and $\\vec{B} \\cdot \\vec{R} = 0$`,
        `Check $\\vec{R} = \\vec{A} + \\vec{B}$`,
        `Check that $\\vec{R}$ points in the same direction as $\\vec{A}$`,
      ],
      answer: `Check $\\vec{A} \\cdot \\vec{R} = 0$ and $\\vec{B} \\cdot \\vec{R} = 0$`,
      hints: [
        `The defining property of the cross product is that the result is perpendicular to both inputs.`,
        `Perpendicular vectors have zero dot product.`,
      ],
      reviewSection: 'intuition',
      explanation: `The cross product is perpendicular to both inputs, so $\\vec{A}\\cdot\\vec{R}$ and $\\vec{B}\\cdot\\vec{R}$ must both be zero. This catches essentially all arithmetic errors.`,
    },
    {
      id: 'p1-ch1-015-q6',
      type: 'choice',
      question: `Compute $\\vec{A} \\times \\vec{B}$ for $\\vec{A} = (2, 0, 0)$ and $\\vec{B} = (0, 0, 3)$.`,
      options: [
        `$(0, 6, 0)$`,
        `$(0, -6, 0)$`,
        `$(6, 0, 0)$`,
        `$(0, 0, 6)$`,
      ],
      answer: `$(0, -6, 0)$`,
      hints: [
        `For $R_y$: cover column 2, compute the minor, then negate. Minor = $\\begin{vmatrix}2&0\\\\0&3\\end{vmatrix} = 6$.`,
        `$R_y = -(2\\cdot3 - 0\\cdot0) = -6$.`,
      ],
      reviewSection: 'examples',
      explanation: `$R_x=0$, $R_y=-(2\\cdot3-0\\cdot0)=-6$, $R_z=0$. Right-hand rule: fingers along $+x$, curl toward $+z$, thumb points $-y$. Confirms $(0,-6,0)$.`,
    },
    {
      id: 'p1-ch1-015-q7',
      type: 'choice',
      question: `The 2×2 determinant $\\begin{vmatrix}a & b \\\\ c & d\\end{vmatrix}$ equals:`,
      options: [
        `$a + d$`,
        `$ab - cd$`,
        `$ad - bc$`,
        `$ac - bd$`,
      ],
      answer: `$ad - bc$`,
      hints: [
        `Main diagonal: top-left × bottom-right. Anti-diagonal: top-right × bottom-left. Subtract.`,
        `Think of an X: the "down-right" product minus the "down-left" product.`,
      ],
      reviewSection: 'intuition',
      explanation: `$ad - bc$: multiply the main diagonal, subtract the anti-diagonal product. This 2×2 pattern repeats three times in every cross product calculation.`,
    },
    {
      id: 'p1-ch1-015-q8',
      type: 'choice',
      question: `The Lagrange identity $|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$ is equivalent to which trigonometric identity?`,
      options: [
        `$\\tan^2\\phi + 1 = \\sec^2\\phi$`,
        `$\\sin^2\\phi + \\cos^2\\phi = 1$`,
        `$\\cos(2\\phi) = \\cos^2\\phi - \\sin^2\\phi$`,
        `$\\sin(2\\phi) = 2\\sin\\phi\\cos\\phi$`,
      ],
      answer: `$\\sin^2\\phi + \\cos^2\\phi = 1$`,
      hints: [
        `Substitute $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$ and $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi$.`,
        `After dividing both sides by $|\\vec{A}|^2|\\vec{B}|^2$, what do you get?`,
      ],
      reviewSection: 'rigor',
      explanation: `Substituting: $|\\vec{A}|^2|\\vec{B}|^2\\sin^2\\phi + |\\vec{A}|^2|\\vec{B}|^2\\cos^2\\phi = |\\vec{A}|^2|\\vec{B}|^2$. Dividing through by $|\\vec{A}|^2|\\vec{B}|^2$ gives $\\sin^2\\phi + \\cos^2\\phi = 1$. The Lagrange identity is the Pythagorean identity in disguise.`,
    },
    {
      id: 'p1-ch1-015-q9',
      type: 'choice',
      question: `If $\\vec{A}$ and $\\vec{B}$ are parallel, what is $\\vec{A} \\times \\vec{B}$?`,
      options: [
        `$|\\vec{A}||\\vec{B}|$`,
        `$\\vec{A} + \\vec{B}$`,
        `$\\vec{0}$`,
        `A vector perpendicular to both`,
      ],
      answer: `$\\vec{0}$`,
      hints: [
        `Parallel vectors have $\\phi = 0°$ or $180°$. What is $\\sin 0°$?`,
        `In the determinant: if $\\vec{B} = k\\vec{A}$, rows 2 and 3 are proportional — a determinant with proportional rows is always zero.`,
      ],
      reviewSection: 'math',
      explanation: `For parallel vectors $\\sin\\phi = 0$, so $|\\vec{A}\\times\\vec{B}| = 0$. In the determinant, proportional rows give a determinant of zero. The cross product is $\\vec{0}$ — no perpendicular direction can be defined for parallel vectors.`,
    },
    {
      id: 'p1-ch1-015-q10',
      type: 'choice',
      question: `The scalar triple product $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})$ equals zero if and only if:`,
      options: [
        `$\\vec{A}$, $\\vec{B}$, $\\vec{C}$ are mutually perpendicular`,
        `$\\vec{A}$, $\\vec{B}$, $\\vec{C}$ are coplanar`,
        `$\\vec{A}$ is parallel to $\\vec{B}$`,
        `$|\\vec{A}| = |\\vec{B}| = |\\vec{C}|$`,
      ],
      answer: `$\\vec{A}$, $\\vec{B}$, $\\vec{C}$ are coplanar`,
      hints: [
        `The scalar triple product equals the signed volume of the parallelepiped spanned by the three vectors.`,
        `When does a 3D parallelepiped have zero volume?`,
      ],
      reviewSection: 'rigor',
      explanation: `The scalar triple product is the signed volume of the parallelepiped spanned by $\\vec{A}, \\vec{B}, \\vec{C}$. Zero volume means all three vectors lie in a common plane — they are coplanar. This is used as a coplanarity test in computational geometry.`,
    },
  ],

  // ── Misconceptions ───────────────────────────────────────────────────────
  misconceptions: [
    {
      id: 'p1-ch1-015-m1',
      misconception: `The $\\hat{j}$ component uses the same sign as $\\hat{i}$ and $\\hat{k}$ — just a different minor.`,
      correction: `The $\\hat{j}$ component has a structural minus sign: $R_y = -(A_xB_z - A_zB_x)$. This comes from the cofactor checkerboard at position (1,2): $(-1)^{1+2} = -1$. The other two components are positive at their positions.`,
      correctionExample: `For $\\vec{A}=(2,0,0)$ and $\\vec{B}=(0,0,3)$: minor for column 2 is $\\begin{vmatrix}2&0\\\\0&3\\end{vmatrix}=6$. Without the minus: $R_y=6$ (wrong). With the minus: $R_y=-6$ (correct). Check: $\\vec{A}\\cdot(0,-6,0)=0$ ✓, $\\vec{B}\\cdot(0,-6,0)=0$ ✓.`,
    },
    {
      id: 'p1-ch1-015-m2',
      misconception: `You can compute a cross product for 2D vectors by just ignoring z.`,
      correction: `The cross product is defined only in 3D (and 7D). For 2D vectors, you must embed them in 3D by setting $z=0$: treat $(a,b)$ as $(a,b,0)$. The result will be $(0,0,c)$ — a z-direction vector whose magnitude equals the parallelogram area and whose sign encodes orientation.`,
      correctionExample: `$\\vec{A}=(3,1)$ and $\\vec{B}=(1,4)$: treat as $(3,1,0)\\times(1,4,0)$. $R_x=0, R_y=0, R_z=3\\cdot4-1\\cdot1=11$. Result: $(0,0,11)$. Area = 11 square units, orientation = counter-clockwise (positive z).`,
    },
  ],

  // ── Transfer Prompts ─────────────────────────────────────────────────────
  transferPrompts: [
    {
      id: 'p1-ch1-015-t1',
      prompt: `A structural engineer computes torque $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$ for $\\vec{r}=(0.5,0,0)$ m and $\\vec{F}=(0,-200,0)$ N. Compute $\\vec{\\tau}$, verify perpendicularity, and identify the rotation axis from the direction of the result.`,
      hint: 'After computing the cross product, check which coordinate axis $\\vec{\\tau}$ aligns with — that axis is the rotation axis.',
    },
    {
      id: 'p1-ch1-015-t2',
      prompt: `A 3D mesh triangle has vertices $P_1=(1,0,2)$, $P_2=(3,0,2)$, $P_3=(2,2,2)$. Compute the unit normal. What plane does the triangle lie in, and how does the normal direction confirm this?`,
      hint: 'Use $\\vec{u}=P_2-P_1$ and $\\vec{v}=P_3-P_1$ as edge vectors. The normal direction tells you the plane orientation.',
    },
  ],

  // ── Debugging ────────────────────────────────────────────────────────────
  debugging: [
    {
      id: 'p1-ch1-015-d1',
      buggyCode:
`A = [1, -1, 2]; B = [3, 1, -1]
Rx = A[1]*B[2] - A[2]*B[1]
Ry = A[0]*B[2] - A[2]*B[0]   # BUG here
Rz = A[0]*B[1] - A[1]*B[0]
print(Rx, Ry, Rz)`,
      expectedOutput: `-1 7 4`,
      actualOutput: `-1 -7 4`,
      explanation: `\`Ry\` is missing the required minus sign. The cofactor expansion requires $R_y = -(A_xB_z - A_zB_x)$. The fix: \`Ry = -(A[0]*B[2] - A[2]*B[0])\`. Without the negation, $R_y = -1-6=-7$ instead of the correct $+7$.`,
    },
    {
      id: 'p1-ch1-015-d2',
      buggyCode:
`% MATLAB — wrong row order
A = [2, 1, 3]; B = [0, 4, -1];
Rx = B(2)*A(3) - B(3)*A(2);   % BUG: B components used as "row 2"
Ry = -(B(1)*A(3) - B(3)*A(1));
Rz = B(1)*A(2) - B(2)*A(1);
result = [Rx, Ry, Rz]`,
      expectedOutput: `result = -13  2  8`,
      actualOutput: `result = 13 -2 -8`,
      explanation: `The student computed $\\vec{B}\\times\\vec{A}$ instead of $\\vec{A}\\times\\vec{B}$ by placing B components in row 2 and A in row 3. By anti-commutativity, this negates the entire result. Fix: swap so A components appear first: \`Rx = A(2)*B(3) - A(3)*B(2)\`.`,
    },
  ],

  // ── Mastery ───────────────────────────────────────────────────────────────
  mastery: {
    targetLevel: `Compute any 3D cross product from memory in under 2 minutes: set up the determinant, apply the $+,-,+$ pattern, run the perpendicularity check automatically.`,
    coreSkill: `Execute the three-step procedure: (1) write the 3×3 determinant grid, (2) cover each column and compute the minor with correct sign, (3) verify $\\vec{A}\\cdot\\vec{R}=0$ and $\\vec{B}\\cdot\\vec{R}=0$.`,
    commonSticking: `The minus sign on $R_y$ — students compute the minor correctly then forget to negate. Cure: always write "$R_y = -($" before the minor, so the sign is committed to paper before the arithmetic starts.`,
    connections: `Parallelogram area via $|\\vec{A}\\times\\vec{B}|$ (geometry); torque $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$ (rotational mechanics); surface normals (3D graphics and multivariable calculus); scalar triple product as volume (linear algebra and differential geometry); exterior/wedge product (advanced linear algebra).`,
  },

  // ── Semantics ──────────────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: `\\vec{A}\\times\\vec{B}`, meaning: 'Cross product — vector perpendicular to both A and B, magnitude = parallelogram area' },
      { symbol: `R_y = -(A_xB_z - A_zB_x)`, meaning: 'y-component of cross product — the only one with a built-in minus from cofactor sign at position (1,2)' },
      { symbol: `\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})`, meaning: 'Scalar triple product — signed volume of the parallelepiped spanned by A, B, C; zero iff coplanar' },
      { symbol: `|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2`, meaning: 'Lagrange identity — the Pythagorean identity in vector disguise' },
      { symbol: `\\hat{n} = \\frac{\\vec{A}\\times\\vec{B}}{|\\vec{A}\\times\\vec{B}|}`, meaning: 'Unit normal to the plane spanned by A and B' },
    ],
    rulesOfThumb: [
      `Sign pattern $+,-,+$ for $R_x, R_y, R_z$ — the minus on $R_y$ is structural and never changes.`,
      `Always run the perpendicularity check: $\\vec{A}\\cdot\\vec{R}=0$ and $\\vec{B}\\cdot\\vec{R}=0$. A non-zero result means recheck $R_y$'s sign first.`,
      `Parallel vectors give $\\vec{0}$; perpendicular vectors give maximum magnitude $|\\vec{A}||\\vec{B}|$.`,
      `Row order matters: A comes before B. Swapping rows 2 and 3 negates the entire result.`,
      `Scalar triple product tests coplanarity: zero means all three vectors share a common plane.`,
    ],
  },
}
