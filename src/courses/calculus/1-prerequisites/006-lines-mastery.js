export default {
  id: 'lines-mastery',
  slug: 'lines-mastery',
  title: 'Mastering the Line: Rate, Form, and Flow',
  tags: ['algebra', 'foundation', 'lines', 'slope'],
  chapter: 0,
  order: 3,

  hook: {
    question: 'What is the simplest possible way a system can change?',
    realWorldContext: 'From the slope of a roof to the trajectory of a plane, lines are the "atomic units" of steady growth. In calculus, we approximate even the most complex curves by treating them as a sequence of tiny lines.',
  },

  mentalModel: [
    'A line = Constant Sensitivity',
    'Slope (m) = The "Cost" of moving 1 unit right',
    'Equation = A constraint that keeps you on the path'
  ],

  intuition: {
    prose: [
      'A line isn\'t just a shape; it is the mathematical embodiment of a **constant rate of change**. If you understand the line, you understand the baseline of all physical motion.',
      'Whether you describe it via the intercept or a single point, you are always just expressing one thing: the fixed ratio of "rise over run".',
    ],
    visualizations: [
      {
        id: 'LineFoundationsLab',
        title: 'The Master Lab: Lines from First Principles',
        caption: 'Use this lab to explore how points, rates, and equations are all different ways of looking at the same steady flow.',
      }
    ],
  },

  math: {
    callouts: [
      {
        type: 'definition',
        title: 'The Slope Formula',
        body: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}'
      },
      {
        type: 'insight',
        title: 'The Three Forms',
        body: `
- **Slope-Intercept**: $y = mx + b$ (Best for finding where you start)
- **Point-Slope**: $y - y_0 = m(x - x_0)$ (Best for Calculus and local rates)
- **Standard**: $Ax + By = C$ (Best for intersections and geometry)
        `
      }
    ]
  },

  rigor: {
    title: 'Parallel vs Perpendicular',
    proofSteps: [
      { expression: "m_1 = m_2", annotation: 'Lines are parallel (moving in perfect lockstep).' },
      { expression: "m_1 \\cdot m_2 = -1", annotation: 'Lines are perpendicular (growth rates are inverse opposites).' },
    ]
  }
};
