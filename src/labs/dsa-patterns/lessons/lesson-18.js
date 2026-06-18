// DSA + Design Patterns — Lesson 18
// Trie + Flyweight Pattern

export const lesson = {
  id: 'dsa-patterns-18',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '18. Trie + Flyweight',
  checkpoints: [
    { id: 'cp-trie',      label: 'Trie' },
    { id: 'cp-flyweight', label: 'Flyweight Pattern' },
    { id: 'cp-together',  label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You are building a search box that must suggest completions as the user types. You have 500,000 words. Scanning every word on each keystroke takes O(n) — half a million comparisons per character typed. That is too slow. There are two ideas that solve this together. The first idea is a special tree where shared character prefixes are stored only once instead of repeated in every word. The second idea is a memory pattern that deliberately reuses shared objects rather than creating new ones. These two ideas turn out to be the same thing viewed from different angles.',
      code: null,
    },

    // ── Step 1: TrieNode ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-trie-node',
      text: 'A Trie (pronounced "try", from re-TRIE-val) is a tree where each node represents a single character. The root represents the empty string. Children of a node represent the next character in words that share that prefix. A node with the flag isEnd=true means a complete word ends at that character. Each node stores its children in a Map (or object) keyed by character. The key insight: the words "cat", "car", and "card" all share the root → c → a branch. Those three nodes are not duplicated — they are shared.',
      code: `// A TrieNode holds one character's position in the tree
class TrieNode {
  constructor() {
    this.children = new Map()   // character → TrieNode
    this.isEnd    = false       // true if a word ends here
  }
}

// The root node represents the empty prefix
const root = new TrieNode()

// Manually insert 'cat': root → c → a → t (isEnd=true)
if (!root.children.has('c')) root.children.set('c', new TrieNode())
const c = root.children.get('c')
if (!c.children.has('a')) c.children.set('a', new TrieNode())
const a = c.children.get('a')
if (!a.children.has('t')) a.children.set('t', new TrieNode())
a.children.get('t').isEnd = true

console.log('c node children:', [...root.children.get('c').children.keys()])  // ['a']
console.log('word ends at t:', a.children.get('t').isEnd)                     // true`,
    },

    // ── Step 2: Trie insert ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-insert',
      text: 'The insert method walks down the tree one character at a time. For each character in the word, check if a child node for that character already exists. If not, create one. Then move to that child. After processing all characters, mark isEnd=true on the final node. Words with a shared prefix naturally share the same nodes — no extra work needed. Inserting "cat" and then "car" reuses the root → c → a path. Insert is O(m) where m is the length of the word being inserted.',
      code: `class TrieNode {
  constructor() {
    this.children = new Map()
    this.isEnd    = false
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode()
  }

  insert(word) {                       // ← NEW
    let node = this.root               // ← NEW  start at root
    for (const char of word) {         // ← NEW  walk one char at a time
      if (!node.children.has(char)) {  // ← NEW  create node if absent
        node.children.set(char, new TrieNode())  // ← NEW
      }
      node = node.children.get(char)   // ← NEW  move to child
    }
    node.isEnd = true                  // ← NEW  mark end of word
  }
}

const trie = new Trie()
trie.insert('cat')
trie.insert('car')   // shares root→c→a with 'cat'
trie.insert('card')  // shares root→c→a→r with 'car'
trie.insert('dog')

// How many children does the root have?
console.log('root children:', [...trie.root.children.keys()])  // ['c', 'd']
// How many children does 'c'→'a' have?
const ca = trie.root.children.get('c').children.get('a')
console.log('ca children:', [...ca.children.keys()])           // ['t', 'r']`,
    },

    // ── Step 3: search and startsWith ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-search',
      text: 'Two core lookups: search(word) returns true only if the exact word was inserted (the final node must have isEnd=true). startsWith(prefix) returns true if any inserted word begins with that prefix (the walk succeeds regardless of isEnd). Both walk the tree one character at a time. If any character is missing from the children map, return false immediately. Both are O(m) where m is the length of the query — completely independent of how many words are in the trie.',
      code: `class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false }
}

class Trie {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  search(word) {                          // ← NEW
    let node = this.root                  // ← NEW
    for (const char of word) {            // ← NEW
      if (!node.children.has(char)) return false  // ← NEW  missing char
      node = node.children.get(char)      // ← NEW
    }
    return node.isEnd                     // ← NEW  must be a complete word
  }

  startsWith(prefix) {                    // ← NEW
    let node = this.root                  // ← NEW
    for (const char of prefix) {          // ← NEW
      if (!node.children.has(char)) return false  // ← NEW
      node = node.children.get(char)      // ← NEW
    }
    return true                           // ← NEW  prefix exists
  }
}

const trie = new Trie()
;['cat','car','card','care','dog','door'].forEach(w => trie.insert(w))

console.log(trie.search('car'))       // true  — inserted
console.log(trie.search('ca'))        // false — prefix only, not a word
console.log(trie.startsWith('ca'))    // true  — prefix exists
console.log(trie.startsWith('do'))    // true
console.log(trie.search('done'))      // false`,
    },

    // ── Step 4: collect all words under a prefix ──────────────────────────────

    {
      type: 'narration',
      id: 'step4-collect',
      text: 'For autocomplete you need all words that start with a given prefix — not just whether the prefix exists. Walk to the node at the end of the prefix, then do a depth-first search (DFS — visit every descendant by recursing into each child) from that node. At each step, append the current character to a running string. When you hit a node where isEnd is true, add that string to the results. DFS on the subtree below the prefix node visits only words that share that prefix. This is O(m + k) where m is the prefix length and k is the number of characters in all matching words.',
      code: `class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false }
}

class Trie {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  // Collect all words with the given prefix
  wordsWithPrefix(prefix) {             // ← NEW
    let node = this.root                // ← NEW
    for (const char of prefix) {        // ← NEW  walk to prefix end
      if (!node.children.has(char)) return []  // ← NEW  no words match
      node = node.children.get(char)    // ← NEW
    }
    const results = []                  // ← NEW
    this._dfs(node, prefix, results)    // ← NEW  collect from here down
    return results                      // ← NEW
  }

  _dfs(node, current, results) {        // ← NEW
    if (node.isEnd) results.push(current)  // ← NEW  found a complete word
    for (const [char, child] of node.children) {   // ← NEW
      this._dfs(child, current + char, results)    // ← NEW  recurse deeper
    }
  }
}

const trie = new Trie()
;['cat','car','card','care','careful','carpet','dog'].forEach(w => trie.insert(w))

console.log(trie.wordsWithPrefix('car'))   // ['car','card','care','careful','carpet']
console.log(trie.wordsWithPrefix('care'))  // ['care','careful']
console.log(trie.wordsWithPrefix('do'))    // ['dog']
console.log(trie.wordsWithPrefix('xyz'))   // []`,
    },

    // ── Step 5: Big-O summary for Trie ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-complexity',
      text: 'Trie complexity summary. insert: O(m) — you visit exactly m nodes, one per character. search: O(m) — same walk, no extra work. startsWith: O(m) — same. wordsWithPrefix: O(m + k) where k is total characters across all matching words — DFS only visits nodes that are descendants of the prefix node. Space: O(total characters inserted) in the worst case (all words share no prefixes), but in practice far less because shared prefixes share nodes. A hash set would use O(n * m) space; the trie uses at most O(n * m) but usually much less for natural language.',
      code: `// Space demonstration: 5 words with shared prefixes
// Without trie: store each word separately
const words = ['pre', 'prefix', 'prepare', 'press', 'present']
const hashSet = new Set(words)
// Total characters stored: 3+6+7+5+7 = 28

// With trie: shared prefix nodes
class TrieNode { constructor(){ this.children=new Map(); this.isEnd=false } }
class Trie {
  constructor(){ this.root=new TrieNode() }
  insert(w){ let n=this.root; for(const c of w){if(!n.children.has(c))n.children.set(c,new TrieNode()); n=n.children.get(c)} n.isEnd=true }
  nodeCount(n=this.root){ let c=1; for(const ch of n.children.values()) c+=this.nodeCount(ch); return c }
}
const trie = new Trie()
words.forEach(w => trie.insert(w))

// p→r→e is shared by all 5 words = 3 nodes instead of 3×5=15
console.log('trie node count:', trie.nodeCount())  // much less than 28
console.log('hash set char count:', [...hashSet].reduce((s,w)=>s+w.length,0))`,
    },

    // ── Challenge 1: Implement wordsWithPrefix ────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-trie',
      text: 'Implement wordsWithPrefix(prefix) on the Trie class. It should return an alphabetically sorted array of all inserted words that begin with prefix. Insert ["apple","app","application","apply","apt","banana","band"] and call wordsWithPrefix("app"). Log the result. Edge case: wordsWithPrefix("") should return all words.',
      expectedOutput: null,
      startCode: `class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false }
}

class Trie {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  wordsWithPrefix(prefix) {
    // 1. Walk to the node at the end of prefix
    // 2. DFS from there, collecting complete words
    // 3. Return sorted array
  }

  _dfs(node, current, results) {
    // YOUR CODE HERE
  }
}

const trie = new Trie()
;['apple','app','application','apply','apt','banana','band'].forEach(w => trie.insert(w))

console.log(trie.wordsWithPrefix('app'))   // should include app, apple, application, apply
console.log(trie.wordsWithPrefix('ban'))   // should include banana, band`,
      hint: 'Walk to the prefix node first. Then _dfs: if node.isEnd push current; for each [char, child] call _dfs(child, current+char, results). Sort before returning.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('apple') && flat.includes('application') && flat.includes('band')
      },
    },

    { type: 'checkpoint', id: 'cp-trie' },

    // ── Step 6: Flyweight Pattern intro ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-flyweight-intro',
      text: 'The Flyweight pattern (a Gang of Four structural pattern — a catalog of 23 classic object-oriented solutions published in 1994) reduces memory by sharing objects that contain identical data. It distinguishes two kinds of state. Intrinsic state is data that never changes between uses of a shared object — it belongs in the shared flyweight. Extrinsic state is data that differs per context — the caller provides it each time. Example: a text editor rendering a million characters. Each \'a\' character has the same font, size, and glyph — intrinsic. Its x/y position on screen is different for each instance — extrinsic. One flyweight object per distinct character replaces a million objects.',
      code: `// Without Flyweight: one object per particle in a game
// 10,000 particles × ~200 bytes each = ~2MB just for particle data
class ParticleWithoutFlyweight {
  constructor(x, y, color, texture, size) {
    this.x = x
    this.y = y
    this.color   = color    // could be shared — same color used by thousands
    this.texture = texture  // could be shared — large bitmap, same data repeated
    this.size    = size     // could be shared
  }
}

// With Flyweight: separate shared data from per-instance data
class ParticleFlyweight {
  constructor(color, texture, size) {
    // intrinsic state — shared, never changes
    this.color   = color
    this.texture = texture
    this.size    = size
  }
  // render receives extrinsic state (x, y) — different each call
  render(x, y) {
    console.log('render', this.color, 'at', x, y)
  }
}

const redFlyweight = new ParticleFlyweight('red', 'fire.png', 5)
// Thousands of particles share this one object
redFlyweight.render(10, 20)
redFlyweight.render(30, 40)
redFlyweight.render(50, 60)
console.log('one shared flyweight, three calls')`,
    },

    // ── Step 7: FlyweightFactory ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-flyweight-factory',
      text: 'A FlyweightFactory ensures that only one flyweight object exists per unique combination of intrinsic state. Callers do not use new directly — they ask the factory for a flyweight with certain properties. The factory checks a cache (a Map). If one already exists, it returns it. Otherwise it creates and stores a new one. This is the same mechanism as memoization (caching the result of expensive work to avoid repeating it), applied to object creation.',
      code: `class CharacterFlyweight {
  constructor(char, font, size) {
    this.char = char    // intrinsic — same for all 'a' glyphs
    this.font = font    // intrinsic
    this.size = size    // intrinsic
  }

  render(x, y) {
    return this.char + '@(' + x + ',' + y + ')'
  }
}

class FlyweightFactory {                      // ← NEW
  constructor() {                             // ← NEW
    this._cache = new Map()                   // ← NEW
  }                                           // ← NEW

  get(char, font, size) {                     // ← NEW
    const key = char + '|' + font + '|' + size  // ← NEW  unique key for this combo
    if (!this._cache.has(key)) {              // ← NEW
      this._cache.set(key, new CharacterFlyweight(char, font, size))  // ← NEW
    }                                         // ← NEW
    return this._cache.get(key)               // ← NEW  return shared instance
  }                                           // ← NEW

  count() { return this._cache.size }         // ← NEW
}

const factory = new FlyweightFactory()

// Render the word "hello" 1000 times — only 4 unique characters
const positions = []
for (let i = 0; i < 10; i++) {
  'hello'.split('').forEach((ch, j) => {
    const fw = factory.get(ch, 'Arial', 14)  // reuses existing flyweights
    positions.push(fw.render(i * 100, j * 20))
  })
}

console.log('unique flyweights created:', factory.count())  // 4 (h,e,l,o)
console.log('total renders:', positions.length)             // 50`,
    },

    // ── Step 8: Meeting point — Trie nodes ARE flyweights ─────────────────────

    {
      type: 'narration',
      id: 'step8-meeting-point',
      text: 'This is where the two ideas meet: every TrieNode that represents a shared prefix is already a Flyweight object. The character \'c\' at depth 1 in a trie storing "cat", "car", "card" is one single node shared by all three words. Its intrinsic state is the character and its depth. Its extrinsic state is the word being looked up (the path taken to reach it). The trie does not need a separate Flyweight implementation — the tree structure enforces sharing automatically. Recognising this tells you why Tries are so memory-efficient: they apply the Flyweight pattern structurally, not explicitly.',
      code: `// The Trie IS a Flyweight factory
// Each node is the flyweight for its character+depth combination
class TrieNode {
  constructor(char) {
    this.char     = char         // intrinsic: the character this node represents
    this.children = new Map()    // intrinsic: shared children map
    this.isEnd    = false        // intrinsic: part of the shared node state
    // extrinsic (provided by caller): the full path / word being searched
  }
}

class Trie {
  constructor() { this.root = new TrieNode('') }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode(char))
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  // sharedNodeCount: how many distinct trie nodes exist (= flyweight count)
  sharedNodeCount(node = this.root) {
    let count = 1
    for (const child of node.children.values()) count += this.sharedNodeCount(child)
    return count
  }
}

const trie = new Trie()
;['cat','car','card','care','careful','carpet'].forEach(w => trie.insert(w))

// Total characters across all words = 3+3+4+4+7+6 = 27
// But shared nodes = much fewer
console.log('words stored: 6')
console.log('total chars across words: 27')
console.log('actual trie nodes (flyweights):', trie.sharedNodeCount())

// The 'c' node is shared by all 6 words — one object, not six`,
    },

    // ── Challenge 2: Count words sharing a prefix ─────────────────────────────

    {
      type: 'challenge',
      id: 'ch-flyweight',
      text: 'Add a wordCount() method to the Trie that, starting from a given node, counts how many complete words are in its subtree. Then add countWordsWithPrefix(prefix) which walks to the prefix node and returns wordCount() from there. This directly measures how much sharing (Flyweight reuse) exists under that prefix. Insert ["pre","prefix","prepare","press","present","predict","precise"] and log countWordsWithPrefix("pre") — all 7 words share the "pre" prefix node.',
      expectedOutput: null,
      startCode: `class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false }
}

class Trie {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  wordCount(node) {
    // count complete words in this subtree
    // (add 1 if node.isEnd, recurse into children)
  }

  countWordsWithPrefix(prefix) {
    // walk to prefix node, then call wordCount
  }
}

const trie = new Trie()
;['pre','prefix','prepare','press','present','predict','precise'].forEach(w => trie.insert(w))

console.log('words with prefix "pre":', trie.countWordsWithPrefix('pre'))   // 7
console.log('words with prefix "pres":', trie.countWordsWithPrefix('pres')) // 2 (press, present)
console.log('words with prefix "xyz":', trie.countWordsWithPrefix('xyz'))   // 0`,
      hint: 'wordCount: let c = node.isEnd ? 1 : 0; for each child c += wordCount(child); return c. countWordsWithPrefix: walk the prefix; if any char missing return 0; return wordCount(node).',
      validate: ({ logs }) => {
        const nums = logs.map(l => String(l).match(/\d+/)).filter(Boolean).map(m => parseInt(m[0]))
        return nums.includes(7)
      },
    },

    { type: 'checkpoint', id: 'cp-flyweight' },

    // ── Combined: Autocomplete system ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step9-combined',
      text: 'Combine both ideas into an autocomplete system. The Trie provides O(m) prefix lookup. Each node is a Flyweight — shared by all words with that prefix. Add usage frequency tracking to each node (how many times that path has been searched) so you can rank suggestions by popularity. The frequency is extrinsic state — it accumulates from outside the node itself. The node object is still shared; only the counters differ.',
      code: `class TrieNode {
  constructor() {
    this.children  = new Map()
    this.isEnd     = false
    this.frequency = 0    // how many times a search passed through here
  }
}

class Autocomplete {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  search(prefix) {
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) return []
      node = node.children.get(char)
      node.frequency++     // each prefix node gets incremented on every search
    }
    const results = []
    this._dfs(node, prefix, results)
    return results.sort((a, b) => b.freq - a.freq).slice(0, 5).map(r => r.word)
  }

  _dfs(node, current, results) {
    if (node.isEnd) results.push({ word: current, freq: node.frequency })
    for (const [char, child] of node.children) this._dfs(child, current + char, results)
  }
}

const ac = new Autocomplete()
;['javascript','java','javelin','python','pytorch','pypy','ruby'].forEach(w => ac.insert(w))

// Simulate searches — some prefixes searched more than others
ac.search('ja'); ac.search('ja'); ac.search('java')
console.log('suggestions for "j":', ac.search('j'))
console.log('suggestions for "py":', ac.search('py'))`,
    },

    // ── Challenge 3: Combined autocomplete ───────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Build a complete autocomplete system. Insert the words ["apple","app","application","apply","apt","apricot","banana","band","bandana","ban"]. Simulate 3 searches for "app", 2 for "ap", and 1 for "apri". Then call search("ap") and log the top suggestions. The result should be sorted by frequency. Also log the total node count to see Flyweight sharing in action.',
      expectedOutput: null,
      startCode: `class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false; this.frequency = 0 }
}

class Autocomplete {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  search(prefix) {
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) return []
      node = node.children.get(char)
      node.frequency++
    }
    const results = []
    this._dfs(node, prefix, results)
    return results.sort((a,b) => b.freq - a.freq).map(r => r.word)
  }

  _dfs(node, current, results) {
    if (node.isEnd) results.push({ word: current, freq: node.frequency })
    for (const [char, child] of node.children) this._dfs(child, current + char, results)
  }

  nodeCount(node = this.root) {
    let c = 1
    for (const child of node.children.values()) c += this.nodeCount(child)
    return c
  }
}

const ac = new Autocomplete()
// insert the words, simulate searches, then log suggestions and node count`,
      hint: 'Call ac.search("app") three times, ac.search("ap") twice, ac.search("apri") once, then log ac.search("ap") and ac.nodeCount().',
      validate: ({ logs }) => {
        const flat = logs.join(' ').toLowerCase()
        return flat.includes('app') && flat.includes('apri')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens and step through the insert sequence. Watch the children Map grow on each node. See how "car" and "cat" create separate nodes at the t/r split but share the c→a path. Then step through wordsWithPrefix and watch the DFS recurse: the call stack grows as it goes deeper, and results fills up as isEnd nodes are hit.',
      code: `class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false }
}

class Trie {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.isEnd = true
  }

  wordsWithPrefix(prefix) {
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) return []
      node = node.children.get(char)
    }
    const results = []
    this._dfs(node, prefix, results)
    return results
  }

  _dfs(node, current, results) {
    if (node.isEnd) results.push(current)
    for (const [char, child] of node.children) this._dfs(child, current + char, results)
  }
}

const trie = new Trie()
trie.insert('cat')
trie.insert('car')
trie.insert('card')
console.log(trie.wordsWithPrefix('ca'))`,
    },

    {
      type: 'codelens',
      id: 'cl-trie',
      text: 'Step through in CodeLens. Watch the children Map on each TrieNode grow as insert runs. Notice "car" and "cat" both pass through the same c and a nodes — that is the Flyweight sharing. Then step through wordsWithPrefix and watch _dfs build the results array by recursing into each child.',
      code: `class TrieNode{constructor(){this.children=new Map();this.isEnd=false}}
class Trie{
  constructor(){this.root=new TrieNode()}
  insert(word){let n=this.root;for(const c of word){if(!n.children.has(c))n.children.set(c,new TrieNode());n=n.children.get(c)}n.isEnd=true}
  wordsWithPrefix(prefix){let n=this.root;for(const c of prefix){if(!n.children.has(c))return[];n=n.children.get(c)}const r=[];this._dfs(n,prefix,r);return r}
  _dfs(node,cur,res){if(node.isEnd)res.push(cur);for(const[c,ch]of node.children)this._dfs(ch,cur+c,res)}
}
const t=new Trie()
t.insert('cat');t.insert('car');t.insert('card')
console.log(t.wordsWithPrefix('ca'))
console.log(t.wordsWithPrefix('car'))`,
      lang: 'js',
    },

  ],
}
