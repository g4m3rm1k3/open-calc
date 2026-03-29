export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-003',
  slug: 'inverse-matrices',
  chapter: 2,
  order: 3,
  title: 'Inverse Matrices and Determinants',
  subtitle: 'How to play a transformation backwards, and why sometimes space is irreversibly flattened.',
  tags: ['inverse', 'determinant', 'singular matrix', 'identity matrix', 'area scaling'],
  aliases: 'reversing transformations ad-bc invertible singular non-invertible playing backwards',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 25,
  coreConcept: 'The determinant measures exactly how much a transformation scales area. If it is zero, space is squished into a lower dimension, and the transformation cannot be undone. If it is non-zero, an inverse matrix exists that perfectly rewinds the transformation.',
  prerequisites: ['la2-002'],
  nextLesson: 'null-space-and-column-space',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you squish space heavily with a matrix, can you always mathematically twist it back to exactly the way it was?",
    realWorldContext: "Imagine projecting a 3D video game onto your flat 2D computer screen. You lose the 'depth' (Z-axis). If I gave you just the flat image on the screen and asked, 'Exactly how far away was that character standing?', you couldn't tell me. A tall character far away looks identical to a short character up close. By squishing 3D down to 2D, information was permanently destroyed. In linear algebra, we use the 'Determinant' to measure exactly how much a matrix shrinks or expands space. If the determinant is exactly 0, it means the space was irreversibly flattened, and no 'Inverse' matrix can ever retrieve the lost information.",
    previewVisualizationId: 'LALesson06_Inverses',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** We built spaces, warped them with matrices, and even chained multiple warps together. But what if you need to reverse a warp? If matrix $A$ encrypts a vector into a new position, how do you decrypt it? You need an inverse matrix, $A^{-1}$.',
      'If you multiply a vector by $A$, and then immediately multiply it by $A^{-1}$, the vector should land exactly back where it started. Mathematically: $A^{-1}A\\vec{v} = \\vec{v}$.',
      'The matrix that "does nothing" to space is called the **Identity Matrix** ($I$). It has 1s on the diagonal and 0s elsewhere. So the definition of an inverse is a matrix that, when combined with the original, yields the Identity matrix: $A^{-1}A = I$.',
      'But here is the catch: **Not every matrix has an inverse.**',
      'To understand why, we need to talk about the **Determinant**, $\\det(A)$. The determinant is a single number that measures how much a transformation stretches or shrinks the area of space. If $\\det(A) = 2$, any shape drawn on the grid will perfectly double in area after the transformation. If $\\det(A) = -1$, the space was flipped over like a mirrored reflection.',
      'But what if $\\det(A) = 0$? This means the entire 2D plane was squished completely flat onto a single 1D line (or a 0D point). The area of the space is now exactly 0. You cannot "un-squish" a line back into a plane because infinite different points from the 2D plane all landed on the exact same spot on the line. You can\'t run the machine backwards if you don\'t know which unique point to send them back to!',
      '**Where this is heading:** If a matrix has a determinant of 0, it squishes everything into a lower-dimensional line. The next lesson explores exactly what that line is (the Column Space), and examines all the vectors that got destroyed in the process (the Null Space).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — Matrices & Transformations',
        body: '**Previous:** Chaining transformations via Matrix Multiplication.\n**This lesson:** Determinants (area scaling) and Inverses (undoing warps).\n**Next:** When determinants = 0 (Null Space and Column Space).',
      },
      {
        type: 'insight',
        title: 'Solving Systems of Equations',
        body: 'In high school, you solved $3x = 12$ by multiplying both sides by $1/3$ (the inverse of 3). In linear algebra, you solve the massive system of equations $A\\vec{x} = \\vec{v}$ by multiplying both sides by $A^{-1}$. It is the exact same concept scaled up to multiple dimensions!',
      },
    ],
    visualizations: [
      {
        id: 'LALesson06_Inverses',
        title: 'The Collapsing Determinant',
        mathBridge: 'Observe the yellow 1x1 unit square. Its area is exactly 1. As you slide the transformation matrix slider, watch the matrix morph. Note how the area of the yellow square perfectly matches the calculated Determinant at all times. Finally, push the slider until the columns become parallel (Dependent). Watch the determinant hit exactly 0 as the square flattens into a 1D line. The key lesson: A determinant of 0 destroys area irreparably.',
        caption: 'The determinant visually tracks the scaling factor of the grid\'s area.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'For a $2 \\times 2$ matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, the formula for the determinant is incredibly simple:',
      '$$ \\det(A) = ad - bc $$',
      'If $ad - bc$ equals $0$, the matrix is called **Singular**. It has no inverse.',
      'If $ad - bc \\neq 0$, the matrix is invertible, and the formula for $A^{-1}$ is:',
      '$$ A^{-1} = \\frac{1}{ad - bc} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix} $$',
      'Notice how the formula requires dividing by the determinant. This algebraic formula perfectly matches our geometric intuition: if the determinant is $0$, you would divide by $0$, which breaks math. You cannot invert a squished space.'
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Memorizing the 2x2 Inverse',
        body: 'To construct the inverse: Swap the main diagonal terms (a and d), make the other two terms negative (-b and -c), and scale the whole thing by 1 over the determinant.',
      },
      {
        type: 'warning',
        title: '3x3 Inverses',
        body: 'Do not try to memorize the formula for a $3 \\times 3$ inverse. It is a massive mess of algebra utilizing "Cofactor Expansion." In practice, computers use an algorithmic process called Gaussian Elimination to find larger inverses.',
      },
    ],
    visualizations: [],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'Formally, let $A$ be an $n \\times n$ square matrix. $A$ is invertible if and only if there exists an $n \\times n$ matrix $B$ such that $AB = BA = I_n$. If this $B$ exists, it is unique and denoted $A^{-1}$.',
      'The "Invertible Matrix Theorem" is a central pillar of linear algebra. It proves that for any square matrix $A$, the following statements are all logically equivalent (if one is true, they are all true):',
      '1. $A$ is an invertible matrix.',
      '2. $A$ has $n$ pivot positions (row-echelon form).',
      '3. The null space of $A$ contains only the zero vector.',
      '4. The columns of $A$ form a linearly independent set.',
      '5. The columns of $A$ perfectly span $\\mathbb{R}^n$.',
      '6. The determinant of $A$ is not zero.',
      'This theorem is the grand unification of everything you have learned so far.'
    ],
    callouts: [],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Finding an Inverse",
      problem: "Let $A = \\begin{bmatrix} 4 & 2 \\\\ 3 & 2 \\end{bmatrix}$. Find $A^{-1}$.",
      steps: [
        {
          expression: "\\det(A) = (4)(2) - (2)(3) = 8 - 6 = 2",
          annotation: "First, reliably compute the determinant ad - bc.",
          strategyTitle: "Calculate Determinant",
          checkpoint: "Because the determinant is 2, what does this tell us?",
          hints: ["Since 2 is not 0, the matrix is invertible, and space scales up by 2x."],
        },
        {
          expression: "\\begin{bmatrix} 2 & -2 \\\\ -3 & 4 \\end{bmatrix}",
          annotation: "Swap the main diagonal (4 and 2). Negate the off-diagonal (2 and 3).",
          strategyTitle: "Rearrange the matrix",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "A^{-1} = \\frac{1}{2} \\begin{bmatrix} 2 & -2 \\\\ -3 & 4 \\end{bmatrix} = \\begin{bmatrix} 1 & -1 \\\\ -1.5 & 2 \\end{bmatrix}",
          annotation: "Multiply the rearranged matrix by 1 over the determinant.",
          strategyTitle: "Scale by determinant",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The inverse matrix is [1, -1; -1.5, 2]. If you multiply this matrix by A, you will get the Identity matrix."
    },
    {
      id: "ex-2",
      title: "Solving a System",
      problem: "Given $A = \\begin{bmatrix} 4 & 2 \\\\ 3 & 2 \\end{bmatrix}$ (from above), solve the equation $A\\vec{x} = \\begin{bmatrix} 10 \\\\ 8 \\end{bmatrix}$ for the unknown vector $\\vec{x}$.",
      steps: [
        {
          expression: "A^{-1} A \\vec{x} = A^{-1} \\begin{bmatrix} 10 \\\\ 8 \\end{bmatrix}",
          annotation: "Multiply both sides of the equation by A-inverse ON THE LEFT.",
          strategyTitle: "Apply Inverse",
          checkpoint: "What does A-inverse * A simplify to?",
          hints: ["It becomes the Identity matrix, effectively canceling out."],
        },
        {
          expression: "\\vec{x} = \\begin{bmatrix} 1 & -1 \\\\ -1.5 & 2 \\end{bmatrix} \\begin{bmatrix} 10 \\\\ 8 \\end{bmatrix}",
          annotation: "Substitute the inverse we found in Example 1.",
          strategyTitle: "Substitute",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\vec{x} = \\begin{bmatrix} (1)(10) + (-1)(8) \\\\ (-1.5)(10) + (2)(8) \\end{bmatrix} = \\begin{bmatrix} 10 - 8 \\\\ -15 + 16 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}",
          annotation: "Perform the matrix multiplication.",
          strategyTitle: "Calculate vector",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The original input vector must have been [2, 1]. We played the transformation in reverse on the output vector [10, 8] to find where it started."
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
      problem: "Calculate the determinant of $\\begin{bmatrix} 5 & 3 \\\\ 4 & 2 \\end{bmatrix}$.",
      hint: "Use the formula ad - bc.",
      walkthrough: [
        {
          expression: "(5)(2) - (3)(4)",
          annotation: "Setup ad - bc."
        },
        {
          expression: "10 - 12",
          annotation: "Multiply."
        },
        {
          expression: "-2",
          annotation: "Subtract."
        }
      ],
      answer: "-2"
    },
    {
      id: "ch-2",
      difficulty: "medium",
      problem: "Given a $2 \\times 2$ matrix with columns $[1, 2]^T$ and $[3, c]^T$. For what value of $c$ does the matrix have NO inverse (is singular)?",
      hint: "A matrix is singular when its determinant is exactly 0. Set up the determinant equation with c, and set it equal to 0.",
      walkthrough: [
        {
          expression: "\\det \\begin{bmatrix} 1 & 3 \\\\ 2 & c \\end{bmatrix} = 0",
          annotation: "Set up the requirement for singularity."
        },
        {
          expression: "(1)(c) - (3)(2) = 0",
          annotation: "Apply the ad - bc formula."
        },
        {
          expression: "c - 6 = 0",
          annotation: "Simplify."
        },
        {
          expression: "c = 6",
          annotation: "Solve for c."
        }
      ],
      answer: "6"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "A^{-1}",
        meaning: "The inverse matrix. It perfectly undoes the transformation caused by A."
      },
      {
        symbol: "\\det(A)",
        meaning: "The determinant of A. The exact factor by which the transformation scales area/volume."
      },
      {
        symbol: "A^{-1}A = I",
        meaning: "Multiplying a matrix by its inverse yields the Identity matrix (no change)."
      }
    ],
    rulesOfThumb: [
      "If columns are linearly dependent (they lie on the same line), the determinant will always be 0.",
      "A determinant of exactly 0 is the mathematical equivalent of losing data permanently.",
      "If you see A(vector) = (output), never 'divide' by A. Multiply both sides by A-inverse."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-002',
        label: 'Linear Independence',
        note: 'The concept of linear independence from Lesson 2 is identical to having a non-zero determinant. If vectors are dependent, they collapse the span, making the determinant 0.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la3-001',
        label: 'Eigenvalues',
        note: 'When you try to find Eigenvectors, you will intentionally build a matrix with a determinant of exactly 0. You will leverage the very mathematical "destruction" we warned about today to solve equations seamlessly.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "assess-1",
        type: "input",
        text: "What is the determinant of the matrix [[1, 2], [2, 4]]?",
        answer: "0",
        hint: "(1*4) - (2*2) = 4 - 4."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Determinant > 1: Expands space.",
    "Determinant 0 to 1: Shrinks space.",
    "Determinant < 0: Flips space backwards.",
    "Determinant = 0: Flattens space. Irreversible.",
    "Inverse: Rewinds the VHS tape back to the start."
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
      text: "If a 3x3 transformation matrix has a determinant of 0, what does it physically mean geometrically?",
      options: [
        "The volume of objects increases infinitely.",
        "The 3D space is flattened into a 2D plane, a 1D line, or a 0D point.",
        "The entire space flips inside out like a mirror.",
        "The matrix only moves objects sideways."
      ],
      answer: "The 3D space is flattened into a 2D plane, a 1D line, or a 0D point.",
      hints: ["If area or volume goes to exactly 0, the space must have lost dimensions."],
      reviewSection: 'Intuition tab — Determinant of 0'
    },
    {
      id: 'quiz-2',
      type: 'choice',
      text: "If a matrix has linearly dependent columns (where the second column is just a scaled copy of the first), what will its determinant be?",
      options: [
        "Exactly 1.",
        "Exactly 0.",
        "You cannot know without doing the arithmetic.",
        "The same as its trace."
      ],
      answer: "Exactly 0.",
      hints: ["If the columns are dependent, they land on the same line. If the basis vectors land on the same line, the grid collapses and area is 0."],
      reviewSection: 'Semantics tab — Rules of Thumb'
    }
  ]
};
