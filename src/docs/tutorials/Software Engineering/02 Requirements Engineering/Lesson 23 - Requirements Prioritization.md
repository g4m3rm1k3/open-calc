# Lesson 23: Requirements Prioritization

**What you will build.** A backlog of four real, already-legitimate
features from this domain's own running examples — CSV export, the
restricted-contact permission check, bulk import, and ranked search —
built in two different orders: the order they happened to be requested
in, and an order chosen deliberately by weighing each feature's value
against its cost. Both orders finish all four features by the same final
day, with the identical total value delivered. What differs, measured
and printed for real, is how much of that value existed *before* the
end — and the gap is large enough to matter to anyone waiting on any one
of these features.

**What you need to know first.** Lesson 22's conflicting requirements —
this lesson is about a different problem entirely, and the distinction
matters: Lesson 22's two requirements couldn't both be true of the same
feature at once. This lesson's four requirements have no conflict between
them at all — every one of them can and will be built. The only open
question is which one gets built *first*.

**Terms introduced in this lesson**

- **requirements prioritization** — deciding the order in which
  legitimate requirements get built, when there isn't capacity to build
  them all at once, based on their relative value, cost, risk, and
  urgency. The word "legitimate" matters: prioritization isn't judging
  which requirement is more correct or more real — Lesson 14 already
  established that a stakeholder's need doesn't stop being real just
  because it's built third instead of first. It's a sequencing decision,
  not a validity judgment.
- **value-to-cost ratio** — one real, simple prioritization heuristic:
  rank each requirement by how much value it delivers divided by how much
  it costs to build, and build the highest-ratio items first. It's one of
  several real techniques used for this — this lesson uses it because
  it's precise enough to compute and check directly, not because it's the
  only legitimate approach.

**Objects and methods used.** `sorted(..., key=..., reverse=True)`,
extending Lesson 15's treatment of `sorted` with `key`: `reverse=True`
sorts from highest to lowest instead of `sorted`'s default lowest-to-
highest order.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: The Same Total Work, Two Different Orders

### The Problem

Four real features are backlogged, each with an honest estimate of its
value (on some agreed scale) and its cost in days to build:

```python
features = [
    {"name": "CSV export", "value": 5, "cost_days": 2},
    {"name": "Restricted contact permissions", "value": 9, "cost_days": 1},
    {"name": "Bulk import", "value": 4, "cost_days": 3},
    {"name": "Search ranking", "value": 7, "cost_days": 2},
]
```

There's exactly enough capacity to build all four, back to back, over the
next eight days. The only real question left is what order.

### The Code, Run for Real

Build them in the order they happen to be listed above — the order they
were originally requested in, with no other consideration:

```python
def value_delivered_over_time(ordered_features):
    day = 0
    total_value = 0
    timeline = []
    for feature in ordered_features:
        day += feature["cost_days"]
        total_value += feature["value"]
        timeline.append((feature["name"], day, total_value))
    return timeline
```

Print the requested order's own timeline:

```python
print("requested order:")
for name, day, total in value_delivered_over_time(features):
    print(f"  day {day}: {name} shipped, cumulative value {total}")
```

Running it:

```text
$ python backlog.py
requested order:
  day 2: CSV export shipped, cumulative value 5
  day 3: Restricted contact permissions shipped, cumulative value 14
  day 6: Bulk import shipped, cumulative value 18
  day 8: Search ranking shipped, cumulative value 25
```

Everything ships by day 8, for a total of `25` value delivered. Whoever
was waiting on the restricted-contact permission check — arguably the
most urgent of the four, worth `9` — didn't get it until day 3, after two
full days were spent on something worth barely half as much.

### Mechanical Walkthrough

- `day += feature["cost_days"]` and `total_value += feature["value"]`
  inside the loop — already-assumed accumulation, already covered by
  Lesson 1's `cart_total` and Lesson 6's `average`; the running `day` and
  `total_value` together trace out exactly how much value exists at
  exactly which point in time, which is the entire quantity this lesson
  cares about.
- The f-string inside `print` — already-assumed string formatting;
  chosen here only for readability of the output, not a new concept.

### CS Lens

This is Lesson 15's task-versus-goal gap, applied to planning instead of
search results: "ship all four features" is the task, satisfied
identically by both orderings this lesson builds. "Get the most valuable
things into people's hands as soon as possible" is the actual goal behind
building a backlog at all, and the requested order, exactly like Lesson
15's unranked search, completes the task while serving the goal badly.

### SE Lens

Building in "the order requested" feels neutral — nobody's playing
favorites, first come, first served. But neutrality about *order* isn't
neutrality about *outcome*: whichever feature happened to be asked for
first gets built first, regardless of how much it's actually worth
relative to everything else waiting, which is exactly the arbitrary
result this lesson's next unit corrects.

---

## Concept Unit: Ordering by Value Instead of by Arrival

### The Problem

Rank the same four features by **value-to-cost ratio** instead of by
request order, and build them in that order.

### The New Code

```python
by_ratio = sorted(features, key=lambda f: f["value"] / f["cost_days"], reverse=True)
```

Run the identical timeline calculation against this new order:

```python
print("value/cost order:")
for name, day, total in value_delivered_over_time(by_ratio):
    print(f"  day {day}: {name} shipped, cumulative value {total}")
```

Running it:

```text
$ python backlog.py
value/cost order:
  day 1: Restricted contact permissions shipped, cumulative value 9
  day 3: Search ranking shipped, cumulative value 16
  day 5: CSV export shipped, cumulative value 21
  day 8: Bulk import shipped, cumulative value 25
```

The same four features, the same total: `25` value, delivered by the same
final day, `8`. What's different is everything in between. The
restricted-contact permission check — the single most urgent item,
worth `9` for only `1` day of cost — ships on day 1 instead of day 3.
By day 3, this order has already delivered `16` units of value; the
requested order, at that same point, had delivered only `14`, and hadn't
even reached the permission check yet.

### Mechanical Walkthrough

- `key=lambda f: f["value"] / f["cost_days"]` — extends Lesson 15's
  `sorted(..., key=...)` with a new detail: the key here is a computed
  ratio, not a raw field, so `sorted` orders features by a value derived
  from two of their fields together, not by either one alone.
- `reverse=True` — first appearance of this argument in this curriculum:
  `sorted`'s default order is smallest-key-first; `reverse=True` flips
  that to largest-first, which is what "highest value-to-cost ratio
  first" actually requires.

### The Concept

Total value delivered is identical between the two orders — prioritization
doesn't create value out of nothing, it changes *when* the same value
arrives. That's the entire, real point: two teams could build the
identical four features, in the identical total time, and one of them
gets the most urgent, highest-value work into real use days sooner,
purely by choosing an order deliberately instead of defaulting to
whichever request happened to arrive first.

### CS Lens

This is a real, direct application of a classic scheduling principle —
given a fixed set of jobs with different costs and different values,
completing the highest value-per-cost jobs first maximizes value
delivered at every point along the way, not just at the very end. The
same underlying idea shows up in operating systems scheduling short jobs
before long ones to minimize average wait time, and in project
portfolios prioritizing quick, high-impact wins before slower, lower-
impact ones.

### SE Lens

Value and cost, in this lesson's own code, were given as clean numbers —
in a real backlog, both are estimates, often disagreed on, and this
lesson doesn't pretend otherwise. What the value-to-cost heuristic
provides isn't a perfect, objective ranking; it's a real, checkable
starting point, precise enough to compute and revisit as estimates
improve, which is a genuinely different and better position than ordering
by nothing more considered than who asked first.

---

## Concept Unit: Prioritization Isn't Judging Which Requirement Is Real

### The Problem

Bulk import shipped last in both orderings. Does that mean it's a less
legitimate requirement than the other three?

### The Concept

No — and confusing "prioritized last" with "less real" is a genuine,
common mistake worth naming directly. Bulk import's stakeholder, per
Lesson 14, has exactly as real a need as the stakeholder waiting on the
restricted-contact permission check. What differs is the relationship
between how much value it delivers and how much it costs to build right
now — `4` value for `3` days, a real ratio of `1.33`, honestly lower than
the other three, not a judgment that the feature itself doesn't matter.
This is the same distinction Lesson 22 drew between a discovery and a
decision, applied here in reverse: prioritization order is a decision,
revisited as circumstances change — a feature ranked last today could
rank first next quarter if its cost drops or its value rises — never a
permanent verdict on whether a requirement deserved to exist at all.

### CS Lens

This mirrors Lesson 11's tradeoff vocabulary directly: choosing to build
the permission check before bulk import doesn't mean bulk import lost:
it means, at this specific moment, with these specific estimates, one
had a better ratio than the other — exactly Lesson 11's own insistence
that a tradeoff decision is about the specific situation, not a universal
ranking.

### SE Lens

The realistic risk of skipping this distinction is real and damaging on
its own: a stakeholder whose request is prioritized last can reasonably
feel dismissed, unless the reasoning — value, cost, and the honest
estimates behind both — is made visible to them the way this lesson's
own numbers were. Prioritization done well is a decision made in the
open, with real numbers anyone can check and challenge, not a quiet
ranking handed down without explanation.

---

## Connect the Pieces

One backlog, four features, two orders, one measurable difference:

1. **Requested order** — CSV export first because it was asked first;
   the highest-value item, restricted-contact permissions, doesn't ship
   until day 3.
2. **Value-to-cost order** — the same four features, reordered by a real,
   computed ratio; the highest-value item ships on day 1, and cumulative
   value at every earlier checkpoint is higher.
3. **Identical total, different path** — both orders deliver `25` total
   value by day 8; only the value/cost order gets most of it there
   sooner.

## What Breaks Without This

Build every backlog in whatever order requests happen to arrive, with no
deliberate weighing of value against cost, ever. Nothing about this
produces a visibly broken system — every feature still ships eventually,
exactly like this lesson's requested-order timeline did. What's lost is
invisible unless someone actually measures it, the way this lesson just
did: real value, sitting unbuilt for longer than it needed to, not
because anyone made a bad decision, but because nobody made a decision
at all, and the default — first come, first served — quietly took its
place.

## Exercises

1. Add a fifth feature to the backlog with a low value but very low cost
   (say, value `2`, cost `1` day). Recompute the value-to-cost order and
   explain, using the real numbers, where it lands relative to the other
   four.
2. Recompute both timelines using a capacity of only 5 days instead of 8
   (only build as many features as fit). How much total value does each
   order deliver within that shorter window, and by how much do they
   differ?
3. Estimate value and cost, honestly, for two real features you'd want
   added to any app or tool you use regularly. Compute their value-to-
   cost ratios and say which you'd genuinely want built first.

## Definition of Done

- [ ] You've run both timeline calculations yourself and reproduced the
      real numbers shown in this lesson.
- [ ] You can explain, in your own words, why identical total value can
      still represent a meaningfully worse outcome depending on order.
- [ ] You can explain why being prioritized last doesn't mean a
      requirement is less legitimate.
- [ ] You've completed all three exercises.
- [ ] Commit `value_delivered_over_time` and both orderings. Commit
      message should explain *why*: for example, `Lesson 23 — backlog
      ordered by value-to-cost ratio instead of request order; delivers
      the same total value measurably sooner.`
