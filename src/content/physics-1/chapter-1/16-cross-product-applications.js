export default {
  id: 'p1-ch1-016', slug: 'cross-product-applications', chapter: 1, order: 16,
  title: 'Cross Product — Applications: Area and Torque',
  subtitle: 'Find the area of a parallelogram and the torque vector in physics.',
  tags: ['cross product', 'vector product', 'area', 'torque', 'application'],
  aliases: 'cross-product-applications',
  hook: {
    question: 'How do you calculate the area of a slanted parallelogram in 3D space?',
    realWorldContext: 'Aerospace engineering, architecture, and lighting design all use the cross product to find "normal vectors" — the vectors perpendicular to a surface at any given point.',
    previewVisualizationId: 'CrossProductExplorer',
  },
  videos: [{
    title: 'Physics 1 – Vectors (18 of 21) Product of Vectors: Cross Product: Vector Product — Geometrical Interpretation & Applications',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'The magnitude $|\vec{A} \times \vec{B}| = |\vec{A}||\vec{B}|\sin\phi$ is exactly the **area of the parallelogram** formed by $\vec{A}$ and $\vec{B}$.',
      'The direction of the result is exactly the **normal vector** to the plane defined by $\vec{A}$ and $\vec{B}$.',
      'This geometric property makes the cross product essential for physics: if $\vec{r}$ is the lever arm and $\vec{F}$ is the force, the torque $\vec{\tau} = \vec{r} \times \vec{F}$ is a vector describing the rotation.',
    ],
    callouts: [
      { type: 'definition', title: 'Torque Vector', body: '\\vec{\tau} = \\vec{r} \\times \\vec{F}' },
      { type: 'insight', title: 'Geometric mapping', body: 'The cross product magnitude scales with the area of the surface formed by the vectors.' },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'The right-hand rule and the parallelogram',
        caption: '|A⃗ × B⃗| = |A||B|sinφ equals the area of the parallelogram formed by A⃗ and B⃗. The direction (out of the page here) is given by the right-hand rule: curl fingers from A⃗ to B⃗, thumb points in the cross product direction.',
      },
      { id: 'CrossProductExplorer', title: 'Cross Product Explorer (Area & Torque)', mathBridge: 'Adjust the magnitudes and angles of two vectors and see the parallelogram area and the resulting cross product normal update instantly.', caption: 'Area and torque are the same geometric multiplication.' },
    ],
  },
  math: {
    prose: [
      'The cross product can be used to check if three vectors are coplanar (the triple scalar product $\\vec{A} \\cdot (\\vec{B} \\times \\vec{C}) = 0$).',
      'For area: Area of triangle = $\\frac{1}{2} |\\vec{A} \\times \\vec{B}|$.',
    ],
    callouts: [
      { type: 'theorem', title: 'Triple scalar product', body: 'V = |\\vec{A} \\cdot (\\vec{B} \\times \\vec{C})| \\text{ is the volume of a parallelopiped.}' },
    ],
    visualizations: [{ id: 'CrossProductPatternSpotter', title: 'Geometric Pattern Recognition', mathBridge: 'Identify the correct cross product direction using the right-hand rule.', caption: 'Right-hand rule is the standard of direction.' }],
  },
  rigor: {
    prose: ['We can use cross products to confirm that a coordinate system is "right-handed".'],
    callouts: [
      { type: 'theorem', title: 'Coordinate Handedness', body: '\\hat{i} \\times \\hat{j} = \\hat{k} \\implies \\text{Right-handed system.}' },
    ],
    visualizationId: 'CrossProductExplorer',
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
    title: 'Formal Condition for Cross Products',
    visualizations: [{ id: 'CrossProductFormRecogniser', title: 'Notation Recall', mathBridge: 'Identify valid vs invalid cross product expressions.', caption: 'Precision requires practice.' }],
  },
  examples: [
    {
      id: 'ch1-016-ex1', title: 'Calculate Torque',
      problem: '\\text{Find the torque vector if } \\vec{r} = (1, 2, 0) \\text{ and } \\vec{F} = (0, 10, 0).',
      steps: [
        { expression: '\\vec{\tau} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 1 & 2 & 0 \\\\ 0 & 10 & 0 \\end{vmatrix}', annotation: 'Apply cross product.' },
        { expression: '\\vec{\tau} = (2 \times 0 - 0 \times 10)\\hat{i} + (1 \times 0 - 0 \times 0)\\hat{j} + (1 \times 10 - 2 \times 0)\\hat{k} = 10\\hat{k}', annotation: 'Calculate each component.' },
      ],
      conclusion: 'The torque vector is (0, 0, 10). The rotation is perpendicular to both the lever arm and the force.',
    },
  ],
  challenges: [
    { id: 'ch1-016-ch1', difficulty: 'easy', problem: '\\vec{A}=(2,-1,2), \\vec{B}=(3,1,-2). \\text{ Find } |\\vec{A}\\times\\vec{B}|.', hint: 'Find the resulting vector first, then its magnitude.', walkthrough: [{ expression: '\\vec{A}\\times\\vec{B} = (2-2)\\hat{i} + (6+4)\\hat{j} + (2+3)\\hat{k} = (0, 10, 5) \\implies |\\vec{R}|\\approx11.18', annotation: 'Apply definition.' }], answer: '11.18' },
  ],
}
