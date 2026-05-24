export default {
  id: 'la8-002',
  slug: 'markov-pagerank',
  chapter: 'la8',
  order: 2,
  title: 'Markov Chains and PageRank',
  subtitle: 'Google\'s PageRank algorithm is an eigenvector computation on a billion-dimensional stochastic matrix. The stationary distribution of any Markov chain is the eigenvector for eigenvalue 1.',
  tags: ['Markov chain', 'PageRank', 'stochastic matrix', 'stationary distribution', 'power method', 'Perron-Frobenius', 'random walk', 'HITS'],
  aliases: 'Markov chain PageRank stochastic matrix stationary distribution power method Perron Frobenius random walk HITS Google eigenvector',

  hook: {
    question: "How does Google decide which web pages are most important? The answer is linear algebra: the importance of a page is the eigenvector component corresponding to eigenvalue 1 of the web\'s link matrix.",
    realWorldContext: "PageRank (1998, Brin and Page) turned web search into an eigenvalue problem. The web graph has ~5 billion pages — the 'importance' of each page is the stationary distribution of a random walk on this graph. Power iteration (repeatedly multiply by the matrix) converges to the dominant eigenvector. Beyond search: Markov chains model protein folding, financial market transitions, disease spread, recommendation systems (Markov collaborative filtering), natural language models (n-gram transition matrices), and queuing systems in operations research.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Markov chains.** A finite Markov chain has $n$ states and a **transition matrix** $P$ (row-stochastic: all entries $\\geq 0$, each row sums to 1). $P_{ij}$ = probability of going from state $i$ to state $j$. The distribution after $k$ steps: $\\boldsymbol{\\pi}_k = \\boldsymbol{\\pi}_0 P^k$ (if distributions are row vectors). A **stationary distribution** satisfies $\\boldsymbol{\\pi} P = \\boldsymbol{\\pi}$ (or equivalently $P^\\top \\boldsymbol{\\pi}^\\top = \\boldsymbol{\\pi}^\\top$) — it is an eigenvector of $P^\\top$ for eigenvalue 1.',
      '**Perron-Frobenius theorem.** For an irreducible (every state reachable from every other) and aperiodic Markov chain: (1) eigenvalue 1 exists and has multiplicity 1; (2) all other eigenvalues satisfy $|\\lambda| < 1$; (3) the unique stationary distribution $\\boldsymbol{\\pi}$ has all positive entries; (4) $\\boldsymbol{\\pi}_0 P^k \\to \\boldsymbol{\\pi}$ for any starting distribution.',
      '**PageRank.** The original PageRank treats the web as a directed graph. For a page $i$ with out-links to pages $j_1, \\ldots, j_k$: column $i$ of the column-stochastic link matrix has $1/k$ in rows $j_1, \\ldots, j_k$. To ensure irreducibility and aperiodicity, add a "teleportation" probability $\\alpha$ (typically 0.85): $G = \\alpha M + (1-\\alpha) \\mathbf{e}\\mathbf{e}^\\top/n$ (the "Google matrix"). The PageRank vector is the dominant eigenvector of $G$.',
      '**Power iteration.** The algorithm: start with uniform $\\mathbf{r} = \\mathbf{e}/n$, iterate $\\mathbf{r} \\leftarrow G\\mathbf{r}$, stop when $\\|\\mathbf{r}_{k+1} - \\mathbf{r}_k\\|_1 < \\varepsilon$. Convergence rate is $|\\lambda_2|^k$ per iteration. With $\\alpha = 0.85$, $|\\lambda_2| \\leq 0.85$ so convergence is fast.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Perron-Frobenius Theorem (Markov Version)',
        body: 'For an irreducible aperiodic stochastic matrix $P$:\n1. $\\lambda_1 = 1$ is a simple eigenvalue\n2. All other eigenvalues satisfy $|\\lambda_i| < 1$\n3. Unique stationary distribution $\\boldsymbol{\\pi} > 0$ with $\\boldsymbol{\\pi}^\\top \\mathbf{1} = 1$\n4. $P^k \\to \\mathbf{1}\\boldsymbol{\\pi}^\\top$ as $k \\to \\infty$ (every row of $P^k$ converges to $\\boldsymbol{\\pi}$)',
      },
      {
        type: 'insight',
        title: 'Spectral Gap Controls Mixing Time',
        body: 'The **spectral gap** $1 - |\\lambda_2|$ controls how fast the chain mixes.\n\nLarge spectral gap $\\Rightarrow$ fast convergence to stationary distribution.\nSmall spectral gap $\\Rightarrow$ slow mixing ("torpid mixing").\n\nFor PageRank with teleportation $\\alpha = 0.85$: spectral gap $\\geq 0.15$, so convergence in $\\sim 50$ iterations.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Markov Chains and Power Iteration',
        mathBridge: 'Simulate a Markov chain and compute the stationary distribution via power iteration.',
        caption: 'Power method: repeatedly multiply by the stochastic matrix until convergence.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Weather Markov chain',
              prose: ['Model sunny/cloudy/rainy weather with transition matrix. Find stationary distribution.'],
              code: `% Transition matrix P: P(i,j) = prob of going to state j from state i
% States: 1=Sunny, 2=Cloudy, 3=Rainy
P = [0.7 0.2 0.1;
     0.3 0.4 0.3;
     0.2 0.3 0.5]
disp('Row sums (should all be 1):')
sum(P, 2)

% Stationary distribution: left eigenvector for eigenvalue 1 of P
% = right eigenvector for eigenvalue 1 of P'
[V, D] = eig(P')
disp('Eigenvalues of P^T:')
diag(D)
% Find eigenvalue closest to 1
[~, idx] = min(abs(diag(D) - 1))
pi_stat = abs(V(:, idx))
pi_stat = pi_stat / sum(pi_stat)  % normalize
disp('Stationary distribution [Sunny, Cloudy, Rainy]:')
pi_stat
`,
            },
            {
              id: 2,
              cellTitle: 'Power iteration for PageRank',
              prose: ['Compute PageRank for a small web graph via power iteration.'],
              code: `% Small web graph: 5 pages
% Column-stochastic link matrix (column j = where page j links to)
M = [0   0   0   1/2 0;
     1/2 0   0   0   0;
     1/2 0   0   1/2 0;
     0   1   1/2 0   1;
     0   0   1/2 0   0]
% Verify column sums = 1
disp('Column sums:')
sum(M, 1)

% Google matrix with teleportation alpha = 0.85
n = 5; alpha = 0.85
G = alpha * M + (1-alpha)/n * ones(n,n)

% Power iteration
r = ones(n,1) / n
for k = 1:100
    r_new = G * r
    if norm(r_new - r, 1) < 1e-9
        disp(['Converged at iteration ', num2str(k)])
        break
    end
    r = r_new
end
disp('PageRank scores:')
r
[sorted, order] = sort(r, 'descend')
disp('Ranking (1=best):')
order
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**The mixing time.** The total variation distance from $\\boldsymbol{\\pi}_0 P^k$ to the stationary distribution $\\boldsymbol{\\pi}$ satisfies: $d_{TV}(\\boldsymbol{\\pi}_0 P^k, \\boldsymbol{\\pi}) \\leq C \\cdot |\\lambda_2|^k$. The **mixing time** $\\tau_\\varepsilon = \\min\\{k : d_{TV} \\leq \\varepsilon\\}$ scales as $\\tau_\\varepsilon \\sim \\frac{\\log(C/\\varepsilon)}{\\log(1/|\\lambda_2|)}$. A chain is rapidly mixing if $\\tau_\\varepsilon = \\text{poly}(\\log n)$ — guaranteed if the spectral gap is bounded away from 0.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'HITS Algorithm',
        body: 'HITS (Hyperlink-Induced Topic Search, Kleinberg 1999) computes two scores per page: **authority** (cited by good hubs) and **hub** (cites good authorities). Authority vector = dominant eigenvector of $A^\\top A$; hub vector = dominant eigenvector of $A A^\\top$ (where $A$ is the adjacency matrix). These are the right and left singular vectors of $A$ — SVD again!',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Detailed balance.** A Markov chain satisfies **detailed balance** if $\\pi_i P_{ij} = \\pi_j P_{ji}$ for all $i, j$. If so, $\\boldsymbol{\\pi}$ is the stationary distribution. Detailed balance means the chain is reversible (time-reversal looks the same). Symmetric random walks on graphs satisfy detailed balance with $\\pi_i \\propto \\deg(i)$. MCMC (Markov Chain Monte Carlo) designs chains satisfying detailed balance with the desired distribution.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Markov Chain Monte Carlo (MCMC)',
        body: 'MCMC constructs a Markov chain whose stationary distribution is the target distribution $p(x)$ (e.g., a Bayesian posterior). Metropolis-Hastings and Gibbs sampling are the standard algorithms. The chain mixes to $p(x)$ after enough steps. Rate of convergence = spectral gap. Linear algebra (eigenvalue analysis) tells you whether MCMC will be practical.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la8-002-1',
      title: 'Two-state Markov chain',
      problem: 'Find the stationary distribution of $P = \\begin{bmatrix}0.8&0.2\\\\0.4&0.6\\end{bmatrix}$.',
      solution: '$\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ with $\\pi_1 + \\pi_2 = 1$: $0.8\\pi_1 + 0.4\\pi_2 = \\pi_1 \\Rightarrow 0.4\\pi_2 = 0.2\\pi_1 \\Rightarrow \\pi_1 = 2\\pi_2$. With $\\pi_1 + \\pi_2 = 1$: $\\pi = (2/3, 1/3)$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la8-002-1',
      title: 'Teleportation effect',
      difficulty: 'medium',
      prompt: 'Why does PageRank add the teleportation term $(1-\\alpha)/n \\cdot \\mathbf{1}\\mathbf{1}^\\top$? What problem does it solve?',
      hint: 'Consider pages with no out-links ("dangling nodes") and isolated components.',
      solution: 'Two problems: (1) Dangling nodes — pages with no out-links make the matrix not column-stochastic. (2) Reducibility — pages in disconnected components have no way to transfer rank. Teleportation adds probability $(1-\\alpha)$ of jumping to any random page, making the Google matrix fully dense, irreducible, and aperiodic — guaranteeing a unique stationary distribution.',
    },
  ],

  mentalModel: [
    'Markov chain: stochastic matrix $P$. Distribution after $k$ steps: $\\boldsymbol{\\pi}_0 P^k$.',
    'Stationary distribution: $\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ — eigenvector of $P^\\top$ for eigenvalue 1.',
    'Perron-Frobenius: irreducible aperiodic chain has a unique positive stationary distribution.',
    'PageRank = stationary distribution of random walk with teleportation. Power iteration converges.',
    'Spectral gap $(1 - |\\lambda_2|)$ controls mixing speed.',
  ],

  checkpoints: [
    { id: 'cp-la8-002-1', question: 'What is the stationary distribution of a Markov chain?', answer: 'The probability vector $\\boldsymbol{\\pi}$ satisfying $\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ (row vector) — the left eigenvector of $P$ for eigenvalue 1.' },
    { id: 'cp-la8-002-2', question: 'What does the spectral gap control?', answer: 'How fast the chain mixes (converges to stationarity). Larger gap = faster convergence.' },
    { id: 'cp-la8-002-3', question: 'Why does PageRank need the teleportation parameter?', answer: 'To handle dangling nodes and ensure irreducibility and aperiodicity, guaranteeing a unique stationary distribution.' },
  ],

  assessment: 'Model a 3-state Markov chain (e.g., states A, B, C) with a transition matrix of your choice. Verify it is row-stochastic, compute the stationary distribution analytically and via power iteration, and check they agree.',

  quiz: [
    { id: 'q-la8-002-1', question: 'The stationary distribution $\\boldsymbol{\\pi}$ of a Markov chain satisfies:', options: ['$P\\boldsymbol{\\pi} = \\mathbf{0}$', '$\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ (row vector)', '$P^\\top \\boldsymbol{\\pi} = \\mathbf{0}$', '$\\det(P - I) = \\pi$'], answer: '$\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ (row vector)' },
    { id: 'q-la8-002-2', question: 'Power iteration for PageRank converges at rate:', options: ['$|\\lambda_2|^k$ per iteration', '$1/k$', '$e^{-k}$', '$\\sigma_1^k$'], answer: '$|\\lambda_2|^k$ per iteration' },
    { id: 'q-la8-002-3', question: 'The HITS algorithm computes authority scores as:', options: ['Dominant eigenvector of $A$', 'Dominant eigenvector of $A^\\top A$', 'Dominant singular value of $A$', 'Null space of $A$'], answer: 'Dominant eigenvector of $A^\\top A$' },
  ],
};
