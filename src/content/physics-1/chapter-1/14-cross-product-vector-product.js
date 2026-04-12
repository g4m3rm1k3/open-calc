export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-014',
  slug: 'cross-product-vector-product',
  chapter: 'p1',
  order: 14,
  title: 'Cross Product — The Vector Product',
  subtitle: 'Multiply two vectors and get a third that is perpendicular to both — with magnitude equal to the area they span.',
  tags: ['cross product', 'vector product', 'right-hand rule', 'torque', 'normal vector', 'anti-commutativity', 'determinant', 'angular momentum'],
  aliases: 'cross product vector product right hand rule torque perpendicular area parallelogram angular momentum magnetic force',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: 'You pull a wrench handle at an angle — the bolt turns. Which way? How hard? And why does the answer depend on which direction you pull?',
    realWorldContext:
      `Picture a bolt you're trying to loosen. You grab the wrench handle and pull. If you pull straight toward the bolt, nothing happens — the force goes through the pivot and produces zero rotation. If you pull perpendicular to the handle, you get maximum turning effect. Somewhere in between, the result is proportional to the "crosswise" part of the force. And there's a direction to the torque too: the bolt either spins clockwise or counterclockwise. This is exactly what the **cross product** captures — it measures how much two vectors are "crossing" each other, produces a magnitude that tells you how strong the effect is, and a direction that tells you which way it acts. Torque, angular momentum, magnetic force on a moving charge, and the normal to a surface — all are cross products.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'cross-product-rhr' },
  },

  // ── Videos ──────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (16 of 21) Product of Vectors: Cross Product: Vector Product',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (17 of 21) Cross Product: Right Hand Rule',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      `You already know the **dot product** — it multiplies two vectors to get a scalar that is largest when they point the same way and zero when they are perpendicular. The **cross product** is the complementary operation. It multiplies two vectors and produces a *third vector*, and it behaves in exactly the opposite way: it is **zero when the vectors are parallel** and **maximum when they are perpendicular**. Where the dot product asks "how much do these vectors agree?", the cross product asks "how much do they cross?".`,

      `The geometric picture is this: take vectors $\\vec{A}$ and $\\vec{B}$ and lay them tail-to-tail. They define a parallelogram. The **magnitude** of $\\vec{A} \\times \\vec{B}$ equals the **area of that parallelogram**. If the two vectors are parallel (they collapse into a line), the parallelogram has zero area — so the cross product is zero. If they are perfectly perpendicular, the parallelogram is a rectangle with the largest possible area — so the cross product is maximum. The formula is $|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$, where $\\phi$ is the angle between them. Notice the $\\sin$ — the exact opposite of the dot product's $\\cos$.`,

      `The **direction** of the result is what makes the cross product genuinely three-dimensional. The result vector $\\vec{A} \\times \\vec{B}$ points **perpendicular to the plane** that contains both $\\vec{A}$ and $\\vec{B}$. Think about that: if $\\vec{A}$ and $\\vec{B}$ lie flat on a table, then $\\vec{A} \\times \\vec{B}$ points straight up (or straight down). There are always two choices — up or down, left or right. The **right-hand rule** settles which one: point the fingers of your right hand along $\\vec{A}$, curl them toward $\\vec{B}$ (going through the smaller angle between them), and your **thumb points in the direction of $\\vec{A} \\times \\vec{B}$**. This rule is fundamental — you will use it constantly in physics.`,

      `Here is an important consequence of the right-hand rule: **the cross product is NOT commutative**. If you swap the order — computing $\\vec{B} \\times \\vec{A}$ instead — you curl your fingers the other way, and your thumb flips to the opposite direction. So $\\vec{B} \\times \\vec{A} = -(\\vec{A} \\times \\vec{B})$. This property is called **anti-commutativity**, and it's critical to keep track of order whenever you use cross products. This is very different from the dot product, where $\\vec{A} \\cdot \\vec{B} = \\vec{B} \\cdot \\vec{A}$ always.`,

      `Real-world cross products everywhere: **Torque** $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$ — the cross product of position and force, giving the rotational effect. **Magnetic force** $\\vec{F} = q\\vec{v} \\times \\vec{B}$ — the force on a moving charge in a magnetic field points perpendicular to both velocity and field. **Angular momentum** $\\vec{L} = \\vec{r} \\times \\vec{p}$ — the rotational equivalent of linear momentum. **Surface normals** in 3D geometry — the cross product of two edge vectors gives a vector perpendicular to the surface. In every case, the same structure applies: two inputs, one output that is perpendicular to both with magnitude proportional to how "crossed" the inputs are.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Cross product — magnitude and direction',
        body: `|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi\\qquad\\text{direction: right-hand rule (perpendicular to both)}\\n\\nResult is a **vector**, not a scalar. Zero when parallel ($\\phi=0°$ or $180°$), maximum when perpendicular ($\\phi=90°$).`,
      },
      {
        type: 'warning',
        title: 'Order matters — anti-commutativity',
        body: `\\vec{A}\\times\\vec{B} = -(\\vec{B}\\times\\vec{A})\\n\\nSwapping the inputs flips the direction of the result. Always check that you have the vectors in the right order before computing. In torque: $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$, not $\\vec{F}\\times\\vec{r}$.`,
      },
      {
        type: 'insight',
        title: 'Dot vs cross — the complete picture',
        body: `Dot product $\\vec{A}\\cdot\\vec{B}$: **scalar**, proportional to $\\cos\\phi$, maximum when **parallel**, zero when perpendicular.\\n\\nCross product $\\vec{A}\\times\\vec{B}$: **vector** perpendicular to both, magnitude proportional to $\\sin\\phi$, zero when **parallel**, maximum when perpendicular.\\n\\nTogether they capture everything about how two vectors relate to each other.`,
      },
      {
        type: 'mnemonic',
        title: 'Right-hand rule — step by step',
        body: `1. Point fingers of your **right hand** along $\\vec{A}$ (the first vector).\\n2. **Curl** fingers toward $\\vec{B}$ (the second vector), going through the smaller angle.\\n3. Your **thumb** points in the direction of $\\vec{A}\\times\\vec{B}$.\\n\\nAlternatively: if $\\vec{A}$ and $\\vec{B}$ lie in the $xy$-plane and the rotation from $\\vec{A}$ to $\\vec{B}$ is counterclockwise, the result points in $+z$.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Right-hand rule and the parallelogram area',
        caption: `A⃗ and B⃗ are shown in the xy-plane. The shaded parallelogram has area |A||B|sinφ — that is the magnitude of A⃗ × B⃗. The result vector (not shown) points straight out of the page (in the +z direction) because the rotation from A⃗ to B⃗ is counterclockwise. If you swapped the order, the result would point into the page.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Right-hand rule — interactive overview',
        caption: `Point your right-hand fingers along A⃗ and curl them toward B⃗. Your thumb points in the direction of A⃗ × B⃗. When A⃗ and B⃗ are parallel the parallelogram collapses to zero area — the cross product is zero. When they are 90° apart the area is maximum. The result vector is always perpendicular to both inputs.`,
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      `So far we know the magnitude and direction geometrically. But how do you actually **compute** the cross product from components? The answer is a $3\\times 3$ determinant — a systematic formula that handles all six component interactions at once.`,

      `Write the unit vectors $\\hat{i},\\hat{j},\\hat{k}$ in the first row of the determinant, the components of $\\vec{A}$ in the second row, and the components of $\\vec{B}$ in the third row. Expanding along the first row gives three $2\\times 2$ "minors", one for each basis direction. The result is three components that together describe $\\vec{A}\\times\\vec{B}$.`,

      `The $\\hat{j}$ term has a **minus sign** built into the determinant expansion — this catches many students off guard. Write the formula carefully and check every sign.`,

      `Once you have the component result, always **verify perpendicularity** by checking that $\\vec{A}\\cdot(\\vec{A}\\times\\vec{B})=0$ and $\\vec{B}\\cdot(\\vec{A}\\times\\vec{B})=0$. These dot products must both be zero. If they're not, you made an arithmetic error somewhere.`,

      `The **cyclic pattern** of the basis vectors is a shortcut worth memorising: $\\hat{i}\\times\\hat{j}=\\hat{k}$, $\\hat{j}\\times\\hat{k}=\\hat{i}$, $\\hat{k}\\times\\hat{i}=\\hat{j}$. Going counterclockwise in the cycle (i → j → k → i → …) gives a positive result; going clockwise gives negative. This comes directly from the determinant formula and the right-hand rule.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Component formula — determinant expansion',
        body: `\\vec{A}\\times\\vec{B} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\A_x&A_y&A_z\\\\B_x&B_y&B_z\\end{vmatrix} = (A_yB_z-A_zB_y)\\hat{i}\\;-\\;(A_xB_z-A_zB_x)\\hat{j}\\;+\\;(A_xB_y-A_yB_x)\\hat{k}`,
      },
      {
        type: 'mnemonic',
        title: 'Basis cross products — cyclic rule',
        body: `\\hat{i}\\times\\hat{j}=\\hat{k},\\quad\\hat{j}\\times\\hat{k}=\\hat{i},\\quad\\hat{k}\\times\\hat{i}=\\hat{j}\\n\\nReverse any pair: flip the sign. $\\hat{j}\\times\\hat{i}=-\\hat{k}$, etc. Think of i, j, k arranged in a circle. Going with the cycle gives $+$; against the cycle gives $-$.`,
      },
      {
        type: 'warning',
        title: 'The minus sign on the ĵ term',
        body: `When expanding the determinant, the $\\hat{j}$ component picks up a minus sign from the cofactor expansion. The formula is:\\n\\n$\\vec{A}\\times\\vec{B} = (A_yB_z-A_zB_y)\\hat{i} \\mathbf{-} (A_xB_z-A_zB_x)\\hat{j} + (A_xB_y-A_yB_x)\\hat{k}$\\n\\nDon't forget that minus sign on the middle component.`,
      },
      {
        type: 'insight',
        title: 'Perpendicularity check',
        body: `After computing $\\vec{C} = \\vec{A}\\times\\vec{B}$, always verify:\\n\\n$\\vec{A}\\cdot\\vec{C} = 0$ and $\\vec{B}\\cdot\\vec{C} = 0$\\n\\nBoth must be zero. This is a built-in error check that takes 10 seconds and catches most arithmetic mistakes.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Component formula — determinant view',
        caption: `Each component of A⃗ × B⃗ is a 2×2 minor of the determinant. The ĵ component carries a built-in minus sign from the cofactor expansion (+−+ pattern). When the two vectors are parallel, all three components go to zero simultaneously. When they are perpendicular, the area — and the magnitude — is at its peak.`,
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The cross product is formally defined in $\\mathbb{R}^3$ as the unique bilinear, anti-symmetric operation whose result is perpendicular to both inputs and satisfies $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$. It cannot be defined in 2D (the result would need to live in a third dimension) and doesn't generalise simply to 4D — the cross product is special to three dimensions.`,
      `The determinant formula is a consequence of linearity and the orthonormal basis relations $\\hat{i}\\times\\hat{j}=\\hat{k}$ etc. Anti-commutativity follows from swapping rows 2 and 3 of the determinant — the determinant changes sign. The fact that $\\vec{A}\\times\\vec{A}=\\vec{0}$ follows immediately from anti-commutativity: $\\vec{A}\\times\\vec{A} = -(\\vec{A}\\times\\vec{A})$, so twice the cross product is zero, so the cross product is zero.`,
      `The **scalar triple product** $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})$ gives the signed volume of the parallelepiped spanned by three vectors. It equals the $3\\times 3$ determinant of the matrix formed by the three vectors as rows. This is used in advanced mechanics and electromagnetism.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Anti-commutativity proven',
        body: `\\text{Swap rows 2 and 3: det changes sign.} \\implies \\vec{B}\\times\\vec{A} = -\\vec{A}\\times\\vec{B}.`,
      },
      {
        type: 'theorem',
        title: 'Cross product of a vector with itself',
        body: `\\vec{A}\\times\\vec{A} = \\vec{0}\\n\\nProof: anti-commutativity gives $\\vec{A}\\times\\vec{A} = -(\\vec{A}\\times\\vec{A})$, so $2(\\vec{A}\\times\\vec{A})=\\vec{0}$, so $\\vec{A}\\times\\vec{A}=\\vec{0}$. Geometrically: a parallelogram with both sides identical has zero area.`,
      },
      {
        type: 'insight',
        title: 'Why only in 3D?',
        body: `In 2D, two vectors define a plane, but the perpendicular to that plane has nowhere to live within 2D — it would need to point in a third direction. In 4D and higher, there are infinitely many directions perpendicular to a given plane, so there's no unique answer. Only in 3D is the perpendicular to a plane uniquely determined (up to sign). That's why the cross product is a 3D-only operation.`,
      },
    ],
    proofSteps: [
      {
        title: 'Define via determinant',
        expression: `\\vec{A} \\times \\vec{B} = \\det\\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ A_x & A_y & A_z \\\\ B_x & B_y & B_z \\end{vmatrix}`,
        annotation: 'The 3×3 determinant systematically generates all six component-pair products.',
      },
      {
        title: 'Expand along first row',
        expression: `= (A_yB_z - A_zB_y)\\hat{i} - (A_xB_z - A_zB_x)\\hat{j} + (A_xB_y - A_yB_x)\\hat{k}`,
        annotation: 'Each term is a 2×2 minor. Note the minus on the ĵ term — this is the cofactor sign pattern (+−+) for the first row.',
      },
      {
        title: 'Anti-commutativity',
        expression: `\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})`,
        annotation: 'Swap rows 2 and 3 of the determinant — the determinant changes sign. Therefore swapping inputs negates the result.',
      },
      {
        title: 'Perpendicularity',
        expression: `\\vec{A} \\cdot (\\vec{A} \\times \\vec{B}) = A_x(A_yB_z - A_zB_y) - A_y(A_xB_z - A_zB_x) + A_z(A_xB_y - A_yB_x) = 0`,
        annotation: 'Every term cancels. The cross product is always perpendicular to both inputs — this can be verified by direct expansion.',
      },
      {
        title: 'Magnitude formula',
        expression: `|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi`,
        annotation: 'This equals the area of the parallelogram spanned by A⃗ and B⃗. sinφ = 0 when parallel (zero area), maximum at φ = 90° (rectangle).',
      },
    ],
    title: 'Cross product — determinant formula, anti-commutativity, and perpendicularity',
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-014-ex1',
      title: 'Computing a cross product from components',
      problem: `\\text{Find }\\vec{A}\\times\\vec{B}\\text{ and verify perpendicularity, where }\\vec{A}=(2,1,0)\\text{ and }\\vec{B}=(0,3,1).`,
      steps: [
        {
          expression: `\\vec{A}\\times\\vec{B} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\2&1&0\\\\0&3&1\\end{vmatrix}`,
          annotation: 'Set up the 3×3 determinant.',
        },
        {
          expression: `\\hat{i}(1\\cdot1-0\\cdot3) - \\hat{j}(2\\cdot1-0\\cdot0) + \\hat{k}(2\\cdot3-1\\cdot0)`,
          annotation: 'Expand each 2×2 minor. Remember: minus sign on the ĵ term.',
        },
        {
          expression: `= \\hat{i}(1) - \\hat{j}(2) + \\hat{k}(6) = (1,-2,6)`,
          annotation: 'Collect results into component form.',
        },
        {
          expression: `\\text{Check: }\\vec{A}\\cdot\\vec{C}=(2)(1)+(1)(-2)+(0)(6)=2-2+0=0\\;\\checkmark`,
          annotation: 'Dot C⃗ with A⃗ — must be zero.',
        },
        {
          expression: `\\vec{B}\\cdot\\vec{C}=(0)(1)+(3)(-2)+(1)(6)=0-6+6=0\\;\\checkmark`,
          annotation: 'Dot C⃗ with B⃗ — must also be zero. Both checks pass: C⃗ is perpendicular to both inputs.',
        },
        {
          expression: `|\\vec{A}\\times\\vec{B}|=\\sqrt{1^2+(-2)^2+6^2}=\\sqrt{1+4+36}=\\sqrt{41}\\approx6.40`,
          annotation: 'Magnitude of the result.',
        },
      ],
      conclusion: `$\\vec{A}\\times\\vec{B}=(1,-2,6)$ with magnitude $\\sqrt{41}\\approx6.40$. Perpendicularity verified by zero dot products.`,
    },
    {
      id: 'ch1-014-ex2',
      title: 'Magnitude-only calculation',
      problem: `\\text{Find }|\\vec{A}\\times\\vec{B}|\\text{ if }|\\vec{A}|=5,\\;|\\vec{B}|=8,\\;\\phi=30°.`,
      steps: [
        {
          expression: `|\\vec{A}\\times\\vec{B}|=|\\vec{A}||\\vec{B}|\\sin\\phi=5\\times8\\times\\sin30°`,
          annotation: 'Apply the magnitude formula directly — no components needed.',
        },
        {
          expression: `=40\\times0.500=20`,
          annotation: 'sin 30° = 0.5 exactly.',
        },
      ],
      conclusion: `$|\\vec{A}\\times\\vec{B}|=20$. This also equals the area of the parallelogram formed by the two vectors: base 5, height $8\\sin30°=4$, area $=20$.`,
    },
    {
      id: 'ch1-014-ex3',
      title: 'Torque on a wrench',
      problem: `A wrench handle points along $\\vec{r}=(0.30,\\,0,\\,0)\\text{ m}$. A force $\\vec{F}=(0,\\,20,\\,0)\\text{ N}$ is applied. Find the torque $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$.`,
      steps: [
        {
          expression: `\\vec{\\tau}=\\vec{r}\\times\\vec{F}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\0.30&0&0\\\\0&20&0\\end{vmatrix}`,
          annotation: 'Set up the determinant. r⃗ is along +x, F⃗ is along +y.',
        },
        {
          expression: `= \\hat{i}(0\\cdot0-0\\cdot20)-\\hat{j}(0.30\\cdot0-0\\cdot0)+\\hat{k}(0.30\\cdot20-0\\cdot0)`,
          annotation: 'Expand the minors.',
        },
        {
          expression: `= 0\\hat{i}-0\\hat{j}+6\\hat{k}=(0,0,6)\\text{ N·m}`,
          annotation: 'The torque is 6 N·m in the +z direction — meaning the bolt turns counterclockwise when viewed from above.',
        },
      ],
      conclusion: `$\\vec{\\tau}=(0,0,6)\\text{ N·m}$. The magnitude is 6 N·m, pointing in $+z$. Right-hand rule confirms: point fingers along $+x$, curl toward $+y$, thumb points $+z$. The bolt rotates counterclockwise when viewed from above.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-014-ch1',
      difficulty: 'easy',
      problem: `Compute $\\hat{j}\\times\\hat{k}$.`,
      hint: 'Use the cyclic rule: j → k → i. Going forward (counterclockwise) in the cycle gives a positive result.',
      walkthrough: [
        { expression: `\\hat{j}\\times\\hat{k}=\\hat{i}`, annotation: 'Cyclic rule: j → k → i. This is the î direction.' },
      ],
      answer: `\\hat{i}`,
    },
    {
      id: 'ch1-014-ch2',
      difficulty: 'medium',
      problem: `Find $\\vec{A}\\times\\vec{B}$ for $\\vec{A}=(3,-1,2)$ and $\\vec{B}=(1,4,-1)$. Verify perpendicularity.`,
      hint: 'Set up the 3×3 determinant and expand carefully — watch the minus sign on the ĵ term.',
      walkthrough: [
        {
          expression: `\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\3&-1&2\\\\1&4&-1\\end{vmatrix}`,
          annotation: 'Write the determinant.',
        },
        {
          expression: `\\hat{i}[(-1)(-1)-(2)(4)]-\\hat{j}[(3)(-1)-(2)(1)]+\\hat{k}[(3)(4)-(-1)(1)]`,
          annotation: 'Expand each minor.',
        },
        {
          expression: `=\\hat{i}(1-8)-\\hat{j}(-3-2)+\\hat{k}(12+1)=(-7,5,13)`,
          annotation: 'Simplify each component.',
        },
        {
          expression: `\\vec{A}\\cdot(-7,5,13)=3(-7)+(-1)(5)+2(13)=-21-5+26=0\\;\\checkmark`,
          annotation: 'Perpendicularity check with A⃗.',
        },
        {
          expression: `\\vec{B}\\cdot(-7,5,13)=1(-7)+4(5)+(-1)(13)=-7+20-13=0\\;\\checkmark`,
          annotation: 'Perpendicularity check with B⃗. Both zero — correct.',
        },
      ],
      answer: `\\vec{A}\\times\\vec{B}=(-7,5,13)`,
    },
    {
      id: 'ch1-014-ch3',
      difficulty: 'hard',
      problem: `A magnetic force acts on a charge $q=2\\text{ C}$ moving with velocity $\\vec{v}=(3,0,0)\\text{ m/s}$ in a field $\\vec{B}=(0,0,5)\\text{ T}$. Find the force $\\vec{F}=q\\vec{v}\\times\\vec{B}$. Then describe what happens physically.`,
      hint: 'First compute v⃗ × B⃗ using the determinant. The charge moves in +x, the magnetic field points in +z. Use the right-hand rule to predict the direction before computing.',
      walkthrough: [
        {
          expression: `\\vec{v}\\times\\vec{B}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\3&0&0\\\\0&0&5\\end{vmatrix}`,
          annotation: 'Set up the determinant.',
        },
        {
          expression: `=\\hat{i}(0\\cdot5-0\\cdot0)-\\hat{j}(3\\cdot5-0\\cdot0)+\\hat{k}(3\\cdot0-0\\cdot0)`,
          annotation: 'Expand the minors.',
        },
        {
          expression: `=(0,-15,0)\\text{ (m/s)·T = m/s · kg/(A·s²) = N/C}`,
          annotation: 'v⃗ × B⃗ = (0, −15, 0) in SI units.',
        },
        {
          expression: `\\vec{F}=q(\\vec{v}\\times\\vec{B})=2\\times(0,-15,0)=(0,-30,0)\\text{ N}`,
          annotation: 'Multiply by charge q = 2 C.',
        },
        {
          expression: `\\text{Right-hand rule: fingers along }+x,\\text{ curl toward }+z\\implies\\text{thumb points }-y.\\;\\checkmark`,
          annotation: 'Confirm direction geometrically: the force is in the −y direction.',
        },
      ],
      answer: `\\vec{F}=(0,-30,0)\\text{ N}$. The charge is deflected in the $-y$ direction. Physically: the magnetic force is always perpendicular to velocity, so it curves the path without doing work (it cannot speed up or slow down the charge, only bend its trajectory into a circle).`,
    },
  ],

  // ── Python Lab ───────────────────────────────────────────────────────────
  python: {
    title: 'Python Lab — Cross Products with NumPy',
    description: `NumPy's \`np.cross()\` computes cross products in one line. We'll use it to verify our formulas, explore the geometry, and solve real physics problems.`,
    placement: 'after-rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Cross products: from formula to physics',
        props: {
          initialCells: [
          // ── CELL 1: Setup and basic cross product ─────────────────────
          {
            id: 'cell-01',
            type: 'code',
            cellTitle: 'Computing a cross product with NumPy',
            code:
`import numpy as np

# Define two vectors
A = np.array([2, 1, 0])
B = np.array([0, 3, 1])

# Cross product — NumPy handles the determinant
C = np.cross(A, B)
print("A =", A)
print("B =", B)
print("A × B =", C)

# Verify perpendicularity (both dot products must be zero)
print("\\nA · (A × B) =", np.dot(A, C))
print("B · (A × B) =", np.dot(B, C))
print("Both zero? ✓" if np.dot(A, C) == 0 and np.dot(B, C) == 0 else "Error!")`,
            expectedOutput:
`A = [2 1 0]
B = [0 3 1]
A × B = [1 -2  6]

A · (A × B) = 0
B · (A × B) = 0
Both zero? ✓`,
          },

          // ── CELL 2: Magnitude formula ──────────────────────────────────
          {
            id: 'cell-02',
            type: 'code',
            cellTitle: 'Magnitude formula verification',
            code:
`import numpy as np

A = np.array([2, 1, 0])
B = np.array([0, 3, 1])

# Angle between vectors using dot product
cos_phi = np.dot(A, B) / (np.linalg.norm(A) * np.linalg.norm(B))
phi = np.degrees(np.arccos(cos_phi))
print(f"Angle φ = {phi:.2f}°")

# Magnitude from cross product result
C = np.cross(A, B)
mag_from_cross = np.linalg.norm(C)
print(f"|A × B| from components = {mag_from_cross:.4f}")

# Magnitude from formula: |A||B|sinφ
mag_from_formula = np.linalg.norm(A) * np.linalg.norm(B) * np.sin(np.radians(phi))
print(f"|A||B|sinφ from formula = {mag_from_formula:.4f}")
print("Match?", np.isclose(mag_from_cross, mag_from_formula))

# Geometric interpretation: parallelogram area
print(f"\\nParallelogram area = {mag_from_cross:.4f} (same number)")`,
            expectedOutput:
`Angle φ = 74.21°
|A × B| from components = 6.4031
|A||B|sinφ from formula = 6.4031
Match? True

Parallelogram area = 6.4031 (same number)`,
          },

          // ── CELL 3: Anti-commutativity ─────────────────────────────────
          {
            id: 'cell-03',
            type: 'code',
            cellTitle: 'Anti-commutativity: A × B = −(B × A)',
            code:
`import numpy as np

A = np.array([3, -1, 2])
B = np.array([1,  4, -1])

AxB = np.cross(A, B)
BxA = np.cross(B, A)

print("A × B =", AxB)
print("B × A =", BxA)
print("-(B × A) =", -BxA)
print("A × B == -(B × A)?", np.allclose(AxB, -BxA))

# Cross product with itself is always zero
AxA = np.cross(A, A)
print("\\nA × A =", AxA)  # Must be zero vector`,
            expectedOutput:
`A × B = [-7  5 13]
B × A = [ 7 -5 -13]
-(B × A) = [-7  5 13]
A × B == -(B × A)? True

A × A = [0 0 0]`,
          },

          // ── CELL 4: Torque physics problem ────────────────────────────
          {
            id: 'cell-04',
            type: 'code',
            cellTitle: 'Torque = r⃗ × F⃗ on a wrench',
            code:
`import numpy as np

# Wrench problem
# r⃗: position vector from pivot to where force is applied (in metres)
# F⃗: applied force vector (in newtons)
r = np.array([0.30, 0.0, 0.0])   # 30 cm along x-axis
F = np.array([0.0, 20.0, 0.0])   # 20 N along y-axis

tau = np.cross(r, F)   # torque vector
mag_tau = np.linalg.norm(tau)

print(f"r⃗ = {r} m")
print(f"F⃗ = {F} N")
print(f"τ = r⃗ × F⃗ = {tau} N·m")
print(f"|τ| = {mag_tau:.2f} N·m")

# The +z direction means counterclockwise rotation (right-hand rule)
direction = "counterclockwise (tightens)" if tau[2] > 0 else "clockwise (loosens)"
print(f"Rotation: {direction} when viewed from +z")`,
            expectedOutput:
`r⃗ = [0.3 0.  0. ] m
F⃗ = [ 0. 20.  0.] N
τ = r⃗ × F⃗ = [0. 0. 6.] N·m
|τ| = 6.00 N·m
Rotation: counterclockwise (tightens) when viewed from +z`,
          },

          // ── CELL 5: Challenge — optimal torque angle ───────────────────
          {
            id: 'cell-05',
            type: 'code',
            challengeTitle: 'Challenge: Find the angle that maximises torque',
            challengeType: 'fill-in',
            code:
`import numpy as np

# A wrench handle is 0.25 m long, pointed along +x.
# A force of 15 N is applied at various angles in the xy-plane.
# Find the angle (in degrees from +x) that maximises the torque magnitude.

r_length = 0.25   # metres
F_magnitude = 15  # newtons

best_angle = None
best_torque = 0

for angle_deg in range(0, 360):
    angle_rad = np.radians(angle_deg)

    r = np.array([r_length, 0, 0])
    F = np.array([F_magnitude * np.cos(angle_rad),
                  F_magnitude * np.sin(angle_rad),
                  0])

    tau = np.cross(r, F)
    mag = np.linalg.norm(tau)

    # TODO: update best_angle and best_torque if this angle gives larger torque
    # (hint: compare mag > best_torque)

print(f"Maximum torque: {best_torque:.4f} N·m")
print(f"At angle: {best_angle}°")
print(f"Expected max = r × F = {r_length * F_magnitude:.4f} N·m")`,
            testCode:
`assert abs(best_torque - 3.75) < 0.01, f"Expected 3.75 N·m, got {best_torque:.4f}"
assert best_angle == 90 or best_angle == 270, f"Expected 90° or 270°, got {best_angle}"`,
            hint: `Inside the loop, check if \`mag > best_torque\`. If so, update \`best_torque = mag\` and \`best_angle = angle_deg\`. The maximum should be at 90° (or 270°) — when the force is perpendicular to the handle. The theoretical max is $|\\vec{r}||\\vec{F}|\\sin 90° = 0.25 \\times 15 = 3.75$ N·m.`,
          },

          // ── CELL 6: Challenge — magnetic force ────────────────────────
          {
            id: 'cell-06',
            type: 'code',
            challengeTitle: 'Challenge: Magnetic force on a moving charge',
            challengeType: 'write',
            code:
`import numpy as np

# A proton (charge q = 1.6e-19 C) moves with velocity
# v⃗ = (4e6, 0, 0) m/s (along +x at 4 million m/s)
# in a magnetic field B⃗ = (0, 0, 0.5) T (along +z)
#
# The magnetic force is F⃗ = q * (v⃗ × B⃗)
#
# 1. Compute v⃗ × B⃗
# 2. Compute the force F⃗
# 3. Find the magnitude of F⃗
# 4. Print the direction of F⃗ (which axis does it point along?)

q = 1.6e-19   # coulombs
v = np.array([4e6, 0.0, 0.0])   # m/s
B = np.array([0.0, 0.0, 0.5])   # tesla

# Your code here:
`,
            testCode:
`F_expected = np.array([0.0, -3.2e-13, 0.0])
assert np.allclose(F, F_expected, rtol=1e-3), f"Expected {F_expected}, got {F}"`,
            hint: `Use \`np.cross(v, B)\` for the cross product, then multiply by \`q\`. The force should be $(0, -3.2\\times10^{-13}, 0)$ N. Note the **negative y** direction: fingers point along $+x$ (velocity), curl toward $+z$ (field), thumb points $+y$... but wait — that gives $+y$ for $\\vec{v}\\times\\vec{B}$, then multiply by the positive charge — so force is in $+y$? Let's compute carefully and see. (If you get $-y$, double-check the field direction and the right-hand rule — the answer depends on whether the rotation from $v$ to $B$ is clockwise or counterclockwise in the $xz$-plane.)`,
          },

          // ── CELL 7: Visualise the cross product geometry ───────────────
          {
            id: 'cell-07',
            type: 'code',
            cellTitle: 'Visualise: cross product as parallelogram area',
            code:
`import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(10, 5))

# ── Left: 2D parallelogram area ──────────────────────────────────────────
ax1 = fig.add_subplot(121)
A2 = np.array([3, 1])
B2 = np.array([1, 3])
origin = np.zeros(2)

# Draw parallelogram
para = plt.Polygon([origin, A2, A2 + B2, B2], fill=True,
                   facecolor='lightblue', edgecolor='steelblue', linewidth=2)
ax1.add_patch(para)
ax1.annotate('', xy=A2, xytext=origin, arrowprops=dict(arrowstyle='->', color='red', lw=2))
ax1.annotate('', xy=B2, xytext=origin, arrowprops=dict(arrowstyle='->', color='green', lw=2))
ax1.text(1.2, 0.2, 'A⃗', color='red', fontsize=12, fontweight='bold')
ax1.text(0.2, 1.5, 'B⃗', color='green', fontsize=12, fontweight='bold')

C_mag = abs(np.cross(A2, B2))   # 2D cross product is a scalar
ax1.text(1.5, 1.5, f'Area = |A×B|\\n= {C_mag:.1f}', ha='center', fontsize=10,
         bbox=dict(boxstyle='round', facecolor='wheat'))
ax1.set_xlim(-0.5, 5); ax1.set_ylim(-0.5, 5)
ax1.set_aspect('equal'); ax1.set_title('Parallelogram area = |A × B|', fontsize=11)
ax1.grid(True, alpha=0.3); ax1.axhline(0, color='k', lw=0.5); ax1.axvline(0, color='k', lw=0.5)

# ── Right: 3D result vector ───────────────────────────────────────────────
ax2 = fig.add_subplot(122, projection='3d')
A3 = np.array([3, 1, 0])
B3 = np.array([1, 3, 0])
C3 = np.cross(A3, B3)
scale = 0.5  # scale result for visibility

ax2.quiver(0,0,0, *A3, color='red',   arrow_length_ratio=0.1, linewidth=2, label='A⃗')
ax2.quiver(0,0,0, *B3, color='green', arrow_length_ratio=0.1, linewidth=2, label='B⃗')
ax2.quiver(0,0,0, *(C3*scale), color='purple', arrow_length_ratio=0.1, linewidth=3,
           label=f'A×B (scaled) = {C3}')
ax2.set_xlabel('x'); ax2.set_ylabel('y'); ax2.set_zlabel('z')
ax2.set_title('A×B is perpendicular to both', fontsize=11)
ax2.legend(fontsize=8)

plt.tight_layout()
plt.savefig('cross_product_geometry.png', dpi=100, bbox_inches='tight')
plt.show()
print(f"A × B = {C3}  (points in +z — out of the page)")`,
            expectedOutput: `A × B = [0 0 8]  (points in +z — out of the page)`,
          },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-014-q1',
      question: `The cross product $\\vec{A} \\times \\vec{B}$ produces which type of result?`,
      options: [
        `A scalar (a single number)`,
        `A vector perpendicular to both $\\vec{A}$ and $\\vec{B}$`,
        `A vector parallel to $\\vec{A}$`,
        `A vector in the same plane as $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: 1,
      explanation: `The cross product always produces a vector that is perpendicular to both input vectors — it points out of the plane containing $\\vec{A}$ and $\\vec{B}$.`,
    },
    {
      id: 'p1-ch1-014-q2',
      question: `What is $|\\vec{A} \\times \\vec{B}|$ when $\\vec{A}$ and $\\vec{B}$ are parallel?`,
      options: [
        `$|\\vec{A}||\\vec{B}|$`,
        `$|\\vec{A}| + |\\vec{B}|$`,
        `0`,
        `$|\\vec{A}||\\vec{B}|/2$`,
      ],
      answer: 2,
      explanation: `$|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$. When the vectors are parallel, $\\phi = 0°$ and $\\sin 0° = 0$, so the cross product magnitude is zero.`,
    },
    {
      id: 'p1-ch1-014-q3',
      question: `If $\\vec{A} \\times \\vec{B} = \\vec{C}$, what is $\\vec{B} \\times \\vec{A}$?`,
      options: [
        `$\\vec{C}$`,
        `$-\\vec{C}$`,
        `$\\vec{0}$`,
        `$2\\vec{C}$`,
      ],
      answer: 1,
      explanation: `The cross product is anti-commutative: $\\vec{B} \\times \\vec{A} = -(\\vec{A} \\times \\vec{B}) = -\\vec{C}$. Swapping the order flips the direction of the result.`,
    },
    {
      id: 'p1-ch1-014-q4',
      question: `What does the geometric magnitude $|\\vec{A} \\times \\vec{B}|$ equal?`,
      options: [
        `The perimeter of the parallelogram formed by $\\vec{A}$ and $\\vec{B}$`,
        `The area of the parallelogram formed by $\\vec{A}$ and $\\vec{B}$`,
        `The diagonal length of the parallelogram`,
        `Half the area of the triangle formed by $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: 1,
      explanation: `$|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$, which equals the base times height of the parallelogram — that is exactly the area of the parallelogram spanned by the two vectors.`,
    },
    {
      id: 'p1-ch1-014-q5',
      question: `Which component has a built-in minus sign when expanding the cross product determinant?`,
      options: [
        `The $\\hat{i}$ component`,
        `The $\\hat{j}$ component`,
        `The $\\hat{k}$ component`,
        `All three components have minus signs`,
      ],
      answer: 1,
      explanation: `When expanding $\\vec{A} \\times \\vec{B} = (A_yB_z-A_zB_y)\\hat{i} - (A_xB_z-A_zB_x)\\hat{j} + (A_xB_y-A_yB_x)\\hat{k}$, the $\\hat{j}$ component carries a minus sign from the cofactor expansion (+−+ pattern along the first row).`,
    },
    {
      id: 'p1-ch1-014-q6',
      question: `Compute $\\hat{i} \\times \\hat{j}$.`,
      options: [
        `$\\hat{i}$`,
        `$-\\hat{k}$`,
        `$\\hat{k}$`,
        `$\\hat{j}$`,
      ],
      answer: 2,
      explanation: `By the cyclic rule: $\\hat{i} \\times \\hat{j} = \\hat{k}$. The cycle is $i \\to j \\to k \\to i$. Going forward (counterclockwise) gives a positive result.`,
    },
    {
      id: 'p1-ch1-014-q7',
      question: `A wrench handle is along $\\hat{x}$ and a force is applied along $\\hat{y}$. The torque $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$ points in which direction?`,
      options: [
        `$+\\hat{x}$`,
        `$+\\hat{y}$`,
        `$+\\hat{z}$`,
        `$-\\hat{z}$`,
      ],
      answer: 2,
      explanation: `$\\hat{x} \\times \\hat{y} = \\hat{z}$ by the cyclic rule. Point right-hand fingers along $+x$, curl toward $+y$, thumb points $+z$. The bolt turns counterclockwise when viewed from above.`,
    },
    {
      id: 'p1-ch1-014-q8',
      question: `After computing $\\vec{C} = \\vec{A} \\times \\vec{B}$, how do you verify the result is correct?`,
      options: [
        `Check that $|\\vec{C}| = |\\vec{A}| + |\\vec{B}|$`,
        `Check that $\\vec{A} \\cdot \\vec{C} = 0$ and $\\vec{B} \\cdot \\vec{C} = 0$`,
        `Check that $\\vec{A} \\times \\vec{C} = \\vec{B}$`,
        `Check that $\\vec{C}$ lies in the same plane as $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: 1,
      explanation: `The cross product is always perpendicular to both inputs, so $\\vec{A} \\cdot \\vec{C}$ and $\\vec{B} \\cdot \\vec{C}$ must both equal zero. This is a fast arithmetic check that catches most computation errors.`,
    },
  ],
}
