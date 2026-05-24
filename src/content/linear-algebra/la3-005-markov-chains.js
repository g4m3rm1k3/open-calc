export default {
  id: 'la3-005',
  slug: 'markov-chains',
  chapter: 'la3',
  order: 5,
  title: 'Markov Chains and Steady States',
  subtitle: 'Stochastic matrices model probabilistic transitions — and after enough steps, every starting distribution converges to the same steady state. That state is an eigenvector with eigenvalue 1.',
  tags: ['Markov chain', 'stochastic matrix', 'steady state', 'transition matrix', 'PageRank', 'power method', 'stationary distribution', 'eigenvalue 1'],
  aliases: 'Markov chain stochastic matrix steady state transition matrix PageRank power method stationary distribution probability eigenvalue',

  hook: {
    question: "If you start a random process (weather, web surfing, genetics) and let it run forever, where does it end up? And does it matter where it started?",
    realWorldContext: "Markov chains are everywhere. Google\'s PageRank algorithm models a random web surfer who clicks links at random — the steady-state distribution of which pages they visit determines each page\'s rank. Speech recognition uses Hidden Markov Models to decode audio into words. Population geneticists use Markov chains to model allele frequencies drifting across generations. Financial models use them to predict credit ratings. In all cases, the key insight is the same: there is a long-run equilibrium that is determined entirely by the transition structure — not the starting point.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**What is a Markov chain?** A Markov chain describes a system that jumps between states over time, where the probability of jumping from state $i$ to state $j$ depends only on the current state (not the history). This "memoryless" property is the Markov property. The transition probabilities are encoded in a matrix.',
      '**Transition matrix.** For a system with $n$ states, the transition matrix $P$ has $P_{ij} = $ probability of moving from state $j$ to state $i$ (column-stochastic convention). Each column sums to 1 (all probability from state $j$ must go somewhere). A column vector $\\mathbf{x}$ where $x_i \\geq 0$ and $\\sum x_i = 1$ represents a probability distribution over states.',
      '**Matrix-vector product = one time step.** If $\\mathbf{x}_t$ is the distribution at time $t$, then $\\mathbf{x}_{t+1} = P\\mathbf{x}_t$. After $k$ steps: $\\mathbf{x}_k = P^k \\mathbf{x}_0$. As $k \\to \\infty$, the distribution often converges to a **steady state** $\\mathbf{q}$ satisfying $P\\mathbf{q} = \\mathbf{q}$ — an eigenvector of $P$ with eigenvalue 1.',
      '**Why eigenvalue 1 always exists.** For any column-stochastic matrix, the vector of all ones $\\mathbf{1}$ satisfies $P^\\top \\mathbf{1} = \\mathbf{1}$ (each row of $P^\\top$ sums to 1). Therefore $P^\\top - I$ has $\\mathbf{1}$ in its null space, so $\\det(P^\\top - I) = \\det(P - I) = 0$, which means $\\lambda = 1$ is an eigenvalue of $P$. The steady-state distribution is the normalized eigenvector corresponding to $\\lambda = 1$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Perron-Frobenius Theorem (Informal)',
        body: 'For a regular stochastic matrix (all entries positive, or some power has all positive entries), there is exactly one steady-state distribution, and it is the unique normalized eigenvector for $\\lambda = 1$. Starting from ANY initial distribution, $P^k \\mathbf{x}_0 \\to \\mathbf{q}$ as $k \\to \\infty$. The starting point does not matter — you always end up at $\\mathbf{q}$.',
      },
      {
        type: 'insight',
        title: 'All Other Eigenvalues Satisfy $|\\lambda| \\leq 1$',
        body: 'For a column-stochastic matrix, all eigenvalues satisfy $|\\lambda| \\leq 1$. If $|\\lambda_2| < 1$ (the second-largest eigenvalue in magnitude), then the contribution of $\\lambda_2^k \\mathbf{v}_2$ to $P^k \\mathbf{x}_0$ shrinks exponentially. The gap $1 - |\\lambda_2|$ is the **spectral gap** — larger gap means faster convergence to steady state.',
      },
      {
        type: 'insight',
        title: 'PageRank in One Paragraph',
        body: 'Model the web as $n$ pages and a transition matrix $P$ where $P_{ij} = $ (probability surfer clicks link from page $j$ to page $i$). Add a "teleportation" probability $\\alpha$ to handle pages with no outlinks: $\\hat{P} = (1-\\alpha)P + \\alpha \\frac{\\mathbf{1}\\mathbf{1}^\\top}{n}$. The PageRank vector is the steady-state distribution $\\hat{P}\\mathbf{q} = \\mathbf{q}$. Pages with high $q_i$ are authoritative.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Markov Chain Simulation',
        mathBridge: 'Build a transition matrix, find the steady state, and simulate convergence.',
        caption: 'Any starting distribution converges to the same steady-state eigenvector.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Weather Markov chain: sunny/rainy/cloudy',
              prose: ['Columns are "from" states, rows are "to" states. Each column sums to 1.'],
              code: `% Columns: [from Sunny, from Rainy, from Cloudy]
% Rows:    [to Sunny;  to Rainy;  to Cloudy]
P = [0.7  0.3  0.4;
     0.2  0.5  0.3;
     0.1  0.2  0.3]

% Verify columns sum to 1:
col_sums = sum(P)

% Find steady state: eigenvector with eigenvalue 1
[V, D] = eig(P)
eigenvalues = diag(D)
`,
            },
            {
              id: 2,
              cellTitle: 'Power method: simulate long-run distribution',
              prose: ['Start with any distribution and multiply by P repeatedly. Watch convergence.'],
              code: `P = [0.7  0.3  0.4; 0.2  0.5  0.3; 0.1  0.2  0.3]

% Start from: all in Sunny state
x = [1; 0; 0]
disp('x0 ='); x

x = P * x
disp('x1 (after 1 step):'); x

for k = 2:20
  x = P * x;
end
disp('x20 (after 20 steps):'); x

% Extract normalized eigenvector for lambda=1
[V, D] = eig(P)
idx = find(abs(diag(D) - 1) < 1e-9);
q = V(:, idx);
q = q / sum(q)
disp('Steady-state distribution q:'); q
`,
            },
            {
              id: 3,
              cellTitle: 'Convergence speed: spectral gap',
              prose: ['The second eigenvalue controls how quickly the chain converges.'],
              code: `P = [0.7  0.3  0.4; 0.2  0.5  0.3; 0.1  0.2  0.3]
[V, D] = eig(P)
lambdas = sort(abs(diag(D)), 'descend')
disp('Eigenvalues (sorted by magnitude):')
lambdas
spectral_gap = 1 - lambdas(2)
disp('Spectral gap (bigger = faster convergence):')
spectral_gap
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Formal definition.** A matrix $P$ is **column-stochastic** if all entries are non-negative and each column sums to 1: $P_{ij} \\geq 0$ for all $i,j$, and $\\mathbf{1}^\\top P = \\mathbf{1}^\\top$. A probability vector $\\mathbf{x}$ satisfies $x_i \\geq 0$ and $\\sum x_i = 1$. Stochastic matrices preserve probability vectors: if $\\mathbf{x}$ is a probability vector, so is $P\\mathbf{x}$.',
      '**Existence of eigenvalue 1.** Since $P^\\top \\mathbf{1} = \\mathbf{1}$ (row sums of $P^\\top$ = column sums of $P = 1$), $\\mathbf{1}$ is an eigenvector of $P^\\top$ for $\\lambda = 1$. Since $P$ and $P^\\top$ have the same characteristic polynomial, $\\lambda = 1$ is also an eigenvalue of $P$. The corresponding left eigenvector is $\\mathbf{1}^\\top$.',
      '**Convergence.** Expand $\\mathbf{x}_0$ in the eigenbasis of $P$: $\\mathbf{x}_0 = c_1 \\mathbf{q} + \\sum_{k \\geq 2} c_k \\mathbf{v}_k$. Then $P^n \\mathbf{x}_0 = c_1 \\mathbf{q} + \\sum_{k \\geq 2} c_k \\lambda_k^n \\mathbf{v}_k$. If $|\\lambda_k| < 1$ for all $k \\geq 2$, the sum vanishes and $P^n \\mathbf{x}_0 \\to c_1 \\mathbf{q}$. Since both $\\mathbf{x}_0$ and $\\mathbf{q}$ are probability vectors, $c_1 = 1$ and $P^n \\mathbf{x}_0 \\to \\mathbf{q}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Perron-Frobenius (Matrix Form)',
        body: 'If $P$ is a column-stochastic matrix with all positive entries, then:\n1. $\\lambda = 1$ is a simple eigenvalue (multiplicity 1)\n2. All other eigenvalues satisfy $|\\lambda| < 1$\n3. There is a unique steady-state distribution $\\mathbf{q} > 0$\n4. For any probability vector $\\mathbf{x}_0$: $P^n \\mathbf{x}_0 \\to \\mathbf{q}$',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Ergodicity.** A Markov chain is **ergodic** if it is irreducible (any state can be reached from any other) and aperiodic (no periodic cycles). Ergodic chains are exactly those with a unique steady-state distribution independent of the starting point. Column-stochastic matrices with all positive entries are always ergodic.',
      '**Mixing time.** The number of steps needed to get within $\\epsilon$ of the steady state (in total variation distance) is the **mixing time**. It is determined by the spectral gap: mixing time $\\approx 1/(1 - |\\lambda_2|)$. Slow mixing in Markov Chain Monte Carlo (MCMC) algorithms is a major computational bottleneck in Bayesian statistics.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Left vs Right Eigenvectors',
        body: 'Column-stochastic: $P\\mathbf{q} = \\mathbf{q}$ — the steady state is a right eigenvector.\nRow-stochastic ($P^\\top$ convention): steady state satisfies $\\mathbf{q}^\\top P = \\mathbf{q}^\\top$ — it\'s a left eigenvector.\nBoth conventions appear in the literature. This course uses column-stochastic.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la3-005-1',
      title: 'Two-state weather chain',
      problem: 'Transition matrix $P = \\begin{bmatrix}0.9 & 0.4\\\\ 0.1 & 0.6\\end{bmatrix}$ (columns = "from" state). Find the steady-state distribution.',
      solution: 'Solve $(P - I)\\mathbf{q} = \\mathbf{0}$ with $q_1 + q_2 = 1$. $P - I = \\begin{bmatrix}-0.1 & 0.4\\\\0.1 & -0.4\\end{bmatrix}$. Null space: $0.1 q_2 = 0.4 q_1 \\Rightarrow q_2 = 4q_1$. Normalizing: $q_1 = 0.2, q_2 = 0.8$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la3-005-1',
      title: 'PageRank on a small web',
      difficulty: 'medium',
      prompt: 'Three pages: A links to B and C, B links to C, C links to A. Build the column-stochastic transition matrix and find the PageRank distribution.',
      hint: 'Each page distributes its probability equally among its outlinks.',
      solution: '$P = \\begin{bmatrix}0&0&1\\\\1/2&0&0\\\\1/2&1&0\\end{bmatrix}$. Solve $P\\mathbf{q} = \\mathbf{q}$ with $\\mathbf{1}^\\top \\mathbf{q} = 1$. Result: $q_A = 2/5, q_B = 1/5, q_C = 2/5$.',
    },
  ],

  mentalModel: [
    'Transition matrix $P$: each column is a probability distribution of "where do I go from here?"',
    'Steady state $\\mathbf{q}$: the unique eigenvector of $P$ with eigenvalue 1 (normalized to sum to 1).',
    'Power iteration: $P^k \\mathbf{x}_0 \\to \\mathbf{q}$ regardless of starting point (for regular chains).',
    'Spectral gap $= 1 - |\\lambda_2|$: bigger gap means faster convergence.',
  ],

  checkpoints: [
    { id: 'cp-la3-005-1', question: 'What property makes a matrix column-stochastic?', answer: 'All entries non-negative; each column sums to 1.' },
    { id: 'cp-la3-005-2', question: 'Why does every column-stochastic matrix have eigenvalue 1?', answer: 'Because $\\mathbf{1}^\\top P = \\mathbf{1}^\\top$, so $\\lambda = 1$ is a left eigenvalue, and therefore also a right eigenvalue.' },
    { id: 'cp-la3-005-3', question: 'What is the spectral gap and why does it matter?', answer: 'Gap $= 1 - |\\lambda_2|$; controls convergence rate to steady state.' },
  ],

  assessment: 'Build a 3-state Markov chain for a simplified credit rating model (AAA, BBB, Default). Find the steady-state distribution and the expected number of steps to converge from AAA.',

  quiz: [
    { id: 'q-la3-005-1', question: 'The steady-state distribution of a Markov chain is:', options: ['An eigenvalue of $P$', 'A normalized eigenvector of $P$ for $\\lambda=1$', 'The largest column of $P$', 'The trace of $P$'], answer: 'A normalized eigenvector of $P$ for $\\lambda=1$' },
    { id: 'q-la3-005-2', question: 'For a regular stochastic matrix, starting from any initial distribution:', options: ['Convergence depends on the starting point', 'The chain converges to a unique steady state', 'The chain oscillates forever', 'Convergence requires det$(P) = 1$'], answer: 'The chain converges to a unique steady state' },
    { id: 'q-la3-005-3', question: 'All eigenvalues of a column-stochastic matrix satisfy:', options: ['$\\lambda = 1$', '$\\lambda \\geq 0$', '$|\\lambda| \\leq 1$', '$\\lambda^2 \\leq 1$'], answer: '$|\\lambda| \\leq 1$' },
  ],
};
