export default {
  id: 'iterator',
  title: 'Iterator Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'Iterator — a cursor that walks a collection',
      semanticEvent: 'DefineClass',
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
        '`ArrayIterator` establishes the **cursor relationship**: `index` tracks the current position while `items` is the collection being walked. Each `next()` call returns the current element and advances the cursor — the collection never changes, only the position does. When the cursor passes the end, `done: true` signals exhaustion. The caller owns no position knowledge — the iterator does.',
        'CS — The Iterator pattern separates traversal from the collection itself. The collection knows how to store; the iterator knows how to traverse. This decoupling enables: multiple independent cursors on the same collection, different traversal orders (forward, backward, in-order, breadth-first) without changing the collection, and lazy evaluation — the iterator produces values on demand.',
        'SE — JavaScript\'s iteration protocol uses exactly this shape: `{ value, done }`. `Array`, `Map`, `Set`, `String`, and generators all return objects with this shape from `next()`. `for...of`, spread (`[...iter]`), destructuring (`const [a, b] = iter`), and `Array.from(iter)` all consume this protocol. The `{ value, done }` shape is standardised in the ES2015 spec.',
        'Without this: without a cursor, iteration requires either: (a) exposing the internal index to the caller (breaks encapsulation), or (b) copying the entire collection before iteration (expensive). The iterator provides a stateful cursor that advances independently — you can have two `ArrayIterator` instances on the same array at different positions simultaneously.',
      ],
      active: [
        { startLine: 1,  endLine: 14, color: 'indigo',  label: 'ArrayIterator — cursor with hasNext + next' },
        { startLine: 17, endLine: 21, color: 'emerald', label: '{10,false}, {20,false}, {30,false}, {undefined,true}' },
      ],
      connections: [{ fromLine: 13, toLine: 7, color: 'violet', label: 'next checks hasNext before returning', type: 'calls' }],
    },
    {
      title: 'Symbol.iterator — making a collection iterable',
      semanticEvent: 'DefineFunction',
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
        '`[Symbol.iterator]()` establishes the **iterable protocol**: returning an object with a `next()` method from this well-known symbol makes `NumberRange` consumable by `for...of`, spread, and destructuring — without exposing internal storage. `from` and `to` are the only stored state; the iterator\'s `current` lives in a fresh closure per iteration call.',
        'CS — `Symbol.iterator` is a "well-known symbol" — a globally unique symbol that JavaScript engines look for when determining if an object is iterable. Well-known symbols are the extension points of the language: `Symbol.toPrimitive` customises type coercion, `Symbol.hasInstance` customises `instanceof`, `Symbol.iterator` customises iteration. They are hooks into the language runtime.',
        'SE — Custom iterables are used in: DOM `NodeList` (iterable via `Symbol.iterator`), generator functions (generators are iterables), infinite sequences, lazy dataset producers, and virtual lists. The `IntersectionObserver` API returns an iterable of entry objects. React\'s key reconciler iterates children using the iteration protocol. Any object implementing `Symbol.iterator` works with `for...of`, spread, and destructuring.',
        'Without this: without `Symbol.iterator`, custom collections require manual loops with their own iterator API — callers can\'t use `for...of`. `for (const v of range)` only works because `range` implements the protocol. Before ES6, iteration required `for (let i = 0; i < range.size; i++)` — the caller knows the internal structure (size, indexing) that the iterator is supposed to hide.',
      ],
      active: [
        { startLine: 10, endLine: 27, color: 'violet',  label: 'NumberRange — [Symbol.iterator]() makes it iterable' },
        { startLine: 30, endLine: 39, color: 'emerald', label: 'for...of works: [1-5], [10-13]' },
      ],
      connections: [{ fromLine: 16, toLine: 16, color: 'violet', label: '[Symbol.iterator] — JavaScript looks for this exact symbol', type: 'reads' }],
    },
    {
      title: 'Linked list iterator — decouple traversal from structure',
      semanticEvent: 'DefineFunction',
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
        '`LinkedList`\'s `[Symbol.iterator]()` establishes a **traversal abstraction**: the iterator closes over the `head` node and walks the pointer chain — `current = current.next` — without exposing `ListNode`, `head`, or the pointer structure to the caller. The caller writes `for (var v of list)` exactly as they would for an array. The internal representation is invisible.',
        'CS — The iterator decouples the consumer (for...of loop) from the collection\'s internal structure (linked list of nodes). Changing the internal structure — from linked list to array, or adding a skip list — only requires updating `[Symbol.iterator]()`. All existing `for...of` loops continue working unchanged. This is the Open/Closed Principle applied to iteration.',
        'SE — This pattern is used in: `Map.keys()`, `Map.values()`, `Map.entries()` (each returns a different iterator over the same Map), Node.js streams (`for await (const chunk of stream)`), database cursor objects (each `next()` call fetches the next batch from the database without loading all rows), and React\'s reconciler iterating over child elements.',
        'Without this: without `[Symbol.iterator]`, consuming a linked list requires knowing about `ListNode`, `this.head`, and `node.next`. `for (let n = list.head; n !== null; n = n.next)` exposes the internal pointer structure. If `LinkedList` switches to an array internally, this consumer loop breaks. The iterator is the abstraction layer between the structure and its consumers.',
      ],
      active: [
        { startLine: 34, endLine: 44, color: 'violet',  label: '[Symbol.iterator] — walks node pointers, hides structure' },
        { startLine: 48, endLine: 52, color: 'emerald', label: 'for...of works on linked list — same as array' },
      ],
      connections: [{ fromLine: 40, toLine: 40, color: 'violet', label: 'current = current.next — iterator owns traversal', type: 'reads' }],
    },
    {
      title: 'Multiple iterators — independent cursors',
      semanticEvent: 'CreateObject',
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
        'Two calls to `list[Symbol.iterator]()` create **two independent cursor objects** — each with its own `current` variable in its own closure. `iter1` and `iter2` interleave without interfering: `iter1` advances to `b`, `iter2` still reads `a`. This proves the closure-per-call property: each `[Symbol.iterator]()` call produces a fresh environment with an independent position.',
        'CS — Independent iterators are possible because each call to `[Symbol.iterator]()` creates a NEW closure with its own `current` variable. The iterators do not share state — only the list\'s underlying nodes are shared (read-only). This is why the iterator returns a new object each time: each object IS the cursor, isolated from all others.',
        'SE — Database cursors work the same way: two `cursor.execute(query)` calls return two independent result sets, both reading from the same table. Node.js\'s `Readable` stream can be branched with `stream.pipe(dest1)` and `stream.pipe(dest2)` — two consumers, one source. React\'s key reconciliation uses independent iterators for old and new children, comparing them in parallel.',
        'Without this: if the iterator were stored on the list itself (one global cursor), iterating a linked list from two places simultaneously would corrupt both — each `next()` call would advance the shared cursor. Closures give each iterator its own private position, enabling safe concurrent traversal of the same data structure.',
      ],
      active: [
        { startLine: 23, endLine: 25, color: 'indigo',  label: 'two iterators — each has its own closure/cursor' },
        { startLine: 27, endLine: 31, color: 'emerald', label: 'iter1: a,b,c / iter2: a,b — fully independent' },
      ],
      connections: [{ fromLine: 24, toLine: 12, color: 'violet', label: 'each [Symbol.iterator]() call = new independent cursor', type: 'creates' }],
    },
    {
      title: 'Lazy filtered iterator — transform without materialising',
      semanticEvent: 'DefineFunction',
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
        '`filter` and `map` establish a **lazy pipeline dependency**: each wraps an iterable and returns a new iterable. No values are computed until `for...of` requests them. When `doubled.next()` is called, it calls `evens.next()`, which calls the list\'s `next()` — the three layers pull one value through the pipeline at a time. `[4, 8, 12]` appears with zero intermediate arrays.',
        'CS — This is lazy evaluation: computation is deferred until the value is consumed. The `filter` and `map` iterables are pipelines — each `next()` on `doubled` calls `next()` on `evens`, which calls `next()` on the list, advancing all three in tandem. No intermediate array is created. Contrast with `Array.filter().map()` — each step creates a new array, materialising all values.',
        'SE — JavaScript\'s `Array.prototype.flatMap`, Lodash\'s lazy chains (`_.chain(arr).filter().map().value()`), and Rust\'s iterator adaptors (`.filter().map().collect()`) implement this lazy pipeline. RxJS Observables are iterator pipelines over time. Immer\'s `produce` function uses an iterator-like draft pattern. For large datasets (millions of records), lazy filtering avoids loading everything into memory.',
        'Without this: `Array.filter(pred).map(transform)` creates two arrays — `O(n)` extra memory. Lazy iterators process each element once through the entire pipeline — `O(1)` extra memory, regardless of how many transformation steps. For small arrays, the difference is negligible. For streaming data (database rows, log lines, file lines), lazy iteration is the only feasible approach.',
      ],
      active: [
        { startLine: 21, endLine: 35, color: 'violet',  label: 'filter — lazy wrapper, skips non-matching elements' },
        { startLine: 37, endLine: 47, color: 'indigo',  label: 'map — lazy wrapper, transforms each value' },
        { startLine: 53, endLine: 56, color: 'emerald', label: '[4,8,12] — evens doubled, no intermediate arrays' },
      ],
      connections: [{ fromLine: 28, toLine: 37, color: 'violet', label: 'filter calls underlying iterator next()', type: 'calls' }],
    },
  ],
}
