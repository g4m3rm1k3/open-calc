export default {
  id: 'ch0-conic-sections',
  slug: 'conic-sections',
  chapter: 0,
  order: 0.3,
  title: 'Conic Sections Foundations',
  subtitle: 'Circle, parabola, ellipse, hyperbola in coordinate form',
  tags: ['conics', 'parabola', 'ellipse', 'hyperbola', 'circle', 'completing the square'],

  hook: {
    question: 'Why do satellites, lenses, and trajectories keep producing the same four curve families?',
    realWorldContext:
      'Conics model orbits, optics, and optimization geometry; this gives the algebra fluency needed before deeper calculus uses.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      'Conic sections are the four canonical quadratic curve families.',
      'Completing the square is the key move that reveals the curve type from expanded equations.',
      'Calc uses these forms in optimization, area setup, and coordinate changes.',
    ],
    callouts: [],
    visualizations: [],
  },

  math: {
    prose: [
      'Circle: (x-h)^2 + (y-k)^2 = r^2.',
      'Parabola (vertical): (x-h)^2 = 4p(y-k).',
      'Ellipse: (x-h)^2/a^2 + (y-k)^2/b^2 = 1.',
      'Hyperbola: (x-h)^2/a^2 - (y-k)^2/b^2 = 1 (or swapped axes).',
    ],
    callouts: [],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Classification comes from diagonalized quadratic form signs and completing-square normalization.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch0-conics-ex1',
      title: 'Classify by Completing the Square',
      problem: 'Classify x^2 - 4x + y^2 + 6y - 12 = 0 and write standard form.',
      steps: [
        { expression: '(x-2)^2 + (y+3)^2 = 25', annotation: 'Complete squares in x and y.' },
      ],
      conclusion: 'Circle with center (2,-3) and radius 5.',
    },
  ],

  challenges: [
    {
      id: 'ch0-conics-ch1',
      difficulty: 'easy',
      problem: 'Put x^2 - y^2 - 6x - 4y = 3 into standard form and identify the conic.',
      hint: 'Group x and y terms, complete each square, then isolate 1 on right side.',
      walkthrough: [
        { expression: '(x-3)^2 - (y+2)^2 = 8', annotation: 'Standard hyperbola form up to scaling.' },
      ],
      answer: 'Hyperbola.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'geometry-review', label: 'Coordinate Geometry Review', context: 'Conics extend the coordinate-geometry toolkit.' },
    { lessonSlug: 'completing-the-square', label: 'Completing the Square', context: 'Main algebraic tool for conic normalization.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}
