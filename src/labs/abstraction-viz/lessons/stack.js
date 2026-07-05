export default {
  id: 'stack',
  title: 'Stack',
  tag: 'Data Structure',
  steps: [
    {
      title: 'Stack — items array',
      semanticEvent: 'DefineClass',
      code:
`class Stack {
  constructor() {
    this.items = []
  }
}`,
      explanation: [
        '`Stack` wraps a single `items` array — the only storage. All operations happen at one end (the top). The last element pushed is always the first popped: **LIFO — Last In, First Out**. The array\'s end is the top of the stack; `push` appends there, `pop` removes from there. This one field is the entire data structure.',
        'CS — A stack is an abstract data type defined by two operations: push (add to top) and pop (remove from top). The `items` array provides both in `O(1)`: `Array.push` appends to the end; `Array.pop` removes from the end. The "top" of the stack is always the last element of the underlying array.',
        'SE — Stacks appear throughout production systems: the JavaScript call stack is a stack of function frames (push on call, pop on return). Browser history is a stack (push on navigate, pop on back). Undo/redo in any editor is two stacks. Expression parsers use a stack to match brackets. The LIFO property is what all of these share.',
        'Without this: without the `items` array, there is nowhere to store the elements. The stack\'s LIFO guarantee comes entirely from array.push/pop — both operate at the same end. Using unshift/shift instead would implement a queue (FIFO), not a stack. The choice of array end determines the data structure\'s behaviour.',
      ],
      active: [{ startLine: 1, endLine: 5, color: 'indigo', label: 'Stack — LIFO via array' }],
      connections: [],
    },
    {
      title: 'push() — add to the top',
      semanticEvent: 'DefineFunction',
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
      explanation: [
        '`push(item)` appends to `items` and **returns `this`** — the stack instance itself. Returning `this` establishes the fluent chain dependency: the next `.push()` call receives the same stack, so `stack.push(\'a\').push(\'b\').push(\'c\')` is three calls on the same object with no intermediate variables.',
        'CS — Returning `this` from a mutating method is the Fluent Interface pattern. Each method in the chain receives the same object and applies its operation, then returns the object for the next call. This is distinct from functional chaining (like `Array.map`) where each call returns a new value — here, one mutable object accumulates all changes.',
        'SE — Fluent interfaces are used in query builders (`db.select(\'*\').from(\'users\').where(\'active = 1\').limit(10)`), validation libraries (`value.required().minLength(3).maxLength(50)`), and test assertion chains (`expect(result).to.be.a(\'number\').and.to.equal(42)`). The pattern trades mutation for readability.',
        'Without this: without `return this`, each push would return `undefined`, and `stack.push(\'a\').push(\'b\')` would throw `TypeError: Cannot read properties of undefined (reading \'push\')`. Chaining only works when every method in the chain returns a value the next method can be called on.',
      ],
      active: [{ startLine: 6, endLine: 9, color: 'violet', label: 'push — add to top' }],
      connections: [],
    },
    {
      title: 'Push three items — stack builds up',
      semanticEvent: 'CallFunction',
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

stack.push('a').push('b').push('c')
console.log(stack.items)`,
      explanation: [
        'Three chained pushes build the stack from bottom to top: `[\'a\']` → `[\'a\', \'b\']` → `[\'a\', \'b\', \'c\']`. The **top is always the rightmost element** — `\'c\'` was pushed last and sits at index 2. Every subsequent `peek` or `pop` will operate on index 2. The insertion order is preserved in the array; the LIFO order is the reverse of insertion.',
        'CS — The stack order is preserved in the array: earliest pushed is at index 0 (bottom), most recently pushed is at the end (top). The LIFO property is a consequence of always pushing and popping at the same end. If you reversed the array, the elements would appear in insertion order — but you would lose `O(1)` push/pop at the head.',
        'SE — `stack.items` is a public property here — callers can read (or mutate) the internal array directly. Production stack implementations would make `items` private (a closure variable or a private class field using `#items`) to prevent callers from bypassing the push/pop interface. Exposing internals is useful for learning but problematic in real APIs.',
        'Without this: `console.log(stack.items)` lets you verify the internal state at any point during development. Without it, the stack is a black box — you can only observe it through `peek()` and `pop()`. Printing internals is a debugging technique, not a production pattern. Remove these logs once the data structure is verified.',
      ],
      active: [
        { startLine: 14, endLine: 15, color: 'emerald', label: 'three pushes — c on top' },
        { startLine: 6,  endLine: 8,  color: 'violet',  label: 'push runs three times' },
      ],
      connections: [{ fromLine: 14, toLine: 6, color: 'emerald', label: 'push()', type: 'calls' }],
    },
    {
      title: 'peek() — read the top without removing',
      semanticEvent: 'DefineFunction',
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
console.log(stack.items)

console.log(stack.peek())`,
      explanation: [
        '`peek()` reads `items[length - 1]` — the top — **without changing the array**. The relationship: peek produces the top value but does not consume it. Calling it ten times always returns the same element. This non-destructive read is what distinguishes peek from pop — the stack\'s state is identical before and after.',
        'CS — Index `length - 1` is the canonical "last element" expression for arrays. It works for any array length including 1: `items = [\'a\']`, `length = 1`, `items[0] = \'a\'`. Edge case: if `items` is empty, `length = 0`, `items[-1]` returns `undefined`. A production `peek` would guard against empty stack: `if (this.items.length === 0) throw new Error(\'Stack underflow\')`.',
        'SE — Read-without-remove (peek) is a critical operation in parser and evaluator loops. A parser reads the next token to decide which grammar rule to apply, then consumes it (pop) only if it matches. Without `peek`, you would have to `pop` and then `push` back — a destructive round-trip that is error-prone and expensive.',
        'Without this: without the `length - 1` index, accessing `items[0]` would return `\'a\'` — the bottom of the stack, not the top. That inverts LIFO. The common mistake is off-by-one: `items[items.length]` returns `undefined` because arrays are 0-indexed. Always `length - 1` for the last element.',
      ],
      active: [
        { startLine: 11, endLine: 13, color: 'violet',  label: 'peek — read top, do not remove' },
        { startLine: 21, endLine: 21, color: 'emerald', label: 'peek → "c"' },
      ],
      connections: [{ fromLine: 21, toLine: 11, color: 'emerald', label: 'enters peek', type: 'calls' }],
    },
    {
      title: 'pop() — remove and return the top',
      semanticEvent: 'DefineFunction',
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
console.log(stack.items)

console.log(stack.peek())
console.log(stack.pop())
console.log(stack.items)`,
      explanation: [
        '`pop()` calls `Array.pop()` which **removes and returns the last element** in `O(1)`. `\'c\'` is returned and the array shrinks to `[\'a\', \'b\']`. The top has changed — the next `peek` or `pop` will now return `\'b\'`. This is the consume step: unlike `peek`, `pop` removes the element from the stack permanently.',
        'CS — `Array.pop` is `O(1)` — it removes the last element by decrementing the array\'s internal length counter. No elements are shifted. This is why we use the end of the array as the stack top: `O(1)` add and remove. If we used the front (index 0) as the top, `pop` would call `Array.shift`, which is `O(n)` because every remaining element shifts left by one position.',
        'SE — Pop is the undo operation: the last action pushed onto the undo stack is the first one reversed. It is also the return mechanism of function calls: when a function returns, its frame is popped from the call stack and execution returns to the caller\'s frame. In bracket matching (`({[...]})`), each open bracket is pushed; each close bracket is matched against the popped item.',
        'Without this: `Array.pop` removes the element and returns it in one atomic operation. If `pop` only removed without returning — `this.items.pop(); return` — callers would need to `peek()` before `pop()` to capture the value. That is two method calls where one suffices, and it introduces a race condition in concurrent contexts.',
      ],
      active: [
        { startLine: 15, endLine: 16, color: 'pink',    label: 'pop — remove top' },
        { startLine: 25, endLine: 26, color: 'emerald', label: 'pop → "c", items shrinks' },
      ],
      connections: [{ fromLine: 25, toLine: 15, color: 'pink', label: 'enters pop', type: 'calls' }],
    },
    {
      title: 'isEmpty() — pop reverses insertion order',
      semanticEvent: 'DefineFunction',
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
console.log(stack.items)

console.log(stack.peek())
console.log(stack.pop())
console.log(stack.items)

console.log(stack.pop())
console.log(stack.pop())
console.log(stack.isEmpty())`,
      explanation: [
        '`isEmpty()` provides a **safe termination check**: it reads `items.length === 0` without touching the elements. After popping all three elements (`c`, `b`, `a` — reverse insertion order), `isEmpty()` returns `true`. This demonstrates the LIFO property: push order `a, b, c` produces pop order `c, b, a` — the stack reverses insertion sequence.',
        'CS — LIFO reversal is not a side effect — it is the defining property of a stack. Depth-first search uses a stack: push neighbours, pop the most recently pushed to explore deepest first. Bracket matching uses LIFO: `({[` pushed in that order must be matched by `]})` popped in reverse. When LIFO is what you need, a stack is the correct structure.',
        'SE — `isEmpty()` is the standard termination guard for stack-draining loops: `while (!stack.isEmpty()) { const item = stack.pop(); process(item) }`. Without it, `pop()` on an empty stack returns `undefined`, and processing `undefined` silently produces wrong results — no exception is thrown. The guard prevents that silent failure.',
        'Without this: without `isEmpty`, you call `stack.pop()` until you get `undefined` and check for it: `while ((item = stack.pop()) !== undefined)`. This works if `undefined` is not a valid element — but if someone pushed `undefined` onto the stack, the loop would terminate early. `isEmpty()` checks the count, not the value, and is always correct.',
      ],
      active: [
        { startLine: 19, endLine: 21, color: 'violet',  label: 'isEmpty added' },
        { startLine: 33, endLine: 35, color: 'emerald', label: 'pop reverses insertion order' },
      ],
      connections: [
        { fromLine: 33, toLine: 15, color: 'pink',   label: 'pop()', type: 'calls' },
        { fromLine: 35, toLine: 19, color: 'violet', label: 'isEmpty()', type: 'calls' },
      ],
    },
  ],
}
