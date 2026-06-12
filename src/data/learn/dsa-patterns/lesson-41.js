// DSA + Design Patterns — Lesson 41
// Stacks + Command Pattern

export const lesson = {
  id: 'dsa-patterns-41',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '41. Stacks + Command',
  checkpoints: [
    { id: 'cp-stack',   label: 'Stack' },
    { id: 'cp-command', label: 'Command Pattern' },
    { id: 'cp-undo',    label: 'Undo / Redo' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'In the Arrays lesson you met the queue: first in, first out — like a line at a coffee shop. This lesson introduces the stack: last in, first out. Like a stack of plates — you always take from the top and add to the top. Stacks are everywhere: your browser\'s back button is a stack of visited pages. The call stack — the internal structure the computer uses to track which function called which — is a stack. The undo history in every application you have ever used is a stack. We will build a stack from scratch, then use it to implement undo and redo using the Command pattern.',
      code: null,
    },

    // ── Step 1: LIFO in plain English ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-lifo',
      text: 'LIFO means Last In, First Out. The last item you put on the stack is the first one you get back. Run this code and trace the order that items are removed. You push 1, 2, 3 onto the stack. When you pop, you get 3 first, then 2, then 1 — the reverse of the insertion order. This reversal property is what makes stacks useful for undo: the last action you took is the first one to be undone.',
      code: `// LIFO: Last In, First Out
// Using a plain array first so the concept is clear
const stack = []

stack.push(1)   // stack: [1]
stack.push(2)   // stack: [1, 2]
stack.push(3)   // stack: [1, 2, 3]

console.log('top:', stack[stack.length - 1])   // 3 — peek at top

const a = stack.pop()   // removes 3
const b = stack.pop()   // removes 2
const c = stack.pop()   // removes 1

console.log(a, b, c)   // 3 2 1 — reverse order`,
    },

    // ── Step 2: Wrap in createStack ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-createStack',
      text: 'Wrap the array in a createStack factory. This hides the array and exposes only the operations that make sense for a stack. The important thing: there is no way to access items by index from outside the factory. You can only interact with the top. This is intentional — the contract of a stack is that you only see the most recent item. Anything else would break the LIFO guarantee.',
      code: `// createStack — encapsulates LIFO behaviour
function createStack() {
  const items = []   // private — callers cannot reach this directly

  return {
    // Add to top — O(1)
    push(value) {
      items.push(value)
    },

    // Remove from top — O(1)
    pop() {
      if (items.length === 0) return undefined
      return items.pop()
    },

    // Look at the top without removing it — O(1)
    peek() {
      return items[items.length - 1]
    },

    isEmpty() { return items.length === 0 },
    size()    { return items.length },
  }
}

const stack = createStack()
stack.push('a')
stack.push('b')
stack.push('c')

console.log('top:', stack.peek())    // 'c'
console.log('size:', stack.size())   // 3

console.log(stack.pop())   // 'c'
console.log(stack.pop())   // 'b'
console.log('size after 2 pops:', stack.size())   // 1`,
    },

    // ── Step 3: Practical use — bracket balancer ──────────────────────────────

    {
      type: 'narration',
      id: 'step3-brackets',
      text: 'A classic stack application: checking that brackets are balanced. Push every opening bracket. When you see a closing bracket, pop the stack and check that it matches. If the stack is empty when you try to pop, or if the brackets don\'t match, the string is unbalanced. If the stack is empty at the end, every opening bracket was closed. This is how compilers and code editors check your syntax in real time.',
      code: `function createStack() {
  const items = []
  return {
    push(v) { items.push(v) },
    pop()   { return items.pop() },
    peek()  { return items[items.length - 1] },
    isEmpty() { return items.length === 0 },
  }
}

function isBalanced(str) {
  const stack = createStack()
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const opens = new Set(['(', '[', '{'])

  for (const ch of str) {
    if (opens.has(ch)) {
      stack.push(ch)             // opening bracket — save it
    } else if (pairs[ch]) {
      if (stack.isEmpty()) return false          // nothing to match
      if (stack.pop() !== pairs[ch]) return false  // wrong bracket
    }
  }
  return stack.isEmpty()   // true only if all opens were closed
}

console.log(isBalanced('(a + b) * [c - d]'))   // true
console.log(isBalanced('function() { if(x) }')) // true
console.log(isBalanced('([)]'))                 // false — wrong order
console.log(isBalanced('((( '))                 // false — unclosed`,
    },

    {
      type: 'challenge',
      id: 'ch-stack',
      text: 'Build a browser history using a stack. Implement: visit(url) — push the url. back() — pop the current page and return it (or "start" if the stack is empty). current() — peek at the top. Visit "google.com", "news.com", "article.com". Call back() twice. Log current() — it should be "google.com".',
      expectedOutput: null,
      startCode: `function createStack() {
  const items = []
  return {
    push(v) { items.push(v) },
    pop()   { return items.length ? items.pop() : undefined },
    peek()  { return items[items.length - 1] },
    isEmpty() { return items.length === 0 },
  }
}

function createBrowserHistory() {
  const stack = createStack()

  return {
    visit(url)  { /* push the url */ },
    back()      { /* pop and return, or return 'start' */ },
    current()   { /* peek */ },
  }
}

const history = createBrowserHistory()
history.visit('google.com')
history.visit('news.com')
history.visit('article.com')

history.back()
history.back()
console.log(history.current())   // should be 'google.com'`,
      hint: 'visit: stack.push(url). back: return stack.pop() ?? "start". current: return stack.peek() ?? "start".',
      validate: ({ logs }) => logs.some(l => String(l).includes('google.com')),
    },

    { type: 'checkpoint', id: 'cp-stack' },

    // ── Step 4: The Command problem ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-command-problem',
      text: 'Here is the problem the Command pattern solves. You have a calculator. You want undo. The naive approach: store the old values before each operation. But this breaks when operations get complex, and it ties your undo logic to your calculator logic. Run this and notice that "undo" is just restoring a saved snapshot — it has no idea what operation was done. Add a multiply operation and undo has no idea how to reverse it.',
      code: `// The Command problem: undo by snapshot — fragile
const calc = { value: 0 }
let lastValue = 0   // only remembers ONE level of undo

function add(n) {
  lastValue = calc.value
  calc.value += n
  console.log('add', n, '→', calc.value)
}

function subtract(n) {
  lastValue = calc.value
  calc.value -= n
  console.log('sub', n, '→', calc.value)
}

function undo() {
  calc.value = lastValue   // restores one step — loses the operation type
  console.log('undo → ', calc.value)
}

add(10)
add(5)
subtract(3)
undo()      // one level of undo
undo()      // broken — same lastValue, doesn't go further back`,
    },

    // ── Step 5: The Command object ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-command-object',
      text: 'The Command pattern wraps each operation in an object that knows both how to do the operation AND how to undo it. The object has two functions: execute() and undo(). Execute runs the operation. Undo reverses it exactly — because the command object captured the operation type and the value at the time it was created. This is a closure: a closure is a function that remembers the variables from the scope where it was created, even after that scope has finished. The inner functions here close over "n" and "calc" — they carry those values with them.',
      code: `// A Command object: knows execute AND undo
function createAddCommand(calc, n) {
  return {
    execute() {
      calc.value += n
    },
    undo() {
      calc.value -= n   // exact reverse of execute
    },
    description: \`add \${n}\`,
  }
}

function createSubtractCommand(calc, n) {
  return {
    execute() { calc.value -= n },
    undo()    { calc.value += n },   // exact reverse
    description: \`subtract \${n}\`,
  }
}

const calc = { value: 0 }

const cmd1 = createAddCommand(calc, 10)
const cmd2 = createAddCommand(calc, 5)
const cmd3 = createSubtractCommand(calc, 3)

cmd1.execute()
cmd2.execute()
cmd3.execute()
console.log('value:', calc.value)   // 12

cmd3.undo()
console.log('after undo:', calc.value)   // 15

cmd2.undo()
console.log('after undo:', calc.value)   // 10`,
    },

    // ── Step 6: CommandHistory with a stack ───────────────────────────────────

    {
      type: 'narration',
      id: 'step6-history',
      text: 'Add a command history using a stack. Every time a command is executed, push it onto the stack. Undo pops the most recent command and calls its undo(). The stack guarantees that the last command executed is always the first one undone — LIFO is exactly the right behaviour for undo history. In CodeLens you will see the history stack grow with each operation and shrink with each undo.',
      code: `function createStack() {
  const items = []
  return { push(v){items.push(v)}, pop(){return items.pop()}, peek(){return items[items.length-1]}, isEmpty(){return items.length===0}, size(){return items.length} }
}

function createAddCommand(calc, n) {
  return { execute(){ calc.value+=n }, undo(){ calc.value-=n }, description: \`add \${n}\` }
}
function createSubtractCommand(calc, n) {
  return { execute(){ calc.value-=n }, undo(){ calc.value+=n }, description: \`sub \${n}\` }
}

// Step 6: CommandHistory uses the stack for LIFO undo
function createCommandHistory() {
  const history = createStack()

  return {
    execute(command) {
      command.execute()
      history.push(command)       // record the command after executing
      console.log('did:', command.description, '| history size:', history.size())
    },

    undo() {
      if (history.isEmpty()) { console.log('nothing to undo'); return }
      const command = history.pop()
      command.undo()
      console.log('undid:', command.description)
    },
  }
}

const calc = { value: 0 }
const hist = createCommandHistory()

hist.execute(createAddCommand(calc, 10))
hist.execute(createAddCommand(calc, 5))
hist.execute(createSubtractCommand(calc, 3))
console.log('value:', calc.value)   // 12

hist.undo()
console.log('value:', calc.value)   // 15
hist.undo()
console.log('value:', calc.value)   // 10`,
    },

    {
      type: 'challenge',
      id: 'ch-command',
      text: 'Add a MultiplyCommand to the calculator. Execute: add(10), multiply(3), subtract(5). Log the value (25). Then undo twice. Log the value (30).',
      expectedOutput: null,
      startCode: `function createStack() {
  const items = []
  return { push(v){items.push(v)}, pop(){return items.pop()}, isEmpty(){return items.length===0} }
}
function createAddCommand(calc, n) {
  return { execute(){ calc.value+=n }, undo(){ calc.value-=n } }
}
function createSubtractCommand(calc, n) {
  return { execute(){ calc.value-=n }, undo(){ calc.value+=n } }
}
function createCommandHistory() {
  const h = createStack()
  return {
    execute(cmd) { cmd.execute(); h.push(cmd) },
    undo() { if(!h.isEmpty()) h.pop().undo() },
  }
}

// Add createMultiplyCommand here
// multiply undo: divide — calc.value /= n

const calc = { value: 0 }
const hist = createCommandHistory()
hist.execute(createAddCommand(calc, 10))
// hist.execute(createMultiplyCommand(calc, 3))
// hist.execute(createSubtractCommand(calc, 5))
console.log(calc.value)   // expect 25
hist.undo()
hist.undo()
console.log(calc.value)   // expect 30`,
      hint: 'createMultiplyCommand: execute = value *= n, undo = value /= n.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseFloat(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(25) && nums.includes(30)
      },
    },

    { type: 'checkpoint', id: 'cp-command' },

    // ── Step 7: Add redo ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-redo',
      text: 'Undo/redo needs two stacks. The undo stack holds commands that have been executed. The redo stack holds commands that were undone. When you undo: pop from undo, call undo(), push onto redo. When you redo: pop from redo, call execute(), push back onto undo. When you execute a new command: push onto undo AND clear the redo stack — because a new action invalidates the redo history (you took a different path).',
      code: `function createStack() {
  const items = []
  return { push(v){items.push(v)}, pop(){return items.pop()}, peek(){return items[items.length-1]}, isEmpty(){return items.length===0} }
}

function createAddCommand(calc, n) {
  return { execute(){ calc.value+=n }, undo(){ calc.value-=n }, label: \`+\${n}\` }
}
function createSubtractCommand(calc, n) {
  return { execute(){ calc.value-=n }, undo(){ calc.value+=n }, label: \`-\${n}\` }
}

// Two stacks: undoStack and redoStack
function createCommandHistory() {
  const undoStack = createStack()
  const redoStack = createStack()

  return {
    execute(command) {
      command.execute()
      undoStack.push(command)
      // clear redo — new action invalidates the forward history
      while (!redoStack.isEmpty()) redoStack.pop()
    },

    undo() {
      if (undoStack.isEmpty()) return
      const cmd = undoStack.pop()
      cmd.undo()
      redoStack.push(cmd)   // can redo this
    },

    redo() {
      if (redoStack.isEmpty()) return
      const cmd = redoStack.pop()
      cmd.execute()
      undoStack.push(cmd)   // back in undo history
    },
  }
}

const calc = { value: 0 }
const hist = createCommandHistory()

hist.execute(createAddCommand(calc, 10))
hist.execute(createAddCommand(calc, 5))
console.log('value:', calc.value)   // 15

hist.undo()
console.log('after undo:', calc.value)   // 10

hist.redo()
console.log('after redo:', calc.value)   // 15

hist.undo()
hist.execute(createSubtractCommand(calc, 2))   // new action clears redo
console.log('new action:', calc.value)   // 8`,
    },

    {
      type: 'challenge',
      id: 'ch-undo',
      text: 'Using the two-stack CommandHistory: execute add(100), add(50), subtract(30). Undo twice. Redo once. Log the final value. Expected: 150.',
      expectedOutput: null,
      startCode: `function createStack() {
  const items = []
  return { push(v){items.push(v)}, pop(){return items.pop()}, isEmpty(){return items.length===0} }
}
function createAddCommand(c, n)      { return { execute(){ c.value+=n }, undo(){ c.value-=n } } }
function createSubtractCommand(c, n) { return { execute(){ c.value-=n }, undo(){ c.value+=n } } }
function createCommandHistory() {
  const u = createStack(), r = createStack()
  return {
    execute(cmd) { cmd.execute(); u.push(cmd); while(!r.isEmpty()) r.pop() },
    undo() { if(u.isEmpty()) return; const cmd=u.pop(); cmd.undo(); r.push(cmd) },
    redo() { if(r.isEmpty()) return; const cmd=r.pop(); cmd.execute(); u.push(cmd) },
  }
}

const calc = { value: 0 }
const hist = createCommandHistory()

// execute add(100), add(50), subtract(30)
// undo twice
// redo once
console.log(calc.value)   // expect 150`,
      hint: 'After add(100)+add(50)+sub(30) = 120. Undo twice → 100. Redo once → 150.',
      validate: ({ logs }) => logs.some(l => String(l).trim() === '150'),
    },

    { type: 'checkpoint', id: 'cp-undo' },

    // ── CodeLens ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Watch the two stacks. Each hist.execute pushes onto undoStack — watch it grow. hist.undo pops from undoStack and pushes onto redoStack — watch the transfer. hist.redo reverses it. Pay attention to what happens to redoStack when a new execute() fires: the while loop drains it completely.',
      code: `function createStack() {
  const items = []
  return { push(v){items.push(v)}, pop(){return items.pop()}, isEmpty(){return items.length===0}, size(){return items.length} }
}
function createAdd(c, n)  { return { execute(){ c.value+=n }, undo(){ c.value-=n }, label:\`+\${n}\` } }
function createSub(c, n)  { return { execute(){ c.value-=n }, undo(){ c.value+=n }, label:\`-\${n}\` } }

function createHistory() {
  const u = createStack(), r = createStack()
  return {
    execute(cmd) { cmd.execute(); u.push(cmd); while(!r.isEmpty()) r.pop() },
    undo() { if(!u.isEmpty()){ const c=u.pop(); c.undo(); r.push(c) } },
    redo() { if(!r.isEmpty()){ const c=r.pop(); c.execute(); u.push(c) } },
  }
}

const calc = { value: 0 }
const hist = createHistory()

hist.execute(createAdd(calc, 10))
hist.execute(createAdd(calc, 5))
hist.execute(createSub(calc, 3))

console.log(calc.value)   // 12
hist.undo()
console.log(calc.value)   // 15
hist.redo()
console.log(calc.value)   // 12`,
    },

    {
      type: 'codelens',
      id: 'cl-stack-command',
      text: 'Step through in CodeLens. Watch the Variables panel to see undoStack and redoStack change with every operation. Watch the undo transfer a command from undoStack to redoStack. Watch redo move it back. This is the Command pattern: behaviour packaged as data — each command object carries both the action and its inverse.',
      code: `function createStack() {
  const items = []
  return { push(v){items.push(v)}, pop(){return items.pop()}, isEmpty(){return items.length===0} }
}
function createAdd(c, n)  { return { execute(){ c.value+=n }, undo(){ c.value-=n }, label:\`+\${n}\` } }
function createSub(c, n)  { return { execute(){ c.value-=n }, undo(){ c.value+=n }, label:\`-\${n}\` } }

function createHistory() {
  const u = createStack(), r = createStack()
  return {
    execute(cmd) { cmd.execute(); u.push(cmd); while(!r.isEmpty()) r.pop() },
    undo() { if(!u.isEmpty()){ const c=u.pop(); c.undo(); r.push(c) } },
    redo() { if(!r.isEmpty()){ const c=r.pop(); c.execute(); u.push(c) } },
  }
}

const calc = { value: 0 }
const hist = createHistory()
hist.execute(createAdd(calc, 10))
hist.execute(createAdd(calc, 5))
hist.undo()
hist.redo()
console.log(calc.value)`,
      lang: 'js',
    },

  ],
}
