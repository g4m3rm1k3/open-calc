import odeOrbitUrl from '../diagrams/la-ode-rotation-orbit.svg?url';
import stabilityHalfplaneUrl from '../diagrams/la-stability-halfplane.svg?url';

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
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      '**Where you are in the story.** PCA turned a data problem into an eigenvector computation. Markov chains turned a network problem into the same. This lesson shows the same eigenvalue machinery applied to continuous time: differential equations. The systems $\\dot{\\mathbf{x}} = A\\mathbf{x}$ appear everywhere in physics and engineering — spring-mass systems, RLC circuits, population dynamics, aircraft autopilots. Eigenvalues determine whether solutions grow, decay, or oscillate, without ever solving the ODE explicitly.',

      '**The single equation first.** Before coupling: $\\dot{x} = ax$ has solution $x(t) = e^{at} x_0$. If $a < 0$: decay to zero. If $a > 0$: grow to infinity. If $a = 0$: constant. Everything in the matrix case is the same pattern, applied to each eigenmode independently.',

      '**Concrete first: the rotation system.** Take $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$. The characteristic polynomial is $\\lambda^2 + 1 = 0$, so $\\lambda = \\pm i$ (purely imaginary). The matrix exponential is $e^{At} = \\begin{bmatrix}\\cos t&-\\sin t\\\\\\sin t&\\cos t\\end{bmatrix}$ — a rotation matrix! Starting from $(1,0)^\\top$, the solution traces a perfect circle. Pure imaginary eigenvalues = perpetual oscillation, no growth or decay.',
      ] },
      { type: 'image', src: odeOrbitUrl,
        alt: 'A phase portrait showing a perfect circular orbit starting at (1,0), traced by the solution of a system with purely imaginary eigenvalues',
        caption: 'Purely imaginary eigenvalues trace a closed circular orbit — the solution rotates forever, never growing or decaying.' },
      { type: 'prose', paragraphs: [
      '**Predict before reading on.** For $A = \\begin{bmatrix}-1&2\\\\0&-3\\end{bmatrix}$, the eigenvalues are $-1$ and $-3$ (both negative real). What does the solution $\\mathbf{x}(t)$ do as $t \\to \\infty$? Is the system stable, asymptotically stable, or unstable? Write your answer before reading further.',

      '**The matrix exponential and eigendecomposition.** For diagonalizable $A = PDP^{-1}$: $e^{At} = Pe^{Dt}P^{-1}$ where $e^{Dt} = \\text{diag}(e^{\\lambda_1 t}, \\ldots, e^{\\lambda_n t})$. The general solution decomposes into modes: $\\mathbf{x}(t) = \\sum_i c_i e^{\\lambda_i t}\\mathbf{v}_i$ where $\\mathbf{v}_i$ are eigenvectors and $c_i = (P^{-1}\\mathbf{x}_0)_i$. Each mode evolves independently. If $\\text{Re}(\\lambda_i) < 0$: mode $i$ decays. If $\\text{Re}(\\lambda_i) > 0$: it explodes. The long-term behavior is controlled by the eigenvalue with the largest real part.',

      '**Stability is purely about eigenvalue real parts.** A system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is asymptotically stable (all solutions $\\to \\mathbf{0}$ as $t \\to \\infty$) if and only if all eigenvalues of $A$ have negative real parts. One eigenvalue with positive real part makes the system unstable. This is a complete characterization — no other information about $A$ is needed. Engineers check the eigenvalue real parts (or use the Routh-Hurwitz criterion) before building control systems.',
      ] },
      { type: 'image', src: stabilityHalfplaneUrl,
        alt: 'The complex plane split into a green left half where eigenvalues decay and a red right half where eigenvalues grow, with three example eigenvalues plotted',
        caption: 'A system is stable if and only if every eigenvalue of A lies strictly in the left half of the complex plane.' },
      { type: 'prose', paragraphs: [
      '**Reducing second-order systems to first-order.** The ODE $\\ddot{x} + a\\dot{x} + bx = 0$ becomes a first-order system by setting state $\\mathbf{z} = (x, \\dot{x})^\\top$: $\\dot{\\mathbf{z}} = \\begin{bmatrix}0&1\\\\-b&-a\\end{bmatrix}\\mathbf{z}$. The eigenvalues of this companion matrix are the roots of $\\lambda^2 + a\\lambda + b = 0$ — the characteristic polynomial of the second-order equation. This reduction is how every higher-order ODE is analyzed numerically and theoretically.',

      '**Where this is heading.** The final lesson in this chapter applies these ideas to 3D computer graphics — transformations, rotations, projections. The connection: rotation matrices are exactly the matrix exponential of skew-symmetric $A$, which have purely imaginary eigenvalues. The algebra of rotations in 3D is the spectral theory of skew-symmetric matrices.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Linear ODEs with NumPy and SciPy',
        mathBridge: 'Compute the matrix exponential, simulate ODE trajectories, and classify stability from eigenvalues.',
        caption: 'scipy.linalg.expm computes the matrix exponential exactly; scipy.integrate.odeint solves ODE systems numerically.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Matrix exponential and stability classification',
              prose: [
                'Check eigenvalue real parts to classify stability, then compute the matrix exponential using scipy.',
                '`vals = np.linalg.eigvals(A)`. Stable: `all(vals.real < 0)`. Unstable: `any(vals.real > 0)`. Marginally stable: `all(vals.real <= 0) and any(vals.real == 0)`. `scipy.linalg.expm(A * t)` computes the matrix exponential at time t — this is the solution operator: `x(t) = expm(A*t) @ x0`.',
                'For a 2×2 system, plot the phase portrait using `ax.streamplot`. The eigenvalue classification appears directly in the portrait: negative reals → stable node; complex with negative real parts → stable focus; positive reals → unstable node; purely imaginary → center. Each type has a distinct visual signature.',
              ],
              code: `import numpy as np
from scipy.linalg import expm

# Three systems with different stability
systems = {
    "Stable spiral": np.array([[-1.0, 2.0], [-2.0, -1.0]]),
    "Unstable node":  np.array([[2.0, 1.0], [0.0, 3.0]]),
    "Center (pure oscillation)": np.array([[0.0, -1.0], [1.0, 0.0]]),
}

for name, A in systems.items():
    eigs = np.linalg.eigvals(A)
    max_real = max(e.real for e in eigs)
    stable = "asymptotically stable" if max_real < 0 else ("marginally stable" if max_real == 0 else "UNSTABLE")
    print(f"{name}")
    print(f"  Eigenvalues: {np.round(eigs, 3)}")
    print(f"  Status: {stable}")
    print()
`,
            },
            {
              id: 2,
              cellTitle: 'Simulate ODE trajectory using matrix exponential',
              prose: [
                'Solve x_dot = A x analytically via matrix exponential and plot the trajectory.',
                '`t_vals = np.linspace(0, 5, 200); x0 = np.array([2.0, 0.5])`. For each t: `x_t = scipy.linalg.expm(A * t) @ x0`. Stack: `trajectory = np.array([scipy.linalg.expm(A*t) @ x0 for t in t_vals])`. Plot `trajectory[:,0]` and `trajectory[:,1]` vs t, plus the phase portrait.',
                'Compare to `scipy.integrate.odeint(lambda x,t: A@x, x0, t_vals)` — they should agree perfectly. The matrix exponential approach is exact (no numerical integration error); scipy\'s odeint uses Runge-Kutta approximation. For linear systems, `expm` is always preferred. The phase portrait `plt.plot(*trajectory.T)` shows the trajectory as a curve in state space.',
              ],
              code: `import numpy as np
from scipy.linalg import expm

# Stable spiral: A with eigenvalues -1 +/- 2i
A = np.array([[-1.0, 2.0], [-2.0, -1.0]])
x0 = np.array([1.0, 0.0])

t_vals = np.linspace(0, 4, 100)
x_traj = np.array([expm(A * t) @ x0 for t in t_vals])

print("Trajectory x(t) = e^{At} x0:")
print(f"  x(0) = {np.round(x0, 3)}")
print(f"  x(1) = {np.round(expm(A*1) @ x0, 3)}")
print(f"  x(2) = {np.round(expm(A*2) @ x0, 3)}")
print(f"  x(4) = {np.round(expm(A*4) @ x0, 3)}")
print()
print("||x(t)|| decays (stable):", np.linalg.norm(x_traj[-1]) < np.linalg.norm(x_traj[0]))
print("Final distance from origin:", np.round(np.linalg.norm(x_traj[-1]), 6))
`,
            },
            {
              id: 3,
              cellTitle: 'Second-order ODE as first-order system',
              prose: [
                'Convert x_ddot + a*x_dot + b*x = 0 to state space and analyze stability by eigenvalues.',
                'Define state vector `[x, x_dot]`. System matrix: `A = np.array([[0, 1], [-b, -a]])`. This is the companion matrix. Eigenvalues of A are the roots of the characteristic polynomial `s² + as + b = 0`: `λ = (-a ± sqrt(a²-4b))/2`. For a damped oscillator (a>0, b>0): both eigenvalues have negative real part → stable.',
                '`vals = np.linalg.eigvals(A)`. For underdamped (a²<4b): complex conjugate pair → decaying oscillations. For overdamped (a²>4b): two real negative values → no oscillation. For critically damped (a²=4b): repeated eigenvalue. Plot trajectories for all three regimes overlaid — the eigenvalue type directly determines the qualitative shape of the response curve.',
              ],
              code: `import numpy as np

# Spring-mass-damper: x'' + 2*zeta*wn*x' + wn^2*x = 0
# State: z = (x, x')
# z' = [[0, 1], [-wn^2, -2*zeta*wn]] z

configs = [
    ("Underdamped (osc, decay)", 1.0, 0.3),
    ("Overdamped (slow decay)",  1.0, 2.0),
    ("Undamped (pure osc)",      1.0, 0.0),
    ("Critically damped",        1.0, 1.0),
]

for name, wn, zeta in configs:
    A = np.array([[0.0, 1.0], [-wn**2, -2*zeta*wn]])
    eigs = np.linalg.eigvals(A)
    print(f"{name}  (wn={wn}, zeta={zeta})")
    print(f"  Eigenvalues: {np.round(eigs, 3)}")
    print(f"  Stable: {all(e.real < 0 for e in eigs)}")
    print()
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'ODE Stability Analysis',
        mathBridge: 'Analyze stability of linear systems via eigenvalues.',
        caption: 'Eigenvalue signs determine stability — no explicit solution needed.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stability from eigenvalues',
              prose: [
                'Check stability of a 2x2 linear system by examining eigenvalue real parts.',
                '`lam = eig(A); stable = all(real(lam) < 0)`. For a stable focus: `A = [-1 2; -2 -1]` — complex eigenvalues with negative real parts. For an unstable node: `A = [1 0; 0 2]` — positive real eigenvalues. Print eigenvalues and stability classification for both.',
                'The phase portrait confirms stability: `[x1,x2] = meshgrid(-3:0.3:3,-3:0.3:3); dx1 = A(1,1)*x1+A(1,2)*x2; dx2 = A(2,1)*x1+A(2,2)*x2; quiver(x1,x2,dx1,dx2)`. Arrows spiraling inward = stable focus; arrows pointing outward = unstable. This visual is exactly what the eigenvalue sign predicts.',
              ],
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
              prose: [
                'Solve dx/dt = Ax with x0 via diagonalization. Sample the trajectory.',
                '`[P,D] = eig(A); t_vals = 0:0.05:5; x0=[2;0.5]`. For each t: `x(:,k) = P * diag(exp(diag(D)*t_vals(k))) * (P\\x0)`. Or: `x(:,k) = expm(A*t_vals(k)) * x0` using the built-in matrix exponential. `expm` in MATLAB uses the Padé approximation.',
                'Plot x1(t) and x2(t) separately (time-domain) and the phase portrait x2 vs x1 (state-space). A stable focus gives a decaying spiral in the phase portrait and damped oscillations in the time domain. The matrix exponential captures ALL of this in one formula: `x(t) = expm(A*t)*x0`.',
              ],
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
    callouts: [
      {
        type: 'procedure',
        title: 'How to Analyze Stability of $\\dot{\\mathbf{x}} = A\\mathbf{x}$ (4 Steps)',
        body: '1. **Find eigenvalues.** Compute $\\det(A - \\lambda I) = 0$ by hand for small $n$, or use `np.linalg.eigvals(A)`. For upper or lower triangular $A$, eigenvalues are the diagonal entries.\n2. **Check real parts.** If all $\\operatorname{Re}(\\lambda_i) < 0$: asymptotically stable — all solutions $\\to \\mathbf{0}$. If any $\\operatorname{Re}(\\lambda_i) > 0$: unstable. If $\\operatorname{Re}(\\lambda_i) = 0$ for some $i$: marginally stable (need Lyapunov analysis to decide).\n3. **Classify modes.** Real $\\lambda$: pure exponential growth/decay. Complex $\\lambda = \\sigma\\pm i\\omega$: oscillation at frequency $\\omega$ with amplitude $\\propto e^{\\sigma t}$. Check the imaginary part for oscillatory behavior.\n4. **Write the general solution** (diagonalizable case). Eigenvectors $\\mathbf{v}_i$ for eigenvalues $\\lambda_i$: $\\mathbf{x}(t) = \\sum_i c_i e^{\\lambda_i t}\\mathbf{v}_i$ where $\\mathbf{c} = P^{-1}\\mathbf{x}_0$ and $P=[\\mathbf{v}_1|\\cdots|\\mathbf{v}_n]$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — Applications of Linear Algebra',
        body: '**Previous (Lesson 2):** Markov chains and PageRank — stationary distributions as dominant eigenvectors.\n**This lesson:** ODEs and linear systems — eigenvalues determine stability; $\\dot{\\mathbf{x}} = A\\mathbf{x}$ solved by $e^{At}$.\n**Next (Lesson 4):** Computer graphics — rotations, projections, homogeneous coordinates.',
      },
      {
        type: 'insight',
        title: 'Stability Classification',
        body: 'For $\\dot{\\mathbf{x}} = A\\mathbf{x}$ with eigenvalue $\\lambda = \\sigma + i\\omega$:\n\n$\\sigma < 0$: decaying oscillation (stable spiral)\n$\\sigma = 0, \\omega \\neq 0$: pure oscillation (center)\n$\\sigma > 0$: growing oscillation (unstable spiral)\nAll real $\\lambda < 0$: exponential decay (stable node)\nAny real $\\lambda > 0$: exponential growth (unstable node)\nReal eigenvalues of opposite signs: saddle (unstable)',
      },
      {
        type: 'insight',
        title: 'Solution via Eigendecomposition',
        body: 'For diagonalizable $A = PDP^{-1}$:\n$\\mathbf{x}(t) = \\sum_{i=1}^n c_i e^{\\lambda_i t} \\mathbf{v}_i$\nwhere $c_i = (P^{-1}\\mathbf{x}_0)_i$.\n\nStable modes ($\\text{Re}(\\lambda_i) < 0$) die out.\nUnstable modes ($\\text{Re}(\\lambda_i) > 0$) dominate.\nLong-term: controlled by eigenvalue with largest real part.',
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
      '**Lyapunov stability and the matrix inequality.** A quadratic Lyapunov function $V(\\mathbf{x}) = \\mathbf{x}^\\top P\\mathbf{x}$ (with $P \\succ 0$) has time derivative $\\dot{V} = \\mathbf{x}^\\top(A^\\top P + PA)\\mathbf{x}$. If $A^\\top P + PA \\prec 0$ (negative definite), then $\\dot{V} < 0$ everywhere and the origin is asymptotically stable. This leads to the **Lyapunov equation**: given $Q \\succ 0$, solve $A^\\top P + PA = -Q$ for $P \\succ 0$. A unique positive definite solution exists if and only if $A$ is Hurwitz. The equation is solved in $O(n^3)$ via the Schur decomposition of $A$ — a purely algebraic stability certificate that avoids computing eigenvalues.',
      '**Computing $e^{At}$ via the Schur decomposition.** For general (possibly non-diagonalizable) $A$: use $A = QTQ^*$ (Schur, cf. la7-006) to write $e^{At} = Q\\, e^{Tt}\\, Q^*$. Since $T$ is upper triangular, $e^{Tt}$ is computed efficiently via Parlett\'s recurrence along the superdiagonal. In practice, `scipy.linalg.expm` uses the Padé approximant with scaling-and-squaring: $e^A \\approx R_m(A/2^s)^{2^s}$ where $R_m$ is a rational $(m,m)$ Padé approximant. This achieves backward stability with relative error $O(\\varepsilon_{\\text{mach}})$ and runs in $O(n^3)$.',
      '**Controllability and the Kalman rank condition.** The LTI system $(A, B)$ is **controllable** iff the Kalman controllability matrix $\\mathcal{C} = [B \\mid AB \\mid A^2B \\mid \\cdots \\mid A^{n-1}B]$ satisfies $\\operatorname{rank}(\\mathcal{C}) = n$. Equivalently (PBH test): $(A - \\lambda I,\\, B)$ has full column rank for every eigenvalue $\\lambda$ of $A$. Controllability is exactly the condition under which pole placement and LQR are possible — it guarantees every eigenvalue of $A$ can be moved to any desired location by state feedback $\\mathbf{u} = -K\\mathbf{x}$.',
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

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la8-003-stability-analysis',
      title: 'Stability of a Linear ODE System: Eigenvalue Classification',
      prereqs: ['Eigenvalues', 'Matrix exponential', 'ODE solutions'],
      problem: 'Classify the stability of $\\dot{\\mathbf{x}} = A\\mathbf{x}$ for each case: (a) eigenvalues $-2,-3$; (b) eigenvalues $1,-2$; (c) eigenvalues $\\pm 2i$; (d) eigenvalues $-1\\pm 2i$.',
      steps: [
        {
          label: 'Rule: stability is determined by the real parts of eigenvalues',
          strategy: 'For $\\dot{\\mathbf{x}}=A\\mathbf{x}$: each eigenvalue $\\lambda=a+bi$ contributes a term $e^{at}(\\cos bt, \\sin bt)$ to the solution. The $e^{at}$ factor determines growth or decay.',
          explanation: 'If all eigenvalues have negative real parts → $e^{at}\\to 0$ → asymptotically stable. Any positive real part → exponential growth → unstable. Pure imaginary → $e^{0\\cdot t}=1$ → oscillates forever (neutrally stable).',
          math: '\\text{Re}(\\lambda)<0\\;\\forall\\lambda \\Rightarrow \\text{stable}',
        },
        {
          label: 'Classify each case',
          strategy: 'Apply the rule to each set of eigenvalues.',
          explanation: '(a) $-2,-3$: all real parts negative → asymptotically stable. (b) $1,-2$: one positive real part → unstable (saddle). (c) $\\pm 2i$: zero real parts → neutrally stable (center, oscillates). (d) $-1\\pm 2i$: real parts $-1<0$ → asymptotically stable (stable spiral inward).',
          math: '(a)\\;\\text{stable},\\;(b)\\;\\text{unstable},\\;(c)\\;\\text{neutral},\\;(d)\\;\\text{stable spiral}',
          gotcha: 'Neutral stability (c) is fragile: any small perturbation to the matrix can make it stable or unstable. In applications, pure imaginary eigenvalues should be treated with caution.',
        },
        {
          label: 'Connect to the phase portrait',
          strategy: 'Each stability type has a characteristic phase portrait.',
          explanation: '(a) Node (trajectories converge to origin). (b) Saddle (one stable direction, one unstable). (c) Center (closed ellipses). (d) Stable spiral (trajectories spiral in).',
          math: '\\text{stable node (a)},\\;\\text{saddle (b)},\\;\\text{center (c)},\\;\\text{stable spiral (d)}',
        },
      ],
    },
    {
      id: 'wt-la8-003-coupled-odes',
      title: 'Decoupling and Solving a 2×2 ODE System',
      prereqs: ['Eigenvalues', 'Matrix exponential', 'Change of variables'],
      problem: 'Solve $\\dot{\\mathbf{x}} = \\begin{bmatrix}-2&1\\\\0&-1\\end{bmatrix}\\mathbf{x}$ with $\\mathbf{x}(0)=[1,2]^\\top$.',
      steps: [
        {
          label: 'Read eigenvalues from the triangular matrix',
          strategy: 'Triangular matrices have eigenvalues on the diagonal.',
          explanation: '$\\lambda_1=-2$, $\\lambda_2=-1$. Both negative → asymptotically stable.',
          math: '\\lambda_1=-2,\\quad\\lambda_2=-1',
        },
        {
          label: 'Find eigenvectors',
          strategy: 'Solve $(A-\\lambda_i I)\\mathbf{v}_i=\\mathbf{0}$ for each.',
          explanation: 'For $\\lambda_1=-2$: $(A+2I)=\\begin{bmatrix}0&1\\\\0&1\\end{bmatrix}\\Rightarrow\\mathbf{v}_1=[1,0]^\\top$. For $\\lambda_2=-1$: $(A+I)=\\begin{bmatrix}-1&1\\\\0&0\\end{bmatrix}\\Rightarrow\\mathbf{v}_2=[1,1]^\\top$.',
          math: '\\mathbf{v}_1=\\begin{bmatrix}1\\\\0\\end{bmatrix},\\quad\\mathbf{v}_2=\\begin{bmatrix}1\\\\1\\end{bmatrix}',
        },
        {
          label: 'Write the general solution',
          strategy: '$\\mathbf{x}(t) = c_1 e^{\\lambda_1 t}\\mathbf{v}_1 + c_2 e^{\\lambda_2 t}\\mathbf{v}_2$.',
          explanation: '$\\mathbf{x}(t) = c_1 e^{-2t}[1,0]^\\top + c_2 e^{-t}[1,1]^\\top$.',
          math: '\\mathbf{x}(t) = c_1 e^{-2t}\\begin{bmatrix}1\\\\0\\end{bmatrix}+c_2 e^{-t}\\begin{bmatrix}1\\\\1\\end{bmatrix}',
        },
        {
          label: 'Apply the initial condition to find $c_1, c_2$',
          strategy: 'At $t=0$: $c_1\\mathbf{v}_1+c_2\\mathbf{v}_2=\\mathbf{x}(0)$.',
          explanation: '$c_1[1,0]+c_2[1,1]=[1,2]$. Row 2: $c_2=2$. Row 1: $c_1+2=1\\Rightarrow c_1=-1$.',
          math: 'c_1=-1,\\quad c_2=2 \\Rightarrow \\mathbf{x}(t)=-e^{-2t}\\begin{bmatrix}1\\\\0\\end{bmatrix}+2e^{-t}\\begin{bmatrix}1\\\\1\\end{bmatrix}',
          gotcha: 'As $t\\to\\infty$: $e^{-2t}\\to 0$ faster than $e^{-t}$. The long-term behavior is dominated by the LEAST negative eigenvalue ($\\lambda_2=-1$): $\\mathbf{x}(t)\\approx 2e^{-t}[1,1]^\\top$. The "slowest mode" controls long-term behavior.',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la8-003-1',
      title: 'Stability of coupled populations',
      difficulty: 'medium',
      problem: 'The linearized Lotka-Volterra equations near equilibrium are $\\dot{\\mathbf{x}} = \\begin{bmatrix}0&-a\\\\b&0\\end{bmatrix}\\mathbf{x}$ with $a, b > 0$. Classify the stability. What do solutions look like?',
      walkthrough: [
        { expression: 'A = \\begin{bmatrix}0 & -a \\\\ b & 0\\end{bmatrix}', annotation: 'Write the system matrix. Zero diagonal means no self-damping — no intrinsic decay in either population.' },
        { expression: '\\det(A - \\lambda I) = \\lambda^2 + ab = 0', annotation: 'Characteristic polynomial: $(0-\\lambda)^2 - (-a)(b) = \\lambda^2 + ab = 0$.' },
        { expression: '\\lambda = \\pm i\\sqrt{ab}', annotation: 'Eigenvalues are purely imaginary since $a,b > 0$ so $ab > 0$. No real part.' },
        { expression: '\\operatorname{Re}(\\lambda) = 0 \\text{ for both eigenvalues}', annotation: 'Neither strictly negative nor positive — marginally stable (center equilibrium).' },
        { expression: '\\mathbf{x}(t) \\text{ oscillates with frequency } \\omega = \\sqrt{ab},\\ \\text{amplitude constant}', annotation: 'Classical predator-prey cycles — perpetual oscillation with no growth or decay.' },
      ],
    },
    {
      id: 'ch-la8-003-2',
      title: 'Classify a stable node',
      difficulty: 'easy',
      problem: 'Classify the stability of $A = \\begin{bmatrix}-2&1\\\\0&-3\\end{bmatrix}$ and identify what type of equilibrium the origin is.',
      walkthrough: [
        { expression: 'A \\text{ is upper triangular}', annotation: 'Eigenvalues of a triangular matrix are its diagonal entries — read them off directly.' },
        { expression: '\\lambda_1 = -2,\\quad \\lambda_2 = -3', annotation: 'Both eigenvalues are real and negative.' },
        { expression: '\\operatorname{Re}(\\lambda_1) = -2 < 0,\\quad \\operatorname{Re}(\\lambda_2) = -3 < 0', annotation: 'Both real parts are strictly negative: asymptotically stable by the Hurwitz criterion.' },
        { expression: '\\text{Real (not complex) eigenvalues} \\Rightarrow \\text{stable node}', annotation: 'No imaginary parts means no oscillation — solutions decay monotonically toward zero along eigenvector directions.' },
        { expression: '\\mathbf{x}(t) = c_1 e^{-2t}\\mathbf{v}_1 + c_2 e^{-3t}\\mathbf{v}_2 \\to \\mathbf{0}', annotation: 'Both modes decay exponentially; the $e^{-3t}$ mode dies faster, so the $\\mathbf{v}_1$ direction dominates long-term.' },
      ],
    },
    {
      id: 'ch-la8-003-3',
      title: 'Solve an IVP by eigendecomposition',
      difficulty: 'hard',
      problem: 'For $A = \\begin{bmatrix}-1&4\\\\0&-2\\end{bmatrix}$ with $\\mathbf{x}(0) = (1,1)^\\top$, find $\\mathbf{x}(t)$ explicitly and verify at $t=0$ and by checking $\\dot{\\mathbf{x}}(0) = A\\mathbf{x}(0)$.',
      walkthrough: [
        { expression: '\\lambda_1 = -1,\\quad \\lambda_2 = -2', annotation: 'Upper triangular — eigenvalues are diagonal entries. Both negative: asymptotically stable.' },
        { expression: '(A + I)\\mathbf{v} = 0:\\quad A+I = \\begin{bmatrix}0&4\\\\0&-1\\end{bmatrix} \\Rightarrow \\mathbf{v}_1 = (1,0)^\\top', annotation: 'Eigenvector for $\\lambda_1 = -1$: the null space of $A+I$ is spanned by $(1,0)^\\top$.' },
        { expression: '(A + 2I)\\mathbf{v} = 0:\\quad A+2I = \\begin{bmatrix}1&4\\\\0&0\\end{bmatrix} \\Rightarrow \\mathbf{v}_2 = (-4,1)^\\top', annotation: 'Eigenvector for $\\lambda_2 = -2$: null space of $A+2I$ is spanned by $(-4,1)^\\top$.' },
        { expression: '\\mathbf{x}(t) = c_1 e^{-t}(1,0)^\\top + c_2 e^{-2t}(-4,1)^\\top', annotation: 'General solution as superposition of two modes.' },
        { expression: 'c_2 = 1,\\quad c_1 - 4c_2 = 1 \\Rightarrow c_1 = 5', annotation: 'From $y$-component: $c_2 = 1$. From $x$-component: $c_1 + c_2(-4) = 1 \\Rightarrow c_1 = 5$.' },
        { expression: '\\mathbf{x}(t) = \\bigl(5e^{-t} - 4e^{-2t},\\; e^{-2t}\\bigr)^\\top', annotation: 'Explicit solution. Verify: $\\mathbf{x}(0) = (5-4,\\ 1)^\\top = (1,1)^\\top$ ✓' },
        { expression: '\\dot{\\mathbf{x}}(0) = (3,-2)^\\top,\\quad A\\mathbf{x}(0) = \\begin{bmatrix}-1&4\\\\0&-2\\end{bmatrix}\\!\\begin{pmatrix}1\\\\1\\end{pmatrix} = (3,-2)^\\top \\checkmark', annotation: 'Cross-check: derivative at $t=0$ matches $A\\mathbf{x}_0$.' },
      ],
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
  semantics: {
    core: [
      { symbol: '\\mathbf{x}(t) = e^{At}\\mathbf{x}_0', meaning: 'General solution to $\\dot{\\mathbf{x}} = A\\mathbf{x}$ — the matrix exponential propagates the initial condition forward in time.' },
      { symbol: '\\lambda = \\sigma + i\\omega', meaning: 'Complex eigenvalue of $A$ — real part $\\sigma$ governs exponential growth/decay rate; imaginary part $\\omega$ governs oscillation frequency.' },
      { symbol: 'A \\text{ Hurwitz}', meaning: 'All eigenvalues of $A$ have strictly negative real parts — equivalent to asymptotic stability of $\\dot{\\mathbf{x}} = A\\mathbf{x}$.' },
      { symbol: '\\begin{bmatrix}0&1\\\\-b&-a\\end{bmatrix}', meaning: 'Companion matrix for $\\ddot{x}+a\\dot{x}+bx=0$ — its eigenvalues are the characteristic roots of the ODE; diagonal entries are 0 and $-a$.' },
      { symbol: 'A^\\top P + PA = -Q', meaning: 'Lyapunov equation — has unique $P \\succ 0$ solution iff $A$ is Hurwitz; provides an algebraic stability certificate without computing eigenvalues.' },
      { symbol: '\\mathcal{C} = [B \\mid AB \\mid \\cdots \\mid A^{n-1}B]', meaning: 'Kalman controllability matrix — $\\operatorname{rank}(\\mathcal{C}) = n$ iff the system $(A,B)$ is controllable and pole placement is possible.' },
    ],
    rulesOfThumb: [
      'Stability requires ALL eigenvalue real parts negative — one positive eigenvalue destabilizes the entire system regardless of the others.',
      'For $2\\times 2$ matrices: trace $< 0$ and $\\det > 0$ are necessary and sufficient for Hurwitz stability — a quick hand-check.',
      'Converting an $n$-th order ODE to first-order always produces an $n\\times n$ companion matrix with the same characteristic polynomial.',
      'Complex eigenvalues of a real $A$ always come in conjugate pairs $\\sigma\\pm i\\omega$ — oscillation always pairs up, never appears alone.',
      'The matrix exponential $e^{At}$ at $t=0$ is always $I$ — use this as a sanity check for any explicit formula.',
    ],
  },

  spiral: {
    recoveryPoints: ['la5-001', 'la7-006'],
    futureLinks: ['la8-004', 'la9-002'],
  },

  debugging: [
    { commonError: 'Using $e^A$ (matrix exponential at a fixed time) instead of $e^{At}$ (as a function of $t$).', symptom: 'The "solution" is a fixed matrix, not a trajectory. Plugging in $t = 0$ does not give $\\mathbf{x}_0$.', whyItHappened: 'The matrix exponential requires the scalar $t$ to be included in the exponent: $e^{At}$ depends on $t$, not just $A$.', repairStrategy: 'Always write $e^{At}$ and verify: (1) at $t=0$, $e^{A \\cdot 0} = I$; (2) differentiate to confirm $\\frac{d}{dt}e^{At} = Ae^{At}$.' },
    { commonError: 'Confusing the state-space conversion: putting $-b, -a$ in the wrong entries.', symptom: '$\\ddot{x} + a\\dot{x} + bx = 0$ is converted to the wrong companion matrix, giving incorrect eigenvalues.', whyItHappened: 'The companion matrix for $\\ddot{x} + a\\dot{x} + bx = 0$ with state $(x, \\dot{x})$ is $\\begin{bmatrix}0&1\\\\-b&-a\\end{bmatrix}$, not $\\begin{bmatrix}0&1\\\\b&a\\end{bmatrix}$. Sign errors are common.', repairStrategy: 'Rearrange the ODE as $\\ddot{x} = -bx - a\\dot{x}$ to read off the second row directly: the second row of $A$ is $(-b, -a)$.' },
  ],
};
