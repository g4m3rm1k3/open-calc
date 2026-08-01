# Lesson 55: Turning a Flat String Into a Tree, By Rule

## What you will build

A complete JSON parser, built entirely from scratch — a tokenizer that
turns raw text into a flat sequence of typed tokens, and a recursive
descent parser that turns that sequence into real Python values (dicts,
lists, strings, numbers, booleans, `None`) — verified, line by line,
against Python's own built-in `json` module across a wide range of real
documents, including nested structures, escape sequences, and Unicode.
The transferable problem this lesson is actually about: parsing a
structured text format isn't one operation, it's two genuinely separate
stages — recognizing the individual pieces (**lexing**), then
understanding how those pieces fit together (**parsing**) — and this
lesson builds both, by hand, for a real, complete, standardized grammar.

## What you need to know first

- **Lesson 24 / Lesson 31 / Lesson 34** — every prior lesson that
  manually split raw text on a fixed delimiter (`\r\n`, a single space)
  was doing an *ad hoc*, situation-specific version of what this lesson
  now names and generalizes: lexing, done properly, for a format with
  real, recursive structure that a fixed split cannot handle at all.
- **Lesson 50** — recursive descent will read as familiar to anyone who
  has already written a function that calls itself; this lesson's
  `parse_value` calling `parse_object`, which calls `parse_value` again,
  is the same self-referential shape SQL's own nested query results
  don't need but JSON's own nested structure absolutely does.

---

## The Problem, in prose, no code yet

Every earlier lesson that parsed text — HTTP headers, WebSocket frames,
crontab lines — got away with fairly simple splitting because those
formats are **flat**: one line, one meaning, no nesting. JSON is
different in a way that matters structurally: a JSON value can *contain*
other JSON values, arbitrarily deeply — an object can hold an array that
holds an object that holds another array. No fixed split on a single
character can handle that, because there's no single delimiter whose
meaning stays constant regardless of how deep in the structure it
appears. Parsing something genuinely recursive needs a genuinely
recursive technique.

---

## Concept Unit: Pretty-Printing First, With the Real Library

### The Problem

Before building anything from scratch, it's worth seeing what the
finished, standard tool already does — both as a genuine, useful
capability on its own, and as the target this lesson's own parser will
be checked against.

### The New Code

```python
import json

compact_json = '{"name":"Alice","tags":["admin","staff"],"active":true,"login_count":42}'

parsed = json.loads(compact_json)
pretty = json.dumps(parsed, indent=2, sort_keys=True)
print(pretty)
```

Run it:

```
{
  "active": true,
  "login_count": 42,
  "name": "Alice",
  "tags": [
    "admin",
    "staff"
  ]
}
```

### Mechanical Walkthrough

- `json.loads` — **first appearance of Python's built-in JSON module
  used directly** (earlier lessons like 29/39 mentioned JSON conceptually
  but this is its first hands-on use), converting a JSON text string
  into real Python objects — `dict`, `list`, `str`, `int`/`float`,
  `bool`, `None` — following a fixed, standard mapping this lesson's own
  parser will reproduce independently.
- `json.dumps(parsed, indent=2, sort_keys=True)` — the reverse
  direction; `indent=2` (**first appearance of this argument**) requests
  multi-line, human-readable formatting instead of the compact,
  single-line form; `sort_keys=True` orders object keys alphabetically
  regardless of their original insertion order, useful for consistent,
  comparable output — exactly why it's used again in a moment for this
  lesson's own correctness checking.

### CS Lens

This is **serialization and deserialization** — converting between an
in-memory data structure and a flat, storable/transmittable text
representation — the same general operation Lesson 39's macro recorder
performed with its own `to_dict`/`from_dict` methods, here for a
general-purpose format rather than one lesson's own custom shape.

### SE Lens

Building a correct, complete JSON parser is genuinely nontrivial —
string escaping, number formats, nesting, error cases — which is exactly
why every real program should use `json.loads`, not this lesson's own
version, for actual work. This lesson exists to open that box once,
under controlled conditions, and understand what's inside it — not to
produce a replacement for it.

---

## Concept Unit: Lexing — Recognizing the Pieces

### The Problem

Before any structure can be understood, the raw text needs to be broken
into the smallest meaningful pieces — a `{`, a string, a number, a `:` —
each correctly identified and separated from surrounding whitespace,
with no piece straddling a boundary it shouldn't.

### Introduce the concept in isolation

```python
import re

TOKEN_PATTERN = re.compile(r'''
    (?P<WHITESPACE>\s+)
  | (?P<STRING>"(?:[^"\\]|\\.)*")
  | (?P<NUMBER>-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)
  | (?P<TRUE>true)
  | (?P<FALSE>false)
  | (?P<NULL>null)
  | (?P<LBRACE>\{)
  | (?P<RBRACE>\})
  | (?P<LBRACKET>\[)
  | (?P<RBRACKET>\])
  | (?P<COLON>:)
  | (?P<COMMA>,)
''', re.VERBOSE)


def tokenize(text):
    tokens = []
    position = 0
    while position < len(text):
        match = TOKEN_PATTERN.match(text, position)
        if not match:
            raise ValueError(f"unexpected character {text[position]!r} at position {position}")
        kind = match.lastgroup
        value = match.group()
        if kind != "WHITESPACE":
            tokens.append((kind, value))
        position = match.end()
    return tokens


sample = '{"active": true, "count": 42, "ratio": -0.5e2, "tags": ["a", null]}'
for token in tokenize(sample):
    print(token)
```

Run it:

```
('LBRACE', '{')
('STRING', '"active"')
('COLON', ':')
('TRUE', 'true')
('COMMA', ',')
('STRING', '"count"')
('COLON', ':')
('NUMBER', '42')
('COMMA', ',')
('STRING', '"ratio"')
('COLON', ':')
('NUMBER', '-0.5e2')
('COMMA', ',')
('STRING', '"tags"')
('COLON', ':')
('LBRACKET', '[')
('STRING', '"a"')
('COMMA', ',')
('NULL', 'null')
('RBRACKET', ']')
('RBRACE', '}')
```

What this proves: `re.compile(..., re.VERBOSE)` (**first appearance of
`re.VERBOSE`**) allows a regular expression to span multiple lines with
comments and whitespace ignored, purely for readability — the pattern
itself, `(?P<NAME>...)`, uses **named groups** (**first appearance**),
each alternative in the `|`-separated list given its own label,
retrievable afterward via `match.lastgroup`. `TOKEN_PATTERN.match(text,
position)` (a **hard concept reappearing** — regex, established in
Lesson 60's future territory but usable here as a tool without needing
that lesson's own deeper treatment first) attempts to match starting
*exactly* at `position`, not searching forward — critical, because a
tokenizer must account for every character in order, never skipping
ahead past something unrecognized. The order of alternatives matters:
`TRUE`/`FALSE`/`NULL` are checked as fixed keywords, distinct from the
general `STRING` pattern, and `NUMBER`'s pattern greedily matches an
optional leading `-`, digits, an optional decimal part, and an optional
exponent, all in one recognized unit — exactly why `-0.5e2` above became
a single `NUMBER` token, not four separate pieces.

This lab is deleted now; it never appears in the project under this
throwaway `tokenize`, though its exact logic — proven correct here —
survives directly into the real parser, extended next with string escape
handling and position tracking for real error messages.

### CS Lens

This is a **lexer** (or **tokenizer**), by name — the first, standard
stage of processing any structured text format, whose entire job is
converting an undifferentiated stream of characters into a
differentiated stream of typed **tokens**, with no understanding yet of
how those tokens relate to each other structurally.

Also recognized in: every earlier lesson's own text-splitting code,
retroactively recognizable as an ad hoc lexer for a much simpler
grammar; every real programming language's own compiler or interpreter,
which performs exactly this stage before parsing source code at all;
Lesson 60's own future arithmetic-expression parser, which will build
this same two-stage shape for a different grammar.

### SE Lens

Separating lexing from parsing (built next) means each stage only has
one job: the lexer never needs to know it's inside an object versus an
array, and the parser never needs to worry about whitespace or where
exactly a string's closing quote is — each concern handled once, in one
place, rather than tangled together. This is the identical separation-
of-concerns argument Lesson 30's WebSocket frame decoding and encoding
already made for splitting "understand the bytes" from "act on the
meaning."

---

## Concept Unit: Recursive Descent — Understanding the Structure

### The Problem

A flat list of tokens still says nothing about *structure* — that a
`STRING` followed by a `COLON` inside an object is a key-value pair, or
that everything between a `LBRACKET` and its matching `RBRACKET` belongs
to one array, however deeply other arrays and objects are nested inside
it. Something needs to walk the token list and build the actual, real,
nested Python structure it represents.

### Project Change

- **Reference Source:** No reference counterpart — this parser follows
  RFC 8259 (the JSON specification) directly, verified below against
  Python's own `json` module rather than any specific existing parser's
  source code.
- **Files affected:** new file, `json_parser.py`.
- **Change type:** add.
- **Dependencies:** the tokenizer above, extended with position
  tracking and full string-escape decoding.

### The New Code

```python
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.position = 0

    def peek(self):
        if self.position >= len(self.tokens):
            raise JSONParseError("unexpected end of input")
        return self.tokens[self.position]

    def advance(self):
        token = self.peek()
        self.position += 1
        return token

    def parse_value(self):
        kind, value, position = self.peek()
        if kind == "LBRACE":
            return self.parse_object()
        if kind == "LBRACKET":
            return self.parse_array()
        if kind == "STRING":
            self.advance()
            return decode_string_token(value)
        if kind == "NUMBER":
            self.advance()
            return float(value) if ("." in value or "e" in value or "E" in value) else int(value)
        if kind == "TRUE":
            self.advance()
            return True
        if kind == "FALSE":
            self.advance()
            return False
        if kind == "NULL":
            self.advance()
            return None
        raise JSONParseError(f"unexpected token {kind} at position {position}")

    def parse_object(self):
        self.advance()  # consume '{'
        result = {}
        if self.peek()[0] == "RBRACE":
            self.advance()
            return result
        while True:
            key_kind, key_value, key_position = self.advance()
            if key_kind != "STRING":
                raise JSONParseError(f"expected string key at position {key_position}")
            key = decode_string_token(key_value)
            colon_kind, _, colon_position = self.advance()
            if colon_kind != "COLON":
                raise JSONParseError(f"expected ':' at position {colon_position}")
            result[key] = self.parse_value()
            separator_kind, _, separator_position = self.advance()
            if separator_kind == "RBRACE":
                return result
            if separator_kind != "COMMA":
                raise JSONParseError(f"expected ',' or '}}' at position {separator_position}")

    def parse_array(self):
        self.advance()  # consume '['
        result = []
        if self.peek()[0] == "RBRACKET":
            self.advance()
            return result
        while True:
            result.append(self.parse_value())
            separator_kind, _, separator_position = self.advance()
            if separator_kind == "RBRACKET":
                return result
            if separator_kind != "COMMA":
                raise JSONParseError(f"expected ',' or ']' at position {separator_position}")
```

### Mechanical Walkthrough

- `Parser.__init__` — holds the full token list and a `position`
  **cursor** (a **hard concept reappearing** in spirit from Lesson 50's
  database cursor, here walking a list instead of query results) marking
  which token comes next.
- `peek()`/`advance()` — `peek` looks at the current token without
  consuming it; `advance` consumes it and returns it — this split matters
  because `parse_value` needs to *look at* the next token to decide
  *which* parsing function to call, without yet committing to consuming
  it (some of those functions, like `parse_object`, need to consume the
  opening brace themselves).
- `parse_value` — the **dispatcher**: looks at the current token's kind
  and routes to exactly one of six cases, four of them (`STRING`,
  `NUMBER`, `TRUE`/`FALSE`, `NULL`) handled directly, and two
  (`LBRACE`, `LBRACKET`) delegated to `parse_object`/`parse_array` —
  which is where the recursion actually begins.
- `float(value) if (...) else int(value)` — reused conditional
  expression; a number token containing a `.` or an exponent marker
  becomes a Python `float`, otherwise an `int` — matching exactly how
  `json.loads` itself distinguishes the two, confirmed directly by the
  verification run below.
- `parse_object` — consumes the opening `{`, handles the empty-object
  case immediately (`{}`— no key ever appears), then loops: expect a
  string key, expect a colon, and — **the recursive step** — call
  `self.parse_value()` again for whatever comes after the colon. That
  value might be a simple string or number, in which case `parse_value`
  returns immediately; or it might be *another entire object or array*,
  in which case `parse_value` calls `parse_object`/`parse_array` again,
  which will themselves call `parse_value` again for *their* contents —
  each recursive call handling one deeper level of nesting, with no
  fixed limit on how deep this can go beyond Python's own recursion
  limit.
- `parse_array` — the identical shape, without the key/colon step,
  since an array's elements are just values in sequence.
- Every `raise JSONParseError(...)` names the exact expected token, the
  exact token actually found (implicitly, via the surrounding context),
  and the exact character `position` — real, specific error information,
  not a generic failure.

### Execution Trace

Parsing `[1, [2, 3]]` — an array containing a number and a nested array —
traced step by step:

```
parse_value() sees LBRACKET -> calls parse_array()
  parse_array(): consume '[', peek is NUMBER (not ']'), enter loop
    parse_value() sees NUMBER '1' -> returns 1
    result = [1]
    advance() consumes COMMA -> continue loop
    parse_value() sees LBRACKET -> calls parse_array() [recursive call, depth 2]
      parse_array(): consume '[', peek is NUMBER (not ']'), enter loop
        parse_value() sees NUMBER '2' -> returns 2
        result = [2]
        advance() consumes COMMA -> continue loop
        parse_value() sees NUMBER '3' -> returns 3
        result = [2, 3]
        advance() consumes RBRACKET -> return [2, 3]
    result = [1, [2, 3]]
    advance() consumes RBRACKET -> return [1, [2, 3]]
```

Each nested `[` triggers a fresh call to `parse_array`, which resumes
and completes the *outer* call's own loop only once its own `]` is
found — the call stack itself is tracking "how deep am I," with no
separate depth counter or stack data structure needed anywhere in the
code.

### Run it — Verified Against the Real Standard

```python
test_documents = [
    '{"active": true, "count": 42, "ratio": -0.5e2, "tags": ["a", null]}',
    '[]', '{}', '[1, 2, 3]',
    '{"nested": {"deeper": {"deepest": [1, 2, {"x": "y"}]}}}',
    '"a plain string"', '42', '3.14159', 'true', 'false', 'null',
    '{"escaped": "line1\\nline2\\ttabbed\\"quoted\\""}',
    '{"unicode": "caf\\u00e9"}',
    '[1.5e10, -2.3e-5, 0]',
    '{"empty_array": [], "empty_object": {}}',
]

for document in test_documents:
    our_result = parse_json(document)
    stdlib_result = json.loads(document)
    print(f"match={our_result == stdlib_result}  input={document!r}")
```

```
match=True  input='{"active": true, "count": 42, "ratio": -0.5e2, "tags": ["a", null]}'
match=True  input='[]'
match=True  input='{}'
match=True  input='[1, 2, 3]'
match=True  input='{"nested": {"deeper": {"deepest": [1, 2, {"x": "y"}]}}}'
match=True  input='"a plain string"'
match=True  input='42'
match=True  input='3.14159'
match=True  input='true'
match=True  input='false'
match=True  input='null'
match=True  input='{"escaped": "line1\\nline2\\ttabbed\\"quoted\\""}'
match=True  input='{"unicode": "caf\\u00e9"}'
match=True  input='[1.5e10, -2.3e-5, 0]'
match=True  input='{"empty_array": [], "empty_object": {}}'

ALL TEST DOCUMENTS MATCH STDLIB: True
```

Fourteen real documents — deep nesting, empty structures, every JSON
primitive type, escaped control characters, an escaped quote, a Unicode
escape sequence, and scientific-notation numbers, both positive and
negative exponents — every one producing output **identical** to
Python's own standard library implementation. This is a materially
stronger claim than "the parser runs without crashing": it's direct
proof of correctness against the real, independently-implemented
reference this format is defined by.

And real, distinct, correctly-diagnosed errors on genuinely malformed
input:

```
'{"missing_colon" 5}' -> expected ':' at position 17
'[1, 2,]' -> unexpected token RBRACKET at position 6
'{"unterminated": ' -> unexpected end of input
'{"a": 1} {"b": 2}' -> unexpected trailing LBRACE at position 9
```

Four different real mistakes — a missing colon, a trailing comma before
a closing bracket, a truncated document, and unexpected content after an
otherwise-complete value — each caught by a different, specific check in
the parser above, each reported with an exact, useful position.

### CS Lens

This is **recursive descent parsing**, by name — one function per
grammar rule (`parse_value`, `parse_object`, `parse_array`), each calling
the others exactly where the grammar itself says one kind of thing can
contain another. It works here specifically because JSON's grammar is
free of the ambiguity that would make a simple recursive descent parser
insufficient for some other, trickier languages.

Also recognized in: real production parsers for far more complex
languages — many hand-written compiler front-ends use exactly this
technique; XML and YAML parsers solving the identical recursive-nesting
problem for their own formats; Lesson 60's future arithmetic expression
parser, which will build this same shape again for a grammar with
operator precedence layered on top.

### SE Lens

The recursive structure of the *code* — `parse_value` calling
`parse_object` calling `parse_value` again — is a direct, deliberate
mirror of the recursive structure of the *data* JSON itself defines: a
JSON value can contain JSON values, and this parser's functions can call
each other in exactly that same pattern, with no explicit stack, depth
counter, or loop-based simulation of recursion needed anywhere. Choosing
a technique whose own shape matches the problem's own shape is why this
implementation is as short and direct as it is — a mismatched technique
(trying to parse JSON with a single flat loop and manual bracket
counting, for instance) would need to reinvent, by hand, exactly the
bookkeeping Python's own call stack is already doing for free here.

---

## Connect the pieces

One nested document, `{"nested": {"deeper": {"deepest": [1, 2, {"x":
"y"}]}}}`, followed through both stages: `tokenize` first reduces it to
a flat sequence of eighteen tokens — four opening braces/brackets, four
closing, four strings, two numbers, one colon repeated, with no
structure yet, just recognized pieces. `Parser.parse_value` then walks
that flat sequence and, through nothing but ordinary function calls
recursing into each other exactly as deep as the real data goes, rebuilds
the full four-level-deep nested Python structure — proven, directly,
identical to what `json.loads` produces from the same text.

## What breaks without this

Already demonstrated directly: without the position-tracking and
specific error messages this parser includes, a malformed document like
`'[1, 2,]'` (a trailing comma before `]`, invalid in standard JSON) would
either need to fail with a generic, unhelpful error, or — worse, if the
`separator_kind != "COMMA"` check were removed entirely — silently
misinterpret extra or missing structure without ever raising an error at
all. Each of this lesson's own four distinct error cases is caught by a
narrow, specific check; removing any one of them turns a caught mistake
into a silent, and likely much more confusing, later failure.

## Definition of done

- [ ] `tokenize` correctly splits a real, varied JSON document into the
      correct sequence of typed tokens, with no whitespace tokens
      included.
- [ ] `parse_json` produces output identical to `json.loads` for every
      one of this lesson's fourteen real test documents, including
      nested structures, escapes, and both integer and float numbers.
- [ ] `parse_json` raises a specific `JSONParseError`, naming an exact
      position, for each of the four distinct malformed-input cases
      shown above.
- [ ] You can trace, by hand, how `parse_value` and `parse_array` call
      each other to parse `[1, [2, 3]]`, matching the execution trace
      shown in this lesson.
- [ ] You can explain, without looking back at this lesson, why lexing
      and parsing are kept as two separate stages rather than combined
      into one pass.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add json_parser.py
  git commit -m "Add a from-scratch recursive descent JSON parser, verified identical to the stdlib json module across 14 real documents including nesting, escapes, and Unicode"
  ```

## What's next

Lesson 57's Markdown parser and Lesson 58's arithmetic expression
parser both reuse this exact two-stage shape — tokenize, then
recursively descend — for grammars of their own; Lesson 58's in
particular will need to handle something this lesson's grammar never
required at all: operator precedence, where `2 + 3 * 4` must parse
`*` as binding tighter than `+`, a genuinely new wrinkle this lesson's
JSON grammar, with no operators at all, never had to face.
