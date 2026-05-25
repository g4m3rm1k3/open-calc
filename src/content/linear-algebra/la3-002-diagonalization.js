export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la3-002',
  slug: 'diagonalization',
  chapter: 'la3',
  order: 2,
  title: 'Change of Basis and Diagonalization',
  subtitle: 'Rebuild your coordinate system around eigenvectors, and the most complicated matrix becomes trivial diagonal scaling.',
  tags: ['diagonalization', 'change of basis', 'PDP inverse', 'eigenbasis', 'matrix powers', 'diagonal matrix', 'similar matrices'],
  aliases: 'diagonalize change basis eigenbasis PDP matrix powers similar matrices spectral decomposition',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "How do you compute $A^{100}$ — a matrix raised to the 100th power — without doing a hundred separate matrix multiplications?",
    realWorldContext: "Matrix powers appear everywhere: predicting the long-term state of a Markov chain (like Google PageRank after many iterations), computing the spread of disease through a network after many time steps, simulating a vibrating structure over many cycles, and running a neural network forward pass. In each case, you need the same matrix applied repeatedly. Diagonalization converts this nightmare into a one-line formula — and it works because of eigenvectors.",
    previewVisualizationId: 'LALesson09_Diagonalization',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      'Take $A = \\begin{bmatrix}4&2\\\\1&3\\end{bmatrix}$ with eigenvectors $\\mathbf{v}_1 = [2,1]^\\top$ ($\\lambda_1=5$) and $\\mathbf{v}_2 = [1,-1]^\\top$ ($\\lambda_2=2$). Build $P = \\begin{bmatrix}2&1\\\\1&-1\\end{bmatrix}$ and $D = \\begin{bmatrix}5&0\\\\0&2\\end{bmatrix}$. Then $A^{100} = PD^{100}P^{-1}$ where $D^{100} = \\begin{bmatrix}5^{100}&0\\\\0&2^{100}\\end{bmatrix}$ — two scalar exponentiations and three matrix multiplications, regardless of the power. Without diagonalization: 99 matrix multiplications.',
      '**Where you are in the story:** You just found eigenvectors — the directions a matrix never rotates. You know the defining equation $A\\mathbf{v} = \\lambda\\mathbf{v}$. Now comes the payoff: what happens if you rebuild your entire coordinate system so its axes ARE the eigenvectors?',
      'In your regular coordinate system, a matrix looks messy — a grid of numbers with no obvious meaning. But in the eigenvector coordinate system, something beautiful happens: the matrix becomes **diagonal** — zeros everywhere except the main diagonal, where the eigenvalues sit. A diagonal matrix does the simplest possible thing: it just scales each axis independently.',
      'Here is the key idea: a change of basis is just a matrix multiplication. If $P$ is the matrix whose columns are the eigenvectors, then $P^{-1}$ transforms coordinates from the eigenvector basis back to the standard basis, and $P$ transforms the other way. The whole pipeline looks like:\n\n$A = P D P^{-1}$\n\nwhere $D$ is the diagonal matrix of eigenvalues.',
      '**Why this unlocks matrix powers.** Watch what happens when you square $A$:\n\n$A^2 = (PDP^{-1})(PDP^{-1}) = PD(P^{-1}P)DP^{-1} = PD^2P^{-1}$\n\nThe $P^{-1}P$ in the middle collapses to $I$. So $A^2 = PD^2P^{-1}$. By the same logic, $A^k = PD^kP^{-1}$ for any power $k$. And $D^k$ is trivial — you just raise each diagonal entry to the $k$th power. A matrix that would take hundreds of multiplications now takes three.',
      'Think of it this way: $P^{-1}$ rotates from standard coordinates into the eigenvector coordinate system. $D$ does the scaling — trivially — in that clean system. $P$ rotates back to standard coordinates. Three operations replace a hundred.',
      '**Predict before reading on.** You are given $A = \\begin{bmatrix}3&0\\\\0&-2\\end{bmatrix}$ (diagonal). What are $P$, $D$, and $P^{-1}$ in the diagonalization $A = PDP^{-1}$? What is $A^{50}$? Write your answers before continuing.',
      '**Where this is heading:** Not every matrix has enough eigenvectors to diagonalize — some are defective. And some matrices have complex eigenvalues, which produce rotation instead of scaling. The next lesson explores what happens when the characteristic equation has no real solutions.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** Eigenvectors and Eigenvalues — the invariant directions and their scaling factors.\n**This lesson:** Diagonalization — rebuilding coordinates around eigenvectors so the matrix becomes diagonal scaling.\n**Next:** Complex Eigenvalues — what happens when the matrix rotates and there are no real eigenvectors.',
      },
      {
        type: 'insight',
        title: 'The PDP⁻¹ Sandwich',
        body: 'A = PDP^{-1}\n\n$P$ = matrix of eigenvectors (columns)\n$D$ = diagonal matrix of eigenvalues\n\nPowers: $A^k = PD^kP^{-1}$, where $D^k$ just raises each diagonal entry to the $k$th power.',
      },
      {
        type: 'insight',
        title: 'What "Diagonal" Means Geometrically',
        body: 'A diagonal matrix does the purest, simplest possible transformation: it independently scales each coordinate axis. No mixing, no rotating, no shearing. Diagonalization asks: can we find a coordinate system where $A$ acts that simply?',
      },
      {
        type: 'warning',
        title: 'Not Every Matrix is Diagonalizable',
        body: 'Diagonalization requires $n$ linearly independent eigenvectors for an $n \\times n$ matrix. A **defective** matrix (one where geometric multiplicity < algebraic multiplicity for some eigenvalue) does not have enough eigenvectors and cannot be diagonalized over the reals.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson09_Diagonalization',
        title: 'Change of Basis: Standard vs. Eigenvector Coordinates',
        mathBridge: 'The visualization shows two grids side by side: the standard coordinate grid (left) and the eigenvector coordinate grid (right). Apply matrix $A$ in the left grid — watch the complex shear/stretch. Switch to the right grid — the same transformation is now pure axis-aligned scaling. Drag a vector in either grid and watch it transform. Notice: in eigenvector coordinates, only the lengths change, never the grid lines\' angles.',
        caption: 'Same transformation, two views. Eigenvector coordinates reveal the simple truth.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**Building $P$ and $D$.** Let $A$ be an $n \\times n$ matrix with $n$ linearly independent eigenvectors $\\mathbf{v}_1, \\ldots, \\mathbf{v}_n$ and corresponding eigenvalues $\\lambda_1, \\ldots, \\lambda_n$. Define:\n\n$P = \\begin{bmatrix}| & | & & | \\\\ \\mathbf{v}_1 & \\mathbf{v}_2 & \\cdots & \\mathbf{v}_n \\\\ | & | & & |\\end{bmatrix} \\qquad D = \\begin{bmatrix}\\lambda_1 & & \\\\ & \\ddots & \\\\ & & \\lambda_n\\end{bmatrix}$\n\nThen $A = PDP^{-1}$.',
      '**Why does this work?** Multiply both sides of $A\\mathbf{v}_i = \\lambda_i\\mathbf{v}_i$ for all $i$ at once by writing them as a matrix equation: $AP = PD$. Multiplying on the right by $P^{-1}$ gives $A = PDP^{-1}$.',
      '**Using diagonalization to compute $A^k$.** Since $A = PDP^{-1}$:\n\n$A^k = PD^kP^{-1} \\qquad \\text{where} \\qquad D^k = \\begin{bmatrix}\\lambda_1^k & & \\\\ & \\ddots & \\\\ & & \\lambda_n^k\\end{bmatrix}$\n\nThree matrix multiplications ($P$, $D^k$, $P^{-1}$) regardless of $k$.',
      '**The condition for diagonalizability.** A matrix is diagonalizable if and only if the sum of the geometric multiplicities of all eigenvalues equals $n$. Equivalently: the eigenvectors span all of $\\mathbb{R}^n$. Matrices with $n$ distinct eigenvalues are always diagonalizable (since distinct-eigenvalue eigenvectors are linearly independent).',
      '**Spectral decomposition.** Diagonalization can also be written as a sum of rank-1 "outer products": $A = \\sum_{i=1}^n \\lambda_i \\mathbf{v}_i\\mathbf{u}_i^T$, where $\\mathbf{u}_i$ are the rows of $P^{-1}$. Each term is a single eigenvector-eigenvalue pair contributing its piece to the full transformation. This is the spectral decomposition.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Diagonalization Theorem',
        body: 'A = PDP^{-1}\n\nwhere $P$ has eigenvectors as columns and $D$ has eigenvalues on the diagonal.\n\nRequires: $n$ linearly independent eigenvectors.',
      },
      {
        type: 'theorem',
        title: 'Matrix Powers via Diagonalization',
        body: 'A^k = PD^kP^{-1} \\qquad \\left(D^k\\right)_{ii} = \\lambda_i^k',
      },
      {
        type: 'insight',
        title: 'Column Order Must Match',
        body: 'The order of eigenvectors in $P$ and eigenvalues in $D$ must match. If $\\mathbf{v}_1$ is column 1 of $P$, then $\\lambda_1$ must be the $(1,1)$ entry of $D$. Mixing them up gives $AP = PD$ with the wrong pairing — and $A \\neq PDP^{-1}$.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Diagonalization and Matrix Powers',
        mathBridge: 'MATLAB: `[P, D] = eig(A)` gives eigenvectors P and diagonal D. Verify A = P*D*inv(P). Compute A^k = P * D.^k * inv(P) — just raise diagonal entries to the k-th power.',
        caption: 'Three cells: building P and D, computing A^k via diagonalization, and CNC vibration mode superposition.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Diagonalization: A = P D P⁻¹',
              prose: [
                '`[P, D] = eig(A)` returns eigenvectors as columns of P, eigenvalues on diagonal of D.',
                'Verify A = P * D * inv(P). The columns of P must be linearly independent for this to work.',
              ],
              code: `A = [4 1; 2 3];
[P, D] = eig(A);

P_inv = inv(P);
A_reconstructed = P * D * P_inv;

fprintf('Eigenvalues on diagonal of D:\\n'); disp(diag(D)')
fprintf('\\nEigenvectors (columns of P):\\n'); disp(P)

fprintf('A =\\n'); disp(A)
fprintf('P*D*inv(P) =\\n'); disp(A_reconstructed)
fprintf('Match: %d\\n', norm(A - A_reconstructed) < 1e-10)

% Sanity check: AP = PD
fprintf('\\nAP - PD (should be zero matrix):\\n')
disp(A*P - P*D)`,
            },
            {
              id: 2,
              cellTitle: 'Matrix powers via diagonalization — A^k in O(n²) instead of O(n³·k)',
              prose: [
                'A^k = P * D^k * inv(P). For diagonal D, D^k just raises each diagonal entry to the k-th power — no matrix multiplication needed for that step.',
                'Compare: directly computing A^100 requires 99 matrix multiplications. Via diagonalization: 3 multiplications regardless of k.',
              ],
              code: `A = [4 1; 2 3];
[P, D] = eig(A);
P_inv = inv(P);

% Method 1: direct power (expensive for large k)
A_direct = A^100;  % MATLAB does this efficiently, but conceptually 99 multiplications

% Method 2: diagonal power (O(n^2) for any k)
k = 100;
D_k = diag(diag(D).^k);   % raise each diagonal entry to k
A_k = P * D_k * P_inv;

fprintf('A^100 via direct power:\\n'); disp(A_direct)
fprintf('A^100 via diagonalization:\\n'); disp(A_k)
fprintf('Max difference: %.2e\\n', max(max(abs(A_direct - A_k))))`,
            },
            {
              id: 3,
              cellTitle: 'Application: CNC vibration — modal superposition',
              prose: [
                'A CNC machine\'s vibration is a sum of its natural modes (eigenvectors). Each mode oscillates at its natural frequency (sqrt of eigenvalue). The total vibration at any time is a superposition of all modes.',
                'Diagonalization separates these modes: in eigenvector coordinates, each mode is independent (decoupled). This is the foundation of modal analysis in structural dynamics.',
              ],
              code: `% 2-DOF CNC frame: mass-normalized stiffness matrix
A = [2 -1; -1 3] * 1e4;  % stiffness in N/m

[P, D] = eig(A);
lambda = diag(D);
omega = sqrt(lambda);    % natural frequencies (rad/s)
freq_Hz = omega / (2*pi);

fprintf('Mode 1: f = %.1f Hz, shape = [%.3f; %.3f]\\n', freq_Hz(1), P(1,1), P(2,1))
fprintf('Mode 2: f = %.1f Hz, shape = [%.3f; %.3f]\\n', freq_Hz(2), P(1,2), P(2,2))

% Time simulation: initial displacement x0 = [1; 0] mm
x0 = [1e-3; 0];   % 1mm displacement at node 1
q0 = P \\ x0;     % modal coordinates

t = linspace(0, 0.01, 200);  % 10 ms
x = zeros(2, length(t));
for i = 1:length(t)
    % Each mode oscillates at its frequency, decoupled
    modal_response = q0 .* cos(omega * t(i));
    x(:,i) = P * modal_response;  % back to physical coords
end

fprintf('\\nPeak displacement at node 1: %.4f mm\\n', max(abs(x(1,:)))*1e3)
fprintf('Peak displacement at node 2: %.4f mm\\n', max(abs(x(2,:)))*1e3)`,
            },
          ]
        }
      },
      {
        id: 'DiagonalizationStepperViz',
        title: 'Step-By-Step: Building P and D',
        mathBridge: 'Enter a 2×2 matrix. The stepper walks through: (1) finding eigenvalues from the characteristic equation, (2) finding eigenvectors for each eigenvalue, (3) assembling $P$ and $D$, (4) verifying $AP = PD$. At each step, the computation is shown in full. Change the matrix and repeat.',
        caption: 'Diagonalization made step-by-step explicit.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Diagonalization and Matrix Powers',
        mathBridge: 'A = P D P⁻¹. eig() gives P and D. A^k = P D^k P⁻¹ — raise diagonal entries to the k-th power, no repeated multiplication. Verify: P @ D @ P_inv ≈ A.',
        caption: 'Diagonalize a matrix, then use it to compute high matrix powers instantly.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Building P and D from eigenvalues',
              prose: [
                '`np.linalg.eig(A)` gives the eigenvector matrix P and eigenvalue array. Put eigenvalues on the diagonal of D.',
                'Verify: `P @ D @ P_inv ≈ A`. If it does not match, something went wrong.',
              ],
              code: `import numpy as np

A = np.array([[4., 1.],
              [2., 3.]])

evals, P = np.linalg.eig(A)

# D = diagonal matrix of eigenvalues
D = np.diag(evals)
P_inv = np.linalg.inv(P)

print("Eigenvalues:", evals)
print()
print("P (eigenvectors as columns):")
print(P.round(4))
print()
print("Reconstructed A = P @ D @ P_inv:")
print((P @ D @ P_inv).real.round(6))
print()
print("Matches original A?", np.allclose((P @ D @ P_inv).real, A))`,
            },
            {
              id: 2,
              cellTitle: 'Matrix powers via diagonalization',
              prose: [
                'A^k = P D^k P⁻¹. Raising D to the k-th power just raises each diagonal entry (eigenvalue) to the k-th power.',
                'This makes computing A^100 as easy as A^2 — no repeated matrix multiplication.',
              ],
              code: `import numpy as np

A = np.array([[3., 1.],
              [0., 2.]])

evals, P = np.linalg.eig(A)
P_inv = np.linalg.inv(P)

def matrix_power_diag(A, P, evals, P_inv, k):
    Dk = np.diag(evals ** k)
    return (P @ Dk @ P_inv).real.round(6)

# Verify with numpy's built-in matrix power
k = 5
A_power_diag = matrix_power_diag(A, P, evals, P_inv, k)
A_power_numpy = np.linalg.matrix_power(A, k).astype(float)

print(f"A^{k} via diagonalization:")
print(A_power_diag)
print()
print(f"A^{k} via numpy:")
print(A_power_numpy)
print()
print("Match:", np.allclose(A_power_diag, A_power_numpy))`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Diagonalize and compute A^10',
              difficulty: 'hard',
              prompt: 'Diagonalize A = [[2, 1],[1, 2]]. Then compute A^10 using P D^10 P⁻¹. Verify against np.linalg.matrix_power(A, 10). Finally, print the eigenvalues — what symmetry do you notice about a symmetric matrix\'s eigenvalues?',
              code: `import numpy as np

A = np.array([[2., 1.],
              [1., 2.]])

# 1. compute evals and P via np.linalg.eig(A)
# 2. compute A^10 using P @ diag(evals**10) @ P_inv
# 3. verify against np.linalg.matrix_power(A, 10)
# 4. comment on the eigenvalues (are they real? symmetric?)
`,
              hint: 'evals, P = np.linalg.eig(A). Dk = np.diag(evals**10). A10 = (P @ Dk @ np.linalg.inv(P)).real. Symmetric matrices always have real eigenvalues.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Proof of $A = PDP^{-1}$:** Let $\\mathbf{v}_1, \\ldots, \\mathbf{v}_n$ be linearly independent eigenvectors with eigenvalues $\\lambda_1, \\ldots, \\lambda_n$. Then:\n\n$AP = A[\\mathbf{v}_1 \\cdots \\mathbf{v}_n] = [A\\mathbf{v}_1 \\cdots A\\mathbf{v}_n] = [\\lambda_1\\mathbf{v}_1 \\cdots \\lambda_n\\mathbf{v}_n] = [\\mathbf{v}_1 \\cdots \\mathbf{v}_n]D = PD$\n\nSince the columns of $P$ are linearly independent, $P$ is invertible. Multiplying on the right by $P^{-1}$: $A = PDP^{-1}$.',
      '**Similar matrices.** Two matrices $A$ and $B$ are called **similar** if there exists an invertible matrix $P$ such that $B = P^{-1}AP$. Diagonalization says: a diagonalizable matrix is similar to a diagonal matrix. Similar matrices represent the same linear transformation in different coordinate bases.',
      '**Similar matrices share:** eigenvalues (same characteristic polynomial), trace, determinant, rank, and nullity. They differ in their specific matrix entries — only the coordinate representation changes.',
      '**The defective (non-diagonalizable) case.** When a matrix cannot be diagonalized, we can still find a "nearly diagonal" form called the **Jordan Normal Form**, which has eigenvalues on the diagonal and possibly 1s on the superdiagonal. Jordan form is the generalization of diagonalization and is the subject of more advanced linear algebra courses.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Diagonalizability Criterion',
        body: 'An $n \\times n$ matrix $A$ is diagonalizable **if and only if** the sum of the geometric multiplicities of all distinct eigenvalues equals $n$.\n\n**Equivalent conditions:**\n- $A$ has $n$ linearly independent eigenvectors\n- The eigenvectors span $\\mathbb{R}^n$\n- For each eigenvalue: geo. multiplicity = alg. multiplicity\n\n**Sufficient (but not necessary):** $A$ has $n$ **distinct** eigenvalues.',
      },
      {
        type: 'proof',
        title: 'Proof that AP = PD Implies A = PDP⁻¹',
        body: 'Let $\\mathbf{v}_1,\\ldots,\\mathbf{v}_n$ be linearly independent eigenvectors with eigenvalues $\\lambda_1,\\ldots,\\lambda_n$.\n\n**Step 1.** Write all $n$ eigenvalue equations at once as a matrix product:\n$A[\\mathbf{v}_1 \\cdots \\mathbf{v}_n] = [A\\mathbf{v}_1 \\cdots A\\mathbf{v}_n] = [\\lambda_1\\mathbf{v}_1 \\cdots \\lambda_n\\mathbf{v}_n]$\n\n**Step 2.** The right side factors as $PD$ (eigenvectors times their scaling factors):\n$AP = PD$\n\n**Step 3.** Since the columns of $P$ are linearly independent, $P$ is invertible. Right-multiply both sides by $P^{-1}$:\n$A = PDP^{-1}$ $\\blacksquare$',
      },
      {
        type: 'definition',
        title: 'Similar Matrices',
        body: '$A$ and $B$ are similar if $B = P^{-1}AP$ for some invertible $P$.\n\nSimilar matrices represent the same transformation in different coordinate systems.\n\n**Invariants under similarity:** eigenvalues, characteristic polynomial, trace ($= \\sum \\lambda_i$), determinant ($= \\prod \\lambda_i$), rank, and nullity. Only the coordinate representation changes.',
      },
      {
        type: 'insight',
        title: 'Jordan Normal Form — When Diagonalization Fails',
        body: 'When $A$ is defective (geometric multiplicity < algebraic multiplicity for some eigenvalue), there are not enough eigenvectors to fill $P$. The closest available form is **Jordan Normal Form**:\n\n$A = PJP^{-1}$ where $J = \\begin{bmatrix}\\lambda_1 & \\epsilon & 0 \\\\ 0 & \\lambda_1 & 0 \\\\ 0 & 0 & \\lambda_2\\end{bmatrix}$\n\nThe 1s above the diagonal (in Jordan blocks) encode the "missing" eigenvectors as **generalized eigenvectors**. Diagonalization is the special case where all Jordan blocks are $1 \\times 1$.',
      },
      {
        type: 'insight',
        title: 'Spectral Theorem: Symmetric Matrices Always Diagonalize',
        body: 'Every real symmetric matrix $A = A^T$ is **orthogonally diagonalizable**: $A = QDQ^T$ where $Q$ is orthogonal ($Q^T = Q^{-1}$) and $D$ is real and diagonal.\n\nThis means:\n- All eigenvalues are real\n- Eigenvectors from distinct eigenvalues are orthogonal\n- $P$ can always be chosen to be a rotation (no shear)\n\nSymmetric matrices appear constantly: covariance matrices, Hessians, graph Laplacians, FEM stiffness matrices — all are guaranteed to diagonalize cleanly.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la3-002-ex1',
      title: 'Constructing P and D, then Verifying A = PDP⁻¹',
      problem: 'Diagonalize $A = \\begin{bmatrix}4 & 2 \\\\ 1 & 3\\end{bmatrix}$ using the eigenvectors from the previous lesson ($\\lambda_1 = 5, \\mathbf{v}_1=[2,1]^T$; $\\lambda_2=2, \\mathbf{v}_2=[1,-1]^T$).',
      steps: [
        {
          expression: 'P = \\begin{bmatrix}2 & 1 \\\\ 1 & -1\\end{bmatrix}, \\quad D = \\begin{bmatrix}5 & 0 \\\\ 0 & 2\\end{bmatrix}',
          annotation: 'Assemble $P$ (eigenvectors as columns) and $D$ (eigenvalues on the diagonal). Column order must match: $\\mathbf{v}_1$ in column 1, so $\\lambda_1$ in position $(1,1)$.',
          strategyTitle: 'Assemble P and D',
          checkpoint: 'Does the order of columns in P matter?',
          hints: ['Yes — column $i$ of $P$ must match entry $(i,i)$ of $D$. Otherwise $AP \\neq PD$.'],
        },
        {
          expression: 'P^{-1} = \\frac{1}{\\det(P)}\\begin{bmatrix}-1&-1\\\\-1&2\\end{bmatrix} = \\frac{1}{-3}\\begin{bmatrix}-1&-1\\\\-1&2\\end{bmatrix} = \\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix}',
          annotation: '$\\det(P) = (2)(-1)-(1)(1) = -3$. Use the 2×2 inverse formula.',
          strategyTitle: 'Compute P⁻¹',
          checkpoint: 'Verify: $PP^{-1} = I$.',
          hints: ['Check: $\\begin{bmatrix}2&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix} = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$ ✓'],
        },
        {
          expression: 'PDP^{-1} = \\begin{bmatrix}2&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}5&0\\\\0&2\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix}',
          annotation: 'Compute $PD$ first (multiply $P$ by $D$), then multiply by $P^{-1}$.',
          strategyTitle: 'Compute PDP⁻¹',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'PD = \\begin{bmatrix}10&2\\\\5&-2\\end{bmatrix} \\qquad (PD)P^{-1} = \\begin{bmatrix}10&2\\\\5&-2\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix} = \\begin{bmatrix}4&2\\\\1&3\\end{bmatrix} = A \\; ✓',
          annotation: '$PDP^{-1} = A$. The decomposition is verified.',
          strategyTitle: 'Verify equality',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The diagonalization $A = PDP^{-1}$ is verified. The matrix $A$ in eigenvector coordinates is just the diagonal scaling $D = \\text{diag}(5, 2)$.',
    },
    {
      id: 'la3-002-ex2',
      title: 'Computing A³ using Diagonalization',
      problem: 'Using the diagonalization from Example 1, compute $A^3$ efficiently.',
      steps: [
        {
          expression: 'A^3 = PD^3P^{-1}',
          annotation: 'Apply the matrix powers formula. Only $D$ changes — it becomes $D^3$.',
          strategyTitle: 'Apply powers formula',
          checkpoint: 'How many matrix multiplications is this vs. computing $A \\cdot A \\cdot A$ directly?',
          hints: ['Direct: 2 full 2×2 multiplications. Via diagonalization: also 2 multiplications — but $D^3$ is trivial (just raise diagonal entries to the 3rd power).'],
        },
        {
          expression: 'D^3 = \\begin{bmatrix}5^3 & 0 \\\\ 0 & 2^3\\end{bmatrix} = \\begin{bmatrix}125 & 0 \\\\ 0 & 8\\end{bmatrix}',
          annotation: 'For diagonal matrices, just raise each entry to the power. Instant.',
          strategyTitle: 'Compute D³',
          checkpoint: 'What would D¹⁰⁰ be?',
          hints: ['$D^{100} = \\text{diag}(5^{100}, 2^{100})$. One lookup per eigenvalue.'],
        },
        {
          expression: 'A^3 = \\begin{bmatrix}2&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}125&0\\\\0&8\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix}',
          annotation: 'Substitute back.',
          strategyTitle: 'Assemble A³',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'PD^3 = \\begin{bmatrix}250&8\\\\125&-8\\end{bmatrix} \\qquad A^3 = \\begin{bmatrix}250&8\\\\125&-8\\end{bmatrix}\\begin{bmatrix}1/3&1/3\\\\1/3&-2/3\\end{bmatrix} = \\begin{bmatrix}86&78\\\\39&47\\end{bmatrix}',
          annotation: 'Final answer. You can verify by computing $A \\cdot A \\cdot A$ directly.',
          strategyTitle: 'Final result',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: '$A^3 = \\begin{bmatrix}86&78\\\\39&47\\end{bmatrix}$. For $A^{100}$, the approach is identical — only the diagonal entries $5^{100}$ and $2^{100}$ change. Diagonalization makes arbitrary powers trivial.',
    },
    {
      id: 'la3-002-ex3',
      title: 'Determining Whether a Matrix is Diagonalizable',
      problem: 'For each matrix, determine whether it is diagonalizable: (a) $A = \\begin{bmatrix}5&1\\\\0&5\\end{bmatrix}$, (b) $B = \\begin{bmatrix}5&0\\\\0&5\\end{bmatrix}$.',
      steps: [
        {
          expression: 'p_A(\\lambda) = (5-\\lambda)^2 = 0 \\implies \\lambda = 5 \\text{ with algebraic multiplicity 2}',
          annotation: 'Both matrices are upper triangular with identical diagonal entries. The characteristic polynomial is $(5-\\lambda)^2$ for both.',
          strategyTitle: 'Find eigenvalues of both matrices',
          checkpoint: 'Both have the same eigenvalues. Do they have the same eigenvectors?',
          hints: ['Not necessarily. Algebraic multiplicity only tells you about the characteristic polynomial. The number of independent eigenvectors (geometric multiplicity) requires solving $(A - 5I)\\mathbf{v} = \\mathbf{0}$.'],
        },
        {
          expression: '(A - 5I)\\mathbf{v} = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\implies v_2 = 0, \\; v_1 \\text{ free} \\implies \\text{eigenspace} = \\text{span}\\{[1,0]^\\top\\}',
          annotation: 'For $A$: the eigenspace is 1-dimensional. Geometric multiplicity $= 1 <$ algebraic multiplicity $= 2$.',
          strategyTitle: 'Check eigenspace dimension for A',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '(B - 5I)\\mathbf{v} = \\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\implies v_1, v_2 \\text{ both free} \\implies \\text{eigenspace} = \\mathbb{R}^2',
          annotation: 'For $B$: the eigenspace is all of $\\mathbb{R}^2$ — 2-dimensional. Geometric multiplicity $= 2 = $ algebraic multiplicity.',
          strategyTitle: 'Check eigenspace dimension for B',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'A \\text{ is DEFECTIVE (not diagonalizable)}; \\quad B = 5I \\text{ is ALREADY DIAGONAL (diagonalizable)}',
          annotation: '$A$ lacks enough eigenvectors — only one independent eigenvector for a 2×2 matrix. $B = 5I$ is already diagonal: every nonzero vector is an eigenvector.',
          strategyTitle: 'Conclude',
          checkpoint: 'What is the diagonalization of B?',
          hints: ['$B = 5I = I \\cdot 5I \\cdot I^{-1} = P D P^{-1}$ with $P = I$ and $D = 5I$. The identity matrix itself is P.'],
        },
      ],
      conclusion: 'Two matrices can have identical eigenvalues but different diagonalizability. The shear matrix $A$ is defective; the scalar multiple of identity $B = 5I$ is trivially diagonal. Always check geometric multiplicity, not just eigenvalues.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la3-002-ch1',
      difficulty: 'easy',
      problem: 'If $D = \\begin{bmatrix}3 & 0 \\\\ 0 & -2\\end{bmatrix}$, what is $D^4$?',
      hint: 'Raise each diagonal entry to the 4th power independently.',
      walkthrough: [
        {
          expression: 'D^4 = \\begin{bmatrix}3^4 & 0 \\\\ 0 & (-2)^4\\end{bmatrix} = \\begin{bmatrix}81 & 0 \\\\ 0 & 16\\end{bmatrix}',
          annotation: '$3^4 = 81$, $(-2)^4 = 16$. Note: even power of a negative is positive.',
        },
      ],
      answer: '[[81, 0], [0, 16]]',
    },
    {
      id: 'la3-002-ch2',
      difficulty: 'medium',
      problem: 'The matrix $A = \\begin{bmatrix}2 & 1 \\\\ 1 & 2\\end{bmatrix}$ has eigenvalues $\\lambda_1=3$ (eigenvector $[1,1]^T$) and $\\lambda_2=1$ (eigenvector $[1,-1]^T$). Write the diagonalization $A = PDP^{-1}$ explicitly.',
      hint: 'Put the eigenvectors as columns of $P$. The inverse of a 2×2 is $\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
      walkthrough: [
        {
          expression: 'P = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}, \\quad D = \\begin{bmatrix}3&0\\\\0&1\\end{bmatrix}',
          annotation: 'Eigenvectors as columns, eigenvalues on diagonal (matching order).',
        },
        {
          expression: '\\det(P) = (1)(-1)-(1)(1) = -2 \\qquad P^{-1} = \\frac{1}{-2}\\begin{bmatrix}-1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}',
          annotation: 'Invert $P$.',
        },
        {
          expression: 'A = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}3&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}',
          annotation: 'The complete factorization.',
        },
      ],
      answer: 'P = [[1,1],[1,-1]], D = [[3,0],[0,1]], P⁻¹ = [[1/2,1/2],[1/2,-1/2]]',
    },
    {
      id: 'la3-002-ch3',
      difficulty: 'hard',
      problem: 'Using the diagonalization from Challenge 2 ($A = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$, $\\lambda_1=3$, $\\lambda_2=1$), find $A^n$ as a general formula in terms of $n$. What happens to $A^n$ as $n \\to \\infty$ when we consider the normalized version?',
      hint: '$A^n = PD^nP^{-1}$. Compute and simplify. Think about which eigenvalue dominates as $n$ grows.',
      walkthrough: [
        {
          expression: 'A^n = PD^nP^{-1} = \\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}3^n&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1/2&1/2\\\\1/2&-1/2\\end{bmatrix}',
          annotation: 'Apply the formula.',
        },
        {
          expression: 'A^n = \\frac{1}{2}\\begin{bmatrix}3^n+1 & 3^n-1 \\\\ 3^n-1 & 3^n+1\\end{bmatrix}',
          annotation: 'Multiply through and simplify.',
        },
        {
          expression: '\\text{As } n \\to \\infty: A^n \\approx \\frac{3^n}{2}\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}',
          annotation: 'The $1^n = 1$ terms become negligible. The dominant eigenvector $[1,1]^T$ captures the long-run behavior.',
        },
      ],
      answer: 'A^n = (1/2)[[3^n+1, 3^n-1],[3^n-1, 3^n+1]]. Long-run: dominated by the largest eigenvalue (3).',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A = PDP^{-1}', meaning: 'Diagonalization: P has eigenvectors as columns, D has eigenvalues on diagonal' },
      { symbol: 'A^k = PD^kP^{-1}', meaning: 'Matrix powers via diagonalization — D^k just raises each diagonal entry to the k-th power' },
      { symbol: 'D', meaning: 'Diagonal matrix — only diagonal entries non-zero; scales each axis independently' },
      { symbol: 'B = P^{-1}AP', meaning: 'Similar matrix — same transformation, different coordinate system' },
    ],
    rulesOfThumb: [
      'n distinct eigenvalues → always diagonalizable (guaranteed).',
      'Column order in P must match eigenvalue order in D.',
      'Matrix powers: A^k = PD^kP^{-1}, with D^k trivial.',
      'Symmetric matrices are always diagonalizable with orthogonal eigenvectors.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la3-001',
        label: 'Eigenvectors and Eigenvalues',
        note: 'You need eigenvectors and eigenvalues already computed before diagonalizing. If you are not sure how to find them, that lesson walks through the full algorithm.',
      },
      {
        lessonId: 'la2-001',
        label: 'Matrices as Linear Transformations',
        note: 'Diagonalization is about choosing a coordinate system where the transformation looks its simplest. This is the same idea as change-of-basis from Phase 2.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la3-003',
        label: 'Complex Eigenvalues',
        note: 'When the characteristic polynomial has no real roots, diagonalization over the reals fails. Instead, we get complex eigenvalues that encode rotation — which the next lesson addresses.',
      },
      {
        lessonId: 'la4-004',
        label: 'Singular Value Decomposition',
        note: 'SVD generalizes diagonalization to non-square matrices: $A = U\\Sigma V^T$, where $U$ and $V$ are orthogonal and $\\Sigma$ is diagonal. It always works — even when $A$ is not diagonalizable.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Diagonalization = finding the coordinates where A does nothing but scale.',
    'A = PDP⁻¹: change coords (P⁻¹), scale (D), change back (P).',
    'A^k = PD^kP⁻¹ — powers become trivial.',
    'Diagonal matrix: eigenvalues on diagonal, zeros everywhere else.',
    'Fails when there are not enough independent eigenvectors (defective matrix).',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la3-002-1', label: 'Read: understand why eigenvector coordinates make A diagonal', type: 'read' },
    { id: 'cp-la3-002-2', label: 'Read: follow the derivation A = PDP⁻¹ and the matrix powers formula A^k = PD^kP⁻¹', type: 'read' },
    { id: 'cp-la3-002-3', label: 'Read: understand the diagonalizability criterion and when defective matrices fail', type: 'read' },
    { id: 'cp-la3-002-4', label: 'Run OpenMAT cell 1 — build P and D, verify A = P*D*inv(P)', type: 'lab' },
    { id: 'cp-la3-002-5', label: 'Run Python cell 2 — compute A^k via diagonalization and verify against numpy', type: 'lab' },
    { id: 'cp-la3-002-6', label: 'Complete example 1: construct P and D, compute P⁻¹, verify A = PDP⁻¹', type: 'example' },
    { id: 'cp-la3-002-7', label: 'Complete example 2: compute A³ using PD³P⁻¹', type: 'example' },
    { id: 'cp-la3-002-8', label: 'Attempt challenge 3: derive A^n as a closed-form formula and analyze long-run behavior', type: 'challenge' },
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la3-002-assess-1',
        type: 'input',
        text: 'If the diagonal matrix $D = \\text{diag}(2, 5)$, what is the $(2,2)$ entry of $D^{10}$?',
        answer: '9765625',
        hint: '$5^{10} = 9{,}765{,}625$.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'diagonalization-q1',
      type: 'choice',
      text: 'What goes in the columns of $P$ in the decomposition $A = PDP^{-1}$?',
      options: [
        'The eigenvalues of $A$',
        'The eigenvectors of $A$',
        'The rows of $A$',
        'The diagonal entries of $A$',
      ],
      answer: 'The eigenvectors of $A$',
      hints: ['$P$ is the change-of-basis matrix to the eigenvector coordinate system. Its columns are the basis vectors — the eigenvectors.'],
      reviewSection: 'Math tab — Building P and D',
    },
    {
      id: 'diagonalization-q2',
      type: 'choice',
      text: 'Why does $A^k = PD^kP^{-1}$ simplify computation?',
      options: [
        'Because $P^k = P$ for any power $k$',
        'Because $D$ is diagonal, so $D^k$ just raises each diagonal entry to the $k$th power',
        'Because matrix multiplication is commutative',
        'Because $P^{-1} = P$ for eigenvector matrices',
      ],
      answer: 'Because $D$ is diagonal, so $D^k$ just raises each diagonal entry to the $k$th power',
      hints: ['A diagonal matrix is trivial to raise to a power — no matrix multiplications needed, just scalar exponentiation.'],
      reviewSection: 'Math tab — Matrix Powers',
    },
    {
      id: 'diagonalization-q3',
      type: 'choice',
      text: 'A $3 \\times 3$ matrix has eigenvalues $\\lambda = 2$ (with algebraic multiplicity 2 but geometric multiplicity 1) and $\\lambda = 5$ (with multiplicity 1). Is it diagonalizable?',
      options: [
        'Yes — it has three eigenvalues (counting multiplicity)',
        'No — it only has 2 linearly independent eigenvectors, not 3',
        'Yes — any matrix with distinct eigenvalues is diagonalizable',
        'Cannot be determined without the matrix',
      ],
      answer: 'No — it only has 2 linearly independent eigenvectors, not 3',
      hints: ['Diagonalization requires 3 independent eigenvectors for a 3×3 matrix. Geometric multiplicity 1 for the repeated eigenvalue means only 1 eigenvector there — total: 2, not 3.'],
      reviewSection: 'Intuition tab — Not Every Matrix is Diagonalizable',
    },
    {
      id: 'diagonalization-q4',
      type: 'choice',
      text: 'A matrix $A$ has eigenvalues 3 and 7. What is the $(1,1)$ entry of $D^2$ if $3$ is the first diagonal entry?',
      options: ['$6$', '$9$', '$49$', '$21$'],
      answer: '$9$',
      hints: ['$D^2$ raises each diagonal entry to the 2nd power: $3^2 = 9$ in position $(1,1)$ and $7^2 = 49$ in position $(2,2)$.'],
      reviewSection: 'Math tab — Matrix Powers',
    },
    {
      id: 'diagonalization-q5',
      type: 'choice',
      text: 'If $A = PDP^{-1}$ and you swap the order of columns in $P$ (putting eigenvector 2 first), what must you change in $D$?',
      options: [
        'Nothing — $D$ stays the same.',
        'Swap the eigenvalues in $D$ to match the new column order.',
        'Take the transpose of $D$.',
        'Replace $D$ with $D^{-1}$.',
      ],
      answer: 'Swap the eigenvalues in $D$ to match the new column order.',
      hints: ['Column $i$ of $P$ and entry $(i,i)$ of $D$ must be a matching pair. If you reorder columns in $P$, you must reorder the diagonal in $D$ the same way — otherwise $AP \\neq PD$.'],
      reviewSection: 'Math tab — Column Order callout',
    },
    {
      id: 'diagonalization-q6',
      type: 'choice',
      text: 'A $4 \\times 4$ matrix has eigenvalues $1, 2, 3, 4$ (all distinct). Is it diagonalizable?',
      options: [
        'Only if all eigenvalues are positive.',
        'Only if it is symmetric.',
        'Yes — $n$ distinct eigenvalues always guarantee $n$ independent eigenvectors.',
        'Cannot determine without computing eigenvectors.',
      ],
      answer: 'Yes — $n$ distinct eigenvalues always guarantee $n$ independent eigenvectors.',
      hints: ['Eigenvectors from distinct eigenvalues are always linearly independent (proved in la3-001). So $n$ distinct eigenvalues → $n$ independent eigenvectors → diagonalizable.'],
      reviewSection: 'Rigor tab — Diagonalizability Criterion',
    },
    {
      id: 'diagonalization-q7',
      type: 'choice',
      text: 'What does it mean for two matrices to be "similar"?',
      options: [
        'They have the same entries.',
        'They have the same rank.',
        '$B = P^{-1}AP$ for some invertible $P$ — they represent the same transformation in different coordinate systems.',
        'They have the same dimensions.',
      ],
      answer: '$B = P^{-1}AP$ for some invertible $P$ — they represent the same transformation in different coordinate systems.',
      hints: ['Similar matrices represent the same linear map in different bases. They share eigenvalues, trace, determinant, rank — all invariants of the transformation, not of the coordinate system.'],
      reviewSection: 'Rigor tab — Similar Matrices',
    },
    {
      id: 'diagonalization-q8',
      type: 'choice',
      text: 'A long-run population model has $\\mathbf{x}_{n+1} = A\\mathbf{x}_n$. Eigenvalues of $A$ are $\\lambda_1 = 1.2$ and $\\lambda_2 = 0.8$. What happens to the population as $n \\to \\infty$?',
      options: [
        'The population grows, dominated by the $\\lambda_1 = 1.2$ eigenvector direction.',
        'The population shrinks to zero, dominated by $\\lambda_2 = 0.8$.',
        'The population oscillates between the two eigenvector directions.',
        'The population converges to a fixed point along the $\\lambda_2$ direction.',
      ],
      answer: 'The population grows, dominated by the $\\lambda_1 = 1.2$ eigenvector direction.',
      hints: ['$A^n\\mathbf{x}_0 = PD^nP^{-1}\\mathbf{x}_0$. As $n \\to \\infty$: $1.2^n \\to \\infty$ while $0.8^n \\to 0$. The $\\lambda_1$ term dominates. $\\mathbf{x}_n \\approx c_1 \\cdot 1.2^n \\cdot \\mathbf{v}_1$ for large $n$ — exponential growth along $\\mathbf{v}_1$.'],
      reviewSection: 'Challenges — Challenge 3 (long-run behavior)',
    },
    {
      id: 'diagonalization-q9',
      type: 'choice',
      text: 'The Spectral Theorem says every real symmetric matrix $A = A^\\top$ is orthogonally diagonalizable: $A = QDQ^\\top$. What is special about $Q$ compared to a general $P$?',
      options: [
        '$Q$ is diagonal.',
        '$Q$ is invertible (same as any $P$).',
        '$Q$ is orthogonal: $Q^\\top = Q^{-1}$, so inverting it is free.',
        '$Q$ is the identity matrix.',
      ],
      answer: '$Q$ is orthogonal: $Q^\\top = Q^{-1}$, so inverting it is free.',
      hints: ['For symmetric matrices, eigenvectors from distinct eigenvalues are orthogonal. If we normalize them, we get an orthonormal basis — the columns of $Q$. An orthogonal matrix satisfies $Q^{-1} = Q^\\top$: transposing is free, inversion is free.'],
      reviewSection: 'Rigor tab — Spectral Theorem',
    },
    {
      id: 'diagonalization-q10',
      type: 'choice',
      text: 'You want to solve the recurrence $a_{n+1} = 5a_n - 6b_n$, $b_{n+1} = a_n$ with $a_0 = 1$, $b_0 = 0$. After writing this as $\\mathbf{x}_{n+1} = A\\mathbf{x}_n$, you diagonalize $A$ and find eigenvalues 2 and 3. What is the long-run growth rate?',
      options: [
        'Linear growth (rate 5)',
        'Exponential growth like $3^n$',
        'Exponential growth like $2^n$',
        'Convergence to zero',
      ],
      answer: 'Exponential growth like $3^n$',
      hints: ['$a_n = c_1 \\cdot 2^n + c_2 \\cdot 3^n$. For large $n$, the $3^n$ term dominates (since $3 > 2$). The largest eigenvalue always controls long-run growth.'],
      reviewSection: 'Math tab — Matrix Powers',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Every matrix can be diagonalized if you just find all the eigenvalues.',
      whyStudentsThinkIt: 'The characteristic polynomial always has $n$ roots (in $\\mathbb{C}$). Students think $n$ roots = $n$ eigenvalues = $n$ eigenvectors = diagonalizable.',
      correctionExample: 'The shear matrix $A = \\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$ has characteristic polynomial $(1-\\lambda)^2 = 0$, so $\\lambda = 1$ with algebraic multiplicity 2. But $(A-I) = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}$ has only a 1D null space — geometric multiplicity 1. Only one independent eigenvector, not two. Not diagonalizable.',
      contrastCase: '$B = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} = I$ also has $\\lambda = 1$ with algebraic multiplicity 2, but geometric multiplicity 2 (every vector is an eigenvector). Diagonalizable (already diagonal).',
    },
    {
      falseBelief: 'In $A = PDP^{-1}$, the matrix $P$ must be the identity matrix or an orthogonal matrix.',
      whyStudentsThinkIt: 'Students confuse the general diagonalization $A = PDP^{-1}$ (any basis of eigenvectors) with the orthogonal diagonalization $A = QDQ^\\top$ guaranteed only for symmetric matrices.',
      correctionExample: 'For $A = \\begin{bmatrix}4&2\\\\1&3\\end{bmatrix}$, the eigenvectors $[2,1]^\\top$ and $[1,-1]^\\top$ are not orthogonal (dot product $= 2-1 = 1 \\neq 0$). The diagonalization works perfectly with this non-orthogonal $P$.',
      contrastCase: 'For symmetric $A = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$, eigenvectors $[1,1]^\\top$ and $[1,-1]^\\top$ are orthogonal. Normalized, they form an orthogonal $Q$. The Spectral Theorem guarantees this only for symmetric matrices.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A wildlife biologist models a two-stage population (juveniles and adults). Each year, 30% of juveniles survive to become adults, and 80% of adults survive while each adult produces 2 new juveniles. The population vector after $n$ years is $A^n\\mathbf{x}_0$.',
      competingTechniques: 'Simulate year by year (accurate but slow for large $n$), use a closed-form solution (requires diagonalization), or use population ecology software.',
      whyThisTechniqueWins: 'Diagonalization gives the exact closed-form: $\\mathbf{x}_n = PD^nP^{-1}\\mathbf{x}_0$. From this, the long-run growth rate is the dominant eigenvalue ($\\lambda_1$), and the stable age distribution is the corresponding eigenvector. One eigenanalysis answers all future-state questions.',
    },
    {
      situation: 'A data scientist has a covariance matrix $\\Sigma$ from a 100-dimensional dataset. They need to find the directions of maximum variance (for PCA) and the Mahalanobis distance metric.',
      competingTechniques: 'Iterative power method for top eigenvectors, full eigendecomposition, or SVD of the data matrix.',
      whyThisTechniqueWins: 'Since $\\Sigma$ is symmetric positive semidefinite, the Spectral Theorem guarantees orthogonal diagonalization: $\\Sigma = QDQ^\\top$ with real non-negative eigenvalues. The PCA directions are columns of $Q$ (principal components), and $\\Sigma^{-1} = QD^{-1}Q^\\top$ computes the inverse efficiently. Diagonalization makes both PCA and Mahalanobis distance trivial.',
    },
  ],

  debugging: [
    {
      commonError: 'Placing eigenvalues in $D$ in a different order from the eigenvectors in $P$, then getting $AP \\neq PD$.',
      symptom: 'Verification $PDP^{-1}$ does not reconstruct $A$. The reconstruction is wrong even though the eigenvalues and eigenvectors are individually correct.',
      whyItHappened: 'Column $i$ of $P$ and position $(i,i)$ of $D$ must be a matching pair: the $i$th eigenvector and its corresponding eigenvalue. If you put eigenvector 1 in column 2 of $P$ but keep eigenvalue 1 in position $(1,1)$ of $D$, the pairing is broken.',
      repairStrategy: 'Always construct $P$ and $D$ together: for each eigenpair $(\\lambda_i, \\mathbf{v}_i)$, place $\\mathbf{v}_i$ in column $i$ of $P$ and $\\lambda_i$ in entry $(i,i)$ of $D$ simultaneously. Verify: compute $AP - PD$ and check it is the zero matrix.',
    },
    {
      commonError: 'Using $A^k = P^kD^k(P^{-1})^k$ instead of $A^k = PD^kP^{-1}$.',
      symptom: 'The computed $A^k$ is completely wrong. The error grows with $k$.',
      whyItHappened: 'Students misapply power rules from scalars: $(abc)^k = a^k b^k c^k$. But for matrices, powers do not distribute like this unless the matrices commute. The correct derivation: $A^2 = (PDP^{-1})(PDP^{-1}) = PD(P^{-1}P)DP^{-1} = PD^2P^{-1}$.',
      repairStrategy: 'Remember: only the middle factor $D$ gets raised to the power. $P$ and $P^{-1}$ appear exactly once each, regardless of $k$: $A^k = P D^k P^{-1}$.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given a diagonalizable matrix with its eigenpairs, construct $P$ and $D$, compute $P^{-1}$, verify $A = PDP^{-1}$, and use the decomposition to compute $A^k$ for large $k$.',
    explainVerbally: 'Explain why $A^k = PD^kP^{-1}$ — specifically, why $P^{-1}P$ collapses to $I$ when you expand $A \\cdot A \\cdots A$, leaving only $D$ raised to the power.',
    detectIncorrectApplication: 'Spot mismatched column ordering between $P$ and $D$, catch the error $A^k = P^kD^k(P^{-1})^k$, and identify when a matrix is defective (not diagonalizable) by checking geometric vs algebraic multiplicity.',
    transferToUnfamiliar: 'Use diagonalization to solve a new application (Markov chain steady state, recurrence relation, population model) by identifying the relevant matrix, diagonalizing it, and interpreting eigenvalues as growth rates.',
  },
};
