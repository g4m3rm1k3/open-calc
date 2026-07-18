import type { PracticeChallenge } from './loader'

export const title = 'Trie'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeTrie()` returning `{ insert(word), startsWith(prefix) }`. `insert` adds a word one character at a time, sharing existing nodes with any previously-inserted word that shares a prefix; `startsWith` walks the prefix, returning whether that whole path exists.',
        starter: '',
        tests: `
const trie = makeTrie()
assert (trie.insert('cat'), true)
assert (trie.insert('car'), true)
assert trie.startsWith('ca') === true
assert trie.startsWith('cog') === false
`,
        solution: `function makeTrie() {
  const root = { children: {}, isEndOfWord: false }
  return {
    insert(word) {
      let node = root
      for (const ch of word) {
        if (!node.children[ch]) node.children[ch] = { children: {}, isEndOfWord: false }
        node = node.children[ch]
      }
      node.isEndOfWord = true
    },
    startsWith(prefix) {
      let node = root
      for (const ch of prefix) {
        if (!node.children[ch]) return false
        node = node.children[ch]
      }
      return true
    },
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `search(word)` so it returns `true` only if `word` was actually inserted as a COMPLETE word — not merely a valid prefix of some longer stored word. `\'ca\'` being a prefix of `\'cat\'`/`\'car\'` must not make `search(\'ca\')` return `true` unless `\'ca\'` was itself inserted.',
        starter: 'function makeTrie() {\n  const root = { children: {}, isEndOfWord: false }\n  function findNode(prefix) {\n    let node = root\n    for (const ch of prefix) {\n      if (!node.children[ch]) return null\n      node = node.children[ch]\n    }\n    return node\n  }\n  return {\n    insert(word) {\n      let node = root\n      for (const ch of word) {\n        if (!node.children[ch]) node.children[ch] = { children: {}, isEndOfWord: false }\n        node = node.children[ch]\n      }\n      node.isEndOfWord = true\n    },\n    startsWith(prefix) { return findNode(prefix) !== null },\n    // TODO: search(word) must return true only if word was actually INSERTED\n    // as a complete word, not just a shared prefix of some longer word\n    search(word) { return findNode(word) !== null },\n  }\n}',
        tests: `
const trie = makeTrie()
assert (trie.insert('cat'), true)
assert (trie.insert('car'), true)
assert (trie.insert('cart'), true)
assert trie.search('ca') === false
assert trie.search('cat') === true
assert trie.startsWith('ca') === true
`,
        solution: `function makeTrie() {
  const root = { children: {}, isEndOfWord: false }
  function findNode(prefix) {
    let node = root
    for (const ch of prefix) {
      if (!node.children[ch]) return null
      node = node.children[ch]
    }
    return node
  }
  return {
    insert(word) {
      let node = root
      for (const ch of word) {
        if (!node.children[ch]) node.children[ch] = { children: {}, isEndOfWord: false }
        node = node.children[ch]
      }
      node.isEndOfWord = true
    },
    startsWith(prefix) { return findNode(prefix) !== null },
    search(word) {
      const node = findNode(word)
      return node !== null && node.isEndOfWord
    },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Add `countWithPrefix(prefix)` to `makeTrie()`, returning how many INSERTED words start with `prefix` — walk to the prefix\'s node, then count every `isEndOfWord` node in its entire subtree.',
        starter: '',
        tests: `
const trie = makeTrie()
;['cat','car','cart','dog'].forEach(w => trie.insert(w))
assert trie.countWithPrefix('ca') === 3
assert trie.countWithPrefix('d') === 1
assert trie.countWithPrefix('z') === 0
`,
        solution: `function makeTrie() {
  const root = { children: {}, isEndOfWord: false }
  function findNode(prefix) {
    let node = root
    for (const ch of prefix) {
      if (!node.children[ch]) return null
      node = node.children[ch]
    }
    return node
  }
  function countWords(node) {
    let count = node.isEndOfWord ? 1 : 0
    for (const child of Object.values(node.children)) count += countWords(child)
    return count
  }
  return {
    insert(word) {
      let node = root
      for (const ch of word) {
        if (!node.children[ch]) node.children[ch] = { children: {}, isEndOfWord: false }
        node = node.children[ch]
      }
      node.isEndOfWord = true
    },
    startsWith(prefix) { return findNode(prefix) !== null },
    countWithPrefix(prefix) {
      const node = findNode(prefix)
      return node ? countWords(node) : 0
    },
  }
}`,
      },
    ],
  },
]

export default challenges
