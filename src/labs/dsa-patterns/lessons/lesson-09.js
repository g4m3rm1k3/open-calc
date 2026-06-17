// DSA + Design Patterns — Lesson 09
// Queue + Chain of Responsibility

export const lesson = {
  id: 'dsa-patterns-09',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '9. Queue + Chain of Responsibility',
  checkpoints: [
    { id: 'cp-queue',   label: 'Queue' },
    { id: 'cp-chain',   label: 'Chain of Responsibility' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'An HTTP request arrives at your server. Before it reaches your application code, it needs to pass through authentication — is this user logged in? Then authorization — are they allowed to do this? Then rate limiting — have they sent too many requests this minute? Then input validation — is the request body well-formed? Each of these is a separate concern. Each one can reject the request. Each one can pass it to the next. The request travels through a sequence of handlers, each making an independent decision. Separately: your server receives thousands of requests. They need to be processed in the order they arrived — first in, first out. Not priority order, not random order. Arrival order. These two problems — ordered arrival and sequential decision-making — share a structure that appears in middleware systems, event loops, command queues, and approval pipelines everywhere.',
      code: null,
    },

    // ── Step 1: Queue fundamentals ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-queue',
      text: 'A queue is a linear data structure — a sequence of elements — with one rule: items enter at the back and leave from the front. FIFO: First In, First Out. The first item added is the first item removed. Like a line of people waiting: the person who arrived first is served first. Two operations define a queue: enqueue — add to the back, and dequeue — remove from the front. Both must be efficient. The problem with using a plain array is that dequeue (array.shift()) is O(n) — removing the first element requires shifting every remaining element one position to the left. For a queue processing thousands of items, this adds up.',
      code: `// The problem: array.shift() is O(n)
const queue = []

queue.push('a')    // enqueue: O(1) amortised
queue.push('b')
queue.push('c')

console.log(queue.shift())  // 'a' — dequeue: O(n) — all remaining elements shift
console.log(queue.shift())  // 'b' — O(n) again
console.log(queue)           // ['c']

// For a queue processing 10,000 items:
// 10,000 dequeue calls × O(n) = O(n²) total — too slow for high-throughput systems`,
    },

    // ── Step 2: Queue with a linked list ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-linked-queue',
      text: 'A linked list solves the O(n) dequeue problem. Recap from the Linked Lists lesson: a singly linked list has a head (first node) and, if we maintain a tail reference, adding to the back is O(1) — just update the tail\'s next and move tail. Removing from the front is O(1) — just move head forward. No elements shift. No copying. Both enqueue and dequeue are O(1).',
      code: `class QueueNode {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedQueue {
  constructor() {
    this.head = null   // front: items are dequeued from here
    this.tail = null   // back: items are enqueued here
    this.size = 0
  }

  enqueue(value) {                 // ← NEW: add to back — O(1)
    const node = new QueueNode(value)
    if (this.tail === null) {
      this.head = node
      this.tail = node
    } else {
      this.tail.next = node        // old tail points to new node
      this.tail = node             // tail moves to new node
    }
    this.size++
  }

  dequeue() {                      // ← NEW: remove from front — O(1)
    if (this.head === null) return null
    const value   = this.head.value
    this.head     = this.head.next  // head moves forward — one reference update
    if (this.head === null) this.tail = null  // list is now empty
    this.size--
    return value
  }

  peek() { return this.head ? this.head.value : null }
}

const q = new LinkedQueue()
q.enqueue('a'); q.enqueue('b'); q.enqueue('c')

console.log(q.dequeue())  // 'a' — O(1)
console.log(q.dequeue())  // 'b' — O(1)
console.log(q.peek())     // 'c' — still in queue
console.log(q.size)       // 1`,
    },

    // ── Step 3: Circular buffer ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-circular',
      text: 'A circular buffer — also called a ring buffer — is an alternative queue implementation that uses a fixed-size array. Instead of shifting elements, two indices track the front (where to dequeue) and back (where to enqueue). When an index reaches the end of the array, it wraps around to the beginning using the modulo operator (% capacity). This is called a circular buffer because conceptually the array\'s end connects to its beginning, forming a ring. Both enqueue and dequeue are O(1). The tradeoff: a fixed maximum capacity — you must decide the size upfront.',
      code: `class CircularQueue {
  constructor(capacity) {
    this.data     = new Array(capacity)
    this.capacity = capacity
    this.front    = 0      // index of next item to dequeue
    this.back     = 0      // index where next item will be enqueued
    this.size     = 0
  }

  enqueue(value) {
    if (this.size === this.capacity) throw new Error('Queue full')
    this.data[this.back] = value
    this.back = (this.back + 1) % this.capacity   // wrap around
    this.size++
  }

  dequeue() {
    if (this.size === 0) return null
    const value  = this.data[this.front]
    this.front   = (this.front + 1) % this.capacity   // wrap around
    this.size--
    return value
  }
}

const q = new CircularQueue(4)
q.enqueue('a'); q.enqueue('b'); q.enqueue('c')

console.log(q.dequeue())  // 'a' — front wraps forward
q.enqueue('d')
q.enqueue('e')            // slots reused at the start of the array

console.log(q.dequeue())  // 'b'
console.log(q.dequeue())  // 'c'
console.log(q.dequeue())  // 'd'
console.log(q.dequeue())  // 'e'`,
    },

    // ── Challenge: queue ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-queue',
      text: 'Complete the LinkedQueue below by adding a toArray() method that returns all queue elements in order from front to back, without modifying the queue. Do not use dequeue(). Walk from this.head to null following next references and collect each value. Test: enqueue 10, 20, 30. Call toArray(). Log the result as a joined string ("10,20,30"). Then dequeue once and call toArray() again — log the result ("20,30").',
      expectedOutput: null,
      startCode: `class QueueNode { constructor(v) { this.value = v; this.next = null } }

class LinkedQueue {
  constructor() { this.head = null; this.tail = null; this.size = 0 }

  enqueue(value) {
    const n = new QueueNode(value)
    if (!this.tail) { this.head = n; this.tail = n }
    else { this.tail.next = n; this.tail = n }
    this.size++
  }

  dequeue() {
    if (!this.head) return null
    const v = this.head.value
    this.head = this.head.next
    if (!this.head) this.tail = null
    this.size--
    return v
  }

  toArray() {
    // walk from this.head, collect values, return array
  }
}

const q = new LinkedQueue()
q.enqueue(10); q.enqueue(20); q.enqueue(30)

console.log(q.toArray().join(','))  // '10,20,30'
q.dequeue()
console.log(q.toArray().join(','))  // '20,30'`,
      hint: 'const result = []; let cur = this.head; while (cur !== null) { result.push(cur.value); cur = cur.next; } return result',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs.includes('10,20,30') && strs.includes('20,30')
      },
    },

    { type: 'checkpoint', id: 'cp-queue' },

    // ── Step 4: Chain of Responsibility intro ─────────────────────────────────

    {
      type: 'narration',
      id: 'step4-chain-intro',
      text: 'The Chain of Responsibility pattern organises a set of handlers into a sequence — a chain. A request is passed to the first handler. Each handler makes a decision: handle the request and stop, or pass it to the next handler. No single handler needs to know who else is in the chain. The handler only knows its own logic and a reference to the next handler. This means: adding a new step, removing a step, or reordering steps does not require changing any existing handler — just change how the chain is assembled. HTTP middleware is Chain of Responsibility. Express.js\'s app.use() stack is a chain. Unix pipe commands are a chain.',
      code: null,
    },

    // ── Step 5: Handler base ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-handler-base',
      text: 'Build the handler foundation. Each handler has a setNext(handler) method to wire the next handler in the chain, and a handle(request) method that either processes the request or passes it forward.',
      code: `class Handler {
  constructor(name) {
    this.name = name
    this.next = null    // reference to the next handler in the chain
  }

  setNext(handler) {   // ← NEW: wire the chain
    this.next = handler
    return handler     // return handler to allow chaining: a.setNext(b).setNext(c)
  }

  handle(request) {    // ← NEW: subclasses override this
    if (this.next !== null) return this.next.handle(request)
    return null  // end of chain — no handler processed the request
  }
}

// Demonstrate chaining
const a = new Handler('A')
const b = new Handler('B')
const c = new Handler('C')

a.setNext(b).setNext(c)   // A → B → C

// Without any overrides, request passes through all handlers and returns null
console.log(a.handle({ type: 'test' }))`,
    },

    // ── Step 6: Concrete handlers ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-concrete-handlers',
      text: 'Add concrete handlers. Each one checks whether the request is its responsibility. If yes, it handles it and returns. If no, it calls super.handle() to pass the request to the next handler in the chain.',
      code: `class Handler {
  constructor(name) { this.name = name; this.next = null }
  setNext(h) { this.next = h; return h }
  handle(req) { if (this.next) return this.next.handle(req); return null }
}

class AuthHandler extends Handler {
  constructor() { super('Auth') }
  handle(req) {
    if (!req.token) {
      console.log('[Auth] REJECTED — no token')
      return { error: 'Unauthorized', status: 401 }
    }
    console.log('[Auth] passed')
    return super.handle(req)   // pass to next handler
  }
}

class RateLimitHandler extends Handler {
  constructor(limit) { super('RateLimit'); this.limit = limit; this.counts = {} }
  handle(req) {
    this.counts[req.token] = (this.counts[req.token] || 0) + 1
    if (this.counts[req.token] > this.limit) {
      console.log('[RateLimit] REJECTED — too many requests from', req.token)
      return { error: 'Too Many Requests', status: 429 }
    }
    console.log('[RateLimit] passed')
    return super.handle(req)
  }
}

class ValidationHandler extends Handler {
  constructor() { super('Validation') }
  handle(req) {
    if (!req.body || !req.body.name) {
      console.log('[Validation] REJECTED — missing name')
      return { error: 'Bad Request', status: 400 }
    }
    console.log('[Validation] passed')
    return { success: true, data: req.body }
  }
}

// Assemble the chain
const auth      = new AuthHandler()
const rateLimit = new RateLimitHandler(2)
const validate  = new ValidationHandler()

auth.setNext(rateLimit).setNext(validate)

// Test requests
console.log('\\n--- valid request ---')
console.log(auth.handle({ token: 'abc', body: { name: 'Alice' } }))

console.log('\\n--- no token ---')
console.log(auth.handle({ body: { name: 'Bob' } }))

console.log('\\n--- rate limited ---')
auth.handle({ token: 'abc', body: { name: 'Carol' } })
console.log(auth.handle({ token: 'abc', body: { name: 'Dave' } }))`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-meeting',
      text: 'This is where the two ideas meet. A queue orders requests for processing: they arrive and wait their turn. A Chain of Responsibility processes each request through a sequence of handlers. Put them together and you have the core of every real-world request processing system: requests queue up (FIFO, O(1) enqueue and dequeue), then each dequeued request travels through a handler chain where each step can reject, transform, or pass it forward. The queue is the waiting room. The chain is the processing pipeline. Every HTTP server, every message broker, every approval workflow is this pattern.',
      code: null,
    },

    // ── Challenge: chain ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-chain',
      text: 'Write a LoggingHandler class that extends the Handler base class below. Its handle(req) method must: (1) log "processing request: <req.id>", (2) call super.handle(req), (3) log "done: <req.id>", and (4) return the result from super.handle(req). Write a DoubleHandler class whose handle(req) returns { result: req.value * 2 } without passing to the next handler. Chain them: LoggingHandler → DoubleHandler. Pass { id: "req1", value: 5 }. The log should show "processing request: req1", then "done: req1". The returned result.result should be 10.',
      expectedOutput: null,
      startCode: `class Handler {
  constructor() { this.next = null }
  setNext(h) { this.next = h; return h }
  handle(req) { if (this.next) return this.next.handle(req); return null }
}

class LoggingHandler extends Handler {
  handle(req) {
    // log, call super.handle(req), log done, return result
  }
}

class DoubleHandler extends Handler {
  handle(req) {
    // return { result: req.value * 2 } — do not call super
  }
}

const logger = new LoggingHandler()
const doubler = new DoubleHandler()
logger.setNext(doubler)

const response = logger.handle({ id: 'req1', value: 5 })
console.log(response.result)  // 10`,
      hint: 'LoggingHandler: console.log("processing request:", req.id); const result = super.handle(req); console.log("done:", req.id); return result',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('10') && flat.includes('req1') && flat.toLowerCase().includes('processing')
      },
    },

    { type: 'checkpoint', id: 'cp-chain' },

    // ── Step 8: Combined ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'Build a request processing pipeline: a queue holds incoming requests, a worker dequeues them one at a time and passes each through a handler chain. This is the exact architecture of Express.js, Koa, and most backend frameworks. Requests queue up, the event loop dequeues them, middleware processes each one in sequence.',
      code: `// Queue implementation
class QN { constructor(v) { this.v = v; this.next = null } }
class Queue {
  constructor() { this.head = null; this.tail = null; this.size = 0 }
  enqueue(v) { const n = new QN(v); if (!this.tail) { this.head=n; this.tail=n } else { this.tail.next=n; this.tail=n }; this.size++ }
  dequeue()  { if (!this.head) return null; const v=this.head.v; this.head=this.head.next; if (!this.head) this.tail=null; this.size--; return v }
}

// Handler chain
class H { constructor() { this.next=null } setNext(h) { this.next=h; return h } handle(r) { return this.next?.handle(r) ?? null } }

class AuthH extends H {
  handle(r) { if (!r.token) return { err: 401 }; return super.handle(r) }
}
class ProcessH extends H {
  handle(r) { return { ok: true, data: r.body, user: r.token } }
}

// Pipeline: queue + chain
const requestQueue = new Queue()
const auth    = new AuthH()
const process = new ProcessH()
auth.setNext(process)

// Enqueue requests
requestQueue.enqueue({ id: 1, token: 'user-abc', body: 'hello' })
requestQueue.enqueue({ id: 2, token: null,       body: 'world' })  // will fail auth
requestQueue.enqueue({ id: 3, token: 'user-xyz', body: 'test' })

// Process queue
while (requestQueue.size > 0) {
  const req = requestQueue.dequeue()
  const res = auth.handle(req)
  console.log('req', req.id, '→', res.ok ? 'OK: ' + req.body : 'ERR: ' + res.err)
}`,
    },

    // ── Challenge: combined ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Extend the pipeline below: add a third handler called UpperCaseHandler that converts req.body to uppercase before passing to the next handler. Insert it between AuthH and ProcessH. Enqueue these requests: { token: "a", body: "hello" }, { token: null, body: "fail" }, { token: "b", body: "world" }. For each, dequeue and process. Log the result body for each — the valid ones should be uppercase ("HELLO", "WORLD") and the invalid one should show an error.',
      expectedOutput: null,
      startCode: `class H { constructor() { this.next=null } setNext(h){this.next=h;return h} handle(r){return this.next?.handle(r)??null} }
class AuthH extends H { handle(r) { if(!r.token) return {err:'Unauthorized'}; return super.handle(r) } }
class ProcessH extends H { handle(r) { return { ok:true, body:r.body } } }

class UpperCaseHandler extends H {
  handle(req) {
    // create a modified request with req.body uppercased, pass to next
  }
}

class QN{constructor(v){this.v=v;this.next=null}}
class Queue{constructor(){this.head=null;this.tail=null;this.size=0}enqueue(v){const n=new QN(v);if(!this.tail){this.head=n;this.tail=n}else{this.tail.next=n;this.tail=n}this.size++}dequeue(){if(!this.head)return null;const v=this.head.v;this.head=this.head.next;if(!this.head)this.tail=null;this.size--;return v}}

const auth   = new AuthH()
const upper  = new UpperCaseHandler()
const proc   = new ProcessH()
auth.setNext(upper).setNext(proc)

const q = new Queue()
q.enqueue({ token: 'a', body: 'hello' })
q.enqueue({ token: null, body: 'fail' })
q.enqueue({ token: 'b', body: 'world' })

while (q.size > 0) {
  const req = q.dequeue()
  const res = auth.handle(req)
  console.log(res.ok ? res.body : res.err)
}`,
      hint: 'UpperCaseHandler.handle: const modified = { ...req, body: req.body.toUpperCase() }; return super.handle(modified)',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs.includes('HELLO') && strs.includes('WORLD') && strs.some(s => s.includes('Unauthorized') || s.includes('401'))
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through enqueue() calls first. Watch the Variables panel as head and tail update with each node added. The tail reference always points to the last node; each new node becomes the new tail. Then step through the handler chain: watch the request travel from auth to rateLimit. When auth decides to pass the request on, watch super.handle(req) call the next handler. If a handler rejects, the call stack unwinds — no further handlers are called.',
      code: `class QN { constructor(v) { this.v = v; this.next = null } }
class Q {
  constructor() { this.head = null; this.tail = null }
  enqueue(v) {
    const n = new QN(v)
    if (!this.tail) { this.head = n; this.tail = n }
    else { this.tail.next = n; this.tail = n }
  }
  dequeue() {
    if (!this.head) return null
    const v = this.head.v
    this.head = this.head.next
    if (!this.head) this.tail = null
    return v
  }
}

class H { constructor(){this.next=null} setNext(h){this.next=h;return h} handle(r){return this.next?.handle(r)??{passed:false}} }
class AuthH extends H { handle(r) { if(!r.tok) { console.log('auth fail'); return {ok:false} }; console.log('auth ok'); return super.handle(r) } }
class EndH  extends H { handle(r) { console.log('handled:', r.data); return {ok:true} } }

const auth = new AuthH()
auth.setNext(new EndH())

const q = new Q()
q.enqueue({ tok: 'abc', data: 'hello' })
q.enqueue({ tok: null,  data: 'world' })

while (true) {
  const item = q.dequeue()
  if (!item) break
  const res = auth.handle(item)
  console.log('result ok:', res.ok)
}`,
    },

    {
      type: 'codelens',
      id: 'cl-queue-chain',
      text: `Step through enqueue({ tok: "abc", ... }). Variables: this.tail goes from null to the new node. this.head also points to it (first item).

Step through enqueue({ tok: null, ... }). Variables: this.tail.next gets the new node, then this.tail moves to it. head is unchanged — still the first node.

Step into auth.handle(req) for the first item. tok is "abc" — truthy. Logs "auth ok". Calls super.handle(req) → EndH.handle(). Logs "handled: hello". Returns { ok: true }.

Step into auth.handle(req) for the second item. tok is null — falsy. Logs "auth fail". Returns { ok: false } immediately. EndH is never reached.`,
      code: `class H{constructor(){this.next=null}setNext(h){this.next=h;return h}handle(r){return this.next?.handle(r)??{ok:false}}}
class AuthH extends H{handle(r){if(!r.tok){console.log('auth fail');return{ok:false}}console.log('auth ok');return super.handle(r)}}
class EndH extends H{handle(r){console.log('handled:',r.data);return{ok:true}}}
const auth=new AuthH();auth.setNext(new EndH())
const reqs=[{tok:'abc',data:'hello'},{tok:null,data:'world'}]
for(const r of reqs){const res=auth.handle(r);console.log('ok:',res.ok)}`,
      lang: 'js',
    },

  ],
}
