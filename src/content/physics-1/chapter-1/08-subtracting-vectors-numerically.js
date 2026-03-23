export default {
  id: 'ch1-008',
  slug: 'subtracting-vectors-numerically',
  chapter: 1,
  order: 8,
  title: 'Subtracting Vectors Numerically',
  subtitle: 'Negate, decompose, sum — the DSMD method applied to differences.',
  tags: ['vector subtraction', 'numerical', 'components', 'DSMD', 'change in velocity'],
  aliases: 'subtract numerically component method delta v difference',

  hook: {
    question: 'Force A⃗ = 60 N at 20° and force B⃗ = 45 N at 110°. What is A⃗ − B⃗ exactly?',
    realWorldContext:
      'Relative velocity, net force, change in momentum — all are vector differences. ' +
      'The graphical method gives a rough answer. ' +
      'The numerical method gives the exact one. ' +
      'DSMD with negation handles every case.',
    previewVisualizationId: 'NumericalSubtractionWalkthrough',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (10 of 21) Subtracting Vectors Numerically',
      embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/xqM1ffVmSDA" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'The numerical method for subtraction is identical to addition with one extra step: **negate B⃗ before you start**.',
      'Negating a vector in component form is trivial: flip the sign of every component. ' +
        '$-\\vec{B} = (-B_x, -B_y)$. ' +
        'Then apply DSMD exactly as for addition.',
      'The five-step recipe: ' +
        '(0) Compute $-\\vec{B} = (-B_x, -B_y)$. ' +
        '(1) Decompose $\\vec{A}$ and $-\\vec{B}$. ' +
        '(2) Sum: $R_x = A_x + (-B_x)$, $R_y = A_y + (-B_y)$. ' +
        '(3) Magnitude: $|\\vec{R}| = \\sqrt{R_x^2+R_y^2}$. ' +
        '(4) Direction: $\\theta = \\text{atan2}(R_y, R_x)$.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Numerical subtraction recipe',
        body: '\\vec{A}-\\vec{B} = \\vec{A}+(-\\vec{B}). ' +
              '\\text{Step 0: negate }\\vec{B}.\\text{ Steps 1–4: DSMD as usual.}',
      },
      {
        type: 'insight',
        title: 'In the component table, just flip signs',
        body: 'Replace every $B_x$ with $-B_x$ and $B_y$ with $-B_y$ in the table. ' +
              'Everything else is identical to the addition procedure.',
      },
    ],
    visualizations: [
      {
        id: 'NumericalSubtractionWalkthrough',
        title: 'Step 0 through Step 4 — live calculation',
        mathBridge: 'Click through each step. Step 0 flips B⃗ in the diagram and negates its components in the table.',
        caption: 'Subtraction = negation + addition. Two operations, not one.',
        props: { showSteps: true },
      },
    ],
  },

  math: {
    prose: [
      'The component table for subtraction has one modified row: $-\\vec{B}$ instead of $\\vec{B}$. ' +
        'Everything else is the same structure as the addition table.',
      'A powerful identity: $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi$ ' +
        'where $\\phi$ is the angle **between** $\\vec{A}$ and $\\vec{B}$. ' +
        'This is the law of cosines applied to the triangle formed by $\\vec{A}$, $\\vec{B}$, and $\\vec{A}-\\vec{B}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Magnitude of difference (law of cosines)',
        body: '|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi',
      },
      {
        type: 'insight',
        title: 'Compare addition and subtraction magnitudes',
        body: '|\\vec{A}+\\vec{B}|^2 = |A|^2+|B|^2+2|A||B|\\cos\\phi \\text{ vs } ' +
              '|\\vec{A}-\\vec{B}|^2 = |A|^2+|B|^2-2|A||B|\\cos\\phi. ' +
              'The only change is the sign on $2|A||B|\\cos\\phi$.',
      },
    ],
    visualizations: [
      {
        id: 'SubtractionComponentTable',
        title: 'Editable component table — toggle between A⃗+B⃗ and A⃗−B⃗',
        mathBridge: 'Toggle the mode switch. Watch the B row sign change and the resultant update.',
        caption: 'The only difference between addition and subtraction is the sign on Bₓ and Bᵧ.',
        props: { allowToggle: true },
      },
    ],
  },

  rigor: {
    prose: [
      'Since $\\vec{A}-\\vec{B} = \\vec{A}+(-\\vec{B})$ and we have already proved vector addition is commutative ' +
        'and associative, subtraction inherits all the same computational properties. ' +
        'Note, however, that subtraction is neither commutative nor associative in general: ' +
        '$\\vec{A}-\\vec{B} \\ne \\vec{B}-\\vec{A}$ and $(\\vec{A}-\\vec{B})-\\vec{C} \\ne \\vec{A}-(\\vec{B}-\\vec{C})$.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Subtraction is not commutative',
        body: '\\vec{A}-\\vec{B} = -(\\vec{B}-\\vec{A}). \\text{ The two results are antiparallel.}',
      },
      {
        type: 'warning',
        title: 'Subtraction is not associative',
        body: '(\\vec{A}-\\vec{B})-\\vec{C} = \\vec{A}-\\vec{B}-\\vec{C} \\ne \\vec{A}-(\\vec{B}-\\vec{C}) = \\vec{A}-\\vec{B}+\\vec{C}',
      },
    ],
    visualizationId: 'SubtractionNumericalProof',
    proofSteps: [
      {
        title: "Component subtraction",
        expression: "\\vec{A} - \\vec{B} = (A_x - B_x, A_y - B_y)",
        annotation: "This is the fundamental definition. We'll use it to derive the Law of Cosines for vectors.",
      },
      {
        title: "Square the magnitude",
        expression: "|\\vec{A} - \\vec{B}|^2 = (A_x - B_x)^2 + (A_y - B_y)^2",
        annotation: "Squaring the magnitude is applying the Pythagorean theorem to the resultant components.",
      },
      {
        title: "Expand and regroup",
        expression: "= (A_x^2 + A_y^2) + (B_x^2 + B_y^2) - 2(A_xB_x + A_yB_y)",
        annotation: "Expand the squares and collect terms. We recognize the squared magnitudes of A and B.",
      },
      {
        title: "Recognize the dot product",
        expression: "= |\\vec{A}|^2 + |\\vec{B}|^2 - 2(\\vec{A} \\cdot \\vec{B})",
        annotation: "The sum of component products is the definition of the dot product.",
      },
      {
        title: "Law of Cosines",
        expression: "= |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi",
        annotation: "Substituting the geometric dot product gives the final Law of Cosines for vector differences.",
      },
    ],
    title: 'Derivation: law of cosines for |A⃗ − B⃗|',
    visualizations: [
      {
        id: 'SubtractionNumericalProof',
        title: 'Each proof step highlights the triangle element it describes',
        mathBridge: 'The triangle formed by A⃗, B⃗, and A⃗−B⃗ has sides |A⃗|, |B⃗|, and |A⃗−B⃗|. Step 5 connects to the law of cosines.',
        caption: 'The law of cosines is just the Pythagorean theorem generalised to non-right triangles.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-008-ex1',
      title: 'Numerical: A⃗ − B⃗ with non-trivial angles',
      problem: '\\vec{A}=60\\,N\\text{ at }20°,\\;\\vec{B}=45\\,N\\text{ at }110°.\\text{ Find }\\vec{A}-\\vec{B}.',
      steps: [
        { expression: 'A_x=60\\cos20°=56.38,\\;A_y=60\\sin20°=20.52', annotation: 'Decompose A⃗.' },
        { expression: 'B_x=45\\cos110°=-15.39,\\;B_y=45\\sin110°=42.29', annotation: 'Decompose B⃗. cos110° is negative (Q II).' },
        { expression: '-B_x=15.39,\\;-B_y=-42.29', annotation: 'Negate B⃗ components (Step 0).' },
        { expression: 'R_x=56.38+15.39=71.77\\,N,\\;R_y=20.52+(-42.29)=-21.77\\,N', annotation: 'Sum: A⃗ + (−B⃗).' },
        { expression: '|\\vec{R}|=\\sqrt{71.77^2+21.77^2}=\\sqrt{5151.0+473.9}=\\sqrt{5624.9}\\approx74.99\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(-21.77/71.77)\\approx-16.9°\\text{ (Quadrant IV)}', annotation: 'Rₓ>0, Rᵧ<0 → Q IV. atan2 gives −16.9°.' },
      ],
      conclusion: '$\\vec{A}-\\vec{B} \\approx 75.0\\,N$ at $-16.9°$ (16.9° below the x-axis).',
    },
    {
      id: 'ch1-008-ex2',
      title: 'Relative velocity',
      problem: '\\text{Car A travels at }\\vec{v}_A=25\\,\\text{m/s east. Car B travels at }\\vec{v}_B=20\\,\\text{m/s at }30°. ' +
               '\\text{Find the velocity of A relative to B: }\\vec{v}_{A\\text{ rel }B}=\\vec{v}_A-\\vec{v}_B.',
      steps: [
        { expression: 'v_{Ax}=25,\\;v_{Ay}=0', annotation: 'A moves east.' },
        { expression: 'v_{Bx}=20\\cos30°=17.32,\\;v_{By}=20\\sin30°=10.00', annotation: 'Decompose B.' },
        { expression: 'R_x=25-17.32=7.68,\\;R_y=0-10.00=-10.00', annotation: 'Subtract component-wise.' },
        { expression: '|\\vec{v}_{A\\text{ rel }B}|=\\sqrt{7.68^2+10^2}=\\sqrt{59.0+100}=\\sqrt{159}\\approx12.6\\,\\text{m/s}', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(-10/7.68)\\approx-52.5°', annotation: 'Q IV (east component positive, south component negative).' },
      ],
      conclusion: 'From B\'s perspective, A appears to move at 12.6 m/s at 52.5° below the x-axis (southeast).',
    },
  ],

  challenges: [
    {
      id: 'ch1-008-ch1',
      difficulty: 'easy',
      problem: '\\vec{A}=(8,6),\\;\\vec{B}=(3,-2).\\text{ Find }|\\vec{A}-\\vec{B}|.',
      hint: 'Subtract components first, then find magnitude.',
      walkthrough: [
        { expression: '\\vec{A}-\\vec{B}=(8-3,\\;6-(-2))=(5,8)', annotation: 'Component subtraction.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{25+64}=\\sqrt{89}\\approx9.43', annotation: 'Magnitude.' },
      ],
      answer: '|\\vec{A}-\\vec{B}|=\\sqrt{89}\\approx9.43',
    },
    {
      id: 'ch1-008-ch2',
      difficulty: 'medium',
      problem: '\\text{Using the law of cosines formula, find }|\\vec{A}-\\vec{B}|\\text{ where }|\\vec{A}|=10,\\;|\\vec{B}|=8,\\;\\phi=60°.',
      hint: '$|A-B|^2 = |A|^2 + |B|^2 - 2|A||B|\\cos\\phi$',
      walkthrough: [
        { expression: '|\\vec{A}-\\vec{B}|^2=100+64-2(10)(8)(0.5)=164-80=84', annotation: '$\\cos60°=0.5$.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{84}=2\\sqrt{21}\\approx9.17', annotation: 'Take the square root.' },
      ],
      answer: '|\\vec{A}-\\vec{B}|=2\\sqrt{21}\\approx9.17',
    },
  ],
}
