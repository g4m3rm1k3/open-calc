# SE Masterclass — LAB-80 — Tokenization

**Prerequisites:** LAB-79 (Pathfinding Visualizer) — all of Phase 6

## Quick Check

Before starting, answer these (answers at the bottom):

1. What's the difference between a character and a token?
2. Why does a lexer need a "sliding window" instead of processing one character at a time in total isolation?
3. Why does `let x = 12` need to become 4 tokens instead of being handled as one 9-character string?

## What You Will Build

A lexer for **Nano** — a small language this entire phase builds around — turning source text into a flat token stream.

```
Source:  let total = 12 + count;

Tokens:
  LET          "let"
  IDENTIFIER   "total"
  EQUALS       "="
  NUMBER       12
  PLUS         "+"
  IDENTIFIER   "count"
  SEMICOLON    ";"
  EOF
```

## Concept: Tokenization

**What it is:** Tokenization (lexing) is the first stage of every language pipeline — the process of scanning raw source text, character by character, and grouping those characters into meaningful chunks called **tokens**: keywords, identifiers, numbers, operators, punctuation.

**The problem before:** LAB-10 (Phase 1) built exactly this — a lexer for arithmetic expressions. This lab revisits the same problem deliberately, because Phase 7 is where this curriculum goes deep on language tooling, and every tool in this module (parser, interpreter, compiler, linter, formatter) starts from tokens. Nano needs more than LAB-10's four-operator lexer: keywords (`let`, `if`, `else`, `while`, `function`, `return`, `true`, `false`), string literals, comments, and multi-character operators (`==`, `!=`, `<=`, `>=`) that a naive one-character-at-a-time scan would misclassify.

**The solution:** Scan the source with a cursor (an index into the string) that advances as it consumes characters, classifying each run of characters into exactly one token before moving on. A **sliding window** — looking at the current character and peeking ahead one or two more — is what lets the lexer tell `=` (assignment) apart from `==` (equality) without backtracking.

**Canonical example:**

```typescript
function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  while (pos < source.length) {
    const { token, nextPos } = scanOne(source, pos)
    if (token) tokens.push(token)
    pos = nextPos
  }
  tokens.push({ type: "EOF", value: "" })
  return tokens
}
```

**Project Application:** Every remaining lab in Phase 7 — the AST (LAB-81), the recursive descent parser (LAB-82), the interpreter (LAB-83), the bytecode VM (LAB-84), and all seven mini-projects (LAB-85–91) — consumes this exact token stream or a close variant of it.

**Watch for:** Classifying `==` as two separate `EQUALS` tokens instead of one `EQUALS_EQUALS` token. Without peeking ahead one character before committing to a token, `x == y` silently parses as `x = = y`, which is nonsense to any parser built on top.

## Step 1: Token types and the Token shape

```typescript
type TokenType =
  | "LET" | "IF" | "ELSE" | "WHILE" | "FUNCTION" | "RETURN" | "TRUE" | "FALSE"
  | "IDENTIFIER" | "NUMBER" | "STRING"
  | "PLUS" | "MINUS" | "STAR" | "SLASH"
  | "EQUALS" | "EQUALS_EQUALS" | "BANG_EQUALS" | "LESS" | "LESS_EQUALS" | "GREATER" | "GREATER_EQUALS"
  | "LPAREN" | "RPAREN" | "LBRACE" | "RBRACE" | "COMMA" | "SEMICOLON"
  | "EOF"

interface Token {
  type: TokenType
  value: string
  line: number
}

const KEYWORDS: Record<string, TokenType> = {
  let: "LET", if: "IF", else: "ELSE", while: "WHILE",
  function: "FUNCTION", return: "RETURN", true: "TRUE", false: "FALSE",
}
```

Keywords (`let`, `if`, ...) are handled as a lookup table against text that was *already* classified as a plain identifier — the scanner doesn't need special-case logic for each keyword; it just checks whether the identifier it found happens to be a reserved word. `line` is tracked from the start so later tools (LAB-88's linter, LAB-90's static analyzer) can report errors at a real source location instead of "somewhere in this file."

### SAVE AND TRY

Look at `KEYWORDS["let"]` and `KEYWORDS["letter"]` (undefined) — this table only matches whole-word keywords, not prefixes, which matters once Step 3 builds identifier scanning: `letter` must tokenize as one `IDENTIFIER`, not `LET` followed by leftover `ter`.

## Step 2: The cursor and character classification

```typescript
class Lexer {
  private pos = 0
  private line = 1
  private tokens: Token[] = []

  constructor(private source: string) {}

  private peek(offset = 0): string {
    return this.source[this.pos + offset] ?? "\0"
  }

  private advance(): string {
    const ch = this.source[this.pos]
    this.pos++
    if (ch === "\n") this.line++
    return ch
  }

  private isDigit(ch: string): boolean { return ch >= "0" && ch <= "9" }
  private isAlpha(ch: string): boolean { return /[a-zA-Z_]/.test(ch) }
  private isAlphaNumeric(ch: string): boolean { return this.isAlpha(ch) || this.isDigit(ch) }
}
```

`peek(offset)` looks ahead without consuming — the sliding window the concept section named. `advance()` is the only method that actually moves the cursor forward, so every character is consumed exactly once, in exactly one place, making it easy to reason about where `pos` stands at any point in the scan.

### SAVE AND TRY

Trace `peek(0)` and `peek(1)` by hand on the string `"=="` at `pos = 0`: `peek(0)` returns `"="`, `peek(1)` also returns `"="` — this is precisely the lookahead that will let Step 4 distinguish `=` from `==` before deciding which token to emit.

## Step 3: Scanning identifiers, numbers, and strings

```typescript
class Lexer {
  // ...continued from Step 2...

  private scanIdentifier(): Token {
    const start = this.pos
    while (this.isAlphaNumeric(this.peek())) this.advance()
    const text = this.source.slice(start, this.pos)
    const type = KEYWORDS[text] ?? "IDENTIFIER"
    return { type, value: text, line: this.line }
  }

  private scanNumber(): Token {
    const start = this.pos
    while (this.isDigit(this.peek())) this.advance()
    if (this.peek() === "." && this.isDigit(this.peek(1))) {
      this.advance() // consume the '.'
      while (this.isDigit(this.peek())) this.advance()
    }
    return { type: "NUMBER", value: this.source.slice(start, this.pos), line: this.line }
  }

  private scanString(): Token {
    this.advance() // consume opening quote
    const start = this.pos
    while (this.peek() !== '"' && this.peek() !== "\0") this.advance()
    const text = this.source.slice(start, this.pos)
    this.advance() // consume closing quote
    return { type: "STRING", value: text, line: this.line }
  }
}
```

Each `scanX` method follows the same shape: mark `start`, advance past everything that belongs to this token, slice the source between `start` and the new `pos`. `scanNumber`'s `.` check peeks *two* characters ahead (`peek(1)` must be a digit) so `12.toString` (a number followed by a method-call-looking dot) doesn't wrongly consume the `.` as a decimal point when there's no digit after it — not a case Nano needs, but the discipline of checking before committing matters here.

### SAVE AND TRY

```typescript
const lexer = new Lexer("count")
console.log((lexer as any).scanIdentifier())
// { type: "IDENTIFIER", value: "count", line: 1 }

const numLexer = new Lexer("3.14")
console.log((numLexer as any).scanNumber())
// { type: "NUMBER", value: "3.14", line: 1 }
```

## Step 4: The main dispatch loop, with multi-character operators

```typescript
class Lexer {
  // ...continued from Step 3...

  tokenize(): Token[] {
    while (this.pos < this.source.length) {
      const ch = this.peek()

      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") { this.advance(); continue }
      if (ch === "/" && this.peek(1) === "/") { while (this.peek() !== "\n" && this.peek() !== "\0") this.advance(); continue }

      if (this.isDigit(ch)) { this.tokens.push(this.scanNumber()); continue }
      if (this.isAlpha(ch)) { this.tokens.push(this.scanIdentifier()); continue }
      if (ch === '"') { this.tokens.push(this.scanString()); continue }

      this.tokens.push(this.scanOperatorOrPunctuation())
    }
    this.tokens.push({ type: "EOF", value: "", line: this.line })
    return this.tokens
  }

  private scanOperatorOrPunctuation(): Token {
    const line = this.line
    const ch = this.advance()

    const twoCharMap: Record<string, TokenType> = {
      "==": "EQUALS_EQUALS", "!=": "BANG_EQUALS", "<=": "LESS_EQUALS", ">=": "GREATER_EQUALS",
    }
    const maybeTwoChar = ch + this.peek()
    if (twoCharMap[maybeTwoChar]) { this.advance(); return { type: twoCharMap[maybeTwoChar], value: maybeTwoChar, line } }

    const oneCharMap: Record<string, TokenType> = {
      "+": "PLUS", "-": "MINUS", "*": "STAR", "/": "SLASH", "=": "EQUALS",
      "<": "LESS", ">": "GREATER", "(": "LPAREN", ")": "RPAREN",
      "{": "LBRACE", "}": "RBRACE", ",": "COMMA", ";": "SEMICOLON",
    }
    if (oneCharMap[ch]) return { type: oneCharMap[ch], value: ch, line }

    throw new Error(`Unexpected character '${ch}' at line ${line}`)
  }
}
```

`scanOperatorOrPunctuation` always checks the two-character map *before* falling back to the one-character map — exactly the "peek before committing" discipline from Step 2, applied to operators instead of numbers. Comments (`//`) are consumed and discarded entirely, never becoming a token — the parser in LAB-82 will never even know comments existed in the source.

### SAVE AND TRY

```typescript
const tokens = new Lexer('let total = 12 + count; // running total').tokenize()
console.log(tokens.map(t => t.type))
// ["LET", "IDENTIFIER", "EQUALS", "NUMBER", "PLUS", "IDENTIFIER", "SEMICOLON", "EOF"]
```

The trailing comment produced zero tokens — confirming the dispatch loop's `continue` for `//` correctly skips it without emitting anything, and `EQUALS` (not `EQUALS_EQUALS`) confirms the single `=` was correctly told apart from `==`.

## 🎯 Challenge

Add support for `&&` and `||` (logical AND/OR) as two-character operators, plus `!` (logical NOT) as a one-character operator — extending both maps in `scanOperatorOrPunctuation` — and confirm `x != 5 && y == 3` tokenizes into exactly 7 tokens (not counting EOF): `x`, `!=`, `5`, `&&`, `y`, `==`, `3`.

<details>
<summary>Solution</summary>

```typescript
type TokenType = /* ...existing types... */ | "AND" | "OR" | "BANG"

private scanOperatorOrPunctuation(): Token {
  const line = this.line
  const ch = this.advance()

  const twoCharMap: Record<string, TokenType> = {
    "==": "EQUALS_EQUALS", "!=": "BANG_EQUALS", "<=": "LESS_EQUALS", ">=": "GREATER_EQUALS",
    "&&": "AND", "||": "OR",
  }
  const maybeTwoChar = ch + this.peek()
  if (twoCharMap[maybeTwoChar]) { this.advance(); return { type: twoCharMap[maybeTwoChar], value: maybeTwoChar, line } }

  const oneCharMap: Record<string, TokenType> = {
    "+": "PLUS", "-": "MINUS", "*": "STAR", "/": "SLASH", "=": "EQUALS", "!": "BANG",
    "<": "LESS", ">": "GREATER", "(": "LPAREN", ")": "RPAREN",
    "{": "LBRACE", "}": "RBRACE", ",": "COMMA", ";": "SEMICOLON",
  }
  if (oneCharMap[ch]) return { type: oneCharMap[ch], value: ch, line }

  throw new Error(`Unexpected character '${ch}' at line ${line}`)
}
```

`&&`/`||` slot into the existing `twoCharMap` pattern with no structural change; `!` only needed a one-character entry since Nano's `BANG_EQUALS` (`!=`) is already handled by the two-character check that runs first.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| `==` vs `=` | Emit `=` then `=` separately | Peek ahead, emit one `EQUALS_EQUALS` token |
| Keywords | Special-case `if len(word) == 2 && word == "if"` in the scanner | Scan as identifier, then look up in a keyword table |
| Comments | Emit a `COMMENT` token | Skip entirely — never becomes a token |
| Where `pos` moves | Anywhere convenient | Only inside `advance()`, one clear place |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why must `==` be checked before `=` in the operator scanner? | |
| 2 | Why are keywords looked up in a table instead of matched directly in the scanner? | |
| 3 | Why does `line` get tracked on every token? | |

## Quick Check Answers

1. A character is one letter/digit/symbol; a token is a classified, meaningful chunk (a whole number, a whole identifier, an operator) that the parser can reason about as a single unit.
2. Because deciding what a token *is* sometimes requires looking past the current character — e.g., `=` could be the start of `==`, and the scanner can't commit to `EQUALS` without checking the next character first.
3. Because parsing `let x = 12` one character at a time, with no grouping, would force the parser to re-derive "this is a keyword, this is a variable name, this is a value" from raw characters on every single downstream tool — tokens do that classification once, upfront, for everyone after.

*Next: [LAB-81 — Abstract Syntax Trees](LAB-81-ast.md)*
