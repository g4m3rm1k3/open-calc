export default {
  id: 'p1-ch1-014', slug: 'cross-product-vector-product', chapter: 1, order: 14,
  title: 'Cross Product — Vector Product',
  subtitle: 'Multiply two vectors and get a third that is perpendicular to both.',
  tags: ['cross product', 'vector product', 'right-hand rule', 'torque', 'normal vector'],
  aliases: 'cross-product-vector-product',
  hook: {
    question: 'A torque wrench pulls at an angle — how do you find the torque vector and which way the bolt turns?',
    realWorldContext: 'Torque, angular momentum, magnetic force — all are cross products. The result is a vector perpendicular to both inputs.',
    previewVisualizationId: 'CrossProductIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (16 of 21) Product of Vectors: Cross Product: Vector Product',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: ['See the key formula below and the visualizations for intuition.'],
    callouts: [{ type: 'theorem', title: 'Core formula', body: '|\vec{A}\times\vec{B}|=|\vec{A}||\vec{B}|\sin\phi,\quad\text{direction: right-hand rule}' }],
    visualizations: [{ id: 'CrossProductIntuition', title: 'Cross Product — Vector Product — intuition', mathBridge: 'Interactive exploration of Cross Product — Vector Product.', caption: 'Drag and explore.' }],
  },
  math: {
    prose: ['Work through the formula step by step.'],
    callouts: [{ type: 'insight', title: 'Key formula', body: '|\vec{A}\times\vec{B}|=|\vec{A}||\vec{B}|\sin\phi,\quad\text{direction: right-hand rule}' }],
    visualizations: [{ id: 'CrossProductExplorer', title: 'Cross Product — Vector Product — explorer', mathBridge: 'Adjust inputs and see outputs update.', caption: 'Every input combination covered.' }],
  },
  rigor: {
    prose: ['The formula follows from the definitions.'],
    callouts: [{ type: 'definition', title: 'Formal definition', body: '|\vec{A}\times\vec{B}|=|\vec{A}||\vec{B}|\sin\phi,\quad\text{direction: right-hand rule}' }],
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
    title: 'Cross Product — Vector Product — derivation',
    visualizations: [{ id: 'CrossProductProof', title: 'Proof steps', mathBridge: 'Each step builds on the previous.' }],
  },
  examples: [
    { id: 'ch1-014-ex1', title: 'Core calculation', problem: 'Apply the Cross Product — Vector Product formula to given vectors.', steps: [{ expression: '|\vec{A}\times\vec{B}|=|\vec{A}||\vec{B}|\sin\phi,\quad\text{direction: right-hand rule}', annotation: 'Direct application.' }], conclusion: 'Use the formula systematically.' },
  ],
  challenges: [
    { id: 'ch1-014-ch1', difficulty: 'easy', problem: 'Apply Cross Product — Vector Product to simple vectors.', hint: 'Use the formula directly.', walkthrough: [{ expression: '|\vec{A}\times\vec{B}|=|\vec{A}||\vec{B}|\sin\phi,\quad\text{direction: right-hand rule}', annotation: 'Apply directly.' }], answer: 'See formula above.' },
  ],
}
