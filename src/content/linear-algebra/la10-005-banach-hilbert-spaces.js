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
      '**Completeness.** A normed space $(X, \\|\\cdot\\|)$ is **complete** (a **Banach space**) if every Cauchy sequence converges in $X$. Recall: a sequence $\\{x_n\\}$ is Cauchy if $\\|x_m - x_n\\| \\to 0$ as $m, n \\to \\infty$. Complete means: Cauchy implies convergent. Examples: $\\mathbb{R}^n$ is complete; $\\mathbb{Q}$ is not; $C[0,1]$ with the sup-norm is complete; $C[0,1]$ with the $L^1$ norm is not.',
      '**Hilbert spaces.** A **Hilbert space** is a Banach space whose norm comes from an inner product: $\\|\\mathbf{x}\\|^2 = \\langle\\mathbf{x},\\mathbf{x}\\rangle$. The inner product adds geometric structure (angles, orthogonality). Examples: $\\mathbb{R}^n$ with dot product; $\\ell^2 = \\{(a_n) : \\sum|a_n|^2 < \\infty\\}$ with $\\langle \\mathbf{a}, \\mathbf{b}\\rangle = \\sum a_n b_n$; $L^2[a,b] = \\{f : \\int_a^b |f|^2 < \\infty\\}$ with $\\langle f, g\\rangle = \\int_a^b f(x)g(x)\\,dx$.',
      '**Orthonormal bases.** In a separable Hilbert space, an **orthonormal basis** (ONB) $\\{\\mathbf{e}_n\\}$ satisfies $\\langle \\mathbf{e}_m, \\mathbf{e}_n\\rangle = \\delta_{mn}$ and $\\overline{\\text{span}\\{\\mathbf{e}_n\\}} = H$ (closed span is all of $H$). For any $\\mathbf{x} \\in H$: **Parseval\'s identity** $\\|\\mathbf{x}\\|^2 = \\sum_n |\\langle\\mathbf{x},\\mathbf{e}_n\\rangle|^2$ and **Fourier expansion** $\\mathbf{x} = \\sum_n \\langle\\mathbf{x},\\mathbf{e}_n\\rangle \\mathbf{e}_n$ (converges in $H$). This generalizes the finite-dimensional case exactly.',
      '**Riesz representation theorem.** For any bounded linear functional $f: H \\to \\mathbb{F}$, there exists a unique $\\mathbf{y} \\in H$ such that $f(\\mathbf{x}) = \\langle\\mathbf{x},\\mathbf{y}\\rangle$ for all $\\mathbf{x}$. This gives the natural isomorphism $H^* \\cong H$ (Hilbert spaces are reflexive). In machine learning, this justifies the "kernel trick": a linear functional in a feature space is a kernel evaluation.',
    ],
    callouts: [
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
      title: 'Projection in $L^2$',
      problem: 'In $L^2[0,1]$, project $f(x) = x^2$ onto $\\text{span}\\{1, x\\}$ (linear functions). What is the best linear approximation?',
      solution: 'ONB for span{$1, x$}: Gram-Schmidt gives $\\mathbf{e}_1 = 1$, $\\mathbf{e}_2 = \\sqrt{12}(x - 1/2)$. Coefficients: $c_1 = \\int_0^1 x^2 \\cdot 1\\,dx = 1/3$; $c_2 = \\sqrt{12}\\int_0^1 x^2(x - 1/2)\\,dx = \\sqrt{12}(1/4 - 1/6) = \\sqrt{12}/12 = 1/\\sqrt{12}$. Projection: $P f = 1/3 + (1/\\sqrt{12})\\sqrt{12}(x-1/2) = 1/3 + (x - 1/2) = x - 1/6$.',
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
    { id: 'cp-la10-005-1', question: 'What makes a normed space a Banach space?', answer: 'Completeness: every Cauchy sequence converges in the space.' },
    { id: 'cp-la10-005-2', question: 'State the Riesz representation theorem.', answer: 'Every bounded linear functional $f: H \\to \\mathbb{F}$ on a Hilbert space has a unique representation $f(x) = \\langle x, y\\rangle$ for some $y \\in H$.' },
    { id: 'cp-la10-005-3', question: 'What is Parseval\'s identity?', answer: 'For an ONB $\\{e_n\\}$ in $H$: $\\|x\\|^2 = \\sum_n |\\langle x, e_n\\rangle|^2$ for all $x \\in H$.' },
  ],

  assessment: 'Explain why $\\mathbb{R}^n$ with the dot product is a Hilbert space. Then describe how Fourier series in $L^2[0, 2\\pi]$ are an exact generalization — identifying the ONB, the inner product, and the Parseval identity.',

  quiz: [
    { id: 'q-la10-005-1', question: 'A Banach space is a normed space that is:', options: ['Finite-dimensional', 'Reflexive', 'Complete (every Cauchy sequence converges)', 'Self-dual'], answer: 'Complete (every Cauchy sequence converges)' },
    { id: 'q-la10-005-2', question: 'The Riesz representation theorem says:', options: ['Every Hilbert space is reflexive', 'Every bounded linear functional on $H$ is of the form $\\langle\\cdot,\\mathbf{y}\\rangle$', 'Every operator on $H$ has eigenvalues', 'Compact operators have discrete spectra'], answer: 'Every bounded linear functional on $H$ is of the form $\\langle\\cdot,\\mathbf{y}\\rangle$' },
    { id: 'q-la10-005-3', question: 'Parseval\'s identity states that for an ONB $\\{\\mathbf{e}_n\\}$:', options: ['$\\sum_n \\mathbf{e}_n = 0$', '$\\|\\mathbf{x}\\|^2 = \\sum_n|\\langle\\mathbf{x},\\mathbf{e}_n\\rangle|^2$', '$\\langle\\mathbf{e}_m,\\mathbf{e}_n\\rangle = 1$', '$\\mathbf{x} = \\|\\mathbf{x}\\|\\mathbf{e}_1$'], answer: '$\\|\\mathbf{x}\\|^2 = \\sum_n|\\langle\\mathbf{x},\\mathbf{e}_n\\rangle|^2$' },
  ],
};
