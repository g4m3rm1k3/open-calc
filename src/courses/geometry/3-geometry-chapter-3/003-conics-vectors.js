export default {
  id: 'geo-3-3',
  slug: 'conics-vectors',
  chapter: 'geometry-3',
  title: 'Conic Sections and Vectors',
  subtitle: 'Four curves from one cone, and direction with magnitude',
  tags: ['geometry', 'conics', 'vectors'],
  hook: {
    question: 'Why do planets orbit in ellipses rather than perfect circles?',
    realWorldContext: 'Kepler discovered in 1609 that planetary orbits are ellipses. The same mathematics describes satellite dishes (paraboloids), cooling towers (hyperbolas), and the trajectory of every thrown object. Conic sections are not obscure — they appear wherever curves meet physics.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**One cone, four curves.** A double cone extending infinitely in both directions can be sliced by a flat plane. Depending on the angle of the cut, the intersection is exactly one of four shapes: a circle, an ellipse, a parabola, or a hyperbola. These are the *conic sections*, and all four are described by algebraic equations of degree two.',
          'The angle of the cutting plane determines which curve you get: perpendicular to the axis gives a circle; tilted slightly gives an ellipse; tilted so the plane is parallel to exactly one side of the cone gives a parabola; tilted so the plane cuts both nappes of the cone gives a hyperbola.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Circle:}\\ (x-h)^2+(y-k)^2=r^2 \\qquad \\text{Ellipse:}\\ \\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}=1',
        caption: 'Standard forms — circle is an ellipse with a = b = r',
      },
      {
        type: 'math',
        tex: '\\text{Parabola:}\\ y=a(x-h)^2+k \\qquad \\text{Hyperbola:}\\ \\frac{(x-h)^2}{a^2}-\\frac{(y-k)^2}{b^2}=1',
        caption: 'The minus sign in the hyperbola equation is what causes two separate branches',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Ellipses** have two focal points. The defining property is that the sum of distances from any point on the ellipse to the two foci is constant. This is why a whisper at one focus of an elliptical room can be heard clearly at the other focus — sound waves reflecting off the wall converge there exactly.',
          '**Parabolas** have one focus and one directrix (a line). Every point on the parabola is equidistant from the focus and the directrix. This property means parallel incoming signals (like satellite signals or light from infinity) all reflect to the focus — which is why satellite dishes and telescope mirrors are paraboloids.',
          '**Hyperbolas** have two foci as well, but the *difference* of distances to the foci is constant. They appear in LORAN navigation, sonic booms, and cooling tower profiles.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_5_ConicSections',
        title: 'Conic Sections Explorer',
        mathBridge: 'Adjust the cutting plane angle to see each conic section emerge. Notice the transition from circle to ellipse to parabola to hyperbola — the eccentricity $e$ tracks how "stretched" each curve is. A circle has $e = 0$; an ellipse has $0 < e < 1$; a parabola has $e = 1$; a hyperbola has $e > 1$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Vectors: direction with magnitude.** A vector is a quantity that has both a size (magnitude) and a direction. On the coordinate plane, a vector $\\vec{v} = \\langle a, b \\rangle$ points $a$ units horizontally and $b$ units vertically from its tail to its tip.',
          'The **magnitude** (length) of a vector is computed exactly like the distance formula:',
        ],
      },
      {
        type: 'math',
        tex: '|\\vec{v}| = \\sqrt{a^2 + b^2}',
        caption: 'Vector magnitude — the distance formula from the origin to (a, b)',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Vector addition** places vectors head to tail: $\\vec{u} + \\vec{v} = \\langle u_x + v_x,\\ u_y + v_y \\rangle$. This is why you add velocity components to find the resultant velocity of a boat crossing a current.',
          '**Scalar multiplication** stretches or shrinks a vector: $c\\,\\vec{v} = \\langle ca, cb \\rangle$. A negative scalar reverses direction.',
          'The **dot product** combines two vectors into a single number that encodes the angle between them:',
        ],
      },
      {
        type: 'math',
        tex: '\\vec{u} \\cdot \\vec{v} = u_x v_x + u_y v_y = |\\vec{u}||\\vec{v}|\\cos\\theta',
        caption: 'Dot product — the cosine formula: if the dot product is 0, the vectors are perpendicular',
      },
      {
        type: 'prose',
        paragraphs: [
          'The dot product equals zero when $\\cos\\theta = 0$, i.e., when $\\theta = 90°$ — the vectors are perpendicular. This is the algebraic test for perpendicularity in any dimension, not just 2D. A vector with magnitude 1 is called a **unit vector**; dividing any vector by its magnitude produces a unit vector in the same direction.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_6_Vectors',
        title: 'Vectors and the Dot Product',
        mathBridge: 'Drag the tips of $\\vec{u}$ and $\\vec{v}$. The dot product and angle update in real time. Set the vectors perpendicular — the dot product will read exactly $0$. Notice the geometric interpretation: the dot product measures how much one vector "projects onto" the other, scaled by the other\'s length.',
      },
    ],
  },
  mentalModel: [
    'Conic sections are slices of a cone — the cut angle determines whether you get a circle, ellipse, parabola, or hyperbola',
    'Ellipse: sum of focal distances is constant. Parabola: focus–point = directrix–point. Hyperbola: difference of focal distances is constant',
    'A vector has magnitude (distance formula) and direction — add component-wise, scale each component',
    'Dot product = 0 means perpendicular; the angle formula $\\cos\\theta = \\vec{u}\\cdot\\vec{v}/(|\\vec{u}||\\vec{v}|)$ works in any dimension',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Which conic section results when a plane cuts a cone parallel to exactly one side of the cone?',
      options: ['Ellipse', 'Parabola', 'Hyperbola'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An ellipse is defined as the set of points where the _______ of distances to two foci is constant.',
      options: ['product', 'difference', 'sum'],
      correct: 2,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The eccentricity of a parabola equals…',
      options: ['0', '1', 'Greater than 1'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does a satellite dish work? Its cross-section is a parabola because…',
      options: [
        'Parabolas are the strongest structural shape',
        'All incoming parallel rays reflect to the single focus of the parabola',
        'Parabolas have two foci that amplify signals',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'The vector $\\vec{v} = \\langle 3, 4 \\rangle$ has magnitude…',
      options: ['7', '5', '12'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The dot product $\\langle 2, -3 \\rangle \\cdot \\langle 3, 2 \\rangle$ equals…',
      options: ['0', '12', '-6'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Two vectors have a dot product of $0$. This means they are…',
      options: ['Parallel', 'Perpendicular', 'Equal in length'],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'The sum of vectors $\\langle 1, 3 \\rangle + \\langle 4, -1 \\rangle$ equals…',
      options: ['$\\langle 5, 2 \\rangle$', '$\\langle 4, -3 \\rangle$', '$\\langle 3, 4 \\rangle$'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'What equation identifies a hyperbola?',
      options: [
        '$\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ (plus sign)',
        '$\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ (minus sign)',
        '$y = ax^2 + bx + c$',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A unit vector is defined as a vector with…',
      options: ['Magnitude 0', 'Magnitude 1', 'Direction along the x-axis'],
      correct: 1,
    },
  ],
};
