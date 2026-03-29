export default {
  id: 'la4.2',
  title: 'Singular Value Decomposition (SVD)',
  slug: 'svd',
  chapter: 'la4',
  
  timeToComplete: 30,
  coreConcept: 'Every matrix—even non-square ones—can be broken apart into an orthogonal rotation, a diagonal scaling, and another orthogonal rotation. SVD reveals the core DNA of the transformation: its primary stretching directions and the magnitude of those stretches.',
  prerequisites: ['la4.1', 'la3.2'],
  nextLesson: '',

  previewVisualizationId: 'LALesson12_SVD',
  
  hook: {
    question: "If you have an incredibly noisy photograph, how can math 'know' which pixels form the main shapes and which pixels are just static?",
    options: [
      { id: "a", text: "It uses an AI.", isCorrect: false },
      { id: "b", text: "It breaks the image matrix into SVD components, throwing out the smallest stretches (static) and keeping only the largest ones (shapes).", isCorrect: true, feedback: "Yes! SVD ranks mathematical information by its true importance." }
    ],
    explanation: "Singular values tell you exactly which dimensions hold the strongest signals."
  },

  intuition: {
    text: "**Where you are in the story:** We spent this entire curriculum figuring out how to build matrices, warp space, diagonalize square matrices, and project data. We saved the most powerful theorem for last.\n\nNot every matrix can be diagonalized. But **every matrix has an SVD**. \n\nThe Singular Value Decomposition states that literally any matrix $A$ can be decomposed into three parts: $A = U \\Sigma V^T$. \n\nImagine a sphere. Any linear transformation will warp that sphere into an ellipse (possibly flattened). $V^T$ represents an initial rotation finding the axes of the sphere. $\\Sigma$ is a diagonal stretch matrix that turns the sphere into the ellipse. $U$ is a final rotation positioning that ellipse.\n\nThe stretching amounts in $\\Sigma$ are called the **Singular Values**. They tell you how 'important' that direction is. This is the foundation of data compression, PCA, and recommender systems.",
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 2 — Advanced Projections & SVD',
        body: '**Previous:** Projecting data optimally with Least Squares.\n**This lesson:** The ultimate decomposition of space (SVD).\n**Next:** End of Curriculum.'
      },
      {
        type: 'insight',
        title: 'SVD vs Diagonalization',
        body: 'Diagonalization ($A = PDP^{-1}$) requires a square matrix and uses non-orthogonal eigenvectors.\n\nSVD ($A = U \\Sigma V^T$) works on any matrix and always uses perfect, perpendicular rotations.'
      }
    ],
    mathBridge: "Step 1: Watch the initial pristine grid of a circle. Step 2: Use the slider to advance through $V^T$ (rotation), $\\Sigma$ (stretching to ellipse), and $U$ (final rotation). The key lesson: any complex warp is just three simple steps."
  },

  math: {
    text: "The decomposition is $A = U \\Sigma V^T$.\n\n- $U$ contains the left singular vectors (eigenvectors of $AA^T$).\n- $\\Sigma$ contains the singular values (square roots of the eigenvalues of $A^T A$).\n- $V^T$ contains the right singular vectors (eigenvectors of $A^T A$).",
    callouts: []
  },

  rigor: {
    text: "The Singular Value Decomposition theorem establishes that for any $m \\times n$ matrix $A$ over the real or complex numbers, there exists an $m \\times m$ orthogonal matrix $U$, an $m \\times n$ diagonal matrix $\\Sigma$, and an $n \\times n$ orthogonal matrix $V^T$. The diagonal elements $\\sigma_i$ of $\\Sigma$ are uniquely determined by $A$ and are called singular values.",
    callouts: []
  },

  examples: [
    {
      id: "la4.2-ex1",
      title: "Data Compression",
      description: "Truncating small singular values.",
      steps: [
        {
          text: "Suppose an image is reconstructed as $A = \\sigma_1(u_1)(\\vec{v}_1)^T + \\sigma_2(u_2)(\\vec{v}_2)^T + \\dots$.",
          visualizationId: "LALesson12_SVD"
        },
        {
          text: "If $\\sigma_{100} = 0.0001$, deleting that entire term practically doesn't change the full photo. We compress data massively.",
          visualizationId: "LALesson12_SVD"
        }
      ]
    }
  ],

  challenges: [
    {
      id: "challenge-la4.2",
      title: "Eigenvalues vs Singular Values",
      description: "If a matrix A is perfectly symmetric with positive eigenvalues...",
      task: "What happens to the SVD and Diagonalization formulas?",
      hints: [
        "Symmetric matrices have orthogonal eigenvectors.",
        "They become exactly the same."
      ],
      solution: {
        type: "text",
        value: "They are the same."
      }
    }
  ],

  quiz: [
    {
      id: "la4.2-q1",
      question: "What is guaranteed about the matrices $U$ and $V$ in the SVD $A = U \\Sigma V^T$?",
      options: [
        { id: "a", text: "They are singular.", isCorrect: false },
        { id: "b", text: "They are orthogonal (their columns are perpendicular unit vectors).", isCorrect: true, feedback: "Correct! This is what makes SVD so mathematically stable and computationally useful." },
        { id: "c", text: "They are diagonal.", isCorrect: false }
      ]
    }
  ]
};
