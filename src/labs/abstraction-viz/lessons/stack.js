export default   {
    id: 'stack',
    title: 'Stack',
    tag: 'Data Structure',
    steps: [
      {
        title: 'Stack — items array',
        code:
`class Stack {
  constructor() {
    this.items = []
  }
}`,
        explanation: 'Stack wraps an array. All operations happen at one end — the top. The last element added is always the first one out. This is LIFO: Last In, First Out. Think of a stack of plates.',
        active: [{ startLine: 1, endLine: 5, color: 'indigo', label: 'Stack — LIFO via array' }],
        connections: [],
      },
      {
        title: 'push() — add to the top',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }
}`,
        explanation: 'push() adds item to the end of the array — the top of the stack. Returning this from line 8 enables method chaining: stack.push("a").push("b").push("c"). Each push grows the stack.',
        active: [{ startLine: 6, endLine: 9, color: 'violet', label: 'push — add to top' }],
        connections: [],
      },
      {
        title: 'Push three items — stack builds up',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }
}

const stack = new Stack()

stack.push('a')
stack.push('b')
stack.push('c')
// items = ['a', 'b', 'c']  ← 'c' is the top`,
        explanation: 'Three pushes. items grows: ["a"], then ["a","b"], then ["a","b","c"]. "c" was added last, so "c" is at the top. This is where peek and pop will look first.',
        active: [
          { startLine: 14, endLine: 17, color: 'emerald', label: 'three pushes — c on top' },
          { startLine: 6,  endLine: 8,  color: 'violet',  label: 'push runs three times' },
        ],
        connections: [{ fromLine: 14, toLine: 6, color: 'emerald', label: 'push()' }],
      },
      {
        title: 'peek() — read the top without removing',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }

  peek() {
    return this.items[this.items.length - 1]
  }
}

const stack = new Stack()
stack.push('a').push('b').push('c')

stack.peek()  // → 'c'`,
        explanation: 'peek() reads items[length - 1] — the last element, the top. Length is 3, so items[2] is "c". peek does not remove it. Call peek ten times and the stack is unchanged. It just looks.',
        active: [
          { startLine: 11, endLine: 13, color: 'violet',  label: 'peek — read top, do not remove' },
          { startLine: 19, endLine: 19, color: 'emerald', label: 'peek → "c"' },
        ],
        connections: [{ fromLine: 19, toLine: 11, color: 'emerald', label: 'enters peek' }],
      },
      {
        title: 'pop() — remove and return the top',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  pop() {
    return this.items.pop()
  }
}

const stack = new Stack()
stack.push('a').push('b').push('c')

stack.peek()  // → 'c'    (top, not removed)
stack.pop()   // → 'c'    (removed — items now ['a','b'])`,
        explanation: 'pop() calls items.pop() which removes and returns the last element. "c" is removed. items is now ["a","b"]. LIFO: the last one in is the first one out.',
        active: [
          { startLine: 15, endLine: 16, color: 'pink',    label: 'pop — remove top' },
          { startLine: 23, endLine: 24, color: 'emerald', label: 'pop → "c", items shrinks' },
        ],
        connections: [{ fromLine: 24, toLine: 15, color: 'pink', label: 'enters pop' }],
      },
      {
        title: 'After pop — b is the new top',
        code:
`class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
    return this
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  pop() {
    return this.items.pop()
  }

  isEmpty() {
    return this.items.length === 0
  }
}

const stack = new Stack()
stack.push('a').push('b').push('c')

stack.pop()   // → 'c'   (removed)
stack.peek()  // → 'b'   (new top)
stack.pop()   // → 'b'
stack.pop()   // → 'a'
stack.isEmpty() // → true`,
        explanation: 'After popping "c", peek returns "b" — the new top. Pop again gets "b", then "a". isEmpty() returns true. The stack is exhausted. LIFO reversed the insertion order: pushed a,b,c — popped c,b,a.',
        active: [
          { startLine: 19, endLine: 21, color: 'violet',  label: 'isEmpty added' },
          { startLine: 27, endLine: 31, color: 'emerald', label: 'pop reverses insertion order' },
        ],
        connections: [
          { fromLine: 27, toLine: 15, color: 'pink',   label: 'pop()' },
          { fromLine: 28, toLine: 11, color: 'violet', label: 'peek()' },
        ],
      },
    ],
  }
