# Lesson 193: Stack Frames

- **What you will build** — a push/pop pair grounded in Lesson 191's own
  memory model, a simulated function call and return that pushes and pops
  a real stack frame, and a concrete demonstration of a stack running out
  of room. The transferable problem: every recursive function this entire
  curriculum has ever written — starting with Lesson 20's very first one —
  has relied on some real mechanism remembering where to resume once each
  nested call finishes. Lesson 23 already named that mechanism informally,
  as a "call stack," to trace recursion by hand; this lesson builds the
  literal thing it was standing in for, out of nothing but memory and a
  pointer.
- **What you need to know first** — `write-byte`, `read-byte` (Lesson
  191); `deref`, pointer arithmetic (Lesson 192); the call stack (Lesson
  23) and the stack, LIFO order (Lesson 86) — both already given full
  treatment; this lesson grounds them concretely rather than reintroducing
  them.
- **Terms introduced in this lesson**
  - **stack pointer** — an address, held as a pointer, marking the
    current top of the stack; every push moves it, every pop moves it
    back, and it is the only thing that ever says "how much of this
    memory is currently in use."
  - **stack frame** — everything one function call needs remembered for
    the duration of that call — at minimum, where to resume once it
    returns — pushed together and popped together as one unit.
- **Objects and methods used**: None new. This lesson reuses `write-byte`,
  `read-byte` (Lesson 191), `[...]`, `get` (Section V), `if`, `-`, `+`,
  `=` (Section I), each already covered.

---

## Concept Unit: The Stack Pointer

### The Problem

Lesson 191's memory has no notion of "in use" versus "free" — every
address is just as valid to read or write as any other. A real stack
needs exactly that notion: some way to say "everything below this point
is live data; everything above it is free space waiting to be claimed."

### Introduce the Concept in Isolation

Skipped — a stack pointer is exactly Lesson 192's own pointer concept,
applied to one specific, recurring purpose; nothing syntactic here is
new, only the convention real hardware actually uses, demonstrated
directly in the real code below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 192's pointer work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Real hardware stacks grow *downward* — toward lower addresses, not
higher ones — so pushing a value means moving the stack pointer down one
slot *first*, then writing there:

```clojure
(defn push
  [memory sp value]
  [(write-byte memory (- sp 1) value) (- sp 1)])
```

### The Updated Project

Popping reverses it exactly: read whatever's at the current top, then
move the pointer back up past it — the memory itself is never erased,
only no longer considered part of the live stack:

```clojure
(defn pop-value
  [memory sp]
  [(read-byte memory sp) (+ sp 1)])
```

### Mechanical Walkthrough

Enumerating `push`'s body:

- `(- sp 1)` — **(a) first appearance**: the stack pointer moves *before*
  the write happens, and *downward* — this specific direction and
  ordering is the real, standard convention, not an arbitrary choice.
- `write-byte memory (- sp 1) value` — **(c) already basic**, Lesson 191;
  writes at the new, lower address.
- `[(write-byte ...) (- sp 1)]` — **(c) already basic** as syntax (the
  familiar vector-as-pair), returning both the updated memory and the
  updated stack pointer together, since neither one alone tells the whole
  story of what changed.

Enumerating `pop-value`'s body:

- `read-byte memory sp` — **(c) already basic**; reads whatever the
  *current* top of the stack holds, before the pointer moves.
- `(+ sp 1)` — **(a) first appearance**: moving the pointer back
  *upward*, past the slot just read — the exact reverse of `push`'s own
  downward move.

Trace one push and one pop, round-tripping a single value, on
`(make-memory 8)` with `sp` starting at `8` — one past the highest valid
address, meaning "the stack is currently empty":

```
push (make-memory 8) 8 99
  → write-byte memory 7 99 → [0 0 0 0 0 0 0 99]
  → new sp = 7
  → [[0 0 0 0 0 0 0 99] 7]

pop-value [0 0 0 0 0 0 0 99] 7
  → read-byte memory 7 → 99
  → new sp = 8
  → [99 8]
```

The stack pointer returns to exactly `8`, its starting value, and the
popped value, `99`, matches exactly what was pushed — a clean round trip,
with the memory itself never having to be cleaned up or reset.

### CS Lens

A stack pointer is Lesson 86's abstract "top of stack" idea, given a
literal, physical meaning: a real memory address, not just an informal
notion of "the most recently added item."

```
Also recognized in: real CPU registers dedicated to exactly this
purpose — `ESP`/`RSP` on x86, `SP` on ARM — holding this address at all
times during a running program; every compiled language's function-call
mechanism, which manipulates this exact register on every single call and
return; and the abstract stack ADT (Lesson 86) itself, now grounded in
what "top of stack" concretely *is* at the hardware level
```

### SE Lens

A stack that grows *upward* instead of downward was the available
alternative, and it's arguably simpler to reason about at first — no
need to remember that "lower" means "more full." Real hardware
overwhelmingly grows the stack downward instead, for a real, documented
reason: it lets the stack and the heap (Lesson 194) grow toward each
other from opposite ends of the same shared address range, using one
region efficiently instead of needing two separately reserved, fixed-size
blocks. The cost of that choice is exactly the subtlety just named —
every address arithmetic decision involving the stack has to remember
which direction "growing" actually points.

---

## Concept Unit: Calling and Returning

### The Problem

A single pushed value isn't a real function call — a call needs to
remember more than one thing at once, at minimum where to resume once
it's done, and needs all of it to disappear together the moment the call
returns, not one piece at a time.

### Introduce the Concept in Isolation

Skipped — a stack frame is `push` called more than once in a row, all
functions already covered; the real demonstration below, simulating an
actual nested call, is the substance of this unit.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `pop-value`.
- **Dependencies**: Babashka, already installed.

### The New Code

A call pushes two things as one **stack frame**: where to resume
afterward, and whatever argument the call needs — the return address
pushed first, so it ends up *underneath* the argument, popped last:

```clojure
(defn call
  [memory sp return-address argument]
  (call-push-argument (push memory sp return-address) argument))
```

```clojure
(defn call-push-argument
  [pushed argument]
  (push (get pushed 0) (get pushed 1) argument))
```

### The Updated Project

Returning pops the same frame back off, in the opposite order it went on
— argument first, then the return address it was sitting on top of:

```clojure
(defn return-from-call
  [memory sp]
  (return-pop-address memory (pop-value memory sp)))
```

```clojure
(defn return-pop-address
  [memory popped-argument]
  (pop-value memory (get popped-argument 1)))
```

### Mechanical Walkthrough

Enumerating `call`'s and `call-push-argument`'s bodies:

- `push memory sp return-address` — **(c) already basic**, the first
  unit's own function, pushing the return address first.
- `call-push-argument` receiving that whole `[memory sp]` pair — **(b) a
  hard concept reappearing**: "compute once, pass to a helper," the same
  discipline named repeatedly since Section III.
- `push (get pushed 0) (get pushed 1) argument` — **(c) already basic**;
  pushes the argument on top of the return address just pushed.

Enumerating `return-from-call`'s and `return-pop-address`'s bodies:

- `pop-value memory sp` — **(c) already basic**; pops whatever's
  currently on top — the argument, since it was pushed last.
- `return-pop-address memory ...` — **(b) a hard concept reappearing**,
  the same compute-once-pass-to-helper discipline.
- `pop-value memory (get popped-argument 1)` — **(c) already basic**;
  pops again, now reaching the return address underneath.

Trace **two nested calls** — simulating a recursive call happening
*before* the first one returns, exactly the shape every recursive
function in this curriculum has always relied on — starting from
`(make-memory 8)`, `sp = 8`:

```
call memory 8 100 5
  push memory 8 100    → sp 7, addr 7 = 100 (return address)
  push ...    7 5      → sp 6, addr 6 = 5   (argument)
  → [[0 0 0 0 0 0 5 100] 6]

call (that memory) 6 200 4     ← the nested call, before the first returns
  push ... 6 200        → sp 5, addr 5 = 200 (inner return address)
  push ... 5 4          → sp 4, addr 4 = 4   (inner argument)
  → [[0 0 0 0 4 200 5 100] 4]
```

Two full frames now sit on the stack — the outer call's, at addresses `7`
and `6`, and the inner call's, at addresses `5` and `4`. Returning has to
happen in the *opposite* order calls were made — the inner call first:

```
return-from-call memory 4
  pop-value memory 4 → argument 4, sp 5      (inner argument popped)
  pop-value memory 5 → return-address 200, sp 6
  → [200 6]
```

`return-from-call` recovers `200` — the *inner* call's own return
address — and restores `sp` to exactly `6`, precisely where it was right
before the inner call started. The outer frame, at addresses `7` and `6`,
is completely untouched, still there, ready for the outer call to return
from later, whenever it does. This is exactly why nested — and
recursive — calls work at all: the stack enforces last-in-first-out
order (Lesson 86's own LIFO) automatically, just by which address happens
to be on top.

### CS Lens

A stack frame holding everything one call needs, pushed and popped as one
unit, is the real, standard mechanism behind function calls in every
compiled language, not a simplification built only for this lesson.

```
Also recognized in: the term "stack frame" (or "activation record")
itself, used identically in every real compiler and debugger; a
debugger's own call-stack view, letting a programmer step through exactly
the frames this unit's trace built by hand; and — the reason this whole
lesson exists — literally every recursive function this curriculum has
ever written, from Lesson 20 onward, each one relying on precisely this
push-a-frame, pop-a-frame mechanism to know where to resume once each
nested call finishes
```

### SE Lens

An alternative exists: manage pending work explicitly, on the heap
(Lesson 194), instead of the hardware call stack — a real, documented
technique sometimes called a trampoline, used specifically to avoid
consuming stack frames for very deep recursion. The hardware call stack,
built in this unit, is fast and needs no separate bookkeeping structure —
`push` and `pop-value` are cheap, direct memory operations. An explicit,
heap-managed work list can grow far larger, bounded only by however much
heap memory exists rather than one small, dedicated stack region — at the
real cost of needing genuine memory allocation and management overhead
for every single pending call, instead of two decrements and two writes.

---

## Concept Unit: Running Out of Stack

### The Problem

`(make-memory 8)` is only eight slots, and the previous unit's trace
already used four of them for two frames. What actually happens once
frames keep going and the stack has nowhere left to grow?

### Introduce the Concept in Isolation

Skipped — the real code below is nothing more than repeated `call`s, all
already covered; the point of this unit is the concrete boundary it
crosses, not a new construct.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `return-pop-address`.
- **Dependencies**: Babashka, already installed.

### The New Code

Pushing `n` frames in a row, one nested call at a time, with no return in
between — deliberately never stopping to unwind, the same shape as a
recursive function that never reaches its base case:

```clojure
(defn push-n-frames
  [memory sp n]
  (if (= n 0)
    [memory sp]
    (push-n-frames-continue (call memory sp 999 n) n)))
```

### The Updated Project

```clojure
(defn push-n-frames-continue
  [pushed n]
  (push-n-frames (get pushed 0) (get pushed 1) (- n 1)))
```

### Mechanical Walkthrough

Enumerating `push-n-frames`'s and `push-n-frames-continue`'s bodies:

- `(= n 0)`, `[memory sp]` — **(c) already basic**; the base case, once
  the requested number of frames has actually been pushed.
- `call memory sp 999 n` — **(c) already basic**, this lesson's own
  second unit; `999` stands in for a return address, unused by this
  demonstration on purpose — the point is only ever how many frames fit,
  not what any of them would resume at.
- `push-n-frames-continue` receiving the pushed pair whole — **(b) a hard
  concept reappearing**, compute-once-pass-to-helper again.

Trace `push-n-frames` on `(make-memory 8)`, `sp = 8`, `n = 5` — five
frames, needing ten slots, into a memory with only eight:

```
n=5, sp=8: call pushes at 7, 6 → sp 6
n=4, sp=6: call pushes at 5, 4 → sp 4
n=3, sp=4: call pushes at 3, 2 → sp 2
n=2, sp=2: call pushes at 1, 0 → sp 0
n=1, sp=0: call attempts to push at (- 0 1) = -1
```

`write-byte memory -1 999` is `(assoc memory -1 999)` — and `assoc` on a
vector, unlike `get`, does not tolerate an invalid index: it throws a
real `IndexOutOfBoundsException` the instant address `-1` is attempted,
not sometime later. Four frames — eight slots — exactly filled this
memory with no room to spare; the fifth frame's very first push is where
this **stack** — Lesson 86's own term, now grounded in a real, physically
bounded region of memory — genuinely runs out of room. This is precisely
what Lesson 184's own closing section reasoned about, by hand, for a
recursion that never reached its base case: this unit shows exactly where
that failure physically comes from — not a mysterious runtime limit, but
a real, fixed-size block of memory with an address boundary a stack
pointer can be pushed straight past.

### CS Lens

Running a fixed-size stack past its own boundary is a real, well-known,
consequential failure — not a corner case invented for this lesson.

```
Also recognized in: the literal `StackOverflowError` (or platform
equivalent) any reader has likely already hit in some real language's
runtime, caused by exactly this — too many nested calls, too little
reserved stack space; and, historically, stack-smashing buffer overflow
vulnerabilities, where deliberately overflowing a stack's bounds was used
to corrupt adjacent memory and hijack a running program's control flow —
a real, well-documented, historically significant class of security
vulnerability
```

### SE Lens

Reserving a much larger stack region so this "never" happens in practice
is a real option, and real operating systems do reserve a generous
default (commonly a few megabytes per running program). But no fixed
size ever truly eliminates the problem — deep enough or genuinely
non-terminating recursion will eventually exhaust *any* fixed reservation,
which is exactly why real language runtimes turn this into a clean,
catchable, named failure (Lesson 184's `StackOverflowError`) instead of
letting it silently corrupt whatever memory happens to sit past the
boundary. This unit's own `IndexOutOfBoundsException`, thrown the instant
address `-1` is touched rather than allowing the write to happen, is the
same design choice: fail loudly and immediately at the boundary, never
silently past it.

---

## Connect the Pieces

Follow one nested call-and-return pair through the exact mechanism every
recursive function in this curriculum has depended on. `call memory 8 100
5` pushes a frame at addresses `7` and `6`; before it returns, `call
memory' 6 200 4` pushes a second frame right on top, at `5` and `4` — two
live frames, LIFO order enforced by nothing more than which address is
currently on top. `return-from-call memory'' 4` pops the *inner* frame
first, recovering return address `200` and restoring `sp` to `6`,
leaving the outer frame completely untouched underneath it — exactly the
order real nested and recursive calls require. `push-n-frames`, pushing
that same kind of frame five times with no return in between, runs the
identical mechanism past its physical limit, hitting a real
`IndexOutOfBoundsException` at address `-1` — the concrete, physical
version of the exact failure Lesson 184 only reasoned about by hand,
several lessons ago, before this section had built a real stack to show
it happening in.

## What Breaks Without This

`call` pushes the return address *first*, so it ends up underneath the
argument — and `return-from-call` was written assuming exactly that
order, popping the argument before the return address. Swap which one
`call` pushes first, and leave `return-from-call` unchanged:

```clojure
(defn call-broken
  [memory sp return-address argument]
  (call-broken-push-return (push memory sp argument) return-address))
```

```clojure
(defn call-broken-push-return
  [pushed return-address]
  (push (get pushed 0) (get pushed 1) return-address))
```

Trace `call-broken memory 8 100 5`: pushes the *argument*, `5`, at
address `7` first, then the *return address*, `100`, at address `6` on
top of it — the reverse of before. Now call the original, unchanged
`return-from-call` on this memory:

```
return-from-call memory 6
  pop-value memory 6 → 100, sp 7      (this is really the return address,
                                        but return-from-call assumes it's
                                        the argument, and discards it)
  pop-value memory 7 → 5, sp 8        (this is really the argument, but
                                        return-from-call reports it as the
                                        return address)
  → [5 8]
```

`return-from-call` reports `5` as the return address — the *argument*,
mistaken for it — while the real return address, `100`, was silently
discarded as if it were nothing more than the argument. Nothing here
throws; `sp` even ends up back at the correct `8`. If a real program
then tried to resume execution at "address `5`," it would jump to a
completely unrelated, nonsensical location instead of correctly
resuming where the call actually happened — silent control-flow
corruption, not a crash. This is precisely why LIFO order (Lesson 86) is
not a minor implementation detail of `call` and `return-from-call`: the
two functions only agree on what each pushed value *means* because they
agree on the *order*. Restoring `call`'s original return-address-first
ordering is what keeps that agreement intact.

## Exercises

1. Trace `push` and `pop-value` by hand for two pushes in a row without
   any pop in between — `push` on `99`, then `push` on `77` — and confirm
   `pop-value` recovers `77` first, not `99`.
2. `push-n-frames` used `999` as a placeholder return address for every
   frame. Sketch, in prose, what a real caller would need to pass instead
   for each nested call to resume in the right place after returning — no
   code required yet.
3. This lesson's stack used two slots per frame (a return address and one
   argument). Trace by hand how many frames `(make-memory 8)` can hold
   before overflowing if each frame instead needed *three* slots, and
   state which frame's push fails and at exactly which address.

## Definition of Done

- [ ] `push` and `pop-value` are written and hand-traced for a single
      round-tripped value, matching this lesson's worked trace.
- [ ] `call`, `call-push-argument`, `return-from-call`, and
      `return-pop-address` are written and hand-traced for the two-nested-
      call example, matching the recovered `[200 6]`.
- [ ] `push-n-frames` and `push-n-frames-continue` are written and
      hand-traced for `n = 5` on `(make-memory 8)`, matching the
      `IndexOutOfBoundsException` at address `-1`.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `call-broken` combined with the
      original `return-from-call` corrupts the return address silently,
      with `sp` still ending up correct.
- [ ] Commit with a message explaining *why* the return address is pushed
      before the argument, not just *what* functions were added.
