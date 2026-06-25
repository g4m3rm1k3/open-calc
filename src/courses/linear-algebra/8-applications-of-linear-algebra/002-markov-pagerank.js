import pagerankGraphUrl from '../diagrams/la-pagerank-graph.svg?url';
import pagerankTeleportUrl from '../diagrams/la-pagerank-teleport.svg?url';

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
    blocks: [
      { type: 'prose', paragraphs: [
      '**Where you are in the story.** The previous lesson showed PCA turning a data science problem into an eigenvector computation. This lesson shows the same idea applied to a network: the web graph. In 1998, Larry Page and Sergey Brin noticed that the "importance" of a web page could be defined recursively — a page is important if important pages link to it. That self-referential definition is exactly an eigenvector equation. Their solution (PageRank) made Google the dominant search engine and earned them billions of dollars. The math is eigenvalues and Markov chains.',

      '**The Markov chain model.** Imagine a random web surfer: at each step they click a random link on the current page, or occasionally (with probability $1-\\alpha$) jump to a completely random page. This is a Markov chain on $n$ states (web pages). The transition matrix $P$ (column-stochastic: column $j$ contains $1/k$ in the rows linked from page $j$, where $k$ is the out-degree) encodes the probabilities. The key question: after infinitely many random steps, how often does the surfer visit each page? That fraction is the PageRank — the stationary distribution.',

      '**Concrete first: 3-page web.** Pages: 1 links to {2,3}, 2 links to {3}, 3 links to {1}. Link matrix $M = \\begin{bmatrix}0&0&1\\\\1/2&0&0\\\\1/2&1&0\\end{bmatrix}$. Start uniform: $\\mathbf{r}^{(0)} = (1/3, 1/3, 1/3)^\\top$. After one step: $\\mathbf{r}^{(1)} = M\\mathbf{r}^{(0)} = (1/3, 1/6, 1/2)^\\top$. Page 3 jumps to the top because two pages link to it. After more steps, page 1 climbs because it receives all of page 3\'s rank — which is high because page 3 received from both pages 1 and 2.',
      ] },
      { type: 'image', src: pagerankGraphUrl,
        alt: 'A directed graph of 3 pages: page 1 links to pages 2 and 3, page 2 links to page 3, page 3 links back to page 1, with converged rank values shown for each',
        caption: 'Page 3 collects rank from two sources, then forwards it all to Page 1 — rank flows around the cycle until it settles.' },
      { type: 'prose', paragraphs: [
      '**Predict before reading on.** In the 3-page example, which page ends up with the highest stationary PageRank? Think about the flow of rank before computing: page 3 receives from two pages (1 and 2), then sends everything to page 1. Does that make page 1 ultimately the most important? Write your prediction.',

      '**The eigenvector equation.** The stationary distribution $\\boldsymbol{\\pi}$ satisfies $M\\boldsymbol{\\pi} = \\boldsymbol{\\pi}$ — it is an eigenvector of $M$ with eigenvalue 1. By the Perron-Frobenius theorem, for any irreducible aperiodic stochastic matrix this eigenvalue-1 eigenvector is unique, positive, and all other eigenvalues satisfy $|\\lambda| < 1$. So the stationary distribution is the dominant eigenvector, and power iteration (repeatedly multiplying $\\mathbf{r} \\leftarrow M\\mathbf{r}$) converges to it.',

      '**The Google matrix: handling dangling nodes and disconnected graphs.** The raw link matrix has problems: "dangling nodes" (pages with no out-links) create rows of zeros; disconnected components prevent the surfer from reaching all pages. The fix: add a "teleportation" term. The Google matrix is $G = \\alpha M + (1-\\alpha)\\mathbf{1}\\mathbf{1}^\\top/n$ with $\\alpha \\approx 0.85$. With probability $\\alpha$ the surfer follows a link; with probability $1-\\alpha$ they jump to a uniformly random page. This makes $G$ irreducible and aperiodic, guaranteeing a unique stationary distribution.',
      ] },
      { type: 'image', src: pagerankTeleportUrl,
        alt: 'A graph with a solid blue arrow showing a normal link followed with probability alpha, and dashed red arrows showing teleportation jumps to random other pages with probability 1 minus alpha',
        caption: 'Teleportation patches the dead ends and disconnected pieces of the web graph, guaranteeing a unique stationary distribution exists.' },
      { type: 'prose', paragraphs: [
      '**Power iteration is cheap and scales.** The algorithm: start with $\\mathbf{r} = \\mathbf{1}/n$, repeatedly compute $\\mathbf{r} \\leftarrow G\\mathbf{r}$, stop when $\\|\\mathbf{r}_{k+1} - \\mathbf{r}_k\\|_1 < 10^{-8}$. Convergence rate is $\\alpha^k = 0.85^k$ per step — converges in about 50-100 iterations regardless of $n$. The key: you never form $G$ explicitly. You compute $G\\mathbf{r} = \\alpha M\\mathbf{r} + (1-\\alpha)\\mathbf{1}/n$ using only the sparse link matrix $M$ (about 40 non-zeros per column for the web). This runs on a billion-page web graph in minutes.',

      '**Where this is heading.** The next lesson applies eigenvalue ideas to differential equations. The connection: just as $P^k \\mathbf{r}_0$ converges to the stationary distribution as $k \\to \\infty$, the solution $e^{At} \\mathbf{x}_0$ of a linear ODE converges to zero as $t \\to \\infty$ — if the eigenvalues of $A$ have negative real parts. Stability is the ODE analogue of mixing.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Markov Chains and PageRank with NumPy',
        mathBridge: 'Simulate a Markov chain, find the stationary distribution by power iteration, and implement a small PageRank.',
        caption: 'Power iteration converges to the dominant eigenvector at rate |lambda_2|^k per step.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Weather Markov chain — power iteration',
              prose: [
                'Model sunny/cloudy/rainy weather with a transition matrix and find the stationary distribution by repeatedly multiplying the transition matrix.',
                '`P = np.array([[0.7,0.2,0.1],[0.3,0.5,0.2],[0.2,0.3,0.5]])`. Each row must sum to 1: `np.allclose(P.sum(axis=1), 1)`. Power iteration: `v = np.array([1,0,0]); for _ in range(50): v = v @ P`. After convergence `v` is the stationary distribution. Exact: `vals, vecs = np.linalg.eig(P.T); v_stat = vecs[:,np.argmax(vals.real)].real; v_stat /= v_stat.sum()`.',
                'The convergence plot shows the probability of each state vs iteration number. All three curves converge to the stationary distribution regardless of the starting state. The rate of convergence is `|λ₂/λ₁|` (ratio of second-largest to largest eigenvalue). Plot `|v_k - v_stat|` on a semilogy plot — slope is `log|λ₂|`, giving you the mixing time directly.',
              ],
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
              prose: [
                'Build a small 5-page web graph and compute PageRank using the Google matrix with teleportation.',
                'Build adjacency: `A[i,j]=1` if page i links to page j. Normalize rows: `P = A / A.sum(axis=1, keepdims=True)`. Google matrix with damping d=0.85: `G = d*P + (1-d)*np.ones((n,n))/n`. PageRank: power iterate `v = np.ones(n)/n; for _ in range(100): v = v @ G` or find the eigenvector of G^T with eigenvalue 1.',
                'Bar chart of PageRank scores. The page with the most incoming links from high-PageRank pages scores highest — not just the page with the most links. The teleportation term `(1-d)/n` guarantees the Markov chain is ergodic (connected and aperiodic), ensuring a unique stationary distribution. Without it, pages with no outgoing links ("dangling nodes") can cause the chain to get stuck.',
              ],
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
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Markov Chains and Power Iteration',
        mathBridge: 'Simulate a Markov chain and compute the stationary distribution via power iteration.',
        caption: 'Power method: repeatedly multiply by the stochastic matrix until convergence.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Weather Markov chain',
              prose: [
                'Model sunny/cloudy/rainy weather with transition matrix. Find stationary distribution.',
                '`P = [0.7 0.2 0.1; 0.3 0.5 0.2; 0.2 0.3 0.5]`. Power iteration: `v = [1;0;0]; for k=1:50, v = P\'*v; end; disp(v)`. Eigenvector method: `[V,D]=eig(P\'); [~,idx]=max(diag(D)); pi=V(:,idx); pi=pi/sum(pi); disp(pi)`.',
                'The convergence plot: `v_hist(k,:) = v\'` after each iteration, then `plot(v_hist)`. All three rows converge to pi regardless of starting state. The second eigenvalue magnitude `abs(eig(P\')); sort(...)` gives the mixing rate — how many steps until the chain "forgets" its initial state.',
              ],
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
[min_val, idx] = min(abs(diag(D) - 1))
pi_stat = abs(V(:, idx))
pi_stat = pi_stat / sum(pi_stat)  % normalize
disp('Stationary distribution [Sunny, Cloudy, Rainy]:')
pi_stat
`,
            },
            {
              id: 2,
              cellTitle: 'Power iteration for PageRank',
              prose: [
                'Compute PageRank for a small web graph via power iteration.',
                'Adjacency: `A` with A(i,j)=1 if page i links to j. Normalize: `D = diag(sum(A,2)); P = inv(D)*A` (row-stochastic). Google matrix: `d=0.85; G = d*P + (1-d)*ones(n)/n`. Power iterate: `v=ones(n,1)/n; for k=1:100, v=G\'*v; end`.',
                'Bar chart of PageRank. Pages with many high-PR inbound links score highest. The gap between top and bottom PageRank values reveals the "authority" structure of the graph. Change d from 0.85 to 0.99 and rerun — observe how ranking becomes more extreme as teleportation decreases (less diffusion means authority concentrates more).',
              ],
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
    callouts: [
      {
        type: 'procedure',
        title: 'How to Compute PageRank via Power Iteration (4 Steps)',
        body: '1. **Build the link matrix $M$.** Set $M[j,i] = 1/\\text{outdeg}(i)$ if page $i$ links to $j$, else 0. For dangling nodes (out-degree 0), set the entire column to $1/n$. Verify: column sums all equal 1.\n2. **Form the Google matrix.** $G = \\alpha M + (1-\\alpha)/n \\cdot \\mathbf{1}\\mathbf{1}^\\top$ with $\\alpha \\approx 0.85$. Never form $G$ explicitly — apply it as $G\\mathbf{r} = \\alpha M\\mathbf{r} + (1-\\alpha)/n \\cdot \\mathbf{1}$ using only the sparse $M$.\n3. **Power iterate.** Initialize $\\mathbf{r} = \\mathbf{1}/n$. Repeat $\\mathbf{r} \\leftarrow G\\mathbf{r}$ until $\\|\\mathbf{r}_{\\text{new}} - \\mathbf{r}\\|_1 < 10^{-8}$. Convergence rate: $\\alpha^k \\approx 0.85^k$ per step — about 50 iterations regardless of $n$.\n4. **Read rankings.** Sort pages by $r_i$ descending. Verify: $\\sum_i r_i = 1$. The score $r_i$ is the long-run fraction of time a teleporting surfer spends on page $i$.',
      },
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
      '**The power method and deflation.** The power method applies beyond Markov chains: for any matrix $A$ with a unique dominant eigenvalue $\\lambda_1$ (largest in magnitude), starting from a generic vector $\\mathbf{v}_0$, the iteration $\\mathbf{v}_{k+1} = A\\mathbf{v}_k/\\|A\\mathbf{v}_k\\|$ converges to the dominant eigenvector at rate $(|\\lambda_2|/|\\lambda_1|)^k$. For PageRank, $\\lambda_1 = 1$ and $|\\lambda_2| \\leq \\alpha = 0.85$, giving convergence at rate $0.85^k$. Deflation extends the power method to find subsequent eigenvectors: after finding $\\mathbf{v}_1$, form $A_1 = A - \\lambda_1 \\mathbf{v}_1 \\mathbf{w}_1^\\top$ (where $\\mathbf{w}_1$ is the left eigenvector with $\\mathbf{w}_1^\\top \\mathbf{v}_1 = 1$), and apply the power method to $A_1$. This is the idea behind inverse iteration, shift-and-invert, and the Lanczos algorithm for sparse eigenvalue problems.',
      '**Metropolis-Hastings and MCMC.** In Bayesian statistics, samples from a posterior $p(\\theta | \\text{data}) \\propto p(\\text{data}|\\theta)p(\\theta)$ are needed but intractable. Metropolis-Hastings constructs a Markov chain with $p$ as its stationary distribution: given current state $\\theta$, propose $\\theta\'\\sim q(\\cdot|\\theta)$ and accept with probability $\\min\\left(1, \\frac{p(\\theta\')q(\\theta|\\theta\')}{p(\\theta)q(\\theta\'|\\theta)}\\right)$. The resulting chain satisfies detailed balance with $p$. Mixing time for random-walk Metropolis scales as $O(d)$ in dimension $d$. Hamiltonian Monte Carlo (HMC, used in Stan) exploits gradient information to take longer steps, achieving mixing time $O(d^{1/4})$ — dramatically faster in high dimensions. Linear algebra (eigenvalue analysis of the chain) tells you when MCMC will be practical.',
      '**Conductance and the Cheeger inequality.** The conductance of a Markov chain is $\\phi = \\min_{S:\\,\\pi(S) \\leq 1/2} Q(S,\\bar{S})/\\pi(S)$ where $Q(S,\\bar{S}) = \\sum_{i\\in S,j\\notin S}\\pi_i P_{ij}$ is the probability flow across the cut. Cheeger\'s inequality bridges conductance and the spectral gap: $\\phi^2/2 \\leq 1 - \\lambda_2 \\leq 2\\phi$. A well-connected graph (high conductance $\\phi$) has a large spectral gap and mixes fast. PageRank with teleportation guarantees $\\phi \\geq (1-\\alpha)/n$, giving a spectral gap of at least $(1-\\alpha)^2/(2n^2)$ — a weak lower bound, but enough to ensure convergence in $O(\\log n / (1-\\alpha))$ steps. The Cheeger inequality is the theoretical bridge between graph structure (connectivity) and algorithmic performance (mixing time).',
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

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la8-002-pagerank-small',
      title: 'Computing PageRank for a 4-Page Web Graph',
      prereqs: ['Markov chains', 'Steady-state distribution', 'Matrix-vector multiply'],
      problem: 'Four pages with link structure: 1→{2,3}, 2→{1}, 3→{1,4}, 4→{3}. Compute the PageRank scores.',
      steps: [
        {
          label: 'Build the column-stochastic transition matrix $G$',
          strategy: 'Column $j$ = probability of jumping from page $j$ to page $i$. Divide each column by its out-degree.',
          explanation: 'Out-degrees: page 1 has 2 outlinks, page 2 has 1, page 3 has 2, page 4 has 1. $G_{ij} = 1/\\text{out-degree}(j)$ if $j\\to i$, else 0.',
          math: 'G = \\begin{bmatrix}0&1&1/2&0\\\\1/2&0&0&0\\\\1/2&0&0&1\\\\0&0&1/2&0\\end{bmatrix}',
        },
        {
          label: 'Apply the damping factor $d=0.85$ (Google\'s original value)',
          strategy: 'The teleportation matrix handles dangling nodes and ensures convergence: $M = dG + (1-d)\\mathbf{1}\\mathbf{1}^\\top/n$.',
          explanation: 'With probability $1-d=0.15$, a random surfer teleports to any page uniformly. This ensures the matrix is irreducible and aperiodic, guaranteeing a unique steady state.',
          math: 'M = 0.85G + 0.15\\cdot\\frac{1}{4}\\mathbf{1}\\mathbf{1}^\\top',
        },
        {
          label: 'Find the steady-state by power iteration',
          strategy: 'Start with uniform $\\boldsymbol{\\pi}^{(0)} = [1/4,1/4,1/4,1/4]^\\top$ and repeatedly multiply: $\\boldsymbol{\\pi}^{(k+1)} = M\\boldsymbol{\\pi}^{(k)}$.',
          explanation: 'After convergence, the PageRank scores reflect link authority: pages that many high-PageRank pages link to score higher. Page 1 (most linked-to) will rank highest here.',
          math: '\\boldsymbol{\\pi}^* = M\\boldsymbol{\\pi}^* \\Rightarrow \\text{solve }(M-I)\\boldsymbol{\\pi}^*=\\mathbf{0}',
          gotcha: 'PageRank is an eigenvector problem: $M\\boldsymbol{\\pi}=\\boldsymbol{\\pi}$ (eigenvalue 1). Power iteration converges because $d<1$ ensures the second-largest eigenvalue $|\\lambda_2| \\leq d < 1$. The spectral gap $1-d$ determines convergence speed.',
        },
      ],
    },
    {
      id: 'wt-la8-002-power-iteration',
      title: 'Power Iteration: Finding the Dominant Eigenvector',
      prereqs: ['Matrix-vector multiply', 'Eigenvalues', 'Convergence'],
      problem: 'Apply 3 steps of power iteration to find the dominant eigenvector of $A = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$ starting from $\\mathbf{x}^{(0)}=[1,0]^\\top$.',
      steps: [
        {
          label: 'Multiply and normalize: step 1',
          strategy: 'Multiply $A\\mathbf{x}^{(0)}$, then normalize to get $\\mathbf{x}^{(1)}$.',
          explanation: '$A[1,0]^\\top=[2,1]^\\top$. Normalize: $\\|[2,1]\\|=\\sqrt{5}$. $\\mathbf{x}^{(1)}=[2/\\sqrt{5},1/\\sqrt{5}]^\\top\\approx[0.894,0.447]^\\top$.',
          math: '\\mathbf{x}^{(1)} = \\frac{[2,1]^\\top}{\\sqrt{5}} \\approx [0.894,0.447]^\\top',
        },
        {
          label: 'Continue: steps 2 and 3',
          strategy: 'Each iteration multiplies by $A$ and normalizes.',
          explanation: 'After step 2: $\\approx [0.924,0.383]^\\top$. After step 3: $\\approx [0.937, 0.350]^\\top$. The sequence is converging toward $[1,1]^\\top/\\sqrt{2}=[0.707,0.707]^\\top$ — the eigenvector for $\\lambda=3$.',
          math: '\\mathbf{x}^{(k)} \\to \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\end{bmatrix} \\text{ as }k\\to\\infty',
          gotcha: 'Power iteration converges to the DOMINANT eigenvector (largest $|\\lambda|$). For $A = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$: eigenvalues are 3 and 1, so convergence rate $\\approx (1/3)^k$ — halves every $\\log_2(3)\\approx 1.6$ steps.',
        },
        {
          label: 'Estimate the Rayleigh quotient for the eigenvalue',
          strategy: 'At each step, $\\mathbf{x}^{(k)\\top} A \\mathbf{x}^{(k)} \\approx \\lambda_1$ (the Rayleigh quotient converges to the dominant eigenvalue).',
          explanation: 'After step 1: $R(\\mathbf{x}^{(1)}) = [0.894,0.447]\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}[0.894,0.447]^\\top \\approx 2.8$. True value: 3. After more steps: converges to 3.',
          math: 'R(\\mathbf{x}) = \\frac{\\mathbf{x}^\\top A\\mathbf{x}}{\\mathbf{x}^\\top\\mathbf{x}} \\to \\lambda_1',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la8-002-1',
      title: 'Teleportation effect',
      difficulty: 'medium',
      problem: 'Why does PageRank add the teleportation term $(1-\\alpha)/n \\cdot \\mathbf{1}\\mathbf{1}^\\top$? What two problems does it solve, and what algebraic property does it guarantee?',
      walkthrough: [
        { expression: '\\text{Problem 1: dangling nodes.} \\quad \\text{If outdeg}(i)=0,\\text{ column } i \\text{ of } M \\text{ is all zeros} \\Rightarrow \\sum_i r_i \\text{ decreases each step}', annotation: 'Dangling nodes absorb rank without redistributing it — rank "leaks out" of the system, causing power iteration to fail.' },
        { expression: '\\text{Problem 2: reducibility.} \\quad \\text{If graph has isolated components, rank trapped in each component} \\Rightarrow \\text{multiple stationary distributions}', annotation: 'Without full connectivity, Perron-Frobenius does not apply and the stationary distribution is not unique.' },
        { expression: 'G = \\alpha M + \\frac{1-\\alpha}{n}\\mathbf{1}\\mathbf{1}^\\top: \\quad G_{ij} = \\alpha M_{ij} + \\frac{1-\\alpha}{n} > 0 \\text{ for all } i,j', annotation: 'The teleportation term makes every entry of G strictly positive. A positive stochastic matrix is automatically irreducible and aperiodic.' },
        { expression: '\\Rightarrow \\text{Perron-Frobenius applies: unique positive stationary distribution } \\boldsymbol{\\pi} \\text{ with all } \\pi_i > 0', annotation: 'With α=0.85: the surfer follows links 85% of the time and jumps randomly 15% of the time. This single change fixes both problems and guarantees convergence in ~50 iterations.' },
      ],
    },
    {
      id: 'ch-la8-002-2',
      title: 'Stationary distribution of a 2-state chain',
      difficulty: 'easy',
      problem: 'Find the stationary distribution of $P = \\begin{pmatrix}0.9&0.1\\\\0.3&0.7\\end{pmatrix}$ (row-stochastic). Verify $\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$.',
      walkthrough: [
        { expression: '\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}: \\quad 0.9\\pi_1 + 0.3\\pi_2 = \\pi_1 \\Rightarrow 0.3\\pi_2 = 0.1\\pi_1', annotation: 'Write the first stationary equation: the probability of being in state 1 after one step equals π_1.' },
        { expression: '\\pi_1 = 3\\pi_2, \\quad \\pi_1 + \\pi_2 = 1 \\Rightarrow 3\\pi_2 + \\pi_2 = 1 \\Rightarrow \\pi_2 = \\tfrac{1}{4},\\; \\pi_1 = \\tfrac{3}{4}', annotation: 'Substitute the ratio into the normalization condition.' },
        { expression: '\\text{Check: } \\boldsymbol{\\pi}P = (\\tfrac{3}{4}, \\tfrac{1}{4})\\begin{pmatrix}0.9&0.1\\\\0.3&0.7\\end{pmatrix} = (\\tfrac{0.675+0.075}{1}, \\tfrac{0.075+0.175}{1}) = (\\tfrac{3}{4}, \\tfrac{1}{4})\\;\\checkmark', annotation: 'Direct verification: πP = π. The chain spends 75% of time in state 1 and 25% in state 2 long-run, regardless of starting point.' },
      ],
    },
    {
      id: 'ch-la8-002-3',
      title: 'Verify detailed balance',
      difficulty: 'hard',
      problem: 'For $P = \\begin{pmatrix}0&1&0\\\\1/2&0&1/2\\\\0&1&0\\end{pmatrix}$ and proposed $\\boldsymbol{\\pi} = (1/4, 1/2, 1/4)$, verify detailed balance $\\pi_i P_{ij} = \\pi_j P_{ji}$ for all $(i,j)$, and confirm $\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$.',
      walkthrough: [
        { expression: '(i,j)=(1,2):\\; \\pi_1 P_{12} = \\tfrac{1}{4}\\cdot1 = \\tfrac{1}{4},\\quad \\pi_2 P_{21} = \\tfrac{1}{2}\\cdot\\tfrac{1}{2} = \\tfrac{1}{4}\\;\\checkmark', annotation: 'Flow from state 1 to 2 equals flow from 2 to 1 — detailed balance holds.' },
        { expression: '(i,j)=(2,3):\\; \\pi_2 P_{23} = \\tfrac{1}{2}\\cdot\\tfrac{1}{2} = \\tfrac{1}{4},\\quad \\pi_3 P_{32} = \\tfrac{1}{4}\\cdot1 = \\tfrac{1}{4}\\;\\checkmark', annotation: 'All three non-trivial pairs satisfy balance. Pairs with P_{ij}=0 trivially satisfy 0=0.' },
        { expression: '\\boldsymbol{\\pi}P:\\;\\text{row 1} = 0 + \\tfrac{1}{2}\\cdot\\tfrac{1}{2} + \\tfrac{1}{4}\\cdot0 = \\tfrac{1}{4} = \\pi_1\\;\\checkmark', annotation: 'Verify stationarity directly: πP = π. Since detailed balance implies stationarity, this is expected.' },
        { expression: '\\text{Also: } \\pi_2 = \\tfrac{1}{4}\\cdot1 + 0 + \\tfrac{1}{4}\\cdot1 = \\tfrac{1}{2}\\;\\checkmark,\\quad \\pi_3 = \\tfrac{1}{2}\\cdot\\tfrac{1}{2} = \\tfrac{1}{4}\\;\\checkmark', annotation: 'All three components match. The chain is reversible — it is a random walk on the path 1-2-3 with the degree-proportional stationary distribution π_i ∝ deg(i): degrees are 1,2,1, so π=(1/4,1/2,1/4).' },
      ],
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
  semantics: {
    core: [
      { symbol: 'P \\text{ (row-stochastic)}', meaning: 'Transition matrix; $P_{ij}$ = probability of going from state $i$ to state $j$; rows sum to 1; $\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}$ for stationary $\\boldsymbol{\\pi}$.' },
      { symbol: '\\boldsymbol{\\pi}P = \\boldsymbol{\\pi}', meaning: 'Stationary distribution equation — $\\boldsymbol{\\pi}$ is a left eigenvector of $P$ with eigenvalue 1; unchanged by one step of the chain.' },
      { symbol: 'M \\text{ (column-stochastic)}', meaning: 'PageRank link matrix; column $j$ gives $1/\\text{outdeg}(j)$ in each linked row; column sums = 1; used with column-vector $\\mathbf{r}$: $M\\mathbf{r} \\to \\mathbf{r}$.' },
      { symbol: 'G = \\alpha M + (1-\\alpha)/n\\cdot\\mathbf{1}\\mathbf{1}^\\top', meaning: 'Google matrix — strictly positive, irreducible, aperiodic; unique stationary distribution by Perron-Frobenius; never form explicitly.' },
      { symbol: '|\\lambda_2|', meaning: 'Second-largest eigenvalue magnitude; controls mixing rate — error after $k$ iterations $\\leq C|\\lambda_2|^k$; spectral gap = $1-|\\lambda_2|$.' },
      { symbol: '\\pi_i P_{ij} = \\pi_j P_{ji}', meaning: 'Detailed balance (reversibility) — sufficient for $\\boldsymbol{\\pi}$ to be stationary; required by Metropolis-Hastings MCMC for any target distribution.' },
    ],
    rulesOfThumb: [
      'Verify column sums (or row sums) = 1 before power iteration — a column not summing to 1 means rank leaks out of the system.',
      'Always add teleportation for web/network graphs — dangling nodes and isolated components prevent convergence to a unique distribution.',
      'About 50–100 power iterations suffice for PageRank with $\\alpha = 0.85$ regardless of web size — convergence rate $0.85^k$ depends only on $\\alpha$, not $n$.',
      'Spectral gap $< 0.1$ means slow mixing (hundreds of iterations); gap $> 0.5$ means fast mixing (tens of iterations) — use this to estimate cost before running.',
      'For MCMC design, target detailed balance $\\pi_i P_{ij} = \\pi_j P_{ji}$ — this automatically guarantees $\\boldsymbol{\\pi}$ is the stationary distribution without solving the stationary equations.',
    ],
  },

  spiral: {
    recoveryPoints: ['la5-001', 'la7-005'],
    futureLinks: ['la8-003', 'la9-003'],
  },

  debugging: [
    { commonError: 'Using a row-stochastic matrix instead of column-stochastic for PageRank column-vector formulation.', symptom: 'Power iteration $\\mathbf{r} \\leftarrow M\\mathbf{r}$ does not preserve the sum of $\\mathbf{r}$ to 1.', whyItHappened: 'Confusion between row-stochastic (rows sum to 1, used with row-vector distributions) and column-stochastic (columns sum to 1, used with column-vector distributions).', repairStrategy: 'Check: if $\\mathbf{r}$ is a column vector and you compute $M\\mathbf{r}$, then $M$ must be column-stochastic ($\\mathbf{1}^\\top M = \\mathbf{1}^\\top$). Verify with `sum(M, 1)` (MATLAB) or `M.sum(0)` (Python).' },
    { commonError: 'Forgetting to add teleportation, leaving dangling nodes in the graph.', symptom: 'Some columns of $M$ sum to 0 (dangling nodes); power iteration diverges or rank leaks out of the system.', whyItHappened: 'Pages with no out-links absorb rank without redistributing it.', repairStrategy: 'Replace dangling-node columns with $\\mathbf{1}/n$ before adding teleportation, or use the Google matrix formula directly: $G = \\alpha M + (1-\\alpha)\\mathbf{e}\\mathbf{e}^\\top/n$.' },
  ],
};
