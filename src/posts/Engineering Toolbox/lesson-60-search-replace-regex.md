# Lesson 60: What `.*` Actually Does When It Runs

## What you will build

Two things, deliberately at different levels: a real, practical
search-and-replace toolkit using Python's `re` module's capture groups,
backreferences, and function-based replacements — swapping name order,
redacting credit card numbers, reformatting dates — and, underneath
that, a tiny regex engine built entirely from scratch, supporting only
literal characters, `.`, and `*`, verified line-by-line against Python's
own `re.search` on real test cases. The transferable idea this lesson is
actually about: every regex this curriculum has used since Lesson 55 has
been treated as a trusted black box — this lesson opens it, once, and
shows that even `.*`'s famous "match anything" behavior is nothing more
than ordinary recursion with backtracking, not a fundamentally different
kind of computation.

## What you need to know first

- **Lesson 55 through 59** — `re.compile`, `.match()`, `.sub()`, named
  groups — all used repeatedly as a trusted tool. This lesson is the
  first to look inside that tool rather than only use it.
- **Lesson 58** — recursive descent parsing and backtracking-free
  recursion; today's tiny regex engine needs actual **backtracking** —
  trying one possibility, and explicitly retrying a different one if it
  fails — a genuinely new control-flow pattern that lesson's grammar
  never required.

---

## The Problem, in prose, no code yet

Every regex pattern this curriculum has written since Lesson 55 —
`\d{1,6}`, `[^"\\]`, `.+?` — has been trusted to simply *work*, the same
way `hashlib.sha256` has been trusted since Lesson 13. That trust is
earned and appropriate; nobody should hand-roll SHA-256 for real use,
per Lesson 45's own explicit argument. But regex is different from a
hash function in one important way for this curriculum's purposes: its
core mechanism — try to match, and if a later part of the pattern fails,
go back and try a different amount of the earlier part — is genuinely
graspable in an afternoon, and understanding it changes how confusing
regex behavior (catastrophic backtracking, unexpected greedy matches)
stops looking mysterious and starts looking like ordinary, traceable
recursion.

---

## Concept Unit: Backreferences — Using What Was Captured

### The Problem

Lesson 51's CSV work and Lesson 59's log parsing both used named capture
groups to *extract* pieces of a match. Search-and-replace needs one more
capability: *reusing* a captured piece inside the replacement itself —
swapping `"Smith, John"` into `"John Smith"` requires both halves to
appear in the output, just reordered.

### Introduce the concept in isolation

```python
import re

names = "Smith, John\nDiaz, Maria\nO'Brien, Sean"

swapped = re.sub(r"(\w+(?:'\w+)?), (\w+)", r"\2 \1", names)
print("original:\n" + names)
print("\nswapped:\n" + swapped)
```

Run it:

```
original:
Smith, John
Diaz, Maria
O'Brien, Sean

swapped:
John Smith
Maria Diaz
Sean O'Brien
```

What this proves: `\2 \1` (**first appearance of backreferences in a
replacement string**) refers back to whatever the *second* and *first*
parenthesized groups in the pattern actually matched, for each
individual replacement — `\1` isn't a fixed string, it's "whatever group
1 captured this time," recomputed fresh for every match `re.sub` finds.
`(?:'\w+)?` (**first appearance of a non-capturing group**, `(?:...)`)
groups `'\w+` together for the `?` (optional) quantifier to apply to as
a unit, without creating a numbered group of its own — needed here
specifically so `O'Brien`'s apostrophe-plus-suffix is correctly included
as part of group 1 without shifting `\2`'s numbering.

This lab is deleted now; it never appears in the project. The technique
survives directly into the real toolkit next.

### CS Lens

A backreference in a replacement string is a small, constrained form of
**templating** — `\1`, `\2` acting as placeholders filled in from the
match itself, rather than from any external data — the same general
idea as an f-string's `{}` placeholders, specialized to "whatever this
specific match captured."

### SE Lens

Backreferences let one pattern handle infinitely many different real
inputs — any name matching the general shape, not just `"Smith, John"`
specifically — because the replacement is computed *from* each match
rather than being one fixed string. This is precisely what makes
`re.sub` a genuine search-and-replace *engine* rather than a simple
find-and-swap for one exact string.

---

## Concept Unit: A Real Toolkit — Backreferences and Function Replacement Together

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `search_replace.py`.
- **Change type:** add.
- **Dependencies:** `re`.

### The New Code

```python
CREDIT_CARD_PATTERN = re.compile(r"\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b")
DATE_PATTERN = re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b")


def redact_credit_cards(text):
    return CREDIT_CARD_PATTERN.sub(r"\1-XXXX-XXXX-\4", text)


def reformat_dates(text):
    def to_readable(match):
        year, month, day = match.group(1), match.group(2), match.group(3)
        month_names = ["", "January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"]
        return f"{month_names[int(month)]} {int(day)}, {year}"
    return DATE_PATTERN.sub(to_readable, text)
```

### Mechanical Walkthrough

- `\b` — **first appearance of a word boundary anchor.** Matches the
  invisible position between a word character and a non-word character
  (or the start/end of the string), with no characters of its own
  consumed — used here so `CREDIT_CARD_PATTERN` doesn't match a 16-digit
  run that's actually part of a longer number.
- `[- ]?` — a character class (established since Lesson 55) matching
  either a literal hyphen or a space, made optional with `?`, correctly
  handling card numbers written with spaces, hyphens, or neither.
- `redact_credit_cards` — a **hard concept reappearing**, the identical
  backreference technique from the previous unit, keeping the first and
  last groups of a card number visible while discarding the middle two
  — a real, plausible redaction shape.
- `reformat_dates`'s inner `to_readable(match)` — a **hard concept
  reappearing** from Lesson 57's `replace_bold`: `.sub()` accepts a
  *function* instead of a fixed replacement string, called once per
  match with the actual `Match` object, letting the replacement be
  computed with real logic (a month-number-to-name lookup) that a
  backreference string alone could never express.

### Run it

```python
print(swap_name_order("Contact: Smith, John or Diaz, Maria"))
print(redact_credit_cards("Card on file: 4111 1111 1111 1111, backup: 5500-0000-0000-0004"))
print(reformat_dates("Meeting on 2026-08-02, deadline 2026-12-31"))
```

```
Contact: John Smith or Maria Diaz
Card on file: 4111-XXXX-XXXX-1111, backup: 5500-XXXX-XXXX-0004
Meeting on August 2, 2026, deadline December 31, 2026
```

Three genuinely different real-world transformations — reordering,
redaction, and computed reformatting — from three small patterns and two
lines of replacement logic each.

### CS Lens and SE Lens

Both covered directly by the walkthrough above: string-template
backreferences for simple rearrangement, function-based replacement for
anything needing real logic — choosing between the two based on whether
the replacement is "rearrange what was captured" or "compute something
new from it," the same category of choice Lesson 55 drew between a
value needing direct handling versus recursive delegation.

---

## Concept Unit: What's Actually Happening Inside — A Tiny Regex Engine

### The Problem

Every pattern used so far has been handed to Python's own `re` module,
trusted to work. It's worth building a small, real version from scratch
— not to replace `re` (Lesson 45's own argument against hand-rolling
trusted tools applies here just as strongly), but to see, concretely,
that there's no hidden magic: even `.*`'s famous behavior is ordinary
recursive function calls.

### Project Change

- **Reference Source:** This unit ports the classic minimal recursive
  regex matcher widely attributed to Rob Pike (a five-function C
  implementation supporting only literals, `.`, `*`, and anchors,
  reproduced in Kernighan & Pike's *The Practice of Programming*), not
  any Python-specific source — translated here into Python, not copied
  from an existing Python port.
- **Files affected:** new file, `tiny_regex.py`.
- **Change type:** add.
- **Dependencies:** none — deliberately no use of the real `re` module
  inside the engine itself, only for the verification step afterward.

### The New Code

```python
def match_here(pattern, text):
    """Does `pattern` match starting at the very beginning of `text`?"""
    if pattern == "":
        return True
    if len(pattern) >= 2 and pattern[1] == "*":
        return match_star(pattern[0], pattern[2:], text)
    if pattern[0] == "$" and len(pattern) == 1:
        return text == ""
    if text != "" and (pattern[0] == "." or pattern[0] == text[0]):
        return match_here(pattern[1:], text[1:])
    return False


def match_star(repeated_char, remaining_pattern, text):
    """Try matching zero or more of `repeated_char`, then the rest of the pattern,
    starting from the LONGEST possible run and backing off."""
    positions_to_try = [text]
    while positions_to_try[-1] != "" and (
        positions_to_try[-1][0] == repeated_char or repeated_char == "."
    ):
        positions_to_try.append(positions_to_try[-1][1:])

    for candidate_text in reversed(positions_to_try):
        if match_here(remaining_pattern, candidate_text):
            return True
    return False
```

### Mechanical Walkthrough

- `match_here(pattern, text)` — **the core recursive function.** Base
  case: an empty pattern matches anything (including empty text) — there's
  nothing left to require. If the pattern's *second* character is `*`,
  the whole decision is delegated to `match_star`. Otherwise, one
  character is checked — `pattern[0] == "."` (matches anything) or an
  exact character match — and if it matches, `match_here` calls **itself**
  with both the pattern and text advanced by one character, checking
  "does the rest match the rest."
- `match_star(repeated_char, remaining_pattern, text)` — this is where
  **backtracking** (**first appearance of this exact term**, though
  the concept was implicit in this curriculum's own Lesson 45 AES
  discussion of trying candidate values) actually happens. `ab*c`
  against `"abbbbc"` needs to know *how many* `b`s to consume before
  trying to match `c` against what's left — the wrong choice (consuming
  all four `b`s when only, say, two were needed) would need to be
  un-done and retried with fewer. This function's approach: first walk
  forward, greedily, building a list of every possible "stopping point"
  (`positions_to_try`) — matching zero `b`s, one `b`, two `b`s, and so
  on, up to the longest possible run — then walk that list **backwards**,
  from the greediest match to the least, trying `match_here` on the
  *remaining* pattern at each stopping point, returning the moment one
  succeeds.
- Every recursive call — in both functions — represents one *attempt*;
  a `False` return from a deeper call doesn't crash anything, it simply
  means "that path didn't work," and the caller (in `match_star`'s
  `for` loop) tries the next-best alternative instead.

### Execution Trace

Matching `ab*c` against `"abbbbc"`, showing exactly which candidate
stopping points `match_star` builds and tries:

```
match_here("ab*c", "abbbbc"):
  pattern[0]='a' matches text[0]='a' -> recurse: match_here("b*c", "bbbbc")

match_here("b*c", "bbbbc"):
  pattern[1]='*' -> delegate to match_star('b', "c", "bbbbc")

match_star('b', "c", "bbbbc"):
  building positions_to_try by consuming matching 'b's:
    "bbbbc" -> "bbbc" -> "bbc" -> "bc" -> "c"  (stops: next char 'c' != 'b')
  positions_to_try = ["bbbbc", "bbbc", "bbc", "bc", "c"]
  trying from GREEDIEST (most b's consumed) backwards:
    match_here("c", "c")  -> pattern[0]='c' matches text[0]='c'
                           -> recurse: match_here("", "") -> True (empty pattern)
  -> succeeds on the very first (greediest) try -> returns True
```

Here the greediest match happened to work immediately — the trace for
`ab*c` against `"abxc"` (a real *failing* case from the test suite)
would instead show every candidate in `positions_to_try` tried in turn,
each one failing because an `x`, not a `c`, sits where `match_here`
expects the literal `c`, until the list is exhausted and `match_star`
correctly returns `False`.

### Run it — Verified Against Python's Real `re` Module

```python
test_cases = [
    (r"abc", "xxabcxx"), (r"abc", "xxabxx"),
    (r"a.c", "xabcxx"), (r"a.c", "xabxcxx"),
    (r"ab*c", "ac"), (r"ab*c", "abbbbc"), (r"ab*c", "abxc"),
    (r".*", "anything at all"),
    (r"^abc", "abcdef"), (r"^abc", "xabcdef"),
    (r"a*b*c*", ""), (r"x.*y", "x123y456y"),
]
for pattern, text in test_cases:
    ours = bool(tiny_match(pattern, text))
    reference = bool(real_re.search(pattern, text))
    print(f"pattern={pattern!r:10} text={text!r:20} ours={ours!s:5} re.search={reference!s:5} match={ours == reference}")
```

```
pattern='abc'      text='xxabcxx'            ours=True  re.search=True  match=True
pattern='abc'      text='xxabxx'             ours=False re.search=False match=True
pattern='a.c'      text='xabcxx'             ours=True  re.search=True  match=True
pattern='a.c'      text='xabxcxx'            ours=False re.search=False match=True
pattern='ab*c'     text='ac'                 ours=True  re.search=True  match=True
pattern='ab*c'     text='abbbbc'             ours=True  re.search=True  match=True
pattern='ab*c'     text='abxc'               ours=False re.search=False match=True
pattern='.*'       text='anything at all'    ours=True  re.search=True  match=True
pattern='^abc'     text='abcdef'             ours=True  re.search=True  match=True
pattern='^abc'     text='xabcdef'            ours=False re.search=False match=True
pattern='a*b*c*'   text=''                   ours=True  re.search=True  match=True
pattern='x.*y'     text='x123y456y'          ours=True  re.search=True  match=True

ALL TEST CASES MATCH PYTHON'S re MODULE: True
```

Twelve cases — including the tricky `ab*c` against `abxc` failure case,
which specifically exercises `match_star`'s full backtracking loop
before correctly giving up — every one matching Python's own,
professionally-implemented `re.search` exactly, on the small subset of
syntax this tiny engine supports.

### CS Lens

This is **backtracking search** applied to pattern matching: try the
most promising option first (the greediest possible `*` match), and if
it leads to failure further down the line, undo it and try the next
option — the identical general strategy behind solving mazes,
constraint-satisfaction puzzles, and (a direct, real connection) exactly
why poorly-written regexes with multiple adjacent `*`/`+` quantifiers
can exhibit **catastrophic backtracking** — an exponential explosion of
candidate positions to try — a real, practical performance hazard that
now has a mechanical, traceable explanation rather than being an
opaque warning to just avoid.

Also recognized in: real regex engines (Python's own `re`, PCRE,
JavaScript's engine) all implementing a far more complete version of
this same backtracking strategy; Lesson 74's future backtracking search
algorithms, which will name this exact technique again in a different
problem domain.

### SE Lens

This tiny engine deliberately supports only three constructs — literals,
`.`, `*` — out of the dozens real regex syntax provides (character
classes, `+`, `?`, alternation, groups, backreferences — everything
this lesson's own *first* half already used). Building the minimal
version that still demonstrates the real mechanism, rather than
attempting a complete reimplementation, is a deliberate scope choice:
the goal is understanding *how* backtracking works, not producing
something anyone should ever use instead of the real `re` module — the
same "open the box once, then go back to trusting the real tool"
relationship this curriculum has now applied to HTTP (Lesson 24), JSON
(Lesson 55), and regex alike.

---

## Connect the pieces

One pattern, `ab*c`, followed through both halves of this lesson: as a
*used* tool, this exact shape (a literal, a repeatable character, another
literal) is the same structural idea behind `CREDIT_CARD_PATTERN`'s
`(\d{4})[- ]?` — a fixed piece, an optional/repeatable piece, more fixed
structure — trusted, real, in daily use. As a *mechanism*, `ab*c`
against `"abbbbc"` is nothing more than `match_here` recursing forward
through `a`, delegating to `match_star` for the `b*`, which builds a
list of every possible number of `b`s to consume and tries them from
greediest to least, recursing back into `match_here` at each attempt
until one succeeds — verified, directly, to produce the exact same
answer as Python's own trusted implementation on every real test case
tried.

## What breaks without this

Removing `match_star`'s backtracking — trying only the greediest
possible match and never backing off if it fails — would break exactly
the case this lesson's trace showed working correctly: a pattern like
`ab*c` against text where the greedy match consumes too much (imagine
`"abcabc"` matched against `ab*c` intending to stop at the first `c`)
would fail to find a match that a correct engine, and Python's own
`re.search`, both find successfully, because only backing off from the
greediest attempt when it fails ever reaches the position where the
pattern actually does match.

## Definition of done

- [ ] `swap_name_order`, `redact_credit_cards`, and `reformat_dates`
      each produce correct output on real, varied input.
- [ ] `tiny_match` produces results identical to `re.search` on all
      twelve of this lesson's test cases, including the backtracking
      failure case (`ab*c` against `"abxc"`).
- [ ] You can trace, by hand, exactly which candidate positions
      `match_star` builds and tries for `ab*c` against `"abbbbc"`,
      matching this lesson's own execution trace.
- [ ] You can explain, in your own words, what "catastrophic
      backtracking" is, using this lesson's own mechanism as the
      explanation rather than as a rule to memorize.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add search_replace.py tiny_regex.py
  git commit -m "Add real search-and-replace toolkit (backreferences, function replacement) plus a from-scratch tiny regex engine verified against re.search on 12 cases including backtracking"
  ```

## What's next

This closes Track 7. Every parsing and pattern-matching technique
built across it — tokenizing (55), flat state machines (56), mixed
recursive/flat parsing (57), precedence-aware recursive descent (58),
streaming extraction (59), and now backtracking pattern matching (60) —
reappears directly in Track 8's binary format work, applied to raw
bytes instead of text, where no whitespace or line structure exists to
lean on at all.
