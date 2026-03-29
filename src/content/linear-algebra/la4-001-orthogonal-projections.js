export default {
  id: 'la4.1',
  title: 'Orthogonal Projections',
  slug: 'orthogonal-projections',
  chapter: 'la4',
  
  timeToComplete: 20,
  coreConcept: 'Projections are the mathematical way to find the closest point in a lower-dimensional subspace. This allows us to approximate solutions to unsolvable equations, fundamentally enabling Least Squares regression.',
  prerequisites: ['la3.3'],
  nextLesson: 'svd',

  previewVisualizationId: 'LALesson11_OrthogonalProjections',
  
  hook: {
    question: "You have 100 data points and want to fit a single line through them. The exact solution requires the line to touch every single point. Is that mathematically possible?",
    options: [
      { id: "a", text: "Yes, we just need a big enough matrix.", isCorrect: false },
      { id: "b", text: "No, the system has no exact solution.", isCorrect: false },
      { id: "c", text: "No, but we can project the points orthogonally onto the space of possible lines to find the 'closest' answer.", isCorrect: true, feedback: "Correct! That is exactly what linear regression does under the hood." }
    ],
    explanation: "Projections are how we settle for 'good enough' when perfection is impossible."
  },

  intuition: {
    text: "**Where you are in the story:** We spent Chapter 3 exploring square matrices and their eigenvectors. But many real-world problems aren't square. When we have more equations than unknowns, there isn't an exact intersecting solution. \n\nImagine a 2D plane passing through a 3D room. You have a point hovering above the plane, representing your data. The goal is to find the point *on the plane* that is closest to your hovering point. \n\nIf you drop a plumb line straight down, it creates a 90-degree orthogonal line. Where it hits the plane is the **Orthogonal Projection** of your data onto the model.  This is the foundation of all machine learning error-minimization.\n\n**Where this is heading:** Once we master the ability to crush large data structures onto simpler ones orthogonally, we will learn the Singular Value Decomposition (SVD), the ultimate tool for tearing apart any matrix.",
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 2 — Advanced Projections & SVD',
        body: '**Previous:** The properties of eigenvectors and matrices.\n**This lesson:** The geometry of projections and least squares.\n**Next:** Breaking matrices apart completely (SVD).'
      },
      {
        type: 'insight',
        title: 'The Projection Matrix',
        body: '$P = A(A^T A)^{-1}A^T$\n\nThis intimidating formula simply ensures that your result $P\\vec{b}$ sits exactly inside the column space of $A$.'
      }
    ],
    mathBridge: "Step 1: Move the hovering red vector $\\vec{b}$. Step 2: Watch the blue shadow vector $\\vec{p}$ track it along the floor. The key lesson: the green error vector connecting them is always perfectly $90^\\circ$ to the floor."
  },

  math: {
    text: "Given a vector $\\vec{b}$ and a line spanned by vector $\\vec{a}$, the projection $p$ is scaled by: $$p = \\frac{\\vec{a} \\cdot \\vec{b}}{\\vec{a} \\cdot \\vec{a}} \\vec{a}$$.\n\nThe error vector $e = \\vec{b} - \\vec{p}$ is orthogonal to $\\vec{a}$, meaning $\\vec{a} \\cdot e = 0$.",
    callouts: []
  },

  rigor: {
    text: "Formally, let $W$ be a subspace of $\\mathbb{R}^n$. Every vector $\\vec{y}$ in $\\mathbb{R}^n$ can be written uniquely in the form $\\vec{y} = \\hat{y} + \\vec{z}$, where $\\hat{y}$ is in $W$ and $\\vec{z}$ is orthogonal to $W$. This is the Orthogonal Decomposition Theorem.",
    callouts: []
  },

  examples: [
    {
      id: "la4.1-ex1",
      title: "Projecting onto a line",
      description: "Finding the closest vector component.",
      steps: [
        {
          text: "Given a target $\\vec{b} = \\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}$ and a line from $\\vec{a} = \\begin{bmatrix} 1 \\\\ 1 \\\\ 1 \\end{bmatrix}$.",
          visualizationId: "LALesson11_OrthogonalProjections"
        },
        {
          text: "$\\vec{a} \\cdot \\vec{b} = 6$ and $\\vec{a} \\cdot \\vec{a} = 3$. The scalar is $6/3 = 2$. So $p = \\begin{bmatrix} 2 \\\\ 2 \\\\ 2 \\end{bmatrix}$.",
          visualizationId: "LALesson11_OrthogonalProjections"
        }
      ]
    }
  ],

  challenges: [
    {
      id: "challenge-la4.1",
      title: "Error Checking",
      description: "Verify orthogonality.",
      task: "If $\\vec{b} = [1, 2, 3]$ and $\\vec{p} = [2, 2, 2]$, what is the dot product of $\\vec{a} = [1, 1, 1]$ and the error vector $\\vec{e}$?",
      hints: [
        "First calculate $\\vec{e} = \\vec{b} - \\vec{p}$, then dot it with $\\vec{a}$."
      ],
      solution: {
        type: "number",
        value: 0
      }
    }
  ],

  quiz: [
    {
      id: "la4.1-q1",
      question: "In the context of data science and least squares regression, what does the error vector $\\vec{e}$ geometrically represent?",
      options: [
        { id: "a", text: "The slope of the line of best fit.", isCorrect: false },
        { id: "b", text: "The distance between the line and the origin.", isCorrect: false },
        { id: "c", text: "The shortest possible distance between our noisy data and the ideal model we are trying to fit.", isCorrect: true, feedback: "Correct! We minimize the length of $\\vec{e}$ by ensuring it strikes perfectly orthogonally." }
      ]
    }
  ]
};
