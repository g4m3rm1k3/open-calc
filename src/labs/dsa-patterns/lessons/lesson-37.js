// DSA + Design Patterns — Lesson 37
// Union-Find + Facade

export const lesson = {
  id: 'dsa-patterns-37',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '37. Union-Find + Facade',
  checkpoints: [
    { id: 'cp-uf',            label: 'Union-Find' },
    { id: 'cp-optimizations', label: 'Path Compression & Rank' },
    { id: 'cp-facade',        label: 'Facade Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You are building a social network and need to determine, for any two users, whether they are in the same friend group — and to merge groups when two users connect. A naive adjacency list requires a BFS or DFS to answer connectivity queries — O(n + m) per query. If you receive a million friend-connection events and need to answer connectivity questions between each event, that is O(n + m) per query times a million events. You need a structure that answers "are these two elements in the same group?" and "merge their groups" in near O(1) each. Kruskal\'s Minimum Spanning Tree algorithm, network connection tracking, and pixel flood-fill all have this same requirement.',
      code: null,
    },

    // ── Step 1: Naive Union-Find ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-naive',
      text: 'Union-Find, also called Disjoint Set Union (DSU), represents a partition of n elements into disjoint sets. Each element starts in its own set. The parent array is the key: parent[i] points to i\'s parent in a tree. Each set is represented as a tree rooted at the "representative" (root). find(x) follows parent pointers until reaching a root (where parent[x] === x). union(x, y) merges the two trees by making one root point to the other. Without optimisations, find on a tall tree is O(n) in the worst case.',
      code: `// Naive Union-Find — no optimisations yet
// parent[i] = i means i is a root (representative of its set)

function makeUF(n) {
  const parent = Array.from({length: n}, (_, i) => i)  // each element is its own root
  return parent
}

function find(parent, x) {
  while (parent[x] !== x) {   // follow parent pointers up to the root
    x = parent[x]
  }
  return x                    // return the root (representative)
}

function union(parent, x, y) {
  const rx = find(parent, x)  // root of x's set
  const ry = find(parent, y)  // root of y's set
  if (rx !== ry) parent[rx] = ry  // merge: make rx's root point to ry
}

function connected(parent, x, y) {
  return find(parent, x) === find(parent, y)
}

const p = makeUF(5)          // elements 0..4, each in its own set
union(p, 0, 1)               // merge {0} and {1} → {0,1}
union(p, 1, 2)               // merge {0,1} and {2} → {0,1,2}
console.log(connected(p, 0, 2))   // true  — 0 and 2 are in the same set
console.log(connected(p, 0, 3))   // false — 3 is still in its own set

// Problem: union(1,2) after union(0,1) can create a long chain:
// 0 → 1 → 2 → ... find(0) must traverse the whole chain`,
    },

    // ── Step 2: Path compression ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-path-compression',
      text: 'Path compression is an optimisation to find: after following the chain to the root, go back and set every node\'s parent directly to the root. The next call to find on any of those nodes is O(1) — it jumps straight to the root. This flattens the tree permanently. The amortised cost per find with path compression alone is O(log n). With both path compression and union by rank, the amortised cost is O(α(n)) where α is the inverse Ackermann function — effectively constant (α(n) ≤ 4 for any n that exists in the physical universe).',
      code: `// find with path compression
function find(parent, x) {
  if (parent[x] !== x) {                     // ← NEW  not the root?
    parent[x] = find(parent, parent[x])      // ← NEW  recursively find root, flatten path
  }
  return parent[x]                           // ← NEW  return root
}

// Illustration: chain 0→1→2→3→root(3)
const parent = [1, 2, 3, 3]   // 0's parent=1, 1's parent=2, 2's parent=3, 3 is root

console.log('before find(0):', parent.slice())   // [1, 2, 3, 3]
find(parent, 0)                                   // traverse and compress
console.log('after find(0):', parent.slice())    // [3, 3, 3, 3] — all point directly to root

// Next call to find(0) is O(1) — parent[0] === 3 === root, done immediately
console.log('find again:', find(parent, 0))      // 3`,
    },

    // ── Step 3: Union by rank ─────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-rank',
      text: 'Union by rank keeps trees shallow. The rank of a node is an upper bound on the height of its subtree. When merging two trees, always attach the smaller-rank root under the larger-rank root. If ranks are equal, attach either and increment the new root\'s rank by one. This guarantees trees have height at most O(log n) before any path compression, because a tree with rank k requires at least 2^k nodes. After path compression, trees become even flatter. Together, path compression and union by rank give the O(α(n)) amortised bound.',
      code: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i)  // ← NEW  each element is root
    this.rank   = new Array(n).fill(0)                   // ← NEW  all ranks start at 0
  }

  find(x) {                                             // ← NEW
    if (this.parent[x] !== x) {                        // ← NEW
      this.parent[x] = this.find(this.parent[x])       // ← NEW  path compression
    }
    return this.parent[x]                              // ← NEW
  }

  union(x, y) {                                        // ← NEW
    const rx = this.find(x)                            // ← NEW
    const ry = this.find(y)                            // ← NEW
    if (rx === ry) return false                        // ← NEW  already in same set

    // Attach smaller rank under larger rank to keep tree shallow
    if (this.rank[rx] < this.rank[ry]) {              // ← NEW
      this.parent[rx] = ry                             // ← NEW  rx is shallower
    } else if (this.rank[rx] > this.rank[ry]) {       // ← NEW
      this.parent[ry] = rx                             // ← NEW  ry is shallower
    } else {                                           // ← NEW  equal rank
      this.parent[ry] = rx                             // ← NEW  arbitrary choice
      this.rank[rx]++                                  // ← NEW  rx grows taller
    }
    return true                                        // ← NEW  merged a new edge
  }

  connected(x, y) {                                   // ← NEW
    return this.find(x) === this.find(y)              // ← NEW
  }
}

const uf = new UnionFind(6)
uf.union(0, 1); uf.union(1, 2); uf.union(3, 4)
console.log('0-2 connected:', uf.connected(0, 2))   // true
console.log('0-3 connected:', uf.connected(0, 3))   // false
console.log('3-4 connected:', uf.connected(3, 4))   // true`,
    },

    // ── Challenge 1: count components ────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-components',
      text: 'Use UnionFind to group the following edges: union(1,2), union(2,3), union(4,5). Elements are 1 through 6 (element 6 has no connections). Count how many distinct components exist. Expected: 3 (component {1,2,3}, component {4,5}, component {6}). Log the component count. Hint: after all unions, count how many elements i satisfy find(i) === i (they are roots of their component).',
      expectedOutput: null,
      startCode: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n+1}, (_, i) => i)   // 1-indexed: skip index 0
    this.rank   = new Array(n+1).fill(0)
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x])
    return this.parent[x]
  }
  union(x, y) {
    const rx = this.find(x), ry = this.find(y)
    if (rx === ry) return false
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx
    else { this.parent[ry] = rx; this.rank[rx]++ }
    return true
  }
  connected(x, y) { return this.find(x) === this.find(y) }
}

const uf = new UnionFind(6)   // elements 1..6

// YOUR CODE HERE:
// 1. union(1,2), union(2,3), union(4,5)
// 2. Count components: how many i from 1..6 have find(i) === i
// 3. Log the count
`,
      hint: 'uf.union(1,2); uf.union(2,3); uf.union(4,5); let count=0; for(let i=1;i<=6;i++) if(uf.find(i)===i) count++; console.log(count);',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(3)
      },
    },

    { type: 'checkpoint', id: 'cp-uf' },
    { type: 'checkpoint', id: 'cp-optimizations' },

    // ── Step 4: Facade pattern — introduction ─────────────────────────────────

    {
      type: 'narration',
      id: 'step4-facade-intro',
      text: 'The Facade design pattern (Gang of Four structural pattern) provides a simplified interface to a complex subsystem. The subsystem may have many classes and methods; the Facade exposes only the high-level operations that clients actually need, hiding implementation details. Examples: a home-theatre Facade with watchMovie() that internally sets the projector, dims lights, adjusts volume, and starts streaming — the caller does not need to know any of that. A compiler Facade with compile(source) that internally tokenises, parses, optimises, and emits code. The key benefit: callers are shielded from subsystem complexity and from changes to internal implementation.',
      code: `// Minimal facade sketch — home theatre example
class Projector { on() { console.log('projector on') } setInput(i) { console.log('input: '+i) } }
class Lights    { dim(pct) { console.log('lights: ' + pct + '%') } }
class Amplifier { setVolume(v) { console.log('volume: ' + v) } }
class Streamer  { play(movie) { console.log('playing: ' + movie) } }

// Facade: one method, many subsystem steps
class HomeTheatreFacade {
  constructor() {
    this.proj = new Projector()
    this.lights = new Lights()
    this.amp = new Amplifier()
    this.streamer = new Streamer()
  }
  watchMovie(title) {        // ← simplified interface
    this.lights.dim(10)
    this.proj.on()
    this.proj.setInput('HDMI')
    this.amp.setVolume(7)
    this.streamer.play(title)
    console.log('--- enjoy the movie ---')
  }
}

new HomeTheatreFacade().watchMovie('Inception')
// Caller needed just one line; subsystem complexity is hidden`,
    },

    // ── Step 5: GraphFacade wrapping UnionFind ────────────────────────────────

    {
      type: 'narration',
      id: 'step5-graph-facade',
      text: 'The GraphFacade wraps UnionFind and exposes three simple methods: addEdge(u, v) to connect two nodes, connected(u, v) to query connectivity, and components() to count distinct groups. The caller never interacts with parent arrays, rank arrays, or path compression — that is entirely internal. The Facade also enforces any additional invariants: addEdge records edges for potential export, components() can summarise group membership, and the API can be versioned or replaced without changing callers.',
      code: `class UnionFind {
  constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.rank=new Array(n).fill(0)}
  find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}
  union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++}return true}
  connected(x,y){return this.find(x)===this.find(y)}
}

// Facade: high-level graph API that hides Union-Find internals
class GraphFacade {                                       // ← NEW
  constructor(nodeCount) {                               // ← NEW
    this._uf    = new UnionFind(nodeCount)               // ← NEW  internal subsystem
    this._n     = nodeCount                              // ← NEW
    this._edges = []                                     // ← NEW  recorded for inspection
  }

  // High-level method — caller just says "connect u and v"
  addEdge(u, v) {                                        // ← NEW
    this._edges.push([u, v])                             // ← NEW
    this._uf.union(u, v)                                 // ← NEW  delegates to UnionFind
  }

  // High-level query — "are u and v in the same component?"
  connected(u, v) {                                      // ← NEW
    return this._uf.connected(u, v)                      // ← NEW
  }

  // High-level summary — "how many components are there?"
  components() {                                         // ← NEW
    let count = 0                                        // ← NEW
    for (let i = 0; i < this._n; i++) {                 // ← NEW
      if (this._uf.find(i) === i) count++               // ← NEW  i is a root
    }
    return count                                         // ← NEW
  }

  // High-level summary — "list all components"
  listComponents() {                                     // ← NEW
    const groups = new Map()                             // ← NEW
    for (let i = 0; i < this._n; i++) {                 // ← NEW
      const root = this._uf.find(i)                     // ← NEW
      if (!groups.has(root)) groups.set(root, [])       // ← NEW
      groups.get(root).push(i)                          // ← NEW
    }
    return [...groups.values()]                          // ← NEW
  }
}

const g = new GraphFacade(6)
g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(3, 4)
console.log('components:', g.components())          // 3
console.log('0-2 connected:', g.connected(0, 2))    // true
console.log('0-3 connected:', g.connected(0, 3))    // false
console.log('groups:', g.listComponents())          // [[0,1,2],[3,4],[5]]`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-meeting-point',
      text: 'The meeting point: Union-Find is powerful but exposing parent arrays, rank arrays, and find/union calls directly forces every caller to understand path compression and rank semantics. The Facade wraps that complexity behind addEdge, connected, and components — domain concepts that a graph algorithm engineer recognises immediately. Changes to the internal Union-Find optimisation (switching from path compression to path splitting, for example) require zero changes to callers. The Facade acts as a semantic boundary: Union-Find speaks in array indices and tree operations; the Facade speaks in graph vocabulary.',
      code: `// Without facade: caller must manage Union-Find directly
const parent = Array.from({length: 5}, (_,i) => i)
const rank   = new Array(5).fill(0)

function find(parent, x) {
  if (parent[x] !== x) parent[x] = find(parent, parent[x])
  return parent[x]
}
function union(parent, rank, x, y) {
  const rx = find(parent,x), ry = find(parent,y)
  if (rx===ry) return
  if (rank[rx]<rank[ry]) parent[rx]=ry
  else if (rank[rx]>rank[ry]) parent[ry]=rx
  else { parent[ry]=rx; rank[rx]++ }
}

// Caller must know about parent/rank, call find twice, pass both arrays
union(parent, rank, 0, 1)
console.log('without facade:', find(parent, 0) === find(parent, 1))  // true but verbose

// With facade: caller just uses the domain language
const g = new GraphFacade(5)
g.addEdge(0, 1)
console.log('with facade:', g.connected(0, 1))   // true — clean and expressive`,
    },

    // ── Challenge 2: connected via facade ────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-facade',
      text: 'Use GraphFacade with 6 nodes (0..5). Add edges: (0,1), (1,2), (3,4). Then: (1) check connected(1,3) — expected false, (2) add edge (2,3), check connected(1,3) — expected true, (3) check components() — expected 2 (group {0,1,2,3,4} and group {5}). Log all results labelled.',
      expectedOutput: null,
      startCode: `class UnionFind {
  constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.rank=new Array(n).fill(0)}
  find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}
  union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++}return true}
  connected(x,y){return this.find(x)===this.find(y)}
}

class GraphFacade {
  constructor(n){this._uf=new UnionFind(n);this._n=n;this._edges=[]}
  addEdge(u,v){this._edges.push([u,v]);this._uf.union(u,v)}
  connected(u,v){return this._uf.connected(u,v)}
  components(){let c=0;for(let i=0;i<this._n;i++)if(this._uf.find(i)===i)c++;return c}
  listComponents(){const g=new Map();for(let i=0;i<this._n;i++){const r=this._uf.find(i);if(!g.has(r))g.set(r,[]);g.get(r).push(i)}return[...g.values()]}
}

// YOUR CODE HERE:
// 1. Create GraphFacade with 6 nodes
// 2. addEdge(0,1), addEdge(1,2), addEdge(3,4)
// 3. Log connected(1,3) — expect false
// 4. addEdge(2,3)
// 5. Log connected(1,3) — expect true
// 6. Log components() — expect 2
`,
      hint: 'const g=new GraphFacade(6); g.addEdge(0,1);g.addEdge(1,2);g.addEdge(3,4); console.log("1-3 before:",g.connected(1,3)); g.addEdge(2,3); console.log("1-3 after:",g.connected(1,3)); console.log("components:",g.components());',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return (flat.includes('false') || flat.includes('False')) &&
               (flat.includes('true')  || flat.includes('True')) &&
               logs.some(l => String(l).trim() === '2' || String(l).includes('components: 2') || String(l).includes('2'))
      },
    },

    { type: 'checkpoint', id: 'cp-facade' },

    // ── Step 7: Kruskal's MST using facade ────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-kruskal',
      text: 'Kruskal\'s Minimum Spanning Tree algorithm is the canonical application of Union-Find. Given a weighted undirected graph, sort all edges by weight (ascending). Process edges in order: for each edge (u, v, weight), if u and v are not yet connected, add this edge to the MST and union their components. Stop when n-1 edges have been added (the MST is complete). Correctness: adding the cheapest edge that connects two different components never creates a cycle and always extends the minimum spanning tree. The Facade makes the algorithm readable: the critical check is simply facade.connected(u, v) — no parent/rank bookkeeping in the main loop.',
      code: `class UnionFind {
  constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.rank=new Array(n).fill(0)}
  find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}
  union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++}return true}
  connected(x,y){return this.find(x)===this.find(y)}
}

class GraphFacade {
  constructor(n){this._uf=new UnionFind(n);this._n=n}
  addEdge(u,v){this._uf.union(u,v)}
  connected(u,v){return this._uf.connected(u,v)}
  components(){let c=0;for(let i=0;i<this._n;i++)if(this._uf.find(i)===i)c++;return c}
}

function kruskalMST(n, edges) {
  // edges: array of [u, v, weight]
  const sorted = [...edges].sort((a, b) => a[2] - b[2])  // sort by weight ascending
  const facade = new GraphFacade(n)                        // Facade hides Union-Find
  const mst    = []
  let   cost   = 0

  for (const [u, v, w] of sorted) {
    if (!facade.connected(u, v)) {   // does adding this edge create a cycle?
      facade.addEdge(u, v)           // no cycle: include in MST
      mst.push([u, v, w])
      cost += w
      if (mst.length === n - 1) break  // MST complete: n-1 edges
    }
  }

  return { mst, cost }
}

// Graph: 4 nodes, 5 edges
const edges = [[0,1,1],[0,2,4],[1,2,2],[1,3,5],[2,3,1]]
const result = kruskalMST(4, edges)
console.log('MST edges:', result.mst)   // [[0,1,1],[2,3,1],[1,2,2]]  (cost 4)
console.log('MST cost:', result.cost)   // 4`,
    },

    // ── Challenge 3: Kruskal ──────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-kruskal',
      text: 'Run kruskalMST on 5 nodes with edges: [[0,1,2],[0,3,6],[1,2,3],[1,3,8],[1,4,5],[2,4,7],[3,4,9]]. Log the MST cost (expected: 16). Also log how many edges are in the MST (expected: 4, which is n-1 = 5-1).',
      expectedOutput: null,
      startCode: `class UnionFind {
  constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.rank=new Array(n).fill(0)}
  find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}
  union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++}return true}
  connected(x,y){return this.find(x)===this.find(y)}
}
class GraphFacade {
  constructor(n){this._uf=new UnionFind(n);this._n=n}
  addEdge(u,v){this._uf.union(u,v)}
  connected(u,v){return this._uf.connected(u,v)}
}
function kruskalMST(n, edges) {
  const sorted=[...edges].sort((a,b)=>a[2]-b[2])
  const facade=new GraphFacade(n)
  const mst=[];let cost=0
  for(const [u,v,w] of sorted){
    if(!facade.connected(u,v)){facade.addEdge(u,v);mst.push([u,v,w]);cost+=w;if(mst.length===n-1)break}
  }
  return {mst,cost}
}

const edges = [[0,1,2],[0,3,6],[1,2,3],[1,3,8],[1,4,5],[2,4,7],[3,4,9]]
// YOUR CODE HERE: run kruskalMST(5, edges) and log cost and edge count
`,
      hint: 'const r = kruskalMST(5, edges); console.log("cost:", r.cost); console.log("edges:", r.mst.length);',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(16) && nums.includes(4)
      },
    },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the UnionFind.find method with path compression. Watch the recursive call set parent[x] directly to the root on the way back up. Observe that the second call to find(0) in the same tree is O(1) because the parent was already flattened. Then step through union and watch the rank comparison decide which root becomes the new parent.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'cl-uf',
      text: 'Step through find with path compression. See parent[x] get updated to the root on each recursive return. Then trace union: observe the rank comparison. Finally watch GraphFacade.addEdge delegate to union, and connected delegate to find — the Facade is a thin, transparent wrapper over the complex internals.',
      code: `class UnionFind {
  constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.rank=new Array(n).fill(0)}
  find(x){if(this.parent[x]!==x)this.parent[x]=this.find(this.parent[x]);return this.parent[x]}
  union(x,y){const rx=this.find(x),ry=this.find(y);if(rx===ry)return false;if(this.rank[rx]<this.rank[ry])this.parent[rx]=ry;else if(this.rank[rx]>this.rank[ry])this.parent[ry]=rx;else{this.parent[ry]=rx;this.rank[rx]++}return true}
  connected(x,y){return this.find(x)===this.find(y)}
}
const uf=new UnionFind(5)
uf.union(0,1)
uf.union(1,2)
uf.union(2,3)
console.log(uf.connected(0,3))
console.log(uf.parent.slice())
console.log(uf.connected(0,4))`,
      lang: 'js',
    },

  ],
}
