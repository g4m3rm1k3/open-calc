// DSA + Design Patterns — Lesson 17
// Heaps + Observer Pattern

export const lesson = {
  id: 'dsa-patterns-17',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '17. Heaps + Observer',
  checkpoints: [
    { id: 'cp-heap',     label: 'Min-Heap' },
    { id: 'cp-pq',       label: 'Priority Queue' },
    { id: 'cp-observer', label: 'Observer Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Sometimes you need to always know the minimum (or maximum) value in a collection, and that minimum changes as items are added and removed. A regular array requires O(n) to find the minimum — you must check every item. A sorted array gives you O(1) minimum but O(n) insert. A heap gives you both: O(log n) insert AND O(1) to see the minimum. O(log n) means cost grows by one step each time the input doubles — a tree of 1 million items needs at most 20 steps. A heap is a complete binary tree with one rule: every parent is less than or equal to both its children (in a min-heap). The root is always the smallest item. Hospital triage queues, operating system task schedulers, and Dijkstra\'s shortest-path algorithm all use heaps.',
      code: null,
    },

    // ── Step 1: Array representation ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-array-rep',
      text: 'A complete binary tree is a binary tree where every level is fully filled except possibly the last, and the last level is filled from left to right. This specific shape means we can store the tree in a plain array without any node objects or references (variables that store memory addresses — covered in the References lesson). The root is at index 0. For any node at index i: its left child is at 2*i + 1, its right child is at 2*i + 2, and its parent is at Math.floor((i-1)/2). These three formulas replace pointers entirely. This is the most memory-efficient tree representation possible.',
      code: `// A complete binary tree stored in an array
// Index relationships — no pointers needed
function parent(i)     { return Math.floor((i - 1) / 2) }
function leftChild(i)  { return 2 * i + 1 }
function rightChild(i) { return 2 * i + 2 }

//        1        ← index 0
//      /   \\
//     3     5     ← indices 1, 2
//    / \\   /
//   8   6 9       ← indices 3, 4, 5

const heap = [1, 3, 5, 8, 6, 9]

console.log('root:',          heap[0])                // 1
console.log('root left:',     heap[leftChild(0)])      // 3
console.log('root right:',    heap[rightChild(0)])     // 5
console.log('parent of 6:',   heap[parent(4)])         // 3
console.log('parent of root:',parent(0))               // 0 (itself — no parent)`,
    },

    // ── Step 2: The heap property — heapify up ────────────────────────────────

    {
      type: 'narration',
      id: 'step2-heapify-up',
      text: 'In a min-heap, every parent must be smaller than or equal to its children. When you insert a new value, add it at the end of the array (to keep the complete tree shape). Then restore the heap property by "bubbling up": compare the new value with its parent. If the new value is smaller, swap them. Repeat until the new value is in the right place or reaches the root. This takes at most O(log n) steps — the height of the tree.',
      code: `function parent(i)    { return Math.floor((i - 1) / 2) }
function leftChild(i) { return 2 * i + 1 }
function rightChild(i){ return 2 * i + 2 }

function createMinHeap() {
  const data = []

  function heapifyUp(i) {
    while (i > 0) {
      const p = parent(i)
      if (data[p] <= data[i]) break   // parent is already smaller — done
      // Swap parent and child
      ;[data[p], data[i]] = [data[i], data[p]]
      i = p   // move up to check the parent's position
    }
  }

  return {
    insert(value) {
      data.push(value)          // add at end — keeps complete tree shape
      heapifyUp(data.length - 1) // restore heap property
    },

    peek() { return data[0] },   // minimum — always at root — O(1)
    size() { return data.length },
    toArray() { return [...data] },
  }
}

const heap = createMinHeap()
heap.insert(10)
heap.insert(3)    // 3 < 10, bubbles up to root
heap.insert(7)
heap.insert(1)    // 1 < 3, bubbles all the way up

console.log('min:', heap.peek())       // 1
console.log('array:', heap.toArray())  // heap order, not sorted order`,
    },

    // ── Step 3: extractMin — heapify down ────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-heapify-down',
      text: 'Extracting the minimum (the root) is more complex. You cannot just remove the root and leave a hole. Instead: move the last element in the array to the root position (to keep the complete tree shape), remove the last element, then "sink down" the new root. Compare it with both children and swap with the smaller child if needed. Repeat until the value is in the right place or reaches a leaf. Also O(log n) — the height of the tree.',
      code: `function parent(i)    { return Math.floor((i - 1) / 2) }
function leftChild(i) { return 2 * i + 1 }
function rightChild(i){ return 2 * i + 2 }

function createMinHeap() {
  const data = []

  function heapifyUp(i) {
    while(i > 0){ const p=parent(i); if(data[p]<=data[i]) break; [data[p],data[i]]=[data[i],data[p]]; i=p }
  }

  function heapifyDown(i) {
    const n = data.length
    while (true) {
      let smallest = i
      const l = leftChild(i)
      const r = rightChild(i)

      // Find the smallest among current, left child, right child
      if (l < n && data[l] < data[smallest]) smallest = l
      if (r < n && data[r] < data[smallest]) smallest = r

      if (smallest === i) break   // already in right place

      ;[data[smallest], data[i]] = [data[i], data[smallest]]
      i = smallest   // continue sinking down
    }
  }

  return {
    insert(value) { data.push(value); heapifyUp(data.length - 1) },
    peek() { return data[0] },
    size() { return data.length },

    // Step 3: extractMin — remove and return the smallest value
    extractMin() {
      if (data.length === 0) return undefined
      const min = data[0]
      const last = data.pop()         // remove last element
      if (data.length > 0) {
        data[0] = last                // place last at root
        heapifyDown(0)                // restore heap property
      }
      return min
    },
  }
}

const heap = createMinHeap()
;[5, 3, 8, 1, 7, 2].forEach(v => heap.insert(v))

console.log(heap.extractMin())   // 1 — smallest
console.log(heap.extractMin())   // 2 — next smallest
console.log(heap.extractMin())   // 3
console.log(heap.peek())         // 5 — current min after three extractions`,
    },

    {
      type: 'challenge',
      id: 'ch-heap',
      text: 'Use the min-heap to implement heap sort: insert all values from an unsorted array, then extract them one by one. Since extractMin always returns the smallest remaining value, you get a sorted array. Sort [9, 3, 7, 1, 5, 8, 2, 4, 6]. Log the result.',
      expectedOutput: null,
      startCode: `function parent(i)    { return Math.floor((i-1)/2) }
function leftChild(i) { return 2*i+1 }
function rightChild(i){ return 2*i+2 }

function createMinHeap() {
  const data = []
  function up(i){ while(i>0){ const p=parent(i); if(data[p]<=data[i]) break; [data[p],data[i]]=[data[i],data[p]]; i=p } }
  function down(i){ const n=data.length; while(true){ let s=i; const l=leftChild(i),r=rightChild(i); if(l<n&&data[l]<data[s])s=l; if(r<n&&data[r]<data[s])s=r; if(s===i)break; [data[s],data[i]]=[data[i],data[s]]; i=s } }
  return {
    insert(v){ data.push(v); up(data.length-1) },
    extractMin(){ if(!data.length) return undefined; const m=data[0]; const l=data.pop(); if(data.length){ data[0]=l; down(0) } return m },
    size(){ return data.length },
  }
}

const unsorted = [9, 3, 7, 1, 5, 8, 2, 4, 6]
const heap = createMinHeap()

// insert all values, then extract them all into a sorted array
const sorted = []
// ...

console.log(sorted)`,
      hint: 'unsorted.forEach(v => heap.insert(v)). Then while(heap.size() > 0) sorted.push(heap.extractMin()).',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('1') && flat.includes('9') && flat.indexOf('1') < flat.indexOf('9')
      },
    },

    { type: 'checkpoint', id: 'cp-heap' },

    // ── Step 4: Priority Queue ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-priority-queue',
      text: 'A priority queue is a queue where each item has a priority, and dequeue always gives you the item with the highest priority (or lowest number, if lower number means higher priority). A heap is the natural implementation. Wrap the min-heap in a priority queue interface: enqueue takes a value and a priority number, stores them as a pair, and heaps on the priority. Dequeue extracts the pair with the lowest priority number and returns its value.',
      code: `function parent(i)    { return Math.floor((i-1)/2) }
function leftChild(i) { return 2*i+1 }
function rightChild(i){ return 2*i+2 }

function createMinHeap() {
  const data = []
  function up(i){ while(i>0){ const p=parent(i); if(data[p][0]<=data[i][0]) break; [data[p],data[i]]=[data[i],data[p]]; i=p } }
  function down(i){ const n=data.length; while(true){ let s=i; const l=leftChild(i),r=rightChild(i); if(l<n&&data[l][0]<data[s][0])s=l; if(r<n&&data[r][0]<data[s][0])s=r; if(s===i)break; [data[s],data[i]]=[data[i],data[s]]; i=s } }
  return {
    insert(v){ data.push(v); up(data.length-1) },
    extractMin(){ if(!data.length)return undefined; const m=data[0]; const l=data.pop(); if(data.length){data[0]=l;down(0)} return m },
    peek(){ return data[0] },
    size(){ return data.length },
  }
}

// Priority Queue wraps the heap — enqueue/dequeue interface
function createPriorityQueue() {
  const heap = createMinHeap()

  return {
    // enqueue: priority 1 = highest priority
    enqueue(value, priority) {
      heap.insert([priority, value])   // store [priority, value] pair
    },

    dequeue() {
      const pair = heap.extractMin()
      return pair ? pair[1] : undefined   // return just the value
    },

    peek() {
      const pair = heap.peek()
      return pair ? pair[1] : undefined
    },

    size() { return heap.size() },
  }
}

const pq = createPriorityQueue()
pq.enqueue('routine check',    3)
pq.enqueue('broken arm',       2)
pq.enqueue('chest pain',       1)   // highest priority
pq.enqueue('minor cut',        4)

console.log('next:', pq.dequeue())   // chest pain — priority 1
console.log('next:', pq.dequeue())   // broken arm  — priority 2
console.log('next:', pq.dequeue())   // routine check`,
    },

    {
      type: 'challenge',
      id: 'ch-pq',
      text: 'Build a task scheduler using the priority queue. Add five tasks with different priorities: "send email" (3), "fix critical bug" (1), "write docs" (5), "code review" (2), "deploy" (4). Dequeue all tasks in priority order and log each one.',
      expectedOutput: null,
      startCode: `function parent(i)    { return Math.floor((i-1)/2) }
function leftChild(i) { return 2*i+1 }
function rightChild(i){ return 2*i+2 }
function createMinHeap() {
  const d=[]
  function up(i){ while(i>0){const p=parent(i); if(d[p][0]<=d[i][0])break; [d[p],d[i]]=[d[i],d[p]]; i=p} }
  function down(i){ const n=d.length; while(true){let s=i; const l=leftChild(i),r=rightChild(i); if(l<n&&d[l][0]<d[s][0])s=l; if(r<n&&d[r][0]<d[s][0])s=r; if(s===i)break; [d[s],d[i]]=[d[i],d[s]]; i=s} }
  return { insert(v){d.push(v);up(d.length-1)}, extractMin(){if(!d.length)return; const m=d[0]; const l=d.pop(); if(d.length){d[0]=l;down(0)} return m}, size(){return d.length} }
}
function createPriorityQueue() {
  const h = createMinHeap()
  return { enqueue(v,p){h.insert([p,v])}, dequeue(){const p=h.extractMin(); return p?p[1]:undefined}, size(){return h.size()} }
}

const pq = createPriorityQueue()
// add the five tasks
// dequeue all and log each`,
      hint: 'while (pq.size() > 0) console.log(pq.dequeue())',
      validate: ({ logs }) => {
        const flat = logs.join('\n').toLowerCase()
        return flat.includes('critical bug') && flat.indexOf('critical bug') < flat.indexOf('write docs')
      },
    },

    { type: 'checkpoint', id: 'cp-pq' },

    // ── Step 5: Observer Pattern ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-observer-problem',
      text: 'The Observer pattern solves the coupling problem in event-driven systems. When one object changes, other objects need to react. Without a pattern, the changed object directly calls every other object — it needs a reference to all of them. This means the changed object must know about everything that cares about it. Add a new listener and you must change the source. The Observer pattern breaks this: the source emits events; listeners subscribe. The source does not know who is listening.',
      code: `// Without Observer: direct coupling
function createPriorityQueue() {
  const items = []
  let dashboard = null   // must hold a direct reference
  let logger    = null

  return {
    enqueue(task, priority) {
      items.push({ task, priority })
      items.sort((a, b) => a.priority - b.priority)

      // Directly calling every listener — fragile and coupled
      if (dashboard) dashboard.update(items[0])
      if (logger)    logger.log('new task added')
    },
    setDashboard(d) { dashboard = d },
    setLogger(l)    { logger = l },
  }
}
// Problem: to add a third listener you must edit the queue code.
// The queue should not know about dashboards or loggers.`,
    },

    // ── Step 6: EventEmitter ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-emitter',
      text: 'Build an EventEmitter — the foundation of the Observer pattern. on(event, listener) registers a function to be called when that event fires. emit(event, data) calls all registered listeners for that event, passing them the data. The emitter holds a map of event names to arrays of listeners. The source of the event calls emit(); it has no idea how many listeners there are or what they do. Listeners subscribe and unsubscribe without the source knowing.',
      code: `// EventEmitter — the Observer pattern's core mechanism
function createEventEmitter() {
  const listeners = new Map()   // event name → array of callback functions

  return {
    // Register a listener for an event
    on(event, listener) {
      if (!listeners.has(event)) listeners.set(event, [])
      listeners.get(event).push(listener)
    },

    // Remove a specific listener
    off(event, listener) {
      if (!listeners.has(event)) return
      const updated = listeners.get(event).filter(l => l !== listener)
      listeners.set(event, updated)
    },

    // Fire all listeners for an event
    emit(event, data) {
      if (!listeners.has(event)) return
      for (const listener of listeners.get(event)) {
        listener(data)
      }
    },
  }
}

const emitter = createEventEmitter()

// Subscribe — the emitter does not know who this is
emitter.on('update', data => console.log('Dashboard:', data))
emitter.on('update', data => console.log('Logger: change at', data.time))

// Emit — the source does not know how many listeners exist
emitter.emit('update', { value: 42, time: '10:00' })
emitter.emit('update', { value: 17, time: '10:01' })`,
    },

    {
      type: 'narration',
      id: 'step7-observer-together',
      text: 'Add the EventEmitter to the priority queue. The queue emits "enqueue" when a task is added and "dequeue" when one is removed. Any code that cares about these events subscribes. The priority queue does not import, reference, or know about any of its listeners. This is loose coupling: modules that need to interact do so through events, not direct references. This is how Node.js streams, browser DOM events, React state updates, and most real-world frameworks work.',
      code: `function createEventEmitter() {
  const listeners = new Map()
  return {
    on(e,l){ if(!listeners.has(e))listeners.set(e,[]); listeners.get(e).push(l) },
    emit(e,d){ if(listeners.has(e)) for(const l of listeners.get(e)) l(d) },
  }
}

function parent(i)    { return Math.floor((i-1)/2) }
function leftChild(i) { return 2*i+1 }
function rightChild(i){ return 2*i+2 }
function createMinHeap() {
  const d=[]
  function up(i){ while(i>0){const p=parent(i);if(d[p][0]<=d[i][0])break;[d[p],d[i]]=[d[i],d[p]];i=p} }
  function down(i){ const n=d.length; while(true){let s=i;const l=leftChild(i),r=rightChild(i);if(l<n&&d[l][0]<d[s][0])s=l;if(r<n&&d[r][0]<d[s][0])s=r;if(s===i)break;[d[s],d[i]]=[d[i],d[s]];i=s} }
  return { insert(v){d.push(v);up(d.length-1)}, extractMin(){if(!d.length)return; const m=d[0];const l=d.pop();if(d.length){d[0]=l;down(0)}return m}, peek(){return d[0]}, size(){return d.length} }
}

function createPriorityQueue() {
  const heap    = createMinHeap()
  const emitter = createEventEmitter()

  return {
    on(event, listener) { emitter.on(event, listener) },   // expose subscribe

    enqueue(value, priority) {
      heap.insert([priority, value])
      emitter.emit('enqueue', { value, priority, queueSize: heap.size() })
    },

    dequeue() {
      const pair = heap.extractMin()
      if (!pair) return undefined
      emitter.emit('dequeue', { value: pair[1], priority: pair[0] })
      return pair[1]
    },

    size() { return heap.size() },
  }
}

const pq = createPriorityQueue()

// Two independent observers — pq has no idea they exist
pq.on('enqueue', e => console.log(\`[LOG] Added: \${e.value} (priority \${e.priority})\`))
pq.on('dequeue', e => console.log(\`[DONE] Completed: \${e.value}\`))

pq.enqueue('fix bug',    1)
pq.enqueue('write docs', 3)
pq.enqueue('code review',2)

pq.dequeue()   // fix bug — logs DONE event
pq.dequeue()   // code review`,
    },

    {
      type: 'challenge',
      id: 'ch-observer',
      text: 'Add a third observer to the priority queue: a "stats" observer that counts total enqueues and total dequeues and logs a report when either exceeds 3. Subscribe it using pq.on("enqueue", ...) and pq.on("dequeue", ...). Add 5 tasks, dequeue 4, and confirm the stats observer fires.',
      expectedOutput: null,
      startCode: `// (full pq implementation provided)
function createEventEmitter() {
  const ls = new Map()
  return { on(e,l){if(!ls.has(e))ls.set(e,[]);ls.get(e).push(l)}, emit(e,d){if(ls.has(e))for(const l of ls.get(e))l(d)} }
}
function parent(i){return Math.floor((i-1)/2)} function leftChild(i){return 2*i+1} function rightChild(i){return 2*i+2}
function createMinHeap(){const d=[];function up(i){while(i>0){const p=parent(i);if(d[p][0]<=d[i][0])break;[d[p],d[i]]=[d[i],d[p]];i=p}}function down(i){const n=d.length;while(true){let s=i;const l=leftChild(i),r=rightChild(i);if(l<n&&d[l][0]<d[s][0])s=l;if(r<n&&d[r][0]<d[s][0])s=r;if(s===i)break;[d[s],d[i]]=[d[i],d[s]];i=s}}return{insert(v){d.push(v);up(d.length-1)},extractMin(){if(!d.length)return;const m=d[0];const l=d.pop();if(d.length){d[0]=l;down(0)}return m},size(){return d.length}}}
function createPriorityQueue(){const h=createMinHeap(),e=createEventEmitter();return{on(ev,l){e.on(ev,l)},enqueue(v,p){h.insert([p,v]);e.emit('enqueue',{value:v,priority:p})},dequeue(){const p=h.extractMin();if(!p)return;e.emit('dequeue',{value:p[1]});return p[1]},size(){return h.size()}}}

const pq = createPriorityQueue()

// Add stats observer here
const stats = { enqueues: 0, dequeues: 0 }
pq.on('enqueue', () => { stats.enqueues++; if(stats.enqueues > 3) console.log('Stats: enqueues =', stats.enqueues) })
// add dequeue observer too

pq.enqueue('a',1); pq.enqueue('b',2); pq.enqueue('c',3); pq.enqueue('d',4); pq.enqueue('e',5)
pq.dequeue(); pq.dequeue(); pq.dequeue(); pq.dequeue()`,
      hint: 'pq.on("dequeue", () => { stats.dequeues++; if(stats.dequeues > 3) console.log("Stats: dequeues =", stats.dequeues) })',
      validate: ({ logs }) => logs.some(l => String(l).toLowerCase().includes('stats')),
    },

    { type: 'checkpoint', id: 'cp-observer' },

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens and step through the heap insert sequence. Watch the data array after each insert. See heapifyUp swap values as a small number bubbles to the root. Then watch extractMin move the last element to position 0, then sink it down with heapifyDown. The array shape changes but the heap property is always restored.',
      code: `function parent(i)    { return Math.floor((i-1)/2) }
function leftChild(i) { return 2*i+1 }
function rightChild(i){ return 2*i+2 }

function createMinHeap() {
  const data = []
  function heapifyUp(i) {
    while (i > 0) {
      const p = parent(i)
      if (data[p] <= data[i]) break
      ;[data[p], data[i]] = [data[i], data[p]]
      i = p
    }
  }
  function heapifyDown(i) {
    const n = data.length
    while (true) {
      let s = i
      const l = leftChild(i), r = rightChild(i)
      if (l < n && data[l] < data[s]) s = l
      if (r < n && data[r] < data[s]) s = r
      if (s === i) break
      ;[data[s], data[i]] = [data[i], data[s]]
      i = s
    }
  }
  return {
    insert(v)     { data.push(v); heapifyUp(data.length - 1) },
    extractMin()  { if (!data.length) return; const m=data[0]; const l=data.pop(); if(data.length){data[0]=l;heapifyDown(0)} return m },
    peek()        { return data[0] },
  }
}

const h = createMinHeap()
;[5, 3, 8, 1, 7].forEach(v => h.insert(v))
console.log('min:', h.peek())
console.log(h.extractMin(), h.extractMin(), h.extractMin())`,
    },

    {
      type: 'codelens',
      id: 'cl-heap',
      text: 'Step through in CodeLens. Watch the data array as each insert calls heapifyUp. See the while loop swap values when a child is smaller than its parent. Then watch extractMin: see the last element moved to index 0 and heapifyDown compare it with both children repeatedly.',
      code: `function parent(i){return Math.floor((i-1)/2)} function leftChild(i){return 2*i+1} function rightChild(i){return 2*i+2}
function createMinHeap(){
  const data=[]
  function up(i){while(i>0){const p=parent(i);if(data[p]<=data[i])break;[data[p],data[i]]=[data[i],data[p]];i=p}}
  function down(i){const n=data.length;while(true){let s=i;const l=leftChild(i),r=rightChild(i);if(l<n&&data[l]<data[s])s=l;if(r<n&&data[r]<data[s])s=r;if(s===i)break;[data[s],data[i]]=[data[i],data[s]];i=s}}
  return{insert(v){data.push(v);up(data.length-1)},extractMin(){if(!data.length)return;const m=data[0];const l=data.pop();if(data.length){data[0]=l;down(0)}return m},peek(){return data[0]}}
}
const h=createMinHeap()
;[5,3,8,1,7].forEach(v=>h.insert(v))
console.log(h.peek())
console.log(h.extractMin())
console.log(h.extractMin())`,
      lang: 'js',
    },

  ],
}
