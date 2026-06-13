// DSA + Design Patterns — Lesson 22
// Topological Sort + Template Method Pattern

export const lesson = {
  id: 'dsa-patterns-22',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '22. Topological Sort + Template Method',
  checkpoints: [
    { id: 'cp-topo',     label: 'Topological Sort' },
    { id: 'cp-template', label: 'Template Method' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You need to sequence tasks that depend on each other: compile module B only after module A, install packages before running tests, take prerequisite courses before advanced ones. There is a circular dependency problem — if A depends on B and B depends on A, there is no valid order. Two ideas solve this together: a graph algorithm that finds a valid linear ordering of a dependency graph, and a design pattern where the skeleton of the algorithm is fixed but one step — what to do with each task as it is processed — is left for subclasses to define.',
      code: null,
    },

    // ── Step 1: DAG and in-degree ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-dag',
      text: 'A DAG (Directed Acyclic Graph — a directed graph with no cycles) is the data structure for dependency problems. Directed because dependencies have a direction: A must come before B. Acyclic because cycles (A depends on B depends on A) make ordering impossible. The in-degree of a node is the number of edges pointing INTO it — how many tasks must be completed before this one. A node with in-degree 0 has no prerequisites — it can be processed first. Kahn\'s algorithm exploits this: repeatedly remove nodes with in-degree 0.',
      code: `// Build a DAG with adjacency list + in-degree map
function buildDAG(edges) {
  const adj     = new Map()   // node → [nodes that depend on it]
  const inDeg   = new Map()   // node → number of prerequisites

  for (const [from, to] of edges) {
    if (!adj.has(from)) adj.set(from, [])
    if (!adj.has(to))   adj.set(to,   [])
    if (!inDeg.has(from)) inDeg.set(from, 0)
    if (!inDeg.has(to))   inDeg.set(to,   0)

    adj.get(from).push(to)          // from must come before to
    inDeg.set(to, inDeg.get(to) + 1)  // to has one more prerequisite
  }

  return { adj, inDeg }
}

// Course prerequisites: [prerequisite, course]
const { adj, inDeg } = buildDAG([
  ['math', 'physics'],
  ['math', 'stats'],
  ['physics', 'engineering'],
  ['stats', 'engineering'],
])

console.log('in-degree of math:', inDeg.get('math'))            // 0 — no prereqs
console.log('in-degree of physics:', inDeg.get('physics'))      // 1
console.log('in-degree of engineering:', inDeg.get('engineering'))  // 2`,
    },

    // ── Step 2: Kahn's algorithm ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-kahns',
      text: 'Kahn\'s algorithm for topological sort: (1) Find all nodes with in-degree 0 — these have no prerequisites, add them to a queue. (2) While the queue is not empty: dequeue a node, add it to the result, then for each of its neighbours (nodes that depend on it), decrement their in-degree by 1. If a neighbour\'s in-degree reaches 0, enqueue it — all its prerequisites are now done. (3) If the result length equals the number of nodes, you have a valid topological order. If it is shorter, there is a cycle. Time complexity: O(V + E) — each node and each edge is processed exactly once.',
      code: `function buildDAG(edges) {
  const adj=new Map(), inDeg=new Map()
  for(const[f,t]of edges){
    if(!adj.has(f))adj.set(f,[]);if(!adj.has(t))adj.set(t,[])
    if(!inDeg.has(f))inDeg.set(f,0);if(!inDeg.has(t))inDeg.set(t,0)
    adj.get(f).push(t);inDeg.set(t,inDeg.get(t)+1)
  }
  return{adj,inDeg}
}

function kahnSort(edges) {
  const { adj, inDeg } = buildDAG(edges)

  const queue  = []                           // ← NEW  zero-in-degree nodes
  const result = []                           // ← NEW  topological order

  // Step 1: find all nodes with in-degree 0
  for (const [node, deg] of inDeg) {          // ← NEW
    if (deg === 0) queue.push(node)           // ← NEW
  }

  while (queue.length > 0) {                  // ← NEW
    const node = queue.shift()                // ← NEW  dequeue
    result.push(node)                         // ← NEW  add to order

    // Decrement in-degree of all neighbours
    for (const neighbour of (adj.get(node) || [])) {   // ← NEW
      const newDeg = inDeg.get(neighbour) - 1           // ← NEW
      inDeg.set(neighbour, newDeg)                      // ← NEW
      if (newDeg === 0) queue.push(neighbour)           // ← NEW  ready!
    }
  }

  return result   // ← NEW
}

const order = kahnSort([
  ['math','physics'], ['math','stats'],
  ['physics','engineering'], ['stats','engineering'],
  ['intro','math'],
])
console.log('build order:', order)
// intro → math → physics → stats → engineering  (one valid order)`,
    },

    // ── Step 3: Cycle detection ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-cycle',
      text: 'If the topological sort result contains fewer nodes than the total number of nodes in the graph, a cycle exists. This is because nodes in a cycle never reach in-degree 0 — they are waiting for each other forever. Kahn\'s algorithm therefore doubles as a cycle detector: run it, count the output, compare to node count. This is O(V + E) — no extra work needed.',
      code: `function buildDAG(edges){const adj=new Map(),inDeg=new Map();for(const[f,t]of edges){if(!adj.has(f))adj.set(f,[]);if(!adj.has(t))adj.set(t,[]);if(!inDeg.has(f))inDeg.set(f,0);if(!inDeg.has(t))inDeg.set(t,0);adj.get(f).push(t);inDeg.set(t,inDeg.get(t)+1)}return{adj,inDeg}}

function kahnSort(edges) {
  const { adj, inDeg } = buildDAG(edges)
  const queue=[], result=[]
  for(const[n,d]of inDeg) if(d===0)queue.push(n)
  while(queue.length){ const n=queue.shift(); result.push(n); for(const nb of(adj.get(n)||[])){ const nd=inDeg.get(nb)-1; inDeg.set(nb,nd); if(nd===0)queue.push(nb) } }

  const totalNodes = inDeg.size              // ← NEW  total node count

  if (result.length < totalNodes) {          // ← NEW  cycle detected
    const inCycle = [...inDeg.entries()]     // ← NEW
      .filter(([, d]) => d > 0)             // ← NEW  still have unresolved deps
      .map(([n]) => n)                       // ← NEW
    return { order: result, cycle: true, stuck: inCycle }  // ← NEW
  }

  return { order: result, cycle: false, stuck: [] }  // ← NEW
}

// No cycle
const ok = kahnSort([['A','B'],['B','C'],['A','C']])
console.log('no cycle:', ok.order)   // A B C

// With cycle: A→B→C→A
const bad = kahnSort([['A','B'],['B','C'],['C','A']])
console.log('has cycle:', bad.cycle)   // true
console.log('stuck nodes:', bad.stuck) // A B C — all stuck`,
    },

    // ── Challenge 1: Cycle detection ─────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-topo',
      text: 'Implement kahnSort(edges) that returns {order, hasCycle}. Run it on a valid course dependency graph: [["CS101","CS201"],["CS101","MATH101"],["CS201","CS301"],["MATH101","CS301"],["CS301","CS401"]]. Log the order. Then run it on a graph with a cycle: [["A","B"],["B","C"],["C","A"]]. Log hasCycle. The order length should be 5 for the valid graph and hasCycle should be true for the cyclic one.',
      expectedOutput: null,
      startCode: `function kahnSort(edges) {
  const adj = new Map(), inDeg = new Map()
  for (const [f, t] of edges) {
    if (!adj.has(f)) adj.set(f, [])
    if (!adj.has(t)) adj.set(t, [])
    if (!inDeg.has(f)) inDeg.set(f, 0)
    if (!inDeg.has(t)) inDeg.set(t, 0)
    adj.get(f).push(t)
    inDeg.set(t, inDeg.get(t) + 1)
  }

  const queue = [], result = []
  for (const [n, d] of inDeg) if (d === 0) queue.push(n)

  while (queue.length) {
    // YOUR CODE HERE
  }

  const hasCycle = result.length < inDeg.size
  return { order: result, hasCycle }
}

const courses = [['CS101','CS201'],['CS101','MATH101'],['CS201','CS301'],['MATH101','CS301'],['CS301','CS401']]
const r1 = kahnSort(courses)
console.log('order:', r1.order)
console.log('has cycle:', r1.hasCycle)

const cyclic = [['A','B'],['B','C'],['C','A']]
const r2 = kahnSort(cyclic)
console.log('cycle graph - has cycle:', r2.hasCycle)`,
      hint: 'Inside the while loop: shift from queue, push to result, then for each neighbour decrement inDeg and if it reaches 0, push to queue.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('true') && flat.includes('false') && flat.includes('CS401')
      },
    },

    { type: 'checkpoint', id: 'cp-topo' },

    // ── Step 4: Template Method Pattern ──────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-template-intro',
      text: 'The Template Method pattern (a Gang of Four behavioral pattern) defines the skeleton of an algorithm in a base class, but lets subclasses override specific steps without changing the overall structure. The base class\'s template method calls a series of steps in a fixed order. Some steps have default implementations; others are abstract (must be overridden). This is the "Hollywood Principle": don\'t call us, we\'ll call you — the base class calls the subclass methods, not the other way around.',
      code: `// Template Method: fixed skeleton, variable steps
class DataProcessor {
  // Template method — the fixed skeleton
  process(data) {
    const loaded    = this.load(data)       // step 1: always happens
    const validated = this.validate(loaded) // step 2: always happens
    const result    = this.transform(validated)  // step 3: variable — override this
    this.save(result)                       // step 4: always happens
    return result
  }

  load(data)      { return data }         // default: pass-through
  validate(data)  { return data }         // default: pass-through
  save(result)    { console.log('saved:', result) }  // default: log

  // Abstract step — subclasses MUST define this
  transform(data) { throw new Error('transform() must be implemented') }
}

class UpperCaseProcessor extends DataProcessor {
  transform(data) { return data.toUpperCase() }  // override just this step
}

class WordCountProcessor extends DataProcessor {
  transform(data) { return data.split(' ').length }  // different override
}

const upper = new UpperCaseProcessor()
const counter = new WordCountProcessor()

console.log(upper.process('hello world'))    // HELLO WORLD
console.log(counter.process('hello world'))  // 2`,
    },

    // ── Step 5: Template Method on Kahn's ────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-template-topo',
      text: 'This is where the two ideas meet: Kahn\'s algorithm has a fixed skeleton — find zero-in-degree nodes, process them, decrement neighbours — but "how to process each node" is the variable step. Wrap Kahn\'s in a Template Method. The base class defines the traversal skeleton. Subclasses override processNode(node) to do different work: one logs, one builds a dependency graph, one simulates a build system executing tasks. The traversal order is always correct; only the action changes.',
      code: `function buildDAG(edges){const adj=new Map(),inDeg=new Map();for(const[f,t]of edges){if(!adj.has(f))adj.set(f,[]);if(!adj.has(t))adj.set(t,[]);if(!inDeg.has(f))inDeg.set(f,0);if(!inDeg.has(t))inDeg.set(t,0);adj.get(f).push(t);inDeg.set(t,inDeg.get(t)+1)}return{adj,inDeg}}

// Template Method base: fixed Kahn's skeleton, variable processNode
class TopologicalProcessor {           // ← NEW
  run(edges) {                         // ← NEW  template method
    const { adj, inDeg } = buildDAG(edges)   // ← NEW  step 1: build DAG
    const queue = []                   // ← NEW  step 2: find zero-in-degree
    for (const [n, d] of inDeg) if (d === 0) queue.push(n)  // ← NEW

    this.onStart(inDeg.size)           // ← NEW  hook: algorithm starting

    while (queue.length) {             // ← NEW  step 3: process
      const node = queue.shift()       // ← NEW
      this.processNode(node)           // ← NEW  VARIABLE STEP — override this
      for (const nb of (adj.get(node)||[])) {   // ← NEW  step 4: decrement
        const nd = inDeg.get(nb) - 1   // ← NEW
        inDeg.set(nb, nd)              // ← NEW
        if (nd === 0) queue.push(nb)   // ← NEW
      }
    }

    this.onDone()                      // ← NEW  hook: algorithm done
  }

  onStart(count) {}   // optional hook
  onDone()       {}   // optional hook
  processNode(node) { throw new Error('processNode() must be overridden') }  // abstract
}

// Subclass 1: just log the order
class LoggingProcessor extends TopologicalProcessor {
  processNode(node) { console.log('processing:', node) }
}

// Subclass 2: simulate a build system
class BuildProcessor extends TopologicalProcessor {
  constructor() { super(); this.built = [] }
  onStart(n)        { console.log('build plan: ' + n + ' tasks') }
  processNode(node) { this.built.push(node); console.log('built:', node) }
  onDone()          { console.log('all done:', this.built) }
}

const deps = [['lint','test'],['test','build'],['lint','typecheck'],['typecheck','build']]
new BuildProcessor().run(deps)`,
    },

    // ── Challenge 2: Template Method subclass ─────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-template',
      text: 'Create a TimeTrackingProcessor subclass of TopologicalProcessor. Override processNode(node) to record a "start" time (use a counter that increments by 1 per node — no real timing needed) and store it in a Map. Override onDone() to log "Schedule:" followed by each node and its start time. Use the course dependency graph: [["CS101","CS201"],["CS101","MATH101"],["CS201","CS301"],["MATH101","CS301"]]. Log the schedule.',
      expectedOutput: null,
      startCode: `function buildDAG(edges){const adj=new Map(),inDeg=new Map();for(const[f,t]of edges){if(!adj.has(f))adj.set(f,[]);if(!adj.has(t))adj.set(t,[]);if(!inDeg.has(f))inDeg.set(f,0);if(!inDeg.has(t))inDeg.set(t,0);adj.get(f).push(t);inDeg.set(t,inDeg.get(t)+1)}return{adj,inDeg}}

class TopologicalProcessor {
  run(edges) {
    const { adj, inDeg } = buildDAG(edges)
    const queue = []
    for (const [n, d] of inDeg) if (d === 0) queue.push(n)
    this.onStart(inDeg.size)
    while (queue.length) {
      const node = queue.shift()
      this.processNode(node)
      for (const nb of (adj.get(node)||[])) { const nd=inDeg.get(nb)-1; inDeg.set(nb,nd); if(nd===0)queue.push(nb) }
    }
    this.onDone()
  }
  onStart(count) {}
  onDone() {}
  processNode(node) { throw new Error('override me') }
}

class TimeTrackingProcessor extends TopologicalProcessor {
  constructor() {
    super()
    this.schedule = new Map()
    this.time = 0
  }

  processNode(node) {
    // record start time, increment counter
  }

  onDone() {
    // log 'Schedule:' then each node and its time
  }
}

const courses = [['CS101','CS201'],['CS101','MATH101'],['CS201','CS301'],['MATH101','CS301']]
new TimeTrackingProcessor().run(courses)`,
      hint: 'processNode: this.schedule.set(node, this.time++). onDone: console.log("Schedule:"); then for each [node,time] of this.schedule, console.log(node, "at t="+time).',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('Schedule') && flat.includes('CS101') && flat.includes('CS301')
      },
    },

    { type: 'checkpoint', id: 'cp-template' },

    // ── Combined: Course prerequisite system ──────────────────────────────────

    {
      type: 'narration',
      id: 'step6-combined',
      text: 'A course prerequisite system needs both: topological sort to find a valid study order, and Template Method to support different "what to do with each course" behaviours (display, simulate enrollment, check availability). The base processor handles all the DAG mechanics. Each subclass defines what happens at each course node.',
      code: `function buildDAG(edges){const adj=new Map(),inDeg=new Map();for(const[f,t]of edges){if(!adj.has(f))adj.set(f,[]);if(!adj.has(t))adj.set(t,[]);if(!inDeg.has(f))inDeg.set(f,0);if(!inDeg.has(t))inDeg.set(t,0);adj.get(f).push(t);inDeg.set(t,inDeg.get(t)+1)}return{adj,inDeg}}

class TopologicalProcessor {
  run(edges){const{adj,inDeg}=buildDAG(edges);const q=[];for(const[n,d]of inDeg)if(d===0)q.push(n);this.onStart();while(q.length){const n=q.shift();this.processNode(n);for(const nb of(adj.get(n)||[])){const nd=inDeg.get(nb)-1;inDeg.set(nb,nd);if(nd===0)q.push(nb)}}this.onDone()}
  onStart(){}
  onDone(){}
  processNode(node){throw new Error('override')}
}

// Enrollment simulator
class EnrollmentProcessor extends TopologicalProcessor {
  constructor(credits) { super(); this.credits=credits; this.enrolled=[]; this.totalCredits=0 }
  onStart() { console.log('--- Enrollment Plan ---') }

  processNode(course) {
    const cr = this.credits[course] || 3
    this.enrolled.push(course)
    this.totalCredits += cr
    console.log('enroll: ' + course + ' (' + cr + ' credits)')
  }

  onDone() {
    console.log('total credits: ' + this.totalCredits)
    console.log('enrollment order: ' + this.enrolled.join(' → '))
  }
}

const prereqs = [
  ['Algebra','Calculus'], ['Algebra','Stats'],
  ['Calculus','Physics'], ['Stats','DataScience'],
  ['Physics','Engineering'],
]

const credits = { Algebra:4, Calculus:4, Stats:3, Physics:4, DataScience:3, Engineering:3 }
new EnrollmentProcessor(credits).run(prereqs)`,
    },

    // ── Challenge 3: Combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Build a DependencyAuditProcessor that, for each node processed, logs "audit: <node>" and stores the node in an audited array. Override onDone() to log "Audit complete: N tasks audited" where N is the count. Use the build system dependencies: [["lint","test"],["lint","types"],["types","test"],["test","deploy"],["lint","deploy"]]. Log audit lines and the final summary.',
      expectedOutput: null,
      startCode: `function buildDAG(edges){const adj=new Map(),inDeg=new Map();for(const[f,t]of edges){if(!adj.has(f))adj.set(f,[]);if(!adj.has(t))adj.set(t,[]);if(!inDeg.has(f))inDeg.set(f,0);if(!inDeg.has(t))inDeg.set(t,0);adj.get(f).push(t);inDeg.set(t,inDeg.get(t)+1)}return{adj,inDeg}}

class TopologicalProcessor {
  run(edges){const{adj,inDeg}=buildDAG(edges);const q=[];for(const[n,d]of inDeg)if(d===0)q.push(n);this.onStart();while(q.length){const n=q.shift();this.processNode(n);for(const nb of(adj.get(n)||[])){const nd=inDeg.get(nb)-1;inDeg.set(nb,nd);if(nd===0)q.push(nb)}}this.onDone()}
  onStart(){}
  onDone(){}
  processNode(n){throw new Error('override')}
}

class DependencyAuditProcessor extends TopologicalProcessor {
  constructor() {
    super()
    this.audited = []
  }

  processNode(node) {
    // log 'audit: <node>' and push to this.audited
  }

  onDone() {
    // log 'Audit complete: N tasks audited'
  }
}

const build = [['lint','test'],['lint','types'],['types','test'],['test','deploy'],['lint','deploy']]
new DependencyAuditProcessor().run(build)`,
      hint: 'processNode: console.log("audit:", node); this.audited.push(node). onDone: console.log("Audit complete:", this.audited.length, "tasks audited").',
      validate: ({ logs }) => {
        const flat = logs.join(' ').toLowerCase()
        return flat.includes('audit') && flat.includes('deploy') && flat.includes('lint')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through Kahn\'s algorithm. Watch the inDeg Map: each node starts with its prerequisite count, and each time a node is processed, its successors\' in-degrees decrement. Watch the queue: when a node reaches 0, it joins the queue and becomes eligible for processing. See how the Template Method base class calls processNode at each step — the subclass behaviour runs inside the fixed skeleton.',
      code: `function buildDAG(edges) {
  const adj = new Map(), inDeg = new Map()
  for (const [f, t] of edges) {
    if (!adj.has(f)) adj.set(f, [])
    if (!adj.has(t)) adj.set(t, [])
    if (!inDeg.has(f)) inDeg.set(f, 0)
    if (!inDeg.has(t)) inDeg.set(t, 0)
    adj.get(f).push(t)
    inDeg.set(t, inDeg.get(t) + 1)
  }
  return { adj, inDeg }
}

class TopologicalProcessor {
  run(edges) {
    const { adj, inDeg } = buildDAG(edges)
    const queue = []
    for (const [n, d] of inDeg) if (d === 0) queue.push(n)
    while (queue.length) {
      const node = queue.shift()
      this.processNode(node)
      for (const nb of (adj.get(node) || [])) {
        const nd = inDeg.get(nb) - 1
        inDeg.set(nb, nd)
        if (nd === 0) queue.push(nb)
      }
    }
  }
  processNode(n) { console.log('process:', n) }
}

class LogProcessor extends TopologicalProcessor {
  processNode(n) { console.log('step:', n) }
}

new LogProcessor().run([['A','B'],['A','C'],['B','D'],['C','D']])`,
    },

    {
      type: 'codelens',
      id: 'cl-topo',
      text: 'Step through in CodeLens. Watch the inDeg Map values decrease as nodes are processed. See when a node\'s in-degree reaches 0 it joins the queue. Notice the Template Method: the base class run() calls this.processNode() — which executes the subclass override. The skeleton never changes; only processNode varies.',
      code: `function buildDAG(e){const a=new Map(),d=new Map();for(const[f,t]of e){if(!a.has(f))a.set(f,[]);if(!a.has(t))a.set(t,[]);if(!d.has(f))d.set(f,0);if(!d.has(t))d.set(t,0);a.get(f).push(t);d.set(t,d.get(t)+1)}return{adj:a,inDeg:d}}
class TP{run(edges){const{adj,inDeg}=buildDAG(edges);const q=[];for(const[n,d]of inDeg)if(d===0)q.push(n);while(q.length){const n=q.shift();this.processNode(n);for(const nb of(adj.get(n)||[])){const nd=inDeg.get(nb)-1;inDeg.set(nb,nd);if(nd===0)q.push(nb)}}}processNode(n){throw new Error('override')}}
class LP extends TP{processNode(n){console.log('step:',n)}}
new LP().run([['A','B'],['A','C'],['B','D'],['C','D']])`,
      lang: 'js',
    },

  ],
}
