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
  },

  intuition: {
    prose: [
      'Where you are in the story: operator theory described what bounded linear operators look like on abstract spaces. But we have been sloppy about one crucial question: what exactly are these spaces? You cannot do analysis — limits, sequences, projections — without a completeness guarantee. The rational numbers $\\mathbb{Q}$ have an addition and a distance, but the sequence $3, 3.1, 3.14, 3.141, \\ldots$ converges to $\\pi$, which is not rational. If you are doing calculus on $\\mathbb{Q}$, your limits can escape the space. Banach spaces fix this by requiring completeness: every Cauchy sequence must converge to something inside the space.',
      'A **Banach space** is a normed vector space that is complete: every Cauchy sequence (a sequence where $\\|\\mathbf{x}_m - \\mathbf{x}_n\\| \\to 0$ as $m, n \\to \\infty$) converges to a limit in the space. The integers $\\mathbb{Z}$ are not a Banach space (not a vector space). The rationals $\\mathbb{Q}$ are not complete. The reals $\\mathbb{R}$, the $n$-dimensional spaces $\\mathbb{R}^n$, and the function spaces $L^p[a,b]$ (p-integrable functions with $\\|f\\|_p = (\\int |f|^p)^{1/p}$) are all Banach spaces. Completeness is what makes the intermediate value theorem, the Picard-Lindelöf existence theorem for ODEs, and the open mapping theorem for linear operators all work.',
      'A **Hilbert space** is a Banach space whose norm comes from an inner product: $\\|\\mathbf{x}\\|^2 = \\langle \\mathbf{x}, \\mathbf{x}\\rangle$. The inner product adds angles and orthogonality — the geometry of Euclidean space — to the abstract setting. The key examples: $\\mathbb{R}^n$ with the dot product; the space $\\ell^2$ of square-summable sequences with $\\langle \\mathbf{a}, \\mathbf{b}\\rangle = \\sum_n a_n b_n$; and the function space $L^2[a,b]$ with $\\langle f, g \\rangle = \\int_a^b f(x)g(x)\\,dx$. Note that $L^p$ for $p \\neq 2$ is a Banach space but NOT a Hilbert space: you cannot define an inner product from the $p$-norm for $p \\neq 2$.',
      'Start with $H = \\mathbb{R}^2$ to build intuition. The subspace $M = \\{(x,0) : x \\in \\mathbb{R}\\}$ (the $x$-axis) is closed. Take $\\mathbf{v} = (3,4)$. The orthogonal projection onto $M$ is $P_M \\mathbf{v} = (3,0)$, and the remainder $(0,4)$ is perpendicular to $M$: $(0,4) \\cdot (x,0) = 0$ for all $(x,0) \\in M$. Pythagorean theorem: $\\|(3,4)\\|^2 = \\|(3,0)\\|^2 + \\|(0,4)\\|^2 = 9+16 = 25$. The functional $f(x_1,x_2) = 3x_1+4x_2$ can be written $f(\\mathbf{v}) = \\langle \\mathbf{v}, (3,4)\\rangle$: the representing vector for $f$ is the vector $(3,4)$ whose components are the coefficients of $f$. All three observations — projection theorem, Pythagorean theorem, Riesz representation — extend to any Hilbert space.',
      '**Predict before reading on:** In $L^2[0,1]$, the functions $e_1(x) = 1$ and $e_2(x) = \\sqrt{3}(2x-1)$ form an orthonormal set. What are the Fourier coefficients (inner products $\\langle f, e_1 \\rangle$ and $\\langle f, e_2 \\rangle$) of $f(x) = x^2$ in this basis? What polynomial does the truncated Fourier expansion give?',
      'Computing: $c_1 = \\langle x^2, 1\\rangle = \\int_0^1 x^2\\,dx = 1/3$. And $c_2 = \\langle x^2, \\sqrt{3}(2x-1)\\rangle = \\sqrt{3}\\int_0^1 x^2(2x-1)\\,dx = \\sqrt{3}(2/4 - 1/3) = \\sqrt{3}/12$. The two-term approximation is $c_1 e_1 + c_2 e_2 = \\frac{1}{3} + \\frac{\\sqrt{3}}{12}\\cdot\\sqrt{3}(2x-1) = \\frac{1}{3} + \\frac{3}{12}(2x-1) = x - \\frac{1}{12}$. This is the best linear approximation to $x^2$ in the $L^2$ sense — the least-squares polynomial fit. Parseval\'s identity says $\\|f\\|^2 = \\sum_n |c_n|^2$: if you sum all Fourier coefficients, you reconstruct the full $L^2$ norm.',
      'The **Riesz representation theorem** is the Hilbert space version of the dual space result from la10-001. For any bounded linear functional $f: H \\to \\mathbb{R}$, there is a unique $\\mathbf{y} \\in H$ such that $f(\\mathbf{x}) = \\langle \\mathbf{x}, \\mathbf{y}\\rangle$ for all $\\mathbf{x}$. This gives a canonical isomorphism $H^* \\cong H$: Hilbert spaces are self-dual. In la10-001, we saw that the natural isomorphism $V \\cong V^*$ requires choosing an inner product (not canonical). Here, the Hilbert space comes equipped with its own inner product, so the isomorphism $H \\cong H^*$ is part of the structure. In machine learning, reproducing kernel Hilbert spaces use this: every evaluation functional $f \mapsto f(x_0)$ is a bounded linear functional, so it is represented by a "kernel" function $k(\\cdot, x_0) \\in H$.',
      'The **projection theorem** is the geometric heart of Hilbert space theory: for any closed subspace $M \\subseteq H$ and any $\\mathbf{x} \\in H$, the nearest point in $M$ to $\\mathbf{x}$ exists and is unique. This nearest point $P_M \\mathbf{x}$ is the orthogonal projection, and the error $\\mathbf{x} - P_M \\mathbf{x}$ is perpendicular to all of $M$. In $\\mathbb{R}^n$ this is obvious; in an infinite-dimensional Hilbert space it requires the completeness of $H$ and the closedness of $M$ — without these, the infimum might not be achieved. Least-squares regression, the Gram-Schmidt process, Fourier series truncation, and principal component analysis are all special cases of orthogonal projection in a Hilbert space.',
      'Where this is heading: this lesson concludes the linear algebra course. You started with systems of equations and row reduction (Chapter 1), built up to the spectral theorem for symmetric matrices (Chapter 3), learned the numerical algorithms that make the theory computable (Chapters 7-9), saw the applications that motivate the whole subject (Chapter 8), and finally arrived at the abstract framework — dual spaces, tensors, exterior algebra, operator theory, Hilbert spaces — that unifies everything. The structures you studied are not just tools for solving equations: they are the mathematical language in which physics, signal processing, machine learning, and differential geometry are written.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Work in a Hilbert Space (4 Steps)',
        body: '1. **Identify the inner product.** Write $\\langle \\cdot, \\cdot \\rangle$ explicitly and verify three properties: bilinearity/sesquilinearity, symmetry ($\\langle x,y\\rangle = \\overline{\\langle y,x\\rangle}$), positive-definiteness ($\\langle x,x\\rangle > 0$ for $x \\neq 0$). The induced norm is $\\|x\\| = \\sqrt{\\langle x,x\\rangle}$.\n2. **Build an orthonormal basis (ONB).** Apply Gram-Schmidt to a spanning set $\\{v_1, \\ldots\\}$: subtract projections, normalize. Verify $\\langle e_i, e_j \\rangle = \\delta_{ij}$.\n3. **Compute Fourier coefficients.** For any $\\mathbf{x} \\in H$, the coefficient on $e_k$ is $c_k = \\langle \\mathbf{x}, e_k \\rangle$. The projection onto $\\text{span}\\{e_1,\\ldots,e_N\\}$ is $P_N\\mathbf{x} = \\sum_{k=1}^N c_k\\, e_k$.\n4. **Use Parseval\'s identity.** For a complete ONB: $\\|\\mathbf{x}\\|^2 = \\sum_k |c_k|^2$. For a finite truncation: $\\|\\mathbf{x} - P_N\\mathbf{x}\\|^2 = \\|\\mathbf{x}\\|^2 - \\sum_{k=1}^N |c_k|^2$ (Bessel\'s inequality gives $\\leq$, not $=$, for incomplete sets).',
      },
      {
        type: 'sequencing',
        title: 'Lesson 5 of 5 — Advanced Theory',
        body: '**Previous (Lesson 4):** Operator Theory — bounded operators, spectrum, compact operators, spectral theorem.\n**This lesson:** Banach and Hilbert Spaces — completeness, projection theorem, Parseval\'s identity, Riesz representation, $L^2$ space.\n**This is the final lesson of the linear algebra course.**',
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
        id: 'PythonNotebook',
        title: 'Hilbert Spaces in Python',
        mathBridge: 'Compute Fourier coefficients as inner products, verify Parseval\'s identity, and demonstrate orthogonal projection as best approximation.',
        caption: 'Fourier expansion = orthogonal projection in L²; Parseval\'s identity verifies completeness.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Fourier coefficients as inner products',
              prose: [
                'Compute Fourier coefficients of f(x)=x² in an orthonormal polynomial basis on [0,1], verify Parseval\'s identity, and compare the projection against the true function.',
                '`x = np.linspace(0,1,500)`. Legendre polynomial basis (orthonormal on [0,1]): `from scipy.special import legendre; phi_k = legendre(k)`. Coefficients: `c_k = np.trapz(x**2 * phi_k(2*x-1) * np.sqrt(2*k+1), x)` (change of variable to [-1,1]). Partial sums: `f_approx = sum(c_k * phi_k(2*x-1)*sqrt(2k+1) for k)`.',
                'Parseval: `sum(c_k**2) ≈ np.trapz((x**2)**2, x) = 1/5`. Verify by computing partial sums of `c_k²` — they should approach 1/5 as more terms are added. Plot the approximation vs true x² for k=1,2,3,5 terms. With 3 Legendre polynomials, x² is represented exactly (since x² is a degree-2 polynomial, in the 3-dimensional span of {1,x,x²}).',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from numpy.polynomial import legendre

# Build an orthonormal polynomial basis on [0,1] via Gram-Schmidt
# (shifted Legendre polynomials, normalized)
x_pts = np.linspace(0, 1, 1000)
dx = x_pts[1] - x_pts[0]

def inner_product(f, g):
    """L² inner product on [0,1] via numerical integration"""
    return np.trapz(f * g, x_pts)

# Build orthonormal basis up to degree 4
polys_raw = [x_pts**k for k in range(5)]
ONB = []
for p in polys_raw:
    q = p.copy()
    for e in ONB:
        q = q - inner_product(q, e) * e
    norm = np.sqrt(inner_product(q, q))
    if norm > 1e-10:
        ONB.append(q / norm)

# Target function
f = x_pts**2

# Fourier coefficients
coeffs = [inner_product(f, e) for e in ONB]
print("Fourier coefficients c_k = <x², e_k>:")
for k, c in enumerate(coeffs):
    print(f"  k={k}: c_{k} = {c:.6f}")

# Parseval's identity: ||f||² = sum |c_k|²
norm_f_sq = inner_product(f, f)
parseval_sum = sum(c**2 for c in coeffs)
print(f"\\n||f||² = {norm_f_sq:.6f}")
print(f"∑|c_k|² = {parseval_sum:.6f}  (Parseval: should match)")

# Plot projections onto growing subspaces
fig, axes = plt.subplots(1, len(ONB), figsize=(15, 3))
approx = np.zeros_like(x_pts)
for k, (c, e) in enumerate(zip(coeffs, ONB)):
    approx = approx + c * e
    axes[k].plot(x_pts, f, 'b-', lw=2, label='x²')
    axes[k].plot(x_pts, approx, 'r--', lw=2, label=f'{k+1}-term approx')
    err = np.sqrt(inner_product((f - approx)**2 / inner_product(f,f), np.ones_like(x_pts)))
    axes[k].set_title(f'{k+1} terms\\nL² error={err:.3f}')
    axes[k].legend(fontsize=7)
plt.tight_layout(); plt.show()
`,
            },
            {
              id: 2,

              cellTitle: 'Riesz representation: functionals ↔ vectors',
              prose: [
                'Verify the Riesz representation theorem in R^n: every bounded linear functional is an inner product with some fixed vector, and that vector has norm equal to the operator norm of the functional.',
                'A linear functional f on R^n is a row vector: `f = np.array([a,b,c,...])`. Riesz representation: the "representing vector" is `v_f = f` (in standard basis). Verify: `f @ x == v_f @ x` for all x. Operator norm: `max(abs(f@x)/norm(x) for random x)` should converge to `norm(f)` — confirming the operator norm equals the norm of the representing vector.',
                '`f = np.array([2,-1,3])`. Representing vector: `v = np.array([2,-1,3])`. Operator norm: `max over unit sphere = norm(f) = sqrt(4+1+9) = sqrt(14)`. Verify: `np.linalg.norm(f)` equals the maximum of `abs(f@x)` over `x` with `norm(x)=1`. The maximizer is `x = v/norm(v)` — the functional is maximised in the direction of its own representing vector.',
              ],
              code: `import numpy as np

# In R^n, every linear functional f: R^n -> R has the form f(x) = <x, y>
# The representing vector y is just the coefficients of f

# Define a functional f(x) = 2x1 - x2 + 3x3 in R^3
coeffs = np.array([2., -1., 3.])
def f(x):
    return coeffs @ x

# The representing vector y is just coeffs
y_riesz = coeffs.copy()
print("Linear functional f(x) = 2x₁ - x₂ + 3x₃")
print(f"Representing vector y = {y_riesz}")

# Verify: f(x) = <x, y> for several test vectors
test_vecs = [np.array([1.,0.,0.]), np.array([1.,2.,3.]), np.random.randn(3)]
for x in test_vecs:
    fval = f(x)
    inner = np.dot(x, y_riesz)
    print(f"  f({x.round(2)}) = {fval:.4f},  <x,y> = {inner:.4f},  match: {np.isclose(fval, inner)}")

# Norm of functional = operator norm = ||y||
norm_f = np.max([abs(f(x)) for x in [np.random.randn(3) for _ in range(10000)]
                 if np.linalg.norm(x) < 1.001 and np.linalg.norm(x) > 0.999])
norm_y = np.linalg.norm(y_riesz)
print(f"\\nOperator norm ||f|| ≈ {norm_f:.4f}")
print(f"||y_Riesz|| = {norm_y:.4f}")
print(f"||f|| = ||y|| : {np.isclose(norm_f, norm_y, atol=0.02)}")
print("\\nThis is the Riesz representation theorem: every functional is an inner product with a vector of the same norm.")
`,
            },
          ],
        },
      },
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
              prose: [
                'Verify Parseval\'s identity: sum of squared Fourier coefficients = squared norm.',
                'In R^n with orthonormal basis Q (columns): `c = Q\'*v` (Fourier coefficients). Parseval: `sum(c.^2) == norm(v)^2`. Verify: `norm(c)^2` vs `norm(v)^2`. Also: `Q*c == v` (reconstruct v from coefficients). This is the finite-dimensional version — it works exactly because Q is orthonormal.',
                'Test with several vectors and several orthonormal bases (standard, random Gram-Schmidt, eigenvectors of A). Parseval holds for ALL orthonormal bases — the identity `‖v‖² = Σcₖ²` is basis-independent. This is the discrete version of Parseval\'s theorem for Fourier series: the ℓ² norm of the coefficients equals the L² norm of the function.',
              ],
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
              prose: [
                'Approximate a function by its first k Fourier modes (projection in L^2).',
                'Discretise [0,1]: `x = linspace(0,1,200); f = x - 0.5` (sawtooth-like). Fourier basis: `phi_k(x) = sqrt(2)*sin(k*pi*x)` (orthonormal on [0,1]). Coefficient: `c_k = trapz(f .* phi_k(x), x)`. Partial sum: `f_k = sum(c_k * phi_k(x) for k=1:K)`.',
                'Plot `f` and `f_1, f_3, f_5, f_10` overlaid. The approximation improves with more modes. The Gibbs phenomenon: at a discontinuity, the truncated Fourier series overshoots by ~9% regardless of how many terms you take. `norm(f - f_K)` tracks convergence: plot vs K to confirm the convergence rate is O(1/K) for this piecewise-smooth function.',
              ],
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
      '**Weak convergence and compactness.** A sequence $\\mathbf{x}_n \\in H$ converges weakly ($\\mathbf{x}_n \\rightharpoonup \\mathbf{x}$) if $\\langle \\mathbf{x}_n, \\mathbf{y}\\rangle \\to \\langle \\mathbf{x}, \\mathbf{y}\\rangle$ for all $\\mathbf{y} \\in H$. In finite dimensions, weak and strong convergence coincide. In infinite dimensions they differ: the standard ONB $\\{\\mathbf{e}_n\\}$ in $\\ell^2$ converges weakly to 0 (since $\\langle \\mathbf{e}_n, \\mathbf{y}\\rangle = y_n \\to 0$ for any $\\mathbf{y} \\in \\ell^2$) but $\\|\\mathbf{e}_n\\| = 1 \\not\\to 0$ — no strong convergence. The closed unit ball in a Hilbert space is weakly compact (every bounded sequence has a weakly convergent subsequence). This is the key tool in the calculus of variations: a minimizing sequence $\\mathbf{x}_n$ with $\\|\\mathbf{x}_n\\| \\leq C$ has a weakly convergent subsequence, and for weakly lower semicontinuous functionals, the weak limit is the minimizer.',
      '**Sobolev spaces and elliptic PDE.** The Sobolev space $H^k(\\Omega)$ consists of $L^2(\\Omega)$ functions whose weak derivatives up to order $k$ are also in $L^2(\\Omega)$, with inner product $\\langle u, v\\rangle_{H^k} = \\sum_{|\\alpha|\\leq k} \\int_\\Omega D^\\alpha u \\cdot D^\\alpha v\\,dx$. For the Poisson equation $-\\Delta u = f$: the natural variational (weak) formulation is $\\int \\nabla u \\cdot \\nabla v = \\int fv$ for all $v \\in H_0^1(\\Omega)$. By the Lax-Milgram theorem (Hilbert space generalization of matrix invertibility), if the bilinear form on the left is coercive and bounded, a unique solution exists in $H^1_0$. All elliptic PDE theory rests on this structure: Sobolev spaces are exactly the Hilbert spaces where weak solutions naturally live.',
      '**Abstract Fourier analysis.** Every separable Hilbert space is unitarily isomorphic to $\\ell^2$ — there is, up to isomorphism, only one separable infinite-dimensional Hilbert space. The content of this result is that any complete ONB serves as a "coordinate system": $L^2[0,2\\pi]$ with trigonometric basis, $L^2(\\mathbb{R})$ with Hermite functions, $L^2(\\mathbb{S}^2)$ with spherical harmonics, $\\ell^2$ with standard basis — all isomorphic as Hilbert spaces. The choice of ONB encodes the geometry of the underlying domain and the symmetries of the problem. The Fourier transform on $L^2(\\mathbb{R})$ is unitary — it preserves the $L^2$ norm (Plancherel theorem) and diagonalizes differentiation ($\\widehat{f\'} = 2\\pi i \\xi \\hat{f}$), making convolution equations into pointwise multiplication equations.',
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
      problem: 'Prove that a Banach space norm $\\|\\cdot\\|$ comes from an inner product if and only if it satisfies the parallelogram law: $\\|\\mathbf{x}+\\mathbf{y}\\|^2 + \\|\\mathbf{x}-\\mathbf{y}\\|^2 = 2\\|\\mathbf{x}\\|^2 + 2\\|\\mathbf{y}\\|^2$.',
      walkthrough: [
        {
          expression: '\\|\\mathbf{x}+\\mathbf{y}\\|^2 = \\langle\\mathbf{x}+\\mathbf{y},\\mathbf{x}+\\mathbf{y}\\rangle = \\|\\mathbf{x}\\|^2 + 2\\langle\\mathbf{x},\\mathbf{y}\\rangle + \\|\\mathbf{y}\\|^2',
          annotation: 'Forward direction ($\\Rightarrow$): expand $\\|\\mathbf{x}\\pm\\mathbf{y}\\|^2$ using bilinearity and symmetry of the inner product.',
        },
        {
          expression: '\\|\\mathbf{x}+\\mathbf{y}\\|^2 + \\|\\mathbf{x}-\\mathbf{y}\\|^2 = 2\\|\\mathbf{x}\\|^2 + 2\\|\\mathbf{y}\\|^2 \\quad (\\text{cross terms cancel})',
          annotation: 'Add the two expansions: the $\\pm 2\\langle\\mathbf{x},\\mathbf{y}\\rangle$ terms cancel. This proves the parallelogram law for any inner product norm.',
        },
        {
          expression: '\\langle\\mathbf{x},\\mathbf{y}\\rangle := \\tfrac{1}{4}(\\|\\mathbf{x}+\\mathbf{y}\\|^2 - \\|\\mathbf{x}-\\mathbf{y}\\|^2) \\quad (\\text{polarization identity, real case})',
          annotation: 'Reverse direction ($\\Leftarrow$): define the proposed inner product via the polarization identity. This formula expresses the inner product in terms of the norm — if the parallelogram law holds, this definition is consistent.',
        },
        {
          expression: '\\langle\\mathbf{x},\\mathbf{x}\\rangle = \\tfrac{1}{4}(\\|2\\mathbf{x}\\|^2 - 0) = \\|\\mathbf{x}\\|^2 \\; \\checkmark, \\quad \\langle\\mathbf{x},\\mathbf{y}\\rangle = \\langle\\mathbf{y},\\mathbf{x}\\rangle \\; \\checkmark',
          annotation: 'Positive-definiteness follows: $\\langle\\mathbf{x},\\mathbf{x}\\rangle = \\|\\mathbf{x}\\|^2 \\geq 0$, equals 0 iff $\\|\\mathbf{x}\\|=0$ iff $\\mathbf{x}=0$. Symmetry holds by definition. The hard part (bilinearity) requires using the parallelogram law for the additivity $\\langle\\mathbf{x}+\\mathbf{z},\\mathbf{y}\\rangle = \\langle\\mathbf{x},\\mathbf{y}\\rangle + \\langle\\mathbf{z},\\mathbf{y}\\rangle$ — it goes through but requires several applications of the law.',
        },
      ],
    },
    {
      id: 'ch-la10-005-2',
      title: 'Orthogonal projection in L² with explicit Gram-Schmidt',
      difficulty: 'easy',
      problem: 'In $L^2[0,1]$, project $f(x)=x^3$ onto $M = \\text{span}\\{1, x\\}$. First build an ONB for $M$, then find the Fourier coefficients and the best approximation.',
      walkthrough: [
        {
          expression: 'e_1 = 1 \\text{ (normalized: } \\|1\\|^2 = \\int_0^1 1\\,dx = 1)',
          annotation: 'First ONB element: the constant function 1 has $L^2$ norm 1, so it is already normalized.',
        },
        {
          expression: 'x - \\langle x, e_1\\rangle e_1 = x - \\tfrac{1}{2} \\quad (\\langle x, 1\\rangle = \\int_0^1 x\\,dx = 1/2)',
          annotation: 'Gram-Schmidt: orthogonalize $x$ against $e_1$. Subtract the projection $\\langle x,e_1\\rangle e_1 = \\frac{1}{2}$.',
        },
        {
          expression: 'e_2 = \\frac{x-1/2}{\\|x-1/2\\|} = \\sqrt{12}(x-1/2) \\quad (\\|x-1/2\\|^2 = 1/12)',
          annotation: 'Normalize: $\\|x-\\frac{1}{2}\\|^2 = \\int_0^1(x-\\frac{1}{2})^2 dx = 1/12$. So $e_2 = \\sqrt{12}(x-\\frac{1}{2})$.',
        },
        {
          expression: 'c_1 = \\langle x^3, 1\\rangle = \\tfrac{1}{4}, \\quad c_2 = \\langle x^3, \\sqrt{12}(x-\\tfrac{1}{2})\\rangle = \\sqrt{12}\\cdot\\tfrac{1}{20} = \\tfrac{\\sqrt{12}}{20}',
          annotation: 'Fourier coefficients: $c_1 = \\int_0^1 x^3 dx = 1/4$. For $c_2$: $\\int_0^1 x^3\\sqrt{12}(x-\\frac{1}{2})dx = \\sqrt{12}(\\int_0^1 x^4 dx - \\frac{1}{2}\\int_0^1 x^3 dx) = \\sqrt{12}(\\frac{1}{5}-\\frac{1}{8}) = \\sqrt{12}\\cdot\\frac{3}{40}$.',
        },
        {
          expression: 'Pf = c_1 e_1 + c_2 e_2 = \\tfrac{1}{4} + \\tfrac{\\sqrt{12}}{20}\\cdot\\sqrt{12}(x-\\tfrac{1}{2}) = \\tfrac{1}{4} + \\tfrac{12}{20}(x-\\tfrac{1}{2}) = \\tfrac{3}{5}x - \\tfrac{1}{20}',
          annotation: 'Assemble the projection. Check: for the constant term, $\\frac{1}{4} + \\frac{12}{20}(-\\frac{1}{2}) = \\frac{1}{4} - \\frac{3}{10} = -\\frac{1}{20}$ ✓. The best linear approximation to $x^3$ in $L^2[0,1]$ is $\\frac{3}{5}x - \\frac{1}{20}$.',
        },
      ],
    },
    {
      id: 'ch-la10-005-3',
      title: 'Parseval vs Bessel: truncated Fourier series',
      difficulty: 'medium',
      problem: 'In $L^2[0,1]$ with the standard ONB $\\{1, \\sqrt{2}\\cos(2\\pi kx), \\sqrt{2}\\sin(2\\pi kx)\\}_{k\\geq 1}$, explain why $\\sum_{k=0}^{N}|c_k|^2 \\leq \\|f\\|^2$ (Bessel) but $\\sum_{k=0}^{\\infty}|c_k|^2 = \\|f\\|^2$ (Parseval). Show how to use the difference to compute approximation error.',
      walkthrough: [
        {
          expression: 'P_N f = \\sum_{k=0}^N c_k e_k \\in \\text{span}\\{e_0, \\ldots, e_N\\} = M_N',
          annotation: 'The $N$-term Fourier expansion is the orthogonal projection of $f$ onto the finite-dimensional subspace $M_N$ spanned by the first $N$ basis functions. By the projection theorem, this is the best $N$-term approximation in $L^2$.',
        },
        {
          expression: '\\|f\\|^2 = \\|P_N f\\|^2 + \\|f - P_N f\\|^2 = \\sum_{k=0}^N|c_k|^2 + \\|f-P_Nf\\|^2',
          annotation: 'Pythagorean theorem in $H$: since $P_Nf \in M_N$ and $f - P_Nf \perp M_N$, the squared norms add. So $\\|f\\|^2 = \\|P_Nf\\|^2 + \\|f-P_Nf\\|^2$.',
        },
        {
          expression: '\\|f-P_Nf\\|^2 \\geq 0 \\Rightarrow \\sum_{k=0}^N|c_k|^2 \\leq \\|f\\|^2 \\quad (\\textbf{Bessel})',
          annotation: 'Since the error squared is non-negative, the partial sum of squared coefficients cannot exceed the total squared norm. This is Bessel\'s inequality — valid for any orthonormal set, complete or not.',
        },
        {
          expression: '\\text{Parseval (complete ONB)}: \\lim_{N\\to\\infty}\\|f-P_Nf\\|^2 = 0 \\Rightarrow \\|f\\|^2 = \\sum_{k=0}^\\infty |c_k|^2',
          annotation: 'A complete ONB (one that spans a dense subspace) satisfies: the projection $P_Nf$ converges to $f$ in $L^2$ norm as $N\\to\\infty$. The completeness of the ONB is what upgrades Bessel\'s inequality to Parseval\'s equality. The truncation error is $\\|f-P_Nf\\|^2 = \\|f\\|^2 - \\sum_{k=0}^N |c_k|^2$.',
        },
      ],
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
      competingTechniques: 'Average nearby samples (no structural knowledge used) vs project $y$ onto $M$: take $\\hat{f} = P_M y$, the unique nearest point in $M$ to $y$.',
      whyThisTechniqueWins: 'The projection theorem guarantees $P_M y$ is the UNIQUE nearest point in $M$ to $y$. Since $f \\in M$ and $\\epsilon \\perp M$ approximately, $P_M y \\approx f$. This is the mathematical basis of Wiener filtering and band-limited denoising.',
    },
    {
      situation: 'In machine learning, you want to compute $K(x,y) = \\phi(x)^\\top\\phi(y)$ where $\\phi$ maps inputs to a very high-dimensional feature space. How does the RKHS reproducing property let you skip computing $\\phi$ explicitly?',
      competingTechniques: 'Explicitly compute and store $\\phi(x)$ for each input then take the dot product vs use the kernel $K(x,y)$ directly via the reproducing property $f(x) = \\langle f, k_x \\rangle_H$.',
      whyThisTechniqueWins: 'By the Riesz theorem, every evaluation functional in the RKHS is an inner product. This means you only need to evaluate $K(x,y)$ — never the explicit feature map $\\phi$. This is the kernel trick in SVMs and Gaussian processes.',
    },
  ],

  semantics: {
    core: [
      { symbol: '(H, \\langle\\cdot,\\cdot\\rangle)', meaning: 'Hilbert space: complete inner product space. Norm $\\|\\mathbf{x}\\|^2 = \\langle\\mathbf{x},\\mathbf{x}\\rangle$. Adds geometry (angles, orthogonality) to the Banach space structure. Examples: $\\mathbb{R}^n$, $\\ell^2$, $L^2(\\Omega)$.' },
      { symbol: 'P_M \\mathbf{x}', meaning: 'Orthogonal projection: unique nearest point in closed subspace $M$ to $\\mathbf{x}$. Decomposition: $\\mathbf{x} = P_M\\mathbf{x} + \\mathbf{x}^\\perp$ with $\\mathbf{x}^\\perp \\perp M$. Pythagorean: $\\|\\mathbf{x}\\|^2 = \\|P_M\\mathbf{x}\\|^2 + \\|\\mathbf{x}^\\perp\\|^2$.' },
      { symbol: '\\|\\mathbf{x}\\|^2 = \\sum_n |c_n|^2', meaning: 'Parseval\'s identity: for a complete ONB, squared norm = sum of squared Fourier coefficients. Bessel\'s inequality ($\\leq$) holds for any orthonormal set; equality requires completeness.' },
      { symbol: 'H^* \\cong H', meaning: 'Riesz representation: every bounded functional $f: H \\to \\mathbb{F}$ equals $\\langle \\cdot, \\mathbf{y}\\rangle$ for unique $\\mathbf{y}$ with $\\|\\mathbf{y}\\| = \\|f\\|$. Hilbert spaces are self-dual.' },
      { symbol: 'L^2(\\Omega)', meaning: 'Space of square-integrable functions: inner product $\\langle f,g\\rangle = \\int_\\Omega fg$. Canonical infinite-dimensional Hilbert space containing Fourier series, wavefunctions, and PDE solutions.' },
      { symbol: '\\mathbf{x}_n \\rightharpoonup \\mathbf{x}', meaning: 'Weak convergence: $\\langle\\mathbf{x}_n,\\mathbf{y}\\rangle \\to \\langle\\mathbf{x},\\mathbf{y}\\rangle$ for all $\\mathbf{y}$. Weaker than norm convergence; closed unit ball is weakly compact. Used in calculus of variations to extract convergent subsequences.' },
    ],
    rulesOfThumb: [
      'To project $f$ onto a finite-dimensional subspace with ONB $\\{e_k\\}$: compute inner products $c_k = \\langle f, e_k\\rangle$ and form $Pf = \\sum_k c_k e_k$. Never solve a linear system unless the basis is not orthonormal.',
      'Truncation error from Parseval: $\\|f - P_N f\\|^2 = \\|f\\|^2 - \\sum_{k=1}^N|c_k|^2$. To bound the error to within $\\varepsilon$, find the $N$ where the tail $\\|f\\|^2 - \\sum_1^N |c_k|^2 < \\varepsilon^2$.',
      'Only $L^2$ among $L^p$ is a Hilbert space. Check the parallelogram law to verify: $L^1$ and $L^\\infty$ fail it. This explains why sparsity ($L^1$) and robustness ($L^\\infty$) do not have "projection" geometry.',
      'The Riesz vector has the same norm as the functional: $\\|f\\| = \\|\\mathbf{y}\\|$. This gives a quick way to compute the operator norm of any linear functional on a Hilbert space.',
      'Projection onto a non-closed subspace may not exist. In $L^2[0,1]$, the subspace of ALL polynomials is not closed (its closure is all of $L^2$ by Stone-Weierstrass). Polynomials of degree $\\leq n$ ARE closed (finite-dimensional).',
    ],
  },

  spiral: {
    recoveryPoints: ['la6-001', 'la10-004'],
    futureLinks: [],
  },

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
