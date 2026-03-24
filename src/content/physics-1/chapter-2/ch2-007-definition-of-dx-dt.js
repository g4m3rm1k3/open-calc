export default {
  id: 'ch2-007', slug: 'definition-of-dx-dt', chapter: 2, order: 7,
  title: 'Definition of dx/dt',
  subtitle: 'The derivative as a limit: from average velocity to instantaneous velocity.',
  tags: ['definition-of-dx-dt', 'kinematics', '1D motion'],
  aliases: 'definition-of-dx-dt',
  hook: {
    question: 'How can velocity be defined at a single instant when velocity requires a time interval to measure?',
    realWorldContext: 'The limit definition bridges the gap between physics and calculus. This is the foundation of differential calculus applied to motion.',
    previewVisualizationId: 'DerivativeLimitIntuition',
  },
  videos: [{
    title: 'Physics 2 – Motion in One Dimension (7 of 22) Definition of dx/dt',
    embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/R50pjSK4yZg" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: ['See the visualisation and key formula below.'],
    callouts: [{ type: 'theorem', title: 'Core formula', body: 'v = \frac{dx}{dt} = \lim_{\Delta t\to 0}\frac{\Delta x}{\Delta t}' }],
    visualizations: [{ id: 'DerivativeLimitIntuition', title: 'Definition of dx/dt — intuition', mathBridge: 'Interactive exploration.', caption: 'Drag and explore.' }],
  },
  math: {
    prose: ['Apply the formula to solve problems systematically.'],
    callouts: [{ type: 'insight', title: 'Key formula', body: 'v = \frac{dx}{dt} = \lim_{\Delta t\to 0}\frac{\Delta x}{\Delta t}' }],
    visualizations: [{ id: 'DerivativeLimitExplorer', title: 'Definition of dx/dt — explorer', mathBridge: 'Adjust inputs and see outputs.', caption: 'Every case covered.' }],
  },
  rigor: {
    prose: ['The result follows from the definitions of velocity and acceleration.'],
    callouts: [{ type: 'definition', title: 'Formal statement', body: 'v = \frac{dx}{dt} = \lim_{\Delta t\to 0}\frac{\Delta x}{\Delta t}' }],
    visualizationId: 'KinematicsDerivativeProof',
    proofSteps: [{ expression: 'v = \frac{dx}{dt} = \lim_{\Delta t\to 0}\frac{\Delta x}{\Delta t}', annotation: 'Core result to be established.' }],
    title: 'Definition of dx/dt — derivation',
    visualizations: [{ id: 'KinematicsDerivativeProof', title: 'Proof steps', mathBridge: 'Each step builds on the previous.' }],
  },
  examples: [
    { id: 'ch2-007-ex1', title: 'Core application', problem: 'Apply the formula to a standard Definition of dx/dt problem.', steps: [{ expression: 'v = \frac{dx}{dt} = \lim_{\Delta t\to 0}\frac{\Delta x}{\Delta t}', annotation: 'Direct application.' }], conclusion: 'Use systematic sign discipline.' },
  ],
  challenges: [
    { id: 'ch2-007-ch1', difficulty: 'medium', problem: 'Apply Definition of dx/dt to a multi-step scenario.', hint: 'Identify known/unknown quantities first.', walkthrough: [{ expression: 'v = \frac{dx}{dt} = \lim_{\Delta t\to 0}\frac{\Delta x}{\Delta t}', annotation: 'Apply systematically.' }], answer: 'See worked solution.' },
  ],
}
