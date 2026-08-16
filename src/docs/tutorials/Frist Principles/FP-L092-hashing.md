# Lesson 92: Hashing

**What you will build:** a real **hash function**, mapping arbitrary string keys to array positions, and a direct, real demonstration that **collisions** — two different keys landing on the identical position — aren't a bug to be engineered away, but a mathematical certainty Lesson 62's Pigeonhole Principle already proved. Real, verified evidence this session: hashing ten real fruit names into a `10`-position table produces `3` real collisions (`apple`/`fig` both land on position `0`; `grape`/`honeydew` both on `7`; `banana`/`lemon` both on `9`); hashing `15` keys into the identical `10` positions produces at least `5` collisions, exactly matching what Pigeonhole guarantees (`15 - 10 = 5`) as an unavoidable minimum, not a coincidence. The transferable point: Lesson 91 ended by naming a real cost problem — `Set`/`Map` membership checks costing `Θ(n)` over a plain list. Lesson 85 already derived `O(1)` array indexing — but only for small, valid integer positions, and real keys (`"apple"`, a person's name, anything) aren't already that. This lesson derives the function that bridges the two, and confirms, honestly, exactly what that bridge can't avoid.

**What you need to know first:** Lesson 91 (`FP-L091-sets-and-maps.md`) — specifically the real, measured `Θ(n)` cost this lesson's technique exists to eventually fix (in Lesson 93, not here). Lesson 85 (`FP-L085-arrays.md`) — specifically the `O(1)` address formula, available only for valid integer indices. Lesson 62 (`FP-L062-pigeonhole-principle.md`) — specifically the Pigeonhole Principle itself, reused directly to prove collisions are unavoidable, not measured as a surprising accident.

**Terms introduced in this lesson**

- **Hash function** — a function mapping an arbitrary key to an integer, its *hash code*, which is then reduced (typically by `modulo`) to a valid position within a fixed-size array. It exists to make Lesson 85's `O(1)` array indexing usable for keys that aren't already small, valid array indices.
- **Collision** — two distinct keys whose hash function reduces them to the identical array position. It exists as a named, expected phenomenon — not a hash function malfunctioning, but the direct, provable consequence of mapping a larger space of possible keys into a smaller space of positions.

---

## Concept Unit 1: Array Indexing Needs a Bridge

### The Problem

Lesson 85 derived real, `O(1)` array indexing — but strictly for small, non-negative integer positions, computed directly from `base + index × element-size`. Lesson 91's `Set`/`Map` keys are nothing like that: strings, symbols, arbitrary values with no inherent numeric position at all. Using Lesson 85's fast array directly to implement Lesson 91's ADTs needs some way to turn an arbitrary key into a valid array position first.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, connecting Lesson 85's and Lesson 91's already-established real results.

### Applying It — Naming What's Actually Needed

A function is needed that takes any key and produces some integer, plus a way to force that integer into the valid range `0` through `table-size - 1`, regardless of how large or unpredictable the original integer is. Both pieces are needed together: the first converts a key into *some* number; the second guarantees that number fits the array actually being used.

### Walkthrough

- **The explicit connection to Lesson 85 and Lesson 91's own real results** — grounds this lesson's motivation in already-established, real evidence rather than a fresh, disconnected setup.
- **The two-part requirement, named precisely** — key-to-integer, then integer-to-valid-range — previews Concept Unit 2's two-step derivation exactly.

### CS Lens

This is the general problem of mapping one space (arbitrary keys, unbounded and unordered) onto a second, much smaller and structured space (array positions) while still needing to find any given key's mapped position again later, deterministically, without storing every key's position separately. Also recognized in: a coat check assigning each of an unpredictable number of coats to one of a fixed number of numbered hooks, needing a rule (not memorized names) to find any given coat again later.

### SE Lens

The alternative to deriving this mapping precisely is to assume any function that "spreads keys out somehow" is good enough, without checking. The real cost of that alternative, as Concept Unit 4 measures directly, is a real, checkable difference in how well a specific mapping performs — not all such functions are equally good, and knowing why is what Concept Unit 2 and 4 both address.

---

## Concept Unit 2: Deriving a Hash Function

### The Problem

Concept Unit 1's two-part requirement needs real, working code: something producing an integer from an arbitrary string key, and something reducing that integer into a valid array range.

### The New Code — Type It Yourself

```scheme
(define (sum-hash key)
  (apply + (map char->integer (string->list key))))

(define (hash-position key table-size)
  (modulo (sum-hash key) table-size))
```

### The Updated Project

This is `hash-check.scm`, in full:

```scheme
(define (sum-hash key)                                         ; ← new
  (apply + (map char->integer (string->list key))))               ; ← new

(define (hash-position key table-size)                             ; ← new
  (modulo (sum-hash key) table-size))                                ; ← new

(define keys (list "apple" "banana" "cherry" "date" "elderberry"
                    "fig" "grape" "honeydew" "kiwi" "lemon"))

(define table-size 10)
(for-each
 (lambda (k)
   (display k) (display " -> hash=") (display (sum-hash k))
   (display " position=") (display (hash-position k table-size))
   (newline))
 keys)
```

`sum-hash` implements Concept Unit 1's first requirement: `string->list` turns the key into its individual characters, `char->integer` converts each to its real, standard numeric code, and summing them produces one integer from the whole key. `hash-position` implements the second requirement: `modulo` forces that integer into the range `0` through `table-size - 1`, regardless of how large `sum-hash`'s own result happens to be.

### Reference Source

No reference counterpart — a from-scratch, deliberately simple hash function, built to demonstrate the two-part mapping directly rather than to be a production-quality choice.

### Files affected

Created: `hash-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile hash-check.scm
apple -> hash=530 position=0
banana -> hash=609 position=9
cherry -> hash=653 position=3
date -> hash=414 position=4
elderberry -> hash=1072 position=2
fig -> hash=310 position=0
grape -> hash=527 position=7
honeydew -> hash=867 position=7
kiwi -> hash=436 position=6
lemon -> hash=539 position=9
```

Verified this session — every one of ten real fruit names produces both a real hash code and a real position in `0`–`9`. **Looking closely at the positions:** `apple` and `fig` both land on `0`; `grape` and `honeydew` both land on `7`; `banana` and `lemon` both land on `9` — three real collisions, visible directly in this output, before Concept Unit 3 names and counts them formally.

### Mechanical Walkthrough

- **`(string->list key)`** — first appearance: a real Scheme procedure converting a string into a list of its individual characters, letting the rest of the procedure use already-established list operations.
- **`(char->integer c)`** — first appearance: a real Scheme procedure returning a character's standard numeric code (its Unicode code point).
- **`(apply + (map char->integer ...))`** — a reappearance of `apply` (Lesson 58), `map`, `+`; sums every character's code into one total.
- **`(modulo (sum-hash key) table-size)`** — a reappearance of `modulo`; forces `sum-hash`'s potentially large result into the valid `0` through `table-size - 1` range, regardless of the key's length or content.
- **The real, visible collisions already in this output** — direct, checked confirmation that Concept Unit 1's concern wasn't hypothetical.

### CS Lens

This is a hash function functioning exactly as designed: a real, deterministic mapping from an unbounded space of possible strings onto a small, fixed range of integers, computed the identical way every time the same key is hashed again. Also recognized in: a library's Dewey Decimal system mapping an unbounded space of possible book topics onto a fixed range of shelf-organizing numbers, deterministically, so the same topic always maps to the same number.

### SE Lens

The alternative to deriving the two-part mapping explicitly is to assume Guile's own built-in hashing (used internally by its own hash table types) is simply "magic," without ever seeing the mechanism. The real cost of that alternative is exactly Lesson 85's own concern about `vector-ref`: an unexplained fast operation can't be checked for whether it still applies to an unfamiliar situation. Deriving and running the real mechanism, as this unit does, is what makes Concept Unit 3's collision analysis meaningful rather than assumed.

---

## Concept Unit 3: Collisions Are Guaranteed, Not Just Observed

### The Problem

Concept Unit 2's real output already showed three collisions. It's worth confirming this isn't specific to this lesson's particular hash function or these particular ten keys, but a mathematical certainty once enough keys are hashed into a fixed-size table — exactly what Lesson 62's Pigeonhole Principle already proved, in a different context.

### The New Code — Type It Yourself

```scheme
(define (count-collisions keys table-size hash-fn)
  (let ((positions (make-vector table-size 0)))
    (for-each (lambda (k) (let ((p (hash-fn k table-size)))
                            (vector-set! positions p (+ 1 (vector-ref positions p)))))
              keys)
    (apply + (map (lambda (count) (if (> count 1) (- count 1) 0)) (vector->list positions)))))
```

### The Updated Project

This is `collision-check.scm`, in full:

```scheme
(define (sum-hash key)
  (apply + (map char->integer (string->list key))))

(define (hash-position key table-size)
  (modulo (sum-hash key) table-size))

(define (count-collisions keys table-size hash-fn)              ; ← new
  (let ((positions (make-vector table-size 0)))                    ; ← new
    (for-each (lambda (k) (let ((p (hash-fn k table-size)))            ; ← new
                            (vector-set! positions p                     ; ← new
                                         (+ 1 (vector-ref positions p)))))  ; ← new
              keys)                                                          ; ← new
    (apply + (map (lambda (count) (if (> count 1) (- count 1) 0))              ; ← new
                  (vector->list positions)))))                                    ; ← new

(define keys (list "apple" "banana" "cherry" "date" "elderberry"
                    "fig" "grape" "honeydew" "kiwi" "lemon"))

(display "total collisions (10 keys, table-size=10): ")
(display (count-collisions keys 10 hash-position))
(newline)

(define many-keys (map number->string (iota 15)))
(display "total collisions (15 keys, table-size=10): ")
(display (count-collisions many-keys 10 hash-position))
(display " -- Pigeonhole guarantees at least ") (display (- 15 10))
(newline)
```

`count-collisions` counts every *extra* key landing on an already-occupied position — a position hit by `3` keys contributes `2` to the total, not `3`, since exactly one key "belongs" there without colliding.

### Reference Source

Lesson 62's Pigeonhole Principle (`FP-L062-pigeonhole-principle.md`), applied directly: with `n` keys and `k` positions, `n > k` forces at least `n - k` collisions, the identical reasoning Lesson 62 used to prove collisions must occur when more items exist than available categories.

### Files affected

Created: `collision-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile collision-check.scm
total collisions (10 keys, table-size=10): 3
total collisions (15 keys, table-size=10): 5 -- Pigeonhole guarantees at least 5
```

Verified this session — `10` keys into `10` positions produced `3` real collisions (more than Pigeonhole's own bare minimum of `0`, since Pigeonhole only *guarantees* a floor, not an exact count); `15` keys into `10` positions produced *exactly* `5` — matching Pigeonhole's guaranteed minimum (`15 - 10 = 5`) precisely, confirming this specific hash function did no *better* than the mathematical floor at this particular size, though it could have.

### Mechanical Walkthrough

- **`(make-vector table-size 0)`** — a reappearance of `make-vector` (Lesson 55); tracks how many keys land on each position, starting all at `0`.
- **`(vector-set! positions p (+ 1 (vector-ref positions p)))`** — a reappearance of `vector-set!`, `vector-ref`; increments the count for whichever position a key hashes to.
- **`(if (> count 1) (- count 1) 0)`** — a reappearance of `if`, `>`, `-`; converts each position's raw count into its *collision* contribution — `0` if at most one key landed there, `count - 1` otherwise.
- **The real, exact match to Pigeonhole's `15 - 10 = 5` floor** — direct, checked confirmation that Lesson 62's already-proven principle applies identically here, not merely by analogy.

### CS Lens

This is Lesson 62's Pigeonhole Principle reappearing in a genuinely new context: proved once, abstractly, about placing items into categories, it applies with zero modification to hashing keys into table positions, because hashing *is* exactly that same abstract pattern, concretely instantiated. Also recognized in: the identical principle guaranteeing that any city with more residents than possible distinct hair-counts-per-head must have two residents with the exact same hair count — an entirely different domain, the identical guaranteed-collision reasoning.

### SE Lens

The alternative to connecting collisions to Pigeonhole explicitly is to treat each observed collision as a specific flaw in this lesson's particular hash function, to be engineered away entirely. The real cost of that alternative is chasing an impossible goal — Pigeonhole proves *some* collisions are unavoidable once keys outnumber positions, regardless of which hash function is used. Naming this precisely, as this unit does, is what correctly redirects the real engineering question toward Lesson 93's actual job: handling collisions gracefully, not eliminating them.

---

## Concept Unit 4: Not All Hash Functions Are Equally Good

### The Problem

Concept Unit 3 showed collisions are unavoidable *in general*. It's worth checking, honestly, whether a hash function can still do meaningfully better or worse than another, within what Pigeonhole allows.

### No isolated lab for this step

This concept has no code of its own to isolate — the comparison reuses Concept Unit 3's own `count-collisions`, applied to a second, deliberately simpler hash function.

### Applying It — A Deliberately Weaker Hash Function, Compared Directly

```scheme
(define (length-hash key table-size)
  (modulo (string-length key) table-size))
```

Running `count-collisions` (Concept Unit 3) against this lesson's original ten fruit names, once with `hash-position` and once with `length-hash`:

```
$ guile length-hash-check.scm
total collisions (sum-hash, table-size=10): 3
total collisions (length-hash, table-size=10): 4
```

**Naming why, directly:** `length-hash` only uses a key's *length*, throwing away everything else about its content. Real fruit names cluster heavily by length — `apple`, `grape`, and `lemon` are all `5` characters; `banana` and `cherry` are both `6` — so `length-hash` maps several genuinely different keys to the identical position for a reason that has nothing to do with spreading keys out, only with a coincidence of English fruit-name lengths. `sum-hash`, using every character, is far less likely to have two unrelated keys share a sum purely by coincidence, even though it's still simple enough to collide sometimes.

### Walkthrough

- **`length-hash`, shown as real, runnable code** — makes "a worse hash function" a concrete, comparable artifact, not an abstract warning.
- **The real, worse collision count (`4` versus `3`)** — direct, measured evidence that hash function quality is a real, checkable property, not a matter of taste.
- **The named reason — throwing away information the key actually carries** — generalizes beyond this one example to a real design principle for any hash function.

### CS Lens

This is the real, practical concern underneath "use a good hash function": Concept Unit 3 already proved some collisions are mathematically unavoidable, but *how many more than the guaranteed minimum* actually occur depends entirely on how well a specific function uses the real information a key carries — `length-hash`'s real, worse performance here demonstrates that gap concretely. Also recognized in: two different methods of shuffling a deck of cards, both producing *some* random-looking order, but one genuinely spreading cards more evenly than the other, checkable by real, repeated measurement rather than by appearance alone.

### SE Lens

The alternative to comparing hash functions directly is to pick one that seems reasonable and never check whether a different one would perform meaningfully better. The real cost of that alternative, at real scale, is systematically worse collision rates than necessary — not a catastrophic failure, but a real, measurable inefficiency compounding across however many keys a real system actually stores. Checking directly, as this unit does, is what turns "seems reasonable" into "measured and compared."

---

## Closing

### Connect the pieces

One bridge between arbitrary keys and array positions, proven to leak in a specific, unavoidable way, and shown to leak by different amounts depending on the bridge's own design:

1. **The bridge needed, named (Unit 1):** arbitrary keys need converting into valid array positions before Lesson 85's `O(1)` indexing becomes usable for them.
2. **The mapping, derived (Unit 2):** key-to-integer, then integer-to-valid-range via `modulo` — real code, real positions, real collisions already visible.
3. **Collisions, proven unavoidable (Unit 3):** Lesson 62's Pigeonhole Principle, reapplied with zero modification, predicting the exact real minimum this lesson's own code then matched.
4. **Not all hash functions are equal (Unit 4):** a deliberately information-poor hash function measurably collides more than one using a key's full content.

Every claim in this lesson traces to real, checked code: a real hash function, real observed and counted collisions, an exact match to an independently-derived mathematical floor, and a real, measured comparison between two different design choices.

### What breaks without this

Suppose an engineer, building a fast lookup structure using Lesson 85's array as a foundation, encountered a real collision during testing and treated it as a bug to be eliminated entirely, spending real effort trying to find a "perfect" hash function with zero collisions for a real, growing set of keys. Lesson 62's Pigeonhole Principle, reapplied directly in Concept Unit 3, proves that effort is fundamentally misdirected the moment the number of possible keys exceeds the table's size — no hash function, however clever, can avoid it. Understanding this in advance, as this lesson derives it, is what correctly redirects real engineering effort toward handling collisions well (Lesson 93) instead of chasing an impossible elimination.

### Exercises

1. **Observe.** Before checking, predict whether `sum-hash` would produce the identical collision count on a *different* set of ten real English words, not fruit names, using this lesson's own reasoning about what makes `length-hash` specifically weak.
2. **Formalize.** Choose ten real words of your own and confirm or correct your Exercise 1 prediction with real, measured collision counts.
3. **Formalize.** Design a third hash function, using a different technique from both `sum-hash` and `length-hash` (for example, weighting each character's position, not just summing plain codes), and measure whether it produces fewer real collisions than `sum-hash` on this lesson's ten fruit names.
4. **Explain.** Using Lesson 62's Pigeonhole Principle precisely, state the guaranteed minimum number of collisions for `1,000` keys hashed into a `100`-position table, and explain why no hash function, however well designed, could do better than that minimum.
5. **Explain.** In your own words, explain why `sum-hash` would produce the *identical* hash code for `"eat"` and `"tea"` (anagrams of each other), and what this reveals about a real limitation of summing character codes specifically, beyond the collisions Pigeonhole already predicts.

### Definition of done

- [ ] You can state what a hash function needs to do, in two parts, and why both parts are necessary.
- [ ] You can state the Pigeonhole Principle's guarantee about hashing precisely: `n` keys into `k` positions forces at least `n - k` collisions when `n > k`.
- [ ] You can explain, using real measured evidence, why one hash function can perform meaningfully worse than another even though neither can eliminate collisions entirely.
- [ ] You identified a real weakness in `sum-hash` itself (Exercise 5) beyond what Pigeonhole already predicts.
- [ ] You completed Exercises 1–5, including designing and measuring at least one hash function not shown in this lesson's own code.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the hash function you designed and its real, measured collision count.
