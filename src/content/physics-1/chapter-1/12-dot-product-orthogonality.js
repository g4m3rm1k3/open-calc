export default {
  id: 'p1-ch1-012', slug: 'dot-product-orthogonality', chapter: 1, order: 12,
  title: 'Dot Product — Orthogonality & Perpendicularity',
  subtitle: 'Two vectors are orthogonal if and only if their dot product is zero.',
  tags: ['dot product', 'scalar product', 'orthogonality', 'perpendicular vectors', 'perpendicularity'],
  aliases: 'dot-product-orthogonality',
  hook: {
    question: 'How do you check if two vectors are exactly 90 degrees apart without measuring the angle?',
    realWorldContext: 'Orthogonality is critical in physics: if a force is orthogonal to the direction of motion, it does exactly zero work. Gravity does zero work on a block moving on a level surface.',
    previewVisualizationId: 'OrthogonalityIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (14 of 21) Dot Product (Scalar Product) of Vectors: Orthogonality and Perpendicularity',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'Two non-zero vectors $\\vec{A}$ and $\\vec{B}$ are orthogonal if they are perpendicular geometrically. Since $\\cos 90^\\circ = 0$, the dot product $\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos 90^\\circ = 0$.',
      'The dot product is the most powerful "perpendicularity detector" in mathematics. If the dot product is zero, the vectors are either perpendicular or one of them is zero.',
      'This applies regardless of the number of dimensions. Even in 10-dimensional spaces, "zero dot product" means "perpendicular."',
    ],
    callouts: [
      { type: 'definition', title: 'Orthogonality Condition', body: '\\vec{A} \\perp \\vec{B} \\iff \\vec{A} \\cdot \\vec{B} = 0' },
      { type: 'insight', title: 'Perpendicular detection', body: 'The simplest check for 90 degrees: A_xB_x + A_yB_y + A_zB_z = 0.' },
    ],
    visualizations: [{ id: 'OrthogonalityIntuition', title: 'Interactive Orthogonality Visualiser', mathBridge: 'Drag the vectors and watch the dot product value update. The graph highlights when the value hits zero and the vectors are orthogonal.', caption: 'A zero dot product is the signature of 90 degrees.' }],
  },
  math: {
    prose: [
      'Finding an orthogonal vector is simple in 2D: if $\\vec{A} = (x, y)$, then $\\vec{B} = (-y, x)$ and $\\vec{B}\' = (y, -x)$ are both orthogonal to $\\vec{A}$.',
      'Checking orthogonality in 3D: $\\vec{A} = (x_1, y_1, z_1)$ and $\\vec{B} = (x_2, y_2, z_2)$ must satisfy $x_1x_2 + y_1y_2 + z_1z_2 = 0$.',
    ],
    callouts: [
      { type: 'theorem', title: 'Normal vector', body: '\\text{The vector } \\vec{n} \\text{ orthogonal to a surface is called the normal vector.}' },
    ],
    visualizations: [{ id: 'DotProductExplorer', title: 'Dot Product Geometric Explorer', mathBridge: 'Observe how the dot product value fluctuates between positive, zero (orthogonal), and negative values as vectors rotate.', caption: 'Vary the angle to watch for the orthogonality crossing point.' }],
  },
  rigor: {
    prose: ['We can use orthogonality to confirm that the basis vectors $\\hat{i}, \\hat{j}, \\hat{k}$ are independent.'],
    callouts: [
      { type: 'theorem', title: 'Basis Orthogonality', body: '\\hat{i} \\cdot \\hat{j} = 0 \\quad\\hat{j} \\cdot \\hat{k} = 0 \\quad\\hat{k} \\cdot \\hat{i} = 0' },
    ],
    visualizationId: 'DotProductProof',
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
        title: "Result: Zero dot product",
        expression: "\\vec{A} \\perp \\vec{B} \\iff \\vec{A} \\cdot \\vec{B} = 0",
        annotation: "If the dot product is zero, the angle must be exactly 90 degrees. Both geometric and algebraic definitions agree.",
      },
    ],
    title: 'Formal Condition for Orthogonality',
    visualizations: [{ id: 'OrthogonalityPatternSpotter', title: 'Orthogonality Detection Quiz', mathBridge: 'Quick-fire quiz: identify which vector pairs are orthogonal by sight and by component calculation.', caption: 'Test your "perpendicularity intuition."' }],
  },
  examples: [
    {
      id: 'ch1-012-ex1', title: 'Check Orthogonality',
      problem: '\\text{Are } \\vec{A} = (3, 4) \\text{ and } \\vec{B} = (-4, 3) \\text{ orthogonal?}',
      steps: [
        { expression: '\\vec{A} \\cdot \\vec{B} = (3)(-4) + (4)(3)', annotation: 'Component dot product.' },
        { expression: '\\vec{A} \\cdot \\vec{B} = -12 + 12 = 0', annotation: 'Calculate sum.' },
      ],
      conclusion: 'Yes, the dot product is zero, so they are orthogonal.',
    },
  ],
  challenges: [
    { id: 'ch1-012-ch1', difficulty: 'easy', problem: '\\text{Find } k \\text{ such that } \\vec{A} = (k, 2) \\text{ is orthogonal to } \\vec{B} = (3, -6).', hint: 'Set the dot product to zero and solve for k.', walkthrough: [{ expression: '3k + 2(-6) = 0 \\implies 3k - 12 = 0 \\implies k = 4', annotation: 'Solve for k.' }], answer: 'k = 4' },
  ],
}
