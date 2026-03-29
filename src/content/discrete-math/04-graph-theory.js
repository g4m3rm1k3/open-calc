export default {
  id: 'discrete-1-08',
  slug: 'graph-theory',
  chapter: 'discrete-1',
  order: 10,
  title: 'Graph Theory and Networks',
  subtitle: 'Vertices, edges, connectivity, trees, and shortest paths',
  tags: ['graph theory', 'network', 'tree', 'path', 'degree', 'euler', 'hamilton'],
  aliases: 'graph vertices edges degree handshaking lemma bfs dfs spanning tree',

  hook: {
    question:
      'Can you traverse a city map without retracing streets? Can a network stay connected after failures?',
    realWorldContext:
      'Graph theory began with Euler\'s 1736 Konigsberg bridges problem and now powers routing, social-network analysis, recommendation systems, and infrastructure resilience.',
    previewVisualizationId: 'GraphTraversalGame',
  },

  intuition: {
    prose: [
      'A graph models relationships: vertices are entities, edges are links.',
      'For beginners, this is the first truly visual discrete object. Every definition should be read from a concrete diagram before moving to symbols.',
      'Trees are minimally connected graphs: enough edges to connect all vertices but no cycles.',
      'Degree distributions summarize local structure; path lengths summarize global structure.',
      'Many algorithmic guarantees depend on simple invariants such as |E|=|V|-1 for trees.',
      'Modern software systems are graph-shaped: package dependencies, social networks, call graphs, road maps, and finite-state machines.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Handshaking Lemma',
        body: '\\sum_{v\\in V} deg(v)=2|E|',
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
      'Connectedness, components, and spanning trees are central to robust network design.',
      'Breadth-first search computes shortest path lengths in unweighted graphs.',
      'Depth-first search is often simpler to implement recursively and is the workhorse behind cycle detection and topological sort routines.',
      'Graph representations matter for performance: adjacency list is usually O(V+E) friendly for sparse graphs, while adjacency matrix gives O(1) edge lookup at O(V^2) space.',
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
      'Proofs in graph theory often combine counting with structural induction on vertices or edges.',
      'Invariants under operations (edge deletion, contraction, traversal) are a common proof tool.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-04-ex1',
      title: 'Odd Degree Vertices',
      problem: 'A graph has vertex degrees 3,3,2,2,2,1,1. Is this possible?',
      steps: [
        { expression: 'Odd degrees: 3,3,1,1', annotation: 'There are 4 odd-degree vertices.' },
        { expression: '4 is even', annotation: 'Consistent with odd-degree theorem.' },
      ],
      conclusion: 'This degree parity condition does not rule it out.',
    },
    {
      id: 'discrete-1-04-ex2',
      title: 'Tree Check',
      problem: 'A connected graph has 15 vertices and 14 edges. Must it be a tree?',
      steps: [
        { expression: 'Connected + |E|=|V|-1', annotation: 'Characterization of trees.' },
      ],
      conclusion: 'Yes, it is necessarily a tree.',
    },
    {
      id: 'discrete-1-04-ex3',
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
      id: 'discrete-1-04-ex4',
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
      id: 'discrete-1-04-ch1',
      difficulty: 'easy',
      problem: 'Can a graph have exactly one vertex of odd degree?',
      walkthrough: [
        { expression: '\sum_v deg(v)=2|E|', annotation: 'Handshaking lemma makes total degree even.' },
        { expression: 'Sum of odd-count terms is odd only if odd-count is odd', annotation: 'Parity contradiction with even total.' },
      ],
      answer: 'No, odd-degree vertices must come in even count.',
    },
    {
      id: 'discrete-1-04-ch2',
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
      id: 'discrete-1-04-ch3',
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
      id: 'discrete-1-04-ch4',
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
        lessonId: 'discrete-1-04a-graph-theory-intro',
        label: 'Graph Theory Intro',
        note: 'We extend basic connectivity and degree results to complex network properties and coloring.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-09-trees-and-hierarchies',
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
