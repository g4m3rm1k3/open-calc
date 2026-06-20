import distanceFormulaUrl from '../diagrams/distance-formula.svg?url'

export default {
  id: 'geo-3-1',
  slug: 'coordinate-geometry',
  chapter: 'geometry-3',
  title: 'Coordinate Geometry',
  subtitle: 'How algebra and geometry become the same language',
  tags: ['geometry', 'coordinates', 'distance', 'slope', 'midpoint'],
  hook: {
    question: 'How do you find the exact distance between two points on a map?',
    realWorldContext: 'Every GPS, every game engine, every physics simulation answers this question thousands of times per second. The answer turns out to be the Pythagorean theorem wearing new clothes — once you see it, you cannot unsee it.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The coordinate plane is geometry with an address system.** René Descartes realized that every point in the plane could be pinned down by exactly two numbers — its horizontal position $x$ and its vertical position $y$. That single idea unified algebra and geometry: geometric shapes became equations, and equations became pictures.',
          'The payoff is enormous. Distance, angle, parallelism, perpendicularity — all of these can now be *computed*, not just drawn. And the first computation you need is distance.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**A hidden right triangle.** Draw any two points on the plane. Now draw a horizontal line from the left point and a vertical line from the right point until they meet. You have just built a right triangle. The horizontal leg has length $|x_2 - x_1|$. The vertical leg has length $|y_2 - y_1|$. The straight-line distance between the two original points is the hypotenuse.',
        ],
      },
      {
        type: 'image',
        src: distanceFormulaUrl,
        alt: 'Two points A(2,1) and B(6,4) on a coordinate plane with the right triangle between them showing Δx=4, Δy=3, d=5',
        caption: 'The right triangle hiding inside any two points. The distance is always the hypotenuse.',
      },
      {
        type: 'prose',
        paragraphs: [
          'Apply the Pythagorean theorem $a^2 + b^2 = c^2$ with $a = \\Delta x$ and $b = \\Delta y$, and solve for $c$:',
        ],
      },
      {
        type: 'math',
        tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
        caption: 'The Distance Formula — Pythagoras on a coordinate grid',
      },
      {
        type: 'prose',
        paragraphs: [
          'This is not a new formula. It **is** the Pythagorean theorem. The squaring removes the need for absolute values (squaring a negative gives a positive). The square root inverts the squaring to recover the length. There is nothing to memorize that you do not already know — just recognize the triangle.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_1_CoordinatePlane',
        title: 'Distance Formula Explorer',
        mathBridge: 'Drag either point. Watch how $\\Delta x$ and $\\Delta y$ change — the readout is always $\\sqrt{\\Delta x^2 + \\Delta y^2}$. Try making a 3-4-5 triangle: place one point at the origin and the other at (3, 4). The distance should be exactly 5.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The Midpoint Formula.** To find the point exactly halfway between two points, average the $x$-coordinates and average the $y$-coordinates separately. Think of it as walking halfway along the horizontal leg and halfway along the vertical leg:',
        ],
      },
      {
        type: 'math',
        tex: 'M = \\left(\\frac{x_1 + x_2}{2},\\ \\frac{y_1 + y_2}{2}\\right)',
        caption: 'The Midpoint Formula — one average for each coordinate',
      },
      {
        type: 'prose',
        paragraphs: [
          'For example, the midpoint of $(2, 1)$ and $(6, 4)$ is $\\left(\\frac{2+6}{2}, \\frac{1+4}{2}\\right) = (4, 2.5)$. If you plot that point, it sits exactly in the center of the segment connecting them.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Slope** measures the steepness and direction of a line. It is the ratio of *how much $y$ changes* to *how much $x$ changes* as you move from any one point on the line to any other:',
        ],
      },
      {
        type: 'math',
        tex: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}',
        caption: 'Slope — rise over run',
      },
      {
        type: 'prose',
        paragraphs: [
          'Slope carries direction and steepness in a single number. A **positive slope** rises from left to right. A **negative slope** falls. A **zero slope** is perfectly horizontal. An **undefined slope** is vertical — the denominator $\\Delta x = 0$ causes division by zero, which signals that the line has no "run" at all.',
          '**Parallel lines** have the same slope — they lean at identical angles and therefore never meet. **Perpendicular lines** have slopes that are negative reciprocals of each other: if one line has slope $m$, the perpendicular line has slope $-\\frac{1}{m}$. Their slopes multiply to $-1$:',
        ],
      },
      {
        type: 'math',
        tex: 'm_1 \\cdot m_2 = -1 \\quad \\Longleftrightarrow \\quad \\text{lines are perpendicular}',
        caption: 'The perpendicularity condition — slopes multiply to −1',
      },
      {
        type: 'viz',
        id: 'G3_2_LinesInPlane',
        title: 'Slope and Line Relations',
        mathBridge: 'Adjust the slopes of both lines. Notice: when their product equals $-1$, the lines are exactly perpendicular. Try slope $2$ and slope $-\\tfrac{1}{2}$ — they form a perfect right angle.',
      },
    ],
  },
  mentalModel: [
    'The distance formula IS the Pythagorean theorem — every pair of points hides a right triangle',
    'Midpoint = average of each coordinate separately — split the horizontal and vertical distances in half',
    'Slope = rise ÷ run — positive rises, negative falls, zero is flat, undefined is vertical',
    'Parallel lines share a slope — perpendicular lines have slopes that multiply to −1',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The distance formula $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$ is a direct application of which theorem?',
      options: [
        'The quadratic formula',
        'The Pythagorean theorem',
        'The slope formula',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What is the slope of a perfectly horizontal line?',
      options: ['Undefined', '0', '1'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Line A has slope 2. A line perpendicular to A has slope…',
      options: ['2', '−½', '½'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the midpoint of (2, 4) and (8, 10)?',
      options: ['(5, 7)', '(6, 6)', '(10, 14)'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A line has a negative slope. What does that tell you about the line?',
      options: [
        'It rises from left to right',
        'It falls from left to right',
        'It passes through the origin',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A vertical line has an undefined slope because…',
      options: [
        'Its rise is zero',
        'Its run is zero, causing division by zero in rise ÷ run',
        'It has no y-intercept',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Two lines are parallel if and only if…',
      options: [
        'Their slopes add to zero',
        'They have the same slope but different y-intercepts',
        'They share exactly one point',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'What is the distance between (0, 0) and (3, 4)?',
      options: ['7', '5', '√7'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Why does squaring $(x_2 - x_1)$ in the distance formula remove the need for absolute value signs?',
      options: [
        'Squaring always gives a positive result, so direction does not matter',
        'The square root undoes the squaring',
        'The formula only works when $x_2 > x_1$',
      ],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'You know two points on a line segment. Which formula finds the exact center of that segment?',
      options: [
        'The slope formula',
        'The midpoint formula',
        'The distance formula',
      ],
      correct: 1,
    },
  ],
};
