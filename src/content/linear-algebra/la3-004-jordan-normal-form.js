export default {
  id: 'la3-004',
  slug: 'jordan-normal-form',
  chapter: 'la3',
  order: 4,
  title: 'Jordan Normal Form',
  subtitle: 'When diagonalization fails — because a matrix has repeated eigenvalues with too few eigenvectors — Jordan form is the nearest thing to a diagonal matrix that always exists.',
  tags: ['Jordan form', 'Jordan blocks', 'generalized eigenvectors', 'defective matrix', 'nilpotent', 'Jordan decomposition', 'algebraic multiplicity', 'geometric multiplicity'],
  aliases: 'Jordan normal form Jordan blocks generalized eigenvectors defective matrix nilpotent non-diagonalizable algebraic geometric multiplicity',

  hook: {
    question: "Diagonalization fails when a matrix has repeated eigenvalues but not enough eigenvectors. Is there a universal form that every matrix can be reduced to — even the stubborn, non-diagonalizable ones?",
    realWorldContext: "Jordan form arises whenever a system has critically damped behavior — repeated roots in the characteristic equation with a deficiency of eigenvectors. A classic example: the critically damped spring-mass system, sitting exactly at the boundary between oscillation and overdamping, exhibits $t \\cdot e^{\\lambda t}$ solutions (polynomial × exponential) that can only be understood through Jordan form. In control theory, the Jordan structure determines whether a system can be stabilized. In differential geometry, the Jordan form of the Riemann curvature tensor determines the local shape of spacetime.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Review: what diagonalization requires.** From la3-002, an $n \\times n$ matrix is diagonalizable iff it has $n$ linearly independent eigenvectors. When a matrix has a repeated eigenvalue $\\lambda$ but fewer independent eigenvectors than the multiplicity of $\\lambda$, it is called **defective** — and diagonalization is impossible. Jordan form is the answer to the question: if we cannot fully diagonalize, what is the closest we can get?',
      '**What a Jordan block looks like.** A Jordan block $J_k(\\lambda)$ is a $k \\times k$ matrix with $\\lambda$ on the main diagonal and 1s on the superdiagonal, zeros elsewhere:\n\n$J_k(\\lambda) = \\begin{bmatrix}\\lambda & 1 & 0 & 0 \\\\ 0 & \\lambda & 1 & 0 \\\\ 0 & 0 & \\lambda & 1 \\\\ 0 & 0 & 0 & \\lambda\\end{bmatrix}$\n\nA $1\\times 1$ block is just $[\\lambda]$. When all blocks are $1\\times 1$, you have the diagonal form you know. The 1s on the superdiagonal are the mark of a defective matrix — they encode the "missing" eigenvectors.',
      '**The Jordan Normal Form theorem.** Every $n \\times n$ complex matrix is similar to a block-diagonal matrix whose blocks are Jordan blocks. This is the Jordan Normal Form (JNF). The block structure is unique (up to reordering blocks): the sizes and eigenvalues of the blocks are fingerprints of the matrix. What is not unique is the change-of-basis matrix $P$.',
      '**Generalized eigenvectors — filling the gap.** For a size-$k$ Jordan block, there is only ONE linearly independent eigenvector. The remaining $k-1$ basis vectors are **generalized eigenvectors**: they satisfy $(A - \\lambda I)^j \\mathbf{v}_j = \\mathbf{0}$ for some $j > 1$ but not for $j-1$. Together they form a **Jordan chain**: starting from the true eigenvector $\\mathbf{v}_1$ (satisfying $(A-\\lambda I)\\mathbf{v}_1 = 0$), each next vector is found by solving $(A - \\lambda I)\\mathbf{v}_{i+1} = \\mathbf{v}_i$.',
      '**CNC application: critically damped axes.** A CNC axis controller modeled as a second-order system has a characteristic equation $s^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0$. At **critical damping** ($\\zeta = 1$), this has a repeated root: $s = -\\omega_n$ with multiplicity 2. The corresponding state matrix is a Jordan block $J_2(-\\omega_n)$ — defective by design. The solution is $x(t) = (c_1 + c_2 t)e^{-\\omega_n t}$: the polynomial factor $c_2 t$ is the signature of the Jordan block. CNC axes are often tuned near critical damping for the fastest non-oscillatory response. Overdamped axes settle more slowly; underdamped axes ring. The Jordan block is the math behind the "sweet spot."',
      '**Why Jordan form matters theoretically.** Jordan form classifies all linear maps up to change-of-basis — two matrices are similar (represent the same transformation) if and only if they have the same Jordan form. It also makes computing matrix exponentials tractable: $e^{Jt}$ for a Jordan block has a clean formula involving polynomials in $t$ multiplied by exponentials, which is exactly the solution structure of differential equations with repeated eigenvalues.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Defective Matrix',
        body: 'A matrix is **defective** if for some eigenvalue $\\lambda$:\n\n$m_g(\\lambda) < m_a(\\lambda)$\n\nwhere $m_g(\\lambda) = \\dim \\ker(A - \\lambda I)$ is the **geometric multiplicity** (number of independent eigenvectors) and $m_a(\\lambda)$ is the **algebraic multiplicity** (root multiplicity in char. poly.).\n\nA defective matrix cannot be diagonalized.',
      },
      {
        type: 'insight',
        title: 'Reading the Jordan Structure',
        body: 'For each eigenvalue $\\lambda$:\n\n- **Number of Jordan blocks** = geometric multiplicity = number of independent eigenvectors\n- **Sum of block sizes** = algebraic multiplicity = multiplicity in char. poly.\n- **Diagonalizable** iff every Jordan block is $1 \\times 1$\n\nExample: algebraic mult = 4, geometric mult = 2 → exactly two Jordan blocks whose sizes sum to 4 (could be $3+1$, or $2+2$).',
      },
      {
        type: 'insight',
        title: 'Jordan Form vs Diagonal Form',
        body: 'Diagonal: $D = \\text{diag}(\\lambda_1, \\ldots, \\lambda_n)$ — all Jordan blocks are $1 \\times 1$.\nJordan: $J = J_{k_1}(\\lambda_1) \\oplus J_{k_2}(\\lambda_2) \\oplus \\cdots$ — some blocks can be larger.\n\nDiagonal form is the special case of Jordan form where the matrix is not defective.',
      },
      {
        type: 'warning',
        title: 'Jordan Form Is Numerically Unstable',
        body: 'Jordan form is sensitive to perturbations: adding $\\epsilon$ to one entry of a defective matrix can make it fully diagonalizable with eigenvalues splitting by $\\sim \\epsilon^{1/k}$. Never use Jordan form computationally. For numerical work, use **Schur decomposition** instead — upper triangular, numerically stable, same theoretical content.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Jordan Structure in OpenMAT',
        mathBridge: 'Build a defective matrix and examine why diagonalization fails.',
        caption: 'A Jordan block with a 1 on the superdiagonal is irreducible — it cannot be split further.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'A defective matrix: eigenvalues without enough eigenvectors',
              prose: ['J = [3 1; 0 3] has eigenvalue 3 with algebraic multiplicity 2 but only 1 eigenvector.'],
              code: `J = [3 1; 0 3]
[V, D] = eig(J)
disp('Eigenvalues (diagonal of D):')
diag(D)
disp('Eigenvectors (columns of V):')
V
disp('Are columns independent? (det of V)')
det(V)
`,
            },
            {
              id: 2,
              cellTitle: 'Jordan chain: generalized eigenvectors',
              prose: ['Find the true eigenvector v1 and generalized eigenvector v2 such that (J-3I)v2 = v1.'],
              code: `J = [3 1; 0 3]
lam = 3;
B = J - lam*eye(2)
disp('Null space of (J - 3I) = true eigenvectors:')
rref(B)
disp('v1 = first eigenvector:')
v1 = [1; 0]
disp('Solve (J-3I)v2 = v1 for generalized eigenvector v2:')
% augmented matrix [B | v1]
rref([B v1])
v2 = [0; 1]
disp('Verify: (J-3I)*v2 = v1')
B * v2
`,
            },
            {
              id: 3,
              cellTitle: 'Matrix powers of a Jordan block',
              prose: ['For a Jordan block J_k(lambda), J^n has lambda^n on diagonal and n*lambda^(n-1) on superdiagonal.'],
              code: `J = [3 1; 0 3]
disp('J^2:')
J^2
disp('J^3:')
J^3
disp('Pattern: J^n = [3^n, n*3^(n-1); 0, 3^n]')
n = 4;
J_pred = [3^n, n*3^(n-1); 0, 3^n]
J^4
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Algebraic vs geometric multiplicity.** The **algebraic multiplicity** $m_a(\\lambda)$ is the multiplicity of $\\lambda$ as a root of the characteristic polynomial $\\det(A - \\lambda I)$. The **geometric multiplicity** $m_g(\\lambda) = \\dim \\text{Nul}(A - \\lambda I)$ is the dimension of the eigenspace. Always $1 \\leq m_g(\\lambda) \\leq m_a(\\lambda)$. The matrix is diagonalizable iff $m_g(\\lambda) = m_a(\\lambda)$ for every eigenvalue $\\lambda$.',
      '**Generalized eigenspaces.** The $k$-th generalized eigenspace is $\\text{Nul}(A - \\lambda I)^k$. This is a nested sequence of subspaces: $\\text{Nul}(A - \\lambda I) \\subseteq \\text{Nul}(A - \\lambda I)^2 \\subseteq \\cdots$. The sequence stabilizes at the algebraic multiplicity: $\\text{Nul}(A - \\lambda I)^{m_a(\\lambda)} = \\text{Nul}(A - \\lambda I)^{m_a(\\lambda)+1}$. The final subspace has dimension exactly $m_a(\\lambda)$.',
      '**Jordan decomposition.** Every complex $n \\times n$ matrix $A$ can be written as $A = SJS^{-1}$ where $J$ is in Jordan normal form. The matrix $S$ is formed from Jordan chains: each Jordan chain $\\{\\mathbf{v}_1, \\mathbf{v}_2, \\ldots, \\mathbf{v}_k\\}$ (where $(A - \\lambda I)\\mathbf{v}_{i+1} = \\mathbf{v}_i$ and $(A - \\lambda I)\\mathbf{v}_1 = 0$) contributes one Jordan block $J_k(\\lambda)$ to $J$, with the chain vectors as columns of $S$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Jordan Normal Form Theorem',
        body: 'Every $n \\times n$ matrix $A$ over $\\mathbb{C}$ is similar to a **unique** Jordan normal form (up to reordering of blocks):\n\n$A = SJS^{-1}$ where $J = J_{k_1}(\\lambda_1) \\oplus J_{k_2}(\\lambda_2) \\oplus \\cdots$\n\nand $\\sum k_i = n$. The block sizes and eigenvalues are uniquely determined; $S$ is not.',
      },
      {
        type: 'insight',
        title: 'Nilpotent Decomposition',
        body: 'Each Jordan block splits as $J_k(\\lambda) = \\lambda I + N_k$ where $N_k$ has 1s only on the superdiagonal — a **nilpotent** matrix satisfying $N_k^k = 0$.\n\nThis decomposition makes the matrix exponential tractable:\n\n$e^{Jt} = e^{\\lambda t} e^{N_k t} = e^{\\lambda t}\\left(I + N_k t + \\frac{N_k^2 t^2}{2!} + \\cdots\\right)$\n\nThe series terminates at $N_k^{k-1}$ (since $N_k^k = 0$).',
      },
      {
        type: 'insight',
        title: 'Powers of a Jordan Block',
        body: 'For $J_2(\\lambda) = \\begin{bmatrix}\\lambda & 1 \\\\ 0 & \\lambda\\end{bmatrix}$:\n\n$J_2^n = \\begin{bmatrix}\\lambda^n & n\\lambda^{n-1} \\\\ 0 & \\lambda^n\\end{bmatrix}$\n\nThe off-diagonal $n\\lambda^{n-1}$ is the polynomial signature of a Jordan block — it grows polynomially while the diagonal grows exponentially. For stability, $|\\lambda| < 1$ ensures both terms → 0.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Jordan Blocks, Generalized Eigenvectors, and Critical Damping',
        mathBridge: 'Python: detect defective matrices via rank of (A - λI). Find Jordan chains by solving (A-λI)v₂ = v₁. Scipy `jordan_form()` computes Jordan form. Matrix exponential via scipy.linalg.expm() reveals the polynomial×exponential structure.',
        caption: 'Three cells: defective matrix analysis, Jordan chain construction, and critically-damped CNC axis response.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Detecting a defective matrix — algebraic vs geometric multiplicity',
              prose: [
                'A matrix is defective when eigenvalues are repeated but the eigenspace is too small. Check: are all eigenvectors independent? If eig() returns near-duplicate columns, the matrix is defective.',
                'The rank of (A - λI) determines the eigenspace dimension: geometric multiplicity = n - rank(A - λI).',
              ],
              code: `import numpy as np

# Defective 2x2 matrix: λ=3, algebraic mult 2, geo mult 1
J2 = np.array([[3., 1.],
               [0., 3.]])

evals, evecs = np.linalg.eig(J2)
print("Eigenvalues:", evals)
print()
print("Eigenvectors (columns):")
print(evecs.real.round(6))
print()

# Check geometric multiplicity via rank deficiency
A_minus_lI = J2 - 3*np.eye(2)
rank = np.linalg.matrix_rank(A_minus_lI)
geo_mult = 2 - rank
alg_mult = 2  # both eigenvalues are 3

print(f"Algebraic multiplicity: {alg_mult}")
print(f"Geometric multiplicity: {geo_mult}")
print(f"Defective? {geo_mult < alg_mult}")`,
            },
            {
              id: 2,
              cellTitle: 'Jordan chain: finding the generalized eigenvector',
              prose: [
                'For a 2×2 Jordan block with eigenvalue λ: v₁ is the true eigenvector, v₂ satisfies (A-λI)v₂ = v₁.',
                'Solve (A-λI)v₂ = v₁ as a linear system. The solution v₂ is not unique — any particular solution works.',
              ],
              code: `import numpy as np

A = np.array([[3., 1.],
              [0., 3.]])
lam = 3.0

N = A - lam * np.eye(2)  # nilpotent part

# True eigenvector: solve Nv1 = 0
_, _, Vh = np.linalg.svd(N)
v1 = Vh[-1].real  # right singular vector for near-zero singular value
v1 = v1 / v1[0]   # normalize so first component = 1

# Generalized eigenvector: solve Nv2 = v1
# Use lstsq for the least-squares solution
v2, _, _, _ = np.linalg.lstsq(N, v1, rcond=None)

print("Nilpotent N = A - 3I:")
print(N)
print()
print(f"True eigenvector v1: {v1}")
print(f"Generalized eigenvector v2: {v2.real}")
print()
print("Verify (A-3I)v2 = v1:")
print(f"  N @ v2 = {(N @ v2.real).round(6)}")
print(f"  v1 =     {v1}")
print(f"  Match: {np.allclose(N @ v2.real, v1, atol=1e-6)}")`,
            },
            {
              id: 3,
              cellTitle: 'CNC critically damped axis — Jordan block in action',
              prose: [
                'A critically damped second-order system (ζ=1) has a repeated pole at s=-ωₙ. Its state matrix is a Jordan block. The solution x(t) = (c₁ + c₂t)e^{-ωₙt} has the polynomial×exponential signature of a Jordan block.',
                'Critical damping gives the fastest settling without overshoot — engineers deliberately target this. The Jordan block is the mathematical model behind it.',
              ],
              code: `import numpy as np
from scipy.linalg import expm

# CNC axis: critically damped 2nd-order system
# x'' + 2*omega_n*x' + omega_n^2*x = 0 at ζ=1
omega_n = 100.0  # 100 rad/s natural frequency

# State space: [x, x'] — Jordan block structure
A = np.array([[-omega_n, 1.],
              [0.,       -omega_n]])

print("State matrix A (Jordan block):")
print(A)
evals = np.linalg.eigvals(A)
print(f"\\nEigenvalues: {evals}  (repeated root at λ = -ωₙ)")
print()

# Response: expm(A*t) gives the transition matrix
# Initial condition: 1mm displacement, zero velocity
x0 = np.array([1e-3, 0.0])

print("Position response at selected times:")
print(f"{'t (ms)':>8}  {'x (mm)':>10}  {'v (mm/s)':>12}")
for t_ms in [0, 5, 10, 20, 50]:
    t = t_ms * 1e-3
    xt = expm(A * t) @ x0
    print(f"{t_ms:>8}  {xt[0]*1e3:>10.4f}  {xt[1]*1e3:>12.4f}")

print()
print("Note: solution form x(t) = (c1 + c2*t)*exp(-ωₙt)")
print("The linear term 'c2*t' is the Jordan block's signature.")`,
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      '**Primary Decomposition Theorem.** If the characteristic polynomial of $A$ factors as $p(\\lambda) = (\\lambda - \\lambda_1)^{m_1} \\cdots (\\lambda - \\lambda_r)^{m_r}$ over $\\mathbb{C}$, then $\\mathbb{C}^n = V_1 \\oplus \\cdots \\oplus V_r$ where $V_i = \\text{Nul}(A - \\lambda_i I)^{m_i}$ are the **generalized eigenspaces**. Each $V_i$ is $A$-invariant (applying $A$ to a vector in $V_i$ keeps it in $V_i$) and has dimension exactly $m_i$. The Jordan normal form is obtained by choosing a Jordan chain basis for each $V_i$.',
      '**Existence of Jordan form.** The proof proceeds by induction on the size of the largest Jordan block. For each generalized eigenspace $V_i$, the restriction of $A$ to $V_i$ has a single eigenvalue $\\lambda_i$ and the operator $A - \\lambda_i I|_{V_i}$ is nilpotent. Finding a Jordan basis for a nilpotent operator is the core step. This is done by choosing a vector $\\mathbf{v}$ at the top of the longest chain (satisfying $(A-\\lambda I)^k \\mathbf{v} \\neq 0$ but $(A-\\lambda I)^{k+1} \\mathbf{v} = 0$), then working back down.',
      '**Uniqueness.** Two matrices have the same Jordan form (up to block reordering) iff they have the same characteristic polynomial AND the same rank for $(A - \\lambda I)^k$ for every $\\lambda$ and every $k$. This is why Jordan form is a complete invariant for similarity — it captures all the information about the matrix that does not depend on the choice of basis.',
      '**Matrix exponential for Jordan blocks.** The matrix exponential $e^{At}$ is the fundamental solution of $\\dot{\\mathbf{x}} = A\\mathbf{x}$. For a Jordan block:\n\n$e^{J_k(\\lambda)t} = e^{\\lambda t}\\begin{bmatrix}1 & t & \\frac{t^2}{2!} & \\cdots & \\frac{t^{k-1}}{(k-1)!} \\\\ 0 & 1 & t & \\cdots & \\frac{t^{k-2}}{(k-2)!} \\\\ & & \\ddots & & \\vdots \\\\ 0 & 0 & \\cdots & 0 & 1\\end{bmatrix}$\n\nThis is a finite truncation of $e^{Nt}$ (which terminates because $N^k = 0$). The $t^{k-1}$ factor is why critically damped systems have polynomial growth in the transient.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Primary Decomposition',
        body: 'If $\\text{char}(A) = \\prod (\\lambda - \\lambda_i)^{m_i}$, then:\n\n$\\mathbb{C}^n = \\bigoplus_{i} \\text{Nul}(A - \\lambda_i I)^{m_i}$\n\nEach generalized eigenspace $V_i = \\text{Nul}(A - \\lambda_i I)^{m_i}$ is $A$-invariant and has dimension $m_i$.',
      },
      {
        type: 'insight',
        title: 'Jordan Form over Reals',
        body: 'Over $\\mathbb{R}$, complex conjugate pairs of eigenvalues $a \\pm bi$ cannot be Jordan-block-ified with real entries. Instead, each conjugate pair produces a $2 \\times 2$ real rotation-scaling block:\n\n$\\begin{bmatrix}a & -b \\\\ b & a\\end{bmatrix}$\n\nThis is the real Jordan form (or real canonical form). It replaces complex diagonalization with real block-diagonalization.',
      },
      {
        type: 'insight',
        title: 'Similarity Invariants',
        body: 'Two matrices are **similar** (same Jordan form) iff they have the same:\n1. Characteristic polynomial\n2. $\\text{rank}(A - \\lambda I)^k$ for every $\\lambda \\in \\mathbb{C}$ and every $k \\geq 1$\n\nEquivalently: the same set of (eigenvalue, Jordan block size) pairs — the full Jordan structure.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la3-004-1',
      title: 'Jordan form of a 2×2 defective matrix',
      problem: 'Find the Jordan form of $A = \\begin{bmatrix}5&1\\\\0&5\\end{bmatrix}$ and identify the Jordan chain.',
      steps: [
        {
          expression: '\\det(A - \\lambda I) = (5-\\lambda)^2 = 0 \\Rightarrow \\lambda = 5 \\text{ (alg. mult. 2)}',
          annotation: 'Characteristic equation. Double root at $\\lambda = 5$.',
          strategyTitle: 'Find eigenvalue',
          checkpoint: 'What do we need to check before concluding A is defective?',
          hints: ['Check the geometric multiplicity — the dimension of $\\ker(A - 5I)$.'],
        },
        {
          expression: 'A - 5I = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix} \\qquad \\ker(A-5I) = \\text{span}\\left\\{\\begin{bmatrix}1\\\\0\\end{bmatrix}\\right\\}',
          annotation: 'Geometric multiplicity = 1 (only one independent eigenvector). Since $1 < 2$, $A$ is defective.',
          strategyTitle: 'Check geometric multiplicity',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{Jordan form: } J = J_2(5) = \\begin{bmatrix}5&1\\\\0&5\\end{bmatrix} = A',
          annotation: '$A$ is itself in Jordan form — one block of size 2.',
          strategyTitle: 'Write Jordan form',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{v}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix}, \\quad (A - 5I)\\mathbf{v}_2 = \\mathbf{v}_1 \\Rightarrow \\mathbf{v}_2 = \\begin{bmatrix}0\\\\1\\end{bmatrix}',
          annotation: 'Jordan chain: $\\mathbf{v}_1$ is the eigenvector, $\\mathbf{v}_2$ is the generalized eigenvector. Verify: $(A-5I)\\mathbf{v}_2 = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}\\begin{bmatrix}0\\\\1\\end{bmatrix} = \\begin{bmatrix}1\\\\0\\end{bmatrix} = \\mathbf{v}_1$ ✓',
          strategyTitle: 'Find Jordan chain',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: '$A = J_2(5)$ is already in Jordan form — one $2\\times 2$ block at eigenvalue 5. The Jordan chain $\\{[1,0]^T, [0,1]^T\\}$ spans $\\mathbb{R}^2$, even though there is only one eigenvector.',
    },
    {
      id: 'ex-la3-004-2',
      title: 'Identifying Jordan structure from multiplicity data',
      problem: 'A $4\\times 4$ matrix has eigenvalue $\\lambda = 3$ with algebraic multiplicity 4 and geometric multiplicity 2. What are the possible Jordan forms?',
      steps: [
        {
          expression: '\\text{Two Jordan blocks for } \\lambda = 3 \\text{ (geometric mult = 2)}',
          annotation: 'Number of blocks = geometric multiplicity = 2.',
          strategyTitle: 'Count blocks',
          checkpoint: 'What must the block sizes sum to?',
          hints: ['They must sum to the algebraic multiplicity = 4.'],
        },
        {
          expression: '\\text{Two blocks summing to 4: either } (3, 1) \\text{ or } (2, 2)',
          annotation: 'The only partitions of 4 into 2 positive integers.',
          strategyTitle: 'List partitions',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'J = J_3(3) \\oplus J_1(3) = \\begin{bmatrix}3&1&0&0\\\\0&3&1&0\\\\0&0&3&0\\\\0&0&0&3\\end{bmatrix} \\quad \\text{OR} \\quad J = J_2(3) \\oplus J_2(3) = \\begin{bmatrix}3&1&0&0\\\\0&3&0&0\\\\0&0&3&1\\\\0&0&0&3\\end{bmatrix}',
          annotation: 'Two distinct possible Jordan forms. Cannot determine which without more information (e.g., the rank of $(A-3I)^2$).',
          strategyTitle: 'Write both forms',
          checkpoint: 'How would you distinguish between the two cases?',
          hints: ['Compute rank$(A - 3I)^2$. If rank = 2, the block sizes are (3,1). If rank = 0, they are (2,2).'],
        },
      ],
      conclusion: 'With only algebraic and geometric multiplicity, you can narrow down the Jordan structure but may not determine it uniquely. The ranks of $(A-\\lambda I)^k$ for $k = 1, 2, \\ldots$ give the full picture.',
    },
  ],

  challenges: [
    {
      id: 'ch-la3-004-1',
      difficulty: 'easy',
      problem: 'For $A = \\begin{bmatrix}2&0\\\\0&2\\end{bmatrix}$ and $B = \\begin{bmatrix}2&1\\\\0&2\\end{bmatrix}$: both have the same characteristic polynomial $(\\lambda-2)^2 = 0$. Are they similar? Do they have the same Jordan form?',
      hint: 'Compute the geometric multiplicity for each. A has two independent eigenvectors; B has one.',
      walkthrough: [
        {
          expression: 'A - 2I = \\begin{bmatrix}0&0\\\\0&0\\end{bmatrix} \\Rightarrow \\ker = \\mathbb{R}^2, \\; m_g = 2',
          annotation: '$A$ is already diagonal — two $1\\times 1$ blocks: $J = J_1(2) \\oplus J_1(2)$.',
        },
        {
          expression: 'B - 2I = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix} \\Rightarrow \\ker = \\text{span}\\{[1,0]^T\\}, \\; m_g = 1',
          annotation: '$B$ is defective — one $2\\times 2$ block: $J = J_2(2)$.',
        },
        {
          expression: 'J_A = \\begin{bmatrix}2&0\\\\0&2\\end{bmatrix} \\neq J_B = \\begin{bmatrix}2&1\\\\0&2\\end{bmatrix}',
          annotation: 'Different Jordan forms → NOT similar. Same eigenvalues are not enough; the multiplicity structure matters.',
        },
      ],
      answer: 'A and B are NOT similar. A has Jordan form diag(2,2); B has Jordan form [[2,1],[0,2]]. Same characteristic polynomial, different Jordan structures.',
    },
    {
      id: 'ch-la3-004-2',
      difficulty: 'medium',
      problem: 'Determine the possible Jordan forms for a $4 \\times 4$ matrix with eigenvalue $\\lambda = 2$ of algebraic multiplicity 4 and geometric multiplicity 2.',
      hint: 'Number of Jordan blocks = geometric multiplicity = 2. Block sizes must sum to 4.',
      walkthrough: [
        {
          expression: '\\text{Two blocks summing to 4: partitions of 4 into 2 parts} = (3,1) \\text{ or } (2,2)',
          annotation: 'Those are the only ways to write 4 as an ordered sum of 2 positive integers (up to reordering).',
        },
        {
          expression: 'J = J_3(2) \\oplus J_1(2) \\quad \\text{or} \\quad J = J_2(2) \\oplus J_2(2)',
          annotation: 'Cannot determine which without computing rank$(A - 2I)^2$.',
        },
      ],
      answer: 'Two possibilities: J₃(2) ⊕ J₁(2) or J₂(2) ⊕ J₂(2). Distinguish by computing rank(A-2I)².',
    },
    {
      id: 'ch-la3-004-3',
      difficulty: 'hard',
      problem: 'For the Jordan block $J = \\begin{bmatrix}\\lambda & 1 \\\\ 0 & \\lambda\\end{bmatrix}$, derive the formula for $J^n$ and verify for $n = 3$ with $\\lambda = 2$.',
      hint: 'Write $J = \\lambda I + N$ where $N = [[0,1],[0,0]]$. Use the binomial theorem. Note $N^2 = 0$.',
      walkthrough: [
        {
          expression: 'J = \\lambda I + N, \\quad N = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}, \\quad N^2 = 0',
          annotation: 'Decompose into scalar and nilpotent parts.',
        },
        {
          expression: 'J^n = (\\lambda I + N)^n = \\sum_{k=0}^{n}\\binom{n}{k}\\lambda^{n-k}N^k = \\lambda^n I + n\\lambda^{n-1}N',
          annotation: 'Binomial theorem. All terms with $k \\geq 2$ vanish since $N^2 = 0$.',
        },
        {
          expression: 'J^n = \\begin{bmatrix}\\lambda^n & n\\lambda^{n-1} \\\\ 0 & \\lambda^n\\end{bmatrix} \\qquad J^3\\big|_{\\lambda=2} = \\begin{bmatrix}8 & 12 \\\\ 0 & 8\\end{bmatrix}',
          annotation: 'For $\\lambda=2, n=3$: diagonal $2^3 = 8$, off-diagonal $3 \\cdot 2^2 = 12$. Verify by multiplying $J \\cdot J \\cdot J$ directly.',
        },
      ],
      answer: 'Jⁿ = [[λⁿ, nλⁿ⁻¹],[0, λⁿ]]. For λ=2, n=3: [[8,12],[0,8]].',
    },
  ],

  mentalModel: [
    'Defective = repeated eigenvalue with eigenspace too small = can\'t fully diagonalize.',
    'Jordan blocks capture the "almost diagonal" structure: diagonal entries are eigenvalues, superdiagonal 1s encode generalized eigenvectors.',
    'Number of Jordan blocks for $\\lambda$ = geometric multiplicity = number of independent eigenvectors.',
    'Sum of block sizes for $\\lambda$ = algebraic multiplicity = root multiplicity in char. poly.',
  ],

  checkpoints: [
    { id: 'cp-la3-004-1', question: 'What makes a matrix defective?', answer: 'Geometric multiplicity < algebraic multiplicity for some eigenvalue.' },
    { id: 'cp-la3-004-2', question: 'What is a generalized eigenvector?', answer: '$(A - \\lambda I)^k \\mathbf{v} = 0$ but $(A - \\lambda I)^{k-1} \\mathbf{v} \\neq 0$.' },
    { id: 'cp-la3-004-3', question: 'If all Jordan blocks are $1 \\times 1$, what does that mean?', answer: 'The matrix is diagonalizable.' },
  ],

  assessment: {
    questions: [
      {
        id: 'la3-004-assess-1',
        type: 'input',
        text: 'For $J = \\begin{bmatrix}3&1\\\\0&3\\end{bmatrix}$, what is the $(1,2)$ entry of $J^4$? (Use the formula $J^n = \\begin{bmatrix}\\lambda^n & n\\lambda^{n-1}\\\\0&\\lambda^n\\end{bmatrix}$)',
        answer: '108',
        hint: '$n\\lambda^{n-1} = 4 \\cdot 3^3 = 4 \\cdot 27 = 108$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la3-004-1',
      type: 'choice',
      text: 'A $3 \\times 3$ matrix has eigenvalue $\\lambda = 2$ with algebraic multiplicity 3 and geometric multiplicity 1. What is its Jordan form?',
      options: ['$J_3(2)$', '$J_2(2) \\oplus J_1(2)$', '$J_1(2) \\oplus J_1(2) \\oplus J_1(2)$', 'The diagonal matrix $\\text{diag}(2,2,2)$'],
      answer: '$J_3(2)$',
      hints: ['Geometric multiplicity = number of Jordan blocks = 1. Algebraic multiplicity = sum of block sizes = 3. One block of size 3.'],
      reviewSection: 'Intuition tab — Reading the Jordan Structure',
    },
    {
      id: 'q-la3-004-2',
      type: 'choice',
      text: 'The number of Jordan blocks for eigenvalue $\\lambda$ equals which quantity?',
      options: ['Algebraic multiplicity', 'Geometric multiplicity', 'Order of the matrix', 'Rank of $A$'],
      answer: 'Geometric multiplicity',
      hints: ['Geometric multiplicity = dim ker(A - λI) = number of independent eigenvectors = number of Jordan chains = number of Jordan blocks.'],
      reviewSection: 'Intuition tab — Reading the Jordan Structure',
    },
    {
      id: 'q-la3-004-3',
      type: 'choice',
      text: 'A vector $\\mathbf{v}$ satisfies $(A - \\lambda I)^2 \\mathbf{v} = \\mathbf{0}$ but $(A - \\lambda I)\\mathbf{v} \\neq \\mathbf{0}$. What is $\\mathbf{v}$?',
      options: ['A true eigenvector for $\\lambda$', 'A generalized eigenvector at depth 2', 'A vector in the null space of $A$', 'An eigenvector for a different eigenvalue'],
      answer: 'A generalized eigenvector at depth 2',
      hints: ['True eigenvectors satisfy (A-λI)v = 0. Generalized eigenvectors satisfy (A-λI)^k v = 0 for k > 1 but not k-1. Here k=2.'],
      reviewSection: 'Intuition — Generalized eigenvectors',
    },
    {
      id: 'q-la3-004-4',
      type: 'choice',
      text: 'Why is Jordan form numerically unreliable?',
      options: [
        'It requires complex arithmetic',
        'Small perturbations to a defective matrix can split repeated eigenvalues far apart',
        'It only works for square matrices',
        'It requires knowing eigenvalues exactly before computing',
      ],
      answer: 'Small perturbations to a defective matrix can split repeated eigenvalues far apart',
      hints: ['A defective matrix is on the boundary between distinct and repeated eigenvalues. A tiny ε perturbation can split λ (mult 2) into two eigenvalues differing by ~√ε — making the computed form wildly sensitive.'],
      reviewSection: 'Intuition — Warning: Jordan Form Is Numerically Unstable',
    },
  ],
};
