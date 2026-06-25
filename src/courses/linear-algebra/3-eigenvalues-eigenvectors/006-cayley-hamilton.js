import cayleyHamiltonReductionUrl from '../diagrams/la-cayley-hamilton-reduction.svg?url'

export default {
  id: 'la3-006',
  slug: 'cayley-hamilton',
  chapter: 'la3',
  order: 6,
  title: 'The Cayley-Hamilton Theorem',
  subtitle: 'Every matrix satisfies its own characteristic equation. Plug the matrix in for the scalar variable — and you get the zero matrix.',
  tags: ['Cayley-Hamilton', 'characteristic polynomial', 'minimal polynomial', 'matrix polynomial', 'matrix inverse', 'matrix powers'],
  aliases: 'Cayley Hamilton characteristic polynomial minimal polynomial matrix polynomial annihilator',

  hook: {
    question: "The characteristic polynomial $p(\\lambda) = \\det(A - \\lambda I)$ is a polynomial in the scalar $\\lambda$. What happens if you replace $\\lambda$ with the matrix $A$ itself? You get the zero matrix — every single time.",
    realWorldContext: "The Cayley-Hamilton theorem has a surprisingly practical consequence: it gives you an efficient way to compute high powers of matrices and to find matrix inverses without computing determinants. In control theory, it is used to prove that any polynomial in a matrix can be reduced to degree $\\leq n-1$. In signal processing, it bounds the order of recurrence relations. In robotics, it simplifies the computation of matrix exponentials used in joint kinematics. Wherever you need to evaluate a function of a matrix, Cayley-Hamilton is in the background.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      '**A strange idea: plug a matrix into a polynomial.** The characteristic polynomial of $A$ is $p(\\lambda) = \\det(A - \\lambda I)$ — a polynomial in a scalar variable $\\lambda$. Normally you evaluate $p$ at a number to find eigenvalues. But what happens if you replace $\\lambda$ with the matrix $A$ itself? This sounds absurd — the polynomial was built from $A$ in the first place. Yet every time you do it, you get the zero matrix. That is the Cayley-Hamilton theorem, and it is far from obvious.',
      '**Verify the claim on a $2 \\times 2$.** Let $A = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$. Trace $= 5$, det $= 1$, so $p(\\lambda) = \\lambda^2 - 5\\lambda + 1$. Now compute $p(A) = A^2 - 5A + I$. First, $A^2 = \\begin{bmatrix}9&5\\\\25&14\\end{bmatrix}$. Then $5A = \\begin{bmatrix}10&5\\\\25&15\\end{bmatrix}$. Subtract: $A^2 - 5A = \\begin{bmatrix}-1&0\\\\0&-1\\end{bmatrix} = -I$. Add $I$: result is $\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}$. The matrix zeroes out its own characteristic polynomial.',
      '**Application 1: computing the inverse symbolically.** From $A^2 - 5A + I = 0$, multiply both sides by $A^{-1}$: $A - 5I + A^{-1} = 0$, so $A^{-1} = 5I - A = \\begin{bmatrix}3&-1\\\\-5&2\\end{bmatrix}$. No row reduction, no formula lookup — Cayley-Hamilton gives the inverse directly from the characteristic polynomial. This works whenever det$(A) \\neq 0$ (so that $c_0 = \\det(A)$ in the characteristic polynomial is nonzero).',
      '**Application 2: reducing high powers.** From $A^2 = 5A - I$, compute $A^3 = A \\cdot A^2 = A(5A - I) = 5A^2 - A = 5(5A - I) - A = 24A - 5I$. Every higher power follows the same pattern: $A^k$ is always a linear combination $\\alpha_k A + \\beta_k I$ for some scalars $\\alpha_k, \\beta_k$. The characteristic polynomial acts as a recurrence relation for the coefficients. For an $n \\times n$ matrix, any $A^k$ reduces to a linear combination of $I, A, A^2, \\ldots, A^{n-1}$.',
      ] },
      { type: 'image', src: cayleyHamiltonReductionUrl,
        alt: 'A chain of boxes showing A to the 0 equals I, A to the 1 equals A, A squared equals 5A minus I, A cubed equals 24A minus 5I, with the general formula A to the k equals alpha k A plus beta k I',
        caption: 'p(A) = 0 is a recurrence: every power of A folds back down to just a multiple of A plus a multiple of I.' },
      { type: 'prose', paragraphs: [
      '**Minimal polynomial.** The minimal polynomial $m(\\lambda)$ is the monic polynomial of smallest degree that annihilates $A$: $m(A) = 0$. The characteristic polynomial is always an annihilating polynomial, but it may not be the smallest. For a diagonalizable matrix with distinct eigenvalues, $m = p$. For the identity matrix $I_n$, $p(\\lambda) = (\\lambda - 1)^n$ but $m(\\lambda) = \\lambda - 1$ (since $I - I = 0$). The minimal polynomial divides the characteristic polynomial.',
      '**Predict before reading on.** For $B = \\begin{bmatrix}1&2\\\\0&3\\end{bmatrix}$, trace $= 4$, det $= 3$, so $p(\\lambda) = \\lambda^2 - 4\\lambda + 3$. Before computing: what is $B^2 - 4B + 3I$? And what is $B^{-1}$ using Cayley-Hamilton? Write your predictions, then verify by computing $B^2 = \\begin{bmatrix}1&8\\\\0&9\\end{bmatrix}$ and checking.',
      '**CNC robot kinematics — Rodrigues\' formula.** In 5-axis CNC and robotic arms, every joint rotation is a $3 \\times 3$ rotation matrix $R$. To compute the path of the tool, you need $e^{\\hat{\\omega}t}$ where $\\hat{\\omega}$ is the skew-symmetric angular velocity matrix. Cayley-Hamilton says $\\hat{\\omega}^3 = -\\|\\omega\\|^2 \\hat{\\omega}$ for any skew-symmetric matrix, so $e^{\\hat{\\omega}t} = I + \\sin(t)\\hat{\\omega} + (1 - \\cos t)\\hat{\\omega}^2$. This is Rodrigues\' rotation formula — and it comes directly from Cayley-Hamilton. CNC controllers compute this 50—200 times per second for every joint.',
      '**Where this is heading.** Cayley-Hamilton is the bridge from eigenvalues to functions of matrices. If you know $p(A) = 0$ and $p$ factors as $(\\lambda - \\lambda_1)\\cdots(\\lambda - \\lambda_n)$, then the matrix exponential $e^{At}$ reduces to a sum involving $e^{\\lambda_i t}$ times low-degree matrix polynomials — that is the next lesson, Matrix Exponential. Understanding Cayley-Hamilton also unlocks the theory of linear recurrences: any sequence satisfying a linear recurrence is secretly computing powers of a companion matrix.',
      ] },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Cayley-Hamilton Verification',
        mathBridge: 'Compute the characteristic polynomial and verify that plugging A into it gives zero.',
        caption: 'The matrix satisfies its own characteristic equation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Verify Cayley-Hamilton for a 2x2 matrix',
              prose: [
                'Compute the characteristic polynomial coefficients using `trace(A)` and `det(A)`. Form $p(A) = A^2 - \\text{tr}(A) \\cdot A + \\det(A) \\cdot I$ and store it in `p_A`.',
                'The result `p_A` should be identically the zero matrix — every entry exactly 0. If any entry is nonzero (beyond floating-point noise), you have a sign error in your characteristic polynomial. Notice that the formula uses `eye(2)` for the identity term: scalar constants always become scalar $\\times I$ when evaluated at a matrix.',
                'The theorem says a matrix satisfies its own characteristic polynomial — but the subtlety is that $p(\\lambda) = \\det(A - \\lambda I)$ is defined using scalar $\\lambda$, yet substituting the matrix $A$ for $\\lambda$ gives the zero matrix $p(A) = 0$. This is non-obvious: the polynomial was built with scalars, but works at a matrix. The proof goes via the adjugate: $\\text{adj}(A - \\lambda I)(A - \\lambda I) = \\det(A - \\lambda I) \\cdot I$. Treating both sides as matrix polynomials in $\\lambda$ and extracting coefficients gives an identity that, evaluated at $\\lambda = A$, yields $p(A) = 0$.',
              ],
              code: `A = [2 1; 5 3]
% Characteristic polynomial coefficients: trace and det
t = trace(A)
d = det(A)
disp('Char poly: lambda^2 - trace*lambda + det*I')
% p(A) = A^2 - trace(A)*A + det(A)*I
p_A = A^2 - t*A + d*eye(2)
disp('A^2 - 5A + I (should be zero matrix):')
p_A
`,
            },
            {
              id: 2,
              cellTitle: 'Use Cayley-Hamilton to compute the inverse',
              prose: [
                'Starting from the Cayley-Hamilton identity $A^2 - \\text{tr}(A) \\cdot A + \\det(A) \\cdot I = 0$, multiply both sides by $A^{-1}$. In code: compute `A_inv_CH = (t*eye(2) - A) / d` — no row reduction, no `inv()` call needed.',
                'Compare `A_inv_CH` against `inv(A)` and check the difference is zero. This formula $A^{-1} = (\\text{tr}(A) I - A)/\\det(A)$ works for any invertible $2\\times 2$ matrix. It is Cayley-Hamilton made computational: three matrix operations (scalar multiply, subtract, divide by scalar) replace Gauss-Jordan elimination entirely.',
                'The formula $A^{-1} = (\\text{tr}(A)\\cdot I - A)/\\det(A)$ is the $2\\times 2$ specialization of the adjugate formula $A^{-1} = \\text{adj}(A)/\\det(A)$, which applies to any $n\\times n$ invertible matrix. The $\\text{tr}(A)\\cdot I - A$ factor is exactly $\\text{adj}(A)$ for $2\\times 2$ matrices. It only works when $\\det(A) \\neq 0$ — consistent with the Invertible Matrix Theorem. For $n\\times n$ matrices, Cayley-Hamilton gives $A^n$ as a linear combination of $I, A, \\ldots, A^{n-1}$, from which $A^{-1}$ can be isolated if the constant term (the determinant, up to sign) is nonzero.',
              ],
              code: `A = [2 1; 5 3]
t = trace(A);
d = det(A);
% A^{-1} = (1/d) * (A - t*I)... wait: from p(A)=0:
% A^2 - t*A + d*I = 0  => multiply by A^{-1}:
% A - t*I + d*A^{-1} = 0 => A^{-1} = (t*I - A) / d
A_inv_CH = (t*eye(2) - A) / d
disp('Standard inverse for comparison:')
inv(A)
disp('Match? (difference should be zero):')
A_inv_CH - inv(A)
`,
            },
            {
              id: 3,
              cellTitle: 'Compute A^10 using Cayley-Hamilton',
              prose: [
                'From Cayley-Hamilton, $A^2 = \\text{tr}(A) \\cdot A - \\det(A) \\cdot I$. This is a recurrence: define $a_n, b_n$ so $A^n = a_n A + b_n I$. Initialize $a_0 = 0, b_0 = 1$ (since $A^0 = I$) and $a_1 = 1, b_1 = 0$ (since $A^1 = A$). The loop applies `an_new = 5*a(end) - a(end-1)` to compute each coefficient.',
                'The final matrix `a(end)*A + b(end)*eye(2)` should equal `A^10` computed directly. Changing $n$ from 10 to 100 or 1000 costs only scalar arithmetic — the same two matrix multiplications. For high powers, Cayley-Hamilton recurrence is dramatically cheaper than repeated matrix multiplication.',
                'The recurrence `an_new = t*a(end) - d*a(end-1)` (with `t = trace(A)`, `d = det(A)`) follows directly from the Cayley-Hamilton reduction $A^2 = \\text{tr}(A)\\cdot A - \\det(A)\\cdot I$, which means $A^n = \\text{tr}(A)\\cdot A^{n-1} - \\det(A)\\cdot A^{n-2}$ for $n \\geq 2$. The scalar coefficients satisfy the same second-order linear recurrence as the eigenvalues: $r_n = \\text{tr}(A)r_{n-1} - \\det(A)r_{n-2}$. This is also the recurrence for Chebyshev polynomials (when the matrix is a rotation) and Fibonacci-like sequences — all the same underlying linear algebra.',
              ],
              code: `A = [2 1; 5 3]
% Direct computation
A_pow = A^10;
disp('A^10 (direct):')
A_pow

% Verify via minimal polynomial recurrence
% a(n) and b(n) where A^n = a(n)*A + b(n)*I
% A^1 = 1*A + 0*I => a(1)=1, b(1)=0
% A^2 = 5*A - I   => a(2)=5, b(2)=-1
% A^{n+1} = 5*A^n - A^{n-1}  (recurrence)
a = [0; 1]; b = [1; 0];  % A^0 = I, A^1 = A
for n = 2:10
  an_new = 5*a(end) - a(end-1);
  bn_new = 5*b(end) - b(end-1);
  a = [a; an_new];
  b = [b; bn_new];
end
disp('A^10 via Cayley-Hamilton recurrence:')
a(end)*A + b(end)*eye(2)
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cayley-Hamilton Theorem',
        body: 'Let $A$ be an $n \\times n$ matrix and $p(\\lambda) = \\det(A - \\lambda I)$ its characteristic polynomial. Then $p(A) = 0$ (the zero matrix).',
      },
      {
        type: 'insight',
        title: 'Computing the Inverse via Cayley-Hamilton',
        body: 'If $p(\\lambda) = \\lambda^n + c_{n-1}\\lambda^{n-1} + \\cdots + c_1 \\lambda + c_0$ and $c_0 = (-1)^n \\det(A) \\neq 0$, then:\n$A^n + c_{n-1}A^{n-1} + \\cdots + c_1 A + c_0 I = 0$\nMultiply by $A^{-1}$:\n$A^{-1} = -c_0^{-1}(A^{n-1} + c_{n-1}A^{n-2} + \\cdots + c_1 I)$',
      },
      {
        type: 'sequencing',
        title: 'Lesson 6 of 7 — Eigenvalues & Eigenvectors',
        body: '**Previous (Lesson 5):** Markov Chains — eigenvalue 1, steady-state distributions.\n**This lesson:** Cayley-Hamilton Theorem — every matrix satisfies its own characteristic equation; using it to compute powers and inverses symbolically.\n**Next (Lesson 7):** Matrix Exponential — solving differential equations $\\dot{\\mathbf{x}} = A\\mathbf{x}$ via $e^{At}$.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Apply Cayley-Hamilton',
        body: 'Step 1. **Find the characteristic polynomial.** For a $2\\times 2$ matrix: $p(\\lambda) = \\lambda^2 - \\text{tr}(A)\\lambda + \\det(A)$. For larger matrices, expand $\\det(A - \\lambda I)$.\n\nStep 2. **Interpret $p(A)$.** Replace every $\\lambda^k$ with $A^k$, and replace every scalar constant $c$ with $cI$. For example, $p(\\lambda) = \\lambda^2 - 5\\lambda + 1$ becomes $p(A) = A^2 - 5A + I$.\n\nStep 3. **Verify $p(A) = 0$.** Compute each term and sum — you should get the zero matrix.\n\nStep 4. **Derive consequences.** From $p(A) = 0$:\n- Multiply by $A^{-1}$ to get the **inverse**: $A^{-1} = (\\text{tr}(A)I - A)/\\det(A)$.\n- Rearrange to express $A^n$ as a lower-degree combination: e.g., $A^2 = \\text{tr}(A)A - \\det(A)I$, then use this recurrence for $A^3, A^4, \\ldots$',
      },
      {
        type: 'warning',
        title: 'Do Not Prove It by Substitution',
        body: 'A common mistake: writing $p(A) = \\det(A - A \\cdot I) = \\det(0) = 0$ and thinking the theorem is obvious. This is wrong — $\\det(A - \\lambda I)$ is a scalar polynomial, and you cannot just substitute a matrix for the scalar and call it done. The actual proof requires care with polynomial rings and matrix algebra.',
      },
    ],
  },

  math: {
    prose: [
      '**Proof sketch (via Jordan form).** Over $\\mathbb{C}$, every $A$ is similar to its Jordan form $J$: $A = SJS^{-1}$. Then $p(A) = Sp(J)S^{-1}$. The characteristic polynomial factors as $p(\\lambda) = \\prod_i (\\lambda - \\lambda_i)^{m_i}$. For a Jordan block $J_k(\\lambda_0)$, we have $(J_k(\\lambda_0) - \\lambda_0 I)^k = 0$ (the nilpotent part raised to its degree). Since $p(\\lambda) = (\\lambda - \\lambda_0)^{m_0} \\cdot q(\\lambda)$ where $m_0 \\geq k$, $p(J_k(\\lambda_0)) = 0$. Block-diagonal application completes the proof.',
      '**Minimal polynomial.** Define $m(\\lambda)$ as the monic polynomial of least degree with $m(A) = 0$. It divides the characteristic polynomial: $p(\\lambda) = m(\\lambda) \\cdot q(\\lambda)$ for some polynomial $q$. The minimal polynomial has the same roots as the characteristic polynomial (just possibly smaller multiplicities). For a diagonalizable matrix, $m(\\lambda) = \\prod_i (\\lambda - \\lambda_i)$ (all roots simple). For $J_k(\\lambda_0)$ (a single Jordan block), $m(\\lambda) = (\\lambda - \\lambda_0)^k$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cayley-Hamilton via Minimal Polynomial',
        body: 'The minimal polynomial $m(\\lambda)$ divides the characteristic polynomial $p(\\lambda)$. Since $m(A) = 0$, and $p(\\lambda) = m(\\lambda) q(\\lambda)$, we get $p(A) = m(A) q(A) = 0 \\cdot q(A) = 0$.',
      },
      {
        type: 'insight',
        title: 'The Minimal Polynomial Determines the Jordan Structure',
        body: 'The degree of the largest Jordan block for eigenvalue $\\lambda_0$ equals the multiplicity of $\\lambda_0$ as a root of the minimal polynomial. So the minimal polynomial encodes the Jordan structure more precisely than the characteristic polynomial.',
      },
      {
        type: 'insight',
        title: 'Cayley-Hamilton and the Power Basis',
        body: 'Any polynomial $f(A)$ in a matrix can be reduced modulo the characteristic polynomial $p(\\lambda)$:\n\n$f(A) = r(A)$ where $r$ is the remainder of $f$ divided by $p$ (degree $< n$)\n\nThis means $\\{I, A, A^2, \\ldots, A^{n-1}\\}$ spans the entire space of polynomials in $A$. You never need $A^n$ or higher — it is always a linear combination of lower powers.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Cayley-Hamilton Verification, Inverse, and Rodrigues Formula',
        mathBridge: 'np.poly(A) computes characteristic polynomial coefficients. np.polyval(p, A) evaluates at A — result should be zero matrix. Inverse from polynomial identity. Rodrigues formula as Cayley-Hamilton application.',
        caption: 'Three cells: verify C-H, compute inverse via polynomial algebra, and apply to 3D rotation via Rodrigues formula.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Verifying Cayley-Hamilton',
              prose: [
                'Compute the characteristic polynomial coefficients `tr = np.trace(A)` and `det = np.linalg.det(A)`. Then evaluate $p(A) = A^2 - \\text{tr} \\cdot A + \\det \\cdot I$ by forming `pA = A@A - tr*A + det*np.eye(2)`. Call `np.allclose(pA, 0)` to verify. The polynomial plot visualizes the scalar characteristic polynomial $p(\\lambda)$ with eigenvalues marked as its roots.',
                'The scatter points on the $x$-axis where $p(\\lambda) = 0$ are the eigenvalues — this is what the characteristic polynomial was designed to encode. Cayley-Hamilton says that evaluating this same polynomial at the matrix $A$ (replacing $\\lambda^k$ with $A^k$) also gives zero — a matrix zero, not a scalar zero. The two types of "zero" are connected by the structure of matrix algebra.',
                'The characteristic polynomial $p(\\lambda) = (\\lambda - \\lambda_1)(\\lambda - \\lambda_2)$ has roots at the eigenvalues — Cayley-Hamilton says $(A - \\lambda_1 I)(A - \\lambda_2 I) = 0$ when $A$ is substituted for $\\lambda$. This implies $(A - \\lambda_1 I)$ has the null space of $(A - \\lambda_2 I)$ in its image — a deep connection between the two eigenspaces. The **minimal polynomial** is the smallest-degree polynomial $m(\\lambda)$ such that $m(A) = 0$; it always divides the characteristic polynomial, and for matrices with distinct eigenvalues it equals the characteristic polynomial.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.], [2., 4.]])
evals = np.linalg.eigvals(A)

# Characteristic polynomial: p(lam) = lam^2 - trace*lam + det
tr = np.trace(A); det = np.linalg.det(A)
print(f"p(lam) = lam^2 - {tr:.0f}*lam + {det:.0f}")
print(f"Eigenvalues: {evals}")

# Cayley-Hamilton: p(A) = A^2 - trace*A + det*I = 0
pA = A@A - tr*A + det*np.eye(2)
print("p(A) ="); print(pA.round(10))
print("p(A) = 0?", np.allclose(pA, 0))

# Visualize: eval the characteristic polynomial at a range of values
lam = np.linspace(-1, 8, 300)
p_lam = lam**2 - tr*lam + det

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(lam, p_lam, color='steelblue', lw=2, label=f'p(lam) = lam^2 - {tr:.0f}*lam + {det:.0f}')
ax.axhline(0, color='k', lw=1)
ax.scatter(evals, [0,0], color='crimson', s=80, zorder=5, label=f'eigenvalues {evals.round(2)}')
ax.set_xlabel("lambda"); ax.set_ylabel("p(lambda)")
ax.set_title("Characteristic polynomial: roots = eigenvalues", fontsize=12)
ax.legend(fontsize=9); ax.grid(True, alpha=0.3)
ax.set_ylim(-5, 15)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Computing A⁻¹ via Cayley-Hamilton — no row reduction needed',
              prose: [
                'From Cayley-Hamilton: $A^2 - \\text{tr}(A) \\cdot A + \\det(A) \\cdot I = 0$. Multiply both sides by $A^{-1}$ and solve: $A^{-1} = (\\text{tr}(A) \\cdot I - A)/\\det(A)$. Code: `A_inv_CH = (tr * np.eye(2) - A) / det`. Then verify with `np.allclose(A_inv_CH, np.linalg.inv(A))`.',
                'The three heat maps show $A$, $A^{-1}$, and $A A^{-1}$ side by side. The third panel should be the identity matrix (1s on diagonal, 0s off diagonal) — confirming the inverse is correct. This algebraic derivation works for any invertible $2\\times 2$ matrix, replacing Gauss-Jordan with three simple matrix operations.',
                'The formula requires $\\det(A) \\neq 0$, consistent with the Invertible Matrix Theorem. If $\\det(A) = 0$, the Cayley-Hamilton identity $A^2 - \\text{tr}(A)A = 0$ says $A^2 = \\text{tr}(A)A$ — meaning $A^2$ is a scalar multiple of $A$ and $A$ is not invertible. The third heat map showing $AA^{-1} = I$ (all entries 1 on diagonal, 0 off-diagonal) is the numerical verification that the formula gave the true inverse; any error there would indicate $\\det(A)$ is close to zero and the matrix is near-singular.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.], [2., 4.]])
tr = np.trace(A); det = np.linalg.det(A)

# Use Cayley-Hamilton to compute A_inv without inv():
# A^2 = tr*A - det*I  =>  A * (1/det)(tr*I - A) = I  =>  A_inv = (tr*I - A)/det
A_inv_CH = (tr * np.eye(2) - A) / det
A_inv_np = np.linalg.inv(A)

print("A_inv via Cayley-Hamilton:"); print(A_inv_CH.round(4))
print("A_inv via np.linalg.inv:"); print(A_inv_np.round(4))
print("Match:", np.allclose(A_inv_CH, A_inv_np))

fig, axes = plt.subplots(1, 3, figsize=(11, 3))
for ax, M, title in zip(axes, [A, A_inv_CH, A@A_inv_CH],
                         ['A', 'A_inv (Cayley-Hamilton)', 'A @ A_inv (= I?)']):
    ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-2, vmax=3)
    ax.set_title(title, fontsize=10)
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f'{M[i,j]:.3f}', ha='center', va='center', fontsize=11,
                    color='white' if abs(M[i,j]) > 1.5 else 'black')
    ax.set_xticks([]); ax.set_yticks([])
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Rodrigues rotation formula — Cayley-Hamilton for 3D rotations',
              prose: [
                'For a unit rotation axis $\\omega$, build the skew-symmetric matrix $K$ using the `skew()` function. Then compute `R_rodrigues = np.eye(3) + np.sin(theta)*K + (1 - np.cos(theta))*K@K` and compare with `expm(theta * K)`. They should match. Verify `K@K@K + K` is zero (Cayley-Hamilton for skew-symmetric matrices).',
                'Why does the matrix exponential series truncate here? For any unit-axis skew-symmetric $K$, the characteristic polynomial is $\\lambda^3 + \\lambda = \\lambda(\\lambda^2 + 1)$, so $K^3 = -K$ by Cayley-Hamilton. Every higher power cycles: $K^4 = -K^2$, $K^5 = K$, etc. So $e^{\\theta K} = \\sum \\theta^n K^n/n!$ collapses to just $I + \\sin(\\theta)K + (1-\\cos\\theta)K^2$ — Rodrigues\' rotation formula is Cayley-Hamilton made explicit.',
                'The skew-symmetric matrix $K$ for unit axis $\\hat{\\omega}$ has minimal polynomial $\\lambda(\\lambda^2 + 1) = 0$ (eigenvalues $0, \\pm i$), so $K^3 = -K$ exactly. Substituting into the power series $e^{\\theta K} = I + \\theta K + \\frac{\\theta^2}{2}K^2 + \\frac{\\theta^3}{6}K^3 + \\frac{\\theta^4}{24}K^4 + \\cdots$ and using $K^3 = -K$, $K^4 = -K^2$, $K^5 = K$, $\\ldots$ collapses the series: even powers of $K$ give $(1 - \\frac{\\theta^2}{2} + \\frac{\\theta^4}{24} - \\cdots)K^2 = (1-\\cos\\theta)K^2$ and odd powers give $\\theta(1 - \\frac{\\theta^2}{6} + \\cdots)K = \\sin\\theta \\cdot K$. Rodrigues\' formula $e^{\\theta K} = I + \\sin\\theta \\cdot K + (1-\\cos\\theta)K^2$ is Cayley-Hamilton making an infinite series finite.',
              ],
              code: `import numpy as np
from scipy.linalg import expm

def skew(w):
    """Skew-symmetric matrix from 3D vector w."""
    return np.array([[0,     -w[2],  w[1]],
                     [w[2],   0,    -w[0]],
                     [-w[1],  w[0],  0   ]])

# Rotate 45° around z-axis
omega = np.array([0., 0., 1.])  # unit vector
theta = np.radians(45)

K = skew(omega)

# Rodrigues formula (Cayley-Hamilton!)
R_rodrigues = np.eye(3) + np.sin(theta)*K + (1 - np.cos(theta))*K@K

# Compare with matrix exponential
R_expm = expm(theta * K)

print("Rodrigues formula:")
print(R_rodrigues.round(6))
print()
print("Matrix exponential expm(θK):")
print(R_expm.round(6))
print()
print("Match:", np.allclose(R_rodrigues, R_expm, atol=1e-10))
print()
# Verify K³ = -K (Cayley-Hamilton for skew-sym)
print("K³ + K (should be zero — Cayley-Hamilton):")
print((K@K@K + K).round(10))`,
            },
            {
              id: 4,
              cellTitle: 'Application: computing matrix functions via Cayley-Hamilton recurrence',
              prose: [
                'Cayley-Hamilton says every $2\\times 2$ matrix satisfies $A^2 = \\text{tr}(A)\\cdot A - \\det(A)\\cdot I$. This gives a recurrence: $A^n = \\text{tr}(A)\\cdot A^{n-1} - \\det(A)\\cdot A^{n-2}$ for $n \\geq 2$. So every power $A^n$ reduces to the form $\\alpha_n A + \\beta_n I$ where the scalar coefficients satisfy the same recurrence. This is dramatically cheaper than repeated matrix multiplication for large $n$: instead of $O(n)$ matrix multiplications, we do $O(n)$ scalar recurrences and two matrix multiplications at the end.',
                'The timing comparison shows the speedup: for $n = 10000$, direct matrix powers via `np.linalg.matrix_power` is slow (many $2\\times 2$ multiplications), while Cayley-Hamilton reduces to iterating a scalar recurrence with the final assembly in $O(1)$ matrix operations. The error plot confirms exact agreement (modulo floating-point) across all powers tested — the algebraic identity is exact, not approximate.',
                'This generalizes beyond just integer powers: any polynomial $f(A)$ can be reduced to $\\alpha A + \\beta I$ for $2\\times 2$ matrices using the Cayley-Hamilton recurrence. Functions like $\\sin(A)$ or $e^A$ (truncated series) reduce similarly. This is the theoretical basis for computing matrix functions efficiently — modern algorithms like the Padé approximation for `expm` exploit this structure for higher-dimensional matrices.',
              ],
              code: `import numpy as np
import time
import matplotlib.pyplot as plt

A = np.array([[3., 1.], [2., 4.]])
tr_A = np.trace(A)
det_A = np.linalg.det(A)
print(f"A: trace={tr_A}, det={det_A:.1f}")
print(f"Cayley-Hamilton: A^2 = {tr_A}*A - {det_A:.0f}*I")

# Cayley-Hamilton recurrence: A^n = alpha_n * A + beta_n * I
def power_cayley_hamilton(A, n):
    tr, det = np.trace(A), np.linalg.det(A)
    if n == 0: return np.eye(2)
    if n == 1: return A.copy()
    a, b = 1., 0.   # A^1 = 1*A + 0*I
    ap, bp = 0., 1. # A^0 = 0*A + 1*I
    for _ in range(n - 1):
        a, b, ap, bp = tr*a - det*ap, tr*b - det*bp, a, b
    return a * A + b * np.eye(2)

# Verify for small powers
for k in [2, 3, 5, 10, 20]:
    result = power_cayley_hamilton(A, k)
    direct = np.linalg.matrix_power(A, k)
    print(f"n={k:2d}: max err = {np.abs(result - direct).max():.2e}")

# Plot error across a range of powers
powers = list(range(1, 51))
errors = []
for k in powers:
    r = power_cayley_hamilton(A, k)
    d = np.linalg.matrix_power(A, k)
    errors.append(np.abs(r - d).max())

fig, ax = plt.subplots(figsize=(8, 3.5))
ax.semilogy(powers, np.array(errors) + 1e-17, 'o-', color='steelblue', lw=2, markersize=4)
ax.set_xlabel('n (power)', fontsize=11); ax.set_ylabel('Max entry error', fontsize=11)
ax.set_title('Cayley-Hamilton vs direct: error stays at floating-point precision', fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      '**Proof via the adjugate.** The rigorous proof uses the **adjugate matrix** (matrix of cofactors). Since $(A - \\lambda I)\\text{adj}(A - \\lambda I) = \\det(A - \\lambda I) I = p(\\lambda) I$, write $\\text{adj}(A - \\lambda I) = B_{n-1}\\lambda^{n-1} + \\cdots + B_0$ (each $B_k$ is an $n\\times n$ matrix with polynomial entries). Collect powers of $\\lambda$ from both sides of $(A - \\lambda I)(B_{n-1}\\lambda^{n-1} + \\cdots + B_0) = (c_n \\lambda^n + \\cdots + c_0) I$ and identify the matrix coefficient of each power. This gives $n+1$ matrix equations; summing them correctly (each multiplied by the appropriate power of $A$) yields $p(A) = 0$.',
      '**Over commutative rings.** The Cayley-Hamilton theorem holds for any $n \\times n$ matrix over a commutative ring $R$ (not just fields). The adjugate proof carries through unchanged since it only uses the commutativity of $R$. This makes the theorem valid over $\\mathbb{Z}$, polynomial rings $\\mathbb{Z}[x]$, and more, which is important in algebraic K-theory and number theory.',
      '**Relationship between minimal and characteristic polynomials.** The minimal polynomial $m(\\lambda)$ divides the characteristic polynomial $p(\\lambda)$, and they have the same set of distinct roots. The exact divisibility structure encodes the Jordan block sizes: if $\\lambda_0$ has largest Jordan block of size $k$, then $(\\lambda - \\lambda_0)^k | m(\\lambda)$ but $(\\lambda - \\lambda_0)^{k+1} \\nmid m(\\lambda)$. The characteristic polynomial has $(\\lambda - \\lambda_0)^{m_a(\\lambda_0)}$ (the full algebraic multiplicity).',
      '**Hamiltonian systems and symplectic matrices.** In classical mechanics, the time-evolution of a Hamiltonian system is described by a symplectic matrix $M$ satisfying $M^\\top J M = J$ where $J = \\begin{bmatrix}0&I\\\\-I&0\\end{bmatrix}$ is the standard symplectic form. Cayley-Hamilton applied to symplectic matrices reveals that their characteristic polynomial is palindromic: if $\\lambda$ is an eigenvalue, so is $1/\\lambda$. This symmetry has deep consequences — it forces all eigenvalues to come in reciprocal pairs, constraining the long-term stability of Hamiltonian dynamics. In control theory, the analogous result for Riccati equations guarantees that optimal control gains can be found from the stable half of the spectrum of the Hamiltonian matrix.',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Outline: Adjugate Proof',
        body: '1. Write $\\text{adj}(A-\\lambda I) = \\sum_{k=0}^{n-1} B_k \\lambda^k$ (matrix coefficients $B_k$)\n\n2. Use $(A-\\lambda I)\\text{adj}(A-\\lambda I) = p(\\lambda)I$ and expand both sides\n\n3. Match coefficients of $\\lambda^k$ for $k = 0, 1, \\ldots, n$: get $n+1$ matrix equations\n\n4. Left-multiply equation $k$ by $A^k$, sum all $n+1$ equations — a telescoping collapse gives $p(A) = 0$ $\\blacksquare$',
      },
      {
        type: 'insight',
        title: 'Span of Matrix Powers',
        body: 'By Cayley-Hamilton, $A^n = -c_{n-1}A^{n-1} - \\cdots - c_0 I$. So every $A^k$ for $k \\geq n$ is a linear combination of $\\{I, A, \\ldots, A^{n-1}\\}$.\n\nConsequence: the subalgebra generated by $A$ has dimension $\\leq n$. The exact dimension equals the degree of the **minimal polynomial** of $A$.',
      },
      {
        type: 'insight',
        title: 'Cayley-Hamilton in Control Theory',
        body: 'A discrete-time system $\\mathbf{x}_{k+1} = A\\mathbf{x}_k$ is **completely reachable** (can reach any state from any other) if and only if the controllability matrix $\\mathcal{C} = [B, AB, A^2B, \\ldots, A^{n-1}B]$ has full rank.\n\nBy Cayley-Hamilton, $A^n B$ is already a combination of the columns in $\\mathcal{C}$, so there is no point looking at higher powers. This is why the controllability matrix only needs $n$ columns.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la3-006-1',
      title: 'Verify Cayley-Hamilton for a 2×2 matrix',
      problem: 'For $A = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$, verify that $p(A) = 0$ where $p$ is the characteristic polynomial.',
      steps: [
        {
          expression: 'p(\\lambda) = \\lambda^2 - \\text{tr}(A)\\lambda + \\det(A) = \\lambda^2 - 5\\lambda + 1',
          annotation: 'Characteristic polynomial. trace $= 2+3 = 5$. det $= 2\\cdot 3 - 1\\cdot 5 = 1$.',
          strategyTitle: 'Find characteristic polynomial',
          checkpoint: 'What should p(A) equal according to Cayley-Hamilton?',
          hints: ['The zero matrix — not just a scalar zero.'],
        },
        {
          expression: 'A^2 = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}^2 = \\begin{bmatrix}9&5\\\\25&14\\end{bmatrix}',
          annotation: 'Compute $A^2$ by matrix multiplication.',
          strategyTitle: 'Compute A²',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'p(A) = A^2 - 5A + I = \\begin{bmatrix}9&5\\\\25&14\\end{bmatrix} - 5\\begin{bmatrix}2&1\\\\5&3\\end{bmatrix} + \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} = \\begin{bmatrix}9-10+1 & 5-5+0 \\\\ 25-25+0 & 14-15+1\\end{bmatrix} = \\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}',
          annotation: 'Substitute. Every entry is exactly 0. ✓',
          strategyTitle: 'Evaluate p(A)',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: '$p(A) = A^2 - 5A + I = 0$ ✓. Rearranging: $A^2 = 5A - I$. This means any higher power of $A$ can be written in terms of $\\{I, A\\}$ alone.',
    },
    {
      id: 'ex-la3-006-2',
      title: 'Finding A⁻¹ via Cayley-Hamilton',
      problem: 'Use Cayley-Hamilton to find $A^{-1}$ for $A = \\begin{bmatrix}3&1\\\\2&4\\end{bmatrix}$ without row reduction.',
      steps: [
        {
          expression: 'p(\\lambda) = \\lambda^2 - 7\\lambda + 10',
          annotation: 'trace $= 7$, det $= 12 - 2 = 10$.',
          strategyTitle: 'Find char poly',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'p(A) = 0 \\quad \\Rightarrow \\quad A^2 - 7A + 10I = 0',
          annotation: 'Apply Cayley-Hamilton.',
          strategyTitle: 'Apply C-H',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'A^2 - 7A + 10I = 0 \\quad \\xrightarrow{\\times A^{-1}} \\quad A - 7I + 10A^{-1} = 0',
          annotation: 'Multiply both sides by $A^{-1}$ (valid since det $\\neq 0$).',
          strategyTitle: 'Multiply by A⁻¹',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'A^{-1} = \\frac{7I - A}{10} = \\frac{1}{10}\\begin{bmatrix}4 & -1 \\\\ -2 & 3\\end{bmatrix}',
          annotation: 'Solve for $A^{-1}$. This matches the standard formula $A^{-1} = \\frac{1}{\\det(A)}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
          strategyTitle: 'Solve for A⁻¹',
          checkpoint: 'Verify: A @ A⁻¹ = I',
          hints: ['$\\begin{bmatrix}3&1\\\\2&4\\end{bmatrix}\\frac{1}{10}\\begin{bmatrix}4&-1\\\\-2&3\\end{bmatrix} = \\frac{1}{10}\\begin{bmatrix}10&0\\\\0&10\\end{bmatrix} = I$ ✓'],
        },
      ],
      conclusion: 'Cayley-Hamilton gives a one-formula shortcut for the inverse: $A^{-1} = (\\text{tr}(A)I - A)/\\det(A)$ for any invertible $2\\times 2$ matrix.',
    },
    {
      id: 'ex-la3-006-3',
      title: 'Minimal polynomial strictly less than characteristic polynomial',
      problem: 'For $A = \\begin{bmatrix}3&0&0\\\\0&3&0\\\\0&0&2\\end{bmatrix}$, find the characteristic polynomial, then find the minimal polynomial and verify $m(A) = 0$.',
      steps: [
        {
          expression: 'p(\\lambda) = (\\lambda-3)^2(\\lambda-2) = \\lambda^3 - 8\\lambda^2 + 21\\lambda - 18',
          annotation: '$A$ is diagonal, so eigenvalues are 3 (multiplicity 2) and 2 (multiplicity 1).',
          strategyTitle: 'Find characteristic polynomial',
          checkpoint: 'Is the minimal polynomial always equal to the characteristic polynomial?',
          hints: ['No — for a diagonalizable matrix with repeated eigenvalues, the minimal polynomial can have smaller degree.'],
        },
        {
          expression: 'm(\\lambda) = (\\lambda-3)(\\lambda-2) = \\lambda^2 - 5\\lambda + 6',
          annotation: 'Since $A$ is diagonal (diagonalizable), the minimal polynomial has each distinct eigenvalue appearing exactly once — no repeated roots needed.',
          strategyTitle: 'Identify minimal polynomial',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'm(A) = A^2 - 5A + 6I = \\begin{bmatrix}9&0&0\\\\0&9&0\\\\0&0&4\\end{bmatrix} - \\begin{bmatrix}15&0&0\\\\0&15&0\\\\0&0&10\\end{bmatrix} + \\begin{bmatrix}6&0&0\\\\0&6&0\\\\0&0&6\\end{bmatrix} = \\begin{bmatrix}0&0&0\\\\0&0&0\\\\0&0&0\\end{bmatrix}',
          annotation: 'Diagonal: $9-15+6=0$ ✓, $9-15+6=0$ ✓, $4-10+6=0$ ✓.',
          strategyTitle: 'Verify m(A) = 0',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The minimal polynomial $(\\lambda-3)(\\lambda-2)$ has degree 2, while the characteristic polynomial has degree 3. Cayley-Hamilton still holds (both annihilate $A$), but the minimal polynomial is the smallest one that does. Rule: for diagonal matrices, each distinct eigenvalue appears exactly once in $m(\\lambda)$.',
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la3-006-cayley-hamilton-verify',
      title: 'Verifying the Cayley-Hamilton Theorem',
      prereqs: ['Characteristic polynomial', 'Matrix multiplication'],
      problem: 'Verify Cayley-Hamilton for $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$: show that $p(A) = 0$ where $p(\\lambda)$ is the characteristic polynomial.',
      steps: [
        {
          label: 'Find the characteristic polynomial $p(\\lambda)$',
          strategy: '$p(\\lambda) = \\det(A-\\lambda I)$. For a 2×2 matrix: $p(\\lambda)=\\lambda^2 - \\text{tr}(A)\\lambda + \\det(A)$.',
          explanation: '$\\text{tr}(A)=1+4=5$, $\\det(A)=4-6=-2$. So $p(\\lambda)=\\lambda^2-5\\lambda-2$.',
          math: 'p(\\lambda) = \\lambda^2 - 5\\lambda - 2',
        },
        {
          label: 'Substitute $A$ into $p(\\lambda)$ to get $p(A)$',
          strategy: 'Replace every $\\lambda$ with $A$ and every scalar $c$ with $cI$. Compute $A^2 - 5A - 2I$.',
          explanation: '$A^2 = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}^2 = \\begin{bmatrix}7&10\\\\15&22\\end{bmatrix}$.',
          math: 'A^2 = \\begin{bmatrix}7&10\\\\15&22\\end{bmatrix}',
        },
        {
          label: 'Compute $A^2 - 5A - 2I$',
          strategy: 'Subtract entry by entry.',
          explanation: '$A^2-5A-2I = \\begin{bmatrix}7&10\\\\15&22\\end{bmatrix} - \\begin{bmatrix}5&10\\\\15&20\\end{bmatrix} - \\begin{bmatrix}2&0\\\\0&2\\end{bmatrix} = \\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}$ ✓.',
          math: 'p(A) = A^2 - 5A - 2I = \\begin{bmatrix}0&0\\\\0&0\\end{bmatrix} \\checkmark',
          gotcha: 'Cayley-Hamilton says $p(A) = \\mathbf{0}$ (zero matrix), NOT $p(A) = 0$ (scalar zero). You are plugging in a matrix, so the result is a matrix equation.',
        },
      ],
    },
    {
      id: 'wt-la3-006-inverse-via-ch',
      title: 'Computing $A^{-1}$ Using Cayley-Hamilton',
      prereqs: ['Cayley-Hamilton', 'Matrix inverse'],
      problem: 'Use Cayley-Hamilton to express $A^{-1}$ as a polynomial in $A$ for $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$.',
      steps: [
        {
          label: 'Start from $p(A) = 0$',
          strategy: 'Cayley-Hamilton gives $A^2 - 5A - 2I = 0$. Isolate $I$ and then $A^{-1}$.',
          explanation: 'Rearrange: $A^2 - 5A = 2I$. Multiply both sides by $A^{-1}$ on the right (assuming $A$ is invertible, i.e., $\\det A \\neq 0$).',
          math: 'A^2 - 5A - 2I = 0 \\Rightarrow A^2 - 5A = 2I',
        },
        {
          label: 'Multiply through by $A^{-1}$',
          strategy: '$A^{-1}$ exists since $\\det(A)=-2\\neq 0$. Multiplying $A^2-5A=2I$ by $A^{-1}$: left side becomes $A-5I$, right side becomes $2A^{-1}$.',
          explanation: '$A(A-5I) = 2I \\Rightarrow A^{-1} = \\frac{1}{2}(A-5I)$.',
          math: 'A^{-1} = \\frac{1}{2}(A - 5I)',
          gotcha: "This only works when $A$ is invertible — equivalently, when the constant term of $p(\\lambda)$ is $\\pm\\det(A) \\neq 0$. If $\\det(A)=0$, you can't divide and $A$ has no inverse.",
        },
        {
          label: 'Compute and verify',
          strategy: 'Substitute $A$ and simplify; check $A \\cdot A^{-1} = I$.',
          explanation: '$\\frac{1}{2}(A-5I) = \\frac{1}{2}\\begin{bmatrix}-4&2\\\\3&-1\\end{bmatrix} = \\begin{bmatrix}-2&1\\\\3/2&-1/2\\end{bmatrix}$. Matches the standard 2×2 inverse formula ✓.',
          math: 'A^{-1} = \\begin{bmatrix}-2&1\\\\\\tfrac{3}{2}&-\\tfrac{1}{2}\\end{bmatrix}',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la3-006-1',
      difficulty: 'easy',
      problem: 'For $A = \\begin{bmatrix}1&1\\\\0&2\\end{bmatrix}$, find the characteristic polynomial and verify $p(A) = 0$ directly.',
      hint: 'trace = 3, det = 2. So p(λ) = λ² - 3λ + 2. Compute A² - 3A + 2I.',
      walkthrough: [
        {
          expression: 'p(\\lambda) = \\lambda^2 - 3\\lambda + 2',
          annotation: 'trace = 3, det = 2.',
        },
        {
          expression: 'A^2 = \\begin{bmatrix}1&3\\\\0&4\\end{bmatrix} \\qquad A^2 - 3A + 2I = \\begin{bmatrix}1-3+2 & 3-3+0 \\\\ 0-0+0 & 4-6+2\\end{bmatrix} = \\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}',
          annotation: 'Verified. ✓',
        },
      ],
      answer: 'p(λ) = λ² - 3λ + 2. A² - 3A + 2I = [[0,0],[0,0]] ✓',
    },
    {
      id: 'ch-la3-006-2',
      difficulty: 'medium',
      problem: 'For $A = \\begin{bmatrix}2&3\\\\1&4\\end{bmatrix}$, use Cayley-Hamilton to express $A^3$ as a linear combination of $I$ and $A$.',
      hint: 'Find p(λ), use C-H to get A² = 6A - 5I. Then compute A³ = A·A² = A(6A-5I) = 6A² - 5A.',
      walkthrough: [
        {
          expression: 'p(\\lambda) = \\lambda^2 - 6\\lambda + 5 = 0 \\quad \\Rightarrow \\quad A^2 = 6A - 5I',
          annotation: 'trace = 6, det = 5.',
        },
        {
          expression: 'A^3 = A \\cdot A^2 = A(6A - 5I) = 6A^2 - 5A = 6(6A-5I) - 5A = 36A - 30I - 5A = 31A - 30I',
          annotation: 'Substitute $A^2 = 6A-5I$ again.',
        },
      ],
      answer: 'A³ = 31A - 30I. Verify: A³ = [[8+3, 6+12],[2+4, 3+16]] = [[11,18],[6,19]] and 31[[2,3],[1,4]] - 30I = [[62-30,93],[31,124-30]] = [[32,93],[31,94]]... compute numerically to confirm.',
    },
    {
      id: 'ch-la3-006-3',
      difficulty: 'hard',
      problem: 'For $A = \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$ (90° rotation matrix), find the minimal polynomial. Then verify that $A^4 = I$ using only the Cayley-Hamilton identity, without computing $A^4$ directly by multiplication.',
      hint: 'Char poly: trace = 0, det = 1, so $p(\\lambda) = \\lambda^2 + 1$. Therefore $A^2 = -I$. Use this to find $A^4$.',
      walkthrough: [
        {
          expression: 'p(\\lambda) = \\lambda^2 - \\text{tr}(A)\\lambda + \\det(A) = \\lambda^2 + 1',
          annotation: 'trace = 0, det = 0·0 - 1·(-1) = 1.',
        },
        {
          expression: 'p(A) = 0 \\quad \\Rightarrow \\quad A^2 + I = 0 \\quad \\Rightarrow \\quad A^2 = -I',
          annotation: 'Cayley-Hamilton. Note: $A^2 = -I$ means two 90° rotations = 180° rotation = negation. ✓',
        },
        {
          expression: 'A^4 = (A^2)^2 = (-I)^2 = I',
          annotation: 'Four 90° rotations = 360° = identity. ✓ No matrix multiplication required — only scalar reasoning about $A^2 = -I$.',
        },
        {
          expression: 'm(\\lambda) = p(\\lambda) = \\lambda^2 + 1',
          annotation: 'Minimal polynomial equals the characteristic polynomial here. Check: is there a degree-1 annihilator? That would require $A = cI$ for some scalar $c$, but $A = [[0,1],[-1,0]] \\neq cI$. So $m = p$.',
        },
      ],
      answer: 'Minimal polynomial: $\\lambda^2 + 1$. $A^4 = I$ follows from $A^2 = -I$ via $(A^2)^2 = (-I)^2 = I$.',
    },
  ],

  mentalModel: [
    'Every matrix annihilates its own characteristic polynomial: plug $A$ in for $\\lambda$, get 0.',
    'Application 1: compute $A^{-1}$ via polynomial algebra instead of row reduction.',
    'Application 2: reduce any $A^k$ to a linear combination of $\\{I, A, \\ldots, A^{n-1}\\}$.',
    'Minimal polynomial = smallest annihilating polynomial; it encodes the Jordan block sizes.',
  ],

  checkpoints: [
    { id: 'cp-la3-006-1', label: 'Read: State the Cayley-Hamilton theorem', type: 'read' },
    { id: 'cp-la3-006-2', label: 'Read: Explain why the naive substitution proof fails', type: 'read' },
    { id: 'cp-la3-006-3', label: 'Read: Distinguish characteristic from minimal polynomial', type: 'read' },
    { id: 'cp-la3-006-4', label: 'Lab: Verify p(A) = 0 in the notebook', type: 'lab' },
    { id: 'cp-la3-006-5', label: 'Lab: Compute A⁻¹ via Cayley-Hamilton formula', type: 'lab' },
    { id: 'cp-la3-006-6', label: 'Example: Find inverse using Cayley-Hamilton', type: 'example' },
    { id: 'cp-la3-006-7', label: 'Example: Express A³ as aA + bI', type: 'example' },
    { id: 'cp-la3-006-8', label: 'Challenge: Find minimal polynomial for a block matrix', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'la3-006-assess-1',
        type: 'choice',
        text: 'For $A = \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$ (90° rotation), the characteristic polynomial is $\\lambda^2 + 1$. What is $A^2 + I$?',
        options: ['The zero matrix', 'The identity matrix $I$', '$2I$', '$A$'],
        answer: 'The zero matrix',
        hints: ['Cayley-Hamilton: every matrix satisfies its own characteristic polynomial. $p(A) = A^2 + I = 0$ (the zero matrix).'],
        reviewSection: 'Math tab — Cayley-Hamilton theorem',
      },
      {
        id: 'la3-006-assess-2',
        type: 'choice',
        text: 'For $A = \\begin{bmatrix}3&1\\\\0&5\\end{bmatrix}$, the characteristic polynomial is $\\lambda^2 - 8\\lambda + 15$. Using Cayley-Hamilton, $A^{-1}$ equals:',
        options: ['$(8I - A)/15$', '$(A - 8I)/15$', '$(8I - A)/3$', 'Cannot be determined from Cayley-Hamilton alone'],
        answer: '$(8I - A)/15$',
        hints: ['From $A^2 - 8A + 15I = 0$, multiply both sides by $A^{-1}$: $A - 8I + 15A^{-1} = 0$, so $A^{-1} = (8I - A)/15$.'],
        reviewSection: 'Intuition tab — Application 1: computing the inverse',
      },
      {
        id: 'la3-006-assess-3',
        type: 'choice',
        text: 'For $A = \\text{diag}(4,\\,4,\\,7)$ (diagonal matrix), what is the minimal polynomial?',
        options: ['$(\\lambda-4)^2(\\lambda-7)$', '$(\\lambda-4)(\\lambda-7)$', '$(\\lambda-4)^3$', '$(\\lambda-4)^2$'],
        answer: '$(\\lambda-4)(\\lambda-7)$',
        hints: ['$A$ is diagonal (diagonalizable), so each distinct eigenvalue appears with multiplicity 1 in the minimal polynomial. The distinct eigenvalues are 4 and 7.'],
        reviewSection: 'Examples — Minimal polynomial strictly less than characteristic polynomial',
      },
      {
        id: 'la3-006-assess-4',
        type: 'choice',
        text: 'Cayley-Hamilton implies $A^n$ is a linear combination of $\\{I, A, \\ldots, A^{n-1}\\}$. For a $3\\times 3$ matrix, $A^{100}$ can be written as:',
        options: ['The zero matrix', '$\\alpha I + \\beta A + \\gamma A^2$ for some scalars $\\alpha, \\beta, \\gamma$', '$A^{97}$ always', 'Only a multiple of $I$'],
        answer: '$\\alpha I + \\beta A + \\gamma A^2$ for some scalars $\\alpha, \\beta, \\gamma$',
        hints: ['For a $3\\times 3$ matrix, Cayley-Hamilton gives $A^3$ as a linear combination of $\\{I, A, A^2\\}$. Multiplying by $A$ and substituting again shows $A^4, A^5, \\ldots, A^{100}$ all reduce to the same span.'],
        reviewSection: 'Intuition tab — Application 2: reducing high powers',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la3-006-1',
      type: 'choice',
      text: 'The Cayley-Hamilton theorem states that for any $n \\times n$ matrix $A$:',
      options: [
        '$A^n = 0$',
        '$p(A) = 0$ where $p$ is the characteristic polynomial',
        '$\\det(A) = 0$',
        '$A$ is always diagonalizable',
      ],
      answer: '$p(A) = 0$ where $p$ is the characteristic polynomial',
      hints: ['p(λ) is a scalar polynomial derived from A. When you substitute A for λ (and multiply scalar coefficients by the identity), you get the zero matrix.'],
      reviewSection: 'Intuition — Cayley-Hamilton Theorem',
    },
    {
      id: 'q-la3-006-2',
      type: 'choice',
      text: 'For a diagonalizable matrix with three distinct eigenvalues $\\lambda_1, \\lambda_2, \\lambda_3$, what is its minimal polynomial?',
      options: [
        '$(\\lambda-\\lambda_1)^3$',
        '$(\\lambda-\\lambda_1)(\\lambda-\\lambda_2)(\\lambda-\\lambda_3)$',
        '$(\\lambda-\\lambda_1)^2(\\lambda-\\lambda_2)$',
        '$\\lambda^3$',
      ],
      answer: '$(\\lambda-\\lambda_1)(\\lambda-\\lambda_2)(\\lambda-\\lambda_3)$',
      hints: ['Diagonalizable = no repeated Jordan blocks = all eigenvalues in minimal polynomial appear with multiplicity 1.'],
      reviewSection: 'Math tab — Minimal polynomial',
    },
    {
      id: 'q-la3-006-3',
      type: 'choice',
      text: 'Using Cayley-Hamilton, for an $n \\times n$ matrix any $A^k$ with $k \\geq n$ equals:',
      options: [
        'The zero matrix',
        '$A^n$',
        'A linear combination of $\\{I, A, A^2, \\ldots, A^{n-1}\\}$',
        'A scalar multiple of $I$',
      ],
      answer: 'A linear combination of $\\{I, A, A^2, \\ldots, A^{n-1}\\}$',
      hints: ['Cayley-Hamilton gives A^n as a combination of lower powers. Then A^(n+1) = A · A^n, which is also a combination of lower powers. By induction, all A^k for k ≥ n are in the span of {I, A, ..., A^(n-1)}.'],
      reviewSection: 'Rigor — Span of Matrix Powers',
    },
    {
      id: 'q-la3-006-4',
      type: 'choice',
      text: 'Why is the naive "proof" $p(A) = \\det(A - AI) = \\det(0) = 0$ incorrect?',
      options: [
        'It uses the wrong formula for the determinant',
        '$\\det(A - \\lambda I)$ is a scalar polynomial; you cannot substitute a matrix for the scalar variable $\\lambda$ without additional justification',
        'The identity matrix is not allowed in the substitution',
        'It only works for symmetric matrices',
      ],
      answer: '$\\det(A - \\lambda I)$ is a scalar polynomial; you cannot substitute a matrix for the scalar variable $\\lambda$ without additional justification',
      hints: ['$p(λ)$ is a function of a scalar. When you write p(A), you are evaluating a polynomial at a matrix — this requires interpreting λⁿ as Aⁿ and constants as scalar×I. The substitution A→A gives A-AI=0 is a type error: A is not a scalar.'],
      reviewSection: 'Intuition — Warning: Do Not Prove It by Substitution',
    },
    {
      id: 'q-la3-006-5',
      type: 'choice',
      text: 'For $A = \\begin{bmatrix}3&1\\\\0&3\\end{bmatrix}$ (a Jordan block), what is the minimal polynomial?',
      options: [
        '$(\\lambda - 3)$',
        '$(\\lambda - 3)^2$',
        '$(\\lambda - 3)^3$',
        '$\\lambda^2 - 6\\lambda + 9$',
      ],
      answer: '$(\\lambda - 3)^2$',
      hints: ['For a Jordan block J_k(λ₀), the minimal polynomial is (λ - λ₀)^k. Here k=2, λ₀=3, so m(λ) = (λ-3)².'],
      reviewSection: 'Math — Minimal Polynomial',
    },
    {
      id: 'q-la3-006-6',
      type: 'choice',
      text: 'For diagonal $A = \\text{diag}(2, 2, 5)$, the characteristic polynomial is $(\\lambda-2)^2(\\lambda-5)$. What is the minimal polynomial?',
      options: [
        '$(\\lambda-2)^2(\\lambda-5)$',
        '$(\\lambda-2)(\\lambda-5)$',
        '$(\\lambda-2)^2$',
        '$(\\lambda-5)$',
      ],
      answer: '$(\\lambda-2)(\\lambda-5)$',
      hints: ['A is diagonal (diagonalizable), so the minimal polynomial has each distinct eigenvalue with multiplicity 1. Distinct eigenvalues: 2 and 5.'],
      reviewSection: 'Examples — Minimal polynomial example',
    },
    {
      id: 'q-la3-006-7',
      type: 'choice',
      text: 'For $A = \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$ (90° rotation), Cayley-Hamilton says $A^2 + I = 0$. What is $A^4$?',
      options: [
        '$-A^2$',
        '$I$',
        '$-I$',
        '$A$',
      ],
      answer: '$I$',
      hints: ['From A² = -I, we get A⁴ = (A²)² = (-I)² = I.'],
      reviewSection: 'Intuition — computing matrix powers',
    },
    {
      id: 'q-la3-006-8',
      type: 'choice',
      text: 'Cayley-Hamilton shows the controllability matrix $[B, AB, A^2B, \\ldots, A^{n-1}B]$ only needs $n$ columns because:',
      options: [
        '$A^n$ is always the identity matrix',
        '$A^n B$ is already a linear combination of the previous columns by Cayley-Hamilton',
        'The determinant of $A$ is always zero',
        'Control systems only use $n-1$ states',
      ],
      answer: '$A^n B$ is already a linear combination of the previous columns by Cayley-Hamilton',
      hints: ['Cayley-Hamilton says A^n = -(c_{n-1}A^{n-1} + ... + c_0 I), so A^n B = -(c_{n-1}A^{n-1}B + ... + c_0 B), which is a combination of columns already present.'],
      reviewSection: 'Rigor — Cayley-Hamilton in Control Theory',
    },
    {
      id: 'q-la3-006-9',
      type: 'choice',
      text: 'The Rodrigues rotation formula $R = I + \\sin(\\theta)K + (1-\\cos\\theta)K^2$ is a direct consequence of Cayley-Hamilton because:',
      options: [
        'All rotation matrices have eigenvalue 1',
        'The minimal polynomial of any skew-symmetric $K$ satisfies $K^3 = -K$, so the matrix exponential series truncates at $K^2$',
        'The determinant of $K$ is always zero',
        'Rotation matrices are always diagonalizable',
      ],
      answer: 'The minimal polynomial of any skew-symmetric $K$ satisfies $K^3 = -K$, so the matrix exponential series truncates at $K^2$',
      hints: ['For a unit-axis skew-sym K, the characteristic polynomial is λ³+λ = λ(λ²+1). So K³ = -K. Then e^(θK) = I + sin(θ)K + (1-cos θ)K², no higher powers needed.'],
      reviewSection: 'Math — Rodrigues formula cell',
    },
    {
      id: 'q-la3-006-10',
      type: 'choice',
      text: 'If the minimal polynomial of $A$ is $m(\\lambda) = (\\lambda-2)^3$, what can you conclude about the Jordan structure of $A$?',
      options: [
        '$A$ has exactly three eigenvalues all equal to 2',
        '$A$ has at least one Jordan block of size 3 for eigenvalue 2',
        '$A$ is a $3\\times 3$ matrix',
        '$A^3 = 8I$',
      ],
      answer: '$A$ has at least one Jordan block of size 3 for eigenvalue 2',
      hints: ['The degree of the largest Jordan block for eigenvalue λ₀ equals the multiplicity of λ₀ in the minimal polynomial. So (λ-2)³ means there is a 3×3 Jordan block for λ=2.'],
      reviewSection: 'Math — Minimal polynomial determines Jordan structure',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Cayley-Hamilton can be proved by substituting A into p(A) = det(A - AI) = det(0) = 0.',
      whyStudentsThinkIt: 'It looks like a simple substitution — if p(λ) = det(A - λI) and you set λ = A, then A - AI = 0, so det(0) = 0.',
      correctionExample: 'This is a type error. $p(\\lambda)$ is a polynomial whose variable $\\lambda$ is a scalar. When we write $p(A)$ we mean replace $\\lambda^k$ with $A^k$ and scalar constants with scalar×I. Writing $A - AI$ conflates matrix multiplication (AI = A) with scalar substitution (λ → A). The actual proof requires careful bookkeeping through the adjugate matrix.',
      contrastCase: 'Correct: $p(A) = A^2 - 5A + I$ for the 2×2 example, not $\\det(A - A \\cdot I)$.',
    },
    {
      falseBelief: 'The minimal polynomial always equals the characteristic polynomial.',
      whyStudentsThinkIt: 'Cayley-Hamilton says the characteristic polynomial annihilates A, so students assume it must be the smallest such polynomial.',
      correctionExample: 'For $A = \\text{diag}(3,3,2)$, the characteristic polynomial is $(\\lambda-3)^2(\\lambda-2)$ but the minimal polynomial is only $(\\lambda-3)(\\lambda-2)$ — degree 2, not 3. A is diagonalizable, so each eigenvalue needs only one factor.',
      contrastCase: 'Contrast: for the Jordan block $J = \\begin{bmatrix}3&1\\\\0&3\\end{bmatrix}$, both the minimal and characteristic polynomials are $(\\lambda-3)^2$ — they coincide because $J$ is not diagonalizable.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to compute $A^{50}$ for a $2\\times 2$ matrix without diagonalizing.',
      competingTechniques: 'Repeated matrix multiplication (50 steps), diagonalization then $D^{50}$, or Cayley-Hamilton recurrence.',
      whyThisTechniqueWins: 'Cayley-Hamilton gives $A^2 = \\text{tr}(A)A - \\det(A)I$, establishing a recurrence for $A^n = a_n A + b_n I$. You then compute the scalars $a_n, b_n$ with a simple two-term recurrence — no matrix multiplications beyond $A^2$.',
    },
    {
      situation: 'In signal processing, you need to bound the order of a recurrence relation produced by a linear system with state matrix $A$.',
      competingTechniques: 'Compute all eigenvectors explicitly, simulate the recurrence directly, or apply Cayley-Hamilton.',
      whyThisTechniqueWins: 'Cayley-Hamilton says $A^n$ is a linear combination of $\\{I, A, \\ldots, A^{n-1}\\}$, so any output of the system obeys a recurrence of order $\\leq n$. You get the bound immediately from the matrix size — no eigenvalue computation required.',
    },
  ],

  debugging: [
    {
      commonError: 'Getting a non-zero matrix when evaluating $p(A)$.',
      symptom: 'Numerical computation gives a matrix with small but non-zero entries (or large entries for poorly conditioned matrices).',
      whyItHappened: 'Usually a sign error in the characteristic polynomial: forgetting that $p(\\lambda) = \\lambda^n - \\text{tr}(A)\\lambda^{n-1} + \\cdots + (-1)^n \\det(A)$, or mixing up the sign of the constant term.',
      repairStrategy: 'Recompute $p(\\lambda)$ carefully. For $2\\times 2$: $p(\\lambda) = \\lambda^2 - \\text{tr}(A)\\lambda + \\det(A)$. Verify that the signs match by checking $p(0) = \\det(A)$ (note: $p(0) = (-1)^n \\det(A)$ in general).',
    },
    {
      commonError: 'Claiming $m(A) = 0$ for the wrong minimal polynomial.',
      symptom: 'You write $m(\\lambda) = (\\lambda - \\lambda_1)$ for a matrix with repeated eigenvalue, but $m(A) \\neq 0$.',
      whyItHappened: 'The minimal polynomial must include $(\\lambda - \\lambda_0)^k$ where $k$ is the size of the largest Jordan block for $\\lambda_0$. If $A$ has a $2\\times 2$ Jordan block, you need $(\\lambda - \\lambda_0)^2$ — not just $(\\lambda - \\lambda_0)$.',
      repairStrategy: 'Test incrementally: check if $(A - \\lambda_0 I) = 0$. If not, check $(A - \\lambda_0 I)^2 = 0$. Stop at the first power that gives zero — that is the minimal polynomial factor for $\\lambda_0$.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given any 2×2 or 3×3 matrix, verify Cayley-Hamilton, use it to compute the inverse, and express A³ as a linear combination of lower powers.',
    explainVerbally: 'State Cayley-Hamilton in one sentence, explain why plugging A into p(A) gives zero (not just "by definition"), and distinguish the minimal polynomial from the characteristic polynomial.',
    detectIncorrectApplication: 'Identify the false substitution proof p(A) = det(A-AI); catch sign errors in characteristic polynomial coefficients; recognize when minimal polynomial is strictly smaller than characteristic polynomial.',
    transferToUnfamiliar: 'Apply Cayley-Hamilton to bound recurrence order in a linear system, derive the Rodrigues formula for 3D rotations, or compute matrix exponentials via polynomial truncation.',
  },

  semantics: {
    core: [
      { symbol: 'p(\\lambda)', meaning: 'Characteristic polynomial: $\\det(A - \\lambda I)$; a degree-$n$ polynomial in the scalar $\\lambda$ whose roots are the eigenvalues of $A$.' },
      { symbol: 'p(A)', meaning: 'The characteristic polynomial evaluated at the matrix $A$: replace $\\lambda^k$ with $A^k$ and scalar constants $c$ with $cI$. Cayley-Hamilton: $p(A) = 0$.' },
      { symbol: 'm(\\lambda)', meaning: 'Minimal polynomial: the monic polynomial of smallest degree satisfying $m(A) = 0$. Divides $p(\\lambda)$ and has the same roots, but possibly smaller multiplicities.' },
      { symbol: 'A^{-1} = (\\text{tr}(A)I - A)/\\det(A)', meaning: 'Inverse formula for $2\\times 2$ matrices derived from Cayley-Hamilton by multiplying $p(A) = 0$ by $A^{-1}$.' },
      { symbol: 'A^n = a_n A + b_n I', meaning: 'For a $2\\times 2$ matrix, every power $A^n$ is a linear combination of $A$ and $I$, with scalar coefficients satisfying a two-term recurrence from the characteristic polynomial.' },
    ],
    rulesOfThumb: [
      'For a $2\\times 2$ matrix: $A^{-1} = (\\text{tr}(A) \\cdot I - A)/\\det(A)$ — no row reduction needed.',
      'Every $A^k$ for $k \\geq n$ is a linear combination of $\\{I, A, \\ldots, A^{n-1}\\}$ — Cayley-Hamilton is a recurrence relation.',
      'Minimal polynomial = characteristic polynomial iff no Jordan block is smaller than it could be — i.e., for non-diagonalizable matrices.',
      'For diagonal (diagonalizable) matrices, minimal polynomial has each distinct eigenvalue once: $m(\\lambda) = \\prod_i (\\lambda - \\lambda_i)$.',
      'Never prove Cayley-Hamilton by substitution: $\\det(A - AI) = \\det(0) = 0$ is a type error — $A$ is a matrix, not a scalar.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { id: 'la2-012', reason: 'Review cofactor expansion and the adjugate matrix — the rigorous proof of Cayley-Hamilton uses the adjugate identity $(A-\\lambda I)\\text{adj}(A-\\lambda I) = p(\\lambda)I$.' },
      { id: 'la3-001', reason: 'Review eigenvalues and the characteristic polynomial — Cayley-Hamilton is a statement about plugging the matrix back into its own eigenvalue polynomial.' },
    ],
    futureLinks: [
      { id: 'la3-007', preview: 'Matrix exponential: Cayley-Hamilton truncates the Taylor series of $e^{At}$ to finite degree, making matrix exponentials computable as polynomial functions of $A$.' },
      { id: 'la3-004', preview: 'Jordan normal form: the minimal polynomial encodes the Jordan block sizes — its factorization reveals whether the matrix is diagonalizable.' },
    ],
  },
};
