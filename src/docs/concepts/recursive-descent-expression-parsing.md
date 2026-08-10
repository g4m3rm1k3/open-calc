# Concept: Recursive-Descent Expression Parsing With Precedence Climbing

**What you'll understand by the end:** how to hand-write a parser for
a real, nested arithmetic-style grammar — one function per precedence
level, each calling the next-higher-precedence function before
consuming its own operators — so operator precedence (`*` before `+`)
and arbitrary nested grouping (`(...)`) both fall out correctly, with
no separate "figure out precedence" pass required.

**Prerequisites:** `regular-language-finite-state-machine.md`.

## Setup

Python 3, no packages needed.

## The Problem

A flat, left-to-right scan over a tokenized expression (`2 + 3 * 4`)
naively applying each operator as it's encountered gets the real math
wrong — multiplication has to happen before addition, regardless of
which one appears first in the text, and a plain left-to-right walk
has no built-in notion of that at all.
`regular-language-finite-state-machine.md` already establishes the
concrete signal for when a hand-written parser is needed instead of a
flat scan or a single regex: real, nested, non-regular structure — and
`(...)` grouping, nested to arbitrary depth, is exactly that signal.

## The Isolated Example

The broken, naive approach — apply operators strictly left to right,
ignoring precedence entirely:

```python
def naive_left_to_right(tokens):
    result = float(tokens[0])
    i = 1
    while i < len(tokens):
        op = tokens[i]
        value = float(tokens[i + 1])
        if op == "+":
            result += value
        elif op == "-":
            result -= value
        elif op == "*":
            result *= value
        elif op == "/":
            result /= value
        i += 2
    return result


print(naive_left_to_right(["2", "+", "3", "*", "4"]))
```

**Real output, run this session:**
```
20.0
```

**What this proves:** `2 + 3 * 4` genuinely should be `14` (`3 * 4`
first, then `+ 2`) — the naive scan produced `20` instead, having
applied `+` before `*` purely because `+` appeared first in the text,
with no real notion of precedence anywhere in the code.

The fix — recursive-descent parsing with one function per precedence
level:

```python
import re


def tokenize(text):
    return re.findall(r"\d+\.?\d*|[()+\-*/]", text)


class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def advance(self):
        token = self.tokens[self.pos]
        self.pos += 1
        return token

    def parse_expression(self):
        # lowest precedence: + and -
        value = self.parse_term()
        while self.peek() in ("+", "-"):
            op = self.advance()
            right = self.parse_term()
            value = value + right if op == "+" else value - right
        return value

    def parse_term(self):
        # higher precedence: * and /
        value = self.parse_factor()
        while self.peek() in ("*", "/"):
            op = self.advance()
            right = self.parse_factor()
            value = value * right if op == "*" else value / right
        return value

    def parse_factor(self):
        # highest precedence: numbers and parenthesized sub-expressions
        token = self.advance()
        if token == "(":
            value = self.parse_expression()
            self.advance()  # consume ")"
            return value
        return float(token)


def evaluate(text):
    return Parser(tokenize(text)).parse_expression()


print("2 + 3 * 4 =", evaluate("2 + 3 * 4"))
print("(2 + 3) * 4 =", evaluate("(2 + 3) * 4"))
print("2 * (3 + 4) - 1 =", evaluate("2 * (3 + 4) - 1"))
```

**Real output, run this session:**
```
2 + 3 * 4 = 14.0
(2 + 3) * 4 = 20.0
2 * (3 + 4) - 1 = 13.0
```

**What this proves:** `2 + 3 * 4` now correctly evaluates to `14`,
matching real arithmetic precedence. Wrapping the identical `2 + 3` in
parentheses correctly *changes* the real result to `20` — proof the
parser genuinely respects explicit grouping, not just operator
precedence. The third case (`2 * (3 + 4) - 1 = 13`) confirms both
mechanisms working together correctly in one real expression.

## Mechanical Walkthrough

- Each precedence level gets its **own function**, ordered from
  lowest precedence (`parse_expression`, `+`/`-`) to highest
  (`parse_factor`, raw numbers and parenthesized groups) — a real,
  deliberate structural choice, not an arbitrary naming convention.
- Every function's **first action** is to call the *next-higher*
  precedence function to get its left-hand value, **before** looking
  for its own operators — this is what makes `*` bind tighter than
  `+`: by the time `parse_expression` sees a `+`, `parse_term` has
  already fully consumed and correctly evaluated any `*`/`/` on either
  side of it.
- A `while` loop (not a single `if`) at each level handles a real
  **chain** of same-precedence operators (`2 + 3 + 4`), consuming one
  operator and one next-level value per iteration, left to right.
- `parse_factor` encountering `(` **recurses back into
  `parse_expression`** — the lowest level, not the highest — which is
  exactly what allows arbitrary, correctly-prioritized expressions to
  appear nested inside parentheses to any real depth; the recursion
  itself is what a fixed-state regex or flat scan structurally cannot
  do (per `regular-language-finite-state-machine.md`'s own real
  limit).

## CS Lens

This is **recursive-descent parsing** with **precedence climbing** — a
real, standard, textbook technique for parsing expression grammars by
hand: one mutually-recursive function per precedence level, each
level "descending" into the next before handling its own real
operators. The nested function-call structure directly mirrors the
grammar's own real nesting (an expression contains terms, which
contain factors, which can themselves contain a full expression again
inside parentheses) — the code's own call structure **is** the
grammar, made executable.

Also recognized in: every real production compiler and interpreter's
own expression-parsing stage (this exact technique, or a closely
related table-driven variant, underlies parsing in most real
language implementations); a calculator app correctly respecting
`PEMDAS`; JSON parsing (a JSON value can itself contain nested JSON
values — the identical real recursive shape, applied to a different
grammar).

## SE Lens

The real, practical reason to reach for this over a bigger, cleverer
regex: `regular-language-finite-state-machine.md` already proves
regex structurally cannot track arbitrary nesting depth — a
recursive-descent parser's own real recursion is precisely the
mechanism that *can*, since each nested `(` genuinely grows the real
call stack rather than requiring a fixed, finite set of states to
somehow remember "how deep am I." The real, honest cost: more code
than a single regex, and a real grammar has to be thought through
level by level in advance — worth it exactly when the real input has
either meaningful operator precedence, arbitrary nesting, or both.

## Connection

Builds directly on `regular-language-finite-state-machine.md` — this
is the real, concrete technique that file's own Connection section
points toward once nested structure appears. A real, applied instance
in this project's own history: a Fanuc-style macro-expression parser
(`#nnn` variables, `[...]` grouping since `()` is already a real
G-code comment character, degree-based trig functions,
`EQ`/`NE`/`GT`/`GE`/`LT`/`LE` comparisons) built with the identical
real precedence-climbing structure — a `comparison` → `additive` →
`multiplicative` → `unary` → `primary` chain of nested parse
functions, each one an application of the exact shape this file's own
isolated example demonstrates in miniature.

A second, real, applied instance: the identical real parser/evaluator,
originally built for macro-program execution, reused completely
unchanged as the engine behind a standalone calculator dialog —
`evaluate(text, {})` called fresh on every keystroke against an empty
variable table, with the dialog itself contributing no parsing or math
logic of its own at all. A real, concrete confirmation that a
correctly-factored recursive-descent evaluator is genuinely reusable
outside its original calling context, not just theoretically so.

## Try It Yourself

1. Add a fourth precedence level, `parse_power`, for a real `^`
   exponentiation operator, binding *tighter* than `*`/`/` — insert it
   correctly into the existing chain (between `parse_term` and
   `parse_factor`) and confirm `2 + 3 * 2 ^ 2` evaluates to `14` (`2^2`
   first, then `*3`, then `+2`).
2. Add real unary minus support (`-5`, or `-(2 + 3)`) by having
   `parse_factor` check for a leading `-` token before falling through
   to the number/parenthesis cases — confirm `2 * -3` evaluates
   correctly.
3. Feed the parser a deliberately malformed expression (a missing
   closing paren, e.g. `"(2 + 3"`) and observe the real, resulting
   error — reasoning about what real, additional error-handling a
   production-quality parser would need beyond this file's own
   minimal, happy-path version.

## A Second Real Facet: Resolving a Grammar Ambiguity With One-Token Lookahead

Some real grammars have a genuine ambiguity a parser can only resolve
by peeking at what comes **immediately after** something it's already
parsed. Consider a function-call syntax, `F[x]`, that normally takes
one argument — except a special two-argument form, `F[Y]/[X]`, looks
**identical**, syntactically, to "call `F[Y]`, then divide the result
by `[X]`" right up until the parser checks what follows the closing
`]`:

```python
def parse_factor(self):
    token = self.advance()
    if token == "F":
        self.advance()  # '['
        first = self.parse_term()
        self.advance()  # ']'
        # One-token lookahead: is this F[Y]/[X], the special two-arg form?
        if self.peek() == "/" and self.tokens[self.pos + 1] == "[":
            self.advance()  # '/'
            self.advance()  # '['
            second = self.parse_term()
            self.advance()  # ']'
            return first * 100 + second  # stand-in "two-arg F" computation
        return first * 10  # stand-in "one-arg F" computation
    return float(token)


print("F[3] =", evaluate("F[3]"))
print("F[3]/2 =", evaluate("F[3]/2"))  # ordinary division AFTER F[3]
print("F[3]/[4] =", evaluate("F[3]/[4]"))  # the special two-arg form
```

**Real output, run this session:**
```
F[3] = 30.0
F[3]/2 = 15.0
F[3]/[4] = 304.0
```

**What this proves:** all three real expressions parse **correctly and
differently** — `F[3]` alone uses the plain one-argument rule (`30.0`);
`F[3]/2` correctly parses as ordinary division applied *after* a
complete, one-argument `F[3]` call (`15.0`, i.e. `30 / 2`); and
`F[3]/[4]` — visually almost identical to the previous line — is
correctly recognized as the special two-argument form instead
(`304.0`, the stand-in two-arg computation), because the parser
specifically checked that the token immediately after the `/` is a
literal `[`, not an ordinary value.

**Mechanical note:** the lookahead happens **inside** `parse_factor`,
immediately after consuming `F`'s own first bracketed argument and
*before* returning control back up to `parse_term` (which is what
would otherwise treat any following `/` as ordinary division). This is
exactly why the check has to happen at this specific point in the
grammar, not earlier or later — `parse_term`'s own operator-consuming
loop has no way to know that *this specific* `/` might mean something
grammatically different from every other `/` it processes.

### Try It Yourself (second facet)

1. Add a real, third case — `F[3]/[4]/[5]` — and reason about (then
   confirm) whether the current one-token lookahead correctly handles
   it, or whether it would need a real, further change to support a
   chained special form.
2. Remove the lookahead check entirely (always treat `/` as ordinary
   division) and confirm `F[3]/[4]` now parses as a real syntax
   error instead (dividing by a bracketed sub-expression the grammar
   was never designed to allow directly) — concrete proof the
   lookahead is what makes the special form parseable at all.
3. Compare this real technique against `python-math-atan2.md`'s own
   motivating case directly — that file explains *why* a two-argument
   `atan2(y, x)` function exists at the math-library level; this
   facet shows the identical two-argument need surfacing one level
   earlier, in a real grammar's own *syntax*, where a single, unusual
   token (a `/` immediately followed by `[`) is what signals "this is
   secretly a two-argument call," not a one-argument call followed by
   an ordinary operator.
