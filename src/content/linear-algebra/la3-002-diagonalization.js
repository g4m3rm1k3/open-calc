export default {
  id: 'la3.2',
  title: 'Change of Basis and Diagonalization',
  slug: 'diagonalization',
  chapter: 'la3',
  
  timeToComplete: 20,
  coreConcept: 'By changing our coordinate system to align with the eigenvectors of a transformation, the complicated matrix turns into a simple diagonal matrix where all computations become trivial scaling operations.',
  prerequisites: ['la3.1'],
  nextLesson: 'complex-eigenvalues',

  previewVisualizationId: 'LALesson09_Diagonalization',
  
  hook: {
    question: "How do you calculate a matrix taken to the 100th power, $A^{100}$, without performing a billion multiplications?",
    options: [
      { id: "a", text: "You can't. You must multiply them all.", isCorrect: false },
      { id: "b", text: "You change the coordinate system so the matrix becomes diagonal.", isCorrect: true, feedback: "Bingo. Diagonal matrix powers are just raising the numbers on the diagonal to that power." }
    ],
    explanation: "Diagonalizing a matrix separates its fundamental stretches from its complicated rotations."
  },

  intuition: {
    text: "**Where you are in the story:** We found the eigenvectors (the natural axes of a transformation). What if we entirely reconstruct our universe so that the $x$ and $y$ axes *are* the eigenvectors?\n\nIf we do this, the matrix $A$ stops being a messy mix of stretching and rotating. In this new coordinate system, it becomes a **Diagonal Matrix** $D$—a matrix with zeros everywhere except the diagonal. A diagonal matrix does absolutely nothing except perform straight scaling along the axes. \n\nThis is called **Change of Basis**. We rotate space with $P^{-1}$, scale it easily with $D$, and rotate it back with $P$. This creates the famous decomposition $A = PDP^{-1}$.\n\n**Where this is heading:** Not every matrix has real eigenvectors. Next, we look at ones that rotate space infinitely—complex eigenvalues.",
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** Finding invariant direction vectors (Eigenvectors).\n**This lesson:** Changing the basis so the matrix acts only as a scalar (Diagonalization).\n**Next:** What happens when eigenvalues require imaginary numbers (Complex Eigenvalues).'
      },
      {
        type: 'info',
        title: 'The PDP Inverse Sandwich',
        body: '$A^k = (PDP^{-1})^k = PD^kP^{-1}$. The middle inverses cancel out!'
      }
    ],
    mathBridge: "Step 1: Watch the messy grid transformation using standard basis coordinates. Step 2: Switch the grid so its lines match the eigenvectors. The key lesson: The exact same transformation is now just a clean diagonal stretch."
  },

  math: {
    text: "Let $A$ be an $n \\times n$ matrix with $n$ linearly independent eigenvectors. We place these eigenvectors into the columns of a matrix $P$. We place the corresponding eigenvalues on the diagonal of $D$.\n\nThe theorem asserts that $A = PDP^{-1}$. Thus, performing $A$ is identical to changing basis to eigenvectors ($P^{-1}$), scaling ($D$), and changing back ($P$).",
    callouts: []
  },

  rigor: {
    text: "Formally, an $n \\times n$ matrix $A$ is diagonalizable if and only if there exists a basis for $\\mathbb{R}^n$ consisting entirely of eigenvectors of $A$. If an eigenvalue has algebraic multiplicity greater than its geometric multiplicity (the dimension of its eigenspace), the matrix is *defective* and cannot be diagonalized.",
    callouts: []
  },

  examples: [
    {
      id: "la3.2-ex1",
      title: "Constructing $P$ and $D$",
      description: "Plugging the eigen-components into matrices.",
      steps: [
        {
          text: "Suppose $A$ has eigenvectors $\\vec{v}_1 = [1, 1]$ (with $\\lambda = 2$) and $\\vec{v}_2 = [-1, 1]$ (with $\\lambda = 3$).",
          visualizationId: "LALesson09_Diagonalization"
        },
        {
          text: "$P = \\begin{bmatrix} 1 & -1 \\\\ 1 & 1 \\end{bmatrix}$. $D = \\begin{bmatrix} 2 & 0 \\\\ 0 & 3 \\end{bmatrix}$. Therefore, $A = P D P^{-1}$.",
          visualizationId: "LALesson09_Diagonalization"
        }
      ]
    }
  ],

  challenges: [
    {
      id: "challenge-la3.2",
      title: "Diagonal Matrix Powers",
      description: "Compute $D^3$.",
      task: "If $D = \\begin{bmatrix} 2 & 0 \\\\ 0 & 5 \\end{bmatrix}$, what is the bottom-right entry of $D^3$?",
      hints: [
        "For diagonal matrices, simply raise the diagonal entries to the power."
      ],
      solution: {
        type: "text",
        value: "125"
      }
    }
  ],

  quiz: [
    {
      id: "la3.2-q1",
      question: "Which of the following matrices cannot be diagonalized into real numbers?",
      options: [
        { id: "a", text: "Identity matrix", isCorrect: false },
        { id: "b", text: "A 90-degree rotation matrix", isCorrect: true, feedback: "Correct! No real vector stays on its span during a 90-degree rotation. All real eigenvectors are missing." },
        { id: "c", text: "A uniform scaling matrix", isCorrect: false }
      ]
    }
  ]
};
