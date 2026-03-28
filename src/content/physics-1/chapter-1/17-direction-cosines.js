export default {
  id: 'p1-ch1-017', slug: 'direction-cosines', chapter: 1, order: 17,
  title: 'Direction Cosines',
  subtitle: 'Three angles that uniquely specify any direction in 3D space.',
  tags: ['direction cosines', '3D direction', 'unit vector', 'alpha beta gamma'],
  aliases: 'direction-cosines',
  hook: {
    question: 'A force acts in 3D. You know its magnitude — how do you describe exactly which way it points?',
    realWorldContext: 'Direction cosines are the standard way to specify orientation in 3D space in aerospace, robotics, and structural analysis. Any 3D direction can be specified by exactly three cosines — and those cosines are not independent: they must always satisfy one identity.',
    previewVisualizationId: 'DirectionCosineIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (19 of 21) Finding the Direction Cosine',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'In 2D, one angle $\\theta$ specifies a direction. In 3D, one angle is not enough — you need to describe the relationship of the vector to *all three* coordinate axes.',
      'The **direction cosines** are the cosines of the three angles the vector makes with the $x$-, $y$-, and $z$-axes: $\\cos\\alpha$, $\\cos\\beta$, and $\\cos\\gamma$ respectively.',
      'Crucially, these three cosines are *not* independent — they are the components of the **unit vector** in the direction of $\\vec{A}$. That is exactly why they satisfy $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$ — the unit vector has magnitude 1.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Direction cosines',
        body:
          '\\cos\\alpha = \\frac{A_x}{|\\vec{A}|},\\quad' +
          '\\cos\\beta = \\frac{A_y}{|\\vec{A}|},\\quad' +
          '\\cos\\gamma = \\frac{A_z}{|\\vec{A}|}',
      },
      {
        type: 'theorem',
        title: 'The identity they must satisfy',
        body: '\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1',
      },
      {
        type: 'insight',
        title: 'Direction cosines = components of the unit vector',
        body:
          '\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|} = (\\cos\\alpha,\\;\\cos\\beta,\\;\\cos\\gamma). ' +
          '\\text{The identity follows from }|\\hat{A}|=1.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'From 2D components to 3D direction cosines',
        caption: 'In 2D, Aₓ = |A|cosθ is the shadow on the x-axis and Ay = |A|sinθ is the shadow on the y-axis. In 3D, exactly the same idea applies to all three axes: each direction cosine is the component along that axis divided by the magnitude.',
      },
      { id: 'DirectionCosineIntuition', title: 'Direction Cosines — intuition', mathBridge: 'Interactive exploration of Direction Cosines.', caption: 'Drag and explore.' },
    ],
  },
  math: {
    prose: [
      'Given the direction cosines, you can immediately reconstruct the unit vector and scale it to any magnitude.',
      'The formula also runs in reverse: given the components, compute each direction cosine by dividing by the magnitude.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Forward: unit vector from direction cosines',
        body: '\\hat{A} = \\cos\\alpha\\,\\hat{i} + \\cos\\beta\\,\\hat{j} + \\cos\\gamma\\,\\hat{k}',
      },
      {
        type: 'theorem',
        title: 'Inverse: direction cosines from components',
        body:
          '\\cos\\alpha = \\frac{A_x}{\\sqrt{A_x^2+A_y^2+A_z^2}},\\quad' +
          '\\cos\\beta = \\frac{A_y}{\\sqrt{A_x^2+A_y^2+A_z^2}},\\quad' +
          '\\cos\\gamma = \\frac{A_z}{\\sqrt{A_x^2+A_y^2+A_z^2}}',
      },
      {
        type: 'warning',
        title: 'Angles are from the positive axes',
        body:
          '$\\alpha$ is the angle between $\\vec{A}$ and the positive $x$-axis (not the $y$–$z$ plane). ' +
          'All three angles $\\alpha, \\beta, \\gamma \\in [0°, 180°]$.',
      },
    ],
    visualizations: [
      { id: 'DirectionCosineExplorer', title: 'Direction Cosines — explorer', mathBridge: 'Adjust inputs and see outputs update.', caption: 'Every input combination covered.' },
    ],
  },
  rigor: {
    prose: [
      'The identity $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$ is simply the Pythagorean theorem in 3D applied to the unit vector.',
      'This means direction cosines are over-determined: if you know two of them, the third is fixed up to a sign. The sign ambiguity is resolved by knowing which octant of 3D space the vector lies in.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Constraint from the Pythagorean theorem',
        body:
          '|\\hat{A}|^2 = \\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1 ' +
          '\\text{ — the same as } A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2 \\text{ divided through by }|\\vec{A}|^2.',
      },
    ],
    visualizationId: 'DirectionCosineProof',
    proofSteps: [
      {
        title: 'Define direction cosines',
        expression: '\\cos\\alpha = \\frac{A_x}{|\\vec{A}|}, \\quad \\cos\\beta = \\frac{A_y}{|\\vec{A}|}, \\quad \\cos\\gamma = \\frac{A_z}{|\\vec{A}|}',
        annotation: 'Each direction cosine is the component along that axis divided by the magnitude — the cosine of the angle to that axis.',
      },
      {
        title: 'Square all three',
        expression: '\\cos^2\\alpha = \\frac{A_x^2}{|\\vec{A}|^2}, \\quad \\cos^2\\beta = \\frac{A_y^2}{|\\vec{A}|^2}, \\quad \\cos^2\\gamma = \\frac{A_z^2}{|\\vec{A}|^2}',
        annotation: 'Squaring each cosine gives the squared component over the squared magnitude.',
      },
      {
        title: 'Sum them',
        expression: '\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = \\frac{A_x^2 + A_y^2 + A_z^2}{|\\vec{A}|^2}',
        annotation: 'The numerators combine into the sum of squared components.',
      },
      {
        title: 'Recognise the numerator',
        expression: 'A_x^2 + A_y^2 + A_z^2 = |\\vec{A}|^2',
        annotation: 'The 3D Pythagorean theorem: the squared magnitude equals the sum of squared components.',
      },
      {
        title: 'Identity proven',
        expression: '\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = \\frac{|\\vec{A}|^2}{|\\vec{A}|^2} = 1',
        annotation: 'Numerator and denominator cancel. This is the 3D analogue of cos²θ + sin²θ = 1.',
      },
    ],
    title: 'Proof: direction cosine identity from the Pythagorean theorem',
    visualizations: [{ id: 'DirectionCosineProof', title: 'Proof steps', mathBridge: 'Each step builds on the previous.' }],
  },
  examples: [
    {
      id: 'ch1-017-ex1',
      title: 'Find the direction cosines of a force vector',
      problem: '\\text{A force } \\vec{F} = (3, -4, 0)\\,N. \\text{ Find its direction cosines and the angles it makes with each axis.}',
      steps: [
        {
          expression: '|\\vec{F}| = \\sqrt{3^2+(-4)^2+0^2} = \\sqrt{9+16} = 5\\,N',
          annotation: 'Magnitude first.',
        },
        {
          expression: '\\cos\\alpha = 3/5 = 0.6 \\implies \\alpha = \\arccos(0.6) \\approx 53.1°',
          annotation: 'Angle to the x-axis.',
        },
        {
          expression: '\\cos\\beta = -4/5 = -0.8 \\implies \\beta = \\arccos(-0.8) \\approx 143.1°',
          annotation: 'Negative component → obtuse angle to the y-axis.',
        },
        {
          expression: '\\cos\\gamma = 0/5 = 0 \\implies \\gamma = 90°',
          annotation: 'Zero z-component → vector lies in the x–y plane, perpendicular to the z-axis.',
        },
        {
          expression: '\\text{Check: }0.6^2 + (-0.8)^2 + 0^2 = 0.36 + 0.64 + 0 = 1\\;\\checkmark',
          annotation: 'Identity satisfied.',
        },
      ],
      conclusion: 'Direction cosines $(0.6,\\,-0.8,\\,0)$; angles $53.1°$, $143.1°$, $90°$.',
    },
    {
      id: 'ch1-017-ex2',
      title: 'Reconstruct a vector from direction cosines and magnitude',
      problem:
        '\\text{A vector has magnitude } 10 \\text{ and direction cosines } \\cos\\alpha = 1/\\sqrt{2},\\;\\cos\\beta = 1/\\sqrt{2},\\;\\cos\\gamma = 0. ' +
        '\\text{ Find the components.}',
      steps: [
        {
          expression: '\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma = \\tfrac{1}{2}+\\tfrac{1}{2}+0 = 1\\;\\checkmark',
          annotation: 'Identity check first.',
        },
        {
          expression: 'A_x = |\\vec{A}|\\cos\\alpha = 10/\\sqrt{2} \\approx 7.07',
          annotation: 'x-component.',
        },
        {
          expression: 'A_y = 10/\\sqrt{2} \\approx 7.07,\\quad A_z = 0',
          annotation: 'y- and z-components.',
        },
      ],
      conclusion: '$(7.07, 7.07, 0)$ — a 45° vector in the x–y plane with no z-component.',
    },
  ],
  challenges: [
    {
      id: 'ch1-017-ch1',
      difficulty: 'easy',
      problem: '\\text{A vector has components }(1, 1, 1). \\text{ Find its direction cosines.}',
      hint: '$|\\vec{A}| = \\sqrt{3}$. Each component divided by $\\sqrt{3}$ gives each cosine.',
      walkthrough: [
        { expression: '|\\vec{A}|=\\sqrt{3}', annotation: 'Magnitude.' },
        { expression: '\\cos\\alpha=\\cos\\beta=\\cos\\gamma=1/\\sqrt{3}\\approx0.577', annotation: 'Each direction cosine is equal — 45° is preserved in 3D.' },
        { expression: '\\text{Check: }3\\times(1/\\sqrt{3})^2=3\\times1/3=1\\;\\checkmark', annotation: 'Identity satisfied.' },
      ],
      answer: '\\cos\\alpha=\\cos\\beta=\\cos\\gamma=1/\\sqrt{3}\\approx0.577,\\;\\alpha=\\beta=\\gamma\\approx54.7°',
    },
    {
      id: 'ch1-017-ch2',
      difficulty: 'medium',
      problem: '\\text{Can a 3D vector have direction cosines }\\cos\\alpha=0.9,\\;\\cos\\beta=0.9,\\;\\cos\\gamma=?\\text{ Find }\\cos\\gamma.',
      hint: 'Use the identity and solve for the third cosine.',
      walkthrough: [
        { expression: '\\cos^2\\gamma = 1 - 0.81 - 0.81 = -0.62 < 0', annotation: 'Negative — this is impossible.' },
      ],
      answer: 'No. $\\cos^2\\gamma < 0$ is impossible. A vector cannot have cosines of 0.9 along two different axes simultaneously.',
    },
  ],
}
