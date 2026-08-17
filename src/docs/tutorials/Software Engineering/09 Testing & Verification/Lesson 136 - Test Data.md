# Lesson 136: Test Data

**What you will build.** A new check for `low_stock_across_stores`
(Lesson 135) that uses a deliberately messier, more realistic fixture
than any check in this project has used so far — three stores where the
same real item gets logged under two different spellings ("Widgets" and
"widgets") — and a real fix in `inventory_report.py` that makes the
function correctly treat those two spellings as one item. The
transferable problem underneath it: test data is a designed artifact,
not a neutral detail. Whoever writes a test also picks the values it
runs against, and when the same person writes both the code and its
tests — true of every check in this project so far — the test data
tends to share the code's own assumptions instead of challenging them.

**What you need to know first.** Lesson 135 introduced
`low_stock_across_stores` itself, the `set`-based version being fixed
in this lesson, and its own regression check,
`check_low_stock_across_stores.py`. Lesson 133 established the
discipline this lesson's own new check follows without comment: each
check builds its own fresh, local fixture rather than sharing mutable
state with any other check.

**Pipeline diagram.** This lesson's work sits on the Verification
stage.

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
**Verification**
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

One concrete value carried through every stage this project has
actually reached: the string pair `"Widgets"` / `"widgets"`, standing
in for one real inventory item logged inconsistently by two different
stores. **Requirements** — Lesson 135's own feature request, "tell me
which items are low in at least one store," never said anything about
how item names are spelled, implicitly assuming every store spells an
item the same way. **Specification** — `low_stock_across_stores`'s own
contract (Lesson 135) promises a deduplicated list of *names*, but
never actually defines what makes two names "the same." **Implementation**
— the `set`-based body Lesson 135 shipped, which only ever treated two
Python strings as the same item if they were byte-for-byte identical.
**Verification** — this lesson's own new stage: a fixture built
specifically to violate the assumption "the same item is always spelled
the same way," proving the implementation's silent, narrower definition
of "the same name" was never actually tested.

**Terms introduced in this lesson.**

- **Test data** — the concrete input values a test runs code against,
  as distinct from the test's own assertions. A test's assertion logic
  can be flawless while the specific values it happens to use decide,
  in advance, which real bugs that test could ever have a chance of
  finding.
- **Fixture** — a specific piece of test data, prepared ahead of time
  and reused by one or more tests — for example, the `store_alpha`,
  `store_beta`, `store_gamma` dictionaries built at the top of a check
  function. Naming this separately from "test data" in general marks it
  as a deliberate design choice with an author and a shelf life, not
  just background noise a test happens to need.
- **Case folding** — normalizing a string into a form suitable for
  case-insensitive comparison, correctly, even for characters that
  don't have a simple one-to-one uppercase/lowercase pairing. An
  ordinary `.lower()` call is a reasonable guess at case-insensitivity
  but is not guaranteed correct across all of Unicode, which is
  specifically why Python's `str.casefold()` exists as a separate
  method rather than being folded into `.lower()` itself.

**Objects and methods used.**

- **`str.casefold()`**
  - *What it is:* a built-in string method that returns an aggressively
    case-normalized copy of the string, intended specifically for
    caseless matching rather than for display.
  - *Implementation:* `str.casefold() -> str`, no arguments. For plain
    ASCII input it behaves like `.lower()` — both `"WIDGETS".lower()`
    and `"WIDGETS".casefold()` return `"widgets"`. The two diverge on
    characters `.lower()` alone doesn't fully normalize: Python's own
    documentation gives the German letter "ß" as the standard example,
    verified this session — `"straße".lower()` returns `"straße"`
    unchanged, while `"straße".casefold()` returns `"strasse"`.
  - *Its use:* this lesson uses `.casefold()`, not `.lower()`, as the
    normalization key inside `low_stock_across_stores`'s new
    deduplication logic, so that two spellings of the same item —
    including ones a plain `.lower()` might not fully normalize —
    collapse to one entry.
- **`low_stock_across_stores(store_inventories, threshold=3)`**
  - *What it is:* the project's own function, introduced Lesson 135,
    that returns the sorted, deduplicated list of item names that are
    low on stock in at least one of several stores.
  - *Implementation, before this lesson (Lesson 135's own version,
    confirmed against the real current file before this lesson's
    edit):*
    ```python
    def low_stock_across_stores(store_inventories, threshold=3):
        low_names = set()
        for inventory in store_inventories:
            low_names.update(low_stock_items(inventory, threshold))
        return sorted(low_names)
    ```
  - *Implementation, after this lesson's fix (confirmed against the
    real current file):*
    ```python
    def low_stock_across_stores(store_inventories, threshold=3):
        seen = {}
        for inventory in store_inventories:
            for name in low_stock_items(inventory, threshold):
                key = name.casefold()
                if key not in seen:
                    seen[key] = name
        return sorted(seen.values())
    ```
  - *Its use:* this lesson's own subject — modified in place to close a
    real gap this lesson's own new fixture exposed, without changing
    its Lesson 135 contract of returning a sorted list of display
    names.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`low_stock_items(inventory, threshold=3)`**
  - *What it is:* the project's own function that returns the sorted
    list of item names in a single store's inventory whose count is
    strictly below `threshold`.
  - *Implementation, confirmed against the real current file:*
    ```python
    def low_stock_items(inventory, threshold=3):
        low = []
        for name, count in inventory.items():
            if count < threshold:
                low.append(name)
        return sorted(low)
    ```
  - *Its use:* `low_stock_across_stores` calls this once per store,
    before this lesson's new deduplication logic ever runs, to get that
    one store's own low-stock names.
- **`dict`**
  - *What it is:* Python's built-in mutable mapping type.
  - *Implementation:* `{}` constructs an empty `dict`; `d[key] = value`
    inserts a new key or overwrites an existing one; `key in d` tests
    key membership; `d.values()` returns a live view of the dict's
    current values.
  - *Its use:* `seen` is a plain `dict` mapping each casefolded name to
    the first original spelling recorded for it — the data structure
    this lesson's whole fix is built on.
- **`sorted()`**
  - *What it is:* Python's built-in function that returns a new sorted
    `list` built from any iterable.
  - *Implementation:* `sorted(iterable) -> list`; without a `key=`
    argument, elements are compared with their own `<` operator — for
    `str`, that's ordinary Unicode code-point order.
  - *Its use:* `low_stock_across_stores` still ends with
    `sorted(seen.values())`, preserving the exact sorted-output
    contract Lesson 135 established, now applied to the deduplicated
    display names instead of a raw `set`.

## Concept Unit: Test Data

### The Problem

Every check written for this project so far hand-types its own small
inventory literal, inline, inside the check function. Run a real count
across the whole suite:

```bash
cd "inventory-report" && grep -n '".*":\s*-\?[0-9]' check_*.py | grep -oE '"[a-zA-Z_]+"' | sort | uniq -c | sort -rn
```

The real, run output:

```text
     17 "widgets"
     13 "gadgets"
      5 "gizmos"
      1 "zzz_item"
      1 "zebra"
      1 "sprockets"
      1 "bolts"
      1 "apple"
      1 "aaa_item"
```

Seventeen separate hand-typed occurrences of the exact string
`"widgets"`, thirteen of `"gadgets"`, and every one of them spelled
identically, lowercase, singular, no punctuation. That's not an
accident of laziness — it's the same author (this curriculum, across
Lessons 115–135) picking test data out of the same mental model that
produced the code being tested. A person who never considers that a
real item name might get typed differently by two different stores
won't write that case into a fixture either, for exactly the same
reason the code itself never handled it.

This gap is not something the property-based, generative, and fuzz
testing already covered in this domain (Lessons 128–130) automatically
closes. Those techniques generate large volumes of data from a written
*strategy*, but the strategy is still authored by someone with a model
of what the input space contains — a `hypothesis` strategy built to
produce lowercase item names would never generate a capitalized variant
either, for the identical underlying reason. Automatically generating
many values from a narrow model of the space is a different problem
than the model itself being narrow. Lesson 135's own new function,
`low_stock_across_stores`, is a direct, concrete target for this gap:
its whole job is deciding whether two names *are* the same item across
stores, and every check written for it so far — including the one
Lesson 135 itself shipped — only ever exercises stores that already
agree on spelling.

### Project Change

Add one new check, `check_low_stock_across_stores_casing.py`, using a
fixture built specifically to violate the unstated assumption every
prior check shared: three stores, where `store_gamma` logs an item as
`"Widgets"` while `store_alpha` logs the same real item as `"widgets"`.
Run this fixture against the current, unmodified `low_stock_across_stores`
first, to see the real, actual behavior before touching any code.

```bash
cd "inventory-report" && python3 -c "
from inventory_report import low_stock_across_stores
store_alpha = {'widgets': 2, 'gadgets': 8}
store_beta = {'gizmos': 1, 'sprockets': 9}
store_gamma = {'Widgets': 1, 'bolts': 0}
print(low_stock_across_stores([store_alpha, store_beta, store_gamma], threshold=3))
"
```

The real, run output, against the unmodified function:

```text
['Widgets', 'bolts', 'gizmos', 'widgets']
```

Both spellings survive into the final result as if they were two
different items. This is a real, actually-run result against the
unmodified Lesson 135 code — not a predicted or fabricated one. Every
existing check for this function passes, because every existing check's
own fixture happens to avoid the exact case this new fixture was built
to hit.

### The New Code

Fix `low_stock_across_stores` in `inventory_report.py` to normalize
names before deciding whether two are "the same," using
`str.casefold()` as the comparison key while still keeping one real,
readable spelling for display:

```python
def low_stock_across_stores(store_inventories, threshold=3):
    seen = {}
    for inventory in store_inventories:
        for name in low_stock_items(inventory, threshold):
            key = name.casefold()
            if key not in seen:
                seen[key] = name
    return sorted(seen.values())
```

The new check that proves this fix against the exact fixture that
exposed the gap:

```python
from inventory_report import low_stock_across_stores

# Regression test: Lesson 136 found that every existing check for this
# function used hand-typed store data with perfectly consistent,
# single-case item names, so a real-world data-entry inconsistency (the
# same item logged under different casing by two different stores) was
# never exercised. This uses a deliberately messier, more realistic
# fixture to verify the two spellings collapse into one entry instead
# of two.
def check_low_stock_across_stores_dedupes_case_variants():
    store_alpha = {"widgets": 2, "gadgets": 8}
    store_beta = {"gizmos": 1, "sprockets": 9}
    store_gamma = {"Widgets": 1, "bolts": 0}
    names = low_stock_across_stores([store_alpha, store_beta, store_gamma], threshold=3)
    assert names == ["bolts", "gizmos", "widgets"], names
    print("check_low_stock_across_stores_dedupes_case_variants passed")

check_low_stock_across_stores_dedupes_case_variants()
```

### The Updated Project

`inventory_report.py` now carries the fixed `low_stock_across_stores`
shown above in place of Lesson 135's `set`-based version; every other
function in the file is unchanged. A new sibling file,
`check_low_stock_across_stores_casing.py`, sits next to Lesson 135's own
`check_low_stock_across_stores.py` in `inventory-report/`, exercising
the same function against a different, deliberately messier fixture.

### Isolating the Concept: str.casefold()

Before touching the project, an isolated, throwaway example, unrelated
to inventory, discarded after this cell: does `.casefold()` actually do
anything `.lower()` doesn't?

```bash
python3 -c "
print(repr('WIDGETS'.lower()))
print(repr('WIDGETS'.casefold()))
print(repr('straße'.lower()))
print(repr('straße'.casefold()))
"
```

The real, run output:

```text
'widgets'
'widgets'
'straße'
'strasse'
```

On plain ASCII input the two methods agree completely — both reduce
`"WIDGETS"` to `"widgets"`. They diverge on `"straße"`: `.lower()`
leaves the German "ß" untouched, since it has no single uppercase
letter to map from in the first place, while `.casefold()` expands it
to `"ss"`, which is what actually makes `"straße"` and `"STRASSE"`
compare equal under case folding. This project's own fixtures never
contain anything but plain ASCII item names, so `.lower()` would have
passed this lesson's own check too — but `.casefold()` is the correct,
general tool for "are these two names the same item regardless of
case," and using it here rather than `.lower()` doesn't cost anything
in the case this lesson actually tests. This throwaway cell is now
discarded; the real project only ever calls `.casefold()` inside
`low_stock_across_stores` itself.

### Mechanical Walkthrough

A literal, in-order pass over every call and operator in the new
function body:

1. `seen = {}` — constructs a new, empty `dict`. This is the
   accumulator the whole fix is built around, replacing Lesson 135's
   `set()`.
2. `for inventory in store_inventories:` — iterates each store's own
   inventory dict, in the order given in the input list.
3. `low_stock_items(inventory, threshold)` — calls the project's
   existing function once per store; each call returns that one
   store's own sorted list of low-stock names, unchanged from Lesson
   115.
4. `for name in ...:` — iterates that one store's own returned names.
5. `name.casefold()` — this lesson's new call, producing the
   normalized string used as a comparison key, assigned to `key`.
6. `key not in seen` — a `dict` membership test against `seen`'s keys.
   The first time any spelling of a given item is seen, across any
   store, this is `True`.
7. `seen[key] = name` — only runs the first time a given casefolded key
   is seen; records the *original* spelling (not the casefolded form)
   under that key, so the final result stays human-readable.
8. `seen.values()` — a view over every recorded original spelling, one
   per distinct casefolded key, with every later duplicate spelling
   silently discarded by step 6 never reaching this point.
9. `sorted(...)` — sorts that view into a `list`, matching the exact
   return contract `low_stock_across_stores` has had since Lesson 135.

### CS Lens

A test suite's real power is bounded by which regions of the possible
input space its data actually touches, not by how many tests exist or
how carefully their assertions are written. Hand-picked literal test
data touches only the region its author happened to imagine — and
that region is disproportionately the "clean" region near the code's
own assumptions, precisely because the same mental model shaped both.
This is why the grep count above matters as real evidence, not just a
style complaint: seventeen occurrences of one exact spelling is a
seventeen-times-repeated sample from one narrow, self-similar corner of
the space of "possible item names a real inventory system might see."

This isn't a case against generated test data (Lessons 128–130) —
it's a case that curated and generated data fail in different, specific
ways, so both remain necessary. A `hypothesis` strategy explores its
own declared space exhaustively and can find inputs no human would
think to type by hand; but the strategy's *shape* is still chosen by a
person, and a strategy shaped like `st.text(alphabet=string.ascii_lowercase)`
would never generate a capitalized variant regardless of how many
thousand examples it tries. Deliberately curating one adversarial,
realistic-messiness example by hand — this lesson's own
`store_gamma = {"Widgets": 1, ...}` — is a targeted, human act of
imagining a specific real-world failure mode that a generic strategy
had no reason to include. Neither approach subsumes the other.

### SE Lens

Three real, honestly separate costs, not all closed by this lesson.
First, duplication risk: seventeen hand-typed instances of `"widgets"`
means a future rename touches seventeen files by hand, and missing even
one produces a check that silently keeps passing against stale data
rather than failing loudly — this lesson does not introduce a shared
fixture module to fix that; it's flagged here as real, unresolved
future work, the same honest-gap pattern this curriculum has used
before (Lesson 134's own still-open determinism gap is the most recent
example). Second, fixture ownership: a fixture is code, with the same
need for review and update discipline as any other code — nothing
enforces that `store_gamma`'s deliberately messy shape in this lesson's
own new check gets maintained as the project's real data shapes evolve.
Third, and out of scope entirely for this lesson: real inventory data
pulled from an actual production system, rather than authored by hand,
raises consent and data-handling questions this toy project's synthetic
item names never have to answer — named honestly, in keeping with this
curriculum's standing "no dedicated Security domain" flag, not solved
here.

This lesson fixed exactly one function, for exactly one realistic
messiness (inconsistent casing). It did not audit `low_stock_items`,
`reorder_suggestion`, or any other function in this project for the
same class of gap — a future session extending this project further
would need to decide, by name, whether that audit is worth doing or
whether `low_stock_across_stores` was simply the one place case
matters, because it's the one function whose entire job is comparing
names *across* independently-authored stores.

### Commands Needed

```bash
cd "inventory-report"
rm -rf __pycache__
python3 check_low_stock_across_stores_casing.py
python3 check_low_stock_across_stores.py
```

### Run It

```text
check_low_stock_across_stores_dedupes_case_variants passed
check_low_stock_across_stores_message passed
```

Both the new check and Lesson 135's own original regression check pass
against the fixed function — this lesson's fix closes the casing gap
without breaking the exact-string case Lesson 135 already verified.

### Connecting Back

Follow one concrete value all the way through: `store_gamma`'s own
`"Widgets"` entry. `low_stock_items(store_gamma, 3)` returns
`["Widgets", "bolts"]` (real, sorted). In the outer loop,
`store_alpha` and `store_beta` are processed first — by the time
`store_gamma`'s `"Widgets"` is reached, `seen` already holds
`"widgets"` (lowercase key) → `"widgets"` (display spelling), recorded
from `store_alpha`'s own entry earlier in the same loop. `"Widgets".casefold()`
produces `"widgets"`, the same key — so `key not in seen` is `False`,
step 7 never runs for this particular name, and `"Widgets"` is silently
and correctly dropped as a duplicate. The final `sorted(seen.values())`
contains `"widgets"` exactly once, in `store_alpha`'s own original
lowercase spelling — matching the real, verified output
`['bolts', 'gizmos', 'widgets']` shown above.

## Connect the Pieces

`store_gamma = {"Widgets": 1, "bolts": 0}` is this lesson's one
concrete fixture value. It moves through `low_stock_items` (Lesson
115) unchanged, since case has no bearing on whether `1 < 3`. It
reaches the new casefold-based dedup logic (this lesson) inside
`low_stock_across_stores` (Lesson 135), where `.casefold()` (this
lesson's own new construct) reveals it as a duplicate of an entry
`store_alpha` already contributed. It survives into the final,
still-`sorted()` (Lesson 135) result as a single entry, `"widgets"` —
proving the fix without changing the function's outward contract.

## What Breaks Without This

Revert `low_stock_across_stores` to Lesson 135's own `set`-based body
and rerun the exact same fixture from "Project Change," above:

```bash
cd "inventory-report" && python3 -c "
low_names_body = '''
def low_stock_across_stores(store_inventories, threshold=3):
    low_names = set()
    for inventory in store_inventories:
        low_names.update(low_stock_items(inventory, threshold))
    return sorted(low_names)
'''
import inventory_report
exec(compile(low_names_body, '<patch>', 'exec'), inventory_report.__dict__)
store_alpha = {'widgets': 2, 'gadgets': 8}
store_beta = {'gizmos': 1, 'sprockets': 9}
store_gamma = {'Widgets': 1, 'bolts': 0}
print(inventory_report.low_stock_across_stores([store_alpha, store_beta, store_gamma], threshold=3))
"
```

The real, run output:

```text
['Widgets', 'bolts', 'gizmos', 'widgets']
```

This is the same real, already-verified broken output from "Project
Change" above, reproduced here by patching Lesson 135's own original
function body back in at runtime rather than by hand-editing the file —
confirming the fix in `inventory_report.py` on disk, not the patched
in-memory copy, is what actually closes the gap. The file on disk still
holds this lesson's fixed version; nothing here was reverted for real.

## Exercises

1. Add a fourth store, `store_delta = {"WIDGETS": 4}` (all capitals),
   to the fixture in `check_low_stock_across_stores_casing.py`. Predict
   which spelling of `"widgets"` survives into the final result before
   running it, then run it and check your prediction against the
   Mechanical Walkthrough's own step-6/step-7 explanation of *first*
   spelling wins.
2. Temporarily change `.casefold()` to `.lower()` inside
   `low_stock_across_stores` and rerun both checks in "Commands
   Needed." Both still pass — confirming, concretely, the CS Lens's
   own point: this project's specific fixtures are not yet realistic
   enough to distinguish `.casefold()` from `.lower()`, even though the
   Isolating step already proved they're not the same method in
   general.
3. Write one new check, from scratch, for `reorder_suggestion` or
   `restock_alert` using a similarly messy, case-inconsistent fixture.
   Does either function have the same gap `low_stock_across_stores`
   had, or does it not apply to them? (Hint: re-read what each
   function's own job actually is before assuming the answer is yes.)

## Definition of Done

- [ ] `inventory_report.py`'s `low_stock_across_stores` uses
      `str.casefold()`-based deduplication, confirmed by reading the
      real file.
- [ ] `check_low_stock_across_stores_casing.py` exists in
      `inventory-report/`, runs, and prints
      `check_low_stock_across_stores_dedupes_case_variants passed`.
- [ ] Lesson 135's own `check_low_stock_across_stores.py` still passes
      unmodified, proving no regression.
- [ ] `rm -rf __pycache__` was run before the final verification pass,
      per this project's own standing stale-bytecode gotcha.
- [ ] Commit, with a message naming *why*, not what: "Add
      casefold-based dedup to `low_stock_across_stores` — every hand-
      typed fixture in this suite so far used consistent item-name
      casing, so a real cross-store spelling mismatch was never
      exercised until this lesson's own deliberately messier fixture
      caught it."
