# Lesson 30: A Loop Label Is Not a D-Word

**What you will build:** `core/lexer.py`'s `tokenize()` reads any
letter-then-number pattern as a real word (`D1`, `T8`, ...) — including
the trailing digit on a flow-control label like `END1` or `DO1`, which it
misreads as a real `D`-word. This lesson ports the real reference's own
keyword-detection regex (`cnc/gcodeParser.ts`), checked *before* word
extraction, so a line like `END1` is recognized as a loop label and
produces no words at all, instead of a bogus one. The transferable point:
the reference has this exact same collision in its own word-extraction
regex, and tolerates it by checking for keywords first — the fix isn't a
smarter regex, it's an earlier check that makes the collision
unreachable.

**What you need to know first:**
`concepts/python-regex-match-vs-search.md` (new, this lesson);
`concepts/regex-negated-character-class.md` (the original `_WORD_RE`,
Lessons 2–3); Lesson 29's own real, honest citation that `O0002.nc`'s
next gap after the G-code fix was `T`-word (still true — this lesson
does not close that one).

---

## Concept Unit: `re.match` vs. `re.search`, Alternation, `re.IGNORECASE`

### The Problem

A G-code program can contain real flow-control keywords —
`WHILE`/`DO1`/`END1`, real Fanuc macro syntax `O0002.nc` actually uses
(lines 8 and 15: `WHILE [#100 LT #101] DO1` ... `END1`). This project's
existing `_WORD_RE` (`([A-Za-z])\s*([-+]?\d*\.?\d+...)`) matches *any*
letter immediately followed by a number — including the `D` in `END1`,
whose next character is a digit purely by coincidence of the label
number, not because `D1` means anything as a G-code word.

### The Concept, Isolated

Full isolated treatment lives in
`concepts/python-regex-match-vs-search.md`, run for real this session:

```python
import re

pattern = re.compile(r"^(WHILE|END\d+|DO\d*)", re.IGNORECASE)
print(pattern.match("END1"))
print(pattern.match("  END1"))
print(pattern.search("  END1"))
print(pattern.match("while [#1 lt 8] do1"))
```

**Real output, run this session:**
```
<re.Match object; span=(0, 4), match='END1'>
None
None
<re.Match object; span=(0, 5), match='while'>
```

### Execution Trace

Four calls against the same compiled `pattern`, traced against the real
output above — the `.search()` call is the one worth tracing carefully,
since its result is not what a first read of "search scans the whole
string" would predict:

```
Call 1: pattern.match("END1")
  Try position 0 only: "END1" matches (WHILE|END\d+|DO\d*) → Match, span(0,4)

Call 2: pattern.match("  END1")
  Try position 0 only: "  END1"[0:] starts with two spaces, no alternative
  matches at position 0 → None

Call 3: pattern.search("  END1")
  search() is willing to try every position 0..5 — but the pattern itself
  starts with `^`, which only ever succeeds at true position 0 (no
  MULTILINE). So every position search() tries after 0 is rejected by `^`
  before the alternation even runs → None, same as Call 2.

Call 4: pattern.match("while [#1 lt 8] do1")
  Try position 0 only, re.IGNORECASE active: "while" matches WHILE
  case-insensitively → Match, span(0,5)
```

Call 3 is the one that overturns the naive expectation: `.search()` does
try more positions than `.match()` in general, but a leading `^` in the
pattern itself cancels that advantage out — the anchor, not the method,
is what actually decides whether leading whitespace defeats the match.

### Discard

This lab is not part of the project — the real pattern below recognizes
21 real keywords, not 3, and is checked against a real, stripped line.

### CS Lens

Per `python-regex-match-vs-search.md`: `.match()` only ever tries
position `0`. `.search()` normally tries every position until one
succeeds — but not here: this pattern's own leading `^` constrains
`.search()` right back down to position `0` too, which is exactly why
Call 3 above still returns `None` on the padded string rather than
finding `"END1"` a few characters in. The real fix downstream isn't a
different method — it's `.strip()`ing the line before matching at all
(confirmed in the SE Lens below), removing the leading whitespace instead
of trying to out-clever it with `.search()`.

### SE Lens

The real reason `core/lexer.py`'s new check calls `.strip()` first
(`_KEYWORD_RE.match(line.strip())`): `O0002.nc`'s own loop body is
indented (`"  N100 #103 = ..."`), and `.match()`'s position-`0`-only rule
would otherwise let leading whitespace alone defeat every keyword check
on an indented line, with no `^` or `re.MULTILINE` involved at all.

---

## Project Change (no new concept): Checking for Keywords Before Extracting Words

### The Problem

Confirmed directly, this session, against the real, unmodified lexer:

```python
old_lexer.parse_line("END1")
# {'words': {'D': 1.0}, 'comment': ''}
```

A real loop-terminator label, misread as a real `D1` word — which
`core/parser.py`'s `_SUPPORTED_WORDS` check then rejects with
`"D-word is not supported yet"`, a crash on a line that carries no real
G-code data at all.

### Reference Source, Read for Real This Session

**Correction, this session — the mechanism is real but was mischaracterized
in an earlier draft:** `_parseLine` (`cnc/gcodeParser.ts` lines 45–135)
does **not** check its keyword regex before word extraction — read in
order, it calls `_extractWords` first (line 108), *then* runs the keyword
regex afterward (lines 110–117). The identical real word-extraction
collision does exist in `_extractWords` (`cnc/gcodeParser.ts` lines
137–180, standard word regex at line 158; it excludes only `N`/`O`, line
163 — the same two letters this project's own `tokenize()` already
excluded since Lessons 2–3), so `_parseLine("END1")` really does return a
spurious `words: {D: 1}` in the reference too, same as this project's own
bug.

What actually protects the reference isn't parse order — it's
**consumption** order, one layer up: `cnc/CNCEngine.ts`'s `_executeBlock`
checks `if (b.keyword) { execKeyword(...); return; }` (lines 366–369)
*before* it ever reads `b.words` for G/M-code dispatch (line 371
onward) — the polluted `words` field is computed, just never consumed,
for a keyword line. This project's own fix is a genuinely different, and
arguably better, mechanism: `tokenize()` (`core/lexer.py` line 60) checks
`_KEYWORD_RE` *before* running its own word regex at all, so the spurious
word is never created in the first place, rather than created and later
ignored by a downstream consumer. Both close the same real bug; only one
of them prevents the bad data from existing at all.

### Files Affected

`cnc-service/core/lexer.py`. Change type: add (`_KEYWORD_RE`, one new
check inside `tokenize()`).

### The New Code

```python
if _KEYWORD_RE.match(line.strip()):
    return {}
```

### The Updated Project

`core/lexer.py` in full:

```python
import re

_WORD_RE = re.compile(r"([A-Za-z])\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")
_BLOCK_COMMENT_RE = re.compile(r"\(([^)]*)\)")

# Real port of cnc/gcodeParser.ts's own keyword regex (_parseLine):
# /^(WHILE|ENDWHILE|DO\d*|END\d+|IF|ELSE|ENDIF|GOTOF|GOTOB|GOTO|LOOP|
# ENDLOOP|REPEAT|UNTIL|CALL|RET|RTS|WAITM|SETM|CLEARM|WBUF|DEF|LIMS)/i --
# flow-control keywords like "END1"/"DO1" carry a real trailing digit
# (a loop label number) that _WORD_RE below would otherwise misread as
# a genuine D/E-word (D1, matching the letter immediately before the
# digit) -- exactly the same real word-extraction collision the
# reference itself has (its own _extractWords uses an identical regex,
# excluding only N/O); the reference tolerates it because keyword
# detection there takes priority and the spurious word is simply never
# looked at. This project has no flow-control execution yet (a real,
# separate, substantial piece -- WHILE/DO/END, IF/GOTO, and the macro
# variable/expression evaluator it depends on), so a detected keyword
# line is treated as having no usable words at all, rather than being
# misparsed as bogus G/M-code data.
_KEYWORD_RE = re.compile(
    r"^(WHILE|ENDWHILE|DO\d*|END\d+|IF|ELSE|ENDIF|GOTOF|GOTOB|GOTO|"
    r"LOOP|ENDLOOP|REPEAT|UNTIL|CALL|RET|RTS|WAITM|SETM|CLEARM|WBUF|"
    r"DEF|LIMS)",
    re.IGNORECASE,
)


def strip_comment(line):
    comment = ""
    match = _BLOCK_COMMENT_RE.search(line)
    if match:
        comment = match.group(1).strip()
    clean = _BLOCK_COMMENT_RE.sub("", line).strip()

    semicolon_index = clean.find(";")
    if semicolon_index >= 0:
        if not comment:
            comment = clean[semicolon_index + 1:].strip()
        clean = clean[:semicolon_index].strip()

    return clean, comment


def tokenize(line):
    if _KEYWORD_RE.match(line.strip()):
        return {}
    words = {}
    for match in _WORD_RE.finditer(line):
        letter = match.group(1).upper()
        value = float(match.group(2))
        if letter in ("N", "O"):
            continue
        if letter not in words:
            words[letter] = value
        elif isinstance(words[letter], list):
            words[letter].append(value)
        else:
            words[letter] = [words[letter], value]
    return words


def parse_line(line):
    clean, comment = strip_comment(line)
    return {"words": tokenize(clean), "comment": comment}
```

### Mechanical Walkthrough

- `_KEYWORD_RE = re.compile(r"^(WHILE|...|LIMS)", re.IGNORECASE)` —
  **(a) first appearance** of alternation and `re.IGNORECASE` in this
  project's own code, per `python-regex-match-vs-search.md`; the 21-word
  list is a direct, complete port of the reference's own real list, not a
  trimmed subset.
- `if _KEYWORD_RE.match(line.strip()): return {}` — **(a) first
  appearance** — checked first, before the existing word-extraction loop
  (unchanged below it); a detected keyword line short-circuits to "no
  words," matching Lesson 4's own established `if not words: continue`
  behavior in `Parser.parse()` one level up (a keyword line is now
  silently skipped, exactly like a blank line already was).
- Everything from `words = {}` down — **(c) already basic**, entirely
  unchanged from Lessons 2–3.

### CS Lens

Per `python-regex-match-vs-search.md`: this is a real, ordered
disambiguation — two patterns that can both match overlapping input
(`END1` as a keyword, `D1` as a word), resolved by trying the more
specific one first and stopping there, the same general shape as
"maximal munch"/longest-match tokenizing rules in real lexers, without
needing to formalize it that heavily for 21 fixed keywords.

Also recognized in: a real compiler's lexer choosing `>=` over `>`
followed by `=` (longest match wins), a URL router matching
`/users/new` against a more specific route before falling back to
`/users/:id`, and a spam filter checking a sender against an allowlist
before running the expensive full content-scan — in every case, a
cheaper or more specific check runs first, precisely so the more general
mechanism never gets a chance to misfire on input it wasn't meant for.

### SE Lens

The real, honest scope: this makes keyword *lines* silently inert (no
crash, no words extracted) — it does not make `WHILE`/`DO`/`END` loops,
`IF`/`GOTO`, or macro variables (`#100`, `COS[...]`) actually execute.
`O0002.nc`'s bolt-circle loop still only produces one hole, at the
origin, not eight around a circle — a real, separate, later piece
(`cnc/expressionEvaluator.ts`, not yet read), named here rather than
silently left unexplained.

### Commands

None new — `re` is standard library, already imported.

### Run It — Real Output

Direct, isolated check against the real lines `O0002.nc` actually
contains (lines 8 and 15):

```
$ python -c "from core.lexer import parse_line; print(parse_line('END1'))"
{'words': {}, 'comment': ''}
$ python -c "from core.lexer import parse_line; print(parse_line('  N100 #103 = #100 * 360. / #101'))"
{'words': {}, 'comment': ''}
```
`END1` now produces no words at all, instead of `{'D': 1.0}`.

Full regression, run live, this session:
```
Lesson 4 example (G0 X10 Y20 / X30 / G1 Z-5 F100): unchanged, all three
commands identical to Lesson 4's own recorded output.
DEFAULT_PROGRAM (M3 S1000...M8): unchanged, 6 path points.
```

Against `O0002.nc` directly — honestly, not glossed over:
```
$ python -c "from core.parser import Parser; Parser().parse(open('O0002.nc').read())"
core.parser.UnsupportedCodeError: T-word is not supported yet
```
Still fails — one real line *earlier* in the file than `END1` (line 3's
`T2 M06`, not line 15's `END1`), a real, separate, already-named gap
(Lesson 29's own citation). This fix is real and verified in isolation;
it only becomes visible end-to-end once `T`-word support lands.

---

## Connect the Pieces

Follow `O0002.nc`'s real line 15, start to finish:

1. `Parser.parse()` (unchanged) calls `parse_line("END1")` for every raw
   line.
2. `parse_line` calls `strip_comment` (no comment present, `clean =
   "END1"`), then `tokenize(clean)`.
3. `tokenize` now checks `_KEYWORD_RE.match("END1")` first — `END\d+`
   matches, case-insensitively, at position `0` — and returns `{}`
   immediately, never reaching `_WORD_RE.finditer`.
4. `Parser.parse()`'s own `if not words: continue` (Lesson 4) skips the
   line entirely — no `_parse_block` call, no chance of an
   `UnsupportedCodeError`.
5. Without this check, step 3 would instead fall through to
   `_WORD_RE.finditer("END1")`, matching `D` immediately followed by `1`
   (the `E`/`N` before it aren't followed by a digit, so they never
   match), producing `{"D": 1.0}` — a real word `_parse_block` doesn't
   recognize.

## What Breaks Without This

Reverting `tokenize()` to skip the keyword check:
```python
def tokenize(line):
    words = {}
    for match in _WORD_RE.finditer(line):
        ...
```
Real, reproduced-live behavior: `parse_line("END1")` returns
`{'words': {'D': 1.0}, 'comment': ''}`, and feeding that word dict to
`Parser._parse_block` raises `UnsupportedCodeError: D-word is not
supported yet` — a real crash on a line that was never meant to carry any
G-code data, the exact bug this lesson closes.

## Exercises

1. Feed `"IF [#1 EQ 1] GOTOF N50"` through `parse_line` directly and
   confirm it also produces `{}` — tracing which alternative in
   `_KEYWORD_RE` matches first (`IF`, since alternation tries
   left-to-right and `IF` appears before `GOTOF` in the pattern, though
   either would have matched here since they're mutually exclusive
   prefixes of this particular line).
2. Using `python-regex-match-vs-search.md`'s own Exercise 1, explain in
   your own words why `_KEYWORD_RE` needs `re.IGNORECASE` at all — find a
   real G-code file (or write one) using lowercase `while`/`end1` and
   confirm live that it's treated identically to the uppercase form.
3. This project has no flow-control execution yet — write down, in
   plain English, what would have to be true of `core/parser.py` for a
   real `WHILE [#100 LT #101] DO1 ... END1` loop to actually repeat its
   body 8 times instead of being silently skipped once. (No code
   required — this is the real scope of the still-unstarted expression
   evaluator / flow-control piece.)

## Definition of Done

- [ ] `parse_line("END1")` returns `{'words': {}, 'comment': ''}` —
      verified live, not assumed.
- [ ] Lesson 4's own original example and the app's `DEFAULT_PROGRAM`
      both produce unchanged output — verified live.
- [ ] `O0002.nc` against the real parser still fails, but on `T-word`
      (line 3), not `D-word` (line 15) — verified live.
- [ ] `concepts/python-regex-match-vs-search.md` exists, with real,
      executed output.
- [ ] `git commit` — message explaining that this closes a real crash
      (a loop label misread as a data word) by porting the reference's
      own keyword-detection regex, checked before word extraction, and
      naming flow-control execution itself as separate, unstarted scope.
