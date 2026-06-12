// DSA + Design Patterns — Lesson 07
// Graphs and the Strategy Pattern

export const lesson = {
  id: 'dsa-patterns-07',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '7. Graphs and the Strategy Pattern',
  checkpoints: [
    { id: 'cp-graph',    label: 'Graph Structure' },
    { id: 'cp-traverse', label: 'BFS and DFS' },
    { id: 'cp-strategy', label: 'Strategy Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'A tree is a special kind of graph. A graph is the general case: any set of items where some items are connected to other items. The items are called vertices (or nodes). The connections are called edges. Trees are graphs with no cycles — you can never follow edges and loop back to where you started. Graphs can have cycles. Social networks are graphs: people are vertices, friendships are edges. Maps are graphs: cities are vertices, roads are edges. Code dependency trees, web links, recommendation engines — all graphs. Graphs are the most general data structure we have covered, and graph traversal is one of the most important algorithms in computer science.',
      code: null,
    },

    // ── Step 1: Adjacency list ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-adjacency',
      text: 'How do you store a graph? There are two common approaches. An adjacency matrix is a 2D array where matrix[i][j] = true means there is an edge from vertex i to vertex j. Fast to check "are these two connected?" but uses O(n²) memory. An adjacency list stores, for each vertex, the list of vertices it connects to. Uses O(vertices + edges) memory, which is much better for sparse graphs — most real-world graphs have far fewer edges than the maximum possible. We will use an adjacency list.',
      code: `// Adjacency list representation using an object (or Map)
// Each key is a vertex; the value is an array of neighbouring vertices

const graph = {
  'alice':  ['bob', 'carol'],
  'bob':    ['alice', 'dave'],
  'carol':  ['alice', 'eve'],
  'dave':   ['bob'],
  'eve':    ['carol'],
}

// "alice and bob are friends" means both have each other in their list
// This is an undirected graph — edges go both ways

// Who are alice's friends?
console.log('alice knows:', graph['alice'])

// Are bob and carol connected? (one hop apart via alice)
// Are dave and eve connected? (need to traverse to find out)`,
    },

    // ── Step 2: createGraph ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-createGraph',
      text: 'Wrap the adjacency list in a createGraph factory. addVertex creates an empty entry for a new vertex. addEdge adds both directions for an undirected graph. getNeighbours returns the list of connected vertices. The adjacency list is private — callers use the clean interface. Notice we use a Map internally so any type (not just strings) can be a vertex.',
      code: `// createGraph — wraps an adjacency list
function createGraph() {
  const adjacency = new Map()   // vertex → array of neighbours

  return {
    addVertex(vertex) {
      if (!adjacency.has(vertex)) {
        adjacency.set(vertex, [])
      }
    },

    addEdge(v1, v2) {
      // Undirected: add both directions
      adjacency.get(v1).push(v2)
      adjacency.get(v2).push(v1)
    },

    getNeighbours(vertex) {
      return adjacency.get(vertex) ?? []
    },

    hasVertex(vertex) { return adjacency.has(vertex) },
    vertices() { return [...adjacency.keys()] },
  }
}

const g = createGraph()
g.addVertex('alice')
g.addVertex('bob')
g.addVertex('carol')
g.addEdge('alice', 'bob')
g.addEdge('alice', 'carol')

console.log('alice neighbours:', g.getNeighbours('alice'))   // ['bob', 'carol']
console.log('bob neighbours:',   g.getNeighbours('bob'))     // ['alice']
console.log('all vertices:',     g.vertices())`,
    },

    {
      type: 'challenge',
      id: 'ch-graph',
      text: 'Build a graph representing a small network: alice–bob, alice–carol, bob–dave, carol–dave, dave–eve. Log how many neighbours alice has (2) and how many dave has (3).',
      expectedOutput: null,
      startCode: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}

const g = createGraph()
// add vertices and edges
// log neighbour counts for alice and dave`,
      hint: 'After adding all vertices and edges: console.log(g.getNeighbours("alice").length) and g.getNeighbours("dave").length.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(2) && nums.includes(3)
      },
    },

    { type: 'checkpoint', id: 'cp-graph' },

    // ── Step 3: DFS — depth first ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-dfs',
      text: 'Depth-First Search (DFS) explores as far as possible along one path before backtracking. Think of navigating a maze: go straight until you hit a wall, then backtrack and try another direction. DFS uses a stack — or recursion, which uses the call stack. A visited set tracks which vertices have been seen so that cycles do not cause infinite loops. A visited set is a Set (lesson pre-5): add() puts something in, has() checks if it is there.',
      code: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}

// DFS — go as deep as possible before backtracking
function dfs(graph, start) {
  const visited = new Set()   // tracks which vertices we have seen
  const order = []

  function explore(vertex) {
    visited.add(vertex)   // mark as seen
    order.push(vertex)

    for (const neighbour of graph.getNeighbours(vertex)) {
      if (!visited.has(neighbour)) {   // only visit unvisited vertices
        explore(neighbour)
      }
    }
  }

  explore(start)
  return order
}

const g = createGraph()
;['alice','bob','carol','dave','eve'].forEach(v => g.addVertex(v))
g.addEdge('alice','bob'); g.addEdge('alice','carol')
g.addEdge('bob','dave');  g.addEdge('carol','eve')

console.log('DFS from alice:', dfs(g, 'alice'))
// Goes deep: alice → bob → dave (dead end, back) → carol → eve`,
    },

    // ── Step 4: BFS — breadth first ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-bfs',
      text: 'Breadth-First Search (BFS) explores all neighbours at the current distance before going further. Think of ripples spreading out from a stone dropped in water. BFS uses a queue (not a stack): add the starting vertex, then repeatedly dequeue a vertex and enqueue all its unvisited neighbours. BFS always finds the shortest path (in terms of number of edges) between two vertices. DFS might find a longer path first. The only difference between DFS and BFS is the data structure used: stack for DFS, queue for BFS.',
      code: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}

// BFS — explore neighbours level by level
function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]   // queue: front is index 0
  const order = []

  while (queue.length > 0) {
    const vertex = queue.shift()   // dequeue from front
    order.push(vertex)

    for (const neighbour of graph.getNeighbours(vertex)) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour)
        queue.push(neighbour)   // enqueue at back
      }
    }
  }
  return order
}

const g = createGraph()
;['alice','bob','carol','dave','eve'].forEach(v => g.addVertex(v))
g.addEdge('alice','bob'); g.addEdge('alice','carol')
g.addEdge('bob','dave');  g.addEdge('carol','eve')

console.log('BFS from alice:', bfs(g, 'alice'))
// Level by level: alice → bob, carol → dave, eve`,
    },

    // ── Step 5: Shortest path ─────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-shortest-path',
      text: 'Because BFS explores level by level, the first time it reaches a vertex is always via the shortest path from the start. Track the path by storing, for each vertex, which vertex was used to reach it (its "predecessor"). When you reach the target, follow predecessors back to the start and reverse the list. This gives you the shortest route. GPS navigation, social network "degrees of separation", and network routing all use this exact idea.',
      code: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}

function shortestPath(graph, start, end) {
  if (start === end) return [start]

  const visited = new Set([start])
  const queue = [start]
  const prev = new Map()   // vertex → the vertex that led here

  while (queue.length > 0) {
    const vertex = queue.shift()

    for (const neighbour of graph.getNeighbours(vertex)) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour)
        prev.set(neighbour, vertex)   // record how we got here

        if (neighbour === end) {
          // Reconstruct path by following prev backward
          const path = [end]
          let current = end
          while (prev.has(current)) {
            current = prev.get(current)
            path.push(current)
          }
          return path.reverse()
        }
        queue.push(neighbour)
      }
    }
  }
  return null   // no path exists
}

const g = createGraph()
;['a','b','c','d','e','f'].forEach(v => g.addVertex(v))
g.addEdge('a','b'); g.addEdge('a','c'); g.addEdge('b','d')
g.addEdge('c','e'); g.addEdge('d','f'); g.addEdge('e','f')

console.log(shortestPath(g, 'a', 'f'))   // ['a','c','e','f'] or ['a','b','d','f']
console.log(shortestPath(g, 'b', 'e'))   // path from b to e`,
    },

    {
      type: 'challenge',
      id: 'ch-traverse',
      text: 'Write isConnected(graph, v1, v2) that returns true if there is any path between v1 and v2 (use BFS or DFS). Build a graph with two disconnected components: {a–b–c} and {x–y}. Test that a and b are connected (true) but a and x are not (false).',
      expectedOutput: null,
      startCode: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}

function isConnected(graph, v1, v2) {
  // use BFS or DFS — return true if v2 is reachable from v1
}

const g = createGraph()
;['a','b','c','x','y'].forEach(v => g.addVertex(v))
g.addEdge('a','b'); g.addEdge('b','c')   // component 1
g.addEdge('x','y')                        // component 2 — separate

console.log(isConnected(g, 'a', 'c'))    // true
console.log(isConnected(g, 'a', 'x'))    // false`,
      hint: 'Run BFS/DFS from v1. If v2 appears in the visited set at the end, return true.',
      validate: ({ logs }) => {
        const flat = logs.map(l => String(l).toLowerCase())
        return flat.some(l => l.includes('true')) && flat.some(l => l.includes('false'))
      },
    },

    { type: 'checkpoint', id: 'cp-traverse' },

    // ── Step 6: Strategy Pattern ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-strategy-problem',
      text: 'The Strategy pattern solves a problem you have now seen with DFS and BFS: two algorithms that solve the same problem differently. A naive implementation hardcodes the choice — the caller has to change its code to switch algorithms. The Strategy pattern says: define the algorithm as an object that can be swapped. The code that uses the algorithm (the "context") does not change when the strategy changes. This is especially valuable when you need to choose an algorithm at runtime based on conditions.',
      code: `// Without Strategy: algorithm choice is hardcoded in the caller
function findPath(graph, start, end, usesBFS) {
  if (usesBFS) {
    // BFS code here...
    console.log('using BFS')
  } else {
    // DFS code here...
    console.log('using DFS')
  }
  // Adding a third algorithm requires changing this function
}

// The problem: the caller is responsible for knowing which algorithm to pick.
// The algorithm implementations are tangled with the control flow.
// Every new algorithm requires changing findPath().`,
    },

    {
      type: 'narration',
      id: 'step7-strategy-extract',
      text: 'Extract each algorithm into its own object with a consistent interface: traverse(graph, start). The "context" function takes a strategy object as a parameter and calls strategy.traverse(). The context does not know or care which algorithm is running. You can swap strategies without touching the context code — pass a different object. This is the open-closed principle: open for extension (new strategies), closed for modification (context unchanged).',
      code: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}

// Strategy 1: DFS
const dfsStrategy = {
  name: 'DFS',
  traverse(graph, start) {
    const visited = new Set(), order = []
    function go(v) { visited.add(v); order.push(v); for(const n of graph.getNeighbours(v)) if(!visited.has(n)) go(n) }
    go(start)
    return order
  },
}

// Strategy 2: BFS
const bfsStrategy = {
  name: 'BFS',
  traverse(graph, start) {
    const visited = new Set([start]), queue = [start], order = []
    while(queue.length) {
      const v = queue.shift(); order.push(v)
      for(const n of graph.getNeighbours(v)) if(!visited.has(n)){ visited.add(n); queue.push(n) }
    }
    return order
  },
}

// Context: uses whichever strategy is passed in — no if/else
function exploreGraph(graph, start, strategy) {
  const result = strategy.traverse(graph, start)
  console.log(\`\${strategy.name}: \${result.join(' → ')}\`)
}

const g = createGraph()
;['a','b','c','d','e'].forEach(v => g.addVertex(v))
g.addEdge('a','b'); g.addEdge('a','c'); g.addEdge('b','d'); g.addEdge('c','e')

exploreGraph(g, 'a', dfsStrategy)   // DFS order
exploreGraph(g, 'a', bfsStrategy)   // BFS order — same function, different strategy`,
    },

    {
      type: 'challenge',
      id: 'ch-strategy',
      text: 'Add a third strategy: randomStrategy that picks BFS or DFS randomly each call. The context function (exploreGraph) should work unchanged. Call exploreGraph three times — it might use a different algorithm each time but the interface is identical.',
      expectedOutput: null,
      startCode: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}
const dfsStrategy = {
  name: 'DFS',
  traverse(g, s) { const vi=new Set(),o=[]; function go(v){vi.add(v);o.push(v);for(const n of g.getNeighbours(v))if(!vi.has(n))go(n)} go(s); return o },
}
const bfsStrategy = {
  name: 'BFS',
  traverse(g, s) { const vi=new Set([s]),q=[s],o=[]; while(q.length){const v=q.shift();o.push(v);for(const n of g.getNeighbours(v))if(!vi.has(n)){vi.add(n);q.push(n)}} return o },
}

// Add randomStrategy here — picks dfs or bfs randomly, same traverse interface

function exploreGraph(g, start, strategy) {
  console.log(strategy.name + ':', strategy.traverse(g, start).join(' → '))
}

const g = createGraph()
;['a','b','c','d'].forEach(v => g.addVertex(v))
g.addEdge('a','b'); g.addEdge('a','c'); g.addEdge('b','d')

exploreGraph(g, 'a', dfsStrategy)
exploreGraph(g, 'a', bfsStrategy)
// exploreGraph(g, 'a', randomStrategy)`,
      hint: 'randomStrategy = { name: "Random", traverse(g, s) { const s2 = Math.random() < 0.5 ? dfsStrategy : bfsStrategy; return s2.traverse(g, s) } }',
      validate: ({ logs }) => logs.length >= 2 && logs.some(l => String(l).includes('→')),
    },

    { type: 'checkpoint', id: 'cp-strategy' },

    // ── CodeLens ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through BFS from "a". Watch the queue: "a" starts in it, gets dequeued, its neighbours "b" and "c" get enqueued. Then "b" is dequeued, "d" gets enqueued. Then "c" is dequeued — but "d" is already visited. Then "d" is dequeued. Watch the visited Set grow one vertex at a time. This level-by-level expansion is what guarantees shortest paths.',
      code: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}

function bfs(graph, start) {
  const visited = new Set([start])
  const queue   = [start]
  const order   = []
  while (queue.length) {
    const v = queue.shift()
    order.push(v)
    for (const n of graph.getNeighbours(v)) {
      if (!visited.has(n)) { visited.add(n); queue.push(n) }
    }
  }
  return order
}

const g = createGraph()
;['a','b','c','d','e'].forEach(v => g.addVertex(v))
g.addEdge('a','b'); g.addEdge('a','c')
g.addEdge('b','d'); g.addEdge('c','e')

console.log(bfs(g, 'a'))`,
    },

    {
      type: 'codelens',
      id: 'cl-graphs',
      text: 'Step through BFS in CodeLens. Watch the queue array in the Variables panel: it grows as neighbours are added and shrinks as vertices are dequeued. Watch visited grow one vertex at a time. The order array shows you the level-by-level discovery.',
      code: `function createGraph() {
  const adj = new Map()
  return {
    addVertex(v)    { if(!adj.has(v)) adj.set(v, []) },
    addEdge(v1, v2) { adj.get(v1).push(v2); adj.get(v2).push(v1) },
    getNeighbours(v){ return adj.get(v) ?? [] },
  }
}
function bfs(graph, start) {
  const visited = new Set([start]), queue = [start], order = []
  while (queue.length) {
    const v = queue.shift(); order.push(v)
    for (const n of graph.getNeighbours(v)) {
      if (!visited.has(n)) { visited.add(n); queue.push(n) }
    }
  }
  return order
}
const g = createGraph()
;['a','b','c','d','e'].forEach(v => g.addVertex(v))
g.addEdge('a','b'); g.addEdge('a','c'); g.addEdge('b','d'); g.addEdge('c','e')
console.log(bfs(g, 'a'))`,
      lang: 'js',
    },

  ],
}
