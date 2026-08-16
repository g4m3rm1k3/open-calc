# Lesson 11: Engineering Tradeoffs

**What you will build.** A caching layer over Lesson 2's
`is_username_available`, that makes it measurably, dramatically faster —
and then, without touching a single line of the caching code again, a
real, reproduced bug where it confidently gives the wrong answer, simply
because the world underneath it changed after the answer was cached. The
transferable problem: this isn't a bug to be fixed away. Speed and
correctness-under-change are genuinely in tension here, and every
engineering decision this curriculum builds toward involves a version of
this same fact — improving one real quality can cost another, and there
usually isn't a single option that wins on every axis at once.

**What you need to know first.** Lesson 5's change (the cache in this
lesson fails precisely when the world changes, which Lesson 5 already
established as the normal condition, not the exception), Lesson 6's
correctness/reliability/maintainability, and Lesson 10's local reasoning
— caching, as this lesson shows, reintroduces exactly the hidden-state
problem Lesson 10 spent an entire lesson removing.

**Terms introduced in this lesson**

- **engineering tradeoff** — a decision where improving a system on one
  real quality (performance, say) necessarily costs something on a
  different one (correctness under change, complexity, risk), such that
  no available option is strictly better than every other option on every
  axis at once — only better suited to some situations than others. The
  word matters because it names something this curriculum has been
  demonstrating in every lesson so far without naming it directly:
  `float` versus integer cents (Lesson 5) traded simplicity for
  correctness risk; a tightly coupled shortcut (Lesson 9) traded a little
  typing for a hidden fragility. This lesson makes the pattern explicit
  and gives the forces being traded their own names.
- **cache** (full treatment in `caching-and-memoization.md`) — a stored
  mapping from inputs already seen to the results already computed for
  them, checked before redoing real, possibly expensive work. Introduced
  here only far enough to support this lesson's own subject —
  tradeoffs — not re-explained from scratch; the concept file covers the
  mechanism itself in full.

**Objects and methods used.** `time.perf_counter()`, already given full
treatment in Lesson 7, reused here silently per the Repetition Rule.

No pipeline diagram yet — this curriculum has not established one.

---

## Concept Unit: Naming the Forces Being Traded

### The Problem

Every decision this curriculum has made so far — `date` over hand-rolled
calendar math, `deque` over `list` for a queue, passing `used_coupons`
explicitly instead of reading a global — was framed, at the time, around
one specific quality: essential complexity, a leaky abstraction, local
reasoning. Zoom out: what's the *full* set of qualities a real engineering
decision actually has to weigh against each other?

### The Concept

A short, deliberately named list, given here because the rest of this
curriculum uses these exact words repeatedly, from here on: correctness
(Lesson 6), performance (Lesson 7's timing work), reliability (Lesson 6),
security, maintainability (Lesson 6), development velocity (how fast a
team can keep shipping), cost (money, machines, time), complexity (Lesson
4), and risk (how bad it is if this specific decision turns out to be
wrong). An **engineering tradeoff** is any decision where moving one of
these in a good direction moves at least one other in a bad direction, and
where that's a structural fact about the decision, not a sign that a
better option was simply overlooked. Naming the specific forces in play,
by name, is itself useful — "this is faster but riskier" is a sharper,
more checkable claim than "this is better," and it's the difference this
lesson's own example is about to make concrete.

### CS Lens

This reframes something every lesson so far has actually been doing
implicitly: Lesson 4's `to_ordinal` traded simplicity (accidental
complexity, low) against author effort (had to hand-write real calendar
logic); Lesson 7's `list.pop(0)` traded short-term simplicity against
long-term performance risk. None of those were mistakes to eliminate —
they were tradeoffs, made without ever being named as such until now.

### SE Lens

The realistic alternative to naming these forces explicitly is deciding
by instinct, one call at a time, with no shared vocabulary for *why* a
choice was made — which works fine for a single person on a small
program, and stops working the moment a decision has to be explained to,
or reviewed by, someone else. This curriculum's later domain on technical
decision making returns to exactly this vocabulary, at real depth, for
that reason.

---

## Concept Unit: One Real Tradeoff, Measured on Both Sides

### The Problem

Lesson 2's `is_username_available` was fast because checking three
usernames is trivial. Imagine the real version — checking against an
actual database or a remote service, genuinely slow, the way `time.sleep`
can stand in for.

### The Code, Run for Real

```python
import time

def is_username_available_slow(username, existing_usernames):
    time.sleep(0.05)
    return username not in existing_usernames
```

Wrap it with a cache — see `caching-and-memoization.md` for the general
mechanism this is built on:

```python
_cache = {}

def is_username_available_cached(username, existing_usernames):
    if username in _cache:
        return _cache[username]
    result = is_username_available_slow(username, existing_usernames)
    _cache[username] = result
    return result
```

Call it for the same username twice, timing each call separately:

```python
existing = {"alice", "bob"}

start = time.perf_counter()
print(is_username_available_cached("dave", existing))
print("first call:", round(time.perf_counter() - start, 4), "seconds")

start = time.perf_counter()
print(is_username_available_cached("dave", existing))
print("second call:", round(time.perf_counter() - start, 4), "seconds")
```

Running it:

```text
$ python cached_usernames.py
True
first call: 0.0504 seconds
True
second call: 0.0 seconds
```

The real, measured win: `0.0504` seconds down to effectively `0.0`. This
is the performance side of the tradeoff, genuinely delivered, not
theoretical.

### The Real Cost, Measured Just as Concretely

Now register `"dave"` — a real, ordinary change to `existing_usernames`,
exactly the kind Lesson 5 already established as the normal condition —
and ask the cached function again, alongside the honest, uncached answer:

```python
print("before registering, cached says:", is_username_available_cached("dave", existing))
existing.add("dave")
print("after registering, cached says:", is_username_available_cached("dave", existing))
print("after registering, uncached says:", is_username_available_slow("dave", existing))
```

Here's what actually comes back:

```text
$ python cached_usernames.py
before registering, cached says: True
after registering, cached says: True
after registering, uncached says: False
```

`"dave"` was just registered. The honest, uncached check correctly says
`False` — taken. The cached version confidently says `True` — available —
because it's returning whatever it decided the first time it was ever
asked, with no way of knowing `existing_usernames` has changed since.

### Mechanical Walkthrough

- `_cache = {}` — a module-level `dict`, playing the identical hidden-
  global role `_used_coupons` played in Lesson 10, given full treatment
  there. Worth naming directly: this cache is itself a hidden dependency,
  the same failure Lesson 10 removed, reintroduced here on purpose, in
  exchange for real speed.
- `is_username_available_slow(username, existing_usernames)` inside
  `is_username_available_cached` — this is the one and only place the
  real, slow check actually runs; every other call for a username already
  in `_cache` skips it entirely, which is exactly what buys back the
  `0.05` seconds.

### The Concept

Nothing about this cache is broken — it does precisely what caches do,
which `caching-and-memoization.md` already covers in full: remember a
result, skip the expensive work next time. The failure isn't a bug in the
caching logic. It's the real, structural cost of caching *anything* whose
correct answer can change over time: `is_username_available` is exactly
that kind of question, because Lesson 5 already established that
"existing usernames" is precisely the sort of thing that changes, in the
ordinary, expected course of the system running. Performance went up.
Correctness-under-change went down. Both are real, both are measured, and
neither one is a mistake — this is what an **engineering tradeoff**
actually looks like from the inside, not as an abstract warning but as two
real numbers and one real wrong answer, all produced by the same fifteen
lines of code.

### CS Lens

`caching-and-memoization.md` names this precisely: caching is a real
instance of the *space-time tradeoff*, trading memory (a stored result)
for time (not recomputing it) — one of the most fundamental tradeoffs in
computer science, showing up from a CPU's own hardware cache up through a
browser caching a web page. This lesson's contribution isn't a new
mechanism; it's watching that one specific, textbook tradeoff play out
against a function this curriculum already built and already trusted.

### SE Lens

The realistic alternative isn't "never cache" — for data that genuinely
changes rarely, or where a slightly stale answer is harmless, this exact
tradeoff is a completely reasonable, deliberate choice, and the concept
file's own SE Lens names the honest alternative directly: choosing *not*
to cache, at a real performance cost, specifically when correctness
matters more than speed and the underlying data changes in ways the cache
can't reliably detect. `is_username_available` is arguably the wrong
candidate for caching at all — usernames get claimed constantly, which is
exactly the situation this section's SE Lens flags as dangerous. That
judgment call, not a rule, is the actual skill this lesson is teaching.

---

## Concept Unit: Why There's No Universally Right Answer

### The Problem

Was caching `is_username_available` simply a mistake? If so, what would
make caching the *right* call instead?

### The Concept

Change one fact about the scenario and the same tradeoff resolves
differently: imagine caching a lookup of which country a fixed set of
currency codes belongs to — data that, realistically, never changes while
the program is running. The identical caching code, applied there, buys
the same performance win with none of the correctness risk, because the
condition that made caching dangerous here — the underlying data changing
while the cache doesn't know — simply doesn't apply. This is the actual
shape of "no universally right answer": it isn't that tradeoffs are
unresolvable or arbitrary, it's that the right choice depends on real,
checkable facts about the specific situation — how often does the
underlying data actually change, and how bad is it if a wrong answer
briefly slips through — not on a general rule like "caching is good" or
"caching is risky" that could be applied the same way everywhere.

### CS Lens

Also recognized in: choosing a sorting algorithm (some trade memory for
speed, some trade speed for stability, none dominates every other on
every axis at once); choosing between strong and eventual consistency in
a distributed system (a later domain in this curriculum, in full); even
choosing a material in mechanical engineering (steel versus aluminum
trades strength against weight, with the "right" answer depending
entirely on what's being built). Every field with real constraints
produces this shape of decision, not just software.

### SE Lens

The discipline this lesson is actually pointing toward isn't "learn the
one correct answer for caching" — it's building the habit of asking,
explicitly, before making a decision like this one: which of Lesson 11's
named forces does this help, which does it hurt, and does the specific
situation in front of me make that cost acceptable? `is_username_taken`
failed that question because usernames change constantly and a wrong
answer here (letting someone believe a taken name is free) is a real,
visible failure. A currency-code lookup passes it easily. Neither
judgment is universal — both are judgments about a specific case, made
honestly, which is the entire point.

---

## Connect the Pieces

One function, `is_username_available`, wrapped in a cache, tested on both
sides of the same tradeoff:

1. **The forces, named** — correctness, performance, reliability,
   security, maintainability, velocity, cost, complexity, risk: the
   vocabulary the rest of this curriculum uses for what a decision is
   actually costing and buying.
2. **The measured win** — `0.0504` seconds down to `0.0` for a repeated,
   cached lookup — the real performance side of this lesson's tradeoff.
3. **The measured cost** — after `"dave"` is registered, the cached
   version still confidently says available; the uncached version
   correctly says taken. A real, reproduced correctness failure, caused
   directly by the thing that bought the speed.
4. **No universal answer** — the identical cache, applied to data that
   doesn't change, buys the same speed with none of the risk; the
   difference is a fact about the situation, not about caching itself.

## What Breaks Without This

Treat "cache it, it's faster" as a rule instead of a tradeoff, and apply
it to every slow-looking check in a real signup system, including
username availability, without asking whether the underlying data
changes. The system ships measurably faster in every benchmark anyone
runs before launch. In production, a real, growing trickle of users are
told a username is available, attempt to register it, and fail at the
last step — not because anything crashed, but because the fast path and
the true state of the world quietly disagree, exactly the way this
lesson's own reproduced bug did, at a scale no longer contained to one
lesson's worth of print statements.

## Exercises

1. Read `caching-and-memoization.md` in full and answer, from that file
   alone: what's the difference between a cache and memoization
   specifically, and what real problem does an eviction strategy solve
   that this lesson's own `_cache` doesn't handle at all?
2. Apply this lesson's caching pattern to Lesson 4's
   `business_days_between`, caching results keyed by `(start, end)`.
   Argue, in a few sentences, whether this is a safe candidate for
   caching, using this lesson's own question: how often does the
   underlying data (weekends, the holiday set) actually change?
3. Pick one earlier lesson's fix from this curriculum (Lesson 1's
   `.get()` fix, Lesson 9's `get_account_status`, or another) and name,
   explicitly, which of this lesson's nine forces it improved and which,
   if any, it cost. It's fine, and honest, if the answer is "nothing
   measurable was traded" — not every fix is a tradeoff.

## Definition of Done

- [ ] You've reproduced both the timing win and the stale-answer bug from
      this lesson yourself.
- [ ] You can name at least six of this lesson's nine forces from memory.
- [ ] You've read `caching-and-memoization.md` and completed Exercise 1.
- [ ] You've completed Exercises 2 and 3.
- [ ] Commit the cached and uncached versions of
      `is_username_available`, kept side by side. Commit message should
      explain *why*: for example, `Lesson 11 — cached username check kept
      next to the uncached original to show a real, measured tradeoff
      rather than an unqualified improvement.`
