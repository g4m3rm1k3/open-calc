export const lesson = {
  id: 'sicp-3-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '3.3  Mutable Data, Queues, and Tables',
  checkpoints: [
    { id: 'cp-mutable-pairs', label: 'Mutable Pairs' },
    { id: 'cp-queues',        label: 'Queues' },
    { id: 'cp-tables',        label: 'Tables' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'Lessons 3.1 and 3.2 introduced mutable variable bindings. Chapter 3.3 extends mutation to the data structures themselves.\n\nIn all of Chapter 2, once a pair was created its contents were fixed: head(pair(1,2)) always returns 1 forever. Mutable pairs can be changed AFTER creation — the change is visible through every reference to that pair. This makes certain algorithms dramatically more efficient (O(1) queue operations instead of O(n)), but introduces the aliasing problems that make shared mutable state hard to reason about.',
      code: null,
    },

    // ── Mutable pairs ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'mutable-pair-vocab',
      text: 'An immutable pair is a snapshot — fixed at creation. A mutable pair has slots that can be updated. Scheme uses set-car! and set-cdr! (the ! marks mutation). In JavaScript, we represent a mutable pair as an object with head and tail fields. Objects in JavaScript are always mutable — assigning p.head = x changes the same object that every other reference to p sees.',
      code: null,
    },
    {
      type: 'narration',
      id: 'mutable-pair-impl',
      text: 'Here are the mutable pair operations.',
      code: `function m_pair(x, y)       { return { head: x, tail: y }; }
function m_head(p)          { return p.head; }
function m_tail(p)          { return p.tail; }
function set_head(p, value) { p.head = value; }
function set_tail(p, value) { p.tail = value; }`,
    },
    {
      type: 'narration',
      id: 'mutable-pair-aliasing',
      text: 'Aliasing: two names pointing to the same pair. Setting head through one name changes what the other name sees. This is the key difference from immutable data — the "object" has an identity that persists across changes.',
      code: `function m_pair(x, y)       { return { head: x, tail: y }; }
function m_head(p)          { return p.head; }
function m_tail(p)          { return p.tail; }
function set_head(p, value) { p.head = value; }

const p = m_pair(1, 2);
const q = p;            // q is an ALIAS for p — same object

console.log(m_head(q)); // 1  — same as m_head(p)

set_head(p, 99);        // mutate through p

console.log(m_head(q)); // 99 — q sees the change!
console.log(m_head(p)); // 99 — of course`,
    },
    {
      type: 'narration',
      id: 'mutable-append-vs-append-bang',
      text: 'append creates a new list without touching the originals. An in-place version (append!) modifies the last pair of the first list to point to the second list. If any other name points to a pair in the first list, the change is visible through that name too.',
      code: `function m_pair(x, y)       { return { head: x, tail: y }; }
function m_head(p)          { return p.head; }
function m_tail(p)          { return p.tail; }
function set_tail(p, value) { p.tail = value; }
function is_null(x)         { return x === null; }

// Pure append (creates new structure, originals unchanged)
function append(lst1, lst2) {
  if (is_null(lst1)) return lst2;
  return m_pair(m_head(lst1), append(m_tail(lst1), lst2));
}

// Destructive append! (mutates last pair of lst1)
function append_d(lst1, lst2) {
  if (is_null(m_tail(lst1)))
    set_tail(lst1, lst2);           // link last node to lst2
  else
    append_d(m_tail(lst1), lst2);  // recurse to find last node
}

const a = m_pair(1, m_pair(2, null));
const b = m_pair(3, m_pair(4, null));

append_d(a, b);  // a now ends with → b's first pair

console.log(m_head(m_tail(m_tail(a))));  // 3 — a now includes b's elements`,
    },
    { type: 'checkpoint', id: 'cp-mutable-pairs' },

    // ── Queue ─────────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'queue-vocab',
      text: 'A queue is a first-in-first-out (FIFO) sequence. Elements are added at the rear and removed from the front. With immutable lists, enqueuing is O(1) but dequeuing requires scanning to the front after building from the rear — or vice versa. With a front pointer and a rear pointer into a mutable list, BOTH operations are O(1).\n\nThe trick: maintain two pointers. The front pointer points to the first element. The rear pointer points to the last. Enqueue adds to the rear in O(1). Dequeue moves the front pointer in O(1).',
      code: null,
    },
    {
      type: 'narration',
      id: 'queue-make',
      text: 'A queue is a pair of pointers: [front, rear]. Initially both are null.',
      code: `function make_queue()     { return { front: null, rear: null }; }
function front_queue(q)   { return q.front; }
function empty_queue(q)   { return q.front === null; }`,
    },
    {
      type: 'narration',
      id: 'queue-enqueue',
      text: 'Enqueue: add a new pair at the rear. If the queue was empty, the new pair is both front and rear.',
      code: `function make_queue()     { return { front: null, rear: null }; }
function front_queue(q)   { return q.front; }
function empty_queue(q)   { return q.front === null; }

function enqueue(q, item) {
  const new_pair = { head: item, tail: null };
  if (empty_queue(q)) {
    q.front = new_pair;
    q.rear  = new_pair;
  } else {
    q.rear.tail = new_pair;   // link old rear to new node
    q.rear = new_pair;        // advance rear pointer
  }
}`,
    },
    {
      type: 'narration',
      id: 'queue-dequeue',
      text: 'Dequeue: return the front item and advance the front pointer.',
      code: `function make_queue()     { return { front: null, rear: null }; }
function front_queue(q)   { return q.front ? q.front.head : null; }
function empty_queue(q)   { return q.front === null; }
function enqueue(q, item) {
  const n = { head: item, tail: null };
  if (empty_queue(q)) { q.front = n; q.rear = n; }
  else { q.rear.tail = n; q.rear = n; }
}

function dequeue(q) {
  if (empty_queue(q)) throw new Error('Empty queue');
  const item = q.front.head;
  q.front = q.front.tail;   // advance front pointer
  if (q.front === null) q.rear = null;  // queue is now empty
  return item;
}`,
    },
    {
      type: 'narration',
      id: 'queue-test',
      text: 'Use the queue. All operations are O(1) regardless of queue size.',
      code: `function make_queue()     { return { front: null, rear: null }; }
function empty_queue(q)   { return q.front === null; }
function front_queue(q)   { return q.front ? q.front.head : null; }
function enqueue(q, item) {
  const n = {head:item,tail:null};
  if(empty_queue(q)){q.front=n;q.rear=n;}else{q.rear.tail=n;q.rear=n;}
}
function dequeue(q) {
  const item = q.front.head;
  q.front = q.front.tail;
  if(!q.front) q.rear=null;
  return item;
}

const q = make_queue();
enqueue(q, 'a');
enqueue(q, 'b');
enqueue(q, 'c');

console.log(front_queue(q)); // a
console.log(dequeue(q));     // a — removed
console.log(front_queue(q)); // b
console.log(dequeue(q));     // b
console.log(dequeue(q));     // c`,
    },
    { type: 'checkpoint', id: 'cp-queues' },

    // ── Tables ────────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'table-intro',
      text: 'A table is a mutable associative data structure: a mapping from keys to values supporting lookup and insertion. We saw tables implicitly in the data-directed programming dispatch table of Chapter 2.4. Here we build one explicitly as a mutable list of key-value pairs.',
      code: null,
    },
    {
      type: 'narration',
      id: 'table-make',
      text: 'A table is a list of [key, value] pairs with a special header node. The header (a "dummy" pair) makes insertion O(1) by giving us a place to prepend without changing the table\'s top-level reference.',
      code: `function make_table() { return { head: '*table*', tail: null }; }`,
    },
    {
      type: 'narration',
      id: 'table-lookup',
      text: 'Lookup: scan the list for a matching key. Return the value or null if not found.',
      code: `function make_table()   { return { head: '*table*', tail: null }; }

function lookup(key, table) {
  let record = table.tail;
  while (record !== null) {
    if (record.head.key === key) return record.head.value;
    record = record.tail;
  }
  return null;
}`,
    },
    {
      type: 'narration',
      id: 'table-insert',
      text: 'Insert: scan for an existing key — if found, update; if not found, prepend a new record.',
      code: `function make_table()   { return { head: '*table*', tail: null }; }
function lookup(key, table) {
  let r = table.tail;
  while (r) { if (r.head.key === key) return r.head.value; r = r.tail; }
  return null;
}

function insert(key, value, table) {
  let r = table.tail;
  while (r) {
    if (r.head.key === key) { r.head.value = value; return; }  // update
    r = r.tail;
  }
  table.tail = { head: { key, value }, tail: table.tail };     // prepend new
}`,
    },
    {
      type: 'narration',
      id: 'table-test',
      text: 'Test the table. A memoization cache is the natural first application.',
      code: `function make_table()   { return { head: '*table*', tail: null }; }
function lookup(key, table) {
  let r = table.tail;
  while (r) { if (r.head.key === key) return r.head.value; r = r.tail; }
  return null;
}
function insert(key, value, table) {
  let r = table.tail;
  while (r) { if (r.head.key === key) { r.head.value = value; return; } r = r.tail; }
  table.tail = { head: { key, value }, tail: table.tail };
}

const t = make_table();
insert('x', 42, t);
insert('y', 99, t);

console.log(lookup('x', t));   // 42
console.log(lookup('y', t));   // 99
console.log(lookup('z', t));   // null

insert('x', 100, t);           // update existing key
console.log(lookup('x', t));   // 100`,
    },
    {
      type: 'codelens',
      id: 'codelens-table',
      text: 'Open CodeLens on a table with several inserts followed by a lookup. Watch the heap — the table is a linked list of {key, value} records. Each insert prepends a new record. Lookup traverses the chain. The table is a mutable data structure: you can see the tail pointers change with each insertion.',
      code: `function make_table() { return { head: '*table*', tail: null }; }
function lookup(key, t) { let r=t.tail; while(r){if(r.head.key===key)return r.head.value;r=r.tail;} return null; }
function insert(key, val, t) { t.tail = { head:{key,value:val}, tail:t.tail }; }
const t = make_table();
insert('a', 1, t);
insert('b', 2, t);
console.log(lookup('a', t));`,
    },
    { type: 'checkpoint', id: 'cp-tables' },

    {
      type: 'challenge',
      id: 'challenge-memoize',
      text: 'Write memoize(f) using a table. The first time f is called with argument x, compute and cache the result. Subsequent calls with the same x return the cached value. Use a call counter to verify that the underlying function is only called once per unique argument.',
      expectedOutput: '25\n25\ncalls to sqrt: 1',
      startCode: `function make_table() { return { head: '*table*', tail: null }; }
function lookup(key, t) { let r=t.tail; while(r){if(r.head.key===key)return r.head.value;r=r.tail;} return null; }
function insert(key, val, t) { t.tail = { head:{key,value:val}, tail:t.tail }; }

function memoize(f) {
  const cache = make_table();
  return function(x) {
    const cached = lookup(x, cache);
    if (cached !== null) return cached;
    // call f(x), cache the result, return it
  };
}

let sqrt_calls = 0;
function tracked_sqrt(x) { sqrt_calls++; return Math.sqrt(x); }

const mem_sqrt = memoize(tracked_sqrt);

console.log(mem_sqrt(625));  // 25 — calls tracked_sqrt
console.log(mem_sqrt(625));  // 25 — from cache
console.log('calls to sqrt: ' + sqrt_calls);  // 1
`,
      hint: 'const result = f(x);\ninsert(x, result, cache);\nreturn result;',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn sqrt_calls === 1`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
