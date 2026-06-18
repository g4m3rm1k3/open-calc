// SICP — JavaScript — Lesson 5.3
export const lesson = {
  id: 'sicp-5-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '5.3  Memory, Pairs, and Garbage Collection',
  checkpoints: [
    { id: 'cp-memory',         label: 'Memory Model' },
    { id: 'cp-pairs-as-vectors', label: 'Pairs as Vectors' },
    { id: 'cp-gc',             label: 'Garbage Collection' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — PAIRS IN MEMORY
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'We have been treating `cons`, `car`, and `cdr` as primitive operations — built in, magic. But in a real computer, pairs must live in memory. Memory is a flat array of numbers. How does a pair — a value with TWO parts — live in a flat array? And when pairs become unreachable (no variable points to them), how does the system reclaim their memory?\n\nThese are not academic questions. Memory management bugs — leaks, use-after-free, double-free — are responsible for more security vulnerabilities than any other single cause. The Heartbleed bug (2014), which exposed private keys of hundreds of thousands of HTTPS servers, was a buffer over-read — reading beyond the valid extent of allocated memory. The Log4Shell vulnerability (2021) caused unbounded object allocation. Understanding how memory works is the foundation of writing secure software.',
      code: null,
    },

    {
      type: 'narration',
      id: 'memory-as-arrays',
      text: 'The Lisp memory model, as described in SICP Chapter 5.3: use two parallel arrays called `the_heads` and `the_tails`. A pair is represented by a single integer — its INDEX. `the_heads[n]` holds the car of pair n. `the_tails[n]` holds the cdr of pair n.\n\n  cons(x, y): take the next free index, write x to heads and y to tails, return the index.\n  car(p): return the_heads[p]\n  cdr(p): return the_tails[p]\n\nThis is exactly how 1960s Lisp systems worked on real hardware. The IBM 704 — the machine Lisp was designed for — had native instructions to fetch the "address" and "decrement" fields of a machine word. That is where the names CAR (Contents of Address Register) and CDR (Contents of Decrement Register) come from.',
      code: `// The raw pair memory model
function make_memory(size) {
  const the_heads = new Array(size);
  const the_tails = new Array(size);
  let free = 0;   // next free index

  function cons(x, y) {
    if (free >= size) throw new Error('Out of memory');
    const idx = free;
    the_heads[idx] = x;
    the_tails[idx] = y;
    free++;
    return idx;
  }

  function car(p) { return the_heads[p]; }
  function cdr(p) { return the_tails[p]; }

  function show_memory() {
    for (let i = 0; i < free; i++) {
      console.log('  [' + i + '] heads=' + JSON.stringify(the_heads[i]) +
                        '  tails=' + JSON.stringify(the_tails[i]));
    }
  }

  return { cons, car, cdr, show_memory, get_free: () => free };
}

const mem = make_memory(10);
// cons(1, cons(2, cons(3, null)))
const p3 = mem.cons(3, null);
const p2 = mem.cons(2, p3);
const p1 = mem.cons(1, p2);
console.log('List head index:', p1);
console.log('car of list:', mem.car(p1));       // 1
console.log('cadr of list:', mem.car(mem.cdr(p1))); // 2
mem.show_memory();`,
    },

    {
      type: 'narration',
      id: 'values-tagged',
      text: 'But what IS the value stored in a memory cell? It might be a number, a boolean, a symbol (string), a pointer to another pair (an integer index), or the empty list (null). We need to distinguish these cases. We use TYPE TAGS.\n\nA tagged value is a small object: `{type: "number", val: 42}` or `{type: "pair", idx: 3}` or `{type: "null"}` or `{type: "bool", val: true}`.\n\n  is_pair(v): checks v.type === "pair"\n  is_null(v): checks v.type === "null"\n  is_number(v): checks v.type === "number"\n\nconsing stores tagged values; car and cdr return tagged values. The tag tells us how to interpret the value at the next step.',
      code: `// Tagged value system
const NULL  = { type: 'null' };
const TRUE  = { type: 'bool', val: true };
const FALSE = { type: 'bool', val: false };

function make_num(n)  { return { type: 'number', val: n }; }
function make_sym(s)  { return { type: 'symbol', val: s }; }
function make_ptr(i)  { return { type: 'pair',   idx: i }; }

function is_null(v)   { return v.type === 'null'; }
function is_pair(v)   { return v.type === 'pair'; }
function is_number(v) { return v.type === 'number'; }

// Build the list (1 2 3) with tagged values
function make_tagged_memory(size) {
  const heads = new Array(size);
  const tails = new Array(size);
  let free = 0;

  function cons(x, y) {
    const idx = free++;
    heads[idx] = x;
    tails[idx] = y;
    return make_ptr(idx);   // return a tagged pointer
  }
  function car(ptr) { return heads[ptr.idx]; }
  function cdr(ptr) { return tails[ptr.idx]; }

  return { cons, car, cdr, heads, tails, get_free: () => free };
}

const m = make_tagged_memory(10);
const list_1_2_3 = m.cons(make_num(1), m.cons(make_num(2), m.cons(make_num(3), NULL)));

console.log('list:', JSON.stringify(list_1_2_3));
console.log('car:', JSON.stringify(m.car(list_1_2_3)));       // {type:'number', val:1}
console.log('cadr:', JSON.stringify(m.car(m.cdr(list_1_2_3)))); // {type:'number', val:2}
console.log('free pointer after allocating 3 pairs:', m.get_free()); // 3`,
    },

    {
      type: 'narration',
      id: 'list-in-memory',
      text: 'Walk through building the list [1, 2, 3] step by step and examine the exact state of the heads and tails arrays:\n\n  Step 1: cons(3, NULL)  → index 0\n    heads[0] = {type:"number", val:3}\n    tails[0] = {type:"null"}\n\n  Step 2: cons(2, ptr(0)) → index 1\n    heads[1] = {type:"number", val:2}\n    tails[1] = {type:"pair", idx:0}\n\n  Step 3: cons(1, ptr(1)) → index 2\n    heads[2] = {type:"number", val:1}\n    tails[2] = {type:"pair", idx:1}\n\nThe "list" is just the pointer {type:"pair", idx:2}. Following the chain of tails: idx:2 → idx:1 → idx:0 → null. The data is stored backwards — innermost cons first.',
      code: `function make_tagged_memory(size) {
  const heads = new Array(size).fill(null);
  const tails = new Array(size).fill(null);
  let free = 0;
  const NULL_VAL = { type: 'null' };
  const cons = (x, y) => { const i = free++; heads[i] = x; tails[i] = y; return {type:'pair',idx:i}; };
  const car  = p => heads[p.idx];
  const cdr  = p => tails[p.idx];
  return { cons, car, cdr, heads, tails, get_free: () => free, NULL_VAL };
}

const m = make_tagged_memory(10);
const { cons, car, cdr, heads, tails, NULL_VAL } = m;
const n = v => ({ type: 'number', val: v });

const step1 = cons(n(3), NULL_VAL);   console.log('Step 1: cons(3, null) ->', JSON.stringify(step1));
const step2 = cons(n(2), step1);      console.log('Step 2: cons(2, ptr0) ->', JSON.stringify(step2));
const step3 = cons(n(1), step2);      console.log('Step 3: cons(1, ptr1) ->', JSON.stringify(step3));

console.log('\\nMemory layout:');
for (let i = 0; i < 3; i++) {
  console.log('  [' + i + '] head=' + JSON.stringify(heads[i]) + '  tail=' + JSON.stringify(tails[i]));
}

console.log('\\nTraversal:');
let p = step3;
while (!({ type: 'null' }[p.type])) {
  if (p.type !== 'pair') break;
  console.log(' ', car(p).val);
  p = cdr(p);
}`,
    },

    { type: 'checkpoint', id: 'cp-memory' },
    { type: 'checkpoint', id: 'cp-pairs-as-vectors' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — GARBAGE COLLECTION
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'reachability',
      text: 'When a variable goes out of scope or is reassigned, the pair it pointed to may become unreachable — no chain of pointers leads to it from any currently active variable. Unreachable pairs are garbage. They occupy memory slots but can never be read or written again by the running program.\n\nIf we never reclaim garbage, the free pointer advances forever until memory is exhausted. This is a MEMORY LEAK — the dreaded bug that causes programs to slow down and crash after running for a long time.\n\nHow do we find unreachable pairs? By finding all REACHABLE ones. Start from the roots — all live variables, the stack, the registers of the running evaluator. Follow every pair pointer. Mark what you find. Everything NOT marked is unreachable garbage. This is the fundamental insight of all garbage collectors.',
      code: null,
    },

    {
      type: 'narration',
      id: 'stop-and-copy',
      text: 'Stop-and-copy garbage collection, invented by Fenichel and Yochelson (1969) and simplified by Cheney (1970):\n\n  1. Divide memory into two halves: FROM-space (current live data) and TO-space (empty).\n  2. When FROM-space fills up, STOP the program.\n  3. COPY all reachable pairs from FROM-space to TO-space, starting from the roots.\n  4. Update all pointers to point to the new locations in TO-space.\n  5. Flip the roles: TO-space becomes the new FROM-space. The old FROM-space is entirely free.\n  6. Resume the program.\n\nAfter GC, all live pairs are packed together at the start of the new FROM-space. All garbage is simply ignored — no explicit free() calls needed. This compaction also improves cache performance because live data is contiguous.',
      code: null,
    },

    {
      type: 'narration',
      id: 'cheney-algorithm',
      text: 'The Cheney algorithm\'s elegance: it uses the TO-space itself as a work queue, needing only two extra pointers — `scan` and `free`.\n\nAlgorithm:\n  1. Copy all root objects into TO-space. Set free = number of objects copied. Set scan = 0.\n  2. While scan < free:\n     a. Look at the object at TO-space[scan].\n     b. For each pointer field in that object: if the referent has not been copied yet, copy it to TO-space[free] and advance free. Leave a FORWARDING POINTER in FROM-space so future references to the same object update to the new location.\n     c. Advance scan by 1.\n  3. When scan catches up to free, every reachable object has been processed. GC is complete.\n\nThe key insight: objects are used as their own queue entries. No separate queue data structure is needed.',
      code: `// Simplified Cheney GC on our pair memory
function cheney_gc(from_heads, from_tails, from_free, roots) {
  const HALF = from_heads.length;
  // to-space: fresh arrays
  const to_heads = new Array(HALF).fill(null);
  const to_tails = new Array(HALF).fill(null);
  const forwarding = new Array(HALF).fill(-1);  // from-index -> to-index

  let free = 0;   // next free slot in to-space
  let scan = 0;   // next unprocessed slot in to-space

  function copy(idx) {
    if (idx === null || idx < 0) return idx;     // not a pair pointer
    if (forwarding[idx] !== -1) return forwarding[idx]; // already copied
    // Copy to to-space
    const new_idx = free++;
    to_heads[new_idx] = from_heads[idx];
    to_tails[new_idx] = from_tails[idx];
    forwarding[idx] = new_idx;
    return new_idx;
  }

  // Step 1: copy roots
  const new_roots = roots.map(copy);

  // Step 2: scan loop — process each copied pair
  while (scan < free) {
    // Update head: if it is a pair pointer, forward it
    if (typeof to_heads[scan] === 'number' && to_heads[scan] >= 0) {
      to_heads[scan] = copy(to_heads[scan]);
    }
    if (typeof to_tails[scan] === 'number' && to_tails[scan] >= 0) {
      to_tails[scan] = copy(to_tails[scan]);
    }
    scan++;
  }

  console.log('GC: from_free was ' + from_free + ', to_free is ' + free);
  console.log('Garbage collected:', from_free - free, 'pairs');
  return { to_heads, to_tails, to_free: free, new_roots };
}

// Demo: 5 pairs allocated, only 3 reachable
const fh = [10, 20, 30, 40, 50];  // heads (numbers for simplicity)
const ft = [1,  2,  null, null, 3]; // tails (indices or null)
// Root: index 0 -> pair(10, 1) -> pair(20, 2) -> pair(30, null)
// Unreachable: indices 3, 4
const { to_free } = cheney_gc(fh, ft, 5, [0]);
// Expect to_free = 3 (indices 3 and 4 were garbage)`,
    },

    {
      type: 'narration',
      id: 'gc-tradeoffs',
      text: 'Comparing garbage collection strategies:\n\n  Stop-and-copy: uses 2× memory (two halves). Compacts live data — all live pairs are contiguous after GC, improving cache performance. Collection time is proportional to LIVE data only, not total allocated data. Weakness: needs 2× memory and must stop the program.\n\n  Mark-and-sweep: uses 1× memory. Mark phase: follow all pointers from roots, mark each reachable pair. Sweep phase: scan all pairs, free unmarked ones. Does not compact — fragmentation accumulates over time. Collection time proportional to TOTAL memory.\n\n  Generational GC: the key empirical observation is that "most objects die young." V8 (Chrome\'s JavaScript engine) divides memory into a "young generation" (small, collected frequently) and an "old generation" (large, collected rarely). Objects that survive young-generation GC are promoted to old. This gives the speed of stop-and-copy for young objects without paying the full cost for old objects. This is why JavaScript programs generally do not leak memory despite having no explicit free().',
      code: null,
    },

    { type: 'checkpoint', id: 'cp-gc' },

    {
      type: 'codelens',
      id: 'codelens-pairs',
      text: 'Step through building a 3-element list in the array memory model. Watch how the heads and tails arrays fill up one index at a time as each cons call fires. Watch the free pointer advance from 0 to 3. Notice that the LAST cons call produces the "root" pointer — index 2 — but the first pair allocated (index 0) holds the last element of the list.',
      code: `// Building [1, 2, 3] in array memory — watch heads, tails, free
const heads = [];
const tails = [];
let free = 0;

function cons(x, y) {
  const idx = free;
  heads[idx] = x;
  tails[idx] = y;
  free++;
  console.log('cons(' + x + ',' + y + ') -> idx=' + idx +
              '  free now=' + free);
  return idx;  // the pair index
}

// Build from inside out — innermost pair first
const p0 = cons(3, -1);    // 3 with null tail (-1 = null)
const p1 = cons(2, p0);    // 2 pointing to p0
const p2 = cons(1, p1);    // 1 pointing to p1

console.log('\\nMemory state:');
for (let i = 0; i <= 2; i++) {
  console.log('[' + i + '] head=' + heads[i] + '  tail=' + tails[i]);
}

console.log('\\nTraversal from root (idx=' + p2 + '):');
let cur = p2;
while (cur !== -1) {
  console.log('  head=' + heads[cur]);
  cur = tails[cur];
}`,
    },

    {
      type: 'codelens',
      id: 'codelens-gc',
      text: 'Step through a GC cycle. The FROM-space has 6 pairs. The roots point to 3 of them; the other 3 are garbage (unreachable). Watch as the copy function copies reachable pairs into TO-space and sets forwarding pointers. Watch unreachable pairs simply never be visited — they are silently abandoned. After GC, free=3 instead of 6.',
      code: `// GC trace — watch reachable pairs get copied, garbage get abandoned
const FROM_heads = [10, 20, 30, 99, 88, 77]; // 6 allocated pairs
const FROM_tails = [ 1,  2,  -1, -1, -1, -1]; // -1 = null/end

// Live chain: 0 -> 1 -> 2 -> null  (values 10, 20, 30)
// Garbage:    3, 4, 5                (never referenced)

const TO_heads = new Array(6).fill(null);
const TO_tails = new Array(6).fill(null);
const forwarding = new Array(6).fill(-1);
let to_free = 0, scan = 0;

function copy_idx(idx) {
  if (idx === -1) return -1;
  if (forwarding[idx] !== -1) {
    console.log('  already copied idx=' + idx + ' -> ' + forwarding[idx]);
    return forwarding[idx];
  }
  const new_i = to_free++;
  TO_heads[new_i] = FROM_heads[idx];
  TO_tails[new_i] = FROM_tails[idx];
  forwarding[idx] = new_i;
  console.log('  copy FROM[' + idx + '] -> TO[' + new_i + '] (val=' + FROM_heads[idx] + ')');
  return new_i;
}

// Copy root (idx=0)
const new_root = copy_idx(0);

// Scan loop
while (scan < to_free) {
  console.log('scan=' + scan + ' processing TO[' + scan + ']');
  TO_tails[scan] = copy_idx(TO_tails[scan]);
  scan++;
}

console.log('\\nGC complete. to_free=' + to_free + ' (was 6 in FROM-space)');
console.log('Garbage pairs 3,4,5 were never visited.');`,
    },

    {
      type: 'challenge',
      id: 'challenge-pairs',
      text: 'Implement the raw pair system using two arrays. Write cons, car, cdr, is_pair, and is_null using tagged values (objects with a `type` field). Build the list [1, 2, 3] and verify that car(cdr(list)) returns the number 2.',
      expectedOutput: '2\ntrue\ntrue',
      startCode: `// Implement the tagged-value pair system
const NULL_VAL = { type: 'null' };
const the_heads = new Array(100);
const the_tails = new Array(100);
let free_ptr = 0;

function make_num(n)  { return { type: 'number', val: n }; }
function make_ptr(i)  { return { type: 'pair',   idx: i }; }
function is_null(v)   { return v.type === 'null'; }
function is_pair(v)   { return v.type === 'pair'; }

function cons(x, y) {
  // allocate next free index, store x in heads and y in tails, return make_ptr(idx)
}

function car(p) {
  // return the head of pair p (p is a tagged pointer)
}

function cdr(p) {
  // return the tail of pair p
}

// Build list [1, 2, 3]
const list_123 = cons(make_num(1), cons(make_num(2), cons(make_num(3), NULL_VAL)));

console.log(car(cdr(list_123)).val);  // 2
console.log(is_pair(list_123));       // true
console.log(is_null(cdr(cdr(cdr(list_123))))); // true
`,
      hint: 'function cons(x, y) {\n  const idx = free_ptr++;\n  the_heads[idx] = x;\n  the_tails[idx] = y;\n  return make_ptr(idx);\n}\nfunction car(p) { return the_heads[p.idx]; }\nfunction cdr(p) { return the_tails[p.idx]; }',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn typeof cons === "function" && typeof car === "function" && typeof cdr === "function" && car(cdr(cons({type:"number",val:1}, cons({type:"number",val:2}, cons({type:"number",val:3}, {type:"null"}))))).val === 2')
          return fn() === true
        } catch { return false }
      },
    },

    {
      type: 'challenge',
      id: 'challenge-gc',
      text: 'Implement reachability analysis for the pair memory model. Given a set of root indices and the heads/tails arrays (where each entry is either a number or a pair index), return the Set of all reachable pair indices by following all pair pointers from the roots.',
      expectedOutput: '3\ntrue\nfalse',
      startCode: `// Reachability analysis: find all live pair indices
// A cell value is either: a number (leaf), -1 (null/end), or >=0 (pair index pointer)

function find_reachable(roots, heads, tails) {
  const visited = new Set();

  function visit(idx) {
    if (idx === null || idx === -1 || typeof idx !== 'number' || idx < 0) return;
    if (visited.has(idx)) return;
    visited.add(idx);
    // follow head pointer if it is a pair index
    visit(heads[idx]);
    // follow tail pointer if it is a pair index
    visit(tails[idx]);
  }

  // your implementation: call visit for each root
  // then return the visited set

}

// Memory: chain 0->1->2->null, plus garbage at 3,4
const heads = [10, 20, 30, 99, 88];
const tails = [ 1,  2,  -1, -1,  3];  // idx 4 points to idx 3 but nothing points to 4

const live = find_reachable([0], heads, tails);
console.log(live.size);          // 3  (indices 0,1,2 are live)
console.log(live.has(0));        // true
console.log(live.has(3));        // false (garbage)
`,
      hint: 'function find_reachable(roots, heads, tails) {\n  const visited = new Set();\n  function visit(idx) {\n    if (idx === null || idx < 0 || typeof idx !== "number") return;\n    if (visited.has(idx)) return;\n    visited.add(idx);\n    visit(heads[idx]);\n    visit(tails[idx]);\n  }\n  for (const r of roots) visit(r);\n  return visited;\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nconst heads=[10,20,30,99,88]; const tails=[1,2,-1,-1,3]; const live=find_reachable([0],heads,tails); return live.size===3 && live.has(0) && live.has(1) && live.has(2) && !live.has(3) && !live.has(4)')
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
