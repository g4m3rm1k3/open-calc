# Junior to Senior — T9·L1 — What Parsing Is

**Prerequisites:** T8·L6 (R3F Performance). You can build 3D scenes. This lesson
starts Topic 9 — Parsing and Tokenisation — the CS techniques needed to process
G-code files and DXF imports.

**What this lab adds:**
- The two-stage pipeline: raw text → tokens → structure
- Token: the smallest meaningful unit
- Parser: consumes a token stream and produces a structured result
- Why parsers are everywhere: compilers, config files, protocols

**Time:** 30–45 minutes (conceptual and setup)

---

> **Quick Check — try to answer before reading:**
>
> 1. `JSON.parse('{"x": 1}')` — which stage is this? Tokenisation or parsing?
> 2. A G-code line is `G01 X50.0 Y25.0 F400`. What are the tokens?
> 3. You want to accept G-code from users but not crash on invalid input. Where
>    in the pipeline does error handling belong?
>
> *(Answers at the end of this lab)*

---

## The Two-Stage Pipeline

Every parser in existence follows the same two-stage structure:

```
Raw text:  "G01 X50.0 F400"
              ↓
Stage 1 — Tokeniser (lexer):
  Token(G_WORD, 'G01')
  Token(AXIS_WORD, 'X', 50.0)
  Token(F_WORD, 400.0)
              ↓
Stage 2 — Parser:
  LinearMove(x=50.0, feed=400.0, y=None, z=None)
```

**Why two stages?** Each stage has a single responsibility:
- The tokeniser only asks: "what kind of text unit is this?"
- The parser only asks: "how do these units form a command?"

Combining both into one stage produces code that is hard to test and maintain.

---

### Concept: Tokens

**What it is:** A token is the smallest meaningful unit in a language. It has a
type (what kind of thing it is) and a value (what it says).

**G-code tokens:**

| Raw text | Token type | Token value |
|---|---|---|
| `G01` | G_WORD | 1 |
| `G02` | G_WORD | 2 |
| `X50.0` | AXIS_WORD | ('X', 50.0) |
| `F400` | F_WORD | 400.0 |
| `N010` | N_WORD | 10 |
| `; comment` | COMMENT | ' comment' |
| `\n` or `%` | END_OF_BLOCK | — |

Everything else (whitespace, unknown characters) is handled by the tokeniser
as either ignored or as an error token.

---

### Concept: Why Parsing Matters

Parsing is the entry point for all text-based data:

| Domain | Format | Parser produces |
|---|---|---|
| G-code files | `.nc`, `.gcode` | Move commands, modal state |
| CAD geometry | DXF, SVG, IGES | Line, arc, circle objects |
| Configuration | JSON, TOML, YAML | Typed configuration objects |
| Protocols | HTTP, WebSocket frames | Request/response objects |
| Code | TypeScript, Python | AST (abstract syntax tree) |

The CAD/CAM application will parse G-code (to verify and display it) and DXF
files (to import customer designs).

---

## Step 1 — Define Token Types

Create a new TypeScript project for Topic 9:

```bash
mkdir gcode-parser
cd gcode-parser
npm init -y
npm install -D vitest typescript @types/node
```

Create `src/tokens.ts`:

```ts
export type TokenType =
  | 'G_WORD'       // G01, G02, G90, etc.
  | 'M_WORD'       // M03, M05, M30, etc.
  | 'AXIS_WORD'    // X50.0, Y-25.0, Z5.0, I10.0, J0, K0, R5.0
  | 'F_WORD'       // F400 — feed rate
  | 'S_WORD'       // S1000 — spindle speed
  | 'T_WORD'       // T01 — tool number
  | 'N_WORD'       // N010 — line number
  | 'COMMENT'      // ; text or ( text )
  | 'END_OF_BLOCK' // newline or %
  | 'ERROR'        // unrecognised character
  | 'EOF';         // end of input

export interface Token {
  type:   TokenType;
  raw:    string;   // the original text
  value:  unknown;  // parsed value (number, string, etc.)
  line:   number;   // 1-based line number in the source
  column: number;   // 1-based column
}

export function token(
  type:   TokenType,
  raw:    string,
  value:  unknown,
  line:   number,
  column: number,
): Token {
  return { type, raw, value, line, column };
}
```

Create `src/token-types.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { token } from './tokens';

describe('token factory', () => {
  it('creates a token with all required fields', () => {
    const t = token('G_WORD', 'G01', 1, 1, 1);
    expect(t.type).toBe('G_WORD');
    expect(t.raw).toBe('G01');
    expect(t.value).toBe(1);
    expect(t.line).toBe(1);
    expect(t.column).toBe(1);
  });
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: 1 passing test.

---

## Step 2 — Recognise the Pipeline Stages

```ts
// Stage 1 — tokenise a single line:
function tokeniseLine(line: string): Token[] {
  // Returns: [Token(G_WORD, G01), Token(AXIS_WORD, X, 50.0), ...]
}

// Stage 2 — parse tokens from one line into a command:
function parseLine(tokens: Token[]): GCodeCommand | null {
  // Returns: LinearMove { x: 50.0, feed: 400 } or null if unknown/empty
}
```

The stages compose: `parseLine(tokeniseLine(line))` processes one G-code block.
Later lessons build each stage in full. This lesson only establishes the structure.

---

## 🎯 Challenge: Identify Tokens in G-Code Lines

**You know:** Token types, the two-stage pipeline.

**Task:** For each G-code line below, write out the expected token sequence by hand.
Do not write any code — just identify the types and values:

```
Line 1:  G01 X50.0 Y25.0 F400
Line 2:  G02 X10 Y10 I5 J0
Line 3:  M03 S1000
Line 4:  N010 G90 G17
Line 5:  ; This is a comment
Line 6:  G01 X50  ; end-of-block comment
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```
Line 1:  G01 X50.0 Y25.0 F400
  [G_WORD: 1] [AXIS_WORD: X,50.0] [AXIS_WORD: Y,25.0] [F_WORD: 400] [END_OF_BLOCK]

Line 2:  G02 X10 Y10 I5 J0
  [G_WORD: 2] [AXIS_WORD: X,10] [AXIS_WORD: Y,10] [AXIS_WORD: I,5] [AXIS_WORD: J,0] [END_OF_BLOCK]

Line 3:  M03 S1000
  [M_WORD: 3] [S_WORD: 1000] [END_OF_BLOCK]

Line 4:  N010 G90 G17
  [N_WORD: 10] [G_WORD: 90] [G_WORD: 17] [END_OF_BLOCK]

Line 5:  ; This is a comment
  [COMMENT: 'This is a comment'] [END_OF_BLOCK]

Line 6:  G01 X50  ; end-of-block comment
  [G_WORD: 1] [AXIS_WORD: X,50] [COMMENT: 'end-of-block comment'] [END_OF_BLOCK]
```

**Key observations:**
- Each word letter (G, M, X, Y, I, J, F, S, T, N) introduces a token
- Axis letters (X, Y, Z, I, J, K, R) are all `AXIS_WORD` tokens with their letter and value
- Comments come in two forms: `;` to end of line, or `(...)` bracketed
- Whitespace is NOT a token — it is skipped during tokenisation

</details>

---

## Final Check

| Concept | Example |
|---|---|
| Token type | `G_WORD`, `AXIS_WORD`, `COMMENT` |
| Token value | `(G_WORD, 1)`, `(AXIS_WORD, 'X', 50.0)` |
| Stage 1 (tokeniser) | Produces tokens from raw text |
| Stage 2 (parser) | Produces structured objects from tokens |
| Error handling | Each stage reports errors without crashing |

---

## Quick Check Answers

**1. `JSON.parse('{"x": 1}')` — tokenisation or parsing?**

Both. `JSON.parse` is a complete parser that handles both stages internally.
The tokeniser reads `{`, `"x"`, `:`, `1`, `}` into tokens. The parser then
assembles those tokens into a JavaScript object. They are implemented together
in the built-in `JSON.parse` function, but conceptually the two stages are present.

**2. `G01 X50.0 Y25.0 F400` — what are the tokens?**

`G_WORD(1)`, `AXIS_WORD('X', 50.0)`, `AXIS_WORD('Y', 25.0)`, `F_WORD(400)`,
`END_OF_BLOCK`. The spaces between words are NOT tokens — they are skipped.

**3. Where in the pipeline does error handling for invalid G-code belong?**

Both stages. The tokeniser handles lexical errors — characters that are not
part of any valid token (e.g., `@`, `#`). The parser handles structural errors —
tokens that don't form a valid command (e.g., `G02` without any axis words).
Each stage should report errors with line/column information and continue rather
than crash — "error recovery" allows the parser to process as much as possible.
