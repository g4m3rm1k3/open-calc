export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-004',
  slug: 'null-space-and-column-space',
  chapter: 'la2',
  order: 4,
  title: 'Null Space and Column Space',
  subtitle: 'When a matrix destroys space, where does the debris go?',
  tags: ['null space', 'column space', 'kernel', 'image', 'rank', 'rank-nullity theorem'],
  aliases: 'kernel and image span of matrix dimension of matrix crushed vectors singular matrices',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 20,
  coreConcept: 'The "Column Space" represents all vectors a transformation can successfully reach. The "Null Space" represents all vectors that were crushed into the absolute origin during that transformation. Together, they conserve the total dimensionality of the space.',
  prerequisites: ['la2-003'],
  nextLesson: 'eigenvectors-and-eigenvalues',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you shine a flashlight entirely on a 3D object, it casts a 2D shadow. What happened mathematically to the vectors pointing straight toward the flashlight?",
    realWorldContext: "When an MRI machine takes scans of your brain, it captures a series of 2D cross-sections. In mathematical terms, the machine is applying a transformation that flattens 3D space into a 2D plane (the image you look at on the screen). That 2D screen is the exactly the 'Column Space' of the scanner's transformation. But what about the depth? Any vector pointing perfectly straight into the screen gets squashed flat into a single point: the origin. That collection of perfectly squashed vectors forms the 'Null Space'. By understanding exactly what the Null Space is, software engineers can write algorithms that computationally rebuild 3D 360-degree models from those flat MRI slices.",
    previewVisualizationId: 'LALesson07_NullSpace',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** We just saw that transformations with $\\det(A) = 0$ squish dimensions, destroying information irreparably. This lesson mathematically categorizes exactly *what* is destroyed and *what* survives.',
      'Suppose a $3 \\times 3$ matrix turns 3D space into a 2D flat plane. That remaining 2D plane is called the **Column Space** (or Image). It is simply the span of the columns of the matrix. Think of it as the set of all possible outputs the matrix can produce. If a point doesn\'t live on that 2D plane, there is simply no vector you can multiply by the matrix to ever reach it.',
      'The number of dimensions in the Column Space is called the **Rank**. In our example, the Rank is 2.',
      'But what happened to the 3rd dimension? It didn\'t just disappear into magic. Every single point along one specific 1D line in that 3D space got crushed directly into the exact origin $(0,0,0)$. This line of crushed casualties is called the **Null Space** (or Kernel).',
      'The **Null Space** is the set of all vectors $\\vec{v}$ that satisfy the equation $A\\vec{v} = \\vec{0}$.',
      'This brings us to one of the most beautiful balancing acts in mathematics: The Rank-Nullity Theorem. It states that the dimensions must add up. If you start with a 3D space, and your Column Space (Rank) is 2D, your Null Space must be a 1D line. $2 + 1 = 3$.',
      '**Where this is heading:** We now thoroughly understand how a matrix warps, stretches, and even destroys space. Our next chapter pivots from *what* the matrix does, to finding the special hidden vectors that are *immune* to the matrix\'s rotations—the Eigenvectors.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — Matrices & Transformations',
        body: '**Previous:** Determinants and Inverse Matrices.\n**This lesson:** Where space lands (Column Space) and what gets crushed to zero (Null Space).\n**Next (Phase 3):** Vectors that resist rotation entirely (Eigenvectors).',
      },
      {
        type: 'insight',
        title: 'Rank-Nullity Theorem',
        body: '$\\text{Rank } + \\text{ Nullity} = \\text{Total Dimensions (Columns)}$. Dimensions can be crushed, but they are never truly lost; they just get moved from the Column Space into the Null Space.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson07_NullSpace',
        title: 'Visualizing the Crushed Space',
        mathBridge: 'Observe the 3D space being flattened into a 2D plane. Step 1: Drag the camera to see how the Column Space (the purple plane) contains all final destinations. Step 2: Notice the glowing red line piercing straight through the plane. That is the Null Space. Every vector that started on that red line was physically crushed directly into the origin $(0,0,0)$.',
        caption: 'The Column Space is what survives. The Null Space is what gets crushed to zero.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Let $A$ be an $m \\times n$ matrix (meaning a transformation taking an $n$-dimensional input to an $m$-dimensional output).',
      'The **Column Space** $C(A)$ is the set of all possible linear combinations of the columns of $A$. Mathematically: $C(A) = \\{ A\\vec{x} \\mid \\vec{x} \\in \\mathbb{R}^n \\}$. It forms a valid subspace.',
      'To find the Column Space, you simply perform Row Reduction (Gaussian Elimination) to find the pivot columns. The *original* columns of $A$ that correspond to those pivots form the true basis for the Column Space.',
      'The **Null Space** $N(A)$ is the set of all vectors that result in the zero vector when multiplied by $A$. Mathematically: $N(A) = \\{ \\vec{x} \\in \\mathbb{R}^n \\mid A\\vec{x} = \\vec{0} \\}$.',
      'To find the Null Space, you solve the homogeneous equation $A\\vec{x} = \\vec{0}$ by row-reducing the augmented matrix $[A \\mid \\vec{0}]$. The free variables in your row-reduced form will perfectly define the vectors spanning the Null Space.'
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Column Space Trick',
        body: 'Do not use the columns of the row-reduced matrix as the basis for the Column Space! Row operations change the Column Space. You must trace the pivots back to the completely original matrix $A$.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Null Space and Column Space',
        mathBridge: 'np.linalg.matrix_rank(A) = number of pivot columns = dim(C(A)). Null space dimension = n − rank (rank-nullity theorem). scipy.linalg.null_space(A) computes a basis for N(A).',
        caption: 'Find what a matrix destroys (null space) and what it can reach (column space).',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rank — counting the independent directions',
              prose: [
                'The **rank** of A is the number of pivot columns — the dimension of the column space.',
                'The **rank-nullity theorem**: rank(A) + nullity(A) = n (number of columns).',
                'nullity = number of free variables = dimension of the null space.',
              ],
              code: `import numpy as np

# Full rank: det ≠ 0
A = np.array([[1., 2.], [3., 4.]])

# Rank-deficient: row 2 = 3 × row 1
B = np.array([[1., 2.], [3., 6.]])

print(f"rank(A) = {np.linalg.matrix_rank(A)}  (full rank, 2×2 → only the zero vector in null space)")
print(f"rank(B) = {np.linalg.matrix_rank(B)}  (rank 1, nullity = 2-1 = 1 → 1D null space)")
print()

# Rank-nullity theorem for B (2 columns)
rank_B = np.linalg.matrix_rank(B)
nullity_B = B.shape[1] - rank_B
print(f"rank(B) + nullity(B) = {rank_B} + {nullity_B} = {rank_B + nullity_B} = n ✓")`,
            },
            {
              id: 2,
              cellTitle: 'Computing the null space',
              prose: [
                'The null space is all vectors x such that Ax = 0.',
                '`scipy.linalg.null_space(A)` returns an orthonormal basis for N(A). Verify by checking A @ null_vec ≈ 0.',
              ],
              code: `import numpy as np
from scipy import linalg

# B has a 1D null space (row 2 = 3 × row 1)
B = np.array([[1., 2.],
              [3., 6.]])

null_B = linalg.null_space(B)
print("Null space basis vector:")
print(null_B)
print()

# Verify: B @ null_vec = 0
print("B @ null_vec =", (B @ null_B).round(10))
print("(all zeros → null space confirmed)")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Rank-nullity in action',
              difficulty: 'medium',
              prompt: 'For the matrix A below: (1) compute its rank, (2) compute the nullity (= n − rank), (3) find the null space basis using scipy.linalg.null_space, (4) verify each basis vector satisfies Av = 0.',
              code: `import numpy as np
from scipy import linalg

A = np.array([[1., 2., 3.],
              [2., 4., 6.],
              [1., 1., 2.]])

# 1. rank
# 2. nullity = n - rank (n = 3 columns)
# 3. null_space basis
# 4. verify each column of null_basis satisfies A @ col ≈ 0
`,
              hint: 'np.linalg.matrix_rank(A). null_basis = linalg.null_space(A). Each column of null_basis is a basis vector. Check np.allclose(A @ null_basis, 0).',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The Null Space and Column Space are formally defined as vector subspaces, meaning they are closed under addition and scalar multiplication.',
      'The Fundamental Theorem of Linear Algebra establishes profound orthogonality relationships between the four fundamental subspaces of a matrix. Specifically, it proves that the Null Space of $A$ is precisely the orthogonal complement to the Row Space of $A$. ($N(A) = C(A^T)^\\perp$).',
      'This guarantees that every vector $\\vec{x}$ in $n$-dimensional space can be perfectly split into two perpendicular parts: one part living in the row space (which gets mapped cleanly to the column space), and one part living in the null space (which gets destroyed).'
    ],
    callouts: [],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Analyzing a Squished Matrix",
      problem: "Find the basis for the Column Space and the Null Space of $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 6 \\end{bmatrix}$.",
      steps: [
        {
          expression: "\\begin{bmatrix} 1 & 2 \\\\ 3 & 6 \\end{bmatrix} \\xrightarrow{R_2 - 3R_1} \\begin{bmatrix} 1 & 2 \\\\ 0 & 0 \\end{bmatrix}",
          annotation: "Row reduce the matrix to easily see the pivots.",
          strategyTitle: "Row Reduction",
          checkpoint: "Which column has a pivot (a leading 1)?",
          hints: ["Only the first column has a pivot. The second column is a free variable."],
        },
        {
          expression: "C(A) = \\text{Span} \\left\\{ \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix} \\right\\}",
          annotation: "The first column is the pivot column. Thus, the FIRST ORIGINAL column forms the basis for the Column Space.",
          strategyTitle: "Extract Column Space",
          checkpoint: "What is the rank of this matrix?",
          hints: ["Since there is 1 basis vector, the Rank is 1. Space was squished to a 1D line."],
        },
        {
          expression: "1x_1 + 2x_2 = 0 \\implies x_1 = -2x_2",
          annotation: "To find the Null Space, convert the reduced matrix into an equation $A\\vec{x} = 0$.",
          strategyTitle: "Solve for Null Space",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\vec{x} = x_2 \\begin{bmatrix} -2 \\\\ 1 \\end{bmatrix} \\implies N(A) = \\text{Span} \\left\\{ \\begin{bmatrix} -2 \\\\ 1 \\end{bmatrix} \\right\\}",
          annotation: "Write the solution as a vector. Any multiple of this vector gets crushed to 0.",
          strategyTitle: "Extract Null Space",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The Rank is 1, and the Nullity is 1. (1 + 1 = 2 original dimensions). The Column space is the line spanned by [1, 3], and the Null space is the perpendicular line spanned by [-2, 1] that gets crushed."
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
      problem: "What is the Rank and Nullity of the $3\\times3$ Identity Matrix $I = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}$?",
      hint: "The identity matrix does not squish space at all. It leaves all 3 dimensions perfectly intact.",
      walkthrough: [
        {
          expression: "\\text{Rank}(I) = 3",
          annotation: "Since 3D space remains 3D space, the column space is all of R^3."
        },
        {
          expression: "\\text{Nullity}(I) = 0",
          annotation: "No vectors are crushed to the origin, except the origin itself."
        }
      ],
      answer: "Rank = 3, Nullity = 0"
    },
    {
      id: "ch-2",
      difficulty: "medium",
      problem: "A $5 \\times 7$ matrix has a Rank of 4. What is the dimension of its Null Space?",
      hint: "Use the Rank-Nullity theorem: Rank + Nullity = Number of Columns.",
      walkthrough: [
        {
          expression: "\\text{Rank} + \\text{Nullity} = n",
          annotation: "Set up the theorem. n is the number of completely original dimension inputs (the columns)."
        },
        {
          expression: "4 + \\text{Nullity} = 7",
          annotation: "Substitute the knowns."
        },
        {
          expression: "\\text{Nullity} = 3",
          annotation: "Solve. A 3-dimensional subspace is crushed into the origin."
        }
      ],
      answer: "3"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "C(A)",
        meaning: "Column Space. The span of the matrix's columns. Geometrically, the space of all possible outputs."
      },
      {
        symbol: "N(A)",
        meaning: "Null Space. The set of all vectors v where Av = 0."
      },
      {
        symbol: "\\text{Rank}(A)",
        meaning: "The number of dimensions mathematically surviving in the Column Space."
      }
    ],
    rulesOfThumb: [
      "If a matrix is invertible, its Rank is full (equal to n), and its Null Space contains ONLY the zero vector.",
      "If a matrix has a determinant of exactly 0, its Null Space has a dimension of at least 1.",
      "Rank + Nullity ALWAYS equals the total number of starting columns."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la2-003',
        label: 'Zero Determinant',
        note: 'If the concepts here feel murky, review Lesson 3. Matrices with a zero determinant are the ONLY square matrices that contain a non-empty Null Space.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la4-002',
        label: 'Singular Value Decomposition (SVD)',
        note: 'The four fundamental subspaces (including Null and Column spaces) are the core foundation required to understand SVD, the single most important algorithm in Machine Learning.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "assess-1",
        type: "input",
        text: "If a 4x4 matrix flattens 4D space into a completely flat 2D plane, what is the dimension of its Null Space? (Enter a number).",
        answer: "2",
        hint: "Rank-Nullity theorem: 2 (Rank) + X (Nullity) = 4 (Total Columns)."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Column Space: The survivor. What is left of the grid after the squish.",
    "Rank: How many dimensions the survivor has.",
    "Null Space: The graveyard. The vectors that were mercilessly crushed into the origin.",
    "Rank + Nullity = The original number of columns."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-1',
      type: 'choice',
      text: "If a 3x3 matrix has a Column Space of dimension 2 (it flattens space to a plane), what is the dimension of its Null Space?",
      options: [
        "0",
        "1",
        "2",
        "3"
      ],
      answer: "1",
      hints: ["The Rank-Nullity theorem tells us Rank + Nullity = Columns. 2 + x = 3."],
      reviewSection: 'Intuition tab — Rank-Nullity Theorem'
    },
    {
      id: 'quiz-2',
      type: 'choice',
      text: "Geometrically, what does it mean to be a vector in the Null Space of a transformation matrix A?",
      options: [
        "The vector is stretched to infinity.",
        "The vector is flipped perfectly backwards.",
        "The vector gets entirely crushed to the origin (0,0) during the transformation.",
        "The vector is pushed into an imaginary dimension."
      ],
      answer: "The vector gets entirely crushed to the origin (0,0) during the transformation.",
      hints: ["The definition of the Null Space is that A(v) = 0."],
      reviewSection: 'Intuition tab — The Graveyard'
    }
  ]
};
