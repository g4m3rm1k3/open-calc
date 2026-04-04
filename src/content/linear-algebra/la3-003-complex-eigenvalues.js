export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la3-003',
  slug: 'complex-eigenvalues',
  chapter: 'la3',
  order: 3,
  title: 'Complex Eigenvalues',
  subtitle: 'When a matrix rotates space, real eigenvectors vanish — and algebra forces us into complex numbers that beautifully encode both rotation and scaling.',
  tags: ['complex eigenvalues', 'rotation matrix', 'conjugate pairs', 'spiral', 'imaginary numbers', 'polar form', 'dynamical systems'],
  aliases: 'complex eigenvalues imaginary rotation spiral conjugate pair polar form oscillation dynamical systems',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "A 90-degree rotation matrix spins every single vector off its original line. According to our definition, it has no eigenvectors. So why does the characteristic equation still have solutions?",
    realWorldContext: "Complex eigenvalues are the mathematical fingerprint of oscillation and rotation. Electrical engineers see them in AC circuits (where current oscillates). Mechanical engineers see them when analyzing vibrations and resonance. The roots of a feedback control system's characteristic equation are eigenvalues — complex roots mean the system oscillates, real roots mean it decays steadily. Even the stability of an aircraft autopilot is determined by whether its system matrix has complex eigenvalues and how large their real parts are. Understanding complex eigenvalues means understanding any system that oscillates, spirals, or rotates.",
    previewVisualizationId: 'LALesson10_ComplexEigen',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You know how to find eigenvalues from the characteristic equation $\\det(A - \\lambda I) = 0$, and you know how to diagonalize a matrix when it has enough real eigenvectors. But what about a matrix that only rotates — like a 90° rotation? Geometrically, it pushes every single vector off its original line. There are no real eigenvectors at all.',
      'Yet the characteristic equation is a polynomial — and by the Fundamental Theorem of Algebra, every polynomial with real coefficients has roots. They might just be complex numbers. This is not a failure of linear algebra; it is algebra doing exactly what it is supposed to do.',
      'Here is the key: when a matrix has complex eigenvalues, those eigenvalues come in **conjugate pairs** $a + bi$ and $a - bi$ (for real matrices). The real part $a$ controls stretching/shrinking, and the imaginary part $b$ controls rotation.',
      'Think of the complex eigenvalue $\\lambda = a + bi$ in polar form: its **magnitude** is $r = \\sqrt{a^2 + b^2}$ (the stretch factor) and its **angle** is $\\theta = \\arctan(b/a)$ (the rotation angle). Multiplying repeatedly by $\\lambda$ spirals outward if $r > 1$, spirals inward if $r < 1$, and circles if $r = 1$.',
      'For the 90° rotation matrix, $\\lambda = i = 0 + 1\\cdot i$. The real part is 0 (no stretching), the imaginary part is 1. Magnitude = $\\sqrt{0^2+1^2} = 1$ (no scaling), angle = 90° (pure rotation). Exactly what a rotation matrix should do.',
      '**Why this matters practically.** If you are analyzing a dynamical system — anything that evolves over time — the eigenvalues of its matrix tell you everything about long-term behavior: do things grow, shrink, or oscillate? Complex eigenvalues with $|\\lambda| > 1$ mean spiral growth. $|\\lambda| < 1$ means spiral decay toward equilibrium. $|\\lambda| = 1$ means perfect sustained oscillation. The eigenvalues are the system\'s fate, written in complex numbers.',
      '**Where this is heading:** Phase 4 moves to non-square matrices and the most powerful factorization in linear algebra: the Singular Value Decomposition (SVD), which generalizes everything you have learned about eigenvalues.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** Diagonalization — rebuilding coordinates in the eigenvector basis.\n**This lesson:** Complex eigenvalues — what rotation looks like algebraically, and how $a + bi$ encodes spinning and scaling.\n**Next:** Phase 4 — Orthogonal Projections, Gram-Schmidt, Least Squares, and SVD.',
      },
      {
        type: 'insight',
        title: 'Complex Eigenvalue Geometry',
        body: 'For $\\lambda = a + bi$:\n\n• $r = |\\lambda| = \\sqrt{a^2 + b^2}$ → stretch factor\n• $\\theta = \\arctan(b/a)$ → rotation angle per step\n\n$r > 1$: spirals outward\n$r = 1$: pure rotation (circle)\n$r < 1$: spirals inward (decays)',
      },
      {
        type: 'theorem',
        title: 'Conjugate Pairs Theorem',
        body: 'If $A$ is a real matrix and $\\lambda = a + bi$ is an eigenvalue, then $\\bar{\\lambda} = a - bi$ is also an eigenvalue.\n\nReal matrices always have complex eigenvalues in conjugate pairs.',
      },
      {
        type: 'warning',
        title: 'No Real Eigenvectors for Pure Rotations',
        body: 'A matrix that purely rotates space (no fixed directions) has no real eigenvectors. This is not a problem — it just means diagonalization over $\\mathbb{R}$ fails. Over $\\mathbb{C}$ (complex numbers), the matrix is still diagonalizable.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson10_ComplexEigen',
        title: 'Complex Eigenvalues and Spiral Behavior',
        mathBridge: 'Drag the slider from "Shear" to "Rotation." Watch the real eigenvectors vanish from the 2D plane — no arrow stays on its line after a rotation. Now enter a matrix with complex eigenvalues $a + bi$. Apply the matrix repeatedly to a starting vector. When $|\\lambda| > 1$, the vector spirals outward. When $|\\lambda| < 1$, it spirals in. When $|\\lambda| = 1$, it traces a circle. The magnitude $r = \\sqrt{a^2+b^2}$ determines the spiral direction.',
        caption: 'Complex eigenvalues encode the spiral rate and rotation angle of a transformation.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**The 90° rotation matrix.** The standard counterclockwise 90° rotation is:\n\n$$A = \\begin{bmatrix}0 & -1 \\\\ 1 & 0\\end{bmatrix}$$\n\nThe characteristic equation:\n\n$$\\det(A - \\lambda I) = \\det\\begin{bmatrix}-\\lambda & -1 \\\\ 1 & -\\lambda\\end{bmatrix} = \\lambda^2 + 1 = 0$$\n\nSolving: $\\lambda^2 = -1 \\Rightarrow \\lambda = \\pm i$. The eigenvalues are $i$ and $-i$ — a conjugate pair.',
      '**General rotation by angle $\\theta$.** The counterclockwise rotation matrix is:\n\n$$R_\\theta = \\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$$\n\nIts characteristic equation is $\\lambda^2 - 2\\cos\\theta\\,\\lambda + 1 = 0$, giving:\n\n$$\\lambda = \\cos\\theta \\pm i\\sin\\theta = e^{\\pm i\\theta}$$\n\nThe eigenvalues are points on the unit circle at angle $\\pm\\theta$ in the complex plane. Their magnitude is always 1 — pure rotation, no scaling.',
      '**Reading off spiral behavior.** For a general $2\\times 2$ real matrix with complex eigenvalues $\\lambda = a \\pm bi$:\n\n- Magnitude: $r = |\\lambda| = \\sqrt{a^2 + b^2}$\n- Angle per application: $\\theta = \\arctan(b/a)$\n- After $k$ applications: the transformation is equivalent to scaling by $r^k$ and rotating by $k\\theta$\n\nSo $r > 1$ grows, $r < 1$ decays, $r = 1$ oscillates indefinitely.',
      '**Euler\'s formula connects everything.** Euler\'s formula states $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$. This means a complex eigenvalue $a + bi$ can be written in polar form as $re^{i\\theta}$, where $r = \\sqrt{a^2+b^2}$ and $\\theta = \\arctan(b/a)$. Repeated application of the eigenvalue is $r^n e^{in\\theta}$ — a spiral in the complex plane.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Complex Eigenvalue in Polar Form',
        body: '\\lambda = a + bi = re^{i\\theta}\n\n\\text{where} \\quad r = \\sqrt{a^2+b^2}, \\quad \\theta = \\arctan(b/a)\n\n\\lambda^k = r^k e^{ik\\theta} \\quad \\text{(spirals after k steps)}',
      },
      {
        type: 'theorem',
        title: 'Rotation Matrix Eigenvalues',
        body: '\\text{Rotation by } \\theta: \\quad \\lambda = e^{\\pm i\\theta} = \\cos\\theta \\pm i\\sin\\theta\n\n|\\lambda| = 1 \\; \\text{always (pure rotation, no scaling)}',
      },
      {
        type: 'insight',
        title: 'Stability in Dynamical Systems',
        body: 'For a system $\\mathbf{x}_{n+1} = A\\mathbf{x}_n$:\n\n• All $|\\lambda_i| < 1$ → stable (converges to origin)\n• Any $|\\lambda_i| > 1$ → unstable (blows up)\n• All $|\\lambda_i| = 1$ → neutral (oscillates forever)\n\nThis is the eigenvalue stability criterion.',
      },
    ],
    visualizations: [
      {
        id: 'ComplexPlaneEigenvalueViz',
        title: 'Eigenvalues in the Complex Plane',
        mathBridge: 'The complex plane is shown with the unit circle. Each eigenvalue $\\lambda = a + bi$ appears as a point at coordinates $(a, b)$. Drag the eigenvalue point and watch the trajectory of a starting vector as the matrix is applied repeatedly. Points inside the unit circle → spiral in. Outside → spiral out. On the circle → orbit. The angle $\\theta$ from the positive real axis is the rotation angle per step.',
        caption: 'The unit circle separates convergence from divergence.',
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Why conjugate pairs?** Let $A$ be a real matrix with $A\\mathbf{v} = \\lambda\\mathbf{v}$ where $\\lambda = a + bi \\in \\mathbb{C}$. Take the complex conjugate of both sides: $\\overline{A\\mathbf{v}} = \\overline{\\lambda\\mathbf{v}}$. Since $A$ has real entries, $\\overline{A\\mathbf{v}} = A\\bar{\\mathbf{v}}$. So $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$. Thus $\\bar{\\lambda} = a - bi$ is also an eigenvalue with eigenvector $\\bar{\\mathbf{v}}$.',
      '**The real canonical form.** Even though we cannot diagonalize a real matrix with complex eigenvalues over $\\mathbb{R}$, we can put it in a **real block diagonal form**: each conjugate pair $a \\pm bi$ contributes a $2 \\times 2$ rotation-scaling block:\n\n$$\\begin{bmatrix}a & -b \\\\ b & a\\end{bmatrix}$$\n\nThis block rotates by $\\arctan(b/a)$ and scales by $\\sqrt{a^2+b^2}$. The full matrix in this basis becomes block diagonal with these $2\\times 2$ blocks for complex pairs and scalar entries for real eigenvalues.',
      '**Over $\\mathbb{C}$, every matrix is diagonalizable... almost.** The Fundamental Theorem of Algebra guarantees the characteristic polynomial has $n$ roots in $\\mathbb{C}$. If those roots are all distinct, the matrix is diagonalizable over $\\mathbb{C}$. If there are repeated roots, the Jordan form (over $\\mathbb{C}$) captures the structure, with 1s on the superdiagonal for non-diagonalizable cases.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Real Canonical (Block Diagonal) Form',
        body: 'Every real matrix with conjugate eigenvalue pair $a \\pm bi$ has a $2\\times 2$ block in its real canonical form:\n\n$$\\begin{bmatrix}a & -b \\\\ b & a\\end{bmatrix} = r\\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$$\n\nwhere $r = \\sqrt{a^2+b^2}$ and $\\theta = \\arctan(b/a)$.',
      },
      {
        type: 'insight',
        title: 'Trace and Determinant Still Apply',
        body: 'For a 2×2 real matrix with complex eigenvalues $a \\pm bi$:\n\n$\\text{trace}(A) = 2a$ (sum of conjugates)\n\n$\\det(A) = a^2 + b^2 = r^2$ (product of conjugates)\n\nThese are real even though the eigenvalues are complex.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la3-003-ex1',
      title: 'Finding Complex Eigenvalues of a Rotation Matrix',
      problem: 'Find the eigenvalues of the 90° rotation matrix $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ and interpret them geometrically.',
      steps: [
        {
          expression: '\\det(A - \\lambda I) = \\det\\begin{bmatrix}-\\lambda&-1\\\\1&-\\lambda\\end{bmatrix} = \\lambda^2 - (0) + 1 = \\lambda^2 + 1 = 0',
          annotation: 'The characteristic equation. Note: trace $= 0$ (no real part), det $= 1$ (unit magnitude). Both match conjugate-pair predictions.',
          strategyTitle: 'Characteristic equation',
          checkpoint: 'Why is there no $\\lambda$ term in the middle?',
          hints: ['The middle coefficient is $-\\text{trace}(A) = 0$, since both diagonal entries of $A$ are 0.'],
        },
        {
          expression: '\\lambda^2 = -1 \\quad \\Rightarrow \\quad \\lambda = \\pm i',
          annotation: 'No real solutions — imaginary roots. This confirms: no real vector stays on its line after a 90° rotation.',
          strategyTitle: 'Solve for eigenvalues',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '|\\lambda| = \\sqrt{0^2 + 1^2} = 1, \\quad \\theta = \\arctan(1/0) = 90°',
          annotation: 'Magnitude 1: no stretching. Angle 90°: rotates each step by exactly 90°. The eigenvalue IS the rotation — written as a complex number.',
          strategyTitle: 'Interpret geometrically',
          checkpoint: 'What happens after 4 applications of $A$?',
          hints: ['$\\lambda^4 = i^4 = 1$ — back to the identity. Four 90° rotations = 360° = no net rotation. Makes sense geometrically.'],
        },
      ],
      conclusion: 'Eigenvalues $\\pm i$ encode a pure 90° rotation with no scaling. Repeated application traces a perfect circle. After 4 steps, every vector returns to its starting position.',
    },
    {
      id: 'la3-003-ex2',
      title: 'Spiral Behavior from Complex Eigenvalues',
      problem: 'A matrix has eigenvalue $\\lambda = 0.5 + 0.5i$. Describe the long-term behavior of vectors under repeated application.',
      steps: [
        {
          expression: 'r = |\\lambda| = \\sqrt{0.5^2 + 0.5^2} = \\sqrt{0.5} = \\frac{1}{\\sqrt{2}} \\approx 0.707',
          annotation: 'Compute the magnitude. Since $r < 1$, the transformation shrinks vectors.',
          strategyTitle: 'Compute magnitude',
          checkpoint: 'Is $r$ greater than, equal to, or less than 1?',
          hints: ['$r \\approx 0.707 < 1$. So the transformation shrinks — vectors spiral inward.'],
        },
        {
          expression: '\\theta = \\arctan\\!\\left(\\frac{0.5}{0.5}\\right) = \\arctan(1) = 45°',
          annotation: 'Each application rotates by 45°.',
          strategyTitle: 'Compute rotation angle',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{After } k \\text{ steps: scale by } r^k = \\left(\\tfrac{1}{\\sqrt{2}}\\right)^k, \\text{ rotate by } 45k°',
          annotation: 'The vector spirals inward (shrinking) while rotating. After 8 steps: $45° \\times 8 = 360°$ (full circle), but $r^8 = (1/\\sqrt{2})^8 = 1/16$ — now 16 times smaller.',
          strategyTitle: 'Describe trajectory',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'r^k \\to 0 \\text{ as } k \\to \\infty',
          annotation: 'Long-term: the vector spirals toward the origin. The system is stable — all vectors converge to zero.',
          strategyTitle: 'Long-term behavior',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: '$\\lambda = 0.5 + 0.5i$ produces a stable spiral: each step rotates 45° and shrinks by $1/\\sqrt{2} \\approx 0.707$. In the long run, every vector decays to the origin. The system is stable.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la3-003-ch1',
      difficulty: 'easy',
      problem: 'Find the eigenvalues of $A = \\begin{bmatrix}1&-2\\\\2&1\\end{bmatrix}$ and state whether each vector spirals in, out, or circles.',
      hint: 'Compute the characteristic equation. Then find $|\\lambda|$.',
      walkthrough: [
        {
          expression: '\\det(A - \\lambda I) = (1-\\lambda)^2 + 4 = \\lambda^2 - 2\\lambda + 5 = 0',
          annotation: 'Characteristic equation.',
        },
        {
          expression: '\\lambda = \\frac{2 \\pm \\sqrt{4 - 20}}{2} = \\frac{2 \\pm \\sqrt{-16}}{2} = 1 \\pm 2i',
          annotation: 'Quadratic formula with complex discriminant.',
        },
        {
          expression: 'r = |1 + 2i| = \\sqrt{1^2 + 2^2} = \\sqrt{5} \\approx 2.24 > 1',
          annotation: '$r > 1$: vectors spiral outward — the system is unstable.',
        },
      ],
      answer: 'λ = 1 ± 2i, |λ| = √5 > 1, spirals outward (unstable)',
    },
    {
      id: 'la3-003-ch2',
      difficulty: 'medium',
      problem: 'For a system with eigenvalue $\\lambda = -0.8i$, what is the magnitude $r$, the rotation angle $\\theta$, and the long-term behavior?',
      hint: 'Write $\\lambda = 0 + (-0.8)i$. Then $r = |\\lambda|$ and $\\theta = \\arctan(-0.8/0)$.',
      walkthrough: [
        {
          expression: 'r = |\\lambda| = \\sqrt{0^2 + (-0.8)^2} = 0.8',
          annotation: 'Magnitude is 0.8 — less than 1.',
        },
        {
          expression: '\\theta = \\arctan(-0.8 / 0) = -90°',
          annotation: 'The imaginary axis has $a = 0$, so the angle is $\\pm 90°$. Negative imaginary part → $-90°$ (clockwise rotation).',
        },
        {
          expression: 'r = 0.8 < 1 \\Rightarrow \\text{spiral inward — stable}',
          annotation: 'Each step rotates 90° clockwise and shrinks by 0.8. Converges to origin.',
        },
      ],
      answer: 'r = 0.8 < 1, θ = -90° (clockwise), spirals inward — stable convergence',
    },
    {
      id: 'la3-003-ch3',
      difficulty: 'hard',
      problem: 'A real $2\\times 2$ matrix has complex eigenvalues $\\lambda = 3 \\pm 4i$. Without finding the matrix, state: (a) its trace, (b) its determinant, (c) whether it is stable.',
      hint: 'Trace = sum of eigenvalues. Det = product of eigenvalues. Use conjugate pair properties.',
      walkthrough: [
        {
          expression: '\\text{trace}(A) = \\lambda_1 + \\lambda_2 = (3+4i) + (3-4i) = 6',
          annotation: 'Sum of conjugates: imaginary parts cancel.',
        },
        {
          expression: '\\det(A) = \\lambda_1 \\cdot \\lambda_2 = (3+4i)(3-4i) = 9 + 16 = 25',
          annotation: 'Product of conjugates: $(a+bi)(a-bi) = a^2 + b^2 = 3^2 + 4^2 = 25$.',
        },
        {
          expression: 'r = |\\lambda| = \\sqrt{3^2 + 4^2} = 5 > 1 \\Rightarrow \\text{unstable}',
          annotation: 'Magnitude 5 — each step grows by factor 5. Vectors spiral outward rapidly.',
        },
      ],
      answer: 'trace = 6, det = 25, |λ| = 5 > 1 → unstable (spirals out)',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\lambda = a + bi', meaning: 'Complex eigenvalue: a = real part (scaling), b = imaginary part (rotation)' },
      { symbol: 'r = |\\lambda| = \\sqrt{a^2+b^2}', meaning: 'Magnitude — the stretch/shrink factor per step' },
      { symbol: '\\theta = \\arctan(b/a)', meaning: 'Angle — the rotation per step in radians (or degrees)' },
      { symbol: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta', meaning: "Euler's formula — connects complex exponentials to rotation" },
    ],
    rulesOfThumb: [
      '|λ| > 1 → unstable (grows/spirals out). |λ| < 1 → stable (decays/spirals in). |λ| = 1 → neutral (orbits).',
      'Real matrices always have complex eigenvalues in conjugate pairs a±bi.',
      'Trace = sum of eigenvalues (real even for complex pairs). Det = product (also real).',
      'Pure imaginary eigenvalues (a=0) → pure rotation with no scaling.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la3-001',
        label: 'Characteristic Equation',
        note: 'Complex eigenvalues come from the same $\\det(A - \\lambda I) = 0$ equation — just with no real roots. The quadratic formula gives complex solutions when the discriminant $b^2 - 4ac < 0$.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-001',
        label: 'Orthogonal Projections',
        note: 'Phase 4 moves away from eigenvalues to projections and decompositions. SVD at the end of Phase 4 brings everything together — including what to do with non-square matrices that have no eigenvalues at all.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'No real eigenvectors → characteristic polynomial has complex roots.',
    'λ = a + bi encodes rotation (b) and scaling (a) in one number.',
    'Magnitude |λ| = √(a²+b²) tells you if it grows, shrinks, or stays constant.',
    'Real matrices → complex eigenvalues always come in conjugate pairs a±bi.',
    '|λ| < 1 → stable (decays). |λ| > 1 → unstable (grows). |λ| = 1 → oscillates.',
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
        id: 'la3-003-assess-1',
        type: 'input',
        text: 'A matrix has eigenvalue $\\lambda = 0 + 3i$. What is $|\\lambda|$?',
        answer: '3',
        hint: '$|0 + 3i| = \\sqrt{0^2 + 3^2} = 3$.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'complex-eigenvalues-q1',
      type: 'choice',
      text: 'A system has eigenvalue $\\lambda = 0.9 + 0.3i$. What is the long-term behavior of vectors under repeated application?',
      options: [
        'They grow larger without bound',
        'They spiral inward toward the origin',
        'They orbit in a perfect circle',
        'They stay at a fixed point',
      ],
      answer: 'They spiral inward toward the origin',
      hints: ['Compute $|\\lambda| = \\sqrt{0.9^2 + 0.3^2} = \\sqrt{0.81+0.09} = \\sqrt{0.90} \\approx 0.949 < 1$. Magnitude less than 1 means spiraling inward.'],
      reviewSection: 'Intuition tab — Complex Eigenvalue Geometry',
    },
    {
      id: 'complex-eigenvalues-q2',
      type: 'choice',
      text: 'Why do real matrices always have complex eigenvalues in conjugate pairs?',
      options: [
        'Because complex numbers always come in pairs',
        'Because taking the complex conjugate of both sides of $A\\mathbf{v}=\\lambda\\mathbf{v}$ gives $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$, and $A$ stays the same since it has real entries',
        'Because the characteristic polynomial has even degree',
        'Because eigenvalues must be real in the end',
      ],
      answer: 'Because taking the complex conjugate of both sides of $A\\mathbf{v}=\\lambda\\mathbf{v}$ gives $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$, and $A$ stays the same since it has real entries',
      hints: ['Conjugating $A\\mathbf{v} = \\lambda\\mathbf{v}$: since $A$ is real, $\\overline{A\\mathbf{v}} = A\\bar{\\mathbf{v}}$. So $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$ — $\\bar{\\lambda}$ is automatically also an eigenvalue.'],
      reviewSection: 'Rigor tab — Why Conjugate Pairs?',
    },
    {
      id: 'complex-eigenvalues-q3',
      type: 'input',
      text: 'A real $2\\times 2$ matrix has eigenvalues $2 \\pm 3i$. What is its determinant?',
      answer: '13',
      hints: ['$\\det = \\lambda_1 \\cdot \\lambda_2 = (2+3i)(2-3i) = 4+9 = 13$.'],
      reviewSection: 'Rigor tab — Trace and Determinant Still Apply',
    },
    {
      id: 'complex-eigenvalues-q4',
      type: 'choice',
      text: 'The eigenvalues of the 90° rotation matrix are $\\lambda = \\pm i$. What is $\\lambda^4$ (after 4 applications)?',
      options: ['$-1$', '$i$', '$1$', '$0$'],
      answer: '$1$',
      hints: ['$i^4 = i^2 \\cdot i^2 = (-1)(-1) = 1$. Four 90° rotations = 360° = full circle back to the start.'],
      reviewSection: 'Examples tab — 90° Rotation Matrix',
    },
  ],
};
