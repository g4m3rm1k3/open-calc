# Lesson 210: Scheduling

- **What you will build** — a real round-robin scheduler that rotates a
  ready queue and provably returns to its original order after one full
  cycle, a priority scheduler that always picks the most important ready
  entry, and a concrete, honest demonstration of starvation — a real,
  well-known failure where priority scheduling alone can leave a
  perfectly legitimate process waiting forever. The transferable
  problem: Lesson 202's own `find-runnable` answered "is anything ready
  to run" by returning the *first* ready process it found and stopping
  there — deliberately left open as "a much harder real question:
  *which* one should actually run next, when several qualify." This
  lesson is that question, and its own honest, real answer: there is no
  single correct policy, only different, real tradeoffs.
- **What you need to know first** — `process-status`, `process-runnable?`,
  `find-runnable` (Lesson 202); `append-lists` (Lesson 208); `nil?`
  (Lesson 136); `>` (Section I).
- **Terms introduced in this lesson**
  - **scheduling** — the real policy question Lesson 202 deliberately
    left open: given several processes able to run, which one actually
    gets the CPU next?
  - **round-robin** — a scheduling policy: give each ready process a
    turn, in a fixed rotation, cycling back to the start once everyone's
    had one.
  - **priority scheduling** — a scheduling policy: always run whichever
    ready process is marked most important, regardless of how long
    anything else has been waiting.
  - **starvation** — a real, named failure: a process that is ready to
    run, and stays ready, but is never actually chosen, because
    something else is always judged more deserving.
- **Objects and methods used**: None new. This lesson reuses `[...]`,
  `get` (Section V), `append-lists` (Lesson 208), `if`, `=`, `>`,
  `empty?`, `first`, `rest`, `nil?` (already covered).

---

## Concept Unit: Round-Robin

### The Problem

`find-runnable` (Lesson 202) always returns the *first* ready process in
its list — every single time it's called. If that process stays ready
(it hasn't finished, just yielded its turn), every other ready process
behind it never gets picked at all.

### Introduce the Concept in Isolation

Skipped — this unit reuses Lesson 208's own `append-lists` directly on
already-covered lists; nothing syntactic here is new.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 202's process-lifecycle work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

**Round-robin** picks whoever's at the front of the queue, and moves them
to the *back* before returning — so the next call picks someone new:

```clojure
(defn round-robin-next
  [ready-queue]
  (round-robin-result (first ready-queue) (rest ready-queue)))
```

```clojure
(defn round-robin-result
  [chosen rest-queue]
  [chosen (append-lists rest-queue (list chosen))])
```

### The Updated Project

This is a freestanding pair of new functions with nothing enclosing them
yet — Project Change already covers this case.

### Mechanical Walkthrough

Enumerating `round-robin-next`'s and `round-robin-result`'s bodies:
`(first ready-queue)`, `(rest ready-queue)` — **(c) already basic**. `[chosen (append-lists rest-queue (list chosen))]` — **(a) first
appearance**: the chosen process doesn't disappear — it goes to the very
back of the *new* queue, guaranteeing it will eventually come back around.

Trace `round-robin-next` called three times in a row on a three-entry
queue, `(1 2 3)` — plain PIDs standing in for full process records, to
keep the rotation itself easy to see:

```
round-robin-next (1 2 3) → chosen 1, new queue (2 3 1)
round-robin-next (2 3 1) → chosen 2, new queue (3 1 2)
round-robin-next (3 1 2) → chosen 3, new queue (1 2 3)
```

After exactly three calls — the same number of entries the queue
started with — every one of them has been chosen exactly once, and the
queue is back in its *original* order, `(1 2 3)`. This is round-robin's
own real guarantee, provable directly from its own rotation: no ready
process can ever wait more than one full cycle for its turn.

### CS Lens

Rotating through a fixed set of contenders, giving each a turn in a
predictable cycle, is a real, standard, widely used scheduling policy.

```
Also recognized in: real, actual operating-system schedulers using
round-robin, by that exact name, as one of the most common real
scheduling policies in production use; time-division multiplexing in
networking, the identical fairness-through-rotation idea applied to
sharing bandwidth instead of CPU time; and Lesson 194's own `first-fit`
— both are named, deliberate *policies*, not merely mechanisms, chosen
for specific, statable tradeoffs rather than being the only option
available
```

### SE Lens

Always running whichever process happens to be first — exactly Lesson
202's own `find-runnable`, completely unmodified — was the available
alternative, and it needs no rotation logic at all. Its real cost:
anything sitting behind a process that stays ready indefinitely never
gets to run, full stop. Round-robin, built here, guarantees every ready
process a turn within one full cycle, at the real cost of the rotation
bookkeeping itself, and a real tradeoff the next unit takes seriously:
every process gets treated as equally important, whether or not that's
actually true.

---

## Concept Unit: Priority Scheduling

### The Problem

Round-robin treats every ready process identically. Real work often
isn't equally important — some of it is genuinely more urgent than the
rest. Should the more urgent process really have to wait its turn in a
strict rotation?

### Introduce the Concept in Isolation

Skipped — this unit's comparison is plain `>` on already-covered values;
the real content is the policy itself, demonstrated directly below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `round-robin-result`.
- **Dependencies**: Babashka, already installed.

### The New Code

A scheduling entry pairs a PID with a **priority** — higher means more
urgent:

```clojure
(defn entry-pid [entry] (get entry 0))
(defn entry-priority [entry] (get entry 1))
```

### The Updated Project

**Priority scheduling** always picks whichever entry has the highest
priority, regardless of position in the list:

```clojure
(defn highest-priority
  [entries]
  (if (empty? (rest entries))
    (first entries)
    (highest-priority-compare (first entries) (highest-priority (rest entries)))))
```

```clojure
(defn highest-priority-compare
  [entry best-of-rest]
  (if (> (entry-priority entry) (entry-priority best-of-rest))
    entry
    best-of-rest))
```

### Mechanical Walkthrough

`entry-pid`'s and `entry-priority`'s bodies — **(c) already basic**.

`highest-priority`'s and `highest-priority-compare`'s bodies — **(b) a
hard concept reappearing**: the same "find the best one" recursive
comparison shape as Lesson 112's own divide-and-conquer maximum, applied
to priority instead of raw value.

Trace `highest-priority` on `([1 5] [2 9] [3 3])` — PID `1` at priority
`5`, PID `2` at priority `9`, PID `3` at priority `3`:

```
highest-priority ([1 5] [2 9] [3 3])
  → compare [1 5] against (highest-priority ([2 9] [3 3]))
      → compare [2 9] against (highest-priority ([3 3]))
          → rest empty → return [3 3]
      → compare [2 9] vs [3 3]: 9 > 3 → [2 9]
  → compare [1 5] vs [2 9]: 5 > 9? no → [2 9]

→ [2 9]
```

PID `2`, priority `9`, wins — position in the list never mattered at
all, unlike round-robin, where position was the *entire* mechanism.

### CS Lens

Always favoring the most urgent ready work, regardless of arrival order,
is a real, standard scheduling family with real, legitimate uses.

```
Also recognized in: real, actual priority-based operating-system
schedulers, a genuinely used scheduling family; real-time systems, where
some tasks genuinely must preempt others to meet real timing deadlines,
a legitimate reason priority scheduling exists at all, not merely
favoritism; and emergency-room triage, a real, non-computing analog of
the identical idea — treat the most critical case first, regardless of
who arrived first
```

### SE Lens

Round-robin's own strict fairness, built in the first unit, was the
available alternative — appropriate exactly when nothing genuinely is
more urgent than anything else. Priority scheduling, built here,
correctly favors truly urgent work when that urgency is real. Its real,
honest cost is the entire subject of the next unit: nothing about
`highest-priority` guarantees a lower-priority entry is ever chosen at
all, as long as something higher keeps outranking it.

---

## Concept Unit: Starvation

### The Problem

`highest-priority` never removes or demotes anyone — it just reports the
best entry currently present. What happens to a low-priority entry that
never becomes the best one?

### Introduce the Concept in Isolation

Skipped — this unit runs `highest-priority` again, already fully
covered, against the same unchanged list; nothing syntactic is new.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only a repeated call.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Call `highest-priority` against the identical, unchanged entry list,
repeatedly:

```clojure
(highest-priority (list [1 5] [2 9] [3 3]))
```

### The Updated Project

Skipped — no enclosing file exists yet; this is the same call, run more
than once at the `bb` REPL.

### Mechanical Walkthrough

The call itself — **(c) already basic**, already traced in the second
unit. The real content is what running it *again*, and again, against
the same list, actually proves: `highest-priority` is a pure function of
its input, already established since Lesson 1 — the same input always
produces the same output. As long as PID `1` (priority `5`) and PID `2`
(priority `9`) remain in the pool, `highest-priority` returns `[2 9]`
*every single time*, with absolutely no mechanism anywhere in this
lesson's own code that could ever cause PID `3` (priority `3`) to win,
no matter how many times it's called, no matter how long PID `3` has
been sitting there ready. **This is called starvation.**

Contrast this directly with round-robin's own guarantee from the first
unit: after at most three calls, *every* entry in a three-entry queue is
guaranteed a turn. Priority scheduling offers no such bound at all —
PID `3` could wait indefinitely, for as long as anything with a higher
priority keeps being present.

### CS Lens

A process that stays ready but is never actually chosen is a real, named
failure mode in scheduling theory, not a hypothetical worst case.

```
Also recognized in: the real, standard term "starvation," used
identically in operating-systems literature; real, documented incidents
in production systems using naive priority scheduling, where low-
priority but legitimate work waited far longer than acceptable; and the
real, standard fix — "priority aging," gradually raising a waiting
process's effective priority the longer it waits, eventually forcing it
to win — a real technique this lesson doesn't build, deliberately left
as an honest extension beyond this lesson's own scope
```

### SE Lens

Shipping priority scheduling with no starvation protection at all —
exactly what this unit built — is genuinely simpler, and correctly
favors urgent work most of the time. Its real, demonstrated cost: a
legitimate process can wait forever, for a reason that has nothing to do
with anything being wrong with it — only with something else always
being judged more important. Real schedulers almost universally add some
fairness mechanism on top of pure priority — aging, or hybrid designs
combining round-robin *within* each priority level — an implicit
admission that priority scheduling alone, exactly as built in this
lesson's second unit, is too dangerous to ship unmodified.

---

## Connect the Pieces

Follow three processes, PIDs `1`, `2`, and `3`, through both scheduling
policies this lesson built. Under round-robin, `round-robin-next`
guarantees every one of them a turn within three calls, provably
returning the queue to its original order once each has run exactly
once. Under priority scheduling, with priorities `5`, `9`, and `3`
respectively, `highest-priority` picks PID `2` every single time it's
called, for as long as PIDs `1` and `2` remain in the pool — PID `3`
never wins, not once, no matter how many times the schedule is
consulted. Neither policy is more "correct" than the other; they answer
genuinely different real questions — "does everyone eventually get a
turn" against "is the most urgent thing always running" — and this
lesson's own two demonstrations prove neither policy can honestly answer
both at once.

## What Breaks Without This

Round-robin's entire fairness guarantee depends on actually moving the
chosen process to the back of the queue. Forget that one step:

```clojure
(defn round-robin-next-broken
  [ready-queue]
  [(first ready-queue) ready-queue])
```

Trace it against the same three-entry queue, `(1 2 3)`, called
repeatedly:

```
round-robin-next-broken (1 2 3) → chosen 1, queue unchanged: (1 2 3)
round-robin-next-broken (1 2 3) → chosen 1, queue unchanged: (1 2 3)
round-robin-next-broken (1 2 3) → chosen 1, queue unchanged: (1 2 3)
```

Every single call returns PID `1`, forever — the queue never actually
rotates, because nothing about `round-robin-next-broken` ever changes
it. PIDs `2` and `3` are still sitting right there in the queue, exactly
as ready as PID `1` ever was, and neither will ever be chosen. This is
not a different, smaller bug from the third unit's own starvation — it
is the *exact same failure*, reached by a completely different route: a
"round-robin" scheduler that forgot to actually rotate has silently
degraded into a priority scheduler with a fixed, permanent priority
order, and every one of that policy's own real dangers now applies to
code that was written, and named, specifically to avoid them. Nothing
about `round-robin-next-broken`'s own shape looks obviously wrong — it
still takes a queue, still returns a chosen process, still looks like a
scheduler. The single missing step, moving the chosen entry to the back,
was the entire fairness guarantee this lesson's first unit spent an
entire trace proving.

## Exercises

1. Trace `round-robin-next` four more times starting from `(1 2 3)`, past
   the point where it first returns to its original order, and confirm
   the *same* rotation pattern repeats exactly.
2. Using `highest-priority`, trace what happens to the result if a
   *fourth* entry, `[4 10]`, is added to the pool alongside the original
   three — state which PID wins now, and what this implies about how
   quickly a starving process's wait could get even longer under real,
   ongoing priority scheduling.
3. Sketch, in prose, what a simple priority-aging fix would need to do to
   `highest-priority` — given how long each entry has been waiting, how
   might its *effective* priority be computed differently from its own
   fixed, stated priority? No code required yet.

## Definition of Done

- [ ] `round-robin-next` and `round-robin-result` are written and
      hand-traced for three consecutive calls, matching this lesson's
      full-cycle return to the original queue order.
- [ ] `entry-pid`, `entry-priority`, `highest-priority`, and
      `highest-priority-compare` are written and hand-traced, matching
      `[2 9]` as the winner.
- [ ] The starvation demonstration is understood well enough to explain,
      without notes, why calling `highest-priority` more times never
      changes the outcome for PID `3` as long as PIDs `1` and `2` remain.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the broken round-robin scheduler is not
      a smaller version of the starvation problem, but the identical
      failure reached a different way.
- [ ] Commit with a message explaining *why* no single scheduling policy
      in this lesson satisfies both fairness and urgency at once, not
      just *what* functions were added.
