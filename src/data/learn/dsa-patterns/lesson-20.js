// DSA + Design Patterns — Lesson 20
// BFS + Observer Pattern

export const lesson = {
  id: 'dsa-patterns-20',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '20. BFS + Observer',
  checkpoints: [
    { id: 'cp-bfs',      label: 'BFS' },
    { id: 'cp-observer', label: 'Observer Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You need to visit everything reachable from a starting point in a network — web pages linked from a homepage, people within three degrees of separation, rooms reachable from an entrance. But you also want to react to each discovery without wiring the traversal algorithm to every possible reaction. Two ideas solve this together: a traversal strategy that visits nodes level by level (closest first), and a decoupling pattern where the traversal announces each discovery and any interested party can listen without the traversal knowing they exist.',
      code: null,
    },

    // ── Step 1: Why BFS, not DFS ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-why-bfs',
      text: 'Breadth-First Search (BFS) explores a graph level by level — it visits all nodes at distance 1 from the start before visiting any at distance 2, and so on. This gives it a key property: the first time BFS reaches a node, it has taken the shortest path (fewest edges) to get there. Depth-First Search (DFS — covered in tree lessons — dives as deep as possible before backtracking) does not guarantee shortest paths. BFS uses a queue (FIFO — first in, first out — covered in lesson 9) to keep track of what to visit next. DFS uses a stack (LIFO). The queue is why BFS stays level by level.',
      code: `// BFS vs DFS on the same graph
// Graph: A-B-C (A connects to B, B connects to C), A also connects to D

const graph = {
  A: ['B', 'D'],
  B: ['A', 'C'],
  C: ['B'],
  D: ['A'],
}

// BFS: queue — visit closest first
function bfsOrder(graph, start) {
  const visited = new Set([start])
  const queue   = [start]      // FIFO — shift() removes from front
  const order   = []
  while (queue.length) {
    const v = queue.shift()    // take from front
    order.push(v)
    for (const n of graph[v]) {
      if (!visited.has(n)) { visited.add(n); queue.push(n) }  // add to back
    }
  }
  return order
}

// DFS: stack — dive deep first
function dfsOrder(graph, start) {
  const visited = new Set([start])
  const stack   = [start]      // LIFO — pop() removes from back
  const order   = []
  while (stack.length) {
    const v = stack.pop()      // take from back
    order.push(v)
    for (const n of graph[v]) {
      if (!visited.has(n)) { visited.add(n); stack.push(n) }
    }
  }
  return order
}

console.log('BFS order:', bfsOrder(graph, 'A'))   // A B D C  — level by level
console.log('DFS order:', dfsOrder(graph, 'A'))   // A D B C  — deep first`,
    },

    // ── Step 2: BFS with distance tracking ────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-bfs-distance',
      text: 'Track the distance (number of edges from start) for each node. Use a dist Map initialised to 0 for the start node. When you discover a new node from a current node, set dist[new] = dist[current] + 1. Because BFS visits nodes in order of increasing distance, the first time a node is reached is always via the shortest path. This makes BFS the foundation of shortest-path algorithms in unweighted graphs (all edges cost 1).',
      code: `function bfs(graph, start) {
  const visited = new Set([start])  // ← NEW  track visited nodes
  const dist    = new Map()         // ← NEW  node → shortest distance from start
  const queue   = [start]           // ← NEW  FIFO queue
  dist.set(start, 0)                // ← NEW  start is distance 0 from itself

  while (queue.length > 0) {        // ← NEW
    const v = queue.shift()         // ← NEW  dequeue from front
    for (const neighbour of (graph[v] || [])) {   // ← NEW
      if (!visited.has(neighbour)) {              // ← NEW  only visit once
        visited.add(neighbour)                    // ← NEW
        dist.set(neighbour, dist.get(v) + 1)      // ← NEW  one step further
        queue.push(neighbour)                     // ← NEW  enqueue for later
      }
    }
  }

  return dist   // ← NEW  returns Map of node → distance
}

const graph = {
  A: ['B','C'],
  B: ['A','D','E'],
  C: ['A','F'],
  D: ['B'],
  E: ['B'],
  F: ['C'],
}

const distances = bfs(graph, 'A')
console.log('dist A→D:', distances.get('D'))   // 2  (A→B→D)
console.log('dist A→F:', distances.get('F'))   // 2  (A→C→F)
console.log('dist A→E:', distances.get('E'))   // 2  (A→B→E)`,
    },

    // ── Step 3: BFS shortest path reconstruction ──────────────────────────────

    {
      type: 'narration',
      id: 'step3-shortest-path',
      text: 'To reconstruct the actual path (not just the distance), store a prev Map alongside dist. When you discover a new node, record which node it came from: prev[new] = current. After BFS finishes, reconstruct the path by following prev pointers from the target back to the start, then reversing. This is O(V + E) total — V for the BFS and E for the edge scanning — where V is vertices and E is edges.',
      code: `function bfsShortestPath(graph, start, end) {
  const visited = new Set([start])
  const dist    = new Map([[start, 0]])
  const prev    = new Map([[start, null]])   // ← NEW  track path
  const queue   = [start]

  while (queue.length > 0) {
    const v = queue.shift()
    if (v === end) break   // ← NEW  found target — can stop early

    for (const n of (graph[v] || [])) {
      if (!visited.has(n)) {
        visited.add(n)
        dist.set(n, dist.get(v) + 1)
        prev.set(n, v)         // ← NEW  came from v
        queue.push(n)
      }
    }
  }

  if (!prev.has(end)) return null   // ← NEW  no path found

  // Reconstruct path by following prev pointers back to start
  const path = []                   // ← NEW
  let node = end                    // ← NEW
  while (node !== null) {           // ← NEW
    path.unshift(node)              // ← NEW  prepend (we're going backwards)
    node = prev.get(node)           // ← NEW  follow the pointer
  }
  return path                       // ← NEW
}

const graph = {
  A:['B','C'], B:['A','D','E'], C:['A','F'], D:['B'], E:['B','G'], F:['C'], G:['E']
}

console.log(bfsShortestPath(graph,'A','G'))  // ['A','B','E','G']
console.log(bfsShortestPath(graph,'A','F'))  // ['A','C','F']
console.log(bfsShortestPath(graph,'D','F'))  // ['D','B','A','C','F']`,
    },

    // ── Step 4: BFS levels ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-levels',
      text: 'BFS naturally groups nodes by distance (level). Store nodes in a levels array where levels[d] is all nodes at distance d. This is useful for "find all nodes within k hops", "find the diameter of the graph", or any level-by-level processing. Detect level boundaries by recording the queue size before processing each level: all nodes currently in the queue are at the same level.',
      code: `function bfsLevels(graph, start) {
  const visited = new Set([start])
  const queue   = [start]
  const levels  = []              // ← NEW  levels[i] = nodes at distance i

  while (queue.length > 0) {
    const levelSize = queue.length   // ← NEW  how many nodes at this level
    const level     = []             // ← NEW

    for (let i = 0; i < levelSize; i++) {   // ← NEW  process exactly this many
      const v = queue.shift()               // ← NEW
      level.push(v)                         // ← NEW
      for (const n of (graph[v] || [])) {
        if (!visited.has(n)) {
          visited.add(n)
          queue.push(n)                     // ← NEW  next level nodes
        }
      }
    }

    levels.push(level)   // ← NEW  record this complete level
  }

  return levels
}

const graph = {
  A:['B','C'], B:['A','D','E'], C:['A','F'], D:['B'], E:['B'], F:['C']
}

const levels = bfsLevels(graph, 'A')
levels.forEach((lvl, i) => console.log('level ' + i + ':', lvl))
// level 0: ['A']
// level 1: ['B','C']
// level 2: ['D','E','F']`,
    },

    // ── Challenge 1: Shortest path ────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-bfs',
      text: 'Implement shortestPath(graph, start, end) that returns the path as an array of nodes. Use the graph below representing city connections. Find the path from "London" to "Paris" and from "London" to "Berlin". Log both paths. Edge case: if no path exists return []. The graph is undirected.',
      expectedOutput: null,
      startCode: `function shortestPath(graph, start, end) {
  // BFS with prev map
  // Return the path array, or [] if unreachable
}

const cities = {
  London:    ['Amsterdam', 'Brussels'],
  Amsterdam: ['London', 'Berlin', 'Brussels'],
  Brussels:  ['London', 'Amsterdam', 'Paris'],
  Berlin:    ['Amsterdam', 'Warsaw'],
  Paris:     ['Brussels'],
  Warsaw:    ['Berlin'],
}

console.log(shortestPath(cities, 'London', 'Paris'))
console.log(shortestPath(cities, 'London', 'Berlin'))
console.log(shortestPath(cities, 'London', 'Warsaw'))`,
      hint: 'Use a visited Set, dist Map, prev Map, and queue. When queue.shift() === end, reconstruct by following prev back from end. unshift each node into the path array as you go back.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('London') && flat.includes('Paris') && flat.includes('Berlin')
      },
    },

    { type: 'checkpoint', id: 'cp-bfs' },

    // ── Step 5: Observer pattern ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-observer-intro',
      text: 'The Observer pattern (a Gang of Four behavioral pattern — patterns about communication between objects) decouples event producers from event consumers. A subject (also called publisher or observable) maintains a list of observers (also called subscribers or listeners) and notifies all of them when something happens. The subject does not know what any observer does with the notification. Observers subscribe and unsubscribe at runtime. This is the pattern behind browser DOM events, Node.js EventEmitter, React\'s state update propagation, and virtually every UI framework.',
      code: `// Subject: maintains a list of observers and notifies them
class Subject {
  constructor() {
    this._observers = []
  }

  subscribe(observer) {
    this._observers.push(observer)
  }

  unsubscribe(observer) {
    this._observers = this._observers.filter(o => o !== observer)
  }

  notify(event, data) {
    for (const observer of this._observers) {
      observer(event, data)      // call each observer function
    }
  }
}

const subject = new Subject()

// Observers — subject has no reference to them by type
subject.subscribe((event, data) => console.log('[Logger]', event, data))
subject.subscribe((event, data) => { if (event === 'important') console.log('[Alert]', data) })

subject.notify('info',      'scanning...')
subject.notify('important', 'found target node')
subject.notify('info',      'done')`,
    },

    // ── Step 6: Observer-based BFS ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-observer-bfs',
      text: 'This is where the two ideas meet: BFS discovers nodes one at a time — each discovered node is an event. The BFS function becomes a Subject. When it discovers a node, it emits a "discover" event. When it finishes a level, it emits a "level" event. Any code that cares about these events subscribes. The BFS algorithm itself does not import or reference dashboards, loggers, progress bars, or any consumer. You can add new behaviors (cache discovered nodes, draw a visualisation, log to a server) without touching the BFS code.',
      code: `class Subject {
  constructor() { this._obs = [] }
  subscribe(fn)   { this._obs.push(fn) }
  notify(ev, data){ this._obs.forEach(fn => fn(ev, data)) }
}

function bfsObservable(graph, start) {
  const subject = new Subject()   // ← NEW  BFS is now a subject
  const visited = new Set([start])
  const queue   = [start]
  let   level   = 0

  function step() {               // ← NEW  process one level per call
    if (!queue.length) {
      subject.notify('done', { totalLevels: level })  // ← NEW
      return
    }
    const levelSize = queue.length
    const nodes     = []
    for (let i = 0; i < levelSize; i++) {
      const v = queue.shift()
      nodes.push(v)
      subject.notify('discover', { node: v, level })  // ← NEW  emit per node
      for (const n of (graph[v] || [])) {
        if (!visited.has(n)) { visited.add(n); queue.push(n) }
      }
    }
    subject.notify('level', { level, nodes })  // ← NEW  emit per level
    level++
    step()
  }

  return { subscribe: subject.subscribe.bind(subject), run: step }
}

const graph = { A:['B','C'], B:['A','D'], C:['A','E'], D:['B'], E:['C'] }
const bfs = bfsObservable(graph, 'A')

bfs.subscribe((ev, d) => { if (ev==='discover') console.log('found:', d.node, 'at level', d.level) })
bfs.subscribe((ev, d) => { if (ev==='level')    console.log('level', d.level, 'complete:', d.nodes) })
bfs.subscribe((ev, d) => { if (ev==='done')     console.log('BFS done, levels:', d.totalLevels) })

bfs.run()`,
    },

    // ── Challenge 2: BFS with level observer ─────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-observer',
      text: 'Build a BFS function that takes a graph, a start node, and an observer function. The observer is called with (event, data) for three events: "discover" with {node, level}, "level" with {level, nodes:[]}, and "done" with {visited: totalCount}. Use it to traverse a 6-node graph (A-B-C-D-E-F) and collect all level groups into a levels array by subscribing to the "level" event. Log the levels array. Also log total visited count from the "done" event.',
      expectedOutput: null,
      startCode: `function bfsWithObserver(graph, start, observer) {
  const visited = new Set([start])
  const queue   = [start]
  let   levelNum = 0

  while (queue.length > 0) {
    const size = queue.length
    const nodes = []
    for (let i = 0; i < size; i++) {
      const v = queue.shift()
      nodes.push(v)
      observer('discover', { node: v, level: levelNum })
      for (const n of (graph[v] || [])) {
        if (!visited.has(n)) { visited.add(n); queue.push(n) }
      }
    }
    observer('level', { level: levelNum, nodes })
    levelNum++
  }
  observer('done', { visited: visited.size })
}

const graph = {
  A:['B','C'], B:['A','D','E'], C:['A','F'], D:['B'], E:['B'], F:['C']
}

const levels = []
let totalVisited = 0

bfsWithObserver(graph, 'A', (event, data) => {
  if (event === 'level') levels.push(data.nodes)
  if (event === 'done')  totalVisited = data.visited
})

console.log('levels:', JSON.stringify(levels))
console.log('total visited:', totalVisited)`,
      hint: 'The code is mostly done — just run it as-is and verify levels logs all nodes grouped by distance. The observer pattern is already shown: a callback receives (event, data) and branches on event name.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('6') && flat.includes('A') && flat.includes('level')
      },
    },

    { type: 'checkpoint', id: 'cp-observer' },

    // ── Combined: Web crawler ─────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'A web crawler is BFS on a link graph: start at a seed URL, discover linked URLs, enqueue them, repeat. A progress observer tracks how many pages have been crawled. A depth-limit observer stops crawling beyond a certain level. A content observer indexes page content. All three are independent subscribers. The crawler emits events; it has zero knowledge of what the subscribers do. This is how real crawlers (Googlebot, the Wayback Machine) work at their core.',
      code: `// Simulated link graph
const linkGraph = {
  'home':    ['about', 'blog', 'contact'],
  'about':   ['home', 'team'],
  'blog':    ['home', 'post1', 'post2'],
  'contact': ['home'],
  'team':    ['about'],
  'post1':   ['blog', 'post2'],
  'post2':   ['blog', 'post1'],
}

class Crawler {
  constructor(graph) {
    this._graph = graph
    this._obs   = []
  }
  subscribe(fn) { this._obs.push(fn) }
  _emit(ev, data) { this._obs.forEach(fn => fn(ev, data)) }

  crawl(seed, maxLevel = 3) {
    const visited = new Set([seed])
    const queue   = [seed]
    let   level   = 0

    while (queue.length && level <= maxLevel) {
      const size  = queue.length
      const pages = []
      for (let i = 0; i < size; i++) {
        const page = queue.shift()
        pages.push(page)
        this._emit('page', { url: page, level })
        for (const link of (this._graph[page] || [])) {
          if (!visited.has(link)) { visited.add(link); queue.push(link) }
        }
      }
      this._emit('levelDone', { level, pages, totalCrawled: visited.size })
      level++
    }
    this._emit('done', { totalPages: visited.size })
  }
}

const crawler = new Crawler(linkGraph)

// Progress observer
crawler.subscribe((ev, d) => { if (ev==='page') console.log('crawled:', d.url, '(level ' + d.level + ')') })
// Summary observer
crawler.subscribe((ev, d) => { if (ev==='done') console.log('total pages crawled:', d.totalPages) })

crawler.crawl('home', 2)`,
    },

    // ── Challenge 3: Combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Extend the Crawler with a depth-limit observer that automatically stops the crawl when level > 1 (simulate by only subscribing to "levelDone" events and logging a warning when level >= 2). Then add a second observer that collects all crawled URLs into an array. Crawl from "home" with maxLevel=3, log the collected URLs, and log the depth warning when it fires.',
      expectedOutput: null,
      startCode: `const linkGraph = {
  'home':  ['about','blog'],
  'about': ['home','team'],
  'blog':  ['home','post1'],
  'team':  ['about'],
  'post1': ['blog'],
}

class Crawler {
  constructor(g){ this._g=g; this._obs=[] }
  subscribe(fn){ this._obs.push(fn) }
  _emit(ev,d){ this._obs.forEach(fn=>fn(ev,d)) }
  crawl(seed, maxLevel=3){
    const visited=new Set([seed]),queue=[seed]
    let level=0
    while(queue.length&&level<=maxLevel){
      const size=queue.length,pages=[]
      for(let i=0;i<size;i++){
        const page=queue.shift(); pages.push(page)
        this._emit('page',{url:page,level})
        for(const link of(this._g[page]||[]))if(!visited.has(link)){visited.add(link);queue.push(link)}
      }
      this._emit('levelDone',{level,pages})
      level++
    }
    this._emit('done',{total:visited.size})
  }
}

const crawler = new Crawler(linkGraph)
const collected = []

// Observer 1: collect all crawled URLs
crawler.subscribe((ev, d) => { if (ev === 'page') collected.push(d.url) })

// Observer 2: warn when depth >= 2
crawler.subscribe((ev, d) => {
  // YOUR CODE HERE: if ev === 'levelDone' and d.level >= 2, log a depth warning
})

crawler.crawl('home', 3)
console.log('collected:', collected)`,
      hint: 'if (ev === "levelDone" && d.level >= 2) console.log("depth warning: level", d.level)',
      validate: ({ logs }) => {
        const flat = logs.join(' ').toLowerCase()
        return flat.includes('depth') && flat.includes('home')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the BFS loop. Watch the queue array: each iteration removes one node from the front (shift) and adds new neighbours to the back (push). See the visited Set prevent nodes from being added twice. Then step into the observer notification and watch each subscriber function get called in sequence.',
      code: `function bfsWithObserver(graph, start, observer) {
  const visited = new Set([start])
  const queue   = [start]
  let   levelNum = 0

  while (queue.length > 0) {
    const size  = queue.length
    const nodes = []
    for (let i = 0; i < size; i++) {
      const v = queue.shift()
      nodes.push(v)
      observer('discover', { node: v, level: levelNum })
      for (const n of (graph[v] || [])) {
        if (!visited.has(n)) { visited.add(n); queue.push(n) }
      }
    }
    observer('level', { level: levelNum, nodes })
    levelNum++
  }
  observer('done', { visited: visited.size })
}

const graph = { A:['B','C'], B:['A','D'], C:['A','D'], D:['B','C'] }
const levels = []
bfsWithObserver(graph, 'A', (ev, d) => {
  if (ev === 'discover') console.log('found', d.node, 'at level', d.level)
  if (ev === 'level') levels.push(d.nodes)
})
console.log('levels:', JSON.stringify(levels))`,
    },

    {
      type: 'codelens',
      id: 'cl-bfs',
      text: 'Step through in CodeLens. Watch the queue array at each iteration. See how nodes are added to the back (push) and removed from the front (shift). Watch the visited Set grow. Notice that levelSize controls how many nodes belong to the current level before the level index increments.',
      code: `function bfsLevels(graph,start){const visited=new Set([start]),queue=[start],levels=[];while(queue.length){const size=queue.length,level=[];for(let i=0;i<size;i++){const v=queue.shift();level.push(v);for(const n of(graph[v]||[]))if(!visited.has(n)){visited.add(n);queue.push(n)}}levels.push(level)}return levels}
const graph={A:['B','C'],B:['A','D'],C:['A','D'],D:['B','C']}
const levels=bfsLevels(graph,'A')
levels.forEach((l,i)=>console.log('level '+i+':',l))`,
      lang: 'js',
    },

  ],
}
