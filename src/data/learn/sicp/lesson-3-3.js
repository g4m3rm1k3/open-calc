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
      text: 'Chapter 3.1 introduced mutable variables. Chapter 3.3 extends mutation to the data structures themselves. Just as we can change a variable\'s binding, we can change the head or tail of a pair after it is created. This makes lists mutable — we can splice, remove, and rearrange without rebuilding the entire structure. SICP uses this to build queues, tables, and eventually a digital circuit simulator.',
      code: null,
    },

    // ── Terminology: Mutable Pairs ────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'mutable-pair-vocab',
      text: 'A mutable pair has two slots — head and tail — that can be changed in place. In Scheme, set_head! and set_tail! (with exclamation marks indicating mutation) change the slots of an existing pair. In JavaScript, we represent a mutable pair as an object with head and tail properties, which can be directly assigned. Mutation in place means the change is visible to all code that holds a reference to that pair — there is no new pair created.',
      code: null,
    },

    // ── 3.3.1  Mutable Pairs ─────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'mutable-pair-impl',
      text: 'Here is a mutable pair using objects. set_head and set_tail mutate the slots. This means a pair is no longer just data — it is an object with identity, and mutation is visible to everyone who holds a reference.',
      code: 'function m_pair(x, y) { return { head: x, tail: y }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\n\nconst p = m_pair(1, 2);\nconsole.log(m_head(p)); // 1\nset_head(p, 99);\nconsole.log(m_head(p)); // 99 — mutated in place\n\n// Aliasing: q and p refer to the SAME object\nconst q = p;\nset_head(q, 42);\nconsole.log(m_head(p)); // 42 — p also changed, because q IS p',
    },
    {
      type: 'checkpoint',
      id: 'cp-mutable-pairs',
    },

    // ── Queues ────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'queue-vocab',
      text: 'A queue is a FIFO (First In, First Out) data structure: items are added at the rear and removed from the front. Think of a checkout line — the first person in is the first person out. An efficient queue implementation needs O(1) enqueue and dequeue. We achieve this by maintaining two pointers: front-ptr points to the first pair in the list, rear-ptr points to the last. Enqueueing adds to the rear by mutating the last pair\'s tail. Dequeueing advances front-ptr.',
      code: null,
    },
    {
      type: 'narration',
      id: 'queue-impl',
      text: 'Here is the queue built from mutable pairs. The queue object holds front and rear pointers. Enqueue mutates the last pair\'s tail to point to the new item. Dequeue advances the front pointer.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\n\nfunction make_queue() {\n  return { front: null, rear: null };\n}\nfunction is_empty_queue(q) { return q.front === null; }\nfunction front_queue(q)    { return m_head(q.front); }\n\nfunction enqueue(q, item) {\n  const new_pair = m_pair(item, null);\n  if (is_empty_queue(q)) {\n    q.front = new_pair;\n    q.rear  = new_pair;\n  } else {\n    set_tail(q.rear, new_pair); // link old rear to new pair\n    q.rear = new_pair;          // advance rear pointer\n  }\n}\n\nfunction dequeue(q) {\n  if (is_empty_queue(q)) throw new Error(\'Queue is empty\');\n  const val = front_queue(q);\n  q.front = m_tail(q.front);  // advance front pointer\n  if (q.front === null) q.rear = null;\n  return val;\n}\n\nconst q = make_queue();\nenqueue(q, \'a\');\nenqueue(q, \'b\');\nenqueue(q, \'c\');\nconsole.log(dequeue(q)); // a\nconsole.log(dequeue(q)); // b\nenqueue(q, \'d\');\nconsole.log(dequeue(q)); // c\nconsole.log(dequeue(q)); // d',
    },
    {
      type: 'challenge',
      id: 'challenge-queue-size',
      text: 'Add a size operation to the queue. Write queue_to_array(q) that returns a JavaScript array of all items in the queue, front to back, without dequeuing them. Use it to check the contents. queue_to_array after enqueueing "x", "y", "z" should give ["x","y","z"].',
      expectedOutput: '["x","y","z"]\n["y","z"]',
      startCode: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\nfunction make_queue() { return { front: null, rear: null }; }\nfunction is_empty_queue(q) { return q.front === null; }\nfunction front_queue(q)    { return m_head(q.front); }\nfunction enqueue(q, item) {\n  const np = m_pair(item, null);\n  if (is_empty_queue(q)) { q.front = np; q.rear = np; }\n  else { set_tail(q.rear, np); q.rear = np; }\n}\nfunction dequeue(q) {\n  const val = front_queue(q);\n  q.front = m_tail(q.front);\n  if (q.front === null) q.rear = null;\n  return val;\n}\n\n// Write queue_to_array(q) — walk from front to rear\nfunction queue_to_array(q) {\n  // your code here\n}\n\nconst q = make_queue();\nenqueue(q, \'x\'); enqueue(q, \'y\'); enqueue(q, \'z\');\nconsole.log(JSON.stringify(queue_to_array(q))); // ["x","y","z"]\ndequeue(q);\nconsole.log(JSON.stringify(queue_to_array(q))); // ["y","z"]\n',
      hint: 'function queue_to_array(q) {\n  const result = [];\n  let cur = q.front;\n  while (cur !== null) { result.push(m_head(cur)); cur = m_tail(cur); }\n  return result;\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function m_pair(h,t){return{head:h,tail:t};}
function m_head(p){return p.head;}
function m_tail(p){return p.tail;}
function set_head(p,v){p.head=v;}
function set_tail(p,v){p.tail=v;}
function make_queue(){return{front:null,rear:null};}
function is_empty_queue(q){return q.front===null;}
function front_queue(q){return m_head(q.front);}
function enqueue(q,item){const np=m_pair(item,null);if(is_empty_queue(q)){q.front=np;q.rear=np;}else{set_tail(q.rear,np);q.rear=np;}}
function dequeue(q){const v=front_queue(q);q.front=m_tail(q.front);if(q.front===null)q.rear=null;return v;}
${code}
const q=make_queue();
enqueue(q,'x');enqueue(q,'y');enqueue(q,'z');
const a1=queue_to_array(q);
dequeue(q);
const a2=queue_to_array(q);
return typeof queue_to_array==='function'&&JSON.stringify(a1)==='["x","y","z"]'&&JSON.stringify(a2)==='["y","z"]'`)
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
      text: 'A table (or association list) maps keys to values. It is the programmatic equivalent of a dictionary or hash map — given a key, look up its value. SICP implements a one-dimensional table as a list of (key, value) pairs, with a special header node that is never a real entry. The header allows mutation of the table without returning a new structure: we just splice new pairs after the header.',
      code: null,
    },
    {
      type: 'narration',
      id: 'table-impl',
      text: 'Here is the table: a list whose head is a "header" sentinel, and whose tail is a chain of (key . value) records. lookup scans for a matching key. insert adds a new (key . value) record after the header if the key is not present, or updates the value if it is.',
      code: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\n\nfunction make_table() {\n  return m_pair(\'*table*\', null);  // header sentinel\n}\n\nfunction lookup(key, table) {\n  let record = m_tail(table);     // skip the header\n  while (record !== null) {\n    if (m_head(m_head(record)) === key) return m_tail(m_head(record));\n    record = m_tail(record);\n  }\n  return null;  // not found\n}\n\nfunction insert(key, value, table) {\n  let record = m_tail(table);\n  while (record !== null) {\n    if (m_head(m_head(record)) === key) {\n      set_tail(m_head(record), value); // update existing\n      return;\n    }\n    record = m_tail(record);\n  }\n  // not found — insert after header\n  set_tail(table, m_pair(m_pair(key, value), m_tail(table)));\n}\n\nconst t = make_table();\ninsert(\'name\',  \'Alice\', t);\ninsert(\'score\', 95,      t);\nconsole.log(lookup(\'name\',  t)); // Alice\nconsole.log(lookup(\'score\', t)); // 95\nconsole.log(lookup(\'age\',   t)); // null\n\ninsert(\'score\', 100, t);         // update\nconsole.log(lookup(\'score\', t)); // 100',
    },
    {
      type: 'challenge',
      id: 'challenge-2d-table',
      text: 'A 2D table maps (key1, key2) pairs to values. Build it as a table of tables: the outer table maps key1 to inner tables; each inner table maps key2 to values. Write lookup_2d(k1, k2, t) and insert_2d(k1, k2, val, t). insert_2d("math","score",95,t) then lookup_2d("math","score",t) should return 95.',
      expectedOutput: '95\nnull',
      startCode: 'function m_pair(h, t) { return { head: h, tail: t }; }\nfunction m_head(p) { return p.head; }\nfunction m_tail(p) { return p.tail; }\nfunction set_head(p, v) { p.head = v; }\nfunction set_tail(p, v) { p.tail = v; }\nfunction make_table() { return m_pair(\'*table*\', null); }\nfunction lookup(key, table) {\n  let r = m_tail(table);\n  while (r !== null) { if (m_head(m_head(r)) === key) return m_tail(m_head(r)); r = m_tail(r); }\n  return null;\n}\nfunction insert(key, value, table) {\n  let r = m_tail(table);\n  while (r !== null) { if (m_head(m_head(r)) === key) { set_tail(m_head(r), value); return; } r = m_tail(r); }\n  set_tail(table, m_pair(m_pair(key, value), m_tail(table)));\n}\n\n// lookup_2d: look up inner table for k1, then look up k2 in it\n// insert_2d: get or create inner table for k1, then insert k2→val\nfunction lookup_2d(k1, k2, t) {\n  // your code here\n}\nfunction insert_2d(k1, k2, val, t) {\n  // your code here\n}\n\nconst t = make_table();\ninsert_2d(\'math\', \'score\', 95, t);\nconsole.log(lookup_2d(\'math\', \'score\', t)); // 95\nconsole.log(lookup_2d(\'eng\',  \'score\', t)); // null\n',
      hint: 'function lookup_2d(k1, k2, t) {\n  const inner = lookup(k1, t);\n  return inner ? lookup(k2, inner) : null;\n}\nfunction insert_2d(k1, k2, val, t) {\n  let inner = lookup(k1, t);\n  if (!inner) { inner = make_table(); insert(k1, inner, t); }\n  insert(k2, val, inner);\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function m_pair(h,t){return{head:h,tail:t};}
function m_head(p){return p.head;}
function m_tail(p){return p.tail;}
function set_head(p,v){p.head=v;}
function set_tail(p,v){p.tail=v;}
function make_table(){return m_pair('*table*',null);}
function lookup(key,table){let r=m_tail(table);while(r!==null){if(m_head(m_head(r))===key)return m_tail(m_head(r));r=m_tail(r);}return null;}
function insert(key,value,table){let r=m_tail(table);while(r!==null){if(m_head(m_head(r))===key){set_tail(m_head(r),value);return;}r=m_tail(r);}set_tail(table,m_pair(m_pair(key,value),m_tail(table)));}
${code}
const t=make_table();
insert_2d('math','score',95,t);
return typeof lookup_2d==='function'&&typeof insert_2d==='function'&&lookup_2d('math','score',t)===95&&lookup_2d('eng','score',t)===null`)
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
