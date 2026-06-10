# Lesson 07 — Full Expressions

## What You Will Build

`2 + 3 * 4` evaluates to `14`. `(2 + 3) * 4` evaluates to `20`. Parentheses work.
Unary minus works. The simple evaluator from lesson 04 is replaced by a full
recursive descent parser and evaluator.

## What You Need to Know First

Lessons 01–06. Specifically: the evaluator in lesson 04 and the parser pattern
from the OpenMAT project. The architecture here is the same — lexer, parser,
evaluator — but applied to a simpler grammar.

---

## The Lesson

### The problem

The lesson 04 evaluator works for simple expressions but fails with parentheses:
`(2 + 3) * 4` is parsed as a string split operation, not a grouped expression.
The string-splitting approach cannot handle nested grouping. A proper parser can.

The solution is a recursive descent parser — the same architecture used in
OpenMAT. The parser reads tokens, builds an AST, and the evaluator walks the
tree. The grammar is small because the calculator only handles arithmetic.

---

### Step 1 — The grammar

The calculator expression grammar, written in BNF notation:

```
expression  := additive
additive    := multiplicative ( ('+' | '-') multiplicative )*
multiplicative := power ( ('*' | '/') power )*
power       := unary ('^' unary)*
unary       := '-' unary | primary
primary     := NUMBER | '(' expression ')'
```

**CS lens — formal grammar:**
A grammar is a precise description of what strings are valid in a language.
Each rule defines one level of the expression hierarchy. `additive` handles
`+` and `-`. `multiplicative` handles `*` and `/`. `power` handles `^`. `unary`
handles leading minus. `primary` handles numbers and parenthesised expressions.

The grammar encodes operator precedence directly: rules lower in the hierarchy
bind more tightly. `multiplicative` is below `additive`, so `*` binds tighter
than `+`. This is why `3 + 4 * 2` gives `11`, not `14` — the grammar says so.

**SE lens — grammar as documentation:**
The grammar is not just code. It is the specification the parser implements.
If the parser ever behaves unexpectedly, you check the grammar. If the grammar
is wrong, you fix the grammar first, then fix the parser. The grammar is the
single source of truth for what the language allows.

---

### Step 2 — The lexer

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

export function tokeniseExpression(source: string): ExprToken[] {
  const tokens: ExprToken[] = []
  let position = 0

  while (position < source.length) {
    const character = source[position]!

    if (character === ' ') { position++; continue }

    if (character >= '0' && character <= '9' || character === '.') {
      let numberString = ''
      while (
        position < source.length &&
        (source[position]! >= '0' && source[position]! <= '9' || source[position] === '.')
      ) {
        numberString += source[position]
        position++
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numberString) })
      continue
    }

    switch (character) {
      case '+': tokens.push({ type: 'PLUS'     }); break
      case '-': tokens.push({ type: 'MINUS'    }); break
      case '*': tokens.push({ type: 'MULTIPLY' }); break
      case '/': tokens.push({ type: 'DIVIDE'   }); break
      case '^': tokens.push({ type: 'POWER'    }); break
      case '(': tokens.push({ type: 'LPAREN'   }); break
      case ')': tokens.push({ type: 'RPAREN'   }); break
      default:
        throw new Error(`Unexpected character: ${character}`)
    }
    position++
  }

  tokens.push({ type: 'EOF' })
  return tokens
}
```

**CS lens — tokenisation separates concerns:**
The lexer converts raw characters to tokens. The parser never deals with
character-by-character reading. This separation means: a bug in number parsing
is in the lexer. A bug in operator precedence is in the parser. One stage,
one responsibility, one place to look for each class of bug.

---

### Step 3 — The parser and evaluator combined

For a calculator this small, the parser and evaluator can be combined: each
parse function both recognises the grammar rule and returns its numeric value.
This is called a recursive descent evaluator.

Create `src/expression-parser.ts`:

```typescript
import { tokeniseExpression, ExprToken } from './expression-lexer.js'
import { CalcError, makeError }          from './calc-error.js'

export type ParseResult = number | CalcError

export function parseExpression(source: string): ParseResult {
  let tokens: ExprToken[]
  try {
    tokens = tokeniseExpression(source)
  } catch (lexerError) {
    return makeError('INVALID_EXPRESSION', String(lexerError))
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
    if (typeof leftValue === 'object') return leftValue

    while (peek().type === 'PLUS' || peek().type === 'MINUS') {
      const operatorToken = consume()
      const rightValue    = parseMultiplicative()
      if (typeof rightValue === 'object') return rightValue

      leftValue = operatorToken.type === 'PLUS'
        ? leftValue + rightValue
        : leftValue - rightValue
    }
    return leftValue
  }

  function parseMultiplicative(): ParseResult {
    let leftValue = parsePower()
    if (typeof leftValue === 'object') return leftValue

    while (peek().type === 'MULTIPLY' || peek().type === 'DIVIDE') {
      const operatorToken = consume()
      const rightValue    = parsePower()
      if (typeof rightValue === 'object') return rightValue

      if (operatorToken.type === 'DIVIDE') {
        if (rightValue === 0) return makeError('DIVISION_BY_ZERO', 'Division by zero')
        leftValue = leftValue / rightValue
      } else {
        leftValue = leftValue * rightValue
      }
    }
    return leftValue
  }

  function parsePower(): ParseResult {
    const base = parseUnary()
    if (typeof base === 'object') return base

    if (peek().type !== 'POWER') return base

    consume() // consume '^'
    const exponent = parsePower() // right-associative: parse right side as another power
    if (typeof exponent === 'object') return exponent

    return Math.pow(base, exponent)
  }

  function parseUnary(): ParseResult {
    if (peek().type === 'MINUS') {
      consume()
      const operand = parseUnary()
      if (typeof operand === 'object') return operand
      return -operand
    }
    return parsePrimary()
  }

  function parsePrimary(): ParseResult {
    const token = peek()

    if (token.type === 'NUMBER') {
      consume()
      return token.value
    }

    if (token.type === 'LPAREN') {
      consume() // consume '('
      const innerValue = parseAdditive()
      if (typeof innerValue === 'object') return innerValue

      if (peek().type !== 'RPAREN') {
        return makeError('INVALID_EXPRESSION', 'Missing closing parenthesis')
      }
      consume() // consume ')'
      return innerValue
    }

    return makeError('INVALID_EXPRESSION', `Unexpected token: ${token.type}`)
  }

  const result = parseAdditive()
  if (typeof result === 'object') return result

  if (peek().type !== 'EOF') {
    return makeError('INVALID_EXPRESSION', 'Unexpected input after expression')
  }

  return result
}
```

**CS lens — recursive descent:**
Each `parseX` function corresponds to one grammar rule. `parseAdditive` handles
the `additive` rule. It calls `parseMultiplicative` for each operand — because
the grammar says `additive := multiplicative ...`. When `parseMultiplicative`
calls `parsePower`, and `parsePower` calls `parseUnary`, and `parseUnary` calls
`parsePrimary` — the call stack depth mirrors the expression nesting depth.
For `(2 + (3 * 4))`, the stack will be: `parseAdditive → parsePrimary → parseAdditive → parseMultiplicative`.

**SE lens — replace, don't patch:**
The `evaluate` function in lesson 04 is replaced entirely by `parseExpression`.
`input-reducer.ts` changes one import and one function call. Everything else
stays the same. This was possible because `evaluate` had a clear type signature
(`string → number | CalcError`) and no side effects. The interface was stable;
the implementation could be swapped cleanly.

---

### Step 4 — Tests

Create `src/expression-parser.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { parseExpression }        from './expression-parser.js'
import { isCalcError }            from './calc-error.js'

describe('parseExpression', () => {
  test('2 + 3 * 4 = 14 (not 20)', () => {
    expect(parseExpression('2 + 3 * 4')).toBe(14)
  })

  test('(2 + 3) * 4 = 20', () => {
    expect(parseExpression('(2 + 3) * 4')).toBe(20)
  })

  test('2 ^ 3 ^ 2 = 512 (right-associative)', () => {
    expect(parseExpression('2 ^ 3 ^ 2')).toBe(512)
  })

  test('-5 + 3 = -2 (unary minus)', () => {
    expect(parseExpression('-5 + 3')).toBe(-2)
  })

  test('((2 + 3)) = 5 (nested parens)', () => {
    expect(parseExpression('((2 + 3))')).toBe(5)
  })

  test('returns error for mismatched parens', () => {
    const result = parseExpression('(2 + 3')
    expect(isCalcError(result)).toBe(true)
  })

  test('returns error for division by zero', () => {
    const result = parseExpression('10 / 0')
    expect(isCalcError(result)).toBe(true)
  })
})
```

---

### Step 5 — Update the reducer

In `src/input-reducer.ts`, replace the import of `evaluate` with `parseExpression`:

```typescript
import { parseExpression } from './expression-parser.js'

// In applyEquals, replace evaluate(...) with parseExpression(...)
const result = parseExpression(state.displayValue)
```

`npm test` — all tests pass. Open the browser. `2 + 3 * 4 =` shows `14`.
`(2 + 3) * 4 =` shows `20`.

---

## Connect the Pieces

`parseExpression` is now the evaluation engine. Lesson 08 (variables) will need
to extend the lexer to recognise identifiers and extend the parser to look them up
in an environment. Lesson 09 (built-in functions) will extend the parser to
recognise function call syntax like `sin(30)`. Each extension adds a new token
type and a new grammar rule — the structure does not change.

---

## What Breaks Without This

The lesson 04 evaluator fails silently on `(2 + 3) * 4`. It either returns a
wrong answer or throws an unhandled error. The user sees incorrect results and has
no idea why.

More subtly: a string-splitting evaluator cannot handle nested parentheses because
splitting on `+` in `(2 + 3) * (4 + 5)` splits at the wrong place. Recursion
handles nesting naturally because the function calls itself as deeply as the
nesting goes.

---

## Definition of Done

- [ ] `2 + 3 * 4 =` → `14`
- [ ] `(2 + 3) * 4 =` → `20`
- [ ] `2 ^ 3 ^ 2 =` → `512` (right-associative)
- [ ] `-5 + 3 =` → `-2`
- [ ] Mismatched parentheses → error message on the display
- [ ] `npm test` passes all tests in `expression-parser.test.ts`
- [ ] `eval()` is still not used anywhere
