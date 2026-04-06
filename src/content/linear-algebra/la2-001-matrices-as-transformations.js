export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-001',
  slug: 'matrices-as-transformations',
  chapter: 'la2',
  order: 1,
  title: 'Matrices as Linear Transformations',
  subtitle: 'A matrix is not just a block of numbers—it is a machine that stretches, squishes, and rotates space.',
  tags: ['matrices', 'linear transformation', 'basis vectors', 'mapping', 'function'],
  aliases: 'matrix transformation linear mapping linear function warping space grid transformation',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 25,
  coreConcept: 'A matrix is a function that maps an input vector to an output vector. Geometrically, it transforms the entire coordinate space while keeping grid lines parallel and evenly spaced.',
  prerequisites: ['la1-002', 'la1-003'],
  nextLesson: 'matrix-multiplication',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you take a photo on your phone and want to skew it horizontally, how does the computer know where to move every single one of the 12 million pixels?",
    realWorldContext: "When an engineer designs a video game or an iPhone app, they don't write a loop that calculates the new position of every single pixel one by one. That would be far too slow. Instead, they define a 'Linear Transformation'—a single rule that universally twists and stretches the entire fabric of space. Because space is locked to a grid, the computer only needs to calculate where the two fundamental basis vectors move. Everything else just gets dragged along for the ride. The mathematical 'recipe' that holds the instructions for where those two basis vectors go is called a Matrix.",
    previewVisualizationId: 'LALesson04_Matrices',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** We spent Chapter 1 understanding vectors as static arrows living in a static space. But mathematics is about verbs, not just nouns. We want to actively warp, stretch, and rotate those spaces. For that, we need a mathematical "verb": the Matrix.',
      'Until now, you may have learned that a matrix is just a grid of data—like a spreadsheet. That is the Computer Science view. The Geometric view is much more powerful: a matrix is a *function* that transforms space.',
      'Think of a matrix as a machine. You feed it an input vector, it runs a spatial transformation, and it spits out a new, warped output vector.',
      'However, a **Linear Transformation** has strict visual rules to prevent the space from wrinkling or tearing. Exactly two things must remain true after the space is warped:',
      '1. The origin $(0,0)$ must remain absolutely fixed in place.',
      '2. All straight lines must remain straight and evenly spaced. The grid can be stretched, rotated, or sheared, but it must remain a uniform grid.',
      'Because the grid remains uniform, you don\'t need to track where every point goes. If you know exactly where the basis vectors $\\hat{i} = [1, 0]$ and $\\hat{j} = [0, 1]$ land after the transformation, you know where *everything* lands. The matrix is just a cheat sheet that records the new coordinates of $\\hat{i}$ and $\\hat{j}$.',
      '**Where this is heading:** Once we grasp what ONE matrix does to a space, we will see what happens when we chain multiple matrices together (Matrix Multiplication), and what happens when we try to reverse them (Matrix Inverses).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 4 — Matrices & Transformations',
        body: '**Previous (Phase 1):** The properties of static vectors and spans.\n**This lesson:** Matrices as active functions that stretch and warp space.\n**Next:** Chaining transformations together via Matrix Multiplication.',
      },
      {
        type: 'insight',
        title: 'The Secret of the Columns',
        body: 'The columns of a matrix tell you EXACTLY where the basis vectors $\\hat{i}$ and $\\hat{j}$ land. The first column is the new home of $\\hat{i}$. The second column is the new home of $\\hat{j}$. This is the most crucial insight in all of linear algebra.',
      },
      {
        type: 'warning',
        title: 'Not all curves are linear',
        body: 'A transformation that bends the axes into waves or shifts the origin (like adding +2 to all X coordinates) is NOT a linear transformation.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson04_Matrices',
        title: 'Warping the Grid',
        mathBridge: 'Observe the standard grid. The red arrow is $\\hat{i}$ and the green arrow is $\\hat{j}$. Click the matrix buttons below the visualization to apply different transformations (like Shear or Rotate). Watch how the entire pink grid morphs. Notice that the final coordinates of the red and green arrows perfectly match the columns of the matrix you applied.',
        caption: 'A linear transformation morphs the entire plane uniformly, dictated entirely by where the basis vectors land.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'A 2D linear transformation relies on $2 \\times 2$ matrices. When applying a matrix $A$ to an input vector $\\vec{v}$, the output vector is written as $A\\vec{v}$.',
      'Let\'s build a matrix $A$. Suppose we want to transform space such that $\\hat{i}$ lands at $[a, c]$ and $\\hat{j}$ lands at $[b, d]$. We simply paste those landing coordinates in as the *columns* of our matrix:',
      '$ A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} $',
      'Now, suppose we want to know where a specific input vector $\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix}$ lands. Remember that $\\vec{v}$ is just a set of instructions: "Take $x$ steps along $\\hat{i}$ and $y$ steps along $\\hat{j}$".',
      'Because the grid lines remain straight and evenly spaced, the new vector will just take $x$ steps along the *new* $\\hat{i}$ and $y$ steps along the *new* $\\hat{j}$. Algebraically, we are just taking a linear combination of the columns of the matrix:',
      '$ \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = x\\begin{bmatrix} a \\\\ c \\end{bmatrix} + y\\begin{bmatrix} b \\\\ d \\end{bmatrix} $',
      'This equation is the definition of Matrix-Vector multiplication. It proves that a matrix just scales and adds its own columns based on the input vector\'s coordinates.'
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Matrix-Vector Product Formula',
        body: '$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} ax + by \\\\ cx + dy \\end{bmatrix}$',
      },
      {
        type: 'strategy',
        title: 'Rows vs Columns',
        body: 'Many textbooks teach matrix multiplication as "multiply the rows by the columns" and taking a dot product. While true for computing, the "Linear Combination of Columns" perspective shown above is far better for geometric intuition.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Matrices as Transformations',
        mathBridge: 'A @ v is matrix-vector multiplication. The columns of A tell you where î and ĵ land. fig.transformed_grid([[a,b],[c,d]]) draws the warped coordinate system.',
        caption: 'Apply transformations to vectors and visualize how the grid warps.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix-vector multiplication — where does a vector land?',
              prose: [
                'The `@` operator is matrix multiplication in NumPy. `A @ v` applies transformation A to vector v.',
                'The columns of A tell you where î = [1,0] and ĵ = [0,1] land. Any other vector\'s destination is a linear combination of those columns.',
              ],
              code: `import numpy as np

# A rotation 90° counterclockwise: î→[0,1], ĵ→[-1,0]
A = np.array([[0.0, -1.0],
              [1.0,  0.0]])

# Where does each basis vector land?
i_hat = np.array([1.0, 0.0])
j_hat = np.array([0.0, 1.0])

print("î lands at:", A @ i_hat, " (first column of A)")
print("ĵ lands at:", A @ j_hat, " (second column of A)")
print()

# Where does v = [3, 1] land?
v = np.array([3.0, 1.0])
print(f"v = {v} lands at: {A @ v}")
print(f"Verify: 3 × (A@î) + 1 × (A@ĵ) = {3*(A@i_hat) + 1*(A@j_hat)}")`,
            },
            {
              id: 2,
              cellTitle: 'Visualize: the transformed grid',
              prose: [
                '`fig.transformed_grid(matrix)` draws the coordinate grid after the transformation.',
                'The red arrow shows where î lands; the green arrow shows where ĵ lands.',
                'Try changing the matrix below to a shear [[1,1],[0,1]] or a scale [[2,0],[0,0.5]] and re-run.',
              ],
              code: `from opencalc import quick_transform

# 90° rotation
rotation = [[0, -1], [1, 0]]
quick_transform(rotation, vector=[2, 1])`,
            },
            {
              id: 3,
              cellTitle: 'Common transformations',
              prose: [
                'Every 2×2 matrix is a transformation. Here are the most common ones — each described by where î and ĵ land.',
              ],
              code: `import numpy as np

transformations = {
    "90° rotation":  np.array([[0., -1.], [1., 0.]]),
    "Reflect x-axis": np.array([[1., 0.], [0., -1.]]),
    "Horizontal shear": np.array([[1., 1.], [0., 1.]]),
    "Scale 2x, 0.5y": np.array([[2., 0.], [0., 0.5]]),
    "Project to x-axis": np.array([[1., 0.], [0., 0.]]),
}

v = np.array([2.0, 1.0])
print(f"Input vector: {v}")
print()
for name, T in transformations.items():
    print(f"{name}: {T @ v}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Build a transformation matrix',
              difficulty: 'medium',
              prompt: 'Build a matrix A that sends î = [1,0] to [2, 1] and ĵ = [0,1] to [-1, 3]. Then apply it to the vector [4, 2] and visualize the result using quick_transform.',
              code: `import numpy as np
from opencalc import quick_transform

# Columns of A are where î and ĵ land
A = np.array([[2., -1.],
              [1.,  3.]])

v = np.array([4.0, 2.0])

# Apply A to v
# Then visualize: quick_transform(A.tolist(), vector=v.tolist())
`,
              hint: 'The columns of A are directly the images of î and ĵ. A = [[2,-1],[1,3]] means first column is where î goes, second column is where ĵ goes. A.tolist() converts to plain lists for quick_transform.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'Formally, a transformation $T: V \\to W$ is defined as "Linear" if and only if it satisfies two specific properties for all vectors $\\vec{u}, \\vec{v}$ and all scalars $c$:',
      '1. Additivity: $T(\\vec{u} + \\vec{v}) = T(\\vec{u}) + T(\\vec{v})$',
      '2. Homogeneity: $T(c\\vec{v}) = cT(\\vec{v})$',
      'These two rules mathematically guarantee that grid lines remain straight and evenly spaced, and that the origin stays at the origin (since $T(0\\vec{v}) = 0T(\\vec{v}) = \\vec{0}$).',
      'Every single linear transformation between finite-dimensional vector spaces can be represented as a matrix multiplication, and every matrix multiplication represents a linear transformation. They are completely isomorphic concepts.',
    ],
    callouts: [],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Applying a Matrix Transformation",
      problem: "Let $A = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix}$. Find the transformed output of the vector $\\vec{v} = \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix}$.",
      steps: [
        {
          expression: "A\\vec{v} = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix} \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix}",
          annotation: "Set up the multiplication.",
          strategyTitle: "Setup",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "= 4 \\begin{bmatrix} 2 \\\\ 0 \\end{bmatrix} + 1 \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}",
          annotation: "Rewrite as a linear combination of the columns. The input vector's components act as the scalars.",
          strategyTitle: "Linear combination form",
          checkpoint: "What is 4 times the first column?",
          hints: ["4 * [2, 0] = [8, 0]"],
        },
        {
          expression: "= \\begin{bmatrix} 8 \\\\ 0 \\end{bmatrix} + \\begin{bmatrix} -1 \\\\ 3 \\end{bmatrix}",
          annotation: "Perform the scalar multiplication.",
          strategyTitle: "Scale",
          checkpoint: "Add the two resulting vectors together.",
          hints: [],
        },
        {
          expression: "= \\begin{bmatrix} 7 \\\\ 3 \\end{bmatrix}",
          annotation: "Add the vectors to find the final landing location.",
          strategyTitle: "Vector addition",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The output vector lands at [7, 3]. Notice that we just took 4 of the new 'i-hat' vectors and 1 of the new 'j-hat' vectors."
    },
    {
      id: "ex-2",
      title: "Building a Matrix from Geometry",
      problem: "Construct a $2 \\times 2$ matrix that rotates the entire 2D plane $90^\\circ$ counter-clockwise.",
      steps: [
        {
          expression: "\\hat{i}_{new} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}",
          annotation: "Figure out where the horizontal basis vector [1, 0] lands after a 90-degree counter-clockwise turn. It points straight up.",
          strategyTitle: "Track i-hat",
          checkpoint: "Where does the vertical vector [0, 1] go if you rotate it 90 degrees CCW?",
          hints: ["It falls over to the left, landing on the negative x-axis."],
        },
        {
          expression: "\\hat{j}_{new} = \\begin{bmatrix} -1 \\\\ 0 \\end{bmatrix}",
          annotation: "Figure out where the vertical basis vector [0, 1] lands.",
          strategyTitle: "Track j-hat",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "A = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}",
          annotation: "Paste those two landing vectors in as the columns of the matrix.",
          strategyTitle: "Construct Matrix",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "This is the 90-degree rotation matrix. If you multiply ANY vector by this matrix, it will output a vector rotated perfectly by 90-degrees CCW."
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
      problem: "Calculate the output of $\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 \\\\ -2 \\end{bmatrix}$.",
      hint: "Take 5 times the first column [1, 3], and add it to -2 times the second column [2, 4].",
      walkthrough: [
        {
          expression: "5 \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix} + (-2) \\begin{bmatrix} 2 \\\\ 4 \\end{bmatrix}",
          annotation: "Write as a linear combination of the columns."
        },
        {
          expression: "\\begin{bmatrix} 5 \\\\ 15 \\end{bmatrix} + \\begin{bmatrix} -4 \\\\ -8 \\end{bmatrix}",
          annotation: "Scale the columns."
        },
        {
          expression: "\\begin{bmatrix} 1 \\\\ 7 \\end{bmatrix}",
          annotation: "Add them together."
        }
      ],
      answer: "\\begin{bmatrix} 1 \\\\ 7 \\end{bmatrix}"
    },
    {
      id: "ch-2",
      difficulty: "medium",
      problem: "Construct a matrix that shrinks space by half horizontally, but leaves everything unchanged vertically.",
      hint: "Where does [1,0] go? Where does [0,1] go? Make those your columns.",
      walkthrough: [
        {
          expression: "\\hat{i} \\to \\begin{bmatrix} 0.5 \\\\ 0 \\end{bmatrix}",
          annotation: "Since horizontal scale is halved, i-hat shrinks to 0.5."
        },
        {
          expression: "\\hat{j} \\to \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}",
          annotation: "Vertical scale is unchanged, so j-hat stays where it is."
        },
        {
          expression: "\\begin{bmatrix} 0.5 & 0 \\\\ 0 & 1 \\end{bmatrix}",
          annotation: "Paste into columns."
        }
      ],
      answer: "\\begin{bmatrix} 0.5 & 0 \\\\ 0 & 1 \\end{bmatrix}"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "A\\vec{v}",
        meaning: "Applying the transformation matrix A to the input vector v."
      },
      {
        symbol: "T(\\vec{v})",
        meaning: "A linear transformation function T acting on vector v. Functionally identical to a matrix multiplication."
      }
    ],
    rulesOfThumb: [
      "The columns of a matrix tell you where the standard basis vectors land.",
      "Matrix-vector multiplication is just a linear combination of the matrix's columns.",
      "If the grid lines curve after a transformation, it is NOT a linear transformation."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-002',
        label: 'Linear Combinations',
        note: 'If taking a linear combination of columns feels strange, review Lesson 2. Matrix multiplication is entirely built upon linear combinations.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la3-001',
        label: 'Eigenvectors',
        note: 'When you warp space with a matrix, most vectors get knocked off their original span. Eigenvectors are the rare, special vectors that miraculously stay on their own line during the warp.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "assess-1",
        type: "input",
        text: "What matrix does absolutely nothing to space? (The Identity Matrix). Provide the top row first, then bottom row.",
        answer: "[[1, 0], [0, 1]]",
        hint: "Where must i-hat and j-hat go if nothing changes? i-hat stays at [1, 0] and j-hat stays at [0, 1]."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "A matrix is a VERB. It is an action you perform on a space.",
    "First column = new home for horizontal unit vector.",
    "Second column = new home for vertical unit vector.",
    "Matrix multiplication = Linear combination of columns."
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
      text: "Geometrically, what do the columns of a 2x2 transformation matrix represent?",
      options: [
        "The coordinate destinations where the starting basis vectors (i-hat and j-hat) land.",
        "The x and y components of the output vector.",
        "The angle of rotation applied to the space.",
        "The eigenvalues of the matrix."
      ],
      answer: "The coordinate destinations where the starting basis vectors (i-hat and j-hat) land.",
      hints: ["The entire transformation is defined uniquely by tracking the basis vectors."],
      reviewSection: 'Intuition tab — The Secret of the Columns'
    },
    {
      id: 'quiz-2',
      type: 'choice',
      text: "Which of the following is NOT a requirement for a transformation to be considered 'Linear'?",
      options: [
        "The origin (0,0) must remain at (0,0).",
        "Grid lines must remain parallel and evenly spaced.",
        "The area of the space must remain unchanged.",
        "If you scale an input vector by 2, the output vector will also be scaled by 2."
      ],
      answer: "The area of the space must remain unchanged.",
      hints: ["A linear transformation can stretch or squish the area of the grid (we will measure this change in area later using Determinants). But it cannot bend the grid lines."],
      reviewSection: 'Intuition tab — Linear Transformation Definition'
    }
  ]
};
