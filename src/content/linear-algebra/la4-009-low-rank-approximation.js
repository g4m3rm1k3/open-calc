export default {
  id: 'la4-009',
  slug: 'low-rank-approximation',
  chapter: 'la4',
  order: 9,
  title: 'Low-Rank Approximation',
  subtitle: 'The best rank-$k$ approximation to any matrix $A$ is obtained by keeping the top $k$ singular values and discarding the rest. This theorem — proved by Eckart-Young — is the mathematical foundation of data compression, PCA, and dimensionality reduction.',
  tags: ['low-rank approximation', 'Eckart-Young theorem', 'truncated SVD', 'data compression', 'best approximation', 'singular values', 'rank-k', 'image compression'],
  aliases: 'low-rank approximation Eckart-Young truncated SVD best rank-k approximation data compression image compression PCA dimensionality reduction',

  hook: {
    question: "A $1000 \\times 1000$ image has $10^6$ pixel values. Can you store the essential information in just $1000 \\times 20 = 20000$ numbers — 50x compression — while keeping the image recognizable? The answer is yes, using low-rank approximation.",
    realWorldContext: "Low-rank approximation is the engine behind Netflix's recommendation system (collaborative filtering), image and video compression (JPEG-2000 uses wavelets, which are low-rank), face recognition (eigenfaces = top PCA components), NLP word embeddings (GloVe, word2vec use low-rank matrix factorizations of co-occurrence matrices), and physics simulations (reduced-order models approximate high-dimensional PDEs with low-rank dynamics). The Eckart-Young theorem guarantees these are the BEST possible approximations in both the 2-norm and Frobenius norm.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Best rank-1 approximation with numbers.** Take $A = \\begin{pmatrix}4&3\\\\2&1\\end{pmatrix}$. SVD: singular values $\\sigma_1 \\approx 5.46$, $\\sigma_2 \\approx 0.37$. Top singular vectors: $u_1 \\approx (0.86, 0.51)^\\top$, $v_1 \\approx (0.90, 0.44)^\\top$. Best rank-1 approximation: $A_1 = \\sigma_1 u_1 v_1^\\top \\approx 5.46 \\cdot \\begin{pmatrix}0.77&0.38\\\\0.46&0.22\\end{pmatrix} \\approx \\begin{pmatrix}4.2&2.1\\\\2.5&1.2\\end{pmatrix}$. Error $\\|A - A_1\\|_2 = \\sigma_2 \\approx 0.37$ — the best possible for any rank-1 matrix. The singular value $\\sigma_2$ is the "cost" of discarding the second component.',
      '**The Eckart-Young theorem.** For $A = \\sum_{i=1}^r \\sigma_i u_i v_i^\\top$, the rank-$k$ truncation $A_k = \\sum_{i=1}^k \\sigma_i u_i v_i^\\top$ satisfies: (1) $\\|A - A_k\\|_2 = \\sigma_{k+1}$ (the $(k+1)$-th singular value). (2) $\\|A - A_k\\|_F^2 = \\sigma_{k+1}^2 + \\cdots + \\sigma_r^2$ (sum of discarded singular values squared). (3) For any rank-$k$ matrix $B$: $\\|A - B\\|_2 \\geq \\sigma_{k+1}$ and $\\|A - B\\|_F \\geq \\|A - A_k\\|_F$. $A_k$ is the BEST rank-$k$ approximation in BOTH norms simultaneously.',
      '**Compression ratio and energy.** The Frobenius norm $\\|A\\|_F^2 = \\sum_i \\sigma_i^2$ is the total "energy." Keeping the top $k$ singular values captures energy fraction $\\sum_{i=1}^k \\sigma_i^2 / \\sum_{i=1}^r \\sigma_i^2$. For images, often 90% of the energy is in the top 1-5% of singular values. Storage: $A$ needs $mn$ numbers; $A_k = U_k \\Sigma_k V_k^\\top$ needs $mk + k + nk = k(m+n+1)$ numbers. Compression ratio: $mn / (k(m+n+1))$.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Prediction: how much rank-1 captures',
        body: 'Let $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$ (diagonal). Singular values: $\\sigma_1=3$, $\\sigma_2=1$. **Before computing:** predict what fraction of the Frobenius energy the rank-1 approximation captures. After predicting: $\\|A\\|_F^2 = 9+1=10$. $A_1 = 3e_1e_1^\\top = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$. Energy captured: $9/10 = 90\\%$. Error $\\|A-A_1\\|_F = 1 = \\sigma_2$. So throwing away the second singular value loses only 10% of the energy but drops rank from 2 to 1.',
      },
      {
        type: 'theorem',
        title: 'Eckart-Young Theorem',
        body: 'Let $A = U\\Sigma V^\\top$ with $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq \\sigma_r > 0$. Define $A_k = \\sum_{i=1}^k \\sigma_i u_i v_i^\\top$ (truncated SVD).\n\n**Best 2-norm:** $\\min_{\\text{rank}(B)\\leq k}\\|A-B\\|_2 = \\sigma_{k+1}$, achieved by $B=A_k$.\n\n**Best Frobenius:** $\\min_{\\text{rank}(B)\\leq k}\\|A-B\\|_F = \\sqrt{\\sigma_{k+1}^2+\\cdots+\\sigma_r^2}$, achieved by $B=A_k$.\n\nThe same $A_k$ is optimal for both norms simultaneously.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Low-Rank Approximation',
        mathBridge: 'Compute truncated SVD approximations and measure approximation quality.',
        caption: 'Rank-k approximation = sum of top k singular value × outer product terms.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'SVD truncation and energy',
              prose: ['Compute low-rank approximations and measure how much energy each rank captures.'],
              code: `% Create a test matrix with decaying singular values
rng(42)
A = randn(10, 8)  % random 10x8 matrix

[U, S, V] = svd(A)
sigma = diag(S)
disp('Singular values:')
sigma'

% Total energy
total_energy = sum(sigma.^2)

% Cumulative energy fraction
cumulative = cumsum(sigma.^2) / total_energy
disp('Cumulative energy fraction:')
cumulative'

% Rank-k approximation for k = 1, 2, 3
for k = 1:3
    Ak = U(:,1:k) * S(1:k,1:k) * V(:,1:k)'
    err_F = norm(A - Ak, 'fro')
    err_2 = norm(A - Ak, 2)
    sigma_next = sigma(k+1)
    fprintf('k=%d: ||A-Ak||_F=%.4f, ||A-Ak||_2=%.4f, sigma_%d=%.4f\\n', ...
            k, err_F, err_2, k+1, sigma_next)
end
`,
            },
            {
              id: 2,
              cellTitle: 'Image compression via SVD',
              prose: ['Simulate image compression by approximating a matrix with low-rank truncated SVD.'],
              code: `% Create a structured "image-like" matrix
n = 50
[X, Y] = meshgrid(1:n, 1:n)
% Structured image: sum of rank-1 patterns
A = sin(X/5) .* cos(Y/5) + 0.5*sin(X/10) + randn(n,n)*0.1

[U, S, V] = svd(A)
sigma = diag(S)

% Show singular values (should decay quickly for structured data)
disp('Top 10 singular values:')
sigma(1:10)'

% Approximation quality vs rank
ranks = [1, 3, 5, 10]
total_energy = norm(A, 'fro')^2
for k = ranks
    Ak = U(:,1:k) * S(1:k,1:k) * V(:,1:k)'
    energy_pct = sum(sigma(1:k).^2) / total_energy * 100
    err = norm(A - Ak, 'fro') / norm(A, 'fro') * 100
    storage_ratio = k*(2*n+1) / n^2 * 100
    fprintf('Rank %2d: %.1f%% energy, %.1f%% error, %.1f%% storage\\n', ...
            k, energy_pct, err, storage_ratio)
end
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof sketch of Eckart-Young.** Suppose $B$ has rank $k$ and $\\|A-B\\|_2 < \\sigma_{k+1}$. Since $\\text{rank}(B)=k$, its null space $N(B)$ has dimension $\\geq n-k$. The span of $\\{v_1,\\ldots,v_{k+1}\\}$ has dimension $k+1$, so by dimension count, there exists a unit vector $\\mathbf{w}$ in $N(B) \\cap \\text{span}\\{v_1,\\ldots,v_{k+1}\\}$. Then $\\|(A-B)\\mathbf{w}\\| = \\|A\\mathbf{w}\\|$ (since $B\\mathbf{w}=0$). But $A\\mathbf{w} = \\sum_{i=1}^{k+1}\\sigma_i(v_i^\\top\\mathbf{w})u_i$, so $\\|A\\mathbf{w}\\|^2 = \\sum_{i=1}^{k+1}\\sigma_i^2(v_i^\\top\\mathbf{w})^2 \\geq \\sigma_{k+1}^2\\sum(v_i^\\top\\mathbf{w})^2 = \\sigma_{k+1}^2$ (since $\\|\\mathbf{w}\\|=1$ and the $v_i$ are orthonormal). Contradiction.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Nuclear Norm and Convex Relaxation',
        body: 'The rank-$k$ constraint (rank$(B) \\leq k$) is non-convex and NP-hard to optimize over in general. The **nuclear norm** $\\|A\\|_* = \\sum_i \\sigma_i$ is the convex envelope of the rank function.\n\nMinimizing $\\|A-B\\|_F^2 + \\lambda\\|B\\|_*$ gives a convex problem whose solution is the soft-thresholded SVD: $B = \\sum_i \\max(\\sigma_i - \\lambda, 0)\\cdot u_i v_i^\\top$.\n\nThis is used in matrix completion (Netflix problem) and robust PCA.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Matrix completion and the Netflix problem.** Given a partially observed matrix $M$ (most entries missing), find the lowest-rank matrix consistent with the observations. Under incoherence conditions (the singular vectors are "spread out"), $M$ can be exactly recovered from $O(rn\\log n)$ random entries by nuclear norm minimization — far fewer than the $mn$ total entries. This is the mathematical foundation of collaborative filtering: if user preferences form a low-rank matrix (users cluster into groups, items cluster into genres), then a few ratings suffice to predict all ratings.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Randomized SVD for Large-Scale Data',
        body: 'For a large $m \\times n$ matrix, computing the full SVD costs $O(mn\\min(m,n))$. The **randomized SVD** (Halko, Martinsson, Tropp 2011) estimates the top $k$ singular vectors in $O(mnk)$ time:\n1. Sample a random matrix $\\Omega \\in \\mathbb{R}^{n\\times (k+p)}$\n2. Compute $Y = A\\Omega$ (sketch)\n3. Orthogonalize: $Q = \\text{orth}(Y)$\n4. $B = Q^\\top A$, then SVD of small $B$\n\nThis gives near-optimal low-rank approximations at a fraction of the cost. Used in sklearn, NumPy, and TensorFlow.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-009-1',
      title: 'Best rank-1 approximation with explicit calculation',
      problem: 'For $A = \\begin{pmatrix}3&2\\\\6&4\\\\1&2\\end{pmatrix}$, find the best rank-1 approximation $A_1$ and compute the approximation error.',
      steps: [
        { explanation: 'Compute $A^\\top A = \\begin{pmatrix}3&6&1\\\\2&4&2\\end{pmatrix}\\begin{pmatrix}3&2\\\\6&4\\\\1&2\\end{pmatrix} = \\begin{pmatrix}46&32\\\\32&24\\end{pmatrix}$.' },
        { explanation: 'Eigenvalues of $A^\\top A$: $\\text{tr}=70$, $\\det=46\\cdot24-32^2=1104-1024=80$. $\\lambda = (70\\pm\\sqrt{70^2-4\\cdot80})/2 = (70\\pm\\sqrt{4580})/2 \\approx (70\\pm67.67)/2$. So $\\lambda_1 \\approx 68.84$, $\\lambda_2 \\approx 1.17$. Singular values: $\\sigma_1\\approx8.30$, $\\sigma_2\\approx1.08$.' },
        { explanation: 'Top right singular vector $v_1$: eigenvector of $A^\\top A$ for $\\lambda_1 \\approx 68.84$. $(A^\\top A - 68.84I)v = 0$: $-22.84v_1+32v_2=0$, so $v_1 \\propto (32, 22.84) \\propto (1, 0.714)$. Normalized: $v_1 \\approx (0.815, 0.579)^\\top$.' },
        { explanation: 'Top left singular vector: $u_1 = Av_1/\\sigma_1 = (3\\cdot0.815+2\\cdot0.579, 6\\cdot0.815+4\\cdot0.579, 0.815+2\\cdot0.579)^\\top / 8.30 \\approx (3.603, 7.206, 1.973)^\\top/8.30 \\approx (0.434, 0.868, 0.238)^\\top$.' },
        { explanation: 'Best rank-1 approximation: $A_1 = \\sigma_1 u_1 v_1^\\top \\approx 8.30 \\cdot (0.434, 0.868, 0.238)^\\top(0.815, 0.579)$. Check: $A$ has rank 2 (columns $(3,6,1)^\\top$ and $(2,4,2)^\\top$ are not proportional). Error: $\\|A-A_1\\|_2 = \\sigma_2 \\approx 1.08$, $\\|A-A_1\\|_F = \\sigma_2 \\approx 1.08$ (only one remaining singular value).' },
      ],
    },
    {
      id: 'ex-la4-009-2',
      title: 'Compression ratio for image approximation',
      problem: 'A $200 \\times 300$ grayscale image (rank $\\approx 200$) is approximated by a rank-20 SVD. (a) How many numbers are stored? (b) What is the compression ratio? (c) If the top 20 singular values capture 95% of the Frobenius energy, what is the relative error?',
      steps: [
        { explanation: 'Original storage: $200 \\times 300 = 60000$ numbers.' },
        { explanation: 'Rank-20 SVD storage: $U_{200\\times 20}$ + $\\Sigma_{20\\times 20}$ (20 values) + $V_{300\\times 20}$. Total: $200\\cdot20 + 20 + 300\\cdot20 = 4000 + 20 + 6000 = 10020$ numbers.' },
        { explanation: 'Compression ratio: $60000 / 10020 \\approx 6:1$ (store 6x fewer numbers).' },
        { explanation: 'Relative error: if top 20 singular values capture 95% of energy, then $\\sum_{i=1}^{20}\\sigma_i^2/\\sum_{i=1}^{200}\\sigma_i^2 = 0.95$. By Eckart-Young: $\\|A-A_{20}\\|_F^2/\\|A\\|_F^2 = 1-0.95 = 0.05$. Relative error $= \\sqrt{0.05} \\approx 22\\%$ — the image looks slightly blurry but recognizable.' },
        { explanation: 'If you want 1% relative error: need $\\sum_{i>k}\\sigma_i^2/\\|A\\|_F^2 \\leq 0.0001$, i.e., capture 99.99% of energy. The required $k$ depends on how fast singular values decay — natural images typically need $k\\approx 50$-$100$ for near-lossless quality.' },
      ],
    },
    {
      id: 'ex-la4-009-3',
      title: 'Soft-thresholded SVD for nuclear norm minimization',
      problem: 'Apply soft-thresholding with $\\lambda = 2$ to $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$ (already diagonal = SVD). Compute the nuclear-norm-regularized solution and compare to the Eckart-Young rank-1 approximation.',
      steps: [
        { explanation: 'SVD of $A$: already diagonal, $\\sigma_1=3$, $\\sigma_2=1$, $U=V=I$.' },
        { explanation: 'Soft-threshold with $\\lambda=2$: $\\max(\\sigma_i-\\lambda, 0)$. $\\sigma_1-2=1>0$ ✓; $\\sigma_2-1=0$ (wait: $1-2=-1<0$, so $\\max(-1,0)=0$).' },
        { explanation: 'Soft-thresholded approximation: $B = \\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$ (rank 1). Nuclear norm of $B$: $\\|B\\|_* = 1$.' },
        { explanation: 'Compare to Eckart-Young rank-1 (hard threshold): keep $\\sigma_1=3$, set $\\sigma_2=0$. Hard threshold gives $A_1 = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$. Eckart-Young minimizes $\\|A-B\\|_F$ over rank-1 matrices — the answer is $A_1$ with $\\|A-A_1\\|_F=1$. Soft threshold minimizes $\\|A-B\\|_F^2+2\\|B\\|_*$ — a different (convex) objective, giving a shrunken approximation.' },
        { explanation: 'Takeaway: hard threshold (Eckart-Young) gives the best rank-$k$ approximation for a fixed rank budget. Soft threshold (nuclear norm) is the convex relaxation — it automatically chooses the rank based on $\\lambda$, allowing $\\lambda$ to be tuned by cross-validation.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la4-009-1',
      title: 'When does rank-k perfectly reconstruct?',
      difficulty: 'medium',
      prompt: 'Prove that $A_k = A$ (the rank-$k$ approximation equals $A$ exactly) if and only if rank$(A) \\leq k$.',
      hint: 'Use the SVD expansion $A = \\sum_{i=1}^r \\sigma_i u_i v_i^\\top$ and the definition $A_k = \\sum_{i=1}^k \\sigma_i u_i v_i^\\top$.',
      solution: '($\\Rightarrow$) If rank$(A) \\leq k$, then $A = \\sum_{i=1}^r \\sigma_i u_i v_i^\\top$ with $r \\leq k$. So $A_k = \\sum_{i=1}^{\\min(r,k)}\\sigma_i u_i v_i^\\top = \\sum_{i=1}^r \\sigma_i u_i v_i^\\top = A$. ($\\Leftarrow$) If $A_k = A$, then $A = A_k$ has rank $\\leq k$ (since $A_k$ is a sum of $k$ rank-1 matrices). Therefore rank$(A) \\leq k$.',
    },
  ],

  mentalModel: [
    'Best rank-$k$: keep top $k$ terms of SVD, discard the rest. Error $= \\sigma_{k+1}$ (in 2-norm).',
    'Eckart-Young: $A_k$ is optimal for BOTH 2-norm and Frobenius simultaneously.',
    'Energy = $\\sum\\sigma_i^2$. Fraction captured by rank-$k$: $\\sum_{i\\leq k}\\sigma_i^2 / \\sum_i \\sigma_i^2$.',
    'Storage: $k(m+n+1)$ vs $mn$ original. Compression ratio $mn/(k(m+n))$.',
    'Soft threshold (nuclear norm) = convex relaxation of rank; hard threshold = exact rank constraint.',
  ],

  checkpoints: [
    { id: 'cp-la4-009-1', label: 'Read the concrete rank-1 approximation example with numbers', type: 'read' },
    { id: 'cp-la4-009-2', label: 'Read the Eckart-Young theorem statement', type: 'read' },
    { id: 'cp-la4-009-3', label: 'Read the compression ratio and energy fraction formulas', type: 'read' },
    { id: 'cp-la4-009-4', label: 'Compute truncated SVD approximations and errors in notebook', type: 'lab' },
    { id: 'cp-la4-009-5', label: 'Analyze the structured image compression experiment', type: 'lab' },
    { id: 'cp-la4-009-6', label: 'Trace the explicit rank-1 approximation calculation', type: 'example' },
    { id: 'cp-la4-009-7', label: 'Trace the image compression ratio and error example', type: 'example' },
    { id: 'cp-la4-009-8', label: 'Prove when rank-k approximation exactly equals A', type: 'challenge' },
  ],

  assessment: 'For $A = \\begin{pmatrix}4&0&0\\\\0&2&0\\\\0&0&0.1\\end{pmatrix}$: (a) compute the rank-1 and rank-2 approximations; (b) compute the approximation errors in both 2-norm and Frobenius norm; (c) what percentage of Frobenius energy does rank-2 capture?',

  quiz: [
    {
      id: 'q-la4-009-1',
      type: 'choice',
      text: 'The Eckart-Young theorem says the best rank-$k$ approximation (in 2-norm) has error equal to:',
      options: ['$\\sigma_k$', '$\\sigma_{k+1}$', '$\\sigma_1 - \\sigma_k$', '$\\sum_{i>k}\\sigma_i$'],
      answer: '$\\sigma_{k+1}$',
      hints: ['Discarding singular values $\\sigma_{k+1},\\ldots,\\sigma_r$ introduces an error equal to the largest discarded one.', 'In 2-norm: error = largest remaining singular value after discarding.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-2',
      type: 'choice',
      text: 'The Frobenius error $\\|A - A_k\\|_F$ equals:',
      options: ['$\\sigma_{k+1}$', '$\\sum_{i>k}\\sigma_i$', '$\\sqrt{\\sum_{i>k}\\sigma_i^2}$', '$\\sigma_r$'],
      answer: '$\\sqrt{\\sum_{i>k}\\sigma_i^2}$',
      hints: ['Frobenius norm squared = sum of squared singular values.', '$\\|A-A_k\\|_F^2 = $ sum of DISCARDED singular values squared.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-3',
      type: 'choice',
      text: 'For $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$, the best rank-1 approximation $A_1$ is:',
      options: ['$\\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$', '$\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$', '$\\begin{pmatrix}2&0\\\\0&2\\end{pmatrix}$', '$\\begin{pmatrix}0&0\\\\0&1\\end{pmatrix}$'],
      answer: '$\\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$',
      hints: ['SVD: $A$ is already diagonal. Keep top singular value $\\sigma_1=3$.', '$A_1 = 3\\cdot e_1 e_1^\\top = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-4',
      type: 'choice',
      text: 'For a $200\\times 300$ matrix approximated by rank-20, how many numbers are stored (approximately)?',
      options: ['$60000$', '$6000$', '$10000$', '$1000$'],
      answer: '$10000$',
      hints: ['$U$ (200×20) + 20 singular values + $V$ (300×20).', '$4000 + 20 + 6000 = 10020 \\approx 10000$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la4-009-5',
      type: 'choice',
      text: 'If the top 5 singular values of $A$ capture 90% of its Frobenius energy, the relative error $\\|A-A_5\\|_F/\\|A\\|_F$ is:',
      options: ['$0.1$', '$\\sqrt{0.1} \\approx 0.316$', '$0.9$', '$0.01$'],
      answer: '$\\sqrt{0.1} \\approx 0.316$',
      hints: ['Relative squared error = 1 - (fraction captured) = 0.1.', 'Relative error = $\\sqrt{0.1}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-6',
      type: 'choice',
      text: 'The rank-$k$ approximation $A_k = A$ exactly when:',
      options: ['$k \\geq 1$', '$k = $ rank$(A)$', 'rank$(A) \\leq k$', '$\\sigma_{k+1} = \\sigma_k$'],
      answer: 'rank$(A) \\leq k$',
      hints: ['If $A$ has rank $r \\leq k$, all $r$ nonzero singular values are kept.', 'The discarded singular values $\\sigma_{k+1},\\ldots$ are all zero, so the error is zero.'],
      reviewSection: 'challenges',
    },
    {
      id: 'q-la4-009-7',
      type: 'choice',
      text: 'The nuclear norm $\\|A\\|_* = \\sum_i \\sigma_i$ is important because:',
      options: [
        'It equals the rank of $A$',
        'It is the convex relaxation of the rank function',
        'It equals the Frobenius norm squared',
        'It measures the condition number',
      ],
      answer: 'It is the convex relaxation of the rank function',
      hints: ['Rank is non-convex and NP-hard to optimize.', 'The nuclear norm provides a convex surrogate that can be minimized efficiently.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-009-8',
      type: 'choice',
      text: 'In recommendation systems, the "matrix completion" problem works because:',
      options: [
        'User-item rating matrices are usually full rank',
        'The rating matrix is approximately low-rank (users and items cluster)',
        'Missing entries are always zero',
        'The singular values are all equal',
      ],
      answer: 'The rating matrix is approximately low-rank (users and items cluster)',
      hints: ['Users group into types (action fans, rom-com fans...) and items into genres.', 'A few "user types" × "item types" interactions explain most ratings — low rank.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la4-009-9',
      type: 'choice',
      text: 'The Eckart-Young theorem guarantees $A_k$ is best for:',
      options: ['Only the 2-norm', 'Only the Frobenius norm', 'Both 2-norm and Frobenius norm simultaneously', 'The 1-norm'],
      answer: 'Both 2-norm and Frobenius norm simultaneously',
      hints: ['This is what makes the theorem powerful.', 'The same $A_k$ is simultaneously optimal for both the 2-norm and Frobenius norm.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-10',
      type: 'choice',
      text: 'Soft-thresholding singular values by $\\lambda$ (setting $\\sigma_i \\to \\max(\\sigma_i-\\lambda,0)$) solves:',
      options: [
        'Minimizing rank$(B)$ subject to $\\|A-B\\|_F \\leq \\epsilon$',
        'Minimizing $\\|A-B\\|_F^2 + \\lambda\\|B\\|_*$ (nuclear norm regularization)',
        'Finding the best rank-$k$ approximation for $k=\\lambda$',
        'Minimizing the condition number of $B$',
      ],
      answer: 'Minimizing $\\|A-B\\|_F^2 + \\lambda\\|B\\|_*$ (nuclear norm regularization)',
      hints: ['Nuclear norm = convex relaxation of rank. Adding $\\lambda\\|B\\|_*$ promotes low rank.', 'Soft thresholding is the proximal operator of the nuclear norm.'],
      reviewSection: 'math',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given a matrix with known singular values, compute the rank-$k$ approximation error in both 2-norm and Frobenius norm; determine the compression ratio; and find the minimum $k$ needed to capture a given fraction of total energy.',
    explainVerbally: 'Explain why the Eckart-Young theorem works: why keeping the top $k$ singular values simultaneously minimizes both norms, and why the error equals $\\sigma_{k+1}$.',
    detectIncorrectApplication: 'Catch the error of thinking rank-$k$ approximation always gives small relative error — if singular values decay slowly, even high-rank approximations may be poor.',
    transferToUnfamiliar: 'Given a new data matrix, identify whether its singular values decay quickly (low-rank structure present) or slowly (no compressible structure), and explain what this means for data compression and model complexity.',
  },

  misconceptions: [
    {
      falseBelief: 'The best rank-$k$ approximation in the Frobenius norm is different from the best in the 2-norm.',
      whyStudentsThinkIt: 'Different norms usually lead to different optima. For vector problems, $\\ell^1$ and $\\ell^2$ minimizers are different. Students expect the same for matrices.',
      correctionExample: 'For $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$, the best rank-1 in 2-norm: $A_1 = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$, error $= 1$. The best rank-1 in Frobenius: also $A_1 = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$, error $= 1$. Same answer.',
      contrastCase: 'This is unique to the SVD truncation. The Eckart-Young theorem says the SAME $A_k$ minimizes both simultaneously — a remarkable property with no analog in vector optimization.',
    },
    {
      falseBelief: 'You can always recover the original matrix from a low-rank approximation with enough computation.',
      whyStudentsThinkIt: 'Compression seems reversible — like a zip file. Students think "approximation" means the original is still there somewhere.',
      correctionExample: 'The discarded singular values ($\\sigma_{k+1},\\ldots,\\sigma_r$) and their corresponding singular vectors are THROWN AWAY. The information in those components is lost. Even with infinite computation, you cannot recover $A$ from $A_k$ when rank$(A) > k$.',
      contrastCase: 'Lossless compression (like zip/gzip) stores the exact original. SVD truncation is LOSSY — the $\\sigma_{k+1}$ error is unavoidable. The Eckart-Young theorem guarantees you cannot do better than $A_k$ within the rank-$k$ constraint.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A recommender system has a 500,000 user × 100,000 movie rating matrix, but only 1% of entries are observed. How does low-rank structure make this tractable?',
      competingTechniques: ['Try to fill in the matrix by interpolation', 'Model the matrix as low-rank (say rank 50): 50 "user taste" vectors × 50 "movie profile" vectors'],
      whyThisTechniqueWins: 'A rank-50 matrix has only $50\\times(500000+100000) = 30$ million parameters vs $50$ billion entries. The low-rank assumption converts a hopelessly under-determined problem into an over-determined one. Nuclear norm minimization or alternating least squares can recover the rank-50 matrix from the 1% observations under incoherence conditions.',
    },
    {
      situation: 'A high-dimensional dynamical system (e.g., fluid simulation on a $10^6$-node mesh) needs to be simulated over time. The state at each time is a $10^6$-dimensional vector. How does low-rank approximation help?',
      competingTechniques: ['Simulate the full $10^6$-dimensional system at each timestep', 'Find the top $k$ POD (proper orthogonal decomposition) modes, reduce to $k$-dimensional system'],
      whyThisTechniqueWins: 'If the snapshots matrix (each column = one timestep) has rapidly decaying singular values, the dynamics live in a low-dimensional subspace. Projecting the PDE onto this subspace gives a $k \\times k$ system that is thousands of times cheaper to simulate, with errors bounded by the discarded singular values.',
    },
  ],

  debugging: [
    {
      commonError: 'Confusing the Frobenius error formula: using $\\sigma_{k+1}$ instead of $\\sqrt{\\sum_{i>k}\\sigma_i^2}$.',
      symptom: 'Student reports Frobenius error $= \\sigma_{k+1}$ (the 2-norm error), not the Frobenius error.',
      whyItHappened: 'The 2-norm error equals $\\sigma_{k+1}$ (the largest discarded value). The Frobenius error is larger: all discarded singular values contribute. Students copy the 2-norm formula for both.',
      repairStrategy: 'Remember: 2-norm error = $\\sigma_{k+1}$ (single term). Frobenius error = $\\sqrt{\\sigma_{k+1}^2 + \\sigma_{k+2}^2 + \\cdots + \\sigma_r^2}$ (sum of all discarded, square-rooted). Frobenius error $\\geq$ 2-norm error always.',
    },
    {
      commonError: 'Computing storage for rank-$k$ as $k$ numbers instead of $k(m+n+1)$.',
      symptom: 'Student says "rank-5 approximation stores 5 numbers" — forgetting that each rank-1 term $\\sigma_i u_i v_i^\\top$ requires $m + 1 + n$ numbers.',
      whyItHappened: 'Rank is just a number $k$, and students conflate the rank with the number of parameters needed to specify the approximation.',
      repairStrategy: 'Each rank-1 term needs: $m$ numbers for $u_i$, $1$ for $\\sigma_i$, $n$ for $v_i$. Total for rank-$k$: $k(m+1+n)$ numbers. Compression only helps when $k(m+n+1) < mn$, i.e., $k < mn/(m+n+1) \\approx \\min(m,n)/2$ (roughly).',
    },
  ],
};
