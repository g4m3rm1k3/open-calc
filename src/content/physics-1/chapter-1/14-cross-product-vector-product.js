export default {
  id: 'ch1-014', slug: 'cross-product-vector-product', chapter: 1, order: 14,
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
    embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/C2nHuDNUW5o" frameborder="0" allowfullscreen></iframe>',
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
      { expression: '|\vec{A}\times\vec{B}|=|\vec{A}||\vec{B}|\sin\phi,\quad\text{direction: right-hand rule}', annotation: 'This is the result we want to establish.' },
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
