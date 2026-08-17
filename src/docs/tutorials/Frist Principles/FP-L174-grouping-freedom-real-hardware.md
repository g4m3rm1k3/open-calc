# Lesson 174: What Grouping Freedom Is Worth on Real Hardware

- **What you will build** — a real Guile program, `parallel-reduction.scm`, that
  reduces a list two genuinely different ways — one instruction stream at a
  time, and split across several real, independently running threads — and
  actually measures, in real seconds on a real clock, whether splitting the
  work paid for itself. The transferable problem this lesson is actually
  about: an operation being associative only *permits* a computation to be
  grouped differently; it says nothing about whether a specific machine has
  real, separate hardware sitting idle that a different grouping could
  actually be handed to, or whether handing it over is worth the real cost of
  doing so. This lesson turns that permission into a measured, honest answer.

- **What you need to know first** — Lesson 170's own associativity result:
  the real, provable law that grouping a sequence of applications of some
  operation differently never changes the final answer, and that this
  holds for ordinary numeric addition but fails for floating-point
  addition. Lesson 172's own monoid framing (bundling a combining
  operation together with its identity element) and Lesson 173's own
  fold-left-versus-fold-right distinction, both reused here only as
  background — this lesson's own combining operation is plain `+`, not a
  general monoid, and nothing here calls `fold-left` or `fold-right`
  directly. Recursive list processing built from a self-referential named
  `let` (a `let` that names its own loop and re-invokes itself with new
  argument values instead of calling out to a separately defined
  procedure), and the ordinary list primitives that walk a list one
  element at a time. Passing a `lambda` expression as a plain value to
  another procedure, the way `map` and `fold`-style reductions already do.

- **Terms used in this lesson**

  - **associativity** — a real, provable law about a binary operation: for
    every `a`, `b`, `c` in that operation's domain, `(a ⊕ b) ⊕ c` equals
    `a ⊕ (b ⊕ c)` — grouping the same sequence of applications differently
    never changes the final answer. This exists as a real, checkable law,
    not an assumption, because an algorithm that silently depends on one
    particular grouping being "the" answer would be fragile in exactly the
    way this lesson's own parallel reduction would be if ordinary numeric
    `+` didn't genuinely have this property.
  - **thread** — a real, independent unit of execution inside the same
    running program, given its own real path through the machine's
    instructions, able to run at the same real moment as another thread
    whenever the underlying hardware has more than one core to run it on.
    This exists because a single, unbroken chain of function calls — no
    matter how its own work is grouped — can only ever occupy one core at a
    time, leaving every other real core a machine has completely idle.
  - **wall-clock time** — the real, elapsed time a person waiting on a
    computation would actually experience, measured against a real clock
    from when work starts to when it finishes. This exists as a distinct
    idea from *CPU time* (the amount of processor computation actually
    consumed) because CPU time only ever counts against a single core's own
    math, even at a real moment when several cores are genuinely working at
    once — wall-clock time is the number that actually answers "how long
    did I wait."
  - **speedup** — the ratio of a sequential run's real wall-clock time to a
    parallel run's real wall-clock time, for the identical task producing
    the identical answer. This exists as the one honest number that settles
    whether spending real hardware on splitting a computation up actually
    paid for itself, rather than simply assuming more threads means faster.
  - **chunk** — a contiguous, non-overlapping slice of an original list,
    produced so that every chunk, put back together in order, reconstructs
    the original list exactly — no element skipped, no element duplicated.
    This exists so a reduction's real work can be divided among several
    threads without any one thread's real answer double-counting or
    silently dropping part of the input.
  - **performance core / efficiency core** — a real distinction some modern
    multi-core chips build directly into their hardware: some real cores
    (performance cores) are built to run at the machine's fastest real
    speed for less real power efficiency, while other real cores
    (efficiency cores) are built to run more slowly while drawing much less
    real power. Both are genuinely separate, independent cores an operating
    system can schedule a thread onto — but not at the same real speed.
    This distinction exists in the hardware itself, and it matters here
    because simply counting how many real cores a machine has does not, by
    itself, say how much real speedup all of them together can actually
    deliver.

- **Objects and methods used**

  - **`call-with-new-thread`**
    - *What it is:* a real procedure, part of Guile's `(ice-9 threads)`
      module, that creates a genuine new operating-system-backed thread of
      execution.
    - *Implementation:* takes one required argument, a zero-argument
      procedure (a thunk). It immediately starts that thunk running on a
      new, real thread, separate from the thread that called it, and
      returns a real thread object representing that new thread right
      away — not the thunk's eventual result, which isn't ready yet.
    - *Its use:* this lesson calls it once per real chunk of work, so each
      chunk's own reduction genuinely runs on its own real thread, at the
      same real moment as every other chunk's thread, instead of one after
      another.
  - **`join-thread`**
    - *What it is:* a real procedure, also from `(ice-9 threads)`, that
      waits for one specific real thread to finish and retrieves the value
      its thunk returned.
    - *Implementation:* takes one required argument, a thread object —
      exactly what `call-with-new-thread` returns. It blocks the calling
      thread's own execution until that specific thread's thunk has
      actually finished running, then returns whatever value that thunk's
      last expression evaluated to.
    - *Its use:* this lesson calls it once per thread it created, matching
      each `join-thread` call to the exact thread object that came from
      the corresponding `call-with-new-thread` call, so each chunk's real
      partial answer comes back correctly paired with the chunk that
      produced it, never mixed up with another thread's answer.
  - **`current-processor-count`**
    - *What it is:* a real procedure, from `(ice-9 threads)`, that asks the
      operating system how many real processor cores this specific machine
      actually has available.
    - *Implementation:* takes no arguments; returns a real, exact integer.
      On this session's own machine it returns `10`.
    - *Its use:* this lesson calls it once, up front, to set an honest real
      ceiling before measuring anything — there is no reason to expect an
      eight-fold real speedup from eight threads if the real hardware
      underneath only has, say, four real cores fast enough to matter.
  - **`list-head`**
    - *What it is:* a real procedure that returns a new list containing the
      first `k` elements of an existing list.
    - *Implementation:* takes two arguments, a list and an exact,
      non-negative integer `k`. Returns a freshly built list of exactly the
      first `k` elements, in their original order, leaving the original
      list itself unchanged.
    - *Its use:* `chunk-list` calls it to cut exactly one real chunk's
      worth of elements off the front of whatever is left of the original
      list.
  - **`list-tail`**
    - *What it is:* a real procedure that returns everything left in a list
      after skipping the first `k` elements.
    - *Implementation:* takes the same two arguments as `list-head` — a
      list and an exact, non-negative integer `k` — but returns the
      remaining elements after the first `k`, rather than the first `k`
      themselves. Also leaves the original list unchanged.
    - *Its use:* `chunk-list` calls it right alongside `list-head`, on the
      same list and the same `k`, so "the chunk just taken" and "what's
      still left to chunk" are two halves of the exact same real split —
      that pairing is what actually guarantees no element is skipped or
      duplicated across chunks.
  - **`ceiling`**
    - *What it is:* a real rounding procedure.
    - *Implementation:* takes one real number and returns the smallest
      integer greater than or equal to it — for example, `(ceiling 7/3)`
      is `3`, not `2`.
    - *Its use:* `chunk-list` divides the list's real length by `k` to get
      a target chunk size; when that division doesn't come out even,
      `ceiling` rounds the target size *up* rather than down, so `k`
      chunks of that size are guaranteed to cover every element. Rounding
      down could leave a real leftover element with nowhere to go.
  - **`iota`**
    - *What it is:* a real procedure that builds a list of consecutive
      integers.
    - *Implementation:* called with one argument `n`, it returns a fresh
      list of exactly `n` exact integers starting at `0` and counting up by
      `1` — `(iota 5)` is `(0 1 2 3 4)`. Called with a second argument
      `start`, it counts up from `start` instead of `0` — `(iota 5 1)` is
      `(1 2 3 4 5)`.
    - *Its use:* this lesson uses the one-argument form to build the real,
      million-element list this lesson's whole speedup measurement runs
      against, plus the small `(iota 10)` / `(iota 20)` / `(iota 7)` lists
      used to check `chunk-list` in isolation before trusting it at full
      scale — and the two-argument form once, later, to build a small list
      starting at `1` instead of `0`.
  - **`get-internal-real-time`**
    - *What it is:* a real procedure that reads Guile's own internal
      real-time (wall-clock) clock.
    - *Implementation:* takes no arguments; returns a real, exact integer
      count of internal time units elapsed since some fixed,
      implementation-defined starting point — not a count of seconds by
      itself, and not meaningful compared across separate runs of the
      program, only as a real difference between two calls within the same
      run.
    - *Its use:* this lesson calls it twice around a block of real work —
      once immediately before, once immediately after — so the difference
      between the two real integers is the real number of internal time
      units that block of work actually took, on the real clock, not a
      count of algorithmic steps.
  - **`internal-time-units-per-second`**
    - *What it is:* a real constant, not a procedure — a fixed exact
      integer, computed once by Guile itself when it starts, never
      recomputed per use.
    - *Implementation:* this session's own real Guile reports its value as
      `1000000000` — meaning `get-internal-real-time`'s own ticks are real
      nanoseconds on this machine.
    - *Its use:* dividing a real elapsed-tick count by this constant
      converts "some number of internal ticks" into "some number of real
      seconds," the unit an actual reader can reason about.
  - **`exact->inexact`**
    - *What it is:* a real numeric-conversion procedure, part of Scheme's
      own numeric tower.
    - *Implementation:* takes one exact number — an integer or an exact
      rational — and returns the equivalent inexact number, an ordinary
      floating-point decimal.
    - *Its use:* dividing two exact integers in Scheme (an elapsed-tick
      count by `internal-time-units-per-second`) produces an exact
      rational, not a decimal — this session's own real run produced
      `739433/250000`, mathematically correct but not written the way a
      person reads "about three seconds." `exact->inexact` converts it to
      the real decimal `2.957732` for display.
  - **`apply`**
    - *What it is:* a real procedure that calls another procedure,
      spreading a list's own elements out to become that procedure's
      individual arguments.
    - *Implementation:* takes at least two arguments — a procedure and a
      list — and calls the procedure with each element of the list as its
      own separate argument, in order, rather than passing the list itself
      as one single argument.
    - *Its use:* `parallel-sum` collects each thread's own real partial sum
      into one list, `partials`, whose length depends on `k` and isn't
      known when the code is written; `apply` is what lets `+` still be
      called correctly on all of them regardless of how many there turn
      out to be.

---

## Concept Unit 1: Real Threads and Real Core Counts

### The Problem

Every reduction this curriculum has built so far — every recursive sum,
every named-`let` loop walking a list one element at a time — has run as
one single, unbroken chain of function calls, each one waiting for the
previous one to finish before it can even start. That stays true no matter
how the reduction is grouped: proving that `(a + b) + c` and `a + (b + c)`
produce the exact same real number for ordinary addition says nothing at
all about *when* each addition actually happens. Both versions still
compute one addition, then the next, then the next, on a single core, one
instruction stream, start to finish. Meanwhile a real machine sitting under
this code very likely has more than one processor core built into it,
sitting almost entirely idle while that single instruction stream works
alone. The problem this unit solves: how does a running Guile program
actually start a second, genuinely independent stream of execution — not
just a different grouping computed by the same one — and how many of those
can this specific machine actually run at the truly same moment, not just
in rapid succession?

### Project Change

- **Reference Source** — no reference counterpart. This curriculum's Era
  VII lessons build standalone demonstration programs proving a
  mathematical property pays off in practice; they are not a port of an
  existing reference codebase, so there is no external implementation to
  quote here.
- **Files affected** — a new file, `parallel-reduction.scm`, created for
  this lesson.
- **Change type** — add (new file).
- **Location** — not applicable; nothing exists yet to locate a position
  within.
- **Dependencies** — none beyond Guile itself. `(ice-9 threads)` ships as
  part of Guile's own standard distribution, so no separate package
  installation step is required.

### The New Code

```scheme
(use-modules (ice-9 threads))

(define core-check
  (call-with-new-thread
   (lambda ()
     (current-processor-count))))

(display "Real cores this machine can run threads on at once: ")
(display (join-thread core-check))
(newline)
```

### The Updated Project

This step is skipped here: the fragment above *is* the whole new structure
so far — a brand-new file with nothing surrounding it yet — so there is no
larger enclosing context to return to and show.

### Introduce the Concept in Isolation

The real code just shown creates exactly one thread and immediately waits
for it. That hides half of what a thread actually buys: the ability to
have *several* of them genuinely running at once, each one's own real
result coming back correctly matched to the thread that produced it, not
to some other thread's work. Before trusting that claim inside the real
project file, here is a small, throwaway program that checks it directly:

```scheme
(use-modules (ice-9 threads))

(define lab-t1 (call-with-new-thread (lambda () (* 6 7))))
(define lab-t2 (call-with-new-thread (lambda () (+ 100 23))))

(display (join-thread lab-t1))
(newline)
(display (join-thread lab-t2))
(newline)
```

Run for real, this produces:

```
42
123
```

Two separate calls to `call-with-new-thread` each started their own real,
independent thread — `lab-t1` computing `(* 6 7)`, `lab-t2` computing
`(+ 100 23)`, genuinely different work. `join-thread` then correctly
retrieved each thread's own distinct return value, matched to the exact
thread that computed it: `42` came back for `lab-t1` specifically, not
mixed with `lab-t2`'s `123`. That is real proof these are two genuinely
separate, individually trackable streams of execution — not the same code
run twice in sequence with both results collected together afterward. This
is exactly what `call-with-new-thread` and `join-thread` in the real
project code above are doing, just with one thread instead of two. This
kind of independent stream of execution is called a **thread**.

### Discard the Throwaway Example

`lab-t1` and `lab-t2` are deleted now. They existed only to prove that two
threads really do run independently and really do return their own
distinct results; the project file never uses either of them again.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`(use-modules (ice-9 threads))`** — `use-modules` is a real special
  form that loads a module and imports its exported bindings into the
  current top-level environment, so names that module defines — like
  `call-with-new-thread`, `join-thread`, and `current-processor-count` —
  become directly callable without any extra prefix. `(ice-9 threads)` is
  that module's own real name: a two-part symbol naming a module built
  into Guile's own standard distribution, providing genuine
  operating-system thread bindings, not a third-party library that has to
  be separately fetched or installed.
- **`define`** — a reappearing special form that binds a name to a value
  in the current environment; here it names the thread object
  `call-with-new-thread` returns as `core-check`, so it can be passed to
  `join-thread` afterward. This exists so a value produced once can be
  referred to again by name, rather than having to be recomputed or
  re-expressed every time it's needed.
- **`call-with-new-thread`** — already given full treatment above in
  *Objects and methods used*; here it is called with one argument, the
  `lambda` immediately below it.
- **`lambda`** — a reappearing special form that builds an unnamed
  procedure value on the spot. Here it takes zero arguments and its body
  is a single call, `(current-processor-count)`; this exists so a chunk of
  code can be handed to another procedure — here, `call-with-new-thread` —
  as a plain value, to be run later, on the new thread, rather than being
  run immediately where it's written.
- **`current-processor-count`** — already given full treatment above; here
  it is the real work this lesson's very first thread actually does.
- **`join-thread`** — already given full treatment above; called on
  `core-check`, it blocks until that specific thread's `lambda` has
  finished running `current-processor-count` and returns the real integer
  that call produced.
- **`display`** — a reappearing procedure that prints its one argument to
  the current output, with no added formatting or trailing newline of its
  own; it exists as the most direct way to make a real value visible
  outside the program, which is what every real number claimed anywhere in
  this lesson depends on. It appears twice here: once printing the literal
  string that labels what's about to be shown, once printing the real
  integer `join-thread` returned.
- **`"Real cores this machine can run threads on at once: "`** — a string
  literal, a fixed sequence of characters written directly in the source
  exactly as it should print, with no computation involved in producing
  it.
- **`newline`** — a reappearing procedure, called with no arguments, that
  prints a single line-break character; it exists so the next thing
  printed after it starts on a fresh line instead of running directly onto
  the end of what came before.

### CS Lens

A **thread** is a hard concept: the fundamental unit that real operating
systems and real CPUs schedule independently of one another, and it
recurs far beyond this one lesson's own use of it. Also recognized in: a
real web server handling many separate requests at genuinely the same
time; a GUI application keeping its own interface responsive while a
background task runs; a database connection pool serving several real
queries concurrently; a video game engine splitting real physics,
rendering, and audio work across separate cores every single frame; an
operating system's own task scheduler, deciding, many times per second,
which real thread gets which real core next.

### SE Lens

The design choice here is threads sharing one process's own memory
directly, rather than separate operating-system *processes* communicating
through some explicit channel. The alternative not chosen — separate
processes — gives real isolation: one process crashing, or writing to
memory it shouldn't, cannot corrupt another process's own memory, because
they don't share any. The real tradeoff: processes are meaningfully
heavier to create than threads, and because they don't share memory
directly, combining their separate results back together (what this
lesson's later `parallel-sum` needs to do with each chunk's own partial
sum) would require some explicit communication mechanism between them,
rather than simply reading a return value. Threads, sharing the same
process's memory space directly, are the lighter-weight tool for this
specific problem — many small, independent pieces of one reduction,
computed separately, then combined. The real cost this project is now
carrying because of that choice: shared memory is exactly the source of
real *race condition* bugs when two threads read and write the same
location without coordination. This lesson's own threads happen to avoid
that risk only because each one works on a private chunk no other thread
ever touches — a property later units have to preserve deliberately, not
something threads guarantee automatically.

### Run It

Running `guile parallel-reduction.scm` at this point in the lesson
produces:

```
Real cores this machine can run threads on at once: 10
```

### Connect to What Came Before

This lesson opened by asking how many real, independent streams of
execution a program can actually start, and how much real hardware exists
underneath to run them on. This unit answers both, for real: threads are
real and independently trackable, and this specific machine reports `10`
real cores — an honest ceiling every later measurement in this lesson has
to be judged against, known before a single real item of work has been
assigned to any thread.

---

## Concept Unit 2: Splitting a List Into Real Chunks

### The Problem

Real threads now exist, and this session's own machine reports `10` real
cores available — but nothing yet says *which* part of a list each thread
should actually work on. Handing every new thread the exact same full list
would make several threads each redundantly recompute the entire
reduction, not divide it — strictly worse than the original single-thread
version, since the same expensive work would now happen several separate
times, and something afterward would still have to pick just one of the
identical answers, having wasted the rest. The problem this unit solves:
given a list and however many pieces `k` are wanted, produce `k` chunks
that are non-overlapping and, put back together in order, reconstruct the
original list exactly — because only that guarantee is what lets
associativity's already-proven promise (that grouping a reduction
differently never changes the answer) actually apply to reducing each
chunk separately and then combining the partial answers.

### Project Change

- **Reference Source** — no reference counterpart, for the same reason as
  Concept Unit 1: this is a from-scratch addition, not a port.
- **Files affected** — `parallel-reduction.scm` (modified).
- **Change type** — add.
- **Location** — at the end of the file, directly after the module import
  and the real thread-wrapped processor-count check added in Concept Unit
  1.
- **Dependencies** — none new.

### The New Code

```scheme
(define (chunk-list lst k)
  (let* ((len (length lst))
         (size (ceiling (/ len k))))
    (let loop ((rest lst) (chunks '()))
      (cond
       ((null? rest) (reverse chunks))
       ((>= (length rest) size)
        (loop (list-tail rest size) (cons (list-head rest size) chunks)))
       (else (loop '() (cons rest chunks)))))))
```

### The Updated Project

```scheme
(use-modules (ice-9 threads))

(define core-check
  (call-with-new-thread
   (lambda ()
     (current-processor-count))))

(display "Real cores this machine can run threads on at once: ")
(display (join-thread core-check))
(newline)

; ← new, starts here
(define (chunk-list lst k)
  (let* ((len (length lst))
         (size (ceiling (/ len k))))
    (let loop ((rest lst) (chunks '()))
      (cond
       ((null? rest) (reverse chunks))
       ((>= (length rest) size)
        (loop (list-tail rest size) (cons (list-head rest size) chunks)))
       (else (loop '() (cons rest chunks)))))))
```

Running this file now does two things: it still reports this machine's
real core count exactly as before, and it now also defines a real
procedure able to cut any list into `k` real, non-overlapping pieces —
nothing calls `chunk-list` for real work yet, but it exists in the file
and is ready to.

### Introduce the Concept in Isolation

`chunk-list`'s own body leans on two procedures, `list-head` and
`list-tail`, doing all the real work of cutting a list. Before trusting
what they do inside a loop with real branching, here they are alone:

```scheme
(define sample (list 'a 'b 'c 'd 'e))
(display (list-head sample 2))
(newline)
(display (list-tail sample 2))
(newline)
```

Run for real, this produces:

```
(a b)
(c d e)
```

`list-head` returned the first two real elements of `sample`; `list-tail`,
called with the exact same list and the exact same count, returned
everything *after* those first two. Together, the two real results put
back together — `(a b)` followed by `(c d e)` — reconstruct `sample`
exactly, with nothing missing and nothing repeated. This is exactly what
`chunk-list` in the code above is doing, once per loop iteration, to peel
off one real chunk at a time from whatever is left of the original list.

### Discard the Throwaway Example

`sample` is deleted now. It existed only to prove `list-head` and
`list-tail` really do split a list into two complementary, non-overlapping
halves; the project file never uses it again.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`define`** — reappearing; here it names a two-argument procedure,
  `chunk-list`, taking a list `lst` and a desired chunk count `k`.
- **`let*`** — a binding form that, unlike a plain `let`, lets each
  binding's own expression see every binding listed before it in the same
  form. This is needed here because `size`'s own expression,
  `(ceiling (/ len k))`, reads `len`, which was just bound in the very
  same `let*` — a plain `let` would not let `size`'s expression see `len`
  yet, because a plain `let` evaluates all of its binding expressions
  before any of them are visible to each other.
- **`length`** — reappearing; called on `lst`, it returns the real count
  of elements in the list, used here to compute the target chunk size.
- **`ceiling`** — already given full treatment above; called on `(/ len
  k)`, it rounds a target chunk size up when the list doesn't split evenly
  across `k` pieces.
- **`/`** — the reappearing division operator; `(/ len k)` divides the
  list's real length by the desired number of chunks.
- **named `let`, `loop`** — a self-referential loop built from a
  specially-named `let`: writing `(let loop ((rest lst) (chunks '())) ...)`
  both binds `rest` and `chunks` to their starting values *and* defines
  `loop` itself as a callable name for the body that follows, so the body
  can call `loop` again with new argument values to continue iterating,
  without needing a separately defined named procedure. This exists
  because ordinary Scheme has no dedicated looping keyword like `for` or
  `while`; recursion — a procedure calling itself — is the mechanism, and
  named `let` is the concise way to write a recursive loop whose starting
  values are known immediately, right where the loop begins.
- **`cond`** — a reappearing multi-branch conditional; it tests each
  clause's own condition in order and runs the first one that's true,
  skipping the rest. It's chosen here, over a chain of nested `if`
  expressions, because there are three real, mutually exclusive cases to
  distinguish: no elements left at all, enough elements left for one more
  full-size chunk, or a genuine leftover smaller than a full chunk — three
  parallel cases read more clearly as three parallel `cond` clauses than
  as nested `if`s two levels deep.
- **`null?`** — reappearing; tests whether `rest` is the empty list,
  meaning every element has already been placed into some chunk.
- **`reverse`** — reappearing; returns a list with its elements in the
  opposite order. This is needed because chunks got built up by adding
  each new chunk to the *front* of the `chunks` list, via `cons`, as the
  loop progressed — so the very first chunk found ends up last unless
  `reverse` restores the original left-to-right order at the very end.
- **`>=`** — the reappearing "greater than or equal to" comparison; tests
  whether there are still at least `size` elements left in `rest`.
- **`list-tail`** — already given full treatment above; called on `rest`
  and `size`, it produces what's left after removing one chunk's worth of
  elements from the front.
- **`cons`** — reappearing; builds a new pair, here used to add one more
  chunk onto the front of the growing `chunks` list.
- **`list-head`** — already given full treatment above; called on `rest`
  and `size`, it produces the actual chunk being peeled off this
  iteration.
- **`else`** — the catch-all clause of `cond`, reappearing; it runs when
  neither earlier clause matched — here, when elements remain but fewer
  than a full chunk's worth, so the entire genuine leftover becomes the
  final, smaller chunk.

**Execution trace.** Tracing `(chunk-list (iota 7) 3)` — seven elements
into three chunks, a case that does not divide evenly, so every real
branch of `cond` gets exercised:

```
Iteration 1: rest (0 1 2 3 4 5 6) → length 7 ≥ size 3 → take (0 1 2), rest becomes (3 4 5 6), chunks ((0 1 2))
Iteration 2: rest (3 4 5 6) → length 4 ≥ size 3 → take (3 4 5), rest becomes (6), chunks ((3 4 5) (0 1 2))
Iteration 3: rest (6) → length 1 < size 3 → else branch: whole remainder becomes final chunk (6), rest becomes (), chunks ((6) (3 4 5) (0 1 2))
Iteration 4: rest () → null? true → reverse chunks → ((0 1 2) (3 4 5) (6))
```

Iterations 1 and 2 both took the `>=` branch because a full chunk's worth
of elements genuinely remained each time. Iteration 3 took the `else`
branch specifically because only one element was left — fewer than
`size`, `3` — proving that branch is real, exercised code on this input,
not dead code that happens to look reachable. Iteration 4's `reverse` is
what turns the build-order `((6) (3 4 5) (0 1 2))` back into the real,
left-to-right result `((0 1 2) (3 4 5) (6))`.

### CS Lens

Cutting one input into independent pieces, processing each piece
separately, and combining the results is a hard concept: the real shape
underneath *divide-and-conquer* and *map-reduce* data partitioning alike.
Also recognized in: MapReduce- and Hadoop-style big-data frameworks
splitting one dataset across many worker machines; GPU compute kernels
splitting one array across many thread blocks; database engines splitting
one table scan across parallel worker processes; image-editing software
splitting one large image into tiles processed by separate threads;
parallel sorting algorithms splitting one array before merging the sorted
pieces back together.

### SE Lens

The design choice here is *static* chunking — deciding every thread's
exact share of the work once, up front, before any thread starts. The real
alternative not chosen: a *work-stealing* queue, where each thread
dynamically pulls the next unit of work as soon as it finishes its
current one, rather than being handed one fixed chunk in advance. The real
tradeoff: work-stealing handles uneven per-element cost far better — a
thread that finishes cheap work early can immediately help with someone
else's expensive leftover — but it is meaningfully more complex to
implement correctly, needing a real, thread-safe shared queue instead of
one plain list. This lesson's static `chunk-list` is simpler, and it stays
correct specifically because every element this lesson ever reduces costs
the same real amount of work to process. The real debt this project is
now carrying: `chunk-list` would silently produce badly imbalanced real
wall-clock times — some threads finishing far earlier than others, sitting
idle while one overloaded thread finishes alone — if a future list's
elements ever cost wildly different amounts to process.

### Run It

Ten elements into three chunks first, the same size already traced above:

```scheme
(chunk-list (iota 10) 3)
;=> ((0 1 2 3) (4 5 6 7) (8 9))
```

Now a larger, still evenly-dividing input — twenty elements into four
chunks, changing both the list's real size and the chunk count at once,
to check the procedure isn't accidentally specialized to the number `3`:

```scheme
(chunk-list (iota 20) 4)
;=> ((0 1 2 3 4) (5 6 7 8 9) (10 11 12 13 14) (15 16 17 18 19))
```

And finally, back to three chunks but with a genuinely uneven input —
seven elements, which does not divide evenly by three:

```scheme
(chunk-list (iota 7) 3)
;=> ((0 1 2) (3 4 5) (6))
```

Ten elements into three chunks, and twenty elements into four, both
divided evenly. Seven elements into three chunks did not divide evenly —
`ceiling` rounded the target chunk size up to `3`, so the first two chunks
took three real elements each and the third simply received whatever was
left, one element, matching the execution trace above exactly.

Before trusting `chunk-list` at the real scale this lesson actually needs,
one more check, at the size this lesson's later measurement will really
use:

```scheme
(map length (chunk-list (iota 1000000) 4))
;=> (250000 250000 250000 250000)
```

At a full, real one million elements, dividing evenly by `4`, all four
real chunks come back exactly equal — the honest, best-case shape for
splitting work evenly across threads, confirmed at the actual scale this
lesson is about to measure, not just at a toy size.

### Connect to What Came Before

Concept Unit 1 proved this machine can run `10` real threads at once; this
unit proves a list can actually be cut into that many real,
correctly-reconstructing pieces, checked first at a size small enough to
verify by eye and then at the real scale this lesson is building toward.
Two of the three facts this lesson needs are now real and verified; only
turning "10 real threads" and "real, correct chunks" into a real,
measured number is still missing.

---

## Concept Unit 3: Measuring Real Wall-Clock Time

### The Problem

Every claim of speed made anywhere earlier in this curriculum was backed
by counting real operations — comparisons, recursive calls, array
accesses — never by watching an actual clock. Counting operations is the
right tool for comparing two *algorithms'* own growth rates, because it
doesn't care which specific machine happens to run the code. But that is
exactly the wrong tool here: a sequential reduction and a parallel one,
split across several threads, do the *exact same total amount* of real
arithmetic — the same number of real calls to whatever per-element work
function is in use, the same number of real additions. An operation count
would report them as identical, when the entire point of this lesson is
that they are not equally fast in real, human-experienced time. The
problem this unit solves: how does a running Guile program measure genuine
wall-clock time — the actual number of real seconds a person waiting on it
would experience — for a piece of code it just finished running?

### Project Change

- **Reference Source** — no reference counterpart, same reasoning as
  Concept Units 1 and 2.
- **Files affected** — `parallel-reduction.scm` (modified).
- **Change type** — add.
- **Location** — at the end of the file, directly after `chunk-list`,
  added in Concept Unit 2.
- **Dependencies** — none new.

### The New Code

```scheme
(define (time-and-report label thunk)
  (let* ((start (get-internal-real-time))
         (result (thunk))
         (end (get-internal-real-time)))
    (display label)
    (display ": ")
    (display result)
    (display " in ")
    (display (exact->inexact (/ (- end start) internal-time-units-per-second)))
    (display " seconds")
    (newline)
    result))
```

### The Updated Project

```scheme
(use-modules (ice-9 threads))

(define core-check
  (call-with-new-thread
   (lambda ()
     (current-processor-count))))

(display "Real cores this machine can run threads on at once: ")
(display (join-thread core-check))
(newline)

(define (chunk-list lst k)
  (let* ((len (length lst))
         (size (ceiling (/ len k))))
    (let loop ((rest lst) (chunks '()))
      (cond
       ((null? rest) (reverse chunks))
       ((>= (length rest) size)
        (loop (list-tail rest size) (cons (list-head rest size) chunks)))
       (else (loop '() (cons rest chunks)))))))

; ← new, starts here
(define (time-and-report label thunk)
  (let* ((start (get-internal-real-time))
         (result (thunk))
         (end (get-internal-real-time)))
    (display label)
    (display ": ")
    (display result)
    (display " in ")
    (display (exact->inexact (/ (- end start) internal-time-units-per-second)))
    (display " seconds")
    (newline)
    result))
```

Running this file now still reports the real core count and still defines
`chunk-list`, and it now also defines a real procedure able to run any
zero-argument thunk, print how long it genuinely took in real seconds, and
still return whatever that thunk itself returned — so timing a call never
changes what calling it actually produces.

### Introduce the Concept in Isolation

`time-and-report` leans on two real names that haven't run yet in this
lesson's own project file: `get-internal-real-time` and
`internal-time-units-per-second`. Before trusting what they measure inside
a real procedure, here they are alone, timing a plain counting loop of
fifty million steps:

```scheme
(define timing-start (get-internal-real-time))
(let loop ((i 0)) (if (< i 50000000) (loop (+ i 1))))
(define timing-end (get-internal-real-time))

(display (- timing-end timing-start))
(newline)
(display internal-time-units-per-second)
(newline)
(display (exact? (/ (- timing-end timing-start) internal-time-units-per-second)))
(newline)
(display (/ (- timing-end timing-start) internal-time-units-per-second))
(newline)
(display (exact->inexact (/ (- timing-end timing-start) internal-time-units-per-second)))
(newline)
```

Run for real, this produces:

```
2957732000
1000000000
#t
739433/250000
2.957732
```

`get-internal-real-time` returned two different real integers, one before
the loop and one after; their difference, `2957732000`, is a real count of
internal ticks. `internal-time-units-per-second` reports `1000000000` on
this real machine, meaning those ticks are real nanoseconds. Dividing the
two exact integers did **not** automatically produce a decimal — `(exact?
...)` reports `#t`, and the raw result is the exact rational
`739433/250000`, mathematically correct but not written the way a person
reads "about three seconds." Only `exact->inexact` converts that exact
ratio into the ordinary decimal `2.957732`, the real number of seconds a
person actually waited for fifty million loop steps on this machine. This
real, elapsed-clock measurement — distinct from a count of algorithmic
steps — is called **wall-clock time**. This is exactly what
`get-internal-real-time` and `internal-time-units-per-second` in
`time-and-report` above are doing, wrapped around an arbitrary thunk
instead of one fixed loop.

### Discard the Throwaway Example

`timing-start` and `timing-end` are deleted now. They existed only to
prove `get-internal-real-time` and `internal-time-units-per-second`
genuinely measure real elapsed seconds, and that dividing two exact
integers keeps the result exact until `exact->inexact` is called
deliberately; the project file never uses either name again.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`define`** — reappearing; names a two-argument procedure,
  `time-and-report`, taking a `label` string and a `thunk` — a
  zero-argument procedure to be timed.
- **`let*`** — already given full treatment in Concept Unit 2; needed
  again here because `result`'s own binding expression, `(thunk)`, must
  run *after* `start` is bound and *before* `end` is bound, and each
  later binding in a `let*` can see the ones before it — a plain `let`
  would not guarantee this exact before-then-during-then-after ordering.
- **`get-internal-real-time`** — already given full treatment above;
  called twice, once for `start` and once for `end`, bracketing the real
  work being timed.
- **`(thunk)`** — calling a procedure that was itself passed in as a plain
  value, with no arguments; this is the same higher-order pattern this
  curriculum has already used extensively (passing a `lambda` to `map`,
  `filter`, or a fold) — here, the value being called isn't a fixed
  procedure written directly in `time-and-report`'s own body, but whatever
  the caller passed in as `thunk`, letting one single timing procedure
  measure *any* zero-argument computation, not just one hard-coded piece
  of work.
- **`display`** — already given full treatment in Concept Unit 1; called
  five times here, once each for the label, a colon-and-space separator,
  the real result, the word "in," and the word "seconds," building up one
  printed line piece by piece.
- **`(- end start)`** — the reappearing subtraction operator; computes the
  real elapsed tick count directly, the same real quantity computed by
  hand in the isolated lab above.
- **`internal-time-units-per-second`** — already given full treatment
  above; used here exactly as in the lab, to convert ticks into seconds.
- **`/`** — reappearing; divides the real elapsed ticks by the real
  ticks-per-second constant.
- **`exact->inexact`** — already given full treatment above; converts the
  exact division result into a real, human-readable decimal.
- **`newline`** — already given full treatment in Concept Unit 1; ends the
  one printed line this procedure builds.
- **`result`** — the last expression in the `let*` body; naming it here,
  bare, causes `time-and-report` itself to return the exact same value
  `thunk` produced, after already printing the real timing information as
  a side effect — so wrapping a call in `time-and-report` never changes
  what that call actually computes, only what gets printed alongside it.

### CS Lens

Measuring wall-clock time around an arbitrary block of work, rather than
counting an algorithm's own abstract steps, connects to a hard concept:
*profiling* — treating a running program's own real behavior as evidence,
not just its written logic. Also recognized in: a web server's own
real request-latency dashboards; a compiler's own `-ftime-report`-style
build-stage timers; a video game's own real per-frame timing overlay; a
database's own real query-execution-time logging; any A/B test comparing
two real implementations' actual measured speed rather than their
predicted growth rate alone.

### SE Lens

The design choice here is measuring real wall-clock time specifically,
using `get-internal-real-time`, rather than measuring real CPU time (the
total processor computation consumed, summed across every core a program
used). The real alternative not chosen: `get-internal-run-time`, Guile's
own CPU-time equivalent. The real tradeoff: CPU time would report roughly
the *same* total number, sequential or parallel, because splitting work
across four real cores doesn't reduce the total amount of real computation
performed — it only changes how much real *wall-clock* time that same
total computation takes when several cores do their share at once.
Wall-clock time is the only one of the two that can actually go down when
threads are added, which is exactly the real number this lesson's whole
claim depends on; choosing CPU time here would have silently hidden every
real speedup this lesson is about to measure.

### Run It

Before trusting `time-and-report` on this lesson's real, full-scale
capstone measurement, a small, escalating check on trivial work:

```scheme
(time-and-report "trivial-add" (lambda () (+ 1 2)))
;=> trivial-add: 3 in 5.0e-5 seconds
```

`time-and-report` printed the real label, the real result `3`, and the
real elapsed time — a tiny but genuine, non-zero number of real seconds,
`0.00005`, for one addition — and the expression itself evaluated to `3`,
proving the wrapper's own return value still matches exactly what
`(+ 1 2)` alone would have produced.

### Connect to What Came Before

Concept Unit 1 proved real threads exist and this machine has `10` real
cores; Concept Unit 2 proved a list can be split into real, correctly
reconstructing chunks; this unit proves real elapsed seconds — not
algorithmic step counts — can be measured around any real block of work,
and confirmed on the smallest possible real example that the wrapper
itself changes nothing about what's actually computed. Every real
ingredient this lesson needs now exists; only combining them at real scale
is left.

---

## Concept Unit 4: Parallel Reduction, Measured

### The Problem

Real threads exist, a list can be split into real, verified chunks, and
real wall-clock seconds can be measured around any block of work — but
none of those three real facts has yet been combined into the one claim
this whole lesson exists to check: does actually spending several real
threads on an associative reduction make it genuinely faster, in real
seconds, and if so, by how much, and does that real payoff keep growing
the more threads are used? The problem this unit solves: build a real
sequential reduction and a real, thread-based parallel reduction of the
identical work, over the identical input, producing the identical answer —
then actually measure both, honestly, at real scale.

### Project Change

- **Reference Source** — no reference counterpart, same reasoning as every
  earlier unit in this lesson.
- **Files affected** — `parallel-reduction.scm` (modified).
- **Change type** — add.
- **Location** — at the end of the file, directly after `time-and-report`,
  added in Concept Unit 3.
- **Dependencies** — none new for the Scheme code itself. Confirming *why*
  this unit's own measured numbers come out the way they do uses one
  real, external command, `sysctl`, on this session's own macOS machine —
  a genuinely different tool on a Linux machine (`lscpu`, or reading
  `/sys/devices/system/cpu/cpu*/topology/`) or on Windows (`wmic cpu get
  NumberOfCores`); the exact command is platform-specific, but the real
  hardware fact it reveals is not.

### The New Code

```scheme
(define (heavy-square x)
  (let loop ((i 0) (acc 0))
    (if (= i 200)
        (+ acc (* x x))
        (loop (+ i 1) (+ acc 1)))))

(define (sequential-sum lst)
  (let loop ((rest lst) (acc 0))
    (if (null? rest)
        acc
        (loop (cdr rest) (+ acc (heavy-square (car rest)))))))

(define (parallel-sum lst k)
  (let* ((chunks (chunk-list lst k))
         (threads (map (lambda (chunk)
                          (call-with-new-thread
                           (lambda () (sequential-sum chunk))))
                        chunks))
         (partials (map join-thread threads)))
    (apply + partials)))
```

### The Updated Project

```scheme
(use-modules (ice-9 threads))

(define core-check
  (call-with-new-thread
   (lambda ()
     (current-processor-count))))

(display "Real cores this machine can run threads on at once: ")
(display (join-thread core-check))
(newline)

(define (chunk-list lst k)
  (let* ((len (length lst))
         (size (ceiling (/ len k))))
    (let loop ((rest lst) (chunks '()))
      (cond
       ((null? rest) (reverse chunks))
       ((>= (length rest) size)
        (loop (list-tail rest size) (cons (list-head rest size) chunks)))
       (else (loop '() (cons rest chunks)))))))

(define (time-and-report label thunk)
  (let* ((start (get-internal-real-time))
         (result (thunk))
         (end (get-internal-real-time)))
    (display label)
    (display ": ")
    (display result)
    (display " in ")
    (display (exact->inexact (/ (- end start) internal-time-units-per-second)))
    (display " seconds")
    (newline)
    result))

; ← new, starts here
(define (heavy-square x)
  (let loop ((i 0) (acc 0))
    (if (= i 200)
        (+ acc (* x x))
        (loop (+ i 1) (+ acc 1)))))

(define (sequential-sum lst)
  (let loop ((rest lst) (acc 0))
    (if (null? rest)
        acc
        (loop (cdr rest) (+ acc (heavy-square (car rest)))))))

(define (parallel-sum lst k)
  (let* ((chunks (chunk-list lst k))
         (threads (map (lambda (chunk)
                          (call-with-new-thread
                           (lambda () (sequential-sum chunk))))
                        chunks))
         (partials (map join-thread threads)))
    (apply + partials)))
```

`parallel-reduction.scm` now does everything this lesson set out to build:
report a real core count, split a real list into real chunks, time any
real block of work in real seconds, and reduce a real list two genuinely
different ways — one instruction stream at a time, or split across real,
independently running threads — while `heavy-square` guarantees each
element costs a real, deliberately non-trivial amount of work to process,
so the difference between the two reductions is measurable at all.

### Introduce the Concept in Isolation

`heavy-square`'s own loop is intentionally uniform — every one of its two
hundred iterations takes the exact same branch and performs the exact same
update, only the counters `i` and `acc` actually change. Tracing
`(heavy-square 2)` — which should compute `200 + (* 2 2)`, `204`:

```
Iteration 1: i 0 ≠ 200 → not done → acc 0 + 1 → acc 1, i becomes 1
Iteration 2: i 1 ≠ 200 → not done → acc 1 + 1 → acc 2, i becomes 2
```

Every one of the next 197 iterations repeats this exact same shape —
neither the condition tested (`i = 200`) nor the update performed (`acc`
up by one, `i` up by one) ever changes until `i` itself finally reaches
`200` — so showing all two hundred individually would add nothing beyond
what these first two already prove. Only the final transition is genuinely
different:

```
Iteration 200: i 199 ≠ 200 → not done → acc 199 + 1 → acc 200, i becomes 200
Iteration 201: i 200 = 200 → done → return acc 200 + (* 2 2) → 200 + 4 = 204
```

Run for real, `(heavy-square 2)` does produce `204`, along with two other
small, real checks: `(heavy-square 0)` produces `200`, and `(heavy-square
1)` produces `201` — all three matching the pattern `200 + x²` this trace
predicts. This is exactly the per-element work `sequential-sum` and
`parallel-sum` above both call, once per real list element, `1,000,000`
real times in this unit's own capstone measurement below.

With those three small, real values known, `sequential-sum`'s own loop can
be traced honestly without re-expanding `heavy-square`'s two-hundred-step
loop on every single iteration. Tracing `(sequential-sum (list 0 1 2))`:

```
Iteration 1: rest (0 1 2) → not null → acc 0 + heavy-square(0)=200 → acc 200, rest becomes (1 2)
Iteration 2: rest (1 2) → not null → acc 200 + heavy-square(1)=201 → acc 401, rest becomes (2)
Iteration 3: rest (2) → not null → acc 401 + heavy-square(2)=204 → acc 605, rest becomes ()
Iteration 4: rest () → null? true → return acc 605
```

Run for real, `(sequential-sum (list 0 1 2))` does produce `605`, exactly
`200 + 201 + 204` — real, independent confirmation the trace above is
accurate, not just algebraically plausible.

`parallel-sum` is different in kind from the two traces above: the real
question is not what value changes on which step, but *when* each real
call actually happens relative to the others.

1. `(chunk-list lst k)` — runs first, entirely on the calling thread;
   produces all `k` real chunks before any new thread exists yet.
2. `(map (lambda (chunk) (call-with-new-thread (lambda () (sequential-sum
   chunk)))) chunks)` — creates all `k` real threads here, one per chunk,
   each one starting to run `sequential-sum` on its own chunk immediately
   upon creation. Critically, `call-with-new-thread` returns its new
   thread object right away, without waiting for that thread's own
   `sequential-sum` call to finish — so by the time this `map` itself
   returns, all `k` threads may already be genuinely running at the same
   real moment, each independently working through its own chunk.
3. `(map join-thread threads)` — only now does the calling thread wait;
   for each thread object in order, `join-thread` blocks until that
   specific thread's own `sequential-sum` call has actually finished and
   returns its real result. The calling thread was free to create every
   thread first, precisely *because* creation and waiting are two
   separate real steps, not one combined step.
4. `(apply + partials)` — runs only after every real thread has already
   finished and been joined; combines the `k` real partial sums into the
   one final answer, using the ordinary sequential `+` this whole lesson
   already proved does not care what order or grouping its real arguments
   arrive in.

### Discard the Throwaway Example

No throwaway code was introduced in this unit — every real value shown
above (`heavy-square` on `0`, `1`, and `2`; `sequential-sum` on a
three-element list) is a genuine, minimal call to the real project's own
procedures, not disposable code standing in for them. There is nothing
here to discard.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`define` (`heavy-square`)** — reappearing; names a one-argument
  procedure whose entire purpose is to cost a real, deliberately uniform
  amount of work per call, so that summing many real elements takes a
  real, measurable amount of wall-clock time instead of finishing too
  fast to time meaningfully.
- **named `let`, `loop` (inside `heavy-square`)** — already given full
  treatment in Concept Unit 2; here it counts from `0` up to `200`,
  accumulating `1` into `acc` on every step before finally adding the real
  square, `(* x x)`, only once, at the very end.
- **`if`** — a reappearing conditional special form, evaluating its test
  expression and then evaluating and returning exactly one of its two
  branches, never both; chosen here, over `cond`, because there are only
  two real outcomes to distinguish (still counting, or finally done), not
  three or more parallel cases.
- **`=`** — the reappearing numeric-equality operator; tests whether `i`
  has reached exactly `200`.
- **`*`** — the reappearing multiplication operator; computes `x` squared,
  `(* x x)`, exactly once, only after the counting loop finishes.
- **`+`** — the reappearing addition operator; used twice inside
  `heavy-square` — once to add `x`'s real square onto the final
  accumulated count, once inside the loop to increment `acc` by exactly
  `1` each step — and once more, differently, inside `sequential-sum`, to
  add each element's real `heavy-square` result onto that procedure's own
  running total.
- **`define` (`sequential-sum`)** — reappearing; names a one-argument
  procedure reducing an entire list, one element at a time, on a single
  instruction stream.
- **`cdr`** — reappearing; returns everything in `rest` after its first
  element, advancing the loop one element further with each call.
- **`car`** — reappearing; returns `rest`'s own first element, the one
  `heavy-square` is about to be called on this iteration.
- **`define` (`parallel-sum`)** — reappearing; names a two-argument
  procedure, a list and a desired thread count `k`, reducing the identical
  list `sequential-sum` reduces, but split across `k` real threads.
- **`let*` (inside `parallel-sum`)** — already given full treatment in
  Concept Unit 2; needed here because `threads`'s own binding expression
  reads `chunks`, and `partials`'s own binding expression reads `threads`,
  each one genuinely depending on the binding immediately before it.
- **`chunk-list`** — already given full treatment in Concept Unit 2;
  called here on the real list `parallel-sum` was given and the real
  thread count `k`, producing the real chunks each thread will work on.
- **`map` (building `threads`)** — a reappearing higher-order procedure
  that applies a given procedure to every element of a list, in order,
  and collects the real results into a new list; here, "applying" the
  procedure to each chunk means starting one new real thread per chunk, so
  the resulting `threads` list holds one real thread object per chunk,
  each already running.
- **`call-with-new-thread`** — already given full treatment in Concept
  Unit 1; called once per chunk here, this is the real mechanism turning
  `k` separate chunks into `k` genuinely concurrent streams of execution.
- **`lambda` (wrapping `sequential-sum`)** — already given full treatment
  in Concept Unit 1; here it packages a call to `sequential-sum` on one
  specific `chunk` as a zero-argument thunk, exactly the shape
  `call-with-new-thread` requires.
- **`map` (building `partials`)** — the same reappearing procedure as
  above, applied differently: here it applies `join-thread` to every real
  thread object in `threads`, in order, collecting each thread's own real
  partial sum into the `partials` list.
- **`join-thread`** — already given full treatment in Concept Unit 1;
  called once per real thread here, retrieving each one's own real
  `sequential-sum` result.
- **`apply`** — already given full treatment above in *Objects and
  methods used*; called on `+` and `partials`, combining however many real
  partial sums `partials` turns out to hold into the one final answer.

### CS Lens

`parallel-sum` is a hard concept in its own right: *fork-join
parallelism* — splitting one computation into independent pieces that run
concurrently (the "fork"), then waiting for every piece to finish before
combining their results (the "join"). Also recognized in: real parallel
sorting algorithms that fork into independent sub-sorts before joining
with a merge step; a real compiler's own multi-file build, compiling
independent source files concurrently before linking them together; a
real distributed web-crawling system, fetching many independent pages at
once before combining what each one found; any real "fan out, then fan
in" data-processing pipeline, from spreadsheet formula engines to
distributed machine-learning training runs that split a batch across
devices before averaging their results back together.

### SE Lens

The design choice here is combining every real partial sum only *after*
every real thread has finished — a strict join, with no partial combining
along the way. A real alternative not chosen: combining partial results
incrementally, as each thread finishes, rather than waiting for all of
them together (sometimes called a *reduction tree*, combining pairs of
results as they become available). The real tradeoff: an incremental
combine can start real work sooner when threads finish at different real
times, but it needs real coordination — some way to safely combine a
result as it arrives without two threads trying to combine at the same
real moment — that this lesson's simple "wait for everyone, then `apply
+`" approach avoids entirely, at the cost of the slowest single thread
setting a real floor under the whole computation's total real time. The
real cost this project is now carrying: if chunks were ever genuinely
uneven in cost, one slow thread would leave every other thread's own real
core sitting idle for however long that one thread still had left.

### Commands Needed

One real terminal command, run once, to confirm — not merely assert — why
this unit's own measured speedup levels off rather than continuing to
grow all the way to ten threads:

```
$ sysctl -n machdep.cpu.brand_string
Apple M4
$ sysctl hw.perflevel0.physicalcpu hw.perflevel1.physicalcpu
hw.perflevel0.physicalcpu: 4
hw.perflevel1.physicalcpu: 6
```

`sysctl` is a real macOS command-line tool that reads and reports the
operating system's own internal configuration values; `-n` prints just the
requested value, with no name prefix. `machdep.cpu.brand_string` reports
this real machine's actual processor model. `hw.perflevel0.physicalcpu`
and `hw.perflevel1.physicalcpu` report, separately, how many of this
chip's real cores belong to each of its two real speed tiers —
`perflevel0` for the fastest, real *performance* cores, `perflevel1` for
the real, more power-efficient *efficiency* cores introduced in this
lesson's own Terms glossary above.

### Run It

The real, full-scale measurement this entire lesson has been building
toward — summing `heavy-square` over one million real elements, once
sequentially and four times in parallel, at four different real thread
counts:

```scheme
(define N 1000000)
(define nums (iota N))
(time-and-report "sequential-sum" (lambda () (sequential-sum nums)))
(time-and-report "parallel-sum(2)" (lambda () (parallel-sum nums 2)))
(time-and-report "parallel-sum(4)" (lambda () (parallel-sum nums 4)))
(time-and-report "parallel-sum(8)" (lambda () (parallel-sum nums 8)))
(time-and-report "parallel-sum(10)" (lambda () (parallel-sum nums 10)))
```

Run for real, this produces:

```
sequential-sum: 333332833533500000 in 18.766429 seconds
parallel-sum(2): 333332833533500000 in 10.419522 seconds
parallel-sum(4): 333332833533500000 in 7.659191 seconds
parallel-sum(8): 333332833533500000 in 6.957595 seconds
parallel-sum(10): 333332833533500000 in 7.036652 seconds
```

Every single real run — sequential and all four parallel versions —
produced the exact same real answer, `333332833533500000`, exactly the
guarantee associativity makes: however this reduction gets grouped,
sequentially or split across real threads, the real result cannot change.
What genuinely does change is the real time each version took. Dividing
the sequential time by each parallel time gives this lesson's real,
measured **speedup**:

- Two threads: `18.766429 / 10.419522`, a real **1.801×** speedup.
- Four threads: `18.766429 / 7.659191`, a real **2.450×** speedup.
- Eight threads: `18.766429 / 6.957595`, a real **2.697×** speedup — the
  best real result this lesson measured.
- Ten threads: `18.766429 / 7.036652`, a real **2.667×** speedup — very
  slightly worse than eight threads, despite two more real threads.

This is not a mistake to explain away: it is real, honest evidence that
`current-processor-count`'s own `10` was never the whole story. Real
speedup keeps growing through eight threads here, not stopping cleanly at
four — a genuinely different shape than a naive "one performance core per
thread" story would predict — and even the dip from eight threads to ten
is small, not the sharp regression a cleaner demonstration might show.
What stays true throughout, and is the real point: speedup never gets
anywhere close to a full `8×` or `10×`, even at eight or ten real threads,
and it visibly slows down well before reaching double digits. The
`sysctl` check above confirms exactly why a ceiling exists at all — this
real machine, an Apple M4, has only `4` real performance cores among its
`10` total. Every thread beyond four is either genuinely sharing time on
one of the six real, slower efficiency cores, or paying real
thread-creation and scheduling overhead that a purely sequential run
never has to pay at all. Exactly where that real cost outweighs the real
benefit — cleanly at four threads, or gradually across four to ten, as it
does on this specific run — is itself subject to real, honest
run-to-run variance on a shared, multi-process operating system, not a
fixed property of this code. `current-processor-count` told the honest
truth about how many real cores exist; it never claimed they were all
equally fast, and this real, measured data — however its exact shape
varies from run to run — is the proof that distinction matters.

### Connect to What Came Before

Concept Unit 1's real `10` set an honest ceiling on how many threads this
program could even attempt. Concept Unit 2's real, verified `chunk-list`
made splitting the real work trustworthy. Concept Unit 3's real
`time-and-report` made the real payoff measurable in seconds a person
actually experiences, not algorithmic steps. This unit spent all three,
together, on the identical real reduction this lesson opened by
questioning — and the real answer is not "parallel is always faster," it
is the more honest one this curriculum has favored throughout: real
speedup exists, real speedup has a real shape determined by real
hardware, and knowing that shape, not just assuming it, is what this
lesson's whole measurement was actually for.

---

## Closing

### Connect the Pieces

Follow one real chunk, and one real number, through every unit this
lesson built. `nums` is `(iota 1000000)` — a real list from `0` up to
`999999`, built once in Concept Unit 4's Run It. Calling `(parallel-sum
nums 4)` first calls `(chunk-list nums 4)`, from Concept Unit 2, which
splits `nums` into four real, equal, `250000`-element chunks — exactly
what Concept Unit 2's own last Run It check already confirmed for real,
before this lesson ever reached Concept Unit 4. Each of those four real
chunks is wrapped in a `lambda` and handed to `call-with-new-thread`, from
Concept Unit 1, which starts four genuinely independent real threads —
proven, back in Concept Unit 1's own isolated lab, to return correctly
matched, independent real results rather than mixed-up ones. Every real
thread runs `sequential-sum` on its own chunk, calling `heavy-square` on
each of that chunk's `250000` real elements — the same `heavy-square`
whose own uniform, 200-step loop was traced by hand on `0`, `1`, and `2`
in Concept Unit 4. `join-thread`, also from Concept Unit 1, waits for each
real thread and retrieves its own real partial sum; `apply +` combines
all four into the identical real answer, `333332833533500000`, the
sequential version also produces — because ordinary `+` is genuinely
associative, the one fact every other unit in this lesson depended on
without re-proving it. Wrapping the whole call in `time-and-report`, from
Concept Unit 3, is what turned "the answer is correct" into "the answer
is correct, and it arrived in `7.659191` real seconds instead of
`18.766429` — a real, measured `2.450×` speedup this lesson can actually
defend."

### What Breaks Without This

The whole technique this lesson built — cut the input into chunks,
process each chunk independently, then combine the partial results —
depends entirely on the combining operation genuinely being associative.
Here is what happens, for real, when it isn't: `heavy-sub`, a variant of
`heavy-square` that subtracts instead of adds, and `sequential-sub-reduce`,
which reduces a list with real, ordinary left-to-right subtraction instead
of addition.

```scheme
(define small-nums (iota 8 1))
(define (sequential-sub-reduce lst)
  (let loop ((rest lst) (acc 0))
    (if (null? rest)
        acc
        (loop (cdr rest) (- acc (car rest))))))

(display small-nums)
(newline)
(display (sequential-sub-reduce small-nums))
(newline)
```

Run for real, this produces:

```
(1 2 3 4 5 6 7 8)
-36
```

The real, correct, left-to-right answer is `-36` — `0 - 1 - 2 - 3 - 4 - 5
- 6 - 7 - 8`, computed strictly in order. Now apply this lesson's own
`chunk-list`, unchanged, and combine the real partial results the exact
same way `parallel-sum` combines its own — with `apply` on the combining
operation:

```scheme
(define (parallel-sub-reduce lst k)
  (let* ((chunks (chunk-list lst k))
         (threads (map (lambda (chunk)
                          (call-with-new-thread
                           (lambda () (sequential-sub-reduce chunk))))
                        chunks))
         (partials (map join-thread threads)))
    (apply - 0 partials)))

(display (chunk-list small-nums 2))
(newline)
(display (parallel-sub-reduce small-nums 2))
(newline)
```

Run for real, this produces:

```
((1 2 3 4) (5 6 7 8))
36
```

`36` — not merely a different number from `-36`, but its exact real
opposite, the wrong sign entirely. `chunk-list` split `small-nums`
correctly, exactly as it did throughout this whole lesson; the real bug is
entirely in trusting the *combine* step to work the same way regardless of
which operation is being reduced. The first real chunk, `(1 2 3 4)`,
reduces to a real `-10`; the second, `(5 6 7 8)`, reduces to a real `-26`.
Combining those two real partials with `(apply - 0 partials)` computes `0
- (-10) - (-26)`, which is `36` — because subtraction is not associative,
splitting the input changed which real groupings of the original
subtractions actually got computed, and that changed the real answer.
Nothing here is a coding mistake in the ordinary sense; `chunk-list`,
`call-with-new-thread`, and `join-thread` all did exactly what this lesson
already proved they do. The real lesson is that this entire technique —
every unit built in this file — is only ever safe to use on an operation
this curriculum has actually proven is associative first. `+` earned that
trust; ordinary subtraction never had it.

### Exercises

- Change `parallel-sum`'s own call from `k = 4` to `k = 3` or `k = 6`, and
  measure the real speedup with `time-and-report`, the same way Concept
  Unit 4 measured `2`, `4`, `8`, and `10`. Does an odd or uneven thread
  count change how evenly `chunk-list` splits the real work?
- Change `heavy-square`'s own inner loop count from `200` to a much
  smaller number, like `5`, and re-measure `sequential-sum` versus
  `parallel-sum(4)` on the full `1000000`-element list. Does real speedup
  shrink, stay the same, or disappear entirely as each element's own real
  cost drops? Explain the real result using this lesson's own honest
  explanation of overhead.
- Write `parallel-max`, following `parallel-sum`'s own real shape exactly,
  but combining chunks with `max` instead of `+`. Confirm, for real, that
  it produces the identical answer to a plain sequential `max`-reduction
  over the same list — real evidence that this technique generalizes to
  any operation that is genuinely associative, not just addition
  specifically.
- Using this lesson's own `sysctl` check as a model, find how many real
  performance cores and real efficiency cores your own machine has (or
  confirm it has only one real core type), and predict, before measuring,
  at what real thread count you'd expect `parallel-sum`'s own speedup to
  stop growing. Then measure it for real and compare.

### Definition of Done

- [ ] `parallel-reduction.scm` exists and, run with `guile
      parallel-reduction.scm`, reports a real processor count, and defines
      `chunk-list`, `time-and-report`, `heavy-square`, `sequential-sum`,
      and `parallel-sum` with no errors.
- [ ] `(chunk-list (iota 7) 3)` produces `((0 1 2) (3 4 5) (6))` on your
      own machine, matching this lesson's own real, traced output.
- [ ] `(time-and-report "trivial-add" (lambda () (+ 1 2)))` prints a real
      result of `3` alongside a real, non-zero elapsed time.
- [ ] Running this lesson's own full capstone measurement — `sequential-sum`
      and `parallel-sum` at `k = 2, 4, 8, 10` over `(iota 1000000)` —
      produces the identical real answer every time, and at least one real
      parallel time faster than the real sequential time.
- [ ] The real "What Breaks" section was actually run, producing `-36` for
      the sequential subtraction-reduce and `36` — the wrong sign — for
      the naively parallelized version.
- [ ] `git commit` the finished file, with a message explaining *why* this
      lesson exists — for example: "Measure, in real seconds, what
      associativity actually buys on real hardware, and prove the same
      technique breaks silently on an operation that isn't associative" —
      not merely restating what the code does.

**Next lesson: Lesson 175 — Semirings**, generalizing arithmetic-like
structures beyond plain numeric addition and multiplication.
