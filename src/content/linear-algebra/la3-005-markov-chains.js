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
      '**CNC machine availability — Markov analysis.** A CNC machine cycles through states: Cutting, Setup/Tool-change, Idle (waiting for parts), and Fault. From shift data, you can estimate transition probabilities between these states. The steady-state distribution tells you the long-run fraction of time in each state — and therefore machine **availability** (fraction of time Cutting). Availability = $q_{\\text{Cutting}}$ where $\\mathbf{q}$ is the steady-state distribution. If the fault-recovery probability is low, availability can be optimized by improving it — eigenvalue analysis shows exactly how much the steady state shifts per unit improvement.',
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
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Finding the steady-state distribution',
              prose: [
                'Solve (P-I)q = 0 with sum(q) = 1. The steady state is the eigenvector for λ=1.',
                'NumPy returns eigenvectors normalized to unit Euclidean length, not unit L1 norm. Normalize by dividing by the sum.',
              ],
              code: `import numpy as np

# 3-state weather: Sunny / Rainy / Cloudy
# Column j = probability dist of "where you go from state j"
P = np.array([[0.7, 0.3, 0.4],
              [0.2, 0.5, 0.3],
              [0.1, 0.2, 0.3]])

# Verify column-stochastic
print("Column sums:", P.sum(axis=0))

# Find eigenvalue 1's eigenvector
evals, evecs = np.linalg.eig(P)
print("\\nEigenvalues:", evals.real.round(4))

# Eigenvector for λ=1
idx = np.argmin(np.abs(evals - 1.0))
q = evecs[:, idx].real
q = q / q.sum()   # normalize to probability vector

print("\\nSteady-state distribution:")
print(f"  Sunny:  {q[0]:.4f}")
print(f"  Rainy:  {q[1]:.4f}")
print(f"  Cloudy: {q[2]:.4f}")`,
            },
            {
              id: 2,
              cellTitle: 'Power iteration: watching convergence',
              prose: [
                'Start from any probability vector and multiply by P repeatedly. Watch it converge to the steady state regardless of starting point.',
                'The spectral gap = 1 - |λ₂| determines how fast convergence happens.',
              ],
              code: `import numpy as np

P = np.array([[0.7, 0.3, 0.4],
              [0.2, 0.5, 0.3],
              [0.1, 0.2, 0.3]])

# Two different starting distributions
x_sunny = np.array([1.0, 0.0, 0.0])   # start all-sunny
x_rainy = np.array([0.0, 1.0, 0.0])   # start all-rainy

# Compute steady state for comparison
evals, evecs = np.linalg.eig(P)
idx = np.argmin(np.abs(evals - 1.0))
q = evecs[:, idx].real
q = q / q.sum()

print(f"Steady state:  {q.round(4)}")
print()
print(f"{'Step':>4}  {'From Sunny':>14}  {'From Rainy':>14}")
x1, x2 = x_sunny.copy(), x_rainy.copy()
for k in [1, 2, 5, 10, 20]:
    x1 = np.linalg.matrix_power(P, k) @ x_sunny
    x2 = np.linalg.matrix_power(P, k) @ x_rainy
    print(f"{k:>4}  {str(x1.round(4)):>14}  {str(x2.round(4)):>14}")

evals_sorted = np.sort(np.abs(evals))[::-1]
print(f"\\nSpectral gap: 1 - |λ₂| = 1 - {evals_sorted[1]:.4f} = {1 - evals_sorted[1]:.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'CNC machine availability — steady-state analysis',
              prose: [
                'Model a CNC machine as a 4-state Markov chain: Cutting, Setup, Idle, Fault.',
                'The steady-state distribution gives the long-run fraction of time in each state. Machine availability = q[Cutting].',
              ],
              code: `import numpy as np

# CNC machine state transitions (from shift data)
# States: 0=Cutting, 1=Setup, 2=Idle, 3=Fault
# Entry P[i,j] = prob of going to state i from state j (column-stochastic)
P = np.array([
    [0.80, 0.60, 0.50, 0.00],  # → Cutting
    [0.10, 0.25, 0.30, 0.00],  # → Setup
    [0.05, 0.10, 0.15, 0.20],  # → Idle
    [0.05, 0.05, 0.05, 0.80],  # → Fault
])

states = ['Cutting', 'Setup', 'Idle', 'Fault']
print("Column sums:", P.sum(axis=0))  # should all be 1

evals, evecs = np.linalg.eig(P)
idx = np.argmin(np.abs(evals - 1.0))
q = evecs[:, idx].real
q = q / q.sum()

print("\\nSteady-state distribution:")
for i, (s, qi) in enumerate(zip(states, q)):
    print(f"  {s:<12}: {qi:.3f} ({qi*100:.1f}%)")

print(f"\\nMachine availability: {q[0]:.3f} ({q[0]*100:.1f}%)")
print(f"(Long-run fraction of time actually cutting)")`,
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
      answer: 'P = [[0.95, 0.3],[0.05, 0.7]]. Steady state: W = 6/7 ≈ 85.7%, B = 1/7 ≈ 14.3%.',
    },
    {
      id: 'ch-la3-005-2',
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
      answer: 'λ₂ = 0.5. About 7 steps to reach within 0.01 of steady state. Spectral gap = 0.5.',
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

  assessment: {
    questions: [
      {
        id: 'la3-005-assess-1',
        type: 'input',
        text: 'A $2\\times 2$ column-stochastic matrix has second eigenvalue $\\lambda_2 = 0.8$. Approximately how many steps does it take to be within 0.001 of the steady state? (Use $\\lambda_2^k < 0.001$ and round up.)',
        answer: '32',
        hint: '$0.8^k < 0.001 \\Rightarrow k > \\ln(0.001)/\\ln(0.8) \\approx 31.9$. Round up to 32.',
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
      hints: ['After k steps, the distance from steady state is proportional to |λ₂|^k. Larger spectral gap (smaller |λ₂|) → faster convergence.'],
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
  ],
};
