// DSA + Design Patterns — Lesson 03
// Hash Tables and the Builder Pattern

export const lesson = {
  id: 'dsa-patterns-03',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '3. Hash Tables and the Builder Pattern',
  checkpoints: [
    { id: 'cp-hash',    label: 'Hash Table' },
    { id: 'cp-builder', label: 'Builder Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'In lesson 1 you saw that reading an array by index is O(1). But what if you don\'t have an index — you only have a name, a username, an email? Finding someone by name in an unsorted array means checking every item: O(n). In a list of a million users, that is a million comparisons every time. The Hash Table solves this: it turns any key — a string, a number, anything — into an index, then stores the value there. Look up by that same key later and it jumps straight to it. O(1). No searching.',
      code: null,
    },

    // ── Step 1: The problem — O(n) lookup ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-problem',
      text: 'First, feel the problem. You have a list of users and need to check if a username exists. With an array you scan every item. Run this and watch both the output and the number of comparisons the find operation requires. This is what O(n) lookup looks like — manageable at 5 items, painful at 5 million.',
      code: `// Step 1: looking up by value in an array is O(n)
const users = [
  { username: 'alice', email: 'alice@example.com' },
  { username: 'bob',   email: 'bob@example.com'   },
  { username: 'carol', email: 'carol@example.com' },
]

function findUser(users, username) {
  let comparisons = 0
  for (const user of users) {
    comparisons++
    if (user.username === username) {
      console.log(\`Found '\${username}' after \${comparisons} comparison(s)\`)
      return user
    }
  }
  console.log(\`Not found after \${comparisons} comparison(s)\`)
  return null
}

findUser(users, 'alice')   // found after 1
findUser(users, 'carol')   // found after 3
findUser(users, 'dave')    // not found — scanned all`,
    },

    // ── Step 2: The hash function ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-hash-fn',
      text: 'The core idea of a hash table is simple: turn the key into a number, use that number as an array index. The function that does this is called a hash function. A good hash function spreads keys evenly across the available slots. Here is a simple one: add up the character codes of every letter in the key, then take the remainder when divided by the array size. Run this and watch different keys produce different indices.',
      code: `// Step 2: the hash function — key → index
function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) {
    total += key.charCodeAt(i)
  }
  return total % size   // always 0 to size-1
}

// With a table of 8 slots:
const SIZE = 8
console.log(hash('alice', SIZE))   // some index 0-7
console.log(hash('bob',   SIZE))   // different index
console.log(hash('carol', SIZE))   // different index

// The same key always gives the same index
console.log(hash('alice', SIZE) === hash('alice', SIZE))  // true`,
    },

    // ── Step 3: Collision — two keys, one slot ────────────────────────────────

    {
      type: 'narration',
      id: 'step3-collision',
      text: 'There is a problem with simple hash functions: two different keys can map to the same index. This is called a collision. Run this code and look for cases where two keys produce the same index. It will happen — not because the function is broken, but because we have more possible keys than we have slots. Every hash table must handle collisions somehow.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

// Step 3: collisions — two keys → same index
const SIZE = 8
const keys = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'henry']

const seen = {}
for (const key of keys) {
  const idx = hash(key, SIZE)
  if (seen[idx]) {
    console.log(\`COLLISION: '\${key}' and '\${seen[idx]}' both hash to index \${idx}\`)
  } else {
    seen[idx] = key
    console.log(\`'\${key}' → index \${idx}\`)
  }
}`,
    },

    // ── Step 4: Chaining — the solution ──────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-chaining',
      text: 'The standard collision solution is chaining: instead of storing one value per slot, store an array (a "bucket") at each slot. Multiple key-value pairs can share the same index — they just end up in the same bucket. When you look up a key, you hash it to find the right bucket, then scan that bucket for the exact key. In the average case, each bucket holds very few items, so the scan is fast. This is the foundation of HashMap in Java, dict in Python, and plain objects in JavaScript.',
      code: `// Step 4: create the table structure — an array of empty buckets
function createHashTable(size = 8) {
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])
  //                                                    ^ each slot is its own array

  return {
    buckets,
    size,
  }
}

const table = createHashTable()
console.log('Number of buckets:', table.buckets.length)
console.log('Bucket 0 is empty array:', table.buckets[0])`,
    },

    // ── Step 5: put — store a key-value pair ─────────────────────────────────

    {
      type: 'narration',
      id: 'step5-put',
      text: 'Add the put operation. Hash the key to find the right bucket, then look inside that bucket for an existing entry with the same key. If found, update it. If not found, push a new entry. Each entry is a [key, value] pair stored in the bucket array. In CodeLens you will see the hash computed, the bucket selected, and the entry pushed in.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

function createHashTable(size = 8) {
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])

  return {
    // Step 5: put — store or update a key-value pair
    put(key, value) {
      const idx = hash(key, size)
      const bucket = buckets[idx]
      const existing = bucket.find(([k]) => k === key)
      if (existing) {
        existing[1] = value   // update in place
      } else {
        bucket.push([key, value])
      }
    },
    buckets,
  }
}

const table = createHashTable()
table.put('alice', { email: 'alice@example.com' })
table.put('bob',   { email: 'bob@example.com'   })
table.put('alice', { email: 'alice@NEW.com' })   // update, not duplicate

// Show which buckets have data
table.buckets.forEach((bucket, i) => {
  if (bucket.length) console.log(\`Bucket \${i}:\`, bucket)
})`,
    },

    // ── Step 6: get ───────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-get',
      text: 'Add get. The same hash takes you to the same bucket every time — that is the whole point. Once you are in the right bucket, scan for the key. Average case: O(1). Worst case (all keys collide into one bucket): O(n) — this is why a good hash function and a large enough table matter.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

function createHashTable(size = 8) {
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])

  return {
    put(key, value) {
      const idx = hash(key, size)
      const bucket = buckets[idx]
      const existing = bucket.find(([k]) => k === key)
      if (existing) existing[1] = value
      else bucket.push([key, value])
    },

    // Step 6: get — same hash → same bucket → scan for key
    get(key) {
      const idx = hash(key, size)
      const entry = buckets[idx].find(([k]) => k === key)
      return entry ? entry[1] : undefined
    },
  }
}

const table = createHashTable()
table.put('alice', { email: 'alice@example.com', age: 28 })
table.put('bob',   { email: 'bob@example.com',   age: 34 })

console.log(table.get('alice'))    // { email: ..., age: 28 }
console.log(table.get('bob'))      // { email: ..., age: 34 }
console.log(table.get('nobody'))   // undefined`,
    },

    // ── Step 7: has and delete ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-has-delete',
      text: 'Add has() and delete(). Both follow the same pattern: hash to bucket, then find inside. Delete uses filter() to remove the matching entry from the bucket and replaces the bucket contents. Notice has() is just checking whether get() returns undefined — you can build it on top of get, which means you only have to write the bucket-lookup logic once.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

function createHashTable(size = 8) {
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])

  const get = (key) => {
    const entry = buckets[hash(key, size)].find(([k]) => k === key)
    return entry ? entry[1] : undefined
  }

  return {
    put(key, value) {
      const idx = hash(key, size)
      const bucket = buckets[idx]
      const existing = bucket.find(([k]) => k === key)
      if (existing) existing[1] = value
      else bucket.push([key, value])
    },
    get,
    has(key) { return get(key) !== undefined },

    // Step 7: delete — filter the entry out of its bucket
    delete(key) {
      const idx = hash(key, size)
      const before = buckets[idx].length
      buckets[idx] = buckets[idx].filter(([k]) => k !== key)
      return buckets[idx].length < before   // true if something was removed
    },
  }
}

const table = createHashTable()
table.put('alice', 'alice@example.com')
table.put('bob',   'bob@example.com')

console.log(table.has('alice'))        // true
console.log(table.has('nobody'))       // false
console.log(table.delete('alice'))     // true
console.log(table.has('alice'))        // false — gone`,
    },

    {
      type: 'challenge',
      id: 'ch-hash',
      text: 'Build a word frequency counter using the hash table. Given the array of words below, use put/get to count how many times each word appears. Then log the count for "the" and "quick".',
      expectedOutput: null,
      startCode: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}
function createHashTable(size = 16) {
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])
  const get = (key) => { const e = buckets[hash(key,size)].find(([k])=>k===key); return e ? e[1] : undefined }
  return {
    put(key, value) { const idx=hash(key,size); const b=buckets[idx]; const e=b.find(([k])=>k===key); if(e) e[1]=value; else b.push([key,value]) },
    get,
    has(key) { return get(key) !== undefined },
  }
}

const words = ['the','quick','brown','fox','jumps','over','the','lazy','dog','the','quick']
const freq = createHashTable()

// count each word using put and get
// then log the count for 'the' and 'quick'`,
      hint: 'For each word: freq.put(word, (freq.get(word) ?? 0) + 1). Then console.log(freq.get("the")), console.log(freq.get("quick")).',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('3') && flat.includes('2')
      },
    },

    { type: 'checkpoint', id: 'cp-hash' },

    // ── Load factor and rehashing ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-load-factor',
      text: 'The hash table works well when buckets are sparse. But as you add more and more entries, the chains inside each bucket get longer. The load factor is a number that tells you how full the table is. It equals the number of stored entries divided by the number of buckets. A load factor of 1.0 means on average every bucket has one entry. Above 0.75, chains start getting long and your O(1) guarantee weakens — you are doing more and more scanning inside buckets. Run this and watch the load factor climb as entries are added.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

function createHashTable(size = 4) {   // small table to see the problem fast
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])
  let entries = 0

  return {
    put(key, value) {
      const idx = hash(key, size)
      const existing = buckets[idx].find(([k]) => k === key)
      if (existing) { existing[1] = value; return }
      buckets[idx].push([key, value])
      entries++
    },
    loadFactor() {
      return entries / size   // 0.0 (empty) to above 1.0 (very full)
    },
    bucketLengths() {
      return buckets.map(b => b.length)
    },
  }
}

const table = createHashTable(4)
const keys = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank']
for (const k of keys) {
  table.put(k, k + '@example.com')
  console.log('load factor:', table.loadFactor().toFixed(2), '| buckets:', table.bucketLengths())
}`,
    },

    {
      type: 'narration',
      id: 'step9-rehash',
      text: 'When the load factor crosses 0.75, the hash table needs to rebuild itself. This is called rehashing. The process is: create a new array of buckets that is double the size, then take every existing entry and re-insert it into the new array. Re-inserting is necessary because the hash function uses the size — hash("alice", 8) is a different index than hash("alice", 4). The old array is discarded. Rehash costs O(n) for that one operation, but it happens so rarely that the amortised cost per put stays close to O(1). This is the same reasoning as dynamic array growth.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

function createHashTable(initialSize = 8) {
  let size = initialSize
  let buckets = Array.from({ length: size }, () => [])
  let entries = 0

  function rehash() {
    const oldBuckets = buckets
    size = size * 2
    buckets = Array.from({ length: size }, () => [])
    entries = 0
    // Re-insert every existing entry — new size means new indices
    for (const bucket of oldBuckets) {
      for (const [key, value] of bucket) {
        put(key, value)
      }
    }
    console.log('Rehashed to size:', size)
  }

  function put(key, value) {
    if (entries / size > 0.75) rehash()   // trigger before adding
    const idx = hash(key, size)
    const existing = buckets[idx].find(([k]) => k === key)
    if (existing) { existing[1] = value; return }
    buckets[idx].push([key, value])
    entries++
  }

  const get = (key) => {
    const entry = buckets[hash(key, size)].find(([k]) => k === key)
    return entry ? entry[1] : undefined
  }

  return { put, get, has: (k) => get(k) !== undefined, getSize: () => size }
}

const table = createHashTable(4)
const names = ['alice','bob','carol','dave','eve','frank','grace']
for (const n of names) table.put(n, n + '@example.com')

console.log('Table size after inserts:', table.getSize())
console.log('alice:', table.get('alice'))
console.log('grace:', table.get('grace'))`,
    },

    // ── Step 8: The Builder problem ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-builder-problem',
      text: 'Now the design pattern. Here is a common problem: a function that builds a database query has too many parameters. The caller has to remember the order and meaning of every argument. Add a new optional parameter and you break every existing call. Run this and imagine maintaining it as the query grows more complex.',
      code: `// The Builder problem: optional parameters become unmanageable
function runQuery(table, fields, whereClause, orderField, orderDir, maxRows) {
  // caller must remember: table, fields, where, orderField, orderDir, limit
  // What does runQuery('users', null, null, 'name', 'asc', null) mean?
  const parts = [\`SELECT \${fields || '*'} FROM \${table}\`]
  if (whereClause) parts.push(\`WHERE \${whereClause}\`)
  if (orderField)  parts.push(\`ORDER BY \${orderField} \${orderDir || 'asc'}\`)
  if (maxRows)     parts.push(\`LIMIT \${maxRows}\`)
  return parts.join(' ')
}

// Hard to read. What does the null mean? Which null?
console.log(runQuery('users', 'name,email', 'active = 1', 'name', 'asc', 10))
console.log(runQuery('orders', null, null, 'created_at', 'desc', null))`,
    },

    {
      type: 'narration',
      id: 'step9-builder-idea',
      text: 'The Builder pattern solves this by replacing one giant function call with a sequence of small method calls, each adding one piece. The methods chain — each returns the builder itself so you can keep calling. At the end, you call build() to get the finished result. The object being assembled stays hidden inside the builder until you are done. The caller\'s code reads like English.',
      code: null,
    },

    // ── Step 9: Start the QueryBuilder ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step9-builder-v1',
      text: 'Start with the skeleton: a function that returns a builder object. Add just one method — from() — and build(). Notice build() returns the assembled query string, not the builder. The builder is the factory for the query. This is the minimum working Builder.',
      code: `// Step 9: QueryBuilder skeleton — just from() and build()
function createQueryBuilder() {
  let table = ''

  return {
    from(tableName) {
      table = tableName
      return this   // return this so methods can chain
    },

    build() {
      if (!table) throw new Error('Table is required')
      return \`SELECT * FROM \${table}\`
    },
  }
}

const query = createQueryBuilder()
  .from('users')
  .build()

console.log(query)   // SELECT * FROM users`,
    },

    // ── Step 10: Add select ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step10-select',
      text: 'Add select(). It accepts either a single string or multiple arguments via rest parameters. Update build() to use the selected fields. Notice that each method only concerns itself with one piece of the query — that is the point. select() does not know about where or limit. It just sets fields and returns this.',
      code: `function createQueryBuilder() {
  let table = ''
  let fields = ['*']   // default: all columns

  return {
    from(tableName) { table = tableName; return this },

    // Step 10: select — which columns?
    select(...cols) {
      fields = cols.length ? cols : ['*']
      return this
    },

    build() {
      if (!table) throw new Error('Table is required')
      return \`SELECT \${fields.join(', ')} FROM \${table}\`
    },
  }
}

// No select: all columns
console.log(createQueryBuilder().from('users').build())

// With select: specific columns
console.log(
  createQueryBuilder()
    .from('users')
    .select('name', 'email')
    .build()
)`,
    },

    // ── Step 11: Add where and limit ──────────────────────────────────────────

    {
      type: 'narration',
      id: 'step11-where-limit',
      text: 'Add where() and limit(). where() can be called multiple times — each call adds another condition to an array, and build() joins them with AND. Conditions accumulate. limit() just stores a number. Both return this. Watch how each method is small and focused — it sets one thing and returns the builder.',
      code: `function createQueryBuilder() {
  let table = ''
  let fields = ['*']
  const conditions = []
  let maxRows = null

  return {
    from(t)       { table = t; return this },
    select(...c)  { fields = c.length ? c : ['*']; return this },

    // Step 11: where — add a condition (can be called multiple times)
    where(condition) {
      conditions.push(condition)
      return this
    },

    // Step 11: limit — cap the number of results
    limit(n) {
      maxRows = n
      return this
    },

    build() {
      if (!table) throw new Error('Table is required')
      const parts = [\`SELECT \${fields.join(', ')} FROM \${table}\`]
      if (conditions.length) parts.push(\`WHERE \${conditions.join(' AND ')}\`)
      if (maxRows !== null)  parts.push(\`LIMIT \${maxRows}\`)
      return parts.join(' ')
    },
  }
}

const q = createQueryBuilder()
  .from('orders')
  .select('id', 'total', 'status')
  .where('status = "pending"')
  .where('total > 100')
  .limit(20)
  .build()

console.log(q)`,
    },

    // ── Step 12: Add orderBy ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step12-orderBy',
      text: 'Add orderBy(). It takes a column and an optional direction, defaulting to "asc". This is the complete builder. Notice what the final build() looks like compared to the runQuery() function from step 8 — same SQL, but the builder version reads clearly and each piece was added independently. Adding a new clause in the future means adding one new method, not changing the signature of a function that already has six parameters.',
      code: `function createQueryBuilder() {
  let table = ''
  let fields = ['*']
  const conditions = []
  let order = null
  let maxRows = null

  return {
    from(t)          { table = t; return this },
    select(...c)     { fields = c.length ? c : ['*']; return this },
    where(condition) { conditions.push(condition); return this },
    limit(n)         { maxRows = n; return this },

    // Step 12: orderBy — sort results
    orderBy(col, dir = 'asc') {
      order = \`\${col} \${dir}\`
      return this
    },

    build() {
      if (!table) throw new Error('Table is required')
      const parts = [\`SELECT \${fields.join(', ')} FROM \${table}\`]
      if (conditions.length) parts.push(\`WHERE \${conditions.join(' AND ')}\`)
      if (order)             parts.push(\`ORDER BY \${order}\`)
      if (maxRows !== null)  parts.push(\`LIMIT \${maxRows}\`)
      return parts.join(' ')
    },
  }
}

// Reads almost like a spoken sentence
const q = createQueryBuilder()
  .from('users')
  .select('name', 'email', 'joined_at')
  .where('active = 1')
  .orderBy('joined_at', 'desc')
  .limit(10)
  .build()

console.log(q)`,
    },

    {
      type: 'challenge',
      id: 'ch-builder',
      text: 'Using the QueryBuilder from step 12, build three queries:\n1. All columns from "products", price > 50, sorted by price ascending, limit 5\n2. Just "title" and "author" from "books", ordered by "author" ascending\n3. All columns from "sessions", where "user_id = 42" and "active = 1"\nLog all three.',
      expectedOutput: null,
      startCode: `function createQueryBuilder() {
  let table = '', fields = ['*'], conditions = [], order = null, maxRows = null
  return {
    from(t)          { table = t; return this },
    select(...c)     { fields = c.length ? c : ['*']; return this },
    where(condition) { conditions.push(condition); return this },
    limit(n)         { maxRows = n; return this },
    orderBy(col, dir='asc') { order = \`\${col} \${dir}\`; return this },
    build() {
      if (!table) throw new Error('Table required')
      const p = [\`SELECT \${fields.join(', ')} FROM \${table}\`]
      if (conditions.length) p.push(\`WHERE \${conditions.join(' AND ')}\`)
      if (order)             p.push(\`ORDER BY \${order}\`)
      if (maxRows !== null)  p.push(\`LIMIT \${maxRows}\`)
      return p.join(' ')
    },
  }
}

// build and log all three queries`,
      hint: 'createQueryBuilder().from("products").where("price > 50").orderBy("price","asc").limit(5).build()',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('products') && flat.includes('books') && flat.includes('sessions')
      },
    },

    { type: 'checkpoint', id: 'cp-builder' },

    // ── Step 13: Put it together ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step13-together',
      text: 'Combine hash table and builder into a query cache. The cache stores query results so the same query is never run twice. The key in the hash table is the SQL string produced by the builder — identical queries always produce the same string, so they always hit the same cache slot. This is exactly how production database connection pools and API caches work: hash the query string to check if the result is already cached before hitting the database.',
      code: `function hash(key, size) {
  let total = 0; for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}
function createHashTable(size = 16) {
  const b = []; for (let i = 0; i < size; i++) b.push([])
  const get = k => { const e = b[hash(k,size)].find(([x])=>x===k); return e ? e[1] : undefined }
  return {
    put(k, v) { const idx=hash(k,size); const e=b[idx].find(([x])=>x===k); if(e) e[1]=v; else b[idx].push([k,v]) },
    get, has(k) { return get(k) !== undefined },
  }
}
function createQueryBuilder() {
  let table='', fields=['*'], conditions=[], order=null, maxRows=null
  return {
    from(t){ table=t; return this }, select(...c){ fields=c.length?c:['*']; return this },
    where(c){ conditions.push(c); return this }, limit(n){ maxRows=n; return this },
    orderBy(c,d='asc'){ order=\`\${c} \${d}\`; return this },
    build(){ const p=[\`SELECT \${fields.join(', ')} FROM \${table}\`]; if(conditions.length) p.push(\`WHERE \${conditions.join(' AND ')}\`); if(order) p.push(\`ORDER BY \${order}\`); if(maxRows!==null) p.push(\`LIMIT \${maxRows}\`); return p.join(' ') },
  }
}

// Query cache: hash table keyed by the SQL string
const cache = createHashTable()

function executeQuery(sql) {
  if (cache.has(sql)) {
    console.log(\`[CACHE HIT]  \${sql}\`)
    return cache.get(sql)
  }
  // Simulate DB query
  const result = \`[DB RESULT for: \${sql.slice(0, 30)}...]\`
  cache.put(sql, result)
  console.log(\`[DB QUERY]   \${sql}\`)
  return result
}

const q1 = createQueryBuilder().from('users').where('active = 1').limit(10).build()
const q2 = createQueryBuilder().from('products').orderBy('price').build()

executeQuery(q1)   // DB QUERY — first time
executeQuery(q2)   // DB QUERY — first time
executeQuery(q1)   // CACHE HIT — same SQL string
executeQuery(q1)   // CACHE HIT — again`,
    },

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Build a function called memoize(fn) that wraps any function and caches its results in a hash table, using the string representation of the arguments as the cache key. Then use it to memoize an expensive fibonacci function. Call fib(10) twice — it should only compute once.',
      expectedOutput: null,
      startCode: `function hash(key, size) {
  let total = 0; for (let i=0; i<key.length; i++) total += key.charCodeAt(i)
  return total % size
}
function createHashTable(size = 32) {
  const b = []; for (let i = 0; i < size; i++) b.push([])
  const get = k => { const e = b[hash(k,size)].find(([x])=>x===k); return e ? e[1] : undefined }
  return {
    put(k,v){ const idx=hash(k,size); const e=b[idx].find(([x])=>x===k); if(e) e[1]=v; else b[idx].push([k,v]) },
    get, has(k){ return get(k) !== undefined },
  }
}

function memoize(fn) {
  // create a cache hash table
  // return a new function that checks the cache before calling fn
}

function slowFib(n) {
  if (n <= 1) return n
  return slowFib(n - 1) + slowFib(n - 2)
}

const fib = memoize(slowFib)
console.log(fib(10))   // computes
console.log(fib(10))   // should be instant from cache`,
      hint: 'const cache = createHashTable(); return function(...args) { const key = JSON.stringify(args); if (cache.has(key)) return cache.get(key); const result = fn(...args); cache.put(key, result); return result }',
      validate: ({ logs }) => logs.some(l => String(l).trim() === '55'),
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens and step through the cache interaction. When executeQuery is called the first time, watch the hash function compute an index, watch the bucket get checked (empty), and watch the result get stored. When it is called the second time with the same SQL string, watch the hash function produce the same index and the bucket find the existing entry. That is O(1) lookup — two pointer operations, no matter how many queries are cached.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

function createHashTable(size = 8) {
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])
  const get = key => {
    const entry = buckets[hash(key, size)].find(([k]) => k === key)
    return entry ? entry[1] : undefined
  }
  return {
    put(key, value) {
      const idx = hash(key, size)
      const existing = buckets[idx].find(([k]) => k === key)
      if (existing) existing[1] = value
      else buckets[idx].push([key, value])
    },
    get,
    has(key) { return get(key) !== undefined },
  }
}

const cache = createHashTable()

function fetch(sql) {
  if (cache.has(sql)) return 'CACHED: ' + cache.get(sql)
  const result = 'RESULT:' + sql.length
  cache.put(sql, result)
  return result
}

const sql = 'SELECT name FROM users WHERE active = 1'
console.log(fetch(sql))   // computed
console.log(fetch(sql))   // cached`,
    },

    {
      type: 'codelens',
      id: 'cl-hash-builder',
      text: 'Step through in CodeLens. Watch the hash function sum up character codes and produce an index. Watch the bucket at that index get checked with find(). First call: bucket is empty, result gets pushed in. Second call: the same hash produces the same index, find() locates the entry immediately. Pay attention to what never happens: no loop over the entire cache, no comparisons against other entries. O(1) every time.',
      code: `function hash(key, size) {
  let total = 0
  for (let i = 0; i < key.length; i++) total += key.charCodeAt(i)
  return total % size
}

function createHashTable(size = 8) {
  const buckets = []
  for (let i = 0; i < size; i++) buckets.push([])
  const get = key => {
    const entry = buckets[hash(key, size)].find(([k]) => k === key)
    return entry ? entry[1] : undefined
  }
  return {
    put(key, value) {
      const idx = hash(key, size)
      const existing = buckets[idx].find(([k]) => k === key)
      if (existing) existing[1] = value
      else buckets[idx].push([key, value])
    },
    get,
    has(key) { return get(key) !== undefined },
  }
}

const cache = createHashTable()
const sql = 'SELECT * FROM users'
cache.put(sql, ['alice', 'bob', 'carol'])
console.log(cache.has(sql))
console.log(cache.get(sql))`,
      lang: 'js',
    },

  ],
}
