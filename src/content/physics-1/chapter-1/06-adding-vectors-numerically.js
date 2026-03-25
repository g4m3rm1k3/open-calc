export default {
  id: 'p1-ch1-006',
  slug: 'adding-vectors-numerically',
  chapter: 1,
  order: 6,
  title: 'Adding Vectors Numerically',
  subtitle: 'The four-step method that works for any vectors, every time.',
  tags: ['vector addition', 'numerical method', 'components', 'resultant', 'systematic method'],
  aliases: 'component method vector sum adding analytically calculation',

  hook: {
    question: 'Two forces: 40 N at 30° and 25 N at 145°. Graphical methods give only an estimate. How do you get the exact answer?',
    realWorldContext:
      'Every real engineering calculation — bridge loads, satellite trajectories, robot forces — ' +
      'requires exact vector addition. ' +
      'The numerical (component) method is the workhorse: decompose, sum, reconstruct. Four steps, always works.',
    previewVisualizationId: 'NumericalAdditionWalkthrough',
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (7 of 21) Adding Vectors Numerically: Example 1',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (8 of 21) Adding Vectors Numerically: Example 2',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'examples',
    },
  ],

  intuition: {
    prose: [
      'The graphical method shows you *what* the answer looks like. The numerical method tells you *exactly* what it is.',
      'The four-step recipe never fails:',
      '**Step 1 — Decompose** each vector into $x$- and $y$-components. ' +
        '**Step 2 — Sum** all $x$-components; sum all $y$-components. ' +
        '**Step 3 — Magnitude**: $|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}$. ' +
        '**Step 4 — Direction**: $\\theta = \\text{atan2}(R_y, R_x)$, then check the quadrant.',
      'The method works because addition is done component-by-component, and components are just numbers — ordinary arithmetic applies.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The four-step method',
        body:
          '1.\\;v_{kx}=|\\vec{v}_k|\\cos\\theta_k,\\;v_{ky}=|\\vec{v}_k|\\sin\\theta_k\\quad' +
          '2.\\;R_x=\\sum v_{kx},\\;R_y=\\sum v_{ky}\\quad' +
          '3.\\;|\\vec{R}|=\\sqrt{R_x^2+R_y^2}\\quad' +
          '4.\\;\\theta=\\operatorname{atan2}(R_y,R_x)',
      },
      {
        type: 'warning',
        title: 'Check the quadrant every time',
        body:
          'atan2 returns the correct quadrant automatically. Plain arctan does not — ' +
          'it only covers $(-90°, 90°)$. ' +
          'If $R_x < 0$, add $180°$ to the plain arctan result.',
      },
    ],
    visualizations: [
      {
        id: 'NumericalAdditionWalkthrough',
        title: 'Step through the four stages for two live vectors',
        mathBridge: 'Each stage of the four-step method is highlighted in sequence. Drag the vectors to see the steps update.',
        caption: 'Decompose → sum → magnitude → direction. Four steps, exact answer.',
        props: { showStepHighlight: true },
      },
    ],
  },

  math: {
    prose: [
      'The component table is the practical organiser for multi-vector problems. ' +
        'Set up one row per vector, one column per component, and sum the bottom row.',
      'A common exam trap: **sign errors in components**. ' +
        'Always write $v_{kx} = |\\vec{v}_k|\\cos\\theta_k$ where $\\theta_k$ is the standard angle (from $+x$, counterclockwise). ' +
        'If a problem gives "30° below the horizontal", convert to $\\theta = -30°$ before plugging in.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The component table',
        body:
          '\\begin{array}{c|c|c}\\text{Vector} & v_x & v_y\\\\\\hline\\vec{A} & A_x & A_y\\\\\\vec{B} & B_x & B_y\\\\\\hline\\vec{R} & R_x=A_x+B_x & R_y=A_y+B_y\\end{array}',
      },
      {
        type: 'mnemonic',
        title: 'DSMD — the four-step acronym',
        body: 'Decompose → Sum → Magnitude → Direction. Say it before every problem.',
      },
    ],
    visualizations: [
      {
        id: 'NumericalAdditionTable',
        title: 'Live component table — drag vectors, see every cell update',
        mathBridge: 'Each cell in the table corresponds to one step of DSMD.',
        caption: 'The table makes sign errors visible before they propagate.',
        props: { showTable: true },
      },
    ],
  },

  rigor: {
    prose: [
      'The numerical method is exact — not an approximation — because it is literally the definition of vector addition in $\\mathbb{R}^2$. ' +
        'Any error is purely arithmetic, not methodological.',
      'The only source of genuine imprecision is rounding during the trigonometric steps. ' +
        'Carry at least 4 significant figures through intermediate calculations and round only at the final answer.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Premature rounding',
        body:
          'Rounding $\\cos 37° = 0.8$ (instead of $0.7986$) introduces a 0.17% error that compounds through every step. ' +
          'Always use full calculator precision in intermediate steps.',
      },
      {
        type: 'insight',
        title: 'The method is definition, not approximation',
        body:
          '$\\vec{A}+\\vec{B} \\equiv (A_x+B_x, A_y+B_y)$. ' +
          'Decomposing and summing components is not an approximation of some exact geometric result — ' +
          'it IS the exact geometric result expressed algebraically.',
      },
    ],
    visualizationId: 'NumericalMethodProof',
    proofSteps: [
      {
        title: "Input: magnitude-angle form",
        expression: "\\vec{A} = (|\\vec{A}|, \\theta_A), \\quad \\vec{B} = (|\\vec{B}|, \\theta_B)",
        annotation: "Problems often give magnitude and angle. We need to convert to component form to perform the addition.",
      },
      {
        title: "Step 1 — Decompose A⃗",
        expression: "A_x = |\\vec{A}|\\cos\\theta_A, \\quad A_y = |\\vec{A}|\\sin\\theta_A",
        annotation: "Apply the component formulas to vector A. Watch for signs: e.g., an angle of 145° gives a negative x-component.",
      },
      {
        title: "Step 1 — Decompose B⃗",
        expression: "B_x = |\\vec{B}|\\cos\\theta_B, \\quad B_y = |\\vec{B}|\\sin\\theta_B",
        annotation: "Same formulas for vector B. Each component is an independent scalar calculation.",
      },
      {
        title: "Step 2 — Sum components",
        expression: "R_x = A_x+B_x, \\quad R_y = A_y+B_y",
        annotation: "This is vector addition by definition. The two component numbers combine to give the resultant's components.",
      },
      {
        title: "Step 3 — Magnitude",
        expression: "|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}",
        annotation: "Apply the Pythagorean theorem to the resultant components. This always gives the magnitude regardless of the quadrant.",
      },
      {
        title: "Step 4 — Direction",
        expression: "\\theta_R = \\text{atan2}(R_y, R_x)",
        annotation: "The atan2 function returns the correct quadrant. Plain arctan would require a manual quadrant check if Rx < 0.",
      },
    ],
    title: 'The four-step method — every step justified',
    visualizations: [
      {
        id: 'NumericalMethodProof',
        title: 'Each proof step lights up the corresponding diagram element',
        mathBridge: 'Steps 1-2 are decomposition; steps 3-4 reconstruction. The diagram shows both original and resultant vector at each stage.',
        caption: 'Proof and diagram in lockstep.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-006-ex1',
      title: 'Two forces at non-right angles',
      problem: '\\vec{A}=40\\,N\\text{ at }30°,\\;\\vec{B}=25\\,N\\text{ at }145°.\\text{ Find }\\vec{R}.',
      steps: [
        { expression: 'A_x=40\\cos30°=40(0.8660)=34.64\\,N,\\;A_y=40\\sin30°=20.00\\,N', annotation: 'Decompose A⃗.' },
        { expression: 'B_x=25\\cos145°=25(-0.8192)=-20.48\\,N,\\;B_y=25\\sin145°=25(0.5736)=14.34\\,N', annotation: 'Decompose B⃗. Note: 145° is in Quadrant II → negative x-component.' },
        { expression: 'R_x=34.64+(-20.48)=14.16\\,N,\\;R_y=20.00+14.34=34.34\\,N', annotation: 'Sum components.' },
        { expression: '|\\vec{R}|=\\sqrt{14.16^2+34.34^2}=\\sqrt{200.5+1179.2}=\\sqrt{1379.7}\\approx37.1\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(34.34/14.16)=\\arctan(2.425)\\approx67.6°', annotation: 'Both components positive → Quadrant I. atan2 agrees.' },
      ],
      conclusion: '$\\vec{R} \\approx 37.1\\,N$ at $67.6°$ from the positive $x$-axis.',
      visualizations: [
        { id: 'NumericalAdditionWalkthrough', title: 'Set the example values and step through', caption: 'Watch each DSMD step produce one number.', props: { lockedA: { mag: 40, angle: 30 }, lockedB: { mag: 25, angle: 145 } } },
      ],
    },
    {
      id: 'ch1-006-ex2',
      title: 'Subtracting vectors: A⃗ − B⃗ = A⃗ + (−B⃗)',
      problem: '\\vec{A}=(5,3),\\;\\vec{B}=(2,-1).\\text{ Find }\\vec{A}-\\vec{B}.',
      steps: [
        { expression: '-\\vec{B}=(-2,1)', annotation: 'Negate B⃗ by flipping all component signs. This reverses its direction.' },
        { expression: '\\vec{A}+(-\\vec{B})=(5+(-2),\\;3+1)=(3,4)', annotation: 'Add component-wise.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{9+16}=5', annotation: 'Magnitude of the difference.' },
      ],
      conclusion: 'Vector subtraction is just addition of the negated vector. $-\\vec{B}$ is the same length as $\\vec{B}$, pointing the opposite direction.',
    },
  ],

  challenges: [
    {
      id: 'ch1-006-ch1',
      difficulty: 'easy',
      problem: '\\vec{A}=10\\,N\\text{ at }0°,\\;\\vec{B}=10\\,N\\text{ at }90°.\\text{ Find }\\vec{R}\\text{ exactly.}',
      hint: '0° is east, 90° is north. Components are trivial.',
      walkthrough: [
        { expression: 'R_x=10+0=10,\\;R_y=0+10=10', annotation: 'Direct from the angles.' },
        { expression: '|\\vec{R}|=\\sqrt{200}=10\\sqrt{2}\\approx14.1\\,N', annotation: 'Pythagorean.' },
        { expression: '\\theta=45°', annotation: 'Equal components → 45°.' },
      ],
      answer: '10\\sqrt{2}\\,N\\text{ at }45°',
    },
    {
      id: 'ch1-006-ch2',
      difficulty: 'medium',
      problem: '\\text{Three forces: }\\vec{F}_1=50\\,N\\text{ at }0°,\\;\\vec{F}_2=30\\,N\\text{ at }120°,\\;\\vec{F}_3=20\\,N\\text{ at }240°.\\text{ Find }\\vec{R}.',
      hint: 'Set up the component table. Use exact trig values: $\\cos120°=-\\frac{1}{2}$, $\\sin120°=\\frac{\\sqrt{3}}{2}$, $\\cos240°=-\\frac{1}{2}$, $\\sin240°=-\\frac{\\sqrt{3}}{2}$.',
      walkthrough: [
        { expression: 'F_{1x}=50,\\;F_{1y}=0', annotation: '0° → full magnitude in x.' },
        { expression: 'F_{2x}=30(-\\tfrac{1}{2})=-15,\\;F_{2y}=30(\\tfrac{\\sqrt{3}}{2})=15\\sqrt{3}', annotation: '120° → Quadrant II.' },
        { expression: 'F_{3x}=20(-\\tfrac{1}{2})=-10,\\;F_{3y}=20(-\\tfrac{\\sqrt{3}}{2})=-10\\sqrt{3}', annotation: '240° → Quadrant III.' },
        { expression: 'R_x=50-15-10=25\\,N,\\;R_y=0+15\\sqrt{3}-10\\sqrt{3}=5\\sqrt{3}\\approx8.66\\,N', annotation: 'Sum each column.' },
        { expression: '|\\vec{R}|=\\sqrt{625+75}=\\sqrt{700}=10\\sqrt{7}\\approx26.5\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(5\\sqrt{3}/25)=\\arctan(\\sqrt{3}/5)\\approx19.1°', annotation: 'Both positive → Quadrant I.' },
      ],
      answer: '|\\vec{R}|=10\\sqrt{7}\\approx26.5\\,N\\text{ at }19.1°',
    },
    {
      id: 'ch1-006-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Forces } \\vec{A}\\text{ at }\\alpha\\text{ and }\\vec{B}\\text{ at }-\\alpha\\text{ have equal magnitudes }F. ' +
        '\\text{Show that }|\\vec{R}|=2F\\cos\\alpha\\text{ and that }\\vec{R}\\text{ points along the }x\\text{-axis.}',
      hint: 'By symmetry, the y-components cancel. Compute $R_x$ and use $\\cos(-\\alpha)=\\cos\\alpha$.',
      walkthrough: [
        { expression: 'A_x=F\\cos\\alpha,\\;A_y=F\\sin\\alpha', annotation: 'Decompose A⃗.' },
        { expression: 'B_x=F\\cos(-\\alpha)=F\\cos\\alpha,\\;B_y=F\\sin(-\\alpha)=-F\\sin\\alpha', annotation: 'Decompose B⃗. Note cosine is even, sine is odd.' },
        { expression: 'R_y=F\\sin\\alpha+(-F\\sin\\alpha)=0', annotation: 'y-components cancel by symmetry.' },
        { expression: 'R_x=F\\cos\\alpha+F\\cos\\alpha=2F\\cos\\alpha', annotation: 'x-components add.' },
        { expression: '|\\vec{R}|=\\sqrt{(2F\\cos\\alpha)^2+0^2}=2F\\cos\\alpha,\\;\\theta=0°', annotation: 'Resultant is purely horizontal with magnitude $2F\\cos\\alpha$.' },
      ],
      answer: '|\\vec{R}|=2F\\cos\\alpha,\\text{ directed along }+x.',
    },
  ],
}
