# Concept: Declarative Tokenizer Rules (Table-Driven Tokenizing)

**What you'll understand by the end:** a second, genuinely different way
to turn text into tokens — a data table of `[pattern, category]` pairs
that one generic engine walks, instead of a hand-written loop that
decides what to do at each character itself.

**Prerequisites:** `lexer-preprocessing-before-parsing.md`;
`python-regex-match-vs-search.md`.

## Setup

Any JS/TS runtime — Node is fine, no packages needed.

## The Problem

`core/lexer.py`'s own `tokenize()` (Lessons 2–3) is a hand-written loop:
one regex (`_WORD_RE`) found *every* match in the line via
`finditer`, and the surrounding Python code decided what each match meant
by inspecting its captured letter. That's one real, valid way to build a
tokenizer. A genuinely different way is common in editor tooling (Monaco,
CodeMirror, and many syntax-highlighting engines): a plain data table of
`[regex, tokenCategory]` pairs, tried in order at the current position,
first match wins — the *engine* that walks the table is generic and
shared across every language the editor knows; only the table itself
changes per language.

## The Isolated Example

```javascript
function tokenize(line, rules) {
  const tokens = [];
  let rest = line;
  let pos = 0;
  outer:
  while (rest.length > 0) {
    for (const [regex, kind] of rules) {
      const m = rest.match(regex);
      if (m && m.index === 0) {
        tokens.push({ kind, text: m[0], pos });
        pos += m[0].length;
        rest = rest.slice(m[0].length);
        continue outer;
      }
    }
    pos += 1;
    rest = rest.slice(1);
  }
  return tokens;
}

const rules = [
  [/\(.*?\)/, "comment"],
  [/\bG\d+\b/, "gword"],
  [/\bM\d+\b/, "mword"],
  [/[XYZ][-+]?\d*\.?\d+/, "axisword"],
  [/\s+/, "whitespace"],
];

console.log(tokenize("G01 X10.5 (rapid to start)", rules));
```

**Real output:**
```json
[
  { "kind": "gword", "text": "G01", "pos": 0 },
  { "kind": "whitespace", "text": " ", "pos": 3 },
  { "kind": "axisword", "text": "X10.5", "pos": 4 },
  { "kind": "whitespace", "text": " ", "pos": 9 },
  { "kind": "comment", "text": "(rapid to start)", "pos": 10 }
]
```

**What this proves:** `tokenize()` itself never mentions G-codes,
M-codes, or comments anywhere in its own body — every real, meaningful
distinction lives entirely in the `rules` table it was handed. Swapping
in a completely different `rules` array (say, one for CSS or JSON) would
make the exact same function tokenize a different language, with zero
changes to the function itself.

## Mechanical Walkthrough

- `rules` is an ordered list — order matters, since the *first* matching
  rule at the current position wins, same as `_KEYWORD_RE` needing to run
  before `_WORD_RE` in `core/lexer.py`'s own real fix (Lesson 30).
- `m.index === 0` checks that the match starts exactly at the current
  position, not just somewhere later in `rest` — without this, a regex
  matching *later* text would incorrectly consume/skip whatever comes
  before it.
- The one-character skip-and-continue fallback (no rule matched at all)
  is a real, common tokenizer safety valve: one unrecognized character
  doesn't stop the whole line from being tokenized, it just produces no
  token for that character and moves on.

## Execution Trace

`tokenize("G01 X10.5 (rapid to start)", rules)`, run for real this
session — each outer-loop pass tries every rule in order until one
matches at position 0, then restarts the outer loop from where that
match left off:

- Pass 1: rest = "G01 X10.5 (rapid to start)", pos = 0
  comment rule: no match at index 0 (skip)
  gword rule: matches "G01" at index 0 → token {gword, "G01", pos:0}
  pos → 3, rest → " X10.5 (rapid to start)"

- Pass 2: rest = " X10.5 (rapid to start)", pos = 3
  comment/gword/mword/axisword: no match at index 0 (skip each)
  whitespace rule: matches " " at index 0 → token {whitespace, " ", pos:3}
  pos → 4, rest → "X10.5 (rapid to start)"

- Pass 3: rest = "X10.5 (rapid to start)", pos = 4
  comment/gword/mword: no match at index 0 (skip)
  axisword rule: matches "X10.5" at index 0 → token {axisword, "X10.5", pos:4}
  pos → 9, rest → " (rapid to start)"

- Pass 4: rest = " (rapid to start)", pos = 9
  comment rule: matches later in the string, but at index 1, not 0 → rejected
  gword/mword/axisword: no match at index 0
  whitespace rule: matches " " at index 0 → token {whitespace, " ", pos:9}
  pos → 10, rest → "(rapid to start)"

- Pass 5: rest = "(rapid to start)", pos = 10
  comment rule: matches "(rapid to start)" at index 0 → token {comment, "(rapid to start)", pos:10}
  pos → 27, rest → ""

- Pass 6: rest = "" → while (rest.length > 0) is false → loop ends
- Final: 5 tokens, matching the real output above exactly.

Pass 4 is the one worth noticing: the comment rule's regex *does* match
somewhere in `" (rapid to start)"`, but not at index `0` — the
`m.index === 0` check rejects it, exactly as intended, so whitespace
correctly wins that position instead.

## CS Lens

This is the same real distinction as "hardcoded vs. data-driven
dispatch" (`hardcoded-vs-data-driven-dispatch.md`, Lesson 29/32),
applied one layer earlier in the pipeline: the *tokenizing* step itself
can be a fixed function with an imperative body (`core/lexer.py`'s own
`tokenize()`), or a generic engine parameterized entirely by a data
table. Monaco's real Monarch tokenizer format (`monaco.languages.
IMonarchLanguage`) is a real, production version of exactly this
pattern, extended with features this toy version doesn't have (token
state/`next`, nested rule states) but built on the identical core idea.

## SE Lens

The real, concrete tradeoff: a data table is trivial to extend (add one
row) or swap out (a whole different language) without touching the
engine, which is exactly why an editor that needs to support dozens of
languages is built this way. A hand-written loop like `core/lexer.py`'s
own `tokenize()` is more direct to read for one fixed, small grammar, but
doesn't generalize the same way — adding a second real language to
`core/lexer.py` would mean writing a second, mostly-duplicate function,
not just a second data table fed to the same one.

## Connection

`lexer-preprocessing-before-parsing.md` (the general "text becomes
tokens before parsing" idea this specializes);
`hardcoded-vs-data-driven-dispatch.md` (the identical fixed-vs-data
tension, one pipeline stage later). This project's own first real,
non-toy use is `cnc-web/src/monacoGcode.ts`'s real Monarch rules array,
run for real inside the Monaco editor, not just this isolated lab.

## Try It Yourself

1. Add a rule for macro variables (`/#\d+/`, `"variable"`) to the `rules`
   array above and confirm `tokenize("#100 = 5", rules)` now produces a
   `"variable"` token instead of falling through to the one-char skip
   fallback for `#`.
2. Reorder the rules so `/[XYZ][-+]?\d*\.?\d+/` comes *before*
   `/\bG\d+\b/` and re-run the original example. Explain, from the real
   output, why this specific reordering doesn't actually change anything
   here — then construct an input where reordering *does* change the
   result, to see why rule order is a real, load-bearing design decision.
3. Read `cnc-web/src/monacoGcode.ts`'s real `GCODE_LANGUAGE.tokenizer.root`
   array and identify which rule plays the same role `_KEYWORD_RE` plays
   in `core/lexer.py` — the one that has to run before a more general
   rule would otherwise misclassify the same text.
