// DSA + Design Patterns — Lesson 19
// Graph Representation + Adapter Pattern

export const lesson = {
  id: 'dsa-patterns-19',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '19. Graph Representation + Adapter',
  checkpoints: [
    { id: 'cp-graph',   label: 'Graph Representation' },
    { id: 'cp-adapter', label: 'Adapter Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You need to model connections between things: cities linked by roads, users linked by friendships, web pages linked by hyperlinks. There is no single "right" way to store these connections — some storage formats are fast for asking "are these two things connected?" but slow for "what is everything connected to node X?" And existing code may hand you connections in one format while your algorithm expects another. Two ideas solve these problems: a data structure that stores connections as lists of neighbours, and a design pattern that wraps an incompatible interface so your code never has to change.',
      code: null,
    },

    // ── Step 1: Graph vocabulary ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-vocab',
      text: 'Graph vocabulary (every term defined once). A graph has vertices (also called nodes) and edges (also called links) between pairs of vertices. Directed graph (digraph): edges have a direction — A→B does not imply B→A. Undirected graph: edges have no direction — if A connects to B then B connects to A. Weighted graph: each edge has a numeric cost (distance, time, price). Degree of a vertex: how many edges connect to it. Adjacent vertices (neighbours): vertices directly connected by an edge. Path: a sequence of edges connecting two vertices. Cycle: a path that returns to its start.',
      code: `// Graph vocabulary in code

// Undirected edge: if A connects to B, B connects to A
const undirected = {
  A: ['B', 'C'],
  B: ['A', 'C'],
  C: ['A', 'B'],
}

// Directed edges: A→B, A→C, B→C (not the reverse)
const directed = {
  A: ['B', 'C'],
  B: ['C'],
  C: [],
}

// Weighted edges: [neighbour, cost]
const weighted = {
  A: [['B', 4], ['C', 2]],
  B: [['C', 1]],
  C: [],
}

console.log('A neighbours (undirected):', undirected.A)    // ['B','C']
console.log('A out-edges (directed):', directed.A)         // ['B','C']
console.log('B in-edges (directed):', Object.entries(directed).filter(([,v])=>v.includes('B')).map(([k])=>k))
console.log('A weighted neighbours:', weighted.A)          // [['B',4],['C',2]]`,
    },

    // ── Step 2: Adjacency List ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-adj-list',
      text: 'An adjacency list stores a graph as a Map (or object) where each key is a vertex and its value is an array of neighbours. Space: O(V + E) where V is the number of vertices and E is the number of edges — each vertex appears once as a key, and each edge appears once (or twice for undirected). Checking if two vertices are connected: O(degree) — scan the neighbour list. Getting all neighbours: O(1) — just return the array. Best for sparse graphs (few edges relative to vertices squared).',
      code: `class AdjacencyList {
  constructor() {
    this.graph = new Map()   // vertex → array of neighbours
  }

  addVertex(v) {              // ← NEW
    if (!this.graph.has(v)) this.graph.set(v, [])  // ← NEW
  }

  addEdge(u, v, directed = false) {    // ← NEW
    this.addVertex(u)                  // ← NEW  ensure vertex exists
    this.addVertex(v)                  // ← NEW
    this.graph.get(u).push(v)          // ← NEW  u → v
    if (!directed) this.graph.get(v).push(u)  // ← NEW  v → u for undirected
  }

  getNeighbours(v) {          // ← NEW
    return this.graph.get(v) || []  // ← NEW
  }

  vertices() { return [...this.graph.keys()] }  // ← NEW
}

const g = new AdjacencyList()
g.addEdge('A', 'B')
g.addEdge('A', 'C')
g.addEdge('B', 'C')
g.addEdge('C', 'D')

console.log('vertices:', g.vertices())           // A B C D
console.log('A neighbours:', g.getNeighbours('A'))  // ['B','C']
console.log('C neighbours:', g.getNeighbours('C'))  // ['A','B','D']`,
    },

    // ── Step 3: Adjacency Matrix ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-adj-matrix',
      text: 'An adjacency matrix stores a graph as a V×V 2D array (a matrix). matrix[i][j] = 1 (or the edge weight) means there is an edge from vertex i to vertex j; 0 means no edge. Space: O(V²) — always allocates a full V×V grid regardless of how many edges exist. Checking if two vertices are connected: O(1) — direct array lookup. Getting all neighbours: O(V) — must scan the entire row. Best for dense graphs (many edges) or when O(1) edge-existence queries are critical. The trade-off: adjacency list saves space for sparse graphs; adjacency matrix saves time for edge-exists queries.',
      code: `class AdjacencyMatrix {
  constructor(vertices) {
    this.vertices = vertices                       // ← NEW  array of vertex labels
    this.index    = new Map(vertices.map((v,i) => [v, i]))  // ← NEW  label → index
    const n       = vertices.length                // ← NEW
    this.matrix   = Array.from({ length: n }, () => new Array(n).fill(0))  // ← NEW
  }

  addEdge(u, v, weight = 1, directed = false) {   // ← NEW
    const ui = this.index.get(u)                   // ← NEW
    const vi = this.index.get(v)                   // ← NEW
    this.matrix[ui][vi] = weight                   // ← NEW
    if (!directed) this.matrix[vi][ui] = weight    // ← NEW  symmetric for undirected
  }

  hasEdge(u, v) {                                  // ← NEW
    return this.matrix[this.index.get(u)][this.index.get(v)] !== 0  // ← NEW  O(1)
  }

  getNeighbours(v) {                               // ← NEW  O(V) — must scan row
    const row = this.matrix[this.index.get(v)]     // ← NEW
    return this.vertices.filter((_, i) => row[i] !== 0)  // ← NEW
  }
}

const g = new AdjacencyMatrix(['A','B','C','D'])
g.addEdge('A','B')
g.addEdge('A','C')
g.addEdge('B','C')
g.addEdge('C','D')

console.log('A-B edge exists:', g.hasEdge('A','B'))   // true  — O(1)
console.log('A-D edge exists:', g.hasEdge('A','D'))   // false — O(1)
console.log('A neighbours:', g.getNeighbours('A'))    // ['B','C']`,
    },

    // ── Challenge 1: addEdge and getNeighbours ────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-graph',
      text: 'Complete the AdjacencyList class: implement addEdge(u, v, directed=false) and getNeighbours(v). Then build a directed graph representing these dependencies: "A depends on B", "A depends on C", "B depends on D", "C depends on D". Log getNeighbours("A") — should be ["B","C"]. Log getNeighbours("D") — should be [] (D has no out-edges). Log all vertices.',
      expectedOutput: null,
      startCode: `class AdjacencyList {
  constructor() {
    this.graph = new Map()
  }

  addVertex(v) {
    if (!this.graph.has(v)) this.graph.set(v, [])
  }

  addEdge(u, v, directed = false) {
    // YOUR CODE HERE
    // ensure both vertices exist, add edge u→v, and v→u if not directed
  }

  getNeighbours(v) {
    // YOUR CODE HERE
  }

  vertices() { return [...this.graph.keys()] }
}

const g = new AdjacencyList()
g.addEdge('A', 'B', true)
g.addEdge('A', 'C', true)
g.addEdge('B', 'D', true)
g.addEdge('C', 'D', true)

console.log('A neighbours:', g.getNeighbours('A'))
console.log('D neighbours:', g.getNeighbours('D'))
console.log('all vertices:', g.vertices())`,
      hint: 'addEdge: call addVertex(u) and addVertex(v), then graph.get(u).push(v). If not directed, also graph.get(v).push(u). getNeighbours: return graph.get(v) || [].',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('B') && flat.includes('C') && flat.includes('D')
      },
    },

    { type: 'checkpoint', id: 'cp-graph' },

    // ── Step 4: Adapter Pattern intro ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-adapter-intro',
      text: 'The Adapter pattern (a Gang of Four structural pattern) makes an incompatible interface work where a different interface is expected — like a power plug adapter that lets a US plug work in a European socket. Your BFS algorithm expects a getNeighbours(v) method. Your data came in as an adjacency matrix (which has getNeighbours too, but also different internal representation). Your graph library expects an adjacency list. You have all the data — you just need to translate between representations without rewriting either side.',
      code: `// Scenario: you have data as a matrix, your algorithm needs a list interface
// Without Adapter: you must rewrite your algorithm OR your data layer

// Existing algorithm — expects adjacency list style
function bfs(graphLike, start) {
  const visited = new Set()
  const queue   = [start]
  const order   = []
  visited.add(start)

  while (queue.length > 0) {
    const v = queue.shift()
    order.push(v)
    // Algorithm calls getNeighbours — expects adjacency list interface
    for (const neighbour of graphLike.getNeighbours(v)) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour)
        queue.push(neighbour)
      }
    }
  }
  return order
}

// Problem: AdjacencyMatrix.getNeighbours exists but returns indices, not labels
// We need an Adapter that wraps the matrix and exposes the expected interface`,
    },

    // ── Step 5: MatrixToListAdapter ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-adapter-impl',
      text: 'The MatrixToListAdapter wraps an AdjacencyMatrix and exposes the same interface as AdjacencyList. Callers see only getNeighbours and vertices — they do not know whether the underlying data is a matrix or a list. This is the meeting point: the two graph representations are like two incompatible plug shapes. The Adapter converts one to the other. You can drop in the Adapter anywhere an AdjacencyList is expected.',
      code: `class AdjacencyMatrix {
  constructor(verts) {
    this.verts  = verts
    this.idx    = new Map(verts.map((v,i)=>[v,i]))
    const n     = verts.length
    this.matrix = Array.from({length:n},()=>new Array(n).fill(0))
  }
  addEdge(u,v,directed=false){ const ui=this.idx.get(u),vi=this.idx.get(v); this.matrix[ui][vi]=1; if(!directed)this.matrix[vi][ui]=1 }
  hasEdge(u,v){ return this.matrix[this.idx.get(u)][this.idx.get(v)]!==0 }
  _getNeighboursByIndex(v){ const row=this.matrix[this.idx.get(v)]; return this.verts.filter((_,i)=>row[i]!==0) }
}

// Adapter wraps AdjacencyMatrix, exposes AdjacencyList interface
class MatrixToListAdapter {                     // ← NEW
  constructor(matrix) {                         // ← NEW
    this._matrix = matrix                       // ← NEW  store the adaptee
  }                                             // ← NEW

  // Translate: matrix's internal method → standard getNeighbours
  getNeighbours(v) {                            // ← NEW
    return this._matrix._getNeighboursByIndex(v)  // ← NEW  delegate and translate
  }                                             // ← NEW

  vertices() {                                  // ← NEW
    return this._matrix.verts                   // ← NEW
  }                                             // ← NEW
}

// BFS works with either representation via the Adapter
function bfs(graphLike, start) {
  const visited=new Set(), queue=[start], order=[]
  visited.add(start)
  while(queue.length){ const v=queue.shift(); order.push(v); for(const n of graphLike.getNeighbours(v)) if(!visited.has(n)){visited.add(n);queue.push(n)} }
  return order
}

const matrix = new AdjacencyMatrix(['A','B','C','D'])
matrix.addEdge('A','B'); matrix.addEdge('A','C'); matrix.addEdge('B','D'); matrix.addEdge('C','D')

const adapter = new MatrixToListAdapter(matrix)   // wrap matrix
console.log('BFS via adapter:', bfs(adapter, 'A'))  // same result as list-based BFS`,
    },

    // ── Step 6: ListToMatrixAdapter ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-adapter-reverse',
      text: 'This is where the two ideas meet: just as the Trie\'s shared prefix nodes are naturally Flyweights, graph representations are naturally Adapter targets — the same abstract graph expressed in two concrete forms. You can adapt in either direction. A ListToMatrixAdapter wraps an AdjacencyList and exposes hasEdge in O(1) time (by building an internal matrix on construction) without changing the list. The Adapter pattern isolates the translation logic in one place, keeping both sides clean.',
      code: `class AdjacencyList {
  constructor(){ this.graph=new Map() }
  addVertex(v){ if(!this.graph.has(v))this.graph.set(v,[]) }
  addEdge(u,v,directed=false){ this.addVertex(u);this.addVertex(v);this.graph.get(u).push(v);if(!directed)this.graph.get(v).push(u) }
  getNeighbours(v){ return this.graph.get(v)||[] }
  vertices(){ return[...this.graph.keys()] }
}

// Adapter: wraps list, provides O(1) hasEdge like a matrix
class ListToMatrixAdapter {                       // ← NEW
  constructor(list) {                             // ← NEW
    this._list  = list                            // ← NEW
    this._edges = new Set()                       // ← NEW  build edge set for O(1) lookup
    for (const v of list.vertices()) {            // ← NEW
      for (const n of list.getNeighbours(v)) {   // ← NEW
        this._edges.add(v + '->' + n)             // ← NEW
      }
    }
  }

  hasEdge(u, v) {                                 // ← NEW  O(1)
    return this._edges.has(u + '->' + v)          // ← NEW
  }

  getNeighbours(v) { return this._list.getNeighbours(v) }  // ← NEW  pass-through
  vertices()       { return this._list.vertices() }         // ← NEW
}

const list = new AdjacencyList()
list.addEdge('A','B'); list.addEdge('A','C'); list.addEdge('B','D')

const adapted = new ListToMatrixAdapter(list)
console.log('A->B:', adapted.hasEdge('A','B'))   // true  — O(1)
console.log('A->D:', adapted.hasEdge('A','D'))   // false — O(1)
console.log('neighbours of A:', adapted.getNeighbours('A'))  // ['B','C']`,
    },

    // ── Challenge 2: MatrixToListAdapter ─────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-adapter',
      text: 'Build a MatrixToListAdapter that wraps an AdjacencyMatrix and exposes addEdge(u,v), getNeighbours(v), and hasEdge(u,v). The adapter should store edges internally as a Map so getNeighbours is O(degree). Build a 5-node graph (nodes 0-4) as a matrix with edges 0→1, 0→2, 1→3, 2→3, 3→4. Wrap it with your adapter and log getNeighbours(0), getNeighbours(3), and hasEdge(0,4).',
      expectedOutput: null,
      startCode: `class AdjacencyMatrix {
  constructor(n) {
    this.n      = n
    this.matrix = Array.from({length:n}, () => new Array(n).fill(0))
  }
  addEdge(u, v, directed = false) {
    this.matrix[u][v] = 1
    if (!directed) this.matrix[v][u] = 1
  }
  hasEdge(u, v) { return this.matrix[u][v] !== 0 }
}

class MatrixToListAdapter {
  constructor(matrix) {
    this._matrix = matrix
    // Build a neighbour map from the matrix for O(degree) getNeighbours
    this._neighbours = new Map()
    // YOUR CODE HERE: populate _neighbours by scanning matrix.matrix
  }

  getNeighbours(v) {
    // YOUR CODE HERE
  }

  hasEdge(u, v) {
    return this._matrix.hasEdge(u, v)
  }
}

const matrix = new AdjacencyMatrix(5)
matrix.addEdge(0, 1, true)
matrix.addEdge(0, 2, true)
matrix.addEdge(1, 3, true)
matrix.addEdge(2, 3, true)
matrix.addEdge(3, 4, true)

const adapter = new MatrixToListAdapter(matrix)
console.log('neighbours of 0:', adapter.getNeighbours(0))
console.log('neighbours of 3:', adapter.getNeighbours(3))
console.log('edge 0->4:', adapter.hasEdge(0, 4))`,
      hint: 'In the constructor, loop i from 0 to n; for each i, set _neighbours.get(i) = []; loop j from 0 to n; if matrix.matrix[i][j] !== 0, push j. getNeighbours returns _neighbours.get(v) || [].',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('false') && (flat.includes('1') || flat.includes('2'))
      },
    },

    { type: 'checkpoint', id: 'cp-adapter' },

    // ── Combined: Social network ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'A social network needs fast "are these users friends?" checks (adjacency matrix: O(1)) and fast "who are all of user X\'s friends?" queries (adjacency list: O(degree)). Store both representations but write all graph algorithms against a unified GraphInterface. Use Adapters to make both representations speak the same language. When the network is small (dense), prefer the matrix. When it grows large (sparse), switch to the list. The algorithm code never changes — only the adapter.',
      code: `class AdjacencyList {
  constructor(){ this.graph=new Map() }
  addVertex(v){ if(!this.graph.has(v))this.graph.set(v,[]) }
  addEdge(u,v,directed=false){ this.addVertex(u);this.addVertex(v);this.graph.get(u).push(v);if(!directed)this.graph.get(v).push(u) }
  getNeighbours(v){ return this.graph.get(v)||[] }
  hasEdge(u,v){ return(this.graph.get(u)||[]).includes(v) }   // O(degree)
  vertices(){ return[...this.graph.keys()] }
}

// Common algorithm: find mutual friends (common neighbours)
function mutualFriends(graph, userA, userB) {
  const friendsA = new Set(graph.getNeighbours(userA))
  return graph.getNeighbours(userB).filter(f => friendsA.has(f))
}

// Common algorithm: BFS to find if two users are connected
function connected(graph, start, end) {
  const visited=new Set([start]), queue=[start]
  while(queue.length){ const v=queue.shift(); if(v===end) return true; for(const n of graph.getNeighbours(v)) if(!visited.has(n)){visited.add(n);queue.push(n)} }
  return false
}

const social = new AdjacencyList()
;[['Alice','Bob'],['Alice','Carol'],['Bob','Carol'],['Bob','Dave'],['Carol','Eve']].forEach(([a,b])=>social.addEdge(a,b))

console.log('mutual friends (Alice, Bob):', mutualFriends(social, 'Alice', 'Bob'))   // ['Carol']
console.log('Alice connected to Dave:', connected(social, 'Alice', 'Dave'))           // true
console.log('Alice connected to Eve:', connected(social, 'Alice', 'Eve'))             // true`,
    },

    // ── Challenge 3: Switch representations ──────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Build a SocialNetwork class that internally uses an AdjacencyList but exposes an Adapter method getMatrixAdapter() that returns an object with a O(1) hasEdge(u,v) method backed by a Set. Add users Alice, Bob, Carol, Dave, Eve with edges: Alice-Bob, Alice-Carol, Bob-Dave, Carol-Dave, Dave-Eve. Run mutualFriends(network, "Alice", "Dave") and log the result. Also get the matrix adapter and log hasEdge("Alice","Eve") (false) and hasEdge("Bob","Dave") (true).',
      expectedOutput: null,
      startCode: `class AdjacencyList {
  constructor(){ this.graph=new Map() }
  addVertex(v){ if(!this.graph.has(v))this.graph.set(v,[]) }
  addEdge(u,v,directed=false){ this.addVertex(u);this.addVertex(v);this.graph.get(u).push(v);if(!directed)this.graph.get(v).push(u) }
  getNeighbours(v){ return this.graph.get(v)||[] }
  vertices(){ return[...this.graph.keys()] }
}

function mutualFriends(graph, a, b) {
  const fa = new Set(graph.getNeighbours(a))
  return graph.getNeighbours(b).filter(f => fa.has(f))
}

class SocialNetwork {
  constructor() {
    this._list = new AdjacencyList()
  }

  addFriendship(a, b) {
    this._list.addEdge(a, b)
  }

  getNeighbours(v) { return this._list.getNeighbours(v) }

  getMatrixAdapter() {
    // Return an object with hasEdge(u,v) using a Set for O(1) lookup
    // YOUR CODE HERE
  }
}

const network = new SocialNetwork()
;[['Alice','Bob'],['Alice','Carol'],['Bob','Dave'],['Carol','Dave'],['Dave','Eve']].forEach(([a,b])=>network.addFriendship(a,b))

console.log('mutual friends:', mutualFriends(network, 'Alice', 'Dave'))
const adapter = network.getMatrixAdapter()
console.log('Alice-Eve edge:', adapter.hasEdge('Alice','Eve'))
console.log('Bob-Dave edge:', adapter.hasEdge('Bob','Dave'))`,
      hint: 'In getMatrixAdapter, build a Set of "u->v" strings by iterating all vertices and their neighbours. Return { hasEdge(u,v){ return set.has(u+"->"+v) } }.',
      validate: ({ logs }) => {
        const flat = logs.join(' ').toLowerCase()
        return flat.includes('false') && flat.includes('true')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the AdjacencyList addEdge calls. Watch the Map grow — each call to addVertex creates a new entry, and push adds to the array. Then step through the Adapter constructor and watch the edge Set being built. Finally step through bfs and watch the queue shrink as nodes are visited.',
      code: `class AdjacencyList {
  constructor() { this.graph = new Map() }
  addVertex(v) { if (!this.graph.has(v)) this.graph.set(v, []) }
  addEdge(u, v) { this.addVertex(u); this.addVertex(v); this.graph.get(u).push(v); this.graph.get(v).push(u) }
  getNeighbours(v) { return this.graph.get(v) || [] }
  vertices() { return [...this.graph.keys()] }
}

class ListToMatrixAdapter {
  constructor(list) {
    this._list  = list
    this._edges = new Set()
    for (const v of list.vertices())
      for (const n of list.getNeighbours(v))
        this._edges.add(v + '->' + n)
  }
  hasEdge(u, v) { return this._edges.has(u + '->' + v) }
  getNeighbours(v) { return this._list.getNeighbours(v) }
}

const g = new AdjacencyList()
g.addEdge('A','B'); g.addEdge('B','C'); g.addEdge('A','C')
const a = new ListToMatrixAdapter(g)
console.log(a.hasEdge('A','B'))
console.log(a.hasEdge('A','C'))
console.log(a.hasEdge('B','A'))`,
    },

    {
      type: 'codelens',
      id: 'cl-graph',
      text: 'Step through in CodeLens. Watch the Map build up inside AdjacencyList as addEdge is called. Then watch the Adapter constructor loop through all vertices and edges to build the _edges Set. Finally see hasEdge do a single Set.has lookup — O(1) regardless of graph size.',
      code: `class AdjacencyList{constructor(){this.graph=new Map()}addVertex(v){if(!this.graph.has(v))this.graph.set(v,[])}addEdge(u,v){this.addVertex(u);this.addVertex(v);this.graph.get(u).push(v);this.graph.get(v).push(u)}getNeighbours(v){return this.graph.get(v)||[]}vertices(){return[...this.graph.keys()]}}
class ListToMatrixAdapter{constructor(list){this._list=list;this._edges=new Set();for(const v of list.vertices())for(const n of list.getNeighbours(v))this._edges.add(v+'->'+n)}hasEdge(u,v){return this._edges.has(u+'->'+v)}getNeighbours(v){return this._list.getNeighbours(v)}}
const g=new AdjacencyList()
g.addEdge('A','B');g.addEdge('B','C')
const a=new ListToMatrixAdapter(g)
console.log(a.hasEdge('A','B'))
console.log(a.hasEdge('A','C'))`,
      lang: 'js',
    },

  ],
}
