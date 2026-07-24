# Lesson 6: The Same Pipeline, in Kotlin

*(Real Expression Evaluation)*

**User Story**
> As a user, I want pressing `=` to actually compute a result, respecting
> the normal order of operations.

**What you will build**
`"="` in `onButtonPressed` (Lesson 5) stops being a no-op and actually
evaluates `expression`, correctly handling `×`/`÷` before `+`/`−` (so
`7+3×2` gives `13`, not `20`).

**What you need to know first**
Lesson 5's `expression` state and `onButtonPressed`. If you've read this
repo's OpenMAT project, the shape here — tokenize, then parse respecting
precedence, then evaluate — will be immediately familiar; it isn't assumed,
but named directly where it applies.

---

## Concept Unit: Recursive Descent, Ported to Kotlin

### The Problem

`expression` is currently just a `String` — `"7+3×2"`. Turning that into
the number `13.0` needs the calculation to respect **precedence**:
multiplication and division bind tighter than addition and subtraction, so
`3×2` must be computed before it's added to `7`, even though `+` appears
first when reading left to right.

### The New Code

```kotlin
fun evaluate(expression: String): Double {
    var position = 0

    fun peek(): Char? = if (position < expression.length) expression[position] else null

    fun parseNumber(): Double {
        val start = position
        while (peek() != null && (peek()!!.isDigit() || peek() == '.')) position++
        return expression.substring(start, position).toDouble()
    }

    fun parseTerm(): Double {
        var result = parseNumber()
        while (peek() == '×' || peek() == '÷') {
            val op = peek()
            position++
            val rhs = parseNumber()
            result = if (op == '×') result * rhs else result / rhs
        }
        return result
    }

    fun parseExpression(): Double {
        var result = parseTerm()
        while (peek() == '+' || peek() == '−') {
            val op = peek()
            position++
            val rhs = parseTerm()
            result = if (op == '+') result + rhs else result - rhs
        }
        return result
    }

    return parseExpression()
}
```

Run it as a throwaway script first, before it touches the app at all:

```bash
kotlin eval.kts
```

with:

```kotlin
println(evaluate("7+3"))
println(evaluate("7+3×2"))
println(evaluate("10÷2−1"))
```

appended. Real output — verified this session:

```text
10.0
13.0
4.0
```

*What this proves:* `7+3×2` correctly gives `13.0`, not `20.0` — `3×2` was
computed by `parseTerm` as one unit before `parseExpression` ever added `7`
to it. Precedence came from *which function calls which*, not from any
explicit precedence numbers.

### Discard the throwaway script

Delete `eval.kts`. The `evaluate` function itself moves into the app
unchanged — copy it into a new file, `Evaluator.kt`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch port,
  loosely inspired by this repo's OpenMAT tokenizer/parser structure
  (`Text → Tokens → AST → Result`), simplified to skip a separate token or
  AST stage entirely, since this calculator has no variables, functions, or
  parentheses yet to justify one (an honest scope cut, not an oversight —
  Lesson 21's formula screen is a better fit for a real AST if you choose
  to extend that far).
- **Files affected:** New file `Evaluator.kt`; `onButtonPressed` in the
  calculator screen's file.
- **Change type:** Add + modify.
- **Location:** `"=" -> expression` branch inside `onButtonPressed`.
- **Dependencies:** None new.

### The Updated Project

```kotlin
fun onButtonPressed(label: String) {
    expression = when (label) {
        "C" -> ""
        "=" -> evaluate(expression).toString()   // ← changed
        else -> expression + label
    }
}
```

Pressing `=` now replaces `expression` with the real computed result,
converted back to a displayable string — every other branch is unchanged
from Lesson 5.

### Mechanical walkthrough

1. `var position = 0` — (hard concept reappearing) ordinary mutable state,
   this time tracking a cursor's position through the string as parsing
   consumes it, not UI state.
2. `fun peek(): Char? = ...` — (first appearance in this file) a
   **single-expression function** (Lesson 0) returning `Char?` — nullable,
   because looking past the end of the string has no character to return;
   `if (position < expression.length) expression[position] else null` makes
   that "nothing left" case an honest `null` instead of throwing or
   returning a fake sentinel character.
3. `peek()!!.isDigit()` — (hard concept reappearing) Lesson 0's `!!` —
   used here only *after* the surrounding `peek() != null` check already
   guarantees non-null, which is exactly the disciplined, narrow use case
   `!!` is for, not a shortcut around checking at all.
4. `parseNumber()`, `parseTerm()`, `parseExpression()` — three **local
   functions**, each responsible for one grammar level: a number, a
   multiplication/division chain of numbers, and an addition/subtraction
   chain of terms. Each calls the one below it before doing its own job —
   this is **recursive descent**: the grammar's structure directly becomes
   the call structure.
5. `expression.substring(start, position).toDouble()` — (hard concept
   reappearing) `substring` from Java's own `String` API, `.toDouble()` a
   Kotlin standard-library conversion, the direct equivalent of Java's
   `Double.parseDouble(...)`.

### Execution trace

```
evaluate("7+3×2")
parseExpression → parseTerm → parseNumber consumes "7", position 0→1, returns 7.0
  peek() = '+' → not '×'/'÷' → parseTerm returns 7.0 unchanged
parseExpression sees peek() = '+' → position 1→2, rhs = parseTerm()
  parseTerm → parseNumber consumes "3", position 2→3, returns 3.0
  peek() = '×' → position 3→4, rhs2 = parseNumber() consumes "2", position 4→5, returns 2.0
  result = 3.0 × 2.0 = 6.0 → parseTerm returns 6.0
parseExpression: result = 7.0 + 6.0 = 13.0
peek() = null → loop ends → returns 13.0
```

### CS Lens

This is **recursive descent parsing**, the same pipeline shape named
directly in this repo's OpenMAT project (`Text → Lexer → Parser → AST →
Evaluate`) — here compressed to skip separate tokenizing and AST-building
stages, since `parseNumber`/`parseTerm`/`parseExpression` read characters
and compute a result in the same pass. Each function represents one level
of the expression grammar, and calling a lower-precedence function only
*after* consuming everything at a higher precedence is exactly how
precedence gets enforced without an explicit precedence table.

Also recognized in: every real calculator and every full programming
language's parser (including this same author's OpenMAT project, JSON
parsers, and SQL parsers) — recursive descent is one of the most common
hand-written parsing techniques that exists.

### SE Lens

The real cut made here versus a "proper" parser: no separate token stream,
no AST, no parentheses support. That's an honest, deliberate scope
reduction for a calculator whose grammar is genuinely this simple — building
a full tokenizer/AST pipeline for four operators and numbers would be
over-engineering for what this app needs today. The cost: adding
parentheses later means revisiting `parseFactor` (currently just
`parseNumber`, not shown as its own function since it does nothing extra
yet) to also recognize `(`, recursively calling back into
`parseExpression` — a real, bounded piece of future work, not a rewrite.

### Connection

Lesson 7 wraps this exact `evaluate` call in error handling — nothing in
`Evaluator.kt` itself changes, only how `onButtonPressed` reacts to what it
returns.

---

## Closing

### Connect the pieces

`expression` (Lesson 5) is now handed to `evaluate` (this lesson) the
moment `"="` is pressed. `evaluate`'s three nested local functions consume
the string left to right, `parseTerm` binding `×`/`÷` tighter than
`parseExpression`'s `+`/`−` purely through which function calls which —
correctly turning `"7+3×2"` into `13.0`, verified with real output above.

### What breaks without this

Swap `parseTerm`'s and `parseExpression`'s roles — have `parseExpression`
call `parseNumber` directly and `parseTerm` call `parseExpression` — and
re-run `evaluate("7+3×2")`. Real, observable failure: it returns `20.0`
(computing `(7+3)×2` instead of `7+(3×2)`) — the exact precedence bug this
lesson's function-call order exists to prevent. Restore the original
nesting and it returns `13.0` again.

### Exercises

- Trace `evaluate("2×3+4×5")` by hand using the Execution Trace format
  above, then run it for real and confirm your trace matches.
- Add a fourth level, `parsePower`, for a `^` exponent operator, called from
  inside `parseNumber` — decide, and justify, whether `^` should bind
  tighter or looser than `×`/`÷` before writing the code.

### Definition of done

- [ ] `evaluate` correctly computes `7+3×2` as `13.0`, verified by running
      it yourself.
- [ ] `"="` in the real app shows a correct computed result, respecting
      precedence.
- [ ] You can explain, in your own words, why `parseTerm` is called from
      inside `parseExpression` and not the reverse.
- [ ] Commit: `git commit -m "Add a recursive-descent evaluator — = now computes a real, precedence-correct result"`.
