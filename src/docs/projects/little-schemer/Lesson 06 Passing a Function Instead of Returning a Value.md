# Lesson 06: Passing a Function Instead of Returning a Value

**What you will build:** `split-nums` — one pass over a list of atoms
and numbers, producing *two* separate results (all the numbers, and
everything else) without walking the list twice. The transferable
problem: `addtup` (Lesson 05) always combines everything into one
value, using one fixed combining operation, decided in advance.
Getting *two* separate results out of a single recursive walk needs a
different mechanism entirely — one where the recursion doesn't return
its answer directly, but instead calls a function it was handed,
passing that function whatever it eventually figures out.

**What you need to know first:** Lessons 04 and 05 — tree recursion
and reducing recursion. This lesson's technique is a third, genuinely
different recursive strategy, worth its own careful pace rather than
compressed alongside the others — take this one slowly.

**Terms introduced in this lesson:**
- **Collector** — an extra argument to a recursive procedure that is
  itself a *function*, representing "what to do with the final
  answer" rather than the answer being returned directly. Each
  recursive call can wrap the collector it received in a brand-new
  function before passing that deeper — building up a chain of
  pending work that only actually runs once the base case is reached
  and the original collector is finally called for real.

**Objects and methods this lesson uses:** none new — `number?`
(Lesson 00) reappears in a new predicate role, covered in the
walkthrough below rather than restated here. `cons`, `car`, `cdr`,
`null?`, `cond`, `lambda`, and `define` all reappear as well.

---

## Concept Unit 1: The Problem — One Combining Operation Isn't Enough

### The Problem

`addtup` (Lesson 05) walks a list once and combines everything into a
single number, using `plus`, chosen in advance, every single time.
That works because there's exactly one thing being produced. What
about splitting a list of atoms and numbers into *two* separate
results — a list of just the numbers, and a list of everything else —
in one single pass? Nothing built so far returns two different things
from one recursive walk; every procedure so far commits to exactly one
kind of answer, the moment its base case is written.

### Connecting Sentence

Getting two results out of one pass means the base case can't simply
return an answer anymore — it needs to hand off *both* pieces to
something that knows what to do with both of them at once. That
something is a function, passed in as an extra argument.

---

## Concept Unit 2: `report-length` — Passing a Function Instead of Returning a Value

### Isolated Example

```scheme
(define report-length
  (lambda (lat col)
    (cond
      ((null? lat) (col 0))
      (else (report-length (cdr lat) (lambda (n) (col (add1 n))))))))
(report-length '(wrench bolt gasket) (lambda (n) n))
(report-length '(wrench bolt gasket) (lambda (n) (cons 'count n)))
```

```
; report-length defined
=> 3
=> (count . 3)
```

`report-length` computes the same thing `count-items` (Lesson 01) or
`count-atoms` (Lesson 04) computed — the length of a list — but never
returns that number directly. Instead, once it knows the length, it
*calls* `col` with that number. The second test proves this
concretely: the exact same list, the exact same recursion, produces a
completely different final shape — `(count . 3)`, not `3` — because
the collector passed in decides what happens to the number once it's
found, not `report-length` itself. This is called **passing a
collector**: the recursion's job ends at "here is the answer, do
whatever `col` says to do with it," not at "here is the answer."

### Where This Lives

**Reference Source:** no reference counterpart — original companion
content.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`.

### Mechanical Walkthrough

- `((null? lat) (col 0))` — **base case, and first appearance of
  calling an argument as if it were a procedure.** Every procedure
  since Lesson 00 has *returned* its base-case value directly; this
  one hands `0` to `col` instead, and whatever `col` does with it
  becomes the real result.
- `(lambda (n) (col (add1 n)))` — **first appearance of building a new
  collector on the way in.** This isn't `col` itself — it's a brand
  new, one-off procedure, built fresh on *this* call, that remembers
  the *old* `col` (captured from the enclosing scope, same as any
  `lambda` remembers the variables around it) and wraps it: whenever
  this new function eventually gets called with some number `n`, it
  adds one to `n` and hands the result to the original `col`. This new
  function — not the original — is what gets passed to the recursive
  call.

### Execution Trace

Tracing `(report-length '(wrench bolt) (lambda (n) n))` — call the
original collector `C0`:

```
Call 1: lat = (wrench bolt), col = C0
  → not null — build a new collector, call it C1:
     C1 = (lambda (n) (C0 (add1 n)))
  → recurse: (report-length '(bolt) C1)

Call 2: lat = (bolt), col = C1
  → not null — build a new collector, call it C2:
     C2 = (lambda (n) (C1 (add1 n)))
  → recurse: (report-length '() C2)

Call 3: lat = (), col = C2
  → base case: (C2 0)

Now the built-up chain actually runs, innermost first:
  (C2 0)  = (C1 (add1 0)) = (C1 1)
  (C1 1)  = (C0 (add1 1)) = (C0 2)
  (C0 2)  = 2   (C0 is (lambda (n) n) — hands 2 straight back)

Final result: 2
```

Nothing was added *during* the walk down through `Call 1` and `Call
2` — each of those calls only *built* a new, not-yet-run function.
All the actual `add1` work happens afterward, in a burst, once the
base case finally calls `C2` for real — the exact same "unwind and do
the work on the way back out" shape every recursive procedure in this
series has had, just with function calls standing in for the `cons`es
and `add1`s that used to appear directly in the code.

### CS Lens

**Passing "what to do with the answer" as an explicit function
argument, instead of returning the answer directly, is a general
technique called continuation-passing style** — a collector is one
specific use of it. Also recognized in: a JavaScript callback passed
to an asynchronous function (`fetchData(url, callback)` — the function
doesn't return the data, it calls `callback` with it once it's ready);
a Promise's `.then(...)`, which is exactly "here's what to do once
this finishes"; a compiler's internal representation of a program,
which sometimes rewrites *every* function call this same way
specifically because it makes control flow (what runs next, no matter
how it was reached) completely explicit instead of implicit in
`return` statements.

### SE Lens

**Why go through all of this instead of just returning the length
directly?** For `report-length` alone, there's no reason — a plain
`return`-style version (`count-items`, Lesson 01) is simpler and does
the same job. The real payoff only shows up once a single pass needs
to produce *more* than one thing, or needs the caller to control the
final shape of the result without post-processing it themselves — the
next Concept Unit is exactly that case. The honest cost, paid every
time: a chain of collector calls is genuinely harder to trace by eye
than a chain of direct returns, which is exactly why this lesson
spent a full execution trace on the simplest possible example before
building the real one.

### Connecting Sentence

`report-length` proves the mechanism on a single accumulated number.
`split-nums`, next, uses the exact same mechanism — a collector,
rebuilt fresh on every call — to hand back *two* separate results
instead of one.

---

## Concept Unit 3: `split-nums` — Two Piles From One Pass

### The Real Procedure

```scheme
(define split-nums
  (lambda (lat col)
    (cond
      ((null? lat) (col '() '()))
      ((number? (car lat))
       (split-nums (cdr lat)
         (lambda (nums others)
           (col (cons (car lat) nums) others))))
      (else
       (split-nums (cdr lat)
         (lambda (nums others)
           (col nums (cons (car lat) others))))))))
(split-nums '(wrench 3 bolt 5) (lambda (nums others) (list nums others)))
(split-nums '(3 5 8) (lambda (nums others) (list nums others)))
```

```
; split-nums defined
=> ((3 5) (wrench bolt))
=> ((3 5 8) ())
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox, where it's worth keeping alongside `report-length` for the
Exercises below.

### Mechanical Walkthrough

- `((null? lat) (col '() '()))` — **base case, reappearing** (Concept
  Unit 2's mechanism), with one new wrinkle: `col` is called with
  *two* arguments here, both empty lists — the starting point for
  both piles.
- `(number? (car lat))` — **`number?`, reappearing in a new role**
  (Lesson 00 introduced it as a plain yes/no check; here it's the
  branch condition deciding which pile the current item joins).
- `(lambda (nums others) (col (cons (car lat) nums) others))` — **the
  collector-wrapping shape, reappearing, with a new wrinkle**: this
  new collector takes *two* arguments, `nums` and `others`, matching
  `col`'s own two-argument shape. When the current item is a number,
  the new collector adds it to the `nums` pile (`cons`ed on) and
  passes `others` straight through, unchanged.
- The `else` branch's collector is the mirror image — adds the current
  item to `others` instead, passes `nums` straight through.
- The second test, `(split-nums '(3 5 8) ...)` — every item is a
  number, so `others` never receives anything the whole way through,
  and the final result's second pile is `'()`, same "nothing matched"
  shape every branching procedure in this series has shown.

### Connecting Sentence

`split-nums` is `report-length`'s exact mechanism, with a
two-argument collector standing in for a one-argument one, and two
piles being built instead of one running total. The collector
mechanism itself didn't change at all between these two procedures —
only how many things it carries, and what each branch does with them.

---

## Connect the Pieces

One list, `'(wrench 3 bolt 5 washer)`, through this lesson and back
into Lesson 05: `(split-nums '(wrench 3 bolt 5 washer) (lambda (nums
others) (list nums others)))` produces `((3 5) (wrench bolt washer))`
— two piles, from one single pass, using this lesson's collector
mechanism. Feed the first pile straight into `addtup` (Lesson 05):
`(addtup '(3 5))` sums it to `8` — a procedure from a completely
different recursive shape, put to work on collector output without
either shape needing to know anything about the other.

## What Breaks Without This

Pass the same collector straight through, unwrapped, instead of
building a new one on the way in:

```scheme
(define report-length-broken
  (lambda (lat col)
    (cond
      ((null? lat) (col 0))
      (else (report-length-broken (cdr lat) col)))))
(report-length-broken '(wrench bolt gasket) (lambda (n) n))
```

```
; report-length-broken defined
=> 0
```

**No crash, and the result looks like a real number** — just always
the wrong one. `col` reaches the base case completely unchanged, no
matter how many items were skipped past on the way there, so it
always gets called with a bare `0` — the length of *nothing*,
regardless of the real list's length. This is the collector
mechanism's own version of Lesson 02's dropped-`cons` bug: forgetting
to wrap the collector silently throws away exactly the information the
whole mechanism exists to carry. Restore the wrapping `lambda`, and
confirm the real length comes back.

## Exercises

1. Predict, before running, what `(split-nums '(wrench bolt gasket)
   (lambda (nums others) (list nums others)))` returns, when no item
   is a number at all. Then run it and check.
2. Write and `define` `sum-nums` — instead of collecting the numbers
   into a list, add them together as they're found, using `plus`
   (Lesson 05). `col` should still receive two things: the running
   total, and the list of non-numbers. Test it against a list with at
   least two numbers in it and confirm the total is right.
3. In `report-length`'s execution trace above, `C0` was `(lambda (n)
   n)` — the identity collector. Trace the same list, `'(wrench
   bolt)`, by hand with `C0` replaced by `(lambda (n) (cons 'total
   n))` instead. What does the final result look like?
4. Open *The Little Schemer* to Chapter 5 and work its own collector
   questions in the sandbox. Go slowly — this chapter is a real jump
   in this book too, not just in this series.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, the difference between
      `report-length`'s base case and every previous lesson's base
      cases.
- [ ] You can walk through, by hand, what a collector chain looks like
      for a 2-or-3-item list, the way the Execution Trace did.
- [ ] You completed the Exercises above, including writing `sum-nums`
      yourself.
- [ ] You're working the book's Chapter 5 in the sandbox — slowly.
