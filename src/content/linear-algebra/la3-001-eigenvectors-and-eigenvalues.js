export default {
  id: 'la3.1',
  title: 'Eigenvectors and Eigenvalues',
  slug: 'eigenvectors-and-eigenvalues',
  chapter: 'la3',
  
  timeToComplete: 25,
  coreConcept: 'Most vectors are knocked off their original span during a linear transformation. Eigenvectors are the special vectors that stay perfectly on their original line, merely getting stretched or squished by a scalar factor called the eigenvalue.',
  prerequisites: ['la2.4'],
  nextLesson: 'diagonalization',

  previewVisualizationId: 'LALesson08_Eigen',
  
  hook: {
    question: "If you stretch a rubber sheet in two different directions, is there any line drawn on the sheet that doesn't change its angle?",
    options: [
      { id: "a", text: "No, everything twists.", isCorrect: false },
      { id: "b", text: "Yes, the exact lines along which you pull.", isCorrect: true, feedback: "Exactly. The lines of stretch are the eigenvectors of the rubber sheet's transformation." }
    ],
    explanation: "Eigenvectors are the invariant directions of a transformation - they define its true axes."
  },

  intuition: {
    text: "**Where you are in the story:** We spent Chapter 2 watching how matrices shear and rotate space wildly. In the chaos of a transformation, almost every vector is knocked off its original line. This lesson finds the calm inside the storm—the vectors that resist rotation.\n\nImagine a transformation $A$ acting on a space. Almost all vectors change their direction. But a few special vectors only get scaled (stretched, squished, or flipped), preserving their original line (span). \n\nThese are the **Eigenvectors**. The amount they are scaled by is their **Eigenvalue** $\\lambda$. For a 3D rotation around an axis, the axis itself is an eigenvector with eigenvalue $\\lambda=1$ because it doesn't move or stretch at all.",
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** The properties of matrices, null space, and column space.\n**This lesson:** The invariant vectors that define a matrix (Eigenvectors).\n**Next:** Changing our coordinates to align with eigenvectors (Diagonalization).'
      },
      {
        type: 'insight',
        title: 'The Core Equation',
        body: '$A\\vec{v} = \\lambda\\vec{v}$\n\nNotice that matrix multiplication on the left simply becomes scalar multiplication on the right.'
      }
    ],
    mathBridge: "Step 1: Rotate the input vector $\\vec{v}$ arbitrarily. See it get knocked off its line by the matrix $A$. Step 2: Stop rotating when $\\vec{v}$ aligns perfectly with its transformed self $A\\vec{v}$. The key lesson: when they align, you have found an eigenvector."
  },

  math: {
    text: "The defining equation is $A\\vec{v} = \\lambda\\vec{v}$. \n\nTo find $\\lambda$, we rearrange it: $(A - \\lambda I)\\vec{v} = 0$. Since eigenvectors must be non-zero, the matrix $(A - \\lambda I)$ must crush some space to 0. Thus, its determinant must be zero: $\\det(A - \\lambda I) = 0$.",
    callouts: []
  },

  rigor: {
    text: "Formally, let $A$ be an $n \\times n$ matrix. A scalar $\\lambda$ is an eigenvalue if there exists a non-zero vector $\\vec{v}$ in $\\mathbb{R}^n$ such that $A\\vec{v} = \\lambda \\vec{v}$. The set of all solutions for a given $\\lambda$ is called the eigenspace.",
    callouts: []
  },

  examples: [
    {
      id: "la3.1-ex1",
      title: "Finding Eigenvalues algebraically",
      description: "Finding $\\lambda$ using the characteristic equation.",
      steps: [
        {
          text: "Given $A = \\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$. We solve $\\det(A - \\lambda I) = 0$.",
          visualizationId: "LALesson08_Eigen"
        },
        {
          text: "$$\\det \\begin{bmatrix} 3-\\lambda & 1 \\\\ 0 & 2-\\lambda \\end{bmatrix} = (3-\\lambda)(2-\\lambda) - 0 = 0$$. So $\\lambda = 3$ and $\\lambda = 2$.",
          visualizationId: "LALesson08_Eigen"
        }
      ]
    }
  ],

  challenges: [
    {
      id: "challenge-la3.1",
      title: "Eigenvalues of the Identity",
      description: "What happens when you do nothing to space?",
      task: "What are the eigenvalues of the $2\\times 2$ identity matrix?",
      hints: [
        "If $I\\vec{v} = 1\\vec{v}$ for every vector, what is the scalar?"
      ],
      solution: {
        type: "text",
        value: "1"
      }
    }
  ],

  quiz: [
    {
      id: "la3.1-q1",
      question: "Why do we set $\\det(A - \\lambda I) = 0$ to find eigenvalues?",
      options: [
        { id: "a", text: "Because eigenvalues must be zero.", isCorrect: false },
        { id: "b", text: "Because we need the matrix to squish space into the origin so that a non-zero eigenvector gets mapped to zero.", isCorrect: true, feedback: "Correct! If $\\det \\neq 0$, the only solution to $(A - \\lambda I)\\vec{v}=0$ is the zero vector, which isn't an eigenvector." },
        { id: "c", text: "Because $I=0$.", isCorrect: false }
      ]
    }
  ]
};
