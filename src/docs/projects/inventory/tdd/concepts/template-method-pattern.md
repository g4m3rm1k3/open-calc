# Concept: The Template Method Pattern

**What you'll understand by the end:** how a base class can own an
entire algorithm's fixed shape and control flow while letting each
subclass fill in only the specific steps that genuinely differ, and how
this is a real, checked GoF pattern — not just "inheritance."

**Prerequisites:** `python-inheritance-and-super.md`.

## Setup

None — plain Python, no packages.

## The Problem

Several real variations of the same overall process (exporting a report
as CSV, as a Markdown table, as anything else) often share an identical
*shape* — build a header, process each row, build a footer, join it all
together — while differing only in the *details* of a couple of those
steps. Writing each variation as a fully separate function duplicates
the shared shape every time; a naive shared helper taking a pile of
callback parameters for every varying step gets unwieldy fast once
there's more than one or two.

## The Isolated Example

```python
class ReportExporter:
    """The base class owns the whole algorithm -- subclasses fill in
    exactly the steps that differ."""

    def export(self, rows):
        output = []
        output.append(self.format_header())
        for row in rows:
            output.append(self.format_row(row))
        output.append(self.format_footer())
        return "\n".join(output)

    def format_header(self):
        return ""  # default: no header

    def format_footer(self):
        return ""  # default: no footer

    def format_row(self, row):
        raise NotImplementedError("subclasses must implement format_row")


class CsvExporter(ReportExporter):
    def format_header(self):
        return "name,age"

    def format_row(self, row):
        return f"{row['name']},{row['age']}"


class MarkdownTableExporter(ReportExporter):
    def format_header(self):
        return "| name | age |\n|---|---|"

    def format_row(self, row):
        return f"| {row['name']} | {row['age']} |"


rows = [{"name": "Ana", "age": 30}, {"name": "Lee", "age": 25}]

print(CsvExporter().export(rows))
print("---")
print(MarkdownTableExporter().export(rows))
```

**Real output, run this session:**
```
name,age
Ana,30
Lee,25

---
| name | age |
|---|---|
| Ana | 30 |
| Lee | 25 |
```

**What this proves:** `export()` — the real algorithm's shape (header,
then every row, then footer, joined together) — is written exactly
**once**, in the base class, and never appears in either subclass.
`CsvExporter` and `MarkdownTableExporter` each only supply their own
`format_header`/`format_row`, and produce genuinely different real
output despite calling the identical inherited `export()` method.

## Mechanical Walkthrough

- The **template method** (`export`) lives in the base class and
  defines the fixed, unchanging sequence of steps — it is never
  overridden by a subclass.
- Some steps it calls (`format_row`) are **abstract hooks** — the base
  class provides no real implementation (`raise NotImplementedError`),
  forcing every subclass to supply its own.
- Other steps (`format_header`, `format_footer`) are **hooks with a
  default** — the base class supplies a reasonable no-op behavior
  (an empty string), which a subclass is free to override, or just
  leave alone if the default is already correct for it.
- When `CsvExporter().export(rows)` runs, `export` itself is the
  *base* class's method — but every call to `self.format_row(...)`
  inside it dispatches, via ordinary Python method resolution, to
  `CsvExporter`'s own override, not the base class's `NotImplementedError`
  stub. The base class controls *when* and *how often* each hook runs;
  the subclass only controls *what* each hook actually does.

## CS Lens

This is the GoF **Template Method** pattern: an algorithm's invariant
structure is defined once, in a base class, with specific steps
deferred to subclasses via method overriding. It differs from the
**Strategy** pattern (a *whole* algorithm swapped out via composition,
passed in as an object) in a specific way: here, only individual
*steps* vary, injected through inheritance and overriding, while the
overall sequence and control flow stay fixed and are never something a
subclass can rearrange or skip.

Also recognized in: a testing framework's `setUp()`/`test_*()`/
`tearDown()` lifecycle (the framework calls all three, in that fixed
order, for every test; each test class only fills in the middle);
`QSyntaxHighlighter` in Qt-based GUIs (the base class owns *when* to
re-highlight and *which* block of text is currently being processed,
calling back into a subclass's single `highlightBlock(text)` override
for the one real decision it needs — see `pyside6-qsyntaxhighlighter-
and-qtextcharformat.md` for that real, applied instance).

## SE Lens

The real, practical payoff: adding a *third* export format
(`JsonExporter`, say) requires writing only its own `format_header`/
`format_row` — the row-iteration loop, the join logic, and the overall
shape are never re-typed, never re-tested for that concern again, and
can't drift out of sync between formats the way copy-pasted functions
eventually do. The real cost: a subclass can only vary what the base
class has explicitly exposed as an overridable hook — if a genuinely
new variation needs to change something the template method itself
hard-codes (say, the separator between rows), that requires modifying
the base class itself, affecting every subclass at once.

## Connection

Builds on `python-inheritance-and-super.md`'s inheritance mechanics.
This project's own second real, checked instance of a GoF pattern —
Singleton (`pyside6-headless-gui-testing.md`) was the first, found
incidentally inside a testing concept; this one is squarely the whole
point of the class it appears in (`QSyntaxHighlighter`). Distinct from
`adapter-pattern.md`'s Adapter (translating between two existing
interfaces) — Template Method instead defines a *shared, reusable
algorithm* that specific subclasses complete.

## Try It Yourself

1. Add a `JsonExporter` (using Python's `json` module to build each
   row) and confirm `export()` requires zero changes to support it.
2. Override `format_footer` in one subclass (say, `CsvExporter`, adding
   a trailing summary line) and confirm the *other* subclass's output
   is completely unaffected — hooks are overridden independently.
3. Try calling `ReportExporter().export(rows)` directly, on the base
   class itself (no subclass) — confirm the real `NotImplementedError`
   this raises, and explain why that's the correct, deliberate behavior
   for an abstract hook with no sensible default.
