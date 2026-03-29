export default {
  id: 'la2.3',
  title: 'Inverse Matrices and Determinants',
  slug: 'inverse-matrices',
  chapter: 'la2',
  
  timeToComplete: 25,
  coreConcept: 'The determinant measures exactly how much a transformation scales area (or volume). If the determinant is zero, space is squished down into a smaller dimension, meaning the transformation cannot be undone. If it is non-zero, the inverse matrix perfectly reconstructs the original space.',
  prerequisites: ['la2.2'],
  nextLesson: 'null-space-and-column-space',

  previewVisualizationId: 'LALesson06_Inverses',
  
  hook: {
    question: "If you sheer and stretch space heavily, can you always mathematically twist it exactly back to the way it was?",
    options: [
      { id: "a", text: "Yes, transformations are entirely reversible.", isCorrect: false },
      { id: "b", text: "No, if the determinant is 0, space is completely flattened and information is lost permanently.", isCorrect: true, feedback: "Exactly. A transformation with a determinant of 0 collapses dimensionality." }
    ],
    explanation: "Determinants measure scaling. Inverse matrices are the tools that reverse transformations."
  },

  intuition: {
    text: "**Where you are in the story:** We built spaces with span, warped them with matrices, and even chained multiple warps together. What if you make a mistake and need to reverse the warp? That's what an inverse is.\n\nImagine a matrix $A$ squishes space towards a line. This squishing involves an area scaling factor known as the **Determinant**, $\\det(A)$. If $\\det(A) = 2$, every 1x1 square doubles its area. If $\\det(A) = -1$, space is flipped like a mirror. But if $\\det(A) = 0$, an entire 2D plane collapses onto a 1D line. \n\nIf the determinant is not 0, a unique matrix $A^{-1}$ exists that perfectly unravels the transformation.",
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — Matrices & Transformations',
        body: '**Previous:** Chaining transformations via Matrix Multiplication.\n**This lesson:** Determinants (area scaling) and Inverses (undoing warps).\n**Next:** Exploring what happens when determinants hit zero (Null / Column space).'
      }
    ],
    mathBridge: "Step 1: Watch the area of the yellow unit square as you slide the transformation matrix. Step 2: Push the determinant to 0. Watch the square flatten to a line. The key lesson: A determinant of 0 destroys area irreparably."
  },

  math: {
    text: "The determinant of a $2 \\times 2$ matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ is $ad - bc$. \n\nThe inverse $A^{-1}$ satisfies $A^{-1}A = I$ (the identity matrix). For $2 \\times 2$, $A^{-1}$ is calculated as: $$\\frac{1}{ad-bc} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$$",
    callouts: []
  },

  rigor: {
    text: "Formally, let $A$ be an $n \\times n$ matrix. $A$ is invertible if and only if $\\det(A) \\neq 0$. If an inverse exists, it is unique and acts as both a left and right inverse: $A^{-1}A = AA^{-1} = I_n$.",
    callouts: []
  },

  examples: [
    {
      id: "la2.3-ex1",
      title: "Finding the Inverse",
      description: "Using the determinant to calculate $A^{-1}$.",
      steps: [
        {
          text: "Let $A = \\begin{bmatrix} 3 & 1 \\\\ 2 & 1 \\end{bmatrix}$. First, find $\\det(A) = (3)(1) - (1)(2) = 1$.",
          visualizationId: "LALesson06_Inverses"
        },
        {
          text: "$A^{-1} = \\frac{1}{1} \\begin{bmatrix} 1 & -1 \\\\ -2 & 3 \\end{bmatrix} = \\begin{bmatrix} 1 & -1 \\\\ -2 & 3 \\end{bmatrix}$.",
          visualizationId: "LALesson06_Inverses"
        }
      ]
    }
  ],

  challenges: [
    {
      id: "challenge-la2.3",
      title: "Zero Determinant",
      description: "Collapse the space.",
      task: "Given a 2x2 matrix with columns $[1, 2]$ and $[2, c]$. For what value of $c$ does the matrix have no inverse?",
      hints: [
        "Set the determinant $ad - bc$ to 0 and solve for c."
      ],
      solution: {
        type: "number",
        value: 4
      }
    }
  ],

  quiz: [
    {
      id: "la2.3-q1",
      question: "If a 3x3 transformation matrix has a determinant of 0, what does it mean geometrically?",
      options: [
        { id: "a", text: "The volume of objects increases infinitely.", isCorrect: false },
        { id: "b", text: "The 3D space is flattened into a 2D plane, a 1D line, or a 0D point.", isCorrect: true, feedback: "Correct! Information is lost." },
        { id: "c", text: "Space flips inside out.", isCorrect: false }
      ]
    }
  ]
};
