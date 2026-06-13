// DSA + Design Patterns — Lesson 24
// Bellman-Ford & Negative Weights

export const lesson = {
  id: 'dsa-patterns-24',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '24. Bellman-Ford & Negative Weights',
  checkpoints: [
    { id: 'cp-bellman',   label: 'Bellman-Ford' },
    { id: 'cp-floyd',     label: 'Floyd-Warshall' },
    { id: 'cp-negcycle',  label: 'Negative Cycles' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Currency exchange arbitrage: converting dollars to euros to yen and back can yield more dollars than you started with if exchange rates create a negative-cost cycle. Flight booking: some fares are negative adjustments (credits, subsidies). Financial networks: debt can be modelled as negative weight. Dijkstra\'s algorithm breaks on negative edge weights because it assumes that once a node is finalized, no cheaper path exists — a negative edge can always make a later path cheaper. Two algorithms handle negative weights. One can also detect when a negative-cost cycle makes "shortest path" meaningless.',
      code: null,
    },

    // ── Step 1: Why Dijkstra fails on negative weights ────────────────────────

    {
      type: 'narration',
      id: 'step1-dijkstra-fails',
      text: 'Dijkstra fails on negative edges because its greedy assumption breaks: "the cheapest current path to a node is the final answer". With a negative edge, a longer path (more hops) might be cheaper overall. Example: A→B costs 4, A→C costs 2, C→B costs -5. Dijkstra finalizes B with cost 4 (via A→B). But the actual shortest path is A→C→B = 2+(-5) = -3. Dijkstra already moved past B and will never reconsider it. You need an algorithm that does not finalize nodes greedily.',
      code: `// Demonstration: Dijkstra gives wrong answer on negative edges
function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

function dijkstra(graph, source) {
  const dist={}, visited=new Set()
  for(const n of Object.keys(graph)) dist[n]=Infinity
  dist[source]=0
  const pq=createPQ(); pq.enqueue(source,0)
  while(!pq.isEmpty()){
    const{node,cost}=pq.dequeue()
    if(visited.has(node))continue
    visited.add(node)
    for(const{node:nb,weight}of(graph[node]||[])){
      if(visited.has(nb))continue
      const c=cost+weight
      if(c<dist[nb]){dist[nb]=c;pq.enqueue(nb,c)}
    }
  }
  return dist
}

// A→B = 4, A→C = 2, C→B = -5
// Correct shortest to B = A→C→B = 2 + (-5) = -3
const graph = {
  A: [{node:'B',weight:4},{node:'C',weight:2}],
  B: [],
  C: [{node:'B',weight:-5}],
}

const d = dijkstra(graph,'A')
console.log('Dijkstra dist to B:', d.B)   // 4  — WRONG, should be -3
console.log('Dijkstra dist to C:', d.C)   // 2  — correct`,
    },

    // ── Step 2: Bellman-Ford — edge relaxation ────────────────────────────────

    {
      type: 'narration',
      id: 'step2-bellman-ford',
      text: 'Bellman-Ford takes a different approach: instead of greedily expanding the cheapest node, it relaxes ALL edges, V-1 times. Relaxing an edge (u, v, weight) means: if dist[u] + weight < dist[v], update dist[v]. One full pass relaxes all edges once. After k passes, the shortest paths using at most k edges are correct. A shortest path in a graph with V vertices uses at most V-1 edges (a simple path visits each vertex at most once). So after V-1 passes, all shortest paths are correct. Time complexity: O(V × E) — slower than Dijkstra but handles negative weights.',
      code: `function bellmanFord(edges, vertices, source) {
  const dist = {}                      // ← NEW  node → shortest distance
  for (const v of vertices) dist[v] = Infinity  // ← NEW  init all to Infinity
  dist[source] = 0                     // ← NEW  source costs 0

  // Relax all edges V-1 times
  for (let pass = 0; pass < vertices.length - 1; pass++) {   // ← NEW
    let updated = false                // ← NEW  optimisation: stop early if nothing changed
    for (const { u, v, weight } of edges) {   // ← NEW  every edge, every pass
      if (dist[u] === Infinity) continue      // ← NEW  u not reachable yet
      const candidate = dist[u] + weight      // ← NEW
      if (candidate < dist[v]) {              // ← NEW  found a cheaper path
        dist[v] = candidate                   // ← NEW
        updated = true                        // ← NEW
      }
    }
    if (!updated) break   // ← NEW  no changes — converged early
  }

  return dist   // ← NEW
}

// Same graph that broke Dijkstra
const edges = [
  { u:'A', v:'B', weight:4  },
  { u:'A', v:'C', weight:2  },
  { u:'C', v:'B', weight:-5 },
]
const vertices = ['A','B','C']

const dist = bellmanFord(edges, vertices, 'A')
console.log('Bellman-Ford dist to B:', dist.B)   // -3 — CORRECT
console.log('Bellman-Ford dist to C:', dist.C)   // 2`,
    },

    // ── Step 3: Negative cycle detection ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-neg-cycle',
      text: 'A negative cycle is a cycle in the graph whose total edge weight is negative. If a negative cycle is reachable from the source, the shortest path to nodes within or after it is -Infinity — you can always loop through the cycle to make the path cheaper. Bellman-Ford detects this elegantly: after V-1 passes, do ONE more pass. If any dist[v] can still be reduced in this V-th pass, a negative cycle exists — the V-1 passes were not enough to converge, which only happens with a negative cycle.',
      code: `function bellmanFord(edges,vertices,source){const dist={};for(const v of vertices)dist[v]=Infinity;dist[source]=0;for(let p=0;p<vertices.length-1;p++){let u=false;for(const{u:from,v:to,weight}of edges){if(dist[from]===Infinity)continue;const c=dist[from]+weight;if(c<dist[to]){dist[to]=c;u=true}}if(!u)break}return dist}

function bellmanFordWithCycleDetect(edges, vertices, source) {
  const dist = {}
  for (const v of vertices) dist[v] = Infinity
  dist[source] = 0

  // V-1 normal passes
  for (let pass = 0; pass < vertices.length - 1; pass++) {
    for (const { u, v, weight } of edges) {
      if (dist[u] === Infinity) continue
      const c = dist[u] + weight
      if (c < dist[v]) dist[v] = c
    }
  }

  // V-th pass: detect negative cycle
  const inCycle = new Set()                              // ← NEW
  for (const { u, v, weight } of edges) {               // ← NEW
    if (dist[u] === Infinity) continue                   // ← NEW
    if (dist[u] + weight < dist[v]) {                   // ← NEW  still improving
      inCycle.add(v)                                     // ← NEW  v is in or after cycle
      inCycle.add(u)                                     // ← NEW
    }
  }

  return {
    dist,
    hasNegativeCycle: inCycle.size > 0,   // ← NEW
    cycleNodes: [...inCycle],             // ← NEW
  }
}

// Graph with negative cycle: A→B→C→A with total weight = 1 + (-3) + 1 = -1
const edges = [
  {u:'A',v:'B',weight:1},
  {u:'B',v:'C',weight:-3},
  {u:'C',v:'A',weight:1},
  {u:'A',v:'D',weight:5},
]
const result = bellmanFordWithCycleDetect(edges, ['A','B','C','D'], 'A')
console.log('has negative cycle:', result.hasNegativeCycle)  // true
console.log('nodes in cycle:', result.cycleNodes)`,
    },

    // ── Challenge 1: Bellman-Ford with negative edge (no cycle) ───────────────

    {
      type: 'challenge',
      id: 'ch-bellman',
      text: 'Implement bellmanFord(edges, vertices, source) and run it on the currency exchange graph below. Edges represent exchange rates as costs (negative = gain). Find shortest path from "USD" to all other currencies. Log the dist object. Then verify: dist.GBP should be less than 0 (a gain), dist.EUR should be a small positive. Note: no negative cycle exists in this graph.',
      expectedOutput: null,
      startCode: `function bellmanFord(edges, vertices, source) {
  const dist = {}
  for (const v of vertices) dist[v] = Infinity
  dist[source] = 0

  for (let pass = 0; pass < vertices.length - 1; pass++) {
    // YOUR CODE HERE: for each edge {u, v, weight}, relax it
  }

  return dist
}

// Exchange rates as edge weights (negative = profitable conversion)
const edges = [
  { u: 'USD', v: 'EUR', weight: -0.1 },
  { u: 'USD', v: 'JPY', weight: 0.5  },
  { u: 'EUR', v: 'GBP', weight: -0.2 },
  { u: 'JPY', v: 'GBP', weight: 1.2  },
  { u: 'GBP', v: 'AUD', weight: 0.3  },
]
const vertices = ['USD', 'EUR', 'JPY', 'GBP', 'AUD']

const dist = bellmanFord(edges, vertices, 'USD')
console.log('dist from USD:', dist)
console.log('USD to GBP:', dist.GBP)
console.log('USD to AUD:', dist.AUD)`,
      hint: 'Inside the pass loop: for (const {u, v, weight} of edges) { if (dist[u] === Infinity) continue; const c = dist[u] + weight; if (c < dist[v]) dist[v] = c; }',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('GBP') && flat.includes('AUD') && flat.includes('USD')
      },
    },

    { type: 'checkpoint', id: 'cp-bellman' },

    // ── Step 4: Floyd-Warshall — all-pairs shortest path ─────────────────────

    {
      type: 'narration',
      id: 'step4-floyd-warshall',
      text: 'Floyd-Warshall finds the shortest path between EVERY pair of vertices at once — the "all-pairs shortest path" problem. It uses dynamic programming (building answers from smaller sub-problems). The key insight: dist[i][j] after considering "via vertex k" is the minimum of dist[i][j] (direct) and dist[i][k] + dist[k][j] (go through k). Iterate over all possible "intermediate" vertices k. Run three nested loops: for each k (0 to V), for each i, for each j, update dist[i][j]. Time: O(V³). Space: O(V²) for the distance matrix.',
      code: `function floydWarshall(vertices, edges) {
  const n    = vertices.length
  const idx  = new Map(vertices.map((v, i) => [v, i]))   // ← NEW  label → index

  // Initialize distance matrix: Infinity everywhere, 0 on diagonal
  const dist = Array.from({ length: n }, (_, i) =>       // ← NEW
    Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity)  // ← NEW
  )

  // Fill in direct edges
  for (const { u, v, weight } of edges) {                // ← NEW
    dist[idx.get(u)][idx.get(v)] = weight                // ← NEW
  }

  // Floyd-Warshall: try every intermediate vertex k
  for (let k = 0; k < n; k++) {                         // ← NEW  via k
    for (let i = 0; i < n; i++) {                       // ← NEW  from i
      for (let j = 0; j < n; j++) {                     // ← NEW  to j
        const throughK = dist[i][k] + dist[k][j]        // ← NEW
        if (throughK < dist[i][j]) {                    // ← NEW
          dist[i][j] = throughK                         // ← NEW
        }
      }
    }
  }

  // Return readable result: vertex pair → distance
  const result = {}                                      // ← NEW
  for (const u of vertices) {                           // ← NEW
    result[u] = {}
    for (const v of vertices) result[u][v] = dist[idx.get(u)][idx.get(v)]
  }
  return result
}

const vertices = ['A','B','C','D']
const edges = [{u:'A',v:'B',weight:3},{u:'A',v:'C',weight:8},{u:'B',v:'C',weight:2},{u:'C',v:'D',weight:1},{u:'D',v:'B',weight:-4}]

const all = floydWarshall(vertices, edges)
console.log('A→D:', all.A.D)   // 6  (A→B→C→D = 3+2+1)
console.log('D→B:', all.D.B)   // -4
console.log('A→B:', all.A.B)   // 3`,
    },

    // ── Step 5: Floyd-Warshall negative cycle detection ───────────────────────

    {
      type: 'narration',
      id: 'step5-floyd-neg-cycle',
      text: 'Floyd-Warshall also detects negative cycles. After the algorithm completes, check the diagonal of the distance matrix: dist[i][i]. This represents the shortest path from vertex i back to itself. In a graph with no negative cycles, dist[i][i] should be 0 (no cheaper round trip than staying put). If dist[i][i] < 0, vertex i is part of a negative cycle. This check is O(V) — just scan the diagonal.',
      code: `function floydWarshall(vertices,edges){const n=vertices.length,idx=new Map(vertices.map((v,i)=>[v,i]));const dist=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:Infinity));for(const{u,v,weight}of edges)dist[idx.get(u)][idx.get(v)]=weight;for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++){const t=dist[i][k]+dist[k][j];if(t<dist[i][j])dist[i][j]=t}return{dist,idx}}

function detectNegCycles(vertices, edges) {
  const { dist, idx } = floydWarshall(vertices, edges)
  const n = vertices.length

  const negCycleNodes = []                        // ← NEW

  // Check diagonal — dist[i][i] < 0 means vertex i is in a negative cycle
  for (let i = 0; i < n; i++) {                   // ← NEW
    if (dist[i][i] < 0) {                         // ← NEW
      negCycleNodes.push(vertices[i])             // ← NEW
    }
  }

  // Any vertex that can reach a neg-cycle node (or be reached from one) is affected
  const affected = new Set(negCycleNodes)         // ← NEW
  for (const cycleNode of negCycleNodes) {        // ← NEW
    const ci = idx.get(cycleNode)                 // ← NEW
    for (let i = 0; i < n; i++) {                // ← NEW
      if (dist[i][ci] < Infinity) affected.add(vertices[i])  // ← NEW  can reach cycle
      if (dist[ci][i] < Infinity) affected.add(vertices[i])  // ← NEW  reachable from cycle
    }
  }

  return { hasNegCycle: negCycleNodes.length > 0, negCycleNodes, affected: [...affected] }
}

// A→B, B→C, C→A (cycle weight = 1 -3 +1 = -1)
const v = ['A','B','C','D']
const e = [{u:'A',v:'B',weight:1},{u:'B',v:'C',weight:-3},{u:'C',v:'A',weight:1},{u:'A',v:'D',weight:5}]
const r = detectNegCycles(v, e)
console.log('has neg cycle:', r.hasNegCycle)    // true
console.log('cycle nodes:',  r.negCycleNodes)  // A B C
console.log('affected:',     r.affected)       // A B C D (D reachable from A)`,
    },

    // ── Challenge 2: Bellman-Ford negative cycle detection ────────────────────

    {
      type: 'challenge',
      id: 'ch-negcycle',
      text: 'Implement bellmanFordFull(edges, vertices, source) that returns {dist, hasNegativeCycle, cycleNodes}. Test on two graphs: (1) A valid graph with a negative edge but no cycle: [{u:"A",v:"B",weight:-2},{u:"A",v:"C",weight:3},{u:"B",v:"C",weight:1}] — should return hasNegativeCycle: false. (2) A graph with a negative cycle: [{u:"A",v:"B",weight:1},{u:"B",v:"C",weight:-3},{u:"C",v:"A",weight:1}] — should return hasNegativeCycle: true. Log both results.',
      expectedOutput: null,
      startCode: `function bellmanFordFull(edges, vertices, source) {
  const dist = {}
  for (const v of vertices) dist[v] = Infinity
  dist[source] = 0

  // V-1 relaxation passes
  for (let pass = 0; pass < vertices.length - 1; pass++) {
    for (const { u, v, weight } of edges) {
      if (dist[u] === Infinity) continue
      if (dist[u] + weight < dist[v]) dist[v] = dist[u] + weight
    }
  }

  // V-th pass: detect negative cycle
  const cycleNodes = new Set()
  for (const { u, v, weight } of edges) {
    // YOUR CODE HERE: if still improvable, add u and v to cycleNodes
  }

  return { dist, hasNegativeCycle: cycleNodes.size > 0, cycleNodes: [...cycleNodes] }
}

const g1edges = [{u:'A',v:'B',weight:-2},{u:'A',v:'C',weight:3},{u:'B',v:'C',weight:1}]
const r1 = bellmanFordFull(g1edges, ['A','B','C'], 'A')
console.log('no cycle graph - has cycle:', r1.hasNegativeCycle)
console.log('dist B:', r1.dist.B, 'dist C:', r1.dist.C)

const g2edges = [{u:'A',v:'B',weight:1},{u:'B',v:'C',weight:-3},{u:'C',v:'A',weight:1}]
const r2 = bellmanFordFull(g2edges, ['A','B','C'], 'A')
console.log('cycle graph - has cycle:', r2.hasNegativeCycle)
console.log('cycle nodes:', r2.cycleNodes)`,
      hint: 'In the V-th pass: if (dist[u] !== Infinity && dist[u] + weight < dist[v]) { cycleNodes.add(u); cycleNodes.add(v); }',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('true') && flat.includes('false')
      },
    },

    { type: 'checkpoint', id: 'cp-bellman' },

    // ── Step 6: Floyd-Warshall on a real use case ─────────────────────────────

    {
      type: 'narration',
      id: 'step6-floyd-use-case',
      text: 'Floyd-Warshall is ideal when you need shortest paths between all pairs of nodes — not just from one source. Use cases: finding the diameter of a network (the longest shortest-path), determining which server can reach every other server, finding all-pairs distances in a city map. With V = 500 vertices, Floyd-Warshall runs 125 million iterations — fast enough for moderate-sized graphs. For V = 5000, Dijkstra from each source is better: O(V × (V + E) log V).',
      code: `function floydWarshall(vertices, edges) {
  const n   = vertices.length
  const idx = new Map(vertices.map((v, i) => [v, i]))
  const dist = Array.from({length:n},(_,i) => Array.from({length:n},(_,j) => i===j ? 0 : Infinity))
  for(const{u,v,weight}of edges) dist[idx.get(u)][idx.get(v)]=weight
  for(let k=0;k<n;k++) for(let i=0;i<n;i++) for(let j=0;j<n;j++) { const t=dist[i][k]+dist[k][j]; if(t<dist[i][j]) dist[i][j]=t }
  const result={}; for(const u of vertices){result[u]={};for(const v of vertices)result[u][v]=dist[idx.get(u)][idx.get(v)]}
  return result
}

// Server network — find which server has the smallest max distance to any other
const servers = ['web1','web2','db1','db2','cache']
const links = [
  {u:'web1',v:'db1',weight:5},{u:'web1',v:'cache',weight:1},
  {u:'web2',v:'db1',weight:3},{u:'web2',v:'cache',weight:1},
  {u:'db1', v:'db2',weight:2},{u:'cache',v:'db1',weight:2},
  {u:'db2', v:'web1',weight:6},{u:'db2',v:'web2',weight:4},
]

const all = floydWarshall(servers, links)

// Network diameter: longest shortest path
let diameter = 0
for(const u of servers) for(const v of servers) if(all[u][v]<Infinity && u!==v) diameter=Math.max(diameter,all[u][v])

// Eccentricity: the max distance from a server to any reachable server
const eccentricity = {}
for(const u of servers){
  let max=0; for(const v of servers) if(all[u][v]<Infinity && u!==v) max=Math.max(max,all[u][v])
  eccentricity[u]=max
}

console.log('network diameter:', diameter)
console.log('eccentricity:', eccentricity)`,
    },

    // ── Challenge 3: Floyd-Warshall all-pairs ────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-floyd',
      text: 'Implement floydWarshall(vertices, edges) and run it on a 5-city road network (directed, no negative cycles). After computing all-pairs distances, find: (1) the diameter (longest shortest path between any two cities), (2) the city with the lowest eccentricity (most central city — smallest max distance to any reachable city). Log both.',
      expectedOutput: null,
      startCode: `function floydWarshall(vertices, edges) {
  const n   = vertices.length
  const idx = new Map(vertices.map((v, i) => [v, i]))

  // Initialize: 0 on diagonal, Infinity elsewhere, then fill edge weights
  const dist = Array.from({length:n}, (_, i) =>
    Array.from({length:n}, (_, j) => i === j ? 0 : Infinity)
  )

  for (const { u, v, weight } of edges) {
    dist[idx.get(u)][idx.get(v)] = weight
  }

  // YOUR CODE HERE: three nested loops to relax via each intermediate k
  for (let k = 0; k < n; k++) {
    // relax all i,j via k
  }

  // Return as nested object: result[u][v] = distance
  const result = {}
  for (const u of vertices) {
    result[u] = {}
    for (const v of vertices) result[u][v] = dist[idx.get(u)][idx.get(v)]
  }
  return result
}

const cities = ['A','B','C','D','E']
const roads = [
  {u:'A',v:'B',weight:4},{u:'A',v:'C',weight:1},
  {u:'B',v:'D',weight:3},{u:'C',v:'B',weight:2},
  {u:'C',v:'D',weight:8},{u:'D',v:'E',weight:2},
  {u:'B',v:'E',weight:7},{u:'E',v:'A',weight:3},
]

const all = floydWarshall(cities, roads)

let diameter = 0
for (const u of cities) for (const v of cities) if (all[u][v] < Infinity && u!==v) diameter = Math.max(diameter, all[u][v])
console.log('diameter:', diameter)

let mostCentral = '', minEcc = Infinity
for (const u of cities) {
  let ecc = 0
  for (const v of cities) if (all[u][v] < Infinity && u!==v) ecc = Math.max(ecc, all[u][v])
  if (ecc < minEcc) { minEcc = ecc; mostCentral = u }
}
console.log('most central city:', mostCentral, 'with eccentricity:', minEcc)`,
      hint: 'The three nested loops: for each k, for each i, for each j: if dist[i][k] + dist[k][j] < dist[i][j], set dist[i][j] = dist[i][k] + dist[k][j].',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('diameter') && flat.includes('central')
      },
    },

    { type: 'checkpoint', id: 'cp-floyd' },

    // ── Combined: Negative cycle report ──────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'A complete graph analysis tool: given a weighted directed graph, determine whether Dijkstra, Bellman-Ford, or Floyd-Warshall is appropriate, run the correct algorithm, and report any issues found. There is no forced design pattern here — not every algorithm needs one, and the honest answer is that Bellman-Ford and Floyd-Warshall are self-contained enough that adding a pattern would add ceremony without clarity. Good engineering is knowing when to apply a pattern and when to keep it simple.',
      code: `function analyzeGraph(vertices, edges) {
  // Check for negative edges
  const hasNegEdge = edges.some(e => e.weight < 0)

  if (!hasNegEdge) {
    console.log('No negative edges. Dijkstra is appropriate.')
    return
  }

  console.log('Negative edges found. Using Bellman-Ford to check for cycles...')

  // Bellman-Ford from first vertex
  const source = vertices[0]
  const dist   = {}
  for(const v of vertices) dist[v] = Infinity
  dist[source] = 0
  for(let p=0;p<vertices.length-1;p++){for(const{u,v,weight}of edges){if(dist[u]===Infinity)continue;const c=dist[u]+weight;if(c<dist[v])dist[v]=c}}

  // V-th pass cycle check
  const cycleNodes = new Set()
  for(const{u,v,weight}of edges){if(dist[u]!==Infinity&&dist[u]+weight<dist[v]){cycleNodes.add(u);cycleNodes.add(v)}}

  if (cycleNodes.size > 0) {
    console.log('NEGATIVE CYCLE DETECTED in nodes:', [...cycleNodes])
    console.log('Shortest path is undefined for nodes reachable from the cycle.')
    return
  }

  console.log('No negative cycle. Bellman-Ford distances:', dist)
}

// Valid graph with negative edge
analyzeGraph(['A','B','C'], [{u:'A',v:'B',weight:-2},{u:'A',v:'C',weight:3},{u:'B',v:'C',weight:1}])

console.log('---')

// Graph with negative cycle
analyzeGraph(['A','B','C'], [{u:'A',v:'B',weight:1},{u:'B',v:'C',weight:-3},{u:'C',v:'A',weight:1}])`,
    },

    // ── Challenge 4: Combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Build an analyzeAndReport(vertices, edges) function that: (1) checks if any edge has weight < 0, (2) if no negative edges: logs "Safe for Dijkstra", (3) if negative edges but no negative cycle: logs "Use Bellman-Ford" and logs the dist from the first vertex, (4) if negative cycle detected: logs "Negative cycle found: [nodes]". Test on two graphs — one safe, one with a negative cycle. Log appropriate messages for each.',
      expectedOutput: null,
      startCode: `function analyzeAndReport(vertices, edges) {
  const hasNeg = edges.some(e => e.weight < 0)

  if (!hasNeg) {
    console.log('Safe for Dijkstra')
    return
  }

  // Run Bellman-Ford
  const source = vertices[0]
  const dist = {}
  for (const v of vertices) dist[v] = Infinity
  dist[source] = 0
  for (let p = 0; p < vertices.length - 1; p++) {
    for (const { u, v, weight } of edges) {
      if (dist[u] === Infinity) continue
      if (dist[u] + weight < dist[v]) dist[v] = dist[u] + weight
    }
  }

  // Check for negative cycle
  const cycleNodes = new Set()
  for (const { u, v, weight } of edges) {
    // YOUR CODE HERE: detect negative cycle
  }

  if (cycleNodes.size > 0) {
    console.log('Negative cycle found:', [...cycleNodes])
  } else {
    console.log('Use Bellman-Ford. Distances from', source + ':', dist)
  }
}

analyzeAndReport(['A','B','C'],[{u:'A',v:'B',weight:-1},{u:'B',v:'C',weight:2}])
analyzeAndReport(['X','Y','Z'],[{u:'X',v:'Y',weight:1},{u:'Y',v:'Z',weight:-3},{u:'Z',v:'X',weight:1}])`,
      hint: 'cycleNodes check: if (dist[u] !== Infinity && dist[u] + weight < dist[v]) { cycleNodes.add(u); cycleNodes.add(v); }',
      validate: ({ logs }) => {
        const flat = logs.join(' ').toLowerCase()
        return flat.includes('bellman') && flat.includes('negative cycle')
      },
    },

    { type: 'checkpoint', id: 'cp-negcycle' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through Bellman-Ford. Watch the dist object after each pass — see values decrease each time a cheaper path is found. Count the passes: V-1 normal passes, then one final check pass. On the negative-cycle example, watch the V-th pass still find improvements — that is the cycle signal. Step into Floyd-Warshall and watch the dist matrix update as intermediate vertices k are considered.',
      code: `function bellmanFord(edges, vertices, source) {
  const dist = {}
  for (const v of vertices) dist[v] = Infinity
  dist[source] = 0

  for (let pass = 0; pass < vertices.length - 1; pass++) {
    for (const { u, v, weight } of edges) {
      if (dist[u] === Infinity) continue
      const c = dist[u] + weight
      if (c < dist[v]) dist[v] = c
    }
  }

  const cycleNodes = new Set()
  for (const { u, v, weight } of edges) {
    if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
      cycleNodes.add(u); cycleNodes.add(v)
    }
  }

  return { dist, hasNegCycle: cycleNodes.size > 0, cycleNodes: [...cycleNodes] }
}

const edges = [{u:'A',v:'B',weight:4},{u:'A',v:'C',weight:2},{u:'C',v:'B',weight:-5}]
const r = bellmanFord(edges, ['A','B','C'], 'A')
console.log('dist:', r.dist)
console.log('neg cycle:', r.hasNegCycle)`,
    },

    {
      type: 'codelens',
      id: 'cl-bellman',
      text: 'Step through in CodeLens. Watch the dist object update pass by pass. See how dist.B starts at Infinity, gets set to 4 after pass 1 via A→B, then gets updated to -3 after pass 2 via A→C→B. This is why Dijkstra fails — it would have locked in 4 too early. The V-th pass check then confirms no further improvements possible.',
      code: `function bf(edges,vertices,source){const dist={};for(const v of vertices)dist[v]=Infinity;dist[source]=0;for(let p=0;p<vertices.length-1;p++)for(const{u,v,weight}of edges){if(dist[u]===Infinity)continue;const c=dist[u]+weight;if(c<dist[v])dist[v]=c}const cn=new Set();for(const{u,v,weight}of edges)if(dist[u]!==Infinity&&dist[u]+weight<dist[v]){cn.add(u);cn.add(v)}return{dist,hasNegCycle:cn.size>0}}
const e=[{u:'A',v:'B',weight:4},{u:'A',v:'C',weight:2},{u:'C',v:'B',weight:-5}]
const r=bf(e,['A','B','C'],'A')
console.log(r.dist)
console.log('neg cycle:',r.hasNegCycle)`,
      lang: 'js',
    },

  ],
}
