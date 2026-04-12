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
    question: 'Your drone\'s navigation computer has three vectors describing its orientation. How does it compute the axis perpendicular to its nose direction and wing direction — in milliseconds, automatically?',
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
      `You know what the cross product means geometrically: magnitude = parallelogram area, direction = right-hand rule perpendicular. Now we need to compute it from raw components. The tool is the **3×3 determinant**. Think of it as a recipe: you lay out your two vectors in a specific grid, and the recipe tells you exactly which numbers to multiply and add to get each component of the result.`,

      `The setup: draw a 3-row by 3-column grid. The **first row** always holds the three unit vectors $\\hat{i},\\hat{j},\\hat{k}$. The **second row** holds the components of $\\vec{A}$ (the first vector). The **third row** holds the components of $\\vec{B}$ (the second vector). Never swap rows 2 and 3 — that flips the sign of everything.`,

      `To find each component of the result, you **cover one column at a time** and multiply the two remaining entries (one from row 2, one from row 3) in an X-pattern. Specifically: cover the column of $\\hat{i}$, and you're left with a 2×2 grid — multiply the diagonal entries and subtract the anti-diagonal. That gives $R_x$. Cover $\\hat{j}$, same process, gives $R_y$ — but **with a minus sign**. Cover $\\hat{k}$, gives $R_z$ with a plus sign. The sign pattern for the three components is $+\\hat{i}$, $-\\hat{j}$, $+\\hat{k}$. This is the cofactor expansion and it never changes.`,

      `The minus sign on $R_y$ is the number-one source of errors. Students routinely forget it. Write it explicitly every single time until it's automatic. A good habit: write out "$R_y = -($" before you compute the minor, so the minus sign is already on the page and you can't miss it.`,

      `After you compute the three components, do the **perpendicularity check**: compute $\\vec{A}\\cdot\\vec{R}$ and $\\vec{B}\\cdot\\vec{R}$. Both must be zero. If either is non-zero, you made an arithmetic error. This check takes 10 seconds and gives you complete confidence in your answer.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The component formula — full expansion',
        body: `\\vec{A}\\times\\vec{B} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\A_x&A_y&A_z\\\\B_x&B_y&B_z\\end{vmatrix}\\n\\n= (A_yB_z - A_zB_y)\\,\\hat{i}\\;\\mathbf{-}\\;(A_xB_z - A_zB_x)\\,\\hat{j}\\;+\\;(A_xB_y - A_yB_x)\\,\\hat{k}`,
      },
      {
        type: 'mnemonic',
        title: 'The sign pattern: +, −, +',
        body: `$\\hat{i}$ component: $\\mathbf{+}(A_yB_z - A_zB_y)$\\n$\\hat{j}$ component: $\\mathbf{-}(A_xB_z - A_zB_x)$\\n$\\hat{k}$ component: $\\mathbf{+}(A_xB_y - A_yB_x)$\\n\\nAlternating plus-minus-plus. This is the cofactor expansion pattern for the first row of any 3×3 determinant.`,
      },
      {
        type: 'warning',
        title: 'The minus on R_y — the most common error',
        body: `The $\\hat{j}$ (y) component of the cross product always has a negative sign in front of its minor. Write it EXPLICITLY before you compute the minor:\\n\\n$R_y = -(A_xB_z - A_zB_x)$\\n\\nDon't compute the minor and then forget to negate it.`,
      },
      {
        type: 'insight',
        title: 'The "cover-column" technique',
        body: `For each component, mentally cover the corresponding column in the 3×3 grid and compute the 2×2 determinant of what remains:\\n\\n$\\begin{vmatrix}a & b \\\\ c & d\\end{vmatrix} = ad - bc$\\n\\nCover column 1 → get $R_x$. Cover column 2 → get $-R_y$ (negate!). Cover column 3 → get $R_z$.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Always check direction first — before computing',
        caption: `Use the right-hand rule to predict the direction of the result BEFORE doing arithmetic. This gives you a sanity check: if your computed result points the wrong way, you know you made a sign error.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Step-by-step determinant expansion',
        caption: `The determinant grid: row 1 = unit vectors î ĵ k̂, row 2 = components of A⃗, row 3 = components of B⃗. Cover each column in turn to read off R_x, R_y (negate!), and R_z. The right-hand rule diagram alongside lets you sanity-check the direction of your computed result.`,
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

      `Properties that follow from the formula: (1) **Anti-commutativity** — swapping rows 2 and 3 in the determinant negates the result. (2) **Parallel vectors give zero** — if $\\vec{B} = k\\vec{A}$, then rows 2 and 3 are proportional, and a determinant with proportional rows is always zero. (3) **Distributive** — $\\vec{A}\\times(\\vec{B}+\\vec{C}) = \\vec{A}\\times\\vec{B} + \\vec{A}\\times\\vec{C}$ — follows from linearity of the determinant in each row.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Full component derivation',
        body: `$R_x = A_yB_z - A_zB_y$ (minor of column 1, sign $+1$)\\n$R_y = -(A_xB_z - A_zB_x)$ (minor of column 2, sign $-1$)\\n$R_z = A_xB_y - A_yB_x$ (minor of column 3, sign $+1$)`,
      },
      {
        type: 'theorem',
        title: 'Parallel vectors → zero cross product',
        body: `\\vec{A}\\parallel\\vec{B}\\implies\\vec{A}\\times\\vec{B}=\\vec{0}\\n\\nIf $\\vec{B}=k\\vec{A}$, rows 2 and 3 of the determinant are proportional, making the determinant zero. Geometrically: a parallelogram with parallel sides has zero area.`,
      },
      {
        type: 'theorem',
        title: 'Distributive law',
        body: `\\vec{A}\\times(\\vec{B}+\\vec{C}) = \\vec{A}\\times\\vec{B} + \\vec{A}\\times\\vec{C}\\n\\nThe cross product distributes over addition. This makes it possible to expand algebraic expressions involving cross products using the familiar rules of algebra — just remember to keep track of order (anti-commutativity still applies).`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Recognising component patterns in the expansion',
        caption: `Each of the three result components is a 2×2 minor: R_x = A_yB_z − A_zB_y, R_y = −(A_xB_z − A_zB_x), R_z = A_xB_y − A_yB_x. Notice R_y's minus sign and that every pair of subscripts comes from the two rows not in that column. Practice reading the sign pattern (+−+) and the subscript pattern until they are automatic.`,
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The distributive property $\\vec{A}\\times(\\vec{B}+\\vec{C}) = \\vec{A}\\times\\vec{B} + \\vec{A}\\times\\vec{C}$ follows from linearity of the determinant in each row — the determinant is linear when one row is held fixed and another is varied. This is a deep algebraic property that makes the cross product well-behaved in calculations.`,
      `The **scalar triple product** $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})$ equals the determinant of the 3×3 matrix whose rows are $\\vec{A}$, $\\vec{B}$, $\\vec{C}$. It gives the **signed volume** of the parallelepiped spanned by the three vectors. If all three lie in a plane (are coplanar), this volume is zero. This test is used in graphics to check coplanarity.`,
      `A key identity: $|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$. This is the Lagrange identity and follows from $\\sin^2\\phi + \\cos^2\\phi = 1$. It shows that the dot and cross products together capture ALL information about the relationship between two vectors.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Lagrange identity',
        body: `|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2\\n\\nThis follows from $\\sin^2\\phi + \\cos^2\\phi = 1$. Together, the dot and cross products fully characterise the geometric relationship between any two vectors.`,
      },
      {
        type: 'theorem',
        title: 'Scalar triple product = signed volume',
        body: `\\vec{A}\\cdot(\\vec{B}\\times\\vec{C}) = \\det\\begin{vmatrix}A_x&A_y&A_z\\\\B_x&B_y&B_z\\\\C_x&C_y&C_z\\end{vmatrix}\\n\\nEquals the signed volume of the parallelepiped spanned by $\\vec{A}$, $\\vec{B}$, $\\vec{C}$. Zero if and only if the three vectors are coplanar.`,
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
        annotation: 'Expand: terms $A_xA_yB_z$ and $-A_yA_xB_z$ cancel, $-A_xA_zB_y$ and $+A_zA_xB_y$ cancel... all six pairs cancel. Q.E.D.',
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
          annotation: 'Cover column 2. Don\'t forget the minus sign in front of the entire minor.',
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
      conclusion: `$\\vec{A}\\times\\vec{B}=(15,-13,-12)$. Always perform the perpendicularity check — it's quick and catches all arithmetic errors.`,
    },
    {
      id: 'ch1-015-ex2',
      title: 'Finding the normal to a surface (computer graphics)',
      problem: `Two edge vectors of a triangle are $\\vec{u}=(2,0,0)$ and $\\vec{v}=(1,2,0)$. Find the unit normal to the triangle's surface.`,
      steps: [
        {
          expression: `\\vec{n} = \\vec{u}\\times\\vec{v} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\2&0&0\\\\1&2&0\\end{vmatrix}`,
          annotation: 'The cross product gives a vector perpendicular to both edge vectors — i.e., perpendicular to the triangle\'s surface.',
        },
        {
          expression: `R_x = (0)(0)-(0)(2)=0,\\quad R_y = -[(2)(0)-(0)(1)]=0,\\quad R_z = (2)(2)-(0)(1)=4`,
          annotation: 'All the z-components of u⃗ and v⃗ are zero (both lie in the xy-plane), so R_x = R_y = 0 and only R_z survives.',
        },
        {
          expression: `\\vec{n} = (0,0,4)\\implies|\\vec{n}|=4`,
          annotation: 'The normal vector points in +z. Makes sense: the triangle lies in the xy-plane.',
        },
        {
          expression: `\\hat{n} = \\frac{\\vec{n}}{|\\vec{n}|} = (0,0,1) = \\hat{k}`,
          annotation: 'Divide by magnitude to get a unit normal. This is what a 3D graphics engine would store as the face normal.',
        },
      ],
      conclusion: `The unit normal to the triangle is $\\hat{n}=(0,0,1)=\\hat{k}$, pointing straight up out of the xy-plane.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-015-ch1',
      difficulty: 'easy',
      problem: `Compute $\\vec{A}\\times\\vec{B}$ for $\\vec{A}=(2,0,0)$ and $\\vec{B}=(0,3,0)$.`,
      hint: 'Both vectors lie in the xy-plane. Predict the direction using the right-hand rule before computing.',
      walkthrough: [
        {
          expression: `R_x=(0)(0)-(0)(3)=0,\\quad R_y=-[(2)(0)-(0)(0)]=0,\\quad R_z=(2)(3)-(0)(0)=6`,
          annotation: 'Apply the formula component by component.',
        },
        { expression: `\\vec{A}\\times\\vec{B}=(0,0,6)`, annotation: 'Result points in +z — confirmed by right-hand rule: curl from +x to +y gives +z.' },
      ],
      answer: `(0,0,6)`,
    },
    {
      id: 'ch1-015-ch2',
      difficulty: 'medium',
      problem: `Find $\\vec{A}\\times\\vec{B}$ for $\\vec{A}=(1,-1,2)$ and $\\vec{B}=(3,1,-1)$. Verify perpendicularity.`,
      hint: 'Be especially careful with the minus signs from the negative components.',
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
      problem: `Verify the Lagrange identity for $\\vec{A}=(2,1,0)$ and $\\vec{B}=(1,2,1)$: show that $|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$.`,
      hint: 'Compute A×B using the determinant. Then compute dot products and magnitudes. Plug all into both sides of the identity and verify they match.',
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
          expression: `\\vec{A}\\cdot\\vec{B}=(2)(1)+(1)(2)+(0)(1)=2+2+0=4\\implies(\\vec{A}\\cdot\\vec{B})^2=16`,
          annotation: 'Dot product and its square.',
        },
        {
          expression: `|\\vec{A}|^2=4+1+0=5,\\quad|\\vec{B}|^2=1+4+1=6\\implies|\\vec{A}|^2|\\vec{B}|^2=30`,
          annotation: 'Product of squared magnitudes.',
        },
        {
          expression: `14+16=30=5\\times6\\;\\checkmark`,
          annotation: 'Lagrange identity holds: LHS = RHS = 30.',
        },
      ],
      answer: `Both sides equal $30$. The Lagrange identity is verified.`,
    },
  ],

  // ── Python Lab ───────────────────────────────────────────────────────────
  python: {
    title: 'Python Lab — Automating Cross Product Calculations',
    description: `Implement the cross product from scratch, then use NumPy to tackle real engineering problems: surface normals, torque analysis, and the scalar triple product (volume).`,
    placement: 'after-rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Cross products: from formula to engineering',
        props: {
          initialCells: [
          // ── CELL 1: Implement from scratch ───────────────────────────
          {
            id: 'cell-01',
            type: 'code',
            cellTitle: 'Implementing cross product from the determinant formula',
            code:
`import numpy as np

def cross_product(A, B):
    """
    Compute A × B using the determinant expansion formula.
    A, B: lists or arrays of length 3
    """
    Ax, Ay, Az = A[0], A[1], A[2]
    Bx, By, Bz = B[0], B[1], B[2]
    Rx = Ay*Bz - Az*By           # +, cover column 1
    Ry = -(Ax*Bz - Az*Bx)        # -, cover column 2  <-- minus sign!
    Rz = Ax*By - Ay*Bx           # +, cover column 3
    return np.array([Rx, Ry, Rz])

# Test against np.cross
A = np.array([1, 3, -2])
B = np.array([4, 0,  5])

my_result = cross_product(A, B)
np_result  = np.cross(A, B)

print("My formula result:", my_result)
print("NumPy result:     ", np_result)
print("Match?", np.allclose(my_result, np_result))

# Perpendicularity check
print("\\nA · (A×B) =", np.dot(A, my_result))
print("B · (A×B) =", np.dot(B, my_result))`,
            expectedOutput:
`My formula result: [ 15 -13 -12]
NumPy result:      [ 15 -13 -12]
Match? True

A · (A×B) = 0
B · (A×B) = 0`,
          },

          // ── CELL 2: Surface normal (graphics application) ─────────────
          {
            id: 'cell-02',
            type: 'code',
            cellTitle: 'Surface normals — how 3D graphics engines work',
            code:
`import numpy as np

def surface_normal(p1, p2, p3):
    """
    Find the unit normal vector to a triangle with vertices p1, p2, p3.
    The normal is n̂ = (p2-p1) × (p3-p1) / |(p2-p1) × (p3-p1)|
    """
    u = np.array(p2) - np.array(p1)   # edge vector 1
    v = np.array(p3) - np.array(p1)   # edge vector 2
    n = np.cross(u, v)                 # cross product
    return n / np.linalg.norm(n)       # normalise to unit length

# Triangle in 3D (like a face in a 3D mesh)
p1 = [0, 0, 0]
p2 = [3, 0, 0]
p3 = [1, 2, 0]

n_hat = surface_normal(p1, p2, p3)
print("Vertices:", p1, p2, p3)
print("Unit normal:", n_hat)
print("This triangle lies in the xy-plane, so normal points in ±z")

# A tilted triangle
p1b = [0, 0, 0]
p2b = [1, 0, 0]
p3b = [0, 1, 1]   # lifted corner

n_hat_b = surface_normal(p1b, p2b, p3b)
print("\\nTilted triangle normal:", np.round(n_hat_b, 4))
print("Magnitude =", np.round(np.linalg.norm(n_hat_b), 6), "(should be 1.0)")`,
            expectedOutput:
`Vertices: [0, 0, 0] [3, 0, 0] [1, 2, 0]
Unit normal: [0. 0. 1.]
This triangle lies in the xy-plane, so normal points in ±z

Tilted triangle normal: [ 0.     -0.7071  0.7071]
Magnitude = 1.0 (should be 1.0)`,
          },

          // ── CELL 3: Scalar triple product (volume) ─────────────────────
          {
            id: 'cell-03',
            type: 'code',
            cellTitle: 'Scalar triple product — volume of a parallelepiped',
            code:
`import numpy as np

def triple_product(A, B, C):
    """Scalar triple product: A · (B × C) = det([A, B, C])"""
    return np.dot(A, np.cross(B, C))

# Volume of a box defined by three edge vectors
A = np.array([3, 0, 0])   # along x
B = np.array([0, 4, 0])   # along y
C = np.array([0, 0, 2])   # along z

vol = abs(triple_product(A, B, C))
print(f"Box dimensions 3×4×2, volume = {vol}")
print(f"Expected: 3×4×2 = {3*4*2}")

# General parallelepiped
A2 = np.array([1, 0, 0])
B2 = np.array([0, 1, 0])
C2 = np.array([0.5, 0.5, 1])   # sheared top

vol2 = abs(triple_product(A2, B2, C2))
print(f"\\nSheared parallelepiped volume = {vol2:.4f}")

# Coplanar vectors — triple product should be zero
A3 = np.array([1, 0, 0])
B3 = np.array([0, 1, 0])
C3 = np.array([2, 3, 0])   # in the same xy-plane

vol3 = triple_product(A3, B3, C3)
print(f"Coplanar vectors triple product = {vol3} (should be 0)")`,
            expectedOutput:
`Box dimensions 3×4×2, volume = 24
Expected: 3×4×2 = 24

Sheared parallelepiped volume = 1.0000

Coplanar vectors triple product = 0 (should be 0)`,
          },

          // ── CELL 4: Challenge — find a missing component ───────────────
          {
            id: 'cell-04',
            type: 'code',
            challengeTitle: 'Challenge: Find the component that makes vectors perpendicular',
            challengeType: 'fill-in',
            code:
`import numpy as np

# You have A⃗ = (2, 1, 0) and B⃗ = (1, k, 2).
# Find the value of k such that A⃗ × B⃗ has magnitude 7.
#
# Strategy:
# 1. Write out A⃗ × B⃗ in terms of k
# 2. Compute |A⃗ × B⃗|² = 49
# 3. Solve for k
#
# Hint: use numpy to test your answer by computing |np.cross(A,B)| for k values.

# Test candidate k values
for k in range(-10, 11):
    A = np.array([2, 1, 0])
    B = np.array([1, k, 2])
    cross = np.cross(A, B)
    mag = np.linalg.norm(cross)

    # TODO: print only when magnitude is close to 7
    # (hint: use abs(mag - 7) < 0.01)

# Store your answer
k_answer = None  # replace with the correct value`,
            testCode:
`# There may be two solutions — check both
A_test = np.array([2, 1, 0])
B_test = np.array([1, k_answer, 2])
mag_test = np.linalg.norm(np.cross(A_test, B_test))
assert abs(mag_test - 7) < 0.01, f"Expected magnitude 7, got {mag_test:.4f}"`,
            hint: `Inside the loop, add \`if abs(mag - 7) < 0.01: print(f"k = {k}, |A×B| = {mag:.4f}")\`. You should find two integer values of k that work. Set \`k_answer\` to either one.`,
          },

          // ── CELL 5: Challenge — Lagrange identity ──────────────────────
          {
            id: 'cell-05',
            type: 'code',
            challengeTitle: 'Challenge: Verify the Lagrange identity numerically',
            challengeType: 'write',
            code:
`import numpy as np

# The Lagrange identity: |A × B|² + (A · B)² = |A|² |B|²
#
# Verify this for 5 random pairs of 3D vectors.
# For each pair, compute both sides and confirm they match.

np.random.seed(42)

for i in range(5):
    A = np.random.randn(3) * 5   # random 3D vector
    B = np.random.randn(3) * 5

    # Your code here:
    # 1. Compute |A × B|²
    # 2. Compute (A · B)²
    # 3. Compute |A|² * |B|²
    # 4. Check that LHS = RHS (use np.isclose)
    # 5. Print the results for each pair
`,
            testCode:
`# All 5 pairs must satisfy the identity (run the loop above and assert internally)
import numpy as np; np.random.seed(42)
for _ in range(5):
    A = np.random.randn(3) * 5
    B = np.random.randn(3) * 5
    lhs = np.linalg.norm(np.cross(A, B))**2 + np.dot(A, B)**2
    rhs = np.dot(A, A) * np.dot(B, B)
    assert np.isclose(lhs, rhs), f"Identity failed: {lhs:.4f} ≠ {rhs:.4f}"
print("All 5 pairs satisfy the Lagrange identity ✓")`,
            hint: `Compute \`lhs = np.linalg.norm(np.cross(A, B))**2 + np.dot(A, B)**2\` and \`rhs = np.linalg.norm(A)**2 * np.linalg.norm(B)**2\`. Then \`np.isclose(lhs, rhs)\` should be \`True\` for all pairs.`,
          },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-015-q1',
      question: `In the cross-product determinant, which row goes FIRST?`,
      options: [
        `Components of $\\vec{A}$`,
        `Components of $\\vec{B}$`,
        `The unit vectors $\\hat{i}, \\hat{j}, \\hat{k}$`,
        `The zero vector`,
      ],
      answer: 2,
      explanation: `The first row always holds the unit vectors $\\hat{i}, \\hat{j}, \\hat{k}$. The second row is $\\vec{A}$'s components and the third row is $\\vec{B}$'s components. Swapping rows 2 and 3 would negate the entire result.`,
    },
    {
      id: 'p1-ch1-015-q2',
      question: `The sign pattern for the three components when expanding the first row is:`,
      options: [
        `$+, +, +$`,
        `$+, -, +$`,
        `$-, +, -$`,
        `$+, -, -$`,
      ],
      answer: 1,
      explanation: `The cofactor expansion pattern for the first row of a 3×3 determinant is $+, -, +$. This means $R_x$ gets a $+$, $R_y$ gets a $-$ (the most common source of error), and $R_z$ gets a $+$.`,
    },
    {
      id: 'p1-ch1-015-q3',
      question: `Given $\\vec{A} = (1, 0, 0)$ and $\\vec{B} = (0, 1, 0)$, what is $\\vec{A} \\times \\vec{B}$?`,
      options: [
        `$(1, 0, 0)$`,
        `$(0, 0, 1)$`,
        `$(0, 0, -1)$`,
        `$(0, 1, 0)$`,
      ],
      answer: 1,
      explanation: `$\\hat{i} \\times \\hat{j} = \\hat{k} = (0, 0, 1)$ by the cyclic rule. Using the determinant: $R_x = 0\\cdot0 - 0\\cdot1 = 0$, $R_y = -(1\\cdot0 - 0\\cdot0) = 0$, $R_z = 1\\cdot1 - 0\\cdot0 = 1$. Result: $(0, 0, 1)$.`,
    },
    {
      id: 'p1-ch1-015-q4',
      question: `What formula gives the $\\hat{j}$ component of $\\vec{A} \\times \\vec{B}$?`,
      options: [
        `$A_yB_z - A_zB_y$`,
        `$A_xB_z - A_zB_x$`,
        `$-(A_xB_z - A_zB_x)$`,
        `$A_xB_y - A_yB_x$`,
      ],
      answer: 2,
      explanation: `The $\\hat{j}$ component is $-(A_xB_z - A_zB_x)$. This is the minor obtained by covering column 2, with the required minus sign from the cofactor expansion. Forgetting the negative is the most common cross product error.`,
    },
    {
      id: 'p1-ch1-015-q5',
      question: `How do you verify that a computed cross product $\\vec{C} = \\vec{A} \\times \\vec{B}$ is correct?`,
      options: [
        `Check $|\\vec{C}| = |\\vec{A}| + |\\vec{B}|$`,
        `Check $\\vec{A} \\cdot \\vec{C} = 0$ and $\\vec{B} \\cdot \\vec{C} = 0$`,
        `Check $\\vec{C} = \\vec{A} + \\vec{B}$`,
        `Check that $\\vec{C}$ points in the same direction as $\\vec{A}$`,
      ],
      answer: 1,
      explanation: `The cross product is perpendicular to both inputs, so dotting $\\vec{C}$ with either $\\vec{A}$ or $\\vec{B}$ must give zero. This is the standard perpendicularity check and catches most arithmetic errors.`,
    },
    {
      id: 'p1-ch1-015-q6',
      question: `Compute $\\vec{A} \\times \\vec{B}$ for $\\vec{A} = (2, 0, 0)$ and $\\vec{B} = (0, 0, 3)$.`,
      options: [
        `$(0, 6, 0)$`,
        `$(0, -6, 0)$`,
        `$(6, 0, 0)$`,
        `$(0, 0, 6)$`,
      ],
      answer: 1,
      explanation: `$R_x = 0\\cdot3 - 0\\cdot0 = 0$; $R_y = -(2\\cdot3 - 0\\cdot0) = -6$; $R_z = 2\\cdot0 - 0\\cdot0 = 0$. So $\\vec{A} \\times \\vec{B} = (0, -6, 0)$. Right-hand rule confirms: fingers along $+x$, curl toward $+z$, thumb points $-y$.`,
    },
    {
      id: 'p1-ch1-015-q7',
      question: `The "cover-column" technique says: to find $R_z$, cover column 3 and compute the 2×2 determinant. The 2×2 determinant of $\\begin{pmatrix}a & b \\\\ c & d\\end{pmatrix}$ equals:`,
      options: [
        `$a + d$`,
        `$ab - cd$`,
        `$ad - bc$`,
        `$ac - bd$`,
      ],
      answer: 2,
      explanation: `The 2×2 determinant is $ad - bc$: multiply the main diagonal, subtract the anti-diagonal product. This pattern repeats for each minor in the cross product expansion.`,
    },
    {
      id: 'p1-ch1-015-q8',
      question: `The Lagrange identity states $|\\vec{A} \\times \\vec{B}|^2 + (\\vec{A} \\cdot \\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$. What does this tell you about dot and cross products?`,
      options: [
        `The dot product and cross product are always equal`,
        `Together, the dot and cross products capture all of the "interaction" between two vectors`,
        `The dot product squared equals the cross product magnitude`,
        `The two products are independent and share no relationship`,
      ],
      answer: 1,
      explanation: `The Lagrange identity ($\\sin^2\\phi + \\cos^2\\phi = 1$ in disguise) shows that the cross product ($\\sin\\phi$) and dot product ($\\cos\\phi$) together fully characterise the relative orientation of two vectors. Knowing both tells you everything about how the vectors relate to each other.`,
    },
  ],
}
