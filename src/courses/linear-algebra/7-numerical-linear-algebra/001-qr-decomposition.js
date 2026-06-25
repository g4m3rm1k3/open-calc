import gramSchmidtUrl from '../diagrams/la-gram-schmidt-before-after.svg?url';
import qrGridUrl from '../diagrams/la-qr-factorization-grid.svg?url';
import qrAlgoUrl from '../diagrams/la-qr-algorithm-iteration.svg?url';

export default {
  id: 'la7-001',
  slug: 'qr-decomposition',
  chapter: 'la7',
  order: 1,
  title: 'QR Decomposition',
  subtitle: 'Any matrix $A$ factors as $A = QR$ where $Q$ has orthonormal columns and $R$ is upper triangular. This is the workhorse algorithm for least squares, eigenvalue problems, and numerical stability.',
  tags: ['QR decomposition', 'Gram-Schmidt', 'orthonormal', 'upper triangular', 'least squares', 'Householder', 'numerical methods', 'thin QR'],
  aliases: 'QR decomposition Gram-Schmidt orthonormal upper triangular least squares Householder thin full numerical methods',

  hook: {
    question: "You have a matrix $A$ and need to solve the least-squares problem $\\min_\\mathbf{x} \\|A\\mathbf{x} - \\mathbf{b}\\|$. The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ work, but squaring the matrix squares the condition number. Is there a better way?",
    realWorldContext: "QR decomposition is used in virtually every numerical linear algebra computation. MATLAB's backslash operator solves least squares via QR. The QR algorithm (repeatedly applying QR decomposition) is the standard method for computing all eigenvalues of a matrix. In statistics, the QR decomposition of the design matrix is the numerically stable way to fit regression models. In GPS and phone positioning, QR is used to solve overdetermined systems from multiple satellite signals. SVD (QR is an ingredient), eigenvalue solvers (QR iteration), and least squares all depend on it.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      '**Where you are in the story.** Chapters 1–6 built your conceptual toolkit: vector spaces, linear maps, eigenvalues, orthogonality, projections. You learned what matrices *mean*. Chapter 7 asks a harder question: how do we compute with them reliably? Real matrices have rounding errors, near-zero pivots, and condition numbers in the billions. The factorizations you will learn here — QR, Cholesky, Schur, Householder — are not just theoretical objects. They are the algorithms that run inside NumPy, MATLAB, and every scientific computing library. This lesson is the most important of the chapter: QR decomposition underpins least squares, eigenvalue computation, and stability analysis all at once.',

      '**The problem with squaring the condition number.** You need to fit a line to 100 data points — a classic least squares problem. The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ look clean on paper. But forming $A^\\top A$ has a hidden cost: it squares the condition number. If $\\kappa(A) = 10^8$ (plausible for a polynomial regression matrix), then $\\kappa(A^\\top A) = 10^{16}$ — right at the limit of 64-bit floating point. Your normal equations answer will be pure noise. Every numerical linear algebra library avoids normal equations for precisely this reason. QR decomposition is the fix.',

      '**The geometric idea: build an orthonormal basis for the column space.** The columns of $A$ span some subspace, but they are not in general orthogonal or unit-length. Gram-Schmidt orthogonalization takes those columns and systematically builds a set of orthonormal vectors $\\mathbf{q}_1, \\mathbf{q}_2, \\ldots$ that span the same space. The first column direction becomes $\\mathbf{q}_1$. The second column, minus whatever piece lies along $\\mathbf{q}_1$, becomes $\\mathbf{q}_2$. And so on. By the end, you have a matrix $Q$ whose columns are orthonormal — and the key insight is that $Q$ and the original $A$ span exactly the same column space.',
      ] },
      { type: 'image', src: gramSchmidtUrl,
        alt: 'Two tilted vectors v1, v2 next to the orthonormal basis e1, e2 that Gram-Schmidt produces from them',
        caption: 'Gram-Schmidt straightens any basis into an orthonormal one — same span, but now perpendicular and unit length.' },
      { type: 'prose', paragraphs: [
      '**The R matrix is just a record of what you computed.** As you carry out Gram-Schmidt, you compute two types of numbers: norms (how long is each new vector?) and inner products (how much of each original column lies along each $\\mathbf{q}_i$?). Pack those numbers into a matrix $R$ — norms on the diagonal, inner products above the diagonal, zeros below — and you have $A = QR$. Nothing magic: $R$ is a ledger of the Gram-Schmidt arithmetic. The upper triangular shape of $R$ reflects the fact that column $j$ only projects onto $\\mathbf{q}_1$ through $\\mathbf{q}_{j-1}$, never onto later ones.',
      ] },
      { type: 'image', src: qrGridUrl,
        alt: 'Matrix grid showing A = Q times R, with Q columns highlighted as orthonormal and R upper triangular with forced zero entries below the diagonal',
        caption: 'R is a ledger: diagonal entries are norms, upper entries are inner products, and the zeros below are forced by the order columns are processed.' },
      { type: 'prose', paragraphs: [
      '**Predict before reading on.** For $A = \\begin{bmatrix}3 & 1 \\\\ 4 & 0\\end{bmatrix}$, what is $r_{11}$? Write your answer before moving on — $r_{11}$ is the first thing you compute in Gram-Schmidt. Think about what $r_{11}$ represents in terms of the first column of $A$.',

      '**Least squares becomes a back-substitution.** With $A = QR$, the least squares problem $\\min \\|A\\mathbf{x} - \\mathbf{b}\\|$ simplifies dramatically. Substituting: $\\|QR\\mathbf{x} - \\mathbf{b}\\|^2 = \\|R\\mathbf{x} - Q^\\top\\mathbf{b}\\|^2 + \\|\\mathbf{b} - QQ^\\top\\mathbf{b}\\|^2$. The second term does not involve $\\mathbf{x}$, so you minimize the first term, which means solving $R\\mathbf{x} = Q^\\top\\mathbf{b}$. That is a triangular system — solve it by back substitution in $O(n^2)$ time. The condition number of $R$ is $\\kappa(A)$, not $\\kappa(A)^2$. That is why every serious numerical library does this.',

      '**Why Gram-Schmidt is not what is actually used.** You will implement Gram-Schmidt because it explains QR conceptually. But classical Gram-Schmidt has a nasty problem: small floating-point errors accumulate when you subtract projections. After 20–30 steps on a large matrix, the computed $\\mathbf{q}$ vectors are no longer orthogonal — they drift. Modified Gram-Schmidt re-orthogonalizes at each step and is better, but still not perfect. The production algorithm is Householder reflections: instead of building $Q$ column by column, you apply a sequence of orthogonal reflections that zero out subdiagonals of $A$ column by column. Householder QR is fully backward stable and is what NumPy and MATLAB actually run.',

      '**The QR algorithm: a surprise application.** There is a completely different use of QR that has nothing to do with least squares. To find all eigenvalues of a matrix $A$: decompose $A_0 = A$ as $Q_0 R_0$, then form $A_1 = R_0 Q_0$ (flip the order). Decompose $A_1 = Q_1 R_1$, form $A_2 = R_1 Q_1$. Repeat. Each step is a similarity transformation, so eigenvalues are preserved. Under mild conditions, the sequence $A_k$ converges to upper triangular form with eigenvalues on the diagonal. This is how LAPACK computes eigenvalues of dense matrices. A single factorization method powers both least squares and eigenvalue computation.',
      ] },
      { type: 'image', src: qrAlgoUrl,
        alt: 'Three matrix grids showing the QR algorithm: a dense matrix, a quieter one, and a converged upper-triangular matrix with eigenvalues on the diagonal',
        caption: 'Each QR step is a similarity transform — eigenvalues are preserved while off-diagonal entries decay toward zero.' },
      { type: 'prose', paragraphs: [
      '**Where this is heading.** The next lesson is Cholesky decomposition — the special-case version of QR when $A$ is symmetric positive definite. You will see that the Cholesky factor of $A^\\top A$ is exactly the $R$ from the QR of $A$ (because $A^\\top A = R^\\top Q^\\top QR = R^\\top R$). After Cholesky, you will study how these factorizations degrade as matrices become ill-conditioned — that is the topic of matrix norms and conditioning.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'QR Decomposition with NumPy',
        mathBridge: 'Use numpy to compute QR, verify orthogonality, solve least squares, and compare condition numbers between the QR approach and normal equations.',
        caption: 'np.linalg.qr uses Householder reflections internally — the same algorithm behind LAPACK.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Compute QR and verify',
              prose: [
                'Factor A = QR using numpy, verify Q has orthonormal columns, and check that QR reconstructs A exactly.',
                '`Q, R = np.linalg.qr(A)` returns the thin QR by default. Verify orthonormality: `np.allclose(Q.T @ Q, np.eye(Q.shape[1]))`. Verify reconstruction: `np.allclose(Q @ R, A)`. Check R is upper triangular: `np.allclose(R, np.triu(R))`.',
                'For a tall matrix (m > n), Q has shape (m, n) and R has shape (n, n). The columns of Q form an orthonormal basis for the column space of A — this is Gram-Schmidt, but computed stably via Householder reflections. `np.linalg.qr(A, mode="complete")` gives the full Q (m×m) with the extra columns spanning the left null space of A.',
              ],
              code: `import numpy as np

A = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 10],
              [1, 0,  1]], dtype=float)

Q, R = np.linalg.qr(A)   # full QR by default

print("Q shape:", Q.shape, " — orthonormal columns")
print("R shape:", R.shape, " — upper triangular")
print()
print("Q.T @ Q (should be identity):")
print(np.round(Q.T @ Q, 10))
print()
print("||QR - A|| (should be ~0):", np.linalg.norm(Q @ R - A))
`,
            },
            {
              id: 2,
              cellTitle: 'Least squares via QR vs normal equations',
              prose: [
                'Fit a line to 4 data points using both QR and the normal equations. Compare the answers and the condition numbers.',
                'QR approach: `Q, R = np.linalg.qr(A); x_qr = np.linalg.solve(R, Q.T @ b)`. Normal equations: `x_normal = np.linalg.solve(A.T @ A, A.T @ b)`. Both should give the same answer for well-conditioned A. The condition number of A.T@A is `cond(A)^2` — that squaring is why the normal equations are numerically dangerous.',
                'Print both: `np.linalg.cond(A)` and `np.linalg.cond(A.T @ A)`. For a typical design matrix with condition 10, the normal equations have condition 100. For condition 10^6, the normal equations have condition 10^12 — beyond double precision. The QR approach keeps condition at `cond(A)` because R shares condition with A, not A.T@A.',
              ],
              code: `import numpy as np

# Design matrix: fit y = c0 + c1*t
t = np.array([0, 1, 2, 3], dtype=float)
A = np.column_stack([np.ones(4), t])
b = np.array([1, 2, 2, 4], dtype=float)

# QR approach
Q, R = np.linalg.qr(A, mode='reduced')
x_qr = np.linalg.solve(R, Q.T @ b)

# Normal equations
x_normal = np.linalg.solve(A.T @ A, A.T @ b)

print("QR solution:      ", np.round(x_qr, 6))
print("Normal equations: ", np.round(x_normal, 6))
print("Difference:       ", np.linalg.norm(x_qr - x_normal))
print()
print("Condition numbers:")
print("  kappa(A)     =", round(np.linalg.cond(A), 2))
print("  kappa(A.T@A) =", round(np.linalg.cond(A.T @ A), 2))
print("  kappa(R)     =", round(np.linalg.cond(R), 2))
`,
            },
            {
              id: 3,
              cellTitle: 'Condition number disaster with near-singular A',
              prose: [
                'For an ill-conditioned design matrix, the normal equations amplify errors catastrophically while QR stays stable.',
                'Build an ill-conditioned matrix: `A = np.vander(np.linspace(0,1,10), 8)` (Vandermonde matrix for polynomial fitting has very high condition number). `np.linalg.cond(A)` will be >10^10. Solve with QR: `x_qr = np.linalg.lstsq(A, b, rcond=None)[0]`. Solve with normal equations: `x_ne = np.linalg.solve(A.T @ A, A.T @ b)`.',
                'Compare residuals: `np.linalg.norm(A @ x_qr - b)` vs `np.linalg.norm(A @ x_ne - b)`. The QR residual will be much smaller. The bar chart of coefficients shows the normal-equations solution has wild oscillations (the ill-conditioning has amplified noise into large, spurious coefficient values), while QR gives smoother, more reliable coefficients.',
              ],
              code: `import numpy as np

# Polynomial design matrix (Vandermonde) — gets ill-conditioned fast
n = 8
t = np.linspace(0, 1, 12)
A = np.column_stack([t**k for k in range(n)])

print("Vandermonde matrix, degree", n-1)
print("kappa(A)     = {:.2e}".format(np.linalg.cond(A)))
print("kappa(A.T@A) = {:.2e}".format(np.linalg.cond(A.T @ A)))
print()
print("If kappa(A.T@A) > 1e16, normal equations give garbage")
print("QR approach uses kappa(A) — far more headroom")
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'QR Decomposition — OpenMAT',
        mathBridge: 'Compute QR, verify orthogonality, and solve least squares in MATLAB-style syntax.',
        caption: 'Q has orthonormal columns; R is upper triangular; Q^T Q = I.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Compute QR and verify',
              prose: [
                'Factor A = QR, verify Q has orthonormal columns, reconstruct A.',
                '`[Q, R] = qr(A, 0)` gives the thin (economy) QR. Verify: `norm(Q\'*Q - eye(size(Q,2)))` (should be ~1e-15), `norm(Q*R - A)` (should be ~1e-15), `istriu(R)` (should be 1). The `0` flag requests economy QR; without it MATLAB returns the full square Q.',
                'For a 4×3 matrix, economy QR gives Q as 4×3 and R as 3×3. Full QR gives Q as 4×4 and R as 4×3. The extra column in full Q spans the left null space. The diagonal entries of R are the "lengths" of the Gram-Schmidt basis vectors — they should all be positive (with MATLAB\'s default convention).',
              ],
              code: `A = [1  2  3;
     4  5  6;
     7  8 10;
     1  0  1]

[Q, R] = qr(A, 0)
disp('Q^T Q should be identity:')
round(Q' * Q, 10)
disp('Reconstruction error ||QR - A||:')
norm(A - Q*R)
`,
            },
            {
              id: 2,
              cellTitle: 'Least squares via QR',
              prose: [
                'Solve least-squares problem min||Ax-b|| using QR decomposition.',
                'The QR least squares formula: `[Q,R] = qr(A,0); x = R \\ (Q\'*b)`. This is equivalent to `x = A\\b` (MATLAB uses QR internally for overdetermined systems). The formula comes from: Ax=b → QRx=b → Rx=Q\'b → `x = R\\(Q\'*b)`.',
                'Compare residuals: `norm(A*x - b)` using QR should equal `norm(A*(A\\b) - b)` to machine precision. The speedup comes when you have many right-hand sides b: factor once with QR, then each new b requires only `R\\(Q\'*b)` — two triangular solves instead of a full factorization.',
              ],
              code: `A = [1 1; 1 2; 1 3; 1 4]
b = [1; 2; 2; 4]

[Q, R] = qr(A, 0)
x_qr = R \\ (Q' * b)
disp('Least squares solution via QR:')
x_qr

x_normal = (A' * A) \\ (A' * b)
disp('Via normal equations (should match):')
x_normal
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Compute QR via Gram-Schmidt (5 Steps)',
        body: '**Given:** An $m \\times n$ matrix $A = [\\mathbf{a}_1 | \\cdots | \\mathbf{a}_n]$ with linearly independent columns.\n**Step 1.** Set $\\tilde{\\mathbf{q}}_1 = \\mathbf{a}_1$. Compute $r_{11} = \\|\\tilde{\\mathbf{q}}_1\\|$ and normalize: $\\mathbf{q}_1 = \\tilde{\\mathbf{q}}_1 / r_{11}$.\n**Step 2.** For $j = 2, \\ldots, n$: compute each off-diagonal $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ for $i = 1, \\ldots, j-1$.\n**Step 3.** Orthogonalize: $\\tilde{\\mathbf{q}}_j = \\mathbf{a}_j - \\sum_{i=1}^{j-1} r_{ij}\\mathbf{q}_i$.\n**Step 4.** Compute $r_{jj} = \\|\\tilde{\\mathbf{q}}_j\\|$ and normalize: $\\mathbf{q}_j = \\tilde{\\mathbf{q}}_j / r_{jj}$.\n**Step 5.** Assemble $Q = [\\mathbf{q}_1 | \\cdots | \\mathbf{q}_n]$ and $R$ with entries $r_{ij}$ in positions $(i,j)$, zeros below the diagonal. Verify: $Q^\\top Q = I_n$ and $QR = A$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 1 of 7 — Numerical Linear Algebra',
        body: '**Chapter 6 (Abstract Algebra):** Abstract vector spaces, bases, coordinates, change of basis.\n**Chapter 7 (Numerical Methods), this chapter:** How to compute reliably — factorizations that control condition numbers.\n**This lesson:** QR decomposition — orthonormal column basis, least squares, QR eigenvalue algorithm.\n**Next:** Cholesky decomposition — the efficient factorization for symmetric positive definite matrices.',
      },
      {
        type: 'insight',
        title: 'QR via Gram-Schmidt: The Recipe',
        body: 'Given columns $\\mathbf{a}_1, \\ldots, \\mathbf{a}_n$ of $A$:\n1. $\\tilde{\\mathbf{q}}_1 = \\mathbf{a}_1$, $\\mathbf{q}_1 = \\tilde{\\mathbf{q}}_1 / \\|\\tilde{\\mathbf{q}}_1\\|$\n2. For $j = 2, \\ldots, n$: subtract projections onto $\\mathbf{q}_1, \\ldots, \\mathbf{q}_{j-1}$:\n   $\\tilde{\\mathbf{q}}_j = \\mathbf{a}_j - (\\mathbf{q}_1^\\top \\mathbf{a}_j)\\mathbf{q}_1 - \\cdots - (\\mathbf{q}_{j-1}^\\top \\mathbf{a}_j)\\mathbf{q}_{j-1}$\n   $\\mathbf{q}_j = \\tilde{\\mathbf{q}}_j / \\|\\tilde{\\mathbf{q}}_j\\|$\n\nThe $R$ matrix: $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ for $i < j$, $r_{jj} = \\|\\tilde{\\mathbf{q}}_j\\|$, $r_{ij} = 0$ for $i > j$.',
      },
      {
        type: 'insight',
        title: 'Least Squares via QR',
        body: 'To solve $\\min \\|A\\mathbf{x}-\\mathbf{b}\\|$ with $A = QR$:\n1. Compute $Q^\\top \\mathbf{b}$ ($m$ inner products)\n2. Solve $R\\mathbf{x} = Q^\\top \\mathbf{b}$ by back substitution\n\nCondition number: $\\kappa(R) = \\kappa(A)$ instead of $\\kappa(A)^2$ from normal equations.',
      },
      {
        type: 'warning',
        title: 'Gram-Schmidt vs Householder',
        body: 'Classical Gram-Schmidt is unstable: small errors compound as you subtract projections. Modified Gram-Schmidt is better but still not optimal. **Householder reflections** are the numerically stable way to compute QR in practice — they use orthogonal reflections $H = I - 2\\mathbf{u}\\mathbf{u}^\\top$ to zero out subdiagonal entries column by column. NumPy and MATLAB use Householder QR.',
      },
    ],
  },

  math: {
    prose: [
      '**Existence and uniqueness.** QR factorization exists for any matrix $A$. If $A$ has full column rank, the thin QR with positive diagonal of $R$ is unique. If $A$ is square and invertible, the full QR is unique (under the convention that diagonal entries of $R$ are positive).',
      '**QR algorithm for eigenvalues.** The QR algorithm iterates: starting with $A_0 = A$, decompose $A_k = Q_k R_k$, then set $A_{k+1} = R_k Q_k = Q_k^{-1} A_k Q_k$ (a similarity transformation!). Under mild conditions, $A_k$ converges to the Schur form (upper triangular with eigenvalues on the diagonal). The practical version adds shifts for faster convergence and is the standard eigensolver for dense matrices.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Existence of QR',
        body: 'Every $m \\times n$ matrix $A$ ($m \\geq n$) has a factorization $A = QR$ where:\n• $Q$ is $m \\times m$ orthogonal (full QR)\n• $R$ is $m \\times n$ upper triangular\n\nEquivalently (thin QR for full column rank $A$):\n• $Q$ is $m \\times n$ with orthonormal columns\n• $R$ is $n \\times n$ upper triangular with positive diagonal',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Connection to Cholesky.** If $A$ has full column rank, $A^\\top A = (QR)^\\top(QR) = R^\\top Q^\\top Q R = R^\\top R$. So the Cholesky factorization of $A^\\top A$ is $R^\\top R$. This connects QR to the Cholesky factorization of the Gram matrix — and explains why the QR approach to least squares is equivalent to Cholesky on the normal equations, but without forming $A^\\top A$ explicitly.',
      '**Householder reflections — formal treatment.** A Householder reflector is $H = I - 2\\mathbf{u}\\mathbf{u}^\\top$ where $\\|\\mathbf{u}\\| = 1$. It is symmetric ($H^\\top = H$) and orthogonal ($H^\\top H = I - 4\\mathbf{u}\\mathbf{u}^\\top + 4\\mathbf{u}(\\mathbf{u}^\\top\\mathbf{u})\\mathbf{u}^\\top = I$), so $H^2 = I$ — a reflection. Given a vector $\\mathbf{x}$, choosing $\\mathbf{u} \\propto \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$ makes $H\\mathbf{x} = \\|\\mathbf{x}\\|\\mathbf{e}_1$: the reflection zeros out all components below the first. Applying $n$ such reflectors column by column gives $H_{n-1}\\cdots H_1 A = R$ (upper triangular), so $A = QR$ with $Q = H_1\\cdots H_{n-1}$ orthogonal. The sign convention (choosing the sign of $\\|\\mathbf{x}\\|$ to avoid cancellation) is critical for numerical stability — this is the reason Householder QR is backward stable while classical Gram-Schmidt is not.',
      '**QR and volume.** Since $Q$ is orthogonal ($|\\det Q| = 1$), we have $|\\det A| = |\\det Q||\\det R| = \\prod_{j=1}^n r_{jj}$. This has a geometric interpretation: $r_{11}$ is the length of the first column of $A$; $r_{22}$ is the length of the component of the second column perpendicular to the first; $r_{33}$ is the triple-perpendicular component; and so on. Their product is the $n$-dimensional volume of the parallelepiped spanned by the columns of $A$. More generally, Gram-Schmidt reveals the orthogonal complement structure step by step: after processing $k$ columns, $\\text{span}(\\mathbf{q}_1,\\ldots,\\mathbf{q}_k) = \\text{span}(\\mathbf{a}_1,\\ldots,\\mathbf{a}_k)$ and the $(k{+}1)$-th Gram-Schmidt step peels off exactly the part of $\\mathbf{a}_{k+1}$ not already in this span.',
      '**Backward stability.** An algorithm is **backward stable** if its computed output is the exact output for a slightly perturbed input: $\\tilde{\\mathbf{x}} = f(\\tilde{A})$ with $\\|\\tilde{A} - A\\| \\leq c\\,\\varepsilon_{\\text{mach}}\\|A\\|$. Householder QR is backward stable: the computed $\\tilde{Q},\\tilde{R}$ satisfy $\\tilde{Q}\\tilde{R} = A + \\delta A$ with $\\|\\delta A\\| \\leq c n^{3/2}\\varepsilon_{\\text{mach}}\\|A\\|$. Classical Gram-Schmidt, by contrast, is only **forward stable**: the computed $\\tilde{Q}$ satisfies $\\|\\tilde{Q}^\\top\\tilde{Q} - I\\| \\leq c\\kappa(A)\\varepsilon_{\\text{mach}}$ — orthogonality degrades in proportion to the condition number. For $\\kappa(A) = 10^8$, classical Gram-Schmidt loses 8 digits of orthogonality; Householder loses none. Modified Gram-Schmidt is also backward stable (it can be interpreted as classical Gram-Schmidt applied to a slightly perturbed input), but its constant $c$ is larger than Householder.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why QR is More Stable than Normal Equations',
        body: 'Condition number of $A^\\top A$ = $\\kappa(A)^2$.\nCondition number of $R$ = $\\kappa(A)$.\n\nFor ill-conditioned $A$ (e.g., $\\kappa(A) = 10^8$), normal equations have $\\kappa = 10^{16}$ (near machine precision limit), while QR has $\\kappa = 10^8$ (still manageable).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-001-1',
      title: 'Manual QR via Gram-Schmidt',
      problem: 'Find the QR decomposition of $A = \\begin{bmatrix}1&1\\\\1&0\\\\0&1\\end{bmatrix}$ by hand.',
      steps: [
        {
          expression: '\\mathbf{a}_1 = (1,1,0)^\\top, \\quad r_{11} = \\|\\mathbf{a}_1\\| = \\sqrt{2}, \\quad \\mathbf{q}_1 = \\frac{1}{\\sqrt{2}}(1,1,0)^\\top',
          annotation: 'First column: normalize $\\mathbf{a}_1$. The norm becomes $r_{11}$.',
          strategyTitle: 'Step 1: First column of $Q$',
        },
        {
          expression: 'r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2 = \\frac{1}{\\sqrt{2}}(1)(1) + \\frac{1}{\\sqrt{2}}(1)(0) + 0 = \\frac{1}{\\sqrt{2}}',
          annotation: 'Project $\\mathbf{a}_2$ onto $\\mathbf{q}_1$ to get the off-diagonal entry $r_{12}$.',
          strategyTitle: 'Step 2: $r_{12}$ (off-diagonal of $R$)',
        },
        {
          expression: '\\tilde{\\mathbf{q}}_2 = \\mathbf{a}_2 - r_{12}\\mathbf{q}_1 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} - \\frac{1}{\\sqrt{2}} \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix} = \\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix}',
          annotation: 'Remove the $\\mathbf{q}_1$ component from $\\mathbf{a}_2$.',
          strategyTitle: 'Step 3: Orthogonalize',
        },
        {
          expression: 'r_{22} = \\|\\tilde{\\mathbf{q}}_2\\| = \\sqrt{1/4+1/4+1} = \\sqrt{3/2}, \\quad \\mathbf{q}_2 = \\frac{\\tilde{\\mathbf{q}}_2}{r_{22}} = \\sqrt{\\frac{2}{3}}\\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix}',
          annotation: 'Normalize to get the second column of $Q$.',
          strategyTitle: 'Step 4: Normalize',
        },
        {
          expression: 'Q = \\begin{bmatrix}1/\\sqrt{2}&\\sqrt{2/3}/2\\\\1/\\sqrt{2}&-\\sqrt{2/3}/2\\\\0&\\sqrt{2/3}\\end{bmatrix}, \\quad R = \\begin{bmatrix}\\sqrt{2}&1/\\sqrt{2}\\\\0&\\sqrt{3/2}\\end{bmatrix}',
          annotation: 'Verify: $Q^\\top Q = I_2$ and $QR = A$.',
          strategyTitle: 'Assemble $Q$ and $R$',
          hints: ['Check $\\mathbf{q}_1^\\top\\mathbf{q}_2 = \\frac{1}{\\sqrt{2}}\\frac{1}{\\sqrt{6}} + \\frac{1}{\\sqrt{2}}(-\\frac{1}{\\sqrt{6}}) + 0 = 0$ ✓'],
        },
      ],
    },
    {
      id: 'ex-la7-001-2',
      title: 'QR of a 2×2 matrix — full step-by-step',
      problem: 'Find the QR decomposition of $A = \\begin{bmatrix}3&1\\\\4&0\\end{bmatrix}$ by Gram-Schmidt.',
      steps: [
        {
          expression: '\\mathbf{a}_1 = (3,4)^\\top, \\quad r_{11} = \\|\\mathbf{a}_1\\| = \\sqrt{9+16} = 5, \\quad \\mathbf{q}_1 = \\frac{1}{5}(3,4)^\\top',
          annotation: 'Normalize the first column. The 3-4-5 right triangle gives a clean answer.',
          strategyTitle: 'Step 1: First column of $Q$',
        },
        {
          expression: 'r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2 = \\frac{3}{5}(1) + \\frac{4}{5}(0) = \\frac{3}{5}',
          annotation: 'Project $\\mathbf{a}_2 = (1,0)^\\top$ onto $\\mathbf{q}_1$.',
          strategyTitle: 'Step 2: Off-diagonal $r_{12}$',
        },
        {
          expression: '\\tilde{\\mathbf{q}}_2 = \\mathbf{a}_2 - r_{12}\\mathbf{q}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix} - \\frac{3}{5} \\cdot \\frac{1}{5}\\begin{bmatrix}3\\\\4\\end{bmatrix} = \\begin{bmatrix}1 - 9/25\\\\-12/25\\end{bmatrix} = \\begin{bmatrix}16/25\\\\-12/25\\end{bmatrix}',
          annotation: 'Subtract the projection to get the orthogonal remainder.',
          strategyTitle: 'Step 3: Orthogonalize',
        },
        {
          expression: 'r_{22} = \\|\\tilde{\\mathbf{q}}_2\\| = \\sqrt{(16/25)^2+(12/25)^2} = \\frac{1}{25}\\sqrt{256+144} = \\frac{20}{25} = \\frac{4}{5}',
          annotation: 'Norm of the orthogonalized vector — this is the second diagonal of $R$.',
          strategyTitle: 'Step 4: $r_{22}$',
        },
        {
          expression: '\\mathbf{q}_2 = \\frac{\\tilde{\\mathbf{q}}_2}{r_{22}} = \\frac{25}{20}\\begin{bmatrix}16/25\\\\-12/25\\end{bmatrix} = \\begin{bmatrix}4/5\\\\-3/5\\end{bmatrix}',
          annotation: 'Normalize. Check: $\\mathbf{q}_1^\\top\\mathbf{q}_2 = \\frac{3}{5}\\cdot\\frac{4}{5}+\\frac{4}{5}\\cdot(-\\frac{3}{5}) = 0$ ✓',
          strategyTitle: 'Step 5: Second column of $Q$',
        },
        {
          expression: 'Q = \\begin{bmatrix}3/5&4/5\\\\4/5&-3/5\\end{bmatrix}, \\quad R = \\begin{bmatrix}5&3/5\\\\0&4/5\\end{bmatrix}',
          annotation: 'Verify $QR = A$: row 1 of $Q$ times columns of $R$: $(3/5)(5)+(4/5)(0)=3$ ✓, $(3/5)(3/5)+(4/5)(4/5)=9/25+16/25=1$ ✓.',
          strategyTitle: 'Final answer',
        },
      ],
    },
    {
      id: 'ex-la7-001-3',
      title: 'Solving least squares Ax = b via QR',
      problem: 'Fit a line $y = c_0 + c_1 t$ to the data $(t,y) = (0,1),(1,2),(2,2),(3,4)$ using QR. The design matrix is $A = \\begin{bmatrix}1&0\\\\1&1\\\\1&2\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (1,2,2,4)^\\top$.',
      steps: [
        {
          expression: 'A = \\begin{bmatrix}1&0\\\\1&1\\\\1&2\\\\1&3\\end{bmatrix} \\xrightarrow{\\text{Gram-Schmidt}} \\mathbf{q}_1 = \\frac{1}{2}(1,1,1,1)^\\top, \\quad r_{11} = 2',
          annotation: 'The first column is $(1,1,1,1)^\\top$, norm $= 2$.',
          strategyTitle: 'Step 1: First column of $Q$',
        },
        {
          expression: 'r_{12} = \\mathbf{q}_1^\\top\\mathbf{a}_2 = \\frac{1}{2}(0+1+2+3) = 3, \\quad \\tilde{\\mathbf{q}}_2 = (0,1,2,3)^\\top - 3 \\cdot \\frac{1}{2}(1,1,1,1)^\\top = (-3/2,-1/2,1/2,3/2)^\\top',
          annotation: 'Subtract the projection of $\\mathbf{a}_2 = (0,1,2,3)^\\top$ onto $\\mathbf{q}_1$.',
          strategyTitle: 'Step 2: Orthogonalize second column',
        },
        {
          expression: 'r_{22} = \\|(-3/2,-1/2,1/2,3/2)^\\top\\| = \\sqrt{9/4+1/4+1/4+9/4} = \\sqrt{5}, \\quad \\mathbf{q}_2 = \\frac{1}{\\sqrt{5}}(-3/2,-1/2,1/2,3/2)^\\top',
          annotation: 'Normalize the second Gram-Schmidt vector.',
          strategyTitle: 'Step 3: Second column of $Q$',
        },
        {
          expression: 'Q^\\top\\mathbf{b} = \\begin{bmatrix}\\mathbf{q}_1^\\top\\mathbf{b}\\\\\\mathbf{q}_2^\\top\\mathbf{b}\\end{bmatrix} = \\begin{bmatrix}\\frac{1}{2}(1+2+2+4)\\\\\\frac{1}{\\sqrt{5}}(-3/2+(-1/2)(2)+(1/2)(2)+(3/2)(4))\\end{bmatrix} = \\begin{bmatrix}9/2\\\\5/\\sqrt{5}\\end{bmatrix} = \\begin{bmatrix}4.5\\\\\\sqrt{5}\\end{bmatrix}',
          annotation: 'Compute $Q^\\top\\mathbf{b}$. This is the right-hand side of the triangular system.',
          strategyTitle: 'Step 4: Compute $Q^\\top\\mathbf{b}$',
        },
        {
          expression: 'R\\mathbf{x} = Q^\\top\\mathbf{b}: \\quad \\begin{bmatrix}2&3\\\\0&\\sqrt{5}\\end{bmatrix}\\begin{bmatrix}c_0\\\\c_1\\end{bmatrix} = \\begin{bmatrix}4.5\\\\\\sqrt{5}\\end{bmatrix}',
          annotation: 'Set up the upper triangular system. Back-solve: $c_1 = \\sqrt{5}/\\sqrt{5} = 1$, then $2c_0 = 4.5 - 3(1) = 1.5$, so $c_0 = 0.75$.',
          strategyTitle: 'Step 5: Back-solve',
        },
        {
          expression: 'c_0 = 0.75, \\quad c_1 = 1 \\quad \\Rightarrow \\quad \\hat{y} = 0.75 + t',
          annotation: 'Best-fit line. Verify: residual $\\|A\\mathbf{x}-\\mathbf{b}\\|^2 = (0.75-1)^2+(1.75-2)^2+(2.75-2)^2+(3.75-4)^2 = 0.25$ (the minimum).',
          strategyTitle: 'Best-fit line',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la7-001-1',
      title: 'Why QR beats normal equations for stability',
      difficulty: 'medium',
      problem: 'Explain why solving least squares via QR ($R\\mathbf{x} = Q^\\top \\mathbf{b}$) is more stable than the normal equations $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$. Give a concrete ill-conditioned example.',
      hint: 'Consider $A = \\begin{bmatrix}1&1\\\\\\varepsilon&0\\\\0&\\varepsilon\\end{bmatrix}$ for very small $\\varepsilon$ and compute the condition number of $A^\\top A$ vs $R$.',
      walkthrough: [
        '**The key issue:** $\\kappa(A^\\top A) = \\kappa(A)^2$. Squaring the condition number is catastrophic for near-rank-deficient matrices.',
        '**Concrete example:** $A = \\begin{bmatrix}1&1\\\\\\varepsilon&0\\\\0&\\varepsilon\\end{bmatrix}$, $\\varepsilon = 10^{-8}$. $A^\\top A = \\begin{bmatrix}1+\\varepsilon^2&1\\\\1&1+\\varepsilon^2\\end{bmatrix}$. The two eigenvalues are $2+\\varepsilon^2$ and $\\varepsilon^2$, giving $\\kappa(A^\\top A) \\approx 2/\\varepsilon^2 = 2\\times 10^{16}$ — right at machine precision!',
        '**Via QR:** The condition number of $R$ is $\\kappa(A) \\approx \\sqrt{2}/\\varepsilon = \\sqrt{2} \\times 10^8$ — still manageable with 64-bit floats.',
        '**Rule of thumb:** Normal equations need $\\kappa(A)^2 \\ll 10^{16}$, so $\\kappa(A) \\ll 10^8$. QR needs $\\kappa(A) \\ll 10^{16}$. QR tolerates much more ill-conditioning.',
        "**In practice:** MATLAB's `\\` operator uses QR for overdetermined systems precisely for this reason.",
      ],
    },
    {
      id: 'ch-la7-001-2',
      title: 'QR by Gram-Schmidt on a 3×2 matrix',
      difficulty: 'easy',
      problem: 'Find the QR decomposition of $A = \\begin{bmatrix}1&0\\\\0&1\\\\1&1\\end{bmatrix}$ by Gram-Schmidt. Verify $Q^\\top Q = I_2$ and $QR = A$.',
      hint: 'Normalize the first column to get $\\mathbf{q}_1$, then subtract the projection of $\\mathbf{a}_2$ onto $\\mathbf{q}_1$ and normalize the remainder to get $\\mathbf{q}_2$.',
      walkthrough: [
        { expression: '\\mathbf{a}_1 = (1,0,1)^\\top,\\quad r_{11} = \\|\\mathbf{a}_1\\| = \\sqrt{2},\\quad \\mathbf{q}_1 = \\tfrac{1}{\\sqrt{2}}(1,0,1)^\\top', annotation: 'Normalize the first column. $r_{11}$ = norm of first column.' },
        { expression: 'r_{12} = \\mathbf{q}_1^\\top\\mathbf{a}_2 = \\tfrac{1}{\\sqrt{2}}(1\\cdot0+0\\cdot1+1\\cdot1) = \\tfrac{1}{\\sqrt{2}}', annotation: 'Project second column onto $\\mathbf{q}_1$.' },
        { expression: '\\tilde{\\mathbf{q}}_2 = \\mathbf{a}_2 - r_{12}\\mathbf{q}_1 = (0,1,1)^\\top - \\tfrac{1}{\\sqrt{2}}\\cdot\\tfrac{1}{\\sqrt{2}}(1,0,1)^\\top = (-\\tfrac{1}{2},1,\\tfrac{1}{2})^\\top', annotation: 'Subtract the projection: $(0,1,1)^\\top - (1/2, 0, 1/2)^\\top$.' },
        { expression: 'r_{22} = \\|\\tilde{\\mathbf{q}}_2\\| = \\sqrt{\\tfrac{1}{4}+1+\\tfrac{1}{4}} = \\sqrt{\\tfrac{3}{2}} = \\tfrac{\\sqrt{6}}{2}', annotation: 'Compute the norm for the second diagonal of $R$.' },
        { expression: '\\mathbf{q}_2 = \\tfrac{\\tilde{\\mathbf{q}}_2}{r_{22}} = \\tfrac{2}{\\sqrt{6}}(-\\tfrac{1}{2},1,\\tfrac{1}{2})^\\top = (-\\tfrac{1}{\\sqrt{6}},\\tfrac{2}{\\sqrt{6}},\\tfrac{1}{\\sqrt{6}})^\\top', annotation: 'Normalize. Check: $\\mathbf{q}_1^\\top\\mathbf{q}_2 = \\frac{1}{\\sqrt{2}}(-\\frac{1}{\\sqrt{6}})+0+\\frac{1}{\\sqrt{2}}(\\frac{1}{\\sqrt{6}}) = 0$ ✓' },
        { expression: 'Q = \\begin{bmatrix}1/\\sqrt{2}&-1/\\sqrt{6}\\\\0&2/\\sqrt{6}\\\\1/\\sqrt{2}&1/\\sqrt{6}\\end{bmatrix},\\quad R = \\begin{bmatrix}\\sqrt{2}&1/\\sqrt{2}\\\\0&\\sqrt{6}/2\\end{bmatrix}', annotation: 'Verify: $Q^\\top Q = I_2$ and $QR = A$ ✓' },
      ],
    },
    {
      id: 'ch-la7-001-3',
      title: 'One step of the QR eigenvalue algorithm',
      difficulty: 'hard',
      problem: 'Given $A = \\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}$, compute one QR iteration: (a) factor $A = Q_0R_0$, (b) form $A_1 = R_0Q_0$, (c) verify $A_1$ is similar to $A$ (same trace/det), and (d) check whether the off-diagonal entry of $A_1$ is smaller than that of $A$.',
      hint: 'Use Gram-Schmidt on the columns of $A$ to find $Q_0, R_0$. Then $A_1 = R_0Q_0 = Q_0^{-1}AQ_0$ — a similarity transformation.',
      walkthrough: [
        { expression: '\\mathbf{a}_1=(2,1)^\\top,\\;r_{11}=\\sqrt{5},\\;\\mathbf{q}_1=\\tfrac{1}{\\sqrt{5}}(2,1)^\\top', annotation: 'Normalize first column.' },
        { expression: 'r_{12}=\\mathbf{q}_1^\\top\\mathbf{a}_2=\\tfrac{2}{\\sqrt{5}}+\\tfrac{3}{\\sqrt{5}}=\\sqrt{5},\\;\\tilde{\\mathbf{q}}_2=(1,3)^\\top-\\sqrt{5}\\cdot\\tfrac{1}{\\sqrt{5}}(2,1)^\\top=(-1,2)^\\top', annotation: 'Project and subtract.' },
        { expression: 'r_{22}=\\sqrt{5},\\;\\mathbf{q}_2=\\tfrac{1}{\\sqrt{5}}(-1,2)^\\top', annotation: 'Check: $\\mathbf{q}_1^\\top\\mathbf{q}_2=\\frac{-2+2}{5}=0$ ✓' },
        { expression: 'Q_0 = \\tfrac{1}{\\sqrt{5}}\\begin{bmatrix}2&-1\\\\1&2\\end{bmatrix},\\quad R_0 = \\begin{bmatrix}\\sqrt{5}&\\sqrt{5}\\\\0&\\sqrt{5}\\end{bmatrix} = \\sqrt{5}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}', annotation: 'Assembled QR. Verify $Q_0^\\top Q_0 = I$ and $Q_0R_0 = A$.' },
        { expression: 'A_1 = R_0Q_0 = \\sqrt{5}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}\\cdot\\tfrac{1}{\\sqrt{5}}\\begin{bmatrix}2&-1\\\\1&2\\end{bmatrix} = \\begin{bmatrix}3&1\\\\1&2\\end{bmatrix}', annotation: 'Flip order: $R_0Q_0 \\neq Q_0R_0$ in general!' },
        { expression: '\\text{tr}(A_1)=5=\\text{tr}(A),\\quad\\det(A_1)=6-1=5=\\det(A)\\checkmark', annotation: 'Similarity invariants preserved: $A_1 = Q_0^{-1}AQ_0$.' },
        { expression: '\\text{Off-diagonal: }|A_{12}|=1 \\to |{A_1}_{12}|=1', annotation: 'No shrinkage after just one step on this symmetric matrix — in practice, shifts are used to accelerate convergence. The off-diagonals do converge to 0 eventually.' },
      ],
    },
  ],

  mentalModel: [
    'QR = orthonormal columns × upper triangular. Like Gaussian elimination but preserving orthogonality.',
    'Build QR by Gram-Schmidt: orthogonalize columns, norms and projections fill R.',
    'Least squares via QR: compute $Q^\\top \\mathbf{b}$, back-solve $R\\mathbf{x} = Q^\\top \\mathbf{b}$.',
    'More stable than normal equations: avoids squaring the condition number.',
    'QR algorithm (iterating QR) computes all eigenvalues of a matrix.',
  ],

  checkpoints: [
    { id: 'cp-la7-001-1', label: 'Read intuition section', type: 'read' },
    { id: 'cp-la7-001-2', label: 'Read math section', type: 'read' },
    { id: 'cp-la7-001-3', label: 'Read rigor section', type: 'read' },
    { id: 'cp-la7-001-4', label: 'Run QR compute and verify lab', type: 'lab' },
    { id: 'cp-la7-001-5', label: 'Run least squares via QR lab', type: 'lab' },
    { id: 'cp-la7-001-6', label: 'Work example 1: Gram-Schmidt on 3×2 matrix', type: 'example' },
    { id: 'cp-la7-001-7', label: 'Work example 2: QR of 2×2 matrix', type: 'example' },
    { id: 'cp-la7-001-8', label: 'Solve challenge: QR vs normal equations stability', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'assess-la7-001-1',
        type: 'computation',
        text: 'Compute by hand the QR decomposition of $A = \\begin{bmatrix}3&1\\\\0&2\\\\4&0\\end{bmatrix}$ using Gram-Schmidt. Verify $Q^\\top Q = I_2$ and $QR = A$.',
        answer: '$\\mathbf{a}_1 = (3,0,4)^\\top$: $r_{11} = 5$, $\\mathbf{q}_1 = (3/5, 0, 4/5)^\\top$. $r_{12} = \\mathbf{q}_1^\\top(1,2,0)^\\top = 3/5$. $\\tilde{\\mathbf{q}}_2 = (1,2,0)^\\top - (3/5)(3/5,0,4/5)^\\top = (16/25, 2, -12/25)^\\top$. $r_{22} = \\|\\tilde{\\mathbf{q}}_2\\| = \\sqrt{256/625+4+144/625} = \\sqrt{4+400/625} = \\sqrt{2900/625}$... [verify numerically: $r_{22} = \\sqrt{2.64} \\approx 1.625$]. Check $Q^\\top Q = I_2$ by computing the inner products.',
        hint: 'Start with $\\mathbf{a}_1 = (3,0,4)$: note $\\|(3,0,4)\\| = 5$. After finding $\\mathbf{q}_1$, project $\\mathbf{a}_2 = (1,2,0)$ onto it.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la7-001-1',
      type: 'choice',
      text: 'In the thin (reduced) QR of an $m \\times n$ matrix ($m > n$), what is the shape of $Q$?',
      options: ['$m \\times m$', '$n \\times n$', '$m \\times n$', '$n \\times m$'],
      answer: '$m \\times n$',
      hints: ['Thin QR: $Q$ has orthonormal columns (not necessarily rows), shape $m \\times n$. Full QR: $Q$ is square $m \\times m$ and fully orthogonal. In MATLAB: `[Q,R] = qr(A,0)` gives thin QR.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-2',
      type: 'choice',
      text: 'For least squares $\\min\\|A\\mathbf{x}-\\mathbf{b}\\|$ via QR (with $A = QR$), you solve:',
      options: ['$Q\\mathbf{x} = \\mathbf{b}$', '$R\\mathbf{x} = Q^\\top \\mathbf{b}$', '$A^\\top A \\mathbf{x} = \\mathbf{b}$', '$Q^\\top \\mathbf{x} = R\\mathbf{b}$'],
      answer: '$R\\mathbf{x} = Q^\\top \\mathbf{b}$',
      hints: ['Derivation: the normal equations $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$ become $(QR)^\\top(QR)\\mathbf{x} = (QR)^\\top\\mathbf{b}$, i.e., $R^\\top R\\mathbf{x} = R^\\top Q^\\top\\mathbf{b}$. Since $R$ is invertible, divide: $R\\mathbf{x} = Q^\\top\\mathbf{b}$. Solve by back-substitution.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-3',
      type: 'choice',
      text: 'The QR iteration algorithm (set $A_{k+1} = R_k Q_k$ where $A_k = Q_k R_k$) converges to:',
      options: ['A symmetric matrix', 'A diagonal matrix (always)', 'An upper triangular matrix with eigenvalues on the diagonal', 'The identity matrix'],
      answer: 'An upper triangular matrix with eigenvalues on the diagonal',
      hints: ['Each step is a similarity transformation: $A_{k+1} = R_k Q_k = Q_k^{-1}(Q_k R_k)Q_k = Q_k^{-1}A_k Q_k$. Eigenvalues are preserved. The iteration converges (under mild conditions) to Schur form — upper triangular with eigenvalues on the diagonal.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-001-4',
      type: 'choice',
      text: 'Classical Gram-Schmidt QR is numerically unstable. The practically preferred method is:',
      options: ['Modified Gram-Schmidt', 'Cholesky QR', 'Householder reflections', 'Givens rotations for small matrices'],
      answer: 'Householder reflections',
      hints: ['Householder uses orthogonal reflections $H = I - 2\\mathbf{u}\\mathbf{u}^\\top$ to zero out subdiagonal entries. It is fully backward stable (error $\\propto \\epsilon_{\\text{machine}}\\|A\\|$), unlike Gram-Schmidt which accumulates errors. LAPACK and MATLAB use Householder QR.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-5',
      type: 'choice',
      text: 'For a $3 \\times 2$ matrix $A$ with Gram-Schmidt QR, what is $r_{11}$?',
      options: ['The (1,1) entry of $A$', 'The norm of the first column of $A$', 'The dot product of the first two columns', 'Always equal to 1'],
      answer: 'The norm of the first column of $A$',
      hints: ['In Gram-Schmidt, you normalize the first column: $\\mathbf{q}_1 = \\mathbf{a}_1 / \\|\\mathbf{a}_1\\|$. The scalar you divide by is $r_{11} = \\|\\mathbf{a}_1\\|$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-6',
      type: 'choice',
      text: 'What condition on $A$ guarantees the thin QR decomposition is unique (with positive diagonal of $R$)?',
      options: ['$A$ is square', '$A$ is symmetric', '$A$ has full column rank', '$A$ is orthogonal'],
      answer: '$A$ has full column rank',
      hints: ['Full column rank means the Gram-Schmidt process never encounters a zero vector — each $r_{jj} > 0$, and requiring positivity pins down the sign of each $\\mathbf{q}_j$ uniquely.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-001-7',
      type: 'choice',
      text: 'The Cholesky factorization of $A^\\top A$ (when $A$ has full column rank) gives:',
      options: ['$A^\\top A = QR$', '$A^\\top A = R^\\top R$ where $R$ is the upper triangular factor from QR of $A$', '$A^\\top A = LL^\\top$ where $L$ is unrelated to QR', '$A^\\top A = Q^\\top Q$'],
      answer: '$A^\\top A = R^\\top R$ where $R$ is the upper triangular factor from QR of $A$',
      hints: ['From $A = QR$: $A^\\top A = R^\\top Q^\\top Q R = R^\\top R$. So the Cholesky factor of the Gram matrix $A^\\top A$ is exactly the $R$ from the QR factorization of $A$.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-001-8',
      type: 'choice',
      text: 'For an $m \\times n$ overdetermined system ($m > n$), how does the condition number compare between QR-based least squares and the normal equations approach?',
      options: ['They are identical', 'QR has condition $\\kappa(A)$; normal equations have $\\kappa(A)^2$', 'QR has condition $\\kappa(A)^2$; normal equations have $\\kappa(A)$', 'QR has condition $\\sqrt{\\kappa(A)}$; normal equations have $\\kappa(A)$'],
      answer: 'QR has condition $\\kappa(A)$; normal equations have $\\kappa(A)^2$',
      hints: ['$\\kappa(A^\\top A) = \\|A^\\top A\\| \\|{(A^\\top A)}^{-1}\\| = \\sigma_1^2 / \\sigma_n^2 = \\kappa(A)^2$. The QR approach solves $R\\mathbf{x} = Q^\\top\\mathbf{b}$ where $\\kappa(R) = \\kappa(A)$.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-001-9',
      type: 'choice',
      text: 'In Gram-Schmidt, what is the geometric meaning of the off-diagonal entry $r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2$?',
      options: ['The length of $\\mathbf{a}_2$', 'The length of the component of $\\mathbf{a}_2$ perpendicular to $\\mathbf{q}_1$', 'The scalar projection of $\\mathbf{a}_2$ onto $\\mathbf{q}_1$', 'The angle between $\\mathbf{a}_1$ and $\\mathbf{a}_2$'],
      answer: 'The scalar projection of $\\mathbf{a}_2$ onto $\\mathbf{q}_1$',
      hints: ['The projection of $\\mathbf{a}_2$ onto the unit vector $\\mathbf{q}_1$ is $(\\mathbf{q}_1^\\top \\mathbf{a}_2)\\mathbf{q}_1$. The scalar coefficient $r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2$ is how far along $\\mathbf{q}_1$ the vector $\\mathbf{a}_2$ reaches.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-001-10',
      type: 'choice',
      text: 'If $A$ is an $m \\times n$ matrix with thin QR $A = QR$, what is $Q^\\top Q$?',
      options: ['$QQ^\\top$ (the projection matrix onto the column space of $A$)', '$I_n$ (the $n \\times n$ identity)', '$I_m$ (the $m \\times m$ identity)', 'The zero matrix'],
      answer: '$I_n$ (the $n \\times n$ identity)',
      hints: ['In thin QR, $Q$ is $m \\times n$ with orthonormal columns: the $n$ columns are mutually orthogonal unit vectors. So $Q^\\top Q = I_n$. Note $QQ^\\top$ is $m \\times m$ and equals the orthogonal projector onto the column space of $A$ — different from $I_m$ when $m > n$.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Carry out Gram-Schmidt on a 3×2 matrix by hand, producing $Q$ and $R$, and use QR to solve a 4×2 least squares problem.',
    explainVerbally: 'Explain why $R\\mathbf{x} = Q^\\top\\mathbf{b}$ is equivalent to the normal equations and why it has a better condition number.',
    detectIncorrectApplication: 'Recognize when a student applies the normal equations to a near-rank-deficient matrix and identify the squared-condition-number hazard.',
    transferToUnfamiliar: 'Given a new matrix factorization problem (e.g., QL, LQ), describe how the Gram-Schmidt reasoning would generalize.',
  },

  misconceptions: [
    {
      falseBelief: '$Q^\\top Q = QQ^\\top$ for thin QR.',
      whyStudentsThinkIt: 'Students mix up thin and full QR. For the full (square) $Q$, both equal $I_m$. For thin $Q$ ($m \\times n$, $m > n$), $Q^\\top Q = I_n$ but $QQ^\\top$ is the $m \\times m$ projection matrix — not the identity.',
      correctionExample: 'Take $Q = \\begin{bmatrix}1/\\sqrt{2}\\\\1/\\sqrt{2}\\end{bmatrix}$ ($2 \\times 1$). $Q^\\top Q = 1$ (scalar), $QQ^\\top = \\begin{bmatrix}1/2&1/2\\\\1/2&1/2\\end{bmatrix}$ (a rank-1 projector).',
      contrastCase: 'Full orthogonal $Q$ (square): $Q^\\top Q = QQ^\\top = I$. Thin $Q$: only $Q^\\top Q = I_n$.',
    },
    {
      falseBelief: 'QR and normal equations always give the same numerical answer.',
      whyStudentsThinkIt: 'Both methods are mathematically equivalent, so students think the computed answers are identical. But floating-point arithmetic means the normal equations square the condition number, amplifying rounding errors dramatically for ill-conditioned problems.',
      correctionExample: 'For the Hilbert matrix $H_8$ (condition number $\\approx 10^{13}$), normal equations have condition $\\approx 10^{26}$ — beyond double precision. QR gives a good answer; normal equations give garbage.',
      contrastCase: 'For well-conditioned $A$ (say $\\kappa(A) = 10$), normal equations have $\\kappa = 100$ — both methods agree to many digits.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to solve 1000 different least squares problems $A\\mathbf{x} = \\mathbf{b}_i$ for the same $A$ but different right-hand sides $\\mathbf{b}_i$.',
      competingTechniques: 'Recompute QR each time; compute QR once and reuse; use SVD.',
      whyThisTechniqueWins: 'Compute $A = QR$ once ($O(mn^2)$ cost), then for each $\\mathbf{b}_i$ solve $R\\mathbf{x}_i = Q^\\top\\mathbf{b}_i$ in $O(mn + n^2)$ — a massive saving over recomputing the factorization.',
    },
    {
      situation: 'A large regression model has near-collinear predictors, giving a design matrix with condition number $\\approx 10^{10}$.',
      competingTechniques: 'Normal equations with Cholesky; QR; ridge regression (Tikhonov regularization); SVD truncation.',
      whyThisTechniqueWins: 'QR is preferred over normal equations because it avoids squaring the condition number ($10^{20}$ would destroy 16-digit double precision). Ridge regression and SVD truncation also help but change the estimator; QR solves the original least squares problem stably.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'Q', meaning: 'Orthogonal factor of QR: $m \\times n$ with orthonormal columns ($Q^\\top Q = I_n$). In thin QR, $Q$ encodes the orthonormal basis for the column space of $A$.' },
      { symbol: 'R', meaning: 'Upper triangular factor of QR: $n \\times n$ with positive diagonal entries (by convention). The diagonal $r_{jj}$ is the norm of the $j$-th column after removing all previous directions.' },
      { symbol: 'r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j', meaning: 'Off-diagonal entry of $R$ ($i < j$): the scalar projection of the $j$-th original column onto the $i$-th orthonormal basis vector. Records how much of $\\mathbf{a}_j$ lies along $\\mathbf{q}_i$.' },
      { symbol: '\\kappa(A)^2', meaning: 'Condition number of $A^\\top A$ (normal equations matrix). Squaring the condition number is why normal equations fail for ill-conditioned problems — QR avoids forming $A^\\top A$.' },
      { symbol: 'H = I - 2\\mathbf{u}\\mathbf{u}^\\top', meaning: 'Householder reflector: orthogonal, symmetric, $H^2 = I$. Chosen to map a given vector to $\\|\\mathbf{x}\\|\\mathbf{e}_1$. The production-grade way to compute QR — backward stable, unlike classical Gram-Schmidt.' },
      { symbol: 'A_{k+1} = R_k Q_k', meaning: 'One step of the QR eigenvalue algorithm: factor $A_k = Q_k R_k$, then flip. Each step is a similarity transformation preserving eigenvalues. The sequence converges to upper triangular Schur form.' },
    ],
    rulesOfThumb: [
      'Normal equations square the condition number: $\\kappa(A^\\top A) = \\kappa(A)^2$. Use QR instead for least squares.',
      'The $R$ matrix is a record of Gram-Schmidt arithmetic: norms on the diagonal, inner products above it.',
      'Householder QR is backward stable; classical Gram-Schmidt is not — use Householder for production code.',
      '$|\\det A| = \\prod_j r_{jj}$: the diagonal of $R$ encodes the volume of the parallelepiped spanned by columns of $A$.',
      'QR iteration (flip $Q_k, R_k$) converges to eigenvalues without ever computing the characteristic polynomial.',
    ],
  },

  spiral: {
    recoveryPoints: ['la5-002', 'la5-003'],
    futureLinks: ['la7-002', 'la7-003', 'la7-006'],
  },

  debugging: [
    {
      commonError: 'The off-diagonal entry $r_{12}$ is computed as $\\mathbf{a}_1^\\top \\mathbf{a}_2$ instead of $\\mathbf{q}_1^\\top \\mathbf{a}_2$.',
      symptom: '$Q$ columns are not orthonormal — $Q^\\top Q \\neq I$.',
      whyItHappened: 'Confusion between original columns $\\mathbf{a}_j$ and orthonormal columns $\\mathbf{q}_j$. The projection is onto the normalized vector $\\mathbf{q}_i$, not $\\mathbf{a}_i$.',
      repairStrategy: 'Always use $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ (dot with the unit vector $\\mathbf{q}_i$). After computing each $\\mathbf{q}_j$, verify $\\|\\mathbf{q}_j\\| = 1$ before proceeding.',
    },
    {
      commonError: 'Forgetting to subtract ALL previous projections when orthogonalizing column $j$.',
      symptom: 'Later columns of $Q$ are not orthogonal to all earlier columns — only to $\\mathbf{q}_{j-1}$.',
      whyItHappened: 'Students subtract only the most recent projection, forgetting the loop runs from $i=1$ to $j-1$. For column 3, you must subtract projections onto both $\\mathbf{q}_1$ and $\\mathbf{q}_2$.',
      repairStrategy: 'Write out the full subtraction: $\\tilde{\\mathbf{q}}_j = \\mathbf{a}_j - \\sum_{i=1}^{j-1}(\\mathbf{q}_i^\\top\\mathbf{a}_j)\\mathbf{q}_i$. Check orthogonality against all previous $\\mathbf{q}_i$ before moving on.',
    },
  ],
};
