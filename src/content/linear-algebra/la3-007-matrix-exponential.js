export default {
  id: "la3-007",
  slug: "matrix-exponential",
  chapter: "la3",
  order: 7,
  title: "The Matrix Exponential and Systems of ODEs",
  subtitle:
    "Define $e^A$ as a matrix power series. It solves every constant-coefficient linear differential equation $\\dot{\\mathbf{x}} = A\\mathbf{x}$ â€” giving the complete trajectory of the system in one formula.",
  tags: [
    "matrix exponential",
    "e^A",
    "ODE",
    "differential equations",
    "eigendecomposition",
    "PadÃ© approximation",
    "scaling and squaring",
    "stability",
  ],
  aliases:
    "matrix exponential e^A differential equations ODE linear systems stability eigendecomposition Pade expm",

  hook: {
    question:
      "The scalar equation $\\dot{x} = ax$ has solution $x(t) = e^{at} x(0)$. What is the solution to the system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ where $A$ is a matrix?",
    realWorldContext:
      "Every constant-coefficient linear ODE system â€” mechanical vibrations, electrical circuits, population dynamics, heat flow â€” has the solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}(0)$, where $e^{At}$ is the matrix exponential. In quantum mechanics, the time-evolution operator $e^{-iHt/\\hbar}$ (where $H$ is the Hamiltonian matrix) governs all dynamics. In robotics, matrix exponentials compute the position of a robot arm as it sweeps through a rotation. In control theory, $e^{At}$ is the state transition matrix. Understanding this formula unifies ODEs and linear algebra into a single framework.",
  },

  intuition: {
    prose: [
      "**You already know the scalar case.** If $\\dot{x} = ax$, the unique solution satisfying $x(0) = x_0$ is $x(t) = e^{at}x_0$. When $a < 0$ the solution decays; when $a > 0$ it blows up. Now suppose you have a system: $\\dot{x}_1 = -2x_1$, $\\dot{x}_2 = -3x_2$. In matrix form, $\\dot{\\mathbf{x}} = A\\mathbf{x}$ with $A = \\begin{bmatrix}-2&0\\\\0&-3\\end{bmatrix}$. By analogy, the solution should be $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$ â€” and it is. The object $e^{At}$ is the **matrix exponential**, defined by the same power series as its scalar cousin: $e^{At} = I + At + \\frac{(At)^2}{2!} + \\frac{(At)^3}{3!} + \\cdots$",
      "**Verify it works on the diagonal case.** For $A = \\begin{bmatrix}-2&0\\\\0&-3\\end{bmatrix}$, each power $A^k = \\begin{bmatrix}(-2)^k&0\\\\0&(-3)^k\\end{bmatrix}$, so the power series sums to $e^{At} = \\begin{bmatrix}e^{-2t}&0\\\\0&e^{-3t}\\end{bmatrix}$. With $\\mathbf{x}_0 = [1,1]^\\top$, the solution at $t=1$ is $\\mathbf{x}(1) = [e^{-2}, e^{-3}]^\\top \\approx [0.135, 0.050]^\\top$. Both components decay because both eigenvalues are negative. Change $-2$ to $+2$ and $x_1$ explodes â€” the sign of the eigenvalue controls stability directly.",
      "**Why it solves the ODE.** Differentiate $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$ term by term: $\\frac{d}{dt}(I + At + \\frac{A^2t^2}{2} + \\cdots) = A + A^2 t + \\cdots = A(I + At + \\cdots) = Ae^{At}$. So $\\dot{\\mathbf{x}} = Ae^{At}\\mathbf{x}_0 = A\\mathbf{x}(t)$ âœ“. And $\\mathbf{x}(0) = e^0 \\mathbf{x}_0 = I\\mathbf{x}_0 = \\mathbf{x}_0$ âœ“. No numerical integration needed â€” the entire solution from $t = 0$ to $\\infty$ is captured in one matrix formula.",
      "**Computing $e^{At}$ for non-diagonal matrices via diagonalization.** If $A = PDP^{-1}$ where $D = \\text{diag}(\\lambda_1, \\ldots, \\lambda_n)$, then $(A)^k = PD^kP^{-1}$, so the power series sums to $e^{At} = Pe^{Dt}P^{-1}$ where $e^{Dt} = \\text{diag}(e^{\\lambda_1 t}, \\ldots, e^{\\lambda_n t})$. This reduces the computation to: (1) find eigenvalues and eigenvectors, (2) form $P$ and $D$, (3) exponentiate the diagonal, (4) transform back. For non-diagonalizable matrices, use the Jordan form from the previous lesson.",
      "**Predict before reading on.** For $A = \\begin{bmatrix}0&-\\omega\\\\\\omega&0\\end{bmatrix}$ with eigenvalues $\\pm i\\omega$, the exponential $e^{At}$ must involve $e^{\\pm i\\omega t}$. Use Euler's formula $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$ to predict the form of $e^{At}$. Should solutions grow, decay, or oscillate? Write your prediction before continuing.",
      "**The eigenvalue tells you everything about long-time behavior.** Real $\\lambda < 0$: exponential decay. Real $\\lambda > 0$: exponential growth. Purely imaginary $\\pm i\\omega$: perpetual oscillation at frequency $\\omega/(2\\pi)$. Complex $a \\pm bi$ with $a < 0$: decaying spiral (stable oscillation). Complex $a \\pm bi$ with $a > 0$: growing spiral (unstable). The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is globally stable if and only if ALL eigenvalues of $A$ have negative real part.",
      "**CNC servo drives â€” why eigenvalues matter in manufacturing.** A CNC axis servo is modeled by $\\dot{\\mathbf{x}} = A\\mathbf{x} + B u$ where $\\mathbf{x} = [\\text{position}, \\text{velocity}]^\\top$. With no input ($u = 0$), the axis coasts according to $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$. Complex eigenvalues $a \\pm bi$ mean the axis rings (oscillates) at frequency $b/(2\\pi)$ Hz as it settles. In machining, this ringing is the source of chatter marks on the workpiece surface â€” a distinctive corrugated pattern. Servo tuning shifts eigenvalues deep into the left half-plane to kill the ringing. Machine tool designers use the eigenvalues of the servo loop matrix as a direct design criterion.",
      "**Where this is heading.** The matrix exponential closes the loop on eigenvalues: we found eigenvalues (la3-001), diagonalized with them (la3-002), handled complex cases (la3-003), and now use them to propagate dynamical systems through time. Chapter 4 shifts focus from dynamics to geometry â€” orthogonal projections, least squares, and the SVD. The eigenvalues of $A^\\top A$ are the squared singular values of $A$, connecting the eigenvalue theory of this chapter to the geometric theory of the next.",
    ],
    callouts: [
      {
        type: "insight",
        title: "Eigenvalue â†’ Solution Behavior",
        body: "| Eigenvalue type | Solution behavior |\n|---|---|\n| Real $\\lambda < 0$ | Exponential decay: $e^{\\lambda t} \\to 0$ |\n| Real $\\lambda > 0$ | Exponential growth: $e^{\\lambda t} \\to \\infty$ |\n| Pure imaginary $\\pm i\\omega$ | Oscillation: $\\cos(\\omega t) \\pm i\\sin(\\omega t)$ |\n| Complex $a \\pm bi$, $a < 0$ | Decaying oscillation |\n| Repeated eigenvalue (Jordan) | $t^k e^{\\lambda t}$ terms |",
      },
      {
        type: "theorem",
        title: "Properties of the Matrix Exponential",
        body: "â€¢ $e^{A \\cdot 0} = I$\nâ€¢ $\\frac{d}{dt} e^{At} = A e^{At} = e^{At} A$\nâ€¢ $\\det(e^A) = e^{\\text{tr}(A)}$\nâ€¢ If $AB = BA$: $e^{A+B} = e^A e^B$ (commutativity required!)\nâ€¢ $(e^A)^{-1} = e^{-A}$",
      },
      {
        type: "sequencing",
        title: "Lesson 7 of 7 â€” Eigenvalues & Eigenvectors",
        body: "**Previous (Lesson 6):** Cayley-Hamilton Theorem â€” matrices satisfy their own characteristic polynomial.\n**This lesson:** Matrix Exponential â€” $e^{At}$ solves $\\dot{\\mathbf{x}} = A\\mathbf{x}$; connection to eigenvalues via diagonalization.\n**Next (Chapter 4):** Orthogonal Projections â€” projecting vectors onto subspaces; the foundation of least squares.",
      },
      {
        type: "warning",
        title: "Commutativity Is Required for $e^{A+B} = e^A e^B$",
        body: "In general, $e^{A+B} \\neq e^A e^B$ unless $AB = BA$. This fails for most pairs of matrices. The Baker-Campbell-Hausdorff formula gives the correction terms involving commutators $[A,B] = AB - BA$.",
      },
    ],
    visualizations: [
      {
        id: "OpenMatNotebook",
        title: "Matrix Exponential and ODE Solutions",
        mathBridge:
          "Compute e^(At) for a 2x2 system and visualize the phase portrait.",
        caption:
          "The eigenvalues of A determine stability; e^(At) gives the complete solution.",
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle:
                "Stable system: all eigenvalues have negative real part",
              prose: [
                "A = [-1 2; -2 -1]: complex eigenvalues -1 +/- 2i => decaying spiral.",
              ],
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
              cellTitle: "Computing e^(At) via diagonalization",
              prose: [
                "If A = PDP^{-1}, then e^(At) = P * diag(e^{d1*t}, e^{d2*t}) * P^{-1}.",
              ],
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
              cellTitle: "ODE trajectory: x(t) = e^(At) * x0",
              prose: [
                "Solve dx/dt = Ax, x(0) = [2; 0] and sample the trajectory at t = 0, 0.5, 1, 2.",
              ],
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
      "**Convergence of the power series.** For any matrix norm $\\|\\cdot\\|$, we have $\\|e^A\\| \\leq e^{\\|A\\|}$ and the series $\\sum_{k=0}^\\infty \\frac{A^k}{k!}$ converges absolutely because $\\sum_{k=0}^\\infty \\frac{\\|A\\|^k}{k!} = e^{\\|A\\|} < \\infty$. The convergence is uniform on bounded sets in $t$.",
      "**Jordan case.** For a Jordan block $J = \\lambda I + N$ where $N$ is nilpotent ($N^k = 0$ for some finite $k$), $e^J = e^{\\lambda I} e^N = e^\\lambda e^N$. Since $N^k = 0$, $e^N = I + N + N^2/2! + \\cdots + N^{k-1}/(k-1)!$ (finite sum). For a Jordan block $J_k(\\lambda)$: the $(i,j)$ entry of $e^{J_k(\\lambda)t}$ is $\\frac{t^{j-i}}{(j-i)!} e^{\\lambda t}$ for $j \\geq i$, and 0 otherwise. This shows Jordan blocks produce $t^m e^{\\lambda t}$ solutions.",
      "**Stability criterion.** The system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is asymptotically stable (all solutions $\\to 0$) iff all eigenvalues of $A$ satisfy Re$(\\lambda) < 0$. For discrete-time systems $\\mathbf{x}_{k+1} = A\\mathbf{x}_k$, stability requires $|\\lambda| < 1$ for all eigenvalues.",
    ],
    callouts: [
      {
        type: "insight",
        title: "ODE Solution Structure from Eigenvalues",
        body: "For $A = PDP^{-1}$ with eigenvalues $\\lambda_1, \\ldots, \\lambda_n$, the general solution is:\n\n$\\mathbf{x}(t) = c_1 e^{\\lambda_1 t}\\mathbf{v}_1 + \\cdots + c_n e^{\\lambda_n t}\\mathbf{v}_n$\n\nwhere $\\mathbf{v}_i$ are eigenvectors and $c_i$ are determined by initial conditions. For Jordan blocks, replace $e^{\\lambda t}$ with $t^k e^{\\lambda t}$ terms.",
      },
      {
        type: "theorem",
        title: "Liouville's Formula",
        body: "$\\det(e^{At}) = e^{\\text{tr}(A) \\cdot t}$\n\nProof sketch: for diagonal $A$, $\\det(e^{At}) = \\prod e^{\\lambda_i t} = e^{\\sum \\lambda_i t} = e^{\\text{tr}(A)t}$. By continuity and similarity invariance, it extends to all matrices.",
      },
      {
        type: "insight",
        title: "PadÃ© Approximation in Practice",
        body: "MATLAB's `expm` and SciPy's `expm` use the PadÃ© approximant + scaling and squaring, not the power series. The power series is unstable for large $\\|A\\|$. The scaling trick: $e^A = (e^{A/2^s})^{2^s}$. Scale down until $A/2^s$ is small, apply PadÃ©, then square $s$ times.",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title:
          "Code: Matrix Exponential, ODE Trajectories, and CNC Servo Stability",
        mathBridge:
          "scipy.linalg.expm(A) computes e^A. For e^(At): expm(A*t). ODE trajectory: x(t) = expm(A*t) @ x0. Eigenvalues via np.linalg.eig(A) â€” all Re(Î») < 0 means stable.",
        caption:
          "Three cells: compute e^A, trace ODE trajectories, and analyze CNC servo drive stability.",
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Computing e^A â€” power series vs scipy",
              prose:
                "scipy.linalg.expm(A) uses PadÃ© approximation + scaling-and-squaring â€” more accurate than summing the power series directly. Verify: det(e^A) = e^trace(A). Also: e^A @ e^(-A) = I.",
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.linalg import expm

A = np.array([[-1., 0.], [0., -2.]])  # diagonal: easy exponential
eA = expm(A)
eA_exact = np.diag([np.exp(-1), np.exp(-2)])

print("expm(A) ="); print(eA.round(6))
print("exact (diagonal):", eA_exact.round(6))
print("Match:", np.allclose(eA, eA_exact))
print("det(expm(A)) = exp(trace(A)):", np.linalg.det(eA), "vs", np.exp(np.trace(A)))

# Show e^(tA) for varying t
ts = np.linspace(0, 3, 50)
norms = [np.linalg.norm(expm(t*A)) for t in ts]

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(ts, norms, color='steelblue', lw=2)
axes[0].set_xlabel("t"); axes[0].set_ylabel("||e^(tA)||")
axes[0].set_title("Matrix norm of e^(tA) decays (eigenvalues < 0)", fontsize=11)
axes[0].grid(True, alpha=0.3)

axes[1].imshow(eA, cmap='RdBu_r', aspect='equal', vmin=0, vmax=1)
axes[1].set_title("expm(A) for A=diag(-1,-2)", fontsize=11)
for i in range(2):
    for j in range(2):
        axes[1].text(j, i, f'{eA[i,j]:.4f}', ha='center', va='center', fontsize=12)
axes[1].set_xticks([]); axes[1].set_yticks([])
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: "ODE trajectory: x(t) = e^(At) xâ‚€",
              prose:
                "The exact solution to dx/dt = Ax with x(0) = xâ‚€ is x(t) = e^(At) xâ‚€. Compare with numerical ODE solver (scipy.integrate.odeint) to verify.",
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.linalg import expm

# ODE: dx/dt = Ax, x(0) = x0; solution: x(t) = expm(tA) @ x0
# Example: rotation A = [[0,-1],[1,0]] gives circular motion
A = np.array([[0., -1.], [1., 0.]])
x0 = np.array([1., 0.])

ts = np.linspace(0, 2*np.pi, 100)
traj = np.array([expm(t*A) @ x0 for t in ts])

print("A = rotation generator [[0,-1],[1,0]]")
print("x(t) = expm(tA) @ x0 traces a circle")
print("x(pi/2) =", (expm(np.pi/2 * A) @ x0).round(4))
print("x(pi)   =", (expm(np.pi   * A) @ x0).round(4))

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(traj[:,0], traj[:,1], color='steelblue', lw=2)
axes[0].scatter(*x0, color='green', s=80, zorder=5, label='x0=(1,0)')
axes[0].set_title("e^(tA) @ x0: circular ODE solution", fontsize=11)
axes[0].set_aspect('equal'); axes[0].grid(True, alpha=0.3); axes[0].legend()
axes[0].axhline(0, color='k', lw=0.5); axes[0].axvline(0, color='k', lw=0.5)
axes[1].plot(ts, traj[:,0], color='steelblue', lw=2, label='x1(t) = cos(t)')
axes[1].plot(ts, traj[:,1], color='darkorange', lw=2, label='x2(t) = sin(t)')
axes[1].set_xlabel("t"); axes[1].set_ylabel("x(t)")
axes[1].set_title("Components of the solution", fontsize=11)
axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: "CNC servo drive stability analysis",
              prose:
                "A CNC axis servo: state = [position, velocity], A encodes the physics. Eigenvalues with negative real part â†’ stable (position tracks command). Positive real part â†’ runaway axis. Servo tuning adjusts damping coefficient to find the stability boundary.",
              code: `import numpy as np
from scipy.linalg import expm

# CNC servo: 2nd-order model x'' + 2*zeta*omega*x' + omega^2*x = omega^2*r
# State: [e, e_dot] where e = position error
omega = 100.0  # natural frequency (rad/s)

print("Stability vs damping ratio Î¶:")
print(f"{'Î¶':>6}  {'Re(Î»)':>10}  {'Im(Î»)':>10}  {'Stable':>8}  {'Settling ~2/|Re|':>18}")
for zeta in [0.0, 0.3, 0.5, 0.7, 1.0, 1.5, 2.0]:
    A = np.array([[0., 1.],
                  [-omega**2, -2*zeta*omega]])
    evals = np.linalg.eigvals(A)
    re, im = evals[0].real, evals[0].imag
    stable = all(np.real(evals) < 0)
    settling = 2.0/abs(re) if abs(re) > 1e-6 else float('inf')
    print(f"{zeta:>6.1f}  {re:>10.2f}  {im:>10.2f}  {str(stable):>8}  {settling:>18.4f}s")

print("\\nÎ¶=0: marginally stable (pure oscillation)")
print("Î¶>0: stable (decays to equilibrium)")
print("Settling time â‰ˆ 2/|Re(Î»)| seconds")`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Spectral mapping theorem.** If $A = PDP^{-1}$ (diagonalizable), then $e^A = Pe^D P^{-1}$, and the eigenvalues of $e^A$ are exactly $\\{e^\\lambda : \\lambda \\in \\text{spec}(A)\\}$. More generally, for any analytic function $f$, $f(A)$ has eigenvalues $\\{f(\\lambda) : \\lambda \\in \\text{spec}(A)\\}$. This is the spectral mapping theorem.",
      "**Matrix logarithm.** The inverse of the matrix exponential (when it exists) is the matrix logarithm. $\\log(e^A) = A$ for matrices near 0. The logarithm exists for all invertible matrices near $I$, but may not be unique (the complex logarithm is multi-valued). Applications: computing rotations in robotics (Lie algebras), interpolating between rotations in animation and computer vision.",
      "**Fundamental matrix solutions.** For a system $\\dot{\\mathbf{x}} = A\\mathbf{x}$, the **fundamental matrix** $\\Phi(t) = e^{At}$ satisfies $\\dot{\\Phi} = A\\Phi$ and $\\Phi(0) = I$. The general solution is $\\mathbf{x}(t) = \\Phi(t)\\mathbf{x}_0$. For non-autonomous systems $\\dot{\\mathbf{x}} = A(t)\\mathbf{x}$, a fundamental matrix still exists but is not simply $e^{\\int A\\,dt}$ unless $A(t)$ commutes with itself at different times.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Spectral Mapping Theorem",
        body: "For any analytic function $f$ and matrix $A$:\n- If $A = PDP^{-1}$ (diagonalizable), then $f(A) = Pf(D)P^{-1}$\n- The eigenvalues of $f(A)$ are $\\{f(\\lambda) : \\lambda \\in \\sigma(A)\\}$\n\nSpecial cases:\n- Eigenvalues of $e^A$: $\\{e^\\lambda\\}$\n- Eigenvalues of $A^{-1}$: $\\{1/\\lambda\\}$ (for invertible $A$)\n- Eigenvalues of $e^{At}$: $\\{e^{\\lambda t}\\}$",
      },
      {
        type: "insight",
        title: "Lie Groups and Lie Algebras",
        body: "The matrix exponential maps the **Lie algebra** (a vector space of matrices, closed under commutator $[A,B] = AB-BA$) to the **Lie group** (a manifold of invertible matrices):\n\n$\\mathfrak{so}(3) \\xrightarrow{\\exp} SO(3)$ (skew-symmetric â†’ rotation matrices)\n\n$\\mathfrak{se}(3) \\xrightarrow{\\exp} SE(3)$ (rigid body motions â†’ transformation matrices)\n\nThis is the mathematical foundation of modern robotics and computer graphics.",
      },
      {
        type: "insight",
        title: "Numerical Computation of e^A",
        body: "The power series $\\sum A^k/k!$ is accurate only for small $\\|A\\|$. MATLAB's `expm` and SciPy's `scipy.linalg.expm` use the **PadÃ© approximant** + **scaling and squaring**:\n\n1. Scale: compute $B = A/2^s$ so $\\|B\\| \\approx 1$\n2. Compute $e^B \\approx$ PadÃ© approximant (rational function approximation)\n3. Square: $e^A = (e^B)^{2^s}$\n\nThis is $O(n^3)$ and numerically stable. Never use the raw power series.",
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: "ex-la3-007-1",
      title: "Matrix exponential of a diagonal matrix",
      problem:
        "Compute $e^{At}$ for $A = \\begin{bmatrix}-2&0\\\\0&-3\\end{bmatrix}$ and classify the stability.",
      steps: [
        {
          expression:
            "e^{Dt} = \\begin{bmatrix}e^{-2t} & 0 \\\\ 0 & e^{-3t}\\end{bmatrix}",
          annotation:
            "For a diagonal matrix, exponentiate each entry independently: $(e^{Dt})_{ii} = e^{d_{ii} t}$.",
          strategyTitle: "Exponentiate diagonal entries",
          checkpoint: "Why is e^(Dt) so simple for diagonal D?",
          hints: [
            "Powers: D^k = diag(Î»â‚^k, Î»â‚‚^k). The power series becomes diag(Î£Î»â‚^k/k!, Î£Î»â‚‚^k/k!) = diag(e^(Î»â‚t), e^(Î»â‚‚t)).",
          ],
        },
        {
          expression:
            "\\text{Eigenvalues: } \\lambda_1 = -2, \\lambda_2 = -3 \\quad \\Rightarrow \\quad \\text{Re}(\\lambda_i) < 0",
          annotation: "Both eigenvalues are real and negative.",
          strategyTitle: "Check stability",
          checkpoint: "",
          hints: [],
        },
        {
          expression:
            "e^{At}\\mathbf{x}_0 = \\begin{bmatrix}e^{-2t} & 0 \\\\ 0 & e^{-3t}\\end{bmatrix}\\begin{bmatrix}x_1(0) \\\\ x_2(0)\\end{bmatrix} = \\begin{bmatrix}x_1(0)e^{-2t} \\\\ x_2(0)e^{-3t}\\end{bmatrix} \\to \\begin{bmatrix}0\\\\0\\end{bmatrix} \\text{ as } t\\to\\infty",
          annotation:
            "Both components decay exponentially. The second decays faster ($e^{-3t}$ vs $e^{-2t}$).",
          strategyTitle: "Write solution",
          checkpoint: "",
          hints: [],
        },
      ],
      conclusion:
        "$e^{At} = \\text{diag}(e^{-2t}, e^{-3t})$. The system is asymptotically stable â€” every initial condition decays to zero exponentially.",
    },
    {
      id: "ex-la3-007-2",
      title: "ODE system solution via eigendecomposition",
      problem:
        "Solve $\\dot{\\mathbf{x}} = A\\mathbf{x}$ with $A = \\begin{bmatrix}-1&2\\\\0&-3\\end{bmatrix}$ and $\\mathbf{x}(0) = [1,\\,1]^\\top$.",
      steps: [
        {
          expression:
            "\\lambda_1 = -1 \\text{ (eigenvec: } \\mathbf{v}_1 = [1,0]^\\top), \\quad \\lambda_2 = -3 \\text{ (eigenvec: } \\mathbf{v}_2 = [1,-1]^\\top)",
          annotation:
            "Eigenvalues of upper-triangular = diagonal entries. Eigenvectors from $(A-\\lambda I)\\mathbf{v}=0$.",
          strategyTitle: "Find eigenvalues and eigenvectors",
          checkpoint: "",
          hints: [],
        },
        {
          expression:
            "\\mathbf{x}(t) = c_1 e^{-t}\\begin{bmatrix}1\\\\0\\end{bmatrix} + c_2 e^{-3t}\\begin{bmatrix}1\\\\-1\\end{bmatrix}",
          annotation: "General solution: linear combination of modes.",
          strategyTitle: "Write general solution",
          checkpoint: "",
          hints: [],
        },
        {
          expression:
            "\\mathbf{x}(0) = c_1\\begin{bmatrix}1\\\\0\\end{bmatrix} + c_2\\begin{bmatrix}1\\\\-1\\end{bmatrix} = \\begin{bmatrix}1\\\\1\\end{bmatrix} \\quad \\Rightarrow \\quad c_1 + c_2 = 1, \\; -c_2 = 1 \\quad \\Rightarrow \\quad c_2 = -1, \\; c_1 = 2",
          annotation: "Match initial condition to find constants.",
          strategyTitle: "Apply initial conditions",
          checkpoint: "",
          hints: [],
        },
        {
          expression:
            "\\mathbf{x}(t) = 2e^{-t}\\begin{bmatrix}1\\\\0\\end{bmatrix} - e^{-3t}\\begin{bmatrix}1\\\\-1\\end{bmatrix} = \\begin{bmatrix}2e^{-t} - e^{-3t}\\\\e^{-3t}\\end{bmatrix}",
          annotation:
            "Explicit solution. Both components decay. As $t\\to\\infty$: $x_1 \\to 0$, $x_2 \\to 0$.",
          strategyTitle: "Final answer",
          checkpoint: "Verify x(0).",
          hints: ["xâ‚(0) = 2-1 = 1 âœ“. xâ‚‚(0) = 1 âœ“."],
        },
      ],
      conclusion:
        "$\\mathbf{x}(t) = [2e^{-t} - e^{-3t},\\, e^{-3t}]^\\top$. The system is stable (both eigenvalues $< 0$). The $e^{-t}$ mode dominates at large $t$ since it decays more slowly.",
    },
    {
      id: "ex-la3-007-3",
      title: "Matrix exponential of a Jordan block",
      problem:
        "Compute $e^{At}$ for the Jordan block $A = \\begin{bmatrix}2&1\\\\0&2\\end{bmatrix}$ and write the ODE solution from $\\mathbf{x}_0 = [1,0]^\\top$.",
      steps: [
        {
          expression:
            "A = 2I + N, \\quad N = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}, \\quad N^2 = 0",
          annotation:
            "Decompose: scalar part $\\lambda I = 2I$ plus nilpotent $N$. Since $N^2 = 0$, the exponential series for $N$ truncates.",
          strategyTitle: "Decompose into scalar + nilpotent",
          checkpoint: "What property of N makes the series finite?",
          hints: [
            "N^2 = 0 means e^(Nt) = I + Nt (series terminates after k=1).",
          ],
        },
        {
          expression:
            "e^{At} = e^{(2I+N)t} = e^{2It} \\cdot e^{Nt} = e^{2t}I \\cdot (I + Nt) = e^{2t}\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}",
          annotation:
            "Since $2I$ and $N$ commute ($2I$ commutes with everything), $e^{(2I+N)t} = e^{2It}e^{Nt}$. Then $e^{Nt} = I + Nt + N^2t^2/2 + \\cdots = I + Nt$.",
          strategyTitle: "Apply commutativity and truncation",
          checkpoint: "",
          hints: [],
        },
        {
          expression:
            "\\mathbf{x}(t) = e^{At}\\mathbf{x}_0 = e^{2t}\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}\\begin{bmatrix}1\\\\0\\end{bmatrix} = e^{2t}\\begin{bmatrix}1\\\\0\\end{bmatrix}",
          annotation:
            "For $\\mathbf{x}_0 = [1,0]^\\top$, the solution is $e^{2t}[1,0]^\\top$. The $t \\cdot e^{2t}$ term does not appear for this initial condition.",
          strategyTitle: "Apply to initial condition",
          checkpoint:
            "What initial condition would make the tÂ·e^(2t) term appear?",
          hints: [
            "Try xâ‚€ = [0,1]áµ€: then x(t) = e^(2t)[t, 1]áµ€ â€” the t factor appears in xâ‚.",
          ],
        },
      ],
      conclusion:
        "$e^{At} = e^{2t}\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}$. Jordan blocks produce $t^k e^{\\lambda t}$ terms in solutions â€” the off-diagonal $t$ factor is the hallmark of defective (non-diagonalizable) matrices. The system is unstable since $\\lambda = 2 > 0$.",
    },
  ],

  challenges: [
    {
      id: "ch-la3-007-1",
      difficulty: "easy",
      problem:
        "For $A = \\begin{bmatrix}0&-\\omega\\\\\\omega&0\\end{bmatrix}$ (pure rotation at rate $\\omega$), compute $e^{At}$ and describe the motion.",
      hint: "Eigenvalues are $\\pm i\\omega$. The system neither grows nor decays. Look for sine/cosine in $e^{At}$.",
      walkthrough: [
        {
          expression:
            "\\det(A - \\lambda I) = \\lambda^2 + \\omega^2 = 0 \\quad \\Rightarrow \\quad \\lambda = \\pm i\\omega",
          annotation: "Pure imaginary eigenvalues â€” neutral stability.",
        },
        {
          expression:
            "e^{At} = \\begin{bmatrix}\\cos(\\omega t) & -\\sin(\\omega t)\\\\ \\sin(\\omega t) & \\cos(\\omega t)\\end{bmatrix}",
          annotation:
            "The matrix exponential of a skew-symmetric rotation matrix is a rotation matrix! Euler's formula: $e^{\\pm i\\omega t} = \\cos(\\omega t) \\pm i\\sin(\\omega t)$.",
        },
        {
          expression:
            "\\mathbf{x}(t) = \\begin{bmatrix}\\cos(\\omega t) & -\\sin(\\omega t)\\\\ \\sin(\\omega t) & \\cos(\\omega t)\\end{bmatrix}\\mathbf{x}_0",
          annotation:
            "Every solution traces a circle at angular speed $\\omega$. The system is neutrally stable: trajectories never decay.",
        },
      ],
      answer:
        "e^(At) = rotation matrix by angle Ï‰t. All solutions are circles in phase space â€” neutrally stable (oscillates forever).",
    },
    {
      id: "ch-la3-007-2",
      difficulty: "medium",
      problem:
        "Classify stability of the damped harmonic oscillator: $A = \\begin{bmatrix}0&1\\\\-\\omega^2&-2\\zeta\\omega\\end{bmatrix}$ for $\\zeta > 0, \\omega > 0$.",
      hint: "Compute the characteristic polynomial. Use the quadratic formula. What is the real part of the eigenvalues?",
      walkthrough: [
        {
          expression:
            "p(\\lambda) = \\lambda^2 + 2\\zeta\\omega\\lambda + \\omega^2 \\quad \\Rightarrow \\quad \\lambda = -\\zeta\\omega \\pm \\omega\\sqrt{\\zeta^2 - 1}",
          annotation:
            "Quadratic formula with trace $= -2\\zeta\\omega$, det $= \\omega^2$.",
        },
        {
          expression:
            "\\text{Re}(\\lambda) = -\\zeta\\omega < 0 \\text{ for all } \\zeta > 0",
          annotation:
            "If $\\zeta < 1$ (underdamped): complex eigenvalues $-\\zeta\\omega \\pm i\\omega\\sqrt{1-\\zeta^2}$ â€” decaying oscillation. If $\\zeta \\geq 1$: real negative eigenvalues â€” pure exponential decay.",
        },
      ],
      answer:
        "Asymptotically stable for all Î¶ > 0, Ï‰ > 0. Underdamped (Î¶<1): decaying oscillation. Critically/overdamped (Î¶â‰¥1): pure decay without oscillation.",
    },
  ],

  mentalModel: [
    "$\\dot{\\mathbf{x}} = A\\mathbf{x}$, $\\mathbf{x}(0) = \\mathbf{x}_0$ has exact solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$.",
    "Eigenvalues of $A$ govern stability: all Re$(\\lambda) < 0$ â†’ stable; any Re$(\\lambda) > 0$ â†’ unstable.",
    "Compute $e^{At}$ via diagonalization: $e^{At} = Pe^{Dt}P^{-1}$ where $e^{Dt}$ just exponentiates diagonal entries.",
    "$\\det(e^A) = e^{\\text{tr}(A)}$ â€” the determinant is never zero, so $e^{At}$ is always invertible.",
  ],

  checkpoints: [
    {
      id: "cp-la3-007-1",
      label: "Read: State the ODE that e^(At)xâ‚€ solves",
      type: "read",
    },
    {
      id: "cp-la3-007-2",
      label: "Read: Identify the stability criterion from eigenvalues",
      type: "read",
    },
    {
      id: "cp-la3-007-3",
      label: "Read: State det(e^A) and explain why",
      type: "read",
    },
    {
      id: "cp-la3-007-4",
      label: "Lab: Compute e^A and verify det(e^A) = e^tr(A)",
      type: "lab",
    },
    {
      id: "cp-la3-007-5",
      label: "Lab: Trace ODE trajectory and compare with odeint",
      type: "lab",
    },
    {
      id: "cp-la3-007-6",
      label: "Example: Compute e^(At) for a diagonal matrix",
      type: "example",
    },
    {
      id: "cp-la3-007-7",
      label: "Example: Solve an ODE via eigendecomposition",
      type: "example",
    },
    {
      id: "cp-la3-007-8",
      label: "Challenge: Classify stability of a damped oscillator",
      type: "challenge",
    },
  ],

  assessment: {
    questions: [
      {
        id: "la3-007-assess-1",
        type: "input",
        text: 'For $A = \\begin{bmatrix}-2&0\\\\0&5\\end{bmatrix}$, is the system $\\dot{\\mathbf{x}} = A\\mathbf{x}$ stable? Answer "stable" or "unstable".',
        answer: "unstable",
        hint: "One eigenvalue is $\\lambda = 5 > 0$ â€” that component grows without bound. Any positive real eigenvalue makes the system unstable.",
      },
    ],
  },

  quiz: [
    {
      id: "q-la3-007-1",
      type: "choice",
      text: "The solution to $\\dot{\\mathbf{x}} = A\\mathbf{x}$, $\\mathbf{x}(0) = \\mathbf{x}_0$ is:",
      options: [
        "$A\\mathbf{x}_0$",
        "$e^{At}\\mathbf{x}_0$",
        "$A^t \\mathbf{x}_0$",
        "$\\text{tr}(A)\\,\\mathbf{x}_0$",
      ],
      answer: "$e^{At}\\mathbf{x}_0$",
      hints: [
        "This is the matrix analogue of x(t) = e^(at)xâ‚€ for the scalar equation áº‹ = ax. The matrix exponential e^(At) is the transition matrix.",
      ],
      reviewSection: "Intuition â€” It solves the matrix ODE",
    },
    {
      id: "q-la3-007-2",
      type: "choice",
      text: "For asymptotic stability of $\\dot{\\mathbf{x}} = A\\mathbf{x}$ (all solutions â†’ 0 as t â†’ âˆž), the eigenvalues of $A$ must all satisfy:",
      options: [
        "$\\text{Re}(\\lambda) > 0$",
        "$\\text{Im}(\\lambda) \\neq 0$",
        "$\\text{Re}(\\lambda) < 0$",
        "$|\\lambda| < 1$",
      ],
      answer: "$\\text{Re}(\\lambda) < 0$",
      hints: [
        "e^(Î»t) â†’ 0 iff Re(Î») < 0. For complex Î»=a+bi: |e^(Î»t)| = e^(at). Decays iff a < 0. Note: |Î»| < 1 is the discrete-time criterion, not continuous-time.",
      ],
      reviewSection: "Math tab â€” Stability criterion",
    },
    {
      id: "q-la3-007-3",
      type: "choice",
      text: "If $A = PDP^{-1}$ with $D = \\text{diag}(\\lambda_1, \\lambda_2)$, then $e^{At} =$",
      options: [
        "$Pe^{Dt}$",
        "$e^{Dt}P^{-1}$",
        "$Pe^{Dt}P^{-1}$",
        "$P^{-1}e^{Dt}P$",
      ],
      answer: "$Pe^{Dt}P^{-1}$",
      hints: [
        "Same pattern as A^k = PD^kP^{-1}. The series e^(At) = Î£ (At)^k/k! = P Î£ D^kt^k/k! P^{-1} = Pe^(Dt)P^{-1}.",
      ],
      reviewSection: "Intuition â€” Computing via diagonalization",
    },
    {
      id: "q-la3-007-4",
      type: "choice",
      text: "A system has matrix $A$ with eigenvalues $\\lambda = -1 \\pm 3i$. What is the long-term behavior of trajectories?",
      options: [
        "They blow up (unstable)",
        "They oscillate with constant amplitude",
        "They spiral inward toward the origin",
        "They converge to a non-zero steady state",
      ],
      answer: "They spiral inward toward the origin",
      hints: [
        "Re(Î») = -1 < 0 â†’ e^(Re(Î»)t) = e^(-t) â†’ 0. Im(Î») = Â±3 â†’ oscillation at frequency 3/(2Ï€). Combined: decaying oscillation = inward spiral.",
      ],
      reviewSection: "Intuition â€” Eigenvalue â†’ Solution Behavior",
    },
    {
      id: "q-la3-007-5",
      type: "choice",
      text: "For the Jordan block $A = \\begin{bmatrix}3&1\\\\0&3\\end{bmatrix}$, the matrix exponential $e^{At}$ contains which type of term?",
      options: [
        "$e^{3t}$ only",
        "$t\\,e^{3t}$ terms alongside $e^{3t}$",
        "$e^{3t}$ and $e^{t}$",
        "$t^2 e^{3t}$ terms",
      ],
      answer: "$t\\,e^{3t}$ terms alongside $e^{3t}$",
      hints: [
        "Jordan block of size 2: e^(Jt) = e^(Î»t)(I + Nt) where N is the superdiagonal of ones. This gives e^(3t) on diagonal and tÂ·e^(3t) in the upper-right entry.",
      ],
      reviewSection: "Math â€” Jordan case",
    },
    {
      id: "q-la3-007-6",
      type: "choice",
      text: "Which of the following is TRUE about $e^{A+B}$?",
      options: [
        "$e^{A+B} = e^A e^B$ always",
        "$e^{A+B} = e^B e^A$ always",
        "$e^{A+B} = e^A e^B$ only when $AB = BA$",
        "$e^{A+B} = (e^A + e^B)/2$",
      ],
      answer: "$e^{A+B} = e^A e^B$ only when $AB = BA$",
      hints: [
        "The scalar rule e^(a+b) = e^a e^b relied on commutativity of numbers. Matrices do not commute in general, so the rule fails unless AB = BA.",
      ],
      reviewSection: "Intuition â€” Warning: Commutativity",
    },
    {
      id: "q-la3-007-7",
      type: "choice",
      text: "$\\det(e^A)$ for any matrix $A$ is:",
      options: [
        "Always 1",
        "$e^{\\text{tr}(A)}$",
        "Always positive",
        "$e^{\\det(A)}$",
      ],
      answer: "$e^{\\text{tr}(A)}$",
      hints: [
        "For diagonal D, det(e^D) = product of e^(Î»áµ¢) = e^(Î£Î»áµ¢) = e^(tr(D)). Similarity invariance extends this to all matrices. Also: e^(tr(A)) is always positive, so e^A is always invertible.",
      ],
      reviewSection: "Intuition â€” Properties of the Matrix Exponential",
    },
    {
      id: "q-la3-007-8",
      type: "choice",
      text: "A discrete-time system $\\mathbf{x}_{k+1} = A\\mathbf{x}_k$ is stable when:",
      options: [
        "All eigenvalues have $\\text{Re}(\\lambda) < 0$",
        "All eigenvalues have $|\\lambda| < 1$",
        "The trace of $A$ is negative",
        "$\\det(A) > 0$",
      ],
      answer: "All eigenvalues have $|\\lambda| < 1$",
      hints: [
        "Discrete-time: x_k = A^k xâ‚€. This decays iff |Î»|^k â†’ 0 for all eigenvalues, i.e. |Î»| < 1. Continuous-time uses Re(Î») < 0 â€” different criterion.",
      ],
      reviewSection: "Math â€” Stability criterion (discrete vs continuous)",
    },
    {
      id: "q-la3-007-9",
      type: "choice",
      text: "In the CNC servo model, eigenvalues $a \\pm bi$ with $a < 0$ and $b \\neq 0$ produce:",
      options: [
        "Pure exponential decay (no oscillation)",
        "Pure oscillation at frequency $b/(2\\pi)$",
        "Decaying oscillation that rings then settles",
        "Unstable growth",
      ],
      answer: "Decaying oscillation that rings then settles",
      hints: [
        'Complex eigenvalues aÂ±bi give e^(at)(cos(bt) + iÂ·sin(bt)). Since a<0, the amplitude e^(at)â†’0 while the oscillation at frequency b/(2Ï€) persists temporarily â€” classically called "ringing."',
      ],
      reviewSection: "Intuition â€” CNC servo drives",
    },
    {
      id: "q-la3-007-10",
      type: "choice",
      text: "Why does MATLAB's `expm` use PadÃ© approximation + scaling-and-squaring instead of summing the power series directly?",
      options: [
        "The power series always diverges",
        "The power series converges but is numerically unstable for large $\\|A\\|$",
        "PadÃ© gives an exact answer while the series is only approximate",
        "The power series requires eigenvalues to be real",
      ],
      answer:
        "The power series converges but is numerically unstable for large $\\|A\\|$",
      hints: [
        "For large â€–Aâ€–, early terms of the series grow huge and then cancel â€” catastrophic cancellation causes large floating-point errors. Scaling A down to â€–Aâ€–â‰ˆ1, applying PadÃ©, then squaring up avoids this.",
      ],
      reviewSection: "Rigor â€” Numerical Computation of e^A",
    },
  ],

  misconceptions: [
    {
      falseBelief: "$e^{A+B} = e^A e^B$ for any two matrices $A$ and $B$.",
      whyStudentsThinkIt:
        "The scalar rule $e^{a+b} = e^a e^b$ is so familiar that students apply it without checking whether $A$ and $B$ commute.",
      correctionExample:
        "Let $A = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}$ and $B = \\begin{bmatrix}0&0\\\\1&0\\end{bmatrix}$. Then $AB \\neq BA$, so $e^{A+B} \\neq e^A e^B$. The Baker-Campbell-Hausdorff formula says $e^A e^B = e^{A+B+[A,B]/2+\\cdots}$ where $[A,B] = AB-BA$ is the commutator.",
      contrastCase:
        "Correct application: for $A = PDP^{-1}$, $e^{At} = Pe^{Dt}P^{-1}$ because $P$ and $e^{Dt}$ have a special relationship, not just arbitrary matrices.",
    },
    {
      falseBelief:
        "The stability of $\\dot{\\mathbf{x}} = A\\mathbf{x}$ requires $|\\lambda| < 1$ for all eigenvalues.",
      whyStudentsThinkIt:
        "Students mix up the discrete-time stability criterion ($|\\lambda| < 1$) with the continuous-time criterion (Re$\\lambda < 0$).",
      correctionExample:
        "For $A = \\begin{bmatrix}-1&0\\\\0&-2\\end{bmatrix}$: eigenvalues are $-1$ and $-2$. Both have Re$\\lambda < 0$ so the continuous-time system is stable, even though $|-1| = 1$ (exactly on the boundary for discrete-time).",
      contrastCase:
        "Discrete-time $\\mathbf{x}_{k+1} = A\\mathbf{x}_k$ is stable iff $|\\lambda| < 1$. Continuous-time $\\dot{\\mathbf{x}} = A\\mathbf{x}$ is stable iff Re$\\lambda < 0$. Different systems, different criteria.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "You need to simulate a CNC servo axis responding to a step command â€” modeling position and velocity over time.",
      competingTechniques: [
        "Numerical ODE solver (Euler, Runge-Kutta)",
        "Laplace transforms",
        "Matrix exponential solution",
      ],
      whyThisTechniqueWins:
        "The matrix exponential gives the exact closed-form solution $\\mathbf{x}(t) = e^{At}\\mathbf{x}_0$ at any time $t$, no discretization error. You can directly read off the settling time (â‰ˆ$2/|\\text{Re}(\\lambda)|$) and oscillation frequency ($\\text{Im}(\\lambda)/2\\pi$) from the eigenvalues without running the simulation.",
    },
    {
      situation:
        "In quantum mechanics, you need to compute the state of a two-level system at time $t$ given initial state $|\\psi_0\\rangle$ and Hamiltonian $H$.",
      competingTechniques: [
        "Numerical integration of SchrÃ¶dinger equation",
        "Perturbation theory",
        "Exact matrix exponential",
      ],
      whyThisTechniqueWins:
        "The time-evolution operator is exactly $U(t) = e^{-iHt/\\hbar}$ â€” a matrix exponential. For small matrices (qubits), this is exact and efficient. The eigenvalues of $H$ give the energy levels; their differences give the oscillation frequencies in the solution.",
    },
  ],

  debugging: [
    {
      commonError:
        "Computing $e^A$ entry-by-entry by exponentiating each matrix entry: $[e^A]_{ij} = e^{A_{ij}}$.",
      symptom:
        "Result fails verification: $e^A \\cdot e^{-A} \\neq I$, or $\\det(e^A) \\neq e^{\\text{tr}(A)}$.",
      whyItHappened:
        "The matrix exponential is NOT entry-wise exponentiation â€” it is defined by the power series $I + A + A^2/2! + \\cdots$. Entry-wise exponentiation ($\\exp(A)$ in numpy notation) is a different operation entirely.",
      repairStrategy:
        "Use `scipy.linalg.expm(A)` (not `np.exp(A)`). In MATLAB, use `expm(A)` (not `exp(A)`). Always verify with `expm(A) @ expm(-A) â‰ˆ I`.",
    },
    {
      commonError:
        "Concluding a system is stable because the determinant of $A$ is negative (or positive).",
      symptom:
        "A matrix with $\\det(A) > 0$ is claimed stable, but simulations diverge.",
      whyItHappened:
        "$\\det(A)$ is the product of all eigenvalues â€” it tells you nothing about their signs or real parts individually. You could have $\\det(A) = (-2)(3) = -6 < 0$ (one negative, one positive â€” unstable) or $(âˆ’1)(âˆ’2) = 2 > 0$ (both negative â€” stable).",
      repairStrategy:
        "Always check eigenvalues directly: `np.linalg.eigvals(A)`. For stability: verify all `np.real(evals) < 0`. Determinant and trace together give partial information but not the full picture.",
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently:
      "Compute $e^{At}$ for diagonal matrices and 2Ã—2 systems via eigendecomposition; write the ODE solution; classify stability from eigenvalues.",
    explainVerbally:
      "Explain why $e^{At}$ solves $\\dot{\\mathbf{x}} = A\\mathbf{x}$, what eigenvalues determine about long-term behavior, and why $e^{A+B} \\neq e^A e^B$ in general.",
    detectIncorrectApplication:
      "Catch entry-wise exponentiation vs. matrix exponentiation; catch confusing discrete (|Î»|<1) and continuous (Re Î»<0) stability criteria; catch incorrect commutator claims.",
    transferToUnfamiliar:
      "Analyze stability of a physical system from its state matrix; compute $e^{At}$ for a Jordan block system; apply the spectral mapping theorem to a new matrix function.",
  },
};
