import type { SnippetCategory } from './types'

export const SNIPPET_CATEGORIES: SnippetCategory[] = [
  {
    group: 'Data Structures',
    items: [
      {
        name: 'Linked List Traversal',
        code: `/*
 * 1. WATCH THE HEAP: See how objects are chained together via 'next' pointers.
 * 2. WATCH THE SCOPE: See how 'curr' walks down the chain.
 */
class Node {
  constructor(val) {
    this.val = val
    this.next = null
  }
}

let head = new Node(1)
head.next = new Node(2)
head.next.next = new Node(3)

let curr = head
while (curr !== null) {
  console.log(curr.val)
  curr = curr.next
}`
      },
      {
        name: 'Binary Search Tree',
        code: `/*
 * 1. WATCH THE CALL GRAPH: See the recursive insert calls.
 * 2. WATCH THE HEAP: See the tree structure form dynamically.
 */
class TreeNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}

function insert(root, val) {
  if (root === null) return new TreeNode(val)
  if (val < root.val) root.left = insert(root.left, val)
  else root.right = insert(root.right, val)
  return root
}

let bst = null
bst = insert(bst, 10)
bst = insert(bst, 5)
bst = insert(bst, 15)
bst = insert(bst, 2)
bst = insert(bst, 12)`
      }
    ]
  },
  {
    group: 'Algorithms',
    items: [
      {
        name: 'Bubble Sort',
        code: `/*
 * 1. WATCH THE HEAP: Look at the ArrayCells layout to see the swaps.
 * 2. WATCH THE TIMELINE: Yellow ticks cluster heavily, indicating an O(n^2) loop.
 */
function bubbleSort(arr) {
  let n = arr.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap
        let temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }
    }
  }
  return arr
}

bubbleSort([5, 3, 8, 4, 2])`
      },
      {
        name: 'Fibonacci Recursion',
        code: `/*
 * 1. WATCH THE STACK METER: See the depth grow and shrink rapidly.
 * 2. WATCH THE CALL TREE: Zoom out to see the massive exponential branching.
 */
function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}

fib(4)`
      },
      {
        name: 'Fibonacci with Memoization',
        code: `/*
 * 1. THE CACHE STARTS EMPTY ON PURPOSE: recursion has to reach the base
 *    case (n <= 1) before anything is computed, so the first several steps
 *    legitimately show an empty cache in every frame — that's not a bug,
 *    keep stepping forward.
 * 2. WATCH THE HEAP: once the recursion starts returning, 'cache' fills in
 *    as each result is memoized.
 * 3. WATCH LINE 4: once a value is cached, later calls hit the
 *    'if (n in cache)' shortcut instead of recursing again — that's the
 *    whole point of memoizing.
 * 4. WATCH THE CALL TREE: compare this to the plain recursion example —
 *    repeated sub-problems get computed once and reused instead of
 *    branching exponentially.
 */
function fib(n, cache = {}) {
  if (n <= 1) return n
  if (n in cache) return cache[n]
  cache[n] = fib(n - 1, cache) + fib(n - 2, cache)
  return cache[n]
}

fib(6)`
      }
    ]
  },
  {
    group: 'Design Patterns',
    items: [
      {
        name: 'Singleton (Module)',
        code: `/*
 * Singleton Pattern: Guarantee only one instance exists.
 * WATCH THE HEAP: Both 's1' and 's2' pointers target the EXACT same object #ID.
 */
const Database = (function() {
  let instance = null
  
  function createInstance() {
    return { connected: true, data: [] }
  }
  
  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance()
      }
      return instance
    }
  }
})()

const s1 = Database.getInstance()
const s2 = Database.getInstance()

// Mutating s1 mutates s2, because they are the same reference!
s1.data.push("user_1")
console.log(s2.data)`
      },
      {
        name: 'Factory Pattern',
        code: `/*
 * Factory Pattern: Create objects without exposing instantiation logic.
 * WATCH THE SCOPE: See different types of objects allocated based on the string type.
 */
class Dog { speak() { return "Woof" } }
class Cat { speak() { return "Meow" } }

class AnimalFactory {
  static create(type) {
    if (type === 'dog') return new Dog()
    if (type === 'cat') return new Cat()
    return null
  }
}

const pet1 = AnimalFactory.create('dog')
const pet2 = AnimalFactory.create('cat')`
      }
    ]
  },
  {
    group: 'Functional Programming',
    items: [
      {
        name: 'Closures & Currying',
        code: `/*
 * 1. WATCH THE SCOPE CHAIN: Notice how the inner function retains access to 'x'.
 * 2. WATCH THE CALL GRAPH: See how functions return other functions.
 */
function multiply(x) {
  // Returns a new function that "remembers" x
  return function(y) {
    return x * y
  }
}

const double = multiply(2)
const triple = multiply(3)

const res1 = double(5)  // 10
const res2 = triple(5)  // 15`
      },
      {
        name: 'Map / Filter / Reduce',
        code: `/*
 * WATCH THE TIMELINE: See the dense clustering of function calls.
 * Higher order functions invoke callbacks for every element.
 */
const nums = [1, 2, 3, 4, 5]

const sumOfEvens = nums
  .filter(n => n % 2 === 0)
  .map(n => n * 10)
  .reduce((acc, curr) => acc + curr, 0)

console.log(sumOfEvens)`
      }
    ]
  },
  {
    group: 'React Internals (Pure JS)',
    items: [
      {
        name: 'Simulating useState',
        code: `/*
 * Ever wonder how React's useState works under the hood?
 * WATCH THE CLOSURE SCOPE: The 'state' variable is trapped inside the module.
 */
const ReactMock = (function() {
  let _state = undefined
  
  return {
    useState: function(initialValue) {
      if (_state === undefined) _state = initialValue
      
      const setState = function(newVal) {
        _state = newVal
        // React would normally trigger a re-render here
      }
      return [_state, setState]
    }
  }
})()

function CounterComponent() {
  const [count, setCount] = ReactMock.useState(0)
  console.log("Render count:", count)
  return setCount
}

const click = CounterComponent() // Render 0
click(1) // State updates
CounterComponent() // Render 1`
      },
      {
        name: 'Virtual DOM Tree',
        code: `/*
 * Simulating a simple Virtual DOM diffing structure.
 * WATCH THE HEAP: See the nested 'children' array form a UI tree.
 */
function createElement(type, props, ...children) {
  return { type, props, children }
}

const App = createElement('div', { id: 'root' },
  createElement('h1', null, 'Hello World'),
  createElement('ul', null,
    createElement('li', null, 'Item 1'),
    createElement('li', null, 'Item 2')
  )
)

console.log(App)`
      }
    ]
  }
]
