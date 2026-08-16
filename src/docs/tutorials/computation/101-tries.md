# Lesson 101: Tries

**What you will build**: By the end of this lesson you'll derive a tree indexed not by comparing whole values against each other (every structure since Lesson 92), but by walking a key's own *pieces* one at a time — a **trie**, shaped directly by the characters a string is made of, where two words sharing a prefix share the exact same path through the tree, stored only once.

**What you need to know first**: Lesson 85's vector-as-pair, applied twice over in this lesson's node shape; Lesson 84's `get` and `count`, both of which also work on strings directly; Lesson 92's BST, for direct contrast in how each indexes its keys.

**Terms introduced in this lesson**:

- **trie** — a tree in which each edge is labeled with one character, and a path from the root spells out a prefix; a node is marked as a complete word's end, or not. *Why it matters*: every structure since Lesson 92 compared entire keys to each other; a trie never compares two whole strings — it only ever compares one character at a time, against a specific position.
- **prefix** — the characters at the start of a string, up to some point. *Why it matters*: this lesson's whole structure is organized around prefixes specifically — every node in a trie corresponds to exactly one prefix, shared by every word that starts with it.

**Objects and methods used**: None new. This lesson reuses `get` and `count` (Lesson 84), now shown working on Clojure strings directly rather than only vectors: `(get "cat" 0)` returns the character `\c`, and `(count "cat")` returns `3`, the identical functions already covered, applied to a new kind of collection.

---

## Concept Unit: A Tree Shaped by Characters

### The Problem

A BST (Lesson 92) stores `"cat"` and `"car"` as two entirely separate values, compared to each other and to everything else as whole strings — nothing about the fact that they share their first two characters is ever used. Can a tree's own *shape* be built directly from that shared structure, so `"ca"` is only ever represented once?

### Introduce the concept in isolation

```clojure
(defn make-trie-node [end? children] [end? children])
(defn trie-end? [node] (get node 0))
(defn trie-children [node] (get node 1))

(defn trie-find-child [children ch i]
  (if (>= i (count children))
    nil
    (if (= (get (get children i) 0) ch)
      (get (get children i) 1)
      (trie-find-child children ch (+ i 1)))))
```

```clojure
(def trie
  (make-trie-node false
    [[\c (make-trie-node false
           [[\a (make-trie-node false
                  [[\t (make-trie-node true [])]
                   [\r (make-trie-node true [])]])]])]]))
```

```
user=> (trie-end? trie)
false
user=> (trie-find-child (trie-children trie) \c 0)
[false [[\a [false [[\t [true []]] [\r [true []]]]]]]]
```

`trie` holds exactly the two words `"cat"` and `"car"`, sharing every node down through `"ca"` — the trie only branches into two separate children at the third character, exactly where the two words actually differ. Each **child** is a `[character, child-node]` pair — Lesson 85's vector-as-pair, once for the node itself (`[end? children]`) and again for every entry in its `children` vector.

### Discard the throwaway example

Not applicable — every function here is real, and `trie` is a real running example the next unit searches.

### Project Change

- **Reference Source**: No reference counterpart — `[end? children]` is a direct, from-scratch shape matching the character-indexed structure a trie's own definition requires; `trie-find-child`'s linear scan reuses Lesson 24's basic list-scanning shape, applied to a vector.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn trie-find-child [children ch i]
  (if (>= i (count children))
    nil
    (if (= (get (get children i) 0) ch)
      (get (get children i) 1)
      (trie-find-child children ch (+ i 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[end? children]`** — first appearance of this specific node shape: `end?` (a plain boolean, already covered since Lesson 7) marks whether some inserted word stops *exactly* here, distinct from merely being a prefix some longer word passes through.
- **`(get (get children i) 0)`** — reads one child-pair's character; the outer `get` reappearing on `children` (a vector), the inner `get` reappearing on that pair itself, both already-covered uses of the identical function.
- **`(= (get (get children i) 0) ch)`** — reappearing equality (Lesson 2), now comparing two characters rather than two numbers — Clojure characters compare with `=` the same way every other value in this series has.

### CS Lens

`trie-find-child`'s linear scan costs `O(k)`, where `k` is how many *different* characters branch from this one node — bounded by the alphabet size, not by how many words the trie stores, unlike Lesson 92's `bst-search`, whose cost depends on the tree's own depth, which depends on how many values it holds.

### SE Lens

Nothing about a trie's shape depends on insertion *order* the way Lesson 97 showed a BST's does — `"car"` inserted before or after `"cat"` produces the identical tree, since a trie's shape is determined entirely by the *characters* stored, never by which order they arrived in.

---

## Concept Unit: `trie-contains?` — Walking a Word One Character at a Time

### The Problem

Lesson 92's `bst-search` compares a whole target against a whole node value, once per node. A trie has no single value at a node to compare against — only a position in the word and a set of labeled children. What does "search" even mean here?

### Introduce the concept in isolation

```clojure
(defn trie-contains-at-char? [child word i]
  (if (nil? child)
    false
    (trie-contains-at? child word (+ i 1))))

(defn trie-contains-at? [node word i]
  (if (>= i (count word))
    (trie-end? node)
    (trie-contains-at-char? (trie-find-child (trie-children node) (get word i) 0) word i)))

(defn trie-contains? [node word]
  (trie-contains-at? node word 0))
```

```
user=> (trie-contains? trie "cat")
true
user=> (trie-contains? trie "ca")
false
user=> (trie-contains? trie "dog")
false
```

`(trie-contains? trie "cat")`: walk `\c`, then `\a`, then `\t`, each one found among the current node's children; having consumed every character (`i = 3 = (count "cat")`), the base case checks `trie-end?` at the final node — `true`, since `"cat"` was inserted as a complete word. `(trie-contains? trie "ca")` walks the identical first two steps, but stops at `i = 2 = (count "ca")` — at the node representing prefix `"ca"` itself, where `trie-end?` is `false`: `"ca"` is a genuine *path* through this trie, but was never inserted as its own word. `(trie-contains? trie "dog")` fails immediately — `trie-find-child` finds no `\d` among the root's children at all, `trie-contains-at-char?`'s `nil` check stops the walk without ever looking further.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: `trie-contains-at?`/`trie-contains-at-char?` reuse Lesson 91's mutual-recursion pattern (via `declare`, though named directly here without needing it, since `trie-contains-at-char?` is defined first) and Lesson 91's own compute-once-pass-to-a-helper shape — the child found by `trie-find-child` is computed once and handed to the next step.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn trie-contains? [node word]
  (trie-contains-at? node word 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(>= i (count word))`** — the base case: every character has been consumed — whether the *word itself* is stored depends only on `trie-end?` here, not on whether the path existed, exactly the distinction `"ca"`'s own trace demonstrated.
- **`(nil? child)`** — reappearing `nil?` (Lesson 85): no child labeled with the current character exists, meaning the word cannot possibly be stored — correctly reported without walking any further.
- **`(trie-find-child (trie-children node) (get word i) 0)`** — reappearing `trie-find-child` (Concept Unit 1) and `get` on a string, reading the word's `i`-th character directly.

### CS Lens

`trie-contains?`'s cost is `O(L)`, where `L` is the *searched word's own length* — not `O(\log n)`, not dependent on how many other words are stored at all, a genuinely different cost shape than every comparison-based structure since Lesson 91.

### SE Lens

`"ca"` returning `false` while clearly being a valid path through `trie` is exactly the subtlety a trie's own two-part node (`end?` separate from `children`) exists to capture correctly — collapsing them into one ("a node with children must be a stored word") would silently treat every prefix of every stored word as itself a stored word, a real, easy mistake this lesson's representation rules out by construction.

### Connection to the previous unit

The previous unit built the shape a trie needs; this unit shows walking that shape one character at a time — never comparing whole words — is enough to answer "is this exact word stored," including correctly distinguishing a stored word from a mere prefix of one.

---

## Concept Unit: Why Shared Prefixes Are Worth Sharing

### The Problem

Storing `"cat"` and `"car"` in a BST (Lesson 92) means two entirely separate leaf values, each spelling out its own full three characters independently. This lesson's trie stores `"ca"` exactly once. Does that saving matter, and where does this shape show up in practice?

### Introduce the concept in isolation

Every word sharing the prefix `"ca"` — `"cat"`, `"car"`, and any future `"cab"`, `"cap"`, `"cast"` — reuses the *identical* two nodes this lesson already built for `\c` and `\a`; only the branching point where words actually diverge ever costs a new node. This is the direct multiway generalization of Lesson 100's own median-split motivation — B-trees minimized redundant *node visits*; a trie minimizes redundant *storage* of shared structure, for the same underlying reason: real keys are rarely unrelated to each other, and a structure that exploits the relationship they *do* have outperforms one that treats every key as independent.

Three places this shape recurs directly:

- **Autocomplete** — typing `"ca"` and being offered `"cat"`, `"car"`, `"cast"` is *exactly* `trie-find-child` applied repeatedly from the `"ca"` node, listing every completion reachable from there — no separate search per suggestion.
- **IP routing tables** — network routers match the *longest matching prefix* of a destination address against known routes, a trie walk over address bits instead of characters.
- **File paths and hierarchical keys** — `/usr/local/bin` and `/usr/local/lib` sharing `/usr/local` is the identical shared-prefix structure this lesson built for words, one path segment at a time instead of one character at a time.

### Discard the throwaway example

Not applicable — a survey of applications, not new code.

### CS Lens

This is Lesson 96's own closing lesson repeated in a new form: a small, fixed shape (here, one character-labeled node) reused across genuinely different-looking problems (spelling, addresses, file systems) once each is recognized as "a sequence of pieces with shared prefixes," the same transfer Lesson 96 made for "repeatedly serve the current minimum."

### SE Lens

Choosing a trie over a BST or hash table (Lesson 89) for a set of string keys is worth it specifically when keys share meaningful prefixes and prefix-based queries ("everything starting with `ca`") matter — a hash table answers "is this exact string present" at least as fast, but has no notion of "prefix" at all; a trie is a deliberate trade of that generality for prefix structure a hash table's own scattering (Lesson 89's own hashing) actively destroys.

### Connection to the previous unit

The previous unit proved a trie answers exact-membership questions correctly; this unit is why the specific *shape* that makes that possible — shared prefixes stored once — is worth building in the first place, beyond the one query this lesson's code actually implements.

---

## Connect the Pieces

Every function from this lesson, exercised together:

```clojure
(println "Contains 'cat'?" (trie-contains? trie "cat"))
(println "Contains 'car'?" (trie-contains? trie "car"))
(println "Contains 'ca' (prefix only)?" (trie-contains? trie "ca"))
(println "Contains 'dog'?" (trie-contains? trie "dog"))
```

```
Contains 'cat'? true
Contains 'car'? true
Contains 'ca' (prefix only)? false
Contains 'dog'? false
```

Two genuinely different words, correctly distinguished from a shared prefix that was never itself inserted, and a completely absent word rejected in a single failed step — all from one small, character-labeled tree, no whole-string comparison anywhere.

## What Breaks Without This

Suppose `trie-contains-at?`'s base case checked only whether a node exists at all, rather than checking `trie-end?` specifically:

```clojure
(defn broken-contains-at? [node word i]
  (if (>= i (count word))
    true
    (broken-contains-at? (trie-find-child (trie-children node) (get word i) 0) word (+ i 1))))
```

```
user=> (broken-contains-at? trie "ca" 0)
true
```

`"ca"` now reports `true` — wrongly, since it was never inserted as a word of its own, only ever built as a shared prefix of `"cat"` and `"car"`. This is exactly the mistake this lesson's SE lens (Concept Unit 2) warned against: collapsing "a path exists" and "a word is stored" into one check treats every prefix of every real word as if it were itself a real entry — silently, for every trie this bug touches, not just this one small example.

## Exercises

1. **Trace.** By hand, trace `(trie-contains? trie "cab")`, showing exactly where the walk fails.
2. **Predict.** Before checking, predict whether `(trie-contains? trie "care")` (one character longer than `"car"`) returns `true` or `false`. Verify by tracing.
3. **Verify.** Run `broken-contains-at?` on `"c"` and `"ca"` and confirm both incorrectly report `true`, despite neither being a stored word.
4. **Break it, on purpose.** Construct a trie storing only `"dog"`, and confirm `trie-contains?` correctly rejects `"do"` and `"doggy"` alike — one a prefix, one an extension, neither the stored word itself.
5. **Generalize.** Write `trie-starts-with?`, returning `true` if *any* stored word begins with a given prefix, regardless of whether the prefix itself was ever inserted as a complete word — reusing `trie-find-child`'s walk, but without checking `trie-end?` at all.
6. **Reconstruct.** Close this lesson. From memory, explain why `trie-contains?`'s cost depends only on the searched word's own length, not on how many other words the trie stores.

## Definition of Done

- [ ] You can build a small trie by hand and explain what `end?` and `children` each represent.
- [ ] You can implement `trie-contains?` and explain why it correctly distinguishes a stored word from a shared prefix.
- [ ] You can name at least two real applications where sharing prefixes structurally, not just storing keys, matters.
- [ ] You completed Exercise 3 and demonstrated the broken version's false positives.
- [ ] You completed Exercise 5 and implemented a correct `trie-starts-with?`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you found and built — for example, `"Demonstrate broken-contains-at? false-positiving on unstored prefixes; implement trie-starts-with? for prefix queries"` — not just `"lesson 101 exercise"`.

---

**Next lesson:** Lesson 102, *Disjoint Sets*, leaves trees indexed by comparison or by character behind entirely, building a structure around a different question — not "is this value here," but "are these two values in the same group" — starting from Lesson 11's equivalence relations.
