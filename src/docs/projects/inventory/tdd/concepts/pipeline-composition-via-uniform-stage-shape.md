# Concept: Pipeline Composition via a Uniform Stage Shape

**What you'll understand by the end:** why giving every stage of a
multi-step transformation the *identical* input and output shape lets
those stages compose freely — reordered, mixed, or run as any subset —
with zero adapter code between them, and the real, silent corruption
that shows up the moment one stage's shape doesn't match its
neighbors.

**Prerequisites:** `function-composition.md`.

## Setup

None — plain Python, no packages.

## The Problem

A multi-step transformation (clean up text, then reformat it, then
apply a further rule) is often built as a real sequence of functions,
each one doing its own real piece of the work. If each function's
input and output *shape* differs from its neighbors, wiring them
together needs real, bespoke glue code between every pair — and
worse, if a shape mismatch is never actually checked, later stages can
silently misinterpret what an earlier stage produced, without any real
error ever being raised.

## The Isolated Example

Every stage sharing the identical shape (`list[str] -> list[str]`):

```python
def strip_blank_lines(lines):
    return [line for line in lines if line.strip() != ""]


def expand_tabs(lines):
    return [line.replace("\t", "    ") for line in lines]


def uppercase_headers(lines):
    return [line.upper() if line.startswith("#") else line for line in lines]


def run_pipeline(lines, stages):
    for stage in stages:
        lines = stage(lines)
    return lines


raw = ["# title", "", "\tsome text", "more text", ""]

result = run_pipeline(raw, [strip_blank_lines, expand_tabs, uppercase_headers])
print(result)

# Reordering the SAME stages works with zero adapter code -- every
# stage takes and returns the identical shape (list[str]).
result_reordered = run_pipeline(raw, [uppercase_headers, expand_tabs, strip_blank_lines])
print(result_reordered)
```

**Real output, run this session:**
```
['# TITLE', '    some text', 'more text']
['# TITLE', '    some text', 'more text']
```

**What this proves:** the exact same three stages, run in **two
genuinely different orders**, produce the identical, correct real
result — no adapter, no reshaping code anywhere. `run_pipeline` itself
never needed to know anything about what each stage *does*, only that
every one of them accepts and returns `list[str]` — that shared shape
is the entire real contract making arbitrary reordering and
composition safe.

The real danger — one stage silently breaking the shared shape:

```python
def join_into_one_string(lines):
    return "\n".join(lines)  # BREAKS the shape -- returns a str, not list[str]


raw2 = ["a", "", "b"]
broken_result = run_pipeline(raw2, [strip_blank_lines, join_into_one_string, expand_tabs])
print(broken_result)
```

**Real output, run this session:**
```
['a', '\n', 'b']
```

**What this proves:** `join_into_one_string` genuinely broke the
shared `list[str]` shape, returning one plain `str` instead — but
nothing **crashed**. `expand_tabs`'s own list comprehension iterated
over that string *character by character* (a `str` is itself
iterable), silently producing a list of individual **characters**
(`'a'`, `'\n'`, `'b'`) rather than a list of **lines** — a real,
structurally different, silently wrong result, with no error anywhere
signaling that anything went wrong at all.

## Mechanical Walkthrough

- A **uniform stage shape** means every stage's own function signature
  — both what it accepts and what it returns — is identical across
  every stage in the pipeline, regardless of what real transformation
  each one performs internally.
- `run_pipeline` itself is genuinely **generic** over the actual
  stages — it never inspects what any stage does, only threads its own
  output into the next stage's own input, trusting the shared shape
  contract to hold.
- When every stage honors that shape, **any** subset, in **any**
  order, composes safely — the real, concrete payoff demonstrated by
  the two different real orderings above producing identical, correct
  results.
- When one stage silently returns a *different* real shape, nothing in
  `run_pipeline` catches it — Python doesn't enforce the shape contract
  at all; the next stage simply runs against whatever it actually
  received, sometimes crashing, sometimes (as shown here) silently
  producing a plausible-looking but structurally wrong real result.

## CS Lens

This is the real **pipe-and-filter architectural pattern** — a series
of independent processing stages ("filters"), each consuming and
producing data in a shared, uniform format, connected by simple
sequential data flow ("pipes"). The uniform format is what makes the
architecture's own defining property possible: filters can be added,
removed, or reordered without changing any other filter, because none
of them depend on anything beyond the shared shape.

Also recognized in: Unix shell pipes (`cmd1 | cmd2 | cmd3`, where the
uniform shape is "a stream of bytes/lines," letting any real Unix
command compose with any other); a functional-programming `map`/
`filter`/`reduce` chain, each stage taking and returning the same
kind of iterable; a real image-processing pipeline where every filter
takes and returns the identical pixel-buffer format, regardless of
what specific visual transformation each one applies.

## SE Lens

The real, practical payoff: adding a new stage, or reordering existing
ones, requires touching **only** the list of stages passed to
`run_pipeline` — never `run_pipeline` itself, and never any other
stage's own code. The real, honest cost this file's own second example
demonstrates directly: Python's own dynamic typing doesn't enforce the
shape contract at all, so a stage that silently breaks it doesn't
necessarily crash — it can produce a real, plausible-looking, silently
**wrong** result instead, which is a genuinely worse failure mode than
an immediate, loud error. Real, type-checked pipelines (via type hints
and mypy, or a stricter language) can catch this class of mistake
before the code ever runs, rather than only at runtime, or not at all.

## Connection

Builds on `function-composition.md` for the general idea of chaining
functions together. A real, applied instance in this project's own
history: two independent, real text-transformation stages — a macro
interpreter's own `resolve()` and a canned-cycle expander's own
`expand_canned_cycles()` — both sharing the identical real
`Iterable[tuple[int, str]] -> list[tuple[int, str]]` shape, letting
them compose into a real, explicit two-stage pipeline (macros resolve
first, canned cycles expand second) feeding a single, unmodified
downstream motion parser — each stage was written and could be tested
completely independently, with the shared shape alone making their
composition safe.

## Try It Yourself

1. Add a fourth stage sharing the identical `list[str] -> list[str]`
   shape and confirm it can be inserted at any position in the stage
   list — beginning, middle, or end — with `run_pipeline` itself
   needing no changes at all.
2. Add a real, explicit shape check inside `run_pipeline` (`assert
   isinstance(lines, list)`, per `python-isinstance.md`, after each
   stage runs) and confirm it now catches `join_into_one_string`'s own
   shape violation immediately, with a clear error, instead of letting
   it silently corrupt the next stage's input.
3. Add real Python type hints (`list[str] -> list[str]`) to every
   stage function, including the deliberately broken
   `join_into_one_string`, and run `mypy` against the file — confirm
   it catches the shape mismatch statically, before the code ever runs
   at all, the identical real class of bug `python-mypy-static-type-
   checking.md` demonstrates catching elsewhere.
