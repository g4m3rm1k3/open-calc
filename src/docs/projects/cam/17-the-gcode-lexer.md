# CAD/CAM — Lesson 17 — The G-code Lexer

## What You Will Build

G-code is tokenised into a list of words. A loaded G-code line like
`N10 G0 X50.0 Y-25.5 Z5.0` becomes tokens:
`[ WORD('N', 10), WORD('G', 0), WORD('X', 50.0), WORD('Y', -25.5), WORD('Z', 5.0) ]`.
The token list is displayed in the G-code panel beside the raw line. Unrecognised
characters produce an error token (not a crash).

## What You Need to Know First

Lessons 01–16. The G-code file is loaded and displayed as raw lines. The calculator
project's lexer (lesson 07 of the calculator) established the lexer pattern —
read characters, accumulate tokens. This lesson applies the same pattern to G-code
syntax.

---

## The Problem

Before G-code can be parsed (understood structurally) or simulated (converted to
3D moves), it must be **tokenised** — divided into meaningful units. The calculator
project built a lexer for arithmetic expressions. G-code has a different but equally
specific syntax, and the same technique applies.

**The connection:**
The calculator lexer (lesson 07) reads characters and produces `ExprToken` objects.
The G-code lexer reads characters and produces `GcodeToken` objects. The architecture
is identical: a stateful scan over the input string, producing a flat array of tokens.
The grammar is different; the implementation pattern is the same.

---

## Step 1 — G-code Syntax

### The word-address format

G-code uses **word-address format**: every value is preceded by a single letter that
identifies what the value is.

```
G0 X50.0 Y-25.5 Z5.0 F300 S1000
```

Each `LETTER + NUMBER` pair is a **word**:
- `G0` — G-code word: code = G, value = 0 (rapid move)
- `X50.0` — axis word: code = X, value = 50.0 mm
- `Y-25.5` — axis word: code = Y, value = -25.5 mm (negative sign is part of the number)
- `F300` — feed rate word: code = F, value = 300 mm/min
- `S1000` — spindle speed word: code = S, value = 1000 RPM

Every word is exactly one letter followed by a number (integer or decimal, with
optional sign). There is no infix arithmetic in base Fanuc G-code — no `X(50+3)`.

### Special characters

- `%` — program start/end delimiter (consumed, not a token)
- `N` followed by digits — line number (token: `WORD('N', number)`)
- `O` followed by digits — program number (token: `WORD('O', number)`)
- `(` ... `)` — comment (consumed, produces no token)
- `;` — comment to end of line (consumed)
- Whitespace — ignored

### G-code letters

The full set of word-address letters:
`A B C D E F G H I J K L M N O P Q R S T U V W X Y Z`

All are single uppercase letters. The lexer accepts any letter — the parser (lesson 18)
validates which letters are valid in which contexts.

---

## Step 2 — G-code Token Types

### Create `src/gcode/lexer.ts`

Create directory `src/gcode/`:

```typescript
export interface GcodeWord {
  type:   'WORD'
  letter: string  // single uppercase letter: 'G', 'X', 'M', etc.
  value:  number
}

export interface GcodeComment {
  type:    'COMMENT'
  content: string
}

export interface GcodeError {
  type:    'ERROR'
  char:    string
  position: number
}

export type GcodeToken = GcodeWord | GcodeComment | GcodeError
```

**What `src/gcode/` is:**
`gcode/` owns all G-code processing: lexer, parser, simulator, and exporter.
It has no knowledge of React, Three.js, or the sketch model. It receives strings,
produces structured data, and returns structured data.

**`GcodeError` token instead of throwing:**
Unlike the calculator lexer which throws on unexpected characters, the G-code lexer
produces an `ERROR` token. G-code files often contain machine-specific extensions and
unusual characters that a general-purpose lexer would not recognise. Producing an
error token instead of crashing allows the lexer to continue past the unknown character
and tokenise the rest of the line — partial output is better than no output.

This is a difference in error philosophy: the calculator lexer was strict (any unknown
character is a hard error) because the grammar is small and well-defined. The G-code
lexer is lenient because the language has many dialects and custom extensions.

---

## Step 3 — The Lexer

```typescript
export function tokeniseGcodeLine(line: string): GcodeToken[] {
  const tokens: GcodeToken[] = []
  let   position = 0

  // Skip empty lines and program delimiters
  const trimmedLine = line.trim()
  if (trimmedLine === '' || trimmedLine === '%') return []

  while (position < line.length) {
    const char = line[position]!

    // Whitespace
    if (char === ' ' || char === '\t') {
      position++
      continue
    }

    // End-of-line comment: ; to end of line
    if (char === ';') break

    // Parenthetical comment: (...)
    if (char === '(') {
      const closeIndex = line.indexOf(')', position + 1)
      if (closeIndex === -1) {
        // Unclosed comment — consume to end of line
        tokens.push({ type: 'COMMENT', content: line.slice(position + 1) })
        break
      }
      tokens.push({ type: 'COMMENT', content: line.slice(position + 1, closeIndex) })
      position = closeIndex + 1
      continue
    }

    // Word: uppercase letter followed by optional sign and number
    if (char >= 'A' && char <= 'Z') {
      const letter = char
      position++

      // Consume optional sign
      let   valueString = ''
      if (position < line.length && (line[position] === '+' || line[position] === '-')) {
        valueString += line[position]!
        position++
      }

      // Consume digits and decimal point
      while (
        position < line.length &&
        ((line[position]! >= '0' && line[position]! <= '9') || line[position] === '.')
      ) {
        valueString += line[position]!
        position++
      }

      if (valueString === '' || valueString === '+' || valueString === '-') {
        tokens.push({ type: 'ERROR', char: letter, position: position - 1 })
        continue
      }

      const parsedValue = parseFloat(valueString)
      if (isNaN(parsedValue)) {
        tokens.push({ type: 'ERROR', char: letter, position: position - 1 })
        continue
      }

      tokens.push({ type: 'WORD', letter, value: parsedValue })
      continue
    }

    // Lowercase letter — normalise to uppercase
    if (char >= 'a' && char <= 'z') {
      // Recurse with uppercased character
      const uppercased = line.slice(0, position) + char.toUpperCase() + line.slice(position + 1)
      return tokeniseGcodeLine(uppercased)
    }

    // Unknown character — error token
    tokens.push({ type: 'ERROR', char, position })
    position++
  }

  return tokens
}
```

**Lowercase normalisation via recursion:**
G-code is case-insensitive — `g0 x50.0` is the same as `G0 X50.0`. Rather than
adding a case check to every branch, the lexer detects a lowercase letter, creates
an uppercased copy of the remaining input, and recurses. This is a clean but subtle
approach — and an example of when recursion produces cleaner code than a conditional
in a loop.

**`string.indexOf(char, startPosition)`:**
`line.indexOf(')', position + 1)` searches for `)` starting from `position + 1` —
after the opening `(`. Returns the index of the first match, or `-1` if not found.
First appearance in this codebase in this context (was introduced in the calculator
lesson 04 for the assignment detection).

**Walkthrough — tokenising `N10 G0 X50.0 Y-25.5`:**

```
position=0: 'N' — uppercase letter
  position=1: '1' — digit
  position=2: '0' — digit
  position=3: ' ' — stop
  valueString = '10', parsedValue = 10
  push WORD('N', 10), position=3

position=3: ' ' — skip, position=4

position=4: 'G' — uppercase letter
  position=5: '0' — digit
  position=6: ' ' — stop
  valueString = '0', parsedValue = 0
  push WORD('G', 0), position=6

position=6: ' ' — skip, position=7

position=7: 'X' — uppercase letter
  position=8: '5' — digit
  position=9: '0' — digit
  position=10: '.' — decimal
  position=11: '0' — digit
  position=12: ' ' — stop
  valueString = '50.0', parsedValue = 50.0
  push WORD('X', 50.0), position=12

... (Y-25.5 follows same pattern with sign '-')
```

Result: `[ WORD('N',10), WORD('G',0), WORD('X',50.0), WORD('Y',-25.5) ]`

---

## Step 4 — Tests

### Create `src/gcode/lexer.test.ts`

```typescript
import { describe, test, expect } from 'vitest'
import { tokeniseGcodeLine }      from './lexer.js'

describe('G-code lexer', () => {
  test('tokenises a basic move block', () => {
    const tokens = tokeniseGcodeLine('G0 X50.0 Y-25.5 Z5.0')
    expect(tokens).toHaveLength(4)
    expect(tokens[0]).toEqual({ type: 'WORD', letter: 'G', value: 0 })
    expect(tokens[1]).toEqual({ type: 'WORD', letter: 'X', value: 50.0 })
    expect(tokens[2]).toEqual({ type: 'WORD', letter: 'Y', value: -25.5 })
    expect(tokens[3]).toEqual({ type: 'WORD', letter: 'Z', value: 5.0 })
  })

  test('strips parenthetical comments', () => {
    const tokens = tokeniseGcodeLine('G0 X10 (rapid to X10) Y20')
    expect(tokens.filter((t) => t.type === 'WORD')).toHaveLength(3)
    expect(tokens.some((t) => t.type === 'COMMENT')).toBe(true)
  })

  test('stops at semicolon comment', () => {
    const tokens = tokeniseGcodeLine('G1 X50 ; this is a comment')
    expect(tokens.filter((t) => t.type === 'WORD')).toHaveLength(2)
  })

  test('normalises lowercase', () => {
    const tokens = tokeniseGcodeLine('g0 x50.0')
    expect(tokens[0]).toEqual({ type: 'WORD', letter: 'G', value: 0 })
    expect(tokens[1]).toEqual({ type: 'WORD', letter: 'X', value: 50.0 })
  })

  test('returns empty for empty line', () => {
    expect(tokeniseGcodeLine('')).toHaveLength(0)
    expect(tokeniseGcodeLine('%')).toHaveLength(0)
  })

  test('produces error token for unknown character', () => {
    const tokens = tokeniseGcodeLine('G0 @ X10')
    expect(tokens.some((t) => t.type === 'ERROR')).toBe(true)
    expect(tokens.some((t) => t.type === 'WORD' && t.letter === 'G')).toBe(true)
    expect(tokens.some((t) => t.type === 'WORD' && t.letter === 'X')).toBe(true)
  })
})
```

**`toHaveLength(n)` — first appearance:**
`expect(array).toHaveLength(n)` asserts the array has exactly `n` elements. Equivalent
to `expect(array.length).toBe(n)` but provides a clearer error message.

**`toEqual(obj)` — first appearance:**
`expect(value).toEqual(obj)` performs a **deep equality** check — all nested
properties and values must match. `toBe` tests reference equality (same object in
memory). `toEqual` tests structural equality (same shape and values). Use `toEqual`
for comparing objects and arrays; `toBe` for comparing primitives.

Run `npm test`. All tests pass.

---

## Debugging: When Lexer Tokens Are Wrong

**Symptom: `Y-25.5` produces `WORD('Y', NaN)`**

The sign is not consumed. Verify the sign-consuming branch:
```typescript
if (position < line.length && (line[position] === '+' || line[position] === '-')) {
  valueString += line[position]!
  position++
}
```
If this is missing, `valueString = '25.5'` (no sign) and the `-` is an unknown
character producing an `ERROR` token, not part of the number.

**Symptom: comment content appears in word tokens**

The comment branch is not breaking early enough. After consuming `(...)`, verify
`position = closeIndex + 1` — setting position past the closing `)`. If `position`
stays before `)`, the `)` is processed as an unknown character and the following
text is tokenised as if it were G-code.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`tokeniseGcodeLine` is the entry point for all G-code processing. Lesson 18 (parser)
calls it for each line and builds a structured `GcodeBlock`. Lesson 19 (simulator)
calls the parser on each block to extract moves. Lesson 24 (exporter) does not call
the lexer — it generates G-code text directly — but the `GcodeWord` type is shared.

The lexer here is simpler than the calculator's lexer (lesson 07 of the calculator)
because G-code has a regular grammar (no nested expressions, no parentheses in
arithmetic). The calculator lexer needed to handle arbitrary expression nesting; the
G-code lexer processes a flat sequence of word-address pairs. This is why G-code is
a DSL: its simplicity enables machines with limited processors to execute it.

**Real-world connection:**
Every CAM software (Mastercam, Fusion 360, SolidCAM) has a G-code lexer. Every CNC
controller has a G-code lexer — written in C or assembly, running on the machine's
dedicated processor. The character-classification state machine you built is the
same pattern they all use, scaled up with more character classes and error recovery.

---

## What Breaks Without This

**Without lowercase normalisation:**
G-code files from older CAM software often produce lowercase words. A lexer that
only handles uppercase would produce `ERROR` tokens for every word in such a file,
and the entire file would fail to parse.

**Without the semicolon comment break:**
The rest of a line after `;` would be parsed as G-code. `G1 X50 ; this is X100`
would produce `WORD('X', 100)` from the comment, causing the simulator to believe
there are two X coordinates on the same block — likely a wrong move.

---

## Definition of Done

- [ ] `tokeniseGcodeLine('G0 X50.0 Y-25.5')` returns three `WORD` tokens
- [ ] Parenthetical and semicolon comments produce `COMMENT` tokens or are discarded
- [ ] Lowercase G-code is normalised to uppercase
- [ ] Unknown characters produce `ERROR` tokens, not crashes
- [ ] `npm test` passes all tests in `lexer.test.ts`
- [ ] You can explain the word-address format and what a G-code "word" is
- [ ] You can explain the connection between this lexer and the calculator's lexer
- [ ] You can explain why error tokens are preferred over throwing for G-code
- [ ] You can explain `toEqual` vs `toBe` in Vitest
- [ ] Run:
      ```
      git add src/gcode/
      git commit -m "Add G-code lexer: word-address tokenisation, comment stripping, lowercase normalisation, error tokens for unknown characters"
      ```

---

*Next: Lesson 18 — The G-code Parser. Tokens become structured blocks with modal
state tracked across lines. The G-code state machine tracks absolute/relative mode,
units, and active G-codes.*
