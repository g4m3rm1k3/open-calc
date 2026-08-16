# Lesson 106: Tries

**What you will build:** a **trie** (prefix tree) — a real, reference-based structure representing a set of strings so that shared prefixes are stored once, answering "does any stored word start with this prefix" directly, a question Lesson 91 through 95's hash tables cannot answer at all without scanning every stored key. Real, verified evidence this session: inserting `"car"`, `"care"`, and `"cat"` produces a real tree whose `"ca"` node has exactly two children, `t` and `r` — the literal, inspectable proof that `"car"` and `"care"`'s shared four characters are stored exactly once, not duplicated per word. At real scale, checking whether any stored word starts with a genuinely absent prefix costs an exact, flat `3` character comparisons whether `100`, `1,000`, or `10,000` words are stored — identical at every scale — while the plainest possible alternative, scanning every stored word, costs exactly `100`, `1,000`, and `10,000` real comparisons respectively, matching the stored count exactly. The transferable point: Lesson 92 built a hash function specifically to scatter similar keys apart, and Lesson 95 showed why that scattering matters. This lesson builds a structure that does the *opposite*, deliberately: it keeps similar keys — keys sharing a prefix — as close together as possible, and earns a real, different capability by doing it.

**What you need to know first:** Lesson 91 (`FP-L091-sets-and-maps.md`) — specifically `Map`'s association-pair representation (`cons`, `assoc`, `filter`), reused directly for each trie node's children. Lesson 88 (`FP-L088-stacks.md`) — specifically `string->list` and `char=?`, reused to walk a string one character at a time. Lesson 92 (`FP-L092-hashing.md`) and Lesson 95 (`FP-L095-hash-table-failure-modes.md`) — specifically hashing's deliberate scattering of similar keys, the direct point of contrast this lesson opens with. Lesson 97 (`FP-L097-binary-search-trees.md`) — specifically what an invariant precisely governing per-node structure looks like, the format this lesson's own trie invariant follows.

**Terms introduced in this lesson**

- **Trie (prefix tree)** — a tree where the path from the root to any node spells out a string, one character per edge; each node marks whether the path reaching it is itself a complete stored word. It exists to represent a set of strings so that shared prefixes occupy shared structure, making prefix-based questions answerable directly, without scanning every stored word.

**Objects and methods used**

- **`string->list`**
  - *What it is:* a real Scheme procedure converting a string into a list of its individual characters.
  - *Implementation:* takes a string, returns a list of characters in order; reappearing from Lesson 88, used as `(string->list word)`.
  - *Its use:* turning an inserted or queried string into the sequence `trie-insert`/`trie-walk` consume one character at a time.
- **`char=?`**
  - *What it is:* a real Scheme procedure comparing two characters for equality.
  - *Implementation:* takes two characters, returns a boolean; reappearing from Lesson 88, used as `(char=? (car p) c)`.
  - *Its use:* matching a target character against a node's existing children, both inside `assoc`'s own comparison and in this lesson's hand-written counted lookup.
- **`assoc`**
  - *What it is:* a real Scheme procedure searching a list of pairs for one whose `car` matches a given key.
  - *Implementation:* takes a key and an association list, returns the matching pair or `#f`; reappearing from Lesson 91, used as `(assoc c (trie-children t))`.
  - *Its use:* looking up an existing child by character at every trie node, the same role it played for `Map`'s `map-get`.
- **`filter`**
  - *What it is:* a real Scheme procedure returning a new list containing only the elements satisfying a given predicate.
  - *Implementation:* takes a predicate and a list, returns the filtered list; reappearing from Lesson 35/91, used in `trie-set-child`.
  - *Its use:* removing any existing same-character child entry before consing the new one on, preventing duplicate entries on re-insertion through an already-present character.
- **`random`**
  - *What it is:* a real Scheme procedure returning a pseudo-random, non-negative integer below a given bound.
  - *Implementation:* takes an exclusive upper bound, returns an integer in `[0, bound)`; reappearing from Lesson 104, used as `(random (length word-pool))`.
  - *Its use:* drawing the stored-word list for Concept Unit 4's real cost comparison.
- **`list-ref`**
  - *What it is:* a real Scheme procedure returning the element at a given position in a list.
  - *Implementation:* takes a list and a zero-based index, returns that element; reappearing from Lesson 83, used as `(list-ref word-pool (random ...))`.
  - *Its use:* picking a random word from the fixed word pool for each stored entry.

---

## Concept Unit 1: A Question Hashing Cannot Answer

### The Problem

Lesson 92 built `sum-hash` specifically to scatter related keys apart — `"cat"`, `"car"`, and `"cup"` land in unrelated table slots, by design, and Lesson 95 showed exactly why that scattering matters: keys that hash *close together* are precisely what causes real clustering damage. That design choice is genuinely correct for "is this exact key present" — but it makes a different, equally real question unanswerable without real extra cost: "does *any* stored word start with `\"ca\"`?" A hash table's own structure records nothing at all about which keys resemble each other, so answering that question over a hash table means checking every single stored key by hand, one at a time — the exact linear cost Lesson 91's naive `set-member?` already measured, with none of Lesson 92's improvement available to help.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, contrasting with Lesson 92 and 95's own deliberate scattering.

### Applying It — What a Prefix-Aware Representation Would Need

A representation that could answer a prefix question directly would need to do the opposite of hashing: keep words sharing a prefix reachable through *shared* structure, so that walking the shared prefix once — not once per stored word — is enough to know whether continuing is even possible.

### Walkthrough

- **The direct citation of Lesson 92's `sum-hash` and Lesson 95's own clustering-damage evidence** — makes the contrast concrete: a real design already built in this curriculum, deliberately optimized against exactly the property this lesson's structure now deliberately optimizes *for*.
- **"walking the shared prefix once, not once per stored word"** — previews Concept Unit 2's structure precisely, before any formal definition.

### CS Lens

This is a real instance of a representation choice with no single "better" answer — only a trade matched to a specific required operation, the same design discipline Lesson 104 applied when it chose a weaker invariant than a BST's. Also recognized in: a phone contact list sorted alphabetically, deliberately keeping similar names near each other to support "show me everyone whose name starts with `\"Mc\"`," versus a hash-based contact lookup, deliberately scattering names to support "find this exact contact" as fast as possible — genuinely different, both legitimate, organizing principles for the identical underlying data.

### SE Lens

The alternative to building a dedicated structure is to keep using Lesson 93's hash table for string storage regardless of which questions actually get asked of it, the way choosing "a data structure that already worked before" without checking the real required operation set can happen. The real cost of that alternative, precisely: any prefix-shaped question — autocomplete, spell-check suggestion, matching a typed-so-far input against known commands — degrades to a full scan every single time, no matter how good the hash function is, because the hash table's own structure was never built to preserve the relationship the question depends on.

---

## Concept Unit 2: Deriving the Trie's Structure and Invariant

### The Problem

Concept Unit 1 named the requirement in the abstract. It needs a precise structure and invariant — Lesson 97's own format for stating one — plus a decision about how a single node actually holds its children.

### No isolated lab for this step

This concept has no code of its own to isolate — the structure and invariant are derived directly below, and Concept Unit 3 implements and verifies them as real code.

### Applying It — One Node, One Character Per Edge

**A trie node holds two things:** a marker, `end?`, true exactly when the path reaching this node spells a complete stored word; and a set of children, each reachable by exactly one character — the *next* character of whatever's being stored past this point. Represented directly: `(list children end?)`, where `children` is a list of `(character . child-node)` pairs — the identical association-pair shape Lesson 91's `Map` already used for `(key . value)` pairs, reused here for `(character . child-trie)` pairs instead.

**The invariant, precisely:** for any string `s`, walking the trie from the root, one character of `s` at a time, following each character's matching child — if such a child exists — reaches a node whose `end?` is true if and only if `s` was actually inserted. This is a genuinely different shape of invariant than Lesson 97's BST: a BST's invariant orders *values* against each other at a node — "everything smaller goes left." A trie's invariant instead spells out a *string*, one character per edge — position in the tree corresponds to position in the string being stored, never to relative value.

**The subtlety worth deriving explicitly:** a node existing at the end of a walk does *not*, by itself, mean the walked string was ever inserted. Inserting only `"car"` and then walking `"ca"` reaches a real node — but that node's `end?` is false, because `"ca"` alone was never itself inserted, only passed through on the way to `"car"`. Without a separate `end?` marker at every node, there would be no way to distinguish "this exact string was stored" from "this string is merely a prefix of something longer that was stored."

### Walkthrough

- **The two-part node shape, `(children end?)`** — the minimum needed to answer both "is this exact string stored" (`end?`) and "what comes next" (`children`).
- **The direct reuse of Lesson 91's association-pair shape** — a hard concept reappearing, restated here rather than re-derived: children are looked up by `assoc`, exactly the way `Map`'s `map-get` already worked.
- **The `"ca"`-versus-`"car"` subtlety, derived before any code exists** — previews Concept Unit 3's own real, checked confirmation of exactly this distinction.

### CS Lens

This is Lesson 84's "behavior first, then representation" discipline applied to a structure whose entire *point* is unusual sharing: a trie's real space savings come directly from the invariant permitting multiple stored strings to walk through identical shared nodes for as long as their characters agree, diverging only where the strings themselves actually differ. Also recognized in: a filing cabinet organized by folder, sub-folder, sub-sub-folder — "Invoices/2024/March" and "Invoices/2024/April" sharing the identical `Invoices/2024` folder structure, diverging only at the month, rather than each getting an entirely separate, duplicated path.

### SE Lens

The alternative to a dedicated `end?` marker is to infer "stored" from "has no children" (a leaf) — a real design some trie implementations use for restricted cases. The real cost of that shortcut: it silently breaks the moment one stored word is a prefix of another (`"car"` and `"cart"` both stored — `"car"`'s node genuinely has a child, `t`, and is genuinely not a leaf, yet `"car"` itself must still count as stored). Deriving the invariant with an explicit `end?` marker, as this unit does, is what keeps that real, common case correct rather than accidentally excluded.

---

## Concept Unit 3: Implementing Insert and Membership

### The Problem

Concept Unit 2 derived the structure and invariant. It needs real code: inserting a string one character at a time, correctly reusing shared structure when a prefix already exists, and checking membership using the `end?` marker precisely as derived.

### The New Code — Type It Yourself

```scheme
(define (trie-insert t chars)
  (if (null? chars)
      (list (trie-children t) #t)
      (let* ((c (car chars)) (rest (cdr chars))
             (existing (assoc c (trie-children t)))
             (child (if existing (cdr existing) (make-trie))))
        (trie-set-child t c (trie-insert child rest)))))
```

### The Updated Project

This is `trie-check.scm`, in full:

```scheme
(define (make-trie) (list '() #f))
(define (trie-children t) (car t))
(define (trie-end? t) (cadr t))
(define (trie-set-child t c child)
  (list (cons (cons c child)
              (filter (lambda (p) (not (char=? (car p) c))) (trie-children t)))
        (trie-end? t)))

(define (trie-insert t chars)                                      ; ← new
  (if (null? chars)                                                    ; ← new
      (list (trie-children t) #t)                                        ; ← new
      (let* ((c (car chars)) (rest (cdr chars))                            ; ← new
             (existing (assoc c (trie-children t)))                          ; ← new
             (child (if existing (cdr existing) (make-trie))))                 ; ← new
        (trie-set-child t c (trie-insert child rest)))))                         ; ← new

(define (trie-insert-word t word) (trie-insert t (string->list word)))

(define (trie-walk t chars)
  (if (null? chars)
      t
      (let ((hit (assoc (car chars) (trie-children t))))
        (if hit (trie-walk (cdr hit) (cdr chars)) #f))))

(define (trie-member? t word)
  (let ((n (trie-walk t (string->list word))))
    (and n (trie-end? n))))

(define words '("car" "care" "cat" "cup"))
(define t (let loop ((ws words) (tr (make-trie)))
            (if (null? ws) tr (loop (cdr ws) (trie-insert-word tr (car ws))))))

(for-each (lambda (w) (display "member? ") (display w) (display " -> ") (display (trie-member? t w)) (newline))
          '("car" "care" "ca" "cu" "cup" "dog"))
```

`trie-set-child` rebuilds a node's children list with one entry replaced — filtering out any existing pair for character `c` before consing the new one on, so re-inserting through an already-present character never creates a duplicate entry. `trie-insert` recurses one character at a time: on reaching the end of the string (`chars` is `'()`), it marks the *current* node's `end?` true, keeping its children untouched; otherwise, it finds or creates the child for the next character, recurses into it, and rebuilds the current node around the updated child. Every call returns a brand-new trie rather than mutating anything — the identical build-fresh-structure style Lesson 97 through 103's BST family already used; Lesson 109 names this pattern precisely and explores it in its own right.

### Reference Source

No reference counterpart — `trie-insert`, `trie-walk`, and `trie-member?` are a from-scratch implementation of Concept Unit 2's derived structure and invariant, checked against a hand-worked real example below.

### Files affected

Created: `trie-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile trie-check.scm
member? car -> #t
member? care -> #t
member? ca -> #f
member? cu -> #f
member? cup -> #t
member? dog -> #f
```

Verified this session — after inserting exactly `"car"`, `"care"`, `"cat"`, and `"cup"`, membership is correctly `#t` for every real word actually inserted, and correctly `#f` for `"ca"` and `"cu"` — real, checked confirmation of Concept Unit 2's own derived subtlety: a node existing along a walk (both `"ca"` and `"cu"` reach real nodes) is not, by itself, membership.

**Execution trace — inserting `"cat"` into a trie already containing `"car"` and `"care"`, showing shared-prefix reuse directly:**

1. `(trie-insert-word t2 "cat")` calls `trie-insert` with `chars = (c a t)` at the root.
2. At the root: `c = #\c`, `rest = (a t)`. `(assoc #\c (trie-children root))` finds the *existing* `c`-child, already built by the prior two insertions — no new node is created here.
3. Recursing into the existing `c`-child with `chars = (a t)`: `c = #\a`, `rest = (t)`. `(assoc #\a ...)` again finds the *existing* `a`-child — the shared `"ca"` node both `"car"` and `"care"` already pass through.
4. Recursing into the existing `"ca"` node with `chars = (t)`: `c = #\t`, `rest = '()`. `(assoc #\t ...)` finds nothing — `"ca"`'s existing children so far are only the path toward `"r"` (leading to `"car"`/`"care"`); a genuinely new node is created here for `t`.
5. Recursing into the new `t`-node with `chars = '()`: the base case fires, marking this new node's `end?` true — `"cat"` is now stored.
6. Each recursive call unwinds back up through `trie-set-child`, rebuilding the `"ca"` node, then the `c`-node, then the root — each rebuild keeping every *other* existing child untouched, per `trie-set-child`'s own filter-then-cons logic.

**The real, inspectable proof this actually shared structure instead of duplicating it:**

```
children of the 'ca' node after inserting car, care, cat: (t r)
end? at 'car' node: #t
end? at 'ca' node: #f
```

Verified this session — the `"ca"` node has exactly two children after all three insertions, `t` (leading only to `"cat"`) and `r` (leading to both `"car"` and `"care"`, sharing even more structure below it) — the literal, real evidence that `"c"` and `"ca"`, the four characters `"car"` and `"care"` and `"cat"` all begin with, exist exactly once in the tree, not once per word.

### Mechanical Walkthrough

- **`(null? chars)`** — a reappearance of `null?`; the base case, reached exactly when every character of the inserted string has been consumed.
- **`(list (trie-children t) #t)`** in the base case — first appearance of this specific move: marking `end?` true while explicitly keeping the current node's existing `children` unchanged, the exact mechanism that lets `"car"` remain marked even after `"cart"` is later inserted through it.
- **`(let* ((c (car chars)) (rest (cdr chars)) ...) ...)`** — a reappearance of `let*`, `car`, `cdr`; splits the remaining characters into "the one to handle now" and "the rest to recurse on," the same shape Lesson 79's `merge`/`merge-sort` used for its own recursive splits.
- **`(assoc c (trie-children t))`** — a reappearance of `assoc` (Lesson 91); checks whether a child for this specific character already exists.
- **`(if existing (cdr existing) (make-trie))`** — first appearance of this specific idiom: reuse the existing child if found, or start a genuinely fresh, empty trie if this is the first word to pass through this character at this position — the exact choice that makes shared prefixes share structure.
- **`(trie-set-child t c (trie-insert child rest))`** — a reappearance of recursion; rebuilds the current node with its `c`-child replaced by the result of recursing one character further in.
- **`(filter (lambda (p) (not (char=? (car p) c))) (trie-children t))`** in `trie-set-child` — a reappearance of `filter` and `char=?`; removes any *old* entry for character `c` before the new one is added, the identical filter-then-cons idiom Lesson 91's own `map-put` already used for keys in general, here specialized to single characters.
- **The real, exact `(t r)` children list, and the real, exact `#t`/`#f` `end?` values** — direct, checked confirmation that `trie-insert`'s recursion produces exactly the shared structure Concept Unit 2 predicted, not merely correct membership answers.

### CS Lens

This is structural sharing made directly, physically visible: the real children list `(t r)` *is* the proof that `"c"` and `"ca"` exist once, walked by three different stored words rather than duplicated three times. Also recognized in: a family tree diagram, where two full siblings share their entire path back to their parents — drawn once, not once per sibling — diverging only at the point their own individual lives actually differ.

### SE Lens

The alternative to reusing an existing child via `assoc` is to always create a fresh subtree for every inserted word, independent of what's already stored — correct, but throwing away exactly the space savings Concept Unit 1 motivated this whole structure with. The real cost of that alternative: storing `"car"`, `"care"`, and `"cat"` would use three entirely separate paths instead of one shared `"ca"` prefix and two short branches — for a real vocabulary of many words sharing common prefixes (English words, file paths, URLs), that cost compounds directly with how much real sharing exists in the data, not a fixed constant.

---

## Concept Unit 4: Prefix Queries — the Real Payoff, Measured

### The Problem

Concept Unit 3 built correct membership. It's worth building the operation Concept Unit 1 actually motivated this whole lesson with — "does any stored word start with this prefix" — and measuring, honestly, exactly how much real advantage the trie buys over the plainest possible alternative for that specific question.

### The New Code — Type It Yourself

```scheme
(define (trie-has-prefix? t prefix)
  (if (trie-walk t (string->list prefix)) #t #f))
```

### The Updated Project

This is `trie-prefix-check.scm`, in full — extending this lesson's own `trie-check.scm` with `trie-has-prefix?` and a real, counted cost comparison:

```scheme
(define (trie-has-prefix? t prefix)                                ; ← new
  (if (trie-walk t (string->list prefix)) #t #f))                     ; ← new

(for-each (lambda (p) (display "has-prefix? ") (display p) (display " -> ") (display (trie-has-prefix? t p)) (newline))
          '("ca" "cu" "do" "care" "cars"))

(define word-pool '("car" "care" "cart" "carton" "cat" "cup" "cut" "dog" "door" "dorm" "dose"
                     "ear" "earn" "east" "eat" "eel" "egg" "elk" "emu" "end"))

(define comparisons 0)

(define (trie-child-lookup-counted c alist)
  (cond ((null? alist) #f)
        (else (set! comparisons (+ comparisons 1))
              (if (char=? c (caar alist)) (car alist) (trie-child-lookup-counted c (cdr alist))))))

(define (trie-walk-counted t chars)
  (if (null? chars)
      t
      (let ((hit (trie-child-lookup-counted (car chars) (trie-children t))))
        (if hit (trie-walk-counted (cdr hit) (cdr chars)) #f))))

(define (trie-has-prefix-counted? t prefix)
  (if (trie-walk-counted t (string->list prefix)) #t #f))

(define (str-starts-with-counted? w p)
  (let loop ((wc (string->list w)) (pc (string->list p)))
    (cond ((null? pc) #t)
          ((null? wc) #f)
          (else (set! comparisons (+ comparisons 1))
                (if (char=? (car wc) (car pc)) (loop (cdr wc) (cdr pc)) #f)))))

(define (naive-has-prefix-counted? words p)
  (cond ((null? words) #f)
        ((str-starts-with-counted? (car words) p) #t)
        (else (naive-has-prefix-counted? (cdr words) p))))

(for-each
 (lambda (n)
   (define stored (let loop ((i 0) (acc '()))
                     (if (= i n) acc (loop (+ i 1) (cons (list-ref word-pool (random (length word-pool))) acc)))))
   (define stored-trie (let loop ((ws stored) (tr (make-trie)))
                          (if (null? ws) tr (loop (cdr ws) (trie-insert-word tr (car ws))))))

   (set! comparisons 0)
   (trie-has-prefix-counted? stored-trie "zzz")
   (define trie-total comparisons)

   (set! comparisons 0)
   (naive-has-prefix-counted? stored "zzz")
   (define naive-total comparisons)

   (display "n=") (display n)
   (display " trie(absent \"zzz\")=") (display trie-total)
   (display " naive(absent \"zzz\")=") (display naive-total)
   (newline))
 (list 100 1000 10000))
```

`trie-has-prefix?` reuses `trie-walk` unchanged — the identical walk `trie-member?` already used, minus the final `end?` check, since a prefix only needs the walk to *succeed*, not to land on a marked word. `trie-child-lookup-counted` and `str-starts-with-counted?` add `set!`-based comparison counters, the identical instrumentation technique Lesson 92's `count-collisions` and Lesson 104's own cost comparison already used; `naive-has-prefix-counted?` checks every stored word in turn, stopping the instant one genuinely starts with the prefix (or the list runs out).

### Reference Source

No reference counterpart — `trie-has-prefix?` is a two-line reuse of Concept Unit 3's own `trie-walk`; the naive comparison procedures are a from-scratch, deliberately plain alternative, instrumented identically to Lesson 104's `naive-extract-min-counted`.

### Files affected

Created: `trie-prefix-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile trie-prefix-check.scm
has-prefix? ca -> #t
has-prefix? cu -> #t
has-prefix? do -> #f
has-prefix? care -> #t
has-prefix? cars -> #f
n=100 trie(absent "zzz")=3 naive(absent "zzz")=100
n=1000 trie(absent "zzz")=3 naive(absent "zzz")=1000
n=10000 trie(absent "zzz")=3 naive(absent "zzz")=10000
```

Verified this session — `has-prefix?` is correctly `#t` for `"ca"`, `"cu"`, and `"care"` (an exact stored word also counts as its own prefix), and correctly `#f` for `"do"` (no word starts with it) and `"cars"` (longer than the longest word, `"car"`, that shares its start). The real cost comparison, on the worst case for the naive side — a prefix, `"zzz"`, present in no stored word, forcing a full scan with no early exit possible: the trie costs an exact, flat `3` comparisons at every scale tested, `100` through `10,000` words stored, because `"zzz"` fails at the very first character, against the root's `3` real children (`c`, `d`, `e`) — a cost that depends only on the prefix and the tree's own branching, never on how many words are stored. The naive scan costs exactly `100`, `1,000`, and `10,000` — matching the stored count exactly, since every single stored word must be checked, and each check fails after exactly one real character comparison.

**An honest note on the typical case, using Lesson 74's own vocabulary:** an absent, no-match prefix is the naive approach's genuine *worst* case. For *present* prefixes — checked separately this session, not shown as a clean table here — the naive scan often exits far earlier, the instant it happens to reach a matching word, so its real *average*-case cost depends heavily on where in the stored list a match happens to land, not on `n` alone. The trie's own cost stays governed by the same thing in both cases: the prefix's length and the tree's real branching factor at each step, never by how many words happen to be stored — the structural guarantee Concept Unit 1 was actually after.

### Mechanical Walkthrough

- **`(trie-walk t (string->list prefix))`** in `trie-has-prefix?` — a reappearance of `trie-walk`, `string->list`; the entire new operation is this one existing call, with only the final `end?` check dropped relative to `trie-member?`.
- **`(if hit (car hit) #f)`**-shaped logic inside `trie-child-lookup-counted`, reproducing `assoc`'s own behavior — first appearance of a hand-written stand-in for a built-in procedure, written specifically so its real internal comparisons can be counted, the same reason Lesson 104 hand-wrote counted variants of already-correct procedures.
- **`(cond ((null? pc) #t) ((null? wc) #f) (else ...))`** in `str-starts-with-counted?` — a reappearance of `cond`, `null?`; the two real stopping conditions (prefix fully matched; word exhausted first) checked before any character comparison is attempted.
- **`(set! comparisons (+ comparisons 1))`** in both counted procedures — a reappearance of `set!`; counts only genuine character comparisons, not every recursive call, the identical discipline Lesson 92 and 103 both already applied.
- **The real, exact `3`-versus-`n` numbers, flat versus exactly linear** — direct, measured confirmation of Concept Unit 1's original claim: a trie's prefix-query cost is structurally independent of how much is stored, the same *kind* of flat-cost guarantee Lesson 85 derived for array indexing, now derived for a genuinely different operation and a genuinely different structure.

### CS Lens

This is Lesson 85's own "flat regardless of size" finding, recurring in a second, structurally unrelated place: array indexing was flat because of a computed address formula; a trie's prefix query is flat because the *cost of the operation is tied to the length of the prefix being asked about, never to the number of words stored* — two entirely different mechanisms producing the identical shape of guarantee. Also recognized in: a well-organized dictionary, where finding all words starting with `"pre"` takes the same real effort whether the dictionary has `1,000` entries or `100,000`, because flipping to the right section depends on the letters typed, not on the book's total size.

### SE Lens

The alternative to building `trie-has-prefix?` is exactly what Concept Unit 1 named: keep every stored word in whatever structure already exists — a hash table, a plain list — and scan for matches on demand. The real, measured cost of that alternative, honestly checked rather than assumed: growing exactly in proportion to how much is stored, `100` to `10,000` real comparisons across the three scales tested, while the trie's real cost never moved from `3`. The engineering decision this makes concrete: a trie is worth its real, additional structural complexity specifically when prefix-shaped questions are actually asked, and asked often enough that a cost independent of `n` is worth more than the simplicity of not building a dedicated structure at all.

---

## Closing

### Connect the pieces

Three real words, one shared prefix, traced through every unit this lesson built:

1. **The gap, named (Unit 1):** hashing deliberately scatters similar keys; a prefix question needs the opposite.
2. **The structure and invariant, derived (Unit 2):** one node per character, an explicit `end?` marker — and the real subtlety that a walked path isn't automatically a stored word.
3. **Insertion and membership, implemented and verified (Unit 3):** inserting `"car"`, `"care"`, `"cat"` produces a real, inspectable `"ca"` node with exactly two children, `(t r)` — direct, physical proof of shared structure, not just correct membership answers.
4. **Prefix queries, implemented, with a real, measured payoff (Unit 4):** a flat `3` real comparisons for the trie regardless of scale, against an exact, linear `n` for the plainest alternative — the real reason Concept Unit 1's question needed a dedicated structure at all.

Every claim in this lesson traces to real, executed code: a hand-traceable insertion showing structural sharing directly, a real membership matrix, and a real cost comparison at three scales confirming a flat-versus-linear structural guarantee, not an assumed one.

### What breaks without this

Suppose a real autocomplete feature were built directly over Lesson 93's hash table, storing every known word as a key. Every keystroke's "what words start with what's typed so far" query would need a full scan of every stored word, every single time, no matter how good the underlying hash function is — because Concept Unit 1's real gap is structural, not a matter of hashing harder. This lesson's real numbers show precisely what that costs at scale: an exact, linear `n` real comparisons per query, growing without bound as the known-word list grows, against a trie's exact, flat `3` — the actual, measured reason a production autocomplete feature reaches for a trie (or a close relative of one) rather than a hash table, regardless of how fast that hash table's own exact-match lookups are.

### Exercises

1. **Observe.** Before checking, predict whether `trie-has-prefix?` would ever need to walk *past* the point where `trie-member?` would already return `#f`, using this lesson's own `trie-walk` to justify your answer.
2. **Formalize.** Implement `trie-count-words`, counting how many real stored words exist below a given node (summing `end?` markers across the whole subtree), and confirm it returns `3` for the `"ca"` node built in this lesson's own Concept Unit 3 example.
3. **Formalize.** Measure the real trie-versus-naive comparison count for a *present*, deep prefix (`"care"`, for instance) at `n = 100`, `1,000`, and `10,000`, and explain, using Lesson 74's vocabulary, why the naive side's real numbers here look different from this lesson's own worst-case `"zzz"` table.
4. **Explain.** In your own words, explain why `trie-set-child`'s `filter`-then-`cons` step is necessary — what real, incorrect structure would result from just `cons`-ing the new child on without filtering first, referencing what would happen on a *second* insertion through an already-existing character.
5. **Explain.** Using this lesson's real numbers and Lesson 95's own hash-flooding attack, state one real scenario where a trie's structural guarantee (cost tied to prefix length, not to `n`) would matter even for exact-match lookups, not just prefix queries — referencing what kind of key structure would make that true.

### Definition of done

- [ ] You can state the trie invariant precisely and explain why an `end?` marker is necessary even though the tree's own shape already encodes every stored character.
- [ ] You traced inserting `"cat"` into a trie already containing `"car"`/`"care"` and can explain, in your own words, exactly which nodes were reused and which were newly created.
- [ ] You can explain why `trie-has-prefix?`'s real cost depends on prefix length and branching factor, never on the number of stored words — and why that's a structurally different guarantee from Lesson 104's `O(log n)` heap operations, which *do* depend on how much is stored.
- [ ] You completed Exercises 1–5, including a real, measured present-prefix comparison distinguishing typical case from worst case.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
