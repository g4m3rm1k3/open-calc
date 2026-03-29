export default {
  id: 'la3.3',
  title: 'Complex Eigenvalues',
  slug: 'complex-eigenvalues',
  chapter: 'la3',
  
  timeToComplete: 15,
  coreConcept: 'When a matrix purely rotates space, no real vector stays on its span. The mathematical necessity to find eigenvalues introduces complex numbers, revealing that complex eigenvalues correspond to rotation and spiraling behavior.',
  prerequisites: ['la3.2'],
  nextLesson: 'orthogonal-projections',

  previewVisualizationId: 'LALesson10_ComplexEigen',
  
  hook: {
    question: "If an eigenvector is a vector whose span doesn't change during a transformation, what are the eigenvectors of a 90-degree rotation?",
    options: [
      { id: "a", text: "The x and y axes.", isCorrect: false },
      { id: "b", text: "There are geometrically none. The math breaks.", isCorrect: false },
      { id: "c", text: "There are none in real numbers, forcing us to use complex numbers.", isCorrect: true, feedback: "Right! Rotations demand imaginary numbers to balance the equations." }
    ],
    explanation: "Complex eigenvalues appear whenever a transformation has an element of rotation."
  },

  intuition: {
    text: "**Where you are in the story:** We know that a matrix stretches space, and its eigenvectors are the 'true north' axes of that stretch. We also know we can use them to diagonalize the matrix. But what if a matrix *never* stretches, and *only* rotates?\n\nA 90-degree rotation rotates every single vector off its original span. According to geometry, there are no real eigenvectors. But algebra requires $\\det(A - \\lambda I) = 0$ to have solutions by the fundamental theorem of algebra. The roots must be complex numbers!\n\n**Where this is heading:** Knowing that rotation creates imaginary numbers, we can look at dynamic systems (like pendulums) and know immediately: if the eigenvalues are complex, the system oscillates. Next chapter, we tackle non-square matrices and projections.",
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** Matrix Diagonalization and change of basis.\n**This lesson:** Imaginary numbers arising from pure rotation.\n**Next:** Advancing to Orthogonal Projections.'
      },
      {
        type: 'insight',
        title: 'Rotation vs Scaling',
        body: 'Real part of $\\lambda$ = Stretching/Scaling\nImaginary part of $\\lambda$ = Rotation'
      }
    ],
    mathBridge: "Step 1: Shift the matrix slider from a 'Shear' to a 'Rotation'. Notice the real eigenvectors vanish from the 2D plane. Step 2: The complex plane is visualized. The key lesson: Rotation fundamentally moves information off the real line."
  },

  math: {
    text: "For a 90-degree counterclockwise rotation, $A = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$.\n\nThe characteristic equation: $\\det \\begin{bmatrix} -\\lambda & -1 \\\\ 1 & -\\lambda \\end{bmatrix} = \\lambda^2 - (-1)(1) = \\lambda^2 + 1 = 0$. \n\nThe solutions are $\\lambda = i$ and $\\lambda = -i$. Notice that they emerge as conjugate pairs.",
    callouts: []
  },

  rigor: {
    text: "Formally, if a real matrix $A$ has a complex eigenvalue $\\lambda = a + bi$, the corresponding eigenvector $\\vec{v}$ will also have complex entries. Geometrically, $a$ and $b$ define a scaling factor $r = \\sqrt{a^2+b^2}$ and an angle of rotation $\\theta = \\arctan(b/a)$.",
    callouts: []
  },

  examples: [
    {
      id: "la3.3-ex1",
      title: "Analyzing a complex eigenvalue",
      description: "Extracting the rotation angle.",
      steps: [
        {
          text: "Given an eigenvalue $\\lambda = 1 + i$. The real part is 1, imaginary is 1.",
          visualizationId: "LALesson10_ComplexEigen"
        },
        {
          text: "The rotation angle is $\\arctan(1/1) = 45^\\circ$. The scaling factor is $\\sqrt{1^2+1^2} = \\sqrt{2}$. Thus the space rotates $45^\\circ$ and expands.",
          visualizationId: "LALesson10_ComplexEigen"
        }
      ]
    }
  ],

  challenges: [
    {
      id: "challenge-la3.3",
      title: "The Angle of Imaginary Roots",
      description: "Given pure imaginary roots...",
      task: "If the eigenvalues are exactly $2i$ and $-2i$, what is the angle of rotation in degrees?",
      hints: [
        "What is $\\arctan(\\infty)$ or the position of the imaginary axis?"
      ],
      solution: {
        type: "text",
        value: "90"
      }
    }
  ],

  quiz: [
    {
      id: "la3.3-q1",
      question: "If a system is defined by a matrix with eigenvalues $0.5 + 0.1i$ and $0.5 - 0.1i$, what will happen to a vector placed in this space over time (multiplying repeatedly)?",
      options: [
        { id: "a", text: "It will spiral inward towards the origin.", isCorrect: true, feedback: "Correct! The magnitude $\\sqrt{0.5^2+0.1^2}$ is less than 1, so it shrinks, and the imaginary part makes it rotate (spiral)." },
        { id: "b", text: "It will stretch out in a straight line infinitely.", isCorrect: false },
        { id: "c", text: "It will sit perfectly still.", isCorrect: false }
      ]
    }
  ]
};
