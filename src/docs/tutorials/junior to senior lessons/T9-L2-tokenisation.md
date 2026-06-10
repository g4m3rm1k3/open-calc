# Junior to Senior — T9·L2 — Tokenisation

**Prerequisites:** T9·L1 (What Parsing Is). You know the two-stage pipeline.
This lesson builds the tokeniser — the first stage that converts raw G-code text
into a stream of typed tokens.

**What this lab adds:**
- The tokeniser reads character by character and emits typed tokens
- Token types for G-code: G-word, M-word, axis-word, F-word, comment, EOB
- Emitting a generator stream instead of a list
- Regex for tokenisation: one pattern per token type
- Error tokens: what to emit for unexpected characters (do not crash)

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Why use a generator that yields tokens rather than returning a full list?
> 2. Tokenising `G01 X50 bad_char Z5.0` — what token do you emit for `bad_char`?
> 3. The regex `^[XYZIJKR](-?\d+\.?\d*)` matches `X50.0`. Why `^` (start anchor)?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A complete G-code tokeniser:

```ts
const source = 'G01 X50.0 Y25.0 F400\n';
const tokens  = [...tokenise(source)];
// [
//   Token(G_WORD, 'G01', 1, line=1, col=1),
//   Token(AXIS_WORD, 'X50.0', 50.0, line=1, col=5),
//   Token(AXIS_WORD, 'Y25.0', 25.0, line=1, col=10),
//   Token(F_WORD, 'F400', 400, line=1, col=16),
//   Token(END_OF_BLOCK, '\n', null, line=1, col=20),
// ]
```

---

### Concept: Regex for Tokenisation

**Why regex is appropriate here:** Tokenisation matches fixed patterns at the
current position in the string. Regex is the natural tool for "does the text
starting at position `i` match this pattern?"

**The key technique — anchored regex + `index` tracking:**

```ts
// At position i in the source, try to match a pattern:
const pattern = /^[Gg](\d+)/;
const match = pattern.exec(source.slice(pos));  // only tries at position pos

if (match) {
  const raw = match[0];  // 'G01'
  const num = parseInt(match[1]);  // 1
  pos += raw.length;  // advance past this token
}
```

The `^` anchor means "match at the start of the string" — since we pass
`source.slice(pos)`, this means "match at position `pos`."

---

## Step 1 — Build the Tokeniser

Create `src/tokeniser.ts`:

```ts
import { token, type Token, type TokenType } from './tokens';

const PATTERNS: Array<{ type: TokenType; regex: RegExp; getValue: (m: RegExpExecArray) => unknown }> = [
  {
    type:     'COMMENT',
    regex:    /^;([^\n]*)/,
    getValue: m => m[1].trim(),
  },
  {
    type:     'COMMENT',
    regex:    /^\(([^)]*)\)/,
    getValue: m => m[1].trim(),
  },
  {
    type:     'N_WORD',
    regex:    /^[Nn](\d+)/,
    getValue: m => parseInt(m[1], 10),
  },
  {
    type:     'G_WORD',
    regex:    /^[Gg](\d+\.?\d*)/,
    getValue: m => parseFloat(m[1]),
  },
  {
    type:     'M_WORD',
    regex:    /^[Mm](\d+)/,
    getValue: m => parseInt(m[1], 10),
  },
  {
    type:     'F_WORD',
    regex:    /^[Ff](-?\d+\.?\d*)/,
    getValue: m => parseFloat(m[1]),
  },
  {
    type:     'S_WORD',
    regex:    /^[Ss](-?\d+\.?\d*)/,
    getValue: m => parseFloat(m[1]),
  },
  {
    type:     'T_WORD',
    regex:    /^[Tt](\d+)/,
    getValue: m => parseInt(m[1], 10),
  },
  {
    type:     'AXIS_WORD',
    regex:    /^([XYZxyzIiJjKkRr])(-?\d+\.?\d*)/,
    getValue: m => ({ axis: m[1].toUpperCase(), value: parseFloat(m[2]) }),
  },
  {
    type:     'END_OF_BLOCK',
    regex:    /^[\n\r%]/,
    getValue: _ => null,
  },
];

const WHITESPACE = /^[ \t]+/;

export function* tokenise(source: string): Generator<Token> {
  let pos  = 0;
  let line = 1;
  let col  = 1;

  while (pos < source.length) {
    const remaining = source.slice(pos);

    // Skip whitespace:
    const wsMatch = WHITESPACE.exec(remaining);
    if (wsMatch) {
      pos += wsMatch[0].length;
      col += wsMatch[0].length;
      continue;
    }

    // Try each pattern in order:
    let matched = false;
    for (const { type, regex, getValue } of PATTERNS) {
      const m = regex.exec(remaining);
      if (m) {
        const raw = m[0];
        yield token(type, raw, getValue(m), line, col);

        if (type === 'END_OF_BLOCK') {
          line++;
          col = 1;
        } else {
          col += raw.length;
        }
        pos += raw.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Unknown character — emit error token and advance:
      yield token('ERROR', remaining[0], remaining[0], line, col);
      pos++;
      col++;
    }
  }

  yield token('EOF', '', null, line, col);
}
```

---

## Step 2 — Write Tests

Create `src/tokeniser.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { tokenise }              from './tokeniser';

// Helper: tokenise and filter out EOF:
function tokens(source: string) {
  return [...tokenise(source)].filter(t => t.type !== 'EOF');
}

describe('tokeniser', () => {

  describe('G-words', () => {
    it('tokenises G01', () => {
      const [t] = tokens('G01');
      expect(t.type).toBe('G_WORD');
      expect(t.value).toBe(1);
    });

    it('tokenises fractional G-code like G28.1', () => {
      const [t] = tokens('G28.1');
      expect(t.type).toBe('G_WORD');
      expect(t.value).toBeCloseTo(28.1);
    });

    it('tokenises lowercase g as well', () => {
      const [t] = tokens('g01');
      expect(t.type).toBe('G_WORD');
    });
  });

  describe('axis words', () => {
    it('tokenises X50.0', () => {
      const [t] = tokens('X50.0');
      expect(t.type).toBe('AXIS_WORD');
      const v = t.value as { axis: string; value: number };
      expect(v.axis).toBe('X');
      expect(v.value).toBeCloseTo(50.0);
    });

    it('tokenises negative axis value', () => {
      const [t] = tokens('Y-25.5');
      const v = t.value as { axis: string; value: number };
      expect(v.value).toBeCloseTo(-25.5);
    });

    it('tokenises I and J for arc parameters', () => {
      const ts = tokens('I5 J0');
      expect(ts[0].type).toBe('AXIS_WORD');
      const i = ts[0].value as { axis: string; value: number };
      expect(i.axis).toBe('I');
    });
  });

  describe('comments', () => {
    it('tokenises semicolon comments', () => {
      const [t] = tokens('; this is a comment');
      expect(t.type).toBe('COMMENT');
      expect(t.value).toBe('this is a comment');
    });

    it('tokenises parenthetical comments', () => {
      const [t] = tokens('(feed rate comment)');
      expect(t.type).toBe('COMMENT');
      expect(t.value).toBe('feed rate comment');
    });
  });

  describe('end of block', () => {
    it('emits END_OF_BLOCK for newline', () => {
      const ts = tokens('G01\n');
      expect(ts[1].type).toBe('END_OF_BLOCK');
    });
  });

  describe('error handling', () => {
    it('emits ERROR token for unknown characters', () => {
      const ts = tokens('@');
      expect(ts[0].type).toBe('ERROR');
      expect(ts[0].raw).toBe('@');
    });

    it('continues after error tokens', () => {
      const ts = tokens('@G01');
      expect(ts[0].type).toBe('ERROR');
      expect(ts[1].type).toBe('G_WORD');
    });
  });

  describe('line tracking', () => {
    it('tracks line numbers correctly', () => {
      const ts = tokens('G01\nG02');
      const g02 = ts.find(t => t.type === 'G_WORD' && t.value === 2);
      expect(g02?.line).toBe(2);
    });
  });

  describe('full line', () => {
    it('tokenises a complete linear move block', () => {
      const ts = tokens('G01 X50.0 Y25.0 F400');
      expect(ts[0]).toMatchObject({ type: 'G_WORD', value: 1 });
      expect(ts[1]).toMatchObject({ type: 'AXIS_WORD' });
      expect(ts[2]).toMatchObject({ type: 'AXIS_WORD' });
      expect(ts[3]).toMatchObject({ type: 'F_WORD', value: 400 });
    });
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add `P_WORD` and `L_WORD`

**You know:** The tokeniser pattern array, regex, generator.

**Task:** G-code has many word types beyond what's implemented. Add:
- `P_WORD` — parameter number (P1, P100) — used in canned cycles and subroutines
- `L_WORD` — repeat count (L3) — repeat a canned cycle L times

Write 2 tests before adding the patterns.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**Tests:**
```ts
it('tokenises P-word', () => {
  const [t] = tokens('P100');
  expect(t.type).toBe('P_WORD');
  expect(t.value).toBe(100);
});

it('tokenises L-word', () => {
  const [t] = tokens('L3');
  expect(t.type).toBe('L_WORD');
  expect(t.value).toBe(3);
});
```

**Add to PATTERNS (before AXIS_WORD):**
```ts
{
  type:     'P_WORD',
  regex:    /^[Pp](\d+)/,
  getValue: m => parseInt(m[1], 10),
},
{
  type:     'L_WORD',
  regex:    /^[Ll](\d+)/,
  getValue: m => parseInt(m[1], 10),
},
```

**Key insight:** The pattern array is ordered — patterns are tried in order and
the first match wins. `L_WORD` must come before `AXIS_WORD` because `L` could
match the axis letter pattern if we're not careful. However, our AXIS_WORD regex
only matches `[XYZIJKRxyzijkr]`, so `L` is not ambiguous here. Still, ordering
from most specific to least specific is good practice.

</details>

---

## Final Check

| Token type | Example | Value |
|---|---|---|
| `G_WORD` | `G01` | `1` (number) |
| `AXIS_WORD` | `X50.0` | `{ axis: 'X', value: 50.0 }` |
| `F_WORD` | `F400` | `400` |
| `COMMENT` | `; note` | `'note'` (string) |
| `END_OF_BLOCK` | `\n` | `null` |
| `ERROR` | `@` | `'@'` (original char) |

---

## Quick Check Answers

**1. Generator vs list — why generator?**

A generator yields tokens one at a time. The parser can start processing before
the tokeniser finishes. For a large G-code file (millions of lines), materialising
all tokens into a list would use significant memory. A generator processes one line
at a time, keeping memory usage constant regardless of file size.

**2. `bad_char` in the source — what token?**

`ERROR` token with `raw = 'b'` (the first character). The tokeniser does not
crash — it emits one `ERROR` token per unrecognised character and advances. The
remaining valid G-code after the bad character is still tokenised correctly.

**3. Why `^` anchor in the regex?**

Without `^`, the regex would search the entire string for a match anywhere —
finding `X50` in `garbage_text_before_X50`. With `^`, it only matches at the
start of the string. Since we pass `source.slice(pos)`, `^` means "match starting
at position `pos` in the original source" — this is the correct behaviour for a
sequential tokeniser.
