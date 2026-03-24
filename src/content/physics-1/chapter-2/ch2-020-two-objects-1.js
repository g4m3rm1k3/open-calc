export default {
  id: 'ch2-020', slug: 'two-objects-1', chapter: 2, order: 20,
  title: 'Two Objects — Meeting Problems (Part 1)',
  subtitle: 'When do two objects at different positions with different velocities meet?',
  tags: ['two-objects-1', 'kinematics', '1D motion'],
  aliases: 'two-objects-1',
  hook: {
    question: 'Car A is at x = 0 moving at 20 m/s. Car B is 100 m ahead moving at 15 m/s. When does A catch B?',
    realWorldContext: 'Two-object problems appear in every physics exam. The trick: write x(t) for each object and set them equal.',
    previewVisualizationId: 'TwoObjectsIntuition',
  },
  videos: [{
    title: 'Physics 2 – Motion in One Dimension (20 of 22) Two Objects',
    embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/NgVoFl4G6IE" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: ['See the visualisation and key formula below.'],
    callouts: [{ type: 'theorem', title: 'Core formula', body: 'x_A(t) = x_B(t) \implies \text{solve for }t' }],
    visualizations: [{ id: 'TwoObjectsIntuition', title: 'Two Objects — Meeting Problems (Part 1) — intuition', mathBridge: 'Interactive exploration.', caption: 'Drag and explore.' }],
  },
  math: {
    prose: ['Apply the formula to solve problems systematically.'],
    callouts: [{ type: 'insight', title: 'Key formula', body: 'x_A(t) = x_B(t) \implies \text{solve for }t' }],
    visualizations: [{ id: 'TwoObjectsExplorer', title: 'Two Objects — Meeting Problems (Part 1) — explorer', mathBridge: 'Adjust inputs and see outputs.', caption: 'Every case covered.' }],
  },
  rigor: {
    prose: ['The result follows from the definitions of velocity and acceleration.'],
    callouts: [{ type: 'definition', title: 'Formal statement', body: 'x_A(t) = x_B(t) \implies \text{solve for }t' }],
    visualizationId: 'KinematicProof',
    proofSteps: [{ expression: 'x_A(t) = x_B(t) \implies \text{solve for }t', annotation: 'Core result to be established.' }],
    title: 'Two Objects — Meeting Problems (Part 1) — derivation',
    visualizations: [{ id: 'KinematicProof', title: 'Proof steps', mathBridge: 'Each step builds on the previous.' }],
  },
  examples: [
    { id: 'ch2-020-ex1', title: 'Core application', problem: 'Apply the formula to a standard Two Objects — Meeting Problems (Part 1) problem.', steps: [{ expression: 'x_A(t) = x_B(t) \implies \text{solve for }t', annotation: 'Direct application.' }], conclusion: 'Use systematic sign discipline.' },
  ],
  challenges: [
    { id: 'ch2-020-ch1', difficulty: 'medium', problem: 'Apply Two Objects — Meeting Problems (Part 1) to a multi-step scenario.', hint: 'Identify known/unknown quantities first.', walkthrough: [{ expression: 'x_A(t) = x_B(t) \implies \text{solve for }t', annotation: 'Apply systematically.' }], answer: 'See worked solution.' },
  ],
}
