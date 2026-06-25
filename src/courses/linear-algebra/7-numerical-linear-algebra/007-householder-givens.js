import householderUrl from '../diagrams/la-householder-reflection.svg?url';
import givensUrl from '../diagrams/la-givens-rotation.svg?url';

export default {
  id: 'la7-007',
  slug: 'householder-givens',
  chapter: 'la7',
  order: 7,
  title: 'Householder Reflections and Givens Rotations',
  subtitle: 'Two elementary orthogonal transformations — Householder reflections and Givens rotations — are the building blocks of stable numerical linear algebra. QR factorization, the QR algorithm, and least-squares solvers are all implemented using these primitives.',
  tags: ['Householder reflection', 'Givens rotation', 'orthogonal transformation', 'QR factorization', 'numerical linear algebra', 'plane rotation', 'reflector', 'stability'],
  aliases: 'Householder reflection Givens rotation orthogonal transformation QR factorization plane rotation numerical stability reflector',

  hook: {
    question: "The Gram-Schmidt process for QR factorization is elegant but numerically unstable — rounding errors accumulate and the computed columns lose orthogonality. Is there a numerically stable way to compute QR using orthogonal matrices?",
    realWorldContext: "Householder reflections and Givens rotations are the workhorses of modern numerical linear algebra. LAPACK's `dgeqrf` (QR factorization), `dgehrd` (Hessenberg reduction), and `dgees` (Schur decomposition) all use Householder reflections internally. Givens rotations are preferred for sparse matrices (they zero out one entry at a time without disturbing zeros), for parallel computing (independent rotations can be applied simultaneously), and in streaming algorithms (update a factorization when one row changes). The stability of these methods — because they use orthogonal matrices — is why modern scientific computing relies on them.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      '**Where you are in the story.** Every algorithm in this chapter has used QR factorization as a subroutine — QR for least squares, the QR algorithm for eigenvalues, the Schur decomposition. You learned that Gram-Schmidt computes QR but is numerically unstable. This lesson explains what is used instead: two elementary orthogonal transformations that together are the foundation of all stable numerical linear algebra. Householder reflections and Givens rotations are not abstract — they are the literal operations that LAPACK runs inside your computer.',

      '**The Householder idea: reflect to zero everything below one entry.** You have a vector $\\mathbf{x} = (3,4)^\\top$ and you want to find an orthogonal matrix $H$ such that $H\\mathbf{x} = (5,0)^\\top$ — all entries except the first become zero. The key geometric insight: $H$ is a reflection across a hyperplane. If you reflect $\\mathbf{x}$ across the hyperplane perpendicular to $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$, the reflection lands on the $\\mathbf{e}_1$ axis. The formula is $H = I - 2\\mathbf{v}\\mathbf{v}^\\top / \\|\\mathbf{v}\\|^2$. One matrix, one multiplication: the entire sub-column becomes zero.',
      ] },
      { type: 'image', src: householderUrl,
        alt: 'Vector x = (3,4) reflected across a mirror hyperplane onto Hx = (5,0) along the axis, both vectors the same length',
        caption: 'A Householder reflection sends x to the axis in one orthogonal multiplication — length preserved, direction collapsed to one component.' },
      { type: 'prose', paragraphs: [
      '**The sign convention matters.** For numerical stability, you choose the sign of $\\|\\mathbf{x}\\|\\mathbf{e}_1$ to be opposite to $x_1$: $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$. This makes $\\mathbf{v}$ as large as possible, avoiding catastrophic cancellation when $x_1 \\approx \\|\\mathbf{x}\\|$. It is the same pattern you saw in the numerical stability lesson: algebraically equivalent formulas can have very different floating-point behavior.',

      '**Householder QR: apply one reflector per column.** To triangularize $A$: apply $H_1$ to zero out everything below the (1,1) entry of column 1. Then apply $H_2$ (acting on rows $2,\\ldots,m$) to zero out everything below the (2,2) entry of column 2. Continue until the matrix is upper triangular. Each reflector is orthogonal, so the product $Q = H_1 H_2 \\cdots H_{n-1}$ is orthogonal. The beautiful efficiency: you never form $H_k$ as an $m \\times m$ matrix — you store just the vector $\\mathbf{v}_k$ and apply the operation $x \\mapsto x - 2\\mathbf{v}(\\mathbf{v}^\\top x)/\\|\\mathbf{v}\\|^2$ in $O(m)$ flops.',

      '**Predict before reading on.** For the dense matrix $A = \\begin{pmatrix}3&1\\\\4&0\\\\0&1\\end{pmatrix}$, the first Householder reflector $H_1$ acts on the first column $(3,4,0)^\\top$. What is $\\|\\mathbf{a}_1\\|$? What will the $(1,1)$ entry of $R = H_1 A$ be? Write your answer before Example 1.',

      '**Givens rotations: zero out one entry at a time.** A Givens rotation $G$ acts in a $2 \\times 2$ subspace: given a pair $(a,b)$, it rotates so $(a,b)^\\top \\mapsto (r, 0)^\\top$ with $r = \\sqrt{a^2 + b^2}$. The angle is $\\cos\\theta = a/r$, $\\sin\\theta = b/r$. Cost: 6 arithmetic operations per rotation (vs $O(m)$ for a Householder step). The tradeoff: Householder is far more efficient for dense matrices (one step per column), but Givens is perfect for sparse matrices where you only need to zero out a few specific entries without disturbing the existing zero structure.',
      ] },
      { type: 'image', src: givensUrl,
        alt: 'Vector (a,b) rotated through angle theta onto (r,0) on the axis, with the rotation arc and angle labeled',
        caption: 'A Givens rotation zeros just one entry at a time — ideal when you cannot afford to disturb the zeros already in place.' },
      { type: 'prose', paragraphs: [
      '**When to use Givens vs Householder.** Dense matrix QR: use Householder — it zeros an entire sub-column in $O(m)$ work, giving total cost $O(mn^2)$. Sparse matrix QR or incremental updates (one row changes): use Givens — each rotation touches only two entries, so existing zeros are preserved. Parallel computation: Givens rotations on independent row pairs can run simultaneously. The "streaming least squares" problem (update the QR as new data arrives) uses one Givens rotation per new data point.',

      '**Where this is heading.** Chapter 8 applies these building blocks to iterative methods for large systems: conjugate gradient, GMRES, and Lanczos all reduce ultimately to sequences of orthogonalization steps — Gram-Schmidt, Householder, or Givens variants. The stability concepts you learned here (and the numerical pitfalls you now recognize) are prerequisites for understanding when those iterative methods converge and when they fail.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Householder and Givens with NumPy',
        mathBridge: 'Implement a Householder reflector, apply it to zero a sub-column, build QR column-by-column, and compare stability to Gram-Schmidt.',
        caption: 'numpy.linalg.qr calls LAPACK dgeqrf internally — Householder reflections, exactly as implemented here.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Build a Householder reflector',
              prose: [
                'Construct H for a given vector x so that Hx = ||x|| e_1. Verify it is orthogonal and symmetric.',
                'Formula: `v = x + np.sign(x[0])*np.linalg.norm(x)*np.eye(len(x))[:,0]; v = v/np.linalg.norm(v); H = np.eye(len(x)) - 2*np.outer(v,v)`. Verify: `np.allclose(H @ x, np.linalg.norm(x)*np.eye(len(x))[:,0])` (maps x to ‖x‖e₁), `np.allclose(H.T, H)` (symmetric), `np.allclose(H @ H, np.eye(len(x)))` (orthogonal, H² = I).',
                'The sign choice `+sign(x[0])` avoids catastrophic cancellation when x is nearly parallel to e₁. Without it, `v ≈ x - x = 0` — the reflector degenerates. With the sign choice, ‖v‖ = ‖x‖ + |x₁| which is always large. This is a key numerical detail that separates textbook formulas from production implementations.',
              ],
              code: `import numpy as np

def householder(x):
    """Returns v s.t. H = I - 2vv^T/||v||^2 maps x -> -sign(x[0])||x||e_1"""
    v = x.copy().astype(float)
    sign = 1.0 if x[0] >= 0 else -1.0
    v[0] += sign * np.linalg.norm(x)
    return v

x = np.array([3.0, 4.0, 0.0])
v = householder(x)
H = np.eye(3) - 2 * np.outer(v, v) / (v @ v)

print("x =", x)
print("Hx =", np.round(H @ x, 10))
print("Expected: [-5, 0, 0]")
print()
print("H symmetric? ||H - H.T|| =", np.linalg.norm(H - H.T))
print("H orthogonal? ||H.T H - I|| =", np.linalg.norm(H.T @ H - np.eye(3)))
print("H involutory? ||H^2 - I|| =", np.linalg.norm(H @ H - np.eye(3)))
`,
            },
            {
              id: 2,
              cellTitle: 'Householder QR factorization',
              prose: [
                'Apply Householder reflectors column by column to triangularize A. Compare the result to numpy.linalg.qr.',
                'Algorithm: start with R = A, Q = I. For column k: extract `x = R[k:, k]`, build Householder H_k (acts on the subspace from row k), apply to R: `R[k:, k:] = H_k @ R[k:, k:]`, accumulate Q: `Q[:, k:] = Q[:, k:] @ H_k.T`. After n-1 steps, R is upper triangular.',
                'Compare: `np.allclose(Q @ R, A)` and `np.allclose(Q.T @ Q, np.eye(n))`. Compare R to `np.linalg.qr(A)[1]` — they should be equal (up to sign). The key efficiency: never form H_k as a full n×n matrix. Instead apply the rank-1 update `H_k @ v = v - 2*(u.T@v)*u` directly — each application costs O(n) instead of O(n²).',
              ],
              code: `import numpy as np

def householder_qr(A):
    m, n = A.shape
    R = A.copy().astype(float)
    Q = np.eye(m)
    for k in range(n):
        x = R[k:, k]
        sign = 1.0 if x[0] >= 0 else -1.0
        v = x.copy()
        v[0] += sign * np.linalg.norm(x)
        if np.linalg.norm(v) < 1e-14:
            continue
        v = v / np.linalg.norm(v)
        # Apply H_k to R and Q
        R[k:, :] -= 2 * np.outer(v, v @ R[k:, :])
        Q[:, k:] -= 2 * np.outer(Q[:, k:] @ v, v)
    return Q, R

A = np.array([[1,2,3],[4,5,6],[7,8,10],[1,0,1]], dtype=float)
Q, R = householder_qr(A)

print("R (should be upper triangular):")
print(np.round(R, 4))
print()
print("||QR - A||:", np.linalg.norm(Q @ R - A))
print("||Q.T Q - I||:", np.linalg.norm(Q.T @ Q - np.eye(4)))
`,
            },
            {
              id: 3,
              cellTitle: 'Stability: Householder vs classical Gram-Schmidt',
              prose: [
                'For an ill-conditioned matrix, compare how far Q deviates from orthogonality between Gram-Schmidt and Householder.',
                'Build a Vandermonde matrix `A = np.vander(np.linspace(0.1, 1, 10), 8)` (high condition number). Classical Gram-Schmidt: implement the MGS/CGS algorithm manually to get Q_gs. Householder: `Q_hh, _ = np.linalg.qr(A)`. Orthogonality error: `norm(Q.T @ Q - I)` for both.',
                'The orthogonality error for classical Gram-Schmidt scales like `cond(A) * eps` — for a Vandermonde matrix with cond ~10^8, this means ~10^-8 orthogonality error. Householder gives ~10^-14 (near machine epsilon). Plot both errors as a function of matrix condition number. Householder is always better by a factor of roughly `cond(A)` — for ill-conditioned problems, this is the difference between garbage and a correct answer.',
              ],
              code: `import numpy as np

# Nearly rank-deficient matrix (ill-conditioned)
n = 20
t = np.linspace(0, 1, n)
A = np.column_stack([t**k for k in range(10)])  # Vandermonde, kappa ~ 10^12

# Classical Gram-Schmidt
def cgs(A):
    m, n = A.shape
    Q = np.zeros((m, n))
    for j in range(n):
        q = A[:, j].copy()
        for i in range(j):
            q -= (Q[:, i] @ A[:, j]) * Q[:, i]
        Q[:, j] = q / np.linalg.norm(q)
    return Q

Q_gs = cgs(A)
Q_hh, _ = np.linalg.qr(A, mode='reduced')   # Householder internally

print(f"Condition number of A: {np.linalg.cond(A):.2e}")
print()
print("||Q.T Q - I|| (Gram-Schmidt): ", np.linalg.norm(Q_gs.T @ Q_gs - np.eye(10)))
print("||Q.T Q - I|| (Householder):  ", np.linalg.norm(Q_hh.T @ Q_hh - np.eye(10)))
print()
print("Gram-Schmidt Q loses orthogonality; Householder keeps it machine-precise")
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Householder and Givens in Action',
        mathBridge: 'Implement Householder reflections and compare to Gram-Schmidt QR.',
        caption: 'Orthogonal triangularization: stable QR via reflections and rotations.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Householder QR factorization',
              prose: [
                'Implement Householder QR and compare orthogonality to Gram-Schmidt.',
                'Householder reflector for column k: `x = A(k:end,k); v = x + sign(x(1))*norm(x)*eye(length(x),1); v = v/norm(v); H = eye(length(x)) - 2*(v*v\')`. Apply to A: `A(k:end,:) = H * A(k:end,:)`. After all columns, A becomes R.',
                'Compare orthogonality: compute Gram-Schmidt Q via `[Q_gs,~] = qr(A)` vs explicit Householder accumulation. `norm(Q_gs\'*Q_gs - eye(n))` vs `norm(Q_hh\'*Q_hh - eye(n))`. For a Vandermonde matrix with `vander(0.1:0.1:1, 8)`, Householder wins by many orders of magnitude. MATLAB\'s `qr` function uses Householder — this is why it is numerically preferred over Gram-Schmidt.',
              ],
              code: `% Householder QR factorization
function [Q, R] = householder_qr(A)
    [m, n] = size(A)
    Q = eye(m)
    R = A
    for k = 1:min(m-1, n)
        x = R(k:m, k)
        v = x
        v(1) = x(1) + sign(x(1))*norm(x)
        if norm(v) > 1e-12
            H_k = eye(m-k+1) - 2*(v*v')/(v'*v)
            R(k:m, :) = H_k * R(k:m, :)
            Q_full = eye(m)
            Q_full(k:m, k:m) = H_k
            Q = Q * Q_full
        end
    end
end

% Test on a random matrix
A = randn(6, 4)
[Q, R] = householder_qr(A)

disp('Q^T * Q (should be identity):')
round(Q'' * Q, 6)

disp('Q * R vs A (should be 0):')
norm(Q * R - A)

disp('R (should be upper triangular):')
round(R, 4)

% Check orthogonality vs classical Gram-Schmidt
disp('Max off-diagonal of Q^T*Q:')
QTQ = Q'' * Q - eye(size(Q,1))
max(max(abs(QTQ)))
`,
            },
            {
              id: 2,
              cellTitle: 'Givens rotation for sparse update',
              prose: [
                'Apply a Givens rotation to zero one entry, preserving other zeros.',
                'Givens rotation to zero A(i,j): `r = hypot(A(i,i), A(j,i)); c = A(i,i)/r; s = A(j,i)/r; G = eye(n); G(i,i)=c; G(i,j)=s; G(j,i)=-s; G(j,j)=c; A_new = G * A`. After applying, `A_new(j,i)` is exactly zero. Verify: `A_new(j,i)` ≈ 0, `norm(G*G\' - eye(n))` ≈ 0 (Givens is orthogonal).',
                'The key advantage over Householder: a Givens rotation is a rank-2 update (only rows i and j change). For a sparse matrix, applying a Givens rotation touches only 2 rows — it preserves zeros in all other rows. `spy(A)` before and after shows which zeros are preserved. This is why Givens rotations are used for QR updates (adding/removing a row from A without full re-factorization).',
              ],
              code: `% Givens rotation: zero out one element
% G * [a; b] = [r; 0]
function G = givens(a, b)
    r = sqrt(a^2 + b^2)
    if r < 1e-14
        G = eye(2)
    else
        c = a/r
        s = b/r
        G = [c s; -s c]
    end
end

% Example: zero the (3,1) entry while preserving sparsity
A = [2 1 3;
     4 5 6;
     7 8 9;
     0 2 1]

disp('Original A:')
A

% Apply Givens to rows 1 and 3 to zero A(3,1)
G_13 = givens(A(1,1), A(3,1))
A_after = A
A_after([1,3], :) = G_13 * A([1,3], :)
disp('After zeroing (3,1):')
round(A_after, 4)

% Verify: entry (3,1) should be ~0
fprintf('A(3,1) after rotation: %.2e\\n', A_after(3,1))

% Orthogonality: G is orthogonal
fprintf('G^T*G - I: %.2e\\n', norm(G_13''*G_13 - eye(2)))
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Apply a Householder Reflector to a Matrix (4 Steps)',
        body: '1. **Form $\\mathbf{v}$.** For column $k$ of $A$, take the subvector $\\mathbf{x} = A[k{:},k]$. Compute $\\mathbf{v} = \\mathbf{x} + \\operatorname{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$. Use $+$ (not $-$) regardless of the sign of $x_1$ — this is the cancellation-safe form.\n2. **Compute the scale $\\beta$.** Set $\\beta = 2/(\\mathbf{v}^\\top\\mathbf{v})$. Store only $\\beta$ and $\\mathbf{v}$ — never form the $m\\times m$ matrix $H = I - \\beta\\mathbf{v}\\mathbf{v}^\\top$.\n3. **Apply to the panel.** For each column $j \\geq k$: compute scalar $s = \\mathbf{v}^\\top A[k{:},j]$, then update $A[k{:},j] \\mathrel{-}= \\beta\\cdot s\\cdot\\mathbf{v}$. Cost: $O((m-k)(n-k))$ flops — a rank-1 update, not a matrix multiply.\n4. **Repeat for each column.** After $\\min(m-1,n)$ steps, $A$ is upper triangular ($=R$). Accumulate $Q = H_1\\cdots H_n$ only if explicitly needed — most least-squares solvers avoid forming $Q$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 7 of 7 — Numerical Linear Algebra',
        body: '**Previous (Lesson 6):** Schur decomposition — always-existing upper triangular eigenvalue form, the QR algorithm.\n**This lesson:** Householder reflections and Givens rotations — the elementary orthogonal operations that implement QR stably in all production software.\n**Next (Chapter 8):** Iterative methods — conjugate gradient, GMRES — which use these building blocks at massive scale.',
      },
      {
        type: 'theorem',
        title: 'Householder Reflector',
        body: 'For any nonzero $\\mathbf{x} \\in \\mathbb{R}^n$, with $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$:\n\n$H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$\n\n$H\\mathbf{x} = -\\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$\n\nProperties: $H = H^\\top$, $H^2 = I$, $\\det H = -1$, $\\kappa(H) = 1$.',
      },
      {
        type: 'insight',
        title: 'Givens vs Householder: when to use each',
        body: '**Householder**: zeros an entire sub-column in $O(m)$ work. Best for dense matrices. Total QR cost: $O(mn^2 - n^3/3)$ flops.\n\n**Givens**: zeros one entry per rotation at fixed cost of 6 operations. Best for sparse matrices (preserves zeros), streaming updates, and parallel algorithms.\n\n**Never use**: classical Gram-Schmidt. Modified Gram-Schmidt is acceptable only for building $Q$ incrementally.',
      },
    ],
  },

  math: {
    prose: [
      '**WY representation for efficient computation.** Storing the product $Q = H_1\\cdots H_k$ explicitly is expensive. The **WY representation** stores the product of $k$ Householder reflectors as $Q = I - WY^\\top$ where $W, Y \\in \\mathbb{R}^{m\\times k}$. This allows applying $Q$ to a matrix $B$ as $QB = B - W(Y^\\top B)$, using $2mnk$ flops (matrix-matrix multiply) instead of $2mk$ flops per reflector $k$ times. LAPACK uses blocked Householder (WY form) for cache efficiency on modern CPUs.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cost of QR Factorization',
        body: 'For an $m \\times n$ matrix ($m \\geq n$):\n\n**Gram-Schmidt**: $2mn^2$ flops, but numerically unstable for ill-conditioned $A$.\n\n**Householder QR**: $2mn^2 - 2n^3/3$ flops (nearly the same), but orthogonality maintained to machine precision.\n\n**Givens for banded matrix** (bandwidth $b$): $O(mnb)$ flops — much cheaper when $b \\ll n$.\n\nFor large matrices, Householder is preferred due to cache-friendly blocked implementations.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Loss of orthogonality in Gram-Schmidt.** Classical Gram-Schmidt suffers from catastrophic cancellation: if two columns nearly point in the same direction, subtracting the projection gives a vector near zero, with huge relative error. Modified Gram-Schmidt (MGS) avoids this by updating projections sequentially. But even MGS loses orthogonality when $A$ is nearly rank-deficient. The loss of orthogonality in MGS is bounded by $\\|Q^\\top Q - I\\|_F \\leq c\\epsilon_{\\text{mach}}\\kappa(A)^2$, where $\\kappa(A)$ is the condition number. Householder maintains $\\|Q^\\top Q-I\\|_F \\leq c\\epsilon_{\\text{mach}}$ regardless of $\\kappa(A)$.',
      '**Rank-revealing QR with column pivoting.** The standard Householder QR processes columns left-to-right. Column-pivoted QR selects at each step the column with the largest remaining norm as the next pivot: $AP = QR$ where $P$ is a permutation. The diagonal entries of $R$ satisfy $|r_{11}| \\geq |r_{22}| \\geq \\cdots \\geq |r_{nn}|$. If $A$ is numerically rank-deficient, the small diagonal entries reveal this: the numerical rank is the number of entries $|r_{kk}| > \\text{tol}$. The Golub-Businger algorithm implementing this requires $O(n)$ extra work per step for norm updates (maintain $\\|A[k{:},j]\\|^2$ with Rank-1 downdate after each step). MATLAB\'s `[Q,R,E] = qr(A)` and `scipy.linalg.qr(A, pivoting=True)` return this pivoted factorization.',
      '**Backward stability of Householder QR.** Householder QR is backward stable: the computed $\\hat{Q}$ and $\\hat{R}$ satisfy $\\hat{Q}\\hat{R} = A + \\delta A$ with $\\|\\delta A\\|_F \\leq c(m,n)\\,\\epsilon_{\\text{mach}}\\|A\\|_F$, where $c$ grows only polynomially with $m$ and $n$ (typically $c \\approx 3$). Orthogonality loss: $\\|\\hat{Q}^\\top\\hat{Q}-I\\|_F = O(\\epsilon_{\\text{mach}})$ regardless of $\\kappa(A)$, compared to $O(\\kappa(A)\\,\\epsilon_{\\text{mach}})$ for modified Gram-Schmidt and $O(\\kappa(A)^2\\epsilon_{\\text{mach}})$ for classical GS. This makes Householder QR reliable for least-squares problems even when $A$ has condition number up to $1/\\epsilon_{\\text{mach}} \\approx 10^{16}$.',
      '**Blocked Householder and LAPACK\'s `dgeqrf`.** LAPACK processes QR in blocks of $b$ columns (typically $b=64$). For a block of $b$ reflectors $H_{k+1}\\cdots H_{k+b}$, the compact WY representation writes their product as $I - WY^\\top$ where $W,Y \\in \\mathbb{R}^{m\\times b}$ are accumulated once at cost $O(mb^2)$. Applying the whole block to the remaining $(n-b)$ columns costs one Level-3 BLAS call: $A[k{:},k+b{:}] \\mathrel{-}= W(Y^\\top A[k{:},k+b{:}])$, using 2mb(n-b) flops at near-peak hardware throughput. Compared to the unblocked algorithm (Level-2 BLAS), the blocked version achieves 5–10× speedup on modern CPUs and GPUs due to cache reuse. This is why `numpy.linalg.qr` is fast even for large matrices.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Updating QR When One Row Changes',
        body: 'Given $A = QR$ and a new row appended: $A\' = \\begin{pmatrix}A\\\\\\mathbf{c}^\\top\\end{pmatrix}$. Rather than recompute QR from scratch:\n1. New $R\' = \\begin{pmatrix}R\\\\\\mathbf{c}^\\top\\end{pmatrix}$ (an $n\\times n$ upper triangular matrix with one extra row)\n2. Apply $n$ Givens rotations to restore upper triangular form\n\nCost: $O(n^2)$ instead of $O(mn^2)$ from scratch. This is the key operation in online least-squares regression.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-007-1',
      title: 'Householder reflector that zeros a vector',
      problem: 'Find the Householder reflector $H$ such that $H(3,4,0)^\\top = (-5,0,0)^\\top$. Verify $H$ is symmetric, orthogonal, and involutory.',
      steps: [
        { explanation: '$\\mathbf{x} = (3,4,0)^\\top$, $\\|\\mathbf{x}\\| = 5$. Choose $\\mathbf{v} = \\mathbf{x} + \\text{sign}(3)\\cdot5\\cdot\\mathbf{e}_1 = (3+5,4,0)^\\top = (8,4,0)^\\top$ (using positive sign since $x_1=3>0$).' },
        { explanation: '$\\|\\mathbf{v}\\|^2 = 64+16+0=80$. $H = I_3 - \\frac{2}{80}\\mathbf{v}\\mathbf{v}^\\top = I - \\frac{1}{40}\\begin{pmatrix}64&32&0\\\\32&16&0\\\\0&0&0\\end{pmatrix} = \\begin{pmatrix}-3/5&-4/5&0\\\\-4/5&3/5&0\\\\0&0&1\\end{pmatrix}$.' },
        { explanation: 'Check $H\\mathbf{x}$: $H(3,4,0)^\\top = (-9/5-16/5, -12/5+12/5, 0) = (-5,0,0)^\\top$ ✓.' },
        { explanation: 'Symmetric: $H^\\top = H$ ✓ (inspection). Orthogonal: $H^\\top H = H^2 = I - 4\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2 + 4\\mathbf{v}(\\mathbf{v}^\\top\\mathbf{v})\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^4 = I - 4\\mathbf{v}\\mathbf{v}^\\top/80 + 4\\mathbf{v}\\mathbf{v}^\\top/80 = I$ ✓. Involutory: $H^2=I$ ✓ (just shown).' },
        { explanation: 'Determinant: $\\det H = -1$ (reflector, not rotation). The third row/column is untouched since $v_3=0$.' },
      ],
    },
    {
      id: 'ex-la7-007-2',
      title: 'Givens rotation for QR: zeroing one entry',
      problem: 'Apply Givens rotations to triangularize $A = \\begin{pmatrix}3&1\\\\4&2\\end{pmatrix}$. Step: zero the $(2,1)$ entry.',
      steps: [
        { explanation: 'Givens rotation to zero $a_{21}=4$ using $a_{11}=3$: $r = \\sqrt{9+16}=5$, $c=3/5$, $s=4/5$.' },
        { explanation: 'Rotation matrix: $G = \\begin{pmatrix}c&s\\\\-s&c\\end{pmatrix} = \\begin{pmatrix}3/5&4/5\\\\-4/5&3/5\\end{pmatrix}$.' },
        { explanation: 'Apply to $A$: $GA = \\begin{pmatrix}3/5&4/5\\\\-4/5&3/5\\end{pmatrix}\\begin{pmatrix}3&1\\\\4&2\\end{pmatrix} = \\begin{pmatrix}9/5+16/5&3/5+8/5\\\\-12/5+12/5&-4/5+6/5\\end{pmatrix} = \\begin{pmatrix}5&11/5\\\\0&2/5\\end{pmatrix}$.' },
        { explanation: '$GA = R = \\begin{pmatrix}5&2.2\\\\0&0.4\\end{pmatrix}$ (upper triangular). So $A = G^\\top R = QR$ where $Q = G^\\top = \\begin{pmatrix}3/5&-4/5\\\\4/5&3/5\\end{pmatrix}$ (orthogonal matrix of cosines and sines).' },
        { explanation: 'Verify: $QR = \\begin{pmatrix}3/5&-4/5\\\\4/5&3/5\\end{pmatrix}\\begin{pmatrix}5&11/5\\\\0&2/5\\end{pmatrix} = \\begin{pmatrix}3&11/25-8/25\\\\4&44/25+6/25\\end{pmatrix}$... let me recheck: $(1,2)$: $3/5\\cdot11/5+(-4/5)\\cdot2/5=(33-8)/25=25/25=1$ ✓. $(2,1)$: $4/5\\cdot5+3/5\\cdot0=4$ ✓. $(2,2)$: $4/5\\cdot11/5+3/5\\cdot2/5=(44+6)/25=2$ ✓. So $A=QR$ ✓.' },
      ],
    },
    {
      id: 'ex-la7-007-3',
      title: 'Householder QR for a 3×2 matrix',
      problem: 'Compute the QR factorization of $A = \\begin{pmatrix}1&2\\\\2&3\\\\2&5\\end{pmatrix}$ using one Householder reflection.',
      steps: [
        { explanation: 'Step 1: zero entries below diagonal in column 1. $\\mathbf{x} = (1,2,2)^\\top$, $\\|\\mathbf{x}\\| = 3$. $\\mathbf{v} = \\mathbf{x} + \\text{sign}(1)\\cdot3\\cdot\\mathbf{e}_1 = (1+3,2,2)^\\top = (4,2,2)^\\top$.' },
        { explanation: '$\\|\\mathbf{v}\\|^2 = 16+4+4=24$. $H_1 = I_3 - \\frac{2}{24}\\mathbf{v}\\mathbf{v}^\\top = I - \\frac{1}{12}\\begin{pmatrix}16&8&8\\\\8&4&4\\\\8&4&4\\end{pmatrix} = \\begin{pmatrix}-1/3&-2/3&-2/3\\\\-2/3&2/3&-1/3\\\\-2/3&-1/3&2/3\\end{pmatrix}$.' },
        { explanation: 'Apply to $A$: $H_1 A$. Column 1: $H_1(1,2,2)^\\top = (-3,0,0)^\\top$ ✓. Column 2: $H_1(2,3,5)^\\top$. Compute: $(-2/3\\cdot2-2/3\\cdot3-2/3\\cdot5, -2/3\\cdot2+2/3\\cdot3-1/3\\cdot5, -2/3\\cdot2-1/3\\cdot3+2/3\\cdot5)^\\top$. Wait, use $H_1 = I-\\mathbf{v}\\mathbf{v}^\\top/12$: $(H_1 c_2) = c_2 - (\\mathbf{v}^\\top c_2/12)\\mathbf{v}$. $\\mathbf{v}^\\top(2,3,5)^\\top = 8+6+10=24$. $(H_1 c_2) = (2,3,5)^\\top - (24/12)(4,2,2)^\\top = (2,3,5)^\\top - 2(4,2,2)^\\top = (-6,-1,1)^\\top$.' },
        { explanation: 'So $R = H_1 A = \\begin{pmatrix}-3&-6\\\\0&-1\\\\0&1\\end{pmatrix}$. Now step 2: apply a $2\\times2$ Householder to rows 2-3 of column 2. $\\mathbf{x}_2 = (-1,1)^\\top$, $\\|\\mathbf{x}_2\\|=\\sqrt{2}$. $\\mathbf{v}_2 = (-1-\\sqrt{2},1)^\\top$. After this second reflector, $R$ becomes fully upper triangular.' },
        { explanation: '$Q = H_1 H_2$ (product of reflectors). In practice, $Q$ is never explicitly formed — the Householder vectors are stored and applied implicitly. $A = QR$ with $Q$ orthogonal and $R$ upper triangular.' },
      ],
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la7-007-householder-reflection',
      title: 'Building a Householder Reflector to Zero Out a Column',
      prereqs: ['Unit vectors', 'Outer products', 'Orthogonal matrices'],
      problem: 'Find the Householder matrix $H$ that maps $\\mathbf{x} = [3,4]^\\top$ to $[5,0]^\\top$ (a vector parallel to $\\mathbf{e}_1$).',
      steps: [
        {
          label: 'Compute the target: $\\|\\mathbf{x}\\|\\mathbf{e}_1$',
          strategy: 'A Householder reflector maps $\\mathbf{x}$ to $\\pm\\|\\mathbf{x}\\|\\mathbf{e}_1$. Choose the sign to avoid cancellation.',
          explanation: '$\\|\\mathbf{x}\\| = \\sqrt{9+16}=5$. Target: $\\alpha\\mathbf{e}_1 = [5,0]^\\top$ (use $+$ since $x_1=3>0$; using $-\\|\\mathbf{x}\\|$ when $x_1<0$ avoids cancellation in step 2).',
          math: '\\|\\mathbf{x}\\|=5,\\quad \\text{target}=[5,0]^\\top',
        },
        {
          label: 'Form the Householder vector $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$',
          strategy: '$\\mathbf{v}$ bisects the angle between $\\mathbf{x}$ and the target. Reflecting through the plane normal to $\\mathbf{v}$ maps $\\mathbf{x}$ to the target.',
          explanation: '$\\mathbf{v} = [3,4]^\\top - [5,0]^\\top = [-2,4]^\\top$.',
          math: '\\mathbf{v} = \\begin{bmatrix}-2\\\\4\\end{bmatrix}',
        },
        {
          label: 'Build $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$',
          strategy: 'The Householder formula: reflect through the hyperplane orthogonal to $\\mathbf{v}$.',
          explanation: '$\\|\\mathbf{v}\\|^2 = 4+16=20$. $\\mathbf{v}\\mathbf{v}^\\top = \\begin{bmatrix}4&-8\\\\-8&16\\end{bmatrix}$. $H = I - \\frac{1}{10}\\begin{bmatrix}4&-8\\\\-8&16\\end{bmatrix} = \\begin{bmatrix}3/5&4/5\\\\4/5&-3/5\\end{bmatrix}$.',
          math: 'H = \\begin{bmatrix}3/5&4/5\\\\4/5&-3/5\\end{bmatrix}',
          gotcha: '$H$ is symmetric ($H^\\top=H$) and orthogonal ($H^\\top H=I$) — but $H\\neq I$. These two properties mean $H^2=I$ (reflecting twice = identity), i.e., $H$ is its own inverse.',
        },
        {
          label: 'Verify $H\\mathbf{x} = [5,0]^\\top$',
          strategy: 'Multiply $H$ by $\\mathbf{x}$.',
          explanation: '$H[3,4]^\\top = [9/5+16/5, 12/5-12/5]^\\top = [25/5, 0]^\\top = [5,0]^\\top$ ✓.',
          math: 'H\\mathbf{x} = \\begin{bmatrix}5\\\\0\\end{bmatrix} \\checkmark',
        },
      ],
    },
    {
      id: 'wt-la7-007-givens-rotation',
      title: 'Givens Rotation: Zeroing a Single Entry',
      prereqs: ['Rotation matrices', 'Trigonometry', 'Sparse updates'],
      problem: 'Find the Givens rotation $G$ that maps $\\mathbf{x}=[3,4]^\\top$ to $[5,0]^\\top$, and explain when to prefer Givens over Householder.',
      steps: [
        {
          label: 'Set up: $G$ rotates the $(i,j)$ plane to zero out entry $j$',
          strategy: 'A Givens rotation $G(i,j,\\theta)$ applies a 2×2 rotation in the $(i,j)$ plane: $c=\\cos\\theta$, $s=\\sin\\theta$, chosen so $(cx_i+sx_j)=r$ and $(-sx_i+cx_j)=0$.',
          explanation: 'We want $-sx_i+cx_j=0$ (zero out the second component). $-3s+4c=0 \\Rightarrow s/c = 4/3$.',
          math: '-sx_i+cx_j=0 \\Rightarrow \\tan\\theta = s/c = 4/3',
        },
        {
          label: 'Compute $c$ and $s$ from $r=\\|\\mathbf{x}\\|$',
          strategy: '$c=x_i/r$, $s=x_j/r$ where $r=\\sqrt{x_i^2+x_j^2}$.',
          explanation: '$r=5$, $c=3/5$, $s=4/5$.',
          math: 'c=\\frac{3}{5},\\quad s=\\frac{4}{5},\\quad r=5',
        },
        {
          label: 'Build and apply $G$',
          strategy: '$G = \\begin{bmatrix}c&s\\\\-s&c\\end{bmatrix} = \\begin{bmatrix}3/5&4/5\\\\-4/5&3/5\\end{bmatrix}$.',
          explanation: '$G\\mathbf{x} = [3/5\\cdot3+4/5\\cdot4, -4/5\\cdot3+3/5\\cdot4]^\\top = [5,0]^\\top$ ✓.',
          math: 'G = \\begin{bmatrix}3/5&4/5\\\\-4/5&3/5\\end{bmatrix},\\quad G\\mathbf{x}=[5,0]^\\top\\checkmark',
          gotcha: 'Givens $\\neq$ Householder: Givens zeros ONE entry (modifies 2 rows); Householder zeros a whole column below the pivot (modifies ALL rows). Givens is preferred for sparse matrices (fewer entries modified) or when only a few zeros are needed (e.g., tridiagonalization, QR updating).',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la7-007-1',
      title: 'Proof that Householder is orthogonal',
      difficulty: 'easy',
      problem: 'Prove that $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$ is both symmetric and orthogonal (hence $H^{-1} = H$).',
      walkthrough: [
        { expression: 'H^\\top = \\left(I - \\frac{2\\mathbf{v}\\mathbf{v}^\\top}{\\|\\mathbf{v}\\|^2}\\right)^\\top = I - \\frac{2(\\mathbf{v}\\mathbf{v}^\\top)^\\top}{\\|\\mathbf{v}\\|^2} = I - \\frac{2\\mathbf{v}\\mathbf{v}^\\top}{\\|\\mathbf{v}\\|^2} = H', annotation: 'Outer product vv^T is symmetric: (vv^T)^T = vv^T. So H^T = H.' },
        { expression: 'P = \\frac{\\mathbf{v}\\mathbf{v}^\\top}{\\|\\mathbf{v}\\|^2} \\Rightarrow P^2 = \\frac{\\mathbf{v}(\\mathbf{v}^\\top\\mathbf{v})\\mathbf{v}^\\top}{\\|\\mathbf{v}\\|^4} = \\frac{\\mathbf{v}\\mathbf{v}^\\top}{\\|\\mathbf{v}\\|^2} = P', annotation: 'P is the rank-1 projection onto v. Idempotent: projecting twice equals projecting once.' },
        { expression: 'H^2 = (I-2P)^2 = I - 4P + 4P^2 = I - 4P + 4P = I', annotation: 'Use P^2=P to simplify. So H^2=I, which means H^{-1}=H. Combined with H^T=H: H^T H = H^2 = I, confirming orthogonality.' },
        { expression: '\\det H = -1 \\text{ (reflection, not rotation)}', annotation: 'Eigenvalues of H are +1 (multiplicity n-1, for vectors perpendicular to v) and -1 (for v itself). Product of eigenvalues = det(H) = -1.' },
      ],
    },
    {
      id: 'ch-la7-007-2',
      title: 'Givens rotation parameters and verification',
      difficulty: 'easy',
      problem: 'For $a=4$, $b=3$: (a) find $c$, $s$, $r$ for the Givens rotation that maps $(a,b)^\\top \\to (r,0)^\\top$; (b) write $G$; (c) verify $G(4,3)^\\top = (5,0)^\\top$ and $G^\\top G = I$.',
      walkthrough: [
        { expression: 'r = \\sqrt{a^2+b^2} = \\sqrt{16+9} = 5, \\quad c = a/r = 4/5, \\quad s = b/r = 3/5', annotation: 'The rotation angle θ = arctan(b/a). We never need θ explicitly — only c and s.' },
        { expression: 'G = \\begin{pmatrix}c&s\\\\-s&c\\end{pmatrix} = \\begin{pmatrix}4/5&3/5\\\\-3/5&4/5\\end{pmatrix}', annotation: 'G rotates by -θ in the (a,b) plane, mapping the vector to the positive horizontal axis.' },
        { expression: 'G\\begin{pmatrix}4\\\\3\\end{pmatrix} = \\begin{pmatrix}(4/5)(4)+(3/5)(3)\\\\(-3/5)(4)+(4/5)(3)\\end{pmatrix} = \\begin{pmatrix}16/5+9/5\\\\-12/5+12/5\\end{pmatrix} = \\begin{pmatrix}5\\\\0\\end{pmatrix}\\;\\checkmark', annotation: 'The second component cancels to zero — this is the designed effect of the rotation.' },
        { expression: 'G^\\top G = \\begin{pmatrix}4/5&-3/5\\\\3/5&4/5\\end{pmatrix}\\begin{pmatrix}4/5&3/5\\\\-3/5&4/5\\end{pmatrix} = \\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}\\;\\checkmark', annotation: 'c^2+s^2 = 16/25+9/25 = 1 on the diagonal; cs-sc = 0 off-diagonal. G is orthogonal.' },
      ],
    },
    {
      id: 'ch-la7-007-3',
      title: 'Householder reflector for a 4-vector with zero leading entry',
      difficulty: 'hard',
      problem: 'Find the Householder reflector $H$ such that $H(0,3,4,0)^\\top = (-5,0,0,0)^\\top$. Verify $H\\mathbf{x}$ gives the correct result, and confirm $\\|\\mathbf{x}\\|$ is preserved.',
      walkthrough: [
        { expression: '\\mathbf{x} = (0,3,4,0)^\\top, \\quad \\|\\mathbf{x}\\| = \\sqrt{0+9+16+0} = 5', annotation: 'Norm of x is 5. The target is to map x to -5e_1 = (-5,0,0,0)^T.' },
        { expression: '\\mathbf{v} = \\mathbf{x} + \\operatorname{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1 = (0,3,4,0)^\\top + 1\\cdot5\\cdot(1,0,0,0)^\\top = (5,3,4,0)^\\top', annotation: 'sign(0) = +1 by convention. v[0] = 0+5 = 5; no catastrophic cancellation since x_1=0 is not close to ||x||.' },
        { expression: '\\|\\mathbf{v}\\|^2 = 25+9+16+0 = 50, \\quad \\beta = 2/50 = 1/25', annotation: 'The scale factor β = 2/||v||^2 is used in place of forming the full n×n matrix H.' },
        { expression: '\\mathbf{v}^\\top\\mathbf{x} = 5\\cdot0+3\\cdot3+4\\cdot4+0\\cdot0 = 25', annotation: 'Inner product v^T x = 25. This is the scalar needed for the rank-1 update.' },
        { expression: 'H\\mathbf{x} = \\mathbf{x} - \\beta(\\mathbf{v}^\\top\\mathbf{x})\\mathbf{v} = (0,3,4,0)^\\top - \\tfrac{1}{25}\\cdot25\\cdot(5,3,4,0)^\\top = (0,3,4,0)^\\top - (5,3,4,0)^\\top = (-5,0,0,0)^\\top\\;\\checkmark', annotation: 'The formula H x = x - 2(v^T x / ||v||^2) v. Norm check: ||Hx|| = 5 = ||x|| ✓ — orthogonal transformations preserve length.' },
      ],
    },
  ],

  mentalModel: [
    'Householder: $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$. Zeros entire sub-column. Symmetric, orthogonal, involutory.',
    'Givens: $G(c,s)$ zeros ONE entry. Cost: 4 multiplications. Best for sparse matrices.',
    'QR via Householder: stable, $O(mn^2)$ flops. Never compute $Q$ explicitly unless needed.',
    'Sign choice in $\\mathbf{v}$: always choose $\\text{sign}(x_1)$ to avoid cancellation.',
    'Gram-Schmidt (modified) is $O(mn^2)$ but loses orthogonality for ill-conditioned matrices.',
  ],

  checkpoints: [
    { id: 'cp-la7-007-1', label: 'Read the Householder reflector formula and the numerical example', type: 'read' },
    { id: 'cp-la7-007-2', label: 'Read the Givens rotation construction and when to use each', type: 'read' },
    { id: 'cp-la7-007-3', label: 'Read the cost comparison: Householder vs Givens vs Gram-Schmidt', type: 'read' },
    { id: 'cp-la7-007-4', label: 'Implement Householder QR and verify orthogonality in the notebook', type: 'lab' },
    { id: 'cp-la7-007-5', label: 'Apply a Givens rotation to zero one entry in the notebook', type: 'lab' },
    { id: 'cp-la7-007-6', label: 'Trace the Householder reflector that zeros a 3D vector', type: 'example' },
    { id: 'cp-la7-007-7', label: 'Trace the Givens QR factorization of a 2×2 matrix', type: 'example' },
    { id: 'cp-la7-007-8', label: 'Prove Householder is symmetric and orthogonal', type: 'challenge' },
  ],

  assessment: 'For $\\mathbf{x} = (0, 3, 4)^\\top$: (a) find the Householder reflector $H$ that maps $\\mathbf{x}$ to $\\|\\mathbf{x}\\|\\mathbf{e}_1$; (b) verify $H$ is orthogonal; (c) apply $H$ to the matrix $A = [\\mathbf{x} | \\mathbf{y}]$ where $\\mathbf{y}=(1,2,3)^\\top$ and describe what happened to column 1.',

  quiz: [
    {
      id: 'q-la7-007-1',
      type: 'choice',
      text: 'The Householder reflector $H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2$ is:',
      options: ['Symmetric but not orthogonal', 'Orthogonal but not symmetric', 'Both symmetric and orthogonal', 'Neither symmetric nor orthogonal'],
      answer: 'Both symmetric and orthogonal',
      hints: ['$H^\\top = H$ (symmetric) because $\\mathbf{v}\\mathbf{v}^\\top$ is symmetric.', '$H^2 = I$ (orthogonal) follows from $P^2=P$ for the projection $P$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-2',
      type: 'choice',
      text: 'The Householder vector $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$ uses $\\text{sign}(x_1)$ to:',
      options: ['Ensure $H$ is symmetric', 'Avoid numerical cancellation when $x_1$ is large', 'Make $\\mathbf{v}$ a unit vector', 'Ensure $H\\mathbf{x}$ has positive entries'],
      answer: 'Avoid numerical cancellation when $x_1$ is large',
      hints: ['If we used $-\\text{sign}(x_1)$, then $v_1 = x_1 - \\|x\\| \\approx 0$ when $x_1 \\approx \\|x\\|$.', 'Near-cancellation loses significant digits. The sign choice keeps $|v_1| = |x_1|+\\|x\\| \\geq \\|x\\|/\\sqrt{n}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-3',
      type: 'choice',
      text: 'For $\\mathbf{x}=(3,4)^\\top$ with $\\|\\mathbf{x}\\|=5$, the Householder reflector gives $H\\mathbf{x} =$',
      options: ['$(5,0)^\\top$', '$(-5,0)^\\top$', '$(0,5)^\\top$', '$(3,0)^\\top$'],
      answer: '$(-5,0)^\\top$',
      hints: ['With $\\text{sign}(x_1) = +1$: $\\mathbf{v} = (3+5,4)^\\top = (8,4)^\\top$.', '$H\\mathbf{x} = -\\text{sign}(x_1)\\|\\mathbf{x}\\|e_1 = -5e_1 = (-5,0)^\\top$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-4',
      type: 'choice',
      text: 'For a Givens rotation $G$ applied to zero $b$ using $a$: $c=a/r$, $s=b/r$, $r=\\sqrt{a^2+b^2}$. The result $G(a,b)^\\top$ is:',
      options: ['$(0,r)^\\top$', '$(r,0)^\\top$', '$(a,0)^\\top$', '$(0,a)^\\top$'],
      answer: '$(r,0)^\\top$',
      hints: ['$G = \\begin{pmatrix}c&s\\\\-s&c\\end{pmatrix}$.', '$(ca+sb, -sa+cb) = (a^2/r+b^2/r, -ab/r+ab/r) = (r, 0)$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-5',
      type: 'choice',
      text: 'The determinant of a Householder reflector $H$ is:',
      options: ['$+1$', '$-1$', '$0$', '$\\|\\mathbf{v}\\|$'],
      answer: '$-1$',
      hints: ['$H$ is an orthogonal matrix, so $\\det H = \\pm 1$.', 'A reflection reverses orientation, so $\\det H = -1$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-6',
      type: 'choice',
      text: 'Householder QR is numerically preferred over classical Gram-Schmidt because:',
      options: [
        'It is $O(n^2)$ faster',
        'Orthogonality is maintained to machine precision regardless of condition number',
        'It works for non-square matrices only',
        'It requires fewer floating-point operations',
      ],
      answer: 'Orthogonality is maintained to machine precision regardless of condition number',
      hints: ['Gram-Schmidt orthogonality error grows with $\\kappa(A)^2$.', 'Householder error is $O(\\epsilon_{\\text{mach}})$ regardless of conditioning.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-007-7',
      type: 'choice',
      text: 'Givens rotations are preferred over Householder for:',
      options: ['Dense matrices (more columns than rows)', 'Sparse matrices (to preserve sparsity)', 'Symmetric matrices', 'Matrices with rank deficiency'],
      answer: 'Sparse matrices (to preserve sparsity)',
      hints: ['Each Givens rotation zeros ONE entry, touching only two rows.', 'Householder zeros an entire column, potentially filling in sparse entries.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-8',
      type: 'choice',
      text: 'After applying a Householder reflector $H_1$ to zero below-diagonal entries of column 1 of $A$, the result $H_1 A$ has:',
      options: [
        'All entries in column 1 equal to zero',
        'Zero entries only below the diagonal in column 1',
        'The entire first row equal to zero',
        'All off-diagonal entries equal to zero',
      ],
      answer: 'Zero entries only below the diagonal in column 1',
      hints: ['$H_1$ is designed to map the column 1 subvector $(a_{11},\\ldots,a_{m1})^\\top$ to $(\\|\\cdot\\|,0,\\ldots,0)^\\top$.', 'The diagonal entry $r_{11} = \\|\\cdot\\|$ stays nonzero; everything below it becomes zero.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-007-9',
      type: 'choice',
      text: 'The Householder reflector $H$ satisfies $H^2 =$',
      options: ['$H$', '$2H - I$', '$I$', '$0$'],
      answer: '$I$',
      hints: ['$H$ is its own inverse (involutory).', '$H^2 = (I-2P)^2 = I - 4P + 4P^2 = I$ since $P^2=P$ for the projection.'],
      reviewSection: 'challenges',
    },
    {
      id: 'q-la7-007-10',
      type: 'choice',
      text: 'The cost of QR via Householder for an $m\\times n$ matrix ($m \\geq n$) is approximately:',
      options: ['$O(n^2)$ flops', '$O(mn)$ flops', '$O(mn^2)$ flops', '$O(m^2n)$ flops'],
      answer: '$O(mn^2)$ flops',
      hints: ['Each of $n$ Householder steps costs $O(mn)$ flops (to apply the reflector to remaining submatrix).', 'Total: $n \\times O(mn) = O(mn^2)$ flops.'],
      reviewSection: 'math',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given a vector $\\mathbf{x}$, construct the Householder reflector $H$ that maps $\\mathbf{x}$ to $\\pm\\|\\mathbf{x}\\|\\mathbf{e}_1$; for a 2×2 matrix, apply a Givens rotation to zero one entry and compute the resulting QR factorization.',
    explainVerbally: 'Explain why Householder QR is numerically more stable than Gram-Schmidt, what $\\mathbf{v}$ represents geometrically, and when Givens rotations are preferred.',
    detectIncorrectApplication: 'Catch the sign error in the Householder vector $\\mathbf{v}$ (using the wrong sign for $x_1$) which causes catastrophic cancellation for large $x_1$.',
    transferToUnfamiliar: 'Given a sparse matrix and a requirement to zero one specific entry without disturbing existing zeros, construct the appropriate Givens rotation and verify it achieves the goal.',
  },

  misconceptions: [
    {
      falseBelief: 'The Householder reflector $H\\mathbf{x}$ gives $(\\|\\mathbf{x}\\|, 0, \\ldots, 0)^\\top$ (positive).',
      whyStudentsThinkIt: 'We "want" the result to look like $\\|\\mathbf{x}\\|\\mathbf{e}_1$ with a positive leading entry. The sign convention is easy to mix up.',
      correctionExample: 'With $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$: $H\\mathbf{x} = -\\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$. For $x_1>0$: $H\\mathbf{x} = (-\\|\\mathbf{x}\\|,0,\\ldots)^\\top$ (NEGATIVE). This is intentional — we chose the sign to avoid cancellation in $v_1$.',
      contrastCase: 'If $x_1 < 0$: $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$ and $H\\mathbf{x} = +\\|\\mathbf{x}\\|\\mathbf{e}_1$ (positive). The sign of the result alternates with the sign of $x_1$. For QR, we only care that $R$ has the correct shape — the sign of $r_{11}$ can be negative.',
    },
    {
      falseBelief: 'Givens rotations are more expensive than Householder for all matrices.',
      whyStudentsThinkIt: 'Householder zeros an entire column in one step vs Givens doing one entry at a time. Students think fewer steps = fewer flops = better.',
      correctionExample: 'For a tridiagonal matrix ($n\\times n$ with 3 diagonals): Householder QR does $n$ steps, each touching $O(n)$ entries — $O(n^2)$ total. But each step creates fill-in! Givens can process the tridiagonal structure with $O(n)$ rotations, each touching only 2 entries — $O(n)$ total.',
      contrastCase: 'For DENSE matrices, Householder wins (fewer total operations per column). For SPARSE matrices with structure (banded, triangular, tridiagonal), Givens wins by preserving zeros.',
    },
  ],

  transferPrompts: [
    {
      situation: 'An online learning system updates a linear regression model every time a new data point $(\\mathbf{x}_{\\text{new}}, y_{\\text{new}})$ arrives. The current model is stored as the QR factorization of the data matrix $X$. How do you update the factorization without recomputing from scratch?',
      competingTechniques: 'Recompute QR from scratch ($O(mn^2)$ for the full matrix with the extra row) vs append $\\mathbf{x}_{\\text{new}}^\\top$ to $R$ and apply $n$ Givens rotations to restore upper triangular form ($O(n^2)$).',
      whyThisTechniqueWins: 'The update via Givens costs $O(n^2)$ instead of $O(mn^2)$ for a full recomputation. For large datasets with many updates, this is the difference between real-time and batch processing.',
    },
    {
      situation: 'A scientific computing pipeline needs to compute the QR decomposition of a $10000 \\times 100$ matrix on a GPU, where parallelism is key. Should it use Householder or Givens?',
      competingTechniques: 'Householder QR (each column step is sequential — step $k+1$ depends on step $k$, limiting parallelism) vs Givens rotations with tournament reduction (row pairs processed in parallel, $O(\\log m)$ rounds).',
      whyThisTechniqueWins: 'Givens rotations can be parallelized using a "communication-avoiding" tournament reduction: in the first round, rows 1-2, 3-4, 5-6, ... are processed simultaneously. In the second round, results are combined. Total: $O(\\log m)$ parallel steps of $O(n^2)$ work each, vs Householder\'s $O(n)$ sequential steps.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'H = I - 2\\mathbf{v}\\mathbf{v}^\\top/\\|\\mathbf{v}\\|^2', meaning: 'Householder reflector: symmetric, orthogonal ($H^{-1}=H$), maps $\\mathbf{x}$ to $-\\operatorname{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$.' },
      { symbol: '\\mathbf{v} = \\mathbf{x} + \\operatorname{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1', meaning: 'Stable reflector vector — the $+$ prevents cancellation when $x_1 \\approx \\|\\mathbf{x}\\|$; using $-$ would lose digits.' },
      { symbol: 'G(c,s)', meaning: 'Givens rotation: $2\\times2$ matrix $\\begin{pmatrix}c&s\\\\-s&c\\end{pmatrix}$ with $c^2+s^2=1$; zeros one entry, costs 6 operations, preserves all other matrix entries.' },
      { symbol: '\\beta = 2/\\|\\mathbf{v}\\|^2', meaning: 'Scale factor for applying H efficiently: $H\\mathbf{x} = \\mathbf{x} - \\beta(\\mathbf{v}^\\top\\mathbf{x})\\mathbf{v}$. Store $\\beta$ and $\\mathbf{v}$, never the $m\\times m$ matrix.' },
      { symbol: 'I - WY^\\top', meaning: 'WY (compact) representation of a product of $b$ Householder reflectors — enables Level-3 BLAS for cache efficiency; used in LAPACK\'s blocked `dgeqrf`.' },
      { symbol: '|r_{kk}|', meaning: 'Diagonal entry of $R$ after $k$-th Householder step: $r_{kk} = -\\operatorname{sign}(x_1)\\|\\mathbf{x}\\|$. Decreasing $|r_{kk}|$ signals near rank-deficiency.' },
    ],
    rulesOfThumb: [
      'For dense matrix QR, use Householder ($O(mn^2)$, stable). Never use classical Gram-Schmidt on ill-conditioned matrices.',
      'For sparse matrices or incremental row updates, use Givens — each rotation touches exactly two rows and preserves existing zeros.',
      'Always form $\\mathbf{v} = \\mathbf{x} + \\operatorname{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$ with $+$, not $-$ — avoids catastrophic cancellation when $x_1 \\approx \\|\\mathbf{x}\\|$.',
      'Never form $H$ as an explicit $m\\times m$ matrix; store only $\\mathbf{v}$ and apply as a rank-1 update to save memory and time.',
      'If $|r_{kk}|$ drops suddenly during QR, the matrix is near rank-deficient: use column-pivoted QR (`scipy.linalg.qr(..., pivoting=True)`) to detect and handle this.',
    ],
  },

  spiral: {
    recoveryPoints: ['la7-004', 'la7-001'],
    futureLinks: ['la8-001', 'la8-003'],
  },

  debugging: [
    {
      commonError: 'Using the wrong sign for $\\mathbf{v}$, causing catastrophic cancellation.',
      symptom: 'For $x_1 = 5$, $\\|\\mathbf{x}\\|=5.001$: student uses $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$, giving $v_1 = 5-5.001 = -0.001$ (catastrophic cancellation — 3 significant digits lost).',
      whyItHappened: 'The formula $H\\mathbf{x} = \\|\\mathbf{x}\\|\\mathbf{e}_1$ (positive) seems more natural, leading to $\\mathbf{v} = \\mathbf{x} - \\|\\mathbf{x}\\|\\mathbf{e}_1$ — which cancels when $x_1 \\approx \\|\\mathbf{x}\\|$.',
      repairStrategy: 'Always use $\\mathbf{v} = \\mathbf{x} + \\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$. Then $v_1 = x_1 + \\text{sign}(x_1)\\|\\mathbf{x}\\|$ has $|v_1| = |x_1| + \\|\\mathbf{x}\\| \\geq \\|\\mathbf{x}\\|$ — never near zero. Accept that $H\\mathbf{x}$ will be $-\\text{sign}(x_1)\\|\\mathbf{x}\\|\\mathbf{e}_1$, which is fine for QR.',
    },
    {
      commonError: 'Applying the Givens rotation to the wrong pair of rows.',
      symptom: 'Student wants to zero $A(3,1)$ using $A(1,1)$, but applies the Givens rotation to rows 1 and 2 (using $A(2,1)$ instead of $A(3,1)$).',
      whyItHappened: 'Givens rotation $G(i,j,\\theta)$ affects rows $i$ and $j$. Students mix up which row to target (the one to be zeroed) vs which row to use (the pivot row).',
      repairStrategy: 'To zero entry $(j,k)$ using entry $(i,k)$ as pivot: apply $G(i,j,\\theta)$ with $c = A(i,k)/r$, $s = A(j,k)/r$, $r = \\sqrt{A(i,k)^2+A(j,k)^2}$. The resulting rows are: row $i$ gets $r$ in position $k$, row $j$ gets $0$ in position $k$. Always verify: which entry do you want to make zero?',
    },
  ],
};
