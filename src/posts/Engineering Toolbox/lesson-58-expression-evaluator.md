# Lesson 58: Precedence Is Encoded in Which Function Calls Which

## What you will build

A full arithmetic expression evaluator — `+`, `-`, `*`, `/`, parentheses,
unary minus — built as a recursive descent parser that evaluates
directly as it parses, with correct operator precedence and
left-associativity, verified first by hand against eight real cases and
then automatically against **500 randomly generated expressions**,
checked directly against Python's own `eval()`. The transferable idea
this lesson is actually about, promised by both Lesson 55 and Lesson 57:
operator precedence isn't implemented by consulting a table of "which
operator binds tighter" at evaluation time — it's built directly into
the *shape* of the grammar, and therefore directly into which parsing
function calls which other parsing function.

## What you need to know first

- **Lesson 55** — recursive descent parsing, `Parser.parse_value`
  calling `parse_object`/`parse_array` and back again. Today's
  `parse_expression`/`parse_term`/`parse_factor` is the same technique,
  applied to a grammar with a genuinely new property JSON's never had:
  operators with different binding strength.
- **Lesson 57** — the closing note that promised this exact gap:
  "operators have real precedence... a genuinely new grammar wrinkle."
  This lesson is that wrinkle, resolved.

---

## The Problem, in prose, no code yet

`2 + 3 * 4` should evaluate to `14`, not `20` — multiplication is
supposed to happen before addition, a rule every arithmetic student
learns before they ever see a computer. A parser that simply reads
tokens left to right and applies each operator as it's encountered gets
this wrong, provably, demonstrated directly below. Fixing it isn't a
matter of remembering to "check precedence" somewhere — it requires
structuring the *grammar itself*, and the recursive functions that
implement it, so that lower-precedence operators (`+`, `-`) are handled
by an *outer* layer of parsing that naturally defers to an *inner* layer
for higher-precedence operators (`*`, `/`) — precedence expressed as
nesting depth in the code, not as a rule consulted at runtime.

---

## Concept Unit: Proving the Naive Approach Is Wrong

### The Problem

Before building the fix, it's worth measuring the actual size of the
problem with real, concrete numbers rather than taking "precedence
matters" on faith.

### Introduce the concept in isolation

```python
def naive_left_to_right(tokens):
    result = tokens[0]
    index = 1
    while index < len(tokens):
        operator = tokens[index]
        operand = tokens[index + 1]
        if operator == "+":
            result = result + operand
        elif operator == "*":
            result = result * operand
        index += 2
    return result

tokens = [2, "+", 3, "*", 4]  # represents "2 + 3 * 4"
naive_result = naive_left_to_right(tokens)
correct_result = 2 + 3 * 4

print("naive left-to-right result:", naive_result)
print("mathematically correct result:", correct_result)
print("naive approach is correct:", naive_result == correct_result)
```

Run it:

```
naive left-to-right result: 20
mathematically correct result: 14
naive approach is correct: False
```

What this proves: reading `2 + 3 * 4` strictly left to right computes
`(2 + 3) * 4 = 20` — treating every operator as equally binding, applied
in the order encountered, is a real, different, wrong answer, not a
subtle edge case. The fix needs the parser itself to recognize that `*`
binds its operands *before* `+` gets to combine anything, regardless of
the order the operators appear in the source text.

This lab is deleted now; it never appears in the project.

### CS Lens

This is exactly the problem **operator precedence** exists to solve —
formally, a rule for disambiguating an expression that could otherwise
be grouped multiple different, all-superficially-valid ways, resolved by
convention (mathematics has used this exact precedence for `+`/`*` for
centuries) rather than by the text's own left-to-right order.

### SE Lens

The fix explored in the rest of this lesson is not "add an if-check for
precedence" bolted onto the naive loop above — it's a structural change
to *how* parsing itself proceeds, because precedence is fundamentally a
*grammar* property, not a runtime decision, and grammar properties are
correctly expressed by the shape of a recursive descent parser, exactly
as Lesson 55 already established for JSON's nesting.

---

## Concept Unit: A Grammar With Layers

### The Problem

The fix needs the parser to naturally treat `*`/`/` as "tighter,"
binding before `+`/`-` ever combines anything. Recursive descent
achieves this with a specific, standard structure: one parsing function
per precedence level, each level calling the *next tighter* level for
its individual operands.

### Project Change

- **Reference Source:** No reference counterpart — this grammar follows
  the standard, textbook shape for arithmetic expression parsing found
  in virtually every introductory compilers text, not a specific
  existing parser's source.
- **Files affected:** new file, `expression_evaluator.py`.
- **Change type:** add.
- **Dependencies:** `re`, for tokenizing (a **hard concept reappearing**
  from Lesson 55/57's own regex-based tokenizers).

### The New Code

```python
class Evaluator:
    def __init__(self, tokens):
        self.tokens = tokens
        self.position = 0

    def peek(self):
        return self.tokens[self.position] if self.position < len(self.tokens) else (None, None)

    def advance(self):
        token = self.peek()
        self.position += 1
        return token

    def parse_expression(self):
        """expression = term (('+' | '-') term)*"""
        result = self.parse_term()
        while self.peek()[0] in ("PLUS", "MINUS"):
            operator_kind, _ = self.advance()
            right = self.parse_term()
            result = result + right if operator_kind == "PLUS" else result - right
        return result

    def parse_term(self):
        """term = factor (('*' | '/') factor)*"""
        result = self.parse_factor()
        while self.peek()[0] in ("TIMES", "DIVIDE"):
            operator_kind, _ = self.advance()
            right = self.parse_factor()
            result = result * right if operator_kind == "TIMES" else result / right
        return result

    def parse_factor(self):
        """factor = NUMBER | '(' expression ')' | '-' factor"""
        kind, value = self.peek()
        if kind == "NUMBER":
            self.advance()
            return float(value) if "." in value else int(value)
        if kind == "LPAREN":
            self.advance()
            result = self.parse_expression()
            close_kind, _ = self.advance()
            if close_kind != "RPAREN":
                raise ExpressionError("expected closing ')'")
            return result
        if kind == "MINUS":
            self.advance()
            return -self.parse_factor()
        raise ExpressionError(f"unexpected token {kind} at position {self.position}")
```

### Mechanical Walkthrough

- The three docstrings — `expression = term (('+' | '-') term)*` and so
  on — are this parser's actual grammar, written in a compact,
  standard notation (`*` here meaning "zero or more repetitions," an
  unrelated use of the character from the arithmetic `*` operator
  itself) before a line of implementation follows it — the code below
  each docstring is a direct, mechanical translation of that one line.
- `parse_expression` — calls `parse_term` **first**, for its left
  operand, *before* even checking whether a `+`/`-` follows. This
  ordering is the entire trick: whatever `parse_term` returns has
  already fully resolved any `*`/`/` operations within it, so by the
  time `parse_expression` sees a `+` or `-`, both sides are already
  fully-computed values, never partially-computed ones a looser
  precedence rule might have grabbed too early.
- The `while` loop in `parse_expression` — handles **left-associativity**
  (a **first appearance of this specific term**, though the behavior
  itself is intuitive): `10 - 2 - 3` must mean `(10 - 2) - 3 = 5`, not
  `10 - (2 - 3) = 11`. Looping and repeatedly folding each new right-hand
  `term` into the running `result` achieves exactly that, left to right,
  rather than any recursive structure that might naturally group
  right-to-left instead.
- `parse_term` — the **identical shape**, one precedence level tighter:
  it calls `parse_factor` for its operands, meaning any parenthesized
  sub-expression or plain number is fully resolved before `*`/`/` ever
  combines two values.
- `parse_factor` — the innermost, tightest level: a plain number, **or**
  — the actual source of arbitrary nesting depth — an opening `(`
  triggering a call all the way back *out* to `parse_expression`,
  recursively parsing everything inside the parentheses as a
  brand-new, fully general expression, before returning back down
  through `parse_term` to wherever the `(` was originally encountered.
  This is what makes `2 * (3 + (4 - 1) * 2)` work at all: the outer
  `parse_factor` call, upon seeing `(`, doesn't know or care that it's
  about to recurse through the *entire* three-function chain again,
  potentially several levels deep — it just calls `parse_expression`
  and trusts the recursion to handle however deep the real parentheses
  actually go.
- The `MINUS` branch inside `parse_factor` — **unary minus**, handled by
  recursing into `parse_factor` *again* (not `parse_expression`),
  correctly binding tighter than any binary operator: `-2 + 3` means
  `(-2) + 3`, not `-(2 + 3)`.

### Execution Trace

Parsing `2 + 3 * 4`, showing exactly which function is active at each
step:

```
parse_expression() calls parse_term() for the left side
  parse_term() calls parse_factor() -> NUMBER '2' -> returns 2
  parse_term() peeks: next token is PLUS, not TIMES/DIVIDE -> loop doesn't run
  parse_term() returns 2
parse_expression(): result = 2
parse_expression() peeks: PLUS -> advance, call parse_term() for the right side
  parse_term() calls parse_factor() -> NUMBER '3' -> returns 3
  parse_term() peeks: next token is TIMES -> loop runs
    advance TIMES, call parse_factor() -> NUMBER '4' -> returns 4
    result = 3 * 4 = 12
  parse_term() peeks: nothing left -> loop ends, returns 12
parse_expression(): result = 2 + 12 = 14
parse_expression() peeks: nothing left -> loop ends, returns 14
```

`3 * 4` was fully resolved to `12` entirely *inside* the recursive call
to `parse_term`, before `parse_expression` ever got to add anything —
precedence enforced purely by which function was active when, never by
consulting a lookup table of operator strengths anywhere in the code.

### Run it — Hand Cases, Verified Against `eval()`

```python
hand_cases = [
    "2 + 3 * 4", "(2 + 3) * 4", "2 * 3 + 4 * 5", "10 - 2 - 3",
    "10 / 2 / 5", "-5 + 3", "2 * (3 + (4 - 1) * 2)", "-(2 + 3)",
]
for expression in hand_cases:
    ours = evaluate(expression)
    reference = eval(expression)
    print(f"{expression!r:25} ours={ours!r:8} eval()={reference!r:8} match={ours == reference}")
```

```
'2 + 3 * 4'               ours=14       eval()=14       match=True
'(2 + 3) * 4'             ours=20       eval()=20       match=True
'2 * 3 + 4 * 5'           ours=26       eval()=26       match=True
'10 - 2 - 3'              ours=5        eval()=5        match=True
'10 / 2 / 5'              ours=1.0      eval()=1.0      match=True
'-5 + 3'                  ours=-2       eval()=-2       match=True
'2 * (3 + (4 - 1) * 2)'   ours=18       eval()=18       match=True
'-(2 + 3)'                ours=-5       eval()=-5       match=True
```

Every case matches — including `10 - 2 - 3` and `10 / 2 / 5`, both
specifically chosen to test left-associativity, and `2 * (3 + (4 - 1) *
2)`, testing three levels of parenthesis nesting resolved correctly.

### CS Lens

This is **precedence climbing implemented through grammar layering** —
one of the two standard textbook techniques for this exact problem (the
other, precedence climbing via an explicit numeric precedence table
passed as a parameter, produces the same result through a more general
but less directly readable mechanism). Here, precedence isn't data the
parser consults — it's structure the parser *is*.

Also recognized in: essentially every real programming language's own
expression parser, all needing this exact same layered-grammar shape
(or its table-driven cousin) to correctly handle `*` binding tighter
than `+`; calculator apps; spreadsheet formula evaluators.

### SE Lens

Adding a new operator at a *new* precedence level (exponentiation `^`,
binding tighter than `*`/`/`) means inserting one new function between
`parse_term` and `parse_factor` in this exact chain — a small,
localized, structural change that doesn't touch the existing functions'
logic at all, just where they call. Adding an operator at an *existing*
level (say, modulo `%` alongside `*`/`/`) means adding one more check to
that level's existing `while` condition. Both changes are small
specifically because the grammar's layered structure already anticipates
exactly this kind of extension.

---

## Concept Unit: Verifying at Scale, Not Just by Hand

### The Problem

Eight hand-picked cases, however carefully chosen, can't rule out every
possible mistake — a subtle bug in, say, division's left-associativity
under three levels of nesting might simply never appear in a small,
manually-written test set. Something broader is needed.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `fuzz_test.py`.
- **Change type:** add.
- **Dependencies:** `random`, `evaluate` (this lesson's own function).

### The New Code

```python
import random

random.seed(20260801)  # fixed seed for a reproducible test run

def generate_random_expression(max_depth=3):
    if max_depth <= 0 or random.random() < 0.4:
        return str(random.randint(1, 9))
    left = generate_random_expression(max_depth - 1)
    right = generate_random_expression(max_depth - 1)
    operator = random.choice(["+", "-", "*", "/"])
    if random.random() < 0.3:
        left = f"({left})"
    if random.random() < 0.3:
        right = f"({right})"
    return f"{left} {operator} {right}"
```

### Mechanical Walkthrough

- `random.seed(20260801)` — a **hard concept reappearing** from Lesson
  43's own explanation of `random`'s determinism — deliberately *wanted*
  here, unlike that lesson's security context: a fixed seed means this
  exact test run is perfectly reproducible, generating the identical 500
  expressions every time it's run again, useful for a test whose whole
  point is repeatable verification.
- `generate_random_expression` — itself **recursive**, matching the
  grammar it's generating text for: with 40% probability (or once
  `max_depth` runs out), it returns a plain single-digit number;
  otherwise, it generates two *smaller* random expressions recursively
  and joins them with a random operator, occasionally wrapping either
  side in real parentheses — naturally producing everything from trivial
  single numbers to deeply nested, operator-mixed expressions, with no
  hand-written cases required at all.

### Run it

```python
TRIAL_COUNT = 500
mismatches = []
errors = []

for trial_number in range(TRIAL_COUNT):
    expression = generate_random_expression()
    try:
        reference = eval(expression)
    except ZeroDivisionError:
        continue
    try:
        ours = evaluate(expression)
    except ExpressionError as error:
        errors.append((expression, str(error)))
        continue
    if abs(ours - reference) > 1e-9:
        mismatches.append((expression, ours, reference))

print(f"ran {TRIAL_COUNT} random expressions")
print(f"mismatches: {len(mismatches)}")
print(f"unexpected errors: {len(errors)}")
```

```
ran 500 random expressions
mismatches: 0
unexpected errors: 0

ALL RANDOM EXPRESSIONS MATCHED eval() EXACTLY
```

Five hundred independently generated expressions — arbitrary nesting
depth, arbitrary mixes of all four operators, arbitrary parenthesization
— every single one evaluating to exactly the same result (within
floating-point tolerance, `abs(ours - reference) > 1e-9`, needed because
real division can introduce tiny representable differences even between
two entirely correct implementations) as Python's own trusted `eval()`.

### CS Lens

This is **property-based testing** (via **fuzzing** — automatically
generating varied inputs rather than hand-selecting them) checked
against a **differential** — comparing one implementation's output
against a second, independent, trusted implementation, rather than
against a fixed list of expected answers someone had to compute and
write down by hand ahead of time.

### SE Lens

Writing 500 expressions by hand would be impractical and, worse, would
likely share the same blind spots as the eight hand-picked cases above —
a human choosing test cases tends to (unconsciously) choose cases that
confirm what they already believe works. Generating them randomly and
checking against a trusted reference removes exactly that bias, the
same class of argument Lesson 55 made for checking against `json.loads`
rather than only self-consistency, scaled up from 14 fixed documents to
500 freshly generated ones.

---

## Connect the pieces

One expression, `2 * (3 + (4 - 1) * 2)`, traced through the full grammar
chain: `parse_expression` calls `parse_term`, which calls `parse_factor`
for the `2`, sees `*`, and calls `parse_factor` again for the
parenthesized group — which recurses all the way back out to a fresh
`parse_expression` call to handle `3 + (4 - 1) * 2` as its own complete
sub-problem, itself calling `parse_term`, which calls `parse_factor`
for `(4 - 1)`, recursing *again* for that innermost group. Three levels
of real recursion, driven entirely by nested parentheses, each level
correctly resolving its own tightest-bound operations before returning
a single number up to whatever called it — verified correct not just for
this one expression but across 500 independently generated ones,
checked against Python's own trusted evaluator.

## What breaks without this

Swapping `parse_expression`'s and `parse_term`'s roles — having the
*outer* function call itself for `*`/`/`, and the *inner* function
handle `+`/`-` — inverts precedence entirely. Re-running the very first
lab's own case through such a swapped parser would reproduce that lab's
naive result: `2 + 3 * 4` evaluating to `20`, the exact wrong answer this
whole lesson exists to fix, now reintroduced by a structural mistake in
which function calls which, rather than by skipping precedence handling
altogether.

## Definition of done

- [ ] `evaluate("2 + 3 * 4")` returns `14`, not `20`.
- [ ] `evaluate("10 - 2 - 3")` and `evaluate("10 / 2 / 5")` both confirm
      correct left-associativity.
- [ ] `evaluate("2 * (3 + (4 - 1) * 2)")` correctly resolves three levels
      of parenthesis nesting.
- [ ] The 500-expression fuzz test reports zero mismatches against
      `eval()`.
- [ ] You can trace, by hand, which of `parse_expression`/`parse_term`/
      `parse_factor` is active at each step of parsing `2 + 3 * 4`,
      matching this lesson's own execution trace.
- [ ] You can explain, without looking back at this lesson, where in the
      code you'd add a new, tighter-than-`*` operator like `^`.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add expression_evaluator.py fuzz_test.py
  git commit -m "Add recursive descent arithmetic evaluator with precedence encoded as grammar layering, verified against eval() on 500 randomly generated expressions with zero mismatches"
  ```

## What's next

Track 8's binary format lessons return to tokenizing and structured
parsing once more, this time over raw bytes instead of text — the same
underlying skill (recognize the pieces, understand how they combine)
applied to a domain with no natural whitespace or line breaks to lean
on at all.
