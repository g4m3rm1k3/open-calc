import labeledGraphUrl from '../diagrams/dm-labeled-graph-degree.svg?url'
import bfsLayersUrl from '../diagrams/dm-bfs-layers.svg?url'

export default {
  id: 'discrete-1-08',
  slug: 'graph-theory',
  chapter: 'discrete-5',
  order: 0,
  title: 'Graph Theory and Networks',
  subtitle: 'Vertices, edges, connectivity, trees, and shortest paths',
  tags: ['graph theory', 'network', 'tree', 'path', 'degree', 'euler', 'hamilton'],
  aliases: 'graph vertices edges degree handshaking lemma bfs dfs spanning tree',

  hook: {
    question:
      'Can you traverse a city map without retracing streets? Can a network stay connected after failures?',
    realWorldContext:
      'Graph theory began with Euler\'s 1736 Konigsberg bridges problem and now powers routing, social-network analysis, recommendation systems, and infrastructure resilience.',
  },

  intuition: {
    prose: [
      `![A small labeled graph with each vertex's degree marked — sum of degrees is twice the edge count](${labeledGraphUrl})`,

      'A graph models relationships: vertices are entities, edges are the links between them. This is the first truly visual object in discrete math — read every definition from a concrete diagram like the one above before trusting the symbols. In the diagram, count the edges touching each vertex (its **degree**) and then sum all five degrees: you\'ll get exactly twice the number of edges, every time, for any graph — this is the Handshaking Lemma, and it has a one-line reason: every edge has exactly two endpoints, so it contributes exactly 2 to the total degree count, no matter how the graph is drawn.',

      '**Trees** are minimally connected graphs: just enough edges to connect every vertex, with zero cycles and therefore zero redundant paths. This is why |E| = |V| − 1 is not a coincidence but a structural signature — add one more edge to a tree and you necessarily create a cycle (a second, redundant path between two vertices that were already connected); remove one edge and you necessarily disconnect it (that edge was the *only* path between the two halves it separated).',

      'Two different lenses describe a graph\'s shape: **degree distributions** describe local structure — how many connections does each individual vertex have — while **path lengths** describe global structure — how far apart are vertices on average, and what\'s the longest necessary trip between any two. A graph can have a very uneven degree distribution (a few highly-connected "hub" vertices, many sparsely-connected ones — the shape of most real social networks) while still having short average path lengths, which is exactly the "six degrees of separation" phenomenon.',

      'Modern software is graph-shaped almost everywhere you look: package dependencies form a directed graph (with cycles meaning circular dependencies — usually a build error), call graphs trace which functions invoke which, road maps are graphs with distances as edge weights, and finite-state machines are graphs where edges are labeled with the input that triggers each transition.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Handshaking Lemma',
        body: '\\sum_{v\\in V} \\deg(v)=2|E|',
      },
      {
        type: 'theorem',
        title: 'Tree Edge Count',
        body: 'If G is a tree with n vertices, then |E|=n-1.',
      },
    ],
    visualizations: [
      {
        id: 'GraphTraversalGame',
        title: 'Traversal Strategy Game',
        caption: 'Play BFS and DFS step-by-step and compare exploration order from the same start node.',
      },
      {
        id: 'GraphNetwork3D',
        title: '3D Network Explorer',
        caption: 'Rotate random, cycle, and complete graphs; inspect degree spread and connectivity dynamics.',
      },
    ],
  },

  math: {
    prose: [
      `![BFS explores in concentric layers by distance from the source; DFS plunges down one branch first](${bfsLayersUrl})`,

      'A graph is **connected** if a path exists between every pair of vertices; if not, it splits into **components** — maximal connected pieces. Robust network design cares deeply about this: a **spanning tree** is a subgraph that connects every vertex using the fewest possible edges (exactly |V| − 1), and finding one tells you the minimum infrastructure needed to keep a network reachable end-to-end.',

      '**Breadth-first search (BFS)** computes shortest path lengths in unweighted graphs by exploring in concentric layers, as the diagram shows: every vertex at distance 1 from the source is visited before any vertex at distance 2, which is visited before any at distance 3, and so on. This layer-by-layer discipline is exactly what guarantees the first time BFS reaches a vertex, it has found the shortest possible route there — a longer route would have placed that vertex in a *later* layer, contradicting "first time reached."',

      '**Depth-first search (DFS)** instead plunges down one branch as far as possible before backtracking — simpler to implement recursively (the call stack does the bookkeeping for you), and it is the workhorse behind cycle detection (revisiting a vertex still on the current path means you\'ve found a cycle) and topological sorting (ordering tasks so every dependency comes before what depends on it).',

      'Graph representation is a real performance decision, not a stylistic one: an **adjacency list** (each vertex stores just its own neighbors) costs O(V+E) space — efficient for sparse graphs, where E is much smaller than V². An **adjacency matrix** (a V×V grid of 0s and 1s) costs O(V²) space regardless of how many edges actually exist, but gives O(1) lookup for "is there an edge between these two specific vertices?" — a real tradeoff between memory and lookup speed that depends entirely on how dense the graph is.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Odd Degree Count Theorem',
        body: 'Every finite graph has an even number of odd-degree vertices.',
      },
    ],
  },

  rigor: {
    prose: [
      'Proofs in graph theory often combine plain counting (as in the Handshaking Lemma) with structural induction on the number of vertices or edges — a common pattern is "remove one vertex or edge, apply the inductive hypothesis to the smaller graph, then add the removed piece back and verify the claim still holds."',

      'Invariants preserved under an operation (edge deletion, edge contraction, one step of a traversal) are a common proof tool: if a property holds before the operation and the operation cannot break it, the property holds after every sequence of such operations too — this is exactly how BFS\'s "layer index equals shortest-path distance" invariant is proved (each step of the algorithm preserves it) and how the tree edge-count identity |E| = |V| − 1 is proved (removing a leaf and its one edge preserves the identity, reducing to a smaller tree).',
    ],
  },

  examples: [
    {
      id: 'discrete-1-08-ex1',
      title: 'Odd Degree Vertices',
      problem: 'A graph has vertex degrees 3,3,2,2,2,1,1. Is this possible?',
      steps: [
        { expression: 'Odd degrees: 3,3,1,1', annotation: 'There are 4 odd-degree vertices.' },
        { expression: '4 is even', annotation: 'Consistent with odd-degree theorem.' },
      ],
      conclusion: 'This degree parity condition does not rule it out.',
    },
    {
      id: 'discrete-1-08-ex2',
      title: 'Tree Check',
      problem: 'A connected graph has 15 vertices and 14 edges. Must it be a tree?',
      steps: [
        { expression: 'Connected + |E|=|V|-1', annotation: 'Characterization of trees.' },
      ],
      conclusion: 'Yes, it is necessarily a tree.',
    },
    {
      id: 'discrete-1-08-ex3',
      title: 'BFS Distance Layers',
      problem: 'In an unweighted graph, why does BFS from source s compute shortest path length to every reachable vertex?',
      steps: [
        { expression: 'BFS explores by layers of edge count: 0,1,2,...', annotation: 'Queue order forces nondecreasing distance discovery.' },
        { expression: 'First time a vertex v is dequeued, all shorter paths would have been discovered earlier', annotation: 'Contradiction argument if a shorter path existed.' },
        { expression: 'Therefore recorded layer index equals shortest-path distance', annotation: 'Core correctness invariant.' },
      ],
      conclusion: 'BFS is the canonical shortest-path algorithm for unweighted graphs.',
    },
    {
      id: 'discrete-1-08-ex4',
      title: 'Representation Tradeoff',
      problem: 'For V=1,000 and E=4,000, compare adjacency list vs matrix space and traversal complexity.',
      steps: [
        { expression: 'Adjacency list space: O(V+E) ~ 5,000 units', annotation: 'Sparse graph, compact structure.' },
        { expression: 'Adjacency matrix space: O(V^2)=1,000,000 units', annotation: 'Dense-capable but expensive for sparse graphs.' },
        { expression: 'BFS/DFS with list: O(V+E)=5,000', annotation: 'Efficient edge iteration.' },
      ],
      conclusion: 'For sparse graphs, adjacency lists dominate in both memory and traversal performance.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-08-ch1',
      difficulty: 'easy',
      problem: 'Can a graph have exactly one vertex of odd degree?',
      walkthrough: [
        { expression: '\\sum_v \\deg(v)=2|E|', annotation: 'Handshaking lemma makes total degree even.' },
        { expression: 'Sum of odd-count terms is odd only if odd-count is odd', annotation: 'Parity contradiction with even total.' },
      ],
      answer: 'No, odd-degree vertices must come in even count.',
    },
    {
      id: 'discrete-1-08-ch2',
      difficulty: 'medium',
      problem: 'A connected graph has n vertices and n edges. Prove it has a cycle.',
      hint: 'Contrapositive via tree edge bound.',
      walkthrough: [
        { expression: 'Assume no cycle', annotation: 'Then graph is acyclic and connected.' },
        { expression: 'Connected + acyclic => tree => |E|=|V|-1', annotation: 'Tree characterization.' },
        { expression: 'But |E|=|V| is given', annotation: 'Contradiction, so at least one cycle exists.' },
      ],
      answer: 'If acyclic and connected then tree with n-1 edges; contradiction.',
    },
    {
      id: 'discrete-1-08-ch3',
      difficulty: 'hard',
      problem: 'Puzzle: You are given an unweighted maze graph. Explain, with proof sketch, why BFS guarantees the fewest moves to exit while DFS does not.',
      walkthrough: [
        { expression: 'BFS explores all vertices at distance d before distance d+1', annotation: 'Layer invariant from queue discipline.' },
        { expression: 'First exit reached by BFS has minimal edge count', annotation: 'Any shorter path would be in an earlier layer.' },
        { expression: 'DFS may follow one long branch before checking nearby exits', annotation: 'Depth-first policy ignores global distance order.' },
      ],
      answer: 'BFS is shortest-path optimal in unweighted graphs; DFS is not distance-optimal.',
    },
    {
      id: 'discrete-1-08-ch4',
      difficulty: 'hard',
      problem: 'A network has 12 vertices and 15 edges and is acyclic. Is that possible? Justify using a counting invariant.',
      walkthrough: [
        { expression: 'Any acyclic graph (forest) satisfies |E|<=|V|-1', annotation: 'Component-wise tree bound.' },
        { expression: 'Here |E|=15 and |V|-1=11', annotation: 'Given edge count exceeds acyclic upper bound.' },
        { expression: 'Contradiction, so at least one cycle must exist', annotation: 'Counting invariant detects impossibility fast.' },
      ],
      answer: 'Not possible; edge count forces a cycle.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Directed graphs are concrete representations of binary relations.' },
    { lessonSlug: 'trees-and-hierarchies', label: 'Trees and Hierarchies', context: 'Trees are a constrained but fundamental graph family.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'BFS/DFS runtime and graph representations are core algorithmic topics.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
  semantics: {
    core: [
      { symbol: 'V, E', meaning: 'Vertices (nodes) and Edges (links)' },
      { symbol: 'deg(v)', meaning: 'Degree of vertex v' },
      { symbol: 'Path', meaning: 'A sequence of vertices connected by edges' },
      { symbol: 'Cycle', meaning: 'A path that starts and ends at the same vertex' },
      { symbol: 'Isomorphism', meaning: 'A mapping between two graphs that preserves connectivity' },
      { symbol: 'Planarity', meaning: 'The property of being drawn in a 2D plane without edge crossings' },
      { symbol: 'χ(G)', meaning: 'Chromatic Number — the minimum number of colors needed for a proper coloring' },
    ],
    rulesOfThumb: [
      'Handshaking Lemma: Total degree sum is twice the edge count.',
      'A graph is bipartite if and only if it contains no odd cycles.',
      'Euler\'s Formula for planar graphs: V - E + F = 2.',
      'Every planar graph is 4-colorable.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'graph-theory-intro',
        label: 'Graph Theory Intro',
        note: 'We extend the basic connectivity and degree results from that lesson to deeper network properties, representations, and traversal algorithms.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-09',
        label: 'Trees and Hierarchies',
        note: 'Trees are the most important acyclic connected subgraph family.',
      },
    ],
  },

  mentalModel: [
    'Graphs are universal relationship maps.',
    'Coloring is a way to model constraints (e.g., scheduling).',
    'Planarity is a physical constraint of 2D geometry (e.g., PCB design).',
    'Connectivity is the measure of network robustness.',
  ],

  assessment: {
    questions: [
      {
        id: 'gt-assess-3',
        type: 'choice',
        text: 'What is the chromatic number of a complete graph K₄?',
        options: ['2', '3', '4', '5'],
        answer: '4',
        hint: 'In a complete graph, every vertex is connected to every other vertex.',
      },
      {
        id: 'gt-assess-4',
        type: 'input',
        text: 'In a planar graph with 6 vertices and 7 edges, how many faces are there?',
        answer: '3',
        hint: 'Use Euler\'s Formula: V - E + F = 2.',
      },
    ],
  },

  quiz: [
    {
      id: 'gt-q3',
      type: 'choice',
      text: 'Which property guarantees that a graph can be colored with only 2 colors?',
      options: ['Connected', 'Planar', 'Bipartite', 'Acyclic'],
      answer: 'Bipartite',
      hints: ['A bipartite graph has two disjoint sets of vertices.'],
    },
    {
      id: 'gt-q4',
      type: 'choice',
      text: 'What does the Handshaking Lemma imply about the number of odd-degree vertices?',
      options: ['It must be zero', 'It must be even', 'It must be odd', 'It must be the same as the number of edges'],
      answer: 'It must be even',
      hints: ['The sum of degrees is always even.'],
    },
  ],
}
