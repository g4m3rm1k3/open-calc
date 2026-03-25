export default {
  id: 'p1-ch1-015', slug: 'cross-product-calculator', chapter: 1, order: 15,
  title: 'Cross Product — Numerical Calculation',
  subtitle: 'Multiply vectors by component in 3D: using the determinant $A_yB_z - A_zB_y$.',
  tags: ['cross product', 'vector product', 'determinant', 'component calculation'],
  aliases: 'cross-product-calculator',
  hook: {
    question: 'How do you find the cross product when you only have 3D components like $(1, 3, -2)$ and $(4, 0, 5)$?',
    realWorldContext: 'Robotics, animation engines, and aerospace navigation all use the determinant form of the cross product to find orthogonal axes — like the orientation of a drone relative to its flight path.',
    previewVisualizationId: 'CrossProductCalculator',
  },
  videos: [{
    title: 'Physics 1 – Vectors (17 of 21) Product of Vectors: Cross Product: Vector Product — Determinant Form',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'The cross product exists only in 3D. The result is a vector $(R_x, R_y, R_z)$ that is perpendicular to both $\\vec{A}$ and $\\vec{B}$.',
      'The component form is most easily remembered as the determinant of a $3 \\times 3$ matrix with $\\hat{i}, \\hat{j}, \\hat{k}$ in the top row.',
      'The formula for each component is: $R_x = A_yB_z - A_zB_y$, $R_y = -(A_xB_z - A_zB_x)$, $R_z = A_xB_y - A_yB_x$.',
    ],
    callouts: [
      { type: 'definition', title: 'Determinant Form', body: '\\vec{A} \\times \\vec{B} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ A_x & A_y & A_z \\\\ B_x & B_y & B_z \\end{vmatrix}' },
      { type: 'insight', title: 'Perpendicular detection', body: 'The cross product formula always produces a vector $(x, y, z)$ such that $\\vec{R} \\cdot \\vec{A} = 0$ and $\\vec{R} \\cdot \\vec{B} = 0$.' },
    ],
    visualizations: [{ id: 'CrossProductCalculator', title: 'Step-by-Step Determinant Calculator', mathBridge: 'Enter any 3D components and watch the $3 \\times 3$ determinant expand into its component-wise formula in real-time.', caption: 'The determinant is the ultimate shorthand for cross product arithmetic.' }],
  },
  math: {
    prose: [
      'The cross product is **anti-commutative**: $\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})$. Swapping the inputs flips the direction of the result.',
      'If two vectors are parallel, their cross product is the zero vector $\\vec{0}$. This is the exact opposite of the dot product.',
    ],
    callouts: [
      { type: 'theorem', title: 'Parallel vectors', body: '\\vec{A} \parallel \\vec{B} \\iff \\vec{A} \\times \\vec{B} = \\vec{0}' },
    ],
    visualizations: [{ id: 'CrossProductFormRecogniser', title: 'Notation Drill', mathBridge: 'Identify valid vs invalid cross product expressions.', caption: 'The cross product result is always a vector.' }],
  },
  rigor: {
    prose: ['We can derive the distributive property using this component form.'],
    callouts: [
      { type: 'theorem', title: 'Distributive property', body: '\\vec{A} \\times (\\vec{B} + \\vec{C}) = \\vec{A} \\times \\vec{B} + \\vec{A} \\times \\vec{C}' },
    ],
    visualizationId: 'CrossProductProof',
    proofSteps: [
      {
        title: "Define via determinant",
        expression: "\\vec{A} \\times \\vec{B} = \\text{det}\\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ A_x & A_y & A_z \\\\ B_x & B_y & B_z \\end{vmatrix}",
        annotation: "The 3×3 determinant is the systematic way to remember all six component-pair products.",
      },
      {
        title: "Magnitude formula",
        expression: "|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi",
        annotation: "$\\sin\\phi = 0$ when parallel (0° or 180°). Maximum when perpendicular (90°). Opposite of the dot product pattern.",
      },
      {
        title: "Direction: right-hand rule",
        expression: "\\text{Curl A to B } \\implies \\text{Thumb points to } \\vec{A} \\times \\vec{B}",
        annotation: "The cross product is always perpendicular to BOTH input vectors. It cannot have any component along A or B.",
      },
      {
        title: "Anti-commutativity",
        expression: "\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})",
        annotation: "Swapping the order flips the sign — opposite direction. Unlike the dot product, order matters critically here.",
      },
      {
        title: "Parallel vectors give zero",
        expression: "\\vec{A} \\parallel \\vec{B} \\implies \\vec{A} \\times \\vec{B} = \\vec{0}",
        annotation: "No perpendicular component exists when vectors are parallel. The cross product collapses to the zero vector.",
      },
    ],
    title: 'Formal Derivation of Component Form',
    visualizations: [{ id: 'CrossProductPatternSpotter', title: 'Pattern Recognition Quiz', mathBridge: 'Identify the correct component multiplication pattern for the cross product.', caption: 'Train your brain for determinant expansion.' }],
  },
  examples: [
    {
      id: 'ch1-015-ex1', title: 'Basic 3D Calculation',
      problem: '\\vec{A} = (1, 3, -2), \\vec{B} = (4, 0, 5). \\text{ Find } \\vec{A} \\times \\vec{B}.',
      steps: [
        { expression: 'R_x = (3)(5) - (-2)(0) = 15', annotation: 'Top-left minor.' },
        { expression: 'R_y = -((1)(5) - (-2)(4)) = -(5 + 8) = -13', annotation: 'Top-middle minor (negative sign!).' },
        { expression: 'R_z = (1)(0) - (3)(4) = -12', annotation: 'Top-right minor.' },
      ],
      conclusion: 'The resultant vector is (15, -13, -12).',
    },
  ],
  challenges: [
    { id: 'ch1-015-ch1', difficulty: 'easy', problem: '\\text{Find } \\vec{A} \\times \\vec{B} \\text{ for } \\vec{A} = (1, 0, 0) \\text{ and } \\vec{B} = (0, 1, 0).', hint: 'i \times j = k.', walkthrough: [{ expression: '\\hat{i} \\times \\hat{j} = (0)(0) - (0)(1) = 0\\hat{i} - 0\\hat{j} + 1\\hat{k} = \\hat{k}', annotation: 'Apply definition.' }], answer: '(0, 0, 1)' },
  ],
}
