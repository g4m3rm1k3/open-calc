export default {
  id: 'geo-3-2',
  slug: 'circles-transformations',
  chapter: 'geometry-3',
  title: 'Circles and Transformations',
  subtitle: 'How the distance formula becomes a circle, and how shapes move without changing',
  tags: ['geometry', 'circles', 'transformations'],
  hook: {
    question: 'How do you describe a circle using only an equation?',
    realWorldContext: 'Every radar sweep, every ripple in water, every roundabout on a map is a circle. Engineers describe them not with a compass but with an equation derived directly from the distance formula — the same formula you already know.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**A circle is a distance condition.** A circle with center $(h, k)$ and radius $r$ is precisely the set of all points $(x, y)$ that are exactly $r$ units from the center. That is the whole definition. Apply the distance formula to "distance from $(x,y)$ to $(h,k)$ equals $r$" and square both sides:',
        ],
      },
      {
        type: 'math',
        tex: '(x - h)^2 + (y - k)^2 = r^2',
        caption: 'Standard form of a circle — center (h, k), radius r',
      },
      {
        type: 'prose',
        paragraphs: [
          'This is not a new formula — it is the Pythagorean theorem applied to the horizontal and vertical distances from any point on the circle to its center. The center $(h,k)$ shifts the circle off the origin; the radius $r$ controls its size.',
          '**Reading the equation.** In standard form, the center and radius jump out immediately: the circle $(x-3)^2 + (y+2)^2 = 25$ has center $(3, -2)$ and radius $5$ (because $\\sqrt{25} = 5$). When you see $+2$ inside the parenthesis, the center is at $y = -2$ — the subtracted constant is the coordinate.',
          '**Expanded form.** Distributing gives $x^2 + y^2 - 6x + 4y - 12 = 0$. To reverse this, complete the square on the $x$-terms and $y$-terms separately, adding the same amounts to both sides to balance the equation. This converts expanded form back to standard form, revealing the center and radius.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_3_CircleEquation',
        title: 'Circle Equation Explorer',
        mathBridge: 'Drag the center $(h, k)$ and adjust the radius $r$. Notice how the equation updates instantly — the numbers inside the parentheses track the center, and $r^2$ on the right tracks the radius squared. Try setting $h = 0$ and $k = 0$ to see why the origin-centered circle simplifies to $x^2 + y^2 = r^2$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Transformations move and mirror shapes without changing them.** A geometric transformation is a function that maps every point of the plane to a new point. Four transformations preserve shape and size (the "rigid" transformations) and one scales without distorting (dilation).',
          'A **translation** slides every point by the same vector $(a, b)$: the new point is $(x + a,\\ y + b)$. Lines stay parallel, distances stay equal, the shape is merely relocated.',
          'A **reflection** flips every point over a line of symmetry (the mirror). Reflecting over the $x$-axis maps $(x, y) \\to (x, -y)$. Over the $y$-axis: $(x, y) \\to (-x, y)$. Over the line $y = x$: $(x, y) \\to (y, x)$.',
          'A **rotation** by angle $\\theta$ about the origin maps every point to a new location around the center:',
        ],
      },
      {
        type: 'math',
        tex: "\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix}",
        caption: 'Rotation matrix — this is why sine and cosine were first defined',
      },
      {
        type: 'prose',
        paragraphs: [
          'A **dilation** by scale factor $k$ about the origin maps $(x, y) \\to (kx, ky)$. When $k > 1$ the shape grows; when $0 < k < 1$ it shrinks; when $k < 0$ it also flips.',
          'The key insight: **every transformation can be described as a function on coordinates**. This is why transformations appear in both geometry and linear algebra — at advanced levels they are the same subject.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_4_Transformations',
        title: 'Geometric Transformations',
        mathBridge: 'Select a transformation type and adjust its parameters. Watch how each point of the shape follows the coordinate rule: translation adds a constant, reflection negates a coordinate, rotation applies the sine/cosine matrix. Notice that reflections and rotations preserve area and distance; dilation does not.',
      },
    ],
  },
  mentalModel: [
    'Circle = distance formula squared: every point (x,y) exactly r from center (h,k) gives (x−h)²+(y−k)²=r²',
    'Standard form reveals center and radius at a glance — completed square is the key to converting from expanded form',
    'Rigid transformations (translation, reflection, rotation) preserve shape and size — only position changes',
    'Rotation is why sine and cosine exist: the rotation matrix maps every point around the origin by angle θ',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The circle $(x - 2)^2 + (y + 5)^2 = 49$ has center and radius…',
      options: [
        'Center $(2, -5)$, radius $7$',
        'Center $(-2, 5)$, radius $49$',
        'Center $(2, 5)$, radius $7$',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The circle equation is derived from which foundational theorem?',
      options: [
        'The slope formula',
        'The Pythagorean theorem (via the distance formula)',
        'The quadratic formula',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A circle centered at the origin with radius $r$ has equation…',
      options: ['$x + y = r$', '$x^2 + y^2 = r^2$', '$x^2 + y^2 = r$'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Reflecting the point $(3, -4)$ over the $x$-axis gives…',
      options: ['$(-3, -4)$', '$(3, 4)$', '$(-3, 4)$'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Which transformation does NOT preserve the size of a shape?',
      options: ['Translation', 'Rotation', 'Dilation'],
      correct: 2,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The rotation matrix is built from sine and cosine because…',
      options: [
        'Sine and cosine were defined to describe rotation — that is their geometric origin',
        'Rotation requires multiplication, which sine and cosine speed up',
        'Sine and cosine only appear in trigonometry, not geometry',
      ],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Reflecting a point over the line $y = x$ maps $(a, b)$ to…',
      options: ['$(-a, -b)$', '$(b, a)$', '$(a, -b)$'],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A dilation by scale factor $\\frac{1}{2}$ about the origin maps $(6, 10)$ to…',
      options: ['$(3, 5)$', '$(12, 20)$', '$(-6, -10)$'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'To convert $x^2 + y^2 - 6x + 2y = 15$ to standard circle form, you should…',
      options: [
        'Factor out 2 from both sides',
        'Complete the square separately for $x$ and $y$, balancing each addition on both sides',
        'Divide every term by the leading coefficient',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A translation maps $(x, y) \\to (x + 4,\\ y - 3)$. Which statement is true?',
      options: [
        'The shape is reflected across a vertical line',
        'Every point shifts right 4 and down 3 — distances and angles are preserved',
        'The shape is scaled by a factor of 4 horizontally',
      ],
      correct: 1,
    },
  ],
};
