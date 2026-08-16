# Lesson 29: Postconditions

**What you will build.** Two implementations of Lesson 15's
`search_files_ranked` — the original, and a second, plausible-looking
version that stores each matched file in a plain `dict` keyed by its
relevance rank. The second one silently loses files: any two files
sharing the same rank tier overwrite each other, and only one survives.
You'll add one real, checkable guarantee to both — the ranked result must
contain exactly the same files as the unranked search, just reordered —
and watch it catch the buggy version immediately, with no need to
manually inspect the output or count anything by hand.

**What you need to know first.** Lesson 28's precondition, and Lesson
15's `search_files_ranked` — this lesson writes that function's other
half of the contract, the half that was never stated at all.

**Terms introduced in this lesson**

- **postcondition** — a condition a function guarantees to be true when
  it returns, provided its precondition (Lesson 28) was satisfied when it
  was called. Where a precondition binds the *caller* — a promise about
  what they must provide — a postcondition binds the *function itself* —
  a promise about what it will deliver in return. Together they form a
  real contract: "if you uphold your half, I will uphold mine," precise
  enough that either side breaking their half is a distinguishable,
  nameable failure rather than an undifferentiated bug.

**Objects and methods used.** None new — this lesson's postcondition uses
already-assumed `sorted()` and equality comparison between two lists.

Pipeline: this lesson continues in the *Specification* stage, established
in Lesson 12 and restated in Lesson 28:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: The Promise a Function Makes, Never Written Down

### The Problem

Lesson 15's `search_files_ranked` reorders the exact matches
`search_files` finds — it isn't supposed to add anything, and it isn't
supposed to drop anything. Where does that promise actually live in the
code?

### The Concept

It doesn't — not explicitly. Reading `search_files_ranked`'s body, a
reader can infer that it probably preserves every match, the same way
Lesson 28's reader could infer `average` probably needed a non-empty
list. Inferring correct behavior and *guaranteeing* it are different
things, and the difference becomes visible only once an implementation
comes along that gets the inference wrong while still looking entirely
reasonable.

### CS Lens

This is the mirror image of Lesson 28's precondition, and the two
together are the actual mechanism behind Lesson 20's acceptance criteria:
a precondition and a postcondition, stated together, are a formal version
of exactly what an acceptance criterion was already informally checking —
here, pinned specifically to one function's own contract rather than to a
whole feature's behavior.

### SE Lens

The realistic risk of leaving a postcondition unstated isn't that the
original implementation gets it wrong — `search_files_ranked` never did.
It's that a *second*, differently-written implementation, built later by
someone reasoning from the function's name and general purpose rather
than an explicit guarantee, has nothing to check itself against, and can
drift away from a promise nobody ever actually wrote down.

---

## Concept Unit: A Second Implementation, Reasonable and Wrong

### The Problem

Rebuild `search_files_ranked` a different way: group matches by
relevance rank using a `dict`, then read them back out in rank order.

### The Code, Run for Real

```python
def search_files_ranked_buggy(query, filenames):
    matches = [f for f in filenames if query.lower() in f.lower()]
    by_rank = {}
    for f in matches:
        by_rank[relevance_rank(query, f)] = f
    return [by_rank[r] for r in sorted(by_rank)]
```

Run it against the same six-file list Lesson 15 used:

```python
result = search_files_ranked_buggy("invoice", filenames)
for r in result:
    print(r)
print("count:", len(result))
```

Running it:

```text
$ python search.py
invoice.pdf
INVOICE_January.pdf
old_invoice.pdf
count: 3
```

Three files, not six. `by_rank[relevance_rank(query, f)] = f` uses each
file's rank — `0`, `1`, or `2` — as a `dict` key. Multiple files sharing
the same rank tier don't accumulate; each new one silently overwrites the
last one stored under that key, so only the final file in each tier
survives. Half the real matches are gone, with no error, no warning, and
a result that still looks entirely plausible on its own — three
reasonable-looking filenames, correctly containing the query, correctly
ordered relative to each other.

### Mechanical Walkthrough

- `by_rank[relevance_rank(query, f)] = f` — already-assumed dict
  assignment; the failure isn't in the syntax, it's in the design: a
  `dict` can hold only one value per key, and this code uses a
  many-files-to-one-key relationship (rank) as if it were one-to-one.
- `[by_rank[r] for r in sorted(by_rank)]` — already-assumed list
  comprehension over `sorted` dict keys; faithfully returns whatever
  survived the collision above, in rank order, correctly reflecting a
  `dict` that already lost information before this line ever ran.

### CS Lens

This is the identical failure shape as two people implementing Lesson
21's "remove duplicates" differently — a plausible, internally consistent
implementation, wrong not because any single line is incorrect, but
because the overall structure silently violates a guarantee nobody wrote
down for it to violate.

### SE Lens

Whoever wrote `search_files_ranked_buggy` wasn't careless — grouping by
rank is a completely reasonable instinct, and the bug is genuinely easy
to miss on a skim, the same way Lesson 20's `and`/`or` swap was. This is
exactly the situation a stated postcondition exists to catch
automatically, rather than depending on a reviewer noticing a subtle
`dict`-collision on inspection.

---

## Concept Unit: Writing the Promise Down and Checking It

### The Problem

State, precisely, what both implementations are actually supposed to
guarantee, and check it directly — not by counting output by hand, the
way this lesson's second unit just did once, but as a real, permanent
part of the function.

### The New Code

```python
def search_files_ranked(query, filenames):
    matches = [f for f in filenames if query.lower() in f.lower()]
    result = sorted(matches, key=lambda f: relevance_rank(query, f))
    assert sorted(result) == sorted(matches), "postcondition violated: ranked result must contain exactly the same files as the unranked matches"
    return result
```

Add the identical postcondition to the buggy version, changing nothing
else about it:

```python
def search_files_ranked_buggy(query, filenames):
    matches = [f for f in filenames if query.lower() in f.lower()]
    by_rank = {}
    for f in matches:
        by_rank[relevance_rank(query, f)] = f
    result = [by_rank[r] for r in sorted(by_rank)]
    assert sorted(result) == sorted(matches), "postcondition violated: ranked result must contain exactly the same files as the unranked matches"
    return result
```

Run both:

```python
print("checking correct implementation:")
search_files_ranked("invoice", filenames)
print("postcondition held")

print("checking buggy implementation:")
search_files_ranked_buggy("invoice", filenames)
```

Here's what actually happens:

```text
$ python search.py
checking correct implementation:
postcondition held
checking buggy implementation:
Traceback (most recent call last):
  File "search.py", line 40, in <module>
    search_files_ranked_buggy("invoice", filenames)
  File "search.py", line 23, in search_files_ranked_buggy
    assert sorted(result) == sorted(matches), "postcondition violated: ranked result must contain exactly the same files as the unranked matches"
AssertionError: postcondition violated: ranked result must contain exactly the same files as the unranked matches
```

The correct implementation's postcondition holds silently, exactly the
way a satisfied `assert` always behaves. The buggy one fails immediately,
inside the function that actually caused the problem, naming the real
guarantee that broke — not a downstream symptom three call sites away.

### Mechanical Walkthrough

- `sorted(result) == sorted(matches)` — already-assumed `sorted()` and
  list equality; sorting both sides before comparing means this check is
  about *membership*, not order — it asks "do these two lists contain the
  same files," which is exactly the guarantee this lesson is checking,
  deliberately indifferent to the ordering the function is otherwise
  free to change.
- The identical `assert` line, added to both functions unchanged — worth
  noticing directly: the postcondition doesn't know or care *how* a
  function computes its result. It only checks the result itself against
  the input, which is exactly why it catches a bug in the `dict`-based
  implementation without needing to understand that implementation's
  internals at all.

### CS Lens

This is the same shape as Lesson 20's acceptance criteria, narrowed from
a whole feature down to a single function, checked on every real call
instead of only during a dedicated test run — a postcondition is an
acceptance criterion that travels with the function itself.

### SE Lens

A postcondition costs something real on every call — this `assert`
recomputes and re-sorts both lists, real work that a finished, trusted
system might eventually strip out for performance (many languages and
tools support disabling assertions in production for exactly this
reason). What it buys, especially while a function is new or has more
than one implementation, is a guarantee that survives across rewrites:
`search_files_ranked` could be reimplemented a third way tomorrow, and
this identical postcondition would still catch the same class of mistake
without anyone needing to remember to check for it by hand again.

---

## Connect the Pieces

One function, two implementations, one promise made explicit:

1. **The unwritten promise** — `search_files_ranked` was always supposed
   to preserve every match; nothing in the code said so.
2. **A plausible implementation that breaks it** — `dict`-keyed grouping
   by rank silently drops files sharing a rank tier, `6` matches becoming
   `3`, with no error.
3. **The promise, written and checked** — one identical `assert`, added
   to both functions, holds silently for the correct one and fails
   immediately, by name, for the broken one.

## What Breaks Without This

Ship `search_files_ranked_buggy` without ever writing its postcondition
down, trusting that its output "looks reasonable" on the handful of
example queries anyone happened to try during review. It passes every
check that only looks at whether the *returned* files are correctly
ranked relative to each other — they are, as far as they go. What never
gets checked is whether anything is missing, and a real user, searching
for a file that exists but happens to share a rank tier with another
match, gets a result confidently omitting the one file they were actually
looking for — precisely the goal-versus-task gap Lesson 15 first raised,
reopened here by a bug the original lesson's implementation never had.

## Exercises

1. Write a postcondition for Lesson 4's `business_days_between`: the
   result must never be greater than the total number of calendar days
   between `start` and `end`. Add it and confirm it holds for the
   original implementation.
2. Write a postcondition for Lesson 1's final, fixed `cart_total`: the
   result must be less than or equal to the sum of the raw prices (since
   a discount can only reduce the total, never increase it). Add it and
   run it against both a discounted and an undiscounted cart.
3. Explain, in a few sentences, why this lesson's postcondition —
   `sorted(result) == sorted(matches)` — deliberately does *not* check
   that `result` is correctly ordered by relevance. What different check,
   using this lesson's own `relevance_rank`, would be needed to also
   verify the ordering itself?

## Definition of Done

- [ ] You can define "postcondition" in your own words, and explain how
      it differs from a precondition.
- [ ] You've run both `search_files_ranked` implementations and
      reproduced the real postcondition failure.
- [ ] You've completed all three exercises.
- [ ] Commit the postcondition-checked `search_files_ranked` (not the
      buggy version, kept only as this lesson's worked example). Commit
      message should explain *why*: for example, `Lesson 29 —
      search_files_ranked now asserts its ranked output preserves every
      matched file; catches a real dict-collision bug in an alternative
      implementation.`
