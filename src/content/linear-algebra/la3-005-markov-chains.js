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
  },

  intuition: {
    prose: [
      'A simple weather model has two states: Sunny and Rainy. Transition matrix $P = \\begin{bmatrix}0.8&0.4\\\\0.2&0.6\\end{bmatrix}$ (columns sum to 1). Start with $\\mathbf{x}_0 = [1,0]^\\top$ (all Sunny). After one step: $P\\mathbf{x}_0 = [0.8, 0.2]^\\top$. After many steps, $P^k\\mathbf{x}_0 \\to \\mathbf{q}$. Solve $(P-I)\\mathbf{q} = \\mathbf{0}$ with $q_1+q_2=1$: $\\mathbf{q} = [2/3, 1/3]^\\top$. Long run: 67% sunny, 33% rainy — regardless of where you started.',
      '**What is a Markov chain?** A Markov chain describes a system that jumps between states over time, where the probability of jumping from state $i$ to state $j$ depends only on the current state (not the history). This "memoryless" property is the Markov property. The transition probabilities are encoded in a matrix.',
      '**Transition matrix.** For a system with $n$ states, the transition matrix $P$ has $P_{ij} = $ probability of moving from state $j$ to state $i$ (column-stochastic convention). Each column sums to 1 (all probability from state $j$ must go somewhere). A column vector $\\mathbf{x}$ where $x_i \\geq 0$ and $\\sum x_i = 1$ represents a probability distribution over states.',
      '**Matrix-vector product = one time step.** If $\\mathbf{x}_t$ is the distribution at time $t$, then $\\mathbf{x}_{t+1} = P\\mathbf{x}_t$. After $k$ steps: $\\mathbf{x}_k = P^k \\mathbf{x}_0$. As $k \\to \\infty$, the distribution often converges to a **steady state** $\\mathbf{q}$ satisfying $P\\mathbf{q} = \\mathbf{q}$ — an eigenvector of $P$ with eigenvalue 1.',
      '**Why eigenvalue 1 always exists.** For any column-stochastic matrix, the vector of all ones $\\mathbf{1}$ satisfies $P^\\top \\mathbf{1} = \\mathbf{1}$ (each row of $P^\\top$ sums to 1). Therefore $P^\\top - I$ has $\\mathbf{1}$ in its null space, so $\\det(P^\\top - I) = \\det(P - I) = 0$, which means $\\lambda = 1$ is an eigenvalue of $P$. The steady-state distribution is the normalized eigenvector corresponding to $\\lambda = 1$.',
      '**Predict before reading on.** The weather matrix $P = \\begin{bmatrix}0.9&0.3\\\\0.1&0.7\\end{bmatrix}$ has larger diagonal entries (the system tends to stay in its current state). Will the steady state be closer to $[1,0]^\\top$ (all Sunny) or $[0.5, 0.5]^\\top$ (equal)? Which eigenvalue equals 1? Predict, then verify.',
      '**CNC machine availability — Markov analysis.** A CNC machine cycles through states: Cutting, Setup/Tool-change, Idle (waiting for parts), and Fault. From shift data, you can estimate transition probabilities between these states. The steady-state distribution tells you the long-run fraction of time in each state — and therefore machine **availability** (fraction of time Cutting). Availability = $q_{\\text{Cutting}}$ where $\\mathbf{q}$ is the steady-state distribution. If the fault-recovery probability is low, availability can be optimized by improving it — eigenvalue analysis shows exactly how much the steady state shifts per unit improvement.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 7 — Eigenvalues & Eigenvectors',
        body: '**Previous (Lesson 4):** Jordan Normal Form — handling non-diagonalizable matrices.\n**This lesson:** Markov Chains — stochastic matrices, eigenvalue 1, steady-state distributions, and the Perron-Frobenius theorem.\n**Next (Lesson 6):** Cayley-Hamilton Theorem — every matrix satisfies its own characteristic equation.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Find the Steady-State Distribution',
        body: 'Step 1. **Verify stochastic.** Confirm that each column of $P$ sums to 1 and all entries are non-negative.\n\nStep 2. **Set up the eigenvector equation.** Form $A = P - I$. The steady state $\\mathbf{q}$ satisfies $A\\mathbf{q} = \\mathbf{0}$ (null space of $P - I$).\n\nStep 3. **Solve the null space.** Row-reduce $[A | \\mathbf{0}]$ to find the free variable and the general solution.\n\nStep 4. **Normalize.** Divide the null-space vector by the sum of its entries so all components sum to 1. This makes $\\mathbf{q}$ a valid probability distribution.\n\nStep 5. **Sanity-check.** Verify $P\\mathbf{q} = \\mathbf{q}$ and $\\sum_i q_i = 1$. Also confirm $q_i \\geq 0$ — if any entry is negative, check your null-space computation.',
      },
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
              prose: [
                'Build the $3\\times 3$ transition matrix $P$ where column $j$ gives the probability distribution of leaving state $j$. Run `sum(P)` to confirm all column sums equal 1 — that is the stochastic property. Then call `[V,D] = eig(P)` to find all eigenvalues.',
                'The eigenvalue closest to 1 in `diag(D)` corresponds to the steady-state distribution. The matching column of $V$ is the steady-state eigenvector (before normalization). Confirm: the other eigenvalues all satisfy $|\\lambda| \\leq 1$, consistent with Perron-Frobenius. Any column-stochastic matrix will always have exactly one eigenvalue at 1.',
              ],
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
              prose: [
                'Start with $\\mathbf{x}_0 = [1; 0; 0]$ (all probability in the Sunny state). Multiply by $P$ repeatedly in a loop: `x = P * x`. After 20 iterations, compare to the normalized eigenvector `q` extracted from `eig(P)` using the index where `|lambda - 1|` is smallest.',
                'After 20 steps the values of `x` and `q` match to many decimal places — starting from any distribution, the chain converges to the same steady state. This is Perron-Frobenius in action: the $\\lambda = 1$ component survives; all others ($|\\lambda_i| < 1$) shrink to zero. The spectral gap $1 - |\\lambda_2|$ controls how fast those other components vanish.',
              ],
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
              prose: [
                'Sort the absolute values of all eigenvalues in descending order with `sort(abs(diag(D)), \'descend\')`. The first entry is 1 (the steady-state eigenvalue). The second entry is $|\\lambda_2|$ — the "mixing eigenvalue." Compute `spectral_gap = 1 - lambdas(2)`.',
                'A large spectral gap means $|\\lambda_2|^k$ decays quickly. For this 3-state chain, read off $|\\lambda_2|$ and estimate how many steps until $|\\lambda_2|^k < 0.01$. A spectral gap near 0 would mean thousands of steps to converge — the hallmark of a slowly-mixing chain (common in large networks like the web graph).',
              ],
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
      {
        type: 'insight',
        title: 'Convergence Proof Sketch',
        body: 'Expand $\\mathbf{x}_0$ in the eigenbasis of $P$: $\\mathbf{x}_0 = c_1 \\mathbf{q} + \\sum_{k\\geq 2} c_k \\mathbf{v}_k$\n\nThen: $P^n \\mathbf{x}_0 = c_1 \\mathbf{q} + \\sum_{k \\geq 2} c_k \\lambda_k^n \\mathbf{v}_k$\n\nSince $|\\lambda_k| < 1$ for $k \\geq 2$, the sum $\\to 0$ as $n \\to \\infty$. Since $\\mathbf{x}_0$ and $\\mathbf{q}$ are both probability vectors, $c_1 = 1$ and $P^n \\mathbf{x}_0 \\to \\mathbf{q}$.',
      },
      {
        type: 'definition',
        title: 'Finding the Steady State',
        body: 'The steady state $\\mathbf{q}$ satisfies $P\\mathbf{q} = \\mathbf{q}$, i.e., $(P - I)\\mathbf{q} = \\mathbf{0}$ with $\\sum_i q_i = 1$.\n\n**Algorithm:**\n1. Form $A = P - I$\n2. Solve $A\\mathbf{q} = \\mathbf{0}$ (find null space)\n3. Normalize: divide by $\\sum_i q_i$\n\nIn MATLAB: `[V,D] = eig(P)` → column of $V$ corresponding to eigenvalue 1.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Markov Chains, Steady State, and CNC Machine Availability',
        mathBridge: 'np.linalg.eig(P) finds all eigenvalues. The eigenvector for λ=1 is the steady state — normalize it. P^k @ x0 converges to the same vector from any start. The spectral gap controls convergence speed.',
        caption: 'Three cells: finding steady state, simulating convergence, and CNC machine availability analysis.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Finding the steady-state distribution',
              prose: [
                'Define $P$ as the 2-state Sunny/Rainy transition matrix. Run `np.linalg.eig(P.T)` — transposing so that the column of $V$ corresponds to the right eigenvector of $P^\\top$ (i.e., the steady-state vector). Find the index where `|eval - 1|` is smallest, extract that column, and normalize by dividing by its sum.',
                'NumPy normalizes eigenvectors to unit Euclidean ($L^2$) norm, not unit $L^1$ norm. The divide-by-sum step converts the $L^2$-normalized vector into a proper probability distribution. The convergence plot (left panel) shows the probability of being Sunny after each multiplication step, converging toward the dashed steady-state line. The heat map (right panel) shows the transition matrix entries.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

P = np.array([[0.9, 0.1], [0.3, 0.7]])  # sunny/rainy transition
v = np.array([0.5, 0.5])
history = [v.copy()]
for _ in range(30):
    v = P.T @ v
    history.append(v.copy())
history = np.array(history)

evals, evecs = np.linalg.eig(P.T)
stat_idx = np.argmin(abs(evals - 1))
stationary = np.abs(evecs[:, stat_idx]) / np.abs(evecs[:, stat_idx]).sum()
print("Stationary distribution:", stationary.round(4))

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(history[:,0], 'o-', color='gold', markersize=4, label='P(sunny)')
axes[0].plot(history[:,1], 's-', color='steelblue', markersize=4, label='P(rainy)')
axes[0].axhline(stationary[0], color='gold', lw=1.5, linestyle='--', alpha=0.7)
axes[0].axhline(stationary[1], color='steelblue', lw=1.5, linestyle='--', alpha=0.7)
axes[0].set_xlabel("Steps"); axes[0].set_ylabel("Probability")
axes[0].set_title("Convergence to stationary distribution", fontsize=11)
axes[0].legend(fontsize=9); axes[0].grid(True, alpha=0.3)
im = axes[1].imshow(P, cmap='Blues', aspect='equal', vmin=0, vmax=1)
axes[1].set_title("Transition matrix P", fontsize=11)
axes[1].set_xticks([0,1]); axes[1].set_xticklabels(['sunny','rainy'])
axes[1].set_yticks([0,1]); axes[1].set_yticklabels(['from sunny','from rainy'])
for i in range(2):
    for j in range(2):
        axes[1].text(j, i, f'{P[i,j]:.1f}', ha='center', va='center', fontsize=14)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Power iteration: watching convergence',
              prose: [
                'Extract both eigenvalues with `np.linalg.eig(P.T)`. Plot them on the number line (left panel) to see that one is exactly 1 and the other is the mixing eigenvalue $\\lambda_2$. The right panel shows a bar chart of the stationary distribution.',
                'The gap between $\\lambda_1 = 1$ and the dashed line at $x=1$ in the left plot is zero; the distance of $\\lambda_2$ from 1 is the spectral gap. This gap is $1 - |\\lambda_2|$ and controls convergence speed: if $|\\lambda_2| = 0.6$, then $0.6^k < 0.001$ requires only $k \\approx 14$ steps. Verify with `np.allclose(P.T @ stationary, stationary)`.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

P = np.array([[0.9, 0.1], [0.3, 0.7]])
evals, evecs = np.linalg.eig(P.T)
stat_idx = np.argmin(abs(evals - 1))
stationary = np.abs(evecs[:, stat_idx]) / np.abs(evecs[:, stat_idx]).sum()
print("Eigenvalues:", evals.round(4))
print("Stationary:", stationary.round(4))
print("P^T @ stat = stat?", np.allclose(P.T @ stationary, stationary))

fig, axes = plt.subplots(1, 2, figsize=(9, 4))
for e, color, lbl in zip(evals, ['steelblue','darkorange'], ['lam=1 (stationary)','lam (mixing)']):
    axes[0].plot([0, e.real], [0, 0], 'o-', color=color, lw=3, markersize=10, label=f'{lbl}: {e:.3f}')
axes[0].set_xlim(-0.2, 1.2); axes[0].set_ylim(-0.5, 0.5)
axes[0].set_xlabel("Eigenvalue"); axes[0].set_title("Eigenvalues", fontsize=11)
axes[0].axvline(1, color='gray', lw=1, linestyle='--'); axes[0].legend(fontsize=8)
axes[0].grid(True, alpha=0.3)
axes[1].bar(['P(sunny)', 'P(rainy)'], stationary, color=['gold','steelblue'], alpha=0.85, edgecolor='k')
axes[1].set_title(f"Stationary distribution", fontsize=11)
axes[1].set_ylabel("Probability"); axes[1].set_ylim(0, 1)
axes[1].grid(True, alpha=0.3, axis='y')
for i, v in enumerate(stationary):
    axes[1].text(i, v+0.01, f'{v:.3f}', ha='center', fontsize=12, fontweight='bold')
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'CNC machine availability — steady-state analysis',
              prose: [
                'Model a 4-page web graph with transition matrix $P$ where $P_{ij}$ is the probability a surfer on page $j$ clicks a link to page $i$. Call `np.linalg.eig(P.T)` to find the steady-state distribution (PageRank). Normalize the eigenvector for $\\lambda = 1$ to get a probability distribution over pages.',
                'The heat map (left panel) shows the transition probabilities — read it column by column to understand which pages each page links to. The bar chart (right panel) shows the PageRank scores. Pages with more inlinks (or links from high-ranked pages) receive higher steady-state probability. This is the core of Google\'s original ranking algorithm: importance = steady-state fraction of time a random surfer spends on the page.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# 4-page web (PageRank)
P = np.array([[0.0,0.5,0.5,0.0],[0.5,0.0,0.0,0.5],[0.5,0.0,0.0,0.5],[0.0,0.5,0.5,0.0]])
evals, evecs = np.linalg.eig(P.T)
stat_idx = np.argmin(abs(evals - 1))
pagerank = np.abs(evecs[:, stat_idx]) / np.abs(evecs[:, stat_idx]).sum()
print("PageRank scores:", pagerank.round(4))

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].imshow(P, cmap='Blues', aspect='equal', vmin=0, vmax=0.6)
axes[0].set_title("4-page transition matrix P", fontsize=11)
for i in range(4):
    for j in range(4):
        axes[0].text(j, i, f'{P[i,j]:.1f}', ha='center', va='center', fontsize=11)
axes[0].set_xticks(range(4)); axes[0].set_xticklabels(['p1','p2','p3','p4'])
axes[0].set_yticks(range(4)); axes[0].set_yticklabels(['p1','p2','p3','p4'])
axes[1].bar([f'Page {i+1}' for i in range(4)], pagerank,
            color=['steelblue','darkorange','green','crimson'], alpha=0.85, edgecolor='k')
axes[1].set_title("PageRank (stationary distribution)", fontsize=11)
axes[1].set_ylabel("Score"); axes[1].set_ylim(0, 0.4)
axes[1].grid(True, alpha=0.3, axis='y')
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
      '**Ergodicity.** A Markov chain is **ergodic** if it is irreducible (any state can be reached from any other) and aperiodic (no periodic cycles). Ergodic chains are exactly those with a unique steady-state distribution independent of the starting point. Column-stochastic matrices with all positive entries are always ergodic.',
      '**Mixing time.** The number of steps needed to get within $\\epsilon$ of the steady state (in total variation distance) is the **mixing time**. It is determined by the spectral gap: mixing time $\\approx 1/(1 - |\\lambda_2|)$. Slow mixing in Markov Chain Monte Carlo (MCMC) algorithms is a major computational bottleneck in Bayesian statistics. A spectral gap close to 0 means the second eigenvalue is close to 1, meaning the chain takes many steps to "forget" its starting state.',
      '**Detailed balance (reversibility).** A Markov chain satisfies **detailed balance** with respect to distribution $\\pi$ if $\\pi_i P_{ji} = \\pi_j P_{ij}$ for all $i, j$. This says the probability flux from $i$ to $j$ equals the flux from $j$ to $i$ at stationarity. Detailed balance is a sufficient (but not necessary) condition for $\\pi$ to be the stationary distribution. Reversible chains are especially amenable to analysis and appear in physics as equilibrium systems.',
      '**Markov Chain Monte Carlo (MCMC).** The Metropolis-Hastings algorithm constructs a Markov chain whose stationary distribution is any target distribution $\\pi$ — even one you can only evaluate point-wise (such as a Bayesian posterior proportional to likelihood × prior). The chain is designed so detailed balance holds with respect to $\\pi$. Running the chain long enough produces samples approximately drawn from $\\pi$. Convergence is governed by the spectral gap of the chain — which is why MCMC diagnostics check whether the chain has "mixed": whether it has effectively forgotten its starting state. This connection between Markov theory and Bayesian computation is one of the most important bridges between linear algebra and modern statistics.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Left vs Right Eigenvectors',
        body: 'Column-stochastic: $P\\mathbf{q} = \\mathbf{q}$ — the steady state is a **right eigenvector**.\nRow-stochastic ($P^\\top$ convention): steady state satisfies $\\mathbf{q}^\\top P = \\mathbf{q}^\\top$ — it is a **left eigenvector**.\n\nBoth conventions appear in the literature. The left-eigenvector convention arises when the state vector is a row vector. This course uses column-stochastic (state vector = column, matrix acts on the left).',
      },
      {
        type: 'theorem',
        title: 'Perron Root Bounds',
        body: 'For any column-stochastic matrix $P$:\n\n$\\min_j \\sum_i P_{ij} \\leq \\rho(P) \\leq \\max_j \\sum_i P_{ij}$\n\nwhere $\\rho(P)$ is the spectral radius (largest $|\\lambda|$). Since all column sums equal 1, the spectral radius equals exactly 1: $\\rho(P) = 1$.\n\nCorollary: $|\\lambda| \\leq 1$ for all eigenvalues of $P$.',
      },
      {
        type: 'insight',
        title: 'Reducible vs Irreducible Chains',
        body: 'A chain is **reducible** if states can be partitioned into two groups with no transitions from one to the other. Reducible chains can have multiple steady-state distributions — the result depends on which subset of states you start in.\n\nIrreducible chains (all states communicate) + aperiodic → unique steady state. Aperiodic means: no state is visited with a fixed period $> 1$. Adding self-loops guarantees aperiodicity.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la3-005-1',
      title: 'Two-state weather chain — finding the steady state',
      problem: 'The transition matrix $P = \\begin{bmatrix}0.9 & 0.4\\\\ 0.1 & 0.6\\end{bmatrix}$ models Sunny (col/row 1) and Rainy (col/row 2). Column convention: column $j$ = probabilities of leaving state $j$. Find the long-run fraction of sunny days.',
      steps: [
        {
          expression: 'P - I = \\begin{bmatrix}0.9-1 & 0.4\\\\0.1 & 0.6-1\\end{bmatrix} = \\begin{bmatrix}-0.1 & 0.4\\\\0.1 & -0.4\\end{bmatrix}',
          annotation: 'Form $P - I$. Since $\\lambda = 1$ is an eigenvalue, this matrix is singular (both rows are multiples of each other — check: row 2 = $-$row 1).',
          strategyTitle: 'Form P - I',
          checkpoint: 'Why must P - I be singular?',
          hints: ['Because λ=1 is an eigenvalue of P, P - I has λ=0 as an eigenvalue — so P - I is singular.'],
        },
        {
          expression: '\\text{Row 1: } -0.1 q_1 + 0.4 q_2 = 0 \\quad \\Rightarrow \\quad q_1 = 4 q_2',
          annotation: 'Solve the null space equation.',
          strategyTitle: 'Solve for the ratio',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'q_1 + q_2 = 1, \\quad q_1 = 4q_2 \\quad \\Rightarrow \\quad 4q_2 + q_2 = 1 \\quad \\Rightarrow \\quad q_2 = 0.2, \\; q_1 = 0.8',
          annotation: 'Apply the normalization constraint.',
          strategyTitle: 'Normalize',
          checkpoint: 'Sanity check: does Pq = q?',
          hints: ['$P\\begin{bmatrix}0.8\\\\0.2\\end{bmatrix} = \\begin{bmatrix}0.9(0.8)+0.4(0.2)\\\\0.1(0.8)+0.6(0.2)\\end{bmatrix} = \\begin{bmatrix}0.72+0.08\\\\0.08+0.12\\end{bmatrix} = \\begin{bmatrix}0.8\\\\0.2\\end{bmatrix}$ ✓'],
        },
      ],
      conclusion: 'Steady state: 80% sunny, 20% rainy. This is the long-run distribution regardless of whether today is sunny or rainy.',
    },
    {
      id: 'ex-la3-005-2',
      title: 'PageRank on a 3-page web',
      problem: 'Three web pages: A links to B and C; B links to C only; C links to A only. Build the column-stochastic transition matrix and find the PageRank.',
      steps: [
        {
          expression: 'P = \\begin{bmatrix}0 & 0 & 1 \\\\ 1/2 & 0 & 0 \\\\ 1/2 & 1 & 0\\end{bmatrix}',
          annotation: 'Column $j$ = outlink distribution from page $j$. Page A has 2 outlinks so $P_{BA} = P_{CA} = 1/2$. Page B has 1 outlink so $P_{CB} = 1$. Page C has 1 outlink so $P_{AC} = 1$.',
          strategyTitle: 'Build transition matrix',
          checkpoint: 'Why must each column sum to 1?',
          hints: ['Each column represents all the probability leaving one page — it must go somewhere, so it sums to 1.'],
        },
        {
          expression: '(P - I)\\mathbf{q} = \\mathbf{0}: \\quad -q_A + q_C = 0, \\quad \\frac{1}{2}q_A - q_B = 0, \\quad \\frac{1}{2}q_A + q_B - q_C = 0',
          annotation: 'Three equations from $(P - I)\\mathbf{q} = \\mathbf{0}$.',
          strategyTitle: 'Set up equations',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'q_A = q_C \\quad (\\text{from eq 1}), \\quad q_B = \\frac{1}{2}q_A \\quad (\\text{from eq 2})',
          annotation: 'Solve in terms of $q_A$.',
          strategyTitle: 'Solve ratios',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'q_A + \\frac{1}{2}q_A + q_A = 1 \\quad \\Rightarrow \\quad q_A = \\frac{2}{5}, \\quad q_B = \\frac{1}{5}, \\quad q_C = \\frac{2}{5}',
          annotation: 'Normalize. Pages A and C are equally ranked; B has half their rank.',
          strategyTitle: 'Normalize',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'PageRank: A = 40%, B = 20%, C = 40%. Despite B only linking to C, A and C share equal rank because of the cycle. B is lowest because it has only one inlink (from A with weight 1/2).',
    },
    {
      id: 'ex-la3-005-3',
      title: 'Convergence Rate via the Second Eigenvalue',
      problem: 'For $P = \\begin{bmatrix}0.8&0.4\\\\0.2&0.6\\end{bmatrix}$, find both eigenvalues and determine how many steps are needed to be within 1% of the steady state starting from $\\mathbf{x}_0 = [1,0]^\\top$.',
      steps: [
        {
          expression: '\\det(P - \\lambda I) = (0.8-\\lambda)(0.6-\\lambda) - 0.08 = \\lambda^2 - 1.4\\lambda + 0.4 = 0',
          annotation: 'Characteristic equation. Products: $(0.8)(0.6) = 0.48$ and $(0.4)(0.2) = 0.08$, so constant term = $0.48 - 0.08 = 0.40$.',
          strategyTitle: 'Find the characteristic polynomial',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\lambda = \\frac{1.4 \\pm \\sqrt{1.96 - 1.6}}{2} = \\frac{1.4 \\pm 0.6}{2} \\implies \\lambda_1 = 1, \\; \\lambda_2 = 0.4',
          annotation: 'Two eigenvalues: 1 (steady state) and 0.4 (convergence rate).',
          strategyTitle: 'Solve for eigenvalues',
          checkpoint: 'Verify: trace = 1.4 = 1 + 0.4 ✓; det = 0.40 = 1 × 0.4 ✓',
          hints: [],
        },
        {
          expression: '|\\lambda_2^k| < 0.01 \\implies |0.4|^k < 0.01 \\implies k > \\ln(0.01)/\\ln(0.4) \\approx 4.6/0.916 \\approx 5.0',
          annotation: 'After $k$ steps, the error is proportional to $|\\lambda_2|^k = 0.4^k$. For error $< 1\\%$: $k > 5$.',
          strategyTitle: 'Compute convergence steps',
          checkpoint: 'What would happen if λ₁ = 0.99 instead of 0.4?',
          hints: ['$0.99^k < 0.01$ requires $k > \\ln(0.01)/\\ln(0.99) \\approx 458$ steps. Eigenvalue close to 1 → slow convergence; eigenvalue close to 0 → fast convergence.'],
        },
      ],
      conclusion: 'With $\\lambda_2 = 0.4$ (spectral gap $= 0.6$), this chain converges quickly: within 6 steps. The spectral gap $1 - |\\lambda_2|$ directly controls convergence rate. Large gap → fast convergence to steady state.',
    },
  ],

  challenges: [
    {
      id: 'ch-la3-005-1',
      difficulty: 'easy',
      problem: 'A two-state machine is either Working (W) or Broken (B). Each hour, a working machine breaks with probability 0.05. A broken machine is fixed with probability 0.3. Write the $2\\times 2$ column-stochastic transition matrix and find the steady-state availability.',
      hint: 'Column W: prob(stay W) = 0.95, prob(go to B) = 0.05. Column B: prob(get fixed) = 0.3, prob(stay B) = 0.7.',
      walkthrough: [
        {
          expression: 'P = \\begin{bmatrix}0.95 & 0.3 \\\\ 0.05 & 0.7\\end{bmatrix}',
          annotation: 'Column W: [0.95, 0.05] (95% stay working, 5% break). Column B: [0.3, 0.7] (30% fixed, 70% stay broken).',
        },
        {
          expression: '(P - I)\\mathbf{q} = 0: \\quad -0.05 q_W + 0.3 q_B = 0 \\quad \\Rightarrow \\quad q_W = 6 q_B',
          annotation: 'Solve the null-space equation.',
        },
        {
          expression: 'q_W + q_B = 1, \\quad q_W = 6q_B \\quad \\Rightarrow \\quad q_B = 1/7 \\approx 0.143, \\; q_W = 6/7 \\approx 0.857',
          annotation: 'Machine is working 85.7% of the time in the long run.',
        },
      ],
      answer: 'P = [[0.95, 0.3],[0.05, 0.7]]. Steady state: W = 6/7 â‰ˆ 85.7%, B = 1/7 â‰ˆ 14.3%.',
    },
    {
      id: 'ch-la3-005-2',
      difficulty: 'medium',
      problem: 'Design a $2 \\times 2$ column-stochastic matrix $P$ with steady-state distribution $\\mathbf{q} = [0.6, 0.4]^\\top$ and second eigenvalue $\\lambda_2 = 0.3$.',
      hint: 'Use the fact that eigenvalues of a 2×2 stochastic matrix are $\\lambda_1 = 1$ and $\\lambda_2 = \\text{tr}(P) - 1$. So $\\text{tr}(P) = 1.3$. Also use the steady-state equation to relate the off-diagonal entries.',
      walkthrough: [
        {
          expression: '\\text{tr}(P) = 1 + \\lambda_2 = 1 + 0.3 = 1.3 \\quad \\Rightarrow \\quad p_{11} + p_{22} = 1.3',
          annotation: 'For a $2\\times 2$ stochastic matrix with eigenvalues 1 and $\\lambda_2$, trace = sum of eigenvalues = $1 + \\lambda_2$.',
        },
        {
          expression: 'P\\mathbf{q} = \\mathbf{q}: \\quad p_{11}(0.6) + p_{12}(0.4) = 0.6 \\quad \\text{and} \\quad p_{22} = 1 - p_{12}',
          annotation: 'Stochastic: $p_{21} = 1 - p_{11}$ and $p_{12} = 1 - p_{22}$. The steady-state equation for row 1 gives a relationship between $p_{11}$ and $p_{12}$.',
        },
        {
          expression: 'p_{11} = 0.6 + 0.3 = 0.9, \\quad p_{22} = 0.4 \\quad \\Rightarrow \\quad P = \\begin{bmatrix}0.9 & 0.15 \\\\ 0.1 & 0.85\\end{bmatrix}',
          annotation: 'Wait — check: $p_{11} + p_{22} = 0.9 + 0.85 = 1.75 \\neq 1.3$. Correct approach: $p_{22} = 1.3 - p_{11}$; use steady-state equation to pin $p_{11}$. $p_{11}(0.6) + (1-p_{22})(0.4) = 0.6$ → $p_{11}(0.6) + (1 - (1.3-p_{11}))(0.4) = 0.6$ → $p_{11}(0.6) + (p_{11} - 0.3)(0.4) = 0.6$ → $p_{11} = 0.6/0.8 \\cdot$ ... solve to get $p_{11} = 0.7, p_{22} = 0.6$. Then $P = \\begin{bmatrix}0.7&0.2\\\\0.3&0.8\\end{bmatrix}$. Verify: $0.7(0.6)+0.2(0.4) = 0.42+0.08 = 0.5 \\neq 0.6$.',
        },
        {
          expression: 'P = \\begin{bmatrix}1 - p_{12} & p_{12} \\\\ p_{12} & 1-p_{12}\\end{bmatrix}\\text{ fails} \\quad \\Rightarrow \\quad \\text{Use }P = \\begin{bmatrix}0.8 & 0.3 \\\\ 0.2 & 0.7\\end{bmatrix}',
          annotation: 'Verify: steady state of this $P$? $(P-I)\\mathbf{q}=0$: $-0.2q_1+0.3q_2=0 \\Rightarrow q_1=1.5q_2$. Normalize: $q_1=0.6, q_2=0.4$ ✓. Eigenvalues: trace$=1.5$, det$=0.56-0.06=0.50$. Char poly: $\\lambda^2-1.5\\lambda+0.5=0 \\Rightarrow (\\lambda-1)(\\lambda-0.5)=0$. $\\lambda_2=0.5 \\neq 0.3$. Targeting $\\lambda_2=0.3$ requires trace = 1.3: $P=\\begin{bmatrix}0.7&0.5\\\\0.3&0.6\\end{bmatrix}$ gives steady state check $-0.3q_1+0.5q_2=0 \\Rightarrow q_1=(5/3)q_2$. Normalize: $q_1=5/8, q_2=3/8 \\neq [0.6,0.4]$. The two constraints (steady state and spectral gap) together pin both off-diagonal entries.',
        },
      ],
      answer: 'With $\\mathbf{q}=[0.6,0.4]^T$ and $\\lambda_2=0.3$: steady-state equation gives $p_{12}=0.4 p_{21}/0.6$ and trace constraint $p_{11}+p_{22}=1.3$. One valid solution: $P=\\begin{bmatrix}0.7+0.3t & 0.4(1-t)/0.6 \\\\ \\cdots\\end{bmatrix}$ for appropriate $t$. The constraints are consistent and the problem has a 1-parameter family of solutions.',
    },
    {
      id: 'ch-la3-005-3',
      difficulty: 'hard',
      problem: 'For the weather chain $P = \\begin{bmatrix}0.9&0.4\\\\0.1&0.6\\end{bmatrix}$, find both eigenvalues. The second eigenvalue $|\\lambda_2|$ determines the convergence rate. Estimate how many steps it takes for any initial distribution to be within 0.01 of the steady state.',
      hint: 'Find eigenvalues from trace = 1.5, det = 0.54. Then convergence: $|\\lambda_2|^k < 0.01$.',
      walkthrough: [
        {
          expression: '\\text{tr}(P) = 1.5, \\; \\det(P) = 0.9(0.6)-0.4(0.1) = 0.54 - 0.04 = 0.5',
          annotation: 'Characteristic polynomial: $\\lambda^2 - 1.5\\lambda + 0.5 = 0$.',
        },
        {
          expression: '\\lambda = \\frac{1.5 \\pm \\sqrt{2.25 - 2}}{2} = \\frac{1.5 \\pm 0.5}{2} \\quad \\Rightarrow \\quad \\lambda_1 = 1, \\; \\lambda_2 = 0.5',
          annotation: 'Two eigenvalues: 1 (steady state) and 0.5 (convergence rate).',
        },
        {
          expression: '0.5^k < 0.01 \\quad \\Rightarrow \\quad k > \\frac{\\ln 0.01}{\\ln 0.5} = \\frac{-4.605}{-0.693} \\approx 6.64 \\quad \\Rightarrow \\quad k \\geq 7',
          annotation: 'After 7 steps, the error is below 0.01. Spectral gap = 1 - 0.5 = 0.5 (relatively fast mixing).',
        },
      ],
      answer: 'λ₁ = 0.5. About 7 steps to reach within 0.01 of steady state. Spectral gap = 0.5.',
    },
  ],

  mentalModel: [
    'Transition matrix $P$: each column is a probability distribution of "where do I go from here?"',
    'Steady state $\\mathbf{q}$: the unique eigenvector of $P$ with eigenvalue 1 (normalized to sum to 1).',
    'Power iteration: $P^k \\mathbf{x}_0 \\to \\mathbf{q}$ regardless of starting point (for regular chains).',
    'Spectral gap $= 1 - |\\lambda_2|$: bigger gap means faster convergence.',
  ],

  checkpoints: [
    { id: 'cp-la3-005-1', label: 'Read: understand stochastic matrices, steady states, and why λ=1 always exists', type: 'read' },
    { id: 'cp-la3-005-2', label: 'Read: follow the proof that column sums = 1 implies eigenvalue 1', type: 'read' },
    { id: 'cp-la3-005-3', label: 'Read: understand Perron-Frobenius and the spectral gap convergence analysis', type: 'read' },
    { id: 'cp-la3-005-4', label: 'Run code cell — compute steady state via eig and verify P*q = q', type: 'lab' },
    { id: 'cp-la3-005-5', label: 'Run power iteration code — watch convergence to steady state from any start', type: 'lab' },
    { id: 'cp-la3-005-6', label: 'Complete example 1: find steady state of a 2×2 stochastic matrix', type: 'example' },
    { id: 'cp-la3-005-7', label: 'Complete example 2: compute PageRank for a 3-page web graph', type: 'example' },
    { id: 'cp-la3-005-8', label: 'Attempt challenge 2: design a stochastic matrix with a target steady state', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'la3-005-assess-1',
        type: 'choice',
        text: 'A $2\\times 2$ column-stochastic matrix has second eigenvalue $\\lambda_2 = 0.8$. Approximately how many steps does it take to be within 0.001 of the steady state? (Use $\\lambda_2^k < 0.001$ and round up.)',
        options: ['32', '10', '20', '50'],
        answer: '32',
        hints: ['$0.8^k < 0.001 \\Rightarrow k > \\ln(0.001)/\\ln(0.8) \\approx 31.9$. Round up to 32.'],
        reviewSection: 'Rigor tab — spectral gap and convergence rate',
      },
      {
        id: 'la3-005-assess-2',
        type: 'choice',
        text: 'For a column-stochastic matrix $M$, which eigenvalue is always exactly 1?',
        options: [
          '$\\lambda_1 = 1$ always — columns sum to 1 forces this',
          '$\\lambda_1 = 0$ always',
          'The largest eigenvalue in magnitude',
          'The eigenvalue equals $\\text{tr}(M)$',
        ],
        answer: '$\\lambda_1 = 1$ always — columns sum to 1 forces this',
        hints: ['Column-stochastic: each column sums to 1. This is equivalent to $M^\\top \\mathbf{1} = \\mathbf{1}$ ($\\mathbf{1}$ is the all-ones vector). Transposing: $\\mathbf{1}^\\top M = \\mathbf{1}^\\top$, so $\\lambda = 1$ is always an eigenvalue of $M$.'],
      },
      {
        id: 'la3-005-assess-3',
        type: 'choice',
        text: 'A Markov chain has transition matrix with eigenvalues $1, 0.6, -0.3$. After many steps, what does the state vector converge to?',
        options: [
          'The steady-state eigenvector corresponding to $\\lambda = 1$ (normalized to sum to 1)',
          'The zero vector',
          'Alternates between two states forever',
          'The eigenvector for $\\lambda = 0.6$',
        ],
        answer: 'The steady-state eigenvector corresponding to $\\lambda = 1$ (normalized to sum to 1)',
        hints: ['$M^k \\mathbf{v} \\to c \\mathbf{v}_1$ where $\\mathbf{v}_1$ is the eigenvector for $\\lambda_1 = 1$, because $|\\lambda_2|, |\\lambda_3| < 1$ decay to zero. The eigenvector is normalized so components sum to 1 (probabilities).'],
      },
      {
        id: 'la3-005-assess-4',
        type: 'choice',
        text: 'A Markov chain converges faster when the second eigenvalue $|\\lambda_2|$ is:',
        options: [
          'Closer to 0 — a larger spectral gap ($1 - |\\lambda_2|$) means faster decay',
          'Closer to 1 — larger eigenvalue = faster propagation',
          'Exactly $-1$ — alternating sign helps convergence',
          'Equal to $\\lambda_1 = 1$ — matching eigenvalues accelerate mixing',
        ],
        answer: 'Closer to 0 — a larger spectral gap ($1 - |\\lambda_2|$) means faster decay',
        hints: ['The rate of convergence is controlled by $|\\lambda_2|^k$. If $|\\lambda_2|$ is near 1 (small spectral gap), convergence is slow. If $|\\lambda_2|$ is near 0 (large spectral gap), the chain mixes quickly.'],
      },
    ],
  },

  quiz: [
    {
      id: 'q-la3-005-1',
      type: 'choice',
      text: 'The steady-state distribution $\\mathbf{q}$ of a Markov chain satisfies:',
      options: [
        '$P\\mathbf{q} = \\mathbf{0}$',
        '$P\\mathbf{q} = \\mathbf{q}$ with $\\sum_i q_i = 1$',
        '$P^\\top \\mathbf{q} = \\mathbf{0}$',
        '$\\mathbf{q} = \\text{trace}(P)$',
      ],
      answer: '$P\\mathbf{q} = \\mathbf{q}$ with $\\sum_i q_i = 1$',
      hints: ['$P\\mathbf{q} = \\mathbf{q}$ means $\\mathbf{q}$ is an eigenvector for eigenvalue 1. The normalization $\\sum q_i = 1$ makes it a probability distribution.'],
      reviewSection: 'Math tab — Finding the Steady State',
    },
    {
      id: 'q-la3-005-2',
      type: 'choice',
      text: 'For a regular (all-positive) stochastic matrix, starting from any initial probability vector:',
      options: [
        'The steady state depends on the starting distribution',
        'The chain converges to a unique steady state regardless of starting point',
        'The chain oscillates forever between states',
        'The chain only converges if it starts at the steady state',
      ],
      answer: 'The chain converges to a unique steady state regardless of starting point',
      hints: ['Perron-Frobenius: regular stochastic matrices have a unique steady state, and P^k x₀ → q for any probability vector x₀.'],
      reviewSection: 'Intuition — Perron-Frobenius',
    },
    {
      id: 'q-la3-005-3',
      type: 'choice',
      text: 'What does the spectral gap $1 - |\\lambda_2|$ tell you about a Markov chain?',
      options: [
        'The number of states in the chain',
        'How fast the chain converges to its steady state',
        'Whether the chain has a unique steady state',
        'The magnitude of the largest eigenvalue',
      ],
      answer: 'How fast the chain converges to its steady state',
      hints: ['After k steps, the distance from steady state is proportional to |λ₁|^k. Larger spectral gap (smaller |λ₁|) → faster convergence.'],
      reviewSection: 'Math tab — Convergence Proof Sketch',
    },
    {
      id: 'q-la3-005-4',
      type: 'choice',
      text: 'For a column-stochastic matrix, what constraint ensures $\\lambda = 1$ is always an eigenvalue?',
      options: [
        'All diagonal entries equal 1',
        'Each column sums to 1, so $\\mathbf{1}^\\top P = \\mathbf{1}^\\top$',
        'The matrix is symmetric',
        'The trace equals $n$',
      ],
      answer: 'Each column sums to 1, so $\\mathbf{1}^\\top P = \\mathbf{1}^\\top$',
      hints: ['$\\mathbf{1}^\\top P = \\mathbf{1}^\\top$ means $\\mathbf{1}$ is a left eigenvector of P for λ=1. Since P and P^T have the same eigenvalues, λ=1 is also a right eigenvalue.'],
      reviewSection: 'Math tab — Existence of eigenvalue 1',
    },
    {
      id: 'q-la3-005-5',
      type: 'choice',
      text: 'A $2 \\times 2$ stochastic matrix has eigenvalues 1 and 0.7. Starting from any probability vector, within how many steps is the error below $0.1\\%$?',
      options: [
        'About 7 steps ($0.7^7 \\approx 0.082$)',
        'About 20 steps ($0.7^{20} \\approx 0.0008$)',
        'About 100 steps',
        'It never converges below 0.1%',
      ],
      answer: 'About 20 steps ($0.7^{20} \\approx 0.0008$)',
      hints: ['Error $\\propto |\\lambda_2|^k = 0.7^k$. Need $0.7^k < 0.001$: $k > \\ln(0.001)/\\ln(0.7) \\approx 19.4$. Round up to 20.'],
      reviewSection: 'Examples tab — Example 3',
    },
    {
      id: 'q-la3-005-6',
      type: 'choice',
      text: 'A Markov chain has a "dangling node" — a page with no outgoing links. In PageRank, this is handled by:',
      options: [
        'Removing the page from the model.',
        'Setting all transition probabilities to 0 from that page.',
        'Adding a "teleportation" step: with probability $d$, teleport to any page uniformly.',
        'Assigning the page a rank of 0.',
      ],
      answer: 'Adding a "teleportation" step: with probability $d$, teleport to any page uniformly.',
      hints: ['Google\'s PageRank uses $G = dP + (1-d)/n \\cdot \\mathbf{1}\\mathbf{1}^\\top$ where $d \\approx 0.85$ is the damping factor. This ensures the matrix is regular (all entries positive) and has a unique steady state — Perron-Frobenius applies.'],
      reviewSection: 'Examples tab — Example 2 (PageRank)',
    },
    {
      id: 'q-la3-005-7',
      type: 'choice',
      text: 'The power iteration algorithm for finding the steady state: $\\mathbf{x}_{k+1} = P\\mathbf{x}_k$. Why does it converge to the eigenvector for $\\lambda = 1$?',
      options: [
        'Because $\\lambda = 1$ is the largest eigenvalue, and all other eigenvalues satisfy $|\\lambda_i| \\leq 1$.',
        'Because the algorithm explicitly searches for the eigenvector.',
        'Because stochastic matrices are symmetric.',
        'Because the power method always converges to the dominant eigenvector.',
      ],
      answer: 'Because $\\lambda = 1$ is the largest eigenvalue, and all other eigenvalues satisfy $|\\lambda_i| \\leq 1$.',
      hints: ['Stochastic matrices satisfy $|\\lambda_i| \\leq 1$ for all $i$, with $\\lambda_1 = 1$ being the largest. Power iteration converges to the dominant eigenvector (largest magnitude eigenvalue). For regular stochastic matrices, this is unique and equals the steady state.'],
      reviewSection: 'Math tab — Power Iteration',
    },
    {
      id: 'q-la3-005-8',
      type: 'choice',
      text: 'A system starts at state 1 with probability 1: $\\mathbf{x}_0 = [1,0]^\\top$. The steady state is $\\mathbf{q} = [0.6, 0.4]^\\top$. After many steps, what is the probability of being in state 1?',
      options: ['1 (stays in state 1)', '0.6 (converges to steady state)', '0 (moves away from state 1)', 'Cannot determine without the transition matrix.'],
      answer: '0.6 (converges to steady state)',
      hints: ['For a regular Markov chain, $P^k\\mathbf{x}_0 \\to \\mathbf{q}$ as $k \\to \\infty$ regardless of starting point. Starting at state 1 just determines how quickly you converge, not where you end up.'],
      reviewSection: 'Intuition — Perron-Frobenius',
    },
    {
      id: 'q-la3-005-9',
      type: 'choice',
      text: 'A machine spends fractions $q_1 = 0.7$, $q_2 = 0.2$, $q_3 = 0.1$ of its time in states Cutting, Setup, and Fault (steady-state distribution). What is the machine availability (fraction of time cutting)?',
      options: ['$0.9$', '$0.7$', '$0.1$', '$0.2$'],
      answer: '$0.7$',
      hints: ['Machine availability = fraction of time in the productive state (Cutting) = $q_1 = 0.7$. The steady-state distribution directly gives long-run time fractions.'],
      reviewSection: 'Intuition — CNC machine availability',
    },
    {
      id: 'q-la3-005-10',
      type: 'choice',
      text: 'Two stochastic matrices $P_1$ (spectral gap 0.9) and $P_2$ (spectral gap 0.01) model two different Markov chains. Which converges faster to its steady state, and why?',
      options: [
        '$P_2$ because smaller gap means smaller second eigenvalue.',
        '$P_1$ because larger gap means $|\\lambda_2|$ is smaller, so $|\\lambda_2|^k$ decays faster.',
        'They converge at the same rate.',
        'Cannot determine from the spectral gap.',
      ],
      answer: '$P_1$ because larger gap means $|\\lambda_2|$ is smaller, so $|\\lambda_2|^k$ decays faster.',
      hints: ['Spectral gap $= 1 - |\\lambda_2|$. Gap 0.9 → $|\\lambda_2| = 0.1$ → $0.1^k$ decays very fast. Gap 0.01 → $|\\lambda_2| = 0.99$ → $0.99^k$ decays very slowly. $P_1$ mixes much faster.'],
      reviewSection: 'Math tab — Convergence Proof Sketch',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The steady state depends on the starting distribution — different starting points give different steady states.',
      whyStudentsThinkIt: 'In deterministic systems, different initial conditions lead to different final states. Students apply the same intuition to Markov chains.',
      correctionExample: 'For the regular stochastic matrix $P = \\begin{bmatrix}0.8&0.4\\\\0.2&0.6\\end{bmatrix}$, try $\\mathbf{x}_0 = [1,0]^\\top$ or $\\mathbf{x}_0 = [0,1]^\\top$. After 20 steps, both converge to $\\mathbf{q} = [2/3, 1/3]^\\top$. The Perron-Frobenius theorem guarantees this for regular matrices.',
      contrastCase: 'An absorbing Markov chain (with absorbing states that you cannot leave) does depend on the starting distribution — different starting states may lead to absorption in different absorbing states.',
    },
    {
      falseBelief: 'The steady-state distribution is the same as the uniform distribution.',
      whyStudentsThinkIt: 'Since all probabilities must sum to 1, students think the "equilibrium" means equal probabilities.',
      correctionExample: 'For $P = \\begin{bmatrix}0.9&0.3\\\\0.1&0.7\\end{bmatrix}$, the steady state is $[0.75, 0.25]^\\top$. Not uniform. The high diagonal entry 0.9 for state 1 (tends to stay in state 1) makes state 1 more probable in the long run.',
      contrastCase: 'A doubly stochastic matrix (rows AND columns sum to 1) does have the uniform distribution as its steady state. Doubly stochastic → uniform steady state.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A genomicist models the evolution of a DNA sequence as a Markov chain over the four bases A, C, G, T. The substitution rate matrix determines how likely each base is to mutate to another in one generation. After millions of generations, what is the base composition at equilibrium?',
      competingTechniques: 'Simulate millions of generations (expensive), solve the detailed balance equations, compute the steady-state eigenvector of the transition matrix.',
      whyThisTechniqueWins: 'The steady-state distribution is the eigenvector of the $4 \\times 4$ transition matrix for eigenvalue 1. This directly gives the equilibrium base frequencies, providing a genetic prediction without simulation. The spectral gap tells you how quickly a sequence converges to equilibrium composition after a mutation event.',
    },
    {
      situation: 'A factory manager wants to know the long-run fraction of time each machine spends in Cutting, Setup, Idle, and Fault states. Transition probabilities were estimated from sensor data.',
      competingTechniques: 'Record data for months (slow), simulate from multiple starting conditions, compute Markov steady state.',
      whyThisTechniqueWins: 'Build the $4 \\times 4$ transition matrix $P$ from the sensor data and find the steady-state eigenvector. This gives the long-run time fractions in one computation. Availability = component for Cutting state. Optimization: change one transition probability and recompute — eigenvalue sensitivity analysis tells you which improvement gives the biggest availability gain.',
    },
  ],

  debugging: [
    {
      commonError: 'Building a row-stochastic matrix (rows sum to 1) and then applying it as $P\\mathbf{x}$ to update a column vector probability distribution.',
      symptom: 'The update $P\\mathbf{x}$ does not produce a valid probability vector — the entries do not sum to 1, and the probabilities make no sense.',
      whyItHappened: 'Row-stochastic convention: $\\mathbf{x}_{t+1}^\\top = \\mathbf{x}_t^\\top P$ (row vector times matrix). Column-stochastic convention: $\\mathbf{x}_{t+1} = P\\mathbf{x}_t$ (matrix times column vector). Mixing conventions breaks the model.',
      repairStrategy: 'Choose one convention consistently. Column-stochastic: each COLUMN sums to 1, use $\\mathbf{x}_{t+1} = P\\mathbf{x}_t$ with column vectors. Row-stochastic: each ROW sums to 1, use $\\mathbf{x}_{t+1}^\\top = \\mathbf{x}_t^\\top P$ with row vectors. Most textbooks use column-stochastic.',
    },
    {
      commonError: 'Finding the null space of $P$ to get the steady state, instead of the null space of $P - I$.',
      symptom: 'The "steady state" found does not satisfy $P\\mathbf{q} = \\mathbf{q}$ — it satisfies $P\\mathbf{q} = \\mathbf{0}$ instead.',
      whyItHappened: 'Confusing two different null space problems: the null space of $P$ gives vectors mapped to zero (not useful here). The steady state satisfies $P\\mathbf{q} = \\mathbf{q}$, which rearranges to $(P-I)\\mathbf{q} = \\mathbf{0}$ — the null space of $P - I$.',
      repairStrategy: 'Always set up the equation $(P - I)\\mathbf{q} = \\mathbf{0}$ to find the steady state. Then normalize: divide $\\mathbf{q}$ by the sum of its entries to make it a probability vector.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Set up the steady-state equation $(P-I)\\mathbf{q} = \\mathbf{0}$ with normalization constraint, solve for $\\mathbf{q}$, and compute how quickly the chain converges using $|\\lambda_2|$.',
    explainVerbally: 'Explain why every column-stochastic matrix has eigenvalue 1 (columns sum to 1), why the steady state is an eigenvector for λ=1, and why larger spectral gap means faster convergence.',
    detectIncorrectApplication: 'Spot when someone uses a row-stochastic matrix with column-vector updates, or when someone solves $P\\mathbf{q} = \\mathbf{0}$ instead of $(P-I)\\mathbf{q} = \\mathbf{0}$.',
    transferToUnfamiliar: 'Given a new Markov model (genetics, queuing, web graph), build the transition matrix, find the steady state, and interpret the result in the application domain.',
  },

  semantics: {
    core: [
      { symbol: 'P', meaning: 'Column-stochastic transition matrix: $P_{ij} =$ probability of moving from state $j$ to state $i$; each column sums to 1.' },
      { symbol: '\\mathbf{q}', meaning: 'Steady-state (stationary) distribution: probability vector satisfying $P\\mathbf{q} = \\mathbf{q}$; the eigenvector of $P$ for $\\lambda = 1$, normalized so entries sum to 1.' },
      { symbol: '\\lambda_2', meaning: 'Second eigenvalue of $P$ (largest by magnitude after $\\lambda_1 = 1$); controls convergence rate — the chain reaches steady state in roughly $1/(1-|\\lambda_2|)$ steps.' },
      { symbol: '1 - |\\lambda_2|', meaning: 'Spectral gap — how far $\\lambda_2$ is from 1; larger gap means faster mixing.' },
      { symbol: 'P^k \\mathbf{x}_0', meaning: 'State distribution after $k$ steps starting from $\\mathbf{x}_0$; converges to $\\mathbf{q}$ as $k \\to \\infty$ for regular chains.' },
    ],
    rulesOfThumb: [
      'Every column-stochastic matrix has $\\lambda = 1$ as an eigenvalue — this is guaranteed by the column-sum constraint, not by the specific entries.',
      'The steady state is found by solving $(P - I)\\mathbf{q} = \\mathbf{0}$, then normalizing so entries sum to 1.',
      'Convergence rate $\\approx |\\lambda_2|^k$ — if $|\\lambda_2| = 0.9$, you need about $\\ln(0.001)/\\ln(0.9) \\approx 66$ steps to reach 0.1% accuracy.',
      'Starting point does not affect the steady state for a regular (all-positive) stochastic matrix — only the convergence speed.',
      'Machine availability (or other long-run fractions) equals the corresponding component of the steady-state distribution $\\mathbf{q}$.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { id: 'la3-001', reason: 'Review eigenvalues and the characteristic polynomial — finding the λ=1 eigenvector of P is a standard eigenvalue problem.' },
      { id: 'la2-003', reason: 'Review null space computation and row reduction — steady-state equation (P-I)q=0 is solved as a null space problem.' },
    ],
    futureLinks: [
      { id: 'la3-006', preview: 'Cayley-Hamilton: every matrix satisfies its own characteristic polynomial — for a 2×2 stochastic matrix this gives a direct recurrence for P^k without diagonalization.' },
      { id: 'la3-007', preview: 'Matrix exponential: continuous-time Markov chains replace P^k with e^{Qt} where Q is a rate matrix; the steady state is the null vector of Q.' },
    ],
  },
};
