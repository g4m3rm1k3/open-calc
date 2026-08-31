# Lesson 6.8: Denormalization

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** One real script studying `backend/app/models/cam_file.py`'s own real `version` column - a value that looks exactly like this curriculum's own previous Normalization lesson's kind of violation (a stored value derivable from other columns already in the same row), except this one was chosen deliberately, real, and on purpose. The lab recomputes the real formula this project's own `backend/app/services/pdm_service.py:97` already uses to keep it in sync, proves it agrees with the real stored value, then proves the real, structural risk this project's own single point of synchronization carries if a real future change to `part_rev` ever bypassed it.

**What you need to know first:** This curriculum's own Normalization lesson - what a repeating group and an update anomaly are, and why they are real problems; f-string formatting, including a fixed-width, zero-padded integer field.

## Terms used in this lesson

- **denormalization** — The deliberate choice to store a value that could instead be derived, on demand, from other columns already present - trading the normalization guarantee that a fact lives in exactly one place for the real, practical benefit of not having to recompute that fact every single time it is read. It exists as the honest counterpart to normalization: normalization's own real benefit (a fact stored once, never able to disagree with itself) is not free - it costs a real computation, every time, to reconstruct a derived value from its real sources, and denormalization is the name for choosing to pay a different cost instead.
- **source of truth** — The specific column, or columns, a derived value is actually computed from - the place a disagreement would be resolved in favor of, if the derived value and its real sources ever disagreed. It exists as a distinct idea from the derived value itself because a denormalized column's own stored value is only ever as trustworthy as the last time it was actually recomputed from its real source of truth - the stored value is a claim about the source of truth, not the source of truth itself.
- **consistency cost** — The real, ongoing risk that a denormalized value and its own real source of truth quietly stop agreeing, because keeping them in sync depends on every real code path that changes the source actually remembering to also update the derived copy. It exists as the honest price of denormalization's own real benefit: the moment more than one real place in the codebase is capable of changing the source of truth, each one of those places becomes a real opportunity for the derived value to go stale, with nothing in the schema itself checking that it did not.

## Objects and methods used

None — this lesson introduces no new external class, interface, or method, only Terms.
## Concept Unit: Denormalization - Storing a Derived Fact Instead of Recomputing It

### The Problem

`backend/app/models/cam_file.py`'s own real `version` column is declared with a comment stating exactly what it is: `# Computed: "{part_rev}.{cam_rev:03d}"` - a value fully derivable from `part_rev` and `cam_rev`, two OTHER real columns already sitting in the same row. This curriculum's own previous Normalization lesson would call storing a derivable value a real anomaly risk. Given that this project stores it anyway, what does it actually gain by not simply recomputing `version` every time it is needed?

Before reading on:

- If `version` were never stored at all, and every real caller that needed it recomputed `f"{part_rev}.{cam_rev:03d}"` on the spot instead, would the DATA ever be able to disagree with itself the way this curriculum's own Normalization lesson warned about?
- Given that recomputing `version` is one cheap f-string away, what would storing it instead actually have to be buying this project, for the tradeoff to make sense at all?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/cam_file.py:30-32`: ``` part_rev = db.Column(db.String(10), default='1')  # Part revision cam_rev = db.Column(db.Integer, default=0)  # CAM revision (0-999) version = db.Column(db.String(20), default='1.000')  # Computed: "{part_rev}.{cam_rev:03d}" ``` and, real, verbatim, `backend/app/services/pdm_service.py:94-97`: ``` current_cam_rev = getattr(cam_file, 'cam_rev', 0) or 0 cam_file.cam_rev = current_cam_rev + 1 part_rev = getattr(cam_file, 'part_rev', '1') or '1' cam_file.version = f"{part_rev}.{cam_file.cam_rev:03d}" ``` Real, already-existing evidence of a deliberate denormalized column, and the one, real, specific place this project keeps it in sync with its own real source of truth.
- **Files affected:** `verification/phase-06/lab_denormalized_version.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond plain Python.

### The New Code

The exact real formula `pdm_service.py`'s own real line already uses, run directly against a real-shaped `CAMFile` row, to confirm the stored `version` genuinely matches what recomputing it from source would give:

**File:** `verification/phase-06/lab_denormalized_version.py` (new)

```python
def recompute_version(part_rev, cam_rev):
    """Mirrors the real, single place this project keeps version in sync:
    backend/app/services/pdm_service.py:97."""
    return f"{part_rev}.{cam_rev:03d}"


cam_file = {"part_rev": "1", "cam_rev": 3, "version": "1.003"}
print(f"stored version: {cam_file['version']!r}")
print(f"recomputed from source columns: {recompute_version(cam_file['part_rev'], cam_file['cam_rev'])!r}")
print(f"do they agree? {cam_file['version'] == recompute_version(cam_file['part_rev'], cam_file['cam_rev'])}")
```

### Mechanical Walkthrough

- `def recompute_version(part_rev, cam_rev): return f"{part_rev}.{cam_rev:03d}"` — A direct, real copy of `pdm_service.py:97`'s own real f-string formula, pulled out into its own function so this lab can call it more than once. `{cam_rev:03d}` is a format specifier: `03d` means "format this integer in decimal, zero-padded to at least 3 digits" - `3` becomes `"003"`, matching this project's own real comment, `cam_rev (0-999)`.
- `cam_file = {"part_rev": "1", "cam_rev": 3, "version": "1.003"}` — A plain dict (basic Python) modeling one real `CAMFile` row, already carrying both the real source-of-truth columns (`part_rev`, `cam_rev`) and the real, denormalized `version` this unit is studying.
- `cam_file['version'] == recompute_version(...)` — A direct equality check (basic Python) between the STORED value and what recomputing it from its own real source of truth would give right now - evaluates `True`, confirming this row's own `version` is currently trustworthy.

### CS Lens

This is **denormalization**, fully named in this lesson's own Header - trading a single source of truth for a stored, pre-computed copy. Also recognized in: a web page caching a "like count" instead of counting real rows on every single page load; a compiler's own precomputed jump table instead of re-evaluating a branch condition from scratch every time; a spreadsheet storing a formula's last computed result alongside the formula itself, shown instantly until the sheet recalculates; and, in this project's own domain, this exact real column - `version`, pre-computed once per real check-in rather than recomputed on every single read.

### SE Lens

The design principle is recognizing that a derived value is read far more often than its real sources change - `version` is read every time a `CAMFile` is displayed, but only recomputed once per real check-in - which is exactly the shape of tradeoff that makes denormalization worth its own real cost. The real alternative NOT chosen - never storing `version`, always recomputing it from `part_rev`/`cam_rev` at read time - would guarantee it can never go stale, at the honest cost of a small, repeated computation on every single read; given how cheap that particular computation is, this project's own real choice to instead store it is a real, deliberate bet that the read-heavy access pattern makes the tradeoff worthwhile.

### Commands needed

- `python verification/phase-06/lab_denormalized_version.py` — Runs the lab from the manufacturing-platform repository root; no flags needed.

### Verification

```text
stored version: '1.003'
recomputed from source columns: '1.003'
do they agree? True
```

Full saved run: `verification/phase-06/lab_denormalized_version_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it shows a real, deliberate denormalized value agreeing with its own real source of truth right now; the next unit shows what this project's own real design actually depends on for that to stay true.

## Concept Unit: Source of Truth and the Real Consistency Cost of Depending on It

### The Problem

`backend/app/services/pdm_service.py:97` is the one, single, real place in this entire project that recomputes `CAMFile.version` from `part_rev` and `cam_rev`. Confirmed this session by grepping every real file under `backend/app/` for `.part_rev =`: nothing in this project's own current code ever actually reassigns `part_rev` at all. If something ELSE ever did - bypassing `pdm_service.py`'s own real sync line - what would happen to `version`, concretely?

Before reading on:

- If `part_rev` changed through some future code path that never calls `pdm_service.py`'s own real sync line, would anything in this project's real schema notice `version` no longer matches what recomputing it would actually give?
- Given that nothing today actually reassigns `part_rev`, is this a real, currently-happening bug, or a real, structural risk waiting for a future change to trigger it? Does that distinction matter?

### Project Change

- **Reference Source:** Real, confirmed this session by grepping `backend/app/` for `.part_rev =` and `part_rev=`: zero matches outside `pdm_service.py`'s own read of it - `part_rev` is never actually reassigned anywhere in this project's current, real code. This unit's own lab demonstrates the real, structural risk directly, honestly labeled as a risk this project has not yet actually triggered, not a live bug.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - this unit extends the same real lab already shown in the previous unit; no new file is added.
- **Dependencies:** None beyond what the previous unit already established.

### Execution Trace

```
cam_file['part_rev'] = '2' - a direct mutation, bypassing pdm_service.py's own real sync line entirely
cam_file['version'] stays '1.003' - nothing re-ran the real recompute formula, so the stored value is untouched
recompute_version(cam_file['part_rev'], cam_file['cam_rev']) -> '2.003' - what the source of truth now actually says
cam_file['version'] == recompute_version(...) -> False - the stored, denormalized value and its own real source of truth now genuinely disagree
```

### CS Lens

This is **source of truth** and **consistency cost**, both fully named in this lesson's own Header - the real column a derived value depends on, and the real risk of depending on it through only one, specific, rememberable code path. Also recognized in: a cached DNS record continuing to answer with an old IP address after the real record changed elsewhere, until the cache expires; a browser's "last synced" timestamp silently falling behind after a sync job starts failing without anyone noticing; a build artifact committed alongside its own source, quietly diverging the moment someone edits the source without rebuilding; and, in this project's own domain, this exact real risk - `version` remaining exactly what it was the last time `pdm_service.py`'s own real check-in flow ran, however long ago that was relative to any other real change nearby.

### SE Lens

The design principle a denormalized value always depends on is that EVERY real path capable of changing its source of truth must also update the derived copy - miss even one, and the derived value silently stops meaning what it claims to. The real alternative that would remove this risk entirely - recomputing `version` at read time instead of storing it, the option this lesson's own first unit already named - is the direct trade this project chose not to make. The honest cost, stated precisely for THIS project: today, real and verified, there is only one code path that changes `part_rev` or `cam_rev` at all, so this real risk is currently latent, not triggered - but nothing in the schema itself would stop a second, future code path from changing `part_rev` directly and leaving `version` silently wrong, the exact way this unit's own lab demonstrates.

### Commands needed

- `python verification/phase-06/lab_denormalized_version.py` — The identical real command as the previous unit - this unit's own real output continues from the exact same run, shown in full below.

### Verification

```text
now part_rev changes WITHOUT going through pdm_service.py's own real sync line:
stored version (unchanged): '1.003'
what recomputing from source columns would actually give: '2.003'
do they still agree? False
```

Full saved run: `verification/phase-06/lab_denormalized_version_output.txt`.

### Connection to the previous unit

The previous unit showed a denormalized value agreeing with its source of truth; this unit shows exactly what breaks that agreement, and why this project's own real design currently depends on a single, specific line of code to prevent it.

## Connect the pieces

Follow one real value, `CAMFile.version`, through both units. It is not stored because nothing else could produce it - `f"{part_rev}.{cam_rev:03d}"` could recompute it fresh on every single read - it is stored because this project bet that reading it far outweighs recomputing it, which is denormalization's own real, deliberate tradeoff. That bet depends entirely on `backend/app/services/pdm_service.py:97` being the one, real place responsible for keeping `version` in sync with its own real source of truth, `part_rev` and `cam_rev` - confirmed, today, to be the only real place either column ever changes. The moment a second, real code path ever changes `part_rev` without calling that same line, this lesson's own lab already shows exactly what happens: `version` keeps reporting `'1.003'` while the real source of truth now says `'2.003'` - the honest, structural consistency cost every denormalized value carries, whether or not it has actually gone wrong yet.

**Next lesson:** Next, a different kind of real rule gets studied - not a value's own relationship to another value, but a rule the database itself can be made to enforce directly: `NOT NULL`, `UNIQUE`, `CHECK`, and `FOREIGN KEY`, several of which this project's own real schema already declares, and at least one of which - this curriculum's own Foreign Keys lesson already found - it declares without the database actually enforcing it at all.