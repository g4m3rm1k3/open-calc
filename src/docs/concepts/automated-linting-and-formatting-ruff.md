# Concept: Automated Linting and Formatting (`ruff`)

**What you'll understand by the end:** `ruff` as one real tool doing
two distinct jobs — a **linter** (catching real style violations and
bug-prone patterns) and a **formatter** (automatically rewriting code
to a canonical style) — and what each actually does to real code,
including what a linter can and can't fix on its own.

**Prerequisites:** `python-pyproject-toml-project-manifest.md`.

## Setup

Python 3 with `pip install ruff`.

## The Problem

As a real codebase grows and more than one person (or more than one
sitting, weeks apart) touches it, small, real inconsistencies
accumulate: unsorted imports, unused imports left behind after a
refactor, lines that grow too long to read comfortably, subtly
bug-prone patterns a human reviewer might miss. Catching and fixing
these by hand, consistently, across an entire real codebase doesn't
scale — a real, automated tool that both *flags* real problems and
*rewrites* code to a consistent style removes the need for manual
enforcement entirely.

## The Isolated Example

A real, deliberately messy file:

```python
import sys
import os
import json


def load_config(path):
    with open(path) as f:
        data = json.load(f)
    return data


def compute_total(items):
    total = 0
    for item in items:
        total = total + item["price"] * item["quantity"]
    return total


unused_variable = "never used anywhere"
x = compute_total([{"price": 1000000000, "quantity": 999999999, "extra_field_to_make_this_line_genuinely_long": True}])
```

Running `ruff check messy.py --select E,F,I,UP,B` (the **linter**):

**Real output, run this session:**
```
I001 [*] Import block is un-sorted or un-formatted
 --> messy.py:1:1
help: Organize imports

F401 [*] `sys` imported but unused
 --> messy.py:1:8
help: Remove unused import: `sys`

F401 [*] `os` imported but unused
 --> messy.py:2:8
help: Remove unused import: `os`

E501 Line too long (119 > 88)
  --> messy.py:20:89

Found 4 errors.
[*] 3 fixable with the `--fix` option.
```

Running `ruff check messy.py --select E,F,I,UP,B --fix` (actually
applying the fixable ones):

**Real output, run this session:**
```
E501 Line too long (119 > 88)
Found 3 errors (2 fixed, 1 remaining).
```

**The real file's content after `--fix`:**
```python
import json


def load_config(path):
    with open(path) as f:
        data = json.load(f)
    return data


def compute_total(items):
    total = 0
    for item in items:
        total = total + item["price"] * item["quantity"]
    return total


unused_variable = "never used anywhere"
x = compute_total([{"price": 1000000000, "quantity": 999999999, "extra_field_to_make_this_line_genuinely_long": True}])
```

**What this proves:** `--fix` genuinely removed both unused imports
(`sys`, `os`) and re-sorted what remained — real, automatic edits to
the actual file on disk — while leaving `unused_variable` completely
untouched (it's a real, different rule, `F841`, deliberately not
included in `--select` here) and leaving the long `x = ...` line
**unfixed** too: `Found 3 errors (2 fixed, 1 remaining)` shows the
linter correctly identified the long line but couldn't auto-fix it
itself — reformatting a line's actual structure is the **formatter**'s
job, not the linter's.

Running `ruff format --diff messy.py --line-length 60` (the
**formatter**, shown as a diff rather than applied):

**Real output, run this session:**
```
--- messy.py
+++ messy.py
@@ -17,4 +17,12 @@
 unused_variable = "never used anywhere"
-x = compute_total([{"price": 1000000000, "quantity": 999999999, "extra_field_to_make_this_line_genuinely_long": True}])
+x = compute_total(
+    [
+        {
+            "price": 1000000000,
+            "quantity": 999999999,
+            "extra_field_to_make_this_line_genuinely_long": True,
+        }
+    ]
+)

1 file would be reformatted
```

**What this proves:** the formatter did what the linter's `--fix`
couldn't — it genuinely restructured the long line across multiple
real lines, respecting the configured `line-length`, with correct,
consistent indentation — a real, structural rewrite, not just a report.

## Mechanical Walkthrough

- **Linting** (`ruff check`) analyzes code for real, specific rule
  violations, each identified by a real code (`E501`, `F401`, `I001`,
  ...) grouped into real rule **categories**: `E` (pycodestyle style
  errors), `F` (pyflakes — real correctness issues like unused
  imports/variables), `I` (import sorting), `UP` (pyupgrade — outdated
  syntax that could use a newer equivalent), `B` (flake8-bugbear — real,
  bug-prone patterns). `--select` names exactly which categories to
  check.
- Each finding is reported with a real file location, a human-readable
  message, and — for some rules — marked `[*]` as auto-fixable.
- `--fix` applies every auto-fixable finding directly to the real file
  on disk; findings without an automatic fix (like the long line here)
  are still reported but left for a human, or the formatter, to resolve.
- **Formatting** (`ruff format`) is a genuinely separate command from
  linting — it doesn't check for "violations" at all; it deterministically
  rewrites code to one canonical style (line length, quote style,
  spacing, wrapping), the same way every time, regardless of how the
  original code happened to be written.
- `--diff` shows what the formatter *would* change without actually
  writing it — real, useful for reviewing a formatter's intended effect
  before applying it, or for checking (in CI) whether a file is already
  correctly formatted.

## CS Lens

Linting and formatting solve two related but genuinely distinct
problems: a **linter** is a real, specialized static-analysis tool —
narrower than a full type checker (`mypy`), but still analyzing code
without running it, flagging patterns statically determined to be
wrong or risky. A **formatter** does no analysis of correctness at
all — it's a deterministic **transformation**: the same input always
produces the same output, with no judgment calls about whether the
code is "right," only about how it should look.

Also recognized in: ESLint (linter) + Prettier (formatter) in the
JavaScript/TypeScript ecosystem — the identical real two-tool split,
just with two separate tools rather than one combined one; `gofmt` in
Go, notably a formatter with **no configuration options at all**,
deliberately removing style debates entirely by making the canonical
style non-negotiable.

## SE Lens

The real, practical value: once a formatter is adopted, "how should
this line be wrapped" stops being a real question a human ever needs to
answer or debate in code review — the tool decides, consistently,
every time. A linter's real value compounds further: `F401` (unused
imports) and similar rules catch a genuine, small class of real bugs
and dead code automatically, on every single commit, rather than
relying on a human reviewer noticing them by chance. The real,
honest limit: a linter only catches what its rules are written to
catch — it's real, valuable automation, not a substitute for actual
review or testing of a program's real behavior.

## Connection

Builds on `python-pyproject-toml-project-manifest.md` — a real
project's linter/formatter configuration (rule selection, line length)
lives in that same manifest file, under `[tool.ruff]` sections. Distinct
from `python-function-type-hints.md`/`mypy` — a type checker analyzes
*type correctness*; a linter analyzes *style and common bug patterns*;
neither substitutes for the other, and real projects commonly run both.

## Try It Yourself

1. Add a real, outdated-syntax pattern the `UP` (pyupgrade) category
   would flag — for example, `"%s" % name` instead of an f-string — and
   confirm `ruff check --select UP --fix` rewrites it automatically.
2. Run `ruff format` (without `--diff`) on the original messy file and
   confirm it actually writes the reformatted result to disk, then
   re-run it a second time and confirm it reports zero further changes
   — a real, concrete demonstration that formatting is **idempotent**
   (`idempotent-initialization-guard.md`'s own idea, applied to a
   formatting tool rather than program startup).
3. Deliberately configure a very short `line-length` (say, `20`) and
   observe how aggressively the formatter restructures even simple
   code — reasoning about why real projects typically pick a length
   closer to 80-100 rather than an extreme in either direction.

## A Real Further Fact: `UP015` — a Redundant, Auto-Fixable Default Argument

A further, real `UP` (pyupgrade) rule, beyond the ones this file's own
first example already triggers:

```python
def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
```

Running `ruff check sample.py --select UP015`:

**Real output, run this session:**
```
UP015 [*] Unnecessary mode argument
 --> sample.py:2:21
  |
1 | def load(path):
2 |     with open(path, "r", encoding="utf-8") as f:
  |                     ^^^
3 |         return f.read()
  |
help: Remove mode argument
  |
1 | def load(path):
  -     with open(path, "r", encoding="utf-8") as f:
2 +     with open(path, encoding="utf-8") as f:
3 |         return f.read()
  |

Found 1 error.
[*] 1 fixable with the `--fix` option.
```

**What this proves:** `"r"` (read mode) is already `open()`'s own real
default — writing it explicitly changes nothing about the file's
actual behavior, it's purely redundant text. `ruff` genuinely detects
this specific, narrow pattern (a literal `"r"` as the second positional
argument to `open`) and offers an automatic fix, shown here as the same
real `--fix`-applied diff style as this file's own first example.

**Mechanical note — why a linter bothers flagging something with zero
behavioral effect:** this is a real, small readability concern, not a
correctness one — a reader briefly has to confirm `"r"` isn't hiding
some non-default detail before recognizing it's simply the default
spelled out. Removing it doesn't change what the code *does*; it
changes how quickly a reader can confirm what the code does, which is
exactly the kind of low-stakes, mechanical cleanup a linter's `--fix`
is well suited to apply automatically, without ever needing a human to
manually verify each individual occurrence across a real codebase.

### Try It Yourself (UP015)

1. Change the mode to `"rb"` (binary read) and confirm `UP015` no
   longer fires — real, direct proof the rule specifically targets the
   redundant *default* case, not the presence of a mode argument in
   general.
2. Search this project's own real `build-log/` history for a step that
   introduced a redundant `"r"` and a later step that removed it
   (Step 113 added `open(target_path, "r", encoding="utf-8")`; Step 114
   removed the `"r"`) — real, direct proof of a linter finding real,
   already-shipped debt after the fact, not just catching new code as
   it's written.
