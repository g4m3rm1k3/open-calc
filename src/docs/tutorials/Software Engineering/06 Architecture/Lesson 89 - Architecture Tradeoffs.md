# Lesson 89: Architecture Tradeoffs

**What you will build.** A new returns-processing feature needs an
architecture decision: modular monolith or microservices. Judged on
latency alone, the monolith wins outright — 5ms against 45ms, the exact
kind of gap Lesson 81 already proved matters. Judged on a weighted
combination of latency, partial-failure risk, and team autonomy — the
three real attributes this specific feature actually depends on, each
weighted by how much it genuinely matters for *this* decision, not in
general — microservices wins instead, 0.60 to 0.40. The transferable
problem: every lesson in this domain so far measured one real cost
against one real benefit, in isolation. A real architectural decision
almost always depends on several such measurements at once, and picking
the option that wins on whichever attribute happens to be checked first
can produce exactly the wrong answer for what the decision actually
needs.

**What you need to know first.** Quality Attributes (Lesson 74) — the
individual measurements this lesson combines; latency, partial-failure
risk (Lesson 80), and team autonomy (a driver named generically since
Lesson 73) are all quality attributes in their own right, each already
given real treatment on its own. Microservices (Lesson 82) — the
compound-probability math this lesson's own `partial_failure_risk`
column reuses directly.

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

Still the **Architecture** stage. Carried through: every prior lesson in
this domain measured one real tradeoff; this lesson is the first to
combine several of them into a single, defensible decision, the same way
a real architectural choice almost never rests on exactly one number.

**Terms introduced in this lesson.** One line each.

- **tradeoff matrix** — a structured comparison of architectural options
  across multiple weighted quality attributes at once, rather than
  deciding based on whichever single attribute happens to be checked
  first. It's named because optimizing for one attribute in isolation
  — this lesson's own latency-only comparison — can pick the wrong
  option when a real decision genuinely depends on several factors
  together.
- **weighted scoring** — assigning each quality attribute a numeric
  weight reflecting how much it actually matters for *this specific*
  decision, not universally, then combining normalized scores across all
  attributes into one comparable number per option. It's the concrete
  mechanism this lesson uses to turn "it depends" into an actual,
  computable, defensible number.

**Objects and methods used.** None new — plain dicts and arithmetic,
already established; what's new is combining several already-established
measurements into one structured comparison.

## Concept Unit: The Fastest Option Isn't Automatically the Right One

### The Problem

Two architecture options for returns processing, each measured on three
real attributes this domain has already given individual treatment:

```python
options = {
    "modular_monolith": {"latency_ms": 5, "partial_failure_risk": 0.0, "team_autonomy": 1},
    "microservices": {"latency_ms": 45, "partial_failure_risk": 0.03, "team_autonomy": 4},
}
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Deciding by latency alone, the way
Lesson 81 measured it in isolation:

```python
fastest = min(options, key=lambda name: options[name]["latency_ms"])
print("naive choice (latency only):", fastest)
```

Running it produces:

```
naive choice (latency only): modular_monolith
```

That's a real, correct measurement — the monolith genuinely is faster.
It's also an incomplete answer: returns processing was never on the
checkout critical path Lesson 82 already established, so its own
latency matters far less than checkout's did. The returns team ships
independently five times a week, and needs the deployment autonomy only
a separate service can give them — a real factor this single-attribute
comparison never asked about at all.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the returns-processing architecture decision,
  documented as a weighted comparison.
- **Change type:** add — a weighted scoring function combining all three
  attributes.
- **Location:** wherever this decision is evaluated (an ADR, per Lesson
  88, is the natural place to record the result).
- **Dependencies:** none.

### The New Code

The smallest new piece is the weights themselves, reflecting what
actually matters for this specific feature:

```python
weights = {"latency_ms": 0.1, "partial_failure_risk": 0.3, "team_autonomy": 0.6}
```

### The Updated Project

Each attribute is normalized to a comparable 0-to-1 scale, weighted, and
summed into one score per option:

```python
def normalized_score(options, attribute, higher_is_better):        # ← new
    values = [opts[attribute] for opts in options.values()]           # ← new
    lo, hi = min(values), max(values)                                   # ← new
    scores = {}                                                          # ← new
    for name, opts in options.items():                                    # ← new
        v = opts[attribute]                                                # ← new
        norm = 0.5 if hi == lo else (v - lo) / (hi - lo)                     # ← new
        scores[name] = norm if higher_is_better else 1 - norm                # ← new
    return scores                                                              # ← new


latency_scores = normalized_score(options, "latency_ms", higher_is_better=False)
risk_scores = normalized_score(options, "partial_failure_risk", higher_is_better=False)
autonomy_scores = normalized_score(options, "team_autonomy", higher_is_better=True)

for name in options:
    total = (
        latency_scores[name] * weights["latency_ms"]
        + risk_scores[name] * weights["partial_failure_risk"]
        + autonomy_scores[name] * weights["team_autonomy"]
    )
    print(f"{name}: weighted score {total:.2f}")
```

Every attribute is normalized so that the *best* option on that
attribute alone scores `1.0` and the *worst* scores `0.0`, then each
option's three normalized scores are multiplied by that attribute's
weight and summed — turning three differently-scaled measurements
(milliseconds, a probability, a headcount-like number) into one number
per option that can actually be compared.

### Isolating the Concept: Three Measurements, One Weighted Answer

The mechanism doing the real work above — normalizing several
differently-scaled measurements and combining them by weight — is shown
directly through the real returns-processing decision above rather than
a separate, unrelated example, since the comparison itself, computed for
real, is this lesson's actual evidence. Running the full weighted
comparison:

```python
for name in options:
    total = (
        latency_scores[name] * weights["latency_ms"]
        + risk_scores[name] * weights["partial_failure_risk"]
        + autonomy_scores[name] * weights["team_autonomy"]
    )
    print(f"{name}: weighted score {total:.2f}")
```

Running it produces:

```
modular_monolith: weighted score 0.40
microservices: weighted score 0.60
```

The answer flips. Microservices loses badly on latency alone but wins
the overall, weighted comparison, because the weights themselves reflect
what this specific feature's own real requirements actually are — not
a universal ranking of monolith versus microservices, only the correct
ranking for *this* decision, given *these* weights.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`lo, hi = min(values), max(values)`** — finds the best and worst raw
  value for one attribute across all options, the range every option's
  own value gets normalized against.
- **`norm = 0.5 if hi == lo else (v - lo) / (hi - lo)`** — computes where
  this option's value falls between the worst and best, as a fraction
  from `0.0` to `1.0`; the `0.5` fallback handles the edge case where
  every option happens to tie on this attribute, avoiding a
  division-by-zero.
- **`scores[name] = norm if higher_is_better else 1 - norm`** — flips the
  normalized score for attributes where a *lower* raw value is actually
  better (latency, failure risk) so that `1.0` always means "best" and
  `0.0` always means "worst," regardless of which raw direction is
  actually good.
- **`total = latency_scores[name] * weights["latency_ms"] + ...`** — the
  weighted sum: each attribute's normalized `0.0`–`1.0` score,
  multiplied by how much that attribute matters for this decision, added
  together into one final, comparable number per option.

### CS Lens

This is **multi-criteria decision analysis**, a general technique for
choosing between options that can't be ranked on a single dimension: the
same underlying mathematics behind recommendation systems ranking
results by a weighted combination of relevance, recency, and popularity,
resource schedulers balancing CPU cost, memory cost, and latency
requirements when placing a workload, and search engine ranking
algorithms combining dozens of weighted signals into a single relevance
score. The core insight in every case is the same one this lesson
demonstrates directly: no single signal, on its own, reliably picks the
right answer for every context.

Also recognized in: architecture fitness functions (a later lesson in
this domain names this directly), which score a real system's actual
structure against multiple weighted quality goals continuously, and
vendor-selection scorecards in engineering procurement, which formalize
exactly this kind of weighted comparison for choosing between competing
tools or platforms.

### SE Lens

The principle is **make the weights explicit, not implicit in whichever
attribute happens to get measured first** — the alternative that was
rejected here, deciding by latency alone because it was the first,
easiest number to compute, isn't wrong because latency doesn't matter;
it's wrong because it silently assigned latency a weight of 1.0 and
every other attribute a weight of 0.0, without anyone deciding that on
purpose. The real cost of this fix: the weights themselves — `0.1`,
`0.3`, `0.6` — are a real, subjective judgment call, not a fact anyone
measured; a different team, or the same team with different priorities,
could defensibly weight these attributes differently and reach the
opposite conclusion. That's not a flaw in the technique — it's exactly
what a tradeoff matrix is honestly for: making the judgment call
visible and arguable, in numbers, instead of hidden inside whichever
attribute got measured first.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the identical comparison with different weights, reflecting a
hypothetical feature where latency *does* matter more — say, a
real-time inventory check instead of returns processing:

```python
weights_latency_sensitive = {"latency_ms": 0.7, "partial_failure_risk": 0.2, "team_autonomy": 0.1}

for name in options:
    total = (
        latency_scores[name] * weights_latency_sensitive["latency_ms"]
        + risk_scores[name] * weights_latency_sensitive["partial_failure_risk"]
        + autonomy_scores[name] * weights_latency_sensitive["team_autonomy"]
    )
    print(f"{name}: weighted score {total:.2f} (latency-sensitive weights)")
```

The real output:

```
modular_monolith: weighted score 0.90 (latency-sensitive weights)
microservices: weighted score 0.10 (latency-sensitive weights)
```

The identical two options, the identical raw measurements, and the
answer flips back, decisively — proving the technique isn't secretly
biased toward either architecture; it faithfully reflects whatever
weights the real decision's own requirements actually call for.

### Connecting Back

Where every earlier lesson in this domain measured one real cost against
one real benefit, this lesson combines several such measurements into
one defensible decision — and, per Lesson 88, that decision, and the
weights behind it, belongs in a written ADR the moment it's made.

## Connect the Pieces

Returns processing's own architecture was decided twice in this lesson,
using the identical two options and the identical raw measurements both
times. First, by latency alone: the monolith won, correctly, on that one
attribute — an incomplete answer for a feature whose real requirements
include far more than speed. Second, by a weighted combination of all
three attributes that actually matter for this feature: microservices
won, 0.60 to 0.40, because team autonomy — weighted at 0.6, the
dominant factor for this specific decision — outweighed the monolith's
own latency advantage.

## What Breaks Without This

A tradeoff matrix only produces a defensible answer if the weights
themselves are defensible. Assigning weights carelessly, without
grounding them in the feature's own real requirements, produces a
confident-looking number that's just as arbitrary as picking by whichever
attribute came first:

```python
weights_made_up = {"latency_ms": 0.33, "partial_failure_risk": 0.33, "team_autonomy": 0.34}

for name in options:
    total = (
        latency_scores[name] * weights_made_up["latency_ms"]
        + risk_scores[name] * weights_made_up["partial_failure_risk"]
        + autonomy_scores[name] * weights_made_up["team_autonomy"]
    )
    print(f"{name}: weighted score {total:.2f} (equal weights, no real justification)")
```

Run for real, this is what comes back:

```
modular_monolith: weighted score 0.66 (equal weights, no real justification)
microservices: weighted score 0.34 (equal weights, no real justification)
```

The decision flips back to the monolith — the opposite conclusion from
this lesson's own justified weights, produced by a matrix that looks
exactly as rigorous on the page: normalized scores, a weighted sum, two
decimal places. Nothing about the arithmetic was wrong; the weights
themselves were never defended against this feature's real
requirements, and unjustified weights of `0.33`/`0.33`/`0.34` quietly
smuggled in the assumption that latency, failure risk, and team autonomy
all matter equally for returns processing — an assumption this lesson's
own Problem section already showed was false. A tradeoff matrix with
arbitrary weights is not more objective than a gut decision; it's a gut
decision with extra decimal places, and the real discipline this lesson
requires is defending *why* each weight is what it is, using real facts
about the specific feature, before trusting the number it produces.

## Exercises

1. Add a fourth attribute, `implementation_cost_days`, to both options,
   assign it a real weight reflecting how much it should matter for
   returns processing specifically, and recompute the weighted scores.
   Does the answer change?
2. Using this lesson's own `normalized_score` function, build a tradeoff
   matrix for a decision from earlier in this domain — caching versus
   not caching (Lesson 74), or splitting a critical path (Lesson 82) —
   and defend your chosen weights using facts, not intuition.
3. Write the ADR, per Lesson 88's own format, recording the returns-
   processing decision this lesson made — including the weights
   themselves, and the reasoning behind them, in the `## Context`
   section, so a future engineer can see not just what was decided but
   why these specific numbers were chosen.

## Definition of Done

- [ ] `normalized_score` correctly normalizes at least three attributes,
      accounting for which direction is better for each one.
- [ ] The Problem section's latency-only decision has been reproduced
      for real, showing it picks a different answer than the weighted
      comparison.
- [ ] The "Run It" scenario above runs against your own code with a
      second, different set of weights and produces a flipped result,
      matching the demonstrated principle that weights determine the
      outcome.
- [ ] The "What Breaks Without This" arbitrary-weights scenario has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `architecture
      tradeoffs: choose microservices for returns processing using a
      weighted comparison of latency, failure risk, and team autonomy`,
      not `add scoring function`.

Up next: Lesson 90, Architecture Fitness — turning this lesson's own
weighted judgment into an automated, continuously-checked test, so a
decision like this one can't silently drift once it's been made.
