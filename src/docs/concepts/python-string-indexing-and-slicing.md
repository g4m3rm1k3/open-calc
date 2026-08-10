# Concept: Python String Indexing and Slicing

**What you'll understand by the end:** how to pull a single character
out of a string by position (`text[0]`) and an open-ended range of
characters (`text[1:]`), and the real, meaningful difference between
how indexing and slicing each handle an out-of-range position.

**Prerequisites:** none beyond the assumed floor.

## Setup

Python 3, no packages needed.

## The Problem

Once a piece of text has already been validated to have a known,
guaranteed shape (say, "always one letter followed by digits"), pulling
out its pieces doesn't need a regex at all — it can be done directly,
by real, fixed position. Regex is for *discovering* structure in
unknown text; plain indexing and slicing are for *extracting* from text
whose structure is already known and trusted.

## The Isolated Example

```python
token_text = "X10"

letter = token_text[0]
number_part = token_text[1:]

print("letter:", repr(letter))
print("number_part:", repr(number_part))

# Open-ended slicing works from either end:
last_two = token_text[-2:]
all_but_last = token_text[:-1]
print("last two chars:", repr(last_two))
print("all but the last char:", repr(all_but_last))

# Indexing out of range raises a real, immediate error --
# slicing out of range does NOT, it just returns less than asked for.
try:
    token_text[10]
except IndexError as e:
    print(f"IndexError: {e}")

print("slicing past the end doesn't error:", repr(token_text[10:]))
```

**Real output, run this session:**
```
letter: 'X'
number_part: '10'
last two chars: '10'
all but the last char: 'X1'
IndexError: string index out of range
slicing past the end doesn't error: ''
```

**What this proves:** `text[0]` and `text[1:]` genuinely split
`"X10"` into its letter and its numeric remainder, with no pattern
matching involved at all — just fixed real positions. `text[10]`
(indexing past the string's real length) raised a genuine
`IndexError` immediately. `text[10:]` (slicing from a starting
position past the end) did **not** error at all — it simply returned
an empty string, `''`, silently.

## Mechanical Walkthrough

- `text[i]` — **indexing** — returns the single real character at
  position `i` (0-indexed: `text[0]` is the first character). It's a
  real, strict operation: asking for a position that doesn't exist
  raises `IndexError`.
- `text[start:end]` — **slicing** — returns a new string containing
  characters from `start` up to (but not including) `end`. Either
  bound can be omitted: `text[1:]` means "from index 1 to the end,"
  `text[:-1]` means "from the start up to (not including) the last
  character."
- Negative indices/slice bounds count from the **end** of the string:
  `text[-1]` is the last character, `text[-2:]` is the last two
  characters.
- Slicing is deliberately **forgiving** about out-of-range bounds — a
  `start` or `end` beyond the string's real length is silently clamped
  to the string's actual length rather than raising an error, which is
  *why* `text[10:]` on a 3-character string returns `''` instead of
  crashing: Python treats "start past the end" as "there's nothing
  left to include," not as an invalid request.

## CS Lens

This is the real, direct difference between an operation that demands
a **single, exact position exist** (indexing) and one that describes a
**range**, which is always well-defined even when it's empty (slicing)
— a range from position 10 to the end of a 3-character string is a
perfectly coherent range, it just happens to contain zero characters.
This same real asymmetry (strict single-element access vs. forgiving
range access) recurs in Python's `list` type identically, since strings
and lists share the same real sequence-indexing/slicing protocol.

Also recognized in: array/string indexing and slicing across most
modern languages sharing a similar real distinction (JavaScript's
`.slice()` similarly clamps out-of-range bounds rather than throwing);
database `LIMIT`/`OFFSET` queries, which return fewer rows than
requested rather than erroring when a range extends past the real data
available.

## SE Lens

The real, practical reason this matters in parsing/lexing code
specifically: once a lexer has already validated a token's shape (a
letter followed by digits, guaranteed by whatever pattern produced it),
the code consuming that token can extract pieces by trusted, fixed
position — `text[0]`/`text[1:]` — rather than re-deriving the same
structure with a second regex. This only remains safe as long as the
upstream guarantee genuinely holds; extracting by fixed position from
text whose shape *hasn't* been validated first is a real, different
and riskier situation, since indexing past the end of a shorter-than-
expected string raises a real `IndexError` with no earlier warning.

## Connection

Directly relevant wherever code processes text a separate, upstream
step has already validated — a lexer's own tokens (`python-enum-and-
auto.md`'s `TokenType`-classified tokens are exactly this kind of
pre-validated text) being consumed downstream by fixed-position
extraction rather than a second round of pattern matching.

## Try It Yourself

1. Try `token_text[0:1]` (an explicit slice of length one) versus
   `token_text[0]` (plain indexing) — confirm they return the *same*
   real character but as genuinely different types (a length-1 `str`
   versus... also a `str` — unlike some languages, Python has no
   separate "character" type, so both are strings, but only indexing
   can raise `IndexError`).
2. Slice with a **step** (`token_text[::2]`, every second character)
   and confirm it selects real, alternating characters — a third,
   optional slice parameter beyond `start`/`end`.
3. Write a small function that takes a string guaranteed (by an
   upstream check) to start with exactly one letter followed only by
   digits, and returns `(letter, int(digits))` using indexing/slicing
   — then pass it a string that violates that guarantee and observe
   what actually goes wrong, connecting back to this file's own SE
   Lens about trusting an upstream guarantee.
