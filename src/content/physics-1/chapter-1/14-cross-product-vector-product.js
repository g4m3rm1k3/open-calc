export default {
  id: 'p1-ch1-014', slug: 'cross-product-vector-product', chapter: 1, order: 14,
  title: 'Cross Product — Vector Product',
  subtitle: 'Multiply two vectors and get a third that is perpendicular to both.',
  tags: ['cross product', 'vector product', 'right-hand rule', 'torque', 'normal vector'],
  aliases: 'cross-product-vector-product',
  hook: {
    question: 'A torque wrench pulls at an angle — how do you find the torque vector and which way the bolt turns?',
    realWorldContext: 'Torque, angular momentum, magnetic force on a moving charge — all are cross products. The result is a vector perpendicular to both inputs, with magnitude proportional to how "un-parallel" the two vectors are.',
    previewVisualizationId: 'CrossProductIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (16 of 21) Product of Vectors: Cross Product: Vector Product',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'The dot product swallows two vectors and spits out a *scalar*. The cross product is different — it takes two vectors and produces a *third vector* that is perpendicular to both inputs.',
      'Geometrically, the **magnitude** $|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$ is the area of the parallelogram formed by $\\vec{A}$ and $\\vec{B}$. The more perpendicular they are ($\\phi = 90°$), the larger the result. Parallel vectors ($\\phi = 0°$ or $180°$) give zero.',
      'The **direction** is given by the right-hand rule: point your fingers along $\\vec{A}$, curl them toward $\\vec{B}$, and your thumb points in the direction of $\\vec{A} \\times \\vec{B}$. This is always perpendicular to the plane containing both vectors.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Cross product — magnitude and direction',
        body: '|\\vec{A}\\times\\vec{B}|=|\\vec{A}||\\vec{B}|\\sin\\phi,\\quad\\text{direction: right-hand rule (perpendicular to both)}',
      },
      {
        type: 'warning',
        title: 'Order matters — the cross product is anti-commutative',
        body: '\\vec{A}\\times\\vec{B} = -(\\vec{B}\\times\\vec{A}). \\text{ Swapping the order flips the direction.}',
      },
      {
        type: 'insight',
        title: 'Contrast with the dot product',
        body: '\\vec{A}\\cdot\\vec{B}: \\text{scalar, max when parallel, zero when perpendicular.}\\quad \\vec{A}\\times\\vec{B}: \\text{vector, zero when parallel, max when perpendicular.}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Right-hand rule and the perpendicular result',
        caption: 'Curl fingers from A⃗ toward B⃗. Thumb points in the direction of A⃗ × B⃗ — out of the page here. The magnitude equals the shaded parallelogram area: |A||B|sinφ. When A⃗ and B⃗ are parallel, sinφ = 0 and the cross product vanishes.',
      },
      {
        id: 'CrossProductIntuition',
        title: 'Interactive cross product',
        mathBridge: 'Drag A⃗ and B⃗ in 3D. Watch the perpendicular result vector update with magnitude |A||B|sinφ.',
        caption: 'The result is always perpendicular to both input vectors.',
      },
    ],
  },
  math: {
    prose: [
      'For 3D vectors, the cross product is computed with a $3\\times 3$ determinant. This is the systematic formula that handles all six component-pair products without memorising each one individually.',
      'Expanding the determinant along the first row gives three terms — one for each basis direction:',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Component formula via determinant',
        body:
          '\\vec{A}\\times\\vec{B} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\A_x&A_y&A_z\\\\B_x&B_y&B_z\\end{vmatrix}' +
          '=(A_yB_z-A_zB_y)\\hat{i}-(A_xB_z-A_zB_x)\\hat{j}+(A_xB_y-A_yB_x)\\hat{k}',
      },
      {
        type: 'mnemonic',
        title: 'Basis vector cross products — the cyclic pattern',
        body: '\\hat{i}\\times\\hat{j}=\\hat{k},\\quad\\hat{j}\\times\\hat{k}=\\hat{i},\\quad\\hat{k}\\times\\hat{i}=\\hat{j}.\\text{ Reversing any pair flips the sign.}',
      },
    ],
    visualizations: [
      {
        id: 'CrossProductExplorer',
        title: 'Adjust A⃗ and B⃗ — see components and magnitude',
        mathBridge: 'Watch how each component of the result changes as you rotate the input vectors. Verify the magnitude formula against the determinant calculation.',
        caption: 'The component formula and the magnitude formula always agree.',
      },
    ],
  },
  rigor: {
    prose: [
      'The cross product is formally defined in $\\mathbb{R}^3$ as the unique bilinear, anti-symmetric operation whose result is perpendicular to both inputs and satisfies $|\\vec{A}\\times\\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi$.',
      'The determinant formula is a consequence of linearity and the orthonormal basis relations. The anti-commutativity follows directly from expanding the determinant with rows 2 and 3 swapped.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Anti-commutativity proven',
        body: '\\text{Swap rows 2 and 3 of the determinant: the sign flips.}\\implies \\vec{B}\\times\\vec{A} = -\\vec{A}\\times\\vec{B}.',
      },
    ],
    visualizationId: 'CrossProductIntuition',
    proofSteps: [
      {
        title: 'Define via determinant',
        expression: '\\vec{A} \\times \\vec{B} = \\det\\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ A_x & A_y & A_z \\\\ B_x & B_y & B_z \\end{vmatrix}',
        annotation: 'The 3×3 determinant is the systematic way to compute all six component-pair products without memorising a list.',
      },
      {
        title: 'Magnitude formula',
        expression: '|\\vec{A} \\times \\vec{B}| = |\\vec{A}||\\vec{B}|\\sin\\phi',
        annotation: 'sinφ = 0 when parallel (0° or 180°), maximum when perpendicular (90°). Opposite of the dot product pattern.',
      },
      {
        title: 'Direction: right-hand rule',
        expression: '\\text{Curl }\\vec{A}\\to\\vec{B} \\implies \\text{Thumb points to } \\vec{A} \\times \\vec{B}',
        annotation: 'The cross product is always perpendicular to BOTH input vectors. It cannot have any component along A⃗ or B⃗.',
      },
      {
        title: 'Anti-commutativity',
        expression: '\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})',
        annotation: 'Swapping rows 2 and 3 of the determinant changes the sign. Unlike the dot product, order matters critically here.',
      },
      {
        title: 'Parallel vectors give zero',
        expression: '\\vec{A} \\parallel \\vec{B} \\implies \\vec{A} \\times \\vec{B} = \\vec{0}',
        annotation: 'When A⃗ and B⃗ are parallel, rows 2 and 3 of the determinant are proportional — the determinant is zero.',
      },
    ],
    title: 'Cross product — determinant formula and anti-commutativity',
    visualizations: [{ id: 'CrossProductProof', title: 'Proof steps', mathBridge: 'Each step builds on the previous.' }],
  },
  examples: [
    {
      id: 'ch1-014-ex1',
      title: 'Cross product of two 3D vectors',
      problem: '\\text{Find } \\vec{A}\\times\\vec{B} \\text{ where } \\vec{A}=(2,1,0) \\text{ and } \\vec{B}=(0,3,1).',
      steps: [
        {
          expression: '\\vec{A}\\times\\vec{B} = \\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\2&1&0\\\\0&3&1\\end{vmatrix}',
          annotation: 'Set up the determinant.',
        },
        {
          expression: '=(1\\cdot1-0\\cdot3)\\hat{i}-(2\\cdot1-0\\cdot0)\\hat{j}+(2\\cdot3-1\\cdot0)\\hat{k}',
          annotation: 'Expand along the first row.',
        },
        {
          expression: '=(1)\\hat{i}-(2)\\hat{j}+(6)\\hat{k}=(1,-2,6)',
          annotation: 'Collect terms.',
        },
        {
          expression: '|\\vec{A}\\times\\vec{B}|=\\sqrt{1+4+36}=\\sqrt{41}\\approx6.40',
          annotation: 'Magnitude of the result.',
        },
        {
          expression: '\\text{Check: }(2,1,0)\\cdot(1,-2,6)=2-2+0=0\\;\\checkmark,\\quad(0,3,1)\\cdot(1,-2,6)=0-6+6=0\\;\\checkmark',
          annotation: 'Verify perpendicularity by dotting the result with each input — both dot products must be zero.',
        },
      ],
      conclusion: '$\\vec{A}\\times\\vec{B}=(1,-2,6)$ with magnitude $\\sqrt{41}\\approx6.40$. The result is perpendicular to both inputs.',
    },
    {
      id: 'ch1-014-ex2',
      title: 'Using magnitude formula directly',
      problem: '\\text{Find }|\\vec{A}\\times\\vec{B}|\\text{ if }|\\vec{A}|=5,|\\vec{B}|=8,\\phi=30°.',
      steps: [
        {
          expression: '|\\vec{A}\\times\\vec{B}|=5\\times8\\times\\sin30°=40\\times0.5=20',
          annotation: 'Direct application of the magnitude formula. No determinant needed when only magnitude is required.',
        },
      ],
      conclusion: '|A⃗ × B⃗| = 20. This also equals the area of the parallelogram formed by A⃗ and B⃗.',
    },
  ],
  challenges: [
    {
      id: 'ch1-014-ch1',
      difficulty: 'easy',
      problem: '\\text{Compute }\\hat{i}\\times\\hat{j}.',
      hint: 'Use the cyclic rule: î × ĵ = k̂.',
      walkthrough: [
        { expression: '\\hat{i}\\times\\hat{j}=\\hat{k}', annotation: 'Cyclic: i → j → k → i. Going forward gives +k̂.' },
      ],
      answer: '\\hat{k}',
    },
    {
      id: 'ch1-014-ch2',
      difficulty: 'medium',
      problem: '\\text{Find }\\vec{A}\\times\\vec{B}\\text{ for }\\vec{A}=(1,0,0)\\text{ and }\\vec{B}=(0,1,0).',
      hint: 'Set up the 3×3 determinant.',
      walkthrough: [
        { expression: '\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\1&0&0\\\\0&1&0\\end{vmatrix}=(0-0)\\hat{i}-(0-0)\\hat{j}+(1-0)\\hat{k}=\\hat{k}', annotation: 'Direct calculation — confirms î × ĵ = k̂.' },
      ],
      answer: '\\hat{k}',
    },
    {
      id: 'ch1-014-ch3',
      difficulty: 'hard',
      problem: '\\text{Prove that }\\vec{A}\\times\\vec{A}=\\vec{0}\\text{ for any vector }\\vec{A}.',
      hint: 'Use the anti-commutativity property.',
      walkthrough: [
        { expression: '\\vec{A}\\times\\vec{A}=-(\\vec{A}\\times\\vec{A})\\implies 2(\\vec{A}\\times\\vec{A})=\\vec{0}\\implies\\vec{A}\\times\\vec{A}=\\vec{0}', annotation: 'Anti-commutativity says A × A = −(A × A). The only vector equal to its own negative is the zero vector.' },
      ],
      answer: '\\vec{A}\\times\\vec{A}=\\vec{0}\\text{ because anti-commutativity forces it to equal its own negative.}',
    },
  ],
}
