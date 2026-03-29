export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la3-001',
  slug: 'eigenvectors-and-eigenvalues',
  chapter: 3,
  order: 1,
  title: 'Eigenvectors and Eigenvalues',
  subtitle: 'Every matrix has a hidden skeleton — a few special directions it never rotates, only stretches. Finding them reveals the true nature of a transformation.',
  tags: ['eigenvectors', 'eigenvalues', 'characteristic equation', 'characteristic polynomial', 'eigenspace', 'invariant direction'],
  aliases: 'eigen vectors values characteristic polynomial equation eigenspace invariant direction stretch rotation axis',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "A matrix transformation spins, stretches, and shears almost every vector it touches. But are there any vectors it never rotates — vectors it only stretches or squishes, never tilts?",
    realWorldContext: "Eigenvalues and eigenvectors run the world. Google's original PageRank algorithm ranks websites by finding the dominant eigenvector of a giant matrix of links. Quantum mechanics is entirely built on eigenvalues — the possible measurable states of a particle are exactly its eigenstates. Structural engineers find the resonant frequencies of a building by computing eigenvalues — the frequencies that will make it shake apart. In data science, Principal Component Analysis (PCA) compresses high-dimensional data by keeping only the most important eigenvectors. This is not an abstract topic: it is one of the most applied ideas in all of mathematics.",
    previewVisualizationId: 'LALesson08_Eigen',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You have spent all of Phase 2 learning what matrices DO — they stretch, squish, shear, and rotate space. You can multiply them, invert them, find what they destroy (null space) and what they can reach (column space). Now we ask the deepest question yet: does a matrix have any preferred directions? Any directions it never rotates, only scales?',
      'Here is the core idea. When a matrix $A$ acts on a vector $\\mathbf{v}$, it generally knocks that vector off its original line — both the direction and magnitude change. But there exist special vectors where the matrix only changes the magnitude, not the direction. The output $A\\mathbf{v}$ points in exactly the same direction as $\\mathbf{v}$, just scaled by some factor. Those are the **eigenvectors**. The scaling factor is the **eigenvalue**.',
      'Think about stretching a rubber sheet along two perpendicular axes — say, horizontally and vertically. Draw any diagonal line on the sheet. After the stretch, that diagonal gets rotated to a new angle. But the two lines you pulled along (horizontal and vertical) do not rotate at all — they only get longer or shorter. Those are the eigenvectors of the stretch.',
      'For a 3D rotation around an axis (like the Earth rotating around its polar axis), the rotation axis itself is an eigenvector — it does not move at all under the rotation. Its eigenvalue is $\\lambda = 1$, meaning it is scaled by a factor of 1 (not stretched or squished, just left alone).',
      'The equation that captures this is beautifully compact:\n\n$$A\\mathbf{v} = \\lambda\\mathbf{v}$$\n\nMatrix multiplication on the left equals scalar multiplication on the right. The vector $\\mathbf{v}$ is treated identically whether $A$ acts on it as a full transformation or $\\lambda$ scales it as a plain number. That equivalence is what makes eigenvectors special.',
      '**Where this is heading:** Eigenvectors are the natural axes of a transformation — the directions where everything is simplest. In the very next lesson, you will rebuild your entire coordinate system so the $x$- and $y$-axes align with the eigenvectors. When you do, the complicated matrix $A$ becomes a beautiful diagonal matrix where the only non-zero entries are the eigenvalues themselves.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** Null Space and Column Space — what a matrix destroys and what it can reach.\n**This lesson:** Eigenvectors and eigenvalues — the invariant directions and scaling factors of a transformation.\n**Next:** Diagonalization — rebuilding coordinates around eigenvectors so the matrix becomes trivially simple.',
      },
      {
        type: 'insight',
        title: 'The Defining Equation',
        body: 'A\\mathbf{v} = \\lambda\\mathbf{v}\n\n$\\mathbf{v}$ is the eigenvector (a non-zero vector). $\\lambda$ is the eigenvalue (a scalar — positive means stretching in that direction, negative means flipping, zero means the vector gets squished to the origin).',
      },
      {
        type: 'insight',
        title: 'Eigenvalues Encode the Transformation\'s Personality',
        body: '• $|\\lambda| > 1$: stretches in that direction\n• $0 < |\\lambda| < 1$: squishes\n• $\\lambda = 1$: leaves it unchanged\n• $\\lambda = -1$: flips direction\n• $\\lambda = 0$: collapses to origin (this direction is in the null space!)',
      },
      {
        type: 'warning',
        title: 'The Zero Vector is Never an Eigenvector',
        body: 'The equation $A\\mathbf{0} = \\lambda\\mathbf{0}$ holds for ANY $\\lambda$ — so the zero vector carries no information about the transformation. By definition, eigenvectors must be non-zero.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson08_Eigen',
        title: 'Finding Eigenvectors Geometrically',
        mathBridge: 'The visualization shows a 2D transformation (default: a shear or stretch). Rotate the input vector $\\mathbf{v}$ by dragging its tip. Watch the output $A\\mathbf{v}$ (shown in red). Most of the time, $A\\mathbf{v}$ points in a completely different direction than $\\mathbf{v}$. But at certain angles, $A\\mathbf{v}$ lines up exactly with $\\mathbf{v}$ — only longer or shorter. Lock in those angles. You have found the eigenvectors. Note the scaling factor: that is $\\lambda$.',
        caption: 'Eigenvectors are the directions where input and output align.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Starting from $A\\mathbf{v} = \\lambda\\mathbf{v}$, subtract the right side:\n\n$$A\\mathbf{v} - \\lambda\\mathbf{v} = \\mathbf{0}$$\n\nFactor out $\\mathbf{v}$ (using $\\lambda\\mathbf{v} = \\lambda I\\mathbf{v}$):\n\n$$(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$$',
      'We want a **non-zero** $\\mathbf{v}$. The only way $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ has a non-zero solution is if the matrix $(A - \\lambda I)$ is singular — meaning it squishes some direction to zero, meaning its determinant is zero:\n\n$$\\det(A - \\lambda I) = 0$$\n\nThis is the **characteristic equation**. Expanding the determinant gives a polynomial in $\\lambda$ called the **characteristic polynomial**. For an $n \\times n$ matrix, this polynomial has degree $n$ and therefore has exactly $n$ roots in $\\mathbb{C}$ (counting multiplicity).',
      'The two-step process is:\n\n**Step 1 — Find eigenvalues:** Solve $\\det(A - \\lambda I) = 0$ for $\\lambda$.\n\n**Step 2 — Find eigenvectors:** For each eigenvalue $\\lambda$, solve the homogeneous system $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ using Gaussian elimination. Every non-zero solution is an eigenvector with that eigenvalue.',
      'The set of all solutions to $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ — including the zero vector — forms a subspace called the **eigenspace** of $\\lambda$. Its dimension is called the **geometric multiplicity** of $\\lambda$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Characteristic Equation',
        body: '\\det(A - \\lambda I) = 0\n\nThe roots of this polynomial are the eigenvalues of $A$.',
      },
      {
        type: 'insight',
        title: 'Triangular Matrices: Read Off the Eigenvalues',
        body: 'For any upper or lower triangular matrix, the eigenvalues are simply the diagonal entries. No computation needed — the characteristic polynomial for a triangular matrix factors as $(\\lambda_1 - \\lambda)(\\lambda_2 - \\lambda)\\cdots$.',
      },
      {
        type: 'insight',
        title: 'Two Signatures of the Eigenvalues',
        body: 'For any $n \\times n$ matrix $A$ with eigenvalues $\\lambda_1, \\ldots, \\lambda_n$:\n\n$$\\text{trace}(A) = \\lambda_1 + \\lambda_2 + \\cdots + \\lambda_n$$\n$$\\det(A) = \\lambda_1 \\cdot \\lambda_2 \\cdots \\lambda_n$$\n\nThese are fast sanity checks after finding eigenvalues.',
      },
    ],
    visualizations: [
      {
        id: 'CharacteristicPolynomialViz',
        title: 'The Characteristic Polynomial',
        mathBridge: 'Enter any 2×2 matrix. The visualization computes $(A - \\lambda I)$ symbolically and plots $\\det(A - \\lambda I)$ as a function of $\\lambda$ on the horizontal axis. The zeros of this parabola are the eigenvalues. Drag the matrix entries and watch the parabola shift — pay attention to when it dips below the axis (two real eigenvalues), just touches it (repeated eigenvalue), or stays above it (complex eigenvalues, coming next lesson).',
        caption: 'Eigenvalues are where the characteristic polynomial crosses zero.',
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The **algebraic multiplicity** of an eigenvalue $\\lambda$ is its multiplicity as a root of the characteristic polynomial. The **geometric multiplicity** is the dimension of its eigenspace $\\text{null}(A - \\lambda I)$.',
      'It is always true that: $1 \\leq \\text{geometric multiplicity} \\leq \\text{algebraic multiplicity}$. When equality holds for every eigenvalue, the matrix is diagonalizable (next lesson). When geometric multiplicity is strictly less than algebraic multiplicity for some eigenvalue, the matrix is called **defective** and cannot be diagonalized.',
      '**Similar matrices share eigenvalues.** If $B = P^{-1}AP$, then $\\det(B - \\lambda I) = \\det(P^{-1}(A-\\lambda I)P) = \\det(A - \\lambda I)$, so $A$ and $B$ have the same characteristic polynomial and hence the same eigenvalues. This is why change-of-basis does not change eigenvalues — only the representation changes.',
      '**Eigenvectors for different eigenvalues are linearly independent.** If $\\lambda_1 \\neq \\lambda_2$ and $\\mathbf{v}_1$, $\\mathbf{v}_2$ are corresponding eigenvectors, then $\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ is linearly independent. Extending by induction: eigenvectors from $k$ distinct eigenvalues are always linearly independent.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Algebraic vs. Geometric Multiplicity',
        body: '**Algebraic multiplicity:** power of $(\\lambda - \\lambda_0)$ in characteristic polynomial.\n\n**Geometric multiplicity:** $\\dim(\\text{null}(A - \\lambda_0 I))$ — how many linearly independent eigenvectors exist for $\\lambda_0$.\n\nGeometric $\\leq$ Algebraic always.',
      },
      {
        type: 'theorem',
        title: 'Eigenvectors from Distinct Eigenvalues',
        body: 'Eigenvectors corresponding to distinct (different) eigenvalues are always linearly independent.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la3-001-ex1',
      title: 'Finding Eigenvalues and Eigenvectors of a Triangular Matrix',
      problem: 'Find all eigenvalues and eigenvectors of $A = \\begin{bmatrix}3 & 1 \\\\ 0 & 2\\end{bmatrix}$.',
      steps: [
        {
          expression: 'A - \\lambda I = \\begin{bmatrix}3-\\lambda & 1 \\\\ 0 & 2-\\lambda\\end{bmatrix}',
          annotation: 'Form $A - \\lambda I$ by subtracting $\\lambda$ from each diagonal entry.',
          strategyTitle: 'Form A − λI',
          checkpoint: 'Why do we only subtract from the diagonal?',
          hints: ['Because $\\lambda I$ has $\\lambda$ on the diagonal and 0 everywhere else.'],
        },
        {
          expression: '\\det(A - \\lambda I) = (3-\\lambda)(2-\\lambda) - (1)(0) = (3-\\lambda)(2-\\lambda) = 0',
          annotation: 'For triangular matrices, the determinant is just the product of diagonal entries. Set it to zero.',
          strategyTitle: 'Characteristic equation',
          checkpoint: 'What are the roots?',
          hints: ['$(3-\\lambda) = 0$ gives $\\lambda = 3$. $(2-\\lambda) = 0$ gives $\\lambda = 2$.'],
        },
        {
          expression: '\\lambda_1 = 3, \\quad \\lambda_2 = 2',
          annotation: 'Two distinct real eigenvalues. As a check: trace = $3+2=5 = \\lambda_1+\\lambda_2$ ✓ and $\\det(A) = 6 = \\lambda_1\\lambda_2$ ✓.',
          strategyTitle: 'Eigenvalues',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_1=3: \\quad (A-3I)\\mathbf{v} = \\begin{bmatrix}0&1\\\\0&-1\\end{bmatrix}\\mathbf{v} = \\mathbf{0}',
          annotation: 'Plug $\\lambda=3$ into $(A-\\lambda I)$ and solve the homogeneous system.',
          strategyTitle: 'Eigenvector for λ=3',
          checkpoint: 'What does the system say?',
          hints: ['Row 1: $v_2 = 0$. Row 2: $-v_2 = 0$ (redundant). So $v_2 = 0$ and $v_1$ is free.'],
        },
        {
          expression: '\\mathbf{v}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix} \\quad (\\text{or any scalar multiple})',
          annotation: 'Set $v_1 = 1$. The eigenvector for $\\lambda=3$ is the standard basis vector $\\mathbf{e}_1$.',
          strategyTitle: 'First eigenvector',
          checkpoint: 'Verify: $A\\mathbf{v}_1 = [3,0]^T = 3[1,0]^T$ ✓',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_2=2: \\quad (A-2I)\\mathbf{v} = \\begin{bmatrix}1&1\\\\0&0\\end{bmatrix}\\mathbf{v} = \\mathbf{0}',
          annotation: 'Plug $\\lambda=2$ into $(A-\\lambda I)$ and solve.',
          strategyTitle: 'Eigenvector for λ=2',
          checkpoint: 'What does the system say?',
          hints: ['Row 1: $v_1 + v_2 = 0$, so $v_1 = -v_2$. Set $v_2 = 1$.'],
        },
        {
          expression: '\\mathbf{v}_2 = \\begin{bmatrix}-1\\\\1\\end{bmatrix}',
          annotation: 'The eigenvector for $\\lambda=2$.',
          strategyTitle: 'Second eigenvector',
          checkpoint: 'Verify: $A\\mathbf{v}_2 = [(-3+1), 2]^T = [-2, 2]^T = 2[-1,1]^T$ ✓',
          hints: [],
        },
      ],
      conclusion: '$A$ has eigenvalues $\\lambda=3$ (with eigenvector $[1,0]^T$) and $\\lambda=2$ (with eigenvector $[-1,1]^T$). The matrix stretches the $x$-axis by a factor of 3 and the direction $[-1,1]$ by a factor of 2.',
    },
    {
      id: 'la3-001-ex2',
      title: 'Symmetric Matrix: Eigenvalues and Perpendicular Eigenvectors',
      problem: 'Find all eigenvalues and eigenvectors of $A = \\begin{bmatrix}2 & 1 \\\\ 1 & 2\\end{bmatrix}$.',
      steps: [
        {
          expression: '\\det(A - \\lambda I) = \\det\\begin{bmatrix}2-\\lambda & 1 \\\\ 1 & 2-\\lambda\\end{bmatrix} = (2-\\lambda)^2 - 1 = 0',
          annotation: 'Expand the determinant: $(2-\\lambda)^2 - 1^2 = 0$.',
          strategyTitle: 'Characteristic equation',
          checkpoint: 'Factor the left side.',
          hints: ['$(2-\\lambda)^2 - 1 = (2-\\lambda-1)(2-\\lambda+1) = (1-\\lambda)(3-\\lambda) = 0$.'],
        },
        {
          expression: '\\lambda_1 = 1, \\quad \\lambda_2 = 3',
          annotation: 'Two distinct eigenvalues. Check: trace = $4 = 1+3$ ✓, $\\det = 3 = 1\\cdot3$ ✓.',
          strategyTitle: 'Eigenvalues',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_1=1: \\quad (A-I)\\mathbf{v} = \\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\quad \\Rightarrow \\quad \\mathbf{v}_1 = \\begin{bmatrix}1\\\\-1\\end{bmatrix}',
          annotation: 'Row 1 says $v_1 + v_2 = 0$, so $v_1 = -v_2$.',
          strategyTitle: 'Eigenvector for λ=1',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_2=3: \\quad (A-3I)\\mathbf{v} = \\begin{bmatrix}-1&1\\\\1&-1\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\quad \\Rightarrow \\quad \\mathbf{v}_2 = \\begin{bmatrix}1\\\\1\\end{bmatrix}',
          annotation: 'Row 1 says $-v_1+v_2=0$, so $v_1=v_2$.',
          strategyTitle: 'Eigenvector for λ=3',
          checkpoint: 'Notice: $\\mathbf{v}_1 \\cdot \\mathbf{v}_2 = (1)(1)+(-1)(1) = 0$. They are perpendicular!',
          hints: ['Symmetric matrices ALWAYS have perpendicular eigenvectors (from different eigenvalues). This is the Spectral Theorem.'],
        },
      ],
      conclusion: 'The symmetric matrix $A$ squishes the $[1,-1]$ direction by factor 1 (leaves it unchanged) and stretches the $[1,1]$ direction by factor 3. The eigenvectors are perpendicular — this is guaranteed for symmetric matrices and is why symmetric matrices are especially nice to work with.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la3-001-ch1',
      difficulty: 'easy',
      problem: 'What are the eigenvalues of the diagonal matrix $D = \\begin{bmatrix}5 & 0 \\\\ 0 & -3\\end{bmatrix}$? What are the eigenvectors?',
      hint: 'Diagonal matrices have eigenvalues on the diagonal. Try $\\mathbf{v} = [1,0]^T$ and $\\mathbf{v} = [0,1]^T$.',
      walkthrough: [
        {
          expression: 'D\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}5\\\\0\\end{bmatrix} = 5\\begin{bmatrix}1\\\\0\\end{bmatrix}',
          annotation: '$[1,0]^T$ is an eigenvector with $\\lambda = 5$.',
        },
        {
          expression: 'D\\begin{bmatrix}0\\\\1\\end{bmatrix} = \\begin{bmatrix}0\\\\-3\\end{bmatrix} = -3\\begin{bmatrix}0\\\\1\\end{bmatrix}',
          annotation: '$[0,1]^T$ is an eigenvector with $\\lambda = -3$. Diagonal matrices always use the standard basis as their eigenvectors.',
        },
      ],
      answer: 'λ₁ = 5, v₁ = [1,0]ᵀ; λ₂ = -3, v₂ = [0,1]ᵀ',
    },
    {
      id: 'la3-001-ch2',
      difficulty: 'medium',
      problem: 'Find all eigenvalues and eigenvectors of $A = \\begin{bmatrix}4 & 2 \\\\ 1 & 3\\end{bmatrix}$.',
      hint: 'The characteristic polynomial is $\\lambda^2 - 7\\lambda + 10 = 0$. Factor it.',
      walkthrough: [
        {
          expression: '\\det(A - \\lambda I) = (4-\\lambda)(3-\\lambda) - 2 = \\lambda^2 - 7\\lambda + 10 = (\\lambda-5)(\\lambda-2) = 0',
          annotation: 'Characteristic equation: expand, simplify, factor.',
        },
        {
          expression: '\\lambda_1 = 5, \\quad \\lambda_2 = 2',
          annotation: 'Check: trace $= 7 = 5+2$ ✓, $\\det = 10 = 5\\cdot2$ ✓.',
        },
        {
          expression: '\\lambda_1=5: \\; (A-5I)\\mathbf{v}=\\mathbf{0} \\Rightarrow \\begin{bmatrix}-1&2\\\\1&-2\\end{bmatrix}\\mathbf{v}=\\mathbf{0} \\Rightarrow \\mathbf{v}_1=\\begin{bmatrix}2\\\\1\\end{bmatrix}',
          annotation: '$-v_1+2v_2=0 \\Rightarrow v_1=2v_2$. Set $v_2=1$.',
        },
        {
          expression: '\\lambda_2=2: \\; (A-2I)\\mathbf{v}=\\mathbf{0} \\Rightarrow \\begin{bmatrix}2&2\\\\1&1\\end{bmatrix}\\mathbf{v}=\\mathbf{0} \\Rightarrow \\mathbf{v}_2=\\begin{bmatrix}1\\\\-1\\end{bmatrix}',
          annotation: '$2v_1+2v_2=0 \\Rightarrow v_1=-v_2$. Set $v_2=1$.',
        },
      ],
      answer: 'λ₁=5, v₁=[2,1]ᵀ; λ₂=2, v₂=[1,-1]ᵀ',
    },
    {
      id: 'la3-001-ch3',
      difficulty: 'hard',
      problem: 'Without computing eigenvalues, explain why the matrix $A = \\begin{bmatrix}1 & 1 \\\\ 0 & 1\\end{bmatrix}$ (a shear) has $\\lambda = 1$ as a repeated eigenvalue, and find its eigenvectors. Can you find two linearly independent eigenvectors?',
      hint: 'Use the trace and determinant: trace $= 2$, so $\\lambda_1 + \\lambda_2 = 2$; det $= 1$, so $\\lambda_1\\lambda_2 = 1$. Solve for $\\lambda$. Then check the eigenspace.',
      walkthrough: [
        {
          expression: '\\lambda_1 + \\lambda_2 = \\text{trace} = 2 \\quad \\text{and} \\quad \\lambda_1\\lambda_2 = \\det = 1 \\quad \\Rightarrow \\quad \\lambda = 1 \\text{ (repeated)}',
          annotation: 'Both eigenvalues equal 1.',
        },
        {
          expression: '(A - I)\\mathbf{v} = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\quad \\Rightarrow \\quad v_2 = 0, \\quad v_1 \\text{ free}',
          annotation: 'The eigenspace is $\\{[t, 0]^T : t \\in \\mathbb{R}\\}$ — a 1D space.',
        },
        {
          expression: '\\text{Geometric multiplicity} = 1 < 2 = \\text{Algebraic multiplicity}',
          annotation: 'Only one independent eigenvector despite a repeated eigenvalue. This matrix is defective — it cannot be diagonalized.',
        },
      ],
      answer: 'Only one eigenvector: v = [1,0]ᵀ. The matrix is defective — it cannot be diagonalized.',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A\\mathbf{v} = \\lambda\\mathbf{v}', meaning: 'Defining equation: v is an eigenvector, λ is the corresponding eigenvalue' },
      { symbol: '\\det(A - \\lambda I) = 0', meaning: 'Characteristic equation — its roots are the eigenvalues' },
      { symbol: '\\text{null}(A - \\lambda I)', meaning: 'Eigenspace for eigenvalue λ — all eigenvectors (plus 0) for that λ' },
      { symbol: '\\text{trace}(A)', meaning: 'Sum of diagonal entries = sum of all eigenvalues' },
    ],
    rulesOfThumb: [
      'Diagonal/triangular matrices: eigenvalues are the diagonal entries. No work needed.',
      'Trace = sum of eigenvalues; det = product of eigenvalues. Always check these.',
      'Eigenvectors from different eigenvalues are always linearly independent.',
      'Symmetric matrices always have real eigenvalues and perpendicular eigenvectors.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la2-004',
        label: 'Null Space',
        note: 'Finding an eigenvector for eigenvalue λ is just finding the null space of $(A - \\lambda I)$. Everything you know about Gaussian elimination and null spaces applies directly here.',
      },
      {
        lessonId: 'la2-003',
        label: 'Determinants',
        note: 'The characteristic equation $\\det(A - \\lambda I) = 0$ uses the determinant to detect when a matrix is singular. A non-zero determinant means only the trivial solution — no eigenvectors there.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la3-002',
        label: 'Diagonalization',
        note: 'Eigenvectors become the columns of the change-of-basis matrix $P$. Eigenvalues fill the diagonal of $D$. Together, $A = PDP^{-1}$ — the cleanest way to understand any diagonalizable matrix.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Eigenvectors: the directions a matrix never tilts — only stretches or flips.',
    'Eigenvalues: the stretching factors for each eigenvector direction.',
    'Find λ: solve det(A − λI) = 0 (characteristic equation).',
    'Find v: for each λ, solve (A − λI)v = 0 (null space problem).',
    'Trace = Σλᵢ, det = Πλᵢ — fast sanity checks.',
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
    'attempted-challenge-hard',
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la3-001-assess-1',
        type: 'input',
        text: 'What is the eigenvalue of the identity matrix (for any eigenvector)?',
        answer: '1',
        hint: 'I·v = 1·v for every vector v.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'eigenvectors-and-eigenvalues-q1',
      type: 'choice',
      text: 'Why do we set $\\det(A - \\lambda I) = 0$ to find eigenvalues?',
      options: [
        'Because eigenvalues must always be zero',
        'Because we need $(A - \\lambda I)$ to be singular so that a non-zero eigenvector can be mapped to the zero vector',
        'Because the determinant of $A$ must equal $\\lambda$',
        'Because $I = 0$ in linear algebra',
      ],
      answer: 'Because we need $(A - \\lambda I)$ to be singular so that a non-zero eigenvector can be mapped to the zero vector',
      hints: ['If $\\det(A - \\lambda I) \\neq 0$, the matrix is invertible and $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ has only the trivial solution $\\mathbf{v}=\\mathbf{0}$ — which is not allowed as an eigenvector.'],
      reviewSection: 'Math tab — The Characteristic Equation',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q2',
      type: 'input',
      text: 'A $2 \\times 2$ matrix has eigenvalues $\\lambda_1 = 4$ and $\\lambda_2 = -1$. What is the determinant of the matrix?',
      answer: '-4',
      hints: ['$\\det(A) = \\lambda_1 \\cdot \\lambda_2 = 4 \\cdot (-1)$.'],
      reviewSection: 'Math tab — Two Signatures',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q3',
      type: 'choice',
      text: 'A matrix $A$ has $\\lambda = 0$ as an eigenvalue. What does this tell you about $A$?',
      options: [
        '$A$ is the identity matrix',
        '$A$ is the zero matrix',
        '$A$ is singular — it collapses some direction to the origin',
        '$A$ has no other eigenvalues',
      ],
      answer: '$A$ is singular — it collapses some direction to the origin',
      hints: ['$\\lambda = 0$ means $A\\mathbf{v} = 0\\mathbf{v} = \\mathbf{0}$ for some non-zero $\\mathbf{v}$. That means $\\mathbf{v}$ is in the null space of $A$, so $A$ is not invertible.'],
      reviewSection: 'Intuition tab — Eigenvalues Encode the Transformation\'s Personality',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q4',
      type: 'choice',
      text: 'If $\\mathbf{v}$ is an eigenvector of $A$ with eigenvalue $\\lambda = 3$, what is $A(2\\mathbf{v})$?',
      options: ['$2\\mathbf{v}$', '$3\\mathbf{v}$', '$6\\mathbf{v}$', '$9\\mathbf{v}$'],
      answer: '$6\\mathbf{v}$',
      hints: ['$A(2\\mathbf{v}) = 2(A\\mathbf{v}) = 2(3\\mathbf{v}) = 6\\mathbf{v}$. Scalar multiples of eigenvectors are also eigenvectors with the same eigenvalue.'],
      reviewSection: 'Math tab — Eigenspace',
    },
  ],
};
