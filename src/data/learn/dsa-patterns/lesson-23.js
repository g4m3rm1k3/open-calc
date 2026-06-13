// DSA + Design Patterns — Lesson 23
// Dijkstra's Algorithm + Strategy Pattern

export const lesson = {
  id: 'dsa-patterns-23',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: "23. Dijkstra's Algorithm + Strategy",
  checkpoints: [
    { id: 'cp-dijkstra', label: "Dijkstra's Algorithm" },
    { id: 'cp-strategy', label: 'Strategy Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You are building a route planner. Roads have distances. You want the cheapest (shortest) path between two cities — not just any path. BFS finds the path with fewest edges, but edges have different weights here. You also want to support different cost metrics: sometimes you want the fastest route, sometimes cheapest fuel, sometimes fewest toll roads. Two ideas solve this: a greedy algorithm that always expands the currently-cheapest known path first, and a design pattern that makes the "cost function" a pluggable strategy so you can swap it without rewriting the algorithm.',
      code: null,
    },

    // ── Step 1: Weighted graph and priority queue setup ───────────────────────

    {
      type: 'narration',
      id: 'step1-setup',
      text: 'Dijkstra\'s algorithm (named after Edsger Dijkstra, 1959) finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights. It uses a min-priority queue (covered in lesson 17 — a queue that always dequeues the item with the lowest priority value). The dist array stores the best-known distance to each node, initialised to Infinity (meaning "not yet reached") and 0 for the source. Infinity in JavaScript is Number.POSITIVE_INFINITY — a value greater than any number.',
      code: `// Simple min-priority queue using a sorted array
// (a real heap is faster — O(log n) vs O(n) insert — but this is clearer)
function createPQ() {
  const items = []    // [{node, cost}] sorted by cost ascending
  return {
    enqueue(node, cost) {
      items.push({ node, cost })
      items.sort((a, b) => a.cost - b.cost)  // keep sorted
    },
    dequeue() { return items.shift() },       // smallest cost first
    isEmpty()  { return items.length === 0 },
  }
}

// Weighted graph as adjacency list: node → [{node, weight}]
const graph = {
  A: [{ node: 'B', weight: 4 }, { node: 'C', weight: 2 }],
  B: [{ node: 'C', weight: 1 }, { node: 'D', weight: 5 }],
  C: [{ node: 'B', weight: 1 }, { node: 'D', weight: 8 }, { node: 'E', weight: 10 }],
  D: [{ node: 'E', weight: 2 }],
  E: [],
}

const pq = createPQ()
pq.enqueue('A', 0)
pq.enqueue('B', 4)
pq.enqueue('C', 2)

console.log(pq.dequeue())  // { node: 'A', cost: 0 } — smallest first
console.log(pq.dequeue())  // { node: 'C', cost: 2 }`,
    },

    // ── Step 2: Dijkstra core ─────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-dijkstra',
      text: 'Dijkstra\'s algorithm: (1) Start with dist[source] = 0, all others = Infinity. Enqueue source with cost 0. (2) While the priority queue is not empty: dequeue the node with the lowest cost. If we have already finalized this node (visited it with a smaller cost), skip it. (3) For each unvisited neighbour: compute candidate = dist[current] + edge weight. If candidate < dist[neighbour], update dist[neighbour] and enqueue the neighbour with the candidate cost. (4) Repeat. When the queue empties, dist contains the shortest distance from source to every reachable node. Time complexity with this simple PQ: O((V + E) log V) — log V for each enqueue.',
      code: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

function dijkstra(graph, source) {
  const dist    = {}              // ← NEW  best known cost to each node
  const visited = new Set()       // ← NEW  finalized nodes

  // Initialize all distances to Infinity
  for (const node of Object.keys(graph)) dist[node] = Infinity   // ← NEW
  dist[source] = 0                // ← NEW  source costs 0

  const pq = createPQ()           // ← NEW
  pq.enqueue(source, 0)           // ← NEW

  while (!pq.isEmpty()) {         // ← NEW
    const { node, cost } = pq.dequeue()  // ← NEW  cheapest known path so far

    if (visited.has(node)) continue  // ← NEW  already finalized — skip
    visited.add(node)                // ← NEW  finalize this node

    for (const { node: nb, weight } of (graph[node] || [])) {  // ← NEW
      if (visited.has(nb)) continue                             // ← NEW
      const candidate = cost + weight                           // ← NEW
      if (candidate < dist[nb]) {                               // ← NEW  found cheaper path
        dist[nb] = candidate                                    // ← NEW
        pq.enqueue(nb, candidate)                               // ← NEW
      }
    }
  }

  return dist   // ← NEW
}

const graph = {
  A:[{node:'B',weight:4},{node:'C',weight:2}],
  B:[{node:'C',weight:1},{node:'D',weight:5}],
  C:[{node:'B',weight:1},{node:'D',weight:8},{node:'E',weight:10}],
  D:[{node:'E',weight:2}],
  E:[],
}

const dist = dijkstra(graph, 'A')
console.log('A→B:', dist.B)   // 3  (A→C→B = 2+1)
console.log('A→D:', dist.D)   // 8  (A→C→B→D = 2+1+5)
console.log('A→E:', dist.E)   // 10 (A→C→B→D→E = 2+1+5+2)`,
    },

    // ── Step 3: Path reconstruction ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-path',
      text: 'Like BFS, Dijkstra\'s can reconstruct the actual path by maintaining a prev Map. When you find a cheaper path to a neighbour, record: prev[neighbour] = currentNode. After the algorithm completes, follow prev pointers from the target back to the source. This adds no extra asymptotic cost — still O((V + E) log V). The prev Map is the key to making Dijkstra\'s useful in a real route planner.',
      code: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

function dijkstraPath(graph, source, target) {
  const dist    = {}
  const prev    = {}              // ← NEW  node → which node we came from
  const visited = new Set()

  for (const n of Object.keys(graph)) { dist[n] = Infinity; prev[n] = null }
  dist[source] = 0

  const pq = createPQ()
  pq.enqueue(source, 0)

  while (!pq.isEmpty()) {
    const { node, cost } = pq.dequeue()
    if (visited.has(node)) continue
    visited.add(node)

    for (const { node: nb, weight } of (graph[node] || [])) {
      if (visited.has(nb)) continue
      const candidate = cost + weight
      if (candidate < dist[nb]) {
        dist[nb]  = candidate
        prev[nb]  = node      // ← NEW  record predecessor
        pq.enqueue(nb, candidate)
      }
    }
  }

  // Reconstruct path                ← NEW
  if (dist[target] === Infinity) return null   // ← NEW  unreachable
  const path = []                              // ← NEW
  let cur = target                             // ← NEW
  while (cur !== null) {                       // ← NEW
    path.unshift(cur)                          // ← NEW
    cur = prev[cur]                            // ← NEW
  }
  return { path, cost: dist[target] }          // ← NEW
}

const graph={A:[{node:'B',weight:4},{node:'C',weight:2}],B:[{node:'C',weight:1},{node:'D',weight:5}],C:[{node:'B',weight:1},{node:'D',weight:8},{node:'E',weight:10}],D:[{node:'E',weight:2}],E:[]}

const r = dijkstraPath(graph, 'A', 'E')
console.log('path:', r.path)    // ['A','C','B','D','E']
console.log('cost:', r.cost)    // 10`,
    },

    // ── Challenge 1: Path reconstruction ─────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-dijkstra',
      text: 'Implement dijkstraPath(graph, source, target) that returns {path, cost}. Use the road network below. Find paths from "London" to "Edinburgh" and from "London" to "Cardiff". Log both path arrays and costs. The road network has directed weighted edges representing driving times in minutes.',
      expectedOutput: null,
      startCode: `function createPQ() {
  const items = []
  return {
    enqueue(node, cost) { items.push({node,cost}); items.sort((a,b)=>a.cost-b.cost) },
    dequeue() { return items.shift() },
    isEmpty() { return items.length === 0 },
  }
}

function dijkstraPath(graph, source, target) {
  const dist = {}, prev = {}, visited = new Set()
  for (const n of Object.keys(graph)) { dist[n] = Infinity; prev[n] = null }
  dist[source] = 0
  const pq = createPQ()
  pq.enqueue(source, 0)

  while (!pq.isEmpty()) {
    const { node, cost } = pq.dequeue()
    if (visited.has(node)) continue
    visited.add(node)
    // YOUR CODE HERE: relax neighbours
  }

  // YOUR CODE HERE: reconstruct and return {path, cost}
}

const roads = {
  London:       [{node:'Birmingham',weight:120},{node:'Bristol',weight:115}],
  Birmingham:   [{node:'Manchester',weight:90},{node:'Cardiff',weight:110}],
  Bristol:      [{node:'Cardiff',weight:45},{node:'Birmingham',weight:90}],
  Manchester:   [{node:'Edinburgh',weight:220}],
  Cardiff:      [],
  Edinburgh:    [],
}

const r1 = dijkstraPath(roads, 'London', 'Edinburgh')
console.log('London→Edinburgh path:', r1.path)
console.log('London→Edinburgh cost:', r1.cost)

const r2 = dijkstraPath(roads, 'London', 'Cardiff')
console.log('London→Cardiff path:', r2.path)
console.log('London→Cardiff cost:', r2.cost)`,
      hint: 'For each {node:nb, weight} in graph[node]: if !visited, candidate=cost+weight, if candidate < dist[nb] update dist[nb], prev[nb]=node, pq.enqueue(nb, candidate). Then follow prev from target back.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('Edinburgh') && flat.includes('Cardiff') && flat.includes('London')
      },
    },

    { type: 'checkpoint', id: 'cp-dijkstra' },

    // ── Step 4: Strategy Pattern ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-strategy-intro',
      text: 'The Strategy pattern (a Gang of Four behavioral pattern) defines a family of algorithms, encapsulates each one, and makes them interchangeable. The "strategy" is an object (or function) representing a behaviour. The context object holds a reference to a strategy and delegates to it. You can swap strategies at runtime without changing the context. This differs from Template Method (which uses inheritance and compile-time binding) — Strategy uses composition and runtime binding. Common examples: sort comparators, payment methods in a checkout, compression algorithms in a file saver.',
      code: `// Without Strategy: one big function with conditionals
function calculateShipping(order, method) {
  if (method === 'standard') return order.weight * 0.5
  if (method === 'express')  return order.weight * 2.0 + 5
  if (method === 'overnight') return order.weight * 4.0 + 15
  throw new Error('unknown method')
}
// Problem: adding a new method requires editing this function.

// With Strategy: each method is a separate object
const standardShipping = { calculate: (order) => order.weight * 0.5 }
const expressShipping   = { calculate: (order) => order.weight * 2.0 + 5 }
const overnightShipping = { calculate: (order) => order.weight * 4.0 + 15 }

class ShippingCalculator {
  constructor(strategy) { this.strategy = strategy }
  setStrategy(s)        { this.strategy = s }          // swap at runtime
  calculate(order)      { return this.strategy.calculate(order) }
}

const calc = new ShippingCalculator(standardShipping)
console.log('standard:', calc.calculate({ weight: 10 }))  // 5

calc.setStrategy(expressShipping)
console.log('express:', calc.calculate({ weight: 10 }))   // 25`,
    },

    // ── Step 5: Dijkstra + Strategy (pluggable cost) ──────────────────────────

    {
      type: 'narration',
      id: 'step5-dijkstra-strategy',
      text: 'This is where the two ideas meet: Dijkstra\'s algorithm treats "cost" as a number, but what constitutes cost is flexible. The edge weight could be distance, time, fuel, or a combination. More powerfully, A* (A-star) is Dijkstra\'s with a heuristic function added: instead of just the cost-so-far, it uses cost-so-far + estimated-cost-to-go. The estimated-cost-to-go is a pluggable Strategy. Swap the heuristic to get different search behaviors. The traversal skeleton stays identical.',
      code: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

// Dijkstra with pluggable cost strategy
function dijkstraStrategy(graph, source, target, strategy) {
  const dist    = {}
  const prev    = {}
  const visited = new Set()

  for (const n of Object.keys(graph)) { dist[n] = Infinity; prev[n] = null }
  dist[source] = 0

  const pq = createPQ()
  pq.enqueue(source, strategy.priority(source, 0))  // ← NEW  strategy sets queue priority

  while (!pq.isEmpty()) {
    const { node, cost } = pq.dequeue()
    if (visited.has(node)) continue
    visited.add(node)
    if (node === target) break

    for (const edge of (graph[node] || [])) {
      if (visited.has(edge.node)) continue
      const edgeCost  = strategy.edgeCost(edge)          // ← NEW  strategy picks cost
      const candidate = dist[node] + edgeCost             // ← NEW
      if (candidate < dist[edge.node]) {
        dist[edge.node] = candidate
        prev[edge.node] = node
        const priority = strategy.priority(edge.node, candidate)  // ← NEW
        pq.enqueue(edge.node, priority)
      }
    }
  }

  if (dist[target] === Infinity) return null
  const path = []; let cur = target
  while (cur) { path.unshift(cur); cur = prev[cur] }
  return { path, cost: dist[target] }
}

// Strategy 1: shortest distance
const distanceStrategy = {
  edgeCost: (edge) => edge.distance,
  priority: (node, cost) => cost,            // f = g (just cost so far)
}

// Strategy 2: fastest time
const timeStrategy = {
  edgeCost: (edge) => edge.time,
  priority: (node, cost) => cost,
}

const graph = {
  A: [{node:'B',distance:10,time:20},{node:'C',distance:5,time:8}],
  B: [{node:'D',distance:3, time:5}],
  C: [{node:'D',distance:8, time:6}],
  D: [],
}

console.log('shortest dist:', dijkstraStrategy(graph,'A','D',distanceStrategy))
console.log('fastest time:', dijkstraStrategy(graph,'A','D',timeStrategy))`,
    },

    // ── Step 6: A*-style heuristic strategy ───────────────────────────────────

    {
      type: 'narration',
      id: 'step6-astar',
      text: 'A* adds a heuristic (an estimate of remaining cost to the target) to guide search toward the goal faster. The priority in the queue becomes f = g + h where g is cost so far and h is the heuristic estimate. If h is admissible (never overestimates the true remaining cost), A* finds the optimal path. By making h a Strategy, you can plug in different heuristics: h=0 gives plain Dijkstra; h=Manhattan distance gives A* on a grid; h=Euclidean distance gives A* with geographic coordinates.',
      code: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}
function dijkstraStrategy(graph,source,target,strategy){const dist={},prev={},visited=new Set();for(const n of Object.keys(graph)){dist[n]=Infinity;prev[n]=null}dist[source]=0;const pq=createPQ();pq.enqueue(source,strategy.priority(source,0));while(!pq.isEmpty()){const{node,cost}=pq.dequeue();if(visited.has(node))continue;visited.add(node);if(node===target)break;for(const edge of(graph[node]||[])){if(visited.has(edge.node))continue;const ec=strategy.edgeCost(edge);const cand=dist[node]+ec;if(cand<dist[edge.node]){dist[edge.node]=cand;prev[edge.node]=node;pq.enqueue(edge.node,strategy.priority(edge.node,cand))}}}if(dist[target]===Infinity)return null;const path=[];let cur=target;while(cur){path.unshift(cur);cur=prev[cur]}return{path,cost:dist[target]}}

// Coordinates for heuristic calculation
const coords = { A:[0,0], B:[1,2], C:[3,0], D:[4,2], E:[5,0] }

function euclidean(a, b) {
  const dx = coords[a][0] - coords[b][0]
  const dy = coords[a][1] - coords[b][1]
  return Math.sqrt(dx*dx + dy*dy)
}

// A* strategy — heuristic guides toward target
const aStarStrategy = (target) => ({                 // ← NEW  factory with target
  edgeCost: (edge) => edge.weight,                   // ← NEW
  priority: (node, costSoFar) =>                     // ← NEW  f = g + h
    costSoFar + euclidean(node, target),             // ← NEW
})

// Dijkstra strategy — no heuristic
const dijkstraPlain = {
  edgeCost: (edge) => edge.weight,
  priority: (node, cost) => cost,                    // ← just g, no h
}

const graph = {
  A:[{node:'B',weight:2.2},{node:'C',weight:3.0}],
  B:[{node:'D',weight:3.2},{node:'E',weight:5.0}],
  C:[{node:'D',weight:2.2},{node:'E',weight:3.0}],
  D:[{node:'E',weight:2.2}],
  E:[],
}

const r1 = dijkstraStrategy(graph, 'A', 'E', dijkstraPlain)
const r2 = dijkstraStrategy(graph, 'A', 'E', aStarStrategy('E'))

console.log('Dijkstra path:', r1.path, 'cost:', Math.round(r1.cost * 10) / 10)
console.log('A* path:',       r2.path, 'cost:', Math.round(r2.cost * 10) / 10)`,
    },

    // ── Challenge 2: Strategy implementation ─────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-strategy',
      text: 'Create two strategies for a route planner: timeStrategy (uses edge.time) and fuelStrategy (uses edge.fuel). Run both on the graph below from "A" to "D". Log the best path and cost for each strategy. The paths may differ because time-optimal and fuel-optimal routes are different.',
      expectedOutput: null,
      startCode: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}
function dijkstraStrategy(graph,source,target,strategy){
  const dist={},prev={},visited=new Set()
  for(const n of Object.keys(graph)){dist[n]=Infinity;prev[n]=null}
  dist[source]=0
  const pq=createPQ()
  pq.enqueue(source,0)
  while(!pq.isEmpty()){
    const{node,cost}=pq.dequeue()
    if(visited.has(node))continue
    visited.add(node)
    if(node===target)break
    for(const edge of(graph[node]||[])){
      if(visited.has(edge.node))continue
      const ec=strategy.edgeCost(edge)
      const cand=dist[node]+ec
      if(cand<dist[edge.node]){dist[edge.node]=cand;prev[edge.node]=node;pq.enqueue(edge.node,cand)}
    }
  }
  if(dist[target]===Infinity)return null
  const path=[];let cur=target;while(cur){path.unshift(cur);cur=prev[cur]}
  return{path,cost:dist[target]}
}

const graph = {
  A: [{node:'B',time:30,fuel:10},{node:'C',time:50,fuel:5}],
  B: [{node:'D',time:20,fuel:15}],
  C: [{node:'D',time:10,fuel:8}],
  D: [],
}

// Define timeStrategy and fuelStrategy
const timeStrategy = { edgeCost: (edge) => edge.time, priority: (n, c) => c }
const fuelStrategy = {
  // YOUR CODE HERE: edgeCost uses edge.fuel
}

const r1 = dijkstraStrategy(graph, 'A', 'D', timeStrategy)
const r2 = dijkstraStrategy(graph, 'A', 'D', fuelStrategy)
console.log('fastest path:', r1.path, 'time:', r1.cost)
console.log('fuel path:', r2.path, 'fuel:', r2.cost)`,
      hint: 'fuelStrategy = { edgeCost: (edge) => edge.fuel, priority: (n, c) => c }. The fuel-optimal path should go through C (5+8=13 fuel) not B (10+15=25 fuel).',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('A') && flat.includes('D') && flat.includes('fuel')
      },
    },

    { type: 'checkpoint', id: 'cp-strategy' },

    // ── Combined: Route finder ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'A full route finder exposes a single find(from, to, strategyName) method. The strategy is selected by name at runtime. Adding a new cost metric is a new strategy object — the route finder and Dijkstra\'s algorithm never change. This is the Strategy pattern\'s core benefit: open for extension (add new strategies), closed for modification (never change the context).',
      code: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}
function dijkstraStrategy(graph,src,tgt,strategy){const dist={},prev={},vis=new Set();for(const n of Object.keys(graph)){dist[n]=Infinity;prev[n]=null}dist[src]=0;const pq=createPQ();pq.enqueue(src,0);while(!pq.isEmpty()){const{node,cost}=pq.dequeue();if(vis.has(node))continue;vis.add(node);if(node===tgt)break;for(const e of(graph[node]||[])){if(vis.has(e.node))continue;const ec=strategy.edgeCost(e);const c=dist[node]+ec;if(c<dist[e.node]){dist[e.node]=c;prev[e.node]=node;pq.enqueue(e.node,c)}}}if(dist[tgt]===Infinity)return null;const path=[];let cur=tgt;while(cur){path.unshift(cur);cur=prev[cur]}return{path,cost:dist[tgt]}}

class RouteFinder {
  constructor(graph) {
    this._graph = graph
    this._strategies = {
      distance: { edgeCost: e => e.km,       priority: (n,c) => c },
      time:     { edgeCost: e => e.minutes,   priority: (n,c) => c },
      fuel:     { edgeCost: e => e.litres,    priority: (n,c) => c },
    }
  }

  addStrategy(name, strategy) { this._strategies[name] = strategy }

  find(from, to, strategyName = 'distance') {
    const strategy = this._strategies[strategyName]
    if (!strategy) throw new Error('Unknown strategy: ' + strategyName)
    return dijkstraStrategy(this._graph, from, to, strategy)
  }
}

const cityGraph = {
  London:     [{node:'Paris',km:341,minutes:270,litres:30},{node:'Brussels',km:320,minutes:210,litres:28}],
  Paris:      [{node:'Berlin',km:1054,minutes:660,litres:95}],
  Brussels:   [{node:'Berlin',km:653,minutes:420,litres:60},{node:'Paris',km:265,minutes:165,litres:24}],
  Berlin:     [],
}

const finder = new RouteFinder(cityGraph)
console.log('shortest distance:', finder.find('London','Berlin','distance').path)
console.log('fastest time:',      finder.find('London','Berlin','time').path)
console.log('least fuel:',        finder.find('London','Berlin','fuel').path)`,
    },

    // ── Challenge 3: Combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Add a "toll" strategy to the RouteFinder that uses edge.toll as the cost. Then add a "scenic" strategy that uses edge.toll * -1 + edge.km * 0.001 (prefer roads with low tolls and longer scenic routes — a lower number means more preferred). Run all four strategies (distance, time, toll, scenic) on the graph from "A" to "D" and log each result.',
      expectedOutput: null,
      startCode: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}
function dijkstraStrategy(graph,src,tgt,st){const dist={},prev={},vis=new Set();for(const n of Object.keys(graph)){dist[n]=Infinity;prev[n]=null}dist[src]=0;const pq=createPQ();pq.enqueue(src,0);while(!pq.isEmpty()){const{node,cost}=pq.dequeue();if(vis.has(node))continue;vis.add(node);if(node===tgt)break;for(const e of(graph[node]||[])){if(vis.has(e.node))continue;const ec=st.edgeCost(e);const c=dist[node]+ec;if(c<dist[e.node]){dist[e.node]=c;prev[e.node]=node;pq.enqueue(e.node,c)}}}if(dist[tgt]===Infinity)return null;const path=[];let cur=tgt;while(cur){path.unshift(cur);cur=prev[cur]}return{path,cost:dist[tgt]}}

class RouteFinder {
  constructor(graph){this._graph=graph;this._strategies={distance:{edgeCost:e=>e.km,priority:(n,c)=>c},time:{edgeCost:e=>e.minutes,priority:(n,c)=>c}}}
  addStrategy(name, strategy){this._strategies[name]=strategy}
  find(from,to,name='distance'){const s=this._strategies[name];return dijkstraStrategy(this._graph,from,to,s)}
}

const graph = {
  A:[{node:'B',km:100,minutes:60,toll:5},{node:'C',km:200,minutes:90,toll:1}],
  B:[{node:'D',km:50, minutes:30,toll:10}],
  C:[{node:'D',km:80, minutes:50,toll:2}],
  D:[],
}

const finder = new RouteFinder(graph)
finder.addStrategy('toll',   { edgeCost: e => e.toll,            priority: (n,c) => c })
finder.addStrategy('scenic', { edgeCost: e => /* YOUR CODE: low toll + long km is good */0, priority: (n,c) => c })

;['distance','time','toll','scenic'].forEach(strategy => {
  const r = finder.find('A', 'D', strategy)
  console.log(strategy + ':', r.path.join('→'), 'cost:', Math.round(r.cost * 100) / 100)
})`,
      hint: 'scenic edgeCost: e.toll * -1 + e.km * 0.001. This makes low-toll, long-distance roads preferred (more negative = better). But note: Dijkstra requires non-negative weights — for scenic to work correctly, shift values so all are positive, e.g. (10 - e.toll) + e.km * 0.001.',
      validate: ({ logs }) => {
        const flat = logs.join('\n')
        return flat.includes('distance') && flat.includes('toll') && flat.includes('scenic')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through Dijkstra. Watch the dist object update each time a cheaper path is found — see Infinity values get replaced. Watch the priority queue sort and dequeue the smallest-cost node. See the visited Set prevent reprocessing. Then watch the strategy object get called at edgeCost — step into it to see which edge property is returned.',
      code: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}

function dijkstraStrategy(graph, source, target, strategy) {
  const dist = {}, prev = {}, visited = new Set()
  for (const n of Object.keys(graph)) { dist[n] = Infinity; prev[n] = null }
  dist[source] = 0
  const pq = createPQ()
  pq.enqueue(source, 0)

  while (!pq.isEmpty()) {
    const { node, cost } = pq.dequeue()
    if (visited.has(node)) continue
    visited.add(node)
    if (node === target) break
    for (const edge of (graph[node] || [])) {
      if (visited.has(edge.node)) continue
      const ec = strategy.edgeCost(edge)
      const cand = dist[node] + ec
      if (cand < dist[edge.node]) {
        dist[edge.node] = cand
        prev[edge.node] = node
        pq.enqueue(edge.node, cand)
      }
    }
  }

  const path = []; let cur = target
  while (cur) { path.unshift(cur); cur = prev[cur] }
  return { path, cost: dist[target] }
}

const graph = { A:[{node:'B',weight:4},{node:'C',weight:2}], B:[{node:'D',weight:5}], C:[{node:'B',weight:1},{node:'D',weight:8}], D:[] }
const strategy = { edgeCost: e => e.weight, priority: (n, c) => c }
const r = dijkstraStrategy(graph, 'A', 'D', strategy)
console.log(r.path, r.cost)`,
    },

    {
      type: 'codelens',
      id: 'cl-dijkstra',
      text: 'Step through in CodeLens. Watch dist values drop from Infinity as cheaper paths are found. See the priority queue always dequeue the node with the lowest cost. Watch the Strategy.edgeCost function get called — this is the pluggable part. The traversal structure never changes; only edgeCost varies.',
      code: `function createPQ(){const i=[];return{enqueue(n,c){i.push({node:n,cost:c});i.sort((a,b)=>a.cost-b.cost)},dequeue(){return i.shift()},isEmpty(){return!i.length}}}
function dijkstra(graph,src,tgt,strategy){const dist={},prev={},vis=new Set();for(const n of Object.keys(graph)){dist[n]=Infinity;prev[n]=null}dist[src]=0;const pq=createPQ();pq.enqueue(src,0);while(!pq.isEmpty()){const{node,cost}=pq.dequeue();if(vis.has(node))continue;vis.add(node);if(node===tgt)break;for(const e of(graph[node]||[])){if(vis.has(e.node))continue;const c=dist[node]+strategy.edgeCost(e);if(c<dist[e.node]){dist[e.node]=c;prev[e.node]=node;pq.enqueue(e.node,c)}}}const p=[];let c=tgt;while(c){p.unshift(c);c=prev[c]}return{path:p,cost:dist[tgt]}}
const g={A:[{node:'B',weight:4},{node:'C',weight:2}],B:[{node:'D',weight:5}],C:[{node:'B',weight:1},{node:'D',weight:8}],D:[]}
const r=dijkstra(g,'A','D',{edgeCost:e=>e.weight,priority:(n,c)=>c})
console.log(r.path,r.cost)`,
      lang: 'js',
    },

  ],
}
