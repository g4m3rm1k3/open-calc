export default {
  id: 'la8-003',
  slug: 'odes-and-linear-systems',
  chapter: 'la8',
  order: 3,
  title: 'ODEs and Linear Systems',
  subtitle: 'A system of first-order linear ODEs $\\dot{\\mathbf{x}} = A\\mathbf{x}$ has solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$. The eigenvalues of $A$ completely determine stability: negative real parts mean convergence to zero.',
  tags: ['ODE', 'linear system', 'matrix exponential', 'stability', 'eigenvalues', 'phase portrait', 'state space', 'second-order ODE'],
  aliases: 'ODE ordinary differential equations linear system matrix exponential stability eigenvalues phase portrait state space second order',

  hook: {
    question: "A spring-mass system, an electrical circuit, and a population model all lead to equations of the form $\\ddot{x} + a\\dot{x} + bx = 0$. Can linear algebra give a unified approach to all of them?",
    realWorldContext: "Linear ODEs are the foundation of control engineering, circuit analysis, structural dynamics, and chemical kinetics. Aircraft autopilots stabilize a system $\\dot{\\mathbf{x}} = A\\mathbf{x} + B\\mathbf{u}$ in real time. Drug pharmacokinetics follows a linear compartment model. Electrical power grids are governed by linear differential equations near equilibrium. The eigenvalues of the system matrix $A$ tell you everything about stability without solving the ODE explicitly.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**First-order linear system.** The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$, $\\mathbf{x}(0) = \\mathbf{x}_0$ has the unique solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$. This is the matrix generalization of the scalar ODE $\\dot{x} = ax$ with solution $x(t) = e^{at}x_0$.',
      '**Computing $e^{At}$ via diagonalization.** If $A = PDP^{-1}$ with $D = \\text{diag}(\\lambda_1, \\ldots, \\lambda_n)$: $e^{At} = Pe^{Dt}P^{-1}$ where $e^{Dt} = \\text{diag}(e^{\\lambda_1 t}, \\ldots, e^{\\lambda_n t})$. The solution decomposes into independent modes: $\\mathbf{x}(t) = \\sum_i c_i e^{\\lambda_i t} \\mathbf{v}_i$ where $\\mathbf{v}_i$ are eigenvectors and $c_i$ determined by initial conditions.',
      '**Stability from eigenvalues.** A system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is:\n• **Asymptotically stable** (all solutions $\\to \\mathbf{0}$) iff all eigenvalues have negative real part: $\\text{Re}(\\lambda_i) < 0$ for all $i$.\n• **Unstable** if any eigenvalue has positive real part.\n• **Marginally stable** if all eigenvalues have non-positive real part and those with zero real part have trivial Jordan blocks (no $e^{\\lambda t} \\cdot t$ growing terms).',
      '**Reducing higher-order ODEs.** The second-order $\\ddot{x} + a\\dot{x} + bx = 0$ becomes first-order by introducing state $\\mathbf{z} = (x, \\dot{x})^\\top$: $\\dot{\\mathbf{z}} = \\begin{bmatrix}0&1\\\\-b&-a\\end{bmatrix}\\mathbf{z}$. The eigenvalues of this matrix (the roots of the characteristic polynomial $\\lambda^2 + a\\lambda + b = 0$) determine the behavior.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Stability Classification',
        body: 'For $\\dot{\\mathbf{x}} = A\\mathbf{x}$, eigenvalues $\\lambda = \\sigma + i\\omega$:\n\n$\\sigma < 0$: decaying oscillation (stable spiral)\n$\\sigma = 0, \\omega \\neq 0$: pure oscillation (center)\n$\\sigma > 0$: growing oscillation (unstable spiral)\n$\\lambda$ real, $< 0$: exponential decay (stable node)\n$\\lambda$ real, $> 0$: exponential growth (unstable node)\nReal eigenvalues of opposite sign: saddle point (unstable)',
      },
      {
        type: 'insight',
        title: 'General Solution Structure',
        body: 'For $A = PDP^{-1}$ (diagonalizable), initial condition $\\mathbf{x}_0$:\n\n$\\mathbf{x}(t) = \\sum_{i=1}^n c_i e^{\\lambda_i t} \\mathbf{v}_i$\n\nwhere $c_i = (P^{-1}\\mathbf{x}_0)_i$.\n\nStable modes ($\\text{Re}(\\lambda_i) < 0$) die out.\nUnstable modes ($\\text{Re}(\\lambda_i) > 0$) grow.\nLong-term behavior dominated by eigenvalue with largest real part.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'ODE Stability Analysis',
        mathBridge: 'Analyze stability of linear systems via eigenvalues.',
        caption: 'Eigenvalue signs determine stability — no explicit solution needed.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stability from eigenvalues',
              prose: ['Check stability of a 2x2 linear system by examining eigenvalue real parts.'],
              code: `% Stable system: both eigenvalues have negative real part
A_stable = [-2 1; -1 -3]
eigs_stable = eig(A_stable)
disp('Eigenvalues of stable system:')
eigs_stable
disp('All real parts negative?:')
all(real(eigs_stable) < 0)

% Unstable system: one eigenvalue has positive real part
A_unstable = [1 2; 0 -1]
eigs_unstable = eig(A_unstable)
disp('Eigenvalues of unstable system:')
eigs_unstable
disp('Any positive real parts?:')
any(real(eigs_unstable) > 0)

% Oscillatory: complex eigenvalues with negative real parts
A_osc = [-0.5 3; -3 -0.5]
eigs_osc = eig(A_osc)
disp('Eigenvalues of damped oscillator:')
eigs_osc
`,
            },
            {
              id: 2,
              cellTitle: 'Solution via matrix exponential',
              prose: ['Solve dx/dt = Ax with x0 via diagonalization. Sample the trajectory.'],
              code: `% System: damped oscillator
A = [-0.5 2; -2 -0.5]
[P, D] = eig(A)

% Initial condition
x0 = [1; 0]
c = P \ x0   % coordinates in eigenbasis

% Trajectory at several time points
t_values = linspace(0, 5, 50)
traj = zeros(2, length(t_values))
for k = 1:length(t_values)
    t = t_values(k)
    % x(t) = P * diag(exp(lambda*t)) * c
    e_Dt = diag(exp(diag(D) * t))
    traj(:, k) = real(P * e_Dt * c)
end

disp('First 5 x(t) values:')
traj(:, 1:5)
disp('Final value (should approach 0 since stable):')
traj(:, end)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof that $e^{At}$ solves the ODE.** Let $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$. Then $\\frac{d}{dt}e^{At} = A e^{At}$ (differentiate the power series term by term), so $\\dot{\\mathbf{x}}(t) = Ae^{At}\\mathbf{x}_0 = A\\mathbf{x}(t)$. Initial condition: $\\mathbf{x}(0) = e^{A \\cdot 0}\\mathbf{x}_0 = I\\mathbf{x}_0 = \\mathbf{x}_0$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Stability Criterion',
        body: 'The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is asymptotically stable (all solutions $\\to \\mathbf{0}$ as $t \\to \\infty$) if and only if all eigenvalues of $A$ have strictly negative real parts.\n\nEquivalently: $A$ is **Hurwitz stable**.\n\nLyapunov criterion: $A$ is Hurwitz iff there exists a symmetric positive definite $P$ with $A^\\top P + PA < 0$ (negative definite).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Control theory connections.** In the linear time-invariant (LTI) system $\\dot{\\mathbf{x}} = A\\mathbf{x} + B\\mathbf{u}$, the input $\\mathbf{u}$ can be chosen to place eigenvalues anywhere (if the system is controllable). **Pole placement** designs feedback $\\mathbf{u} = -K\\mathbf{x}$ so that $A - BK$ has desired eigenvalues. Linear Quadratic Regulator (LQR) finds the optimal $K$ minimizing a quadratic cost — solved by the algebraic Riccati equation.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Defective Matrices and Resonance',
        body: 'If $A$ has a repeated eigenvalue with defective Jordan block, the solution includes terms $te^{\\lambda t}$ (or $t^k e^{\\lambda t}$ for higher-order blocks). Even if $\\text{Re}(\\lambda) < 0$, these terms grow before eventually decaying. For $\\text{Re}(\\lambda) = 0$ (marginally stable), defective blocks cause **polynomial growth** — the system is unstable despite eigenvalues on the imaginary axis.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la8-003-1',
      title: 'Spring-mass system',
      problem: 'The spring-mass ODE $\\ddot{x} + 0.4\\dot{x} + 4x = 0$ — is it stable? What do solutions look like?',
      solution: 'State matrix $A = \\begin{bmatrix}0&1\\\\-4&-0.4\\end{bmatrix}$. Eigenvalues: $\\lambda = (-0.4 \\pm \\sqrt{0.16 - 16})/2 = -0.2 \\pm \\sqrt{-3.96}i \\approx -0.2 \\pm 1.99i$. Real part $-0.2 < 0$: asymptotically stable. Complex eigenvalues: damped oscillation.',
    },
  ],

  challenges: [
    {
      id: 'ch-la8-003-1',
      title: 'Stability of coupled populations',
      difficulty: 'medium',
      prompt: 'The linearized Lotka-Volterra equations near equilibrium are $\\dot{\\mathbf{x}} = \\begin{bmatrix}0&-a\\\\b&0\\end{bmatrix}\\mathbf{x}$ with $a, b > 0$. Is this system stable?',
      hint: 'Compute the eigenvalues and check their real parts.',
      solution: 'Eigenvalues: $\\lambda = \\pm\\sqrt{-ab} = \\pm i\\sqrt{ab}$ (purely imaginary). Real part is 0 — marginally stable (center). Solutions are pure oscillations (neither growing nor decaying). This is the classical predator-prey cycle.',
    },
  ],

  mentalModel: [
    '$\\dot{\\mathbf{x}} = A\\mathbf{x}$ has solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$.',
    'Stability: all $\\text{Re}(\\lambda_i) < 0$ ↔ all solutions decay to zero.',
    'Complex eigenvalue $\\sigma + i\\omega$: oscillation at frequency $\\omega$, growing/decaying at rate $\\sigma$.',
    'Convert $n$-th order ODE to first-order system by introducing state vector.',
    'Eigenvalues are the "poles" of the system — they fully determine qualitative behavior.',
  ],

  checkpoints: [
    { id: 'cp-la8-003-1', question: 'What is the solution to $\\dot{\\mathbf{x}} = A\\mathbf{x}$, $\\mathbf{x}(0) = \\mathbf{x}_0$?', answer: '$\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$ (matrix exponential).' },
    { id: 'cp-la8-003-2', question: 'What condition on eigenvalues of $A$ guarantees asymptotic stability?', answer: 'All eigenvalues must have strictly negative real parts ($\\text{Re}(\\lambda_i) < 0$).' },
    { id: 'cp-la8-003-3', question: 'How do you convert $\\ddot{x} + ax + bx = 0$ into a first-order system?', answer: 'Set $\\mathbf{z} = (x, \\dot{x})^\\top$ and write $\\dot{\\mathbf{z}} = \\begin{bmatrix}0&1\\\\-b&-a\\end{bmatrix}\\mathbf{z}$.' },
  ],

  assessment: 'For the system $A = \\begin{bmatrix}-1&4\\\\0&-2\\end{bmatrix}$, (a) find the eigenvalues and classify the stability, (b) compute $e^{At}$ for general $t$, and (c) solve the IVP $\\mathbf{x}(0) = (1,1)^\\top$.',

  quiz: [
    { id: 'q-la8-003-1', question: 'The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is asymptotically stable iff:', options: ['$\\det A > 0$', '$A$ is symmetric', 'All eigenvalues have negative real parts', 'All eigenvalues are real'], answer: 'All eigenvalues have negative real parts' },
    { id: 'q-la8-003-2', question: 'Complex eigenvalues $\\sigma \\pm i\\omega$ produce solutions that:', options: ['Grow exponentially', 'Oscillate with frequency $\\omega$ and amplitude $\\propto e^{\\sigma t}$', 'Converge to a fixed point regardless of $\\sigma$', 'Are always purely oscillatory'], answer: 'Oscillate with frequency $\\omega$ and amplitude $\\propto e^{\\sigma t}$' },
    { id: 'q-la8-003-3', question: 'A second-order ODE $\\ddot{x} + a\\dot{x} + bx = 0$ is converted to first-order by:', options: ['Differentiating twice', 'Setting $z_1 = x, z_2 = \\dot{x}$', 'Taking the Laplace transform', 'Setting $z = e^{\\lambda t}$'], answer: 'Setting $z_1 = x, z_2 = \\dot{x}$' },
  ],
};
