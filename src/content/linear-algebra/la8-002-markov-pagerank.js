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
  },

  intuition: {
    prose: [
      '**Where you are in the story.** The previous lesson showed PCA turning a data science problem into an eigenvector computation. This lesson shows the same idea applied to a network: the web graph. In 1998, Larry Page and Sergey Brin noticed that the "importance" of a web page could be defined recursively — a page is important if important pages link to it. That self-referential definition is exactly an eigenvector equation. Their solution (PageRank) made Google the dominant search engine and earned them billions of dollars. The math is eigenvalues and Markov chains.',

      '**The Markov chain model.** Imagine a random web surfer: at each step they click a random link on the current page, or occasionally (with probability $1-\\alpha$) jump to a completely random page. This is a Markov chain on $n$ states (web pages). The transition matrix $P$ (column-stochastic: column $j$ contains $1/k$ in the rows linked from page $j$, where $k$ is the out-degree) encodes the probabilities. The key question: after infinitely many random steps, how often does the surfer visit each page? That fraction is the PageRank — the stationary distribution.',

      '**Concrete first: 3-page web.** Pages: 1 links to {2,3}, 2 links to {3}, 3 links to {1}. Link matrix $M = \\begin{bmatrix}0&0&1\\\\1/2&0&0\\\\1/2&1&0\\end{bmatrix}$. Start uniform: $\\mathbf{r}^{(0)} = (1/3, 1/3, 1/3)^\\top$. After one step: $\\mathbf{r}^{(1)} = M\\mathbf{r}^{(0)} = (1/3, 1/6, 1/2)^\\top$. Page 3 jumps to the top because two pages link to it. After more steps, page 1 climbs because it receives all of page 3\'s rank — which is high because page 3 received from both pages 1 and 2.',

      '**Predict before reading on.** In the 3-page example, which page ends up with the highest stationary PageRank? Think about the flow of rank before computing: page 3 receives from two pages (1 and 2), then sends everything to page 1. Does that make page 1 ultimately the most important? Write your prediction.',

      '**The eigenvector equation.** The stationary distribution $\\boldsymbol{\\pi}$ satisfies $M\\boldsymbol{\\pi} = \\boldsymbol{\\pi}$ — it is an eigenvector of $M$ with eigenvalue 1. By the Perron-Frobenius theorem, for any irreducible aperiodic stochastic matrix this eigenvalue-1 eigenvector is unique, positive, and all other eigenvalues satisfy $|\\lambda| < 1$. So the stationary distribution is the dominant eigenvector, and power iteration (repeatedly multiplying $\\mathbf{r} \\leftarrow M\\mathbf{r}$) converges to it.',

      '**The Google matrix: handling dangling nodes and disconnected graphs.** The raw link matrix has problems: "dangling nodes" (pages with no out-links) create rows of zeros; disconnected components prevent the surfer from reaching all pages. The fix: add a "teleportation" term. The Google matrix is $G = \\alpha M + (1-\\alpha)\\mathbf{1}\\mathbf{1}^\\top/n$ with $\\alpha \\approx 0.85$. With probability $\\alpha$ the surfer follows a link; with probability $1-\\alpha$ they jump to a uniformly random page. This makes $G$ irreducible and aperiodic, guaranteeing a unique stationary distribution.',

      '**Power iteration is cheap and scales.** The algorithm: start with $\\mathbf{r} = \\mathbf{1}/n$, repeatedly compute $\\mathbf{r} \\leftarrow G\\mathbf{r}$, stop when $\\|\\mathbf{r}_{k+1} - \\mathbf{r}_k\\|_1 < 10^{-8}$. Convergence rate is $\\alpha^k = 0.85^k$ per step — converges in about 50-100 iterations regardless of $n$. The key: you never form $G$ explicitly. You compute $G\\mathbf{r} = \\alpha M\\mathbf{r} + (1-\\alpha)\\mathbf{1}/n$ using only the sparse link matrix $M$ (about 40 non-zeros per column for the web). This runs on a billion-page web graph in minutes.',

      '**Where this is heading.** The next lesson applies eigenvalue ideas to differential equations. The connection: just as $P^k \\mathbf{r}_0$ converges to the stationary distribution as $k \\to \\infty$, the solution $e^{At} \\mathbf{x}_0$ of a linear ODE converges to zero as $t \\to \\infty$ — if the eigenvalues of $A$ have negative real parts. Stability is the ODE analogue of mixing.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 4 — Applications of Linear Algebra',
        body: '**Previous (Lesson 1):** PCA — eigenvectors of the covariance matrix reveal the directions of maximum variance.\n**This lesson:** Markov chains and PageRank — stationary distributions as dominant eigenvectors; power iteration at web scale.\n**Next (Lesson 3):** ODEs and linear systems — eigenvalues determine stability; matrix exponential gives exact solutions.',
      },
      {
        type: 'theorem',
        title: 'Perron-Frobenius Theorem (Markov Version)',
        body: 'For an irreducible aperiodic stochastic matrix $P$:\n1. $\\lambda_1 = 1$ is a simple eigenvalue\n2. All other eigenvalues: $|\\lambda_i| < 1$\n3. Unique stationary distribution $\\boldsymbol{\\pi} > 0$ with $\\sum_i \\pi_i = 1$\n4. $\\boldsymbol{\\pi}_0 P^k \\to \\boldsymbol{\\pi}$ for any starting distribution',
      },
      {
        type: 'insight',
        title: 'Spectral Gap Controls Mixing Time',
        body: 'The spectral gap $1 - |\\lambda_2|$ controls convergence speed.\n\nLarge gap → fast mixing → few power iterations needed.\nSmall gap → slow mixing → many iterations.\n\nPageRank with $\\alpha = 0.85$: gap $\\geq 0.15$, so about 50 iterations suffice.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Markov Chains and PageRank with NumPy',
        mathBridge: 'Simulate a Markov chain, find the stationary distribution by power iteration, and implement a small PageRank.',
        caption: 'Power iteration converges to the dominant eigenvector at rate |lambda_2|^k per step.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Weather Markov chain — power iteration',
              prose: 'Model sunny/cloudy/rainy weather with a transition matrix and find the stationary distribution by repeatedly multiplying the transition matrix.',
              code: `import numpy as np

# Row-stochastic transition matrix (P[i,j] = prob of going from state i to state j)
# States: 0=Sunny, 1=Cloudy, 2=Rainy
P = np.array([
    [0.7, 0.2, 0.1],   # from Sunny
    [0.3, 0.4, 0.3],   # from Cloudy
    [0.2, 0.4, 0.4],   # from Rainy
])

# Power iteration: start from uniform, multiply P.T repeatedly
pi = np.array([1/3, 1/3, 1/3])
for k in range(100):
    pi_new = P.T @ pi
    if np.linalg.norm(pi_new - pi) < 1e-12:
        print(f"Converged at step {k}")
        break
    pi = pi_new

print("Stationary distribution:")
print(f"  Sunny:  {pi[0]:.4f}")
print(f"  Cloudy: {pi[1]:.4f}")
print(f"  Rainy:  {pi[2]:.4f}")
print()
print("Verify pi P = pi:", np.allclose(pi @ P, pi))
print("Eigenvalue check: P.T has eigenvalue 1?", np.round(sorted(np.linalg.eigvals(P.T), reverse=True), 4))
`,
            },
            {
              id: 2,
              cellTitle: 'PageRank on a small web graph',
              prose: 'Build a small 5-page web graph and compute PageRank using the Google matrix with teleportation.',
              code: `import numpy as np

# 5-page directed web graph (link matrix M, column-stochastic)
# Page 0 -> {1, 2}
# Page 1 -> {3}
# Page 2 -> {1, 3}
# Page 3 -> {0}
# Page 4 -> {0, 3}
n = 5
M = np.zeros((n, n))
links = {0: [1,2], 1: [3], 2: [1,3], 3: [0], 4: [0,3]}
for src, dsts in links.items():
    for dst in dsts:
        M[dst, src] = 1.0 / len(dsts)

# Google matrix with teleportation alpha=0.85
alpha = 0.85
G = alpha * M + (1 - alpha) / n * np.ones((n, n))

# Power iteration
r = np.ones(n) / n
for _ in range(200):
    r_new = G @ r
    if np.linalg.norm(r_new - r) < 1e-12:
        break
    r = r_new

print("PageRank scores:")
for i, score in enumerate(r):
    print(f"  Page {i}: {score:.4f}")
print()
ranking = np.argsort(r)[::-1]
print("Ranking (most to least important):", ranking)
`,
            },
          ],
        },
      },
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
    {
      id: 'ex-la8-002-2',
      title: '3-page PageRank by hand',
      problem: 'For the 3-page web (page 1→{2,3}, page 2→{3}, page 3→{1}) compute the exact stationary distribution of the link matrix $M$ (no teleportation).',
      solution: 'Column-stochastic matrix: $M = \\begin{bmatrix}0&0&1\\\\1/2&0&0\\\\1/2&1&0\\end{bmatrix}$. Stationary: $M\\mathbf{r} = \\mathbf{r}$ with $r_1+r_2+r_3=1$. Row 1: $r_3 = r_1$. Row 2: $r_1/2 = r_2$. Row 3: $r_1/2 + r_2 = r_3$. Substituting: $r_1/2 + r_1/2 = r_1$ — consistent. With $r_1 + r_1/2 + r_1 = 1$: $5r_1/2 = 1$, so $r_1 = 2/5$, $r_2 = 1/5$, $r_3 = 2/5$. Pages 1 and 3 tie for highest rank.',
    },
    {
      id: 'ex-la8-002-3',
      title: 'Spectral gap and convergence speed',
      problem: 'A Markov chain has eigenvalues $1, 0.9, 0.3, -0.2$. How many power iterations are needed to reduce the error to $\\varepsilon = 10^{-6}$?',
      solution: 'The second-largest magnitude eigenvalue is $|\\lambda_2| = 0.9$. Error after $k$ steps $\\leq C \\cdot 0.9^k$. Solve $0.9^k \\leq 10^{-6}$: $k \\geq \\log(10^{-6})/\\log(0.9) = -6\\log 10 / \\log 0.9 \\approx 6 \\times 2.303 / 0.1054 \\approx 131$ iterations. A spectral gap of only 0.1 means very slow mixing — compare to PageRank\'s gap of 0.15 which needs only ~50 iterations.',
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
    { id: 'cp-la8-002-1', label: 'Read intuition section', type: 'read' },
    { id: 'cp-la8-002-2', label: 'Read math section', type: 'read' },
    { id: 'cp-la8-002-3', label: 'Read rigor section', type: 'read' },
    { id: 'cp-la8-002-4', label: 'Run first lab', type: 'lab' },
    { id: 'cp-la8-002-5', label: 'Run second lab', type: 'lab' },
    { id: 'cp-la8-002-6', label: 'Work example 1', type: 'example' },
    { id: 'cp-la8-002-7', label: 'Work example 2', type: 'example' },
    { id: 'cp-la8-002-8', label: 'Solve challenge', type: 'challenge' },
  ],

  assessment: 'Model a 3-state Markov chain (e.g., states A, B, C) with a transition matrix of your choice. Verify it is row-stochastic, compute the stationary distribution analytically and via power iteration, and check they agree.',

  quiz: [
    { id: 'q-la8-002-1', type: 'choice', question: 'The stationary distribution $\\boldsymbol{\\pi}$ of a Markov chain satisfies:', options: ['$P\\boldsymbol{\\pi} = \\mathbf{0}$', '$\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ (row vector)', '$P^\\top \\boldsymbol{\\pi} = \\mathbf{0}$', '$\\det(P - I) = \\pi$'], answer: '$\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ (row vector)', hints: ['The stationary distribution is unchanged by one step of the chain.', 'As a row vector, multiply on the right by $P$.'], reviewSection: 'intuition' },
    { id: 'q-la8-002-2', type: 'choice', question: 'Power iteration for PageRank converges at rate:', options: ['$|\\lambda_2|^k$ per iteration', '$1/k$', '$e^{-k}$', '$\\sigma_1^k$'], answer: '$|\\lambda_2|^k$ per iteration', hints: ['The error is dominated by the second-largest eigenvalue.', 'Each iteration multiplies the error by the spectral gap.'], reviewSection: 'math' },
    { id: 'q-la8-002-3', type: 'choice', question: 'The HITS algorithm computes authority scores as:', options: ['Dominant eigenvector of $A$', 'Dominant eigenvector of $A^\\top A$', 'Dominant singular value of $A$', 'Null space of $A$'], answer: 'Dominant eigenvector of $A^\\top A$', hints: ['Authority = cited by good hubs; hub = cites good authorities.', '$A^\\top A$ captures "cited by good hubs" in a single matrix.'], reviewSection: 'math' },
    { id: 'q-la8-002-4', type: 'choice', question: 'For an irreducible aperiodic Markov chain, the Perron-Frobenius theorem guarantees:', options: ['All eigenvalues equal 1', 'A unique stationary distribution with all positive entries', 'The chain is symmetric', 'The stationary distribution is uniform'], answer: 'A unique stationary distribution with all positive entries', hints: ['Perron-Frobenius is about the dominant eigenvalue and its eigenvector.', 'Irreducible = every state reachable from every other.'], reviewSection: 'intuition' },
    { id: 'q-la8-002-5', type: 'choice', question: 'A Markov chain with spectral gap 0.01 compared to one with gap 0.5 will:', options: ['Mix faster', 'Mix at the same speed', 'Mix much more slowly', 'Not converge at all'], answer: 'Mix much more slowly', hints: ['Mixing time scales as $1/\\text{spectral gap}$.', 'Gap 0.01 means $|\\lambda_2| = 0.99$ — very slow decay.'], reviewSection: 'math' },
    { id: 'q-la8-002-6', type: 'choice', question: 'Detailed balance $\\pi_i P_{ij} = \\pi_j P_{ji}$ implies:', options: ['The chain is irreducible', 'The chain is time-reversible and $\\boldsymbol{\\pi}$ is stationary', 'All eigenvalues are real', 'The chain mixes in one step'], answer: 'The chain is time-reversible and $\\boldsymbol{\\pi}$ is stationary', hints: ['Detailed balance is a sufficient condition for stationarity.', 'Time-reversibility means the chain looks the same forwards and backwards.'], reviewSection: 'rigor' },
    { id: 'q-la8-002-7', type: 'choice', question: 'The teleportation parameter $\\alpha = 0.85$ in PageRank means:', options: ['85% of the time follow a link; 15% jump to a random page', 'The top 85% of pages get rank', 'Convergence takes 85 iterations', '85% of rank is passed to each linked page'], answer: '85% of the time follow a link; 15% jump to a random page', hints: ['Teleportation models a random surfer who sometimes types a new URL.', '$\\alpha$ scales the link matrix; $(1-\\alpha)$ scales the uniform teleportation.'], reviewSection: 'intuition' },
    { id: 'q-la8-002-8', type: 'choice', question: 'In MCMC, a Markov chain is constructed so that:', options: ['The chain mixes as slowly as possible', 'The stationary distribution equals the target distribution $p(x)$', 'The chain is always reversible', 'Every state is visited exactly once'], answer: 'The stationary distribution equals the target distribution $p(x)$', hints: ['MCMC = Markov Chain Monte Carlo — sample from $p(x)$ by running the chain.', 'Metropolis-Hastings satisfies detailed balance with respect to $p(x)$.'], reviewSection: 'rigor' },
    { id: 'q-la8-002-9', type: 'choice', question: 'A row-stochastic matrix $P$ always has eigenvalue 1 because:', options: ['$\\det(P) = 1$', 'The all-ones vector $\\mathbf{1}$ satisfies $P\\mathbf{1} = \\mathbf{1}$', '$P$ is symmetric', '$P$ is diagonalizable'], answer: 'The all-ones vector $\\mathbf{1}$ satisfies $P\\mathbf{1} = \\mathbf{1}$', hints: ['Each row sums to 1 means $P\\mathbf{1} = \\mathbf{1}$.', 'This means $\\mathbf{1}$ is a right eigenvector with eigenvalue 1.'], reviewSection: 'intuition' },
    { id: 'q-la8-002-10', type: 'choice', question: 'The main computational challenge with PageRank on the real web (5 billion pages) is:', options: ['Finding all eigenvalues of the $5\\times10^9$ matrix', 'The matrix is not stochastic', 'Storing and multiplying by the sparse link matrix at scale', 'Power iteration does not converge for large matrices'], answer: 'Storing and multiplying by the sparse link matrix at scale', hints: ['A $5\\times10^9 \\times 5\\times10^9$ dense matrix is impossible to store.', 'The web graph is extremely sparse — each page links to only a handful of others.'], reviewSection: 'intuition' },
  ],

  mastery: { targetLevel: 2, solveIndependently: 'Given a small transition matrix, verify it is stochastic, compute the stationary distribution analytically, and verify via 10 steps of power iteration.', explainVerbally: 'Explain why PageRank uses teleportation, what the spectral gap controls, and how power iteration converges to the dominant eigenvector.', detectIncorrectApplication: 'Recognize when a Markov chain has multiple stationary distributions (reducible chain) and understand why teleportation fixes this.', transferToUnfamiliar: 'Apply the PageRank idea to a new domain — e.g., rank academic papers by citation, or rank players in a tournament by outcomes.' },
  misconceptions: [
    { falseBelief: 'A page with many out-links has high PageRank.', whyStudentsThinkIt: 'Students confuse out-degree (linking to many pages) with in-degree (being linked to by many pages).', correctionExample: 'PageRank measures how much rank flows *into* a page. A page that links to many others distributes its rank thinly outward; it gains rank only from who links *to* it.', contrastCase: 'In the 3-page example, page 2 links only to page 3 (high out-degree), but page 3 sends all rank to page 1 — so page 1 ends up with high rank despite linking to two pages.' },
    { falseBelief: 'Power iteration always converges to the stationary distribution regardless of starting point.', whyStudentsThinkIt: 'The Perron-Frobenius theorem guarantees uniqueness, so students assume any starting vector works.', correctionExample: 'For a reducible chain without teleportation, power iteration starting in one component stays there. Teleportation fixes this for PageRank.', contrastCase: 'Try power iteration on a block-diagonal stochastic matrix — it converges to a component-specific distribution, not the global one.' },
  ],
  transferPrompts: [
    { situation: 'You want to rank academic papers by importance using their citation graph.', competingTechniques: 'Count raw citations; use PageRank on the citation graph; use HITS.', whyThisTechniqueWins: 'PageRank weights citations by the importance of the citing paper — a citation from a landmark paper counts more. Raw counts treat all citations equally. HITS additionally distinguishes survey papers (hubs) from foundational papers (authorities).' },
    { situation: 'You are building a recommendation system and want to model user behavior as a Markov chain.', competingTechniques: 'Collaborative filtering; Markov chain transition model; deep learning.', whyThisTechniqueWins: 'Markov transition model captures sequential behavior (what users click next) efficiently. The stationary distribution predicts long-run preferences. It is interpretable and fast to update.' },
  ],
  debugging: [
    { commonError: 'Using a row-stochastic matrix instead of column-stochastic for PageRank column-vector formulation.', symptom: 'Power iteration $\\mathbf{r} \\leftarrow M\\mathbf{r}$ does not preserve the sum of $\\mathbf{r}$ to 1.', whyItHappened: 'Confusion between row-stochastic (rows sum to 1, used with row-vector distributions) and column-stochastic (columns sum to 1, used with column-vector distributions).', repairStrategy: 'Check: if $\\mathbf{r}$ is a column vector and you compute $M\\mathbf{r}$, then $M$ must be column-stochastic ($\\mathbf{1}^\\top M = \\mathbf{1}^\\top$). Verify with `sum(M, 1)` (MATLAB) or `M.sum(0)` (Python).' },
    { commonError: 'Forgetting to add teleportation, leaving dangling nodes in the graph.', symptom: 'Some columns of $M$ sum to 0 (dangling nodes); power iteration diverges or rank leaks out of the system.', whyItHappened: 'Pages with no out-links absorb rank without redistributing it.', repairStrategy: 'Replace dangling-node columns with $\\mathbf{1}/n$ before adding teleportation, or use the Google matrix formula directly: $G = \\alpha M + (1-\\alpha)\\mathbf{e}\\mathbf{e}^\\top/n$.' },
  ],
};
