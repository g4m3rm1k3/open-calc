export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la4-002',
  slug: 'gram-schmidt',
  chapter: 4,
  order: 2,
  title: 'Gram-Schmidt Orthogonalization',
  subtitle: 'How to manufacture a perfectly clean, perpendicular coordinate system out of any messy, tilted basis.',
  tags: ['gram-schmidt', 'orthogonalization', 'orthonormal basis', 'QR decomposition', 'projection', 'normalization'],
  aliases: 'orthogonal basis orthonormal set QR factorization perpendicular basis construct orthogonal',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "Your GPS calculates position using satellite signals that arrive from messy, non-perpendicular directions. How does it clean up the geometry to make the math tractable?",
    realWorldContext: "Gram-Schmidt is the algorithm behind QR decomposition, which is used everywhere: solving least squares problems in statistics, finding eigenvalues numerically (the QR algorithm), compressing images, and training neural networks. Every time you want to work in coordinates that are clean and perpendicular — even if your original data is tilted and messy — Gram-Schmidt does the cleaning. It is one of the most-used algorithms in scientific computing.",
    previewVisualizationId: 'GramSchmidtProcess',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You just learned orthogonal projections — how to find the shadow of one vector onto another. Gram-Schmidt takes that single idea and applies it repeatedly to manufacture a full set of perpendicular vectors. It is projection, used as a cleaning tool.',
      'Here is the core idea in plain language: imagine you have two vectors in 2D that are *not* perpendicular — they are tilted at some weird angle to each other. You want to replace them with two perpendicular vectors that span the exact same space. Gram-Schmidt tells you how.',
      '**Step 1: Keep the first vector as-is.** There is nothing to clean yet. Just normalize it to length 1: $\\mathbf{e}_1 = \\mathbf{v}_1 / \\|\\mathbf{v}_1\\|$.',
      '**Step 2: Subtract off the "contamination."** Take your second vector $\\mathbf{v}_2$. It has some component that points in the direction of $\\mathbf{e}_1$ (the part that overlaps). Subtract that component away, leaving only the part that is perpendicular to $\\mathbf{e}_1$. That remainder is already orthogonal to $\\mathbf{e}_1$ by construction. Normalize it to get $\\mathbf{e}_2$.',
      '**Step 3: Repeat for every remaining vector.** For $\\mathbf{v}_3$: subtract its projection onto $\\mathbf{e}_1$ AND its projection onto $\\mathbf{e}_2$. What is left is perpendicular to both. Normalize. Repeat until done.',
      'The beautiful guarantee: at every step, what remains after subtracting all prior projections is perpendicular to every previously computed basis vector. You are peeling off contamination one direction at a time.',
      '**Why orthonormal bases are worth the effort.** When your basis is orthonormal, nearly everything becomes simpler. Coordinates are just dot products. The inverse of the basis matrix $Q$ is just its transpose $Q^T$ (no computation needed!). Projections are $QQ^T\\mathbf{b}$. The entire least squares algorithm simplifies. Orthonormal bases are the "clean room" of linear algebra.',
      '**Where this is heading:** Gram-Schmidt is the constructive proof that every subspace has an orthonormal basis. It directly produces the QR decomposition ($A = QR$, where $Q$ has orthonormal columns and $R$ is upper triangular). The next lesson on Least Squares uses this heavily, and SVD generalizes it further.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 4 — Advanced Projections & SVD',
        body: '**Previous:** Orthogonal Projections — how to find the shadow of a vector onto a subspace.\n**This lesson:** Gram-Schmidt — how to build a clean, perpendicular basis from any basis, using projection as the cleaning tool.\n**Next:** Least Squares — how to find the best approximate solution when a system has no exact answer.',
      },
      {
        type: 'insight',
        title: 'The Subtraction IS the Orthogonalization',
        body: 'When you subtract the projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$, the remainder is perpendicular to $\\mathbf{e}_1$ — always, automatically, by the definition of projection. You are not checking for orthogonality; you are manufacturing it.',
      },
      {
        type: 'definition',
        title: 'Orthonormal Set',
        body: 'A set of vectors $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_k\\}$ is orthonormal if:\n• $\\mathbf{e}_i \\cdot \\mathbf{e}_j = 0$ for all $i \\neq j$ (orthogonal — pairwise perpendicular)\n• $\\|\\mathbf{e}_i\\| = 1$ for all $i$ (normal — all unit length)',
      },
      {
        type: 'strategy',
        title: 'Orthonormal Superpower: Inverse = Transpose',
        body: 'If $Q$ is a matrix with orthonormal columns, then $Q^{-1} = Q^T$. This is called an orthogonal matrix. Inverting it costs nothing — just transpose. This is why numerical algorithms love orthonormal bases.',
      },
    ],
    visualizations: [
      {
        id: 'GramSchmidtProcess',
        title: 'Gram-Schmidt in 2D',
        mathBridge: 'Start with two non-perpendicular vectors (the default, shown in red and blue). Press "Step 1" to see $\\mathbf{v}_1$ normalized to $\\mathbf{e}_1$. Press "Step 2" to see the projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$ subtracted away — watch the remainder (green) snap to exactly 90° from $\\mathbf{e}_1$. Drag the original vectors to different angles and run the process again. Confirm that no matter how tilted the input, the output is always perpendicular.',
        caption: 'Projection peels off contamination, leaving perpendicularity behind.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Given a set of linearly independent vectors $\\{\\mathbf{v}_1, \\mathbf{v}_2, \\ldots, \\mathbf{v}_k\\}$, the Gram-Schmidt process produces an orthonormal set $\\{\\mathbf{e}_1, \\mathbf{e}_2, \\ldots, \\mathbf{e}_k\\}$ that spans the exact same subspace.',
      'The recipe has two clean phases: (1) subtract off all prior-direction contamination, then (2) normalize to unit length.',
      'For the first vector: there is nothing to subtract yet. Just normalize:\n\n$$\\mathbf{e}_1 = \\frac{\\mathbf{v}_1}{\\|\\mathbf{v}_1\\|}$$',
      'For each subsequent vector $\\mathbf{v}_j$, subtract its projection onto every previously computed basis vector, then normalize:\n\n$$\\mathbf{u}_j = \\mathbf{v}_j - \\sum_{i=1}^{j-1} (\\mathbf{v}_j \\cdot \\mathbf{e}_i)\\,\\mathbf{e}_i \\qquad \\mathbf{e}_j = \\frac{\\mathbf{u}_j}{\\|\\mathbf{u}_j\\|}$$',
      'The term $(\\mathbf{v}_j \\cdot \\mathbf{e}_i)$ is just the scalar projection of $\\mathbf{v}_j$ onto $\\mathbf{e}_i$ — the amount of $\\mathbf{v}_j$ that points in the $\\mathbf{e}_i$ direction. Subtracting that amount removes all overlap with $\\mathbf{e}_i$.',
      '**Connection to QR decomposition.** If we assemble the original vectors as columns of a matrix $A$, then Gram-Schmidt produces a factorization $A = QR$, where $Q$ has orthonormal columns (the $\\mathbf{e}_j$\'s) and $R$ is upper triangular with entries $r_{ij} = \\mathbf{v}_j \\cdot \\mathbf{e}_i$. QR is the matrix restatement of Gram-Schmidt.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Gram-Schmidt Formula',
        body: '\\mathbf{u}_j = \\mathbf{v}_j - \\sum_{i=1}^{j-1} (\\mathbf{v}_j \\cdot \\mathbf{e}_i)\\,\\mathbf{e}_i \\qquad \\mathbf{e}_j = \\frac{\\mathbf{u}_j}{\\|\\mathbf{u}_j\\|}',
      },
      {
        type: 'insight',
        title: 'Why the Remainder is Orthogonal',
        body: 'For any $i < j$: $(\\mathbf{u}_j) \\cdot \\mathbf{e}_i = (\\mathbf{v}_j - \\sum_k (\\mathbf{v}_j \\cdot \\mathbf{e}_k)\\mathbf{e}_k) \\cdot \\mathbf{e}_i = (\\mathbf{v}_j \\cdot \\mathbf{e}_i) - (\\mathbf{v}_j \\cdot \\mathbf{e}_i) = 0$. The subtraction was designed precisely to cancel this dot product.',
      },
      {
        type: 'definition',
        title: 'QR Decomposition',
        body: 'If $A = [\\mathbf{v}_1 \\cdots \\mathbf{v}_k]$ has linearly independent columns, then:\n$$A = QR$$\nwhere $Q = [\\mathbf{e}_1 \\cdots \\mathbf{e}_k]$ has orthonormal columns and $R$ is upper triangular with $r_{ij} = \\mathbf{v}_j \\cdot \\mathbf{e}_i$.',
      },
      {
        type: 'warning',
        title: 'Gram-Schmidt Requires Linear Independence',
        body: 'If $\\mathbf{v}_j$ is already in the span of $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_{j-1}\\}$, then $\\mathbf{u}_j = \\mathbf{0}$ and cannot be normalized. Gram-Schmidt breaks down — by design — on linearly dependent sets.',
      },
    ],
    visualizations: [
      {
        id: 'QRDecompositionViz',
        title: 'From Gram-Schmidt to QR',
        mathBridge: 'The visualization shows a 2×2 matrix $A$ with its columns as vectors. Run Gram-Schmidt to see $Q$ (the orthonormal columns) and $R$ (the upper triangular matrix) appear. Verify that $QR = A$ by multiplying them back together. Change $A$ and confirm the decomposition always works.',
        caption: 'QR decomposition is Gram-Schmidt, written as a matrix equation.',
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Theorem:** Every finite-dimensional inner product space has an orthonormal basis. The Gram-Schmidt process is the constructive proof — it does not just assert existence, it builds the basis explicitly.',
      'The process preserves span at every step: $\\text{span}\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_j\\} = \\text{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_j\\}$ for each $j$. This is proved by induction: $\\mathbf{e}_j$ is a linear combination of $\\mathbf{v}_1, \\ldots, \\mathbf{v}_j$, and conversely $\\mathbf{v}_j$ can be recovered from $\\mathbf{e}_1, \\ldots, \\mathbf{e}_j$.',
      '**Numerical stability.** The "classical" Gram-Schmidt formula above is mathematically correct but numerically fragile: small rounding errors in floating-point arithmetic accumulate and the resulting vectors drift from true orthogonality. In practice, **Modified Gram-Schmidt** (which subtracts projections one at a time onto the current $\\mathbf{u}_j$ rather than the original $\\mathbf{v}_j$) is used instead. The results are algebraically identical but numerically far more stable.',
      'For large-scale computations, even Modified Gram-Schmidt can be insufficient. The **Householder** and **Givens** methods produce QR decompositions that are more numerically stable and are used in production linear algebra libraries (LAPACK, NumPy, MATLAB).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Gram-Schmidt Produces an ONB',
        body: 'If $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ are linearly independent, the Gram-Schmidt output $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_k\\}$ is an orthonormal basis for $\\text{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$.',
      },
      {
        type: 'insight',
        title: 'Modified vs. Classical Gram-Schmidt',
        body: 'Classical: subtract all projections from the original $\\mathbf{v}_j$.\nModified: subtract projections from the running $\\mathbf{u}_j$ after each one.\nAlgebraically identical. Numerically, Modified is preferred — error does not accumulate.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la4-002-ex1',
      title: 'Gram-Schmidt in ℝ²',
      problem: 'Apply Gram-Schmidt to $\\mathbf{v}_1 = \\begin{bmatrix}3\\\\4\\end{bmatrix}$ and $\\mathbf{v}_2 = \\begin{bmatrix}2\\\\0\\end{bmatrix}$.',
      steps: [
        {
          expression: '\\mathbf{e}_1 = \\frac{\\mathbf{v}_1}{\\|\\mathbf{v}_1\\|} = \\frac{1}{5}\\begin{bmatrix}3\\\\4\\end{bmatrix} = \\begin{bmatrix}3/5\\\\4/5\\end{bmatrix}',
          annotation: 'Normalize the first vector. Its magnitude is $\\sqrt{9+16}=5$.',
          strategyTitle: 'Normalize v₁',
          checkpoint: 'Verify $\\|\\mathbf{e}_1\\| = 1$.',
          hints: ['$(3/5)^2 + (4/5)^2 = 9/25 + 16/25 = 25/25 = 1$. ✓'],
        },
        {
          expression: '\\mathbf{v}_2 \\cdot \\mathbf{e}_1 = \\begin{bmatrix}2\\\\0\\end{bmatrix} \\cdot \\begin{bmatrix}3/5\\\\4/5\\end{bmatrix} = \\frac{6}{5}',
          annotation: 'Compute how much of $\\mathbf{v}_2$ overlaps with $\\mathbf{e}_1$. This is the scalar projection.',
          strategyTitle: 'Compute scalar projection',
          checkpoint: 'What does this number mean geometrically?',
          hints: ['It means $\\mathbf{v}_2$ extends $\\frac{6}{5}$ units in the direction of $\\mathbf{e}_1$.'],
        },
        {
          expression: '\\mathbf{u}_2 = \\mathbf{v}_2 - \\frac{6}{5}\\mathbf{e}_1 = \\begin{bmatrix}2\\\\0\\end{bmatrix} - \\frac{6}{5}\\begin{bmatrix}3/5\\\\4/5\\end{bmatrix} = \\begin{bmatrix}2\\\\0\\end{bmatrix} - \\begin{bmatrix}18/25\\\\24/25\\end{bmatrix} = \\begin{bmatrix}32/25\\\\-24/25\\end{bmatrix}',
          annotation: 'Subtract off the contamination. The result $\\mathbf{u}_2$ is perpendicular to $\\mathbf{e}_1$.',
          strategyTitle: 'Subtract projection',
          checkpoint: 'Verify: $\\mathbf{u}_2 \\cdot \\mathbf{e}_1 = 0$?',
          hints: ['$(32/25)(3/5) + (-24/25)(4/5) = 96/125 - 96/125 = 0$. ✓'],
        },
        {
          expression: '\\|\\mathbf{u}_2\\| = \\sqrt{(32/25)^2 + (24/25)^2} = \\frac{1}{25}\\sqrt{1024+576} = \\frac{40}{25} = \\frac{8}{5}',
          annotation: 'Find the magnitude of $\\mathbf{u}_2$ before normalizing.',
          strategyTitle: 'Compute magnitude',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{e}_2 = \\frac{\\mathbf{u}_2}{\\|\\mathbf{u}_2\\|} = \\frac{5}{8}\\begin{bmatrix}32/25\\\\-24/25\\end{bmatrix} = \\begin{bmatrix}4/5\\\\-3/5\\end{bmatrix}',
          annotation: 'Normalize $\\mathbf{u}_2$. The final orthonormal pair is $\\{\\mathbf{e}_1, \\mathbf{e}_2\\}$.',
          strategyTitle: 'Normalize to get e₂',
          checkpoint: 'Verify: $\\mathbf{e}_1 \\cdot \\mathbf{e}_2 = 0$ and $\\|\\mathbf{e}_2\\| = 1$.',
          hints: ['$(3/5)(4/5) + (4/5)(-3/5) = 12/25 - 12/25 = 0$. ✓  $(4/5)^2 + (-3/5)^2 = 16/25 + 9/25 = 1$. ✓'],
        },
      ],
      conclusion: 'The orthonormal basis is $\\mathbf{e}_1 = [3/5,\\; 4/5]^T$ and $\\mathbf{e}_2 = [4/5,\\; -3/5]^T$. These span the same 2D space as the originals, but now they are perfectly perpendicular and both have unit length.',
    },
    {
      id: 'la4-002-ex2',
      title: 'Gram-Schmidt in ℝ³',
      problem: 'Find an orthonormal basis for the span of $\\mathbf{v}_1 = \\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix}$, $\\mathbf{v}_2 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix}$.',
      steps: [
        {
          expression: '\\mathbf{e}_1 = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix}',
          annotation: '$\\|\\mathbf{v}_1\\| = \\sqrt{2}$. Normalize directly.',
          strategyTitle: 'Normalize v₁',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{v}_2 \\cdot \\mathbf{e}_1 = \\frac{1}{\\sqrt{2}}(1 + 0 + 0) = \\frac{1}{\\sqrt{2}}',
          annotation: 'Scalar projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$.',
          strategyTitle: 'Scalar projection',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{u}_2 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} - \\frac{1}{\\sqrt{2}} \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix} = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} - \\begin{bmatrix}1/2\\\\1/2\\\\0\\end{bmatrix} = \\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix}',
          annotation: 'Subtract the projection. The scalar is $(1/\\sqrt{2}) \\cdot \\mathbf{e}_1 = \\frac{1}{2}[1,1,0]^T$.',
          strategyTitle: 'Subtract projection',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\|\\mathbf{u}_2\\| = \\sqrt{1/4 + 1/4 + 1} = \\sqrt{3/2} = \\frac{\\sqrt{6}}{2} \\qquad \\mathbf{e}_2 = \\frac{1}{\\sqrt{6}}\\begin{bmatrix}1\\\\-1\\\\2\\end{bmatrix}',
          annotation: 'Normalize. (Multiply numerator and denominator by 2 to simplify: $\\mathbf{u}_2 = \\frac{1}{2}[1,-1,2]^T$, so $\\mathbf{e}_2 = [1,-1,2]^T/\\sqrt{6}$.)',
          strategyTitle: 'Normalize to get e₂',
          checkpoint: 'Verify $\\mathbf{e}_1 \\cdot \\mathbf{e}_2 = 0$.',
          hints: ['$(1/\\sqrt{2})(1/\\sqrt{6}) + (1/\\sqrt{2})(-1/\\sqrt{6}) + 0 = 1/\\sqrt{12} - 1/\\sqrt{12} = 0$. ✓'],
        },
      ],
      conclusion: 'The two-dimensional subspace spanned by $\\mathbf{v}_1$ and $\\mathbf{v}_2$ now has the clean orthonormal basis $\\{\\mathbf{e}_1, \\mathbf{e}_2\\}$. Any computation within this subspace is now far simpler.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la4-002-ch1',
      difficulty: 'easy',
      problem: 'Apply Gram-Schmidt to $\\mathbf{v}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix}$ and $\\mathbf{v}_2 = \\begin{bmatrix}3\\\\4\\end{bmatrix}$.',
      hint: '$\\mathbf{v}_1$ is already a unit vector. The projection of $\\mathbf{v}_2$ onto $\\mathbf{v}_1$ is just the x-component of $\\mathbf{v}_2$.',
      walkthrough: [
        {
          expression: '\\mathbf{e}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix}',
          annotation: '$\\mathbf{v}_1$ is already a unit vector.',
        },
        {
          expression: '\\mathbf{u}_2 = \\begin{bmatrix}3\\\\4\\end{bmatrix} - (3)\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}0\\\\4\\end{bmatrix}',
          annotation: 'Scalar projection = $[3,4] \\cdot [1,0] = 3$. Subtract $3\\mathbf{e}_1$.',
        },
        {
          expression: '\\mathbf{e}_2 = \\begin{bmatrix}0\\\\1\\end{bmatrix}',
          annotation: 'Normalize: magnitude is 4, so $\\mathbf{e}_2 = [0,4]/4 = [0,1]$. The standard basis!',
        },
      ],
      answer: 'e₁ = [1,0]ᵀ, e₂ = [0,1]ᵀ',
    },
    {
      id: 'la4-002-ch2',
      difficulty: 'medium',
      problem: 'Show that if $\\mathbf{v}_1$ and $\\mathbf{v}_2$ are already orthogonal (but not necessarily unit length), Gram-Schmidt just normalizes each one — no subtraction needed. Explain why this makes sense.',
      hint: 'Compute $\\mathbf{v}_2 \\cdot \\mathbf{e}_1$. What is it when the vectors are already orthogonal?',
      walkthrough: [
        {
          expression: '\\mathbf{v}_2 \\cdot \\mathbf{e}_1 = \\mathbf{v}_2 \\cdot \\frac{\\mathbf{v}_1}{\\|\\mathbf{v}_1\\|} = \\frac{\\mathbf{v}_1 \\cdot \\mathbf{v}_2}{\\|\\mathbf{v}_1\\|} = 0',
          annotation: 'Because $\\mathbf{v}_1 \\cdot \\mathbf{v}_2 = 0$ by assumption.',
        },
        {
          expression: '\\mathbf{u}_2 = \\mathbf{v}_2 - 0 \\cdot \\mathbf{e}_1 = \\mathbf{v}_2',
          annotation: 'Nothing is subtracted. $\\mathbf{v}_2$ has zero contamination in the $\\mathbf{e}_1$ direction.',
        },
        {
          expression: '\\mathbf{e}_2 = \\mathbf{v}_2 / \\|\\mathbf{v}_2\\|',
          annotation: 'Just normalize. Gram-Schmidt degenerates to simple normalization when the input is already orthogonal.',
        },
      ],
      answer: 'When inputs are already orthogonal, Gram-Schmidt reduces to pure normalization.',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\mathbf{e}_j', meaning: 'The jth orthonormal basis vector produced by Gram-Schmidt' },
      { symbol: '\\mathbf{v}_j \\cdot \\mathbf{e}_i', meaning: 'Scalar projection of v_j onto e_i — the amount of contamination to remove' },
      { symbol: 'A = QR', meaning: 'QR decomposition: Q has orthonormal columns, R is upper triangular' },
      { symbol: 'Q^{-1} = Q^T', meaning: 'For orthogonal matrices, the inverse is free — just transpose' },
    ],
    rulesOfThumb: [
      'Each new vector = original vector minus its projections onto all prior orthonormal vectors.',
      'The subtraction manufactures orthogonality — it does not check for it.',
      'Gram-Schmidt fails on linearly dependent sets (subtraction gives the zero vector).',
      'In code, use Modified Gram-Schmidt or Householder for numerical stability.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la4-001',
        label: 'Orthogonal Projections',
        note: 'Every subtraction step in Gram-Schmidt IS an orthogonal projection. The formula $\\mathbf{v}_j \\cdot \\mathbf{e}_i$ is the scalar projection, and $(\\mathbf{v}_j \\cdot \\mathbf{e}_i)\\mathbf{e}_i$ is the vector projection.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-003',
        label: 'Least Squares',
        note: 'Gram-Schmidt produces QR, and QR makes least squares computationally efficient. The normal equations $A^TA\\mathbf{x}=A^T\\mathbf{b}$ become $R\\mathbf{x}=Q^T\\mathbf{b}$ — a simple triangular system.',
      },
      {
        lessonId: 'la4-004',
        label: 'Singular Value Decomposition',
        note: 'SVD generalizes QR: instead of one set of orthonormal vectors, SVD finds two (one for the domain, one for the codomain). Gram-Schmidt is the single-set case.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Gram-Schmidt = project, subtract contamination, normalize. Repeat.',
    'The subtraction manufactures orthogonality — guaranteed by algebra.',
    'Output spans the same space as the input, but with clean right angles.',
    'QR decomposition is Gram-Schmidt written as a matrix equation.',
    'Orthonormal basis: inverse = transpose. All coordinates = dot products.',
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

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-002-assess-1',
        type: 'input',
        text: 'After running Gram-Schmidt on two vectors, what is the dot product of the two output vectors?',
        answer: '0',
        hint: 'The whole point of Gram-Schmidt is to make the output vectors perpendicular.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'gram-schmidt-q1',
      type: 'choice',
      text: 'In the Gram-Schmidt process, why do we subtract the projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$?',
      options: [
        'To increase the length of $\\mathbf{v}_2$',
        'To remove the component of $\\mathbf{v}_2$ that overlaps with $\\mathbf{e}_1$, guaranteeing the remainder is perpendicular',
        'To ensure $\\mathbf{v}_2$ points in the same direction as $\\mathbf{e}_1$',
        'To normalize $\\mathbf{v}_2$ to unit length',
      ],
      answer: 'To remove the component of $\\mathbf{v}_2$ that overlaps with $\\mathbf{e}_1$, guaranteeing the remainder is perpendicular',
      hints: ['Think of projection as the "shadow" of $\\mathbf{v}_2$ on $\\mathbf{e}_1$. Subtracting the shadow removes the overlap.'],
      reviewSection: 'Intuition tab — The Subtraction IS the Orthogonalization',
    },
    {
      id: 'gram-schmidt-q2',
      type: 'choice',
      text: 'What happens when you apply Gram-Schmidt to a linearly dependent set of vectors?',
      options: [
        'You get an orthonormal basis for the full space',
        'The process produces a zero vector, which cannot be normalized — it breaks down',
        'You get the standard basis automatically',
        'The process runs but gives incorrect results',
      ],
      answer: 'The process produces a zero vector, which cannot be normalized — it breaks down',
      hints: ['If $\\mathbf{v}_j$ is in the span of the previous vectors, subtracting all projections leaves exactly $\\mathbf{0}$.'],
      reviewSection: 'Math tab — Gram-Schmidt Requires Linear Independence',
    },
    {
      id: 'gram-schmidt-q3',
      type: 'choice',
      text: 'If $Q$ is a matrix with orthonormal columns, what is $Q^{-1}$?',
      options: ['$Q^2$', '$-Q$', '$Q^T$', '$\\det(Q) \\cdot Q$'],
      answer: '$Q^T$',
      hints: ['This is the defining property of an orthogonal matrix. It follows from $Q^TQ = I$ (which holds because $Q$\'s columns are orthonormal).'],
      reviewSection: 'Intuition tab — Orthonormal Superpower',
    },
  ],
};
