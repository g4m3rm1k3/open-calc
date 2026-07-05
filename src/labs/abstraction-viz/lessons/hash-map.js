export default {
  id: 'hash-map',
  title: 'Hash Map',
  tag: 'Data Structure',
  steps: [
    {
      title: 'The problem — O(n) lookup in an array',
      semanticEvent: 'DefineFunction',
      code:
`const entries = [
  { key: 'alice', value: 25 },
  { key: 'bob',   value: 30 },
  { key: 'carol', value: 28 },
]

function find(arr, key) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].key === key) return arr[i].value
  }
  return undefined
}

console.log(find(entries, 'bob'))
console.log(find(entries, 'carol'))
console.log(find(entries, 'dave'))`,
      explanation: [
        '`find()` reveals the **O(n) lookup problem**: scanning from index 0 until the key matches takes at most `n` comparisons — 2 for `\'bob\'` at index 1, the full length for a missing key. `find(entries, \'dave\')` returns `undefined` after scanning all 3 entries. A hash map eliminates this scan by computing the storage index directly from the key.',
        'CS — Linear search through an unsorted array is `O(n)`. A hash map achieves amortised `O(1)` lookup by using a hash function to compute an index directly from the key — eliminating the scan. The hash function maps any key to a small integer (the "bucket index"), and the value is stored at that index in an array. Lookup is: hash the key, go to that index, done.',
        'SE — The `O(n)` vs `O(1)` difference is enormous at scale. A 10,000-user lookup table scanned linearly takes 5,000 comparisons on average. With a hash map: 1 comparison (plus hash computation). This is why JavaScript objects and `Map`, Python dicts, Java `HashMap`, and Redis are all hash maps — they power every cache, registry, and dictionary in software.',
        'Without this: without the hash function, you\'d need a sorted array + binary search (`O(log n)`) or a BST (`O(log n)`). Hash maps trade slightly more memory (the fixed-size bucket array) for constant-time lookup. For lookup-heavy workloads — caches, registries, deduplication — the trade-off is almost always worth it.',
      ],
      active: [
        { startLine: 7,  endLine: 12, color: 'indigo',  label: 'find — O(n) scan: checks every entry until match' },
        { startLine: 14, endLine: 16, color: 'emerald', label: '30, 28, undefined — correct but slow at scale' },
      ],
      connections: [],
    },
    {
      title: 'Hash function — key to bucket index',
      semanticEvent: 'DefineFunction',
      code:
`const entries = [
  { key: 'alice', value: 25 },
  { key: 'bob',   value: 30 },
  { key: 'carol', value: 28 },
]

function hash(key, size) {
  var h = 0
  for (var i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) % size
  }
  return h
}

const SIZE = 16
console.log(hash('alice', SIZE))
console.log(hash('bob',   SIZE))
console.log(hash('carol', SIZE))
console.log(hash('dave',  SIZE))`,
      explanation: [
        'The hash function establishes the **key → bucket index mapping**: multiplying by 31 (a prime) and adding each character\'s code point, then `% size`, converts any string to a deterministic index in `[0, size)`. Four different keys produce four different bucket indices — each key has a unique, stable home in the bucket array.',
        'CS — A good hash function distributes keys uniformly across the bucket array, minimising collisions (two keys landing in the same bucket). Prime multipliers like 31 and 37 reduce correlation between adjacent characters. Java\'s `String.hashCode()` uses the same `h * 31 + charCodeAt(i)` formula. SHA-256, MD5, and MurmurHash3 are cryptographic and non-cryptographic hash functions used in production hash maps.',
        'SE — Hash function quality directly affects hash map performance. A poor hash function (e.g., always returning 0) degrades every operation to `O(n)` — all keys collide into one bucket. V8 uses a variant of the Jenkins hash function for its hidden class IDs. Redis uses SipHash for string keys. HashMap implementations in Java use `hashCode()` which every class can override to customise hashing behavior.',
        'Without this: without the hash function, there\'s no way to compute a bucket index from a key. The hash function is the core of the hash map — everything else (the bucket array, collision handling) is infrastructure around it. A hash function trades CPU cycles (hash computation) for memory access savings (direct index instead of scan).',
      ],
      active: [
        { startLine: 7,  endLine: 12, color: 'violet',  label: 'hash — prime multiplier + charCodes → bucket index' },
        { startLine: 15, endLine: 19, color: 'emerald', label: 'four different bucket indices (0-15)' },
      ],
      connections: [],
    },
    {
      title: 'HashMap class — set() and get()',
      semanticEvent: 'DefineClass',
      code:
`function hash(key, size) {
  var h = 0
  for (var i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) % size
  }
  return h
}

class HashMap {
  constructor(size) {
    this.size    = size || 16
    this.buckets = new Array(this.size).fill(null).map(function() { return [] })
    this.count   = 0
  }

  set(key, value) {
    const idx = hash(key, this.size)
    const bucket = this.buckets[idx]
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) { bucket[i][1] = value; return this }
    }
    bucket.push([key, value])
    this.count++
    return this
  }

  get(key) {
    const idx = hash(key, this.size)
    const bucket = this.buckets[idx]
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) return bucket[i][1]
    }
    return undefined
  }
}

const map = new HashMap()
map.set('alice', 25).set('bob', 30).set('carol', 28)
console.log(map.get('alice'))
console.log(map.get('bob'))
console.log(map.get('dave'))
console.log(map.count)`,
      explanation: [
        '`set()` and `get()` establish the **O(1) lookup contract**: `set` hashes the key, goes directly to that bucket, scans the short chain for a duplicate key, then appends if new. `get` does the same hash and scan. After inserting alice/bob/carol, `get(\'alice\')` returns `25`, `get(\'bob\')` returns `30`, and `get(\'dave\')` returns `undefined` — all without scanning the full map.',
        'CS — Each "bucket" is a linked list (here, a small array) of all entries that hash to the same index. This is chaining — the standard collision resolution technique. At bucket index `hash(\'alice\', 16)`, the bucket might contain `[[\'alice\', 25]]`. If `\'zap\'` also hashes to the same index, the bucket becomes `[[\'alice\', 25], [\'zap\', 99]]`. A scan of the short bucket list finds the right entry.',
        'SE — JavaScript\'s built-in `Map` and object (`{}`) are hash maps. `Map.set` is `O(1)` amortised. V8 optimises string-keyed objects with "hidden classes" (similar to structs) when the key set is static — property access becomes a direct offset into a fixed-layout object, faster than a hash lookup. Understanding the difference between V8\'s optimised and unoptimised property access explains why adding properties to an object after construction hurts performance.',
        'Without this: without chaining, two keys that hash to the same bucket would overwrite each other — data loss. Chaining handles collisions by storing all colliding entries in the same bucket and scanning locally. The bucket scan is `O(k)` where `k` is the number of entries in that bucket. With a good hash function and low load factor, `k` stays near 1 — giving amortised `O(1)`.',
      ],
      active: [
        { startLine: 9,  endLine: 34, color: 'indigo',  label: 'HashMap — buckets array, each bucket is a chain' },
        { startLine: 16, endLine: 24, color: 'violet',  label: 'set — hash to bucket, update or append' },
        { startLine: 38, endLine: 42, color: 'emerald', label: '25, 30, undefined, count=3' },
      ],
      connections: [{ fromLine: 17, toLine: 1, color: 'violet', label: 'hash() determines which bucket to use', type: 'calls' }],
    },
    {
      title: 'has() and delete()',
      semanticEvent: 'DefineFunction',
      code:
`function hash(key, size) {
  var h = 0
  for (var i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) % size
  }
  return h
}

class HashMap {
  constructor(size) {
    this.size    = size || 16
    this.buckets = new Array(this.size).fill(null).map(function() { return [] })
    this.count   = 0
  }

  set(key, value) {
    const idx = hash(key, this.size)
    const bucket = this.buckets[idx]
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) { bucket[i][1] = value; return this }
    }
    bucket.push([key, value]); this.count++; return this
  }

  get(key) {
    const idx = hash(key, this.size)
    const bucket = this.buckets[idx]
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) return bucket[i][1]
    }
    return undefined
  }

  has(key) {
    return this.get(key) !== undefined
  }

  delete(key) {
    const idx = hash(key, this.size)
    const bucket = this.buckets[idx]
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1)
        this.count--
        return true
      }
    }
    return false
  }
}

const map = new HashMap()
map.set('alice', 25).set('bob', 30).set('carol', 28)
console.log(map.get('alice'))
console.log(map.get('dave'))
console.log(map.count)

console.log(map.has('bob'))
console.log(map.has('dave'))
console.log(map.delete('bob'))
console.log(map.has('bob'))
console.log(map.count)`,
      explanation: [
        '`has()` and `delete()` establish the **existence check and removal contract**: `has` delegates to `get` (key exists if result is not `undefined`); `delete` hashes to the bucket, splices the entry out, and decrements `count`. After deleting `\'bob\'`, `has(\'bob\')` returns `false` and `count` drops from 3 to 2.',
        'CS — `has` is `O(1)` amortised (delegates to `get`). `delete` is `O(1)` amortised for the hash lookup + `O(k)` for the bucket scan + `O(k)` for the splice (splice shifts remaining entries). With low load factors, `k` is near 1, so `delete` is effectively `O(1)`. Some implementations use "tombstone" markers instead of splice — marking deleted slots avoids shifting but requires periodic rehashing to clean up.',
        'SE — JavaScript\'s `Map` implements all three: `Map.has(key)`, `Map.get(key)`, `Map.delete(key)`. Node.js\'s `require` cache (`require.cache`) is a `Map`-like registry — `delete require.cache[path]` is the hot-reload trick. Redis\'s `DEL key` is `O(1)` for strings. React\'s `WeakMap`-based internal fiber map uses the same structure — `has` and `delete` are the core operations for tracking mounted components.',
        'Without this: without `delete`, the hash map only grows — stale entries accumulate indefinitely. A session cache that never deletes expired sessions eventually exhausts memory. `delete` + `has` are the minimum API for a cache invalidation system: check if a key exists, remove it when it expires. Without `has`, you\'d call `get` and compare to `undefined` — fragile if `undefined` is a valid value.',
      ],
      active: [
        { startLine: 33, endLine: 49, color: 'violet',  label: 'has — O(1); delete — hash + splice' },
        { startLine: 55, endLine: 60, color: 'emerald', label: 'has true/false, delete true, has false, count 2' },
      ],
      connections: [],
    },
    {
      title: 'keys(), values() and load factor',
      semanticEvent: 'DefineFunction',
      code:
`function hash(key, size) {
  var h = 0
  for (var i = 0; i < key.length; i++) { h = (h * 31 + key.charCodeAt(i)) % size }
  return h
}

class HashMap {
  constructor(size) {
    this.size = size || 16
    this.buckets = new Array(this.size).fill(null).map(function() { return [] })
    this.count = 0
  }

  set(key, value) {
    const idx = hash(key, this.size); const bucket = this.buckets[idx]
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) { bucket[i][1] = value; return this }
    }
    bucket.push([key, value]); this.count++; return this
  }

  get(key) {
    const bucket = this.buckets[hash(key, this.size)]
    for (var i = 0; i < bucket.length; i++) { if (bucket[i][0] === key) return bucket[i][1] }
    return undefined
  }

  has(key) { return this.get(key) !== undefined }

  delete(key) {
    const bucket = this.buckets[hash(key, this.size)]
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) { bucket.splice(i,1); this.count--; return true }
    }
    return false
  }

  keys() {
    const result = []
    for (var i = 0; i < this.buckets.length; i++) {
      for (var j = 0; j < this.buckets[i].length; j++) {
        result.push(this.buckets[i][j][0])
      }
    }
    return result
  }

  loadFactor() {
    return this.count / this.size
  }
}

const map = new HashMap(8)
map.set('alice', 25).set('bob', 30).set('carol', 28).set('diana', 22)
console.log(map.get('alice'))
console.log(map.has('bob'))
console.log(map.count)
console.log(map.keys())
console.log(map.loadFactor())`,
      explanation: [
        '`keys()` and `loadFactor()` establish the **capacity monitoring relationship**: `keys()` iterates all buckets to collect every stored key (order not guaranteed); `loadFactor()` computes `count / size` — the fraction of buckets occupied. At `4/8 = 0.5`, the map is half full; at `> 0.75` performance degrades and the map should rehash.',
        'CS — Load factor = `n/m` where `n` is the number of entries and `m` is the number of buckets. At load factor `> 0.75`, collisions become frequent and chains grow — lookups degrade toward `O(n)`. Production hash maps resize (rehash) when the load factor crosses a threshold: double the bucket array and re-insert all entries. This is amortised `O(1)` — rehashing is `O(n)` but happens rarely.',
        'SE — Java\'s `HashMap` has a default load factor of `0.75` and doubles when exceeded. JavaScript\'s V8 engine monitors property count vs. object size and hides the rehash behind property assignment. Redis does online rehashing — it maintains two hash tables during resize and migrates entries incrementally to avoid blocking. Python\'s dict resizes at `2/3` occupancy.',
        'Without this: without monitoring load factor and resizing, a hash map with 10,000 entries and only 16 buckets has an average chain length of 625. Lookup degrades to `O(625)` — no better than a slow linear scan. The resizing strategy is what maintains `O(1)` amortised performance regardless of how many entries are inserted.',
      ],
      active: [
        { startLine: 37, endLine: 45, color: 'violet',  label: 'keys — iterate all buckets, collect all keys' },
        { startLine: 47, endLine: 49, color: 'indigo',  label: 'loadFactor — count/size, trigger resize > 0.75' },
        { startLine: 54, endLine: 59, color: 'emerald', label: '25, true, 4, [all keys], 0.5 load factor' },
      ],
      connections: [],
    },
  ],
}
