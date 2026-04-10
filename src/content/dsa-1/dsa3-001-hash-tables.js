export default {
  id: 'dsa3-001',
  slug: 'hash-tables',
  chapter: 'dsa3',
  order: 1,
  title: 'Hash Tables',
  subtitle: 'The data structure that makes O(1) lookup possible. Build a hash table from scratch — hash function, buckets, and all — and understand why it\'s the most useful structure in all of programming.',
  tags: ['hash table', 'hash function', 'bucket', 'key-value', 'O(1)', 'lookup', 'collision', 'chaining', 'load factor'],
  aliases: 'hash table hash map dictionary hash function bucket collision chaining O(1) lookup',

  hook: {
    question: 'Arrays give you O(1) access by index. But what if you want O(1) access by any key — a string, an ID, a name?',
    realWorldContext: 'Hash tables power Python dicts, JavaScript objects, database indexes, DNS lookups, caches, and compilers. When Python looks up a variable name, it\'s doing a hash table lookup. When your browser caches a web page, it\'s using a hash. When a database finds a row without scanning every row, it\'s using a hash index. The hash table is the most used data structure in real software after the array.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You\'ve built every linear structure and mastered recursion. Now the question is: can we do better than O(n) search? An array gives O(1) access by position — but you need to know the index. A hash table turns any key into a position using a **hash function**.',
      '**The hash function.** A hash function takes any key and returns an integer. You then take that integer mod the number of buckets to get an index. `index = hash(key) % num_buckets`. The same key always produces the same index — that\'s what makes lookup O(1).',
      '**Buckets.** The backing store is just an array. Each slot is called a bucket. When you `set("name", "Alice")`, the hash function maps "name" to, say, bucket 3, and you store the key-value pair there. When you `get("name")`, hash "name" again → bucket 3 → return the value.',
      '**Collisions.** Two different keys might hash to the same bucket — a **collision**. The simplest fix is **chaining**: each bucket holds a linked list (or array) of all pairs that hash to it. On get, you scan the chain for the exact key. With a good hash function and low load, chains stay short.',
      '**Load factor.** `load = num_entries / num_buckets`. When load exceeds ~0.75, average chain length grows and O(1) degrades toward O(n). The fix: **rehash** — double the number of buckets and reinsert everything. Python dicts do this automatically.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 3, Lesson 1: Hashing',
        body: '**Previous chapter:** Recursion & State — base cases, memoization, backtracking.\n**This lesson:** Hash Tables — build a hash table from scratch with a real hash function and chaining.\n**Next:** Hash Map Applications — frequency counting, two-sum, grouping anagrams.',
      },
      {
        type: 'insight',
        title: 'O(1) is amortized, not guaranteed',
        body: 'Hash table operations are O(1) on average, not always. Worst case (all keys collide) is O(n). A good hash function distributes keys uniformly, making collisions rare. Python\'s dict uses a carefully engineered hash to keep this rare in practice.',
      },
      {
        type: 'warning',
        title: 'Keys must be hashable',
        body: 'Only immutable types can be dictionary keys in Python — strings, numbers, tuples. Lists and dicts cannot be keys because they can change, which would break the hash. In JavaScript, object keys are always strings or Symbols.',
      },
      {
        type: 'strategy',
        title: 'When to use a hash table',
        body: 'Any time you need O(1) lookup by a key that isn\'t an integer index:\n- Count frequencies of elements\n- Detect duplicates\n- Group items by a property\n- Cache function results\n- Two-sum and similar problems',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Hash Table: Keys → Buckets → Values',
        mathBridge: 'Watch the hash function map each key to a bucket index. Click Insert to add key-value pairs and see which bucket they land in. Click Lookup to trace the path from key to value.',
        caption: 'The same key always maps to the same bucket — that\'s what makes lookup O(1).',
        props: {
          lesson: {
            title: 'How a Hash Table Works',
            subtitle: 'Hash → index → store. Same key → same index → lookup.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'Hash Function: Keys to Indices',
                instruction: 'Type any string key. Watch the hash function turn each character into a number, sum them, and take the result modulo the number of buckets.\n\nNotice: the same key always produces the same index. Different keys usually produce different indices — but not always (collision).',
                html: `<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
  <input id="key-in" type="text" value="name" placeholder="key" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:14px;width:140px">
  <button id="btn-hash" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Hash it</button>
  <span style="font-family:monospace;font-size:11px;color:#64748b">buckets = 8</span>
</div>
<div id="steps" style="font-family:monospace;font-size:12px;line-height:1.8;min-height:80px;background:#0a0f1e;border-radius:6px;padding:10px;margin-bottom:10px"></div>
<div style="color:#94a3b8;font-size:11px;font-family:monospace;margin-bottom:6px">BUCKETS</div>
<div id="buckets" style="display:flex;gap:4px;flex-wrap:wrap"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.bucket{flex:0 0 56px;min-height:44px;border:1px solid #334155;border-radius:5px;background:#1e293b;display:flex;flex-direction:column;align-items:center;padding:4px;font-size:10px;transition:all .3s}
.bucket.hit{border-color:#6366f1;background:#1e1b4b}
.b-idx{color:#475569;font-size:9px}.b-val{color:#a5b4fc;font-size:11px;font-weight:bold}
.step-char{color:#2dd4bf}.step-op{color:#94a3b8}.step-result{color:#4ade80;font-weight:bold}`,
                startCode: `const BUCKETS = 8;
const stepsEl   = document.getElementById('steps');
const bucketsEl = document.getElementById('buckets');

// Simple hash: sum of char codes mod BUCKETS
function hash(key) {
  let h = 0;
  for (const ch of key) h += ch.charCodeAt(0);
  return h % BUCKETS;
}

// Init buckets
const bucketData = Array.from({length: BUCKETS}, () => []);
function renderBuckets(highlight = -1) {
  bucketsEl.innerHTML = '';
  for (let i = 0; i < BUCKETS; i++) {
    const b = document.createElement('div');
    b.className = 'bucket' + (i === highlight ? ' hit' : '');
    const idx = document.createElement('div'); idx.className = 'b-idx'; idx.textContent = '[' + i + ']';
    b.appendChild(idx);
    bucketData[i].forEach(([k]) => {
      const v = document.createElement('div'); v.className = 'b-val'; v.textContent = k;
      b.appendChild(v);
    });
    bucketsEl.appendChild(b);
  }
}
renderBuckets();

document.getElementById('btn-hash').addEventListener('click', () => {
  const key = document.getElementById('key-in').value || 'key';
  let h = 0;
  let html = \`<span class="step-op">hash("</span><span class="step-char">\${key}</span><span class="step-op">"):</span><br>\`;
  for (const ch of key) {
    const code = ch.charCodeAt(0);
    h += code;
    html += \`  '\${ch}' → charCode \${code} (running sum = \${h})<br>\`;
  }
  const idx = h % BUCKETS;
  html += \`<br><span class="step-op">\${h} % \${BUCKETS} = </span><span class="step-result">\${idx}</span>  ← bucket index<br>\`;
  stepsEl.innerHTML = html;

  bucketData[idx].push([key, '...']);
  renderBuckets(idx);
});`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: 'Full Hash Table: Insert, Lookup, Delete',
                instruction: 'This is a complete hash table with chaining. Each bucket holds an array of [key, value] pairs.\n\nInsert several pairs, then look them up. Try inserting two keys that hash to the same bucket — watch the chain grow.',
                html: `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">
  <input id="k" type="text" placeholder="key" style="padding:6px 10px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:13px;width:100px">
  <input id="v" type="text" placeholder="value" style="padding:6px 10px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:13px;width:100px">
  <button id="btn-set" style="padding:6px 14px;border-radius:5px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">set</button>
  <button id="btn-get" style="padding:6px 14px;border-radius:5px;border:none;background:#0d9488;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">get</button>
  <button id="btn-del" style="padding:6px 14px;border-radius:5px;border:none;background:#b91c1c;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">delete</button>
</div>
<div id="result" style="font-family:monospace;font-size:12px;color:#94a3b8;min-height:18px;margin-bottom:8px"></div>
<div style="color:#475569;font-size:10px;font-family:monospace;margin-bottom:4px">BUCKET  CHAIN (key → value pairs)</div>
<div id="table-viz" style="font-family:monospace;font-size:12px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.row{display:flex;gap:8px;align-items:flex-start;margin-bottom:3px}
.bkt{width:28px;text-align:right;color:#475569;font-size:11px;padding-top:3px;flex-shrink:0}
.chain{display:flex;gap:4px;flex-wrap:wrap}
.pair{padding:3px 8px;border:1px solid #334155;border-radius:4px;background:#1e293b;color:#94a3b8;font-size:11px}
.pair.hit{border-color:#6366f1;background:#1e1b4b;color:#a5b4fc}
.empty{color:#334155;font-size:11px;padding-top:3px}`,
                startCode: `const BUCKETS = 8;
function hash(key) {
  let h = 0; for(const c of String(key)) h += c.charCodeAt(0); return h % BUCKETS;
}

class HashTable {
  constructor() { this.buckets = Array.from({length: BUCKETS}, () => []); this.size = 0; }
  set(key, val) {
    const i = hash(key);
    const chain = this.buckets[i];
    const existing = chain.find(([k]) => k === key);
    if (existing) { existing[1] = val; }
    else { chain.push([key, val]); this.size++; }
  }
  get(key) {
    const chain = this.buckets[hash(key)];
    const pair = chain.find(([k]) => k === key);
    return pair ? pair[1] : undefined;
  }
  delete(key) {
    const i = hash(key);
    const chain = this.buckets[i];
    const idx = chain.findIndex(([k]) => k === key);
    if (idx !== -1) { chain.splice(idx, 1); this.size--; return true; }
    return false;
  }
}

const ht = new HashTable();
const viz = document.getElementById('table-viz');
const result = document.getElementById('result');
let lastKey = null;

function render(highlightKey = null) {
  viz.innerHTML = '';
  for (let i = 0; i < BUCKETS; i++) {
    const row = document.createElement('div'); row.className = 'row';
    const bkt = document.createElement('div'); bkt.className = 'bkt'; bkt.textContent = '[' + i + ']';
    const chain = document.createElement('div'); chain.className = 'chain';
    if (ht.buckets[i].length === 0) {
      const empty = document.createElement('span'); empty.className = 'empty'; empty.textContent = '—';
      chain.appendChild(empty);
    } else {
      ht.buckets[i].forEach(([k, v]) => {
        const pair = document.createElement('span');
        pair.className = 'pair' + (k === highlightKey ? ' hit' : '');
        pair.textContent = \`\${k}: \${v}\`;
        chain.appendChild(pair);
      });
    }
    row.appendChild(bkt); row.appendChild(chain); viz.appendChild(row);
  }
}

document.getElementById('btn-set').addEventListener('click', () => {
  const k = document.getElementById('k').value.trim();
  const v = document.getElementById('v').value.trim();
  if (!k) return;
  ht.set(k, v);
  result.style.color = '#4ade80';
  result.textContent = \`set("\${k}", "\${v}") → bucket \${hash(k)}\`;
  render(k);
});
document.getElementById('btn-get').addEventListener('click', () => {
  const k = document.getElementById('k').value.trim();
  const v = ht.get(k);
  result.style.color = v !== undefined ? '#4ade80' : '#f87171';
  result.textContent = v !== undefined ? \`get("\${k}") → "\${v}"\` : \`get("\${k}") → undefined (not found)\`;
  render(k);
});
document.getElementById('btn-del').addEventListener('click', () => {
  const k = document.getElementById('k').value.trim();
  const ok = ht.delete(k);
  result.style.color = ok ? '#f87171' : '#64748b';
  result.textContent = ok ? \`deleted "\${k}"\` : \`"\${k}" not found\`;
  render();
});

// Preload some pairs
['name','age','city','job'].forEach((k,i) => ht.set(k, ['Alice','30','NYC','Engineer'][i]));
render();`,
                outputHeight: 300,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build a Hash Table in JavaScript',
        caption: 'Write the hash function, then set, get, and delete — one method at a time.',
        props: {
          lesson: {
            title: 'Hash Table in JavaScript',
            subtitle: 'Build the whole thing. Understand every line.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — The Hash Function

A hash function turns any string key into a bucket index. The simplest approach: sum the character codes of each character in the key, then take the result modulo the number of buckets.

\`\`\`
hash("hi") = ('h'.charCodeAt(0) + 'i'.charCodeAt(0)) % numBuckets
           = (104 + 105) % 8
           = 209 % 8
           = 1
\`\`\`

**Implement \`hash(key, numBuckets)\`:**
1. Start with \`let h = 0\`
2. For each character in key: \`h += key.charCodeAt(i)\`
3. Return \`h % numBuckets\`

The tests verify consistency (same key → same index) and range (always 0 to numBuckets-1).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;margin:2px 0;font-size:11px}`,
                startCode: `function hash(key, numBuckets) {
  let h = 0;
  // TODO: for each character in key, add its char code to h
  // Hint: for (const ch of key) h += ch.charCodeAt(0);

  // TODO: return h mod numBuckets

}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

// Same key always returns same index
test('hash("name",8) stable', hash('name',8) === hash('name',8), true);
test('hash("age",8) stable',  hash('age',8)  === hash('age',8),  true);

// Always within range
const keys = ['name','age','city','job','foo','bar','baz'];
const inRange = keys.every(k => hash(k,8) >= 0 && hash(k,8) < 8);
test('all keys hash to 0-7', inRange, true);

// Show where each key lands
out.innerHTML += '<br>';
keys.forEach(k => {
  out.innerHTML += \`<div class="info">hash("\${k}", 8) = \${hash(k,8)}</div>\`;
});`,
                solutionCode: `function hash(key, numBuckets) {
  let h = 0;
  for (const ch of key) h += ch.charCodeAt(0);
  return h % numBuckets;
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;
}
test('hash("name",8) stable', hash('name',8)===hash('name',8), true);
test('all keys hash to 0-7', ['name','age','city','job'].every(k=>hash(k,8)>=0&&hash(k,8)<8), true);
['name','age','city','job'].forEach(k=>{out.innerHTML+=\`<div style="color:#94a3b8;font-size:11px">hash("\${k}",8) = \${hash(k,8)}</div>\`;});`,
                outputHeight: 180,
              },
              {
                type: 'js',
                instruction: `## Step 2 — set() and get()

Now build the HashTable class. The backing store is an array of \`numBuckets\` empty arrays — each bucket starts as \`[]\`.

**set(key, val):**
1. Compute the bucket index: \`const i = hash(key, this.buckets.length)\`
2. Look in \`this.buckets[i]\` for an existing pair with the same key
3. If found: update its value. If not: push \`[key, val]\` onto the chain.

**get(key):**
1. Compute bucket index
2. Find the pair in that bucket's chain where \`pair[0] === key\`
3. Return the value, or \`undefined\` if not found

Use \`Array.find()\` to search the chain.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function hash(key, n) {
  let h = 0; for (const c of key) h += c.charCodeAt(0); return h % n;
}

class HashTable {
  constructor(numBuckets = 8) {
    this.buckets = Array.from({ length: numBuckets }, () => []);
  }

  set(key, val) {
    const i = hash(key, this.buckets.length);
    const chain = this.buckets[i];

    // TODO: look for an existing pair where pair[0] === key
    // const existing = chain.find(pair => pair[0] === key);
    // if (existing) { existing[1] = val; return; }

    // TODO: if not found, push [key, val] to the chain

  }

  get(key) {
    const i = hash(key, this.buckets.length);
    const chain = this.buckets[i];
    // TODO: find the pair where pair[0] === key, return pair[1]
    // Return undefined if not found

  }
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

const ht = new HashTable();
ht.set('name', 'Alice');
ht.set('age',  30);
ht.set('city', 'NYC');

test('get("name")',   ht.get('name'), 'Alice');
test('get("age")',    ht.get('age'),  30);
test('get("city")',   ht.get('city'), 'NYC');
test('get("missing")',ht.get('missing'), undefined);

// Update existing key
ht.set('age', 31);
test('update "age" to 31', ht.get('age'), 31);`,
                solutionCode: `function hash(key, n) { let h=0; for(const c of key) h+=c.charCodeAt(0); return h%n; }
class HashTable {
  constructor(numBuckets=8) { this.buckets = Array.from({length:numBuckets},()=>[]); }
  set(key, val) {
    const i = hash(key, this.buckets.length);
    const chain = this.buckets[i];
    const existing = chain.find(p => p[0] === key);
    if (existing) { existing[1] = val; return; }
    chain.push([key, val]);
  }
  get(key) {
    const chain = this.buckets[hash(key, this.buckets.length)];
    const pair = chain.find(p => p[0] === key);
    return pair ? pair[1] : undefined;
  }
}
const out=document.getElementById('out');
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
const ht=new HashTable();ht.set('name','Alice');ht.set('age',30);ht.set('city','NYC');
test('get("name")',ht.get('name'),'Alice');test('get("age")',ht.get('age'),30);test('get("missing")',ht.get('missing'),undefined);
ht.set('age',31);test('update age to 31',ht.get('age'),31);`,
                outputHeight: 170,
              },
              {
                type: 'js',
                instruction: `## Step 3 — delete() and keys()

**delete(key):**
1. Compute bucket index
2. Find the index of the pair in the chain: \`chain.findIndex(pair => pair[0] === key)\`
3. If found, remove it with \`chain.splice(idx, 1)\` and return true
4. Return false if not found

**keys():**
1. Walk every bucket
2. For each pair in each bucket, collect \`pair[0]\`
3. Return the flat array of all keys

This is O(n + b) where n = entries and b = number of buckets.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function hash(key, n) { let h=0; for(const c of key) h+=c.charCodeAt(0); return h%n; }

class HashTable {
  constructor(numBuckets = 8) {
    this.buckets = Array.from({ length: numBuckets }, () => []);
  }
  set(key, val) {
    const i = hash(key, this.buckets.length);
    const existing = this.buckets[i].find(p => p[0] === key);
    if (existing) { existing[1] = val; return; }
    this.buckets[i].push([key, val]);
  }
  get(key) {
    const pair = this.buckets[hash(key, this.buckets.length)].find(p => p[0] === key);
    return pair ? pair[1] : undefined;
  }

  delete(key) {
    const i = hash(key, this.buckets.length);
    const chain = this.buckets[i];
    // TODO: find the index of the pair using findIndex
    // TODO: if found, splice it out and return true
    // TODO: return false if not found

  }

  keys() {
    // TODO: collect all keys from all buckets and return as flat array
    // Hint: const result = [];
    //       for (const bucket of this.buckets)
    //         for (const [k] of bucket) result.push(k);
    //       return result;

  }
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = Array.isArray(got)
    ? JSON.stringify([...got].sort()) === JSON.stringify([...expected].sort())
    : JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

const ht = new HashTable();
ht.set('a', 1); ht.set('b', 2); ht.set('c', 3);

test('keys() has a,b,c', ht.keys(), ['a','b','c']);
test('delete("b")', ht.delete('b'), true);
test('get("b") after delete', ht.get('b'), undefined);
test('delete("b") again', ht.delete('b'), false);
test('keys() after delete', ht.keys(), ['a','c']);`,
                solutionCode: `function hash(key, n) { let h=0; for(const c of key) h+=c.charCodeAt(0); return h%n; }
class HashTable {
  constructor(numBuckets=8) { this.buckets=Array.from({length:numBuckets},()=>[]); }
  set(key,val){const i=hash(key,this.buckets.length);const e=this.buckets[i].find(p=>p[0]===key);if(e){e[1]=val;return;}this.buckets[i].push([key,val]);}
  get(key){const p=this.buckets[hash(key,this.buckets.length)].find(p=>p[0]===key);return p?p[1]:undefined;}
  delete(key){const i=hash(key,this.buckets.length);const idx=this.buckets[i].findIndex(p=>p[0]===key);if(idx!==-1){this.buckets[i].splice(idx,1);return true;}return false;}
  keys(){const r=[];for(const b of this.buckets)for(const[k]of b)r.push(k);return r;}
}
const out=document.getElementById('out');
function test(label,got,expected){const pass=Array.isArray(got)?JSON.stringify([...got].sort())===JSON.stringify([...expected].sort()):JSON.stringify(got)===JSON.stringify(expected);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
const ht=new HashTable();ht.set('a',1);ht.set('b',2);ht.set('c',3);
test('keys()',ht.keys(),['a','b','c']);test('delete("b")',ht.delete('b'),true);test('get("b") after delete',ht.get('b'),undefined);test('delete("b") again',ht.delete('b'),false);test('keys() after delete',ht.keys(),['a','c']);`,
                outputHeight: 170,
              },
              {
                type: 'js',
                instruction: `## Challenge — Full Hash Table From Scratch

Empty class shell. Write the entire HashTable from memory:
- \`hash(key, numBuckets)\` function
- \`constructor(numBuckets)\`
- \`set(key, val)\` — update if exists, push if new
- \`get(key)\` — return value or undefined
- \`delete(key)\` — splice out, return true/false
- \`keys()\` — all keys as flat array`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function hash(key, numBuckets) {
  // sum char codes, mod numBuckets
}

class HashTable {
  constructor(numBuckets = 8) {
    // init this.buckets as array of empty arrays
  }

  set(key, val) {
    // update existing or push new
  }

  get(key) {
    // find and return value, or undefined
  }

  delete(key) {
    // splice out, return true/false
  }

  keys() {
    // flat array of all keys
  }
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = Array.isArray(got)
    ? JSON.stringify([...got].sort()) === JSON.stringify([...expected].sort())
    : JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">set and get</div>';
  const ht = new HashTable();
  ht.set('name', 'Alice'); ht.set('age', 30); ht.set('city', 'NYC');
  test('get("name")',    ht.get('name'), 'Alice');
  test('get("age")',     ht.get('age'),  30);
  test('get("missing")', ht.get('missing'), undefined);
  ht.set('age', 31);
  test('update age',     ht.get('age'),  31);

  out.innerHTML += '<div class="section">keys and delete</div>';
  test('keys()',          ht.keys(), ['name','age','city']);
  test('delete("age")',   ht.delete('age'), true);
  test('get after del',   ht.get('age'), undefined);
  test('delete missing',  ht.delete('age'), false);
  test('keys after del',  ht.keys(), ['name','city']);

  out.innerHTML += '<div class="section">hash function</div>';
  test('same key same hash', hash('hello',8) === hash('hello',8), true);
  test('hash in range',      hash('hello',8) >= 0 && hash('hello',8) < 8, true);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. Hash table built from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `function hash(key, n) { let h=0; for(const c of key) h+=c.charCodeAt(0); return h%n; }
class HashTable {
  constructor(n=8){this.buckets=Array.from({length:n},()=>[]);}
  set(key,val){const i=hash(key,this.buckets.length);const e=this.buckets[i].find(p=>p[0]===key);if(e){e[1]=val;return;}this.buckets[i].push([key,val]);}
  get(key){const p=this.buckets[hash(key,this.buckets.length)].find(p=>p[0]===key);return p?p[1]:undefined;}
  delete(key){const i=hash(key,this.buckets.length);const idx=this.buckets[i].findIndex(p=>p[0]===key);if(idx!==-1){this.buckets[i].splice(idx,1);return true;}return false;}
  keys(){const r=[];for(const b of this.buckets)for(const[k]of b)r.push(k);return r;}
}
const out=document.getElementById('out');const results=[];
function test(l,g,e){const pass=Array.isArray(g)?JSON.stringify([...g].sort())===JSON.stringify([...e].sort()):JSON.stringify(g)===JSON.stringify(e);results.push(pass);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const ht=new HashTable();ht.set('name','Alice');ht.set('age',30);ht.set('city','NYC');
test('get("name")',ht.get('name'),'Alice');test('get("age")',ht.get('age'),30);test('get("missing")',ht.get('missing'),undefined);ht.set('age',31);test('update age',ht.get('age'),31);
test('keys()',ht.keys(),['name','age','city']);test('delete("age")',ht.delete('age'),true);test('get after del',ht.get('age'),undefined);test('delete missing',ht.delete('age'),false);
test('hash stable',hash('hello',8)===hash('hello',8),true);test('hash range',hash('hello',8)>=0&&hash('hello',8)<8,true);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 320,
              },
            ],
          },
        },
      },

      // ── Python guided walkthrough ─────────────────────────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Build a Hash Table in Python',
        caption: 'Build the hash table from scratch in Python, then compare to Python\'s built-in dict.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Hash function and set/get',
              prose: [
                'Python\'s `ord(ch)` gives the integer code for a character — the equivalent of JavaScript\'s `charCodeAt()`.',
                'Python already has a built-in `hash()` function, but you\'re building one from scratch to understand what it does.',
              ],
              instructions: `Implement hash_fn(), then set() and get() inside HashTable. All assertions must pass.`,
              code: `def hash_fn(key, num_buckets):
    """Sum of ord() of each char, mod num_buckets."""
    h = 0
    # TODO: for each character in key, add ord(ch) to h

    # TODO: return h mod num_buckets
    pass


class HashTable:
    def __init__(self, num_buckets=8):
        self.buckets = [[] for _ in range(num_buckets)]

    def set(self, key, val):
        i = hash_fn(key, len(self.buckets))
        chain = self.buckets[i]
        # TODO: look for existing pair where pair[0] == key — if found, update pair[1]
        # TODO: if not found, append [key, val] to chain
        pass

    def get(self, key):
        chain = self.buckets[hash_fn(key, len(self.buckets))]
        # TODO: find pair where pair[0] == key, return pair[1]
        # TODO: return None if not found
        pass


# ── Tests ──────────────────────────────────────────────
ht = HashTable()
ht.set('name', 'Alice')
ht.set('age',  30)
ht.set('city', 'NYC')

assert ht.get('name') == 'Alice', f"got {ht.get('name')}"
assert ht.get('age')  == 30,      f"got {ht.get('age')}"
assert ht.get('city') == 'NYC',   f"got {ht.get('city')}"
assert ht.get('missing') is None, f"got {ht.get('missing')}"
print("✓ set and get")

# Update existing key
ht.set('age', 31)
assert ht.get('age') == 31, f"update failed: {ht.get('age')}"
print("✓ update existing key")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — delete() and keys(), then visualize buckets',
              prose: [
                '`list.index()` raises ValueError if not found — safer to use a loop or list comprehension to find the index.',
                'After implementing delete and keys, the opencalc Figure shows the bucket distribution as a bar chart — how many pairs landed in each bucket.',
              ],
              instructions: `Implement delete() and keys(). Then run — the visualization shows chain lengths across all 8 buckets.`,
              code: `from opencalc import Figure, BLUE, AMBER, GREEN, RED

def hash_fn(key, num_buckets):
    return sum(ord(c) for c in key) % num_buckets

class HashTable:
    def __init__(self, num_buckets=8):
        self.buckets = [[] for _ in range(num_buckets)]

    def set(self, key, val):
        i = hash_fn(key, len(self.buckets))
        for pair in self.buckets[i]:
            if pair[0] == key:
                pair[1] = val
                return
        self.buckets[i].append([key, val])

    def get(self, key):
        for pair in self.buckets[hash_fn(key, len(self.buckets))]:
            if pair[0] == key:
                return pair[1]
        return None

    def delete(self, key):
        i = hash_fn(key, len(self.buckets))
        chain = self.buckets[i]
        # TODO: find index of pair where pair[0] == key
        # TODO: if found, del chain[idx] and return True
        # TODO: return False if not found
        pass

    def keys(self):
        # TODO: return flat list of all keys from all buckets
        pass


# ── Tests ──────────────────────────────────────────────
ht = HashTable()
for k, v in [('name','Alice'),('age',30),('city','NYC'),('job','Eng'),('zip','10001')]:
    ht.set(k, v)

assert sorted(ht.keys()) == sorted(['name','age','city','job','zip'])
print("✓ keys()")

assert ht.delete('age') == True
assert ht.get('age') is None
assert ht.delete('age') == False
assert sorted(ht.keys()) == sorted(['name','city','job','zip'])
print("✓ delete()")

# ── Visualize bucket distribution ─────────────────────
words = ['name','age','city','job','zip','foo','bar','baz','qux','cat','dog','egg']
ht2 = HashTable(8)
for w in words:
    ht2.set(w, w)

chain_lens = [len(b) for b in ht2.buckets]
fig = Figure(xmin=-0.5, xmax=8.5, ymin=0, ymax=max(chain_lens)+1,
             width=360, height=160,
             title=f'Bucket chain lengths ({len(words)} keys, 8 buckets)')
fig.axes(ticks=False)
for i, l in enumerate(chain_lens):
    color = RED if l > 2 else AMBER if l > 1 else GREEN
    fig.bar(i, l, width=0.6, color=color, label=str(l) if l > 0 else '')
print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Challenge — Full Hash Table From Scratch in Python',
              prose: [
                'No fill-in-the-blank. Write hash_fn() and every HashTable method from memory.',
                'When all assertions pass, the cell compares your HashTable performance to Python\'s built-in dict across 10,000 lookups.',
              ],
              instructions: `Implement the complete HashTable. Every assertion must pass before the benchmark runs.`,
              code: `import time
from opencalc import Figure, BLUE, GREEN

def hash_fn(key, num_buckets):
    pass

class HashTable:
    def __init__(self, num_buckets=8):
        pass

    def set(self, key, val):
        pass

    def get(self, key):
        pass

    def delete(self, key):
        pass

    def keys(self):
        pass


# ── Assertions ─────────────────────────────────────────
ht = HashTable()
ht.set('name', 'Alice'); ht.set('age', 30); ht.set('city', 'NYC')

assert ht.get('name') == 'Alice'
assert ht.get('age')  == 30
assert ht.get('missing') is None
ht.set('age', 31)
assert ht.get('age') == 31
print("✓ set and get")

assert sorted(ht.keys()) == sorted(['name', 'age', 'city'])
assert ht.delete('age') == True
assert ht.get('age') is None
assert ht.delete('age') == False
assert sorted(ht.keys()) == sorted(['name', 'city'])
print("✓ keys and delete")

print()
print("All assertions passed.")

# ── Benchmark vs built-in dict ────────────────────────
N = 10_000
keys_list = [f"key{i}" for i in range(N)]

ht_big = HashTable(num_buckets=512)
d = {}
for k in keys_list:
    ht_big.set(k, k)
    d[k] = k

t0 = time.perf_counter()
for k in keys_list: ht_big.get(k)
ht_ms = (time.perf_counter() - t0) * 1000

t1 = time.perf_counter()
for k in keys_list: d[k]
dict_ms = (time.perf_counter() - t1) * 1000

print(f"Your HashTable: {ht_ms:.1f}ms for {N} lookups")
print(f"Python dict:    {dict_ms:.2f}ms for {N} lookups")
print(f"(Python dict is faster — it uses a C-optimized hash, but the idea is identical)")

fig = Figure(xmin=0, xmax=3, ymin=0, ymax=max(ht_ms, dict_ms)*1.2,
             width=220, height=160,
             title=f'{N} lookups: yours vs dict')
fig.bar(1, ht_ms,   width=0.5, color=BLUE,  label=f'{ht_ms:.0f}ms')
fig.bar(2, dict_ms, width=0.5, color=GREEN, label=f'{dict_ms:.2f}ms')
print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'Hash table average-case complexity:\n- set: O(1) amortized\n- get: O(1) average, O(n) worst case (all keys collide)\n- delete: O(1) average\n- keys(): O(n + b) where b = num_buckets\n- Space: O(n)',
      'Load factor = n / b. When load > 0.75, rehash by doubling buckets and reinserting all entries. Python\'s dict rehashes automatically at 2/3 load.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Python dict IS a hash table',
        body: 'Every time you write `d["key"]` in Python or `obj.key` in JavaScript, you\'re using a hash table. The only difference between your implementation and Python\'s dict is the hash function quality and the C-level optimization. The algorithm is identical.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],

  challenges: [
    {
      id: 'dsa3-001-c1',
      title: 'Implement a Set Using Your HashTable',
      difficulty: 'medium',
      description: 'Build a Set class on top of your HashTable. A set stores unique values with O(1) add, has, and remove. Use the value as both key and value internally.',
      starterCode: `class HashTable:
    def __init__(self, n=8): self.buckets=[[]for _ in range(n)]
    def set(self,k,v):
        i=sum(ord(c)for c in k)%len(self.buckets)
        for p in self.buckets[i]:
            if p[0]==k: p[1]=v; return
        self.buckets[i].append([k,v])
    def get(self,k):
        for p in self.buckets[sum(ord(c)for c in k)%len(self.buckets)]:
            if p[0]==k: return p[1]
    def delete(self,k):
        i=sum(ord(c)for c in k)%len(self.buckets)
        for j,p in enumerate(self.buckets[i]):
            if p[0]==k: del self.buckets[i][j]; return True
        return False

class MySet:
    def __init__(self):
        self.ht = HashTable()

    def add(self, val):
        # TODO: store val as both key and value in self.ht

    def has(self, val):
        # TODO: return True if val is in the table

    def remove(self, val):
        # TODO: delete val from the table

s = MySet()
s.add('apple'); s.add('banana'); s.add('apple')  # duplicate ignored
print(s.has('apple'))   # True
print(s.has('cherry'))  # False
s.remove('apple')
print(s.has('apple'))   # False`,
      solution: `def add(self, val):
    self.ht.set(str(val), val)
def has(self, val):
    return self.ht.get(str(val)) is not None
def remove(self, val):
    self.ht.delete(str(val))`,
      hint: 'Convert val to string for the key (since your hash function takes strings). Store val as the value. `has()` just checks if `get()` returns something.',
    },
  ],
};
