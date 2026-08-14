# Lesson 10: A Form Shaped by What It Learned

**What you will build** — a real "Train Model" step next to any
selected table: pick a target column, click Train, and the actual,
running window shows a real, trained `scikit-learn` classifier's own
accuracy and learned weights — then a real, dynamic prediction form
appears, shaped by whatever real, numeric columns the model actually
used, letting a user type new values and get a real, live prediction
back. The real, transferable problem underneath: a trained model is
*state* — unlike every earlier protocol method (Lesson 2), which
answered one real question and forgot everything immediately after,
`predict` depends on something `train_model` built a moment (or many
real moments) earlier, and has to find it again without being told
where.

**What you need to know first:** Lesson 9 (`pd.to_numeric`, automatic
numeric-column discovery), `pocket-db`'s own Lesson 26
(`sklearn.linear_model.LogisticRegression`, already given full
treatment there), Lesson 6 (this project's own dynamic, per-column
form pattern).

**Terms introduced in this lesson:** None new — every real, new idea
this lesson needs (module-level state persisting across separate,
real protocol calls) is built entirely from already-established Python
scoping rules, not a new language feature.

**Objects and methods used**
- **`pandas.DataFrame.values`**
  - *What it is:* a real `DataFrame` attribute (not a method — no
    `()`) returning the real, underlying data as a real, plain 2D
    `numpy` array, dropping the real, labeled column names `pandas`
    otherwise carries.
  - *Implementation:* `df[column_list].values` — a real, `(row_count,
    column_count)`-shaped array.
  - *Its use:* the real, exact 2D shape `LogisticRegression.fit`/
    `.predict` both expect, built directly from a real `DataFrame`
    slice.
- **`sklearn.linear_model.LogisticRegression`**
  - *What it is:* a hard concept reappearing from `pocket-db`'s own
    Lesson 26 — `scikit-learn`'s own real, professional single-neuron
    classifier, using a real, sophisticated optimizer under the hood.
  - *Implementation:* `model.fit(X, y)` (already given full treatment);
    `model.score(X, y)` (already given full treatment); `model.coef_`/
    `model.intercept_` (already given full treatment) — this lesson's
    own real, new members are `model.predict(X)`, returning a real
    array of predicted class labels, and `model.predict_proba(X)`,
    returning each real class's own predicted probability — neither
    called anywhere in `pocket-db`'s own Lesson 26, which only ever
    checked `.score`.
  - *Its use:* `train_model` reuses the already-taught members;
    `predict`, this lesson's own second real protocol method, is the
    first real use of `.predict`/`.predict_proba` anywhere in either
    curriculum.

---

## Concept Unit: A Real Feature Matrix, and a Classifier Reused From `pocket-db`

### The Problem

`train_model` needs to turn one real, selected table into exactly what
`LogisticRegression.fit` expects: a real, two-dimensional feature
matrix `X`, and a real, one-dimensional target vector `y` — built from
whichever real column a user picks as the thing to predict, with every
*other* real, numeric column treated as a feature.

### Project Change

- **Reference Source:** No reference counterpart — `query_server.py` is
  this project's own file; `pocket-db`'s Lesson 26 is a *pattern*
  reused here (the classifier itself), not a file read from directly.
- **Files affected:** `query_server.py` (modified — a new `elif method
  == "train_model":` branch).
- **Change type:** Add.
- **Location:** `query_server.py`'s own `handle_request`, after the
  `analyze` branch (Lesson 9).
- **Dependencies:** Lesson 9's own `pd.to_numeric` pattern;
  `scikit-learn` installed (already present on this machine from
  `pocket-db`'s own earlier work; `python -m pip install scikit-learn`
  for a fresh reader).

### The New Code — `query_server.py`

```python
feature_columns = []
for column in columns:
    if column == target_column:
        continue
    try:
        df[column] = pd.to_numeric(df[column])
        feature_columns.append(column)
    except (ValueError, TypeError):
        continue

X = df[feature_columns].values
y = pd.to_numeric(df[target_column]).astype(int).values

model = LogisticRegression()
model.fit(X, y)
accuracy = model.score(X, y)
```

### The Updated Project — `query_server.py`'s `train_model` branch

```python
    elif method == "train_model":
        global trained_model, trained_feature_columns
        table = params["table"]
        target_column = params["targetColumn"]
        columns = conn._db.schema(table)
        records = conn._db.query(table)
        rows = [r.values() for r in records]
        df = pd.DataFrame(rows, columns=columns)

        feature_columns = []
        for column in columns:
            if column == target_column:
                continue
            try:
                df[column] = pd.to_numeric(df[column])
                feature_columns.append(column)
            except (ValueError, TypeError):
                continue

        X = df[feature_columns].values
        y = pd.to_numeric(df[target_column]).astype(int).values

        model = LogisticRegression()
        model.fit(X, y)
        accuracy = model.score(X, y)

        trained_model = model
        trained_feature_columns = feature_columns

        return {
            "featureColumns": feature_columns,
            "accuracy": float(accuracy),
            "coefficients": {
                column: float(weight) for column, weight in zip(feature_columns, model.coef_[0])
            },
            "intercept": float(model.intercept_[0]),
        }
```

`train_model` follows the identical real, established shape every
earlier protocol branch already uses (Lesson 2) — read real, stored
data, compute a real result, return a real, plain dict — with
`trained_model`/`trained_feature_columns` (assigned here, `global`) the
one real, new piece this lesson's own next unit explains fully.

### Mechanical Walkthrough

- `for column in columns: if column == target_column: continue` —
  reappearing syntax (`for`/`if`/`continue`, already established) — a
  real, simple filter: every real column becomes a candidate feature
  *except* whichever one was chosen as the real target.
- `df[column] = pd.to_numeric(df[column])` — a hard concept reappearing
  (per the Repetition Rule — `pd.to_numeric`, Lesson 9) — the real, new
  fact is only that the real, converted result is written *back* into
  `df[column]` (Lesson 9's own version only read the converted result
  without storing it) — needed because `X = df[feature_columns].values`
  (below) needs every real, kept column already numeric, not just the
  one being tested.
- `feature_columns.append(column)` — reappearing shape
  (`list.append`, already established) — only real columns that
  survived the `try` above ever become real features.
- `X = df[feature_columns].values` — first appearance of
  `DataFrame.values` — real-converts a real, multi-column
  `DataFrame` slice into a real, plain 2D `numpy` array, the exact real
  shape `LogisticRegression.fit` expects (`pocket-db`'s own Lesson 26
  already established this same real, 2D convention for `X`).
- `y = pd.to_numeric(df[target_column]).astype(int).values` —
  `pd.to_numeric` is reappearing (Lesson 9); `.astype(int)` is first
  appearance — real-converts real, possibly-`float` numeric values
  into real, plain integer class labels (`0`/`1`), since
  `LogisticRegression` expects real, discrete classes, not continuous
  numbers.
- `model = LogisticRegression()` / `.fit(X, y)` / `.score(X, y)` /
  `.coef_[0]` / `.intercept_[0]` — covered fully in Objects and methods
  used, above (a hard concept reappearing from `pocket-db`'s own Lesson
  26).
- `{column: float(weight) for column, weight in zip(feature_columns,
  model.coef_[0])}` — reappearing shape (a dict comprehension, already
  established since `pocket-db`'s own Lesson 25); `zip` is reappearing
  (`pocket-db`'s own Lesson 26) — pairs each real feature's own name
  with its own real, learned weight, in the identical real order both
  lists share.

### CS Lens

Filtering columns by *attempting* real conversion (`pd.to_numeric`,
inside a `try`) rather than asking this project's own schema for each
column's declared type is the identical real **duck typing** idea
Lesson 9 already named — reapplied here for a genuinely different real
purpose: not "what to summarize," but "what a real classifier is even
allowed to learn from."

### SE Lens

Why does this lesson silently *skip* a real, non-numeric column instead
of raising a real, clear error telling the user "this column can't be
used"? Because this lesson's own, deliberately narrow real scope
mirrors Lesson 9's own choice exactly — a real, honest, named gap
(this project's own established practice, since Lesson 7): a future
lesson could add a real, visible "columns skipped" list (already named
as a Lesson 9 exercise) covering both `analyze` and `train_model` at
once, rather than solving it twice, narrowly, in each.

### Commands Needed

```bash
python -m pip install scikit-learn
```

Already satisfied on this machine.

### Run It

Real, isolated proof — a real, deliberately simple `students` table
(`hours`, `passed`), matching `pocket-db`'s own Lesson 26 real dataset
shape:

```text
TRAIN: {"featureColumns":["hours"],"accuracy":0.85,"coefficients":{"hours":0.9735400812791309},"intercept":-3.863440056785196}
```

*What this proves:* trained entirely on `20` real, stored rows this
project's own engine actually holds, `LogisticRegression` learns a
real, positive weight on `hours` — more hours studied, more likely to
pass, the identical real relationship `pocket-db`'s own Lesson 26
already found — reaching a real `0.85` accuracy on this lesson's own
small, real dataset.

### Connection

A real, trained classifier exists, inside `query_server.py`'s own
running process. Making it answer a *second*, separate real question —
predicting a brand-new, real input — without retraining from scratch,
is next.

---

## Concept Unit: A Model That Outlives the Request

### The Problem

`predict`, this lesson's own second new protocol method, needs the
*exact* real model `train_model` already fit — retraining from scratch
on every real prediction would be real, wasteful, and worse, could
produce a real, *different* model each time (`LogisticRegression`'s own
real optimizer has no guaranteed, deterministic path), making two
predictions for the identical real input potentially disagree.

### Introduce the Concept in Isolation

Save this as `global_persist_check.py`:

```python
last_trained = None

def train(value):
    global last_trained
    last_trained = value
    print(f"train() set last_trained to {last_trained!r}")

def predict():
    print(f"predict() sees last_trained = {last_trained!r}")

train("model-A")
predict()
train("model-B")
predict()
```

Run with:

```bash
python global_persist_check.py
```

Real output:

```text
train() set last_trained to 'model-A'
predict() sees last_trained = 'model-A'
train() set last_trained to 'model-B'
predict() sees last_trained = 'model-B'
```

*What this proves:* `last_trained`, declared once at **module level** —
outside any function — is real, genuinely shared between `train` and
`predict`, two entirely separate real function calls with no real
arguments passed between them at all. `global last_trained` inside
`train` is what lets an *assignment* reach the real, module-level
variable instead of silently creating a new, real, function-local one
that would vanish the moment `train` returns — the identical real
mechanism `conn` (Lesson 2's own `global conn` inside the `open`
branch) already relies on for this project's own open database
connection to survive between every other real protocol call.

### Discard the Throwaway Example

```bash
rm global_persist_check.py
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_server.py` (modified — `trained_model`/
  `trained_feature_columns` declared at module level; a new `elif
  method == "predict":` branch).
- **Change type:** Add.
- **Location:** `query_server.py`, alongside the existing `conn = None`
  module-level declaration, and inside `handle_request`'s own `elif`
  chain, after `train_model`.
- **Dependencies:** This lesson's own first unit (`train_model` must
  run at least once before `predict` has anything real to use).

### The New Code — `query_server.py`

```python
conn = None
trained_model = None
trained_feature_columns = None
```

`trained_model`/`trained_feature_columns` join `conn` as the second and
third real, module-level variables this project has ever declared —
both start `None` and stay that way until a real `train_model` call
first assigns them. With them in place, `predict` can now be added as
one more real branch in the same, already-established `elif` chain:

```python
elif method == "predict":
    if trained_model is None:
        raise ValueError("No model has been trained yet")
    values = params["values"]
    X = [[float(v) for v in values]]
    prediction = int(trained_model.predict(X)[0])
    probability = float(trained_model.predict_proba(X)[0][prediction])
    return {"prediction": prediction, "probability": probability}
```

### The Updated Project — `query_server.py`, top and `predict` branch

```python
import sys
import json
import io
import base64
import dbapi
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression

conn = None
trained_model = None
trained_feature_columns = None


def handle_request(request):
    method = request["method"]
    params = request.get("params", {})

    if method == "open":
        global conn
        conn = dbapi.connect(params["path"])
        return {"ok": True}
    # ... list_tables, get_rows, run_query, create_table, insert_row, analyze: unchanged since Lessons 2, 9
    elif method == "train_model":
        global trained_model, trained_feature_columns
        # ... this lesson's own first unit, unchanged
        return {
            "featureColumns": feature_columns,
            "accuracy": float(accuracy),
            "coefficients": {
                column: float(weight) for column, weight in zip(feature_columns, model.coef_[0])
            },
            "intercept": float(model.intercept_[0]),
        }
    elif method == "predict":
        if trained_model is None:
            raise ValueError("No model has been trained yet")
        values = params["values"]
        X = [[float(v) for v in values]]
        prediction = int(trained_model.predict(X)[0])
        probability = float(trained_model.predict_proba(X)[0][prediction])
        return {"prediction": prediction, "probability": probability}
    else:
        raise ValueError(f"Unknown method: {method}")
```

`handle_request`'s own real, unchanged dispatch shape now has two real,
new branches; the module-level `trained_model`/`trained_feature_columns`
— both `None` until a real `train_model` call ever runs — are what let
`predict` reach back into state a completely separate, earlier real
request created.

### Mechanical Walkthrough

- `trained_model = None` / `trained_feature_columns = None` (module
  level) — reappearing shape (`conn = None`, Lesson 2) — declared once,
  real, genuinely shared by every real function call inside this same,
  long-running `query_server.py` process.
- `if trained_model is None: raise ValueError(...)` — reappearing shape
  (`is None` checks and `raise`, both already established since this
  project's own Lesson 2/dbapi work) — a real, honest guard: `predict`
  called before any real `train_model` produces a real, clear error
  instead of a confusing real crash trying to call `.predict` on
  `None`.
- `X = [[float(v) for v in values]]` — reappearing shape (a list
  comprehension, already established); the real, new fact is the
  *outer* `[...]` — `LogisticRegression.predict` expects the identical
  real, 2D shape `.fit` did (Lesson 26's own established convention),
  so one real, single prediction still needs to be wrapped as a
  one-row, real 2D array.
- `trained_model.predict(X)[0]` — first, real appearance of `.predict`
  anywhere in either curriculum (see Header) — returns a real array of
  predictions, one per real input row; `[0]` real-takes the only one,
  since this lesson only ever predicts one real row at a time.
- `trained_model.predict_proba(X)[0][prediction]` — first, real
  appearance of `.predict_proba` — returns a real array of *per-class*
  probabilities (here, `[P(class 0), P(class 1)]`); indexing with
  `[prediction]` real-selects the real, predicted class's own
  probability specifically, not the other one.

### CS Lens

`trained_model` living as real, module-level state that outlives any
single real request is a small, real instance of the **server holding
session state** — the identical real shape a real, ordinary web
server's own in-memory cache, or a database connection pool, relies on:
some real, expensive-to-produce thing (here, a fitted model; there, an
open connection or a warmed cache) is built once, then real, repeatedly
reused by many separate, later real requests, instead of rebuilt for
each one.

Also recognized in: a real web server keeping a loaded ML model in
memory between HTTP requests rather than reloading it from disk each
time; a real database connection pool; this exact project's own `conn`
(Lesson 2), already doing the identical real thing for an open
database handle.

### SE Lens

Why does `trained_model` live as a plain, module-level Python variable,
rather than being returned to the renderer and sent back with every
real `predict` call? Because `LogisticRegression`'s own real, fitted
object isn't real, plain JSON-serializable data at all — it's a real,
complex Python object (real internal `numpy` arrays, real solver
state) — this project's own protocol (Lesson 2) only ever carries real,
plain JSON across its own text-based boundary; keeping the real model
server-side, referenced only by this lesson's own module-level
variable, avoids ever needing to serialize it at all. The real, honest
cost: this project now supports exactly *one* real, currently-trained
model at a time — training a second real table's own model silently
replaces the first, a real, named limitation worth stating rather than
hiding.

### Commands Needed

No new commands for this unit.

### Run It

Real, end-to-end proof, `train_model` then `predict`, as two genuinely
separate real protocol calls against the identical, still-running
process:

```text
TRAIN: {"featureColumns":["hours"],"accuracy":0.85, ...}
PREDICT (9 hours): {"prediction":1,"probability":0.9925968622744722}
PREDICT (1 hour): {"prediction":0,"probability":0.9473448923113954}
```

*What this proves:* `predict` never re-trains — it reaches straight for
`trained_model`, already fit by an earlier, separate real call — and
correctly, real-predicts a real pass for `9` hours and a real fail for
`1` hour, matching the real, learned relationship `train_model`'s own
positive `hours` weight already showed.

### Connection

A real model persists, and can be asked new, real questions. Letting an
actual user ask them — through a real form, not a hand-written protocol
call — is last.

---

## Concept Unit: A Form Shaped by What the Model Learned

### The Problem

`predict` needs one real, numeric value per real feature column
`train_model` actually used — but that real column list isn't known
until *after* training finishes, and differs by table. This project has
already solved the identical real shape of problem once, for Lesson
6's own "Insert Row" form.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/preload.ts` (modified — `trainModel`/
  `predict` methods), `src/main.ts` (modified — matching IPC handlers),
  `src/App.tsx` (modified — target-column `<select>`, training results,
  a real, dynamic predict form).
- **Change type:** Add.
- **Dependencies:** This lesson's own first two units;
  Lesson 6's own dynamic-form pattern.

### The New Code — `src/App.tsx`

```typescript
{trainResult.featureColumns.map((column, index) => (
  <input
    key={column}
    placeholder={column}
    value={predictValues[index] ?? ""}
    onChange={(event) => {
      const next = [...predictValues];
      next[index] = event.target.value;
      setPredictValues(next);
    }}
  />
))}
```

### The Updated Project — `src/App.tsx`, the Train Model block

```typescript
          <h3>Train Model</h3>
          <select value={targetColumn} onChange={(event) => setTargetColumn(event.target.value)}>
            <option value="">target column...</option>
            {rows.columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
          <button onClick={trainModel} disabled={targetColumn === ""}>
            Train Model
          </button>
          {trainResult !== null && (
            <div>
              <p>accuracy: {trainResult.accuracy.toFixed(3)}</p>
              <ul>
                {trainResult.featureColumns.map((column) => (
                  <li key={column}>
                    {column}: weight {trainResult.coefficients[column].toFixed(4)}
                  </li>
                ))}
              </ul>

              <h4>Predict</h4>
              {trainResult.featureColumns.map((column, index) => (
                <input
                  key={column}
                  placeholder={column}
                  value={predictValues[index] ?? ""}
                  onChange={(event) => {
                    const next = [...predictValues];
                    next[index] = event.target.value;
                    setPredictValues(next);
                  }}
                />
              ))}
              <button onClick={predict}>Predict</button>
              {predictResult !== null && (
                <p>
                  prediction: {predictResult.prediction} (probability{" "}
                  {predictResult.probability.toFixed(3)})
                </p>
              )}
            </div>
          )}
```

This project's own established `useEffect` reset pattern (Lesson 6, for
`insertValues`; Lesson 9, for `analysis`) reappears once more, sized to
match a *new* trained model's own real feature list the moment
`trainResult` changes:

```typescript
useEffect(() => {
  if (trainResult === null) {
    return;
  }
  setPredictValues(trainResult.featureColumns.map(() => ""));
  setPredictResult(null);
}, [trainResult]);
```

### Mechanical Walkthrough

- `<select value={targetColumn} onChange={...}>` — first appearance of
  a real, controlled `<select>` element; the identical real
  `value`/`onChange` controlled-component shape Lesson 6 already
  established for `<input>`, applied to a different real HTML element
  — React manages a `<select>`'s own current choice the identical real
  way.
- `{rows.columns.map((column) => (<option key={column} value={column}>{column}</option>))}`
  — reappearing shape (`.map` building a list of real elements, already
  established since Lesson 3) — a real `<option>` per real column this
  table actually has, so the dropdown can never real-offer a column
  that doesn't exist.
- `disabled={targetColumn === ""}` — first appearance of a real,
  conditional `disabled` attribute — prevents a real, meaningless
  "Train Model" click before any real target column is actually chosen.
- `trainResult.featureColumns.map((column, index) => (<input .../>))` —
  a hard concept reappearing (per the Repetition Rule — Lesson 6's own
  dynamic, per-column form, driven there by `rows.columns`, driven here
  by `trainResult.featureColumns` instead) — the identical real,
  immutable-array update pattern (`[...predictValues]`) Lesson 6 already
  proved necessary.
- `useEffect(() => { ...; }, [trainResult])` — reappearing shape
  (`useEffect` with a real, non-empty dependency array, Lesson 4) — the
  real, new fact is only *what* triggers it: a freshly-trained model,
  not a newly-selected table.

### CS Lens

Building a form's own real shape from data returned by an earlier real
operation — rather than a fixed, hand-written set of fields — is the
identical real idea Lesson 6 already named: the UI *reflects* real,
discovered structure instead of assuming it in advance. Lesson 6
discovered structure from a table's own real schema; this lesson
discovers it from a real, trained model's own chosen features instead —
the same real principle, one more real source.

### SE Lens

Why does `predictValues` reset (via the `useEffect` above) every time
`trainResult` changes, rather than trying to preserve whatever a user
had already typed? Because a *previous* model's own real feature list
might not even match the *new* one — training against a different real
target column could real-select an entirely different set of feature
columns — keeping stale, real, now-meaningless values around would risk
a real, silent, wrong prediction far worse than an empty form a user
has to refill.

### Commands Needed

```bash
npm start
```

### Run It

Real, end-to-end proof — driving the actual, running window through a
real `students` table, a real "passed" target selection, a real "Train
Model" click, a real "2" typed into the resulting `hours` field, and a
real "Predict" click:

```text
<div><p>accuracy: 0.850</p><ul><li>hours: weight 0.9735</li></ul>
<h4>Predict</h4><input placeholder="hours" value="2"><button>Predict</button>
<p>prediction: 0 (probability 0.872)</p></div>
```

*What this proves:* every real piece — the target-column dropdown, the
Train Model button, the dynamically-sized predict form, and the real
prediction text — works correctly from a genuine, simulated user
interaction in the actual, running window, not only from a direct,
bypassing IPC call.

### Connection

S10 is complete: a real, trained `scikit-learn` model, and a real
prediction from it, are both now one real click away in the actual
GUI — the identical real capability `pocket-db`'s own Lesson 26 first
proved from a standalone script.

---

## Closing

### Connect the Pieces

This lesson's first unit built a real feature matrix and target vector
from a table's own real, stored rows, reusing Lesson 9's own
`pd.to_numeric` pattern to automatically discover which columns could
even be features, then trained a real `LogisticRegression` — the
identical real classifier `pocket-db`'s own Lesson 26 already gave full
treatment to — reaching a real `0.85` accuracy on real, stored data.
The second unit proved, with a small, isolated, throwaway script first,
that a plain, module-level Python variable genuinely persists between
two entirely separate real function calls — the identical real
mechanism this project's own `conn` has relied on since Lesson 2 — and
used it to let a real `predict` call reach the exact model `train_model`
already fit, without ever retraining or serializing it. The third unit
built a real, dynamic form shaped by whatever real feature columns that
specific model actually learned from, reusing Lesson 6's own
established dynamic-form pattern, and proved the entire real chain end
to end through genuine, simulated interaction with the actual, running
window.

### What Breaks Without This

In `query_server.py`'s own `predict` branch, remove the
`if trained_model is None: raise ValueError(...)` guard, rebuild
nothing (pure Python), and call `predict` in a fresh `query_server.py`
process — one that has never real-received a `train_model` call at
all. The real, resulting error changes from a real, clear
`"No model has been trained yet"` to a real, confusing
`AttributeError: 'NoneType' object has no attribute 'predict'` —
technically still caught by this project's own top-level
`try`/`except Exception` (Lesson 2), still shown to a real user via
`cleanErrorMessage` (Lesson 7), but genuinely less honest about what
actually went wrong. Restore the guard and confirm the real, clear
message returns.

### Exercises

- `train_model` currently supports exactly one, real, currently-trained
  model at a time (this lesson's own SE Lens, named directly). Change
  `trained_model` into a real, keyed dictionary
  (`trained_models: dict[str, LogisticRegression]`, keyed by table
  name), letting two real, different tables each keep their own,
  separately-trained model without one silently overwriting the other.
- Add a real "Retrain" indicator: track a real, module-level
  `trained_table` alongside `trained_model`, and have the real UI show
  a visible warning if `selectedTable` no longer matches
  `trained_table` (the currently-loaded model belongs to a
  *different* real table than the one now selected).
- This lesson's own `train_model` always uses *every* real, numeric,
  non-target column as a feature. Add a real way for a user to
  deliberately exclude a real column (a checkbox per real numeric
  column, next to the target-column dropdown), and confirm the real,
  resulting `featureColumns`/predict form both correctly shrink.

### Definition of Done

- [ ] `query_server.py`'s own `train_model` and `predict` methods both
      exist and work against a real, selected table.
- [ ] `trained_model`/`trained_feature_columns` are real, module-level
      variables, declared once, alongside `conn`.
- [ ] You ran this lesson's own isolated `global_persist_check.py`
      yourself and confirmed the real output.
- [ ] A real "Train Model" button in the actual, running window shows
      real accuracy and weights; a real, dynamic predict form appears
      and produces a real, correct prediction.
- [ ] You caused the real "no guard" failure yourself (predicting with
      no model trained) and confirmed restoring the guard fixes it.
- [ ] You can explain, from memory, why `trained_model` is kept
      server-side instead of round-tripped through the protocol —
      referencing this lesson's own second unit's SE Lens.
- [ ] Committed with a message stating why, for example:
      `git commit -m "Add real scikit-learn training and prediction, reachable from the GUI"`.
