# Lesson 25: The Tool Professionals Actually Use

**What you will build** — no engine changes at all: real, stored
PocketDB rows, pulled through `query()` into `pandas`/`numpy`, and a
real, honest, side-by-side comparison — the identical real computation
(a per-team average, a real standard deviation) written by hand versus
written with the professional tools this project's own two upcoming
courses actually assume you already know. Both produce the identical
real numbers; only the real amount of code, and what it took to get
there, differs.

**What you need to know first:** Lesson 18 (`query`, `Record`),
Lesson 9's own real-world sibling curricula in this repo, which
already use "why professional tools exist" as a real, standing beat
(`README.md`'s own S11 row names it directly).

**Terms introduced in this lesson:** None new — this lesson's own real
subject is putting already-real, already-stored PocketDB data in front
of tools this project's own two upcoming courses (`README.md`'s own
stated purpose) already assume familiarity with.

**Objects and methods used**
- **`pandas.DataFrame` / `.groupby`**
  - *What they are:* `pandas`'s own real, two-dimensional, labeled
    data structure, and its own real method for splitting rows into
    real groups by a shared column value, then computing a real
    aggregate (here, `.mean()`) per group — all in one real call.
  - *Implementation:* `pd.DataFrame(rows, columns=["team", "score"])`,
    then `df.groupby("team")["score"].mean()`.
  - *Its use:* this lesson's own real, professional-tool half of the
    per-team average comparison.
- **`numpy.array` / `.std`**
  - *What they are:* `numpy`'s own real, fixed-type array (unlike a
    real Python `list`, which can hold any real mix of types), and its
    own real, built-in standard-deviation method.
  - *Implementation:* `np.array(all_scores).std(ddof=1)` — `ddof=1`
    real-matches `statistics.stdev`'s own real, *sample* standard
    deviation (dividing by `n - 1`, not `n`).
  - *Its use:* this lesson's own real, professional-tool half of the
    standard-deviation comparison.

---

## Concept Unit: Getting Real Rows Into a Real DataFrame

### The Problem

`query()` (Lesson 18) returns a real, plain Python `list` of `Record`
objects — genuinely correct, but `pandas`/`numpy` don't know what a
`Record` is; they expect their own, real, native shapes.

### Introduce the Concept in Isolation

Save this as `dataframe_check.py`:

```python
import pandas as pd

rows = [("Red", 42), ("Blue", 88), ("Red", 51)]
df = pd.DataFrame(rows, columns=["team", "score"])

print(df)
print(f"shape: {df.shape}")
print(f"mean score, overall: {df['score'].mean()}")
```

Run with:

```bash
python dataframe_check.py
```

Real output:

```text
   team  score
0   Red     42
1  Blue     88
2   Red     51
shape: (3, 2)
mean score, overall: 60.333333333333336
```

*What this proves:* a real, plain Python list of tuples becomes a real,
labeled `DataFrame` in one call — real, column-aware, with real,
built-in aggregate methods (`.mean()`) immediately available, none of
which `Record` (Lesson 18) or a plain `list` ever had to provide.

### Discard the Throwaway Example

```bash
rm dataframe_check.py
```

### Mechanical Walkthrough

- `pd.DataFrame(rows, columns=["team", "score"])` — real, standard
  `pandas` construction — a real list of real, same-shaped tuples,
  labeled with real, matching column names.
- `df['score'].mean()` — reappearing shape (`statistics.mean`, Lesson
  23) — the identical real computation, via `pandas`'s own real,
  built-in method instead.

### CS Lens

Converting one real, working shape (`Record`) into another
(`pandas.DataFrame`) that a real, external tool actually expects is a
small, real instance of the same real **Adapter** pattern Lesson 17's
own `import_csv` already used — `query()` doesn't need to know
`pandas` exists, and `pandas` doesn't need to know PocketDB exists;
this lesson's own real, small conversion step is the entire real
bridge between them.

### SE Lens

Why does this lesson strip `Record`'s own real, `'Alice'`-style quoted
text (`r["team"].strip("'")`) before ever building a `DataFrame`,
rather than handing `pandas` the raw string? Because `pandas`'s own
real aggregate methods (`.mean()`, `.groupby()`) work on real, clean
values — a `DataFrame` column full of `"'Red'"` (quotes included)
would still real-group correctly by accident, but any real, later
numeric operation on a similarly-quoted `INTEGER` column would fail;
cleaning values *before* they cross into a real, external tool is
safer than hoping that tool tolerates this project's own, still-open
Lesson 18 quirk.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

Real rows can become a real `DataFrame`. The actual, real comparison —
hand-built versus professional-tool, for the same real question — is
next.

---

## Concept Unit: The Same Real Answer, Two Real Ways

### The Problem

A `DataFrame` can now hold real, queried rows, but nothing has yet
actually compared the real cost of answering a real analytical
question by hand versus with the professional tools this lesson's own
first unit only introduced, not exercised.

### The New Code — `analyze_pandas.py`

```python
import random
import time
import statistics
import numpy as np
import pandas as pd
from pocketdb import Database, INTEGER, TEXT

db = Database("teams.pdb")
db.create_table("players", id=INTEGER, team=TEXT, score=INTEGER)

random.seed(7)
teams = ["Red", "Blue", "Green"]
for i in range(120):
    db.insert("players", i, random.choice(teams), random.randint(0, 100))

records = db.query("players")
print(f"rows: {len(records)}")

# Hand-built: average score per team, using nothing but plain Python.
totals = {}
counts = {}
for r in records:
    team = r["team"].strip("'")
    score = int(r["score"])
    totals[team] = totals.get(team, 0) + score
    counts[team] = counts.get(team, 0) + 1
hand_built_averages = {team: totals[team] / counts[team] for team in totals}

print("hand-built averages:", hand_built_averages)

# pandas: the same real computation, in one real line.
rows = [(r["team"].strip("'"), int(r["score"])) for r in records]
df = pd.DataFrame(rows, columns=["team", "score"])
pandas_averages = df.groupby("team")["score"].mean().to_dict()

print("pandas averages:    ", pandas_averages)

all_scores = [int(r["score"]) for r in records]
hand_built_std = statistics.stdev(all_scores)
numpy_std = np.array(all_scores).std(ddof=1)

print(f"hand-built stdev (statistics module): {hand_built_std:.4f}")
print(f"numpy stdev:                          {numpy_std:.4f}")

db.close()
```

Run with:

```bash
python analyze_pandas.py
```

Real output:

```text
rows: 120
hand-built averages: {'Blue': 49.80952380952381, 'Red': 42.86486486486486, 'Green': 45.09756097560975}
pandas averages:     {'Blue': 49.80952380952381, 'Green': 45.09756097560975, 'Red': 42.86486486486486}
hand-built stdev (statistics module): 28.4089
numpy stdev:                          28.4089
```

*What this proves:* both real approaches agree, exactly, on every real
number — `pandas`'s own `.groupby("team")["score"].mean()` computes the
identical real per-team averages as the real, explicit `totals`/
`counts` loop; `numpy`'s own `.std(ddof=1)` matches `statistics.stdev`
to four real decimal places. The real difference isn't correctness —
it's that the hand-built version needed two real, mutable dictionaries
and an explicit real loop to get there, and would need genuinely new,
hand-written logic for every *new* real question (a median per team? a
90th percentile? a count of scores above 75, per team?) — `pandas`
answers each of those with one more real, short method call on the
identical `df`.

### Discard the Throwaway Example

```bash
rm analyze_pandas.py teams.pdb
```

### Mechanical Walkthrough

- `totals.get(team, 0)` — reappearing shape (`dict.get`, Lesson 19's
  own `orm.py`) — real-returns `0` the first real time a team is seen,
  avoiding a real `KeyError` without a separate, explicit check.
- `{team: totals[team] / counts[team] for team in totals}` — a real
  **dict comprehension** — the identical real idea as a list
  comprehension (Lesson 22), building a real, new dictionary instead of
  a real, new list.
- `df.groupby("team")["score"].mean()` — covered fully in Objects and
  methods used, above.
- `np.array(all_scores).std(ddof=1)` — covered fully in Objects and
  methods used, above; `ddof` stands for "delta degrees of freedom" —
  real, standard statistical terminology for the real `n - ddof`
  divisor a standard deviation computation uses.

### CS Lens

`pandas`'s own `.groupby()` is a real, general implementation of the
identical real algorithm the hand-built version wrote out explicitly —
partition real rows into real buckets by a shared key, then reduce
each real bucket to one real value. The hand-built version is real,
correct, and completely tied to *this* one real question; `pandas`'s
own version is the identical real algorithm, generalized once, reused
for any real column, any real aggregate function, forever after.

### SE Lens

Why does this lesson bother writing the real, hand-built version at
all, instead of only showing the shorter `pandas` one? Because
understanding *what* `.groupby()` is actually doing underneath — the
same real reason this entire project hand-rolls a database engine
instead of importing SQLite — is what makes the professional tool's
own real value legible, instead of magic. This is the identical real
beat this repo's other curricula already use, `README.md`'s own S11
row names directly: `pandas`/`numpy` aren't shortcuts around
understanding — they're what a real, working engineer reaches for
*after* already understanding, to avoid re-solving an already-solved
real problem every single time.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S11 is complete: real, stored PocketDB data now flows into the real,
professional analytical tools this project's own two upcoming courses
assume. S12, next, uses this identical real pipeline to train an
actual model — scikit-learn first, then a real, hand-built neural net,
then `Keras` — on data this project's own engine genuinely stored, not
a textbook's own pre-packaged dataset.

---

## Closing

### Connect the Pieces

This lesson's first unit proved that real, stored PocketDB rows convert
into a real `pandas.DataFrame` in one real call, immediately gaining
real, built-in aggregate methods `Record` never had. The second unit
put a real question to both a hand-built implementation and the
professional-tool one side by side — a per-team average, a real
standard deviation — and got the identical real numbers back from
both, differing only in how much real code, and how much real,
reusable generality, each one cost.

### What Breaks Without This

Remove the `.strip("'")` call from `analyze_pandas.py`'s own `team =
r["team"].strip("'")` line, rerun, and compare the real, printed
`hand-built averages` dictionary. The real team names now include their
own literal, embedded quotes (`"'Red'"` instead of `"Red"`) — the
computation still runs, and still groups correctly (each real team's
own quoted name is still internally consistent), but the real, printed
output is genuinely uglier and would silently fail to match a real,
externally-supplied team name like `"Red"` typed without quotes.
Restore the `.strip("'")` call and confirm the real, clean output
returns.

### Exercises

- Add one more real, hand-built aggregate (the *maximum* score per
  team) using the identical explicit-loop style already shown, then
  add the equivalent real, one-line `pandas` version
  (`df.groupby("team")["score"].max()`), and confirm both agree.
- `numpy.array(all_scores)` builds a real, fixed-type array from a
  real Python `list`. Deliberately include a non-numeric real string in
  `all_scores` and observe what real error `numpy` produces — then
  explain, referencing this lesson's own SE Lens on stripped quotes,
  why this is a real, honest reason every value crossing into `numpy`/
  `pandas` needs cleaning first.
- Using this lesson's own real `df`, compute a real correlation or
  cross-tabulation `pandas` provides that this lesson didn't show
  (`pandas`'s own real documentation names several), and explain what
  a hand-built version of the identical real computation would need to
  do differently from this lesson's own `groupby` example.

### Definition of Done

- [ ] You converted real, queried `Record` objects into a real
      `pandas.DataFrame`, from your own real script.
- [ ] You computed the identical real per-team average both by hand
      and with `pandas`, and confirmed they agree exactly.
- [ ] You computed the identical real standard deviation both with
      `statistics.stdev` and `numpy`, and confirmed they agree to
      several real decimal places.
- [ ] You caused the real "unstripped quotes" output yourself and
      confirmed restoring `.strip("'")` fixes it.
- [ ] You can explain, from memory, why this lesson writes the
      hand-built version at all instead of only the shorter `pandas`
      one — referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add pandas/numpy analysis over real, stored PocketDB data"`.
