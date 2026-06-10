# Calculator — Lesson 07 — Full Expressions

## What You Will Build

`2 + 3 * 4` evaluates to `14`. `(2 + 3) * 4` evaluates to `20`. `2 ^ 3 ^ 2`
evaluates to `512` — right-associative exponentiation. `-5 + 3` evaluates to `-2`.
The simple string-splitting evaluator from lesson 04 is replaced by a lexer and a
recursive descent parser. Nothing in `main.ts` or `input-reducer.ts` changes beyond
two import lines.

## What You Need to Know First

Lessons 01–06. Specifically: the simple evaluator from lesson 04, which the new
parser replaces. The evaluation interface — `string → number | CalcError` — is
unchanged. The implementation is entirely new.

---

## The Problem

The lesson 04 evaluator works by scanning a string for operator characters and
splitting at the last one found. This approach fails for parentheses: given
`(2 + 3) * 4`, scanning for `+` finds a `+` inside the parentheses and splits
there, giving `(2` as the left operand. `Number('(2')` is `NaN`.

The string splitter has no concept of grouped sub-expressions. It cannot handle
parentheses, because parentheses are about *nesting* — one expression inside
another — and nesting is inherently recursive. A recursive structure requires a
recursive algorithm.

The solution is a **recursive descent parser**: a collection of functions, one per
grammar rule, each calling the others according to the grammar's recursive structure.
This is the technique used to build compilers, interpreters, linters, and language
servers. Building one here makes the technique concrete rather than abstract.

---

## Step 1 — The Grammar

Before writing a single line of code, write the grammar. A **grammar** is a formal
description of every valid expression in the language. The parser implements the
grammar. If the parser and the grammar disagree, the grammar wins — fix the parser.

The grammar is written in **BNF notation** (Backus-Naur Form — named after John
Backus and Peter Naur who formalised it in the early 1960s):

```
expression     := additive
additive       := multiplicative ( ('+' | '-') multiplicative )*
multiplicative := power          ( ('*' | '/') power          )*
power          := unary          ( '^' unary                  )*
unary          := '-' unary | primary
primary        := NUMBER | '(' expression ')'
```

**CS lens — reading a grammar:**
Each line is a **production rule** — a definition of one grammatical form.
`:=` means "is defined as." `|` means "or." `( ... )*` means "zero or more
repetitions."

`additive := multiplicative ( ('+' | '-') multiplicative )*` reads:
"An additive expression is a multiplicative expression, followed by zero or more
pairs of (a `+` or `-` operator and another multiplicative expression)."

**Operator precedence is encoded in the hierarchy:**
Rules that appear *lower* in the hierarchy bind *more tightly*. `power` is defined
in terms of `unary`; `multiplicative` is defined in terms of `power`; `additive`
is defined in terms of `multiplicative`. Each lower rule handles more tightly-binding
operations. This is why `2 + 3 * 4` means `2 + (3 * 4)` = `14`, not `(2 + 3) * 4` = `20`.

**Associativity is encoded in the structure:**
`additive` and `multiplicative` use `( ... )*` — zero or more repetitions, processed
left to right. This gives **left associativity**: `10 - 3 - 2 = (10 - 3) - 2 = 5`.
`power` uses `'^' unary` on the right, which can itself be a `power` — recursion
on the right side gives **right associativity**: `2 ^ 3 ^ 2 = 2 ^ (3 ^ 2) = 512`.

**SE lens — grammar as specification:**
The grammar is written first because it is the specification the parser must
implement. When a test fails — `2 ^ 3 ^ 2` produces `64` instead of `512` — the
first question is: does the grammar say right-associative? If yes, the parser has
a bug. If the grammar said left-associative, both the grammar and the parser would
need fixing. The specification is always the authority.

---

## Step 2 — The Lexer

### The problem

The parser should not read character by character. Characters have no meaning on
their own: the string `42` is one thing (the number forty-two), not the character
`4` followed by the character `2`. Separating the input into **tokens** — named
units of meaning — is the job of the **lexer** (also called the tokeniser).

Each stage has exactly one job: the lexer converts characters to tokens, and the
parser converts tokens to values. A bug in number parsing is in the lexer. A bug
in operator precedence is in the parser. The stages are separate and independently
testable.

### The code

Create `src/expression-lexer.ts`:

```typescript
export type ExprToken =
  | { type: 'NUMBER';  value: number }
  | { type: 'PLUS'                   }
  | { type: 'MINUS'                  }
  | { type: 'MULTIPLY'               }
  | { type: 'DIVIDE'                 }
  | { type: 'POWER'                  }
  | { type: 'LPAREN'                 }
  | { type: 'RPAREN'                 }
  | { type: 'EOF'                    }
```

**What `src/expression-lexer.ts` is:**
`expression-lexer.ts` owns the tokenisation step. It reads a string of characters
and produces a flat array of tokens. It does not understand operator precedence,
grammar rules, or evaluation. A bug in how `42.5` is tokenised belongs here. A
bug in how `2 + 3 * 4` is evaluated never belongs here.

**Discriminated union — first appearance:**
`ExprToken` is a **discriminated union** (also called a **tagged union** or
**sum type**). It is a union type where every variant has a shared `type` field
whose value is a unique string literal. TypeScript uses the `type` field as a
**discriminator** to narrow the type inside conditionals:

```typescript
const token: ExprToken = { type: 'NUMBER', value: 42 }

if (token.type === 'NUMBER') {
  console.log(token.value)  // TypeScript knows .value exists here
}
if (token.type === 'PLUS') {
  // TypeScript knows .value does NOT exist here — compile error to access it
}
```

The discriminated union is the correct way to represent "one of several different
object shapes." It replaces a base class + subclasses (more boilerplate) and raw
`any` (no safety).

**`EOF` token:**
`EOF` stands for "end of file" — a sentinel token appended after all real tokens.
Its purpose: the parser knows it has consumed the entire input when it reads `EOF`.
Without it, the parser would read past the end of the array, getting `undefined`,
which could cause confusing errors far from the real cause.

```typescript
export function tokeniseExpression(source: string): ExprToken[] {
  const tokenList: ExprToken[] = []
  let currentPosition = 0

  while (currentPosition < source.length) {
    const currentChar = source[currentPosition]!

    if (currentChar === ' ') {
      currentPosition++
      continue
    }

    if (
      (currentChar >= '0' && currentChar <= '9') ||
       currentChar === '.'
    ) {
      let numberString = ''
      while (
        currentPosition < source.length &&
        ((source[currentPosition]! >= '0' &&
          source[currentPosition]! <= '9') ||
          source[currentPosition] === '.')
      ) {
        numberString += source[currentPosition]
        currentPosition++
      }
      tokenList.push({ type: 'NUMBER', value: parseFloat(numberString) })
      continue
    }

    switch (currentChar) {
      case '+': tokenList.push({ type: 'PLUS'     }); break
      case '-': tokenList.push({ type: 'MINUS'    }); break
      case '*': tokenList.push({ type: 'MULTIPLY' }); break
      case '/': tokenList.push({ type: 'DIVIDE'   }); break
      case '^': tokenList.push({ type: 'POWER'    }); break
      case '(': tokenList.push({ type: 'LPAREN'   }); break
      case ')': tokenList.push({ type: 'RPAREN'   }); break
      default:
        throw new Error(`Unexpected character: '${currentChar}'`)
    }
    currentPosition++
  }

  tokenList.push({ type: 'EOF' })
  return tokenList
}
```

**`!` non-null assertion — `source[currentPosition]!`:**
`source[currentPosition]` has type `string | undefined` because TypeScript cannot
guarantee index access is in-bounds. The `!` suffix is a **non-null assertion** —
it tells TypeScript "I know this is not null or undefined." Here it is safe: the
`while (currentPosition < source.length)` condition guarantees the index is valid.
The `!` suppresses the TypeScript error without a runtime check. It should only be
used when you can verify the assertion by inspecting the surrounding code.

**`while` loop — first appearance:**
`while (condition)` repeats the loop body as long as `condition` is `true`. Unlike
the C-style `for` loop (lesson 04), there is no initialiser or increment built in —
the counter is managed manually. The inner `while` loop accumulates digits: it runs
as long as the current character is a digit or `.`, then stops when a non-digit is
found. The outer `while` loop processes tokens until the end of the string.

**`continue` — first appearance:**
`continue` skips the rest of the current loop iteration and jumps to the next
iteration. In the space-handling branch: `currentPosition++; continue` increments
past the space and immediately starts the next iteration without falling through to
the `switch`. In the number branch: after pushing the token, `continue` starts
the next iteration without executing `currentPosition++` again (the number loop
already advanced `currentPosition`).

**`throw` — first appearance:**
`throw expression` terminates the current function and propagates an error up the
call stack. If no `try/catch` block catches the error, it terminates the program
(or, in a browser, prints an uncaught error to the console). The lexer throws when
it encounters a character it cannot recognise — this is a hard error, not a
recoverable one. The caller (the parser) wraps the lexer call in `try/catch` to
convert the thrown error into a `CalcError`.

**Security — what `throw` means for user-supplied input:**
The lexer throws on unrecognised characters. This means `fetch`, `document.cookie`,
`<script>`, and any other JavaScript expression typed into the calculator will cause
the lexer to throw on the first non-arithmetic character (`f`, `<`, `'`, etc.)
before any evaluation happens. The error is caught by the parser's `try/catch` and
converted to a `CalcError`. No user-supplied string can escape the arithmetic
grammar. This is the correct behaviour.

### Walkthrough — tokenising `42 + 5`

`currentPosition = 0`. `source = '42 + 5'`.

**Character `'4'` (index 0):** Not a space. Range check: `'4' >= '0'` ✓. Enter
number loop. `numberString` accumulates: `'4'`, then `'2'`. Next character is
`' '` — space, not digit or `.` — exit number loop. `currentPosition = 2`.
Push `{ type: 'NUMBER', value: 42 }`. `continue`.

**Character `' '` (index 2):** Space. Increment to `3`. `continue`.

**Character `'+'` (index 3):** Switch matches `'+'`. Push `{ type: 'PLUS' }`.
Increment to `4`.

**Character `' '` (index 4):** Space. Increment to `5`. `continue`.

**Character `'5'` (index 5):** Digit. Number loop: `numberString = '5'`.
`currentPosition = 6`. `6 >= 6` (past end) → exit loop. Push `{ type: 'NUMBER', value: 5 }`. `continue`.

End of string. Push `{ type: 'EOF' }`.

Result: `[ NUMBER(42), PLUS, NUMBER(5), EOF ]` ✓

---

## Step 3 — The Recursive Descent Parser

### The problem

The lexer produces a flat array of tokens. The parser must consume that array,
recognise the grammar rules, and compute the result. For a calculator this small,
parsing and evaluation are combined: each parse function both recognises its grammar
rule and returns the numeric value. This is a **recursive descent evaluator**.

### The code

Create `src/expression-parser.ts`:

```typescript
import { tokeniseExpression, ExprToken } from './expression-lexer.js'
import { CalcError, makeError, isCalcError } from './calc-error.js'
```

**Import explanation:**
`import { tokeniseExpression, ExprToken } from './expression-lexer.js'` —
`expression-lexer.ts` is the module responsible for tokenisation (this lesson).
We import `tokeniseExpression` — the function that converts a source string into
a token array — because the parser calls it as its first step. We also import
`ExprToken` — the union type of all possible tokens — because the functions inside
the parser use it in comparisons like `token.type === 'NUMBER'`.

`import { CalcError, makeError, isCalcError } from './calc-error.js'` —
`calc-error.ts` is the module responsible for the error type (lesson 04). We import
three things: `CalcError` (the type, for function return type annotations),
`makeError` (the constructor, for creating error values when the parser fails),
and `isCalcError` (the type guard, for distinguishing number results from errors
in the parser's recursive calls).

```typescript
export type ParseResult = number | CalcError

export function parseExpression(source: string): ParseResult {
  let tokens: ExprToken[]
  try {
    tokens = tokeniseExpression(source)
  } catch (lexerError) {
    return makeError('INVALID_EXPRESSION', String(lexerError))
  }

  if (tokens.length === 1 && tokens[0]?.type === 'EOF') {
    return makeError('INVALID_EXPRESSION', 'Empty expression')
  }

  let currentPosition = 0

  function peek(): ExprToken {
    return tokens[currentPosition] ?? { type: 'EOF' }
  }

  function consume(): ExprToken {
    const token = tokens[currentPosition] ?? { type: 'EOF' }
    currentPosition++
    return token
  }

  function parseAdditive(): ParseResult {
    let leftValue = parseMultiplicative()
    if (isCalcError(leftValue)) return leftValue

    while (
      peek().type === 'PLUS' ||
      peek().type === 'MINUS'
    ) {
      const operatorToken = consume()
      const rightValue    = parseMultiplicative()
      if (isCalcError(rightValue)) return rightValue

      leftValue = operatorToken.type === 'PLUS'
        ? leftValue + rightValue
        : leftValue - rightValue
    }
    return leftValue
  }

  function parseMultiplicative(): ParseResult {
    let leftValue = parsePower()
    if (isCalcError(leftValue)) return leftValue

    while (
      peek().type === 'MULTIPLY' ||
      peek().type === 'DIVIDE'
    ) {
      const operatorToken = consume()
      const rightValue    = parsePower()
      if (isCalcError(rightValue)) return rightValue

      if (operatorToken.type === 'DIVIDE') {
        if (rightValue === 0) {
          return makeError('DIVISION_BY_ZERO', 'Division by zero')
        }
        leftValue = leftValue / rightValue
      } else {
        leftValue = leftValue * rightValue
      }
    }
    return leftValue
  }

  function parsePower(): ParseResult {
    const baseValue = parseUnary()
    if (isCalcError(baseValue)) return baseValue

    if (peek().type !== 'POWER') return baseValue

    consume()  // consume '^'
    const exponentValue = parsePower()  // right-recursive: builds right-to-left
    if (isCalcError(exponentValue)) return exponentValue

    return Math.pow(baseValue, exponentValue)
  }

  function parseUnary(): ParseResult {
    if (peek().type === 'MINUS') {
      consume()
      const operandValue = parseUnary()
      if (isCalcError(operandValue)) return operandValue
      return -operandValue
    }
    return parsePrimary()
  }

  function parsePrimary(): ParseResult {
    const currentToken = peek()

    if (currentToken.type === 'NUMBER') {
      consume()
      return currentToken.value
    }

    if (currentToken.type === 'LPAREN') {
      consume()  // consume '('
      const innerValue = parseAdditive()
      if (isCalcError(innerValue)) return innerValue

      if (peek().type !== 'RPAREN') {
        return makeError('INVALID_EXPRESSION', 'Missing closing parenthesis')
      }
      consume()  // consume ')'
      return innerValue
    }

    return makeError(
      'INVALID_EXPRESSION',
      `Unexpected token: ${currentToken.type}`,
    )
  }

  const finalResult = parseAdditive()
  if (isCalcError(finalResult)) return finalResult

  if (peek().type !== 'EOF') {
    return makeError(
      'INVALID_EXPRESSION',
      'Unexpected input after expression',
    )
  }

  return finalResult
}
```

**What `src/expression-parser.ts` is:**
`expression-parser.ts` owns the full expression evaluation engine. It calls
`tokeniseExpression` and consumes the resulting token array according to the grammar.
It replaces `evaluator.ts` from lesson 04 as the single entry point for evaluating
expressions. After this lesson, `evaluator.ts` is no longer used.

**Closures — `peek` and `consume` — first appearance:**
`peek` and `consume` are functions defined *inside* `parseExpression`. They **close
over** `tokens` and `currentPosition` — variables from the enclosing function scope.
A function that captures variables from its enclosing scope is called a **closure**.

`peek()` reads `tokens[currentPosition]` without advancing `currentPosition`.
`consume()` reads `tokens[currentPosition]` and then increments `currentPosition`.

Together they implement a **stateful token stream**: the parser reads the next token
with `peek()` to decide what to do, then calls `consume()` when it is ready to move
past that token. The `currentPosition` counter advances as the parser works through
the token array.

Closures appear throughout JavaScript and TypeScript: event handlers capture the
DOM element they were set up for, callback functions capture the variables in scope
when they were created. This is not a special feature — it is how function scope
works in JavaScript.

**`??` — nullish coalescing — first appearance:**
`tokens[currentPosition] ?? { type: 'EOF' }` uses the **nullish coalescing operator**.
If `tokens[currentPosition]` is `null` or `undefined`, the expression evaluates to
the right side (`{ type: 'EOF' }`). If it is any other value — including `0`, `''`,
or `false` — it returns that value unchanged.

This is different from `||` (logical OR): `0 || fallback` returns `fallback` because
`0` is falsy. `0 ?? fallback` returns `0` because `0` is not null or undefined. The
`??` operator is correct when you only want to substitute on `null` and `undefined`,
not on all falsy values.

**`try/catch` — first appearance:**
`try { tokens = tokeniseExpression(source) } catch (lexerError) { ... }` wraps the
lexer call. `tokeniseExpression` throws when it encounters an unrecognised character.
The `try` block runs the enclosed code. If the code throws, execution jumps to the
`catch` block with the thrown value as `lexerError`. Without this wrapping, a user
typing `@` into the calculator would produce an uncaught exception — the event handler
would stop, the display would not update, and the user would have no idea what went wrong.

With `try/catch`, the thrown error is caught and converted to a `CalcError` using
`makeError`. The display shows `Error: Unexpected character: '@'`. The user sees
the mistake.

`String(lexerError)` converts the caught value to a string. JavaScript's `catch`
clause receives whatever was thrown — it could be an `Error` object, a string, a
number, or anything. Calling `String()` safely handles all cases. If `lexerError`
is `new Error("bad char")`, `String(new Error("bad char"))` = `"Error: bad char"`.

**`Math.pow` — first appearance:**
`Math.pow(base, exponent)` raises `base` to the power `exponent`.
`Math.pow(2, 10)` = `1024`. `Math.pow(4, 0.5)` = `2` (square root). Modern
JavaScript also has the `**` operator: `2 ** 10 === 1024`. Both are equivalent;
`Math.pow` is used here because the operands are variables, making the intent clearer.

### Walkthrough — parsing `(2 + 3) * 4`

Tokens: `[ LPAREN, NUMBER(2), PLUS, NUMBER(3), RPAREN, MULTIPLY, NUMBER(4), EOF ]`

`parseExpression` calls `parseAdditive`.

`parseAdditive` calls `parseMultiplicative`.
`parseMultiplicative` calls `parsePower`.
`parsePower` calls `parseUnary`.
`parseUnary` → peek is `LPAREN`, not `MINUS` → calls `parsePrimary`.

**`parsePrimary` encounters `LPAREN`:**
Consume `(`. Call `parseAdditive()` recursively.

*Inner `parseAdditive`:*
`parseMultiplicative` → `parsePower` → `parseUnary` → `parsePrimary`:
peek is `NUMBER(2)` → consume → return `2`.
Back in inner `parseAdditive`: peek is `PLUS` → consume → call `parseMultiplicative`.
That call returns `3`. `leftValue = 2 + 3 = 5`.
Peek is `RPAREN` — not `PLUS` or `MINUS` → return `5`.

Back in outer `parsePrimary`: innerValue = `5`. Peek is `RPAREN` → consume `)`.
Return `5`.

Back in outer `parseMultiplicative`: `leftValue = 5`. Peek is `MULTIPLY` → consume
→ call `parsePower` → ... → `parsePrimary` sees `NUMBER(4)` → returns `4`.
`leftValue = 5 * 4 = 20`. Peek is `EOF` → return `20`.

Back in outer `parseAdditive`: peek is `EOF` → return `20`. Final result: `20`. ✓

### Walkthrough — right-associativity of `2 ^ 3 ^ 2`

Tokens: `[ NUMBER(2), POWER, NUMBER(3), POWER, NUMBER(2), EOF ]`

`parsePower` is called. `parseUnary` → `parsePrimary` → consume `NUMBER(2)` → `baseValue = 2`.
Peek is `POWER` → consume `^`.
Call `parsePower()` recursively (right side of `^`):

*Recursive `parsePower`:*
`baseValue = 3` (from `NUMBER(3)`).
Peek is `POWER` → consume `^`.
Call `parsePower()` recursively again:

*Second recursive `parsePower`:*
`baseValue = 2` (from `NUMBER(2)`).
Peek is `EOF` — not `POWER` → return `2`.

`Math.pow(3, 2) = 9`. Return `9`.

Back in outer `parsePower`:
`Math.pow(2, 9) = 512`. Return `512`. ✓

The recursive call on the right side naturally creates right-to-left evaluation:
`2 ^ (3 ^ 2)`. A left-to-right loop would produce `(2 ^ 3) ^ 2 = 64` — wrong.
Only recursion on the right side expresses right-associativity directly.

**CS lens — the call stack mirrors the expression tree:**
During the parsing of `(2 + 3) * 4`, the call stack at the deepest point is:
```
parseExpression
  parseAdditive
    parseMultiplicative
      parsePower
        parseUnary
          parsePrimary
            parseAdditive   ← recursion for (...)
              parseMultiplicative
                parsePrimary
```

The call stack is a **parse tree** — the tree representation of the expression's
structure. Every compiler builds an explicit parse tree (the AST — abstract syntax
tree) before evaluation. This recursive descent evaluator builds the tree implicitly
in the call stack. The recursion handles nesting of arbitrary depth with no special
cases, no depth limit, and no stack manipulation.

This technique — recursive descent parsing — is used in production compilers and
interpreters: GCC (the C/C++ compiler), V8 (Chrome's JavaScript engine), the TypeScript
compiler, and Clang all use recursive descent parsers. The structure of the grammar
functions in this lesson is identical to those production parsers; the scale differs.

**SE lens — replace, don't patch:**
`parseExpression` has the same signature as `evaluate` from lesson 04: takes a
`string`, returns `number | CalcError`. Swapping the implementation requires
changing exactly two lines in `input-reducer.ts`. Everything else is unchanged.

This clean swap was possible because lesson 04 chose a stable interface and hid the
implementation. Callers depended on the contract (`string → number | CalcError`),
not the implementation (string splitting). When a better implementation was ready,
it replaced the old one without disturbing any caller. This is the **open/closed
principle**: the input reducer is closed for modification (its logic is unchanged);
the evaluation engine was open for substitution.

---

## Step 4 — Tests

Create `src/expression-parser.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { parseExpression }        from './expression-parser.js'
import { isCalcError }            from './calc-error.js'
```

**Import explanation:**
`import { parseExpression } from './expression-parser.js'` — `expression-parser.ts`
is the evaluation engine (this lesson). We import `parseExpression` — the single
exported function — because that is the function under test.

`import { isCalcError } from './calc-error.js'` — `calc-error.ts` owns the error
type (lesson 04). We import `isCalcError` — the type guard function — because the
error tests use it to verify that a result is a `CalcError` rather than a number.
Without `isCalcError`, the tests would need to access error fields directly, which
requires a cast.

```typescript
describe('parseExpression', () => {
  test('addition before multiplication without parens: 2+3*4=14', () => {
    expect(parseExpression('2 + 3 * 4')).toBe(14)
  })

  test('parentheses override precedence: (2+3)*4=20', () => {
    expect(parseExpression('(2 + 3) * 4')).toBe(20)
  })

  test('exponentiation is right-associative: 2^3^2=512', () => {
    expect(parseExpression('2 ^ 3 ^ 2')).toBe(512)
  })

  test('unary minus: -5 + 3 = -2', () => {
    expect(parseExpression('-5 + 3')).toBe(-2)
  })

  test('double unary minus: --5 = 5', () => {
    expect(parseExpression('--5')).toBe(5)
  })

  test('nested parentheses: ((2+3)) = 5', () => {
    expect(parseExpression('((2 + 3))')).toBe(5)
  })

  test('mismatched parentheses → CalcError', () => {
    const result = parseExpression('(2 + 3')
    expect(isCalcError(result)).toBe(true)
  })

  test('division by zero → CalcError', () => {
    const result = parseExpression('10 / 0')
    expect(isCalcError(result)).toBe(true)
  })

  test('empty expression → CalcError', () => {
    const result = parseExpression('')
    expect(isCalcError(result)).toBe(true)
  })

  test('unexpected character → CalcError', () => {
    const result = parseExpression('2 @ 3')
    expect(isCalcError(result)).toBe(true)
  })
})
```

Run `npm test`. All ten tests pass.

**The right-associativity test is the critical one:**
`parseExpression('2 ^ 3 ^ 2')` must return `512`, not `64`. If it returns `64`,
`parsePower` is iterating left-to-right (loop) rather than recursing right. Check
that `parsePower` calls itself recursively on the right operand of `^`, not using
a `while` loop.

**Reading a test failure:**
If the mismatched-parens test fails — `isCalcError(result)` is `false` — then
`parsePrimary` is not returning a `CalcError` when `RPAREN` is not found. Check that
the `if (peek().type !== 'RPAREN')` check is inside `parsePrimary` at the correct
location, after the inner `parseAdditive()` call returns.

---

## Step 5 — Update the Reducer

In `src/input-reducer.ts`, replace the import and function call:

```typescript
// Remove:
import { evaluate } from './evaluator.js'

// Add:
import { parseExpression } from './expression-parser.js'
```

In `applyEquals`, change:
```typescript
// From:
const evaluationResult = evaluate(state.displayValue)

// To:
const evaluationResult = parseExpression(state.displayValue)
```

That is the entire change. Two lines in one file. No change to `main.ts`. No change
to `calculator-state.ts`. No change to the HTML or CSS.

Run `npm test`. All tests from lessons 04–06 still pass — the interface is unchanged.
Open the browser. `(2 + 3) * 4 =` shows `20`. `2 ^ 3 ^ 2 =` shows `512`.

**`evaluator.ts` from lesson 04 can be deleted** — it is fully superseded. Its test
file (`evaluator.test.ts`) can be kept as historical documentation of the interface
that `parseExpression` now satisfies.

---

## Debugging: When the Parser Produces Wrong Results

The parser introduces a new category of bugs: precedence errors and associativity
errors. Here is how to locate them.

**Symptom: `2 + 3 * 4` returns `20` instead of `14`**

Multiplication is not binding tighter than addition. In `parseAdditive`, the right
operand should be `parseMultiplicative()`, not `parseAdditive()` or `parsePrimary()`.
Check that the call hierarchy matches the grammar: `parseAdditive` calls
`parseMultiplicative`, `parseMultiplicative` calls `parsePower`, etc.

**Symptom: `2 ^ 3 ^ 2` returns `64` instead of `512`**

`parsePower` is left-associative (loop) instead of right-associative (recursion).
Check that `parsePower` calls itself recursively for the exponent:
```typescript
const exponentValue = parsePower()  // recursive call → right-associative
```
If it uses a `while` loop like `parseAdditive` and `parseMultiplicative`, change it
to this single recursive call.

**Symptom: `(2 + 3` raises no error — parser hangs or returns garbage**

The `if (peek().type !== 'RPAREN')` check in `parsePrimary` is missing or positioned
incorrectly. Add a temporary log at the end of `parsePrimary`:

```typescript
console.log('parsePrimary returning, peek:', peek().type)
```

If the peek is not `RPAREN` and no error is returned, the check is absent.

**Symptom: unexpected-character input does not display an error**

The lexer's `throw` is not caught. Check that `tokeniseExpression(source)` is
wrapped in `try { ... } catch { ... }` inside `parseExpression`. If the try/catch
is missing, the throw propagates out of the click handler, the display is not updated,
and the user sees no feedback.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`parseExpression` is the evaluation engine for the entire remainder of the project.
Lesson 08 (variables) extends the lexer to add `IDENTIFIER` and `EQUALS` tokens and
extends the parser to look up names in an environment. Lesson 09 (built-in functions)
extends the parser to handle `name(argument)` syntax. Lesson 10 (user functions)
adds user-defined functions as a second lookup. Each extension adds to the lexer and
parser without changing the core grammar or the existing parse functions.

The grammar written in step 1 grows with each lesson. Lessons 08–10 each add one or
two new grammar rules. The grammar document is always updated first — then the lexer
— then the parser. Reading the grammar tells you what the parser must do before
reading a single line of parser code.

---

## What Breaks Without This

**The string-splitting evaluator cannot handle parentheses:**
Given `(2 + 3) * 4`, the old `splitOnOperator` finds `+` inside the parentheses and
splits there, producing `'(2'` as the left operand. `Number('(2')` = `NaN`. The
display shows `NaN`. The parser handles parentheses naturally: `parsePrimary`
recognises `LPAREN`, calls `parseAdditive` recursively, and returns the inner result
when `RPAREN` is found.

**Right-associativity requires recursion, not a loop:**
`2 ^ 3 ^ 2` with a left-to-right loop: `temp = 2 ^ 3 = 8`, then `8 ^ 2 = 64` — wrong.
With right-recursion in `parsePower`: `exponent = parsePower()` computes `3 ^ 2 = 9`
first, then `Math.pow(2, 9) = 512` — correct. Only the recursive structure expresses
"evaluate the right side completely before applying the operator."

**Without `try/catch` around the lexer:**
A user types `2 @ 3`. The lexer throws `Error: Unexpected character: '@'`. The throw
propagates out of `parseExpression`, out of `applyEquals`, out of the button click
handler. The browser catches it as an uncaught exception. The display does not update.
The user sees nothing happen — not even an error message. With `try/catch`, the throw
is caught, converted to a `CalcError`, and `Error: Unexpected character: '@'` is shown
on the display.

---

## Definition of Done

- [ ] `2 + 3 * 4 =` → `14`
- [ ] `(2 + 3) * 4 =` → `20`
- [ ] `2 ^ 3 ^ 2 =` → `512` (right-associative)
- [ ] `-5 + 3 =` → `-2` (unary minus)
- [ ] Mismatched parentheses → error message on the display
- [ ] Unexpected character (e.g., `2 @ 3`) → error message on the display
- [ ] `npm test` passes all ten tests in `expression-parser.test.ts`
- [ ] All tests from lessons 04–06 still pass
- [ ] The change to `input-reducer.ts` is exactly two lines
- [ ] `eval()` is not used anywhere in the project
- [ ] You can read the grammar and explain what each rule means
- [ ] You can explain what a discriminated union is and name the discriminator field
      in `ExprToken`
- [ ] You can explain what a closure is and how `peek` and `consume` close over
      `tokens` and `currentPosition`
- [ ] You can explain the `??` operator and how it differs from `||`
- [ ] You can explain `try/catch` and why it is needed around `tokeniseExpression`
- [ ] You can explain the `!` non-null assertion and when it is safe
- [ ] You can trace `(2 + 3) * 4` through the parser call stack step by step
- [ ] You can explain why right-associativity requires recursion in `parsePower`
      and not a loop
- [ ] You can explain the security property of the parser: why user input cannot
      execute arbitrary code
- [ ] Run:
      ```
      git add src/expression-lexer.ts src/expression-parser.ts src/expression-parser.test.ts src/input-reducer.ts
      git commit -m "Replace string-splitting evaluator with recursive descent parser: parentheses, exponentiation, and unary minus now work; grammar precedes implementation"
      ```

---

*Next: Lesson 08 — Variables. `A = 42` stores a value. `A + 8` returns `50`. `pi`
and `e` are pre-defined. The symbol table is introduced — the standard data
structure for name-to-value binding used by every language runtime ever written.*
