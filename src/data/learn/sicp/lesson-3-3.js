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

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Chapter 3.1 introduced mutable variables — let bindings whose values can change. Chapter 3.3 extends mutation to the data structures themselves. A pair built from const-like bindings is immutable: once created, its head and tail are fixed forever. But a pair built from let bindings can be changed in place. Mutating a pair means the change is visible to every reference to that pair — not just the variable that made the change. This in-place mutation is what makes queues, tables, and simulations efficient. It is also what makes shared mutable data dangerous.',
      code: null,
    },

    // ── Mutable pairs ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'mutable-pair-vocab',
      text: 'An immutable pair is a snapshot: its head and tail are fixed at creation. A mutable pair has two slots that can be updated independently after creation. In Scheme, set-car! and set-cdr! (the exclamation marks signal mutation) change the head and tail slots. In JavaScript we represent a mutable pair as a plain object with head and tail properties. JavaScript objects are always mutable: assigning p.head = x changes the same object that any other reference to p sees.',
      code: null,
    },
    {
      type: 'narration',
      id: 'mutable-pair-impl',
      text: 'Here are the mutable pair operations. m_pair creates an object. set_head and set_tail mutate its slots. Run it — after set_head(p, 99), the pair that q also points to has been changed.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\n\nconst p = m_pair(1, 2);\nconsole.log(m_head(p)); // 1\nset_head(p, 99);\nconsole.log(m_head(p)); // 99 — mutated in place',
    },
    {
      type: 'narration',
      id: 'aliasing-mutable',
      text: 'Aliasing with mutable pairs is particularly consequential. If q = p, then q IS p — they point to the same object. Mutating through q changes what p sees. This is the source of many bugs: code that "reads" p gets a value that was written by code operating on q. The mutation is non-local and invisible in the source.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction set_head(p, v) { p.head = v; }\n\nconst p = m_pair(10, 20);\nconst q = p;          // q is not a copy — it IS p\n\nset_head(q, 999);     // mutation through q\nconsole.log(m_head(p)); // 999 — p also changed — same object',
    },
    {
      type: 'challenge',
      id: 'challenge-swap',
      text: 'Using mutable pairs, write swap(p) that swaps the head and tail of a pair in place — modifying the original pair, not creating a new one. After swap(p), p.head should hold the old p.tail value and vice versa. swap(m_pair(1, 2)).head should be 2 and .tail should be 1.',
      expectedOutput: '2\n1',
      startCode: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\n\n// swap(p): exchanges head and tail in place\nfunction swap(p) {\n  // your code here\n}\n\nconst p = m_pair(1, 2);\nswap(p);\nconsole.log(m_head(p)); // 2\nconsole.log(m_tail(p)); // 1\n',
      hint: 'function swap(p) {\n  const old_head = m_head(p);\n  set_head(p, m_tail(p));\n  set_tail(p, old_head);\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst p=m_pair(1,2);swap(p);return p.head===2&&p.tail===1`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-mutable-pairs',
    },

    // ── Queues ────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'queue-vocab',
      text: 'A queue is a FIFO (First In, First Out) data structure. Items join at the rear and leave from the front — like a checkout line. The abstract interface is: make_queue, enqueue(q, item), dequeue(q), front_queue(q), is_empty_queue(q). The naive linked-list implementation would require scanning to the end for every enqueue — Θ(n). The O(1) trick: maintain two pointers, front-ptr and rear-ptr, directly to the first and last pairs. Enqueue adds at rear-ptr. Dequeue advances front-ptr. Both are constant time.',
      code: null,
    },
    {
      type: 'narration',
      id: 'queue-structure',
      text: 'A queue is an object with two slots: front and rear. When empty, both are null. enqueue creates a new pair, links it to the current rear via set_tail, and advances rear to the new pair. If the queue was empty, the new pair becomes both front and rear.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_tail(p, v) { p.tail = v; }\n\nfunction make_queue() { return { front: null, rear: null }; }\nfunction is_empty_queue(q) { return q.front === null; }\nfunction front_queue(q) { return m_head(q.front); }\n\nfunction enqueue(q, item) {\n  const new_pair = m_pair(item, null);\n  if (is_empty_queue(q)) {\n    q.front = new_pair;     // first item: front = rear = new_pair\n    q.rear  = new_pair;\n  } else {\n    set_tail(q.rear, new_pair); // link old rear to new pair\n    q.rear = new_pair;          // advance rear pointer\n  }\n}\n\nconst q = make_queue();\nenqueue(q, \'first\');\nenqueue(q, \'second\');\nconsole.log(front_queue(q)); // first',
    },
    {
      type: 'narration',
      id: 'dequeue-code',
      text: 'dequeue advances the front pointer. When the last element is removed, both front and rear are set to null so is_empty_queue is consistent.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_tail(p, v) { p.tail = v; }\nfunction make_queue() { return { front: null, rear: null }; }\nfunction is_empty_queue(q) { return q.front === null; }\nfunction front_queue(q) { return m_head(q.front); }\nfunction enqueue(q,item){\n  const np=m_pair(item,null);\n  if(is_empty_queue(q)){q.front=np;q.rear=np;}\n  else{set_tail(q.rear,np);q.rear=np;}\n}\n\nfunction dequeue(q) {\n  if (is_empty_queue(q)) throw new Error(\'Queue empty\');\n  const val = front_queue(q);\n  q.front = m_tail(q.front);           // advance front pointer\n  if (q.front === null) q.rear = null; // queue is now empty\n  return val;\n}\n\nconst q = make_queue();\nenqueue(q, \'a\'); enqueue(q, \'b\'); enqueue(q, \'c\');\nconsole.log(dequeue(q)); // a\nconsole.log(dequeue(q)); // b\nenqueue(q, \'d\');\nconsole.log(dequeue(q)); // c\nconsole.log(dequeue(q)); // d',
    },
    {
      type: 'challenge',
      id: 'challenge-queue-operations',
      text: 'Write queue_size(q) that returns the number of items currently in the queue without dequeuing any of them. Walk from front to rear and count. Then write queue_to_array(q) that returns a JavaScript array of all items, front first. Both should be non-destructive.',
      expectedOutput: '3\n["a","b","c"]\n2\n["a","b","c"]',
      startCode: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_tail(p, v) { p.tail = v; }\nfunction make_queue() { return { front: null, rear: null }; }\nfunction is_empty_queue(q) { return q.front === null; }\nfunction front_queue(q) { return m_head(q.front); }\nfunction enqueue(q,item){const np=m_pair(item,null);if(is_empty_queue(q)){q.front=np;q.rear=np;}else{set_tail(q.rear,np);q.rear=np;}}\nfunction dequeue(q){const v=front_queue(q);q.front=m_tail(q.front);if(q.front===null)q.rear=null;return v;}\n\n// Write queue_size(q) and queue_to_array(q)\nfunction queue_size(q) {\n  // your code here\n}\nfunction queue_to_array(q) {\n  // your code here\n}\n\nconst q = make_queue();\nenqueue(q, \'a\'); enqueue(q, \'b\'); enqueue(q, \'c\');\nconsole.log(queue_size(q));               // 3\nconsole.log(JSON.stringify(queue_to_array(q))); // ["a","b","c"]\ndequeue(q);\nconsole.log(queue_size(q));               // 2\nconsole.log(JSON.stringify(queue_to_array(q))); // ["a","b","c"] — wait, front was removed\n',
      hint: 'function queue_size(q) {\n  let count = 0, cur = q.front;\n  while (cur !== null) { count++; cur = m_tail(cur); }\n  return count;\n}\nfunction queue_to_array(q) {\n  const result = [];\n  let cur = q.front;\n  while (cur !== null) { result.push(m_head(cur)); cur = m_tail(cur); }\n  return result;\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function m_pair(h,t){return{head:h,tail:t};}function m_head(p){return p.head;}function m_tail(p){return p.tail;}
function set_tail(p,v){p.tail=v;}function make_queue(){return{front:null,rear:null};}
function is_empty_queue(q){return q.front===null;}function front_queue(q){return m_head(q.front);}
function enqueue(q,item){const np=m_pair(item,null);if(is_empty_queue(q)){q.front=np;q.rear=np;}else{set_tail(q.rear,np);q.rear=np;}}
function dequeue(q){const v=front_queue(q);q.front=m_tail(q.front);if(q.front===null)q.rear=null;return v;}
${code}
const q=make_queue();enqueue(q,'a');enqueue(q,'b');enqueue(q,'c');
const s1=queue_size(q);const a1=queue_to_array(q);
dequeue(q);
const s2=queue_size(q);
return typeof queue_size==='function'&&s1===3&&JSON.stringify(a1)==='["a","b","c"]'&&s2===2`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-queues',
    },

    // ── Tables ────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'table-vocab',
      text: 'A table maps keys to values. It is the programmatic equivalent of a dictionary: given a key, find its value. SICP builds a one-dimensional table as a mutable list with a special sentinel header node. The header allows mutation at the front of the list without requiring callers to update their reference to the table — the table object (the header) never moves, only the list behind it changes. lookup scans for a matching key. insert adds or updates a key-value record.',
      code: null,
    },
    {
      type: 'narration',
      id: 'table-structure-code',
      text: 'A table is a mutable pair chain. The head of each entry is itself a pair: (key . value). The table object is a sentinel pair whose head is the symbol "*table*" — it is never a real entry. This sentinel stays constant, so callers always hold a valid reference.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_tail(p, v) { p.tail = v; }\n\nfunction make_table() {\n  return m_pair(\'*table*\', null); // sentinel — never a real entry\n}\n\n// Each record is (key . value) in the tail chain\nconst t = make_table();\nconst record = m_pair(m_pair(\'name\', \'Alice\'), null);\nset_tail(t, record);\n\nconsole.log(m_head(m_head(m_tail(t)))); // name\nconsole.log(m_tail(m_head(m_tail(t)))); // Alice',
    },
    {
      type: 'narration',
      id: 'table-lookup-insert',
      text: 'lookup scans the chain looking for a matching key. insert walks first to find an existing entry (and updates it) or adds a new entry at the front after the sentinel.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\nfunction make_table() { return m_pair(\'*table*\', null); }\n\nfunction lookup(key, table) {\n  let record = m_tail(table);\n  while (record !== null) {\n    if (m_head(m_head(record)) === key) return m_tail(m_head(record));\n    record = m_tail(record);\n  }\n  return null;\n}\n\nfunction insert(key, value, table) {\n  let record = m_tail(table);\n  while (record !== null) {\n    if (m_head(m_head(record)) === key) {\n      set_tail(m_head(record), value); // update\n      return;\n    }\n    record = m_tail(record);\n  }\n  // not found — insert after header\n  set_tail(table, m_pair(m_pair(key, value), m_tail(table)));\n}\n\nconst t = make_table();\ninsert(\'name\',  \'Alice\', t);\ninsert(\'score\', 95, t);\nconsole.log(lookup(\'name\',  t)); // Alice\nconsole.log(lookup(\'score\', t)); // 95\nconsole.log(lookup(\'age\',   t)); // null\n\ninsert(\'score\', 100, t);         // update\nconsole.log(lookup(\'score\', t)); // 100',
    },
    {
      type: 'challenge',
      id: 'challenge-2d-table',
      text: 'A 2D table maps (key1, key2) pairs to values — a table of tables. lookup_2d(k1, k2, t) first finds the inner table for k1, then looks up k2 in it. insert_2d(k1, k2, val, t) gets or creates the inner table for k1, then inserts k2→val. insert_2d("math","score",95,t) then lookup_2d("math","score",t) should return 95.',
      expectedOutput: '95\nnull\n100',
      startCode: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\nfunction make_table() { return m_pair(\'*table*\', null); }\nfunction lookup(key, t) {\n  let r = m_tail(t);\n  while (r !== null) { if (m_head(m_head(r)) === key) return m_tail(m_head(r)); r = m_tail(r); }\n  return null;\n}\nfunction insert(key, val, t) {\n  let r = m_tail(t);\n  while (r !== null) { if (m_head(m_head(r)) === key) { set_tail(m_head(r), val); return; } r = m_tail(r); }\n  set_tail(t, m_pair(m_pair(key, val), m_tail(t)));\n}\n\n// Write lookup_2d and insert_2d\nfunction lookup_2d(k1, k2, t) {\n  // your code here\n}\nfunction insert_2d(k1, k2, val, t) {\n  // your code here\n}\n\nconst t = make_table();\ninsert_2d(\'math\', \'score\', 95, t);\nconsole.log(lookup_2d(\'math\', \'score\', t)); // 95\nconsole.log(lookup_2d(\'eng\',  \'score\', t)); // null\ninsert_2d(\'math\', \'score\', 100, t);          // update\nconsole.log(lookup_2d(\'math\', \'score\', t)); // 100\n',
      hint: 'function lookup_2d(k1, k2, t) {\n  const inner = lookup(k1, t);\n  return inner ? lookup(k2, inner) : null;\n}\nfunction insert_2d(k1, k2, val, t) {\n  let inner = lookup(k1, t);\n  if (!inner) { inner = make_table(); insert(k1, inner, t); }\n  insert(k2, val, inner);\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function m_pair(h,t){return{head:h,tail:t};}function m_head(p){return p.head;}function m_tail(p){return p.tail;}
function set_head(p,v){p.head=v;}function set_tail(p,v){p.tail=v;}
function make_table(){return m_pair('*table*',null);}
function lookup(key,t){let r=m_tail(t);while(r!==null){if(m_head(m_head(r))===key)return m_tail(m_head(r));r=m_tail(r);}return null;}
function insert(key,val,t){let r=m_tail(t);while(r!==null){if(m_head(m_head(r))===key){set_tail(m_head(r),val);return;}r=m_tail(r);}set_tail(t,m_pair(m_pair(key,val),m_tail(t)));}
${code}
const t=make_table();
insert_2d('math','score',95,t);
const r1=lookup_2d('math','score',t);
const r2=lookup_2d('eng','score',t);
insert_2d('math','score',100,t);
const r3=lookup_2d('math','score',t);
return typeof lookup_2d==='function'&&r1===95&&r2===null&&r3===100`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-tables',
    },
  ],
}
