# SE Masterclass — LAB-10 — Lexer

**Language: JavaScript (Node.js)** — same project as LAB-09.

**Prerequisites:** LAB-09 (Calculator). LAB-09's `trimmed.split(/\s+/)` is the crude, breakable version of what this lab replaces with a real character-by-character scanner.

**What this lab adds:**
- What a lexer (tokenizer) actually does: raw text in, a list of typed tokens out
- Character classification: digit, operator, whitespace, unknown
- The sliding-window scanning pattern — one shared shape behind every lexer ever written
- Handling multi-digit numbers and decimals, not just single characters
- Producing error messages with exact position, not just "something's wrong"

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-09's calculator required spaces between every number and operator (`"3 + 4"`, not `"3+4"`). Why did it need that?
> 2. `"42"` is two characters, `'4'` and `'2'`, but should become ONE token with the number `42`. What has to happen to combine them?
> 3. If the input is `"3 @ 4"`, what should the lexer do when it reaches `@`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Tokenizing "3 + 4" ===
[
  { type: 'NUMBER', value: '3', pos: 0 },
  { type: 'OPERATOR', value: '+', pos: 2 },
  { type: 'NUMBER', value: '4', pos: 4 },
  { type: 'EOF', value: '', pos: 5 }
]

=== Tokenizing "3+4*2" (no spaces!) ===
[
  { type: 'NUMBER', value: '3', pos: 0 },
  { type: 'OPERATOR', value: '+', pos: 1 },
  { type: 'NUMBER', value: '4', pos: 2 },
  { type: 'OPERATOR', value: '*', pos: 3 },
  { type: 'NUMBER', value: '2', pos: 4 },
  { type: 'EOF', value: '', pos: 5 }
]

=== Tokenizing "42 + 100" (multi-digit numbers) ===
[
  { type: 'NUMBER', value: '42', pos: 0 },
  { type: 'OPERATOR', value: '+', pos: 3 },
  { type: 'NUMBER', value: '100', pos: 5 },
  { type: 'EOF', value: '', pos: 8 }
]

=== Tokenizing "3.14 * 2.5" (decimals) ===
[
  { type: 'NUMBER', value: '3.14', pos: 0 },
  { type: 'OPERATOR', value: '*', pos: 5 },
  { type: 'NUMBER', value: '2.5', pos: 7 },
  { type: 'EOF', value: '', pos: 10 }
]

=== Tokenizing "(3 + 4) * 2" (parentheses) ===
[
  { type: 'LPAREN', value: '(', pos: 0 },
  { type: 'NUMBER', value: '3', pos: 1 },
  { type: 'OPERATOR', value: '+', pos: 3 },
  { type: 'NUMBER', value: '4', pos: 5 },
  { type: 'RPAREN', value: ')', pos: 6 },
  { type: 'OPERATOR', value: '*', pos: 8 },
  { type: 'NUMBER', value: '2', pos: 10 },
  { type: 'EOF', value: '', pos: 11 }
]

=== Error: Unknown Character ===
tokenize("3 @ 4") threw: Unexpected character "@" at position 2
```

---

### Concept: What a Lexer Does

**What it is:** A **lexer** (also called a **tokenizer** or **scanner**) converts a raw string of characters into a list of **tokens** — small, typed chunks like "this is a NUMBER," "this is an OPERATOR." It is the FIRST stage of every language-processing pipeline: compilers, interpreters, and even things like CSS parsers or JSON.parse all start here.

**The problem before:** LAB-09's `"3 + 4".split(/\s+/)` only works because every piece happens to be separated by whitespace. `"3+4"` (no spaces — perfectly valid math) produces ONE token, `"3+4"`, not three. `split()` cannot tell where a number ends and an operator begins — it only knows where WHITESPACE is.

**The solution:** Scan the string one character at a time. Classify each character (is it a digit? an operator symbol? whitespace?). GROUP consecutive characters of the same kind into a single token (`"4"` followed by `"2"` becomes one `NUMBER` token, `"42"`, not two separate digit tokens).

**Canonical example (General Explanation):**

Think of reading a sentence letter by letter to find word boundaries, without relying on someone having already inserted spaces for you. You'd look at each character: is it a letter (keep building the current word) or a space (the word just ended, start looking for the next one)? A lexer does exactly this, but for a programming/math language instead of English words.

```js
// The core loop shape every lexer shares:
let pos = 0
while (pos < input.length) {
  const char = input[pos]
  // classify char, consume one or more characters, produce one token, advance pos
}
```

**Project Application (The "Why" here):**

The tokens this lab produces — `{ type: 'NUMBER', value: '3', pos: 0 }` — are exactly what LAB-11's Parser will consume instead of raw characters. The Parser never looks at individual characters again; it only ever sees the clean, typed list this lexer produces. This is decomposition (LAB-09's Concept) applied to language processing: one stage, one job.

**Watch for:** A lexer's job is to identify WHAT KIND of thing each piece is (its type), not to understand what the numbers and operators MEAN together. The lexer for `"3+4*2"` has no idea that `*` binds tighter than `+` — it just reports "here is a NUMBER, here is an OPERATOR, here is a NUMBER..." in order. Meaning comes later, in the Parser.

---

## Step 1 — Character Classification

```js
// lexer.js

function isDigit(char) {
  return char >= '0' && char <= '9'          // ← add: character comparison — '0' through '9' in ASCII order
}

function isWhitespace(char) {
  return char === ' ' || char === '\t' || char === '\n'   // ← add
}

function isOperator(char) {
  return '+-*/%^'.includes(char)              // ← add: any character in this string counts as an operator
}

module.exports = { isDigit, isWhitespace, isOperator }
```

```js
// main.js
const { isDigit, isWhitespace, isOperator } = require('./lexer')

console.log(isDigit('5'), isDigit('a'))        // true false
console.log(isOperator('+'), isOperator('5'))  // true false
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
true false
true false
```

**In the terminal:**

```bash
node -e "console.log('9' >= '0' && '9' <= '9')"
```

**Expected:** `true` — confirms character comparison works the way `isDigit` relies on. JavaScript compares strings character-by-character using their underlying character codes, so `'0' <= char <= '9'` correctly identifies digit characters.

**Change something:** Test `isDigit('/')`. Should be `false` — `/` sits just before `'0'` in character-code order, so this comparison correctly excludes it. This is why the comparison-based check works: it relies on digits being CONSECUTIVE in character-code order.

---

### Concept: The Sliding-Window Scanning Pattern

**What it is:** Every lexer follows the same shape: a position pointer (`pos`) starts at 0, and a loop repeatedly looks at the character AT `pos`, decides what to do based on its type, CONSUMES one or more characters (advancing `pos`), and produces zero or one tokens — until `pos` reaches the end of the input.

**The problem before:** A single-character token (like `+`) is easy — look at one character, produce one token, move `pos` forward by 1. But a multi-character token (like the number `42`) requires READING AHEAD — you don't know the number is finished until you hit a character that ISN'T a digit.

**The solution:** When you see the START of a multi-character token (the first digit), keep consuming characters in an inner loop AS LONG AS they continue to match (still a digit), THEN produce one token for the whole span, and let the outer loop continue from wherever the inner loop stopped.

**Canonical example (General Explanation):**

Think of reading a odometer scrolling past — you don't report each individual digit as it passes; you wait until the numbers stop changing (a non-digit boundary appears), then report the whole reading as one number. The "window" is the span of characters you're currently grouped into; it "slides" forward as you consume more.

```js
let pos = 0
const tokens = []

while (pos < input.length) {
  const char = input[pos]

  if (isDigit(char)) {
    let start = pos
    while (pos < input.length && isDigit(input[pos])) {
      pos++                              // keep consuming digits — the "window" grows
    }
    tokens.push({ type: 'NUMBER', value: input.slice(start, pos) })
    continue                              // pos already advanced past the whole number — don't advance again
  }

  // ... other cases
}
```

**What it hides (Law 7):** The caller of the lexer never has to think about WHERE one token ends and the next begins within the raw string — that boundary-finding work is fully contained inside the scanning loop. The output is just a clean list.

**Where you will see this again:** LAB-80 (Tokenization) generalizes this exact pattern to a real programming language's syntax — identifiers, string literals, comments — all using the identical "consume while it matches, then emit one token" shape.

---

## Step 2 — Single-Character Tokens

```js
function tokenize(input) {
  const tokens = []
  let pos = 0                                    // ← add: the sliding position pointer

  while (pos < input.length) {
    const char = input[pos]

    if (isWhitespace(char)) {                     // ← add: skip whitespace — produces NO token
      pos++
      continue
    }

    if (isOperator(char)) {                       // ← add: single-character token
      tokens.push({ type: 'OPERATOR', value: char, pos })
      pos++
      continue
    }

    if (char === '(') {                           // ← add
      tokens.push({ type: 'LPAREN', value: '(', pos })
      pos++
      continue
    }

    if (char === ')') {                           // ← add
      tokens.push({ type: 'RPAREN', value: ')', pos })
      pos++
      continue
    }

    throw new Error(`Unexpected character "${char}" at position ${pos}`)   // ← add: nothing matched — fail clearly
  }

  tokens.push({ type: 'EOF', value: '', pos })    // ← add: a sentinel token marking "no more input"
  return tokens
}

module.exports = { isDigit, isWhitespace, isOperator, tokenize }
```

Add to `main.js`:

```js
console.log('=== Tokenizing "3 + 4" ===')
console.log(tokenize('3 + 4'))
```

Wait — this won't produce `NUMBER` tokens yet, since digits aren't handled. That's the next step. For now:

### SAVE AND TRY

Temporarily test just the operator/paren handling with `tokenize('+ ( )')`:

```bash
node -e "const {tokenize} = require('./lexer'); console.log(tokenize('+ ( )'))"
```

**Expected:**
```
[
  { type: 'OPERATOR', value: '+', pos: 0 },
  { type: 'LPAREN', value: '(', pos: 2 },
  { type: 'RPAREN', value: ')', pos: 4 },
  { type: 'EOF', value: '', pos: 5 }
]
```

**Confirm the EOF sentinel:** Every call to `tokenize`, regardless of input, ends with one `EOF` token. LAB-11's Parser will use this to know "stop, there's nothing left to read" without needing to separately track the token list's length.

---

## Step 3 — Multi-Digit Numbers and Decimals

```js
function tokenize(input) {
  const tokens = []
  let pos = 0

  while (pos < input.length) {
    const char = input[pos]

    if (isWhitespace(char)) {
      pos++
      continue
    }

    if (isDigit(char)) {                              // ← add: NEW case — the sliding window in action
      const start = pos
      while (pos < input.length && isDigit(input[pos])) {
        pos++                                          // ← add: consume every consecutive digit
      }
      if (input[pos] === '.' && isDigit(input[pos + 1])) {   // ← add: an optional decimal point, only if followed by a digit
        pos++                                          // consume the '.'
        while (pos < input.length && isDigit(input[pos])) {
          pos++                                        // consume digits after the decimal point
        }
      }
      tokens.push({ type: 'NUMBER', value: input.slice(start, pos), pos: start })
      continue                                          // pos is already past the number — do not fall through
    }

    if (isOperator(char)) {
      tokens.push({ type: 'OPERATOR', value: char, pos })
      pos++
      continue
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(', pos })
      pos++
      continue
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')', pos })
      pos++
      continue
    }

    throw new Error(`Unexpected character "${char}" at position ${pos}`)
  }

  tokens.push({ type: 'EOF', value: '', pos })
  return tokens
}
```

### SAVE AND TRY

```bash
node main.js
```

**Expected (uncomment/add each block progressively):**
```
=== Tokenizing "3 + 4" ===
[
  { type: 'NUMBER', value: '3', pos: 0 },
  { type: 'OPERATOR', value: '+', pos: 2 },
  { type: 'NUMBER', value: '4', pos: 4 },
  { type: 'EOF', value: '', pos: 5 }
]
```

Add to `main.js`:

```js
console.log('\n=== Tokenizing "3+4*2" (no spaces!) ===')
console.log(tokenize('3+4*2'))

console.log('\n=== Tokenizing "42 + 100" (multi-digit numbers) ===')
console.log(tokenize('42 + 100'))

console.log('\n=== Tokenizing "3.14 * 2.5" (decimals) ===')
console.log(tokenize('3.14 * 2.5'))
```

**Expected additions:**
```
=== Tokenizing "3+4*2" (no spaces!) ===
[
  { type: 'NUMBER', value: '3', pos: 0 },
  { type: 'OPERATOR', value: '+', pos: 1 },
  { type: 'NUMBER', value: '4', pos: 2 },
  { type: 'OPERATOR', value: '*', pos: 3 },
  { type: 'NUMBER', value: '2', pos: 4 },
  { type: 'EOF', value: '', pos: 5 }
]

=== Tokenizing "42 + 100" (multi-digit numbers) ===
[
  { type: 'NUMBER', value: '42', pos: 0 },
  { type: 'OPERATOR', value: '+', pos: 3 },
  { type: 'NUMBER', value: '100', pos: 5 },
  { type: 'EOF', value: '', pos: 8 }
]

=== Tokenizing "3.14 * 2.5" (decimals) ===
[
  { type: 'NUMBER', value: '3.14', pos: 0 },
  { type: 'OPERATOR', value: '*', pos: 5 },
  { type: 'NUMBER', value: '2.5', pos: 7 },
  { type: 'EOF', value: '', pos: 10 }
]
```

**This directly solves LAB-09's limitation:** `"3+4*2"` (zero spaces) now tokenizes correctly into 5 real tokens, not one unsplittable blob — the exact case `split(/\s+/)` could never handle.

**Trace `"3.14"` by hand:** `pos=0`, `char='3'`, digit — inner loop consumes `3` (pos→1), then `'.'` (pos→1) sees `.` followed by `1` (a digit) — consumes `.` (pos→2), inner loop consumes `1` (pos→3) and `4` (pos→4). `input.slice(0, 4)` = `"3.14"`. One token, four characters, correctly grouped.

**Change something:** Tokenize `"3."` (a trailing dot with no digit after it). Trace through the code: `isDigit(input[pos+1])` checks the character AFTER the dot — for `"3."`, `input[pos+1]` is `undefined` (past the end of the string), so `isDigit(undefined)` is `false`, and the `.` is NOT consumed as part of the number. The lexer will then hit `.` as an unrecognized character on the NEXT loop iteration and throw. This is correct behavior — `"3."` isn't a valid number in this lexer's rules.

---

## Step 4 — Parentheses (Already Working) and Full Coverage

Add to `main.js`:

```js
console.log('\n=== Tokenizing "(3 + 4) * 2" (parentheses) ===')
console.log(tokenize('(3 + 4) * 2'))
```

### SAVE AND TRY

**Expected:**
```
=== Tokenizing "(3 + 4) * 2" (parentheses) ===
[
  { type: 'LPAREN', value: '(', pos: 0 },
  { type: 'NUMBER', value: '3', pos: 1 },
  { type: 'OPERATOR', value: '+', pos: 3 },
  { type: 'NUMBER', value: '4', pos: 5 },
  { type: 'RPAREN', value: ')', pos: 6 },
  { type: 'OPERATOR', value: '*', pos: 8 },
  { type: 'NUMBER', value: '2', pos: 10 },
  { type: 'EOF', value: '', pos: 11 }
]
```

**This is new capability LAB-09 never had:** LAB-09's flat, left-to-right calculator had no way to represent "do this part first" — parentheses require a TREE structure to mean anything, which is exactly what LAB-11's Parser builds from this token list.

---

## 🎯 Challenge: Position-Accurate Error Messages

**You know:** Every token records the `pos` where it started. An unrecognized character should report exactly where it went wrong.

**Task:** Confirm (or fix) that `tokenize("3 @ 4")` throws an error that names BOTH the offending character AND its exact position — not just "invalid input somewhere."

**Starting code:** The `throw` at the bottom of the main loop already does this — trace through `"3 @ 4"` by hand: `pos=0` is `'3'` (NUMBER, consumes to pos=1), `pos=1` is `' '` (whitespace, pos=2), `pos=2` is `'@'` — none of the `if` branches match `'@'`, so execution falls through to the `throw`.

<details>
<summary>▶ Show Solution</summary>

The existing code already does this correctly, because the `throw` statement is positioned to run with `pos` still pointing at the offending character (nothing advanced `pos` past it before the throw):

```js
throw new Error(`Unexpected character "${char}" at position ${pos}`)
```

For `"3 @ 4"`: `pos = 2` when `char = '@'` is read (index 0 is `'3'`, index 1 is `' '`, index 2 is `'@'`). Output: `Unexpected character "@" at position 2`.

**Key insight:** Because `pos` is captured in a local `char = input[pos]` read BEFORE any consumption happens for that iteration, the error message always names the CORRECT position — even though `pos` is a single mutable variable being incremented throughout the function. This is only safe because nothing reassigns `pos` again between reading `char` and throwing.

</details>

Add to `main.js`:

```js
console.log('\n=== Error: Unknown Character ===')
try {
  tokenize('3 @ 4')
} catch (err) {
  console.log(`tokenize("3 @ 4") threw: ${err.message}`)
}
```

### SAVE AND TRY

**Expected:**
```
=== Error: Unknown Character ===
tokenize("3 @ 4") threw: Unexpected character "@" at position 2
```

**Change something:** Try `tokenize("5 & 3")`. Confirm the position (`4`) and character (`&`) in the error message both match by counting characters yourself: `5`(0)` `(1)`&`(2)... wait, count again — `&` is at index 2. Predict the exact message before running, then verify.

---

## Mental Model: Tokens Are the Contract Between Lexer and Parser

```
"3+4*2"                          (raw string — the lexer's INPUT)
   │
   ▼  tokenize()
[NUMBER(3), OPERATOR(+), NUMBER(4), OPERATOR(*), NUMBER(2), EOF]    (flat list — the lexer's OUTPUT)
   │
   ▼  parse()  ← LAB-11
        +
       / \
      3   *              (a TREE — the Parser's output, which finally captures precedence)
         / \
        4   2
```

The lexer's entire job ends the moment it produces that flat token list. It has ZERO opinion about precedence, grouping, or meaning — it only reports "here is what kind of thing appears, in what order." Every question about MEANING is deferred to LAB-11.

**Where you will see this again:**
- LAB-80 (Tokenization) — the same character-classification and sliding-window pattern, generalized to a full toy language with identifiers and keywords
- LAB-85 (Template Engine) — tokenizing `{{ variable }}` syntax out of template text
- LAB-88 (Linter) and LAB-89 (Formatter) — both start by re-tokenizing source code

---

## Final Check

| Feature | How to verify |
|---|---|
| `"3 + 4"` and `"3+4"` produce the same token TYPES in the same order | Compare both outputs |
| Multi-digit numbers (`"42"`, `"100"`) become ONE token each, not multiple | Step 3 output |
| Decimals (`"3.14"`) tokenize as one NUMBER token | Step 3 output |
| Parentheses produce distinct `LPAREN`/`RPAREN` token types | Step 4 output |
| Every token list ends with exactly one `EOF` token | Every example in this lab |
| Unknown characters throw an error naming both the character and its position | Challenge |
| You can explain, without notes, why `split(/\s+/)` cannot handle `"3+4"` | LAB-09 vs LAB-10, directly |

---

## Quick Check Answers

**1. Why did LAB-09's calculator need spaces between every number and operator?**

Because it used `str.split(/\s+/)` to break the string into pieces — that function only knows how to split on WHITESPACE. It has no concept of "a digit is different from an operator character." Without a space, `"3+4"` is one unbroken chunk of non-whitespace characters and `split` returns it as a single string, `"3+4"`, which then fails to parse as a number. A real lexer classifies characters directly, so it correctly separates `3`, `+`, and `4` into three tokens with no whitespace required at all.

**2. `"42"` is two characters that should become one token. What has to happen?**

The lexer needs to CONSUME (advance past) both characters before producing a single token — this is the sliding-window pattern from this lab's second Concept box: when the first digit is found, an inner loop keeps advancing `pos` as long as the NEXT character is also a digit, and only after that inner loop stops does the lexer emit one `NUMBER` token covering the whole span (`input.slice(start, pos)`).

**3. What should the lexer do at `@` in `"3 @ 4"`?**

Throw a clear, position-accurate error immediately — `@` doesn't match any of the recognized cases (not whitespace, not a digit, not an operator character, not a parenthesis), so it falls through every `if` in the scanning loop to the final `throw`, reporting exactly `Unexpected character "@" at position 2`. This is the boundary-validation habit from LAB-09 applied to a new boundary — the raw source text is untrusted input, and the lexer is the first line of defense against garbage ever reaching the Parser.

---

*Next: [LAB-11 — Parser](LAB-11-parser.md) — JavaScript, same project*
