# Lesson 1.7: Iteration and Transformation

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** No new backend feature - this lesson reads real filtering, mapping, sorting, and grouping already in this backend (`backend/app/routes/machines.py`, `nc_files.py`, `operation_manager.py`, `cam_files.py`), isolates each real tool in a small throwaway lab first, then returns to Phase 1's own closing task: reading the manual, nested group-by loop already read in full in the prior lesson on Data Structures (`backend/app/routes/tool_assemblies.py`) and asking, now that every one of this lesson's own tools is available, which real part of that loop each one could replace - and which real part genuinely can't be replaced by any of them.

**What you need to know first:** A list/dict comprehension's own basic shape; a dict, and how a nested dict-of-dicts is built one guarded level at a time.

## Terms used in this lesson

- **Key function** — A real, callable argument - a lambda, a named function, or a real pre-built extractor like `operator.itemgetter` - that a tool calls once per real element to decide what that element should be compared or grouped BY, without changing the element itself. It exists as its own concept because both this lesson's own real sorting and real grouping tools share the identical real parameter for it, `key=...`, and because a key function's own real return value is only ever used for comparison/grouping - the real element passed through unchanged into the actual result either way.

## Objects and methods used

- **`map`**
  - *What it is:* A real, built-in function that applies a real, given function to every element of a real iterable, one at a time.
  - *Implementation:* `map(function, iterable) -> map` - a real, lazy iterator, confirmed this session, not a list.
  - *Its use:* This lesson's second unit uses it exactly the one real, narrow way this backend's own code already does - converting each of a fixed, small, known number of real string parts into a real int - and contrasts that with the comprehension shape the rest of this codebase reaches for instead.
  - *Type:* A built-in function.
  - *Responsibility:* Return a real, lazy iterator yielding `function(item)` for each real item in the given iterable, in order - never eagerly building a real list unless something else (`list(...)`, a `for` loop) actually consumes it.
  - *Depends on:* A real, callable function taking exactly one argument, and any real iterable.
  - *Connects to:* This lesson's own first unit already built the identical real transformation using a comprehension instead - `map` and a one-variable comprehension with no filter clause are confirmed this session to produce the identical real real values, differing only in when the values are actually produced.
  - *Shape:* Takes a real function and a real iterable in; returns a real, lazy `map` object - confirmed this session to require `list(...)` (or another real iteration) before its real values are actually visible.

- **`sorted`**
  - *What it is:* A real, built-in function that returns a new, real list containing every element of a given iterable, in sorted order.
  - *Implementation:* `sorted(iterable, key=None, reverse=False) -> list` - confirmed this session with a real `key` argument.
  - *Its use:* This lesson's third unit uses its real `key` parameter, given either a real lambda or a real `operator.itemgetter`, to sort real dict records by one real field's own value, not by the dicts' own default (unsortable) comparison.
  - *Type:* A built-in function.
  - *Responsibility:* Return a real, new list - never mutating the original real iterable - ordered by comparing either the real elements themselves, or, if `key` is given, by comparing each element's own real `key(element)` result instead.
  - *Depends on:* A real iterable whose elements (or whose real `key(element)` results) support real, pairwise comparison.
  - *Connects to:* This lesson's fourth unit depends on `sorted`'s own real output directly - `itertools.groupby`, below, only groups real, already-adjacent equal keys, confirmed this session to require sorting first for correct real results.
  - *Shape:* Takes a real iterable in; returns a real, new list out, always - even when the input was already a real list, and even when `key`/`reverse` are both left at their real defaults.

- **`operator.itemgetter`**
  - *What it is:* A real, standard-library callable factory that builds a real key function extracting one named or indexed real value from each element.
  - *Implementation:* `itemgetter(key) -> callable` - part of the standard library `operator` module; the real callable it returns does `lambda item: item[key]`, confirmed this session to produce identical real results to the equivalent hand-written lambda.
  - *Its use:* This lesson's third and fourth units use it as this backend's own real, already-chosen key function for both `sorted` and `itertools.groupby`, in place of a hand-written lambda doing the identical real thing.
  - *Type:* A callable factory, part of the standard library `operator` module.
  - *Responsibility:* Return a real, reusable callable that, given any real subscriptable object, returns that object's own value at the given real key or index - never modifying the object itself.
  - *Depends on:* Nothing at construction time; the real callable it returns depends on being called with an object that actually supports the given real key/index.
  - *Connects to:* Used identically as `key=` for both `sorted` (above) and `itertools.groupby` (below) - the identical real key function reused for two real, different jobs.
  - *Shape:* Takes one real key/index in; returns one real, reusable callable out - confirmed this session to behave identically to `lambda item: item["seq"]` when actually called.

- **`itertools.groupby`**
  - *What it is:* A real, standard-library function that groups consecutive real elements of an iterable sharing the identical real key.
  - *Implementation:* `groupby(iterable, key=None) -> iterator of (key, group)` - part of the standard library `itertools` module, confirmed this session to only group real, already-adjacent matching elements, never scanning ahead for a later match.
  - *Its use:* This lesson's fourth unit uses it exactly the one real way this backend's own code already does - grouping already-sorted real sequence records by their own real `program_number` - and confirms directly what happens when the real input isn't sorted first.
  - *Type:* A function, part of the standard library `itertools` module.
  - *Responsibility:* Return a real, lazy iterator of `(key, group)` pairs, where each real group is only the run of real, consecutive elements sharing that exact key - never elements sharing the same real key elsewhere in the iterable, separated by something else.
  - *Depends on:* A real iterable already sorted by the same real key being grouped by - confirmed this session to produce real, extra, wrong groups when that precondition isn't met.
  - *Connects to:* This lesson's own third unit's `sorted(..., key=itemgetter(...))` is the real, required step immediately before this - the identical real key function reused for both.
  - *Shape:* Takes a real iterable and a real key function in; yields real `(key, group)` pairs out, where each real `group` is itself a real, one-time-only iterator that must be consumed (e.g. via `list(...)`) before moving to the next pair, confirmed this session via the real project code's own `list(g)`.

## Concept Unit: Comprehensions - Filtering and Transforming in One Real Expression

### The Problem

`machines.py`'s own real `get_locations` route needs a real list of distinct, non-empty location strings, built from real query rows that are each a one-element tuple, some of which are real `None`. Getting a plain real string out of each row is one real job; dropping the real empty ones is a second, different real job - done together, in one real comprehension.

Before reading on:

- Given a real row shaped like `("Bay 1",)` or `(None,)`, what real, different operation is `row[0]` doing compared to what `if row[0]` is doing, in the same real comprehension?
- If the real `if row[0]` clause were removed entirely, what real, concrete value would end up in the result list for a real row shaped `(None,)`, rather than that row being skipped?

### Project Change

- **Reference Source:** `backend/app/routes/machines.py:258-271`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_filter_transform.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in list comprehension syntax only.

`get_locations` queries every real, distinct machine location, including real `None` rows already filtered out at the real SQL level (`.filter(Machine.location.isnot(None))`) - but the real query still returns real one-element tuples, not plain strings, and a real, defensive `if row[0]` stays in the Python-level comprehension too, since a real empty string (as opposed to a real `None`) would still pass the SQL-level filter.

### The New Code

A small, real, throwaway list of one-element tuples, some real, some `None`, filtered and unpacked in one real comprehension:

**File:** `verification/phase-01/lab_filter_transform.py` (new)

```python
rows = [("Bay 1",), ("Bay 2",), (None,), ("Bay 1",)]
locations = [row[0] for row in rows if row[0]]
print(locations)
print(sorted(locations))
```

### The Updated Project

The real project code this lab's own shape reproduces - real query-result tuples, filtered and unpacked the identical way:

**File:** `backend/app/routes/machines.py (lines 265-271)` (already exists — read-only, nothing to type)

```python
locations = db.session.query(Machine.location).distinct().filter(Machine.location.isnot(None)).all()
location_list = [loc[0] for loc in locations if loc[0]]

return jsonify({
    'data': sorted(location_list),
    'total': len(location_list)
})
```

### Mechanical Walkthrough

- `rows = [("Bay 1",), ("Bay 2",), (None,), ("Bay 1",)]` — A real list of one-element tuples - the identical real shape a real SQLAlchemy query returns for a single-column `.query(...)` call, confirmed by the real project code's own comment-free use of `loc[0]` immediately below.
- `locations = [row[0] for row in rows if row[0]]` — Two real, different jobs in one real comprehension: `if row[0]` (filtering) drops any row whose own first element is falsy - a real `None`, or a real empty string - before `row[0]` (transforming) ever unpacks it into a plain real value; a row that fails the filter never reaches the transform at all.
- `print(sorted(locations))` — `sorted`, called with no real `key` - compares the real strings directly; this lesson's own third unit reads a real case where a bare call like this isn't enough.
- `location_list = [loc[0] for loc in locations if loc[0]]` — The real, identical shape as this unit's own lab - `loc[0]` unpacks each real query-result tuple into a plain string, `if loc[0]` drops any real row whose location came back empty despite the real SQL-level filter already applied.
- `return jsonify({'data': sorted(location_list), 'total': len(location_list)})` — The real, identical bare `sorted(...)` call as this unit's own lab, applied directly inside the real response - real proof this exact real pattern (filter-then-transform, then a bare sort) is genuinely how this backend's own code does it, not a simplified stand-in.

### CS Lens

Filtering and transforming are two real, genuinely different operations, even when written on the identical real line - one decides which real elements survive, the other decides what each surviving element becomes. Also recognized in: a real database query's `WHERE` clause (filter) versus its `SELECT` column list (transform), a real Unix pipeline's `grep` (filter) piped into `awk` (transform), and a real spreadsheet's row-hiding filter versus a separate column formula.

### SE Lens

The real alternative not chosen here - two separate real passes, one `filter()`-style step then one `map()`-style step - would cost a second real full iteration over the data for no real benefit; one real comprehension does both jobs in a single real pass. The real risk this unit's own Socratic prompt named directly: removing `if row[0]` wouldn't raise any real error at all - it would just quietly let a real `None` or empty string through into the actual result, the identical class of quiet, silent failure this lesson's own prior lesson (Dataclasses and Value Objects) already showed for an ad hoc dict bundle.

### Commands needed

- `python verification/phase-01/lab_filter_transform.py` — Run from the manufacturing-platform repository root.

### Verification

```text
['Bay 1', 'Bay 2', 'Bay 1']
['Bay 1', 'Bay 1', 'Bay 2']
```

Full saved run: `verification/phase-01/lab_filter_transform_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: map - A Narrower Tool This Codebase Mostly Doesn't Reach For

### The Problem

`nc_files.py`'s own real version-bumping code needs to convert two real string parts, split from one real version string, into two real ints - a real, fixed-size, known-shape transform `map` fits directly, unlike the unit above's own filtered comprehension.

Before reading on:

- Given `map(int, "3.007".split("."))`, what real, concrete type would you expect the result to actually be, before calling `list(...)` on it - the same type `[int(p) for p in ...]` would give you directly, or something different?
- This backend reaches for a real comprehension almost everywhere else it transforms a real list of records, but `map` exactly once, for exactly this one real case - what real, structural difference between the two situations might explain that?

### Project Change

- **Reference Source:** `backend/app/routes/nc_files.py:543-550`, real, already-existing code, read and quoted verbatim this session - confirmed via repository-wide search to be the only real use of `map` anywhere in `backend/app`.
- **Files affected:** `verification/phase-01/lab_map.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in `map` function only.

Real version strings in this backend look like `\"3.007\"` - `.split(\".\")` produces exactly two real string parts every time, and `map(int, ...)` converts both to real ints in one real call, immediately unpacked into two real names.

### The New Code

The real project's own exact real shape, reproduced directly, followed by a real, side-by-side comparison against the comprehension shape this lesson's first unit already used:

**File:** `verification/phase-01/lab_map.py` (new)

```python
version = "3.007"
parts = map(int, version.split("."))
print(type(parts))
print(list(parts))

names = ["ada", "grace", "linus"]
upper_map = list(map(str.upper, names))
upper_comp = [n.upper() for n in names]
print(upper_map)
print(upper_comp)
print(upper_map == upper_comp)
```

### The Updated Project

The one real place in this entire backend that actually reaches for `map`, reproduced by this unit's own lab above:

**File:** `backend/app/routes/nc_files.py (lines 543-550)` (already exists — read-only, nothing to type)

```python
try:
    v_major, v_minor = map(int, nc_file.version.split('.'))
    v_minor += 1
    if v_minor > 999:
        v_major += 1
        v_minor = 0
    nc_file.version = f"{v_major}.{v_minor:03d}"
except:
```

### Mechanical Walkthrough

- `parts = map(int, version.split("."))` — `version.split(\".\")` (basic Python) produces a real, two-element list of strings; `map(int, ...)` doesn't convert either one yet - it returns a real, lazy `map` object, ready to apply `int` to each real element only once something actually asks for a value.
- `print(type(parts))` — `<class 'map'>` - real, direct confirmation `map`'s own result is not a list at all, unlike the equivalent comprehension, which is a real list the moment it finishes running.
- `print(list(parts))` — `list(...)` is what actually forces every real value out of the lazy `map` object - `[3, 7]`, real ints, confirming the conversion genuinely happened, just deferred until this line.
- `upper_map = list(map(str.upper, names)); upper_comp = [n.upper() for n in names]` — The identical real transformation, two real ways - `str.upper` (an unbound real method, called explicitly with each real string as its own `self`) versus a real comprehension calling `.upper()` directly on each name.
- `print(upper_map == upper_comp)` — `True` - real, direct confirmation the two real approaches produce the identical real list when there's no filtering involved at all.
- `v_major, v_minor = map(int, nc_file.version.split('.'))` — The real, identical shape as this unit's own lab's first line - except immediately unpacked into two real names rather than collected with `list(...)` first; unpacking a real `map` object directly into exactly two names works the same real way it would for any real two-element iterable.

### CS Lens

`map` is lazy transformation - real values produced one at a time, only as something actually consumes them, rather than a real, fully-built collection existing all at once. Also recognized in: a real database cursor streaming rows one at a time instead of loading an entire real result set into memory first, a real Unix pipe passing bytes between two real processes as they're produced rather than buffering everything, and a real generator expression (already used, unlabeled, in this lesson's own prior lesson's `sum(len(seq.get(...)) for seq in ...)`).

### SE Lens

The real, structural difference this unit's own Socratic prompt pointed at: `map`'s own real transform here needs no filtering and no access to a real element's surrounding context - exactly two known real positions, converted the identical real way, every single time. Nearly everywhere else in this codebase, a real transform also needs to filter (this lesson's first unit), access a real field by name rather than position (`op.to_dict()` for `op` in a real query result), or build a real dict rather than a bare value - jobs a comprehension expresses directly and `map` alone cannot; that's the real, honest reason this codebase reaches for a comprehension almost everywhere, and `map` in exactly this one narrow, fixed-arity real case.

### Commands needed

- `python verification/phase-01/lab_map.py` — Run from the manufacturing-platform repository root.

### Verification

```text
<class 'map'>
[3, 7]
['ADA', 'GRACE', 'LINUS']
['ADA', 'GRACE', 'LINUS']
True
```

Full saved run: `verification/phase-01/lab_map_output.txt`.

### Connection to the previous unit

The unit above built a real comprehension doing two real jobs at once; this unit reads the one real place in this entire backend that reaches for `map` instead, and finds a genuine, structural reason - no filtering, no field access, a fixed real shape - not just stylistic preference.

## Concept Unit: Sorting With a Real Key - a Lambda and a Named Extractor

### The Problem

`operation_manager.py` needs real sequence IDs ordered by when they first appeared, not by the IDs themselves; `cam_files.py` needs real sequence records ordered by their own real `program_number`. Neither can use a bare `sorted(...)` - each needs a real, different value computed FROM each element to sort by.

Before reading on:

- Given `sorted(sequence_operations.keys(), key=lambda x: sequence_first_appearance.get(x, 9999))`, what real, concrete role does `sequence_first_appearance.get(x, 9999)` (already fully covered in this lesson's own prior-lesson Dictionaries unit) play in deciding the real sort order - is it what ends up IN the sorted result, or something else entirely?
- `operator.itemgetter("seq")` and `lambda r: r["seq"]` are claimed to do the identical real job as a sort key - what real, concrete test would actually confirm that, rather than just trusting the claim?

### Project Change

- **Reference Source:** `backend/app/routes/operation_manager.py:328-332` and `backend/app/routes/cam_files.py:104-107`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_sort_key.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's own standard library `operator` module only.

`operation_manager.py` sorts real sequence IDs by a real, looked- up appearance index, falling back to `9999` (already-covered `.get()` default) for any real sequence with no recorded appearance, pushing it to the end. `cam_files.py` sorts real sequence dicts by their own real `program_number` field, using `operator.itemgetter` instead of an equivalent lambda.

### The New Code

A small, real, throwaway sort, done two real ways - a lambda and a real `itemgetter` - compared directly for equal real output:

**File:** `verification/phase-01/lab_sort_key.py` (new)

```python
from operator import itemgetter

records = [{"seq": "B", "n": 3}, {"seq": "A", "n": 1}, {"seq": "A", "n": 2}]
by_lambda = sorted(records, key=lambda r: r["seq"])
by_itemgetter = sorted(records, key=itemgetter("seq"))
print(by_lambda == by_itemgetter)
print(by_itemgetter)
```

### The Updated Project

The two real project lines this lab's own two key styles reproduce - a lambda key, and a real `itemgetter` key:

**File:** `backend/app/routes/operation_manager.py (lines 328-332)` (already exists — read-only, nothing to type)

```python
sequences_data = []
sorted_seq_ids = sorted(
    sequence_operations.keys(),
    key=lambda x: sequence_first_appearance.get(x, 9999)
)
```

**File:** `backend/app/routes/cam_files.py (lines 104-107)` (already exists — read-only, nothing to type)

```python
data = cam_file.to_dict(include_sequences=False)
if view == 'subprogram':
    sequences_data = sorted([s.to_dict(include_operations=True) for s in cam_file.sequences], key=itemgetter('program_number'))
```

### Mechanical Walkthrough

- `by_lambda = sorted(records, key=lambda r: r["seq"])` — `key=lambda r: r[\"seq\"]` - called once per real record, never returning the record itself, only the real value `sorted` should actually compare; the real records themselves still end up in the result, just reordered.
- `by_itemgetter = sorted(records, key=itemgetter("seq"))` — `itemgetter(\"seq\")` builds a real, reusable callable doing the identical real job as the lambda above - `item[\"seq\"]` - without a `lambda` keyword or an explicit parameter name.
- `print(by_lambda == by_itemgetter)` — `True` - real, direct confirmation the two real key styles produce the identical real sorted result, not just a plausible-sounding claim.
- `sorted_seq_ids = sorted(sequence_operations.keys(), key=lambda x: sequence_first_appearance.get(x, 9999))` — Real sequence IDs (real dict keys, not the records themselves) sorted by a real, looked-up appearance index - `.get(x, 9999)` means a real sequence with no recorded appearance sorts as if its index were `9999`, pushing it to the real end rather than raising a real `KeyError`.
- `sequences_data = sorted([...], key=itemgetter('program_number'))` — The real, identical `itemgetter` pattern as this unit's own lab, sorting real sequence dicts (already built by a comprehension, this lesson's own first unit's construct) by their own real `program_number` field - the real, required step immediately before this lesson's own next unit.

### CS Lens

A key function separates "what to compare BY" from "what to actually return," letting a real sort or a real comparison work on a derived real value without changing the real elements themselves. Also recognized in: a real database `ORDER BY` clause naming a column to sort by, distinct from the columns actually selected; a real spreadsheet's "sort by column C" option, which reorders every column together, not just C; and a real leaderboard sorted by score while still displaying every other real field per entry.

### SE Lens

The real, honest tradeoff between the two key styles this unit showed side by side: a lambda can express real logic beyond a single lookup (`sequence_first_appearance.get(x, 9999)`'s own real default), while `itemgetter` only ever extracts one real, fixed key or index - simpler to read at the real call site, but unable to express a fallback the way the lambda above does. This codebase's own real choice at each site matches that real tradeoff exactly: `itemgetter` where a plain field extraction is all that's needed, a lambda where real fallback logic is required too.

### Commands needed

- `python verification/phase-01/lab_sort_key.py` — Run from the manufacturing-platform repository root.

### Verification

```text
True
[{'seq': 'A', 'n': 1}, {'seq': 'A', 'n': 2}, {'seq': 'B', 'n': 3}]
```

Full saved run: `verification/phase-01/lab_sort_key_output.txt`.

### Connection to the previous unit

The unit above transformed each real element independently, with no regard for order; this unit reads two real cases where the actual ORDER of the result is the entire point, using a real key function to decide it without changing what's actually returned.

## Concept Unit: Grouping Consecutive Runs With itertools.groupby - Why Sorting Comes First

### The Problem

`cam_files.py` needs real sequences grouped by their own real `program_number` - but `itertools.groupby` only groups real, already-ADJACENT matching elements, never scanning the rest of a real list for a later match. The real `sorted(...)` call from the unit above isn't just nearby in the code by coincidence - it's what makes the real grouping below it actually correct.

Before reading on:

- Given real records shaped `{"seq": "B"}, {"seq": "A"}, {"seq": "A"}, {"seq": "B"}` - two real, separate runs of `"B"`, not adjacent - what real, concrete number of groups would `itertools.groupby` produce if it were run on this exact real order, without sorting first?
- After sorting those same four real records by `"seq"` first, how many real groups would you expect instead - and why would that real number be smaller?

### Project Change

- **Reference Source:** `backend/app/routes/cam_files.py:1-14` and `:104-107`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_groupby.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's own standard library `itertools` and `operator` modules only.

`get_cam_file`'s own `subprogram` view groups real sequence records by `program_number`, immediately after sorting by that identical real field - the real precondition `groupby` needs to produce correct, non-fragmented real groups.

### The New Code

A small, real, throwaway grouping, run both ways - unsorted first, then sorted - on the identical real records:

**File:** `verification/phase-01/lab_groupby.py` (new)

```python
from itertools import groupby
from operator import itemgetter

records = [{"seq": "B", "n": 3}, {"seq": "A", "n": 1}, {"seq": "A", "n": 2}, {"seq": "B", "n": 4}]

grouped_unsorted = [(k, list(g)) for k, g in groupby(records, key=itemgetter("seq"))]
print(len(grouped_unsorted))

sorted_records = sorted(records, key=itemgetter("seq"))
grouped_sorted = [(k, list(g)) for k, g in groupby(sorted_records, key=itemgetter("seq"))]
print(len(grouped_sorted))
```

### The Updated Project

The real project code this lab's own "sort, then group" order reproduces - the identical real `itemgetter('program_number')` key used for both real calls:

**File:** `backend/app/routes/cam_files.py (lines 104-107)` (already exists — read-only, nothing to type)

```python
data = cam_file.to_dict(include_sequences=False)
if view == 'subprogram':
    sequences_data = sorted([s.to_dict(include_operations=True) for s in cam_file.sequences], key=itemgetter('program_number'))
    data['grouped_sequences'] = [{"program_number": k, "sequences": list(g)} for k, g in groupby(sequences_data, key=itemgetter('program_number'))]
```

### Mechanical Walkthrough

- `grouped_unsorted = [(k, list(g)) for k, g in groupby(records, key=itemgetter("seq"))]` — Real, unsorted input - `\"B\"`, `\"A\"`, `\"A\"`, `\"B\"` - `groupby` walks it in real, given order, starting a real new group every time the real key changes, even if an identical real key already appeared earlier; the two real `\"B\"` records, not adjacent, land in two real, separate groups.
- `list(g)` — Each real group `g` is itself a real, one-time iterator, not a list - `list(g)` is what actually collects its real elements before the next real `(k, g)` pair is even reached, the identical real reason `map`'s own result (this lesson's second unit) needed `list(...)` before its values were visible.
- `print(len(grouped_unsorted))` — `3` - real, direct confirmation: one real `\"B\"` group, one real `\"A\"` group, then a second, separate real `\"B\"` group, exactly as the unit's own Socratic prompt predicted.
- `sorted_records = sorted(records, key=itemgetter("seq")); grouped_sorted = [(k, list(g)) for k, g in groupby(sorted_records, key=itemgetter("seq"))]` — The identical real key function reused for both real calls - sorting first makes every real matching element adjacent, so `groupby` this time produces exactly one real group per distinct key.
- `print(len(grouped_sorted))` — `2` - real, direct confirmation sorting first produced the real, correct number of groups: one `\"A\"`, one `\"B\"`, each genuinely complete.
- `sequences_data = sorted([...], key=itemgetter('program_number')); data['grouped_sequences'] = [{"program_number": k, "sequences": list(g)} for k, g in groupby(sequences_data, key=itemgetter('program_number'))]` — The real, identical two-step pattern as this unit's own lab, at real project scale - the real `sorted(...)` call immediately before is not incidental proximity in the source; it's the exact real precondition this lesson's own lab just proved `groupby` needs to produce correct, non-fragmented real groups.

### Mental Model

```text
UNSORTED real input:  B   A   A   B
                       |   |___|   |
                    group1 group2 group3   <- 3 real groups
                    (the second B starts a NEW group -
                     groupby never looks back)

SORTED real input:    A   A   B   B
                       |___|   |___|
                      group1   group2       <- 2 real groups
                    (every matching real key is now adjacent)
```

### CS Lens

`itertools.groupby` groups only consecutive real runs - a real, single linear pass, never a real lookup structure remembering every key seen so far. Also recognized in: Unix's own real `uniq` command (collapses only ADJACENT duplicate real lines, the exact same real precondition, which is why `uniq` is so often piped after `sort`), a real run-length-encoding compression scheme, and a real database `GROUP BY` clause, which - unlike `groupby` here - does NOT require pre-sorted input, because it builds a real lookup structure internally instead of relying on adjacency.

### SE Lens

The real, honest cost of `itertools.groupby`'s own real design: it's genuinely cheaper than the manual, real dict-of-dicts accumulator this lesson's own prior lesson (Data Structures) built in `tool_assemblies.py` - no guard clauses, no explicit dict construction - but only for data that's already sorted, or where sorting first is cheap and correct. This lesson's own closing unit, next, returns to that exact real manual accumulator and asks whether `groupby` could actually replace it.

### Commands needed

- `python verification/phase-01/lab_groupby.py` — Run from the manufacturing-platform repository root.

### Verification

```text
3
2
```

Full saved run: `verification/phase-01/lab_groupby_output.txt`.

### Connection to the previous unit

The unit above produced a real, correctly-ordered list; this unit reads a real tool that depends directly on that order already being correct - `groupby`'s own real grouping is only as good as the real sort immediately before it.

## Concept Unit: Revisiting the Manual Group-By Loop - What Actually Maps, and What Doesn't

### The Problem

This lesson's own prior lesson (Data Structures) read a real, manual, three-level nested accumulator in `tool_assemblies.py` - guarded `if ... not in` checks building a real dict of dicts of lists. Every real tool this lesson just built (comprehensions, `map`, `sorted`, `groupby`) is now available - the real question this lesson's own curriculum plan asks directly: which real part of that manual loop would any of them actually replace?

Before reading on:

- `itertools.groupby` groups a real, flat sequence by ONE real key. `tool_assemblies.py`'s own loop groups by `part.id`, then AGAIN by `cam_file.id` within each part - what real, structural mismatch does that create for a tool built around one flat key?
- The loop's own innermost step, `.append()`-ing to a real list of sequences, looks like something a comprehension could build directly - what real, already-computed value would a comprehension need in hand before it could build that same real list in one expression, that the loop instead builds up incrementally?

### Project Change

- **Reference Source:** `backend/app/routes/tool_assemblies.py:86-113`, real, already-existing code, already given full, real treatment in the Data Structures lesson's own Nested Data unit - re-shown here in full, per this project's own repetition rule, for this lesson's own new, comparative angle.
- **Files affected:** `backend/app/routes/tool_assemblies.py` (none)
- **Change type:** none
- **Location:** No change - a real, comparative re-reading of already-existing code.
- **Dependencies:** None.

Nothing about this real code changes - the real question is whether this lesson's own four real tools, just built, could replace any real part of it.

### The Updated Project

The real, unchanged manual accumulator this unit re-reads against this lesson's own four tools:

**File:** `backend/app/routes/tool_assemblies.py (lines 86-113)` (already exists — read-only, nothing to type)

```python
parts_usage = {}
for seq in sequences:
    cam_file = seq.cam_file
    part = cam_file.part

    if part.id not in parts_usage:
        parts_usage[part.id] = {
            'part': part.to_dict(),
            'camFiles': {}
        }

    if cam_file.id not in parts_usage[part.id]['camFiles']:
        parts_usage[part.id]['camFiles'][cam_file.id] = {
            'camFile': cam_file.to_dict(include_sequences=False),
            'sequences': [],
            'operationsCount': 0
        }

    operations = Operation.query.filter_by(sequence_id=seq.id).all()

    parts_usage[part.id]['camFiles'][cam_file.id]['sequences'].append({
        'sequence': seq.to_dict(include_operations=False),
        'toolNumber': seq.tool_number,
        'operations': [op.to_dict() for op in operations]
    })
    parts_usage[part.id]['camFiles'][cam_file.id]['operationsCount'] += len(operations)
```

### Mechanical Walkthrough

- `if part.id not in parts_usage: ... if cam_file.id not in parts_usage[part.id]['camFiles']: ...` — Two real, NESTED grouping levels, by two real, different keys - `part.id`, then `cam_file.id` within each part. `itertools.groupby` groups a real, flat sequence by exactly one real key per call; producing this exact two-level real nesting would need two separate real passes (sort and group by `part.id`, then sort and group each real sub-group again by `cam_file.id`) - genuinely possible, but not the one real call this loop currently is.
- `parts_usage[part.id]['camFiles'][cam_file.id]['sequences'].append({...})` — Builds one real, small dict per sequence AND accumulates it into a real, growing list, at the same time real `operations = Operation.query...all()` (a real, separate database query, once per sequence) has to run first - a real comprehension could build the small per-sequence dict directly, but the real, per-sequence database query alongside it is exactly the kind of real side effect this lesson's own SE Lens, back in its first unit, already named as outside what a clean comprehension expresses well.
- `parts_usage[part.id]['camFiles'][cam_file.id]['operationsCount'] += len(operations)` — A real, running total, updated in place across possibly many real iterations of the outer loop for the identical real `cam_file.id` - genuine, real accumulated state carried between iterations, not a value any one element alone could produce; neither a comprehension, `map`, `sorted`, nor `groupby` carries real state between real elements this way.

### CS Lens

Not every real grouping problem is `itertools.groupby`-shaped - a flat sequence grouped by one real, already-adjacent (or sortable) key is exactly `groupby`'s own real domain; two real, nested grouping levels, each needing a real, separate database query per element and a real, running accumulated total, is a genuinely different, more general real problem, the same real distinction a database query planner draws between a single real `GROUP BY` and a real, multi-level aggregation requiring several real passes.

### SE Lens

The real, honest answer this lesson's own closing question was built to reach: this lesson's four real tools each replace a real PIECE of what the manual loop does (the small per-sequence dict could be a comprehension; the two-level grouping could, with real effort, become two separate sort-and-`groupby` passes) - but no single one of them replaces the loop as a whole, because the loop is doing three real jobs at once (nested grouping by two keys, a real per-element database query, and a real running total) that this lesson's own tools were each built to do exactly one of. The real, honest lesson: recognizing which real job a piece of code is actually doing is what decides whether a comprehension/`map`/`sorted`/ `groupby` genuinely simplifies it, or would just be a worse-fitting tool forced onto a real job it wasn't built for.

### Verification

This unit's own real teaching point is a structural, comparative one - which of this lesson's four already-verified real tools (each already proven, with real, executed output, in the units above) match which real part of this already-fully-explained real loop - established directly by reading the real code shown above, not by executing anything new. It does NOT establish any new runtime behavior beyond what each of this lesson's own prior units already proved for real; a claim about whether a rewritten `groupby`-based version would actually produce the identical real result would need its own separate execution trace, not asserted here.

### Connection to the previous unit

Every earlier unit in this lesson isolated one real tool and proved it against a small, real, matching case; this unit returns to the one real, full-scale case this whole lesson was building toward and reads it honestly - not every real job in it has a clean, one-tool real answer.

## Connect the pieces

One real question, asked from the closing unit backward through every tool this lesson built: `tool_assemblies.py`'s own manual loop groups by `part.id`, then `cam_file.id` (Revisiting the Manual Loop) - a real shape `itertools.groupby` (Grouping) only handles one flat level at a time, and only once its real input is already `sorted` by the identical real key (Sorting With a Real Key). Even the loop's own smallest real step, building one small dict per sequence, resembles this lesson's own first unit's comprehension (Comprehensions) - except for the real, per-sequence database query sitting right next to it, the same real reason `map` (map) only ever fit this codebase's one, narrow, side-effect-free real case. No one real tool from this lesson replaces the loop whole - each replaces exactly the one real job it was actually built for.

**Next lesson:** Phase 1 closes here. Phase 2 turns to testing this same real backend's own code directly - real test doubles, real fixtures, and how to tell a test that actually proves something from one that only looks like it does.