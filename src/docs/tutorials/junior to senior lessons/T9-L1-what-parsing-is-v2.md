# Junior to Senior — T9·L1 — What Parsing Is

**Prerequisites:** T8·L6 (R3F Performance). You can build 3D scenes. This lesson starts
Topic 9 by explaining WHAT parsing is and WHY it has two separate stages — by showing
what breaks when you try to do it in one stage, and what the two-stage design prevents.

**What this lab adds:**
- WHY two stages are better than one — the single-stage version and its failure modes
- What "token" means precisely — not "word" or "piece," but the smallest MEANINGFUL unit
- What "structure" means — the difference between a flat list of tokens and a command object
- How to recognise the pipeline in existing tools you already use (JSON, TypeScript, your terminal)
- Setting up the gcode-parser project

**Time:** 30–45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `JSON.parse('{"x": 1}')` runs both stages internally. What do the two stages produce?
>    What does each stage's output look like for this input?
> 2. You try to parse `G01 X50.0 Y25.0 F400` in one pass — character by character —
>    without a tokeniser. You reach the space after `G01`. What do you do? How do you know
>    the space is a separator and not part of a value?
> 3. `X50.0` is one token. Is `50.0` also a token? Is `5` a token? Explain.
>
> *(Answers at the end of this lab)*

---

## The Problem With One-Stage Parsing

Before building the two-stage pipeline, try the one-stage approach and see where it fails.

Imagine parsing `G01 X50.0 F400` character by character without separating into tokens first:

```ts
function badParse(input: string) {
  let i = 0;

  // Try to read the G-word:
  if (input[i] !== 'G') throw new Error('Expected G');
  i++;

  // Read the number after G:
  let gNum = '';
  while (i < input.length && /\d/.test(input[i])) {
    gNum += input[i];
    i++;
  }
  const gCode = parseInt(gNum);

  // Skip whitespace:
  while (i < input.length && input[i] === ' ') i++;

  // Try to read X:
  if (input[i] !== 'X') throw new Error('Expected X');
  i++;

  // Read the number after X:
  let xNum = '';
  while (i < input.length && /[\d.]/.test(input[i])) {
    xNum += input[i];
    i++;
  }
  const xValue = parseFloat(xNum);

  // ... repeat for F, Y, Z, I, J, K, R, S, T, N, comments...
  // → This function will be 500 lines and still broken
}
```

The problems that appear immediately:
1. The code hardcodes the ORDER: G, then X, then F. Real G-code: any order.
2. How do you handle a missing X? You'd need to check for every possible next word.
3. When something fails, the error message says "Expected X" but doesn't say WHERE.
4. Adding a new word type (like `P` for parameter) requires rewriting the whole function.

**The two-stage design solves all four problems.** The tokeniser handles "what are the units"
without caring about order. The parser handles "how do these units form a command."

---

## Step 1 — Set Up the Project

```bash
mkdir gcode-parser && cd gcode-parser
npm init -y
npm install -D vitest typescript @types/node
```

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": { "test": "vitest run" }
}
```

Create `src/tokens.ts`:

```ts
// src/tokens.ts
// A token is the smallest MEANINGFUL unit of G-code.
// "Meaningful" means: it is something the parser needs to make a decision.
// - 'G' alone is not meaningful — you need 'G01' to know it is a linear move command
// - 'G01' is meaningful — it is a specific command code
// - 'G01 X' — X alone is not meaningful — you need 'X50.0' to know the x position
// - 'X50.0' is meaningful — it is a specific axis word with a value

export type TokenType =
  | 'G_WORD'       // G01, G02, G90 — motion and mode codes
  | 'M_WORD'       // M03, M05, M30 — machine commands
  | 'AXIS_WORD'    // X50.0, Y-25.0, Z5.0, I10.0, J0, K0, R5.0
  | 'F_WORD'       // F400 — feed rate
  | 'S_WORD'       // S1000 — spindle speed
  | 'T_WORD'       // T01 — tool number
  | 'N_WORD'       // N010 — line number (ignored by most parsers)
  | 'COMMENT'      // ; text or ( text ) — human notes, ignored by machine
  | 'END_OF_BLOCK' // \n or % — the end of one G-code block (one line)
  | 'ERROR'        // unrecognised character — we emit this instead of crashing
  | 'EOF';         // end of the entire input — signals parser to stop

export interface Token {
  type:   TokenType;
  raw:    string;   // the exact characters from the source ("G01", "X50.0")
  value:  unknown;  // parsed value (1, {axis:'X', value:50.0}, etc.)
  line:   number;   // 1-based line number — for error messages
  column: number;   // 1-based column — for error messages
}

export function makeToken(
  type:   TokenType,
  raw:    string,
  value:  unknown,
  line:   number,
  column: number,
): Token {
  return { type, raw, value, line, column };
}
```

Create the test:

```ts
// src/tokens.test.ts
import { describe, it, expect } from 'vitest';
import { makeToken } from './tokens';

describe('token creation', () => {
  it('creates a token with all required fields', () => {
    const t = makeToken('G_WORD', 'G01', 1, 1, 1);
    expect(t.type).toBe('G_WORD');
    expect(t.raw).toBe('G01');
    expect(t.value).toBe(1);
    expect(t.line).toBe(1);
    expect(t.column).toBe(1);
  });

  it('different token types store different value shapes', () => {
    const gToken    = makeToken('G_WORD',    'G01',   1,                  1, 1);
    const axisToken = makeToken('AXIS_WORD', 'X50.0', { axis: 'X', value: 50.0 }, 1, 5);

    // G_WORD value is just the code number:
    expect(gToken.value).toBe(1);
    // AXIS_WORD value is an object with axis letter and numeric value:
    expect((axisToken.value as { axis: string; value: number }).axis).toBe('X');
    expect((axisToken.value as { axis: string; value: number }).value).toBe(50.0);
  });
});
```

### SAVE AND TRY

```bash
npm test
```

Expected: `Tests 2 passed`.

---

### Concept: Why Two Stages — The Division of Responsibility

**What it is:** The tokeniser asks ONE question: "what kind of text unit is this?"
It reads the raw characters and groups them into tokens. It does NOT ask "is this valid?"
or "what does this mean in context?"

The parser asks ONE question: "how do these tokens form a command?" It reads the token
stream and builds the final structure. It does NOT re-read characters or know about
whitespace.

**Why this division matters:**

```
Without it: parseGCode() handles both jobs
→ every change to the character format requires understanding the whole command structure
→ errors are reported in terms of characters (hard to explain to a user)
→ the function cannot be tested without a complete G-code line

With it:
tokenise() handles one job → tested with single tokens
parseBlock() handles one job → tested with lists of tokens
→ adding a new token type (like P-word) only changes tokenise()
→ changing how blocks are parsed only changes parseBlock()
→ error messages can say "invalid token on line 5, column 12" instead of "unexpected 'P'"
```

**Canonical example:** Reading a legal document. Stage 1 = a reader identifies all the
legal terms (tokens: "hereby", "party of the first part", "notwithstanding"). Stage 2 = a
lawyer interprets how those terms form clauses and obligations (structure). The reader
doesn't need to understand contracts; the lawyer doesn't need to identify which syllables
belong to which legal term.

**You will see this again in:**
- TypeScript's compiler: tsc has a lexer (produces tokens) and a parser (produces an AST)
- Your terminal: bash tokenises by whitespace, then parses the token sequence as commands
- CSS: the browser tokenises `color: red;` into tokens, then parses them into CSS rules
- SQL: `SELECT * FROM users` is tokenised into keywords/identifiers, then parsed into a query

---

## Step 2 — Identify Tokens in Real G-Code

Work through these lines by hand (not code) — identify each token type and value:

```
G01 X50.0 Y25.0 F400
```

Draw the token boundary after each character. When do you KNOW you have a complete token?

- After reading `G01` and hitting a space: you have a complete G_WORD (value=1)
- After reading `X50.0` and hitting a space: you have a complete AXIS_WORD (axis='X', value=50.0)
- After reading `Y25.0` and hitting a space: AXIS_WORD (axis='Y', value=25.0)
- After reading `F400` and hitting \n: F_WORD (value=400)
- After \n: END_OF_BLOCK

The rule for "when is a token complete": when the next character is NOT part of the
current token. A space after digits terminates the number. A letter after a number
terminates the number. The end of the file terminates everything.

Write these as a test:

```ts
// src/tokens.test.ts — add this test:

it('encodes the token sequence for G01 X50.0 Y25.0 F400', () => {
  // Written by hand — this is the expected output of tokenise() (to be built in T9-L2):
  const expected = [
    { type: 'G_WORD',    value: 1 },
    { type: 'AXIS_WORD', value: { axis: 'X', value: 50.0 } },
    { type: 'AXIS_WORD', value: { axis: 'Y', value: 25.0 } },
    { type: 'F_WORD',    value: 400 },
    { type: 'END_OF_BLOCK' },
  ];

  // Verify the shapes are correct (not running tokenise yet — just checking the design):
  expect(expected[0].type).toBe('G_WORD');
  expect(expected[1].type).toBe('AXIS_WORD');
  expect((expected[1].value as any).axis).toBe('X');
});
```

### SAVE AND TRY

```bash
npm test
```

Expected: `Tests 3 passed`.

---

## 🎯 Challenge: Identify Tokens in Complex Lines

**You know:** The token types from `tokens.ts`, the two-stage purpose.

**Task:** For each G-code line below, write out the expected token sequence by hand.
Do NOT write code — just identify types and values.

```
; Feed rate note: use 400mm/min
G02 X10 Y10 I5 J0 F300
N010 G90 G17
M03 S1500
G01 X25  ; move to 25mm
```

For each: how many tokens? Which types? What values?

---

<details>
<summary>▶ Show Solution</summary>

```
; Feed rate note: use 400mm/min
→ [COMMENT: 'Feed rate note: use 400mm/min'] [END_OF_BLOCK]
(2 tokens)

G02 X10 Y10 I5 J0 F300
→ [G_WORD: 2] [AXIS_WORD: X,10] [AXIS_WORD: Y,10] [AXIS_WORD: I,5] [AXIS_WORD: J,0] [F_WORD: 300] [END_OF_BLOCK]
(7 tokens)

N010 G90 G17
→ [N_WORD: 10] [G_WORD: 90] [G_WORD: 17] [END_OF_BLOCK]
(4 tokens)

M03 S1500
→ [M_WORD: 3] [S_WORD: 1500] [END_OF_BLOCK]
(3 tokens)

G01 X25  ; move to 25mm
→ [G_WORD: 1] [AXIS_WORD: X,25] [COMMENT: 'move to 25mm'] [END_OF_BLOCK]
(4 tokens)
```

**Key observations:**
- Spaces between tokens are NOT tokens — they are separators consumed but not emitted
- A comment is ONE token, not multiple (the content is the value)
- `I` and `J` are AXIS_WORD tokens (arc offset parameters) — same type as X, Y, Z
- N010 = N_WORD with value 10 (the leading zero is formatting, not significant)

</details>

---

## Final Check

| Concept | What to verify |
|---|---|
| Two-stage purpose | Can you explain which stage handles which question? |
| Token = smallest MEANINGFUL unit | Is `5` a token? Is `X5` a token? Is `X` a token? |
| Token types | 11 types: G_WORD, M_WORD, AXIS_WORD, F, S, T, N, COMMENT, END_OF_BLOCK, ERROR, EOF |
| Token structure | Has: type, raw, value, line, column |

---

## Quick Check Answers

**1. `JSON.parse('{"x": 1}')` — what do the two stages produce?**

Stage 1 (tokeniser) produces a flat sequence:
`[LEFT_BRACE, STRING("x"), COLON, NUMBER(1), RIGHT_BRACE]`

Stage 2 (parser) produces a structured JavaScript object:
`{ x: 1 }`

The tokeniser handles all the character-by-character decisions (where does the string start/end,
how many digits in the number). The parser handles the structural decisions (this colon means
the next token is a value for the preceding key, the braces enclose an object).

**2. One-stage parsing, at the space after G01. What do you do?**

You have to decide: "is this space a separator between words, or is it part of the current
token?" With character-by-character parsing, you need rules for every character and every
context. The tokeniser encapsulates this decision: it knows that spaces terminate tokens
(for G-code). The parser never sees spaces — it only sees the completed token stream.

**3. `X50.0` is one token. Is `50.0` a token? Is `5` a token?**

`50.0` alone is not a meaningful unit in G-code — you can't know what axis it refers to
without the `X` prefix. `5` is also not a token — it is an incomplete number.
`X50.0` as a unit means "the X axis word with value 50.0" — this is the smallest unit
that the parser can use to make a decision. Tokens are defined by the GRAMMAR, not by
character boundaries.
