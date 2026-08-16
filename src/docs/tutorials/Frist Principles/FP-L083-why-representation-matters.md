# Lesson 83: Why Representation Matters

**What you will build:** a real, measured demonstration that the identical logical operation — "get the element at this position," or "add one element to the front" — costs dramatically different real amounts depending purely on *how* a sequence of values is laid out in memory, not on what values it holds. Real evidence this session: accessing the middle element of a `1,000,000`-item collection takes `1.085` ms as a list, walking one cell at a time, versus `0.001` ms as a vector, jumping directly there — over `1,000` times slower for the identical logical request. Adding one element to the *front* reverses the picture completely: `0.0` ms for the list (`cons`), `7.847` ms for the vector, which must be entirely rebuilt to make room. The transferable point: this curriculum has used both lists (since Lesson 12) and vectors (since Lesson 55) without ever directly asking *why* — this lesson shows the two aren't interchangeable conveniences, but genuinely different **representations**, each making a specific operation cheap by making its opposite expensive.

**What you need to know first:** Lesson 12 (`FP-L012-lists.md`) — specifically how a list is built from linked `cons` cells, reused directly here. Lesson 55 (`FP-L055-dynamic-programming-emerges.md`) — specifically `make-vector`, `vector-ref`, `vector-set!`, and contiguous, indexed storage. Lesson 56 (`FP-L056-why-counting-matters.md`) — specifically counting predicting real runtime, confirmed again here for two structures instead of one algorithm.

**Terms introduced in this lesson**

- **Representation** — the specific, concrete way a collection of values is actually arranged and connected — contiguous, indexed positions for a vector; a chain of individually linked cells for a list — as distinct from the abstract idea of "a sequence of values," which says nothing about how it's actually stored. It exists because two representations can hold the identical values and support the identical logical operations while costing entirely different real amounts of work for those operations.

---

## Concept Unit 1: Two Representations, Used Without Asking Why

### The Problem

This curriculum has built with lists since Lesson 12 and with vectors since Lesson 55, choosing between them lesson to lesson without ever pausing to ask *why* one was used instead of the other — `table-fib` (Lesson 55) and `binary-search` (Lesson 68) both specifically needed vectors, while nearly everything else used lists, and the reason was never stated directly. It's worth asking now: is one representation simply better, or does the right choice depend entirely on what operation matters most?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using choices this curriculum has already made without explaining them.

### Applying It — Two Representations, Precisely

**A list**, since Lesson 12, is a chain of `cons` cells: each cell holds one value and a reference to the next cell, or to `'()` at the end. Reaching the fifth element means following four references, one at a time, starting from the first.

**A vector**, since Lesson 55, is a single block of contiguous, indexed memory: reaching the fifth element means computing its position directly and reading it in one step, with no need to pass through the first four at all.

### Walkthrough

- **The two already-familiar constructs, restated precisely as *representations*** — reframes two things this curriculum has used casually since Lesson 12 and 55 as a deliberate, comparable design choice for the first time.
- **"reaching the fifth element"** — a single, concrete operation, stated identically for both, setting up a fair, direct comparison in Concept Unit 2.

### CS Lens

This is the foundational idea Era IV exists to explore: a *representation* is a real, concrete commitment about how data sits in memory, and that commitment has real consequences for cost, entirely separate from what values are actually being stored. Also recognized in: a library that shelves books in a single, continuously numbered sequence (find any book by computing its shelf position directly) versus one that shelves books as a chain of "this book, then go find the next one" cards (find any book only by starting at the first card and following the chain).

### SE Lens

The alternative to asking this question is to keep choosing between lists and vectors by habit or convenience, the way this curriculum has done implicitly since Lesson 55. The real cost of that alternative is exactly what Concept Unit 2 and 3 measure directly: an uninformed choice can cost three orders of magnitude in real time, for an operation that looks identical from the outside. Asking the question deliberately, as this lesson does, is what turns representation choice into an engineering decision instead of a habit.

---

## Concept Unit 2: Real Evidence — Indexed Access

### The Problem

Concept Unit 1's two representations need a real, measured comparison on one concrete operation: reaching an element in the middle of a large collection.

### The New Code — Type It Yourself

```scheme
(define (time-it label thunk)
  (let ((start (get-internal-real-time)))
    (thunk)
    (let ((end (get-internal-real-time)))
      (display label)
      (display ": ")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms")
      (newline))))
```

### The Updated Project

This is `representation-check.scm`, in full:

```scheme
(define (time-it label thunk)                                 ; ← new
  (let ((start (get-internal-real-time)))                        ; ← new
    (thunk)                                                        ; ← new
    (let ((end (get-internal-real-time)))                            ; ← new
      (display label)                                                  ; ← new
      (display ": ")                                                    ; ← new
      (display (exact->inexact (/ (* 1000 (- end start))                  ; ← new
                                   internal-time-units-per-second)))         ; ← new
      (display " ms")                                                         ; ← new
      (newline))))                                                              ; ← new

(for-each
 (lambda (n)
   (let ((lst (iota n))
         (vec (list->vector (iota n)))
         (mid (quotient n 2)))
     (time-it (string-append "list-ref middle, n=" (number->string n))
              (lambda () (list-ref lst mid)))
     (time-it (string-append "vector-ref middle, n=" (number->string n))
              (lambda () (vector-ref vec mid)))))
 (list 1000 10000 100000 1000000))
```

### Reference Source

No reference counterpart — `time-it` is a from-scratch measurement helper, and `list-ref`/`vector-ref` are both real, standard Scheme procedures used directly rather than reimplemented.

### Files affected

Created: `representation-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile representation-check.scm
list-ref middle, n=1000: 0.0 ms
vector-ref middle, n=1000: 0.0 ms
list-ref middle, n=10000: 0.005 ms
vector-ref middle, n=10000: 0.0 ms
list-ref middle, n=100000: 0.077 ms
vector-ref middle, n=100000: 0.0 ms
list-ref middle, n=1000000: 1.085 ms
vector-ref middle, n=1000000: 0.001 ms
```

Verified this session — `list-ref`'s real cost climbs steadily as `n` grows, reaching `1.085` ms at `n = 1,000,000`; `vector-ref`'s stays effectively flat, `0.001` ms even at the identical size — over `1,000` times faster for the identical logical request, "give me the middle element." **An honest note on timing specifically:** unlike a comparison *count* (an exact, reproducible integer), wall-clock milliseconds vary slightly run to run with real system load — rerunning this exact script produces numbers in the same range (`list-ref` at `n = 1,000,000` measured between `0.84` and `1.09` ms across several runs this session) but not bit-for-bit identical. The *pattern* — steadily climbing versus effectively flat — is what's being claimed, and that pattern held in every run.

### Mechanical Walkthrough

- **`(get-internal-real-time)`** — a reappearance of Lesson 37's timing procedure; captures the current time before and after the operation being measured.
- **`(string-append "list-ref middle, n=" (number->string n))`** — first appearance of `string-append` and `number->string`: real Scheme procedures joining text together and converting a number into its printable text form, used here only to build a readable label, not part of the actual measurement.
- **`(list-ref lst mid)`** — first appearance: a real Scheme procedure walking a list from its front, one `cdr` at a time, until reaching the requested index — the concrete real cost being measured.
- **`(vector-ref vec mid)`** — a reappearance of `vector-ref` (Lesson 55); computes the requested position directly, with no walking at all.
- **The real, growing-versus-flat timing pattern** — direct, measured confirmation that identical logical requests cost fundamentally different real amounts depending only on representation.

### CS Lens

This is `Θ(n)` versus `Θ(1)` made concretely felt rather than only asserted: a list's indexed access must pass through every earlier cell because nothing about its representation supports jumping ahead, while a vector's contiguous layout makes the position of any index directly computable. Also recognized in: finding a specific page in a book by flipping through from page one (a list's access pattern) versus finding it directly using the page number printed on every page (a vector's access pattern).

### SE Lens

The alternative to measuring this directly is to assume "lists and vectors are both just ways to hold a sequence" and reach for either one without considering how the collection will actually be used. The real cost of that alternative, at real scale, is exactly the `1,000×` gap measured here — a choice that looks harmless on a small test list becomes a genuine performance problem once real data grows large enough, precisely the size-dependent risk this curriculum has cared about since Lesson 68's own `binary-search`-needs-a-vector requirement.

---

## Concept Unit 3: Real Evidence — the Reverse Operation

### The Problem

Concept Unit 2 measured one operation. It's worth checking a *different* operation — adding one element to the very front — to see whether the same representation that won Concept Unit 2's comparison also wins this one, or whether the picture reverses.

### The New Code — Type It Yourself

```scheme
(define (vector-prepend x vec)
  (let* ((n (vector-length vec))
         (new-vec (make-vector (+ n 1))))
    (vector-set! new-vec 0 x)
    (let loop ((i 0))
      (if (= i n)
          new-vec
          (begin (vector-set! new-vec (+ i 1) (vector-ref vec i))
                 (loop (+ i 1)))))))
```

### The Updated Project

This is `prepend-check.scm`, in full:

```scheme
(define (time-it label thunk)
  (let ((start (get-internal-real-time)))
    (thunk)
    (let ((end (get-internal-real-time)))
      (display label)
      (display ": ")
      (display (exact->inexact (/ (* 1000 (- end start)) internal-time-units-per-second)))
      (display " ms")
      (newline))))

(define (vector-prepend x vec)                                ; ← new
  (let* ((n (vector-length vec))                                 ; ← new
         (new-vec (make-vector (+ n 1))))                          ; ← new
    (vector-set! new-vec 0 x)                                        ; ← new
    (let loop ((i 0))                                                  ; ← new
      (if (= i n)                                                        ; ← new
          new-vec                                                         ; ← new
          (begin (vector-set! new-vec (+ i 1) (vector-ref vec i))           ; ← new
                 (loop (+ i 1)))))))                                          ; ← new

(for-each
 (lambda (n)
   (let ((lst (iota n))
         (vec (list->vector (iota n))))
     (time-it (string-append "cons prepend, n=" (number->string n))
              (lambda () (cons -1 lst)))
     (time-it (string-append "vector-prepend, n=" (number->string n))
              (lambda () (vector-prepend -1 vec)))))
 (list 1000 10000 100000 1000000))
```

`vector-prepend` builds an entirely new vector, one element larger, copying every existing element one position over to make room at the front — there is no way to insert at the front of a vector without either shifting every element or building a fresh one.

### Reference Source

No reference counterpart — `vector-prepend` is a from-scratch procedure, built specifically to measure the real cost of an operation vectors have no direct support for.

### Files affected

Created: `prepend-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile prepend-check.scm
cons prepend, n=1000: 0.0 ms
vector-prepend, n=1000: 0.039 ms
cons prepend, n=10000: 0.0 ms
vector-prepend, n=10000: 0.068 ms
cons prepend, n=100000: 0.0 ms
vector-prepend, n=100000: 0.655 ms
cons prepend, n=1000000: 0.0 ms
vector-prepend, n=1000000: 7.847 ms
```

Verified this session — `cons`'s real cost stays at `0.0` ms regardless of `n`, all the way to `1,000,000`, in every run this session, without exception; `vector-prepend`'s climbs steadily, measured between `6.7` and `7.8` ms at `n = 1,000,000` across several runs — the same real timing-variance honesty as Concept Unit 2, with the growing-versus-flat pattern holding every time. This is the *exact reverse* of Concept Unit 2's pattern: the representation that was dramatically cheaper for indexed access (the vector) is now dramatically more expensive for front-insertion, and the representation that was dramatically more expensive for indexed access (the list) is now essentially free.

### Mechanical Walkthrough

- **`(make-vector (+ n 1))`** — a reappearance of `make-vector` (Lesson 55); allocates a new vector one position larger than the original, since a vector's size can't change in place.
- **`(vector-set! new-vec 0 x)`** — a reappearance of `vector-set!`; places the new element at the front of the new vector.
- **`(let loop ((i 0)) ...)`** copying each element — a reappearance of the named-`let` looping idiom; copies every one of the original `n` elements into the new vector, one position later than where it started.
- **`(cons -1 lst)`** — a reappearance of `cons` (Lesson 12); builds one new cell pointing at the existing list, unchanged — the entire operation, regardless of how long `lst` already is.
- **The real, exactly-reversed timing pattern** — direct, measured confirmation that representation cost is operation-specific, not a fixed property of "which structure is generally faster."

### CS Lens

This is `Θ(1)` versus `Θ(n)`, reversed from Concept Unit 2: a list's front is a genuinely special position — building a new cell there requires touching nothing else — while a vector has no equivalent special position, because every element's identity depends on holding a fixed, contiguous arrangement that a new front element would disrupt entirely. Also recognized in: adding a new first page to a already-page-numbered book (every following page's number must shift) versus adding a new first card to a chain of index cards (only one new card is written; nothing else changes).

### SE Lens

The alternative to measuring the reverse operation is to conclude from Concept Unit 2 alone that vectors are simply the better representation. The real cost of that alternative is exactly the mistake this unit prevents: choosing a representation based on only one operation's cost, then discovering — potentially in a real system already built around that choice — that a different, equally common operation is dramatically more expensive than expected. Measuring both directions deliberately, as this lesson does, is what makes the trade-off visible before a choice is locked in.

---

## Concept Unit 4: Representation as a Trade-off, Not a Ranking

### The Problem

Concept Unit 2 and 3 together show a genuine reversal. It's worth naming the general principle this demonstrates, and connecting it back to choices this curriculum has already made.

### No isolated lab for this step

This concept has no code of its own to isolate — the principle is named directly, using Concept Unit 2 and 3's own real, already-gathered evidence.

### Applying It — Naming the General Principle

No representation is cheap for every operation. A vector's contiguous, indexed layout is exactly what makes direct access to any position possible in one step — and exactly what makes inserting a new first position impossible without rebuilding the whole thing. A list's chain-of-cells layout is exactly what makes adding a new front cell free — and exactly what makes reaching a distant position require walking through everything before it. **Choosing a representation means choosing which operations to make cheap, knowing that choice makes certain other operations expensive as a direct, unavoidable consequence — not a flaw to be fixed, but the actual trade-off being made.**

**Connecting to this curriculum's own already-made choices:** Lesson 55's `table-fib` needed to read arbitrary, already-computed table entries repeatedly and in no particular order — indexed access was exactly what mattered, so a vector was the right choice. Lesson 68's `binary-search` needed to jump directly to a middle position at every step — again, indexed access, again a vector. Nearly everywhere else in this curriculum, values were processed from front to back, one at a time, with the front frequently added to or removed from (Lesson 49's `can-sum-to?`, Lesson 51's `all-subsets`) — exactly what a list is built for, and exactly why a list, not a vector, was the natural, if never explicitly justified, choice.

### Walkthrough

- **The principle, stated as a genuine trade-off, not a flaw** — the central, transferable claim of this lesson: expensive isn't a defect, it's the necessary cost of a real commitment elsewhere.
- **The direct reconnection to Lesson 55 and 68's real, already-made choices** — confirms this lesson's abstract principle by naming concrete, prior decisions it correctly explains, rather than only illustrating it with a fresh, disconnected example.

### CS Lens

This is the foundational idea underneath every data structure Era IV will build from here forward: a structure is not "a way to store values," it is a specific, deliberate bet about which operations will be needed most, paid for by making other operations more expensive. Also recognized in: a kitchen organized for someone who cooks the same few dishes constantly (everything needed is within arm's reach, but finding a rarely-used specialty tool takes real searching) versus one organized alphabetically by ingredient (anything is findable by the identical method, but nothing is optimized for the dishes actually cooked most).

### SE Lens

The alternative to naming this as a trade-off is to keep treating representation choice as a matter of which structure is "generally faster," the way an incomplete summary might. The real cost of that alternative is exactly Concept Unit 3's reversal: a representation chosen for being "generally faster" based on one measured operation can be dramatically the wrong choice once the *actual* dominant operation in a real system turns out to be a different one. Naming the trade-off explicitly, as this unit does, is what Lesson 84 will build on directly — separating *what* a structure needs to do from *how* it's represented, so the trade-off can be reasoned about deliberately instead of discovered by accident.

---

## Closing

### Connect the pieces

One pair of representations, two opposite operations, one general principle:

1. **The unasked question, posed (Unit 1):** this curriculum has chosen between lists and vectors without ever justifying the choice directly.
2. **Indexed access, measured (Unit 2):** vectors over `1,000` times faster than lists at `n = 1,000,000`, for the identical logical request.
3. **Front-insertion, measured (Unit 3):** the exact reverse — lists effectively free, vectors climbing to `7.847` ms at the identical size.
4. **The trade-off, named (Unit 4):** no representation is cheap for everything; choosing one means deliberately choosing which operations matter most, confirmed against this curriculum's own already-made, previously unexplained choices.

Every claim in this lesson traces to real, measured timing, at four increasing scales, for two genuinely opposite operations — the same evidence discipline this curriculum has used since Lesson 22, now applied to representation itself rather than to one specific algorithm.

### What breaks without this

Suppose a system were built using whichever representation happened to be fastest for the very first operation anyone measured — vectors, say, because early testing only ever read data at arbitrary positions. If the real system later needed to repeatedly add new items to the front of that same collection — a genuinely common pattern, not a contrived one — Concept Unit 3's real evidence shows exactly what would happen: a `7.847`-ms-and-climbing cost on an operation nobody thought to measure during the original decision, silently degrading as the collection grows, for a reason that traces directly back to a representation choice made without considering it. Measuring both directions before choosing, as this lesson does, is what catches this kind of mismatch before it's built into a real system.

### Exercises

1. **Observe.** Before checking, predict whether removing the *last* element of a list would be cheap or expensive, using this lesson's own reasoning about what a list's representation does and doesn't support directly.
2. **Formalize.** Measure the real cost of removing the last element from a list of `1,000`, `10,000`, and `100,000` elements, and confirm or correct your Exercise 1 prediction with real timing.
3. **Formalize.** Measure the real cost of appending one element to the *end* of a vector whose size is already known in advance (building a new, one-larger vector, copying everything, and placing the new element last), at the same four scales as Concept Unit 3, and compare it to `vector-prepend`'s real numbers.
4. **Explain.** In your own words, explain why appending to the end of a *list* (Exercise 3's list equivalent) is expensive for a genuinely different reason than prepending to a vector is expensive — referencing what each representation does and doesn't make direct in Concept Unit 1's definitions.
5. **Explain.** Using this lesson's trade-off principle, explain why Lesson 68's `binary-search` could not have been built efficiently using a plain list instead of a vector, citing Concept Unit 2's real evidence specifically.

### Definition of done

- [ ] You can state, precisely, what makes a list's and a vector's representation different, not just that they "hold a sequence of values."
- [ ] You can explain why the identical logical operation costs dramatically different real amounts depending on representation, using real measured evidence for two opposite operations.
- [ ] You can explain representation choice as a genuine trade-off — which operations become cheap, and which become expensive as a necessary consequence — not a search for the single best structure.
- [ ] You can connect this lesson's principle back to at least one specific, already-made representation choice earlier in this curriculum (Lesson 55 or Lesson 68).
- [ ] You completed Exercises 1–5, including at least one real measurement of an operation not tested in this lesson.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the two operations you measured and which representation won each one.
