// DSA + Design Patterns — Lesson 12
// Hash Collisions

export const lesson = {
  id: 'dsa-patterns-12',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '12. Hash Collisions',
  checkpoints: [
    { id: 'cp-collision',   label: 'Collision Strategies' },
    { id: 'cp-loadfactor',  label: 'Load Factor & Rehashing' },
    { id: 'cp-together',    label: 'Put Together' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'Recap from the Hash Tables lesson: a hash table maps a key to an index using a hash function. O(1) average lookup. But what happens when two different keys produce the same index? You add "Alice" and it hashes to bucket 3. You add "Bob" and it also hashes to bucket 3. The bucket is already occupied. This is a collision. Every real hash table must handle collisions — they are inevitable, not exceptional. How you handle them determines correctness, memory use, and whether O(1) performance holds in practice.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step1-hashing',
      text: 'First, understand where collisions come from. A hash function maps an arbitrary key to an integer in a fixed range (0 to capacity-1). The range is finite. The number of possible keys is effectively infinite. By the pigeonhole principle — if you have more pigeons than holes, at least one hole contains two pigeons — collisions are mathematically guaranteed as soon as you insert more keys than you have buckets, and in practice they occur well before that. A good hash function spreads keys as evenly as possible, reducing the probability of collision, but never eliminating it.',
      code: `// Simple hash function: sum of char codes mod capacity
function hash(key, capacity) {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h + key.charCodeAt(i)) % capacity
  }
  return h
}

const capacity = 8
const keys = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank']

for (const k of keys) {
  console.log(k, '→ bucket', hash(k, capacity))
}
// Some keys will share a bucket — that is a collision`,
    },

    {
      type: 'narration',
      id: 'step2-chaining',
      text: 'Chaining: each bucket holds not a single value but a linked list (or array) of all key-value pairs that hashed to that bucket. On insertion, always append to the bucket\'s list. On lookup, hash to the bucket, then scan the list for the key. O(1) average when the load is low — most buckets have 0 or 1 entry. O(n) worst case if all keys collide into one bucket. Load factor — the ratio of entries to buckets — measures how full the table is. A load factor of 0.7 means 70% full. Above 0.75–0.8, chaining performance degrades as lists grow.',
      code: `class ChainingHashTable {
  constructor(capacity = 8) {
    this.capacity = capacity
    this.buckets  = Array.from({ length: capacity }, () => [])  // array of arrays
    this.size     = 0
  }

  _hash(key) {
    let h = 0
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % this.capacity
    return h
  }

  set(key, value) {
    const idx    = this._hash(key)
    const bucket = this.buckets[idx]
    const entry  = bucket.find(([k]) => k === key)
    if (entry) { entry[1] = value; return }   // update existing key
    bucket.push([key, value])                  // append to chain
    this.size++
  }

  get(key) {
    const bucket = this.buckets[this._hash(key)]
    const entry  = bucket.find(([k]) => k === key)
    return entry ? entry[1] : undefined
  }

  loadFactor() { return this.size / this.capacity }
}

const ht = new ChainingHashTable(4)   // small capacity to force collisions
ht.set('Alice', 90); ht.set('Bob', 85); ht.set('Carol', 92); ht.set('Dave', 78)

console.log(ht.get('Carol'))         // 92
console.log('load factor:', ht.loadFactor())  // 1.0 — very full`,
    },

    {
      type: 'narration',
      id: 'step3-open-addressing',
      text: 'Open addressing: instead of a linked list, all entries live in the main array. On collision, probe for the next available slot. Linear probing is the simplest: if bucket i is taken, try i+1, i+2, i+3 (wrapping around). Lookup must probe the same sequence to find the key. Deletion is tricky: you cannot just empty a slot (that would break lookup chains). Instead, mark deleted slots with a tombstone — a sentinel value that says "something was here, keep probing." Linear probing suffers from primary clustering: collisions tend to form long runs of occupied slots, slowing lookups.',
      code: `const EMPTY    = undefined
const DELETED  = Symbol('DELETED')   // tombstone marker

class OpenAddressHashTable {
  constructor(capacity = 8) {
    this.capacity = capacity
    this.keys     = new Array(capacity).fill(EMPTY)
    this.values   = new Array(capacity).fill(EMPTY)
    this.size     = 0
  }

  _hash(key) {
    let h = 0
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % this.capacity
    return h
  }

  set(key, value) {
    let i = this._hash(key)
    while (this.keys[i] !== EMPTY && this.keys[i] !== DELETED && this.keys[i] !== key) {
      i = (i + 1) % this.capacity   // linear probe
    }
    if (this.keys[i] !== key) this.size++
    this.keys[i]   = key
    this.values[i] = value
  }

  get(key) {
    let i = this._hash(key)
    while (this.keys[i] !== EMPTY) {
      if (this.keys[i] === key) return this.values[i]
      i = (i + 1) % this.capacity
    }
    return undefined
  }

  delete(key) {
    let i = this._hash(key)
    while (this.keys[i] !== EMPTY) {
      if (this.keys[i] === key) {
        this.keys[i]   = DELETED   // tombstone — do not break the probe chain
        this.values[i] = EMPTY
        this.size--
        return true
      }
      i = (i + 1) % this.capacity
    }
    return false
  }
}

const ht = new OpenAddressHashTable(8)
ht.set('a', 1); ht.set('b', 2); ht.set('c', 3)
ht.delete('b')
console.log(ht.get('c'))   // 3 — probe chain intact despite deletion`,
    },

    {
      type: 'challenge',
      id: 'ch-collision',
      text: 'Add a has(key) method to the ChainingHashTable class below. has(key) returns true if the key exists, false otherwise. Do not duplicate the lookup logic — call this.get(key) and check whether the result is not undefined. Test: insert "x" → 10, "y" → 20. has("x") should be true. has("z") should be false. Log both.',
      expectedOutput: null,
      startCode: `class ChainingHashTable {
  constructor(cap = 8) {
    this.cap     = cap
    this.buckets = Array.from({ length: cap }, () => [])
    this.size    = 0
  }
  _hash(k) { let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) % this.cap; return h }
  set(k, v) {
    const b = this.buckets[this._hash(k)]
    const e = b.find(([ek]) => ek === k)
    if (e) { e[1] = v } else { b.push([k, v]); this.size++ }
  }
  get(k) { const e = this.buckets[this._hash(k)].find(([ek]) => ek === k); return e?.[1] }

  has(key) {
    // return true if key exists, false otherwise
  }
}

const ht = new ChainingHashTable()
ht.set('x', 10)
ht.set('y', 20)
console.log(ht.has('x'))   // true
console.log(ht.has('z'))   // false`,
      hint: 'return this.get(key) !== undefined',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim().toLowerCase())
        return strs[0] === 'true' && strs[1] === 'false'
      },
    },

    { type: 'checkpoint', id: 'cp-collision' },

    {
      type: 'narration',
      id: 'step4-rehashing',
      text: 'Rehashing is the process of growing the hash table when the load factor gets too high. When load factor exceeds a threshold (typically 0.75), allocate a new array of double the capacity, re-hash every existing key (keys hash differently in a larger array), and insert into the new table. This is O(n) — but like dynamic array resizing, it is amortized O(1) per insertion: the expensive resize happens logarithmically often. Without rehashing, a too-full table degrades to O(n) per operation as collision chains grow.',
      code: `class AutoResizingHashTable {
  constructor() {
    this.capacity  = 8
    this.buckets   = Array.from({ length: 8 }, () => [])
    this.size      = 0
    this.threshold = 0.75
  }

  _hash(key) {
    let h = 0
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) % this.capacity
    return h
  }

  set(key, value) {
    if (this.size / this.capacity >= this.threshold) this._rehash()
    const b = this.buckets[this._hash(key)]
    const e = b.find(([k]) => k === key)
    if (e) { e[1] = value } else { b.push([key, value]); this.size++ }
  }

  get(key) {
    const e = this.buckets[this._hash(key)].find(([k]) => k === key)
    return e?.[1]
  }

  _rehash() {
    const old      = this.buckets
    this.capacity *= 2
    this.buckets   = Array.from({ length: this.capacity }, () => [])
    this.size      = 0
    console.log('rehashing to capacity', this.capacity)
    for (const bucket of old) {
      for (const [k, v] of bucket) this.set(k, v)
    }
  }
}

const ht = new AutoResizingHashTable()
const words = ['apple','banana','cherry','date','elderberry','fig','grape','honeydew']
for (const w of words) ht.set(w, w.length)

console.log(ht.get('cherry'))   // 6
console.log('final capacity:', ht.capacity)`,
    },

    {
      type: 'challenge',
      id: 'ch-loadfactor',
      text: 'Write a function called analyseTable(entries) that builds a ChainingHashTable with capacity 8 (using the class below), inserts all entries (array of [key, value] pairs), and returns an object { size, loadFactor, maxChainLength } where maxChainLength is the length of the longest bucket chain. Test with 12 entries. Log size (12), loadFactor (1.5), and maxChainLength (some positive number > 1 since 12 entries into 8 buckets guarantees collisions).',
      expectedOutput: null,
      startCode: `class CHT {
  constructor(cap = 8) { this.cap = cap; this.b = Array.from({length:cap},()=>[]); this.size=0 }
  _h(k) { let h=0; for(const c of k) h=(h*31+c.charCodeAt(0))%this.cap; return h }
  set(k,v) { const b=this.b[this._h(k)]; const e=b.find(([ek])=>ek===k); if(e){e[1]=v}else{b.push([k,v]);this.size++} }
  get(k) { const e=this.b[this._h(k)].find(([ek])=>ek===k); return e?.[1] }
}

function analyseTable(entries) {
  const ht = new CHT(8)
  for (const [k, v] of entries) ht.set(k, v)
  const loadFactor = ht.size / ht.cap
  const maxChainLength = Math.max(...ht.b.map(b => b.length))
  return { size: ht.size, loadFactor, maxChainLength }
}

const entries = [['a',1],['b',2],['c',3],['d',4],['e',5],['f',6],['g',7],['h',8],['i',9],['j',10],['k',11],['l',12]]
const result = analyseTable(entries)
console.log(result.size)           // 12
console.log(result.loadFactor)     // 1.5
console.log(result.maxChainLength) // > 1`,
      hint: 'The function body is mostly written — just fill in the CHT and return the analysis object.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseFloat(String(l).trim()))
        return nums[0] === 12 && nums[1] === 1.5 && nums[2] > 1
      },
    },

    { type: 'checkpoint', id: 'cp-loadfactor' },

    {
      type: 'narration',
      id: 'step5-comparison',
      text: 'Chaining vs open addressing: chaining is simpler to implement, handles high load factors gracefully (chains just grow), and deletion is easy. Open addressing is cache-friendlier (all data in one array), uses less memory per entry (no linked list overhead), but performance degrades faster at high load factors and deletion requires tombstones. JavaScript\'s built-in Map uses a hybrid approach optimised for the engine. For most application code, use Map. Understanding the internals matters when you are implementing your own hash structure (caches, registries, frequency tables) and need to tune capacity and load threshold.',
      code: `// Practical example: word frequency counter
function wordFrequency(text) {
  const freq = new Map()
  for (const word of text.toLowerCase().split(/\s+/)) {
    freq.set(word, (freq.get(word) ?? 0) + 1)
  }
  return freq
}

const text = 'the cat sat on the mat the cat sat'
const freq  = wordFrequency(text)

// Sort by frequency descending
const sorted = [...freq.entries()].sort(([,a],[,b]) => b - a)
for (const [word, count] of sorted) {
  console.log(count, word)
}`,
    },

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Write a function called groupByFirstLetter(words) that groups an array of strings by their first letter using a Map. Return the Map where each key is a letter and each value is an array of words starting with that letter. Test with ["apple","ant","banana","blueberry","cherry","avocado"]. Log the result for key "a" as a joined string ("apple,ant,avocado") and key "b" ("banana,blueberry").',
      expectedOutput: null,
      startCode: `function groupByFirstLetter(words) {
  const groups = new Map()
  for (const word of words) {
    const letter = word[0]
    // if groups does not have the letter, initialise with empty array
    // push word into the array for that letter
  }
  return groups
}

const words = ['apple','ant','banana','blueberry','cherry','avocado']
const groups = groupByFirstLetter(words)

console.log(groups.get('a').join(','))  // 'apple,ant,avocado'
console.log(groups.get('b').join(','))  // 'banana,blueberry'`,
      hint: 'if (!groups.has(letter)) groups.set(letter, []); groups.get(letter).push(word)',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs[0] === 'apple,ant,avocado' && strs[1] === 'banana,blueberry'
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through the ChainingHashTable set() calls. Watch the buckets array in the Variables panel. Each bucket starts as an empty array. When two keys hash to the same index, watch both entries appear in the same bucket array. Then step through get() — watch it hash to the bucket and scan the chain to find the matching key.',
      code: `class CHT {
  constructor(cap=4){this.cap=cap;this.b=Array.from({length:cap},()=>[]);this.size=0}
  _h(k){let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))%this.cap;return h}
  set(k,v){const b=this.b[this._h(k)];const e=b.find(([ek])=>ek===k);if(e){e[1]=v}else{b.push([k,v]);this.size++}}
  get(k){const e=this.b[this._h(k)].find(([ek])=>ek===k);return e?.[1]}
}
const ht=new CHT(4)
ht.set('Alice',90)
ht.set('Bob',85)
ht.set('Carol',92)
ht.set('Dave',78)
console.log('Alice →',ht.get('Alice'))
console.log('Carol →',ht.get('Carol'))
console.log('buckets with collisions:', ht.b.filter(b=>b.length>1).length)`,
    },

    {
      type: 'codelens',
      id: 'cl-collisions',
      text: `Step to: ht.set('Alice', 90)
Watch _hash('Alice') compute the bucket index. Watch that bucket's array get a new [key, value] entry.

Step to: ht.set('Bob', 85)
If Bob hashes to a different bucket — the bucket gets its own entry.
If Bob hashes to the same bucket as Alice — watch the bucket array grow to 2 entries. That is a collision handled by chaining.

Step to: ht.get('Alice')
Watch _hash run again — same result. Watch find() scan the bucket array until [key, value] with key==='Alice' is found.`,
      code: `class CHT {
  constructor(cap=4){this.cap=cap;this.b=Array.from({length:cap},()=>[]);this.size=0}
  _h(k){let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))%this.cap;return h}
  set(k,v){const b=this.b[this._h(k)];const e=b.find(([ek])=>ek===k);if(e){e[1]=v}else{b.push([k,v]);this.size++}}
  get(k){const e=this.b[this._h(k)].find(([ek])=>ek===k);return e?.[1]}
}
const ht=new CHT(4)
ht.set('Alice',90);ht.set('Bob',85);ht.set('Carol',92)
console.log(ht.get('Alice'))
console.log(ht.get('Carol'))`,
      lang: 'js',
    },

  ],
}
