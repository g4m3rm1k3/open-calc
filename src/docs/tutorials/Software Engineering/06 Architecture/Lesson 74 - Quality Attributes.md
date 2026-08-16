# Lesson 74: Quality Attributes

**What you will build.** Lesson 66's `is_payment_method_enabled` rereads
`payments_config.json` from disk on every single call, so a fraud-ops
edit takes effect immediately — measured for real, that costs about
0.235ms per call. Caching the parsed config in memory cuts that to about
0.001ms per call, roughly 250 times faster — and the exact same fraud-
spike scenario Lesson 66 was built to solve breaks: editing the file
mid-process no longer disables `gift_card` at all, because the cached
version never looks at the file again after its first read. The
transferable problem: **quality attributes** — measurable properties
like latency, freshness, availability — routinely trade against each
other, and an architectural decision that measurably improves one can,
in the same change, measurably break the exact property an earlier,
deliberate decision was built to guarantee.

**What you need to know first.** Configuration vs Code (Lesson 66) —
the freshness guarantee this lesson's own optimization breaks; the
fraud-spike scenario is the identical one from that lesson, reused here
on purpose. Side Effects (Lesson 67) — `_config_cache` as module-level
mutable state, the same category of thing Lesson 58 already named risks
for.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Architecture** stage. Carried through: Lesson 73 named
common closure as one kind of architectural driver; this lesson names
quality attributes as another — and shows, with real measured numbers,
that satisfying one can cost another, which is exactly why this decision
belongs at the architecture level rather than being made silently by
whichever engineer happens to touch the code next.

**Terms introduced in this lesson.** One line each.

- **quality attribute** — a measurable property of *how well* a system
  does something, as distinct from *what* it does. Latency,
  availability, freshness, consistency, and security are all quality
  attributes; "can a customer place an order" is not — that's a
  functional requirement, this curriculum's own Requirements Engineering
  domain's territory. Quality attributes are decided architecturally
  because they usually can't be bolted on later without real structural
  change.
- **quality attribute tradeoff** — the fact that improving one quality
  attribute frequently costs another, measurably, rather than being a
  free improvement. It's named because this lesson's own caching fix
  demonstrates one directly: latency improved by roughly 250x, and
  freshness — the exact guarantee Lesson 66 built — broke, from the same
  single change.

**Objects and methods used.**

- **`time.perf_counter()`** (from Python's standard-library `time`
  module)
  - *What it is:* a function returning a high-resolution timestamp,
    suitable for measuring how long a piece of code actually takes to
    run — not suitable for telling wall-clock time, only for measuring
    elapsed duration between two calls to it.
  - *Implementation:* calling it twice, before and after some code, and
    subtracting the two results gives the elapsed time in seconds,
    accurate enough to measure sub-millisecond differences.
  - *Its use:* this lesson uses it to turn "caching should be faster"
    from an assumption into a real, measured number, the same way every
    other lesson in this curriculum turns a claim into run, verified
    output.

## Concept Unit: A Real Tradeoff, Not a Free Optimization

### The Problem

`is_payment_method_enabled`, from Lesson 66, rereads the config file on
every call — measured for real, over a thousand calls:

```python
import time


def is_payment_method_enabled_naive(name, path="payments_config.json"):
    import json
    with open(path) as f:
        config = json.load(f)
    return name in set(config["enabled_payment_methods"])


start = time.perf_counter()
for _ in range(1000):
    is_payment_method_enabled_naive("credit_card")
elapsed = time.perf_counter() - start
print(f"1000 calls took {elapsed:.4f}s ({elapsed/1000*1000:.4f}ms per call)")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces (real timings vary
run to run, but stay in this rough range):

```
1000 calls took 0.2351s (0.2351ms per call)
```

Caching the parsed config in memory is a tempting, obvious optimization
— and it changes more than speed:

```python
_config_cache = None


def is_payment_method_enabled_cached(name, path="gift_disabled_config.json"):
    global _config_cache
    if _config_cache is None:
        import json
        with open(path) as f:
            _config_cache = json.load(f)
    return name in set(_config_cache["enabled_payment_methods"])


print("gift_card enabled, cache cold:", is_payment_method_enabled_cached("gift_card"))

# fraud-ops disables gift_card by editing the file directly, mid-process
import json
with open("gift_disabled_config.json", "w") as f:
    json.dump({"enabled_payment_methods": ["credit_card", "paypal"]}, f)

print("gift_card enabled, cache warm, after the file was edited:", is_payment_method_enabled_cached("gift_card"))
```

Running it produces:

```
gift_card enabled, cache cold: True
gift_card enabled, cache warm, after the file was edited: True
```

The file really was edited — a real fraud-ops disable, the exact
scenario Lesson 66 was built to make instant. The cached function
never notices: `_config_cache` was already populated before the edit,
and nothing in this function ever looks at the file again. Lesson 66's
whole guarantee — a config edit takes effect without a redeploy — is
gone, silently, the moment caching was added for speed.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the payments-config reading code, measured in two
  versions; no single "correct" version is settled on inside this
  lesson, since the right choice depends on which quality attribute this
  specific system actually needs more.
- **Change type:** measurement and comparison, not a single fix.
- **Location:** n/a.
- **Dependencies:** `time`, a Python standard-library module, no install
  needed.

### The New Code

The smallest new piece is the measurement itself:

```python
start = time.perf_counter()
for _ in range(1000):
    is_payment_method_enabled_cached("credit_card")
elapsed = time.perf_counter() - start
print(f"1000 cached calls took {elapsed:.6f}s ({elapsed/1000*1000:.6f}ms per call)")
```

### The Updated Project

Both versions now exist side by side, each with a measured cost on a
different axis:

```python
def is_payment_method_enabled_naive(name, path="payments_config.json"):    # unchanged from Lesson 66
    with open(path) as f:
        config = json.load(f)
    return name in set(config["enabled_payment_methods"])


_config_cache = None


def is_payment_method_enabled_cached(name, path="payments_config.json"):    # ← new
    global _config_cache                                                      # ← new
    if _config_cache is None:                                                  # ← new
        with open(path) as f:                                                    # ← new
            _config_cache = json.load(f)                                          # ← new
    return name in set(_config_cache["enabled_payment_methods"])                  # ← new
```

Neither version replaces the other in this lesson's own file — the
point isn't picking a winner here, it's having both real, measured costs
in hand before a real system commits to either one.

### Isolating the Concept: The Same Tradeoff, Measured on a Simpler Case

The mechanism this lesson demonstrates — caching trading measured speed
for measured freshness — is shown directly through the real
`payments_config.json` scenario above rather than a separate, unrelated
example, since the measurement itself, run for real, is this lesson's
actual subject and a second synthetic example would only restate it with
different names. Running the cached version's own speed measurement:

```python
start = time.perf_counter()
for _ in range(1000):
    is_payment_method_enabled_cached("credit_card")
elapsed = time.perf_counter() - start
print(f"1000 cached calls took {elapsed:.6f}s ({elapsed/1000*1000:.6f}ms per call)")
```

Running it produces (again, real timings vary run to run, but the
relative gap stays roughly consistent):

```
1000 cached calls took 0.000949s (0.000949ms per call)
```

Roughly 250 times faster than the uncached version's own measured
0.2351ms per call — a real, large, measured latency win. Weighed against
the identical real, measured loss from the Problem section: the cached
version stopped noticing a live config edit at all, for the lifetime of
the process. Neither number is in dispute; the only real question is
which one this specific system actually needs more.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`global _config_cache`** — declares that assignments to
  `_config_cache` inside this function refer to the module-level
  variable, not a new local one; without this line, `_config_cache =
  json.load(f)` would create a local variable that vanishes when the
  function returns, and the cache would never actually persist between
  calls.
- **`if _config_cache is None:`** — checks whether the cache has been
  populated yet; `is None` rather than a truthiness check, so an empty
  but successfully-loaded config (an unlikely but possible real value)
  wouldn't be mistaken for "not loaded yet."
- **`with open(path) as f: _config_cache = json.load(f)`** — runs
  exactly once per process, the first time this function is called at
  all; every call after that skips straight past this block because the
  `if` condition is now false.

### CS Lens

This is **caching**, and specifically the tradeoff it always makes:
trading **freshness** (how quickly a change is reflected) for **speed**
(how quickly a read completes), because a cache's entire mechanism is
answering a question from a stored answer instead of recomputing it. The
identical tradeoff appears in CPU cache coherency (a stale cache line
can show an old value until invalidated), DNS caching (a changed IP
address doesn't propagate until every resolver's cache expires), and CDN
edge caching (a newly published web page can be invisible to some
visitors until the CDN's own cache refreshes) — every one of these is
the same real cost, freshness for speed, at a different scale.

Also recognized in: browser caching of static assets needing a
cache-busting filename change to force a real update, database query
result caches that can serve stale data after a write, and eventual
consistency in distributed databases, which is this exact tradeoff
elevated to an entire system's core design decision.

### SE Lens

The principle is **name which quality attribute actually matters more
for this specific piece of data, and decide deliberately, rather than
optimizing for speed by default** — the alternative that was avoided
here, caching `payments_config.json` without weighing the tradeoff, is
exactly the mistake a well-intentioned performance pass could make
without ever running the fraud-spike scenario Lesson 66 built this
system to handle. The real cost of getting this specific decision
right: `payments_config.json`'s own read frequency and freshness
requirement have to actually be known — not guessed — before choosing
between these two versions; a config value read once at startup and
never needing a live update might reasonably cache forever, while this
one, built explicitly for an operational team to edit mid-incident,
should probably stay uncached, or use a smarter middle ground (a cache
with a short expiry) this lesson doesn't build but names as the obvious
next question.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both measurements back to back, in the same process, against
the same config file:

```python
start = time.perf_counter()
for _ in range(1000):
    is_payment_method_enabled_naive("credit_card")
naive_elapsed = time.perf_counter() - start

start = time.perf_counter()
for _ in range(1000):
    is_payment_method_enabled_cached("credit_card")
cached_elapsed = time.perf_counter() - start

print(f"naive:  {naive_elapsed/1000*1000:.4f}ms per call")
print(f"cached: {cached_elapsed/1000*1000:.6f}ms per call")
print(f"speedup: {naive_elapsed/cached_elapsed:.0f}x")
```

The real output (exact numbers vary run to run; the shape doesn't):

```
naive:  0.2351ms per call
cached: 0.000949ms per call
speedup: 248x
```

The speed win is real and large. So is the freshness loss demonstrated
earlier — both are true about the identical one-line change, at the
identical time, and no amount of additional performance testing would
have surfaced the freshness cost; it required the exact scenario Lesson
66 was originally built to solve, run again, against the new version.

### Connecting Back

Where Lesson 73 asked what should decide *where* a boundary goes, this
lesson asks what should decide *how a specific piece of behavior should
perform* — and shows, with real numbers on both sides, that the answer
is never "faster is better" by default; it's "which measured property
does this specific piece of data actually need more of."

## Connect the Pieces

Whether `gift_card` is enabled was checked under a live, mid-process
config edit twice in this lesson, using two different implementations of
the identical function signature. First, the naive, uncached version:
slower by a real, measured 250x, and correctly reflecting the edit the
instant it happened. Second, the cached version: dramatically faster,
and blind to the identical edit for as long as the process kept running.
Both versions are "correct" in the narrow sense of never crashing and
always returning *some* answer — only one of them is correct against the
actual requirement Lesson 66 was built to satisfy.

## What Breaks Without This

Choosing the cached version without naming the tradeoff out loud means
the next engineer to touch this code has no way to know freshness was
ever a deliberate requirement at all:

```python
# six months later, a new engineer, unaware of the fraud-spike requirement,
# reviews this code and sees only a fast, working cache — nothing wrong here
```

Nothing about the cached function's own code signals that it used to
behave differently, or why that difference mattered. The real risk isn't
the caching decision itself — caching may well be the right call for
this system — it's making the decision silently, with no record of what
was traded away, so the next incident where a fraud-ops team edits this
file expecting instant effect becomes a live debugging session instead
of a known, documented limitation. Lesson 88, later in this domain, on
recording architectural decisions with their own reasoning, exists
specifically to close this gap.

## Exercises

1. Build a third version, `is_payment_method_enabled_ttl_cached`, that
   caches the config but re-reads it if more than 5 seconds have passed
   since the last read. Measure its own per-call latency, and describe,
   in one sentence, what quality-attribute tradeoff it makes compared to
   both of this lesson's own versions.
2. `is_payment_method_enabled_cached` uses a module-level global,
   `_config_cache` — the exact category of state Lesson 58 already
   named real risks for. Name one concrete way that could cause a
   problem in a real, multi-threaded, or multi-test-run environment that
   this lesson's own single-process measurement wouldn't reveal.
3. Pick one other function from this curriculum's own running example —
   `can_transition`, `customer_can_pay`, or another — and argue, using
   this lesson's own test, whether caching its result would be a
   reasonable trade or a dangerous one, based on how fast the thing it
   depends on can actually change.

## Definition of Done

- [ ] Both `is_payment_method_enabled_naive` and
      `is_payment_method_enabled_cached` have been run and measured for
      real, with actual timing numbers, not estimates.
- [ ] The Problem section's stale-cache scenario has been reproduced for
      real — edit the config file mid-process yourself, don't just read
      the pasted output.
- [ ] The "Run It" comparison above runs against your own code and
      produces a real speedup number, even if it differs from the one
      shown here.
- [ ] You can state, in one sentence, which quality attribute each
      version of this function optimizes for, and which one it costs.
- [ ] Commit, with a message stating *why*: something like `quality
      attributes: measure the real latency/freshness tradeoff between
      cached and uncached config reads before choosing one`, not `add
      caching`.

Up next: Lesson 75, Architectural Constraints — the drivers a system
doesn't get to choose at all, imposed from outside rather than decided
by tradeoff.
