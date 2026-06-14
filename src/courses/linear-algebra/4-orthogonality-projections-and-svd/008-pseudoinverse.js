export default {
  id: 'la4-008',
  slug: 'pseudoinverse',
  chapter: 'la4',
  order: 8,
  title: 'The Pseudoinverse (Moore-Penrose)',
  subtitle: 'When $A$ has no inverse, the pseudoinverse $A^+$ gives the best possible substitute: the minimum-norm, least-squares solution to any system $A\\mathbf{x}=\\mathbf{b}$. It is built directly from the SVD.',
  tags: ['pseudoinverse', 'Moore-Penrose', 'SVD', 'minimum-norm', 'least squares', 'generalized inverse', 'overdetermined', 'underdetermined'],
  aliases: 'pseudoinverse Moore-Penrose generalized inverse minimum-norm solution least squares SVD overdetermined underdetermined',

  hook: {
    question: "The inverse $A^{-1}$ requires $A$ to be square and invertible. What if your system has more equations than unknowns (overdetermined)? Or more unknowns than equations (underdetermined)? The pseudoinverse handles both — and reduces to the true inverse when it exists.",
    realWorldContext: "The pseudoinverse is one of the most useful computations in data science and engineering. In machine learning, the normal equations for linear regression are $A^+\\mathbf{b}$ — the minimum-norm least-squares solution. In robotics, the pseudoinverse of the Jacobian matrix maps desired end-effector velocities to joint velocities, even when the manipulator is kinematically redundant (more joints than needed). In image reconstruction (MRI, CT), the pseudoinverse reconstructs images from measurements, with regularization added to handle ill-conditioning.",
  },

  intuition: {
    prose: [
      'When a matrix is not invertible — because it is rectangular, or because it is square but rank-deficient — the equation $A\\mathbf{x} = \\mathbf{b}$ may have no solution, infinitely many solutions, or both problems at once. The **pseudoinverse** $A^+$ resolves all three cases with one formula. For any $\\mathbf{b}$, $\\hat{\\mathbf{x}} = A^+\\mathbf{b}$ gives the unique vector that minimizes $\\|A\\mathbf{x} - \\mathbf{b}\\|$ (least squares fit) and, among all such minimizers, has the smallest norm $\\|\\mathbf{x}\\|$. This is the best possible answer to any linear system.',
      '**A concrete example.** Take $A = \\begin{pmatrix}3&0\\\\0&2\\\\0&0\\end{pmatrix}$ (3×2, rank 2). The SVD is $A = U\\Sigma V^T$ with $\\Sigma = \\begin{pmatrix}3&0\\\\0&2\\\\0&0\\end{pmatrix}$ and $U,V$ as identity matrices in this case. To build $A^+$: flip $\\Sigma$ to get a 2×3 matrix, and replace each nonzero entry by its reciprocal: $\\Sigma^+ = \\begin{pmatrix}1/3&0&0\\\\0&1/2&0\\end{pmatrix}$. Then $A^+ = V\\Sigma^+U^T = \\begin{pmatrix}1/3&0&0\\\\0&1/2&0\\end{pmatrix}$. Check: $A^+A = I_2$ (left inverse — A has full column rank). But $AA^+ = \\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&0\\end{pmatrix}$ — not the identity, but the projection onto the column space of $A$.',
      '**The three cases the pseudoinverse handles.** (1) **Overdetermined ($m > n$, full column rank):** no exact solution, $A^+\\mathbf{b}$ is the unique least-squares minimizer. This is $\\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b}$ from the normal equations. (2) **Underdetermined ($m < n$, full row rank):** infinitely many exact solutions, $A^+\\mathbf{b}$ picks the minimum-norm one. This is $\\hat{\\mathbf{x}} = A^T(AA^T)^{-1}\\mathbf{b}$. (3) **Square invertible:** exactly one exact solution, and $A^+ = A^{-1}$ exactly — the pseudoinverse reduces to the regular inverse. In all three cases, the same SVD formula $A^+ = V\\Sigma^+U^T$ works.',
      '**Why minimum norm?** In the underdetermined case ($m < n$), there are infinitely many vectors $\\mathbf{x}$ with $A\\mathbf{x} = \\mathbf{b}$ exactly. They form the set $\\hat{\\mathbf{x}} + N(A)$ — the particular solution plus any null space vector. Among these, $A^+\\mathbf{b}$ is the unique solution in the **row space** $C(A^T)$ — perpendicular to the null space. This is the minimum-norm solution. Geometrically, you are projecting the origin onto the solution set and taking the closest point.',
      '**The four Moore-Penrose conditions.** $A^+$ is the unique matrix satisfying: (1) $AA^+A = A$, (2) $A^+AA^+ = A^+$, (3) $(AA^+)^T = AA^+$, (4) $(A^+A)^T = A^+A$. Conditions (3) and (4) are the orthogonality conditions: they require $AA^+$ and $A^+A$ to be symmetric, which forces them to be orthogonal projections. Any matrix that satisfies all four is the pseudoinverse — uniquely.',
      '**CNC robot kinematics — the Jacobian pseudoinverse.** A robotic CNC machine with $n$ joints and $m$ degrees of freedom at the end effector has a Jacobian $J(\\mathbf{q})$ relating joint velocities to end-effector velocities: $\\dot{\\mathbf{p}} = J\\dot{\\mathbf{q}}$. To move the end effector at velocity $\\dot{\\mathbf{p}}$, compute $\\dot{\\mathbf{q}} = J^+\\dot{\\mathbf{p}}$. If $n > m$ (more joints than DOF — kinematically redundant), there are infinitely many joint velocity solutions. The pseudoinverse gives the minimum-norm joint velocities — the smoothest motion. If the robot passes through a **singularity** (where $J$ drops rank), some singular values of $J$ go to zero, and $J^+$ would amplify small errors catastrophically. In practice, a regularized pseudoinverse $(J^TJ + \\lambda I)^{-1}J^T$ is used near singularities.',
      '**Where this is heading.** The pseudoinverse is the last major tool in this chapter — it unifies least squares, projection, and the four fundamental subspaces into one formula. The final lesson applies these ideas to data: low-rank approximation and dimensionality reduction using the SVD, where the pseudoinverse determines how to reconstruct compressed data.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Compute the Pseudoinverse and Solve $A\\mathbf{x}=\\mathbf{b}$',
        body: 'Step 1. **Compute the SVD.** Find $A = U\\Sigma V^\\top$ with singular values $\\sigma_1 \\geq \\cdots \\geq \\sigma_r > 0$.\n\nStep 2. **Build $\\Sigma^+$.** Transpose $\\Sigma$ (so $\\Sigma^+$ is $n \\times m$), then replace each nonzero $\\sigma_i$ with $1/\\sigma_i$ and leave zeros as zeros.\n\nStep 3. **Compute $A^+ = V\\Sigma^+ U^\\top$.**\n\nStep 4. **Solve: $\\hat{\\mathbf{x}} = A^+\\mathbf{b}$.** This is simultaneously: the least-squares minimizer of $\\|A\\mathbf{x}-\\mathbf{b}\\|$, and the minimum-norm solution among all such minimizers.\n\nStep 5. **Verify using Moore-Penrose conditions.** Check $AA^+A = A$, $A^+AA^+ = A^+$, $(AA^+)^\\top = AA^+$, $(A^+A)^\\top = A^+A$. Any of these failing means $A^+$ was computed incorrectly.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 8 of 9 — Orthogonality & SVD',
        body: '**Previous (Lesson 7):** Quadratic Forms — how symmetric matrices define curvature and classify critical points.\n**This lesson:** Pseudoinverse — the Moore-Penrose generalization of the matrix inverse to any matrix, giving the minimum-norm least-squares solution.\n**Next (Lesson 9):** Low-Rank Approximation — using SVD to compress matrices and find the most important structure in data.',
      },
      {
        type: 'insight',
        title: 'Prediction: pseudoinverse of a rank-1 matrix',
        body: 'Let $A = \\begin{pmatrix}2\\\\1\\end{pmatrix}$ (2×1 column vector). **Before computing:** what should $A^+$ be? It must map $\\mathbb{R}^2 \\to \\mathbb{R}^1$ (a row vector). For $\\mathbf{b} = (2,1)^\\top$ (in $C(A)$), the exact solution is $x=1$. For $\\mathbf{b} = (1,0)^\\top$, the least-squares solution minimizes $(2x-1)^2+x^2$. After predicting: $A^+ = \\frac{A^\\top}{\\|A\\|^2} = \\frac{1}{5}(2,1)$. Check: $A^+A = (4+1)/5 = 1$ ✓. $A^+(2,1)^\\top = (4+1)/5 = 1$ (exact solution ✓).',
      },
      {
        type: 'theorem',
        title: 'Pseudoinverse via SVD',
        body: 'For $A = U\\Sigma V^\\top$ with singular values $\\sigma_1 \\geq \\cdots \\geq \\sigma_r > 0 = \\sigma_{r+1} = \\cdots$:\n\n$A^+ = V\\Sigma^+ U^\\top$\n\nwhere $\\Sigma^+$ replaces each nonzero singular value $\\sigma_i$ by $1/\\sigma_i$ (and leaves zeros as zeros).\n\nProperties:\n- $A^+\\mathbf{b}$ = minimum-norm least-squares solution\n- $AA^+$ = orthogonal projector onto $C(A)$\n- $A^+A$ = orthogonal projector onto $C(A^\\top)$\n- $(A^+)^+ = A$',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Pseudoinverse Computations',
        mathBridge: 'Compute pseudoinverses and solve overdetermined/underdetermined systems.',
        caption: 'A+ gives the unique minimum-norm least-squares solution.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Pseudoinverse via SVD',
              prose: [
                'Compute the pseudoinverse directly from the SVD and verify the Moore-Penrose conditions.',
                'The recipe: `[U, S, V] = svd(A, \'econ\')`. Invert non-zero singular values: `S_inv = diag(1./diag(S))`. Reconstruct: `A_plus = V * S_inv * U\'`. The `pinv(A)` function does exactly this internally. Verify: `norm(A * A_plus * A - A)` and `norm(A_plus * A * A_plus - A_plus)` should both be near machine epsilon.',
                'The Moore-Penrose conditions are the defining properties of the pseudoinverse — any matrix satisfying all four is THE pseudoinverse (unique). Checking them numerically gives confidence that your SVD-based formula is correct. For a full-rank matrix, `A_plus = inv(A)` and all four conditions reduce to standard matrix inverse identities.',
              ],
              code: `% Overdetermined system: more equations than unknowns
A = [1 2; 3 4; 5 6]
b = [1; 2; 3]

% Pseudoinverse via built-in
A_plus = pinv(A)
disp('A+ (pseudoinverse):')
A_plus

% Minimum-norm least-squares solution
x_hat = A_plus * b
disp('min-norm LS solution x_hat:')
x_hat

% Verify: ||Ax - b||^2 is minimized
residual = norm(A*x_hat - b)
disp('Residual ||Ax_hat - b||:')
residual

% Moore-Penrose conditions
disp('Condition 1: AA+A = A?')
norm(A*A_plus*A - A, 'fro')

disp('Condition 3: (AA+)^T = AA+?')
norm((A*A_plus)' - A*A_plus, 'fro')
`,
            },
            {
              id: 2,
              cellTitle: 'Underdetermined system: min-norm solution',
              prose: [
                'For an underdetermined system, A+ gives the minimum-norm solution among infinitely many.',
                'With `m < n` (more unknowns than equations), `A*x = b` has infinitely many solutions: `x = A_plus*b + (I - A_plus*A)*z` for any vector z. The null-space term `(I - A_plus*A)*z` adds a vector in the null space of A. The pseudoinverse solution `x_min = A_plus*b` has z=0, giving the minimum-norm member of this family.',
                'Verify minimum-norm: compute several particular solutions by adding different null-space vectors `z`, then compare their norms. `norm(A_plus * b)` should be strictly less than all others. Plot `norm(x_min + null_term*t)` vs t — it is a parabola minimized at t=0, confirming `x_min` is the bottom of the norm landscape.',
              ],
              code: `% Underdetermined: more unknowns than equations
A = [1 2 3; 4 5 6]
b = [1; 2]

A_plus = pinv(A)
x_min = A_plus * b
disp('Minimum-norm solution:')
x_min
disp('Norm of min-norm solution:')
norm(x_min)

% Any other solution has larger norm
% Null space vector
null_A = null(A)
disp('Null space vector:')
null_A

% Try x_min + t*null_A for various t
t_vals = [-2, -1, 0, 1, 2]
norms = zeros(1, 5)
for i = 1:5
    x_try = x_min + t_vals(i)*null_A
    norms(i) = norm(x_try)
end
disp('Norms for various t (t=0 should be minimum):')
[t_vals; norms]

% Verify x_min is in row space (perp to null space)
disp('x_min perp to null space (should be ~0):')
null_A'' * x_min
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Regularized pseudoinverse.** When $A$ is ill-conditioned (some singular values near zero), $A^+$ amplifies noise — dividing by near-zero $\\sigma_i$ is unstable. The **Tikhonov regularization** replaces $A^+$ with $(A^\\top A + \\lambda I)^{-1}A^\\top$ for small $\\lambda > 0$. In SVD terms: replace $1/\\sigma_i$ by $\\sigma_i/(\\sigma_i^2 + \\lambda)$. This shrinks the contribution of small singular values instead of amplifying them. As $\\lambda \\to 0$, this converges to $A^+$. The choice of $\\lambda$ is the bias-variance tradeoff in ridge regression.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Pseudoinverse and Projections',
        body: '$AA^+$ projects onto the column space $C(A)$: for $\\mathbf{b} \\in C(A)$, $AA^+\\mathbf{b} = \\mathbf{b}$; for $\\mathbf{b} \\perp C(A)$, $AA^+\\mathbf{b} = 0$.\n\n$A^+A$ projects onto the row space $C(A^\\top)$: for $\\mathbf{x} \\in C(A^\\top)$, $A^+A\\mathbf{x} = \\mathbf{x}$; for $\\mathbf{x} \\in N(A)$, $A^+A\\mathbf{x} = 0$.\n\nThese are the orthogonal projectors onto the two "usable" subspaces — exactly what the four fundamental subspaces tell us.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Pseudoinverse and Minimum-Norm Solutions',
        mathBridge: 'np.linalg.pinv(A) computes the pseudoinverse. A+ @ b gives minimum-norm least-squares solution. Verify AA+A = A and (AA+)^T = AA+.',
        caption: 'The pseudoinverse handles overdetermined (least squares), underdetermined (minimum norm), and singular systems uniformly.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing the pseudoinverse via SVD',
              prose: [
                'The pseudoinverse $A^+ = V\\Sigma^+U^T$ inverts the non-zero singular values. `np.linalg.pinv` does this automatically. Verify the four Moore-Penrose conditions: $AA^+A = A$, $A^+AA^+ = A^+$, $(AA^+)^T = AA^+$, $(A^+A)^T = A^+A$.',
                'Build it manually: `U, s, Vt = np.linalg.svd(A, full_matrices=False); A_plus = Vt.T @ np.diag(1/s) @ U.T`. The `rcond` parameter in `np.linalg.pinv` controls which singular values are treated as zero — values below `rcond * max(s)` are zeroed out (regularisation). `np.linalg.pinv(A, rcond=1e-10)` gives the exact pseudoinverse for well-conditioned A.',
                'Check all four conditions: `np.allclose(A @ A_plus @ A, A)`, `np.allclose(A_plus @ A @ A_plus, A_plus)`, `np.allclose((A @ A_plus).T, A @ A_plus)`, `np.allclose((A_plus @ A).T, A_plus @ A)`. Conditions 3 and 4 say AA⁺ and A⁺A are symmetric — geometrically, they are orthogonal projection matrices onto the column space of A and row space of A respectively.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Underdetermined system: more unknowns than equations
# A is 2x3: minimum norm solution
A = np.array([[1., 2., 3.], [4., 5., 6.]])
b = np.array([1., 2.])

# Pseudoinverse (Moore-Penrose)
A_pinv = np.linalg.pinv(A)
x_min_norm = A_pinv @ b
print(f"A shape: {A.shape}")
print(f"Pseudoinverse solution: {x_min_norm.round(4)}")
print(f"Verify Ax = b: {A @ x_min_norm}")
print(f"||x||^2 = {np.linalg.norm(x_min_norm)**2:.4f}  (minimum norm)")

U, s, Vt = np.linalg.svd(A, full_matrices=False)
print(f"Singular values: {s.round(4)}")

fig, axes = plt.subplots(1, 2, figsize=(10, 3.5))
axes[0].bar(['s1', 's2'], s, color=['steelblue','darkorange'], alpha=0.85, edgecolor='k')
axes[0].set_title(f"Singular values of A\ncondition number = {s[0]/s[-1]:.2f}", fontsize=11)
axes[0].grid(True, alpha=0.3, axis='y')
lim = max(abs(A_pinv).max(), 0.1)
axes[1].imshow(A_pinv, cmap='RdBu_r', aspect='auto', vmin=-lim, vmax=lim)
axes[1].set_title(f"Pseudoinverse A+ ({A_pinv.shape[0]}x{A_pinv.shape[1]})", fontsize=11)
for i in range(A_pinv.shape[0]):
    for j in range(A_pinv.shape[1]):
        axes[1].text(j, i, f'{A_pinv[i,j]:.3f}', ha='center', va='center', fontsize=9)
axes[1].set_xticks([]); axes[1].set_yticks([])
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Overdetermined vs underdetermined — one formula handles both',
              prose: [
                'For an overdetermined system ($m > n$), $A^+\\mathbf{b}$ is the least-squares solution. For an underdetermined system ($m < n$), it is the minimum-norm exact solution. The same `np.linalg.pinv` works for both.',
                'Overdetermined test: `m, n = 5, 3` (more equations); compute `x_hat = A_plus @ b`; verify `np.linalg.norm(A @ x_hat - b)` is the smallest achievable residual. Underdetermined test: `m, n = 3, 5` (more unknowns); compute `x_min = A_plus @ b`; verify `A @ x_min` equals b exactly and that no other solution has smaller norm.',
                'Side-by-side bar charts: left shows the residual norm vs several solutions for the overdetermined case (A_plus gives the minimum); right shows solution norm vs several particular solutions for the underdetermined case (A_plus gives the minimum). This dual role — minimum residual OR minimum norm — is the power of the pseudoinverse.',
              ],
              code: `import numpy as np

print("=== Overdetermined (3 equations, 2 unknowns) ===")
A_over = np.array([[1., 1.], [1., 2.], [1., 3.]])
b_over = np.array([1., 2., 2.])
x_ls = np.linalg.pinv(A_over) @ b_over
print(f"Least-squares solution: {x_ls.round(4)}")
print(f"Residual ||Ax-b||: {np.linalg.norm(A_over @ x_ls - b_over):.4f}")
print(f"Verify A^T(b - Ax) = 0: {np.allclose(A_over.T @ (b_over - A_over @ x_ls), 0)}")

print()
print("=== Underdetermined (2 equations, 4 unknowns) ===")
A_under = np.array([[1., 2., 3., 4.],
                    [5., 6., 7., 8.]])
b_under = np.array([1., 2.])
x_mn = np.linalg.pinv(A_under) @ b_under
print(f"Min-norm solution: {x_mn.round(4)}")
print(f"||x_min|| = {np.linalg.norm(x_mn):.4f}")
print(f"Residual ||Ax-b|| = {np.linalg.norm(A_under @ x_mn - b_under):.10f}")
null_vec = np.array([1., -2., 1., 0.])
x_other = x_mn + 0.5 * null_vec
print(f"Another solution norm: {np.linalg.norm(x_other):.4f} (larger than min-norm)")`,
            },
            {
              id: 3,
              cellTitle: 'Robot Jacobian pseudoinverse — minimum-norm joint velocities',
              prose: [
                'A 3-joint planar robot with end-effector position in 2D has a 2×3 Jacobian. Since 3 joints > 2 DOF (underdetermined), there are infinitely many joint velocity solutions for any desired end-effector motion. The pseudoinverse picks the minimum-norm joint velocities — minimizing energy and avoiding sudden joint accelerations.',
                '`J_plus = np.linalg.pinv(J)` computes the pseudoinverse of the Jacobian. `dq = J_plus @ dx_desired` gives joint velocities. The null-space component `(np.eye(3) - J_plus @ J) @ z` for any z produces joint motion that does NOT move the end-effector — you can use this for obstacle avoidance or joint-limit management while tracking a trajectory.',
                'Plot the 3-link arm at several configurations along a straight-line end-effector path. Notice the joint angles change smoothly (minimum-norm picks the gentlest joint motion). Also plot `np.linalg.norm(dq)` along the path — it stays low because the pseudoinverse minimises joint speed, not just finds any solution.',
              ],
              code: `import numpy as np

# Simplified 3-joint planar robot Jacobian at a given configuration
# J maps 3 joint velocities to 2 end-effector velocities
# (Real Jacobian depends on joint angles, but structure is the same)
np.random.seed(7)
J = np.array([[1.2, -0.8, 0.3],
              [0.4,  1.1, -0.9]])

# Desired end-effector velocity (move right at 1 unit/s)
v_ee = np.array([1.0, 0.0])

# Pseudoinverse: minimum-norm joint velocity solution
J_plus = np.linalg.pinv(J)
q_dot = J_plus @ v_ee

print("Jacobian J (2x3):")
print(J)
print(f"\\nDesired end-effector velocity: {v_ee}")
print(f"Min-norm joint velocities:      {q_dot.round(4)}")
print(f"||q_dot||: {np.linalg.norm(q_dot):.4f}")

# Verify it achieves the desired end-effector velocity
print(f"J @ q_dot = {(J @ q_dot).round(6)}  (should match {v_ee})")

# Any other solution has larger norm
null_J = np.linalg.svd(J)[2][2:]   # null space
q_other = q_dot + 0.5 * null_J[0]
print(f"\\nAlternative solution ||q_other||: {np.linalg.norm(q_other):.4f} (larger)")`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Existence and uniqueness.** The Moore-Penrose pseudoinverse exists and is unique for every matrix $A$ (including rectangular and rank-deficient). Proof of uniqueness: suppose $B_1$ and $B_2$ both satisfy all four Moore-Penrose conditions. Then $B_1 = B_1 A B_2 = B_2$ (using conditions 1, 3, 4). The SVD formula $A^+ = V\\Sigma^+U^\\top$ gives the explicit construction. For operators on Hilbert spaces, the pseudoinverse generalizes to closed-range operators, where it is the bounded inverse of $A$ restricted to $C(A)^\\perp \\to \\overline{C(A)}$.',
      '**Projectors and the four fundamental subspaces.** The two products $AA^+$ and $A^+A$ are orthogonal projectors: $AA^+$ projects onto the column space $C(A)$, and $A^+A$ projects onto the row space $C(A^\\top)$. Their complements $I - AA^+$ and $I - A^+A$ project onto the left null space $N(A^\\top)$ and null space $N(A)$ respectively. This provides a unified decomposition $\\mathbf{b} = AA^+\\mathbf{b} + (I-AA^+)\\mathbf{b}$ into column space and left null space components — the error $\\mathbf{b} - A\\hat{\\mathbf{x}} = (I-AA^+)\\mathbf{b}$ is exactly the left null space component.',
      '**Tikhonov regularization.** The pseudoinverse is sensitive to near-zero singular values: if $\\sigma_k \\approx 0$ then $1/\\sigma_k$ is huge, and the pseudoinverse amplifies noise. In practice, Tikhonov regularization (ridge regression) uses $(A^\\top A + \\lambda I)^{-1}A^\\top$ instead of $(A^\\top A)^{-1}A^\\top$. This has SVD representation $V\\text{diag}(\\sigma_i/(\\sigma_i^2 + \\lambda))U^\\top$, which shrinks each coefficient by $\\sigma_i^2/\\sigma_i^2+\\lambda)$ — small singular values are heavily shrunk. As $\\lambda \\to 0$, this converges to the pseudoinverse; as $\\lambda \\to \\infty$, it converges to zero. The optimal $\\lambda$ balances fit quality against solution norm.',
      '**Pseudoinverse for symmetric positive semidefinite matrices.** For $A = Q\\Lambda Q^\\top$ (SPD spectral decomposition), $A^+ = Q\\Lambda^+ Q^\\top$ where $\\Lambda^+$ inverts the positive diagonal entries and leaves zeros as zeros. Geometrically, $A^+$ is the "partial inverse" that acts as the true inverse on $C(A) = C(A^\\top)$ and gives zero on $N(A) = N(A^\\top)$. In PCA, the SPD covariance matrix $\\Sigma$ has a pseudoinverse that defines the Mahalanobis distance: $d^2(\\mathbf{x}) = \\mathbf{x}^\\top \\Sigma^+ \\mathbf{x}$ — measuring distance in units of standard deviations along each principal component, zero along directions with no variance.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Connection to Normal Equations',
        body: 'The least-squares solution minimizes $\\|A\\mathbf{x}-\\mathbf{b}\\|^2$. Taking the gradient: $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$ (normal equations).\n\nWhen $A$ has full column rank ($r=n$): $A^\\top A$ is invertible, and the unique solution is $\\hat{\\mathbf{x}} = (A^\\top A)^{-1}A^\\top\\mathbf{b} = A^+\\mathbf{b}$.\n\nWhen $A$ is rank-deficient: $A^\\top A$ is singular, normal equations have infinitely many solutions. The pseudoinverse selects the minimum-norm one.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-008-1',
      title: 'Pseudoinverse via SVD for a 3×2 matrix',
      problem: 'Compute $A^+$ for $A = \\begin{pmatrix}1&0\\\\0&1\\\\1&1\\end{pmatrix}$ using the SVD formula, then find the minimum-norm least-squares solution to $A\\mathbf{x} = (2, 1, 4)^\\top$.',
      steps: [
        { explanation: 'Compute $A^\\top A = \\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$. Eigenvalues: $\\lambda = 3, 1$. So singular values $\\sigma_1=\\sqrt{3}$, $\\sigma_2=1$. This gives $\\Sigma = \\begin{pmatrix}\\sqrt{3}&0\\\\0&1\\\\0&0\\end{pmatrix}$.' },
        { explanation: 'Right singular vectors ($V$): $v_1 = (1,1)^\\top/\\sqrt{2}$, $v_2 = (1,-1)^\\top/\\sqrt{2}$. Left singular vectors ($U$): $u_i = Av_i/\\sigma_i$. $u_1 = A(1,1)^\\top/(\\sqrt{2}\\cdot\\sqrt{3}) = (1,1,2)^\\top/\\sqrt{6}$, $u_2 = A(1,-1)^\\top/\\sqrt{2} = (1,-1,0)^\\top/\\sqrt{2}$. Third left vector: $u_3 \\perp u_1, u_2$ (left null space), e.g., $(-1,-1,1)^\\top/\\sqrt{3}$... but for $A^+$ we only need the first two.' },
        { explanation: '$\\Sigma^+ = \\begin{pmatrix}1/\\sqrt{3}&0&0\\\\0&1&0\\end{pmatrix}$. Then $A^+ = V\\Sigma^+U^\\top$. Since dimensions work out: $A^+ = \\frac{1}{\\sqrt{2}}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}\\begin{pmatrix}1/\\sqrt{3}&0&0\\\\0&1&0\\end{pmatrix}\\frac{1}{\\sqrt{6}}\\begin{pmatrix}1&1&2\\\\1&-1&0\\\\-1&-1&1\\end{pmatrix}^\\top$.' },
        { explanation: 'Shortcut: since $A$ has full column rank, $A^+ = (A^\\top A)^{-1}A^\\top$. $(A^\\top A)^{-1} = \\frac{1}{3}\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}$. Then $A^+ = \\frac{1}{3}\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}\\begin{pmatrix}1&0&1\\\\0&1&1\\end{pmatrix} = \\frac{1}{3}\\begin{pmatrix}2&-1&1\\\\-1&2&1\\end{pmatrix}$.' },
        { explanation: 'Solution: $\\hat{x} = A^+(2,1,4)^\\top = \\frac{1}{3}(2\\cdot2-1\\cdot1+1\\cdot4, -1\\cdot2+2\\cdot1+1\\cdot4) = \\frac{1}{3}(7, 6) = (7/3, 2)^\\top$. Residual: $A\\hat{x}-(2,1,4)^\\top = (7/3, 2, 7/3+2)-(2,1,4) = (1/3, 1, 1/3)$. This is in the left null space (perpendicular to column space) ✓.' },
      ],
    },
    {
      id: 'ex-la4-008-2',
      title: 'Minimum-norm solution for underdetermined system',
      problem: 'Solve the underdetermined system $\\mathbf{x}_1 + 2\\mathbf{x}_2 + 3\\mathbf{x}_3 = 6$ for the minimum-norm solution using the pseudoinverse.',
      steps: [
        { explanation: 'Matrix: $A = (1, 2, 3)$ (1×3). Many solutions exist: any $(x_1,x_2,x_3)$ with $x_1+2x_2+3x_3=6$.' },
        { explanation: 'Pseudoinverse of a row vector: $A^+ = A^\\top/\\|A\\|^2 = (1,2,3)^\\top/(1+4+9) = (1,2,3)^\\top/14$.' },
        { explanation: 'Minimum-norm solution: $\\hat{x} = A^+ \\cdot 6 = 6(1,2,3)^\\top/14 = (3/7, 6/7, 9/7)^\\top$.' },
        { explanation: 'Verify: $1\\cdot(3/7)+2\\cdot(6/7)+3\\cdot(9/7) = (3+12+27)/7 = 42/7 = 6$ ✓.' },
        { explanation: 'Minimum norm: $\\|\\hat{x}\\|^2 = (9+36+81)/49 = 126/49 = 18/7 \\approx 2.57$. Any other solution $\\hat{x}+n$ with $n$ in the null space has $\\|\\hat{x}+n\\|^2 = \\|\\hat{x}\\|^2+\\|n\\|^2 > \\|\\hat{x}\\|^2$ since $\\hat{x} \\perp N(A)$ ✓.' },
      ],
    },
    {
      id: 'ex-la4-008-3',
      title: 'Tikhonov regularization vs pseudoinverse',
      problem: 'For $A = \\begin{pmatrix}1&0\\\\0&0.001\\end{pmatrix}$ and $\\mathbf{b} = (1,0.001)^\\top$, compare the pseudoinverse solution with Tikhonov regularization $\\hat{x}_\\lambda = (A^\\top A + \\lambda I)^{-1}A^\\top\\mathbf{b}$ for $\\lambda = 0$ (pseudoinverse) and $\\lambda = 0.01$.',
      steps: [
        { explanation: 'SVD: $A$ is already diagonal. Singular values: $\\sigma_1=1$, $\\sigma_2=0.001$. Condition number $\\kappa = 1000$ (very ill-conditioned).' },
        { explanation: 'Pseudoinverse solution: $A^+ = \\text{diag}(1, 1000)$. $\\hat{x}_0 = A^+\\mathbf{b} = (1, 1000\\cdot0.001) = (1, 1)^\\top$. Exact solution: $\\|A\\hat{x}_0 - \\mathbf{b}\\| = 0$. But the solution has large components due to amplification of the small singular value.' },
        { explanation: 'Tikhonov with $\\lambda = 0.01$: $(A^\\top A + \\lambda I)^{-1} = \\text{diag}(1/(1+0.01), 1/(10^{-6}+0.01)) \\approx \\text{diag}(0.99, 99.99)$. Then $A^\\top\\mathbf{b} = (1, 10^{-6})^\\top$, so $\\hat{x}_{0.01} \\approx (0.99, 0.01)^\\top$.' },
        { explanation: 'Comparison: pseudoinverse $\\hat{x}_0 = (1,1)^\\top$ exactly fits $\\mathbf{b}$, but the second component $x_2=1$ was obtained by amplifying a tiny signal $b_2=0.001$ by $1/0.001=1000$. If $b_2$ has noise, this amplification is dangerous. Tikhonov $\\hat{x}_{0.01}$ sacrifices exact fit for stability: $x_2 \\approx 0.01$ instead of $1$.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la4-008-1',
      title: 'Pseudoinverse of a rank-1 matrix',
      difficulty: 'medium',
      problem: 'For a rank-1 matrix $A = \\mathbf{u}\\mathbf{v}^\\top$ (outer product of $\\mathbf{u} \\in \\mathbb{R}^m$, $\\mathbf{v} \\in \\mathbb{R}^n$), derive a formula for $A^+$ in terms of $\\mathbf{u}$ and $\\mathbf{v}$. Then verify that $AA^+A = A$.',
      hint: 'The SVD of $A = \\mathbf{u}\\mathbf{v}^\\top$ has one nonzero singular value $\\sigma = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$. The left and right singular vectors are $\\hat{\\mathbf{u}} = \\mathbf{u}/\\|\\mathbf{u}\\|$ and $\\hat{\\mathbf{v}} = \\mathbf{v}/\\|\\mathbf{v}\\|$.',
      walkthrough: [
        {
          expression: 'A = \\mathbf{u}\\mathbf{v}^\\top = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\| \\cdot \\frac{\\mathbf{u}}{\\|\\mathbf{u}\\|} \\cdot \\frac{\\mathbf{v}^\\top}{\\|\\mathbf{v}\\|}',
          annotation: 'Factor out the norms: $\\sigma = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$ is the single nonzero singular value. $\\hat{\\mathbf{u}} = \\mathbf{u}/\\|\\mathbf{u}\\|$ and $\\hat{\\mathbf{v}} = \\mathbf{v}/\\|\\mathbf{v}\\|$ are the left and right singular vectors.',
        },
        {
          expression: 'A^+ = \\hat{\\mathbf{v}} \\cdot \\frac{1}{\\sigma} \\cdot \\hat{\\mathbf{u}}^\\top = \\frac{\\mathbf{v}\\mathbf{u}^\\top}{\\|\\mathbf{u}\\|^2 \\|\\mathbf{v}\\|^2}',
          annotation: 'Pseudoinverse formula $V\\Sigma^+U^\\top$ with a single singular value: $\\hat{\\mathbf{v}} \\cdot (1/\\sigma) \\cdot \\hat{\\mathbf{u}}^\\top = \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|} \\cdot \\frac{1}{\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|} \\cdot \\frac{\\mathbf{u}^\\top}{\\|\\mathbf{u}\\|}$.',
        },
        {
          expression: 'AA^+A = (\\mathbf{u}\\mathbf{v}^\\top) \\cdot \\frac{\\mathbf{v}\\mathbf{u}^\\top}{\\|\\mathbf{u}\\|^2\\|\\mathbf{v}\\|^2} \\cdot (\\mathbf{u}\\mathbf{v}^\\top) = \\mathbf{u}\\mathbf{v}^\\top = A',
          annotation: '$\\mathbf{v}^\\top\\mathbf{v} = \\|\\mathbf{v}\\|^2$ and $\\mathbf{u}^\\top\\mathbf{u} = \\|\\mathbf{u}\\|^2$ cancel the denominators. Moore-Penrose condition 1 ✓.',
        },
      ],
      answer: 'A⁺ = vuᵀ / (‖u‖²‖v‖²). Verified: AA⁺A = A ✓.',
    },
    {
      id: 'ch-la4-008-2',
      title: 'Minimum-norm solution for an underdetermined system',
      difficulty: 'medium',
      problem: 'The system $x_1 + x_2 + x_3 = 4$, $x_1 - x_2 = 0$ has infinitely many solutions. Find the minimum-norm solution using the pseudoinverse. Verify it lies in the row space of $A$.',
      hint: '$A = \\begin{pmatrix}1&1&1\\\\1&-1&0\\end{pmatrix}$ (full row rank). For full row rank: $A^+ = A^\\top(AA^\\top)^{-1}$.',
      walkthrough: [
        {
          expression: 'A = \\begin{pmatrix}1&1&1\\\\1&-1&0\\end{pmatrix}, \\quad AA^\\top = \\begin{pmatrix}3&0\\\\0&2\\end{pmatrix}',
          annotation: '$A$ has full row rank (2 rows, rank 2). $AA^\\top$ is diagonal — easy to invert.',
        },
        {
          expression: 'A^+ = A^\\top(AA^\\top)^{-1} = \\begin{pmatrix}1&1\\\\1&-1\\\\1&0\\end{pmatrix}\\begin{pmatrix}1/3&0\\\\0&1/2\\end{pmatrix} = \\begin{pmatrix}1/3&1/2\\\\1/3&-1/2\\\\1/3&0\\end{pmatrix}',
          annotation: 'Right inverse formula for full row rank matrices.',
        },
        {
          expression: '\\hat{\\mathbf{x}} = A^+\\mathbf{b} = \\begin{pmatrix}1/3&1/2\\\\1/3&-1/2\\\\1/3&0\\end{pmatrix}\\begin{pmatrix}4\\\\0\\end{pmatrix} = \\begin{pmatrix}4/3\\\\4/3\\\\4/3\\end{pmatrix}',
          annotation: '$\\mathbf{b} = (4, 0)^\\top$. The minimum-norm solution has all three components equal — the most "spread out" solution.',
        },
        {
          expression: '\\|\\hat{\\mathbf{x}}\\| = \\sqrt{3 \\cdot (4/3)^2} = \\frac{4}{\\sqrt{3}} \\approx 2.31',
          annotation: 'Any other solution has larger norm. For example, $(4,0,0)^\\top$ also satisfies the system: $\\|(4,0,0)\\| = 4 > 2.31$.',
        },
      ],
      answer: 'Minimum-norm solution: x̂ = [4/3, 4/3, 4/3]ᵀ. Lies in the row space (orthogonal to N(A)).',
    },
    {
      id: 'ch-la4-008-3',
      title: 'Verify all four Moore-Penrose conditions',
      difficulty: 'hard',
      problem: 'For $A = \\begin{pmatrix}1&0\\\\0&1\\\\0&0\\end{pmatrix}$ (3×2, rank 2), compute $A^+$ and verify all four Moore-Penrose conditions: (1) $AA^+A=A$, (2) $A^+AA^+=A^+$, (3) $(AA^+)^\\top=AA^+$, (4) $(A^+A)^\\top=A^+A$.',
      hint: 'This is the simplest case: the SVD of $A$ is trivial ($U = I_3$, $V = I_2$, $\\Sigma$ = first two rows of $I_3$). The pseudoinverse just "chops" the extra row.',
      walkthrough: [
        {
          expression: 'A^+ = \\begin{pmatrix}1&0&0\\\\0&1&0\\end{pmatrix}',
          annotation: '$\\Sigma = \\begin{pmatrix}1&0\\\\0&1\\\\0&0\\end{pmatrix}$, $\\Sigma^+ = \\begin{pmatrix}1&0&0\\\\0&1&0\\end{pmatrix}$. With $U = I_3$, $V = I_2$: $A^+ = V\\Sigma^+U^\\top = \\Sigma^+$.',
        },
        {
          expression: 'AA^+ = \\begin{pmatrix}1&0\\\\0&1\\\\0&0\\end{pmatrix}\\begin{pmatrix}1&0&0\\\\0&1&0\\end{pmatrix} = \\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&0\\end{pmatrix}',
          annotation: 'This is the projection onto the first two coordinates — exactly the column space of $A$.',
        },
        {
          expression: 'AA^+A = \\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&0\\end{pmatrix}\\begin{pmatrix}1&0\\\\0&1\\\\0&0\\end{pmatrix} = \\begin{pmatrix}1&0\\\\0&1\\\\0&0\\end{pmatrix} = A \\checkmark',
          annotation: 'Condition 1 ✓. Conditions 2-4: $A^+AA^+ = A^+$ ✓ (similar); $(AA^+)^\\top = AA^+$ ✓ (diagonal matrix); $(A^+A)^\\top = I_2^\\top = I_2 = A^+A$ ✓.',
        },
      ],
      answer: 'A⁺ = [[1,0,0],[0,1,0]]. All four Moore-Penrose conditions verified: AA⁺A=A ✓, A⁺AA⁺=A⁺ ✓, (AA⁺)ᵀ=AA⁺ ✓, (A⁺A)ᵀ=A⁺A ✓.',
    },
  ],

  mentalModel: [
    '$A^+ = V\\Sigma^+U^\\top$: flip $\\Sigma$ (transpose), invert nonzero singular values.',
    '$A^+\\mathbf{b}$ = minimum-norm least-squares solution. Unique.',
    '$AA^+$ = projection onto $C(A)$. $A^+A$ = projection onto $C(A^\\top)$.',
    'Full column rank: $A^+ = (A^\\top A)^{-1}A^\\top$ (left inverse). Full row rank: $A^+ = A^\\top(AA^\\top)^{-1}$ (right inverse).',
    'Ill-conditioned: use Tikhonov $(A^\\top A + \\lambda I)^{-1}A^\\top$ instead of $A^+$ to avoid noise amplification.',
  ],

  checkpoints: [
    { id: 'cp-la4-008-1', label: 'Read the concrete SVD-based pseudoinverse example', type: 'read' },
    { id: 'cp-la4-008-2', label: 'Read the four Moore-Penrose conditions', type: 'read' },
    { id: 'cp-la4-008-3', label: 'Read what A+b computes (min-norm LS solution)', type: 'read' },
    { id: 'cp-la4-008-4', label: 'Compute pseudoinverse and verify conditions in notebook', type: 'lab' },
    { id: 'cp-la4-008-5', label: 'Find min-norm solution for underdetermined system in notebook', type: 'lab' },
    { id: 'cp-la4-008-6', label: 'Trace the 3×2 full column rank pseudoinverse example', type: 'example' },
    { id: 'cp-la4-008-7', label: 'Trace the minimum-norm underdetermined example', type: 'example' },
    { id: 'cp-la4-008-8', label: 'Derive the pseudoinverse formula for a rank-1 outer product', type: 'challenge' },
  ],

  assessment: 'For $A = \\begin{pmatrix}1&1\\\\1&1\\\\0&0\\end{pmatrix}$: (a) find $A^+$ using the formula for rank-1 matrices or SVD; (b) compute $A^+(1,2,0)^\\top$ and verify it is the minimum-norm least-squares solution.',

  quiz: [
    {
      id: 'q-la4-008-1',
      type: 'choice',
      text: 'For a full column rank matrix $A$, the pseudoinverse $A^+$ equals:',
      options: ['$(A^\\top A)^{-1}A^\\top$', '$A^\\top(AA^\\top)^{-1}$', '$A^{-1}$', '$A^\\top$'],
      answer: '$(A^\\top A)^{-1}A^\\top$',
      hints: ['Full column rank: $A^\\top A$ is invertible (square and invertible).', 'This is the left inverse of $A$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-008-2',
      type: 'choice',
      text: '$A^+\\mathbf{b}$ gives the solution that:',
      options: [
        'Minimizes $\\|\\mathbf{x}\\|$ only',
        'Minimizes $\\|A\\mathbf{x}-\\mathbf{b}\\|$ only',
        'Minimizes $\\|A\\mathbf{x}-\\mathbf{b}\\|$ and, among all minimizers, also minimizes $\\|\\mathbf{x}\\|$',
        'Maximizes $\\|A\\mathbf{x}\\|$',
      ],
      answer: 'Minimizes $\\|A\\mathbf{x}-\\mathbf{b}\\|$ and, among all minimizers, also minimizes $\\|\\mathbf{x}\\|$',
      hints: ['The pseudoinverse gives the "best of both worlds."', 'It is the unique solution in the row space $C(A^\\top)$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-008-3',
      type: 'choice',
      text: 'Given $A = U\\Sigma V^\\top$, the pseudoinverse is:',
      options: ['$U\\Sigma^+ V^\\top$', '$V\\Sigma^+ U^\\top$', '$V\\Sigma U^\\top$', '$U^\\top\\Sigma^+ V$'],
      answer: '$V\\Sigma^+ U^\\top$',
      hints: ['The pseudoinverse reverses the SVD: apply $V$ first, then $\\Sigma^+$, then $U^\\top$.', '$\\Sigma^+$ is $\\Sigma$ transposed with nonzero entries inverted.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-008-4',
      type: 'choice',
      text: '$AA^+$ is the orthogonal projector onto:',
      options: ['The null space $N(A)$', 'The column space $C(A)$', 'The row space $C(A^\\top)$', 'The left null space $N(A^\\top)$'],
      answer: 'The column space $C(A)$',
      hints: ['Moore-Penrose condition 3: $(AA^+)^\\top = AA^+$ means $AA^+$ is symmetric.', '$AA^+\\mathbf{b} = \\mathbf{b}$ when $\\mathbf{b} \\in C(A)$; $AA^+\\mathbf{b} = 0$ when $\\mathbf{b} \\perp C(A)$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-008-5',
      type: 'choice',
      text: 'For $A = (2, 1)$ (a 1×2 row vector), $A^+$ is:',
      options: ['$(2, 1)^\\top$', '$(2,1)^\\top/5$', '$(1/2, 1)^\\top$', '$(2,1)^\\top/\\sqrt{5}$'],
      answer: '$(2,1)^\\top/5$',
      hints: ['$A^+ = A^\\top/\\|A\\|^2$ for a row vector.', '$\\|A\\|^2 = 4+1=5$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la4-008-6',
      type: 'choice',
      text: 'For the underdetermined system $x_1 + 2x_2 + 3x_3 = 6$, the minimum-norm solution has $\\|\\hat{x}\\|^2 =$',
      options: ['$6$', '$18/7$', '$1$', '$36/14$'],
      answer: '$18/7$',
      hints: ['$\\hat{x} = A^+\\cdot 6 = (6/14)(1,2,3)^\\top = (3/7,6/7,9/7)^\\top$.', '$\\|\\hat{x}\\|^2 = (9+36+81)/49 = 126/49 = 18/7$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la4-008-7',
      type: 'choice',
      text: 'For an invertible square matrix $A$, the pseudoinverse $A^+$ equals:',
      options: ['$A$', '$A^\\top$', '$A^{-1}$', '$A^{-\\top}$'],
      answer: '$A^{-1}$',
      hints: ['When $A$ is invertible, the pseudoinverse reduces to the true inverse.', '$A^+ = V\\Sigma^+U^\\top$ and $(A^{-1}) = V\\Sigma^{-1}U^\\top$ — same formula with $\\Sigma^+ = \\Sigma^{-1}$ since all singular values are nonzero.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-008-8',
      type: 'choice',
      text: 'Which Moore-Penrose condition says $AA^+$ is an orthogonal projector?',
      options: ['Condition 1: $AA^+A = A$', 'Condition 2: $A^+AA^+ = A^+$', 'Condition 3: $(AA^+)^\\top = AA^+$', 'Condition 4: $(A^+A)^\\top = A^+A$'],
      answer: 'Condition 3: $(AA^+)^\\top = AA^+$',
      hints: ['A matrix $P$ is an orthogonal projector iff $P^2=P$ and $P^\\top=P$.', 'Condition 1+3 together give $AA^+$ is an orthogonal projector: $(AA^+)^2 = A(A^+A)A^+ = AA^+$ (using condition 1).'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-008-9',
      type: 'choice',
      text: 'Tikhonov regularization $(A^\\top A + \\lambda I)^{-1}A^\\top\\mathbf{b}$ is preferred over $A^+\\mathbf{b}$ when:',
      options: ['$A$ is full rank', '$A$ has small singular values (ill-conditioned)', '$\\mathbf{b}$ is large', '$A$ is square'],
      answer: '$A$ has small singular values (ill-conditioned)',
      hints: ['$A^+$ divides by singular values — tiny $\\sigma_i$ cause huge amplification of noise.', 'Tikhonov adds $\\lambda$ to avoid dividing by near-zero values.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-008-10',
      type: 'choice',
      text: 'The minimum-norm least-squares solution $A^+\\mathbf{b}$ lies in which subspace?',
      options: ['The null space $N(A)$', 'The left null space $N(A^\\top)$', 'The row space $C(A^\\top)$', 'The column space $C(A)$'],
      answer: 'The row space $C(A^\\top)$',
      hints: ['$A^+A$ projects onto the row space.', 'The min-norm solution has no null space component, so it is entirely in the row space.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute the pseudoinverse using $A^+ = (A^\\top A)^{-1}A^\\top$ (full column rank) or $A^+= A^\\top(AA^\\top)^{-1}$ (full row rank); find the minimum-norm least-squares solution $\\hat{x} = A^+b$.',
    explainVerbally: 'Explain why $A^+b$ gives the unique minimum-norm least-squares solution, connecting it to the row space (minimum norm) and column space projection (least squares).',
    detectIncorrectApplication: 'Catch the mistake of using $A^+ = (A^\\top A)^{-1}A^\\top$ when $A$ is not full column rank — $A^\\top A$ is not invertible in that case and you must use the SVD formula.',
    transferToUnfamiliar: 'Given a new linear system, classify it as overdetermined, underdetermined, or exactly determined, then apply the correct pseudoinverse formula and interpret the solution geometrically.',
  },

  misconceptions: [
    {
      falseBelief: 'The pseudoinverse is just the regular inverse when the matrix is square.',
      whyStudentsThinkIt: 'For invertible square matrices, $A^+ = A^{-1}$ — this is true. But for singular square matrices, $A^+ \\neq A^{-1}$ (which doesn\'t exist). Students think "square" implies "pseudoinverse = inverse."',
      correctionExample: 'For $A = \\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$ (square but singular, rank 1): $A^+ = A/(\\|A\\|_F^2) = A/4$ (one-quarter of $A$), NOT the inverse (which doesn\'t exist).',
      contrastCase: 'Only for invertible square matrices is $A^+ = A^{-1}$. For all other matrices (non-square or singular square), $A^+$ is genuinely different from any classical inverse.',
    },
    {
      falseBelief: '$A^+\\mathbf{b}$ always gives an exact solution to $A\\mathbf{x}=\\mathbf{b}$.',
      whyStudentsThinkIt: 'The pseudoinverse "solves" the equation, so students assume it gives an exact solution. But for overdetermined inconsistent systems, there is no exact solution.',
      correctionExample: 'For $A = \\begin{pmatrix}1\\\\2\\end{pmatrix}$, $\\mathbf{b} = (1,0)^\\top$: $A^+ = (1,2)/5$, $\\hat{x} = A^+\\mathbf{b} = 1/5$. Then $A\\hat{x} = (1/5, 2/5)^\\top \\neq (1,0)^\\top$. The residual is $(4/5, -2/5)^\\top$, which is nonzero but is perpendicular to $C(A) = \\text{span}\\{(1,2)^\\top\\}$ ✓.',
      contrastCase: '$A^+\\mathbf{b}$ gives an exact solution when $\\mathbf{b} \\in C(A)$. For inconsistent systems, it gives the nearest point in $C(A)$ — the least-squares solution, NOT an exact solution.',
    },
  ],

  transferPrompts: [
    {
      situation: 'In a robotics arm with 7 joints controlling a 6D end-effector pose, the Jacobian $J$ is $6\\times 7$ (underdetermined). You want to move the end-effector with velocity $\\mathbf{v}$. How do you find joint velocities $\\dot{q}$?',
      competingTechniques: 'Use any particular solution to Jq̇=v (ignore redundancy); Use q̇* = J⁺v (minimum-norm joint velocities)',
      whyThisTechniqueWins: 'The pseudoinverse solution $J^+\\mathbf{v}$ gives the minimum-energy joint motion — the redundant DOF is used to minimize joint effort. Alternative: $\\dot{q}^* + (I-J^+J)\\mathbf{z}$ for any $\\mathbf{z}$ (null space term) can further optimize secondary objectives like avoiding joint limits.',
    },
    {
      situation: 'A linear regression model has more features than training samples (overparameterized, $n > m$). The normal equations $X^\\top X\\hat{\\beta} = X^\\top\\mathbf{y}$ are underdetermined. Which solution does gradient descent on squared loss converge to?',
      competingTechniques: 'Add regularization (ridge, LASSO) to ensure uniqueness; Use gradient descent initialized at zero — converges to X⁺y (minimum norm)',
      whyThisTechniqueWins: 'When initialized at zero, gradient descent converges exactly to the minimum-norm solution $\\hat{\\beta} = X^+\\mathbf{y}$ — this is an implicit regularization effect. Understanding the pseudoinverse explains WHY overparameterized networks trained with SGD generalize: they find the minimum-norm solution, which tends to be simpler.',
    },
  ],

  debugging: [
    {
      commonError: 'Using $(A^\\top A)^{-1}A^\\top$ for $A^+$ when $A$ is rank-deficient.',
      symptom: 'Student applies the "left inverse formula" to a matrix with dependent columns; MATLAB or Python throws an error because $A^\\top A$ is singular.',
      whyItHappened: 'The formula $(A^\\top A)^{-1}A^\\top$ only works when $A$ has full column rank. Students memorize the formula without checking when it is valid.',
      repairStrategy: 'Always check rank first. If rank$(A) = n$ (full column rank): use $(A^\\top A)^{-1}A^\\top$. If rank$(A) = m$ (full row rank): use $A^\\top(AA^\\top)^{-1}$. Otherwise: use SVD with `pinv()` in MATLAB or `numpy.linalg.pinv()` in Python.',
    },
    {
      commonError: 'Confusing $\\Sigma^+$ with $\\Sigma^{-1}$ (transposing $\\Sigma$ but not inverting the entries).',
      symptom: 'Student computes $\\Sigma^+ = \\Sigma^\\top$ (just the transpose of $\\Sigma$) without inverting the diagonal entries.',
      whyItHappened: 'The formula $A^+ = V\\Sigma^+U^\\top$ uses $^\\top$ notation for both the SVD factors AND the pseudoinverse, causing confusion about what "flipping" $\\Sigma$ means.',
      repairStrategy: '$\\Sigma^+$ = TRANSPOSE $\\Sigma$ (swap $m\\times n$ to $n\\times m$) AND replace each nonzero diagonal entry $\\sigma_i$ by $1/\\sigma_i$. Leave zero entries as zero. For $\\Sigma = \\text{diag}(3,2,0)$ (3×3): $\\Sigma^+ = \\text{diag}(1/3, 1/2, 0)$ (3×3 same shape since square here).',
    },
  ],

  semantics: {
    core: [
      { symbol: 'A^+ = V\\Sigma^+ U^\\top', meaning: 'Moore-Penrose pseudoinverse via SVD — Σ⁺ transposes Σ and inverts each nonzero diagonal entry' },
      { symbol: '\\hat{\\mathbf{x}} = A^+\\mathbf{b}', meaning: 'Minimum-norm least-squares solution — simultaneously minimizes ‖Ax−b‖ and ‖x‖' },
      { symbol: 'AA^+', meaning: 'Orthogonal projector onto the column space C(A)' },
      { symbol: 'A^+A', meaning: 'Orthogonal projector onto the row space C(Aᵀ)' },
      { symbol: '(A^\\top A + \\lambda I)^{-1}A^\\top', meaning: 'Tikhonov-regularized pseudoinverse — shrinks near-zero singular values to prevent noise amplification' },
    ],
    rulesOfThumb: [
      'Full column rank: A⁺ = (AᵀA)⁻¹Aᵀ (left inverse, least-squares solution). Full row rank: A⁺ = Aᵀ(AAᵀ)⁻¹ (right inverse, minimum-norm solution).',
      'The min-norm solution A⁺b lies in the row space C(Aᵀ) — it has no null space component.',
      'AA⁺ and A⁺A are orthogonal projectors (symmetric, idempotent). Check: (AA⁺)ᵀ = AA⁺ and (AA⁺)² = AA⁺.',
      'Near-zero singular values amplify noise. Use regularization when σₖ < ε·σ₁.',
      'For a square invertible A, A⁺ = A⁻¹ exactly.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la4-002-svd',
        label: 'SVD',
        note: 'The pseudoinverse is built directly from the SVD: A⁺ = VΣ⁺Uᵀ. Every pseudoinverse computation begins with the SVD.',
      },
      {
        lessonId: 'la4-003',
        label: 'Least Squares',
        note: 'For full column rank A, A⁺b = (AᵀA)⁻¹Aᵀb — exactly the normal equations solution from Least Squares. The pseudoinverse generalizes this to rank-deficient and underdetermined cases.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-009',
        label: 'Low-Rank Approximation',
        note: 'The rank-k pseudoinverse (using only the k largest singular values) solves the regularized least squares problem and connects to low-rank approximation: Aₖ⁺ = Vₖ Σₖ⁻¹ Uₖᵀ.',
      },
    ],
  },
};
