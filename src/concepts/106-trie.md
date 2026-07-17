---
concept: 106-trie
name: Trie
---

## Definition

A trie (prefix tree) stores a set of strings by sharing common prefixes
between them as one path through a tree, letting "does any string start
with this prefix" be answered by walking one character at a time, rather
than checking every stored string individually.

## Problem

Checking whether any of a large set of words starts with a given prefix,
using a plain list of strings, means comparing the prefix against every
single word, O(n × prefix length). A trie shares common prefixes as one
path, so checking a prefix is just walking that many characters down the
tree once, regardless of how many words share that prefix.

## Execution

Insert "cat" and "car" into an empty trie
↓
insert("cat"): create nodes for c → a → t, marking t as "end of word"
↓
insert("car"): reuse the EXISTING c → a path, branch off with a new node
for r, marking r as "end of word"
↓
The trie now looks like: c → a → { t (end), r (end) } — "cat" and "car"
share the c-a prefix as one path, diverging only at the third character
↓
startsWith("ca") → walk c, then a → both exist → true, without ever
touching the individual words "cat"/"car" as whole strings

## Computer Science

Each node represents one character position, with children for every
possible next character that continues some stored string — searching for
a word or a prefix costs O(length of the word/prefix), completely
independent of how many total words are stored, which is why a trie can
outperform a hash table specifically for prefix-based queries.

Tags: Prefix sharing, O(length) lookup, Autocomplete, Character-by-character

## Software Engineering

Tries are the standard structure behind autocomplete and typeahead search
(efficiently finding all words starting with what's typed so far) and
spell-checkers (checking whether a prefix could still lead to a valid
word) — anywhere prefix-based lookups matter more than simple exact-match
lookups.

Tags: Autocomplete, Typeahead search, Spell checking

## Common Mistakes

- Using a trie when only EXACT string lookups are needed, never prefix queries — a hash table is simpler and just as fast for that narrower case; a trie's benefit is specifically prefix operations.
- Forgetting to mark "end of word" nodes distinctly from "just a shared prefix" — without that marker, there's no way to tell whether a complete word is stored, versus it just being a prefix of some longer word that happens to pass through the same nodes.

## Exercises

- Insert "cat", "car", and "cart" into a trie, then check whether "ca" is a valid prefix versus whether "ca" is itself a complete stored word.
- Trace how many total nodes get created inserting "cat" then "car" versus how many a naive "store every word as a separate string" approach would need character-storage-wise.

## javascript

```javascript
class TrieNode {
  children = {}
  isEndOfWord = false
}

class Trie {
  #root = new TrieNode()
  insert(word) {
    let node = this.#root
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode()
      node = node.children[ch]
    }
    node.isEndOfWord = true
  }
  startsWith(prefix) {
    let node = this.#root
    for (const ch of prefix) {
      if (!node.children[ch]) return false
      node = node.children[ch]
    }
    return true
  }
}

const trie = new Trie()
trie.insert('cat')
trie.insert('car')
console.log(trie.startsWith('ca'))    // true
console.log(trie.startsWith('cog'))   // false
```
Walkthrough: inserting `'cat'` then `'car'` reuses the shared `c → a` path
— only the third character actually branches into two separate nodes.
`startsWith` just walks character by character, checking each expected
child exists, without ever comparing against "cat" or "car" as whole
strings.

## python

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False


class Trie:
    def __init__(self):
        self._root = TrieNode()

    def insert(self, word):
        node = self._root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end_of_word = True

    def starts_with(self, prefix):
        node = self._root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True


trie = Trie()
trie.insert('cat')
trie.insert('car')
print(trie.starts_with('ca'))    # True
print(trie.starts_with('cog'))   # False
```
Walkthrough: identical shared-prefix mechanics as the JavaScript version —
`'cat'` and `'car'` share the same `c → a` nodes in the trie, diverging
only where their characters actually differ.
