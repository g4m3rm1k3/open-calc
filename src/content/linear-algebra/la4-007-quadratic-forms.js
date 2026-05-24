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
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**What is a quadratic form?** A quadratic form is a function $Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ where $A$ is a symmetric $n \\times n$ matrix and $\\mathbf{x} \\in \\mathbb{R}^n$. In two variables, every expression $ax^2 + bxy + cy^2$ is a quadratic form with $A = \\begin{bmatrix}a & b/2 \\\\ b/2 & c\\end{bmatrix}$ — the off-diagonal entries are half the cross-term coefficient.',
      '**Definiteness classifies the form.** A quadratic form (and its matrix $A$) is:\n- **Positive definite (PD):** $Q(\\mathbf{x}) > 0$ for all $\\mathbf{x} \\neq 0$ — all eigenvalues positive\n- **Positive semidefinite (PSD):** $Q(\\mathbf{x}) \\geq 0$ for all $\\mathbf{x}$ — all eigenvalues $\\geq 0$\n- **Negative definite (ND):** $Q(\\mathbf{x}) < 0$ for all $\\mathbf{x} \\neq 0$ — all eigenvalues negative\n- **Indefinite:** $Q$ takes both positive and negative values — mixed eigenvalue signs',
      '**The Principal Axes Theorem.** By the Spectral Theorem, $A = Q\\Lambda Q^\\top$. Change variables: $\\mathbf{x} = Q\\mathbf{y}$ (rotate to the eigenvector coordinate system). Then:\n\n$Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x} = (Q\\mathbf{y})^\\top A (Q\\mathbf{y}) = \\mathbf{y}^\\top Q^\\top A Q \\mathbf{y} = \\mathbf{y}^\\top \\Lambda \\mathbf{y} = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2$\n\nIn the rotated coordinates, the cross terms vanish. The form is purely diagonal — just a sum of scaled squares.',
      '**Classifying conics.** The equation $Q(\\mathbf{x}) = 1$ defines a level set of the quadratic form. In the principal axis coordinates ($y_1, y_2$), it becomes $\\lambda_1 y_1^2 + \\lambda_2 y_2^2 = 1$. If both $\\lambda_i > 0$: ellipse (ratio of semi-axes = $1/\\sqrt{\\lambda_i}$). If $\\lambda_1 > 0 > \\lambda_2$: hyperbola. If any $\\lambda_i = 0$: degenerate.',
      '**CNC applications of quadratic forms.** (1) **Cutting energy and tool wear:** the energy delivered to the workpiece per unit volume is $U = \\frac{1}{2}\\boldsymbol{\\epsilon}^\\top C \\boldsymbol{\\epsilon}$ where $\\boldsymbol{\\epsilon}$ is the strain vector and $C$ is the symmetric stiffness tensor — a quadratic form. Positive definiteness of $C$ guarantees $U > 0$ (energy stored, not extracted). (2) **Optimization of surface finish:** the surface roughness objective function $f(\\mathbf{p})$ near the optimal parameter vector $\\mathbf{p}^*$ behaves like $f \\approx f^* + (\\mathbf{p}-\\mathbf{p}^*)^\\top H (\\mathbf{p}-\\mathbf{p}^*)$ where $H$ is the Hessian (symmetric). Positive definiteness of $H$ confirms the parameter is a minimum of roughness, not a saddle. (3) **Tolerance ellipsoids:** the set of positions $\\mathbf{x}$ within tolerance of a nominal point satisfies $\\mathbf{x}^\\top \\Sigma^{-1} \\mathbf{x} \\leq \\chi^2_{\\alpha,n}$ — a quadratic form with matrix $\\Sigma^{-1}$. The tolerance ellipsoid semi-axes are $\\sqrt{\\lambda_i \\cdot \\chi^2_\\alpha}$ in the principal directions, showing which axes have tighter tolerances.',
    ],
    callouts: [
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
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Quadratic Forms and Level Sets',
        mathBridge: 'Compute eigenvalues to classify a quadratic form and find the principal axes.',
        caption: 'Eigenvalues determine the shape; eigenvectors determine the orientation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Classify and diagonalize a quadratic form',
              prose: ['Q(x) = 3x1^2 + 4x1*x2 + 3x2^2 = x^T * A * x. What conic is Q = 1?'],
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
              prose: ['Test A and B for positive definiteness using leading principal minors.'],
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
              prose: ['Find the rotation Q that eliminates cross terms in 3x1^2 + 4x1*x2 + 3x2^2.'],
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
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cell_type: 'code',
              source: `import numpy as np
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
              cell_type: 'code',
              source: `import numpy as np

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
              cell_type: 'code',
              source: `import numpy as np
from scipy.optimize import minimize

# CNC surface finish optimization via Hessian analysis
# Objective: minimize surface roughness Ra as function of (feed f, speed v)
# Near optimal point, Ra(f,v) ≈ Ra* + [df dv] H [df;dv]
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
  ],

  mentalModel: [
    '$Q(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$: off-diagonal entries are half the cross-term coefficients.',
    'Definiteness is determined by eigenvalue signs: all positive = PD, mixed = indefinite.',
    'Principal Axes Theorem: rotate to eigenvector axes to eliminate cross terms.',
    'Sylvester criterion: test PD via leading principal minors (no eigenvalue computation needed).',
  ],

  checkpoints: [
    { id: 'cp-la4-007-1', question: 'How do you read off the matrix $A$ from the expression $2x^2 + 6xy + 5y^2$?', answer: '$A = \\begin{bmatrix}2&3\\\\3&5\\end{bmatrix}$ — diagonal entries are coefficients of $x^2, y^2$; off-diagonal entries are half the coefficient of $xy$.' },
    { id: 'cp-la4-007-2', question: 'What does the Principal Axes Theorem do to a quadratic form?', answer: 'Rotates coordinates to eliminate cross terms, leaving $\\sum \\lambda_i y_i^2$.' },
    { id: 'cp-la4-007-3', question: 'What kind of conic is $Q(\\mathbf{x}) = 1$ if $A$ has one positive and one negative eigenvalue?', answer: 'Hyperbola.' },
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
  ],
};
