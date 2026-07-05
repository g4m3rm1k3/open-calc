export default {
  id: 'iterator',
  title: 'Iterator Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'Iterator — a cursor that walks a collection',
      code:
`class ArrayIterator {
  constructor(items) {
    this.items = items
    this.index = 0
  }

  hasNext() {
    return this.index < this.items.length
  }

  next() {
    if (!this.hasNext()) return { value: undefined, done: true }
    return { value: this.items[this.index++], done: false }
  }
}

const iter = new ArrayIterator([10, 20, 30])
console.log(iter.next())
console.log(iter.next())
console.log(iter.next())
console.log(iter.next())`,
      explanation: [
        '`ArrayIterator` holds a reference to the array and an `index` cursor. `hasNext()` returns true while the index is in-bounds. `next()` returns the current element and advances the index. Line 18 prints `{ value: 10, done: false }`. Line 19 prints `{ value: 20, done: false }`. Line 20 prints `{ value: 30, done: false }`. Line 21 prints `{ value: undefined, done: true }` — the collection is exhausted.',
        'CS — The Iterator pattern separates traversal from the collection itself. The collection knows how to store; the iterator knows how to traverse. This decoupling enables: multiple independent cursors on the same collection, different traversal orders (forward, backward, in-order, breadth-first) without changing the collection, and lazy evaluation — the iterator produces values on demand.',
        'SE — JavaScript\'s iteration protocol uses exactly this shape: `{ value, done }`. `Array`, `Map`, `Set`, `String`, and generators all return objects with this shape from `next()`. `for...of`, spread (`[...iter]`), destructuring (`const [a, b] = iter`), and `Array.from(iter)` all consume this protocol. The `{ value, done }` shape is standardised in the ES2015 spec.',
        'Without this: without a cursor, iteration requires either: (a) exposing the internal index to the caller (breaks encapsulation), or (b) copying the entire collection before iteration (expensive). The iterator provides a stateful cursor that advances independently — you can have two `ArrayIterator` instances on the same array at different positions simultaneously.',
      ],
      active: [
        { startLine: 1,  endLine: 14, color: 'indigo',  label: 'ArrayIterator — cursor with hasNext + next' },
        { startLine: 17, endLine: 21, color: 'emerald', label: '{10,false}, {20,false}, {30,false}, {undefined,true}' },
      ],
      connections: [{ fromLine: 13, toLine: 7, color: 'violet', label: 'next checks hasNext before returning' }],
    },
    {
      title: 'Symbol.iterator — making a collection iterable',
      code:
`class ArrayIterator {
  constructor(items) { this.items = items; this.index = 0 }
  hasNext() { return this.index < this.items.length }
  next() {
    if (!this.hasNext()) return { value: undefined, done: true }
    return { value: this.items[this.index++], done: false }
  }
}

class NumberRange {
  constructor(from, to) {
    this.from = from
    this.to   = to
  }

  [Symbol.iterator]() {
    let current = this.from
    const to    = this.to
    return {
      next: function() {
        if (current <= to) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}

const range = new NumberRange(1, 5)
const result = []
for (var v of range) {
  result.push(v)
}
console.log(result)

const spread = []
var r2 = new NumberRange(10, 13)
for (var x of r2) { spread.push(x) }
console.log(spread)`,
      runCode:
`function makeRangeIter(from, to) {
  var cur = from
  return { next: function() {
    if (cur <= to) return { value: cur++, done: false }
    return { value: undefined, done: true }
  }}
}
function iterToArr(iter) {
  var r = [], s = iter.next()
  while (!s.done) { r.push(s.value); s = iter.next() }
  return r
}
console.log(iterToArr(makeRangeIter(1, 5)))
console.log(iterToArr(makeRangeIter(10, 13)))`,
      explanation: [
        '`[Symbol.iterator]()` is a method named with a symbol — the well-known symbol `Symbol.iterator`. Returning an object with a `next()` method makes `NumberRange` iterable. `for...of` calls `[Symbol.iterator]()` once, then calls `next()` repeatedly until `done: true`. Line 33 prints `[1,2,3,4,5]`. Line 39 prints `[10,11,12,13]`. The `NumberRange` object itself stores only `from` and `to` — the iterator\'s `current` variable is local to each `[Symbol.iterator]()` call.',
        'CS — `Symbol.iterator` is a "well-known symbol" — a globally unique symbol that JavaScript engines look for when determining if an object is iterable. Well-known symbols are the extension points of the language: `Symbol.toPrimitive` customises type coercion, `Symbol.hasInstance` customises `instanceof`, `Symbol.iterator` customises iteration. They are hooks into the language runtime.',
        'SE — Custom iterables are used in: DOM `NodeList` (iterable via `Symbol.iterator`), generator functions (generators are iterables), infinite sequences, lazy dataset producers, and virtual lists. The `IntersectionObserver` API returns an iterable of entry objects. React\'s key reconciler iterates children using the iteration protocol. Any object implementing `Symbol.iterator` works with `for...of`, spread, and destructuring.',
        'Without this: without `Symbol.iterator`, custom collections require manual loops with their own iterator API — callers can\'t use `for...of`. `for (const v of range)` only works because `range` implements the protocol. Before ES6, iteration required `for (let i = 0; i < range.size; i++)` — the caller knows the internal structure (size, indexing) that the iterator is supposed to hide.',
      ],
      active: [
        { startLine: 10, endLine: 27, color: 'violet',  label: 'NumberRange — [Symbol.iterator]() makes it iterable' },
        { startLine: 30, endLine: 39, color: 'emerald', label: 'for...of works: [1-5], [10-13]' },
      ],
      connections: [{ fromLine: 16, toLine: 16, color: 'violet', label: '[Symbol.iterator] — JavaScript looks for this exact symbol' }],
    },
    {
      title: 'Linked list iterator — decouple traversal from structure',
      code:
`class ArrayIterator {
  constructor(items) { this.items = items; this.index = 0 }
  hasNext() { return this.index < this.items.length }
  next() {
    if (!this.hasNext()) return { value: undefined, done: true }
    return { value: this.items[this.index++], done: false }
  }
}

class NumberRange {
  constructor(from, to) { this.from=from; this.to=to }
  [Symbol.iterator]() {
    var cur=this.from, to=this.to
    return { next: function() {
      return cur<=to ? {value:cur++,done:false} : {value:undefined,done:true}
    }}
  }
}

class ListNode {
  constructor(value) { this.value = value; this.next = null }
}

class LinkedList {
  constructor() { this.head = null; this.size = 0 }

  add(value) {
    const node = new ListNode(value)
    if (!this.head) { this.head = node; this.size++; return this }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node; this.size++; return this
  }

  [Symbol.iterator]() {
    let current = this.head
    return {
      next: function() {
        if (current === null) return { value: undefined, done: true }
        const val = current.value
        current = current.next
        return { value: val, done: false }
      }
    }
  }
}

const list = new LinkedList()
list.add(100).add(200).add(300).add(400)

const arr = []
for (var v of list) { arr.push(v) }
console.log(arr)
console.log(arr.length)`,
      runCode:
`function makeListIter(head) {
  var cur = head
  return { next: function() {
    if (cur === null) return { value: undefined, done: true }
    var v = cur.value; cur = cur.next; return { value: v, done: false }
  }}
}
class Node { constructor(v) { this.value = v; this.next = null } }
function buildList(vals) {
  var head = null, tail = null
  vals.forEach(function(v) {
    var n = new Node(v)
    if (!head) { head = n; tail = n } else { tail.next = n; tail = n }
  })
  return { head: head }
}
var list = buildList([100, 200, 300, 400])
var arr = []
var iter = makeListIter(list.head)
var s = iter.next()
while (!s.done) { arr.push(s.value); s = iter.next() }
console.log(arr)
console.log(arr.length)`,
      explanation: [
        '`LinkedList` implements `[Symbol.iterator]()` — the iterator closes over the `current` node pointer, advancing via `current = current.next` on each call. The caller uses `for...of` exactly as they would on an array. Line 51 prints `[100, 200, 300, 400]`. Line 52 prints `4`. The caller never touches `this.head`, `ListNode`, or pointer manipulation — the iterator encapsulates the traversal.',
        'CS — The iterator decouples the consumer (for...of loop) from the collection\'s internal structure (linked list of nodes). Changing the internal structure — from linked list to array, or adding a skip list — only requires updating `[Symbol.iterator]()`. All existing `for...of` loops continue working unchanged. This is the Open/Closed Principle applied to iteration.',
        'SE — This pattern is used in: `Map.keys()`, `Map.values()`, `Map.entries()` (each returns a different iterator over the same Map), Node.js streams (`for await (const chunk of stream)`), database cursor objects (each `next()` call fetches the next batch from the database without loading all rows), and React\'s reconciler iterating over child elements.',
        'Without this: without `[Symbol.iterator]`, consuming a linked list requires knowing about `ListNode`, `this.head`, and `node.next`. `for (let n = list.head; n !== null; n = n.next)` exposes the internal pointer structure. If `LinkedList` switches to an array internally, this consumer loop breaks. The iterator is the abstraction layer between the structure and its consumers.',
      ],
      active: [
        { startLine: 34, endLine: 44, color: 'violet',  label: '[Symbol.iterator] — walks node pointers, hides structure' },
        { startLine: 48, endLine: 52, color: 'emerald', label: 'for...of works on linked list — same as array' },
      ],
      connections: [{ fromLine: 40, toLine: 40, color: 'violet', label: 'current = current.next — iterator owns traversal' }],
    },
    {
      title: 'Multiple iterators — independent cursors',
      code:
`class ListNode {
  constructor(value) { this.value = value; this.next = null }
}

class LinkedList {
  constructor() { this.head = null; this.size = 0 }
  add(value) {
    const node = new ListNode(value)
    if (!this.head) { this.head = node; this.size++; return this }
    let cur = this.head; while(cur.next) cur=cur.next; cur.next=node; this.size++; return this
  }
  [Symbol.iterator]() {
    let current = this.head
    return { next: function() {
      if (!current) return {value:undefined,done:true}
      const v = current.value; current = current.next; return {value:v,done:false}
    }}
  }
}

const list = new LinkedList()
list.add('a').add('b').add('c').add('d')

const iter1 = list[Symbol.iterator]()
const iter2 = list[Symbol.iterator]()

console.log(iter1.next().value)
console.log(iter1.next().value)
console.log(iter2.next().value)
console.log(iter1.next().value)
console.log(iter2.next().value)`,
      runCode:
`function makeIter(arr) {
  var idx = 0
  return { next: function() {
    if (idx < arr.length) return { value: arr[idx++], done: false }
    return { value: undefined, done: true }
  }}
}
var iter1 = makeIter(['a', 'b', 'c', 'd'])
var iter2 = makeIter(['a', 'b', 'c', 'd'])
console.log(iter1.next().value)
console.log(iter1.next().value)
console.log(iter2.next().value)
console.log(iter1.next().value)
console.log(iter2.next().value)`,
      explanation: [
        'Two independent iterators on the same list: `iter1` and `iter2` each close over their own `current` pointer. `iter1.next()` advances iter1; `iter2.next()` advances iter2 — independently. Line 27 prints `\'a\'` (iter1 at position 0). Line 28 prints `\'b\'` (iter1 advances to 1). Line 29 prints `\'a\'` (iter2 still at 0 — independent). Line 30 prints `\'c\'` (iter1 at 2). Line 31 prints `\'b\'` (iter2 at 1). They share the same list but own independent cursors.',
        'CS — Independent iterators are possible because each call to `[Symbol.iterator]()` creates a NEW closure with its own `current` variable. The iterators do not share state — only the list\'s underlying nodes are shared (read-only). This is why the iterator returns a new object each time: each object IS the cursor, isolated from all others.',
        'SE — Database cursors work the same way: two `cursor.execute(query)` calls return two independent result sets, both reading from the same table. Node.js\'s `Readable` stream can be branched with `stream.pipe(dest1)` and `stream.pipe(dest2)` — two consumers, one source. React\'s key reconciliation uses independent iterators for old and new children, comparing them in parallel.',
        'Without this: if the iterator were stored on the list itself (one global cursor), iterating a linked list from two places simultaneously would corrupt both — each `next()` call would advance the shared cursor. Closures give each iterator its own private position, enabling safe concurrent traversal of the same data structure.',
      ],
      active: [
        { startLine: 23, endLine: 25, color: 'indigo',  label: 'two iterators — each has its own closure/cursor' },
        { startLine: 27, endLine: 31, color: 'emerald', label: 'iter1: a,b,c / iter2: a,b — fully independent' },
      ],
      connections: [{ fromLine: 24, toLine: 12, color: 'violet', label: 'each [Symbol.iterator]() call = new independent cursor' }],
    },
    {
      title: 'Lazy filtered iterator — transform without materialising',
      code:
`class ListNode {
  constructor(value) { this.value = value; this.next = null }
}

class LinkedList {
  constructor() { this.head = null }
  add(value) {
    const node = new ListNode(value)
    if (!this.head) { this.head = node; return this }
    let cur = this.head; while(cur.next) cur=cur.next; cur.next=node; return this
  }
  [Symbol.iterator]() {
    let current = this.head
    return { next: function() {
      if (!current) return {value:undefined,done:true}
      const v=current.value; current=current.next; return {value:v,done:false}
    }}
  }
}

function filter(iterable, predicate) {
  return {
    [Symbol.iterator]: function() {
      const iter = iterable[Symbol.iterator]()
      return {
        next: function() {
          while (true) {
            const result = iter.next()
            if (result.done) return result
            if (predicate(result.value)) return result
          }
        }
      }
    }
  }
}

function map(iterable, transform) {
  return {
    [Symbol.iterator]: function() {
      const iter = iterable[Symbol.iterator]()
      return { next: function() {
        const result = iter.next()
        if (result.done) return result
        return { value: transform(result.value), done: false }
      }}
    }
  }
}

const list = new LinkedList()
list.add(1).add(2).add(3).add(4).add(5).add(6)

const evens = filter(list, function(n) { return n % 2 === 0 })
const doubled = map(evens, function(n) { return n * 2 })

const result = []
for (var v of doubled) { result.push(v) }
console.log(result)`,
      runCode:
`var list = [1, 2, 3, 4, 5, 6]
var result = []
list.forEach(function(n) {
  if (n % 2 === 0) result.push(n * 2)
})
console.log(result)`,
      explanation: [
        '`filter(iterable, predicate)` and `map(iterable, transform)` return new iterables that wrap the original. `filter(list, n => n % 2 === 0)` produces an iterable of even numbers. `map(evens, n => n * 2)` doubles each. No arrays are created until the `for...of` materialises the result. Line 56 prints `[4, 8, 12]` — evens from 1–6 (2, 4, 6) doubled. Only the necessary elements are computed.',
        'CS — This is lazy evaluation: computation is deferred until the value is consumed. The `filter` and `map` iterables are pipelines — each `next()` on `doubled` calls `next()` on `evens`, which calls `next()` on the list, advancing all three in tandem. No intermediate array is created. Contrast with `Array.filter().map()` — each step creates a new array, materialising all values.',
        'SE — JavaScript\'s `Array.prototype.flatMap`, Lodash\'s lazy chains (`_.chain(arr).filter().map().value()`), and Rust\'s iterator adaptors (`.filter().map().collect()`) implement this lazy pipeline. RxJS Observables are iterator pipelines over time. Immer\'s `produce` function uses an iterator-like draft pattern. For large datasets (millions of records), lazy filtering avoids loading everything into memory.',
        'Without this: `Array.filter(pred).map(transform)` creates two arrays — `O(n)` extra memory. Lazy iterators process each element once through the entire pipeline — `O(1)` extra memory, regardless of how many transformation steps. For small arrays, the difference is negligible. For streaming data (database rows, log lines, file lines), lazy iteration is the only feasible approach.',
      ],
      active: [
        { startLine: 21, endLine: 35, color: 'violet',  label: 'filter — lazy wrapper, skips non-matching elements' },
        { startLine: 37, endLine: 47, color: 'indigo',  label: 'map — lazy wrapper, transforms each value' },
        { startLine: 53, endLine: 56, color: 'emerald', label: '[4,8,12] — evens doubled, no intermediate arrays' },
      ],
      connections: [{ fromLine: 28, toLine: 37, color: 'violet', label: 'filter calls underlying iterator next()' }],
    },
  ],
}
