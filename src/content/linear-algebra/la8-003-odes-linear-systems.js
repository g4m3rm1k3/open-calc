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
      '**A concrete rotation ODE — numbers first.** Take $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$. The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ has eigenvalues $\\lambda = \\pm i$ (purely imaginary — found from $\\det(A - \\lambda I) = \\lambda^2 + 1 = 0$). Since $e^{At} = \\begin{bmatrix}\\cos t & -\\sin t\\\\ \\sin t & \\cos t\\end{bmatrix}$ (the rotation matrix!), a point starting at $\\mathbf{x}(0) = (1,0)^\\top$ traces a circle. At $t = \\pi/2$: $\\mathbf{x}(\\pi/2) = \\begin{bmatrix}\\cos(\\pi/2)&-\\sin(\\pi/2)\\\\\\sin(\\pi/2)&\\cos(\\pi/2)\\end{bmatrix}\\begin{pmatrix}1\\\\0\\end{pmatrix} = \\begin{pmatrix}0\\\\1\\end{pmatrix}$. The system rotated the point 90° counterclockwise — pure imaginary eigenvalues mean perpetual rotation.',
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
      {
        type: 'sequencing',
        title: 'Prediction',
        body: 'For the rotation system $\\dot{\\mathbf{x}} = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}\\mathbf{x}$ starting at $(1,0)^\\top$, the eigenvalues are $\\pm i$ with zero real part. What trajectory does the solution trace in the $(x_1, x_2)$ plane? Is this system stable, asymptotically stable, or unstable? Think about what $e^{i\\omega t}$ does geometrically before reading the answer.',
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
c = P \\ x0   % coordinates in eigenbasis

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
    {
      id: 'ex-la8-003-2',
      title: 'Rotation system: computing $x(\\pi/2)$',
      problem: 'For $\\dot{\\mathbf{x}} = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}\\mathbf{x}$ with $\\mathbf{x}(0) = (1,0)^\\top$, compute $\\mathbf{x}(\\pi/2)$ explicitly using the matrix exponential.',
      solution: '$e^{At} = \\begin{bmatrix}\\cos t&-\\sin t\\\\\\sin t&\\cos t\\end{bmatrix}$ (rotation by $t$ radians). At $t = \\pi/2$: $e^{A\\pi/2} = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$. So $\\mathbf{x}(\\pi/2) = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}\\begin{pmatrix}1\\\\0\\end{pmatrix} = \\begin{pmatrix}0\\\\1\\end{pmatrix}$. The point $(1,0)$ rotated to $(0,1)$ — exactly 90° counterclockwise. The trajectory is a unit circle.',
    },
    {
      id: 'ex-la8-003-3',
      title: 'Stability classification for a 2×2 system',
      problem: 'Classify the stability of $A = \\begin{bmatrix}-1&2\\\\0&-3\\end{bmatrix}$ and write the general solution starting from $\\mathbf{x}(0) = (1,1)^\\top$.',
      solution: '$A$ is upper triangular so eigenvalues are $\\lambda_1 = -1$, $\\lambda_2 = -3$. Both negative: asymptotically stable. Eigenvectors: for $\\lambda_1 = -1$: $(A+I)\\mathbf{v} = 0 \\Rightarrow \\mathbf{v}_1 = (1,0)^\\top$. For $\\lambda_2 = -3$: $(A+3I)\\mathbf{v} = 0 \\Rightarrow \\mathbf{v}_2 = (1,1)^\\top$. General solution: $\\mathbf{x}(t) = c_1 e^{-t}\\mathbf{v}_1 + c_2 e^{-3t}\\mathbf{v}_2$. Initial condition: $c_1(1,0)+c_2(1,1) = (1,1) \\Rightarrow c_2 = 1, c_1 = 0$. So $\\mathbf{x}(t) = e^{-3t}(1,1)^\\top$ — pure exponential decay along the $(1,1)$ direction.',
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
    { id: 'cp-la8-003-1', label: 'Read intuition section', type: 'read' },
    { id: 'cp-la8-003-2', label: 'Read math section', type: 'read' },
    { id: 'cp-la8-003-3', label: 'Read rigor section', type: 'read' },
    { id: 'cp-la8-003-4', label: 'Run first lab', type: 'lab' },
    { id: 'cp-la8-003-5', label: 'Run second lab', type: 'lab' },
    { id: 'cp-la8-003-6', label: 'Work example 1', type: 'example' },
    { id: 'cp-la8-003-7', label: 'Work example 2', type: 'example' },
    { id: 'cp-la8-003-8', label: 'Solve challenge', type: 'challenge' },
  ],

  assessment: 'For the system $A = \\begin{bmatrix}-1&4\\\\0&-2\\end{bmatrix}$, (a) find the eigenvalues and classify the stability, (b) compute $e^{At}$ for general $t$, and (c) solve the IVP $\\mathbf{x}(0) = (1,1)^\\top$.',

  quiz: [
    { id: 'q-la8-003-1', type: 'choice', question: 'The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is asymptotically stable iff:', options: ['$\\det A > 0$', '$A$ is symmetric', 'All eigenvalues have negative real parts', 'All eigenvalues are real'], answer: 'All eigenvalues have negative real parts', hints: ['Each mode $e^{\\lambda_i t}$ decays iff $\\text{Re}(\\lambda_i) < 0$.', 'This is the Hurwitz stability criterion.'], reviewSection: 'intuition' },
    { id: 'q-la8-003-2', type: 'choice', question: 'Complex eigenvalues $\\sigma \\pm i\\omega$ produce solutions that:', options: ['Grow exponentially', 'Oscillate with frequency $\\omega$ and amplitude $\\propto e^{\\sigma t}$', 'Converge to a fixed point regardless of $\\sigma$', 'Are always purely oscillatory'], answer: 'Oscillate with frequency $\\omega$ and amplitude $\\propto e^{\\sigma t}$', hints: ['$e^{(\\sigma + i\\omega)t} = e^{\\sigma t}(\\cos\\omega t + i\\sin\\omega t)$.', 'The real part $\\sigma$ governs growth/decay; the imaginary part $\\omega$ governs frequency.'], reviewSection: 'intuition' },
    { id: 'q-la8-003-3', type: 'choice', question: 'A second-order ODE $\\ddot{x} + a\\dot{x} + bx = 0$ is converted to first-order by:', options: ['Differentiating twice', 'Setting $z_1 = x, z_2 = \\dot{x}$', 'Taking the Laplace transform', 'Setting $z = e^{\\lambda t}$'], answer: 'Setting $z_1 = x, z_2 = \\dot{x}$', hints: ['Introduce the velocity as a second state variable.', 'Then $\\dot{z}_1 = z_2$ and $\\dot{z}_2 = -bz_1 - az_2$.'], reviewSection: 'intuition' },
    { id: 'q-la8-003-4', type: 'choice', question: 'For the rotation matrix $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$, the eigenvalues are:', options: ['$\\pm 1$', '$0, 0$', '$\\pm i$', '$1 \\pm i$'], answer: '$\\pm i$', hints: ['$\\det(A - \\lambda I) = \\lambda^2 + 1 = 0$.', 'Purely imaginary eigenvalues produce rotation.'], reviewSection: 'intuition' },
    { id: 'q-la8-003-5', type: 'choice', question: 'The matrix exponential $e^{At}$ for a diagonalizable $A = PDP^{-1}$ is:', options: ['$Pe^D P^{-1}$', '$P e^{Dt} P^{-1}$', '$e^{P} D e^{P^{-1}}$', '$P D^t P^{-1}$'], answer: '$P e^{Dt} P^{-1}$', hints: ['$e^{Dt}$ is diagonal with entries $e^{\\lambda_i t}$.', 'Substitute $A = PDP^{-1}$ into the power series for $e^{At}$.'], reviewSection: 'math' },
    { id: 'q-la8-003-6', type: 'choice', question: 'A system with eigenvalues $\\{-1, 2\\}$ is:', options: ['Asymptotically stable', 'Marginally stable', 'Unstable (one positive eigenvalue)', 'Stable only if the initial condition is small'], answer: 'Unstable (one positive eigenvalue)', hints: ['Any positive real eigenvalue causes exponential growth.', '$e^{2t} \\to \\infty$ as $t \\to \\infty$.'], reviewSection: 'intuition' },
    { id: 'q-la8-003-7', type: 'choice', question: 'The Lyapunov criterion says $A$ is Hurwitz stable iff:', options: ['$\\det(A) > 0$', 'There exists symmetric positive definite $P$ with $A^\\top P + PA < 0$', '$A$ has full rank', '$A + A^\\top$ is negative definite'], answer: 'There exists symmetric positive definite $P$ with $A^\\top P + PA < 0$', hints: ['The Lyapunov equation $A^\\top P + PA = -Q$ (with $Q > 0$) must be solvable.', 'This is the matrix-inequality form of Hurwitz stability.'], reviewSection: 'math' },
    { id: 'q-la8-003-8', type: 'choice', question: 'Purely imaginary eigenvalues $\\pm i\\omega$ (no real part) imply:', options: ['Asymptotic stability', 'Marginal stability — perpetual oscillation', 'Unstable exponential growth', 'Solutions decay to zero'], answer: 'Marginal stability — perpetual oscillation', hints: ['$e^{i\\omega t}$ has magnitude 1 for all $t$.', 'The rotation system is the canonical example.'], reviewSection: 'intuition' },
    { id: 'q-la8-003-9', type: 'choice', question: 'LQR (Linear Quadratic Regulator) finds the optimal feedback gain $K$ by solving:', options: ['The characteristic polynomial of $A$', 'The algebraic Riccati equation', 'The Lyapunov equation $AP + PA^\\top = 0$', 'The eigenvalue problem $Av = \\lambda v$'], answer: 'The algebraic Riccati equation', hints: ['LQR minimizes $\\int_0^\\infty (\\mathbf{x}^\\top Q\\mathbf{x} + \\mathbf{u}^\\top R\\mathbf{u})\\, dt$.', 'The optimal solution involves a Riccati equation, not just eigenvalues.'], reviewSection: 'rigor' },
    { id: 'q-la8-003-10', type: 'choice', question: 'A defective Jordan block for eigenvalue $\\lambda = -1$ produces solution terms like:', options: ['$e^{-t}$ only', '$te^{-t}$ in addition to $e^{-t}$', '$t^2$ (polynomial growth)', '$e^{t}$ (unstable)'], answer: '$te^{-t}$ in addition to $e^{-t}$', hints: ['Jordan blocks add polynomial prefactors $t^k$.', 'The factor $te^{-t}$ still decays to zero since $e^{-t}$ dominates — so the system remains stable.'], reviewSection: 'rigor' },
  ],

  mastery: { targetLevel: 2, solveIndependently: 'Given a 2×2 system matrix $A$, compute eigenvalues, classify stability, write the general solution, and solve a specific IVP.', explainVerbally: 'Explain why the matrix exponential $e^{At}$ solves $\\dot{\\mathbf{x}} = A\\mathbf{x}$, and why eigenvalue real parts control stability.', detectIncorrectApplication: 'Recognize when a system appears stable based on $\\det A > 0$ but is actually unstable due to a positive eigenvalue.', transferToUnfamiliar: 'Given a network of coupled compartments (e.g., drug concentrations in organs), write the linear ODE system, find eigenvalues, and determine whether concentrations eventually go to zero.' },
  misconceptions: [
    { falseBelief: '$\\det(A) > 0$ implies stability.', whyStudentsThinkIt: 'A positive determinant feels like a "good" matrix property. Also, for $2\\times2$ matrices, $\\det A = \\lambda_1\\lambda_2 > 0$ means eigenvalues have the same sign — but they could both be positive.', correctionExample: '$A = \\begin{bmatrix}1&0\\\\0&2\\end{bmatrix}$ has $\\det A = 2 > 0$ but eigenvalues $1, 2$ — both positive, completely unstable.', contrastCase: 'Compare $\\begin{bmatrix}-1&0\\\\0&-2\\end{bmatrix}$ (stable, $\\det = 2 > 0$) vs $\\begin{bmatrix}1&0\\\\0&2\\end{bmatrix}$ (unstable, $\\det = 2 > 0$). Determinant alone is insufficient.' },
    { falseBelief: 'Purely imaginary eigenvalues mean the system is stable (solutions stay bounded).', whyStudentsThinkIt: 'Bounded oscillations look "safe." Students confuse marginally stable with asymptotically stable.', correctionExample: 'The rotation system with eigenvalues $\\pm i$ is marginally stable — solutions neither grow nor decay. But any small perturbation making real parts positive turns it unstable immediately.', contrastCase: 'Damped oscillator ($\\lambda = -0.1 \\pm 3i$) is asymptotically stable — solutions spiral inward. Undamped ($\\lambda = \\pm 3i$) is marginal — solutions circle forever.' },
  ],
  transferPrompts: [
    { situation: 'You are designing an autopilot and need all system states to converge to zero after a disturbance.', competingTechniques: 'Check $\\det(A) > 0$; check all eigenvalues have negative real parts; check the trace of $A$ is negative.', whyThisTechniqueWins: 'Only the eigenvalue condition (Hurwitz stability) is both necessary and sufficient. Trace negative is necessary but not sufficient for $n > 2$. Determinant positive is neither necessary nor sufficient in general.' },
    { situation: 'You want to model a spring-mass-damper system and predict whether it oscillates or decays monotonically.', competingTechniques: 'Simulate numerically; compute eigenvalues; measure the discriminant of the characteristic polynomial.', whyThisTechniqueWins: 'Eigenvalues give immediate classification: complex $\\Rightarrow$ oscillatory, real negative $\\Rightarrow$ monotone decay. The discriminant of the char. poly. is the same computation — but eigenvalue language generalizes to higher-order systems directly.' },
  ],
  debugging: [
    { commonError: 'Using $e^A$ (matrix exponential at a fixed time) instead of $e^{At}$ (as a function of $t$).', symptom: 'The "solution" is a fixed matrix, not a trajectory. Plugging in $t = 0$ does not give $\\mathbf{x}_0$.', whyItHappened: 'The matrix exponential requires the scalar $t$ to be included in the exponent: $e^{At}$ depends on $t$, not just $A$.', repairStrategy: 'Always write $e^{At}$ and verify: (1) at $t=0$, $e^{A \\cdot 0} = I$; (2) differentiate to confirm $\\frac{d}{dt}e^{At} = Ae^{At}$.' },
    { commonError: 'Confusing the state-space conversion: putting $-b, -a$ in the wrong entries.', symptom: '$\\ddot{x} + a\\dot{x} + bx = 0$ is converted to the wrong companion matrix, giving incorrect eigenvalues.', whyItHappened: 'The companion matrix for $\\ddot{x} + a\\dot{x} + bx = 0$ with state $(x, \\dot{x})$ is $\\begin{bmatrix}0&1\\\\-b&-a\\end{bmatrix}$, not $\\begin{bmatrix}0&1\\\\b&a\\end{bmatrix}$. Sign errors are common.', repairStrategy: 'Rearrange the ODE as $\\ddot{x} = -bx - a\\dot{x}$ to read off the second row directly: the second row of $A$ is $(-b, -a)$.' },
  ],
};
