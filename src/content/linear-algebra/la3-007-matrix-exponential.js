export default {
  id: 'la3-007',
  slug: 'matrix-exponential',
  chapter: 'la3',
  order: 7,
  title: 'The Matrix Exponential and Systems of ODEs',
  subtitle: 'Define $e^A$ as a matrix power series. It solves every constant-coefficient linear differential equation $\\dot{\\mathbf{x}} = A\\mathbf{x}$ — giving the complete trajectory of the system in one formula.',
  tags: ['matrix exponential', 'e^A', 'ODE', 'differential equations', 'eigendecomposition', 'Padé approximation', 'scaling and squaring', 'stability'],
  aliases: 'matrix exponential e^A differential equations ODE linear systems stability eigendecomposition Pade expm',

  hook: {
    question: "The scalar equation $\\dot{x} = ax$ has solution $x(t) = e^{at} x(0)$. What is the solution to the system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ where $A$ is a matrix?",
    realWorldContext: "Every constant-coefficient linear ODE system — mechanical vibrations, electrical circuits, population dynamics, heat flow — has the solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}(0)$, where $e^{At}$ is the matrix exponential. In quantum mechanics, the time-evolution operator $e^{-iHt/\\hbar}$ (where $H$ is the Hamiltonian matrix) governs all dynamics. In robotics, matrix exponentials compute the position of a robot arm as it sweeps through a rotation. In control theory, $e^{At}$ is the state transition matrix. Understanding this formula unifies ODEs and linear algebra into a single framework.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**From scalar to matrix.** The scalar exponential $e^{at} = 1 + at + \\frac{(at)^2}{2!} + \\cdots$ solves $\\dot{x} = ax$ with $x(0) = x_0$. We define the matrix exponential by the same power series:\n\n$e^{At} = I + At + \\frac{(At)^2}{2!} + \\frac{(At)^3}{3!} + \\cdots = \\sum_{k=0}^{\\infty} \\frac{(At)^k}{k!}$\n\nThis series converges for every matrix $A$ and every $t \\in \\mathbb{R}$.',
      '**It solves the matrix ODE.** Check: if $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$, then $\\dot{\\mathbf{x}} = \\frac{d}{dt}e^{At}\\mathbf{x}_0 = Ae^{At}\\mathbf{x}_0 = A\\mathbf{x}(t)$. And $\\mathbf{x}(0) = e^0 \\mathbf{x}_0 = I\\mathbf{x}_0 = \\mathbf{x}_0$. The matrix exponential is the unique solution.',
      '**Computing via diagonalization.** If $A = PDP^{-1}$ (diagonal $D = \\text{diag}(\\lambda_1, \\ldots, \\lambda_n)$), then:\n\n$e^{At} = Pe^{Dt}P^{-1}$ where $e^{Dt} = \\text{diag}(e^{\\lambda_1 t}, \\ldots, e^{\\lambda_n t})$\n\nThis works because $(PDP^{-1})^k = PD^kP^{-1}$, and $e^D$ of a diagonal matrix is just the exponential of each diagonal entry.',
      '**What the eigenvalues tell you about stability.** The behavior of $e^{At}$ as $t \\to \\infty$ is governed entirely by the eigenvalues of $A$. If all eigenvalues have negative real part (Re$(\\lambda) < 0$ for all $\\lambda$): all solutions decay to zero — the system is **stable**. If any eigenvalue has positive real part: solutions blow up — the system is **unstable**. If eigenvalues are purely imaginary: solutions oscillate — the system is **neutrally stable**.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Eigenvalue → Solution Behavior',
        body: '| Eigenvalue type | Solution behavior |\n|---|---|\n| Real $\\lambda < 0$ | Exponential decay: $e^{\\lambda t} \\to 0$ |\n| Real $\\lambda > 0$ | Exponential growth: $e^{\\lambda t} \\to \\infty$ |\n| Pure imaginary $\\pm i\\omega$ | Oscillation: $\\cos(\\omega t) \\pm i\\sin(\\omega t)$ |\n| Complex $a \\pm bi$, $a < 0$ | Decaying oscillation |\n| Repeated eigenvalue (Jordan) | $t^k e^{\\lambda t}$ terms |',
      },
      {
        type: 'theorem',
        title: 'Properties of the Matrix Exponential',
        body: '• $e^{A \\cdot 0} = I$\n• $\\frac{d}{dt} e^{At} = A e^{At} = e^{At} A$\n• $\\det(e^A) = e^{\\text{tr}(A)}$\n• If $AB = BA$: $e^{A+B} = e^A e^B$ (commutativity required!)\n• $(e^A)^{-1} = e^{-A}$',
      },
      {
        type: 'warning',
        title: 'Commutativity Is Required for $e^{A+B} = e^A e^B$',
        body: 'In general, $e^{A+B} \\neq e^A e^B$ unless $AB = BA$. This fails for most pairs of matrices. The Baker-Campbell-Hausdorff formula gives the correction terms involving commutators $[A,B] = AB - BA$.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Matrix Exponential and ODE Solutions',
        mathBridge: 'Compute e^(At) for a 2x2 system and visualize the phase portrait.',
        caption: 'The eigenvalues of A determine stability; e^(At) gives the complete solution.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stable system: all eigenvalues have negative real part',
              prose: ['A = [-1 2; -2 -1]: complex eigenvalues -1 +/- 2i => decaying spiral.'],
              code: `A = [-1 2; -2 -1]
[V, D] = eig(A)
eigenvalues = diag(D)
disp('Real parts (all negative = stable):')
real(eigenvalues)
disp('Imaginary parts (nonzero = oscillation):')
imag(eigenvalues)
disp('det(e^A) = e^trace(A):')
exp(trace(A))
`,
            },
            {
              id: 2,
              cellTitle: 'Computing e^(At) via diagonalization',
              prose: ['If A = PDP^{-1}, then e^(At) = P * diag(e^{d1*t}, e^{d2*t}) * P^{-1}.'],
              code: `A = [-1 2; -2 -1]
[P, D] = eig(A)
t = 0.5;

% e^(D*t): exponentiate diagonal entries
eDt = diag(exp(diag(D) * t))

% e^(At) = P * e^(Dt) * P^{-1}
eAt_diag = P * eDt * inv(P)
disp('Re(e^(At)) at t=0.5:')
real(eAt_diag)

% Verify: e^(A*0) = I
t0 = 0;
eDt0 = diag(exp(diag(D) * t0));
eAt0 = real(P * eDt0 * inv(P))
`,
            },
            {
              id: 3,
              cellTitle: 'ODE trajectory: x(t) = e^(At) * x0',
              prose: ['Solve dx/dt = Ax, x(0) = [2; 0] and sample the trajectory at t = 0, 0.5, 1, 2.'],
              code: `A = [-1 2; -2 -1]
x0 = [2; 0]
[P, D] = eig(A)
times = [0, 0.5, 1.0, 2.0];
disp('Trajectory x(t) for t = 0, 0.5, 1, 2:')
for i = 1:length(times)
  t = times(i);
  eDt = diag(exp(diag(D) * t));
  eAt = real(P * eDt * inv(P));
  xt = eAt * x0;
  disp(xt')
end
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Convergence of the power series.** For any matrix norm $\\|\\cdot\\|$, we have $\\|e^A\\| \\leq e^{\\|A\\|}$ and the series $\\sum_{k=0}^\\infty \\frac{A^k}{k!}$ converges absolutely because $\\sum_{k=0}^\\infty \\frac{\\|A\\|^k}{k!} = e^{\\|A\\|} < \\infty$. The convergence is uniform on bounded sets in $t$.',
      '**Jordan case.** For a Jordan block $J = \\lambda I + N$ where $N$ is nilpotent ($N^k = 0$ for some finite $k$), $e^J = e^{\\lambda I} e^N = e^\\lambda e^N$. Since $N^k = 0$, $e^N = I + N + N^2/2! + \\cdots + N^{k-1}/(k-1)!$ (finite sum). For a Jordan block $J_k(\\lambda)$: the $(i,j)$ entry of $e^{J_k(\\lambda)t}$ is $\\frac{t^{j-i}}{(j-i)!} e^{\\lambda t}$ for $j \\geq i$, and 0 otherwise. This shows Jordan blocks produce $t^m e^{\\lambda t}$ solutions.',
      '**Stability criterion.** The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is asymptotically stable (all solutions $\\to 0$) iff all eigenvalues of $A$ satisfy Re$(\\lambda) < 0$. For discrete-time systems $\\mathbf{x}_{k+1} = A\\mathbf{x}_k$, stability requires $|\\lambda| < 1$ for all eigenvalues.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Liouville\'s Formula',
        body: '$\\det(e^{At}) = e^{\\text{tr}(A) \\cdot t}$\n\nProof sketch: for diagonal $A$, $\\det(e^{At}) = \\prod e^{\\lambda_i t} = e^{\\sum \\lambda_i t} = e^{\\text{tr}(A)t}$. By continuity and similarity invariance, it extends to all matrices.',
      },
      {
        type: 'insight',
        title: 'Padé Approximation in Practice',
        body: 'MATLAB\'s `expm` and SciPy\'s `expm` use the Padé approximant + scaling and squaring, not the power series. The power series is unstable for large $\\|A\\|$. The scaling trick: $e^A = (e^{A/2^s})^{2^s}$. Scale down until $A/2^s$ is small, apply Padé, then square $s$ times.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Spectral mapping theorem.** If $A = PDP^{-1}$ (diagonalizable), then $e^A = Pe^D P^{-1}$, and the eigenvalues of $e^A$ are exactly $\\{e^\\lambda : \\lambda \\in \\text{spec}(A)\\}$. More generally, for any analytic function $f$, $f(A)$ has eigenvalues $\\{f(\\lambda) : \\lambda \\in \\text{spec}(A)\\}$. This is the spectral mapping theorem.',
      '**Matrix logarithm.** The inverse of the matrix exponential (when it exists) is the matrix logarithm. $\\log(e^A) = A$ for matrices near 0. The logarithm exists for all invertible matrices near $I$ (since invertible = $e^{\\text{tr}(A)} \\neq 0$), but may not be unique. Applications: computing rotations in robotics (Lie algebras), interpolating between matrices in animation.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Lie Groups and Lie Algebras',
        body: 'The matrix exponential maps the **Lie algebra** (a vector space of matrices) to the **Lie group** (a manifold of invertible matrices). For example: $\\mathfrak{so}(3)$ (skew-symmetric matrices) $\\xrightarrow{\\exp}$ $SO(3)$ (rotation matrices). This is the foundation of modern robotics, computer graphics, and differential geometry.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la3-007-1',
      title: 'Matrix exponential of a diagonal matrix',
      problem: 'Compute $e^{At}$ for $A = \\begin{bmatrix}-2&0\\\\0&-3\\end{bmatrix}$.',
      solution: '$e^{At} = \\begin{bmatrix}e^{-2t}&0\\\\0&e^{-3t}\\end{bmatrix}$. Both components decay to zero — stable system.',
    },
    {
      id: 'ex-la3-007-2',
      title: 'ODE system solution',
      problem: 'Solve $\\dot{x}_1 = -x_1 + 2x_2$, $\\dot{x}_2 = -3x_2$ with $\\mathbf{x}(0) = [1, 1]^\\top$.',
      solution: 'Matrix $A = \\begin{bmatrix}-1&2\\\\0&-3\\end{bmatrix}$ is upper triangular with eigenvalues $-1, -3$. Find $e^{At}$ via eigenvector method: $\\mathbf{x}(t) = c_1 e^{-t}\\mathbf{v}_1 + c_2 e^{-3t}\\mathbf{v}_2$, match $\\mathbf{x}(0) = [1,1]^\\top$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la3-007-1',
      title: 'Stability analysis',
      difficulty: 'medium',
      prompt: 'Classify the stability of the system with $A = \\begin{bmatrix}0&1\\\\-\\omega^2&-2\\zeta\\omega\\end{bmatrix}$ (damped harmonic oscillator) for $\\zeta > 0$.',
      hint: 'Find the eigenvalues in terms of $\\zeta$ and $\\omega$.',
      solution: 'Eigenvalues: $\\lambda = -\\zeta\\omega \\pm \\omega\\sqrt{\\zeta^2 - 1}$. Since $\\zeta > 0$, Re$(\\lambda) = -\\zeta\\omega < 0$. All solutions decay — the system is asymptotically stable for all $\\zeta > 0$.',
    },
  ],

  mentalModel: [
    '$\\dot{\\mathbf{x}} = A\\mathbf{x}$, $\\mathbf{x}(0) = \\mathbf{x}_0$ has exact solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$.',
    'Eigenvalues of $A$ govern stability: all Re$(\\lambda) < 0$ → stable; any Re$(\\lambda) > 0$ → unstable.',
    'Compute $e^{At}$ via diagonalization: $e^{At} = Pe^{Dt}P^{-1}$ where $e^{Dt}$ just exponentiates diagonal entries.',
    '$\\det(e^A) = e^{\\text{tr}(A)}$ — the determinant is never zero, so $e^{At}$ is always invertible.',
  ],

  checkpoints: [
    { id: 'cp-la3-007-1', question: 'What ODE does $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$ solve?', answer: '$\\dot{\\mathbf{x}} = A\\mathbf{x}$ with initial condition $\\mathbf{x}(0) = \\mathbf{x}_0$.' },
    { id: 'cp-la3-007-2', question: 'If all eigenvalues of $A$ have negative real part, what happens to solutions of $\\dot{\\mathbf{x}} = A\\mathbf{x}$?', answer: 'They all decay to zero — the system is asymptotically stable.' },
    { id: 'cp-la3-007-3', question: 'What is $\\det(e^A)$?', answer: '$e^{\\text{tr}(A)}$.' },
  ],

  assessment: 'For the system $\\dot{x}_1 = -2x_1 + x_2$, $\\dot{x}_2 = -x_2$ with $x(0) = [1, 2]^\\top$: find $e^{At}$, write the explicit solution, and classify stability.',

  quiz: [
    { id: 'q-la3-007-1', question: 'The solution to $\\dot{\\mathbf{x}} = A\\mathbf{x}$, $\\mathbf{x}(0) = \\mathbf{x}_0$ is:', options: ['$A\\mathbf{x}_0$', '$e^{At}\\mathbf{x}_0$', '$A^t \\mathbf{x}_0$', '$\\int A\\,dt \\cdot \\mathbf{x}_0$'], answer: '$e^{At}\\mathbf{x}_0$' },
    { id: 'q-la3-007-2', question: 'For stability of $\\dot{\\mathbf{x}} = A\\mathbf{x}$, all eigenvalues must have:', options: ['positive imaginary parts', 'negative real parts', 'magnitude less than 1', 'non-zero determinant'], answer: 'negative real parts' },
    { id: 'q-la3-007-3', question: 'If $A = PDP^{-1}$, then $e^A$ equals:', options: ['$Pe^D$', '$e^D P^{-1}$', '$Pe^D P^{-1}$', '$e^{PDP^{-1}}$ (different formula)'], answer: '$Pe^D P^{-1}$' },
  ],
};
