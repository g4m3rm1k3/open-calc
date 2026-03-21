export default {
  id: 'ch6-vector-preview',
  slug: 'vector-calculus-preview',
  chapter: 6,
  order: 4,
  title: 'Vector-Valued Functions Preview',
  subtitle: 'Position, velocity, and acceleration in 2D and 3D',
  tags: ['vectors', 'parametric', 'velocity', 'acceleration', '3d'],

  hook: {
    question: 'How do we describe motion in space with one object instead of separate x(t), y(t), z(t) equations?',
    realWorldContext:
      'Robotics, orbital mechanics, and animation engines all model trajectories as vector-valued functions r(t).',
    previewVisualizationId: 'ParametricCurve3D',
  },

  intuition: {
    prose: [
      'A vector-valued function packages coordinates into one object: r(t) = <x(t), y(t), z(t)>.',
      'Derivative gives velocity: r prime of t. Second derivative gives acceleration: r double-prime of t.',
      'Speed is magnitude of velocity: |r\'(t)|.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'ParametricCurve3D',
        title: '3D Trajectory View',
        caption: 'See how changing coordinate functions changes geometry and speed profile.',
      },
    ],
  },

  math: {
    prose: [
      'If r(t) = <x(t), y(t), z(t)>, then r\'(t) = <x\'(t), y\'(t), z\'(t)>.',
      'Speed: v(t) = |r\'(t)| = sqrt((x\')^2 + (y\')^2 + (z\')^2).',
      'Acceleration: a(t) is the derivative of velocity, i.e., r double-prime of t.',
    ],
    callouts: [],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Differentiation is componentwise and follows limit definitions in R^n.',
      'Arc length in 3D follows the same limit process as in 2D: L = integral |r\'(t)| dt.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-vector-preview-ex1',
      title: 'Velocity and Speed',
      problem: 'Given r(t)=<t, t^2, t^3>, find velocity and speed.',
      steps: [
        { expression: 'r\'(t)=<1, 2t, 3t^2>', annotation: 'Differentiate each component.' },
        { expression: '|r\'(t)|=\\sqrt{1+4t^2+9t^4}', annotation: 'Magnitude gives speed.' },
      ],
      conclusion: 'Velocity gives direction and speed; magnitude gives scalar speed.',
    },
  ],

  challenges: [
    {
      id: 'ch6-vector-preview-ch1',
      difficulty: 'easy',
      problem: 'For r(t)=<cos t, sin t, t>, find r\'(t).',
      hint: 'Differentiate componentwise.',
      walkthrough: [
        { expression: 'r\'(t)=<-sin t, cos t, 1>', annotation: 'Component derivatives.' },
      ],
      answer: '<-sin t, cos t, 1>',
    },
  ],

  crossRefs: [
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Vector-valued functions are the compact form of parametric equations.' },
    { lessonSlug: 'vectors', label: 'Vectors', context: 'Dot products and magnitudes are used in speed and geometry.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}
