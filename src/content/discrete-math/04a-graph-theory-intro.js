export default {
  id: 'graph-theory-intro',
  slug: 'graph-theory-intro',
  title: 'Graph Theory: Networks, Paths & Puzzles',
  tags: ['discrete-math', 'graph-theory', 'networks', 'algorithms'],
  chapter: 'discrete-1',
  order: 4.5,

  hook: {
    question: 'Can you draw this shape without lifting your pen or retracing any line?',
    context: `In 1736, Euler was asked whether you could walk the 7 bridges of Königsberg,
      crossing each exactly once and returning home. He proved it was IMPOSSIBLE —
      and in doing so, invented graph theory. Today, the same ideas power Google Maps,
      social network analysis, circuit design, and internet routing.`,
    realWorld: `Every time Google Maps finds the shortest route, it runs Dijkstra's algorithm on a
      graph. When Facebook suggests friends, it measures graph distance. When a manufacturer
      schedules jobs on machines, they solve a graph coloring problem. Graphs are everywhere.`,
  },

  intuition: {
    summary: `A graph is just dots (vertices/nodes) connected by lines (edges). That's it.
      The power comes from what questions you can ask: Can I get from A to B?
      What's the shortest path? Can I color this map with 4 colors so no neighbors match?`,
    perspectives: [
      {
        style: 'visual',
        explanation: `Think of a graph as a map of connections. Vertices are places; edges are roads.
          A "path" is a sequence of edges you traverse. A "cycle" is a path that returns to the start.
          "Connected" means you can get from any vertex to any other.`,
        visualizationId: 'GraphExplorerViz',
      },
      {
        style: 'CS-perspective',
        explanation: `Graphs are represented two ways in code:
          (1) Adjacency Matrix: a 2D array where [i][j]=1 means edge between i and j.
          (2) Adjacency List: each vertex stores a list of its neighbors.
          Matrix is fast for "does edge exist?" — O(1). List is better for sparse graphs.`,
        codeExample: `// Adjacency List
const graph = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'D'],
  D: ['B', 'C']
};

// BFS to find shortest path
function bfs(start, end) {
  const queue = [[start]];
  const visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === end) return path;
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
}`,
      },
      {
        style: 'physical',
        explanation: `Model a factory floor as a graph: machines are vertices, material flow paths are edges.
          Finding the "critical path" (longest path through the network) tells you the
          minimum time to complete production — this is literally how CPM scheduling works.`,
      },
    ],
  },

  math: {
    formalDefinition: `A graph G = (V, E) where V is a set of vertices and E ⊆ V×V is a set of edges.
      A directed graph (digraph) has ordered pairs for edges. An undirected graph has unordered pairs.`,
    keyDefinitions: [
      { term: 'Degree', def: 'Number of edges incident to a vertex. In directed graphs: in-degree and out-degree.' },
      { term: 'Path', def: 'A sequence of vertices v₁,v₂,...,vₙ where each consecutive pair is connected by an edge.' },
      { term: 'Cycle', def: 'A path where the first and last vertex are the same.' },
      { term: 'Connected', def: 'A graph is connected if there exists a path between every pair of vertices.' },
      { term: 'Tree', def: 'A connected acyclic graph. A tree on n vertices has exactly n-1 edges.' },
      { term: 'Euler Path', def: 'A path that visits every EDGE exactly once.' },
      { term: 'Hamiltonian Path', def: 'A path that visits every VERTEX exactly once.' },
      { term: 'Planar Graph', def: 'A graph that can be drawn in the plane without edge crossings.' },
    ],
    keyTheorems: [
      {
        name: 'Handshaking Lemma',
        formula: '\\sum_{v \\in V} \\deg(v) = 2|E|',
        note: 'Every edge contributes 2 to the total degree sum.',
      },
      {
        name: 'Euler\'s Theorem',
        formula: '\\text{Euler circuit exists} \\iff \\text{connected and all vertices have even degree}',
        note: 'Euler path exists iff exactly 0 or 2 vertices have odd degree.',
      },
      {
        name: 'Euler\'s Formula (Planar)',
        formula: 'V - E + F = 2',
        note: 'V=vertices, E=edges, F=faces (including outer face). Always 2 for connected planar graphs.',
      },
    ],
  },

  rigor: {
    visualizationId: 'GraphExplorerViz',
    title: 'Proof: Euler Path Existence Condition',
    proofSteps: [
      { expression: '\\text{Claim: Euler circuit} \\Rightarrow \\text{all vertices have even degree}', annotation: 'If a circuit exists, we\'ll prove every vertex has even degree.' },
      { expression: '\\text{Every time path enters a vertex, it must leave}', annotation: 'In a circuit, you pass THROUGH each vertex. Each pass uses 2 edges (one in, one out).' },
      { expression: '\\therefore \\text{each vertex contributes pairs of edges} \\Rightarrow \\text{even degree}', annotation: 'Every visit uses 2 edges → degree counts in pairs → must be even.' },
      { expression: '\\text{Converse: if all even, Hierholzer\'s algorithm constructs the circuit}', annotation: 'The other direction is proven constructively by explicitly building the circuit.' },
    ],
  },

  examples: [
    {
      id: 'dm-gt-intro-ex1',
      title: 'Königsberg Bridges — Does an Euler Path Exist?',
      problem: 'The original Königsberg graph has 4 vertices with degrees 3, 3, 3, 5. Euler path possible?',
      steps: [
        { expression: '\\text{Count odd-degree vertices: all four have odd degree}', annotation: 'Degrees 3,3,3,5 are all odd.' },
        { expression: '\\text{Euler path requires exactly 0 or 2 odd-degree vertices}', annotation: 'Apply Euler\'s theorem.' },
        { expression: '4 > 2 \\therefore \\text{No Euler path exists}', annotation: 'Euler was right: impossible! 4 odd-degree vertices is too many.' },
      ],
    },
    {
      id: 'dm-gt-intro-ex2',
      title: 'BFS Shortest Path',
      problem: 'In graph A-B-C-D with edges AB, AC, BD, CD, find shortest path from A to D.',
      steps: [
        { expression: '\\text{BFS queue: } [A]', annotation: 'Start at A.' },
        { expression: '\\text{Visit A, enqueue neighbors: } [B, C]', annotation: 'A connects to B and C.' },
        { expression: '\\text{Visit B, enqueue D. Path: A→B→D (length 2)}', annotation: 'D is found via B. BFS guarantees this is shortest.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'dm-gt-intro-c1',
      difficulty: 'medium',
      problem: 'A graph has 6 vertices, all with degree 3. How many edges does it have?',
      hint: 'Use the Handshaking Lemma: sum of degrees = 2 × number of edges.',
      walkthrough: [
        { expression: '\\sum \\deg(v) = 6 \\times 3 = 18', annotation: 'Total degree is 18.' },
        { expression: '18 = 2|E| \\Rightarrow |E| = 9', annotation: 'By Handshaking Lemma, 9 edges.' },
      ],
      answer: '9 edges',
    },
    {
      id: 'dm-gt-intro-c2',
      difficulty: 'hard',
      problem: 'Prove a tree with n vertices has exactly n-1 edges.',
      hint: 'Use induction. Base case n=1. For inductive step, think about removing a leaf.',
      walkthrough: [
        { expression: 'n=1: 1 \\text{ vertex}, 0 \\text{ edges} = 1-1 \\checkmark', annotation: 'Base case holds.' },
        { expression: '\\text{Assume true for } n=k. \\text{ Tree with } k \\text{ vertices has } k-1 \\text{ edges.}', annotation: 'Inductive hypothesis.' },
        { expression: '\\text{Tree with } k+1 \\text{ vertices: remove a leaf (degree-1 vertex) and its edge}', annotation: 'Every tree with >1 vertex has a leaf. Removing it gives a tree with k vertices.' },
        { expression: '\\text{That has } k-1 \\text{ edges. Add back the leaf: } (k-1)+1 = k = (k+1)-1 \\checkmark', annotation: 'Inductive step complete. By induction, the theorem holds for all n≥1.' },
      ],
      answer: 'Proven by induction: every tree on n vertices has exactly n-1 edges.',
    },
  ],
}
