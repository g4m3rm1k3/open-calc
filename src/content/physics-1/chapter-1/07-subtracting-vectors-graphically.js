export default {
  id: 'p1-ch1-007',
  slug: 'subtracting-vectors-graphically',
  chapter: 1,
  order: 7,
  title: 'Subtracting Vectors Graphically',
  subtitle: 'A − B is just A + (−B). Flip the arrow, then add.',
  tags: ['vector subtraction', 'negative vector', 'graphical method', 'difference vector'],
  aliases: 'subtract vectors flip negate difference graphical',

  hook: {
    question: 'A ball moves from velocity 4 m/s east to 3 m/s north. What is the change in velocity — and why is it not simply 1 m/s?',
    realWorldContext:
      'Acceleration is defined as change in velocity: $\\vec{a} = \\Delta\\vec{v}/\\Delta t = (\\vec{v}_f - \\vec{v}_i)/\\Delta t$. ' +
      'Every acceleration, every force diagram, every relative velocity problem uses vector subtraction. ' +
      'Getting the direction of $\\vec{A} - \\vec{B}$ wrong is one of the most common physics errors.',
    previewVisualizationId: 'SubtractionIntuition',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (9 of 21) Subtracting Vectors Graphically',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'Subtraction is not a new operation — it is addition in disguise. ' +
        '$\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})$. ' +
        'The negative of a vector $-\\vec{B}$ has the **same magnitude** as $\\vec{B}$ but points in the **opposite direction**. ' +
        'Graphically, you flip the arrow 180°.',
      'The two-step recipe: (1) draw $-\\vec{B}$ by reversing $\\vec{B}$; (2) add $\\vec{A}$ and $-\\vec{B}$ using any graphical method.',
      'There is a useful shortcut: if $\\vec{A}$ and $\\vec{B}$ share a common tail, ' +
        'then $\\vec{A} - \\vec{B}$ is the arrow **from the tip of $\\vec{B}$ to the tip of $\\vec{A}$**. ' +
        'This is the "tail-to-tail shortcut" and it is especially useful for finding $\\Delta\\vec{v}$ in kinematics.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Negative vector',
        body: '-\\vec{B}\\text{ has magnitude }|\\vec{B}|\\text{ and direction opposite to }\\vec{B}. ' +
              'In component form: }-\\vec{B} = (-B_x,\\,-B_y).',
      },
      {
        type: 'definition',
        title: 'Vector subtraction',
        body: '\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B}).',
      },
      {
        type: 'insight',
        title: 'Tail-to-tail shortcut',
        body: 'Place $\\vec{A}$ and $\\vec{B}$ with tails at the same point. ' +
              'Then $\\vec{A} - \\vec{B}$ is the arrow from the **tip of $\\vec{B}$** to the **tip of $\\vec{A}$**.',
      },
      {
        type: 'warning',
        title: '$\\vec{A} - \\vec{B} \\ne \\vec{B} - \\vec{A}$',
        body: 'Subtraction is not commutative. $\\vec{B} - \\vec{A}$ points in exactly the opposite direction from $\\vec{A} - \\vec{B}$.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Subtraction is addition in disguise',
        caption: 'A⃗ − B⃗ = A⃗ + (−B⃗). Step 1: flip B⃗ to get −B⃗ (same length, opposite direction). Step 2: chain A⃗ and −B⃗ tip-to-tail. The closing arrow is A⃗ − B⃗. Components: (A−B)ₓ = Aₓ − Bₓ, (A−B)y = Ay − By.',
      },
      {
        id: 'SubtractionIntuition',
        title: 'Drag A⃗ and B⃗ — see −B⃗, and the two subtraction methods side by side',
        mathBridge: 'Left: flip-and-add method. Right: tail-to-tail shortcut. Both give the same A⃗ − B⃗.',
        caption: 'Two methods, one answer. Choose whichever is faster for the situation.',
        props: { showBothMethods: true },
      },
    ],
  },

  math: {
    prose: [
      'The change in velocity $\\Delta\\vec{v}$ is the most important application of vector subtraction. ' +
        'If an object moves from velocity $\\vec{v}_i$ to $\\vec{v}_f$, then:',
      'The magnitude $|\\Delta\\vec{v}|$ is **not** $|\\vec{v}_f| - |\\vec{v}_i|$ (scalar difference). ' +
        'It is the magnitude of the vector difference, computed with the Pythagorean theorem or law of cosines. ' +
        'This distinction is the source of countless errors in kinematics problems.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Change in velocity',
        body: '\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i = \\vec{v}_f + (-\\vec{v}_i)',
      },
      {
        type: 'warning',
        title: '|Δv⃗| ≠ |v⃗_f| − |v⃗_i|',
        body: 'The magnitude of the velocity change is not the scalar difference of the speeds. ' +
              'Example: 3 m/s north minus 4 m/s east is not 1 m/s — it is 5 m/s at 143°.',
      },
    ],
    visualizations: [
      {
        id: 'SubtractionDeltaV',
        title: 'Change in velocity: v⃗_f − v⃗_i visualised',
        mathBridge: 'Set initial and final velocity vectors. The Δv⃗ arrow shows direction and magnitude of the change.',
        caption: 'Δv⃗ points from v⃗_i tip to v⃗_f tip (tail-to-tail shortcut).',
        props: { labelMode: 'deltaV' },
      },
    ],
  },

  rigor: {
    prose: [
      'Formally, $-\\vec{B}$ is the additive inverse of $\\vec{B}$ in the vector space $\\mathbb{R}^n$: ' +
        'it is the unique vector such that $\\vec{B} + (-\\vec{B}) = \\vec{0}$. ' +
        'The existence of additive inverses is one of the eight axioms defining a vector space.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Additive inverse',
        body: '-\\vec{B} \\text{ is defined by } \\vec{B} + (-\\vec{B}) = \\vec{0}. ' +
              '\\text{ In components: } -(B_x, B_y) = (-B_x, -B_y).',
      },
      {
        type: 'insight',
        title: 'Why flip gives the inverse',
        body: 'Adding $\\vec{B}$ and $-\\vec{B}$ produces a zero resultant: ' +
              '$B_x + (-B_x) = 0$ and $B_y + (-B_y) = 0$. ' +
              'Geometrically: the two equal-length, opposite arrows cancel exactly.',
      },
    ],
    visualizationId: 'SubtractionProof',
    proofSteps: [
      {
        title: "Define subtraction",
        expression: "\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})",
        annotation: "Subtraction is not a new operation. It's addition of the additive inverse. Everything we know about addition applies.",
      },
      {
        title: "Negate B⃗ component-wise",
        expression: "-\\vec{B} = (-B_x, -B_y)",
        annotation: "Flipping all signs gives a vector of the same length pointing in the opposite direction.",
      },
      {
        title: "Apply component addition",
        expression: "\\vec{A} + (-\\vec{B}) = (A_x+(-B_x), A_y+(-B_y))",
        annotation: "Component-wise. This is the definition of addition, applied to A and -B.",
      },
      {
        title: "Simplify",
        expression: "= (A_x-B_x, A_y-B_y)",
        annotation: "Vector subtraction reduces to scalar subtraction on each component axis. Clean and exact.",
      },
      {
        title: "Tail-to-tail geometric shortcut",
        expression: "\\text{Place tails at } \\mathbf{0} \\implies \\vec{A}-\\vec{B} \\text{ goes from } \\text{tip}(B) \\text{ to } \\text{tip}(A)",
        annotation: "The geometric shortcut follows directly: the arrow from tip of B to tip of A has exactly the components $(A_x-B_x, A_y-B_y)$.",
      },
    ],
    title: 'Proof: subtraction by component and by the tail-to-tail shortcut',
    visualizations: [
      {
        id: 'SubtractionProof',
        title: 'Each proof step animates on the diagram',
        mathBridge: 'Watch −B⃗ appear (step 2), then the chain form (step 3), then collapse to the shortcut (step 5).',
        caption: 'Both methods are the same vector — step 5 makes that explicit.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-007-ex1',
      title: 'Graphical: A⃗ − B⃗ by flip-and-add',
      problem: '\\vec{A} = 5\\,\\text{cm east},\\;\\vec{B} = 3\\,\\text{cm north. Find }\\vec{A}-\\vec{B}\\text{ graphically.}',
      steps: [
        { expression: '-\\vec{B} = 3\\,\\text{cm south}', annotation: 'Flip B⃗ → −B⃗ points south.' },
        { expression: '\\text{Chain: } \\vec{A}\\text{ then }-\\vec{B} \\Rightarrow \\text{resultant from start to end}', annotation: 'Tip-to-toe of A⃗ and −B⃗.' },
        { expression: '|\\vec{A}-\\vec{B}| = \\sqrt{5^2+3^2} = \\sqrt{34} \\approx 5.83\\,\\text{cm}', annotation: 'Magnitude by Pythagoras (perpendicular components).' },
        { expression: '\\theta = \\arctan(-3/5) \\approx -31°\\text{ (i.e. 31° south of east)}', annotation: 'Direction: east component 5, south component 3.' },
      ],
      conclusion: '$\\vec{A}-\\vec{B} \\approx 5.83$ cm at 31° south of east.',
    },
    {
      id: 'ch1-007-ex2',
      title: 'Change in velocity',
      problem: '\\text{A car changes velocity from }\\vec{v}_i=30\\,\\text{m/s east to }\\vec{v}_f=40\\,\\text{m/s north. Find }\\Delta\\vec{v}.',
      steps: [
        { expression: '-\\vec{v}_i = 30\\,\\text{m/s west}', annotation: 'Negate the initial velocity.' },
        { expression: '\\Delta\\vec{v} = \\vec{v}_f + (-\\vec{v}_i) = 40\\,\\text{m/s north} + 30\\,\\text{m/s west}', annotation: 'Add tip-to-toe.' },
        { expression: '|\\Delta\\vec{v}| = \\sqrt{40^2+30^2} = 50\\,\\text{m/s}', annotation: '3-4-5 triple scaled by 10.' },
        { expression: '\\theta = 180° - \\arctan(40/30) \\approx 180°-53.1° = 126.9°', annotation: 'West component negative → Quadrant II. Angle from +x axis (east).' },
      ],
      conclusion: '$|\\Delta\\vec{v}| = 50$ m/s at $\\approx 127°$ (northwest direction). The speed change was $|40-30|=10$ m/s — but the velocity change was 50 m/s. Very different.',
    },
  ],

  challenges: [
    {
      id: 'ch1-007-ch1',
      difficulty: 'easy',
      problem: '\\vec{A}=(5,2),\\;\\vec{B}=(2,5).\\text{ Find }\\vec{A}-\\vec{B}\\text{ and }\\vec{B}-\\vec{A}.\\text{ What is the relationship?}',
      hint: 'Subtract component-wise. Compare the two results.',
      walkthrough: [
        { expression: '\\vec{A}-\\vec{B}=(5-2,\\;2-5)=(3,-3)', annotation: 'Component subtraction.' },
        { expression: '\\vec{B}-\\vec{A}=(2-5,\\;5-2)=(-3,3)', annotation: 'Swap order.' },
        { expression: '\\vec{B}-\\vec{A} = -(\\vec{A}-\\vec{B})', annotation: 'The two results are negatives of each other — same magnitude, opposite direction.' },
      ],
      answer: '\\vec{A}-\\vec{B}=(3,-3),\\;\\vec{B}-\\vec{A}=(-3,3).\\text{ They are antiparallel.}',
    },
    {
      id: 'ch1-007-ch2',
      difficulty: 'medium',
      problem: '\\text{A projectile has }\\vec{v}_i=20\\,\\text{m/s at }60°\\text{ and }\\vec{v}_f=20\\,\\text{m/s at }120°.\\text{ Find }|\\Delta\\vec{v}|.',
      hint: 'Both speeds are equal (20 m/s). Decompose each, subtract, find magnitude.',
      walkthrough: [
        { expression: 'v_{ix}=20\\cos60°=10,\\;v_{iy}=20\\sin60°=10\\sqrt{3}', annotation: 'Decompose v⃗_i.' },
        { expression: 'v_{fx}=20\\cos120°=-10,\\;v_{fy}=20\\sin120°=10\\sqrt{3}', annotation: 'Decompose v⃗_f.' },
        { expression: '\\Delta v_x=-10-10=-20,\\;\\Delta v_y=10\\sqrt{3}-10\\sqrt{3}=0', annotation: 'Subtract components.' },
        { expression: '|\\Delta\\vec{v}|=\\sqrt{(-20)^2+0^2}=20\\,\\text{m/s west}', annotation: 'Pure horizontal change — the y-components cancelled.' },
      ],
      answer: '|\\Delta\\vec{v}|=20\\,\\text{m/s, directed west (180°).}',
    },
  ],
}
