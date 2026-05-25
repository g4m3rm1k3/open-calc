export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la3-001',
  slug: 'eigenvectors-and-eigenvalues',
  chapter: 'la3',
  order: 1,
  title: 'Eigenvectors and Eigenvalues',
  subtitle: 'Every matrix has a hidden skeleton — a few special directions it never rotates, only stretches. Finding them reveals the true nature of a transformation.',
  tags: ['eigenvectors', 'eigenvalues', 'characteristic equation', 'characteristic polynomial', 'eigenspace', 'invariant direction'],
  aliases: 'eigen vectors values characteristic polynomial equation eigenspace invariant direction stretch rotation axis',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "A matrix transformation spins, stretches, and shears almost every vector it touches. But are there any vectors it never rotates — vectors it only stretches or squishes, never tilts?",
    realWorldContext: "Eigenvalues and eigenvectors run the world. Google's original PageRank algorithm ranks websites by finding the dominant eigenvector of a giant matrix of links. Quantum mechanics is entirely built on eigenvalues — the possible measurable states of a particle are exactly its eigenstates. Structural engineers find the resonant frequencies of a building by computing eigenvalues — the frequencies that will make it shake apart. In data science, Principal Component Analysis (PCA) compresses high-dimensional data by keeping only the most important eigenvectors. This is not an abstract topic: it is one of the most applied ideas in all of mathematics.",
    previewVisualizationId: 'LALesson08_Eigen',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      'Take $A = \\begin{bmatrix}4&2\\\\1&3\\end{bmatrix}$ and apply it to $\\mathbf{v} = [2,1]^\\top$: $A\\mathbf{v} = [8+2, 2+3]^\\top = [10, 5]^\\top = 5[2,1]^\\top$. The output is exactly 5 times the input — $\\mathbf{v}$ was not rotated at all, only stretched. That is an eigenvector ($\\mathbf{v} = [2,1]^\\top$) with eigenvalue ($\\lambda = 5$). Now try $\\mathbf{u} = [1,-1]^\\top$: $A\\mathbf{u} = [4-2, 1-3]^\\top = [2,-2]^\\top = 2[1,-1]^\\top$. Another eigenvector with $\\lambda = 2$. Any other vector you try will come out pointing in a new direction — these two are the only invariant directions for $A$.',
      '**Where you are in the story:** You have spent all of Phase 2 learning what matrices DO — they stretch, squish, shear, and rotate space. You can multiply them, invert them, find what they destroy (null space) and what they can reach (column space). Now we ask the deepest question yet: does a matrix have any preferred directions? Any directions it never rotates, only scales?',
      'Here is the core idea. When a matrix $A$ acts on a vector $\\mathbf{v}$, it generally knocks that vector off its original line — both the direction and magnitude change. But there exist special vectors where the matrix only changes the magnitude, not the direction. The output $A\\mathbf{v}$ points in exactly the same direction as $\\mathbf{v}$, just scaled by some factor. Those are the **eigenvectors**. The scaling factor is the **eigenvalue**.',
      'Think about stretching a rubber sheet along two perpendicular axes — say, horizontally and vertically. Draw any diagonal line on the sheet. After the stretch, that diagonal gets rotated to a new angle. But the two lines you pulled along (horizontal and vertical) do not rotate at all — they only get longer or shorter. Those are the eigenvectors of the stretch.',
      'For a 3D rotation around an axis (like the Earth rotating around its polar axis), the rotation axis itself is an eigenvector — it does not move at all under the rotation. Its eigenvalue is $\\lambda = 1$, meaning it is scaled by a factor of 1 (not stretched or squished, just left alone).',
      'The equation that captures this is beautifully compact:\n\n$A\\mathbf{v} = \\lambda\\mathbf{v}$\n\nMatrix multiplication on the left equals scalar multiplication on the right. The vector $\\mathbf{v}$ is treated identically whether $A$ acts on it as a full transformation or $\\lambda$ scales it as a plain number. That equivalence is what makes eigenvectors special.',
      '**CNC machine resonance — eigenvalues determine danger zones.** A CNC machine frame is a physical structure with mass and stiffness. The equation of motion for the frame is $M\\ddot{\\mathbf{x}} + K\\mathbf{x} = \\mathbf{0}$, where $M$ is the mass matrix and $K$ is the stiffness matrix. The natural vibration frequencies of the machine are $\\omega_i = \\sqrt{\\lambda_i}$, where $\\lambda_i$ are eigenvalues of $M^{-1}K$. The eigenvectors are the **mode shapes** — which parts of the machine shake in which direction for each frequency.\n\nWhy this matters: if the spindle rotation frequency matches a natural frequency (an eigenvalue), the machine enters resonance and you get **chatter** — violent vibration that destroys surface finish and can break tools. A machine shop engineer consults a Frequency Response Function (FRF) — essentially a plot of eigenvalues — to choose spindle speeds that stay away from the danger zones.',
      '**Predict before reading on.** You have $A = \\begin{bmatrix}3&0\\\\0&-2\\end{bmatrix}$ (diagonal). Without computing anything, predict: what are the eigenvalues? What are the eigenvectors? If you apply $A$ many times to $\\mathbf{u} = [1,1]^\\top$, which direction does the output eventually dominate? Write your answers before continuing.',
      '**Where this is heading:** Eigenvectors are the natural axes of a transformation — the directions where everything is simplest. In the very next lesson, you will rebuild your entire coordinate system so the $x$- and $y$-axes align with the eigenvectors. When you do, the complicated matrix $A$ becomes a beautiful diagonal matrix where the only non-zero entries are the eigenvalues themselves.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 3 — Eigenvalues & Eigenvectors',
        body: '**Previous:** Null Space and Column Space — what a matrix destroys and what it can reach.\n**This lesson:** Eigenvectors and eigenvalues — the invariant directions and scaling factors of a transformation.\n**Next:** Diagonalization — rebuilding coordinates around eigenvectors so the matrix becomes trivially simple.',
      },
      {
        type: 'insight',
        title: 'The Defining Equation',
        body: 'A\\mathbf{v} = \\lambda\\mathbf{v}\n\n$\\mathbf{v}$ is the eigenvector (a non-zero vector). $\\lambda$ is the eigenvalue (a scalar — positive means stretching in that direction, negative means flipping, zero means the vector gets squished to the origin).',
      },
      {
        type: 'insight',
        title: 'Eigenvalues Encode the Transformation\'s Personality',
        body: '• $|\\lambda| > 1$: stretches in that direction\n• $0 < |\\lambda| < 1$: squishes\n• $\\lambda = 1$: leaves it unchanged\n• $\\lambda = -1$: flips direction\n• $\\lambda = 0$: collapses to origin (this direction is in the null space!)',
      },
      {
        type: 'warning',
        title: 'The Zero Vector is Never an Eigenvector',
        body: 'The equation $A\\mathbf{0} = \\lambda\\mathbf{0}$ holds for ANY $\\lambda$ — so the zero vector carries no information about the transformation. By definition, eigenvectors must be non-zero.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson08_Eigen',
        title: 'Finding Eigenvectors Geometrically',
        mathBridge: 'The visualization shows a 2D transformation (default: a shear or stretch). Rotate the input vector $\\mathbf{v}$ by dragging its tip. Watch the output $A\\mathbf{v}$ (shown in red). Most of the time, $A\\mathbf{v}$ points in a completely different direction than $\\mathbf{v}$. But at certain angles, $A\\mathbf{v}$ lines up exactly with $\\mathbf{v}$ — only longer or shorter. Lock in those angles. You have found the eigenvectors. Note the scaling factor: that is $\\lambda$.',
        caption: 'Eigenvectors are the directions where input and output align.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Starting from $A\\mathbf{v} = \\lambda\\mathbf{v}$, subtract the right side:\n\n$A\\mathbf{v} - \\lambda\\mathbf{v} = \\mathbf{0}$\n\nFactor out $\\mathbf{v}$ (using $\\lambda\\mathbf{v} = \\lambda I\\mathbf{v}$):\n\n$(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$',
      'We want a **non-zero** $\\mathbf{v}$. The only way $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ has a non-zero solution is if the matrix $(A - \\lambda I)$ is singular — meaning it squishes some direction to zero, meaning its determinant is zero:\n\n$\\det(A - \\lambda I) = 0$\n\nThis is the **characteristic equation**. Expanding the determinant gives a polynomial in $\\lambda$ called the **characteristic polynomial**. For an $n \\times n$ matrix, this polynomial has degree $n$ and therefore has exactly $n$ roots in $\\mathbb{C}$ (counting multiplicity).',
      'The two-step process is:\n\n**Step 1 — Find eigenvalues:** Solve $\\det(A - \\lambda I) = 0$ for $\\lambda$.\n\n**Step 2 — Find eigenvectors:** For each eigenvalue $\\lambda$, solve the homogeneous system $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ using Gaussian elimination. Every non-zero solution is an eigenvector with that eigenvalue.',
      'The set of all solutions to $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ — including the zero vector — forms a subspace called the **eigenspace** of $\\lambda$. Its dimension is called the **geometric multiplicity** of $\\lambda$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Characteristic Equation',
        body: '\\det(A - \\lambda I) = 0\n\nThe roots of this polynomial are the eigenvalues of $A$.',
      },
      {
        type: 'insight',
        title: 'Triangular Matrices: Read Off the Eigenvalues',
        body: 'For any upper or lower triangular matrix, the eigenvalues are simply the diagonal entries. No computation needed — the characteristic polynomial for a triangular matrix factors as $(\\lambda_1 - \\lambda)(\\lambda_2 - \\lambda)\\cdots$.',
      },
      {
        type: 'insight',
        title: 'Two Signatures of the Eigenvalues',
        body: 'For any $n \\times n$ matrix $A$ with eigenvalues $\\lambda_1, \\ldots, \\lambda_n$:\n\n$\\text{trace}(A) = \\lambda_1 + \\lambda_2 + \\cdots + \\lambda_n$\n$\\det(A) = \\lambda_1 \\cdot \\lambda_2 \\cdots \\lambda_n$\n\nThese are fast sanity checks after finding eigenvalues.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Finding Eigenvalues and Eigenvectors',
        mathBridge: 'MATLAB: `eig(A)` returns eigenvalues as a vector; `[V, D] = eig(A)` returns eigenvectors V (columns) and diagonal eigenvalue matrix D. `poly(A)` gives the characteristic polynomial coefficients. `trace(A)` and `det(A)` verify the eigenvalue sum and product.',
        caption: 'Four cells: computing eigenpairs, verifying Av=λv, characteristic polynomial, and CNC resonance frequency analysis.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'eig() — computing and verifying eigenpairs',
              prose: [
                '`[V, D] = eig(A)` returns eigenvectors as columns of V, eigenvalues on the diagonal of D.',
                'Verify the defining equation Av = λv for each pair. Also check: trace = sum of eigenvalues, det = product.',
              ],
              code: `A = [4 2; 1 3];  % 2×2 asymmetric matrix

[V, D] = eig(A);
lambda = diag(D);

fprintf('Eigenvalues: [%g, %g]\\n', lambda(1), lambda(2))
fprintf('Eigenvectors (columns of V):\\n'); disp(V)

% Verify Av = λv for each eigenpair
for k = 1:2
    lam = lambda(k);
    v = V(:,k);
    Av = A * v;
    lv = lam * v;
    fprintf('λ=%g: A*v = [%.4f; %.4f],  λ*v = [%.4f; %.4f],  match=%d\\n', ...
        lam, Av(1), Av(2), lv(1), lv(2), norm(Av-lv)<1e-10)
end

% Sanity checks
fprintf('\\ntrace(A) = %g = sum of eigenvalues = %g\\n', trace(A), sum(lambda))
fprintf('det(A)   = %g = product of eigenvalues = %g\\n', det(A), prod(lambda))`,
            },
            {
              id: 2,
              cellTitle: 'Characteristic polynomial — finding roots manually',
              prose: [
                'The characteristic polynomial is det(A - λI). For a 2×2 matrix: p(λ) = λ² - trace(A)·λ + det(A).',
                'MATLAB\'s `poly(A)` returns the coefficients of the characteristic polynomial [1, -trace, det].',
              ],
              code: `A = [4 2; 1 3];

% MATLAB poly() gives characteristic polynomial coefficients
coeffs = poly(A);
fprintf('Characteristic polynomial coefficients: [%g, %g, %g]\\n', coeffs(1), coeffs(2), coeffs(3))
fprintf('p(λ) = λ² + (%g)λ + (%g)\\n', coeffs(2), coeffs(3))

% Find roots (= eigenvalues) of the polynomial
eigenvalues_from_poly = roots(coeffs);
fprintf('Eigenvalues from polynomial roots: [%g, %g]\\n', eigenvalues_from_poly(1), eigenvalues_from_poly(2))

% Direct computation
eigs_direct = eig(A);
fprintf('Eigenvalues from eig():           [%g, %g]\\n', eigs_direct(1), eigs_direct(2))`,
            },
            {
              id: 3,
              cellTitle: 'Power iteration — finding the dominant eigenvector',
              prose: [
                'The simplest eigenvector algorithm: start with a random vector and repeatedly multiply by A, normalizing each time. It converges to the eigenvector with the largest eigenvalue (the "dominant" eigenvector).',
                'Google\'s PageRank was originally a power iteration on a web graph matrix.',
              ],
              code: `A = [4 2; 1 3];
[V_true, D] = eig(A);

% Which eigenvalue is dominant (largest magnitude)?
[lambda_max, idx] = max(abs(diag(D)));
v_true = V_true(:, idx);  % normalize
v_true = v_true / norm(v_true);

fprintf('True dominant eigenvector: [%.4f; %.4f]  (λ=%.4f)\\n', ...
    v_true(1), v_true(2), lambda_max)

% Power iteration
x = rand(2,1);  x = x/norm(x);  % random start, normalized
fprintf('\\nPower iteration:\\n')
for iter = 1:10
    x_new = A * x;
    lambda_est = norm(x_new);   % eigenvalue estimate
    x = x_new / lambda_est;     % normalize
    if mod(iter, 2) == 0
        fprintf('  iter %2d: x=[%.6f; %.6f], λ≈%.6f\\n', iter, x(1), x(2), lambda_est)
    end
end`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC frame resonance — eigenvalues as natural frequencies',
              prose: [
                'The natural vibration frequencies of a CNC machine frame are ω_i = sqrt(λ_i), where λ_i are eigenvalues of the mass-normalized stiffness matrix M⁻¹K.',
                'Spindle speeds that match these frequencies cause resonance (chatter). Engineers plot these as "danger zones" and choose spindle RPM to stay between them.',
              ],
              code: `% Simplified 2-DOF CNC frame model
% M = mass matrix (kg), K = stiffness matrix (N/m)
M = [5 0; 0 3];       % diagonal mass (simplified: decoupled masses)
K = [1e5  -2e4;       % stiffness: gantry coupling
    -2e4   8e4];

% Eigenvalue problem: K*v = λ*M*v  (generalized eigen problem)
% Reduce to standard: M^{-0.5} * K * M^{-0.5}
M_inv = inv(M);
A_sys = M_inv * K;    % M^{-1} K for simplified case
[V, D] = eig(A_sys);

lambda = sort(diag(D));  % eigenvalues = ω² (rad/s)²
omega = sqrt(lambda);    % natural frequencies (rad/s)
freq_Hz = omega / (2*pi); % convert to Hz

fprintf('Natural frequencies of CNC frame:\\n')
for k = 1:length(freq_Hz)
    rpm = freq_Hz(k) * 60;
    fprintf('  Mode %d: %.1f Hz  (danger zone at %g RPM spindle speed)\\n', k, freq_Hz(k), rpm)
end

fprintf('\\nChatter avoidance: choose spindle speed NOT in [%.0f, %.0f] RPM\\n', ...
    freq_Hz(1)*60*0.9, freq_Hz(end)*60*1.1)`,
            },
          ]
        }
      },
      {
        id: 'CharacteristicPolynomialViz',
        title: 'The Characteristic Polynomial',
        mathBridge: 'Enter any 2×2 matrix. The visualization computes $(A - \\lambda I)$ symbolically and plots $\\det(A - \\lambda I)$ as a function of $\\lambda$ on the horizontal axis. The zeros of this parabola are the eigenvalues. Drag the matrix entries and watch the parabola shift — pay attention to when it dips below the axis (two real eigenvalues), just touches it (repeated eigenvalue), or stays above it (complex eigenvalues, coming next lesson).',
        caption: 'Eigenvalues are where the characteristic polynomial crosses zero.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Eigenvalues and Eigenvectors',
        mathBridge: 'np.linalg.eig(A) returns (eigenvalues, eigenvectors). Each column of the eigenvector matrix is an eigenvector. Verify: A @ v ≈ λ * v. Sanity check: trace(A) = sum of eigenvalues, det(A) = product of eigenvalues.',
        caption: 'Compute eigenvalues, verify the defining equation Av = λv, and visualize the invariant directions.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing eigenvalues and eigenvectors',
              prose: [
                '`np.linalg.eig(A)` returns `(eigenvalues, eigenvectors)`. The eigenvectors are columns of the second output.',
                'Verify the defining equation: `A @ v` should equal `λ * v` for each eigenpair.',
              ],
              code: `import numpy as np

A = np.array([[3., 1.],
              [0., 2.]])   # upper triangular: eigenvalues are diagonal entries

eigenvalues, eigenvectors = np.linalg.eig(A)
print("Eigenvalues:", eigenvalues)
print()
print("Eigenvectors (each column):")
print(eigenvectors)
print()

# Verify Av = λv for each pair
for i in range(len(eigenvalues)):
    lam = eigenvalues[i]
    v   = eigenvectors[:, i]
    Av  = A @ v
    lv  = lam * v
    ok  = np.allclose(Av, lv)
    print(f"λ={lam:.1f}: A@v={Av.round(4)}, λv={lv.round(4)}, ✓={ok}")`,
            },
            {
              id: 2,
              cellTitle: 'Sanity checks — trace and determinant',
              prose: [
                'For any matrix: sum of eigenvalues = trace(A), product of eigenvalues = det(A).',
                'These are fast sanity checks after computing eigenvalues.',
              ],
              code: `import numpy as np

A = np.array([[4., 2.],
              [1., 3.]])

evals, _ = np.linalg.eig(A)
print(f"Eigenvalues: {evals}")
print()
print(f"trace(A) = {np.trace(A):.1f}  |  sum of eigenvalues = {evals.sum():.1f}")
print(f"det(A)   = {np.linalg.det(A):.1f}  |  product of eigenvalues = {evals.prod():.1f}")`,
            },
            {
              id: 3,
              cellTitle: 'Visualize: eigenvectors are the invariant directions',
              prose: [
                'Eigenvectors are the arrows a transformation never rotates — only stretches or shrinks.',
                'The blue and amber arrows are the two eigenvectors. The dashed arrows show where A sends a general vector [1,1].',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER, GREEN

A = np.array([[3., 1.], [0., 2.]])
evals, evecs = np.linalg.eig(A)

v1 = evecs[:, 0].real
v2 = evecs[:, 1].real

fig = Figure(square=True, xmin=-3, xmax=4, ymin=-2, ymax=4,
             title="Eigenvectors (invariant directions)")
fig.grid().axes()

# Eigenvectors
fig.vector(v1.tolist(), color=BLUE,  label=f"λ={evals[0]:.0f}")
fig.vector(v2.tolist(), color=AMBER, label=f"λ={evals[1]:.0f}")

# A general vector and where A sends it
g = np.array([1.0, 1.0])
Ag = A @ g
fig.vector(g.tolist(),  color=GREEN, label="v")
fig.arrow(g.tolist(), Ag.tolist(), color=GREEN, dashed=True, label="Av")

fig.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Full eigen-analysis',
              difficulty: 'medium',
              prompt: 'For the matrix A = [[5, 2],[2, 2]]: (1) compute eigenvalues and eigenvectors, (2) verify Av = λv for each pair, (3) verify trace = sum of eigenvalues and det = product of eigenvalues.',
              code: `import numpy as np

A = np.array([[5., 2.],
              [2., 2.]])

# 1. eigenvalues and eigenvectors
# 2. verify Av = λv for each eigenpair
# 3. trace and determinant sanity check
`,
              hint: 'np.linalg.eig(A) gives (evals, evecs). evecs[:,i] is the i-th eigenvector. np.trace(A) for trace, np.linalg.det(A) for determinant.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The **algebraic multiplicity** of an eigenvalue $\\lambda$ is its multiplicity as a root of the characteristic polynomial. The **geometric multiplicity** is the dimension of its eigenspace $\\text{null}(A - \\lambda I)$.',
      'It is always true that: $1 \\leq \\text{geometric multiplicity} \\leq \\text{algebraic multiplicity}$. When equality holds for every eigenvalue, the matrix is diagonalizable (next lesson). When geometric multiplicity is strictly less than algebraic multiplicity for some eigenvalue, the matrix is called **defective** and cannot be diagonalized.',
      '**Similar matrices share eigenvalues.** If $B = P^{-1}AP$, then $\\det(B - \\lambda I) = \\det(P^{-1}(A-\\lambda I)P) = \\det(A - \\lambda I)$, so $A$ and $B$ have the same characteristic polynomial and hence the same eigenvalues. This is why change-of-basis does not change eigenvalues — only the representation changes.',
      '**Eigenvectors for different eigenvalues are linearly independent.** If $\\lambda_1 \\neq \\lambda_2$ and $\\mathbf{v}_1$, $\\mathbf{v}_2$ are corresponding eigenvectors, then $\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ is linearly independent. Extending by induction: eigenvectors from $k$ distinct eigenvalues are always linearly independent.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Algebraic vs. Geometric Multiplicity',
        body: '**Algebraic multiplicity** of $\\lambda_0$: the power of $(\\lambda - \\lambda_0)$ as a factor of the characteristic polynomial $\\det(A - \\lambda I)$.\n\n**Geometric multiplicity** of $\\lambda_0$: $\\dim(\\text{null}(A - \\lambda_0 I))$ — the number of linearly independent eigenvectors.\n\nGeometric $\\leq$ Algebraic always. A matrix is **defective** if geometric < algebraic for any eigenvalue.',
      },
      {
        type: 'theorem',
        title: 'Eigenvectors from Distinct Eigenvalues Are Independent',
        body: 'If $\\lambda_1, \\ldots, \\lambda_k$ are distinct eigenvalues of $A$ with corresponding eigenvectors $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$, then $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ is linearly independent.\n\n**Proof sketch:** Suppose $\\sum c_i \\mathbf{v}_i = \\mathbf{0}$. Multiply by $\\prod_{j\\neq 1}(A - \\lambda_j I)$ on the left — this annihilates all terms except the first. Conclude $c_1 = 0$. Repeat for each $c_i$.',
      },
      {
        type: 'theorem',
        title: 'The Cayley-Hamilton Theorem',
        body: 'Every square matrix satisfies its own characteristic equation. If $p(\\lambda) = \\det(A - \\lambda I)$ is the characteristic polynomial, then $p(A) = 0$ (the zero matrix).\n\nFor $2 \\times 2$: if $\\lambda^2 - \\text{tr}(A)\\lambda + \\det(A) = 0$ is the characteristic equation, then $A^2 - \\text{tr}(A)A + \\det(A)I = 0$.\n\nThis lets you express $A^2$ (and all higher powers) in terms of $A$ and $I$ — a powerful simplification.',
      },
      {
        type: 'insight',
        title: 'Similar Matrices Share Eigenvalues',
        body: 'If $B = P^{-1}AP$, then:\n\n$\\det(B - \\lambda I) = \\det(P^{-1}AP - \\lambda I) = \\det(P^{-1}(A-\\lambda I)P) = \\det(A - \\lambda I)$\n\nSo $A$ and $B$ have identical characteristic polynomials and identical eigenvalues. **Change of basis does not change eigenvalues.** This is why eigenvalues are called "intrinsic" properties of a linear map.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la3-001-ex1',
      title: 'Finding Eigenvalues and Eigenvectors of a Triangular Matrix',
      problem: 'Find all eigenvalues and eigenvectors of $A = \\begin{bmatrix}3 & 1 \\\\ 0 & 2\\end{bmatrix}$.',
      steps: [
        {
          expression: 'A - \\lambda I = \\begin{bmatrix}3-\\lambda & 1 \\\\ 0 & 2-\\lambda\\end{bmatrix}',
          annotation: 'Form $A - \\lambda I$ by subtracting $\\lambda$ from each diagonal entry.',
          strategyTitle: 'Form A − λI',
          checkpoint: 'Why do we only subtract from the diagonal?',
          hints: ['Because $\\lambda I$ has $\\lambda$ on the diagonal and 0 everywhere else.'],
        },
        {
          expression: '\\det(A - \\lambda I) = (3-\\lambda)(2-\\lambda) - (1)(0) = (3-\\lambda)(2-\\lambda) = 0',
          annotation: 'For triangular matrices, the determinant is just the product of diagonal entries. Set it to zero.',
          strategyTitle: 'Characteristic equation',
          checkpoint: 'What are the roots?',
          hints: ['$(3-\\lambda) = 0$ gives $\\lambda = 3$. $(2-\\lambda) = 0$ gives $\\lambda = 2$.'],
        },
        {
          expression: '\\lambda_1 = 3, \\quad \\lambda_2 = 2',
          annotation: 'Two distinct real eigenvalues. As a check: trace = $3+2=5 = \\lambda_1+\\lambda_2$ ✓ and $\\det(A) = 6 = \\lambda_1\\lambda_2$ ✓.',
          strategyTitle: 'Eigenvalues',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_1=3: \\quad (A-3I)\\mathbf{v} = \\begin{bmatrix}0&1\\\\0&-1\\end{bmatrix}\\mathbf{v} = \\mathbf{0}',
          annotation: 'Plug $\\lambda=3$ into $(A-\\lambda I)$ and solve the homogeneous system.',
          strategyTitle: 'Eigenvector for λ=3',
          checkpoint: 'What does the system say?',
          hints: ['Row 1: $v_2 = 0$. Row 2: $-v_2 = 0$ (redundant). So $v_2 = 0$ and $v_1$ is free.'],
        },
        {
          expression: '\\mathbf{v}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix} \\quad (\\text{or any scalar multiple})',
          annotation: 'Set $v_1 = 1$. The eigenvector for $\\lambda=3$ is the standard basis vector $\\mathbf{e}_1$.',
          strategyTitle: 'First eigenvector',
          checkpoint: 'Verify: $A\\mathbf{v}_1 = [3,0]^T = 3[1,0]^T$ ✓',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_2=2: \\quad (A-2I)\\mathbf{v} = \\begin{bmatrix}1&1\\\\0&0\\end{bmatrix}\\mathbf{v} = \\mathbf{0}',
          annotation: 'Plug $\\lambda=2$ into $(A-\\lambda I)$ and solve.',
          strategyTitle: 'Eigenvector for λ=2',
          checkpoint: 'What does the system say?',
          hints: ['Row 1: $v_1 + v_2 = 0$, so $v_1 = -v_2$. Set $v_2 = 1$.'],
        },
        {
          expression: '\\mathbf{v}_2 = \\begin{bmatrix}-1\\\\1\\end{bmatrix}',
          annotation: 'The eigenvector for $\\lambda=2$.',
          strategyTitle: 'Second eigenvector',
          checkpoint: 'Verify: $A\\mathbf{v}_2 = [(-3+1), 2]^T = [-2, 2]^T = 2[-1,1]^T$ ✓',
          hints: [],
        },
      ],
      conclusion: '$A$ has eigenvalues $\\lambda=3$ (with eigenvector $[1,0]^T$) and $\\lambda=2$ (with eigenvector $[-1,1]^T$). The matrix stretches the $x$-axis by a factor of 3 and the direction $[-1,1]$ by a factor of 2.',
    },
    {
      id: 'la3-001-ex2',
      title: 'Symmetric Matrix: Eigenvalues and Perpendicular Eigenvectors',
      problem: 'Find all eigenvalues and eigenvectors of $A = \\begin{bmatrix}2 & 1 \\\\ 1 & 2\\end{bmatrix}$.',
      steps: [
        {
          expression: '\\det(A - \\lambda I) = \\det\\begin{bmatrix}2-\\lambda & 1 \\\\ 1 & 2-\\lambda\\end{bmatrix} = (2-\\lambda)^2 - 1 = 0',
          annotation: 'Expand the determinant: $(2-\\lambda)^2 - 1^2 = 0$.',
          strategyTitle: 'Characteristic equation',
          checkpoint: 'Factor the left side.',
          hints: ['$(2-\\lambda)^2 - 1 = (2-\\lambda-1)(2-\\lambda+1) = (1-\\lambda)(3-\\lambda) = 0$.'],
        },
        {
          expression: '\\lambda_1 = 1, \\quad \\lambda_2 = 3',
          annotation: 'Two distinct eigenvalues. Check: trace = $4 = 1+3$ ✓, $\\det = 3 = 1\\cdot3$ ✓.',
          strategyTitle: 'Eigenvalues',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_1=1: \\quad (A-I)\\mathbf{v} = \\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\quad \\Rightarrow \\quad \\mathbf{v}_1 = \\begin{bmatrix}1\\\\-1\\end{bmatrix}',
          annotation: 'Row 1 says $v_1 + v_2 = 0$, so $v_1 = -v_2$.',
          strategyTitle: 'Eigenvector for λ=1',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{For } \\lambda_2=3: \\quad (A-3I)\\mathbf{v} = \\begin{bmatrix}-1&1\\\\1&-1\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\quad \\Rightarrow \\quad \\mathbf{v}_2 = \\begin{bmatrix}1\\\\1\\end{bmatrix}',
          annotation: 'Row 1 says $-v_1+v_2=0$, so $v_1=v_2$.',
          strategyTitle: 'Eigenvector for λ=3',
          checkpoint: 'Notice: $\\mathbf{v}_1 \\cdot \\mathbf{v}_2 = (1)(1)+(-1)(1) = 0$. They are perpendicular!',
          hints: ['Symmetric matrices ALWAYS have perpendicular eigenvectors (from different eigenvalues). This is the Spectral Theorem.'],
        },
      ],
      conclusion: 'The symmetric matrix $A$ squishes the $[1,-1]$ direction by factor 1 (leaves it unchanged) and stretches the $[1,1]$ direction by factor 3. The eigenvectors are perpendicular — this is guaranteed for symmetric matrices and is why symmetric matrices are especially nice to work with.',
    },
    {
      id: 'la3-001-ex3',
      title: 'Eigenvalues of a 3×3 Matrix via the Characteristic Polynomial',
      problem: 'Find the eigenvalues of $A = \\begin{bmatrix}2&0&0\\\\1&3&0\\\\0&2&4\\end{bmatrix}$ (lower triangular). Then find an eigenvector for $\\lambda = 4$.',
      steps: [
        {
          expression: '\\det(A - \\lambda I) = (2-\\lambda)(3-\\lambda)(4-\\lambda) = 0',
          annotation: 'Lower triangular matrix: determinant equals the product of the diagonal entries $(2-\\lambda)$, $(3-\\lambda)$, $(4-\\lambda)$.',
          strategyTitle: 'Read eigenvalues from the diagonal (triangular matrix shortcut)',
          checkpoint: 'What are the three eigenvalues?',
          hints: ['$\\lambda_1 = 2$, $\\lambda_2 = 3$, $\\lambda_3 = 4$. Check: trace $= 2+3+4 = 9 = $ sum of eigenvalues.'],
        },
        {
          expression: '(A - 4I)\\mathbf{v} = \\begin{bmatrix}-2&0&0\\\\1&-1&0\\\\0&2&0\\end{bmatrix}\\mathbf{v} = \\mathbf{0}',
          annotation: 'Subtract $4I$ from $A$ and set up the homogeneous system.',
          strategyTitle: 'Form A − 4I for λ = 4',
          checkpoint: 'Row-reduce A − 4I to find the null space.',
          hints: ['Row 1: $-2v_1 = 0 \\Rightarrow v_1 = 0$. Row 2: $v_1 - v_2 = 0 \\Rightarrow v_2 = 0$. Row 3: $2v_2 = 0$ (redundant). So $v_1 = v_2 = 0$ and $v_3$ is free.'],
        },
        {
          expression: '\\mathbf{v}_3 = \\begin{bmatrix}0\\\\0\\\\1\\end{bmatrix}',
          annotation: 'Set $v_3 = 1$. The eigenvector for $\\lambda = 4$ is the standard basis vector $\\mathbf{e}_3$.',
          strategyTitle: 'Extract the eigenvector',
          checkpoint: 'Verify: $A\\mathbf{e}_3 = [0, 0, 4]^\\top = 4\\mathbf{e}_3$ ✓',
          hints: ['Multiply $A\\mathbf{e}_3$: this picks out the third column of $A$, which is $[0,0,4]^\\top = 4[0,0,1]^\\top$.'],
        },
      ],
      conclusion: 'For triangular matrices, eigenvalues are the diagonal entries — no determinant expansion needed. Finding each eigenvector still requires solving $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$, but since the matrix is triangular, back substitution is especially easy.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la3-001-ch1',
      difficulty: 'easy',
      problem: 'What are the eigenvalues of the diagonal matrix $D = \\begin{bmatrix}5 & 0 \\\\ 0 & -3\\end{bmatrix}$? What are the eigenvectors?',
      hint: 'Diagonal matrices have eigenvalues on the diagonal. Try $\\mathbf{v} = [1,0]^T$ and $\\mathbf{v} = [0,1]^T$.',
      walkthrough: [
        {
          expression: 'D\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}5\\\\0\\end{bmatrix} = 5\\begin{bmatrix}1\\\\0\\end{bmatrix}',
          annotation: '$[1,0]^T$ is an eigenvector with $\\lambda = 5$.',
        },
        {
          expression: 'D\\begin{bmatrix}0\\\\1\\end{bmatrix} = \\begin{bmatrix}0\\\\-3\\end{bmatrix} = -3\\begin{bmatrix}0\\\\1\\end{bmatrix}',
          annotation: '$[0,1]^T$ is an eigenvector with $\\lambda = -3$. Diagonal matrices always use the standard basis as their eigenvectors.',
        },
      ],
      answer: 'λ₁ = 5, v₁ = [1,0]ᵀ; λ₂ = -3, v₂ = [0,1]ᵀ',
    },
    {
      id: 'la3-001-ch2',
      difficulty: 'medium',
      problem: 'Find all eigenvalues and eigenvectors of $A = \\begin{bmatrix}4 & 2 \\\\ 1 & 3\\end{bmatrix}$.',
      hint: 'The characteristic polynomial is $\\lambda^2 - 7\\lambda + 10 = 0$. Factor it.',
      walkthrough: [
        {
          expression: '\\det(A - \\lambda I) = (4-\\lambda)(3-\\lambda) - 2 = \\lambda^2 - 7\\lambda + 10 = (\\lambda-5)(\\lambda-2) = 0',
          annotation: 'Characteristic equation: expand, simplify, factor.',
        },
        {
          expression: '\\lambda_1 = 5, \\quad \\lambda_2 = 2',
          annotation: 'Check: trace $= 7 = 5+2$ ✓, $\\det = 10 = 5\\cdot2$ ✓.',
        },
        {
          expression: '\\lambda_1=5: \\; (A-5I)\\mathbf{v}=\\mathbf{0} \\Rightarrow \\begin{bmatrix}-1&2\\\\1&-2\\end{bmatrix}\\mathbf{v}=\\mathbf{0} \\Rightarrow \\mathbf{v}_1=\\begin{bmatrix}2\\\\1\\end{bmatrix}',
          annotation: '$-v_1+2v_2=0 \\Rightarrow v_1=2v_2$. Set $v_2=1$.',
        },
        {
          expression: '\\lambda_2=2: \\; (A-2I)\\mathbf{v}=\\mathbf{0} \\Rightarrow \\begin{bmatrix}2&2\\\\1&1\\end{bmatrix}\\mathbf{v}=\\mathbf{0} \\Rightarrow \\mathbf{v}_2=\\begin{bmatrix}1\\\\-1\\end{bmatrix}',
          annotation: '$2v_1+2v_2=0 \\Rightarrow v_1=-v_2$. Set $v_2=1$.',
        },
      ],
      answer: 'λ₁=5, v₁=[2,1]ᵀ; λ₂=2, v₂=[1,-1]ᵀ',
    },
    {
      id: 'la3-001-ch3',
      difficulty: 'hard',
      problem: 'Without computing eigenvalues, explain why the matrix $A = \\begin{bmatrix}1 & 1 \\\\ 0 & 1\\end{bmatrix}$ (a shear) has $\\lambda = 1$ as a repeated eigenvalue, and find its eigenvectors. Can you find two linearly independent eigenvectors?',
      hint: 'Use the trace and determinant: trace $= 2$, so $\\lambda_1 + \\lambda_2 = 2$; det $= 1$, so $\\lambda_1\\lambda_2 = 1$. Solve for $\\lambda$. Then check the eigenspace.',
      walkthrough: [
        {
          expression: '\\lambda_1 + \\lambda_2 = \\text{trace} = 2 \\quad \\text{and} \\quad \\lambda_1\\lambda_2 = \\det = 1 \\quad \\Rightarrow \\quad \\lambda = 1 \\text{ (repeated)}',
          annotation: 'Both eigenvalues equal 1.',
        },
        {
          expression: '(A - I)\\mathbf{v} = \\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}\\mathbf{v} = \\mathbf{0} \\quad \\Rightarrow \\quad v_2 = 0, \\quad v_1 \\text{ free}',
          annotation: 'The eigenspace is $\\{[t, 0]^T : t \\in \\mathbb{R}\\}$ — a 1D space.',
        },
        {
          expression: '\\text{Geometric multiplicity} = 1 < 2 = \\text{Algebraic multiplicity}',
          annotation: 'Only one independent eigenvector despite a repeated eigenvalue. This matrix is defective — it cannot be diagonalized.',
        },
      ],
      answer: 'Only one eigenvector: v = [1,0]ᵀ. The matrix is defective — it cannot be diagonalized.',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A\\mathbf{v} = \\lambda\\mathbf{v}', meaning: 'Defining equation: v is an eigenvector, λ is the corresponding eigenvalue' },
      { symbol: '\\det(A - \\lambda I) = 0', meaning: 'Characteristic equation — its roots are the eigenvalues' },
      { symbol: '\\text{null}(A - \\lambda I)', meaning: 'Eigenspace for eigenvalue λ — all eigenvectors (plus 0) for that λ' },
      { symbol: '\\text{trace}(A)', meaning: 'Sum of diagonal entries = sum of all eigenvalues' },
    ],
    rulesOfThumb: [
      'Diagonal/triangular matrices: eigenvalues are the diagonal entries. No work needed.',
      'Trace = sum of eigenvalues; det = product of eigenvalues. Always check these.',
      'Eigenvectors from different eigenvalues are always linearly independent.',
      'Symmetric matrices always have real eigenvalues and perpendicular eigenvectors.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la2-004',
        label: 'Null Space',
        note: 'Finding an eigenvector for eigenvalue λ is just finding the null space of $(A - \\lambda I)$. Everything you know about Gaussian elimination and null spaces applies directly here.',
      },
      {
        lessonId: 'la2-003',
        label: 'Determinants',
        note: 'The characteristic equation $\\det(A - \\lambda I) = 0$ uses the determinant to detect when a matrix is singular. A non-zero determinant means only the trivial solution — no eigenvectors there.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la3-002',
        label: 'Diagonalization',
        note: 'Eigenvectors become the columns of the change-of-basis matrix $P$. Eigenvalues fill the diagonal of $D$. Together, $A = PDP^{-1}$ — the cleanest way to understand any diagonalizable matrix.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Eigenvectors: the directions a matrix never tilts — only stretches or flips.',
    'Eigenvalues: the stretching factors for each eigenvector direction.',
    'Find λ: solve det(A − λI) = 0 (characteristic equation).',
    'Find v: for each λ, solve (A − λI)v = 0 (null space problem).',
    'Trace = Σλᵢ, det = Πλᵢ — fast sanity checks.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la3-001-1', label: 'Read: understand eigenvectors as invariant directions and eigenvalues as stretch factors', type: 'read' },
    { id: 'cp-la3-001-2', label: 'Read: follow the derivation of the characteristic equation det(A − λI) = 0', type: 'read' },
    { id: 'cp-la3-001-3', label: 'Read: understand algebraic vs geometric multiplicity and defective matrices', type: 'read' },
    { id: 'cp-la3-001-4', label: 'Run OpenMAT cell 1 — compute eigenpairs and verify Av = λv', type: 'lab' },
    { id: 'cp-la3-001-5', label: 'Run Python cell 1 — compute eigenpairs with numpy and verify the defining equation', type: 'lab' },
    { id: 'cp-la3-001-6', label: 'Complete example 1: find eigenvalues and eigenvectors of a triangular matrix step by step', type: 'example' },
    { id: 'cp-la3-001-7', label: 'Complete example 2: find perpendicular eigenvectors of a symmetric matrix', type: 'example' },
    { id: 'cp-la3-001-8', label: 'Attempt challenge 3: analyze the defective shear matrix and explain why it cannot be diagonalized', type: 'challenge' },
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la3-001-assess-1',
        type: 'input',
        text: 'What is the eigenvalue of the identity matrix (for any eigenvector)?',
        answer: '1',
        hint: 'I·v = 1·v for every vector v.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'eigenvectors-and-eigenvalues-q1',
      type: 'choice',
      text: 'Why do we set $\\det(A - \\lambda I) = 0$ to find eigenvalues?',
      options: [
        'Because eigenvalues must always be zero',
        'Because we need $(A - \\lambda I)$ to be singular so that a non-zero eigenvector can be mapped to the zero vector',
        'Because the determinant of $A$ must equal $\\lambda$',
        'Because $I = 0$ in linear algebra',
      ],
      answer: 'Because we need $(A - \\lambda I)$ to be singular so that a non-zero eigenvector can be mapped to the zero vector',
      hints: ['If $\\det(A - \\lambda I) \\neq 0$, the matrix is invertible and $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ has only the trivial solution $\\mathbf{v}=\\mathbf{0}$ — which is not allowed as an eigenvector.'],
      reviewSection: 'Math tab — The Characteristic Equation',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q2',
      type: 'choice',
      text: 'A $2 \\times 2$ matrix has eigenvalues $\\lambda_1 = 4$ and $\\lambda_2 = -1$. What is the determinant of the matrix?',
      options: ['$4$', '$-4$', '$3$', '$-1$'],
      answer: '$-4$',
      hints: ['$\\det(A) = \\lambda_1 \\cdot \\lambda_2 = 4 \\cdot (-1) = -4$. The determinant equals the product of all eigenvalues.'],
      reviewSection: 'Math tab — Two Signatures',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q3',
      type: 'choice',
      text: 'A matrix $A$ has $\\lambda = 0$ as an eigenvalue. What does this tell you about $A$?',
      options: [
        '$A$ is the identity matrix',
        '$A$ is the zero matrix',
        '$A$ is singular — it collapses some direction to the origin',
        '$A$ has no other eigenvalues',
      ],
      answer: '$A$ is singular — it collapses some direction to the origin',
      hints: ['$\\lambda = 0$ means $A\\mathbf{v} = 0\\mathbf{v} = \\mathbf{0}$ for some non-zero $\\mathbf{v}$. That means $\\mathbf{v}$ is in the null space of $A$, so $A$ is not invertible.'],
      reviewSection: 'Intuition tab — Eigenvalues Encode the Transformation\'s Personality',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q4',
      type: 'choice',
      text: 'If $\\mathbf{v}$ is an eigenvector of $A$ with eigenvalue $\\lambda = 3$, what is $A(2\\mathbf{v})$?',
      options: ['$2\\mathbf{v}$', '$3\\mathbf{v}$', '$6\\mathbf{v}$', '$9\\mathbf{v}$'],
      answer: '$6\\mathbf{v}$',
      hints: ['$A(2\\mathbf{v}) = 2(A\\mathbf{v}) = 2(3\\mathbf{v}) = 6\\mathbf{v}$. Scalar multiples of eigenvectors are also eigenvectors with the same eigenvalue.'],
      reviewSection: 'Math tab — Eigenspace',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q5',
      type: 'choice',
      text: 'For $A = \\begin{bmatrix}5&0\\\\0&-2\\end{bmatrix}$, what are the eigenvectors?',
      options: [
        '$\\mathbf{v}_1 = [5,0]^\\top$ and $\\mathbf{v}_2 = [0,-2]^\\top$',
        '$\\mathbf{v}_1 = [1,0]^\\top$ and $\\mathbf{v}_2 = [0,1]^\\top$',
        '$\\mathbf{v}_1 = [1,1]^\\top$ and $\\mathbf{v}_2 = [1,-1]^\\top$',
        'There are no eigenvectors since eigenvalues have different signs.',
      ],
      answer: '$\\mathbf{v}_1 = [1,0]^\\top$ and $\\mathbf{v}_2 = [0,1]^\\top$',
      hints: ['Diagonal matrices always use the standard basis vectors as eigenvectors. $A\\mathbf{e}_1 = 5\\mathbf{e}_1$ and $A\\mathbf{e}_2 = -2\\mathbf{e}_2$.'],
      reviewSection: 'Challenges — Challenge 1',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q6',
      type: 'choice',
      text: 'A matrix $A$ has characteristic polynomial $p(\\lambda) = \\lambda^2 - 5\\lambda + 6$. What are its eigenvalues?',
      options: ['$\\lambda = 5$ and $\\lambda = 6$', '$\\lambda = 2$ and $\\lambda = 3$', '$\\lambda = -2$ and $\\lambda = -3$', '$\\lambda = 1$ and $\\lambda = 6$'],
      answer: '$\\lambda = 2$ and $\\lambda = 3$',
      hints: ['Factor: $\\lambda^2 - 5\\lambda + 6 = (\\lambda-2)(\\lambda-3) = 0$. Roots are $\\lambda = 2$ and $\\lambda = 3$. Sanity check: $2+3 = 5 = $ trace and $2 \\cdot 3 = 6 = $ det.'],
      reviewSection: 'Math tab — Characteristic Equation',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q7',
      type: 'choice',
      text: 'Two eigenvectors $\\mathbf{v}_1$ and $\\mathbf{v}_2$ correspond to different eigenvalues $\\lambda_1 \\neq \\lambda_2$. What can you conclude about $\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$?',
      options: [
        'They are orthogonal (perpendicular).',
        'They are linearly independent.',
        'They span the same subspace.',
        'Nothing — their relationship depends on the specific matrix.',
      ],
      answer: 'They are linearly independent.',
      hints: ['Eigenvectors from distinct eigenvalues are always linearly independent (proved in the Rigor section). They are NOT necessarily orthogonal — that only holds for symmetric matrices by the Spectral Theorem.'],
      reviewSection: 'Rigor tab — Eigenvectors from Distinct Eigenvalues theorem',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q8',
      type: 'choice',
      text: 'Matrix $A$ has eigenvalue $\\lambda_0$ with algebraic multiplicity 3 and geometric multiplicity 1. What can you conclude?',
      options: [
        '$A$ is the zero matrix.',
        '$A$ is defective and cannot be diagonalized.',
        '$A$ has exactly three linearly independent eigenvectors for $\\lambda_0$.',
        '$A$ is invertible.',
      ],
      answer: '$A$ is defective and cannot be diagonalized.',
      hints: ['Geometric multiplicity (dimension of eigenspace) $= 1 <$ algebraic multiplicity $= 3$. When these are unequal for any eigenvalue, the matrix is defective and lacks a full set of $n$ independent eigenvectors — diagonalization is impossible.'],
      reviewSection: 'Rigor tab — Algebraic vs Geometric Multiplicity',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q9',
      type: 'choice',
      text: 'For an $n \\times n$ matrix $A$, the characteristic polynomial $\\det(A - \\lambda I)$ has degree:',
      options: ['$1$', '$n-1$', '$n$', '$n^2$'],
      answer: '$n$',
      hints: ['The determinant of an $n \\times n$ matrix with entries linear in $\\lambda$ gives a polynomial of degree $n$. By the Fundamental Theorem of Algebra, there are exactly $n$ roots in $\\mathbb{C}$ (counting multiplicity) — so an $n \\times n$ matrix has exactly $n$ eigenvalues.'],
      reviewSection: 'Math tab — Characteristic Equation',
    },
    {
      id: 'eigenvectors-and-eigenvalues-q10',
      type: 'choice',
      text: 'Similar matrices $B = P^{-1}AP$ have:',
      options: [
        'The same entries as $A$.',
        'The same eigenvalues as $A$ (and hence the same characteristic polynomial).',
        'The same eigenvectors as $A$.',
        'The same trace and determinant as $A$, but different eigenvalues.',
      ],
      answer: 'The same eigenvalues as $A$ (and hence the same characteristic polynomial).',
      hints: ['$\\det(B - \\lambda I) = \\det(P^{-1}AP - \\lambda I) = \\det(P^{-1}(A - \\lambda I)P) = \\det(P^{-1})\\det(A-\\lambda I)\\det(P) = \\det(A-\\lambda I)$. Eigenvalues are intrinsic to the linear map, not the basis.'],
      reviewSection: 'Rigor tab — Similar Matrices Share Eigenvalues',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The eigenvector of $A$ for eigenvalue $\\lambda$ is the same as $\\lambda$ itself (confusing the vector and the scalar).',
      whyStudentsThinkIt: 'The word "eigen" applies to both, and the equation $A\\mathbf{v} = \\lambda\\mathbf{v}$ has both on the right side. Students sometimes write the eigenvector as $[\\lambda]$ or confuse which is which.',
      correctionExample: 'For $A = \\begin{bmatrix}3&1\\\\0&2\\end{bmatrix}$ and $\\lambda = 3$: the eigenvector is the vector $[1,0]^\\top$ (a direction in space), and the eigenvalue is the scalar $3$ (a stretch factor). $A[1,0]^\\top = [3,0]^\\top = 3[1,0]^\\top$. The scalar $3$ is not a vector.',
      contrastCase: 'For $\\lambda = 0$: the eigenvalue is zero (a scalar) but the eigenvector is a non-zero vector in the null space of $A$. Zero eigenvalue does not mean zero eigenvector.',
    },
    {
      falseBelief: 'If $\\mathbf{v}$ is an eigenvector of $A$, then it is also an eigenvector of $A + I$ with the same eigenvalue.',
      whyStudentsThinkIt: 'Students believe the eigenvectors of $A$ are fixed properties of the "direction," independent of the specific matrix. Adding $I$ seems like a small change.',
      correctionExample: 'If $A\\mathbf{v} = \\lambda\\mathbf{v}$, then $(A+I)\\mathbf{v} = A\\mathbf{v} + I\\mathbf{v} = \\lambda\\mathbf{v} + \\mathbf{v} = (\\lambda+1)\\mathbf{v}$. So $\\mathbf{v}$ IS an eigenvector of $A+I$, but with eigenvalue $\\lambda+1$, not $\\lambda$.',
      contrastCase: 'This is actually a useful theorem: if $A$ and $B$ are simultaneously diagonalizable (share the same eigenvectors), then they commute ($AB = BA$). Adding $I$ to $A$ never changes the eigenvectors, only shifts all eigenvalues by 1.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are analyzing Google PageRank. The web is modeled as a transition matrix $P$ where $P_{ij}$ is the probability of going from page $i$ to page $j$. You want to find the "most important" pages — the steady-state distribution that the random surfer converges to.',
      competingTechniques: 'Solve the linear system $\\boldsymbol{\\pi}^\\top P = \\boldsymbol{\\pi}^\\top$ directly (setting up $n$ equations), or run many matrix-vector multiplications hoping to converge.',
      whyThisTechniqueWins: 'The steady-state $\\boldsymbol{\\pi}$ is exactly the eigenvector of $P^\\top$ (or $P$ depending on convention) corresponding to eigenvalue $\\lambda = 1$. Power iteration — repeatedly multiplying by $P$ and normalizing — converges to this dominant eigenvector. PageRank is eigenvalue computation at web scale.',
    },
    {
      situation: 'A structural engineer needs the resonant frequencies of a bridge to ensure they do not match wind frequencies (which would cause catastrophic resonance). The bridge equations of motion are $M\\ddot{\\mathbf{u}} + K\\mathbf{u} = \\mathbf{0}$.',
      competingTechniques: 'Frequency sweep testing (measure at many frequencies, expensive), numerical simulation (time-domain, slow), or solve the generalized eigenvalue problem $K\\mathbf{v} = \\omega^2 M\\mathbf{v}$.',
      whyThisTechniqueWins: 'The eigenvalues $\\omega_i^2$ of $M^{-1}K$ give the squared natural frequencies directly. The eigenvectors give the mode shapes (which parts move how during each resonance). One eigen-analysis gives all resonant frequencies simultaneously. For the Tacoma Narrows Bridge collapse: a frequency match (an eigenvalue coincidence) caused the catastrophe.',
    },
  ],

  debugging: [
    {
      commonError: 'Finding eigenvalues correctly but then solving the wrong system for eigenvectors — e.g., solving $A\\mathbf{v} = \\mathbf{0}$ instead of $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$.',
      symptom: 'The "eigenvectors" found do not satisfy $A\\mathbf{v} = \\lambda\\mathbf{v}$. Verification $A\\mathbf{v}$ produces a vector that is not a multiple of $\\mathbf{v}$.',
      whyItHappened: 'Students confuse finding the null space of $A$ (which gives eigenvectors for $\\lambda = 0$) with finding eigenvectors for general $\\lambda$. The shift $A - \\lambda I$ is easy to forget.',
      repairStrategy: 'Always write out $(A - \\lambda I)$ explicitly for the specific value of $\\lambda$, then row-reduce THAT matrix. Verify the result: compute $A\\mathbf{v}$ and check it equals $\\lambda\\mathbf{v}$.',
    },
    {
      commonError: 'Listing eigenvalue $\\lambda = 2$ twice (as two separate eigenvalues) when it is a repeated root of the characteristic polynomial with algebraic multiplicity 2.',
      symptom: 'The student finds "eigenvalues $\\lambda_1 = 2$ and $\\lambda_2 = 2$" and then tries to find two independent eigenvectors, gets confused when only one is found.',
      whyItHappened: 'Algebraic multiplicity (root multiplicity in the characteristic polynomial) does not guarantee geometric multiplicity (number of independent eigenvectors). A repeated eigenvalue may have only 1 independent eigenvector (defective matrix) or 2 (full eigenspace).',
      repairStrategy: 'For eigenvalue $\\lambda_0$ with algebraic multiplicity $k$: solve $(A - \\lambda_0 I)\\mathbf{v} = \\mathbf{0}$ and find the dimension of the null space. That dimension (geometric multiplicity) tells you how many independent eigenvectors exist. If it is less than $k$, the matrix is defective.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Find all eigenvalues and eigenvectors of a 2×2 or 3×3 matrix: set up the characteristic equation, solve it, then for each eigenvalue solve the homogeneous system $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$.',
    explainVerbally: 'Explain eigenvectors as the invariant directions of a transformation — the directions the matrix only stretches or flips, never rotates. Explain why we set det$(A - \\lambda I) = 0$: we need the matrix to be singular so a non-zero solution exists.',
    detectIncorrectApplication: 'Spot when someone confuses the eigenvalue (scalar) with the eigenvector (vector), or solves $A\\mathbf{v} = \\mathbf{0}$ instead of $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$, or assumes a repeated eigenvalue always has a full eigenspace.',
    transferToUnfamiliar: 'Apply eigenvalue analysis to a new application context (PageRank, resonance frequencies, covariance matrix in PCA) by identifying which matrix\'s eigenvectors and eigenvalues are needed and what they physically represent.',
  },
};
