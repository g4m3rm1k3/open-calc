export default {
  id: 'p1-ch1-014',
  slug: 'cross-product-vector-product',
  chapter: 'p1',
  order: 14,
  title: 'Cross Product — The Vector Product',
  subtitle: 'Multiply two vectors and get a third that is perpendicular to both — with magnitude equal to the area they span.',
  tags: ['cross product', 'vector product', 'right-hand rule', 'torque', 'normal vector', 'anti-commutativity', 'determinant', 'angular momentum'],
  aliases: 'cross product vector product right hand rule torque perpendicular area parallelogram angular momentum magnetic force',

  hook: {
    question: 'You pull a wrench handle at an angle — the bolt turns. Which way? How hard? And why does the answer depend on which direction you pull?',
    realWorldContext:
      `Picture a bolt you're trying to loosen. You grab the wrench handle and pull. If you pull straight toward the bolt, nothing happens — the force goes through the pivot and produces zero rotation. If you pull perpendicular to the handle, you get maximum turning effect. Somewhere in between, the result is proportional to the "crosswise" part of the force. And there's a direction to the torque too: the bolt either spins clockwise or counterclockwise. This is exactly what the **cross product** captures — it measures how much two vectors are "crossing" each other, produces a magnitude that tells you how strong the effect is, and a direction that tells you which way it acts. Torque, angular momentum, magnetic force on a moving charge, and the normal to a surface — all are cross products.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'cross-product-rhr' },
  },

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

  intuition: {
    prose: [
      `$\\vec{A} = (1, 0, 0)$ and $\\vec{B} = (0, 1, 0)$. Before reading on, predict: what vector is perpendicular to both of them? It must point in the $\\pm z$ direction — but which one, and by how much? Compute the cross product from the rule you're about to learn and check your answer.`,

      `You already know the **dot product** — it multiplies two vectors to get a scalar that is largest when they point the same way and zero when they are perpendicular. The **cross product** is the complementary operation. It multiplies two vectors and produces a *third vector*, and it behaves in exactly the opposite way: it is **zero when the vectors are parallel** and **maximum when they are perpendicular**. Where the dot product asks "how much do these vectors agree?", the cross product asks "how much do they cross?".`,

      `The geometric picture is this: take vectors $\\vec{A}$ and $\\vec{B}$ and lay them tail-to-tail. They define a parallelogram. The **magnitude** of $\\vec{A} \\times \\vec{B}$ equals the **area of that parallelogram**. If the two vectors are parallel (they collapse into a line), the parallelogram has zero area — so the cross product is zero. If they are perfectly perpendicular, the parallelogram is a rectangle with the largest possible area — so the cross product is maximum. The formula is $|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$, where $\\phi$ is the angle between them. Notice the $\\sin$ — the exact opposite of the dot product's $\\cos$.`,

      `The **direction** of the result is what makes the cross product genuinely three-dimensional. The result vector $\\vec{A} \\times \\vec{B}$ points **perpendicular to the plane** that contains both $\\vec{A}$ and $\\vec{B}$. Think about that: if $\\vec{A}$ and $\\vec{B}$ lie flat on a table, then $\\vec{A} \\times \\vec{B}$ points straight up (or straight down). There are always two choices — up or down, left or right. The **right-hand rule** settles which one: point the fingers of your right hand along $\\vec{A}$, curl them toward $\\vec{B}$ (going through the smaller angle between them), and your **thumb points in the direction of $\\vec{A} \\times \\vec{B}$**. For the prediction above: point fingers along $+x$, curl toward $+y$ — thumb points $+z$. So $(1,0,0)\\times(0,1,0) = (0,0,1) = \\hat{k}$. ✓`,

      `Here is an important consequence of the right-hand rule: **the cross product is NOT commutative**. If you swap the order — computing $\\vec{B} \\times \\vec{A}$ instead — you curl your fingers the other way, and your thumb flips to the opposite direction. So $\\vec{B} \\times \\vec{A} = -(\\vec{A} \\times \\vec{B})$. This property is called **anti-commutativity**, and it's critical to keep track of order. In torque: $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$, not $\\vec{F}\\times\\vec{r}$.`,

      `Real-world cross products everywhere: **Torque** $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$ — the rotational effect of a force. **Magnetic force** $\\vec{F} = q\\vec{v} \\times \\vec{B}$ — the force on a moving charge perpendicular to both velocity and field. **Angular momentum** $\\vec{L} = \\vec{r} \\times \\vec{p}$ — the rotational equivalent of linear momentum. In every case: two inputs, one output perpendicular to both, magnitude proportional to how "crossed" the inputs are.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Cross product — magnitude and direction',
        body: `|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi`,
      },
      {
        type: 'warning',
        title: 'Order matters — anti-commutativity',
        body: `$\\vec{A}\\times\\vec{B} = -(\\vec{B}\\times\\vec{A})$. Swapping the inputs flips the direction of the result. Always check that you have the vectors in the right order before computing. In torque: $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$, not $\\vec{F}\\times\\vec{r}$.`,
      },
      {
        type: 'insight',
        title: 'Dot vs cross — the complete picture',
        body: `Dot product $\\vec{A}\\cdot\\vec{B}$: **scalar**, proportional to $\\cos\\phi$, maximum when **parallel**, zero when perpendicular.\n\nCross product $\\vec{A}\\times\\vec{B}$: **vector** perpendicular to both, magnitude $\\propto\\sin\\phi$, zero when **parallel**, maximum when perpendicular.\n\nTogether they capture everything about how two vectors relate to each other.`,
      },
      {
        type: 'mnemonic',
        title: 'Right-hand rule — step by step',
        body: `1. Point fingers of your **right hand** along $\\vec{A}$ (the first vector).\n2. **Curl** fingers toward $\\vec{B}$ (the second vector), going through the smaller angle.\n3. Your **thumb** points in the direction of $\\vec{A}\\times\\vec{B}$.\n\nAlternatively: if $\\vec{A}$ and $\\vec{B}$ lie in the $xy$-plane and the rotation from $\\vec{A}$ to $\\vec{B}$ is counterclockwise, the result points in $+z$.`,
      },
      {
        type: 'procedure',
        title: 'Computing a cross product from components',
        body: `1. **Set up the 3×3 determinant** with $\\hat{i},\\hat{j},\\hat{k}$ in row 1, $\\vec{A}$ components in row 2, $\\vec{B}$ components in row 3\n2. **Expand:** $\\vec{A}\\times\\vec{B} = (A_yB_z-A_zB_y)\\hat{i} - (A_xB_z-A_zB_x)\\hat{j} + (A_xB_y-A_yB_x)\\hat{k}$\n3. **Verify:** Check $\\vec{A}\\cdot(\\vec{A}\\times\\vec{B})=0$ and $\\vec{B}\\cdot(\\vec{A}\\times\\vec{B})=0` ,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Right-hand rule and the parallelogram area',
        caption: `A⃗ and B⃗ are shown in the xy-plane. The shaded parallelogram has area |A||B|sinφ — that is the magnitude of A⃗ × B⃗. The result vector points straight out of the page (in the +z direction) because the rotation from A⃗ to B⃗ is counterclockwise. If you swapped the order, the result would point into the page.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Right-hand rule — interactive overview',
        caption: `Point your right-hand fingers along A⃗ and curl them toward B⃗. Your thumb points in the direction of A⃗ × B⃗. When A⃗ and B⃗ are parallel the parallelogram collapses to zero area — the cross product is zero. When they are 90° apart the area is maximum. The result vector is always perpendicular to both inputs.`,
      },
    ],
  },

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
        body: `$\\hat{i}\\times\\hat{j}=\\hat{k}$, $\\hat{j}\\times\\hat{k}=\\hat{i}$, $\\hat{k}\\times\\hat{i}=\\hat{j}$. Reverse any pair: flip the sign. $\\hat{j}\\times\\hat{i}=-\\hat{k}$, etc. Think of i, j, k arranged in a circle. Going with the cycle gives $+$; against the cycle gives $-$.`,
      },
      {
        type: 'warning',
        title: 'The minus sign on the ĵ term',
        body: `When expanding the determinant, the $\\hat{j}$ component picks up a minus sign from the cofactor expansion. The formula is:\n\n$\\vec{A}\\times\\vec{B} = (A_yB_z-A_zB_y)\\hat{i} \\mathbf{-} (A_xB_z-A_zB_x)\\hat{j} + (A_xB_y-A_yB_x)\\hat{k}$\n\nDon't forget that minus sign on the middle component.`,
      },
      {
        type: 'insight',
        title: 'Perpendicularity check',
        body: `After computing $\\vec{C} = \\vec{A}\\times\\vec{B}$, always verify: $\\vec{A}\\cdot\\vec{C} = 0$ and $\\vec{B}\\cdot\\vec{C} = 0$. Both must be zero. This is a built-in error check that takes 10 seconds and catches most arithmetic mistakes.`,
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

  rigor: {
    prose: [
      `The cross product is formally defined in $\\mathbb{R}^3$ as the unique bilinear, anti-symmetric operation whose result is perpendicular to both inputs and satisfies $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$. It cannot be defined in 2D (the result would need to live in a third dimension) and doesn't generalise simply to 4D — the cross product is special to three dimensions.`,
      `The determinant formula is a consequence of linearity and the orthonormal basis relations $\\hat{i}\\times\\hat{j}=\\hat{k}$ etc. Anti-commutativity follows from swapping rows 2 and 3 of the determinant — the determinant changes sign. The fact that $\\vec{A}\\times\\vec{A}=\\vec{0}$ follows immediately from anti-commutativity: $\\vec{A}\\times\\vec{A} = -(\\vec{A}\\times\\vec{A})$, so twice the cross product is zero, so the cross product is zero.`,
      `The **scalar triple product** $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})$ gives the signed volume of the parallelepiped spanned by three vectors. It equals the $3\\times 3$ determinant of the matrix formed by the three vectors as rows. This is used in advanced mechanics and electromagnetism.`,
      `The Lagrange identity connects the dot and cross products: $|\\vec{A}\\times\\vec{B}|^2 + (\\vec{A}\\cdot\\vec{B})^2 = |\\vec{A}|^2|\\vec{B}|^2$. This follows from $\\sin^2\\phi + \\cos^2\\phi = 1$ and expresses the Pythagorean identity for vector products. It implies that if you know $\\vec{A}\\cdot\\vec{B}$ and $|\\vec{A}\\times\\vec{B}|$, you can recover $|\\vec{A}||\\vec{B}|$ — the two products together contain all the information about the relative magnitudes and angle.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Anti-commutativity proven',
        body: `\\vec{B}\\times\\vec{A} = -\\vec{A}\\times\\vec{B}`,
      },
      {
        type: 'theorem',
        title: 'Cross product of a vector with itself',
        body: `\\vec{A}\\times\\vec{A} = \\vec{0}`,
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
        annotation: 'Every term cancels. The cross product is always perpendicular to both inputs — verified by direct expansion.',
      },
      {
        title: 'Magnitude formula',
        expression: `|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi`,
        annotation: 'This equals the area of the parallelogram spanned by A⃗ and B⃗. sinφ = 0 when parallel (zero area), maximum at φ = 90° (rectangle).',
      },
    ],
    title: 'Cross product — determinant formula, anti-commutativity, and perpendicularity',
  },

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
          annotation: 'Dot C⃗ with B⃗ — must also be zero. Both checks pass.',
        },
        {
          expression: `|\\vec{A}\\times\\vec{B}|=\\sqrt{1+4+36}=\\sqrt{41}\\approx6.40`,
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
          annotation: 'The torque is 6 N·m in the +z direction — the bolt turns counterclockwise when viewed from above.',
        },
      ],
      conclusion: `$\\vec{\\tau}=(0,0,6)\\text{ N·m}$. The magnitude is 6 N·m, pointing in $+z$. Right-hand rule confirms: point fingers along $+x$, curl toward $+y$, thumb points $+z$. The bolt rotates counterclockwise when viewed from above.`,
    },
  ],

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
          expression: `\\vec{A}\\cdot(-7,5,13)=-21-5+26=0\\;\\checkmark,\\quad\\vec{B}\\cdot(-7,5,13)=-7+20-13=0\\;\\checkmark`,
          annotation: 'Both perpendicularity checks pass.',
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
          expression: `=\\hat{i}(0\\cdot5-0\\cdot0)-\\hat{j}(3\\cdot5-0\\cdot0)+\\hat{k}(3\\cdot0-0\\cdot0)=(0,-15,0)`,
          annotation: 'v⃗ × B⃗ = (0, −15, 0). The −y direction.',
        },
        {
          expression: `\\vec{F}=q(\\vec{v}\\times\\vec{B})=2\\times(0,-15,0)=(0,-30,0)\\text{ N}`,
          annotation: 'Multiply by charge q = 2 C.',
        },
        {
          expression: `\\text{Right-hand rule: fingers along }+x,\\text{ curl toward }+z\\implies\\text{thumb points }-y.\\;\\checkmark`,
          annotation: 'Confirm direction geometrically.',
        },
      ],
      answer: `\\vec{F}=(0,-30,0)\\text{ N. The charge deflects in the }-y\\text{ direction. The force is perpendicular to velocity, so it curves the path into a circle without doing work.}`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Computing a cross product — determinant and perpendicularity check',
          type: 'code',
          language: 'python',
          code: `import numpy as np

A = np.array([2, 1, 0])
B = np.array([0, 3, 1])

# np.cross implements the 3x3 determinant formula
C = np.cross(A, B)
print("A =", A)
print("B =", B)
print("A × B =", C)   # Should be (1, -2, 6)

# Verify perpendicularity — both dot products must be zero
print(f"\\nA · (A×B) = {np.dot(A, C)}")   # Must be 0
print(f"B · (A×B) = {np.dot(B, C)}")   # Must be 0

# Anti-commutativity: B × A = -(A × B)
print(f"\\nB × A = {np.cross(B, A)}")
print(f"-(A × B) = {-C}")
print(f"Anti-commutative? {np.allclose(np.cross(B, A), -C)}")

# Cross with itself = zero
print(f"\\nA × A = {np.cross(A, A)}")   # Must be zero vector`,
          prose: [
            `\`np.cross(A, B)\` implements the $3\\times 3$ determinant formula: $\\vec{A}\\times\\vec{B} = (A_yB_z-A_zB_y)\\hat{i} - (A_xB_z-A_zB_x)\\hat{j} + (A_xB_y-A_yB_x)\\hat{k}$. The result is a 3-element array — a vector, not a scalar.`,
            `The perpendicularity check $\\vec{A}\\cdot(\\vec{A}\\times\\vec{B}) = 0$ and $\\vec{B}\\cdot(\\vec{A}\\times\\vec{B}) = 0$ is the fastest way to catch arithmetic errors. Always include this check when computing cross products by hand.`,
            `Anti-commutativity: \`np.cross(B, A) == -np.cross(A, B)\`. Swapping inputs negates the result. A vector crossed with itself is always zero — a parallelogram with both sides identical has zero area.`,
          ],
        },
        {
          cellTitle: 'Visualising the parallelogram area and 3D result',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

fig = plt.figure(figsize=(11, 4))

# Left: parallelogram area in 2D (cross product is a scalar in 2D)
ax1 = fig.add_subplot(121)
A2 = np.array([3, 1])
B2 = np.array([1, 3])
origin = np.zeros(2)

para = plt.Polygon([origin, A2, A2+B2, B2], fill=True,
                   facecolor='lightblue', edgecolor='steelblue', lw=2, alpha=0.6)
ax1.add_patch(para)
for v, c, lbl in [(A2,'red','A'), (B2,'green','B')]:
    ax1.annotate('', xy=v, xytext=origin,
                 arrowprops=dict(arrowstyle='->', color=c, lw=2.5))
    ax1.text(v[0]*0.6+0.1, v[1]*0.6+0.1, lbl, color=c, fontsize=13, fontweight='bold')
area = abs(float(np.cross(A2, B2)))
ax1.text(2.0, 2.0, f'Area = {area:.0f}', ha='center', fontsize=11,
         bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
ax1.set_xlim(-0.5, 5.5); ax1.set_ylim(-0.5, 5.5)
ax1.set_aspect('equal'); ax1.grid(True, alpha=0.3)
ax1.set_title('Parallelogram area = |A×B|')

# Right: 3D result vector perpendicular to both
ax2 = fig.add_subplot(122, projection='3d')
A3 = np.array([3, 1, 0])
B3 = np.array([1, 3, 0])
C3 = np.cross(A3, B3)
ax2.quiver(0,0,0, *A3, color='red',    arrow_length_ratio=0.1, lw=2, label='A')
ax2.quiver(0,0,0, *B3, color='green',  arrow_length_ratio=0.1, lw=2, label='B')
ax2.quiver(0,0,0, *(C3*0.5), color='purple', arrow_length_ratio=0.1, lw=3,
           label=f'A×B/2 = {C3//2}')
ax2.set_xlabel('x'); ax2.set_ylabel('y'); ax2.set_zlabel('z')
ax2.set_title('A×B perpendicular to both'); ax2.legend(fontsize=8)

plt.tight_layout(); plt.show()
print(f"A×B = {C3}  (points in +z — perpendicular to xy-plane)")`,
          prose: [
            `The left panel shows the 2D cross product as a signed area. In 2D, \`np.cross(A2, B2)\` returns a scalar (the $z$-component of the 3D cross product), and its absolute value is the parallelogram area.`,
            `The right panel shows the 3D result vector $\\vec{A}\\times\\vec{B}$ pointing straight up ($+z$) out of the plane containing $\\vec{A}$ and $\\vec{B}$. When both input vectors lie in the $xy$-plane, the result must point along $\\pm z$ — the only direction perpendicular to both.`,
            `The purple arrow (scaled by 0.5 for visibility) confirms the right-hand rule: fingers along $+x$, curl toward $+y$ (counterclockwise rotation), thumb points $+z$. The magnitude is 8 — the area of the parallelogram with sides $\\vec{A}$ and $\\vec{B}$.`,
          ],
        },
        {
          cellTitle: 'Torque application — wrench and angular momentum',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# ── Torque: tau = r × F ────────────────────────────────────────────
print("=== Wrench Torque ===")
r = np.array([0.30, 0.0, 0.0])   # 30 cm along +x
F = np.array([0.0,  20.0, 0.0])  # 20 N along +y

tau = np.cross(r, F)
print(f"r = {r} m")
print(f"F = {F} N")
print(f"τ = r × F = {tau} N·m")
print(f"|τ| = {np.linalg.norm(tau):.2f} N·m")
print("Rotation: counterclockwise (viewed from +z)" if tau[2] > 0 else "clockwise")

# ── Effect of angle on torque ──────────────────────────────────────
print("\\n=== Force angle effect ===")
angles = [0, 30, 60, 90, 120, 150, 180]
for deg in angles:
    F_angle = np.array([20*np.cos(np.radians(deg)), 20*np.sin(np.radians(deg)), 0])
    tau_angle = np.cross(r, F_angle)
    print(f"  F at {deg:3d}°:  |τ| = {np.linalg.norm(tau_angle):.3f} N·m")

# ── Magnitude formula verification ────────────────────────────────
print("\\n=== Magnitude formula ===")
A = np.array([2, 1, 0])
B = np.array([0, 3, 1])
phi = np.degrees(np.arccos(np.clip(np.dot(A,B)/(np.linalg.norm(A)*np.linalg.norm(B)), -1, 1)))
mag_formula = np.linalg.norm(A) * np.linalg.norm(B) * np.sin(np.radians(phi))
mag_cross   = np.linalg.norm(np.cross(A, B))
print(f"|A||B|sinφ = {mag_formula:.4f}")
print(f"|A×B|      = {mag_cross:.4f}")
print(f"Equal?     {np.isclose(mag_formula, mag_cross)}")`,
          prose: [
            `$\\vec{\\tau} = \\vec{r}\\times\\vec{F}$: the wrench handle is along $+x$, force is along $+y$. The result $(0,0,6)$ points in $+z$ — confirming counterclockwise rotation. If you reversed either vector, the bolt would turn the other way.`,
            `The angle sweep shows how torque varies with force direction. At 0° and 180°, the force is along the handle (parallel to $\\vec{r}$) — zero torque. At 90°, force is perpendicular — maximum torque ($= |\\vec{r}||\\vec{F}| = 0.30 \\times 20 = 6$ N·m). This is the $\\sin\\phi$ factor in action.`,
            `The magnitude verification confirms $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$ for arbitrary vectors. Both the direct component calculation and the formula give the same result — they are equivalent expressions of the same geometric quantity.`,
          ],
        },
        {
          cellTitle: 'Challenge: magnetic force on a moving charge',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A proton (charge q = 1.6e-19 C) moves with velocity
# v = (4e6, 0, 0) m/s (along +x at 4 million m/s)
# in a magnetic field B = (0, 0.5, 0) T (along +y)
#
# The magnetic force is F = q * (v × B)
#
# Step 1: Compute v_cross_B = np.cross(v, B)
# Step 2: Compute F = q * v_cross_B
# Step 3: Print the magnitude and direction of F

q = 1.6e-19                      # coulombs
v = np.array([4e6, 0.0, 0.0])   # m/s
B = np.array([0.0, 0.5, 0.0])   # tesla

# Your code here:
# v_cross_B = np.cross(v, B)
# F = q * v_cross_B
# print(f"v × B = {v_cross_B}")
# print(f"F = {F} N")
# print(f"|F| = {np.linalg.norm(F):.3e} N")`,
          prose: [
            `$\\vec{F} = q(\\vec{v}\\times\\vec{B})$: the velocity is along $+x$, the field is along $+y$. Use the right-hand rule first: fingers along $+x$, curl toward $+y$ — thumb points $+z$. So the force is in the $+z$ direction for a positive charge.`,
            `Expected: $\\vec{v}\\times\\vec{B} = (0\\cdot0-0\\cdot0.5)\\hat{i} - (4\\times10^6\\cdot0-0\\cdot0)\\hat{j} + (4\\times10^6\\cdot0.5-0\\cdot0)\\hat{k} = (0, 0, 2\\times10^6)$. Then $\\vec{F} = q(0,0,2\\times10^6) = (0,0,3.2\\times10^{-13})$ N.`,
            `The force is perpendicular to the velocity — magnetic forces never do work. They can only change the direction of motion, not the speed. This is why charged particles in a magnetic field move in circles.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Computing a cross product in MATLAB',
          type: 'code',
          language: 'matlab',
          code: `A = [2, 1, 0];
B = [0, 3, 1];

% MATLAB's cross() implements the 3x3 determinant formula
C = cross(A, B);
fprintf('A = [%d %d %d]\\n', A);
fprintf('B = [%d %d %d]\\n', B);
fprintf('A x B = [%d %d %d]\\n', C);   % Should be (1, -2, 6)

% Verify perpendicularity
fprintf('\\nA·(A×B) = %g\\n', dot(A, C));   % Must be 0
fprintf('B·(A×B) = %g\\n', dot(B, C));   % Must be 0

% Anti-commutativity
BxA = cross(B, A);
fprintf('\\nB×A = [%d %d %d]\\n', BxA);
fprintf('-(A×B) = [%d %d %d]\\n', -C);
fprintf('Anti-commutative? %d\\n', all(BxA == -C));

% Cross with itself = zero
fprintf('\\nA×A = [%d %d %d]\\n', cross(A, A));`,
          prose: [
            `MATLAB's \`cross(A, B)\` computes $(A_yB_z-A_zB_y, -(A_xB_z-A_zB_x), A_xB_y-A_yB_x)$ — identical to \`np.cross\` in Python. The result is a 3-element row vector.`,
            `\`dot(A, C)\` and \`dot(B, C)\` must both be zero — the cross product is always perpendicular to both inputs. If either is non-zero, there is an arithmetic error in the computation.`,
            `\`cross(B, A) == -C\` confirms anti-commutativity. \`all(...)\` checks all three components. \`cross(A, A)\` must be \`[0 0 0]\` — a parallelogram with identical sides has zero area.`,
          ],
        },
        {
          cellTitle: 'Visualising the 3D result',
          type: 'code',
          language: 'matlab',
          code: `A3 = [3, 1, 0];
B3 = [1, 3, 0];
C3 = cross(A3, B3);

figure('Position', [100 100 500 400]);
quiver3(0,0,0, A3(1),A3(2),A3(3), 0, 'r', 'LineWidth', 2.5); hold on;
quiver3(0,0,0, B3(1),B3(2),B3(3), 0, 'g', 'LineWidth', 2.5);
quiver3(0,0,0, C3(1)*0.5,C3(2)*0.5,C3(3)*0.5, 0, 'm', 'LineWidth', 3);
xlabel('x'); ylabel('y'); zlabel('z');
legend('A = [3,1,0]', 'B = [1,3,0]', 'A×B/2 (scaled)', 'Location','best');
title(sprintf('A×B = [%g %g %g] — perpendicular to both', C3));
axis equal; grid on;
view(30, 25);

% Verify with text
fprintf('A×B = [%g %g %g]\\n', C3);
fprintf('Verify: A·(A×B) = %g\\n', dot(A3, C3));
fprintf('Verify: B·(A×B) = %g\\n', dot(B3, C3));`,
          prose: [
            `\`quiver3(0,0,0, vx,vy,vz, 0)\` draws a 3D vector from the origin with scale factor 0 (no auto-scaling). The purple arrow shows $\\vec{A}\\times\\vec{B}$ scaled by 0.5 for visibility.`,
            `Both $\\vec{A}$ and $\\vec{B}$ lie in the $xy$-plane. The cross product $\\vec{C} = (0, 0, 8)$ points straight up ($+z$) — the unique direction perpendicular to the $xy$-plane. The right-hand rule: fingers along $(3,1,0)$, curl toward $(1,3,0)$ — counterclockwise in the $xy$-plane, so thumb points $+z$.`,
            `\`view(30, 25)\` sets the viewing angle for the 3D plot. \`axis equal\` ensures vectors appear at their true proportions rather than stretched to fill the axes.`,
          ],
        },
        {
          cellTitle: 'Torque application',
          type: 'code',
          language: 'matlab',
          code: `% Torque: tau = r × F
fprintf('=== Wrench Torque ===\\n');
r = [0.30, 0.0, 0.0];    % 30 cm along +x
F_vec = [0.0, 20.0, 0.0]; % 20 N along +y

tau = cross(r, F_vec);
fprintf('r = [%.2f %.1f %.1f] m\\n', r);
fprintf('F = [%.1f %.1f %.1f] N\\n', F_vec);
fprintf('tau = r x F = [%.1f %.1f %.1f] N·m\\n', tau);
fprintf('|tau| = %.2f N·m\\n', norm(tau));

% Magnitude formula verification
fprintf('\\n=== Magnitude formula ===\\n');
A = [2, 1, 0]; B = [0, 3, 1];
cos_phi = dot(A,B)/(norm(A)*norm(B));
phi_deg = rad2deg(acos(max(-1,min(1,cos_phi))));
mag_formula = norm(A) * norm(B) * sin(deg2rad(phi_deg));
mag_cross   = norm(cross(A, B));
fprintf('|A||B|sin(phi) = %.4f\\n', mag_formula);
fprintf('|A×B|           = %.4f\\n', mag_cross);
fprintf('Equal?           %d\\n', abs(mag_formula - mag_cross) < 1e-10);

% Effect of angle on torque
fprintf('\\n=== Force angle effect ===\\n');
for deg = [0, 30, 60, 90, 120, 150, 180]
    F_a = [20*cos(deg2rad(deg)), 20*sin(deg2rad(deg)), 0];
    fprintf('  F at %3d deg: |tau| = %.3f N·m\\n', deg, norm(cross(r, F_a)));
end`,
          prose: [
            `$\\vec{\\tau} = \\vec{r}\\times\\vec{F}$ gives $(0, 0, 6)$ N·m — pointing in $+z$ (counterclockwise rotation viewed from above). The bolt tightens or loosens depending on the sign of $\\tau_z$.`,
            `The angle sweep confirms the $\\sin\\phi$ factor: torque is zero at 0° and 180° (force parallel to handle) and maximum at 90° (force perpendicular to handle). Maximum torque = $|\\vec{r}||\\vec{F}| = 0.30 \\times 20 = 6$ N·m.`,
            `The magnitude verification confirms $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$. Both the direct computation from components and the geometric formula give $\\sqrt{41} \\approx 6.4031$.`,
          ],
        },
        {
          cellTitle: 'Challenge: magnetic force',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% A proton (q = 1.6e-19 C) moves at v = [4e6, 0, 0] m/s
% in a magnetic field B_field = [0, 0.5, 0] T
% F = q * cross(v, B_field)

q = 1.6e-19;
v = [4e6, 0, 0];
B_field = [0, 0.5, 0];

% v_cross_B = cross(v, B_field);
% F = q * v_cross_B;
% fprintf('v × B = [%.2e %.2e %.2e]\\n', v_cross_B)
% fprintf('F = [%.2e %.2e %.2e] N\\n', F)
% fprintf('|F| = %.3e N\\n', norm(F))`,
          prose: [
            `$\\vec{F} = q(\\vec{v}\\times\\vec{B})$. The velocity is along $+x$, field along $+y$. Right-hand rule: fingers along $+x$, curl toward $+y$ — thumb points $+z$. So the force is in $+z$ for a positive charge.`,
            `Expected: \`cross([4e6,0,0],[0,0.5,0]) = [0*0-0*0.5, -(4e6*0-0*0), 4e6*0.5-0*0] = [0, 0, 2e6]\`. Then \`F = 1.6e-19 * [0, 0, 2e6] = [0, 0, 3.2e-13]\` N.`,
            `The magnetic force is always perpendicular to velocity — \`dot(v, F)\` should equal zero. This confirms the force cannot do work on the proton; it can only change the direction of travel.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-014-q1',
      type: 'choice',
      question: `The cross product $\\vec{A} \\times \\vec{B}$ produces which type of result?`,
      options: [
        `A scalar (a single number)`,
        `A vector perpendicular to both $\\vec{A}$ and $\\vec{B}$`,
        `A vector parallel to $\\vec{A}$`,
        `A vector in the same plane as $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: `A vector perpendicular to both $\\vec{A}$ and $\\vec{B}$`,
      hints: [
        'The dot product gives a scalar; what does the cross product give?',
        'Think about the right-hand rule — which direction does the thumb point relative to both input vectors?',
      ],
      reviewSection: 'intuition',
      explanation: `The cross product always produces a vector that is perpendicular to both input vectors — it points out of the plane containing $\\vec{A}$ and $\\vec{B}$.`,
    },
    {
      id: 'p1-ch1-014-q2',
      type: 'choice',
      question: `What is $|\\vec{A} \\times \\vec{B}|$ when $\\vec{A}$ and $\\vec{B}$ are parallel?`,
      options: [
        `$|\\vec{A}||\\vec{B}|$`,
        `$|\\vec{A}| + |\\vec{B}|$`,
        `$0$`,
        `$|\\vec{A}||\\vec{B}|/2$`,
      ],
      answer: `$0$`,
      hints: [
        'Use $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$.',
        'For parallel vectors, $\\phi = 0°$. What is $\\sin0°$?',
      ],
      reviewSection: 'intuition',
      explanation: `$|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$. When the vectors are parallel, $\\phi = 0°$ and $\\sin 0° = 0$, so the cross product magnitude is zero.`,
    },
    {
      id: 'p1-ch1-014-q3',
      type: 'choice',
      question: `If $\\vec{A} \\times \\vec{B} = \\vec{C}$, what is $\\vec{B} \\times \\vec{A}$?`,
      options: [
        `$\\vec{C}$`,
        `$-\\vec{C}$`,
        `$\\vec{0}$`,
        `$2\\vec{C}$`,
      ],
      answer: `$-\\vec{C}$`,
      hints: [
        'The cross product is anti-commutative — swapping inputs does what?',
        'Try applying the right-hand rule for both orders and see which way your thumb points.',
      ],
      reviewSection: 'intuition',
      explanation: `The cross product is anti-commutative: $\\vec{B} \\times \\vec{A} = -(\\vec{A} \\times \\vec{B}) = -\\vec{C}$. Swapping the order flips the direction of the result.`,
    },
    {
      id: 'p1-ch1-014-q4',
      type: 'choice',
      question: `What does the geometric magnitude $|\\vec{A} \\times \\vec{B}|$ equal?`,
      options: [
        `The perimeter of the parallelogram formed by $\\vec{A}$ and $\\vec{B}$`,
        `The area of the parallelogram formed by $\\vec{A}$ and $\\vec{B}$`,
        `The diagonal length of the parallelogram`,
        `Half the area of the triangle formed by $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: `The area of the parallelogram formed by $\\vec{A}$ and $\\vec{B}$`,
      hints: [
        '$|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$. Recall that the area of a parallelogram is base × height.',
        'Height = $|\\vec{B}|\\sin\\phi$, base = $|\\vec{A}|$, area = $|\\vec{A}|\\cdot|\\vec{B}|\\sin\\phi$.',
      ],
      reviewSection: 'intuition',
      explanation: `$|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$, which equals base × height of the parallelogram — that is exactly the area of the parallelogram spanned by the two vectors.`,
    },
    {
      id: 'p1-ch1-014-q5',
      type: 'choice',
      question: `Which component has a built-in minus sign when expanding the cross product determinant?`,
      options: [
        `The $\\hat{i}$ component`,
        `The $\\hat{j}$ component`,
        `The $\\hat{k}$ component`,
        `All three components have minus signs`,
      ],
      answer: `The $\\hat{j}$ component`,
      hints: [
        'Look at the cofactor sign pattern for a 3×3 determinant expanded along the first row.',
        'The pattern is +, −, + for the three first-row elements.',
      ],
      reviewSection: 'math',
      explanation: `When expanding $\\vec{A} \\times \\vec{B} = (A_yB_z-A_zB_y)\\hat{i} - (A_xB_z-A_zB_x)\\hat{j} + (A_xB_y-A_yB_x)\\hat{k}$, the $\\hat{j}$ component carries a minus sign from the cofactor expansion (+−+ pattern along the first row).`,
    },
    {
      id: 'p1-ch1-014-q6',
      type: 'choice',
      question: `Compute $\\hat{i} \\times \\hat{j}$.`,
      options: [
        `$\\hat{i}$`,
        `$-\\hat{k}$`,
        `$\\hat{k}$`,
        `$\\hat{j}$`,
      ],
      answer: `$\\hat{k}$`,
      hints: [
        'Use the cyclic rule: i → j → k → i → ...',
        'Going forward in the cycle (counterclockwise) gives a positive result.',
      ],
      reviewSection: 'math',
      explanation: `By the cyclic rule: $\\hat{i} \\times \\hat{j} = \\hat{k}$. The cycle is $i \\to j \\to k \\to i$. Going forward (counterclockwise) gives a positive result.`,
    },
    {
      id: 'p1-ch1-014-q7',
      type: 'choice',
      question: `A wrench handle is along $\\hat{x}$ and a force is applied along $\\hat{y}$. The torque $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$ points in which direction?`,
      options: [
        `$+\\hat{x}$`,
        `$+\\hat{y}$`,
        `$+\\hat{z}$`,
        `$-\\hat{z}$`,
      ],
      answer: `$+\\hat{z}$`,
      hints: [
        'Use the cyclic rule: $\\hat{x}\\times\\hat{y} = ?$',
        'Right-hand rule: point fingers along $+x$, curl toward $+y$ — which way does your thumb point?',
      ],
      reviewSection: 'examples',
      explanation: `$\\hat{x} \\times \\hat{y} = \\hat{z}$ by the cyclic rule. Point right-hand fingers along $+x$, curl toward $+y$, thumb points $+z$. The bolt turns counterclockwise when viewed from above.`,
    },
    {
      id: 'p1-ch1-014-q8',
      type: 'choice',
      question: `After computing $\\vec{C} = \\vec{A} \\times \\vec{B}$, how do you verify the result is correct?`,
      options: [
        `Check that $|\\vec{C}| = |\\vec{A}| + |\\vec{B}|$`,
        `Check that $\\vec{A} \\cdot \\vec{C} = 0$ and $\\vec{B} \\cdot \\vec{C} = 0$`,
        `Check that $\\vec{A} \\times \\vec{C} = \\vec{B}$`,
        `Check that $\\vec{C}$ lies in the same plane as $\\vec{A}$ and $\\vec{B}$`,
      ],
      answer: `Check that $\\vec{A} \\cdot \\vec{C} = 0$ and $\\vec{B} \\cdot \\vec{C} = 0$`,
      hints: [
        'The defining property of the cross product result is that it is perpendicular to both inputs.',
        'What does "perpendicular" mean in terms of the dot product?',
      ],
      reviewSection: 'math',
      explanation: `The cross product is always perpendicular to both inputs, so $\\vec{A} \\cdot \\vec{C}$ and $\\vec{B} \\cdot \\vec{C}$ must both equal zero. This is a fast arithmetic check that catches most computation errors.`,
    },
    {
      id: 'p1-ch1-014-q9',
      type: 'choice',
      question: `Why is the cross product only defined in 3D (and not in 2D or 4D)?`,
      options: [
        `Computers can't compute determinants in other dimensions`,
        `In 2D there's no third direction for the result; in 4D the perpendicular direction isn't unique`,
        `The sine function only works in 3D`,
        `The cyclic rule i→j→k only applies in 3D`,
      ],
      answer: `In 2D there's no third direction for the result; in 4D the perpendicular direction isn't unique`,
      hints: [
        'In 2D: if A and B are in the plane, where would A×B point?',
        'In 4D: how many directions are perpendicular to a plane?',
      ],
      reviewSection: 'rigor',
      explanation: `In 2D, the perpendicular to two planar vectors would point out of the plane — but there's no "out of the plane" in 2D. In 4D, there are infinitely many directions perpendicular to a given plane, so the result isn't unique. Only in 3D is the perpendicular to a plane uniquely defined (up to sign).`,
    },
    {
      id: 'p1-ch1-014-q10',
      type: 'choice',
      question: `A magnetic force $\\vec{F} = q\\vec{v}\\times\\vec{B}$ is always perpendicular to $\\vec{v}$. This means:`,
      options: [
        `The force can change the particle's speed`,
        `The force does zero work and cannot change the particle's speed`,
        `The particle moves in a straight line`,
        `The magnetic field does work on the particle`,
      ],
      answer: `The force does zero work and cannot change the particle's speed`,
      hints: [
        'Work = $\\vec{F}\\cdot\\vec{d}$. If force is perpendicular to displacement (velocity), what is the work done?',
        'Zero work means no change in kinetic energy — what does that say about speed?',
      ],
      reviewSection: 'challenges',
      explanation: `Since $\\vec{F}\\perp\\vec{v}$, the work done $W = \\vec{F}\\cdot\\vec{v} = 0$. Zero work means no change in kinetic energy, so the particle's speed is constant. The magnetic force only changes the direction of motion — it curves the path into a circle without speeding up or slowing down the particle.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-014-m1',
      wrong: 'The cross product is commutative — $\\vec{A}\\times\\vec{B} = \\vec{B}\\times\\vec{A}$.',
      correction: 'The cross product is anti-commutative: $\\vec{B}\\times\\vec{A} = -(\\vec{A}\\times\\vec{B})$. Swapping the order flips the direction of the result. For example, torque $\\vec{r}\\times\\vec{F}$ and $\\vec{F}\\times\\vec{r}$ point in opposite directions. This is different from the dot product, which is commutative.',
      correctionExample: '$\\hat{i}\\times\\hat{j} = +\\hat{k}$ but $\\hat{j}\\times\\hat{i} = -\\hat{k}$',
    },
    {
      id: 'p1-ch1-014-m2',
      wrong: 'The $\\hat{j}$ component of the cross product is $(A_xB_z - A_zB_x)\\hat{j}$, without any minus sign.',
      correction: 'The determinant cofactor expansion gives a minus sign on the $\\hat{j}$ term: $-(A_xB_z - A_zB_x)\\hat{j}$. This is the most common arithmetic error in cross product calculations. Double-check: the formula is $(A_yB_z-A_zB_y)\\hat{i} \\mathbf{-}(A_xB_z-A_zB_x)\\hat{j} + (A_xB_y-A_yB_x)\\hat{k}$.',
      correctionExample: 'For $\\vec{A}=(2,1,0)$, $\\vec{B}=(0,3,1)$: $\\hat{j}$ term $= -(2\\cdot1-0\\cdot0)\\hat{j} = -2\\hat{j}$, not $+2\\hat{j}$',
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-014-t1',
      prompt: `In 3D computer graphics, when you have a triangle defined by three vertices, you need the "surface normal" — a vector perpendicular to the triangle's face — to compute lighting. If the three vertices are $\\vec{P}_1$, $\\vec{P}_2$, $\\vec{P}_3$, how would you use the cross product to find the surface normal? Why do you need to be careful about the order of the cross product?`,
    },
    {
      id: 'p1-ch1-014-t2',
      prompt: `Angular momentum $\\vec{L} = \\vec{r}\\times\\vec{p} = \\vec{r}\\times(m\\vec{v})$ is conserved when no external torques act. For a planet orbiting the sun (with the sun at the origin), the gravitational force always points toward the sun (along $-\\vec{r}$). Use the cross product to show that this produces zero torque, which explains why the planet sweeps equal areas in equal times (Kepler's second law).`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-014-d1',
      buggyCode: `import numpy as np
A = np.array([3, -1, 2])
B = np.array([1, 4, -1])
# Manual cross product with wrong sign on j component
C = np.array([
    A[1]*B[2] - A[2]*B[1],   # i component: correct
    A[0]*B[2] - A[2]*B[0],   # j component: MISSING MINUS SIGN
    A[0]*B[1] - A[1]*B[0],   # k component: correct
])
print(C)  # Wrong answer`,
      language: 'python',
      issue: 'The $\\hat{j}$ component of the cross product must be negated in the determinant expansion. The cofactor sign pattern for the first row is $(+, -, +)$.',
      fix: `import numpy as np
A = np.array([3, -1, 2])
B = np.array([1, 4, -1])
C = np.array([
    A[1]*B[2] - A[2]*B[1],         # i: correct
    -(A[0]*B[2] - A[2]*B[0]),      # j: add the minus sign
    A[0]*B[1] - A[1]*B[0],         # k: correct
])
print(C)          # (-7, 5, 13)
print(np.cross(A, B))  # Verify with numpy`,
    },
    {
      id: 'p1-ch1-014-d2',
      buggyCode: `import numpy as np
# Computing torque for a door handle
# Handle points along +z (0, 0, 0.8) m
# Force applied along +x (50, 0, 0) N
r = np.array([0, 0, 0.8])
F = np.array([50, 0, 0])
torque = np.cross(F, r)   # Wrong order — F × r instead of r × F
print("Torque:", torque)  # Gives the wrong direction`,
      language: 'python',
      issue: 'The torque formula is $\\vec{\\tau} = \\vec{r}\\times\\vec{F}$ (position cross force), not $\\vec{F}\\times\\vec{r}$. The order matters because the cross product is anti-commutative.',
      fix: `import numpy as np
r = np.array([0, 0, 0.8])   # handle along +z
F = np.array([50, 0, 0])    # force along +x
torque = np.cross(r, F)     # Correct: r × F (position first)
print("Torque:", torque)    # Should be (0, 40, 0) = 40 N·m in +y direction`,
    },
  ],

  mastery: {
    targetLevel: 'You can compute a cross product using the determinant formula, apply the right-hand rule to determine direction, use the perpendicularity check to verify results, and apply the cross product to torque, magnetic force, and surface normal problems.',
    prerequisites: ['Component dot product and perpendicularity', 'Magnitude: $|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2}$', '3×3 determinant expansion (cofactor method)'],
    unlocks: ['Torque and rotational mechanics', 'Magnetic force and circular motion in fields', 'Angular momentum and its conservation', 'Surface normals in 3D geometry'],
    checkpoints: [
      'Can correctly apply the determinant formula including the minus sign on the $\\hat{j}$ component',
      'Can use the right-hand rule to predict the direction of a cross product before computing',
      'Can verify a cross product result by showing $\\vec{A}\\cdot(\\vec{A}\\times\\vec{B}) = 0$ and $\\vec{B}\\cdot(\\vec{A}\\times\\vec{B}) = 0$',
      'Can compute torque $\\vec{\\tau} = \\vec{r}\\times\\vec{F}$ and determine whether the rotation is clockwise or counterclockwise',
    ],
  },

  semantics: {
    core: [
      { symbol: '\\vec{A}\\times\\vec{B}', meaning: 'Cross product — a vector perpendicular to both $\\vec{A}$ and $\\vec{B}$, with magnitude $|A||B|\\sin\\phi$' },
      { symbol: '|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi', meaning: 'Magnitude formula — equals the area of the parallelogram spanned by $\\vec{A}$ and $\\vec{B}$' },
      { symbol: '\\vec{B}\\times\\vec{A} = -\\vec{A}\\times\\vec{B}', meaning: 'Anti-commutativity — swapping inputs negates the result (order matters!)' },
      { symbol: '\\vec{\\tau} = \\vec{r}\\times\\vec{F}', meaning: 'Torque — rotational effect of force; magnitude $= |r||F|\\sin\\phi$ where $\\phi$ is the angle between arm and force' },
      { symbol: '\\vec{F} = q\\vec{v}\\times\\vec{B}', meaning: 'Magnetic force on a moving charge — perpendicular to velocity, does zero work' },
    ],
    rulesOfThumb: [
      'Cross product is zero when vectors are parallel ($\\sin0°=0$) and maximum when perpendicular ($\\sin90°=1$) — the opposite of the dot product.',
      'Always apply the right-hand rule before computing — it tells you the direction before you touch numbers.',
      'The $\\hat{j}$ component in the determinant expansion has a minus sign — the most common arithmetic error.',
      'Verify every cross product by checking $\\vec{A}\\cdot(\\vec{A}\\times\\vec{B}) = 0$. If this is non-zero, recompute.',
      'The cross product is 3D only — in 2D the result would need to point in a non-existent third direction.',
    ],
  },
}
