# SE Masterclass — LAB-54 — Search Engine

**Language: JavaScript (Node.js)** — same module as LAB-53, building directly on its inverted index.

**Prerequisites:** LAB-53 (the inverted index and term frequency — this lab's entire foundation) and LAB-15 (ranking by score is LAB-15's priority-queue instinct, applied to search relevance instead of task urgency).

**What this lab adds:**
- Multi-word queries: finding files matching ALL query terms (set intersection)
- TF-IDF: a real relevance formula — term frequency, weighted by how RARE a word is across the whole collection
- Ranking multiple results by combined relevance score
- Search snippets: showing the matched text in CONTEXT, not just a bare file list

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Searching for "the recursion" — should a file need to contain "the" AND "recursion," or just one of them? Which is more USEFUL for the person searching?
> 2. Two files both mention "recursion" twice. File A mentions "the" 50 times; File B doesn't mention "the" at all. Should "the" contribute EQUALLY to both files' relevance scores?
> 3. What information does IDF (inverse document frequency) capture that raw term frequency alone does not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node search.js` prints:

```
=== Multi-Word Query: AND Semantics ===
searching "recursion project":
  files with "recursion": [ 'docs/intro.md', 'docs/guide.md' ]
  files with "project": [ 'docs/intro.md', 'src/main.js' ]
  files with BOTH (intersection): [ 'docs/intro.md' ]

=== TF-IDF: Rare Words Matter More ===
"the" appears in 4/4 files -> IDF: 0.00 (common — contributes almost nothing)
"recursion" appears in 2/4 files -> IDF: 0.69 (rarer — contributes meaningfully)
tf-idf('the', intro.md) = 12 * 0.00 = 0.00
tf-idf('recursion', intro.md) = 1 * 0.69 = 0.69

=== Ranked Search Results ===
searching "recursion":
  1. docs/guide.md — score: 2.08 (3 occurrences x IDF 0.69)
  2. docs/intro.md — score: 0.69 (1 occurrence x IDF 0.69)

=== Search Snippets ===
docs/guide.md matched "recursion":
  "...this guide covers **recursion** in depth, showing how..."
```

---

### Concept: Multi-Word Queries Need Set Intersection

**What it is:** Searching for "recursion project" (two words) should — for AND semantics, the most common default — return files containing BOTH words, not files containing EITHER one. This is a SET INTERSECTION: take the set of files containing "recursion," the set containing "project," and keep only what's in BOTH.

---

## Step 1 — Multi-Word AND Queries

```js
// search.js
const { buildIndex, tokenize } = require('./index-engine')    // reusing LAB-53's index builder directly

function intersect(setA, setB) {
  return new Set([...setA].filter(x => setB.has(x)))         // ← add: keep only elements present in BOTH sets
}

function searchAll(index, query) {
  const terms = tokenize(query)
  if (terms.length === 0) return new Set()

  let result = index.get(terms[0]) || new Set()
  for (let i = 1; i < terms.length; i++) {
    result = intersect(result, index.get(terms[i]) || new Set())    // ← add: narrow the result set with EACH additional term
  }
  return result
}

const files = walkDirectory('./sample-docs')     // from LAB-53
const index = buildIndex(files)

console.log('=== Multi-Word Query: AND Semantics ===')
console.log('searching "recursion project":')
console.log(`  files with "recursion":`, index.get('recursion'))
console.log(`  files with "project":`, index.get('project'))
console.log(`  files with BOTH (intersection):`, searchAll(index, 'recursion project'))
```

### SAVE AND TRY

```bash
node search.js
```

**Expected (shape, depending on your sample files):**
```
=== Multi-Word Query: AND Semantics ===
searching "recursion project":
  files with "recursion": Set { 'sample-docs/docs/intro.md', 'sample-docs/docs/guide.md' }
  files with "project": Set { 'sample-docs/docs/intro.md', 'sample-docs/src/main.js' }
  files with BOTH (intersection): Set { 'sample-docs/docs/intro.md' }
```

**Confirm the intersection is genuinely narrowing, not just concatenating:** `guide.md` (has "recursion" but not "project") and `main.js` (has "project" but not "recursion") are BOTH correctly EXCLUDED from the final result — only `intro.md`, present in BOTH individual sets, survives. This is LAB-06's set operations, applied to real search semantics.

---

### Concept: TF-IDF — Rare Words Should Matter More

**What it is:** LAB-53's term frequency alone treats every WORD equally — but "the" appearing 50 times in a file says almost NOTHING about relevance (it's a common word that appears everywhere), while "recursion" appearing even ONCE says a LOT (it's a rare, specific, meaningful word). **TF-IDF** (Term Frequency × Inverse Document Frequency) corrects for this: multiply how OFTEN a word appears in THIS file by how RARE that word is ACROSS THE WHOLE COLLECTION.

**The formula:**
```
TF  = (occurrences of word in this file)
IDF = log(total files / files containing this word)
TF-IDF = TF × IDF
```

A word appearing in EVERY file has `IDF = log(N/N) = log(1) = 0` — it contributes NOTHING to relevance, no matter how often it appears (exactly "the"'s situation). A word appearing in very FEW files has a HIGH `IDF` — even one occurrence is a strong relevance signal.

---

## Step 2 — Compute TF-IDF

```js
function buildFrequencyIndex(files) {
  const wordFileCounts = new Map()     // word -> Map<file, count>
  for (const file of files) {
    const words = tokenize(require('fs').readFileSync(file, 'utf-8'))
    for (const word of words) {
      if (!wordFileCounts.has(word)) wordFileCounts.set(word, new Map())
      const fileMap = wordFileCounts.get(word)
      fileMap.set(file, (fileMap.get(file) || 0) + 1)
    }
  }
  return wordFileCounts
}

function idf(word, freqIndex, totalFiles) {
  const filesWithWord = freqIndex.get(word)
  const docCount = filesWithWord ? filesWithWord.size : 0
  if (docCount === 0) return 0
  return Math.log(totalFiles / docCount)          // ← add: the IDF formula — rarer words produce a LARGER number
}

function tfIdf(word, file, freqIndex, totalFiles) {
  const filesWithWord = freqIndex.get(word)
  const tf = filesWithWord ? (filesWithWord.get(file) || 0) : 0
  return tf * idf(word, freqIndex, totalFiles)      // ← add: TF x IDF
}

const freqIndex = buildFrequencyIndex(files)

console.log('\n=== TF-IDF: Rare Words Matter More ===')
const theIdf = idf('the', freqIndex, files.length)
const recursionIdf = idf('recursion', freqIndex, files.length)
console.log(`"the" appears in ${freqIndex.get('the')?.size || 0}/${files.length} files -> IDF: ${theIdf.toFixed(2)} (common — contributes almost nothing)`)
console.log(`"recursion" appears in ${freqIndex.get('recursion')?.size || 0}/${files.length} files -> IDF: ${recursionIdf.toFixed(2)} (rarer — contributes meaningfully)`)
```

### SAVE AND TRY

```bash
node search.js
```

**Expected (exact numbers depend on your sample files, but the SHAPE holds — "the" should have a much lower IDF than "recursion"):**
```
=== TF-IDF: Rare Words Matter More ===
"the" appears in 4/4 files -> IDF: 0.00 (common — contributes almost nothing)
"recursion" appears in 2/4 files -> IDF: 0.69 (rarer — contributes meaningfully)
```

**Confirm the formula's behavior, precisely:** If "the" appears in ALL 4 of 4 files, `log(4/4) = log(1) = 0` — its IDF is EXACTLY zero, meaning ANY term-frequency count for "the," multiplied by zero, contributes NOTHING to a file's relevance score, no matter how many times "the" appears. This is the formula doing EXACTLY what it's designed to do: automatically discount universally-common words without needing a hand-maintained "stop word" list.

---

## Step 3 — Ranked Search Results

```js
function rankedSearch(query, freqIndex, files) {
  const terms = tokenize(query)
  const candidateFiles = searchAll(buildIndex(files), query)     // reuse Step 1's AND-intersection for candidate filtering

  const scores = [...candidateFiles].map(file => {
    const score = terms.reduce((sum, term) => sum + tfIdf(term, file, freqIndex, files.length), 0)
    return { file, score }
  })

  return scores.sort((a, b) => b.score - a.score)      // ← add: highest score first — LAB-15's priority ordering
}

console.log('\n=== Ranked Search Results ===')
console.log('searching "recursion":')
const results = rankedSearch('recursion', freqIndex, files)
results.forEach((r, i) => {
  const tf = freqIndex.get('recursion')?.get(r.file) || 0
  console.log(`  ${i + 1}. ${r.file} — score: ${r.score.toFixed(2)} (${tf} occurrences x IDF ${recursionIdf.toFixed(2)})`)
})
```

### SAVE AND TRY

```bash
node search.js
```

**Expected (shape — the file mentioning "recursion" MORE often should rank FIRST):**
```
=== Ranked Search Results ===
searching "recursion":
  1. docs/guide.md — score: 2.08 (3 occurrences x IDF 0.69)
  2. docs/intro.md — score: 0.69 (1 occurrence x IDF 0.69)
```

**Confirm ranking uses the SCORE, not the ORDER files were indexed in:** Even if `intro.md` was walked/indexed BEFORE `guide.md` (Step 1's file order), the RESULT list is sorted by `score` DESCENDING — exactly LAB-15's `MinHeap`/priority instinct (here, sorted directly since result sets are typically small enough not to need a heap, but the RANKING PRINCIPLE — "most relevant first, regardless of insertion order" — is identical).

---

## 🎯 Challenge: Search Snippets

**You know:** A raw file list ("here are 3 files matching your query") is far less useful than showing WHERE and HOW each file matched — a "snippet" of surrounding text, like real search engines show.

**Task:** Write `extractSnippet(content, term, contextChars = 30)` that finds the FIRST occurrence of `term` in `content` and returns a substring showing `contextChars` characters before and after it.

<details>
<summary>▶ Show Solution</summary>

```js
function extractSnippet(content, term, contextChars = 30) {
  const lowerContent = content.toLowerCase()
  const index = lowerContent.indexOf(term.toLowerCase())
  if (index === -1) return null

  const start = Math.max(0, index - contextChars)
  const end = Math.min(content.length, index + term.length + contextChars)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < content.length ? '...' : ''

  const before = content.slice(start, index)
  const match = content.slice(index, index + term.length)
  const after = content.slice(index + term.length, end)

  return `${prefix}${before}**${match}**${after}${suffix}`
}

console.log('\n=== Search Snippets ===')
const guideFile = results[0].file
const guideContent = require('fs').readFileSync(guideFile, 'utf-8')
console.log(`${guideFile} matched "recursion":`)
console.log(`  "${extractSnippet(guideContent, 'recursion')}"`)
```

**Key insight:** `String.prototype.indexOf` is a simple, direct string search — for a REAL search engine handling large documents and many terms, this would be replaced with a more efficient algorithm (or the position data would be PRE-COMPUTED and stored IN the index itself, alongside the term-frequency counts, avoiding a fresh scan at query time). The KEY UX insight, though, doesn't depend on the algorithm: showing MATCHED CONTEXT, not just a bare filename, is what makes search results actually useful to skim — exactly why Google shows a snippet under every result, not just a blue link.

</details>

### SAVE AND TRY

```bash
node search.js
```

**Expected (exact wording depends on your sample file's content):**
```
=== Search Snippets ===
docs/guide.md matched "recursion":
  "...this guide covers **recursion** in depth, showing how..."
```

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| Multi-word AND intersection | Every search engine's default query behavior |
| TF-IDF | The foundational relevance algorithm behind Lucene, Elasticsearch, and classic web search |
| Ranked results | Why the "best" match appears first, not just any match |
| Search snippets | Every search engine's result page, showing matched context |

**Where you will see this again:** LAB-63 (Query Engine) and LAB-66 (Analytics Engine) both build on the same "index once, query many times cheaply" philosophy this lab establishes.

---

## Final Check

| Feature | How to verify |
|---|---|
| Multi-word queries correctly return only files matching ALL terms | Step 1 |
| A common word ("the") has a near-zero IDF; a rare word has a meaningfully higher one | Step 2 |
| TF-IDF correctly combines term frequency and rarity into one score | Step 2 |
| Search results are ranked by score, highest first | Step 3 |
| Search snippets correctly show matched text in context | Challenge |
| You can explain, without notes, why "the" shouldn't count as much as "recursion" | Step 2's Concept box |

---

## Quick Check Answers

**1. "the recursion" — need BOTH words, or just one? Which is more useful?**

Needing BOTH (AND semantics, Step 1) is the more useful default for most searches — someone searching multiple words is almost always looking for content relevant to ALL of them together, not content that happens to mention just ONE. (OR semantics has its uses too — broadening results — but AND is the sensible default this lab implements, matching how Google and most search tools behave by default.)

**2. Should "the" contribute equally for both files, regardless of how often each mentions it?**

No — and TF-IDF (Step 2) is specifically designed to prevent this. Because "the" appears in essentially EVERY file (high document frequency), its IDF is near zero, meaning its contribution to ANY file's relevance score is near zero REGARDLESS of raw term frequency — a file mentioning "the" 50 times gets almost no relevance boost from that fact, exactly as it should, since "the" says nothing distinctive about the file's actual topic.

**3. What does IDF capture that raw term frequency alone doesn't?**

RARITY across the whole collection — how DISTINCTIVE a word is. Raw term frequency only looks at ONE file in isolation ("how often does this word appear HERE"); IDF looks at the ENTIRE collection ("how many OTHER files also use this word"). A word that's rare across the collection but appears in THIS file is a much stronger signal that this file is specifically ABOUT that topic, compared to a word that appears everywhere and thus distinguishes nothing — exactly the "the" vs. "recursion" comparison demonstrated directly in Step 2.

---

*Next: [LAB-55 — Background Worker System](LAB-55-background-worker-system.md) — Python, same module*
