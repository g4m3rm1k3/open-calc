export default {
  id: 'p1-ch1-005',
  slug: 'adding-vectors-graphically-tip-to-toe',
  chapter: 1,
  order: 5,
  title: 'Adding Vectors Graphically — Tip-to-Toe Method',
  subtitle: 'Chain arrows end-to-end; the shortcut from start to finish is the sum.',
  tags: ['vector addition', 'tip-to-toe', 'head-to-tail', 'triangle method', 'polygon method'],
  aliases: 'head to tail triangle rule polygon chain of vectors',

  hook: {
    question: 'You walk 3 km east, then 4 km north, then 2 km at 30°. What single displacement takes you from start to finish?',
    realWorldContext:
      'Navigation, animation rigs, robot arm kinematics — any time you chain a sequence of moves, ' +
      'you need the tip-to-toe method. ' +
      'It scales to any number of vectors, unlike the parallelogram which only handles two at a time.',
    previewVisualizationId: 'TipToToeIntuition',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (6 of 21) Adding Vectors Graphically — Tip-to-Toe Method',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'The **tip-to-toe** (head-to-tail) method: place the tail of $\\vec{B}$ at the tip of $\\vec{A}$. ' +
        'The resultant $\\vec{R}$ is the arrow from the tail of $\\vec{A}$ to the tip of $\\vec{B}$. ' +
        'It is the "shortcut" that replaces the whole journey.',
      'The method generalises immediately to any number of vectors: ' +
        '$\\vec{R} = \\vec{A} + \\vec{B} + \\vec{C} + \\cdots$ — chain them in sequence and draw the closing arrow. ' +
        'The order does not matter: the closing arrow is the same regardless of the sequence you chain them in.',
      'The key difference from the parallelogram method: ' +
        'vectors are placed **tip-to-tail** (not tail-to-tail). ' +
        'You lose the visual symmetry of the parallelogram but gain the ability to add three or more vectors at once.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Tip-to-toe rule',
        body:
          'Place vectors in a chain, each tail touching the previous tip. ' +
          'The resultant goes from the first tail to the last tip.',
      },
      {
        type: 'insight',
        title: 'Order independence',
        body:
          '$\\vec{A}+\\vec{B}+\\vec{C} = \\vec{B}+\\vec{A}+\\vec{C} = \\vec{C}+\\vec{A}+\\vec{B}$. ' +
          'Rearranging the chain changes the path but not the endpoint.',
      },
      {
        type: 'warning',
        title: 'Tip-to-toe ≠ tail-to-tail',
        body:
          'In the parallelogram method, tails are shared. In tip-to-toe, each tail connects to the previous tip. ' +
          'Mixing these up is the most common graphical error.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Chain arrows end-to-end',
        caption: 'Place the tail of B⃗ at the tip of A⃗, then the tail of C⃗ at the tip of B⃗. The shortcut from first tail to last tip is R⃗. The path shape changes with order; the endpoint never does.',
      },
      {
        id: 'TipToToeIntuition',
        title: 'Chain up to 4 vectors — drag, reorder, watch the resultant close the loop',
        mathBridge: 'The closing arrow from first tail to last tip is R⃗. Reorder the chain and it stays the same.',
        caption: 'The resultant is the shortcut. The path doesn\'t matter, only where you end up.',
        props: { maxVectors: 4 },
      },
    ],
  },

  math: {
    prose: [
      'For $n$ vectors, the resultant is found by summing each set of components independently:',
      'This is why component methods (Lesson 6) are the practical tool: ' +
        'the graphical method gives insight, but arithmetic gives precision.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sum of n vectors',
        body:
          '\\vec{R} = \\sum_{k=1}^{n} \\vec{v}_k \\implies ' +
          'R_x = \\sum_{k=1}^n v_{kx},\\quad R_y = \\sum_{k=1}^n v_{ky}',
      },
      {
        type: 'insight',
        title: 'Closing the polygon',
        body:
          'If $\\vec{R} = \\vec{0}$, the tip of the last vector lands exactly on the tail of the first. ' +
          'The vectors form a closed polygon — this is the condition for static equilibrium.',
      },
    ],
    visualizations: [
      {
        id: 'TipToToeOrderProof',
        title: 'Reorder the same vectors — same resultant every time',
        mathBridge: 'Click to shuffle the chain order. $R_x$ and $R_y$ are unchanged because addition is commutative and associative.',
        caption: 'The algebra guarantees commutativity. The viz makes it viscerally obvious.',
        props: { showComponentSums: true },
      },
    ],
  },

  rigor: {
    prose: [
      'Vector addition is both **commutative** ($\\vec{A}+\\vec{B}=\\vec{B}+\\vec{A}$) ' +
        'and **associative** ($(\\vec{A}+\\vec{B})+\\vec{C}=\\vec{A}+(\\vec{B}+\\vec{C})$). ' +
        'Together these two properties mean the order and grouping of a chain of vectors is irrelevant.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Commutativity of vector addition',
        body: '\\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}',
      },
      {
        type: 'theorem',
        title: 'Associativity of vector addition',
        body: '(\\vec{A}+\\vec{B})+\\vec{C} = \\vec{A}+(\\vec{B}+\\vec{C})',
      },
    ],
    visualizationId: 'TipToToeProof',
    proofSteps: [
      {
        expression: '\\vec{A} + \\vec{B} = (A_x+B_x,\\;A_y+B_y)',
        annotation: 'Component addition is the fundamental definition. We will show that swapping the order results in the same vector.',
      },
      {
        expression: '\\vec{B} + \\vec{A} = (B_x+A_x,\\;B_y+A_y)',
        annotation: 'Applying the same definition with A and B exchanged. The chain on the right diagram follows the B then A path.',
      },
      {
        expression: 'A_x+B_x = B_x+A_x \\quad \\text{and} \\quad A_y+B_y = B_y+A_y',
        annotation: 'Ordinary real-number addition is commutative. Each component satisfy this property independently.',
      },
      {
        expression: '\\therefore \\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}',
        annotation: 'Vector addition is commutative because it reduces to adding real numbers component-by-component, which is itself commutative. Both paths end at the same point.',
      },
    ],
    title: 'Proof: vector addition is commutative',
    visualizations: [
      {
        id: 'TipToToeProof',
        title: 'Commutativity — two chains, same endpoint',
        mathBridge: 'Left chain: A⃗ then B⃗. Right chain: B⃗ then A⃗. Both arrive at the same point.',
        caption: 'The proof is visible: both paths share one endpoint.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-005-ex1',
      title: 'Three-vector chain',
      problem:
        '\\text{Displacements: } \\vec{A}=3\\,\\text{km east},\\; \\vec{B}=4\\,\\text{km north},\\; \\vec{C}=2\\,\\text{km at }30°. ' +
        '\\text{Find the resultant.}',
      steps: [
        { expression: 'A_x=3,\\;A_y=0', annotation: 'East → positive x.' },
        { expression: 'B_x=0,\\;B_y=4', annotation: 'North → positive y.' },
        { expression: 'C_x=2\\cos30°=\\sqrt{3}\\approx1.73,\\;C_y=2\\sin30°=1.00', annotation: 'Decompose the angled vector.' },
        { expression: 'R_x=3+0+1.73=4.73\\,\\text{km},\\;R_y=0+4+1.00=5.00\\,\\text{km}', annotation: 'Sum components.' },
        { expression: '|\\vec{R}|=\\sqrt{4.73^2+5.00^2}=\\sqrt{22.37+25.00}=\\sqrt{47.37}\\approx6.88\\,\\text{km}', annotation: 'Resultant magnitude.' },
        { expression: '\\theta=\\arctan(5.00/4.73)\\approx46.6°\\text{ north of east}', annotation: 'Direction from +x axis.' },
      ],
      conclusion: 'The resultant displacement is $\\approx 6.88$ km at $46.6°$ north of east, regardless of the order you walk the three legs.',
    },
    {
      id: 'ch1-005-ex2',
      title: 'Zero resultant — closed polygon',
      problem:
        '\\text{Vectors } \\vec{A}=(3,0),\\;\\vec{B}=(0,4),\\;\\vec{C}=(-3,-4). \\text{ Show that } \\vec{A}+\\vec{B}+\\vec{C}=\\vec{0}.',
      steps: [
        { expression: 'R_x = 3+0+(-3) = 0', annotation: 'x-components sum to zero.' },
        { expression: 'R_y = 0+4+(-4) = 0', annotation: 'y-components sum to zero.' },
        { expression: '\\vec{R}=(0,0)=\\vec{0}\\;\\checkmark', annotation: 'The three vectors form a closed triangle — the tip of C⃗ returns exactly to the tail of A⃗.' },
      ],
      conclusion: 'When vectors form a closed polygon, their sum is zero. This is the graphical condition for equilibrium.',
    },
  ],

  challenges: [
    {
      id: 'ch1-005-ch1',
      difficulty: 'easy',
      problem: '\\text{A robot moves: 5 m east, then 5 m north, then 5 m west. What is the resultant displacement?}',
      hint: 'Sum the x-components and y-components separately.',
      walkthrough: [
        { expression: 'R_x = 5 + 0 + (-5) = 0\\,\\text{m}', annotation: 'East and west cancel.' },
        { expression: 'R_y = 0 + 5 + 0 = 5\\,\\text{m}', annotation: 'Only the north leg contributes vertically.' },
        { expression: '|\\vec{R}| = 5\\,\\text{m north}', annotation: 'The three-step journey is equivalent to a single 5 m step north.' },
      ],
      answer: '\\vec{R} = 5\\,\\text{m north}',
    },
    {
      id: 'ch1-005-ch2',
      difficulty: 'medium',
      problem: '\\text{Four forces act on a pin: 10 N east, 8 N at 90°, 6 N at 180°, 4 N at 270°. Find } \\vec{R}.',
      hint: '90° = north, 180° = west, 270° = south.',
      walkthrough: [
        { expression: 'R_x = 10+0+(-6)+0 = 4\\,N', annotation: 'East=+x, west=−x.' },
        { expression: 'R_y = 0+8+0+(-4) = 4\\,N', annotation: 'North=+y, south=−y.' },
        { expression: '|\\vec{R}|=\\sqrt{16+16}=4\\sqrt{2}\\approx5.66\\,N\\text{ at }45°', annotation: 'Equal x and y → 45°.' },
      ],
      answer: '|\\vec{R}| = 4\\sqrt{2}\\,N\\text{ at }45°\\text{ (NE)}',
    },
  ],
}
