export default {
  id: 'p1-ch1-013', slug: 'dot-product-angle', chapter: 'p1', order: 13,
  title: 'Dot Product — Angle Between Vectors',
  subtitle: 'Use the dot product to solve for the geometric angle in any dimension.',
  tags: ['dot product', 'scalar product', 'angle between vectors', 'arc cosine'],
  aliases: 'dot-product-angle',
  hook: {
    question: 'How do you find the angle between two 3D vectors when you only have their components?',
    realWorldContext: 'Robotics, game engineering, and data analysis all use this formula to find the "angular distance" between vectors — whether those vectors are robot arms, light rays, or data points.',
    previewVisualizationId: 'AngleBetweenIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (15 of 21) Dot Product (Scalar Product) of Vectors: Angle Between the Two Vectors',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'The dot product provides two paths to the same number: the geometric path $\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi$ and the component path $\\vec{A} \\cdot \\vec{B} = A_xB_x + A_yB_y$.',
      'By equating these two paths, we can solve for the angle: $\\cos\\phi = \\frac{A_xB_x + A_yB_y}{|\\vec{A}||\\vec{B}|}$.',
      'This is the most powerful tool for geometric analysis. It works just as well in 3D: just add the $z$-components to the numerator and use the 3D magnitude formula for the denominator.',
    ],
    callouts: [
      { type: 'definition', title: 'Angle Between Vectors', body: '\\phi = \\arccos\\left(\\frac{\\vec{A} \\cdot \\vec{B}}{|\\vec{A}||\\vec{B}|}\\right)' },
      { type: 'insight', title: 'Magnitude-component bridge', body: 'The angle is the ratio of the actual dot product to the maximum possible dot product (|A||B|).' },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Two paths to the same number',
        caption: 'Geometric: A⃗·B⃗ = |A||B|cosφ. Component: A⃗·B⃗ = AₓBₓ + AyBy. Set them equal, divide both sides by |A||B|, and you get cosφ = (AₓBₓ + AyBy)/(|A||B|). The projection picture makes this formula inevitable.',
      },
      { id: 'AngleBetweenIntuition', title: 'Interactive Angle Visualiser', mathBridge: 'Drag the vectors and see the angle between them update in real-time. Notice how the arc and degree readout match the formula output.', caption: 'The angle is always measured between the vectors, tail-to-tail.' },
    ],
  },
  math: {
    prose: [
      'The range of the angle $\\phi$ is $0 \\le \\phi \\le \\pi$ ($0^\\circ \\le \\phi \\le 180^\\circ$).',
      'The cosine function is positive for acute angles ($\phi < 90^\\circ$), zero for orthogonal vectors ($\phi = 90^\\circ$), and negative for obtuse angles ($\phi > 90^\\circ$).',
    ],
    callouts: [
      { type: 'theorem', title: 'Acute vs Obtuse', body: '\\vec{A} \\cdot \\vec{B} > 0 \\implies \\text{Acute angle} \\quad \\vec{A} \\cdot \\vec{B} < 0 \\implies \\text{Obtuse angle}' },
    ],
    visualizations: [{ id: 'AngleBetweenExplorer', title: '3D Angle Between Vectors Calculator', mathBridge: 'Switch to 3D mode. Enter any set of components and see the exact angle between them calculated instantly.', caption: 'Calculators are the best tool for checking your math.' }],
  },
  rigor: {
    prose: ['The magnitude of the dot product is also used to derive the Law of Cosines for triangles.'],
    callouts: [
      { type: 'theorem', title: 'Law of Cosines (Vector Form)', body: '|\\vec{A} - \\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}' },
    ],
    visualizationId: 'AngleBetweenExplorer',
    proofSteps: [
      {
        title: "Define dot product (geometric)",
        expression: "\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi",
        annotation: "The geometric definition involves projecting one vector onto the other. We'll show this is identical to the component sum.",
      },
      {
        title: "Expand with unit vectors",
        expression: "\\vec{A} \\cdot \\vec{B} = (A_x\\hat{i} + A_y\\hat{j}) \\cdot (B_x\\hat{i} + B_y\\hat{j})",
        annotation: "Replace each vector with its unit-vector expansion. We can now apply the dot product definition term-by-term.",
      },
      {
        title: "Distribute over addition",
        expression: "= A_xB_x(\\hat{i} \\cdot \\hat{i}) + A_xB_y(\\hat{i} \\cdot \\hat{j}) + A_yB_x(\\hat{j} \\cdot \\hat{i}) + A_yB_y(\\hat{j} \\cdot \\hat{j})",
        annotation: "The dot product distributes like FOIL. Four cross-terms appear.",
      },
      {
        title: "Apply orthonormality",
        expression: "\\hat{i} \\cdot \\hat{i} = \\hat{j} \\cdot \\hat{j} = 1, \\quad \\hat{i} \\cdot \\hat{j} = \\hat{j} \\cdot \\hat{i} = 0",
        annotation: "The basis vectors are perpendicular (dot product 0) and have magnitude 1 (dot product 1). The cross-terms vanish.",
      },
      {
        title: "Combine and solve for angle",
        expression: "\\cos\\phi = \\frac{A_xB_x + A_yB_y}{|\\vec{A}||\\vec{B}|}",
        annotation: "Equate the geometric and component forms. Now we can solve for the geometric angle using only algebraic components.",
      },
    ],
    title: 'Solving for the Angle Between Vectors',
    visualizations: [{ id: 'AngleBetweenPatternSpotter', title: 'Angle Estimation Pattern Spotter', mathBridge: 'Visual quiz: estimate the angle between vector pairs by looking at their dot product signs and component ratios.', caption: 'Train your brain for visual estimation.' }],
  },
  examples: [
    {
      id: 'ch1-013-ex1', title: '3D Calculation',
      problem: '\\text{Find the angle between } \\vec{A} = (1, 2, -2) \\text{ and } \\vec{B} = (3, -4, 0).',
      steps: [
        { expression: '\\vec{A} \\cdot \\vec{B} = 1(3) + 2(-4) + (-2)(0) = 3 - 8 = -5', annotation: 'Component dot product.' },
        { expression: '|\\vec{A}| = \\sqrt{1^2+2^2+(-2)^2} = 3,\\quad |\\vec{B}| = \\sqrt{3^2+(-4)^2+0^2} = 5', annotation: 'Find magnitudes.' },
        { expression: '\\cos\\phi = -5 / (3 \\times 5) = -1/3', annotation: 'Divide dot product by product of magnitudes.' },
        { expression: '\\phi = \\arccos(-1/3) \\approx 109.5^\\circ', annotation: 'Obtuse angle because the dot product was negative.' },
      ],
      conclusion: 'The angle is approximately 109.5°.',
    },
  ],
  challenges: [
    { id: 'ch1-013-ch1', difficulty: 'easy', problem: '\\text{Find the angle between } \\vec{A} = (1, 1) \\text{ and } \\vec{B} = (1, 0).', hint: 'This is the angle between y=x and the x-axis.', walkthrough: [{ expression: '\\vec{A}\\cdot\\vec{B}=1, |A|=\\sqrt{2}, |B|=1 \\implies \\cos\\phi = 1/\\sqrt{2} \\implies \\phi = 45^\\circ', annotation: 'Apply definition.' }], answer: '45^\\circ' },
  ],
}
