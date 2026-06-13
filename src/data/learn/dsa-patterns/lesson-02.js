// DSA + Design Patterns — Lesson 02
// References + Prototype

export const lesson = {
  id: 'dsa-patterns-02',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '2. References + Prototype',
  checkpoints: [
    { id: 'cp-references', label: 'References' },
    { id: 'cp-prototype',  label: 'Prototype Pattern' },
    { id: 'cp-together',   label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You have a user object. You pass it to a function. The function changes a field. You come back to your original object — and it has changed too. You never touched it. No error. No warning. Just silent data corruption that shows up somewhere else entirely, much later. You have a configuration object. You copy it to create a modified version. You change one field in the copy. The original changes too. How? You made a copy. Except you did not — not in the way you think. Both of these bugs come from the same misunderstanding about how JavaScript actually stores objects in memory. Once you understand the real answer, you will also understand a design pattern that solves the problem in a principled, repeatable way.',
      code: null,
    },

    // ── Step 1: Primitives vs objects in memory ───────────────────────────────

    {
      type: 'narration',
      id: 'step1-primitives',
      text: 'JavaScript stores two kinds of values in two different places in memory. Primitives — numbers, strings, booleans, null, undefined — are stored directly inside the variable. When you assign a primitive to another variable, you get an independent copy of the value. Changing the second variable does not affect the first. This is called value semantics: the variable holds the value itself. Objects — plain objects, arrays, class instances — are stored on the heap. The heap is the large region of memory where JavaScript allocates complex data that may grow or shrink at runtime. When you assign an object to a variable, the variable does not store the object. It stores a reference — a memory address that points to where the object lives on the heap. This is called reference semantics: the variable holds an address, not the data itself.',
      code: `// Primitives: each variable holds its own copy of the value
let a = 42
let b = a        // b gets a COPY of the number 42
b = 100
console.log(a)   // 42 — a is unaffected
console.log(b)   // 100 — b has its own independent value

// Objects: each variable holds a REFERENCE (memory address), not the object
let user1 = { name: 'Alice', score: 10 }
let user2 = user1   // user2 gets a COPY of the REFERENCE — both point to the same object
user2.score = 99
console.log(user1.score)  // 99 — user1 and user2 point at the same object in memory
console.log(user2.score)  // 99`,
    },

    // ── Step 2: Aliasing ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-aliasing',
      text: 'Two or more variables that point to the same object in memory are called aliases — different names for the same thing. Aliasing is not always wrong. Sometimes sharing one object intentionally is exactly what you want. But aliasing becomes a bug when you believe you have two independent objects and you do not. The most dangerous form is passing an object to a function. The function receives a reference to the original. Any modification the function makes — changing a property, pushing to an array — happens to the object you passed in. Mutation: changing the content of an object through a reference. Every alias can mutate. If there are many aliases, any one of them can corrupt the data the others expect to be unchanged.',
      code: `let config = { theme: 'dark', fontSize: 14, debug: false }

function applyUserPreferences(cfg) {
  cfg.theme = 'light'   // mutating through the reference — the caller's object changes
  cfg.debug = true
}

applyUserPreferences(config)

// The original config object has been silently modified
console.log(config.theme)   // 'light' — you did not set this
console.log(config.debug)   // true — you did not set this either
// The function returned nothing. The mutation was invisible at the call site.`,
    },

    // ── Step 3: Shallow vs deep copy ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-copy',
      text: 'The instinctive fix is to copy the object before modifying it. But "copy" has two meanings that matter here. A shallow copy creates a new object and copies all top-level properties. If a property is a primitive, the copy is independent. If a property is itself an object (a nested object), the copy contains the same reference to that nested object — so nested data is still shared between the original and the copy. The spread operator ({ ...obj }) and Object.assign() both produce shallow copies. A deep copy creates a new object and recursively copies every level — nested objects get new copies too. No sharing at any level. structuredClone() performs a deep copy. Most aliasing bugs involving copies come from using a shallow copy on an object with nested structure and assuming the copy is fully independent.',
      code: `const original = {
  theme: 'dark',
  settings: { fontSize: 14, bold: false }  // nested object
}

// Shallow copy — top-level properties are copied, nested object is still shared
const shallow = { ...original }
shallow.theme = 'light'                    // fine — 'theme' is a primitive string
shallow.settings.fontSize = 20            // mutates the SHARED nested object

console.log(original.theme)               // 'dark' — top-level primitive: independent
console.log(original.settings.fontSize)  // 20 — nested object: still shared

// Deep copy — every level is copied independently
const deep = structuredClone(original)
deep.settings.fontSize = 99

console.log(original.settings.fontSize)  // 20 — unchanged, fully independent`,
    },

    // ── Challenge: references ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-references',
      text: 'Write a function called safeUpdate(user, changes) that returns a new user object with the changes applied, without mutating the original user. Use the spread operator — do not use structuredClone. The user object has only primitive properties: { name: string, score: number, active: boolean } — no nested objects, so a shallow copy is sufficient here. Test: call safeUpdate({ name: "Alice", score: 10, active: true }, { score: 99 }). Log the updated score (99) and the original score (10) to prove the original was not mutated.',
      expectedOutput: null,
      startCode: `function safeUpdate(user, changes) {
  // return a new object with user's properties overridden by changes
  // do not modify user
}

const original = { name: 'Alice', score: 10, active: true }
const updated  = safeUpdate(original, { score: 99 })

console.log(updated.score)   // 99
console.log(original.score)  // 10 — unchanged`,
      hint: 'return { ...user, ...changes } — spread user first (all original properties), then spread changes (overrides any matching keys).',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(99) && nums.includes(10)
      },
    },

    { type: 'checkpoint', id: 'cp-references' },

    // ── Step 4: Prototype pattern ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-prototype-intro',
      text: 'The Prototype pattern formalises controlled copying: instead of callers deciding how to copy an object — spread, structuredClone, manual property assignment — the object itself provides a clone() method that knows how to produce a correct copy. The caller simply asks: "give me a copy of yourself." The object knows whether a shallow copy is safe, which properties to copy, and how to handle nested structure. This is the key insight of the pattern: the copying logic lives in the one place that knows the object\'s structure — the object itself. You do not construct a new object from scratch; you copy an existing, fully configured one and modify only what needs to differ.',
      code: null,
    },

    // ── Step 5: clone() method ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-clone-method',
      text: 'Start with the simplest Prototype: a class with a clone() method. The clone method allocates a new instance on the heap — a new memory address — and copies all properties. The caller gets back a fully independent object. No shared references. Safe to modify without aliasing risk.',
      code: `class UserProfile {
  constructor(name, score, active) {
    this.name   = name
    this.score  = score
    this.active = active
  }

  clone() {                                         // ← NEW
    return new UserProfile(                         // new object, new address in memory
      this.name,
      this.score,
      this.active,
    )
  }
}

const alice = new UserProfile('Alice', 10, true)
const copy  = alice.clone()

copy.score = 99

console.log(alice.score)  // 10 — original
console.log(copy.score)   // 99 — independent copy`,
    },

    // ── Step 6: clone() with nested objects ───────────────────────────────────

    {
      type: 'narration',
      id: 'step6-nested-clone',
      text: 'When the object has nested structure, clone() must handle that too. A simple spread inside clone() would leave nested objects shared — the same problem as before. The clone method solves this by deep copying only the nested parts that need independence. This is why the object owns the cloning logic: only the class author knows which nested objects need deep copies and which are safely shared.',
      code: `class GameCharacter {
  constructor(name, health, stats) {
    this.name   = name
    this.health = health
    this.stats  = stats   // nested: { attack: number, defense: number }
  }

  clone() {
    return new GameCharacter(
      this.name,
      this.health,
      structuredClone(this.stats),  // ← NEW: deep copy the nested object
    )
  }
}

const hero = new GameCharacter('Hero', 100, { attack: 10, defense: 5 })
const copy = hero.clone()

copy.stats.attack = 999

console.log(hero.stats.attack)  // 10 — original protected
console.log(copy.stats.attack)  // 999 — copy is independent`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-meeting',
      text: 'This is where the two ideas meet. A reference is what makes aliasing possible: when you assign an object to a variable, you copy an address, not the data. Two addresses pointing at the same object means any mutation through one is immediately visible through the other. The Prototype pattern is the direct answer to this problem. By giving every object a clone() method, you make copying safe and consistent. The method encapsulates the correct strategy — shallow, deep, or mixed — in the class that knows the structure. References are why aliasing exists. Prototype is why aliasing does not have to be a bug. The pattern exists specifically because JavaScript uses reference semantics for objects.',
      code: null,
    },

    // ── Challenge: Prototype ──────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-prototype',
      text: 'Add a clone() method to the ServerConfig class below. The clone must return a new ServerConfig with independent copies of all properties. The headers property is a nested object — { "Content-Type": string, "Authorization": string } — so it must be deep copied using structuredClone(this.headers). Primitives (host, port, secure) can be copied directly. Test: create a config, clone it, change clone.headers["Authorization"] to "Bearer xyz". Log the original Authorization (unchanged) and the clone Authorization ("Bearer xyz").',
      expectedOutput: null,
      startCode: `class ServerConfig {
  constructor(host, port, secure, headers) {
    this.host    = host
    this.port    = port
    this.secure  = secure
    this.headers = headers
  }

  clone() {
    // return a new ServerConfig with independent headers
  }
}

const config = new ServerConfig('api.example.com', 443, true, {
  'Content-Type':  'application/json',
  'Authorization': 'Bearer abc',
})

const copy = config.clone()
copy.headers['Authorization'] = 'Bearer xyz'

console.log(config.headers['Authorization'])  // 'Bearer abc' — original unchanged
console.log(copy.headers['Authorization'])    // 'Bearer xyz'`,
      hint: 'return new ServerConfig(this.host, this.port, this.secure, structuredClone(this.headers))',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('Bearer abc') && flat.includes('Bearer xyz')
      },
    },

    { type: 'checkpoint', id: 'cp-prototype' },

    // ── Step 8: Combined ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'Put both ideas together in a real-world scenario: a configuration template system. You have a base configuration object. Different environments — development, production, test — each need a variant of the base with specific overrides. Without Prototype, you would copy the base by hand each time, risking aliasing at every step. With Prototype, the base config clones itself on demand. A with() helper method combines clone() and override: clone first, then apply the overrides to the clone. The original is never touched.',
      code: `class Config {
  constructor(host, port, debug, options = {}) {
    this.host    = host
    this.port    = port
    this.debug   = debug
    this.options = options   // nested: { timeout, retries }
  }

  clone() {
    return new Config(this.host, this.port, this.debug, structuredClone(this.options))
  }

  with(overrides) {                    // ← NEW
    const copy = this.clone()
    Object.assign(copy, overrides)     // apply overrides to the clone, not the original
    return copy
  }
}

const base = new Config('localhost', 3000, false, { timeout: 5000, retries: 3 })

const dev  = base.with({ debug: true })
const prod = base.with({ host: 'api.example.com', port: 443 })
const test = base.with({ port: 9999, options: { timeout: 100, retries: 0 } })

console.log(base.host)   // 'localhost' — base untouched
console.log(dev.debug)   // true
console.log(prod.host)   // 'api.example.com'
console.log(test.port)   // 9999
console.log(base.debug)  // false`,
    },

    // ── Challenge: combined ───────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Add a with(overrides) method to the Document class below. with() must clone the document and apply overrides to the clone, leaving the original unchanged. metadata is a nested object — your clone() already deep copies it, so with() just needs to clone then apply overrides using Object.assign. Test: create a document with metadata.version = 1. Call with({ title: "Final", metadata: { version: 2, author: "Bob" } }). Log the new title ("Final"), the original title (unchanged, "Draft"), the new metadata.version (2), and the original metadata.version (still 1).',
      expectedOutput: null,
      startCode: `class Document {
  constructor(title, content, metadata) {
    this.title    = title
    this.content  = content
    this.metadata = metadata
  }

  clone() {
    return new Document(this.title, this.content, structuredClone(this.metadata))
  }

  with(overrides) {
    // clone this document, apply overrides, return the new document
  }
}

const doc = new Document('Draft', 'Hello world', { version: 1, author: 'Alice' })
const v2  = doc.with({ title: 'Final', metadata: { version: 2, author: 'Bob' } })

console.log(v2.title)              // 'Final'
console.log(doc.title)             // 'Draft'
console.log(v2.metadata.version)   // 2
console.log(doc.metadata.version)  // 1`,
      hint: 'const copy = this.clone(); Object.assign(copy, overrides); return copy',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('Final') && flat.includes('Draft') && flat.includes('2') && flat.includes('1')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through the aliasing demonstration first. When "const alias = alice" executes, watch the Variables panel: alias and alice will show the same memory address — one object, two names. Step to "alias.score = 99": watch alice.score change even though you wrote to alias. That is the aliasing problem made visible. Then step through the Prototype section: when clone() runs, a new address appears in the Variables panel. copy and alice2 now show different addresses. Step to "copy.score = 99": alice2.score stays at 10. The clone absorbed the mutation. The original is protected.',
      code: `class UserProfile {
  constructor(name, score) {
    this.name  = name
    this.score = score
  }
  clone() {
    return new UserProfile(this.name, this.score)
  }
}

// Aliasing: one object, two names
const alice = new UserProfile('Alice', 10)
const alias = alice
alias.score = 99
console.log('alice after alias mutation:', alice.score)  // 99

// Prototype: two objects, safe mutation
const alice2 = new UserProfile('Alice', 10)
const copy   = alice2.clone()
copy.score = 99
console.log('alice2 after clone mutation:', alice2.score) // 10
console.log('copy score:', copy.score)                    // 99`,
    },

    {
      type: 'codelens',
      id: 'cl-references-prototype',
      text: `Step to: const alias = alice
Variables panel: alias and alice show the same memory address. They are two names for one object.

Step to: alias.score = 99
Variables panel: alice.score changes to 99. You only wrote "alias.score" — yet alice changed. That is the aliasing bug.

Step to: const copy = alice2.clone()
Variables panel: copy receives a new, different memory address. Two separate objects now exist in memory.

Step to: copy.score = 99
Variables panel: alice2.score stays at 10. The Prototype pattern absorbed the mutation in the clone. The original is protected.`,
      code: `class UserProfile {
  constructor(name, score) {
    this.name  = name
    this.score = score
  }
  clone() {
    return new UserProfile(this.name, this.score)
  }
}
const alice = new UserProfile('Alice', 10)
const alias = alice
alias.score = 99
console.log('alias mutation:', alice.score)
const alice2 = new UserProfile('Alice', 10)
const copy   = alice2.clone()
copy.score = 99
console.log('original:', alice2.score)
console.log('clone:', copy.score)`,
      lang: 'js',
    },

  ],
}
