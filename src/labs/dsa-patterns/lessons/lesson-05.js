// DSA + Design Patterns — Lesson 05
// Amortized Analysis + Builder

export const lesson = {
  id: 'dsa-patterns-05',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '5. Amortized Analysis + Builder',
  checkpoints: [
    { id: 'cp-amortized', label: 'Amortized Analysis' },
    { id: 'cp-builder',   label: 'Builder Pattern' },
    { id: 'cp-together',  label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You call push() on an array a thousand times. Most calls are instant. But every so often — seemingly at random — one call takes much longer than the others. Yet when you measure the total time for all thousand calls and divide by a thousand, each call averages out to a tiny cost. How can a single operation be both expensive and cheap? You are building a complex object: a query, a document, a configuration. You call ten methods on a builder. Then you discover you need to change the construction order, validate during construction, or produce two slightly different variants from the same base. With ten constructor arguments, that is ten parameters to remember, ten ways to make a mistake, and no obvious place to put validation or variants. Both of these problems — the cost that surprises you and the construction that grows too complex — have precise answers that turn out to be the same kind of thinking.',
      code: null,
    },

    // ── Step 1: Why arrays sometimes resize ──────────────────────────────────

    {
      type: 'narration',
      id: 'step1-dynamic-array',
      text: 'A JavaScript array is not a fixed-size block of memory. Under the hood, most JavaScript engines start with a small allocated block. When you push an item and the block is full, the engine allocates a new block — double the size — copies everything over, and then adds the new item. Copying n items is O(n). But this copy only happens when the block is full, which becomes progressively rarer as the array grows. Most push() calls do zero copying. The expensive ones are spread out so thin that their cost, when shared across all the pushes that happened since the last resize, is negligible. This is amortized analysis: measuring the average cost per operation across a sequence of operations, not the worst-case cost of a single operation.',
      code: `// Simulating how dynamic array resizing works
class DynamicArray {
  constructor() {
    this.data     = new Array(1)  // start with capacity 1
    this.length   = 0
    this.capacity = 1
    this.copies   = 0            // track how many copy operations happen
  }

  push(value) {
    if (this.length === this.capacity) {
      // Resize: double the capacity, copy all existing elements
      this.capacity *= 2
      const newData = new Array(this.capacity)
      for (let i = 0; i < this.length; i++) {
        newData[i] = this.data[i]   // copy — this is the O(n) step
        this.copies++
      }
      this.data = newData
    }
    this.data[this.length] = value
    this.length++
  }
}

const arr = new DynamicArray()
for (let i = 0; i < 16; i++) arr.push(i)

console.log('items pushed:', arr.length)            // 16
console.log('total copy operations:', arr.copies)   // 15 — far fewer than 16*16
console.log('copies per push:', arr.copies / arr.length)  // ~0.9 — less than 1 on average`,
    },

    // ── Step 2: Visualising amortized cost ────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-amortized-math',
      text: 'Count how many copy operations happen across n pushes. Resizes occur at sizes 1, 2, 4, 8, 16, ... 2^k where 2^k is the smallest power of 2 above n. Copies at each resize: 1 + 2 + 4 + 8 + ... + n/2 = n - 1. So across n pushes there are n-1 copies total. Amortized cost per push: (n + (n-1)) / n ≈ 2 operations per push. O(2) = O(1). The amortized cost of push() is O(1) even though occasional pushes cost O(n). This is what "O(1) amortised" means when you see it in documentation — not that every single call is O(1), but that the average across many calls is O(1).',
      code: `// Tracking exactly when resizes happen
class TrackedArray {
  constructor() {
    this.data = []; this.capacity = 1; this._inner = new Array(1); this.length = 0
    this.resizeLog = []
  }
  push(value) {
    if (this.length === this.capacity) {
      this.resizeLog.push({ at: this.length, newCapacity: this.capacity * 2 })
      this.capacity *= 2
    }
    this.length++
  }
}

const t = new TrackedArray()
for (let i = 0; i < 32; i++) t.push(i)

console.log('Resizes happened when length was:')
for (const r of t.resizeLog) {
  console.log('  length =', r.at, '→ new capacity:', r.newCapacity)
}
// Resizes at 1, 2, 4, 8, 16 — logarithmic number of resizes
// Total copies = 1+2+4+8+16 = 31 ≈ n
// Amortised cost = 31 total copies / 32 pushes ≈ 1 copy per push = O(1) amortised`,
    },

    // ── Challenge: amortized ──────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-amortized',
      text: 'Complete the push() method of the SimpleGrowingArray class below. When this.length equals this.capacity, double the capacity and copy all elements into a new array (a plain Array of the new capacity). Otherwise just store the value and increment length. Do not use JavaScript\'s built-in push(). After pushing 8 items [10, 20, 30, 40, 50, 60, 70, 80], log arr.length (8), arr.capacity (8 — it will have resized to 8 after pushing the 8th item or earlier), and arr.data[7] (80).',
      expectedOutput: null,
      startCode: `class SimpleGrowingArray {
  constructor() {
    this.data     = new Array(1)
    this.capacity = 1
    this.length   = 0
  }

  push(value) {
    if (this.length === this.capacity) {
      // double capacity, copy existing elements to new array
    }
    // store value at this.length, then increment this.length
  }

  get(i) { return this.data[i] }
}

const arr = new SimpleGrowingArray()
for (const v of [10, 20, 30, 40, 50, 60, 70, 80]) arr.push(v)

console.log(arr.length)    // 8
console.log(arr.capacity)  // 8 (resized: 1→2→4→8)
console.log(arr.get(7))    // 80`,
      hint: 'this.capacity *= 2; const newData = new Array(this.capacity); for (let i = 0; i < this.length; i++) newData[i] = this.data[i]; this.data = newData; then: this.data[this.length] = value; this.length++',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(8) && nums.includes(80)
      },
    },

    { type: 'checkpoint', id: 'cp-amortized' },

    // ── Step 4: The construction problem ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-construction-problem',
      text: 'Constructing a complex object in one shot — passing all its configuration as constructor arguments — becomes unmanageable as the object grows. Too many parameters, easy to confuse their order, no clear place to add validation, impossible to build variants without duplicating the construction logic. Run this code and notice how the constructor call becomes a wall of arguments with no indication of what each one means.',
      code: `// The problem: constructor with many arguments is unreadable and error-prone
class QueryBuilder {
  constructor(table, columns, whereClause, orderBy, limit, offset, distinct, timeout) {
    this.table       = table
    this.columns     = columns
    this.whereClause = whereClause
    this.orderBy     = orderBy
    this.limit       = limit
    this.offset      = offset
    this.distinct    = distinct
    this.timeout     = timeout
  }
}

// Which argument is which? Easy to swap limit and offset.
// How do you add default values cleanly?
// How do you validate that offset requires limit?
const q = new QueryBuilder('users', ['id', 'name'], 'active = true', 'name', 100, 0, false, 5000)
console.log(q.table)    // 'users'
console.log(q.limit)    // 100 — but was this supposed to be offset?`,
    },

    // ── Step 5: Builder pattern intro ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-builder-intro',
      text: 'The Builder pattern separates the construction of a complex object from its final representation. Instead of one constructor call with many arguments, you use a builder object: an intermediate object you configure step by step. Each configuration method returns the builder itself — this allows method chaining, calling several methods in sequence on the same line. When construction is complete, you call a final build() method that validates everything and returns the finished object. The builder owns the construction logic, the defaults, and the validation. The caller assembles only what they need.',
      code: null,
    },

    // ── Step 6: Builder — first method ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-builder-first',
      text: 'Start with the builder shell: the class that collects configuration and returns itself from each method to enable chaining.',
      code: `class QueryBuilderFluent {
  constructor(table) {
    this._table    = table
    this._columns  = ['*']      // default: all columns
    this._where    = null
    this._orderBy  = null
    this._limit    = null
    this._offset   = 0
    this._distinct = false
  }

  select(...columns) {           // ← NEW
    this._columns = columns
    return this                  // return this to enable chaining
  }
}

const b = new QueryBuilderFluent('users')
b.select('id', 'name')          // sets _columns, returns b
console.log(b._columns)         // ['id', 'name']
console.log(b._table)           // 'users'`,
    },

    // ── Step 7: Builder — more methods ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-builder-methods',
      text: 'Add the remaining configuration methods. Each returns this. The builder accumulates state without constructing anything yet.',
      code: `class QueryBuilderFluent {
  constructor(table) {
    this._table = table; this._columns = ['*']; this._where = null
    this._orderBy = null; this._limit = null; this._offset = 0; this._distinct = false
  }

  select(...columns) { this._columns = columns; return this }

  where(condition) {   // ← NEW
    this._where = condition
    return this
  }

  orderBy(column) {    // ← NEW
    this._orderBy = column
    return this
  }

  limit(n) {           // ← NEW
    this._limit = n
    return this
  }

  offset(n) {          // ← NEW
    this._offset = n
    return this
  }
}

// Method chaining: each call returns the builder, allowing the next call
const b = new QueryBuilderFluent('users')
  .select('id', 'name', 'email')
  .where('active = true')
  .orderBy('name')
  .limit(50)
  .offset(100)

console.log(b._table)   // 'users'
console.log(b._limit)   // 50
console.log(b._where)   // 'active = true'`,
    },

    // ── Step 8: Builder — build() with validation ─────────────────────────────

    {
      type: 'narration',
      id: 'step8-builder-build',
      text: 'Add the build() method. This is the only place that constructs the final object. build() validates the accumulated state before creating anything — catching invalid combinations (like offset without limit) in one place.',
      code: `class QueryBuilderFluent {
  constructor(table) {
    this._table = table; this._columns = ['*']; this._where = null
    this._orderBy = null; this._limit = null; this._offset = 0; this._distinct = false
  }
  select(...cols) { this._columns = cols; return this }
  where(cond)     { this._where   = cond; return this }
  orderBy(col)    { this._orderBy = col;  return this }
  limit(n)        { this._limit   = n;    return this }
  offset(n)       { this._offset  = n;    return this }

  build() {                                           // ← NEW
    if (this._offset > 0 && this._limit === null) {
      throw new Error('offset requires limit to be set')
    }
    // Construct the final immutable query object
    return {
      table:    this._table,
      columns:  this._columns,
      where:    this._where,
      orderBy:  this._orderBy,
      limit:    this._limit,
      offset:   this._offset,
    }
  }
}

const query = new QueryBuilderFluent('orders')
  .select('id', 'total', 'status')
  .where('status = "pending"')
  .orderBy('created_at')
  .limit(25)
  .offset(50)
  .build()

console.log(query.table)    // 'orders'
console.log(query.limit)    // 25
console.log(query.offset)   // 50`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step9-meeting',
      text: 'This is where the two ideas meet. Dynamic array resizing and the Builder pattern are both about spreading cost across steps. The dynamic array does not pay the full cost of resizing at every push — it amortizes the cost by doubling each time, making the cost per push O(1) on average. The Builder does not construct the object at every method call — it accumulates state cheaply across many calls, and pays the construction cost once at build(). Both are systems that defer the expensive operation to a point where it can be done efficiently. Amortized analysis gives you the mathematical vocabulary to reason about "average cost across many steps." The Builder pattern is a structural application of that thinking to object construction.',
      code: null,
    },

    // ── Challenge: Builder ─────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-builder',
      text: 'Write a class called EmailBuilder. It must have four chainable methods: to(address) sets the recipient, subject(text) sets the subject line, body(text) sets the body, and attach(filename) pushes a filename onto an attachments array. A build() method returns a plain email object { to, subject, body, attachments }. build() must throw an Error with message "to is required" if no recipient was set, and "subject is required" if no subject was set. Test: build an email to "alice@test.com" with subject "Hello" and body "World", attach "report.pdf". Log the result\'s to and attachments[0].',
      expectedOutput: null,
      startCode: `class EmailBuilder {
  constructor() {
    this._to          = null
    this._subject     = null
    this._body        = ''
    this._attachments = []
  }

  to(address)      { /* set and return this */ }
  subject(text)    { /* set and return this */ }
  body(text)       { /* set and return this */ }
  attach(filename) { /* push to attachments, return this */ }

  build() {
    // validate: throw if _to or _subject is null
    // return the plain object
  }
}

const email = new EmailBuilder()
  .to('alice@test.com')
  .subject('Hello')
  .body('World')
  .attach('report.pdf')
  .build()

console.log(email.to)              // 'alice@test.com'
console.log(email.attachments[0])  // 'report.pdf'`,
      hint: 'Each method: this._field = value; return this. attach: this._attachments.push(filename); return this. build: if (!this._to) throw new Error("to is required"); return { to: this._to, ... }',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('alice@test.com') && flat.includes('report.pdf')
      },
    },

    { type: 'checkpoint', id: 'cp-builder' },

    // ── Step 10: Combined ─────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step10-combined',
      text: 'Bring the ideas together: a GrowingQueryResult that builds its result set incrementally using a Builder for the query and a dynamic-growth strategy for the result array. The query is assembled step by step with the builder. Results are accumulated with push(). The amortized cost of push keeps the accumulation cheap even as the result set grows.',
      code: `// Simple dynamic array from earlier — O(1) amortised push
class GrowingList {
  constructor() { this.data = []; this.length = 0 }
  push(v) { this.data.push(v); this.length++ }  // native push is already amortised O(1)
  toArray() { return this.data.slice(0, this.length) }
}

// Builder for query configuration
class DataQuery {
  constructor(source) { this._source = source; this._limit = null; this._filter = null }
  limit(n)         { this._limit  = n;   return this }
  filter(fn)       { this._filter = fn;  return this }
  build()          { return { source: this._source, limit: this._limit, filter: this._filter } }
}

// Execute the query — fill a GrowingList with results
function execute(query, allData) {
  const results = new GrowingList()
  for (const item of allData) {
    if (query.limit !== null && results.length >= query.limit) break
    if (query.filter === null || query.filter(item)) {
      results.push(item)              // O(1) amortised
    }
  }
  return results.toArray()
}

const allUsers = [
  { name: 'Alice', score: 90 }, { name: 'Bob', score: 40 },
  { name: 'Carol', score: 85 }, { name: 'Dave', score: 30 },
  { name: 'Eve',   score: 95 },
]

const query = new DataQuery('users')
  .filter(u => u.score >= 80)
  .limit(3)
  .build()

const results = execute(query, allUsers)
console.log('Results:', results.length)
for (const u of results) console.log(u.name, u.score)`,
    },

    // ── Challenge: combined ───────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Use the DataQuery builder and execute function below to build a query that: filters products where price > 50, limits results to 2. Execute it against the products array. Log the count of results (2) and the name of the first result. Do not modify DataQuery or execute.',
      expectedOutput: null,
      startCode: `class DataQuery {
  constructor(src) { this._src = src; this._limit = null; this._filter = null }
  limit(n)    { this._limit = n;  return this }
  filter(fn)  { this._filter = fn; return this }
  build()     { return { src: this._src, limit: this._limit, filter: this._filter } }
}

function execute(query, data) {
  const results = []
  for (const item of data) {
    if (query.limit !== null && results.length >= query.limit) break
    if (query.filter === null || query.filter(item)) results.push(item)
  }
  return results
}

const products = [
  { name: 'Pen',     price: 2  },
  { name: 'Lamp',    price: 80 },
  { name: 'Notebook',price: 15 },
  { name: 'Chair',   price: 200 },
  { name: 'Mouse',   price: 60 },
]

// Build a query: filter price > 50, limit 2, execute against products
// Log results.length and results[0].name`,
      hint: 'const q = new DataQuery("products").filter(p => p.price > 50).limit(2).build(); const r = execute(q, products); console.log(r.length); console.log(r[0].name)',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('2') && (flat.includes('Lamp') || flat.includes('Chair') || flat.includes('Mouse'))
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Watch the DynamicArray as you step through 8 pushes. Look at the capacity field in the Variables panel. It starts at 1. After the first push when length would exceed capacity, watch capacity double to 2. The inner for loop runs — that is the copy. Step further: capacity doubles again at 2, 4. Count how many times the copy loop runs in total across 8 pushes: 1+2+4 = 7 copies for 8 pushes. Then step through the QueryBuilderFluent: each method call updates one field and returns this. The object never gets constructed until build() is called at the very end.',
      code: `class DynamicArray {
  constructor() { this.data = new Array(1); this.capacity = 1; this.length = 0 }
  push(v) {
    if (this.length === this.capacity) {
      this.capacity *= 2
      const nd = new Array(this.capacity)
      for (let i = 0; i < this.length; i++) nd[i] = this.data[i]
      this.data = nd
    }
    this.data[this.length++] = v
  }
}
const arr = new DynamicArray()
for (let i = 1; i <= 8; i++) arr.push(i * 10)
console.log('length:', arr.length, 'capacity:', arr.capacity)

class QB {
  constructor(t) { this._t = t; this._limit = null; this._where = null }
  where(w) { this._where = w; return this }
  limit(n) { this._limit = n; return this }
  build()  { return { table: this._t, where: this._where, limit: this._limit } }
}
const q = new QB('users').where('active=true').limit(10).build()
console.log(q.table, q.limit)`,
    },

    {
      type: 'codelens',
      id: 'cl-amortized-builder',
      text: `Step through DynamicArray.push() for the first 4 items.

Push 1: length=0, capacity=1. length === capacity — resize fires. capacity becomes 2. Copy loop runs 0 times (nothing to copy). Item stored.
Push 2: length=1, capacity=2. No resize. Item stored.
Push 3: length=2, capacity=2. length === capacity — resize fires. capacity becomes 4. Copy loop runs 2 times.
Push 4: length=3, capacity=4. No resize.

Total copy operations for 4 pushes: 0+0+2+0 = 2. Average: 0.5 per push. O(1) amortised.

Then watch QB: each .where() and .limit() just sets one field and returns this. build() is the only line that creates the final object.`,
      code: `class DynamicArray {
  constructor() { this.data = new Array(1); this.capacity = 1; this.length = 0; this.copies = 0 }
  push(v) {
    if (this.length === this.capacity) {
      this.capacity *= 2
      const nd = new Array(this.capacity)
      for (let i = 0; i < this.length; i++) { nd[i] = this.data[i]; this.copies++ }
      this.data = nd
    }
    this.data[this.length++] = v
  }
}
const arr = new DynamicArray()
for (let i = 1; i <= 8; i++) arr.push(i * 10)
console.log('pushes:', arr.length, 'copies:', arr.copies)
class QB {
  constructor(t) { this._t = t; this._limit = null }
  limit(n) { this._limit = n; return this }
  build()  { return { table: this._t, limit: this._limit } }
}
const q = new QB('users').limit(10).build()
console.log(q.table, q.limit)`,
      lang: 'js',
    },

  ],
}
