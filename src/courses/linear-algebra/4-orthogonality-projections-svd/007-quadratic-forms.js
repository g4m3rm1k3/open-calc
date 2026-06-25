import quadraticFormConicsUrl from '../diagrams/la-quadratic-form-conics.svg?url'

export default {
  id: 'la4-007',
  slug: 'quadratic-forms',
  chapter: 'la4',
  order: 7,
  title: 'Quadratic Forms and the Principal Axes Theorem',
  subtitle: 'Every expression $\\mathbf{x}^\\top A \\mathbf{x}$ with symmetric $A$ is a quadratic form — a generalization of $ax^2 + bxy + cy^2$. The Principal Axes Theorem rotates the coordinate system to eliminate the cross terms.',
  tags: ['quadratic form', 'positive definite', 'positive semidefinite', 'indefinite', 'principal axes', 'conics', 'classification', 'definiteness'],
  aliases: 'quadratic form positive definite negative definite indefinite principal axes theorem conics ellipse hyperbola classification',

  hook: {
    question: "The equation $3x^2 + 4xy + 3y^2 = 1$ is a conic section — but which one? An ellipse, a hyperbola, or something else? How do you tell without graphing it?",
    realWorldContext: "Quadratic forms are everywhere in optimization: the second-order Taylor approximation of any smooth function is a quadratic form, and whether that function has a local minimum, maximum, or saddle point depends entirely on whether the Hessian (a symmetric matrix) is positive definite, negative definite, or indefinite. In physics, quadratic forms represent energy: kinetic energy $\\frac{1}{2}\\mathbf{v}^\\top M \\mathbf{v}$ and potential energy $\\frac{1}{2}\\mathbf{x}^\\top K \\mathbf{x}$ where $M$ and $K$ are the mass and stiffness matrices. The structure of these quadratic forms determines whether a system oscillates, decays, or blows up.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Take $Q(x,y) = 3x^2 + 4xy + 3y^2$. Evaluate at a few points: $Q(1,0) = 3$, $Q(0,1) = 3$, $Q(1,1) = 10$, $Q(1,-1) = 2$ — always positive. Write it as $Q(\\mathbf{x}) = \\mathbf{x}^\\top A\\mathbf{x}$ with $A = \\begin{bmatrix}3&2\\\\2&3\\end{bmatrix}$ (off-diagonal entry = half the $xy$ coefficient: $4/2 = 2$). Eigenvalues of $A$: $(3-\\lambda)^2 - 4 = 0 \\Rightarrow \\lambda = 1, 5$ — both positive. Now try $Q(x,y) = 2x^2 + 6xy + 2y^2$ with $A = \\begin{bmatrix}2&3\\\\3&2\\end{bmatrix}$: eigenvalues $\\lambda = -1$ and $5$ (mixed signs). Check: $Q(1,1) = 10 > 0$ but $Q(1,-1) = -2 < 0$ — the form takes both signs. The eigenvalue signs completely encode the geometry of the level set $Q(\\mathbf{x}) = c$.',
      '**Definiteness classifies the form.** A quadratic form (and its matrix $A$) is:\n- **Positive definite (PD):** $Q(\\mathbf{x}) > 0$ for all $\\mathbf{x} \\neq 0$ — all eigenvalues positive\n- **Positive semidefinite (PSD):** $Q(\\mathbf{x}) \\geq 0$ for all $\\mathbf{x}$ — all eigenvalues $\\geq 0$\n- **Negative definite (ND):** $Q(\\mathbf{x}) < 0$ for all $\\mathbf{x} \\neq 0$ — all eigenvalues negative\n- **Indefinite:** $Q$ takes both positive and negative values — mixed eigenvalue signs',
      '**The Principal Axes Theorem.** By the Spectral Theorem, $A = Q\\Lambda Q^\\top$. Change variables: $\\mathbf{x} = Q\\mathbf{y}$ (rotate to the eigenvector coordinate system). Then:\n\n$Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x} = (Q\\mathbf{y})^\\top A (Q\\mathbf{y}) = \\mathbf{y}^\\top Q^\\top A Q \\mathbf{y} = \\mathbf{y}^\\top \\Lambda \\mathbf{y} = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2$\n\nIn the rotated coordinates, the cross terms vanish. The form is purely diagonal — just a sum of scaled squares.',
      '**Classifying conics.** The equation $Q(\\mathbf{x}) = 1$ defines a level set of the quadratic form. In the principal axis coordinates ($y_1, y_2$), it becomes $\\lambda_1 y_1^2 + \\lambda_2 y_2^2 = 1$. If both $\\lambda_i > 0$: ellipse (ratio of semi-axes = $1/\\sqrt{\\lambda_i}$). If $\\lambda_1 > 0 > \\lambda_2$: hyperbola. If any $\\lambda_i = 0$: degenerate.',
      ] },
      { type: 'image', src: quadraticFormConicsUrl,
        alt: 'Left panel: an ellipse aligned with dashed principal axes, labeled lambda1 and lambda2 both positive, bounded, a bowl shape. Right panel: two hyperbola branches with dashed asymptotes, labeled mixed signs, unbounded, a saddle shape',
        caption: 'The eigenvalue signs alone determine the shape — both positive bounds an ellipse, mixed signs opens a hyperbola.' },
      { type: 'prose', paragraphs: [
      '**Completing the square reveals the eigenvectors.** You can diagonalize a $2 \\times 2$ quadratic form by hand without computing eigenvalues: just complete the square. For $Q(x,y) = ax^2 + 2bxy + cy^2$: group by $x$ and complete the square, then read off the structure. For example, $Q = 3x^2 + 4xy + 3y^2 = 3(x + \\frac{2}{3}y)^2 + \\frac{5}{3}y^2$. This shows $Q > 0$ for all nonzero $(x,y)$, confirming positive definiteness. The rotation that eliminates the cross term points in the eigenvector directions. The standard test to check positive definiteness without eigenvalues is **Sylvester\'s criterion**: $A$ is positive definite iff all leading principal minors (determinants of the upper-left $k \\times k$ submatrices) are positive.',
      '**Where this is heading.** Quadratic forms are the second-order lens on functions — any twice-differentiable function $f(\\mathbf{x})$ near a critical point $\\mathbf{x}^*$ behaves like $f(\\mathbf{x}^*) + \\frac{1}{2}(\\mathbf{x}-\\mathbf{x}^*)^T H(\\mathbf{x}-\\mathbf{x}^*)$ where $H$ is the Hessian matrix (symmetric). Positive definite Hessian means local minimum, negative definite means local maximum, indefinite means saddle. This is multivariable calculus from a linear algebra perspective. In the next lesson, the pseudoinverse extends all of this to matrices that are not invertible — which happens exactly when the quadratic form $\\mathbf{x}^T A^T A \\mathbf{x}$ has a zero eigenvalue, meaning multiple inputs map to the same output.',
      '**CNC applications of quadratic forms.** (1) **Cutting energy and tool wear:** the energy delivered to the workpiece per unit volume is $U = \\frac{1}{2}\\boldsymbol{\\epsilon}^\\top C \\boldsymbol{\\epsilon}$ where $\\boldsymbol{\\epsilon}$ is the strain vector and $C$ is the symmetric stiffness tensor — a quadratic form. Positive definiteness of $C$ guarantees $U > 0$ (energy stored, not extracted). (2) **Optimization of surface finish:** the surface roughness objective function $f(\\mathbf{p})$ near the optimal parameter vector $\\mathbf{p}^*$ behaves like $f \\approx f^* + (\\mathbf{p}-\\mathbf{p}^*)^\\top H (\\mathbf{p}-\\mathbf{p}^*)$ where $H$ is the Hessian (symmetric). Positive definiteness of $H$ confirms the parameter is a minimum of roughness, not a saddle. (3) **Tolerance ellipsoids:** the set of positions $\\mathbf{x}$ within tolerance of a nominal point satisfies $\\mathbf{x}^\\top \\Sigma^{-1} \\mathbf{x} \\leq \\chi^2_{\\alpha,n}$ — a quadratic form with matrix $\\Sigma^{-1}$. The tolerance ellipsoid semi-axes are $\\sqrt{\\lambda_i \\cdot \\chi^2_\\alpha}$ in the principal directions, showing which axes have tighter tolerances.',
      ] },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Quadratic Forms and Level Sets',
        mathBridge: 'Compute eigenvalues to classify a quadratic form and find the principal axes.',
        caption: 'Eigenvalues determine the shape; eigenvectors determine the orientation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Classify and diagonalize a quadratic form',
              prose: [
                'Q(x) = 3x1^2 + 4x1*x2 + 3x2^2 = x^T * A * x. What conic is Q = 1?',
                'Build the symmetric matrix: `A = [3 2; 2 3]` (off-diagonal entries = half the cross term coefficient, so 4/2 = 2). Then `[V, D] = eig(A)` gives the principal axes V and eigenvalues D. In principal coordinates `y = V\'*x` the quadratic form becomes `D(1,1)*y1^2 + D(2,2)*y2^2 = 1` — a standard ellipse or hyperbola.',
                'The shape is determined by eigenvalue signs: both positive → ellipse (PD), mixed signs → hyperbola (indefinite). The axis lengths are `1/sqrt(lambda_i)` — smaller eigenvalue gives the longer axis. Plot the level set with `contour(X, Y, Q_values, [1])` to confirm.',
              ],
              code: `% 3x1^2 + 4x1*x2 + 3x2^2: off-diagonal = half of 4 = 2
A = [3 2; 2 3]
[Q, D] = eig(A)
lambdas = diag(D)
disp('Eigenvalues (both positive => ellipse):')
lambdas
disp('Semi-axes lengths 1/sqrt(lambda):')
1 ./ sqrt(lambdas)
disp('Principal axis directions (eigenvectors):')
Q
`,
            },
            {
              id: 2,
              cellTitle: 'Positive definiteness via Sylvester criterion',
              prose: [
                'Test A and B for positive definiteness using leading principal minors.',
                'Sylvester\'s criterion: compute minors with `det(A(1:k, 1:k))` for k = 1, 2, ..., n. If all are positive, A is PD. Also try `chol(A)` — it succeeds only for PD matrices (MATLAB returns an error otherwise). The `chol` test is O(n³) but faster in practice than computing all eigenvalues.',
                'A quick numeric check: `all(eig(A) > 0)`. Compare this to the Sylvester result and the Cholesky result — all three methods agree. Each has a use case: eigenvalues give the full picture, Sylvester avoids all eigenvalue computation, and `chol` is the fastest test in code.',
              ],
              code: `A = [4 2; 2 3]
disp('Leading principal minors of A:')
m1 = A(1,1)
m2 = det(A)
disp('A is PD? (all minors > 0):')
m1 > 0 && m2 > 0

B = [1 3; 3 2]
disp('Leading principal minors of B:')
n1 = B(1,1)
n2 = det(B)
disp('B is PD? No (n2 < 0 => indefinite):')
n1 > 0 && n2 > 0
[V,D] = eig(B)
disp('Eigenvalues of B (mixed signs => indefinite):')
diag(D)
`,
            },
            {
              id: 3,
              cellTitle: 'Computing the change of variables',
              prose: [
                'Find the rotation Q that eliminates cross terms in 3x1^2 + 4x1*x2 + 3x2^2.',
                '`[Q, D] = eig(A)` gives the rotation matrix Q (columns are orthonormal eigenvectors). The change of variables is `y = Q\'*x` — rotating coordinates to align with the principal axes. In y-coordinates: `Q(x) = D(1,1)*y1^2 + D(2,2)*y2^2` — no cross term.',
                'Verify by substituting `x = Q*y` into `x\'*A*x`: `(Q*y)\'*A*(Q*y) = y\'*Q\'*A*Q*y = y\'*D*y`. Since D is diagonal, there are no cross terms. Plot the original quadratic form Q(x)=1 and the diagonalized form D(1,1)*y1^2+D(2,2)*y2^2=1 in the same figure — they are the same ellipse, just with axes aligned to coordinate axes.',
              ],
              code: `A = [3 2; 2 3]
[Q, D] = eig(A)
lambdas = diag(D);

disp('Original form: 3x1^2 + 4x1*x2 + 3x2^2')
disp('After rotation x = Q*y:')
disp('y1^2 * lambda1 + y2^2 * lambda2 =')
lambdas
disp('Rotation matrix Q (columns = principal axes):')
Q
disp('Verify Q is orthogonal (Q^T*Q = I):')
Q'*Q
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Analyze a Quadratic Form',
        body: 'Step 1. **Write the symmetric matrix.** For $Q = ax_1^2 + bx_1x_2 + cx_2^2$: set $A_{11}=a$, $A_{22}=c$, $A_{12}=A_{21}=b/2$ (half the cross-term coefficient).\n\nStep 2. **Classify the form.** Find eigenvalues of $A$ (or use Sylvester: check all leading principal minors). All positive → PD. Mixed signs → indefinite. All non-negative with some zero → PSD.\n\nStep 3. **Apply the Principal Axes Theorem.** Change variables $\\mathbf{x} = Q\\mathbf{y}$ (orthogonal), where $Q$ has eigenvectors as columns. In the new coordinates: $Q(\\mathbf{x}) = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2$ — no cross terms.\n\nStep 4. **Identify the level set.** For $Q(\\mathbf{x}) = c$ with $c > 0$: if all $\\lambda_i > 0$, this is an ellipse/ellipsoid with semi-axes $a_i = \\sqrt{c/\\lambda_i}$ along the eigenvector directions. Mixed signs give a hyperbola/hyperboloid.\n\nStep 5. **Interpret definiteness geometrically.** Positive definite → bowl shape (local min possible). Indefinite → saddle shape.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 7 of 9 — Orthogonality & SVD',
        body: '**Previous (Lesson 6):** Spectral Theorem — symmetric matrices are orthogonally diagonalizable with real eigenvalues.\n**This lesson:** Quadratic Forms — how symmetric matrices define a scalar-valued function $Q(\\mathbf{x}) = \\mathbf{x}^T A\\mathbf{x}$, and what the eigenvalue signs tell you about its geometry.\n**Next (Lesson 8):** Pseudoinverse — the generalization of matrix inverse to non-square and rank-deficient matrices.',
      },
      {
        type: 'insight',
        title: 'Sylvester\'s Criterion: Testing Positive Definiteness',
        body: 'A symmetric matrix $A$ is positive definite iff all leading principal minors are positive:\n$\\det(A_{1\\times 1}) > 0$, $\\det(A_{2\\times 2}) > 0$, ..., $\\det(A) > 0$\nThis gives a determinant-based test that avoids computing eigenvalues.',
      },
      {
        type: 'insight',
        title: 'Connecting to Optimization',
        body: 'At a critical point where $\\nabla f = 0$:\n• Hessian $H$ positive definite → local minimum\n• Hessian $H$ negative definite → local maximum\n• Hessian $H$ indefinite → saddle point\nQuadratic forms are exactly the second-order behavior of smooth functions near critical points.',
      },
      {
        type: 'theorem',
        title: 'Principal Axes Theorem',
        body: 'Every quadratic form $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ can be diagonalized by an orthogonal change of variables $\\mathbf{x} = Q\\mathbf{y}$:\n$Q(\\mathbf{x}) = \\lambda_1 y_1^2 + \\lambda_2 y_2^2 + \\cdots + \\lambda_n y_n^2$\nThe axes of the resulting ellipsoid/hyperboloid are the eigenvectors (principal axes) of $A$.',
      },
      {
        type: 'insight',
        title: 'Prediction',
        body: 'Before computing: the quadratic form $Q(x,y) = x^2 - 4xy + 4y^2$ has matrix $A = \\begin{bmatrix}1&-2\\\\-2&4\\end{bmatrix}$. Notice $\\det(A) = 4 - 4 = 0$. What does that tell you about one of the eigenvalues? What kind of conic (or degenerate shape) should $Q(x,y) = 1$ trace out? What happens to the level set $Q(x,y) = c$ for different $c$?',
      },
    ],
  },

  math: {
    prose: [
      '**Diagonalization of quadratic forms.** Given $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ with $A = Q_0 \\Lambda Q_0^\\top$ (Spectral Theorem), set $\\mathbf{y} = Q_0^\\top \\mathbf{x}$ (so $\\mathbf{x} = Q_0 \\mathbf{y}$). Then:\n\n$Q(\\mathbf{x}) = (Q_0 \\mathbf{y})^\\top (Q_0 \\Lambda Q_0^\\top)(Q_0 \\mathbf{y}) = \\mathbf{y}^\\top \\Lambda \\mathbf{y} = \\sum_{i=1}^n \\lambda_i y_i^2$\n\nThe change of variables $\\mathbf{y} = Q_0^\\top \\mathbf{x}$ is a rotation (since $Q_0$ is orthogonal).',
      '**Sylvester\'s Law of Inertia.** The numbers of positive, negative, and zero eigenvalues of a symmetric matrix (its **signature**) are invariant under any congruence transformation $A \\mapsto P^\\top A P$ (with $P$ invertible). This is the algebraic content of the Principal Axes Theorem: no matter how you diagonalize the form, the same number of squares appear with positive and negative coefficients.',
      '**Gram matrices are positive semidefinite.** For any matrix $B$, $A = B^\\top B$ is symmetric PSD: $\\mathbf{x}^\\top B^\\top B \\mathbf{x} = \\|B\\mathbf{x}\\|^2 \\geq 0$. Conversely, every PSD matrix is a Gram matrix. In statistics, sample covariance matrices are Gram matrices (hence PSD), so their quadratic forms $\\mathbf{v}^\\top \\Sigma \\mathbf{v}$ represent variances of linear combinations.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Positive Definite Test (Eigenvalue Criterion)',
        body: '$A$ positive definite $\\Leftrightarrow$ all eigenvalues of $A$ are positive\n$A$ positive semidefinite $\\Leftrightarrow$ all eigenvalues $\\geq 0$\n$A$ negative definite $\\Leftrightarrow$ all eigenvalues are negative\n$A$ indefinite $\\Leftrightarrow$ has both positive and negative eigenvalues',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Quadratic Forms, Conics, and Optimization',
        mathBridge: 'Classify quadratic forms by eigenvalue signs, visualize level sets as conics, and apply to optimization via Hessian analysis.',
        caption: 'The shape of every conic and the behavior at every critical point is encoded in the eigenvalue signs of the symmetric matrix.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Classify quadratic forms — eigenvalue signs determine the shape',
              prose: [
                'The level set $Q(\\mathbf{x}) = 1$ is an ellipse when both eigenvalues are positive (PD), a hyperbola when eigenvalues have mixed signs (indefinite), and degenerate when an eigenvalue is zero (PSD). Principal axes are the eigenvectors — the directions that orient the shape. Plot three cases and compare their eigenvalue signs to the conic type.',
                'To compute Q on a grid: `Q_vals = np.einsum("ij,jk,ik->i", X_flat, A, X_flat)` or equivalently `((X_flat @ A) * X_flat).sum(axis=1)`. Reshape back to the grid shape for `plt.contour`. The `[1]` level gives the conic; `[0.25, 0.5, 1, 2, 4]` levels show the full family.',
                'For each matrix, compute `vals = np.linalg.eigh(A)[0]`. The classification rule in code: `"PD" if (vals > 0).all() else "ND" if (vals < 0).all() else "indefinite" if (vals > 0).any() and (vals < 0).any() else "PSD"`. Print this alongside the contour plot to connect algebra to geometry.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Visualize level sets Q(x,y) = 1 for various quadratic forms
# Compare ellipse (PD), hyperbola (indefinite), and parabola-like (PSD)

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

def plot_quadratic(ax, A, title, xrange=(-3, 3), yrange=(-3, 3)):
    x = np.linspace(*xrange, 400)
    y = np.linspace(*yrange, 400)
    X, Y = np.meshgrid(x, y)
    # Q(x,y) = x^T A x at each grid point
    Z = A[0,0]*X**2 + (A[0,1]+A[1,0])*X*Y + A[1,1]*Y**2

    eigenvalues, eigvecs = np.linalg.eigh(A)
    sign_info = f"λ = {eigenvalues[0]:.1f}, {eigenvalues[1]:.1f}"

    cs = ax.contour(X, Y, Z, levels=[1], colors='blue', linewidths=2)
    ax.contourf(X, Y, Z, levels=20, cmap='RdBu_r', alpha=0.4)

    # Draw principal axes
    for i in range(2):
        v = eigvecs[:, i]
        ax.annotate('', xy=2*v, xytext=-2*v,
                   arrowprops=dict(arrowstyle='<->', color='red', lw=2))

    ax.set_xlim(*xrange); ax.set_ylim(*yrange)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
    ax.set_aspect('equal')
    ax.set_title(f"{title}\\n{sign_info}")
    ax.set_xlabel('x'); ax.set_ylabel('y')

# (a) Positive definite: ellipse
A_pd = np.array([[3., 2.], [2., 3.]])
plot_quadratic(axes[0], A_pd, "PD: 3x²+4xy+3y² (ellipse)")

# (b) Indefinite: hyperbola
A_indef = np.array([[2., 3.], [3., 2.]])
plot_quadratic(axes[1], A_indef, "Indefinite: 2x²+6xy+2y² (hyperbola)")

# (c) Positive definite, elongated
A_elon = np.array([[5., 4.], [4., 5.]])
plot_quadratic(axes[2], A_elon, "PD: 5x²+8xy+5y² (thin ellipse)")

plt.tight_layout()
plt.savefig('quadratic_forms.png', dpi=80, bbox_inches='tight')
plt.show()
print("Red arrows = principal axes (eigenvectors)")
print("Blue contour = Q(x,y) = 1")
`,
            },
            {
              id: 2,
              cellTitle: 'Sylvester\'s criterion — testing positive definiteness without eigenvalues',
              prose: [
                'Sylvester\'s criterion: $A$ is positive definite iff all **leading principal minors** are positive. The $k$-th leading principal minor is $\\det(A_{k \\times k})$ — the determinant of the upper-left $k \\times k$ submatrix. This avoids eigenvalue computation. Compare results to the direct eigenvalue test.',
                '`minors = [np.linalg.det(A[:k, :k]) for k in range(1, n+1)]` computes all leading minors. `all(m > 0 for m in minors)` is Sylvester\'s test. Cross-check with `all(np.linalg.eigvalsh(A) > 0)` — both should agree. Also try `np.linalg.cholesky(A)` which raises `LinAlgError` for non-PD matrices.',
                'The bar chart of minor values visualises Sylvester\'s criterion: all bars above zero = PD, first negative bar shows where positive definiteness fails. This is especially useful for large matrices where you want to know HOW CLOSE to positive semidefinite (smallest minor approaching zero) without computing all eigenvalues.',
              ],
              code: `import numpy as np

# Sylvester's criterion: test positive definiteness without eigenvalues
# A PD iff all leading principal minors > 0

def sylvester_test(A):
    n = A.shape[0]
    minors = []
    for k in range(1, n+1):
        minor = np.linalg.det(A[:k, :k])
        minors.append(minor)
    is_pd = all(m > 0 for m in minors)
    return minors, is_pd

# Test several matrices
matrices = {
    "A = [[4,2],[2,3]] (should be PD)": np.array([[4., 2.], [2., 3.]]),
    "B = [[1,3],[3,2]] (indefinite)":   np.array([[1., 3.], [3., 2.]]),
    "C = [[2,1,0],[1,2,1],[0,1,2]] (PD)": np.array([[2.,1.,0.],[1.,2.,1.],[0.,1.,2.]]),
    "D = [[1,2],[2,4]] (PSD, rank 1)":   np.array([[1., 2.], [2., 4.]]),
}

for name, A in matrices.items():
    minors, is_pd = sylvester_test(A)
    evals = np.linalg.eigvalsh(A)
    print(f"\\n{name}")
    print(f"  Leading minors: {[round(m, 4) for m in minors]}")
    print(f"  Eigenvalues:    {evals.round(4)}")
    print(f"  Sylvester says PD: {is_pd}  |  Eigenvalue says PD: {all(evals > 1e-10)}")
`,
            },
            {
              id: 3,
              cellTitle: 'CNC surface finish optimization — Hessian tells you if you found a minimum',
              prose: [
                'At a critical point of $f(\\mathbf{x})$ (where $\\nabla f = 0$), the Hessian $H$ is symmetric. If $H$ is positive definite, you have a local minimum. If indefinite, a saddle. Here we model surface roughness $R_a$ as a quadratic function of feed rate $f$ and cutting speed $v$, then check that the Hessian at the nominal point confirms it\'s a minimum.',
                'For a quadratic model `Ra = a*f**2 + b*v**2 + c*f*v + d*f + e*v + const`, the Hessian is constant: `H = np.array([[2*a, c], [c, 2*b]])`. Check PD with `np.linalg.eigvalsh(H) > 0`. The surface is convex everywhere — no local minima can be saddle points.',
                'The 3D surface plot shows the Ra landscape over (feed, speed) space. The contour lines on the floor are level sets of the quadratic form. The minimum location is `x_min = -np.linalg.solve(H, grad_linear)` where `grad_linear` is the gradient of the linear terms — this is the normal equations from least squares appearing in optimization!',
              ],
              code: `import numpy as np
from scipy.optimize import minimize

# CNC surface finish optimization via Hessian analysis
# Objective: minimize surface roughness Ra as function of (feed f, speed v)
# Near optimal point, Ra(f,v) â‰ˆ Ra* + [df dv] H [df;dv]
# If H is PD at optimum => confirmed local minimum

# Simulated Ra landscape (quadratic approximation near f=0.1, v=200)
# Ra = 0.8 + 5*(f-0.1)^2 + 0.01*(v-200)^2 + 0.3*(f-0.1)*(v-200)
f0, v0 = 0.1, 200.0   # nominal operating point

def Ra(params):
    f, v = params
    df, dv = f - f0, v - v0
    return 0.8 + 5*df**2 + 0.01*dv**2 + 0.3*df*dv

# Hessian of Ra (analytical, then verified numerically)
H_analytical = np.array([
    [2*5,    0.3],    # d²Ra/df², d²Ra/dfdv
    [0.3,  2*0.01],  # d²Ra/dvdf, d²Ra/dv²
])
print("Hessian at nominal point:")
print(H_analytical)
print()

# Check positive definiteness
minors, is_pd = [], True
for k in [1, 2]:
    m = np.linalg.det(H_analytical[:k, :k])
    minors.append(m)
    if m <= 0: is_pd = False

eigenvalues = np.linalg.eigvalsh(H_analytical)
print(f"Leading principal minors: {[round(m, 4) for m in minors]}")
print(f"Eigenvalues of H: {eigenvalues.round(4)}")
print(f"H is positive definite: {is_pd}")
print()
print("=> H PD => operating point is a LOCAL MINIMUM of Ra")
print(f"=> Nominal Ra = {Ra([f0, v0]):.4f} μm")
print()

# Find true minimum numerically to confirm
result = minimize(Ra, [f0 + 0.02, v0 + 10])
print(f"Numerical minimum at f={result.x[0]:.4f}, v={result.x[1]:.2f}")
print(f"Min Ra = {result.fun:.4f} μm")
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Sylvester\'s Law of Inertia (formal).** If $A$ and $B$ are real symmetric matrices, they are congruent ($A = P^\\top B P$ for some invertible $P$) iff they have the same signature $(n_+, n_-, n_0)$ where $n_+, n_-, n_0$ are the numbers of positive, negative, and zero eigenvalues. The classification of real quadratic forms over $\\mathbb{R}$ is completely determined by the signature. This is the algebraic content of the Principal Axes Theorem: no matter how you diagonalize the form (via eigenvalues or Gaussian elimination), the same count of positive and negative coefficients appears.',
      '**Connection to topology.** The level set $\\{\\mathbf{x} : \\mathbf{x}^\\top A \\mathbf{x} = 1\\}$ is: a real ellipsoid if $A$ is PD (compact, simply connected); a hyperboloid of one sheet if $A$ has signature $(n-1, 1, 0)$; a hyperboloid of two sheets if $A$ has signature $(1, n-1, 0)$; degenerate (cylinder, cone, empty) if $A$ is singular. The topology (compactness, connectivity, number of components) is determined solely by the signature.',
      '**Completing the square and LDL decomposition.** The classical method for diagonalizing a quadratic form without eigenvalues is **completing the square**, equivalent to $LDL^\\top$ decomposition of $A$ (where $L$ is unit lower-triangular and $D$ is diagonal). The diagonal entries of $D$ are the pivots of Gaussian elimination and their signs determine definiteness. When all pivots are positive, $A$ is positive definite — this is the LDL-based proof of Sylvester\'s criterion.',
      '**Simultaneous diagonalization of two quadratic forms.** Given two symmetric matrices $A$ and $B$ with $B$ positive definite, there exists an invertible matrix $P$ such that $P^\\top A P = \\Lambda$ (diagonal) and $P^\\top B P = I$ simultaneously. This is the **generalized eigenvalue problem** $A\\mathbf{v} = \\lambda B\\mathbf{v}$. In CNC vibration analysis, the kinetic energy is $T = \\frac{1}{2}\\dot{\\mathbf{x}}^\\top M \\dot{\\mathbf{x}}$ and potential energy is $U = \\frac{1}{2}\\mathbf{x}^\\top K \\mathbf{x}$, both positive definite quadratic forms. Simultaneously diagonalizing $K$ and $M$ gives the natural frequencies $\\omega_i = \\sqrt{\\lambda_i}$ (generalized eigenvalues) — the resonant frequencies of the structure. The principal directions that simultaneously diagonalize both forms are the **normal modes** of vibration.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Completing the Square',
        body: 'The process of eliminating cross terms from a quadratic form is the matrix version of completing the square. For $3x^2 + 4xy + 3y^2$: let $u = x + \\frac{2}{3}y$, then $3(x + \\frac{2}{3}y)^2 + \\frac{5}{3}y^2$ — all cross terms gone. This is Gaussian elimination applied to the Gram matrix.',
      },
      {
        type: 'theorem',
        title: 'Sylvester\'s Law of Inertia',
        body: 'Two symmetric matrices $A, B$ are congruent ($A = P^\\top B P$, $P$ invertible) if and only if they have the same **signature** $(n_+, n_-, n_0)$.\n\nFor quadratic forms $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$:\n- Diagonalize any way you like\n- The number of positive, negative, and zero coefficients is invariant\n- The form is completely classified by its signature',
      },
      {
        type: 'insight',
        title: 'Second Derivative Test in $n$ Dimensions',
        body: 'At a critical point $\\nabla f = 0$:\n\n$f(\\mathbf{x} + \\mathbf{h}) \\approx f(\\mathbf{x}) + \\frac{1}{2}\\mathbf{h}^\\top H \\mathbf{h}$\n\nwhere $H = [\\partial^2 f / \\partial x_i \\partial x_j]$ is the Hessian (symmetric by Clairaut\'s theorem).\n- $H$ PD → local minimum\n- $H$ ND → local maximum\n- $H$ indefinite → saddle point\n- $H$ PSD or NSD → inconclusive (need higher-order terms)',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-007-1',
      title: 'Classifying a conic and finding semi-axes',
      problem: 'Classify the conic $5x^2 - 4xy + 5y^2 = 36$ and find the semi-axes lengths.',
      steps: [
        {
          expression: 'A = \\begin{bmatrix}5 & -2 \\\\ -2 & 5\\end{bmatrix}',
          annotation: 'Read off the symmetric matrix: diagonal entries from $x^2, y^2$ coefficients; off-diagonal = half the $xy$ coefficient ($-4/2 = -2$).',
          strategyTitle: 'Write the matrix of the quadratic form',
        },
        {
          expression: '\\det(A - \\lambda I) = (5-\\lambda)^2 - 4 = 0 \\implies \\lambda = 3, 7',
          annotation: '$(5-\\lambda)^2 = 4 \\implies 5-\\lambda = \\pm 2$. Both eigenvalues are positive.',
          strategyTitle: 'Find eigenvalues',
        },
        {
          expression: '\\text{Both } \\lambda_1 = 3 > 0, \\; \\lambda_2 = 7 > 0 \\implies A \\text{ is positive definite} \\implies \\text{ellipse}',
          annotation: 'A PD quadratic form has a compact (closed, bounded) level set — an ellipse in 2D.',
          strategyTitle: 'Classify: all positive eigenvalues → ellipse',
        },
        {
          expression: '\\text{In principal axis coordinates: } 3y_1^2 + 7y_2^2 = 36 \\iff \\frac{y_1^2}{36/3} + \\frac{y_2^2}{36/7} = 1',
          annotation: 'Rewrite as standard ellipse form $y_1^2/a^2 + y_2^2/b^2 = 1$.',
          strategyTitle: 'Convert to standard ellipse form',
        },
        {
          expression: 'a_1 = \\sqrt{\\frac{36}{3}} = \\sqrt{12} = 2\\sqrt{3} \\approx 3.46, \\quad a_2 = \\sqrt{\\frac{36}{7}} \\approx 2.27',
          annotation: 'Semi-axis along the $\\lambda_1 = 3$ eigenvector direction has length $2\\sqrt{3}$; along the $\\lambda_2 = 7$ direction it is shorter ($\\approx 2.27$). Smaller eigenvalue → longer axis.',
          strategyTitle: 'Semi-axes lengths',
          hints: ['The smaller eigenvalue gives the longer semi-axis: large $\\lambda$ means the form grows fast in that direction, so the level set is close to the origin (short semi-axis).'],
        },
      ],
    },
    {
      id: 'ex-la4-007-2',
      title: 'Positive definiteness via Sylvester\'s criterion',
      problem: 'Test whether $A = \\begin{bmatrix}4&2&1\\\\2&5&2\\\\1&2&6\\end{bmatrix}$ is positive definite using Sylvester\'s criterion.',
      steps: [
        {
          expression: 'M_1 = \\det([4]) = 4 > 0 \\checkmark',
          annotation: 'First leading principal minor: the $(1,1)$ entry.',
          strategyTitle: 'First minor',
        },
        {
          expression: 'M_2 = \\det\\begin{bmatrix}4&2\\\\2&5\\end{bmatrix} = 20 - 4 = 16 > 0 \\checkmark',
          annotation: 'Second leading principal minor: top-left $2\\times 2$ submatrix.',
          strategyTitle: 'Second minor',
        },
        {
          expression: 'M_3 = \\det(A) = 4(5\\cdot6 - 4) - 2(2\\cdot6 - 2) + 1(4 - 5) = 4(26) - 2(10) + (-1) = 104 - 20 - 1 = 83 > 0 \\checkmark',
          annotation: 'Expand along the first row.',
          strategyTitle: 'Third minor',
        },
        {
          expression: 'M_1, M_2, M_3 > 0 \\implies A \\text{ is positive definite}',
          annotation: 'All three leading principal minors are positive — Sylvester\'s criterion is satisfied. No need to compute eigenvalues.',
          strategyTitle: 'Conclude: A is PD',
          checkpoint: 'Verify: eigenvalues of this $A$ are approximately $2.87, 4.44, 8.69$ — all positive, confirming the criterion.',
        },
      ],
    },
    {
      id: 'ex-la4-007-3',
      title: 'Second derivative test via Hessian quadratic form',
      problem: 'Find and classify all critical points of $f(x,y) = 2x^2 + 4xy + 5y^2 - 4x - 10y$.',
      steps: [
        {
          expression: '\\nabla f = \\mathbf{0}: \\quad \\frac{\\partial f}{\\partial x} = 4x + 4y - 4 = 0, \\quad \\frac{\\partial f}{\\partial y} = 4x + 10y - 10 = 0',
          annotation: 'Set both partial derivatives to zero. This gives a $2\\times 2$ linear system.',
          strategyTitle: 'Find critical points',
        },
        {
          expression: 'x + y = 1 \\quad \\text{and} \\quad 2x + 5y = 5. \\quad \\text{Subtract twice the first from the second: } 3y = 3 \\implies y = 1, \\; x = 0.',
          annotation: 'Solve the system. Unique solution $(0, 1)$ means there is exactly one critical point.',
          strategyTitle: 'Solve the system',
        },
        {
          expression: 'H = \\begin{bmatrix}f_{xx}&f_{xy}\\\\f_{xy}&f_{yy}\\end{bmatrix} = \\begin{bmatrix}4&4\\\\4&10\\end{bmatrix}',
          annotation: 'The Hessian matrix collects the second partial derivatives. It is symmetric (Clairaut\'s theorem) and constant here because $f$ is quadratic.',
          strategyTitle: 'Form the Hessian',
        },
        {
          expression: 'M_1 = 4 > 0, \\quad M_2 = \\det(H) = 40 - 16 = 24 > 0',
          annotation: 'Apply Sylvester\'s criterion to $H$. Both leading principal minors are positive.',
          strategyTitle: 'Apply Sylvester\'s criterion to $H$',
        },
        {
          expression: 'H \\text{ is positive definite} \\implies f \\text{ has a local minimum at } (0,1).',
          annotation: 'Positive definite Hessian means the quadratic form $\\mathbf{h}^\\top H \\mathbf{h} > 0$ for all directions $\\mathbf{h}$ — the function curves upward in every direction. This is a minimum.',
          strategyTitle: 'Classify via definiteness',
        },
        {
          expression: 'f(0,1) = 0 + 0 + 5 - 0 - 10 = -5',
          annotation: 'Minimum value is $-5$ at $(0,1)$. Verify: $f(1,0) = 2 - 4 = -2 > -5$ ✓, $f(-1, 1) = 2 - 4 + 5 + 4 - 10 = -3 > -5$ ✓. The Hessian is constant (quadratic $f$), so this is also a global minimum.',
          strategyTitle: 'Compute minimum value',
          checkpoint: 'The Hessian of a quadratic $f$ is the same as the matrix of the quadratic form in the leading terms. Definiteness of the Hessian = definiteness of the quadratic part.',
        },
      ],
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la4-007-classify-quadratic',
      title: 'Classifying a Quadratic Form: Definite, Indefinite, or Semidefinite',
      prereqs: ['Eigenvalues', 'Symmetric matrices'],
      problem: 'Classify the quadratic form $Q(\\mathbf{x}) = 2x_1^2 + 4x_1x_2 + 5x_2^2$.',
      steps: [
        {
          label: 'Write the quadratic form as $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$',
          strategy: 'The diagonal entries of $A$ are the squared-term coefficients; the off-diagonal entries split the cross-term coefficient equally.',
          explanation: '$2x_1^2+4x_1x_2+5x_2^2 \\to A_{11}=2$, $A_{22}=5$, cross-term $4x_1x_2 \\to A_{12}=A_{21}=2$.',
          math: 'A = \\begin{bmatrix}2&2\\\\2&5\\end{bmatrix}',
          gotcha: 'The cross-term coefficient $4$ is split as $2+2$, not placed as a single entry. Always halve the cross-term coefficient to fill the two off-diagonal slots.',
        },
        {
          label: 'Find the eigenvalues of $A$',
          strategy: 'Definiteness is determined by the signs of the eigenvalues. Use $\\det(A-\\lambda I)=0$.',
          explanation: '$\\det(A-\\lambda I) = (2-\\lambda)(5-\\lambda)-4 = \\lambda^2-7\\lambda+6 = (\\lambda-1)(\\lambda-6)$. Eigenvalues: $\\lambda_1=1$ and $\\lambda_2=6$.',
          math: '\\lambda_1=1>0,\\quad \\lambda_2=6>0',
        },
        {
          label: 'Classify based on eigenvalue signs',
          strategy: 'All positive → positive definite. All negative → negative definite. Mixed signs → indefinite. Any zero → semidefinite.',
          explanation: 'Both eigenvalues are positive → $A$ is positive definite → $Q(\\mathbf{x}) > 0$ for all $\\mathbf{x}\\neq\\mathbf{0}$.',
          math: 'Q(\\mathbf{x}) = \\mathbf{x}^\\top A\\mathbf{x} > 0\\;\\forall\\,\\mathbf{x}\\neq\\mathbf{0} \\Rightarrow \\text{positive definite}',
        },
        {
          label: 'Check using Sylvester\'s criterion (quicker for 2×2)',
          strategy: 'Leading principal minors: $\\Delta_1 = A_{11} > 0$ and $\\Delta_2 = \\det(A) > 0$ iff $A \\succ 0$.',
          explanation: '$\\Delta_1 = 2 > 0$ ✓. $\\Delta_2 = 10-4 = 6 > 0$ ✓. Positive definite confirmed without computing eigenvalues.',
          math: '\\Delta_1=2>0,\\quad \\Delta_2=6>0 \\Rightarrow A \\succ 0 \\checkmark',
        },
      ],
    },
    {
      id: 'wt-la4-007-diagonalize-quadratic',
      title: 'Diagonalizing a Quadratic Form (Completing the Square via Eigenvectors)',
      prereqs: ['Quadratic form classification', 'Spectral theorem', 'Change of variables'],
      problem: 'Diagonalize $Q(\\mathbf{x}) = 2x_1^2+4x_1x_2+5x_2^2$ by a change of variables $\\mathbf{x} = P\\mathbf{y}$.',
      steps: [
        {
          label: 'Use the orthogonal diagonalization $A = P\\Lambda P^\\top$',
          strategy: 'Since $A$ is symmetric, the spectral theorem gives $A = P\\Lambda P^\\top$ with $P$ orthogonal. Substituting $\\mathbf{x}=P\\mathbf{y}$: $Q = \\mathbf{y}^\\top\\Lambda\\mathbf{y} = \\lambda_1 y_1^2+\\lambda_2 y_2^2$.',
          explanation: 'The cross-term $4x_1x_2$ vanishes in the new coordinates — that\'s the whole point of diagonalizing the quadratic form.',
          math: 'Q(P\\mathbf{y}) = \\mathbf{y}^\\top P^\\top AP\\,\\mathbf{y} = \\mathbf{y}^\\top\\Lambda\\mathbf{y} = y_1^2+6y_2^2',
          gotcha: 'The change of variables is $\\mathbf{x}=P\\mathbf{y}$, NOT $\\mathbf{y}=P\\mathbf{x}$. The columns of $P$ give the new coordinate axes, so you multiply $P$ on the left when converting from new coordinates to old.',
        },
        {
          label: 'Interpret: the principal axes',
          strategy: 'The columns of $P$ (eigenvectors of $A$) are the "principal axes" — the natural coordinate system where the quadratic form has no cross-terms.',
          explanation: 'In the $\\mathbf{y}$-coordinates, $Q = y_1^2+6y_2^2$ is a pure ellipse equation. The level set $Q=1$ is an ellipse with semi-axes $1$ (along $\\mathbf{v}_1$) and $1/\\sqrt{6}$ (along $\\mathbf{v}_2$).',
          math: 'Q=1 \\Rightarrow y_1^2+6y_2^2=1 \\text{ (ellipse with axes } 1,\\,1/\\sqrt{6})',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la4-007-1',
      title: 'Classify $Q$ in terms of parameter $k$',
      difficulty: 'medium',
      problem: 'For which values of $k$ is $Q(x,y) = x^2 + 4xy + ky^2$ (a) positive definite; (b) positive semidefinite; (c) indefinite?',
      hint: 'Set up the matrix $A$ of the quadratic form. Apply Sylvester\'s criterion: both leading minors must be positive for PD. For PSD, allow the determinant to equal zero.',
      walkthrough: [
        '**Matrix of $Q$:** Off-diagonal entry = half of the $xy$ coefficient: $4/2 = 2$. So $A = \\begin{bmatrix}1&2\\\\2&k\\end{bmatrix}$.',
        '**Leading principal minors:** $M_1 = 1 > 0$ always. $M_2 = \\det(A) = k - 4$.',
        '**Positive definite:** $M_1 > 0$ AND $M_2 > 0 \\Rightarrow k - 4 > 0 \\Rightarrow k > 4$.',
        '**Positive semidefinite:** $M_1 \\geq 0$ AND $M_2 \\geq 0 \\Rightarrow k \\geq 4$. At $k = 4$: $\\det(A) = 0$, so one eigenvalue is 0 — PSD but not PD.',
        '**Indefinite:** $M_2 < 0 \\Rightarrow k < 4$. Mixed eigenvalue signs → $Q$ takes both positive and negative values.',
        '**Verification at $k = 3$:** Eigenvalues of $\\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$: trace $= 4$, det $= -1$. By quadratic formula: $\\lambda = 2 \\pm \\sqrt{5}$, so $\\lambda_1 \\approx -0.24$ and $\\lambda_2 \\approx 4.24$ — confirmed indefinite.',
      ],
    },
    {
      id: 'ch-la4-007-2',
      title: 'Principal axes of a tolerance ellipse',
      difficulty: 'hard',
      problem: 'A CNC machining process has dimensional errors with covariance $\\Sigma = \\begin{bmatrix}4&3\\\\3&9\\end{bmatrix}$ (mm²). The $95\\%$ tolerance zone satisfies $\\mathbf{e}^\\top \\Sigma^{-1} \\mathbf{e} \\leq 5.99$ (the $\\chi^2_{0.05, 2}$ critical value). Find the principal axes of the tolerance ellipse and the lengths of its semi-axes.',
      hint: 'The tolerance ellipse $\\mathbf{e}^\\top \\Sigma^{-1} \\mathbf{e} = c$ has semi-axes $\\sqrt{c \\lambda_i}$ in the eigenvector directions of $\\Sigma$ (NOT $\\Sigma^{-1}$).',
      walkthrough: [
        '**Eigenvalues of $\\Sigma$:** $\\text{tr}(\\Sigma) = 13$, $\\det(\\Sigma) = 36 - 9 = 27$. $\\lambda^2 - 13\\lambda + 27 = 0$. $\\lambda = \\frac{13 \\pm \\sqrt{169 - 108}}{2} = \\frac{13 \\pm \\sqrt{61}}{2}$. So $\\lambda_1 \\approx 2.61$, $\\lambda_2 \\approx 10.39$.',
        '**Principal directions:** For $\\lambda_1 \\approx 2.61$: $(\\Sigma - \\lambda_1 I)\\mathbf{v} = 0$, giving $\\mathbf{q}_1 \\propto (-3, \\lambda_1 - 4)^\\top \\approx (-3, -1.39)^\\top$. For $\\lambda_2 \\approx 10.39$: $\\mathbf{q}_2 \\propto (3, \\lambda_2 - 4)^\\top \\approx (3, 6.39)^\\top$.',
        '**Semi-axes:** The tolerance ellipse $\\mathbf{e}^\\top \\Sigma^{-1} \\mathbf{e} = c$ in the eigenvector coordinates of $\\Sigma$ becomes $\\frac{y_1^2}{c\\lambda_1} + \\frac{y_2^2}{c\\lambda_2} = 1$. Semi-axes: $a_1 = \\sqrt{c\\lambda_1} = \\sqrt{5.99 \\times 2.61} \\approx 3.95$ mm, $a_2 = \\sqrt{c\\lambda_2} = \\sqrt{5.99 \\times 10.39} \\approx 7.89$ mm.',
        '**Interpretation:** The larger semi-axis ($\\approx 7.89$ mm) points in the $\\mathbf{q}_2$ direction — the direction of maximum error spread. If the $y$-axis dimension has larger variance ($\\Sigma_{22} = 9 > \\Sigma_{11} = 4$), the principal axis tilts toward $y$.',
      ],
    },
    {
      id: 'ch-la4-007-3',
      title: 'Hessian analysis and saddle point classification',
      difficulty: 'medium',
      problem: 'The function $f(x,y) = x^3 + y^3 - 3xy$ has a critical point at $(1,1)$ (verify: $\\nabla f = (3x^2 - 3y, 3y^2 - 3x) = (0,0)$ at $(1,1)$). (a) Compute the Hessian matrix $H$ at $(1,1)$. (b) Classify the critical point using the definiteness of $H$. (c) What is the sign of the function near $(1,1)$?',
      hint: '$H_{ij} = \\partial^2 f / \\partial x_i \\partial x_j$. At $(1,1)$: $H_{11} = 6x|_{(1,1)} = 6$, $H_{22} = 6y|_{(1,1)} = 6$, $H_{12} = H_{21} = -3$. Use Sylvester: $M_1 = H_{11} > 0$ and $\\det(H) = ?$.',
      walkthrough: [
        {
          expression: 'H = \\begin{bmatrix}6x & -3 \\\\ -3 & 6y\\end{bmatrix}\\bigg|_{(1,1)} = \\begin{bmatrix}6 & -3 \\\\ -3 & 6\\end{bmatrix}',
          annotation: '$\\partial^2 f/\\partial x^2 = 6x$, $\\partial^2 f/\\partial y^2 = 6y$, $\\partial^2 f/\\partial x\\partial y = -3$. Evaluate at $(1,1)$.',
        },
        {
          expression: 'M_1 = 6 > 0 \\quad \\det(H) = 36 - 9 = 27 > 0',
          annotation: 'Sylvester criterion: both leading principal minors positive → $H$ is positive definite. Eigenvalues are both positive (trace $= 12 > 0$, det $= 27 > 0$ confirms this).',
        },
        {
          expression: 'H \\succ 0 \\implies f \\text{ has a LOCAL MINIMUM at } (1,1)',
          annotation: 'The quadratic form $\\mathbf{h}^\\top H \\mathbf{h} > 0$ for all directions $\\mathbf{h}$, so the function curves upward in all directions from $(1,1)$. It is indeed the global minimum of $f$ on the region where $x,y > 0$.',
        },
        {
          expression: 'f(1,1) = 1 + 1 - 3 = -1',
          annotation: 'The local minimum value is $-1$. Near $(1,1)$, $f(1+h_1, 1+h_2) \\approx -1 + \\frac{1}{2}(h_1,h_2)H(h_1,h_2)^\\top > -1$ for small $(h_1,h_2) \\neq 0$.',
        },
      ],
      answer: 'H = [[6,-3],[-3,6]] at (1,1). H is positive definite (det=27>0, trace=12>0). Critical point at (1,1) is a local minimum with f(1,1) = -1.',
    },
  ],

  mentalModel: [
    '$Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$: off-diagonal entries are half the cross-term coefficients.',
    'Definiteness is determined by eigenvalue signs: all positive = PD, mixed = indefinite.',
    'Principal Axes Theorem: rotate to eigenvector axes to eliminate cross terms.',
    'Sylvester criterion: test PD via leading principal minors (no eigenvalue computation needed).',
  ],

  checkpoints: [
    { id: 'cp-la4-007-1', label: 'Read intuition: quadratic form and definiteness', type: 'read' },
    { id: 'cp-la4-007-2', label: 'Read math: Principal Axes Theorem proof', type: 'read' },
    { id: 'cp-la4-007-3', label: 'Read rigor: Sylvester\'s Law of Inertia', type: 'read' },
    { id: 'cp-la4-007-4', label: 'Run quadratic form level sets lab', type: 'lab' },
    { id: 'cp-la4-007-5', label: 'Run Sylvester criterion and optimization lab', type: 'lab' },
    { id: 'cp-la4-007-6', label: 'Work example 1: classify conic, find semi-axes', type: 'example' },
    { id: 'cp-la4-007-7', label: 'Work example 2: Sylvester on 3×3 matrix', type: 'example' },
    { id: 'cp-la4-007-8', label: 'Solve challenge: classify by parameter $k$', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'assess-la4-007-1',
        type: 'computation',
        text: 'Classify and analyze the conic $Q(x,y) = 4x^2 - 4xy + 4y^2 = 6$. (a) Write the matrix $A$. (b) Find the eigenvalues and classify the conic. (c) Find the semi-axes lengths. (d) Find the principal axis directions.',
        answer: '(a) $A = \\begin{bmatrix}4&-2\\\\-2&4\\end{bmatrix}$. (b) $\\lambda = 2, 6$ (both positive → ellipse). (c) Semi-axes: $\\sqrt{6/2} = \\sqrt{3}$ and $\\sqrt{6/6} = 1$. (d) For $\\lambda=2$: $\\mathbf{q}_1 = (1,1)^\\top/\\sqrt{2}$ (at $45°$); for $\\lambda=6$: $\\mathbf{q}_2 = (1,-1)^\\top/\\sqrt{2}$ (at $-45°$).',
        hint: 'Off-diagonal entry of $A$ is half the $xy$ coefficient: $-4/2 = -2$.',
      },
      {
        id: 'assess-la4-007-2',
        type: 'proof',
        text: 'Prove that every Gram matrix $A = B^\\top B$ is positive semidefinite. Then state the additional condition on $B$ that makes $A$ positive definite (not just semidefinite).',
        answer: 'For any $\\mathbf{x} \\neq 0$: $\\mathbf{x}^\\top A \\mathbf{x} = \\mathbf{x}^\\top B^\\top B \\mathbf{x} = (B\\mathbf{x})^\\top(B\\mathbf{x}) = \\|B\\mathbf{x}\\|^2 \\geq 0$. This proves PSD. For PD: need $\\|B\\mathbf{x}\\|^2 > 0$ for all $\\mathbf{x} \\neq 0$, which requires $\\ker(B) = \\{0\\}$, i.e., $B$ has full column rank (columns are linearly independent).',
        hint: 'Use the identity $\\mathbf{x}^\\top B^\\top B \\mathbf{x} = \\|B\\mathbf{x}\\|^2$ and recall when a norm can be zero.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la4-007-1',
      type: 'choice',
      text: 'A symmetric matrix with all positive eigenvalues is:',
      options: ['Indefinite', 'Positive semidefinite but not definite', 'Positive definite', 'Negative definite'],
      answer: 'Positive definite',
      hints: ['Positive definite means $\\mathbf{x}^\\top A \\mathbf{x} > 0$ for all $\\mathbf{x} \\neq 0$. In the eigenvector basis, the quadratic form is $\\sum \\lambda_i y_i^2 > 0$ when all $\\lambda_i > 0$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-007-2',
      type: 'choice',
      text: 'The symmetric matrix of the quadratic form $Q(x,y) = x^2 + 6xy + 2y^2$ is:',
      options: [
        '$\\begin{bmatrix}1&6\\\\6&2\\end{bmatrix}$',
        '$\\begin{bmatrix}1&3\\\\3&2\\end{bmatrix}$',
        '$\\begin{bmatrix}1&0\\\\0&2\\end{bmatrix}$',
        '$\\begin{bmatrix}2&6\\\\6&1\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}1&3\\\\3&2\\end{bmatrix}$',
      hints: ['The rule: diagonal entries are the pure-square coefficients; off-diagonal entries are half the cross-term coefficient ($6/2 = 3$). Verify: $[x, y]\\begin{bmatrix}1&3\\\\3&2\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix} = x^2 + 3xy + 3xy + 2y^2 = x^2 + 6xy + 2y^2$ ✓'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-007-3',
      type: 'choice',
      text: 'Sylvester\'s criterion tests positive definiteness using:',
      options: ['Eigenvalues (all must be positive)', 'The trace (must be positive)', 'All leading principal minors (must be positive)', 'The rank (must equal $n$)'],
      answer: 'All leading principal minors (must be positive)',
      hints: ['A leading principal minor is the determinant of a top-left $k\\times k$ submatrix. Sylvester says $A$ is PD iff all $n$ such minors are positive. This avoids solving the characteristic polynomial.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-007-4',
      type: 'choice',
      text: 'The conic defined by $\\mathbf{x}^\\top A \\mathbf{x} = 1$ where $A$ has eigenvalues $-3$ and $5$ is:',
      options: ['An ellipse', 'A circle', 'A hyperbola', 'A parabola'],
      answer: 'A hyperbola',
      hints: ['In the principal axis coordinates: $-3y_1^2 + 5y_2^2 = 1$, or $\\frac{y_2^2}{1/5} - \\frac{y_1^2}{1/3} = 1$ — standard hyperbola form. Mixed eigenvalue signs (indefinite matrix) always give a hyperbola.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-007-5',
      type: 'choice',
      text: 'For $Q(x,y) = x^2 + 6xy + 9y^2$, the matrix is $A = \\begin{bmatrix}1&3\\\\3&9\\end{bmatrix}$. What is $\\det(A)$ and what type is $Q$?',
      options: [
        '$\\det(A) = -18$, indefinite',
        '$\\det(A) = 0$, positive semidefinite (not definite)',
        '$\\det(A) = 9$, positive definite',
        '$\\det(A) = 0$, negative semidefinite',
      ],
      answer: '$\\det(A) = 0$, positive semidefinite (not definite)',
      hints: ['$\\det(A) = 9 - 9 = 0$. One eigenvalue is 0 (rank-1 matrix). The other eigenvalue is $\\text{tr}(A) = 10 > 0$. So eigenvalues are $0$ and $10$ — PSD but not PD. Note: $Q(x,y) = (x+3y)^2 \\geq 0$, with $Q = 0$ along the line $x = -3y$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-007-6',
      type: 'choice',
      text: 'At a critical point of $f(x,y)$, the Hessian is $H = \\begin{bmatrix}3&2\\\\2&2\\end{bmatrix}$. What is the nature of the critical point?',
      options: [
        'Local maximum — $H$ is negative definite',
        'Saddle point — $H$ is indefinite',
        'Local minimum — $H$ is positive definite',
        'Inconclusive — $H$ is positive semidefinite',
      ],
      answer: 'Local minimum — $H$ is positive definite',
      hints: ['Sylvester: $M_1 = 3 > 0$, $M_2 = \\det(H) = 6 - 4 = 2 > 0$. All leading minors positive → $H$ is PD → local minimum. Eigenvalues of $H$: trace $= 5$, det $= 2$, so $\\lambda = (5 \\pm \\sqrt{17})/2$, both positive.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-007-7',
      type: 'choice',
      text: 'The Principal Axes Theorem says that for $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$, the change $\\mathbf{x} = Q_0 \\mathbf{y}$ (where $Q_0$ has orthonormal eigenvectors as columns) gives:',
      options: [
        '$Q(\\mathbf{x}) = \\mathbf{y}^\\top \\mathbf{y}$ — eliminates the matrix entirely',
        '$Q(\\mathbf{x}) = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2$ — purely diagonal, no cross terms',
        '$Q(\\mathbf{x}) = \\mathbf{y}^\\top Q_0^\\top A Q_0 \\mathbf{y}$ — same form, just renamed variables',
        '$Q(\\mathbf{x}) = \\sum_{i \\neq j} \\lambda_i y_i y_j$ — cross terms only',
      ],
      answer: '$Q(\\mathbf{x}) = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2$ — purely diagonal, no cross terms',
      hints: ['$(Q_0 \\mathbf{y})^\\top A (Q_0 \\mathbf{y}) = \\mathbf{y}^\\top (Q_0^\\top A Q_0) \\mathbf{y} = \\mathbf{y}^\\top \\Lambda \\mathbf{y} = \\sum \\lambda_i y_i^2$. Since $Q_0^\\top A Q_0 = \\Lambda$ (diagonal), all cross terms vanish. The rotation aligns the coordinate axes with the principal axes of the quadratic form.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-007-8',
      type: 'choice',
      text: 'A sample covariance matrix $\\Sigma$ is formed as $\\Sigma = \\frac{1}{N}X^\\top X$ where $X$ is an $N \\times p$ data matrix. Which statement is always true?',
      options: [
        '$\\Sigma$ is positive definite if $N > p$',
        '$\\Sigma$ is symmetric and positive semidefinite for any $X$',
        '$\\Sigma$ is invertible for any $X$',
        '$\\Sigma$ is a diagonal matrix if the features are uncorrelated',
      ],
      answer: '$\\Sigma$ is symmetric and positive semidefinite for any $X$',
      hints: ['$\\Sigma = \\frac{1}{N}X^\\top X$ is a Gram matrix (scaled). For any $\\mathbf{v}$: $\\mathbf{v}^\\top \\Sigma \\mathbf{v} = \\frac{1}{N}\\|X\\mathbf{v}\\|^2 \\geq 0$ — always PSD. Not always PD: if $p > N$ (more features than samples), $X$ cannot have full column rank, so some $X\\mathbf{v} = 0$. Not always diagonal (that\'s only when features are uncorrelated).'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-007-9',
      type: 'choice',
      text: 'Sylvester\'s Law of Inertia states that for a congruence transformation $A \\mapsto P^\\top A P$ (any invertible $P$), which quantities are preserved?',
      options: [
        'The eigenvalues of $A$',
        'The determinant of $A$',
        'The signature $(n_+, n_-, n_0)$: counts of positive, negative, and zero eigenvalues',
        'The trace of $A$',
      ],
      answer: 'The signature $(n_+, n_-, n_0)$: counts of positive, negative, and zero eigenvalues',
      hints: ['Congruence ($P^\\top A P$) does NOT preserve eigenvalues or trace in general (those are similarity invariants from $P^{-1}AP$). What it preserves is the signature — the count of positive, negative, and zero eigenvalues. This means no matter how you diagonalize a quadratic form (by eigenvalues or completing the square), you get the same number of positive and negative squares.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la4-007-10',
      type: 'choice',
      text: 'A CNC stiffness matrix $K$ satisfies $\\mathbf{x}^\\top K \\mathbf{x} > 0$ for all $\\mathbf{x} \\neq 0$. This means the stored elastic energy $U = \\frac{1}{2}\\mathbf{x}^\\top K \\mathbf{x}$ is:',
      options: [
        'Always zero — no energy is stored in a rigid structure',
        'Could be negative — springs can release energy',
        'Always positive for any nonzero deformation — guaranteed by positive definiteness of $K$',
        'Bounded above — $K$ positive definite limits maximum energy',
      ],
      answer: 'Always positive for any nonzero deformation — guaranteed by positive definiteness of $K$',
      hints: ['Positive definiteness of $K$ means $\\mathbf{x}^\\top K \\mathbf{x} > 0$ for all $\\mathbf{x} \\neq 0$, so $U = \\frac{1}{2}\\mathbf{x}^\\top K \\mathbf{x} > 0$ whenever the structure deforms ($\\mathbf{x} \\neq 0$). This is physically required: elastic energy must be positive (deformation stores energy, which is released when the load is removed). If $K$ were indefinite, some deformation modes would have negative energy — physically impossible for a stable structure.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Write the symmetric matrix of any quadratic form, classify it by eigenvalue signs or Sylvester\'s criterion, apply the Principal Axes Theorem to eliminate cross terms, and use the Hessian to classify critical points.',
    explainVerbally: 'Explain why an indefinite Hessian means a saddle point (the form takes positive and negative values depending on direction), and why a PD Hessian means a minimum.',
    detectIncorrectApplication: 'Catch errors like placing the full xy-coefficient on the off-diagonal (should be half), or concluding that trace > 0 implies positive definiteness (need all minors positive).',
    transferToUnfamiliar: 'Apply quadratic form analysis to tolerance ellipsoids, elastic energy, covariance matrices, and any optimization problem where the second-order behavior is needed.',
  },

  misconceptions: [
    {
      falseBelief: 'The matrix of $ax^2 + bxy + cy^2$ has $b$ on the off-diagonal entries.',
      whyStudentsThinkIt: 'Students read off the coefficient $b$ directly without halving it, ignoring that $\\mathbf{x}^\\top A\\mathbf{x}$ generates the cross term as $2A_{12}xy$.',
      correctionExample: 'For $Q = x^2 + 6xy + 2y^2$: $\\mathbf{x}^\\top \\begin{bmatrix}1&3\\\\3&2\\end{bmatrix}\\mathbf{x} = x^2 + 3xy + 3yx + 2y^2 = x^2 + 6xy + 2y^2$ ✓. The two off-diagonal terms each contribute $3xy$, together giving $6xy$. So off-diagonal entry $= 6/2 = 3$.',
      contrastCase: 'Using $b = 6$ on the off-diagonal gives $\\begin{bmatrix}1&6\\\\6&2\\end{bmatrix}$, which computes $x^2 + 12xy + 2y^2$ — double the cross term.',
    },
    {
      falseBelief: 'If $\\text{tr}(A) > 0$, then $A$ is positive definite.',
      whyStudentsThinkIt: 'Trace = sum of eigenvalues; if the sum is positive, students assume all must be positive.',
      correctionExample: '$A = \\begin{bmatrix}2&3\\\\3&2\\end{bmatrix}$ has $\\text{tr}(A) = 4 > 0$ but eigenvalues $-1$ and $5$ — indefinite! $Q(1,-1) = 2 - 6 + 2 = -2 < 0$.',
      contrastCase: 'Positive definiteness requires ALL eigenvalues to be positive (or equivalently all Sylvester minors positive). Positive trace only ensures the sum is positive, not each individually.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You have a function $f(\\mathbf{x})$ with a critical point and want to determine if it is a minimum, maximum, or saddle.',
      competingTechniques: 'Plot the function, evaluate on a grid, use first-order conditions only.',
      whyThisTechniqueWins: 'Compute the Hessian $H$ at the critical point and test it for definiteness. PD → minimum, ND → maximum, indefinite → saddle. This is exact (no grid resolution) and extends to any dimension — plotting fails in $n > 3$ dimensions.',
    },
    {
      situation: 'You need to classify a conic section $ax^2 + bxy + cy^2 = 1$ without graphing.',
      competingTechniques: 'Complete the square by hand, rotate until no cross terms appear, use the discriminant $b^2 - 4ac$.',
      whyThisTechniqueWins: 'All three methods are equivalent, but the matrix/eigenvalue approach extends to $n$ dimensions (ellipsoids, hyperboloids), handles the rotation automatically (eigenvectors give the principal axes), and connects directly to PD classification. The discriminant trick $b^2 - 4ac$ is 2D only.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}', meaning: 'Quadratic form — A must be symmetric; off-diagonal entries = half the cross-term coefficient' },
      { symbol: 'A \\succ 0', meaning: 'Positive definite: Q(x) > 0 for all x ≠ 0; all eigenvalues positive' },
      { symbol: '(n_+, n_-, n_0)', meaning: 'Signature of A — count of positive, negative, and zero eigenvalues; invariant under congruence' },
      { symbol: 'a_i = \\sqrt{c/\\lambda_i}', meaning: 'Semi-axis length of the ellipse Q(x)=c in the ith principal direction' },
      { symbol: 'H = [\\partial^2 f/\\partial x_i \\partial x_j]', meaning: 'Hessian matrix at a critical point — its definiteness determines whether the point is a min, max, or saddle' },
    ],
    rulesOfThumb: [
      'Off-diagonal entry of A = half the cross-term coefficient (the factor of 2 in xᵀAx doubles it back).',
      'Positive definite ↔ all eigenvalues positive ↔ all Sylvester leading principal minors positive.',
      'Mixed eigenvalue signs = indefinite = saddle in optimization.',
      'The principal axes of the level set Q=c are the eigenvectors; the semi-axes have length √(c/λᵢ).',
      'Trace > 0 is NOT sufficient for positive definiteness; it only checks that eigenvalue sum is positive.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la4-006',
        label: 'Spectral Theorem',
        note: 'Quadratic form analysis is a direct application of the Spectral Theorem: orthogonal diagonalization $A = Q\\Lambda Q^\\top$ eliminates cross terms under the change of variables $\\mathbf{x} = Q\\mathbf{y}$.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-008',
        label: 'Pseudoinverse',
        note: 'The pseudoinverse solves the least squares problem, which minimizes the quadratic form $\\|A\\mathbf{x} - \\mathbf{b}\\|^2 = (A\\mathbf{x}-\\mathbf{b})^\\top(A\\mathbf{x}-\\mathbf{b})$. When $A$ does not have full column rank, the quadratic form $\\mathbf{x}^\\top A^\\top A \\mathbf{x}$ is positive semidefinite (zero eigenvalue), and the pseudoinverse finds the minimum-norm minimizer.',
      },
    ],
  },

  debugging: [
    {
      commonError: 'Setting the off-diagonal entry of $A$ equal to the full $xy$ coefficient instead of half.',
      symptom: 'The quadratic form $\\mathbf{x}^\\top A \\mathbf{x}$ does not match the original expression — the cross term appears doubled.',
      whyItHappened: 'The matrix product $\\mathbf{x}^\\top A \\mathbf{x}$ generates $2A_{12}$ as the coefficient of $x_1 x_2$ (because there are two off-diagonal paths: $A_{12}x_1 x_2$ and $A_{21}x_2 x_1 = A_{12}x_1 x_2$). So $A_{12} = $ (coefficient of $x_1 x_2$)$/2$.',
      repairStrategy: 'Always verify: expand $\\mathbf{x}^\\top A \\mathbf{x}$ symbolically and check the cross term equals the original. Alternatively, build $A$ by the formula: diagonal $= $ pure square coefficients; off-diagonal $= $ half the cross-term coefficient.',
    },
    {
      commonError: 'Concluding PD from positive eigenvalue sum (trace) or positive diagonal entries alone.',
      symptom: 'Incorrectly classify an indefinite or PSD matrix as positive definite, leading to wrong optimization conclusions (false minimum).',
      whyItHappened: 'These are necessary but not sufficient conditions. Positive trace means the sum of eigenvalues is positive; positive diagonal entries mean $Q(\\mathbf{e}_i) > 0$ on coordinate axes — but neither rules out a negative eigenvalue in an off-axis direction.',
      repairStrategy: 'Use the full Sylvester criterion (all leading principal minors positive) or compute eigenvalues directly with `np.linalg.eigvalsh`. The condition `min(eigenvalues) > 0` is the definitive PD test.',
    },
  ],
};
