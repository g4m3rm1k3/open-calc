export default {
  id: 'p1-ch1-010', slug: 'dot-product-intro', chapter: 'p1', order: 10,
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
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
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
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'The projection picture',
        caption: 'A⃗ · B⃗ = |A||B|cosφ. The dashed line drops perpendicular from B⃗\'s tip to A⃗\'s line — that foot is the projection of B⃗ onto A⃗. The dot product is (projection length) × |A|. When φ = 90°, the projection is zero.',
      },
      { id: 'DotProductIntuition', title: 'Interactive Dot Product', mathBridge: 'Drag the vectors and watch the dot product value and the geometric projection update in real time.', caption: 'Projection is the key to understanding the dot product.' },
    ],
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
      {
        title: "Define dot product (geometric)",
        expression: "\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi",
        annotation: "The geometric definition: project one vector onto the other, multiply by the other's magnitude. $\\phi$ is the angle between them.",
      },
      {
        title: "Expand with unit vectors",
        expression: "\\vec{A} \\cdot \\vec{B} = (A_x\\hat{i}+A_y\\hat{j}) \\cdot (B_x\\hat{i}+B_y\\hat{j})",
        annotation: "Expand both vectors into unit-vector form so we can apply the definition term by term.",
      },
      {
        title: "Distribute",
        expression: " = A_xB_x(\\hat{i}\\cdot\\hat{i}) + A_xB_y(\\hat{i}\\cdot\\hat{j}) + A_yB_x(\\hat{j}\\cdot\\hat{i}) + A_yB_y(\\hat{j}\\cdot\\hat{j})",
        annotation: "Dot product distributes over addition. Four cross-terms appear.",
      },
      {
        title: "Apply orthonormality",
        expression: "\\hat{i}\\cdot\\hat{i} = \\hat{j}\\cdot\\hat{j} = 1, \\quad \\hat{i}\\cdot\\hat{j} = \\hat{j}\\cdot\\hat{i} = 0",
        annotation: "Basis vectors are orthonormal: parallel ones give 1, perpendicular ones give 0. The cross-terms vanish.",
      },
      {
        title: "Result",
        expression: "\\therefore \\vec{A} \\cdot \\vec{B} = A_xB_x + A_yB_y",
        annotation: "The component formula follows directly. Both formulas — geometric and algebraic — are equal and interchangeable.",
      },
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
