export default {
  id: 'la2.4',
  title: 'Null Space and Column Space',
  slug: 'null-space-and-column-space',
  chapter: 'la2',
  
  timeToComplete: 20,
  coreConcept: 'The column space represents all reachable points after a transformation. The null space tracks all vectors that were crushed into the origin during that transformation.',
  prerequisites: ['la2.3'],
  nextLesson: 'eigenvectors-and-eigenvalues',

  previewVisualizationId: 'LALesson07_NullSpace',
  
  hook: {
    question: "When a 3D space is squashed flat into a 2D shadow by a transformation, what happened to the vectors that used to point straight toward the light source?",
    options: [
      { id: "a", text: "They get arbitrarily long.", isCorrect: false },
      { id: "b", text: "They become entirely trapped at the origin (the null space).", isCorrect: true, feedback: "Yes! Any vector squished to zero length lands in the null space." }
    ],
    explanation: "Transformations with a zero determinant crush information into the origin. We categorize this 'crushed' information as the Null Space."
  },

  intuition: {
    text: "**Where you are in the story:** We saw that transformations with $\\det(A) = 0$ squish dimensions, losing information irreversibly. This lesson categorizes exactly *what* is lost and *what* remains.\n\nThe **Column Space** is the set of all possible outputs. It's the span of the matrix's columns. If a matrix crushes 3D space onto a 2D plane, that 2D plane is the column space. The dimension of this column space is called the **Rank**.\n\nThe **Null Space** (Kernel) is the set of all vectors that get smashed all the way to the absolute origin $\\vec{0}$ by the transformation. It is the casualties of the transformation. \n\n**Where this is heading:** We now know how space warps, squishes, and behaves under matrices. Next, we will use this framework to explore Eigenvalues - the vectors that remarkably stay perfectly aligned on their original axes during transformations.",
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — Matrices & Transformations',
        body: '**Previous:** Determinants (area scaling) and Inverses (undoing warps).\n**This lesson:** Where space lands (Column Space) and what gets crushed to zero (Null Space).\n**Next:** Vectors that resist rotation (Eigenvectors).'
      },
      {
        type: 'insight',
        title: 'Rank-Nullity Theorem',
        body: '$\\text{Rank}(A) + \\text{Nullity}(A) = \\text{Number of columns}$'
      }
    ],
    mathBridge: "Step 1: Rotate the plane to see the column space (what the 3D grid became). Step 2: Highlight the invisible line that got crushed directly into the origin. The key lesson: all vectors on that line formed the Null Space."
  },

  math: {
    text: "Let $A$ be an $m \\times n$ matrix. \nThe **Column Space** $C(A) = \\{ A\\vec{x} \\mid \\vec{x} \\in \\mathbb{R}^n \\}$. It is a subspace of $\\mathbb{R}^m$.\nThe **Null Space** $N(A) = \\{ \\vec{x} \\in \\mathbb{R}^n \\mid A\\vec{x} = 0 \\}$. It is a subspace of $\\mathbb{R}^n$.",
    callouts: []
  },

  rigor: {
    text: "The fundamental theorem of linear algebra establishes orthogonality relations among the fundamental subspaces: $C(A^T) \\perp N(A)$ and $C(A) \\perp N(A^T)$.",
    callouts: []
  },

  examples: [
    {
      id: "la2.4-ex1",
      title: "Analyzing a squished matrix",
      description: "Finding rank and nullity of a 2x2 matrix with linearly dependent columns.",
      steps: [
        {
          text: "Given $A = \\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\end{bmatrix}$. The columns are multiples. The Column Space is a 1D line along $[1, 2]^T$, so Rank = 1.",
          visualizationId: "LALesson07_NullSpace"
        },
        {
          text: "Solving $A\\vec{x} = 0$, we get $x_1 + 2x_2 = 0$. The Null Space is the line spanned by $[-2, 1]^T$, so Nullity = 1.",
          visualizationId: "LALesson07_NullSpace"
        }
      ]
    }
  ],

  challenges: [
    {
      id: "challenge-la2.4",
      title: "Rank of identity",
      description: "Calculate the rank.",
      task: "What is the rank of the $3\\times3$ identity matrix?",
      hints: [
        "The columns of the identity matrix form a basis for 3D space."
      ],
      solution: {
        type: "text",
        value: "3"
      }
    }
  ],

  quiz: [
    {
      id: "la2.4-q1",
      question: "If a 3x3 matrix has a Column Space of dimension 2 (it flattens space to a plane), what is the dimension of its Null Space?",
      options: [
        { id: "a", text: "0", isCorrect: false },
        { id: "b", text: "1", isCorrect: true, feedback: "Correct! The Rank-Nullity theorem 2 + 1 = 3 tells us a 1-dimensional line of vectors gets crushed into the origin." },
        { id: "c", text: "2", isCorrect: false }
      ]
    }
  ]
};
