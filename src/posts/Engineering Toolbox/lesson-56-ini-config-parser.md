# Lesson 56: Not Every Format Needs a Tree

## What you will build

A from-scratch INI-style config file parser — `[section]` headers,
`key = value` pairs, comments — built as a simple, flat, line-by-line
**state machine**, verified against Python's own standard `configparser`
module. The transferable problem this lesson is actually about: Lesson
55's JSON parser needed recursive descent because JSON's grammar is
genuinely recursive — a value can contain values, arbitrarily deep. INI
is not recursive at all — a section can never contain another section —
and reaching for recursive descent here anyway would be real,
unjustified overkill. Choosing the technique that matches the grammar's
actual shape, not the most powerful technique available, is the point.

## What you need to know first

- **Lesson 55** — tokenizing and recursive descent parsing, held up here
  by direct contrast: this lesson deliberately does *not* reuse that
  shape, and explains exactly why not.
- **Lesson 51** — the `csv` module already gave this curriculum a real,
  working delimited-text parser; this lesson doesn't repeat that work,
  only notes the connection where it's relevant.

---

## The Problem, in prose, no code yet

INI files are everywhere — `.gitconfig`, `.ini` files for older Windows
and Python tooling, many `.cfg` files — and their structure is
deliberately much simpler than JSON's: a file is a flat sequence of
sections, each section is a flat sequence of key-value pairs, and
nothing nests inside anything else beyond that single level. A parser
for this format doesn't need to track arbitrary depth, doesn't need a
call stack mirroring the data's own structure, and doesn't need
anything like Lesson 55's `Parser` class calling itself. It needs
something much simpler: read one line at a time, remember which section
is currently "open," and update a result dictionary accordingly.

---

## Concept Unit: Classifying a Line Before Tracking Any State

### The Problem

Before building anything stateful, it's worth separating two genuinely
different concerns: recognizing *what kind* of line this is (a
comment, a section header, a key-value pair, blank), independent of
*what to do* with that recognition — the second part is where the
"currently open section" state actually matters; the first part doesn't
need it at all.

### Introduce the concept in isolation

```python
import re

SECTION_PATTERN = re.compile(r"^\[(.+)\]$")
KEY_VALUE_PATTERN = re.compile(r"^([^=]+?)\s*=\s*(.*)$")

sample_lines = [
    "; this is a comment", "[server]", "host = localhost", "port=8080",
    "", "# another comment style", "[database]", "name = myapp_db",
]

for line in sample_lines:
    stripped = line.strip()
    if not stripped:
        print(f"{line!r:35} -> blank")
    elif stripped.startswith(";") or stripped.startswith("#"):
        print(f"{line!r:35} -> comment")
    elif SECTION_PATTERN.match(stripped):
        print(f"{line!r:35} -> section header: {SECTION_PATTERN.match(stripped).group(1)!r}")
    elif KEY_VALUE_PATTERN.match(stripped):
        match = KEY_VALUE_PATTERN.match(stripped)
        print(f"{line!r:35} -> key={match.group(1)!r} value={match.group(2)!r}")
```

Run it:

```
'; this is a comment'               -> comment
'[server]'                          -> section header: 'server'
'host = localhost'                  -> key='host' value='localhost'
'port=8080'                         -> key='port' value='8080'
''                                  -> blank
'# another comment style'           -> comment
'[database]'                        -> section header: 'database'
'name = myapp_db'                   -> key='name' value='myapp_db'
```

What this proves: `SECTION_PATTERN = re.compile(r"^\[(.+)\]$")` — a
**hard concept reappearing** in spirit from Lesson 55's own regex-based
tokenizing, applied here to whole lines rather than arbitrary
substrings — matches a line that is *entirely* `[`, some content, `]`,
capturing the content in between via the parenthesized group. `KEY_VALUE_PATTERN`
similarly captures everything before the *first* `=` as the key and
everything after as the value, with `\s*` absorbing optional spaces
around the `=` so both `host = localhost` and `port=8080` are recognized
identically despite their different spacing. Every line, on its own,
with no memory of any previous line at all, is already fully
classifiable — this is the part of the job that genuinely doesn't need
state.

This lab is deleted now; it never appears in the project. What survives
is the classification logic, reused directly in the real parser, now
combined with the one piece of memory an INI file's structure actually
requires: which section is currently open.

### CS Lens

This is **lexical classification without context** — recognizing a
line's *category* using only its own content, the same underlying
principle behind Lesson 55's token regex, here applied at the
granularity of a whole line rather than a single character or word,
because INI's own grammar is line-oriented by design.

### SE Lens

Separating classification from state-tracking, even in a format this
simple, keeps each concern independently understandable: a bug in "is
this line a comment" is a one-line regex to inspect, entirely separate
from a bug in "which section does this key belong to" — the same
value Lesson 55's own lexer/parser split provided, scaled down to match
a much simpler grammar's actual needs.

---

## Concept Unit: One Piece of Memory — the Current Section

### Project Change

- **Reference Source:** No reference counterpart — this parser follows
  the common, informal INI convention (no single official
  specification exists for INI, unlike JSON's RFC 8259), verified below
  against Python's own `configparser` for a representative, realistic
  file.
- **Files affected:** new file, `ini_parser.py`.
- **Change type:** add.
- **Dependencies:** `re`, standard library only.

### The New Code

```python
class INIParseError(Exception):
    pass


def parse_ini(text):
    result = {}
    current_section = None

    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        stripped = raw_line.strip()

        if not stripped or stripped.startswith(";") or stripped.startswith("#"):
            continue

        section_match = SECTION_PATTERN.match(stripped)
        if section_match:
            current_section = section_match.group(1)
            result.setdefault(current_section, {})
            continue

        key_value_match = KEY_VALUE_PATTERN.match(stripped)
        if key_value_match:
            if current_section is None:
                raise INIParseError(f"line {line_number}: key-value pair before any [section]")
            key, value = key_value_match.group(1).strip(), key_value_match.group(2).strip()
            result[current_section][key] = value
            continue

        raise INIParseError(f"line {line_number}: unrecognized line {raw_line!r}")

    return result
```

### The Updated Project

A new, freestanding function with nothing surrounding it yet.

### Mechanical Walkthrough

- `current_section = None` — this single variable is the **entire**
  piece of memory this parser needs to carry from one line to the next —
  everything else about a line's meaning is determined by that line
  alone, per the previous unit.
- `text.splitlines()` — **first appearance of this specific string
  method** in this curriculum; splits on any of several real newline
  conventions (`\n`, `\r\n`) without leaving trailing empty strings the
  way a naive `.split("\n")` sometimes would, and — unlike the raw
  socket text this curriculum has manually split on `\r\n` since Lesson
  24 — this is ordinary Python text already read from a file, where the
  built-in, format-aware method is the right tool.
- `enumerate(..., start=1)` — a **hard concept reappearing**, used here
  specifically so every error message can cite a real, human-readable
  line number matching what a person would see in a text editor.
- The section-header branch — on a match, `current_section` is
  reassigned to the newly opened section's name, and
  `result.setdefault(current_section, {})` (a **hard concept
  reappearing** from Lesson 32's own lazy-initialization pattern)
  ensures a fresh, empty dictionary exists for it, but *only if one
  doesn't already exist* — allowing a section name to legitimately
  reappear later in the file and continue adding to the same dictionary,
  matching `configparser`'s own real behavior.
- The key-value branch — `if current_section is None: raise
  INIParseError(...)` is the one place this parser's single piece of
  state actually gets *checked*, not just updated: a key-value pair
  appearing before any `[section]` header at all is a real, genuine
  error, not silently ignored or attributed to a fabricated default
  section.
- The final, unconditional `raise` — any line that matched none of the
  earlier branches (blank, comment, section, key-value) is a real parse
  failure, reported with its exact line number and content, rather than
  silently skipped.

### Run it — Verified Against the Real Standard

```python
sample_ini = """\
; global comment
[server]
host = localhost
port = 8080

[database]
name = myapp_db
user = admin
# trailing comment
timeout=30
"""

our_result = parse_ini(sample_ini)

stdlib_parser = configparser.ConfigParser()
stdlib_parser.read_string(sample_ini)
stdlib_result = {section: dict(stdlib_parser[section]) for section in stdlib_parser.sections()}

print("match:", our_result == stdlib_result)
```

```
our parser: {'server': {'host': 'localhost', 'port': '8080'}, 'database': {'name': 'myapp_db', 'user': 'admin', 'timeout': '30'}}
configparser: {'server': {'host': 'localhost', 'port': '8080'}, 'database': {'name': 'myapp_db', 'user': 'admin', 'timeout': '30'}}
match: True
```

A real file with two comment styles (`;` and `#`), inconsistent spacing
around `=`, and a blank line separating sections, parsed identically to
Python's own `configparser` — proof of correctness against the real
standard library implementation, the same verification technique Lesson
55 used for JSON.

And real, distinct errors:

```python
bad_documents = [
    "key_before_section = oops",
    "[server]\nthis line has no equals sign",
]
```

```
'key_before_section = oops' -> line 1: key-value pair before any [section]
'[server]\nthis line has no equals sign' -> line 2: unrecognized line 'this line has no equals sign'
```

### CS Lens

This is a **finite state machine** with exactly two states —
"no section open" (`current_section is None`) and "section `X` open" —
and two kinds of input that can change the state (a section header) or
merely act within it (a key-value pair), the identical general pattern
Lesson 30 named in its own "Also recognized in" list (traffic lights,
TCP connection states) but never actually built until now: a real,
working state machine, this time with genuinely minimal state, matching
a genuinely simple grammar.

Also recognized in: shell script `case` statements tracking a "current
mode," this curriculum's own Lesson 33 scheduler (tracking only "when is
the next run due," one piece of state, not a whole history), most
line-oriented config or log formats generally.

### SE Lens

This is the direct, concrete contrast Lesson 55 promised: recursive
descent would work for INI too — badly. It would need to invent
artificial recursive structure (a "section" grammar rule that never
actually calls back into a "value" rule the way JSON's nested objects
genuinely do) purely to fit a technique that isn't suited to a flat
format, adding real complexity — a `Parser` class, a token stream, a
call stack — that buys nothing here, since INI never needs more than one
level of nesting at all. Matching the tool to the actual shape of the
problem, demonstrated concretely rather than asserted, is this lesson's
entire point.

---

## Connect the pieces

One config file, followed through the whole lesson: `parse_ini` walks
it one line at a time, using the previous unit's classification logic to
decide what each line *is*, and this unit's single `current_section`
variable to decide *where* a key-value pair belongs. No recursion, no
token stream, no call stack tracking depth — because the data itself
has no depth to track. The result, checked directly against
`configparser`'s own independent implementation, is identical.

## What breaks without this

Removing the `if current_section is None: raise INIParseError(...)`
check and instead silently discarding a key-value pair that appears
before any section (or, worse, attributing it to whatever section
happened to be open last, if this were parsing a second, appended file)
would turn a real configuration mistake — a setting the person clearly
intended to be read — into data that simply vanishes with no warning at
all, discovered only later when the expected setting turns out to be
missing at runtime, far from where the actual mistake was made.

## Definition of done

- [ ] `parse_ini` on a real, representative INI file produces output
      identical to `configparser`'s own parsing of the same text.
- [ ] A key-value pair appearing before any `[section]` header raises
      `INIParseError` with the correct line number.
- [ ] A line matching none of comment/section/key-value raises
      `INIParseError` with the correct line number and content.
- [ ] A section name that reappears later in the file continues adding
      to the same dictionary rather than overwriting it.
- [ ] You can explain, without looking back at this lesson, why this
      parser uses a single state variable and a line-by-line loop
      instead of Lesson 55's tokenize-then-recursively-descend shape.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add ini_parser.py
  git commit -m "Add from-scratch INI parser as a minimal-state line-by-line state machine, verified identical to configparser — deliberately not recursive descent, since INI's grammar has no recursive structure to justify it"
  ```

## What's next

Lesson 57's Markdown parser sits between this lesson and Lesson 55 in
structural complexity: not flat like INI (a list can nest inside a list
item), but not as uniformly recursive as JSON either — a genuine test of
picking the right amount of parsing machinery for a grammar that's
messier than either of this curriculum's first two examples.
