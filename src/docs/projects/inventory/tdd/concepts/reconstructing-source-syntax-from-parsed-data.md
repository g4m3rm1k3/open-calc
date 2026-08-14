# Concept: Reconstructing Source Syntax from Parsed Data

**What you'll understand by the end:** why turning structured, parsed
data back into the specific text syntax it came from is a distinct
problem from generic serialization (`serialization-deserialization.md`)
— one with its own real correctness traps — and how to solve the
central one: preserving information the parser extracted into a
*separate* field, not the structure being reconstructed from.

**Prerequisites:** `serialization-deserialization.md`.

## Setup

Python 3 (or any language), no packages needed.

## The Problem

`serialization-deserialization.md` covers turning data into a generic
interchange format (JSON) and back — a format designed for exactly this
round trip, with no information ever silently split off to the side.
Reconstructing a specific, pre-existing text *syntax* — a G-code line,
a URL, a config file's own custom format — from data a parser already
extracted is a related but different problem: a real parser commonly
captures some information as a separate, sibling field (a comment, a
flag, a line number) rather than folding it into the main structure it
returns. Reconstructing the original syntax from *only* that main
structure silently drops whatever was captured on the side — a real,
easy-to-miss trap this concept exists to name directly.

## The Isolated Example

A tiny parser for lines like `key=value // a comment`, deliberately
built the same way many real parsers are — the comment lives in its
own return field, not inside the parsed key/value structure:

```python
def parse(line):
    code, _, comment = line.partition("//")
    key, _, value = code.strip().partition("=")
    return {"key": key.strip(), "value": value.strip()}, comment.strip()


data, comment = parse("mode=fast // real, deliberate note")
print(data, repr(comment))

# The naive reconstruction -- rebuilds only from `data`:
naive = f"{data['key']}={data['value']}"
print(repr(naive))
```

**Real output:**
```
{'key': 'mode', 'value': 'fast'} 'real, deliberate note'
'mode=fast'
```

**What this proves:** the comment parsed out correctly and is sitting
right there in `comment` — but the naive reconstruction never looks at
it, so `'mode=fast'` silently drops `'real, deliberate note'` entirely,
even though nothing crashed and nothing looked wrong from inside the
reconstruction function itself.

**The fix — reconstruct from every real field the parser returned, not
just the one that looks like "the data":**

```python
def reconstruct(data, comment):
    line = f"{data['key']}={data['value']}"
    if comment:
        line += f" // {comment}"
    return line


print(repr(reconstruct(data, comment)))
```

**Real output:**
```
'mode=fast // real, deliberate note'
```

## Mechanical Walkthrough

- `line.partition("//")` — splits on the first occurrence of a
  separator, returning a 3-tuple (before, separator, after); the
  comment is captured as its own, separate return value, never folded
  into `data`.
- The naive reconstruction only reads `data` — a real, easy mistake,
  since `data` genuinely does hold "the parsed data" and looks complete
  on its own.
- The fix reads *every* value the parser actually returned (`data` and
  `comment` both), reconstructing the full original line, not just the
  part that lived in the most obvious-looking structure.

## CS Lens

This is the inverse of parsing — sometimes called **unparsing**,
**pretty-printing**, or (for a full syntax tree rather than a flat
line) **code generation**. The general shape recurs anywhere a system
reads structured meaning out of text and later needs to produce
equivalent text back: an AST-to-source formatter, a database query
builder's `.to_sql()` method, a config-file library's own "write back"
function.

Also recognized in: a linter's "autofix" feature (parses code, edits
the parsed representation, writes real source text back out); an ORM
generating a real `UPDATE` statement from a changed in-memory object; a
word processor's own "Save" reconstructing a real file format from its
in-memory document model.

## SE Lens

The real, load-bearing design question this concept forces: **does the
reconstruction need to preserve the original text byte-for-byte
(whitespace, comment style, formatting), or is regenerating it from
canonical rules good enough?** Byte-for-byte preservation requires
tracking far more than "the parsed data" — every whitespace choice, every
formatting quirk — and is what tools like `autopep8`/`prettier` invest
heavily in getting right. Regenerating from canonical rules (as this
concept's fix does) is simpler and often the correct tradeoff when the
reconstructed output only needs to be *equivalent*, not *identical* —
at the real, accepted cost of reformatting whatever the original text's
own style happened to be.

## Connection

Builds on `serialization-deserialization.md` (the same "structure ↔
text" round-trip idea) but is a distinct concept per the 100%-match
rule: JSON serialization targets one generic, self-describing format;
this concept targets reconstructing one *specific*, pre-existing
syntax a custom parser already understands, where information can be
scattered across several separate return values rather than living in
one payload.

## Try It Yourself

1. Extend `parse`/`reconstruct` with a third real field this parser
   extracts separately (e.g. a leading `!` marking the line as
   "disabled") and confirm the naive, `data`-only reconstruction drops
   it exactly the same way the comment was dropped above.
2. Change `reconstruct` to preserve the *original* spacing around `=`
   (capture it as its own field during parsing, use it during
   reconstruction) instead of always emitting `key=value` with no
   spaces — a small, concrete step toward "byte-for-byte" fidelity,
   named in the SE Lens as the harder, more expensive alternative.
3. Parse a line, reconstruct it, then parse the *reconstruction* a
   second time — confirm the two parsed results are equal even when the
   two raw text strings themselves are not (e.g. original spacing
   normalized away) — the real, practical definition of "equivalent,
   not identical" this concept's fix accepts.
