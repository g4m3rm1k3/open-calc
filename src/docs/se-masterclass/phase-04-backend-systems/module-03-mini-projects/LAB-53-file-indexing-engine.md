# SE Masterclass — LAB-53 — File Indexing Engine

**Language: JavaScript (Node.js)** — returning to Node for this and LAB-54.

**Prerequisites:** LAB-06/41 (tree traversal — a real filesystem IS a tree, walked exactly the same way), LAB-04 (hash maps — the inverted index IS a hash map), LAB-10 (tokenizing — splitting file content into searchable words).

**What this lab adds:**
- Walking a REAL directory tree with Node's `fs` module — LAB-41's recursive pattern, on real files instead of a mock data structure
- Tokenizing file content into words — LAB-10's lexer instincts, applied to prose instead of code
- An **inverted index**: word → list of files containing it — the data structure every search engine is built on
- Incremental indexing: re-indexing only what CHANGED, using file modification times

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. To find every file containing the word "recursion," would you rather scan every file's content EVERY time someone searches, or precompute something once? What's the trade-off?
> 2. An "inverted" index maps word → files. What would a NON-inverted (forward) index map instead?
> 3. If you re-index a directory of 10,000 files every time ONE file changes, what's wasteful about that?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node index-engine.js` prints:

```
=== Walking a Directory Tree ===
found 4 files:
  docs/intro.md
  docs/guide.md
  src/main.js
  src/utils.js

=== Tokenizing File Content ===
docs/intro.md tokens: ['welcome', 'to', 'the', 'project', 'this', 'guide', 'covers', 'recursion']

=== Building the Inverted Index ===
index['recursion']: Set { 'docs/intro.md', 'docs/guide.md' }
index['project']: Set { 'docs/intro.md', 'src/main.js' }
index['nonexistentword']: Set {} (empty — word not found anywhere)

=== Incremental Indexing ===
initial index built: 4 files, took 12ms
docs/intro.md modified
re-indexing: only 1 file changed, took 3ms (not all 4)

=== Term Frequency: Which File Matches Best? ===
searching for "recursion":
  docs/guide.md: 3 occurrences
  docs/intro.md: 1 occurrence
  ← guide.md ranks higher — it mentions the term more
```

---

### Concept: Walking a Real Directory Tree

**What it is:** Node's `fs.readdirSync(path, { withFileTypes: true })` lists a directory's IMMEDIATE contents, distinguishing files from subdirectories. Recursing into each subdirectory — EXACTLY LAB-41's `FolderView` pattern, on the real filesystem — visits every file, at any depth.

---

## Step 1 — Walk the Directory Tree

```js
// index-engine.js
const fs = require('fs')
const path = require('path')

function walkDirectory(dir) {
  let files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })    // ← add: list this level's contents

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walkDirectory(fullPath))                  // ← add: RECURSE — LAB-41's exact pattern, real filesystem
    } else {
      files.push(fullPath)                                            // ← add: base case — a file, add it, don't recurse further
    }
  }
  return files
}

console.log('=== Walking a Directory Tree ===')
const files = walkDirectory('./sample-docs')     // create this folder with a few .md/.js files first
console.log(`found ${files.length} files:`)
files.forEach(f => console.log(`  ${f}`))
```

### SAVE AND TRY

Create a `sample-docs/` folder with a couple of subdirectories and text files, then:

```bash
node index-engine.js
```

**Expected (paths matching whatever you created):**
```
=== Walking a Directory Tree ===
found 4 files:
  sample-docs/docs/intro.md
  sample-docs/docs/guide.md
  sample-docs/src/main.js
  sample-docs/src/utils.js
```

**Confirm this is LAB-41's recursion, unchanged in shape:** `walkDirectory` calling `walkDirectory` for each subdirectory, with "a file" as the base case, is STRUCTURALLY identical to `FolderView` calling `FolderView` for each child folder — the only difference is `fs.readdirSync` reads from the REAL OS filesystem instead of an in-memory mock tree.

---

## Step 2 — Tokenize File Content

```js
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)           // ← add: split on anything that ISN'T a letter/digit — LAB-10's character classification, inverted
    .filter(word => word.length > 0)
}

console.log('\n=== Tokenizing File Content ===')
const sampleContent = fs.readFileSync(files[0], 'utf-8')
console.log(`${files[0]} tokens:`, tokenize(sampleContent))
```

### SAVE AND TRY

```bash
node index-engine.js
```

**Expected (shape, depending on your sample file's content):**
```
=== Tokenizing File Content ===
sample-docs/docs/intro.md tokens: [ 'welcome', 'to', 'the', 'project', 'this', 'guide', 'covers', 'recursion' ]
```

**Confirm this is LAB-10's classification instinct, inverted:** Instead of classifying individual CHARACTERS as digits/operators/letters (LAB-10's lexer), this splits on the OPPOSITE — anything that ISN'T a word character becomes a boundary. Same underlying idea (classify characters to find token boundaries), simpler grammar (natural-language prose has far fewer distinct "token types" than a programming language).

---

## Step 3 — Build the Inverted Index

```js
function buildIndex(files) {
  const index = new Map()                                // word -> Set of file paths — LAB-04's hash map

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const words = tokenize(content)
    for (const word of words) {
      if (!index.has(word)) {
        index.set(word, new Set())                          // first time seeing this word — start a new Set
      }
      index.get(word).add(file)                              // ← add: O(1) add — a Set naturally de-duplicates repeated words in one file
    }
  }
  return index
}

console.log('\n=== Building the Inverted Index ===')
const index = buildIndex(files)
console.log(`index['recursion']:`, index.get('recursion'))
console.log(`index['project']:`, index.get('project'))
console.log(`index['nonexistentword']:`, index.get('nonexistentword') || new Set())
```

### SAVE AND TRY

```bash
node index-engine.js
```

**Expected (shape, depending on your files' actual content):**
```
=== Building the Inverted Index ===
index['recursion']: Set { 'sample-docs/docs/intro.md', 'sample-docs/docs/guide.md' }
index['project']: Set { 'sample-docs/docs/intro.md', 'sample-docs/src/main.js' }
index['nonexistentword']: Set {} (empty — word not found anywhere)
```

**Confirm WHY this is called "inverted":** A NORMAL (forward) way to organize this data would be `file -> list of words it contains` — which is literally what's ALREADY on disk (open the file, read its words). This index does the OPPOSITE — `word -> list of files containing it` — inverting the natural direction, which is EXACTLY what makes "find every file containing X" an O(1) lookup (LAB-08) instead of scanning every file's content on every search. This is the SAME hash-map-for-fast-lookup trade-off as LAB-04 (a bit more memory, in exchange for dramatically faster queries).

---

## Step 4 — Incremental Indexing

```js
const fileIndex = new Map()      // file -> { mtime, words: Set }

function buildIndexIncremental(files, existingIndex) {
  const invertedIndex = new Map()
  let reindexedCount = 0

  for (const file of files) {
    const stat = fs.statSync(file)
    const cached = existingIndex.get(file)

    let words
    if (cached && cached.mtime === stat.mtimeMs) {              // ← add: unchanged since last index — REUSE the cached words
      words = cached.words
    } else {
      const content = fs.readFileSync(file, 'utf-8')             // ← add: changed (or new) — actually re-read and re-tokenize
      words = new Set(tokenize(content))
      existingIndex.set(file, { mtime: stat.mtimeMs, words })
      reindexedCount++
    }

    for (const word of words) {
      if (!invertedIndex.has(word)) invertedIndex.set(word, new Set())
      invertedIndex.get(word).add(file)
    }
  }

  return { invertedIndex, reindexedCount }
}

console.log('\n=== Incremental Indexing ===')
let start = Date.now()
let { invertedIndex } = buildIndexIncremental(files, fileIndex)
console.log(`initial index built: ${files.length} files, took ${Date.now() - start}ms`)

// simulate one file changing
fs.appendFileSync(files[0], '\nnew content added')
console.log(`${files[0]} modified`)

start = Date.now()
const result = buildIndexIncremental(files, fileIndex)
console.log(`re-indexing: only ${result.reindexedCount} file changed, took ${Date.now() - start}ms (not all ${files.length})`)
```

### SAVE AND TRY

```bash
node index-engine.js
```

**Expected (shape — exact timings vary, but `reindexedCount` should be exactly `1` the second time):**
```
=== Incremental Indexing ===
initial index built: 4 files, took 12ms
sample-docs/docs/intro.md modified
re-indexing: only 1 file changed, took 3ms (not all 4)
```

**Confirm `mtimeMs` comparison is the entire mechanism:** `fs.statSync(file).mtimeMs` is the file's last-MODIFIED timestamp, maintained by the OPERATING SYSTEM itself — comparing it to the CACHED value from the last index build tells us, cheaply, whether the file's CONTENT could possibly have changed, without needing to re-read and re-tokenize files that haven't. This is LAB-08's complexity lens applied directly: re-indexing goes from O(total files) to O(changed files) — a dramatic difference at scale (imagine 100,000 files, one edited).

---

## 🎯 Challenge: Term Frequency — Which File Matches Best?

**You know:** The inverted index (Step 3) tells you WHICH files contain a word, but not HOW OFTEN — a file mentioning "recursion" once and a file mentioning it 20 times are currently indistinguishable.

**Task:** Extend the index to also track a COUNT per (word, file) pair, and use it to rank search results by relevance.

<details>
<summary>▶ Show Solution</summary>

```js
function buildIndexWithFrequency(files) {
  const index = new Map()    // word -> Map<file, count>

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const words = tokenize(content)
    for (const word of words) {
      if (!index.has(word)) index.set(word, new Map())
      const fileMap = index.get(word)
      fileMap.set(file, (fileMap.get(file) || 0) + 1)      // ← increment the count for this (word, file) pair
    }
  }
  return index
}

function search(index, term) {
  const fileMap = index.get(term.toLowerCase())
  if (!fileMap) return []
  return [...fileMap.entries()]
    .sort((a, b) => b[1] - a[1])       // sort by count, DESCENDING — most occurrences first
}

console.log('\n=== Term Frequency: Which File Matches Best? ===')
const freqIndex = buildIndexWithFrequency(files)
console.log('searching for "recursion":')
for (const [file, count] of search(freqIndex, 'recursion')) {
  console.log(`  ${file}: ${count} occurrences`)
}
```

**Key insight:** This is EXACTLY LAB-15's priority/sorting instinct, applied to search RELEVANCE instead of task urgency — a file mentioning the search term MORE often is (usually, roughly) MORE relevant to that term, and sorting by count surfaces the best matches first. Real search engines (including LAB-54, next) use far more sophisticated relevance scoring (TF-IDF, BM25) that also account for how RARE a word is across the whole collection — but term frequency is the foundational signal every more sophisticated formula builds on top of.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `walkDirectory` | `find`, `ripgrep`, any tool that scans a filesystem recursively |
| The inverted index | Elasticsearch, Lucene, Google's own search index — same core data structure |
| Incremental indexing via `mtime` | How `make` decides what to rebuild, how IDEs re-index changed files only |
| Term frequency | The foundational signal behind every search relevance algorithm |

**Where you will see this again:** LAB-54 (Search Engine) builds directly on THIS lab's inverted index, adding ranking, multi-word queries, and proper relevance scoring. LAB-98 (File Watcher) automates the "detect what changed" step this lab currently does by comparing `mtime` on demand.

---

## Final Check

| Feature | How to verify |
|---|---|
| `walkDirectory` correctly finds every file at any depth | Step 1 |
| `tokenize` correctly splits file content into lowercase words | Step 2 |
| The inverted index correctly maps words to the files containing them | Step 3 |
| Incremental indexing re-processes ONLY changed files | Step 4 |
| Term frequency correctly ranks files by occurrence count | Challenge |
| You can explain, without notes, why it's called an "inverted" index | Step 3's Concept box |

---

## Quick Check Answers

**1. Scan every file per search, or precompute once — what's the trade-off?**

Precomputing (Step 3's inverted index) trades UPFRONT time and MEMORY (building and storing the index) for dramatically FASTER searches afterward (O(1) lookup per word, LAB-08, instead of O(total file content) per search) — the classic space-time trade-off (LAB-08's Concept box). For a collection that's searched many times relative to how often it changes, this trade-off is almost always worth it; a collection searched once and never again might not justify the upfront indexing cost.

**2. What would a NON-inverted (forward) index map?**

File → words it contains — which is, in a sense, already what's directly on disk (open a file, read its content, see its words). The "inversion" specifically means flipping that natural direction to word → files, which is the SHAPE that makes "which files contain X" a fast, direct lookup instead of requiring you to check every file's own word list one at a time.

**3. What's wasteful about re-indexing everything when one file changes?**

Re-reading and re-tokenizing 9,999 files that DIDN'T change, purely because ONE did — pure wasted work, confirmed directly in Step 4, where incremental indexing correctly re-processed only the 1 modified file instead of all 4 (or, at real scale, all 10,000). The `mtime` comparison lets the indexer cheaply SKIP anything unchanged, turning re-indexing from O(total files) into O(changed files) — a difference that matters enormously as a collection grows large.

---

*Next: [LAB-54 — Search Engine](LAB-54-search-engine.md) — JavaScript (Node.js), same module*
