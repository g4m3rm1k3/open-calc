export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la1-002',
  slug: 'linear-combinations',
  chapter: 1,
  order: 2,
  title: 'Linear Combinations, Span, and Basis',
  subtitle: 'How to build entire mathematical universes by adding and scaling a few fundamental arrows.',
  tags: ['linear combinations', 'span', 'basis', 'linear independence', 'coordinates'],
  aliases: 'basis vectors scaling adding vectors spanning a space linearly dependent standard basis',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 20,
  coreConcept: 'Every vector in a space can be represented as a scaled sum (linear combination) of fundamental basis vectors. The set of all possible combinations forms the span.',
  prerequisites: ['la1-001'],
  nextLesson: 'dot-and-cross-products',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you only had two arrows, how could you reach any point on an infinite 2D plane?",
    realWorldContext: "Imagine you are programming a robot that can only move in two directions: exactly North, and exactly East. By moving North for a specific duration (scaling the North vector), stopping, and then moving East for another duration (scaling the East vector, then adding the two together), the robot can reach absolutely any point on the map. This is what a screen does: every pixel color you see is just a mixture of exactly three fundamental vectors: pure Red, pure Green, and pure Blue. By scaling how intensely each of those three colors shines, and adding them together, the screen can display over 16 million unique colors. This process of mixing foundational elements via scaling and adding is called a 'Linear Combination'.",
    previewVisualizationId: 'LALesson02_Combinations',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** In the last lesson, we defined what a vector is: an arrow in space or a list of numbers. But a single vector by itself is lonely. What happens when we take two vectors and allow ourselves to stretch them, squish them, and add them together end-to-end? We are about to build entire spaces from scratch.',
      'There are exactly two operations you are allowed to perform in linear algebra:',
      '1. **Scalar Multiplication:** Stretching or shrinking a vector. Taking an arrow and making it 3 times longer, or multiplying it by -1 to flip its direction perfectly backwards.',
      '2. **Vector Addition:** Placing the tail of one vector at the tip of another to find the combined result.',
      'When you do both of these things at once—scaling a bunch of vectors by some numbers and then adding them all together—you have created a **Linear Combination**.',
      'If you have two vectors, $\\vec{v}$ and $\\vec{w}$, ask yourself: "If I am allowed to scale and add these two vectors in every possible way, what set of points can I reach?" The answer is called the **Span**.',
      'If $\\vec{v}$ and $\\vec{w}$ point in totally different directions, you can reach every single point on the 2D plane. Their span is the entire 2D universe. But what if they point in the exact same direction? No matter how much you scale or add them, you are trapped on a single 1D line. The second vector isn\'t adding any new movement capability; it is redundant. We call that being **Linearly Dependent**.',
      'If the vectors point in different directions, they are **Linearly Independent**. When a set of vectors spans the entire space AND has zero redundancies, we call it a **Basis**. A basis is the absolute minimum number of building blocks you need to construct a universe.',
      '**Where this is heading:** The standard numbers we use for coordinates, like $[3, -2]$, are actually just a secret linear combination of a standard basis (3 steps right, 2 steps down). Later, when we start talking about Matrices, you will learn that a matrix is just a machine that moves the basis vectors to new locations, dragging all of space with them.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — Vectors & Spaces',
        body: '**Previous:** What vectors are and how we represent them geometrically and algebraically.\n**This lesson:** Combining vectors to construct space (Span, Basis, and Independence).\n**Next:** Vector multiplication geometries (Dot and Cross Products).',
      },
      {
        type: 'insight',
        title: 'The Coordinate Illusion',
        body: 'When you write $\\begin{bmatrix} 3 \\\\ -2 \\end{bmatrix}$, you are implicitly saying: "Take 3 copies of $\\hat{i}$ (the horizontal unit vector) and -2 copies of $\\hat{j}$ (the vertical unit vector)." Coordinates are just the scalar multipliers in a linear combination!',
      },
    ],
    visualizations: [
      {
        id: 'LALesson02_Combinations',
        title: 'Linear Combinations sweeping the Plane',
        mathBridge: 'Step 1: Adjust the scalar multipliers $c_1$ and $c_2$ using the sliders. Watch how the resulting blue vector $\\vec{v}$ moves. By changing $c_1$ and $c_2$, you can place the blue vector anywhere on the plane. The key lesson: all reachable points form the span.',
        caption: 'Building new vectors by scaling and adding basis vectors.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Algebraically, a linear combination of vectors $\\vec{v}_1, \\vec{v}_2, \\dots, \\vec{v}_n$ with scalar multipliers (weights) $c_1, c_2, \\dots, c_n$ is written as:',
      '$$ c_1\\vec{v}_1 + c_2\\vec{v}_2 + \\dots + c_n\\vec{v}_n $$',
      'The **Span** of a set of vectors in $\\mathbb{R}^n$ is the collection of all vectors that can be written in the form above. It is formally denoted as $\\text{Span}(\\vec{v}_1, \\vec{v}_2, \\dots, \\vec{v}_n)$.',
      'If no vector in the set can be written as a linear combination of the others, the set is **Linearly Independent**. A simple check in 2D or 3D: if one vector is just a scaled multiple of another (e.g., $[1, 2]$ and $[2, 4]$), they are dependent. They lie on the same line.',
      'A set of vectors forms a **Basis** for a vector space if they are (1) linearly independent, and (2) they span the space. In $\\mathbb{R}^n$, any basis must have exactly $n$ vectors. For example, the standard basis in $\\mathbb{R}^2$ is $\\hat{i} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$ and $\\hat{j} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$.'
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear Independence Formal Definition',
        body: 'Vectors $\\vec{v}_1, \\dots, \\vec{v}_n$ are linearly independent if and only if the vector equation: \n\n$$ c_1\\vec{v}_1 + c_2\\vec{v}_2 + \\dots + c_n\\vec{v}_n = 0 $$\n\nhas ONLY the trivial solution $c_1 = 0, c_2 = 0, \\dots, c_n = 0$.',
      },
      {
        type: 'strategy',
        title: 'Checking Dependence',
        body: 'If you can find ANY way to make the vectors sum to 0 where the constants aren\'t all zero, there is a redundancy. One vector is "collapsing" backward on the path created by the others.',
      },
    ],
    visualizations: [
      {
        id: 'LinearDependenceViz',
        title: 'Trapped on a Line',
        mathBridge: 'Observe two vectors $\\vec{v}_1$ and $\\vec{v}_2$ pointing along the exact same line. Try to adjust $c_1$ and $c_2$ to reach the red point hovering in 2D space. You cannot. The key lesson: Dependent vectors cannot span a higher dimension regardless of how many you add.',
        caption: 'Linearly dependent vectors collapse the span into a lower dimension.',
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The concept of a basis extends far beyond arrows in 2D space. Let $P_2$ be the vector space of all polynomials of degree 2 or less: $p(t) = a + bt + ct^2$.',
      'The standard basis for this space is the set of functions $S = \\{1, t, t^2\\}$. Every quadratic polynomial is exactly a linear combination of these three "vectors" (functions). By studying coordinates relative to a basis rather than studying the abstract objects themselves, mathematicians can convert problems about functions, differential equations, and signal processing into simple matrix algebra.',
      'The Dimension of a vector space is defined formally as the number of vectors in a basis for the space. If a space is spanned by a set of $n$ vectors, then any independent set in that space has at most $n$ vectors. If you have 3 vectors in $\\mathbb{R}^2$, they MUST be linearly dependent. You only need 2 to span the plane; the third is guaranteed to be redundant.',
    ],
    callouts: [],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Computing a Linear Combination",
      problem: "Given $\\vec{u} = \\begin{bmatrix} 1 \\\\ -2 \\end{bmatrix}$ and $\\vec{v} = \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}$, compute the linear combination $2\\vec{u} - \\vec{v}$.",
      steps: [
        {
          expression: "2 \\begin{bmatrix} 1 \\\\ -2 \\end{bmatrix} - \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}",
          annotation: "Substitute the column vectors into the expression.",
          strategyTitle: "Setup the equation",
          checkpoint: "What is 2 times vector u?",
          hints: ["Multiply every component inside u by 2."],
        },
        {
          expression: "\\begin{bmatrix} 2 \\\\ -4 \\end{bmatrix} - \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}",
          annotation: "Perform the scalar multiplication first.",
          strategyTitle: "Scalar multiplication",
          checkpoint: "How do you subtract vectors?",
          hints: ["Subtract the top components (2 - 3) and the bottom components (-4 - 1)."],
        },
        {
          expression: "\\begin{bmatrix} 2 - 3 \\\\ -4 - 1 \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ -5 \\end{bmatrix}",
          annotation: "Subtract component by component.",
          strategyTitle: "Vector addition/subtraction",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The resulting vector is [-1, -5]. Geometrically, we walked twice as far along u, then walked backward along v."
    },
    {
      id: "ex-2",
      title: "Checking for Linear Dependence",
      problem: "Determine if $\\vec{v}_1 = \\begin{bmatrix} 4 \\\\ 6 \\end{bmatrix}$ and $\\vec{v}_2 = \\begin{bmatrix} -2 \\\\ -3 \\end{bmatrix}$ are linearly independent.",
      steps: [
        {
          expression: "c_1 \\begin{bmatrix} 4 \\\\ 6 \\end{bmatrix} + c_2 \\begin{bmatrix} -2 \\\\ -3 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix}",
          annotation: "Set up the linear independence equation perfectly equal to zero.",
          strategyTitle: "The zero equation",
          checkpoint: "Can you find non-zero constants for c1 and c2 that make this true?",
          hints: ["Look at the relationship between the two vectors. Is one a multiple of another?"],
        },
        {
          expression: "1 \\cdot \\begin{bmatrix} 4 \\\\ 6 \\end{bmatrix} + 2 \\cdot \\begin{bmatrix} -2 \\\\ -3 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix}",
          annotation: "Notice that scaling vector 2 by exactly 2 cancels out vector 1.",
          strategyTitle: "Find a non-trivial solution",
          checkpoint: "Because we found c1=1 and c2=2 (which are not zero), what does this mean?",
          hints: [],
        }
      ],
      conclusion: "Because there is a non-trivial solution (the constants are not both zero), the vectors are Linearly Dependent. Geometrically, they lie on the exact same line."
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
      problem: "Compute the linear combination $3\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + 2\\begin{bmatrix} -1 \\\\ 4 \\end{bmatrix}$.",
      hint: "Scale both vectors first, then add the top components together, and the bottom components together.",
      walkthrough: [
        {
          expression: "\\begin{bmatrix} 6 \\\\ 3 \\end{bmatrix} + \\begin{bmatrix} -2 \\\\ 8 \\end{bmatrix}",
          annotation: "Perform the scalar multiplication: 3*2=6, 3*1=3, and 2*(-1)=-2, 2*4=8."
        },
        {
          expression: "\\begin{bmatrix} 6 - 2 \\\\ 3 + 8 \\end{bmatrix}",
          annotation: "Add the components row by row."
        },
        {
          expression: "\\begin{bmatrix} 4 \\\\ 11 \\end{bmatrix}",
          annotation: "Final addition."
        }
      ],
      answer: "\\begin{bmatrix} 4 \\\\ 11 \\end{bmatrix}"
    },
    {
      id: "ch-2",
      difficulty: "medium",
      problem: "Are the vectors $\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$ and $\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$ linearly independent?",
      hint: "Set up the equation c1[1,0] + c2[0,1] = [0,0]. Can c1 or c2 be anything other than zero?",
      walkthrough: [
        {
          expression: "c_1\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} + c_2\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix}",
          annotation: "Set up the standard independence test."
        },
        {
          expression: "\\begin{bmatrix} c_1 \\\\ c_2 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix}",
          annotation: "Combine the vectors on the left."
        },
        {
          expression: "c_1 = 0 \\text{ and } c_2 = 0",
          annotation: "Since the only solution is c1=0 and c2=0, they are independent."
        }
      ],
      answer: "Yes, they are linearly independent."
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "c_1\\vec{v}_1 + c_2\\vec{v}_2",
        meaning: "A linear combination of two vectors with scalar weights c1 and c2"
      },
      {
        symbol: "\\text{Span}(\\vec{v}_1, \\vec{v}_2)",
        meaning: "The set of all possible vectors generated by taking every linear combination"
      }
    ],
    rulesOfThumb: [
      "To combine vectors, scale them first, then add them component by component.",
      "If vectors point in the same direction or lie flat on the same plane, they are dependent.",
      "A basis gives you a coordinate system. A space can have infinite different bases."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-001',
        label: 'What is a vector?',
        note: 'Make sure you are comfortable visualizing a column matrix as an arrow before combining multiples of them.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la2-001',
        label: 'Matrices as Transformations',
        note: 'A matrix is actually just a compact way of writing a linear combination of its column vectors. The columns of a matrix tell you exactly where the basis vectors land.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "assess-1",
        type: "input",
        text: "Compute 2[1, 5] - [3, 2]. Write the top component first, then the bottom.",
        answer: "[-1, 8]",
        hint: "Scale the first vector to [2, 10], then subtract [3, 2]."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Scaling stretches arrows. Adding connects them tip-to-tail.",
    "Span = 'Everything I can possibly reach.'",
    "Independent = 'Every arrow adds a totally new direction.'",
    "Dependent = 'At least one arrow is redundant garbage.'",
    "Basis = 'Independent AND spans everything. The perfect toolkit.'"
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-1',
      type: 'choice',
      text: "What defines a 'basis' of a vector space?",
      options: [
        "Any set of vectors that has zeros in it.",
        "A set of linearly independent vectors that span the entire space.",
        "Any two vectors that are parallel.",
        "A set of dependant vectors that do not span the space."
      ],
      answer: "A set of linearly independent vectors that span the entire space.",
      hints: ["A basis is the minimal toolkit required to build a universe: no redundancies (independent) and reaches everywhere (spanning)."],
      reviewSection: 'Math tab — Basis definition'
    },
    {
      id: 'quiz-2',
      type: 'input',
      text: "If you have 3 vectors in a 2-Dimensional plane (like [1,0], [0,1], and [1,1]), are they guaranteed to be linearly dependent?",
      answer: "Yes",
      hints: ["A 2D plane only has 2 dimensions of freedom. Any third vector can always be reached by a combination of the first two."],
      reviewSection: 'Rigor tab — Dimension'
    }
  ]
};
