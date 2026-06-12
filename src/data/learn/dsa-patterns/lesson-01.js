// DSA + Design Patterns — Lesson 01
// Arrays and the Factory Pattern

export const lesson = {
  id: 'dsa-patterns-01',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '1. Arrays and the Factory Pattern',
  checkpoints: [
    { id: 'cp-arrays',   label: 'Arrays' },
    { id: 'cp-factory',  label: 'Factory Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'This series teaches Data Structures and Design Patterns together — because they belong together. A data structure is how you organise information in memory. A design pattern is a proven solution to a problem that keeps coming up in how software is written. You cannot build serious software without both. We start with arrays and the Factory pattern. In every lesson we will build code one piece at a time, and finish by opening it in CodeLens so you can watch execution step by step.',
      code: null,
    },

    // ── Step 1: A bare array ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-bare-array',
      text: 'Start with the simplest possible thing: an empty array. An array stores an ordered list of values in a single contiguous block of memory. Every slot in memory is right next to the previous one. That physical arrangement is what makes reading by index instant — the computer calculates (start address + index × slot size) and jumps directly there, no searching. Run this and watch the array appear in the output. In CodeLens you will see this array as a variable in the Variables panel — click "Open in CodeLens" in the editor bar above to watch it execute.',
      code: `// Step 1: an array and what reading by index actually does
const scores = [95, 82, 78, 91, 64]

// Reading by index is O(1) — instant, same cost for any size array
console.log(scores[0])   // first slot
console.log(scores[4])   // fifth slot — no searching, direct jump
console.log(scores[2])   // middle — still instant

console.log('Length:', scores.length)`,
    },

    // ── Step 2: Writing and adding ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-write-add',
      text: 'Now add writing and the two fast operations: push (add to the end) and pop (remove from the end). Both are O(1) — constant time regardless of array size. Push works by putting the new item in the slot right after the last item and updating the length counter. Pop works by decreasing the length counter — the value is still in memory but the array no longer considers it part of its contents. In CodeLens, watch how the array length changes with each push and pop.',
      code: `const scores = [95, 82, 78, 91, 64]

// Overwrite a value — O(1)
scores[2] = 100
console.log('After overwrite:', scores[2])

// Push: add to end — O(1) amortised
scores.push(88)
console.log('After push, length:', scores.length)

// Pop: remove from end — O(1)
const removed = scores.pop()
console.log('Popped:', removed)
console.log('After pop, length:', scores.length)`,
    },

    // ── Step 3: The slow operation ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-slow',
      text: 'Here is the expensive operation: inserting or removing from the middle. Because every value is packed tightly in memory, making a gap in the middle means physically moving every item after the insertion point one slot to the right. For an array of 1 million items, inserting at position 0 means 1 million memory writes. This is O(n) — the cost grows with the number of items. In CodeLens, when you step through splice() you will see the array rewritten slot by slot. This is exactly why Linked Lists (lesson 2) exist.',
      code: `const scores = [95, 82, 78, 91, 64]

// splice(index, deleteCount, newItem)
// Insert at position 2 — every item from position 2 onward shifts right
scores.splice(2, 0, 99)
console.log('After insert at 2:', scores)

// Remove from position 1 — every item after shifts left
const taken = scores.splice(1, 1)
console.log('Removed:', taken[0])
console.log('Final array:', scores)
console.log('Length:', scores.length)`,
    },

    {
      type: 'narration',
      id: 'big-o',
      text: 'You have now seen O(1) and O(n). Big O notation describes how an operation\'s cost grows with the size of the data. O(1) means constant — the same cost whether the array has 5 items or 5 billion. O(n) means linear — double the array size, double the cost. Big O is the vocabulary that lets you compare data structures and choose the right one for a problem. We will use it for every data structure in this series.',
      code: null,
    },

    {
      type: 'challenge',
      id: 'ch-arrays',
      text: 'Create an array of three numbers. Push two more. Pop the last one. Then use splice to remove the item at index 1. Log the final array and its length.',
      expectedOutput: null,
      startCode: `const nums = [10, 20, 30]
// push 40 and 50
// pop the last
// splice to remove index 1
console.log(nums)
console.log(nums.length)`,
      hint: 'After push(40) and push(50) the array is [10,20,30,40,50]. pop() removes 50. splice(1,1) removes the item at index 1 (which is 20). Final: [10,30,40].',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('10') && flat.includes('30') && flat.includes('40') && !flat.includes('50') && !flat.includes('20')
      },
    },

    { type: 'checkpoint', id: 'cp-arrays' },

    // ── Step 4: The Factory problem ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-problem',
      text: 'Arrays of objects are where code gets interesting — and fragile. The moment you build the same shape of object in multiple places, you have a maintenance problem. Run this code and find the bug before reading on.',
      code: `// Building task objects by hand in multiple places
const tasks = []

tasks.push({ title: 'Write tests',   priority: 'high', status: 'todo' })
tasks.push({ title: 'Fix login bug', priority: 'high', status: 'in-progress' })
tasks.push({ title: 'Update docs',   priority: 'low',  status: 'todo' })

// A new team member adds a task six months later...
tasks.push({ tittle: 'Deploy',  priorty: 'high', status: 'todo' })
//            ^^^^^^              ^^^^^^^
//            typo               typo — silent bug, no error thrown

const urgent = tasks.filter(t => t.priority === 'high')
console.log('Urgent tasks:', urgent.length)
// Expected: 3. Actual: 2 — the misspelled task is invisible`,
    },

    {
      type: 'narration',
      id: 'step5-factory-intro',
      text: 'Two typos, zero errors thrown. The object was created just fine — it simply has a different shape than the others. Any code looking for "priority" will never find it on that task. This is the problem the Factory pattern solves. A Factory is a function whose single job is creating objects of a specific shape. The shape is defined once — in the factory. Callers never write the shape themselves. If the shape changes, you change the factory, not every call site.',
      code: null,
    },

    // ── Step 5: Build the factory piece by piece ──────────────────────────────

    {
      type: 'narration',
      id: 'step5-factory-v1',
      text: 'Build the factory in stages. Start with the simplest version: just return the object. Notice the factory owns every property name. A caller who types "tittle" instead of "title" gets a TypeError or simply passes a wrong title — they cannot accidentally create a broken shape.',
      code: `// Factory version 1: just return the object
function createTask(title, priority) {
  return {
    title,       // shorthand: same as title: title
    priority,
    status: 'todo',
  }
}

const t = createTask('Write tests', 'high')
console.log(t.title)
console.log(t.priority)
console.log(t.status)   // default is always there`,
    },

    {
      type: 'narration',
      id: 'step6-factory-defaults',
      text: 'Version 2: add a default for priority. Parameters with defaults are assigned when the caller does not provide them. This means "medium" is always the priority unless the caller explicitly passes something else. The factory is also the right place for defaults — not scattered through your code.',
      code: `// Factory version 2: defaults
function createTask(title, priority = 'medium') {
  return {
    title,
    priority,
    status: 'todo',
  }
}

const t1 = createTask('Write tests', 'high')
const t2 = createTask('Update docs')   // no priority given

console.log(t1.priority)   // 'high'
console.log(t2.priority)   // 'medium' — default kicked in`,
    },

    {
      type: 'narration',
      id: 'step7-factory-validation',
      text: 'Version 3: add validation. The factory now enforces the rules of a valid task. If the caller passes garbage, they get an error at the point of creation — not a silent bug that surfaces much later. In CodeLens you will see the if statement branches executing and the Error being thrown when invalid input is given.',
      code: `// Factory version 3: validation
function createTask(title, priority = 'medium') {
  if (!title || typeof title !== 'string') {
    throw new Error('Task title must be a non-empty string')
  }
  if (!['low', 'medium', 'high'].includes(priority)) {
    throw new Error('Priority must be low, medium, or high')
  }
  return {
    id: Math.floor(Math.random() * 10000),
    title: title.trim(),
    priority,
    status: 'todo',
  }
}

const t = createTask('Write tests', 'high')
console.log(t)

// This will throw — try it:
// createTask('', 'high')     // missing title
// createTask('Deploy', 'hig') // typo in priority — caught immediately`,
    },

    {
      type: 'narration',
      id: 'step8-factory-full',
      text: 'Here is the complete picture: an array of tasks where every task was created by the factory. The filter now works correctly because every object is guaranteed to have the right shape. This is the Factory pattern — one function, one responsibility, one source of truth for an object\'s shape.',
      code: `function createTask(title, priority = 'medium') {
  if (!title || typeof title !== 'string') throw new Error('Title required')
  if (!['low', 'medium', 'high'].includes(priority)) throw new Error('Bad priority')
  return { id: Math.floor(Math.random() * 10000), title: title.trim(), priority, status: 'todo' }
}

const tasks = []
tasks.push(createTask('Write tests',   'high'))
tasks.push(createTask('Fix login bug', 'high'))
tasks.push(createTask('Update docs',   'low'))
tasks.push(createTask('Deploy'))   // defaults to medium

const urgent = tasks.filter(t => t.priority === 'high')
console.log('Total tasks:', tasks.length)     // 4
console.log('Urgent tasks:', urgent.length)   // 2
console.log('First urgent:', urgent[0].title)`,
    },

    {
      type: 'challenge',
      id: 'ch-factory',
      text: 'Write a createProduct(name, price, category) factory. Validate that name is a non-empty string and price is a positive number. Default category to "general". Create three products and log the name of the cheapest one.',
      expectedOutput: null,
      startCode: `function createProduct(name, price, category = 'general') {
  // validate name and price, then return the product object
}

const p1 = createProduct('Laptop', 999, 'electronics')
const p2 = createProduct('Pen', 2, 'stationery')
const p3 = createProduct('Desk', 350, 'furniture')

// find and log the cheapest product's name`,
      hint: 'Check typeof name === "string" && name.length > 0, and typeof price === "number" && price > 0. Sort or use reduce to find the minimum price.',
      validate: ({ logs }) => logs.some(l => l.toLowerCase().includes('pen')),
    },

    { type: 'checkpoint', id: 'cp-factory' },

    // ── Step 9: Put it together ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step9-together',
      text: 'Now combine arrays and the Factory into a Task Queue — a real software component. A queue is FIFO: first in, first out. Items enter at the back and leave from the front. The array provides the storage; the factory provides the shape guarantee. Read each method before running: enqueue adds to the back with push(), dequeue removes from the front with shift().',
      code: `function createTask(title, priority = 'medium') {
  if (!title) throw new Error('Title required')
  return { id: Math.floor(Math.random() * 10000), title, priority, status: 'todo' }
}

// A queue built on an array
const queue = {
  items: [],

  enqueue(title, priority) {
    this.items.push(createTask(title, priority))
    console.log('Enqueued:', title, '| Queue length:', this.items.length)
  },

  dequeue() {
    if (this.items.length === 0) return null
    const task = this.items.shift()  // O(n) — note the cost
    console.log('Dequeued:', task.title)
    return task
  },

  peek() {
    return this.items[0] ?? null
  },
}

queue.enqueue('Write tests',   'high')
queue.enqueue('Fix bug',       'high')
queue.enqueue('Update docs',   'low')

queue.dequeue()
queue.dequeue()

console.log('Remaining:', queue.items.length)
console.log('Next up:', queue.peek()?.title)`,
    },

    {
      type: 'narration',
      id: 'step9-shift-cost',
      text: 'Notice: queue.dequeue() uses array shift(), which is O(n) — removing from the front means every remaining item shifts left one position. For a small queue this is fine. For a queue processing millions of requests per second it is a problem. This is exactly why the Linked List (lesson 2) is a better foundation for a production queue: removing from the front of a linked list is O(1) — just move the head pointer forward. The data structure choice has real performance consequences.',
      code: null,
    },

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Build a print queue using the queue pattern above. Add three print jobs using a createPrintJob(document, pages) factory. Dequeue the first job. Log the remaining queue length and the title of the next job. Expected: length 2, next job name.',
      expectedOutput: null,
      startCode: `function createPrintJob(document, pages) {
  // validate: document must be a string, pages must be > 0
  return { document, pages, status: 'queued' }
}

const printQueue = { items: [], enqueue(d,p) { this.items.push(createPrintJob(d,p)) }, dequeue() { return this.items.shift() } }

printQueue.enqueue('Report.pdf', 12)
printQueue.enqueue('Invoice.pdf', 2)
printQueue.enqueue('Letter.pdf', 1)

printQueue.dequeue()

console.log(printQueue.items.length)
console.log(printQueue.items[0].document)`,
      hint: 'After adding 3 and removing 1, length should be 2 and the next document should be Invoice.pdf.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('2') && (flat.toLowerCase().includes('invoice') || flat.toLowerCase().includes('.pdf'))
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── Open in CodeLens ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'You built the full array + factory + queue combination piece by piece. Now open it in CodeLens using the button above the editor. Step through the execution one line at a time. Watch the Variables panel on the right: you will see the queue.items array grow with each enqueue, and shrink with dequeue. Watch how shift() rebuilds the array after removal — that is the O(n) cost made visible.',
      code: `function createTask(title, priority = 'medium') {
  if (!title) throw new Error('Title required')
  return { id: Math.floor(Math.random() * 100), title, priority, status: 'todo' }
}

const queue = { items: [] }

function enqueue(title, priority) {
  queue.items.push(createTask(title, priority))
}

function dequeue() {
  return queue.items.shift()
}

enqueue('Write tests',   'high')
enqueue('Fix bug',       'high')
enqueue('Update docs',   'low')

const first = dequeue()
const second = dequeue()

console.log('Processed:', first.title)
console.log('Processed:', second.title)
console.log('Remaining:', queue.items.length)
console.log('Next:', queue.items[0].title)`,
    },

    {
      type: 'codelens',
      id: 'cl-arrays-factory',
      text: 'Step through this code in CodeLens. Watch the Variables panel as each enqueue creates a new object and adds it to queue.items. When dequeue runs, watch shift() remove from position 0 and see the array reorganise. Pay attention to the call stack on each createTask call — you are watching the factory execute.',
      code: `function createTask(title, priority = 'medium') {
  if (!title) throw new Error('Title required')
  return { id: Math.floor(Math.random() * 100), title, priority, status: 'todo' }
}

const queue = { items: [] }

function enqueue(title, priority) {
  queue.items.push(createTask(title, priority))
}

function dequeue() {
  return queue.items.shift()
}

enqueue('Write tests',   'high')
enqueue('Fix bug',       'high')
enqueue('Update docs',   'low')

const first = dequeue()
const second = dequeue()

console.log('Processed:', first.title)
console.log('Processed:', second.title)
console.log('Remaining:', queue.items.length)
console.log('Next:', queue.items[0].title)`,
      lang: 'js',
    },

  ],
}
