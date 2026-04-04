export default {
  id: 'p1-ch1-011', slug: 'dot-product-arithmetic', chapter: 'p1', order: 11,
  title: 'Dot Product — Arithmetic Calculation',
  subtitle: 'Multiply vectors by component: $A_xB_x + A_yB_y + A_zB_z$.',
  tags: ['dot product', 'scalar product', 'vector multiplication', 'arithmetic', 'component-wise multiplication'],
  aliases: 'dot-product-arithmetic',
  hook: {
    question: 'How do you find the dot product if you only have the components $(A_x, A_y)$ and $(B_x, B_y)$?',
    realWorldContext: 'Computer graphics, physics engines, and data analysis all rely on the component form of the dot product because it requires no trigonometry — just simple multiplication and addition.',
    previewVisualizationId: 'DotProductExampleIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (13 of 21) Dot Product (Scalar Product) of Vectors: Component and Algebraic Form',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'The component-wise definition of the dot product is exactly the same as the geometric one: $\\vec{A} \\cdot \\vec{B} = A_xB_x + A_yB_y + A_zB_z$.',
      'It works because the basis vectors $\\hat{i}, \\hat{j}, \\hat{k}$ are perpendicular. Since $\\hat{i} \\cdot \\hat{j} = 0$ and $\\hat{i} \\cdot \\hat{i} = 1$, the cross-terms vanish during expansion.',
      'This calculation is fast, precise, and scales easily to 3D and beyond.',
    ],
    callouts: [
      { type: 'definition', title: 'Component-wise Dot Product', body: '\\vec{A} \\cdot \\vec{B} = A_xB_x + A_yB_y + A_zB_z' },
      { type: 'insight', title: 'Scalar result', body: 'The sum of scalars is a scalar. Every time you "dot" two vectors, the "vec-ness" is lost into a single number.' },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Why component multiplication = projection',
        caption: 'A⃗·B⃗ = AₓBₓ + AyBy comes directly from multiplying projections onto each axis. The geometric formula |A||B|cosφ and the component formula always give the same number — they are two views of the same operation.',
      },
      { id: 'DotProductExampleIntuition', title: 'Step-by-Step Dot Product Arithmetic', mathBridge: 'Watch each component pair multiply and add together in a live calculation.', caption: 'Arithmetic is the bridge to automation.' },
    ],
  },
  math: {
    prose: [
      'The dot product can also be written in matrix notation as $A^TB$ (the transpose of $A$ multiplied by $B$).',
      'This component form is why we say the dot product "sums the contributions" from each shared axis.',
    ],
    callouts: [
      { type: 'theorem', title: 'Dot product and magnitude', body: '\\vec{A} \\cdot \\vec{A} = |\\vec{A}|^2 \\implies |\\vec{A}| = \\sqrt{\\vec{A} \\cdot \\vec{A}}' },
    ],
    visualizations: [{ id: 'DotProductCalculator', title: 'Component/Mag-Angle Calculator', mathBridge: 'Switch between 2D and 3D modes. Set components or magnitudes/angles and see all values update.', caption: 'The ultimate vector scratchpad.' }],
  },
  rigor: {
    prose: ['We can derive the distributive property using this component form.'],
    callouts: [
      { type: 'theorem', title: 'Distributive property', body: '\\vec{A} \\cdot (\\vec{B} + \\vec{C}) = \\vec{A} \\cdot \\vec{B} + \\vec{A} \\cdot \\vec{C}' },
    ],
    visualizationId: 'DotProductCalculator',
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
        title: "Conclusion",
        expression: "\\therefore \\vec{A} \\cdot \\vec{B} = A_xB_x + A_yB_y",
        annotation: "The component formula is proven. Both formulas — geometric and algebraic — are interchangeable.",
      },
    ],
    title: 'Formal Derivation of Component Addition',
    visualizations: [{ id: 'DotProductPatternSpotter', title: 'Pattern Recognition Quiz', mathBridge: 'Identify the correct component multiplication pattern for the dot product.', caption: 'Precision requires practice.' }],
  },
  examples: [
    {
      id: 'ch1-011-ex1', title: '2D Calculation',
      problem: '\\vec{A} = (3, 4), \\vec{B} = (2, -1). \\text{ Find } \\vec{A} \\cdot \\vec{B}.',
      steps: [
        { expression: '\\vec{A} \\cdot \\vec{B} = (3)(2) + (4)(-1)', annotation: 'Multiply x components and y components.' },
        { expression: '\\vec{A} \\cdot \\vec{B} = 6 - 4 = 2', annotation: 'Sum the results.' },
      ],
      conclusion: 'The dot product is 2.',
    },
  ],
  challenges: [
    { id: 'ch1-011-ch1', difficulty: 'easy', problem: '\\text{Find } \\vec{A} \\cdot \\vec{B} \\text{ for } \\vec{A} = (5, 0, 2) \\text{ and } \\vec{B} = (1, 3, -4).', hint: 'Add up three component pairs.', walkthrough: [{ expression: '5(1) + 0(3) + 2(-4) = 5 + 0 - 8 = -3', annotation: 'Apply definition.' }], answer: '-3' },
  ],
}
