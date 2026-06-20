export default {
  id: 'geo-5-2',
  slug: 'pythagorean-distance',
  chapter: 'geometry-5',
  title: 'The Pythagorean Theorem and Distance',
  subtitle: 'The most-proved theorem in mathematics — and why it extends to three dimensions',
  tags: ['geometry', 'pythagorean-theorem', 'distance', 'right-triangle', 'hypotenuse', '3D'],
  hook: {
    question: 'How do you measure the straight-line distance between two points in 3D space?',
    realWorldContext: 'GPS satellites compute your position using 3D distance formulas. Video game engines check collision by computing distances between objects. The Pythagorean theorem is in every navigation system, physics engine, and computer graphics card on the planet.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The Pythagorean Theorem.** In any right triangle, the square of the hypotenuse (the side opposite the right angle) equals the sum of the squares of the other two sides (the legs):',
        ],
      },
      {
        type: 'math',
        tex: 'a^2 + b^2 = c^2',
        caption: 'where c is the hypotenuse and a, b are the legs',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Why it is true — the area proof.** Arrange four copies of the right triangle (legs $a$ and $b$, hypotenuse $c$) inside a large square of side $(a + b)$. The four triangles leave a tilted inner square whose side is $c$. The large square has area $(a + b)^2 = a^2 + 2ab + b^2$. The four triangles together have area $4 \\cdot \\frac{1}{2}ab = 2ab$. The inner square has area $(a+b)^2 - 2ab = a^2 + b^2$. But its side is $c$, so its area is also $c^2$. Therefore $a^2 + b^2 = c^2$.',
          'There are over 370 known proofs of the Pythagorean theorem — more than any other result in mathematics. U.S. President James Garfield published his own proof in 1876.',
        ],
      },
      {
        type: 'viz',
        id: 'G1_6_Pythagorean',
        title: 'Pythagorean Theorem Explorer',
        mathBridge: 'Drag the legs $a$ and $b$ to any lengths. The squares built on each side — area $a^2$, $b^2$, and $c^2$ — update instantly. The blue and red squares always together equal the green square. This visual proof is almost 2,500 years old: it\'s in Euclid\'s *Elements*, Book I, Proposition 47.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The Converse.** If $a^2 + b^2 = c^2$ for the three sides of a triangle, then the triangle has a right angle opposite side $c$. This is how you test whether a triangle is right-angled: check the equation. Ancient Egyptians knotted ropes in a 3-4-5 ratio to create right angles for surveying.',
          '**Pythagorean triples** are integer solutions to $a^2 + b^2 = c^2$. Common examples: $(3,4,5)$, $(5,12,13)$, $(8,15,17)$, $(7,24,25)$. Any multiple of a triple is also a triple: $(6,8,10)$, $(9,12,15)$, etc.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Extending to the coordinate plane.** Two points $(x_1, y_1)$ and $(x_2, y_2)$ define a right triangle: horizontal leg $\\Delta x = x_2 - x_1$, vertical leg $\\Delta y = y_2 - y_1$, and the straight-line distance $d$ is the hypotenuse. Apply $a^2 + b^2 = c^2$:',
        ],
      },
      {
        type: 'math',
        tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
        caption: 'The 2D distance formula — Pythagoras applied to coordinates',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The 3D distance formula.** In three-dimensional space, a point has three coordinates $(x, y, z)$. To find the distance between $(x_1, y_1, z_1)$ and $(x_2, y_2, z_2)$, apply Pythagoras twice: first find the horizontal distance in the $xy$-plane, then apply Pythagoras again with the vertical $z$-component:',
        ],
      },
      {
        type: 'math',
        tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}',
        caption: '3D distance formula — one more squared term, same structure',
      },
      {
        type: 'prose',
        paragraphs: [
          'The pattern generalizes to any number of dimensions: $n$-dimensional distance has $n$ squared difference terms under the square root. This is why the Pythagorean theorem appears in machine learning (computing distances between data points in hundreds of dimensions), physics (spacetime intervals), and computer graphics (3D rendering).',
          '**Special right triangles.** Two common right triangles have exact, memorable side ratios that appear constantly:',
          '**45-45-90 triangle** (isosceles right triangle): legs $a$ and $a$, hypotenuse $a\\sqrt{2}$. If $a = 1$, the hypotenuse is $\\sqrt{2} \\approx 1.414$.',
          '**30-60-90 triangle**: sides are in ratio $1 : \\sqrt{3} : 2$. The short leg (opposite 30°) has length $a$, the long leg (opposite 60°) has length $a\\sqrt{3}$, and the hypotenuse (opposite 90°) has length $2a$.',
        ],
      },
      {
        type: 'math',
        tex: '45\\text{-}45\\text{-}90:\\quad a,\\ a,\\ a\\sqrt{2} \\qquad\\qquad 30\\text{-}60\\text{-}90:\\quad a,\\ a\\sqrt{3},\\ 2a',
        caption: 'The two special right triangles — memorize the ratios, derive any value from a single side',
      },
    ],
  },
  mentalModel: [
    'Pythagorean theorem: a²+b²=c² for any right triangle. The hypotenuse is c (opposite the right angle)',
    '2D distance = √(Δx²+Δy²), 3D distance = √(Δx²+Δy²+Δz²) — each adds one squared-difference term',
    'Pythagorean triples: (3,4,5), (5,12,13), (8,15,17) and their multiples are integer right triangles',
    '45-45-90: sides a, a, a√2. 30-60-90: sides a, a√3, 2a. These two ratios appear in nearly every geometry problem',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A right triangle has legs $6$ and $8$. Its hypotenuse is…',
      options: ['10', '14', '$\\sqrt{28}$'],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The Pythagorean theorem applies to…',
      options: [
        'Any triangle',
        'Only right triangles',
        'Only triangles with integer sides',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A triangle has sides 5, 12, 13. Is it a right triangle?',
      options: [
        'No — you must measure the angle to determine',
        'Yes — $5^2 + 12^2 = 25 + 144 = 169 = 13^2$, so it satisfies $a^2 + b^2 = c^2$',
        'Only if the 90° angle is between the sides of length 5 and 12',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the distance between points $(1, 2)$ and $(4, 6)$?',
      options: ['5', '7', '$\\sqrt{7}$'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'What is the 3D distance between $(0, 0, 0)$ and $(1, 2, 2)$?',
      options: ['3', '5', '$\\sqrt{3}$'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A 45-45-90 triangle has a leg of length 7. Its hypotenuse is…',
      options: ['$7\\sqrt{2}$', '$7\\sqrt{3}$', '$14$'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'A 30-60-90 triangle has a short leg of $5$. Its hypotenuse is…',
      options: ['$5\\sqrt{3}$', '$10$', '$5\\sqrt{2}$'],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'In the area proof of the Pythagorean theorem, four congruent right triangles are placed inside a $(a+b)\\times(a+b)$ square. The inner tilted square has side length…',
      options: ['$a + b$', '$c$ (the hypotenuse)', '$\\sqrt{ab}$'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Which is a Pythagorean triple?',
      options: ['$(6, 7, 8)$', '$(8, 15, 17)$', '$(4, 5, 7)$'],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'The $n$-dimensional distance formula has how many squared terms under the square root?',
      options: ['Always 2', '$n$ — one for each coordinate axis', '$n - 1$'],
      correct: 1,
    },
  ],
};
