# Junior to Senior — T9·L2 — Tokenisation

**Prerequisites:** T9·L1 (What Parsing Is). You know the two-stage pipeline.
This lesson builds the tokeniser by explaining WHY the anchored regex approach works,
HOW the position pointer advances exactly right, and WHAT "error recovery" means for
a tokeniser that must not crash on bad input.

**What this lab adds:**
- WHY the regex is anchored with `^` — what breaks without it
- HOW the tokeniser advances: `pos += raw.length` after each match
- WHY we yield tokens one at a time instead of building a list
- WHAT error recovery means: emit an ERROR token and advance ONE character
- Testing that proves the tokeniser advances correctly and doesn't get stuck

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The regex `/^G(\d+)/` matches `G01` at the start of the remaining string.
>    After the match, `pos` advances by 3. If the remaining string were `G01 X5`,
>    what does `source.slice(pos)` now return?
> 2. An unexpected character `@` appears. The tokeniser emits `ERROR('@')` and
>    advances by 1. The NEXT character is `G`. Does it get tokenised? How?
> 3. The tokeniser uses a generator (`yield`). The parser asks for 5 tokens, then
>    stops. Were all remaining tokens computed?
>
> *(Answers at the end of this lab)*

---

## The Core Mechanism: Slice + Regex + Advance

The tokeniser's algorithm is simple but must be understood precisely:

```
pos = 0            (current position in the source string)

LOOP:
  remaining = source.slice(pos)      (everything not yet tokenised)
  for each pattern:
    match = pattern.regex.exec(remaining)
    if match:
      raw = match[0]                  (the matched text, e.g., "G01")
      yield token(type, raw, ...)
      pos += raw.length               (advance past the token)
      continue LOOP
  if no pattern matched:
    yield ERROR(remaining[0])         (unknown character — emit error token)
    pos += 1                          (advance by 1 — try again from next char)
```

**Why `^` in the regex is essential:**

```
remaining = "G01 X5"

Without ^: regex /G(\d+)/ — scans the whole string for G
  → could match "G01" starting at position 0 ✓ (happens to work)
  → but what about " G01"? It matches starting at position 1 — wrong!
  → the tokeniser would "find" G codes that aren't at the current position

With ^: regex /^G(\d+)/ — ONLY matches at the start
  → ONLY matches if G is the very first character of `remaining`
  → position-correct by construction: only matches what's at pos
```

---

## Step 1 — Build the Tokeniser Core

Create `src/tokeniser.ts`:

```ts
// src/tokeniser.ts
import { makeToken, type Token, type TokenType } from './tokens';

// Each pattern: the token type, regex (MUST start with ^), and how to extract the value
const PATTERNS: Array<{
  type:     TokenType;
  regex:    RegExp;
  getValue: (match: RegExpExecArray) => unknown;
}> = [
  // Comments — must be matched BEFORE other patterns so ; doesn't confuse them:
  {
    type:     'COMMENT',
    regex:    /^;([^\n]*)/,          // ; followed by anything up to newline
    getValue: m => m[1].trim(),      // capture group 1 = the comment text
  },
  {
    type:     'COMMENT',
    regex:    /^\(([^)]*)\)/,        // (anything inside parentheses)
    getValue: m => m[1].trim(),
  },
  // Words — each starts with a letter and is followed by a number:
  {
    type:     'N_WORD',
    regex:    /^[Nn](\d+)/,
    getValue: m => parseInt(m[1], 10),
  },
  {
    type:     'G_WORD',
    regex:    /^[Gg](\d+\.?\d*)/,   // \d+\.?\d* matches integers AND decimals like 28.1
    getValue: m => parseFloat(m[1]),
  },
  {
    type:     'M_WORD',
    regex:    /^[Mm](\d+)/,
    getValue: m => parseInt(m[1], 10),
  },
  {
    type:     'F_WORD',
    regex:    /^[Ff](-?\d+\.?\d*)/,  // -? allows negative feed (rare but valid)
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
    // Axis words: X, Y, Z, I, J, K, R — each with an optional sign and decimal:
    type:     'AXIS_WORD',
    regex:    /^([XYZIJKRxyzijkr])(-?\d+\.?\d*)/,
    getValue: m => ({ axis: m[1].toUpperCase(), value: parseFloat(m[2]) }),
  },
  {
    type:     'END_OF_BLOCK',
    regex:    /^[\n\r%]/,
    getValue: _ => null,
  },
];

// Whitespace: spaces and tabs are separators — NOT tokens
const WHITESPACE_REGEX = /^[ \t]+/;
```

### SAVE AND TRY

```bash
npx tsx -e "
import { PATTERNS } from './src/tokeniser.ts';
// Test that each pattern has ^ anchor:
for (const p of PATTERNS) {
  const hasAnchor = p.regex.toString().startsWith('/^');
  if (!hasAnchor) console.error('MISSING ANCHOR:', p.regex);
}
console.log('All patterns have ^ anchor:', PATTERNS.every(p => p.regex.toString().includes('/^')));
"
```

Expected: all patterns have `^` anchor.

---

## Step 2 — Add the Generator Function

Add to `src/tokeniser.ts`:

```ts
// src/tokeniser.ts (continued)

export function* tokenise(source: string): Generator<Token> {
  let pos  = 0;   // current position in source (bytes consumed so far)
  let line = 1;   // 1-based line number (for error messages)
  let col  = 1;   // 1-based column number

  while (pos < source.length) {
    const remaining = source.slice(pos);  // everything from pos to end

    // Step 1: skip whitespace (spaces and tabs between tokens):
    const wsMatch = WHITESPACE_REGEX.exec(remaining);
    if (wsMatch) {
      pos += wsMatch[0].length;   // advance past the whitespace
      col += wsMatch[0].length;
      continue;
    }

    // Step 2: try each token pattern in order:
    let matched = false;
    for (const { type, regex, getValue } of PATTERNS) {
      const m = regex.exec(remaining);
      if (!m) continue;   // this pattern didn't match — try the next

      const raw = m[0];   // the matched text (e.g., "G01", "X50.0")
      yield makeToken(type, raw, getValue(m), line, col);

      // Update line/column tracking:
      if (type === 'END_OF_BLOCK') {
        line++;
        col = 1;
      } else {
        col += raw.length;
      }
      pos    += raw.length;
      matched = true;
      break;   // stop trying patterns — we found a match
    }

    // Step 3: if no pattern matched, emit an ERROR token and advance by 1:
    if (!matched) {
      // DO NOT CRASH — emit an error token and move on:
      yield makeToken('ERROR', remaining[0], remaining[0], line, col);
      pos++;
      col++;
      // Why advance by 1? The unknown character was NOT a token — skip it.
      // Why not advance more? We don't know how long the invalid section is.
      // Advance by 1 means the NEXT character gets another chance to match a pattern.
    }
  }

  // Signal end of input:
  yield makeToken('EOF', '', null, line, col);
}
```

---

## Step 3 — Write Tests That Verify the Mechanism

Create `src/tokeniser.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { tokenise }              from './tokeniser';

// Helper: collect all tokens except EOF
function tokens(source: string) {
  return [...tokenise(source)].filter(t => t.type !== 'EOF');
}

describe('tokeniser', () => {

  describe('position advancement', () => {

    it('advances past each token correctly', () => {
      // 'G01 X5' has two tokens separated by a space
      const ts = tokens('G01 X5');
      expect(ts).toHaveLength(2);
      expect(ts[0].type).toBe('G_WORD');
      expect(ts[1].type).toBe('AXIS_WORD');
      // If pos did not advance correctly, we'd get extra tokens or duplicates
    });

    it('tracks line numbers across newlines', () => {
      const ts = tokens('G01\nG02');
      const g01 = ts.find(t => t.type === 'G_WORD' && t.value === 1);
      const g02 = ts.find(t => t.type === 'G_WORD' && t.value === 2);
      expect(g01?.line).toBe(1);
      expect(g02?.line).toBe(2);   // second token is on line 2
    });

  });

  describe('G-word tokenisation', () => {

    it('parses G01 as G_WORD with value 1', () => {
      const [t] = tokens('G01');
      expect(t.type).toBe('G_WORD');
      expect(t.value).toBe(1);
      expect(t.raw).toBe('G01');   // raw preserves original text
    });

    it('parses lowercase g01 the same as G01', () => {
      const [t] = tokens('g01');
      expect(t.type).toBe('G_WORD');
      expect(t.value).toBe(1);
    });

    it('parses fractional G codes like G28.1', () => {
      const [t] = tokens('G28.1');
      expect(t.type).toBe('G_WORD');
      expect(t.value).toBeCloseTo(28.1);
    });

  });

  describe('axis word tokenisation', () => {

    it('parses X50.0 as AXIS_WORD with axis X and value 50.0', () => {
      const [t] = tokens('X50.0');
      expect(t.type).toBe('AXIS_WORD');
      const v = t.value as { axis: string; value: number };
      expect(v.axis).toBe('X');
      expect(v.value).toBeCloseTo(50.0);
    });

    it('parses negative axis values like Y-25.5', () => {
      const [t] = tokens('Y-25.5');
      const v = t.value as { axis: string; value: number };
      expect(v.value).toBeCloseTo(-25.5);
    });

    it('uppercases the axis letter for I and J', () => {
      const ts = tokens('i5 j0');
      const i = ts[0].value as { axis: string; value: number };
      expect(i.axis).toBe('I');   // uppercased
    });

  });

  describe('error recovery', () => {

    it('emits ERROR for unknown characters without crashing', () => {
      const ts = tokens('@');
      expect(ts[0].type).toBe('ERROR');
      expect(ts[0].raw).toBe('@');
    });

    it('continues tokenising after an error token', () => {
      // ERROR for @, then valid G_WORD:
      const ts = tokens('@G01');
      expect(ts[0].type).toBe('ERROR');
      expect(ts[1].type).toBe('G_WORD');
      // The tokeniser did NOT get stuck — it emitted the error and continued
    });

    it('advances by exactly 1 on error — does not skip valid tokens', () => {
      // @ at position 0, G01 at position 1 — the G should still be tokenised
      const ts = tokens('@G01 X5');
      expect(ts.filter(t => t.type === 'G_WORD')).toHaveLength(1);
      expect(ts.filter(t => t.type === 'AXIS_WORD')).toHaveLength(1);
    });

  });

  describe('full line tokenisation', () => {

    it('tokenises a complete linear move block', () => {
      const ts = tokens('G01 X50.0 Y25.0 F400\n');
      expect(ts[0]).toMatchObject({ type: 'G_WORD',    value: 1   });
      expect(ts[1]).toMatchObject({ type: 'AXIS_WORD' });    // X50.0
      expect(ts[2]).toMatchObject({ type: 'AXIS_WORD' });    // Y25.0
      expect(ts[3]).toMatchObject({ type: 'F_WORD',    value: 400 });
      expect(ts[4]).toMatchObject({ type: 'END_OF_BLOCK'          });
    });

  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
Tests N passed (N)
```

**Change something:** Remove the `^` from one pattern's regex:

```ts
regex: /G(\d+\.?\d*)/,   // ← no ^ anchor
```

Add a test that shows the problem:

```ts
it('without ^ anchor a G-word inside a string would match', () => {
  // This would PASS (incorrectly) without ^ anchor:
  // With ^ anchor, 'AAAG01' has no match at pos=0 → only matches when G is first char
});
```

Watch what happens — the tokeniser might produce unexpected tokens because the pattern
matches G codes that are NOT at the current position. Restore the `^` anchor.

---

## 🎯 Challenge: Add `P_WORD` and `L_WORD`

**You know:** The PATTERNS array, regex anchors, value extraction.

**Task:** G-code has additional word types used in canned cycles:
- `P_WORD`: parameter number — `P1`, `P100`
- `L_WORD`: repeat count — `L3`, `L5`

Add both to the PATTERNS array. The regex pattern for `L_WORD` must be placed BEFORE
the `AXIS_WORD` pattern — why? (Hint: look at which letters AXIS_WORD already matches)

Write 2 tests before adding the patterns.

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

**Why before AXIS_WORD?** The AXIS_WORD pattern matches letters in `[XYZIJKRxyzijkr]`.
It does NOT match L or P. So the order doesn't technically matter for these. BUT it's
good practice to put more specific patterns before more general ones. If you ever added
a word type that uses a letter already in AXIS_WORD, ordering would matter.

**Key insight:** The PATTERNS array is tried in order — first match wins. This means
you must put more specific (longer, more constrained) patterns before general ones.
The comment patterns must be first because `;` might otherwise be an ERROR token
if tested against patterns that don't match it.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `^` anchor prevents wrong-position matches | Remove `^`, run tests — some may fail |
| `pos += raw.length` advances correctly | tokenise 'G01 X5' → 2 tokens, not 1 |
| Error recovery advances by 1 | '@G01' → ERROR token, then G_WORD |
| Generator is lazy | Add `console.log` inside yield — see it runs per-call, not all at once |

---

## Quick Check Answers

**1. After matching `G01` at pos=0, source.slice(pos) returns?**

After the match, `pos += 3` (length of "G01"). `source.slice(3)` on `"G01 X5"` returns
`" X5"` — the space and the remaining X5. The tokeniser then sees the space, matches
`WHITESPACE_REGEX`, advances past it, and pos is now at 4. `source.slice(4)` = `"X5"`.

**2. ERROR('@') emitted, advance by 1. Does the next `G` get tokenised?**

Yes. After emitting ERROR, pos advances by 1 — now pointing at `G`. The main loop
iterates again, `source.slice(pos)` starts with `G`. The G_WORD pattern `/^[Gg](\d+)/`
matches `G01`. A G_WORD token is emitted. The tokeniser recovered from the error.

**3. Parser asks for 5 tokens then stops. Were all remaining tokens computed?**

No. A generator only executes up to the next `yield` for each `next()` call. If the
parser stops after 5 tokens, the generator is paused after the 5th `yield` — the code
after that yield never runs. This is why generators are efficient for large files: only
the tokens the parser needs are computed.
