// DSA + Design Patterns — Lesson 07
// Doubly Linked Lists + Memento

export const lesson = {
  id: 'dsa-patterns-07',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '7. Doubly Linked Lists + Memento',
  checkpoints: [
    { id: 'cp-doubly',  label: 'Doubly Linked List' },
    { id: 'cp-memento', label: 'Memento Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Every time you press Ctrl+Z, something has to know what the state was before your last action. Not just the current state — the exact previous state. And the one before that. And the one before that, back to when you opened the file. A singly linked list — a chain of nodes where each node knows what comes next — can only go forward. But undo requires going backward. A browser history lets you press Back as well as Forward. A text cursor can move left as well as right. A playlist can skip to the previous track. In all of these cases, movement in both directions is a fundamental requirement. This lesson is about the data structure that makes bidirectional traversal efficient — and the design pattern that makes state history safe to store and restore.',
      code: null,
    },

    // ── Step 1: Singly linked list recap ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-singly-recap',
      text: 'Recap from the Linked Lists lesson: a singly linked list is a chain of nodes. Each node is a plain object with a value and a next reference (a reference stores a memory address pointing to the next node). The list has a head: the entry point. Traversal means following next references from head until you reach a node whose next is null — the tail. The problem with singly linked lists: next only goes forward. To reach a previous node you have to start from head and traverse forward again — O(n) to go back one step. For undo, O(n) per undo is unacceptable.',
      code: `// Recap: singly linked list — forward only
class SinglyNode {
  constructor(value) {
    this.value = value
    this.next  = null   // reference to the next node, or null if this is the tail
  }
}

const a = new SinglyNode('step 1')
const b = new SinglyNode('step 2')
const c = new SinglyNode('step 3')

a.next = b
b.next = c

// Traverse forward: easy
let node = a
while (node !== null) {
  console.log(node.value)
  node = node.next
}

// Traverse backward from c: impossible without restarting from head
// c.prev does not exist — there is no going back`,
    },

    // ── Step 2: The doubly linked node ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-doubly-node',
      text: 'A doubly linked list solves the backward-traversal problem by adding a prev reference to every node alongside next. prev is a reference pointing to the previous node in the chain — or null if this is the head node. Now from any node you can go forward with node.next or backward with node.prev in O(1) — constant time — because the previous node\'s address is stored directly in the current node. No searching from head required.',
      code: `class DoublyNode {
  constructor(value) {
    this.value = value
    this.next  = null   // reference to next node
    this.prev  = null   // ← NEW: reference to previous node
  }
}

const a = new DoublyNode('step 1')
const b = new DoublyNode('step 2')
const c = new DoublyNode('step 3')

// Wire both directions
a.next = b; b.prev = a   // ← NEW
b.next = c; c.prev = b   // ← NEW

// Forward traversal
let node = a
while (node !== null) { process.stdout.write && console.log(node.value) || console.log(node.value); node = node.next }

// Backward traversal — now O(1) per step
let back = c
const visited = []
while (back !== null) { visited.push(back.value); back = back.prev }
console.log(visited)  // ['step 3', 'step 2', 'step 1']`,
    },

    // ── Step 3: The DoublyList class — prepend and append ────────────────────

    {
      type: 'narration',
      id: 'step3-list-class',
      text: 'Build the DoublyList class. It maintains both a head (entry from the front) and a tail (entry from the back). append() adds a new node at the tail in O(1) — constant time — because tail is always a direct reference to the last node, no traversal needed. prepend() adds at the head in O(1) for the same reason.',
      code: `class DoublyList {
  constructor() {
    this.head = null   // first node
    this.tail = null   // last node — direct reference, no traversal
    this.size = 0
  }

  append(value) {                  // ← NEW: add to the tail
    const node = new DoublyNode(value)
    if (this.tail === null) {
      this.head = node             // first node: both head and tail
      this.tail = node
    } else {
      node.prev  = this.tail       // new node points back to old tail
      this.tail.next = node        // old tail points forward to new node
      this.tail = node             // tail reference moves to new node
    }
    this.size++
  }
}

class DoublyNode {
  constructor(v) { this.value = v; this.next = null; this.prev = null }
}

const list = new DoublyList()
list.append('a')
list.append('b')
list.append('c')

console.log(list.head.value)        // 'a'
console.log(list.tail.value)        // 'c'
console.log(list.tail.prev.value)   // 'b' — direct O(1) access`,
    },

    // ── Step 4: O(1) deletion by reference ───────────────────────────────────

    {
      type: 'narration',
      id: 'step4-deletion',
      text: 'The most powerful feature of a doubly linked list is O(1) deletion when you already have a reference to the node you want to remove. In an array, removing from the middle is O(n) because every element after the removed item must shift. In a singly linked list, removing a node requires traversing from head to find its predecessor. In a doubly linked list, each node already knows its predecessor (prev) and successor (next) — so unlinking it is three pointer updates regardless of list size. Prepend is O(1) because head is updated directly. Append is O(1) because tail is updated directly. Delete by node reference is O(1) because prev and next are both available.',
      code: `// Add removeNode() to DoublyList
// (continuing from the class above)

// O(1) delete: we have the node, we have its prev and next
function removeNode(list, node) {
  if (node.prev !== null) {
    node.prev.next = node.next    // predecessor skips over node
  } else {
    list.head = node.next         // node was the head — update head
  }

  if (node.next !== null) {
    node.next.prev = node.prev    // successor skips back over node
  } else {
    list.tail = node.prev         // node was the tail — update tail
  }

  node.next = null                // clean up node's references
  node.prev = null
  list.size--
}

// Demonstrate: remove the middle node in O(1)
class DN { constructor(v) { this.value = v; this.next = null; this.prev = null } }
class DL { constructor() { this.head = null; this.tail = null; this.size = 0 }
  append(v) { const n = new DN(v); if (!this.tail) { this.head = n; this.tail = n } else { n.prev = this.tail; this.tail.next = n; this.tail = n } this.size++ }
}

const list = new DL()
list.append('a'); list.append('b'); list.append('c')
const midNode = list.head.next   // the 'b' node — O(1) access, already have the ref

removeNode(list, midNode)         // O(1) removal

console.log(list.head.value)      // 'a'
console.log(list.head.next.value) // 'c' — 'b' is gone
console.log(list.tail.prev.value) // 'a'
console.log(list.size)            // 2`,
    },

    // ── Challenge: doubly linked list ─────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-doubly',
      text: 'Add a prepend(value) method to the DoublyList class below. prepend() inserts a new node at the head of the list. The new node\'s next should point to the old head. The old head\'s prev should point to the new node. Update this.head to the new node. If the list was empty, also update this.tail. Increment this.size. Test: prepend "a", "b", "c" in that order. The head should be "c" and tail should be "a". Log head.value and tail.value.',
      expectedOutput: null,
      startCode: `class DoublyNode {
  constructor(v) { this.value = v; this.next = null; this.prev = null }
}

class DoublyList {
  constructor() { this.head = null; this.tail = null; this.size = 0 }

  prepend(value) {
    const node = new DoublyNode(value)
    // wire node.next and old head.prev, then update this.head
    // if list is empty, set this.tail = node too
  }
}

const list = new DoublyList()
list.prepend('a')
list.prepend('b')
list.prepend('c')

console.log(list.head.value)  // 'c' — last prepended is at front
console.log(list.tail.value)  // 'a' — first prepended is at back
console.log(list.size)        // 3`,
      hint: 'node.next = this.head; if (this.head !== null) this.head.prev = node; this.head = node; if (this.tail === null) this.tail = node; this.size++',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs.includes('c') && strs.includes('a') && strs.includes('3')
      },
    },

    { type: 'checkpoint', id: 'cp-doubly' },

    // ── Step 5: Memento pattern intro ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-memento-intro',
      text: 'The Memento pattern captures and stores the state of an object at a moment in time, so that the object can be restored to that state later. The snapshot is called a memento — an object that holds the saved state. Three roles: the originator (the object whose state is being saved), the memento (the snapshot object), and the caretaker (the object that holds the list of mementos and decides when to save and restore). The originator creates mementos by packaging its state. The caretaker stores them. When undo is needed, the caretaker hands the most recent memento back to the originator, which restores itself from it. The key rule: the originator\'s internal state is only accessible through its own save/restore methods — the caretaker holds mementos but cannot read or modify what is inside them.',
      code: null,
    },

    // ── Step 6: Memento in code ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-memento-code',
      text: 'Build a text editor with undo. The editor (originator) saves its state to a memento on each change. The history (caretaker) holds the stack of mementos.',
      code: `// Memento: captures one snapshot of the editor state
class EditorMemento {
  constructor(text, cursorPos) {
    this._text      = text        // private — caretaker cannot modify this
    this._cursorPos = cursorPos
  }
  getText()      { return this._text }       // originator accesses via these methods
  getCursorPos() { return this._cursorPos }
}

// Originator: the text editor
class TextEditor {
  constructor() {
    this.text      = ''
    this.cursorPos = 0
  }

  type(chars) {                          // ← NEW
    this.text += chars
    this.cursorPos += chars.length
  }

  save() {                               // ← NEW: create a memento of current state
    return new EditorMemento(this.text, this.cursorPos)
  }

  restore(memento) {                     // ← NEW: restore state from a memento
    this.text      = memento.getText()
    this.cursorPos = memento.getCursorPos()
  }
}

// Caretaker: manages the history of mementos
class EditorHistory {
  constructor() { this.history = [] }          // ← NEW

  push(memento) { this.history.push(memento) } // ← NEW

  pop() { return this.history.pop() || null }  // ← NEW
}`,
    },

    // ── Step 7: Full undo/redo demo ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-undo-demo',
      text: 'Wire together the editor, memento, and history to implement undo. Save a memento before each change. Undoing restores the most recent saved state.',
      code: `class EditorMemento {
  constructor(t, c) { this._t = t; this._c = c }
  getText() { return this._t }
  getCursorPos() { return this._c }
}

class TextEditor {
  constructor() { this.text = ''; this.cursorPos = 0 }
  type(chars)       { this.text += chars; this.cursorPos += chars.length }
  save()            { return new EditorMemento(this.text, this.cursorPos) }
  restore(memento)  { this.text = memento.getText(); this.cursorPos = memento.getCursorPos() }
}

class EditorHistory {
  constructor() { this.stack = [] }
  push(m) { this.stack.push(m) }
  pop()   { return this.stack.pop() || null }
}

const editor  = new TextEditor()
const history = new EditorHistory()

history.push(editor.save())   // save initial state (empty)
editor.type('Hello')
history.push(editor.save())   // save after typing 'Hello'
editor.type(' World')
history.push(editor.save())   // save after typing ' World'
editor.type('!!!')

console.log('Current:', editor.text)   // 'Hello World!!!'

const m1 = history.pop()
editor.restore(m1)
console.log('After undo:', editor.text) // 'Hello World'

const m2 = history.pop()
editor.restore(m2)
console.log('After undo:', editor.text) // 'Hello'`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-meeting',
      text: 'This is where the two ideas meet. A doubly linked list is the natural data structure for an undo history: each node holds one state snapshot, next moves forward through history (redo), and prev moves backward (undo). O(1) insertion when a new state is saved (append to tail), O(1) backward movement when undoing (follow prev). The Memento pattern defines what gets stored in each node: a self-contained snapshot that the originator knows how to restore, and that the caretaker holds without being able to corrupt. The doubly linked list is the mechanism that makes navigation efficient. The Memento pattern is the principle that defines what gets stored and how. Together they are a complete undo system.',
      code: null,
    },

    // ── Challenge: Memento ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-memento',
      text: 'Write a class called DrawingCanvas with two methods: addShape(shape) appends a shape string to an internal shapes array, and save() returns a memento object { shapes: [...this.shapes] } (a shallow copy of the shapes array). Also write a restore(memento) method that replaces this.shapes with a copy of memento.shapes. Then demonstrate undo: add "circle", save, add "square", save, add "triangle". Undo twice by calling restore with saved mementos. After two undos, the canvas should contain only ["circle"]. Log the final shapes array length (1) and shapes[0] ("circle").',
      expectedOutput: null,
      startCode: `class DrawingCanvas {
  constructor() { this.shapes = [] }

  addShape(shape) {
    this.shapes.push(shape)
  }

  save() {
    // return a memento — a snapshot of the current shapes
  }

  restore(memento) {
    // restore shapes from the memento
  }
}

const canvas  = new DrawingCanvas()
const history = []

canvas.addShape('circle')
history.push(canvas.save())

canvas.addShape('square')
history.push(canvas.save())

canvas.addShape('triangle')

canvas.restore(history.pop())  // undo: back to after 'square'
canvas.restore(history.pop())  // undo: back to after 'circle'

console.log(canvas.shapes.length)  // 1
console.log(canvas.shapes[0])      // 'circle'`,
      hint: 'save(): return { shapes: [...this.shapes] }. restore(m): this.shapes = [...m.shapes]',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs.includes('1') && strs.includes('circle')
      },
    },

    { type: 'checkpoint', id: 'cp-memento' },

    // ── Step 9: Combined ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step9-combined',
      text: 'Build a browser history component that uses a doubly linked list as its underlying structure and Memento-style snapshots as its nodes. Navigating Back and Forward moves a "current" pointer — O(1) per step. The list grows as new pages are visited. Visiting a new page from a middle position truncates forward history, exactly like real browser behavior.',
      code: `class HistoryNode {
  constructor(url) {
    this.url  = url
    this.next = null   // forward
    this.prev = null   // backward
  }
}

class BrowserHistory {
  constructor(startUrl) {
    this.current = new HistoryNode(startUrl)
  }

  visit(url) {
    const node      = new HistoryNode(url)
    node.prev       = this.current
    this.current.next = node       // truncates any forward history
    this.current    = node
  }

  back() {
    if (this.current.prev === null) {
      console.log('No more back history')
      return this.current.url
    }
    this.current = this.current.prev   // O(1)
    return this.current.url
  }

  forward() {
    if (this.current.next === null) {
      console.log('No more forward history')
      return this.current.url
    }
    this.current = this.current.next   // O(1)
    return this.current.url
  }
}

const history = new BrowserHistory('google.com')
history.visit('github.com')
history.visit('docs.github.com')

console.log(history.back())       // 'github.com'
console.log(history.back())       // 'google.com'
console.log(history.forward())    // 'github.com'
history.visit('anthropic.com')    // visit new page — forward history truncated
console.log(history.forward())    // 'No more forward history'`,
    },

    // ── Challenge: combined ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Add a canGoBack() and canGoForward() method to the BrowserHistory class below. canGoBack() returns true if this.current.prev is not null. canGoForward() returns true if this.current.next is not null. Then: create a history starting at "home", visit "about" and "contact". Log canGoBack() (true), call back(), log the current URL ("about"), log canGoForward() (true).',
      expectedOutput: null,
      startCode: `class HistoryNode {
  constructor(url) { this.url = url; this.next = null; this.prev = null }
}

class BrowserHistory {
  constructor(start) { this.current = new HistoryNode(start) }

  visit(url) {
    const n = new HistoryNode(url)
    n.prev = this.current
    this.current.next = n
    this.current = n
  }

  back() {
    if (this.current.prev) this.current = this.current.prev
    return this.current.url
  }

  canGoBack()    { /* return true if there is a previous node */ }
  canGoForward() { /* return true if there is a next node */ }
}

const h = new BrowserHistory('home')
h.visit('about')
h.visit('contact')

console.log(h.canGoBack())     // true
console.log(h.back())          // 'about'
console.log(h.canGoForward())  // true`,
      hint: 'canGoBack(): return this.current.prev !== null. canGoForward(): return this.current.next !== null',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim().toLowerCase())
        return strs.includes('true') && strs.includes('about')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through the BrowserHistory.visit() call. Watch the Variables panel as the HistoryNode is created: node.prev receives the current node\'s address. Then watch current.next receive the new node\'s address. Watch this.current move to the new node. Both directions are now wired. Then call back(): watch this.current move to current.prev — O(1), one reference dereference. Then call forward(): watch current move to current.next. No iteration. No searching from head. The doubly linked structure makes each navigation step a single pointer dereference.',
      code: `class HistoryNode {
  constructor(url) { this.url = url; this.next = null; this.prev = null }
}
class BrowserHistory {
  constructor(start) { this.current = new HistoryNode(start) }
  visit(url) {
    const n = new HistoryNode(url)
    n.prev = this.current
    this.current.next = n
    this.current = n
  }
  back()    { if (this.current.prev) this.current = this.current.prev; return this.current.url }
  forward() { if (this.current.next) this.current = this.current.next; return this.current.url }
}
const h = new BrowserHistory('home')
h.visit('about')
h.visit('contact')
console.log('at:', h.current.url)
console.log('back:', h.back())
console.log('forward:', h.forward())`,
    },

    {
      type: 'codelens',
      id: 'cl-doubly-memento',
      text: `Step to: n.prev = this.current
Variables panel: n.prev now holds the address of the 'about' node. The chain runs backward.

Step to: this.current.next = n
Variables panel: the 'about' node's next now holds the address of the new 'contact' node. The chain runs forward.

Step to: this.current = n
Variables panel: this.current moves from 'about' to 'contact'. The cursor is now at the end.

Step to: h.back() → this.current = this.current.prev
Variables panel: this.current instantly moves back to 'about'. One pointer dereference. O(1).`,
      code: `class HistoryNode {
  constructor(url) { this.url = url; this.next = null; this.prev = null }
}
class BrowserHistory {
  constructor(start) { this.current = new HistoryNode(start) }
  visit(url) {
    const n = new HistoryNode(url)
    n.prev = this.current
    this.current.next = n
    this.current = n
  }
  back() { if (this.current.prev) this.current = this.current.prev; return this.current.url }
  forward() { if (this.current.next) this.current = this.current.next; return this.current.url }
}
const h = new BrowserHistory('home')
h.visit('about')
h.visit('contact')
console.log(h.back())
console.log(h.forward())`,
      lang: 'js',
    },

  ],
}
