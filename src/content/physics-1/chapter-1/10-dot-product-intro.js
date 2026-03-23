export default {
  id: 'ch1-010', slug: 'dot-product-intro', chapter: 1, order: 10,
  title: 'Dot Product — Scalar Product',
  subtitle: 'Multiply two vectors and get a single number that measures their alignment.',
  tags: ['dot product', 'scalar product', 'vector multiplication', 'projection'],
  aliases: 'dot-product scalar-product',
  hook: {
    question: 'How much of a force is actually pulling an object in the direction it is moving?',
    realWorldContext: 'Work is computed as the dot product of force and displacement. Solar panels produce the most power when their orientation vector "dots" perfectly with the sun\'s rays.',
    previewVisualizationId: 'DotProductIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (12 of 21) Product of Vectors: Dot Product: Scalar Product',
    embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/LbaT06YlJSA" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'The dot product measures how much one vector "goes in the direction of" another. Unlike addition, the result of a dot product is a **scalar (a number)**, not a vector.',
      'Geometrically, you can think of it as the length of the projection of $\\vec{A}$ onto $\\vec{B}$ multiplied by the length of $\\vec{B}$ (or vice versa).',
      'If two vectors are pointed in the same direction, the dot product is positive and large. If they are perpendicular, the result is zero. If they point in opposite directions, the result is negative.',
    ],
    callouts: [
      { type: 'definition', title: 'Scalar Product', body: '\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi' },
      { type: 'insight', title: 'Geometric meaning', body: 'The dot product is the shadow of one vector onto another, scaled by the other\'s length.' },
    ],
    visualizations: [{ id: 'DotProductIntuition', title: 'Interactive Dot Product', mathBridge: 'Drag the vectors and watch the dot product value and the geometric projection update in real time.', caption: 'Projection is the key to understanding the dot product.' }],
  },
  math: {
    prose: [
      'The geometric formula $\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi$ connects the magnitudes and the angle $\\phi$ between the vectors.',
      'This formula is particularly useful when you know the relative orientation but not the components.',
    ],
    callouts: [
      { type: 'theorem', title: 'Dot product range', body: '-|\\vec{A}||\\vec{B}| \\le \\vec{A} \\cdot \\vec{B} \\le |\\vec{A}||\\vec{B}|' },
    ],
    visualizations: [{ id: 'DotProductExplorer', title: 'Dot Product Geometric Explorer', mathBridge: 'Vary magnitudes and angles to see how the scalar product scales.', caption: 'Maximum alignment = maximum dot product.' }],
  },
  rigor: {
    prose: ['The dot product follows the distributive law and is commutative: $\\vec{A} \\cdot \\vec{B} = \\vec{B} \\cdot \\vec{A}$.'],
    callouts: [
      { type: 'theorem', title: 'Properties', body: '\\vec{A} \\cdot \\vec{B} = \\vec{B} \\cdot \\vec{A} \\qquad \\vec{A} \\cdot (\\vec{B} + \\vec{C}) = \\vec{A} \\cdot \\vec{B} + \\vec{A} \\cdot \\vec{C}' },
    ],
    visualizationId: 'DotProductProof',
    proofSteps: [
      { expression: '\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi', annotation: 'Start with the geometric definition.' },
      { expression: '\\text{If } \\phi = 0, \\vec{A} \\cdot \\vec{B} = |A||B|', annotation: 'Parallel vectors give maximum product.' },
      { expression: '\\text{If } \\phi = 90^\\circ, \\vec{A} \\cdot \\vec{B} = 0', annotation: 'Perpendicular vectors have zero projection.' },
    ],
    title: 'Defining the Scalar Product',
    visualizations: [{ id: 'DotProductFormRecogniser', title: 'Notation Drill', mathBridge: 'Identify valid vs invalid dot product expressions.', caption: 'Rigor starts with notation.' }],
  },
  examples: [
    {
      id: 'ch1-010-ex1', title: 'Basic calculation',
      problem: '|A| = 5, |B| = 8, \phi = 60^\circ. Find A \cdot B.',
      steps: [
        { expression: 'A \\cdot B = 5 \\times 8 \\times \\cos 60^\\circ', annotation: 'Substitute values.' },
        { expression: 'A \\cdot B = 40 \\times 0.5 = 20', annotation: 'Calculate.' },
      ],
      conclusion: 'The dot product is 20.',
    },
  ],
  challenges: [
    { id: 'ch1-010-ch1', difficulty: 'easy', problem: 'Two vectors of magnitude 10 are at 45° to each other. Calculate their dot product.', hint: 'Use the cos formula.', walkthrough: [{ expression: '10 \\times 10 \\times \\cos 45^\\circ \\approx 70.7', annotation: 'Apply formula.' }], answer: '70.7' },
  ],
}
