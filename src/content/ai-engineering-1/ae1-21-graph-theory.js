export default {
  id: 'ae-p1-21-graph-theory',
  slug: 'graph-theory',
  chapter: 'ae-p1',
  order: 20,
  title: 'Graph Theory for Machine Learning',
  subtitle: 'Graphs are the data structure of relationships. If your data has connections, you need graph theory.',
  tags: ['graph-theory', 'GNN', 'Laplacian', 'BFS', 'DFS', 'spectral-clustering', 'message-passing', 'adjacency-matrix'],

  hook: {
    question: 'How does a Graph Neural Network "see" the structure of a molecule or social network? And why is matrix multiplication on the adjacency matrix equivalent to message passing between nodes?',
    realWorldContext:
      'Social networks, molecules, knowledge bases, citation networks, road maps — all are graphs. Traditional ML treats data as flat tables where each row is independent. But when the structure of connections matters, tables fail. Consider a molecule: you want to predict if it binds to a protein. The atoms matter, but what really matters is how atoms are bonded to each other. GNNs are the fastest-growing area in deep learning, powering drug discovery, recommendation, fraud detection, and knowledge graph reasoning. Every GNN builds on four foundational ideas from graph theory: adjacency matrices, BFS/DFS traversal, the Laplacian, and message passing.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A graph G = (V, E) has vertices (nodes) V and edges E. The adjacency matrix A is the core representation: A[i][j] = 1 if there is an edge from node i to node j, 0 otherwise. For undirected graphs, A is symmetric. The degree of a node is the number of edges connected to it; the degree matrix D is diagonal with D[i][i] = degree of node i. High degree = hub node. Degree distributions reveal network structure: social networks follow power laws (few hubs, many leaf nodes); random graphs have Poisson-distributed degrees.',
      'BFS (Breadth-First Search) uses a queue (FIFO) to explore all neighbors at distance k before distance k+1. It finds shortest paths in unweighted graphs — the first time BFS discovers a node, it arrived via a shortest path. DFS (Depth-First Search) uses a stack (LIFO) or recursion to go as deep as possible before backtracking. DFS is useful for finding connected components (run DFS from every unvisited node), cycle detection (back edges in DFS tree), and topological sorting (reverse DFS finish order). Both algorithms are O(V + E).',
      'The graph Laplacian L = D − A. For a triangle (nodes 0,1,2 fully connected): D = diag(2,2,2), A = [[0,1,1],[1,0,1],[1,1,0]], L = [[2,−1,−1],[−1,2,−1],[−1,−1,2]]. Key properties: (1) L is positive semi-definite — all eigenvalues ≥ 0. (2) The number of zero eigenvalues equals the number of connected components — a connected graph has exactly one zero eigenvalue. (3) For any vector x: x^T L x = Σ_(i,j)∈E (xᵢ − xⱼ)². This measures how much x varies across edges — it is a smoothness measure on the graph. The Laplacian is the graph analogue of the second derivative.',
      'Spectral clustering: eigendecompose L to find the cluster structure. The eigenvector for λ = 0 is the constant vector (all nodes in one component). The Fiedler vector — eigenvector for the second-smallest eigenvalue λ₂ (called the spectral gap) — encodes the smoothest non-trivial function on the graph. Nodes in the same tightly-connected cluster get similar Fiedler values; nodes separated by a bottleneck get opposite-sign values. Two-way partition: positive Fiedler entries go in cluster 1, negative go in cluster 2. For k clusters, use the k smallest non-zero eigenvectors and apply k-means to the resulting embedding.',
      'GNN message passing: a Graph Neural Network updates each node\'s features by aggregating its neighbors\' features. One round of mean-aggregation message passing: h_v^(k+1) = σ(W·mean({h_u^(k) : u ∈ neighbors(v)})) where σ is an activation and W is a learned weight matrix. Matrix form: H^(k+1) = σ(D⁻¹·A·H^(k)·W^T) where D⁻¹A is the row-normalized adjacency. After k layers, each node has information about its k-hop neighborhood. The symmetric normalized Laplacian D^(−1/2)·A·D^(−1/2) is used in GCN (Graph Convolutional Network) for better stability. Multiplying by (I + D⁻¹/²AD⁻¹/²) includes the node\'s own features.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'A^k gives k-hop reachability',
        body: 'A² [i][j] = (A @ A)[i][j] = Σₖ A[i][k]·A[k][j] = number of length-2 paths from i to j.\nA³ [i][j] = number of length-3 paths from i to j.\n\nSo A^k [i][j] > 0 iff there exists a path of length exactly k from i to j. GNN layer k aggregates information from distance-k neighbors by implicitly computing powers of the adjacency matrix.',
      },
      {
        type: 'insight',
        title: 'Why the Laplacian measures graph smoothness',
        body: 'x^T L x = Σ_(i,j)∈E (xᵢ − xⱼ)²\n\nThis sum of squared differences across all edges measures how much the signal x varies over the graph. Small x^T L x means x is smooth — neighboring nodes have similar values. Large means x varies a lot between connected nodes.\n\nSpectral clustering finds the assignment vector x that is maximally smooth while being orthogonal to the constant vector. That is the Fiedler vector — it assigns similar values to nodes that are strongly connected.',
      },
      {
        type: 'procedure',
        title: 'Implementing one GNN message-passing layer',
        steps: [
          'Build adjacency matrix A and degree matrix D from edge list',
          'Compute row-normalized adjacency: A_hat = D⁻¹ @ A',
          'Add self-loops: A_hat = D⁻¹ @ (A + I)',
          'For each node v: new_features[v] = mean(features[u] for u in neighbors(v) + {v})',
          'Transform: H_new = activation(A_hat @ H_old @ W.T)',
          'Repeat for k layers to aggregate k-hop neighborhoods',
        ],
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        type: 'PythonNotebook',
        cells: [
          {
            id: 1,
            prose: [
              'Build a graph class with both adjacency matrix and adjacency list representations. Implement BFS and DFS.',
              'BFS uses a queue — explore neighbors level by level. This guarantees shortest paths in unweighted graphs.',
              'Verify: in a path graph 0→1→2→3→4, BFS from 0 finds each node at distance equal to its index. DFS might find them in a different order.',
            ],
            code: `from collections import deque

class Graph:
    def __init__(self, n_nodes, directed=False):
        self.n = n_nodes
        self.directed = directed
        self.adj = [[] for _ in range(n_nodes)]
        self.A = [[0]*n_nodes for _ in range(n_nodes)]

    def add_edge(self, u, v, weight=1):
        self.adj[u].append(v)
        self.A[u][v] = weight
        if not self.directed:
            self.adj[v].append(u)
            self.A[v][u] = weight

    def degree(self, v):
        return len(self.adj[v])

    def bfs(self, start):
        """BFS: returns {node: distance from start}."""
        dist = {start: 0}
        queue = deque([start])
        order = []
        while queue:
            v = queue.popleft()
            order.append(v)
            for u in self.adj[v]:
                if u not in dist:
                    dist[u] = dist[v] + 1
                    queue.append(u)
        return order, dist

    def dfs(self, start):
        """DFS: returns visit order."""
        visited = set()
        order = []
        stack = [start]
        while stack:
            v = stack.pop()
            if v not in visited:
                visited.add(v)
                order.append(v)
                for u in reversed(self.adj[v]):
                    if u not in visited:
                        stack.append(u)
        return order

# Example: social network (5 nodes)
g = Graph(5)
edges = [(0,1),(0,2),(1,3),(2,3),(3,4)]
for u, v in edges:
    g.add_edge(u, v)

bfs_order, distances = g.bfs(0)
dfs_order = g.dfs(0)

print("Graph: 0-1-3-4, 0-2-3 (two paths to node 3)")
print(f"BFS from 0: {bfs_order}")
print(f"Distances:  {distances}")
print(f"DFS from 0: {dfs_order}")
print()
print("BFS visits by level (shortest paths first).")
print("Node 3 is at distance 2 via both 0→1→3 and 0→2→3.")`,
          },
          {
            id: 2,
            prose: [
              'Compute the graph Laplacian L = D − A and find its eigenvalues. The number of zero eigenvalues tells you the number of connected components.',
              'The Fiedler vector (eigenvector of the second-smallest eigenvalue) partitions the graph. Nodes with similar Fiedler values are in the same community.',
              'Test on a barbell graph: two cliques connected by a single bridge edge. The Fiedler vector should clearly separate the two cliques.',
            ],
            code: `import math

def mat_sub(A, B):
    n = len(A)
    return [[A[i][j]-B[i][j] for j in range(n)] for i in range(n)]

def mat_mul(A, B):
    n, m, p = len(A), len(B), len(B[0])
    return [[sum(A[i][k]*B[k][j] for k in range(m)) for j in range(p)] for i in range(n)]

def transpose(A):
    return [[A[j][i] for j in range(len(A))] for i in range(len(A[0]))]

def power_iteration_smallest(L, n_iter=200):
    """Find the Fiedler vector via deflation + power iteration (approx)."""
    import random
    random.seed(42)
    n = len(L)
    # Shift: find smallest eigenvalue of L as largest of (max_eig*I - L)
    # For simplicity, use known property: constant vector is eigvec for lambda=0
    # Deflate: project out the constant vector, then find next
    v = [random.gauss(0,1) for _ in range(n)]
    # Orthogonalize against constant vector
    dot = sum(v)
    v = [vi - dot/n for vi in v]
    # Normalize
    norm = math.sqrt(sum(vi**2 for vi in v))
    v = [vi/norm for vi in v]
    # Power iteration on (lambda_max*I - L) to get second smallest eigenvalue
    # Rough lambda_max estimate
    lam_max = max(sum(abs(L[i][j]) for j in range(n)) for i in range(n))
    for _ in range(n_iter):
        # v_new = (lam_max * I - L) @ v
        v_new = [lam_max * v[i] - sum(L[i][j]*v[j] for j in range(n)) for i in range(n)]
        # Orthogonalize against constant
        dot = sum(v_new) / n
        v_new = [vi - dot for vi in v_new]
        norm = math.sqrt(sum(vi**2 for vi in v_new))
        v = [vi/norm for vi in v_new]
    return v

# Barbell graph: clique {0,1,2} -- bridge -- clique {3,4,5}
n = 6
A = [[0]*n for _ in range(n)]
for u, v in [(0,1),(0,2),(1,2),(3,4),(3,5),(4,5),(2,3)]:   # bridge: 2-3
    A[u][v] = A[v][u] = 1

D = [[sum(A[i]) if i==j else 0 for j in range(n)] for i in range(n)]
L = mat_sub(D, A)

fiedler = power_iteration_smallest(L)

print("Barbell graph: clique {0,1,2} — bridge(2-3) — clique {3,4,5}")
print("Fiedler vector (second-smallest eigenvector of L):")
for i, v in enumerate(fiedler):
    cluster = "Clique A" if i < 3 else "Clique B"
    print(f"  node {i}: {v:+.4f}  ({cluster})")
print()
print("Positive values → Clique B, Negative → Clique A (or vice versa)")
print("The sign split gives the 2-way spectral partition.")`,
          },
          {
            id: 3,
            prose: [
              'GNN message passing: one layer aggregates each node\'s features from its 1-hop neighborhood.',
              'Matrix form: the row-normalized adjacency D⁻¹A multiplied by the feature matrix H gives the new features. Each row i of D⁻¹A·H is the mean of H over node i\'s neighbors.',
              'After k layers, each node has aggregated information from its k-hop neighborhood. See this by applying message passing twice and tracking which nodes contributed to each node\'s representation.',
            ],
            code: `def mat_mul(A, B):
    n, m, p = len(A), len(B), len(B[0])
    return [[sum(A[i][k]*B[k][j] for k in range(m)) for j in range(p)] for i in range(n)]

def relu(x):
    return [[max(0, v) for v in row] for row in x]

# Graph: 5 nodes, star with center 0
edges = [(0,1),(0,2),(0,3),(0,4)]
n = 5
A = [[0]*n for _ in range(n)]
for u, v in edges:
    A[u][v] = A[v][u] = 1

# Row-normalized adjacency: A_hat[i][j] = A[i][j] / degree(i)
A_hat = [[0.0]*n for _ in range(n)]
for i in range(n):
    deg = sum(A[i])
    if deg > 0:
        for j in range(n):
            A_hat[i][j] = A[i][j] / deg

# Initial features: node i has feature [i, i*0.5]
H = [[float(i), i*0.5] for i in range(n)]

print("Star graph: center=0, leaves=1,2,3,4")
print("\\nInitial features H:")
for i, h in enumerate(H):
    print(f"  node {i}: {h}")

# One message-passing layer (no learned weights — just mean aggregation)
H1 = mat_mul(A_hat, H)
print("\\nAfter 1 message-passing layer (mean of neighbors):")
for i, h in enumerate(H1):
    print(f"  node {i}: [{h[0]:.3f}, {h[1]:.3f}]  (mean of its neighbors' features)")

H2 = mat_mul(A_hat, H1)
print("\\nAfter 2 layers (2-hop neighborhood aggregated):")
for i, h in enumerate(H2):
    print(f"  node {i}: [{h[0]:.3f}, {h[1]:.3f}]")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement Dijkstra\'s shortest-path algorithm for a weighted graph. Test it on a 5-node graph with given edge weights. Then implement connected components detection using DFS — return the component ID for each node.',
            starterCode: `import heapq
from collections import deque

def dijkstra(n, edges, source):
    """
    Find shortest paths from source to all nodes.
    edges: list of (u, v, weight)
    Returns: dist dict {node: shortest distance from source}
    """
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))

    dist = {source: 0}
    heap = [(0, source)]   # (distance, node)

    # TODO: implement Dijkstra using heapq.heappop/heappush
    # While heap not empty:
    #   pop (d, v) with smallest d
    #   if d > dist.get(v, inf): skip (stale entry)
    #   for each neighbor u with weight w:
    #       if dist[v] + w < dist.get(u, inf): update dist[u], push to heap
    return dist

def connected_components(n, edges):
    """
    Find connected components via DFS.
    Returns: list of length n, component_id[i] = component of node i
    """
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    component_id = [-1] * n
    # TODO: for each unvisited node, run DFS to label its component
    return component_id

# Test Dijkstra
weighted_edges = [(0,1,4),(0,2,1),(1,3,1),(2,1,2),(2,3,5),(3,4,3)]
d = dijkstra(5, weighted_edges, source=0)
print("Dijkstra from node 0:", d)
print("Expected: {0:0, 1:3, 2:1, 3:4, 4:7}")

# Test connected components
cc_edges = [(0,1),(1,2),(3,4)]   # two components: {0,1,2} and {3,4}
comp = connected_components(5, cc_edges)
print("\\nComponents:", comp)
print("Expected: nodes 0,1,2 in one group; nodes 3,4 in another")
`,
            hint: 'Dijkstra: pop minimum (d, v) from heap. If d > dist[v], skip. Otherwise relax all edges from v. For connected components: iterate nodes 0..n-1; if component_id[i] == -1, run DFS from i and label all reached nodes with the current component number.',
            testCode: `try:
    d = dijkstra(5, [(0,1,4),(0,2,1),(1,3,1),(2,1,2),(2,3,5),(3,4,3)], 0)
    assert d[0]==0 and d[1]==3 and d[2]==1 and d[3]==4 and d[4]==7, f"Dijkstra wrong: {d}"
    print(f"PASS Dijkstra: {d}")
    comp = connected_components(5, [(0,1),(1,2),(3,4)])
    assert comp[0]==comp[1]==comp[2] and comp[3]==comp[4] and comp[0]!=comp[3]
    print(f"PASS components: {comp}")
except AssertionError as e:
    print(f"FAIL: {e}")`,
          },
        ],
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What does the adjacency matrix A[i][j] = 1 represent?',
      options: [
        'Node i has degree j',
        'There is an edge from node i to node j',
        'Node i and node j have the same label',
        'The shortest path from i to j has length 1',
      ],
      answer: 'There is an edge from node i to node j',
      hints: [
        'A is the fundamental representation of graph structure. A[i][j] = 1 means connected, 0 means not connected',
        'For undirected graphs, A is symmetric: A[i][j] = A[j][i]',
      ],
      reviewSection: 'Adjacency Matrix',
    },
    {
      type: 'choice',
      question: 'What data structure does BFS use and what does it find?',
      options: [
        'Stack; finds connected components',
        'Queue; finds shortest paths in unweighted graphs',
        'Priority queue; finds minimum spanning tree',
        'Hash map; finds duplicate nodes',
      ],
      answer: 'Queue; finds shortest paths in unweighted graphs',
      hints: [
        'A queue (FIFO) ensures nodes at distance k are all visited before nodes at distance k+1',
        'The first time BFS discovers a node, it arrived via a shortest path',
      ],
      reviewSection: 'BFS and DFS',
    },
    {
      type: 'choice',
      question: 'The graph Laplacian L = D − A of a connected graph has how many zero eigenvalues?',
      options: [
        'Zero',
        'Exactly one',
        'Equal to the number of nodes',
        'Equal to the number of edges',
      ],
      answer: 'Exactly one',
      hints: [
        'The number of zero eigenvalues equals the number of connected components',
        'A connected graph has one component → one zero eigenvalue; a graph with 3 disconnected pieces has 3',
      ],
      reviewSection: 'Graph Laplacian',
    },
    {
      type: 'choice',
      question: 'In GNN message passing, what does h_v^(k+1) = σ(W · mean({h_u^(k) : u ∈ neighbors(v)})) compute?',
      options: [
        'The shortest path from v to all other nodes',
        'A new feature vector for node v by aggregating neighbor features, transforming with learned weights, and applying a nonlinearity',
        'The degree of node v at layer k+1',
        'The PageRank score of node v',
      ],
      answer: 'A new feature vector for node v by aggregating neighbor features, transforming with learned weights, and applying a nonlinearity',
      hints: [
        'Each layer aggregates one more hop of neighborhood information',
        'After k layers, h_v contains information from all nodes within k hops of v',
      ],
      reviewSection: 'GNN Message Passing',
    },
    {
      type: 'choice',
      question: 'How does spectral clustering use the Fiedler vector (eigenvector of the second-smallest eigenvalue of L)?',
      options: [
        'Nodes with the largest Fiedler vector entries form one cluster',
        'Nodes with positive Fiedler vector values go in one group, nodes with negative values go in the other',
        'The Fiedler vector is used as edge weights',
        'The Fiedler vector determines the number of clusters',
      ],
      answer: 'Nodes with positive Fiedler vector values go in one group, nodes with negative values go in the other',
      hints: [
        'The Fiedler vector encodes the smoothest non-trivial function on the graph',
        'Nodes in the same dense community get similar values; nodes across a bottleneck get opposite-sign values',
      ],
      reviewSection: 'Spectral Clustering',
    },
  ],
}
