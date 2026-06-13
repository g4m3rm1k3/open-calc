// DSA + Design Patterns — Lesson 25
// Minimum Spanning Trees + Strategy Pattern

export const lesson = {
  id: 'dsa-patterns-25',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '25. Minimum Spanning Trees + Strategy',
  checkpoints: [
    { id: 'cp-union-find', label: 'Union-Find' },
    { id: 'cp-mst',        label: 'MST Algorithms' },
    { id: 'cp-strategy',   label: 'Strategy Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You are designing a network of cables to connect ten offices. Each possible cable route has a cost. You need every office connected, but you want to minimise total cable cost. No redundant cables — just the minimum to keep everything connected. This is the Minimum Spanning Tree problem. There are two classic algorithms to solve it. They both find the same answer (minimum total weight) but use completely different strategies: one sorts all edges globally, the other grows from a single node greedily. The Strategy design pattern makes them interchangeable.',
      code: null,
    },

    // ── Step 1: Spanning tree vocabulary ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-vocab',
      text: 'A spanning tree of a connected undirected graph is a subgraph that includes all vertices and is a tree — connected with no cycles. A minimum spanning tree (MST) is the spanning tree with the smallest total edge weight. For V vertices, the MST has exactly V-1 edges (a property of trees — adding any edge creates a cycle, removing any edge disconnects it). The MST is not necessarily unique — there may be several MSTs of equal weight if multiple edges have the same weight.',
      code: `// Spanning tree illustration
// Original graph: 4 nodes, 6 edges
const graph = {
  vertices: ['A','B','C','D'],
  edges: [
    {u:'A',v:'B',weight:1},
    {u:'A',v:'C',weight:4},
    {u:'A',v:'D',weight:3},
    {u:'B',v:'C',weight:2},
    {u:'B',v:'D',weight:5},
    {u:'C',v:'D',weight:1},
  ]
}

// One possible spanning tree (not minimal): A-B, A-C, A-D
// Total weight: 1+4+3 = 8

// Minimum spanning tree: A-B, B-C, C-D
// Total weight: 1+2+1 = 4  ← minimum possible

// V=4 vertices, V-1=3 edges in the MST
console.log('vertices:', graph.vertices.length)  // 4
console.log('MST edges needed:', graph.vertices.length - 1)  // 3`,
    },

    // ── Step 2: Union-Find (Disjoint Set Union) ───────────────────────────────

    {
      type: 'narration',
      id: 'step2-union-find',
      text: 'Kruskal\'s algorithm needs to answer one question repeatedly: "are these two vertices already in the same connected component?" Adding an edge between two vertices in the same component creates a cycle. The Union-Find data structure (also called Disjoint Set Union, DSU) answers this in near-O(1) time. Each element starts in its own set (singleton). find(x) returns the "representative" (root) of x\'s set. union(x, y) merges the sets containing x and y. If find(x) === find(y), they are already in the same set — adding this edge creates a cycle.',
      code: `class UnionFind {
  constructor(elements) {
    this.parent = {}    // element → its parent (itself initially)
    this.rank   = {}    // element → tree height (for union by rank)

    for (const e of elements) {
      this.parent[e] = e   // each element is its own parent
      this.rank[e]   = 0
    }
  }

  // find: returns the root representative of x's set
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])  // path compression
    }
    return this.parent[x]
  }

  // union: merge the sets containing x and y; return false if already same set
  union(x, y) {
    const rx = this.find(x)
    const ry = this.find(y)
    if (rx === ry) return false   // already connected — would create cycle

    // Union by rank: attach smaller tree under larger tree
    if (this.rank[rx] < this.rank[ry])      this.parent[rx] = ry
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx
    else { this.parent[ry] = rx; this.rank[rx]++ }

    return true   // successfully merged
  }

  connected(x, y) { return this.find(x) === this.find(y) }
}

const uf = new UnionFind(['A','B','C','D'])
console.log('A-B connected:', uf.connected('A','B'))   // false
uf.union('A','B')
uf.union('B','C')
console.log('A-C connected:', uf.connected('A','C'))   // true (A→B→C)
console.log('A-D connected:', uf.connected('A','D'))   // false`,
    },

    // ── Step 3: Path compression and union by rank ────────────────────────────

    {
      type: 'narration',
      id: 'step3-path-compression',
      text: 'Path compression and union by rank are the two optimisations that make Union-Find near-O(1) per operation (amortized O(α(n)) where α is the inverse Ackermann function — grows so slowly it is effectively constant for any realistic input). Path compression: when calling find(x), after finding the root, set every node along the path directly to point to the root. Future finds on those nodes skip all intermediate nodes. Union by rank: always attach the shorter tree under the taller one, keeping trees shallow. Together these two optimisations are called DSU with path compression + union by rank.',
      code: `// Demonstration of path compression effect
class UnionFind {
  constructor(elements){ this.parent=Object.fromEntries(elements.map(e=>[e,e])); this.rank=Object.fromEntries(elements.map(e=>[e,0])) }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])   // path compression: flatten tree
    }
    return this.parent[x]
  }

  union(x, y) {
    const rx=this.find(x), ry=this.find(y)
    if(rx===ry) return false
    if(this.rank[rx]<this.rank[ry])      this.parent[rx]=ry
    else if(this.rank[rx]>this.rank[ry]) this.parent[ry]=rx
    else { this.parent[ry]=rx; this.rank[rx]++ }
    return true
  }
}

// Build a chain: A-B-C-D-E-F (without path compression, find(A) would traverse 6 nodes)
const uf = new UnionFind(['A','B','C','D','E','F'])
uf.union('A','B'); uf.union('B','C'); uf.union('C','D')
uf.union('D','E'); uf.union('E','F')

// After find(A), parent[A] points directly to root — subsequent finds are O(1)
const root = uf.find('A')
console.log('root of A:', root)

// Path compressed — parent[A] now points directly to root
console.log('parent of A after find:', uf.parent['A'])   // should equal root

// Union by rank keeps tree shallow
console.log('rank of root:', uf.rank[root])              // small number`,
    },

    // ── Challenge 1: Union-Find ───────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-union-find',
      text: 'Implement find(x) with path compression and union(x, y) with union by rank. Test: create a UnionFind with 6 elements [0,1,2,3,4,5]. Union: 0-1, 1-2, 3-4, 4-5. Then call connected(0,2) — true. connected(0,3) — false. Then union(2,3) and call connected(0,5) — true. Log all three connected results.',
      expectedOutput: null,
      startCode: `class UnionFind {
  constructor(elements) {
    this.parent = {}
    this.rank   = {}
    for (const e of elements) {
      this.parent[e] = e
      this.rank[e]   = 0
    }
  }

  find(x) {
    // YOUR CODE HERE: with path compression
  }

  union(x, y) {
    // YOUR CODE HERE: with union by rank
    // return false if already same set, true if merged
  }

  connected(x, y) { return this.find(x) === this.find(y) }
}

const uf = new UnionFind([0,1,2,3,4,5])
uf.union(0,1); uf.union(1,2)
uf.union(3,4); uf.union(4,5)

console.log('0 and 2 connected:', uf.connected(0,2))   // true
console.log('0 and 3 connected:', uf.connected(0,3))   // false

uf.union(2,3)
console.log('0 and 5 connected:', uf.connected(0,5))   // true`,
      hint: 'find: if parent[x] !== x, parent[x] = find(parent[x]); return parent[x]. union: rx=find(x), ry=find(y); if rx===ry return false; attach shorter rank under taller; if equal, increment taller.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('true') && flat.includes('false')
      },
    },

    { type: 'checkpoint', id: 'cp-union-find' },

    // ── Step 4: Kruskal's algorithm ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-kruskal',
      text: 'Kruskal\'s algorithm: (1) Sort all edges by weight, ascending. (2) Iterate over sorted edges. For each edge (u, v): if u and v are NOT already connected (find(u) !== find(v)), add this edge to the MST and union their sets. If they ARE connected, skip — adding this edge would create a cycle. (3) Stop when V-1 edges are in the MST. Sorting takes O(E log E). The E union-find operations take near-O(E α(V)). Total: O(E log E) dominated by the sort. Best for sparse graphs — when E is much smaller than V².',
      code: `class UnionFind {
  constructor(elements){ this.parent=Object.fromEntries(elements.map(e=>[e,e])); this.rank=Object.fromEntries(elements.map(e=>[e,0])) }
  find(x){ if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]); return this.parent[x] }
  union(x,y){ const rx=this.find(x),ry=this.find(y); if(rx===ry)return false; if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry; else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx; else{this.parent[ry]=rx;this.rank[rx]++}; return true }
}

function kruskal(vertices, edges) {
  // Step 1: sort edges by weight ascending
  const sorted = [...edges].sort((a, b) => a.weight - b.weight)   // ← NEW

  const uf  = new UnionFind(vertices)   // ← NEW
  const mst = []                        // ← NEW  edges in the MST
  let   totalWeight = 0                 // ← NEW

  for (const edge of sorted) {          // ← NEW  iterate cheapest first
    if (uf.union(edge.u, edge.v)) {     // ← NEW  no cycle — add to MST
      mst.push(edge)                    // ← NEW
      totalWeight += edge.weight        // ← NEW
      if (mst.length === vertices.length - 1) break  // ← NEW  MST complete
    }
    // else: skip — adding would create a cycle
  }

  return { mst, totalWeight }           // ← NEW
}

const vertices = ['A','B','C','D','E']
const edges = [
  {u:'A',v:'B',weight:2},{u:'A',v:'C',weight:3},{u:'B',v:'C',weight:1},
  {u:'B',v:'D',weight:4},{u:'C',v:'D',weight:2},{u:'D',v:'E',weight:1},
  {u:'C',v:'E',weight:5}
]

const { mst, totalWeight } = kruskal(vertices, edges)
console.log('MST edges:', mst.map(e => e.u + '-' + e.v + '(' + e.weight + ')'))
console.log('total weight:', totalWeight)`,
    },

    // ── Step 5: Prim's algorithm ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-prim',
      text: 'Prim\'s algorithm: (1) Start with any vertex, add it to the MST set. (2) Of all edges connecting an MST vertex to a non-MST vertex, pick the cheapest. (3) Add that edge and its new vertex to the MST set. (4) Repeat until all vertices are in the MST. Prim\'s grows the MST like a spreading blob — always expanding by the cheapest available edge. It also uses a priority queue for efficiency: O((V + E) log V) with a proper min-heap. Best for dense graphs. Both Kruskal\'s and Prim\'s always produce a valid MST — the Strategy difference is in HOW they find it.',
      code: `function createPQ(){const i=[];return{enqueue(n,c,d){i.push({node:n,cost:c,data:d});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

function prim(vertices, adjList) {
  const inMST    = new Set()            // ← NEW  vertices added to MST
  const mstEdges = []                   // ← NEW  edges in the MST
  let   totalWeight = 0                 // ← NEW
  const pq = createPQ()                 // ← NEW  min-priority queue of candidate edges

  // Start from the first vertex
  const start = vertices[0]             // ← NEW
  inMST.add(start)                      // ← NEW
  // Add all edges from start to the priority queue
  for (const { node, weight } of (adjList[start] || [])) {  // ← NEW
    pq.enqueue(node, weight, { from: start, to: node, weight })  // ← NEW
  }

  while (!pq.isEmpty() && inMST.size < vertices.length) {   // ← NEW
    const { node, cost, data } = pq.dequeue()               // ← NEW  cheapest edge
    if (inMST.has(node)) continue                           // ← NEW  already in MST

    inMST.add(node)                     // ← NEW  add vertex to MST
    mstEdges.push(data)                 // ← NEW  add edge to MST
    totalWeight += cost                 // ← NEW

    // Add edges from newly added vertex to candidates
    for (const { node: nb, weight } of (adjList[node] || [])) {   // ← NEW
      if (!inMST.has(nb)) pq.enqueue(nb, weight, { from: node, to: nb, weight })  // ← NEW
    }
  }

  return { mst: mstEdges, totalWeight }  // ← NEW
}

const adj = {
  A:[{node:'B',weight:2},{node:'C',weight:3}],
  B:[{node:'A',weight:2},{node:'C',weight:1},{node:'D',weight:4}],
  C:[{node:'A',weight:3},{node:'B',weight:1},{node:'D',weight:2},{node:'E',weight:5}],
  D:[{node:'B',weight:4},{node:'C',weight:2},{node:'E',weight:1}],
  E:[{node:'C',weight:5},{node:'D',weight:1}],
}

const { mst, totalWeight } = prim(['A','B','C','D','E'], adj)
console.log('MST edges:', mst.map(e => e.from + '-' + e.to + '(' + e.weight + ')'))
console.log('total weight:', totalWeight)`,
    },

    // ── Step 6: Strategy — Kruskal and Prim as strategies ─────────────────────

    {
      type: 'narration',
      id: 'step6-strategy',
      text: 'This is where the two ideas meet: Kruskal\'s and Prim\'s are two strategies for solving the exact same MST problem — and the Strategy pattern makes them interchangeable. The context (MSTSolver) holds a strategy and calls strategy.compute(vertices, edges, adjList). Swap the strategy to switch algorithms. The caller never knows which algorithm ran — it just receives {mst, totalWeight}. This is Strategy\'s core benefit: the algorithm is runtime-selectable, testable in isolation, and replaceable without changing any calling code.',
      code: `// Union-Find for Kruskal
class UnionFind{constructor(e){this.parent=Object.fromEntries(e.map(x=>[x,x]));this.rank=Object.fromEntries(e.map(x=>[x,0]))}find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++};return true}}
function createPQ(){const i=[];return{enqueue(n,c,d){i.push({node:n,cost:c,data:d});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

// Strategy 1: Kruskal's
const kruskalStrategy = {
  name: "Kruskal's",
  compute(vertices, edges) {
    const sorted=[...edges].sort((a,b)=>a.weight-b.weight)
    const uf=new UnionFind(vertices); const mst=[]; let tw=0
    for(const e of sorted){ if(uf.union(e.u,e.v)){mst.push(e);tw+=e.weight;if(mst.length===vertices.length-1)break} }
    return{mst,totalWeight:tw}
  }
}

// Strategy 2: Prim's
const primStrategy = {
  name: "Prim's",
  compute(vertices, edges, adjList) {
    const inMST=new Set(), mst=[], pq=createPQ(); let tw=0
    const start=vertices[0]; inMST.add(start)
    for(const{node,weight}of(adjList[start]||[]))pq.enqueue(node,weight,{from:start,to:node,weight})
    while(!pq.isEmpty()&&inMST.size<vertices.length){const{node,cost,data}=pq.dequeue();if(inMST.has(node))continue;inMST.add(node);mst.push(data);tw+=cost;for(const{node:nb,weight}of(adjList[node]||[]))if(!inMST.has(nb))pq.enqueue(nb,weight,{from:node,to:nb,weight})}
    return{mst,totalWeight:tw}
  }
}

// Context: uses whichever strategy is set
class MSTSolver {                       // ← NEW
  constructor(strategy) { this.strategy = strategy }   // ← NEW
  setStrategy(s)        { this.strategy = s }          // ← NEW  swap at runtime
  solve(vertices, edges, adjList) {                    // ← NEW
    return this.strategy.compute(vertices, edges, adjList)  // ← NEW  delegate
  }
}

const vertices=['A','B','C','D','E']
const edges=[{u:'A',v:'B',weight:2},{u:'A',v:'C',weight:3},{u:'B',v:'C',weight:1},{u:'B',v:'D',weight:4},{u:'C',v:'D',weight:2},{u:'D',v:'E',weight:1}]
const adj={A:[{node:'B',weight:2},{node:'C',weight:3}],B:[{node:'A',weight:2},{node:'C',weight:1},{node:'D',weight:4}],C:[{node:'A',weight:3},{node:'B',weight:1},{node:'D',weight:2}],D:[{node:'B',weight:4},{node:'C',weight:2},{node:'E',weight:1}],E:[{node:'D',weight:1}]}

const solver = new MSTSolver(kruskalStrategy)
const r1 = solver.solve(vertices, edges, adj)
console.log("Kruskal's total:", r1.totalWeight)

solver.setStrategy(primStrategy)
const r2 = solver.solve(vertices, edges, adj)
console.log("Prim's total:", r2.totalWeight)
console.log('Both give same weight:', r1.totalWeight === r2.totalWeight)`,
    },

    // ── Challenge 2: Kruskal's and Prim's comparison ──────────────────────────

    {
      type: 'challenge',
      id: 'ch-mst',
      text: 'Run both Kruskal\'s and Prim\'s on the network below. Verify they produce the same total weight (they must for a unique MST). Log the total weight from each algorithm and log whether they match. The network has 6 vertices (0-5) and 9 edges.',
      expectedOutput: null,
      startCode: `class UnionFind{constructor(e){this.parent=Object.fromEntries(e.map(x=>[x,x]));this.rank=Object.fromEntries(e.map(x=>[x,0]))}find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++};return true}}
function createPQ(){const i=[];return{enqueue(n,c,d){i.push({node:n,cost:c,data:d});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

function kruskal(vertices, edges) {
  const sorted = [...edges].sort((a,b) => a.weight - b.weight)
  const uf = new UnionFind(vertices)
  const mst = []; let tw = 0
  for (const e of sorted) { if (uf.union(e.u, e.v)) { mst.push(e); tw += e.weight; if (mst.length === vertices.length-1) break } }
  return { mst, totalWeight: tw }
}

function prim(vertices, adjList) {
  const inMST=new Set(),mst=[],pq=createPQ(); let tw=0
  const start=vertices[0]; inMST.add(start)
  for(const{node,weight}of(adjList[start]||[]))pq.enqueue(node,weight,{from:start,to:node,weight})
  while(!pq.isEmpty()&&inMST.size<vertices.length){const{node,cost,data}=pq.dequeue();if(inMST.has(node))continue;inMST.add(node);mst.push(data);tw+=cost;for(const{node:nb,weight}of(adjList[node]||[]))if(!inMST.has(nb))pq.enqueue(nb,weight,{from:node,to:nb,weight})}
  return { mst, totalWeight: tw }
}

const vertices = [0,1,2,3,4,5]
const edges = [
  {u:0,v:1,weight:2},{u:0,v:3,weight:6},{u:1,v:2,weight:3},
  {u:1,v:3,weight:8},{u:1,v:4,weight:5},{u:2,v:4,weight:7},
  {u:3,v:4,weight:9},{u:3,v:5,weight:4},{u:4,v:5,weight:1},
]

// Build adjacency list for Prim's
const adjList = Object.fromEntries(vertices.map(v => [v, []]))
for (const {u,v,weight} of edges) {
  adjList[u].push({node:v,weight}); adjList[v].push({node:u,weight})
}

const rK = kruskal(vertices, edges)
const rP = prim(vertices, adjList)

console.log("Kruskal total:", rK.totalWeight)
console.log("Prim total:", rP.totalWeight)
console.log("Match:", rK.totalWeight === rP.totalWeight)`,
      hint: 'The code is complete — run it and observe that both algorithms output the same total weight. The MST for this graph has total weight 15.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('true') && flat.includes('Kruskal') && flat.includes('Prim')
      },
    },

    { type: 'checkpoint', id: 'cp-mst' },

    // ── Combined: Strategy wrapper ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'A network designer tool uses the MSTSolver with a configurable strategy. Users pick their algorithm preference. The solver runs it, then logs which edges to install and total cost. At runtime, the strategy can be switched based on input size: Prim\'s for dense graphs, Kruskal\'s for sparse ones. The decision logic is in one place — not scattered through the algorithm code.',
      code: `class UnionFind{constructor(e){this.parent=Object.fromEntries(e.map(x=>[x,x]));this.rank=Object.fromEntries(e.map(x=>[x,0]))}find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++};return true}}
function createPQ(){const i=[];return{enqueue(n,c,d){i.push({node:n,cost:c,data:d});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}
const kruskalStrategy={name:"Kruskal's",compute(v,e){const s=[...e].sort((a,b)=>a.weight-b.weight);const uf=new UnionFind(v);const m=[];let tw=0;for(const x of s){if(uf.union(x.u,x.v)){m.push(x);tw+=x.weight;if(m.length===v.length-1)break}}return{mst:m,totalWeight:tw}}}
const primStrategy={name:"Prim's",compute(v,e,adj){const inM=new Set(),m=[],pq=createPQ();let tw=0;const s=v[0];inM.add(s);for(const{node,weight}of(adj[s]||[]))pq.enqueue(node,weight,{from:s,to:node,weight});while(!pq.isEmpty()&&inM.size<v.length){const{node,cost,data}=pq.dequeue();if(inM.has(node))continue;inM.add(node);m.push(data);tw+=cost;for(const{node:nb,weight}of(adj[node]||[]))if(!inM.has(nb))pq.enqueue(nb,weight,{from:node,to:nb,weight})}return{mst:m,totalWeight:tw}}}

class NetworkDesigner {
  constructor() { this._solver = null }

  design(offices, connections, preferSparse = true) {
    const strategy = preferSparse ? kruskalStrategy : primStrategy
    console.log('Using strategy:', strategy.name)

    const adj = Object.fromEntries(offices.map(o => [o, []]))
    for (const {u,v,weight} of connections) { adj[u].push({node:v,weight}); adj[v].push({node:u,weight}) }

    const { mst, totalWeight } = strategy.compute(offices, connections, adj)

    console.log('Cables to install:')
    for (const e of mst) console.log('  ' + e.u + ' ↔ ' + e.v + ' (cost: ' + e.weight + ')')
    console.log('Total cost:', totalWeight)
  }
}

const designer = new NetworkDesigner()
designer.design(
  ['London','Paris','Berlin','Rome','Madrid'],
  [{u:'London',v:'Paris',weight:341},{u:'London',v:'Berlin',weight:930},{u:'Paris',v:'Berlin',weight:878},{u:'Paris',v:'Rome',weight:1100},{u:'Berlin',v:'Rome',weight:1185},{u:'Rome',v:'Madrid',weight:1362},{u:'Paris',v:'Madrid',weight:1054}],
  true   // sparse graph → use Kruskal's
)`,
    },

    // ── Challenge 3: Strategy comparison ─────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-strategy',
      text: 'Build a compareStrategies(vertices, edges) function that runs both Kruskal\'s and Prim\'s on the same graph and logs: "Kruskal total: X", "Prim total: Y", "Algorithms agree: true/false". Use the office network: vertices ["HQ","Dev","Sales","HR","IT","Finance"], edges with weights between 1 and 20. Both should agree on total weight.',
      expectedOutput: null,
      startCode: `class UnionFind{constructor(e){this.parent=Object.fromEntries(e.map(x=>[x,x]));this.rank=Object.fromEntries(e.map(x=>[x,0]))}find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++};return true}}
function createPQ(){const i=[];return{enqueue(n,c,d){i.push({node:n,cost:c,data:d});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}
function kruskal(v,e){const s=[...e].sort((a,b)=>a.weight-b.weight);const uf=new UnionFind(v);const m=[];let tw=0;for(const x of s){if(uf.union(x.u,x.v)){m.push(x);tw+=x.weight;if(m.length===v.length-1)break}}return{mst:m,totalWeight:tw}}
function prim(v,adj){const inM=new Set(),m=[],pq=createPQ();let tw=0;const s=v[0];inM.add(s);for(const{node,weight}of(adj[s]||[]))pq.enqueue(node,weight,{from:s,to:node,weight});while(!pq.isEmpty()&&inM.size<v.length){const{node,cost,data}=pq.dequeue();if(inM.has(node))continue;inM.add(node);m.push(data);tw+=cost;for(const{node:nb,weight}of(adj[node]||[]))if(!inM.has(nb))pq.enqueue(nb,weight,{from:node,to:nb,weight})}return{mst:m,totalWeight:tw}}

function compareStrategies(vertices, edges) {
  // Build adjacency list for Prim
  const adj = Object.fromEntries(vertices.map(v => [v, []]))
  for (const {u,v,weight} of edges) { adj[u].push({node:v,weight}); adj[v].push({node:u,weight}) }

  // YOUR CODE HERE: run both, log results, log whether they agree
}

const offices = ['HQ','Dev','Sales','HR','IT','Finance']
const cables = [
  {u:'HQ',v:'Dev',weight:5},{u:'HQ',v:'Sales',weight:10},{u:'Dev',v:'Sales',weight:3},
  {u:'Dev',v:'HR',weight:8},{u:'Sales',v:'HR',weight:6},{u:'HR',v:'IT',weight:4},
  {u:'IT',v:'Finance',weight:7},{u:'Sales',v:'Finance',weight:12},{u:'HQ',v:'IT',weight:15},
]

compareStrategies(offices, cables)`,
      hint: 'const rK = kruskal(vertices, edges); const rP = prim(vertices, adj); console.log("Kruskal total:", rK.totalWeight); console.log("Prim total:", rP.totalWeight); console.log("Algorithms agree:", rK.totalWeight === rP.totalWeight)',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('Kruskal') && flat.includes('Prim') && flat.includes('true')
      },
    },

    { type: 'checkpoint', id: 'cp-strategy' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through Kruskal\'s. Watch the sorted edges array — cheapest first. See the UnionFind check: if union returns false, the edge is skipped (would cause a cycle). Step through path compression in find(): see the parent map flatten after each call. Then compare with Prim\'s — watch the priority queue expand from the starting node outward, always picking the cheapest available edge.',
      code: `class UnionFind {
  constructor(e) { this.parent=Object.fromEntries(e.map(x=>[x,x])); this.rank=Object.fromEntries(e.map(x=>[x,0])) }
  find(x) { if (this.parent[x]!==x) this.parent[x]=this.find(this.parent[x]); return this.parent[x] }
  union(x,y) { const rx=this.find(x),ry=this.find(y); if(rx===ry)return false; if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry; else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx; else{this.parent[ry]=rx;this.rank[rx]++}; return true }
}

function kruskal(vertices, edges) {
  const sorted = [...edges].sort((a,b) => a.weight - b.weight)
  const uf  = new UnionFind(vertices)
  const mst = []; let totalWeight = 0

  for (const edge of sorted) {
    if (uf.union(edge.u, edge.v)) {
      mst.push(edge)
      totalWeight += edge.weight
      if (mst.length === vertices.length - 1) break
    }
  }

  return { mst, totalWeight }
}

const v = ['A','B','C','D']
const e = [{u:'A',v:'B',weight:2},{u:'A',v:'C',weight:3},{u:'B',v:'C',weight:1},{u:'B',v:'D',weight:4},{u:'C',v:'D',weight:2}]
const r = kruskal(v, e)
console.log('MST:', r.mst.map(x => x.u+'-'+x.v+'('+x.weight+')'))
console.log('total:', r.totalWeight)`,
    },

    {
      type: 'codelens',
      id: 'cl-mst',
      text: 'Step through in CodeLens. Watch sorted edges — cheapest first. See uf.union return true or false — false means a cycle would form. Watch the mst array grow. Count: after V-1 successful unions, the MST is complete. Notice path compression in uf.find: parent pointers flatten toward the root on each call.',
      code: `class UF{constructor(e){this.p=Object.fromEntries(e.map(x=>[x,x]));this.r=Object.fromEntries(e.map(x=>[x,0]))}find(x){if(this.p[x]!==x)this.p[x]=this.find(this.p[x]);return this.p[x]}union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.r[rx]<this.r[ry])this.p[rx]=ry;else if(this.r[rx]>this.r[ry])this.p[ry]=rx;else{this.p[ry]=rx;this.r[rx]++};return true}}
function kruskal(v,e){const s=[...e].sort((a,b)=>a.weight-b.weight);const uf=new UF(v);const m=[];let tw=0;for(const x of s){if(uf.union(x.u,x.v)){m.push(x);tw+=x.weight;if(m.length===v.length-1)break}}return{mst:m,totalWeight:tw}}
const v=['A','B','C','D']
const e=[{u:'A',v:'B',weight:2},{u:'A',v:'C',weight:3},{u:'B',v:'C',weight:1},{u:'B',v:'D',weight:4},{u:'C',v:'D',weight:2}]
const r=kruskal(v,e)
console.log('MST:',r.mst.map(x=>x.u+'-'+x.v+'('+x.weight+')'))
console.log('total:',r.totalWeight)`,
      lang: 'js',
    },

  ],
}
