import konigsbergBridgesUrl from '../diagrams/dm-konigsberg-bridges.svg?url'

export default {
  id: 'graph-theory-intro',
  slug: 'graph-theory-intro',
  title: 'Graph Theory: Networks, Paths & Puzzles',
  tags: ['discrete-math', 'graph-theory', 'networks', 'algorithms'],
  chapter: 'discrete-2',
  order: 2,

  hook: {
    question: 'Can you draw this shape without lifting your pen or retracing any line?',
    realWorldContext: `In 1736, Euler was asked whether you could walk the seven bridges of Königsberg, crossing each exactly once and returning home. He proved it was impossible — and in doing so, invented graph theory. Today the same ideas power Google Maps' shortest-route search (Dijkstra's algorithm running on a graph), Facebook's friend suggestions (measuring graph distance), and factory job scheduling (a graph coloring problem). Every time you need to know "can I get from A to B" or "what's the shortest way," you are asking a graph theory question, whether or not you'd call it that.`,
  },

  intuition: {
    prose: [
      'A **graph** is just dots (vertices, or nodes) connected by lines (edges). That\'s the entire idea. The power comes from what questions you can ask about that structure: Can I get from A to B? What\'s the shortest path? Can I color this map with 4 colors so no two neighboring regions match?',

      'Think of a graph as a map of connections. Vertices are places; edges are roads. A **path** is a sequence of edges you traverse to get from one vertex to another. A **cycle** is a path that returns to where it started. A graph is **connected** if you can get from any vertex to any other vertex by following some path.',

      `![The seven bridges of Königsberg redrawn as a graph — four vertices, each with odd degree](${konigsbergBridgesUrl})`,

      'This is exactly Euler\'s original problem. Redraw the four landmasses as vertices and the seven bridges as edges, and the question "can I cross every bridge exactly once and return home?" becomes "does this graph have an Euler circuit?" We\'ll prove the general condition for that below — and it settles Königsberg immediately, without anyone lacing up their boots.',

      'Graphs are represented two ways in code. An **adjacency matrix** is a 2D array where entry [i][j] = 1 means an edge connects vertex i and vertex j — checking "does this edge exist?" is O(1), but the array uses space for every possible pair whether or not an edge is there. An **adjacency list** instead has each vertex store just its own list of neighbors — better for sparse graphs (few edges relative to possible pairs), since it doesn\'t waste space recording all the non-edges.',

      `\`\`\`javascript
// Adjacency list
const graph = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'D'],
  D: ['B', 'C']
};

// BFS finds the shortest path by exploring outward in "ripples" —
// all of a vertex's neighbors before any of its neighbors' neighbors.
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
}
\`\`\``,

      'One more angle before the formal definitions: model a factory floor as a graph, with machines as vertices and material-flow paths as edges. Finding the "critical path" — the longest path through the network — tells you the minimum possible time to complete production. This is literally how Critical Path Method (CPM) scheduling works in project management, and it is the exact same graph-theoretic idea as finding the longest path in any other network.',
    ],
    visualizations: [
      {
        id: 'GraphExplorerViz',
        title: 'Build and Explore a Graph',
        caption: 'Add vertices and edges, then check connectivity, degree, and path existence live.',
      },
    ],
  },

  math: {
    prose: [
      'Formally, a **graph** G = (V, E) consists of a set V of vertices and a set E of edges, where each edge connects two vertices. A **directed graph** (digraph) has edges that are ordered pairs — the edge from A to B is different from the edge from B to A. An **undirected graph** has unordered pairs — a single edge between A and B works both directions.',

      'A handful of terms recur constantly: **degree** is the number of edges touching a vertex (in a directed graph, split into in-degree and out-degree). A **path** is a sequence of vertices where each consecutive pair is joined by an edge. A **cycle** is a path whose first and last vertex coincide. A graph is **connected** if a path exists between every pair of vertices. A **tree** is a connected graph with no cycles — and a tree on n vertices always has exactly n − 1 edges, proved by induction in the challenges below. An **Euler path** visits every *edge* exactly once; a **Hamiltonian path** visits every *vertex* exactly once — easy to confuse, since both are "visit everything without repeating," but they count completely different things. A **planar graph** can be drawn in the plane with no edges crossing.',

      'Three theorems do most of the work in this lesson. The **Handshaking Lemma**: the sum of every vertex\'s degree equals 2|E| — because every edge has two ends, it contributes exactly 2 to the total degree count no matter which two vertices it joins. **Euler\'s Theorem**: a connected graph has an Euler circuit if and only if every vertex has even degree, and has an Euler path (not necessarily returning to the start) if and only if exactly 0 or 2 vertices have odd degree — this is the theorem that settles Königsberg, proved formally below. **Euler\'s Formula** (for connected planar graphs): V − E + F = 2, where F counts faces including the unbounded outer face.',
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
  semantics: {
    core: [
      { symbol: 'G = (V, E)', meaning: 'Graph — a set of Vertices and Edges' },
      { symbol: 'deg(v)', meaning: 'Degree — number of edges connected to vertex v' },
      { symbol: 'Path', meaning: 'A sequence of connected edges' },
      { symbol: 'Cycle', meaning: 'A path that starts and ends at the same vertex' },
      { symbol: 'Handshaking Lemma', meaning: 'Σ deg(v) = 2|E|' },
      { symbol: 'Adjacency Matrix', meaning: 'A 2D array representation of a graph' },
      { symbol: 'Adjacency List', meaning: 'An object/map representation of a graph' },
    ],
    rulesOfThumb: [
      'Every edge contributes 2 to the total degree sum.',
      'Euler Circuit: Possible if and only if every vertex has EVEN degree and the graph is connected.',
      'Euler Path: Possible if and only if exactly 0 or 2 vertices have ODD degree.',
      'Trees on n vertices always have exactly n-1 edges.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-02',
        label: 'Relations and Structures',
        note: 'Graphs are the physical map of the abstract relations we studied previously — a graph is just a relation drawn as dots and arrows.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-08',
        label: 'Graph Theory and Networks',
        note: 'We will dive deeper into advanced graph properties — trees, BFS distance layers, and representation tradeoffs — once counting and recursion give us the tools to analyze them rigorously.',
      },
    ],
  },

  mentalModel: [
    'A graph is a data structure for relationships.',
    'Euler is about edges; Hamilton is about vertices.',
    'BFS explores in ripples (breadth); DFS explores in tunnels (depth).',
    'Connectedness is the ability to get from anywhere to anywhere else.',
  ],

  assessment: {
    questions: [
      {
        id: 'gt-assess-1',
        type: 'choice',
        text: 'How many edges are in a graph where the sum of all vertex degrees is 20?',
        options: ['10', '20', '5', '40'],
        answer: '10',
        hint: 'Use the Handshaking Lemma: sum of degrees = 2 * edges.',
      },
      {
        id: 'gt-assess-2',
        type: 'input',
        text: 'Does an Euler circuit exist in a graph with vertex degrees {2, 2, 3, 3}?',
        answer: 'No',
        hint: 'An Euler circuit requires ALL vertices to have even degrees.',
      },
    ],
  },

  quiz: [
    {
      id: 'gt-q1',
      type: 'choice',
      text: 'What is the primary difference between a Path and a Cycle?',
      options: ['Paths are longer', 'Cycles return to the start vertex', 'Paths use all edges', 'Cycles use all vertices'],
      answer: 'Cycles return to the start vertex',
      hints: ['A cycle is a closed path.'],
    },
    {
      id: 'gt-q2',
      type: 'choice',
      text: 'Which data structure is usually more space-efficient for "sparse" graphs (few edges)?',
      options: ['Adjacency Matrix', 'Adjacency List', 'Coordinate Plane', 'Array of Arrays'],
      answer: 'Adjacency List',
      hints: ['Adjacency lists only store the edges that actually exist.'],
    },
  ],
}
