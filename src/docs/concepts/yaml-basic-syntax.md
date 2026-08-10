# Concept: YAML — Basic Syntax (Indentation, Lists, Mappings)

**What you'll understand by the end:** enough real YAML syntax to read
a real config file — indentation-based nesting, lists via a leading
`- `, and `key: value` mappings — and why YAML's structure is defined
entirely by whitespace, with no closing braces or brackets at all.

**Prerequisites:** none beyond the assumed floor.

## Setup

Python 3 with `pip install pyyaml`.

## The Problem

Many real tools (CI pipelines, pre-commit hooks, Docker Compose,
Kubernetes) need a config file format that's genuinely easy for a human
to read and hand-edit, more so than JSON's mandatory quotes and braces
allow. YAML fills that real role — but its meaning is carried entirely
by **indentation**, which reads naturally once understood but produces
real, sometimes-confusing errors when it's off by even one space.

## The Isolated Example

```python
import yaml

doc = """
project: sample-app
version: 1
checks:
  - name: lint
    command: run-lint
  - name: tests
    command: run-tests
settings:
  strict: true
  max_line_length: 100
"""

parsed = yaml.safe_load(doc)
print("project:", parsed["project"])
print("first check's name:", parsed["checks"][0]["name"])
print("number of checks:", len(parsed["checks"]))
print("settings.strict is a real bool:", parsed["settings"]["strict"] is True)
```

**Real output, run this session:**
```
project: sample-app
first check's name: lint
number of checks: 2
settings.strict is a real bool: True
```

A real, common mistake — inconsistent indentation:

```python
bad_doc = """
settings:
  strict: true
   max_line_length: 100
"""

try:
    yaml.safe_load(bad_doc)
except yaml.YAMLError as e:
    print(f"YAMLError: {e}")
```

**Real output, run this session:**
```
YAMLError: mapping values are not allowed here
  in "<unicode string>", line 4, column 19:
       max_line_length: 100
                      ^
```

**What this proves:** the first document parsed into a real, ordinary
Python `dict` — `parsed["checks"]` came back as a real `list` of two
`dict`s, and `parsed["settings"]["strict"]` came back as a genuine
Python `bool` (`is True`, not the string `"true"`) — YAML's own scalar
types map onto real Python types automatically. The second document,
with `max_line_length` indented **one space further** than `strict`
(both meant to be siblings under `settings`), produced a real, specific
parse error — YAML uses indentation itself to decide what's nested
inside what, so an inconsistent indent isn't cosmetic, it's a genuine
structural error.

## Mechanical Walkthrough

- `key: value` is YAML's real **mapping** syntax (like a JSON object's
  key-value pair, or a Python `dict` entry) — the colon must be
  followed by a space before the value.
- Nesting is expressed purely through **indentation depth** — everything
  indented further than `settings:` and directly beneath it (`strict`,
  `max_line_length`) is a real, nested mapping *inside* `settings`, with
  no closing brace needed to mark where it ends; the *next* line at the
  original, shallower indentation level is what signals "this nested
  block is over."
- A leading `- ` (dash, then a space) marks each real item of a
  **list/sequence** — `checks:` followed by two `- name: ...` entries
  is a real list of two mappings, each one itself a `key: value` block
  (`name` and `command` are siblings within their own list item).
- Plain, unquoted values (`sample-app`, `true`, `100`) are parsed as
  YAML's own real scalar types — a bare `true`/`false` becomes a real
  boolean, a bare integer becomes a real `int` — not left as strings
  the way an unquoted JSON value never would be allowed at all.
- Because there are no closing braces or brackets, **every real level of
  nesting must use a consistent number of indentation spaces** — mixing
  tabs and spaces, or using an inconsistent number of spaces for
  siblings meant to be at the same level, is a genuine structural error,
  not a style preference.

## CS Lens

This is a real, deliberate design tradeoff: YAML trades JSON's explicit,
unambiguous delimiters (`{`, `}`, `[`, `]`, mandatory quotes) for
implicit, whitespace-based structure — genuinely easier for a human to
read and hand-write, at the real cost of being more fragile to get
exactly right, and requiring a real parser to track indentation depth
precisely the way Python's own interpreter does for indented code
blocks.

Also recognized in: Python's own indentation-based block structure
(the identical underlying tradeoff — implicit structure via whitespace,
versus C-family languages' explicit `{`/`}`); Markdown's own nested-list
indentation rules, which carry a similar real "get the indentation
exactly right or the structure breaks" property.

## SE Lens

The real, practical payoff: a real YAML config file (CI pipelines,
pre-commit hooks, Docker Compose) reads almost like plain, structured
English once formatted well — genuinely easier for a team to review in
a pull request than the equivalent JSON. The real, honest cost: a
single misplaced or missing space produces an error that can look
unrelated to the actual mistake (as `bad_doc`'s real error shows,
pointing at the *value*, not explicitly saying "your indentation is
inconsistent") — worth knowing to check indentation first whenever a
real YAML parse error looks confusing.

## Connection

First real appearance of YAML syntax in this catalog — every future
concept involving a real `.yaml`/`.yml` config file (CI pipelines,
pre-commit hooks) cites this file for the base syntax rather than
re-deriving it, per `../concepts/README.md`'s own "reference
implementation first, cite afterward" discipline.

## Try It Yourself

1. Add a third item to the `checks` list with a nested list of its own
   (say, `tags: [fast, required]`) using YAML's real, alternative
   **flow** syntax (`[item1, item2]`, resembling a JSON array directly)
   and confirm `yaml.safe_load` parses it identically to the equivalent
   block-style (`- ` prefixed) list.
2. Quote a value that would otherwise be misparsed — write `version:
   "1.0"` instead of `version: 1.0` — and confirm the quoted version
   comes back as a real Python `str`, while the unquoted one would
   parse as a `float`, a real, easy-to-miss distinction.
3. Deliberately mix tabs and spaces in one nested block and observe the
   real error YAML produces — most real YAML specifications disallow
   tabs for indentation entirely; confirm this for yourself rather than
   assuming.

## A Second Real Facet: Block Scalars (`|`) for Multi-Line Values

Every value shown so far has been a single line. A real, common need —
a multi-line shell command as one value — uses YAML's **block scalar**
syntax:

```python
import yaml

doc = """
steps:
  - name: Install Qt runtime dependencies
    run: |
      sudo apt-get update
      sudo apt-get install -y libegl1
  - name: Run tests
    run: pytest
"""

parsed = yaml.safe_load(doc)
first_run = parsed["steps"][0]["run"]
second_run = parsed["steps"][1]["run"]
print(repr(first_run))
print("first run is a real multi-line string:", "\n" in first_run)
print("second run has no embedded newline:", "\n" not in second_run)
```

**Real output, run this session:**
```
'sudo apt-get update\nsudo apt-get install -y libegl1\n'
first run is a real multi-line string: True
second run has no embedded newline: True
```

**What this proves:** `run: |` produced a single real string value
containing a genuine embedded newline (`\n`) between the two shell
commands — the entire indented block beneath `run: |` becomes **one**
scalar value, line breaks preserved, not a list of separate lines. The
plain `run: pytest` on the very next step, with no `|`, stayed a real,
ordinary single-line string, confirming `|` is opt-in syntax for
exactly the cases that need it.

### Try It Yourself (second facet)

1. Replace `|` with `>` (YAML's **folded** block scalar) on the same
   multi-line value and compare the resulting string — research how
   `>` treats line breaks differently from `|`.
2. Add a third line to the block scalar and confirm the parsed string
   grows to include it, with the same real indentation rule (every line
   of the block must be indented at least as far as the first) applying
   to it as well.
3. Remove the trailing newline the block scalar keeps by default using
   the `|-` **strip chomping indicator**, and confirm `repr(...)` no
   longer shows a trailing `\n` — a small, real, worth-knowing variant
   of the same syntax.
