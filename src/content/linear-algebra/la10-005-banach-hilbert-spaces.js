export default {
  id: 'la10-005',
  slug: 'banach-hilbert-spaces',
  chapter: 'la10',
  order: 5,
  title: 'Banach and Hilbert Spaces',
  subtitle: 'A Banach space is a complete normed space; a Hilbert space adds an inner product. Completeness enables powerful analytic tools: Cauchy sequences converge, projections are well-defined, and the Riesz representation theorem identifies $H^* \\cong H$.',
  tags: ['Banach space', 'Hilbert space', 'completeness', 'Cauchy sequence', 'Riesz representation', 'orthogonal projection', 'L2 space', 'Fourier series'],
  aliases: 'Banach space Hilbert space completeness Cauchy sequence Riesz representation theorem orthogonal projection L2 space Fourier series inner product norm',

  hook: {
    question: "The rationals $\\mathbb{Q}$ have a distance but aren\'t complete: the sequence $3, 3.1, 3.14, 3.141, \\ldots$ converges to $\\pi \\notin \\mathbb{Q}$. What happens when you need calculus in infinite dimensions? You need completeness.",
    realWorldContext: "Hilbert spaces are the mathematical language of quantum mechanics, signal processing, and machine learning. The $L^2$ space of square-integrable functions on $[0,1]$ is the Hilbert space where Fourier series live. Every signal can be decomposed into an orthonormal basis (Fourier modes, wavelets, eigenfunctions of the Laplacian). Reproducing kernel Hilbert spaces (RKHS) are the foundation of kernel methods (SVMs, Gaussian processes). Banach spaces (like $L^p$ for $p \\neq 2$) appear in optimization (sparsity-promoting $L^1$ norms) and PDE theory.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Hilbert space ideas in $\\mathbb{R}^2$.** Start small: $H = \\mathbb{R}^2$ with the dot product $\\langle(x_1,x_2),(y_1,y_2)\\rangle = x_1 y_1 + x_2 y_2$. The subspace $M = \\{(x,0)\\}$ (x-axis) is closed. Take $\\mathbf{x} = (3,4)$. Its orthogonal projection onto $M$ is $P_M\\mathbf{x} = (3,0)$, and the remainder $(0,4)$ is perpendicular to $M$. Pythagorean: $\\|(3,4)\\|^2 = \\|(3,0)\\|^2 + \\|(0,4)\\|^2 = 9+16 = 25$ ✓. The functional $f(x_1,x_2) = 3x_1 + 4x_2$ is bounded: by Riesz, $f(\\mathbf{x}) = \\langle \\mathbf{x}, (3,4)\\rangle$, so the representing vector is exactly $(3,4)$. These ideas — projection, Pythagorean theorem, Riesz representation — all extend to infinite-dimensional Hilbert spaces like $L^2[0,1]$.',
      '**Hilbert spaces.** A **Hilbert space** is a Banach space whose norm comes from an inner product: $\\|\\mathbf{x}\\|^2 = \\langle\\mathbf{x},\\mathbf{x}\\rangle$. The inner product adds geometric structure (angles, orthogonality). Examples: $\\mathbb{R}^n$ with dot product; $\\ell^2 = \\{(a_n) : \\sum|a_n|^2 < \\infty\\}$ with $\\langle \\mathbf{a}, \\mathbf{b}\\rangle = \\sum a_n b_n$; $L^2[a,b] = \\{f : \\int_a^b |f|^2 < \\infty\\}$ with $\\langle f, g\\rangle = \\int_a^b f(x)g(x)\\,dx$.',
      '**Orthonormal bases.** In a separable Hilbert space, an **orthonormal basis** (ONB) $\\{\\mathbf{e}_n\\}$ satisfies $\\langle \\mathbf{e}_m, \\mathbf{e}_n\\rangle = \\delta_{mn}$ and $\\overline{\\text{span}\\{\\mathbf{e}_n\\}} = H$ (closed span is all of $H$). For any $\\mathbf{x} \\in H$: **Parseval\'s identity** $\\|\\mathbf{x}\\|^2 = \\sum_n |\\langle\\mathbf{x},\\mathbf{e}_n\\rangle|^2$ and **Fourier expansion** $\\mathbf{x} = \\sum_n \\langle\\mathbf{x},\\mathbf{e}_n\\rangle \\mathbf{e}_n$ (converges in $H$). This generalizes the finite-dimensional case exactly.',
      '**Riesz representation theorem.** For any bounded linear functional $f: H \\to \\mathbb{F}$, there exists a unique $\\mathbf{y} \\in H$ such that $f(\\mathbf{x}) = \\langle\\mathbf{x},\\mathbf{y}\\rangle$ for all $\\mathbf{x}$. This gives the natural isomorphism $H^* \\cong H$ (Hilbert spaces are reflexive). In machine learning, this justifies the "kernel trick": a linear functional in a feature space is a kernel evaluation.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Prediction: Fourier coefficients via inner product',
        body: 'In $L^2[0,1]$, the functions $e_1(x) = 1$ and $e_2(x) = \\sqrt{3}(2x-1)$ form an orthonormal set (verify: $\\langle e_1,e_1\\rangle = \\int_0^1 1\\,dx = 1$ ✓; $\\langle e_2,e_2\\rangle = 3\\int_0^1(2x-1)^2dx = 1$ ✓; $\\langle e_1,e_2\\rangle = \\sqrt{3}\\int_0^1(2x-1)dx = 0$ ✓). **Before computing:** predict the Fourier coefficients of $f(x)=x^2$ in this basis. After predicting: $c_1 = \\langle x^2, 1\\rangle = \\int_0^1 x^2 dx = 1/3$; $c_2 = \\langle x^2, \\sqrt{3}(2x-1)\\rangle = \\sqrt{3}(2/4-1/3) = \\sqrt{3}/6$. Projection: $x^2 \\approx \\frac{1}{3}\\cdot 1 + \\frac{\\sqrt{3}}{6}\\cdot\\sqrt{3}(2x-1) = x - \\frac{1}{6}$.',
      },
      {
        type: 'theorem',
        title: 'Projection Theorem',
        body: 'Let $M$ be a closed subspace of a Hilbert space $H$. For any $\\mathbf{x} \\in H$, there exists a unique decomposition $\\mathbf{x} = P_M\\mathbf{x} + \\mathbf{x}^\\perp$ with $P_M\\mathbf{x} \\in M$ and $\\mathbf{x}^\\perp \\in M^\\perp$.\n\n$P_M\\mathbf{x}$ is the **orthogonal projection** of $\\mathbf{x}$ onto $M$: the unique nearest point in $M$:\n$\\|\\mathbf{x} - P_M\\mathbf{x}\\| = \\min_{\\mathbf{m} \\in M}\\|\\mathbf{x} - \\mathbf{m}\\|$\n\nNote: The closed subspace condition is crucial — open or non-closed subspaces may not have projections.',
      },
      {
        type: 'theorem',
        title: 'Riesz Representation Theorem',
        body: 'If $H$ is a Hilbert space and $f: H \\to \\mathbb{F}$ is a bounded linear functional, then there exists a unique $\\mathbf{y} \\in H$ with $\\|\\mathbf{y}\\| = \\|f\\|$ such that:\n$f(\\mathbf{x}) = \\langle\\mathbf{x}, \\mathbf{y}\\rangle$ for all $\\mathbf{x} \\in H$\n\nConsequence: $H^* \\cong H$ (Hilbert spaces are self-dual). Unlike general Banach spaces, the dual of a Hilbert space is the space itself.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Hilbert Space Concepts',
        mathBridge: 'Explore Fourier series as Hilbert space projections and Parseval\'s identity.',
        caption: 'Fourier series = orthogonal projection onto span of trigonometric basis in L^2.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Discrete Parseval\'s identity',
              prose: ['Verify Parseval\'s identity: sum of squared Fourier coefficients = squared norm.'],
              code: `% Parseval's identity in R^n (finite-dim Hilbert space)
% Use an orthonormal basis and compute Fourier coefficients
n = 6
% DFT matrix as an orthonormal basis (normalized)
j = (0:n-1)';
k = (0:n-1);
Q = exp(2*pi*1i*j*k/n) / sqrt(n)   % n x n unitary DFT matrix

% A vector
x = [1;2;3;2;1;0]

% Fourier coefficients
c = Q' * x   % = Q^* x (adjoint for complex)

% Parseval: sum |c_k|^2 = ||x||^2
lhs = sum(abs(c).^2)
rhs = norm(x)^2
disp('Parseval: sum|c_k|^2 vs ||x||^2:')
[lhs, rhs]

% Reconstruct: x = Q c
x_reconstructed = Q * c
disp('Reconstruction error:')
norm(x - x_reconstructed)
`,
            },
            {
              id: 2,
              cellTitle: 'L^2 Fourier series projection',
              prose: ['Approximate a function by its first k Fourier modes (projection in L^2).'],
              code: `% Approximate f(x) = x on [0,1] by Fourier series
% Orthonormal basis: {sqrt(2)*sin(n*pi*x)} for n=1,2,...
n_points = 200
x = linspace(0, 1, n_points)'
f = x  % function to approximate

% Compute Fourier sine coefficients: c_k = <f, e_k> where e_k = sqrt(2)*sin(k*pi*x)
n_modes = 5
dx = 1/(n_points-1)
c = zeros(n_modes, 1)
f_approx = zeros(n_points, 1)
for k = 1:n_modes
    e_k = sqrt(2) * sin(k*pi*x)
    c(k) = sum(f .* e_k) * dx   % numerical integral
    f_approx = f_approx + c(k) * e_k
end

disp('Fourier sine coefficients:')
c'
err = sqrt(sum((f - f_approx).^2) * dx)  % L^2 error
disp(['L^2 approximation error with ', num2str(n_modes), ' modes:'])
err

% Parseval: sum c_k^2 should approach ||f||^2 = integral x^2 dx = 1/3
norm_f_sq = sum(f.^2) * dx
disp(['||f||^2 = ', num2str(norm_f_sq)])
disp(['sum c_k^2 = ', num2str(sum(c.^2))])
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Bessel\'s inequality and Parseval\'s equality.** For any orthonormal set $\\{\\mathbf{e}_n\\}_{n=1}^N$ in a Hilbert space: $\\sum_{n=1}^N |\\langle\\mathbf{x},\\mathbf{e}_n\\rangle|^2 \\leq \\|\\mathbf{x}\\|^2$ (**Bessel\'s inequality**). Equality holds for all $\\mathbf{x}$ iff $\\{\\mathbf{e}_n\\}$ is an ONB (**Parseval\'s equality**). Parseval\'s equality for $L^2[0,2\\pi]$ with Fourier basis: $\\frac{1}{2\\pi}\\int_0^{2\\pi}|f(x)|^2\\,dx = \\sum_{n=-\\infty}^\\infty |c_n|^2$ where $c_n = \\frac{1}{2\\pi}\\int_0^{2\\pi}f(x)e^{-inx}\\,dx$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: '$L^p$ Spaces and Their Duals',
        body: 'For $1 \\leq p \\leq \\infty$: $L^p(\\Omega) = \\{f: \\int|f|^p < \\infty\\}$, $\\|f\\|_p = (\\int|f|^p)^{1/p}$.\n\nAll $L^p$ for $1 \\leq p \\leq \\infty$ are Banach spaces.\nOnly $L^2$ is a Hilbert space.\n\n$(L^p)^* \\cong L^q$ where $1/p + 1/q = 1$ (Hölder conjugate).\n$L^2$ is self-dual: $(L^2)^* \\cong L^2$ (Riesz representation).\n\nIn ML: $L^1$ regularization (LASSO) promotes sparsity; $L^2$ regularization (ridge) promotes small norms.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Reproducing kernel Hilbert spaces (RKHS).** An RKHS is a Hilbert space $H$ of functions $f: X \\to \\mathbb{R}$ such that every evaluation functional $\\text{ev}_x: f \\mapsto f(x)$ is bounded. By Riesz: there exists $k_x \\in H$ with $f(x) = \\langle f, k_x\\rangle$. The function $K(x, y) = k_y(x) = \\langle k_x, k_y\\rangle$ is the **reproducing kernel**. The RKHS determines the kernel and vice versa (Mercer\'s theorem). SVMs, Gaussian process regression, and kernel ridge regression are all naturally formulated in RKHS.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Fourier Transform as Unitary Operator',
        body: 'The Fourier transform $\\mathcal{F}: L^2(\\mathbb{R}) \\to L^2(\\mathbb{R})$ defined by $\\hat{f}(\\xi) = \\int f(x) e^{-2\\pi i \\xi x}\\,dx$ is a unitary operator: $\\|\\hat{f}\\| = \\|f\\|$ (Parseval\'s theorem for $\\mathbb{R}$) and $\\mathcal{F}^* = \\mathcal{F}^{-1}$ (inverse Fourier transform).\n\nEigenfunctions: Hermite functions $H_n(x)e^{-x^2/2}$ are the eigenfunctions of $\\mathcal{F}$ with eigenvalues $(-i)^n$.\n\nSpectrum of $\\mathcal{F}$: $\\{1, -1, i, -i\\}$ (the 4th roots of unity), each with infinite multiplicity.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la10-005-1',
      title: 'Projection in $L^2[0,1]$',
      problem: 'In $L^2[0,1]$, project $f(x) = x^2$ onto $M = \\text{span}\\{1, x\\}$. Find the best linear approximation and compute the $L^2$ approximation error.',
      steps: [
        { explanation: 'Build an ONB for $M$ via Gram-Schmidt: $e_1 = 1$ (already normalized: $\\|1\\|^2 = \\int_0^1 1\\,dx = 1$). For $e_2$: orthogonalize $x$ against $e_1$: $x - \\langle x, e_1\\rangle e_1 = x - \\tfrac{1}{2}$. Normalize: $\\|x-\\tfrac{1}{2}\\|^2 = \\int_0^1(x-\\tfrac{1}{2})^2 dx = 1/12$, so $e_2 = \\sqrt{12}(x-\\tfrac{1}{2})$.' },
        { explanation: 'Compute Fourier coefficients: $c_1 = \\langle x^2, e_1\\rangle = \\int_0^1 x^2 dx = 1/3$. $c_2 = \\langle x^2, e_2\\rangle = \\sqrt{12}\\int_0^1 x^2(x-\\tfrac{1}{2})dx = \\sqrt{12}\\cdot(\\tfrac{1}{4}-\\tfrac{1}{6}) = \\sqrt{12}\\cdot\\tfrac{1}{12} = \\tfrac{1}{\\sqrt{12}}$.' },
        { explanation: 'Projection: $Pf = c_1 e_1 + c_2 e_2 = \\tfrac{1}{3}\\cdot 1 + \\tfrac{1}{\\sqrt{12}}\\cdot\\sqrt{12}(x-\\tfrac{1}{2}) = \\tfrac{1}{3} + (x-\\tfrac{1}{2}) = x - \\tfrac{1}{6}$.' },
        { explanation: 'Error: $\\|f - Pf\\|^2 = \\int_0^1 (x^2 - x + \\tfrac{1}{6})^2 dx = \\int_0^1 x^4 - 2x^3 + \\tfrac{4}{3}x^2 - \\tfrac{1}{3}x + \\tfrac{1}{36}\\, dx$. This equals $\\tfrac{1}{5}-\\tfrac{1}{2}+\\tfrac{4}{9}-\\tfrac{1}{6}+\\tfrac{1}{36} = \\tfrac{1}{180}$. So $\\|f-Pf\\| = 1/\\sqrt{180} \\approx 0.075$.' },
      ],
    },
    {
      id: 'ex-la10-005-2',
      title: 'Riesz representation: finding the representing vector',
      problem: 'In $\\mathbb{R}^3$ with the standard inner product, the functional $f(x_1,x_2,x_3) = 2x_1 - x_2 + 3x_3$ is bounded. Find the unique representing vector $\\mathbf{y}$ such that $f(\\mathbf{x}) = \\langle \\mathbf{x}, \\mathbf{y}\\rangle$ for all $\\mathbf{x}$. Then compute $\\|f\\| = \\|\\mathbf{y}\\|$.',
      steps: [
        { explanation: 'The Riesz theorem guarantees $\\mathbf{y}$ exists. By inspection: $f(x_1,x_2,x_3) = \\langle(x_1,x_2,x_3),(2,-1,3)\\rangle = 2x_1 - x_2 + 3x_3$. So $\\mathbf{y} = (2,-1,3)$.' },
        { explanation: 'Verify: $\\langle (1,0,0), \\mathbf{y}\\rangle = 2 = f(1,0,0)$ ✓. $\\langle (0,1,0), \\mathbf{y}\\rangle = -1 = f(0,1,0)$ ✓. $\\langle (0,0,1), \\mathbf{y}\\rangle = 3 = f(0,0,1)$ ✓.' },
        { explanation: 'Operator norm of $f$: $\\|f\\| = \\sup_{\\|x\\|=1}|f(x)| = \\sup_{\\|x\\|=1}|\\langle x, y\\rangle| = \\|y\\|$ (by Cauchy-Schwarz, with equality when $x = y/\\|y\\|$).' },
        { explanation: '$\\|\\mathbf{y}\\| = \\sqrt{4+1+9} = \\sqrt{14}$. So $\\|f\\| = \\sqrt{14}$. The Riesz theorem guarantees $\\|f\\| = \\|\\mathbf{y}\\|$, confirming this.' },
      ],
    },
    {
      id: 'ex-la10-005-3',
      title: 'Parseval\'s identity in $\\ell^2$',
      problem: 'In $\\ell^2$, the sequence $\\mathbf{x} = (1, 1/2, 1/4, 1/8, \\ldots) = (2^{-n+1})_{n\\geq 1}$. Compute $\\|\\mathbf{x}\\|^2$ directly and via Parseval\'s identity using the standard ONB $\\{e_n\\}$.',
      steps: [
        { explanation: 'Direct computation: $\\|\\mathbf{x}\\|^2 = \\sum_{n=1}^\\infty (2^{-(n-1)})^2 = \\sum_{n=0}^\\infty (1/4)^n = \\frac{1}{1-1/4} = \\frac{4}{3}$.' },
        { explanation: 'Parseval via standard ONB $\\{e_n\\}$ (where $e_n$ = 1 in position $n$, 0 elsewhere): $\\langle \\mathbf{x}, e_n\\rangle = 2^{-(n-1)}$.' },
        { explanation: 'Parseval: $\\sum_n |\\langle \\mathbf{x}, e_n\\rangle|^2 = \\sum_{n=1}^\\infty (2^{-(n-1)})^2 = 4/3 = \\|\\mathbf{x}\\|^2$ ✓.' },
        { explanation: 'Reconstruction: $\\mathbf{x} = \\sum_n \\langle \\mathbf{x}, e_n\\rangle e_n = \\sum_n 2^{-(n-1)} e_n = (1, 1/2, 1/4, \\ldots)$ ✓. This confirms $\\ell^2$ is complete and the ONB expansion converges.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la10-005-1',
      title: 'Parallelogram law characterizes Hilbert spaces',
      difficulty: 'hard',
      prompt: 'Prove that a norm comes from an inner product iff it satisfies the parallelogram law: $\\|\\mathbf{x} + \\mathbf{y}\\|^2 + \\|\\mathbf{x} - \\mathbf{y}\\|^2 = 2\\|\\mathbf{x}\\|^2 + 2\\|\\mathbf{y}\\|^2$.',
      hint: 'For the forward direction, expand $\\|\\mathbf{x} \\pm \\mathbf{y}\\|^2 = \\langle\\mathbf{x}\\pm\\mathbf{y},\\mathbf{x}\\pm\\mathbf{y}\\rangle$. For the reverse, use the polarization identity to define the inner product.',
      solution: 'Forward: $\\|\\mathbf{x}+\\mathbf{y}\\|^2 = \\|\\mathbf{x}\\|^2 + 2\\text{Re}\\langle\\mathbf{x},\\mathbf{y}\\rangle + \\|\\mathbf{y}\\|^2$ and $\\|\\mathbf{x}-\\mathbf{y}\\|^2 = \\|\\mathbf{x}\\|^2 - 2\\text{Re}\\langle\\mathbf{x},\\mathbf{y}\\rangle + \\|\\mathbf{y}\\|^2$. Sum: $2\\|\\mathbf{x}\\|^2 + 2\\|\\mathbf{y}\\|^2$. Reverse: define $\\langle\\mathbf{x},\\mathbf{y}\\rangle = \\frac{1}{4}(\\|\\mathbf{x}+\\mathbf{y}\\|^2 - \\|\\mathbf{x}-\\mathbf{y}\\|^2)$ (polarization identity, real case) and verify this is a valid inner product using the parallelogram law.',
    },
  ],

  mentalModel: [
    'Banach space: complete normed space. Cauchy sequences converge.',
    'Hilbert space: Banach space with inner product. $\\|x\\|^2 = \\langle x,x\\rangle$.',
    'Projection theorem: closed subspace has unique nearest point (orthogonal projection).',
    'Riesz representation: $H^* \\cong H$. Every functional = inner product with a fixed vector.',
    'ONB in $H$: Fourier expansion converges. Parseval: $\\|x\\|^2 = \\sum|\\langle x, e_n\\rangle|^2$.',
  ],

  checkpoints: [
    { id: 'cp-la10-005-1', label: 'Read the concrete R^2 Hilbert space introduction', type: 'read' },
    { id: 'cp-la10-005-2', label: 'Read the projection theorem and Riesz representation theorem', type: 'read' },
    { id: 'cp-la10-005-3', label: 'Read Parseval\'s identity and its connection to ONBs', type: 'read' },
    { id: 'cp-la10-005-4', label: 'Verify Parseval\'s identity in the DFT notebook cell', type: 'lab' },
    { id: 'cp-la10-005-5', label: 'Compute the L^2 Fourier series projection with k modes', type: 'lab' },
    { id: 'cp-la10-005-6', label: 'Trace the L^2 projection of x^2 onto linear functions', type: 'example' },
    { id: 'cp-la10-005-7', label: 'Trace the Riesz representation finding the representing vector', type: 'example' },
    { id: 'cp-la10-005-8', label: 'Prove the parallelogram law for any Hilbert space norm', type: 'challenge' },
  ],

  assessment: 'Explain why $\\mathbb{R}^n$ with the dot product is a Hilbert space. Then describe how Fourier series in $L^2[0, 2\\pi]$ are an exact generalization — identifying the ONB, the inner product, and the Parseval identity.',

  quiz: [
    {
      id: 'q-la10-005-1',
      type: 'choice',
      text: 'A Banach space is a normed space that is:',
      options: ['Finite-dimensional', 'Reflexive', 'Complete (every Cauchy sequence converges)', 'Self-dual'],
      answer: 'Complete (every Cauchy sequence converges)',
      hints: ['A Cauchy sequence has terms getting arbitrarily close to each other.', 'Completeness means there are no "holes" — every such sequence converges to a point IN the space.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-005-2',
      type: 'choice',
      text: 'The Riesz representation theorem says every bounded linear functional $f: H \\to \\mathbb{F}$ can be written as:',
      options: ['$f(x) = \\|x\\|$', '$f(x) = \\langle x, y\\rangle$ for a unique $y \\in H$', '$f(x) = Ax$ for a matrix $A$', '$f(x) = f(0) + f\'(0)x$'],
      answer: '$f(x) = \\langle x, y\\rangle$ for a unique $y \\in H$',
      hints: ['In $\\mathbb{R}^n$: $f(x) = a^\\top x = \\langle x, a\\rangle$. The representing vector is $a$.', 'The Riesz theorem extends this to all Hilbert spaces.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-005-3',
      type: 'choice',
      text: 'Parseval\'s identity states that for an ONB $\\{\\mathbf{e}_n\\}$ in $H$:',
      options: ['$\\sum_n \\mathbf{e}_n = 0$', '$\\|\\mathbf{x}\\|^2 = \\sum_n|\\langle\\mathbf{x},\\mathbf{e}_n\\rangle|^2$', '$\\langle\\mathbf{e}_m,\\mathbf{e}_n\\rangle = 1$', '$\\mathbf{x} = \\|\\mathbf{x}\\|\\mathbf{e}_1$ always'],
      answer: '$\\|\\mathbf{x}\\|^2 = \\sum_n|\\langle\\mathbf{x},\\mathbf{e}_n\\rangle|^2$',
      hints: ['The Fourier coefficients $c_n = \\langle x, e_n\\rangle$ capture all information about $x$.', 'Parseval says the sum of squared coefficients = the squared norm — energy is conserved.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-005-4',
      type: 'choice',
      text: 'For the projection of $\\mathbf{x}=(3,4)$ onto $M = \\text{span}\\{(1,0)\\}$ in $\\mathbb{R}^2$, the orthogonal projection $P_M\\mathbf{x}$ is:',
      options: ['$(4,3)$', '$(3,0)$', '$(0,4)$', '$(3,4)$'],
      answer: '$(3,0)$',
      hints: ['Project onto the $x$-axis: keep only the component along $(1,0)$.', '$\\langle (3,4),(1,0)\\rangle=3$, so $P_M(3,4) = 3\\cdot(1,0) = (3,0)$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-005-5',
      type: 'choice',
      text: 'In the $L^2[0,1]$ projection of $f(x)=x^2$ onto linear functions, the best approximation is:',
      options: ['$x^2$', '$x$', '$x - 1/6$', '$1/3$'],
      answer: '$x - 1/6$',
      hints: ['Compute Fourier coefficients $c_1 = 1/3$ and $c_2 = 1/\\sqrt{12}$ in the ONB $\\{1, \\sqrt{12}(x-1/2)\\}$.', '$Pf = 1/3 + (x-1/2) = x - 1/6$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-005-6',
      type: 'choice',
      text: 'The operator norm of the functional $f(x_1,x_2,x_3) = 2x_1 - x_2 + 3x_3$ on $\\mathbb{R}^3$ is:',
      options: ['$6$', '$\\sqrt{14}$', '$4$', '$2$'],
      answer: '$\\sqrt{14}$',
      hints: ['By Riesz, the representing vector is $y=(2,-1,3)$.', '$\\|f\\| = \\|y\\| = \\sqrt{4+1+9} = \\sqrt{14}$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-005-7',
      type: 'choice',
      text: 'Which $L^p$ spaces are Hilbert spaces?',
      options: ['All $L^p$ for $1 \\leq p \\leq \\infty$', 'Only $L^2$', 'Only $L^1$ and $L^\\infty$', 'Only $L^p$ for $p > 2$'],
      answer: 'Only $L^2$',
      hints: ['A Hilbert space needs an inner product. The $L^2$ inner product is $\\langle f,g\\rangle = \\int fg$.', 'For $p \\neq 2$, the parallelogram law fails, so the $L^p$ norm does not come from an inner product.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la10-005-8',
      type: 'choice',
      text: 'A normed space has a norm arising from an inner product if and only if it satisfies:',
      options: [
        'The triangle inequality',
        'The parallelogram law $\\|x+y\\|^2 + \\|x-y\\|^2 = 2\\|x\\|^2+2\\|y\\|^2$',
        'The Cauchy-Schwarz inequality',
        'The completeness axiom',
      ],
      answer: 'The parallelogram law $\\|x+y\\|^2 + \\|x-y\\|^2 = 2\\|x\\|^2+2\\|y\\|^2$',
      hints: ['Triangle inequality and Cauchy-Schwarz hold for all inner product spaces but also for many Banach spaces.', 'The parallelogram law is the precise condition that distinguishes norms from inner products.'],
      reviewSection: 'challenges',
    },
    {
      id: 'q-la10-005-9',
      type: 'choice',
      text: 'The projection theorem requires the subspace $M$ to be:',
      options: ['Finite-dimensional', 'Closed', 'Open', 'Dense in $H$'],
      answer: 'Closed',
      hints: ['For the projection to exist and be unique, the subspace must be closed.', 'A non-closed subspace may not contain the nearest point to a given $x \\in H$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-005-10',
      type: 'choice',
      text: 'For $\\mathbf{x} = (1, 1/2, 1/4, \\ldots) \\in \\ell^2$, $\\|\\mathbf{x}\\|^2$ equals:',
      options: ['$2$', '$4/3$', '$1$', '$\\infty$'],
      answer: '$4/3$',
      hints: ['$\\|x\\|^2 = \\sum_{n=0}^\\infty (1/2^n)^2 = \\sum_{n=0}^\\infty 1/4^n$.', 'Geometric series: $\\sum_{n=0}^\\infty (1/4)^n = 1/(1-1/4) = 4/3$.'],
      reviewSection: 'examples',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Project a given function onto a subspace with an ONB in $L^2[0,1]$ by computing Fourier coefficients $c_k = \\langle f, e_k\\rangle$ via integration; verify using Parseval\'s identity.',
    explainVerbally: 'Explain why the Riesz representation theorem means that Hilbert spaces are "self-dual," and give a concrete example in $\\mathbb{R}^n$ showing how every linear functional corresponds to a dot product with a vector.',
    detectIncorrectApplication: 'Catch the error of applying the projection theorem to a non-closed subspace, or using Parseval\'s identity with a set that is orthonormal but not a complete ONB (Bessel inequality gives $\\leq$ not $=$).',
    transferToUnfamiliar: 'Compute the best approximation of a given function by its first $k$ Fourier modes, and use Parseval\'s identity to bound the approximation error.',
  },

  misconceptions: [
    {
      falseBelief: 'All normed spaces are Hilbert spaces.',
      whyStudentsThinkIt: '$\\mathbb{R}^n$ with the Euclidean norm is the most familiar example, and it IS a Hilbert space. Students assume all vector spaces with norms work the same way.',
      correctionExample: '$L^1[0,1]$ is a Banach space but NOT a Hilbert space. The $L^1$ norm does not satisfy the parallelogram law: take $f=1_{[0,1/2]}$ and $g=1_{[1/2,1]}$. $\\|f+g\\|_1^2+\\|f-g\\|_1^2 = 1+1=2$, but $2\\|f\\|_1^2+2\\|g\\|_1^2 = 2(1/4)+2(1/4) = 1 \\neq 2$. Wait — $\\|f\\|_1=1/2$ so $2(1/4)+2(1/4)=1$. And $\\|f+g\\|_1=1$, $\\|f-g\\|_1=1$. So $1+1=2\\neq 1$. Parallelogram law fails.',
      contrastCase: 'Only $L^2$ among the $L^p$ spaces is a Hilbert space. The geometric structure (inner product, orthogonality, projections) is unique to $L^2$.',
    },
    {
      falseBelief: 'Bessel\'s inequality is the same as Parseval\'s identity.',
      whyStudentsThinkIt: 'Both involve the sum $\\sum|\\langle x, e_n\\rangle|^2$. Students confuse the $\\leq$ (Bessel, for any orthonormal set) with $=$ (Parseval, requires complete ONB).',
      correctionExample: 'Take $\\{e_1\\} = \\{(1,0)\\}$ in $\\mathbb{R}^2$ and $x=(1,1)$. Bessel: $|\\langle x,e_1\\rangle|^2 = 1 \\leq \\|x\\|^2 = 2$ ✓. But Parseval would require $= 2$, which fails because $\\{e_1\\}$ is NOT a complete ONB for $\\mathbb{R}^2$.',
      contrastCase: 'Adding $e_2=(0,1)$: now $|\\langle x,e_1\\rangle|^2+|\\langle x,e_2\\rangle|^2 = 1+1 = 2 = \\|x\\|^2$ ✓. Parseval holds for the COMPLETE ONB $\\{e_1,e_2\\}$.',
    },
  ],

  transferPrompts: [
    {
      situation: 'In signal processing, you receive a noisy signal $y = f + \\epsilon$ where $f$ is in a known subspace $M$ (e.g., band-limited signals) and $\\epsilon$ is noise. How does the projection theorem tell you to denoise?',
      competingTechniques: ['Average nearby samples', 'Project $y$ onto $M$: take $\\hat{f} = P_M y$, the best approximation of $y$ in $M$'],
      whyThisTechniqueWins: 'The projection theorem guarantees $P_M y$ is the UNIQUE nearest point in $M$ to $y$. Since $f \\in M$ and $\\epsilon \\perp M$ (approximately), $P_M y \\approx f$. This is the mathematical basis of Wiener filtering and signal denoising.',
    },
    {
      situation: 'In machine learning, you want to compute $K(x,y) = \\phi(x)^\\top\\phi(y)$ where $\\phi$ maps inputs to a high-dimensional feature space. The feature space is too large to compute explicitly. How does RKHS/Riesz help?',
      competingTechniques: ['Explicitly compute $\\phi(x)$ and dot product', 'Use the kernel $K(x,y)$ directly via the RKHS reproducing property'],
      whyThisTechniqueWins: 'By the Riesz representation theorem, every evaluation functional in the RKHS is an inner product: $f(x) = \\langle f, K_x\\rangle_H$. This means you never need to explicitly compute $\\phi(x)$ — just evaluate the kernel $K$. This is the mathematical content of the "kernel trick" in SVMs and Gaussian processes.',
    },
  ],

  debugging: [
    {
      commonError: 'Forgetting that the projection theorem requires a CLOSED subspace.',
      symptom: 'Student applies the projection theorem to a non-closed subspace (like the polynomials in $L^2[0,1]$) and expects a unique projection to exist.',
      whyItHappened: 'In finite dimensions, every subspace is closed. The closedness condition is only meaningful in infinite dimensions.',
      repairStrategy: 'For the projection theorem to apply, verify the subspace is closed. Polynomials of degree $\\leq n$ ARE closed in $L^2$ (finite-dimensional subspaces are always closed). But the subspace of ALL polynomials is NOT closed in $L^2$ — its closure is all of $L^2$ (Stone-Weierstrass).',
    },
    {
      commonError: 'Applying Parseval\'s identity to an orthonormal set that is not a complete ONB.',
      symptom: 'Student computes $\\sum_{k=1}^{5}|c_k|^2$ for 5 Fourier coefficients and claims $\\|f\\|^2 = \\sum_{k=1}^5|c_k|^2$.',
      whyItHappened: 'Parseval requires the full ONB (infinite sum). Finite truncation gives Bessel\'s inequality: $\\sum_{k=1}^{N}|c_k|^2 \\leq \\|f\\|^2$.',
      repairStrategy: 'Use Parseval only when summing over the COMPLETE ONB. For finite partial sums, use the correct inequality: $\\sum_{k=1}^N |c_k|^2 \\leq \\|f\\|^2$. The approximation error is $\\|f - \\sum_{k=1}^N c_k e_k\\|^2 = \\|f\\|^2 - \\sum_{k=1}^N|c_k|^2 \\geq 0$.',
    },
  ],
};
