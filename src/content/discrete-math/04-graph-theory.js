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
    previewVisualizationId: 'GraphNetwork3D',
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
  ],

  challenges: [
    {
      id: 'discrete-1-04-ch1',
      difficulty: 'easy',
      problem: 'Can a graph have exactly one vertex of odd degree?',
      answer: 'No, odd-degree vertices must come in even count.',
    },
    {
      id: 'discrete-1-04-ch2',
      difficulty: 'medium',
      problem: 'A connected graph has n vertices and n edges. Prove it has a cycle.',
      hint: 'Contrapositive via tree edge bound.',
      answer: 'If acyclic and connected then tree with n-1 edges; contradiction.',
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
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
}
