export default {
  id: 'ch1-017', slug: 'direction-cosines', chapter: 1, order: 17,
  title: 'Direction Cosines',
  subtitle: 'Three angles that uniquely specify any direction in 3D space.',
  tags: ['direction cosines', '3D direction', 'unit vector', 'alpha beta gamma'],
  aliases: 'direction-cosines',
  hook: {
    question: 'A force acts in 3D. You know its magnitude — how do you describe exactly which way it points?',
    realWorldContext: 'Direction cosines are the standard way to specify orientation in 3D space in aerospace, robotics, and structural analysis.',
    previewVisualizationId: 'DirectionCosineIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (19 of 21) Finding the Direction Cosine',
    embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/AKjmeZWy034" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: ['See the key formula below and the visualizations for intuition.'],
    callouts: [{ type: 'theorem', title: 'Core formula', body: '\cos\alpha=\frac{A_x}{|\vec{A}|},\;\cos\beta=\frac{A_y}{|\vec{A}|},\;\cos\gamma=\frac{A_z}{|\vec{A}|},\;\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1' }],
    visualizations: [{ id: 'DirectionCosineIntuition', title: 'Direction Cosines — intuition', mathBridge: 'Interactive exploration of Direction Cosines.', caption: 'Drag and explore.' }],
  },
  math: {
    prose: ['Work through the formula step by step.'],
    callouts: [{ type: 'insight', title: 'Key formula', body: '\cos\alpha=\frac{A_x}{|\vec{A}|},\;\cos\beta=\frac{A_y}{|\vec{A}|},\;\cos\gamma=\frac{A_z}{|\vec{A}|},\;\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1' }],
    visualizations: [{ id: 'DirectionCosineExplorer', title: 'Direction Cosines — explorer', mathBridge: 'Adjust inputs and see outputs update.', caption: 'Every input combination covered.' }],
  },
  rigor: {
    prose: ['The formula follows from the definitions.'],
    callouts: [{ type: 'definition', title: 'Formal definition', body: '\cos\alpha=\frac{A_x}{|\vec{A}|},\;\cos\beta=\frac{A_y}{|\vec{A}|},\;\cos\gamma=\frac{A_z}{|\vec{A}|},\;\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1' }],
    visualizationId: 'DirectionCosineProof',
    proofSteps: [
      {
        title: "Define direction cosines",
        expression: "\\cos\\alpha = \\frac{A_x}{|\\vec{A}|}, \\quad \\cos\\beta = \\frac{A_y}{|\\vec{A}|}, \\quad \\cos\\gamma = \\frac{A_z}{|\\vec{A}|}",
        annotation: "Each direction cosine is the component along that axis divided by the magnitude. Each one equals cosine of the angle to that axis.",
      },
      {
        title: "Square all three",
        expression: "\\cos^2\\alpha = \\frac{A_x^2}{|\\vec{A}|^2}, \\quad \\cos^2\\beta = \\frac{A_y^2}{|\\vec{A}|^2}, \\quad \\cos^2\\gamma = \\frac{A_z^2}{|\\vec{A}|^2}",
        annotation: "Squaring each cosine gives the squared component over the squared magnitude.",
      },
      {
        title: "Sum them",
        expression: "\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = \\frac{A_x^2 + A_y^2 + A_z^2}{|\\vec{A}|^2}",
        annotation: "The numerators combine into the sum of squared components.",
      },
      {
        title: "Recognise the numerator",
        expression: "A_x^2 + A_y^2 + A_z^2 = |\\vec{A}|^2",
        annotation: "The 3D Pythagorean theorem: the squared magnitude equals the sum of squared components. This is the key step.",
      },
      {
        title: "Identity proven",
        expression: "\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = \\frac{|\\vec{A}|^2}{|\\vec{A}|^2} = 1",
        annotation: "The numerator and denominator cancel. The identity is proven. This is the 3D version of $\\cos^2\\theta + \\sin^2\\theta = 1$.",
      },
    ],
    title: 'Direction Cosines — derivation',
    visualizations: [{ id: 'DirectionCosineProof', title: 'Proof steps', mathBridge: 'Each step builds on the previous.' }],
  },
  examples: [
    { id: 'ch1-017-ex1', title: 'Core calculation', problem: 'Apply the Direction Cosines formula to given vectors.', steps: [{ expression: '\cos\alpha=\frac{A_x}{|\vec{A}|},\;\cos\beta=\frac{A_y}{|\vec{A}|},\;\cos\gamma=\frac{A_z}{|\vec{A}|},\;\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1', annotation: 'Direct application.' }], conclusion: 'Use the formula systematically.' },
  ],
  challenges: [
    { id: 'ch1-017-ch1', difficulty: 'easy', problem: 'Apply Direction Cosines to simple vectors.', hint: 'Use the formula directly.', walkthrough: [{ expression: '\cos\alpha=\frac{A_x}{|\vec{A}|},\;\cos\beta=\frac{A_y}{|\vec{A}|},\;\cos\gamma=\frac{A_z}{|\vec{A}|},\;\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1', annotation: 'Apply directly.' }], answer: 'See formula above.' },
  ],
}
